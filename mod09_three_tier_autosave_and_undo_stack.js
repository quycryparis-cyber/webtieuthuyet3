/**
 * ============================================================================
 * MODULE 09: THREE-TIER AUTOSAVE ENGINE & PER-CHAPTER UNDO/REDO TIME STACK
 * ============================================================================
 * Phiên bản: v38.0.0-SUPREME-MODULAR (2026)
 * Tệp: mod09_three_tier_autosave_and_undo_stack.js
 * Nhiệm vụ:
 *   1. Vận hành Hệ thống Tự Động Lưu 3 Tầng (Tier 1: RAM + LocalStorage tức thời,
 *      Tier 2: IndexedDB đa kho chống mất dữ liệu, Tier 3: Đồng bộ Thư mục Ổ cứng
 *      & kích hoạt Chụp ảnh Phiên bản Liên tục Tab 6 `maybeAutoSnapshotOnSave`).
 *   2. Quản lý Ngăn xếp Hoàn tác / Làm lại Độc lập Theo Từng Chương (`Undo`/`Redo`
 *      tối đa 120 bước mỗi chương), lưu giữ cả vị trí con trỏ văn bản và thanh cuộn.
 *   3. Cung cấp API thống nhất qua `window.NoirStudio.autoSaver`:
 *      - `init()`, `forcePushUndoSnapshot(text)`, `undo()`, `redo()`
 *      - `scheduleDebouncedSave(ms)`, `triggerSave(showToast)`
 *   4. Cập nhật theo thời gian thực các thành phần giao diện: `#fs-status-dot`,
 *      `#fs-status-text`, `#btn-s7-undo`, `#btn-s7-redo`, `#btn-s7-save-now` và
 *      phím tắt chuẩn `Ctrl+S`, `Ctrl+Z`, `Ctrl+Y`.
 * ============================================================================
 */

