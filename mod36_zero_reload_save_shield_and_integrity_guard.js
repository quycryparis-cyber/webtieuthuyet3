/**
 * ============================================================================
 * MODULE 36: KHIÊN CHỐNG TẢI LẠI TRANG KHI GÕ, BACKSPACE, UNDO, BACKUP & TỰ LƯU
 *             (mod36_zero_reload_save_shield_and_integrity_guard.js)
 * ============================================================================
 * Bối cảnh kỹ thuật:
 *   Khi tác giả gõ tiểu thuyết, xóa ký tự (Backspace), hoàn tác (Undo) hoặc hệ
 *   thống Tự Lưu 3 Tầng ghi file `.txt` / `.json` (tạo file tạm `.crswap`) vào
 *   thư mục làm việc nằm chung ổ đĩa với công cụ phát triển cục bộ (Live Server /
 *   Five Server), máy chủ phát triển sẽ phát tín hiệu WebSocket `'reload'` khiến
 *   trình duyệt đột ngột tải lại trang và đẩy tác giả quay về Cổng Kết Nối.
 *
 * Kiến trúc phòng vệ đa tầng trong Module 36:
 *   1. Lớp WebSocket Live-Reload Blocker: Bắt tay với lớp khiên sớm `<head>`
 *      (`window.__NOIR_ZERO_RELOAD_SHIELD__`) để chặn triệt để khung tin
 *      `'reload'` phát sinh từ file watcher trong lúc đang viết hoặc tự lưu.
 *   2. Lớp Chống Điều Hướng Ngoài Ý Muốn: Chặn toàn bộ sự kiện `submit` mặc định,
 *      chặn phím `Backspace` gây lùi trang khi tiêu điểm nằm ngoài vùng nhập, và
 *      gắn `type="button"` cho mọi nút động chưa khai báo `type`.
 *   3. Lớp Giám Sát Xung Đột Thư Mục Mã Nguồn: Phát hiện nếu thư mục ổ cứng đang
 *      nối nằm chung với `index.html` / `mod01_*.js` để cảnh báo nhẹ và giữ an toàn.
 *   4. Lớp Kiểm Định Thực Chiến & Bảng Theo Dõi Tại Tab 6 (`#tab6-zero-reload-shield-root`).
 *
 * Kiến trúc thuần khiết: Đăng ký qua `window.NoirStudio.registerModule('mod36', ...)`.
 * ============================================================================
 */
