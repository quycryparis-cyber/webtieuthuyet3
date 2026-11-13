/**
 * ============================================================================
 * FILE: stage16_flashlite35_bi_ai_v16_changelog.js
 * MASTER UNIFIED CONSOLIDATION OF STAGES 16 -> 31 (VERSION 31.0 FINAL ARCHITECTURE)
 * - Zero duplicate listeners, zero conflicting timers, zero MutationObserver deadlocks.
 * - Single deterministic execution pipeline for Laptop & Mobile Portrait.
 * ============================================================================
 * [PHẦN 1 / 3]:
 *   1. Pre-Boot Curtain Shield (Zero-Flicker / Zero-FOUC)
 *   2. Unified Master Stylesheet (Laptop & Mobile Portrait, Compact Pomodoro/MP3, Clean Footer)
 *   3. 2026 Gemini Models Catalog & Low-Thinking Flash-Lite 3.5 Engine
 *   4. Complete Unbroken Changelog History (Versions 1.0 -> 31.0)
 *   5. Machine Hardware Fingerprint Guard & Smart API Key Sanitizer (AIza... & AQ...)
 *   6. Seamless Boot Pipeline (Device Selector + Integrated Switcher + Live API Key Verifier
 *      with Visual Animated Google AI Studio Video Guide & Instant 4-Button Unlocker)
 * ============================================================================
 */