(function initNoirStudioAutoSaveAndUndoModule(globalScope) {
  'use strict';

  const root = globalScope || (typeof window !== 'undefined' ? window : globalThis);
  root.NoirStudio = root.NoirStudio || {};
  const NS = root.NoirStudio;

  // ==========================================================================
  // PHẦN 1: NGĂN XẾP HOÀN TÁC ĐỘC LẬP TỪNG CHƯƠNG (CAREFUL UNDO/REDO RING STACK)
  // ==========================================================================

  const MAX_UNDO_STEPS_PER_CHAPTER = 120;
  const TYPING_COALESCE_WINDOW_MS = 1050;

  class ChapterScopedUndoRedoStack {
    constructor(utilsRef) {
      this.utils = utilsRef;
      this.chapterStacks = new Map();
      this.storageMirrorKey = 'noir_v38_undo_session_backup';
    }

    getOrCreateChapterHistory(chapterId, initialText = '') {
      const id = String(chapterId || 'chap_default');
      if (!this.chapterStacks.has(id)) {
        this.chapterStacks.set(id, {
          undoStack: [
            {
              text: String(initialText || ''),
              selectionStart: 0,
              selectionEnd: 0,
              scrollTop: 0,
              reason: 'Khởi điểm chương',
              ts: Date.now()
            }
          ],
          redoStack: [],
          lastPushAt: 0
        });
      }
      return this.chapterStacks.get(id);
    }

    /**
     * Ghi nhận một mốc thay đổi mới vào ngăn xếp hoàn tác.
     * Nếu tác giả đang gõ liên tục trong khung thời gian 1.05s và `forceAtomic = false`,
     * hệ thống sẽ gộp mượt mà để mỗi lần bấm Ctrl+Z hoàn tác theo từng cụm ý nghĩa.
     */
    recordSnapshot(chapterId, text, options = {}) {
      const {
        forceAtomic = false,
        reason = 'Chỉnh sửa bản thảo',
        selectionStart = 0,
        selectionEnd = 0,
        scrollTop = 0
      } = options;

      const hist = this.getOrCreateChapterHistory(chapterId, text);
      const currentText = String(text ?? '');
      const top = hist.undoStack[hist.undoStack.length - 1];

      if (top && top.text === currentText) {
        return false;
      }

      const now = Date.now();
      const canCoalesce =
        !forceAtomic &&
        top &&
        now - hist.lastPushAt < TYPING_COALESCE_WINDOW_MS &&
        Math.abs(currentText.length - top.text.length) <= 18;

      if (canCoalesce && hist.undoStack.length > 1) {
        top.text = currentText;
        top.selectionStart = selectionStart;
        top.selectionEnd = selectionEnd;
        top.scrollTop = scrollTop;
        top.ts = now;
      } else {
        hist.undoStack.push({
          text: currentText,
          selectionStart,
          selectionEnd,
          scrollTop,
          reason,
          ts: now
        });
        if (hist.undoStack.length > MAX_UNDO_STEPS_PER_CHAPTER) {
          hist.undoStack.shift();
        }
      }

      hist.lastPushAt = now;
      hist.redoStack.length = 0;
      return true;
    }

    canUndo(chapterId) {
      const hist = this.chapterStacks.get(String(chapterId || 'chap_default'));
      return Boolean(hist && hist.undoStack.length > 1);
    }

    canRedo(chapterId) {
      const hist = this.chapterStacks.get(String(chapterId || 'chap_default'));
      return Boolean(hist && hist.redoStack.length > 0);
    }

    performUndo(chapterId) {
      const hist = this.chapterStacks.get(String(chapterId || 'chap_default'));
      if (!hist || hist.undoStack.length <= 1) return null;

      const popped = hist.undoStack.pop();
      hist.redoStack.push(popped);
      const targetState = hist.undoStack[hist.undoStack.length - 1];
      return { ...targetState };
    }

    performRedo(chapterId) {
      const hist = this.chapterStacks.get(String(chapterId || 'chap_default'));
      if (!hist || hist.redoStack.length === 0) return null;

      const restored = hist.redoStack.pop();
      hist.undoStack.push(restored);
      return { ...restored };
    }

    getStackCounts(chapterId) {
      const hist = this.chapterStacks.get(String(chapterId || 'chap_default'));
      if (!hist) return { undoCount: 0, redoCount: 0 };
      return {
        undoCount: Math.max(0, hist.undoStack.length - 1),
        redoCount: hist.redoStack.length
      };
    }

    /**
     * Trả về danh sách các mốc Undo gần nhất kèm thống kê thay đổi chữ (+/- từ)
     * để tác giả xem lại thao tác vừa làm trong phiên viết hiện tại.
     */
    getRecentAuditTimeline(chapterId, limit = 15) {
      const hist = this.chapterStacks.get(String(chapterId || 'chap_default'));
      if (!hist) return [];
      const stack = hist.undoStack;
      const start = Math.max(0, stack.length - limit);
      const list = [];

      for (let i = stack.length - 1; i >= start; i -= 1) {
        const cur = stack[i];
        const prev = i > 0 ? stack[i - 1] : null;
        const deltaChars = prev ? cur.text.length - prev.text.length : cur.text.length;
        list.push({
          stepIndex: i,
          reason: cur.reason || 'Gõ văn bản',
          ts: cur.ts,
          deltaChars,
          totalChars: cur.text.length
        });
      }
      return list;
    }

    clearHistoryForChapter(chapterId) {
      this.chapterStacks.delete(String(chapterId || 'chap_default'));
    }
  }

  // ==========================================================================
  // PHẦN 2: ĐO LƯỜNG TỐC ĐỘ LƯU & ĐÈN BÁO TRẠNG THÁI TRÊN HEADER (STATUS PILL)
  // ==========================================================================

  class SaveStatusIndicatorController {
    constructor(utilsRef) {
      this.utils = utilsRef;
      this.currentState = 'SAVED'; // 'DIRTY' | 'SAVING' | 'SAVED' | 'ERROR'
      this.lastSavedTimestamp = Date.now();
      this.saveTelemetry = {
        totalSavesCount: 0,
        lastLatencyMs: 0,
        avgLatencyMs: 0,
        tier1Ok: true,
        tier2Ok: true,
        tier3Synced: false
      };
    }

    renderStatus(stateMode, customMessage = '') {
      this.currentState = stateMode;
      if (typeof document === 'undefined') return;

      const dot = document.getElementById('fs-status-dot');
      const textEl = document.getElementById('fs-status-text');

      if (stateMode === 'DIRTY') {
        if (dot) {
          dot.className = 'w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0';
        }
        if (textEl) {
          textEl.textContent = customMessage || 'Chưa lưu nháp…';
          textEl.className = 'text-[11px] font-medium text-amber-300 truncate';
        }
        return;
      }

      if (stateMode === 'SAVING') {
        if (dot) {
          dot.className = 'w-2 h-2 rounded-full bg-sky-400 animate-ping shrink-0';
        }
        if (textEl) {
          textEl.textContent = customMessage || 'Đang ghi 3 tầng…';
          textEl.className = 'text-[11px] font-medium text-sky-300 truncate';
        }
        return;
      }

      if (stateMode === 'ERROR') {
        if (dot) {
          dot.className = 'w-2 h-2 rounded-full bg-rose-500 shrink-0';
        }
        if (textEl) {
          textEl.textContent = customMessage || 'Lỗi ghi tạm (RAM vẫn giữ)';
          textEl.className = 'text-[11px] font-medium text-rose-300 truncate';
        }
        return;
      }

      // SAVED
      this.lastSavedTimestamp = Date.now();
      const d = new Date(this.lastSavedTimestamp);
      const hhmmss = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;

      if (dot) {
        dot.className = 'w-2 h-2 rounded-full bg-emerald-400 shrink-0';
      }
      if (textEl) {
        const diskBadge = this.saveTelemetry.tier3Synced ? ' + Ổ cứng' : '';
        textEl.textContent = customMessage || `Đã lưu ${hhmmss}${diskBadge}`;
        textEl.className = 'text-[11px] font-medium text-emerald-300/90 truncate';
      }
    }

    recordTelemetry(latencyMs, tierResults) {
      const t = this.saveTelemetry;
      t.totalSavesCount += 1;
      t.lastLatencyMs = Math.max(1, Math.round(latencyMs));
      t.avgLatencyMs =
        t.totalSavesCount === 1
          ? t.lastLatencyMs
          : Math.round((t.avgLatencyMs * (t.totalSavesCount - 1) + t.lastLatencyMs) / t.totalSavesCount);
      t.tier1Ok = Boolean(tierResults.tier1);
      t.tier2Ok = Boolean(tierResults.tier2);
      t.tier3Synced = Boolean(tierResults.tier3);
    }

    updateUndoRedoButtonsUI(canUndo, canRedo, counts = { undoCount: 0, redoCount: 0 }) {
      if (typeof document === 'undefined') return;
      const undoBtn = document.getElementById('btn-s7-undo');
      const redoBtn = document.getElementById('btn-s7-redo');

      if (undoBtn) {
        undoBtn.disabled = !canUndo;
        undoBtn.style.opacity = canUndo ? '1' : '0.45';
        undoBtn.title = canUndo
          ? `Hoàn tác 1 bước (${counts.undoCount} bước khả dụng • Ctrl+Z)`
          : 'Không có bước nào để hoàn tác';
      }

      if (redoBtn) {
        redoBtn.disabled = !canRedo;
        redoBtn.style.opacity = canRedo ? '1' : '0.45';
        redoBtn.title = canRedo
          ? `Làm lại bước vừa lùi (${counts.redoCount} bước khả dụng • Ctrl+Y)`
          : 'Không có bước nào để làm lại';
      }
    }
  }

  // ==========================================================================
  // PHẦN 3: BỘ ĐIỀU PHỐI LƯU ĐA TẦNG (3-TIER PIPELINE COORDINATOR)
  // ==========================================================================

  class ThreeTierSavePipelineExecutor {
    constructor(autoSaverEngine) {
      this.NS = window.NoirStudio;
      this.engine = autoSaverEngine;
      this.isSavingNow = false;
      this.pendingFollowUpSave = false;
    }

    /**
     * Thực thi chu trình Lưu 3 tầng có Mutex bảo vệ chống ghi đè đua nhau:
     *   - Tầng 1: RAM (`chapterManager.syncEditorToActiveChapter`) + `localStorage` tức thì
     *   - Tầng 2: IndexedDB (`chapters` + Story Bible + Daily Goal Progress)
     *   - Tầng 3: Local FS (`fsEngine`) + Kích hoạt Version Vault Snapshot + WebNovel Daily Goal
     */
    async executePipeline(options = { showToastOnComplete: false, forceVersionCheck: true }) {
      if (this.isSavingNow) {
        this.pendingFollowUpSave = true;
        return false;
      }

      this.isSavingNow = true;
      const startedAt = performance.now();
      this.engine.statusUI.renderStatus('SAVING');
      if (this.NS.state) this.NS.state.isSaving = true;

      const results = { tier1: false, tier2: false, tier3: false };

      try {
        // --- TẦNG 1: ĐỒNG BỘ RAM & LOCALSTORAGE ---
        const cm = this.NS.chapterManager;
        let activeChap = null;
        if (cm && typeof cm.syncEditorToActiveChapter === 'function') {
          activeChap = cm.syncEditorToActiveChapter();
          try {
            localStorage.setItem(
              cm.storageKey || 'noir_studio_chapters_v35',
              JSON.stringify(cm.chapters || [])
            );
            if (this.NS.state?.activeChapterId) {
              localStorage.setItem(
                cm.activeIdKey || 'noir_studio_active_chapter_v35',
                this.NS.state.activeChapterId
              );
            }
            results.tier1 = true;
          } catch (_) {
            results.tier1 = false;
          }
        }

        // Cập nhật đèn báo Crash Sentinel
        if (this.NS.crashSentinel?.recordEmergencyDraftBeacon) {
          this.NS.crashSentinel.recordEmergencyDraftBeacon();
        }

        // --- TẦNG 2: GHI INDEXEDDB ĐA KHO ---
        if (cm && this.NS.idb && typeof this.NS.idb.set === 'function' && cm.chapters) {
          const storeName = this.NS.constants?.STORES?.CHAPTERS || 'chapters';
          if (activeChap) {
            await this.NS.idb.set(storeName, activeChap.id, activeChap);
          }
          results.tier2 = true;
        }

        // --- TẦNG 3: ĐỒNG BỘ Ổ CỨNG & KÍCH HOẠT CHỤP ẢNH PHIÊN BẢN TỰ ĐỘNG ---
        const fsEngine = this.NS.fsEngine;
        if (fsEngine && fsEngine.isConnected() && activeChap && cm?.chapters) {
          const idx = cm.chapters.findIndex((c) => c.id === activeChap.id);
          await fsEngine.syncSingleChapterToDisk(activeChap, Math.max(0, idx));
          results.tier3 = true;
        }

        // Gọi Kho Lưu Trữ Phiên Bản Tab 6 tự động chụp ảnh (nếu có thay đổi chữ đáng kể)
        if (
          options.forceVersionCheck &&
          this.NS.versionVault &&
          typeof this.NS.versionVault.maybeAutoSnapshotOnSave === 'function'
        ) {
          this.NS.versionVault.maybeAutoSnapshotOnSave();
        }

        // Cập nhật Bộ đếm Mục tiêu Số Từ Hôm Nay (Module 25)
        if (
          this.NS.webNovelFeatures &&
          typeof this.NS.webNovelFeatures.updateDailyGoalFromActiveProject === 'function'
        ) {
          this.NS.webNovelFeatures.updateDailyGoalFromActiveProject();
        }

        // Bắn sự kiện CHAPTER_SAVED lên EventBus
        if (this.NS.bus?.emit) {
          const evt = this.NS.constants?.EVENTS?.CHAPTER_SAVED || 'chapter:saved';
          this.NS.bus.emit(evt, {
            chapterId: activeChap?.id || null,
            wordCount: activeChap?.wordCount || 0,
            ts: Date.now()
          });
        }

        if (this.NS.state) {
          this.NS.state.isDirty = false;
          this.NS.state.lastSavedAt = Date.now();
        }

        const latency = performance.now() - startedAt;
        this.engine.statusUI.recordTelemetry(latency, results);
        this.engine.statusUI.renderStatus('SAVED');

        if (options.showToastOnComplete) {
          const msg = results.tier3
            ? `💾 Đã lưu hoàn tất cả 3 tầng (RAM + IndexedDB + Thư mục Ổ cứng) trong ${Math.round(latency)}ms!`
            : `💾 Đã lưu bản thảo an toàn vào Trình duyệt & IndexedDB!`;
          this.engine.utils.showToast(msg, 'success', 2600);
        }

        return true;
      } catch (err) {
        this.engine.statusUI.renderStatus('ERROR', 'Lỗi tạm khi lưu — dữ liệu vẫn nằm trong RAM');
        return false;
      } finally {
        this.isSavingNow = false;
        if (this.NS.state) this.NS.state.isSaving = false;
        if (this.pendingFollowUpSave) {
          this.pendingFollowUpSave = false;
          setTimeout(() => this.executePipeline({ showToastOnComplete: false, forceVersionCheck: false }), 180);
        }
      }
    }
  }

  // ==========================================================================
  // PHẦN 4: GIÁM SÁT NHỊP GÕ CHỮ, TRẠNG THÁI OFFLINE & ĐỒNG HỒ BẢO VỆ 15 GIÂY
  // ==========================================================================

  class TypingBurstAndIdleBoundaryTracker {
    constructor(autoSaverEngine) {
      this.engine = autoSaverEngine;
      this.lastKeystrokeAt = 0;
      this.charsTypedSinceLastSnapshot = 0;
      this.sessionKeystrokes = 0;
      this.sessionStartTimestamp = Date.now();
      this.isOfflineMode =
        typeof navigator !== 'undefined' ? navigator.onLine === false : false;
    }

    onEditorInputDetected(newText, prevTextLength = 0) {
      const now = Date.now();
      const lenDelta = Math.abs((newText || '').length - prevTextLength);
      const elapsedSinceLast = now - this.lastKeystrokeAt;

      this.sessionKeystrokes += 1;
      this.lastKeystrokeAt = now;

      // Nếu là thao tác dán (paste) khối lớn >= 40 ký tự hoặc vừa nghỉ tay > 5 giây,
      // ép lưu một điểm Undo nguyên khối riêng biệt để dễ bấm Ctrl+Z thu hồi ngay.
      const shouldForceAtomic = lenDelta >= 40 || (elapsedSinceLast > 5000 && this.charsTypedSinceLastSnapshot > 0);
      if (shouldForceAtomic) {
        this.charsTypedSinceLastSnapshot = 0;
      } else {
        this.charsTypedSinceLastSnapshot += Math.max(1, lenDelta);
        if (this.charsTypedSinceLastSnapshot >= 140) {
          this.charsTypedSinceLastSnapshot = 0;
        }
      }

      const activeId = this.engine.getActiveChapterId();
      const ta =
        typeof document !== 'undefined'
          ? document.getElementById('textarea-chapter-content')
          : null;

      this.engine.undoStack.recordSnapshot(activeId, newText, {
        forceAtomic: shouldForceAtomic,
        reason: lenDelta >= 40 ? 'Dán đoạn văn mới' : 'Soạn thảo thủ công',
        selectionStart: ta?.selectionStart || 0,
        selectionEnd: ta?.selectionEnd || 0,
        scrollTop: ta?.scrollTop || 0
      });

      this.engine.refreshUndoRedoButtonsForActiveChapter();
    }

    bindOnlineOfflineGuard() {
      if (typeof window === 'undefined' || this._networkBound) return;
      this._networkBound = true;

      window.addEventListener('offline', () => {
        this.isOfflineMode = true;
        this.engine.utils.showToast(
          '✈️ Mất kết nối mạng: Bạn vẫn viết bình thường — mọi chữ vẫn đang lưu an toàn vào IndexedDB & Ổ cứng!',
          'info',
          4500
        );
      });

      window.addEventListener('online', () => {
        if (this.isOfflineMode) {
          this.isOfflineMode = false;
          this.engine.utils.showToast(
            '🌐 Đã có Internet trở lại — các tính năng Gemini AI đã sẵn sàng phục vụ!',
            'success',
            3000
          );
        }
      });
    }

    getSessionWritingVelocityStats() {
      const elapsedMinutes = Math.max(1, (Date.now() - this.sessionStartTimestamp) / 60000);
      const approxKpm = Math.round(this.sessionKeystrokes / elapsedMinutes);
      return {
        sessionKeystrokes: this.sessionKeystrokes,
        elapsedMinutes: Math.round(elapsedMinutes * 10) / 10,
        keystrokesPerMinute: approxKpm,
        isOffline: this.isOfflineMode
      };
    }
  }

  /**
   * Tự động lưu dự phòng theo chu kỳ an toàn 18 giây/lần khi có thay đổi chưa chốt
   * hoặc khi người dùng đột ngột chuyển tab trình duyệt khác.
   */
  class BackgroundHeartbeatAndShortcutBinder {
    constructor(autoSaverEngine) {
      this.NS = window.NoirStudio;
      this.engine = autoSaverEngine;
      this.heartbeatTimer = null;
      this.lastKnownTextLength = 0;
    }

    startPeriodicHeartbeat(intervalMs = 18000) {
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer);
      }
      this.heartbeatTimer = setInterval(() => {
        if (this.NS.state?.isDirty) {
          this.engine.triggerSave(false);
        }
      }, Math.max(5000, intervalMs));
    }

    bindKeyboardShortcutsAndButtons() {
      if (typeof document === 'undefined') return;

      const bindClick = (id, fn) => {
        const el = document.getElementById(id);
        if (!el || el.dataset.mod09Bound) return;
        el.dataset.mod09Bound = '1';
        el.addEventListener('click', fn);
      };

      bindClick('btn-s7-undo', () => this.engine.undo());
      bindClick('btn-s7-redo', () => this.engine.redo());
      bindClick('btn-s7-save-now', () => this.engine.triggerSave(true));

      const ta = document.getElementById('textarea-chapter-content');
      if (ta && !ta.dataset.mod09InputBound) {
        ta.dataset.mod09InputBound = '1';
        this.lastKnownTextLength = (ta.value || '').length;

        ta.addEventListener('input', () => {
          const val = ta.value || '';
          this.engine.burstTracker.onEditorInputDetected(val, this.lastKnownTextLength);
          this.lastKnownTextLength = val.length;
          this.engine.markWorkspaceDirtyAndScheduleSave(2000);
        });

        // Hỗ trợ Ctrl+Z / Ctrl+Y chuẩn xác trên đúng Undo Stack của Studio
        ta.addEventListener('keydown', (evt) => {
          const isMod = evt.ctrlKey || evt.metaKey;
          if (!isMod) return;
          const key = evt.key.toLowerCase();

          if (key === 's') {
            evt.preventDefault();
            this.engine.triggerSave(true);
            return;
          }

          if (key === 'z' && !evt.shiftKey) {
            evt.preventDefault();
            this.engine.undo();
            return;
          }

          if ((key === 'z' && evt.shiftKey) || key === 'y') {
            evt.preventDefault();
            this.engine.redo();
          }
        });
      }

      const titleEl = document.getElementById('input-chapter-title');
      if (titleEl && !titleEl.dataset.mod09TitleBound) {
        titleEl.dataset.mod09TitleBound = '1';
        titleEl.addEventListener('input', () => {
          this.engine.markWorkspaceDirtyAndScheduleSave(1500);
        });
      }

      const beatsEl = document.getElementById('textarea-chapter-beats');
      if (beatsEl && !beatsEl.dataset.mod09BeatsBound) {
        beatsEl.dataset.mod09BeatsBound = '1';
        beatsEl.addEventListener('input', () => {
          this.engine.markWorkspaceDirtyAndScheduleSave(1500);
        });
      }

      // Phím tắt Ctrl+S toàn cục trên mọi Tab
      if (!document.body?.dataset?.mod09GlobalKeysBound) {
        if (document.body) document.body.dataset.mod09GlobalKeysBound = '1';
        document.addEventListener('keydown', (evt) => {
          const isMod = evt.ctrlKey || evt.metaKey;
          if (isMod && evt.key.toLowerCase() === 's') {
            evt.preventDefault();
            this.engine.triggerSave(true);
          }
        });
      }
    }
  }

  // ==========================================================================
  // PHẦN 5: TRÌNH XEM NHẬT KÝ HOÀN TÁC CHUYÊN SÂU & CỨU HỘ ĐỘT NGỘT KHI MỞ WEB
  // ==========================================================================

  class SessionUndoTimelineInspector {
    constructor(autoSaverEngine) {
      this.NS = window.NoirStudio;
      this.engine = autoSaverEngine;
    }

    /**
     * Mở bảng tóm tắt các bước chỉnh sửa gần nhất của chương hiện tại
     * kèm số chữ thêm/bớt tại mỗi bước và nút khôi phục nhanh về mốc bất kỳ.
     */
    openRecentUndoHistoryPopup() {
      if (typeof document === 'undefined') return;
      const existing = document.getElementById('mod09-undo-timeline-popup');
      if (existing) existing.remove();

      const chapId = this.engine.getActiveChapterId();
      const chapTitle =
        this.NS.chapterManager?.getActiveChapter?.()?.displayTitle || 'Chương hiện tại';
      const steps = this.engine.undoStack.getRecentAuditTimeline(chapId, 20);
      const esc = (s) => this.engine.utils.escapeHtml(s);

      const rowsHtml =
        steps.length === 0
          ? '<div class="text-xs text-zinc-500 italic p-4 text-center">Chưa có lịch sử chỉnh sửa nào trong phiên làm việc này.</div>'
          : steps
              .map((st) => {
                const deltaBadge =
                  st.deltaChars > 0
                    ? `<span class="text-emerald-400 font-bold">+${st.deltaChars} ký tự</span>`
                    : st.deltaChars < 0
                      ? `<span class="text-rose-400 font-bold">${st.deltaChars} ký tự</span>`
                      : `<span class="text-zinc-400">0</span>`;
                const timeStr = this.engine.utils.formatTimestampVN(st.ts).split(' • ')[0];

                return `
                  <div class="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/75 text-xs">
                    <div class="min-w-0 flex-1">
                      <div class="font-semibold text-zinc-200 truncate">Bước #${st.stepIndex + 1}: ${esc(st.reason)}</div>
                      <div class="text-[11px] text-zinc-500 mt-0.5">${esc(timeStr)} • Tổng ${st.totalChars.toLocaleString('vi-VN')} ký tự</div>
                    </div>
                    <div class="shrink-0 flex items-center gap-2">
                      <span class="text-[11px]">${deltaBadge}</span>
                      <button type="button" data-jump-step="${st.stepIndex}" class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-emerald-600/30 border border-zinc-700 text-zinc-200 text-[11px] font-semibold transition">Về bước này</button>
                    </div>
                  </div>
                `;
              })
              .join('');

      const overlay = document.createElement('div');
      overlay.id = 'mod09-undo-timeline-popup';
      overlay.className =
        'fixed inset-0 z-[10015] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4';

      overlay.innerHTML = `
        <div class="w-full max-w-xl max-h-[82vh] rounded-2xl border border-zinc-700 bg-zinc-950 flex flex-col overflow-hidden shadow-2xl">
          <div class="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900">
            <div>
              <h3 class="text-sm font-extrabold text-zinc-100">⏱️ Dòng Thời Gian Chỉnh Sửa Trong Phiên (${esc(chapTitle)})</h3>
              <p class="text-[11px] text-zinc-400">Hỗ trợ nhảy lùi nhanh về bất kỳ trạng thái nào khi đang soạn thảo.</p>
            </div>
            <button type="button" id="btn-close-mod09-timeline" class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300">✕</button>
          </div>
          <div class="p-3 overflow-y-auto space-y-2 flex-1">${rowsHtml}</div>
        </div>
      `;

      document.body.appendChild(overlay);
      overlay.querySelector('#btn-close-mod09-timeline')?.addEventListener('click', () => overlay.remove());
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
      });

      overlay.querySelectorAll('[data-jump-step]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const targetIdx = parseInt(btn.getAttribute('data-jump-step'), 10);
          this.jumpToUndoStepIndex(chapId, targetIdx);
          overlay.remove();
        });
      });
    }

    jumpToUndoStepIndex(chapterId, targetStepIndex) {
      const hist = this.engine.undoStack.chapterStacks.get(String(chapterId));
      if (!hist || !hist.undoStack[targetStepIndex]) return false;

      const currentLen = hist.undoStack.length;
      const stepsBack = currentLen - 1 - targetStepIndex;
      if (stepsBack <= 0) return false;

      for (let i = 0; i < stepsBack; i += 1) {
        this.engine.undoStack.performUndo(chapterId);
      }
      const targetState = hist.undoStack[hist.undoStack.length - 1];
      this.engine.applySnapshotToEditorDOM(targetState);
      this.engine.refreshUndoRedoButtonsForActiveChapter();
      this.engine.scheduleDebouncedSave(400);
      this.engine.utils.showToast(`↩️ Đã quay lại bước #${targetStepIndex + 1}!`, 'info');
      return true;
    }
  }

  class StartupCrashDraftRecoveryPrompt {
    constructor(autoSaverEngine) {
      this.NS = window.NoirStudio;
      this.engine = autoSaverEngine;
      this.checkedOnce = false;
    }

    async checkAndOfferCrashRecoveryIfNeeded() {
      if (this.checkedOnce) return false;
      this.checkedOnce = true;

      const sentinel = this.NS.crashSentinel;
      if (!sentinel || typeof sentinel.checkForUnsavedCrashDraftRecovery !== 'function') {
        return false;
      }

      const pending = sentinel.checkForUnsavedCrashDraftRecovery();
      if (!pending || !pending.beacon) return false;

      let accept = false;
      if (typeof this.NS.confirmDialog === 'function') {
        const diffSign = pending.deltaChars > 0 ? `+${pending.deltaChars}` : String(pending.deltaChars);
        accept = await this.NS.confirmDialog({
          title: '🚑 Phát hiện bản viết chưa kịp lưu từ phiên đóng đột ngột!',
          message: `Chương "${pending.chapterTitle}" có bản ghi khẩn cấp (${diffSign} ký tự) lúc ${this.engine.utils.formatTimestampVN(pending.beacon.capturedAt)}.\nBạn có muốn khôi phục lại đoạn chữ đó không?`,
          confirmLabel: 'Khôi phục ngay',
          cancelLabel: 'Giữ bản đang mở'
        });
      }

      if (accept) {
        const cm = this.NS.chapterManager;
        if (cm) {
          cm.selectChapter(pending.chapterId);
          const chap = cm.getActiveChapter();
          if (chap) {
            this.engine.forcePushUndoSnapshot(chap.content || '', 'Trước khi phục hồi bản Crash');
            chap.content = pending.beacon.content;
            if (pending.beacon.beats) chap.beats = pending.beacon.beats;
            if (pending.beacon.title) {
              chap.displayTitle = pending.beacon.title;
              chap.title = pending.beacon.title;
            }
            chap.updatedAt = Date.now();
            cm.loadActiveChapterIntoEditor();
            await this.engine.triggerSave(true);
            this.engine.utils.showToast('💚 Đã khôi phục nguyên vẹn đoạn văn bị ngắt đột ngột!', 'success');
          }
        }
      }

      try {
        localStorage.removeItem(sentinel.beaconKey);
      } catch (_) {
        // Bỏ qua
      }
      return accept;
    }
  }

  // ==========================================================================
  // PHẦN 6: BỘ ĐIỀU KHIỂN ĐỒNG BỘ CHÉO & CHẨN ĐOÁN HIỆU SUẤT LƯU BẢN THẢO
  // ==========================================================================

  class SavePerformanceAndLatencyAuditor {
    constructor(autoSaverEngine) {
      this.NS = window.NoirStudio;
      this.engine = autoSaverEngine;
      this.saveHistoryLog = [];
      this.maxLogSize = 40;
    }

    recordSaveCycleEvent(details) {
      this.saveHistoryLog.unshift({
        ts: Date.now(),
        chapterId: details.chapterId || null,
        wordCount: details.wordCount || 0,
        latencyMs: details.latencyMs || 0,
        tiers: details.tiers || {}
      });
      if (this.saveHistoryLog.length > this.maxLogSize) {
        this.saveHistoryLog.length = this.maxLogSize;
      }
    }

    buildDiagnosticReport() {
      const t = this.engine.statusUI.saveTelemetry;
      const v = this.engine.burstTracker.getSessionWritingVelocityStats();
      const activeId = this.engine.getActiveChapterId();
      const stackCounts = this.engine.undoStack.getStackCounts(activeId);

      return {
        currentStatus: this.engine.statusUI.currentState,
        lastSavedAtHuman: this.engine.utils.formatTimestampVN(
          this.engine.statusUI.lastSavedTimestamp
        ),
        totalSavesCount: t.totalSavesCount,
        avgLatencyMs: t.avgLatencyMs,
        lastLatencyMs: t.lastLatencyMs,
        tier1LocalStorage: t.tier1Ok,
        tier2IndexedDB: t.tier2Ok,
        tier3LocalDisk: t.tier3Synced,
        undoAvailableSteps: stackCounts.undoCount,
        redoAvailableSteps: stackCounts.redoCount,
        sessionVelocity: v,
        recentSaves: this.saveHistoryLog.slice(0, 8)
      };
    }

    /**
     * Đồng bộ ngay lập tức các vùng ghi chú phụ trợ khác (Scratchpad, Settings)
     * mỗi khi tác giả nhấn Lưu thủ công (`Ctrl+S` hoặc nút Lưu Ngay).
     */
    flushAuxiliaryScratchpadAndSettings() {
      try {
        if (typeof document === 'undefined') return;
        const scratchEl = document.getElementById('textarea-quick-scratchpad');
        if (scratchEl && scratchEl.value !== undefined) {
          localStorage.setItem(
            this.NS.constants?.STORAGE_KEYS?.SCRATCHPAD || 'noir_quick_scratchpad_notes',
            scratchEl.value
          );
        }
      } catch (_) {
        // Bỏ qua
      }
    }
  }

  class MultiModuleSaveEventBridge {
    constructor(autoSaverEngine) {
      this.NS = window.NoirStudio;
      this.engine = autoSaverEngine;
      this._subscribed = false;
    }

    bindEventBusListeners() {
      if (this._subscribed || !this.NS.bus || typeof this.NS.bus.on !== 'function') {
        return;
      }
      this._subscribed = true;

      const events = this.NS.constants?.EVENTS || {};
      const chapSelectEvt = events.CHAPTER_SELECTED || 'chapter:selected';
      const diffAcceptEvt = events.AI_DIFF_SEGMENT_ACCEPTED || 'aidiff:segment_accepted';
      const diffAllAcceptEvt = events.AI_DIFF_ALL_ACCEPTED || 'aidiff:all_accepted';

      this.NS.bus.on(chapSelectEvt, (payload) => {
        const chapId = payload?.chapterId || this.engine.getActiveChapterId();
        const content =
          payload?.chapter?.content ??
          document.getElementById('textarea-chapter-content')?.value ??
          '';
        this.engine.undoStack.getOrCreateChapterHistory(chapId, content);
        this.engine.heartbeatBinder.lastKnownTextLength = String(content || '').length;
        this.engine.refreshUndoRedoButtonsForActiveChapter();
      });

      const handleExternalContentMutation = (label) => {
        const ta = document.getElementById('textarea-chapter-content');
        if (!ta) return;
        this.engine.forcePushUndoSnapshot(ta.value || '', label);
        this.engine.heartbeatBinder.lastKnownTextLength = (ta.value || '').length;
        this.engine.scheduleDebouncedSave(500);
      };

      this.NS.bus.on(diffAcceptEvt, () =>
        handleExternalContentMutation('Chấp nhận 1 đoạn AI Diff')
      );
      this.NS.bus.on(diffAllAcceptEvt, () =>
        handleExternalContentMutation('Chấp nhận toàn bộ AI Diff')
      );
    }
  }

  // ==========================================================================
  // PHẦN 7A: ĐỒNG BỘ NGĂN XẾP HOÀN TÁC QUA INDEXEDDB (PERSISTENT UNDO BRIDGE)
  // ==========================================================================

  class PersistentUndoCheckpointStore {
    constructor(autoSaverEngine) {
      this.NS = window.NoirStudio;
      this.engine = autoSaverEngine;
      this.storeKeyPrefix = 'undo_checkpoints::';
    }

    async saveRecentUndoTailForChapter(chapterId) {
      if (!chapterId || !this.NS.idb || typeof this.NS.idb.set !== 'function') {
        return false;
      }
      const hist = this.engine.undoStack.chapterStacks.get(String(chapterId));
      if (!hist || !Array.isArray(hist.undoStack) || hist.undoStack.length <= 1) {
        return false;
      }

      const compactTail = hist.undoStack.slice(-12).map((entry) => ({
        text: entry.text,
        selectionStart: entry.selectionStart || 0,
        selectionEnd: entry.selectionEnd || 0,
        scrollTop: entry.scrollTop || 0,
        reason: entry.reason || 'Lưu tự động',
        ts: entry.ts || Date.now()
      }));

      try {
        const storeName = this.NS.constants?.STORES?.STATE_CACHE || 'state_cache';
        await this.NS.idb.set(storeName, `${this.storeKeyPrefix}${chapterId}`, {
          chapterId,
          savedAt: Date.now(),
          tail: compactTail
        });
        return true;
      } catch (_) {
        return false;
      }
    }

    async restoreUndoTailIfStackEmpty(chapterId, currentLiveText) {
      if (!chapterId || !this.NS.idb || typeof this.NS.idb.get !== 'function') {
        return false;
      }
      const existingHist = this.engine.undoStack.chapterStacks.get(String(chapterId));
      if (existingHist && existingHist.undoStack.length > 2) return false;

      try {
        const storeName = this.NS.constants?.STORES?.STATE_CACHE || 'state_cache';
        const stored = await this.NS.idb.get(storeName, `${this.storeKeyPrefix}${chapterId}`, null);
        if (!stored || !Array.isArray(stored.tail) || stored.tail.length === 0) {
          return false;
        }

        const sanitized = stored.tail.filter((it) => it && typeof it.text === 'string');
        if (sanitized.length === 0) return false;

        const live = String(currentLiveText || '');
        if (sanitized[sanitized.length - 1].text !== live) {
          sanitized.push({
            text: live,
            selectionStart: 0,
            selectionEnd: 0,
            scrollTop: 0,
            reason: 'Bản đang mở hiện tại',
            ts: Date.now()
          });
        }

        this.engine.undoStack.chapterStacks.set(String(chapterId), {
          undoStack: sanitized,
          redoStack: [],
          lastPushAt: Date.now()
        });
        this.engine.refreshUndoRedoButtonsForActiveChapter();
        return true;
      } catch (_) {
        return false;
      }
    }
  }

  /**
   * Trình kiểm tra chẩn đoán nhanh trạng thái Lưu & Hoàn tác qua Toast / Modal nhỏ
   */
  class SaveHealthPopupViewer {
    constructor(autoSaverEngine) {
      this.engine = autoSaverEngine;
    }

    openSaveDiagnosticsModal() {
      if (typeof document === 'undefined') return;
      const existing = document.getElementById('mod09-save-health-modal');
      if (existing) existing.remove();

      const rep = this.engine.perfAuditor.buildDiagnosticReport();
      const esc = (s) => this.engine.utils.escapeHtml(s);

      const overlay = document.createElement('div');
      overlay.id = 'mod09-save-health-modal';
      overlay.className =
        'fixed inset-0 z-[10018] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4';

      overlay.innerHTML = `
        <div class="w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-950 p-5 space-y-4 shadow-2xl">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <h3 class="text-sm font-extrabold text-emerald-300">🩺 Sức Khỏe Hệ Thống Tự Lưu 3 Tầng</h3>
            <button type="button" id="btn-close-mod09-health" class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200">✕ Đóng</button>
          </div>
          <div class="grid grid-cols-2 gap-2.5 text-xs">
            <div class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80">
              <div class="text-zinc-400 text-[11px]">Lần lưu cuối</div>
              <div class="font-bold text-zinc-100 mt-0.5">${esc(rep.lastSavedAtHuman)}</div>
            </div>
            <div class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80">
              <div class="text-zinc-400 text-[11px]">Tốc độ ghi trung bình</div>
              <div class="font-bold text-emerald-300 mt-0.5">${rep.avgLatencyMs} ms (${rep.totalSavesCount} lượt)</div>
            </div>
            <div class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80">
              <div class="text-zinc-400 text-[11px]">Tầng 1 (LocalStorage) & Tầng 2 (IDB)</div>
              <div class="font-bold text-zinc-100 mt-0.5">${rep.tier1LocalStorage && rep.tier2IndexedDB ? '🟢 Hoạt động 100%' : '🟡 Chế độ dự phòng'}</div>
            </div>
            <div class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80">
              <div class="text-zinc-400 text-[11px]">Tầng 3 (Thư mục Ổ cứng)</div>
              <div class="font-bold text-zinc-100 mt-0.5">${rep.tier3LocalDisk ? '📂 Đang đồng bộ thật' : '⚪ Chưa nối ổ cứng'}</div>
            </div>
          </div>
          <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800">
            <button type="button" id="btn-mod09-open-undo-timeline" class="px-3 py-1.5 rounded-xl bg-indigo-600/25 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-200 text-xs font-bold">
              ⏱️ Dòng Thời Gian Undo (${rep.undoAvailableSteps})
            </button>
            <button type="button" id="btn-mod09-open-recycle-bin" class="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/40 text-amber-200 text-xs font-bold">
              ♻️ Đoạn Lỡ Xóa (${this.engine.deletedCatcher?.caughtClips?.length || 0})
            </button>
            <button type="button" id="btn-mod09-force-save-now" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold">
              💾 Lưu 3 Tầng Ngay
            </button>
          </div>
          <div class="pt-2 border-t border-zinc-800/70 flex items-center justify-between text-[11px] text-zinc-400">
            <span>🛡️ Bảo vệ bởi Zero-Reload Save Shield</span>
            <span id="mod09-health-author-credit" class="font-bold text-indigo-300">✍️ Tác giả web: <strong class="text-white">Mai Hải Đăng</strong></span>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);
      overlay.querySelector('#btn-close-mod09-health')?.addEventListener('click', () => overlay.remove());
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
      });
      overlay.querySelector('#btn-mod09-open-undo-timeline')?.addEventListener('click', () => {
        overlay.remove();
        this.engine.timelineInspector.openRecentUndoHistoryPopup();
      });
      overlay.querySelector('#btn-mod09-open-recycle-bin')?.addEventListener('click', () => {
        overlay.remove();
        this.engine.recycleModal?.openModal();
      });
      overlay.querySelector('#btn-mod09-force-save-now')?.addEventListener('click', async () => {
        await this.engine.triggerSave(true);
        overlay.remove();
      });
    }
  }

  // ==========================================================================
  // PHẦN 7B: BỘ LỌC DÁN VĂN BẢN SẠCH, TỰ ĐỘNG ĐIỀU CHỈNH NHỊP LƯU & THỐNG KÊ PHIÊN
  // ==========================================================================

  class ClipboardSanitizeAndPasteGuard {
    constructor(autoSaverEngine) {
      this.NS = window.NoirStudio;
      this.engine = autoSaverEngine;
      this._bound = false;
    }

    /**
     * Khi tác giả dán văn bản dài từ Word, Web hoặc Chat AI vào `#textarea-chapter-content`:
     *   1. Chụp ngay một điểm Undo trước khi dán.
     *   2. Tự động gọt bỏ ký tự vô hình (`\u200B`, `\uFEFF`), khoảng trắng NBSP thừa,
     *      và chuẩn hóa dấu đầu dòng `- Thoại` gọn gàng.
     */
    bindPasteSanitizerOnEditor() {
      if (this._bound || typeof document === 'undefined') return;
      const ta = document.getElementById('textarea-chapter-content');
      if (!ta || ta.dataset.mod09PasteBound) return;
      ta.dataset.mod09PasteBound = '1';
      this._bound = true;

      ta.addEventListener('paste', (evt) => {
        const clip = evt.clipboardData?.getData('text/plain');
        if (!clip || clip.length < 25) return;

        const normalized = this.NS.utils?.nlp?.sanitizePastedManuscriptText
          ? this.NS.utils.nlp.sanitizePastedManuscriptText(clip)
          : clip.replace(/\u200B|\uFEFF/g, '').replace(/\u00A0/g, ' ');

        // Chỉ can thiệp nhẹ nếu phát hiện ký tự lỗi hoặc ngắt dòng quá thưa
        if (normalized !== clip) {
          evt.preventDefault();
          this.engine.forcePushUndoSnapshot(ta.value || '', 'Trước khi dán văn bản sạch');
          if (this.NS.cursorToolkit?.insertTextAtCursor) {
            this.NS.cursorToolkit.insertTextAtCursor(ta, normalized);
          } else {
            const start = ta.selectionStart || 0;
            const end = ta.selectionEnd || 0;
            ta.value = ta.value.slice(0, start) + normalized + ta.value.slice(end);
            ta.dispatchEvent(new Event('input', { bubbles: true }));
          }
          this.engine.utils.showToast('✨ Đã tự động lọc sạch ký tự thừa khi dán văn bản!', 'info', 2200);
        } else {
          this.engine.forcePushUndoSnapshot(ta.value || '', 'Trước khi dán đoạn mới');
        }
      });
    }
  }

  class AdaptiveSaveDebounceCalibrator {
    /**
     * Điều chỉnh độ trễ lưu thông minh theo dung lượng chương:
     * Chương bình thường (< 5000 từ) -> lưu nhanh 1.2 giây;
     * Chương cực dài (> 12000 từ) -> giãn nhẹ lên 2.1 giây để tránh lag trên điện thoại yếu.
     */
    computeRecommendedDebounceMs(textLengthChars, requestedMs = null) {
      if (typeof requestedMs === 'number' && requestedMs >= 200) {
        return requestedMs;
      }
      const len = Number(textLengthChars) || 0;
      if (len < 12000) return 1100;
      if (len < 35000) return 1500;
      if (len < 80000) return 1900;
      return 2300;
    }
  }

  class SessionManuscriptDeltaTracker {
    constructor(utilsRef) {
      this.utils = utilsRef;
      this.baselineByChapter = new Map();
      this.celebratedMilestones = new Set();
    }

    registerChapterBaselineIfMissing(chapterId, text) {
      const id = String(chapterId || 'chap_default');
      if (!this.baselineByChapter.has(id)) {
        this.baselineByChapter.set(id, this.utils.countVietnameseWords(text || ''));
      }
    }

    evaluateNetDeltaAndCelebrate(chapterId, text) {
      const id = String(chapterId || 'chap_default');
      const currentWords = this.utils.countVietnameseWords(text || '');
      if (!this.baselineByChapter.has(id)) {
        this.baselineByChapter.set(id, currentWords);
        return { baselineWords: currentWords, currentWords, netDeltaWords: 0 };
      }

      const base = this.baselineByChapter.get(id);
      const net = currentWords - base;
      const milestones = [500, 1000, 2000, 3000, 5000];
      for (let i = 0; i < milestones.length; i += 1) {
        const m = milestones[i];
        const key = `${id}::${m}`;
        if (net >= m && !this.celebratedMilestones.has(key)) {
          this.celebratedMilestones.add(key);
          this.utils.showToast(
            `🎉 Tuyệt vời! Bạn vừa viết thêm +${m.toLocaleString('vi-VN')} từ mới trong chương này!`,
            'success',
            3800
          );
          break;
        }
      }

      return { baselineWords: base, currentWords, netDeltaWords: net };
    }
  }

  // ==========================================================================
  // PHẦN 8: LỚP CHỦ QUẢN TỰ LƯU 3 TẦNG & HOÀN TÁC (`window.NoirStudio.autoSaver`)
  // ==========================================================================

  class ThreeTierAutoSaveAndUndoEngine {
    constructor() {
      this.NS = window.NoirStudio;
      this.debounceTimer = null;
      this.initialized = false;

      this.undoStack = new ChapterScopedUndoRedoStack(this.utils);
      this.statusUI = new SaveStatusIndicatorController(this.utils);
      this.pipeline = new ThreeTierSavePipelineExecutor(this);
      this.burstTracker = new TypingBurstAndIdleBoundaryTracker(this);
      this.heartbeatBinder = new BackgroundHeartbeatAndShortcutBinder(this);
      this.timelineInspector = new SessionUndoTimelineInspector(this);
      this.crashRecovery = new StartupCrashDraftRecoveryPrompt(this);
      this.perfAuditor = new SavePerformanceAndLatencyAuditor(this);
      this.eventBridge = new MultiModuleSaveEventBridge(this);
      this.persistentUndo = new PersistentUndoCheckpointStore(this);
      this.healthViewer = new SaveHealthPopupViewer(this);
      this.pasteGuard = new ClipboardSanitizeAndPasteGuard(this);
      this.debounceCalibrator = new AdaptiveSaveDebounceCalibrator();
      this.deltaTracker = new SessionManuscriptDeltaTracker(this.utils);
    }

    get utils() {
      return (
        this.NS.utils || {
          escapeHtml: (s) => String(s ?? ''),
          countVietnameseWords: (t) =>
            String(t || '').trim() ? String(t).trim().split(/\s+/).length : 0,
          formatTimestampVN: (t) => new Date(t || Date.now()).toLocaleString('vi-VN'),
          showToast: () => {}
        }
      );
    }

    getActiveChapterId() {
      if (this.NS.chapterManager?.getActiveChapter) {
        const chap = this.NS.chapterManager.getActiveChapter();
        if (chap && chap.id) return chap.id;
      }
      return this.NS.state?.activeChapterId || 'chap_default_001';
    }

    /**
     * Đẩy một mốc Undo nguyên khối ngay lập tức (thường gọi trước khi AI chèn chữ,
     * trước khi Chỉnh thoại hoặc trước khi Khôi phục phiên bản).
     */
    forcePushUndoSnapshot(text, reason = 'Điểm an toàn trước thay đổi') {
      const chapId = this.getActiveChapterId();
      const ta =
        typeof document !== 'undefined'
          ? document.getElementById('textarea-chapter-content')
          : null;
      const val = typeof text === 'string' ? text : ta?.value || '';

      const pushed = this.undoStack.recordSnapshot(chapId, val, {
        forceAtomic: true,
        reason,
        selectionStart: ta?.selectionStart || 0,
        selectionEnd: ta?.selectionEnd || 0,
        scrollTop: ta?.scrollTop || 0
      });

      this.refreshUndoRedoButtonsForActiveChapter();
      return pushed;
    }

    applySnapshotToEditorDOM(snapState) {
      if (!snapState || typeof document === 'undefined') return;
      const ta = document.getElementById('textarea-chapter-content');
      if (!ta) return;

      ta.value = snapState.text;
      try {
        ta.focus();
        const s = Math.min(snapState.selectionStart || 0, ta.value.length);
        const e = Math.min(snapState.selectionEnd || 0, ta.value.length);
        ta.setSelectionRange(s, e);
        if (typeof snapState.scrollTop === 'number') {
          ta.scrollTop = snapState.scrollTop;
        }
      } catch (_) {
        // Bỏ qua
      }

      if (this.NS.chapterManager?.syncEditorToActiveChapter) {
        this.NS.chapterManager.syncEditorToActiveChapter();
      }
      if (this.NS.chapterManager?.updateLiveWordStatsUI) {
        this.NS.chapterManager.updateLiveWordStatsUI(snapState.text);
      }
    }

    /**
     * Hoàn tác 1 bước cho đúng chương hiện tại đang mở trên Tab 1
     */
    undo() {
      const chapId = this.getActiveChapterId();
      const prev = this.undoStack.performUndo(chapId);
      if (!prev) {
        this.utils.showToast('ℹ️ Đã quay về điểm khởi đầu của chương trong phiên này.', 'info', 2000);
        this.refreshUndoRedoButtonsForActiveChapter();
        return false;
      }

      this.applySnapshotToEditorDOM(prev);
      this.refreshUndoRedoButtonsForActiveChapter();
      this.markWorkspaceDirtyAndScheduleSave(600);

      if (this.NS.bus?.emit) {
        this.NS.bus.emit(this.NS.constants?.EVENTS?.UNDO_PERFORMED || 'history:undo', {
          chapterId: chapId
        });
      }
      return true;
    }

    /**
     * Làm lại bước vừa hoàn tác cho chương hiện tại
     */
    redo() {
      const chapId = this.getActiveChapterId();
      const next = this.undoStack.performRedo(chapId);
      if (!next) {
        this.utils.showToast('ℹ️ Không còn thao tác nào để làm lại.', 'info', 2000);
        this.refreshUndoRedoButtonsForActiveChapter();
        return false;
      }

      this.applySnapshotToEditorDOM(next);
      this.refreshUndoRedoButtonsForActiveChapter();
      this.markWorkspaceDirtyAndScheduleSave(600);

      if (this.NS.bus?.emit) {
        this.NS.bus.emit(this.NS.constants?.EVENTS?.REDO_PERFORMED || 'history:redo', {
          chapterId: chapId
        });
      }
      return true;
    }

    refreshUndoRedoButtonsForActiveChapter() {
      const chapId = this.getActiveChapterId();
      const canUndo = this.undoStack.canUndo(chapId);
      const canRedo = this.undoStack.canRedo(chapId);
      const counts = this.undoStack.getStackCounts(chapId);
      this.statusUI.updateUndoRedoButtonsUI(canUndo, canRedo, counts);
    }

    markWorkspaceDirtyAndScheduleSave(customMs = null) {
      if (this.NS.state) {
        this.NS.state.isDirty = true;
      }
      this.statusUI.renderStatus('DIRTY');
      this.scheduleDebouncedSave(customMs);
    }

    scheduleDebouncedSave(customMs = null) {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      const taLen =
        typeof document !== 'undefined'
          ? (document.getElementById('textarea-chapter-content')?.value || '').length
          : 0;
      const delayMs = this.debounceCalibrator.computeRecommendedDebounceMs(taLen, customMs);

      this.debounceTimer = setTimeout(() => {
        this.debounceTimer = null;
        this.triggerSave(false);
      }, delayMs);
    }

    async triggerSave(showToast = false) {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = null;
      }

      this.perfAuditor.flushAuxiliaryScratchpadAndSettings();
      const tStart = performance.now();
      const ok = await this.pipeline.executePipeline({
        showToastOnComplete: Boolean(showToast),
        forceVersionCheck: true
      });
      const latency = Math.round(performance.now() - tStart);

      const chapId = this.getActiveChapterId();
      const active = this.NS.chapterManager?.getActiveChapter?.();
      this.perfAuditor.recordSaveCycleEvent({
        chapterId: chapId,
        wordCount: active?.wordCount || 0,
        latencyMs: latency,
        tiers: {
          ls: this.statusUI.saveTelemetry.tier1Ok,
          idb: this.statusUI.saveTelemetry.tier2Ok,
          fs: this.statusUI.saveTelemetry.tier3Synced
        }
      });

      if (ok && active) {
        this.deltaTracker.evaluateNetDeltaAndCelebrate(chapId, active.content || '');
        this.persistentUndo.saveRecentUndoTailForChapter(chapId);
      }

      return ok;
    }

    bindStatusPillHealthModalTrigger() {
      if (typeof document === 'undefined') return;
      const statusText = document.getElementById('fs-status-text');
      const statusDot = document.getElementById('fs-status-dot');
      const parentPill = statusText?.parentElement || statusDot?.parentElement;
      if (parentPill && !parentPill.dataset.mod09HealthClick) {
        parentPill.dataset.mod09HealthClick = '1';
        parentPill.style.cursor = 'pointer';
        parentPill.title = 'Nhấn để xem Chi tiết Hệ thống Tự Lưu 3 Tầng & Dòng thời gian Undo';
        parentPill.addEventListener('click', () => {
          this.healthViewer.openSaveDiagnosticsModal();
        });
      }
    }

    async init() {
      if (this.initialized) return this;
      this.initialized = true;

      this.heartbeatBinder.bindKeyboardShortcutsAndButtons();
      this.pasteGuard.bindPasteSanitizerOnEditor();
      this.burstTracker.bindOnlineOfflineGuard();
      this.eventBridge.bindEventBusListeners();
      this.bindStatusPillHealthModalTrigger();
      this.heartbeatBinder.startPeriodicHeartbeat(18000);

      const chapId = this.getActiveChapterId();
      const initialContent =
        typeof document !== 'undefined'
          ? document.getElementById('textarea-chapter-content')?.value || ''
          : '';

      this.undoStack.getOrCreateChapterHistory(chapId, initialContent);
      this.deltaTracker.registerChapterBaselineIfMissing(chapId, initialContent);
      await this.persistentUndo.restoreUndoTailIfStackEmpty(chapId, initialContent);
      this.refreshUndoRedoButtonsForActiveChapter();
      this.statusUI.renderStatus('SAVED');

      // Kiểm tra bản crash đột ngột từ lần đóng trước (chạy sau 700ms để không cản giao diện boot)
      setTimeout(() => {
        this.crashRecovery.checkAndOfferCrashRecoveryIfNeeded();
      }, 700);

      return this;
    }
  }

  // ==========================================================================
  // PHẦN 9: THÙNG RÁC ĐOẠN VĂN LỠ XÓA NHẦM (ACCIDENTAL DELETE CATCHER)
  // ==========================================================================

  class DeletedParagraphEmergencyCatcher {
    constructor(autoSaverEngine) {
      this.NS = window.NoirStudio;
      this.engine = autoSaverEngine;
      this.storageKey = 'noir_v38_deleted_paragraphs_catcher';
      this.maxCaughtItems = 35;
      this.caughtClips = this.loadClips();
    }

    loadClips() {
      try {
        const raw = localStorage.getItem(this.storageKey);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
      } catch (_) {
        return [];
      }
    }

    saveClips() {
      try {
        localStorage.setItem(
          this.storageKey,
          JSON.stringify(this.caughtClips.slice(0, this.maxCaughtItems))
        );
      } catch (_) {
        // Bỏ qua nếu đầy localStorage
      }
    }

    /**
     * Khi phát hiện độ dài văn bản vừa giảm đột ngột >= 65 ký tự trong một thao tác,
     * tìm đoạn văn bị mất trong bản trước và lưu lại ngay lập tức vào Két Thu Hồi.
     */
    inspectTextReductionAndCatch(prevText, nextText, chapterTitle) {
      const oldStr = String(prevText || '');
      const newStr = String(nextText || '');
      if (oldStr.length - newStr.length < 65) return null;

      const oldParas = oldStr
        .split(/\n+/)
        .map((p) => p.trim())
        .filter((p) => p.length >= 25);
      const newSet = new Set(
        newStr
          .split(/\n+/)
          .map((p) => p.trim())
          .filter(Boolean)
      );

      const vanished = oldParas.filter((p) => !newSet.has(p));
      if (vanished.length === 0) {
        const fallbackExcerpt = oldStr.slice(0, 600);
        if (!fallbackExcerpt.trim()) return null;
        return this.recordVanishedClip(fallbackExcerpt, chapterTitle);
      }

      const combinedSnippet = vanished.slice(0, 6).join('\n\n');
      return this.recordVanishedClip(combinedSnippet, chapterTitle);
    }

    recordVanishedClip(snippet, chapterTitle) {
      const trimmed = String(snippet || '').trim();
      if (!trimmed) return null;
      if (this.caughtClips[0]?.text === trimmed) return null;

      const entry = {
        id: `clip_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        chapterTitle: String(chapterTitle || 'Chương chưa rõ'),
        text: trimmed.slice(0, 4500),
        wordCount: this.engine.utils.countVietnameseWords(trimmed),
        deletedAt: Date.now()
      };

      this.caughtClips.unshift(entry);
      if (this.caughtClips.length > this.maxCaughtItems) {
        this.caughtClips.length = this.maxCaughtItems;
      }
      this.saveClips();
      return entry;
    }

    reinsertClipAtCursorInTab1(clipId) {
      const clip = this.caughtClips.find((c) => c.id === clipId);
      const ta =
        typeof document !== 'undefined'
          ? document.getElementById('textarea-chapter-content')
          : null;
      if (!clip || !ta) return false;

      this.engine.forcePushUndoSnapshot(ta.value || '', 'Trước khi dán lại đoạn lỡ xóa');
      if (this.NS.cursorToolkit?.insertTextAtCursor) {
        this.NS.cursorToolkit.insertTextAtCursor(ta, clip.text, {
          ensureNewlineBefore: true,
          ensureNewlineAfter: true
        });
      } else {
        ta.value = `${ta.value.trimEnd()}\n\n${clip.text}\n`;
        ta.dispatchEvent(new Event('input', { bubbles: true }));
      }
      this.engine.utils.showToast('♻️ Đã phục hồi đoạn văn lỡ xóa vào vị trí con trỏ Tab 1!', 'success');
      return true;
    }

    getAllCaughtClips() {
      return this.caughtClips;
    }
  }

  // ==========================================================================
  // PHẦN 10: THỐNG KÊ KHUNG GIỜ VÀNG SÁNG TÁC THEO NGÀY (HOURLY PRODUCTIVITY)
  // ==========================================================================

  class DailyHourlyWritingHeatmapTracker {
    constructor(autoSaverEngine) {
      this.engine = autoSaverEngine;
      this.storageKey = 'noir_v38_hourly_writing_stats';
      this.hourlyBuckets = this.loadBuckets();
    }

    loadBuckets() {
      try {
        const raw = localStorage.getItem(this.storageKey);
        const parsed = raw ? JSON.parse(raw) : null;
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed.hours)) {
          return parsed;
        }
      } catch (_) {
        // Fallback khởi tạo 24 giờ
      }
      return {
        hours: Array.from({ length: 24 }, (_, h) => ({ hour: h, keystrokes: 0, netWords: 0 })),
        updatedAt: Date.now()
      };
    }

    saveBuckets() {
      try {
        this.hourlyBuckets.updatedAt = Date.now();
        localStorage.setItem(this.storageKey, JSON.stringify(this.hourlyBuckets));
      } catch (_) {
        // Bỏ qua
      }
    }

    recordWritingActivity(keystrokesDelta = 1, netWordsDelta = 0) {
      const hour = new Date().getHours();
      const bucket = this.hourlyBuckets.hours[hour];
      if (!bucket) return;
      bucket.keystrokes += Math.max(0, Number(keystrokesDelta) || 0);
      if (netWordsDelta > 0) {
        bucket.netWords += Number(netWordsDelta);
      }
      if (bucket.keystrokes % 30 === 0 || netWordsDelta >= 15) {
        this.saveBuckets();
      }
    }

    getPeakCreativeHoursSummary() {
      const sorted = [...this.hourlyBuckets.hours]
        .filter((b) => b.keystrokes > 0 || b.netWords > 0)
        .sort((a, b) => b.netWords * 5 + b.keystrokes - (a.netWords * 5 + a.keystrokes));

      if (sorted.length === 0) {
        return 'Hãy viết thêm để hệ thống tìm ra khung giờ sáng tác sung sức nhất của bạn!';
      }
      const best = sorted[0];
      return `🌟 Khung giờ vàng của bạn: ${String(best.hour).padStart(2, '0')}:00–${String(
        (best.hour + 1) % 24
      ).padStart(2, '0')}:00 (đạt ${best.netWords.toLocaleString('vi-VN')} từ / ${best.keystrokes.toLocaleString('vi-VN')} nhịp phím).`;
    }
  }

  /**
   * Trình bảo vệ khóa đóng tab khẩn cấp khi đang có tiến trình ghi đĩa chưa hoàn tất
   */
  class SafeUnloadDirtyWarningGuard {
    constructor(autoSaverEngine) {
      this.NS = window.NoirStudio;
      this.engine = autoSaverEngine;
      this._attached = false;
    }

    attachBeforeUnloadFlush() {
      if (this._attached || typeof window === 'undefined') return;
      this._attached = true;

      window.addEventListener('beforeunload', () => {
        if (this.NS.state?.isDirty) {
          this.engine.pipeline?.executePipeline({
            showToastOnComplete: false,
            forceVersionCheck: false
          });
        }
        this.engine.hourlyTracker?.saveBuckets();
      });
    }
  }

  // ==========================================================================
  // PHẦN 11: HỘP THOẠI KHÔI PHỤC ĐOẠN VĂN ĐÃ XÓA & BIỂU ĐỒ GIỜ VÀNG SÁNG TÁC
  // ==========================================================================

  class RecycleBinAndProductivityModal {
    constructor(autoSaverEngine) {
      this.NS = window.NoirStudio;
      this.engine = autoSaverEngine;
    }

    openModal() {
      if (typeof document === 'undefined') return;
      const existing = document.getElementById('mod09-recycle-bin-modal');
      if (existing) existing.remove();

      const clips = this.engine.deletedCatcher?.getAllCaughtClips() || [];
      const esc = (s) => this.engine.utils.escapeHtml(s);
      const peakText = this.engine.hourlyTracker?.getPeakCreativeHoursSummary() || '';

      const hours = this.engine.hourlyTracker?.hourlyBuckets?.hours || [];
      const maxK = Math.max(1, ...hours.map((h) => h.keystrokes + h.netWords * 4));
      const barsHtml = hours
        .map((h) => {
          const val = h.keystrokes + h.netWords * 4;
          const heightPct = Math.max(4, Math.round((val / maxK) * 100));
          const highlight = val > 0 ? 'bg-emerald-500/80' : 'bg-zinc-800';
          return `
            <div class="flex flex-col items-center gap-0.5 flex-1" title="${String(h.hour).padStart(2, '0')}h: ${h.keystrokes} phím">
              <div class="w-full h-12 flex items-end">
                <div class="w-full rounded-t ${highlight}" style="height:${heightPct}%"></div>
              </div>
              <span class="text-[9px] text-zinc-500 font-mono">${h.hour % 3 === 0 ? h.hour : ''}</span>
            </div>
          `;
        })
        .join('');

      const clipsHtml =
        clips.length === 0
          ? `<div class="p-6 text-center rounded-xl border border-dashed border-zinc-800 text-xs text-zinc-500">
               Thùng thu hồi đang sạch — chưa ghi nhận cú xóa khối nào >= 65 ký tự.
             </div>`
          : clips
              .map(
                (clip) => `
              <div class="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3 space-y-2 text-xs">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span class="font-bold text-amber-300">${esc(clip.chapterTitle)}</span>
                    <span class="text-[11px] text-zinc-500 ml-2">${clip.wordCount} từ • ${esc(
                      this.engine.utils.formatRelativeTimeVN(clip.deletedAt)
                    )}</span>
                  </div>
                  <button type="button" data-restore-clip="${esc(clip.id)}" class="px-2.5 py-1 rounded-lg bg-emerald-600/25 hover:bg-emerald-600/45 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold transition">
                    ♻️ Dán Lại Vào Con Trỏ
                  </button>
                </div>
                <div class="p-2 rounded-lg bg-zinc-950/70 border border-zinc-800/80 text-zinc-300 text-[11px] max-h-24 overflow-y-auto whitespace-pre-line">${esc(
                  clip.text.slice(0, 380)
                )}${clip.text.length > 380 ? '…' : ''}</div>
              </div>
            `
              )
              .join('');

      const overlay = document.createElement('div');
      overlay.id = 'mod09-recycle-bin-modal';
      overlay.className =
        'fixed inset-0 z-[10019] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5';

      overlay.innerHTML = `
        <div class="w-full max-w-2xl max-h-[86vh] rounded-2xl border border-zinc-700 bg-zinc-950 flex flex-col overflow-hidden shadow-2xl">
          <div class="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900">
            <div>
              <h3 class="text-sm font-extrabold text-amber-300">♻️ Thu Hồi Đoạn Lỡ Xóa & Nhịp Sáng Tạo 24 Giờ</h3>
              <p class="text-[11px] text-zinc-400">Tự động bắt giữ mọi đoạn văn dài bị xóa nhầm kể cả khi bạn đã quên Undo.</p>
            </div>
            <button type="button" id="btn-close-mod09-recycle" class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200">✕ Đóng</button>
          </div>
          <div class="p-4 overflow-y-auto space-y-4 flex-1">
            <div class="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3 space-y-2">
              <div class="text-xs font-bold text-emerald-300">${esc(peakText)}</div>
              <div class="flex items-end gap-1 pt-1">${barsHtml}</div>
            </div>
            <div class="space-y-2.5">
              <h4 class="text-xs font-bold text-zinc-300 uppercase tracking-wider">Các đoạn văn vừa xóa gần đây (${clips.length})</h4>
              ${clipsHtml}
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);
      overlay.querySelector('#btn-close-mod09-recycle')?.addEventListener('click', () => overlay.remove());
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
      });
      overlay.querySelectorAll('[data-restore-clip]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-restore-clip');
          this.engine.deletedCatcher?.reinsertClipAtCursorInTab1(id);
          overlay.remove();
        });
      });
    }
  }

  // ==========================================================================
  // PHẦN 12: BẢO VỆ VÒNG ĐỜI MOBILE APP (PAGEHIDE / VISIBILITY) & CẤU HÌNH NHỊP LƯU
  // ==========================================================================

  class MobileLifecycleAndSavePreferencesController {
    constructor(autoSaverEngine) {
      this.NS = window.NoirStudio;
      this.engine = autoSaverEngine;
      this.prefsKey = 'noir_v38_autosave_preferences';
      this.prefs = this.loadPrefs();
      this._boundLifecycle = false;
    }

    loadPrefs() {
      try {
        const raw = localStorage.getItem(this.prefsKey);
        const p = raw ? JSON.parse(raw) : null;
        if (p && typeof p === 'object') {
          return {
            autoSaveEnabled: p.autoSaveEnabled !== false,
            autoSnapshotOnMajorEdit: p.autoSnapshotOnMajorEdit !== false,
            showWordMilestoneToasts: p.showWordMilestoneToasts !== false,
            aggressiveMobileFlush: p.aggressiveMobileFlush !== false
          };
        }
      } catch (_) {
        // Mặc định tối ưu
      }
      return {
        autoSaveEnabled: true,
        autoSnapshotOnMajorEdit: true,
        showWordMilestoneToasts: true,
        aggressiveMobileFlush: true
      };
    }

    savePrefs(partial) {
      this.prefs = { ...this.prefs, ...(partial || {}) };
      try {
        localStorage.setItem(this.prefsKey, JSON.stringify(this.prefs));
      } catch (_) {
        // Bỏ qua
      }
      return this.prefs;
    }

    /**
     * Trên iOS Safari và Android Chrome, `beforeunload` đôi khi bị trình duyệt bỏ qua khi người dùng
     * vuốt thoát app sang ứng dụng khác (`visibilitychange: hidden` hoặc `pagehide` hoặc `freeze`).
     * Bộ lắng nghe này kích hoạt ghi ngay Tầng 1 & Tầng 2 trước khi CPU bị đóng băng.
     */
    bindMobileSuspendFlushHooks() {
      if (this._boundLifecycle || typeof document === 'undefined') return;
      this._boundLifecycle = true;

      const emergencyFlushSync = () => {
        if (!this.prefs.aggressiveMobileFlush) return;
        const cm = this.NS.chapterManager;
        if (cm && typeof cm.syncEditorToActiveChapter === 'function') {
          cm.syncEditorToActiveChapter();
          try {
            localStorage.setItem(
              cm.storageKey || 'noir_studio_chapters_v35',
              JSON.stringify(cm.chapters || [])
            );
          } catch (_) {
            // Bỏ qua
          }
        }
        this.NS.crashSentinel?.recordEmergencyDraftBeacon?.();
        if (this.NS.state?.isDirty) {
          this.engine.pipeline?.executePipeline({
            showToastOnComplete: false,
            forceVersionCheck: false
          });
        }
      };

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          emergencyFlushSync();
        }
      });

      window.addEventListener('pagehide', emergencyFlushSync);
      document.addEventListener('freeze', emergencyFlushSync);
      window.addEventListener('blur', () => {
        if (this.NS.state?.isDirty) {
          this.engine.scheduleDebouncedSave(350);
        }
      });
    }

    /**
     * Tính nhanh báo cáo chuỗi các thao tác chưa sao lưu và mức độ an toàn dữ liệu hiện tại
     */
    getDataSafetySummarySentence() {
      const counts = this.engine.undoStack.getStackCounts(this.engine.getActiveChapterId());
      const caughtLen = this.engine.deletedCatcher?.caughtClips?.length || 0;
      const t = this.engine.statusUI.saveTelemetry;
      return [
        `🛡️ Độ an toàn: Rất cao (${t.totalSavesCount} lần ghi tự động trong phiên).`,
        `↩️ Hoàn tác khả dụng: ${counts.undoCount} bước Undo / ${counts.redoCount} bước Redo.`,
        `♻️ Đoạn lỡ xóa được bảo vệ trong két thu hồi: ${caughtLen} đoạn.`
      ].join(' ');
    }
  }

  /**
   * Trình đồng bộ tức thời khi người dùng chuyển từ Tab 1 sang Tab 3 hoặc Tab 6
   * để AI và Kho Lưu Trữ Phiên Bản luôn đọc được chữ mới gõ nhất tính đến từng mili-giây.
   */
  class ScreenSwitchInstantFlushInterceptor {
    constructor(autoSaverEngine) {
      this.NS = window.NoirStudio;
      this.engine = autoSaverEngine;
      this._bound = false;
    }

    attachToScreenBus() {
      if (this._bound || !this.NS.bus || typeof this.NS.bus.on !== 'function') return;
      this._bound = true;

      const screenEvt = this.NS.constants?.EVENTS?.SCREEN_CHANGED || 'screen:changed';
      this.NS.bus.on(screenEvt, () => {
        if (this.NS.state?.isDirty) {
          this.engine.triggerSave(false);
        }
      });
    }
  }

  // ==========================================================================
  // PHẦN 13: GẮN NHÃN BIẾN ĐỘNG TỪ THÔNG MINH CHO HỆ THỐNG PHIÊN BẢN TAB 6
  // ==========================================================================

  class SmartVersionReasonSuggester {
    constructor(autoSaverEngine) {
      this.NS = window.NoirStudio;
      this.engine = autoSaverEngine;
      this.lastCapturedWordByChapter = new Map();
    }

    /**
     * Tạo mô tả ngắn giàu ngữ nghĩa cho bản chụp tự động (VD: "Chương 2 (+142 từ)")
     * giúp tác giả dễ phân biệt từng cột mốc khi duyệt Kho Lịch Sử Phiên Bản Tab 6.
     */
    buildReadableSnapshotReason(chapterRecord) {
      if (!chapterRecord) return 'Tự động lưu phiên làm việc';
      const title = String(chapterRecord.displayTitle || chapterRecord.title || 'Chương');
      const prevWc = this.lastCapturedWordByChapter.get(chapterRecord.id);
      const curWc =
        chapterRecord.wordCount ||
        this.engine.utils.countVietnameseWords(chapterRecord.content || '');
      this.lastCapturedWordByChapter.set(chapterRecord.id, curWc);

      if (typeof prevWc === 'number') {
        const diff = curWc - prevWc;
        if (diff > 0) return `Tự lưu: ${title} (+${diff} từ)`;
        if (diff < 0) return `Biên tập rút gọn: ${title} (${diff} từ)`;
      }
      return `Lưu mốc: ${title} (${curWc.toLocaleString('vi-VN')} từ)`;
    }

    /**
     * Đọc nhanh danh sách thống kê lưu trữ tổng hợp dạng text để in ở Footer hoặc Tooltip
     */
    getConciseFooterTelemetryLine() {
      const counts = this.engine.undoStack.getStackCounts(this.engine.getActiveChapterId());
      const t = this.engine.statusUI.saveTelemetry;
      const v = this.engine.burstTracker.getSessionWritingVelocityStats();
      return `Lưu ${t.totalSavesCount} lần (${t.lastLatencyMs}ms) • Undo ${counts.undoCount} • ${v.keystrokesPerMinute} phím/phút`;
    }

    /**
     * Đưa ra lời khuyên bảo vệ dữ liệu nếu phát hiện chương đã vượt 4000 từ mà chưa xuất bản backup
     */
    evaluateBackupUrgencyNotice() {
      const chapters = this.NS.chapterManager?.chapters || [];
      const totalWords = chapters.reduce((s, c) => s + (c.wordCount || 0), 0);
      if (totalWords >= 5000 && !this.NS.fsEngine?.isConnected?.()) {
        return '💡 Mẹo an toàn: Tác phẩm đã vượt 5.000 từ — bạn nên vào Tab 6 xuất thêm 1 file Sao Lưu .JSON hoặc Nối Thư Mục Ổ Cứng nhé!';
      }
      return '';
    }
  }

  class AutoSaveWriteBarrierGuard {
    constructor(autoSaverEngine) {
      this.engine = autoSaverEngine;
      this.pauseCounter = 0;
    }

    withPausedAutoSave(fn) {
      this.pauseCounter += 1;
      try {
        return fn();
      } finally {
        this.pauseCounter = Math.max(0, this.pauseCounter - 1);
      }
    }

    isPaused() {
      return this.pauseCounter > 0;
    }

    getTelemetryDigestForTab6() {
      const t = this.engine.statusUI.saveTelemetry;
      return {
        totalSavesCount: t.totalSavesCount,
        avgLatencyMs: t.avgLatencyMs,
        lastSavedAt: this.engine.statusUI.lastSavedTimestamp,
        isDirty: Boolean(this.engine.NS?.state?.isDirty)
      };
    }
  }

  const autoSaver = new ThreeTierAutoSaveAndUndoEngine();
  autoSaver.writeBarrier = new AutoSaveWriteBarrierGuard(autoSaver);
  autoSaver.deletedCatcher = new DeletedParagraphEmergencyCatcher(autoSaver);
  autoSaver.hourlyTracker = new DailyHourlyWritingHeatmapTracker(autoSaver);
  autoSaver.unloadGuard = new SafeUnloadDirtyWarningGuard(autoSaver);
  autoSaver.recycleModal = new RecycleBinAndProductivityModal(autoSaver);
  autoSaver.mobileLifecycle = new MobileLifecycleAndSavePreferencesController(autoSaver);
  autoSaver.screenFlushInterceptor = new ScreenSwitchInstantFlushInterceptor(autoSaver);
  autoSaver.reasonSuggester = new SmartVersionReasonSuggester(autoSaver);

  const origInitRef = autoSaver.init.bind(autoSaver);
  autoSaver.init = async function initFullMod09() {
    autoSaver.mobileLifecycle.bindMobileSuspendFlushHooks();
    autoSaver.screenFlushInterceptor.attachToScreenBus();
    return origInitRef();
  };

  NS.MobileLifecycleAndSavePreferencesController = MobileLifecycleAndSavePreferencesController;

  const origInputDetected = autoSaver.burstTracker.onEditorInputDetected.bind(autoSaver.burstTracker);
  autoSaver.burstTracker.onEditorInputDetected = function (newText, prevLen) {
    const chapId = autoSaver.getActiveChapterId();
    const hist = autoSaver.undoStack.chapterStacks.get(String(chapId));
    const prevSnapshot = hist?.undoStack?.[hist.undoStack.length - 1]?.text || '';
    if (prevSnapshot.length - String(newText || '').length >= 65) {
      const chapTitle = autoSaver.NS.chapterManager?.getActiveChapter?.()?.displayTitle || 'Chương';
      autoSaver.deletedCatcher.inspectTextReductionAndCatch(prevSnapshot, newText, chapTitle);
    }
    autoSaver.hourlyTracker.recordWritingActivity(1, 0);
    return origInputDetected(newText, prevLen);
  };

  const origInitMod09 = autoSaver.init.bind(autoSaver);
  autoSaver.init = async function initEnhancedMod09() {
    autoSaver.unloadGuard.attachBeforeUnloadFlush();
    return origInitMod09();
  };

  // ==========================================================================
  // PHẦN 14: ĐỊNH DẠNG CHỈ BÁO TẦN SUẤT LƯU & ĐỒNG BỘ MỤC TIÊU TÁC GIẢ
  // ==========================================================================

  class AutoSaveTelemetryBadgeFormatter {
    constructor(autoSaverEngine) {
      this.engine = autoSaverEngine;
    }

    buildTooltipDiagnosticString() {
      const t = this.engine.statusUI.saveTelemetry;
      const counts = this.engine.undoStack.getStackCounts(
        this.engine.getActiveChapterId()
      );
      const v = this.engine.burstTracker.getSessionWritingVelocityStats();
      return [
        `• Tự lưu 3 tầng: ${t.totalSavesCount} lần (độ trễ gần nhất ${t.lastLatencyMs}ms, trung bình ${t.avgLatencyMs}ms)`,
        `• Undo/Redo hiện có: ${counts.undoCount} bước lùi / ${counts.redoCount} bước tiến`,
        `• Tốc độ sáng tác phiên này: ${v.keystrokesPerMinute} nhịp phím/phút (${v.elapsedMinutes} phút)`,
        this.engine.hourlyTracker?.getPeakCreativeHoursSummary?.() || ''
      ]
        .filter(Boolean)
        .join('\n');
    }

    refreshHeaderStatusTooltip() {
      if (typeof document === 'undefined') return;
      const textEl = document.getElementById('fs-status-text');
      if (textEl && textEl.parentElement) {
        textEl.parentElement.title = this.buildTooltipDiagnosticString();
      }
    }

    getSaveSafetyScorePercent() {
      const t = this.engine.statusUI.saveTelemetry;
      let score = 50;
      if (t.tier1Ok) score += 20;
      if (t.tier2Ok) score += 20;
      if (t.tier3Synced) score += 10;
      return Math.min(100, score);
    }
  }

  autoSaver.tooltipFormatter = new AutoSaveTelemetryBadgeFormatter(autoSaver);
  const origRenderStatMod09 = autoSaver.statusUI.renderStatus.bind(autoSaver.statusUI);
  autoSaver.statusUI.renderStatus = function renderStatusWithTooltip(mode, msg) {
    origRenderStatMod09(mode, msg);
    if (mode === 'SAVED') {
      autoSaver.tooltipFormatter?.refreshHeaderStatusTooltip();
    }
  };

  NS.DeletedParagraphEmergencyCatcher = DeletedParagraphEmergencyCatcher;
  NS.DailyHourlyWritingHeatmapTracker = DailyHourlyWritingHeatmapTracker;
  NS.ThreeTierAutoSaveAndUndoEngine = ThreeTierAutoSaveAndUndoEngine;
  NS.autoSaver = autoSaver;

  if (typeof NS.registerModule === 'function') {
    NS.registerModule('mod09', autoSaver);
  }
})(typeof window !== 'undefined' ? window : globalThis);
