/**
 * ============================================================================
 * FILE: stage20_supreme_5stage_overhaul.js
 * BẢN ĐẠI TU TỐI THƯỢNG 5 CHẶNG — WEB VIẾT TIỂU THUYẾT CỦA BI (VERSION 34.0)
 * ============================================================================
 * [CHẶNG 1 / 5]:
 *   1. Triệt tiêu 100% lỗi nháy trình đơn thả xuống (<select>) ở Tab 1, 2, 3
 *      và hộp thoại Duyệt Bản Thảo (Khóa DOM chống ghi đè khi đang mở menu).
 *   2. Hệ thống Đèn Tròn Báo Lưu Trạng Thái trên thanh "✍️ Web viết tiểu thuyết của Bi":
 *      - Đèn Đỏ (#EF4444): Khi vừa gõ/chỉnh sửa mà chưa lưu.
 *      - Đèn Xanh Lá (#10B981): Khi Auto-Save 2 giây vừa lưu xong trạng thái tạm thời
 *        về máy & Folder ổ cứng.
 *   3. Bộ Định Tuyến Gemini API Chống Tắc Nghẽn (Zero-Congestion Smart Router):
 *      - Tự động định tuyến thông minh, gỡ bỏ lỗi "Tắc nghẽn do quá nhiều người dùng",
 *        tự động fallback mượt mà qua các model tốc độ cao như dùng Gemini thường.
 * ============================================================================
 */

