/**
 * ============================================================================
 * MODULE 34: HỆ THỐNG BÁO LỖI NGƯỜI DÙNG & KÊNH CHUYỂN TIẾP BÁO CÁO AN TOÀN
 *             (mod34_bug_report_and_doc_relay.js)
 * ============================================================================
 * Nhiệm vụ cốt lõi:
 *   1. Cung cấp giao diện Báo Lỗi (Report Bug) gọn đẹp, dễ dùng ngay tại Tab 6:
 *      - Vị trí gặp lỗi (Ở đâu?)
 *      - Nội dung sự cố (Gặp lỗi gì?)
 *      - Biểu hiện trực quan (Nó trông như thế nào?)
 *      - Tùy chọn đính kèm thông số kỹ thuật an toàn (màn hình, tab, phiên bản).
 *   2. Lọc sạch dữ liệu nhạy cảm (PiiAndSecretScrubber) để KHÔNG BAO GIỜ rò rỉ
 *      Gemini API Key (AIzaSy..., AQ....), thư mục cá nhân hay nội dung tiểu thuyết.
 *   3. Gửi báo cáo thông qua kênh chuyển tiếp an toàn hướng về tài liệu tiếp nhận
 *      nội bộ của tác giả — TUYỆT ĐỐI KHÔNG để lộ đường dẫn hay ID Google Doc
 *      lên giao diện cho người dùng thông thường.
 *   4. Lưu biên nhận lịch sử báo lỗi cục bộ (IndexedDB + localStorage), hiển thị
 *      lời cảm ơn chân thành và trạng thái gửi trung thực kèm nút gửi Gmail dự phòng.
 *
 * Kiến trúc thuần khiết: Đăng ký qua `window.NoirStudio.registerModule('mod34', ...)`.
 * ============================================================================
 */
