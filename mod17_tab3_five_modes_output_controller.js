/**
 * ============================================================================
 * ✍️ WEB VIẾT TIỂU THUYẾT CỦA BI — MODULE 17 (BATCH 4)
 * TÊN FILE: mod17_tab3_five_modes_output_controller.js
 * ============================================================================
 * BỘ ĐIỀU KHIỂN CỬA SỔ ĐẦU RA 5 CHẾ ĐỘ THỐNG NHẤT TẠI TAB 3
 * (Tab3FiveModesWorkspaceController — v36.0 SUPREME EDITION)
 *
 * Thiết kế bởi Kiến trúc sư Phần mềm 30 năm kinh nghiệm:
 * 1. Quản lý tập trung toàn bộ không gian đầu ra của 5 Chế độ Thực thi AI tại Tab 3:
 *    - MODE_1_DRAFT      : ✍️ Chế độ 1 — Bản thảo Văn học Chính thức
 *    - MODE_2_BRAINSTORM : 💡 Chế độ 2 — Bàn tròn Ý tưởng & Thiết kế Nhánh Cốt truyện
 *    - MODE_3_AUDIT      : 🔍 Chế độ 3 — Thanh tra Logic, Thời gian & Ma trận Ai Biết Gì
 *    - MODE_4_REVIEW     : ✨ Chế độ 4 — Biên tập Chuyên sâu, Gọt văn & Chuẩn hóa Thoại
 *    - MODE_5_DIAGRAM    : 🎨 Chế độ 5 — Vẽ Biểu đồ Cốt truyện & Đối chiếu Thời gian
 * 2. Điều khiển trực tiếp thanh công cụ thống nhất trên cùng (#tab3-unified-output-topbar):
 *    - Bộ chọn 5 chế độ (#s20-quad-tab-selector)
 *    - Huy hiệu đếm số từ thời gian thực (#tab3-output-word-badge)
 *    - Nút Chèn nối tiếp vào Bản thảo kèm đánh dấu màu AI (#btn-tab3-append-to-manuscript)
 *    - Nút Thay thế Bản thảo kèm lưu mốc lịch sử tự động (#btn-tab3-replace-manuscript)
 *    - Nút Sao chép nhanh (#btn-tab3-copy-output)
 *    - Nút Mở Bảng Cấu hình Prompt 5 Chế độ (#btn-tab3-open-mode-prompts)
 *    - Nút Lưu trích xuất vào Story Bible Tab 4 (#btn-tab3-save-to-bible)
 *    - Nút Xóa trắng đầu ra chế độ đang mở (#btn-tab3-clear-output)
 * 3. Tích hợp Kho Phiên Bản Đầu Ra Theo Từng Chế Độ (Tab3OutputRevisionHistoryVault),
 *    Bộ Phân Tích Chất Lượng Văn Học Tiếng Việt (Tab3LiteraryQualityAnalyzer),
 *    và Bộ Chuyển Giao Đoạn Bôi Đen Thông Minh (Tab3SmartTransferEngine).
 * ============================================================================
 */