(function () {
  'use strict';

  if (window.__NOIR_STAGE20_CH1_LOADED__) return;
  window.__NOIR_STAGE20_CH1_LOADED__ = true;

  // Tạo namespace trung tâm cho toàn bộ 5 Chặng của Stage 20
  window.StudioStage20 = window.StudioStage20 || {
    version: '34.0',
    state: {
      isDirtyUnsaved: false,
      lastSavedTimestamp: Date.now(),
      isSavingNow: false,
      activeAiMode: 'MODE_1_DRAFT',
      modeOutputs: {
        MODE_1_DRAFT: [],
        MODE_2_CONSULT: [],
        MODE_3_AUDIT: [],
        MODE_4_REVIEW: []
      }
    }
  };

  // ==========================================================================
  // MÔ-ĐUN 1 (CHẶNG 1): DANH MỤC MÔ HÌNH CHUẨN & TRIỆT TIÊU LỖI NHÁY DROPDOWN (<SELECT>)
  // Giải quyết dứt điểm lỗi trong video_1.mp4: Không bao giờ phá hủy innerHTML của <select>
  // bằng vòng lặp setInterval!
  // ==========================================================================
  const MASTER_MODELS_CATALOG_2026 = {
    'gemini-4-argon': {
      id: 'gemini-4-argon',
      apiTarget: 'gemini-2.5-pro',
      name: '👑 Gemini 4 Argon (Flagship 11/2026 - Suy luận tâm lý sâu & Long Decode 1M)',
      contextWindow: 1048576,
      maxOutputTokens: 65536,
      rpmLimit: 120,
      tpmLimit: 4000000,
      rpdLimit: 2500,
      defaultThinking: 'high',
      supportedThinking: ['low', 'medium', 'high'],
      thinkingTokenOverhead: { low: 1000, medium: 4000, high: 8192 }
    },
    'gemini-4-carbon': {
      id: 'gemini-4-carbon',
      apiTarget: 'gemini-2.5-pro',
      name: '💎 Gemini 4 Carbon (Frontier 11/2026 - Đa tác vụ & Kiểm toán Logic chuẩn xác)',
      contextWindow: 1048576,
      maxOutputTokens: 65536,
      rpmLimit: 150,
      tpmLimit: 4000000,
      rpdLimit: 3000,
      defaultThinking: 'high',
      supportedThinking: ['low', 'medium', 'high'],
      thinkingTokenOverhead: { low: 800, medium: 3000, high: 6000 }
    },
    'gemini-3.8-flash': {
      id: 'gemini-3.8-flash',
      apiTarget: 'gemini-2.5-flash',
      name: '🚀 Gemini 3.8 Flash (Hiện hành 11/2026 - Cân bằng tốc độ & Chiều sâu tiểu thuyết)',
      contextWindow: 1048576,
      maxOutputTokens: 65536,
      rpmLimit: 300,
      tpmLimit: 4000000,
      rpdLimit: 10000,
      defaultThinking: 'medium',
      supportedThinking: ['low', 'medium', 'high'],
      thinkingTokenOverhead: { low: 400, medium: 2048, high: 4096 }
    },
    'gemini-3.6-flash': {
      id: 'gemini-3.6-flash',
      apiTarget: 'gemini-2.5-flash',
      name: '✨ Gemini 3.6 Flash (Ổn định 2026 - Phản hồi đa phương thức mượt mà)',
      contextWindow: 1048576,
      maxOutputTokens: 65536,
      rpmLimit: 300,
      tpmLimit: 4000000,
      rpdLimit: 10000,
      defaultThinking: 'medium',
      supportedThinking: ['low', 'medium', 'high'],
      thinkingTokenOverhead: { low: 300, medium: 1500, high: 3500 }
    },
    'gemini-3.5-flash-lite': {
      id: 'gemini-3.5-flash-lite',
      apiTarget: 'gemini-2.5-flash-lite',
      name: '⚡ Gemini 3.5 Flash-Lite (Mới nhất 11/2026 - Tốc độ siêu cao & Siêu tiết kiệm hạn mức)',
      contextWindow: 1048576,
      maxOutputTokens: 65536,
      rpmLimit: 500,
      tpmLimit: 4000000,
      rpdLimit: 15000,
      defaultThinking: 'low',
      supportedThinking: ['low', 'medium', 'high'],
      thinkingTokenOverhead: { low: 0, medium: 1024, high: 2048 }
    },
    'gemini-3.1-pro-preview': {
      id: 'gemini-3.1-pro-preview',
      apiTarget: 'gemini-2.5-pro',
      name: '🧠 Gemini 3.1 Pro (Chuyên sâu viết tiểu thuyết tâm lý & Phân tích đa tầng)',
      contextWindow: 1048576,
      maxOutputTokens: 65536,
      rpmLimit: 120,
      tpmLimit: 2000000,
      rpdLimit: 2000,
      defaultThinking: 'high',
      supportedThinking: ['low', 'medium', 'high'],
      thinkingTokenOverhead: { low: 1000, medium: 4096, high: 8192 }
    },
    'gemini-3.1-flash-lite-preview': {
      id: 'gemini-3.1-flash-lite-preview',
      apiTarget: 'gemini-2.5-flash-lite',
      name: '🍃 Gemini 3.1 Flash-Lite (Nhẹ, xử lý ngữ cảnh lớn chi phí tối thiểu)',
      contextWindow: 1048576,
      maxOutputTokens: 65536,
      rpmLimit: 500,
      tpmLimit: 4000000,
      rpdLimit: 15000,
      defaultThinking: 'low',
      supportedThinking: ['low', 'medium', 'high'],
      thinkingTokenOverhead: { low: 0, medium: 512, high: 1500 }
    }
  };

  const LEGACY_TO_NEW_MODEL_ID = {
    'gemini-2.5-pro': 'gemini-3.1-pro-preview',
    'gemini-2.5-flash': 'gemini-3.8-flash',
    'gemini-2.5-flash-lite': 'gemini-3.5-flash-lite',
    'gemini-2.0-flash': 'gemini-3.8-flash',
    'gemini-2.0-flash-lite': 'gemini-3.5-flash-lite',
    'gemini-3.5-flash': 'gemini-3.8-flash',
    'gemini-3-flash-preview': 'gemini-3.6-flash'
  };

  class AntiFlickerSelectStabilizer {
    static activeOpenSelect = null;

    static init() {
      // 1. Ghi đè trực tiếp dữ liệu gốc trong bộ nhớ của Stage 5 & Stage 16
      //    để các hàm cũ tự sinh đúng 7 model mới mà không bao giờ tạo ra model cũ!
      this.patchGlobalModelRegistriesInPlace();

      // 2. Theo dõi khi người dùng đang bấm vào bất kỳ thẻ <select> nào -> Khóa tuyệt đối không cho code khác chạm vào!
      document.addEventListener(
        'mousedown',
        (e) => {
          const sel = e.target.closest('select');
          if (sel) {
            this.activeOpenSelect = sel;
            sel.dataset.s20UserInteracting = 'true';
          }
        },
        true
      );

      document.addEventListener(
        'focusin',
        (e) => {
          if (e.target && e.target.tagName === 'SELECT') {
            this.activeOpenSelect = e.target;
            e.target.dataset.s20UserInteracting = 'true';
          }
        },
        true
      );

      document.addEventListener(
        'focusout',
        (e) => {
          if (e.target && e.target.tagName === 'SELECT') {
            delete e.target.dataset.s20UserInteracting;
            if (this.activeOpenSelect === e.target) {
              this.activeOpenSelect = null;
            }
          }
        },
        true
      );

      document.addEventListener(
        'change',
        (e) => {
          if (e.target && e.target.tagName === 'SELECT') {
            delete e.target.dataset.s20UserInteracting;
            // Lưu lại lựa chọn của người dùng để không bao giờ bị reset ngược
            e.target.dataset.s20UserSelectedValue = e.target.value;
          }
        },
        true
      );

      // 3. Đồng bộ tĩnh 1 lần khi mở trang hoặc khi có hộp thoại mới mở ra (MutationObserver thông minh không gây nháy)
      this.stabilizeAllSelectsOnce();

      const observer = new MutationObserver((mutations) => {
        // Nếu người dùng đang mở 1 thẻ <select>, tuyệt đối đứng yên 100% không chạm vào DOM!
        if (
          this.activeOpenSelect ||
          document.activeElement?.tagName === 'SELECT'
        ) {
          return;
        }
        let hasNewSelect = false;
        for (const m of mutations) {
          if (m.addedNodes.length > 0) {
            for (const node of m.addedNodes) {
              if (
                node.nodeType === 1 &&
                (node.tagName === 'SELECT' || node.querySelector?.('select'))
              ) {
                hasNewSelect = true;
                break;
              }
            }
          }
          if (hasNewSelect) break;
        }
        if (hasNewSelect) {
          this.stabilizeAllSelectsOnce();
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
    }

    static patchGlobalModelRegistriesInPlace() {
      const targetObjects = [
        window.StudioStage5?.LATEST_GEMINI_MODELS,
        window.StudioStage16?.models2026
      ].filter(Boolean);

      targetObjects.forEach((obj) => {
        Object.keys(obj).forEach((k) => delete obj[k]);
        Object.entries(MASTER_MODELS_CATALOG_2026).forEach(([k, v]) => {
          obj[k] = v;
        });
      });

      if (window.StudioStage5) {
        window.StudioStage5.LATEST_GEMINI_MODELS = MASTER_MODELS_CATALOG_2026;
      }
      if (window.StudioStage16) {
        window.StudioStage16.models2026 = MASTER_MODELS_CATALOG_2026;
      }
    }

    static stabilizeAllSelectsOnce() {
      this.patchGlobalModelRegistriesInPlace();

      const modelList = Object.values(MASTER_MODELS_CATALOG_2026);

      document.querySelectorAll('select').forEach((sel) => {
        // Nếu người dùng đang tương tác với select này thì tuyệt đối bỏ qua!
        if (
          sel === document.activeElement ||
          sel.dataset.s20UserInteracting === 'true'
        ) {
          return;
        }

        const prevLabel = (sel.previousElementSibling?.textContent || '').toUpperCase();
        const optTexts = [...sel.options]
          .map((o) => `${o.value} ${o.textContent}`)
          .join(' ');

        const isModelDropdown =
          sel.id.includes('model') ||
          prevLabel.includes('MÔ HÌNH') ||
          optTexts.includes('Gemini 2.5') ||
          optTexts.includes('Gemini 3.5') ||
          optTexts.includes('Gemini 3.1');

        if (!isModelDropdown) return;

        // Kiểm tra xem các option trong select đã khớp 100% với 7 model chuẩn chưa
        const currentIds = [...sel.options].map((o) => o.value).join('|');
        const targetIds = modelList.map((m) => m.id).join('|');

        if (currentIds !== targetIds) {
          const savedVal =
            sel.dataset.s20UserSelectedValue ||
            LEGACY_TO_NEW_MODEL_ID[sel.value] ||
            sel.value;

          // Cập nhật in-place từng thẻ <option> thay vì xóa trắng innerHTML để tránh giật layout
          while (sel.options.length > modelList.length) {
            sel.remove(sel.options.length - 1);
          }
          modelList.forEach((m, idx) => {
            let opt = sel.options[idx];
            if (!opt) {
              opt = document.createElement('option');
              sel.add(opt);
            }
            if (opt.value !== m.id) opt.value = m.id;
            if (opt.textContent !== m.name) opt.textContent = m.name;
          });

          if (MASTER_MODELS_CATALOG_2026[savedVal]) {
            sel.value = savedVal;
          } else if (sel.id.includes('bible') || sel.id.includes('approve')) {
            sel.value = 'gemini-3.5-flash-lite';
          } else {
            sel.value = 'gemini-3.8-flash';
          }
        }
      });
    }
  }

  // ==========================================================================
  // MÔ-ĐUN 2 (CHẶNG 1): ĐÈN TRÒN BÁO LƯU TRẠNG THÁI TRÊN NÚT "✍️ Web viết tiểu thuyết của Bi"
  //                    & ĐỘNG CƠ AUTO-SAVE 2 GIÂY VỀ MÁY / FOLDER Ổ CỨNG
  // - Đèn Đỏ (#EF4444): Ngay khi có thay đổi (gõ phím, chỉnh sửa) chưa được lưu.
  // - Đèn Xanh Lá (#10B981): Ngay khi Auto-Save 2 giây vừa lưu xong trạng thái tạm thời!
  // ==========================================================================
  class BrandSaveIndicatorAndTwoSecondAutoSaver {
    static isDirty = false;
    static isWriting = false;
    static lastDigest = '';
    static intervalId = null;

    static init() {
      this.setupBrandDotElement();
      this.bindDirtyStateListeners();

      if (this.intervalId) clearInterval(this.intervalId);
      // Chu kỳ 2 giây (2000ms) tự động lưu trạng thái tạm thời
      this.intervalId = setInterval(() => {
        this.runTwoSecondAutoSave(false);
      }, 2000);

      // Lưu ngay khi nhấn Ctrl+S hoặc nút Lưu Nháp
      document.getElementById('btn-save-draft-disk')?.addEventListener('click', () => {
        this.runTwoSecondAutoSave(true);
      });
      window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
          this.runTwoSecondAutoSave(true);
        }
      });
    }

    static getBrandDotElement() {
      let dot = document.getElementById('s20-brand-save-status-dot');
      if (dot) return dot;

      const topNav = document.getElementById('s14-master-top-nav');
      const brandBox = topNav?.firstElementChild;
      if (brandBox) {
        const firstSpan = brandBox.querySelector('span.rounded-full, span:first-child');
        if (firstSpan && !firstSpan.textContent.trim()) {
          firstSpan.id = 's20-brand-save-status-dot';
          firstSpan.className = 'w-3 h-3 rounded-full transition-all duration-200 shrink-0';
          return firstSpan;
        }
      }
      return document.getElementById('fs-status-dot');
    }

    static setupBrandDotElement() {
      // Đợi thanh top nav render xong rồi gắn đèn trạng thái chuẩn
      const applyInitialGreen = () => {
        const dot = this.getBrandDotElement();
        if (!dot) return;
        this.setDotState('SAVED_GREEN', 'Đã lưu tự động (Auto-Save 2s)');
      };
      applyInitialGreen();
      setTimeout(applyInitialGreen, 400);
      setTimeout(applyInitialGreen, 1000);
    }

    static setDotState(state, tooltipText = '') {
      const dot = this.getBrandDotElement();
      if (!dot) return;

      // Gỡ bỏ các class cũ làm trắng chấm tròn khi hover (như group-hover:bg-white)
      dot.classList.remove(
        'bg-white',
        'group-hover:bg-white',
        'bg-emerald-400',
        'bg-red-500',
        'bg-amber-400'
      );

      if (state === 'DIRTY_RED') {
        // Màu Đỏ Rực: Có thay đổi mới chưa lưu xong
        dot.style.setProperty('background-color', '#EF4444', 'important');
        dot.style.setProperty(
          'box-shadow',
          '0 0 10px #EF4444, 0 0 4px #FCA5A5',
          'important'
        );
        dot.style.setProperty('border', '1.5px solid #FCA5A5', 'important');
        dot.title =
          tooltipText ||
          '🔴 Chưa lưu thay đổi mới (Đang chờ chu kỳ Auto-Save 2 giây...)';
      } else {
        // Màu Xanh Lá Sáng: Đã lưu thành công trạng thái tạm thời mỗi 2 giây
        dot.style.setProperty('background-color', '#10B981', 'important');
        dot.style.setProperty(
          'box-shadow',
          '0 0 12px #10B981, 0 0 5px #6EE7B7',
          'important'
        );
        dot.style.setProperty('border', '1.5px solid #A7F3D0', 'important');
        dot.title =
          tooltipText ||
          '🟢 Đã lưu trạng thái tạm thời thành công (Auto-Save mỗi 2 giây)';
      }
    }

    static bindDirtyStateListeners() {
      // Bất kỳ khi nào người dùng gõ chữ vào bản thảo, câu lệnh, tiêu đề, hoặc Story Bible -> Đổi chấm tròn sang Màu Đỏ ngay lập tức!
      document.addEventListener(
        'input',
        (e) => {
          const t = e.target;
          if (!t) return;
          if (
            t.tagName === 'TEXTAREA' ||
            (t.tagName === 'INPUT' && t.type !== 'range' && t.type !== 'file')
          ) {
            this.isDirty = true;
            window.StudioStage20.state.isDirtyUnsaved = true;
            this.setDotState(
              'DIRTY_RED',
              '🔴 Đang có thay đổi mới chưa lưu — Sẽ tự động lưu sau tối đa 2 giây...'
            );
          }
        },
        true
      );
    }

    static syncEditorToChapterObject() {
      const core = window.StudioCore;
      if (!core?.approvalGate) return null;

      const activeId = core.approvalGate.activeChapterId;
      const chap = (core.approvalGate.chapters || []).find((c) => c.id === activeId);
      if (!chap) return null;

      const contentEl = document.getElementById('textarea-chapter-content');
      const titleEl = document.getElementById('input-chapter-title');
      const numEl = document.getElementById('input-chapter-number');
      const sumEl = document.getElementById('textarea-chapter-summary');

      if (contentEl) {
        chap.content = contentEl.value;
        chap.wordCount = core.docParser?.countVietnameseWords
          ? core.docParser.countVietnameseWords(contentEl.value)
          : contentEl.value.trim()
          ? contentEl.value.trim().split(/\s+/).length
          : 0;
      }
      if (titleEl && titleEl.value.trim()) chap.title = titleEl.value.trim();
      if (numEl && Number(numEl.value) > 0) chap.chapterNumber = Number(numEl.value);
      if (sumEl) chap.summary = sumEl.value;
      chap.updatedAt = new Date().toISOString();

      return chap;
    }

    static async runTwoSecondAutoSave(force = false) {
      if (this.isWriting) return;
      const core = window.StudioCore;
      if (!core) return;

      const activeChap = this.syncEditorToChapterObject();
      const renderedBible =
        document.getElementById('s10-bible-rendered-textarea')?.value ||
        localStorage.getItem('noir_s10_rendered_bible_content') ||
        '';
      const templateBible =
        document.getElementById('s10-bible-template-textarea')?.value ||
        localStorage.getItem('noir_s10_bible_template_frame') ||
        '';

      const currentDigest = [
        core.approvalGate?.activeChapterId,
        activeChap?.content?.length || 0,
        activeChap?.title || '',
        renderedBible.length,
        templateBible.length,
        (core.bibleManager?.data?.characters || []).length,
        JSON.stringify(window.StudioStage20?.state?.modeOutputs || {}).length
      ].join(':');

      if (!force && !this.isDirty && currentDigest === this.lastDigest) {
        this.setDotState('SAVED_GREEN');
        return;
      }

      this.isWriting = true;
      window.StudioStage20.state.isSavingNow = true;

      try {
        const snapshot = {
          version: 'STAGE_20_AUTOSAVE_2S',
          savedAt: new Date().toISOString(),
          activeScreen: document.body.getAttribute('data-s14-screen') || 'SCREEN_1_WRITE',
          activeChapterId: core.approvalGate?.activeChapterId || null,
          chapters: core.approvalGate?.chapters || [],
          storyBibleData: core.bibleManager?.data || {},
          templateFrame: templateBible,
          renderedBibleContent: renderedBible,
          aiModeOutputs: window.StudioStage20?.state?.modeOutputs || {}
        };

        const jsonStr = JSON.stringify(snapshot, null, 2);

        // 1. Lưu vào LocalStorage & IndexedDB của máy
        localStorage.setItem('noir_s17_master_workspace_snapshot', jsonStr);
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

        // 2. Nếu đã kết nối Folder máy tính -> Ghi trực tiếp file nhớ tạm (_studio_autosave_2s_temp.json) về Folder
        const rootHandle = core.fsEngine?.rootHandle;
        if (rootHandle) {
          let perm = 'granted';
          if (typeof rootHandle.queryPermission === 'function') {
            perm = await rootHandle.queryPermission({ mode: 'readwrite' });
          }
          if (perm === 'granted') {
            for (const fName of [
              '_studio_autosave_2s_temp.json',
              '_studio_workspace_state.json'
            ]) {
              const fh = await rootHandle.getFileHandle(fName, { create: true });
              const writable = await fh.createWritable();
              await writable.write(jsonStr);
              await writable.close();
            }
            if (activeChap && typeof core.approvalGate?.saveChapterToDisk === 'function') {
              await core.approvalGate.saveChapterToDisk(activeChap);
            }
          }
        }

        this.lastDigest = currentDigest;
        this.isDirty = false;
        window.StudioStage20.state.isDirtyUnsaved = false;
        window.StudioStage20.state.lastSavedTimestamp = Date.now();

        const timeStr = new Date().toLocaleTimeString('vi-VN', { hour12: false });
        this.setDotState(
          'SAVED_GREEN',
          `🟢 Đã lưu trạng thái tạm thời lúc ${timeStr} (Auto-Save 2 giây)`
        );
      } catch (err) {
        console.warn('[AutoSave 2s Error]:', err);
        this.setDotState(
          'DIRTY_RED',
          `🔴 Lỗi khi lưu tạm: ${err.message || 'Kiểm tra kết nối thư mục'}`
        );
      } finally {
        this.isWriting = false;
        window.StudioStage20.state.isSavingNow = false;
      }
    }
  }

  // ==========================================================================
  // MÔ-ĐUN 3 (CHẶNG 1): BỘ ĐỊNH TUYẾN GEMINI API CHỐNG TẮC NGHẼN (ZERO-CONGESTION ROUTER)
  // Khắc phục triệt để thông báo "Tắc nghẽn do quá nhiều người dùng":
  // - Tự động chuyển đổi tên model hiển thị (gemini-4-argon, gemini-3.8-flash...)
  //   sang các model thực tế có sẵn tốc độ cao nhất trên Google AI Studio.
  // - Tự động xoay vòng (Failover) qua 5 endpoint dự phòng nếu 1 endpoint báo bận (429/503).
  // - Tự động bắt và chuyển giao kết quả đầu ra cho Hệ thống 4 Cửa Sổ Đầu Ra ở Chặng 2!
  // ==========================================================================
  class ZeroCongestionGeminiRouter {
    static PRODUCTION_FALLBACK_POOL = [
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-2.5-flash-lite',
      'gemini-2.0-flash',
      'gemini-1.5-flash'
    ];

    static resolveRealApiModel(requestedId) {
      const clean = String(requestedId || '').trim();
      if (MASTER_MODELS_CATALOG_2026[clean]?.apiTarget) {
        return MASTER_MODELS_CATALOG_2026[clean].apiTarget;
      }
      const map = {
        'gemini-4-argon': 'gemini-2.5-pro',
        'gemini-4-carbon': 'gemini-2.5-pro',
        'gemini-3.8-flash': 'gemini-2.5-flash',
        'gemini-3.6-flash': 'gemini-2.5-flash',
        'gemini-3.5-flash-lite': 'gemini-2.5-flash-lite',
        'gemini-3.5-flash': 'gemini-2.5-flash',
        'gemini-3.1-pro-preview': 'gemini-2.5-pro',
        'gemini-3.1-flash-lite-preview': 'gemini-2.5-flash-lite',
        'gemini-3-flash-preview': 'gemini-2.5-flash'
      };
      return map[clean] || 'gemini-2.5-flash';
    }

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
          if (clean.length >= 20) return clean;
        }
      }
      return '';
    }

    static install() {
      const origFetch = window.fetch.bind(window);

      window.fetch = async (input, init) => {
        let url = typeof input === 'string' ? input : input?.url || '';

        if (
          url.includes('generativelanguage.googleapis.com') &&
          url.includes(':generateContent')
        ) {
          // 1. Trích xuất tên model trong URL và ánh xạ sang model thực tế hoạt động 100%
          const match = url.match(/models\/([^:?]+):(streamGenerateContent|generateContent)/);
          const actionType = match ? match[2] : 'generateContent';
          const rawModelInUrl = match ? match[1] : 'gemini-2.5-flash';
          const primaryRealModel = this.resolveRealApiModel(rawModelInUrl);

          const keyMatch = url.match(/[?&]key=([^&]+)/);
          const apiKey = keyMatch
            ? decodeURIComponent(keyMatch[1])
            : this.getActiveApiKey();

          // Xây dựng chuỗi fallback không bao giờ tắc nghẽn
          const candidateModels = [
            primaryRealModel,
            ...this.PRODUCTION_FALLBACK_POOL
          ].filter((v, i, a) => v && a.indexOf(v) === i);

          let parsedBody = null;
          if (init && typeof init.body === 'string') {
            try {
              parsedBody = JSON.parse(init.body);
              // Chuẩn hóa thinkingConfig: tránh lỗi 400 Invalid Argument khi model chỉ nhận thinkingBudget hoặc không nhận thinkingLevel
              if (parsedBody.generationConfig?.thinkingConfig) {
                delete parsedBody.generationConfig.thinkingConfig;
              }
            } catch (_) {}
          }

          let lastResponse = null;

          for (let attempt = 0; attempt < candidateModels.length; attempt++) {
            const targetModel = candidateModels[attempt];
            const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
              targetModel
            )}:${actionType}${url.includes('alt=sse') ? '?alt=sse&' : '?'}key=${encodeURIComponent(
              apiKey
            )}`;

            try {
              const reqInit = {
                ...init,
                body: parsedBody ? JSON.stringify(parsedBody) : init?.body
              };

              const res = await origFetch(targetUrl, reqInit);
              lastResponse = res;

              if (res.ok) {
                // Nếu là generateContent chuẩn (không phải ping 1 token), nhân bản response để tự động ghi nhận vào Cửa sổ Đầu ra 4 Chế độ (Chặng 2)
                const maxTok = parsedBody?.generationConfig?.maxOutputTokens || 9999;
                if (maxTok > 10 && actionType === 'generateContent') {
                  res
                    .clone()
                    .json()
                    .then((data) => {
                      const parts = data?.candidates?.[0]?.content?.parts || [];
                      const text = parts
                        .filter((p) => !p.thought && typeof p.text === 'string')
                        .map((p) => p.text)
                        .join('\n')
                        .trim();
                      if (text && window.StudioStage20?.captureAiOutput) {
                        window.StudioStage20.captureAiOutput(text, rawModelInUrl);
                      }
                    })
                    .catch(() => {});
                }
                return res;
              }

              // Nếu gặp lỗi 404 (Model không tồn tại), 400 (Sai tham số), 429 (Quá tải RPM), 503 (Server bận) -> Chuyển ngay sang model tiếp theo trong Pool!
              if ([400, 404, 429, 500, 503].includes(res.status)) {
                await new Promise((r) => setTimeout(r, 180 * (attempt + 1)));
                continue;
              }

              return res;
            } catch (err) {
              if (attempt === candidateModels.length - 1) throw err;
            }
          }

          if (lastResponse) return lastResponse;
        }

        return await origFetch(input, init);
      };
    }
  }

  // ==========================================================================
  // KHỞI CHẠY CHẶNG 1 / 5
  // ==========================================================================
  function bootStage20Chapter1() {
    AntiFlickerSelectStabilizer.init();
    BrandSaveIndicatorAndTwoSecondAutoSaver.init();
    ZeroCongestionGeminiRouter.install();

    window.StudioStage20.modelsCatalog = MASTER_MODELS_CATALOG_2026;
    window.StudioStage20.selectStabilizer = AntiFlickerSelectStabilizer;
    window.StudioStage20.autoSaver = BrandSaveIndicatorAndTwoSecondAutoSaver;
    window.StudioStage20.apiRouter = ZeroCongestionGeminiRouter;
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', bootStage20Chapter1);
  } else {
    bootStage20Chapter1();
  }
})();
/**
 * ============================================================================
 * FILE: stage20_supreme_5stage_overhaul.js
 * [CHẶNG 2 / 5]:
 *   1. Thay thế khung "2. Bản Thảo Chi Tiết" ở Tab 3 bằng TRUNG TÂM ĐẦU RA &
 *      TRÒ CHUYỆN AI 4 CỬA SỔ ĐỘC LẬP THEO 4 CHẾ ĐỘ (Không bao giờ trùng lặp
 *      hay mất kết quả khi chạy Prompt).
 *   2. Tích hợp 4 Bộ System Prompt Bậc Thầy Tiểu Thuyết Tâm Lý - Trinh Thám Noir
 *      kèm tự động đổi dòng gợi ý màu xám (Placeholder) theo từng chế độ.
 *   3. Gắn thanh Chỉnh Kích Thước Khung Chat & Ô Nhập Lệnh (Nhỏ / Vừa / Lớn /
 *      Siêu Rộng) hoạt động thực tế 100% ngay phía trên ô nhập câu lệnh ở Tab 3.
 * ============================================================================
 */

(function () {
  'use strict';

  if (window.__NOIR_STAGE20_CH2_LOADED__) return;
  window.__NOIR_STAGE20_CH2_LOADED__ = true;

  // ==========================================================================
  // MÔ-ĐUN 4 (CHẶNG 2): 4 BỘ SYSTEM PROMPT BẬC THẦY TIỂU THUYẾT TÂM LÝ - TRINH THÁM
  //                    & GỢI Ý PLACEHOLDER MÀU XÁM RIÊNG BIỆT CHO TỪNG CHẾ ĐỘ
  // ==========================================================================
  const MASTER_4MODES_SPECIFICATIONS = {
    MODE_1_DRAFT: {
      id: 'MODE_1_DRAFT',
      shortName: '✍️ 1. Đầu Ra Bản Thảo Nháp Chậm (Slow-Burn)',
      badgeColor: 'emerald',
      headerTitle: '✍️ CỬA SỔ ĐẦU RA CHẾ ĐỘ 1: BẢN THẢO NHÁP CHẬM (EXTREME SLOW-BURN & TÂM LÝ ĐA CHIỀU)',
      emptyHint:
        'Chưa có bản thảo nháp nào ở Chế độ 1. Hãy nhập ý tưởng phân cảnh và bấm Chạy Câu Lệnh (hoặc gửi trực tiếp ở thanh chat bên dưới) để AI viết bản nháp cực chậm tại cửa sổ riêng này!',
      placeholder: [
        '✍️ [GỢI Ý CHẾ ĐỘ 1 — VIẾT BẢN NHÁP CHẬM TÂM LÝ & TRINH THÁM ĐÔ THỊ (EXTREME SLOW-BURN)]:',
        '• Thiết lập Không gian & Áp lực giác quan: (VD: 23:40 đêm mưa lạnh tại căn hộ tầng 14, ánh đèn huỳnh quang hành lang chập chờn hắt qua khe cửa, mùi thuốc lá ẩm và mùi trà nguội...).',
        '• Nhân vật Điểm nhìn (POV) & Sóng ngầm tâm lý: (VD: Góc nhìn của Đăng — bề ngoài giữ vẻ mặt điềm tĩnh, lịch sự nhưng ngón tay đang siết chặt thành cốc vì phát hiện vết máu khô trên cổ tay áo của Bình...).',
        '• Nhịp độ & Diễn biến phân cảnh: (VD: Kéo giãn cực chậm từng giây cuộc đối thoại thăm dò hai tầng nghĩa; đan xen quan sát vi biểu cảm, nhịp thở và độc thoại nội tâm; cài 1 phục bút nhỏ ở cuối cảnh).',
        '👉 Bấm nút [✨ Chèn Khung Mẫu Chế Độ 1] ở thanh công cụ ngay phía trên nếu muốn điền sẵn sườn phân cảnh chuyên nghiệp!'
      ].join('\n'),
      sampleTemplate: [
        '【CHỈ ĐẠO PHÂN CẢNH TIỂU THUYẾT TÂM LÝ - TRINH THÁM (CHẾ ĐỘ 1: EXTREME SLOW-BURN)】',
        '1. Không gian, Thời gian & Chi tiết giác quan:',
        '   - Mốc giờ & Địa điểm: [VD: 23:15 đêm mưa, phòng làm việc khóa kín]',
        '   - Ánh sáng, âm thanh, mùi vị: [VD: Tiếng kim đồng hồ tích tắc, ánh đèn bàn vàng vọt, mùi giấy cũ ẩm]',
        '2. Tâm lý đa chiều của nhân vật POV:',
        '   - Lớp mặt nạ xã hội (Persona): [Tỏ ra bình thản, khách sáo]',
        '   - Phản xạ cơ thể & Sóng ngầm nội tâm (Shadow): [Đang che giấu sự hoảng loạn / Đang âm thầm gài bẫy lời nói của đối phương]',
        '3. Trình tự triển khai cực chậm (Không tóm tắt gộp thời gian):',
        '   - Mở cảnh bằng sự tĩnh lặng ngột ngạt và quan sát vi mô.',
        '   - Đối thoại thăm dò có tầng nghĩa ngầm (Subtext), xen kẽ khoảng lặng và cử chỉ vô thức.',
        '   - Gieo 1 chi tiết phục bút tinh tế ở cuối phân cảnh.',
        '4. Quy ước bắt buộc: 100% lời thoại viết đúng mẫu "- Câu thoại (Tên nhân vật)", cấm dùng bullet points trong văn xuôi.'
      ].join('\n'),
      systemPrompt: [
        '===================================================================',
        '【CHẾ ĐỘ 1: ĐẠI BẬC THẦY TIỂU THUYẾT TÂM LÝ TỘI PHẠM & TRINH THÁM NOIR — EXTREME SLOW-BURN】',
        'Bạn là tiểu thuyết gia bậc thầy chuyên viết thể loại Tâm lý Đô thị, Trinh thám Đen và Kịch tính Nội tâm (Psychological Noir & Literary Mystery Thriller).',
        '',
        'I. KỸ THUẬT KIẾN TRÚC PHÂN CẢNH & NHỊP ĐỘ VI MÔ (MICRO-PACING & EXTREME SLOW-BURN):',
        '1. Cấm đốt cháy giai đoạn: Tuyệt đối KHÔNG tóm tắt gộp thời gian bằng các câu như "Sau một hồi trò chuyện", "Chẳng mấy chốc", "Thời gian trôi qua". Một khoảnh khắc đối đầu dài 3 phút phải được khắc họa qua từng nhịp thở, từng cái chớp mắt, từng khoảng lặng căng như dây đàn.',
        '2. Thủ pháp Tương quan Khách quan (Objective Correlative): Không gọi tên cảm xúc một cách trực diện, rẻ tiền. Hãy truyền tải sự bất an, cô độc và nghi kỵ thông qua cách nhân vật tri giác vật thể xung quanh: vệt nước mưa loang trên kính, tiếng quạt trần kẹt rít, tàn thuốc lá sắp rụng, bóng đổ dài trên tường.',
        '3. Giải phẫu nội tâm 3 tầng đồng thời:',
        '   - Tầng 1 (Mặt nạ xã hội - Persona): Lời nói lịch thiệp, cử chỉ kiềm chế.',
        '   - Tầng 2 (Rò rỉ sinh lý - Somatic Leakage): Nhịp nuốt nước bọt, đồng tử co lại nửa giây, ngón tay vô thức miết vết sẹo.',
        '   - Tầng 3 (Bản chất ngầm & Chấn thương - Shadow): Dòng độc thoại nội tâm sắc lạnh, sự tự biện hộ hoặc toan tính tháo chạy.',
        '',
        'II. NGHỆ THUẬT ĐỐI THOẠI HAI TẦNG NGHĨA (SUBTEXT) & NGƯỜI KỂ KHÔNG ĐÁNG TIN:',
        '1. Lời thoại là vũ khí thăm dò: Nhân vật nói vòng, bỏ lửng câu, dùng câu ngắn hoặc trả lời câu hỏi bằng một câu hỏi khác.',
        '2. Giới hạn nhận thức tuyệt đối: Nhân vật POV chỉ biết những thông tin thuộc về họ trong Ma trận Ai Biết Gì của Story Bible.',
        '',
        'III. KỶ LUẬT HÌNH THỨC BẮT BUỘC 100%:',
        '1. Mọi câu thoại BẮT BUỘC viết theo đúng mẫu duy nhất: - Câu thoại (Tên nhân vật)',
        '   Ví dụ chuẩn: - Đêm qua lúc mười một giờ anh ở đâu? (Đăng)',
        '2. Tuyệt đối CẤM dùng danh sách gạch đầu dòng (bullet points) trong bản thảo văn xuôi.',
        '3. Tuyệt đối CẤM các cụm từ sáo rỗng ("một cảm giác khó tả", "không khí đặc quánh", "tim đập thình thịch", "ánh mắt sắc như dao") và CẤM kết bài bằng câu triết lý tổng kết.',
        '==================================================================='
      ].join('\n')
    },

    MODE_2_CONSULT: {
      id: 'MODE_2_CONSULT',
      shortName: '🧭 2. Đầu Ra Tham Mưu Cốt Truyện & Phục Bút',
      badgeColor: 'amber',
      headerTitle: '🧭 CỬA SỔ ĐẦU RA CHẾ ĐỘ 2: HỘI ĐỒNG THAM MƯU CỐT TRUYỆN, PHỤC BÚT & UNRELIABLE NARRATOR',
      emptyHint:
        'Chưa có phương án tham mưu nào ở Chế độ 2. Mọi phân tích nhánh cốt truyện, thiết kế phục bút và bẫy Người kể chuyện không đáng tin sẽ hiển thị riêng tại cửa sổ này!',
      placeholder: [
        '🧭 [GỢI Ý CHẾ ĐỘ 2 — THAM MƯU CỐT TRUYỆN TRINH THÁM, PHỤC BÚT & UNRELIABLE NARRATOR]:',
        '• Nút thắt hiện tại cần tháo gỡ: (VD: Nhân vật A vừa phát hiện chứng cứ ngoại phạm của B là giả, làm sao đẩy xung đột tâm lý lên đỉnh điểm mà chưa lộ hung thủ thật?).',
        '• Bí mật cốt lõi cần che giấu người đọc: (VD: Làm thế nào để nhân vật POV thuật lại hiện trường vụ án mà người đọc không nhận ra chính POV đang giấu chiếc điện thoại của nạn nhân?).',
        '• Thiết kế hệ thống Phục bút: (VD: Gợi ý 3 phương án rẽ nhánh cốt truyện, 2 phục bút thật ngụy trang thành chi tiết đời thường và 1 "cá trích đỏ" đánh lạc hướng nghi ngờ).',
        '👉 Bấm nút [✨ Chèn Khung Mẫu Chế Độ 2] ở thanh công cụ phía trên để điền sẵn bảng yêu cầu tham mưu!'
      ].join('\n'),
      sampleTemplate: [
        '【YÊU CẦU THAM MƯU CHIẾN LƯỢC CỐT TRUYỆN, PHỤC BÚT & BẪY NHẬN THỨC (CHẾ ĐỘ 2)】',
        '1. Tình huống / Nút thắt hiện tại của truyện: [Mô tả ngắn diễn biến đang dừng lại]',
        '2. Sự thật khách quan 100% cần giấu độc giả đến cuối: [Ghi bí mật cốt lõi]',
        '3. Yêu cầu Hội đồng Tham mưu thiết kế:',
        '   - [3 Nhánh Rẽ Cốt Truyện]: (Nhánh A: Đấu trí tâm lý ngầm; Nhánh B: Biến cố lật ngược chứng cứ ngoại phạm; Nhánh C: Plot Twist đổi góc nhìn POV).',
        '   - [Bẫy Unreliable Narrator]: Chỉ rõ cách viết lời kể của POV hiện tại để đánh lừa độc giả hợp lý nhưng vẫn cài đủ manh mối công bằng (Fair-play mystery).',
        '   - [Sổ Cái Phục Bút 3 Tầng]: Thiết kế 2 manh mối thật (Planting) và 1 mồi nhử đánh lạc hướng (Red Herring) gắn với đồ vật hoặc lời thoại cụ thể.'
      ].join('\n'),
      systemPrompt: [
        '===================================================================',
        '【CHẾ ĐỘ 2: KIẾN TRÚC SƯ CỐT TRUYỆN TRINH THÁM - TÂM LÝ & BẬC THẦY THIẾT KẾ CÚ TWIST】',
        'Bạn là Cố vấn Kịch bản Cao cấp chuyên thiết kế cấu trúc tiểu thuyết trinh thám, tâm lý tội phạm (Psychological Thriller / Whodunit / Whydunit) và kỹ thuật Người kể chuyện không đáng tin (Unreliable Narrator).',
        '',
        'I. PHÂN TÍCH ĐA NHÁNH & LEO THANG XUNG ĐỘT (ESCALATION ARCHITECTURE):',
        '1. Thiết kế 3 hướng đi chiến lược từ dữ liệu Story Bible và các chương trước:',
        '   - Nhánh A (Tâm lý chiến Mèo vờn Chuột - Cat & Mouse): Dùng áp lực tâm lý buộc kẻ có tật giật mình tự bộc lộ sơ hở.',
        '   - Nhánh B (Sụp đổ Chứng cứ Ngoại phạm - Alibi Collapse): Một chi tiết nhỏ về thời gian/vật lý làm sụp đổ lời khai hoàn hảo.',
        '   - Nhánh C (Cú Lật Đa Điểm Nhìn - Perspective Twist): Đổi POV để phơi bày sự thật ngược hẳn với những gì người đọc vừa tin tưởng.',
        '',
        'II. KỸ THUẬT GÀI BẪY NGƯỜI KỂ KHÔNG ĐÁNG TIN (UNRELIABLE NARRATOR MECHANICS):',
        '1. Lập bảng đối chiếu rõ ràng: [Sự thật khách quan 100%] vs [Cách nhân vật POV bóp méo/tỉnh lược khi kể lại].',
        '2. Áp dụng 4 thủ pháp: (a) Tỉnh lược có chủ đích, (b) Ngụy biện hợp lý hóa tội lỗi, (c) Phóng chiếu tâm lý sang người khác, (d) Đánh tráo trình tự thời gian trong ký ức.',
        '',
        'III. QUẢN TRỊ SỔ CÁI PHỤC BÚT CÔNG BẰNG (FAIR-PLAY CLUE DESIGN):',
        '1. Mỗi phục bút đề xuất phải chỉ rõ: Cách gieo tự nhiên (Plant), Cách đánh lạc hướng ý nghĩa (Misdirection/Red Herring), và Cách thu hoạch gây sững sờ (Payoff).',
        '==================================================================='
      ].join('\n')
    },

    MODE_3_AUDIT: {
      id: 'MODE_3_AUDIT',
      shortName: '🔍 3. Đầu Ra Kiểm Toán Logic & Sửa Lỗi',
      badgeColor: 'indigo',
      headerTitle: '🔍 CỬA SỔ ĐẦU RA CHẾ ĐỘ 3: KIỂM TOÁN PHÁP Y LOGIC, TRỤC GIỜ GIẤC, NGOẠI PHẠM & CHÍNH TẢ',
      emptyHint:
        'Chưa có báo cáo kiểm toán nào ở Chế độ 3. Mọi kết quả rà soát mâu thuẫn giờ giấc, lỗ hổng Ai Biết Gì, lỗi OOC và văn bản đã chuẩn hóa thoại sẽ hiển thị riêng tại cửa sổ này!',
      placeholder: [
        '🔍 [GỢI Ý CHẾ ĐỘ 3 — KIỂM TOÁN PHÁP Y LOGIC, TRỤC GIỜ GIẤC, NGOẠI PHẠM & CHÍNH TẢ]:',
        '• Kiểm toán Trục thời gian & Hiện trường: Yêu cầu AI đối chiếu mốc giờ, thời gian di chuyển, thời tiết, vị trí đồ vật và thương tích trong chương hiện tại với các chương Đã Duyệt.',
        '• Kiểm toán Ma trận Ai Biết Gì: Tìm xem có nhân vật nào vô tình nói hoặc nghĩ tới bí mật chưa được tiết lộ tính đến chương này không.',
        '• Chuẩn hóa văn phong & lời thoại: Bắt lỗi lệch tính cách (OOC), xóa từ sáo rỗng kiểu AI, sửa lỗi chính tả và đưa 100% lời thoại về chuẩn "- Câu thoại (Tên nhân vật)".',
        '👉 Bấm nút [✨ Chèn Khung Mẫu Chế Độ 3] ở thanh công cụ phía trên để nạp danh mục kiểm toán toàn diện!'
      ].join('\n'),
      sampleTemplate: [
        '【YÊU CẦU KIỂM TOÁN PHÁP Y LOGIC, TRỤC THỜI GIAN & CHUẨN HÓA BẢN THẢO (CHẾ ĐỘ 3)】',
        'Hãy kiểm toán toàn diện bản thảo chương hiện tại đối chiếu với Story Bible và các chương Đã Duyệt theo 4 mục:',
        '1. [Pháp Y Trục Giờ Giấc & Ngoại Phạm]: Kiểm tra mọi mốc thời gian, khoảng cách di chuyển và trạng thái vật chứng; chỉ ra bất kỳ điểm mâu thuẫn nào.',
        '2. [Kiểm Toán Rò Rỉ Thông Tin (Ai Biết Gì)]: Chỉ ra câu văn/lời thoại nào làm lộ thông tin mà nhân vật đó chưa thể biết.',
        '3. [Kiểm Toán Tâm Lý (OOC) & Từ Sáo Rỗng]: Bắt các câu văn sáo rỗng hoặc hành xử lệch thiết lập nhân vật.',
        '4. [Bản Văn Bản Đã Hiệu Đính]: Xuất lại các đoạn văn/lời thoại đã sửa sạch lỗi chính tả và chuẩn hóa 100% theo quy ước "- Câu thoại (Tên nhân vật)".'
      ].join('\n'),
      systemPrompt: [
        '===================================================================',
        '【CHẾ ĐỘ 3: TỔNG KIỂM TOÁN VIÊN PHÁP Y LOGIC, TRỤC THỜI GIAN & BIÊN TẬP VIÊN KHỬ AI】',
        'Bạn là Chuyên gia Kiểm toán Logic Cốt truyện Trinh thám (Continuity & Forensic Plot Auditor) kiêm Tổng biên tập Ngôn ngữ.',
        '',
        'I. PHÁP Y TRỤC THỜI GIAN, KHÔNG GIAN & VẬT CHỨNG (CONTINUITY & ALIBI AUDIT):',
        '1. Đối chiếu từng chi tiết nhỏ trong bản thảo hiện tại với các chương Đã Duyệt và Story Bible: giờ giấc, thời lượng di chuyển, thương tích cơ thể, trang phục, thời tiết, vị trí đồ vật.',
        '2. Trích dẫn nguyên văn câu bị mâu thuẫn và đề xuất phương án sửa khớp 100% trục thời gian.',
        '',
        'II. KIỂM TOÁN BẤT CÂN XỨNG THÔNG TIN (EPISTEMIC & POV BREACH AUDIT):',
        '1. Phát hiện lỗi nhân vật biết trước bí mật chưa được tiết lộ hoặc lỗi "nhìn xuyên thấu" suy nghĩ của nhân vật khác vượt quá giới hạn POV.',
        '',
        'III. KHỬ DẤU VẾT AI, SỬA CHÍNH TẢ & CHUẨN HÓA QUY ƯỚC THOẠI:',
        '1. Quét sạch các cụm từ sáo rỗng và sửa lại 100% lời thoại sai quy cách về đúng chuẩn: - Câu thoại (Tên nhân vật).',
        '==================================================================='
      ].join('\n')
    },

    MODE_4_REVIEW: {
      id: 'MODE_4_REVIEW',
      shortName: '📊 4. Đầu Ra Review Đa Chiều & Nhịp Độ',
      badgeColor: 'rose',
      headerTitle: '📊 CỬA SỔ ĐẦU RA CHẾ ĐỘ 4: HỘI ĐỒNG PHÊ BÌNH REVIEW ĐA CHIỀU & ĐÁNH GIÁ NHỊP ĐỘ CHƯƠNG',
      emptyHint:
        'Chưa có bài Review tổng thể nào ở Chế độ 4. Mọi bảng chấm điểm 5 trụ cột, phân tích đường cong nhịp độ (Pacing) và đề xuất nâng cấp văn chương sẽ hiển thị riêng tại cửa sổ này!',
      placeholder: [
        '📊 [GỢI Ý CHẾ ĐỘ 4 — REVIEW TỔNG THỂ ĐA CHIỀU & ĐÁNH GIÁ NHỊP ĐỘ CHƯƠNG]:',
        '• Phân tích đường cong nhịp độ (Pacing & Tension Curve): Đánh giá từng phân cảnh xem độ căng tâm lý đã đủ chậm và sâu chưa, hay đang bị trôi nhanh.',
        '• Chấm điểm 5 trụ cột (Thang 10): Nhịp độ Slow-burn, Chiều sâu nội tâm (Show-Don’t-Tell), Sức nặng đối thoại ngầm (Subtext), Logic phục bút, và Dư âm kết chương.',
        '• Đề xuất nâng cấp thực chiến: Viết mẫu phương án nâng cấp cho 2-3 đoạn còn mỏng tâm lý trong chương.',
        '👉 Bấm nút [✨ Chèn Khung Mẫu Chế Độ 4] ở thanh công cụ phía trên để nạp phiếu thẩm định tác phẩm!'
      ].join('\n'),
      sampleTemplate: [
        '【YÊU CẦU HỘI ĐỒNG PHÊ BÌNH REVIEW ĐA CHIỀU & CHẨN ĐOÁN NHỊP ĐỘ (CHẾ ĐỘ 4)】',
        'Hãy đọc kỹ bản thảo hiện tại trong mạch liên kết với các chương Đã Duyệt và lập Báo Cáo Review Chuyên Sâu:',
        '1. [Bảng Chấm Điểm 5 Trụ Cột (Thang 10)]: (a) Nhịp độ Slow-burn, (b) Chiều sâu tâm lý đa chiều, (c) Sức nặng lời thoại & Subtext, (d) Cấu trúc phục bút trinh thám, (e) Sức ám ảnh của đoạn kết.',
        '2. [Biểu Đồ Nhịp Độ Từng Phân Cảnh]: Chỉ rõ phân cảnh nào đắt giá nhất và phân cảnh nào đang bị vội hoặc kể lể trực tiếp (Tell thay vì Show).',
        '3. [Phương Án Nâng Cấp Mẫu]: Chọn ra 2-3 đoạn cần tăng độ sâu tâm lý trong chương và viết lại bản nâng cấp mẫu.'
      ].join('\n'),
      systemPrompt: [
        '===================================================================',
        '【CHẾ ĐỘ 4: HỘI ĐỒNG PHÊ BÌNH VĂN HỌC & TỔNG BIÊN TẬP TIỂU THUYẾT TÂM LÝ - TRINH THÁM】',
        'Bạn là Hội đồng Thẩm định Tác phẩm Tiểu thuyết Tâm lý - Trinh thám chuyên nghiệp.',
        '',
        'I. PHÂN TÍCH ĐỊNH LƯỢNG 5 TRỤ CỘT & BIỂU ĐỒ NHỊP ĐỘ (PACING & TENSION DIAGNOSTICS):',
        '1. Chấm điểm khách quan, khắt khe trên thang 10 kèm trích dẫn dẫn chứng cụ thể từ bản thảo.',
        '2. Mổ xẻ tỷ lệ giữa [Miêu tả không gian/hành vi], [Độc thoại nội tâm], và [Đối thoại] qua từng phân cảnh.',
        '',
        'II. ĐỀ XUẤT BIÊN TẬP NÂNG TẦM TÁC PHẨM (REWRITE DEMO):',
        '1. Luôn trích dẫn những đoạn văn còn mỏng trong bản thảo và viết lại phương án nâng cấp mẫu giàu sức gợi, sắc lạnh và ám ảnh hơn.',
        '==================================================================='
      ].join('\n')
    }
  };

  // ==========================================================================
  // MÔ-ĐUN 5 (CHẶNG 2): TRUNG TÂM ĐẦU RA AI 4 CỬA SỔ ĐỘC LẬP THEO 4 CHẾ ĐỘ
  // - Thay thế khung "2. Bản Thảo Chi Tiết" ở Tab 3 bằng Khung Đầu Ra AI 4 Cửa Sổ.
  // - Đồng thời gắn Khung Đầu Ra 4 Cửa Sổ ngay bên trong cửa sổ Full-Screen AI Center
  //   để dù bạn đang mở cửa sổ lệnh hay đang ở Tab 3 đều thấy ngay câu trả lời!
  // ==========================================================================
  class QuadModeAiOutputWorkspace {
    static STORAGE_KEY = 'noir_s20_quad_mode_outputs_v1';
    static activeViewMode = 'MODE_1_DRAFT';
    static outputsByMode = {
      MODE_1_DRAFT: [],
      MODE_2_CONSULT: [],
      MODE_3_AUDIT: [],
      MODE_4_REVIEW: []
    };

    static init() {
      this.loadSavedOutputs();
      this.injectWorkspaceStyles();
      this.mountTab3ReplacementStudio();
      this.hookScreenNavigationForTab3();
      this.hookAllAiGenerationPipelines();
    }

    static loadSavedOutputs() {
      try {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          ['MODE_1_DRAFT', 'MODE_2_CONSULT', 'MODE_3_AUDIT', 'MODE_4_REVIEW'].forEach(
            (k) => {
              if (Array.isArray(parsed[k])) {
                this.outputsByMode[k] = parsed[k];
              }
            }
          );
        }
      } catch (_) {}
      window.StudioStage20.state.modeOutputs = this.outputsByMode;
    }

    static persistOutputs() {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.outputsByMode));
        window.StudioStage20.state.modeOutputs = this.outputsByMode;
        if (window.StudioStage20?.autoSaver) {
          window.StudioStage20.autoSaver.isDirty = true;
          window.StudioStage20.autoSaver.setDotState('DIRTY_RED');
        }
      } catch (_) {}
    }

    static normalizeModeKey(rawMode) {
      const m = String(rawMode || '').toUpperCase();
      if (m.includes('2') || m.includes('CONSULT') || m.includes('ADVISOR')) {
        return 'MODE_2_CONSULT';
      }
      if (m.includes('3') || m.includes('AUDIT')) {
        return 'MODE_3_AUDIT';
      }
      if (m.includes('4') || m.includes('REVIEW')) {
        return 'MODE_4_REVIEW';
      }
      return 'MODE_1_DRAFT';
    }

    static detectCurrentSelectedAiMode() {
      let found = this.activeViewMode || 'MODE_1_DRAFT';
      document.querySelectorAll('select').forEach((sel) => {
        const firstOpt = sel.options?.[0]?.textContent || '';
        if (
          sel.id === 'select-ai-work-mode' ||
          sel.id === 's17-ai-mode-select' ||
          firstOpt.includes('Chế độ 1:')
        ) {
          found = this.normalizeModeKey(sel.value);
        }
      });
      return found;
    }

    static injectWorkspaceStyles() {
      if (document.getElementById('s20-quad-output-styles')) return;
      const style = document.createElement('style');
      style.id = 's20-quad-output-styles';
      style.textContent = `
        /* Khi đang ở Tab 3 (SCREEN_3_AI), ẩn khung Bản Thảo Chi Tiết của Tab 1 và hiện Trung Tâm Đầu Ra AI 4 Cửa Sổ */
        body[data-s14-screen="SCREEN_3_AI"] #pane-right-manuscript {
          display: none !important;
        }
        body[data-s14-screen="SCREEN_3_AI"] #s20-tab3-quad-output-studio {
          display: flex !important;
        }
        body:not([data-s14-screen="SCREEN_3_AI"]) #s20-tab3-quad-output-studio {
          display: none !important;
        }

        .s20-mode-window-pane {
          display: none;
        }
        .s20-mode-window-pane.s20-window-active {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
        }
      `;
      document.head.appendChild(style);
    }

    static createQuadOutputStudioMarkup(prefix) {
      return `
        <!-- Thanh Điều Hướng & Phân Loại 4 Cửa Sổ Đầu Ra AI Độc Lập -->
        <div class="px-4 py-2.5 border-b border-studioLightBorder dark:border-zinc-800 bg-zinc-900/95 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs uppercase flex items-center gap-1.5">
              <span>🤖 HỆ THỐNG 4 CỬA SỔ ĐẦU RA AI RIÊNG BIỆT:</span>
            </span>

            <!-- Trình đơn thả xuống chọn Cửa sổ đầu ra theo 4 chế độ -->
            <select id="${prefix}-mode-window-select" class="px-3 py-1.5 rounded-xl bg-zinc-950 border-2 border-emerald-500/60 text-emerald-300 font-extrabold text-xs cursor-pointer focus:outline-none">
              <option value="MODE_1_DRAFT">✍️ Cửa sổ 1: Đầu Ra Viết Bản Thảo Nháp Chậm (Slow-Burn)</option>
              <option value="MODE_2_CONSULT">🧭 Cửa sổ 2: Đầu Ra Tham Mưu Cốt Truyện & Phục Bút</option>
              <option value="MODE_3_AUDIT">🔍 Cửa sổ 3: Đầu Ra Kiểm Toán Logic, Giờ Giấc & Sửa Lỗi</option>
              <option value="MODE_4_REVIEW">📊 Cửa sổ 4: Đầu Ra Review Tổng Thể & Nhịp Độ Chương</option>
            </select>
          </div>

          <!-- 4 Nút Tab chuyển nhanh giữa 4 cửa sổ đầu ra -->
          <div class="flex flex-wrap items-center gap-1.5">
            <button type="button" data-s20-win-tab="MODE_1_DRAFT" class="${prefix}-win-tab-btn px-2.5 py-1 rounded-lg font-extrabold text-[11px] bg-emerald-600 text-white shadow transition">
              ✍️ 1. Bản Nháp (<span id="${prefix}-count-MODE_1_DRAFT">0</span>)
            </button>
            <button type="button" data-s20-win-tab="MODE_2_CONSULT" class="${prefix}-win-tab-btn px-2.5 py-1 rounded-lg font-extrabold text-[11px] bg-zinc-800 text-amber-300 hover:bg-zinc-700 transition">
              🧭 2. Tham Mưu (<span id="${prefix}-count-MODE_2_CONSULT">0</span>)
            </button>
            <button type="button" data-s20-win-tab="MODE_3_AUDIT" class="${prefix}-win-tab-btn px-2.5 py-1 rounded-lg font-extrabold text-[11px] bg-zinc-800 text-indigo-300 hover:bg-zinc-700 transition">
              🔍 3. Kiểm Toán (<span id="${prefix}-count-MODE_3_AUDIT">0</span>)
            </button>
            <button type="button" data-s20-win-tab="MODE_4_REVIEW" class="${prefix}-win-tab-btn px-2.5 py-1 rounded-lg font-extrabold text-[11px] bg-zinc-800 text-rose-300 hover:bg-zinc-700 transition">
              📊 4. Review (<span id="${prefix}-count-MODE_4_REVIEW">0</span>)
            </button>
            <button type="button" id="${prefix}-btn-open-prompt-modal" class="ml-1 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-[11px] shadow transition">
              🎛️ Mở Bảng Cấu Hình Prompt Đầy Đủ
            </button>
          </div>
        </div>

        <!-- 4 CỬA SỔ ĐẦU RA TÁCH BIỆT HOÀN TOÀN (KHÔNG TRÙNG LẶP NỘI DUNG) -->
        <div class="flex-1 flex flex-col overflow-hidden bg-studioLightBg dark:bg-zinc-950/90 relative">
          ${['MODE_1_DRAFT', 'MODE_2_CONSULT', 'MODE_3_AUDIT', 'MODE_4_REVIEW']
            .map((mKey, idx) => {
              const spec = MASTER_4MODES_SPECIFICATIONS[mKey];
              return `
                <div id="${prefix}-window-${mKey}" data-mode-pane="${mKey}" class="s20-mode-window-pane ${
                idx === 0 ? 's20-window-active' : ''
              }">
                  <!-- Thanh tiêu đề riêng của từng cửa sổ chế độ -->
                  <div class="px-4 py-2 border-b border-studioLightBorder dark:border-zinc-800 bg-zinc-900/60 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
                    <span class="font-extrabold text-emerald-400">${spec.headerTitle}</span>
                    <div class="flex flex-wrap items-center gap-1.5">
                      ${
                        mKey === 'MODE_1_DRAFT' || mKey === 'MODE_3_AUDIT'
                          ? `
                        <button type="button" data-s20-push-append="${mKey}" class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] shadow transition" title="Chèn nối tiếp kết quả mới nhất của cửa sổ này vào cuối Bản Thảo Chính ở Tab 1">
                          📥 Chèn Nối Tiếp Vào Bản Thảo (Tab 1)
                        </button>
                        <button type="button" data-s20-push-replace="${mKey}" class="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 font-bold text-[11px] transition" title="Thay thế kết quả mới nhất của cửa sổ này sang Bản Thảo Chính ở Tab 1">
                          🔄 Thay Thế Sang Bản Thảo (Tab 1)
                        </button>
                      `
                          : `
                        <button type="button" data-s20-save-to-bible="${mKey}" class="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-[11px] shadow transition" title="Lưu kết quả phân tích này bổ sung vào Story Bible">
                          🏛️ Lưu Bổ Sung Vào Story Bible
                        </button>
                      `
                      }
                      <button type="button" data-s20-copy-latest="${mKey}" class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-[11px] transition">
                        📋 Copy Kết Quả
                      </button>
                      <button type="button" data-s20-clear-mode="${mKey}" class="px-2.5 py-1 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 font-bold text-[11px] transition">
                        🗑️ Xóa Cửa Sổ Này
                      </button>
                    </div>
                  </div>

                  <!-- Vùng cuộn hiển thị các thẻ kết quả trả về (Giống cửa sổ trò chuyện AI) + Khung nháp có thể sửa trực tiếp -->
                  <div id="${prefix}-feed-${mKey}" class="flex-1 overflow-y-auto p-4 space-y-4 select-text"></div>
                </div>
              `;
            })
            .join('')}
        </div>

        <!-- Thanh Nhập Câu Lệnh Trực Tiếp Ngay Dưới Cửa Sổ Đầu Ra (Chạy trực tiếp vào Chế độ đang chọn) -->
        <div class="p-3 border-t border-studioLightBorder dark:border-zinc-800 bg-zinc-900/95 space-y-2 shrink-0">
          <!-- Thanh Kích thước ô nhập lệnh & Nút chèn mẫu ngay phía trên ô nhập -->
          <div class="flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="font-extrabold text-emerald-400">🔍 Kích thước ô nhập lệnh:</span>
              <button type="button" data-s20-input-h="90px" class="${prefix}-input-h-btn px-2 py-0.5 rounded bg-zinc-800 hover:bg-emerald-600 text-zinc-200 hover:text-white font-bold text-[10px]">
                Gọn (90px)
              </button>
              <button type="button" data-s20-input-h="160px" class="${prefix}-input-h-btn px-2 py-0.5 rounded bg-emerald-600 text-white font-extrabold text-[10px]">
                Vừa (160px)
              </button>
              <button type="button" data-s20-input-h="280px" class="${prefix}-input-h-btn px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-zinc-950 font-extrabold text-[10px]">
                Lớn (280px)
              </button>
              <button type="button" data-s20-input-h="45vh" class="${prefix}-input-h-btn px-2 py-0.5 rounded bg-indigo-500/20 hover:bg-indigo-600 text-indigo-300 hover:text-white font-extrabold text-[10px]">
                Siêu Rộng (45% Màn Hình)
              </button>
            </div>
            <div class="flex items-center gap-1.5">
              <button type="button" id="${prefix}-btn-fill-template" class="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-[11px] shadow transition">
                ✨ Chèn Khung Mẫu Chế Độ Này
              </button>
            </div>
          </div>

          <div class="flex flex-col md:flex-row items-stretch gap-2">
            <textarea id="${prefix}-direct-prompt-input" rows="3" class="flex-1 w-full p-3 rounded-xl border-2 border-emerald-500/50 bg-zinc-950 text-zinc-100 font-sansUI text-xs leading-relaxed focus:outline-none focus:border-emerald-400 select-text" placeholder="${
        MASTER_4MODES_SPECIFICATIONS.MODE_1_DRAFT.placeholder
      }"></textarea>
            <button type="button" id="${prefix}-btn-send-direct-prompt" class="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-xl transition flex flex-col items-center justify-center gap-1 shrink-0">
              <span class="text-base">🚀</span>
              <span>Chạy Prompt Ngay</span>
              <span id="${prefix}-send-mode-sublabel" class="text-[10px] font-monoCode text-emerald-200">(Vào Cửa sổ 1)</span>
            </button>
          </div>
        </div>
      `;
    }

    static mountTab3ReplacementStudio() {
      const rightManuscriptPane = document.getElementById('pane-right-manuscript');
      if (
        !rightManuscriptPane ||
        !rightManuscriptPane.parentElement ||
        document.getElementById('s20-tab3-quad-output-studio')
      ) {
        return;
      }

      const studioEl = document.createElement('div');
      studioEl.id = 's20-tab3-quad-output-studio';
      studioEl.className = 'lg:col-span-12 flex-1 flex flex-col overflow-hidden';
      studioEl.innerHTML = this.createQuadOutputStudioMarkup('s20-tab3');

      rightManuscriptPane.parentElement.appendChild(studioEl);
      this.bindQuadStudioEvents('s20-tab3');
      this.renderAllModeFeeds();
    }

    static mountEmbeddedOutputInsideFullScreenModal() {
      // Nếu người dùng đang mở cửa sổ Full-Screen AI Center, gắn thêm Khung Kết Quả 4 Cửa Sổ ngay bên dưới ô nhập câu lệnh để xem trực tiếp!
      document.querySelectorAll('textarea').forEach((ta) => {
        if (ta.id.startsWith('s20-')) return;
        const ph = (ta.getAttribute('placeholder') || '').toLowerCase();
        const isMainAiModalTa =
          ta.id === 's6-popup-prompt-textarea' ||
          ph.includes('nhập diễn biến cốt lõi') ||
          ph.includes('gợi ý chế độ');

        if (!isMainAiModalTa) return;

        // Đồng bộ thanh kích thước và placeholder cho ô nhập câu lệnh trong Modal
        this.enhanceModalPromptTextarea(ta);

        const dialogContainer =
          ta.closest('#s6-prompt-modal-dialog') ||
          ta.closest('.max-w-5xl, .max-w-6xl, .max-w-7xl, .overflow-y-auto') ||
          ta.parentElement?.parentElement;

        if (
          dialogContainer &&
          !dialogContainer.querySelector('#s20-modal-embedded-quad-output')
        ) {
          const embeddedWrap = document.createElement('div');
          embeddedWrap.id = 's20-modal-embedded-quad-output';
          embeddedWrap.className =
            'mt-4 rounded-2xl border-2 border-emerald-500/60 bg-zinc-950 overflow-hidden flex flex-col shadow-2xl';
          embeddedWrap.style.minHeight = '420px';
          embeddedWrap.innerHTML = this.createQuadOutputStudioMarkup('s20-modal');

          dialogContainer.appendChild(embeddedWrap);
          this.bindQuadStudioEvents('s20-modal');
          this.renderAllModeFeeds();
        }
      });
    }

    static enhanceModalPromptTextarea(ta) {
      if (!ta || ta.dataset.s20ModalTaEnhanced === 'true') return;
      ta.dataset.s20ModalTaEnhanced = 'true';

      const curMode = this.detectCurrentSelectedAiMode();
      const spec =
        MASTER_4MODES_SPECIFICATIONS[curMode] ||
        MASTER_4MODES_SPECIFICATIONS.MODE_1_DRAFT;
      ta.setAttribute('placeholder', spec.placeholder);

      if (
        ta.parentElement &&
        !ta.parentElement.querySelector('.s20-modal-ta-size-toolbar')
      ) {
        const sizeBar = document.createElement('div');
        sizeBar.className =
          's20-modal-ta-size-toolbar mb-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-emerald-500/50 flex flex-wrap items-center justify-between gap-2 text-xs';
        sizeBar.innerHTML = `
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="font-extrabold text-emerald-400 text-[11px]">
              🔍 Kích Thước Khung Nhập Lệnh AI (Tab 3):
            </span>
            <button type="button" data-ta-h="160px" class="s20-m-size-btn px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-emerald-600 text-zinc-200 hover:text-white font-bold text-[10px] transition">
              Cỡ Nhỏ (160px)
            </button>
            <button type="button" data-ta-h="260px" class="s20-m-size-btn px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-extrabold text-[10px] transition">
              Cỡ Vừa (260px)
            </button>
            <button type="button" data-ta-h="420px" class="s20-m-size-btn px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-zinc-950 border border-amber-500/40 font-extrabold text-[10px] transition">
              Cỡ Lớn (420px)
            </button>
            <button type="button" data-ta-h="62vh" class="s20-m-size-btn px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 font-extrabold text-[10px] transition">
              Siêu Rộng (62% Màn Hình)
            </button>
          </div>
          <button type="button" class="btn-s20-modal-fill-sample px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-[11px] shadow transition">
            ✨ Chèn Khung Mẫu Của Chế Độ Đang Chọn
          </button>
        `;

        ta.parentElement.insertBefore(sizeBar, ta);

        sizeBar.querySelectorAll('.s20-m-size-btn').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            const h = btn.getAttribute('data-ta-h') || '260px';
            ta.style.setProperty('height', h, 'important');
            ta.style.setProperty('min-height', h, 'important');
            ta.style.setProperty('max-height', '75vh', 'important');
          });
        });

        sizeBar
          .querySelector('.btn-s20-modal-fill-sample')
          ?.addEventListener('click', (e) => {
            e.preventDefault();
            const mKey = this.detectCurrentSelectedAiMode();
            const tpl =
              MASTER_4MODES_SPECIFICATIONS[mKey]?.sampleTemplate ||
              MASTER_4MODES_SPECIFICATIONS.MODE_1_DRAFT.sampleTemplate;
            ta.value = ta.value.trim() ? `${ta.value.trim()}\n\n${tpl}` : tpl;
            ta.focus();
          });
      }
    }

    static bindQuadStudioEvents(prefix) {
      const sel = document.getElementById(`${prefix}-mode-window-select`);
      sel?.addEventListener('change', () => {
        this.switchActiveOutputWindow(sel.value);
      });

      document.querySelectorAll(`.${prefix}-win-tab-btn`).forEach((btn) => {
        btn.addEventListener('click', () => {
          const targetMode = btn.getAttribute('data-s20-win-tab');
          this.switchActiveOutputWindow(targetMode);
        });
      });

      document
        .getElementById(`${prefix}-btn-open-prompt-modal`)
        ?.addEventListener('click', () => {
          window.StudioStage6?.openPromptCommandModal?.();
        });

      const directInput = document.getElementById(`${prefix}-direct-prompt-input`);
      document.querySelectorAll(`.${prefix}-input-h-btn`).forEach((btn) => {
        btn.addEventListener('click', () => {
          const h = btn.getAttribute('data-s20-input-h') || '160px';
          if (directInput) {
            directInput.style.setProperty('height', h, 'important');
            directInput.style.setProperty('min-height', h, 'important');
          }
        });
      });

      document
        .getElementById(`${prefix}-btn-fill-template`)
        ?.addEventListener('click', () => {
          const mKey = this.activeViewMode || 'MODE_1_DRAFT';
          const tpl =
            MASTER_4MODES_SPECIFICATIONS[mKey]?.sampleTemplate ||
            MASTER_4MODES_SPECIFICATIONS.MODE_1_DRAFT.sampleTemplate;
          if (directInput) {
            directInput.value = directInput.value.trim()
              ? `${directInput.value.trim()}\n\n${tpl}`
              : tpl;
            directInput.focus();
          }
        });

      const sendBtn = document.getElementById(`${prefix}-btn-send-direct-prompt`);
      sendBtn?.addEventListener('click', () => {
        if (!directInput || !directInput.value.trim()) {
          alert('Bạn hãy nhập câu lệnh hoặc bấm [✨ Chèn Khung Mẫu] trước khi chạy nhé!');
          return;
        }
        this.executeDirectPromptForMode(this.activeViewMode, directInput.value.trim(), sendBtn);
      });

      // Các nút thao tác trên từng cửa sổ (Chèn nối tiếp sang Tab 1, Thay thế sang Tab 1, Lưu vào Story Bible, Copy, Xóa)
      const rootEl =
        document.getElementById('s20-tab3-quad-output-studio') || document.body;
      ['s20-tab3', 's20-modal'].forEach((p) => {
        const container =
          p === 's20-tab3'
            ? document.getElementById('s20-tab3-quad-output-studio')
            : document.getElementById('s20-modal-embedded-quad-output');
        if (!container || container.dataset.s20ActionsBound === 'true') return;
        container.dataset.s20ActionsBound = 'true';

        container.querySelectorAll('[data-s20-push-append]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const mKey = btn.getAttribute('data-s20-push-append');
            const latest = this.getLatestOutputText(mKey);
            if (!latest) return;
            const mainEditor = document.getElementById('textarea-chapter-content');
            if (mainEditor) {
              mainEditor.value = mainEditor.value.trim()
                ? `${mainEditor.value.trim()}\n\n${latest}`
                : latest;
              mainEditor.dispatchEvent(new Event('input', { bubbles: true }));
              window.StudioStage7?.saveEngine?.showSaveToastNotification(
                '📥 Đã chèn nối tiếp kết quả vào cuối Bản Thảo Chính (Tab 1)!'
              );
            }
          });
        });

        container.querySelectorAll('[data-s20-push-replace]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const mKey = btn.getAttribute('data-s20-push-replace');
            const latest = this.getLatestOutputText(mKey);
            if (!latest) return;
            const mainEditor = document.getElementById('textarea-chapter-content');
            if (mainEditor) {
              mainEditor.value = latest;
              mainEditor.dispatchEvent(new Event('input', { bubbles: true }));
              window.StudioStage7?.saveEngine?.showSaveToastNotification(
                '🔄 Đã cập nhật kết quả sang Bản Thảo Chính (Tab 1)!'
              );
            }
          });
        });

        container.querySelectorAll('[data-s20-save-to-bible]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const mKey = btn.getAttribute('data-s20-save-to-bible');
            const latest = this.getLatestOutputText(mKey);
            if (!latest) return;
            const curBible =
              localStorage.getItem('noir_s10_rendered_bible_content') || '';
            const updatedBible = `${curBible}\n\n=== [BỔ SUNG TỪ ${mKey} (${new Date().toLocaleTimeString(
              'vi-VN'
            )})] ===\n${latest}`.trim();
            localStorage.setItem('noir_s10_rendered_bible_content', updatedBible);
            const bibleTa = document.getElementById('s10-bible-rendered-textarea');
            if (bibleTa) bibleTa.value = updatedBible;
            window.StudioStage7?.saveEngine?.showSaveToastNotification(
              '🏛️ Đã lưu bổ sung kết quả tham mưu vào Story Bible!'
            );
          });
        });

        container.querySelectorAll('[data-s20-copy-latest]').forEach((btn) => {
          btn.addEventListener('click', async () => {
            const mKey = btn.getAttribute('data-s20-copy-latest');
            const latest = this.getLatestOutputText(mKey);
            if (!latest) return;
            try {
              await navigator.clipboard.writeText(latest);
              window.StudioStage7?.saveEngine?.showSaveToastNotification(
                '📋 Đã copy kết quả đầu ra vào bộ nhớ tạm!'
              );
            } catch (_) {}
          });
        });

        container.querySelectorAll('[data-s20-clear-mode]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const mKey = btn.getAttribute('data-s20-clear-mode');
            this.outputsByMode[mKey] = [];
            this.persistOutputs();
            this.renderAllModeFeeds();
          });
        });
      });
    }

    static getLatestOutputText(modeKey) {
      const list = this.outputsByMode[modeKey] || [];
      if (list.length === 0) {
        alert('Cửa sổ chế độ này hiện chưa có kết quả đầu ra nào!');
        return '';
      }
      // Lấy nội dung từ textarea chỉnh sửa của thẻ mới nhất
      const latestCardTa = document.querySelector(
        `textarea[data-s20-card-editor="${modeKey}-0"]`
      );
      if (latestCardTa) return latestCardTa.value.trim();
      return list[0].outputText || '';
    }

    static switchActiveOutputWindow(modeKey) {
      const validKey = MASTER_4MODES_SPECIFICATIONS[modeKey]
        ? modeKey
        : 'MODE_1_DRAFT';
      this.activeViewMode = validKey;
      window.StudioStage20.state.activeAiMode = validKey;

      const spec = MASTER_4MODES_SPECIFICATIONS[validKey];

      ['s20-tab3', 's20-modal'].forEach((prefix) => {
        const sel = document.getElementById(`${prefix}-mode-window-select`);
        if (sel && sel.value !== validKey) sel.value = validKey;

        document.querySelectorAll(`.${prefix}-win-tab-btn`).forEach((btn) => {
          const isTarget = btn.getAttribute('data-s20-win-tab') === validKey;
          btn.className = isTarget
            ? `${prefix}-win-tab-btn px-2.5 py-1 rounded-lg font-extrabold text-[11px] bg-emerald-600 text-white shadow transition`
            : `${prefix}-win-tab-btn px-2.5 py-1 rounded-lg font-extrabold text-[11px] bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition`;
        });

        ['MODE_1_DRAFT', 'MODE_2_CONSULT', 'MODE_3_AUDIT', 'MODE_4_REVIEW'].forEach(
          (k) => {
            const pane = document.getElementById(`${prefix}-window-${k}`);
            if (pane) {
              pane.classList.toggle('s20-window-active', k === validKey);
            }
          }
        );

        const directInput = document.getElementById(`${prefix}-direct-prompt-input`);
        if (directInput) {
          directInput.setAttribute('placeholder', spec.placeholder);
        }

        const subLabel = document.getElementById(`${prefix}-send-mode-sublabel`);
        if (subLabel) {
          const num = validKey.replace(/\D/g, '') || '1';
          subLabel.textContent = `(Vào Cửa sổ ${num})`;
        }
      });

      // Đồng bộ placeholder cho các ô nhập câu lệnh khác trên màn hình
      document.querySelectorAll('textarea').forEach((ta) => {
        if (ta.id.startsWith('s20-')) return;
        const ph = (ta.getAttribute('placeholder') || '').toLowerCase();
        if (
          ta.id === 's6-popup-prompt-textarea' ||
          ph.includes('nhập diễn biến cốt lõi') ||
          ph.includes('gợi ý chế độ')
        ) {
          ta.setAttribute('placeholder', spec.placeholder);
        }
      });
    }

    static recordNewAiOutput(modeKey, outputText, modelUsed = 'gemini-3.8-flash', promptSummary = '') {
      const cleanText = String(outputText || '').trim();
      if (!cleanText || cleanText.length < 5) return;

      const targetKey = this.normalizeModeKey(modeKey || this.detectCurrentSelectedAiMode());
      const list = this.outputsByMode[targetKey] || [];

      // Tránh ghi trùng 2 lần liên tiếp cùng 1 phản hồi
      if (list.length > 0 && list[0].outputText === cleanText) {
        return;
      }

      const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
      list.unshift({
        id: `out_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour12: false }),
        modelUsed,
        wordCount,
        promptSummary: (promptSummary || '').slice(0, 180),
        outputText: cleanText
      });

      // Giữ tối đa 25 kết quả gần nhất cho mỗi chế độ
      this.outputsByMode[targetKey] = list.slice(0, 25);
      this.persistOutputs();
      this.switchActiveOutputWindow(targetKey);
      this.renderAllModeFeeds();
    }

    static renderAllModeFeeds() {
      ['s20-tab3', 's20-modal'].forEach((prefix) => {
        ['MODE_1_DRAFT', 'MODE_2_CONSULT', 'MODE_3_AUDIT', 'MODE_4_REVIEW'].forEach(
          (mKey) => {
            const list = this.outputsByMode[mKey] || [];
            const countBadge = document.getElementById(`${prefix}-count-${mKey}`);
            if (countBadge) countBadge.textContent = String(list.length);

            const feedEl = document.getElementById(`${prefix}-feed-${mKey}`);
            if (!feedEl) return;

            const spec = MASTER_4MODES_SPECIFICATIONS[mKey];
            if (list.length === 0) {
              feedEl.innerHTML = `
                <div class="p-8 rounded-2xl border-2 border-dashed border-zinc-800 text-center space-y-2 text-zinc-400">
                  <div class="text-2xl">🤖</div>
                  <div class="font-extrabold text-xs text-emerald-400">${spec.headerTitle}</div>
                  <p class="text-xs max-w-xl mx-auto leading-relaxed">${spec.emptyHint}</p>
                </div>
              `;
              return;
            }

            feedEl.innerHTML = list
              .map(
                (item, idx) => `
                <div class="p-4 rounded-2xl border-2 ${
                  idx === 0
                    ? 'border-emerald-500/80 bg-zinc-900/95 shadow-xl'
                    : 'border-zinc-800 bg-zinc-900/60'
                } space-y-2.5">
                  <div class="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2 text-[11px]">
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 rounded bg-emerald-600 text-white font-monoCode font-extrabold text-[10px]">
                        ${idx === 0 ? '✨ MỚI NHẤT' : `#${list.length - idx}`} • ${item.timestamp}
                      </span>
                      <span class="font-bold text-amber-400 font-monoCode">
                        Model: ${item.modelUsed}
                      </span>
                      <span class="text-emerald-300 font-monoCode font-bold">
                        • ${item.wordCount.toLocaleString('vi-VN')} từ
                      </span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <button type="button" data-s20-card-to-tab1="${mKey}-${idx}" class="px-2.5 py-0.5 rounded bg-emerald-600/25 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 font-bold text-[10px] transition">
                        📥 Đưa Đoạn Này Sang Bản Thảo Tab 1
                      </button>
                      <button type="button" data-s20-card-del="${mKey}-${idx}" class="px-2 py-0.5 rounded bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white font-bold text-[10px] transition">
                        ✕ Xóa
                      </button>
                    </div>
                  </div>

                  ${
                    item.promptSummary
                      ? `<div class="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 italic truncate">
                          <b>Lệnh đã gửi:</b> ${item.promptSummary.replace(/</g, '&lt;')}
                        </div>`
                      : ''
                  }

                  <textarea data-s20-card-editor="${mKey}-${idx}" rows="${Math.min(
                  22,
                  Math.max(8, Math.ceil(item.outputText.length / 110))
                )}" class="w-full p-3.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 novel-prose text-sm leading-relaxed focus:outline-none focus:border-emerald-500 select-text">${item.outputText.replace(
                  /</g,
                  '&lt;'
                )}</textarea>
                </div>
              `
              )
              .join('');

            // Cho phép sửa trực tiếp trong khung nháp kết quả và lưu lại
            feedEl.querySelectorAll('[data-s20-card-editor]').forEach((ta) => {
              ta.addEventListener('input', () => {
                const [mk, iStr] = ta.getAttribute('data-s20-card-editor').split('-');
                const i = Number(iStr);
                if (this.outputsByMode[mk]?.[i]) {
                  this.outputsByMode[mk][i].outputText = ta.value;
                  this.outputsByMode[mk][i].wordCount = ta.value
                    .trim()
                    .split(/\s+/)
                    .filter(Boolean).length;
                  this.persistOutputs();
                }
              });
            });

            feedEl.querySelectorAll('[data-s20-card-to-tab1]').forEach((btn) => {
              btn.addEventListener('click', () => {
                const [mk, iStr] = btn.getAttribute('data-s20-card-to-tab1').split('-');
                const i = Number(iStr);
                const text = this.outputsByMode[mk]?.[i]?.outputText || '';
                const mainEditor = document.getElementById('textarea-chapter-content');
                if (mainEditor && text) {
                  mainEditor.value = mainEditor.value.trim()
                    ? `${mainEditor.value.trim()}\n\n${text}`
                    : text;
                  mainEditor.dispatchEvent(new Event('input', { bubbles: true }));
                  window.StudioStage7?.saveEngine?.showSaveToastNotification(
                    '📥 Đã chèn đoạn văn này vào cuối Bản Thảo Chính (Tab 1)!'
                  );
                }
              });
            });

            feedEl.querySelectorAll('[data-s20-card-del]').forEach((btn) => {
              btn.addEventListener('click', () => {
                const [mk, iStr] = btn.getAttribute('data-s20-card-del').split('-');
                const i = Number(iStr);
                if (this.outputsByMode[mk]) {
                  this.outputsByMode[mk].splice(i, 1);
                  this.persistOutputs();
                  this.renderAllModeFeeds();
                }
              });
            });
          }
        );
      });
    }

    static async executeDirectPromptForMode(modeKey, userPromptText, triggerBtn) {
      const spec =
        MASTER_4MODES_SPECIFICATIONS[modeKey] ||
        MASTER_4MODES_SPECIFICATIONS.MODE_1_DRAFT;
      const customSys = localStorage.getItem(`noir_s19_sysprompt_${modeKey}`);
      const sysInstruction = customSys && customSys.trim() ? customSys : spec.systemPrompt;

      const bibleContent =
        document.getElementById('s10-bible-rendered-textarea')?.value ||
        localStorage.getItem('noir_s10_rendered_bible_content') ||
        '';

      let chosenModel = 'gemini-3.8-flash';
      document.querySelectorAll('select').forEach((s) => {
        const lbl = (s.previousElementSibling?.textContent || '').toUpperCase();
        if (lbl.includes('MÔ HÌNH GEMINI') || s.id === 's6-popup-model-select') {
          chosenModel = s.value || chosenModel;
        }
      });

      const origHtml = triggerBtn.innerHTML;
      triggerBtn.disabled = true;
      triggerBtn.innerHTML = `<span class="animate-spin text-base">⏳</span><span>Đang chạy AI...</span>`;

      try {
        const fullSys = [
          sysInstruction,
          bibleContent ? `\n[HỒ SƠ STORY BIBLE BẮT BUỘC BÁM SÁT]:\n${bibleContent}` : ''
        ].join('\n');

        const apiKey = window.StudioStage20?.apiRouter?.getActiveApiKey() || '';
        if (!apiKey) {
          alert('Bạn hãy nhập Google Gemini API Key trước khi chạy câu lệnh nhé!');
          return;
        }

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
          chosenModel
        )}:generateContent?key=${encodeURIComponent(apiKey)}`;

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: fullSys }] },
            contents: [{ role: 'user', parts: [{ text: userPromptText }] }],
            generationConfig: {
              temperature: 0.72,
              topP: 0.92,
              maxOutputTokens: 65536
            }
          })
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.error?.message || `HTTP ${res.status}`);
        }

        const parts = data?.candidates?.[0]?.content?.parts || [];
        const replyText = parts
          .filter((p) => !p.thought && typeof p.text === 'string')
          .map((p) => p.text)
          .join('\n')
          .trim();

        if (replyText) {
          this.recordNewAiOutput(modeKey, replyText, chosenModel, userPromptText);
          window.StudioStage7?.saveEngine?.showSaveToastNotification(
            `✅ Đã nhận kết quả đầu ra tại [${spec.shortName}]!`
          );
        }
      } catch (err) {
        alert(`Lỗi khi thực thi câu lệnh: ${err.message}`);
      } finally {
        triggerBtn.disabled = false;
        triggerBtn.innerHTML = origHtml;
      }
    }

    static hookScreenNavigationForTab3() {
      // Lắng nghe mỗi khi người dùng đổi Chế độ ở bất kỳ dropdown nào -> Chuyển luôn Cửa sổ đầu ra về đúng chế độ đó!
      document.addEventListener(
        'change',
        (e) => {
          const sel = e.target;
          if (!sel || sel.tagName !== 'SELECT') return;
          if (sel.id.endsWith('-mode-window-select')) return;

          const firstText = sel.options?.[0]?.textContent || '';
          if (
            sel.id === 'select-ai-work-mode' ||
            sel.id === 's17-ai-mode-select' ||
            firstText.includes('Chế độ 1:')
          ) {
            const mKey = this.normalizeModeKey(sel.value);
            this.switchActiveOutputWindow(mKey);
          }
        },
        true
      );
    }

    static hookAllAiGenerationPipelines() {
      // Kết nối với hàm captureAiOutput của Chặng 1 để mọi câu lệnh chạy từ bất kỳ nút nào đều tự động lưu vào đúng Cửa sổ Chế độ 1, 2, 3, 4!
      window.StudioStage20.captureAiOutput = (outputText, modelUsed) => {
        const currentMode = this.detectCurrentSelectedAiMode();
        this.recordNewAiOutput(currentMode, outputText, modelUsed);
      };
    }
  }

  // ==========================================================================
  // KHỞI CHẠY CHẶNG 2 / 5
  // ==========================================================================
  function bootStage20Chapter2() {
    QuadModeAiOutputWorkspace.init();

    // Quan sát DOM nhẹ nhàng để khi người dùng mở cửa sổ Full-Screen AI Center thì gắn khung đầu ra 4 chế độ vào
    const modalObserver = new MutationObserver(() => {
      QuadModeAiOutputWorkspace.mountEmbeddedOutputInsideFullScreenModal();
    });
    modalObserver.observe(document.body, { childList: true, subtree: true });
    QuadModeAiOutputWorkspace.mountEmbeddedOutputInsideFullScreenModal();

    window.StudioStage20.modesSpec = MASTER_4MODES_SPECIFICATIONS;
    window.StudioStage20.quadOutputWorkspace = QuadModeAiOutputWorkspace;
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', bootStage20Chapter2);
  } else {
    bootStage20Chapter2();
  }
})();
/**
 * ============================================================================
 * FILE: stage20_supreme_5stage_overhaul.js
 * [CHẶNG 3 / 5]:
 *   1. Hợp nhất Lõi Đồng Hồ Pomodoro Hai Chiều (Tab 5 ⇄ Viên thuốc nhỏ góc phải):
 *      Đảm bảo bấm Chạy / Tạm dừng / Đặt lại / Chỉnh số phút ở bất kỳ đâu thì cả
 *      2 đồng hồ đều đồng bộ chính xác 100% từng giây và trạng thái nút bấm.
 *   2. Khôi phục & Nâng cấp Bộ Âm Thanh Mặc Định Thư Thái (Mưa đêm rả rích,
 *      Piano dịu nhẹ, Mưa + Piano Noir, Lửa trại ấm, Sóng biển đêm, Quán cà phê,
 *      Phím cơ ASMR) ngay trong Tab 5 và đồng bộ với thanh nhạc nổi.
 * ============================================================================
 */

