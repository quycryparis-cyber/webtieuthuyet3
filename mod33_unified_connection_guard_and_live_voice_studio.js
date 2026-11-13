/**
 * ============================================================================
 * MODULE 33: BẢO CHỨNG KẾT NỐI API/FOLDER ĐA TẦNG, GIỌNG ĐỌC NEURAL VI/EN
 *            VÀ TRÌNH CHIẾU VIDEO GIAO DIỆN WEB THẬT
 * ============================================================================
 * Phiên bản: v38.3.0-SUPREME-MODULAR (2026)
 * Nhiệm vụ cốt lõi:
 *   1. UnifiedConnectionAndTierSynchronizer (`window.NoirStudio.unifiedConnectionGuard`):
 *      - Đồng bộ 100% trạng thái thực của Gemini API Key (đã verify Flash-Lite),
 *        Thư mục ổ cứng (FileSystem Handle / Mobile Fallback) và Gói tài khoản
 *        (Standard / Pro -> Argon 4 / Ultra -> Carbon 4) sang Tab 6, Mod 31, Header,
 *        Cổng Kết Nối, Két Sắt API và Chatbot Bi Số 8 — sửa dứt điểm lỗi báo sai
 *        "Chưa nối Key / Chưa gắn thư mục".
 *      - Bộ kiểm tra quyền truy cập trực tiếp Argon 4 / Carbon 4 / Pro qua v1beta,
 *        v1alpha và Vertex AI Express cho người dùng đã nâng cấp gói Pro/Ultra.
 *   2. BilingualNeuralVoiceStudio (`window.NoirStudio.neuralVoice`):
 *      - Động cơ chuẩn hóa phát âm Tiếng Việt & Tiếng Anh chuyên sâu: tách cụm
 *        nhịp thở tự nhiên, chuyển đổi ký hiệu kỹ thuật (PDF, DOCX, API, Argon 4,
 *        Carbon 4, 20.000+...), ưu tiên giọng Neural/Online tự nhiên (HoaiMy,
 *        NamMinh, Google Tiếng Việt, Aria/Jenny Natural) thay cho giọng robot cứng.
 *   3. RealDomVideoMirrorRenderer (`window.NoirStudio.liveDomVideoMirror`):
 *      - Nhân bản không-trùng-ID giao diện DOM THẬT của chính trang web đang chạy
 *        vào sân khấu video 1280x720 tỷ lệ chuẩn bên dưới lớp phủ Canvas điều hướng
 *        để video hướng dẫn chiếu chính xác 100% nút bấm và màn hình thật của web.
 *   4. Tab6SpotlightAndCollapseOrchestrator:
 *      - Tối ưu front-end Tab 6 gọn gàng: hiển thị Cụm Mục Nổi Bật Nhất + nút
 *        "Thu gọn hết các mục" / "Mở rộng tất cả" để người dùng đóng/mở tùy ý.
 * ============================================================================
 */
