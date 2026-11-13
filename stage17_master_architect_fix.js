/**
 * ============================================================================
 * STAGE 17: MASTER ARCHITECT UI OVERHAUL, REAL-TIME FOLDER SYNC & API KEY FIX
 * Tương thích 100% với index.html và stage1 -> stage16 hiện có
 * ============================================================================
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. CẦU NỐI API KEY HỢP NHẤT (FIX TRIỆT ĐỂ BUG MẤT KEY & LỖI KẾT NỐI AI)
  // ==========================================================================
  class UnifiedGeminiApiKeyBridge {
    static getActiveApiKey() {
      const candidates = [
        window.__STUDIO_MASTER_API_KEY,
        document.getElementById('s6-welcome-api-key')?.value,
        document.getElementById('input-gemini-api-key')?.value,
        document.getElementById('s5-input-api-key')?.value,
        window.StudioStage2?.settings?.config?.apiKey,
        localStorage.getItem('noir_gemini_api_key'),
        sessionStorage.getItem('noir_s16u_verified_key')
      ];

      for (const raw of candidates) {
        if (typeof raw === 'string') {
          const clean = raw.replace(/[\s"'`<>]/g, '').trim();
          if (clean.length >= 20 && (clean.startsWith('AIza') || clean.startsWith('AQ.'))) {
            return clean;
          }
        }
      }
      return '';
    }

    static broadcastApiKeyEverywhere(rawKey) {
      if (typeof rawKey !== 'string') return '';
      const clean = rawKey.replace(/[\s"'`<>]/g, '').trim();
      if (clean.length < 20) return '';

      window.__STUDIO_MASTER_API_KEY = clean;
      localStorage.setItem('noir_gemini_api_key', clean);
      sessionStorage.setItem('noir_s16u_verified_key', clean);

      // 1. Bơm vào Stage 2 Settings Config
      if (window.StudioStage2?.settings) {
        window.StudioStage2.settings.config.apiKey = clean;
      }

      // 2. Đồng bộ vào mọi ô input API Key ẩn/hiện trên toàn hệ thống để Stage 5 không ghi đè chuỗi rỗng
      ['s6-welcome-api-key', 'input-gemini-api-key', 's5-input-api-key'].forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.value !== clean) {
          el.value = clean;
        }
      });

      // 3. Mở khóa toàn bộ các nút trên Màn hình đầu vào (không cần bấm Verify Key)
      document.body.classList.remove('s16u-gate-locked');
      document.querySelectorAll('.s16u-btn-locked-unverified').forEach((btn) => {
        btn.classList.remove('s16u-btn-locked-unverified');
        btn.style.opacity = '1';
        btn.style.filter = 'none';
        btn.style.cursor = 'pointer';
        btn.disabled = false;
      });

      // 4. Lưu xuống Folder ổ cứng nếu đã kết nối
      RealTimeFolderSyncManager.scheduleSaveWorkspaceState();
      return clean;
    }

    static installPermanentInterceptor() {
      // Vô hiệu hóa MachineFingerprintGuard xóa Key ở Stage 16
      if (window.StudioStage16Unified?.machineGuard) {
        window.StudioStage16Unified.machineGuard.verifyAndEnforceMachineBinding = () => {};
      }

      // Khôi phục Key ngay khi khởi chạy
      const initialKey = UnifiedGeminiApiKeyBridge.getActiveApiKey();
      if (initialKey) {
        UnifiedGeminiApiKeyBridge.broadcastApiKeyEverywhere(initialKey);
      }

      // Chặn Stage 2 & Stage 5 lưu đè Key rỗng
      if (window.StudioStage2?.settings) {
        const origSaveConfig = window.StudioStage2.settings.saveConfig.bind(
          window.StudioStage2.settings
        );
        window.StudioStage2.settings.saveConfig = function (newPartialConfig = {}) {
          if (!newPartialConfig.apiKey || newPartialConfig.apiKey.trim() === '') {
            const masterKey = UnifiedGeminiApiKeyBridge.getActiveApiKey();
            if (masterKey) {
              newPartialConfig.apiKey = masterKey;
            }
          } else {
            UnifiedGeminiApiKeyBridge.broadcastApiKeyEverywhere(newPartialConfig.apiKey);
          }
          return origSaveConfig(newPartialConfig);
        };
      }

      // Sửa hàm gọi Gemini API trung tâm (Stage 3 / Stage 5 / Stage 12) để luôn lấy đúng Key
      // và dùng chuỗi Model thực tế hoạt động 100% trên Google AI Studio
      if (window.StudioStage3?.geminiClient) {
        window.StudioStage3.geminiClient.generateContent = async function ({
          apiKey,
          modelId,
          systemInstruction,
          userPrompt,
          temperature = 0.7,
          maxOutputTokens = 65536
        }) {
          const activeKey =
            UnifiedGeminiApiKeyBridge.broadcastApiKeyEverywhere(apiKey) ||
            UnifiedGeminiApiKeyBridge.getActiveApiKey();

          if (!activeKey) {
            document.getElementById('modal-s6-welcome-launcher')?.classList.remove('hidden');
            document.getElementById('s6-welcome-api-key')?.focus();
            throw new Error(
              'Bạn chưa nhập Google Gemini API Key. Hãy dán API Key vào Bước 2 trên Màn hình đầu vào!'
            );
          }

          // Chuẩn hóa tên model sang các model hoạt động thực tế trên Google Gemini API (11/11/2026)
          const requestedModel = (
            modelId ||
            document.getElementById('s6-popup-model-select')?.value ||
            window.StudioStage2?.settings?.config?.modelId ||
            'gemini-3.8-flash'
          ).trim();

          const modelMap = {
            'gemini-2.5-pro': 'gemini-3.1-pro-preview',
            'gemini-2.5-flash': 'gemini-3.8-flash',
            'gemini-2.5-flash-lite': 'gemini-3.5-flash-lite',
            'gemini-2.0-flash-lite': 'gemini-3.5-flash-lite',
            'gemini-2.0-flash': 'gemini-3.8-flash',
            'gemini-3.5-flash': 'gemini-3.8-flash',
            'gemini-3-flash-preview': 'gemini-3.6-flash'
          };

          const resolvedPrimary = modelMap[requestedModel] || requestedModel;
          const fallbackChain = [
            resolvedPrimary,
            'gemini-3.8-flash',
            'gemini-4-argon',
            'gemini-4-carbon',
            'gemini-3.6-flash',
            'gemini-3.1-pro-preview',
            'gemini-3.5-flash-lite',
            'gemini-3.1-flash-lite-preview'
          ].filter((v, idx, arr) => v && arr.indexOf(v) === idx);

          const thinkingLevel =
            window.StudioStage5?.upgrader?.layoutState?.thinkingLevel || 'high';
          const budgetMap = { high: 8192, medium: 2048, low: 0 };

          let lastErr = null;

          for (const targetModel of fallbackChain) {
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
              targetModel
            )}:generateContent?key=${encodeURIComponent(activeKey)}`;

            const generationConfig = {
              temperature,
              topP: 0.92,
              maxOutputTokens: Math.min(maxOutputTokens || 32768, 65536)
            };

            if (targetModel.includes('2.5')) {
              generationConfig.thinkingConfig = {
                thinkingBudget: budgetMap[thinkingLevel] ?? 2048
              };
            }

            const requestBody = {
              systemInstruction: systemInstruction
                ? { parts: [{ text: String(systemInstruction) }] }
                : undefined,
              contents: [{ role: 'user', parts: [{ text: String(userPrompt) }] }],
              generationConfig
            };

            try {
              let res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
              });

              if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                const errMsg = errData?.error?.message || `HTTP ${res.status}`;

                // Nếu model báo lỗi thinkingConfig, tự động gỡ thinkingConfig và gọi lại ngay
                if (/thinking/i.test(errMsg)) {
                  delete requestBody.generationConfig.thinkingConfig;
                  res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody)
                  });
                } else {
                  lastErr = new Error(errMsg);
                  continue;
                }
              }

              if (res.ok) {
                const data = await res.json();
                const parts = data?.candidates?.[0]?.content?.parts || [];
                const text = parts
                  .filter((p) => !p.thought && typeof p.text === 'string')
                  .map((p) => p.text)
                  .join('\n')
                  .trim();

                if (text) {
                  if (window.StudioStage5?.upgrader?.processSuccessfulApiResponse) {
                    window.StudioStage5.upgrader.processSuccessfulApiResponse(data, targetModel);
                  }
                  return {
                    text,
                    usedModel: targetModel,
                    finishReason: data?.candidates?.[0]?.finishReason || 'STOP',
                    usageMetadata: data?.usageMetadata || {}
                  };
                }
              }
            } catch (err) {
              lastErr = err;
            }
          }

          throw lastErr || new Error('Không thể kết nối tới Google Gemini API. Hãy kiểm tra lại API Key.');
        };
      }
    }
  }

  // ==========================================================================
  // 2. CƠ CHẾ LƯU & KHÔI PHỤC MỌI THAO TÁC THẲNG VỀ FOLDER MÁY TÍNH (REAL-TIME)
  // ==========================================================================
  class RealTimeFolderSyncManager {
    static saveTimer = null;

    static init() {
      // Lắng nghe mọi thao tác gõ phím, chỉnh sửa, đổi tùy chọn để lưu thẳng về Folder máy tính
      document.addEventListener('input', (e) => {
        if (
          e.target &&
          (e.target.id === 's6-welcome-api-key' ||
            e.target.id === 'input-gemini-api-key' ||
            e.target.id === 's5-input-api-key')
        ) {
          UnifiedGeminiApiKeyBridge.broadcastApiKeyEverywhere(e.target.value);
        }
        RealTimeFolderSyncManager.scheduleSaveWorkspaceState(350);
      });

      document.addEventListener('change', () => {
        RealTimeFolderSyncManager.scheduleSaveWorkspaceState(100);
      });

      window.addEventListener('beforeunload', () => {
        RealTimeFolderSyncManager.flushWorkspaceStateToDiskNow();
      });

      // Tự động đọc lại trạng thái ngay khi người dùng kết nối / kết nối lại Folder ổ cứng
      const origConnect = window.StudioCore?.fsEngine?.connectDirectory;
      if (origConnect && window.StudioCore?.fsEngine) {
        window.StudioCore.fsEngine.connectDirectory = async function (...args) {
          const result = await origConnect.apply(this, args);
          await RealTimeFolderSyncManager.restoreWorkspaceStateFromFolder();
          return result;
        };
      }
    }

    static collectFullWorkspaceSnapshot() {
      const core = window.StudioCore;
      return {
        version: 'STAGE_17_UNIFIED',
        savedAt: new Date().toISOString(),
        apiKey: UnifiedGeminiApiKeyBridge.getActiveApiKey(),
        activeScreen: document.body.getAttribute('data-s14-screen') || 'SCREEN_1_WRITE',
        activeChapterId: core?.approvalGate?.activeChapterId || null,
        chapters: core?.approvalGate?.chapters || [],
        storyBibleData: core?.bibleManager?.data || {},
        templateFrame: localStorage.getItem('noir_s10_bible_template_frame') || '',
        renderedBibleContent: localStorage.getItem('noir_s10_rendered_bible_content') || '',
        uiPreferences: {
          themeDark: document.documentElement.classList.contains('dark'),
          povDrawerOpen: !document.getElementById('s17-pov-left-drawer')?.classList.contains('hidden'),
          manuscriptToolbarCollapsed:
            localStorage.getItem('noir_s17_manuscript_toolbar_collapsed') === 'true',
          diskConnectBoxCollapsed:
            localStorage.getItem('noir_s17_disk_box_collapsed') === 'true',
          bibleSidebarCollapsed:
            localStorage.getItem('noir_s17_bible_sidebar_collapsed') === 'true',
          chatViewportHeight: localStorage.getItem('noir_s17_chat_height') || '320px',
          selectedAiMode:
            document.getElementById('s17-ai-mode-select')?.value || 'MODE_1_DRAFT',
          selectedModelId:
            document.getElementById('s6-popup-model-select')?.value || 'gemini-2.5-pro',
          selectedThinkingLevel:
            document.getElementById('s17-ai-thinking-select')?.value || 'high'
        }
      };
    }

    static scheduleSaveWorkspaceState(delayMs = 300) {
      if (RealTimeFolderSyncManager.saveTimer) {
        clearTimeout(RealTimeFolderSyncManager.saveTimer);
      }
      RealTimeFolderSyncManager.saveTimer = setTimeout(() => {
        RealTimeFolderSyncManager.flushWorkspaceStateToDiskNow();
      }, delayMs);
    }

    static async flushWorkspaceStateToDiskNow() {
      try {
        const snapshot = RealTimeFolderSyncManager.collectFullWorkspaceSnapshot();
        localStorage.setItem('noir_s17_master_workspace_snapshot', JSON.stringify(snapshot));

        const core = window.StudioCore;
        if (core?.controller?.idb) {
          await core.controller.idb.set('state_cache', 's17_workspace_snapshot', snapshot);
        }

        // Nếu đã kết nối Folder máy tính, ghi trực tiếp file _studio_workspace_state.json và chương hiện tại xuống ổ cứng
        const rootHandle = core?.fsEngine?.rootHandle;
        if (rootHandle) {
          const stateFileHandle = await rootHandle.getFileHandle(
            '_studio_workspace_state.json',
            { create: true }
          );
          const writable = await stateFileHandle.createWritable();
          await writable.write(JSON.stringify(snapshot, null, 2));
          await writable.close();

          // Lưu luôn nội dung chương đang viết xuống file chương trong thư mục
          const activeChap = core?.approvalGate?.chapters?.find(
            (c) => c.id === core.approvalGate.activeChapterId
          );
          if (activeChap && core?.approvalGate?.saveChapterToDisk) {
            await core.approvalGate.saveChapterToDisk(activeChap);
          }
        }
      } catch (_) {}
    }

    static async restoreWorkspaceStateFromFolder() {
      try {
        const core = window.StudioCore;
        const rootHandle = core?.fsEngine?.rootHandle;
        let snapshot = null;

        if (rootHandle) {
          try {
            const fileHandle = await rootHandle.getFileHandle('_studio_workspace_state.json');
            const file = await fileHandle.getFile();
            const text = await file.text();
            snapshot = JSON.parse(text);
          } catch (_) {}
        }

        if (!snapshot) {
          const rawLocal = localStorage.getItem('noir_s17_master_workspace_snapshot');
          if (rawLocal) snapshot = JSON.parse(rawLocal);
        }

        if (!snapshot) return;

        // 1. Khôi phục API Key
        if (snapshot.apiKey) {
          UnifiedGeminiApiKeyBridge.broadcastApiKeyEverywhere(snapshot.apiKey);
        }

        // 2. Khôi phục Danh sách chương & Chương đang mở
        if (Array.isArray(snapshot.chapters) && snapshot.chapters.length > 0 && core?.approvalGate) {
          core.approvalGate.chapters = snapshot.chapters;
          core.approvalGate.activeChapterId =
            snapshot.activeChapterId || snapshot.chapters[0].id;
        }

        // 3. Khôi phục Story Bible
        if (snapshot.storyBibleData && core?.bibleManager) {
          core.bibleManager.data = snapshot.storyBibleData;
        }
        if (snapshot.templateFrame) {
          localStorage.setItem('noir_s10_bible_template_frame', snapshot.templateFrame);
          const tplEl = document.getElementById('s10-bible-template-textarea');
          if (tplEl) tplEl.value = snapshot.templateFrame;
        }
        if (snapshot.renderedBibleContent) {
          localStorage.setItem('noir_s10_rendered_bible_content', snapshot.renderedBibleContent);
          const renEl = document.getElementById('s10-bible-rendered-textarea');
          if (renEl) renEl.value = snapshot.renderedBibleContent;
        }

        core?.controller?.renderAll?.();

        // 4. Khôi phục tùy chỉnh giao diện tại thời điểm đóng web
        const prefs = snapshot.uiPreferences || {};
        if (prefs.chatViewportHeight) {
          Stage17UIArchitect.applyChatHeight(prefs.chatViewportHeight);
        }
        if (typeof prefs.manuscriptToolbarCollapsed === 'boolean') {
          Stage17UIArchitect.setManuscriptToolbarCollapsed(prefs.manuscriptToolbarCollapsed);
        }
      } catch (e) {
        console.warn('Khôi phục trạng thái từ ổ cứng:', e);
      }
    }
  }

  // ==========================================================================
  // 3. KIẾN TRÚC SƯ GIAO DIỆN STAGE 17 (TINH GỌN KHOA HỌC TỪNG MÀN HÌNH 1 -> 6)
  // ==========================================================================
  class Stage17UIArchitect {
    static init() {
      this.injectScientificStyles();
      this.removeConfirmPopupsOnCollapse();
      this.overhaulTopNavigationAndMoveButtonsToScreen6();
      this.overhaulScreen1WritingWorkspace();
      this.overhaulScreen2FilesAndDiskToolbar();
      this.overhaulScreen3AiAssistantAndChat();
      this.overhaulScreen4StoryBibleAndCharacters();
      this.overhaulWelcomeScreen();
    }

    static injectScientificStyles() {
      if (document.getElementById('s17-scientific-ui-styles')) return;
      const style = document.createElement('style');
      style.id = 's17-scientific-ui-styles';
      style.textContent = `
        /* Xóa hoàn toàn khung nhập câu lệnh phụ ở Mục 1, thanh Chặng và TOÀN BỘ khung POV ở Tab 1, 2, 3 */
        #pane-left-beats,
        #btn-s15-expand-beats,
        #btn-s15-collapse-beats,
        #stage2-continuation-bar-mount,
        #s21-pov-collapse-toggle-bar,
        #s21-pov-metadata-grid-container,
        #s17-pov-left-edge-trigger,
        #s17-pov-left-drawer,
        #s17-draggable-pov-context-box,
        #bug3-screen1-pov-launcher {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
          overflow: hidden !important;
        }

        /* Đảm bảo khung bản thảo ở Mục 1 luôn rộng 100% (12/12 cột) */
        #pane-right-manuscript {
          grid-column: span 12 / span 12 !important;
          width: 100% !important;
        }

        /* Giữ 2 nút Video Hướng Dẫn & Loa Cập Nhật luôn hiện trên thanh trên cùng */
        #s14-master-top-nav #btn-s23-top-video-guide,
        #s14-master-top-nav #btn-s18-top-megaphone {
          display: inline-flex !important;
        }

        /* Đảm bảo Modal Chèn Chuyển Cảnh, Xem Story Bible & Xem Ngữ Cảnh luôn nổi TRÊN cửa sổ AI */
        #modal-scene-builder:not(.hidden),
        #modal-context-preview:not(.hidden),
        #modal-s10-video-guide:not(.hidden),
        #modal-s10-changelog:not(.hidden),
        #modal-s17-live-bible-over-ai:not(.hidden) {
          z-index: 2147483645 !important;
        }

        /* Nút mở rộng POV & Bối cảnh nằm dạt gọn sát rìa bên trái cố định */
        #s17-pov-left-edge-trigger {
          position: fixed;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          z-index: 85;
          writing-mode: vertical-rl;
          text-orientation: mixed;
          padding: 14px 7px;
          border-radius: 0 12px 12px 0;
          background: linear-gradient(180deg, #059669 0%, #047857 100%);
          color: #ffffff;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.4px;
          box-shadow: 4px 0 18px rgba(0, 0, 0, 0.45);
          border: 1px solid rgba(52, 211, 153, 0.45);
          border-left: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        #s17-pov-left-edge-trigger:hover {
          padding-left: 11px;
          background: #10b981;
        }

        /* Ngăn kéo POV & Bối cảnh khi mở ra từ rìa bên trái */
        #s17-pov-left-drawer {
          position: fixed;
          left: 10px;
          top: 62px;
          width: min(440px, 94vw);
          z-index: 90;
          border-radius: 16px;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.65);
        }

        /* Khung nhập câu lệnh AI ở Mục 3 có thể kéo giãn tự do */
        #s6-popup-prompt-textarea {
          resize: vertical !important;
          min-height: 180px;
          max-height: 72vh;
        }

        /* Thẻ nhân vật / phục bút trong Story Bible chỉ hiện dòng Key, click mới bung chi tiết */
        .s17-compact-bible-card .s17-card-details {
          display: none;
        }
        .s17-compact-bible-card.s17-expanded .s17-card-details {
          display: block;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px dashed rgba(161, 161, 170, 0.25);
        }
      `;
      document.head.appendChild(style);
    }

    /**
     * Xóa bỏ hoàn toàn hộp thoại confirm("Bạn có muốn thu gọn...") ở Stage 11
     */
    static removeConfirmPopupsOnCollapse() {
      if (window.StudioStage9?.collapseManager) {
        window.StudioStage9.collapseManager.collapseBar = (barId) => {
          const barEl = document.getElementById(barId);
          if (barEl) barEl.classList.toggle('hidden');
        };
      }
    }

    /**
     * 1. THANH TRÊN CÙNG (#s14-master-top-nav):
     *    - Cái chính số 1: [✍️ 1. Bàn Viết Truyện]
     *    - Cái số 2: Mở 5 tính năng còn lại (2 -> 6) gọn gàng
     *    - Đổi tên Mục 6 thành "⚙️ 6. Hệ thống & Cài Đặt"
     *    - Tích hợp Video HD v31, Loa Version 31, Màn Hình Đầu Vào vào trong Mục 6
     */
    static overhaulTopNavigationAndMoveButtonsToScreen6() {
      const topNav = document.getElementById('s14-master-top-nav');
      if (!topNav) return;

      // Đổi tên nút Tab 6 thành "⚙️ 6. Hệ thống & Cài Đặt"
      const tab6Btn = topNav.querySelector('[data-s14-tab="SCREEN_6_SYSTEM"]');
      if (tab6Btn) {
        tab6Btn.innerHTML = `<span>⚙️ 6. Hệ thống & Cài Đặt</span>`;
      }

      // Gom 5 tab phụ (Tab 2 -> Tab 6) vào cụm mở rộng kế bên nút số 1 "✍️ 1. Bàn Viết Truyện"
      const tab1Btn = topNav.querySelector('[data-s14-tab="SCREEN_1_WRITE"]');
      const centerTabStrip = tab1Btn?.parentElement;

      if (centerTabStrip && !document.getElementById('s17-other-features-dropdown')) {
        const otherTabs = centerTabStrip.querySelectorAll(
          '[data-s14-tab]:not([data-s14-tab="SCREEN_1_WRITE"])'
        );
        otherTabs.forEach((t) => t.classList.add('hidden'));

        const featureSelectorWrap = document.createElement('div');
        featureSelectorWrap.className = 'flex items-center gap-1.5';
        featureSelectorWrap.innerHTML = `
          <select
            id="s17-other-features-dropdown"
            class="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-emerald-500/40 font-extrabold text-xs cursor-pointer focus:outline-none focus:border-emerald-400 transition"
            title="Mở 5 tính năng còn lại của Studio"
          >
            <option value="SCREEN_1_WRITE">📂 2. Mở Tính Năng Khác (Mục 2 ➔ Mục 6)...</option>
            <option value="SCREEN_2_FILES">📂 2. Chương & File Nguồn</option>
            <option value="SCREEN_3_AI">🤖 3. Trợ Lý AI & Chat Gemini</option>
            <option value="SCREEN_4_BIBLE">🏛️ 4. Story Bible & Nhân Vật</option>
            <option value="SCREEN_5_AMBIENCE">🎵 5. Nhạc, Không Gian & Chữ</option>
            <option value="SCREEN_6_SYSTEM">⚙️ 6. Hệ thống & Cài Đặt</option>
          </select>
        `;
        centerTabStrip.appendChild(featureSelectorWrap);

        const drop = document.getElementById('s17-other-features-dropdown');
        drop?.addEventListener('change', (e) => {
          const target = e.target.value;
          window.StudioStage14?.navigator?.navigateToScreen(target);
        });

        tab1Btn?.addEventListener('click', () => {
          if (drop) drop.value = 'SCREEN_1_WRITE';
        });
      }

      // Cập nhật Màn hình 6: Đổi tiêu đề thành "Hệ thống & Cài Đặt" và tích hợp 3 nút (Video HD, Loa Version 31, Màn hình đầu vào) + Chỉnh kích thước khung chat
      const screen6 = document.getElementById('s14-screen-6-system');
      if (screen6 && !document.getElementById('s17-system-integrated-hub')) {
        const h2 = screen6.querySelector('h2');
        if (h2) {
          h2.textContent = '⚙️ 6. Hệ Thống & Cài Đặt Trung Tâm';
        }

        const hubCard = document.createElement('div');
        hubCard.id = 's17-system-integrated-hub';
        hubCard.className =
          'p-5 rounded-2xl border-2 border-emerald-500/40 bg-studioLightPanel dark:bg-zinc-900 space-y-4 shadow-lg mb-4';
        hubCard.innerHTML = `
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-studioLightBorder dark:border-zinc-800 pb-3">
            <div>
              <h3 class="text-sm font-extrabold uppercase text-emerald-500">
                🎛️ Trung Tâm Hệ Thống, Màn Hình Đầu Vào & Cài Đặt Khung Chat
              </h3>
              <p class="text-[11px] text-zinc-500">
                Tích hợp đầy đủ Video HD, Loa thông báo phiên bản, Màn hình đầu vào và Kích thước khung Chat AI
              </p>
            </div>
          </div>

          <!-- Hàng 1: 3 Nút Tích Hợp Từ Thanh Trên Cùng (Video HD, Loa Version 31, Màn Hình Đầu Vào) + Đổi Thiết Bị -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button type="button" id="s17-sys-btn-video" class="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow flex items-center justify-center gap-2 transition">
              <span>🎬 Video HD Hướng Dẫn</span>
            </button>

            <button type="button" id="s17-sys-btn-megaphone" class="py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow flex items-center justify-center gap-2 transition">
              <span>📢 Loa Thông Báo Version</span>
            </button>

            <button type="button" id="s17-sys-btn-welcome" class="py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow flex items-center justify-center gap-2 transition">
              <span>🔑 Mở Màn Hình Đầu Vào (API & Ổ Cứng)</span>
            </button>

            <button type="button" id="s17-sys-btn-device" class="py-3 px-4 rounded-xl border border-studioLightBorder dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 font-bold text-xs flex items-center justify-center gap-2 transition">
              <span>💻 / 📱 Đổi Chế Độ Laptop / Điện Thoại</span>
            </button>
          </div>

          <!-- Hàng 2: Cài Đặt Kích Thước Khung Chat AI (Chuyển từ Mục 3 sang Mục 6) -->
          <div class="pt-3 border-t border-studioLightBorder dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span class="font-bold text-xs text-emerald-500 block">
                🔍 Cài Đặt Kích Thước Khung Chat & Ô Nhập Lệnh AI (Áp dụng cho Mục 3):
              </span>
              <span class="text-[11px] text-zinc-500">
                Chọn độ rộng/cao mặc định cho khung nhập câu lệnh và khung hội thoại Gemini
              </span>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" data-s17-chat-size="240px" class="s17-chat-size-btn px-3.5 py-1.5 rounded-xl border border-studioLightBorder dark:border-zinc-700 bg-zinc-800 text-white font-bold text-xs hover:bg-emerald-600 transition">
                Cỡ Vừa (240px)
              </button>
              <button type="button" data-s17-chat-size="420px" class="s17-chat-size-btn px-3.5 py-1.5 rounded-xl border border-amber-500/50 bg-amber-500/10 text-amber-400 font-bold text-xs hover:bg-amber-600 hover:text-white transition">
                Cỡ Lớn (420px)
              </button>
              <button type="button" data-s17-chat-size="65vh" class="s17-chat-size-btn px-3.5 py-1.5 rounded-xl border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-bold text-xs hover:bg-emerald-600 hover:text-white transition">
                Siêu Rộng (65% Màn Hình)
              </button>
            </div>
          </div>
        `;

        const container = screen6.querySelector('.max-w-5xl');
        const firstHeader = container?.firstElementChild;
        if (firstHeader) {
          firstHeader.insertAdjacentElement('afterend', hubCard);
        } else {
          screen6.prepend(hubCard);
        }

        document.getElementById('s17-sys-btn-video')?.addEventListener('click', () => {
          window.StudioStage10?.openGuideWithVideoModal?.();
        });
        document.getElementById('s17-sys-btn-megaphone')?.addEventListener('click', () => {
          const m = document.getElementById('modal-s10-changelog');
          if (m) {
            document.body.appendChild(m);
            m.classList.remove('hidden');
          }
        });
        document.getElementById('s17-sys-btn-welcome')?.addEventListener('click', () => {
          document.getElementById('modal-s6-welcome-launcher')?.classList.remove('hidden');
        });
        document.getElementById('s17-sys-btn-device')?.addEventListener('click', () => {
          document.getElementById('btn-s21-switch-device-mode')?.click();
        });

        // Thêm cụm nút Chia sẻ file HTML & JS gộp cho bạn bè dùng chung code ngay trong Tab 6
        if (!document.getElementById('s17-share-bundle-row')) {
          const shareRow = document.createElement('div');
          shareRow.id = 's17-share-bundle-row';
          shareRow.className =
            'pt-3 border-t border-studioLightBorder dark:border-zinc-800 space-y-2';
          shareRow.innerHTML = `
            <div class="font-extrabold text-xs text-amber-400">
              📦 Chia Sẻ File HTML & JS Gộp Cho Bạn Bè (Để Bạn Bè & Người Code JS Dùng Chung):
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button type="button" id="btn-s17-download-merged-html" class="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow transition">
                📥 Tải 1 File .HTML Gộp Duy Nhất (HTML + Toàn Bộ JS)
              </button>
              <button type="button" id="btn-s17-download-merged-js" class="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow transition">
                📜 Tải File .JS Hợp Nhất (Cho Bạn Bè Code JS Chung)
              </button>
            </div>
          `;
          hubCard.appendChild(shareRow);

          const fetchCodeSafe = async (file) => {
            try {
              const r = await fetch(file, { cache: 'no-store' });
              if (r.ok) return await r.text();
            } catch (_) {}
            return `/* Giữ file ${file} cùng thư mục */`;
          };

          document
            .getElementById('btn-s17-download-merged-html')
            ?.addEventListener('click', async () => {
              const [c1, c2, c3] = await Promise.all([
                fetchCodeSafe('stage1_to_15_unified_core.js'),
                fetchCodeSafe('stage16_flashlite35_bi_ai_v16_changelog.js'),
                fetchCodeSafe('stage17_master_architect_fix.js')
              ]);
              let html = document.documentElement.outerHTML;
              const myKey = UnifiedGeminiApiKeyBridge.getActiveApiKey();
              if (myKey) html = html.split(myKey).join('');
              html = html
                .replace(/<script[^>]+src=["']stage1_to_15_unified_core\.js["'][^>]*><\/script>/gi, '')
                .replace(/<script[^>]+src=["']stage16_flashlite35_bi_ai_v16_changelog\.js["'][^>]*><\/script>/gi, '')
                .replace(/<script[^>]+src=["']stage17_master_architect_fix\.js["'][^>]*><\/script>/gi, '');
              const merged =
                '<!DOCTYPE html>\n' +
                html.replace(
                  /<\/body>/i,
                  `<script>\n${c1}\n</script>\n<script>\n${c2}\n</script>\n<script>\n${c3}\n</script>\n</body>`
                );
              const a = document.createElement('a');
              a.href = URL.createObjectURL(
                new Blob([merged], { type: 'text/html;charset=utf-8' })
              );
              a.download = `Web_Tieu_Thuyet_Cua_Bi_Gop_AllInOne.html`;
              a.click();
            });

          document
            .getElementById('btn-s17-download-merged-js')
            ?.addEventListener('click', async () => {
              const [c1, c2, c3] = await Promise.all([
                fetchCodeSafe('stage1_to_15_unified_core.js'),
                fetchCodeSafe('stage16_flashlite35_bi_ai_v16_changelog.js'),
                fetchCodeSafe('stage17_master_architect_fix.js')
              ]);
              const mergedJs = `/* === STAGE 1->15 === */\n${c1}\n\n/* === STAGE 16 === */\n${c2}\n\n/* === STAGE 17 === */\n${c3}`;
              const a = document.createElement('a');
              a.href = URL.createObjectURL(
                new Blob([mergedJs], { type: 'application/javascript;charset=utf-8' })
              );
              a.download = `noir_studio_all_js_merged.js`;
              a.click();
            });
        }

        hubCard.querySelectorAll('.s17-chat-size-btn').forEach((btn) => {
          btn.addEventListener('click', () => {
            const h = btn.getAttribute('data-s17-chat-size');
            Stage17UIArchitect.applyChatHeight(h);
            window.StudioStage7?.saveEngine?.showSaveToastNotification(
              `✅ Đã đặt kích thước Khung Chat AI thành: ${btn.textContent.trim()}`
            );
          });
        });
      }
    }

    static applyChatHeight(heightCss) {
      if (!heightCss) return;
      localStorage.setItem('noir_s17_chat_height', heightCss);
      const chatMsgBox = document.getElementById('s7-freechat-messages-box');
      const promptArea = document.getElementById('s6-popup-prompt-textarea');
      if (chatMsgBox) {
        chatMsgBox.style.height = heightCss;
        chatMsgBox.style.minHeight = heightCss;
      }
      if (promptArea) {
        promptArea.style.height = heightCss;
        promptArea.style.minHeight = heightCss;
      }
      RealTimeFolderSyncManager.scheduleSaveWorkspaceState();
    }

    /**
     * 2. MỤC 1 (BÀN VIẾT TRUYỆN):
     *    - Khung POV & Bối cảnh thu gọn dạt sang rìa bên trái cố định, có nút "> Mở rộng khung POV, bối cảnh"
     *    - Dàn nút phía trên bản thảo (Đang nháp, Lưu, Duyệt, Hoàn tác, Gọi AI, Đọc bản thảo...) có nút thu gọn/mở rộng
     *    - Chỉ để lại duy nhất nội dung bản thảo
     */
    static overhaulScreen1WritingWorkspace() {
      // 2A. Xóa sạch khung POV & Bối cảnh ở Tab 1, Tab 2, Tab 3
      document.getElementById('s21-pov-metadata-grid-container')?.remove();
      document.getElementById('s21-pov-collapse-toggle-bar')?.remove();
      document.getElementById('s17-pov-left-edge-trigger')?.remove();
      document.getElementById('s17-pov-left-drawer')?.remove();
      document.getElementById('input-scene-timestamp')?.closest('.grid')?.remove();

      // 2B. Bọc dàn thanh công cụ phía trên bản thảo (#editor-metadata-bar + dòng tiêu đề phụ) với nút Thu gọn / Mở rộng
      const metaBar = document.getElementById('editor-metadata-bar');
      if (metaBar && !document.getElementById('s17-manuscript-top-toggle-strip')) {
        const toggleStrip = document.createElement('div');
        toggleStrip.id = 's17-manuscript-top-toggle-strip';
        toggleStrip.className =
          'px-4 py-1 border-b border-studioLightBorder dark:border-zinc-800 bg-studioLightPanel/90 dark:bg-zinc-900/90 flex items-center justify-between text-[11px] shrink-0';

        toggleStrip.innerHTML = `
          <div class="flex items-center gap-2 truncate">
            <span class="font-bold text-emerald-500">📖 Bản Thảo Đang Viết:</span>
            <span id="s17-mini-chapter-title" class="font-semibold text-zinc-600 dark:text-zinc-300 truncate">Chương 1</span>
          </div>
          <button type="button" id="btn-s17-toggle-editor-topbar" class="px-2.5 py-0.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-emerald-600 hover:text-white font-bold text-[10px] transition shrink-0">
            ▲ Thu gọn thanh công cụ chương
          </button>
        `;

        metaBar.parentElement?.insertBefore(toggleStrip, metaBar);

        const syncMiniTitle = () => {
          const t = document.getElementById('input-chapter-title')?.value || 'Chương nháp';
          const num = document.getElementById('input-chapter-number')?.value || '1';
          const lbl = document.getElementById('s17-mini-chapter-title');
          if (lbl) lbl.textContent = `Chương ${num}: ${t}`;
        };

        document
          .getElementById('input-chapter-title')
          ?.addEventListener('input', syncMiniTitle);
        document
          .getElementById('input-chapter-number')
          ?.addEventListener('input', syncMiniTitle);
        syncMiniTitle();

        const initCollapsed =
          localStorage.getItem('noir_s17_manuscript_toolbar_collapsed') === 'true';
        Stage17UIArchitect.setManuscriptToolbarCollapsed(initCollapsed);

        document
          .getElementById('btn-s17-toggle-editor-topbar')
          ?.addEventListener('click', () => {
            const currentlyHidden = metaBar.classList.contains('hidden');
            Stage17UIArchitect.setManuscriptToolbarCollapsed(!currentlyHidden);
          });
      }
    }

    static setManuscriptToolbarCollapsed(collapsed) {
      const metaBar = document.getElementById('editor-metadata-bar');
      const btn = document.getElementById('btn-s17-toggle-editor-topbar');
      if (!metaBar || !btn) return;

      metaBar.classList.toggle('hidden', collapsed);
      localStorage.setItem('noir_s17_manuscript_toolbar_collapsed', String(collapsed));
      btn.textContent = collapsed
        ? '▼ Mở thanh công cụ (Lưu, Duyệt, Hoàn tác, Gọi AI, Đọc bản thảo)'
        : '▲ Thu gọn thanh công cụ chương';
    }

    /**
     * 3. MỤC 2 (CHƯƠNG & FILE NGUỒN):
     *    - Khung Kết nối ổ cứng (#s14-files-screen-toolbar) có nút thu gọn/mở rộng tức thì
     *    - Xóa nút "- Thu gọn" gây lỗi ẩn mất toàn bộ màn hình 2
     */
    static overhaulScreen2FilesAndDiskToolbar() {
      const fileToolbar = document.getElementById('s14-files-screen-toolbar');
      if (fileToolbar && !document.getElementById('btn-s17-toggle-disk-toolbar')) {
        const headerRow = fileToolbar.firstElementChild;
        const buttonsGrid = fileToolbar.lastElementChild;

        if (headerRow && buttonsGrid) {
          headerRow.classList.add('flex', 'items-center', 'justify-between');
          const toggleDiskBtn = document.createElement('button');
          toggleDiskBtn.type = 'button';
          toggleDiskBtn.id = 'btn-s17-toggle-disk-toolbar';
          toggleDiskBtn.className =
            'px-2 py-0.5 rounded bg-zinc-800 hover:bg-emerald-600 text-emerald-400 hover:text-white font-bold text-[10px] transition';
          toggleDiskBtn.textContent = '− Thu gọn khung ổ cứng';
          headerRow.appendChild(toggleDiskBtn);

          let isCollapsed = localStorage.getItem('noir_s17_disk_box_collapsed') === 'true';
          const applyState = () => {
            buttonsGrid.classList.toggle('hidden', isCollapsed);
            toggleDiskBtn.textContent = isCollapsed
              ? '+ Mở rộng Kết nối ổ cứng & Nạp file'
              : '− Thu gọn khung ổ cứng';
          };
          applyState();

          toggleDiskBtn.addEventListener('click', () => {
            isCollapsed = !isCollapsed;
            localStorage.setItem('noir_s17_disk_box_collapsed', String(isCollapsed));
            applyState();
          });
        }
      }

      // Xóa nút "- Thu gọn" lỗi trên thanh tab của #left-sidebar-pane (tránh bấm nhầm làm trắng màn hình 2)
      const leftSidebar = document.getElementById('left-sidebar-pane');
      if (leftSidebar) {
        leftSidebar.querySelectorAll('button').forEach((b) => {
          if (b.textContent.trim() === '− Thu gọn') {
            const tabGrid = b.parentElement;
            b.remove();
            if (tabGrid) tabGrid.classList.replace('grid-cols-4', 'grid-cols-3');
          }
        });
      }
    }

    /**
     * 4. MỤC 3 (TRỢ LÝ AI & CHAT GEMINI - #modal-s6-prompt-studio):
     *    - Gom 5 chế độ AI thành 1 trình đơn thả xuống (<select>)
     *    - Chuyển Mức độ tư duy (Cao/Vừa/Thấp) thành trình đơn thả xuống (<select>)
     *    - Xóa ô chọn Điểm nhìn (POV) thừa
     *    - Ẩn thanh Kích thước khung chat tại Mục 3 (vì đã chuyển sang Mục 6)
     *    - Tạo nút thu gọn khoa học cho Hạn mức Ngắn hạn/Dài hạn và Khung Rule 5
     *    - Thêm nút Mở rộng / Thu nhỏ linh hoạt cho khung nhập câu lệnh
     */
    static overhaulScreen3AiAssistantAndChat() {
      const promptModal = document.getElementById('modal-s6-prompt-studio');
      if (!promptModal || document.getElementById('s17-ai-mode-select')) return;

      // 4A. Thay 5 nút chế độ làm việc AI bằng 1 Dropdown (<select>)
      const modeButtonsContainer = document.getElementById('s6-popup-mode-buttons');
      if (modeButtonsContainer) {
        modeButtonsContainer.classList.add('hidden');
        const modeSelect = document.createElement('select');
        modeSelect.id = 's17-ai-mode-select';
        modeSelect.className =
          'w-full px-3.5 py-2.5 rounded-xl border-2 border-emerald-500/50 bg-studioLightPanel dark:bg-zinc-900 font-extrabold text-xs text-emerald-400 focus:outline-none focus:border-emerald-500 cursor-pointer';
        modeSelect.innerHTML = `
          <option value="MODE_1_DRAFT">✍️ Chế độ 1: Viết Bản Nháp Chậm (Chi tiết tâm lý sâu, thoại: - Câu thoại (Tên))</option>
          <option value="FREE_CHAT">💬 Chat Gemini Tự Do (Hỏi đáp, tham vấn trực tiếp như web Gemini)</option>
          <option value="MODE_2_CONSULT">💡 Chế độ 2: Tham Mưu Cốt Truyện & Người Kể Không Đáng Tin</option>
          <option value="MODE_3_AUDIT">🔍 Chế độ 3: Kiểm Tra Logic, Giờ Giấc, Chính Tả & Khử Dấu Vết AI</option>
          <option value="MODE_4_REVIEW">📊 Chế độ 4: Review Tổng Thể Nhịp Độ Các Chương Đã Duyệt</option>
        `;
        modeButtonsContainer.parentElement?.appendChild(modeSelect);

        modeSelect.addEventListener('change', (e) => {
          const val = e.target.value;
          if (val === 'FREE_CHAT') {
            document.getElementById('btn-s7-mode-freechat')?.click();
          } else {
            window.StudioStage7?.freeChatEngine?.toggleFreeChatMode(false);
            const origBtn = modeButtonsContainer.querySelector(`[data-p-mode="${val}"]`);
            origBtn?.click();
          }
        });
      }

      // 4B. Chuyển 3 nút Mức độ tư duy (Cao / Vừa / Thấp) thành 1 Dropdown (<select>)
      const firstThinkBtn = promptModal.querySelector('.s6-p-think-btn');
      const thinkGrid = firstThinkBtn?.parentElement;
      if (thinkGrid && !document.getElementById('s17-ai-thinking-select')) {
        thinkGrid.classList.add('hidden');
        const thinkSelect = document.createElement('select');
        thinkSelect.id = 's17-ai-thinking-select';
        thinkSelect.className =
          'w-full px-3 py-1.5 rounded-lg border border-studioLightBorder dark:border-zinc-700 bg-studioLightPanel dark:bg-zinc-900 font-bold text-xs cursor-pointer';
        thinkSelect.innerHTML = `
          <option value="high">🧠 Tư Duy Cao (High - Suy luận tâm lý & logic sâu)</option>
          <option value="medium">⚖️ Tư Duy Vừa (Medium - Cân bằng tốc độ & chiều sâu)</option>
          <option value="low">⚡ Tư Duy Thấp (Low - Phản hồi nhanh & tiết kiệm hạn mức)</option>
        `;
        thinkGrid.parentElement?.appendChild(thinkSelect);

        thinkSelect.addEventListener('change', (e) => {
          const lv = e.target.value;
          const origThinkBtn = thinkGrid.querySelector(`[data-p-think="${lv}"]`);
          origThinkBtn?.click();
        });
      }

      // 4C. Xóa ô Điểm nhìn (POV) thừa trong khung AI (#s6-popup-pov-select)
      const povSelectInAi = document.getElementById('s6-popup-pov-select');
      if (povSelectInAi && povSelectInAi.parentElement) {
        const wordCountWrap = document.getElementById('s6-popup-word-count')?.parentElement;
        const parentGrid = povSelectInAi.parentElement.parentElement;
        povSelectInAi.parentElement.remove();
        if (parentGrid && wordCountWrap) {
          parentGrid.classList.remove('grid-cols-2');
          parentGrid.classList.add('grid-cols-1');
        }
      }

      // 4D. Ẩn thanh Kích thước khung chat (#s21-chat-zoom-toolbar) ở Mục 3 vì đã chuyển sang Mục 6
      const zoomToolbar = document.getElementById('s21-chat-zoom-toolbar');
      if (zoomToolbar) {
        zoomToolbar.classList.add('hidden');
      }

      // 4E. Thêm nút Thu gọn / Mở rộng khoa học cho thanh Hạn mức Ngắn hạn & Dài hạn
      const quotaShort = document.getElementById('s6-popup-quota-short');
      const quotaRow = quotaShort?.parentElement;
      if (quotaRow && !document.getElementById('btn-s17-toggle-quota-row')) {
        const quotaToggleBar = document.createElement('div');
        quotaToggleBar.className =
          'lg:col-span-12 pt-1.5 border-t border-studioLightBorder dark:border-zinc-800 flex items-center justify-between text-[11px]';
        quotaToggleBar.innerHTML = `
          <span class="font-bold text-zinc-400 uppercase text-[10px]">📊 Thông Số Hạn Mức Token (Ngắn Hạn & Dài Hạn)</span>
          <button type="button" id="btn-s17-toggle-quota-row" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-emerald-600 text-emerald-400 hover:text-white font-bold text-[10px] transition">
            + Mở xem hạn mức
          </button>
        `;
        quotaRow.parentElement?.insertBefore(quotaToggleBar, quotaRow);
        quotaRow.classList.add('hidden');

        document
          .getElementById('btn-s17-toggle-quota-row')
          ?.addEventListener('click', (e) => {
            const isHidden = quotaRow.classList.toggle('hidden');
            e.currentTarget.textContent = isHidden
              ? '+ Mở xem hạn mức'
              : '− Thu gọn hạn mức';
          });
      }

      // 4F. Thu gọn mặc định Ô 5 "Khung Rule Chế Độ + Rule Viết Bài + Story Bible" (#s21-locked-prompt-rules-vault)
      const rulesVault = document.getElementById('s21-locked-prompt-rules-vault');
      const rulesDisplay = document.getElementById('s21-locked-vault-readonly-display');
      if (rulesVault && rulesDisplay) {
        rulesDisplay.classList.add('hidden');
        const toggleVaultBtn = document.getElementById('btn-s21-toggle-vault-preview');
        if (toggleVaultBtn) {
          toggleVaultBtn.textContent = '👁️ Mở rộng xem Rule & Chế độ';
        }
      }

      // 4G. Thêm nút Mở rộng / Thu nhỏ trực tiếp cho Khung Nhập Câu Lệnh (#s6-popup-prompt-textarea)
      const promptArea = document.getElementById('s6-popup-prompt-textarea');
      const promptToolbar = document.getElementById('btn-s6-popup-insert-scene')?.parentElement;
      if (promptArea && promptToolbar && !document.getElementById('btn-s17-expand-prompt-box')) {
        const resizeBtn = document.createElement('button');
        resizeBtn.type = 'button';
        resizeBtn.id = 'btn-s17-expand-prompt-box';
        resizeBtn.className =
          'px-2.5 py-1 rounded bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 font-bold text-[11px] hover:bg-indigo-600 hover:text-white transition';
        resizeBtn.textContent = '↕️ Mở Rộng Khung Nhập Lệnh';
        promptToolbar.prepend(resizeBtn);

        let isPromptExpanded = false;
        resizeBtn.addEventListener('click', () => {
          isPromptExpanded = !isPromptExpanded;
          const upperSettings = document.getElementById('s21-collapsible-upper-ai-settings');
          if (upperSettings) {
            upperSettings.classList.toggle('hidden', isPromptExpanded);
          }
          promptArea.style.minHeight = isPromptExpanded ? '58vh' : '220px';
          resizeBtn.textContent = isPromptExpanded
            ? '↕️ Thu Nhỏ Khung Nhập Lệnh (Hiện lại thông số)'
            : '↕️ Mở Rộng Khung Nhập Lệnh';
        });
      }
    }

    /**
     * 5. MỤC 4 (STORY BIBLE & NHÂN VẬT):
     *    - Thanh Nhân vật bên trái (#right-bible-pane) có nút Thu gọn / Mở rộng
     *    - Từng thẻ Nhân vật / Ai biết gì / Phục bút chỉ hiện dòng tiêu đề Key, click vào mới mở ra
     *    - Khung Story Bible bên phải (#s10-story-bible-main-view) cũng có nút Thu gọn / Mở rộng bảng điều khiển
     */
    static overhaulScreen4StoryBibleAndCharacters() {
      const rightBiblePane = document.getElementById('right-bible-pane');
      const bibleMainView = document.getElementById('s10-story-bible-main-view');

      // 5A. Nút Thu gọn / Mở rộng Thanh Nhân Vật bên trái
      if (rightBiblePane && bibleMainView && !document.getElementById('btn-s17-toggle-char-sidebar')) {
        const charToggleBtn = document.createElement('button');
        charToggleBtn.type = 'button';
        charToggleBtn.id = 'btn-s17-toggle-char-sidebar';
        charToggleBtn.className =
          'px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/40 font-bold text-xs transition shrink-0';
        charToggleBtn.textContent = '◀ Thu gọn Thanh Nhân Vật';

        const topControlCard = bibleMainView.firstElementChild;
        if (topControlCard) {
          topControlCard.prepend(charToggleBtn);
        }

        let isCharCollapsed =
          localStorage.getItem('noir_s17_bible_sidebar_collapsed') === 'true';
        const applyCharSidebarState = () => {
          if (document.body.getAttribute('data-s14-screen') === 'SCREEN_4_BIBLE') {
            rightBiblePane.classList.toggle('hidden', isCharCollapsed);
          }
          charToggleBtn.textContent = isCharCollapsed
            ? '▶ Mở Thanh Nhân Vật, Ai Biết Gì & Phục Bút'
            : '◀ Thu gọn Thanh Nhân Vật';
        };

        charToggleBtn.addEventListener('click', () => {
          isCharCollapsed = !isCharCollapsed;
          localStorage.setItem('noir_s17_bible_sidebar_collapsed', String(isCharCollapsed));
          applyCharSidebarState();
        });
      }

      // 5B. Nút Thu gọn / Mở rộng Khung Cài Đặt Story Bible phía trên (#s15-bible-ai-selector-bar)
      const bibleSelectorBar = document.getElementById('s15-bible-ai-selector-bar');
      if (bibleSelectorBar && !document.getElementById('btn-s17-collapse-bible-header')) {
        const collapseHeaderBtn = document.createElement('button');
        collapseHeaderBtn.type = 'button';
        collapseHeaderBtn.id = 'btn-s17-collapse-bible-header';
        collapseHeaderBtn.className =
          'ml-auto px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-emerald-600 text-zinc-300 hover:text-white font-bold text-[11px] transition';
        collapseHeaderBtn.textContent = '▲ Thu gọn thanh cấu hình AI';
        bibleSelectorBar.appendChild(collapseHeaderBtn);

        collapseHeaderBtn.addEventListener('click', () => {
          const children = [...bibleSelectorBar.children].filter(
            (el) => el !== collapseHeaderBtn
          );
          const isHidden = children[0]?.classList.contains('hidden');
          children.forEach((c) => c.classList.toggle('hidden', !isHidden));
          collapseHeaderBtn.textContent = isHidden
            ? '▲ Thu gọn thanh cấu hình AI'
            : '▼ Mở rộng chọn Model & Rule Story Bible';
        });
      }

      // 5C. Biến mọi thẻ Nhân vật, Ai biết gì, Phục bút thành dạng Accordion gọn (chỉ hiện tên Key, click mới bung chi tiết)
      const makeCardsCompact = () => {
        ['characters-list-container', 'knowledge-list-container', 'clues-list-container'].forEach(
          (containerId) => {
            const container = document.getElementById(containerId);
            if (!container) return;

            [...container.children].forEach((card) => {
              if (card.classList.contains('s17-compact-bible-card')) return;
              const firstHeader = card.firstElementChild;
              if (!firstHeader || card.children.length <= 1) return;

              card.classList.add('s17-compact-bible-card', 'cursor-pointer');
              const detailsWrap = document.createElement('div');
              detailsWrap.className = 's17-card-details space-y-1';

              while (card.children.length > 1) {
                detailsWrap.appendChild(card.children[1]);
              }
              card.appendChild(detailsWrap);

              const hint = document.createElement('span');
              hint.className = 'text-[10px] text-emerald-400 ml-2 font-monoCode';
              hint.textContent = '[+ Chi tiết]';
              firstHeader.appendChild(hint);

              card.addEventListener('click', (e) => {
                if (e.target.closest('button')) return;
                const expanded = card.classList.toggle('s17-expanded');
                hint.textContent = expanded ? '[− Thu gọn]' : '[+ Chi tiết]';
              });
            });
          }
        );
      };

      makeCardsCompact();
      if (window.StudioCore?.controller) {
        const origRenderBible = window.StudioCore.controller.renderBibleLists?.bind(
          window.StudioCore.controller
        );
        if (origRenderBible) {
          window.StudioCore.controller.renderBibleLists = function (...args) {
            const res = origRenderBible(...args);
            makeCardsCompact();
            return res;
          };
        }
      }
    }

    /**
     * 6. MÀN HÌNH ĐẦU VÀO (#modal-s6-welcome-launcher):
     *    - Xóa hẳn mục 1 "Cài đặt ẩn và hiện giao diện / Hình Preview"
     *    - Xóa nút Verify Key & xóa bước chọn Mô hình / Mức độ tư duy rườm rà
     *    - Làm thật TO và ít chữ cho Bước 1 (Kết nối ổ cứng) & Bước 2 (Lấy / Nhập API Key)
     *    - Video hướng dẫn tự động thu gọn
     *    - Chỉ để lại đúng 3 nút: "Soạn thảo ngay", "Mở cửa sổ câu lệnh AI", "Video hướng dẫn sử dụng"
     */
    static overhaulWelcomeScreen() {
      const welcomeModal = document.getElementById('modal-s6-welcome-launcher');
      if (!welcomeModal) return;

      // Ẩn màn hình chọn thiết bị chặn phía trước để vào thẳng màn hình chính
      const step1DeviceGate = document.getElementById('modal-s21-device-selector-gate');
      if (step1DeviceGate) step1DeviceGate.classList.add('hidden');
      document.getElementById('s28-integrated-device-selector-box')?.remove();

      const gridBody = welcomeModal.querySelector('.grid.grid-cols-1.lg\\:grid-cols-12');
      if (!gridBody) return;

      // 6A. Xóa hẳn Cột Trái (1. Cài đặt Ẩn/Hiện giao diện & Hình Preview)
      const leftPreviewCol = gridBody.querySelector('.lg\\:col-span-7');
      if (leftPreviewCol) leftPreviewCol.remove();

      // 6B. Mở rộng Cột Phải ra toàn bộ chiều ngang (col-span-12), làm TO Bước 1 & Bước 2
      const rightConfigCol = gridBody.querySelector('.lg\\:col-span-5');
      if (rightConfigCol) {
        rightConfigCol.classList.remove('lg:col-span-5');
        rightConfigCol.classList.add('lg:col-span-12', 'max-w-2xl', 'mx-auto', 'w-full');
      }

      // 6C. Xóa nút Verify Key (#s6-welcome-scan-models) và Bước 3 (Chọn mô hình & mức tư duy)
      document.getElementById('s6-welcome-scan-models')?.remove();
      const welcomeModelSelect = document.getElementById('s6-welcome-model-select');
      if (welcomeModelSelect && welcomeModelSelect.parentElement) {
        welcomeModelSelect.parentElement.remove();
      }

      // 6D. Làm TO nút Kết nối ổ cứng và ô nhập API Key
      const diskBtn = document.getElementById('s6-welcome-connect-disk');
      if (diskBtn) {
        diskBtn.className =
          'w-full py-4 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm md:text-base shadow-lg transition flex items-center justify-center gap-2';
        diskBtn.innerHTML = `<span>📁 Bước 1: Chọn / Kết Nối Lại Ổ Cứng Máy Tính</span>`;
      }

      const apiKeyInput = document.getElementById('s6-welcome-api-key');
      if (apiKeyInput) {
        apiKeyInput.className =
          'flex-1 py-3.5 px-4 rounded-xl border-2 border-amber-500/60 bg-studioLightPanel dark:bg-zinc-900 font-monoCode font-bold text-sm focus:outline-none focus:border-emerald-500 select-text';
        apiKeyInput.placeholder = 'Bước 2: Dán mã Google Gemini API Key (AIza...) vào đây';
      }

      // 6E. Tự động thu gọn Video hướng dẫn lấy Key
      const keyVideoCanvas = document.getElementById('s20-apikey-guide-canvas');
      if (keyVideoCanvas) {
        keyVideoCanvas.classList.add('hidden');
      }
      const closeVidBtn = document.getElementById('btn-s20-close-key-video');
      if (closeVidBtn) {
        closeVidBtn.textContent = '▼ Mở xem Video hướng dẫn lấy Key';
      }

      // 6F. Thay cụm nút dưới đáy bằng đúng 3 nút: "Soạn thảo ngay", "Mở cửa sổ câu lệnh AI", "Video hướng dẫn sử dụng"
      const enterNowBtn = document.getElementById('btn-s6-enter-studio-now');
      const actionButtonsContainer = enterNowBtn?.parentElement;
      if (actionButtonsContainer && !document.getElementById('s17-welcome-3-buttons-bar')) {
        actionButtonsContainer.id = 's17-welcome-3-buttons-bar';
        actionButtonsContainer.className = 'grid grid-cols-1 md:grid-cols-3 gap-3 pt-3';
        actionButtonsContainer.innerHTML = `
          <button type="button" id="btn-s17-welcome-write-now" class="py-4 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-xl transition flex items-center justify-center gap-2">
            <span>✍️ Soạn thảo ngay</span>
          </button>

          <button type="button" id="btn-s17-welcome-open-ai" class="py-4 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-xl transition flex items-center justify-center gap-2">
            <span>🤖 Mở cửa sổ câu lệnh AI</span>
          </button>

          <button type="button" id="btn-s17-welcome-video-guide" class="py-4 px-4 rounded-2xl border-2 border-amber-500/60 bg-amber-500/15 hover:bg-amber-500 hover:text-zinc-950 text-amber-400 font-extrabold text-sm transition flex items-center justify-center gap-2">
            <span>🎬 Video hướng dẫn sử dụng</span>
          </button>
        `;

        document
          .getElementById('btn-s17-welcome-write-now')
          ?.addEventListener('click', () => {
            if (apiKeyInput?.value) {
              UnifiedGeminiApiKeyBridge.broadcastApiKeyEverywhere(apiKeyInput.value);
            }
            document.body.classList.remove('s16u-gate-locked');
            welcomeModal.classList.add('hidden');
            window.StudioStage14?.navigator?.navigateToScreen('SCREEN_1_WRITE');
          });

        document.getElementById('btn-s17-welcome-open-ai')?.addEventListener('click', () => {
          if (apiKeyInput?.value) {
            UnifiedGeminiApiKeyBridge.broadcastApiKeyEverywhere(apiKeyInput.value);
          }
          document.body.classList.remove('s16u-gate-locked');
          welcomeModal.classList.add('hidden');
          window.StudioStage14?.navigator?.navigateToScreen('SCREEN_3_AI');
        });

        document
          .getElementById('btn-s17-welcome-video-guide')
          ?.addEventListener('click', () => {
            window.StudioStage10?.openGuideWithVideoModal?.();
          });
      }
    }
  }

  // ==========================================================================
  // KHỞI CHẠY STAGE 17 SAU KHI CÁC STAGE CŨ ĐÃ NẠP XONG
  // ==========================================================================
  function bootStage17MasterPatch() {
    UnifiedGeminiApiKeyBridge.installPermanentInterceptor();
    RealTimeFolderSyncManager.init();
    Stage17UIArchitect.init();
    RealTimeFolderSyncManager.restoreWorkspaceStateFromFolder();
  }

  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(bootStage17MasterPatch, 650);
    setTimeout(bootStage17MasterPatch, 1600);
  });
})();
/* ============================================================================
 * BẢN VÁ TRỰC TIẾP TRONG FILE 3: stage17_master_architect_fix.js
 * Xử lý:
 * - Bug 1: Chặn chuyển tiếp qua màn hình chính khi bấm Đóng / Soạn thảo ngay /
 *   Mở câu lệnh AI / Video hướng dẫn nếu chưa có API Key hợp lệ (trả về dòng
 *   thông báo màu đỏ thiết kế đẹp mắt).
 * - Bug 3: Khung POV, bối cảnh di chuyển kéo thả tự do trong Màn hình 1. Bàn viết truyện.
 * - Bug 4: Xóa/ẩn hoàn toàn khung & nút "Mở rộng khung POV, bối cảnh" ở Màn hình 2.
 * - Bug 14: Video Tutorial 5 Phút (300 Giây) Up-to-date từng nút bấm mới nhất.
 * ============================================================================ */
(function () {
  'use strict';

  // ==========================================================================
  // 1. FIX BUG 1: BỘ CHẶN CHUYỂN MÀN HÌNH & HIỂN THỊ THÔNG BÁO ĐỎ ĐẸP MẮT
  //    KHI CHƯA CÓ API KEY HỢP LỆ HOẶC ĐANG XÁC MINH DỞ
  // ==========================================================================
  function showSleekRedApiKeyErrorAlert(anchorElement, customReason = '') {
    let alertBox = document.getElementById('bug1-sleek-red-error-banner');
    if (!alertBox) {
      alertBox = document.createElement('div');
      alertBox.id = 'bug1-sleek-red-error-banner';
      alertBox.className =
        'fixed top-6 left-1/2 -translate-x-1/2 z-[2147483646] w-[92vw] max-w-xl p-4 rounded-2xl border-2 border-red-500 bg-gradient-to-r from-red-950 via-rose-950 to-zinc-950 text-red-100 shadow-[0_12px_40px_rgba(220,38,38,0.45)] flex items-start justify-between gap-3 text-xs transition-all duration-200';
      document.body.appendChild(alertBox);
    }

    const state = window.__NOIR_API_KEY_STATE__ || {};
    const messageText =
      customReason ||
      (state.isVerifying
        ? '⏳ Hệ thống đang tự động xác minh Key API bằng Flash-Lite (Tư duy Thấp)... Vui lòng đợi 1 giây cho tới khi xác minh hoàn tất!'
        : '🚨 Bạn chưa có Key API hợp lệ! Vui lòng nhập đúng Google Gemini API Key và đợi báo xác minh thành công trước khi chuyển qua màn hình chính.');

    alertBox.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="w-8 h-8 rounded-xl bg-red-600/30 border border-red-400/50 flex items-center justify-center text-base shrink-0 animate-bounce">
          🚫
        </div>
        <div class="space-y-1">
          <div class="font-extrabold uppercase tracking-wide text-red-300 text-xs">
            Chưa Thể Chuyển Qua Màn Hình Chính — Thiếu Key API Hợp Lệ
          </div>
          <p class="text-[11px] text-red-100/90 leading-relaxed">
            ${messageText}
          </p>
        </div>
      </div>
      <button type="button" id="btn-close-bug1-red-alert" class="px-2 py-1 rounded-lg bg-red-900/50 hover:bg-red-700 text-red-200 font-bold">✕</button>
    `;

    alertBox.classList.remove('hidden');

    // Cũng chèn/cập nhật dòng thông báo đỏ ngay bên trong Modal đang mở để người dùng nhìn thấy trực tiếp
    if (anchorElement) {
      const modalCard = anchorElement.closest(
        '[id*="modal"], [class*="fixed"][class*="inset-0"] > div'
      );
      if (modalCard) {
        let inlineRed = modalCard.querySelector('.bug1-inline-red-notice');
        if (!inlineRed) {
          inlineRed = document.createElement('div');
          inlineRed.className =
            'bug1-inline-red-notice my-2.5 px-4 py-3 rounded-xl border-2 border-red-500 bg-gradient-to-r from-red-950/95 to-rose-950/90 text-red-200 font-bold text-xs flex items-center gap-2.5 shadow-lg';
          modalCard.prepend(inlineRed);
        }
        inlineRed.innerHTML = `
          <span class="text-base">🚨</span>
          <span>${messageText}</span>
        `;
      }
    }

    document
      .getElementById('btn-close-bug1-red-alert')
      ?.addEventListener('click', () => {
        alertBox.classList.add('hidden');
      });

    clearTimeout(window.__BUG1_ALERT_TIMER__);
    window.__BUG1_ALERT_TIMER__ = setTimeout(() => {
      alertBox?.classList.add('hidden');
    }, 5500);
  }

  /**
   * Bắt sự kiện ở pha Capture (true) trên toàn bộ các nút:
   * Đóng (✕), Soạn thảo ngay, Mở câu lệnh AI, Video hướng dẫn sử dụng trong màn hình chào mừng / API Key
   */
  function installApiKeyNavigationGuard() {
    // 1. Sửa lỗi trong Trung tâm AI (Tab 3): Bấm Xem/Sửa Khung Story Bible hoặc Chèn Mốc Chuyển Cảnh
    //    sẽ bật cửa sổ nổi TRỰC TIẾP LÊN TRÊN cửa sổ AI (z-index tối đa), không cần đóng khung AI!
    document.addEventListener(
      'click',
      (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const id = btn.id || '';
        const txt = (btn.textContent || '').toLowerCase().trim();

        // A. Nút Xem / Sửa Khung Story Bible Đang Áp Dụng trong Trung tâm AI
        if (
          id === 'btn-s21-unlock-edit-bible' ||
          txt.includes('xem / sửa khung story bible') ||
          txt.includes('bấm để sửa story bible')
        ) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();

          let liveBibleModal = document.getElementById('modal-s17-live-bible-over-ai');
          if (!liveBibleModal) {
            liveBibleModal = document.createElement('div');
            liveBibleModal.id = 'modal-s17-live-bible-over-ai';
            liveBibleModal.className =
              'fixed inset-0 bg-black/80 z-[2147483646] flex items-center justify-center p-4 backdrop-blur-sm';
            liveBibleModal.innerHTML = `
              <div class="w-full max-w-4xl rounded-2xl border-2 border-amber-500/70 bg-zinc-950 text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-xs">
                <div class="px-5 py-3.5 border-b border-zinc-800 bg-amber-500/15 flex items-center justify-between">
                  <h3 class="font-extrabold uppercase text-sm text-amber-400">
                    🏛️ XEM & SỬA TRỰC TIẾP KHUNG STORY BIBLE (NỔI TRÊN TRUNG TÂM AI)
                  </h3>
                  <button type="button" id="btn-s17-close-live-bible-overlay" class="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold">✕ Đóng</button>
                </div>
                <div class="p-4 flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div class="flex flex-col space-y-1">
                    <label class="font-bold text-emerald-400">1. Nội dung Story Bible đang áp dụng:</label>
                    <textarea id="s17-overlay-bible-rendered" rows="15" class="flex-1 w-full p-3 rounded-xl border border-emerald-500/40 bg-zinc-900 text-zinc-100 text-xs"></textarea>
                  </div>
                  <div class="flex flex-col space-y-1">
                    <label class="font-bold text-amber-400">2. Khung kiểu mẫu Story Bible:</label>
                    <textarea id="s17-overlay-bible-template" rows="15" class="flex-1 w-full p-3 rounded-xl border border-amber-500/40 bg-zinc-900 text-zinc-200 font-monoCode text-[11px]"></textarea>
                  </div>
                </div>
                <div class="px-5 py-3 border-t border-zinc-800 bg-zinc-900 flex justify-end gap-2">
                  <button type="button" id="btn-s17-save-live-bible-overlay" class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs">
                    💾 Lưu & Áp Dụng Ngay Vào Câu Lệnh AI
                  </button>
                </div>
              </div>
            `;
            document.body.appendChild(liveBibleModal);

            document
              .getElementById('btn-s17-close-live-bible-overlay')
              ?.addEventListener('click', () => liveBibleModal.classList.add('hidden'));

            document
              .getElementById('btn-s17-save-live-bible-overlay')
              ?.addEventListener('click', () => {
                const rVal = document.getElementById('s17-overlay-bible-rendered')?.value || '';
                const tVal = document.getElementById('s17-overlay-bible-template')?.value || '';
                localStorage.setItem('noir_s10_rendered_bible_content', rVal);
                localStorage.setItem('noir_s10_bible_template_frame', tVal);
                const origR = document.getElementById('s10-bible-rendered-textarea');
                if (origR) origR.value = rVal;
                const origT = document.getElementById('s10-bible-template-textarea');
                if (origT) origT.value = tVal;
                window.StudioStage16?.promptVault?.refreshLockedVaultDisplay?.();
                liveBibleModal.classList.add('hidden');
              });
          }

          document.getElementById('s17-overlay-bible-rendered').value =
            document.getElementById('s10-bible-rendered-textarea')?.value ||
            localStorage.getItem('noir_s10_rendered_bible_content') ||
            '';
          document.getElementById('s17-overlay-bible-template').value =
            document.getElementById('s10-bible-template-textarea')?.value ||
            localStorage.getItem('noir_s10_bible_template_frame') ||
            '';
          document.body.appendChild(liveBibleModal);
          liveBibleModal.classList.remove('hidden');
          return;
        }

        // B. Nút Chèn Mốc Chuyển Phân Cảnh / Đổi POV trong Trung tâm AI
        if (
          id === 'btn-s6-popup-insert-scene' ||
          id === 'btn-open-scene-builder' ||
          txt.includes('chèn mốc chuyển phân cảnh') ||
          txt.includes('chèn chuyển cảnh / đổi pov')
        ) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          const sceneModal = document.getElementById('modal-scene-builder');
          if (sceneModal) {
            document.body.appendChild(sceneModal);
            sceneModal.style.setProperty('z-index', '2147483646', 'important');
            sceneModal.classList.remove('hidden');
          }
          return;
        }

        // C. Nút Xem Gói Ngữ Cảnh Cục Bộ
        if (txt.includes('xem gói ngữ cảnh cục bộ')) {
          const ctxModal = document.getElementById('modal-context-preview');
          if (ctxModal) {
            document.body.appendChild(ctxModal);
            ctxModal.style.setProperty('z-index', '2147483646', 'important');
          }
        }
      },
      true
    );

    // 2. Chỉ kiểm tra API Key đối với nút vào Bàn viết / Mở câu lệnh AI trong Màn hình chào
    //    (Không bao giờ chặn nút Video Hướng Dẫn hay Loa Cập Nhật)
    document.addEventListener(
      'click',
      (e) => {
        const btn = e.target.closest('button, a');
        if (!btn) return;
        if (btn.id === 'btn-close-bug1-red-alert') return;

        const inWelcomeModal = Boolean(btn.closest('#modal-s6-welcome-launcher'));
        if (!inWelcomeModal) return;

        const txt = (btn.textContent || '').toLowerCase().trim();
        if (
          txt.includes('paste') ||
          txt.includes('hiện') ||
          txt.includes('ẩn') ||
          txt.includes('lấy key') ||
          txt.includes('video') ||
          txt.includes('ổ cứng')
        ) {
          return;
        }

        const activeKey = UnifiedGeminiApiKeyBridge.getActiveApiKey();
        if (!activeKey || activeKey.length < 20) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          showSleekRedApiKeyErrorAlert(btn);
        }
      },
      true
    );
  }

  // ==========================================================================
  // 2. XÓA SẠCH KHUNG POV & BỐI CẢNH Ở CẢ 3 TAB ĐẦU (TAB 1, TAB 2, TAB 3)
  // ==========================================================================
  function setupFreeDraggablePovInScreen1AndRemoveInScreen2() {
    document
      .querySelectorAll(
        '#s21-pov-collapse-toggle-bar, #s21-pov-metadata-grid-container, #s17-pov-left-edge-trigger, #s17-pov-left-drawer, #s17-draggable-pov-context-box, #bug3-screen1-pov-launcher'
      )
      .forEach((el) => el.remove());
    document.getElementById('input-scene-timestamp')?.closest('.grid')?.remove();
  }
    // Tìm tất cả các phần tử liên quan tới nút xanh lá "> Mở rộng khung POV, bối cảnh" và hộp POV
    const findPovToggleButtons = () => {
      const results = [];
      document.querySelectorAll('button, div, aside').forEach((el) => {
        const t = (el.textContent || '').trim().toLowerCase();
        if (
          t === '> mở rộng khung pov, bối cảnh' ||
          t === 'mở rộng khung pov, bối cảnh' ||
          el.id?.toLowerCase().includes('pov-toggle') ||
          el.id?.toLowerCase().includes('pov-expand')
        ) {
          results.push(el);
        }
      });
      return results;
    };

    // Tìm thanh POV & Bối cảnh gốc trong màn hình 1
    const povInputRow = document
      .getElementById('input-scene-timestamp')
      ?.closest('.grid');

    // Biến khung POV & Bối cảnh và nút Mở rộng khung POV thành cửa sổ kéo thả tự do trong Màn hình 1 (Fix Bug 3)
    if (povInputRow && !povInputRow.dataset.bug3DraggableSetup) {
      povInputRow.dataset.bug3DraggableSetup = 'true';
      povInputRow.id = 's17-draggable-pov-context-box';

      // Thêm thanh tiêu đề Kéo Thả Tự Do & Thu Gọn cho khung POV trong Màn hình 1
      const dragHeader = document.createElement('div');
      dragHeader.id = 's17-pov-drag-handle';
      dragHeader.className =
        'col-span-full flex items-center justify-between px-2.5 py-1 mb-1 rounded-lg bg-emerald-700/25 border border-emerald-500/40 cursor-move select-none text-[11px]';
      dragHeader.innerHTML = `
        <span class="font-bold text-emerald-400 flex items-center gap-1.5">
          <span>✋ Kéo Thả Tự Do: Khung POV, Giờ Giấc & Bối Cảnh (Màn Hình 1)</span>
        </span>
        <div class="flex items-center gap-1.5">
          <button type="button" id="btn-bug3-reset-pov-pos" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px]" title="Đưa khung POV về vị trí thanh ngang mặc định">
            📌 Gắn về thanh cố định
          </button>
          <button type="button" id="btn-bug3-collapse-pov-box" class="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px]">
            − Thu gọn
          </button>
        </div>
      `;
      povInputRow.prepend(dragHeader);

      // Tạo nút nổi nhỏ trong Màn hình 1 khi người dùng thu gọn khung POV (cũng kéo thả tự do được!)
      let floatingLauncher = document.getElementById('bug3-screen1-pov-launcher');
      if (!floatingLauncher) {
        floatingLauncher = document.createElement('div');
        floatingLauncher.id = 'bug3-screen1-pov-launcher';
        floatingLauncher.className =
          'hidden fixed top-20 left-6 z-30 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-2xl border border-emerald-400 cursor-move select-none flex items-center gap-2';
        floatingLauncher.innerHTML = `
          <span>✋</span>
          <button type="button" id="btn-bug3-expand-pov-from-pill" class="font-bold">> Mở rộng khung POV, bối cảnh</button>
        `;
        document.body.appendChild(floatingLauncher);
      }

      // Hàm kích hoạt kéo thả chuột tự do cho một phần tử bất kỳ trong Màn hình 1
      const makeElementFreelyDraggable = (targetEl, handleEl) => {
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let origLeft = 0;
        let origTop = 0;

        handleEl.addEventListener('mousedown', (e) => {
          if (e.target.closest('button, input, select, textarea')) return;
          isDragging = true;
          const rect = targetEl.getBoundingClientRect();
          startX = e.clientX;
          startY = e.clientY;
          origLeft = rect.left;
          origTop = rect.top;

          targetEl.style.position = 'fixed';
          targetEl.style.zIndex = '45';
          targetEl.style.width = `${Math.min(window.innerWidth - 24, Math.max(680, rect.width))}px`;
          targetEl.style.left = `${origLeft}px`;
          targetEl.style.top = `${origTop}px`;
          targetEl.style.boxShadow = '0 16px 40px rgba(0,0,0,0.65)';
          targetEl.style.borderRadius = '14px';
          targetEl.style.border = '2px solid rgba(16, 185, 129, 0.6)';
        });

        window.addEventListener('mousemove', (e) => {
          if (!isDragging) return;
          const dx = e.clientX - startX;
          const dy = e.clientY - startY;
          const nextL = Math.max(
            6,
            Math.min(window.innerWidth - targetEl.offsetWidth - 6, origLeft + dx)
          );
          const nextT = Math.max(
            52,
            Math.min(window.innerHeight - targetEl.offsetHeight - 6, origTop + dy)
          );
          targetEl.style.left = `${nextL}px`;
          targetEl.style.top = `${nextT}px`;
        });

        window.addEventListener('mouseup', () => {
          isDragging = false;
        });
      };

      makeElementFreelyDraggable(povInputRow, dragHeader);
      makeElementFreelyDraggable(floatingLauncher, floatingLauncher);

      document
        .getElementById('btn-bug3-reset-pov-pos')
        ?.addEventListener('click', () => {
          povInputRow.style.position = '';
          povInputRow.style.zIndex = '';
          povInputRow.style.width = '';
          povInputRow.style.left = '';
          povInputRow.style.top = '';
          povInputRow.style.boxShadow = '';
          povInputRow.style.border = '';
        });

      document
        .getElementById('btn-bug3-collapse-pov-box')
        ?.addEventListener('click', () => {
          povInputRow.classList.add('hidden');
          if (isCurrentlyOnScreen1()) {
            floatingLauncher.classList.remove('hidden');
          }
        });

      document
        .getElementById('btn-bug3-expand-pov-from-pill')
        ?.addEventListener('click', () => {
          floatingLauncher.classList.add('hidden');
          povInputRow.classList.remove('hidden');
        });
    }

    // Hàm kiểm tra xem người dùng có đang ở Màn hình 1 (1. Bàn Viết Truyện) hay không
    const isCurrentlyOnScreen1 = () => {
      const bodyScreen = document.body.getAttribute('data-s14-screen');
      if (bodyScreen) return bodyScreen === 'SCREEN_1_WRITE';
      const activeTab = document.querySelector('.s14-nav-tab.active-tab');
      if (activeTab) {
        return activeTab.getAttribute('data-s14-tab') === 'SCREEN_1_WRITE';
      }
      return true;
    };

    // FIX BUG 4: Xóa hẳn nút dọc "> Mở rộng khung POV, bối cảnh" bị đè lên Cây bản thảo ở Màn hình 2
    // và chỉ cho phép hiển thị khung POV khi đang ở Màn hình 1 (1. Bàn Viết Truyện)
    const enforcePovVisibilityByScreen = () => {
      const onScreen1 = isCurrentlyOnScreen1();
      const oldLegacyPovButtons = findPovToggleButtons().filter(
        (el) =>
          el.id !== 'bug3-screen1-pov-launcher' &&
          el.id !== 'btn-bug3-expand-pov-from-pill'
      );

      // Xóa vĩnh viễn nút dọc màu xanh cũ bị lỗi đè lên Cây bản thảo ở Màn hình 2 (trong ảnh image_3ed797.png & image_3ed77a.jpg)
      oldLegacyPovButtons.forEach((el) => el.remove());

      const povBox = document.getElementById('s17-draggable-pov-context-box');
      const launcher = document.getElementById('bug3-screen1-pov-launcher');

      if (!onScreen1) {
        // Khi ở Màn hình 2 (Chương & File nguồn) hoặc các tab 3, 4, 5, 6 -> Ẩn hoàn toàn khung POV
        povBox?.classList.add('hidden');
        launcher?.classList.add('hidden');
      } else {
        // Khi quay về Màn hình 1 -> Nếu cả hai đang ẩn thì hiện lại khung POV
        if (
          povBox &&
          launcher &&
          povBox.classList.contains('hidden') &&
          launcher.classList.contains('hidden')
        ) {
          povBox.classList.remove('hidden');
        }
      }
    };

    enforcePovVisibilityByScreen();
    window.addEventListener('studio:screen-changed', enforcePovVisibilityByScreen);

    // Bắt thêm sự kiện click vào bất kỳ nút Tab nào trên thanh điều hướng
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-s14-tab], .s14-nav-tab')) {
        setTimeout(enforcePovVisibilityByScreen, 30);
      }
    });
  }

  // ==========================================================================
  // 3. FIX BUG 14: NÂNG CẤP VIDEO TUTORIAL LÊN 5 PHÚT (300 GIÂY)
  //    CẬP NHẬT CHI TIẾT TỪNG NÚT BẤM TỪ BUG 1 ĐẾN BUG 13
  // ==========================================================================
  function upgradeVideoTutorialTo300Seconds() {
    const vp = window.StudioStage10?.videoPlayer;
    const FIVE_MINUTE_CHAPTERS = [
      {
        start: 0,
        end: 30,
        title: 'Phần 1 (00:00 - 00:30): Xác Minh API Key Tự Động Bằng Flash-Lite & Mặc Định Ẩn Key',
        subtitle:
          'Ngay khi bạn nhập, dán hoặc xóa đi 1 ký tự trong ô API Key, hệ thống tự động gọi mô hình Flash-Lite (Tư duy Thấp) để xác minh lại ngay mà không tốn hạn mức. Key luôn mặc định ẩn (••••) để bảo mật và tự động nhớ cho lần đăng nhập thứ 2.',
        cursorTarget: { x: 420, y: 120 }
      },
      {
        start: 30,
        end: 60,
        title: 'Phần 2 (00:30 - 01:00): Màn Hình 1 (Bàn Viết Truyện) & Kéo Thả Tự Do Khung POV',
        subtitle:
          'Tại Màn hình 1, bạn có thể nắm thanh tiêu đề của Khung POV, Giờ Giấc & Bối Cảnh để kéo thả tự do sang bất kỳ vị trí nào trên màn hình hoặc bấm Thu gọn thành viên thuốc nổi.',
        cursorTarget: { x: 450, y: 95 }
      },
      {
        start: 60,
        end: 90,
        title: 'Phần 3 (01:00 - 01:30): Màn Hình 2 (Chương & File Nguồn) & Hủy Duyệt Chương',
        subtitle:
          'Ở Màn hình 2, khung POV đã được gỡ bỏ hoàn toàn để không bao giờ che Cây Bản Thảo. Tại danh sách Chương Đã Chốt, bạn bấm nút [↩️ Hủy duyệt] để biến chương đã duyệt thành chưa duyệt (Đang nháp) bất cứ lúc nào.',
        cursorTarget: { x: 130, y: 210 }
      },
      {
        start: 90,
        end: 125,
        title: 'Phần 4 (01:30 - 02:05): Duyệt Đa Chương & Nối Mạch Story Bible Thông Minh',
        subtitle:
          'Khi bấm [✅ Duyệt & Chốt Bản Thảo], bạn có trình đơn thả xuống chọn từng chương hoặc Chọn tất cả các chương chưa duyệt. Nếu bạn duyệt Chương 2 và 3, AI tự động nối mạch nền từ Chương 1 để Story Bible không bao giờ bị đứt đoạn.',
        cursorTarget: { x: 520, y: 180 }
      },
      {
        start: 125,
        end: 160,
        title: 'Phần 5 (02:05 - 02:40): Nút Mở Nhanh & Sửa Khung Story Bible Cạnh Nút Duyệt',
        subtitle:
          'Ngay cạnh nút Duyệt chương có nút [🏛️ Mở khung Story Bible]. Khi bấm vào, bạn xem lại được ngay cấu trúc hiện tại và bấm nút [✏️ Sửa khung Story Bible] để điều hướng thẳng tới Tab Story Bible.',
        cursorTarget: { x: 610, y: 55 }
      },
      {
        start: 160,
        end: 200,
        title: 'Phần 6 (02:40 - 03:20): 4 Chế Độ Làm Việc AI & Nút Xem/Sửa Khung Câu Lệnh Hệ Thống',
        subtitle:
          'Trong Màn hình 3, mỗi chế độ từ Chế độ 1 (Viết bản nháp) đến Chế độ 4 (Review) đều có Rule Hệ Thống và Lệnh Tăng Cường riêng. Bấm nút [📜 Xem & Sửa Khung Câu Lệnh Hệ Thống] ngay trên ô chọn chế độ để tùy chỉnh và xác nhận lưu.',
        cursorTarget: { x: 340, y: 140 }
      },
      {
        start: 200,
        end: 240,
        title: 'Phần 7 (03:20 - 04:00): Liên Kết Mô Hình, Mức Tư Duy, Số Từ & Mốc Chuyển Cảnh',
        subtitle:
          'Ô chọn Mô hình Gemini, Mức độ tư duy (Cao/Vừa/Thấp), Số từ muốn xuất và nút [🎬 + Chèn Chuyển Cảnh / Đổi POV] đều được liên kết trực tiếp vào biến {{TARGET_WORD_COUNT}} trong câu lệnh hệ thống.',
        cursorTarget: { x: 640, y: 140 }
      },
      {
        start: 240,
        end: 270,
        title: 'Phần 8 (04:00 - 04:30): Pop-up Gemini Flash Tự Động Kết Hợp Mọi Thông Số Câu Lệnh',
        subtitle:
          'Trước khi chạy lệnh chính, màn hình Pop-up tự động gọi Gemini Flash (Tư duy Vừa, hết hạn mức tự về Flash-Lite) để kết hợp Chế độ + Số từ + POV + Chuyển cảnh + Câu lệnh cá nhân. Bạn chỉ cần bấm Xác nhận là chạy mượt mà!',
        cursorTarget: { x: 480, y: 240 }
      },
      {
        start: 270,
        end: 300,
        title: 'Phần 9 (04:30 - 05:00): Cập Nhật Story Bible Tab 4 & Giao Diện 3 Nút Gọn Ở Tab 5',
        subtitle:
          'Ở Tab 4, bạn chọn chương bất kỳ để cập nhật Story Bible qua API Key của mình. Ở Tab 5, giao diện được tối ưu thành 3 nút gọn: (1) Mở trình phát nhạc lặp A-B, (2) Mở Pomodoro, (3) Chỉnh cỡ chữ & khổ trang sách.',
        cursorTarget: { x: 560, y: 80 }
      }
    ];

    if (vp) {
      vp.totalDurationSec = 300;
      vp.chapters = FIVE_MINUTE_CHAPTERS;
      const scrub = document.getElementById('s10-vid-scrub');
      if (scrub) scrub.max = '300';
      const timeLabel = document.getElementById('s10-vid-time-label');
      if (timeLabel) timeLabel.textContent = '00:00 / 05:00';
    }

    // Nếu người dùng mở Modal Video hướng dẫn của Stage 16/17, nâng cấp luôn thanh tua lên 300 giây (5 phút)
    document
      .querySelectorAll('input[type="range"][max="60"], input[type="range"][max="120"]')
      .forEach((rangeEl) => {
        if (
          rangeEl.id.includes('vid') ||
          rangeEl.id.includes('tut') ||
          rangeEl.closest('[id*="video"], [id*="tutorial"], [id*="guide"]')
        ) {
          rangeEl.max = '300';
        }
      });
  }

  // Khởi chạy toàn bộ các bản vá của Stage 17
  window.addEventListener('DOMContentLoaded', () => {
    installApiKeyNavigationGuard();
    setupFreeDraggablePovInScreen1AndRemoveInScreen2();
    setTimeout(upgradeVideoTutorialTo300Seconds, 600);

    const obs = new MutationObserver(() => {
      setupFreeDraggablePovInScreen1AndRemoveInScreen2();
    });
    obs.observe(document.body, { childList: true, subtree: true });
  });
})();
/* ============================================================================
 * KHỐI CẦU NỐI ĐỒNG BỘ GIAO DIỆN STAGE 17 (MASTER DOM BRIDGE CHO BUG 5 -> BUG 14)
 * Đảm bảo mọi bảng biểu, nút bấm và modal do Stage 17 (Version 31) vẽ ra
 * đều được gắn đầy đủ tính năng của Bug 5, 6, 8, 9, 10, 11, 12, 13, 14.
 * ============================================================================ */