(function initModule34BugReportAndDocRelay(global) {
  'use strict';

  const NS = (global.NoirStudio = global.NoirStudio || {});

  const MOD34_CONSTANTS = Object.freeze({
    MODULE_KEY: 'mod34',
    VERSION: '38.5.0',
    AUTHOR_CONTACT_EMAIL: 'quycryparis@gmail.com',
    RELAY_STORAGE_KEY: 'noir_mod34_relay_endpoint_url',
    OUTBOX_STORAGE_KEY: 'noir_mod34_bug_reports_outbox_v1',
    DRAFT_STORAGE_KEY: 'noir_mod34_bug_report_draft_v1',
    UI_PREFS_STORAGE_KEY: 'noir_mod34_ui_prefs_v1',
    IDB_STORE_KEY: 'mod34_bug_report_outbox_store',
    // Mã đích tiếp nhận được mã hóa Base64 nội bộ, KHÔNG BAO GIỜ hiển thị ra giao diện DOM
    TARGET_RECEIVER_TOKEN_B64:
      'MXBwUU5FTVhDcVNhaWJrd0UtUjRZN19wc0Q0NUtNVU1iYTZ4U2ctbVNQSGtfcmVsYXk=',
    MAX_OUTBOX_ITEMS: 80,
    MAX_FIELD_CHARS: 2400,
    MIN_DESC_CHARS: 8,
    REQUEST_TIMEOUT_MS: 9500,
    RATE_LIMIT_WINDOW_MS: 20000
  });

  const BUG_LOCATION_CATALOG = Object.freeze([
    {
      id: 'GATE_CONNECTION',
      label: '🔐 Cổng Kết Nối Đầu Vào (API Key / Chọn Thư Mục)',
      shortTag: 'Cổng Kết Nối',
      defaultSeverity: 'HIGH',
      suggestedChecks: [
        'Kiểm tra trạng thái xác thực Flash-Lite',
        'Kiểm tra quyền ghi thư mục ổ cứng',
        'Kiểm tra ghi nhớ cookie / IndexedDB'
      ]
    },
    {
      id: 'TAB_1_EDITOR',
      label: '✍️ Tab 1: Bàn Viết Truyện & Duyệt Màu AI',
      shortTag: 'Tab 1 - Bàn Viết',
      defaultSeverity: 'HIGH',
      suggestedChecks: [
        'Kiểm tra nhập liệu, Backspace, Undo/Redo',
        'Kiểm tra tự lưu 3 tầng không tải lại trang',
        'Kiểm tra thanh duyệt màu đề xuất AI'
      ]
    },
    {
      id: 'TAB_2_CHAPTERS',
      label: '📂 Tab 2: Cây Chương, Bộ Lọc & File Nguồn',
      shortTag: 'Tab 2 - Cây Chương',
      defaultSeverity: 'MEDIUM',
      suggestedChecks: [
        'Kiểm tra lọc Tất cả / Nháp / Đã duyệt',
        'Kiểm tra thanh tiêu đề trên màn hình chia đôi',
        'Kiểm tra nạp DOCX / PDF / TXT'
      ]
    },
    {
      id: 'TAB_3_AI_CENTER',
      label: '🤖 Tab 3: Trợ Lý AI, 5 Chế Độ & Biểu Đồ',
      shortTag: 'Tab 3 - AI 5 Chế Độ',
      defaultSeverity: 'HIGH',
      suggestedChecks: [
        'Kiểm tra tổng hợp Prompt Bước 1 & 2',
        'Kiểm tra chuyển đổi Chế độ 1 -> Chế độ 5',
        'Kiểm tra lọc ký hiệu Markdown thừa đầu ra AI'
      ]
    },
    {
      id: 'TAB_4_BIBLE',
      label: '🏛️ Tab 4: Story Bible, Nhân Vật & Ma Trận Ai Biết Gì',
      shortTag: 'Tab 4 - Story Bible',
      defaultSeverity: 'MEDIUM',
      suggestedChecks: [
        'Kiểm tra tự cập nhật Story Bible khi duyệt chương',
        'Kiểm tra hồ sơ nhân vật đa chiều & phục bút',
        'Kiểm tra đồng bộ NotebookLM'
      ]
    },
    {
      id: 'TAB_5_AMBIENCE',
      label: '🎧 Tab 5: Nhạc MP3, Pomodoro, Chữ & Hình Nền',
      shortTag: 'Tab 5 - Không Gian',
      defaultSeverity: 'LOW',
      suggestedChecks: [
        'Kiểm tra màu nền/chữ danh sách chọn (Dropdown)',
        'Kiểm tra trình phát nhạc A-B & ASMR',
        'Kiểm tra sân khấu hình nền 60FPS & tranh tự sinh'
      ]
    },
    {
      id: 'TAB_6_SYSTEM',
      label: '⚙️ Tab 6: Kho Phiên Bản, Xuất Sách & Hệ Thống',
      shortTag: 'Tab 6 - Hệ Thống',
      defaultSeverity: 'MEDIUM',
      suggestedChecks: [
        'Kiểm tra khôi phục mốc phiên bản Time-Machine',
        'Kiểm tra xuất sách PDF / DOCX / EPUB',
        'Kiểm tra đồng bộ trạng thái API Key & Thư mục'
      ]
    },
    {
      id: 'CHATBOT_MASCOT',
      label: '🎱 Trợ Lý Viên Bi Số 8 (Chatbot & Phím Tắt Nổi)',
      shortTag: 'Chatbot Viên Bi Số 8',
      defaultSeverity: 'MEDIUM',
      suggestedChecks: [
        'Kiểm tra phân tách Chế độ 1 Hỗ trợ Web và Chế độ 2 Tán gẫu',
        'Kiểm tra phản hồi văn bản sạch không ký hiệu AI',
        'Kiểm tra kéo thả thanh nổi Pomodoro / Nhạc'
      ]
    },
    {
      id: 'MOBILE_LAYOUT',
      label: '📱 Giao Diện Điện Thoại / Máy Tính Bảng (Responsive)',
      shortTag: 'Mobile / Tablet',
      defaultSeverity: 'MEDIUM',
      suggestedChecks: [
        'Kiểm tra thanh điều hướng đáy 6 Tab',
        'Kiểm tra nút bị che khuất hoặc tràn viền ngang',
        'Kiểm tra bàn phím ảo trên màn hình nhỏ'
      ]
    },
    {
      id: 'OTHER_AREA',
      label: '🧩 Khu Vực Khác / Vấn Đề Chung Toàn Trang',
      shortTag: 'Khác / Toàn Trang',
      defaultSeverity: 'MEDIUM',
      suggestedChecks: [
        'Mô tả thao tác trước khi xảy ra sự cố',
        'Kiểm tra tình trạng mạng hoặc trình duyệt'
      ]
    }
  ]);

  const SEVERITY_PROFILES = Object.freeze({
    CRITICAL: {
      code: 'CRITICAL',
      label: 'Khẩn cấp (Mất dữ liệu / Tự tải lại trang / Treo màn hình)',
      badgeClass: 'bg-rose-500/20 border-rose-500/50 text-rose-300',
      weight: 4
    },
    HIGH: {
      code: 'HIGH',
      label: 'Cao (Tính năng chính không chạy đúng)',
      badgeClass: 'bg-amber-500/20 border-amber-500/50 text-amber-300',
      weight: 3
    },
    MEDIUM: {
      code: 'MEDIUM',
      label: 'Trung bình (Hiển thị lệch / Khó thao tác)',
      badgeClass: 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300',
      weight: 2
    },
    LOW: {
      code: 'LOW',
      label: 'Nhẹ / Góp ý cải thiện giao diện',
      badgeClass: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300',
      weight: 1
    }
  });

  const APPEARANCE_PRESET_TAGS = Object.freeze([
    { id: 'overlap_text', label: 'Chữ bị đè hoặc cắt xén' },
    { id: 'wrong_contrast', label: 'Nền chữ khó nhìn / mờ' },
    { id: 'button_no_action', label: 'Bấm nút không phản hồi' },
    { id: 'page_reload', label: 'Trang tự tải lại bất ngờ' },
    { id: 'filter_wrong', label: 'Lọc / tìm kiếm sai kết quả' },
    { id: 'ai_format_issue', label: 'Đầu ra AI còn ký tự lạ / sai chế độ' },
    { id: 'layout_overflow', label: 'Khung bị tràn lề trên màn hình' },
    { id: 'slow_freeze', label: 'Chạy chậm hoặc đơ khung' }
  ]);

  // ==========================================================================
  // LỚP 1: TIỆN ÍCH AN TOÀN NỘI BỘ & MÃ HÓA CHỐNG RÒ RỈ THÔNG TIN NHẠY CẢM
  // ==========================================================================
  class BugReportSecurityHelper {
    decodeReceiverToken() {
      try {
        if (typeof atob === 'function') {
          const decoded = atob(MOD34_CONSTANTS.TARGET_RECEIVER_TOKEN_B64);
          return decoded.replace(/_relay$/, '');
        }
      } catch (_) {}
      return 'configured_private_doc_channel';
    }

    buildSafeDocTargetFingerprint() {
      const token = this.decodeReceiverToken();
      let hash = 2166136261;
      for (let i = 0; i < token.length; i += 1) {
        hash ^= token.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
      }
      const hex = (hash >>> 0).toString(16).toUpperCase().padStart(8, '0');
      return `DOC_RELAY_${hex}`;
    }

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

    formatTimestampVN(ts) {
      if (NS.uiUtils && typeof NS.uiUtils.formatTimestampVN === 'function') {
        return NS.uiUtils.formatTimestampVN(ts);
      }
      try {
        return new Date(ts || Date.now()).toLocaleString('vi-VN');
      } catch (_) {
        return String(ts || '');
      }
    }

    computeFnv1aFingerprint(input) {
      const str = String(input || '').trim().toLowerCase();
      let hash = 2166136261;
      for (let i = 0; i < str.length; i += 1) {
        hash ^= str.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
      }
      return (hash >>> 0).toString(16).padStart(8, '0');
    }
  }

  // ==========================================================================
  // LỚP 2: BỘ LỌC BÍ MẬT & DỮ LIỆU RIÊNG TƯ (PiiAndSecretScrubber)
  // ==========================================================================
  class BugReportSecretScrubber {
    constructor() {
      this.patterns = [
        {
          name: 'GEMINI_AIZA_KEY',
          regex: /AIzaSy[0-9A-Za-z\-_]{18,60}/g,
          replacement: '[ĐÃ_ẨN_API_KEY]'
        },
        {
          name: 'GEMINI_AQ_TOKEN',
          regex: /\bAQ\.[0-9A-Za-z\-_.]{16,120}\b/g,
          replacement: '[ĐÃ_ẨN_AQ_KEY]'
        },
        {
          name: 'BEARER_HEADER',
          regex: /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi,
          replacement: 'Bearer [ĐÃ_ẨN_TOKEN]'
        },
        {
          name: 'OAUTH_ACCESS_TOKEN',
          regex: /ya29\.[0-9A-Za-z\-_]{20,250}/g,
          replacement: '[ĐÃ_ẨN_OAUTH_TOKEN]'
        },
        {
          name: 'WINDOWS_USER_PATH',
          regex: /[A-Za-z]:\\Users\\[^\\\s]+/g,
          replacement: '[THƯ_MỤC_NGƯỜI_DÙNG]'
        }
      ];
    }

    scrubText(rawText) {
      let clean = String(rawText ?? '');
      if (!clean) {
        return { text: '', redactedCount: 0, redactedTypes: [] };
      }

      let redactedCount = 0;
      const redactedTypes = [];

      for (const rule of this.patterns) {
        const matches = clean.match(rule.regex);
        if (matches && matches.length > 0) {
          redactedCount += matches.length;
          if (!redactedTypes.includes(rule.name)) {
            redactedTypes.push(rule.name);
          }
          clean = clean.replace(rule.regex, rule.replacement);
        }
      }

      return {
        text: clean.trim(),
        redactedCount,
        redactedTypes
      };
    }

    scrubReportPayload(payload) {
      const locRes = this.scrubText(payload.customWhere || payload.whereLabel || '');
      const whatRes = this.scrubText(payload.bugWhat || '');
      const lookRes = this.scrubText(payload.bugVisual || '');
      const stepsRes = this.scrubText(payload.reproSteps || '');

      const totalRedacted =
        locRes.redactedCount +
        whatRes.redactedCount +
        lookRes.redactedCount +
        stepsRes.redactedCount;

      return {
        sanitized: {
          ...payload,
          whereLabel: locRes.text || payload.whereLabel || '',
          customWhere: locRes.text,
          bugWhat: whatRes.text,
          bugVisual: lookRes.text,
          reproSteps: stepsRes.text
        },
        securityNotice: {
          redactedCount: totalRedacted,
          hadSecretsRedacted: totalRedacted > 0,
          redactedTypes: Array.from(
            new Set([
              ...locRes.redactedTypes,
              ...whatRes.redactedTypes,
              ...lookRes.redactedTypes,
              ...stepsRes.redactedTypes
            ])
          )
        }
      };
    }
  }

  // ==========================================================================
  // LỚP 3: THU THẬP NGỮ CẢNH KỸ THUẬT AN TOÀN (RuntimeDiagnosticCollector)
  // ==========================================================================
  class RuntimeDiagnosticCollector {
    collectSafeDiagnostics(includeSystemMeta = true) {
      if (!includeSystemMeta || typeof window === 'undefined') {
        return {
          included: false,
          note: 'Người dùng chọn không đính kèm thông số thiết bị.'
        };
      }

      const activeScreen =
        document.body?.getAttribute('data-s14-screen') || 'UNKNOWN_SCREEN';
      const themeMode = document.documentElement?.classList?.contains('dark')
        ? 'DARK'
        : 'LIGHT';
      const viewportWidth = window.innerWidth || 0;
      const viewportHeight = window.innerHeight || 0;
      const dpr = Number(window.devicePixelRatio || 1);
      const selectedModelId = NS.geminiRouter?.selectedModelId || 'unknown';
      const thinkingLevel =
        typeof NS.geminiRouter?.getThinkingLevel === 'function'
          ? NS.geminiRouter.getThinkingLevel()
          : 'MEDIUM';
      const activeMode =
        document.getElementById('select-ai-execution-mode')?.value || 'MODE_1_DRAFT';
      const loadedModulesCount = NS.registry ? Object.keys(NS.registry).length : 0;
      const shieldState = window.__NOIR_ZERO_RELOAD_SHIELD__ || null;
      const isOnline =
        typeof navigator !== 'undefined' ? Boolean(navigator.onLine) : true;
      const protocol = window.location?.protocol || 'unknown';

      const browserSummary = this.extractSafeBrowserLabel(
        typeof navigator !== 'undefined' ? navigator.userAgent : ''
      );

      return {
        included: true,
        appVersion: MOD34_CONSTANTS.VERSION,
        capturedAtIso: new Date().toISOString(),
        activeScreen,
        activeAiMode: activeMode,
        selectedModelId,
        thinkingLevel,
        themeMode,
        viewport: `${viewportWidth}x${viewportHeight}@${dpr.toFixed(2)}x`,
        deviceFormFactor:
          viewportWidth < 640
            ? 'MOBILE'
            : viewportWidth < 1024
            ? 'TABLET'
            : 'DESKTOP',
        loadedModulesCount,
        blockedReloadsCount: shieldState ? Number(shieldState.blockedReloadFrames || 0) : 0,
        isOnline,
        protocol,
        browserSummary
      };
    }

    extractSafeBrowserLabel(ua) {
      const raw = String(ua || '');
      if (!raw) return 'Trình duyệt chưa rõ';
      if (raw.includes('Edg/')) {
        const m = raw.match(/Edg\/(\d+)/);
        return `Microsoft Edge ${m ? `v${m[1]}` : ''}`.trim();
      }
      if (raw.includes('Chrome/')) {
        const m = raw.match(/Chrome\/(\d+)/);
        return `Google Chrome / Chromium ${m ? `v${m[1]}` : ''}`.trim();
      }
      if (raw.includes('Firefox/')) {
        const m = raw.match(/Firefox\/(\d+)/);
        return `Mozilla Firefox ${m ? `v${m[1]}` : ''}`.trim();
      }
      if (raw.includes('Safari/') && !raw.includes('Chrome/')) {
        return 'Apple Safari';
      }
      return 'Trình duyệt chuẩn Web';
    }
  }

  // ==========================================================================
  // LỚP 4: KIỂM ĐỊNH ĐẦU VÀO & PHÂN LOẠI MỨC ĐỘ LỖI (BugReportValidator)
  // ==========================================================================
  class BugReportValidatorAndClassifier {
    constructor(secHelper) {
      this.secHelper = secHelper;
    }

    getLocationEntry(locationId) {
      return (
        BUG_LOCATION_CATALOG.find((item) => item.id === locationId) ||
        BUG_LOCATION_CATALOG[BUG_LOCATION_CATALOG.length - 1]
      );
    }

    inferSeverityCode(locationId, bugWhat, bugVisual, selectedTags = []) {
      const combined = `${bugWhat || ''} ${bugVisual || ''} ${(selectedTags || []).join(' ')}`.toLowerCase();
      if (
        selectedTags.includes('page_reload') ||
        /reload|tải lại trang|mất hết|văng ra cổng|đơ hoàn toàn|crash|trắng trang/.test(combined)
      ) {
        return 'CRITICAL';
      }
      if (
        /không bấm được|không chạy|lỗi api|lỗi verify|không lưu|không lọc|sai dữ liệu|mất chữ/.test(
          combined
        )
      ) {
        return 'HIGH';
      }
      const entry = this.getLocationEntry(locationId);
      return entry.defaultSeverity || 'MEDIUM';
    }

    validateFormInput(rawForm) {
      const errors = [];
      const warnings = [];

      const locationId = String(rawForm.locationId || '').trim() || 'OTHER_AREA';
      const locationEntry = this.getLocationEntry(locationId);
      const customWhere = String(rawForm.customWhere || '')
        .trim()
        .slice(0, 280);
      const bugWhat = String(rawForm.bugWhat || '')
        .trim()
        .slice(0, MOD34_CONSTANTS.MAX_FIELD_CHARS);
      const bugVisual = String(rawForm.bugVisual || '')
        .trim()
        .slice(0, MOD34_CONSTANTS.MAX_FIELD_CHARS);
      const reproSteps = String(rawForm.reproSteps || '')
        .trim()
        .slice(0, MOD34_CONSTANTS.MAX_FIELD_CHARS);
      const tags = Array.isArray(rawForm.selectedTags) ? rawForm.selectedTags.slice(0, 8) : [];

      if (bugWhat.length < MOD34_CONSTANTS.MIN_DESC_CHARS) {
        errors.push({
          field: 'bugWhat',
          message: `Bạn vui lòng mô tả rõ hơn lỗi gặp phải (ít nhất ${MOD34_CONSTANTS.MIN_DESC_CHARS} ký tự) để tác giả tái hiện và sửa chính xác nhé.`
        });
      }

      if (bugVisual.length < 4 && tags.length === 0) {
        warnings.push({
          field: 'bugVisual',
          message:
            'Gợi ý: Mô tả thêm "Nó trông như thế nào?" hoặc chọn thẻ biểu hiện sẽ giúp khoanh vùng lỗi giao diện nhanh hơn gấp đôi.'
        });
      }

      if (locationId === 'OTHER_AREA' && !customWhere) {
        warnings.push({
          field: 'customWhere',
          message: 'Bạn có thể ghi rõ vị trí trang/nút bấm cụ thể nếu chọn "Khu vực khác".'
        });
      }

      const inferredSeverity = this.inferSeverityCode(
        locationId,
        bugWhat,
        bugVisual,
        tags
      );

      const whereLabel = customWhere
        ? `${locationEntry.shortTag} — ${customWhere}`
        : locationEntry.label;

      const fingerprint = this.secHelper.computeFnv1aFingerprint(
        `${locationId}|${bugWhat.slice(0, 120)}|${bugVisual.slice(0, 80)}`
      );

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        normalized: {
          locationId,
          whereLabel,
          customWhere,
          bugWhat,
          bugVisual,
          reproSteps,
          selectedTags: tags,
          severityCode: inferredSeverity,
          fingerprint
        }
      };
    }
  }

  // ==========================================================================
  // LỚP 5: KHO BIÊN NHẬN & HÀNG ĐỢI BÁO LỖI CỤC BỘ (BugReportOutboxVault)
  // ==========================================================================
  class BugReportOutboxVault {
    constructor() {
      this.records = [];
      this.lastSubmitAt = 0;
    }

    loadFromLocalStorage() {
      try {
        const raw = localStorage.getItem(MOD34_CONSTANTS.OUTBOX_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            this.records = parsed.slice(0, MOD34_CONSTANTS.MAX_OUTBOX_ITEMS);
          }
        }
      } catch (_) {
        this.records = [];
      }
      return this.records;
    }

    async loadAll() {
      this.loadFromLocalStorage();
      try {
        if (NS.idb && typeof NS.idb.getMeta === 'function') {
          const fromIdb = await NS.idb.getMeta(MOD34_CONSTANTS.IDB_STORE_KEY);
          if (Array.isArray(fromIdb) && fromIdb.length > this.records.length) {
            this.records = fromIdb.slice(0, MOD34_CONSTANTS.MAX_OUTBOX_ITEMS);
            this.persistSync();
          }
        }
      } catch (_) {}
      return this.records;
    }

    persistSync() {
      try {
        localStorage.setItem(
          MOD34_CONSTANTS.OUTBOX_STORAGE_KEY,
          JSON.stringify(this.records.slice(0, MOD34_CONSTANTS.MAX_OUTBOX_ITEMS))
        );
      } catch (_) {}
    }

    async persistAsync() {
      this.persistSync();
      try {
        if (NS.idb && typeof NS.idb.setMeta === 'function') {
          await NS.idb.setMeta(
            MOD34_CONSTANTS.IDB_STORE_KEY,
            this.records.slice(0, MOD34_CONSTANTS.MAX_OUTBOX_ITEMS)
          );
        }
      } catch (_) {}
    }

    checkDuplicateOrRateLimit(fingerprint) {
      const now = Date.now();
      if (this.lastSubmitAt && now - this.lastSubmitAt < 4000) {
        return {
          blocked: true,
          reason: 'RATE_LIMIT',
          message: 'Bạn vừa mới bấm gửi xong — hệ thống đang xử lý, vui lòng chờ vài giây nhé.'
        };
      }
      const recentDuplicate = this.records.find(
        (r) =>
          r.fingerprint === fingerprint &&
          now - Number(r.createdAt || 0) < MOD34_CONSTANTS.RATE_LIMIT_WINDOW_MS
      );
      if (recentDuplicate) {
        return {
          blocked: true,
          reason: 'DUPLICATE_RECENT',
          message: 'Báo lỗi giống hệt vừa được ghi nhận ngay trước đó rồi — bạn xem biên nhận bên dưới nhé.'
        };
      }
      return { blocked: false };
    }

    async addReportRecord(record) {
      this.lastSubmitAt = Date.now();
      this.records = [record, ...this.records].slice(0, MOD34_CONSTANTS.MAX_OUTBOX_ITEMS);
      await this.persistAsync();
      return record;
    }

    async updateReportStatus(reportId, statusUpdate) {
      const idx = this.records.findIndex((r) => r.id === reportId);
      if (idx === -1) return null;
      this.records[idx] = {
        ...this.records[idx],
        ...statusUpdate,
        updatedAt: Date.now()
      };
      await this.persistAsync();
      return this.records[idx];
    }

    async removeReportById(reportId) {
      this.records = this.records.filter((r) => r.id !== reportId);
      await this.persistAsync();
      return this.records.length;
    }

    async clearAllRecords() {
      this.records = [];
      await this.persistAsync();
    }

    saveDraftState(draftObj) {
      try {
        localStorage.setItem(MOD34_CONSTANTS.DRAFT_STORAGE_KEY, JSON.stringify(draftObj || {}));
      } catch (_) {}
    }

    loadDraftState() {
      try {
        const raw = localStorage.getItem(MOD34_CONSTANTS.DRAFT_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (_) {
        return null;
      }
    }

    clearDraftState() {
      try {
        localStorage.removeItem(MOD34_CONSTANTS.DRAFT_STORAGE_KEY);
      } catch (_) {}
    }
  }

  // ==========================================================================
  // LỚP 6: BỘ CHUYỂN TIẾP BÁO CÁO AN TOÀN & KÊNH DỰ PHÒNG GMAIL
  //         (DocRelayTransportClient)
  // ==========================================================================
  class DocRelayTransportClient {
    constructor(secHelper) {
      this.secHelper = secHelper;
      // Điểm cuối Web App tiếp nhận báo lỗi do chủ sở hữu có thể cấu hình thêm
      this.defaultRelayEndpoint = '';
    }

    getConfiguredRelayUrl() {
      if (typeof global.__NOIR_BUG_RELAY_URL__ === 'string' && global.__NOIR_BUG_RELAY_URL__.trim()) {
        return global.__NOIR_BUG_RELAY_URL__.trim();
      }
      if (typeof NS.bugReportRelayUrl === 'string' && NS.bugReportRelayUrl.trim()) {
        return NS.bugReportRelayUrl.trim();
      }
      try {
        const stored = localStorage.getItem(MOD34_CONSTANTS.RELAY_STORAGE_KEY);
        if (stored && /^https:\/\/script\.google\.com\//i.test(stored.trim())) {
          return stored.trim();
        }
      } catch (_) {}
      return this.defaultRelayEndpoint;
    }

    buildStructuredReportPlainText(reportRecord) {
      const sev = SEVERITY_PROFILES[reportRecord.severityCode]?.label || reportRecord.severityCode;
      const tagLabels = (reportRecord.selectedTags || [])
        .map((id) => APPEARANCE_PRESET_TAGS.find((t) => t.id === id)?.label || id)
        .filter(Boolean);

      const diag = reportRecord.diagnostics || {};
      const lines = [
        `[BÁO LỖI NGƯỜI DÙNG — WEB VIẾT TIỂU THUYẾT CỦA BI]`,
        `Mã biên nhận : ${reportRecord.id}`,
        `Thời gian gửi: ${this.secHelper.formatTimestampVN(reportRecord.createdAt)}`,
        `Mức độ       : ${sev}`,
        `Vị trí lỗi   : ${reportRecord.whereLabel}`,
        tagLabels.length ? `Nhãn biểu hiện: ${tagLabels.join(', ')}` : '',
        ``,
        `1. GẶP LỖI GÌ:`,
        reportRecord.bugWhat || '(Không có)',
        ``,
        `2. NÓ TRÔNG NHƯ THẾ NÀO:`,
        reportRecord.bugVisual || '(Chưa mô tả thêm)',
        reportRecord.reproSteps ? `\n3. CÁC BƯỚC TÁI HIỆN:\n${reportRecord.reproSteps}` : '',
        ``,
        `--- THÔNG SỐ KỸ THUẬT AN TOÀN ---`,
        diag.included
          ? [
              `• Phiên bản     : ${diag.appVersion || MOD34_CONSTANTS.VERSION}`,
              `• Màn hình / Tab: ${diag.activeScreen} · Chế độ ${diag.activeAiMode}`,
              `• Thiết bị      : ${diag.deviceFormFactor} (${diag.viewport}) · ${diag.browserSummary}`,
              `• Giao diện     : ${diag.themeMode} · Đã nạp ${diag.loadedModulesCount} module`,
              `• Shield Reload : Đã chặn ${diag.blockedReloadsCount || 0} lượt tải lại không mong muốn`
            ].join('\n')
          : '• Không đính kèm thông số thiết bị.'
      ];
      return lines.filter((line) => line !== '').join('\n');
    }

    buildGmailComposeUrl(reportRecord) {
      const subject = encodeURIComponent(
        `[Bug Report][Bi Novel] ${reportRecord.whereLabel} (${reportRecord.id})`
      );
      const body = encodeURIComponent(this.buildStructuredReportPlainText(reportRecord));
      return `mailto:${MOD34_CONSTANTS.AUTHOR_CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    }

    async dispatchToRelay(reportRecord) {
      const relayUrl = this.getConfiguredRelayUrl();
      const targetChannelFingerprint = this.secHelper.buildSafeDocTargetFingerprint();

      // Kiểm tra khi chưa có cổng webhook đám mây công khai hay đang ngoại tuyến:
      // Tuyệt đối trả lời TRUNG THỰC, không giả mạo ghi thành công lên Google Docs.
      if (!relayUrl || typeof fetch !== 'function') {
        return {
          deliveredToCloud: false,
          deliveryMode: 'LOCAL_OUTBOX_SAVED',
          statusLabel: 'Đã lưu biên nhận an toàn trên máy',
          honestDetail:
            typeof navigator !== 'undefined' && !navigator.onLine
              ? 'Thiết bị đang ngoại tuyến; báo lỗi đã được lưu sẵn vào Hộp chờ cục bộ.'
              : 'Báo lỗi đã được lưu vào Hộp chờ cục bộ — bạn có thể bấm nút "✉️ Gửi qua Gmail cho tác giả" hoặc "📋 Chép báo lỗi" để gửi trực tiếp ngay.',
          channelRef: targetChannelFingerprint
        };
      }

      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        return {
          deliveredToCloud: false,
          deliveryMode: 'OFFLINE_QUEUED',
          statusLabel: 'Đang chờ mạng (Đã lưu cục bộ)',
          honestDetail: 'Trình duyệt đang ngoại tuyến nên chưa thể đẩy qua mạng; dữ liệu đã được lưu sẵn.',
          channelRef: targetChannelFingerprint
        };
      }

      const controller = typeof AbortController === 'function' ? new AbortController() : null;
      const timer = controller
        ? setTimeout(() => controller.abort(), MOD34_CONSTANTS.REQUEST_TIMEOUT_MS)
        : null;

      try {
        const wirePayload = {
          reportId: reportRecord.id,
          createdAtIso: new Date(reportRecord.createdAt).toISOString(),
          whereLabel: reportRecord.whereLabel,
          severityCode: reportRecord.severityCode,
          bugWhat: reportRecord.bugWhat,
          bugVisual: reportRecord.bugVisual,
          reproSteps: reportRecord.reproSteps,
          selectedTags: reportRecord.selectedTags,
          diagnostics: reportRecord.diagnostics,
          formattedReport: this.buildStructuredReportPlainText(reportRecord),
          receiverChannelRef: targetChannelFingerprint
        };

        const response = await fetch(relayUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify(wirePayload),
          signal: controller ? controller.signal : undefined
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        return {
          deliveredToCloud: true,
          deliveryMode: 'RELAY_DELIVERED',
          statusLabel: 'Đã gửi tự động qua kênh tiếp nhận',
          honestDetail: 'Cổng chuyển tiếp đã xác nhận tiếp nhận báo cáo lỗi thành công.',
          channelRef: targetChannelFingerprint
        };
      } catch (err) {
        return {
          deliveredToCloud: false,
          deliveryMode: 'RELAY_FAILED_SAVED_LOCAL',
          statusLabel: 'Đã lưu cục bộ (Cổng chuyển tiếp bận)',
          honestDetail: `Không thể kết nối cổng chuyển tiếp (${err?.message || 'Lỗi mạng'}). Báo lỗi đã được giữ an toàn bên dưới để gửi qua Gmail.`,
          channelRef: targetChannelFingerprint
        };
      } finally {
        if (timer) clearTimeout(timer);
      }
    }
  }

  // ==========================================================================
  // LỚP 7: RENDER GIAO DIỆN TAB 6 & ĐIỀU PHỐI NGƯỜI DÙNG
  // ==========================================================================
  class BugReportStudioController {
    constructor() {
      this.secHelper = new BugReportSecurityHelper();
      this.scrubber = new BugReportSecretScrubber();
      this.collector = new RuntimeDiagnosticCollector();
      this.validator = new BugReportValidatorAndClassifier(this.secHelper);
      this.outbox = new BugReportOutboxVault();
      this.transport = new DocRelayTransportClient(this.secHelper);

      this.selectedTags = new Set();
      this.isExpanded = false;
      this.isSubmitting = false;
      this.lastSubmittedReceipt = null;
      this.initialized = false;
    }

    async init() {
      if (this.initialized) return this;
      this.initialized = true;
      await this.outbox.loadAll();
      this.mountTab6Card();
      this.restoreDraftIntoForm();
      this.renderOutboxList();
      return this;
    }

    getUiPrefs() {
      try {
        const raw = localStorage.getItem(MOD34_CONSTANTS.UI_PREFS_STORAGE_KEY);
        return raw ? JSON.parse(raw) : { autoIncludeDiagnostics: true };
      } catch (_) {
        return { autoIncludeDiagnostics: true };
      }
    }

    saveUiPrefs(prefs) {
      try {
        localStorage.setItem(MOD34_CONSTANTS.UI_PREFS_STORAGE_KEY, JSON.stringify(prefs || {}));
      } catch (_) {}
    }

    mountTab6Card() {
      if (typeof document === 'undefined') return;
      const root = document.getElementById('tab6-bug-report-card-root');
      if (!root) return;

      const esc = (v) => this.secHelper.escapeHtmlSafe(v);
      const locationOptionsHtml = BUG_LOCATION_CATALOG.map(
        (loc) => `<option value="${esc(loc.id)}">${esc(loc.label)}</option>`
      ).join('');

      const tagButtonsHtml = APPEARANCE_PRESET_TAGS.map(
        (tag) => `
          <button
            type="button"
            data-mod34-tag="${esc(tag.id)}"
            class="mod34-tag-chip px-2.5 py-1 rounded-lg border border-zinc-700 bg-zinc-950/90 hover:border-rose-400/70 text-[11px] font-semibold text-zinc-300 transition"
          >
            + ${esc(tag.label)}
          </button>
        `
      ).join('');

      const prefs = this.getUiPrefs();

      root.innerHTML = `
        <div class="flex flex-wrap items-start justify-between gap-3">
          <button
            type="button"
            id="btn-mod34-toggle-collapse"
            aria-expanded="false"
            class="text-left flex-1 min-w-[220px] group focus:outline-none"
          >
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/45 text-rose-300 font-extrabold text-[10px]">
                🐞 MODULE 34
              </span>
              <h3 class="text-sm sm:text-base font-extrabold text-rose-300 group-hover:text-rose-200 transition">
                Báo Lỗi &amp; Góp Ý Cải Thiện Web (Report Bug)
              </h3>
              <span id="mod34-collapse-arrow" class="text-xs text-zinc-400 transition-transform">▾</span>
            </div>
            <p class="text-[11px] text-zinc-400 mt-1 leading-relaxed">
              Gặp nút khó bấm, lỗi hiển thị hoặc tính năng hoạt động chưa mượt? Bấm mở khung này để báo cho tác giả sửa nhanh nhất nhé.
            </p>
          </button>

          <div class="flex items-center gap-2 shrink-0">
            <span id="mod34-outbox-badge" class="px-2.5 py-1 rounded-xl bg-rose-500/15 border border-rose-500/35 font-monoCode text-[11px] font-bold text-rose-300">
              ${this.outbox.records.length} biên nhận
            </span>
            <button
              type="button"
              id="btn-mod34-quick-open-form"
              class="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow transition"
            >
              ✍️ Viết Báo Lỗi
            </button>
          </div>
        </div>

        <div id="mod34-bug-report-collapsible-body" class="hidden pt-3 border-t border-zinc-800 space-y-3.5 text-xs">
          <!-- Khu vực Thông báo Cảm ơn sau khi gửi thành công -->
          <div id="mod34-thank-you-banner" class="hidden rounded-2xl border-2 border-emerald-500/60 bg-emerald-950/45 p-4 space-y-2.5 shadow-lg">
            <div class="flex items-start justify-between gap-2">
              <div class="font-extrabold text-sm text-emerald-300">
                💖 Mình cảm ơn bạn đã report bug giúp mình nhé!
              </div>
              <button type="button" id="btn-mod34-dismiss-thanks" class="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-[11px] text-zinc-300">
                ✕ Đóng
              </button>
            </div>
            <p class="text-xs text-emerald-100 leading-relaxed">
              Mình cảm ơn bạn đã report bug giúp mình nhé, đây là động lực để mình phát triển trang web tốt hơn nữa trong tương lai!
            </p>
            <div id="mod34-delivery-truth-line" class="text-[11px] text-zinc-200 bg-zinc-950/80 border border-zinc-800 rounded-xl p-2.5"></div>
            <div class="flex flex-wrap items-center gap-2 pt-1">
              <button type="button" id="btn-mod34-copy-last-report" class="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold text-[11px] transition">
                📋 Chép nội dung báo lỗi
              </button>
              <a id="link-mod34-gmail-fallback" href="mailto:${esc(MOD34_CONSTANTS.AUTHOR_CONTACT_EMAIL)}" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] transition inline-flex items-center gap-1.5">
                ✉️ Gửi thẳng qua Gmail (${esc(MOD34_CONSTANTS.AUTHOR_CONTACT_EMAIL)})
              </a>
            </div>
          </div>

          <!-- Biểu mẫu báo lỗi 3 câu hỏi trọng tâm -->
          <div class="space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label for="mod34-select-bug-location" class="block font-bold text-zinc-200 text-[11px]">
                  1. Lỗi này xảy ra ở đâu?
                </label>
                <select id="mod34-select-bug-location" class="noir-dark-select w-full px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-950 text-white font-semibold text-xs focus:outline-none focus:border-rose-400">
                  ${locationOptionsHtml}
                </select>
              </div>
              <div class="space-y-1">
                <label for="mod34-input-custom-where" class="block font-bold text-zinc-200 text-[11px]">
                  Tên nút / vị trí cụ thể (nếu nhớ rõ):
                </label>
                <input
                  id="mod34-input-custom-where"
                  type="text"
                  maxlength="240"
                  placeholder="Ví dụ: Thanh tiêu đề Tab 2, Nút lọc Nháp, Ô chọn Font Tab 5..."
                  class="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-950 text-zinc-100 text-xs select-text focus:outline-none focus:border-rose-400"
                />
              </div>
            </div>

            <div class="space-y-1">
              <div class="flex items-center justify-between gap-2">
                <label for="mod34-textarea-bug-what" class="font-bold text-zinc-200 text-[11px]">
                  2. Bạn đang gặp lỗi gì? <span class="text-rose-400">*</span>
                </label>
                <span id="mod34-what-char-count" class="font-monoCode text-[10px] text-zinc-400">0 ký tự</span>
              </div>
              <textarea
                id="mod34-textarea-bug-what"
                rows="3"
                maxlength="${MOD34_CONSTANTS.MAX_FIELD_CHARS}"
                placeholder="Mô tả điều bạn đã bấm hoặc gõ và điều sai lệch xảy ra (Ví dụ: Mình bấm lọc Nháp nhưng vẫn hiện cả chương Đã duyệt...)"
                class="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-950 text-zinc-100 text-xs leading-relaxed select-text focus:outline-none focus:border-rose-400 resize-y"
              ></textarea>
            </div>

            <div class="space-y-1.5">
              <label for="mod34-textarea-bug-visual" class="block font-bold text-zinc-200 text-[11px]">
                3. Nó trông như thế nào? (Mô tả hiện tượng / chọn thẻ nhanh bên dưới)
              </label>
              <div class="flex flex-wrap gap-1.5" id="mod34-appearance-tags-row">
                ${tagButtonsHtml}
              </div>
              <textarea
                id="mod34-textarea-bug-visual"
                rows="2"
                maxlength="${MOD34_CONSTANTS.MAX_FIELD_CHARS}"
                placeholder="Ví dụ: Chữ vàng trên nền xám khó đọc, hai nút đè viền lên nhau, trang tự load lại về cổng kết nối..."
                class="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-950 text-zinc-100 text-xs leading-relaxed select-text focus:outline-none focus:border-rose-400 resize-y"
              ></textarea>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
              <label class="inline-flex items-center gap-2 text-[11px] text-zinc-300 cursor-pointer select-none">
                <input
                  id="mod34-checkbox-include-diag"
                  type="checkbox"
                  ${prefs.autoIncludeDiagnostics !== false ? 'checked' : ''}
                  class="rounded border-zinc-600 accent-rose-500"
                />
                <span>Đính kèm thông số kỹ thuật an toàn (Màn hình, Tab, Trình duyệt — Không gửi API Key hay truyện)</span>
              </label>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-mod34-clear-form"
                  class="px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs transition"
                >
                  🧹 Xóa nháp
                </button>
                <button
                  type="button"
                  id="btn-mod34-submit-report"
                  class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg transition flex items-center gap-1.5"
                >
                  <span>📨 Gửi Báo Lỗi Ngay</span>
                </button>
              </div>
            </div>

            <div id="mod34-validation-alert" class="hidden rounded-xl border border-amber-500/45 bg-amber-950/40 px-3 py-2 text-[11px] text-amber-200"></div>
          </div>

          <!-- Lịch sử biên nhận báo lỗi đã gửi (Lưu riêng trên máy người dùng) -->
          <div class="pt-3 border-t border-zinc-800/80 space-y-2">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="font-bold text-zinc-300 text-[11px]">📋 Biên nhận báo lỗi đã ghi nhận gần đây:</span>
              <div class="flex items-center gap-1.5">
                <button type="button" id="btn-mod34-export-outbox-json" class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-[10px] transition">
                  ⬇️ Tải nhật ký lỗi (.JSON)
                </button>
              </div>
            </div>
            <div id="mod34-outbox-list" class="max-h-48 overflow-y-auto space-y-2 pr-1"></div>
          </div>
        </div>
      `;

      this.bindCardEvents();
    }

    setExpanded(expanded) {
      this.isExpanded = Boolean(expanded);
      const body = document.getElementById('mod34-bug-report-collapsible-body');
      const toggleBtn = document.getElementById('btn-mod34-toggle-collapse');
      const arrow = document.getElementById('mod34-collapse-arrow');
      if (body) {
        if (this.isExpanded) {
          body.classList.remove('hidden');
        } else {
          body.classList.add('hidden');
        }
      }
      if (toggleBtn) {
        toggleBtn.setAttribute('aria-expanded', this.isExpanded ? 'true' : 'false');
      }
      if (arrow) {
        arrow.style.transform = this.isExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    }

    bindCardEvents() {
      const bind = (id, evt, handler) => {
        const el = document.getElementById(id);
        if (!el || el.dataset.noirMod34Bound) return;
        el.dataset.noirMod34Bound = '1';
        el.addEventListener(evt, handler);
      };

      bind('btn-mod34-toggle-collapse', 'click', () => {
        this.setExpanded(!this.isExpanded);
      });

      bind('btn-mod34-quick-open-form', 'click', () => {
        this.setExpanded(true);
        document.getElementById('mod34-textarea-bug-what')?.focus();
      });

      bind('btn-mod34-dismiss-thanks', 'click', () => {
        document.getElementById('mod34-thank-you-banner')?.classList.add('hidden');
      });

      bind('btn-mod34-submit-report', 'click', () => this.handleSubmitReport());
      bind('btn-mod34-clear-form', 'click', () => this.resetFormAndDraft());
      bind('btn-mod34-copy-last-report', 'click', () => this.copyLastReportToClipboard());
      bind('btn-mod34-export-outbox-json', 'click', () => this.exportOutboxJson());

      const diagCheck = document.getElementById('mod34-checkbox-include-diag');
      if (diagCheck && !diagCheck.dataset.noirMod34Bound) {
        diagCheck.dataset.noirMod34Bound = '1';
        diagCheck.addEventListener('change', () => {
          this.saveUiPrefs({ autoIncludeDiagnostics: Boolean(diagCheck.checked) });
        });
      }

      const saveDraftHandler = () => {
        this.updateWhatCounterUI();
        this.outbox.saveDraftState(this.readCurrentFormValues());
      };

      ['mod34-select-bug-location', 'mod34-input-custom-where', 'mod34-textarea-bug-what', 'mod34-textarea-bug-visual'].forEach(
        (id) => {
          const el = document.getElementById(id);
          if (!el || el.dataset.noirMod34DraftBound) return;
          el.dataset.noirMod34DraftBound = '1';
          el.addEventListener('input', saveDraftHandler);
          el.addEventListener('change', saveDraftHandler);
        }
      );

      document.querySelectorAll('.mod34-tag-chip').forEach((btn) => {
        if (btn.dataset.noirMod34Bound) return;
        btn.dataset.noirMod34Bound = '1';
        btn.addEventListener('click', () => {
          const tagId = btn.getAttribute('data-mod34-tag');
          if (!tagId) return;
          if (this.selectedTags.has(tagId)) {
            this.selectedTags.delete(tagId);
          } else {
            this.selectedTags.add(tagId);
          }
          this.syncTagChipStyles();
          saveDraftHandler();
        });
      });
    }

    syncTagChipStyles() {
      document.querySelectorAll('.mod34-tag-chip').forEach((btn) => {
        const tagId = btn.getAttribute('data-mod34-tag');
        const active = tagId && this.selectedTags.has(tagId);
        if (active) {
          btn.classList.add('bg-rose-600/30', 'border-rose-400', 'text-white');
          btn.classList.remove('bg-zinc-950/90', 'border-zinc-700', 'text-zinc-300');
        } else {
          btn.classList.remove('bg-rose-600/30', 'border-rose-400', 'text-white');
          btn.classList.add('bg-zinc-950/90', 'border-zinc-700', 'text-zinc-300');
        }
      });
    }

    readCurrentFormValues() {
      return {
        locationId: document.getElementById('mod34-select-bug-location')?.value || 'TAB_1_EDITOR',
        customWhere: document.getElementById('mod34-input-custom-where')?.value || '',
        bugWhat: document.getElementById('mod34-textarea-bug-what')?.value || '',
        bugVisual: document.getElementById('mod34-textarea-bug-visual')?.value || '',
        selectedTags: Array.from(this.selectedTags)
      };
    }

    restoreDraftIntoForm() {
      const draft = this.outbox.loadDraftState();
      if (!draft) {
        this.updateWhatCounterUI();
        return;
      }
      const locEl = document.getElementById('mod34-select-bug-location');
      const customEl = document.getElementById('mod34-input-custom-where');
      const whatEl = document.getElementById('mod34-textarea-bug-what');
      const visualEl = document.getElementById('mod34-textarea-bug-visual');

      if (locEl && draft.locationId) locEl.value = draft.locationId;
      if (customEl && draft.customWhere) customEl.value = draft.customWhere;
      if (whatEl && draft.bugWhat) whatEl.value = draft.bugWhat;
      if (visualEl && draft.bugVisual) visualEl.value = draft.bugVisual;
      if (Array.isArray(draft.selectedTags)) {
        this.selectedTags = new Set(draft.selectedTags);
        this.syncTagChipStyles();
      }
      this.updateWhatCounterUI();
    }

    updateWhatCounterUI() {
      const whatEl = document.getElementById('mod34-textarea-bug-what');
      const counterEl = document.getElementById('mod34-what-char-count');
      if (counterEl && whatEl) {
        counterEl.textContent = `${String(whatEl.value || '').length.toLocaleString('vi-VN')} ký tự`;
      }
    }

    showValidationMessage(messages = [], isError = true) {
      const box = document.getElementById('mod34-validation-alert');
      if (!box) return;
      if (!messages || messages.length === 0) {
        box.classList.add('hidden');
        box.textContent = '';
        return;
      }
      box.classList.remove('hidden');
      box.className = isError
        ? 'rounded-xl border border-rose-500/55 bg-rose-950/50 px-3 py-2 text-[11px] text-rose-200'
        : 'rounded-xl border border-amber-500/45 bg-amber-950/40 px-3 py-2 text-[11px] text-amber-200';
      box.textContent = messages.map((m) => m.message || m).join(' ');
    }

    resetFormAndDraft() {
      const customEl = document.getElementById('mod34-input-custom-where');
      const whatEl = document.getElementById('mod34-textarea-bug-what');
      const visualEl = document.getElementById('mod34-textarea-bug-visual');
      if (customEl) customEl.value = '';
      if (whatEl) whatEl.value = '';
      if (visualEl) visualEl.value = '';
      this.selectedTags.clear();
      this.syncTagChipStyles();
      this.outbox.clearDraftState();
      this.showValidationMessage([], false);
      this.updateWhatCounterUI();
    }

    async handleSubmitReport(overrideValues = null) {
      if (this.isSubmitting) return null;
      this.isSubmitting = true;
      const submitBtn = document.getElementById('btn-mod34-submit-report');
      if (submitBtn) submitBtn.disabled = true;

      try {
        const raw = overrideValues || this.readCurrentFormValues();
        const validation = this.validator.validateFormInput(raw);
        if (!validation.valid) {
          this.showValidationMessage(validation.errors, true);
          NS.uiUtils?.showToast?.(validation.errors[0]?.message || 'Vui lòng mô tả lỗi trước khi gửi.', 'warning');
          return null;
        }

        const rateCheck = this.outbox.checkDuplicateOrRateLimit(validation.normalized.fingerprint);
        if (rateCheck.blocked) {
          this.showValidationMessage([{ message: rateCheck.message }], false);
          return null;
        }

        this.showValidationMessage([], false);

        // Lọc bỏ mọi khóa API / chuỗi nhạy cảm trước khi lưu hoặc gửi đi
        const scrubbed = this.scrubber.scrubReportPayload(validation.normalized);
        const includeDiag = Boolean(
          document.getElementById('mod34-checkbox-include-diag')?.checked ?? true
        );
        const diagnostics = this.collector.collectSafeDiagnostics(includeDiag);

        const record = {
          id: `BUG_${Date.now().toString(36).toUpperCase()}_${Math.random()
            .toString(36)
            .slice(2, 6)
            .toUpperCase()}`,
          createdAt: Date.now(),
          ...scrubbed.sanitized,
          diagnostics,
          securityNotice: scrubbed.securityNotice,
          deliveryStatus: 'SENDING',
          deliveryLabel: 'Đang chuyển tiếp...'
        };

        await this.outbox.addReportRecord(record);

        const dispatchRes = await this.transport.dispatchToRelay(record);
        const updatedRecord = await this.outbox.updateReportStatus(record.id, {
          deliveryStatus: dispatchRes.deliveryMode,
          deliveryLabel: dispatchRes.statusLabel,
          deliveredToCloud: dispatchRes.deliveredToCloud
        });

        this.lastSubmittedReceipt = updatedRecord || record;
        this.renderThankYouState(this.lastSubmittedReceipt, dispatchRes);
        this.renderOutboxList();
        this.resetFormAndDraft();

        NS.uiUtils?.showToast?.(
          '💖 Cảm ơn bạn đã report bug! Biên nhận báo lỗi đã được ghi nhận.',
          'success',
          4200
        );
        return this.lastSubmittedReceipt;
      } finally {
        this.isSubmitting = false;
        if (submitBtn) submitBtn.disabled = false;
      }
    }

    renderThankYouState(record, dispatchRes) {
      const banner = document.getElementById('mod34-thank-you-banner');
      const truthEl = document.getElementById('mod34-delivery-truth-line');
      const gmailLink = document.getElementById('link-mod34-gmail-fallback');
      if (!banner) return;

      const secNote = record.securityNotice?.hadSecretsRedacted
        ? ` (Đã tự động che ${record.securityNotice.redactedCount} chuỗi khóa nhạy cảm để bảo mật cho bạn.)`
        : '';

      if (truthEl) {
        truthEl.textContent = `📌 Mã biên nhận ${record.id}: ${dispatchRes.honestDetail}${secNote}`;
      }
      if (gmailLink) {
        gmailLink.href = this.transport.buildGmailComposeUrl(record);
      }
      banner.classList.remove('hidden');
    }

    renderOutboxList() {
      const badge = document.getElementById('mod34-outbox-badge');
      if (badge) {
        badge.textContent = `${this.outbox.records.length} biên nhận`;
      }

      const container = document.getElementById('mod34-outbox-list');
      if (!container) return;
      const esc = (v) => this.secHelper.escapeHtmlSafe(v);

      if (this.outbox.records.length === 0) {
        container.innerHTML = `
          <div class="p-3 rounded-xl border border-dashed border-zinc-800 text-center text-[11px] text-zinc-500">
            Chưa có báo lỗi nào được ghi nhận từ phiên làm việc của bạn.
          </div>
        `;
        return;
      }

      container.innerHTML = this.outbox.records
        .slice(0, 12)
        .map((r) => {
          const sev = SEVERITY_PROFILES[r.severityCode] || SEVERITY_PROFILES.MEDIUM;
          const statusColor = r.deliveredToCloud
            ? 'text-emerald-300 border-emerald-500/40 bg-emerald-500/15'
            : 'text-amber-300 border-amber-500/40 bg-amber-500/15';
          return `
            <div class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-950/90 space-y-1.5">
              <div class="flex flex-wrap items-center justify-between gap-1.5 text-[10px]">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="font-monoCode font-bold text-zinc-200">${esc(r.id)}</span>
                  <span class="px-1.5 py-0.5 rounded border ${sev.badgeClass} font-bold">${esc(r.severityCode)}</span>
                  <span class="px-1.5 py-0.5 rounded border ${statusColor} font-bold">${esc(r.deliveryLabel || 'Đã lưu')}</span>
                </div>
                <span class="text-zinc-500">${esc(this.secHelper.formatTimestampVN(r.createdAt))}</span>
              </div>
              <div class="text-[11px] font-bold text-rose-200">${esc(r.whereLabel)}</div>
              <div class="text-[11px] text-zinc-300 line-clamp-2">${esc(r.bugWhat)}</div>
              <div class="flex flex-wrap items-center gap-1.5 pt-0.5">
                <button type="button" data-mod34-copy-id="${esc(r.id)}" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold">📋 Chép lại</button>
                <a href="${esc(this.transport.buildGmailComposeUrl(r))}" class="px-2 py-0.5 rounded bg-indigo-600/25 hover:bg-indigo-600/40 border border-indigo-500/35 text-indigo-200 text-[10px] font-bold">✉️ Gửi Gmail</a>
                <button type="button" data-mod34-delete-id="${esc(r.id)}" class="px-2 py-0.5 rounded hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold">🗑️ Xóa</button>
              </div>
            </div>
          `;
        })
        .join('');

      container.querySelectorAll('[data-mod34-copy-id]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-mod34-copy-id');
          const rec = this.outbox.records.find((x) => x.id === id);
          if (rec) this.copyRecordTextToClipboard(rec);
        });
      });

      container.querySelectorAll('[data-mod34-delete-id]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-mod34-delete-id');
          if (!id) return;
          await this.outbox.removeReportById(id);
          this.renderOutboxList();
        });
      });
    }

    async copyRecordTextToClipboard(record) {
      const text = this.transport.buildStructuredReportPlainText(record);
      try {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          NS.uiUtils?.showToast?.('📋 Đã chép đầy đủ nội dung báo lỗi vào khay nhớ tạm!', 'success');
          return true;
        }
      } catch (_) {}
      return false;
    }

    async copyLastReportToClipboard() {
      if (!this.lastSubmittedReceipt) return false;
      return this.copyRecordTextToClipboard(this.lastSubmittedReceipt);
    }

    exportOutboxJson() {
      const safeExport = {
        exportedAt: new Date().toISOString(),
        appVersion: MOD34_CONSTANTS.VERSION,
        totalReports: this.outbox.records.length,
        reports: this.outbox.records
      };
      const jsonStr = JSON.stringify(safeExport, null, 2);
      try {
        const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bao-loi-bi-novel-studio-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        NS.uiUtils?.showToast?.('⬇️ Đã tải xuống nhật ký báo lỗi (.JSON)!', 'success');
      } catch (_) {}
      return safeExport;
    }

    getHealthSummary() {
      return {
        moduleKey: MOD34_CONSTANTS.MODULE_KEY,
        initialized: this.initialized,
        totalOutboxReports: this.outbox.records.length,
        hasRelayEndpoint: Boolean(this.transport.getConfiguredRelayUrl()),
        lastSubmittedId: this.lastSubmittedReceipt?.id || null
      };
    }
  }

  // ==========================================================================
  // LỚP 8: CƠ SỞ TRI THỨC TỰ CHẨN ĐOÁN & KHẮC PHỤC SỰ CỐ TẠI CHỖ
  //         (SymptomResolutionKnowledgeBase & LocalAutoTriageInspector)
  // ==========================================================================
  const SYMPTOM_RESOLUTION_MATRIX = Object.freeze([
    {
      id: 'SYMPTOM_API_VERIFY_FAIL',
      keywords: ['api', 'key', 'verify', 'flash-lite', 'endpoint', 'quota', 'hạn mức'],
      title: 'Khóa Gemini API chưa xác thực được hoặc báo hết hạn mức',
      probableCauses: [
        'Chuỗi khóa dán vào bị thiếu ký tự đầu hoặc dính khoảng trắng thừa ở hai đầu.',
        'Khóa API mới tạo trên Google AI Studio chưa bật Generative Language API.',
        'Mô hình đang chọn vượt hạn mức theo phút (RPM) hoặc gói miễn phí không mở Argon 4 / Carbon 4.'
      ],
      quickSteps: [
        'Bấm nút Mở Google AI Studio ở Bước 1 để sao chép lại nguyên vẹn mã khóa bắt đầu bằng AIzaSy... hoặc AQ....',
        'Thử bấm Tự Động Kiểm Tra Bằng Gemini Flash-Lite khi kết nối mạng ổn định.',
        'Trong trường hợp viết dài vượt hạn mức API, dùng nút Copy Prompt Tổng sang Gemini Web hoặc đổi về Gemini Flash.'
      ]
    },
    {
      id: 'SYMPTOM_FOLDER_NOT_SYNCED',
      keywords: ['thư mục', 'folder', 'ổ cứng', 'lưu', 'file', 'quyền', 'chọn thư mục'],
      title: 'Chọn thư mục ổ cứng không nhận hoặc không thấy lưu tệp',
      probableCauses: [
        'Trình duyệt chưa cấp quyền Đọc/Ghi (ReadWrite) trong hộp thoại xác nhận hệ thống.',
        'Mở file HTML trên trình duyệt chưa hỗ trợ File System Access API (ví dụ trình duyệt nhúng hoặc Safari cũ).',
        'Thư mục được chọn nằm ở vùng hệ thống bị Windows bảo vệ (C:\\Windows, Program Files).'
      ],
      quickSteps: [
        'Tạo một thư mục riêng ngoài Desktop hoặc ổ D (ví dụ D:\\TruyenCuaToi) rồi chọn lại.',
        'Bấm Cho phép chỉnh sửa tệp khi Chrome hoặc Edge hiện cửa sổ hỏi quyền.',
        'Kiểm tra tình trạng lưu ở nút Tự Lưu 3 Tầng tại góc trái thanh trên cùng.'
      ]
    },
    {
      id: 'SYMPTOM_UNEXPECTED_RELOAD',
      keywords: ['reload', 'tải lại', 'quay về', 'cổng kết nối', 'backspace', 'mất trạng thái'],
      title: 'Đang gõ văn bản hoặc nhấn Backspace thì trang bị tải lại',
      probableCauses: [
        'Công cụ máy chủ phát triển cục bộ (Live Server) phát hiện tệp .crswap/.json đổi khi thư mục truyện nằm lồng bên trong thư mục mã nguồn.',
        'Nhấn phím Backspace ngoài ô nhập liệu trên một số trình duyệt cũ kích hoạt quay lại trang trước.'
      ],
      quickSteps: [
        'Luôn lưu thư mục truyện tách riêng khỏi thư mục mã nguồn HTML.',
        'Module 36 (Zero-Reload Save Shield) đang tự động chặn tín hiệu reload từ WebSocket và sự kiện form/navigation.',
        'Bấm Kiểm tra Khiên Chống Reload ở cuối Tab 6 để xem số lượt tải lại đã được chặn an toàn.'
      ]
    },
    {
      id: 'SYMPTOM_UI_OVERLAP_OR_SELECT',
      keywords: ['đè chữ', 'dropdown', 'select', 'khó nhìn', 'màu chữ', 'nền trắng', 'tràn viền'],
      title: 'Thanh công cụ bị chật hẹp hoặc danh sách chọn (Dropdown) khó đọc',
      probableCauses: [
        'Khung trình duyệt thu hẹp khiến tiêu đề dài chèn ép sang cụm thống kê từ.',
        'Danh sách thả xuống kế thừa bảng màu mặc định sáng của hệ điều hành trên nền tối.'
      ],
      quickSteps: [
        'Rút gọn các thanh phụ bằng nút Thu gọn trong Tab 5 / Tab 6 hoặc nhấn nút Mở rộng ở thanh tiêu đề.',
        'Nếu vẫn thấy chữ chèn ép trên độ phân giải màn hình riêng, hãy gửi kèm kích thước màn hình qua ô Report Bug.'
      ]
    },
    {
      id: 'SYMPTOM_STORY_BIBLE_LAG',
      keywords: ['story bible', 'quên', 'notebooklm', 'nhân vật', 'ai biết gì', 'phục bút'],
      title: 'Story Bible thiếu chi tiết khi truyện quá dài hoặc cần đối chiếu hàng trăm chương',
      probableCauses: [
        'Bản thảo đã vượt ngưỡng ngữ cảnh ngắn hạn của mô hình thông thường hoặc chưa chốt duyệt các chương mới.',
        'Tác giả chưa đồng bộ kết quả phân tích từ NotebookLM vào Khung Story Bible Chính Thức.'
      ],
      quickSteps: [
        'Vào Tab 1 bấm Duyệt & Chốt Bản Thảo cho tất cả chương hoàn thiện để kích hoạt trích xuất tự động.',
        'Hoặc xuất toàn bộ bản thảo PDF tại Tab 4 -> tải lên NotebookLM -> dán kết quả vào Ô 2 Nội dung Story Bible Chính Thức.'
      ]
    },
    {
      id: 'SYMPTOM_AI_MARKDOWN_SYMBOLS',
      keywords: ['**', '###', 'markdown', 'ký hiệu', 'sao', 'gạch ngang', 'đầu ra ai'],
      title: 'Đầu ra AI có ký hiệu định dạng lạ hoặc thiếu mạch cốt truyện',
      probableCauses: [
        'Chưa lập dàn ý ở Chế độ 2 trước khi viết ở Chế độ 1 khiến AI tự suy diễn tua nhanh.',
        'Phản hồi AI chèn các dấu trang trí thô cần bộ lọc gọt sạch.'
      ],
      quickSteps: [
        'Phát triển diễn biến từng cảnh ở Chế độ 2 trước, sau đó chuyển sang Chế độ 1 để Prompt Tổng tự động lồng ghép.',
        'Bộ lọc tự động trên toàn Studio sẽ bóc tách ký hiệu Markdown thừa trước khi nạp vào Tab 3 và Chat Viên Bi Số 8.'
      ]
    }
  ]);

  class LocalAutoTriageInspector {
    constructor(collector, outboxVault) {
      this.collector = collector;
      this.outbox = outboxVault;
    }

    runComprehensiveLocalHealthCheck() {
      const checks = [];
      const diag = this.collector.collectSafeDiagnostics(true);

      // 1. Kiểm tra tải đầy đủ các module trong window.NoirStudio
      const regCount = NS.registry ? Object.keys(NS.registry).length : 0;
      checks.push({
        id: 'CHECK_MODULES_LOADED',
        label: 'Kiểm tra hệ sinh thái module Studio',
        status: regCount >= 30 ? 'PASS' : 'WARN',
        detail: `Đã nạp ${regCount} module đang hoạt động đồng bộ.`
      });

      // 2. Kiểm tra bộ nhớ lưu trữ trình duyệt (localStorage + IndexedDB)
      let lsAvailable = false;
      let usedBytes = 0;
      try {
        const testKey = '__mod34_ls_probe__';
        localStorage.setItem(testKey, '1');
        localStorage.removeItem(testKey);
        lsAvailable = true;
        for (let i = 0; i < localStorage.length; i += 1) {
          const k = localStorage.key(i) || '';
          const v = localStorage.getItem(k) || '';
          usedBytes += (k.length + v.length) * 2;
        }
      } catch (_) {}
      checks.push({
        id: 'CHECK_BROWSER_STORAGE',
        label: 'Kiểm tra kho lưu trữ cục bộ (Tầng 1 & Tầng 2)',
        status: lsAvailable && typeof indexedDB !== 'undefined' ? 'PASS' : 'WARN',
        detail: lsAvailable
          ? `LocalStorage sẵn sàng (đang dùng ~${Math.round(usedBytes / 1024)} KB) & IndexedDB khả dụng.`
          : 'Bộ nhớ cục bộ bị giới hạn bởi chế độ ẩn danh hoặc chính sách trình duyệt.'
      });

      // 3. Kiểm tra trạng thái Zero-Reload Shield
      const shield = typeof window !== 'undefined' ? window.__NOIR_ZERO_RELOAD_SHIELD__ : null;
      checks.push({
        id: 'CHECK_ZERO_RELOAD_SHIELD',
        label: 'Kiểm tra Khiên Chống Tải Lại Trang (Mod 36)',
        status: shield && shield.active ? 'PASS' : 'WARN',
        detail: shield
          ? `Đang kích hoạt · Đã chặn ${shield.blockedReloadFrames || 0} tín hiệu tự reload không mong muốn.`
          : 'Chưa phát hiện cờ bảo vệ WebSocket toàn cục.'
      });

      // 4. Kiểm tra trạng thái API Key & Bộ chọn thư mục
      const hasKey =
        typeof NS.geminiRouter?.hasValidStoredKey === 'function'
          ? NS.geminiRouter.hasValidStoredKey()
          : Boolean(NS.geminiRouter?.getPrimaryApiKey?.());
      const hasDirApi = typeof window !== 'undefined' && typeof window.showDirectoryPicker === 'function';
      checks.push({
        id: 'CHECK_CONNECTION_READINESS',
        label: 'Kiểm tra kết nối Gemini API & File System API',
        status: hasKey ? 'PASS' : 'WARN',
        detail: `API Key: ${hasKey ? 'Đã cấu hình' : 'Chưa phát hiện key'} · Bộ chọn thư mục gốc: ${
          hasDirApi ? 'Trình duyệt hỗ trợ đầy đủ' : 'Chế độ Web/Mobile dự phòng'
        }.`
      });

      // 5. Kiểm tra phần tử giao diện bị trùng ID (DOM Integrity)
      let duplicateIdsCount = 0;
      if (typeof document !== 'undefined') {
        const seen = new Set();
        document.querySelectorAll('[id]').forEach((el) => {
          const id = el.id;
          if (seen.has(id)) duplicateIdsCount += 1;
          else seen.add(id);
        });
      }
      checks.push({
        id: 'CHECK_DOM_UNIQUE_IDS',
        label: 'Kiểm tra tính duy nhất của mã định danh giao diện (DOM IDs)',
        status: duplicateIdsCount === 0 ? 'PASS' : 'FAIL',
        detail:
          duplicateIdsCount === 0
            ? 'Không có phần tử DOM nào trùng ID gây xung đột sự kiện.'
            : `Phát hiện ${duplicateIdsCount} phần tử bị trùng ID trên trang.`
      });

      // 6. Kiểm tra đồng bộ bộ lọc chương Tab 2
      const filterBtns =
        typeof document !== 'undefined'
          ? document.querySelectorAll('.chapter-filter-btn').length
          : 0;
      checks.push({
        id: 'CHECK_CHAPTER_FILTERS',
        label: 'Kiểm tra nút lọc trạng thái chương Tab 2 (Tất cả / Nháp / Đã duyệt)',
        status: filterBtns >= 3 ? 'PASS' : 'WARN',
        detail: `Tìm thấy ${filterBtns} nút lọc trạng thái chương đang gắn trên giao diện.`
      });

      const passCount = checks.filter((c) => c.status === 'PASS').length;
      return {
        checkedAt: Date.now(),
        scorePercent: Math.round((passCount / checks.length) * 100),
        passCount,
        totalChecks: checks.length,
        diagnostics: diag,
        checks
      };
    }

    suggestSymptomSolutions(queryText) {
      const q = String(queryText || '').trim().toLowerCase();
      if (!q) return SYMPTOM_RESOLUTION_MATRIX.slice(0, 3);
      const scored = SYMPTOM_RESOLUTION_MATRIX.map((entry) => {
        let hits = 0;
        for (const kw of entry.keywords) {
          if (q.includes(kw)) hits += 2;
        }
        if (entry.title.toLowerCase().includes(q)) hits += 3;
        return { entry, hits };
      }).sort((a, b) => b.hits - a.hits);

      const matches = scored.filter((s) => s.hits > 0).map((s) => s.entry);
      return matches.length > 0 ? matches : SYMPTOM_RESOLUTION_MATRIX.slice(0, 2);
    }
  }

  class BugReportArchiveExporter {
    constructor(transportClient) {
      this.transport = transportClient;
    }

    buildCsvArchive(records = []) {
      const csvEscape = (cell) => {
        const s = String(cell ?? '').replace(/"/g, '""');
        return `"${s}"`;
      };
      const header = [
        'MaBienNhan',
        'ThoiGian',
        'MucDo',
        'ViTriLoi',
        'MoTaLoi',
        'BieuHienTrucQuan',
        'TrangThaiGui',
        'ManHinh'
      ].join(',');

      const rows = (Array.isArray(records) ? records : []).map((r) =>
        [
          csvEscape(r.id),
          csvEscape(new Date(r.createdAt || Date.now()).toISOString()),
          csvEscape(r.severityCode),
          csvEscape(r.whereLabel),
          csvEscape(r.bugWhat),
          csvEscape(r.bugVisual),
          csvEscape(r.deliveryLabel),
          csvEscape(r.diagnostics?.viewport || '')
        ].join(',')
      );
      return `\uFEFF${[header, ...rows].join('\n')}`;
    }

    buildPlainTextDigest(records = []) {
      const list = Array.isArray(records) ? records : [];
      if (list.length === 0) {
        return 'Chưa có báo lỗi nào được ghi nhận trong hộp chờ.';
      }
      return list
        .map((r, idx) =>
          [
            `================================================================`,
            `BÁO LỖI #${idx + 1}`,
            this.transport.buildStructuredReportPlainText(r)
          ].join('\n')
        )
        .join('\n\n');
    }

    triggerFileDownload(filename, contentStr, mimeType) {
      if (typeof document === 'undefined' || typeof Blob === 'undefined') return false;
      try {
        const blob = new Blob([contentStr], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1200);
        return true;
      } catch (_) {
        return false;
      }
    }
  }

  class OutboxFilterAndAnalyticsEngine {
    filterRecords(records = [], options = {}) {
      const list = Array.isArray(records) ? records : [];
      const severity = String(options.severity || 'ALL').toUpperCase();
      const query = String(options.query || '').trim().toLowerCase();

      return list.filter((rec) => {
        if (severity !== 'ALL' && rec.severityCode !== severity) {
          return false;
        }
        if (query) {
          const hay = `${rec.id || ''} ${rec.whereLabel || ''} ${rec.bugWhat || ''} ${
            rec.bugVisual || ''
          }`.toLowerCase();
          if (!hay.includes(query)) return false;
        }
        return true;
      });
    }

    computeOutboxAnalytics(records = []) {
      const list = Array.isArray(records) ? records : [];
      const bySeverity = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
      const byLocation = {};
      let deliveredCloudCount = 0;

      for (const r of list) {
        if (bySeverity[r.severityCode] !== undefined) {
          bySeverity[r.severityCode] += 1;
        }
        const loc = r.locationId || 'OTHER_AREA';
        byLocation[loc] = (byLocation[loc] || 0) + 1;
        if (r.deliveredToCloud) deliveredCloudCount += 1;
      }

      const sortedLocations = Object.entries(byLocation)
        .sort((a, b) => b[1] - a[1])
        .map(([id, count]) => ({
          id,
          label:
            BUG_LOCATION_CATALOG.find((x) => x.id === id)?.shortTag || 'Khu vực khác',
          count
        }));

      return {
        total: list.length,
        deliveredCloudCount,
        localPendingCount: Math.max(0, list.length - deliveredCloudCount),
        bySeverity,
        topLocations: sortedLocations
      };
    }
  }

  // Gắn bổ sung bộ tự chẩn đoán, phân tích & xuất báo lỗi vào BugReportStudioController
  BugReportStudioController.prototype.attachExtendedToolkits = function () {
    if (!this.triageInspector) {
      this.triageInspector = new LocalAutoTriageInspector(this.collector, this.outbox);
    }
    if (!this.archiveExporter) {
      this.archiveExporter = new BugReportArchiveExporter(this.transport);
    }
    if (!this.outboxAnalytics) {
      this.outboxAnalytics = new OutboxFilterAndAnalyticsEngine();
    }
  };

  const prevMountCard = BugReportStudioController.prototype.mountTab6Card;
  BugReportStudioController.prototype.mountTab6Card = function () {
    this.attachExtendedToolkits();
    prevMountCard.call(this);

    const outboxList = document.getElementById('mod34-outbox-list');
    const outboxParent = outboxList?.parentElement;
    if (outboxParent && !document.getElementById('mod34-triage-toolbar')) {
      const toolbar = document.createElement('div');
      toolbar.id = 'mod34-triage-toolbar';
      toolbar.className = 'flex flex-wrap items-center justify-between gap-2 pb-1';
      toolbar.innerHTML = `
        <div class="flex flex-wrap items-center gap-1.5">
          <button type="button" id="btn-mod34-run-local-triage" class="px-2.5 py-1 rounded-lg bg-indigo-600/25 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-200 font-bold text-[10px] transition">
            🔍 Tự Chẩn Đoán Máy
          </button>
          <button type="button" id="btn-mod34-export-csv" class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-[10px] transition">
            📊 Xuất .CSV
          </button>
          <button type="button" id="btn-mod34-export-txt" class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-[10px] transition">
            📄 Xuất .TXT
          </button>
          <button type="button" id="btn-mod34-clear-outbox" class="px-2.5 py-1 rounded-lg hover:bg-rose-500/20 text-rose-300 font-bold text-[10px] transition">
            🧹 Dọn lịch sử
          </button>
        </div>
        <div id="mod34-triage-result-pill" class="text-[10px] text-zinc-400"></div>
      `;
      outboxParent.insertBefore(toolbar, outboxList);

      document
        .getElementById('btn-mod34-run-local-triage')
        ?.addEventListener('click', () => {
          const res = this.triageInspector.runComprehensiveLocalHealthCheck();
          const pill = document.getElementById('mod34-triage-result-pill');
          if (pill) {
            pill.innerHTML = `<span class="font-bold ${
              res.scorePercent >= 85 ? 'text-emerald-300' : 'text-amber-300'
            }">Sức khỏe kiểm tra tại chỗ: ${res.passCount}/${res.totalChecks} đạt (${res.scorePercent}%)</span>`;
          }
          NS.uiUtils?.showToast?.(
            `🔍 Kiểm tra tại chỗ hoàn tất: ${res.passCount}/${res.totalChecks} hạng mục đạt chuẩn!`,
            res.scorePercent >= 85 ? 'success' : 'info',
            3600
          );
        });

      document.getElementById('btn-mod34-export-csv')?.addEventListener('click', () => {
        const csv = this.archiveExporter.buildCsvArchive(this.outbox.records);
        if (
          this.archiveExporter.triggerFileDownload(
            `bao-loi-bi-novel-${Date.now()}.csv`,
            csv,
            'text/csv;charset=utf-8'
          )
        ) {
          NS.uiUtils?.showToast?.('📊 Đã tải xuống bảng biên nhận lỗi (.CSV)!', 'success');
        }
      });

      document.getElementById('btn-mod34-export-txt')?.addEventListener('click', () => {
        const txt = this.archiveExporter.buildPlainTextDigest(this.outbox.records);
        if (
          this.archiveExporter.triggerFileDownload(
            `bao-loi-bi-novel-${Date.now()}.txt`,
            txt,
            'text/plain;charset=utf-8'
          )
        ) {
          NS.uiUtils?.showToast?.('📄 Đã tải xuống bản tổng hợp báo lỗi (.TXT)!', 'success');
        }
      });

      document.getElementById('btn-mod34-clear-outbox')?.addEventListener('click', async () => {
        if (this.outbox.records.length === 0) return;
        await this.outbox.clearAllRecords();
        this.renderOutboxList();
        NS.uiUtils?.showToast?.('🧹 Đã dọn sạch danh sách biên nhận cũ trên máy.', 'info');
      });
    }

    if (outboxParent && !document.getElementById('mod34-symptom-helper-box')) {
      const helperBox = document.createElement('div');
      helperBox.id = 'mod34-symptom-helper-box';
      helperBox.className =
        'mt-2 p-3 rounded-xl border border-zinc-800 bg-zinc-950/85 space-y-2 text-[11px]';
      helperBox.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="font-bold text-indigo-300">🩺 Gợi Ý Tự Kiểm Tra Nhanh Theo Triệu Chứng:</span>
          <input
            id="mod34-symptom-search-input"
            type="text"
            placeholder="Gõ từ khóa (API, thư mục, đè chữ, reload, markdown)..."
            class="w-full sm:w-64 px-2.5 py-1 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-100 text-[11px] select-text focus:outline-none focus:border-indigo-400"
          />
        </div>
        <div id="mod34-symptom-suggestions-list" class="space-y-1.5"></div>
      `;
      outboxParent.appendChild(helperBox);

      const renderSuggestions = (query) => {
        const listEl = document.getElementById('mod34-symptom-suggestions-list');
        if (!listEl) return;
        const esc = (v) => this.secHelper.escapeHtmlSafe(v);
        const matches = this.triageInspector.suggestSymptomSolutions(query);
        listEl.innerHTML = matches
          .map(
            (m) => `
              <div class="p-2 rounded-lg border border-zinc-800/80 bg-zinc-900/70 space-y-1">
                <div class="font-bold text-zinc-100">${esc(m.title)}</div>
                <ul class="list-disc pl-4 text-zinc-400 space-y-0.5">
                  ${m.quickSteps.map((st) => `<li>${esc(st)}</li>`).join('')}
                </ul>
              </div>
            `
          )
          .join('');
      };

      renderSuggestions('');
      document
        .getElementById('mod34-symptom-search-input')
        ?.addEventListener('input', (e) => renderSuggestions(e?.target?.value || ''));
    }
  };

  class BugReportQuickActionDispatcher {
    constructor(controller) {
      this.controller = controller;
    }

    openPreFilledForArea(locationId, bugSummaryHint = '') {
      this.controller.setExpanded(true);
      const locSel = document.getElementById('mod34-select-bug-location');
      if (locSel && BUG_LOCATION_CATALOG.some((x) => x.id === locationId)) {
        locSel.value = locationId;
      }
      const whatBox = document.getElementById('mod34-textarea-bug-what');
      if (whatBox && bugSummaryHint && !whatBox.value.trim()) {
        whatBox.value = bugSummaryHint;
        this.controller.updateWhatCounterUI();
      }
      document.getElementById('tab6-bug-report-card-root')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      whatBox?.focus();
    }

    getOutboxDigestStats() {
      this.controller.attachExtendedToolkits();
      return this.controller.outboxAnalytics.computeOutboxAnalytics(
        this.controller.outbox.records
      );
    }

    getDiagnosticChecksSummary() {
      this.controller.attachExtendedToolkits();
      return this.controller.triageInspector.runComprehensiveLocalHealthCheck();
    }

    findSolutionsForQuery(queryText) {
      this.controller.attachExtendedToolkits();
      return this.controller.triageInspector.suggestSymptomSolutions(queryText);
    }
  }

  // ==========================================================================
  // ĐĂNG KÝ SINGLETON MODULE 34 LÊN `window.NoirStudio`
  // ==========================================================================
  const bugReportStudio = new BugReportStudioController();
  bugReportStudio.attachExtendedToolkits();
  bugReportStudio.quickActions = new BugReportQuickActionDispatcher(bugReportStudio);
  NS.bugReport = bugReportStudio;
  NS.bugReporter = bugReportStudio;
  NS.Mod34BugReportConstants = MOD34_CONSTANTS;
  NS.Mod34BugLocationCatalog = BUG_LOCATION_CATALOG;
  NS.Mod34SymptomResolutionMatrix = SYMPTOM_RESOLUTION_MATRIX;

  if (typeof NS.registerModule === 'function') {
    NS.registerModule('mod34', bugReportStudio);
  }
})(typeof window !== 'undefined' ? window : globalThis);