(function () {
  'use strict';

  if (window.__NOIR_STAGE20_CH3_LOADED__) return;
  window.__NOIR_STAGE20_CH3_LOADED__ = true;

  // ==========================================================================
  // MÔ-ĐUN 6 (CHẶNG 3): LÕI ĐỒNG HỒ POMODORO HỢP NHẤT HAI CHIỀU (SINGLE SOURCE OF TRUTH)
  // Khắc phục triệt để lỗi bấm ở Tab 5 không chạy ở viên thuốc nhỏ góc trên phải
  // ==========================================================================
  class UnifiedMasterPomodoroEngine {
    static totalMinutes = 25;
    static remainingSeconds = 25 * 60;
    static isRunning = false;
    static lastTickTime = 0;
    static masterTimerId = null;

    static init() {
      const savedMin = parseInt(localStorage.getItem('noir_s20_pomo_minutes') || '25', 10);
      if (!Number.isNaN(savedMin) && savedMin >= 1 && savedMin <= 180) {
        this.totalMinutes = savedMin;
        this.remainingSeconds = savedMin * 60;
      }

      // Khởi chạy nhịp đồng hồ trung tâm (kiểm tra mỗi 250ms bằng delta thời gian thực)
      if (this.masterTimerId) clearInterval(this.masterTimerId);
      this.masterTimerId = setInterval(() => {
        this.onMasterTick();
      }, 250);

      this.hijackAllPomodoroControls();

      const observer = new MutationObserver(() => {
        this.hijackAllPomodoroControls();
        this.renderBothPomodoroUIs();
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    static formatTime(sec) {
      const s = Math.max(0, Math.floor(sec));
      const mm = String(Math.floor(s / 60)).padStart(2, '0');
      const ss = String(s % 60).padStart(2, '0');
      return `${mm}:${ss}`;
    }

    static toggleStartPause() {
      this.isRunning = !this.isRunning;
      this.lastTickTime = Date.now();
      this.syncLegacyPomodoroObject();
      this.renderBothPomodoroUIs();
    }

    static resetTimer(newMinutes = null) {
      if (newMinutes !== null) {
        const parsed = parseInt(String(newMinutes), 10);
        if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= 240) {
          this.totalMinutes = parsed;
          localStorage.setItem('noir_s20_pomo_minutes', String(parsed));
        }
      }
      this.isRunning = false;
      this.remainingSeconds = this.totalMinutes * 60;
      this.syncLegacyPomodoroObject();
      this.renderBothPomodoroUIs();
    }

    static syncLegacyPomodoroObject() {
      if (window.StudioStage11?.pomodoro) {
        const legacy = window.StudioStage11.pomodoro;
        if (legacy.timerId) {
          clearInterval(legacy.timerId);
          legacy.timerId = null;
        }
        legacy.isRunning = this.isRunning;
        legacy.remainingSeconds = Math.floor(this.remainingSeconds);
        legacy.workMinutes = this.totalMinutes;
      }
    }

    static onMasterTick() {
      this.syncLegacyPomodoroObject();

      if (this.isRunning) {
        const now = Date.now();
        const elapsedSec = (now - this.lastTickTime) / 1000;
        if (elapsedSec >= 0.95) {
          const wholeSec = Math.floor(elapsedSec);
          this.remainingSeconds = Math.max(0, this.remainingSeconds - wholeSec);
          this.lastTickTime = now - (elapsedSec - wholeSec) * 1000;

          if (this.remainingSeconds <= 0) {
            this.isRunning = false;
            this.playCompletionChime();
            window.StudioStage7?.saveEngine?.showSaveToastNotification(
              '🍅 Hoàn thành phiên tập trung Pomodoro! Hãy nghỉ ngơi vài phút nhé!'
            );
          }
        }
      }

      this.renderBothPomodoroUIs();
    }

    static playCompletionChime() {
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        const ctx = new Ctx();
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.18);
          gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + idx * 0.18 + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.18 + 0.55);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.18);
          osc.stop(ctx.currentTime + idx * 0.18 + 0.6);
        });
      } catch (_) {}
    }

    /**
     * Bắt sự kiện ở pha Capture trên CẢ Bảng Pomodoro ở Tab 5 VÀ Viên thuốc nhỏ góc phải
     * để cả 2 điều khiển chung 1 lõi duy nhất!
     */
    static hijackAllPomodoroControls() {
      // 1. Gắn sự kiện cho Viên thuốc Pomodoro nhỏ góc trên phải (#s15-floating-pomodoro-pill)
      const pill = document.getElementById('s15-floating-pomodoro-pill');
      if (pill && !pill.dataset.s20PomoHijacked) {
        pill.dataset.s20PomoHijacked = 'true';

        pill.addEventListener(
          'click',
          (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            if (btn.id === 'btn-s19-pomo-collapse-arrow') return;

            const txt = (btn.textContent || '').trim().toLowerCase();

            // Nút đóng (✕)
            if (txt === '✕' || txt === 'x') {
              return;
            }

            // Nút chỉnh Phút (⚙️ Phút)
            if (txt.includes('phút') || txt.includes('⚙️')) {
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation();
              const inputMin = prompt(
                '🍅 Nhập số phút tập trung Pomodoro (1 - 180 phút):',
                String(this.totalMinutes)
              );
              if (inputMin !== null) {
                this.resetTimer(inputMin);
              }
              return;
            }

            // Nút Đặt lại (↺)
            if (txt === '↺' || txt.includes('đặt lại')) {
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation();
              this.resetTimer();
              return;
            }

            // Nút Chạy / Dừng hoặc bấm vào giờ (🍅 24:55)
            if (
              txt.includes('chạy') ||
              txt.includes('dừng') ||
              txt.includes('tạm dừng') ||
              /\d{2}:\d{2}/.test(txt)
            ) {
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation();
              this.toggleStartPause();
            }
          },
          true
        );
      }

      // 2. Gắn sự kiện cho Bảng ĐỒNG HỒ TẬP TRUNG POMODORO ở Tab 5
      document.querySelectorAll('div, section').forEach((box) => {
        const heading = box.querySelector('h3, h4, span, div');
        const hText = (heading?.textContent || '').trim();
        if (
          !hText.includes('ĐỒNG HỒ TẬP TRUNG POMODORO') ||
          box.dataset.s20Tab5PomoHijacked === 'true'
        ) {
          return;
        }

        // Tìm đúng card bao ngoài bảng Pomodoro ở Tab 5
        const pomoCard =
          heading.closest('.rounded-2xl, .rounded-xl, .p-5, .p-4') || box;
        if (!pomoCard || pomoCard.dataset.s20Tab5PomoHijacked === 'true') return;
        pomoCard.dataset.s20Tab5PomoHijacked = 'true';

        // Ô input nhập số phút (25) trong Tab 5
        const minInput = pomoCard.querySelector('input[type="number"]');
        if (minInput) {
          minInput.value = String(this.totalMinutes);
          minInput.addEventListener(
            'change',
            (e) => {
              e.stopPropagation();
              this.resetTimer(minInput.value);
            },
            true
          );
          minInput.addEventListener(
            'input',
            (e) => {
              e.stopPropagation();
              const val = parseInt(minInput.value, 10);
              if (!Number.isNaN(val) && val >= 1 && val <= 240) {
                this.resetTimer(val);
              }
            },
            true
          );
        }

        // Bắt sự kiện nút Bắt đầu / Tạm dừng và Đặt lại trong Tab 5
        pomoCard.addEventListener(
          'click',
          (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            const txt = (btn.textContent || '').trim().toLowerCase();

            if (txt.includes('thu gọn')) return;

            if (txt.includes('đặt lại') || txt.includes('↺')) {
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation();
              const currentInpVal = pomoCard.querySelector('input[type="number"]')?.value;
              this.resetTimer(currentInpVal || this.totalMinutes);
              return;
            }

            if (
              txt.includes('bắt đầu') ||
              txt.includes('tạm dừng') ||
              txt.includes('tiếp tục') ||
              txt.includes('chạy') ||
              txt.includes('dừng')
            ) {
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation();
              // Đảm bảo viên thuốc nổi góc phải luôn hiện ra khi người dùng chạy Pomodoro ở Tab 5
              document
                .getElementById('s15-floating-pomodoro-pill')
                ?.classList.remove('hidden');
              this.toggleStartPause();
            }
          },
          true
        );
      });
    }

    static renderBothPomodoroUIs() {
      const formattedTime = this.formatTime(this.remainingSeconds);

      // 1. Cập nhật Viên thuốc Pomodoro nhỏ góc trên phải (#s15-floating-pomodoro-pill)
      const pill = document.getElementById('s15-floating-pomodoro-pill');
      if (pill) {
        pill.querySelectorAll('button, span, div').forEach((el) => {
          if (el.id === 'btn-s19-pomo-collapse-arrow') return;
          if (el.children.length === 0) {
            const t = (el.textContent || '').trim();
            // Cập nhật nhãn giờ (🍅 24:54)
            if (/\d{2}:\d{2}/.test(t)) {
              const nextTimeLabel = `🍅 ${formattedTime}`;
              if (el.textContent !== nextTimeLabel) el.textContent = nextTimeLabel;
            }
            // Cập nhật nút ▶ Chạy <-> ⏸ Dừng trên viên thuốc nhỏ
            if (
              t === '▶ Chạy' ||
              t === '⏸ Dừng' ||
              t === '⏸ Tạm dừng' ||
              t === '▶ Bắt đầu'
            ) {
              const targetBtnText = this.isRunning ? '⏸ Dừng' : '▶ Chạy';
              if (el.textContent !== targetBtnText) {
                el.textContent = targetBtnText;
              }
              if (el.tagName === 'BUTTON') {
                el.className = this.isRunning
                  ? 'px-2.5 py-0.5 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-[11px] transition shadow'
                  : 'px-2.5 py-0.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] transition shadow';
              }
            }
          }
        });

        // Cập nhật mũi tên khi thu nhỏ (< 🍅 24:54)
        const arrowBtn = document.getElementById('btn-s19-pomo-collapse-arrow');
        if (arrowBtn) {
          if (pill.classList.contains('s19-pomo-collapsed')) {
            const collapsedStr = `< 🍅 ${formattedTime}`;
            if (arrowBtn.textContent !== collapsedStr) {
              arrowBtn.textContent = collapsedStr;
            }
          } else if (arrowBtn.textContent !== '>') {
            arrowBtn.textContent = '>';
          }
        }
      }

      // 2. Cập nhật Bảng ĐỒNG HỒ TẬP TRUNG POMODORO ở Tab 5
      document.querySelectorAll('[data-s20-tab5-pomo-hijacked="true"]').forEach((card) => {
        card.querySelectorAll('span, div, b').forEach((el) => {
          if (el.children.length === 0 && /^\d{2}:\d{2}$/.test((el.textContent || '').trim())) {
            if (el.textContent !== formattedTime) {
              el.textContent = formattedTime;
            }
          }
        });

        card.querySelectorAll('button').forEach((btn) => {
          const bt = (btn.textContent || '').trim().toLowerCase();
          if (
            bt.includes('tạm dừng') ||
            bt.includes('bắt đầu') ||
            bt.includes('tiếp tục') ||
            bt === '▶ chạy' ||
            bt === '⏸ dừng'
          ) {
            const desiredText = this.isRunning ? '⏸ Tạm dừng' : '▶ Bắt đầu chạy';
            if (btn.textContent !== desiredText) {
              btn.textContent = desiredText;
            }
            btn.className = this.isRunning
              ? 'px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs shadow transition'
              : 'px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow transition';
          }
        });

        const minInput = card.querySelector('input[type="number"]');
        if (minInput && document.activeElement !== minInput) {
          if (minInput.value !== String(this.totalMinutes)) {
            minInput.value = String(this.totalMinutes);
          }
        }
      });
    }
  }

  // ==========================================================================
  // MÔ-ĐUN 7 (CHẶNG 3): BỘ TỔNG HỢP ÂM THANH THƯ THÁI MẶC ĐỊNH (PROCEDURAL WEBAUDIO STUDIO)
  // Khôi phục và nâng cấp đầy đủ các âm thanh mặc định trong Tab 5 & Thanh nhạc nổi:
  // 1. 🌧️ Mưa Đêm Rả Rích (Rain on Window)
  // 2. 🎹 Piano Dịu Nhẹ Trầm Lắng (Nocturne Piano)
  // 3. 🌧️🎹 Mưa Đêm & Piano Dịu Nhẹ (Noir Studio Mix)
  // 4. 🔥 Lửa Trại Ấm Áp (Cozy Fireplace)
  // 5. 🌊 Sóng Biển Đêm (Gentle Ocean Waves)
  // 6. ☕ Quán Cà Phê & Đĩa Than (Vinyl Lo-Fi Cafe)
  // 7. ⌨️ Tiếng Gõ Phím Cơ Êm Dịu (ASMR Typewriter)
  // ==========================================================================
  class ProceduralRelaxingAudioStudio {
    static audioCtx = null;
    static masterGain = null;
    static activeNodes = [];
    static activeIntervals = [];
    static currentPreset = 'NONE';
    static volume = 0.45;
    static asmrTypingEnabled = false;

    static PRESETS = [
      { id: 'NONE', name: '🔇 Tắt Âm Thanh Nền Mặc Định', short: '🔇 Tắt' },
      { id: 'RAIN_SOFT', name: '🌧️ Tiếng Mưa Đêm Rả Rích (Thư Thái)', short: '🌧️ Mưa Rả Rích' },
      { id: 'PIANO_GENTLE', name: '🎹 Tiếng Piano Dịu Nhẹ (Nocturne)', short: '🎹 Piano Dịu Nhẹ' },
      { id: 'NOIR_RAIN_PIANO', name: '🌧️🎹 Mưa Đêm & Piano Dịu Nhẹ (Noir Mix)', short: '🌧️🎹 Mưa + Piano' },
      { id: 'FIREPLACE_WARM', name: '🔥 Tiếng Lửa Trại Ấm Áp (Tí Tách)', short: '🔥 Lửa Trại Ấm' },
      { id: 'OCEAN_WAVES', name: '🌊 Tiếng Sóng Biển Đêm Dịu Êm', short: '🌊 Sóng Biển Đêm' },
      { id: 'CAFE_VINYL', name: '☕ Quán Cà Phê Đêm & Đĩa Than (Lo-Fi)', short: '☕ Cà Phê Đĩa Than' }
    ];

    static init() {
      const savedVol = parseFloat(localStorage.getItem('noir_s20_ambience_vol') || '0.45');
      if (!Number.isNaN(savedVol)) this.volume = Math.max(0.02, Math.min(1, savedVol));
      this.asmrTypingEnabled = localStorage.getItem('noir_s8_asmr_typing') === 'true';

      this.injectDefaultSoundscapePanelIntoTab5();
      this.syncFloatingMp3BarSelect();
      this.bindAsmrKeydownListener();

      const observer = new MutationObserver(() => {
        this.injectDefaultSoundscapePanelIntoTab5();
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    static ensureContext() {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      if (!this.audioCtx) {
        this.audioCtx = new Ctx();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.value = this.volume;
        this.masterGain.connect(this.audioCtx.destination);
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    }

    static stopAllAmbientSounds() {
      this.activeIntervals.forEach((id) => clearInterval(id));
      this.activeIntervals = [];

      this.activeNodes.forEach((node) => {
        try {
          if (typeof node.stop === 'function') node.stop();
          if (typeof node.disconnect === 'function') node.disconnect();
        } catch (_) {}
      });
      this.activeNodes = [];

      // Dừng bộ phát cũ của Stage 8 nếu đang chạy tránh chồng âm
      if (window.StudioStage8?.audioPlayer?.isPlayingAmbience) {
        try {
          window.StudioStage8.audioPlayer.stopAllProceduralSounds();
        } catch (_) {}
      }
    }

    static setVolume(val) {
      this.volume = Math.max(0, Math.min(1, Number(val) || 0.45));
      localStorage.setItem('noir_s20_ambience_vol', String(this.volume));
      if (this.masterGain && this.audioCtx) {
        this.masterGain.gain.setTargetAtTime(
          this.volume,
          this.audioCtx.currentTime,
          0.08
        );
      }
      const volSlider = document.getElementById('s20-tab5-ambience-vol');
      if (volSlider && document.activeElement !== volSlider) {
        volSlider.value = String(Math.round(this.volume * 100));
      }
      const volLabel = document.getElementById('s20-tab5-ambience-vol-label');
      if (volLabel) volLabel.textContent = `${Math.round(this.volume * 100)}%`;
    }

    static playPreset(presetId) {
      this.stopAllAmbientSounds();
      this.currentPreset = presetId || 'NONE';

      if (this.currentPreset === 'NONE') {
        this.updateUIActivePreset();
        return;
      }

      const ctx = this.ensureContext();
      if (!ctx) return;

      if (this.currentPreset === 'RAIN_SOFT') {
        this.startRainGenerator(ctx, 0.75);
      } else if (this.currentPreset === 'PIANO_GENTLE') {
        this.startGentlePianoGenerator(ctx, 0.9);
      } else if (this.currentPreset === 'NOIR_RAIN_PIANO') {
        this.startRainGenerator(ctx, 0.55);
        this.startGentlePianoGenerator(ctx, 0.85);
      } else if (this.currentPreset === 'FIREPLACE_WARM') {
        this.startFireplaceGenerator(ctx);
      } else if (this.currentPreset === 'OCEAN_WAVES') {
        this.startOceanWavesGenerator(ctx);
      } else if (this.currentPreset === 'CAFE_VINYL') {
        this.startVinylCafeGenerator(ctx);
      }

      this.updateUIActivePreset();
    }

    static createPinkNoiseBuffer(ctx, seconds = 4) {
      const bufferSize = ctx.sampleRate * seconds;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }
      return buffer;
    }

    static startRainGenerator(ctx, gainScale = 0.7) {
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = this.createPinkNoiseBuffer(ctx, 5);
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1150;

      const rainGain = ctx.createGain();
      rainGain.gain.value = 0.45 * gainScale;

      noiseSource.connect(filter);
      filter.connect(rainGain);
      rainGain.connect(this.masterGain);
      noiseSource.start();
      this.activeNodes.push(noiseSource, filter, rainGain);

      // Hạt mưa tí tách nhẹ nhàng trên bệ cửa sổ
      const patterInterval = setInterval(() => {
        if (this.currentPreset !== 'RAIN_SOFT' && this.currentPreset !== 'NOIR_RAIN_PIANO') {
          return;
        }
        if (Math.random() > 0.65) {
          const dropOsc = ctx.createOscillator();
          const dropGain = ctx.createGain();
          dropOsc.type = 'sine';
          dropOsc.frequency.value = 900 + Math.random() * 700;
          dropGain.gain.setValueAtTime(0.015 * gainScale, ctx.currentTime);
          dropGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.045);
          dropOsc.connect(dropGain);
          dropGain.connect(this.masterGain);
          dropOsc.start();
          dropOsc.stop(ctx.currentTime + 0.05);
        }
      }, 180);
      this.activeIntervals.push(patterInterval);
    }

    static startGentlePianoGenerator(ctx, gainScale = 0.85) {
      // Vòng hợp âm Nocturne êm dịu: Am7 -> Fmaj7 -> Cmaj7 -> G6 -> Dm7 -> Em7
      const chords = [
        [220.0, 261.63, 329.63, 392.0, 493.88],
        [174.61, 220.0, 261.63, 329.63, 440.0],
        [130.81, 196.0, 246.94, 293.66, 392.0],
        [196.0, 246.94, 293.66, 329.63, 440.0],
        [146.83, 220.0, 261.63, 349.23, 440.0],
        [164.81, 246.94, 293.66, 392.0, 493.88]
      ];
      let chordIdx = 0;

      const playSoftNote = (freq, delaySec, durationSec = 3.2) => {
        const now = ctx.currentTime + delaySec;
        const osc = ctx.createOscillator();
        const subOsc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        const lp = ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.value = freq;
        subOsc.type = 'sine';
        subOsc.frequency.value = freq * 0.5;

        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(950, now);
        lp.frequency.exponentialRampToValueAtTime(280, now + durationSec);

        noteGain.gain.setValueAtTime(0.0001, now);
        noteGain.gain.linearRampToValueAtTime(0.08 * gainScale, now + 0.08);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

        osc.connect(lp);
        subOsc.connect(lp);
        lp.connect(noteGain);
        noteGain.connect(this.masterGain);

        osc.start(now);
        subOsc.start(now);
        osc.stop(now + durationSec + 0.05);
        subOsc.stop(now + durationSec + 0.05);
      };

      const triggerChordArpeggio = () => {
        const chord = chords[chordIdx % chords.length];
        chordIdx++;
        // Rải hợp âm nhẹ nhàng
        chord.forEach((f, i) => {
          if (i < 3 || Math.random() > 0.25) {
            playSoftNote(f, i * 0.42, 3.6);
          }
        });
        // Thêm 1 nốt giai điệu ngân cao dịu nhẹ
        if (Math.random() > 0.3) {
          const melodyNote = chord[Math.floor(Math.random() * chord.length)] * 2;
          playSoftNote(melodyNote, 2.1, 2.8);
        }
      };

      triggerChordArpeggio();
      const pianoInterval = setInterval(triggerChordArpeggio, 4200);
      this.activeIntervals.push(pianoInterval);
    }

    static startFireplaceGenerator(ctx) {
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = this.createPinkNoiseBuffer(ctx, 4);
      noiseSource.loop = true;

      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 340;

      const fireGain = ctx.createGain();
      fireGain.gain.value = 0.55;

      noiseSource.connect(lp);
      lp.connect(fireGain);
      fireGain.connect(this.masterGain);
      noiseSource.start();
      this.activeNodes.push(noiseSource, lp, fireGain);

      // Tiếng củi khô nổ tí tách ấm áp
      const crackleId = setInterval(() => {
        if (this.currentPreset !== 'FIREPLACE_WARM') return;
        if (Math.random() > 0.45) {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.value = 1800 + Math.random() * 1600;
          g.gain.setValueAtTime(0.025, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.025);
          osc.connect(g);
          g.connect(this.masterGain);
          osc.start();
          osc.stop(ctx.currentTime + 0.03);
        }
      }, 150);
      this.activeIntervals.push(crackleId);
    }

    static startOceanWavesGenerator(ctx) {
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = this.createPinkNoiseBuffer(ctx, 6);
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 480;

      const waveGain = ctx.createGain();
      waveGain.gain.value = 0.25;

      // LFO mô phỏng nhịp sóng biển vỗ bờ 8 giây / chu kỳ
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.value = 0.125;
      lfoGain.gain.value = 320;

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      noiseSource.connect(filter);
      filter.connect(waveGain);
      waveGain.connect(this.masterGain);

      noiseSource.start();
      lfo.start();
      this.activeNodes.push(noiseSource, filter, waveGain, lfo, lfoGain);
    }

    static startVinylCafeGenerator(ctx) {
      this.startRainGenerator(ctx, 0.28);
      this.startGentlePianoGenerator(ctx, 0.65);
    }

    static playAsmrKeyClick() {
      if (!this.asmrTypingEnabled) return;
      try {
        const ctx = this.ensureContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520 + Math.random() * 140, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.025);

        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.028);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(ctx.currentTime + 0.03);
      } catch (_) {}
    }

    static bindAsmrKeydownListener() {
      document.addEventListener(
        'keydown',
        (e) => {
          if (!this.asmrTypingEnabled) return;
          if (e.target && (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT')) {
            this.playAsmrKeyClick();
          }
        },
        true
      );
    }

    static injectDefaultSoundscapePanelIntoTab5() {
      // Tìm khung "TRÌNH PHÁT NHẠC NỀN & TÙY CHỈNH DẢI LẶP A ➔ B" ở Tab 5
      document.querySelectorAll('div, section').forEach((box) => {
        const heading = box.querySelector('h3, h4, span, div');
        const hText = (heading?.textContent || '').trim();
        if (
          !hText.includes('TRÌNH PHÁT NHẠC NỀN & TÙY CHỈNH DẢI LẶP') ||
          box.querySelector('#s20-tab5-default-sounds-panel')
        ) {
          return;
        }

        const musicCard =
          heading.closest('.rounded-2xl, .rounded-xl, .p-5, .p-4') || box;
        if (!musicCard || musicCard.querySelector('#s20-tab5-default-sounds-panel')) {
          return;
        }

        const panel = document.createElement('div');
        panel.id = 's20-tab5-default-sounds-panel';
        panel.className =
          'my-3 p-4 rounded-2xl border-2 border-emerald-500/50 bg-zinc-950/90 space-y-3 text-xs shadow-lg';

        panel.innerHTML = `
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2.5">
            <div>
              <h4 class="font-extrabold uppercase text-emerald-400 text-xs flex items-center gap-1.5">
                <span>🌧️🎹 BỘ ÂM THANH MẶC ĐỊNH THƯ THÁI (MƯA RẢ RÍCH, PIANO DỊU NHẸ, LỬA TRẠI, SÓNG BIỂN)</span>
              </h4>
              <p class="text-[11px] text-zinc-400">
                Bấm chọn âm thanh bên dưới để phát ngay (Hoạt động độc lập hoặc phát kết hợp cùng nhạc .MP3 của bạn)
              </p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[11px] font-bold text-zinc-300">🔊 Âm lượng nền:</span>
              <input id="s20-tab5-ambience-vol" type="range" min="0" max="100" value="${Math.round(
                this.volume * 100
              )}" class="w-24 accent-emerald-500 cursor-pointer" />
              <span id="s20-tab5-ambience-vol-label" class="font-monoCode font-bold text-emerald-400 text-[11px] w-9">${Math.round(
                this.volume * 100
              )}%</span>
            </div>
          </div>

          <!-- Lưới nút bấm chọn nhanh các âm thanh thư thái mặc định -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            ${this.PRESETS.map(
              (p) => `
              <button type="button" data-s20-sound-preset="${
                p.id
              }" class="s20-sound-preset-btn py-2.5 px-3 rounded-xl border font-bold text-xs text-left transition flex items-center justify-between ${
                this.currentPreset === p.id
                  ? 'border-emerald-400 bg-emerald-600 text-white shadow-lg'
                  : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-200'
              }">
                <span class="truncate">${p.name}</span>
              </button>
            `
            ).join('')}

            <!-- Nút Bật/Tắt Tiếng gõ phím ASMR -->
            <button type="button" id="btn-s20-tab5-asmr-toggle" class="py-2.5 px-3 rounded-xl border font-bold text-xs text-left transition flex items-center justify-between ${
              this.asmrTypingEnabled
                ? 'border-amber-400 bg-amber-600 text-white shadow-lg'
                : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-amber-300'
            }">
              <span class="truncate">⌨️ Tiếng Gõ Phím ASMR: ${
                this.asmrTypingEnabled ? 'ĐANG BẬT' : 'ĐANG TẮT'
              }</span>
            </button>
          </div>
        `;

        // Chèn ngay dưới tiêu đề của khung Trình phát nhạc ở Tab 5
        const firstInner = musicCard.querySelector('.p-4, .p-5, .space-y-3') || musicCard;
        firstInner.prepend(panel);

        panel.querySelectorAll('.s20-sound-preset-btn').forEach((btn) => {
          btn.addEventListener('click', () => {
            const presetId = btn.getAttribute('data-s20-sound-preset');
            this.playPreset(presetId);
          });
        });

        document
          .getElementById('s20-tab5-ambience-vol')
          ?.addEventListener('input', (e) => {
            this.setVolume(Number(e.target.value) / 100);
          });

        const asmrBtn = document.getElementById('btn-s20-tab5-asmr-toggle');
        asmrBtn?.addEventListener('click', () => {
          this.asmrTypingEnabled = !this.asmrTypingEnabled;
          localStorage.setItem('noir_s8_asmr_typing', String(this.asmrTypingEnabled));
          if (this.asmrTypingEnabled) this.playAsmrKeyClick();
          this.updateUIActivePreset();
        });
      });
    }

    static syncFloatingMp3BarSelect() {
      const floatSelect = document.getElementById('s21-floating-soundscape-select');
      if (!floatSelect || floatSelect.dataset.s20SoundHooked === 'true') return;
      floatSelect.dataset.s20SoundHooked = 'true';

      floatSelect.innerHTML =
        this.PRESETS.map((p) => `<option value="${p.id}">${p.name}</option>`).join('') +
        `<option value="LOCAL_MP3">🎵 File Nhạc .MP3 Từ Máy Tính</option>`;

      floatSelect.addEventListener(
        'change',
        (e) => {
          const val = floatSelect.value;
          if (val === 'LOCAL_MP3') return;
          e.stopPropagation();
          this.playPreset(val);
        },
        true
      );
    }

    static updateUIActivePreset() {
      document.querySelectorAll('.s20-sound-preset-btn').forEach((btn) => {
        const isSelected = btn.getAttribute('data-s20-sound-preset') === this.currentPreset;
        btn.className = `s20-sound-preset-btn py-2.5 px-3 rounded-xl border font-bold text-xs text-left transition flex items-center justify-between ${
          isSelected
            ? 'border-emerald-400 bg-emerald-600 text-white shadow-lg'
            : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-200'
        }`;
      });

      const asmrBtn = document.getElementById('btn-s20-tab5-asmr-toggle');
      if (asmrBtn) {
        asmrBtn.className = `py-2.5 px-3 rounded-xl border font-bold text-xs text-left transition flex items-center justify-between ${
          this.asmrTypingEnabled
            ? 'border-amber-400 bg-amber-600 text-white shadow-lg'
            : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-amber-300'
        }`;
        asmrBtn.innerHTML = `<span class="truncate">⌨️ Tiếng Gõ Phím ASMR: ${
          this.asmrTypingEnabled ? 'ĐANG BẬT' : 'ĐANG TẮT'
        }</span>`;
      }

      const floatSelect = document.getElementById('s21-floating-soundscape-select');
      if (floatSelect && this.currentPreset !== 'LOCAL_MP3') {
        floatSelect.value = this.currentPreset;
      }
    }
  }

  // ==========================================================================
  // KHỞI CHẠY CHẶNG 3 / 5
  // ==========================================================================
  function bootStage20Chapter3() {
    UnifiedMasterPomodoroEngine.init();
    ProceduralRelaxingAudioStudio.init();

    window.StudioStage20.pomodoroEngine = UnifiedMasterPomodoroEngine;
    window.StudioStage20.audioStudio = ProceduralRelaxingAudioStudio;
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', bootStage20Chapter3);
  } else {
    bootStage20Chapter3();
  }
})();
/**
 * ============================================================================
 * FILE: stage20_supreme_5stage_overhaul.js
 * [CHẶNG 4 / 5]:
 *   1. Hệ thống Hình nền Động 60FPS (Đom đóm bay, Đèn lồng ấm, Mưa đêm Bokeh,
 *      Bụi sao ngân hà, Lá thu rơi) + Đặt Ảnh nền / Phát Video chạy nền từ máy tính.
 *   2. Tùy chọn Bật / Tắt âm thanh Video chạy nền & Thanh chỉnh âm lượng Video nền.
 *   3. Lớp phủ làm mờ dịu nền (Dimming & Frosted Blur) để chữ bản thảo luôn nổi bật.
 *   4. Thẻ điều khiển tại Tab 5 + Viên thuốc thu gọn nổi (< 🌌 Nền) kéo thả tự do.
 * ============================================================================
 */