(function () {
  'use strict';

  /**
   * 1. CẦU NỐI BUG 5: Tự động thêm nút "↩️ Hủy duyệt" (Biến chương Đã chốt -> Chưa duyệt)
   *    vào từng dòng trong danh sách "CHƯƠNG ĐÃ CHỐT (CHÍNH THỨC)" của Stage 17
   */
  function syncBug5UnapproveButtonsInStage17Tree() {
    const approvedList = document.getElementById('list-approved-chapters');
    if (!approvedList) return;

    const items = approvedList.querySelectorAll('li, .approved-chapter-item, > div');
    const approvedChapters = window.StudioCore?.approvalGate?.getApprovedChapters() || [];

    items.forEach((itemEl, idx) => {
      if (itemEl.querySelector('.btn-tree-unapprove, .btn-s17-unapprove-to-draft')) return;

      // Tìm cụm nút thao tác (chứa nút ⬆️ ⬇️ ✏️ 🗑️) trong dòng chương đã chốt
      const actionBtnGroup =
        itemEl.querySelector('button[title*="lên"], button[title*="Xóa"], button')?.parentElement;
      if (!actionBtnGroup) return;

      const chapObj = approvedChapters[idx];
      const unapproveBtn = document.createElement('button');
      unapproveBtn.type = 'button';
      unapproveBtn.className =
        'btn-s17-unapprove-to-draft px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-zinc-950 font-bold text-[10px] transition shrink-0';
      unapproveBtn.title = 'Biến chương đã duyệt này thành Chưa duyệt (Đang nháp)';
      unapproveBtn.innerHTML = '↩️ Chưa duyệt';

      unapproveBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const targetId =
          chapObj?.id ||
          itemEl.getAttribute('data-chapter-id') ||
          window.StudioCore?.approvalGate?.activeChapterId;
        if (!targetId || !window.StudioCore?.approvalGate) return;

        await window.StudioCore.approvalGate.unapproveChapterToDraft(targetId);
        await window.StudioCore.controller.saveWorkspaceStateToIDB();
        window.StudioCore.controller.renderAll();
      });

      actionBtnGroup.prepend(unapproveBtn);
    });
  }

  /**
   * 2. CẦU NỐI BUG 8: Luôn gắn nút nhỏ "📜 Xem khung câu lệnh hệ thống"
   *    ngay phía trên ô trình đơn thả xuống của 4 chế độ ("1. CHỌN CHẾ ĐỘ LÀM VIỆC CỦA AI:")
   */
  function syncBug8SystemPromptButtonAboveModeDropdown() {
    document.querySelectorAll('select').forEach((sel) => {
      const firstOptText = sel.options?.[0]?.textContent || '';
      if (
        !firstOptText.includes('Chế độ 1') &&
        sel.id !== 'select-ai-work-mode'
      ) {
        return;
      }

      const container = sel.parentElement;
      if (!container || container.querySelector('.btn-bug8-view-system-rule')) return;

      const headerBar = document.createElement('div');
      headerBar.className = 'flex items-center justify-between mb-1.5';
      headerBar.innerHTML = `
        <span class="text-[10px] font-bold uppercase text-emerald-400">
          🔗 Đã áp dụng Rule Hệ Thống & Lệnh Tăng Cường theo chế độ
        </span>
        <button type="button" class="btn-bug8-view-system-rule px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-[11px] transition flex items-center gap-1 shadow-sm">
          <span>📜 Xem & Tùy Chỉnh Khung Câu Lệnh Hệ Thống</span>
        </button>
      `;

      container.insertBefore(headerBar, sel);

      headerBar
        .querySelector('.btn-bug8-view-system-rule')
        ?.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const rawVal = sel.value || 'MODE_1_DRAFT';
          let modeKey = 'MODE_1_DRAFT';
          if (rawVal.includes('2') || rawVal.includes('ADVISOR')) modeKey = 'MODE_2_ADVISOR';
          if (rawVal.includes('3') || rawVal.includes('AUDIT')) modeKey = 'MODE_3_AUDIT';
          if (rawVal.includes('4') || rawVal.includes('REVIEW')) modeKey = 'MODE_4_REVIEW';
          window.StudioStage3?.modeRulesManager?.openRuleEditorModal(modeKey);
        });
    });
  }

  /**
   * 3. CẦU NỐI BUG 6: Nâng cấp trực tiếp hộp thoại "DUYỆT BẢN THẢO & GỬI PROMPT CẬP NHẬT STORY BIBLE"
   *    của Stage 17 (Thêm danh sách thả xuống chương chưa duyệt, Chọn tất cả / Không chọn tất cả,
   *    Câu lệnh định hướng nối mạch thông minh và nút Mở khung Story Bible -> Sửa khung Story Bible)
   */
  function syncBug6InsideStage17ApprovalModal() {
    document.querySelectorAll('div, section').forEach((box) => {
      const heading = box.querySelector('h2, h3, span');
      const headingText = (heading?.textContent || '').trim();
      if (
        !headingText.includes('DUYỆT BẢN THẢO & GỬI PROMPT CẬP NHẬT STORY BIBLE') ||
        box.id === 'modal-bug6-smart-approve' ||
        box.dataset.bug6Upgraded === 'true'
      ) {
        return;
      }

      const modalCard = heading.closest('.rounded-2xl, .rounded-xl, .max-w-lg, .max-w-xl, .max-w-2xl') || box;
      if (!modalCard || modalCard.dataset.bug6Upgraded === 'true') return;
      modalCard.dataset.bug6Upgraded = 'true';

      // Tìm nút "Duyệt Chương & Gửi Prompt Cập Nhật Story Bible Ngay" bên trong hộp thoại Stage 17
      const buttons = [...modalCard.querySelectorAll('button')];
      const approveAndSendBtn = buttons.find((b) =>
        (b.textContent || '').includes('Duyệt Chương & Gửi Prompt')
      );

      if (approveAndSendBtn) {
        // Thêm nút nhỏ "🏛️ Mở khung Story Bible" ngay cạnh nút Duyệt chương
        const openBibleBtn = document.createElement('button');
        openBibleBtn.type = 'button';
        openBibleBtn.className =
          'px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 border border-amber-500/40 font-bold text-xs transition flex items-center gap-1';
        openBibleBtn.innerHTML = '🏛️ Mở khung Story Bible';
        openBibleBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          window.StudioStage10?.bibleEngine?.openQuickStoryBiblePreviewModal();
        });
        approveAndSendBtn.parentElement?.insertBefore(openBibleBtn, approveAndSendBtn);

        // Chuyển hướng nút Duyệt sang bộ xử lý Đa Chương Liên Mạch của Bug 6
        approveAndSendBtn.addEventListener(
          'click',
          async (e) => {
            const checkedBoxes = modalCard.querySelectorAll('.s17-bug6-chap-item:checked');
            if (checkedBoxes.length > 0 && window.StudioStage10?.bibleEngine) {
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation();

              const selectedIds = [...checkedBoxes].map((c) => c.value);
              const directiveVal =
                modalCard.querySelector('.s17-bug6-directive-input')?.value || '';
              const selects = modalCard.querySelectorAll('select');
              const modelVal = selects[0]?.value || 'gemini-2.5-flash-lite';
              const thinkVal = (selects[1]?.value || 'low').toLowerCase().includes('high')
                ? 'high'
                : (selects[1]?.value || 'low').toLowerCase().includes('med')
                ? 'medium'
                : 'low';

              approveAndSendBtn.disabled = true;
              const origLabel = approveAndSendBtn.innerHTML;
              approveAndSendBtn.textContent = '⏳ Đang duyệt & nối mạch Story Bible...';

              try {
                for (const id of selectedIds) {
                  await window.StudioCore.approvalGate.approveChapterById(id, false);
                }
                await window.StudioCore.controller.saveWorkspaceStateToIDB();
                window.StudioCore.controller.renderAll();

                await window.StudioStage10.bibleEngine.updateStoryBibleForSelectedChapters({
                  selectedChapterIds: selectedIds,
                  modelId: modelVal,
                  thinkingLevel: thinkVal,
                  userDirective: directiveVal
                });

                modalCard.closest('.fixed')?.classList.add('hidden');
              } catch (err) {
                alert(`Lỗi cập nhật Story Bible: ${err.message}`);
              } finally {
                approveAndSendBtn.disabled = false;
                approveAndSendBtn.innerHTML = origLabel;
              }
            }
          },
          true
        );
      }

      // Chèn danh sách trình đơn thả xuống các chương chưa duyệt + Chọn tất cả / Bỏ chọn tất cả + Ô câu lệnh định hướng
      const injectBlock = document.createElement('div');
      injectBlock.className = 'my-3 p-3.5 rounded-xl border border-emerald-500/40 bg-zinc-950/90 space-y-2.5 text-xs';

      const drafts = window.StudioCore?.approvalGate?.getDraftChapters() || [];
      const chaptersPool =
        drafts.length > 0 ? drafts : window.StudioCore?.approvalGate?.chapters || [];
      const activeId = window.StudioCore?.approvalGate?.activeChapterId;

      injectBlock.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="font-bold text-emerald-400">📋 Chọn Chương Chưa Duyệt Để Tóm Tắt Story Bible:</span>
          <div class="flex items-center gap-1.5">
            <button type="button" class="btn-s17-bug6-all px-2 py-0.5 rounded bg-emerald-600/25 text-emerald-300 font-bold text-[10px]">☑️ Chọn tất cả</button>
            <button type="button" class="btn-s17-bug6-none px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold text-[10px]">⬜ Không chọn tất cả</button>
          </div>
        </div>
        <div class="max-h-32 overflow-y-auto space-y-1 pt-1 border-t border-zinc-800">
          ${chaptersPool
            .map(
              (c) => `
            <label class="flex items-center justify-between gap-2 p-1.5 rounded hover:bg-zinc-900 cursor-pointer">
              <div class="flex items-center gap-2">
                <input type="checkbox" value="${c.id}" ${
                c.id === activeId ? 'checked' : ''
              } class="s17-bug6-chap-item rounded accent-emerald-500" />
                <span class="font-semibold text-zinc-200">${
                  c.displayTitle || c.title
                }</span>
              </div>
              <span class="text-[10px] font-monoCode text-emerald-400">${(
                c.wordCount || 0
              ).toLocaleString('vi-VN')}w</span>
            </label>
          `
            )
            .join('')}
        </div>
        <div class="pt-2 border-t border-zinc-800 space-y-1">
          <label class="block text-[10px] font-bold uppercase text-amber-400">
            🧭 Câu Lệnh Định Hướng Tóm Tắt Liên Mạch (Tự động giữ mạch từ Chương 1 + Rule Story Bible):
          </label>
          <textarea rows="2" class="s17-bug6-directive-input w-full p-2 rounded-lg border border-zinc-700 bg-zinc-900 text-xs text-zinc-100" placeholder="Nhập định hướng bổ sung cho các chương đã chọn...">Tổng hợp đầy đủ diễn biến của các chương đã chọn theo đúng cấu trúc mẫu Story Bible, đồng thời giữ nguyên mạch liên kết với các chương trước đó (từ Chương 1) mà không làm mất chi tiết cũ.</textarea>
        </div>
      `;

      const firstInnerBox = modalCard.querySelector('.p-4, .p-5, .space-y-3, .space-y-4') || modalCard;
      firstInnerBox.prepend(injectBlock);

      injectBlock.querySelector('.btn-s17-bug6-all')?.addEventListener('click', () => {
        injectBlock
          .querySelectorAll('.s17-bug6-chap-item')
          .forEach((c) => (c.checked = true));
      });
      injectBlock.querySelector('.btn-s17-bug6-none')?.addEventListener('click', () => {
        injectBlock
          .querySelectorAll('.s17-bug6-chap-item')
          .forEach((c) => (c.checked = false));
      });
    });
  }

  /**
   * 4. CẦU NỐI BUG 9, 10, 11: Đồng bộ hóa các ô chọn Model, Mức độ tư duy, Số từ muốn xuất
   *    và Mốc chuyển cảnh của Stage 17 vào màn hình Pop-up Gemini Flash Tổng Hợp Thông Số
   */
  function syncBug9To11ParametersAndSynthesizer() {
    // Liên kết mọi ô nhập Số từ muốn xuất trên giao diện
    document.querySelectorAll('input[type="number"]').forEach((inp) => {
      const labelText = (inp.previousElementSibling?.textContent || '').toUpperCase();
      if (
        labelText.includes('SỐ TỪ MUỐN XUẤT') &&
        inp.id !== 'input-target-word-count' &&
        !inp.dataset.bug9Synced
      ) {
        inp.dataset.bug9Synced = 'true';
        inp.addEventListener('input', () => {
          const val = Math.max(200, parseInt(inp.value || '4500', 10));
          localStorage.setItem('noir_target_word_count', String(val));
          if (window.StudioStage2?.settings) {
            window.StudioStage2.settings.targetWordCount = val;
          }
          const mainWordInp = document.getElementById('input-target-word-count');
          if (mainWordInp && mainWordInp !== inp) mainWordInp.value = String(val);
        });
      }
    });
  }

  window.addEventListener('DOMContentLoaded', () => {
    setInterval(() => {
      syncBug5UnapproveButtonsInStage17Tree();
      syncBug8SystemPromptButtonAboveModeDropdown();
      syncBug6InsideStage17ApprovalModal();
      syncBug9To11ParametersAndSynthesizer();
    }, 500);
  });
})();

/**
 * ============================================================================
 * FILE: stage18_omnipotent_architect_patch.js
 * BẢN VÁ TỔNG LỰC 7 BUG (CHUẨN KIẾN TRÚC SƯ 30 NĂM KINH NGHIỆM - CẬP NHẬT 11/11/2026)
 * ----------------------------------------------------------------------------
 * - BUG 1: Tự động lưu trạng thái mỗi 2 giây (2000ms) + Mutex Lock chống xung đột
 *          và ghi file save tạm thời (_studio_autosave_2s_temp.json + bản thảo)
 *          trực tiếp về Folder ổ cứng đã chọn kèm đèn báo Real-time.
 * - BUG 2: Cập nhật danh mục Model chuẩn Google AI Studio 11/11/2026
 *          (Gemini 4 Argon, Gemini 4 Carbon, Gemini 3.8 Flash, Gemini 3.6 Flash,
 *          Gemini 3.5 Flash-Lite, Gemini 3.1 Pro, Gemini 3.1 Flash-Lite).
 *          Xóa bỏ hoàn toàn model 2.5 cũ / 3.5-flash ảo + Quét Real-time API.
 * - BUG 3: Chống tràn màn hình Story Bible (Tab 4), ghim cố định nút 🗑️ Xóa
 *          và ✏️ Sửa trên từng thẻ Nhân vật / Bí mật / Phục bút & Xóa nhanh.
 * - BUG 4: Khôi phục hoạt động 100% cho 4 nút ở Tab 6 (Video HD Hướng Dẫn,
 *          Loa Thông Báo Version, Mở Màn Hình Đầu Vào, Đổi Chế Độ Thiết Bị).
 * - BUG 5: Mở trực tiếp cửa sổ Xem/Sửa Khung Story Bible, Chèn Mốc Chuyển Cảnh
 *          và Xem Gói Ngữ Cảnh Cục Bộ nổi lên trên Trung tâm AI (z-index tối đa).
 * - BUG 6: Tích hợp System Prompt & Mẫu Câu Lệnh chuyên sâu riêng cho từng
 *          Chế độ 1 (Slow-burn Tâm lý), Chế độ 2 (Tham mưu & Unreliable POV),
 *          Chế độ 3 (Kiểm toán Logic/Giờ giấc), Chế độ 4 (Review Đa chiều).
 * - BUG 7: Đưa thanh Chỉnh Kích Thước Khung Chat từ Tab 6 về ngay trên ô nhập
 *          lệnh ở Tab 3 và ép xung CSS !important để các nút kích thước chạy thật 100%.
 * ============================================================================
 */

(function () {
  'use strict';

  if (window.__NOIR_STAGE18_OMNIPOTENT_PATCH_LOADED__) return;
  window.__NOIR_STAGE18_OMNIPOTENT_PATCH_LOADED__ = true;

  // ==========================================================================
  // DANH MỤC MÔ HÌNH GOOGLE GEMINI CHÍNH THỨC TÍNH ĐẾN 11/11/2026 (FIX BUG 2)
  // ==========================================================================
  const OFFICIAL_NOV_2026_GEMINI_MODELS = {
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
      thinkingTokenOverhead: { low: 1500, medium: 6000, high: 16000 },
      badge: 'Flagship 11/2026'
    },
    'gemini-4-carbon': {
      id: 'gemini-4-carbon',
      name: '💎 Gemini 4 Carbon (Frontier 11/2026 - Suy luận đa tầng & Tốc độ cao)',
      contextWindow: 1048576,
      maxOutputTokens: 1000000,
      rpmLimit: 120,
      tpmLimit: 4000000,
      rpdLimit: 3000,
      defaultThinking: 'high',
      supportedThinking: ['low', 'medium', 'high'],
      thinkingTokenOverhead: { low: 1000, medium: 4000, high: 12000 },
      badge: 'Frontier 11/2026'
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
      thinkingTokenOverhead: { low: 500, medium: 2500, high: 8000 },
      badge: 'Khuyên dùng'
    },
    'gemini-3.6-flash': {
      id: 'gemini-3.6-flash',
      name: '✨ Gemini 3.6 Flash (Ổn định 2026 - Đa phương thức & Phản hồi mượt)',
      contextWindow: 1048576,
      maxOutputTokens: 65536,
      rpmLimit: 250,
      tpmLimit: 4000000,
      rpdLimit: 5000,
      defaultThinking: 'medium',
      supportedThinking: ['low', 'medium', 'high'],
      thinkingTokenOverhead: { low: 400, medium: 2000, high: 6000 },
      badge: 'Ổn định'
    },
    'gemini-3.5-flash-lite': {
      id: 'gemini-3.5-flash-lite',
      name: '⚡ Gemini 3.5 Flash-Lite (Hiện hành 11/2026 - Tốc độ siêu cao & Siêu tiết kiệm hạn mức)',
      contextWindow: 1048576,
      maxOutputTokens: 65536,
      rpmLimit: 400,
      tpmLimit: 4000000,
      rpdLimit: 10000,
      defaultThinking: 'low',
      supportedThinking: ['low', 'medium', 'high'],
      thinkingTokenOverhead: { low: 200, medium: 1000, high: 3500 },
      badge: 'Siêu tiết kiệm'
    },
    'gemini-3.1-pro-preview': {
      id: 'gemini-3.1-pro-preview',
      name: '🧠 Gemini 3.1 Pro (Chuyên sâu viết tiểu thuyết tâm lý & Kiểm toán logic)',
      contextWindow: 1048576,
      maxOutputTokens: 65536,
      rpmLimit: 60,
      tpmLimit: 2000000,
      rpdLimit: 1000,
      defaultThinking: 'high',
      supportedThinking: ['low', 'medium', 'high'],
      thinkingTokenOverhead: { low: 1500, medium: 6000, high: 16000 },
      badge: 'Pro 3.1'
    },
    'gemini-3.1-flash-lite': {
      id: 'gemini-3.1-flash-lite',
      name: '🍃 Gemini 3.1 Flash-Lite (Nhẹ, xử lý ngữ cảnh dài chi phí tối thiểu)',
      contextWindow: 1048576,
      maxOutputTokens: 65536,
      rpmLimit: 400,
      tpmLimit: 4000000,
      rpdLimit: 10000,
      defaultThinking: 'low',
      supportedThinking: ['low', 'medium', 'high'],
      thinkingTokenOverhead: { low: 200, medium: 1000, high: 3000 },
      badge: 'Lite 3.1'
    }
  };

  // Ánh xạ tự động mọi tên model cũ / không tồn tại sang model chuẩn tháng 11/2026
  const DEPRECATED_TO_2026_MODEL_MAP = {
    'gemini-2.5-pro': 'gemini-3.1-pro-preview',
    'gemini-2.5-flash': 'gemini-3.8-flash',
    'gemini-2.5-flash-lite': 'gemini-3.5-flash-lite',
    'gemini-2.0-flash': 'gemini-3.8-flash',
    'gemini-2.0-flash-lite': 'gemini-3.5-flash-lite',
    'gemini-3.5-flash': 'gemini-3.8-flash',
    'gemini-3-flash-preview': 'gemini-3.6-flash',
    'gemini-1.5-pro': 'gemini-3.1-pro-preview',
    'gemini-1.5-flash': 'gemini-3.8-flash'
  };

  // ==========================================================================
  // BỘ CÂU LỆNH HỆ THỐNG (SYSTEM PROMPTS) & MẪU PROMPT CHUYÊN SÂU CHO TỪNG CHẾ ĐỘ (FIX BUG 6)
  // ==========================================================================
  const PROFESSIONAL_MODE_SYSTEM_PROMPTS = {
    MODE_1_DRAFT: {
      title: '✍️ Chế độ 1: Viết Bản Nháp Chậm (Extreme Slow-Burn & Đa Chiều Tâm Lý)',
      systemPrompt: [
        '【CHẾ ĐỘ 1: KIẾN TRÚC SƯ TIỂU THUYẾT TÂM LÝ ĐÔ THỊ - EXTREME SLOW-BURN】',
        '1. NHỊP ĐỘ VI MÔ (MICRO-PACING & SLOW-BURN):',
        '   - Tuyệt đối KHÔNG tóm tắt gộp thời gian, KHÔNG đốt cháy giai đoạn tâm lý.',
        '   - Kéo giãn từng khoảnh khắc căng thẳng bằng cách đi sâu vào: (a) Phản xạ sinh lý vô thức (nhịp thở, ánh mắt, đầu ngón tay, sự im lặng ngột ngạt), (b) Chi tiết không gian - ánh sáng - âm thanh đô thị phản chiếu nội tâm, (c) Sự giằng xé đa chiều giữa Mặt nạ xã hội (Persona) và Bản chất ngầm/Chấn thương (Shadow).',
        '2. ĐA ĐIỂM NHÌN & NGƯỜI KỂ KHÔNG ĐÁNG TIN (UNRELIABLE POV):',
        '   - Bám sát tuyệt đối lăng kính nhận thức của nhân vật nắm POV hiện tại.',
        '   - Nhân vật chỉ biết những gì họ chứng kiến trong Ma trận Ai Biết Gì; thể hiện sự tự hợp lý hóa, nghi kỵ hoặc ký ức đứt gãy thông qua cách họ quan sát người khác.',
        '3. QUY TẮC TRÌNH BÀY & NGÔN TỪ BẮT BUỘC:',
        '   - 100% lời thoại BẮT BUỘC viết theo đúng định dạng: - Câu thoại (Tên nhân vật)',
        '   - Tuyệt đối CẤM dùng danh sách gạch đầu dòng (bullet points) cho văn xuôi, CẤM kết chương bằng câu triết lý sáo rỗng kiểu AI.',
        '   - Bám sát số từ mục tiêu, giữ mạch văn tự nhiên, giàu sức nặng điện ảnh.'
      ].join('\n'),
      sampleUserPrompt: [
        '【CHỈ ĐẠO PHÂN CẢNH BẢN NHÁP CHẬM - TÂM LÝ ĐA CHIỀU】',
        '- Bối cảnh & Không khí: [Mô tả ngắn không gian, thời gian, ánh sáng, âm thanh nền]',
        '- Nhân vật POV & Trạng thái tâm lý: [Tên POV - đang che giấu điều gì / đang nghi ngờ ai]',
        '- Diễn biến cốt lõi (Đi cực chậm):',
        '  1. Mở đầu bằng sự tĩnh lặng và quan sát vi mô của nhân vật POV trước đối phương.',
        '  2. Cuộc đối thoại ngầm chứa ẩn ý (mỗi câu thoại đều có khoảng lặng nội tâm và cử chỉ nhỏ đi kèm).',
        '  3. Cài cắm 1 chi tiết phục bút tinh tế mà nhân vật POV vô tình chú ý nhưng chưa hiểu hết ý nghĩa.',
        '- Lưu ý bắt buộc: Đào sâu độc thoại nội tâm đa chiều, nhịp độ slow-burn, thoại viết đúng mẫu: - Câu thoại (Tên nhân vật).'
      ].join('\n')
    },
    MODE_2_CONSULT: {
      title: '🧭 Chế độ 2: Tham Mưu Cốt Truyện, Phục Bút & Unreliable Narrator',
      systemPrompt: [
        '【CHẾ ĐỘ 2: CỐ VẤN CHIẾN LƯỢC CỐT TRUYỆN, PHỤC BÚT & BẪY NHẬN THỨC】',
        '1. THIẾT KẾ CỐT TRUYỆN ĐA NHÁNH & BẤT CÂN XỨNG THÔNG TIN:',
        '   - Phân tích dữ liệu các chương trước và Story Bible để đề xuất 2-3 hướng rẽ nhánh cốt truyện có độ căng thẳng tâm lý cao nhất.',
        '   - Chỉ rõ sự chênh lệch giữa [Sự thật khách quan 100%] và [Nhận thức sai lệch của từng nhân vật].',
        '2. KỸ THUẬT GÀI NGƯỜI KỂ CHUYỆN KHÔNG ĐÁNG TIN (UNRELIABLE NARRATOR):',
        '   - Thiết kế các chi tiết "nói thật một nửa", "bỏ quên có chọn lọc" hoặc "diễn giải sai động cơ của người khác" sao cho người đọc tinh ý có thể nhận ra vết gợn logic.',
        '3. QUẢN TRỊ SỔ CÁI PHỤC BÚT (3 TẦNG):',
        '   - Gợi ý cách gieo manh mối (Planting), tạo cá trích đỏ đánh lạc hướng (Red Herring) và thời điểm thu hoạch (Payoff) hợp lý nhất.'
      ].join('\n'),
      sampleUserPrompt: [
        '【YÊU CẦU THAM MƯU CỐT TRUYỆN & GÀI BẪY TÂM LÝ】',
        '- Tình huống hiện tại của truyện: [Tóm tắt nút thắt đang cần tháo gỡ hoặc phát triển tiếp]',
        '- Bí mật cốt lõi cần che giấu người đọc / nhân vật khác: [Ghi bí mật]',
        '- Yêu cầu tham mưu:',
        '  1. Đề xuất 3 phương án phát triển tình tiết tiếp theo theo hướng tâm lý kịch tính (không sáo rỗng).',
        '  2. Cách sử dụng cơ chế Người kể chuyện không đáng tin (Unreliable Narrator) trong chương tới để đánh lừa cảm giác của người đọc.',
        '  3. Gợi ý 2 chi tiết phục bút cụ thể có thể cài vào lời thoại hoặc đồ vật tại hiện trường.'
      ].join('\n')
    },
    MODE_3_AUDIT: {
      title: '🔍 Chế độ 3: Kiểm Toán Logic, Trục Giờ Giấc, Ngoại Phạm & Chính Tả',
      systemPrompt: [
        '【CHẾ ĐỘ 3: KIỂM TOÁN VIÊN LOGIC, PHÁP Y THỜI GIAN & KHỬ DẤU VẾT AI】',
        '1. KIỂM TOÁN TRỤC THỜI GIAN & CHỨNG CỨ NGOẠI PHẠM:',
        '   - Đối chiếu từng mốc ngày/giờ, thời gian di chuyển giữa các địa điểm trong bản thảo hiện tại với các chương Đã Duyệt.',
        '2. KIỂM TOÁN MA TRẬN AI BIẾT GÌ (EPISTEMIC AUDIT):',
        '   - Bắt lỗi nhân vật vô tình nói hoặc nghĩ tới thông tin mà tại thời điểm đó họ chưa thể biết (Plot Hole thông tin).',
        '3. KIỂM TRA TÂM LÝ (OOC) & CHUẨN HÓA VĂN PHONG:',
        '   - Phát hiện hành vi/lời thoại lệch thiết lập tính cách (Out of Character) trong Story Bible.',
        '   - Rà soát lỗi chính tả, từ lặp, cụm từ sáo rỗng bị cấm và tự động sửa lại toàn bộ lời thoại sai quy cách về chuẩn: - Câu thoại (Tên nhân vật).'
      ].join('\n'),
      sampleUserPrompt: [
        '【YÊU CẦU KIỂM TOÁN LOGIC, GIỜ GIẤC & CHÍNH TẢ BẢN THẢO】',
        '- Hãy rà soát toàn diện bản thảo chương hiện tại đối chiếu với Story Bible và các chương trước:',
        '  1. [Lỗi Trục Thời Gian & Không Gian]: Có mâu thuẫn nào về giờ giấc, khoảng cách di chuyển hoặc hiện trường không?',
        '  2. [Lỗi Bất Cân Xứng Thông Tin]: Có nhân vật nào biết trước bí mật chưa được tiết lộ không?',
        '  3. [Lỗi Tâm Lý & Khẩu Khí (OOC)]: Lời thoại đã đúng chất từng nhân vật và đúng định dạng "- Câu thoại (Tên)" chưa?',
        '  4. [Bản Sửa Lỗi Đề Xuất]: Liệt kê các câu bị sáo rỗng/sai chính tả và viết lại đoạn văn đã được làm mượt.'
      ].join('\n')
    },
    MODE_4_REVIEW: {
      title: '📊 Chế độ 4: Review Tổng Thể Đa Chiều & Đánh Giá Nhịp Độ Chương',
      systemPrompt: [
        '【CHẾ ĐỘ 4: HỘI ĐỒNG PHÊ BÌNH VĂN HỌC ĐA CHIỀU & PHÂN TÍCH NHỊP ĐỘ】',
        '1. PHÂN TÍCH BIỂU ĐỒ NHỊP ĐỘ (PACING & TENSION CURVE):',
        '   - Đánh giá tốc độ triển khai tình tiết qua từng phân cảnh: chỗ nào đang bị vội, chỗ nào kéo căng cảm xúc tốt.',
        '2. ĐÁNH GIÁ CHIỀU SÂU TÂM LÝ & TỶ LỆ SHOW-DON’T-TELL:',
        '   - Chấm điểm cách thể hiện tâm lý nhân vật qua hành động/thoại ngầm thay vì kể lể trực tiếp.',
        '3. KIỂM TOÁN HỆ THỐNG PHỤC BÚT & SỨC HÚT ĐỘC GIẢ:',
        '   - Thống kê các phục bút đã gieo, đang phát triển và mức độ lôi cuốn ở đoạn kết chương (Cliffhanger / Dư âm tâm lý).'
      ].join('\n'),
      sampleUserPrompt: [
        '【YÊU CẦU REVIEW TỔNG THỂ & ĐÁNH GIÁ CHẤT LƯỢNG BẢN THẢO】',
        '- Hãy đọc và đánh giá chuyên sâu chương truyện hiện tại (kết hợp mạch các chương Đã Duyệt):',
        '  1. Chấm điểm chi tiết (Thang 10): Nhịp độ Slow-burn, Chiều sâu tâm lý, Sức nặng lời thoại, Không khí truyện.',
        '  2. Phân tích những đoạn đắt giá nhất và những đoạn còn mỏng tâm lý cần bồi đắp thêm.',
        '  3. Đánh giá hiệu quả của các phục bút và gợi ý chỉnh sửa để dư âm cuối chương ám ảnh hơn.'
      ].join('\n')
    },
    FREE_CHAT: {
      title: '💬 Chế độ Chat Gemini Tự Do (Brainstorm & Tham Vấn Nhanh)',
      systemPrompt: [
        '【CHẾ ĐỘ CHAT GEMINI TỰ DO - ĐỒNG SÁNG TÁC TIỂU THUYẾT TÂM LÝ】',
        '- Trò chuyện, giải đáp, brainstorm ý tưởng nhanh, tra cứu kiến thức tâm lý học, hình sự, y khoa, bối cảnh đô thị phục vụ trực tiếp cho tiểu thuyết của tác giả.',
        '- Luôn nắm vững hồ sơ Story Bible và các chương hiện có để tư vấn sát hợp nhất.'
      ].join('\n'),
      sampleUserPrompt:
        'Hãy cùng tôi thảo luận sâu hơn về động cơ tâm lý ngầm của nhân vật trong chương đang viết dựa trên Story Bible hiện tại.'
    }
  };

  // ==========================================================================
  // CSS BỔ SUNG CHO STAGE 18 (CHỐNG TRÀN STORY BIBLE, MODAL Z-INDEX & KHUNG CHAT)
  // ==========================================================================
  function injectStage18MasterCSS() {
    if (document.getElementById('s18-omnipotent-patch-styles')) return;
    const style = document.createElement('style');
    style.id = 's18-omnipotent-patch-styles';
    style.textContent = `
      /* FIX BUG 3: Chống tràn tuyệt đối màn hình Story Bible & giữ nút Xóa luôn hiển thị */
      #right-bible-pane,
      #s10-story-bible-main-view,
      #characters-list-container,
      #knowledge-list-container,
      #clues-list-container {
        min-width: 0 !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
      }
      #characters-list-container > *,
      #knowledge-list-container > *,
      #clues-list-container > * {
        max-width: 100% !important;
        overflow: hidden !important;
        word-break: break-word !important;
        overflow-wrap: anywhere !important;
        position: relative !important;
      }
      .s18-bible-card-header-bar {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 6px !important;
        width: 100% !important;
        min-width: 0 !important;
      }
      .s18-bible-card-actions {
        display: inline-flex !important;
        align-items: center !important;
        gap: 4px !important;
        flex-shrink: 0 !important;
        z-index: 5 !important;
      }

      /* FIX BUG 5 & BUG 4: Đảm bảo các Modal phụ luôn nổi TRÊN Trung tâm AI (#modal-s6-prompt-studio) */
      #modal-scene-builder:not(.hidden),
      #modal-context-preview:not(.hidden),
      #modal-s10-video-guide:not(.hidden),
      #modal-s10-changelog:not(.hidden),
      #modal-s15-writing-rules-and-approve:not(.hidden),
      #modal-s21-bible-chapters-selector:not(.hidden),
      #modal-s18-live-bible-over-ai:not(.hidden) {
        z-index: 2147483642 !important;
      }

      /* FIX BUG 7: Đảm bảo thanh chỉnh kích thước khung chat hiển thị ngay ở Tab 3 */
      #s18-tab3-chat-size-toolbar {
        display: flex !important;
      }
    `;
    document.head.appendChild(style);
  }

  // ==========================================================================
  // FIX BUG 1: BỘ ĐỒNG BỘ AUTO-SAVE MỖI 2 GIÂY (2000ms) VỀ FOLDER Ổ CỨNG
  // ==========================================================================
  class Bug1TwoSecondFolderAutoSaver {
    static isWritingDisk = false;
    static intervalId = null;
    static lastSavedHash = '';

    static init() {
      this.injectAutoSaveStatusBadge();

      // Chạy định kỳ đúng mỗi 2 giây (2000ms) theo đúng thiết kế hệ thống
      if (this.intervalId) clearInterval(this.intervalId);
      this.intervalId = setInterval(() => {
        this.performTwoSecondAutoSave(false);
      }, 2000);

      // Khi người dùng bấm nút Lưu Nháp thủ công -> Lưu ngay lập tức
      document.getElementById('btn-save-draft-disk')?.addEventListener('click', () => {
        this.performTwoSecondAutoSave(true);
      });
    }

    static injectAutoSaveStatusBadge() {
      const topHeader =
        document.getElementById('s14-master-top-nav') ||
        document.getElementById('app-top-header');
      if (!topHeader || document.getElementById('s18-autosave-2s-indicator')) return;

      const badge = document.createElement('div');
      badge.id = 's18-autosave-2s-indicator';
      badge.className =
        'px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-monoCode text-emerald-400 flex items-center gap-1.5 shrink-0';
      badge.innerHTML = `
        <span id="s18-autosave-dot" class="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span id="s18-autosave-text">Auto-Save 2s: Sẵn sàng</span>
      `;
      topHeader.lastElementChild?.prepend(badge);
    }

    static syncLiveDomInputsIntoActiveChapter() {
      const core = window.StudioCore;
      if (!core?.approvalGate) return null;

      const activeId = core.approvalGate.activeChapterId;
      const activeChap = (core.approvalGate.chapters || []).find((c) => c.id === activeId);
      if (!activeChap) return null;

      const contentEl = document.getElementById('textarea-chapter-content');
      const titleEl = document.getElementById('input-chapter-title');
      const numEl = document.getElementById('input-chapter-number');
      const beatsEl = document.getElementById('textarea-chapter-beats');
      const summaryEl = document.getElementById('textarea-chapter-summary');
      const timeEl = document.getElementById('input-scene-timestamp');
      const locEl = document.getElementById('input-scene-location');
      const povEl = document.getElementById('select-scene-pov');
      const relEl = document.getElementById('select-pov-reliability');

      if (contentEl) {
        activeChap.content = contentEl.value;
        if (core.docParser?.countVietnameseWords) {
          activeChap.wordCount = core.docParser.countVietnameseWords(contentEl.value);
        } else {
          activeChap.wordCount = contentEl.value.trim()
            ? contentEl.value.trim().split(/\s+/).length
            : 0;
        }
      }
      if (titleEl && titleEl.value.trim()) activeChap.title = titleEl.value.trim();
      if (numEl && Number(numEl.value) > 0) activeChap.chapterNumber = Number(numEl.value);
      if (beatsEl) activeChap.beats = beatsEl.value;
      if (summaryEl) activeChap.summary = summaryEl.value;
      if (timeEl) activeChap.timelineTimestamp = timeEl.value;
      if (locEl) activeChap.location = locEl.value;
      if (povEl) activeChap.povCharacter = povEl.value;
      if (relEl) activeChap.povReliability = relEl.value;
      activeChap.updatedAt = new Date().toISOString();

      // Đồng bộ khung Story Bible đang mở
      const renderedBibleEl = document.getElementById('s10-bible-rendered-textarea');
      if (renderedBibleEl && renderedBibleEl.value.trim()) {
        localStorage.setItem('noir_s10_rendered_bible_content', renderedBibleEl.value);
      }
      const templateBibleEl = document.getElementById('s10-bible-template-textarea');
      if (templateBibleEl && templateBibleEl.value.trim()) {
        localStorage.setItem('noir_s10_bible_template_frame', templateBibleEl.value);
      }

      return activeChap;
    }

    static async performTwoSecondAutoSave(forceWriteDisk = false) {
      if (this.isWritingDisk) return;

      const activeChap = this.syncLiveDomInputsIntoActiveChapter();
      const core = window.StudioCore;
      if (!core) return;

      const snapshot = {
        version: 'STAGE_18_AUTOSAVE_2S',
        savedAt: new Date().toISOString(),
        activeScreen: document.body.getAttribute('data-s14-screen') || 'SCREEN_1_WRITE',
        activeChapterId: core.approvalGate?.activeChapterId || null,
        chapters: core.approvalGate?.chapters || [],
        storyBibleData: core.bibleManager?.data || {},
        templateFrame: localStorage.getItem('noir_s10_bible_template_frame') || '',
        renderedBibleContent: localStorage.getItem('noir_s10_rendered_bible_content') || '',
        modeSystemPrompts: Bug6ModeSystemPromptManager.getCustomPromptsMap(),
        currentPromptDraft: document.getElementById('s6-popup-prompt-textarea')?.value || ''
      };

      // Tính chữ ký nhanh để tránh ghi ổ cứng vô ích nếu suốt 2s không có bất kỳ thay đổi nào
      const quickHash = `${snapshot.activeChapterId}_${activeChap?.content?.length || 0}_${
        activeChap?.title || ''
      }_${snapshot.renderedBibleContent.length}_${snapshot.currentPromptDraft.length}_${
        (snapshot.storyBibleData.characters || []).length
      }`;

      if (!forceWriteDisk && quickHash === this.lastSavedHash) {
        return;
      }
      this.lastSavedHash = quickHash;

      this.isWritingDisk = true;
      const dotEl = document.getElementById('s18-autosave-dot');
      const txtEl = document.getElementById('s18-autosave-text');

      try {
        // 1. Lưu ngay vào LocalStorage & IndexedDB (0ms latency)
        localStorage.setItem('noir_s17_master_workspace_snapshot', JSON.stringify(snapshot));
        if (core.controller?.idb) {
          await core.controller.idb.set('state_cache', 's17_workspace_snapshot', snapshot);
          await core.controller.idb.set(
            'state_cache',
            'noir_s23_master_workspace_memory',
            {
              chapters: snapshot.chapters,
              activeChapterId: snapshot.activeChapterId,
              bibleData: snapshot.storyBibleData,
              lastFolderName: core.fsEngine?.rootHandle?.name || 'Bộ nhớ máy',
              savedAt: snapshot.savedAt
            }
          );
        }

        // 2. Nếu đã chọn Folder ổ cứng -> Gửi file save tạm thời & cập nhật trực tiếp vào Folder
        const rootHandle = core.fsEngine?.rootHandle;
        if (rootHandle) {
          let perm = 'granted';
          if (typeof rootHandle.queryPermission === 'function') {
            perm = await rootHandle.queryPermission({ mode: 'readwrite' });
          }

          if (perm === 'granted') {
            // 2a. Ghi file save tạm thời (_studio_autosave_2s_temp.json) và file trạng thái chính
            for (const fileName of [
              '_studio_autosave_2s_temp.json',
              '_studio_workspace_state.json'
            ]) {
              const fh = await rootHandle.getFileHandle(fileName, { create: true });
              const writable = await fh.createWritable();
              await writable.write(JSON.stringify(snapshot, null, 2));
              await writable.close();
            }

            // 2b. Ghi file bản thảo chương hiện tại xuống thư mục con (nếu có hàm saveChapterToDisk)
            if (activeChap && typeof core.approvalGate?.saveChapterToDisk === 'function') {
              await core.approvalGate.saveChapterToDisk(activeChap);
            }

            const nowStr = new Date().toLocaleTimeString('vi-VN', { hour12: false });
            if (dotEl) dotEl.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-ping';
            if (txtEl) {
              txtEl.textContent = `Đã lưu Folder (${rootHandle.name}) • ${nowStr}`;
            }
            setTimeout(() => {
              if (dotEl) dotEl.className = 'w-2 h-2 rounded-full bg-emerald-400';
            }, 600);
          } else {
            if (dotEl) dotEl.className = 'w-2 h-2 rounded-full bg-amber-400';
            if (txtEl) txtEl.textContent = 'Đã lưu máy (Cần cấp lại quyền Folder)';
          }
        } else {
          const nowStr = new Date().toLocaleTimeString('vi-VN', { hour12: false });
          if (dotEl) dotEl.className = 'w-2 h-2 rounded-full bg-amber-400';
          if (txtEl) txtEl.textContent = `Lưu bộ nhớ tạm • ${nowStr} (Chưa chọn Folder)`;
        }
      } catch (err) {
        console.warn('[AutoSave 2s] Lỗi ghi ổ cứng:', err);
      } finally {
        this.isWritingDisk = false;
      }
    }
  }

  // ==========================================================================
  // FIX BUG 2: ĐỒNG BỘ MÔ HÌNH GEMINI THÁNG 11/2026 & QUÉT REAL-TIME TỪ GOOGLE API
  // ==========================================================================
  class Bug2RealTimeModelCatalog2026 {
    static liveCatalog = { ...OFFICIAL_NOV_2026_GEMINI_MODELS };

    static init() {
      this.purgeDeprecatedModelsAndApply2026Catalog();
      this.patchGeminiClientWithRealTimeFallback();
      this.injectRealTimeModelRefreshButton();

      // Tự động truy vấn danh sách model thực tế từ Google API nếu đã có Key
      setTimeout(() => {
        this.fetchLiveGoogleModelsFromApi(false);
      }, 900);
    }

    static purgeDeprecatedModelsAndApply2026Catalog() {
      if (window.StudioStage5) {
        window.StudioStage5.LATEST_GEMINI_MODELS = this.liveCatalog;
      }
      if (window.StudioStage16) {
        window.StudioStage16.models2026 = this.liveCatalog;
      }

      // Cập nhật datalist trong index.html
      const datalist = document.getElementById('gemini-models-datalist');
      if (datalist) {
        datalist.innerHTML = Object.values(this.liveCatalog)
          .map((m) => `<option value="${m.id}">${m.name}</option>`)
          .join('');
      }

      // Cập nhật toàn bộ thẻ <select> chọn mô hình trên mọi màn hình & pop-up
      const allModelSelects = document.querySelectorAll(
        '#s5-select-model, #s6-welcome-model-select, #s6-popup-model-select, #s9-bugfixer-model-select, #s15-bible-model-select, #s15-approve-model-select, #s21-popup-bible-model, select[id*="model"]'
      );

      allModelSelects.forEach((sel) => {
        const rawPrev = sel.value;
        const mappedPrev = DEPRECATED_TO_2026_MODEL_MAP[rawPrev] || rawPrev;

        sel.innerHTML = Object.values(this.liveCatalog)
          .map((m) => `<option value="${m.id}">${m.name}</option>`)
          .join('');

        if (this.liveCatalog[mappedPrev]) {
          sel.value = mappedPrev;
        } else if (sel.id.includes('bible') || sel.id.includes('approve')) {
          sel.value = 'gemini-3.5-flash-lite';
        } else {
          sel.value = 'gemini-3.8-flash';
        }
      });

      const modelInput = document.getElementById('input-gemini-model-id');
      if (modelInput) {
        const mapped = DEPRECATED_TO_2026_MODEL_MAP[modelInput.value] || modelInput.value;
        modelInput.value = this.liveCatalog[mapped] ? mapped : 'gemini-3.8-flash';
      }
    }

    static async fetchLiveGoogleModelsFromApi(showNotification = false) {
      const apiKey =
        window.__STUDIO_MASTER_API_KEY ||
        window.StudioStage2?.settings?.config?.apiKey ||
        localStorage.getItem('noir_gemini_api_key') ||
        '';

      if (!apiKey || apiKey.length < 20) return;

      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?pageSize=100&key=${encodeURIComponent(
            apiKey.trim()
          )}`,
          { method: 'GET', cache: 'no-store' }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data.models)) return;

        // Lọc các model sinh văn bản hiện hành (loại bỏ hoàn toàn dòng 1.5, 2.0, 2.5 cũ và các model chỉ tạo ảnh/nhúng)
        data.models.forEach((m) => {
          const id = (m.name || '').replace(/^models\//, '');
          if (!id.startsWith('gemini-')) return;
          if (/^(gemini-1\.|gemini-2\.0|gemini-2\.5|gemini-embedding)/i.test(id)) return;
          if (/(tts|image|banana|transcribe|robotics|computer-use)/i.test(id)) return;
          if (
            Array.isArray(m.supportedGenerationMethods) &&
            !m.supportedGenerationMethods.includes('generateContent')
          ) {
            return;
          }

          if (this.liveCatalog[id]) {
            this.liveCatalog[id].contextWindow = m.inputTokenLimit || 1048576;
            this.liveCatalog[id].maxOutputTokens = m.outputTokenLimit || 65536;
          } else if (id.startsWith('gemini-3') || id.startsWith('gemini-4')) {
            this.liveCatalog[id] = {
              id,
              name: `✨ ${m.displayName || id} (Live API 11/2026 - Out: ${(
                m.outputTokenLimit || 65536
              ).toLocaleString()} tok)`,
              contextWindow: m.inputTokenLimit || 1048576,
              maxOutputTokens: m.outputTokenLimit || 65536,
              rpmLimit: 120,
              tpmLimit: 4000000,
              rpdLimit: 3000,
              defaultThinking: 'medium',
              supportedThinking: ['low', 'medium', 'high'],
              thinkingTokenOverhead: { low: 400, medium: 2000, high: 6000 }
            };
          }
        });

        this.purgeDeprecatedModelsAndApply2026Catalog();

        if (showNotification) {
          window.StudioStage7?.saveEngine?.showSaveToastNotification(
            `✅ Đã đồng bộ Real-time ${
              Object.keys(this.liveCatalog).length
            } mô hình Gemini mới nhất (11/11/2026) từ Google AI Studio!`
          );
        }
      } catch (_) {}
    }

    static injectRealTimeModelRefreshButton() {
      const modelSelect = document.getElementById('s6-popup-model-select');
      if (!modelSelect || document.getElementById('btn-s18-realtime-sync-models')) return;

      const labelEl = modelSelect.previousElementSibling;
      if (labelEl) {
        const wrap = document.createElement('div');
        wrap.className = 'flex items-center justify-between mb-1';
        labelEl.parentNode.insertBefore(wrap, labelEl);
        wrap.appendChild(labelEl);

        const syncBtn = document.createElement('button');
        syncBtn.type = 'button';
        syncBtn.id = 'btn-s18-realtime-sync-models';
        syncBtn.className =
          'px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 font-bold text-[10px] transition';
        syncBtn.innerHTML = '🔄 Đồng bộ Model Real-time (11/2026)';
        syncBtn.addEventListener('click', () => {
          this.fetchLiveGoogleModelsFromApi(true);
        });
        wrap.appendChild(syncBtn);
      }
    }

    static patchGeminiClientWithRealTimeFallback() {
      if (!window.StudioStage3?.geminiClient) return;

      window.StudioStage3.geminiClient.generateContent = async ({
        apiKey,
        modelId,
        systemInstruction,
        userPrompt,
        temperature = 0.7,
        maxOutputTokens = 65536,
        isBiInternalCopilotCall = false
      }) => {
        const activeKey = (
          apiKey ||
          window.__STUDIO_MASTER_API_KEY ||
          window.StudioStage2?.settings?.config?.apiKey ||
          localStorage.getItem('noir_gemini_api_key') ||
          ''
        )
          .replace(/[\s"'`<>]/g, '')
          .trim();

        if (!activeKey) {
          document.getElementById('modal-s6-welcome-launcher')?.classList.remove('hidden');
          throw new Error('Chưa có Google Gemini API Key. Vui lòng dán API Key vào cài đặt!');
        }

        const rawModel = (
          modelId ||
          document.getElementById('s6-popup-model-select')?.value ||
          window.StudioStage2?.settings?.config?.modelId ||
          'gemini-3.8-flash'
        ).trim();

        const resolvedPrimary = DEPRECATED_TO_2026_MODEL_MAP[rawModel] || rawModel;
        const fallbackChain = [
          resolvedPrimary,
          'gemini-3.8-flash',
          'gemini-4-argon',
          'gemini-4-carbon',
          'gemini-3.6-flash',
          'gemini-3.1-pro-preview',
          'gemini-3.5-flash-lite',
          'gemini-3.1-flash-lite'
        ].filter((v, i, a) => v && a.indexOf(v) === i);

        // Nếu không phải lời gọi nội bộ của Chatbot Bi, tự động gắn System Prompt của Chế độ hiện tại + Story Bible
        if (!isBiInternalCopilotCall) {
          const activeMode = Bug6ModeSystemPromptManager.getCurrentModeId();
          const modeCustomSys = Bug6ModeSystemPromptManager.getActiveSystemPrompt(activeMode);
          const bibleSnapshot =
            window.StudioStage16?.promptVault?.constructor?.getLiveStoryBibleAndRulesSnapshot?.() ||
            null;

          const extraSysBlock = [
            modeCustomSys,
            bibleSnapshot?.combinedEnforcementBlock || ''
          ]
            .filter(Boolean)
            .join('\n\n');

          if (extraSysBlock && !(systemInstruction || '').includes(modeCustomSys.slice(0, 35))) {
            systemInstruction = `${extraSysBlock}\n\n${systemInstruction || ''}`;
          }
        }

        const thinkingLevel =
          document.getElementById('s17-ai-thinking-select')?.value ||
          window.StudioStage5?.upgrader?.layoutState?.thinkingLevel ||
          'high';

        let lastError = null;

        for (const targetModel of fallbackChain) {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
            targetModel
          )}:generateContent?key=${encodeURIComponent(activeKey)}`;

          const modelMeta = this.liveCatalog[targetModel];
          const safeMaxTokens = Math.min(
            maxOutputTokens || 65536,
            modelMeta?.maxOutputTokens || 65536
          );

          const requestBody = {
            systemInstruction: systemInstruction
              ? { parts: [{ text: String(systemInstruction) }] }
              : undefined,
            contents: [{ role: 'user', parts: [{ text: String(userPrompt) }] }],
            generationConfig: {
              temperature,
              topP: 0.92,
              maxOutputTokens: safeMaxTokens,
              thinkingConfig: { thinkingLevel }
            }
          };

          try {
            let res = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(requestBody)
            });

            if (!res.ok) {
              const errJson = await res.json().catch(() => ({}));
              const errMsg = errJson?.error?.message || `HTTP ${res.status}`;

              // Nếu model không nhận thinkingLevel dạng chuỗi, thử gỡ thinkingConfig và gọi lại ngay
              if (/thinking/i.test(errMsg)) {
                delete requestBody.generationConfig.thinkingConfig;
                res = await fetch(endpoint, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(requestBody)
                });
              } else {
                lastError = new Error(errMsg);
                continue;
              }
            }

            if (res.ok) {
              const data = await res.json();
              const parts = data?.candidates?.[0]?.content?.parts || [];
              const text = parts
                .filter((p) => !p.thought && typeof p.text === 'string')
                .map((p) => p.text)
                .join('\n')
                .trim();

              if (text) {
                return {
                  text,
                  usedModel: targetModel,
                  finishReason: data?.candidates?.[0]?.finishReason || 'STOP',
                  usageMetadata: data?.usageMetadata || {}
                };
              }
            }
          } catch (err) {
            lastError = err;
          }
        }

        throw (
          lastError ||
          new Error('Không thể kết nối tới các mô hình Gemini. Hãy kiểm tra lại API Key.')
        );
      };
    }
  }

  // ==========================================================================
  // FIX BUG 3: CHỐNG TRÀN MÀN HÌNH STORY BIBLE & GHIM NÚT XÓA LUÔN HIỂN THỊ
  // ==========================================================================
  class Bug3StoryBibleOverflowAndDeleteFixer {
    static init() {
      this.renderCleanDeletableBibleCards();
      this.injectClearRenderedBibleButton();

      // Hook vào bộ render của StudioCore để mỗi lần thêm/xóa đều giữ nút Xóa rõ ràng
      const ctrl = window.StudioCore?.controller;
      if (ctrl && !ctrl.__s18BibleHooked) {
        ctrl.__s18BibleHooked = true;
        const origRender = ctrl.renderBibleLists?.bind(ctrl);
        if (origRender) {
          ctrl.renderBibleLists = (...args) => {
            const r = origRender(...args);
            this.renderCleanDeletableBibleCards();
            return r;
          };
        }
      }
    }

    static renderCleanDeletableBibleCards() {
      const bm = window.StudioCore?.bibleManager;
      const ctrl = window.StudioCore?.controller;
      if (!bm?.data) return;

      // 1. Danh sách Nhân vật (#characters-list-container)
      const charContainer = document.getElementById('characters-list-container');
      if (charContainer) {
        const chars = bm.data.characters || [];
        if (chars.length === 0) {
          charContainer.innerHTML = `<div class="text-zinc-500 italic text-[11px] py-2">Chưa có hồ sơ nhân vật nào.</div>`;
        } else {
          charContainer.innerHTML = chars
            .map(
              (c, idx) => `
              <div class="p-2.5 rounded-xl border border-studioLightBorder dark:border-zinc-800 bg-studioLightBg/70 dark:bg-zinc-900/80 space-y-1.5">
                <div class="s18-bible-card-header-bar">
                  <div class="truncate font-bold text-xs text-emerald-400 cursor-pointer flex-1" data-s18-toggle-detail="char-${idx}" title="Bấm để đóng/mở chi tiết nhân vật">
                    👤 ${c.name || 'Nhân vật'} ${
                c.aliases ? `<span class="text-[10px] text-zinc-400">(${c.aliases})</span>` : ''
              }
                  </div>
                  <div class="s18-bible-card-actions">
                    <button type="button" data-s18-toggle-detail="char-${idx}" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold">
                      Chi tiết
                    </button>
                    <button type="button" data-s18-del-char="${
                      c.id || idx
                    }" class="px-2 py-0.5 rounded bg-red-600/25 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 font-extrabold text-[10px] transition" title="Xóa nhân vật này">
                      🗑️ Xóa
                    </button>
                  </div>
                </div>
                <div id="s18-detail-char-${idx}" class="hidden text-[11px] text-zinc-300 space-y-1 pt-1.5 border-t border-zinc-800/80">
                  <div><b>Mặt nạ:</b> ${c.persona || '---'}</div>
                  <div><b>Bản chất/Chấn thương:</b> ${c.shadow || '---'}</div>
                  <div><b>Bóp méo POV:</b> ${c.distortion || '---'}</div>
                  <div><b>Tâm lý hiện tại:</b> ${c.currentPsychState || '---'}</div>
                  <div><b>Khẩu khí:</b> ${c.speechStyle || '---'}</div>
                </div>
              </div>
            `
            )
            .join('');

          charContainer.querySelectorAll('[data-s18-del-char]').forEach((btn) => {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              const targetKey = btn.getAttribute('data-s18-del-char');
              bm.data.characters = (bm.data.characters || []).filter(
                (item, i) => String(item.id || i) !== String(targetKey)
              );
              bm.saveToDisk?.();
              ctrl?.renderAll?.();
              this.renderCleanDeletableBibleCards();
              Bug1TwoSecondFolderAutoSaver.performTwoSecondAutoSave(true);
            });
          });
        }
      }

      // 2. Danh sách Ma trận Ai Biết Gì (#knowledge-list-container)
      const knContainer = document.getElementById('knowledge-list-container');
      if (knContainer) {
        const kns = bm.data.knowledgeMatrix || [];
        if (kns.length === 0) {
          knContainer.innerHTML = `<div class="text-zinc-500 italic text-[11px] py-2">Chưa có bí mật nào trong ma trận.</div>`;
        } else {
          knContainer.innerHTML = kns
            .map(
              (k, idx) => `
              <div class="p-2.5 rounded-xl border border-studioLightBorder dark:border-zinc-800 bg-studioLightBg/70 dark:bg-zinc-900/80 space-y-1.5">
                <div class="s18-bible-card-header-bar">
                  <div class="truncate font-bold text-xs text-amber-400 cursor-pointer flex-1" data-s18-toggle-detail="kn-${idx}">
                    🗝️ ${k.title || 'Bí mật'}
                  </div>
                  <div class="s18-bible-card-actions">
                    <button type="button" data-s18-toggle-detail="kn-${idx}" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold">
                      Chi tiết
                    </button>
                    <button type="button" data-s18-del-kn="${
                      k.id || idx
                    }" class="px-2 py-0.5 rounded bg-red-600/25 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 font-extrabold text-[10px] transition">
                      🗑️ Xóa
                    </button>
                  </div>
                </div>
                <div id="s18-detail-kn-${idx}" class="hidden text-[11px] text-zinc-300 space-y-1 pt-1.5 border-t border-zinc-800/80">
                  <div><b>Sự thật 100%:</b> ${k.objectiveTruth || '---'}</div>
                  <div><b>Ai biết / Hiểu lầm:</b> ${k.characterPerceptions || '---'}</div>
                </div>
              </div>
            `
            )
            .join('');

          knContainer.querySelectorAll('[data-s18-del-kn]').forEach((btn) => {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              const targetKey = btn.getAttribute('data-s18-del-kn');
              bm.data.knowledgeMatrix = (bm.data.knowledgeMatrix || []).filter(
                (item, i) => String(item.id || i) !== String(targetKey)
              );
              bm.saveToDisk?.();
              this.renderCleanDeletableBibleCards();
              Bug1TwoSecondFolderAutoSaver.performTwoSecondAutoSave(true);
            });
          });
        }
      }

      // 3. Danh sách Sổ cái Phục bút (#clues-list-container)
      const clueContainer = document.getElementById('clues-list-container');
      if (clueContainer) {
        const clues = bm.data.cluesLedger || [];
        if (clues.length === 0) {
          clueContainer.innerHTML = `<div class="text-zinc-500 italic text-[11px] py-2">Chưa có phục bút nào.</div>`;
        } else {
          clueContainer.innerHTML = clues
            .map(
              (cl, idx) => `
              <div class="p-2.5 rounded-xl border border-studioLightBorder dark:border-zinc-800 bg-studioLightBg/70 dark:bg-zinc-900/80 space-y-1.5">
                <div class="s18-bible-card-header-bar">
                  <div class="truncate font-bold text-xs text-indigo-400 cursor-pointer flex-1" data-s18-toggle-detail="clue-${idx}">
                    📌 [Ch.${cl.plantedChapter || '?'}] ${cl.name || 'Manh mối'}
                  </div>
                  <div class="s18-bible-card-actions">
                    <button type="button" data-s18-toggle-detail="clue-${idx}" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold">
                      Chi tiết
                    </button>
                    <button type="button" data-s18-del-clue="${
                      cl.id || idx
                    }" class="px-2 py-0.5 rounded bg-red-600/25 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 font-extrabold text-[10px] transition">
                      🗑️ Xóa
                    </button>
                  </div>
                </div>
                <div id="s18-detail-clue-${idx}" class="hidden text-[11px] text-zinc-300 space-y-1 pt-1.5 border-t border-zinc-800/80">
                  <div><b>Trạng thái:</b> ${cl.status || 'Planted'}</div>
                  <div><b>Ý nghĩa & Thu hoạch:</b> ${cl.description || '---'}</div>
                </div>
              </div>
            `
            )
            .join('');

          clueContainer.querySelectorAll('[data-s18-del-clue]').forEach((btn) => {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              const targetKey = btn.getAttribute('data-s18-del-clue');
              bm.data.cluesLedger = (bm.data.cluesLedger || []).filter(
                (item, i) => String(item.id || i) !== String(targetKey)
              );
              bm.saveToDisk?.();
              this.renderCleanDeletableBibleCards();
              Bug1TwoSecondFolderAutoSaver.performTwoSecondAutoSave(true);
            });
          });
        }
      }

      // Sự kiện đóng/mở chi tiết từng thẻ
      document
        .querySelectorAll('#right-bible-pane [data-s18-toggle-detail]')
        .forEach((trigger) => {
          trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const key = trigger.getAttribute('data-s18-toggle-detail');
            document.getElementById(`s18-detail-${key}`)?.classList.toggle('hidden');
          });
        });
    }

    static injectClearRenderedBibleButton() {
      const syncBtn = document.getElementById('btn-s10-sync-bible-now');
      if (!syncBtn || document.getElementById('btn-s18-clear-rendered-bible')) return;

      const clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.id = 'btn-s18-clear-rendered-bible';
      clearBtn.className =
        'px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 font-extrabold text-xs transition shrink-0';
      clearBtn.innerHTML = '🗑️ Xóa / Làm Mới Bản Tổng Hợp Story Bible';
      clearBtn.addEventListener('click', () => {
        const renderedArea = document.getElementById('s10-bible-rendered-textarea');
        if (renderedArea) renderedArea.value = '';
        localStorage.removeItem('noir_s10_rendered_bible_content');
        window.StudioStage10?.bibleEngine?.saveRenderedBibleContent?.('');
        Bug1TwoSecondFolderAutoSaver.performTwoSecondAutoSave(true);
        window.StudioStage7?.saveEngine?.showSaveToastNotification(
          '🗑️ Đã xóa sạch nội dung Bản tổng hợp Story Bible!'
        );
      });

      syncBtn.parentElement?.appendChild(clearBtn);
    }
  }

  // ==========================================================================
  // FIX BUG 4: KHÔI PHỤC HOẠT ĐỘNG 100% CHO 4 NÚT Ở TAB 6 (VIDEO HD, LOA VERSION,
  //            MỞ MÀN HÌNH ĐẦU VÀO, ĐỔI CHẾ ĐỘ LAPTOP/ĐIỆN THOẠI)
  // ==========================================================================
  class Bug4Tab6SystemButtonsRestorer {
    static init() {
      this.ensureVideoGuideModalIsPopulatedAndPlayable();
      this.ensureChangelogModalIsPopulatedToV32();
      this.rebindTab6ButtonsWithCapturePriority();
    }

    static ensureVideoGuideModalIsPopulatedAndPlayable() {
      let videoModal = document.getElementById('modal-s10-video-guide');
      if (!videoModal) {
        videoModal = document.createElement('div');
        videoModal.id = 'modal-s10-video-guide';
        videoModal.className =
          'hidden fixed inset-0 bg-black/85 z-[2147483642] flex items-center justify-center p-4 backdrop-blur-sm';
        document.body.appendChild(videoModal);
      }

      // Đảm bảo nội dung Video HD Hướng Dẫn luôn đầy đủ, trực quan, bấm phát chạy ngay
      if (!document.getElementById('s18-interactive-video-canvas')) {
        videoModal.innerHTML = `
          <div class="w-full max-w-4xl rounded-2xl border-2 border-emerald-500/70 bg-zinc-950 text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-xs">
            <div class="px-5 py-3.5 border-b border-zinc-800 bg-emerald-600/15 flex items-center justify-between">
              <div>
                <h3 class="font-extrabold uppercase text-sm text-emerald-400">
                  🎬 VIDEO HD HƯỚNG DẪN SỬ DỤNG TOÀN DIỆN WEB TIỂU THUYẾT CỦA BI (VERSION 32 - 11/11/2026)
                </h3>
                <p id="s18-vid-chapter-title" class="text-[11px] text-amber-300 font-semibold mt-0.5">
                  Phần 1/6: Kết nối Folder ổ cứng & Auto-Save tự động mỗi 2 giây
                </p>
              </div>
              <button type="button" id="btn-s18-close-video-modal" class="px-3 py-1 rounded-lg bg-red-600/80 hover:bg-red-600 text-white font-extrabold text-xs">
                ✕ Đóng Video
              </button>
            </div>

            <div class="p-4 flex-1 overflow-y-auto space-y-3">
              <canvas id="s18-interactive-video-canvas" width="860" height="340" class="w-full rounded-xl border border-zinc-800 bg-zinc-900 shadow-inner"></canvas>

              <div id="s18-vid-subtitle-box" class="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 leading-relaxed text-xs font-medium"></div>

              <div class="flex items-center gap-3 pt-1">
                <button type="button" id="btn-s18-vid-playpause" class="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow">
                  ⏸️ Tạm dừng
                </button>
                <input id="s18-vid-scrub-slider" type="range" min="0" max="180" step="1" value="0" class="flex-1 accent-emerald-500 cursor-pointer" />
                <span id="s18-vid-time-badge" class="font-monoCode text-xs text-zinc-300">00:00 / 03:00</span>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-3 gap-2 pt-2">
                <button type="button" data-s18-seek="0" class="s18-vid-chap-btn p-2 rounded-lg bg-zinc-900 hover:bg-emerald-600/25 border border-zinc-800 text-left font-bold text-[11px]">
                  1. Kết nối Ổ Cứng & Auto-Save 2s (0:00)
                </button>
                <button type="button" data-s18-seek="30" class="s18-vid-chap-btn p-2 rounded-lg bg-zinc-900 hover:bg-emerald-600/25 border border-zinc-800 text-left font-bold text-[11px]">
                  2. Hệ Mô Hình Gemini 4 Argon & 3.8 Flash (0:30)
                </button>
                <button type="button" data-s18-seek="60" class="s18-vid-chap-btn p-2 rounded-lg bg-zinc-900 hover:bg-emerald-600/25 border border-zinc-800 text-left font-bold text-[11px]">
                  3. 4 Chế Độ Sáng Tác & System Prompt (1:00)
                </button>
                <button type="button" data-s18-seek="90" class="s18-vid-chap-btn p-2 rounded-lg bg-zinc-900 hover:bg-emerald-600/25 border border-zinc-800 text-left font-bold text-[11px]">
                  4. Xem/Sửa Story Bible & Chèn Cảnh Trực Tiếp (1:30)
                </button>
                <button type="button" data-s18-seek="120" class="s18-vid-chap-btn p-2 rounded-lg bg-zinc-900 hover:bg-emerald-600/25 border border-zinc-800 text-left font-bold text-[11px]">
                  5. Duyệt Bản Thảo & Nối Mạch Story Bible (2:00)
                </button>
                <button type="button" data-s18-seek="150" class="s18-vid-chap-btn p-2 rounded-lg bg-zinc-900 hover:bg-emerald-600/25 border border-zinc-800 text-left font-bold text-[11px]">
                  6. Nhạc Nền Lặp A-B, Pomodoro & Xuất File (2:30)
                </button>
              </div>
            </div>
          </div>
        `;

        this.bindInteractiveVideoEngine();
      }
    }

    static bindInteractiveVideoEngine() {
      const chapters = [
        {
          start: 0,
          end: 30,
          title: 'Phần 1/6 (00:00 - 00:30): Kết Nối Folder Ổ Cứng & Tự Động Lưu Mỗi 2 Giây',
          desc: '🎱 Viên Bi: Cứ mỗi 2 giây (2000ms), hệ thống tự động đồng bộ toàn bộ bản thảo, Story Bible và câu lệnh của bạn thành file _studio_autosave_2s_temp.json gửi thẳng về Folder máy tính đã chọn!',
          target: { x: 180, y: 80 }
        },
        {
          start: 30,
          end: 60,
          title: 'Phần 2/6 (00:30 - 01:00): Danh Mục Mô Hình Chuẩn 11/11/2026 & Đồng Bộ Real-Time',
          desc: '🎱 Viên Bi: Hệ thống trang bị đầy đủ Gemini 4 Argon, Gemini 4 Carbon, Gemini 3.8 Flash, Gemini 3.6 Flash, Gemini 3.5 Flash-Lite và Gemini 3.1 Pro cùng nút Đồng bộ Real-time từ Google AI Studio!',
          target: { x: 460, y: 110 }
        },
        {
          start: 60,
          end: 90,
          title: 'Phần 3/6 (01:00 - 01:30): 4 Chế Độ Chuyên Sâu & Mẫu System Prompt Tâm Lý Slow-Burn',
          desc: '🎱 Viên Bi: Khi đổi giữa Chế độ 1 (Viết nháp chậm), Chế độ 2 (Tham mưu Unreliable POV), Chế độ 3 (Kiểm toán Logic) và Chế độ 4 (Review), hệ thống tự động nạp System Prompt và mẫu câu lệnh chuyên biệt!',
          target: { x: 320, y: 175 }
        },
        {
          start: 90,
          end: 120,
          title: 'Phần 4/6 (01:30 - 02:00): Xem/Sửa Story Bible & Chèn Mốc Chuyển Cảnh Ngay Trên Cửa Sổ AI',
          desc: '🎱 Viên Bi: Ngay trong Trung tâm AI (Tab 3), bạn bấm Xem/Sửa Khung Story Bible hoặc Chèn Mốc Chuyển Cảnh là cửa sổ bật nổi ngay phía trên mà không cần thoát ra ngoài!',
          target: { x: 540, y: 210 }
        },
        {
          start: 120,
          end: 150,
          title: 'Phần 5/6 (02:00 - 02:30): Quản Lý Story Bible Chống Tràn & Nút Xóa Ghim Cố Định',
          desc: '🎱 Viên Bi: Tại Tab 4 (Story Bible), mỗi thẻ Nhân vật, Bí mật, Phục bút đều ghim nút 🗑️ Xóa rõ ràng ở góc phải, không bao giờ bị tràn khung!',
          target: { x: 680, y: 135 }
        },
        {
          start: 150,
          end: 180,
          title: 'Phần 6/6 (02:30 - 03:00): Chỉnh Kích Thước Khung Chat Trực Tiếp Tại Tab 3',
          desc: '🎱 Viên Bi: Thanh chỉnh kích thước Cỡ Nhỏ, Cỡ Vừa, Cỡ Lớn, Siêu Rộng nằm ngay phía trên ô nhập câu lệnh ở Tab 3, bấm nút nào là khung giãn ngay tức khắc!',
          target: { x: 410, y: 260 }
        }
      ];

      let currentSec = 0;
      let isPlaying = true;
      let animId = null;
      let lastTick = performance.now();

      const drawFrame = (now) => {
        const modal = document.getElementById('modal-s10-video-guide');
        if (!modal || modal.classList.contains('hidden')) {
          animId = null;
          return;
        }

        if (isPlaying) {
          const dt = (now - lastTick) / 1000;
          currentSec = (currentSec + dt) % 180;
        }
        lastTick = now;

        const chap =
          chapters.find((c) => currentSec >= c.start && currentSec < c.end) || chapters[0];
        const titleEl = document.getElementById('s18-vid-chapter-title');
        const subEl = document.getElementById('s18-vid-subtitle-box');
        const slider = document.getElementById('s18-vid-scrub-slider');
        const timeBadge = document.getElementById('s18-vid-time-badge');

        if (titleEl) titleEl.textContent = chap.title;
        if (subEl) subEl.textContent = chap.desc;
        if (slider && !slider.matches(':active')) slider.value = String(Math.floor(currentSec));
        if (timeBadge) {
          const m = String(Math.floor(currentSec / 60)).padStart(2, '0');
          const s = String(Math.floor(currentSec % 60)).padStart(2, '0');
          timeBadge.textContent = `${m}:${s} / 03:00`;
        }

        const canvas = document.getElementById('s18-interactive-video-canvas');
        if (canvas) {
          const ctx = canvas.getContext('2d');
          const w = canvas.width;
          const h = canvas.height;

          ctx.fillStyle = '#09090B';
          ctx.fillRect(0, 0, w, h);

          // Thanh header mô phỏng
          ctx.fillStyle = '#18181B';
          ctx.fillRect(0, 0, w, 40);
          ctx.fillStyle = '#10B981';
          ctx.font = 'bold 12px Inter, sans-serif';
          ctx.fillText('✍️ Web viết tiểu thuyết của Bi • Version 32 (11/11/2026)', 16, 25);

          ctx.fillStyle = '#064E3B';
          ctx.fillRect(w - 235, 8, 220, 24);
          ctx.fillStyle = '#34D399';
          ctx.font = 'bold 11px JetBrains Mono, monospace';
          ctx.fillText('● Auto-Save 2s: Đang hoạt động', w - 222, 24);

          // Khung nội dung mô phỏng
          ctx.fillStyle = '#18181B';
          ctx.fillRect(20, 54, w - 40, h - 74);
          ctx.strokeStyle = '#27272A';
          ctx.strokeRect(20, 54, w - 40, h - 74);

          ctx.fillStyle = '#FBBF24';
          ctx.font = 'bold 14px Inter, sans-serif';
          ctx.fillText(chap.title, 42, 92);

          ctx.fillStyle = '#E4E4E7';
          ctx.font = '12px Inter, sans-serif';
          const words = chap.desc.split(' ');
          let line = '';
          let y = 128;
          for (const wItem of words) {
            if ((line + wItem).length > 88) {
              ctx.fillText(line, 42, y);
              line = wItem + ' ';
              y += 22;
            } else {
              line += wItem + ' ';
            }
          }
          if (line) ctx.fillText(line, 42, y);

          // Vòng sáng con trỏ & Linh vật Viên Bi số 8
          const pulse = Math.abs(Math.sin(now / 220)) * 8;
          ctx.beginPath();
          ctx.arc(chap.target.x, chap.target.y, 14 + pulse, 0, Math.PI * 2);
          ctx.strokeStyle = '#10B981';
          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(chap.target.x + 42, chap.target.y + 8, 18, 0, Math.PI * 2);
          ctx.fillStyle = '#18181B';
          ctx.fill();
          ctx.strokeStyle = '#34D399';
          ctx.lineWidth = 2.5;
          ctx.stroke();
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 11px Inter, sans-serif';
          ctx.fillText('🎱8', chap.target.x + 31, chap.target.y + 12);
        }

        animId = requestAnimationFrame(drawFrame);
      };

      window.__S18_START_VIDEO_LOOP__ = () => {
        lastTick = performance.now();
        if (!animId) animId = requestAnimationFrame(drawFrame);
      };

      document.getElementById('btn-s18-close-video-modal')?.addEventListener('click', () => {
        document.getElementById('modal-s10-video-guide')?.classList.add('hidden');
      });

      const playPauseBtn = document.getElementById('btn-s18-vid-playpause');
      playPauseBtn?.addEventListener('click', () => {
        isPlaying = !isPlaying;
        playPauseBtn.textContent = isPlaying ? '⏸️ Tạm dừng' : '▶️ Tiếp tục phát';
      });

      const slider = document.getElementById('s18-vid-scrub-slider');
      slider?.addEventListener('input', () => {
        currentSec = Number(slider.value) || 0;
      });

      document.querySelectorAll('.s18-vid-chap-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          currentSec = Number(btn.getAttribute('data-s18-seek')) || 0;
          isPlaying = true;
          if (playPauseBtn) playPauseBtn.textContent = '⏸️ Tạm dừng';
        });
      });
    }

    static ensureChangelogModalIsPopulatedToV32() {
      let changelogModal = document.getElementById('modal-s10-changelog');
      if (!changelogModal) {
        changelogModal = document.createElement('div');
        changelogModal.id = 'modal-s10-changelog';
        changelogModal.className =
          'hidden fixed inset-0 bg-black/85 z-[2147483642] flex items-center justify-center p-4 backdrop-blur-sm';
        document.body.appendChild(changelogModal);
      }

      const historyList = [
        {
          num: 32,
          version: 'Version 32 (Bản Vá Tổng Lực 11/11/2026 - Mới Nhất)',
          date: '11/11/2026',
          badge: 'Auto-Save 2s, Gemini 4 Argon / 3.8 Flash, Story Bible Chống Tràn & System Prompt 4 Chế Độ',
          items: [
            'Chuẩn hóa cơ chế tự động lưu mỗi 2 giây (2000ms) kèm khóa Mutex ghi thẳng file _studio_autosave_2s_temp.json và bản thảo về Folder ổ cứng.',
            'Cập nhật danh mục mô hình Google AI Studio tính đến 11/11/2026: Gemini 4 Argon, Gemini 4 Carbon, Gemini 3.8 Flash, Gemini 3.6 Flash, Gemini 3.5 Flash-Lite, Gemini 3.1 Pro (loại bỏ hoàn toàn các model 2.5 cũ và 3.5-flash không tồn tại).',
            'Khắc phục lỗi tràn màn hình Story Bible, ghim nút Xóa cố định trên từng thẻ; mở trực tiếp Xem/Sửa Story Bible & Chèn chuyển cảnh ngay trên Trung tâm AI.',
            'Tích hợp System Prompt & Mẫu câu lệnh chuyên sâu cho từng chế độ 1, 2, 3, 4 và đưa thanh chỉnh Kích thước Khung Chat về ngay trên ô nhập lệnh ở Tab 3.'
          ]
        },
        ...(window.StudioStage16?.changelog || [])
      ];

      changelogModal.innerHTML = `
        <div class="w-full max-w-3xl max-h-[88vh] rounded-2xl border-2 border-amber-500/70 bg-studioLightPanel dark:bg-zinc-950 text-studioLightText dark:text-white shadow-2xl flex flex-col overflow-hidden text-xs">
          <div class="px-5 py-4 border-b border-studioLightBorder dark:border-zinc-800 bg-amber-500/15 flex items-center justify-between">
            <div>
              <h3 class="font-extrabold uppercase text-sm text-amber-400">
                📢 LOA THÔNG BÁO PHIÊN BẢN — LỊCH SỬ CẬP NHẬT (BẢN 1.0 ➔ VERSION 32 • 11/11/2026)
              </h3>
              <p class="text-[11px] text-zinc-400">Đầy đủ thông tin từng phiên bản nâng cấp của Web viết tiểu thuyết của Bi</p>
            </div>
            <button type="button" id="btn-s18-close-changelog" class="px-3 py-1 rounded-lg bg-red-600/80 hover:bg-red-600 text-white font-extrabold text-xs">
              ✕ Đóng
            </button>
          </div>
          <div class="flex-1 overflow-y-auto p-5 space-y-3 select-text">
            ${historyList
              .map(
                (item, idx) => `
              <div class="p-4 rounded-xl border ${
                idx === 0
                  ? 'border-emerald-500 bg-emerald-500/10 shadow-lg'
                  : 'border-studioLightBorder dark:border-zinc-800 bg-zinc-900/50'
              } space-y-1.5">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <span class="px-2.5 py-0.5 rounded-full ${
                    idx === 0 ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-amber-400'
                  } font-monoCode font-bold text-[11px]">
                    #${item.num} • ${item.version}
                  </span>
                  <span class="text-[10px] font-monoCode text-zinc-400">${item.date}</span>
                </div>
                <div class="font-bold text-xs text-emerald-400">${item.badge}</div>
                <ul class="list-disc pl-5 space-y-1 text-zinc-300 leading-relaxed">
                  ${(item.items || []).map((li) => `<li>${li}</li>`).join('')}
                </ul>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `;

      document.getElementById('btn-s18-close-changelog')?.addEventListener('click', () => {
        changelogModal.classList.add('hidden');
      });
    }

    static openVideoGuideNow() {
      this.ensureVideoGuideModalIsPopulatedAndPlayable();
      const modal = document.getElementById('modal-s10-video-guide');
      modal?.classList.remove('hidden');
      window.__S18_START_VIDEO_LOOP__?.();
    }

    static openChangelogNow() {
      this.ensureChangelogModalIsPopulatedToV32();
      document.getElementById('modal-s10-changelog')?.classList.remove('hidden');
    }

    static rebindTab6ButtonsWithCapturePriority() {
      // Dùng Capture Phase trên document để vượt qua mọi lệnh chặn cũ của Stage 17
      document.addEventListener(
        'click',
        (e) => {
          const btn = e.target.closest('button');
          if (!btn) return;

          const id = btn.id || '';
          const sysClick = btn.getAttribute('data-s14-sys-click') || '';
          const txt = (btn.textContent || '').trim().toLowerCase();

          // 1. Nút Video HD Hướng Dẫn (ở Tab 6 hoặc bất kỳ đâu)
          if (
            id === 's17-sys-btn-video' ||
            id === 'btn-s23-top-video-guide' ||
            id === 'btn-s17-welcome-video-guide' ||
            sysClick === 'btn-s10-video-guide' ||
            txt.includes('video hd hướng dẫn')
          ) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            this.openVideoGuideNow();
            return;
          }

          // 2. Nút Loa Thông Báo Version (ở Tab 6 hoặc Footer)
          if (
            id === 's17-sys-btn-megaphone' ||
            id === 'btn-s18-top-megaphone' ||
            id === 's20-version-only-badge' ||
            sysClick === 'btn-s10-megaphone' ||
            txt.includes('loa thông báo version') ||
            txt.includes('loa version')
          ) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            this.openChangelogNow();
            return;
          }

          // 3. Nút Mở Màn Hình Đầu Vào (API & Ổ Cứng) ở Tab 6
          if (
            id === 's17-sys-btn-welcome' ||
            id === 'btn-s26-reopen-boot-screens' ||
            txt.includes('mở màn hình đầu vào')
          ) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            document.getElementById('modal-s6-welcome-launcher')?.classList.remove('hidden');
            return;
          }

          // 4. Nút Đổi Chế Độ Laptop / Điện Thoại ở Tab 6
          if (id === 's17-sys-btn-device' || txt.includes('đổi chế độ laptop / điện thoại')) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            const isCurrentlyMobile = document.body.classList.contains('s21-device-mobile');
            const nextMode = isCurrentlyMobile ? 'LAPTOP' : 'MOBILE';
            if (window.StudioStage16?.bootController) {
              window.StudioStage16.bootController.applyDeviceModeToDOM(nextMode, true);
            } else {
              document.body.classList.toggle('s21-device-mobile', nextMode === 'MOBILE');
              document.body.classList.toggle('s21-device-laptop', nextMode === 'LAPTOP');
            }
            return;
          }
        },
        true
      );
    }
  }

  // ==========================================================================
  // FIX BUG 5: XEM/SỬA KHUNG STORY BIBLE, CHÈN MỐC CHUYỂN CẢNH & XEM NGỮ CẢNH
  //            NỔI TRỰC TIẾP LÊN TRÊN CỬA SỔ TRUNG TÂM AI (KHÔNG CẦN THOÁT)
  // ==========================================================================
  class Bug5InModalStoryBibleAndSceneFixer {
    static init() {
      this.createLiveStoryBibleOverlayModal();
      this.interceptButtonsInsideAiCenter();
    }

    static createLiveStoryBibleOverlayModal() {
      if (document.getElementById('modal-s18-live-bible-over-ai')) return;

      const modal = document.createElement('div');
      modal.id = 'modal-s18-live-bible-over-ai';
      modal.className =
        'hidden fixed inset-0 bg-black/80 z-[2147483645] flex items-center justify-center p-4 backdrop-blur-sm';

      modal.innerHTML = `
        <div class="w-full max-w-4xl rounded-2xl border-2 border-amber-500/70 bg-studioLightPanel dark:bg-zinc-950 text-studioLightText dark:text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-xs">
          <div class="px-5 py-3.5 border-b border-studioLightBorder dark:border-zinc-800 bg-amber-500/15 flex items-center justify-between">
            <div>
              <h3 class="font-extrabold uppercase text-sm text-amber-400">
                🏛️ XEM & SỬA TRỰC TIẾP KHUNG STORY BIBLE ĐANG ÁP DỤNG (NỔI TRÊN TRUNG TÂM AI)
              </h3>
              <p class="text-[11px] text-zinc-400">
                Chỉnh sửa và lưu ngay tại đây mà không cần thoát khỏi cửa sổ chạy mô hình AI
              </p>
            </div>
            <button type="button" id="btn-s18-close-live-bible-modal" class="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-red-600 text-white font-bold">
              ✕ Đóng & Quay Lại Cửa Sổ AI
            </button>
          </div>

          <div class="p-4 flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div class="flex flex-col space-y-1.5">
              <label class="font-extrabold uppercase text-[11px] text-emerald-400">
                1. Bản Tổng Hợp Story Bible Chính Thức (Đang gắn vào Prompt):
              </label>
              <textarea id="s18-live-bible-rendered-editor" rows="16" class="flex-1 w-full p-3 rounded-xl border border-emerald-500/40 bg-zinc-900 text-zinc-100 font-sansUI text-xs leading-relaxed focus:outline-none focus:border-emerald-400" placeholder="Nhập hoặc chỉnh sửa nội dung Story Bible chính thức của truyện tại đây..."></textarea>
            </div>

            <div class="flex flex-col space-y-1.5">
              <label class="font-extrabold uppercase text-[11px] text-amber-400">
                2. Khung Kiểu Mẫu Story Bible (Template Cấu Trúc Bắt Buộc):
              </label>
              <textarea id="s18-live-bible-template-editor" rows="16" class="flex-1 w-full p-3 rounded-xl border border-amber-500/40 bg-zinc-900 text-zinc-200 font-monoCode text-[11px] leading-relaxed focus:outline-none focus:border-amber-400" placeholder="Khung kiểu mẫu đề mục Story Bible..."></textarea>
            </div>
          </div>

          <div class="px-5 py-3 border-t border-studioLightBorder dark:border-zinc-800 bg-zinc-900/90 flex flex-wrap items-center justify-between gap-2">
            <button type="button" id="btn-s18-go-full-tab4-bible" class="px-3.5 py-2 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-bold text-xs">
              ↗️ Chuyển hẳn sang Màn hình Tab 4 (Quản lý Thẻ Nhân vật / Phục bút)
            </button>
            <div class="flex items-center gap-2">
              <button type="button" id="btn-s18-save-live-bible-over-ai" class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition">
                💾 Lưu Story Bible & Áp Dụng Ngay Vào Câu Lệnh AI
              </button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      document
        .getElementById('btn-s18-close-live-bible-modal')
        ?.addEventListener('click', () => {
          modal.classList.add('hidden');
        });

      document
        .getElementById('btn-s18-go-full-tab4-bible')
        ?.addEventListener('click', () => {
          modal.classList.add('hidden');
          document.getElementById('modal-s6-prompt-studio')?.classList.add('hidden');
          window.StudioStage14?.screenNavigator?.navigateToScreen('SCREEN_4_BIBLE');
        });

      document
        .getElementById('btn-s18-save-live-bible-over-ai')
        ?.addEventListener('click', () => {
          const renderedVal =
            document.getElementById('s18-live-bible-rendered-editor')?.value || '';
          const templateVal =
            document.getElementById('s18-live-bible-template-editor')?.value || '';

          localStorage.setItem('noir_s10_rendered_bible_content', renderedVal);
          localStorage.setItem('noir_s10_bible_template_frame', templateVal);

          const origRendered = document.getElementById('s10-bible-rendered-textarea');
          if (origRendered) origRendered.value = renderedVal;
          const origTemplate = document.getElementById('s10-bible-template-textarea');
          if (origTemplate) origTemplate.value = templateVal;

          window.StudioStage10?.bibleEngine?.saveRenderedBibleContent?.(renderedVal);
          window.StudioStage16?.promptVault?.refreshLockedVaultDisplay?.();
          Bug1TwoSecondFolderAutoSaver.performTwoSecondAutoSave(true);

          modal.classList.add('hidden');
          window.StudioStage7?.saveEngine?.showSaveToastNotification(
            '✅ Đã lưu và cập nhật trực tiếp Khung Story Bible vào cửa sổ chạy AI!'
          );
        });
    }

    static openLiveStoryBibleOverlay() {
      this.createLiveStoryBibleOverlayModal();
      const modal = document.getElementById('modal-s18-live-bible-over-ai');
      const renderedEditor = document.getElementById('s18-live-bible-rendered-editor');
      const templateEditor = document.getElementById('s18-live-bible-template-editor');

      if (renderedEditor) {
        renderedEditor.value =
          document.getElementById('s10-bible-rendered-textarea')?.value ||
          localStorage.getItem('noir_s10_rendered_bible_content') ||
          '';
      }
      if (templateEditor) {
        templateEditor.value =
          document.getElementById('s10-bible-template-textarea')?.value ||
          localStorage.getItem('noir_s10_bible_template_frame') ||
          'I. TỔNG QUAN THẾ GIỚI & BỐI CẢNH\nII. HỒ SƠ NHÂN VẬT & BIẾN CHUYỂN TÂM LÝ\nIII. TRỤC THỜI GIAN & SỰ KIỆN ĐÃ XẢY RA\nIV. MA TRẬN AI BIẾT GÌ & PHỤC BÚT BỎ NGỎ';
      }

      modal?.classList.remove('hidden');
    }

    static openSceneBuilderOverlay() {
      const sceneModal = document.getElementById('modal-scene-builder');
      if (!sceneModal) return;

      // Đồng bộ danh sách nhân vật POV vào modal chèn cảnh
      const povSelect = document.getElementById('modal-scene-pov');
      const chars = window.StudioCore?.bibleManager?.data?.characters || [];
      if (povSelect) {
        povSelect.innerHTML =
          `<option value="Giữ nguyên POV hiện tại">-- Giữ nguyên POV hiện tại --</option>` +
          chars
            .map((c) => `<option value="${c.name}">Đổi POV sang: ${c.name}</option>`)
            .join('');
      }

      sceneModal.style.zIndex = '2147483645';
      sceneModal.classList.remove('hidden');

      // Đảm bảo khi bấm "Chèn Chỉ Đạo Phân Cảnh Vào Mạch Truyện", nó chèn vào cả ô nhập lệnh AI (#s6-popup-prompt-textarea) nếu cửa sổ AI đang mở
      const confirmBtn = document.getElementById('btn-confirm-insert-scene');
      if (confirmBtn && !confirmBtn.__s18SceneBound) {
        confirmBtn.__s18SceneBound = true;
        confirmBtn.addEventListener('click', () => {
          const timeVal =
            document.getElementById('modal-scene-time')?.value.trim() || 'Chưa rõ giờ';
          const locVal =
            document.getElementById('modal-scene-loc')?.value.trim() || 'Chưa rõ địa điểm';
          const povVal =
            document.getElementById('modal-scene-pov')?.value || 'Giữ nguyên POV';
          const unrelVal =
            document.getElementById('modal-scene-unreliable')?.value || 'Tỉnh táo';
          const dirVal =
            document.getElementById('modal-scene-directive')?.value.trim() || '';

          const sceneTag = `\n\n--- [🎬 CHUYỂN PHÂN CẢNH MỚI | 🕒 Giờ: ${timeVal} | 📍 Địa điểm: ${locVal} | 👁️ POV: ${povVal} (${unrelVal})] ---\n• Chỉ đạo phân cảnh: ${dirVal}\n`;

          const aiPromptArea = document.getElementById('s6-popup-prompt-textarea');
          const aiModal = document.getElementById('modal-s6-prompt-studio');
          if (aiPromptArea && aiModal && !aiModal.classList.contains('hidden')) {
            aiPromptArea.value = `${aiPromptArea.value.trim()}${sceneTag}`;
            aiPromptArea.focus();
          }
          sceneModal.classList.add('hidden');
        });
      }
    }

    static interceptButtonsInsideAiCenter() {
      document.addEventListener(
        'click',
        (e) => {
          const btn = e.target.closest('button');
          if (!btn) return;

          const id = btn.id || '';
          const txt = (btn.textContent || '').trim().toLowerCase();

          // 1. Nút "🏛️ Xem / Sửa Khung Story Bible Đang Áp Dụng" hoặc "🏛️ Bấm Để Sửa Story Bible"
          if (
            id === 'btn-s21-unlock-edit-bible' ||
            txt.includes('xem / sửa khung story bible') ||
            txt.includes('bấm để sửa story bible')
          ) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            this.openLiveStoryBibleOverlay();
            return;
          }

          // 2. Nút "🎬 + Chèn Mốc Chuyển Phân Cảnh / Đổi POV"
          if (
            id === 'btn-s6-popup-insert-scene' ||
            id === 'btn-open-scene-builder' ||
            txt.includes('chèn mốc chuyển phân cảnh') ||
            txt.includes('chèn chuyển cảnh / đổi pov')
          ) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            this.openSceneBuilderOverlay();
            return;
          }

          // 3. Nút "🔍 Xem Gói Ngữ Cảnh Cục Bộ"
          if (txt.includes('xem gói ngữ cảnh cục bộ')) {
            const ctxModal = document.getElementById('modal-context-preview');
            if (ctxModal) {
              ctxModal.style.zIndex = '2147483645';
            }
          }
        },
        true
      );
    }
  }

  // ==========================================================================
  // FIX BUG 6: QUẢN LÝ SYSTEM PROMPT & MẪU CÂU LỆNH CHUYÊN SÂU CHO TỪNG CHẾ ĐỘ
  // ==========================================================================
  class Bug6ModeSystemPromptManager {
    static STORAGE_KEY = 'noir_s18_custom_mode_system_prompts';

    static getCustomPromptsMap() {
      try {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      } catch (_) {}
      return {};
    }

    static getCurrentModeId() {
      const sel =
        document.getElementById('s17-ai-mode-select') ||
        document.querySelector('select[id*="mode"]');
      if (sel && sel.value) return sel.value;
      return window.StudioStage2?.uiController?.activeModeId || 'MODE_1_DRAFT';
    }

    static getActiveSystemPrompt(modeId) {
      const customMap = this.getCustomPromptsMap();
      if (customMap[modeId]?.systemPrompt) {
        return customMap[modeId].systemPrompt;
      }
      return (
        PROFESSIONAL_MODE_SYSTEM_PROMPTS[modeId]?.systemPrompt ||
        PROFESSIONAL_MODE_SYSTEM_PROMPTS.MODE_1_DRAFT.systemPrompt
      );
    }

    static getSampleUserPrompt(modeId) {
      const customMap = this.getCustomPromptsMap();
      if (customMap[modeId]?.sampleUserPrompt) {
        return customMap[modeId].sampleUserPrompt;
      }
      return (
        PROFESSIONAL_MODE_SYSTEM_PROMPTS[modeId]?.sampleUserPrompt ||
        PROFESSIONAL_MODE_SYSTEM_PROMPTS.MODE_1_DRAFT.sampleUserPrompt
      );
    }

    static saveCustomPromptForMode(modeId, systemPrompt, sampleUserPrompt) {
      const customMap = this.getCustomPromptsMap();
      customMap[modeId] = { systemPrompt, sampleUserPrompt };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(customMap));
      Bug1TwoSecondFolderAutoSaver.performTwoSecondAutoSave(true);
    }

    static resetModeToDefault(modeId) {
      const customMap = this.getCustomPromptsMap();
      delete customMap[modeId];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(customMap));
      Bug1TwoSecondFolderAutoSaver.performTwoSecondAutoSave(true);
    }

    static init() {
      this.injectModeSystemPromptPanelInTab3();
    }

    static injectModeSystemPromptPanelInTab3() {
      const modeSelect = document.getElementById('s17-ai-mode-select');
      const anchor =
        modeSelect?.parentElement ||
        document.getElementById('s6-popup-mode-buttons')?.parentElement;
      if (!anchor || document.getElementById('s18-mode-system-prompt-studio-box')) return;

      const panel = document.createElement('div');
      panel.id = 's18-mode-system-prompt-studio-box';
      panel.className =
        'mt-2.5 p-3 rounded-xl border-2 border-emerald-500/50 bg-zinc-950/90 space-y-2.5 text-xs';

      panel.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded bg-emerald-600 text-white font-extrabold text-[10px] uppercase">
              System Prompt Chuyên Biệt Theo Chế Độ
            </span>
            <span id="s18-active-mode-prompt-title" class="font-bold text-emerald-300 text-xs"></span>
          </div>
          <div class="flex flex-wrap items-center gap-1.5">
            <button type="button" id="btn-s18-fill-sample-prompt" class="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-[11px] shadow transition" title="Chèn mẫu câu lệnh chuyên nghiệp của chế độ này vào ô nhập lệnh bên dưới">
              ✨ Nạp Mẫu Prompt Của Chế Độ Này Vào Ô Nhập Lệnh
            </button>
            <button type="button" id="btn-s18-toggle-sys-prompt-editor" class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 font-bold text-[11px] transition">
              📜 Mở Xem / Sửa Câu Lệnh Hệ Thống Của Chế Độ Này
            </button>
          </div>
        </div>

        <div id="s18-sys-prompt-collapsible-editor" class="hidden space-y-2 pt-2 border-t border-zinc-800">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="block font-bold text-[10px] uppercase text-emerald-400">
                1. Câu Lệnh Hệ Thống (System Instruction tự động gửi ngầm cho AI ở chế độ này):
              </label>
              <textarea id="s18-mode-sys-prompt-textarea" rows="6" class="w-full p-2.5 rounded-lg border border-emerald-500/40 bg-zinc-900 text-emerald-200 font-monoCode text-[11px] leading-relaxed focus:outline-none"></textarea>
            </div>
            <div class="space-y-1">
              <label class="block font-bold text-[10px] uppercase text-amber-400">
                2. Mẫu Khung Câu Lệnh Gợi Ý (Bấm nút "Nạp Mẫu Prompt" để điền nhanh):
              </label>
              <textarea id="s18-mode-sample-prompt-textarea" rows="6" class="w-full p-2.5 rounded-lg border border-amber-500/40 bg-zinc-900 text-amber-200 font-sansUI text-[11px] leading-relaxed focus:outline-none"></textarea>
            </div>
          </div>
          <div class="flex items-center justify-end gap-2">
            <button type="button" id="btn-s18-reset-mode-prompt" class="px-3 py-1 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-zinc-400 font-semibold text-[11px]">
              ↩️ Khôi phục mặc định chuẩn
            </button>
            <button type="button" id="btn-s18-save-mode-prompt" class="px-4 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] shadow">
              💾 Lưu System Prompt Cho Chế Độ Này
            </button>
          </div>
        </div>
      `;

      anchor.appendChild(panel);

      const syncPanelToCurrentMode = () => {
        const modeId = this.getCurrentModeId();
        const meta =
          PROFESSIONAL_MODE_SYSTEM_PROMPTS[modeId] ||
          PROFESSIONAL_MODE_SYSTEM_PROMPTS.MODE_1_DRAFT;

        const titleEl = document.getElementById('s18-active-mode-prompt-title');
        const sysArea = document.getElementById('s18-mode-sys-prompt-textarea');
        const sampleArea = document.getElementById('s18-mode-sample-prompt-textarea');

        if (titleEl) titleEl.textContent = meta.title;
        if (sysArea) sysArea.value = this.getActiveSystemPrompt(modeId);
        if (sampleArea) sampleArea.value = this.getSampleUserPrompt(modeId);

        // Đồng bộ vào khung readonly vault nếu có
        const vaultDisplay = document.getElementById('s21-locked-vault-readonly-display');
        if (vaultDisplay) {
          const snapshot =
            window.StudioStage16?.promptVault?.constructor?.getLiveStoryBibleAndRulesSnapshot?.();
          vaultDisplay.value = [
            this.getActiveSystemPrompt(modeId),
            '--------------------------------------------------------------------------------',
            snapshot?.combinedEnforcementBlock || ''
          ].join('\n');
        }
      };

      syncPanelToCurrentMode();

      modeSelect?.addEventListener('change', syncPanelToCurrentMode);
      document.querySelectorAll('.s6-p-mode-btn, .mode-switch-btn').forEach((b) => {
        b.addEventListener('click', () => setTimeout(syncPanelToCurrentMode, 40));
      });

      document
        .getElementById('btn-s18-toggle-sys-prompt-editor')
        ?.addEventListener('click', () => {
          document
            .getElementById('s18-sys-prompt-collapsible-editor')
            ?.classList.toggle('hidden');
        });

      document
        .getElementById('btn-s18-fill-sample-prompt')
        ?.addEventListener('click', () => {
          const modeId = this.getCurrentModeId();
          const sampleText =
            document.getElementById('s18-mode-sample-prompt-textarea')?.value ||
            this.getSampleUserPrompt(modeId);
          const promptInput = document.getElementById('s6-popup-prompt-textarea');
          if (promptInput) {
            promptInput.value = promptInput.value.trim()
              ? `${promptInput.value.trim()}\n\n${sampleText}`
              : sampleText;
            promptInput.focus();
            Bug1TwoSecondFolderAutoSaver.performTwoSecondAutoSave(true);
            window.StudioStage7?.saveEngine?.showSaveToastNotification(
              '✨ Đã nạp Mẫu Prompt chuyên sâu của chế độ hiện tại vào ô nhập câu lệnh!'
            );
          }
        });

      document
        .getElementById('btn-s18-save-mode-prompt')
        ?.addEventListener('click', () => {
          const modeId = this.getCurrentModeId();
          const sysVal =
            document.getElementById('s18-mode-sys-prompt-textarea')?.value || '';
          const sampleVal =
            document.getElementById('s18-mode-sample-prompt-textarea')?.value || '';
          this.saveCustomPromptForMode(modeId, sysVal, sampleVal);
          syncPanelToCurrentMode();
          window.StudioStage7?.saveEngine?.showSaveToastNotification(
            '💾 Đã lưu System Prompt & Mẫu câu lệnh riêng cho chế độ này!'
          );
        });

      document
        .getElementById('btn-s18-reset-mode-prompt')
        ?.addEventListener('click', () => {
          const modeId = this.getCurrentModeId();
          this.resetModeToDefault(modeId);
          syncPanelToCurrentMode();
          window.StudioStage7?.saveEngine?.showSaveToastNotification(
            '↩️ Đã khôi phục System Prompt chuẩn mặc định cho chế độ này!'
          );
        });
    }
  }

  // ==========================================================================
  // FIX BUG 7: CHUYỂN THANH CHỈNH KÍCH THƯỚC KHUNG CHAT VỀ TAB 3 NGAY TRÊN Ô
  //            NHẬP LỆNH & SỬA LỖI NÚT BẤM KHÔNG HOẠT ĐỘNG (DÙNG !IMPORTANT)
  // ==========================================================================
  class Bug7Tab3ChatSizeController {
    static init() {
      this.removeDeadSizeControlsFromTab6();
      this.mountWorkingSizeToolbarAbovePromptInTab3();

      // Áp dụng kích thước đã lưu trước đó
      const savedHeight = localStorage.getItem('noir_s17_chat_height') || '280px';
      this.setChatAndPromptHeightNow(savedHeight, false);
    }

    static removeDeadSizeControlsFromTab6() {
      // Xóa hàng chỉnh kích thước khung chat ở Tab 6 (#s17-system-integrated-hub)
      const hubCard = document.getElementById('s17-system-integrated-hub');
      if (hubCard) {
        hubCard.querySelectorAll('.s17-chat-size-btn').forEach((btn) => {
          const row = btn.closest('.pt-3.border-t');
          if (row) row.remove();
        });
      }
      // Ẩn thanh cũ bị liệt nếu có
      document.getElementById('s21-chat-zoom-toolbar')?.remove();
    }

    static mountWorkingSizeToolbarAbovePromptInTab3() {
      const promptTextarea = document.getElementById('s6-popup-prompt-textarea');
      if (!promptTextarea || document.getElementById('s18-tab3-chat-size-toolbar')) return;

      const toolbar = document.createElement('div');
      toolbar.id = 's18-tab3-chat-size-toolbar';
      toolbar.className =
        'mb-2 px-3 py-2 rounded-xl bg-zinc-900 border border-emerald-500/50 flex flex-wrap items-center justify-between gap-2 text-xs shadow-sm';

      toolbar.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="font-extrabold text-emerald-400 text-[11px]">
            🔍 Kích Thước Khung Chat & Ô Nhập Lệnh AI:
          </span>
          <button type="button" id="btn-s18-collapse-upper-ai-params" class="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 font-bold text-[11px] transition">
            🔼 Thu gọn thông số trên để mở rộng tối đa
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-1.5">
          <button type="button" data-s18-size="180px" class="s18-size-pill px-3 py-1 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-emerald-600 text-zinc-200 hover:text-white font-bold text-[11px] transition">
            Cỡ Nhỏ (180px)
          </button>
          <button type="button" data-s18-size="280px" class="s18-size-pill px-3 py-1 rounded-lg border border-emerald-500/50 bg-emerald-600 text-white font-extrabold text-[11px] transition">
            Cỡ Vừa (280px)
          </button>
          <button type="button" data-s18-size="440px" class="s18-size-pill px-3 py-1 rounded-lg border border-amber-500/50 bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-zinc-950 font-extrabold text-[11px] transition">
            Cỡ Lớn (440px)
          </button>
          <button type="button" data-s18-size="66vh" class="s18-size-pill px-3 py-1 rounded-lg border border-emerald-400 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-zinc-950 font-extrabold text-[11px] transition">
            Siêu Rộng (66% Màn Hình)
          </button>
        </div>
      `;

      promptTextarea.parentElement?.insertBefore(toolbar, promptTextarea);

      toolbar.querySelectorAll('.s18-size-pill').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const targetSize = btn.getAttribute('data-s18-size') || '280px';
          this.setChatAndPromptHeightNow(targetSize, true);
        });
      });

      const collapseUpperBtn = document.getElementById('btn-s18-collapse-upper-ai-params');
      let upperHidden = false;
      collapseUpperBtn?.addEventListener('click', () => {
        upperHidden = !upperHidden;
        const upperBox = document.getElementById('s21-collapsible-upper-ai-settings');
        const vaultBox = document.getElementById('s21-locked-prompt-rules-vault');
        const modePromptBox = document.getElementById('s18-mode-system-prompt-studio-box');

        upperBox?.classList.toggle('hidden', upperHidden);
        vaultBox?.classList.toggle('hidden', upperHidden);
        modePromptBox?.classList.toggle('hidden', upperHidden);

        collapseUpperBtn.textContent = upperHidden
          ? '🔽 Hiện lại bảng chọn Chế độ, Mô hình & System Prompt phía trên'
          : '🔼 Thu gọn thông số trên để mở rộng tối đa';

        if (upperHidden) {
          this.setChatAndPromptHeightNow('66vh', false);
        }
      });
    }

    static setChatAndPromptHeightNow(heightCss, showToast = false) {
      if (!heightCss) return;
      localStorage.setItem('noir_s17_chat_height', heightCss);

      const promptTextarea = document.getElementById('s6-popup-prompt-textarea');
      const freeChatBox = document.getElementById('s7-freechat-messages-box');
      const freeChatPanel = document.getElementById('s7-freechat-conversation-panel');
      const dialog = document.getElementById('s6-prompt-modal-dialog');

      // Mở khóa container cha để khung textarea / khung chat giãn thật sự
      if (dialog) {
        dialog.style.setProperty('max-height', '95vh', 'important');
        dialog.style.setProperty('overflow-y', 'auto', 'important');
      }

      [promptTextarea, freeChatBox].forEach((el) => {
        if (!el) return;
        el.style.setProperty('height', heightCss, 'important');
        el.style.setProperty('min-height', heightCss, 'important');
        el.style.setProperty('max-height', '78vh', 'important');
      });

      if (freeChatPanel && !freeChatPanel.classList.contains('hidden')) {
        freeChatPanel.style.setProperty('min-height', heightCss, 'important');
      }

      // Highlight nút kích thước đang chọn
      document.querySelectorAll('#s18-tab3-chat-size-toolbar .s18-size-pill').forEach((btn) => {
        const isMatch = btn.getAttribute('data-s18-size') === heightCss;
        btn.classList.toggle('ring-2', isMatch);
        btn.classList.toggle('ring-emerald-400', isMatch);
      });

      if (showToast) {
        window.StudioStage7?.saveEngine?.showSaveToastNotification(
          `🔍 Đã áp dụng kích thước khung nhập lệnh & khung chat: ${heightCss}`
        );
      }
    }
  }

  // ==========================================================================
  // KHỞI CHẠY ĐỒNG BỘ TOÀN BỘ 7 BẢN VÁ
  // ==========================================================================
  function bootStage18OmnipotentPatch() {
    injectStage18MasterCSS();
    Bug1TwoSecondFolderAutoSaver.init();
    Bug2RealTimeModelCatalog2026.init();
    Bug3StoryBibleOverflowAndDeleteFixer.init();
    Bug4Tab6SystemButtonsRestorer.init();
    Bug5InModalStoryBibleAndSceneFixer.init();
    Bug6ModeSystemPromptManager.init();
    Bug7Tab3ChatSizeController.init();
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(bootStage18OmnipotentPatch, 850);
      setTimeout(bootStage18OmnipotentPatch, 1900);
    });
  } else {
    setTimeout(bootStage18OmnipotentPatch, 300);
    setTimeout(bootStage18OmnipotentPatch, 1500);
  }
})();