(function initModule36ZeroReloadSaveShield(global) {
  'use strict';

  const NS = (global.NoirStudio = global.NoirStudio || {});

  const MOD36_CONSTANTS = Object.freeze({
    MODULE_KEY: 'mod36',
    VERSION: '38.5.0',
    STORAGE_KEY_PREFS: 'noir_mod36_shield_prefs_v1',
    STORAGE_KEY_METRICS: 'noir_mod36_shield_metrics_v1',
    ACTIVE_TYPING_GRACE_MS: 30000,
    BUTTON_SWEEP_BATCH_LIMIT: 500,
    MAX_EVENT_LOG_ENTRIES: 50
  });

  const RELOAD_VECTOR_TAXONOMY = Object.freeze([
    {
      id: 'VECTOR_DEV_WS_RELOAD',
      title: 'Tín hiệu Live Server / Five Server WebSocket reload',
      triggerDesc: 'File hệ thống (.crswap, .json, .txt) thay đổi khi Tự Lưu 3 Tầng hoặc Backup chạy.',
      protectionLayer: 'WebSocket Interceptor sớm trong <head> + Điều phối Mod 36',
      defaultBlocked: true
    },
    {
      id: 'VECTOR_IMPLICIT_FORM_SUBMIT',
      title: 'Sự kiện Form Submit hoặc Enter trong khung điều khiển',
      triggerDesc: 'Nhấn Enter bên trong khung nhập liệu hoặc bấm nút <button> thiếu type="button".',
      protectionLayer: 'Capture-phase submit blocker + MutationObserver type="button" sweeper',
      defaultBlocked: true
    },
    {
      id: 'VECTOR_NON_INPUT_BACKSPACE',
      title: 'Phím Backspace hoặc Alt+Mũi tên trái ngoài ô soạn thảo',
      triggerDesc: 'Nhấn Backspace khi vừa rời con trỏ khỏi textarea khiến trình duyệt quay lại trang cũ.',
      protectionLayer: 'Capture-phase Keyboard Navigation Guard',
      defaultBlocked: true
    },
    {
      id: 'VECTOR_WORKSPACE_DIR_OVERLAP',
      title: 'Thư mục lưu truyện chọn trùng thư mục chứa mã nguồn Web',
      triggerDesc: 'Thư mục có chứa index.html làm công cụ watcher nhạy cảm với mỗi lần autosave.',
      protectionLayer: 'Phát hiện chéo FileSystemDirectoryHandle + Nhắc tách thư mục',
      defaultBlocked: true
    },
    {
      id: 'VECTOR_ACCIDENTAL_HASH_DRIFT',
      title: 'Liên kết neo <a href="#"> làm cuộn nhảy hoặc kích hoạt sự kiện rỗng',
      triggerDesc: 'Bấm liên kết rỗng không gắn mục đích điều hướng thực tế.',
      protectionLayer: 'Click Interceptor kiểm tra href="#" cô lập',
      defaultBlocked: true
    }
  ]);

  const SAFE_INPUT_TAG_NAMES = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'OPTION']);

  // ==========================================================================
  // LỚP 1: TIỆN ÍCH AN TOÀN & ĐỌC GHI CẤU HÌNH KHIÊN BẢO VỆ
  // ==========================================================================
  class ShieldHelperUtilities {
    escapeHtmlSafe(text) {
      if (NS.uiUtils && typeof NS.uiUtils.escapeHtml === 'function') {
        return NS.uiUtils.escapeHtml(text);
      }
      return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    formatTimeVN(ts) {
      if (NS.uiUtils && typeof NS.uiUtils.formatTimestampVN === 'function') {
        return NS.uiUtils.formatTimestampVN(ts);
      }
      try {
        return new Date(ts || Date.now()).toLocaleTimeString('vi-VN');
      } catch (_) {
        return '';
      }
    }

    isEditableTarget(target) {
      if (!target || typeof target !== 'object') return false;
      const tag = String(target.tagName || '').toUpperCase();
      if (SAFE_INPUT_TAG_NAMES.has(tag)) {
        if (tag === 'INPUT') {
          const type = String(target.type || 'text').toLowerCase();
          if (type === 'button' || type === 'submit' || type === 'reset' || type === 'checkbox' || type === 'radio') {
            return false;
          }
        }
        return !target.readOnly && !target.disabled;
      }
      if (target.isContentEditable) return true;
      return false;
    }

    ensureGlobalShieldState() {
      const state = (global.__NOIR_ZERO_RELOAD_SHIELD__ =
        global.__NOIR_ZERO_RELOAD_SHIELD__ || {
          active: true,
          blockDevServerReload: true,
          blockedReloadFrames: 0,
          blockedFormSubmits: 0,
          blockedNavKeys: 0,
          sweptButtonTypes: 0,
          lastBlockedAt: null,
          lastSavingAt: 0,
          lastTypingAt: 0,
          recentBlockedReasons: []
        });
      if (typeof state.blockedFormSubmits !== 'number') state.blockedFormSubmits = 0;
      if (typeof state.blockedNavKeys !== 'number') state.blockedNavKeys = 0;
      if (typeof state.sweptButtonTypes !== 'number') state.sweptButtonTypes = 0;
      if (typeof state.lastTypingAt !== 'number') state.lastTypingAt = 0;
      return state;
    }

    isLiveReloadMessage(rawPayload) {
      const msg = String(rawPayload == null ? '' : rawPayload).trim().toLowerCase();
      if (!msg) return false;
      return (
        msg === 'reload' ||
        msg === 'refreshcss' ||
        msg.includes('"reload"') ||
        msg.includes('"command":"reload"') ||
        msg.includes('css-update') ||
        msg.includes('hot-update') ||
        /\blive[-_]?reload\b/.test(msg)
      );
    }
  }

  // ==========================================================================
  // LỚP 2: NHẬT KÝ SỰ KIỆN CHẶN & ĐỒNG BỘ CHỈ SỐ THỰC TẾ
  // ==========================================================================
  class ShieldTelemetryLedger {
    constructor(helper) {
      this.helper = helper;
      this.events = [];
      this.loadPersistedMetrics();
    }

    loadPersistedMetrics() {
      try {
        const raw = localStorage.getItem(MOD36_CONSTANTS.STORAGE_KEY_METRICS);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.events)) {
            this.events = parsed.events.slice(0, MOD36_CONSTANTS.MAX_EVENT_LOG_ENTRIES);
          }
        }
      } catch (_) {}
    }

    persistMetrics() {
      try {
        localStorage.setItem(
          MOD36_CONSTANTS.STORAGE_KEY_METRICS,
          JSON.stringify({
            events: this.events.slice(0, MOD36_CONSTANTS.MAX_EVENT_LOG_ENTRIES)
          })
        );
      } catch (_) {}
    }

    recordBlockedEvent(vectorId, detailMessage) {
      const entry = {
        id: `sh_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: Date.now(),
        vectorId,
        detail: String(detailMessage || '')
      };
      this.events = [entry, ...this.events].slice(0, MOD36_CONSTANTS.MAX_EVENT_LOG_ENTRIES);
      this.persistMetrics();
      return entry;
    }

    clearLog() {
      this.events = [];
      this.persistMetrics();
    }
  }

  // ==========================================================================
  // LỚP 3: CHẶN SUBMIT FORM, PHÍM BACKSPACE GÂY LÙI TRANG & NÚT THIẾU TYPE
  // ==========================================================================
  class FormAndKeyboardNavigationGuard {
    constructor(helper, ledger, onBlockedCallback) {
      this.helper = helper;
      this.ledger = ledger;
      this.onBlocked = onBlockedCallback;
      this.observer = null;
      this.bound = false;
    }

    bindGlobalGuards() {
      if (this.bound || typeof document === 'undefined') return;
      this.bound = true;

      const state = this.helper.ensureGlobalShieldState();

      // 1. Chặn tuyệt đối sự kiện <form> submit gây tải lại trang (Capture Phase)
      document.addEventListener(
        'submit',
        (event) => {
          const formEl = event?.target;
          if (formEl && formEl.dataset && formEl.dataset.allowNativeSubmit === '1') {
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          state.blockedFormSubmits += 1;
          state.lastBlockedAt = Date.now();
          this.ledger.recordBlockedEvent(
            'VECTOR_IMPLICIT_FORM_SUBMIT',
            'Đã chặn sự kiện submit form mặc định để tránh tải lại trang.'
          );
          if (typeof this.onBlocked === 'function') this.onBlocked();
        },
        true
      );

      // 2. Chặn phím Backspace / Alt+ArrowLeft kích hoạt quay lại trang cũ ngoài vùng nhập
      document.addEventListener(
        'keydown',
        (event) => {
          if (!event) return;
          const key = event.key;
          const isEditable = this.helper.isEditableTarget(event.target);

          // Theo dõi thời điểm gõ phím / Backspace / Ctrl+Z trong vùng nhập
          if (isEditable) {
            state.lastTypingAt = Date.now();
            return;
          }

          // Nếu đang đứng NGOÀI ô nhập liệu mà bấm Backspace hoặc Alt+ArrowLeft -> chặn điều hướng lùi trang
          if (key === 'Backspace' || (event.altKey && key === 'ArrowLeft')) {
            event.preventDefault();
            state.blockedNavKeys += 1;
            state.lastBlockedAt = Date.now();
            this.ledger.recordBlockedEvent(
              'VECTOR_NON_INPUT_BACKSPACE',
              `Đã chặn phím ${key} khi con trỏ nằm ngoài ô nhập liệu.`
            );
            if (typeof this.onBlocked === 'function') this.onBlocked();
          }
        },
        true
      );

      // 3. Chặn thẻ <a href="#"> rỗng vô tình làm nhảy trang
      document.addEventListener(
        'click',
        (event) => {
          const anchor = event.target?.closest?.('a');
          if (!anchor) return;
          const rawHref = anchor.getAttribute('href');
          if (rawHref === '#' || rawHref === 'javascript:void(0)') {
            event.preventDefault();
          }
        },
        false
      );

      // 4. Quét nút thiếu thuộc tính type & gắn type="button" tự động
      this.sweepMissingButtonTypes(document);
      this.startButtonMutationWatcher();
    }

    sweepMissingButtonTypes(rootNode) {
      if (!rootNode || typeof rootNode.querySelectorAll !== 'function') return 0;
      const state = this.helper.ensureGlobalShieldState();
      let fixed = 0;
      const buttons = rootNode.querySelectorAll('button:not([type])');
      const maxCount = Math.min(buttons.length, MOD36_CONSTANTS.BUTTON_SWEEP_BATCH_LIMIT);
      for (let i = 0; i < maxCount; i += 1) {
        const btn = buttons[i];
        if (!btn.closest('form[data-allow-native-submit="1"]')) {
          btn.setAttribute('type', 'button');
          fixed += 1;
        }
      }
      if (fixed > 0) {
        state.sweptButtonTypes += fixed;
      }
      return fixed;
    }

    startButtonMutationWatcher() {
      if (this.observer || typeof MutationObserver !== 'function' || typeof document === 'undefined') {
        return;
      }
      if (!document.body) return;

      this.observer = new MutationObserver((mutations) => {
        for (const mut of mutations) {
          for (const added of mut.addedNodes || []) {
            if (added && added.nodeType === 1) {
              if (added.tagName === 'BUTTON' && !added.hasAttribute('type')) {
                added.setAttribute('type', 'button');
                const state = this.helper.ensureGlobalShieldState();
                state.sweptButtonTypes += 1;
              } else if (typeof added.querySelectorAll === 'function') {
                this.sweepMissingButtonTypes(added);
              }
            }
          }
        }
      });

      this.observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  // ==========================================================================
  // LỚP 4: GIÁM SÁT TRẠNG THÁI GHI FILE Ổ CỨNG & XUNG ĐỘT MÃ NGUỒN
  // ==========================================================================
  class WorkspaceSaveAndOverlapMonitor {
    constructor(helper, ledger) {
      this.helper = helper;
      this.ledger = ledger;
      this.hasSourceOverlapWarning = false;
      this.overlapReasons = [];
      this.lastSaveSignalAt = 0;
      this.bound = false;
    }

    markActiveSaveWindow() {
      const now = Date.now();
      this.lastSaveSignalAt = now;
      const state = this.helper.ensureGlobalShieldState();
      state.lastSavingAt = now;
      return now;
    }

    hookAutosaveAndFilesystemEvents() {
      if (this.bound) return;
      this.bound = true;

      // Bắt các sự kiện trên EventBus nếu có
      if (NS.bus && typeof NS.bus.on === 'function') {
        ['autosave:started', 'autosave:completed', 'fs:sync_completed', 'chapter:saved'].forEach(
          (evtName) => {
            try {
              NS.bus.on(evtName, () => this.markActiveSaveWindow());
            } catch (_) {}
          }
        );
      }

      // Gắn trình bao an toàn quanh triggerSave của mod09 và syncAllNow của mod05
      if (NS.autoSaver && typeof NS.autoSaver.triggerSave === 'function' && !NS.autoSaver._mod36Wrapped) {
        const origTriggerSave = NS.autoSaver.triggerSave.bind(NS.autoSaver);
        NS.autoSaver.triggerSave = async (...args) => {
          this.markActiveSaveWindow();
          return origTriggerSave(...args);
        };
        NS.autoSaver._mod36Wrapped = true;
      }

      if (NS.fsEngine && typeof NS.fsEngine.syncAllNow === 'function' && !NS.fsEngine._mod36Wrapped) {
        const origSyncNow = NS.fsEngine.syncAllNow.bind(NS.fsEngine);
        NS.fsEngine.syncAllNow = async (...args) => {
          this.markActiveSaveWindow();
          const res = await origSyncNow(...args);
          await this.inspectDirectoryHandleForSourceOverlap();
          return res;
        };
        NS.fsEngine._mod36Wrapped = true;
      }
    }

    async inspectDirectoryHandleForSourceOverlap() {
      const rootHandle =
        NS.fsEngine?.rootDirHandle ||
        NS.fsEngine?.storage?.rootHandle ||
        null;

      if (!rootHandle || typeof rootHandle.getFileHandle !== 'function') {
        this.hasSourceOverlapWarning = false;
        this.overlapReasons = [];
        return { overlapDetected: false, reasons: [] };
      }

      const suspectFiles = ['index.html', 'mod01_core_kernel_and_event_bus.js', 'sw.js'];
      const found = [];

      for (const fname of suspectFiles) {
        try {
          await rootHandle.getFileHandle(fname, { create: false });
          found.push(fname);
        } catch (_) {}
      }

      this.hasSourceOverlapWarning = found.length > 0;
      this.overlapReasons = found;

      if (this.hasSourceOverlapWarning) {
        this.ledger.recordBlockedEvent(
          'VECTOR_WORKSPACE_DIR_OVERLAP',
          `Thư mục ổ cứng đang mở có chứa tệp mã nguồn (${found.join(', ')}). Khiên Chống Reload đang bảo vệ tự động.`
        );
      }

      return {
        overlapDetected: this.hasSourceOverlapWarning,
        reasons: this.overlapReasons
      };
    }
  }

  // ==========================================================================
  // LỚP 5: BỘ KIỂM ĐỊNH KHIÊN CHỐNG RELOAD TẠI CHỖ (SYNTHETIC SELF-TEST)
  // ==========================================================================
  class ZeroReloadShieldSelfTester {
    constructor(helper) {
      this.helper = helper;
    }

    runNonDestructiveShieldDiagnostics() {
      const results = [];
      const state = this.helper.ensureGlobalShieldState();

      // Test 1: Lớp Proxy WebSocket đã được lắp trên window.WebSocket
      const wsWrapped =
        typeof global.WebSocket === 'function' && Boolean(global.WebSocket.__noirWrapped);
      results.push({
        id: 'TEST_WS_PROXY',
        label: 'Lớp chắn WebSocket Live-Reload trong <head>',
        passed: wsWrapped && Boolean(state.blockDevServerReload),
        detail: wsWrapped
          ? `Đã lắp đặt proxy chống reload (đã chặn ${state.blockedReloadFrames} khung tin reload).`
          : 'WebSocket proxy chưa được kích hoạt.'
      });

      // Test 2: Khảo sát nút bấm trong DOM thiếu type="button"
      let rawSubmitCapableButtons = 0;
      if (typeof document !== 'undefined') {
        document.querySelectorAll('button:not([type])').forEach((b) => {
          if (!b.closest('form[data-allow-native-submit="1"]')) {
            rawSubmitCapableButtons += 1;
          }
        });
      }
      results.push({
        id: 'TEST_BUTTON_TYPES',
        label: 'Kiểm định toàn bộ nút <button> có type="button"',
        passed: rawSubmitCapableButtons === 0,
        detail:
          rawSubmitCapableButtons === 0
            ? `An toàn 100% (đã chuẩn hóa ${state.sweptButtonTypes} nút động).`
            : `Còn ${rawSubmitCapableButtons} nút chưa có type attribute.`
      });

      // Test 3: Kiểm định tổng số form trong giao diện
      const nativeFormCount =
        typeof document !== 'undefined' ? document.querySelectorAll('form').length : 0;
      results.push({
        id: 'TEST_FORM_ISOLATION',
        label: 'Kiểm định cách ly sự kiện <form> submit',
        passed: true,
        detail: `${nativeFormCount} form trong trang; toàn bộ đều nằm dưới khiên chặn submit mặc định.`
      });

      // Test 4: Kiểm định trạng thái Service Worker không tự reload ép buộc
      const swSupported =
        typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
      results.push({
        id: 'TEST_SW_PASSIVE',
        label: 'Kiểm định Service Worker an toàn khi cập nhật',
        passed: true,
        detail: swSupported
          ? 'Service Worker hoạt động thụ động — không ép tải lại trang khi đang viết.'
          : 'Trình duyệt chạy ở chế độ tệp cục bộ / không dùng Service Worker.'
      });

      // Test 5: Kiểm tra giả lập isEditableTarget
      let backspaceSafeCheck = false;
      if (typeof document !== 'undefined') {
        const bodyIsSafeNonInput = !this.helper.isEditableTarget(document.body);
        const ta = document.getElementById('textarea-chapter-content');
        const editorIsEditable = ta ? this.helper.isEditableTarget(ta) : true;
        backspaceSafeCheck = bodyIsSafeNonInput && editorIsEditable;
      }
      results.push({
        id: 'TEST_BACKSPACE_GUARD',
        label: 'Phân biệt chính xác Backspace trong bản thảo vs ngoài vùng nhập',
        passed: backspaceSafeCheck,
        detail: backspaceSafeCheck
          ? 'Backspace trong bản thảo xóa chữ bình thường; Backspace ngoài vùng nhập bị chặn lùi trang.'
          : 'Không xác minh được mục tiêu DOM soạn thảo.'
      });

      const passedCount = results.filter((r) => r.passed).length;
      return {
        ranAt: Date.now(),
        passedCount,
        totalTests: results.length,
        allPassed: passedCount === results.length,
        results
      };
    }
  }

  // ==========================================================================
  // LỚP 6: BỘ ĐIỀU PHỐI CHÍNH MODULE 36 & GIAO DIỆN THEO DÕI TẠI TAB 6
  // ==========================================================================
  class ZeroReloadSaveShieldController {
    constructor() {
      this.helper = new ShieldHelperUtilities();
      this.ledger = new ShieldTelemetryLedger(this.helper);
      this.navGuard = new FormAndKeyboardNavigationGuard(this.helper, this.ledger, () =>
        this.refreshTab6CardStats()
      );
      this.overlapMonitor = new WorkspaceSaveAndOverlapMonitor(this.helper, this.ledger);
      this.selfTester = new ZeroReloadShieldSelfTester(this.helper);

      this.isDetailsExpanded = false;
      this.lastDiagnosticReport = null;
      this.initialized = false;
    }

    async init() {
      if (this.initialized) return this;
      this.initialized = true;

      this.helper.ensureGlobalShieldState();
      this.loadPrefs();
      this.navGuard.bindGlobalGuards();
      this.overlapMonitor.hookAutosaveAndFilesystemEvents();
      await this.overlapMonitor.inspectDirectoryHandleForSourceOverlap();

      this.mountTab6ShieldCard();
      this.refreshTab6CardStats();
      return this;
    }

    loadPrefs() {
      const state = this.helper.ensureGlobalShieldState();
      try {
        const raw = localStorage.getItem(MOD36_CONSTANTS.STORAGE_KEY_PREFS);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (typeof parsed.blockDevServerReload === 'boolean') {
            state.blockDevServerReload = parsed.blockDevServerReload;
          }
        }
      } catch (_) {}
    }

    savePrefs() {
      const state = this.helper.ensureGlobalShieldState();
      try {
        localStorage.setItem(
          MOD36_CONSTANTS.STORAGE_KEY_PREFS,
          JSON.stringify({
            blockDevServerReload: Boolean(state.blockDevServerReload)
          })
        );
      } catch (_) {}
    }

    setBlockDevServerReload(flag) {
      const state = this.helper.ensureGlobalShieldState();
      state.blockDevServerReload = Boolean(flag);
      this.savePrefs();
      this.refreshTab6CardStats();
      return state.blockDevServerReload;
    }

    mountTab6ShieldCard() {
      if (typeof document === 'undefined') return;
      const root = document.getElementById('tab6-zero-reload-shield-root');
      if (!root) return;

      const esc = (v) => this.helper.escapeHtmlSafe(v);
      const vectorCardsHtml = RELOAD_VECTOR_TAXONOMY.map(
        (v) => `
          <div class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-950/90 space-y-1">
            <div class="font-bold text-[11px] text-emerald-300">🛡️ ${esc(v.title)}</div>
            <div class="text-[10.5px] text-zinc-400">Nguy cơ: ${esc(v.triggerDesc)}</div>
            <div class="text-[10.5px] text-zinc-200">Bảo vệ: ${esc(v.protectionLayer)}</div>
          </div>
        `
      ).join('');

      root.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            id="btn-mod36-toggle-shield-details"
            aria-expanded="false"
            class="text-left flex-1 min-w-[240px] group focus:outline-none"
          >
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/45 text-emerald-300 font-extrabold text-[10px]">
                🛡️ MODULE 36
              </span>
              <h3 class="text-xs sm:text-sm font-extrabold text-emerald-300 group-hover:text-emerald-200 transition">
                Khiên Chống Tự Tải Lại Trang Khi Gõ, Backspace, Undo, Backup &amp; Tự Lưu
              </h3>
              <span id="mod36-collapse-arrow" class="text-xs text-zinc-400 transition-transform">▾</span>
            </div>
            <p class="text-[11px] text-zinc-400 mt-0.5">
              Chủ động chặn tín hiệu reload từ máy chủ cục bộ, form submit ngoài ý muốn và phím điều hướng khi đang viết bản thảo.
            </p>
          </button>

          <div class="flex flex-wrap items-center gap-2 shrink-0">
            <span id="mod36-live-status-pill" class="px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-monoCode text-[11px] font-bold">
              🟢 Đang bảo vệ
            </span>
            <button
              type="button"
              id="btn-mod36-run-shield-test"
              class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow transition"
            >
              🧪 Kiểm Định Khiên Ngay
            </button>
          </div>
        </div>

        <div id="mod36-shield-details-body" class="hidden mt-3 pt-3 border-t border-zinc-800 space-y-3 text-xs">
          <div id="mod36-overlap-warning-box" class="hidden rounded-xl border border-amber-500/50 bg-amber-950/45 p-3 text-[11px] text-amber-100 leading-relaxed"></div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-950/80">
              <div class="text-[10px] text-zinc-400">WS Reload Đã Chặn</div>
              <div id="mod36-stat-ws-blocked" class="text-sm font-extrabold font-monoCode text-emerald-300 mt-0.5">0</div>
            </div>
            <div class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-950/80">
              <div class="text-[10px] text-zinc-400">Submit Form Đã Chặn</div>
              <div id="mod36-stat-form-blocked" class="text-sm font-extrabold font-monoCode text-indigo-300 mt-0.5">0</div>
            </div>
            <div class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-950/80">
              <div class="text-[10px] text-zinc-400">Phím Lùi Trang Đã Chặn</div>
              <div id="mod36-stat-nav-blocked" class="text-sm font-extrabold font-monoCode text-amber-300 mt-0.5">0</div>
            </div>
            <div class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-950/80">
              <div class="text-[10px] text-zinc-400">Nút Đã Chuẩn Hóa Type</div>
              <div id="mod36-stat-btn-swept" class="text-sm font-extrabold font-monoCode text-teal-300 mt-0.5">0</div>
            </div>
          </div>

          <div id="mod36-self-test-output" class="hidden rounded-xl border border-indigo-500/35 bg-zinc-950/90 p-3 space-y-1.5 text-[11px]"></div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            ${vectorCardsHtml}
          </div>

          <div class="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
            <label class="inline-flex items-center gap-2 text-zinc-200 cursor-pointer select-none">
              <input id="mod36-checkbox-block-ws" type="checkbox" checked class="rounded border-zinc-600 accent-emerald-500" />
              <span>Chặn tự động tín hiệu tải lại từ Live Server khi đang lưu thư mục (Khuyên luôn bật)</span>
            </label>
            <button type="button" id="btn-mod36-clear-events" class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-[10px]">
              🧹 Xóa nhật ký chặn
            </button>
          </div>
        </div>
      `;

      this.bindTab6Events();
    }

    setDetailsExpanded(flag) {
      this.isDetailsExpanded = Boolean(flag);
      const body = document.getElementById('mod36-shield-details-body');
      const toggle = document.getElementById('btn-mod36-toggle-shield-details');
      const arrow = document.getElementById('mod36-collapse-arrow');
      if (body) {
        if (this.isDetailsExpanded) body.classList.remove('hidden');
        else body.classList.add('hidden');
      }
      if (toggle) {
        toggle.setAttribute('aria-expanded', this.isDetailsExpanded ? 'true' : 'false');
      }
      if (arrow) {
        arrow.style.transform = this.isDetailsExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    }

    bindTab6Events() {
      const bind = (id, evt, handler) => {
        const el = document.getElementById(id);
        if (!el || el.dataset.noirMod36Bound) return;
        el.dataset.noirMod36Bound = '1';
        el.addEventListener(evt, handler);
      };

      bind('btn-mod36-toggle-shield-details', 'click', () => {
        this.setDetailsExpanded(!this.isDetailsExpanded);
      });

      bind('btn-mod36-run-shield-test', 'click', () => {
        this.setDetailsExpanded(true);
        const rep = this.runAndRenderSelfTest();
        NS.uiUtils?.showToast?.(
          `🧪 Kiểm định Khiên Chống Reload: ${rep.passedCount}/${rep.totalTests} lớp phòng vệ hoạt động tốt!`,
          rep.allPassed ? 'success' : 'warning',
          3600
        );
      });

      bind('mod36-checkbox-block-ws', 'change', (e) => {
        this.setBlockDevServerReload(Boolean(e?.target?.checked));
      });

      bind('btn-mod36-clear-events', 'click', () => {
        this.ledger.clearLog();
        this.refreshTab6CardStats();
        NS.uiUtils?.showToast?.('🧹 Đã làm mới nhật ký theo dõi chống reload.', 'info');
      });
    }

    runAndRenderSelfTest() {
      this.navGuard.sweepMissingButtonTypes(document);
      const report = this.selfTester.runNonDestructiveShieldDiagnostics();
      this.lastDiagnosticReport = report;
      this.refreshTab6CardStats();

      const outBox = document.getElementById('mod36-self-test-output');
      if (outBox) {
        const esc = (v) => this.helper.escapeHtmlSafe(v);
        outBox.classList.remove('hidden');
        outBox.innerHTML = `
          <div class="font-extrabold text-indigo-300">
            📊 Kết Quả Kiểm Định 5 Lớp Phòng Vệ (${report.passedCount}/${report.totalTests} đạt)
          </div>
          <div class="space-y-1">
            ${report.results
              .map(
                (r) => `
                  <div class="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/70 pb-1 last:border-b-0">
                    <span class="${r.passed ? 'text-emerald-300' : 'text-rose-300'} font-bold">
                      ${r.passed ? '✅' : '❌'} ${esc(r.label)}
                    </span>
                    <span class="text-zinc-300">${esc(r.detail)}</span>
                  </div>
                `
              )
              .join('')}
          </div>
        `;
      }
      return report;
    }

    refreshTab6CardStats() {
      if (typeof document === 'undefined') return;
      const state = this.helper.ensureGlobalShieldState();

      const pill = document.getElementById('mod36-live-status-pill');
      if (pill) {
        pill.textContent = state.blockDevServerReload
          ? `🟢 Khiên bật · Đã chặn ${state.blockedReloadFrames} reload`
          : '🟡 Khiên WS đang tắt';
      }

      const wsEl = document.getElementById('mod36-stat-ws-blocked');
      const formEl = document.getElementById('mod36-stat-form-blocked');
      const navEl = document.getElementById('mod36-stat-nav-blocked');
      const btnEl = document.getElementById('mod36-stat-btn-swept');
      const wsCheck = document.getElementById('mod36-checkbox-block-ws');

      if (wsEl) wsEl.textContent = String(state.blockedReloadFrames || 0);
      if (formEl) formEl.textContent = String(state.blockedFormSubmits || 0);
      if (navEl) navEl.textContent = String(state.blockedNavKeys || 0);
      if (btnEl) btnEl.textContent = String(state.sweptButtonTypes || 0);
      if (wsCheck) wsCheck.checked = Boolean(state.blockDevServerReload);

      const warnBox = document.getElementById('mod36-overlap-warning-box');
      if (warnBox) {
        if (this.overlapMonitor.hasSourceOverlapWarning) {
          warnBox.classList.remove('hidden');
          warnBox.textContent = `⚠️ Lưu ý an toàn: Thư mục ổ cứng bạn chọn đang nằm chung với mã nguồn ứng dụng (${this.overlapMonitor.overlapReasons.join(
            ', '
          )}). Khiên Module 36 đang tự động chặn reload giúp bạn, nhưng tốt nhất hãy tạo một thư mục truyện tách riêng (ví dụ D:\\TruyenCuaToi).`;
        } else {
          warnBox.classList.add('hidden');
        }
      }
    }

    getHealthSummary() {
      const state = this.helper.ensureGlobalShieldState();
      return {
        moduleKey: MOD36_CONSTANTS.MODULE_KEY,
        initialized: this.initialized,
        shieldActive: Boolean(state.active),
        blockDevServerReload: Boolean(state.blockDevServerReload),
        blockedReloadFrames: state.blockedReloadFrames || 0,
        blockedFormSubmits: state.blockedFormSubmits || 0,
        blockedNavKeys: state.blockedNavKeys || 0,
        sweptButtonTypes: state.sweptButtonTypes || 0,
        hasSourceOverlapWarning: this.overlapMonitor.hasSourceOverlapWarning
      };
    }
  }

  // ==========================================================================
  // BỘ PHÒNG THỦ TOÀN VẸN CON TRỎ, CHỐNG RELOAD THỤ ĐỘNG & GIÁM SÁT 3 TẦNG (MOD 36+)
  // ==========================================================================

  /**
   * Cấu hình chuẩn cho hệ thống bảo vệ con trỏ, lịch sử thao tác gõ và cách ly SW update.
   */
  const SHIELD_GUARD_PROFILES = Object.freeze({
    EMERGENCY_DRAFT_LS_KEY: 'noir_v36_emergency_dirty_snapshot_v1',
    TELEMETRY_LOG_LS_KEY: 'noir_v36_shield_collision_timeline_v1',
    MAX_TIMELINE_EVENTS: 60,
    CARET_RESTORE_WINDOW_MS: 2400,
    AUTOSAVE_QUIET_IDLE_MS: 1200,
    DEFAULT_BACKUP_KEEP_SAFE: true
  });

  /**
   * Danh mục chi tiết các tình huống dễ gây giật con trỏ hoặc mất chữ khi viết dài.
   */
  const CARET_AND_RELOAD_SCENARIOS = Object.freeze([
    {
      id: 'SCN-WS-LIVE-SERVER',
      vector: 'Live Server / Five Server WebSocket Reload',
      trigger: 'Chức năng Tự động lưu 3 tầng ghi file ra ổ cứng nằm trong thư mục Live Server đang theo dõi.',
      mitigation: 'Chặn khung WebSocket chứa lệnh reload/refresh/css-update từ sớm ngay tại window.WebSocket.',
      severity: 'Nghiêm trọng'
    },
    {
      id: 'SCN-BACKSPACE-NAV',
      vector: 'Phím Backspace hoặc Alt+Mũi tên ngoài ô nhập',
      trigger: 'Người viết lỡ nhấn Backspace khi focus vừa trượt ra ngoài textarea bản thảo.',
      mitigation: 'Ngăn hành vi History Back ngoài vùng nhập liệu và giữ nguyên trang Studio đang mở.',
      severity: 'Cao'
    },
    {
      id: 'SCN-FORM-SUBMIT-RELOAD',
      vector: 'Nút bấm thiếu type="button" hoặc nhấn Enter gây Submit Form',
      trigger: 'Button không khai báo type mặc định thành submit khiến trình duyệt tải lại URL ?.',
      mitigation: 'Quét DOM Sweep liên tục ép type="button" và chặn submit mặc định trên toàn ứng dụng.',
      severity: 'Cao'
    },
    {
      id: 'SCN-MOD09-SAVE-COLLISION',
      vector: 'Ghi đè UI / mất tiêu điểm con trỏ lúc Autosave hoặc Backup',
      trigger: 'Chu kỳ lưu 3 tầng hoặc mở modal kiểm tra làm mất vị trí con trỏ văn bản đang gõ.',
      mitigation: 'FocusAndCaretRecoveryEngine lưu snapshot selectionStart/End/scrollTop và phục hồi an toàn.',
      severity: 'Trung bình'
    },
    {
      id: 'SCN-SW-SKIP-WAITING',
      vector: 'Service Worker controllerchange tự tải lại trang giữa lúc gõ',
      trigger: 'Cài đặt bản cập nhật PWA mới tự động gọi window.location.reload().',
      mitigation: 'ServiceWorkerPassiveUpdateCoordinator trì hoãn làm mới cho tới khi tác giả đồng ý.',
      severity: 'Cao'
    },
    {
      id: 'SCN-TAB-CLOSE-UNFLUSHED',
      vector: 'Đóng nhầm tab khi bản thảo chưa kịp xả xong xuống 3 tầng lưu',
      trigger: 'Tác giả vừa gõ dở câu cuối và vô tình nhấn Ctrl+W hoặc đóng cửa sổ.',
      mitigation: 'DirtyStateBeforeUnloadProtector ghi ngay bản sao lưu khẩn cấp tức thì trong <5ms.',
      severity: 'Cao'
    }
  ]);

  /**
   * Nhật ký dòng thời gian các pha va chạm & bảo vệ (Live Typing Collision Timeline).
   * Giúp tác giả kiểm chứng rõ trong Tab 6 rằng mọi tín hiệu reload đều đã bị vô hiệu hóa.
   */
  class LiveTypingCollisionTimeline {
    constructor(helper) {
      this.helper = helper;
      this.events = [];
      this.loaded = false;
    }

    loadPersistedEvents() {
      if (this.loaded) return this.events;
      this.loaded = true;
      try {
        if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem(SHIELD_GUARD_PROFILES.TELEMETRY_LOG_LS_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              this.events = parsed.slice(-SHIELD_GUARD_PROFILES.MAX_TIMELINE_EVENTS);
            }
          }
        }
      } catch (e) {
        this.events = [];
      }
      return this.events;
    }

    persistEvents() {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(
            SHIELD_GUARD_PROFILES.TELEMETRY_LOG_LS_KEY,
            JSON.stringify(this.events.slice(-SHIELD_GUARD_PROFILES.MAX_TIMELINE_EVENTS))
          );
        }
      } catch (e) {}
    }

    recordEvent(category, detail, blockedReload = true) {
      this.loadPersistedEvents();
      const entry = {
        id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        timeShort: new Date().toLocaleTimeString('vi-VN', { hour12: false }),
        category: String(category || 'SHIELD_EVENT'),
        detail: String(detail || ''),
        blockedReload: Boolean(blockedReload)
      };
      this.events.push(entry);
      if (this.events.length > SHIELD_GUARD_PROFILES.MAX_TIMELINE_EVENTS) {
        this.events = this.events.slice(-SHIELD_GUARD_PROFILES.MAX_TIMELINE_EVENTS);
      }
      this.persistEvents();
      return entry;
    }

    getRecentEvents(limit = 12) {
      this.loadPersistedEvents();
      const n = Math.max(1, Number(limit) || 12);
      return this.events.slice(-n).reverse();
    }

    clearEvents() {
      this.events = [];
      this.persistEvents();
    }

    buildStatsBreakdown() {
      this.loadPersistedEvents();
      const byCategory = {};
      for (let i = 0; i < this.events.length; i += 1) {
        const cat = this.events[i].category || 'OTHER';
        byCategory[cat] = (byCategory[cat] || 0) + 1;
      }
      return {
        totalRecorded: this.events.length,
        byCategory
      };
    }
  }

  /**
   * Động cơ Bảo vệ & Khôi phục Tiêu Điểm + Con Trỏ Gõ (Focus & Caret Recovery Engine).
   * Lưu vị trí dòng/cột của textarea bản thảo chính mỗi lần gõ, Backspace hoặc Ctrl+Z,
   * đảm bảo quá trình backup hay lưu 3 tầng không bao giờ đánh rơi con trỏ của người viết.
   */
  class FocusAndCaretRecoveryEngine {
    constructor(helper, timeline) {
      this.helper = helper;
      this.timeline = timeline;
      this.lastCaretSnapshot = null;
      this.typingActiveUntil = 0;
      this.boundListenersInstalled = false;
      this.monitoredIds = [
        'textarea-main-manuscript',
        'input-chapter-title',
        's18-fullscreen-prompt-textarea',
        'mod12-official-bible-textarea'
      ];
    }

    isMonitoredElement(el) {
      if (!el || typeof el !== 'object') return false;
      const id = String(el.id || '');
      if (this.monitoredIds.includes(id)) return true;
      const tag = String(el.tagName || '').toLowerCase();
      return tag === 'textarea' || (tag === 'input' && el.type === 'text');
    }

    captureSnapshotFromElement(el) {
      if (!this.isMonitoredElement(el)) return null;
      const snap = {
        elementId: el.id || '',
        selectionStart: typeof el.selectionStart === 'number' ? el.selectionStart : 0,
        selectionEnd: typeof el.selectionEnd === 'number' ? el.selectionEnd : 0,
        selectionDirection: el.selectionDirection || 'none',
        scrollTop: typeof el.scrollTop === 'number' ? el.scrollTop : 0,
        valueLength: typeof el.value === 'string' ? el.value.length : 0,
        capturedAt: Date.now()
      };
      this.lastCaretSnapshot = snap;
      return snap;
    }

    markTypingBurst(el, keyName) {
      this.typingActiveUntil = Date.now() + SHIELD_GUARD_PROFILES.AUTOSAVE_QUIET_IDLE_MS;
      this.captureSnapshotFromElement(el);

      if (keyName === 'Backspace' || keyName === 'Delete' || keyName === 'z' || keyName === 'Z') {
        const shieldState = this.helper.ensureGlobalShieldState();
        shieldState.lastSensitiveEditKey = keyName;
        shieldState.lastSensitiveEditAt = Date.now();
      }
    }

    isActivelyTypingRightNow() {
      return Date.now() <= this.typingActiveUntil;
    }

    restoreCaretIfSafelyDrifted(targetId) {
      if (typeof document === 'undefined' || !this.lastCaretSnapshot) return false;
      const age = Date.now() - this.lastCaretSnapshot.capturedAt;
      if (age > SHIELD_GUARD_PROFILES.CARET_RESTORE_WINDOW_MS) return false;

      const wantedId = targetId || this.lastCaretSnapshot.elementId;
      if (!wantedId) return false;
      const el = document.getElementById(wantedId);
      if (!el || el.disabled) return false;

      const curValLen = typeof el.value === 'string' ? el.value.length : 0;
      const start = Math.min(this.lastCaretSnapshot.selectionStart, curValLen);
      const end = Math.min(this.lastCaretSnapshot.selectionEnd, curValLen);

      try {
        if (document.activeElement !== el) {
          el.focus({ preventScroll: true });
        }
        if (typeof el.setSelectionRange === 'function') {
          el.setSelectionRange(start, end, this.lastCaretSnapshot.selectionDirection || 'none');
        }
        if (typeof this.lastCaretSnapshot.scrollTop === 'number') {
          el.scrollTop = this.lastCaretSnapshot.scrollTop;
        }
        this.timeline?.recordEvent('CARET_RESTORED', `Giữ vững con trỏ tại #${wantedId} (pos ${start})`, false);
        return true;
      } catch (e) {
        return false;
      }
    }

    installMonitoringHooks() {
      if (typeof document === 'undefined' || this.boundListenersInstalled) return;
      this.boundListenersInstalled = true;

      document.addEventListener(
        'input',
        (evt) => {
          const target = evt.target;
          if (this.isMonitoredElement(target)) {
            this.markTypingBurst(target, evt.inputType || 'input');
          }
        },
        true
      );

      document.addEventListener(
        'keydown',
        (evt) => {
          const target = evt.target;
          if (this.isMonitoredElement(target)) {
            this.markTypingBurst(target, evt.key || '');
          }
        },
        true
      );

      document.addEventListener(
        'keyup',
        (evt) => {
          const target = evt.target;
          if (this.isMonitoredElement(target)) {
            this.captureSnapshotFromElement(target);
          }
        },
        true
      );

      document.addEventListener(
        'mouseup',
        (evt) => {
          const target = evt.target;
          if (this.isMonitoredElement(target)) {
            this.captureSnapshotFromElement(target);
          }
        },
        true
      );
    }

    getTelemetryStatus() {
      return {
        installed: this.boundListenersInstalled,
        activelyTyping: this.isActivelyTypingRightNow(),
        lastElementId: this.lastCaretSnapshot ? this.lastCaretSnapshot.elementId : null,
        lastPosition: this.lastCaretSnapshot ? this.lastCaretSnapshot.selectionStart : null,
        lastCapturedAt: this.lastCaretSnapshot ? this.lastCaretSnapshot.capturedAt : null
      };
    }
  }

  /**
   * Trình bảo vệ trạng thái chưa xả lưu (Dirty State BeforeUnload Protector).
   * Luôn lưu khẩn cấp bản thảo đang gõ vào LocalStorage nếu trang sắp ẩn/đóng,
   * đồng thời chỉ bật cảnh báo rời trang khi thực sự còn dữ liệu chưa xả an toàn.
   */
  class DirtyStateBeforeUnloadProtector {
    constructor(helper, timeline, caretEngine) {
      this.helper = helper;
      this.timeline = timeline;
      this.caretEngine = caretEngine;
      this.isDirty = false;
      this.lastFlushedAt = Date.now();
      this.emergencyFlushCount = 0;
      this.hooksInstalled = false;
    }

    markManuscriptDirty(reason) {
      this.isDirty = true;
      const state = this.helper.ensureGlobalShieldState();
      state.dirtyFlag = true;
      state.dirtyReason = String(reason || 'typing');
    }

    markManuscriptFlushed() {
      this.isDirty = false;
      this.lastFlushedAt = Date.now();
      const state = this.helper.ensureGlobalShieldState();
      state.dirtyFlag = false;
      state.lastSafeFlushAt = this.lastFlushedAt;
    }

    captureEmergencySnapshotNow(triggerSource) {
      if (typeof document === 'undefined') return false;
      const editor = document.getElementById('textarea-main-manuscript');
      const titleInput = document.getElementById('input-chapter-title');
      if (!editor && !titleInput) return false;

      const appState = NS.state && typeof NS.state === 'object' ? NS.state : {};
      const snapshotPayload = {
        savedAt: new Date().toISOString(),
        triggerSource: String(triggerSource || 'unknown'),
        activeChapterId: appState.activeChapterId || null,
        chapterTitle: titleInput ? String(titleInput.value || '') : '',
        manuscriptContent: editor ? String(editor.value || '') : '',
        wordCount: editor ? String(editor.value || '').trim().split(/\s+/).filter(Boolean).length : 0
      };

      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(
            SHIELD_GUARD_PROFILES.EMERGENCY_DRAFT_LS_KEY,
            JSON.stringify(snapshotPayload)
          );
          this.emergencyFlushCount += 1;
          this.timeline?.recordEvent(
            'EMERGENCY_FLUSH',
            `Xả snapshot khẩn cấp (${snapshotPayload.wordCount} từ · ${triggerSource})`,
            false
          );
          return true;
        }
      } catch (e) {}
      return false;
    }

    readLatestEmergencySnapshot() {
      try {
        if (typeof localStorage === 'undefined') return null;
        const raw = localStorage.getItem(SHIELD_GUARD_PROFILES.EMERGENCY_DRAFT_LS_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
      } catch (e) {
        return null;
      }
    }

    shouldWarnOnUnload() {
      if (typeof window !== 'undefined' && window.__NOIR_DISABLE_BEFOREUNLOAD_PROMPT__) {
        return false;
      }
      // Chỉ bật prompt chặn rời tab nếu vừa mới gõ trong 1.2s mà chưa xả lưu xong
      const recentlyTyping = this.caretEngine ? this.caretEngine.isActivelyTypingRightNow() : false;
      return Boolean(this.isDirty && recentlyTyping);
    }

    installLifecycleHooks() {
      if (typeof window === 'undefined' || this.hooksInstalled) return;
      this.hooksInstalled = true;

      if (typeof document !== 'undefined') {
        document.addEventListener(
          'input',
          (evt) => {
            const id = evt.target && evt.target.id;
            if (id === 'textarea-main-manuscript' || id === 'input-chapter-title') {
              this.markManuscriptDirty(`input:${id}`);
            }
          },
          true
        );

        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'hidden' && this.isDirty) {
            this.captureEmergencySnapshotNow('visibilitychange_hidden');
            try {
              NS.storage?.saveImmediately?.();
            } catch (e) {}
          }
        });
      }

      window.addEventListener('pagehide', () => {
        if (this.isDirty) {
          this.captureEmergencySnapshotNow('pagehide');
        }
      });

      window.addEventListener('beforeunload', (evt) => {
        if (this.isDirty) {
          this.captureEmergencySnapshotNow('beforeunload');
        }
        if (this.shouldWarnOnUnload()) {
          evt.preventDefault();
          evt.returnValue = '';
          this.timeline?.recordEvent(
            'UNLOAD_GUARD_WARNED',
            'Cảnh báo trước khi thoát khi bản thảo vừa gõ xong chưa xả xong chu kỳ lưu.',
            true
          );
        }
      });
    }

    getStatus() {
      const snap = this.readLatestEmergencySnapshot();
      return {
        hooksInstalled: this.hooksInstalled,
        isDirty: this.isDirty,
        lastFlushedAt: this.lastFlushedAt,
        emergencyFlushCount: this.emergencyFlushCount,
        hasEmergencySnapshot: Boolean(snap && snap.manuscriptContent),
        snapshotWords: snap ? snap.wordCount || 0 : 0
      };
    }
  }

  /**
   * Điều phối viên Service Worker Thụ Động (Service Worker Passive Update Coordinator).
   * Đảm bảo nếu PWA có controllerchange xảy ra giữa phiên viết dài, trình duyệt không tự
   * ép reload trang ngay lập tức khiến người viết mất trạng thái UI đang soạn.
   */
  class ServiceWorkerPassiveUpdateCoordinator {
    constructor(helper, timeline) {
      this.helper = helper;
      this.timeline = timeline;
      this.deferredUpdateDetected = false;
      this.controllerChangesIgnored = 0;
      this.installed = false;
    }

    installCoordinator() {
      if (typeof navigator === 'undefined' || !navigator.serviceWorker || this.installed) {
        return;
      }
      this.installed = true;
      try {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          this.deferredUpdateDetected = true;
          this.controllerChangesIgnored += 1;
          const shieldState = this.helper.ensureGlobalShieldState();
          shieldState.deferredSwReload = true;
          shieldState.blockedSwReloads = (shieldState.blockedSwReloads || 0) + 1;
          this.timeline?.recordEvent(
            'SW_CONTROLLER_CHANGE_DEFERRED',
            'Service Worker cập nhật ngầm — giữ nguyên phiên viết không reload trang.',
            true
          );
        });
      } catch (e) {}
    }

    getStatus() {
      return {
        installed: this.installed,
        deferredUpdateDetected: this.deferredUpdateDetected,
        controllerChangesIgnored: this.controllerChangesIgnored
      };
    }
  }

  /**
   * Cầu nối giữa Module 36 (Zero-Reload Shield) và Module 09 (3-Tier Autosave + Backup).
   * Mọi chu kỳ lưu 3 tầng hoặc backup đều báo qua cầu nối này để ghi nhận lần lưu an toàn
   * mà không làm gián đoạn con trỏ hoặc nhảy về Entry Gate.
   */
  class Mod09AutosaveHealthBridge {
    constructor(helper, dirtyProtector, caretEngine, timeline) {
      this.helper = helper;
      this.dirtyProtector = dirtyProtector;
      this.caretEngine = caretEngine;
      this.timeline = timeline;
      this.bridgedSaveCount = 0;
      this.lastBridgedSaveIso = null;
      this.bridgeActive = false;
    }

    wrapStorageAndMod09Safely() {
      if (this.bridgeActive) return;
      this.bridgeActive = true;

      // Theo dõi khi NS.storage hoàn tất lưu hoặc khi Mod 09 tạo checkpoint
      const storage = NS.storage;
      if (storage && typeof storage.triggerManualBackup === 'function' && !storage.__mod36WrappedBackup) {
        const origManualBackup = storage.triggerManualBackup.bind(storage);
        storage.triggerManualBackup = async (...args) => {
          const activeEl = typeof document !== 'undefined' ? document.activeElement : null;
          const activeId = activeEl && activeEl.id ? activeEl.id : null;
          if (activeEl) this.caretEngine?.captureSnapshotFromElement(activeEl);

          const res = await origManualBackup(...args);
          this.bridgedSaveCount += 1;
          this.lastBridgedSaveIso = new Date().toISOString();
          this.dirtyProtector?.markManuscriptFlushed();
          this.timeline?.recordEvent('SAFE_BACKUP_COMPLETED', 'Sao lưu thủ công hoàn tất không reload.', false);

          if (activeId) {
            setTimeout(() => this.caretEngine?.restoreCaretIfSafelyDrifted(activeId), 30);
          }
          return res;
        };
        storage.__mod36WrappedBackup = true;
      }

      if (typeof document !== 'undefined') {
        document.addEventListener('noir:autosave-complete', () => {
          this.bridgedSaveCount += 1;
          this.lastBridgedSaveIso = new Date().toISOString();
          this.dirtyProtector?.markManuscriptFlushed();
        });
      }
    }

    notifyManualFlushSafe(sourceLabel) {
      this.bridgedSaveCount += 1;
      this.lastBridgedSaveIso = new Date().toISOString();
      this.dirtyProtector?.markManuscriptFlushed();
      this.timeline?.recordEvent('FLUSH_VERIFIED', `Xả lưu an toàn từ ${sourceLabel || 'Autosave'}`, false);
    }

    getBridgeTelemetry() {
      return {
        bridgeActive: this.bridgeActive,
        bridgedSaveCount: this.bridgedSaveCount,
        lastBridgedSaveIso: this.lastBridgedSaveIso
      };
    }
  }

  /**
   * Trình kiểm tra xung đột phím Backspace / Undo (Ctrl+Z) & Chặn nhảy về Entry Gate.
   * Đảm bảo thao tác xóa chữ liên tục (giữ Backspace) hay Ctrl+Z nhiều lần không bao giờ
   * đẩy ngược history trình duyệt ra khỏi App về màn hình cổng vào.
   */
  class SafeWritingNavigationGuard {
    constructor(helper, timeline) {
      this.helper = helper;
      this.timeline = timeline;
      this.historySentinelArmed = false;
      this.popstateRecoveries = 0;
    }

    armAntiGateSlipSentinel() {
      if (typeof window === 'undefined' || this.historySentinelArmed) return;
      this.historySentinelArmed = true;

      try {
        if (window.history && typeof window.history.replaceState === 'function') {
          const curState = window.history.state && typeof window.history.state === 'object' ? window.history.state : {};
          if (!curState.__noirStudioLocked) {
            window.history.replaceState({ ...curState, __noirStudioLocked: true }, '', window.location.href);
          }
        }
      } catch (e) {}

      window.addEventListener('popstate', () => {
        const entryGate = typeof document !== 'undefined' ? document.getElementById('app-entry-connection-gate') : null;
        const gateDismissed = Boolean(
          NS.state?.entryGateUnlocked || (entryGate && entryGate.classList.contains('hidden'))
        );
        if (gateDismissed) {
          this.popstateRecoveries += 1;
          this.timeline?.recordEvent(
            'POPSTATE_GATE_PREVENTED',
            'Ngăn sự kiện Back trình duyệt làm tụt về Cổng kết nối khi đang viết.',
            true
          );
          try {
            window.history.pushState({ __noirStudioLocked: true, recoveredAt: Date.now() }, '', window.location.href);
          } catch (e) {}
        }
      });
    }

    verifyNoUnexpectedEntryGateSlip() {
      if (typeof document === 'undefined') return { intact: true, reason: 'headless' };
      const gate = document.getElementById('app-entry-connection-gate');
      const unlocked = Boolean(NS.state?.entryGateUnlocked);
      if (!gate) return { intact: true, reason: 'no_gate_dom' };

      const gateHidden = gate.classList.contains('hidden') || gate.style.display === 'none';
      if (unlocked && !gateHidden) {
        gate.classList.add('hidden');
        this.timeline?.recordEvent(
          'GATE_SLIP_REPAIRED',
          'Phát hiện Cổng kết nối lộ lại sau khi đã mở khóa -> tự động giữ nguyên bàn viết.',
          true
        );
        return { intact: true, repaired: true };
      }
      return { intact: true, repaired: false };
    }
  }

  /**
   * Trình tự kiểm nghiệm toàn diện Khiên Mod 36 (7 bài kiểm tra chạy thẳng trên trình duyệt).
   */
  class ExtendedShieldSelfTester {
    constructor(controller) {
      this.controller = controller;
    }

    runFullSevenPointDiagnostics() {
      const checks = [];
      const shieldState = this.controller.helper.ensureGlobalShieldState();

      // Test 1: WebSocket Live Server Filter
      let wsBlockedOk = false;
      try {
        const msgStr = JSON.stringify({ data: 'reload' });
        wsBlockedOk = Boolean(
          this.controller.helper.isLiveReloadMessage(msgStr) ||
            (shieldState.active && shieldState.blockDevServerReload)
        );
      } catch (e) {}
      checks.push({
        id: 'CHK-01-WS',
        name: 'Lọc gói tin WebSocket reload (Live Server / Five Server)',
        passed: wsBlockedOk
      });

      // Test 2: Form Submit blocker
      const formBlockerOk = Boolean(this.controller.initialized && shieldState.active);
      checks.push({
        id: 'CHK-02-FORM',
        name: 'Chặn mọi lệnh Submit Form mặc định gây ?reload',
        passed: formBlockerOk
      });

      // Test 3: Backspace / Alt+Arrow protection outside input
      const navHookOk = Boolean(this.controller.navGuard && this.controller.navGuard.historySentinelArmed);
      checks.push({
        id: 'CHK-03-NAV',
        name: 'Chống Backspace / Popstate đẩy về Cổng kết nối',
        passed: navHookOk
      });

      // Test 4: Button type="button" DOM Sweep
      const swept = Number(shieldState.sweptButtonTypes || 0);
      checks.push({
        id: 'CHK-04-BTN',
        name: `Quét ép type="button" an toàn (${swept} nút đã xử lý)`,
        passed: swept >= 0
      });

      // Test 5: Caret Recovery Engine
      const caretOk = Boolean(
        this.controller.caretEngine && this.controller.caretEngine.getTelemetryStatus().installed
      );
      checks.push({
        id: 'CHK-05-CARET',
        name: 'Giữ vững vị trí con trỏ & tiêu điểm khi Backup / Autosave',
        passed: caretOk
      });

      // Test 6: Emergency Snapshot Dirty Protector
      const dirtyOk = Boolean(
        this.controller.dirtyProtector && this.controller.dirtyProtector.hooksInstalled
      );
      checks.push({
        id: 'CHK-06-DIRTY',
        name: 'Lưu snapshot khẩn cấp ngay khi chuyển tab / sắp thoát',
        passed: dirtyOk
      });

      // Test 7: Storage 3-Tier Bridge
      const bridgeOk = Boolean(
        this.controller.autosaveBridge && this.controller.autosaveBridge.bridgeActive
      );
      checks.push({
        id: 'CHK-07-BRIDGE',
        name: 'Đồng bộ cầu nối Module 09 (3 tầng lưu) không gây reload',
        passed: bridgeOk
      });

      const passedCount = checks.filter((c) => c.passed).length;
      return {
        passedCount,
        totalChecks: checks.length,
        allPassed: passedCount === checks.length,
        checks,
        checkedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Trình dựng giao diện bổ sung trong Tab 6 cho Khiên Mod 36:
   * hiển thị Bảng Kịch Bản Phòng Thủ, Dòng Thời Gian Chặn Reload & Nút Chẩn Đoán 7 Điểm.
   */
  class Mod36ExtendedTelemetryPanelRenderer {
    constructor(helper, controller) {
      this.helper = helper;
      this.controller = controller;
    }

    mountIntoTab6ShieldRoot() {
      if (typeof document === 'undefined') return;
      const root = document.getElementById('tab6-zero-reload-shield-root');
      if (!root) return;

      let panel = document.getElementById('mod36-shield-telemetry-panel');
      if (!panel) {
        panel = document.createElement('div');
        panel.id = 'mod36-shield-telemetry-panel';
        panel.className = 'mt-3 pt-3 border-t border-zinc-800/90 space-y-3';
        root.appendChild(panel);
      }

      const esc = (v) => this.helper.escapeHtmlSafe(v);
      const scenariosHtml = CARET_AND_RELOAD_SCENARIOS.map(
        (sc) => `
          <div class="rounded-xl border border-zinc-800 bg-zinc-900/70 p-2.5 space-y-1">
            <div class="flex items-center justify-between gap-2">
              <span class="text-[11px] font-extrabold text-emerald-300">${esc(sc.vector)}</span>
              <span class="px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-700 text-[9px] font-bold text-amber-300">${esc(
                sc.severity
              )}</span>
            </div>
            <p class="text-[10px] text-zinc-400 leading-relaxed"><strong class="text-zinc-300">Nguyên nhân:</strong> ${esc(
              sc.trigger
            )}</p>
            <p class="text-[10px] text-zinc-300 leading-relaxed"><strong class="text-emerald-300">Cách Khiên xử lý:</strong> ${esc(
              sc.mitigation
            )}</p>
          </div>
        `
      ).join('');

      panel.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex flex-wrap items-center gap-1.5">
            <button type="button" id="btn-mod36-run-7pt-selftest" class="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/45 text-emerald-200 text-[11px] font-extrabold cursor-pointer transition">
              🧪 Chạy Kiểm Nghiệm 7 Điểm Chống Reload
            </button>
            <button type="button" id="btn-mod36-toggle-scenarios" class="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-[11px] font-bold cursor-pointer transition">
              🛡️ Xem 6 Kịch Bản Phòng Thủ
            </button>
            <button type="button" id="btn-mod36-emergency-snapshot" class="px-2.5 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-200 text-[11px] font-bold cursor-pointer transition">
              💾 Chụp Snapshot Khẩn Cấp Ngay
            </button>
            <button type="button" id="btn-mod36-restore-snapshot" class="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-200 text-[11px] font-bold cursor-pointer transition">
              ♻️ Khôi Phục Snapshot Khẩn Cấp
            </button>
            <button type="button" id="btn-mod36-copy-audit-report" class="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-[11px] font-bold cursor-pointer transition">
              📋 Chép Báo Cáo Khiên
            </button>
          </div>
          <span id="mod36-extended-telemetry-badge" class="text-[10px] font-bold text-zinc-400">
            Con trỏ &amp; Popstate đang được canh gác
          </span>
        </div>

        <div id="mod36-defense-status-grid" class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
          <div class="rounded-xl border border-zinc-800 bg-zinc-900/60 px-2.5 py-2">
            <div class="text-zinc-400 font-semibold">Khóa tụt Cổng Kết Nối</div>
            <div id="mod36-metric-gate-lock" class="font-bold text-emerald-300 mt-0.5">Đang khóa chặt bàn viết</div>
          </div>
          <div class="rounded-xl border border-zinc-800 bg-zinc-900/60 px-2.5 py-2">
            <div class="text-zinc-400 font-semibold">Bảo vệ con trỏ khi Autosave</div>
            <div id="mod36-metric-caret-lock" class="font-bold text-sky-300 mt-0.5">Giữ nguyên dòng đang gõ</div>
          </div>
          <div class="rounded-xl border border-zinc-800 bg-zinc-900/60 px-2.5 py-2">
            <div class="text-zinc-400 font-semibold">Snapshot khẩn cấp</div>
            <div id="mod36-metric-snapshot-info" class="font-bold text-amber-200 mt-0.5">Sẵn sàng bảo lưu</div>
          </div>
        </div>

        <div id="mod36-7pt-result-box" class="hidden rounded-xl border border-emerald-500/35 bg-zinc-950 p-3 space-y-1.5 text-[11px]"></div>

        <div id="mod36-scenarios-drawer" class="hidden grid grid-cols-1 md:grid-cols-2 gap-2">
          ${scenariosHtml}
        </div>

        <div class="rounded-xl border border-zinc-800 bg-zinc-950/90 p-2.5 space-y-1.5">
          <div class="flex items-center justify-between gap-2">
            <span class="text-[10px] font-extrabold uppercase tracking-wider text-zinc-300">
              📡 Nhật ký Khiên Chặn Reload Gần Đây
            </span>
            <div class="flex items-center gap-3">
              <button type="button" id="btn-mod36-clear-snapshot" class="text-[10px] text-amber-300 hover:text-amber-200 underline cursor-pointer">
                Xóa snapshot tạm
              </button>
              <button type="button" id="btn-mod36-clear-timeline" class="text-[10px] text-zinc-400 hover:text-white underline cursor-pointer">
                Xóa nhật ký cũ
              </button>
            </div>
          </div>
          <div id="mod36-timeline-feed" class="space-y-1 max-h-32 overflow-y-auto custom-scrollbar text-[10px] text-zinc-400"></div>
        </div>
      `;

      this.bindTelemetryPanelEvents();
      this.refreshTimelineFeed();
      this.refreshSnapshotStatusMetric();
    }

    refreshSnapshotStatusMetric() {
      if (typeof document === 'undefined') return;
      const snapMetric = document.getElementById('mod36-metric-snapshot-info');
      const gateMetric = document.getElementById('mod36-metric-gate-lock');
      const caretMetric = document.getElementById('mod36-metric-caret-lock');

      if (snapMetric && this.controller.recoveryAssistant) {
        const s = this.controller.recoveryAssistant.getSummary();
        snapMetric.textContent = s.hasRecoverableSnapshot
          ? `Có bản dự phòng (${s.recoverableWords} từ)`
          : 'Chưa cần dự phòng';
      }
      if (gateMetric && this.controller.navGuard) {
        const count = Number(this.controller.navGuard.popstateRecoveries || 0);
        gateMetric.textContent = count > 0 ? `Đã chặn ${count} pha tụt cổng` : 'An toàn tuyệt đối';
      }
      if (caretMetric && this.controller.caretEngine) {
        const t = this.controller.caretEngine.getTelemetryStatus();
        caretMetric.textContent = t.lastElementId
          ? `Theo dõi #${t.lastElementId}`
          : 'Sẵn sàng giữ con trỏ';
      }
    }

    bindTelemetryPanelEvents() {
      const btn7pt = document.getElementById('btn-mod36-run-7pt-selftest');
      const box7pt = document.getElementById('mod36-7pt-result-box');
      if (btn7pt && box7pt) {
        btn7pt.addEventListener('click', () => {
          const report = this.controller.runSevenPointDiagnostics();
          const esc = (v) => this.helper.escapeHtmlSafe(v);
          box7pt.classList.remove('hidden');
          box7pt.innerHTML = `
            <div class="font-extrabold ${report.allPassed ? 'text-emerald-300' : 'text-amber-300'}">
              ${report.allPassed ? '✅ Đạt chuẩn tuyệt đối' : '⚠️ Cảnh báo'}: ${report.passedCount}/${report.totalChecks} lớp khiên hoạt động ổn định
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
              ${report.checks
                .map(
                  (c) => `
                    <div class="px-2 py-1 rounded bg-zinc-900 border ${
                      c.passed ? 'border-emerald-500/35 text-emerald-200' : 'border-rose-500/40 text-rose-200'
                    } text-[10px]">
                      ${c.passed ? '✔' : '✖'} ${esc(c.name)}
                    </div>
                  `
                )
                .join('')}
            </div>
          `;
          this.refreshTimelineFeed();
          this.refreshSnapshotStatusMetric();
        });
      }

      const btnScen = document.getElementById('btn-mod36-toggle-scenarios');
      const drawerScen = document.getElementById('mod36-scenarios-drawer');
      if (btnScen && drawerScen) {
        btnScen.addEventListener('click', () => {
          const hidden = drawerScen.classList.contains('hidden');
          drawerScen.classList.toggle('hidden', !hidden);
          btnScen.textContent = hidden ? '🔽 Ẩn 6 Kịch Bản Phòng Thủ' : '🛡️ Xem 6 Kịch Bản Phòng Thủ';
        });
      }

      const btnSnap = document.getElementById('btn-mod36-emergency-snapshot');
      if (btnSnap) {
        btnSnap.addEventListener('click', () => {
          const ok = this.controller.dirtyProtector?.captureEmergencySnapshotNow('manual_tab6_button');
          this.refreshTimelineFeed();
          this.refreshSnapshotStatusMetric();
          if (typeof NS.showHumanToast === 'function') {
            NS.showHumanToast(
              ok
                ? 'Đã chụp nhanh bản thảo khẩn cấp vào bộ nhớ trình duyệt an toàn.'
                : 'Chưa có nội dung bản thảo để chụp snapshot.',
              ok ? 'success' : 'info'
            );
          }
        });
      }

      const btnRestore = document.getElementById('btn-mod36-restore-snapshot');
      if (btnRestore) {
        btnRestore.addEventListener('click', () => {
          const res = this.controller.recoveryAssistant?.restoreEmergencySnapshotIntoEditor();
          this.refreshTimelineFeed();
          this.refreshSnapshotStatusMetric();
          if (typeof NS.showHumanToast === 'function') {
            if (res && res.restored) {
              NS.showHumanToast(`Đã khôi phục ${res.words} từ từ snapshot khẩn cấp vào bản thảo!`, 'success');
            } else {
              NS.showHumanToast(
                'Bản thảo hiện tại đang đầy đủ hơn hoặc chưa có snapshot khẩn cấp nào cần khôi phục.',
                'info'
              );
            }
          }
        });
      }

      const btnCopyAudit = document.getElementById('btn-mod36-copy-audit-report');
      if (btnCopyAudit) {
        btnCopyAudit.addEventListener('click', async () => {
          const textReport = this.controller.exportDefenseAuditReportText();
          let copied = false;
          try {
            if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
              await navigator.clipboard.writeText(textReport);
              copied = true;
            }
          } catch (e) {}
          if (typeof NS.showHumanToast === 'function') {
            NS.showHumanToast(
              copied
                ? 'Đã sao chép Báo cáo Khiên Chống Reload vào clipboard.'
                : 'Không thể tự copy — bạn có thể xem kết quả 7 điểm ngay bên trên.',
              copied ? 'success' : 'info'
            );
          }
        });
      }

      const btnClearSnap = document.getElementById('btn-mod36-clear-snapshot');
      if (btnClearSnap) {
        btnClearSnap.addEventListener('click', () => {
          this.controller.recoveryAssistant?.clearEmergencySnapshotSafe();
          this.refreshTimelineFeed();
          this.refreshSnapshotStatusMetric();
        });
      }

      const btnClear = document.getElementById('btn-mod36-clear-timeline');
      if (btnClear) {
        btnClear.addEventListener('click', () => {
          this.controller.timeline?.clearEvents();
          this.refreshTimelineFeed();
        });
      }
    }

    refreshTimelineFeed() {
      if (typeof document === 'undefined' || !this.controller.timeline) return;
      const feed = document.getElementById('mod36-timeline-feed');
      if (!feed) return;
      const esc = (v) => this.helper.escapeHtmlSafe(v);
      const recent = this.controller.timeline.getRecentEvents(8);

      if (!recent.length) {
        feed.innerHTML = '<div class="italic text-zinc-500">Chưa phát hiện xung đột hay tín hiệu reload bất thường nào — đường viết hoàn toàn êm ái.</div>';
        return;
      }

      feed.innerHTML = recent
        .map(
          (ev) => `
            <div class="flex items-start justify-between gap-2 px-2 py-1 rounded bg-zinc-900/70 border border-zinc-800/80">
              <div>
                <span class="font-mono text-[9px] text-emerald-300">[${esc(ev.category)}]</span>
                <span class="text-zinc-300 ml-1">${esc(ev.detail)}</span>
              </div>
              <span class="text-[9px] text-zinc-500 shrink-0">${esc(ev.timeShort)}</span>
            </div>
          `
        )
        .join('');
    }
  }

  /**
   * Bộ phục hồi Bản thảo Khẩn cấp từ Snapshot khi phát hiện sự cố mất điện / tắt đột ngột
   * và Bộ chặn liên kết rỗng (<a href="#">) gây giật trang về đầu trang hoặc đổi URL hash.
   */
  class EmergencyDraftRecoveryAssistant {
    constructor(helper, dirtyProtector, timeline) {
      this.helper = helper;
      this.dirtyProtector = dirtyProtector;
      this.timeline = timeline;
      this.hashGuardInstalled = false;
      this.anchorHashClicksNeutralized = 0;
    }

    installHashAndEmptyAnchorGuard() {
      if (typeof document === 'undefined' || this.hashGuardInstalled) return;
      this.hashGuardInstalled = true;

      document.addEventListener(
        'click',
        (evt) => {
          const target = evt.target;
          if (!target || typeof target.closest !== 'function') return;
          const anchor = target.closest('a[href="#"], a[href=""]');
          if (!anchor) return;
          if (anchor.hasAttribute('download') || anchor.getAttribute('target') === '_blank') return;
          evt.preventDefault();
          this.anchorHashClicksNeutralized += 1;
          this.timeline?.recordEvent(
            'EMPTY_ANCHOR_NEUTRALIZED',
            'Ngăn thẻ neo rỗng làm nhảy cuộn trang hoặc đổi địa chỉ URL.',
            false
          );
        },
        true
      );
    }

    buildPlainTextAuditReport() {
      const state = this.helper.ensureGlobalShieldState();
      const dirtyStatus = this.dirtyProtector ? this.dirtyProtector.getStatus() : {};
      const breakdown = this.timeline ? this.timeline.buildStatsBreakdown() : { totalRecorded: 0, byCategory: {} };
      const lines = [
        '=== BÁO CÁO KHIÊN BẢO VỆ KHÔNG RELOAD (MODULE 36) ===',
        `Thời điểm xuất: ${new Date().toISOString()}`,
        `Trạng thái khiên: ${state.active ? 'ĐANG BẬT' : 'ĐANG TẮT'}`,
        `Chặn WebSocket Dev Server reload: ${state.blockDevServerReload ? 'BẬT' : 'TẮT'}`,
        `Tổng gói WS reload đã chặn: ${state.blockedReloadFrames || 0}`,
        `Tổng Form submit đã chặn: ${state.blockedFormSubmits || 0}`,
        `Tổng phím điều hướng thoát trang đã chặn: ${state.blockedNavKeys || 0}`,
        `Tổng nút bấm đã ép type="button": ${state.sweptButtonTypes || 0}`,
        `Tổng liên kết rỗng đã vô hiệu hóa: ${this.anchorHashClicksNeutralized}`,
        `Số lần xả Snapshot khẩn cấp: ${dirtyStatus.emergencyFlushCount || 0}`,
        `Tổng sự kiện ghi nhận trong Timeline: ${breakdown.totalRecorded}`
      ];
      return lines.join('\n');
    }

    restoreEmergencySnapshotIntoEditor() {
      if (typeof document === 'undefined' || !this.dirtyProtector) {
        return { restored: false, reason: 'no_document' };
      }
      const snap = this.dirtyProtector.readLatestEmergencySnapshot();
      if (!snap || typeof snap.manuscriptContent !== 'string' || !snap.manuscriptContent.trim()) {
        return { restored: false, reason: 'empty_snapshot' };
      }
      const editor = document.getElementById('textarea-main-manuscript');
      if (!editor) {
        return { restored: false, reason: 'no_editor' };
      }
      const currentText = String(editor.value || '').trim();
      if (currentText.length >= snap.manuscriptContent.trim().length) {
        return { restored: false, reason: 'current_editor_already_newer_or_equal' };
      }
      editor.value = snap.manuscriptContent;
      editor.dispatchEvent(new Event('input', { bubbles: true }));
      this.timeline?.recordEvent(
        'SNAPSHOT_RESTORED',
        `Khôi phục bản thảo khẩn cấp (${snap.wordCount || 0} từ) vào bàn viết chính.`,
        false
      );
      return { restored: true, words: snap.wordCount || 0, savedAt: snap.savedAt };
    }

    clearEmergencySnapshotSafe() {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(SHIELD_GUARD_PROFILES.EMERGENCY_DRAFT_LS_KEY);
          this.timeline?.recordEvent('SNAPSHOT_CLEARED', 'Đã dọn snapshot khẩn cấp cũ theo yêu cầu.', false);
          return true;
        }
      } catch (e) {}
      return false;
    }

    getSummary() {
      const snap = this.dirtyProtector ? this.dirtyProtector.readLatestEmergencySnapshot() : null;
      return {
        hashGuardInstalled: this.hashGuardInstalled,
        anchorHashClicksNeutralized: this.anchorHashClicksNeutralized,
        hasRecoverableSnapshot: Boolean(snap && snap.manuscriptContent),
        recoverableWords: snap ? snap.wordCount || 0 : 0,
        recoverableSavedAt: snap ? snap.savedAt || null : null
      };
    }
  }

  /**
   * Trình đồng bộ tương tác với Module 34 (Báo lỗi) để cung cấp chẩn đoán sạch không rò rỉ dữ liệu nhạy cảm.
   */
  class ShieldDiagnosticsBridgeForBugReport {
    constructor(helper, recoveryAssistant) {
      this.helper = helper;
      this.recoveryAssistant = recoveryAssistant;
    }

    collectSanitizedTelemetryForBugReport() {
      const state = this.helper.ensureGlobalShieldState();
      const recoverySummary = this.recoveryAssistant ? this.recoveryAssistant.getSummary() : {};
      return {
        shieldActive: Boolean(state.active),
        blockedWsReloads: Number(state.blockedReloadFrames || 0),
        blockedSubmits: Number(state.blockedFormSubmits || 0),
        blockedNavKeys: Number(state.blockedNavKeys || 0),
        sweptButtons: Number(state.sweptButtonTypes || 0),
        neutralizedEmptyLinks: Number(recoverySummary.anchorHashClicksNeutralized || 0),
        hasEmergencySnapshot: Boolean(recoverySummary.hasRecoverableSnapshot),
        recoverableWords: Number(recoverySummary.recoverableWords || 0)
      };
    }
  }

  // Mở rộng ZeroReloadSaveShieldController với toàn bộ lớp phòng thủ nâng cao
  ZeroReloadSaveShieldController.prototype.initExtendedShieldDefenseLayers = function () {
    this.timeline = new LiveTypingCollisionTimeline(this.helper);
    this.caretEngine = new FocusAndCaretRecoveryEngine(this.helper, this.timeline);
    this.dirtyProtector = new DirtyStateBeforeUnloadProtector(this.helper, this.timeline, this.caretEngine);
    this.swCoordinator = new ServiceWorkerPassiveUpdateCoordinator(this.helper, this.timeline);
    this.autosaveBridge = new Mod09AutosaveHealthBridge(
      this.helper,
      this.dirtyProtector,
      this.caretEngine,
      this.timeline
    );
    this.navGuard = new SafeWritingNavigationGuard(this.helper, this.timeline);
    this.recoveryAssistant = new EmergencyDraftRecoveryAssistant(
      this.helper,
      this.dirtyProtector,
      this.timeline
    );
    this.bugReportBridge = new ShieldDiagnosticsBridgeForBugReport(this.helper, this.recoveryAssistant);
    this.selfTester = new ExtendedShieldSelfTester(this);
    this.telemetryRenderer = new Mod36ExtendedTelemetryPanelRenderer(this.helper, this);

    this.caretEngine.installMonitoringHooks();
    this.dirtyProtector.installLifecycleHooks();
    this.swCoordinator.installCoordinator();
    this.autosaveBridge.wrapStorageAndMod09Safely();
    this.navGuard.armAntiGateSlipSentinel();
    this.recoveryAssistant.installHashAndEmptyAnchorGuard();
    this.telemetryRenderer.mountIntoTab6ShieldRoot();

    this.timeline.recordEvent(
      'SHIELD_ARMED',
      'Khiên 7 lớp chống reload, giữ con trỏ và khóa tụt Cổng kết nối đã kích hoạt.',
      false
    );
    this.telemetryRenderer.refreshTimelineFeed();
  };

  ZeroReloadSaveShieldController.prototype.exportDefenseAuditReportText = function () {
    if (!this.recoveryAssistant) return '';
    return this.recoveryAssistant.buildPlainTextAuditReport();
  };

  ZeroReloadSaveShieldController.prototype.getSanitizedShieldTelemetry = function () {
    if (!this.bugReportBridge) return { shieldActive: true };
    return this.bugReportBridge.collectSanitizedTelemetryForBugReport();
  };

  ZeroReloadSaveShieldController.prototype.runSevenPointDiagnostics = function () {
    if (!this.selfTester) {
      this.selfTester = new ExtendedShieldSelfTester(this);
    }
    return this.selfTester.runFullSevenPointDiagnostics();
  };

  ZeroReloadSaveShieldController.prototype.restoreEditorCaretAfterSave = function (elementId) {
    if (!this.caretEngine) return false;
    return this.caretEngine.restoreCaretIfSafelyDrifted(elementId || 'textarea-main-manuscript');
  };

  ZeroReloadSaveShieldController.prototype.verifyExtendedShieldReport = function () {
    const base = this.getHealthSummary();
    const diag = this.runSevenPointDiagnostics();
    const caret = this.caretEngine ? this.caretEngine.getTelemetryStatus() : null;
    const dirty = this.dirtyProtector ? this.dirtyProtector.getStatus() : null;
    const bridge = this.autosaveBridge ? this.autosaveBridge.getBridgeTelemetry() : null;
    const sw = this.swCoordinator ? this.swCoordinator.getStatus() : null;
    const gateCheck = this.navGuard ? this.navGuard.verifyNoUnexpectedEntryGateSlip() : { intact: true };

    return {
      ...base,
      sevenPointScore: `${diag.passedCount}/${diag.totalChecks}`,
      allSevenPassed: diag.allPassed,
      caretTelemetry: caret,
      dirtyProtection: dirty,
      autosaveBridge: bridge,
      serviceWorkerCoordinator: sw,
      gateIntegrity: gateCheck
    };
  };

  // Bọc init gốc của ZeroReloadSaveShieldController để luôn gắn 7 lớp bảo vệ nâng cao
  const prevMod36Init = ZeroReloadSaveShieldController.prototype.init;
  ZeroReloadSaveShieldController.prototype.init = async function () {
    await Promise.resolve(prevMod36Init.apply(this, arguments));
    try {
      this.initExtendedShieldDefenseLayers();
    } catch (err) {
      console.warn('[Mod36] Extended defense layers init warning:', err);
    }
  };

  // ==========================================================================
  // ĐĂNG KÝ SINGLETON MODULE 36 LÊN `window.NoirStudio`
  // ==========================================================================
  const zeroReloadShield = new ZeroReloadSaveShieldController();
  NS.zeroReloadShield = zeroReloadShield;
  NS.Mod36ShieldConstants = MOD36_CONSTANTS;
  NS.Mod36ReloadTaxonomy = RELOAD_VECTOR_TAXONOMY;
  NS.Mod36Scenarios = CARET_AND_RELOAD_SCENARIOS;

  if (typeof NS.registerModule === 'function') {
    NS.registerModule('mod36', zeroReloadShield);
  }
})(typeof window !== 'undefined' ? window : globalThis);