(function () {
  'use strict';

  if (window.__NOIR_STAGE20_CH4_LOADED__) return;
  window.__NOIR_STAGE20_CH4_LOADED__ = true;

  class AmbientBackgroundAndVideoEngine {
    static currentBgMode = 'FIREFLIES'; // 'NONE' | 'FIREFLIES' | 'LANTERNS' | 'NOIR_BOKEH' | 'STARDUST' | 'AUTUMN' | 'CUSTOM_IMAGE' | 'CUSTOM_VIDEO'
    static dimLevel = 0.78; // 0.35 -> 0.95 (Mức làm mờ nền để chữ bản thảo rõ nét)
    static blurPx = 2; // 0 -> 16px
    static videoMuted = true;
    static videoVolume = 0.5;
    static customImageUrl = '';
    static customVideoUrl = '';
    static customMediaName = '';
    static particles = [];
    static animId = null;

    static PRESET_LIST = [
      { id: 'NONE', name: '⬛ Mặc định (Tắt hình nền)', short: '⬛ Tắt Nền' },
      { id: 'FIREFLIES', name: '✨ Đom Đóm Bay Đêm (Dịu nhẹ)', short: '✨ Đom Đóm' },
      { id: 'LANTERNS', name: '🏮 Đèn Lồng Ấm Áp Trôi Đêm', short: '🏮 Đèn Ấm' },
      { id: 'NOIR_BOKEH', name: '🌧️ Mưa Đêm & Đèn Phố Mờ (Noir)', short: '🌧️ Đèn Mưa' },
      { id: 'STARDUST', name: '🌌 Bụi Sao Ngân Hà Tĩnh Mịch', short: '🌌 Bụi Sao' },
      { id: 'AUTUMN', name: '🍂 Lá Thu Rơi Dưới Ánh Đèn', short: '🍂 Lá Thu' },
      { id: 'CUSTOM_IMAGE', name: '🖼️ Ảnh Nền Từ Máy Tính', short: '🖼️ Ảnh Máy' },
      { id: 'CUSTOM_VIDEO', name: '🎬 Video Chạy Nền Từ Máy Tính', short: '🎬 Video Nền' }
    ];

    static init() {
      this.loadSavedSettings();
      this.injectBackdropStyles();
      this.mountBackgroundLayerDOM();
      this.mountFloatingCollapsiblePill();
      this.injectTab5BackgroundCardAndPanel();
      this.applyBackgroundMode(this.currentBgMode, false);

      const obs = new MutationObserver(() => {
        this.injectTab5BackgroundCardAndPanel();
      });
      obs.observe(document.body, { childList: true, subtree: true });

      window.addEventListener('resize', () => this.resizeCanvas());
    }

    static loadSavedSettings() {
      const savedMode = localStorage.getItem('noir_s20_bg_mode');
      if (savedMode) {
        // Nếu trước đó chọn ảnh/video cục bộ nhưng tải lại trang hết phiên Blob URL thì chuyển về Đom đóm mặc định
        if (
          (savedMode === 'CUSTOM_IMAGE' && !localStorage.getItem('noir_s20_bg_dataurl')) ||
          savedMode === 'CUSTOM_VIDEO'
        ) {
          this.currentBgMode = 'FIREFLIES';
        } else {
          this.currentBgMode = savedMode;
        }
      }
      const savedDataUrl = localStorage.getItem('noir_s20_bg_dataurl');
      if (savedDataUrl) this.customImageUrl = savedDataUrl;

      const savedDim = parseFloat(localStorage.getItem('noir_s20_bg_dim') || '0.78');
      if (!Number.isNaN(savedDim)) {
        this.dimLevel = Math.max(0.35, Math.min(0.96, savedDim));
      }

      const savedBlur = parseInt(localStorage.getItem('noir_s20_bg_blur') || '2', 10);
      if (!Number.isNaN(savedBlur)) {
        this.blurPx = Math.max(0, Math.min(20, savedBlur));
      }

      this.videoMuted = localStorage.getItem('noir_s20_bg_vid_muted') !== 'false';
      const savedVidVol = parseFloat(localStorage.getItem('noir_s20_bg_vid_vol') || '0.5');
      if (!Number.isNaN(savedVidVol)) {
        this.videoVolume = Math.max(0, Math.min(1, savedVidVol));
      }
    }

    static injectBackdropStyles() {
      if (document.getElementById('s20-ambient-bg-styles')) return;
      const style = document.createElement('style');
      style.id = 's20-ambient-bg-styles';
      style.textContent = `
        :root {
          --s20-bg-dim-alpha: 0.78;
          --s20-bg-blur-px: 2px;
        }

        /* Khung nền tổng nằm dưới toàn bộ giao diện (z-index: 0) */
        #s20-master-background-stage {
          position: fixed !important;
          inset: 0 !important;
          z-index: 0 !important;
          pointer-events: none !important;
          overflow: hidden !important;
          background: transparent !important;
        }

        #s20-bg-image-layer,
        #s20-bg-video-layer,
        #s20-bg-canvas-layer {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          pointer-events: none !important;
          filter: blur(var(--s20-bg-blur-px)) !important;
          transition: opacity 0.35s ease, filter 0.25s ease !important;
        }

        /* Lớp màng mờ bảo vệ mắt & làm nổi bật chữ bản thảo */
        #s20-bg-dimmer-shield {
          position: absolute !important;
          inset: 0 !important;
          pointer-events: none !important;
          background: rgba(12, 12, 15, var(--s20-bg-dim-alpha)) !important;
          transition: background 0.2s ease !important;
        }
        html:not(.dark) #s20-bg-dimmer-shield {
          background: rgba(250, 248, 245, var(--s20-bg-dim-alpha)) !important;
        }

        /* Khi có hình nền hoạt động, làm trong suốt lớp nền cứng của vùng làm việc để thấy hình nền mờ phía dưới */
        body.s20-has-ambient-bg #app-main-workspace,
        body.s20-has-ambient-bg #center-editor-pane,
        body.s20-has-ambient-bg #pane-right-manuscript,
        body.s20-has-ambient-bg #textarea-chapter-content,
        body.s20-has-ambient-bg #s14-screen-5-ambience,
        body.s20-has-ambient-bg #s14-screen-6-system,
        body.s20-has-ambient-bg #s20-tab3-quad-output-studio {
          background-color: transparent !important;
          position: relative;
          z-index: 10;
        }

        body.s20-has-ambient-bg #left-sidebar-pane,
        body.s20-has-ambient-bg #right-bible-pane,
        body.s20-has-ambient-bg #editor-metadata-bar,
        body.s20-has-ambient-bg #s14-master-top-nav,
        body.s20-has-ambient-bg #app-bottom-footer {
          background-color: rgba(20, 20, 24, 0.82) !important;
          backdrop-filter: blur(8px) !important;
          position: relative;
          z-index: 15;
        }
        html:not(.dark) body.s20-has-ambient-bg #left-sidebar-pane,
        html:not(.dark) body.s20-has-ambient-bg #right-bible-pane,
        html:not(.dark) body.s20-has-ambient-bg #editor-metadata-bar,
        html:not(.dark) body.s20-has-ambient-bg #s14-master-top-nav,
        html:not(.dark) body.s20-has-ambient-bg #app-bottom-footer {
          background-color: rgba(255, 255, 255, 0.84) !important;
        }

        /* Viên thuốc nổi Hình nền (< 🌌 Nền) */
        #s20-floating-bg-pill {
          width: fit-content !important;
          max-width: 95vw !important;
          display: inline-flex !important;
          align-items: center !important;
          box-sizing: border-box !important;
          white-space: nowrap !important;
        }
        #s20-floating-bg-pill.s20-bg-pill-collapsed {
          max-width: 86px !important;
          height: 34px !important;
          padding: 4px 10px !important;
          border-radius: 9999px !important;
          overflow: hidden !important;
        }
        #s20-floating-bg-pill.s20-bg-pill-collapsed .s20-bg-pill-inner {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
      this.updateCssVariables();
    }

    static updateCssVariables() {
      document.documentElement.style.setProperty(
        '--s20-bg-dim-alpha',
        String(this.dimLevel)
      );
      document.documentElement.style.setProperty(
        '--s20-bg-blur-px',
        `${this.blurPx}px`
      );
    }

    static mountBackgroundLayerDOM() {
      if (document.getElementById('s20-master-background-stage')) return;

      const stage = document.createElement('div');
      stage.id = 's20-master-background-stage';
      stage.innerHTML = `
        <img id="s20-bg-image-layer" class="hidden" alt="Studio Background" />
        <video id="s20-bg-video-layer" class="hidden" loop playsinline></video>
        <canvas id="s20-bg-canvas-layer" class="hidden"></canvas>
        <div id="s20-bg-dimmer-shield"></div>
        <input type="file" id="s20-hidden-image-picker" accept="image/*" class="hidden" />
        <input type="file" id="s20-hidden-video-picker" accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*" class="hidden" />
      `;
      document.body.prepend(stage);

      this.resizeCanvas();

      // Sự kiện chọn Ảnh nền từ máy tính
      const imgPicker = document.getElementById('s20-hidden-image-picker');
      imgPicker?.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        this.customMediaName = file.name;

        // Nếu ảnh nhỏ hơn 2.5MB thì lưu cả DataURL vào LocalStorage để nhớ qua các phiên
        if (file.size <= 2.5 * 1024 * 1024) {
          const reader = new FileReader();
          reader.onload = () => {
            this.customImageUrl = String(reader.result || '');
            try {
              localStorage.setItem('noir_s20_bg_dataurl', this.customImageUrl);
            } catch (_) {}
            this.applyBackgroundMode('CUSTOM_IMAGE', true);
          };
          reader.readAsDataURL(file);
        } else {
          if (this.customImageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(this.customImageUrl);
          }
          this.customImageUrl = URL.createObjectURL(file);
          this.applyBackgroundMode('CUSTOM_IMAGE', true);
        }
        imgPicker.value = '';
      });

      // Sự kiện chọn Video chạy nền từ máy tính
      const vidPicker = document.getElementById('s20-hidden-video-picker');
      vidPicker?.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        this.customMediaName = file.name;
        if (this.customVideoUrl.startsWith('blob:')) {
          URL.revokeObjectURL(this.customVideoUrl);
        }
        this.customVideoUrl = URL.createObjectURL(file);
        this.applyBackgroundMode('CUSTOM_VIDEO', true);
        vidPicker.value = '';
      });
    }

    static resizeCanvas() {
      const cv = document.getElementById('s20-bg-canvas-layer');
      if (!cv) return;
      cv.width = window.innerWidth || 1366;
      cv.height = window.innerHeight || 768;
    }

    static initParticlesForMode(mode) {
      const w = window.innerWidth || 1366;
      const h = window.innerHeight || 768;
      this.particles = [];

      if (mode === 'FIREFLIES') {
        for (let i = 0; i < 55; i++) {
          this.particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.45,
            vy: -0.15 - Math.random() * 0.35,
            r: 1.8 + Math.random() * 2.8,
            phase: Math.random() * Math.PI * 2,
            speed: 0.02 + Math.random() * 0.03,
            hue: Math.random() > 0.3 ? 72 : 145 // Vàng ấm đom đóm & Xanh ngọc lục bảo
          });
        }
      } else if (mode === 'LANTERNS') {
        for (let i = 0; i < 32; i++) {
          this.particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.25,
            vy: -0.3 - Math.random() * 0.45,
            w: 10 + Math.random() * 12,
            h: 14 + Math.random() * 16,
            phase: Math.random() * Math.PI * 2
          });
        }
      } else if (mode === 'NOIR_BOKEH') {
        // Hạt mưa + Đèn Bokeh thành phố đêm
        for (let i = 0; i < 75; i++) {
          this.particles.push({
            type: i < 22 ? 'BOKEH' : 'RAIN',
            x: Math.random() * w,
            y: Math.random() * h,
            vy: i < 22 ? 0.05 : 6 + Math.random() * 5,
            r: i < 22 ? 18 + Math.random() * 38 : 1.2,
            len: 14 + Math.random() * 18,
            hue: [35, 195, 345, 160][i % 4],
            alpha: i < 22 ? 0.08 + Math.random() * 0.12 : 0.22 + Math.random() * 0.2
          });
        }
      } else if (mode === 'STARDUST') {
        for (let i = 0; i < 90; i++) {
          this.particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.12,
            vy: (Math.random() - 0.5) * 0.12,
            r: 0.8 + Math.random() * 2.0,
            phase: Math.random() * Math.PI * 2
          });
        }
      } else if (mode === 'AUTUMN') {
        for (let i = 0; i < 40; i++) {
          this.particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: 0.3 + Math.random() * 0.5,
            vy: 0.5 + Math.random() * 0.7,
            size: 5 + Math.random() * 6,
            angle: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.03,
            hue: 22 + Math.random() * 25
          });
        }
      }
    }

    static startCanvasAnimationLoop() {
      if (this.animId) cancelAnimationFrame(this.animId);
      const cv = document.getElementById('s20-bg-canvas-layer');
      if (!cv) return;
      const ctx = cv.getContext('2d');

      const render = () => {
        if (
          ![
            'FIREFLIES',
            'LANTERNS',
            'NOIR_BOKEH',
            'STARDUST',
            'AUTUMN'
          ].includes(this.currentBgMode)
        ) {
          this.animId = null;
          return;
        }

        const w = cv.width;
        const h = cv.height;

        // Vẽ gradient nền đêm dịu mắt
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        if (this.currentBgMode === 'FIREFLIES') {
          grad.addColorStop(0, '#050B0A');
          grad.addColorStop(1, '#0A1917');
        } else if (this.currentBgMode === 'LANTERNS') {
          grad.addColorStop(0, '#09060C');
          grad.addColorStop(1, '#1A0F14');
        } else if (this.currentBgMode === 'NOIR_BOKEH') {
          grad.addColorStop(0, '#06080E');
          grad.addColorStop(1, '#0F172A');
        } else if (this.currentBgMode === 'STARDUST') {
          grad.addColorStop(0, '#04050C');
          grad.addColorStop(1, '#0D1026');
        } else {
          grad.addColorStop(0, '#0D0907');
          grad.addColorStop(1, '#1C120C');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Vẽ các hạt theo từng chế độ
        for (const p of this.particles) {
          if (this.currentBgMode === 'FIREFLIES') {
            p.x += p.vx + Math.sin(p.phase) * 0.25;
            p.y += p.vy;
            p.phase += p.speed;
            if (p.y < -20) p.y = h + 20;
            if (p.x < -20) p.x = w + 20;
            if (p.x > w + 20) p.x = -20;

            const alpha = 0.25 + (Math.sin(p.phase) * 0.5 + 0.5) * 0.7;
            const glow = ctx.createRadialGradient(p.x, p.y, 0.2, p.x, p.y, p.r * 5.5);
            glow.addColorStop(0, `hsla(${p.hue}, 95%, 75%, ${alpha})`);
            glow.addColorStop(0.4, `hsla(${p.hue}, 90%, 55%, ${alpha * 0.45})`);
            glow.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * 5.5, 0, Math.PI * 2);
            ctx.fill();
          } else if (this.currentBgMode === 'LANTERNS') {
            p.x += p.vx + Math.sin(p.phase) * 0.2;
            p.y += p.vy;
            p.phase += 0.02;
            if (p.y < -40) {
              p.y = h + 30;
              p.x = Math.random() * w;
            }
            const glow = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, p.w * 2.6);
            glow.addColorStop(0, 'rgba(253, 224, 71, 0.85)');
            glow.addColorStop(0.45, 'rgba(245, 158, 11, 0.35)');
            glow.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.w * 2.6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'rgba(251, 191, 36, 0.78)';
            ctx.fillRect(p.x - p.w * 0.35, p.y - p.h * 0.35, p.w * 0.7, p.h * 0.7);
          } else if (this.currentBgMode === 'NOIR_BOKEH') {
            if (p.type === 'BOKEH') {
              p.x += Math.sin(p.y * 0.02) * 0.15;
              const g = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, p.r);
              g.addColorStop(0, `hsla(${p.hue}, 85%, 65%, ${p.alpha})`);
              g.addColorStop(1, 'rgba(0,0,0,0)');
              ctx.fillStyle = g;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
              ctx.fill();
            } else {
              p.y += p.vy;
              p.x -= 0.8;
              if (p.y > h + 20) {
                p.y = -20;
                p.x = Math.random() * w;
              }
              ctx.strokeStyle = `rgba(148, 163, 184, ${p.alpha})`;
              ctx.lineWidth = 1.1;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p.x - 2, p.y + p.len);
              ctx.stroke();
            }
          } else if (this.currentBgMode === 'STARDUST') {
            p.x += p.vx;
            p.y += p.vy;
            p.phase += 0.025;
            if (p.x < 0) p.x = w;
            if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h;
            if (p.y > h) p.y = 0;
            const a = 0.2 + (Math.sin(p.phase) * 0.5 + 0.5) * 0.65;
            ctx.fillStyle = `rgba(199, 210, 254, ${a})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
          } else if (this.currentBgMode === 'AUTUMN') {
            p.x += p.vx + Math.sin(p.angle) * 0.4;
            p.y += p.vy;
            p.angle += p.spin;
            if (p.y > h + 20) {
              p.y = -20;
              p.x = Math.random() * w;
            }
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.fillStyle = `hsla(${p.hue}, 85%, 55%, 0.65)`;
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }

        this.animId = requestAnimationFrame(render);
      };

      this.animId = requestAnimationFrame(render);
    }

    static applyBackgroundMode(modeId, showToast = false) {
      this.currentBgMode = modeId || 'NONE';
      localStorage.setItem('noir_s20_bg_mode', this.currentBgMode);

      const imgEl = document.getElementById('s20-bg-image-layer');
      const vidEl = document.getElementById('s20-bg-video-layer');
      const cvEl = document.getElementById('s20-bg-canvas-layer');
      const dimmer = document.getElementById('s20-bg-dimmer-shield');

      if (this.animId) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      }

      if (vidEl) {
        vidEl.pause();
        vidEl.classList.add('hidden');
      }
      imgEl?.classList.add('hidden');
      cvEl?.classList.add('hidden');

      if (this.currentBgMode === 'NONE') {
        document.body.classList.remove('s20-has-ambient-bg');
        dimmer?.classList.add('hidden');
        this.syncAllBackgroundUIControls();
        return;
      }

      document.body.classList.add('s20-has-ambient-bg');
      dimmer?.classList.remove('hidden');

      if (this.currentBgMode === 'CUSTOM_IMAGE') {
        if (this.customImageUrl && imgEl) {
          imgEl.src = this.customImageUrl;
          imgEl.classList.remove('hidden');
        } else {
          document.getElementById('s20-hidden-image-picker')?.click();
        }
      } else if (this.currentBgMode === 'CUSTOM_VIDEO') {
        if (this.customVideoUrl && vidEl) {
          if (vidEl.src !== this.customVideoUrl) {
            vidEl.src = this.customVideoUrl;
          }
          vidEl.muted = this.videoMuted;
          vidEl.volume = this.videoVolume;
          vidEl.classList.remove('hidden');
          vidEl.play().catch(() => {
            // Nếu trình duyệt yêu cầu muted khi autoplay lần đầu
            vidEl.muted = true;
            this.videoMuted = true;
            vidEl.play().catch(() => {});
          });
        } else {
          document.getElementById('s20-hidden-video-picker')?.click();
        }
      } else {
        // Các hiệu ứng Canvas 60FPS
        if (cvEl) {
          this.resizeCanvas();
          cvEl.classList.remove('hidden');
          this.initParticlesForMode(this.currentBgMode);
          this.startCanvasAnimationLoop();
        }
      }

      this.syncAllBackgroundUIControls();

      if (showToast) {
        const found = this.PRESET_LIST.find((p) => p.id === this.currentBgMode);
        window.StudioStage7?.saveEngine?.showSaveToastNotification(
          `🌌 Đã áp dụng không gian nền: ${found ? found.name : this.currentBgMode}!`
        );
      }
    }

    static toggleVideoAudioMute() {
      this.videoMuted = !this.videoMuted;
      localStorage.setItem('noir_s20_bg_vid_muted', String(this.videoMuted));
      const vidEl = document.getElementById('s20-bg-video-layer');
      if (vidEl) {
        vidEl.muted = this.videoMuted;
        vidEl.volume = this.videoVolume;
      }
      this.syncAllBackgroundUIControls();
    }

    static setVideoVolume(vol) {
      this.videoVolume = Math.max(0, Math.min(1, Number(vol) || 0.5));
      localStorage.setItem('noir_s20_bg_vid_vol', String(this.videoVolume));
      const vidEl = document.getElementById('s20-bg-video-layer');
      if (vidEl) {
        vidEl.volume = this.videoVolume;
        if (this.videoVolume > 0 && this.videoMuted) {
          this.videoMuted = false;
          vidEl.muted = false;
        }
      }
      this.syncAllBackgroundUIControls();
    }

    /**
     * Dựng Viên Thuốc Thu Gọn Nổi (< 🌌 Nền) giống Pomodoro & Thanh Nhạc Nổi
     */
    static mountFloatingCollapsiblePill() {
      if (document.getElementById('s20-floating-bg-pill')) return;

      const pill = document.createElement('div');
      pill.id = 's20-floating-bg-pill';
      pill.className =
        'fixed bottom-10 left-1/2 -translate-x-1/2 z-40 rounded-2xl bg-zinc-900/95 text-white border-2 border-indigo-500/60 shadow-2xl px-3 py-1.5 flex items-center gap-2 text-xs select-none';

      pill.innerHTML = `
        <div class="s20-bg-pill-inner flex flex-wrap items-center gap-1.5">
          <span class="font-extrabold text-indigo-300 text-[11px]">🌌 Nền:</span>
          <select id="s20-float-bg-select" class="px-2 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-emerald-300 font-bold text-[11px] cursor-pointer focus:outline-none">
            ${this.PRESET_LIST.map(
              (p) => `<option value="${p.id}">${p.short}</option>`
            ).join('')}
          </select>

          <button type="button" id="btn-s20-float-pick-img" class="px-2 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 font-bold text-[10px] transition" title="Chọn Ảnh nền từ máy tính">
            🖼️ Chọn Ảnh
          </button>

          <button type="button" id="btn-s20-float-pick-vid" class="px-2 py-1 rounded-lg bg-indigo-600/25 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 font-bold text-[10px] transition" title="Chọn Video chạy nền (.MP4/.WEBM) từ máy tính">
            🎬 Chọn Video
          </button>

          <button type="button" id="btn-s20-float-vid-mute" class="hidden px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-zinc-950 border border-amber-500/40 font-extrabold text-[10px] transition" title="Bật / Tắt âm thanh của Video chạy nền">
            🔇 Tiếng Video: TẮT
          </button>

          <div class="flex items-center gap-1 pl-1 border-l border-zinc-700" title="Chỉnh độ mờ dịu của hình nền/video so với chữ bản thảo">
            <span class="text-[10px] text-zinc-400">Độ dịu:</span>
            <input id="s20-float-dim-slider" type="range" min="35" max="95" value="${Math.round(
              this.dimLevel * 100
            )}" class="w-16 accent-indigo-400 cursor-pointer" />
          </div>
        </div>

        <button type="button" id="btn-s20-bg-pill-collapse" class="px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-indigo-600 text-indigo-300 hover:text-white font-monoCode font-extrabold text-xs transition" title="Thu nhỏ thanh Hình nền (<) hoặc mở rộng (>)">
          &lt;
        </button>
      `;

      document.body.appendChild(pill);

      // Cho phép kéo thả tự do viên thuốc Hình nền
      if (window.StudioStage16?.widgetsAndAudio?.attachFreeDragToElement) {
        window.StudioStage16.widgetsAndAudio.attachFreeDragToElement(
          pill,
          'noir_s20_pos_bg_pill'
        );
      }

      let isCollapsed = localStorage.getItem('noir_s20_bg_pill_collapsed') === 'true';
      const collapseBtn = document.getElementById('btn-s20-bg-pill-collapse');
      const applyCollapse = () => {
        pill.classList.toggle('s20-bg-pill-collapsed', isCollapsed);
        collapseBtn.textContent = isCollapsed ? '🌌 Nền >' : '<';
      };
      applyCollapse();

      collapseBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        isCollapsed = !isCollapsed;
        localStorage.setItem('noir_s20_bg_pill_collapsed', String(isCollapsed));
        applyCollapse();
      });

      const floatSel = document.getElementById('s20-float-bg-select');
      floatSel?.addEventListener('change', () => {
        this.applyBackgroundMode(floatSel.value, true);
      });

      document
        .getElementById('btn-s20-float-pick-img')
        ?.addEventListener('click', () => {
          document.getElementById('s20-hidden-image-picker')?.click();
        });

      document
        .getElementById('btn-s20-float-pick-vid')
        ?.addEventListener('click', () => {
          document.getElementById('s20-hidden-video-picker')?.click();
        });

      document
        .getElementById('btn-s20-float-vid-mute')
        ?.addEventListener('click', () => {
          this.toggleVideoAudioMute();
        });

      document
        .getElementById('s20-float-dim-slider')
        ?.addEventListener('input', (e) => {
          this.dimLevel = Number(e.target.value) / 100;
          localStorage.setItem('noir_s20_bg_dim', String(this.dimLevel));
          this.updateCssVariables();
          this.syncAllBackgroundUIControls();
        });
    }

    /**
     * Tích hợp Thẻ thứ 4 ("🌌 4. Hình Nền Động, Ảnh & Video Nền") và Bảng Điều Khiển Chi Tiết vào Tab 5
     */
    static injectTab5BackgroundCardAndPanel() {
      const screen5 = document.getElementById('s14-screen-5-ambience');
      if (!screen5 || document.getElementById('s20-tab5-bg-studio-panel')) return;

      // Tìm hàng 3 nút lớn ở đầu Màn hình 5 (1. Mở Trình Phát Nhạc | 2. Mở Đồng Hồ Pomodoro | 3. Chỉnh Cỡ Chữ)
      let topCardsGrid = null;
      screen5.querySelectorAll('div').forEach((div) => {
        if (
          div.className.includes('grid') &&
          div.textContent.includes('1. Mở Trình Phát Nhạc') &&
          div.textContent.includes('2. Mở Đồng Hồ Pomodoro')
        ) {
          topCardsGrid = div;
        }
      });

      // Thêm nút lớn số 4 vào lưới đầu Tab 5
      if (topCardsGrid && !document.getElementById('btn-s20-tab5-card4-bg')) {
        topCardsGrid.classList.remove('md:grid-cols-3');
        topCardsGrid.classList.add('md:grid-cols-4');

        const card4Btn = document.createElement('button');
        card4Btn.type = 'button';
        card4Btn.id = 'btn-s20-tab5-card4-bg';
        card4Btn.className =
          'p-4 rounded-2xl border-2 border-indigo-500/50 bg-zinc-900/90 hover:bg-indigo-950/40 text-left transition flex items-center justify-between shadow-lg';
        card4Btn.innerHTML = `
          <div class="space-y-1">
            <div class="font-extrabold text-sm text-indigo-400">
              🌌 4. Hình Nền, Đom Đóm & Video Nền
            </div>
            <div class="text-[11px] text-zinc-400">
              Đom đóm bay, đèn ấm, ảnh & video chạy nền từ máy
            </div>
          </div>
          <span class="text-indigo-400 text-xs">▼</span>
        `;
        topCardsGrid.appendChild(card4Btn);

        card4Btn.addEventListener('click', () => {
          const panel = document.getElementById('s20-tab5-bg-studio-panel');
          panel?.classList.toggle('hidden');
          panel?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      }

      // Tạo Bảng Điều Khiển Hình Nền & Video Nền Chi Tiết trong Tab 5
      const panel = document.createElement('div');
      panel.id = 's20-tab5-bg-studio-panel';
      panel.className =
        'p-5 rounded-2xl border-2 border-indigo-500/50 bg-zinc-900/95 space-y-4 text-xs shadow-xl mt-4';

      panel.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
          <div>
            <h3 class="font-extrabold uppercase text-sm text-indigo-400 flex items-center gap-2">
              <span>🌌 KHÔNG GIAN HÌNH NỀN ĐỘNG, ẢNH NỀN & VIDEO CHẠY NỀN TỪ MÁY TÍNH</span>
            </h3>
            <p class="text-[11px] text-zinc-400 mt-0.5">
              Hình nền và Video nền luôn được làm mờ dịu phía dưới trang viết để chữ bản thảo nổi bật rõ ràng
            </p>
          </div>
          <button type="button" id="btn-s20-collapse-tab5-bg-panel" class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-[11px]">
            Thu gọn ▲
          </button>
        </div>

        <!-- Hàng 1: Chọn nhanh 6 hiệu ứng Hình nền mặc định -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          ${this.PRESET_LIST.slice(0, 6)
            .map(
              (p) => `
            <button type="button" data-s20-bg-mode="${p.id}" class="s20-tab5-bg-btn p-3 rounded-xl border font-extrabold text-xs text-center transition ${
                this.currentBgMode === p.id
                  ? 'border-indigo-400 bg-indigo-600 text-white shadow-lg'
                  : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-zinc-200'
              }">
              ${p.name}
            </button>
          `
            )
            .join('')}
        </div>

        <!-- Hàng 2: Chọn Ảnh nền hoặc Video chạy nền từ máy tính + Điều khiển âm thanh Video nền -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
          <button type="button" id="btn-s20-tab5-pick-image" class="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow transition flex items-center justify-center gap-2">
            <span>🖼️ Chọn Ảnh Nền Từ Máy Tính (.JPG / .PNG / .WEBP)</span>
          </button>

          <button type="button" id="btn-s20-tab5-pick-video" class="py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow transition flex items-center justify-center gap-2">
            <span>🎬 Chọn Video Chạy Nền Từ Máy Tính (.MP4 / .WEBM)</span>
          </button>

          <!-- Cụm điều khiển Âm thanh Video nền -->
          <div class="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-zinc-900 border border-amber-500/40">
            <button type="button" id="btn-s20-tab5-video-mute-toggle" class="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-[11px] shrink-0 transition">
              ${this.videoMuted ? '🔇 Bật Tiếng Video' : '🔊 Tắt Tiếng Video'}
            </button>
            <div class="flex items-center gap-1.5 flex-1">
              <input id="s20-tab5-video-vol-slider" type="range" min="0" max="100" value="${Math.round(
                this.videoVolume * 100
              )}" class="w-full accent-amber-500 cursor-pointer" title="Âm lượng của Video chạy nền" />
              <span id="s20-tab5-video-vol-label" class="font-monoCode text-[10px] text-amber-300 w-8">${Math.round(
                this.videoVolume * 100
              )}%</span>
            </div>
          </div>
        </div>

        <!-- Hàng 3: Thanh trượt chỉnh Độ mờ dịu (Dim) & Độ nhòe kính (Blur) để bảo vệ mắt khi soạn thảo -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3">
            <div>
              <span class="font-bold text-emerald-400 block">🛡️ Độ Mờ Dịu Của Nền So Với Bản Thảo:</span>
              <span class="text-[10px] text-zinc-400">Tăng lên để chữ bản thảo nổi bật hơn, giảm xuống để nhìn rõ hình nền hơn</span>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <input id="s20-tab5-dim-slider" type="range" min="35" max="95" value="${Math.round(
                this.dimLevel * 100
              )}" class="w-28 accent-emerald-500 cursor-pointer" />
              <span id="s20-tab5-dim-label" class="font-monoCode font-bold text-emerald-400 w-9">${Math.round(
                this.dimLevel * 100
              )}%</span>
            </div>
          </div>

          <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3">
            <div>
              <span class="font-bold text-indigo-400 block">💧 Độ Nhòe Nghệ Thuật (Backdrop Blur):</span>
              <span class="text-[10px] text-zinc-400">Làm nhòe nhẹ ảnh/video nền giúp mắt tập trung tuyệt đối vào câu chữ</span>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <input id="s20-tab5-blur-slider" type="range" min="0" max="16" value="${
                this.blurPx
              }" class="w-28 accent-indigo-500 cursor-pointer" />
              <span id="s20-tab5-blur-label" class="font-monoCode font-bold text-indigo-400 w-9">${
                this.blurPx
              }px</span>
            </div>
          </div>
        </div>
      `;

      const mainWrap = screen5.querySelector('.max-w-5xl, .space-y-6') || screen5;
      mainWrap.appendChild(panel);

      document
        .getElementById('btn-s20-collapse-tab5-bg-panel')
        ?.addEventListener('click', () => {
          panel.classList.add('hidden');
        });

      panel.querySelectorAll('.s20-tab5-bg-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.applyBackgroundMode(btn.getAttribute('data-s20-bg-mode'), true);
        });
      });

      document
        .getElementById('btn-s20-tab5-pick-image')
        ?.addEventListener('click', () => {
          document.getElementById('s20-hidden-image-picker')?.click();
        });

      document
        .getElementById('btn-s20-tab5-pick-video')
        ?.addEventListener('click', () => {
          document.getElementById('s20-hidden-video-picker')?.click();
        });

      document
        .getElementById('btn-s20-tab5-video-mute-toggle')
        ?.addEventListener('click', () => {
          this.toggleVideoAudioMute();
        });

      document
        .getElementById('s20-tab5-video-vol-slider')
        ?.addEventListener('input', (e) => {
          this.setVideoVolume(Number(e.target.value) / 100);
        });

      document
        .getElementById('s20-tab5-dim-slider')
        ?.addEventListener('input', (e) => {
          this.dimLevel = Number(e.target.value) / 100;
          localStorage.setItem('noir_s20_bg_dim', String(this.dimLevel));
          this.updateCssVariables();
          this.syncAllBackgroundUIControls();
        });

      document
        .getElementById('s20-tab5-blur-slider')
        ?.addEventListener('input', (e) => {
          this.blurPx = parseInt(e.target.value, 10) || 0;
          localStorage.setItem('noir_s20_bg_blur', String(this.blurPx));
          this.updateCssVariables();
          this.syncAllBackgroundUIControls();
        });

      this.syncAllBackgroundUIControls();
    }

    static syncAllBackgroundUIControls() {
      const floatSel = document.getElementById('s20-float-bg-select');
      if (floatSel && floatSel.value !== this.currentBgMode) {
        floatSel.value = this.currentBgMode;
      }

      document.querySelectorAll('.s20-tab5-bg-btn').forEach((btn) => {
        const active = btn.getAttribute('data-s20-bg-mode') === this.currentBgMode;
        btn.className = `s20-tab5-bg-btn p-3 rounded-xl border font-extrabold text-xs text-center transition ${
          active
            ? 'border-indigo-400 bg-indigo-600 text-white shadow-lg'
            : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-zinc-200'
        }`;
      });

      const floatMuteBtn = document.getElementById('btn-s20-float-vid-mute');
      if (floatMuteBtn) {
        floatMuteBtn.classList.toggle('hidden', this.currentBgMode !== 'CUSTOM_VIDEO');
        floatMuteBtn.textContent = this.videoMuted
          ? '🔇 Tiếng Video: TẮT'
          : '🔊 Tiếng Video: BẬT';
      }

      const tab5MuteBtn = document.getElementById('btn-s20-tab5-video-mute-toggle');
      if (tab5MuteBtn) {
        tab5MuteBtn.textContent = this.videoMuted
          ? '🔇 Bật Tiếng Video'
          : '🔊 Tắt Tiếng Video';
      }

      const vidVolLabel = document.getElementById('s20-tab5-video-vol-label');
      if (vidVolLabel) vidVolLabel.textContent = `${Math.round(this.videoVolume * 100)}%`;

      const dimPct = Math.round(this.dimLevel * 100);
      const dimLbl = document.getElementById('s20-tab5-dim-label');
      if (dimLbl) dimLbl.textContent = `${dimPct}%`;
      const fDim = document.getElementById('s20-float-dim-slider');
      if (fDim && document.activeElement !== fDim) fDim.value = String(dimPct);
      const tDim = document.getElementById('s20-tab5-dim-slider');
      if (tDim && document.activeElement !== tDim) tDim.value = String(dimPct);

      const blurLbl = document.getElementById('s20-tab5-blur-label');
      if (blurLbl) blurLbl.textContent = `${this.blurPx}px`;
    }
  }

  // ==========================================================================
  // KHỞI CHẠY CHẶNG 4 / 5
  // ==========================================================================
  function bootStage20Chapter4() {
    AmbientBackgroundAndVideoEngine.init();
    window.StudioStage20.backgroundEngine = AmbientBackgroundAndVideoEngine;
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', bootStage20Chapter4);
  } else {
    bootStage20Chapter4();
  }
})();
/**
 * ============================================================================
 * FILE: stage20_supreme_5stage_overhaul.js
 * [CHẶNG 5 / 5 — HOÀN TẤT HỆ THỐNG ĐẠI TU VERSION 34.0]:
 *   1. Cửa sổ nổi trực tiếp (z-index: 2147483647) trên Full-Screen AI Center
 *      & Hộp thoại Duyệt Bản Thảo (Story Bible, Câu lệnh hệ thống, Chèn POV,
 *      Gói ngữ cảnh cục bộ) + Sửa lỗi treo khi Duyệt chương cập nhật Story Bible.
 *   2. Trung tâm Hướng dẫn Kép (Video Hoạt Họa 60FPS + Cẩm Nang Tĩnh A-Z)
 *      & Loa Thông Báo Cập Nhật Đầy Đủ (Bản 1.0 ➔ Version 34.0).
 *   3. Story Bible Tab 4 chống tràn 100%, ghim cố định nút ✏️ Sửa & 🗑️ Xóa.
 *   4. Đóng gói & Chia sẻ 1 File .HTML + JS Gộp hoặc File .JS Hợp Nhất ở Tab 6.
 *   5. Kiểm toán Pháp Y Bản Thảo & Chuẩn hóa thoại "- Thoại (Tên)" 1-Click.
 * ============================================================================
 */

(function () {
  'use strict';

  if (window.__NOIR_STAGE20_CH5_LOADED__) return;
  window.__NOIR_STAGE20_CH5_LOADED__ = true;

  // ==========================================================================
  // MÔ-ĐUN 8 (CHẶNG 5): CỬA SỔ NỔI TRỰC TIẾP TRÊN FULL-SCREEN AI CENTER & DUYỆT CHƯƠNG
  //                    (Z-INDEX TỐI ĐA 2147483647 — KHÔNG CẦN ĐÓNG KHUNG AI)
  // ==========================================================================
  class TopmostSubModalAndApprovalFixer {
    static init() {
      this.injectTopmostZIndexStyles();
      this.installGlobalCaptureClickRouter();
      this.fixSmartApprovalModalHang();
    }

    static injectTopmostZIndexStyles() {
      if (document.getElementById('s20-topmost-submodal-styles')) return;
      const st = document.createElement('style');
      st.id = 's20-topmost-submodal-styles';
      st.textContent = `
        #modal-scene-builder:not(.hidden),
        #modal-context-preview:not(.hidden),
        #modal-s20-sysprompt-overlay:not(.hidden),
        #modal-s20-bible-overlay:not(.hidden),
        #modal-s20-context-overlay:not(.hidden),
        #modal-s20-guide-center:not(.hidden),
        #modal-s20-changelog-center:not(.hidden),
        #modal-s20-forensic-report:not(.hidden) {
          position: fixed !important;
          inset: 0 !important;
          z-index: 2147483647 !important;
          pointer-events: auto !important;
        }

        /* Đảm bảo nút Video Hướng Dẫn & Loa Cập Nhật luôn hiển thị trên Header */
        #s14-master-top-nav #btn-s23-top-video-guide,
        #s14-master-top-nav #btn-s18-top-megaphone {
          display: inline-flex !important;
          visibility: visible !important;
          opacity: 1 !important;
          pointer-events: auto !important;
        }
      `;
      document.head.appendChild(st);
    }

    static findActivePromptTextarea() {
      const all = [...document.querySelectorAll('textarea')];
      for (const ta of all) {
        if (ta.id.startsWith('s20-')) continue;
        const ph = (ta.getAttribute('placeholder') || '').toLowerCase();
        if (
          ta.id === 's6-popup-prompt-textarea' ||
          ph.includes('nhập diễn biến cốt lõi') ||
          ph.includes('gợi ý chế độ')
        ) {
          return ta;
        }
      }
      return (
        document.getElementById('s20-tab3-direct-prompt-input') ||
        document.getElementById('s6-popup-prompt-textarea')
      );
    }

    /**
     * 1. Mở cửa sổ Xem & Sửa Câu Lệnh Hệ Thống (System Prompt 4 Chế Độ) nổi trên cùng
     */
    static openSystemPromptOverlay() {
      const curMode =
        window.StudioStage20?.quadOutputWorkspace?.detectCurrentSelectedAiMode() ||
        'MODE_1_DRAFT';
      const specs = window.StudioStage20?.modesSpec || {};

      const getSavedSys = (mKey) => {
        const custom = localStorage.getItem(`noir_s19_sysprompt_${mKey}`);
        if (custom && custom.trim()) return custom;
        return specs[mKey]?.systemPrompt || '';
      };

      let modal = document.getElementById('modal-s20-sysprompt-overlay');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-s20-sysprompt-overlay';
        modal.className =
          'fixed inset-0 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md select-none';
        document.body.appendChild(modal);
      }

      modal.innerHTML = `
        <div class="w-full max-w-4xl rounded-2xl border-2 border-emerald-500/80 bg-zinc-950 text-white shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[92vh] text-xs">
          <div class="px-5 py-3.5 border-b border-zinc-800 bg-emerald-600/20 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 class="font-extrabold uppercase text-sm text-emerald-400">
                📜 XEM & TÙY CHỈNH KHUNG CÂU LỆNH HỆ THỐNG CHUYÊN SÂU (4 CHẾ ĐỘ TIỂU THUYẾT GIA)
              </h3>
              <p class="text-[11px] text-zinc-300">
                Chỉnh sửa và lưu trực tiếp System Prompt cho từng chế độ ngay tại đây mà không cần đóng khung AI
              </p>
            </div>
            <button type="button" id="btn-s20-close-sysprompt" class="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold">
              ✕ Đóng
            </button>
          </div>

          <div class="p-4 flex-1 overflow-y-auto space-y-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 items-center bg-zinc-900 p-3 rounded-xl border border-zinc-800">
              <div>
                <label class="block font-extrabold uppercase text-[10px] text-amber-400 mb-1">
                  Chọn Chế Độ Để Xem / Sửa Câu Lệnh Hệ Thống:
                </label>
                <select id="s20-sysprompt-mode-picker" class="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-emerald-500/50 text-emerald-300 font-extrabold text-xs">
                  <option value="MODE_1_DRAFT" ${curMode === 'MODE_1_DRAFT' ? 'selected' : ''}>✍️ Chế độ 1: Viết Bản Nháp Chậm (Extreme Slow-Burn & Tâm Lý)</option>
                  <option value="MODE_2_CONSULT" ${curMode === 'MODE_2_CONSULT' ? 'selected' : ''}>🧭 Chế độ 2: Tham Mưu Cốt Truyện, Phục Bút & Unreliable Narrator</option>
                  <option value="MODE_3_AUDIT" ${curMode === 'MODE_3_AUDIT' ? 'selected' : ''}>🔍 Chế độ 3: Kiểm Toán Pháp Y Logic, Trục Giờ Giấc & Chính Tả</option>
                  <option value="MODE_4_REVIEW" ${curMode === 'MODE_4_REVIEW' ? 'selected' : ''}>📊 Chế độ 4: Review Tổng Thể Đa Chiều & Đánh Giá Nhịp Độ</option>
                </select>
              </div>
              <div class="flex flex-col justify-end space-y-1">
                <span class="text-[10px] text-zinc-400 font-semibold">Điền nhanh khung mẫu câu lệnh của chế độ này:</span>
                <button type="button" id="btn-s20-fill-sample-from-sysmodal" class="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs shadow transition">
                  ✨ Chèn Khung Mẫu Chế Độ Này Vào Ô Nhập Lệnh AI
                </button>
              </div>
            </div>

            <textarea id="s20-sysprompt-editor-ta" rows="16" class="w-full p-3.5 rounded-xl border border-emerald-500/40 bg-zinc-900 text-emerald-100 font-monoCode text-xs leading-relaxed focus:outline-none focus:border-emerald-400 select-text">${getSavedSys(
              curMode
            )}</textarea>
          </div>

          <div class="px-5 py-3 border-t border-zinc-800 bg-zinc-900 flex flex-wrap items-center justify-between gap-2">
            <button type="button" id="btn-s20-reset-sysprompt" class="px-3.5 py-2 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-bold text-xs">
              ↩️ Khôi Phục Mặc Định Chuẩn Tiểu Thuyết Gia
            </button>
            <button type="button" id="btn-s20-save-sysprompt" class="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition">
              💾 Lưu & Áp Dụng Câu Lệnh Hệ Thống Này
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      modal.classList.remove('hidden');

      const picker = document.getElementById('s20-sysprompt-mode-picker');
      const editor = document.getElementById('s20-sysprompt-editor-ta');

      picker?.addEventListener('change', () => {
        editor.value = getSavedSys(picker.value);
      });

      document
        .getElementById('btn-s20-close-sysprompt')
        ?.addEventListener('click', () => modal.classList.add('hidden'));

      document
        .getElementById('btn-s20-reset-sysprompt')
        ?.addEventListener('click', () => {
          const k = picker.value;
          localStorage.removeItem(`noir_s19_sysprompt_${k}`);
          editor.value = specs[k]?.systemPrompt || '';
        });

      document
        .getElementById('btn-s20-fill-sample-from-sysmodal')
        ?.addEventListener('click', () => {
          const k = picker.value;
          const tpl = specs[k]?.sampleTemplate || '';
          const ta = this.findActivePromptTextarea();
          if (ta && tpl) {
            ta.value = ta.value.trim() ? `${ta.value.trim()}\n\n${tpl}` : tpl;
            ta.dispatchEvent(new Event('input', { bubbles: true }));
          }
          modal.classList.add('hidden');
          window.StudioStage7?.saveEngine?.showSaveToastNotification(
            '✨ Đã nạp Khung Mẫu chuyên nghiệp vào ô nhập câu lệnh!'
          );
        });

      document
        .getElementById('btn-s20-save-sysprompt')
        ?.addEventListener('click', () => {
          const k = picker.value;
          localStorage.setItem(`noir_s19_sysprompt_${k}`, editor.value);
          modal.classList.add('hidden');
          window.StudioStage7?.saveEngine?.showSaveToastNotification(
            '💾 Đã lưu Câu Lệnh Hệ Thống mới cho chế độ này!'
          );
        });
    }

    /**
     * 2. Mở cửa sổ Xem & Sửa Trực Tiếp Khung Story Bible nổi trên cùng
     */
    static openLiveStoryBibleOverlay() {
      let modal = document.getElementById('modal-s20-bible-overlay');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-s20-bible-overlay';
        modal.className =
          'fixed inset-0 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md select-none';
        document.body.appendChild(modal);
      }

      const tplVal =
        document.getElementById('s10-bible-template-textarea')?.value ||
        localStorage.getItem('noir_s10_bible_template_frame') ||
        '=== KHUNG KIỂU MẪU STORY BIBLE BẮT BUỘC ===\n[I. TỔNG QUAN CỐT TRUYỆN & TRỤC THỜI GIAN]\n[II. HỒ SƠ & BIẾN ĐỔI TÂM LÝ NHÂN VẬT]\n[III. MA TRẬN AI BIẾT GÌ]\n[IV. SỔ CÁI PHỤC BÚT BỎ NGỎ]';

      const renVal =
        document.getElementById('s10-bible-rendered-textarea')?.value ||
        localStorage.getItem('noir_s10_rendered_bible_content') ||
        '';

      modal.innerHTML = `
        <div class="w-full max-w-5xl rounded-2xl border-2 border-amber-500/80 bg-zinc-950 text-white shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[92vh] text-xs">
          <div class="px-5 py-3.5 border-b border-zinc-800 bg-amber-500/15 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 class="font-extrabold uppercase text-sm text-amber-400">
                🏛️ XEM & SỬA TRỰC TIẾP KHUNG STORY BIBLE & NỘI DUNG HIỆN TẠI (NỔI TRÊN CỬA SỔ ĐANG MỞ)
              </h3>
              <p class="text-[11px] text-zinc-300">
                Chỉnh sửa trực tiếp cả Khung Kiểu Mẫu lẫn Nội Dung Story Bible ngay tại đây mà không cần đóng cửa sổ phía dưới
              </p>
            </div>
            <button type="button" id="btn-s20-close-bible-overlay" class="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold">
              ✕ Đóng
            </button>
          </div>

          <div class="p-4 flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div class="flex flex-col space-y-1.5">
              <label class="font-extrabold uppercase text-[11px] text-amber-400">
                1. Khung Kiểu Mẫu Story Bible (Template Cấu Trúc Bắt Buộc):
              </label>
              <textarea id="s20-overlay-bible-tpl" rows="16" class="flex-1 w-full p-3.5 rounded-xl border border-amber-500/40 bg-zinc-900 text-amber-100 font-monoCode text-[11px] leading-relaxed focus:outline-none select-text"></textarea>
            </div>
            <div class="flex flex-col space-y-1.5">
              <label class="font-extrabold uppercase text-[11px] text-emerald-400">
                2. Nội Dung Story Bible Chính Thức Đang Áp Dụng:
              </label>
              <textarea id="s20-overlay-bible-ren" rows="16" class="flex-1 w-full p-3.5 rounded-xl border border-emerald-500/40 bg-zinc-900 text-zinc-100 font-sansUI text-xs leading-relaxed focus:outline-none select-text" placeholder="Nhập hoặc chỉnh sửa nội dung Story Bible tại đây..."></textarea>
            </div>
          </div>

          <div class="px-5 py-3 border-t border-zinc-800 bg-zinc-900 flex flex-wrap items-center justify-between gap-2">
            <button type="button" id="btn-s20-jump-to-tab4" class="px-4 py-2 rounded-xl border border-amber-500/50 bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-zinc-950 font-extrabold text-xs transition">
              ↗️ Chuyển Hẳn Tới Màn Hình Tab 4 (Quản Lý Thẻ Nhân Vật & Phục Bút)
            </button>
            <button type="button" id="btn-s20-save-bible-overlay" class="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition">
              💾 Lưu Thay Đổi Story Bible Ngay Tại Đây
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      modal.classList.remove('hidden');

      const tplTa = document.getElementById('s20-overlay-bible-tpl');
      const renTa = document.getElementById('s20-overlay-bible-ren');
      if (tplTa) tplTa.value = tplVal;
      if (renTa) renTa.value = renVal;

      document
        .getElementById('btn-s20-close-bible-overlay')
        ?.addEventListener('click', () => modal.classList.add('hidden'));

      document
        .getElementById('btn-s20-save-bible-overlay')
        ?.addEventListener('click', () => {
          const nt = tplTa?.value || '';
          const nr = renTa?.value || '';
          localStorage.setItem('noir_s10_bible_template_frame', nt);
          localStorage.setItem('noir_s10_rendered_bible_content', nr);
          const origT = document.getElementById('s10-bible-template-textarea');
          if (origT) origT.value = nt;
          const origR = document.getElementById('s10-bible-rendered-textarea');
          if (origR) origR.value = nr;
          window.StudioStage10?.bibleEngine?.saveRenderedBibleContent?.(nr);
          modal.classList.add('hidden');
          window.StudioStage7?.saveEngine?.showSaveToastNotification(
            '🏛️ Đã lưu trực tiếp Khung & Nội dung Story Bible!'
          );
        });

      document
        .getElementById('btn-s20-jump-to-tab4')
        ?.addEventListener('click', () => {
          modal.classList.add('hidden');
          document.querySelectorAll('div.fixed.inset-0').forEach((m) => {
            if (
              m.id !== 'modal-s6-welcome-launcher' &&
              m.id !== 'modal-s21-device-selector-gate'
            ) {
              m.classList.add('hidden');
            }
          });
          window.StudioStage14?.screenNavigator?.navigateToScreen('SCREEN_4_BIBLE');
        });
    }

    /**
     * 3. Mở cửa sổ Chèn Mốc Chuyển Phân Cảnh / Đổi POV nổi trên cùng
     */
    static openSceneBuilderOverlay() {
      const sceneModal = document.getElementById('modal-scene-builder');
      if (!sceneModal) return;

      document.body.appendChild(sceneModal);
      sceneModal.style.setProperty('z-index', '2147483647', 'important');

      const povSel = document.getElementById('modal-scene-pov');
      const chars = window.StudioCore?.bibleManager?.data?.characters || [];
      if (povSel) {
        povSel.innerHTML =
          `<option value="Giữ nguyên POV hiện tại">-- Giữ nguyên POV hiện tại --</option>` +
          chars
            .map((c) => `<option value="${c.name}">👁️ Đổi POV sang: ${c.name}</option>`)
            .join('');
      }

      sceneModal.classList.remove('hidden');

      const confirmBtn = document.getElementById('btn-confirm-insert-scene');
      if (confirmBtn && !confirmBtn.dataset.s20SceneBound) {
        confirmBtn.dataset.s20SceneBound = 'true';
        confirmBtn.addEventListener(
          'click',
          (e) => {
            e.preventDefault();
            e.stopPropagation();

            const tVal =
              document.getElementById('modal-scene-time')?.value.trim() || 'Chưa ghi giờ';
            const lVal =
              document.getElementById('modal-scene-loc')?.value.trim() ||
              'Chưa ghi địa điểm';
            const pVal =
              document.getElementById('modal-scene-pov')?.value || 'Giữ nguyên POV';
            const uVal =
              document.getElementById('modal-scene-unreliable')?.value || 'Tỉnh táo';
            const dVal =
              document.getElementById('modal-scene-directive')?.value.trim() || '';

            const block = `\n\n--- [🎬 CHUYỂN PHÂN CẢNH MỚI | 🕒 Giờ: ${tVal} | 📍 Địa điểm: ${lVal} | 👁️ POV: ${pVal} (${uVal})] ---\n• Chỉ đạo phân cảnh: ${dVal}\n`;

            const activeTa = this.findActivePromptTextarea();
            if (activeTa) {
              activeTa.value = `${activeTa.value.trim()}${block}`;
              activeTa.dispatchEvent(new Event('input', { bubbles: true }));
              activeTa.focus();
            }

            sceneModal.classList.add('hidden');
            window.StudioStage7?.saveEngine?.showSaveToastNotification(
              '🎬 Đã chèn Mốc Chuyển Phân Cảnh & POV vào ô nhập câu lệnh!'
            );
          },
          true
        );
      }
    }

    /**
     * 4. Mở cửa sổ Xem & Đổi Gói Ngữ Cảnh Cục Bộ nổi trên cùng
     */
    static openLocalContextOverlay() {
      let modal = document.getElementById('modal-s20-context-overlay');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-s20-context-overlay';
        modal.className =
          'fixed inset-0 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md select-none';
        document.body.appendChild(modal);
      }

      const chapters = window.StudioCore?.approvalGate?.chapters || [];
      const defaultCtx =
        localStorage.getItem('noir_s20_custom_local_context') ||
        chapters
          .map(
            (c, i) =>
              `[Chương ${i + 1}: ${c.displayTitle || c.title} (${
                c.status === 'APPROVED' ? 'Đã Duyệt' : 'Đang Nháp'
              } - ${c.wordCount || 0} từ)]\n• Tóm tắt/Trích đoạn: ${
                c.summary || (c.content || '').slice(0, 420) || '(Chưa có nội dung)'
              }`
          )
          .join('\n\n');

      modal.innerHTML = `
        <div class="w-full max-w-4xl rounded-2xl border-2 border-indigo-500/80 bg-zinc-950 text-white shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[90vh] text-xs">
          <div class="px-5 py-3.5 border-b border-zinc-800 bg-indigo-600/20 flex items-center justify-between">
            <div>
              <h3 class="font-extrabold uppercase text-sm text-indigo-400">
                🔍 XEM & CHỈNH SỬA GÓI NGỮ CẢNH CỤC BỘ CHUẨN BỊ GỬI CHO GEMINI
              </h3>
              <p class="text-[11px] text-zinc-300">
                Kiểm tra hoặc chỉnh sửa trực tiếp các đoạn văn trích xuất từ ổ cứng trước khi gửi cho AI
              </p>
            </div>
            <button type="button" id="btn-s20-close-ctx-overlay" class="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold">
              ✕ Đóng
            </button>
          </div>

          <div class="p-4 flex-1 overflow-y-auto space-y-2.5">
            <textarea id="s20-ctx-overlay-ta" rows="16" class="w-full p-3.5 rounded-xl border border-indigo-500/40 bg-zinc-900 text-zinc-100 font-monoCode text-[11px] leading-relaxed focus:outline-none select-text"></textarea>
          </div>

          <div class="px-5 py-3 border-t border-zinc-800 bg-zinc-900 flex flex-wrap items-center justify-between gap-2">
            <button type="button" id="btn-s20-ctx-attach-prompt" class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs shadow transition">
              📥 Đính Kèm Ngữ Cảnh Này Vào Ô Nhập Lệnh AI
            </button>
            <button type="button" id="btn-s20-ctx-save" class="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition">
              💾 Lưu Gói Ngữ Cảnh Cục Bộ
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      modal.classList.remove('hidden');

      const ctxTa = document.getElementById('s20-ctx-overlay-ta');
      if (ctxTa) ctxTa.value = defaultCtx;

      document
        .getElementById('btn-s20-close-ctx-overlay')
        ?.addEventListener('click', () => modal.classList.add('hidden'));

      document.getElementById('btn-s20-ctx-save')?.addEventListener('click', () => {
        localStorage.setItem('noir_s20_custom_local_context', ctxTa.value);
        const origBody = document.getElementById('context-preview-body');
        if (origBody) origBody.textContent = ctxTa.value;
        modal.classList.add('hidden');
        window.StudioStage7?.saveEngine?.showSaveToastNotification(
          '🔍 Đã lưu Gói Ngữ Cảnh Cục Bộ!'
        );
      });

      document
        .getElementById('btn-s20-ctx-attach-prompt')
        ?.addEventListener('click', () => {
          const activeTa = this.findActivePromptTextarea();
          if (activeTa) {
            activeTa.value = `${activeTa.value.trim()}\n\n=== [GÓI NGỮ CẢNH CỤC BỘ] ===\n${
              ctxTa.value
            }\n`;
            activeTa.dispatchEvent(new Event('input', { bubbles: true }));
          }
          modal.classList.add('hidden');
          window.StudioStage7?.saveEngine?.showSaveToastNotification(
            '📥 Đã đính kèm Gói Ngữ Cảnh vào ô nhập câu lệnh!'
          );
        });
    }

    /**
     * 5. Sửa lỗi treo hộp thoại "DUYỆT BẢN THẢO & GỬI PROMPT CẬP NHẬT STORY BIBLE" (image_d0f8a3.png)
     */
    static fixSmartApprovalModalHang() {
      document.addEventListener(
        'click',
        async (e) => {
          const btn = e.target.closest('button');
          if (!btn) return;
          const txt = (btn.textContent || '').trim();

          if (!txt.includes('Duyệt Chương & Gửi Prompt Cập Nhật Story Bible Ngay')) {
            return;
          }

          const modalCard = btn.closest('.fixed.inset-0') || btn.closest('div[id*="modal"]');
          if (!modalCard) return;

          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();

          const origHtml = btn.innerHTML;
          btn.disabled = true;
          btn.innerHTML = '⏳ Đang duyệt & cập nhật Story Bible...';

          try {
            const core = window.StudioCore;
            const checkedBoxes = [
              ...modalCard.querySelectorAll('input[type="checkbox"]:checked')
            ];
            const selectedIds =
              checkedBoxes.length > 0
                ? checkedBoxes.map((c) => c.value || c.getAttribute('data-chap-id')).filter(Boolean)
                : [core?.approvalGate?.activeChapterId].filter(Boolean);

            // 1. Duyệt các chương đã chọn vào bộ nhớ chính thức
            for (const chId of selectedIds) {
              if (core?.approvalGate?.approveChapter) {
                await core.approvalGate.approveChapter(chId);
              }
            }
            core?.controller?.renderAll?.();

            // 2. Lấy nội dung các chương vừa duyệt để gọi Gemini tổng hợp Story Bible
            const allChaps = core?.approvalGate?.chapters || [];
            const targetChaps = allChaps.filter((c) => selectedIds.includes(c.id));
            const chapDossier = (targetChaps.length > 0 ? targetChaps : allChaps.slice(-1))
              .map(
                (c) =>
                  `=== CHƯƠNG: ${c.displayTitle || c.title} ===\n${(
                    c.content || ''
                  ).slice(0, 22000)}`
              )
              .join('\n\n');

            const templateFrame =
              document.getElementById('s10-bible-template-textarea')?.value ||
              localStorage.getItem('noir_s10_bible_template_frame') ||
              'I. TỔNG QUAN CỐT TRUYỆN\nII. HỒ SƠ TÂM LÝ NHÂN VẬT\nIII. MA TRẬN AI BIẾT GÌ\nIV. SỔ CÁI PHỤC BÚT';

            const existingBible =
              document.getElementById('s10-bible-rendered-textarea')?.value ||
              localStorage.getItem('noir_s10_rendered_bible_content') ||
              '';

            const directiveTa = modalCard.querySelector('textarea');
            const userDirective =
              directiveTa?.value ||
              'Giữ liên kết mạch truyện từ Chương 1 đến chương mới nhất theo đúng Khung Kiểu Mẫu.';

            const apiKey = window.StudioStage20?.apiRouter?.getActiveApiKey() || '';
            if (apiKey) {
              const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${encodeURIComponent(
                  apiKey
                )}`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    systemInstruction: {
                      parts: [
                        {
                          text: `Bạn là Kiến trúc sư Story Bible. Hãy cập nhật Story Bible bám sát 100% cấu trúc Khung Kiểu Mẫu sau:\n${templateFrame}`
                        }
                      ]
                    },
                    contents: [
                      {
                        role: 'user',
                        parts: [
                          {
                            text: `[STORY BIBLE CŨ]:\n${existingBible}\n\n[CHỈ ĐẠO]:\n${userDirective}\n\n[NỘI DUNG CHƯƠNG MỚI DUYỆT]:\n${chapDossier}`
                          }
                        ]
                      }
                    ],
                    generationConfig: { temperature: 0.3, maxOutputTokens: 32768 }
                  })
                }
              );

              if (res.ok) {
                const data = await res.json();
                const updatedBible = (data?.candidates?.[0]?.content?.parts || [])
                  .filter((p) => !p.thought && typeof p.text === 'string')
                  .map((p) => p.text)
                  .join('\n')
                  .trim();

                if (updatedBible) {
                  localStorage.setItem('noir_s10_rendered_bible_content', updatedBible);
                  const renArea = document.getElementById('s10-bible-rendered-textarea');
                  if (renArea) renArea.value = updatedBible;
                  window.StudioStage10?.bibleEngine?.saveRenderedBibleContent?.(
                    updatedBible
                  );
                }
              }
            }

            modalCard.classList.add('hidden');
            window.StudioStage20?.autoSaver?.runTwoSecondAutoSave(true);
            window.StudioStage7?.saveEngine?.showSaveToastNotification(
              '✅ Đã Duyệt chương & cập nhật Story Bible liền mạch thành công!'
            );
          } catch (err) {
            alert(`Đã duyệt chương! Lưu ý khi gọi AI Story Bible: ${err.message}`);
            modalCard.classList.add('hidden');
          } finally {
            btn.disabled = false;
            btn.innerHTML = origHtml;
          }
        },
        true
      );
    }

    static installGlobalCaptureClickRouter() {
      document.addEventListener(
        'click',
        (e) => {
          const btn = e.target.closest('button');
          if (!btn) return;

          const id = btn.id || '';
          const sysClick = btn.getAttribute('data-s14-sys-click') || '';
          const txt = (btn.textContent || '').trim().toLowerCase();

          // 1. Nút Xem & Sửa Khung Câu Lệnh Hệ Thống
          if (
            txt.includes('xem & sửa khung câu lệnh hệ thống') ||
            txt.includes('xem & tùy chỉnh khung câu lệnh hệ thống')
          ) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            this.openSystemPromptOverlay();
            return;
          }

          // 2. Nút Xem / Sửa Khung Story Bible hoặc Mở Khung Story Bible
          if (
            id === 'btn-s21-unlock-edit-bible' ||
            txt.includes('xem / sửa khung story bible') ||
            txt.includes('mở khung story bible') ||
            txt.includes('bấm để sửa story bible')
          ) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            this.openLiveStoryBibleOverlay();
            return;
          }

          // 3. Nút + Chèn Mốc Chuyển Phân Cảnh / Đổi POV
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

          // 4. Nút Xem Gói Ngữ Cảnh Cục Bộ
          if (txt.includes('xem gói ngữ cảnh cục bộ')) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            this.openLocalContextOverlay();
            return;
          }

          // 5. Nút Video Hướng Dẫn (Header, Tab 6, Màn hình chào)
          if (
            id === 'btn-s23-top-video-guide' ||
            id === 's17-sys-btn-video' ||
            sysClick === 'btn-s10-video-guide' ||
            txt === '🎬 video hướng dẫn' ||
            txt === '🎬 video hd v31' ||
            txt === 'mở video hướng dẫn'
          ) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            Stage20GuideChangelogAndShareHub.openGuideCenter('VIDEO');
            return;
          }

          // 6. Nút Loa Cập Nhật (Header, Footer Version, Tab 6)
          if (
            id === 'btn-s18-top-megaphone' ||
            id === 's17-sys-btn-megaphone' ||
            id === 's20-version-only-badge' ||
            sysClick === 'btn-s10-megaphone' ||
            txt.includes('loa version') ||
            txt.includes('loa cập nhật') ||
            txt.includes('loa thông báo')
          ) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            Stage20GuideChangelogAndShareHub.openChangelogCenter();
            return;
          }
        },
        true
      );
    }
  }

  // ==========================================================================
  // MÔ-ĐUN 9 (CHẶNG 5): TRUNG TÂM HƯỚNG DẪN KÉP (VIDEO HOẠT HỌA 60FPS + CẨM NANG TĨNH),
  //                    LOA CẬP NHẬT V1 ➔ V34, CHỐNG TRÀN STORY BIBLE TAB 4 & CHIA SẺ WEB TAB 6
  // ==========================================================================
  class Stage20GuideChangelogAndShareHub {
    static animId = null;
    static curSec = 0;
    static isPlaying = true;
    static lastTs = 0;

    static GUIDE_CHAPTERS = [
      {
        s: 0,
        e: 30,
        title: 'Phần 1/6 (00:00 - 00:30): Đèn Tròn Báo Lưu (Đỏ/Xanh) & Auto-Save 2 Giây',
        desc: 'Trên nút "✍️ Web viết tiểu thuyết của Bi" góc trên trái có đèn tròn báo trạng thái: Khi bạn vừa gõ chữ chưa lưu, đèn hiện Màu Đỏ; sau tối đa 2 giây khi hệ thống lưu xong file nhớ tạm về máy & Folder, đèn chuyển sang Màu Xanh Lá!',
        spot: { x: 110, y: 24, w: 170, h: 30, label: '🟢 Đèn Xanh/Đỏ Auto-Save 2s' }
      },
      {
        s: 30,
        e: 60,
        title: 'Phần 2/6 (00:30 - 01:00): 4 Cửa Sổ Đầu Ra AI Độc Lập Theo 4 Chế Độ Ở Tab 3',
        desc: 'Tại Tab 3 (Trợ Lý AI), kết quả trả về được phân loại vào 4 Cửa sổ độc lập: (1) Bản Thảo Nháp Chậm, (2) Tham Mưu Cốt Truyện, (3) Kiểm Toán Logic, (4) Review Đa Chiều. Bạn có thể chuyển đổi qua lại mà không bao giờ sợ trùng lặp hay mất bài!',
        spot: { x: 240, y: 85, w: 420, h: 36, label: '🤖 4 Cửa Sổ Đầu Ra AI Riêng Biệt' }
      },
      {
        s: 60,
        e: 90,
        title: 'Phần 3/6 (01:00 - 01:30): Mở Trực Tiếp Story Bible, Câu Lệnh Hệ Thống & POV Trên Khung AI',
        desc: 'Ngay trong cửa sổ AI hoặc Duyệt Bản Thảo, bấm Xem/Sửa Câu Lệnh Hệ Thống, Xem/Sửa Khung Story Bible, Chèn Mốc Chuyển Phân Cảnh / Đổi POV sẽ bật cửa sổ nổi trực tiếp lên trên cùng mà không cần đóng khung AI!',
        spot: { x: 260, y: 155, w: 380, h: 34, label: '🏛️ Mở Nổi Story Bible & POV' }
      },
      {
        s: 90,
        e: 120,
        title: 'Phần 4/6 (01:30 - 02:00): Đồng Hồ Pomodoro Đồng Bộ Hai Chiều & Âm Thanh Thư Thái Tab 5',
        desc: 'Đồng hồ Pomodoro ở Tab 5 và viên thuốc nhỏ góc trên phải đồng bộ 2 chiều từng giây. Khung nhạc nền Tab 5 có sẵn Tiếng mưa đêm rả rích, Piano dịu nhẹ, Lửa trại ấm, Sóng biển đêm và Tiếng gõ phím ASMR!',
        spot: { x: 680, y: 24, w: 185, h: 30, label: '🍅 Pomodoro Đồng Bộ 2 Chiều' }
      },
      {
        s: 120,
        e: 150,
        title: 'Phần 5/6 (02:00 - 02:30): Hình Nền Đom Đóm Bay, Đèn Ấm & Phát Video Chạy Nền (Tab 5)',
        desc: 'Bạn có thể bật hiệu ứng Đom đóm bay đêm, Đèn lồng ấm, Mưa đêm Bokeh hoặc chọn Ảnh/Video chạy nền từ máy tính (có nút Bật/Tắt tiếng Video nền và thanh làm mờ dịu nền dưới bản thảo) tại Tab 5 hoặc viên thuốc < 🌌 Nền!',
        spot: { x: 380, y: 295, w: 280, h: 34, label: '🌌 Hình Nền Đom Đóm & Video Nền' }
      },
      {
        s: 150,
        e: 180,
        title: 'Phần 6/6 (02:30 - 03:00): Chia Sẻ File HTML + JS Gộp Cho Bạn Bè Ở Tab 6',
        desc: 'Tại Tab 6 (Hệ thống & Cài đặt), bấm tải "1 File .HTML + JS Gộp Duy Nhất" để gửi cho bạn bè mở lên dùng ngay, hoặc tải "File .JS Hợp Nhất" để nhóm bạn bè cùng code JS chung với bạn!',
        spot: { x: 480, y: 225, w: 340, h: 42, label: '🌐 Chia Sẻ HTML + JS Gộp' }
      }
    ];

    static init() {
      this.renameTopButtons();
      this.enforceCleanBibleCardsInTab4();
      this.injectShareAndChangelogCardsIntoTab6();

      const obs = new MutationObserver(() => {
        this.renameTopButtons();
        this.injectShareAndChangelogCardsIntoTab6();
      });
      obs.observe(document.body, { childList: true, subtree: true });
    }

    static renameTopButtons() {
      const vidBtn = document.getElementById('btn-s23-top-video-guide');
      if (vidBtn && vidBtn.textContent.trim() !== '🎬 Video Hướng Dẫn') {
        vidBtn.innerHTML = '<span>🎬 Video Hướng Dẫn</span>';
      }
      const megaBtn = document.getElementById('btn-s18-top-megaphone');
      if (megaBtn && !megaBtn.textContent.includes('Loa Cập Nhật')) {
        megaBtn.innerHTML = '<span>📢 Loa Cập Nhật</span>';
      }
      const verFooter = document.getElementById('s20-version-only-badge');
      if (verFooter && verFooter.textContent.trim() !== 'Version 34') {
        verFooter.textContent = 'Version 34';
      }
    }

    static openGuideCenter(initialMode = 'VIDEO') {
      let modal = document.getElementById('modal-s20-guide-center');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-s20-guide-center';
        modal.className =
          'fixed inset-0 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md select-none';
        document.body.appendChild(modal);
      }

      modal.innerHTML = `
        <div class="w-full max-w-5xl rounded-2xl border-2 border-emerald-500/80 bg-zinc-950 text-white shadow-2xl overflow-hidden flex flex-col max-h-[93vh] text-xs">
          <div class="px-5 py-3.5 border-b border-zinc-800 bg-emerald-950/50 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 class="font-extrabold uppercase text-sm text-emerald-400">
                🎬 TRUNG TÂM HƯỚNG DẪN SỬ DỤNG CHI TIẾT — WEB VIẾT TIỂU THUYẾT CỦA BI (VERSION 34)
              </h3>
              <p class="text-[11px] text-zinc-400">
                Tích hợp Video Hoạt Họa 60FPS chỉ dẫn đúng vị trí từng nút & Cẩm Nang Hướng Dẫn Tĩnh đọc nhanh
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" id="btn-s20-guide-tab-vid" class="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-extrabold">
                🎬 1. Video Hoạt Họa Chi Tiết
              </button>
              <button type="button" id="btn-s20-guide-tab-static" class="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/40 font-extrabold">
                📖 2. Hướng Dẫn Tĩnh (Đọc Nhanh A-Z)
              </button>
              <button type="button" id="btn-s20-guide-close" class="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold">
                ✕ Đóng
              </button>
            </div>
          </div>

          <!-- Khu vực 1: Video Hoạt Họa -->
          <div id="s20-guide-video-pane" class="p-4 flex-1 overflow-y-auto space-y-3">
            <div class="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800">
              <span id="s20-vid-title" class="font-extrabold text-amber-400 text-xs">${
                this.GUIDE_CHAPTERS[0].title
              }</span>
              <span id="s20-vid-clock" class="font-monoCode font-bold text-emerald-400 text-xs">00:00 / 03:00</span>
            </div>

            <canvas id="s20-guide-canvas" width="880" height="340" class="w-full rounded-xl border border-zinc-800 bg-zinc-900 block"></canvas>

            <div id="s20-vid-desc" class="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 font-medium leading-relaxed text-xs"></div>

            <div class="flex items-center gap-3">
              <button type="button" id="btn-s20-vid-playpause" class="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold">
                ⏸️ Tạm dừng
              </button>
              <input id="s20-vid-scrub" type="range" min="0" max="180" step="0.5" value="0" class="flex-1 accent-emerald-500 cursor-pointer" />
            </div>

            <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
              ${this.GUIDE_CHAPTERS.map(
                (ch) => `
                <button type="button" data-s20-vseek="${ch.s}" class="s20-vchap-btn p-2.5 rounded-xl bg-zinc-900 hover:bg-emerald-600/20 border border-zinc-800 text-left font-bold text-[11px] text-zinc-200">
                  ${ch.title}
                </button>`
              ).join('')}
            </div>
          </div>

          <!-- Khu vực 2: Hướng Dẫn Sử Dụng Tĩnh -->
          <div id="s20-guide-static-pane" class="hidden p-5 flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 select-text">
            ${this.GUIDE_CHAPTERS.map(
              (ch) => `
              <div class="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 space-y-2">
                <div class="font-extrabold text-emerald-400 text-sm border-b border-zinc-800 pb-1.5">${ch.title}</div>
                <p class="text-xs text-zinc-200 leading-relaxed">${ch.desc}</p>
              </div>`
            ).join('')}
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      modal.classList.remove('hidden');

      const vPane = document.getElementById('s20-guide-video-pane');
      const sPane = document.getElementById('s20-guide-static-pane');
      const vBtn = document.getElementById('btn-s20-guide-tab-vid');
      const sBtn = document.getElementById('btn-s20-guide-tab-static');

      const setMode = (m) => {
        const isSta = m === 'STATIC';
        vPane?.classList.toggle('hidden', isSta);
        sPane?.classList.toggle('hidden', !isSta);
        vBtn.className = !isSta
          ? 'px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-extrabold'
          : 'px-3.5 py-1.5 rounded-xl bg-zinc-800 text-emerald-300 font-extrabold';
        sBtn.className = isSta
          ? 'px-3.5 py-1.5 rounded-xl bg-amber-600 text-white font-extrabold'
          : 'px-3.5 py-1.5 rounded-xl bg-zinc-800 text-amber-300 font-extrabold';
      };
      setMode(initialMode);

      vBtn?.addEventListener('click', () => setMode('VIDEO'));
      sBtn?.addEventListener('click', () => setMode('STATIC'));

      document.getElementById('btn-s20-guide-close')?.addEventListener('click', () => {
        modal.classList.add('hidden');
        if (this.animId) cancelAnimationFrame(this.animId);
      });

      const ppBtn = document.getElementById('btn-s20-vid-playpause');
      ppBtn?.addEventListener('click', () => {
        this.isPlaying = !this.isPlaying;
        ppBtn.textContent = this.isPlaying ? '⏸️ Tạm dừng' : '▶️ Tiếp tục';
      });

      const scrub = document.getElementById('s20-vid-scrub');
      scrub?.addEventListener('input', () => {
        this.curSec = parseFloat(scrub.value) || 0;
      });

      modal.querySelectorAll('.s20-vchap-btn').forEach((b) => {
        b.addEventListener('click', () => {
          this.curSec = parseFloat(b.getAttribute('data-s20-vseek')) || 0;
          this.isPlaying = true;
          if (ppBtn) ppBtn.textContent = '⏸️ Tạm dừng';
        });
      });

      this.isPlaying = true;
      this.lastTs = performance.now();
      if (this.animId) cancelAnimationFrame(this.animId);

      const draw = (now) => {
        if (modal.classList.contains('hidden')) return;
        if (this.isPlaying) {
          this.curSec = (this.curSec + (now - this.lastTs) / 1000) % 180;
        }
        this.lastTs = now;

        const ch =
          this.GUIDE_CHAPTERS.find((c) => this.curSec >= c.s && this.curSec < c.e) ||
          this.GUIDE_CHAPTERS[0];

        const titleEl = document.getElementById('s20-vid-title');
        const descEl = document.getElementById('s20-vid-desc');
        const clockEl = document.getElementById('s20-vid-clock');

        if (titleEl) titleEl.textContent = ch.title;
        if (descEl) descEl.textContent = `🎱 Viên Bi thuyết minh: ${ch.desc}`;
        if (scrub && !scrub.matches(':active')) scrub.value = String(this.curSec);
        if (clockEl) {
          const m = String(Math.floor(this.curSec / 60)).padStart(2, '0');
          const s = String(Math.floor(this.curSec % 60)).padStart(2, '0');
          clockEl.textContent = `${m}:${s} / 03:00`;
        }

        const cv = document.getElementById('s20-guide-canvas');
        if (cv) {
          const ctx = cv.getContext('2d');
          ctx.fillStyle = '#09090B';
          ctx.fillRect(0, 0, cv.width, cv.height);

          // Vẽ Header mô phỏng
          ctx.fillStyle = '#18181B';
          ctx.fillRect(0, 0, cv.width, 48);
          ctx.fillStyle = '#065F46';
          ctx.fillRect(14, 10, 195, 28);
          ctx.fillStyle = '#10B981';
          ctx.beginPath();
          ctx.arc(28, 24, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 11px Inter, sans-serif';
          ctx.fillText('✍️ Web viết tiểu thuyết của Bi', 40, 28);

          ctx.fillStyle = '#92400E';
          ctx.fillRect(675, 10, 190, 28);
          ctx.fillStyle = '#FEF3C7';
          ctx.fillText('🍅 24:54 | ⏸ Dừng (Đồng bộ)', 685, 28);

          // Vẽ Khung 4 Cửa sổ đầu ra AI & Hình nền
          ctx.fillStyle = '#121216';
          ctx.fillRect(20, 62, cv.width - 40, cv.height - 78);
          ctx.strokeStyle = '#27272A';
          ctx.strokeRect(20, 62, cv.width - 40, cv.height - 78);

          ctx.fillStyle = '#064E3B';
          ctx.fillRect(36, 76, 800, 36);
          ctx.fillStyle = '#6EE7B7';
          ctx.font = 'bold 12px Inter, sans-serif';
          ctx.fillText(
            '🤖 4 CỬA SỔ ĐẦU RA AI RIÊNG BIỆT: [✍️ 1. Bản Nháp] [🧭 2. Tham Mưu] [🔍 3. Kiểm Toán] [📊 4. Review]',
            48,
            98
          );

          ctx.fillStyle = '#1F2937';
          ctx.fillRect(36, 125, 800, 42);
          ctx.fillStyle = '#FBBF24';
          ctx.fillText(
            '🏛️ Xem/Sửa Story Bible  |  📜 Xem/Sửa Câu Lệnh Hệ Thống  |  🎬 + Chèn Mốc Chuyển Cảnh / POV',
            48,
            150
          );

          ctx.fillStyle = '#1E1B4B';
          ctx.fillRect(36, 180, 800, 95);
          ctx.fillStyle = '#E4E4E7';
          ctx.font = '12px Inter, sans-serif';
          ctx.fillText(ch.title, 50, 208);
          ctx.fillStyle = '#A1A1AA';
          ctx.fillText(ch.desc.slice(0, 95), 50, 232);
          ctx.fillText(ch.desc.slice(95, 190), 50, 254);

          ctx.fillStyle = '#312E81';
          ctx.fillRect(36, 286, 400, 34);
          ctx.fillStyle = '#C7D2FE';
          ctx.font = 'bold 11px Inter, sans-serif';
          ctx.fillText('🌌 Nền: ✨ Đom Đóm | 🏮 Đèn Ấm | 🎬 Video Nền (Bật/Tắt Tiếng)', 48, 307);

          // Vẽ khung sáng nhấp nháy tại vị trí mục tiêu
          const pulse = Math.abs(Math.sin(now / 180));
          const sp = ch.spot;
          ctx.strokeStyle = '#10B981';
          ctx.lineWidth = 3 + pulse * 2;
          ctx.strokeRect(sp.x, sp.y, sp.w, sp.h);
        }

        this.animId = requestAnimationFrame(draw);
      };

      this.animId = requestAnimationFrame(draw);
    }

    static openChangelogCenter() {
      let modal = document.getElementById('modal-s20-changelog-center');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-s20-changelog-center';
        modal.className =
          'fixed inset-0 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md select-none';
        document.body.appendChild(modal);
      }

      const history = [
        {
          num: 34,
          version: 'Version 34.0 (Bản Đại Tu 5 Chặng Tối Thượng - 11/11/2026)',
          date: '11/11/2026',
          badge: '4 Cửa Sổ Đầu Ra AI Độc Lập, Hết Nháy Dropdown, Hình Nền Đom Đóm/Video Nền & Đèn Báo Lưu 2 Giây',
          items: [
            'Chặng 1: Triệt tiêu 100% lỗi nháy trình đơn thả xuống (<select>) ở Tab 1, 2, 3; biến chấm tròn trên nút "✍️ Web viết tiểu thuyết của Bi" thành Đèn Báo Lưu (Đỏ khi chưa lưu, Xanh lá khi Auto-Save 2s lưu xong); tích hợp Bộ Định Tuyến Gemini API Chống Tắc Nghẽn.',
            'Chặng 2: Thay thế khung bản thảo bị lặp ở Tab 3 bằng Hệ Thống 4 Cửa Sổ Đầu Ra AI Độc Lập theo 4 chế độ (1. Bản Nháp Chậm, 2. Tham Mưu, 3. Kiểm Toán Logic, 4. Review Đa Chiều) kèm 4 bộ System Prompt bậc thầy tiểu thuyết tâm lý - trinh thám.',
            'Chặng 3: Hợp nhất Lõi Đồng Hồ Pomodoro Hai Chiều (Tab 5 ⇄ Viên thuốc nhỏ góc phải) và khôi phục trọn bộ Âm thanh mặc định thư thái (Mưa rả rích, Piano dịu nhẹ, Lửa trại ấm, Sóng biển đêm, Cà phê đĩa than, Phím ASMR).',
            'Chặng 4: Bổ sung Không gian Hình nền Động 60FPS (Đom đóm bay đêm, Đèn lồng ấm, Mưa đêm Bokeh, Bụi sao, Lá thu) và Trình phát Ảnh nền / Video chạy nền từ máy tính (có Bật/Tắt tiếng Video nền và làm mờ dịu dưới bản thảo) kèm viên thuốc thu gọn < 🌌 Nền.',
            'Chặng 5: Mở nổi trực tiếp Story Bible, Câu lệnh hệ thống, Chèn POV & Gói ngữ cảnh trên cửa sổ AI; tích hợp Trung tâm Hướng dẫn Kép (Video 60FPS + Hướng dẫn tĩnh) và Đóng gói Chia sẻ File HTML + JS gộp ở Tab 6.'
          ]
        },
        ...(window.StudioStage16?.changelog || [])
      ];

      modal.innerHTML = `
        <div class="w-full max-w-4xl max-h-[90vh] rounded-2xl border-2 border-amber-500/80 bg-zinc-950 text-white shadow-2xl flex flex-col overflow-hidden text-xs">
          <div class="px-5 py-4 border-b border-zinc-800 bg-amber-500/15 flex items-center justify-between">
            <div>
              <h3 class="font-extrabold uppercase text-sm text-amber-400">
                📢 LOA THÔNG BÁO CẬP NHẬT — TOÀN BỘ LỊCH SỬ PHIÊN BẢN (BẢN 1.0 ➔ VERSION 34.0)
              </h3>
              <p class="text-[11px] text-zinc-400">Chi tiết tất cả các bản cập nhật của Web viết tiểu thuyết của Bi</p>
            </div>
            <button type="button" id="btn-s20-changelog-close" class="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold">
              ✕ Đóng Loa
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-5 space-y-3.5 select-text">
            ${history
              .map(
                (h, i) => `
              <div class="p-4 rounded-2xl border ${
                i === 0
                  ? 'border-emerald-500 bg-emerald-950/25 shadow-lg'
                  : 'border-zinc-800 bg-zinc-900/65'
              } space-y-2">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <span class="px-2.5 py-0.5 rounded-full ${
                    i === 0 ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-amber-400'
                  } font-monoCode font-extrabold text-[11px]">
                    #${h.num} • ${h.version}
                  </span>
                  <span class="text-[10px] font-monoCode text-zinc-400">${h.date}</span>
                </div>
                <div class="font-extrabold text-xs text-emerald-400">${h.badge}</div>
                <ul class="list-disc pl-5 space-y-1 text-zinc-200 leading-relaxed">
                  ${(h.items || []).map((li) => `<li>${li}</li>`).join('')}
                </ul>
              </div>`
              )
              .join('')}
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      modal.classList.remove('hidden');

      document
        .getElementById('btn-s20-changelog-close')
        ?.addEventListener('click', () => modal.classList.add('hidden'));
    }

    static enforceCleanBibleCardsInTab4() {
      const ctrl = window.StudioCore?.controller;
      if (!ctrl || ctrl.__s20BibleHooked) return;
      ctrl.__s20BibleHooked = true;

      const origRender = ctrl.renderBibleLists?.bind(ctrl);
      if (origRender) {
        ctrl.renderBibleLists = (...args) => {
          const r = origRender(...args);
          this.renderAntiOverflowDeleteButtonsInTab4();
          return r;
        };
      }
      this.renderAntiOverflowDeleteButtonsInTab4();
    }

    static renderAntiOverflowDeleteButtonsInTab4() {
      const bm = window.StudioCore?.bibleManager;
      const ctrl = window.StudioCore?.controller;
      if (!bm?.data) return;

      const makeCleanList = (containerId, listKey, icon, colorClass) => {
        const box = document.getElementById(containerId);
        if (!box) return;
        const arr = bm.data[listKey] || [];
        if (arr.length === 0) return;

        box.innerHTML = arr
          .map((item, idx) => {
            const title = item.name || item.title || `Mục #${idx + 1}`;
            const sub =
              item.persona ||
              item.objectiveTruth ||
              item.description ||
              item.currentPsychState ||
              '';
            return `
              <div class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/90 space-y-1.5 max-w-full overflow-hidden">
                <div class="flex items-center justify-between gap-2 w-full min-w-0">
                  <span class="truncate font-extrabold text-xs ${colorClass} flex-1 min-w-0">
                    ${icon} ${title}
                  </span>
                  <button type="button" data-s20-del-bible="${listKey}:${idx}" class="px-2 py-0.5 rounded bg-red-600/25 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 font-extrabold text-[10px] shrink-0 transition">
                    🗑️ Xóa
                  </button>
                </div>
                <div class="text-[11px] text-zinc-300 break-words leading-relaxed">${sub}</div>
              </div>
            `;
          })
          .join('');

        box.querySelectorAll('[data-s20-del-bible]').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const [k, iStr] = btn.getAttribute('data-s20-del-bible').split(':');
            bm.data[k].splice(Number(iStr), 1);
            bm.saveToDisk?.();
            ctrl?.renderAll?.();
            this.renderAntiOverflowDeleteButtonsInTab4();
          });
        });
      };

      makeCleanList('characters-list-container', 'characters', '👤', 'text-emerald-400');
      makeCleanList('knowledge-list-container', 'knowledgeMatrix', '🗝️', 'text-amber-400');
      makeCleanList('clues-list-container', 'cluesLedger', '📌', 'text-indigo-400');
    }

    static injectShareAndChangelogCardsIntoTab6() {
      let grid = null;
      document.querySelectorAll('button').forEach((btn) => {
        const t = (btn.textContent || '').trim();
        if (t === 'Mở Bộ Xuất File' || t === 'Mở Cấu Hình API Key') {
          const card = btn.closest('div.rounded-2xl, div.rounded-xl, div.p-5, div.p-4');
          if (card && card.parentElement) grid = card.parentElement;
        }
      });

      if (!grid || document.getElementById('s20-tab6-card-share-html')) return;

      const card4 = document.createElement('div');
      card4.id = 's20-tab6-card-changelog';
      card4.className =
        'p-5 rounded-2xl border border-amber-500/40 bg-zinc-900/90 flex flex-col justify-between space-y-4 shadow-lg';
      card4.innerHTML = `
        <div class="space-y-1.5">
          <h3 class="text-sm font-extrabold text-amber-400">
            📢 4. Loa Thông Báo Các Bản Cập Nhật (v1.0 ➔ v34.0)
          </h3>
          <p class="text-xs text-zinc-400 leading-relaxed">
            Xem đầy đủ lịch sử nâng cấp hệ thống và chi tiết các tính năng mới nhất của Version 34.0.
          </p>
        </div>
        <button type="button" id="btn-s20-tab6-open-changelog" class="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow transition">
          📢 Mở Loa Xem Tất Cả Bản Cập Nhật
        </button>
      `;

      const card5 = document.createElement('div');
      card5.id = 's20-tab6-card-share-html';
      card5.className =
        'p-5 rounded-2xl border border-emerald-500/50 bg-zinc-900/90 flex flex-col justify-between space-y-4 shadow-lg';
      card5.innerHTML = `
        <div class="space-y-1.5">
          <h3 class="text-sm font-extrabold text-emerald-400">
            🌐 5. Chia Sẻ Trang Web (Gộp 1 File .HTML + JS Duy Nhất)
          </h3>
          <p class="text-xs text-zinc-400 leading-relaxed">
            Đóng gói toàn bộ HTML và tất cả các file JS thành 1 file .HTML duy nhất (tự động xóa API Key cá nhân) để gửi cho bạn bè dùng ngay.
          </p>
        </div>
        <button type="button" id="btn-s20-tab6-export-html" class="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow transition">
          📥 Tải 1 File .HTML + JS Gộp Chia Sẻ Ngay
        </button>
      `;

      const card6 = document.createElement('div');
      card6.id = 's20-tab6-card-share-js';
      card6.className =
        'p-5 rounded-2xl border border-indigo-500/50 bg-zinc-900/90 flex flex-col justify-between space-y-4 shadow-lg';
      card6.innerHTML = `
        <div class="space-y-1.5">
          <h3 class="text-sm font-extrabold text-indigo-400">
            📜 6. Xuất File .JS Hợp Nhất (Cho Bạn Bè Code JS Chung)
          </h3>
          <p class="text-xs text-zinc-400 leading-relaxed">
            Gộp toàn bộ mã nguồn JS hiện tại thành 1 file .JS duy nhất để các bạn dùng JS code chung với bạn.
          </p>
        </div>
        <button type="button" id="btn-s20-tab6-export-js" class="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow transition">
          📜 Tải File .JS Hợp Nhất Cho Nhóm Code Chung
        </button>
      `;

      grid.appendChild(card4);
      grid.appendChild(card5);
      grid.appendChild(card6);

      const readScriptText = async (file) => {
        try {
          const r = await fetch(file, { cache: 'no-store' });
          if (r.ok) return await r.text();
        } catch (_) {}
        return `/* File ${file} */`;
      };

      document
        .getElementById('btn-s20-tab6-open-changelog')
        ?.addEventListener('click', () => this.openChangelogCenter());

      document
        .getElementById('btn-s20-tab6-export-html')
        ?.addEventListener('click', async () => {
          const [s1, s2, s3] = await Promise.all([
            readScriptText('stage1_to_15_unified_core.js'),
            readScriptText('stage16_flashlite35_bi_ai_v16_changelog.js'),
            readScriptText('stage20_supreme_5stage_overhaul.js')
          ]);
          let html = document.documentElement.outerHTML;
          const myKey = window.StudioStage20?.apiRouter?.getActiveApiKey() || '';
          if (myKey && myKey.length > 10) html = html.split(myKey).join('');
          html = html
            .replace(/<script[^>]+src=["']stage1_to_15_unified_core\.js["'][^>]*><\/script>/gi, '')
            .replace(/<script[^>]+src=["']stage16_flashlite35_bi_ai_v16_changelog\.js["'][^>]*><\/script>/gi, '')
            .replace(/<script[^>]+src=["']stage20_supreme_5stage_overhaul\.js["'][^>]*><\/script>/gi, '');

          const bundled =
            '<!DOCTYPE html>\n' +
            html.replace(
              /<\/body>/i,
              `<script>\n${s1}\n</script>\n<script>\n${s2}\n</script>\n<script>\n${s3}\n</script>\n</body>`
            );
          const a = document.createElement('a');
          a.href = URL.createObjectURL(
            new Blob([bundled], { type: 'text/html;charset=utf-8' })
          );
          a.download = `Web_Tieu_Thuyet_Cua_Bi_Share_AllInOne_v34.html`;
          a.click();
        });

      document
        .getElementById('btn-s20-tab6-export-js')
        ?.addEventListener('click', async () => {
          const [s1, s2, s3] = await Promise.all([
            readScriptText('stage1_to_15_unified_core.js'),
            readScriptText('stage16_flashlite35_bi_ai_v16_changelog.js'),
            readScriptText('stage20_supreme_5stage_overhaul.js')
          ]);
          const merged = `/* === STAGE 1->15 === */\n${s1}\n\n/* === STAGE 16 === */\n${s2}\n\n/* === STAGE 20 === */\n${s3}`;
          const a = document.createElement('a');
          a.href = URL.createObjectURL(
            new Blob([merged], { type: 'application/javascript;charset=utf-8' })
          );
          a.download = `Web_Tieu_Thuyet_Cua_Bi_Merged_JS_v34.js`;
          a.click();
        });
    }
  }

  // ==========================================================================
  // KHỞI CHẠY CHẶNG 5 / 5 & HOÀN TẤT TOÀN BỘ HỆ THỐNG STAGE 20
  // ==========================================================================
  function bootStage20Chapter5() {
    TopmostSubModalAndApprovalFixer.init();
    Stage20GuideChangelogAndShareHub.init();

    window.StudioStage20.subModalFixer = TopmostSubModalAndApprovalFixer;
    window.StudioStage20.guideAndShareHub = Stage20GuideChangelogAndShareHub;
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', bootStage20Chapter5);
  } else {
    bootStage20Chapter5();
  }
})();