(function () {
  'use strict';

  window.NoirStudio = window.NoirStudio || {};

  // ==========================================================================
  // PHẦN 1: ĐẶC TẢ CHI TIẾT 5 CHẾ ĐỘ ĐẦU RA TẠI TAB 3 & TỪ ĐIỂN CẢM QUAN VĂN HỌC
  // ==========================================================================
  const TAB3_MODE_DESCRIPTORS = {
    MODE_1_DRAFT: {
      key: 'MODE_1_DRAFT',
      shortLabel: '✍️ Chế độ 1: Viết Bản Thảo',
      fullTitle: '✍️ Chế độ 1: Đầu Ra Bản Thảo Tiểu Thuyết Chính Thức',
      badgeColor: 'emerald',
      placeholder:
        'Kết quả viết bản thảo chính thức (Chế độ 1) sẽ hiển thị tại đây.\n• Bạn có thể chỉnh sửa trực tiếp văn bản ngay trong khung này.\n• Bấm "📥 Chèn nối tiếp" hoặc "🔄 Thay thế" trên thanh trên cùng để đưa vào Bản thảo Chính ở Tab 1 (kèm màu đánh dấu AI để bạn duyệt).',
      bibleSectionHeader: 'BẢN NHÁP / TRÍCH ĐOẠN TỪ CHẾ ĐỘ 1 (VIẾT BẢN THẢO)',
      supportsDirectManuscriptTransfer: true
    },
    MODE_2_BRAINSTORM: {
      key: 'MODE_2_BRAINSTORM',
      shortLabel: '💡 Chế độ 2: Bàn Tròn Ý Tưởng',
      fullTitle: '💡 Chế độ 2: Phương Án Phát Triển Tình Tiết & Nút Thắt Cốt Truyện',
      badgeColor: 'amber',
      placeholder:
        'Các phương án phát triển cốt truyện, gợi ý nút thắt (Plot Twist) và hướng gỡ bí (Chế độ 2) sẽ hiển thị tại đây.\n• Bạn có thể bấm "📚 Lưu vào Bible" để cất giữ các ý tưởng hay vào Hồ sơ Story Bible tại Tab 4.',
      bibleSectionHeader: 'PHƯƠNG ÁN Ý TƯỞNG & NHÁNH CỐT TRUYỆN (TỪ CHẾ ĐỘ 2)',
      supportsDirectManuscriptTransfer: true
    },
    MODE_3_AUDIT: {
      key: 'MODE_3_AUDIT',
      shortLabel: '🔍 Chế độ 3: Thanh Tra Logic',
      fullTitle: '🔍 Chế độ 3: Báo Cáo Thanh Tra Logic, Thời Gian & Ma Trận Ai Biết Gì',
      badgeColor: 'indigo',
      placeholder:
        'Báo cáo rà soát mâu thuẫn dòng thời gian, kiểm tra Ma trận Ai Biết Gì và phát hiện lỗi tính cách nhân vật (Chế độ 3) sẽ hiển thị tại đây.\n• Giúp bạn đảm bảo toàn bộ các chương khớp nhau 100% trước khi chốt duyệt.',
      bibleSectionHeader: 'GHI CHÚ THANH TRA LOGIC & NHẤT QUÁN (TỪ CHẾ ĐỘ 3)',
      supportsDirectManuscriptTransfer: true
    },
    MODE_4_REVIEW: {
      key: 'MODE_4_REVIEW',
      shortLabel: '✨ Chế độ 4: Biên Tập & Gọt Văn',
      fullTitle: '✨ Chế độ 4: Bản Thảo Đã Chuẩn Hóa Hội Thoại & Gọt Văn Chống Sáo Rỗng',
      badgeColor: 'purple',
      placeholder:
        'Bản thảo sau khi được biên tập chuyên sâu, loại bỏ từ cấm sáo rỗng (Anti-Cliché) và chuẩn hóa hội thoại "- Câu thoại (Tên nhân vật)" (Chế độ 4) sẽ hiển thị tại đây.\n• Bạn có thể bấm "🔄 Thay thế" hoặc "📥 Chèn nối tiếp" để cập nhật sang Tab 1.',
      bibleSectionHeader: 'GHI CHÚ BIÊN TẬP & PHONG CÁCH VĂN CHƯƠNG (TỪ CHẾ ĐỘ 4)',
      supportsDirectManuscriptTransfer: true
    },
    MODE_5_DIAGRAM: {
      key: 'MODE_5_DIAGRAM',
      shortLabel: '🎨 Chế độ 5: Biểu Đồ Cốt Truyện',
      fullTitle: '🎨 Chế độ 5: Sơ Đồ Cốt Truyện, Mạng Lưới Nhân Vật & Dòng Thời Gian',
      badgeColor: 'teal',
      placeholder:
        'Biểu đồ SVG tương tác và Báo cáo đối chiếu dòng thời gian xuyên chương (Chế độ 5).',
      bibleSectionHeader: 'BIÊN NIÊN SỬ DÒNG THỜI GIAN & SƠ ĐỒ CỐT TRUYỆN (TỪ CHẾ ĐỘ 5)',
      supportsDirectManuscriptTransfer: true
    }
  };

  /**
   * Từ điển từ khóa cảm quan & tâm lý tiếng Việt phục vụ phân tích chất lượng đầu ra
   */
  const VIETNAMESE_SENSORY_LEXICON = {
    visual: [
      'ánh sáng',
      'bóng tối',
      'mờ ảo',
      'lấp lánh',
      'phản chiếu',
      'sương mù',
      'nhợt nhạt',
      'đỏ thẫm',
      'xám xịt',
      'vệt nắng',
      'ngọn đèn',
      'ánh mắt',
      'bóng lưng',
      'khói'
    ],
    auditory: [
      'tiếng bước chân',
      'vọng lại',
      'thì thầm',
      'im lặng',
      'rít lên',
      'tiếng mưa',
      'tiếng gió',
      'nhịp thở',
      'khàn đặc',
      'vang lên',
      'lách cách',
      'tĩnh mịch',
      'ngân dài'
    ],
    tactileAndOlfactory: [
      'lạnh buốt',
      'ẩm ướt',
      'mùi hương',
      'mùi máu',
      'mùi thuốc',
      'mùi ẩm mốc',
      'run rẩy',
      'nóng rực',
      'gai góc',
      'nhói buốt',
      'hơi lạnh',
      'cứng ngắc'
    ],
    psychological: [
      'hoài nghi',
      'ám ảnh',
      'cảnh giác',
      'dằn vặt',
      'ký ức',
      'trống rỗng',
      'bất an',
      'kiềm chế',
      'lạnh lùng',
      'do dự',
      'bí mật',
      'thăm dò',
      'giằng xé'
    ]
  };

  // ==========================================================================
  // PHẦN 2: KHO LƯU TRỮ LỊCH SỬ PHIÊN BẢN ĐẦU RA CỦA 5 CHẾ ĐỘ
  //         (Tab3OutputRevisionHistoryVault)
  // ==========================================================================
  class Tab3OutputRevisionHistoryVault {
    constructor(utils) {
      this.utils = utils;
      this.storageKey = 'noir_v36_tab3_mode_revision_history';
      this.maxRevisionsPerMode = 15;
      this.revisionsByMode = {
        MODE_1_DRAFT: [],
        MODE_2_BRAINSTORM: [],
        MODE_3_AUDIT: [],
        MODE_4_REVIEW: [],
        MODE_5_DIAGRAM: []
      };
      this.loadFromStorage();
    }

    loadFromStorage() {
      try {
        const raw = localStorage.getItem(this.storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            Object.keys(this.revisionsByMode).forEach((k) => {
              if (Array.isArray(parsed[k])) {
                this.revisionsByMode[k] = parsed[k];
              }
            });
          }
        }
      } catch (_) {}
    }

    saveToStorage() {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.revisionsByMode));
      } catch (_) {}
    }

    pushRevision(modeKey, text, sourceLabel = 'AI_GENERATION') {
      const cleanMode = this.revisionsByMode[modeKey] ? modeKey : 'MODE_1_DRAFT';
      const cleanText = String(text || '').trim();
      if (!cleanText) return null;

      const list = this.revisionsByMode[cleanMode];
      if (list.length > 0 && list[0].text === cleanText) {
        list[0].timestamp = Date.now();
        this.saveToStorage();
        return list[0];
      }

      const wordCount =
        this.utils && typeof this.utils.countVietnameseWords === 'function'
          ? this.utils.countVietnameseWords(cleanText)
          : cleanText.split(/\s+/).filter(Boolean).length;

      const item = {
        id: `rev_${cleanMode}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        modeKey: cleanMode,
        timestamp: Date.now(),
        sourceLabel,
        wordCount,
        preview: cleanText.slice(0, 110).replace(/\s+/g, ' '),
        text: cleanText
      };

      list.unshift(item);
      if (list.length > this.maxRevisionsPerMode) {
        this.revisionsByMode[cleanMode] = list.slice(0, this.maxRevisionsPerMode);
      }
      this.saveToStorage();
      return item;
    }

    getRevisionsForMode(modeKey) {
      return [...(this.revisionsByMode[modeKey] || [])];
    }

    getRevisionById(modeKey, revId) {
      const list = this.revisionsByMode[modeKey] || [];
      return list.find((r) => r.id === revId) || null;
    }

    clearRevisionsForMode(modeKey) {
      if (this.revisionsByMode[modeKey]) {
        this.revisionsByMode[modeKey] = [];
        this.saveToStorage();
      }
    }
  }

  // ==========================================================================
  // PHẦN 3: BỘ PHÂN TÍCH CHẤT LƯỢNG VĂN HỌC & NHỊP ĐIỆU ĐẦU RA TẠI TAB 3
  //         (Tab3LiteraryQualityAndReadabilityAnalyzer)
  // ==========================================================================
  class Tab3LiteraryQualityAndReadabilityAnalyzer {
    constructor(utils, storyBible) {
      this.utils = utils;
      this._storyBible = storyBible;
    }

    get storyBible() {
      return this._storyBible || window.NoirStudio?.storyBible;
    }

    /**
     * Phân tích toàn diện văn bản đầu ra đang mở ở Tab 3:
     * - Số từ, số đoạn văn, số câu, thời gian đọc ước tính
     * - Tỷ lệ hội thoại & mức độ tuân thủ chuẩn "- Câu thoại (Tên nhân vật)"
     * - Mật độ từ ngữ đa giác quan & nội tâm
     * - Phát hiện từ cấm sáo rỗng (Anti-Cliché)
     */
    analyzeOutputText(text) {
      const raw = String(text || '').trim();
      if (!raw) {
        return {
          wordCount: 0,
          charCount: 0,
          paragraphCount: 0,
          sentenceCount: 0,
          readingMinutes: 0,
          dialogueLineCount: 0,
          standardDialogueCount: 0,
          dialogueRatioPercent: 0,
          sensoryHits: { visual: 0, auditory: 0, tactileAndOlfactory: 0, psychological: 0 },
          detectedCliches: [],
          rhythmLabel: 'Chưa có văn bản'
        };
      }

      const wordCount =
        this.utils && typeof this.utils.countVietnameseWords === 'function'
          ? this.utils.countVietnameseWords(raw)
          : raw.split(/\s+/).filter(Boolean).length;

      const charCount = raw.length;
      const paragraphs = raw
        .split(/\r?\n+/)
        .map((p) => p.trim())
        .filter(Boolean);
      const paragraphCount = paragraphs.length;

      const sentences = raw
        .split(/[.!?…]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 1);
      const sentenceCount = Math.max(1, sentences.length);
      const avgWordsPerSentence = wordCount / sentenceCount;

      const readingMinutes = Math.max(1, Math.ceil(wordCount / 220));

      // Kiểm tra các dòng hội thoại
      const dialogueLines = paragraphs.filter((p) => /^[-–—]\s*/.test(p));
      const standardDialogueLines = dialogueLines.filter((p) =>
        /^-\s+.+\([^)]+\)\s*$/.test(p)
      );

      const dialogueWords = dialogueLines.reduce(
        (acc, line) => acc + line.split(/\s+/).filter(Boolean).length,
        0
      );
      const dialogueRatioPercent =
        wordCount > 0 ? Math.min(100, Math.round((dialogueWords / wordCount) * 100)) : 0;

      // Đếm mật độ từ ngữ cảm quan
      const lower = raw.toLowerCase();
      const sensoryHits = {
        visual: VIETNAMESE_SENSORY_LEXICON.visual.filter((w) => lower.includes(w)).length,
        auditory: VIETNAMESE_SENSORY_LEXICON.auditory.filter((w) => lower.includes(w)).length,
        tactileAndOlfactory: VIETNAMESE_SENSORY_LEXICON.tactileAndOlfactory.filter((w) =>
          lower.includes(w)
        ).length,
        psychological: VIETNAMESE_SENSORY_LEXICON.psychological.filter((w) =>
          lower.includes(w)
        ).length
      };

      // Kiểm tra danh sách từ cấm sáo rỗng (Anti-Cliché)
      const antiClicheList = Array.isArray(this.storyBible?.antiClicheList)
        ? this.storyBible.antiClicheList
        : [];
      const detectedCliches = antiClicheList.filter((phrase) => {
        const cleanPhrase = String(phrase || '').trim().toLowerCase();
        return cleanPhrase && lower.includes(cleanPhrase);
      });

      let rhythmLabel = 'Cân bằng & Mượt mà';
      if (avgWordsPerSentence < 11) {
        rhythmLabel = 'Nhịp nhanh, dồn dập (Hành động / Kịch tính)';
      } else if (avgWordsPerSentence > 24) {
        rhythmLabel = 'Nhịp chậm, sâu lắng (Nội tâm / Miêu tả)';
      }

      return {
        wordCount,
        charCount,
        paragraphCount,
        sentenceCount,
        avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
        readingMinutes,
        dialogueLineCount: dialogueLines.length,
        standardDialogueCount: standardDialogueLines.length,
        dialogueRatioPercent,
        sensoryHits,
        detectedCliches,
        rhythmLabel
      };
    }

    /**
     * Tự động chuẩn hóa định dạng hội thoại trong văn bản đầu ra tại Tab 3
     * về chuẩn "- Câu thoại (Tên nhân vật)" và loại bỏ dòng trống dư thừa.
     */
    normalizeDialogueAndParagraphFormatting(rawText) {
      const text = String(rawText || '').replace(/\r\n/g, '\n').trim();
      if (!text) return '';

      const normalizedLines = text.split('\n').map((line) => {
        let trimmed = line.trim();
        if (!trimmed) return '';
        // Đổi dấu gạch ngang dài hoặc ngoặc kép đầu dòng thoại sang "- "
        if (/^[–—]\s*/.test(trimmed)) {
          trimmed = trimmed.replace(/^[–—]\s*/, '- ');
        } else if (/^-\S/.test(trimmed)) {
          trimmed = trimmed.replace(/^-/, '- ');
        }
        return trimmed;
      });

      return normalizedLines.join('\n').replace(/\n{3,}/g, '\n\n');
    }
  }
  // ==========================================================================
  // PHẦN 4: BỘ TRÍCH XUẤT & ĐỒNG BỘ THÔNG MINH SANG STORY BIBLE & BẢN THẢO
  //         (Tab3SmartSelectionAndBibleBridge)
  // ==========================================================================
  class Tab3SmartSelectionAndBibleBridge {
    constructor(storyBible, utils) {
      this._storyBible = storyBible;
      this._utils = utils;
    }

    get storyBible() {
      return this._storyBible || window.NoirStudio?.storyBible;
    }

    get utils() {
      return this._utils || window.NoirStudio?.utils;
    }

    /**
     * Lấy phần văn bản đang được tác giả bôi đen trong #s20-quad-output-textarea
     * (Nếu tác giả không bôi đen riêng đoạn nào, trả về chuỗi rỗng để dùng toàn bộ văn bản)
     */
    getSelectedTextInOutputBox() {
      const outTextarea = document.getElementById('s20-quad-output-textarea');
      if (!outTextarea) return '';
      const start = outTextarea.selectionStart;
      const end = outTextarea.selectionEnd;
      if (typeof start === 'number' && typeof end === 'number' && end > start) {
        return outTextarea.value.slice(start, end).trim();
      }
      return '';
    }

    /**
     * Trích xuất tự động các Nhân vật, Mốc sự kiện hoặc Phục bút từ đầu ra Chế độ 2 / 3 / 4
     * để hỗ trợ tác giả lưu vào Story Bible Tab 4 một cách có cấu trúc.
     */
    formatStructuredBibleEntry(modeKey, rawText, chapterTitle = '') {
      const clean = String(rawText || '').trim();
      const stamp =
        this.utils && typeof this.utils.formatTimestampVN === 'function'
          ? this.utils.formatTimestampVN(Date.now())
          : new Date().toLocaleString('vi-VN');

      const descriptor =
        TAB3_MODE_DESCRIPTORS[modeKey] || TAB3_MODE_DESCRIPTORS.MODE_1_DRAFT;
      const chapTag = chapterTitle ? ` | ${chapterTitle}` : '';

      return [
        `====================================================================`,
        `📌 [${descriptor.bibleSectionHeader}${chapTag} — ${stamp}]`,
        `====================================================================`,
        clean
      ].join('\n');
    }
  }

  // ==========================================================================
  // PHẦN 5: BỘ ĐIỀU KHIỂN CHÍNH — TAB 3 FIVE MODES WORKSPACE CONTROLLER
  //         (Tab3FiveModesWorkspaceController)
  // ==========================================================================
  class Tab3FiveModesWorkspaceController {
    constructor(idb, aiDiff, storyBible, sysPrompts, utils) {
      this._idb = idb;
      this._aiDiff = aiDiff;
      this._storyBible = storyBible;
      this._sysPrompts = sysPrompts;
      this._utils = utils;

      this.activeMode = 'MODE_1_DRAFT';
      this.modeOutputs = {
        MODE_1_DRAFT: '',
        MODE_2_BRAINSTORM: '',
        MODE_3_AUDIT: '',
        MODE_4_REVIEW: '',
        MODE_5_DIAGRAM: ''
      };

      this.searchQuery = '';
      this.lastSearchMatchIndex = -1;

      this.revisionVault = new Tab3OutputRevisionHistoryVault(this.utils);
      this.qualityAnalyzer = new Tab3LiteraryQualityAndReadabilityAnalyzer(
        this.utils,
        this.storyBible
      );
      this.bibleBridge = new Tab3SmartSelectionAndBibleBridge(
        this.storyBible,
        this.utils
      );
    }

    // Các getter an toàn liên kết với window.NoirStudio
    get constants() {
      return (
        window.NoirStudio?.constants || {
          STORAGE_KEYS: {
            MODE_OUTPUTS: 'noir_s20_quad_mode_outputs_v1',
            EXECUTION_MODE: 'noir_selected_ai_mode'
          }
        }
      );
    }

    get idb() {
      return this._idb || window.NoirStudio?.idb;
    }

    get aiDiff() {
      return this._aiDiff || window.NoirStudio?.aiDiff;
    }

    get storyBible() {
      return this._storyBible || window.NoirStudio?.storyBible;
    }

    get sysPrompts() {
      return this._sysPrompts || window.NoirStudio?.sysPrompts;
    }

    get chapterMgr() {
      return window.NoirStudio?.chapterManager;
    }

    get utils() {
      return (
        this._utils ||
        window.NoirStudio?.utils || {
          escapeHtml: (s) => String(s || ''),
          countVietnameseWords: (s) =>
            String(s || '')
              .trim()
              .split(/\s+/)
              .filter(Boolean).length,
          countParagraphs: (s) =>
            String(s || '')
              .split(/\r?\n+/)
              .filter((l) => l.trim().length > 0).length,
          formatTimestampVN: () => new Date().toLocaleString('vi-VN'),
          showToast: (msg) => console.log('[Toast]', msg)
        }
      );
    }

    /**
     * Khởi tạo toàn bộ cửa sổ đầu ra 5 chế độ tại Tab 3, khôi phục dữ liệu đã lưu
     * và gắn kết sự kiện cho thanh công cụ thống nhất trên cùng (#tab3-unified-output-topbar).
     */
    init() {
      const saved = this.idb?.getLocalJSON
        ? this.idb.getLocalJSON(this.constants.STORAGE_KEYS.MODE_OUTPUTS, {})
        : {};
      if (saved && typeof saved === 'object') {
        this.modeOutputs = { ...this.modeOutputs, ...saved };
      }

      const outTextarea = document.getElementById('s20-quad-output-textarea');
      if (outTextarea && !outTextarea.dataset.noirMod17Bound) {
        outTextarea.dataset.noirMod17Bound = '1';
        outTextarea.addEventListener('input', () => {
          this.modeOutputs[this.activeMode] = outTextarea.value;
          this.persistOutputs();
          this.updateOutputWordBadge(outTextarea.value);
          this.refreshAnalyticsFooterBar();
        });
      }

      const selector = document.getElementById('s20-quad-tab-selector');
      if (selector && !selector.dataset.noirMod17Bound) {
        selector.dataset.noirMod17Bound = '1';
        selector.addEventListener('change', () => {
          this.switchMode(selector.value);
        });
      }

      this.bindTopbarButtonsIfNeeded();
      this.injectTab3SubToolbarAndAnalyticsFooterIfNeeded();
      this.switchMode(this.activeMode);
    }

    /**
     * Đảm bảo các nút trên thanh #tab3-unified-output-topbar hoạt động ổn định
     */
    bindTopbarButtonsIfNeeded() {
      const bindOnce = (domId, handler) => {
        const el = document.getElementById(domId);
        if (!el || el.dataset.noirMod17ClickBound) return;
        el.dataset.noirMod17ClickBound = '1';
        el.addEventListener('click', handler);
      };

      bindOnce('btn-tab3-append-to-manuscript', () =>
        this.appendCurrentOutputToManuscript()
      );
      bindOnce('btn-tab3-replace-manuscript', () =>
        this.replaceManuscriptWithCurrentOutput()
      );
      bindOnce('btn-tab3-copy-output', () => this.copyCurrentOutput());
      bindOnce('btn-tab3-save-to-bible', () => this.saveCurrentOutputToStoryBible());
      bindOnce('btn-tab3-clear-output', () => this.clearCurrentOutput());
      bindOnce('btn-tab3-open-mode-prompts', () => {
        if (this.sysPrompts && typeof this.sysPrompts.openModal === 'function') {
          this.sysPrompts.openModal(this.activeMode);
        } else {
          document.getElementById('modal-system-prompts-config')?.classList.remove('hidden');
        }
      });
      bindOnce('btn-tab3-jump-newest-output', () => {
        this.revealLatestOutputInView(this.activeMode);
      });
      bindOnce('btn-tab3-dismiss-new-alert', () => {
        document.getElementById('tab3-new-output-alert-banner')?.classList.add('hidden');
      });
    }

    /**
     * Tích hợp thanh tiện ích phụ trợ gọn gàng bên dưới khung đầu ra Tab 3
     * (Lịch sử phiên bản đầu ra của chế độ hiện tại, Chuẩn hóa thoại nhanh,
     *  Xuất file .TXT/.MD và Chỉ số nhịp điệu văn học).
     */
    injectTab3SubToolbarAndAnalyticsFooterIfNeeded() {
      const stdWrapper = document.getElementById('tab3-standard-output-wrapper');
      if (!stdWrapper) return;
      if (document.getElementById('mod17-tab3-analytics-footer')) return;

      const footer = document.createElement('div');
      footer.id = 'mod17-tab3-analytics-footer';
      footer.className =
        'px-3 py-2 bg-zinc-950/90 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400';

      footer.innerHTML = `
        <div id="mod17-tab3-quality-metrics" class="flex flex-wrap items-center gap-3 font-monoCode text-[10px] sm:text-[11px]">
          <span>Đoạn: <strong id="mod17-stat-paragraphs" class="text-zinc-200">0</strong></span>
          <span>Thoại chuẩn: <strong id="mod17-stat-dialogue" class="text-emerald-400">0</strong></span>
          <span>Đọc: <strong id="mod17-stat-readtime" class="text-zinc-200">0 phút</strong></span>
          <span id="mod17-stat-rhythm" class="text-indigo-300 hidden sm:inline">Nhịp văn: Cân bằng</span>
        </div>
        <div class="flex flex-wrap items-center gap-1.5">
          <select id="mod17-select-mode-revision" title="Khôi phục kết quả chạy AI trước đó của chế độ này" class="bg-zinc-900 border border-zinc-700/80 rounded-lg px-2 py-1 text-[10px] text-zinc-200 max-w-[200px]">
            <option value="">🕒 Lịch sử đầu ra chế độ này (0)</option>
          </select>
          <button id="mod17-btn-normalize-dialogue" type="button" title="Chuẩn hóa dấu gạch ngang đầu câu thoại và khoảng cách đoạn" class="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-[10px] transition">
            ✨ Chuẩn hóa thoại
          </button>
          <button id="mod17-btn-export-mode-txt" type="button" title="Tải đầu ra hiện tại về máy dạng .TXT" class="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-[10px] transition">
            💾 Xuất .TXT
          </button>
        </div>
      `;

      stdWrapper.appendChild(footer);

      const revSelect = document.getElementById('mod17-select-mode-revision');
      if (revSelect) {
        revSelect.addEventListener('change', () => {
          const revId = revSelect.value;
          if (!revId) return;
          this.restoreModeRevision(this.activeMode, revId);
          revSelect.value = '';
        });
      }

      document
        .getElementById('mod17-btn-normalize-dialogue')
        ?.addEventListener('click', () => this.normalizeCurrentOutputFormatting());

      document
        .getElementById('mod17-btn-export-mode-txt')
        ?.addEventListener('click', () => this.exportCurrentOutputAsFile('txt'));
    }

    /**
     * Lưu toàn bộ nội dung đầu ra của 5 chế độ vào LocalStorage / IndexedDB
     */
    persistOutputs() {
      if (this.idb && typeof this.idb.setLocalJSON === 'function') {
        this.idb.setLocalJSON(this.constants.STORAGE_KEYS.MODE_OUTPUTS, this.modeOutputs);
      } else {
        try {
          localStorage.setItem(
            this.constants.STORAGE_KEYS.MODE_OUTPUTS,
            JSON.stringify(this.modeOutputs)
          );
        } catch (_) {}
      }
    }

    /**
     * Chuyển đổi giữa 5 Chế độ tại Tab 3:
     * - Chế độ 1 -> 4: Hiển thị khung văn bản tiêu chuẩn (#tab3-standard-output-wrapper & #s20-quad-output-textarea)
     * - Chế độ 5: Hiển thị Xưởng Vẽ Biểu Đồ Cốt Truyện & Dòng Thời Gian (#mode5-plot-diagram-studio)
     */
    switchMode(modeKey) {
      if (!modeKey) return;
      this.activeMode = modeKey;

      const selector = document.getElementById('s20-quad-tab-selector');
      if (selector && selector.value !== modeKey) {
        selector.value = modeKey;
      }

      const cmdModeSelect = document.getElementById('select-ai-execution-mode');
      if (cmdModeSelect && cmdModeSelect.value !== modeKey) {
        cmdModeSelect.value = modeKey;
      }

      const stdWrapper = document.getElementById('tab3-standard-output-wrapper');
      const mode5Studio = document.getElementById('mode5-plot-diagram-studio');
      const outTextarea = document.getElementById('s20-quad-output-textarea');

      const descriptor =
        TAB3_MODE_DESCRIPTORS[modeKey] || TAB3_MODE_DESCRIPTORS.MODE_1_DRAFT;
      if (outTextarea && descriptor.placeholder) {
        outTextarea.placeholder = descriptor.placeholder;
      }

      if (modeKey === 'MODE_5_DIAGRAM') {
        stdWrapper?.classList.add('hidden');
        mode5Studio?.classList.remove('hidden');
        window.NoirStudio?.mode5Studio?.refreshChapterChecklist?.();
        this.updateOutputWordBadge(this.modeOutputs.MODE_5_DIAGRAM || '');
      } else {
        mode5Studio?.classList.add('hidden');
        stdWrapper?.classList.remove('hidden');
        if (outTextarea) {
          outTextarea.value = this.modeOutputs[modeKey] || '';
          this.updateOutputWordBadge(outTextarea.value);
        }
        this.refreshRevisionDropdownUI();
        this.refreshAnalyticsFooterBar();
      }
    }

    revealLatestOutputInView(modeKey = null) {
      const targetMode = modeKey || this.activeMode || 'MODE_1_DRAFT';
      const revs = this.revisionVault.getRevisionsForMode(targetMode);
      if (revs.length > 0 && (!this.modeOutputs[targetMode] || !this.modeOutputs[targetMode].trim())) {
        this.modeOutputs[targetMode] = revs[0].text;
      }
      this.switchMode(targetMode);
      const outTextarea = document.getElementById('s20-quad-output-textarea');
      if (outTextarea) {
        outTextarea.scrollTop = 0;
        outTextarea.focus();
        outTextarea.classList.add('ring-2', 'ring-emerald-400');
        setTimeout(() => outTextarea.classList.remove('ring-2', 'ring-emerald-400'), 1800);
      }
      document.getElementById('tab3-new-output-alert-banner')?.classList.add('hidden');
    }

    /**
     * Ghi nhận đầu ra mới cho một chế độ cụ thể (Mode 1 -> Mode 5),
     * lưu vào lịch sử phiên bản đầu ra của chế độ đó và cập nhật ngay giao diện + bật banner gây chú ý.
     */
    setOutputForMode(modeKey, text, meta = {}) {
      const cleanMode = modeKey || this.activeMode || 'MODE_1_DRAFT';
      const rawStr = String(text || '');
      const stripper =
        typeof window !== 'undefined' && typeof window.NoirStudio?.stripAiMarkdownSymbols === 'function'
          ? window.NoirStudio.stripAiMarkdownSymbols
          : null;
      const strText = stripper ? stripper(rawStr) : rawStr;

      // Lưu dấu gợi ý cốt truyện Chế độ 2 để Chế độ 1 tự động nhận biết và lồng ghép khi tổng hợp Prompt
      if (cleanMode === 'MODE_2_BRAINSTORM' && strText.trim()) {
        try {
          localStorage.setItem('noir_v36_mode2_latest_plot_outline', strText.trim());
        } catch (_) {}
      }

      // Nếu có nội dung mới khác rỗng, lưu vào kho lịch sử phiên bản của chế độ đó
      if (strText.trim()) {
        this.revisionVault.pushRevision(cleanMode, strText, 'AI_OUTPUT');
      }

      this.modeOutputs[cleanMode] = strText;
      this.persistOutputs();
      window.NoirStudio?.promptSynthesizer?.refreshCommandModeUX?.();

      // Tự động chuyển tab đầu ra về đúng chế độ vừa chạy xong để tác giả nhìn thấy ngay
      if (this.activeMode !== cleanMode) {
        this.switchMode(cleanMode);
      } else {
        const outTextarea = document.getElementById('s20-quad-output-textarea');
        if (outTextarea) {
          outTextarea.value = this.modeOutputs[cleanMode];
          outTextarea.scrollTop = 0;
        }
        this.updateOutputWordBadge(this.modeOutputs[cleanMode]);
        this.refreshRevisionDropdownUI();
        this.refreshAnalyticsFooterBar();
      }

      if (strText.trim() && (meta?.notifyNew !== false)) {
        const banner = document.getElementById('tab3-new-output-alert-banner');
        const bannerText = document.getElementById('tab3-new-output-alert-text');
        const desc = TAB3_MODE_DESCRIPTORS[cleanMode]?.shortLabel || cleanMode;
        const wc = this.utils.countVietnameseWords(strText);
        if (bannerText) {
          bannerText.textContent = `Đã chạy xong "${desc}" (${wc.toLocaleString(
            'vi-VN'
          )} từ)! Bản mới nhất đã nạp sẵn bên dưới — hoặc chọn từ 🕒 Lịch sử đầu ra góc dưới.`;
        }
        if (banner) {
          banner.classList.remove('hidden');
        }
      }
    }

    /**
     * Lấy nội dung văn bản của chế độ đang mở hiện tại tại Tab 3
     */
    getCurrentModeText() {
      if (this.activeMode === 'MODE_5_DIAGRAM') {
        const reportEl = document.getElementById('mode5-chronicle-report');
        return reportEl?.textContent || this.modeOutputs.MODE_5_DIAGRAM || '';
      }
      const outTextarea = document.getElementById('s20-quad-output-textarea');
      return outTextarea ? outTextarea.value : this.modeOutputs[this.activeMode] || '';
    }

    /**
     * Cập nhật huy hiệu hiển thị số từ (#tab3-output-word-badge) trên thanh trên cùng Tab 3
     */
    updateOutputWordBadge(text) {
      const badge = document.getElementById('tab3-output-word-badge');
      if (!badge) return;
      const w = this.utils.countVietnameseWords(text || '');
      badge.textContent = `${w.toLocaleString('vi-VN')} từ`;
    }

    /**
     * Cập nhật các chỉ số phân tích chất lượng văn học dưới chân cửa sổ đầu ra Tab 3
     */
    refreshAnalyticsFooterBar() {
      const text = this.getCurrentModeText();
      const metrics = this.qualityAnalyzer.analyzeOutputText(text);

      const elPara = document.getElementById('mod17-stat-paragraphs');
      const elDial = document.getElementById('mod17-stat-dialogue');
      const elRead = document.getElementById('mod17-stat-readtime');
      const elRhythm = document.getElementById('mod17-stat-rhythm');

      if (elPara) elPara.textContent = metrics.paragraphCount.toLocaleString('vi-VN');
      if (elDial) {
        elDial.textContent = `${metrics.standardDialogueCount}/${metrics.dialogueLineCount} câu (${metrics.dialogueRatioPercent}%)`;
      }
      if (elRead) elRead.textContent = `~${metrics.readingMinutes} phút`;
      if (elRhythm) {
        if (metrics.detectedCliches.length > 0) {
          elRhythm.className = 'text-amber-400 font-bold hidden sm:inline';
          elRhythm.textContent = `⚠️ Có ${metrics.detectedCliches.length} cụm từ cần gọt`;
        } else {
          elRhythm.className = 'text-indigo-300 hidden sm:inline';
          elRhythm.textContent = `Nhịp văn: ${metrics.rhythmLabel}`;
        }
      }
    }

    /**
     * Cập nhật danh sách thả xuống Lịch sử các lần chạy AI của chế độ đang mở
     */
    refreshRevisionDropdownUI() {
      const revSelect = document.getElementById('mod17-select-mode-revision');
      if (!revSelect) return;
      const list = this.revisionVault.getRevisionsForMode(this.activeMode);
      const headerLabel = `🕒 Lịch sử đầu ra chế độ này (${list.length})`;

      const optionsHtml = [
        `<option value="">${this.utils.escapeHtml(headerLabel)}</option>`,
        ...list.map((rev, idx) => {
          const timeStr = this.utils.formatTimestampVN(rev.timestamp);
          const label = `#${idx + 1} (${rev.wordCount} từ — ${timeStr}): ${rev.preview.slice(
            0,
            40
          )}...`;
          return `<option value="${this.utils.escapeHtml(rev.id)}">${this.utils.escapeHtml(
            label
          )}</option>`;
        })
      ].join('');

      revSelect.innerHTML = optionsHtml;
    }

    /**
     * Khôi phục một phiên bản đầu ra trước đó của chế độ hiện tại
     */
    restoreModeRevision(modeKey, revId) {
      const targetRev = this.revisionVault.getRevisionById(modeKey, revId);
      if (!targetRev) return;

      // Lưu bản hiện tại vào kho trước khi đổi sang bản cũ để không mất dữ liệu
      const currentText = this.getCurrentModeText();
      if (currentText && currentText.trim()) {
        this.revisionVault.pushRevision(modeKey, currentText, 'AUTO_SAVE_BEFORE_RESTORE');
      }

      this.modeOutputs[modeKey] = targetRev.text;
      this.persistOutputs();

      const outTextarea = document.getElementById('s20-quad-output-textarea');
      if (outTextarea && this.activeMode === modeKey) {
        outTextarea.value = targetRev.text;
      }
      this.updateOutputWordBadge(targetRev.text);
      this.refreshRevisionDropdownUI();
      this.refreshAnalyticsFooterBar();

      this.utils.showToast(
        `↺ Đã khôi phục bản đầu ra (${targetRev.wordCount.toLocaleString(
          'vi-VN'
        )} từ) vào cửa sổ Tab 3!`,
        'success'
      );
    }

    /**
     * Chuẩn hóa nhanh định dạng câu thoại "- Câu thoại (Tên nhân vật)" và ngắt đoạn
     * cho văn bản đang mở tại Tab 3
     */
    normalizeCurrentOutputFormatting() {
      const raw = this.getCurrentModeText();
      if (!raw.trim()) {
        this.utils.showToast('⚠️ Cửa sổ đầu ra đang trống!', 'warning');
        return;
      }
      const normalized =
        this.qualityAnalyzer.normalizeDialogueAndParagraphFormatting(raw);
      this.setOutputForMode(this.activeMode, normalized);
      this.utils.showToast(
        '✨ Đã chuẩn hóa dấu gạch ngang hội thoại và khoảng cách đoạn văn!',
        'success'
      );
    }

    /**
     * Nút "📥 Chèn nối tiếp" (#btn-tab3-append-to-manuscript):
     * Đưa toàn bộ đầu ra hiện tại (hoặc đoạn văn đang được tác giả bôi đen trong ô đầu ra)
     * nối tiếp vào cuối Bản thảo Chính tại Tab 1 kèm đánh dấu màu AI để tác giả duyệt!
     */
    async appendCurrentOutputToManuscript() {
      const selectedSnippet = this.bibleBridge.getSelectedTextInOutputBox();
      const text = selectedSnippet || this.getCurrentModeText();
      if (!text.trim()) {
        this.utils.showToast('⚠️ Cửa sổ đầu ra đang trống!', 'warning');
        return;
      }
      await this.aiDiff.applyAIOutputToManuscriptWithDiff(text, 'APPEND');
    }

    /**
     * Nút "🔄 Thay thế" (#btn-tab3-replace-manuscript):
     * Thay thế nội dung Bản thảo Chính tại Tab 1 bằng đầu ra AI hiện tại
     * (Tự động lưu 1 mốc lịch sử phiên bản tại Tab 6 và bật giao diện đánh dấu màu AI tại Tab 1!)
     */
    async replaceManuscriptWithCurrentOutput() {
      const text = this.getCurrentModeText();
      if (!text.trim()) {
        this.utils.showToast('⚠️ Cửa sổ đầu ra đang trống!', 'warning');
        return;
      }
      if (
        !window.confirm(
          'Bạn muốn thay thế nội dung bản thảo hiện tại bằng đầu ra AI này?\n(Hệ thống sẽ tự động lưu 1 mốc phiên bản cũ tại Tab 6 và hiển thị màu đánh dấu AI tại Tab 1 để bạn duyệt!)'
        )
      ) {
        return;
      }
      await this.aiDiff.applyAIOutputToManuscriptWithDiff(text, 'REPLACE');
    }

    /**
     * Nút "📋 Sao chép" (#btn-tab3-copy-output):
     * Sao chép toàn bộ nội dung đầu ra (hoặc đoạn đang bôi đen) vào khay nhớ tạm
     */
    async copyCurrentOutput() {
      const selectedSnippet = this.bibleBridge.getSelectedTextInOutputBox();
      const text = selectedSnippet || this.getCurrentModeText();
      if (!text.trim()) {
        this.utils.showToast('⚠️ Chưa có nội dung đầu ra để sao chép.', 'warning');
        return;
      }
      try {
        await navigator.clipboard.writeText(text);
        this.utils.showToast(
          selectedSnippet
            ? '📋 Đã sao chép đoạn văn bạn chọn vào khay nhớ tạm!'
            : '📋 Đã sao chép toàn bộ nội dung đầu ra vào khay nhớ tạm!',
          'success'
        );
      } catch (_) {
        this.utils.showToast('📋 Đã sao chép nội dung!', 'success');
      }
    }

    /**
     * Nút "📚 Lưu vào Bible" (#btn-tab3-save-to-bible):
     * Lưu nội dung đầu ra hiện tại (hoặc đoạn văn đang bôi đen) vào Hồ sơ Story Bible tại Tab 4
     */
    async saveCurrentOutputToStoryBible() {
      const selectedSnippet = this.bibleBridge.getSelectedTextInOutputBox();
      const text = selectedSnippet || this.getCurrentModeText();
      if (!text.trim()) {
        this.utils.showToast(
          '⚠️ Chưa có nội dung đầu ra để lưu vào Story Bible.',
          'warning'
        );
        return;
      }

      const renEl = document.getElementById('textarea-rendered-bible-content');
      if (renEl) {
        const activeChap = this.chapterMgr?.getActiveChapter?.();
        const formattedBlock = this.bibleBridge.formatStructuredBibleEntry(
          this.activeMode,
          text,
          activeChap?.displayTitle || activeChap?.title || ''
        );

        renEl.value = (renEl.value ? renEl.value.trim() + '\n\n' : '') + formattedBlock;
        if (this.storyBible && typeof this.storyBible.saveAllBibleData === 'function') {
          await this.storyBible.saveAllBibleData(true);
        }
      }
    }

    /**
     * Nút "🗑️ Xóa" (#btn-tab3-clear-output):
     * Xóa trắng cửa sổ đầu ra của chế độ đang mở (sau khi đã lưu bản dự phòng vào lịch sử chế độ)
     */
    clearCurrentOutput() {
      const text = this.getCurrentModeText();
      if (!text.trim()) return;
      if (!window.confirm('Xóa trắng nội dung cửa sổ đầu ra của chế độ đang mở?')) return;

      // Lưu dự phòng vào lịch sử chế độ trước khi xóa trắng
      this.revisionVault.pushRevision(this.activeMode, text, 'SAVED_BEFORE_CLEAR');

      this.setOutputForMode(this.activeMode, '');
      this.utils.showToast(
        '🗑️ Đã xóa trắng cửa sổ đầu ra (Bạn vẫn có thể khôi phục từ ô Lịch sử đầu ra bên dưới).',
        'info'
      );
    }

    /**
     * Xuất nội dung đầu ra của chế độ đang mở thành file .TXT hoặc .MD
     */
    exportCurrentOutputAsFile(format = 'txt') {
      const text = this.getCurrentModeText();
      if (!text.trim()) {
        this.utils.showToast('⚠️ Cửa sổ đầu ra đang trống, chưa có nội dung để tải về!', 'warning');
        return;
      }
      const ext = format === 'md' ? 'md' : 'txt';
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Dau_Ra_${this.activeMode}_${Date.now()}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      this.utils.showToast(
        `💾 Đã tải xuống tệp đầu ra ${this.activeMode} (.${ext.toUpperCase()})!`,
        'success'
      );
    }

    /**
     * Xuất toàn bộ nội dung của cả 5 Chế độ tại Tab 3 thành 1 hồ sơ tổng hợp duy nhất
     */
    exportAllFiveModesBundle() {
      const sections = Object.keys(TAB3_MODE_DESCRIPTORS).map((modeKey) => {
        const desc = TAB3_MODE_DESCRIPTORS[modeKey];
        const content = (this.modeOutputs[modeKey] || '').trim() || '(Chưa có nội dung)';
        return [
          `####################################################################`,
          `${desc.fullTitle}`,
          `####################################################################`,
          content,
          ``
        ].join('\n');
      });

      const bundleText = sections.join('\n');
      const blob = new Blob([bundleText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Ho_So_5_Che_Do_AI_Tab3_${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      this.utils.showToast(
        '📦 Đã xuất trọn bộ hồ sơ đầu ra của cả 5 Chế độ AI tại Tab 3!',
        'success'
      );
    }

    /**
     * Tìm kiếm từ khóa bên trong cửa sổ đầu ra #s20-quad-output-textarea
     * và cuộn tới vị trí khớp tiếp theo
     */
    findNextInCurrentOutput(keyword) {
      const query = String(keyword || this.searchQuery || '').trim();
      if (!query) return false;
      this.searchQuery = query;

      const outTextarea = document.getElementById('s20-quad-output-textarea');
      if (!outTextarea || !outTextarea.value) return false;

      const lowerText = outTextarea.value.toLowerCase();
      const lowerQuery = query.toLowerCase();
      let idx = lowerText.indexOf(lowerQuery, this.lastSearchMatchIndex + 1);
      if (idx === -1) {
        idx = lowerText.indexOf(lowerQuery, 0);
      }
      if (idx === -1) {
        this.utils.showToast(`🔍 Không tìm thấy "${query}" trong đầu ra hiện tại.`, 'info');
        return false;
      }

      this.lastSearchMatchIndex = idx;
      outTextarea.focus();
      outTextarea.setSelectionRange(idx, idx + query.length);
      return true;
    }

    /**
     * So sánh nhanh 2 chế độ đầu ra (ví dụ: so sánh Bản thảo Chế độ 1 với Bản đã gọt văn ở Chế độ 4)
     */
    compareTwoModesSummary(modeA = 'MODE_1_DRAFT', modeB = 'MODE_4_REVIEW') {
      const textA = this.modeOutputs[modeA] || '';
      const textB = this.modeOutputs[modeB] || '';
      const metricsA = this.qualityAnalyzer.analyzeOutputText(textA);
      const metricsB = this.qualityAnalyzer.analyzeOutputText(textB);

      return {
        modeA: {
          key: modeA,
          title: TAB3_MODE_DESCRIPTORS[modeA]?.shortLabel || modeA,
          metrics: metricsA
        },
        modeB: {
          key: modeB,
          title: TAB3_MODE_DESCRIPTORS[modeB]?.shortLabel || modeB,
          metrics: metricsB
        },
        wordDelta: metricsB.wordCount - metricsA.wordCount,
        clicheReduction:
          metricsA.detectedCliches.length - metricsB.detectedCliches.length,
        dialogueStandardGain:
          metricsB.standardDialogueCount - metricsA.standardDialogueCount
      };
    }

    /**
     * Trả về báo cáo trạng thái tổng thể của cả 5 Chế độ tại Tab 3
     */
    getAllModesOverviewDigest() {
      const overview = {};
      let totalWordsAllModes = 0;

      Object.keys(this.modeOutputs).forEach((modeKey) => {
        const txt = this.modeOutputs[modeKey] || '';
        const w = this.utils.countVietnameseWords(txt);
        totalWordsAllModes += w;
        overview[modeKey] = {
          modeKey,
          label: TAB3_MODE_DESCRIPTORS[modeKey]?.shortLabel || modeKey,
          wordCount: w,
          revisionCount: this.revisionVault.getRevisionsForMode(modeKey).length,
          hasContent: w > 0
        };
      });

      return {
        activeMode: this.activeMode,
        totalWordsAllModes,
        modes: overview
      };
    }
  }

  // ==========================================================================
  // PHẦN 6: BỘ TRỢ LÝ SO SÁNH & CHUYỂN ĐỔI ĐOẠN VĂN GIỮA CÁC CHẾ ĐỘ TAB 3
  //         (Tab3CrossModeWorkflowHelper)
  // ==========================================================================
  class Tab3CrossModeWorkflowHelper {
    constructor(controller) {
      this.controller = controller;
    }

    /**
     * Chuyển nhanh văn bản từ Chế độ 1 (Bản thảo nháp) sang làm đầu vào cho
     * Chế độ 3 (Thanh tra Logic) hoặc Chế độ 4 (Biên tập & Gọt văn chống sáo rỗng)
     */
    sendCurrentModeOutputToCommandForMode(targetModeKey = 'MODE_4_REVIEW') {
      const sourceText = this.controller.getCurrentModeText();
      if (!sourceText.trim()) {
        this.controller.utils.showToast(
          '⚠️ Cửa sổ đầu ra hiện tại đang trống, chưa có văn bản để chuyển tiếp!',
          'warning'
        );
        return false;
      }

      const modeInstructions = {
        MODE_3_AUDIT:
          'Hãy thanh tra kỹ lưỡng đoạn bản thảo dưới đây, đối chiếu với Story Bible, Ma trận Ai Biết Gì và Dòng thời gian để tìm mọi điểm mâu thuẫn:',
        MODE_4_REVIEW:
          'Hãy biên tập chuyên sâu đoạn bản thảo dưới đây, loại bỏ 100% từ cấm sáo rỗng (Anti-Cliché), làm giàu miêu tả tâm lý và chuẩn hóa mọi câu thoại về "- Câu thoại (Tên nhân vật)":',
        MODE_2_BRAINSTORM:
          'Dựa trên đoạn bản thảo dưới đây, hãy đề xuất 3 hướng phát triển tình tiết tiếp theo thật bất ngờ và kịch tính:'
      };

      const prefix =
        modeInstructions[targetModeKey] || modeInstructions.MODE_4_REVIEW;
      const composedPrompt = `${prefix}\n\n"""\n${sourceText.trim()}\n"""`;

      const promptBox = document.getElementById('s18-fullscreen-prompt-textarea');
      if (promptBox) {
        promptBox.value = composedPrompt;
        promptBox.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        try {
          localStorage.setItem('noir_v36_last_command_prompt', composedPrompt);
        } catch (_) {}
      }

      const modeSelect = document.getElementById('select-ai-execution-mode');
      if (modeSelect) {
        modeSelect.value = targetModeKey;
        modeSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }

      const router = window.NoirStudio?.geminiRouter;
      router?.populateAllModelDropdowns?.();
      router?.syncThinkingLevelControlsDOM?.();
      router?.quotaTracker?.renderRealtimeQuotaWidget?.();

      document
        .getElementById('modal-fullscreen-ai-command')
        ?.classList.remove('hidden');

      this.controller.utils.showToast(
        `🚀 Đã nạp văn bản vào Cửa sổ điều khiển AI (${targetModeKey})! Bạn có thể bấm "Chạy Prompt Tổng Hợp" ngay.`,
        'info',
        3600
      );
      return true;
    }

    /**
     * Tách riêng các câu thoại trong đầu ra hiện tại để tác giả kiểm tra nhịp điệu đối thoại
     * và giọng nói riêng của từng nhân vật (Character Voice Check)
     */
    extractDialogueScriptFromCurrentOutput() {
      const raw = this.controller.getCurrentModeText();
      if (!raw.trim()) {
        return {
          totalDialogueLines: 0,
          speakersMap: {},
          formattedScript: ''
        };
      }

      const lines = raw
        .split(/\r?\n+/)
        .map((l) => l.trim())
        .filter((l) => /^[-–—]\s+/.test(l));

      const speakersMap = {};
      const scriptLines = lines.map((line, idx) => {
        const speakerMatch = line.match(/\(([^)]+)\)\s*$/);
        const speaker = speakerMatch ? speakerMatch[1].trim() : 'Chưa ghi tên';
        speakersMap[speaker] = (speakersMap[speaker] || 0) + 1;
        return `${idx + 1}. [${speaker}]: ${line}`;
      });

      return {
        totalDialogueLines: lines.length,
        speakersMap,
        formattedScript: scriptLines.join('\n')
      };
    }

    /**
     * Kiểm tra tính toàn vẹn của toàn bộ thành phần DOM tại Tab 3
     */
    verifyTab3DomIntegrity() {
      const requiredIds = [
        'tab3-unified-output-topbar',
        's20-quad-tab-selector',
        'tab3-output-word-badge',
        'btn-tab3-append-to-manuscript',
        'btn-tab3-replace-manuscript',
        'btn-tab3-copy-output',
        'btn-tab3-open-mode-prompts',
        'btn-tab3-save-to-bible',
        'btn-tab3-clear-output',
        'tab3-standard-output-wrapper',
        's20-quad-output-textarea',
        'mode5-plot-diagram-studio'
      ];

      const missingIds = requiredIds.filter((id) => !document.getElementById(id));
      return {
        allMounted: missingIds.length === 0,
        missingIds,
        activeMode: this.controller.activeMode
      };
    }
  }

  // ==========================================================================
  // PHẦN 7: BỘ HỢP NHẤT PHẪU THUẬT TỪNG ĐOẠN & KHỬ TRÙNG LẶP NỐI MẠCH
  //         (Tab3ParagraphByParagraphSurgicalMerger)
  // ==========================================================================
  class Tab3ParagraphByParagraphSurgicalMerger {
    constructor(controller) {
      this.controller = controller;
    }

    /**
     * Tách văn bản đầu ra hiện tại tại Tab 3 thành danh sách các khối đoạn văn
     * kèm phân loại (NARRATION, DIALOGUE, HEADING, SCENE_BREAK) để xử lý chính xác.
     */
    parseOutputIntoBlocks(rawText) {
      const text = String(rawText || this.controller.getCurrentModeText() || '').trim();
      if (!text) return [];

      const rawParagraphs = text
        .split(/\r?\n+/)
        .map((p) => p.trim())
        .filter(Boolean);

      return rawParagraphs.map((para, idx) => {
        let blockType = 'NARRATION';
        let speaker = null;

        if (/^[-–—]\s+/.test(para)) {
          blockType = 'DIALOGUE';
          const spMatch = para.match(/\(([^)]+)\)\s*$/);
          if (spMatch) speaker = spMatch[1].trim();
        } else if (/^(===|###|\*\*\*|---)/.test(para)) {
          blockType = 'SCENE_BREAK';
        } else if (/^(Chương|CHƯƠNG|Cảnh|CẢNH|Mốc|MỐC)\s+\d+/i.test(para) && para.length < 90) {
          blockType = 'HEADING';
        }

        const words = this.controller.utils.countVietnameseWords(para);
        return {
          index: idx,
          id: `tab3_blk_${idx}`,
          type: blockType,
          speaker,
          wordCount: words,
          text: para
        };
      });
    }

    /**
     * Khử trùng lặp câu nối mạch (Overlap De-duplication):
     * Khi AI viết nối tiếp đoạn cuối của bản thảo, đôi khi AI chép lại 1-2 câu cuối
     * của bản thảo cũ ở đầu câu trả lời. Hàm này tự động phát hiện và cắt bỏ phần
     * bị lặp ở đầu đầu ra AI để khi bấm "📥 Chèn nối tiếp", mạch văn liền lạc 100%!
     */
    stripLeadingOverlapWithManuscript(manuscriptText, aiOutputText) {
      const msClean = String(manuscriptText || '').trim();
      const aiClean = String(aiOutputText || '').trim();
      if (!msClean || !aiClean) {
        return {
          cleanedText: aiClean,
          overlapRemoved: false,
          removedCharsCount: 0
        };
      }

      const msParagraphs = msClean
        .split(/\r?\n+/)
        .map((p) => p.trim())
        .filter(Boolean);
      const aiParagraphs = aiClean
        .split(/\r?\n+/)
        .map((p) => p.trim())
        .filter(Boolean);

      if (msParagraphs.length === 0 || aiParagraphs.length === 0) {
        return {
          cleanedText: aiClean,
          overlapRemoved: false,
          removedCharsCount: 0
        };
      }

      const lastMsPara = msParagraphs[msParagraphs.length - 1];
      const secondLastMsPara =
        msParagraphs.length > 1 ? msParagraphs[msParagraphs.length - 2] : '';

      let stripCount = 0;
      if (
        secondLastMsPara &&
        aiParagraphs.length >= 2 &&
        this.isParagraphNearlyIdentical(aiParagraphs[0], secondLastMsPara) &&
        this.isParagraphNearlyIdentical(aiParagraphs[1], lastMsPara)
      ) {
        stripCount = 2;
      } else if (this.isParagraphNearlyIdentical(aiParagraphs[0], lastMsPara)) {
        stripCount = 1;
      }

      if (stripCount > 0 && aiParagraphs.length > stripCount) {
        const remaining = aiParagraphs.slice(stripCount).join('\n\n');
        return {
          cleanedText: remaining,
          overlapRemoved: true,
          removedCharsCount: aiClean.length - remaining.length
        };
      }

      return {
        cleanedText: aiClean,
        overlapRemoved: false,
        removedCharsCount: 0
      };
    }

    /**
     * Kiểm tra 2 đoạn văn có trùng khớp từ 90% trở lên không (bỏ qua khoảng trắng thừa)
     */
    isParagraphNearlyIdentical(paraA, paraB) {
      const normA = String(paraA || '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
      const normB = String(paraB || '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
      if (!normA || !normB) return false;
      if (normA === normB) return true;
      if (normA.length > 40 && normB.includes(normA)) return true;
      if (normB.length > 40 && normA.includes(normB)) return true;
      return false;
    }

    /**
     * Chèn một tập hợp các đoạn văn được chọn theo chỉ số (blockIndices)
     * từ cửa sổ đầu ra Tab 3 sang cuối Bản thảo Chính tại Tab 1
     */
    async appendSelectedBlocksToManuscript(blockIndices = []) {
      const allBlocks = this.parseOutputIntoBlocks();
      if (allBlocks.length === 0) {
        this.controller.utils.showToast('⚠️ Cửa sổ đầu ra đang trống!', 'warning');
        return false;
      }

      const indexSet = new Set(blockIndices);
      const chosen =
        indexSet.size > 0
          ? allBlocks.filter((b) => indexSet.has(b.index))
          : allBlocks;

      if (chosen.length === 0) return false;

      const joinedText = chosen.map((b) => b.text).join('\n\n');
      await this.controller.aiDiff?.applyAIOutputToManuscriptWithDiff?.(
        joinedText,
        'APPEND'
      );
      return true;
    }

    /**
     * Chèn đầu ra hiện tại vào đúng vị trí con trỏ đang đứng trong #textarea-chapter-content
     */
    async insertOutputAtEditorCursor(snippetText = '') {
      const textToInsert = String(
        snippetText ||
          this.controller.bibleBridge.getSelectedTextInOutputBox() ||
          this.controller.getCurrentModeText() ||
          ''
      ).trim();

      if (!textToInsert) {
        this.controller.utils.showToast(
          '⚠️ Chưa có văn bản đầu ra để chèn vào vị trí con trỏ.',
          'warning'
        );
        return false;
      }

      const editor = document.getElementById('textarea-chapter-content');
      if (!editor) {
        await this.controller.appendCurrentOutputToManuscript();
        return true;
      }

      const start =
        typeof editor.selectionStart === 'number'
          ? editor.selectionStart
          : editor.value.length;
      const end =
        typeof editor.selectionEnd === 'number' ? editor.selectionEnd : start;

      const before = editor.value.slice(0, start);
      const after = editor.value.slice(end);
      const prefixNewline = before && !before.endsWith('\n') ? '\n\n' : '';
      const suffixNewline = after && !after.startsWith('\n') ? '\n\n' : '';

      editor.value = `${before}${prefixNewline}${textToInsert}${suffixNewline}${after}`;
      editor.dispatchEvent(new Event('input', { bubbles: true }));

      window.NoirStudio?.navigator?.navigateToScreen?.('SCREEN_1_WRITE');
      this.controller.utils.showToast(
        '✍️ Đã chèn văn bản vào đúng vị trí con trỏ tại Bản thảo Tab 1!',
        'success'
      );
      return true;
    }
  }

  // ==========================================================================
  // PHẦN 8: BỘ QUÉT & GỢI Ý THAY THẾ TỪ SÁO RỖNG (ANTI-CLICHÉ SURGICAL CLEANER)
  //         (Tab3AntiClicheSurgicalCleaner)
  // ==========================================================================
  const BUILTIN_CLICHE_REPLACEMENT_SUGGESTIONS = {
    'một luồng điện chạy dọc sống lưng': [
      'các đốt sống lưng chợt căng cứng lại như phản xạ trước hiểm nguy',
      'hơi lạnh từ gáy lan nhanh xuống tận đầu ngón tay',
      'nhịp tim trật đi một nhịp, để lại khoảng rỗng lạnh buốt trong lồng ngực'
    ],
    'thở dài một tiếng': [
      'buông nhẹ hơi thở nặng nhọc qua kẽ răng',
      'hạ thấp bờ vai đang căng cứng, im lặng nhìn ra khoảng tối',
      'khẽ cụp mắt xuống, nén lại tiếng thở trầm đục'
    ],
    'ánh mắt phức tạp': [
      'ánh nhìn vừa thăm dò vừa như muốn giấu đi một nỗi day dứt cũ',
      'đồng tử khẽ co lại, đan xen giữa sự hoài nghi và chút xót xa hiếm hoi',
      'cái nhìn dừng lại rất lâu trên gương mặt đối phương nhưng không nói thành lời'
    ],
    'khẽ nhếch môi tạo thành một vòng cung': [
      'khóe môi chỉ hơi nhướng lên mà không hề chạm tới đáy mắt',
      'nở một nụ cười nhạt lạnh lùng như đã đoán trước kết cục',
      'gương mặt giữ nguyên vẻ bình thản, chỉ có khóe miệng thoáng nét giễu cợt'
    ],
    'không khỏi cảm thán trong lòng': [
      'thầm thừa nhận sự thật phũ phàng ấy trong im lặng',
      'bất giác nhận ra mọi tính toán từ đầu đều đã lệch đi một nước cờ',
      'lặng người đi vài giây trước sự trùng hợp đến rợn người'
    ],
    'trong lòng dâng lên một cảm giác khó tả': [
      'một nỗi bất an mơ hồ cứ âm ỉ lớn dần dưới lớp vỏ bình tĩnh',
      'ký ức cũ và thực tại trước mắt va vào nhau khiến ngực anh thắt lại',
      'cảm giác xa lạ len lỏi vào từng suy nghĩ vốn luôn rạch ròi'
    ],
    'bầu không khí bỗng trở nên tĩnh lặng đến đáng sợ': [
      'căn phòng chìm vào sự im ắng đặc quánh, chỉ còn nghe rõ tiếng kim đồng hồ gõ nhịp',
      'không ai nói thêm lời nào, khoảng lặng giữa hai người căng như dây đàn sắp đứt',
      'mọi âm thanh ngoài hành lang như lùi xa, để lại sự tĩnh mịch lạnh ngắt'
    ],
    'nụ cười nửa miệng đầy ẩn ý': [
      'nụ cười thoáng qua rất nhanh như đang giữ lại một quân bài tẩy',
      'khóe môi khẽ cong lên với vẻ điềm nhiên của kẻ nắm đằng chuôi',
      'ánh cười kín đáo khiến người đối diện không sao đoán nổi ý định thật sự'
    ]
  };

  class Tab3AntiClicheSurgicalCleaner {
    constructor(controller) {
      this.controller = controller;
    }

    /**
     * Quét toàn bộ văn bản đầu ra hiện tại tại Tab 3 để tìm các cụm từ nằm trong
     * danh sách cấm Anti-Cliché và đính kèm phương án viết lại giàu hình ảnh.
     */
    scanCurrentOutputForCliches() {
      const text = this.controller.getCurrentModeText();
      if (!text.trim()) {
        return {
          totalHits: 0,
          findings: []
        };
      }

      const customList = Array.isArray(this.controller.storyBible?.antiClicheList)
        ? this.controller.storyBible.antiClicheList
        : [];
      const mergedPhrases = [
        ...new Set([
          ...Object.keys(BUILTIN_CLICHE_REPLACEMENT_SUGGESTIONS),
          ...customList.map((p) => String(p || '').trim())
        ])
      ].filter(Boolean);

      const lowerText = text.toLowerCase();
      const findings = [];

      mergedPhrases.forEach((phrase) => {
        const lowerPhrase = phrase.toLowerCase();
        let searchPos = 0;
        const occurrences = [];

        while (searchPos < lowerText.length) {
          const foundIdx = lowerText.indexOf(lowerPhrase, searchPos);
          if (foundIdx === -1) break;
          occurrences.push({
            index: foundIdx,
            excerpt: text.slice(
              Math.max(0, foundIdx - 35),
              Math.min(text.length, foundIdx + phrase.length + 35)
            )
          });
          searchPos = foundIdx + lowerPhrase.length;
        }

        if (occurrences.length > 0) {
          const suggestions = BUILTIN_CLICHE_REPLACEMENT_SUGGESTIONS[lowerPhrase] || [
            'Thay bằng miêu tả hành động cơ thể hoặc chi tiết giác quan cụ thể',
            'Thể hiện tâm lý nhân vật qua nhịp đối thoại hoặc ánh nhìn thay vì kể trực tiếp'
          ];
          findings.push({
            phrase,
            count: occurrences.length,
            occurrences,
            suggestions
          });
        }
      });

      return {
        totalHits: findings.reduce((acc, f) => acc + f.count, 0),
        findings
      };
    }

    /**
     * Tự động thay thế các cụm từ sáo rỗng bị phát hiện bằng các phương án miêu tả
     * giàu hình ảnh, đa dạng hóa luân phiên để không bị lặp câu.
     */
    autoCleanDetectedClichesInCurrentOutput() {
      let text = this.controller.getCurrentModeText();
      if (!text.trim()) {
        this.controller.utils.showToast('⚠️ Cửa sổ đầu ra đang trống!', 'warning');
        return { replacedCount: 0 };
      }

      const scan = this.scanCurrentOutputForCliches();
      if (scan.totalHits === 0) {
        this.controller.utils.showToast(
          '✅ Tuyệt vời! Đầu ra hiện tại hoàn toàn sạch bóng từ ngữ sáo rỗng (Anti-Cliché 100%).',
          'success'
        );
        return { replacedCount: 0 };
      }

      let replacedCount = 0;
      scan.findings.forEach((item) => {
        const suggestions = item.suggestions;
        if (!Array.isArray(suggestions) || suggestions.length === 0) return;

        const escaped = item.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escaped, 'gi');
        let localIdx = 0;

        text = text.replace(regex, (matched) => {
          const replacement = suggestions[localIdx % suggestions.length];
          localIdx += 1;
          replacedCount += 1;
          // Giữ chữ hoa đầu câu nếu cụm gốc viết hoa chữ cái đầu
          if (
            matched[0] &&
            matched[0] === matched[0].toUpperCase() &&
            matched[0] !== matched[0].toLowerCase()
          ) {
            return replacement.charAt(0).toUpperCase() + replacement.slice(1);
          }
          return replacement;
        });
      });

      if (replacedCount > 0) {
        this.controller.setOutputForMode(this.controller.activeMode, text);
        this.controller.utils.showToast(
          `✨ Đã tự động gọt và thay thế ${replacedCount} cụm từ sáo rỗng bằng miêu tả giàu hình ảnh!`,
          'success',
          4000
        );
      }

      return { replacedCount };
    }
  }

  // ==========================================================================
  // PHẦN 9: BỘ ĐỐI CHIẾU SONG SONG & ĐO ĐỘ PHONG PHÚ TỪ VỰNG TIẾNG VIỆT
  //         (Tab3SplitViewComparisonAndLexicalEngine)
  // ==========================================================================
  class Tab3SplitViewComparisonAndLexicalEngine {
    constructor(controller) {
      this.controller = controller;
    }

    /**
     * Tính toán Độ Phong Phú Từ Vựng (Lexical Diversity / Type-Token Ratio)
     * và phân bố độ dài câu của văn bản đầu ra tại Tab 3
     */
    computeLexicalRichnessProfile(rawText) {
      const text = String(rawText || this.controller.getCurrentModeText() || '').trim();
      if (!text) {
        return {
          totalWords: 0,
          uniqueWords: 0,
          lexicalDiversityRatio: 0,
          sentenceLengthDistribution: { short: 0, medium: 0, long: 0 },
          topRepeatedWords: []
        };
      }

      const tokens = text
        .toLowerCase()
        .replace(/[.,!?;:"'()[\]{}«»“”‘’—–\-…/\\]+/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 1);

      const totalWords = tokens.length;
      const freqMap = {};
      tokens.forEach((t) => {
        freqMap[t] = (freqMap[t] || 0) + 1;
      });

      const uniqueWords = Object.keys(freqMap).length;
      const lexicalDiversityRatio =
        totalWords > 0 ? Math.round((uniqueWords / totalWords) * 1000) / 10 : 0;

      // Từ dừng cơ bản trong tiếng Việt để lọc ra các từ thực sự có ý nghĩa khi thống kê từ lặp
      const stopWords = new Set([
        'những',
        'không',
        'trong',
        'được',
        'người',
        'mình',
        'chúng',
        'nhưng',
        'đang',
        'cũng',
        'rằng',
        'phải',
        'chưa',
        'cùng',
        'trên',
        'dưới',
        'ngoài',
        'giữa',
        'theo',
        'từng',
        'nhiều',
        'hơn',
        'nhất'
      ]);

      const topRepeatedWords = Object.entries(freqMap)
        .filter(([word, count]) => word.length >= 4 && count >= 3 && !stopWords.has(word))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([word, count]) => ({ word, count }));

      const sentences = text
        .split(/[.!?…]+/)
        .map((s) => s.trim())
        .filter(Boolean);

      const sentenceLengthDistribution = {
        short: 0, // < 10 từ
        medium: 0, // 10 - 25 từ
        long: 0 // > 25 từ
      };

      sentences.forEach((s) => {
        const wc = s.split(/\s+/).filter(Boolean).length;
        if (wc < 10) sentenceLengthDistribution.short += 1;
        else if (wc <= 25) sentenceLengthDistribution.medium += 1;
        else sentenceLengthDistribution.long += 1;
      });

      return {
        totalWords,
        uniqueWords,
        lexicalDiversityRatio,
        sentenceLengthDistribution,
        topRepeatedWords
      };
    }

    /**
     * Đối chiếu từng đoạn văn giữa Bản thảo đang mở ở Tab 1 và Đầu ra ở Tab 3
     * để tác giả thấy rõ những đoạn nào được mở rộng, gọt giũa hoặc viết mới
     */
    buildParagraphAlignmentBetweenManuscriptAndTab3() {
      const activeChap = this.controller.chapterMgr?.getActiveChapter?.();
      const manuscriptText = String(activeChap?.content || '').trim();
      const tab3Text = String(this.controller.getCurrentModeText() || '').trim();

      const msParas = manuscriptText
        .split(/\r?\n+/)
        .map((p) => p.trim())
        .filter(Boolean);
      const tab3Paras = tab3Text
        .split(/\r?\n+/)
        .map((p) => p.trim())
        .filter(Boolean);

      const maxLen = Math.max(msParas.length, tab3Paras.length);
      const rows = [];

      for (let i = 0; i < maxLen; i += 1) {
        const left = msParas[i] || '';
        const right = tab3Paras[i] || '';
        let status = 'MODIFIED';
        if (!left && right) status = 'ADDED_IN_TAB3';
        else if (left && !right) status = 'ONLY_IN_MANUSCRIPT';
        else if (left === right) status = 'IDENTICAL';

        rows.push({
          paragraphNumber: i + 1,
          manuscriptParagraph: left,
          tab3Paragraph: right,
          status,
          wordDelta:
            this.controller.utils.countVietnameseWords(right) -
            this.controller.utils.countVietnameseWords(left)
        });
      }

      return {
        manuscriptParagraphCount: msParas.length,
        tab3ParagraphCount: tab3Paras.length,
        rows
      };
    }

    /**
     * Tạo báo cáo tóm tắt đối chiếu văn bản dễ đọc bằng tiếng Việt
     */
    buildReadableComparisonReport() {
      const alignment = this.buildParagraphAlignmentBetweenManuscriptAndTab3();
      const lexical = this.computeLexicalRichnessProfile();

      const addedCount = alignment.rows.filter(
        (r) => r.status === 'ADDED_IN_TAB3'
      ).length;
      const modifiedCount = alignment.rows.filter(
        (r) => r.status === 'MODIFIED'
      ).length;
      const identicalCount = alignment.rows.filter(
        (r) => r.status === 'IDENTICAL'
      ).length;

      return [
        `📊 BÁO CÁO ĐỐI CHIẾU ĐẦU RA TAB 3 & BẢN THẢO HIỆN TẠI`,
        `--------------------------------------------------------------------`,
        `• Số đoạn trong Bản thảo Tab 1 : ${alignment.manuscriptParagraphCount} đoạn`,
        `• Số đoạn trong Đầu ra Tab 3   : ${alignment.tab3ParagraphCount} đoạn`,
        `• Số đoạn viết mới / mở rộng   : ${addedCount} đoạn mới, ${modifiedCount} đoạn chỉnh sửa, ${identicalCount} đoạn giữ nguyên`,
        `• Độ đa dạng từ vựng (TTR)     : ${lexical.lexicalDiversityRatio}% (${lexical.uniqueWords.toLocaleString(
          'vi-VN'
        )} từ vựng riêng biệt / ${lexical.totalWords.toLocaleString('vi-VN')} tổng từ)`,
        `• Phân bố nhịp câu             : ${lexical.sentenceLengthDistribution.short} câu ngắn • ${lexical.sentenceLengthDistribution.medium} câu vừa • ${lexical.sentenceLengthDistribution.long} câu dài`,
        lexical.topRepeatedWords.length > 0
          ? `• Các từ xuất hiện nhiều       : ${lexical.topRepeatedWords
              .slice(0, 6)
              .map((item) => `"${item.word}" (${item.count} lần)`)
              .join(', ')}`
          : `• Độ cân bằng từ ngữ           : Rất tốt, không có từ nào lặp lại bất thường.`
      ].join('\n');
    }
  }

  // ==========================================================================
  // PHẦN 10: BỘ KIỂM TRA NHẤT QUÁN GIỌNG THOẠI & XƯNG HÔ NHÂN VẬT TẠI TAB 3
  //          (Tab3VoiceAndDialogueConsistencyInspector)
  // ==========================================================================
  class Tab3VoiceAndDialogueConsistencyInspector {
    constructor(controller) {
      this.controller = controller;
    }

    /**
     * Phân tích toàn bộ các câu thoại có định dạng "- Câu thoại (Tên nhân vật)"
     * trong cửa sổ đầu ra Tab 3 để kiểm tra:
     * 1. Những nhân vật nào đang tham gia đối thoại?
     * 2. Cách xưng hô (tôi/anh/cô/ngươi/ta/cậu/tớ/em...) của từng nhân vật có nhất quán không?
     * 3. Có câu thoại nào quên ghi "(Tên nhân vật)" ở cuối dòng không?
     */
    inspectDialogueAndPronounsInCurrentOutput() {
      const raw = this.controller.getCurrentModeText();
      if (!raw.trim()) {
        return {
          totalDialogueLines: 0,
          properlyTaggedLines: 0,
          untaggedLines: [],
          characterSpeechProfiles: {}
        };
      }

      const paragraphs = raw
        .split(/\r?\n+/)
        .map((p) => p.trim())
        .filter(Boolean);

      const dialogueLines = paragraphs.filter((p) => /^[-–—]\s+/.test(p));
      const untaggedLines = [];
      const characterSpeechProfiles = {};

      const pronounCandidates = [
        'tôi',
        'ta',
        'anh',
        'em',
        'cô',
        'cậu',
        'tớ',
        'mày',
        'tao',
        'ngươi',
        'huynh',
        'muội',
        'tiểu thư',
        'ngài',
        'ông',
        'bà',
        'chú',
        'bác',
        'chị',
        'chúng ta',
        'chúng tôi'
      ];

      let properlyTaggedLines = 0;

      dialogueLines.forEach((line, idx) => {
        const match = line.match(/^[-–—]\s+(.+?)\s*\(([^)]+)\)\s*$/);
        if (!match) {
          untaggedLines.push({
            dialogueIndex: idx + 1,
            lineText: line
          });
          return;
        }

        properlyTaggedLines += 1;
        const speechBody = match[1].trim();
        const speakerName = match[2].trim();

        if (!characterSpeechProfiles[speakerName]) {
          characterSpeechProfiles[speakerName] = {
            speakerName,
            lineCount: 0,
            totalWordsSpoken: 0,
            pronounsUsed: {},
            sampleLines: []
          };
        }

        const profile = characterSpeechProfiles[speakerName];
        profile.lineCount += 1;
        const words = speechBody.split(/\s+/).filter(Boolean);
        profile.totalWordsSpoken += words.length;

        if (profile.sampleLines.length < 3) {
          profile.sampleLines.push(speechBody);
        }

        const lowerSpeech = ` ${speechBody.toLowerCase()} `;
        pronounCandidates.forEach((pr) => {
          const regex = new RegExp(`(^|[^a-zA-ZÀ-ỹ])${pr}([^a-zA-ZÀ-ỹ]|$)`, 'i');
          if (regex.test(lowerSpeech)) {
            profile.pronounsUsed[pr] = (profile.pronounsUsed[pr] || 0) + 1;
          }
        });
      });

      return {
        totalDialogueLines: dialogueLines.length,
        properlyTaggedLines,
        untaggedLines,
        characterSpeechProfiles
      };
    }

    /**
     * Tự động gán thẻ "(Chưa rõ người nói)" hoặc gợi ý tên nhân vật góc nhìn (POV)
     * cho các câu thoại bị thiếu tên người nói ở cuối câu
     */
    autoTagUntaggedDialogueLines(fallbackSpeakerName = '') {
      let text = this.controller.getCurrentModeText();
      if (!text.trim()) return { fixedCount: 0 };

      const defaultSpeaker =
        fallbackSpeakerName.trim() ||
        this.inferPrimarySpeakerFromBibleOrScene() ||
        'Nhân vật chính';

      let fixedCount = 0;
      const updatedLines = text.split('\n').map((line) => {
        const trimmed = line.trim();
        if (!/^[-–—]\s+/.test(trimmed)) return line;
        if (/\([^)]+\)\s*$/.test(trimmed)) return line;

        fixedCount += 1;
        const normalizedDash = trimmed.replace(/^[–—]\s+/, '- ');
        return `${normalizedDash} (${defaultSpeaker})`;
      });

      if (fixedCount > 0) {
        const nextText = updatedLines.join('\n');
        this.controller.setOutputForMode(this.controller.activeMode, nextText);
        this.controller.utils.showToast(
          `💬 Đã bổ sung thẻ tên nhân vật cho ${fixedCount} dòng thoại chưa gắn tên!`,
          'success'
        );
      }

      return { fixedCount, speakerApplied: defaultSpeaker };
    }

    /**
     * Suy luận tên nhân vật chính hoặc nhân vật POV hiện tại từ Mốc phân cảnh hoặc Story Bible
     */
    inferPrimarySpeakerFromBibleOrScene() {
      const markers = window.NoirStudio?.sceneBuilder?.markers || [];
      if (markers.length > 0 && markers[0].pov) {
        return String(markers[0].pov).trim();
      }
      const chars = this.controller.storyBible?.characters || [];
      if (chars.length > 0 && chars[0].name) {
        return String(chars[0].name).trim();
      }
      return 'Nhân vật chính';
    }

    /**
     * Xuất bản báo cáo kiểm tra hội thoại và xưng hô của nhân vật trong đầu ra Tab 3
     */
    buildDialogueAuditSummaryText() {
      const report = this.inspectDialogueAndPronounsInCurrentOutput();
      if (report.totalDialogueLines === 0) {
        return 'ℹ️ Văn bản đầu ra hiện tại chưa có câu thoại nào.';
      }

      const speakerEntries = Object.values(report.characterSpeechProfiles);
      const speakerLines = speakerEntries.map((sp) => {
        const pronouns = Object.entries(sp.pronounsUsed)
          .map(([k, v]) => `${k} (${v})`)
          .join(', ');
        return `  • ${sp.speakerName}: ${sp.lineCount} câu thoại (${
          sp.totalWordsSpoken
        } từ) — Xưng hô: ${pronouns || 'Tự nhiên'}`;
      });

      return [
        `💬 KIỂM TRA HỘI THOẠI & XƯNG HÔ NHÂN VẬT TẠI TAB 3:`,
        `• Tổng số dòng thoại           : ${report.totalDialogueLines} dòng`,
        `• Đạt chuẩn "- Thoại (Tên)"    : ${report.properlyTaggedLines}/${report.totalDialogueLines} dòng`,
        `• Thống kê theo nhân vật       :`,
        ...speakerLines
      ].join('\n');
    }
  }

  // ==========================================================================
  // PHẦN 11: KHỞI TẠO & XUẤT RA KHÔNG GIAN TÊN TOÀN CỤC (window.NoirStudio)
  // ==========================================================================
  window.NoirStudio.Tab3FiveModesWorkspaceController =
    Tab3FiveModesWorkspaceController;
  window.NoirStudio.Tab3OutputRevisionHistoryVault = Tab3OutputRevisionHistoryVault;
  window.NoirStudio.Tab3LiteraryQualityAndReadabilityAnalyzer =
    Tab3LiteraryQualityAndReadabilityAnalyzer;
  window.NoirStudio.Tab3SmartSelectionAndBibleBridge =
    Tab3SmartSelectionAndBibleBridge;
  window.NoirStudio.Tab3CrossModeWorkflowHelper = Tab3CrossModeWorkflowHelper;
  window.NoirStudio.Tab3ParagraphByParagraphSurgicalMerger =
    Tab3ParagraphByParagraphSurgicalMerger;
  window.NoirStudio.Tab3AntiClicheSurgicalCleaner = Tab3AntiClicheSurgicalCleaner;
  window.NoirStudio.Tab3SplitViewComparisonAndLexicalEngine =
    Tab3SplitViewComparisonAndLexicalEngine;
  window.NoirStudio.Tab3VoiceAndDialogueConsistencyInspector =
    Tab3VoiceAndDialogueConsistencyInspector;

  const tab3Controller = new Tab3FiveModesWorkspaceController(
    window.NoirStudio.idb,
    window.NoirStudio.aiDiff,
    window.NoirStudio.storyBible,
    window.NoirStudio.sysPrompts,
    window.NoirStudio.utils
  );
  tab3Controller.workflowHelper = new Tab3CrossModeWorkflowHelper(tab3Controller);
  tab3Controller.surgicalMerger = new Tab3ParagraphByParagraphSurgicalMerger(
    tab3Controller
  );
  tab3Controller.clicheCleaner = new Tab3AntiClicheSurgicalCleaner(tab3Controller);
  tab3Controller.lexicalEngine = new Tab3SplitViewComparisonAndLexicalEngine(
    tab3Controller
  );
  tab3Controller.dialogueInspector = new Tab3VoiceAndDialogueConsistencyInspector(
    tab3Controller
  );
  window.NoirStudio.tab3Controller = tab3Controller;
})();