(function initNoirStudioUnifiedConnectionAndVoiceModule(globalScope) {
  'use strict';

  const root = globalScope || (typeof window !== 'undefined' ? window : globalThis);
  root.NoirStudio = root.NoirStudio || {};
  const NS = root.NoirStudio;

  // ==========================================================================
  // PHẦN 1: HẰNG SỐ ĐỊNH HÌNH, BẢNG GÓI TÀI KHOẢN & TỪ ĐIỂN PHÁT ÂM NEURAL
  // ==========================================================================

  const MOD33_CONFIG = Object.freeze({
    MODULE_VERSION: '38.3.0-CONNECTION-VOICE-MIRROR',
    STORAGE_KEYS: Object.freeze({
      PLAN_TIER: 'noir_v40_google_plan_tier_v1',
      PROBED_TIER_CAPS: 'noir_v40_probed_tier_capabilities_v1',
      VOICE_PREFS: 'noir_v40_neural_voice_prefs_v1',
      TAB6_COLLAPSE_MODE: 'noir_v40_tab6_compact_mode_v1',
      MIRROR_VIDEO_MODE: 'noir_v40_video_real_dom_mode_v1',
    }),
    SELECTORS: Object.freeze({
      TAB6_SPOTLIGHT_DOCK: 'tab6-quick-spotlight-dock',
      TAB6_KEY_PILL: 'tab6-live-key-pill',
      TAB6_FOLDER_PILL: 'tab6-live-folder-pill',
      TAB6_TIER_BADGE: 'tab6-plan-tier-badge',
      TAB6_BTN_COLLAPSE_ALL: 'btn-tab6-collapse-all',
      TAB6_BTN_EXPAND_ALL: 'btn-tab6-expand-all',
      VIDEO_FRAME_WRAP: 'mod28-video-frame-wrap',
      VIDEO_MIRROR_STAGE: 'mod33-real-dom-stage',
      VIDEO_MIRROR_VIEWPORT: 'mod33-mirror-viewport',
      VOICE_PICKER_SELECT: 'mod33-voice-select',
      VOICE_QUALITY_PILL: 'mod33-voice-quality-pill',
      VOICE_TEST_BTN: 'mod33-btn-test-voice',
      MIRROR_TOGGLE_BTN: 'mod33-btn-toggle-mirror-mode',
    }),
    VIRTUAL_VIEWPORT_W: 1280,
    VIRTUAL_VIEWPORT_H: 720,
    CHATBOT_DEFAULT_LITE_MODEL: 'gemini-3.5-flash-lite',
  });

  const GOOGLE_PLAN_TIERS_CATALOG = Object.freeze({
    STANDARD: Object.freeze({
      id: 'STANDARD',
      badgeLabel: 'Standard / Free API',
      shortTitle: '⚡ Gói Tiêu Chuẩn (Flash / Flash-Lite)',
      expectedModels: ['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite'],
      advisoryNote:
        'Tối ưu cho tốc độ nhanh và Chatbot Flash-Lite tiết kiệm quota. Có thể nâng cấp gói Pro/Ultra để mở khóa mô hình đại tự sự.',
      preferredDefaultTab3Model: 'gemini-3.8-flash',
    }),
    PRO: Object.freeze({
      id: 'PRO',
      badgeLabel: 'Google AI Pro (Argon 4 Ready)',
      shortTitle: '💎 Gói Pro — Kích hoạt Gemini Argon 4 & 3.1 Pro',
      expectedModels: ['gemini-4-argon', 'gemini-3.1-pro-preview', 'gemini-2.5-pro'],
      advisoryNote:
        'Tài khoản Pro mở quyền chạy Gemini Argon 4 (qua API hỗ trợ hoặc Cầu nối Gemini Web 20.000+ từ) và chuỗi Pro 3.1 / 2.5 sâu tâm lý.',
      preferredDefaultTab3Model: 'gemini-4-argon',
    }),
    ULTRA: Object.freeze({
      id: 'ULTRA',
      badgeLabel: 'Google AI Ultra (Carbon 4 & Argon 4 Ready)',
      shortTitle: '🔥 Gói Ultra — Kích hoạt Gemini Carbon 4 & Argon 4',
      expectedModels: [
        'gemini-4-carbon',
        'gemini-4-argon',
        'gemini-3.1-pro-preview',
        'gemini-2.5-pro',
      ],
      advisoryNote:
        'Tài khoản Ultra cấp cao nhất: ưu tiên Gemini Carbon 4 (tư duy logic & tâm lý chiến đỉnh cao) cùng Argon 4 viết đại tự sự dài hơi.',
      preferredDefaultTab3Model: 'gemini-4-carbon',
    }),
  });

  const VIETNAMESE_NEURAL_LEXICON = Object.freeze([
    [/\bAPI\s*Key\b/gi, 'khóa A P I'],
    [/\bAPI\b/g, 'A P I'],
    [/\bPDF\b/gi, 'Pê Đê Ép'],
    [/\bDOCX\b/gi, 'tệp Guốt Đốc Ích'],
    [/\bEPUB\b/gi, 'sách điện tử I Pắp'],
    [/\bJSON\b/gi, 'Dây Sân'],
    [/\bSVG\b/gi, 'sơ đồ trực quan'],
    [/\bBM25\b/gi, 'tìm kiếm thông minh'],
    [/\bRAG\b/gi, 'truy hồi ngữ cảnh'],
    [/\b60FPS\b/gi, '60 khung hình mỗi giây'],
    [/\b20\.000\+/g, 'hơn hai mươi nghìn'],
    [/\b20000\+/g, 'hơn hai mươi nghìn'],
    [/\b3\.000\s*[-–]\s*4\.000\+/g, 'ba đến hơn bốn nghìn'],
    [/\bNotebookLM\b/gi, 'Sổ tay Nốt Bút Lờ Mờ'],
    [/\bTime-Machine\b/gi, 'Kho Lưu Trữ Thời Gian'],
    [/\bStory Bible\b/gi, 'Hồ sơ Cốt Truyện'],
    [/\bArgon\s*4\b/gi, 'A-gôn bốn'],
    [/\bCarbon\s*4\b/gi, 'Các-bon bốn'],
    [/\bFlash-Lite\b/gi, 'Phờ lát Lai'],
    [/\bFlash\b/gi, 'Phờ lát'],
    [/\bIndexedDB\b/gi, 'kho dữ liệu trình duyệt'],
    [/\bLocalStorage\b/gi, 'bộ nhớ nhanh'],
    [/\bTab\s*([1-6])\b/gi, 'Thẻ số $1'],
    [/\bMod\s*(\d+)\b/gi, 'Mô-đun $1'],
    [/\bBi\s*#?8\b/gi, 'Bi số tám'],
    [/\bVI\/EN\b/gi, 'Việt Anh'],
    [/\b24\/7\b/g, 'hai tư trên bảy'],
    [/\bLight\s*Novel\b/gi, 'Lai No-vồ'],
    [/\bChatbot\b/gi, 'Trợ lý đối thoại'],
    [/\bQuota\b/gi, 'Hạn mức sử dụng'],
    [/\bPrompt\b/gi, 'Câu lệnh hướng dẫn'],
    [/\bTimeline\b/gi, 'Dòng thời gian'],
    [/\bPlot\s*Hole\b/gi, 'Lỗ hổng cốt truyện'],
    [/\bShow,\s*Don'?t\s*Tell\b/gi, 'tả cảnh hành động thay vì kể lể'],
    [/\bReal-?time\b/gi, 'thời gian thực'],
    [/\bCookie\b/gi, 'bộ nhớ lưu phiên'],
    [/\bBackup\b/gi, 'sao lưu dự phòng'],
    [/\bPomodoro\b/gi, 'đồng hồ tập trung Pô-mô-đô-rô'],
    [/\bHighlight\b/gi, 'làm nổi bật'],
    [/\bEndpoint\b/gi, 'cổng kết nối máy chủ'],
    [/\bPro\b/g, 'Pờ-rô'],
    [/\bUltra\b/g, 'An-tra'],
    [/\bAI\b/g, 'trí tuệ nhân tạo'],
  ]);

  const ENGLISH_NEURAL_LEXICON = Object.freeze([
    [/\b60FPS\b/gi, 'sixty frames per second'],
    [/\b20[,.]000\+/g, 'over twenty thousand'],
    [/\bVI\/EN\b/gi, 'Vietnamese and English'],
    [/\bBi\s*#?8\b/gi, 'Magic 8-Ball Bi'],
    [/\bTab\s*([1-6])\b/gi, 'Tab $1'],
    [/\bMod\s*(\d+)\b/gi, 'Module $1'],
    [/\bArgon\s*4\b/gi, 'Argon four'],
    [/\bCarbon\s*4\b/gi, 'Carbon four'],
    [/\bNotebookLM\b/gi, 'Notebook L M'],
    [/\bBM25\b/gi, 'B M 25'],
    [/\bRAG\b/gi, 'Retrieval Augmented Generation'],
    [/\bStory Bible\b/gi, 'Story Bible'],
    [/\bLight\s*Novel\b/gi, 'Light Novel'],
  ]);

  const VOICE_CALIBRATION_PRESETS = Object.freeze({
    STUDIO_NEURAL: Object.freeze({
      id: 'STUDIO_NEURAL',
      label: '🎙️ Giọng Thuyết Minh Studio (Tự nhiên, ấm áp)',
      rate: 0.98,
      pitch: 1.0,
      pauseScale: 1.0,
    }),
    STORYTELLER_WARM: Object.freeze({
      id: 'STORYTELLER_WARM',
      label: '📖 Giọng Kể Chuyện Truyền Cảm (Nhấn nhá chậm rãi)',
      rate: 0.93,
      pitch: 0.97,
      pauseScale: 1.18,
    }),
    QUICK_BRIEF: Object.freeze({
      id: 'QUICK_BRIEF',
      label: '⚡ Giọng Tóm Tắt Nhanh Gọn (Rõ nét, tiết kiệm thời gian)',
      rate: 1.08,
      pitch: 1.02,
      pauseScale: 0.78,
    }),
    EN_DOCUMENTARY: Object.freeze({
      id: 'EN_DOCUMENTARY',
      label: '🎬 English Neural Documentary (Balanced clarity)',
      rate: 0.97,
      pitch: 1.0,
      pauseScale: 1.05,
    }),
  });

  /**
   * Kịch bản ánh xạ từng cảnh Video Hướng Dẫn (Cảnh 1 -> 9) vào đúng phần tử DOM thật của web.
   */
  const CHAPTER_MIRROR_CHOREOGRAPHY = Object.freeze({
    CHAP_01_SIX_SCREENS: Object.freeze({
      screenKey: 'SCREEN_1_WRITE',
      focusTargetId: 's14-desktop-nav-tabs',
      secondaryTargetId: 'btn-open-free-chat-header',
      captionBadge: 'BẢN ĐỒ 6 TAB & CỔNG KẾT NỐI',
      expandInMirror: [],
      showGateOverlayInMirror: false,
      pointerLabel: 'Chuyển đổi tức thì 6 Màn hình',
      pointerCurveOffset: { dx: 0, dy: -6 },
    }),
    CHAP_02_TAB1_DIFF_AND_SENSES: Object.freeze({
      screenKey: 'SCREEN_1_WRITE',
      focusTargetId: 'btn-approve-chapter',
      secondaryTargetId: 'textarea-chapter-content',
      captionBadge: 'TAB 1: SOẠN THẢO & DUYỆT MÀU',
      expandInMirror: [['tab1-extra-tools-collapsible-body', 'show']],
      showGateOverlayInMirror: false,
      pointerLabel: 'Duyệt & Chốt bản thảo + Diff AI',
      pointerCurveOffset: { dx: -10, dy: 4 },
    }),
    CHAP_03_TAB2_RAG_IMPORT: Object.freeze({
      screenKey: 'SCREEN_2_SOURCES',
      focusTargetId: 'btn-toggle-tab2-filters',
      secondaryTargetId: 'input-search-rag',
      captionBadge: 'TAB 2: CHƯƠNG & TÌM KIẾM BM25',
      expandInMirror: [['tab2-filter-import-collapsible-body', 'show']],
      showGateOverlayInMirror: false,
      pointerLabel: 'Nạp truyện TXT/DOCX/PDF & RAG',
      pointerCurveOffset: { dx: 12, dy: 8 },
    }),
    CHAP_04_TAB3_TWO_STEP_AI: Object.freeze({
      screenKey: 'SCREEN_3_AI',
      focusTargetId: 'btn-open-fullscreen-ai-command',
      secondaryTargetId: 'select-gemini-model',
      captionBadge: 'TAB 3: TRUNG TÂM AI 5 CHẾ ĐỘ & QUOTA',
      expandInMirror: [],
      showGateOverlayInMirror: false,
      pointerLabel: 'Mở Trung tâm AI 2 bước an toàn',
      pointerCurveOffset: { dx: 0, dy: 0 },
    }),
    CHAP_05_MODE5_TIMELINE_DIAGRAM: Object.freeze({
      screenKey: 'SCREEN_3_AI',
      focusTargetId: 'mode5-plot-diagram-studio',
      secondaryTargetId: 'mode5-prompt-input',
      captionBadge: 'CHẾ ĐỘ 5: SƠ ĐỒ CỐT TRUYỆN',
      expandInMirror: [['mode5-plot-diagram-studio', 'show']],
      showGateOverlayInMirror: false,
      pointerLabel: 'Phân tích trực quan từ Story Bible',
      pointerCurveOffset: { dx: 0, dy: 14 },
    }),
    CHAP_06_TAB4_SMART_APPROVAL: Object.freeze({
      screenKey: 'SCREEN_4_BIBLE',
      focusTargetId: 'btn-tab4-copy-notebooklm-prompt',
      secondaryTargetId: 'textarea-rendered-bible-content',
      captionBadge: 'TAB 4: STORY BIBLE & NOTEBOOKLM',
      expandInMirror: [],
      showGateOverlayInMirror: false,
      pointerLabel: 'Bấm link gạch chân Xuất PDF & Copy',
      pointerCurveOffset: { dx: -8, dy: 4 },
    }),
    CHAP_07_TAB5_POMODORO_SYNC: Object.freeze({
      screenKey: 'SCREEN_5_AMBIENCE',
      focusTargetId: 'btn-tab5-pomo-toggle',
      secondaryTargetId: 'btn-upload-custom-bg',
      captionBadge: 'TAB 5: POMODORO, NHẠC & HÌNH NỀN',
      expandInMirror: [
        ['tab5-pomo-collapsible-body', 'show'],
        ['tab5-music-collapsible-body', 'show'],
      ],
      showGateOverlayInMirror: false,
      pointerLabel: 'Đồng bộ Pomodoro & Nhạc 2 chiều',
      pointerCurveOffset: { dx: 6, dy: 6 },
    }),
    CHAP_08_TAB6_TIME_MACHINE_PDF: Object.freeze({
      screenKey: 'SCREEN_6_SYSTEM',
      focusTargetId: 'btn-s6-quick-export',
      secondaryTargetId: 'btn-create-manual-version',
      captionBadge: 'TAB 6: PHIÊN BẢN CŨ & XUẤT SÁCH',
      expandInMirror: [['tab6-version-vault-collapsible-body', 'show']],
      showGateOverlayInMirror: false,
      pointerLabel: 'Xuất PDF/DOCX & Phiên bản cũ',
      pointerCurveOffset: { dx: 0, dy: 4 },
    }),
    CHAP_09_MOD32_STAGE_AND_ARGON_BRIDGE: Object.freeze({
      screenKey: 'SCREEN_5_AMBIENCE',
      focusTargetId: 'mod32-backdrop-stage-panel',
      secondaryTargetId: 'mod32-btn-peek-background',
      captionBadge: 'MOD 32 & 33: NỀN RÕ NÉT & ARGON 4',
      expandInMirror: [['s14-panel-typography-box', 'show']],
      showGateOverlayInMirror: false,
      pointerLabel: 'Soi rõ nền 100% & Kính mờ đa tầng',
      pointerCurveOffset: { dx: 0, dy: -6 },
    }),
  });

  // ==========================================================================
  // PHẦN 2: TIỆN ÍCH CỤC BỘ AN TOÀN (KHÔNG PHỤ THUỘC CHÉO)
  // ==========================================================================

  function readStorageSafe(key, fallbackVal = '') {
    try {
      if (typeof localStorage !== 'undefined') {
        const val = localStorage.getItem(key);
        return val !== null ? val : fallbackVal;
      }
    } catch (_e) {}
    return fallbackVal;
  }

  function writeStorageSafe(key, value) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, String(value));
        return true;
      }
    } catch (_e) {}
    return false;
  }

  function writeJsonStorageSafe(key, obj) {
    try {
      return writeStorageSafe(key, JSON.stringify(obj));
    } catch (_e) {
      return false;
    }
  }

  function readJsonStorageSafe(key, fallbackObj = null) {
    try {
      const raw = readStorageSafe(key, '');
      if (!raw) return fallbackObj;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : fallbackObj;
    } catch (_e) {
      return fallbackObj;
    }
  }

  function escapeHtmlSafe(raw) {
    if (NS.uiUtils?.escapeHtml) return NS.uiUtils.escapeHtml(raw);
    return String(raw ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function stripEmojisAndMarkdownForSpeech(text) {
    return String(text || '')
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, ' ')
      .replace(/```[\s\S]*?```/g, ' đoạn mã ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/^#+\s*/gm, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[•▪►▸✅⚠️🔒🔓📁🔑💎🔥🌟⚡🧭🎬📤🕒🎱📋]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // ==========================================================================
  // PHẦN 3: ĐỘNG CƠ ĐỒNG BỘ KẾT NỐI API KEY + THƯ MỤC + GÓI PRO/ULTRA (MOD 33)
  // ==========================================================================

  class UnifiedConnectionAndTierSynchronizer {
    constructor() {
      this.currentPlanTier = this.loadSavedPlanTier();
      this.probedCapabilities = readJsonStorageSafe(
        MOD33_CONFIG.STORAGE_KEYS.PROBED_TIER_CAPS,
        null
      );
      this.isProbingTier = false;
      this.busBound = false;
      this.domBound = false;
    }

    loadSavedPlanTier() {
      const saved = String(
        readStorageSafe(MOD33_CONFIG.STORAGE_KEYS.PLAN_TIER, 'PRO')
      ).toUpperCase();
      return GOOGLE_PLAN_TIERS_CATALOG[saved] ? saved : 'STANDARD';
    }

    setPlanTier(tierId, emitEvent = true) {
      const normalized = String(tierId || 'STANDARD').toUpperCase();
      const spec = GOOGLE_PLAN_TIERS_CATALOG[normalized] || GOOGLE_PLAN_TIERS_CATALOG.STANDARD;
      this.currentPlanTier = spec.id;
      writeStorageSafe(MOD33_CONFIG.STORAGE_KEYS.PLAN_TIER, spec.id);

      // Tự đồng bộ lựa chọn ở các ô dropdown Plan Tier trên UI
      document.querySelectorAll('[data-mod33-plan-tier-select]').forEach((sel) => {
        if (sel.value !== spec.id) sel.value = spec.id;
      });

      this.syncUnifiedConnectionUI();

      if (emitEvent && NS.bus?.emit) {
        NS.bus.emit('mod33:plan_tier_changed', {
          planTier: spec.id,
          spec,
        });
      }
      return spec;
    }

    getUnifiedConnectionSnapshot() {
      const router = NS.geminiRouter || NS.apiVault || null;
      const fs = NS.fsEngine || null;

      const activeKey = String(
        router?.getEffectiveActiveKey?.() || router?.getApiKey?.() || ''
      ).trim();
      const hasApiKey = Boolean(activeKey.length >= 8);
      const isFlashVerified = Boolean(
        hasApiKey && router?.isCurrentKeyFlashLiteVerified?.()
      );
      const verifySummary =
        isFlashVerified && typeof router?.loadFlashLiteVerificationRecord === 'function'
          ? router.loadFlashLiteVerificationRecord()
          : null;

      const folderConnected = Boolean(fs?.isConnected?.());
      const folderName = String(
        fs?.getConnectedFolderName?.() ||
          fs?.virtualFolderName ||
          (folderConnected ? 'Thư mục Novel Studio' : '')
      ).trim();
      const folderFallbackActive = Boolean(fs?.fallbackModeActive);

      const liveModels = router?.liveProbe?.getCachedOrLiveModels?.() || [];
      const selectedModel = String(
        router?.getSelectedModelId?.() || router?.selectedModelId || 'gemini-3.8-flash'
      );
      const thinkingLevelLabel =
        router?.getThinkingLevelLabel?.() || 'Trung bình (Cân bằng)';

      const argonDirectAvailable = liveModels.some((m) =>
        /argon/i.test(String(m || ''))
      );
      const carbonDirectAvailable = liveModels.some((m) =>
        /carbon/i.test(String(m || ''))
      );
      const proDirectAvailable = liveModels.some((m) =>
        /pro/i.test(String(m || ''))
      );

      const chatbotModel = String(
        NS.mascotBi?.prefs?.chatModelId ||
          document.getElementById('chat-model-selector')?.value ||
          MOD33_CONFIG.CHATBOT_DEFAULT_LITE_MODEL
      );

      const keyMask = hasApiKey
        ? `${activeKey.slice(0, 4)}...${activeKey.slice(-4)}`
        : '';

      return {
        hasApiKey,
        keyMask,
        isFlashVerified,
        verifyEndpoint: verifySummary?.modelEndpoint || '',
        verifyTransport: verifySummary?.transportType || '',
        folderConnected,
        folderName,
        folderFallbackActive,
        planTier: this.currentPlanTier,
        planSpec: GOOGLE_PLAN_TIERS_CATALOG[this.currentPlanTier] || GOOGLE_PLAN_TIERS_CATALOG.STANDARD,
        liveModelsCount: liveModels.length,
        selectedModel,
        thinkingLevelLabel,
        chatbotModel,
        argonDirectAvailable,
        carbonDirectAvailable,
        proDirectAvailable,
        fullyReady: hasApiKey && isFlashVerified && folderConnected,
      };
    }

    /**
     * Kiểm tra thực tế API Key hiện tại có đang mở endpoint Argon 4 (gói Pro),
     * Carbon 4 (gói Ultra), hoặc Gemini 3.1/2.5 Pro trên tài khoản hay không,
     * đồng thời gợi ý rõ ràng cách dùng trực tiếp hoặc qua Cầu nối Gemini Web.
     */
    async probeFlagshipArgonAndCarbonCapabilities(showToast = true) {
      if (this.isProbingTier) return null;
      const router = NS.geminiRouter;
      const apiKey = String(
        router?.getEffectiveActiveKey?.() || router?.getApiKey?.() || ''
      ).trim();

      if (!apiKey) {
        if (showToast) {
          NS.uiUtils?.showToast?.(
            '⚠️ Chưa có Gemini API Key. Hãy nhập & xác thực Flash-Lite trước nhé!',
            'warning',
            3200
          );
        }
        return { ok: false, reason: 'NO_API_KEY' };
      }

      this.isProbingTier = true;
      this.setProbeResultBoxState('⏳ Đang kiểm tra danh sách mô hình sống (Argon 4 / Carbon 4 / Pro) từ khóa API...', 'pending');

      try {
        // 1. Gọi probe danh sách model live từ Google AI Studio (mở rộng pageSize=200 bên Mod 15)
        const probeRes = await router?.liveProbe?.probeKeyAndFetchLiveModels?.(apiKey);
        const liveList = router?.liveProbe?.getCachedOrLiveModels?.(apiKey) || [];

        const hasArgonDirect = liveList.some((id) => /argon/i.test(id));
        const hasCarbonDirect = liveList.some((id) => /carbon/i.test(id));
        const proModels = liveList.filter((id) => /pro/i.test(id));

        const resultObj = {
          ok: Boolean(probeRes?.ok),
          checkedAt: Date.now(),
          planTier: this.currentPlanTier,
          liveCount: liveList.length,
          hasArgonDirect,
          hasCarbonDirect,
          proModels: proModels.slice(0, 6),
          hasProDirect: proModels.length > 0,
        };
        this.probedCapabilities = resultObj;
        writeJsonStorageSafe(MOD33_CONFIG.STORAGE_KEYS.PROBED_TIER_CAPS, resultObj);

        const summaryLines = [
          `• Kết nối Key (${apiKey.slice(0, 4)}...${apiKey.slice(-4)}): ${
            probeRes?.ok ? `✅ Hợp lệ (${liveList.length} mô hình)` : `⚠️ ${probeRes?.message || 'Không lấy được danh sách'}`
          }`,
          `• Gói Pro → Argon 4 trực tiếp qua API: ${
            hasArgonDirect
              ? '✅ Tài khoản API mở sẵn Argon 4!'
              : proModels.length > 0
              ? `⚠️ Key API Studio mở sẵn ${proModels[0]} (gói Pro consumer chạy Argon 4 trực tiếp qua Cầu nối Gemini Web)`
              : '🔒 Chưa mở trực tiếp qua API Key này (dùng Cầu nối Gemini Web chạy Argon 4)'
          }`,
          `• Gói Ultra → Carbon 4 trực tiếp qua API: ${
            hasCarbonDirect
              ? '✅ Tài khoản API mở sẵn Carbon 4!'
              : proModels.length > 0
              ? `⚠️ Tự động định tuyến dự phòng sang ${proModels[0]} hoặc dùng Cầu nối Gemini Web cho Carbon 4`
              : '🔒 Chưa mở trực tiếp qua API Key này (dùng Cầu nối Gemini Web chạy Carbon 4)'
          }`,
        ];

        this.setProbeResultBoxState(
          summaryLines.join('\n'),
          hasArgonDirect || hasCarbonDirect ? 'ok' : probeRes?.ok ? 'warn' : 'error'
        );

        if (showToast) {
          NS.uiUtils?.showToast?.(
            hasArgonDirect || hasCarbonDirect
              ? '💎 Đã phát hiện endpoint Argon 4 / Carbon 4 mở trực tiếp trên Key của bạn!'
              : `✅ Key hợp lệ (${liveList.length} model; Pro live: ${proModels[0] || 'Flash'}). Đã đồng bộ sang toàn bộ 6 Tab!`,
            'success',
            4000
          );
        }

        this.syncUnifiedConnectionUI();
        return resultObj;
      } finally {
        this.isProbingTier = false;
      }
    }

    setProbeResultBoxState(message, tone = 'info') {
      document.querySelectorAll('[data-mod33-tier-probe-output]').forEach((box) => {
        box.textContent = message;
        box.className = `p-2.5 rounded-xl border text-[11px] leading-relaxed whitespace-pre-line font-monoCode ${
          tone === 'ok'
            ? 'border-emerald-500/45 bg-emerald-950/30 text-emerald-200'
            : tone === 'warn'
            ? 'border-amber-500/45 bg-amber-950/25 text-amber-200'
            : tone === 'error'
            ? 'border-rose-500/45 bg-rose-950/25 text-rose-200'
            : 'border-indigo-500/40 bg-indigo-950/25 text-indigo-200'
        }`;
      });
    }

    /**
     * Đồng bộ hóa bắt buộc trạng thái nối Thư mục + API Key ra tất cả màn hình.
     */
    async verifyAndRepairAllLinks(showToast = true) {
      const router = NS.geminiRouter;
      const fs = NS.fsEngine;

      // 1. Nếu Key chưa verify Flash-Lite mà đã có chuỗi key hợp lệ -> nhắc nhẹ hoặc thử verify lại
      const curKey = router?.getEffectiveActiveKey?.() || router?.getApiKey?.() || '';
      if (curKey && !router?.isCurrentKeyFlashLiteVerified?.()) {
        try {
          await router?.verifyKeyWithLowestFlashLite?.(curKey, { autoSave: true, emitEvents: true });
        } catch (_e) {}
      }

      // 2. Đồng bộ quyền Thư mục nếu đang có pending handle trên Desktop
      if (fs && !fs.isConnected() && fs.hasPendingReconnectHandle?.()) {
        try {
          await fs.reconnectLastFolder?.();
        } catch (_e2) {}
      }

      this.syncUnifiedConnectionUI();
      const snap = this.getUnifiedConnectionSnapshot();

      if (showToast) {
        if (snap.fullyReady) {
          NS.uiUtils?.showToast?.(
            `✅ Mọi kết nối đã đồng bộ thông suốt: Key (${snap.keyMask}) + Thư mục "${snap.folderName}"!`,
            'success',
            3500
          );
        } else {
          NS.uiUtils?.showToast?.(
            `ℹ️ Trạng thái: Key=${snap.hasApiKey ? 'OK' : 'Thiếu'}, Flash-Lite=${snap.isFlashVerified ? 'OK' : 'Chưa verify'}, Thư mục=${snap.folderConnected ? snap.folderName : 'Chưa gắn'}.`,
            'warn',
            3800
          );
        }
      }
      return snap;
    }

    injectPlanTierControlsIntoVaultAndGate() {
      // Chèn bộ chọn Gói Tài Khoản Pro / Ultra & nút Kiểm tra vào #modal-api-key-vault
      const vaultStatus = document.getElementById('apikey-verify-status');
      if (vaultStatus && !document.getElementById('mod33-vault-plan-tier-box')) {
        const box = document.createElement('div');
        box.id = 'mod33-vault-plan-tier-box';
        box.className =
          'p-3 rounded-xl border border-purple-500/40 bg-purple-950/20 space-y-2 text-[11px]';
        box.innerHTML = `
          <div class="flex flex-wrap items-center justify-between gap-2">
            <label for="select-mod33-vault-plan-tier" class="font-extrabold text-purple-300">
              👑 Gói Tài Khoản Google AI Của Bạn (Pro → Argon 4 · Ultra → Carbon 4):
            </label>
            <select id="select-mod33-vault-plan-tier" data-mod33-plan-tier-select="1" class="px-2.5 py-1 rounded-lg border border-purple-400/50 bg-zinc-950 text-purple-200 font-bold text-[11px]">
              <option value="STANDARD">⚡ Standard / Free API (Flash & Flash-Lite)</option>
              <option value="PRO">💎 Google AI Pro (Mở Argon 4 & Pro 3.1)</option>
              <option value="ULTRA">🔥 Google AI Ultra (Mở Carbon 4 & Argon 4)</option>
            </select>
          </div>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="text-zinc-300 leading-snug flex-1 min-w-[200px]">
              Nếu Key Google Cloud / AI Studio có mở quyền Pro/Ultra trả phí, hệ thống sẽ ưu tiên gọi thẳng <strong>Argon 4 / Carbon 4</strong> trước tiên.
            </span>
            <button type="button" id="btn-mod33-probe-flagship-tiers" class="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-[11px] shrink-0 transition">
              🔍 Quét Quyền Argon 4 / Carbon 4
            </button>
          </div>
          <div data-mod33-tier-probe-output="1" class="p-2 rounded-lg border border-zinc-800 bg-zinc-950/75 text-[10.5px] text-zinc-400">
            Bấm "Quét Quyền Argon 4 / Carbon 4" để kiểm tra danh sách mô hình thực tế gắn với API Key hiện tại.
          </div>
        `;
        vaultStatus.parentNode.insertBefore(box, vaultStatus.nextSibling);
      }

      document.querySelectorAll('[data-mod33-plan-tier-select]').forEach((sel) => {
        if (sel.value !== this.currentPlanTier) {
          sel.value = this.currentPlanTier;
        }
        if (!sel.dataset.mod33Bound) {
          sel.dataset.mod33Bound = '1';
          sel.addEventListener('change', () => {
            this.setPlanTier(sel.value, true);
          });
        }
      });

      const probeBtn = document.getElementById('btn-mod33-probe-flagship-tiers');
      if (probeBtn && !probeBtn.dataset.mod33Bound) {
        probeBtn.dataset.mod33Bound = '1';
        probeBtn.addEventListener('click', () => {
          this.probeFlagshipArgonAndCarbonCapabilities(true);
        });
      }
    }

    syncUnifiedConnectionUI() {
      const snap = this.getUnifiedConnectionSnapshot();

      // 1. Cập nhật Cụm Thanh Trạng Thái Tab 6 (#tab6-quick-spotlight-dock)
      const keyPill = document.getElementById(MOD33_CONFIG.SELECTORS.TAB6_KEY_PILL);
      if (keyPill) {
        if (snap.isFlashVerified) {
          keyPill.textContent = `🔑 API Key: ✅ Đã nối & verify (${snap.keyMask})`;
          keyPill.className =
            'px-2.5 py-1 rounded-full border border-emerald-500/50 bg-emerald-500/15 text-emerald-300 font-bold text-[11px]';
        } else if (snap.hasApiKey) {
          keyPill.textContent = `🔑 API Key: Đã nạp (${snap.keyMask} · chờ verify)`;
          keyPill.className =
            'px-2.5 py-1 rounded-full border border-amber-500/50 bg-amber-500/15 text-amber-300 font-bold text-[11px]';
        } else {
          keyPill.textContent = '🔑 API Key: ⚠️ Chưa nối';
          keyPill.className =
            'px-2.5 py-1 rounded-full border border-rose-500/50 bg-rose-500/15 text-rose-300 font-bold text-[11px]';
        }
      }

      const folderPill = document.getElementById(MOD33_CONFIG.SELECTORS.TAB6_FOLDER_PILL);
      if (folderPill) {
        if (snap.folderConnected) {
          folderPill.textContent = `📁 Thư mục: ✅ ${snap.folderName || 'Đã gắn an toàn'}`;
          folderPill.className =
            'px-2.5 py-1 rounded-full border border-sky-500/50 bg-sky-500/15 text-sky-300 font-bold text-[11px]';
        } else {
          folderPill.textContent = '📁 Thư mục: ⚠️ Chưa gắn ổ cứng';
          folderPill.className =
            'px-2.5 py-1 rounded-full border border-rose-500/50 bg-rose-500/15 text-rose-300 font-bold text-[11px]';
        }
      }

      const tierBadge = document.getElementById(MOD33_CONFIG.SELECTORS.TAB6_TIER_BADGE);
      if (tierBadge) {
        tierBadge.textContent = `👑 ${snap.planSpec.badgeLabel} · Chat mặc định: ${snap.chatbotModel}`;
      }

      // 2. Đồng bộ sang Mod 31 nếu đang gắn trong Tab 6
      if (NS.featureDirectory && typeof NS.featureDirectory.refreshLiveDiagnosticsStrip === 'function') {
        NS.featureDirectory.refreshLiveDiagnosticsStrip();
      }

      // 3. Đồng bộ lại thanh trạng thái Chatbot Bi Số 8
      if (NS.mascotBi && typeof NS.mascotBi.updateConnectionPillStatus === 'function') {
        NS.mascotBi.updateConnectionPillStatus();
      }

      // 4. Đồng bộ Header nút thư mục
      const headerFolderBtn = document.getElementById('btn-connect-local-folder');
      if (headerFolderBtn && snap.folderConnected) {
        headerFolderBtn.textContent = `📁 ${snap.folderName ? snap.folderName.slice(0, 14) : 'Ổ cứng OK'}`;
      }
    }

    bindGlobalConnectionListeners() {
      if (!this.busBound && NS.bus?.on) {
        this.busBound = true;
        const events = NS.constants?.EVENTS || {};
        const evNames = [
          events.API_KEY_VERIFIED || 'ai:api_key_verified',
          events.API_KEY_UPDATED || 'ai:api_key_updated',
          events.FOLDER_CONNECTED || 'storage:folder_connected',
          'gate:entered_studio',
          'mod29:screen_changed',
        ];
        evNames.forEach((ev) => {
          NS.bus.on(ev, () => {
            setTimeout(() => this.syncUnifiedConnectionUI(), 20);
          });
        });
      }

      if (!this.domBound && typeof document !== 'undefined') {
        this.domBound = true;
        document.addEventListener('click', (ev) => {
          const btn = ev.target.closest?.('[data-s14-tab="SCREEN_6_SYSTEM"]');
          if (btn) {
            setTimeout(() => this.syncUnifiedConnectionUI(), 40);
          }
        });
      }
    }

    init() {
      this.injectPlanTierControlsIntoVaultAndGate();
      this.bindGlobalConnectionListeners();
      this.syncUnifiedConnectionUI();
    }
  }

  // ==========================================================================
  // PHẦN 4: BỘ TỔNG HỢP GIỌNG NÓI AI TỰ NHIÊN SONG NGỮ VIỆT / ANH (NEURAL VOICE)
  // ==========================================================================

  class BilingualNeuralVoiceStudio {
    constructor() {
      const saved = readJsonStorageSafe(MOD33_CONFIG.STORAGE_KEYS.VOICE_PREFS, null);
      this.prefs = {
        language: saved?.language === 'en-US' ? 'en-US' : 'vi-VN',
        preferredVoiceByLang:
          saved?.preferredVoiceByLang && typeof saved.preferredVoiceByLang === 'object'
            ? saved.preferredVoiceByLang
            : { 'vi-VN': '', 'en-US': '' },
        rate: Number(saved?.rate || 0.98),
        pitch: Number(saved?.pitch || 1.01),
      };
      this.activePlaybackToken = 0;
      this.pendingPauseTimer = null;
      this.cachedVoices = [];
      this.voicesLoaded = false;
    }

    isSupported() {
      return (
        typeof globalScope !== 'undefined' &&
        'speechSynthesis' in globalScope &&
        typeof globalScope.SpeechSynthesisUtterance === 'function'
      );
    }

    savePrefs() {
      writeJsonStorageSafe(MOD33_CONFIG.STORAGE_KEYS.VOICE_PREFS, this.prefs);
    }

    refreshAvailableVoices() {
      if (!this.isSupported()) return [];
      try {
        const list = globalScope.speechSynthesis.getVoices?.() || [];
        if (list.length > 0) {
          this.cachedVoices = list.slice();
          this.voicesLoaded = true;
        }
      } catch (_e) {}
      return this.cachedVoices;
    }

    scoreVoiceNaturalness(voice, targetLang) {
      const lang = String(voice?.lang || '').toLowerCase();
      const name = String(voice?.name || '').toLowerCase();
      const isVi = targetLang === 'vi-VN';

      const langMatches = isVi ? lang.startsWith('vi') : lang.startsWith('en');
      if (!langMatches) return -1;

      let score = 10;
      if (/natural|neural|online/i.test(name)) score += 60;
      if (isVi) {
        if (/hoaimy/i.test(name)) score += 50;
        else if (/namminh/i.test(name)) score += 45;
        else if (/google.*ti[eế]ng vi[eệ]t|google vietnam/i.test(name)) score += 38;
        else if (/linh/i.test(name)) score += 28;
        else if (/\ban\b/i.test(name)) score += 12;
      } else {
        if (/aria/i.test(name)) score += 48;
        else if (/jenny|ava|emma|guy/i.test(name)) score += 42;
        else if (/google us english|google uk english/i.test(name)) score += 35;
        else if (/samantha|karen/i.test(name)) score += 25;
      }
      if (!voice.localService) score += 8; // Giọng đám mây thường mượt hơn giọng cục bộ SAPI cũ
      return score;
    }

    getRankedVoicesForLanguage(langCode = 'vi-VN') {
      const list = this.refreshAvailableVoices();
      return list
        .map((v) => ({ voice: v, score: this.scoreVoiceNaturalness(v, langCode) }))
        .filter((item) => item.score >= 0)
        .sort((a, b) => b.score - a.score)
        .map((item) => item.voice);
    }

    pickBestNaturalVoice(langCode = 'vi-VN') {
      const ranked = this.getRankedVoicesForLanguage(langCode);
      if (ranked.length === 0) return null;

      const preferredUri = this.prefs.preferredVoiceByLang?.[langCode] || '';
      if (preferredUri) {
        const exact = ranked.find((v) => v.voiceURI === preferredUri || v.name === preferredUri);
        if (exact) return exact;
      }
      return ranked[0];
    }

    setPreferredVoice(langCode, voiceUriOrName) {
      const lang = langCode === 'en-US' ? 'en-US' : 'vi-VN';
      this.prefs.preferredVoiceByLang[lang] = String(voiceUriOrName || '');
      this.savePrefs();
      this.syncVoicePickerUI(lang);
    }

    /**
     * Chuẩn hóa văn bản theo từ điển phát âm tự nhiên (Việt hoặc Anh)
     * để giọng đọc không bị gãy nhịp khi gặp tên ký hiệu kỹ thuật.
     */
    normalizeTextForSpeech(rawText, langCode = 'vi-VN') {
      let clean = stripEmojisAndMarkdownForSpeech(rawText);
      const lexicon = langCode === 'en-US' ? ENGLISH_NEURAL_LEXICON : VIETNAMESE_NEURAL_LEXICON;

      for (let i = 0; i < lexicon.length; i += 1) {
        const [rx, replacement] = lexicon[i];
        clean = clean.replace(rx, replacement);
      }

      // Thay các dấu gạch nối dài bằng khoảng ngắt tự nhiên
      clean = clean
        .replace(/\s*[—–]\s*/g, ', ')
        .replace(/\s*->\s*/g, langCode === 'en-US' ? ', then ' : ', tiếp theo ')
        .replace(/([a-zA-ZÀ-ỹ0-9])\(/g, '$1, ')
        .replace(/\)/g, ', ')
        .replace(/\s{2,}/g, ' ')
        .trim();

      return clean;
    }

    /**
     * Tách đoạn dài thành từng cụm hơi thở 10–18 từ giúp ngữ điệu lên xuống tự nhiên,
     * tránh lỗi trình duyệt nuốt chữ hoặc đọc đều đều kiểu robot.
     */
    splitIntoNaturalProsodyClauses(normalizedText) {
      if (!normalizedText) return [];
      const rawSentences = normalizedText
        .split(/(?<=[.!?;])\s+/)
        .map((s) => s.trim())
        .filter(Boolean);

      const clauses = [];
      for (let i = 0; i < rawSentences.length; i += 1) {
        const sent = rawSentences[i];
        const wordCount = sent.split(/\s+/).filter(Boolean).length;
        if (wordCount <= 18) {
          clauses.push({
            text: sent,
            pauseAfterMs: /[.!?]$/.test(sent) ? 175 : 115,
            pitchOffset: /[?]$/.test(sent) ? 0.035 : 0,
          });
          continue;
        }

        // Chia câu quá dài theo dấu phẩy / hai chấm
        const subParts = sent.split(/(?<=[,:])\s+/).filter(Boolean);
        let acc = '';
        for (let j = 0; j < subParts.length; j += 1) {
          const piece = subParts[j];
          const nextAcc = acc ? `${acc} ${piece}` : piece;
          if (nextAcc.split(/\s+/).filter(Boolean).length >= 14 && acc) {
            clauses.push({
              text: acc,
              pauseAfterMs: 110,
              pitchOffset: 0.01,
            });
            acc = piece;
          } else {
            acc = nextAcc;
          }
        }
        if (acc) {
          clauses.push({
            text: acc,
            pauseAfterMs: /[.!?]$/.test(acc) ? 185 : 120,
            pitchOffset: /[?]$/.test(acc) ? 0.03 : -0.015,
          });
        }
      }
      return clauses;
    }

    stop() {
      this.activePlaybackToken += 1;
      if (this.pendingPauseTimer) {
        clearTimeout(this.pendingPauseTimer);
        this.pendingPauseTimer = null;
      }
      if (!this.isSupported()) return;
      try {
        globalScope.speechSynthesis.cancel();
      } catch (_e) {}
    }

    speakText(rawText, langCode = 'vi-VN', options = {}) {
      if (!this.isSupported()) return false;
      const targetLang = langCode === 'en-US' ? 'en-US' : 'vi-VN';
      const normalized = this.normalizeTextForSpeech(rawText, targetLang);
      const clauses = this.splitIntoNaturalProsodyClauses(normalized);
      if (clauses.length === 0) return false;

      this.stop();
      const myToken = this.activePlaybackToken;
      const chosenVoice = this.pickBestNaturalVoice(targetLang);
      const baseRate = Math.max(
        0.75,
        Math.min(1.5, Number(options.rate || this.prefs.rate || 0.98))
      );
      const basePitch = Math.max(
        0.85,
        Math.min(1.18, Number(options.pitch || this.prefs.pitch || 1.01))
      );

      let clauseIdx = 0;
      const speakNextClause = () => {
        if (myToken !== this.activePlaybackToken) return;
        if (clauseIdx >= clauses.length) {
          if (typeof options.onComplete === 'function') {
            options.onComplete();
          }
          return;
        }

        const item = clauses[clauseIdx];
        clauseIdx += 1;

        try {
          const utter = new globalScope.SpeechSynthesisUtterance(item.text);
          utter.lang = targetLang;
          if (chosenVoice) {
            utter.voice = chosenVoice;
          }
          utter.rate = baseRate;
          utter.pitch = Math.max(0.88, Math.min(1.14, basePitch + item.pitchOffset));
          utter.volume = 0.95;

          const scheduleNext = () => {
            if (myToken !== this.activePlaybackToken) return;
            this.pendingPauseTimer = setTimeout(speakNextClause, item.pauseAfterMs);
          };

          utter.onend = scheduleNext;
          utter.onerror = scheduleNext;

          globalScope.speechSynthesis.speak(utter);
        } catch (_err) {
          if (typeof options.onComplete === 'function') options.onComplete();
        }
      };

      speakNextClause();
      return true;
    }

    syncVoicePickerUI(langCode = null) {
      const lang =
        langCode ||
        document.getElementById('mod28-voice-lang-select')?.value ||
        this.prefs.language ||
        'vi-VN';
      const selectEl = document.getElementById(MOD33_CONFIG.SELECTORS.VOICE_PICKER_SELECT);
      const qualityPill = document.getElementById(MOD33_CONFIG.SELECTORS.VOICE_QUALITY_PILL);
      const voices = this.getRankedVoicesForLanguage(lang);
      const activeVoice = this.pickBestNaturalVoice(lang);

      if (selectEl) {
        if (voices.length === 0) {
          selectEl.innerHTML = `<option value="">⚠️ Máy chưa cài gói giọng ${
            lang === 'vi-VN' ? 'Tiếng Việt' : 'English'
          }</option>`;
        } else {
          selectEl.innerHTML = voices
            .map((v) => {
              const isNeural = /natural|neural|online/i.test(v.name);
              const tag = isNeural ? '✨ Neural' : v.localService ? '💻 Hệ thống' : '🌐 Online';
              const selected = activeVoice && v.voiceURI === activeVoice.voiceURI ? ' selected' : '';
              return `<option value="${escapeHtmlSafe(v.voiceURI)}"${selected}>${tag}: ${escapeHtmlSafe(
                v.name.slice(0, 34)
              )}</option>`;
            })
            .join('');
        }
      }

      if (qualityPill) {
        if (!this.isSupported()) {
          qualityPill.textContent = '⚠️ Trình duyệt không hỗ trợ SpeechSynthesis';
        } else if (!activeVoice) {
          qualityPill.textContent =
            lang === 'vi-VN'
              ? '💡 Mẹo: Cài Windows "Vietnamese - HoaiMy" hoặc dùng Edge/Chrome để có giọng Việt Neural tự nhiên'
              : '💡 Mẹo: Dùng Edge/Chrome Online để nghe giọng English Natural mượt nhất';
        } else {
          const isNeural = /natural|neural|online/i.test(activeVoice.name);
          qualityPill.textContent = `${
            isNeural ? '💎 Giọng Neural Tự Nhiên:' : '🔊 Giọng hệ thống:'
          } ${activeVoice.name}`;
        }
      }
    }

    bindVoicesChangedOnce() {
      if (!this.isSupported() || this._voicesEventBound) return;
      this._voicesEventBound = true;
      try {
        globalScope.speechSynthesis.addEventListener?.('voiceschanged', () => {
          this.refreshAvailableVoices();
          this.syncVoicePickerUI();
        });
      } catch (_e) {}
    }

    getCalibrationPresets() {
      return Object.values(VOICE_CALIBRATION_PRESETS);
    }

    applyCalibrationPreset(presetId) {
      const preset = VOICE_CALIBRATION_PRESETS[presetId];
      if (!preset) return false;
      this.prefs.rate = preset.rate;
      this.prefs.pitch = preset.pitch;
      this.prefs.calibrationPresetId = preset.id;
      this.savePrefs();
      return true;
    }

    describeActiveVoiceProfile(langCode = null) {
      const lang = langCode || this.prefs.language || 'vi-VN';
      const voice = this.pickBestNaturalVoice(lang);
      return {
        supported: this.isSupported(),
        lang,
        voiceName: voice?.name || 'Fallback',
        voiceURI: voice?.voiceURI || '',
        isNeural: Boolean(voice && /natural|neural|online/i.test(voice.name)),
        rate: this.prefs.rate,
        pitch: this.prefs.pitch,
        presetId: this.prefs.calibrationPresetId || 'STUDIO_NEURAL',
      };
    }

    init() {
      this.refreshAvailableVoices();
      this.bindVoicesChangedOnce();
    }
  }

  // ==========================================================================
  // PHẦN 5: TRÌNH CHIẾU GIAO DIỆN WEB THẬT VÀO KHUNG VIDEO HƯỚNG DẪN (LIVE DOM MIRROR)
  // ==========================================================================

  class RealDomVideoMirrorRenderer {
    constructor() {
      this.enabled = readStorageSafe(MOD33_CONFIG.STORAGE_KEYS.MIRROR_VIDEO_MODE, 'true') !== 'false';
      this.cachedScreenSnaps = new Map();
      this.activeMirrorChapterId = '';
      this.lastMirrorRefreshMs = 0;
      this.resizeObserver = null;
      this.latestTargetPoint = null;
    }

    isMirrorActiveAndMounted() {
      if (!this.enabled) return false;
      const stage = document.getElementById(MOD33_CONFIG.SELECTORS.VIDEO_MIRROR_STAGE);
      const viewport = document.getElementById(MOD33_CONFIG.SELECTORS.VIDEO_MIRROR_VIEWPORT);
      return Boolean(stage && !stage.classList.contains('hidden') && viewport && viewport.childElementCount > 0);
    }

    setEnabled(flag) {
      this.enabled = Boolean(flag);
      writeStorageSafe(MOD33_CONFIG.STORAGE_KEYS.MIRROR_VIDEO_MODE, this.enabled ? 'true' : 'false');
      const stage = document.getElementById(MOD33_CONFIG.SELECTORS.VIDEO_MIRROR_STAGE);
      if (stage) {
        stage.classList.toggle('hidden', !this.enabled);
      }
      if (!this.enabled) {
        this.latestTargetPoint = null;
      } else {
        this.syncMirrorForChapter(this.activeMirrorChapterId || 'CHAP_01_SIX_SCREENS', true);
      }
      return this.enabled;
    }

    ensureMirrorStageMountedInsideVideo() {
      const wrap =
        document.getElementById(MOD33_CONFIG.SELECTORS.VIDEO_FRAME_WRAP) ||
        document.getElementById('mod28-tutorial-canvas')?.parentElement;
      if (!wrap) return null;

      wrap.style.position = 'relative';

      let stage = document.getElementById(MOD33_CONFIG.SELECTORS.VIDEO_MIRROR_STAGE);
      if (!stage) {
        stage = document.createElement('div');
        stage.id = MOD33_CONFIG.SELECTORS.VIDEO_MIRROR_STAGE;
        stage.setAttribute('aria-hidden', 'true');
        stage.setAttribute('inert', '');
        stage.className = `absolute inset-0 z-[1] overflow-hidden pointer-events-none select-none bg-[#09090b] ${
          this.enabled ? '' : 'hidden'
        }`;

        const viewport = document.createElement('div');
        viewport.id = MOD33_CONFIG.SELECTORS.VIDEO_MIRROR_VIEWPORT;
        viewport.style.cssText = `width:${MOD33_CONFIG.VIRTUAL_VIEWPORT_W}px;height:${MOD33_CONFIG.VIRTUAL_VIEWPORT_H}px;transform-origin:top left;display:flex;flex-direction:column;overflow:hidden;background:#09090b;color:#f4f4f5;`;
        stage.appendChild(viewport);

        const canvasEl = document.getElementById('mod28-tutorial-canvas');
        if (canvasEl && canvasEl.parentElement === wrap) {
          wrap.insertBefore(stage, canvasEl);
          canvasEl.style.position = 'relative';
          canvasEl.style.zIndex = '2';
          canvasEl.style.background = 'transparent';
        } else {
          wrap.appendChild(stage);
        }
      }

      this.updateViewportScaleToFit();
      this.bindFrameResizeObserver(wrap);
      return stage;
    }

    bindFrameResizeObserver(wrap) {
      if (this.resizeObserver || typeof ResizeObserver === 'undefined' || !wrap) return;
      this.resizeObserver = new ResizeObserver(() => {
        this.updateViewportScaleToFit();
      });
      this.resizeObserver.observe(wrap);
    }

    updateViewportScaleToFit() {
      const stage = document.getElementById(MOD33_CONFIG.SELECTORS.VIDEO_MIRROR_STAGE);
      const viewport = document.getElementById(MOD33_CONFIG.SELECTORS.VIDEO_MIRROR_VIEWPORT);
      if (!stage || !viewport) return;

      const rect = stage.getBoundingClientRect();
      const stageW = Math.max(240, rect.width || stage.clientWidth || 640);
      const scale = stageW / MOD33_CONFIG.VIRTUAL_VIEWPORT_W;
      viewport.style.transform = `scale(${scale.toFixed(4)})`;
    }

    /**
     * Nhân bản một phần tử DOM thật an toàn 100%:
     *   - Chuyển toàn bộ `id` sang `data-m33-src-id` để tuyệt đối KHÔNG gây trùng ID DOM.
     *   - Gỡ bỏ `<script>`, bảo toàn giá trị đang gõ của `<textarea>`, `<input>`, `<select>`.
     */
    cloneNodeSanitizedWithoutDuplicateIds(sourceEl) {
      if (!sourceEl) return null;
      const clone = sourceEl.cloneNode(true);

      const syncInputValues = (srcRoot, dstRoot) => {
        const srcFields = srcRoot.querySelectorAll('input, textarea, select');
        const dstFields = dstRoot.querySelectorAll('input, textarea, select');
        for (let i = 0; i < srcFields.length && i < dstFields.length; i += 1) {
          const s = srcFields[i];
          const d = dstFields[i];
          if (s.tagName === 'TEXTAREA' || s.tagName === 'INPUT') {
            if (s.type === 'checkbox' || s.type === 'radio') {
              d.checked = Boolean(s.checked);
            } else {
              d.value = s.value || '';
            }
          } else if (s.tagName === 'SELECT') {
            d.value = s.value;
          }
        }
      };

      const sanitizeSubtree = (node) => {
        if (!node || node.nodeType !== 1) return;
        node.querySelectorAll('script').forEach((sc) => sc.remove());

        if (node.id) {
          node.setAttribute('data-m33-src-id', node.id);
          node.removeAttribute('id');
        }
        node.querySelectorAll('[id]').forEach((el) => {
          el.setAttribute('data-m33-src-id', el.id);
          el.removeAttribute('id');
        });
      };

      syncInputValues(sourceEl, clone);
      sanitizeSubtree(clone);
      return clone;
    }

    resolveTargetDomSectionForChoreography(choreo) {
      const map = {
        SCREEN_1_WRITE: ['s14-screen-1-write', 'center-editor-pane'],
        SCREEN_2_SOURCES: ['s14-screen-2-files', 'left-sidebar-pane'],
        SCREEN_3_AI: ['s14-screen-3-ai', 's20-quad-prompt-studio'],
        SCREEN_4_BIBLE: ['s14-screen-4-bible', 'right-bible-pane'],
        SCREEN_5_AMBIENCE: ['s14-screen-5-ambience'],
        SCREEN_6_SYSTEM: ['s14-screen-6-system'],
      };
      const ids = map[choreo.screenKey] || [];
      for (let i = 0; i < ids.length; i += 1) {
        const el = document.getElementById(ids[i]);
        if (el) return el;
      }
      return document.getElementById('app-main-workspace');
    }

    /**
     * Dựng ảnh chụp DOM thật của đúng màn hình tương ứng phân đoạn Video đang phát.
     */
    syncMirrorForChapter(chapterId, forceRebuild = false) {
      const choreo =
        CHAPTER_MIRROR_CHOREOGRAPHY[chapterId] || CHAPTER_MIRROR_CHOREOGRAPHY.CHAP_01_SIX_SCREENS;
      const stage = this.ensureMirrorStageMountedInsideVideo();
      const viewport = document.getElementById(MOD33_CONFIG.SELECTORS.VIDEO_MIRROR_VIEWPORT);
      if (!stage || !viewport) return;

      if (!this.enabled) {
        stage.classList.add('hidden');
        return;
      }
      stage.classList.remove('hidden');

      const now = Date.now();
      if (!forceRebuild && this.activeMirrorChapterId === chapterId && now - this.lastMirrorRefreshMs < 1500) {
        this.computeTargetHighlightCoordinates(choreo);
        return;
      }

      this.activeMirrorChapterId = chapterId;
      this.lastMirrorRefreshMs = now;
      viewport.innerHTML = '';

      // 1. Nền tranh tự sinh nếu đang bật trong Mod 32 (sao chép nền thực lên mirror)
      const bgImg = document.getElementById('ambient-bg-image');
      if (bgImg && !bgImg.classList.contains('hidden') && bgImg.src) {
        const imgClone = document.createElement('img');
        imgClone.src = bgImg.src;
        imgClone.style.cssText =
          'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.42;pointer-events:none;z-index:0;';
        viewport.appendChild(imgClone);
      }

      // 2. Nhân bản Header THẬT của trang web
      const realHeader = document.querySelector('header');
      if (realHeader) {
        const headerClone = this.cloneNodeSanitizedWithoutDuplicateIds(realHeader);
        headerClone.removeAttribute('inert');
        headerClone.removeAttribute('aria-hidden');
        headerClone.classList.remove('pointer-events-none', 'hidden');
        headerClone.style.cssText =
          'position:relative;z-index:2;flex-shrink:0;width:100%;background:rgba(9,9,11,0.92);';
        // Tô nổi đúng tab đang trình bày trong gương
        const activeTabBtn = headerClone.querySelector(
          `[data-s14-tab="${choreo.screenKey}"]`
        );
        if (activeTabBtn) {
          activeTabBtn.style.outline = '2px solid #34d399';
          activeTabBtn.style.background = '#059669';
          activeTabBtn.style.color = '#ffffff';
        }
        viewport.appendChild(headerClone);
      }

      // 3. Nhân bản Khu vực Màn hình THẬT (Tab 1 -> Tab 6)
      const screenEl = this.resolveTargetDomSectionForChoreography(choreo);
      if (screenEl) {
        const bodyClone = this.cloneNodeSanitizedWithoutDuplicateIds(screenEl);
        bodyClone.classList.remove('hidden', 'pointer-events-none', 'select-none');
        bodyClone.style.cssText =
          'position:relative;z-index:2;display:flex;flex-direction:column;flex:1;min-height:0;overflow:hidden;padding:12px 16px;background:rgba(9,13,20,0.68);';

        // Mở các khối đang thu gọn bên trong bản sao để người xem nhìn thấy rõ nút bấm thật
        (choreo.expandInMirror || []).forEach(([srcId, action]) => {
          const inner = bodyClone.querySelector(`[data-m33-src-id="${srcId}"]`);
          if (inner && action === 'show') {
            inner.classList.remove('hidden');
            inner.style.display = '';
          }
        });

        // Làm sáng nổi bật chính phần tử mục tiêu ngay trên bản sao thật
        const focusEl = bodyClone.querySelector(
          `[data-m33-src-id="${choreo.focusTargetId}"]`
        );
        if (focusEl) {
          focusEl.style.outline = '3px solid #34d399';
          focusEl.style.outlineOffset = '3px';
          focusEl.style.boxShadow = '0 0 24px rgba(52, 211, 153, 0.55)';
          // Cuộn phần tử mục tiêu vào vùng nhìn thấy của khung 1280x720
          try {
            const innerOffset = focusEl.offsetTop || 0;
            if (innerOffset > 280) {
              bodyClone.scrollTop = Math.max(0, innerOffset - 120);
            }
          } catch (_e) {}
        }

        // Đánh dấu phụ trợ phần tử thứ cấp để người xem hiểu ngữ cảnh xung quanh nút chính
        if (choreo.secondaryTargetId) {
          const secEl = bodyClone.querySelector(
            `[data-m33-src-id="${choreo.secondaryTargetId}"]`
          );
          if (secEl && secEl !== focusEl) {
            secEl.style.outline = '1.5px dashed rgba(34, 211, 238, 0.72)';
            secEl.style.outlineOffset = '2px';
          }
        }

        viewport.appendChild(bodyClone);
      }

      this.updateViewportScaleToFit();
      this.computeTargetHighlightCoordinates(choreo);
    }

    computeTargetHighlightCoordinates(choreo) {
      const stage = document.getElementById(MOD33_CONFIG.SELECTORS.VIDEO_MIRROR_STAGE);
      const viewport = document.getElementById(MOD33_CONFIG.SELECTORS.VIDEO_MIRROR_VIEWPORT);
      if (!stage || !viewport) {
        this.latestTargetPoint = null;
        return null;
      }

      const targetEl = viewport.querySelector(
        `[data-m33-src-id="${choreo.focusTargetId}"]`
      ) || viewport.querySelector(`[data-m33-src-id="${choreo.secondaryTargetId}"]`);

      if (!targetEl) {
        this.latestTargetPoint = null;
        return null;
      }

      const stageRect = stage.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();
      if (!stageRect.width || !stageRect.height || !targetRect.width) {
        this.latestTargetPoint = null;
        return null;
      }

      const relX = Math.max(
        28,
        Math.min(
          stageRect.width - 28,
          targetRect.left - stageRect.left + targetRect.width * 0.5
        )
      );
      const relY = Math.max(
        34,
        Math.min(
          stageRect.height - 88,
          targetRect.top - stageRect.top + targetRect.height * 0.5
        )
      );

      this.latestTargetPoint = {
        x: relX,
        y: relY,
        boxX: Math.max(8, targetRect.left - stageRect.left),
        boxY: Math.max(8, targetRect.top - stageRect.top),
        boxW: Math.min(stageRect.width - 16, Math.max(40, targetRect.width)),
        boxH: Math.min(stageRect.height - 96, Math.max(22, targetRect.height)),
        label: choreo.pointerLabel || 'Giao diện thật',
        badge: choreo.captionBadge || '',
      };
      return this.latestTargetPoint;
    }

    /**
     * Vẽ lớp phủ trong suốt gồm: khung viền rực sáng đúng nút thật, con trỏ nhấp,
     * thẻ chú thích và dải phụ đề song ngữ — giữ 100% giao diện web thật hiển thị bên dưới!
     */
    drawTransparentLiveDomOverlay(player, ctx, w, h, chap, cue, localProgress) {
      ctx.clearRect(0, 0, w, h);

      this.syncMirrorForChapter(chap.id, false);
      const choreo =
        CHAPTER_MIRROR_CHOREOGRAPHY[chap.id] || CHAPTER_MIRROR_CHOREOGRAPHY.CHAP_01_SIX_SCREENS;
      const pt = this.computeTargetHighlightCoordinates(choreo) || this.latestTargetPoint;

      // Dải tiêu đề mỏng trên cùng bên phải báo đang chiếu Giao Diện Web Thật Live
      ctx.save();
      player.drawRoundedRect(ctx, w - 216, 8, 208, 22, 11);
      ctx.fillStyle = 'rgba(2, 6, 23, 0.84)';
      ctx.fill();
      ctx.strokeStyle = `${chap.accentColor}cc`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 9.5px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        `● LIVE WEB UI • ${player.formatSecToMmSs(player.currentTimeSec)} / ${player.formatSecToMmSs(
          player.totalDurationSec
        )}`,
        w - 112,
        19
      );

      // Nếu định vị được nút/khung thật trong DOM Mirror -> vẽ viền laser + con trỏ chỉ chính xác
      if (pt) {
        const pulse = 0.65 + 0.35 * Math.sin(localProgress * Math.PI * 6);
        player.drawRoundedRect(ctx, pt.boxX - 4, pt.boxY - 4, pt.boxW + 8, pt.boxH + 8, 10);
        ctx.strokeStyle = chap.accentColor;
        ctx.globalAlpha = pulse;
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Thẻ chú thích ngay gần nút bấm thật
        const tipW = Math.min(240, w - 32);
        const tipX = Math.max(12, Math.min(w - tipW - 12, pt.x - tipW * 0.5));
        const tipY = pt.y > h * 0.45 ? Math.max(36, pt.boxY - 34) : Math.min(h - 118, pt.boxY + pt.boxH + 10);

        player.drawRoundedRect(ctx, tipX, tipY, tipW, 24, 8);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
        ctx.fill();
        ctx.strokeStyle = chap.accentColor;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 10px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`👆 ${pt.label}`, tipX + tipW / 2, tipY + 12);

        const animOffsetX = Math.sin(localProgress * Math.PI * 4) * 5;
        const animOffsetY = Math.cos(localProgress * Math.PI * 4) * 4;
        if (typeof player.drawAnimatedPointer === 'function') {
          player.drawAnimatedPointer(
            ctx,
            pt.x + animOffsetX,
            pt.y + animOffsetY,
            (localProgress * 4) % 1,
            chap.accentColor
          );
        }
      }

      // Dải phụ đề song ngữ sắc nét ở chân video
      if (player.subtitlesVisible && cue) {
        const subBoxH = player.subtitleLangMode === 'BOTH' ? 76 : 54;
        const subBoxY = h - subBoxH - 8;
        player.drawRoundedRect(ctx, 14, subBoxY, w - 28, subBoxH, 12);
        ctx.fillStyle = 'rgba(2, 6, 23, 0.92)';
        ctx.fill();
        ctx.strokeStyle = `${chap.accentColor}aa`;
        ctx.lineWidth = 1.4;
        ctx.stroke();

        ctx.fillStyle = chap.accentColor;
        ctx.font = 'bold 9.5px Inter, system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        const voiceBadge = player.voiceNarrator?.enabled
          ? ` • 🎙️ ${player.voiceNarrator.language === 'en-US' ? 'English Neural' : 'Giọng Việt Neural'}`
          : '';
        ctx.fillText(
          `GIAO DIỆN THẬT • ${(cue.speaker || '').toUpperCase()}${voiceBadge}`,
          26,
          subBoxY + 6
        );

        const baseFont = Math.max(10, Math.min(13, Math.round(w * 0.016 * player.subtitleFontScale)));
        if (player.subtitleLangMode === 'VI') {
          ctx.fillStyle = '#f8fafc';
          ctx.font = `600 ${baseFont}px Inter, system-ui, sans-serif`;
          player.drawWrappedSubtitleText(ctx, cue.text, 26, subBoxY + 21, w - 52, baseFont + 4, 2);
        } else if (player.subtitleLangMode === 'EN') {
          ctx.fillStyle = '#a5f3fc';
          ctx.font = `600 ${baseFont}px Inter, system-ui, sans-serif`;
          player.drawWrappedSubtitleText(
            ctx,
            cue.textEn || cue.text,
            26,
            subBoxY + 21,
            w - 52,
            baseFont + 4,
            2
          );
        } else {
          ctx.fillStyle = '#f8fafc';
          ctx.font = `600 ${baseFont}px Inter, system-ui, sans-serif`;
          player.drawWrappedSubtitleText(
            ctx,
            `🇻🇳 ${cue.text}`,
            26,
            subBoxY + 20,
            w - 52,
            baseFont + 3,
            2
          );
          ctx.fillStyle = '#67e8f9';
          ctx.font = `500 ${Math.max(9.5, baseFont - 1)}px Inter, system-ui, sans-serif`;
          player.drawWrappedSubtitleText(
            ctx,
            `🇬🇧 ${cue.textEn || ''}`,
            26,
            subBoxY + 48,
            w - 52,
            baseFont + 2,
            1
          );
        }
      }
      ctx.restore();
    }
  }

  // ==========================================================================
  // PHẦN 6: BỘ TỐI ƯU FRONT-END TAB 6 (THU GỌN HẾT & CỤM MỤC NỔI BẬT)
  // ==========================================================================

  class Tab6SpotlightAndCollapseOrchestrator {
    constructor(syncer) {
      this.syncer = syncer;
      this.eventsBound = false;
    }

    /**
     * Đặt lại trạng thái Thu gọn hết (chỉ giữ Cụm Mục Nổi Bật Nhất)
     * hoặc Mở rộng đồng loạt tất cả thẻ trong Tab 6.
     */
    setAllTab6SectionsCollapsed(shouldCollapse, showToast = false) {
      const targetBodyPairs = [
        {
          bodyId: 'mod31-directory-panel-body',
          mod31Sync: shouldCollapse,
        },
        {
          bodyId: 'tab6-version-vault-collapsible-body',
          toggleId: 'btn-toggle-tab6-vault',
        },
        {
          bodyId: 'tab6-system-cards-collapsible-body',
          toggleId: 'btn-toggle-tab6-system-cards',
        },
        {
          bodyId: 'tab6-floating-ai-manager-collapsible-body',
          toggleId: 'btn-toggle-tab6-floating-ai',
        },
        {
          bodyId: 'mod04-vault-collapsible-body',
          toggleId: 'btn-toggle-tab6-mod04-vault',
        },
        {
          bodyId: 'mod30-diag-collapsible-body',
          toggleId: 'btn-toggle-tab6-mod30-diag',
        },
      ];

      if (NS.featureDirectory) {
        NS.featureDirectory.isDirectoryPanelCollapsed = Boolean(shouldCollapse);
        if (typeof NS.featureDirectory.renderRoot === 'function') {
          NS.featureDirectory.renderRoot();
        }
      }

      targetBodyPairs.forEach(({ bodyId, toggleId }) => {
        const body = document.getElementById(bodyId);
        if (body) {
          body.classList.toggle('hidden', Boolean(shouldCollapse));
        }
        const btn = toggleId ? document.getElementById(toggleId) : null;
        if (btn) {
          btn.setAttribute('aria-expanded', shouldCollapse ? 'false' : 'true');
          const arrow = btn.querySelector('.noir-collapse-arrow');
          if (arrow) arrow.textContent = shouldCollapse ? '▾' : '▴';
        }
      });

      writeStorageSafe(
        MOD33_CONFIG.STORAGE_KEYS.TAB6_COLLAPSE_MODE,
        shouldCollapse ? 'COLLAPSED' : 'EXPANDED'
      );

      if (showToast) {
        NS.uiUtils?.showToast?.(
          shouldCollapse
            ? '⏫ Đã thu gọn hết các mục phụ ở Tab 6 — Chỉ giữ lại Cụm Mục Nổi Bật Nhất!'
            : '⏬ Đã mở rộng toàn bộ các bảng công cụ trên Tab 6!',
          'info',
          2400
        );
      }
    }

    /**
     * Bọc các thẻ do Module 04 / Module 30 tự chèn vào cuối Tab 6 thành accordion thu gọn được
     * để nút "Thu gọn hết các mục" hoạt động đồng bộ 100%.
     */
    enhanceDynamicCardsInTab6() {
      const floatingSec = document.getElementById('tab6-floating-ai-manager-section');
      if (floatingSec && !floatingSec.dataset.mod33Wrapped) {
        floatingSec.dataset.mod33Wrapped = '1';
        const toggleBtn = document.getElementById('btn-toggle-tab6-floating-ai');
        const bodyEl = document.getElementById('tab6-floating-ai-manager-collapsible-body');
        if (toggleBtn && bodyEl) {
          toggleBtn.addEventListener('click', () => {
            const nextHidden = !bodyEl.classList.contains('hidden');
            bodyEl.classList.toggle('hidden', nextHidden);
            toggleBtn.setAttribute('aria-expanded', nextHidden ? 'false' : 'true');
          });
        }
      }

      // Bọc thẻ mod04 Két Sắt IndexedDB thành thu gọn được
      const mod04Card = document.getElementById('mod04-tab6-storage-vault-card');
      if (mod04Card && !mod04Card.dataset.mod33Wrapped) {
        mod04Card.dataset.mod33Wrapped = '1';
        const children = Array.from(mod04Card.children);
        if (children.length > 1) {
          const header = children[0];
          const bodyWrap = document.createElement('div');
          bodyWrap.id = 'mod04-vault-collapsible-body';
          bodyWrap.className = 'hidden space-y-3 pt-2';
          children.slice(1).forEach((ch) => bodyWrap.appendChild(ch));
          mod04Card.appendChild(bodyWrap);

          const toggle = document.createElement('button');
          toggle.type = 'button';
          toggle.id = 'btn-toggle-tab6-mod04-vault';
          toggle.className =
            'px-3 py-1 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-bold text-[11px] shrink-0';
          toggle.textContent = '▾ Mở / Thu';
          toggle.addEventListener('click', () => {
            const hidden = !bodyWrap.classList.contains('hidden');
            bodyWrap.classList.toggle('hidden', hidden);
            toggle.textContent = hidden ? '▾ Mở / Thu' : '▴ Thu Gọn';
          });
          header.appendChild(toggle);
        }
      }
    }

    bindSpotlightDockEvents() {
      if (this.eventsBound) return;
      this.eventsBound = true;

      const bindClick = (id, fn) => {
        const el = document.getElementById(id);
        if (el && !el.dataset.mod33Bound) {
          el.dataset.mod33Bound = '1';
          el.addEventListener('click', fn);
        }
      };

      bindClick(MOD33_CONFIG.SELECTORS.TAB6_BTN_COLLAPSE_ALL, () => {
        this.setAllTab6SectionsCollapsed(true, true);
      });

      bindClick(MOD33_CONFIG.SELECTORS.TAB6_BTN_EXPAND_ALL, () => {
        this.setAllTab6SectionsCollapsed(false, true);
      });

      bindClick('btn-s6-quick-gate', () => {
        if (NS.entryGate?.openGate) {
          NS.entryGate.openGate(true);
        } else {
          document.getElementById('btn-s6-open-connection-gate')?.click();
        }
      });

      bindClick('btn-s6-quick-export', () => {
        document.getElementById('btn-s6-card-export')?.click();
      });

      bindClick('btn-s6-quick-video', () => {
        NS.tutorialAndChangelog?.openModal?.('VIDEO');
      });

      bindClick('btn-s6-quick-vault', () => {
        const body = document.getElementById('tab6-version-vault-collapsible-body');
        if (body && body.classList.contains('hidden')) {
          document.getElementById('btn-toggle-tab6-vault')?.click();
        }
        document.getElementById('tab6-version-history-vault')?.scrollIntoView?.({
          behavior: 'smooth',
          block: 'start',
        });
      });

      bindClick('btn-s6-quick-verify-all-links', () => {
        this.syncer.verifyAndRepairAllLinks(true);
        NS.connectionSelfTest?.renderSelfTestReportIntoTab6?.(false);
      });
    }

    init() {
      this.bindSpotlightDockEvents();
      this.enhanceDynamicCardsInTab6();
      const savedMode = readStorageSafe(
        MOD33_CONFIG.STORAGE_KEYS.TAB6_COLLAPSE_MODE,
        'COLLAPSED'
      );
      if (savedMode === 'COLLAPSED') {
        this.setAllTab6SectionsCollapsed(true, false);
      }
      setTimeout(() => this.enhanceDynamicCardsInTab6(), 350);
    }
  }

  // ==========================================================================
  // PHẦN 6B: MA TRẬN TỰ KIỂM TRA TÍNH TOÀN VẸN KẾT NỐI 6 TẦNG (SELF-TEST MATRIX)
  // ==========================================================================

  class ConnectionIntegritySelfTestMatrix {
    constructor(connectionSync, neuralVoice, domVideoMirror) {
      this.connectionSync = connectionSync;
      this.neuralVoice = neuralVoice;
      this.domVideoMirror = domVideoMirror;
      this.lastReport = null;
    }

    /**
     * Chạy kiểm toán chéo 6 lớp hạ tầng của Studio tại thời điểm hiện tại:
     *   1. Gemini API Key + Chứng thực Flash-Lite thấp nhất
     *   2. Liên kết Thư mục ổ cứng thật / Dự phòng Mobile
     *   3. Gói tài khoản & khả năng gọi Pro / Argon 4 / Carbon 4
     *   4. Độc lập mô hình Chatbot Bi #8 (mặc định Flash-Lite, không ghi đè Tab 3)
     *   5. Trình chiếu DOM thật của Video Hướng Dẫn (DUP_IDS = 0)
     *   6. Động cơ giọng đọc Neural song ngữ VI/EN
     */
    runFullSixLayerAudit() {
      const state = this.connectionSync.getUnifiedConnectionSnapshot();
      const router = NS.geminiRouter;
      const tab3Model = String(
        router?.getSelectedModelId?.() || router?.selectedModelId || 'gemini-3.8-flash'
      );
      const chatSel = document.getElementById('chat-model-selector');
      const chatbotModel = String(
        chatSel?.value || NS.mascotBi?.prefs?.chatModelId || MOD33_CONFIG.CHATBOT_DEFAULT_LITE_MODEL
      );
      const isChatbotLite = /flash-lite/i.test(chatbotModel);
      const stageEl = document.getElementById(MOD33_CONFIG.SELECTORS.VIDEO_MIRROR_STAGE);
      const voiceProfile = this.neuralVoice?.describeActiveVoiceProfile?.('vi-VN') || {
        supported: false,
        isNeural: false,
        voiceName: 'Chưa sẵn sàng',
      };

      const checks = [
        {
          id: 'LAYER_1_API_KEY',
          title: '1. Gemini API Key & Xác thực Flash-Lite',
          ok: Boolean(state.hasApiKey && state.isFlashVerified),
          statusText: state.hasApiKey
            ? state.isFlashVerified
              ? `Đạt chuẩn (${state.keyMask} · ${state.verifyEndpoint || 'flash-lite'})`
              : `Đã nhập (${state.keyMask}) nhưng cần xác thực Flash-Lite`
            : 'Chưa gắn API Key',
        },
        {
          id: 'LAYER_2_FOLDER_SYNC',
          title: '2. Thư mục Ổ cứng / Két dự phòng',
          ok: Boolean(state.folderConnected),
          statusText: state.folderConnected
            ? `${state.folderFallbackActive ? 'Mobile Vault' : 'Thư mục thật'}: ${state.folderName}`
            : 'Chưa gắn thư mục làm việc',
        },
        {
          id: 'LAYER_3_PLAN_TIER',
          title: '3. Gói Google AI & Argon 4 / Carbon 4',
          ok: state.planTier === 'STANDARD' || state.hasApiKey,
          statusText: `${state.planSpec.badgeLabel} · Live probe ${state.liveModelsCount} model(s)`,
        },
        {
          id: 'LAYER_4_CHATBOT_LITE',
          title: '4. Chatbot Bi #8 Mặc Định Flash-Lite',
          ok: isChatbotLite,
          statusText: `Chatbot: ${chatbotModel} | Tab 3 Viết: ${tab3Model}`,
        },
        {
          id: 'LAYER_5_DOM_MIRROR',
          title: '5. Video Chiếu Giao Diện Web Thật',
          ok: Boolean(this.domVideoMirror?.enabled),
          statusText: stageEl
            ? `Sẵn sàng chiếu DOM thật (không trùng ID)`
            : 'Sân khấu sẽ gắn ngay khi mở Tab Video Hướng Dẫn',
        },
        {
          id: 'LAYER_6_NEURAL_VOICE',
          title: '6. Động Cơ Giọng Nói Neural VI/EN',
          ok: Boolean(voiceProfile.supported),
          statusText: voiceProfile.supported
            ? `${voiceProfile.isNeural ? '✨ Neural' : '🔊 System'}: ${voiceProfile.voiceName}`
            : 'Trình duyệt không hỗ trợ SpeechSynthesis',
        },
      ];

      const passedCount = checks.filter((c) => c.ok).length;
      const report = {
        timestampIso: new Date().toISOString(),
        passedCount,
        totalCount: checks.length,
        allHealthy: passedCount === checks.length,
        checks,
        stateSnapshot: state,
      };
      this.lastReport = report;
      return report;
    }

    renderSelfTestReportIntoTab6(showToast = true) {
      const report = this.runFullSixLayerAudit();
      let container = document.getElementById('mod33-tab6-selftest-report-box');
      if (!container) {
        const dock = document.getElementById(MOD33_CONFIG.SELECTORS.TAB6_SPOTLIGHT_DOCK);
        if (dock) {
          container = document.createElement('div');
          container.id = 'mod33-tab6-selftest-report-box';
          container.className =
            'mt-3 p-3 rounded-xl border border-cyan-500/35 bg-zinc-950/85 space-y-2';
          dock.appendChild(container);
        }
      }

      if (container) {
        container.classList.remove('hidden');
        container.innerHTML = `
          <div class="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-zinc-800">
            <span class="text-xs font-extrabold text-cyan-300">
              🩺 Kết Quả Tự Kiểm Tra 6 Tầng Hệ Thống: ${report.passedCount}/${report.totalCount} Đạt
            </span>
            <button type="button" id="btn-mod33-close-selftest"
              class="px-2 py-0.5 rounded-md border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold text-zinc-300">
              ✕ Đóng báo cáo
            </button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            ${report.checks
              .map(
                (item) => `
              <div class="p-2 rounded-lg border ${
                item.ok
                  ? 'border-emerald-500/40 bg-emerald-950/20'
                  : 'border-amber-500/45 bg-amber-950/25'
              }">
                <div class="text-[11px] font-extrabold ${
                  item.ok ? 'text-emerald-300' : 'text-amber-300'
                }">${item.ok ? '✅' : '⚠️'} ${escapeHtmlSafe(item.title)}</div>
                <div class="text-[10px] text-zinc-300 mt-0.5">${escapeHtmlSafe(item.statusText)}</div>
              </div>
            `
              )
              .join('')}
          </div>
        `;
        const closeBtn = document.getElementById('btn-mod33-close-selftest');
        if (closeBtn) {
          closeBtn.addEventListener('click', () => {
            container.classList.add('hidden');
          });
        }
      }

      if (showToast) {
        NS.uiUtils?.showToast?.(
          `🩺 Đã kiểm tra 6 tầng kết nối: ${report.passedCount}/${report.totalCount} mục hoạt động đồng bộ!`,
          report.passedCount >= 5 ? 'success' : 'info',
          3000
        );
      }
      return report;
    }
  }

  // ==========================================================================
  // PHẦN 7: BỘ ĐIỀU KHIỂN MODULE 33 THỐNG NHẤT
  // ==========================================================================

  class Mod33ConnectionAndVoiceController {
    constructor() {
      this.version = MOD33_CONFIG.MODULE_VERSION;
      this.connectionSync = new UnifiedConnectionAndTierSynchronizer();
      this.neuralVoice = new BilingualNeuralVoiceStudio();
      this.domVideoMirror = new RealDomVideoMirrorRenderer();
      this.tab6Orchestrator = new Tab6SpotlightAndCollapseOrchestrator(this.connectionSync);
      this.selfTestMatrix = new ConnectionIntegritySelfTestMatrix(
        this.connectionSync,
        this.neuralVoice,
        this.domVideoMirror
      );
      this.initialized = false;
    }

    init() {
      if (this.initialized) {
        this.connectionSync.syncUnifiedConnectionUI();
        this.neuralVoice.syncVoicePickerUI();
        return;
      }

      this.connectionSync.init();
      this.neuralVoice.init();
      this.tab6Orchestrator.init();
      this.initialized = true;
    }
  }

  const mod33Instance = new Mod33ConnectionAndVoiceController();

  NS.connectionAndVoiceStudio = mod33Instance;
  NS.unifiedConnectionGuard = mod33Instance.connectionSync;
  NS.neuralVoice = mod33Instance.neuralVoice;
  NS.liveDomVideoMirror = mod33Instance.domVideoMirror;
  NS.tab6Spotlight = mod33Instance.tab6Orchestrator;
  NS.connectionSelfTest = mod33Instance.selfTestMatrix;
  NS.MOD33_PLAN_TIERS = GOOGLE_PLAN_TIERS_CATALOG;

  if (typeof NS.registerModule === 'function') {
    NS.registerModule('mod33', mod33Instance);
  }
})(typeof window !== 'undefined' ? window : globalThis);