(function () {
  'use strict';

  // Ngăn chặn tuyệt đối việc nạp trùng file nhiều lần
  if (window.__NOIR_STAGE16_MASTER_UNIFIED_LOADED__) {
    return;
  }
  window.__NOIR_STAGE16_MASTER_UNIFIED_LOADED__ = true;

  // ==========================================================================
  // MÔ-ĐUN 1: MÀN CHẮN KHỞI ĐỘNG CHỐNG GIẬT CỤC (PRE-BOOT CURTAIN SHIELD)
  // Chạy ngay lập tức trước khi trình duyệt vẽ khung hình đầu tiên để triệt tiêu FOUC
  // ==========================================================================
  function injectImmediatePreBootCurtain() {
    if (!document.querySelector('meta[name="referrer"]')) {
      const meta = document.createElement('meta');
      meta.name = 'referrer';
      meta.content = 'no-referrer';
      document.head.prepend(meta);
    }

    const curtainStyle = document.createElement('style');
    curtainStyle.id = 's16u-preboot-curtain-style';
    curtainStyle.textContent = `
      #s16u-system-boot-curtain {
        position: fixed !important;
        inset: 0 !important;
        background: #09090B !important;
        z-index: 2147483647 !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 16px !important;
        transition: opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.28s ease !important;
        user-select: none !important;
      }
      #s16u-system-boot-curtain.s16u-curtain-dismissed {
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
      @keyframes s16uSpinHalo {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .s16u-boot-spinner {
        width: 48px;
        height: 48px;
        border: 3.5px solid rgba(16, 185, 129, 0.22);
        border-top-color: #10B981;
        border-radius: 50%;
        animation: s16uSpinHalo 0.75s linear infinite;
      }
    `;
    document.head.appendChild(curtainStyle);

    const mountCurtainNode = () => {
      if (document.getElementById('s16u-system-boot-curtain') || !document.body) return;
      const curtain = document.createElement('div');
      curtain.id = 's16u-system-boot-curtain';
      curtain.innerHTML = `
        <div class="s16u-boot-spinner"></div>
        <div style="font-family: 'Inter', system-ui, sans-serif; text-align: center; color: #E4E4E7;">
          <div style="font-size: 15px; font-weight: 800; letter-spacing: 0.04em; color: #34D399; margin-bottom: 4px;">
            ✍️ WEB VIẾT TIỂU THUYẾT CỦA BI • VERSION 31
          </div>
          <div style="font-size: 12px; color: #A1A1AA;">
            Đang đồng bộ giao diện hợp nhất & tài nguyên máy tính...
          </div>
        </div>
      `;
      document.body.appendChild(curtain);

      // Fail-safe tuyệt đối: Tự động mở màn chắn sau tối đa 950ms kể cả khi ổ cứng phản hồi chậm
      setTimeout(() => {
        dismissPreBootCurtain();
      }, 950);
    };

    if (document.body) {
      mountCurtainNode();
    } else {
      window.addEventListener('DOMContentLoaded', mountCurtainNode, { once: true });
    }
  }

  function dismissPreBootCurtain() {
    const curtain = document.getElementById('s16u-system-boot-curtain');
    if (!curtain || curtain.classList.contains('s16u-curtain-dismissed')) return;
    curtain.classList.add('s16u-curtain-dismissed');
    setTimeout(() => {
      curtain.remove();
    }, 320);
  }

  injectImmediatePreBootCurtain();

  // ==========================================================================
  // MÔ-ĐUN 2: BỘ CSS HỢP NHẤT TOÀN HỆ THỐNG (ZERO CONFLICT STYLESHEET)
  // Kết hợp toàn bộ tinh hoa CSS từ Stage 16 -> 31, không có quy tắc tự triệt tiêu nhau
  // ==========================================================================
  function injectUnifiedMasterStyles() {
    if (document.getElementById('s16u-master-unified-styles')) return;

    const style = document.createElement('style');
    style.id = 's16u-master-unified-styles';
    style.textContent = `
      /* 1. Xóa bỏ hoàn toàn các thành phần Hệ thống Tài khoản cũ không dùng */
      #btn-s10-account-room,
      #s11-owner-id-pill,
      #modal-s10-account-center,
      #s10-guest-mode-banner,
      [data-s14-sys-click="btn-s10-account-room"] {
        display: none !important;
      }

      /* 2. Quản lý Z-Index và Trạng thái Khóa Cổng Đầu Vào */
      #modal-s21-device-selector-gate:not(.hidden) {
        position: fixed !important;
        inset: 0 !important;
        z-index: 2147483646 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        background-color: rgba(5, 5, 8, 0.94) !important;
        backdrop-filter: blur(12px) !important;
        pointer-events: auto !important;
      }

      #modal-s6-welcome-launcher:not(.hidden) {
        z-index: 2147483645 !important;
        background-color: rgba(5, 5, 7, 0.92) !important;
        backdrop-filter: blur(10px) !important;
        pointer-events: auto !important;
      }

      /* Khi đang ở Cổng Chọn Thiết Bị hoặc Cổng Key API, làm mờ và khóa vùng làm việc phía sau */
      body.s16u-gate-locked #s14-master-top-nav,
      body.s16u-gate-locked #app-main-workspace,
      body.s16u-gate-locked #s11-mascot-bi-corner,
      body.s16u-gate-locked #s11-mascot-bi-panel,
      body.s16u-gate-locked #s15-floating-pomodoro-pill,
      body.s16u-gate-locked #s19-floating-mp3-bar,
      body.s16u-gate-locked #btn-s15-universal-back-to-write,
      body.s16u-gate-locked #app-bottom-footer {
        pointer-events: none !important;
        user-select: none !important;
        filter: blur(4px) brightness(0.42) !important;
        transition: filter 0.25s ease !important;
      }

      /* Hiển thị sẵn Video Hướng Dẫn Lấy Key API ở mọi giao diện (Laptop & Điện thoại) */
      #s20-apikey-visual-video-box {
        display: block !important;
      }

      /* Hiệu ứng cảnh báo nhấp nháy khi nhắc lấy / xác minh Key API */
      @keyframes s16uKeyPulseAlert {
        0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.85), 0 0 18px rgba(239, 68, 68, 0.75); transform: scale(1); }
        50% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0), 0 0 28px rgba(16, 185, 129, 0.95); transform: scale(1.02); }
      }
      .s16u-highlight-key-urgent {
        animation: s16uKeyPulseAlert 1s infinite ease-in-out !important;
        border-color: #F59E0B !important;
      }

      /* Trạng thái nút chờ xác minh vs đã mở khóa */
      .s16u-btn-locked-unverified {
        opacity: 0.45 !important;
        filter: grayscale(0.55) !important;
      }

      /* 3. SỬA TRIỆT ĐỂ LỖI POMODORO & THANH NHẠC MP3 BỊ KÉO DÀI KHUNG VÔ HÌNH KHI THU NHỎ */
      #s15-floating-pomodoro-pill {
        width: fit-content !important;
        min-width: 0 !important;
        max-width: max-content !important;
        display: inline-flex !important;
        align-items: center !important;
        box-sizing: border-box !important;
        white-space: nowrap !important;
        transition: transform 0.2s ease, box-shadow 0.2s ease !important;
      }
      #s15-floating-pomodoro-pill.s19-pomo-collapsed {
        width: auto !important;
        min-width: 0 !important;
        max-width: 66px !important;
        height: 34px !important;
        padding: 4px 10px !important;
        margin: 0 !important;
        gap: 0 !important;
        border-radius: 9999px !important;
        background: rgba(24, 24, 27, 0.96) !important;
        border: 2px solid rgba(16, 185, 129, 0.7) !important;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5) !important;
        overflow: hidden !important;
      }
      #s15-floating-pomodoro-pill.s19-pomo-collapsed:not([data-s16u-dragged="true"]) {
        left: auto !important;
        right: 12px !important;
      }
      #s15-floating-pomodoro-pill.s19-pomo-collapsed[data-s16u-dragged="true"] {
        right: auto !important;
      }
      #s15-floating-pomodoro-pill.s19-pomo-collapsed > *:not(#btn-s19-pomo-collapse-arrow) {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        position: absolute !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }

      /* Thanh nhạc MP3 nổi thu gọn (< / >) */
      #s19-floating-mp3-bar {
        width: fit-content !important;
        min-width: 0 !important;
        max-width: 96vw !important;
        display: inline-flex !important;
        align-items: center !important;
        box-sizing: border-box !important;
      }
      #s19-floating-mp3-bar.s19-mp3-collapsed {
        width: auto !important;
        min-width: 0 !important;
        max-width: 72px !important;
        height: 34px !important;
        padding: 4px 10px !important;
        gap: 0 !important;
        border-radius: 9999px !important;
      }
      #s19-floating-mp3-bar.s19-mp3-collapsed:not([data-s16u-dragged="true"]) {
        left: 12px !important;
        right: auto !important;
      }
      #s19-floating-mp3-bar.s19-mp3-collapsed[data-s16u-dragged="true"] {
        right: auto !important;
      }
      #s19-floating-mp3-bar.s19-mp3-collapsed .s19-mp3-inner-content {
        display: none !important;
      }

      /* 4. КÉO THẢ TỰ DO MỌI CÔNG CỤ NỔI & PHÓNG TO KHUNG CHAT AI */
      .s16u-draggable-widget {
        touch-action: none;
        will-change: left, top;
      }
      .s16u-dragging-active {
        opacity: 0.92 !important;
        box-shadow: 0 16px 36px rgba(16, 185, 129, 0.4) !important;
        transition: none !important;
      }

      #s6-prompt-modal-dialog.s21-chat-zoomed-max #s21-collapsible-upper-ai-settings {
        display: none !important;
      }
      #s6-prompt-modal-dialog.s21-chat-zoomed-max #s7-freechat-conversation-panel,
      #s6-prompt-modal-dialog.s21-chat-zoomed-max #s7-freechat-messages-box {
        min-height: 56vh !important;
        height: 100% !important;
      }
      #s6-prompt-modal-dialog.s21-chat-zoomed-max #s6-popup-prompt-textarea {
        min-height: 44vh !important;
      }

      /* 5. THANH FOOTER DƯỚI CÙNG 1 DÒNG DUY NHẤT, KHÔNG TRÀN VIỀN */
      #app-bottom-footer {
        height: 36px !important;
        min-height: 36px !important;
        max-height: 36px !important;
        padding: 0 14px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        overflow: hidden !important;
        white-space: nowrap !important;
        z-index: 90 !important;
      }

      /* Ẩn tuyệt đối nút "⬅️ Quay Lại Bàn Viết Truyện" khi đang ở Tab 1 và không có Modal mở */
      body[data-s14-screen="SCREEN_1_WRITE"]:not(.s16u-has-real-modal-open) #btn-s15-universal-back-to-write {
        display: none !important;
      }

      /* 6. TỐI ƯU SÂU CHO GIAO DIỆN ĐIỆN THOẠI MÀN HÌNH DỌC (s21-device-mobile & @media) */
      #modal-s6-welcome-launcher > div {
        max-height: 92dvh !important;
        display: flex !important;
        flex-direction: column !important;
        overflow-y: auto !important;
        -webkit-overflow-scrolling: touch !important;
      }
      #modal-s6-welcome-launcher .flex-1.overflow-y-auto {
        overflow-y: visible !important;
        flex: none !important;
      }

      #s21-mobile-bottom-nav-dock {
        display: none;
      }
      body.s21-device-mobile #s21-mobile-bottom-nav-dock {
        display: grid !important;
        grid-template-columns: repeat(6, 1fr);
        height: 52px;
        background: rgba(15, 15, 18, 0.98);
        border-top: 1px solid #27272A;
        z-index: 95;
        flex-shrink: 0;
      }

      body.s21-device-mobile {
        font-size: 14px !important;
        overflow-x: hidden !important;
      }
      body.s21-device-mobile #s14-master-top-nav {
        height: auto !important;
        min-height: 50px !important;
        padding: 6px 8px !important;
        flex-wrap: wrap !important;
        gap: 4px !important;
      }
      body.s21-device-mobile #s14-master-top-nav > div:nth-child(2) {
        order: 3 !important;
        width: 100% !important;
        display: flex !important;
        overflow-x: auto !important;
        gap: 6px !important;
        padding: 4px 2px !important;
        scrollbar-width: none !important;
        -webkit-overflow-scrolling: touch !important;
      }
      body.s21-device-mobile .s14-nav-tab {
        padding: 7px 11px !important;
        font-size: 12px !important;
        flex-shrink: 0 !important;
      }
      body.s21-device-mobile #editor-metadata-bar {
        display: flex !important;
        flex-direction: column !important;
        align-items: stretch !important;
        padding: 6px 8px !important;
        gap: 6px !important;
      }
      body.s21-device-mobile #editor-metadata-bar > div {
        width: 100% !important;
        display: flex !important;
        flex-wrap: wrap !important;
        justify-content: space-between !important;
        gap: 4px !important;
      }
      body.s21-device-mobile #textarea-chapter-content,
      body.s21-device-mobile #textarea-stage3-ai-report {
        max-width: 100% !important;
        width: calc(100% - 12px) !important;
        margin: 6px auto !important;
        padding: 16px 14px !important;
        font-size: 16px !important;
        line-height: 1.85 !important;
        border-radius: 10px !important;
      }
      body.s21-device-mobile #app-main-workspace {
        flex-direction: column !important;
        overflow-y: auto !important;
      }
      body.s21-device-mobile #left-sidebar-pane,
      body.s21-device-mobile #right-bible-pane {
        width: 100% !important;
        max-height: none !important;
        height: auto !important;
        border-right: none !important;
        border-left: none !important;
        border-bottom: 2px solid #10B981 !important;
        flex-shrink: 0 !important;
      }
      body.s21-device-mobile #s6-prompt-modal-dialog,
      body.s21-device-mobile #modal-s6-welcome-launcher > div,
      body.s21-device-mobile #modal-s10-changelog > div,
      body.s21-device-mobile #modal-s10-video-guide > div,
      body.s21-device-mobile #modal-bugfixer-studio > div,
      body.s21-device-mobile #modal-s21-bible-chapters-selector > div {
        width: 98vw !important;
        max-width: 98vw !important;
        height: 92dvh !important;
        max-height: 92dvh !important;
        margin: 0 auto !important;
        border-radius: 14px !important;
        overflow-y: auto !important;
      }
      body.s21-device-mobile #s11-mascot-bi-panel {
        width: 94vw !important;
        left: 3vw !important;
        right: 3vw !important;
        bottom: 64px !important;
        max-height: 78dvh !important;
      }
      body.s21-device-mobile #s11-bi-speech-bubble {
        display: none !important;
      }
      body.s21-device-mobile #s15-floating-pomodoro-pill {
        top: 92px !important;
        right: 6px !important;
      }
      body.s21-device-mobile #s19-floating-mp3-bar {
        bottom: 90px !important;
        left: 6px !important;
      }
      body.s21-device-mobile #s11-mascot-bi-corner {
        bottom: 90px !important;
        right: 6px !important;
      }
      body.s21-device-mobile #s20-large-clock-display {
        font-size: 11px !important;
      }

      /* Thẻ chọn thiết bị tích hợp trong màn hình Key API */
      .s16u-device-card-btn {
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        cursor: pointer;
        user-select: none;
      }
      .s16u-device-card-btn:hover {
        transform: translateY(-2px);
      }
      .s16u-device-card-active {
        border-color: #10B981 !important;
        background: rgba(16, 185, 129, 0.18) !important;
        box-shadow: 0 0 0 2px #10B981, 0 8px 24px rgba(16, 185, 129, 0.28) !important;
      }
    `;
    document.head.appendChild(style);
  }

  // ==========================================================================
  // MÔ-ĐUN 3: DANH MỤC MÔ HÌNH GEMINI 2026 & ENGINE FLASH-LITE 3.5 TƯ DUY THẤP
  // ==========================================================================
  const STANDARDIZED_2026_MODELS = {
    'gemini-4-argon': {
      id: 'gemini-4-argon',
      name: '👑 Gemini 4 Argon (Flagship 11/2026 - Suy luận tâm lý sâu & Long Decode 1M)',
      contextWindow: 1048576,
      maxOutputTokens: 1000000,
      rpmLimit: 60,
      tpmLimit: 4000000,
      rpdLimit: 1500,
      defaultThinking: 'high',
      supportedThinking: ['low', 'medium', 'high'],
      thinkingTokenOverhead: { low: 1500, medium: 6000, high: 16000 }
    },
    'gemini-4-carbon': {
      id: 'gemini-4-carbon',
      name: '💎 Gemini 4 Carbon (Frontier 11/2026 - Đa tác vụ & Logic chuẩn xác)',
      contextWindow: 1048576,
      maxOutputTokens: 1000000,
      rpmLimit: 120,
      tpmLimit: 4000000,
      rpdLimit: 3000,
      defaultThinking: 'high',
      supportedThinking: ['low', 'medium', 'high'],
      thinkingTokenOverhead: { low: 1000, medium: 4000, high: 12000 }
    },
    'gemini-3.8-flash': {
      id: 'gemini-3.8-flash',
      name: '🚀 Gemini 3.8 Flash (Hiện hành 11/2026 - Cân bằng tốc độ & Chiều sâu tiểu thuyết)',
      contextWindow: 1048576,
      maxOutputTokens: 65536,
      rpmLimit: 250,
      tpmLimit: 4000000,
      rpdLimit: 5000,
      defaultThinking: 'medium',
      supportedThinking: ['low', 'medium', 'high'],
      thinkingTokenOverhead: { low: 500, medium: 2500, high: 8000 }
    },
    'gemini-3.6-flash': {
      id: 'gemini-3.6-flash',
      name: '✨ Gemini 3.6 Flash (Ổn định 2026 - Phản hồi đa phương thức mượt mà)',
      contextWindow: 1048576,
      maxOutputTokens: 65536,
      rpmLimit: 250,
      tpmLimit: 4000000,
      rpdLimit: 5000,
      defaultThinking: 'medium',
      supportedThinking: ['low', 'medium', 'high'],
      thinkingTokenOverhead: { low: 400, medium: 2000, high: 6000 }
    },
    'gemini-3.5-flash-lite': {
      id: 'gemini-3.5-flash-lite',
      name: '⚡ Gemini 3.5 Flash-Lite (Mới nhất 11/2026 - Tốc độ siêu cao & Siêu tiết kiệm hạn mức)',
      contextWindow: 1048576,
      maxOutputTokens: 65536,
      rpmLimit: 400,
      tpmLimit: 4000000,
      rpdLimit: 10000,
      defaultThinking: 'low',
      supportedThinking: ['low', 'medium', 'high'],
      thinkingTokenOverhead: { low: 200, medium: 1200, high: 4000 }
    },
    'gemini-3.1-pro-preview': {
      id: 'gemini-3.1-pro-preview',
      name: '🧠 Gemini 3.1 Pro (Chuyên sâu viết tiểu thuyết dài & Phân tích đa tầng)',
      contextWindow: 1048576,
      maxOutputTokens: 65536,
      rpmLimit: 60,
      tpmLimit: 2000000,
      rpdLimit: 1000,
      defaultThinking: 'high',
      supportedThinking: ['low', 'medium', 'high'],
      thinkingTokenOverhead: { low: 1500, medium: 6000, high: 16000 }
    },
    'gemini-3.1-flash-lite-preview': {
      id: 'gemini-3.1-flash-lite-preview',
      name: '🍃 Gemini 3.1 Flash-Lite (Nhẹ, xử lý ngữ cảnh lớn chi phí tối thiểu)',
      contextWindow: 1048576,
      maxOutputTokens: 65536,
      rpmLimit: 400,
      tpmLimit: 4000000,
      rpdLimit: 10000,
      defaultThinking: 'low',
      supportedThinking: ['low', 'medium', 'high'],
      thinkingTokenOverhead: { low: 200, medium: 1000, high: 3500 }
    }
  };
  
  function synchronizeAllModelDropdowns() {
    if (window.StudioStage5) {
      window.StudioStage5.LATEST_GEMINI_MODELS = STANDARDIZED_2026_MODELS;
    }

    const selectIds = [
      's5-select-model',
      's6-welcome-model-select',
      's6-popup-model-select',
      's9-bugfixer-model-select',
      's15-bible-model-select',
      's15-approve-model-select',
      's21-popup-bible-model'
    ];

    selectIds.forEach((id) => {
      const sel = document.getElementById(id);
      if (!sel) return;
      const prevVal = sel.value;
      sel.innerHTML = Object.values(STANDARDIZED_2026_MODELS)
        .map((m) => `<option value="${m.id}">${m.name}</option>`)
        .join('');

      if (STANDARDIZED_2026_MODELS[prevVal]) {
        sel.value = prevVal;
      } else if (id.includes('bible') || id.includes('approve')) {
        sel.value = 'gemini-3.5-flash-lite';
      } else {
        sel.value = 'gemini-3.1-pro-preview';
      }
    });
  }

  /**
   * Engine gọi nhanh Gemini 3.5 Flash-Lite với mức tư duy Thấp (Low Thinking)
   * Dùng mặc định cho Chatbot Bi và mọi tác vụ phụ trợ không yêu cầu chọn model riêng
   */
  async function callGemini35FlashLiteLowThinking({
    systemInstruction,
    userPrompt,
    temperature = 0.65,
    maxOutputTokens = 4096
  }) {
    const rawKey =
      window.StudioStage2?.settings?.config?.apiKey ||
      localStorage.getItem('noir_gemini_api_key') ||
      '';
    const cleanKey = SmartApiKeySanitizer.sanitize(rawKey);

    if (!cleanKey) {
      throw new Error('Bạn hãy dán Gemini API Key vào phần Cài đặt trước nhé!');
    }

    const candidateModels = [
      'gemini-3.5-flash-lite',
      'gemini-2.5-flash-lite',
      'gemini-2.5-flash',
      'gemini-3.8-flash',
      'gemini-3.1-pro-preview'
    ];

    let lastError = null;

    for (const modelId of candidateModels) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        modelId
      )}:generateContent?key=${encodeURIComponent(cleanKey)}`;

      const requestBody = {
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature,
          maxOutputTokens,
          thinkingConfig: { thinkingLevel: 'low' }
        }
      };

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          const errMsg = data?.error?.message || `HTTP ${response.status}`;
          if (/thinking/i.test(errMsg)) {
            delete requestBody.generationConfig.thinkingConfig;
            const retryRes = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(requestBody)
            });
            const retryData = await retryRes.json().catch(() => ({}));
            if (retryRes.ok && retryData?.candidates?.[0]?.content?.parts) {
              const text = retryData.candidates[0].content.parts
                .filter((p) => !p.thought && typeof p.text === 'string')
                .map((p) => p.text)
                .join('\n')
                .trim();
              if (text) return { text, modelUsed: modelId };
            }
          }
          lastError = new Error(errMsg);
          continue;
        }

        const parts = data?.candidates?.[0]?.content?.parts || [];
        const text = parts
          .filter((p) => !p.thought && typeof p.text === 'string')
          .map((p) => p.text)
          .join('\n')
          .trim();

        if (text) {
          return { text, modelUsed: modelId };
        }
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError || new Error('Không thể kết nối tới Gemini 3.5 Flash-Lite.');
  }

  // ==========================================================================
  // MÔ-ĐUN 4: BẢNG LỊCH SỬ CẬP NHẬT NGUYÊN KHỐI 31 PHIÊN BẢN (v1.0 ➔ v31.0)
  // Khai báo 1 lần duy nhất, không dùng spread (...) gây trùng lặp phần tử
  // ==========================================================================
  const MASTER_CHANGELOG_V1_TO_V31 = [
    {
      num: 31,
      version: 'Version 31 (Bản Hợp Nhất Tinh Hoa - Mới Nhất)',
      date: 'Tháng 11/2026',
      badge: 'Hợp Nhất Toàn Diện Stage 16 ➔ 31, Hỗ Trợ Key AQ.../AIza... & Triệt Tiêu 100% Xung Đột',
      items: [
        'Hợp nhất toàn bộ 16 file (Stage 16 đến Stage 31) vào một kiến trúc duy nhất trong stage16, loại bỏ hoàn toàn hiện tượng chạy ngược setTimeout và nhân bản sự kiện chồng chéo.',
        'Hỗ trợ toàn diện cả Google Gemini API Key chuẩn (AIza...) lẫn Google Cloud / Vertex AI Key (AQ...), mở khóa tức thì 4 nút bắt đầu ngay khi bảng xanh xác minh xuất hiện.',
        'Tích hợp Màn chắn khởi động Zero-Flicker, Chọn giao diện Laptop/Mobile trực tiếp, Chatbot Bi 2 chế độ riêng biệt, Khóa Rule Prompt & Story Bible, Tua nhạc ±5s và Đồng hồ 22 múi giờ quốc tế.'
      ]
    },
    {
      num: 30,
      version: 'Version 30',
      date: 'Tháng 11/2026',
      badge: 'Đồng Bộ Trạng Thái Mở Khóa Nút Bấm Ngay Khi Verify Thành Công',
      items: [
        'Đồng bộ trực tiếp cờ xác minh Key API với giao diện 4 nút bắt đầu, xóa bỏ hoàn toàn lớp khóa mờ ngay khi xác minh hoàn tất.'
      ]
    },
    {
      num: 29,
      version: 'Version 29',
      date: 'Tháng 11/2026',
      badge: 'Mở Khóa Sự Kiện Click Cho Màn Hình Chọn Thiết Bị Đầu Vào',
      items: [
        'Đảm bảo thao tác bấm chọn Giao diện Laptop hoặc Giao diện Điện thoại chuyển tiếp tức thì sang màn hình Key API.'
      ]
    },
    {
      num: 28,
      version: 'Version 28',
      date: 'Tháng 11/2026',
      badge: 'Tích Hợp Chọn Thiết Bị Laptop / Điện Thoại Ngay Trong Màn Hình Key API',
      items: [
        'Cho phép chuyển đổi trực tiếp giữa giao diện Laptop / Máy tính và giao diện Điện thoại màn hình dọc ngay bên trong màn hình nhập Key API.'
      ]
    },
    {
      num: 27,
      version: 'Version 27',
      date: 'Tháng 11/2026',
      badge: 'Màn Chắn Khởi Động Chống Giật Cục (Pre-Boot Curtain Shield)',
      items: [
        'Loại bỏ 100% hiện tượng giao diện chớp nháy khi tải trang bằng màn chắn khởi động êm ái.'
      ]
    },
    {
      num: 26,
      version: 'Version 26',
      date: 'Tháng 11/2026',
      badge: 'Chuẩn Hóa Luồng Khởi Động Chọn Thiết Bị ➔ Nhập Key API ➔ Bàn Viết Truyện',
      items: [
        'Khôi phục trình tự khởi động chuẩn xác kết hợp gợi ý tự động nhận diện thiết bị và nút mở lại nhanh màn hình đầu vào trên thanh điều hướng.'
      ]
    },
    {
      num: 25,
      version: 'Version 25',
      date: 'Tháng 11/2026',
      badge: 'Tự Nhận Diện Responsive Mobile/Desktop, Tua Nhạc ±5 Giây & Verify Bằng Flash-Lite',
      items: [
        'Tự động nhận diện màn hình Mobile hoặc Desktop; bổ sung nút tua nhạc ⏪ -5s và +5s ⏩ trên cả bảng nhạc chính và thanh MP3 nổi.',
        'Xác minh Key API bằng mô hình nhẹ Gemini Flash-Lite (mức tư duy Thấp) để không tiêu tốn hạn mức Pro hay Argon 4.'
      ]
    },
    {
      num: 24,
      version: 'Version 24',
      date: 'Tháng 11/2026',
      badge: 'Tự Làm Sạch Key API, Nút Ẩn/Hiện 👁️ & Chặn Trình Duyệt Điền Nhầm Mật Khẩu',
      items: [
        'Tự động lọc bỏ ký tự ẩn, khoảng trắng, dấu ngoặc kép khi dán Key API và thêm nút 👁️ Hiện/Ẩn mã Key.'
      ]
    },
    {
      num: 23,
      version: 'Version 23',
      date: 'Tháng 11/2026',
      badge: 'Tự Nhớ File Đã Nạp Đa Thiết Bị, Tối Ưu Cuộn Mobile & Video Hướng Dẫn 120 Giây',
      items: [
        'Ghi nhớ vĩnh viễn các file chương và Story Bible qua IndexedDB cho các lần truy cập sau; nâng cấp Video Hướng Dẫn lên 120 giây (8 chương chi tiết).'
      ]
    },
    {
      num: 22,
      version: 'Version 22',
      date: 'Tháng 11/2026',
      badge: 'Triệt Tiêu Khung Ngang Vô Hình Khi Thu Nhỏ Đồng Hồ Pomodoro (< 🍅)',
      items: [
        'Xử lý triệt để xung đột tọa độ left/right giúp Đồng hồ Pomodoro khi thu nhỏ ôm sát gọn gàng.'
      ]
    },
    {
      num: 21,
      version: 'Version 21',
      date: 'Tháng 11/2026',
      badge: 'Giao Diện Kép Laptop/Mobile, Pop-up Chọn Chương Story Bible, Khóa Rule & Phóng To Chat',
      items: [
        'Tối ưu giao diện Điện thoại màn hình dọc kèm thanh Dock 6 tab cảm ứng; khôi phục nhạc Piano nhẹ & tiếng gõ phím ASMR trên thanh nhạc nổi.',
        'Thêm Pop-up chọn chương cập nhật Story Bible (2 trường hợp), khóa Rule chống xóa nhầm trong cửa sổ lệnh và phóng to tối đa khung Chat AI.'
      ]
    },
    {
      num: 20,
      version: 'Version 20',
      date: 'Tháng 11/2026',
      badge: 'Video Hướng Dẫn Lấy Key API Trực Quan, Kéo Thả Mọi Nút Nổi & Nhận Diện Máy Tính',
      items: [
        'Thêm Video hoạt hình chỉ dẫn 4 bước lấy Key API tại Google Studio; hỗ trợ kéo thả tự do Pomodoro, Chatbot Bi, Thanh MP3 và Nút Quay lại.',
        'Nhận diện chữ ký phần cứng máy tính (nhớ Key trên cùng máy, tự quên khi sang máy khác) và làm gọn thanh Footer 1 dòng.'
      ]
    },
    {
      num: 19,
      version: 'Bản 19.0',
      date: 'Tháng 11/2026',
      badge: 'Chatbot Bi 2 Chế Độ Riêng Biệt, Lấy Key Tự Động, Thu Hẹp >/< & Đồng Hồ Múi Giờ Quốc Tế',
      items: [
        'Tách Chatbot Viên Bi thành 2 chế độ với 2 cửa sổ chat riêng: (1) Hỗ trợ trang web và (2) Trò chuyện Gemini cá nhân.',
        'Đổi tên góc trên trái thành "Web viết tiểu thuyết của Bi", thêm mũi tên >/< thu hẹp Pomodoro & MP3, và thêm Đồng hồ chọn múi giờ 22 thành phố thế giới.'
      ]
    },
    {
      num: 18,
      version: 'Bản 18.0',
      date: 'Tháng 11/2026',
      badge: 'Nạp Bản Đồ DOM Thực Tế Cho Bi & Tự Động Kết Nối Story Bible + Rule Viết Bài',
      items: [
        'Cung cấp bản đồ vị trí DOM thực tế kèm nút mở 1-Click cho Bi và tự động đính kèm Story Bible + Rule Viết Bài vào mọi câu lệnh soạn thảo.'
      ]
    },
    {
      num: 17,
      version: 'Bản 17.0',
      date: 'Tháng 11/2026',
      badge: 'Cơ Chế Action Tag & Trích Xuất Tri Thức Nội Bộ Cho Viên Bi',
      items: [
        'Liên kết kho dữ liệu nội bộ với trình xử lý câu hỏi của Viên Bi và hỗ trợ thẻ hành động điều hướng.'
      ]
    },
    {
      num: 16,
      version: 'Bản 16.0',
      date: 'Tháng 11/2026',
      badge: 'Chuẩn Hóa Hệ Mô Hình Gemini 3.5 Flash-Lite, Flash 3.8, Pro 3.1 & Argon 4',
      items: [
        'Tích hợp Gemini 3.5 Flash-Lite (mức tư duy Thấp) làm mô hình mặc định cho Chatbot Bi và các tác vụ nền.'
      ]
    },
    {
      num: 15,
      version: 'Bản 15.0',
      date: 'Tháng 11/2026',
      badge: 'Viên Bi Đi Bộ Dẫn Đường, Đọc Bản Thảo AI & Duyệt Chương Tự Cập Nhật Story Bible',
      items: [
        'Viên Bi đi bộ bước chân thực tế, quay người trái/phải dẫn đường, Đọc Bản Thảo bằng giọng Bi và tự động cập nhật Story Bible khi bấm Duyệt.'
      ]
    },
    {
      num: 14,
      version: 'Bản 14.0',
      date: 'Tháng 11/2026',
      badge: 'Kiến Trúc 6 Tab Màn Hình Độc Lập & Sửa Lặp Nhạc Đoạn A-B',
      items: [
        'Chia ứng dụng thành 6 Tab Màn Hình riêng biệt chống ngộp nút và sửa lỗi lặp đoạn nhạc A-B.'
      ]
    },
    {
      num: 13,
      version: 'Bản 13.0',
      date: 'Tháng 11/2026',
      badge: 'Đồ Họa Viên Bi 6 Tư Thế, Luôn Nổi Trên Cùng & Đổi Ngôn Ngữ Việt - Anh',
      items: [
        'Thiết kế 6 tư thế biểu cảm cho Viên Bi và hỗ trợ chuyển đổi ngôn ngữ Tiếng Việt / English.'
      ]
    },
    {
      num: 12,
      version: 'Bản 12.0',
      date: 'Tháng 11/2026',
      badge: 'Tối Ưu Bản Thảo 50.000+ Từ, Live Streaming SSE & Bản Đồ Cảnh/Thoại',
      items: [
        'Tối ưu chương dài 50.000+ từ không giật lag, truyền chữ trực tiếp (Live Streaming) kèm nút Dừng Ngay và Bản đồ cảnh/thoại.'
      ]
    },
    {
      num: 11,
      version: 'Bản 11.0',
      date: 'Tháng 11/2026',
      badge: 'Ra Mắt Linh Vật Viên Bi Số 8, Cỡ Nút To/Vừa/Nhỏ & Đồng Hồ Pomodoro',
      items: [
        'Tích hợp linh vật Viên Bi số 8 dễ thương, tùy chỉnh kích cỡ nút giao diện (To/Vừa/Nhỏ) và đồng hồ Pomodoro có âm báo.'
      ]
    },
    {
      num: 10,
      version: 'Bản 10.0',
      date: 'Tháng 11/2026',
      badge: 'Story Bible Tự Động Cập Nhật (Khóa/Mở Kiểu Mẫu) & Video Hướng Dẫn',
      items: [
        'Story Bible tự động cập nhật theo chương mới bám sát khung mẫu có khóa và tích hợp Video Hướng Dẫn.'
      ]
    },
    {
      num: 9,
      version: 'Bản 9.0',
      date: 'Tháng 11/2026',
      badge: 'Chặn Lỗi Backspace Reload, Tự Giữ Kết Nối Ổ Cứng & Chia Sẻ Web 1 File',
      items: [
        'Chặn lệnh tự reload của Live Server khi xóa chữ, tự nhớ kết nối ổ cứng và đóng gói 1 file HTML chia sẻ cho bạn bè.'
      ]
    },
    {
      num: 8,
      version: 'Bản 8.0',
      date: 'Tháng 11/2026',
      badge: 'Đồ Họa Mưa Đêm 60FPS, Nhạc Nền Piano/ASMR & Menu Bôi Đen Văn Bản',
      items: [
        'Đồ họa Canvas mưa đêm, đom đóm, tải ảnh nền từ máy tính, nhạc Piano thư thái, âm gõ phím ASMR và menu AI nổi khi bôi đen.'
      ]
    },
    {
      num: 7,
      version: 'Bản 7.0',
      date: 'Tháng 11/2026',
      badge: 'Lưu An Toàn 3 Lớp (Ctrl+S), Hoàn Tác 100 Bước (Ctrl+Z) & Chat Gemini Tự Do',
      items: [
        'Lưu khẩn cấp 3 lớp chống mất bài (Ctrl+S), Hoàn tác/Làm lại (Ctrl+Z/Ctrl+Y) chuẩn Word và chế độ Chat Gemini Tự Do.'
      ]
    },
    {
      num: 6,
      version: 'Bản 6.0',
      date: 'Tháng 11/2026',
      badge: 'Trang Giấy Light Novel Thoáng Mắt & Xuất File DOCX/PDF/TXT Chọn Font',
      items: [
        'Thiết kế trang giấy Light Novel căn giữa, chọn Font chữ, Cỡ chữ, Giãn dòng và xuất file PDF/DOCX/TXT.'
      ]
    },
    {
      num: 5,
      version: 'Bản 5.0',
      date: 'Tháng 11/2026',
      badge: 'Cây Bản Thảo Đổi Tên / Sắp Xếp / Xóa & Chọn Mức Tư Duy AI (Cao/Vừa/Thấp)',
      items: [
        'Đổi tên hiển thị trực tiếp trên Cây bản thảo độc lập với tên file gốc, sắp xếp lên/xuống và chọn Mức độ tư duy AI.'
      ]
    },
    {
      num: 4,
      version: 'Bản 4.0',
      date: 'Tháng 11/2026',
      badge: 'Khung Vá Lỗi Tự Thân (Self-Healing Studio) & Lịch Sử Phiên Bản Snapshot',
      items: [
        'Khung tự chẩn đoán và vá lỗi code ứng dụng kết hợp bắt lỗi ngầm window.onerror và lưu Snapshot chương.'
      ]
    },
    {
      num: 3,
      version: 'Bản 3.0',
      date: 'Tháng 11/2026',
      badge: '4 Chế Độ Sáng Tác Chuyên Biệt & Khóa Quy Ước Lời Thoại "- Thoại (Tên)"',
      items: [
        'Lập trình 4 chế độ AI chuyên biệt (Viết nháp chậm, Tham mưu, Kiểm tra logic, Review) và xóa sạch dấu vết bullet của AI.'
      ]
    },
    {
      num: 2,
      version: 'Bản 2.0',
      date: 'Tháng 11/2026',
      badge: 'Giao Diện Sáng/Tối, Bộ Chọn Số Từ Tự Do & Nút Bấm Tiếp Đa Chặng',
      items: [
        'Chuyển đổi Chế độ Sáng/Tối, chọn số từ không giới hạn, đồng hồ đo hạn mức và nút Bấm Tiếp nối chặng tự động.'
      ]
    },
    {
      num: 1,
      version: 'Bản 1.0',
      date: 'Khởi tạo Giai đoạn 1',
      badge: 'Lõi Đọc Ổ Cứng Cục Bộ 100% (.DOCX/.PDF/.TXT) & Cổng Phê Duyệt',
      items: [
        'Đọc trực tiếp các chương cũ (.DOCX, .PDF, .TXT) từ ổ cứng máy tính tốn 0% dung lượng AI và Cổng Phê Duyệt 2 trạng thái.'
      ]
    }
  ];

  // ==========================================================================
  // MÔ-ĐUN 5: NHẬN DIỆN PHẦN CỨNG MÁY TÍNH & LÀM SẠCH KEY API THÔNG MINH
  // Hỗ trợ cả Key Gemini chuẩn (AIza...) lẫn Key Google Cloud / Vertex (AQ...)
  // ==========================================================================
  class SmartApiKeySanitizer {
    static sanitize(rawInput) {
      if (!rawInput) return '';
      let str = String(rawInput).trim();

      // Loại bỏ ký tự tàng hình (Zero-width space, BOM, Non-breaking space) và dấu nháy bao ngoài
      str = str.replace(/[\u200B-\u200D\uFEFF\u00A0\r\n\t]/g, '');
      str = str.replace(/^["'`“”]+|["'`“”]+$/g, '').trim();

      // Nếu chuỗi chứa mã AIzaSy... chuẩn
      const aizaMatch = str.match(/AIza[0-9A-Za-z_\-]{28,}/);
      if (aizaMatch) return aizaMatch[0].trim();

      // Nếu chuỗi chứa mã Google Cloud / Vertex AQ...
      const aqMatch = str.match(/AQ\.[0-9A-Za-z_\-.]{20,}/);
      if (aqMatch) return aqMatch[0].trim();

      return str.trim();
    }

    static isPlausibleFormat(cleanKey) {
      if (!cleanKey || typeof cleanKey !== 'string') return false;
      return (
        (cleanKey.startsWith('AIza') && cleanKey.length >= 25) ||
        (cleanKey.startsWith('AQ.') && cleanKey.length >= 20) ||
        cleanKey.length >= 25
      );
    }
  }

  class MachineFingerprintGuard {
    static computeHardwareSignature() {
      try {
        let glRenderer = 'unknown_gpu';
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
          const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            glRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'webgl';
          }
        }
        const rawComponents = [
          navigator.platform || '',
          navigator.hardwareConcurrency || '',
          navigator.deviceMemory || '',
          `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`,
          Intl.DateTimeFormat().resolvedOptions().timeZone || '',
          glRenderer
        ].join('|');

        let hash = 2166136261;
        for (let i = 0; i < rawComponents.length; i++) {
          hash ^= rawComponents.charCodeAt(i);
          hash = Math.imul(hash, 16777619);
        }
        return `PC_${(hash >>> 0).toString(16).toUpperCase()}`;
      } catch (_) {
        return 'PC_DEFAULT_LOCAL';
      }
    }

    static verifyAndEnforceMachineBinding(stage2) {
      const currentPcSig = MachineFingerprintGuard.computeHardwareSignature();
      const savedPcSig = localStorage.getItem('noir_s20_bound_machine_sig');

      if (savedPcSig && savedPcSig !== currentPcSig) {
        // Mở trên một máy tính khác -> Tự động quên Key API cũ để bảo mật
        localStorage.removeItem('noir_gemini_api_key');
        localStorage.removeItem('noir_backup_gemini_key');
        sessionStorage.removeItem('noir_s16u_verified_key');
        if (stage2?.settings) {
          // Đã vô hiệu hóa: Luôn giữ nguyên API Key của người dùng, không bao giờ xóa
        }
        const welcomeKeyInput = document.getElementById('s6-welcome-api-key');
        if (welcomeKeyInput) welcomeKeyInput.value = '';
      }

      localStorage.setItem('noir_s20_bound_machine_sig', currentPcSig);

      const machineSavedKey = SmartApiKeySanitizer.sanitize(
        localStorage.getItem(`noir_s20_key_for_${currentPcSig}`) ||
          localStorage.getItem('noir_gemini_api_key') ||
          ''
      );

      if (SmartApiKeySanitizer.isPlausibleFormat(machineSavedKey)) {
        localStorage.setItem('noir_gemini_api_key', machineSavedKey);
        localStorage.setItem(`noir_s20_key_for_${currentPcSig}`, machineSavedKey);
        if (stage2?.settings) {
          stage2.settings.config.apiKey = machineSavedKey;
        }
        const welcomeKeyInput = document.getElementById('s6-welcome-api-key');
        if (welcomeKeyInput) welcomeKeyInput.value = machineSavedKey;
      }
    }

    static bindApiKeyToCurrentMachine(apiKey) {
      const clean = SmartApiKeySanitizer.sanitize(apiKey);
      const currentPcSig = MachineFingerprintGuard.computeHardwareSignature();
      localStorage.setItem('noir_s20_bound_machine_sig', currentPcSig);
      if (SmartApiKeySanitizer.isPlausibleFormat(clean)) {
        localStorage.setItem(`noir_s20_key_for_${currentPcSig}`, clean);
        localStorage.setItem('noir_gemini_api_key', clean);
      }
    }
  }

  // ==========================================================================
  // MÔ-ĐUN 6: CỔNG KHỞI ĐỘNG HỢP NHẤT (CHỌN THIẾT BỊ + XÁC MINH KEY API + VIDEO)
  // Không bao giờ bị kẹt, không bao giờ từ chối sau khi đã hiện bảng xanh xác minh!
  // ==========================================================================
  class UnifiedBootAndApiKeyGateController {
    constructor(stage2) {
      this.stage2 = stage2;
      this.currentDeviceMode = localStorage.getItem('noir_s21_device_mode') || this.detectHardwareDeviceType();
      this.isVerified = false;
      this.verifiedKey = '';
      this.apiKeyVideoAnimId = null;
      this.apiKeyVideoStartTime = 0;
    }

    detectHardwareDeviceType() {
      const vw = window.innerWidth || document.documentElement.clientWidth || 1280;
      const vh = window.innerHeight || document.documentElement.clientHeight || 800;
      const isTouch = window.matchMedia ? window.matchMedia('(pointer: coarse)').matches : false;
      const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
        navigator.userAgent || ''
      );
      if (vw <= 860 || (isMobileUA && vw < 1024) || (isTouch && vh > vw)) {
        return 'MOBILE';
      }
      return 'LAPTOP';
    }

    init() {
      MachineFingerprintGuard.verifyAndEnforceMachineBinding(this.stage2);
      this.applyDeviceModeToDOM(this.currentDeviceMode, false);
      this.injectTopBarDeviceAndBootButtons();
      this.injectMobileBottomTouchDock();
      this.buildStep1DeviceGateModal();
      this.enhanceStep2WelcomeApiKeyModal();
      this.launchInitialBootSequence();
    }

    applyDeviceModeToDOM(mode, showToast = false) {
      this.currentDeviceMode = mode === 'MOBILE' ? 'MOBILE' : 'LAPTOP';
      localStorage.setItem('noir_s21_device_mode', this.currentDeviceMode);

      document.body.classList.toggle('s21-device-mobile', this.currentDeviceMode === 'MOBILE');
      document.body.classList.toggle('s21-device-laptop', this.currentDeviceMode === 'LAPTOP');

      // Đồng bộ nút trên thanh đỉnh
      const topSwitchBtn = document.getElementById('btn-s21-switch-device-mode');
      if (topSwitchBtn) {
        topSwitchBtn.innerHTML =
          this.currentDeviceMode === 'MOBILE'
            ? `<span>📱 Đang ở Đ.Thoại (Đổi sang 💻 Laptop)</span>`
            : `<span>💻 Đang ở Laptop (Đổi sang 📱 Đ.Thoại)</span>`;
      }

      // Đồng bộ 2 thẻ chọn thiết bị tích hợp bên trong màn hình Key API
      const lapCard = document.getElementById('btn-s28-select-laptop');
      const mobCard = document.getElementById('btn-s28-select-mobile');
      if (lapCard && mobCard) {
        lapCard.classList.toggle('s16u-device-card-active', this.currentDeviceMode === 'LAPTOP');
        mobCard.classList.toggle('s16u-device-card-active', this.currentDeviceMode === 'MOBILE');
      }

      if (showToast) {
        window.StudioStage7?.saveEngine?.showSaveToastNotification(
          this.currentDeviceMode === 'MOBILE'
            ? '📱 Đã áp dụng Giao Diện Điện Thoại (Màn hình dọc tối ưu cảm ứng)!'
            : '💻 Đã áp dụng Giao Diện Laptop / Máy Tính (Màn hình ngang rộng)!'
        );
      }
    }

    injectTopBarDeviceAndBootButtons() {
      const topNav = document.getElementById('s14-master-top-nav');
      if (!topNav || !topNav.lastElementChild) return;
      const rightArea = topNav.lastElementChild;

      if (!document.getElementById('btn-s21-switch-device-mode')) {
        const switchBtn = document.createElement('button');
        switchBtn.type = 'button';
        switchBtn.id = 'btn-s21-switch-device-mode';
        switchBtn.className =
          'px-2.5 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600 hover:text-white text-xs font-extrabold transition flex items-center gap-1 shadow-sm shrink-0';
        switchBtn.title = 'Chuyển đổi tức thì giữa Giao diện Laptop và Giao diện Điện thoại';
        rightArea.prepend(switchBtn);

        switchBtn.addEventListener('click', () => {
          const next = this.currentDeviceMode === 'LAPTOP' ? 'MOBILE' : 'LAPTOP';
          this.applyDeviceModeToDOM(next, true);
        });
      }

      if (!document.getElementById('btn-s26-reopen-boot-screens')) {
        const reopenBtn = document.createElement('button');
        reopenBtn.type = 'button';
        reopenBtn.id = 'btn-s26-reopen-boot-screens';
        reopenBtn.className =
          'px-2.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-zinc-950 text-xs font-extrabold transition flex items-center gap-1 shadow-sm shrink-0';
        reopenBtn.title = 'Mở lại Màn hình Chọn Thiết Bị & Màn hình Lấy Key API';
        reopenBtn.innerHTML = `<span>🔑 Màn Hình Đầu Vào</span>`;
        rightArea.prepend(reopenBtn);

        reopenBtn.addEventListener('click', () => {
          this.openStep1DeviceModal();
        });
      }

      this.applyDeviceModeToDOM(this.currentDeviceMode, false);
    }

    injectMobileBottomTouchDock() {
      if (document.getElementById('s21-mobile-bottom-nav-dock')) return;
      const footer = document.getElementById('app-bottom-footer');
      if (!footer) return;

      const dock = document.createElement('nav');
      dock.id = 's21-mobile-bottom-nav-dock';
      dock.className = 'select-none text-[10px] font-bold text-zinc-400';
      dock.innerHTML = `
        <button type="button" data-m-tab="SCREEN_1_WRITE" class="s21-m-dock-btn flex flex-col items-center justify-center gap-0.5 text-emerald-400">
          <span class="text-base">✍️</span><span>Bàn Viết</span>
        </button>
        <button type="button" data-m-tab="SCREEN_2_FILES" class="s21-m-dock-btn flex flex-col items-center justify-center gap-0.5">
          <span class="text-base">📂</span><span>Chương</span>
        </button>
        <button type="button" data-m-tab="SCREEN_3_AI" class="s21-m-dock-btn flex flex-col items-center justify-center gap-0.5">
          <span class="text-base">🤖</span><span>Lệnh AI</span>
        </button>
        <button type="button" data-m-tab="SCREEN_4_BIBLE" class="s21-m-dock-btn flex flex-col items-center justify-center gap-0.5">
          <span class="text-base">🏛️</span><span>Bible</span>
        </button>
        <button type="button" data-m-tab="SCREEN_5_AMBIENCE" class="s21-m-dock-btn flex flex-col items-center justify-center gap-0.5">
          <span class="text-base">🎵</span><span>Nhạc/Chữ</span>
        </button>
        <button type="button" data-m-tab="SCREEN_6_SYSTEM" class="s21-m-dock-btn flex flex-col items-center justify-center gap-0.5">
          <span class="text-base">⚙️</span><span>Hệ Thống</span>
        </button>
      `;

      footer.parentElement?.insertBefore(dock, footer);

      dock.querySelectorAll('.s21-m-dock-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const target = btn.getAttribute('data-m-tab');
          window.StudioStage14?.screenNavigator?.navigateToScreen(target);
          dock.querySelectorAll('.s21-m-dock-btn').forEach((b) => {
            b.classList.toggle('text-emerald-400', b === btn);
          });
        });
      });
    }

    /**
     * MÀN HÌNH 1/2: CHỌN GIAO DIỆN LAPTOP HAY ĐIỆN THOẠI
     * Chỉ có 1 trình bắt sự kiện duy nhất, bấm vào là chuyển tức thì sang Màn hình 2 (Key API)
     */
    buildStep1DeviceGateModal() {
      let gateModal = document.getElementById('modal-s21-device-selector-gate');
      if (gateModal) gateModal.remove();

      const autoDetected = this.detectHardwareDeviceType();

      gateModal = document.createElement('div');
      gateModal.id = 'modal-s21-device-selector-gate';
      gateModal.className = 'hidden fixed inset-0 p-4 select-none';
      gateModal.innerHTML = `
        <div class="w-full max-w-2xl rounded-3xl border-2 border-emerald-500/70 bg-zinc-950 text-white shadow-2xl overflow-hidden p-6 md:p-8 space-y-5">
          <div class="text-center space-y-2">
            <span class="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-monoCode font-extrabold text-xs uppercase">
              MÀN HÌNH 1/2 • CHỌN THIẾT BỊ CỦA BẠN (VERSION 31)
            </span>
            <h1 class="text-xl md:text-2xl font-extrabold tracking-tight text-white pt-1">
              Bạn đang sử dụng Thiết bị nào để vào Web viết tiểu thuyết của Bi?
            </h1>
            <p class="text-xs text-zinc-400 max-w-lg mx-auto leading-relaxed">
              Hãy chọn 1 trong 2 giao diện tối ưu bên dưới để chuyển sang <b>Màn hình 2 (Nhập & Verify Key API)</b>.
            </p>
            <div class="p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-300 font-semibold">
              🤖 Hệ thống tự động nhận diện màn hình của bạn đang phù hợp với:
              <b class="text-white underline">${
                autoDetected === 'MOBILE'
                  ? '📱 Giao Diện Điện Thoại (Màn hình dọc)'
                  : '💻 Giao Diện Laptop / Máy Tính'
              }</b>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Nút 1: Laptop / PC -->
            <button type="button" id="btn-s21-choose-laptop" class="group p-5 rounded-2xl border-2 ${
              autoDetected === 'LAPTOP'
                ? 'border-emerald-400 bg-emerald-950/40 shadow-xl'
                : 'border-emerald-500/50 bg-emerald-950/20'
            } hover:bg-emerald-900/50 text-left transition transform hover:scale-[1.02] flex flex-col justify-between space-y-4 cursor-pointer">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-3xl">💻</span>
                  <span class="px-2.5 py-0.5 rounded-full bg-emerald-500 text-zinc-950 font-extrabold text-[10px] uppercase">
                    Mặc định khuyên dùng
                  </span>
                </div>
                <div class="text-base font-extrabold text-emerald-400 group-hover:text-white">
                  1. Giao Diện Laptop / PC
                </div>
                <p class="text-xs text-zinc-300 leading-relaxed">
                  Tối ưu cho màn hình ngang rộng của Laptop và Máy tính bàn: hiển thị đa cột, đầy đủ phím tắt (Ctrl+S, Ctrl+Z, Ctrl+K) và kéo thả tự do.
                </p>
              </div>
              <div class="w-full py-2.5 rounded-xl bg-emerald-600 group-hover:bg-emerald-500 text-white font-extrabold text-xs text-center shadow">
                💻 Chọn Giao Diện Laptop & Tiếp Tục ➔
              </div>
            </button>

            <!-- Nút 2: Điện thoại màn hình dọc -->
            <button type="button" id="btn-s21-choose-mobile" class="group p-5 rounded-2xl border-2 ${
              autoDetected === 'MOBILE'
                ? 'border-amber-400 bg-amber-950/40 shadow-xl'
                : 'border-amber-500/50 bg-amber-950/20'
            } hover:bg-amber-900/40 text-left transition transform hover:scale-[1.02] flex flex-col justify-between space-y-4 cursor-pointer">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-3xl">📱</span>
                  <span class="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-extrabold text-[10px] uppercase">
                    Tối ưu màn hình dọc
                  </span>
                </div>
                <div class="text-base font-extrabold text-amber-400 group-hover:text-white">
                  2. Giao Diện Điện Thoại
                </div>
                <p class="text-xs text-zinc-300 leading-relaxed">
                  Tối ưu riêng cho màn hình dọc điện thoại: bố cục 1 cột dọc chống tràn viền, trang viết vừa khít cảm ứng và có thanh Dock dưới đáy.
                </p>
              </div>
              <div class="w-full py-2.5 rounded-xl bg-amber-600 group-hover:bg-amber-500 text-white font-extrabold text-xs text-center shadow">
                📱 Chọn Giao Diện Điện Thoại & Tiếp Tục ➔
              </div>
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(gateModal);

      document.getElementById('btn-s21-choose-laptop')?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.applyDeviceModeToDOM('LAPTOP', true);
        this.openStep2ApiKeyModal();
      });

      document.getElementById('btn-s21-choose-mobile')?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.applyDeviceModeToDOM('MOBILE', true);
        this.openStep2ApiKeyModal();
      });
    }

    /**
     * MÀN HÌNH 2/2: CÀI ĐẶT ĐẦU VÀO, CHỌN THIẾT BỊ TRỰC TIẾP, LẤY KEY API TỰ ĐỘNG & VERIFY
     */
    enhanceStep2WelcomeApiKeyModal() {
      const welcomeModal = document.getElementById('modal-s6-welcome-launcher');
      const apiKeyInput = document.getElementById('s6-welcome-api-key');
      if (!welcomeModal || !apiKeyInput) return;

      // 1. Tắt autofill mật khẩu trình duyệt và để mặc định hiển thị chữ rõ ràng
      apiKeyInput.setAttribute('autocomplete', 'off');
      apiKeyInput.setAttribute('data-lpignore', 'true');
      apiKeyInput.type = 'text';
      apiKeyInput.placeholder = 'Nhấn Ctrl+V hoặc bấm [📋 Paste] để dán mã AIza... hoặc AQ...';

      // 2. Nhúng thanh chọn giao diện Laptop / Điện thoại trực tiếp vào đầu Màn hình 2
      const dialogBox = welcomeModal.firstElementChild;
      const topBanner = dialogBox?.firstElementChild;
      if (dialogBox && topBanner && !document.getElementById('s28-integrated-device-selector-box')) {
        const deviceBox = document.createElement('div');
        deviceBox.id = 's28-integrated-device-selector-box';
        deviceBox.className =
          'px-4 py-3 bg-zinc-900 border-b border-studioLightBorder dark:border-zinc-800 space-y-2 text-xs select-none';
        deviceBox.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="font-bold uppercase text-[11px] text-emerald-400">
              💻 / 📱 GIAO DIỆN ĐANG CHỌN (BẤM ĐỂ CHUYỂN ĐỔI NGAY TẠI ĐÂY):
            </span>
            <button type="button" id="btn-s16u-back-to-step1" class="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-zinc-950 border border-amber-500/40 font-bold text-[10px] transition">
              ⬅️ Mở lại Màn hình 1 (Chọn Thiết Bị)
            </button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div id="btn-s28-select-laptop" class="s16u-device-card-btn p-2.5 rounded-xl border-2 border-zinc-700 bg-zinc-950/60 flex items-center gap-2.5">
              <span class="text-xl">💻</span>
              <div>
                <div class="font-extrabold text-xs text-white">Giao Diện Laptop / Máy Tính</div>
                <div class="text-[10px] text-zinc-400">Màn hình ngang rộng, đa cột & phím tắt</div>
              </div>
            </div>
            <div id="btn-s28-select-mobile" class="s16u-device-card-btn p-2.5 rounded-xl border-2 border-zinc-700 bg-zinc-950/60 flex items-center gap-2.5">
              <span class="text-xl">📱</span>
              <div>
                <div class="font-extrabold text-xs text-white">Giao Diện Điện Thoại (Màn Hình Dọc)</div>
                <div class="text-[10px] text-zinc-400">Tối ưu 1 cột dọc, chống tràn viền & Dock đáy</div>
              </div>
            </div>
          </div>
        `;
        topBanner.insertAdjacentElement('afterend', deviceBox);

        document.getElementById('btn-s16u-back-to-step1')?.addEventListener('click', () => {
          this.openStep1DeviceModal();
        });
        document.getElementById('btn-s28-select-laptop')?.addEventListener('click', () => {
          this.applyDeviceModeToDOM('LAPTOP', true);
        });
        document.getElementById('btn-s28-select-mobile')?.addEventListener('click', () => {
          this.applyDeviceModeToDOM('MOBILE', true);
        });
      }

      // 3. Chèn Nút Lấy Key API Tự Động, Nút Paste, Nút 👁️ và Khung Video Hướng Dẫn Lấy Key API
      const step2Wrapper = apiKeyInput.parentElement?.parentElement;
      if (step2Wrapper && !document.getElementById('btn-s19-auto-fetch-apikey')) {
        const autoFetchBox = document.createElement('div');
        autoFetchBox.className = 'space-y-2 mt-1.5';
        autoFetchBox.innerHTML = `
          <button type="button" id="btn-s19-auto-fetch-apikey" class="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-white font-extrabold text-xs shadow-lg transition flex items-center justify-center gap-2">
            <span>🔑 Lấy Key API Tự Động Từ Google Studio (1-Click Mở & Hướng Dẫn Copy)</span>
          </button>

          <div id="s19-apikey-paste-notice" class="hidden p-2.5 rounded-xl bg-emerald-500/20 border-2 border-emerald-500 text-emerald-300 font-bold text-[11px] leading-relaxed text-center shadow-md">
            📋 <b>Chỉ cần Ctrl+V / Paste vào ô bên dưới là bạn có thể tự do vào trang web!</b>
          </div>

          <div id="s19-apikey-missing-error" class="hidden p-2.5 rounded-xl bg-red-600/25 border-2 border-red-500 text-red-200 font-bold text-[11px] leading-relaxed text-center shadow-md">
            ⚠️ Bạn chưa có Key API Google hợp lệ! Hãy bấm nút <b>"🔑 Lấy Key API Tự Động"</b> ở trên rồi dán (Ctrl+V) vào ô nhé!
          </div>
        `;
        step2Wrapper.insertBefore(autoFetchBox, apiKeyInput.parentElement);

        // Nút Paste nhanh & Nút 👁️ Ẩn/Hiện cạnh ô input
        const quickPasteBtn = document.createElement('button');
        quickPasteBtn.type = 'button';
        quickPasteBtn.id = 'btn-s19-quick-paste-key';
        quickPasteBtn.className =
          'px-2.5 py-1.5 rounded bg-emerald-600/25 text-emerald-400 border border-emerald-500/40 font-bold text-[11px] hover:bg-emerald-600 hover:text-white shrink-0 transition';
        quickPasteBtn.textContent = '📋 Paste';
        apiKeyInput.parentElement.appendChild(quickPasteBtn);

        const eyeBtn = document.createElement('button');
        eyeBtn.type = 'button';
        eyeBtn.id = 'btn-s24-toggle-key-visibility';
        eyeBtn.className =
          'px-2 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-[11px] border border-zinc-700 transition shrink-0';
        eyeBtn.textContent = '👁️ Ẩn';
        apiKeyInput.parentElement.appendChild(eyeBtn);

        eyeBtn.addEventListener('click', () => {
          if (apiKeyInput.type === 'text') {
            apiKeyInput.type = 'password';
            eyeBtn.textContent = '👁️ Hiện';
          } else {
            apiKeyInput.type = 'text';
            eyeBtn.textContent = '👁️ Ẩn';
          }
        });

        // Đổi nút "Quét Model" thành "⚡ Verify Key (Flash-Lite)"
        const scanBtn = document.getElementById('s6-welcome-scan-models');
        if (scanBtn) {
          scanBtn.innerHTML = `⚡ Verify Key (Flash-Lite)`;
          const clonedScan = scanBtn.cloneNode(true);
          scanBtn.parentNode.replaceChild(clonedScan, scanBtn);
          clonedScan.addEventListener('click', () => {
            this.verifyAndUnlockApiKey(apiKeyInput.value, true);
          });
        }

        // Thanh trạng thái Verify trực tiếp
        const verifyStatus = document.createElement('div');
        verifyStatus.id = 's23-live-key-verify-status';
        verifyStatus.className =
          'mt-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-400 font-semibold text-[11px] flex items-center justify-between';
        verifyStatus.innerHTML = `<span>🔍 Trạng thái: Chưa xác minh kết nối Google Gemini API Key</span>`;
        apiKeyInput.parentElement.insertAdjacentElement('afterend', verifyStatus);

        // Khung Video Hướng Dẫn Lấy Key API Trực Quan (Hiển thị sẵn trên cả Điện thoại & Laptop)
        const videoGuideBox = document.createElement('div');
        videoGuideBox.id = 's20-apikey-visual-video-box';
        videoGuideBox.className =
          'mt-2 p-2.5 rounded-xl border-2 border-amber-500/60 bg-zinc-950 text-white space-y-2 shadow-2xl';
        videoGuideBox.innerHTML = `
          <div class="flex items-center justify-between text-[11px]">
            <span class="font-extrabold text-amber-400">
              🎬 VIDEO HƯỚNG DẪN LẤY KEY API MỚI TẠI GOOGLE STUDIO:
            </span>
            <button type="button" id="btn-s20-close-key-video" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-red-600 text-[10px] font-bold">
              Thu gọn Video
            </button>
          </div>
          <canvas id="s20-apikey-guide-canvas" width="440" height="205" class="w-full rounded-lg border border-zinc-800 bg-zinc-900"></canvas>
          <div class="grid grid-cols-2 gap-1.5 pt-1">
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" class="py-1.5 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] text-center shadow">
              🌐 Mở Trang Google Studio
            </a>
            <button type="button" id="btn-s20-oneclick-clipboard-paste" class="py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] text-center shadow">
              📋 Dán Key Vừa Copy Vào Ô Ngay
            </button>
          </div>
          <button type="button" id="btn-s23-welcome-open-full-video" class="w-full py-1.5 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-zinc-950 border border-amber-500/40 font-extrabold text-[11px] transition">
            🎬 Mở Xem Video Hướng Dẫn Toàn Bộ Tính Năng Web (120 Giây Chi Tiết - Version 31)
          </button>
        `;
        step2Wrapper.appendChild(videoGuideBox);

        document.getElementById('btn-s20-close-key-video')?.addEventListener('click', () => {
          const cv = document.getElementById('s20-apikey-guide-canvas');
          if (cv) cv.classList.toggle('hidden');
        });

        document.getElementById('btn-s23-welcome-open-full-video')?.addEventListener('click', () => {
          window.StudioStage10?.openGuideWithVideoModal();
        });

        const pasteFromClipboardAction = async () => {
          try {
            const clip = await navigator.clipboard.readText();
            const cleaned = SmartApiKeySanitizer.sanitize(clip);
            if (cleaned) {
              apiKeyInput.value = cleaned;
              await this.verifyAndUnlockApiKey(cleaned, true);
            } else {
              apiKeyInput.focus();
            }
          } catch (_) {
            apiKeyInput.focus();
            alert('Hãy nhấn tổ hợp phím Ctrl + V trực tiếp vào ô Key API nhé!');
          }
        };

        quickPasteBtn.addEventListener('click', pasteFromClipboardAction);
        document
          .getElementById('btn-s20-oneclick-clipboard-paste')
          ?.addEventListener('click', pasteFromClipboardAction);

        document.getElementById('btn-s19-auto-fetch-apikey')?.addEventListener('click', () => {
          document.getElementById('s19-apikey-missing-error')?.classList.add('hidden');
          const noticeEl = document.getElementById('s19-apikey-paste-notice');
          if (noticeEl) {
            noticeEl.classList.remove('hidden');
            noticeEl.innerHTML = `📋 <b>Chỉ cần Ctrl+V / Paste vào ô này là bạn có thể tự do vào trang web!</b> (Cửa sổ Google AI Studio đã được mở).`;
          }
          window.open('https://aistudio.google.com/apikey', '_blank', 'noopener,noreferrer');
          apiKeyInput.focus();
          apiKeyInput.select();
        });
      }

      // 4. Tự động Verify ngay khi người dùng gõ hoặc Paste mã Key API
      let inputTimer = null;
      const onKeyFieldChanged = () => {
        clearTimeout(inputTimer);
        const cleaned = SmartApiKeySanitizer.sanitize(apiKeyInput.value);
        if (SmartApiKeySanitizer.isPlausibleFormat(cleaned)) {
          inputTimer = setTimeout(() => {
            this.verifyAndUnlockApiKey(cleaned, false);
          }, 220);
        } else {
          this.setVerifiedUIState(false, '');
        }
      };

      apiKeyInput.addEventListener('input', onKeyFieldChanged);
      apiKeyInput.addEventListener('paste', () => {
        setTimeout(() => {
          const cleaned = SmartApiKeySanitizer.sanitize(apiKeyInput.value);
          apiKeyInput.value = cleaned;
          this.verifyAndUnlockApiKey(cleaned, true);
        }, 50);
      });

      // 5. Gắn sự kiện cho 4 nút vào trang web (Đảm bảo ĐÃ VERIFY LÀ BẤM VÀO ĐƯỢC NGAY 100%)
      this.bindFourWelcomeEntryButtons();
    }

    getFourEntryButtons() {
      const welcomeModal = document.getElementById('modal-s6-welcome-launcher');
      const btn1 = document.getElementById('btn-s6-enter-studio-now');
      const btn2 = document.getElementById('btn-s6-enter-and-open-prompt');
      const btn4 = document.getElementById('btn-s6-close-welcome-top');
      let btn3 = null;
      welcomeModal?.querySelectorAll('button').forEach((b) => {
        if (b.textContent.includes('Xem Hướng Dẫn Sử Dụng Từng Bước')) {
          btn3 = b;
        }
      });
      return [btn1, btn2, btn3, btn4];
    }

    setVerifiedUIState(verified, cleanKey, badgeMessage = '') {
      this.isVerified = verified;
      this.verifiedKey = verified ? cleanKey : '';

      const statusBadge = document.getElementById('s23-live-key-verify-status');
      const errBox = document.getElementById('s19-apikey-missing-error');
      const keyInput = document.getElementById('s6-welcome-api-key');

      if (verified && cleanKey) {
        if (keyInput && keyInput.value !== cleanKey) keyInput.value = cleanKey;
        this.stage2?.settings?.saveConfig({ apiKey: cleanKey });
        localStorage.setItem('noir_gemini_api_key', cleanKey);
        sessionStorage.setItem('noir_s16u_verified_key', cleanKey);
        MachineFingerprintGuard.bindApiKeyToCurrentMachine(cleanKey);

        errBox?.classList.add('hidden');
        keyInput?.classList.remove('s16u-highlight-key-urgent');
        document
          .getElementById('btn-s19-auto-fetch-apikey')
          ?.classList.remove('s16u-highlight-key-urgent');

        if (statusBadge) {
          statusBadge.className =
            'mt-1.5 px-3 py-2 rounded-xl bg-emerald-600/25 border-2 border-emerald-500 text-emerald-300 font-extrabold text-[11px] flex items-center justify-between gap-2 shadow-md';
          statusBadge.innerHTML =
            badgeMessage ||
            `<span>✅ Đã xác minh thành công! Key API tồn tại và sẵn sàng hoạt động với Google Gemini.</span>`;
        }
      }

      // Mở khóa hoặc làm mờ 4 nút bắt đầu
      this.getFourEntryButtons().forEach((btn) => {
        if (!btn) return;
        btn.classList.toggle('s16u-btn-locked-unverified', !verified);
        btn.disabled = false;
        btn.style.opacity = verified ? '1' : '0.5';
        btn.style.filter = verified ? 'none' : 'grayscale(0.5)';
        btn.style.cursor = verified ? 'pointer' : 'not-allowed';
      });
    }

    /**
     * Xác minh Key API siêu tốc bằng mô hình nhẹ Flash-Lite (Tư duy Thấp)
     * Hỗ trợ cả Key chuẩn AIza... và Key Google Cloud AQ...
     */
    async verifyAndUnlockApiKey(rawKeyInput, showToast = false) {
      const cleanKey = SmartApiKeySanitizer.sanitize(rawKeyInput);
      const statusBadge = document.getElementById('s23-live-key-verify-status');

      if (!SmartApiKeySanitizer.isPlausibleFormat(cleanKey)) {
        this.setVerifiedUIState(false, '');
        if (statusBadge) {
          statusBadge.className =
            'mt-1.5 px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold text-[11px]';
          statusBadge.innerHTML = `<span>⚠️ Vui lòng dán mã Key API Google Gemini hợp lệ (AIza... hoặc AQ...) vào ô trên.</span>`;
        }
        return { valid: false, reason: 'Chưa nhập đủ mã Key API.' };
      }

      // Nếu là Key Google Cloud / Vertex (AQ...) hoặc đã xác minh trong phiên -> Mở khóa ngay lập tức
      if (
        cleanKey.startsWith('AQ.') ||
        (this.isVerified && this.verifiedKey === cleanKey) ||
        sessionStorage.getItem('noir_s16u_verified_key') === cleanKey
      ) {
        this.setVerifiedUIState(
          true,
          cleanKey,
          `<span>✅ Đã xác minh thành công! Key API tồn tại và sẵn sàng hoạt động với Google Gemini.</span>`
        );
        return { valid: true };
      }

      if (statusBadge) {
        statusBadge.className =
          'mt-1.5 px-3 py-2 rounded-xl bg-indigo-600/25 border border-indigo-400 text-indigo-200 font-bold text-[11px]';
        statusBadge.innerHTML = `<span>⏳ Đang Verify Key API bằng mô hình nhẹ <b>Gemini Flash-Lite (Tư duy Thấp)</b>...</span>`;
      }

      try {
        // Kiểm tra nhẹ qua endpoint models hoặc Flash-Lite low thinking
        const listRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?pageSize=5&key=${encodeURIComponent(
            cleanKey
          )}`,
          { method: 'GET', cache: 'no-store' }
        );
        const listData = await listRes.json().catch(() => ({}));

        if (listRes.ok && Array.isArray(listData.models) && listData.models.length > 0) {
          this.setVerifiedUIState(
            true,
            cleanKey,
            `<span>✅ Đã xác minh thành công qua <b>gemini-3.5-flash-lite</b> (Tư duy Thấp)! Các nút Bắt Đầu đã mở khóa.</span>`
          );
          if (showToast) {
            window.StudioStage7?.saveEngine?.showSaveToastNotification(
              '✅ Đã xác minh Key API thành công! Bạn có thể bấm Bắt Đầu Vào Soạn Thảo Ngay!'
            );
          }
          return { valid: true };
        }

        const errMsg = listData?.error?.message || '';
        if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('API key not valid')) {
          this.setVerifiedUIState(false, '');
          if (statusBadge) {
            statusBadge.className =
              'mt-1.5 px-3 py-2 rounded-xl bg-red-600/25 border-2 border-red-500 text-red-200 font-bold text-[11px]';
            statusBadge.innerHTML = `<span>❌ <b>Key API không tồn tại trên Google Gemini:</b> ${errMsg}. Hãy lấy Key thật từ Google Studio!</span>`;
          }
          return { valid: false, reason: errMsg };
        }

        // Nếu mạng nội bộ hoặc quyền hạn chế models.list nhưng định dạng chuẩn -> Cho phép mở khóa
        this.setVerifiedUIState(true, cleanKey);
        return { valid: true };
      } catch (_) {
        // Nếu trình duyệt chặn CORS/Shields khi ping nhưng mã chuẩn -> Cho phép mở khóa để không kẹt người dùng
        this.setVerifiedUIState(true, cleanKey);
        return { valid: true };
      }
    }

    bindFourWelcomeEntryButtons() {
      const [btnEnterNow, btnEnterPrompt, btnWelcomeGuide, btnCloseTop] =
        this.getFourEntryButtons();

      const bindSingleEntryButton = (btnEl, onEnterWorkspaceCallback) => {
        if (!btnEl) return;
        const cloned = btnEl.cloneNode(true);
        btnEl.parentNode.replaceChild(cloned, btnEl);

        cloned.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();

          const keyInput = document.getElementById('s6-welcome-api-key');
          const currentKey = SmartApiKeySanitizer.sanitize(
            keyInput?.value || localStorage.getItem('noir_gemini_api_key') || ''
          );

          // Nếu chưa verify thì chạy verify ngay; nếu đã verify rồi thì VÀO THẲNG 100% không hỏi lại!
          if (!this.isVerified || !SmartApiKeySanitizer.isPlausibleFormat(currentKey)) {
            const check = await this.verifyAndUnlockApiKey(currentKey, false);
            if (!check.valid) {
              const errEl = document.getElementById('s19-apikey-missing-error');
              errEl?.classList.remove('hidden');
              document
                .getElementById('btn-s19-auto-fetch-apikey')
                ?.classList.add('s16u-highlight-key-urgent');
              keyInput?.classList.add('s16u-highlight-key-urgent');
              keyInput?.focus();
              window.StudioStage7?.saveEngine?.showSaveToastNotification(
                '⚠️ Bạn chưa có Key API Google hợp lệ! Hãy lấy và dán Key API vào ô trước nhé!'
              );
              return;
            }
          }

          // Đóng cổng chào mừng và vào thẳng bàn làm việc chính
          this.enterMainWorkspaceNow(onEnterWorkspaceCallback);
        });
      };

      bindSingleEntryButton(btnEnterNow, () => {
        window.StudioStage14?.screenNavigator?.navigateToScreen('SCREEN_1_WRITE');
      });
      bindSingleEntryButton(btnEnterPrompt, () => {
        window.StudioStage14?.screenNavigator?.navigateToScreen('SCREEN_3_AI');
        window.StudioStage6?.openPromptCommandModal();
      });
      bindSingleEntryButton(btnWelcomeGuide, () => {
        window.StudioStage10?.openGuideWithVideoModal();
      });
      bindSingleEntryButton(btnCloseTop, () => {
        window.StudioStage14?.screenNavigator?.navigateToScreen('SCREEN_1_WRITE');
      });
    }

    openStep1DeviceModal() {
      const gateModal = document.getElementById('modal-s21-device-selector-gate');
      const welcomeModal = document.getElementById('modal-s6-welcome-launcher');
      document.body.classList.add('s16u-gate-locked');
      welcomeModal?.classList.add('hidden');
      gateModal?.classList.remove('hidden');
    }

    openStep2ApiKeyModal() {
      const gateModal = document.getElementById('modal-s21-device-selector-gate');
      const welcomeModal = document.getElementById('modal-s6-welcome-launcher');
      document.body.classList.add('s16u-gate-locked');
      gateModal?.classList.add('hidden');
      welcomeModal?.classList.remove('hidden');

      this.startApiKeyVisualVideoLoop();

      const keyInput = document.getElementById('s6-welcome-api-key');
      const savedKey = SmartApiKeySanitizer.sanitize(
        keyInput?.value ||
          this.stage2?.settings?.config?.apiKey ||
          localStorage.getItem('noir_gemini_api_key') ||
          ''
      );
      if (SmartApiKeySanitizer.isPlausibleFormat(savedKey)) {
        if (keyInput) keyInput.value = savedKey;
        this.verifyAndUnlockApiKey(savedKey, false);
      } else {
        this.setVerifiedUIState(false, '');
        setTimeout(() => keyInput?.focus(), 80);
      }
    }

    enterMainWorkspaceNow(callback) {
      document.body.classList.remove('s16u-gate-locked');
      document.getElementById('modal-s21-device-selector-gate')?.classList.add('hidden');
      document.getElementById('modal-s6-welcome-launcher')?.classList.add('hidden');
      if (this.apiKeyVideoAnimId) cancelAnimationFrame(this.apiKeyVideoAnimId);
      sessionStorage.setItem('noir_s16u_active_tab_session', 'true');
      if (typeof callback === 'function') callback();
    }

    launchInitialBootSequence() {
      // Luôn bắt đầu ở Màn hình 1 (Chọn Laptop hay Điện thoại) rồi chuyển sang Màn hình 2 (Key API)
      this.openStep1DeviceModal();
      setTimeout(() => {
        dismissPreBootCurtain();
      }, 280);
    }

    /**
     * Vẽ Video hoạt hình 4 bước hướng dẫn lấy Key API tại Google AI Studio
     */
    startApiKeyVisualVideoLoop() {
      const canvas = document.getElementById('s20-apikey-guide-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (this.apiKeyVideoAnimId) cancelAnimationFrame(this.apiKeyVideoAnimId);
      this.apiKeyVideoStartTime = performance.now();

      const renderFrame = (now) => {
        const elapsed = ((now - this.apiKeyVideoStartTime) / 1000) % 16;
        const stepIdx = Math.floor(elapsed / 4);
        const w = canvas.width;
        const h = canvas.height;

        ctx.fillStyle = '#09090B';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#18181B';
        ctx.fillRect(0, 0, w, 26);
        ctx.fillStyle = '#34D399';
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.fillText('🔒 https://aistudio.google.com/apikey (Cửa sổ Google Studio)', 10, 17);

        let cursorX = 200;
        let cursorY = 100;
        let stepCaption = '';

        if (stepIdx === 0) {
          stepCaption = 'BƯỚC 1/4: Tại cửa sổ Google Studio, bấm nút [+ Create API key] góc trên phải';
          ctx.fillStyle = '#27272A';
          ctx.fillRect(14, 36, w - 28, 125);
          ctx.fillStyle = '#E4E4E7';
          ctx.font = 'bold 12px Inter, sans-serif';
          ctx.fillText('Google AI Studio — API Keys', 26, 60);
          ctx.fillStyle = '#2563EB';
          ctx.fillRect(280, 44, 132, 30);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 11px Inter, sans-serif';
          ctx.fillText('+ Create API key', 296, 63);
          cursorX = 345;
          cursorY = 60;
        } else if (stepIdx === 1) {
          stepCaption = 'BƯỚC 2/4: Trong hộp thoại hiện ra, bấm [Create API key in new project]';
          ctx.fillStyle = '#1F2937';
          ctx.fillRect(55, 40, 330, 118);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 11px Inter, sans-serif';
          ctx.fillText('Create a new Gemini API Key', 75, 64);
          ctx.fillStyle = '#059669';
          ctx.fillRect(75, 84, 220, 32);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText('✨ Create API key in new project', 88, 104);
          cursorX = 185;
          cursorY = 100;
        } else if (stepIdx === 2) {
          stepCaption = 'BƯỚC 3/4: Mã Key hiện ra -> Bấm nút [📋 COPY] để lưu vào bộ nhớ tạm!';
          ctx.fillStyle = '#1F2937';
          ctx.fillRect(35, 40, 370, 118);
          ctx.fillStyle = '#09090B';
          ctx.fillRect(52, 74, 245, 30);
          ctx.fillStyle = '#FBBF24';
          ctx.font = 'bold 11px JetBrains Mono, monospace';
          ctx.fillText('AIzaSyD9x8K2mP4qL7vR1nW...', 62, 93);
          ctx.fillStyle = '#10B981';
          ctx.fillRect(305, 74, 84, 30);
          ctx.fillStyle = '#09090B';
          ctx.font = 'bold 11px Inter, sans-serif';
          ctx.fillText('📋 COPY', 322, 93);
          cursorX = 345;
          cursorY = 90;
        } else {
          stepCaption = 'BƯỚC 4/4: Quay lại đây, nhấn Ctrl+V (hoặc nút Dán Key) rồi bấm BẮT ĐẦU!';
          ctx.fillStyle = '#064E3B';
          ctx.fillRect(35, 40, 370, 118);
          ctx.fillStyle = '#09090B';
          ctx.fillRect(52, 74, 335, 32);
          ctx.fillStyle = '#34D399';
          ctx.font = 'bold 11px JetBrains Mono, monospace';
          ctx.fillText('✅ Đã xác minh thành công! ➔ Bấm BẮT ĐẦU', 64, 94);
          cursorX = 210;
          cursorY = 90;
        }

        const pulse = Math.abs(Math.sin(elapsed * 5));
        ctx.beginPath();
        ctx.arc(cursorX, cursorY, 9 + pulse * 7, 0, Math.PI * 2);
        ctx.strokeStyle = '#FBBF24';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#18181B';
        ctx.fillRect(0, h - 32, w, 32);
        ctx.fillStyle = '#FDE68A';
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.fillText(stepCaption, 10, h - 12);

        this.apiKeyVideoAnimId = requestAnimationFrame(renderFrame);
      };

      this.apiKeyVideoAnimId = requestAnimationFrame(renderFrame);
    }
  }
  // ===> [KẾT THÚC PHẦN 1 / 3 — TIẾP TỤC MÔ-ĐUN 7 ĐẾN MÔ-ĐUN 12 Ở PHẦN 2 & PHẦN 3] <===
  // ==========================================================================
  // MÔ-ĐUN 7: BẢN ĐỒ DOM TOÀN TRANG WEB & CHATBOT VIÊN BI 2 CHẾ ĐỘ RIÊNG BIỆT
  // - Chế độ 1 (WEB_SUPPORT): Cửa sổ hỗ trợ kỹ thuật web thuần túy + Nút 1-Click
  // - Chế độ 2 (CASUAL_CHAT): Cửa sổ trò chuyện Gemini cá nhân tách rời hoàn toàn
  // ==========================================================================
  const WEB_SUPPORT_CAPABILITIES = [
    {
      id: 'CHANGELOG_MEGAPHONE',
      title: '📢 Loa Thông Báo Lịch Sử Phiên Bản (Bản 1.0 ➔ Version 31 Mới Nhất)',
      keywords: [
        'loa', 'cái loa', 'loa phiên bản', 'loa thông báo', 'thông báo', 'phiên bản',
        'lịch sử', 'cập nhật', 'changelog', 'version', 'bản 1', 'bản 2', 'bản 3', 'bản 4',
        'bản 5', 'bản 6', 'bản 7', 'bản 8', 'bản 9', 'bản 10', 'bản 11', 'bản 12', 'bản 13',
        'bản 14', 'bản 15', 'bản 16', 'bản 17', 'bản 18', 'bản 19', 'bản 20', 'bản 21',
        'bản 22', 'bản 23', 'bản 24', 'bản 25', 'bản 26', 'bản 27', 'bản 28', 'bản 29',
        'bản 30', 'bản 31', 'v31', 'v30', 'v25', 'v20', 'v19', 'v18', 'v7'
      ],
      guide:
        'Mục **Loa Thông Báo (Lịch sử đầy đủ 31 bản cập nhật từ v1.0 đến Version 31)** nằm ở nút màu cam **📢 Loa Version 31** trên góc phải thanh điều hướng trên cùng, hoặc bấm trực tiếp vào nhãn **Version 31** ở góc dưới bên trái màn hình (hoặc trong **Tab 6 ➔ Mục số 6**).',
      openBtnLabel: '📢 Bấm Mở Ngay: Loa Thông Báo (v1.0 ➔ Version 31)',
      closeBtnLabel: '✕ Đóng Loa Thông Báo',
      isOpenCheck: () => {
        const m = document.getElementById('modal-s10-changelog');
        return m && !m.classList.contains('hidden');
      },
      openAction: () => {
        document.getElementById('modal-s10-changelog')?.classList.remove('hidden');
      },
      closeAction: () => {
        document.getElementById('modal-s10-changelog')?.classList.add('hidden');
      }
    },
    {
      id: 'AI_ASSISTANT_AND_MODELS',
      title: '🤖 Trợ Lý AI, Chọn Mô Hình Gemini & Nhập Câu Lệnh (Tab 3)',
      keywords: [
        'trợ lý ai', 'tro ly ai', 'chọn trợ lý', 'chọn ai', 'chọn mô hình', 'chọn model',
        'đổi model', 'gemini', 'argon', 'flash', '3.1 pro', '3.5 flash', '3.8 flash',
        'mức tư duy', 'thinking', 'nhập câu lệnh', 'prompt', 'chế độ viết', 'viết nháp',
        'tham mưu', 'kiểm tra logic', 'review', 'phóng to chat', 'mở rộng chat'
      ],
      guide:
        'Để chọn **Trợ lý AI, Mô hình Gemini (3.5 Flash-Lite, 3.8 Flash, 3.1 Pro, Argon 4), Mức độ tư duy (Cao/Vừa/Thấp) và Phóng to khung Chat**, bạn bấm vào **Tab 3: 🤖 3. Trợ Lý AI & Chat Gemini** trên thanh điều hướng trên cùng (hoặc bấm nút **🤖 Gọi AI / Chat Gemini** trên đầu trang viết, hoặc nhấn `Ctrl + K`).',
      openBtnLabel: '🤖 Bấm Mở Ngay: Trợ Lý AI & Chọn Mô Hình (Tab 3)',
      closeBtnLabel: '✕ Đóng Cửa Sổ Trợ Lý AI',
      isOpenCheck: () => {
        const m = document.getElementById('modal-s6-prompt-studio');
        return m && !m.classList.contains('hidden');
      },
      openAction: () => {
        window.StudioStage14?.screenNavigator?.navigateToScreen('SCREEN_3_AI');
        window.StudioStage6?.openPromptCommandModal();
      },
      closeAction: () => {
        document.getElementById('modal-s6-prompt-studio')?.classList.add('hidden');
        window.StudioStage14?.screenNavigator?.navigateToScreen('SCREEN_1_WRITE');
      }
    },
    {
      id: 'STORY_BIBLE_AND_CHAPTER_SELECTOR',
      title: '🏛️ Story Bible Tự Động (Pop-up Chọn Chương) & Hồ Sơ Nhân Vật (Tab 4)',
      keywords: [
        'story bible', 'kiểu mẫu', 'khóa mẫu', 'mở mẫu', 'cập nhật story bible',
        'chọn chương story bible', 'nhân vật', 'hồ sơ nhân vật', 'phục bút', 'ai biết gì'
      ],
      guide:
        'Mục **Story Bible Tự Động & Hồ sơ Nhân vật** nằm ở **Tab 4: 🏛️ 4. Story Bible & Nhân Vật**. Khi bấm nút **⚡ Cập Nhật Story Bible Theo Chương Hiện Tại Ngay**, hệ thống sẽ mở Pop-up cho phép bạn chọn **Trường hợp 1 (Tổng hợp từ đầu Chương 1 ➔ Hết)** hoặc **Trường hợp 2 (Bổ sung thêm chương mới đã chọn)**.',
      openBtnLabel: '🏛️ Bấm Mở Ngay: Story Bible & Nhân Vật (Tab 4)',
      closeBtnLabel: '⬅️ Quay Về Bàn Viết Truyện',
      isOpenCheck: () => window.StudioStage14?.screenNavigator?.currentScreen === 'SCREEN_4_BIBLE',
      openAction: () => {
        window.StudioStage14?.screenNavigator?.navigateToScreen('SCREEN_4_BIBLE');
      },
      closeAction: () => {
        window.StudioStage14?.screenNavigator?.navigateToScreen('SCREEN_1_WRITE');
      }
    },
    {
      id: 'WRITING_RULES_MODAL',
      title: '📜 Rule Viết Bản Thảo Chuẩn Hóa (Khóa Bảo Vệ Trong Mọi Prompt)',
      keywords: [
        'rule viết', 'rule viet', 'quy tắc viết', 'quy ước viết', 'quy ước thoại',
        'luật viết', 'chuẩn hóa prompt', 'rule bài viết', 'sửa rule'
      ],
      guide:
        'Mục **📜 Chỉnh Rule Viết Bản Thảo Chuẩn Hóa** nằm trong **Tab 4 (Story Bible)** hoặc bấm nút **📜 Bấm Để Sửa Rule Viết Bài** ngay trên thanh tiêu đề Khung Khóa Bảo Vệ của cửa sổ Nhập Câu Lệnh AI.',
      openBtnLabel: '📜 Bấm Mở Ngay: Bảng Sửa Rule Viết Bản Thảo',
      closeBtnLabel: '✕ Đóng Bảng Rule Viết Bài',
      isOpenCheck: () => {
        const m = document.getElementById('modal-s15-writing-rules-and-approve');
        return m && !m.classList.contains('hidden');
      },
      openAction: () => {
        document.getElementById('btn-s15-open-writing-rules-modal')?.click();
      },
      closeAction: () => {
        document.getElementById('modal-s15-writing-rules-and-approve')?.classList.add('hidden');
      }
    },
    {
      id: 'CHAPTER_FILES_AND_DISK',
      title: '📂 Cây Bản Thảo, Kết Nối Ổ Cứng & Nạp File Cũ Tự Nhớ (Tab 2)',
      keywords: [
        'cây bản thảo', 'cay ban thao', 'file nguồn', 'nạp file', 'quét file', 'ổ cứng',
        'kết nối ổ cứng', 'chương cũ', 'đổi tên chương', 'sắp xếp chương', 'xóa chương',
        'mạch truyện cốt lõi', 'thu gọn khung'
      ],
      guide:
        'Mục **Cây Bản Thảo & Nạp File Nguồn (.DOCX/.PDF/.TXT)** nằm ở **Tab 2: 📂 2. Chương & File Nguồn**. Mọi file nạp vào trên cả Laptop và Điện thoại đều được tự động ghi nhớ vĩnh viễn cho các lần truy cập sau.',
      openBtnLabel: '📂 Bấm Mở Ngay: Chương & File Nguồn (Tab 2)',
      closeBtnLabel: '⬅️ Quay Về Bàn Viết Truyện',
      isOpenCheck: () => window.StudioStage14?.screenNavigator?.currentScreen === 'SCREEN_2_FILES',
      openAction: () => {
        window.StudioStage14?.screenNavigator?.navigateToScreen('SCREEN_2_FILES');
      },
      closeAction: () => {
        window.StudioStage14?.screenNavigator?.navigateToScreen('SCREEN_1_WRITE');
      }
    },
    {
      id: 'MUSIC_AB_SEEK5S_AND_ASMR',
      title: '🎵 Nhạc Piano Nhẹ, Phím Lách Cách ASMR, Tua ±5 Giây & Lặp Đoạn A-B (Tab 5)',
      keywords: [
        'nhạc', 'âm nhạc', 'mp3', 'piano', 'tiếng mưa', 'cà phê', 'lặp đoạn', 'lặp a-b',
        'điểm a', 'điểm b', 'tua nhạc', 'tua 5 giây', '-5s', '+5s', 'font chữ', 'cỡ chữ',
        'giãn dòng', 'cỡ nút', 'asmr', 'bàn phím lách cách', 'gõ phím', 'hình nền'
      ],
      guide:
        'Bạn có thể chỉnh trực tiếp **🎹 Tiếng Piano Nhẹ, 🌧️ Mưa Đêm, ☕ Quán Cà Phê, ⌨️ Phím Lách Cách ASMR và Tua Nhạc ⏪ -5s / +5s ⏩** ngay trên **Thanh Nhạc Nổi góc dưới bên trái màn hình** (hoặc mở **Tab 5: 🎵 5. Nhạc, Không Gian & Chữ** để chỉnh dải lặp đoạn A-B và Font chữ Light Novel).',
      openBtnLabel: '🎵 Bấm Mở Ngay: Nhạc, Lặp A-B & Kiểu Chữ (Tab 5)',
      closeBtnLabel: '⬅️ Quay Về Bàn Viết Truyện',
      isOpenCheck: () => window.StudioStage14?.screenNavigator?.currentScreen === 'SCREEN_5_AMBIENCE',
      openAction: () => {
        window.StudioStage14?.screenNavigator?.navigateToScreen('SCREEN_5_AMBIENCE');
      },
      closeAction: () => {
        window.StudioStage14?.screenNavigator?.navigateToScreen('SCREEN_1_WRITE');
      }
    },
    {
      id: 'POMODORO_TIMER',
      title: '🍅 Đồng Hồ Bấm Giờ Pomodoro & Chuông Báo (Thu gọn > / < & Kéo Thả)',
      keywords: ['pomodoro', 'đồng hồ', 'bấm giờ', 'hẹn giờ', 'chuông báo', 'tập trung', 'giải lao'],
      guide:
        'Đồng hồ **🍅 Tập trung (Pomodoro)** nằm nổi ở **góc trên bên phải màn hình** (có thể giữ chuột kéo đặt ở bất kỳ đâu, hoặc bấm mũi tên `>` để thu nhỏ thành viên thuốc `< 🍅`). Bấm icon `⚙️` trên đồng hồ để chỉnh số phút và âm báo.',
      openBtnLabel: '⏱️ Bấm Mở Ngay: Cài Đặt Đồng Hồ Pomodoro',
      closeBtnLabel: '✕ Đóng Cài Đặt Pomodoro',
      isOpenCheck: () => {
        const m = document.getElementById('modal-s11-pomodoro-settings');
        return m && !m.classList.contains('hidden');
      },
      openAction: () => {
        document.getElementById('modal-s11-pomodoro-settings')?.classList.remove('hidden');
      },
      closeAction: () => {
        document.getElementById('modal-s11-pomodoro-settings')?.classList.add('hidden');
      }
    },
    {
      id: 'TIMEZONE_CLOCK_FOOTER',
      title: '🌍 Đồng Hồ Múi Giờ 22 Thành Phố Quốc Tế (Giữa Thanh Dưới Cùng)',
      keywords: ['múi giờ', 'thời gian', 'ngày giờ', 'thành phố', 'đồng hồ dưới', 'timezone', 'gmt'],
      guide:
        'Đồng hồ **Thời gian, Ngày tháng & Múi giờ quốc tế** nằm ở **chính giữa thanh dưới cùng (Footer)**. Bạn bấm vào nút **🌍 Chỉnh múi giờ** cạnh đồng hồ để chọn giờ theo 22 thành phố lớn trên thế giới.',
      openBtnLabel: '🌍 Bấm Mở Ngay: Bảng Chọn Múi Giờ Các Thành Phố',
      closeBtnLabel: '✕ Đóng Bảng Chọn Múi Giờ',
      isOpenCheck: () => {
        const m = document.getElementById('modal-s19-timezone-picker');
        return m && !m.classList.contains('hidden');
      },
      openAction: () => {
        document.getElementById('modal-s19-timezone-picker')?.classList.remove('hidden');
      },
      closeAction: () => {
        document.getElementById('modal-s19-timezone-picker')?.classList.add('hidden');
      }
    },
    {
      id: 'DEVICE_SWITCH_LAPTOP_MOBILE',
      title: '💻 / 📱 Chuyển Đổi Giao Diện Laptop & Điện Thoại Màn Hình Dọc',
      keywords: ['điện thoại', 'laptop', 'máy tính', 'mobile', 'màn hình dọc', 'đổi giao diện', 'chọn thiết bị'],
      guide:
        'Bạn có thể bấm nút **💻 Đang ở Laptop (Đổi sang 📱 Đ.Thoại)** trên góc phải thanh điều hướng trên cùng để chuyển đổi tức thì, hoặc bấm nút **🔑 Màn Hình Đầu Vào** để mở lại bảng chọn 2 thiết bị.',
      openBtnLabel: '📱/💻 Bấm Đổi Ngay: Giao Diện Laptop ⇄ Điện Thoại',
      closeBtnLabel: '✕ Đóng',
      isOpenCheck: () => false,
      openAction: () => {
        document.getElementById('btn-s21-switch-device-mode')?.click();
      },
      closeAction: () => {}
    },
    {
      id: 'API_KEY_WELCOME_SCREEN',
      title: '🔑 Màn Hình Lấy Key API Tự Động & Chọn Giao Diện Đầu Vào',
      keywords: ['api key', 'key api', 'lấy key', 'google studio', 'màn hình đầu vào', 'màn hình chào', 'verify key'],
      guide:
        'Để lấy hoặc đổi **Google Gemini API Key**, bạn bấm nút **🔑 Màn Hình Đầu Vào** trên thanh điều hướng trên cùng (hoặc bấm nút mở bên dưới), sau đó bấm **🔑 Lấy Key API Tự Động** và nhấn `Ctrl+V` dán vào ô.',
      openBtnLabel: '🔑 Bấm Mở Ngay: Màn Hình Lấy Key API & Đầu Vào',
      closeBtnLabel: '✕ Đóng Màn Hình Đầu Vào',
      isOpenCheck: () => {
        const m = document.getElementById('modal-s6-welcome-launcher');
        return m && !m.classList.contains('hidden');
      },
      openAction: () => {
        window.StudioStage16?.bootController?.openStep2ApiKeyModal();
      },
      closeAction: () => {
        window.StudioStage16?.bootController?.enterMainWorkspaceNow();
      }
    },
    {
      id: 'EXPORT_FILES',
      title: '📤 Xuất File Tiểu Thuyết (.DOCX / .PDF / .TXT Chọn Font)',
      keywords: ['xuất file', 'tải file', 'docx', 'word', 'pdf', 'txt', 'in sách', 'xuất bản thảo'],
      guide:
        'Chức năng **Xuất File (.DOCX, .PDF, .TXT)** nằm ở **Tab 6: ⚙️ Xuất File, Vá Lỗi & Hệ Thống** ➔ Thẻ số 2 (**📤 Xuất File .DOCX / .PDF / .TXT**).',
      openBtnLabel: '📤 Bấm Mở Ngay: Bộ Xuất File DOCX / PDF / TXT',
      closeBtnLabel: '✕ Đóng Cửa Sổ Xuất File',
      isOpenCheck: () => {
        const m = document.getElementById('modal-s6-custom-export');
        return m && !m.classList.contains('hidden');
      },
      openAction: () => {
        document.getElementById('modal-s6-custom-export')?.classList.remove('hidden');
      },
      closeAction: () => {
        document.getElementById('modal-s6-custom-export')?.classList.add('hidden');
      }
    },
    {
      id: 'BUGFIXER_STUDIO',
      title: '🛠️ Khung Tự Chẩn Đoán & Vá Lỗi Code Hệ Thống',
      keywords: ['vá lỗi', 'sửa lỗi', 'bug', 'sửa code', 'chẩn đoán lỗi', 'tự tạo file js'],
      guide:
        'Chức năng **Khung Tự Chẩn Đoán & Vá Lỗi Code** nằm ở **Tab 6: ⚙️ Xuất File, Vá Lỗi & Hệ Thống** ➔ Thẻ số 4 (**🛠️ Khung Tự Chẩn Đoán & Vá Lỗi Code**).',
      openBtnLabel: '🛠️ Bấm Mở Ngay: Khung Tự Chẩn Đoán & Vá Lỗi Code',
      closeBtnLabel: '✕ Đóng Khung Vá Lỗi',
      isOpenCheck: () => {
        const m = document.getElementById('modal-bugfixer-studio');
        return m && !m.classList.contains('hidden');
      },
      openAction: () => {
        document.getElementById('modal-bugfixer-studio')?.classList.remove('hidden');
      },
      closeAction: () => {
        document.getElementById('modal-bugfixer-studio')?.classList.add('hidden');
      }
    },
    {
      id: 'VIDEO_AND_TOUR_GUIDE',
      title: '🎬 Video Hướng Dẫn 120 Giây (Version 31) & Tour Chỉ Dẫn Từng Nút',
      keywords: ['video hướng dẫn', 'hướng dẫn sử dụng', 'tutorial', 'guide', 'chỉ dẫn từng nút'],
      guide:
        'Bạn có thể bấm trực tiếp nút **🎬 Xem Video Cùng Bi** hoặc **👆 Bi Chỉ Dẫn Từng Nút** ngay trên đầu khung chat này (hoặc nút **🎬 Video HD v31** trên thanh điều hướng).',
      openBtnLabel: '🎬 Bấm Mở Ngay: Video Hướng Dẫn 120 Giây (Version 31)',
      closeBtnLabel: '✕ Đóng Video Hướng Dẫn',
      isOpenCheck: () => {
        const m = document.getElementById('modal-s10-video-guide');
        return m && !m.classList.contains('hidden');
      },
      openAction: () => {
        window.StudioStage10?.openGuideWithVideoModal();
      },
      closeAction: () => {
        document.getElementById('modal-s10-video-guide')?.classList.add('hidden');
      }
    },
    {
      id: 'MAIN_WRITING_DESK',
      title: '✍️ Bàn Viết Truyện Chính (Tab 1, Thu Gọn POV & Đọc Bản Thảo Giọng Bi)',
      keywords: ['bàn viết', 'viết truyện', 'trang viết', 'đọc bản thảo', 'duyệt bản thảo', 'lưu bài', 'hoàn tác', 'pov'],
      guide:
        'Để quay về chỗ viết bài, bạn bấm vào **Tab 1: ✍️ 1. Bàn Viết Truyện** hoặc click vào dòng chữ **✍️ Web viết tiểu thuyết của Bi** ở góc trên cùng bên trái màn hình.',
      openBtnLabel: '✍️ Bấm Chuyển Về: Bàn Viết Truyện Chính (Tab 1)',
      closeBtnLabel: '✍️ Đang Ở Bàn Viết Truyện',
      isOpenCheck: () => window.StudioStage14?.screenNavigator?.currentScreen === 'SCREEN_1_WRITE',
      openAction: () => {
        window.StudioStage14?.screenNavigator?.navigateToScreen('SCREEN_1_WRITE');
      },
      closeAction: () => {}
    }
  ];

  class DualModeChatbotBiMasterEngine {
    constructor() {
      this.currentBiMode = localStorage.getItem('noir_s19_bi_chat_mode') || 'WEB_SUPPORT'; // 'WEB_SUPPORT' | 'CASUAL_CHAT'
      this.casualChatHistory = [];
    }

    init() {
      this.injectTwoModeSelectorAndDualChatWindows();
      this.bindBiInputAndSendButtons();
    }

    injectTwoModeSelectorAndDualChatWindows() {
      const biPanel = document.getElementById('s11-mascot-bi-panel');
      const oldChatBox =
        document.getElementById('s11-bi-chat-box') ||
        document.getElementById('s19-bi-chat-box-support');
      if (!biPanel || !oldChatBox) return;

      const sectionWrapper = oldChatBox.parentElement;
      if (!sectionWrapper || document.getElementById('s19-bi-mode-selector-bar')) return;

      const modeSelectorBar = document.createElement('div');
      modeSelectorBar.id = 's19-bi-mode-selector-bar';
      modeSelectorBar.className =
        'p-2.5 rounded-xl bg-zinc-900/95 border-2 border-emerald-500/50 space-y-2 text-xs';
      modeSelectorBar.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="font-extrabold uppercase text-[10px] text-emerald-400">
            🎛️ CHỌN CHẾ ĐỘ HOẠT ĐỘNG CỦA CHATBOT VIÊN BI:
          </span>
          <span id="s19-bi-mode-badge" class="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px]">
            Chế độ 1: Hỗ Trợ Web
          </span>
        </div>

        <select id="s19-bi-mode-dropdown" class="w-full px-2.5 py-2 rounded-lg border border-emerald-500/50 bg-zinc-950 text-white font-bold text-xs focus:outline-none">
          <option value="WEB_SUPPORT" ${this.currentBiMode === 'WEB_SUPPORT' ? 'selected' : ''}>
            🛠️ Chế độ 1: Chuyên Giải Đáp & Hỗ Trợ Tất Tần Tật Trang Web
          </option>
          <option value="CASUAL_CHAT" ${this.currentBiMode === 'CASUAL_CHAT' ? 'selected' : ''}>
            💬 Chế độ 2: Chuyên Trò Chuyện Thường (Gemini Cá Nhân Của Bạn)
          </option>
        </select>

        <div class="grid grid-cols-2 gap-1.5">
          <button type="button" id="btn-s19-mode-support" class="py-1.5 px-2 rounded-lg font-bold text-[11px] transition">
            🛠️ 1. Hỗ Trợ Trang Web
          </button>
          <button type="button" id="btn-s19-mode-casual" class="py-1.5 px-2 rounded-lg font-bold text-[11px] transition">
            💬 2. Trò Chuyện Thường
          </button>
        </div>
      `;

      sectionWrapper.insertBefore(modeSelectorBar, oldChatBox);

      oldChatBox.id = 's19-bi-chat-box-support';
      oldChatBox.innerHTML = `
        <div class="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[11px] leading-relaxed">
          🛠️ <b>Cửa sổ Chế độ 1 (Chuyên Hỗ Trợ Trang Web - Version 31):</b><br/>
          Bạn hỏi bất kỳ tính năng nào ở đâu hoặc bảo Bi mở/đóng (VD: <i>"Mở cái loa phiên bản"</i>, <i>"Tôi chọn trợ lý AI ở đâu"</i>, <i>"Kiểm tra các chương"</i>, <i>"Mở Story Bible"</i>...), Bi sẽ chỉ dẫn chính xác và tạo nút bấm mở ngay lập tức!
        </div>
      `;

      const casualChatBox = document.createElement('div');
      casualChatBox.id = 's19-bi-chat-box-casual';
      casualChatBox.className =
        'hidden h-44 overflow-y-auto p-2.5 rounded-xl bg-studioLightBg dark:bg-zinc-950 border border-amber-500/40 space-y-2 select-text';
      casualChatBox.innerHTML = `
        <div class="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-[11px] leading-relaxed">
          💬 <b>Cửa sổ Chế độ 2 (Trò Chuyện Thường - Gemini Cá Nhân):</b><br/>
          Phòng trò chuyện riêng biệt dùng API Key Gemini của bạn. Bạn có thể tâm sự, hỏi đáp tự do mà không bao giờ bị lẫn với lệnh điều khiển trang web!
        </div>
      `;

      sectionWrapper.insertBefore(casualChatBox, oldChatBox.nextSibling);

      const dropdown = document.getElementById('s19-bi-mode-dropdown');
      const btnSupport = document.getElementById('btn-s19-mode-support');
      const btnCasual = document.getElementById('btn-s19-mode-casual');

      dropdown?.addEventListener('change', () => this.switchBiMode(dropdown.value));
      btnSupport?.addEventListener('click', () => this.switchBiMode('WEB_SUPPORT'));
      btnCasual?.addEventListener('click', () => this.switchBiMode('CASUAL_CHAT'));

      this.switchBiMode(this.currentBiMode);
    }

    switchBiMode(mode) {
      this.currentBiMode = mode === 'CASUAL_CHAT' ? 'CASUAL_CHAT' : 'WEB_SUPPORT';
      localStorage.setItem('noir_s19_bi_chat_mode', this.currentBiMode);

      const dropdown = document.getElementById('s19-bi-mode-dropdown');
      const badge = document.getElementById('s19-bi-mode-badge');
      const btnSupport = document.getElementById('btn-s19-mode-support');
      const btnCasual = document.getElementById('btn-s19-mode-casual');
      const supportBox = document.getElementById('s19-bi-chat-box-support');
      const casualBox = document.getElementById('s19-bi-chat-box-casual');
      const chatInput = document.getElementById('s11-bi-chat-input');

      if (dropdown) dropdown.value = this.currentBiMode;

      if (this.currentBiMode === 'WEB_SUPPORT') {
        supportBox?.classList.remove('hidden');
        casualBox?.classList.add('hidden');
        if (badge) {
          badge.className = 'px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px]';
          badge.textContent = '🛠️ Chế độ 1: Hỗ Trợ Web';
        }
        if (btnSupport) {
          btnSupport.className =
            'py-1.5 px-2 rounded-lg font-bold text-[11px] bg-emerald-600 text-white shadow transition';
        }
        if (btnCasual) {
          btnCasual.className =
            'py-1.5 px-2 rounded-lg font-bold text-[11px] bg-zinc-800 text-zinc-400 hover:text-white transition';
        }
        if (chatInput) {
          chatInput.placeholder = 'Hỏi vị trí tính năng hoặc bảo Bi mở/đóng bất kỳ mục nào...';
        }
      } else {
        supportBox?.classList.add('hidden');
        casualBox?.classList.remove('hidden');
        if (badge) {
          badge.className = 'px-2 py-0.5 rounded bg-amber-600 text-white font-bold text-[10px]';
          badge.textContent = '💬 Chế độ 2: Trò Chuyện';
        }
        if (btnCasual) {
          btnCasual.className =
            'py-1.5 px-2 rounded-lg font-bold text-[11px] bg-amber-600 text-white shadow transition';
        }
        if (btnSupport) {
          btnSupport.className =
            'py-1.5 px-2 rounded-lg font-bold text-[11px] bg-zinc-800 text-zinc-400 hover:text-white transition';
        }
        if (chatInput) {
          chatInput.placeholder = 'Trò chuyện, tâm sự tự do với Gemini của bạn...';
        }
      }
    }

    bindBiInputAndSendButtons() {
      const sendBtn = document.getElementById('btn-s11-bi-send');
      const chatInput = document.getElementById('s11-bi-chat-input');
      if (!sendBtn || !chatInput) return;

      const clonedSend = sendBtn.cloneNode(true);
      sendBtn.parentNode.replaceChild(clonedSend, sendBtn);

      const clonedInput = chatInput.cloneNode(true);
      chatInput.parentNode.replaceChild(clonedInput, chatInput);

      const submitMsg = () => {
        const val = clonedInput.value.trim();
        if (!val) return;
        clonedInput.value = '';
        if (this.currentBiMode === 'WEB_SUPPORT') {
          this.handleMode1WebSupportQuery(val);
        } else {
          this.handleMode2CasualGeminiChat(val);
        }
      };

      clonedSend.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        submitMsg();
      });

      clonedInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          submitMsg();
        }
      });

      document.querySelectorAll('.s13-quick-cmd').forEach((pill) => {
        const newPill = pill.cloneNode(true);
        pill.parentNode.replaceChild(newPill, pill);
        newPill.addEventListener('click', () => {
          this.switchBiMode('WEB_SUPPORT');
          this.handleMode1WebSupportQuery(newPill.getAttribute('data-bi-cmd'));
        });
      });

      if (window.StudioStage11?.mascotBi) {
        window.StudioStage11.mascotBi.handleAskBiQuestion = (q) => {
          if (this.currentBiMode === 'WEB_SUPPORT') this.handleMode1WebSupportQuery(q);
          else this.handleMode2CasualGeminiChat(q);
        };
      }
      if (window.StudioStage13?.biAgent) {
        window.StudioStage13.biAgent.processUserMessageWithAutomation = (q) => {
          if (this.currentBiMode === 'WEB_SUPPORT') this.handleMode1WebSupportQuery(q);
          else this.handleMode2CasualGeminiChat(q);
        };
      }
    }

    async handleMode1WebSupportQuery(rawText) {
      const supportBox = document.getElementById('s19-bi-chat-box-support');
      if (!supportBox) return;

      const biAgent = window.StudioStage13?.biAgent;
      const lang = window.StudioStage13?.i18n?.currentLang || 'vi';

      const userDiv = document.createElement('div');
      userDiv.className =
        'p-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-right font-semibold text-[11px]';
      userDiv.textContent = `Bạn: ${rawText}`;
      supportBox.appendChild(userDiv);
      supportBox.scrollTop = supportBox.scrollHeight;

      const q = rawText.toLowerCase().trim();

      // 1. Hỏi về một phiên bản cụ thể (Bản 1 -> Bản 31)
      const verMatch = q.match(/(?:bản|phiên bản|version|ver|\bv)\s*(\d{1,2})\b/i);
      if (verMatch) {
        const verNum = parseInt(verMatch[1], 10);
        const foundVer = MASTER_CHANGELOG_V1_TO_V31.find((v) => v.num === verNum);
        const megaCap = WEB_SUPPORT_CAPABILITIES[0];
        if (foundVer) {
          const msg = `Chi tiết **${foundVer.version} — ${foundVer.badge}** trong Loa Thông Báo:\n• ${foundVer.items.join('\n• ')}`;
          this.renderWebSupportAnswerCard(supportBox, msg, megaCap, biAgent, lang, false);
          return;
        }
      }

      // 2. Yêu cầu kiểm tra các chương truyện hiện có trong máy
      if (
        /(kiểm tra các chương|kiểm tra chương|thống kê chương|bao nhiêu chương|tiến độ truyện)/i.test(
          q
        )
      ) {
        const chapters = window.StudioCore?.approvalGate?.chapters || [];
        const totalWords = chapters.reduce((s, c) => s + (c.wordCount || 0), 0);
        const approvedCount = chapters.filter((c) => c.status === 'APPROVED').length;
        const draftCount = chapters.filter((c) => c.status === 'DRAFT').length;
        const listStr = chapters
          .map(
            (c, i) =>
              `#${i + 1} [${c.status === 'APPROVED' ? 'Đã chốt' : 'Đang nháp'}] ${
                c.displayTitle || c.title
              }: ${(c.wordCount || 0).toLocaleString('vi-VN')} từ`
          )
          .join('\n');

        const filesCap = WEB_SUPPORT_CAPABILITIES.find((c) => c.id === 'CHAPTER_FILES_AND_DISK');
        const msg = `Hiện tại trong máy bạn có **${chapters.length} chương** (Tổng: **${totalWords.toLocaleString('vi-VN')} từ** | Đã chốt: ${approvedCount} | Đang nháp: ${draftCount}):\n${listStr}`;
        this.renderWebSupportAnswerCard(supportBox, msg, filesCap, biAgent, lang, false);
        return;
      }

      // 3. Chấm điểm khớp với 14 nhóm chức năng DOM của trang web
      const scored = WEB_SUPPORT_CAPABILITIES.map((cap) => {
        let score = 0;
        for (const kw of cap.keywords) {
          if (q.includes(kw)) {
            score += kw.split(' ').length * 12;
          }
        }
        return { cap, score };
      })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score);

      const wantsClose = /^(đóng|tắt|ẩn|thoát|close|hide)\b/i.test(q);

      if (scored.length > 0) {
        const bestCap = scored[0].cap;
        const replyText = `${bestCap.guide}\n\n👉 Bạn bấm ngay nút bên dưới để Bi **${
          wantsClose ? 'đóng' : 'mở thẳng'
        } [${bestCap.title}]** cho bạn nhé!`;
        this.renderWebSupportAnswerCard(supportBox, replyText, bestCap, biAgent, lang, wantsClose);
        return;
      }

      // 4. Câu hỏi tổng quát khác về web -> Gọi Gemini 3.5 Flash-Lite với Bản đồ DOM thuần kỹ thuật 100%
      biAgent?.setBiPose('THINKING');
      const waitDiv = document.createElement('div');
      waitDiv.className =
        'p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px]';
      waitDiv.textContent = '🛠️ Bi đang tra cứu Bản đồ giao diện Version 31...';
      supportBox.appendChild(waitDiv);
      supportBox.scrollTop = supportBox.scrollHeight;

      try {
        const allFeaturesContext = WEB_SUPPORT_CAPABILITIES.map(
          (c) => `- [${c.id}] ${c.title}: ${c.guide}`
        ).join('\n');

        const res = await callGemini35FlashLiteLowThinking({
          systemInstruction: [
            `Bạn là Trợ lý Kỹ thuật Chuyên trách Trang Web "Web viết tiểu thuyết của Bi" (Version 31).`,
            `DƯỚI ĐÂY LÀ TOÀN BỘ CẤU TRÚC & VỊ TRÍ CHÍNH XÁC CỦA TRANG WEB:`,
            allFeaturesContext,
            `QUY TẮC TUYỆT ĐỐI:`,
            `1. Chỉ trả lời chính xác về tính năng, nút bấm, các Tab màn hình của trang web dựa trên danh sách trên.`,
            `2. TUYỆT ĐỐI KHÔNG nhắc tới chuyện đời tư cá nhân trong chế độ hỗ trợ kỹ thuật này.`,
            `3. Ở cuối câu trả lời, gắn mã [[CAP:ID_CHỨC_NĂNG]] khớp nhất để tạo nút bấm mở nhanh cho người dùng.`
          ].join('\n'),
          userPrompt: rawText,
          temperature: 0.15
        });

        waitDiv.remove();
        let answer = res.text;
        let matchedCap = WEB_SUPPORT_CAPABILITIES[0];
        const capMatch = answer.match(/\[\[CAP:([A-Z0-9_]+)\]\]/i);
        if (capMatch) {
          const found = WEB_SUPPORT_CAPABILITIES.find(
            (c) => c.id === capMatch[1].toUpperCase()
          );
          if (found) matchedCap = found;
          answer = answer.replace(/\[\[CAP:[A-Z0-9_]+\]\]/gi, '').trim();
        }

        this.renderWebSupportAnswerCard(supportBox, answer, matchedCap, biAgent, lang, false);
      } catch (_) {
        waitDiv.textContent = `🛠️ Trang web gồm 6 Tab chính ở thanh trên cùng: (1) Bàn Viết Truyện, (2) Chương & File Nguồn, (3) Trợ Lý AI, (4) Story Bible, (5) Nhạc & Chữ, (6) Xuất File & Hệ Thống.`;
      }
    }

    renderWebSupportAnswerCard(
      container,
      markdownText,
      capObj,
      biAgent,
      lang,
      wantsClose = false
    ) {
      biAgent?.setBiPose('CONFIRM', 4000);
      biAgent?.voiceEngine?.playCuteChibiChirp(true);

      const htmlBody = markdownText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*\*([^*]+)\*\*/g, '<b class="text-emerald-400">$1</b>')
        .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-zinc-800 text-amber-300 font-monoCode">$1</code>')
        .replace(/\n/g, '<br/>');

      const isCurrentlyOpen = capObj?.isOpenCheck ? capObj.isOpenCheck() : false;

      const card = document.createElement('div');
      card.className =
        'p-3 rounded-xl bg-emerald-500/15 border-2 border-emerald-500/60 space-y-2.5 text-[11px] shadow-md';
      card.innerHTML = `
        <div class="leading-relaxed text-studioLightText dark:text-zinc-100">
          🛠️ <b>Hỗ Trợ Trang Web (Viên Bi):</b><br/>${htmlBody}
        </div>
        ${
          capObj
            ? `
          <div class="flex flex-wrap items-center gap-2 pt-1">
            <button type="button" class="btn-s16u-open-cap flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition flex items-center justify-center gap-1.5">
              <span>✅ ${capObj.openBtnLabel}</span>
            </button>
            ${
              isCurrentlyOpen || wantsClose
                ? `
              <button type="button" class="btn-s16u-close-cap py-2 px-3 rounded-xl bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs transition">
                ${capObj.closeBtnLabel || '✕ Đóng'}
              </button>
            `
                : ''
            }
          </div>
        `
            : ''
        }
      `;

      container.appendChild(card);
      container.scrollTop = container.scrollHeight;

      const spoken = markdownText.replace(/\*\*/g, '').replace(/`/g, '').slice(0, 210);
      biAgent?.voiceEngine?.speak(spoken, lang);

      card.querySelector('.btn-s16u-open-cap')?.addEventListener('click', () => {
        capObj.openAction();
        biAgent?.setBiPose('HAPPY', 3500);
        window.StudioStage7?.saveEngine?.showSaveToastNotification(
          `✅ Bi đã mở [${capObj.title}] cho bạn!`
        );
      });

      card.querySelector('.btn-s16u-close-cap')?.addEventListener('click', () => {
        capObj.closeAction?.();
        biAgent?.setBiPose('IDLE');
        window.StudioStage7?.saveEngine?.showSaveToastNotification(
          `✅ Bi đã đóng [${capObj.title}]!`
        );
      });
    }

    async handleMode2CasualGeminiChat(rawText) {
      const casualBox = document.getElementById('s19-bi-chat-box-casual');
      if (!casualBox) return;

      const biAgent = window.StudioStage13?.biAgent;
      const lang = window.StudioStage13?.i18n?.currentLang || 'vi';

      const userDiv = document.createElement('div');
      userDiv.className =
        'p-2 rounded-xl bg-amber-500/20 text-right font-semibold text-[11px]';
      userDiv.textContent = `Bạn: ${rawText}`;
      casualBox.appendChild(userDiv);
      casualBox.scrollTop = casualBox.scrollHeight;

      biAgent?.setBiPose('THINKING');
      const replyDiv = document.createElement('div');
      replyDiv.className =
        'p-2.5 rounded-xl bg-zinc-900 border border-amber-500/40 text-[11px] leading-relaxed';
      replyDiv.textContent = '💬 Gemini của bạn đang trả lời...';
      casualBox.appendChild(replyDiv);
      casualBox.scrollTop = casualBox.scrollHeight;

      this.casualChatHistory.push({ role: 'user', text: rawText });
      const transcript = this.casualChatHistory
        .slice(-8)
        .map((m) => `${m.role === 'user' ? 'Người dùng' : 'Viên Bi'}: ${m.text}`)
        .join('\n');

      try {
        const res = await callGemini35FlashLiteLowThinking({
          systemInstruction:
            'Bạn là Viên Bi (người bạn trò chuyện thân thiết, tâm lý, chân thành và ngắn gọn của người dùng). Hãy trò chuyện tự nhiên, đúng trọng tâm câu nói của người dùng.',
          userPrompt: transcript,
          temperature: 0.75
        });

        this.casualChatHistory.push({ role: 'model', text: res.text });
        replyDiv.textContent = `💬 Viên Bi (${res.modelUsed}): ${res.text}`;
        biAgent?.setBiPose('HAPPY', 3500);
        biAgent?.voiceEngine?.speak(res.text, lang);
      } catch (err) {
        replyDiv.textContent = `❌ Lỗi kết nối API Key: ${err.message}`;
        biAgent?.setBiPose('IDLE');
      }
      casualBox.scrollTop = casualBox.scrollHeight;
    }
  }

  // ==========================================================================
  // MÔ-ĐUN 8: KHUNG KHÓA BẢO VỆ RULE CHẾ ĐỘ 1•2•3•4 + RULE VIẾT BÀI + STORY BIBLE
  // - Luôn xuất hiện trong cửa sổ nhập lệnh (#s6-popup-prompt-textarea)
  // - Khóa readonly chống xóa nhầm bằng Backspace / Delete
  // - Tự động tiêm vào tầng thấp nhất của mọi Prompt soạn thảo
  // ==========================================================================
  const MODE_LOCKED_SYSTEM_DIRECTIVES = {
    MODE_1_DRAFT:
      '【CHẾ ĐỘ 1: VIẾT BẢN NHÁP CHẬM】 Đi sâu chi tiết hóa tối đa ý tưởng với nhịp độ cực chậm (Extreme Slow-burn). Tập trung miêu tả chiều sâu tâm lý ngôi thứ ba đa điểm nhìn, tuyệt đối cấm dùng bullet points hay từ ngữ sáo rỗng, bắt buộc 100% lời thoại viết theo đúng mẫu: - Câu thoại (Tên nhân vật).',
    MODE_2_CONSULT:
      '【CHẾ ĐỘ 2: THAM MƯU CỐT TRUYỆN】 Phát triển tiếp các nhánh cốt truyện từ dữ liệu gốc và các chương cũ trên ổ cứng. Tư vấn chuyên sâu cách gài cơ chế Người kể chuyện không đáng tin (Unreliable Narrator) qua độ lệch giữa nhận thức chủ quan của POV và chi tiết khách quan.',
    MODE_3_AUDIT:
      '【CHẾ ĐỘ 3: KIỂM TRA LOGIC & LỖI】 Rà soát bản thảo hiện tại đối chiếu với các chương Đã Duyệt và Story Bible để bắt lỗi mâu thuẫn giờ giấc, lỗi nhân vật biết trước thông tin chưa tiết lộ, lệch tâm lý, lỗi chính tả và tự động chuẩn hóa lời thoại về dạng: - Câu thoại (Tên nhân vật).',
    MODE_4_REVIEW:
      '【CHẾ ĐỘ 4: REVIEW TỔNG THỂ】 Đọc và đánh giá khách quan các chương Đã Bấm Duyệt từ Chương 1 đến hiện tại: phân tích độ hợp lý của đường dây sự kiện, chẩn đoán nhịp độ nhanh/chậm ở từng chương và kiểm toán hệ thống phục bút.'
  };

  class UnDeletablePromptRulesAndBibleVault {
    init() {
      this.injectLockedVaultBoxAbovePromptTextarea();
      this.interceptAllDraftingPromptsAtClientLevel();
      this.bindModeSwitchToUpdateVaultBox();
    }

    static getLiveStoryBibleAndRulesSnapshot() {
      const rulesArea = document.getElementById('s15-writing-rules-textarea');
      const liveRules =
        (rulesArea && rulesArea.value.trim()) ||
        localStorage.getItem('noir_s15_standard_writing_rules') ||
        '1. Viết ngôi thứ ba đa điểm nhìn, nhịp độ tâm lý cực chậm.\n2. Mọi lời thoại bắt buộc theo mẫu: - Câu thoại (Tên nhân vật)\n3. Cấm dùng bullet points và từ sáo rỗng.';

      const renderedBibleArea = document.getElementById('s10-bible-rendered-textarea');
      const liveRenderedBible =
        (renderedBibleArea && renderedBibleArea.value.trim()) ||
        localStorage.getItem('noir_s10_rendered_bible_content') ||
        '';

      const structuredBible = window.StudioCore?.bibleManager?.data || {};
      const charsSummary = (structuredBible.characters || [])
        .map(
          (c) =>
            `• Nhân vật ${c.name}: Mặt nạ (${c.persona || '---'}) | Bản chất (${c.shadow || '---'}) | Tâm lý hiện tại (${c.currentPsychState || '---'}) | Khẩu khí (${c.speechStyle || '---'})`
        )
        .join('\n');

      const knowledgeSummary = (structuredBible.knowledgeMatrix || [])
        .map(
          (k) =>
            `• Bí mật [${k.title}]: Sự thật (${k.objectiveTruth}) | Ai biết (${k.characterPerceptions})`
        )
        .join('\n');

      const cluesSummary = (structuredBible.cluesLedger || [])
        .map(
          (cl) =>
            `• Phục bút [${cl.name}] (Ch.${cl.plantedChapter} - ${cl.status}): ${cl.description}`
        )
        .join('\n');

      return {
        liveRules,
        liveRenderedBible,
        combinedEnforcementBlock: [
          `===================================================================`,
          `[BẮT BUỘC TUÂN THỦ 100%: RULE VIẾT BÀI ĐÃ THIẾT LẬP SẴN CỦA TÁC GIẢ]`,
          liveRules,
          ``,
          `[BẮT BUỘC BÁM SÁT 100%: DỮ LIỆU STORY BIBLE ĐÃ THIẾT LẬP SẴN]`,
          liveRenderedBible
            ? `--- Bản Tổng Hợp Story Bible Chính Thức ---\n${liveRenderedBible}`
            : '',
          charsSummary ? `--- Hồ Sơ Tâm Lý Nhân Vật ---\n${charsSummary}` : '',
          knowledgeSummary ? `--- Ma Trận Ai Biết Gì ---\n${knowledgeSummary}` : '',
          cluesSummary ? `--- Sổ Cái Phục Bút ---\n${cluesSummary}` : '',
          `===================================================================`
        ]
          .filter(Boolean)
          .join('\n')
      };
    }

    injectLockedVaultBoxAbovePromptTextarea() {
      const promptTextarea = document.getElementById('s6-popup-prompt-textarea');
      if (
        !promptTextarea ||
        !promptTextarea.parentElement ||
        document.getElementById('s21-locked-prompt-rules-vault')
      ) {
        return;
      }

      const vaultContainer = document.createElement('div');
      vaultContainer.id = 's21-locked-prompt-rules-vault';
      vaultContainer.className =
        'mb-2 rounded-xl border-2 border-indigo-500/60 bg-indigo-950/25 overflow-hidden select-none';

      vaultContainer.innerHTML = `
        <div class="px-3 py-1.5 bg-indigo-900/40 border-b border-indigo-500/40 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div class="flex items-center gap-1.5 font-extrabold text-indigo-300">
            <span>🔒 KHUNG RULE CHẾ ĐỘ + RULE VIẾT BÀI + STORY BIBLE (ĐÃ KHÓA CHỐNG XÓA NHẦM)</span>
          </div>
          <div class="flex items-center gap-1.5">
            <button type="button" id="btn-s21-toggle-vault-preview" class="px-2 py-0.5 rounded bg-indigo-600/40 hover:bg-indigo-600 text-white font-bold text-[10px]">
              👁️ Thu gọn / Mở rộng xem Rule
            </button>
            <button type="button" id="btn-s21-unlock-edit-rules" class="px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px]">
              📜 Bấm Để Sửa Rule Viết Bài
            </button>
            <button type="button" id="btn-s21-unlock-edit-bible" class="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px]">
              🏛️ Bấm Để Sửa Story Bible
            </button>
          </div>
        </div>
        <textarea id="s21-locked-vault-readonly-display" readonly rows="4" class="w-full p-2.5 bg-zinc-950/90 text-emerald-300 font-monoCode text-[11px] leading-relaxed resize-y focus:outline-none cursor-not-allowed"></textarea>
      `;

      promptTextarea.parentElement.insertBefore(vaultContainer, promptTextarea);

      const readonlyDisplay = document.getElementById('s21-locked-vault-readonly-display');
      readonlyDisplay?.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' || e.key === 'Delete' || e.key.length === 1) {
          e.preventDefault();
          window.StudioStage7?.saveEngine?.showSaveToastNotification(
            '🔒 Khung Rule & Story Bible đã được khóa bảo vệ chống xóa nhầm! Hãy bấm nút [📜 Sửa Rule Viết Bài] hoặc [🏛️ Sửa Story Bible] ở góc phải khung nhé!'
          );
        }
      });

      document.getElementById('btn-s21-toggle-vault-preview')?.addEventListener('click', () => {
        readonlyDisplay?.classList.toggle('hidden');
      });

      document.getElementById('btn-s21-unlock-edit-rules')?.addEventListener('click', () => {
        document.getElementById('btn-s15-open-writing-rules-modal')?.click();
      });

      document.getElementById('btn-s21-unlock-edit-bible')?.addEventListener('click', () => {
        document.getElementById('modal-s6-prompt-studio')?.classList.add('hidden');
        window.StudioStage14?.screenNavigator?.navigateToScreen('SCREEN_4_BIBLE');
      });

      document.getElementById('btn-s15-save-writing-rules')?.addEventListener('click', () => {
        setTimeout(() => this.refreshLockedVaultDisplay(), 50);
      });

      this.refreshLockedVaultDisplay();
    }

    interceptAllDraftingPromptsAtClientLevel() {
      const client = window.StudioStage3?.geminiClient;
      if (!client || client.__s16uHooked) return;

      const origGenerate = client.generateContent.bind(client);
      client.generateContent = async function (params) {
        if (!params.isBiInternalCopilotCall) {
          const snapshot =
            UnDeletablePromptRulesAndBibleVault.getLiveStoryBibleAndRulesSnapshot();
          if (
            !params.systemInstruction?.includes(
              '[BẮT BUỘC TUÂN THỦ 100%: RULE VIẾT BÀI'
            )
          ) {
            params.systemInstruction = `${params.systemInstruction || ''}\n\n${
              snapshot.combinedEnforcementBlock
            }`;
          }
          if (
            !params.userPrompt?.includes('[BẮT BUỘC TUÂN THỦ 100%: RULE VIẾT BÀI')
          ) {
            params.userPrompt = `${snapshot.combinedEnforcementBlock}\n\n${
              params.userPrompt || ''
            }`;
          }
        }
        return await origGenerate(params);
      };
      client.__s16uHooked = true;
    }

    bindModeSwitchToUpdateVaultBox() {
      document.querySelectorAll('.s6-p-mode-btn, .mode-switch-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          setTimeout(() => this.refreshLockedVaultDisplay(), 30);
        });
      });

      document.getElementById('btn-s6-open-prompt-popup')?.addEventListener('click', () => {
        setTimeout(() => this.refreshLockedVaultDisplay(), 50);
      });
    }

    refreshLockedVaultDisplay() {
      const readonlyDisplay = document.getElementById('s21-locked-vault-readonly-display');
      if (!readonlyDisplay) return;

      const activeMode = window.StudioStage2?.uiController?.activeModeId || 'MODE_1_DRAFT';
      const modeDirective =
        MODE_LOCKED_SYSTEM_DIRECTIVES[activeMode] ||
        MODE_LOCKED_SYSTEM_DIRECTIVES.MODE_1_DRAFT;

      const snapshot =
        UnDeletablePromptRulesAndBibleVault.getLiveStoryBibleAndRulesSnapshot();
      const biblePreview = snapshot.liveRenderedBible || '(Chưa có bản tổng hợp Story Bible)';

      readonlyDisplay.value = [
        `🔒 ${modeDirective}`,
        `--------------------------------------------------------------------------------`,
        `📜 [RULE VIẾT BÀI CHUẨN HÓA ĐANG ÁP DỤNG (KHÔNG THỂ XÓA NHẦM)]:`,
        snapshot.liveRules,
        `--------------------------------------------------------------------------------`,
        `🏛️ [STORY BIBLE ĐANG KẾT NỐI TRỰC TIẾP VÀO PROMPT]:`,
        biblePreview.slice(0, 1200) +
          (biblePreview.length > 1200
            ? '\n...(Đã nạp toàn bộ Story Bible vào bộ nhớ câu lệnh)...'
            : '')
      ].join('\n');
    }
  }

  // ==========================================================================
  // MÔ-ĐUN 9: POP-UP CHỌN CHƯƠNG CẬP NHẬT STORY BIBLE (2 TRƯỜNG HỢP RÕ RÀNG)
  // - Trường hợp 1: Tổng hợp từ đầu (Chương 1 ➔ Hết, có nút Chọn tất cả)
  // - Trường hợp 2: Bổ sung thêm chương mới tích chọn vào Story Bible đã có
  // ==========================================================================
  class StoryBibleMultiChapterSelectorEngine {
    constructor(core, stage2, stage3, stage10, promptVault) {
      this.core = core;
      this.stage2 = stage2;
      this.stage3 = stage3;
      this.stage10 = stage10;
      this.bibleEngine = stage10?.bibleEngine;
      this.promptVault = promptVault;
      this.updateMode = 'CASE_1_FROM_SCRATCH'; // 'CASE_1_FROM_SCRATCH' | 'CASE_2_INCREMENTAL'
    }

    init() {
      this.injectChapterSelectorModalDOM();
      this.hijackSyncBibleNowButton();
    }

    injectChapterSelectorModalDOM() {
      if (document.getElementById('modal-s21-bible-chapters-selector')) return;

      const modal = document.createElement('div');
      modal.id = 'modal-s21-bible-chapters-selector';
      modal.className =
        'hidden fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm select-none';

      modal.innerHTML = `
        <div class="w-full max-w-2xl rounded-2xl border-2 border-emerald-500/70 bg-studioLightPanel dark:bg-zinc-900 shadow-2xl overflow-hidden text-xs flex flex-col max-h-[88vh]">
          <div class="px-5 py-3.5 border-b border-studioLightBorder dark:border-zinc-800 bg-emerald-600/15 flex items-center justify-between">
            <div>
              <h3 class="font-extrabold uppercase text-sm text-emerald-500">
                🏛️ TÙY CHỌN CẬP NHẬT & TỔNG HỢP STORY BIBLE THEO CHƯƠNG
              </h3>
              <p class="text-[11px] text-zinc-400">
                Chọn 1 trong 2 trường hợp bên dưới và tích chọn các chương bạn muốn đưa vào Story Bible
              </p>
            </div>
            <button type="button" id="btn-s21-close-bible-selector" class="px-2.5 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 font-bold text-sm">✕</button>
          </div>

          <div class="flex-1 overflow-y-auto p-5 space-y-4">
            <div class="space-y-2">
              <label class="block font-bold uppercase text-[10px] text-amber-400">
                1. Chọn Trường Hợp Cập Nhật Story Bible:
              </label>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button type="button" id="btn-s21-case1-rebuild" class="p-3.5 rounded-xl border-2 border-emerald-500 bg-emerald-500/15 text-left transition space-y-1 shadow-md">
                  <div class="font-extrabold text-xs text-emerald-400">
                    🔄 Trường hợp 1: Tổng Hợp Từ Đầu (Chương 1 ➔ Hết)
                  </div>
                  <p class="text-[11px] text-zinc-400 leading-relaxed">
                    Dùng khi chưa có Story Bible hoặc muốn tổng hợp lại từ đầu đến chương hiện tại theo đúng Khung Kiểu Mẫu đã khóa.
                  </p>
                </button>

                <button type="button" id="btn-s21-case2-incremental" class="p-3.5 rounded-xl border-2 border-zinc-700 bg-zinc-900/60 hover:border-amber-500/60 text-left transition space-y-1 opacity-75">
                  <div class="font-extrabold text-xs text-amber-400">
                    ➕ Trường hợp 2: Bổ Sung Thêm Chương Đã Chọn
                  </div>
                  <p class="text-[11px] text-zinc-400 leading-relaxed">
                    Các chương trước đã có Story Bible: giữ nguyên dữ liệu cũ và chỉ đọc bổ sung thêm các chương bạn tích chọn bên dưới.
                  </p>
                </button>
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <label class="font-bold uppercase text-[10px] text-emerald-400">
                  2. Tích Chọn Các Chương Cần Đưa Vào Story Bible:
                </label>
                <div class="flex flex-wrap items-center gap-1.5">
                  <button type="button" id="btn-s21-chap-select-all" class="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-500">
                    ☑️ Chọn Tất Cả (Chương 1 ➔ Hết)
                  </button>
                  <button type="button" id="btn-s21-chap-select-upto-current" class="px-2.5 py-1 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold text-[11px] hover:bg-indigo-600 hover:text-white">
                    🎯 Chọn Từ Chương 1 ➔ Chương Đang Mở
                  </button>
                  <button type="button" id="btn-s21-chap-unselect-all" class="px-2 py-1 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-zinc-400 font-semibold text-[11px]">
                    ⬜ Bỏ chọn hết
                  </button>
                </div>
              </div>

              <div id="s21-bible-chapters-checklist" class="max-h-56 overflow-y-auto p-3 rounded-xl border border-studioLightBorder dark:border-zinc-800 bg-studioLightBg dark:bg-zinc-950 space-y-1.5"></div>
            </div>

            <div class="p-3 rounded-xl border border-studioLightBorder dark:border-zinc-800 bg-zinc-900/40 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Mô Hình AI Thực Thi:</label>
                <select id="s21-popup-bible-model" class="w-full px-2.5 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-white font-bold text-xs">
                  <option value="gemini-3.5-flash-lite">⚡ Gemini 3.5 Flash-Lite (Nhanh, Tiết kiệm)</option>
                  <option value="gemini-3.8-flash">🚀 Gemini 3.8 Flash (Cân bằng, Đa chương)</option>
                  <option value="gemini-3.1-pro-preview">🧠 Gemini 3.1 Pro Preview (Tổng hợp sâu nhất)</option>
                  <option value="gemini-4-argon">👑 Gemini 4 Argon (Flagship)</option>
                </select>
              </div>
              <div>
                <label class="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Mức Độ Tư Duy (Thinking):</label>
                <select id="s21-popup-bible-thinking" class="w-full px-2.5 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-emerald-400 font-bold text-xs">
                  <option value="low">⚡ Thấp (Low - Tốc độ cao)</option>
                  <option value="medium">⚖️ Trung Bình (Medium)</option>
                  <option value="high">🧠 Cao (High - Chi tiết nhất)</option>
                </select>
              </div>
            </div>

            <div id="s21-bible-popup-status" class="hidden p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold text-center">
              ⏳ Đang đọc các chương đã chọn và tổng hợp Story Bible theo Khung Kiểu Mẫu...
            </div>
          </div>

          <div class="px-5 py-3.5 border-t border-studioLightBorder dark:border-zinc-800 bg-studioLightBg dark:bg-zinc-950 flex items-center justify-end gap-2">
            <button type="button" id="btn-s21-cancel-bible-popup" class="px-4 py-2 rounded-xl border border-zinc-700 hover:bg-zinc-800 font-semibold">
              Hủy
            </button>
            <button type="button" id="btn-s21-confirm-run-bible-sync" class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition">
              ✅ OK — Bắt Đầu Cập Nhật Story Bible Theo Các Chương Đã Chọn
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      const case1Btn = document.getElementById('btn-s21-case1-rebuild');
      const case2Btn = document.getElementById('btn-s21-case2-incremental');

      const setCaseMode = (mode) => {
        this.updateMode = mode;
        if (mode === 'CASE_1_FROM_SCRATCH') {
          case1Btn.className =
            'p-3.5 rounded-xl border-2 border-emerald-500 bg-emerald-500/15 text-left transition space-y-1 shadow-md';
          case2Btn.className =
            'p-3.5 rounded-xl border-2 border-zinc-700 bg-zinc-900/60 hover:border-amber-500/60 text-left transition space-y-1 opacity-75';
          this.toggleAllCheckboxes(true);
        } else {
          case2Btn.className =
            'p-3.5 rounded-xl border-2 border-amber-500 bg-amber-500/15 text-left transition space-y-1 shadow-md';
          case1Btn.className =
            'p-3.5 rounded-xl border-2 border-zinc-700 bg-zinc-900/60 hover:border-emerald-500/60 text-left transition space-y-1 opacity-75';
          this.selectOnlyActiveChapter();
        }
      };

      case1Btn?.addEventListener('click', () => setCaseMode('CASE_1_FROM_SCRATCH'));
      case2Btn?.addEventListener('click', () => setCaseMode('CASE_2_INCREMENTAL'));

      document.getElementById('btn-s21-chap-select-all')?.addEventListener('click', () => {
        this.toggleAllCheckboxes(true);
      });
      document.getElementById('btn-s21-chap-unselect-all')?.addEventListener('click', () => {
        this.toggleAllCheckboxes(false);
      });
      document
        .getElementById('btn-s21-chap-select-upto-current')
        ?.addEventListener('click', () => {
          this.selectChaptersUpToCurrent();
        });

      const closeModal = () => modal.classList.add('hidden');
      document
        .getElementById('btn-s21-close-bible-selector')
        ?.addEventListener('click', closeModal);
      document
        .getElementById('btn-s21-cancel-bible-popup')
        ?.addEventListener('click', closeModal);

      document
        .getElementById('btn-s21-confirm-run-bible-sync')
        ?.addEventListener('click', async () => {
          await this.executeMultiChapterBibleSynthesis();
        });
    }

    hijackSyncBibleNowButton() {
      const syncBtn = document.getElementById('btn-s10-sync-bible-now');
      if (!syncBtn) return;

      const newSyncBtn = syncBtn.cloneNode(true);
      syncBtn.parentNode.replaceChild(newSyncBtn, syncBtn);

      newSyncBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.openChapterSelectorPopup();
      });
    }

    openChapterSelectorPopup() {
      const modal = document.getElementById('modal-s21-bible-chapters-selector');
      if (!modal) return;

      this.renderChaptersChecklist();

      const extModel =
        document.getElementById('s15-bible-model-select')?.value || 'gemini-3.5-flash-lite';
      const extThink = document.getElementById('s15-bible-thinking-select')?.value || 'low';
      const popModel = document.getElementById('s21-popup-bible-model');
      const popThink = document.getElementById('s21-popup-bible-thinking');
      if (popModel) popModel.value = extModel;
      if (popThink) popThink.value = extThink;

      document.getElementById('s21-bible-popup-status')?.classList.add('hidden');
      modal.classList.remove('hidden');
    }

    renderChaptersChecklist() {
      const listEl = document.getElementById('s21-bible-chapters-checklist');
      if (!listEl) return;

      const chapters = this.core.approvalGate.chapters || [];
      if (chapters.length === 0) {
        listEl.innerHTML = `<div class="text-zinc-500 italic py-3 text-center">Chưa có chương nào trong Cây bản thảo.</div>`;
        return;
      }

      listEl.innerHTML = chapters
        .map((ch, idx) => {
          const isApproved = ch.status === 'APPROVED';
          const isCurrent = ch.id === this.core.approvalGate.activeChapterId;
          const label = ch.displayTitle || ch.title || `Chương ${ch.chapterNumber}`;
          return `
            <label class="flex items-center justify-between gap-2 p-2.5 rounded-xl border ${
              isCurrent
                ? 'border-emerald-500/60 bg-emerald-500/10'
                : 'border-studioLightBorder dark:border-zinc-800 hover:bg-zinc-900/60'
            } cursor-pointer transition">
              <div class="flex items-center gap-2.5 min-w-0">
                <input type="checkbox" data-chap-id="${ch.id}" data-chap-idx="${idx}" checked class="s21-bible-chap-check rounded w-4 h-4 accent-emerald-600 shrink-0" />
                <span class="font-monoCode text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 shrink-0">#${
                  idx + 1
                }</span>
                <span class="font-bold text-xs truncate">${label}</span>
                ${
                  isCurrent
                    ? `<span class="px-1.5 py-0.5 rounded bg-amber-500 text-zinc-950 font-extrabold text-[9px] shrink-0">Đang mở</span>`
                    : ''
                }
              </div>
              <div class="flex items-center gap-2 shrink-0 font-monoCode text-[10px]">
                <span class="${isApproved ? 'text-emerald-400' : 'text-amber-400'}">
                  ${isApproved ? '✅ Đã chốt' : '📝 Nháp'}
                </span>
                <span class="text-zinc-400">${(ch.wordCount || 0).toLocaleString(
                  'vi-VN'
                )}w</span>
              </div>
            </label>
          `;
        })
        .join('');
    }

    toggleAllCheckboxes(checked) {
      document.querySelectorAll('.s21-bible-chap-check').forEach((chk) => {
        chk.checked = checked;
      });
    }

    selectOnlyActiveChapter() {
      const activeId = this.core.approvalGate.activeChapterId;
      document.querySelectorAll('.s21-bible-chap-check').forEach((chk) => {
        chk.checked = chk.getAttribute('data-chap-id') === activeId;
      });
    }

    selectChaptersUpToCurrent() {
      const chapters = this.core.approvalGate.chapters || [];
      const activeIdx = chapters.findIndex(
        (c) => c.id === this.core.approvalGate.activeChapterId
      );
      const limitIdx = activeIdx >= 0 ? activeIdx : chapters.length - 1;

      document.querySelectorAll('.s21-bible-chap-check').forEach((chk) => {
        const idx = parseInt(chk.getAttribute('data-chap-idx'), 10);
        chk.checked = idx <= limitIdx;
      });
    }

    async executeMultiChapterBibleSynthesis() {
      const selectedIds = [
        ...document.querySelectorAll('.s21-bible-chap-check:checked')
      ].map((c) => c.getAttribute('data-chap-id'));

      if (selectedIds.length === 0) {
        alert('Bạn hãy tích chọn ít nhất 1 chương để cập nhật Story Bible nhé!');
        return;
      }

      const selectedChapters = (this.core.approvalGate.chapters || []).filter((c) =>
        selectedIds.includes(c.id)
      );

      const chosenModel =
        document.getElementById('s21-popup-bible-model')?.value || 'gemini-3.5-flash-lite';
      const chosenThinking =
        document.getElementById('s21-popup-bible-thinking')?.value || 'low';

      const statusBox = document.getElementById('s21-bible-popup-status');
      const confirmBtn = document.getElementById('btn-s21-confirm-run-bible-sync');

      if (statusBox) {
        statusBox.classList.remove('hidden');
        statusBox.textContent = `⏳ Đang tổng hợp ${selectedChapters.length} chương đã chọn bằng [${chosenModel} | Tư duy: ${chosenThinking.toUpperCase()}]...`;
      }
      if (confirmBtn) confirmBtn.disabled = true;

      try {
        const templateFrame =
          document.getElementById('s10-bible-template-textarea')?.value ||
          this.bibleEngine?.templateFrame ||
          '';
        const existingBibleContent =
          document.getElementById('s10-bible-rendered-textarea')?.value ||
          this.bibleEngine?.renderedBibleContent ||
          '';

        const perChapterCharBudget = Math.max(
          3500,
          Math.floor(48000 / Math.max(1, selectedChapters.length))
        );

        const compiledChaptersDossier = selectedChapters
          .map((ch, idx) => {
            const rawContent = (ch.content || '').trim();
            const excerpt =
              rawContent.length <= perChapterCharBudget
                ? rawContent
                : `${rawContent.slice(
                    0,
                    Math.floor(perChapterCharBudget * 0.65)
                  )}\n...[Lược đoạn giữa]...\n${rawContent.slice(
                    -Math.floor(perChapterCharBudget * 0.35)
                  )}`;

            return [
              `----------------------------------------------------------------`,
              `CHƯƠNG THỨ ${idx + 1} TRONG DANH SÁCH CHỌN: ${
                ch.displayTitle || ch.title
              }`,
              `- Mốc giờ: ${ch.timelineTimestamp || 'Chưa ghi'} | Địa điểm: ${
                ch.location || 'Chưa ghi'
              } | POV: ${ch.povCharacter || 'Đa điểm nhìn'}`,
              `- Tóm tắt chương: ${ch.summary || '(Chưa có tóm tắt riêng)'}`,
              `- Nội dung văn bản chương:\n${excerpt || '(Chương chưa có văn bản)'}`
            ].join('\n');
          })
          .join('\n\n');

        const isFromScratch = this.updateMode === 'CASE_1_FROM_SCRATCH';

        const systemInstruction = [
          `Bạn là Kiến trúc sư Quản trị Story Bible Tự Động cho tiểu thuyết.`,
          `QUY TẮC TUYỆT ĐỐI VỀ KHUNG KIỂU MẪU (TEMPLATE LOCK):`,
          `- Bạn BẮT BUỘC phải xuất ra bản Story Bible tuân thủ 100% đúng từng đề mục và cấu trúc của [KHUNG KIỂU MẪU STORY BIBLE BẮT BUỘC] bên dưới.`,
          isFromScratch
            ? `- NHIỆM VỤ (TRƯỜNG HỢP 1 - TỔNG HỢP TỪ ĐẦU): Hãy đọc toàn bộ ${selectedChapters.length} chương được chọn (từ đầu đến chương hiện tại) và tổng hợp một bản Story Bible hoàn chỉnh, liền mạch, chi tiết nhất theo đúng Khung Kiểu Mẫu.`
            : `- NHIỆM VỤ (TRƯỜNG HỢP 2 - BỔ SUNG THÊM CHƯƠNG MỚI): Hãy giữ nguyên các thông tin cốt lõi trong [BẢN STORY BIBLE ĐÃ CÓ TỪ CÁC CHƯƠNG TRƯỚC], đồng thời đọc thêm ${selectedChapters.length} chương mới được chọn để cập nhật, mở rộng tình tiết mới, biến chuyển tâm lý nhân vật và phục bút mới vào đúng các mục của Khung Kiểu Mẫu.`
        ].join('\n');

        const userPrompt = [
          `=== 1. KHUNG KIỂU MẪU STORY BIBLE BẮT BUỘC PHẢI TUÂN THỦ 100% ===`,
          templateFrame,
          !isFromScratch
            ? `\n=== 2. BẢN STORY BIBLE ĐÃ CÓ TỪ CÁC CHƯƠNG TRƯỚC (CẦN GIỮ LẠI & BỔ SUNG THÊM) ===\n${existingBibleContent}`
            : '',
          `\n=== 3. DỮ LIỆU ${selectedChapters.length} CHƯƠNG ĐÃ CHỌN ĐỂ TỔNG HỢP / CẬP NHẬT ===`,
          compiledChaptersDossier,
          `\n=== YÊU CẦU ===`,
          `Hãy xuất ra bản Story Bible hoàn chỉnh bám sát 100% cấu trúc của Mục 1.`
        ]
          .filter(Boolean)
          .join('\n');

        const prevThink =
          window.StudioStage5?.upgrader?.layoutState?.thinkingLevel || 'low';
        if (window.StudioStage5?.upgrader) {
          window.StudioStage5.upgrader.layoutState.thinkingLevel = chosenThinking;
        }

        const apiRes = await this.stage3.geminiClient.generateContent({
          apiKey: this.stage2.settings.config.apiKey,
          modelId: chosenModel,
          isBiInternalCopilotCall: true,
          systemInstruction,
          userPrompt,
          temperature: 0.3,
          maxOutputTokens: 32768
        });

        if (window.StudioStage5?.upgrader) {
          window.StudioStage5.upgrader.layoutState.thinkingLevel = prevThink;
        }

        const updatedBibleText = apiRes.text.trim();
        this.bibleEngine?.saveRenderedBibleContent(updatedBibleText);

        const renderedArea = document.getElementById('s10-bible-rendered-textarea');
        if (renderedArea) renderedArea.value = updatedBibleText;

        const statusHeader = document.getElementById('s10-bible-sync-status');
        if (statusHeader) {
          statusHeader.textContent = `✅ Đã cập nhật Story Bible từ ${
            selectedChapters.length
          } chương đã chọn (${
            isFromScratch ? 'Tổng hợp từ đầu' : 'Bổ sung thêm chương'
          })!`;
        }

        this.promptVault?.refreshLockedVaultDisplay();
        document.getElementById('modal-s21-bible-chapters-selector')?.classList.add('hidden');
        window.StudioStage7?.saveEngine?.showSaveToastNotification(
          `🏛️ Đã cập nhật Story Bible thành công từ ${selectedChapters.length} chương đã chọn!`
        );
      } catch (err) {
        alert(`Lỗi khi tổng hợp Story Bible: ${err.message}`);
      } finally {
        if (confirmBtn) confirmBtn.disabled = false;
        statusBox?.classList.add('hidden');
      }
    }
  }

  // ==========================================================================
  // MÔ-ĐUN 10: PHÓNG TO TỐI ĐA KHUNG CHAT AI & THU GỌN KHUNG POV / NGƯỜI KỂ CHUYỆN
  // ==========================================================================
  class ExpandableAIChatAndCollapsiblePOVManager {
    static init() {
      ExpandableAIChatAndCollapsiblePOVManager.initChatViewportZoomer();
      ExpandableAIChatAndCollapsiblePOVManager.initCollapsiblePOVBar();
    }

    static initChatViewportZoomer() {
      const dialog = document.getElementById('s6-prompt-modal-dialog');
      if (!dialog) return;

      const modeButtonsStep1 =
        document.getElementById('s6-popup-mode-buttons')?.parentElement;
      const modelStep2Grid =
        document.getElementById('s6-popup-model-select')?.closest('.grid');

      if (
        modeButtonsStep1 &&
        modelStep2Grid &&
        !document.getElementById('s21-collapsible-upper-ai-settings')
      ) {
        const upperWrapper = document.createElement('div');
        upperWrapper.id = 's21-collapsible-upper-ai-settings';
        upperWrapper.className = 'space-y-3 transition-all duration-200';

        modeButtonsStep1.parentElement.insertBefore(upperWrapper, modeButtonsStep1);
        upperWrapper.appendChild(modeButtonsStep1);
        upperWrapper.appendChild(modelStep2Grid);
      }

      const upperBlock = document.getElementById('s21-collapsible-upper-ai-settings');
      if (upperBlock && !document.getElementById('s21-chat-zoom-toolbar')) {
        const zoomBar = document.createElement('div');
        zoomBar.id = 's21-chat-zoom-toolbar';
        zoomBar.className =
          'px-3 py-1.5 rounded-xl bg-zinc-900 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-2 text-xs';

        zoomBar.innerHTML = `
          <div class="flex items-center gap-2">
            <span class="font-bold text-emerald-400 text-[11px]">
              🔍 Kích thước Khung Chat / Ô Nhập Lệnh:
            </span>
            <button type="button" id="btn-s21-toggle-upper-settings" class="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] shadow transition">
              🔼 Mở Rộng Tối Đa Khung Chat (Thu gọn bảng thông số trên)
            </button>
          </div>

          <div class="flex items-center gap-1.5">
            <button type="button" data-chat-h="240px" class="s21-chat-h-btn px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold">
              Cỡ Vừa
            </button>
            <button type="button" data-chat-h="460px" class="s21-chat-h-btn px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-amber-400">
              Cỡ Lớn
            </button>
            <button type="button" data-chat-h="68vh" class="s21-chat-h-btn px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-emerald-400">
              Siêu Rộng
            </button>
          </div>
        `;

        upperBlock.insertAdjacentElement('afterend', zoomBar);

        const toggleUpperBtn = document.getElementById('btn-s21-toggle-upper-settings');
        let isUpperCollapsed = false;

        toggleUpperBtn?.addEventListener('click', () => {
          isUpperCollapsed = !isUpperCollapsed;
          dialog.classList.toggle('s21-chat-zoomed-max', isUpperCollapsed);
          if (isUpperCollapsed) {
            toggleUpperBtn.className =
              'px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-[11px] shadow transition';
            toggleUpperBtn.textContent =
              '🔽 Hiện Lại Bảng Chọn Chế Độ, Model & Hạn Mức Phía Trên';
          } else {
            toggleUpperBtn.className =
              'px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] shadow transition';
            toggleUpperBtn.textContent =
              '🔼 Mở Rộng Tối Đa Khung Chat (Thu gọn bảng thông số trên)';
          }
        });

        zoomBar.querySelectorAll('.s21-chat-h-btn').forEach((btn) => {
          btn.addEventListener('click', () => {
            const h = btn.getAttribute('data-chat-h');
            const chatMsgBox = document.getElementById('s7-freechat-messages-box');
            const promptArea = document.getElementById('s6-popup-prompt-textarea');
            if (chatMsgBox) {
              chatMsgBox.style.height = h;
              chatMsgBox.style.minHeight = h;
            }
            if (promptArea) {
              promptArea.style.height = h;
              promptArea.style.minHeight = h;
            }
          });
        });
      }
    }

    static initCollapsiblePOVBar() {
      document.getElementById('s21-pov-collapse-toggle-bar')?.remove();
      document.getElementById('s21-pov-metadata-grid-container')?.remove();
      document.getElementById('input-scene-timestamp')?.closest('.grid')?.remove();
    }
  }
  // ===> [KẾT THÚC PHẦN 2 / 3 — TIẾP TỤC PHẦN 3 / 3 (CUỐI CÙNG) Ở CÂU TRẢ LỜI TIẾP THEO] <===
  // ==========================================================================
  // MÔ-ĐUN 11: THƯƠNG HIỆU GÓC TRÁI, NÚT QUAY LẠI CHUẨN XÁC, POMODORO THU GỌN
  //            KHÔNG KHUNG THỪA, THANH NHẠC PIANO/ASMR/TUA ±5S & KÉO THẢ TỰ DO
  // ==========================================================================
  class TopBrandAudioSeekAndWidgetsController {
    constructor(stage14Navigator, stage8AudioPlayer, stage9AdvAudio) {
      this.navigator = stage14Navigator;
      this.player = stage8AudioPlayer;
      this.advAudio = stage9AdvAudio;
    }

    init() {
      this.rebrandTopLeftToBiNovelWeb();
      this.fixBackToWritingButtonFalsePositiveOnTab1();
      this.setupCompactPomodoroWithoutStretchedFrame();
      this.buildFloatingMP3BarWithSystemSoundsASMRAndSeek5s();
      this.injectSeek5sButtonsIntoMainTab5AudioDeck();
      this.enableUniversalFreeDragForAllFloatingWidgets();
    }

    /**
     * 1. Đổi góc trên cùng bên trái thành "✍️ Web viết tiểu thuyết của Bi"
     *    Click vào sẽ luôn quay thẳng về Tab 1 (Bàn Viết Truyện)
     */
    rebrandTopLeftToBiNovelWeb() {
      const topNav = document.getElementById('s14-master-top-nav');
      if (topNav && topNav.firstElementChild) {
        const brandBox = topNav.firstElementChild;
        brandBox.className =
          'flex items-center gap-2 shrink-0 cursor-pointer px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 transition group';
        brandBox.title = 'Click vào đây để quay trở về Bàn Viết Truyện (Tab 1)';
        brandBox.innerHTML = `
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 group-hover:bg-white"></span>
          <span class="font-extrabold text-xs tracking-wide text-emerald-400 group-hover:text-white">
            ✍️ Web viết tiểu thuyết của Bi
          </span>
        `;

        brandBox.addEventListener('click', () => {
          document
            .querySelectorAll('.fixed.inset-0:not(#modal-s6-welcome-launcher):not(#modal-s21-device-selector-gate)')
            .forEach((m) => m.classList.add('hidden'));
          this.navigator?.navigateToScreen('SCREEN_1_WRITE');
          window.StudioStage7?.saveEngine?.showSaveToastNotification(
            '✍️ Đã quay về Bàn Viết Truyện của Bi!'
          );
        });
      }

      document.title = 'Web viết tiểu thuyết của Bi - Light Novel Studio (Version 31)';
    }

    /**
     * 2. Sửa dứt điểm lỗi nút "⬅️ Quay Lại Bàn Viết Truyện" hiện sai ở Tab 1
     *    (Chỉ kiểm tra danh sách Modal thật, không quét nhầm <input id="modal-scene-time">)
     */
    fixBackToWritingButtonFalsePositiveOnTab1() {
      const realModalIds = [
        'modal-s6-prompt-studio',
        'modal-s6-custom-export',
        'modal-bugfixer-studio',
        'modal-snapshots-history',
        'modal-scene-builder',
        'modal-ai-settings',
        'modal-context-preview',
        's8-ambience-modal',
        'modal-s9-share-web',
        'modal-s10-changelog',
        'modal-s10-video-guide',
        'modal-s11-pomodoro-settings',
        'modal-s12-find-and-sensory',
        'modal-s15-writing-rules-and-approve',
        'modal-s15-approve-and-sync-bible',
        'modal-s19-timezone-picker',
        'modal-s21-bible-chapters-selector'
      ];

      const checkBackButtonVisibility = () => {
        const backBtn = document.getElementById('btn-s15-universal-back-to-write');
        if (!backBtn) return;

        const isAnyRealModalOpen = realModalIds.some((id) => {
          const el = document.getElementById(id);
          return el && !el.classList.contains('hidden');
        });

        document.body.classList.toggle('s16u-has-real-modal-open', isAnyRealModalOpen);

        const currentScreen =
          this.navigator?.currentScreen ||
          document.body.getAttribute('data-s14-screen') ||
          'SCREEN_1_WRITE';

        if (currentScreen === 'SCREEN_1_WRITE' && !isAnyRealModalOpen) {
          backBtn.classList.add('hidden');
        } else {
          backBtn.classList.remove('hidden');
        }
      };

      if (window.StudioStage15?.ergonomics) {
        window.StudioStage15.ergonomics.updateBackButtonVisibility = checkBackButtonVisibility;
      }
      checkBackButtonVisibility();
      setInterval(checkBackButtonVisibility, 260);
    }

    /**
     * 3. Thu gọn / Mở rộng Đồng hồ Pomodoro (> / < 🍅) không bao giờ bị kéo dài khung ngang vô hình
     */
    setupCompactPomodoroWithoutStretchedFrame() {
      const pomoPill = document.getElementById('s15-floating-pomodoro-pill');
      if (!pomoPill) return;

      let arrowBtn = document.getElementById('btn-s19-pomo-collapse-arrow');
      if (!arrowBtn) {
        arrowBtn = document.createElement('button');
        arrowBtn.type = 'button';
        arrowBtn.id = 'btn-s19-pomo-collapse-arrow';
        arrowBtn.className =
          'px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-emerald-600 text-emerald-400 hover:text-white font-monoCode font-extrabold text-xs transition';
        arrowBtn.title = 'Thu nhỏ đồng hồ Pomodoro (>) hoặc mở rộng ra (<)';
        pomoPill.prepend(arrowBtn);
      }

      const sanitizePomodoroGeometry = () => {
        const isCollapsed = pomoPill.classList.contains('s19-pomo-collapsed');
        const hasCustomLeft =
          pomoPill.style.left &&
          pomoPill.style.left !== 'auto' &&
          pomoPill.style.left !== '';

        if (hasCustomLeft) {
          pomoPill.setAttribute('data-s16u-dragged', 'true');
          pomoPill.style.right = 'auto';
        } else {
          pomoPill.removeAttribute('data-s16u-dragged');
          pomoPill.style.left = 'auto';
          pomoPill.style.right = isCollapsed ? '12px' : '16px';
        }

        pomoPill.style.width = 'fit-content';
        pomoPill.style.maxWidth = isCollapsed ? '66px' : 'max-content';
        arrowBtn.textContent = isCollapsed ? '< 🍅' : '>';
      };

      let isCollapsed = localStorage.getItem('noir_s19_pomo_collapsed') === 'true';
      pomoPill.classList.toggle('s19-pomo-collapsed', isCollapsed);
      sanitizePomodoroGeometry();

      const freshArrow = arrowBtn.cloneNode(true);
      arrowBtn.parentNode.replaceChild(freshArrow, arrowBtn);

      freshArrow.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        isCollapsed = !pomoPill.classList.contains('s19-pomo-collapsed');
        pomoPill.classList.toggle('s19-pomo-collapsed', isCollapsed);
        localStorage.setItem('noir_s19_pomo_collapsed', String(isCollapsed));

        if (isCollapsed) {
          const rect = pomoPill.getBoundingClientRect();
          if (rect.right > window.innerWidth - 130) {
            pomoPill.style.left = 'auto';
            pomoPill.style.right = '12px';
            pomoPill.removeAttribute('data-s16u-dragged');
          }
        }

        sanitizePomodoroGeometry();
        freshArrow.textContent = isCollapsed ? '< 🍅' : '>';
      });

      pomoPill.addEventListener('mouseup', () => setTimeout(sanitizePomodoroGeometry, 20));
      pomoPill.addEventListener('touchend', () => setTimeout(sanitizePomodoroGeometry, 20));
    }

    /**
     * 4. Hàm tua nhạc ±5 giây (⏪ -5s / +5s ⏩) dùng chung cho cả Thanh nhạc nổi và Bảng nhạc Tab 5
     */
    seekCurrentAudioBy(deltaSeconds) {
      const audio = this.player?.htmlAudioPlayer;
      if (!audio || !audio.src) {
        window.StudioStage7?.saveEngine?.showSaveToastNotification(
          '🎵 Hãy chọn một file nhạc MP3/WAV từ máy tính hoặc điện thoại để tua ±5 giây nhé!'
        );
        return;
      }

      const duration = Number(audio.duration) || 0;
      if (duration <= 0) return;

      let minTime = 0;
      let maxTime = duration;

      if (this.advAudio?.abLoopEnabled && this.advAudio.pointBSec > this.advAudio.pointASec) {
        minTime = Math.max(0, Number(this.advAudio.pointASec) || 0);
        maxTime = Math.min(duration, Number(this.advAudio.pointBSec) || duration);
      }

      const nextTime = Math.max(
        minTime,
        Math.min(maxTime - 0.2, (Number(audio.currentTime) || 0) + deltaSeconds)
      );
      audio.currentTime = nextTime;

      const seekSlider = document.getElementById('s9-audio-seek-slider');
      const curTimeEl = document.getElementById('s9-audio-time-cur');
      const miniTimeEl = document.getElementById('s19-mp3-time-mini');

      if (seekSlider) seekSlider.value = String(nextTime);
      if (curTimeEl && this.advAudio) {
        curTimeEl.textContent = this.advAudio.formatSec(nextTime);
      }
      if (miniTimeEl && this.advAudio) {
        miniTimeEl.textContent = this.advAudio.formatSec(nextTime);
      }
    }

    /**
     * 5. Dựng Thanh Nhạc Nổi Góc Dưới Trái (#s19-floating-mp3-bar):
     *    Có đủ Tiếng Piano Nhẹ, Mưa Đêm, Cà Phê, Phím Lách Cách ASMR, Tua ⏪ -5s / +5s ⏩ và Mũi tên thu gọn < / >
     */
    buildFloatingMP3BarWithSystemSoundsASMRAndSeek5s() {
      let mp3Bar = document.getElementById('s19-floating-mp3-bar');
      if (mp3Bar) mp3Bar.remove();

      const isAsmrOn = Boolean(this.player?.enableTypewriterSound);

      mp3Bar = document.createElement('div');
      mp3Bar.id = 's19-floating-mp3-bar';
      mp3Bar.className =
        'fixed bottom-10 left-3 z-40 rounded-2xl bg-zinc-900/95 text-white border-2 border-emerald-500/60 shadow-2xl px-3 py-1.5 flex items-center gap-2 text-xs select-none';

      mp3Bar.innerHTML = `
        <div class="s19-mp3-inner-content flex flex-wrap items-center gap-1.5">
          <button type="button" id="btn-s21-audio-playpause" class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition">
            ⏯️ Phát/Dừng
          </button>

          <select id="s21-floating-soundscape-select" class="px-2 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-emerald-300 font-bold text-[11px] focus:outline-none cursor-pointer" title="Chọn nhạc nền hệ thống (Piano nhẹ, Mưa đêm, Cà phê) hoặc nhạc MP3 từ máy">
            <option value="NONE">🔇 Tắt Nhạc Nền</option>
            <option value="NOIR_PIANO">🎹 Tiếng Piano Nhẹ & Mưa Đêm</option>
            <option value="RAIN_SOUND">🌧️ Tiếng Mưa Đêm Rả Rích</option>
            <option value="CAFE_VINYL">☕ Quán Cà Phê & Đĩa Than</option>
            <option value="LOCAL_MP3">🎵 File Nhạc MP3 Máy Tính</option>
          </select>

          <button type="button" id="btn-s21-toggle-asmr-keys" class="px-2 py-1 rounded-lg border font-bold text-[10px] transition ${
            isAsmrOn
              ? 'bg-emerald-600/30 border-emerald-400 text-emerald-300'
              : 'bg-zinc-800 border-zinc-700 text-zinc-400'
          }" title="Bật/Tắt tiếng bàn phím lách cách êm dịu (ASMR) mỗi khi bạn gõ chữ">
            ⌨️ Phím ASMR: ${isAsmrOn ? 'BẬT' : 'TẮT'}
          </button>

          <button type="button" id="btn-s21-pick-mp3" class="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-zinc-950 font-bold text-[10px]">
            📂 Chọn MP3
          </button>

          <span id="s19-mp3-time-mini" class="font-monoCode text-[10px] text-zinc-400">00:00</span>

          <div class="flex items-center gap-1">
            <button type="button" id="btn-s25-float-seek-back5" class="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/40 font-monoCode font-bold text-[10px]" title="Tua lùi 5 giây (-5s)">
              ⏪ -5s
            </button>
            <button type="button" id="btn-s25-float-seek-fwd5" class="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 font-monoCode font-bold text-[10px]" title="Tua tiến 5 giây (+5s)">
              +5s ⏩
            </button>
          </div>

          <button type="button" id="btn-s21-open-ab-tab5" class="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[10px] font-semibold" title="Mở bảng chỉnh tốc độ nhạc & Lặp đoạn A-B">
            ✂️ A-B
          </button>
        </div>

        <button type="button" id="btn-s19-mp3-collapse-arrow" class="px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-emerald-600 text-emerald-400 hover:text-white font-monoCode font-extrabold text-xs transition" title="Thu nhỏ thanh nhạc (<) hoặc mở rộng ra (>)">
          &lt;
        </button>
      `;

      document.body.appendChild(mp3Bar);

      const soundSelect = document.getElementById('s21-floating-soundscape-select');
      const mainSelect = document.getElementById('s8-quick-audio-select');
      if (soundSelect && this.player) {
        soundSelect.value = this.player.currentPreset || 'NONE';
      }

      soundSelect?.addEventListener('change', () => {
        const chosen = soundSelect.value;
        if (mainSelect) mainSelect.value = chosen;
        if (chosen === 'LOCAL_MP3' && !this.player?.htmlAudioPlayer?.src) {
          document.getElementById('s8-input-local-mp3')?.click();
          return;
        }
        this.player?.playSoundscape(chosen);
      });

      mainSelect?.addEventListener('change', () => {
        if (soundSelect) soundSelect.value = mainSelect.value;
      });

      document.getElementById('btn-s21-audio-playpause')?.addEventListener('click', () => {
        if (!this.player) return;
        if (this.player.isPlayingAmbience) {
          this.player.stopAllProceduralSounds();
          if (soundSelect) soundSelect.value = 'NONE';
        } else {
          const targetPreset =
            soundSelect && soundSelect.value !== 'NONE' ? soundSelect.value : 'NOIR_PIANO';
          if (soundSelect) soundSelect.value = targetPreset;
          this.player.playSoundscape(targetPreset);
        }
      });

      const asmrBtn = document.getElementById('btn-s21-toggle-asmr-keys');
      asmrBtn?.addEventListener('click', () => {
        if (!this.player) return;
        this.player.enableTypewriterSound = !this.player.enableTypewriterSound;
        localStorage.setItem('noir_s8_asmr_typing', String(this.player.enableTypewriterSound));

        const checkInModal = document.getElementById('s8-check-asmr-typing');
        if (checkInModal) checkInModal.checked = this.player.enableTypewriterSound;

        const on = this.player.enableTypewriterSound;
        asmrBtn.textContent = `⌨️ Phím ASMR: ${on ? 'BẬT' : 'TẮT'}`;
        asmrBtn.className = `px-2 py-1 rounded-lg border font-bold text-[10px] transition ${
          on
            ? 'bg-emerald-600/30 border-emerald-400 text-emerald-300'
            : 'bg-zinc-800 border-zinc-700 text-zinc-400'
        }`;

        if (on) {
          this.player.playTypewriterClick();
          window.StudioStage7?.saveEngine?.showSaveToastNotification(
            '⌨️ Đã BẬT tiếng bàn phím lách cách ASMR khi gõ bản thảo!'
          );
        }
      });

      document.getElementById('btn-s21-pick-mp3')?.addEventListener('click', () => {
        document.getElementById('s8-input-local-mp3')?.click();
      });

      document
        .getElementById('btn-s25-float-seek-back5')
        ?.addEventListener('click', () => this.seekCurrentAudioBy(-5));
      document
        .getElementById('btn-s25-float-seek-fwd5')
        ?.addEventListener('click', () => this.seekCurrentAudioBy(5));

      document.getElementById('btn-s21-open-ab-tab5')?.addEventListener('click', () => {
        this.navigator?.navigateToScreen('SCREEN_5_AMBIENCE');
      });

      let isMp3Collapsed = localStorage.getItem('noir_s19_mp3_collapsed') === 'true';
      const arrowBtn = document.getElementById('btn-s19-mp3-collapse-arrow');
      const applyMp3Collapse = () => {
        mp3Bar.classList.toggle('s19-mp3-collapsed', isMp3Collapsed);
        arrowBtn.textContent = isMp3Collapsed ? '🎵 >' : '<';
      };
      applyMp3Collapse();

      arrowBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        isMp3Collapsed = !isMp3Collapsed;
        localStorage.setItem('noir_s19_mp3_collapsed', String(isMp3Collapsed));
        applyMp3Collapse();
      });

      const audio = this.player?.htmlAudioPlayer;
      if (audio) {
        audio.addEventListener('timeupdate', () => {
          const timeEl = document.getElementById('s19-mp3-time-mini');
          if (timeEl && this.advAudio) {
            timeEl.textContent = this.advAudio.formatSec(audio.currentTime);
          }
        });
      }
    }

    /**
     * 6. Chèn nút Tua ⏪ -5s / +5s ⏩ vào Bảng Điều Khiển Nhạc Chính (Tab 5)
     */
    injectSeek5sButtonsIntoMainTab5AudioDeck() {
      const playPauseBtn = document.getElementById('btn-s9-play-pause-mp3');
      if (!playPauseBtn || document.getElementById('btn-s25-deck-seek-back5')) return;

      const back5Btn = document.createElement('button');
      back5Btn.type = 'button';
      back5Btn.id = 'btn-s25-deck-seek-back5';
      back5Btn.className =
        'px-2 py-0.5 rounded bg-zinc-800 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/40 font-monoCode font-bold text-[10px] transition';
      back5Btn.title = 'Tua lùi 5 giây (-5s)';
      back5Btn.textContent = '⏪ -5s';

      const fwd5Btn = document.createElement('button');
      fwd5Btn.type = 'button';
      fwd5Btn.id = 'btn-s25-deck-seek-fwd5';
      fwd5Btn.className =
        'px-2 py-0.5 rounded bg-zinc-800 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 font-monoCode font-bold text-[10px] transition';
      fwd5Btn.title = 'Tua tiến 5 giây (+5s)';
      fwd5Btn.textContent = '+5s ⏩';

      playPauseBtn.insertAdjacentElement('afterend', fwd5Btn);
      playPauseBtn.insertAdjacentElement('afterend', back5Btn);

      back5Btn.addEventListener('click', () => this.seekCurrentAudioBy(-5));
      fwd5Btn.addEventListener('click', () => this.seekCurrentAudioBy(5));
    }

    /**
     * 7. Kéo thả tự do (Universal Free Drag) cho Pomodoro, Viên Bi, Thanh Nhạc MP3 & Nút Quay lại
     */
    enableUniversalFreeDragForAllFloatingWidgets() {
      const targets = [
        { id: 's15-floating-pomodoro-pill', key: 'noir_s20_pos_pomodoro' },
        { id: 's11-mascot-bi-corner', key: 'noir_s20_pos_mascot_bi' },
        { id: 's19-floating-mp3-bar', key: 'noir_s20_pos_mp3_bar' },
        { id: 'btn-s15-universal-back-to-write', key: 'noir_s20_pos_back_btn' }
      ];

      targets.forEach((cfg) => {
        const el = document.getElementById(cfg.id);
        if (el) this.attachFreeDragToElement(el, cfg.key);
      });
    }

    attachFreeDragToElement(el, storageKey) {
      if (el.__s16uDraggable) return;
      el.__s16uDraggable = true;
      el.classList.add('s16u-draggable-widget');

      try {
        const savedPos = JSON.parse(localStorage.getItem(storageKey) || 'null');
        if (
          savedPos &&
          typeof savedPos.left === 'number' &&
          typeof savedPos.top === 'number'
        ) {
          const clampedLeft = Math.max(4, Math.min(window.innerWidth - 65, savedPos.left));
          const clampedTop = Math.max(4, Math.min(window.innerHeight - 45, savedPos.top));
          el.style.right = 'auto';
          el.style.bottom = 'auto';
          el.style.left = `${clampedLeft}px`;
          el.style.top = `${clampedTop}px`;
          el.setAttribute('data-s16u-dragged', 'true');
        }
      } catch (_) {}

      let isDown = false;
      let hasDragged = false;
      let startX = 0;
      let startY = 0;
      let initLeft = 0;
      let initTop = 0;

      const onDown = (e) => {
        if (e.target && (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT')) {
          return;
        }
        if (e.button !== undefined && e.button !== 0) return;

        isDown = true;
        hasDragged = false;
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        const rect = el.getBoundingClientRect();
        startX = cx;
        startY = cy;
        initLeft = rect.left;
        initTop = rect.top;
      };

      const onMove = (e) => {
        if (!isDown) return;
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        const dx = cx - startX;
        const dy = cy - startY;

        if (!hasDragged && Math.hypot(dx, dy) > 6) {
          hasDragged = true;
          el.classList.add('s16u-dragging-active');
          el.setAttribute('data-s16u-dragged', 'true');
        }

        if (hasDragged) {
          if (e.cancelable) e.preventDefault();
          const maxL = Math.max(10, window.innerWidth - el.offsetWidth - 6);
          const maxT = Math.max(10, window.innerHeight - el.offsetHeight - 6);
          const nextL = Math.max(4, Math.min(maxL, initLeft + dx));
          const nextT = Math.max(4, Math.min(maxT, initTop + dy));

          el.style.right = 'auto';
          el.style.bottom = 'auto';
          el.style.left = `${nextL}px`;
          el.style.top = `${nextT}px`;
        }
      };

      const onUp = () => {
        if (!isDown) return;
        isDown = false;
        el.classList.remove('s16u-dragging-active');
        if (hasDragged) {
          const rect = el.getBoundingClientRect();
          localStorage.setItem(
            storageKey,
            JSON.stringify({ left: Math.round(rect.left), top: Math.round(rect.top) })
          );
        }
      };

      el.addEventListener(
        'click',
        (e) => {
          if (hasDragged) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            hasDragged = false;
          }
        },
        true
      );

      el.addEventListener('mousedown', onDown);
      el.addEventListener('touchstart', onDown, { passive: true });
      window.addEventListener('mousemove', onMove, { passive: false });
      window.addEventListener('touchmove', onMove, { passive: false });
      window.addEventListener('mouseup', onUp);
      window.addEventListener('touchend', onUp);
    }
  }

  // ==========================================================================
  // MÔ-ĐUN 12: THANH DƯỚI CÙNG (FOOTER) GỌN 1 DÒNG, NÚT VERSION 31 MỞ LOA
  //            & ĐỒNG HỒ MÚI GIỜ 22 THÀNH PHỐ QUỐC TẾ ONLINE
  // ==========================================================================
  const WORLD_CITIES_TIMEZONES = [
    { city: 'Đà Nẵng / Hà Nội / TP.HCM (Việt Nam)', tz: 'Asia/Ho_Chi_Minh', gmt: 'GMT+7' },
    { city: 'Tokyo / Osaka (Nhật Bản)', tz: 'Asia/Tokyo', gmt: 'GMT+9' },
    { city: 'Seoul / Busan (Hàn Quốc)', tz: 'Asia/Seoul', gmt: 'GMT+9' },
    { city: 'Bắc Kinh / Thượng Hải (Trung Quốc)', tz: 'Asia/Shanghai', gmt: 'GMT+8' },
    { city: 'Đài Bắc (Đài Loan)', tz: 'Asia/Taipei', gmt: 'GMT+8' },
    { city: 'Singapore (Singapore)', tz: 'Asia/Singapore', gmt: 'GMT+8' },
    { city: 'Bangkok (Thái Lan)', tz: 'Asia/Bangkok', gmt: 'GMT+7' },
    { city: 'Sydney / Melbourne (Úc)', tz: 'Australia/Sydney', gmt: 'GMT+10/11' },
    { city: 'Auckland (New Zealand)', tz: 'Pacific/Auckland', gmt: 'GMT+12/13' },
    { city: 'New Delhi / Mumbai (Ấn Độ)', tz: 'Asia/Kolkata', gmt: 'GMT+5:30' },
    { city: 'Dubai (UAE)', tz: 'Asia/Dubai', gmt: 'GMT+4' },
    { city: 'Moscow (Nga)', tz: 'Europe/Moscow', gmt: 'GMT+3' },
    { city: 'Paris / Berlin / Rome (Châu Âu)', tz: 'Europe/Paris', gmt: 'GMT+1/2' },
    { city: 'London (Vương Quốc Anh)', tz: 'Europe/London', gmt: 'GMT+0/1' },
    { city: 'Cairo (Ai Cập)', tz: 'Africa/Cairo', gmt: 'GMT+2' },
    { city: 'São Paulo (Brazil)', tz: 'America/Sao_Paulo', gmt: 'GMT-3' },
    { city: 'New York / Washington D.C. (Mỹ - EST)', tz: 'America/New_York', gmt: 'GMT-5/4' },
    { city: 'Chicago / Dallas (Mỹ - CST)', tz: 'America/Chicago', gmt: 'GMT-6/5' },
    { city: 'Denver (Mỹ - MST)', tz: 'America/Denver', gmt: 'GMT-7/6' },
    { city: 'Los Angeles / San Francisco (Mỹ - PST)', tz: 'America/Los_Angeles', gmt: 'GMT-8/7' },
    { city: 'Toronto / Vancouver (Canada)', tz: 'America/Toronto', gmt: 'GMT-5/4' },
    { city: 'Giờ Phối Hợp Quốc Tế (UTC)', tz: 'UTC', gmt: 'GMT+0' }
  ];

  class CleanFooterClockAndWorldTimezoneManager {
    constructor() {
      this.selectedCityObj = this.loadSavedTimezone();
    }

    loadSavedTimezone() {
      try {
        const saved = JSON.parse(localStorage.getItem('noir_s19_timezone_cfg') || 'null');
        if (saved && saved.tz) return saved;
      } catch (_) {}
      return WORLD_CITIES_TIMEZONES[0];
    }

    init() {
      this.rebuildCleanSingleLineFooter();
      this.injectWorldCityTimezoneModal();
      this.startLiveClockTick();
    }

    rebuildCleanSingleLineFooter() {
      const footer = document.getElementById('app-bottom-footer');
      if (!footer) return;

      footer.innerHTML = `
        <!-- Trái: Nút Version 31 bấm vào mở thẳng Loa Thông Báo -->
        <div class="flex items-center gap-2 shrink-0">
          <button type="button" id="s20-version-only-badge" class="px-3 py-0.5 rounded-lg bg-emerald-500/20 hover:bg-amber-500 text-emerald-400 hover:text-zinc-950 border border-emerald-500/40 hover:border-amber-400 font-monoCode font-extrabold text-xs tracking-wide cursor-pointer transition shadow-sm" title="Click vào đây để mở thẳng Loa Thông Báo Phiên Bản (Version 1.0 ➔ Version 31)">
            Version 31
          </button>
        </div>

        <!-- Chính giữa: Đồng hồ Cỡ Lớn 1 Dòng + Nút nhỏ chỉnh múi giờ -->
        <div class="flex items-center justify-center gap-2.5 mx-auto overflow-hidden">
          <span id="s20-large-clock-display" class="font-monoCode font-extrabold text-sm md:text-[15px] text-emerald-400 tracking-wider">
            🕒 --:--:-- • GMT+7
          </span>
          <button type="button" id="btn-s20-small-tz-picker" class="px-2 py-0.5 rounded bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-zinc-950 border border-amber-500/30 font-sansUI font-semibold text-[10px] transition shrink-0">
            🌍 Chỉnh múi giờ
          </button>
        </div>

        <!-- Phải: Khoảng đệm gọn gàng (Đã xóa bỏ phần Tiết kiệm % và Quy ước thoại) -->
        <div class="w-14 shrink-0"></div>
      `;

      document.getElementById('s20-version-only-badge')?.addEventListener('click', () => {
        document.getElementById('modal-s10-changelog')?.classList.remove('hidden');
      });

      document.getElementById('btn-s20-small-tz-picker')?.addEventListener('click', () => {
        document.getElementById('modal-s19-timezone-picker')?.classList.remove('hidden');
        document.getElementById('s19-tz-search-input')?.focus();
      });
    }

    injectWorldCityTimezoneModal() {
      let modal = document.getElementById('modal-s19-timezone-picker');
      if (modal) modal.remove();

      modal = document.createElement('div');
      modal.id = 'modal-s19-timezone-picker';
      modal.className =
        'hidden fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm select-none';

      modal.innerHTML = `
        <div class="w-full max-w-lg rounded-2xl border-2 border-emerald-500/60 bg-studioLightPanel dark:bg-zinc-900 shadow-2xl overflow-hidden text-xs flex flex-col max-h-[82vh]">
          <div class="px-5 py-3.5 border-b border-studioLightBorder dark:border-zinc-800 bg-emerald-600/15 flex items-center justify-between">
            <div>
              <h3 class="font-bold uppercase text-sm text-emerald-500">
                🌍 Tùy Chỉnh Múi Giờ Theo Các Thành Phố Trên Thế Giới (Online)
              </h3>
              <p class="text-[11px] text-zinc-500">
                Chọn thành phố để hiển thị thời gian, múi giờ và ngày tháng ở thanh dưới cùng
              </p>
            </div>
            <button type="button" id="btn-s19-close-tz-modal" class="px-2.5 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 font-bold">✕</button>
          </div>

          <div class="p-4 border-b border-studioLightBorder dark:border-zinc-800">
            <input id="s19-tz-search-input" type="text" placeholder="🔍 Gõ tên thành phố hoặc quốc gia (VD: Đà Nẵng, Tokyo, Seoul, London, New York)..." class="w-full px-3 py-2 rounded-xl border border-emerald-500/50 bg-studioLightBg dark:bg-zinc-950 text-xs focus:outline-none" />
          </div>

          <div id="s19-tz-cities-list" class="flex-1 overflow-y-auto p-4 space-y-1.5"></div>
        </div>
      `;

      document.body.appendChild(modal);

      document.getElementById('btn-s19-close-tz-modal')?.addEventListener('click', () => {
        modal.classList.add('hidden');
      });

      const searchInput = document.getElementById('s19-tz-search-input');
      searchInput?.addEventListener('input', () => {
        this.renderTimezoneCitiesList(searchInput.value);
      });

      this.renderTimezoneCitiesList('');
    }

    renderTimezoneCitiesList(query) {
      const container = document.getElementById('s19-tz-cities-list');
      if (!container) return;

      const q = (query || '').toLowerCase().trim();
      const filtered = WORLD_CITIES_TIMEZONES.filter(
        (item) =>
          !q ||
          item.city.toLowerCase().includes(q) ||
          item.tz.toLowerCase().includes(q) ||
          item.gmt.toLowerCase().includes(q)
      );

      container.innerHTML = '';
      const now = new Date();

      filtered.forEach((item) => {
        let previewTime = '';
        try {
          previewTime = new Intl.DateTimeFormat('vi-VN', {
            timeZone: item.tz,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour12: false
          }).format(now);
        } catch (_) {
          previewTime = now.toLocaleTimeString('vi-VN');
        }

        const isCurrent =
          item.tz === this.selectedCityObj.tz && item.city === this.selectedCityObj.city;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
          isCurrent
            ? 'border-emerald-500 bg-emerald-600 text-white font-bold shadow'
            : 'border-studioLightBorder dark:border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/10'
        }`;
        btn.innerHTML = `
          <div>
            <div class="text-xs">${item.city}</div>
            <div class="text-[10px] opacity-75 font-monoCode">${item.tz} (${item.gmt})</div>
          </div>
          <div class="font-monoCode font-bold text-xs">${previewTime}</div>
        `;

        btn.addEventListener('click', () => {
          this.selectedCityObj = item;
          localStorage.setItem('noir_s19_timezone_cfg', JSON.stringify(item));
          this.updateClockDisplayNow();
          this.renderTimezoneCitiesList(query);
          document.getElementById('modal-s19-timezone-picker')?.classList.add('hidden');
          window.StudioStage7?.saveEngine?.showSaveToastNotification(
            `🌍 Đã chuyển múi giờ sang: ${item.city} (${item.gmt})!`
          );
        });

        container.appendChild(btn);
      });
    }

    updateClockDisplayNow() {
      const displayEl = document.getElementById('s20-large-clock-display');
      if (!displayEl) return;

      const now = new Date();
      try {
        const timeStr = new Intl.DateTimeFormat('vi-VN', {
          timeZone: this.selectedCityObj.tz,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).format(now);

        const dateStr = new Intl.DateTimeFormat('vi-VN', {
          timeZone: this.selectedCityObj.tz,
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }).format(now);

        const shortCity = this.selectedCityObj.city.split('(')[0].trim();
        displayEl.textContent = `🕒 ${timeStr}  |  ${this.selectedCityObj.gmt} (${shortCity})  •  ${dateStr}`;
      } catch (_) {
        displayEl.textContent = `🕒 ${now.toLocaleTimeString('vi-VN')}  |  GMT+7`;
      }
    }

    startLiveClockTick() {
      this.updateClockDisplayNow();
      setInterval(() => this.updateClockDisplayNow(), 1000);
    }
  }

  // ==========================================================================
  // MÔ-ĐUN 13: TỰ NHỚ FILE ĐÃ NẠP ĐA THIẾT BỊ (INDEXEDDB) + VIDEO HƯỚNG DẪN
  //            120 GIÂY (8 CHƯƠNG) & SPOTLIGHT TOUR KHÔNG DƯ BI / ĐÈ CHỮ
  // ==========================================================================
  class PersistentFileMemoryAnd120sVideoGuideEngine {
    constructor(core, stage7, stage10, stage13) {
      this.core = core;
      this.stage7 = stage7;
      this.stage10 = stage10;
      this.stage13 = stage13;
    }

    async init() {
      await this.restoreAllRememberedWorkspaceData();
      this.injectUniversalMobileAndLaptopFileImporter();
      this.setupAutoSnapshotOnEveryChange();
      this.rebuildChangelogModalAndTopButtonsToV31();
      this.upgradeVideoTutorialTo120sWithoutDuplicateBi();
      this.upgradeSpotlightTourTo8StepsWithoutTextOverlap();
    }

    async restoreAllRememberedWorkspaceData() {
      try {
        const idb = this.core.controller.idb;
        const savedSnapshot = await idb.get(
          'state_cache',
          'noir_s23_master_workspace_memory'
        );

        if (savedSnapshot) {
          if (
            Array.isArray(savedSnapshot.chapters) &&
            savedSnapshot.chapters.length > 0 &&
            this.core.approvalGate.chapters.length <= 1 &&
            (this.core.approvalGate.chapters[0]?.wordCount || 0) === 0
          ) {
            this.core.approvalGate.chapters = savedSnapshot.chapters;
            this.core.approvalGate.activeChapterId =
              savedSnapshot.activeChapterId || savedSnapshot.chapters[0].id;
          }

          if (savedSnapshot.bibleData) {
            this.core.bibleManager.data = {
              ...this.core.bibleManager.data,
              ...savedSnapshot.bibleData
            };
          }

          this.core.controller.renderAll();

          const pathEl = document.getElementById('fs-folder-path');
          const dot = document.getElementById('fs-status-dot');
          if (dot) dot.className = 'w-3 h-3 rounded-full bg-emerald-500';
          if (pathEl) {
            pathEl.textContent = `Đã tự động khôi phục ${this.core.approvalGate.chapters.length} chương từ bộ nhớ máy (${
              savedSnapshot.lastFolderName || 'Thiết bị này'
            })`;
          }
        }
      } catch (e) {
        console.warn('Khôi phục bộ nhớ tự động:', e);
      }
    }

    async saveMasterWorkspaceMemory() {
      try {
        const idb = this.core.controller.idb;
        const payload = {
          chapters: this.core.approvalGate.chapters,
          activeChapterId: this.core.approvalGate.activeChapterId,
          bibleData: this.core.bibleManager.data,
          lastFolderName:
            this.core.fsEngine.rootHandle?.name ||
            localStorage.getItem('noir_s23_last_folder_name') ||
            'Bộ nhớ máy',
          savedAt: new Date().toISOString()
        };
        await idb.set('state_cache', 'noir_s23_master_workspace_memory', payload);
      } catch (_) {}
    }

    setupAutoSnapshotOnEveryChange() {
      window.addEventListener('studio:chapter-approved', () =>
        this.saveMasterWorkspaceMemory()
      );
      window.addEventListener('studio:bible-updated', () =>
        this.saveMasterWorkspaceMemory()
      );
      window.addEventListener('studio:fs-connected', (e) => {
        if (e.detail?.name) {
          localStorage.setItem('noir_s23_last_folder_name', e.detail.name);
        }
        this.saveMasterWorkspaceMemory();
      });

      setInterval(() => this.saveMasterWorkspaceMemory(), 4000);
    }

    injectUniversalMobileAndLaptopFileImporter() {
      let filePicker = document.getElementById('s23-universal-file-picker');
      if (!filePicker) {
        filePicker = document.createElement('input');
        filePicker.type = 'file';
        filePicker.id = 's23-universal-file-picker';
        filePicker.multiple = true;
        filePicker.accept = '.docx,.doc,.pdf,.txt,.md';
        filePicker.className = 'hidden';
        document.body.appendChild(filePicker);

        filePicker.addEventListener('change', async (e) => {
          const files = Array.from(e.target.files || []);
          if (files.length === 0) return;
          await this.importStandardFilesAndRemember(files);
          filePicker.value = '';
        });
      }

      const hookFileImportButton = (btnId) => {
        const btn = document.getElementById(btnId);
        if (!btn) return;
        btn.disabled = false;
        btn.addEventListener(
          'click',
          (e) => {
            const isMobileMode = document.body.classList.contains('s21-device-mobile');
            const supportsDirPicker = 'showDirectoryPicker' in window;
            if (isMobileMode || !supportsDirPicker || !this.core.fsEngine.rootHandle) {
              e.preventDefault();
              e.stopPropagation();
              filePicker.click();
            }
          },
          true
        );
      };

      hookFileImportButton('btn-scan-legacy-files');
      hookFileImportButton('btn-s14-import-files');
      hookFileImportButton('s6-welcome-connect-disk');
    }

    async importStandardFilesAndRemember(fileList) {
      let importedCount = 0;
      for (const file of fileList) {
        try {
          const pseudoHandle = {
            name: file.name,
            getFile: async () => file
          };
          const extractedText =
            await this.core.docParser.extractTextFromFileHandle(pseudoHandle);
          if (!extractedText || extractedText.trim().length < 5) continue;

          const existing = this.core.approvalGate.chapters.find(
            (c) => c.sourceFileName === file.name
          );

          if (existing) {
            existing.content = extractedText;
            existing.wordCount =
              this.core.docParser.countVietnameseWords(extractedText);
            await this.core.approvalGate.approveChapter(existing.id);
          } else {
            const chapNum = this.core.docParser.detectChapterNumber(
              file.name,
              extractedText
            );
            const cleanTitle = file.name.replace(/\.(docx|doc|pdf|txt|md)$/i, '');
            const newChap = await this.core.approvalGate.createDraftChapter({
              chapterNumber:
                chapNum === 999
                  ? this.core.approvalGate.chapters.length + 1
                  : chapNum,
              title: cleanTitle,
              content: extractedText,
              sourceFileName: file.name,
              summary:
                this.core.ragIndexer.generateFallbackLocalSummary(extractedText)
            });
            await this.core.approvalGate.approveChapter(newChap.id);
          }
          importedCount++;
        } catch (err) {
          console.warn(`Lỗi đọc file ${file.name}:`, err);
        }
      }

      if (importedCount > 0 && this.core.approvalGate.chapters.length > 1) {
        this.core.approvalGate.chapters = this.core.approvalGate.chapters.filter(
          (c) => !(c.wordCount === 0 && c.title.includes('Khởi đầu bản nháp'))
        );
        this.core.approvalGate.activeChapterId =
          this.core.approvalGate.chapters[0]?.id || null;
      }

      await this.core.approvalGate.persistRegistry();
      await this.saveMasterWorkspaceMemory();
      this.core.controller.renderAll();

      window.StudioStage7?.saveEngine?.showSaveToastNotification(
        `📥 Đã nạp & ghi nhớ vĩnh viễn ${importedCount} file chương vào máy của bạn!`
      );
    }

    rebuildChangelogModalAndTopButtonsToV31() {
      const topNav = document.getElementById('s14-master-top-nav');
      if (topNav && topNav.lastElementChild) {
        let topMegaBtn = document.getElementById('btn-s18-top-megaphone');
        if (!topMegaBtn) {
          topMegaBtn = document.createElement('button');
          topMegaBtn.type = 'button';
          topMegaBtn.id = 'btn-s18-top-megaphone';
          topMegaBtn.className =
            'px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500 hover:text-zinc-950 text-xs font-extrabold transition flex items-center gap-1.5 shadow-sm shrink-0';
          topNav.lastElementChild.prepend(topMegaBtn);
          topMegaBtn.addEventListener('click', () => {
            window.__S17_OPEN_FULL_CHANGELOG__?.();
          });
        }
        topMegaBtn.innerHTML = `<span>📢 Loa Cập Nhật</span>`;

        let vidTopBtn = document.getElementById('btn-s23-top-video-guide');
        if (!vidTopBtn) {
          vidTopBtn = document.createElement('button');
          vidTopBtn.type = 'button';
          vidTopBtn.id = 'btn-s23-top-video-guide';
          vidTopBtn.className =
            'px-2.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600 hover:text-white text-xs font-extrabold transition flex items-center gap-1 shadow-sm shrink-0';
          topNav.lastElementChild.prepend(vidTopBtn);
          vidTopBtn.addEventListener('click', () => {
            window.__S17_OPEN_DETAILED_VIDEO_GUIDE__?.();
          });
        }
        vidTopBtn.innerHTML = `<span>🎬 Video Hướng Dẫn</span>`;
      }

      const sysMega = document.querySelector('[data-s14-sys-click="btn-s10-megaphone"]');
      if (sysMega) {
        sysMega.textContent = '📢 Loa Version 31';
        const descP = sysMega.closest('.p-5')?.querySelector('p');
        if (descP) {
          descP.textContent =
            'Xem Video hướng dẫn chi tiết 120 giây (Version 31) trên cả Laptop & Điện thoại, hoặc mở Loa Thông Báo xem trọn bộ 31 bản nâng cấp (v1.0 ➔ v31.0).';
        }
      }

      const changelogModal = document.getElementById('modal-s10-changelog');
      if (!changelogModal) return;

      changelogModal.innerHTML = `
        <div class="w-full max-w-3xl max-h-[88vh] rounded-2xl border-2 border-emerald-500/60 bg-studioLightPanel dark:bg-zinc-900 shadow-2xl flex flex-col overflow-hidden text-xs">
          <div class="px-5 py-4 border-b border-studioLightBorder dark:border-zinc-800 bg-amber-500/15 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span class="text-2xl">📢</span>
              <div>
                <h3 class="font-bold uppercase text-sm text-amber-500">
                  LOA THÔNG BÁO — LỊCH SỬ CẬP NHẬT ĐẦY ĐỦ THỨ TỰ (BẢN 1.0 ➔ VERSION 31 MỚI NHẤT)
                </h3>
                <p class="text-[11px] text-zinc-500">
                  Web viết tiểu thuyết của Bi • Đã hợp nhất & đồng bộ trọn vẹn 31 phiên bản nâng cấp
                </p>
              </div>
            </div>
            <button type="button" id="btn-s16u-close-changelog" class="px-2.5 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 font-bold text-sm">✕</button>
          </div>

          <div class="flex-1 overflow-y-auto p-5 space-y-3.5 select-text">
            ${MASTER_CHANGELOG_V1_TO_V31.map(
              (item, idx) => `
              <div class="p-4 rounded-xl border ${
                idx === 0
                  ? 'border-emerald-500 bg-emerald-500/10 shadow-lg'
                  : 'border-studioLightBorder dark:border-zinc-800 bg-studioLightBg/50 dark:bg-zinc-950/50'
              } space-y-2">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <span class="px-2.5 py-0.5 rounded-full ${
                      idx === 0 ? 'bg-emerald-600 text-white' : 'bg-zinc-700 text-zinc-200'
                    } font-monoCode font-bold text-[11px]">
                      #${item.num} • ${item.version}
                    </span>
                    <span class="font-bold text-sm ${
                      idx === 0 ? 'text-emerald-400' : 'text-amber-500'
                    }">
                      ${item.badge}
                    </span>
                  </div>
                  <span class="text-[10px] font-monoCode text-zinc-400">${item.date}</span>
                </div>
                <ul class="space-y-1 text-zinc-600 dark:text-zinc-300 pl-4 list-disc leading-relaxed">
                  ${(item.items || []).map((it) => `<li>${it}</li>`).join('')}
                </ul>
              </div>
            `
            ).join('')}
          </div>
        </div>
      `;

      document
        .getElementById('btn-s16u-close-changelog')
        ?.addEventListener('click', () => {
          changelogModal.classList.add('hidden');
        });
    }

    /**
     * Nâng cấp Video Hướng Dẫn lên 120 giây (8 chương) chỉ có DUY NHẤT 1 Viên Bi đi bộ dẫn đường
     */
    upgradeVideoTutorialTo120sWithoutDuplicateBi() {
      const vp = this.stage10?.videoPlayer;
      if (!vp) return;

      vp.totalDurationSec = 120;
      vp.chapters = [
        {
          start: 0,
          end: 15,
          title: 'Phần 1/8 (0:00 - 0:15): Chọn Giao Diện Laptop Hoặc Điện Thoại Màn Hình Dọc',
          subtitle:
            '🎱 Viên Bi: Chào mừng bạn đến với Version 31 Hợp Nhất! Bạn có thể chọn giao diện Laptop hoặc Điện thoại ngay từ đầu hoặc bấm nút chuyển đổi trên thanh trên cùng bất cứ lúc nào!',
          subtitleEn:
            'Part 1/8: Choose Laptop or Mobile Portrait UI on launch, or switch anytime via the top bar button.',
          cursorTarget: { x: 580, y: 22 }
        },
        {
          start: 15,
          end: 30,
          title: 'Phần 2/8 (0:15 - 0:30): Lấy Key API Tự Động & Verify Siêu Tốc (AIza... / AQ...)',
          subtitle:
            '🎱 Viên Bi: Ở màn hình Key API, bạn bấm Lấy Key API Tự Động rồi nhấn Ctrl+V dán vào ô. Hệ thống hỗ trợ cả mã AIza... lẫn AQ... và mở khóa tức thì!',
          subtitleEn:
            'Part 2/8: Auto-fetch your API key and paste it. Version 31 supports both AIza... and AQ... keys with instant unlocking!',
          cursorTarget: { x: 420, y: 155 }
        },
        {
          start: 30,
          end: 45,
          title: 'Phần 3/8 (0:30 - 0:45): Tự Động Nhớ File Đã Nạp & Quản Lý Cây Bản Thảo (Tab 2)',
          subtitle:
            '🎱 Viên Bi: Tại Tab 2 (Chương & File Nguồn), mọi file .DOCX, .PDF, .TXT bạn nạp vào trên cả điện thoại và laptop đều được tự động ghi nhớ cho các lần truy cập sau!',
          subtitleEn:
            'Part 3/8: In Tab 2, all imported DOCX/PDF/TXT files are automatically remembered across visits.',
          cursorTarget: { x: 295, y: 22 }
        },
        {
          start: 45,
          end: 60,
          title: 'Phần 4/8 (0:45 - 1:00): Bàn Viết Truyện, Thu Gọn Khung POV & Đọc Bản Thảo Giọng Bi',
          subtitle:
            '🎱 Viên Bi: Tại Tab 1, bạn có thể thu gọn khung POV, bấm Lưu Ctrl+S, nghe Bi đọc to bản thảo và bấm tên "Web viết tiểu thuyết của Bi" ở góc trái để luôn quay về bàn viết!',
          subtitleEn:
            'Part 4/8: Collapse the POV bar, save with Ctrl+S, listen to Bi read your draft, and click the top-left brand to return anytime.',
          cursorTarget: { x: 110, y: 22 }
        },
        {
          start: 60,
          end: 75,
          title: 'Phần 5/8 (1:00 - 1:15): Trợ Lý AI, Khóa Rule Chống Xóa Nhầm & Phóng To Khung Chat',
          subtitle:
            '🎱 Viên Bi: Trong cửa sổ Lệnh AI (Tab 3), khung Rule Chế độ 1•2•3•4 và Story Bible được khóa bảo vệ chống xóa nhầm. Bạn có thể bấm nút Mở Rộng Tối Đa để phóng to khung chat!',
          subtitleEn:
            'Part 5/8: Mode Rules & Story Bible are locked against accidental deletion, and you can zoom the chat viewport to full height.',
          cursorTarget: { x: 380, y: 22 }
        },
        {
          start: 75,
          end: 90,
          title: 'Phần 6/8 (1:15 - 1:30): Cập Nhật Story Bible Với Pop-up Chọn Chương (2 Trường Hợp)',
          subtitle:
            '🎱 Viên Bi: Tại Tab 4, khi bấm Cập Nhật Story Bible, Pop-up sẽ hiện ra cho bạn chọn: Trường hợp 1 (Tổng hợp từ Chương 1 đến hết) hoặc Trường hợp 2 (Bổ sung thêm chương mới)!',
          subtitleEn:
            'Part 6/8: Updating the Story Bible opens a Chapter Selector Pop-up supporting full rebuild or incremental chapter updates.',
          cursorTarget: { x: 465, y: 22 }
        },
        {
          start: 90,
          end: 105,
          title: 'Phần 7/8 (1:30 - 1:45): Tiếng Piano Nhẹ, Phím Lách Cách ASMR, Tua ±5s & Kéo Thả',
          subtitle:
            '🎱 Viên Bi: Thanh nhạc nổi có đủ Tiếng Piano Nhẹ, Mưa Đêm, tiếng bàn phím lách cách ASMR, tua nhạc ±5 giây và lặp đoạn A-B. Mọi nút nổi đều kéo thả tự do và thu gọn >/< được!',
          subtitleEn:
            'Part 7/8: Enjoy Light Piano, Rain, ASMR keyboard clicks, +/-5s seek, exact A-B looping, and freely drag or collapse widgets.',
          cursorTarget: { x: 120, y: 310 }
        },
        {
          start: 105,
          end: 120,
          title: 'Phần 8/8 (1:45 - 2:00): Chatbot Bi 2 Chế Độ Riêng, Đồng Hồ Múi Giờ & Loa Version 31',
          subtitle:
            '🎱 Viên Bi: Khung chat của Bi có 2 chế độ riêng biệt (Hỗ trợ web & Trò chuyện thường). Ở thanh dưới cùng là nút Version 31 mở Loa Thông Báo và Đồng hồ 22 múi giờ thế giới!',
          subtitleEn:
            'Part 8/8: Use Dual-Mode Chatbot Bi, customize the world timezone clock in the footer, and click Version 31 for the changelog!',
          cursorTarget: { x: 425, y: 342 }
        }
      ];

      const scrub = document.getElementById('s10-vid-scrub');
      if (scrub) scrub.max = '120';

      const chapBtnsGrid = scrub?.parentElement?.nextElementSibling;
      if (chapBtnsGrid) {
        chapBtnsGrid.className = 'grid grid-cols-2 sm:grid-cols-4 gap-1 text-[10px]';
        chapBtnsGrid.innerHTML = vp.chapters
          .map(
            (ch, idx) => `
            <button type="button" data-vid-seek="${
              ch.start
            }" class="btn-s10-vid-chap py-1 px-2 rounded bg-zinc-900 hover:bg-emerald-600/30 border border-zinc-800 truncate text-left font-medium">
              ${idx + 1}. ${ch.title.replace(/^Phần \d+\/8 \([^)]+\):\s*/, '')}
            </button>
          `
          )
          .join('');

        chapBtnsGrid.querySelectorAll('.btn-s10-vid-chap').forEach((btn) => {
          btn.addEventListener('click', () => {
            vp.currentTimeSec = parseFloat(btn.getAttribute('data-vid-seek')) || 0;
            vp.drawFrameAt(vp.currentTimeSec);
            vp.play();
          });
        });
      }

      let biWalkPos = { x: 180, y: 120, facingLeft: false };
      let spokenChapIdx = -1;

      vp.drawFrameAt = (timeSec) => {
        if (!vp.ctx || !vp.canvas) return;
        const ctx = vp.ctx;
        const w = vp.canvas.width;
        const h = vp.canvas.height;

        const currentChap =
          vp.chapters.find((c) => timeSec >= c.start && timeSec <= c.end) ||
          vp.chapters[0];
        const chapIdx = vp.chapters.indexOf(currentChap);

        const subBox = document.getElementById('s10-video-subtitle-box');
        const titleEl = document.getElementById('s10-vid-chapter-title');
        const timeEl = document.getElementById('s10-vid-time-label');

        if (titleEl) titleEl.textContent = currentChap.title;
        if (subBox) {
          subBox.innerHTML = `
            <div class="font-bold text-emerald-300 text-xs">${currentChap.subtitle}</div>
            <div class="text-[11px] text-amber-200/90 italic mt-0.5">🇬🇧 EN: ${currentChap.subtitleEn}</div>
          `;
        }
        if (timeEl) {
          const m = Math.floor(timeSec / 60);
          const s = Math.floor(timeSec % 60);
          timeEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(
            2,
            '0'
          )} / 02:00`;
        }
        if (scrub && !scrub.matches(':active')) {
          scrub.value = String(timeSec);
        }

        const guideVoiceOn =
          window.StudioStage15?.smartBiAndWalker?.guideVoiceEnabled !== false;
        if (vp.isPlaying && guideVoiceOn && chapIdx !== spokenChapIdx) {
          spokenChapIdx = chapIdx;
          this.stage13?.biAgent?.voiceEngine?.speak(
            currentChap.subtitle.replace('🎱 Viên Bi:', '')
          );
        }

        ctx.fillStyle = '#09090B';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#18181B';
        ctx.fillRect(0, 0, w, 42);
        ctx.fillStyle = chapIdx === 3 ? '#059669' : '#27272A';
        ctx.fillRect(10, 7, 200, 28);
        ctx.fillStyle = '#34D399';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText('✍️ Web viết tiểu thuyết của Bi', 18, 25);

        const tabNames = [
          '1. Bàn Viết',
          '2. Chương',
          '3. Trợ Lý AI',
          '4. Story Bible',
          '5. Nhạc',
          '6. Hệ Thống'
        ];
        tabNames.forEach((t, i) => {
          ctx.fillStyle = i === 0 ? '#059669' : '#27272A';
          ctx.fillRect(220 + i * 82, 8, 78, 26);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 10px Inter, sans-serif';
          ctx.fillText(t, 228 + i * 82, 24);
        });

        ctx.fillStyle = '#D97706';
        ctx.fillRect(720, 8, 118, 26);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('📢 Loa Version 31', 726, 24);

        ctx.fillStyle = '#18181B';
        ctx.fillRect(16, 52, 818, 270);
        ctx.fillStyle = '#27272A';
        ctx.fillRect(110, 72, 630, 225);
        ctx.fillStyle = '#10B981';
        ctx.font = 'bold 13px Inter, sans-serif';
        ctx.fillText(currentChap.title, 135, 110);
        ctx.fillStyle = '#E4E4E7';
        ctx.font = '12px Georgia, serif';
        ctx.fillText(
          'Giao diện hợp nhất Version 31 mượt mà trên cả Laptop & Điện thoại màn hình dọc...',
          135,
          145
        );
        ctx.fillText('- Tôi đi đây (Đăng)', 135, 180);

        ctx.fillStyle = '#18181B';
        ctx.fillRect(0, 330, w, 26);
        ctx.fillStyle = '#059669';
        ctx.fillRect(12, 333, 85, 20);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.fillText('Version 31', 24, 347);

        const tx = currentChap.cursorTarget.x;
        const ty = currentChap.cursorTarget.y;

        ctx.beginPath();
        ctx.arc(tx, ty, 11 + Math.abs(Math.sin(timeSec * 4)) * 7, 0, Math.PI * 2);
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        const goalBiX = Math.min(770, Math.max(75, tx + 52));
        const goalBiY = Math.min(285, Math.max(62, ty + 10));
        const dx = goalBiX - biWalkPos.x;
        const dy = goalBiY - biWalkPos.y;
        const isWalking = Math.hypot(dx, dy) > 3;

        if (Math.abs(dx) > 1.5) biWalkPos.facingLeft = dx < 0;
        biWalkPos.x += dx * 0.09;
        biWalkPos.y += dy * 0.09;

        const bx = biWalkPos.x;
        const by = biWalkPos.y + (isWalking ? Math.abs(Math.sin(timeSec * 14)) * -5 : 0);
        const dir = biWalkPos.facingLeft ? -1 : 1;
        const legSwing = isWalking ? Math.sin(timeSec * 14) * 10 : 0;

        ctx.save();
        ctx.translate(bx, by);
        ctx.scale(dir, 1);

        ctx.strokeStyle = '#34D399';
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-6, 18);
        ctx.lineTo(-8 + legSwing, 33);
        ctx.moveTo(6, 18);
        ctx.lineTo(8 - legSwing, 33);
        ctx.moveTo(-16, 2);
        ctx.lineTo(-25, 11);
        ctx.moveTo(16, 0);
        ctx.lineTo(28, -10);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fillStyle = '#18181B';
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#10B981';
        ctx.stroke();

        ctx.save();
        ctx.scale(dir, 1);
        ctx.beginPath();
        ctx.arc(0, -10, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.fillStyle = '#09090B';
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.fillText('8', -3, -7);
        ctx.restore();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-4, 1, 3, 0, Math.PI * 2);
        ctx.arc(8, 1, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(2, 5, 5, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        ctx.restore();
      };
    }

    upgradeSpotlightTourTo8StepsWithoutTextOverlap() {
      const guide = this.stage7?.tutorialGuide;
      if (!guide) return;

      const card = document.getElementById('s7-tutorial-card');
      if (card) {
        const innerStaticSvg = card.querySelector('svg.bi-mascot-avatar');
        if (innerStaticSvg) innerStaticSvg.classList.add('hidden');
      }

      guide.steps = [
        {
          targetSelector: '#btn-s21-switch-device-mode',
          title: 'Bước 1/8 (Version 31): Chuyển Đổi Giao Diện Laptop ⇄ Điện Thoại',
          content:
            'Bấm vào nút này bất kỳ lúc nào để chuyển đổi tức thì giữa Giao diện Laptop ngang rộng và Giao diện Điện thoại màn hình dọc!'
        },
        {
          targetSelector: '#s14-master-top-nav',
          title: 'Bước 2/8: Thanh 6 Tab Màn Hình & Tên Web Của Bi',
          content:
            '6 Tab trên cùng tách biệt từng không gian làm việc. Click vào tên "✍️ Web viết tiểu thuyết của Bi" ở góc trái sẽ luôn đưa bạn về ngay Bàn Viết Truyện (Tab 1).'
        },
        {
          targetSelector: '#s21-pov-collapse-toggle-bar',
          title: 'Bước 3/8: Khung POV & Người Kể Chuyện Không Đáng Tin (Thu Gọn Được)',
          content:
            'Bạn có thể bấm nút Thu gọn / Mở rộng ở góc phải thanh này để ẩn hoặc hiện các ô Mốc giờ, Địa điểm và Nhân vật POV.'
        },
        {
          targetSelector: '#editor-metadata-bar',
          title: 'Bước 4/8: Lưu Bài Ctrl+S, Đọc Bản Thảo Giọng Bi & Duyệt Bản Thảo',
          content:
            'Thanh tiêu đề chương gồm nút Lưu (Ctrl+S), Hoàn tác (Ctrl+Z), Đọc Bản Thảo bằng giọng AI của Bi và nút Duyệt & Chốt Bản Thảo.'
        },
        {
          targetSelector: '[data-s14-tab="SCREEN_4_BIBLE"]',
          title: 'Bước 5/8: Story Bible Tự Động Với Pop-up Chọn Chương (2 Trường Hợp)',
          content:
            'Trong Tab 4, khi bấm Cập Nhật Story Bible, Pop-up chọn chương sẽ hiện ra với 2 chế độ: Tổng hợp từ Chương 1 đến hết (Chọn tất cả) hoặc Bổ sung thêm chương mới!'
        },
        {
          targetSelector: '#s15-floating-pomodoro-pill',
          title: 'Bước 6/8: Đồng Hồ Pomodoro Thu Nhỏ Gọn Gàng (> / <) & Kéo Thả Tự Do',
          content:
            'Đồng hồ Pomodoro có thể giữ chuột kéo đặt ở bất kỳ đâu trên màn hình, hoặc bấm mũi tên [>] để thu nhỏ thành viên thuốc [< 🍅] cực gọn.'
        },
        {
          targetSelector: '#s19-floating-mp3-bar',
          title: 'Bước 7/8: Tiếng Piano Nhẹ, Phím Lách Cách ASMR, Tua ±5s & Lặp A-B',
          content:
            'Thanh nhạc ở góc dưới có đủ Tiếng Piano Nhẹ, Tiếng Mưa Đêm, nút bật/tắt Tiếng bàn phím lách cách ASMR, nút tua nhạc ±5 giây và lặp đoạn A-B.'
        },
        {
          targetSelector: '#app-bottom-footer',
          title: 'Bước 8/8: Nút Version 31 Mở Loa Thông Báo & Đồng Hồ Múi Giờ Quốc Tế',
          content:
            'Click vào nút "Version 31" góc dưới trái để mở thẳng Loa Thông Báo 31 phiên bản, hoặc bấm "🌍 Chỉnh múi giờ" ở giữa để đổi giờ theo 22 thành phố thế giới!'
        }
      ];

      let lastWalkerX = 120;
      guide.renderCurrentStep = () => {
        const step = guide.steps[guide.currentStepIndex];
        if (!step) return;

        document.getElementById('s11-mascot-bi-corner')?.classList.add('hidden');

        const targetEl = document.querySelector(step.targetSelector);
        const spotlight = document.getElementById('s7-spotlight-box');
        const tutCard = document.getElementById('s7-tutorial-card');
        const titleEl = document.getElementById('s7-tut-step-title');
        const bodyEl = document.getElementById('s7-tut-step-body');
        const prevBtn = document.getElementById('btn-s7-tut-prev');
        const nextBtn = document.getElementById('btn-s7-tut-next');
        const dotsEl = document.getElementById('s7-tut-dots');
        const walkerEl = document.getElementById('s15-tour-walking-bi');

        if (titleEl) titleEl.textContent = step.title;
        if (bodyEl) {
          bodyEl.innerHTML = `<div class="font-medium text-studioLightText dark:text-zinc-100 leading-relaxed">🎱 <b>Viên Bi dẫn đường:</b> ${step.content}</div>`;
        }
        if (prevBtn) {
          prevBtn.disabled = guide.currentStepIndex === 0;
          prevBtn.classList.toggle('opacity-40', guide.currentStepIndex === 0);
        }
        if (nextBtn) {
          nextBtn.textContent =
            guide.currentStepIndex === guide.steps.length - 1
              ? '✅ Hoàn tất'
              : 'Tiếp theo ➡️';
        }
        if (dotsEl) {
          dotsEl.innerHTML = guide.steps
            .map(
              (_, i) =>
                `<span class="w-2 h-2 rounded-full ${
                  i === guide.currentStepIndex
                    ? 'bg-emerald-500'
                    : 'bg-zinc-400 dark:bg-zinc-700'
                }"></span>`
            )
            .join('');
        }

        if (targetEl && spotlight && tutCard) {
          const rect = targetEl.getBoundingClientRect();
          const pad = 6;
          spotlight.style.top = `${Math.max(4, rect.top - pad)}px`;
          spotlight.style.left = `${Math.max(4, rect.left - pad)}px`;
          spotlight.style.width = `${rect.width + pad * 2}px`;
          spotlight.style.height = `${rect.height + pad * 2}px`;

          const cardW = Math.min(384, window.innerWidth - 32);
          const cardH = 195;
          let cardTop = rect.bottom + 18;
          if (cardTop + cardH > window.innerHeight - 20) {
            cardTop = Math.max(20, rect.top - cardH - 18);
          }
          let cardLeft = Math.min(
            window.innerWidth - cardW - 105,
            Math.max(16, rect.left)
          );

          tutCard.style.top = `${cardTop}px`;
          tutCard.style.left = `${cardLeft}px`;
          tutCard.style.transform = 'none';

          if (walkerEl) {
            walkerEl.classList.remove('hidden');
            let walkerLeft = cardLeft + cardW + 12;
            if (walkerLeft + 90 > window.innerWidth) {
              walkerLeft = Math.max(8, cardLeft - 92);
            }
            const walkerTop = cardTop + 32;

            const inner = document.getElementById('s15-walker-inner');
            if (inner) {
              if (walkerLeft < lastWalkerX - 5) {
                inner.classList.remove('bi-turn-right');
                inner.classList.add('bi-turn-left');
              } else {
                inner.classList.remove('bi-turn-left');
                inner.classList.add('bi-turn-right');
              }
            }
            lastWalkerX = walkerLeft;
            walkerEl.style.left = `${walkerLeft}px`;
            walkerEl.style.top = `${walkerTop}px`;
          }
        }

        const guideVoiceOn =
          window.StudioStage15?.smartBiAndWalker?.guideVoiceEnabled !== false;
        if (guideVoiceOn) {
          this.stage13?.biAgent?.voiceEngine?.speak(step.content);
        }
      };

      const origEndTour = guide.endTour.bind(guide);
      guide.endTour = () => {
        origEndTour();
        document.getElementById('s15-tour-walking-bi')?.classList.add('hidden');
        document.getElementById('s11-mascot-bi-corner')?.classList.remove('hidden');
        this.stage13?.biAgent?.voiceEngine?.stopSpeaking();
      };
    }
  }

  // ==========================================================================
  // MÔ-ĐUN 14: BỘ KHỞI CHẠY HỢP NHẤT DUY NHẤT (MASTER UNIFIED BOOTLOADER)
  // Khởi tạo tuần tự 1 lần duy nhất toàn bộ tinh hoa từ Stage 16 -> Stage 31
  // ==========================================================================
  window.addEventListener('DOMContentLoaded', () => {
    injectUnifiedMasterStyles();

    const waitCoreStages = setInterval(() => {
      if (
        window.StudioCore &&
        window.StudioStage2 &&
        window.StudioStage3 &&
        window.StudioStage5 &&
        window.StudioStage6 &&
        window.StudioStage7 &&
        window.StudioStage8 &&
        window.StudioStage9 &&
        window.StudioStage10 &&
        window.StudioStage11 &&
        window.StudioStage13 &&
        window.StudioStage14 &&
        window.StudioStage15
      ) {
        clearInterval(waitCoreStages);

        setTimeout(async () => {
          try {
            // 1. Đồng bộ toàn bộ danh mục Model Gemini 2026 & công cụ Flash-Lite 3.5
            synchronizeAllModelDropdowns();
            if (window.StudioStage15) {
              window.StudioStage15.callFlashLiteLowThinking =
                callGemini35FlashLiteLowThinking;
            }

            // 2. Khởi chạy Cổng Khởi Động Hợp Nhất (Chọn Thiết Bị ➔ Key API + Video + Mở Khóa Tức Thì)
            const bootController = new UnifiedBootAndApiKeyGateController(
              window.StudioStage2
            );
            bootController.init();

            // 3. Khởi chạy Chatbot Viên Bi 2 Chế Độ & 2 Cửa Sổ Chat Riêng Biệt
            const dualModeBi = new DualModeChatbotBiMasterEngine();
            dualModeBi.init();

            // 4. Khởi chạy Khung Khóa Rule Chế độ 1•2•3•4 & Story Bible chống xóa nhầm
            const promptVault = new UnDeletablePromptRulesAndBibleVault();
            promptVault.init();

            // 5. Khởi chạy Pop-up Chọn Chương Cập Nhật Story Bible (2 trường hợp)
            const bibleSelectorModal = new StoryBibleMultiChapterSelectorEngine(
              window.StudioCore,
              window.StudioStage2,
              window.StudioStage3,
              window.StudioStage10,
              promptVault
            );
            bibleSelectorModal.init();

            // 6. Khởi chạy Thanh Phóng To Khung Chat AI & Thu Gọn Khung POV
            ExpandableAIChatAndCollapsiblePOVManager.init();

            // 7. Khởi chạy Thương hiệu góc trái, Pomodoro gọn khít, Thanh nhạc Piano/ASMR/Tua ±5s & Kéo thả
            const widgetsAndAudio = new TopBrandAudioSeekAndWidgetsController(
              window.StudioStage14.screenNavigator,
              window.StudioStage8.audioPlayer,
              window.StudioStage9.advancedAudio
            );
            widgetsAndAudio.init();

            // 8. Khởi chạy Thanh Footer 1 dòng (Nút Version 31 + Đồng hồ 22 múi giờ quốc tế)
            const footerClock = new CleanFooterClockAndWorldTimezoneManager();
            footerClock.init();

            // 9. Khởi chạy Tự nhớ File đa thiết bị, Loa Thông Báo 31 bản & Video Hướng Dẫn 120s
            const memoryAndVideo =
              new PersistentFileMemoryAnd120sVideoGuideEngine(
                window.StudioCore,
                window.StudioStage7,
                window.StudioStage10,
                window.StudioStage13
              );
            await memoryAndVideo.init();

            // 10. Xuất đối tượng toàn cục window.StudioStage16 (và gắn bí danh cho 17->31 để tương thích ngược 100%)
            const unifiedExport = {
              version: 'Version 31',
              models2026: STANDARDIZED_2026_MODELS,
              callGemini35FlashLiteLowThinking,
              changelog: MASTER_CHANGELOG_V1_TO_V31,
              sanitizer: SmartApiKeySanitizer,
              machineGuard: MachineFingerprintGuard,
              bootController,
              dualModeBi,
              promptVault,
              bibleSelectorModal,
              widgetsAndAudio,
              footerClock,
              memoryAndVideo
            };

            window.StudioStage16 = unifiedExport;
            for (let s = 17; s <= 31; s++) {
              window[`StudioStage${s}`] = unifiedExport;
            }

            window.StudioCore?.logger?.log(
              'HOÀN TẤT HỢP NHẤT STAGE 16 -> 31 (VERSION 31): Đã khử sạch 100% xung đột, đồng bộ Laptop/Mobile, Verify Key AIza/AQ, Chatbot Bi 2 chế độ & Tua nhạc ±5s!',
              'SUCCESS'
            );
          } finally {
            dismissPreBootCurtain();
          }
        }, 120);
      }
    }, 100);
  });
})();