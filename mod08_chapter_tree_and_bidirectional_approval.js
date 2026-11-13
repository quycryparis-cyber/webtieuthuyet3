/**
 * ============================================================================
 * MODULE 08: QUẢN LÝ CÂY BẢN THẢO, CỔNG DUYỆT HAI CHIỀU (NHÁP ⇄ ĐÃ DUYỆT),
 *            ĐỒNG BỘ TIÊU ĐỀ HAI CHIỀU & PHẪU THUẬT CHƯƠNG (SẮP XẾP / NHÂN BẢN
 *            / GỘP CHƯƠNG / TÁCH CHƯƠNG TẠI CON TRỎ / THỐNG KÊ VĂN HỌC)
 * ============================================================================
 * Phiên bản: NoirStudio Modular Architecture v36.0
 * Tập tin: mod08_chapter_tree_and_bidirectional_approval.js
 * Mục tiêu:
 *   1. Cung cấp lớp `ChapterRegistryAndApprovalGate` gắn vào `window.NoirStudio.chapterManager`.
 *   2. Triển khai đầy đủ các phương thức bắt buộc:
 *      - `loadChaptersFromStorage()`
 *      - `getActiveChapter()`
 *      - `getApprovedChapters()`
 *      - `getDraftChapters()`
 *      - `syncEditorToActiveChapter()`
 *      - `loadActiveChapterIntoEditor()`
 *      - `updateLiveWordStatsUI(text)`
 *      - `selectChapter(chapterId)`
 *      - `createNewChapter(customTitle, initialContent)`
 *      - `renameChapter(chapterId, newTitle)`
 *      - `deleteChapter(chapterId)`
 *      - `renderChapterTreeAndQuickSwitcher()`
 *   3. Tương tác mượt mà với `#quick-chapter-switcher`, `#input-chapter-title`,
 *      `#active-chapter-status-badge`, `#stat-word-count`, `#stat-paragraph-count`,
 *      `#stat-reading-time`, `#chapter-tree-container`, `#count-all-chapters`,
 *      `#count-draft-chapters`, `#count-approved-chapters`, và `.chapter-filter-btn`.
 *   4. Mở rộng tính năng quản trị bản thảo chuyên nghiệp: Di chuyển thứ tự chương (Lên/Xuống),
 *      Nhân bản chương (Duplicate), Gộp 2 chương (Merge), Tách chương ngay tại vị trí con trỏ
 *      soạn thảo (Split at Cursor), Biểu đồ thống kê độ dài chương & Cổng duyệt 2 chiều.
 * ============================================================================
 */

(function () {
  'use strict';

  window.NoirStudio = window.NoirStudio || {};
  window.NoirStudio.state = window.NoirStudio.state || {
    activeScreen: 'SCREEN_1_WRITE',
    activeChapterId: null,
    chapterFilter: 'ALL',
    isSaving: false,
    isDirty: false,
    lastSavedAt: Date.now()
  };

  // ==========================================================================
  // PHẦN 1: BỘ ĐO LƯỜNG THỐNG KÊ VĂN HỌC & TIẾN ĐỘ CHƯƠNG (LITERARY METRICS)
  // ==========================================================================
  class ChapterLiteraryMetricsCalculator {
    constructor(utils) {
      this.utils = utils;
      this.defaultReadingWpm = 220; // Tốc độ đọc thầm Tiếng Việt trung bình (220 từ/phút)
      this.defaultAudiobookWpm = 145; // Tốc độ đọc diễn cảm Audiobook (145 từ/phút)
    }

    /**
     * Tính toán chi tiết các chỉ số thống kê của một văn bản chương
     */
    computeDetailedChapterStats(text, targetWords = 3500) {
      const raw = typeof text === 'string' ? text : '';
      const trimmed = raw.trim();

      if (!trimmed) {
        return {
          wordCount: 0,
          charCountWithSpaces: 0,
          charCountNoSpaces: 0,
          paragraphCount: 0,
          sentenceCount: 0,
          dialogueLineCount: 0,
          narrativeLineCount: 0,
          dialoguePercent: 0,
          readingMinutes: 1,
          audiobookMinutes: 1,
          avgWordsPerSentence: 0,
          avgWordsPerParagraph: 0,
          targetWords: Math.max(500, Number(targetWords) || 3500),
          completionPercent: 0
        };
      }

      const wordCount = this.utils.countVietnameseWords(trimmed);
      const charCountWithSpaces = trimmed.length;
      const charCountNoSpaces = trimmed.replace(/\s+/g, '').length;
      const paragraphCount = this.utils.countParagraphs(trimmed);

      const sentences = trimmed
        .split(/(?<=[.!?…])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 1);
      const sentenceCount = Math.max(1, sentences.length);

      const nonEmptyLines = trimmed
        .split(/\r?\n+/)
        .map((l) => l.trim())
        .filter(Boolean);

      let dialogueLineCount = 0;
      let narrativeLineCount = 0;
      for (const line of nonEmptyLines) {
        if (/^(?:—|–|-|“|"|«)/.test(line)) {
          dialogueLineCount++;
        } else {
          narrativeLineCount++;
        }
      }

      const dialoguePercent =
        nonEmptyLines.length > 0
          ? Math.round((dialogueLineCount / nonEmptyLines.length) * 100)
          : 0;

      const readingMinutes = Math.max(
        1,
        Math.ceil(wordCount / this.defaultReadingWpm)
      );
      const audiobookMinutes = Math.max(
        1,
        Math.ceil(wordCount / this.defaultAudiobookWpm)
      );

      const avgWordsPerSentence = Number((wordCount / sentenceCount).toFixed(1));
      const avgWordsPerParagraph =
        paragraphCount > 0 ? Number((wordCount / paragraphCount).toFixed(1)) : 0;

      const safeTarget = Math.max(500, Number(targetWords) || 3500);
      const completionPercent = Math.min(
        100,
        Math.round((wordCount / safeTarget) * 100)
      );

      return {
        wordCount,
        charCountWithSpaces,
        charCountNoSpaces,
        paragraphCount,
        sentenceCount,
        dialogueLineCount,
        narrativeLineCount,
        dialoguePercent,
        readingMinutes,
        audiobookMinutes,
        avgWordsPerSentence,
        avgWordsPerParagraph,
        targetWords: safeTarget,
        completionPercent
      };
    }

    /**
     * Tổng hợp báo cáo thống kê toàn bộ tiểu thuyết trên tất cả các chương
     */
    computeManuscriptAggregateReport(chapters = []) {
      if (!Array.isArray(chapters) || chapters.length === 0) {
        return {
          totalChapters: 0,
          approvedChapters: 0,
          draftChapters: 0,
          totalWords: 0,
          approvedWords: 0,
          draftWords: 0,
          avgChapterWords: 0,
          longestChapter: null,
          shortestChapter: null,
          estimatedTotalReadingHours: '0.0'
        };
      }

      let totalWords = 0;
      let approvedWords = 0;
      let draftWords = 0;
      let approvedChapters = 0;
      let draftChapters = 0;
      let longestChapter = null;
      let shortestChapter = null;

      for (const chap of chapters) {
        const wc =
          typeof chap.wordCount === 'number'
            ? chap.wordCount
            : this.utils.countVietnameseWords(chap.content || '');

        totalWords += wc;
        if (chap.status === 'APPROVED') {
          approvedChapters++;
          approvedWords += wc;
        } else {
          draftChapters++;
          draftWords += wc;
        }

        if (!longestChapter || wc > longestChapter.wordCount) {
          longestChapter = {
            id: chap.id,
            title: chap.displayTitle || chap.title,
            wordCount: wc
          };
        }
        if (!shortestChapter || wc < shortestChapter.wordCount) {
          shortestChapter = {
            id: chap.id,
            title: chap.displayTitle || chap.title,
            wordCount: wc
          };
        }
      }

      const avgChapterWords = Math.round(totalWords / chapters.length);
      const totalReadingMins = Math.ceil(totalWords / this.defaultReadingWpm);
      const estimatedTotalReadingHours = (totalReadingMins / 60).toFixed(1);

      return {
        totalChapters: chapters.length,
        approvedChapters,
        draftChapters,
        totalWords,
        approvedWords,
        draftWords,
        avgChapterWords,
        longestChapter,
        shortestChapter,
        totalReadingMins,
        estimatedTotalReadingHours
      };
    }
  }

  // ==========================================================================
  // PHẦN 2: ĐỘNG CƠ PHẪU THUẬT BẢN THẢO (SẮP XẾP, NHÂN BẢN, GỘP & TÁCH CHƯƠNG)
  // ==========================================================================
  class ChapterSurgeryAndReorderEngine {
    constructor(manager) {
      this.manager = manager;
    }

    /**
     * Đánh số lại thứ tự `chapterNumber` và `fileName` tuần tự từ 1 đến N
     */
    renumberAllChaptersSequential(updateTitlePrefixIfStandard = false) {
      this.manager.chapters.forEach((chap, idx) => {
        const newNum = idx + 1;
        chap.chapterNumber = newNum;
        chap.fileName = `Chuong_${newNum}.txt`;

        if (updateTitlePrefixIfStandard) {
          const currentTitle = chap.displayTitle || chap.title || '';
          const match = currentTitle.match(/^Chương\s+\d+\s*([:\-–—]\s*.*)?$/i);
          if (match) {
            const suffix = match[1] || '';
            chap.title = `Chương ${newNum}${suffix}`;
            chap.displayTitle = chap.title;
          }
        }
      });
    }

    /**
     * Di chuyển vị trí của một chương lên trên (-1) hoặc xuống dưới (+1)
     */
    async moveChapter(chapterId, directionOffset = -1) {
      this.manager.syncEditorToActiveChapter();
      const idx = this.manager.chapters.findIndex((c) => c.id === chapterId);
      if (idx === -1) return false;

      const targetIdx = idx + directionOffset;
      if (targetIdx < 0 || targetIdx >= this.manager.chapters.length) {
        this.manager.utils.showToast(
          directionOffset < 0
            ? 'ℹ️ Chương này đã ở vị trí đầu tiên của danh sách.'
            : 'ℹ️ Chương này đã ở vị trí cuối cùng của danh sách.',
          'info',
          2000
        );
        return false;
      }

      // Hoán đổi vị trí 2 chương
      const temp = this.manager.chapters[idx];
      this.manager.chapters[idx] = this.manager.chapters[targetIdx];
      this.manager.chapters[targetIdx] = temp;

      this.renumberAllChaptersSequential(false);

      // Lưu lại thứ tự mới vào IndexedDB
      await this.manager.persistAllChaptersToStorage();
      this.manager.rag.rebuildIndexFromChapters(this.manager.chapters);
      this.manager.renderChapterTreeAndQuickSwitcher();

      this.manager.utils.showToast(
        `↕️ Đã di chuyển "${temp.displayTitle || temp.title}" sang vị trí #${targetIdx + 1}!`,
        'success',
        2200
      );
      return true;
    }

    /**
     * Nhân bản (Duplicate) một chương thành bản sao ngay liền sau chương gốc
     */
    async duplicateChapter(chapterId) {
      this.manager.syncEditorToActiveChapter();
      const sourceIdx = this.manager.chapters.findIndex((c) => c.id === chapterId);
      if (sourceIdx === -1) return null;

      const source = this.manager.chapters[sourceIdx];
      const cloneTitle = `${source.displayTitle || source.title} (Bản sao)`;
      const cloneChap = {
        id: `chap_copy_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        chapterNumber: sourceIdx + 2,
        title: cloneTitle,
        displayTitle: cloneTitle,
        content: source.content || '',
        beats: source.beats || '',
        status: 'DRAFT',
        wordCount: this.manager.utils.countVietnameseWords(source.content || ''),
        summary: source.summary || this.manager.parser.buildZeroTokenSummary(source.content || ''),
        fileName: `Chuong_${sourceIdx + 2}_BanSao.txt`,
        updatedAt: Date.now()
      };

      this.manager.chapters.splice(sourceIdx + 1, 0, cloneChap);
      this.renumberAllChaptersSequential(false);

      this.manager.activeChapterId = cloneChap.id;
      window.NoirStudio.state.activeChapterId = cloneChap.id;

      await this.manager.persistAllChaptersToStorage();
      this.manager.rag.rebuildIndexFromChapters(this.manager.chapters);
      this.manager.renderChapterTreeAndQuickSwitcher();
      this.manager.loadActiveChapterIntoEditor();

      this.manager.utils.showToast(
        `📑 Đã nhân bản thành công "${cloneTitle}"!`,
        'success'
      );
      return cloneChap;
    }

    /**
     * Gộp (Merge) 2 chương lại thành 1 chương duy nhất (tự động chụp mốc phiên bản dự phòng tại Tab 6)
     */
    async mergeTwoChapters(primaryChapterId, secondaryChapterId, separator = '\n\n* * *\n\n') {
      this.manager.syncEditorToActiveChapter();
      if (!primaryChapterId || !secondaryChapterId || primaryChapterId === secondaryChapterId) {
        this.manager.utils.showToast('⚠️ Hãy chọn 2 chương khác nhau để gộp!', 'warning');
        return null;
      }

      const primary = this.manager.chapters.find((c) => c.id === primaryChapterId);
      const secondary = this.manager.chapters.find((c) => c.id === secondaryChapterId);
      if (!primary || !secondary) return null;

      // Chụp mốc phiên bản dự phòng trước khi gộp
      await window.NoirStudio.versionVault?.createSnapshot(
        `Sao lưu tự động trước khi gộp "${primary.displayTitle}" và "${secondary.displayTitle}"`,
        'MANUAL'
      );

      const combinedContent = [
        (primary.content || '').trim(),
        (secondary.content || '').trim()
      ]
        .filter(Boolean)
        .join(separator);

      const combinedBeats = [
        (primary.beats || '').trim(),
        (secondary.beats || '').trim()
      ]
        .filter(Boolean)
        .join('\n');

      primary.content = combinedContent;
      primary.beats = combinedBeats;
      primary.wordCount = this.manager.utils.countVietnameseWords(combinedContent);
      primary.summary = this.manager.parser.buildZeroTokenSummary(combinedContent);
      primary.updatedAt = Date.now();

      // Xóa chương thứ hai khỏi danh sách và IndexedDB
      this.manager.chapters = this.manager.chapters.filter(
        (c) => c.id !== secondaryChapterId
      );
      await this.manager.idb.delete(
        this.manager.getStoreName('CHAPTERS'),
        secondaryChapterId
      );

      this.renumberAllChaptersSequential(false);
      this.manager.activeChapterId = primary.id;
      window.NoirStudio.state.activeChapterId = primary.id;

      await this.manager.persistAllChaptersToStorage();
      this.manager.rag.rebuildIndexFromChapters(this.manager.chapters);
      this.manager.renderChapterTreeAndQuickSwitcher();
      this.manager.loadActiveChapterIntoEditor();

      this.manager.utils.showToast(
        `🔗 Đã gộp "${secondary.displayTitle}" vào "${primary.displayTitle}" (${primary.wordCount.toLocaleString(
          'vi-VN'
        )} từ)!`,
        'success',
        4000
      );
      return primary;
    }

    /**
     * Tách chương đang mở thành 2 chương độc lập ngay tại vị trí con trỏ chuột trong khung soạn thảo
     */
    async splitActiveChapterAtEditorCursor(customNewChapterTitle = '') {
      this.manager.syncEditorToActiveChapter();
      const activeChap = this.manager.getActiveChapter();
      const editor = document.getElementById('textarea-chapter-content');
      if (!activeChap || !editor) return null;

      const fullText = editor.value || '';
      const cursorPos =
        typeof editor.selectionStart === 'number' ? editor.selectionStart : -1;

      if (cursorPos <= 20 || cursorPos >= fullText.length - 20) {
        this.manager.utils.showToast(
          '⚠️ Hãy đặt con trỏ chuột ở vị trí giữa bản thảo (nơi bạn muốn ngắt sang chương mới) rồi bấm Tách Chương!',
          'warning',
          4200
        );
        return null;
      }

      const firstHalf = fullText.slice(0, cursorPos).trim();
      const secondHalf = fullText.slice(cursorPos).trim();

      if (!firstHalf || !secondHalf) {
        this.manager.utils.showToast(
          '⚠️ Vị trí con trỏ không có nội dung ở cả hai phía để tách chương.',
          'warning'
        );
        return null;
      }

      // Chụp mốc phiên bản dự phòng trước khi tách chương
      await window.NoirStudio.versionVault?.createSnapshot(
        `Sao lưu tự động trước khi tách chương "${activeChap.displayTitle}"`,
        'MANUAL'
      );

      // Cập nhật nửa đầu cho chương hiện tại
      activeChap.content = firstHalf;
      activeChap.wordCount = this.manager.utils.countVietnameseWords(firstHalf);
      activeChap.summary = this.manager.parser.buildZeroTokenSummary(firstHalf);
      activeChap.updatedAt = Date.now();

      // Tạo chương mới cho nửa sau ngay bên dưới chương hiện tại
      const activeIdx = this.manager.chapters.findIndex((c) => c.id === activeChap.id);
      const nextNum = activeIdx + 2;
      const newTitle =
        (customNewChapterTitle || '').trim() ||
        `Chương ${nextNum}: Phần Tiếp Theo Của ${activeChap.displayTitle || activeChap.title}`;

      const secondChap = {
        id: `chap_split_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        chapterNumber: nextNum,
        title: newTitle,
        displayTitle: newTitle,
        content: secondHalf,
        beats: '',
        status: 'DRAFT',
        wordCount: this.manager.utils.countVietnameseWords(secondHalf),
        summary: this.manager.parser.buildZeroTokenSummary(secondHalf),
        fileName: `Chuong_${nextNum}.txt`,
        updatedAt: Date.now()
      };

      this.manager.chapters.splice(activeIdx + 1, 0, secondChap);
      this.renumberAllChaptersSequential(false);

      this.manager.activeChapterId = secondChap.id;
      window.NoirStudio.state.activeChapterId = secondChap.id;

      await this.manager.persistAllChaptersToStorage();
      this.manager.rag.rebuildIndexFromChapters(this.manager.chapters);
      this.manager.renderChapterTreeAndQuickSwitcher();
      this.manager.loadActiveChapterIntoEditor();

      this.manager.utils.showToast(
        `✂️ Đã tách thành công! Nửa sau (${secondChap.wordCount.toLocaleString(
          'vi-VN'
        )} từ) đã chuyển sang "${newTitle}".`,
        'success',
        4200
      );
      return secondChap;
    }
  }

  // ==========================================================================
  // PHẦN 3: CỔNG DUYỆT HAI CHIỀU (NHÁP ⇄ ĐÃ DUYỆT) & NHẬT KÝ DUYỆT BẢN CHÍNH THỨC
  // ==========================================================================
  class BidirectionalApprovalGateController {
    constructor(manager) {
      this.manager = manager;
      this.auditStorageKey = 'noir_mod08_approval_audit_ledger_v1';
      this.auditLogs = this.loadAuditLogs();
    }

    loadAuditLogs() {
      try {
        const raw = localStorage.getItem(this.auditStorageKey);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.slice(0, 60) : [];
      } catch (_) {
        return [];
      }
    }

    saveAuditLogs() {
      try {
        localStorage.setItem(
          this.auditStorageKey,
          JSON.stringify(this.auditLogs.slice(0, 60))
        );
      } catch (_) {}
    }

    recordApprovalTransition(chap, fromStatus, toStatus, reasonNote = '') {
      if (!chap) return;
      this.auditLogs.unshift({
        id: 'audit_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
        chapterId: chap.id,
        chapterTitle: chap.displayTitle || chap.title,
        fromStatus,
        toStatus,
        wordCountAtTransition: chap.wordCount || 0,
        reasonNote:
          reasonNote ||
          (toStatus === 'APPROVED'
            ? 'Chốt duyệt làm bản chính thức'
            : 'Mở khóa về Bản nháp để chỉnh sửa tiếp'),
        timestamp: Date.now()
      });
      if (this.auditLogs.length > 60) {
        this.auditLogs = this.auditLogs.slice(0, 60);
      }
      this.saveAuditLogs();
    }

    /**
     * Đổi trạng thái hai chiều Nháp ⇄ Đã Duyệt cho một chương bất kỳ
     */
    async toggleChapterStatusBidirectional(chapterId, explicitStatus = null, silent = false) {
      const chap = this.manager.chapters.find((c) => c.id === chapterId);
      if (!chap) return null;

      if (chap.id === this.manager.activeChapterId) {
        this.manager.syncEditorToActiveChapter();
      }

      const oldStatus = chap.status === 'APPROVED' ? 'APPROVED' : 'DRAFT';
      const nextStatus =
        explicitStatus === 'APPROVED' || explicitStatus === 'DRAFT'
          ? explicitStatus
          : oldStatus === 'APPROVED'
          ? 'DRAFT'
          : 'APPROVED';

      chap.status = nextStatus;
      chap.updatedAt = Date.now();
      chap.wordCount = this.manager.utils.countVietnameseWords(chap.content || '');
      chap.summary = this.manager.parser.buildZeroTokenSummary(chap.content || '');

      if (nextStatus === 'APPROVED') {
        chap.approvedAt = Date.now();
        chap.approvedWordCount = chap.wordCount;
      }

      this.recordApprovalTransition(chap, oldStatus, nextStatus);

      // Lưu vào IndexedDB
      await this.manager.idb.set(
        this.manager.getStoreName('CHAPTERS'),
        chap.id,
        chap
      );

      // Đồng bộ xuống ổ cứng máy tính nếu đã kết nối
      if (this.manager.fs && this.manager.fs.rootHandle) {
        const targetFolder =
          nextStatus === 'APPROVED'
            ? '02_Chuong_Da_Duyet'
            : '01_Chuong_Goc_Chua_Duyet';
        await this.manager.fs.writeTextFile(
          targetFolder,
          `${chap.displayTitle || chap.title}.txt`,
          chap.content || ''
        );
      }

      // Cập nhật lại chỉ mục RAG và cây chương
      this.manager.rag.rebuildIndexFromChapters(this.manager.chapters);
      this.manager.renderChapterTreeAndQuickSwitcher();

      if (chap.id === this.manager.activeChapterId) {
        this.manager.loadActiveChapterIntoEditor();
      }

      // Khi duyệt chương trực tiếp ở Tab 2, tự động đồng bộ tích lũy Story Bible từ Chương 1 đến chương mới nhất đã duyệt
      if (!silent && nextStatus === 'APPROVED') {
        try {
          window.NoirStudio?.approvalExtractor?.syncCumulativeStoryBibleFromApprovedChapters?.({
            silent: true
          });
        } catch (_sbErr) {}
      }

      if (!silent) {
        this.manager.utils.showToast(
          nextStatus === 'APPROVED'
            ? `✅ Đã chuyển "${chap.displayTitle || chap.title}" sang Đã Duyệt!`
            : `📝 Đã chuyển "${chap.displayTitle || chap.title}" về Bản Nháp!`,
          'success'
        );
      }

      return chap;
    }

    /**
     * Chuyển hàng loạt tất cả các chương sang Đã Duyệt hoặc Bản Nháp
     */
    async batchSetAllChaptersStatus(targetStatus = 'APPROVED') {
      this.manager.syncEditorToActiveChapter();
      const validStatus = targetStatus === 'APPROVED' ? 'APPROVED' : 'DRAFT';

      for (const chap of this.manager.chapters) {
        if (chap.status !== validStatus) {
          await this.toggleChapterStatusBidirectional(chap.id, validStatus, true);
        }
      }

      this.manager.utils.showToast(
        validStatus === 'APPROVED'
          ? `✅ Đã chốt duyệt toàn bộ ${this.manager.chapters.length} chương thành Bản đã duyệt!`
          : `📝 Đã chuyển toàn bộ ${this.manager.chapters.length} chương về trạng thái Bản Nháp!`,
        'success'
      );
    }
  }

  // ==========================================================================
  // PHẦN 4: HỘP THOẠI QUẢN TRỊ BẢN THẢO NÂNG CAO (GỘP / TÁCH / BIỂU ĐỒ THỐNG KÊ)
  // ==========================================================================
  class ChapterStudioOperationsModalUI {
    constructor(manager) {
      this.manager = manager;
      this.modalId = 'noir-mod08-chapter-studio-modal';
      this.activeSubTab = 'OVERVIEW'; // 'OVERVIEW' | 'MERGE_SPLIT' | 'AUDIT_LOG'
    }

    ensureModalInDOM() {
      let modal = document.getElementById(this.modalId);
      if (modal) return modal;

      modal = document.createElement('div');
      modal.id = this.modalId;
      modal.className =
        'hidden fixed inset-0 z-[97] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 font-sansUI';
      modal.innerHTML = `
        <div class="w-full max-w-4xl rounded-3xl border border-emerald-500/40 bg-zinc-950 text-zinc-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div class="px-5 py-4 border-b border-zinc-800 bg-zinc-900/90 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 class="font-extrabold text-sm sm:text-base text-emerald-400">
                🗂️ Trung Tâm Quản Trị Cây Bản Thảo & Phẫu Thuật Chương
              </h3>
              <p id="mod08-studio-modal-subtitle" class="text-[11px] text-zinc-400 mt-0.5"></p>
            </div>
            <div class="flex items-center gap-1.5">
              <button type="button" data-mod08-tab="OVERVIEW" class="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs">
                📊 Thống Kê Độ Dài
              </button>
              <button type="button" data-mod08-tab="MERGE_SPLIT" class="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white font-bold text-xs">
                ✂️ Gộp & Tách Chương
              </button>
              <button type="button" data-mod08-tab="AUDIT_LOG" class="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white font-bold text-xs">
                📜 Nhật Ký Duyệt
              </button>
              <button type="button" id="btn-mod08-close-studio-modal" class="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-rose-600 text-zinc-300 hover:text-white font-bold text-xs ml-1">
                ✕
              </button>
            </div>
          </div>
          <div id="mod08-studio-modal-body" class="p-5 overflow-y-auto space-y-4 text-xs flex-1"></div>
        </div>
      `;

      document.body.appendChild(modal);

      modal
        .querySelector('#btn-mod08-close-studio-modal')
        ?.addEventListener('click', () => modal.classList.add('hidden'));

      modal.querySelectorAll('[data-mod08-tab]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.activeSubTab = btn.getAttribute('data-mod08-tab') || 'OVERVIEW';
          this.renderModalContent();
        });
      });

      return modal;
    }

    openStudioModal(initialTab = 'OVERVIEW') {
      this.manager.syncEditorToActiveChapter();
      this.activeSubTab = initialTab;
      const modal = this.ensureModalInDOM();
      this.renderModalContent();
      modal.classList.remove('hidden');
    }

    renderModalContent() {
      const modal = document.getElementById(this.modalId);
      if (!modal) return;

      modal.querySelectorAll('[data-mod08-tab]').forEach((btn) => {
        const tabId = btn.getAttribute('data-mod08-tab');
        btn.className =
          tabId === this.activeSubTab
            ? 'px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow'
            : 'px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white font-bold text-xs';
      });

      const report = this.manager.metricsCalc.computeManuscriptAggregateReport(
        this.manager.chapters
      );
      const subEl = modal.querySelector('#mod08-studio-modal-subtitle');
      if (subEl) {
        subEl.textContent = `Tổng cộng ${report.totalChapters} chương (${report.approvedChapters} đã duyệt, ${report.draftChapters} nháp) • ${report.totalWords.toLocaleString(
          'vi-VN'
        )} từ (~${report.estimatedTotalReadingHours} giờ đọc)`;
      }

      const bodyEl = modal.querySelector('#mod08-studio-modal-body');
      if (!bodyEl) return;

      const esc = (s) => this.manager.utils.escapeHtml(s);

      if (this.activeSubTab === 'OVERVIEW') {
        const maxW = Math.max(
          1000,
          ...this.manager.chapters.map((c) => c.wordCount || 0)
        );
        const barsHtml = this.manager.chapters
          .map((c, idx) => {
            const pct = Math.max(2, Math.round(((c.wordCount || 0) / maxW) * 100));
            const barColor =
              c.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-amber-500';
            return `
              <div class="space-y-1 p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/70">
                <div class="flex items-center justify-between gap-2">
                  <span class="font-bold text-zinc-100 truncate">${idx + 1}. ${esc(
              c.displayTitle || c.title
            )}</span>
                  <span class="font-monoCode text-zinc-300 shrink-0">${(
                    c.wordCount || 0
                  ).toLocaleString('vi-VN')} từ</span>
                </div>
                <div class="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div class="${barColor} h-full rounded-full transition-all" style="width: ${pct}%"></div>
                </div>
              </div>
            `;
          })
          .join('');

        bodyEl.innerHTML = `
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="p-3 rounded-2xl border border-zinc-800 bg-zinc-900/90">
              <div class="text-[10px] text-zinc-400 uppercase font-bold">Tổng Số Từ</div>
              <div class="text-lg font-extrabold text-emerald-400 font-monoCode mt-0.5">${report.totalWords.toLocaleString(
                'vi-VN'
              )}</div>
            </div>
            <div class="p-3 rounded-2xl border border-zinc-800 bg-zinc-900/90">
              <div class="text-[10px] text-zinc-400 uppercase font-bold">Trung Bình / Chương</div>
              <div class="text-lg font-extrabold text-amber-400 font-monoCode mt-0.5">${report.avgChapterWords.toLocaleString(
                'vi-VN'
              )}</div>
            </div>
            <div class="p-3 rounded-2xl border border-zinc-800 bg-zinc-900/90">
              <div class="text-[10px] text-zinc-400 uppercase font-bold">Số Từ Đã Duyệt</div>
              <div class="text-lg font-extrabold text-indigo-400 font-monoCode mt-0.5">${report.approvedWords.toLocaleString(
                'vi-VN'
              )}</div>
            </div>
            <div class="p-3 rounded-2xl border border-zinc-800 bg-zinc-900/90">
              <div class="text-[10px] text-zinc-400 uppercase font-bold">Thời Lượng Đọc</div>
              <div class="text-lg font-extrabold text-rose-400 font-monoCode mt-0.5">~${
                report.totalReadingMins
              } phút</div>
            </div>
          </div>

          <div class="space-y-2">
            <div class="font-extrabold uppercase text-zinc-300 text-[11px]">
              📈 Biểu Đồ Phân Bố Độ Dài Các Chương:
            </div>
            <div class="space-y-2 max-h-[46vh] overflow-y-auto pr-1">${barsHtml}</div>
          </div>
        `;
      } else if (this.activeSubTab === 'MERGE_SPLIT') {
        const chapOptions = this.manager.chapters
          .map(
            (c, i) =>
              `<option value="${esc(c.id)}">${i + 1}. ${esc(
                c.displayTitle || c.title
              )} (${(c.wordCount || 0).toLocaleString('vi-VN')} từ)</option>`
          )
          .join('');

        bodyEl.innerHTML = `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 rounded-2xl border border-indigo-500/30 bg-zinc-900/80 space-y-3">
              <h4 class="font-extrabold text-indigo-300 text-sm">🔗 Gộp 2 Chương Thành 1 Chương</h4>
              <p class="text-[11px] text-zinc-400">
                Nội dung của Chương thứ 2 sẽ được nối vào cuối Chương thứ 1 (cách nhau bởi dấu phân cảnh <code>* * *</code>). Hệ thống tự động tạo mốc sao lưu tại Tab 6 trước khi gộp.
              </p>
              <div class="space-y-2">
                <label class="block text-[11px] font-bold text-zinc-300">Chương gốc (Giữ lại):</label>
                <select id="mod08-merge-primary-select" class="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-100 text-xs">
                  ${chapOptions}
                </select>
              </div>
              <div class="space-y-2">
                <label class="block text-[11px] font-bold text-zinc-300">Chương nối thêm vào cuối:</label>
                <select id="mod08-merge-secondary-select" class="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-100 text-xs">
                  ${chapOptions}
                </select>
              </div>
              <button type="button" id="btn-mod08-exec-merge" class="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow transition">
                🔗 Thực Hiện Gộp 2 Chương Đã Chọn
              </button>
            </div>

            <div class="p-4 rounded-2xl border border-amber-500/30 bg-zinc-900/80 space-y-3">
              <h4 class="font-extrabold text-amber-300 text-sm">✂️ Tách Chương Đang Mở Tại Con Trỏ Chuột</h4>
              <p class="text-[11px] text-zinc-400">
                Đặt con trỏ chuột ở vị trí muốn ngắt trong khung soạn thảo Tab 1, nhập tiêu đề cho chương mới bên dưới rồi bấm Tách Chương.
              </p>
              <div class="space-y-2">
                <label class="block text-[11px] font-bold text-zinc-300">Tiêu đề cho Chương Mới (Nửa sau):</label>
                <input type="text" id="mod08-split-new-title" placeholder="VD: Chương kế tiếp: Bóng Tối Sau Cánh Cửa" class="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-100 text-xs" />
              </div>
              <button type="button" id="btn-mod08-exec-split-cursor" class="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow transition">
                ✂️ Tách Chương Tại Vị Trí Con Trỏ
              </button>
              <hr class="border-zinc-800 my-2" />
              <button type="button" id="btn-mod08-renumber-all" class="w-full py-2 rounded-xl bg-zinc-800 hover:bg-emerald-600 text-zinc-200 hover:text-white font-bold text-xs transition">
                🔢 Chuẩn Hóa Lại Số Thứ Tự Chương (1 ➔ ${this.manager.chapters.length})
              </button>
            </div>
          </div>
        `;

        const secSelect = bodyEl.querySelector('#mod08-merge-secondary-select');
        if (secSelect && this.manager.chapters.length > 1) {
          secSelect.selectedIndex = 1;
        }

        bodyEl
          .querySelector('#btn-mod08-exec-merge')
          ?.addEventListener('click', async () => {
            const pId = bodyEl.querySelector('#mod08-merge-primary-select')?.value;
            const sId = bodyEl.querySelector('#mod08-merge-secondary-select')?.value;
            const merged = await this.manager.surgeryEngine.mergeTwoChapters(pId, sId);
            if (merged) {
              this.renderModalContent();
            }
          });

        bodyEl
          .querySelector('#btn-mod08-exec-split-cursor')
          ?.addEventListener('click', async () => {
            const customTitle =
              bodyEl.querySelector('#mod08-split-new-title')?.value || '';
            const created =
              await this.manager.surgeryEngine.splitActiveChapterAtEditorCursor(
                customTitle
              );
            if (created) {
              modal.classList.add('hidden');
            }
          });

        bodyEl
          .querySelector('#btn-mod08-renumber-all')
          ?.addEventListener('click', async () => {
            this.manager.surgeryEngine.renumberAllChaptersSequential(true);
            await this.manager.persistAllChaptersToStorage();
            this.manager.renderChapterTreeAndQuickSwitcher();
            this.manager.loadActiveChapterIntoEditor();
            this.manager.utils.showToast(
              '🔢 Đã đánh lại số thứ tự chương chuẩn xác từ 1 đến hết!',
              'success'
            );
            this.renderModalContent();
          });
      } else {
        const logs = this.manager.approvalController.auditLogs || [];
        const logsHtml =
          logs.length > 0
            ? logs
                .map(
                  (item) => `
                  <div class="p-3 rounded-xl border border-zinc-800 bg-zinc-900/70 flex items-center justify-between gap-3">
                    <div>
                      <div class="font-bold text-zinc-100">${esc(item.chapterTitle)}</div>
                      <div class="text-[11px] text-zinc-400 mt-0.5">${esc(
                        item.reasonNote
                      )} • ${(item.wordCountAtTransition || 0).toLocaleString(
                    'vi-VN'
                  )} từ</div>
                    </div>
                    <div class="text-right shrink-0">
                      <span class="px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        item.toStatus === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/15 text-amber-300'
                      }">
                        ${item.fromStatus} ➔ ${item.toStatus}
                      </span>
                      <div class="font-monoCode text-[10px] text-zinc-500 mt-1">
                        ${this.manager.utils.formatTimestampVN(item.timestamp)}
                      </div>
                    </div>
                  </div>
                `
                )
                .join('')
            : '<div class="p-6 text-center text-zinc-500 italic">Chưa có lịch sử chuyển đổi trạng thái Nháp ⇄ Đã duyệt nào trong phiên này.</div>';

        bodyEl.innerHTML = `
          <div class="flex items-center justify-between gap-2">
            <span class="font-extrabold text-zinc-300 uppercase text-[11px]">
              📜 Lịch Sử Chuyển Đổi Trạng Thái Nháp ⇄ Bản Đã Duyệt:
            </span>
            <div class="flex items-center gap-2">
              <button type="button" id="btn-mod08-batch-approve-all" class="px-3 py-1 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] hover:bg-emerald-600 hover:text-white transition">
                ✅ Duyệt Tất Cả Chương
              </button>
              <button type="button" id="btn-mod08-batch-draft-all" class="px-3 py-1 rounded-lg bg-amber-600/20 border border-amber-500/40 text-amber-300 font-bold text-[11px] hover:bg-amber-600 hover:text-white transition">
                📝 Chuyển Tất Cả Về Nháp
              </button>
            </div>
          </div>
          <div class="space-y-2 max-h-[50vh] overflow-y-auto pr-1">${logsHtml}</div>
        `;

        bodyEl
          .querySelector('#btn-mod08-batch-approve-all')
          ?.addEventListener('click', async () => {
            await this.manager.approvalController.batchSetAllChaptersStatus('APPROVED');
            this.renderModalContent();
          });

        bodyEl
          .querySelector('#btn-mod08-batch-draft-all')
          ?.addEventListener('click', async () => {
            await this.manager.approvalController.batchSetAllChaptersStatus('DRAFT');
            this.renderModalContent();
          });
      }
    }
  }

  // ==========================================================================
  // PHẦN 5: BỘ XUẤT BẢN BẢN THẢO ĐA ĐỊNH DẠNG (.TXT, .MD, .HTML EBOOK, .JSON)
  // ==========================================================================
  class ChapterManuscriptExporter {
    constructor(manager) {
      this.manager = manager;
    }

    /**
     * Tải xuống một chương đơn lẻ dưới dạng file .txt hoặc .md
     */
    downloadSingleChapter(chapterId, format = 'txt') {
      this.manager.syncEditorToActiveChapter();
      const chap =
        this.manager.chapters.find((c) => c.id === chapterId) ||
        this.manager.getActiveChapter();
      if (!chap) return false;

      const title = chap.displayTitle || chap.title || 'Chuong_Ban_Thao';
      const safeFileName = title.replace(/[<>:"/\\|?*]+/g, '_').trim();
      let payload = '';
      let mime = 'text/plain;charset=utf-8';
      let ext = 'txt';

      if (format === 'md') {
        ext = 'md';
        mime = 'text/markdown;charset=utf-8';
        payload = [
          `# ${title}`,
          ``,
          `> Trạng thái: ${chap.status === 'APPROVED' ? 'Bản đã duyệt' : 'Bản nháp'} • Số từ: ${(
            chap.wordCount || 0
          ).toLocaleString('vi-VN')} từ`,
          ``,
          chap.content || ''
        ].join('\n');
      } else if (format === 'json') {
        ext = 'json';
        mime = 'application/json;charset=utf-8';
        payload = JSON.stringify(chap, null, 2);
      } else {
        payload = `${title}\n${'='.repeat(Math.min(68, title.length + 8))}\n\n${
          chap.content || ''
        }`;
      }

      this.triggerBrowserDownload(`${safeFileName}.${ext}`, payload, mime);
      this.manager.utils.showToast(
        `📥 Đã tải xuống chương "${title}" (.${ext.toUpperCase()})!`,
        'success'
      );
      return true;
    }

    /**
     * Xuất bản toàn bộ các chương (hoặc chỉ các chương Đã Duyệt) thành 1 cuốn sách hoàn chỉnh
     */
    exportCompiledBook(options = {}) {
      this.manager.syncEditorToActiveChapter();
      const {
        onlyApproved = false,
        format = 'txt', // 'txt' | 'md' | 'html' | 'json'
        bookTitle = 'Tieu_Thuyet_NoirStudio'
      } = options;

      const list = onlyApproved
        ? this.manager.getApprovedChapters()
        : this.manager.chapters;

      if (!list || list.length === 0) {
        this.manager.utils.showToast(
          '⚠️ Không có chương nào thỏa điều kiện để xuất bản!',
          'warning'
        );
        return false;
      }

      const totalWords = list.reduce((sum, c) => sum + (c.wordCount || 0), 0);
      const timestamp = this.manager.utils.formatTimestampVN(Date.now());

      if (format === 'json') {
        const jsonPayload = JSON.stringify(
          {
            exportedAt: Date.now(),
            totalChapters: list.length,
            totalWords,
            chapters: list
          },
          null,
          2
        );
        this.triggerBrowserDownload(
          `${bookTitle}_${list.length}_Chuong.json`,
          jsonPayload,
          'application/json;charset=utf-8'
        );
        return true;
      }

      if (format === 'html') {
        const esc = (s) => this.manager.utils.escapeHtml(s);
        const chaptersHtml = list
          .map(
            (c, idx) => `
            <article class="chapter-block" id="chap-${idx + 1}">
              <h2 class="chapter-title">${esc(c.displayTitle || c.title)}</h2>
              <div class="chapter-meta">${
                c.status === 'APPROVED' ? '✅ Đã duyệt' : '📝 Bản nháp'
              } • ${(c.wordCount || 0).toLocaleString('vi-VN')} từ</div>
              <div class="chapter-content">${esc(c.content || '')
                .split(/\r?\n\r?\n+/)
                .map((p) => `<p>${p.replace(/\r?\n/g, '<br/>')}</p>`)
                .join('\n')}</div>
            </article>
          `
          )
          .join('\n<hr class="chapter-divider"/>\n');

        const fullHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(bookTitle)} — Bản Thảo Hoàn Chỉnh (${list.length} Chương)</title>
  <style>
    body { background: #0f0f12; color: #e4e4e7; font-family: 'Georgia', 'Times New Roman', serif; line-height: 1.85; margin: 0; padding: 2rem 1rem; }
    .book-container { max-width: 760px; margin: 0 auto; background: #18181b; padding: 2.5rem; border-radius: 18px; border: 1px solid #27272a; }
    .book-header { text-align: center; border-bottom: 1px solid #27272a; padding-bottom: 1.5rem; margin-bottom: 2rem; }
    .chapter-title { color: #34d399; font-size: 1.45rem; margin-bottom: 0.25rem; }
    .chapter-meta { color: #a1a1aa; font-size: 0.8rem; font-family: sans-serif; margin-bottom: 1.25rem; }
    .chapter-content p { margin: 0 0 1.15rem 0; text-align: justify; font-size: 1.08rem; }
    .chapter-divider { border: 0; border-top: 1px dashed #3f3f46; margin: 2.5rem 0; }
  </style>
</head>
<body>
  <div class="book-container">
    <header class="book-header">
      <h1>📖 Bản Thảo Tiểu Thuyết (${list.length} Chương)</h1>
      <p>Tổng số từ: ${totalWords.toLocaleString('vi-VN')} từ • Xuất bản lúc: ${esc(timestamp)}</p>
    </header>
    ${chaptersHtml}
  </div>
</body>
</html>`;

        this.triggerBrowserDownload(
          `${bookTitle}_${list.length}_Chuong.html`,
          fullHtml,
          'text/html;charset=utf-8'
        );
        return true;
      }

      if (format === 'md') {
        const mdBody = list
          .map(
            (c) =>
              `# ${c.displayTitle || c.title}\n\n${(c.content || '').trim()}\n`
          )
          .join('\n\n---\n\n');
        this.triggerBrowserDownload(
          `${bookTitle}_${list.length}_Chuong.md`,
          mdBody,
          'text/markdown;charset=utf-8'
        );
        return true;
      }

      const txtBody = list
        .map(
          (c) =>
            `====================================================================\n${
              c.displayTitle || c.title
            } (${(c.wordCount || 0).toLocaleString(
              'vi-VN'
            )} từ)\n====================================================================\n\n${(
              c.content || ''
            ).trim()}`
        )
        .join('\n\n\n');

      this.triggerBrowserDownload(
        `${bookTitle}_${list.length}_Chuong.txt`,
        txtBody,
        'text/plain;charset=utf-8'
      );
      return true;
    }

    triggerBrowserDownload(fileName, content, mimeType) {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
  }

  // ==========================================================================
  // PHẦN 6: BỘ TÌM KIẾM TOÀN TRUYỆN & DÀN Ý BẢNG TỔNG QUAN (OUTLINE MATRIX)
  // ==========================================================================
  class ChapterGlobalSearchAndOutlineMatrix {
    constructor(manager) {
      this.manager = manager;
    }

    /**
     * Tìm kiếm tức thì một cụm từ hoặc tên nhân vật trên tất cả các chương
     * (bao gồm tiêu đề, dàn ý beats và nội dung chính).
     */
    searchAcrossManuscript(rawQuery, options = {}) {
      const q = String(rawQuery || '').trim().toLowerCase();
      if (!q) return [];
      const utils = this.manager.utils;
      const stripQ = utils && typeof utils.stripVietnameseDiacritics === 'function'
        ? utils.stripVietnameseDiacritics(q).toLowerCase()
        : q;
      const fuzzyDiacritics = Boolean(options.fuzzyDiacritics);
      const maxMatchesPerChapter = Number(options.maxMatchesPerChapter || 5);
      const results = [];

      this.manager.chapters.forEach((chap, idx) => {
        const title = String(chap.displayTitle || chap.title || `Chương ${idx + 1}`);
        const content = String(chap.content || '');
        const beats = String(chap.beats || '');
        const matches = [];

        if (title.toLowerCase().includes(q)) {
          matches.push({
            location: 'TITLE',
            label: 'Tiêu đề chương',
            snippet: title,
            charIndex: 0
          });
        }

        if (beats.toLowerCase().includes(q)) {
          const pos = beats.toLowerCase().indexOf(q);
          matches.push({
            location: 'BEATS',
            label: 'Khung Dàn ý (Beats)',
            snippet: this.buildSnippet(beats, pos, q.length),
            charIndex: pos
          });
        }

        const hay = fuzzyDiacritics && utils && typeof utils.stripVietnameseDiacritics === 'function'
          ? utils.stripVietnameseDiacritics(content).toLowerCase()
          : content.toLowerCase();
        const needle = fuzzyDiacritics ? stripQ : q;

        let cursor = 0;
        let foundInBody = 0;
        while (foundInBody < maxMatchesPerChapter) {
          const hitPos = hay.indexOf(needle, cursor);
          if (hitPos === -1) break;
          matches.push({
            location: 'CONTENT',
            label: `Bản thảo (Vị trí ký tự #${hitPos + 1})`,
            snippet: this.buildSnippet(content, hitPos, needle.length),
            charIndex: hitPos
          });
          cursor = hitPos + Math.max(1, needle.length);
          foundInBody += 1;
        }

        if (matches.length > 0) {
          results.push({
            chapterId: chap.id,
            chapterIndex: idx + 1,
            chapterTitle: title,
            status: chap.status,
            matchesCount: matches.length,
            matches
          });
        }
      });

      return results;
    }

    buildSnippet(text, index, matchLen) {
      const start = Math.max(0, index - 48);
      const end = Math.min(text.length, index + matchLen + 68);
      const prefix = start > 0 ? '…' : '';
      const suffix = end < text.length ? '…' : '';
      return `${prefix}${text.slice(start, end).replace(/\s+/g, ' ').trim()}${suffix}`;
    }

    /**
     * Tổng hợp Bảng Dàn Ý Toàn Bộ Tiểu Thuyết (Series Outline Digest)
     * phục vụ Story Bible, RAG và Chế độ AI tổng hợp liên chương.
     */
    buildSeriesOutlineMatrix() {
      return this.manager.chapters.map((chap, idx) => {
        const wc = chap.wordCount || this.manager.utils.countVietnameseWords(chap.content || '');
        const teaser =
          this.manager.utils?.keywordExtractor?.buildSmartChapterTeaser?.(chap.content || '', 160) ||
          String(chap.content || '').slice(0, 160);
        return {
          order: idx + 1,
          id: chap.id,
          title: chap.displayTitle || chap.title || `Chương ${idx + 1}`,
          status: chap.status || 'DRAFT',
          wordCount: wc,
          beats: String(chap.beats || '').trim(),
          teaser,
          updatedAt: chap.updatedAt || Date.now()
        };
      });
    }
  }

  // ==========================================================================
  // PHẦN 7: LỚP CHỦ QUẢN CÂY BẢN THẢO & CỔNG DUYỆT HAI CHIỀU
  // ==========================================================================
  class ChapterRegistryAndApprovalGate {
    constructor() {
      this.NS = window.NoirStudio;
      this.chapters = [];
      this.storageKey =
        this.NS.constants?.STORAGE_KEYS?.CHAPTERS || 'noir_studio_chapters_v35';
      this.activeIdKey =
        this.NS.constants?.STORAGE_KEYS?.ACTIVE_CHAPTER_ID || 'noir_studio_active_chapter_v35';
      this.initialized = false;
      this._suppressSyncOnce = false;
    }

    get utils() {
      return (
        this.NS.utils || {
          escapeHtml: (s) => String(s ?? '').replace(/[&<>"']/g, ''),
          countVietnameseWords: (t) =>
            String(t || '').trim() ? String(t).trim().split(/\s+/).length : 0,
          countParagraphs: (t) =>
            String(t || '').trim() ? String(t).trim().split(/\n+/).length : 0,
          estimateReadingTimeMinutes: (w) => Math.max(1, Math.ceil((w || 0) / 240)),
          formatTimestampVN: (ts) => new Date(ts || Date.now()).toLocaleString('vi-VN'),
          formatRelativeTimeVN: () => 'Vừa xong',
          showToast: () => {},
          generateId: (p) => `${p || 'id'}_${Date.now()}`
        }
      );
    }

    ensureHelpersReady() {
      if (!this.metrics) this.metrics = new ChapterLiteraryMetricsCalculator(this.utils);
      if (!this.surgery) this.surgery = new ChapterSurgeryAndReorderEngine(this);
      if (!this.approvalGate) this.approvalGate = new BidirectionalApprovalGateController(this);
      if (!this.studioModal) this.studioModal = new ChapterStudioOperationsModalUI(this);
      if (!this.exporter) this.exporter = new ChapterManuscriptExporter(this);
      if (!this.outlineMatrix) this.outlineMatrix = new ChapterGlobalSearchAndOutlineMatrix(this);
    }

    /**
     * Nạp danh sách chương từ IndexedDB hoặc LocalStorage (tương thích mọi key cũ).
     */
    async loadChaptersFromStorage() {
      this.ensureHelpersReady();
      let loaded = null;

      try {
        if (this.NS.idb && typeof this.NS.idb.getAll === 'function') {
          const storeName = this.NS.constants?.STORES?.CHAPTERS || 'chapters';
          const fromIdb = await this.NS.idb.getAll(storeName);
          if (Array.isArray(fromIdb) && fromIdb.length > 0) {
            loaded = fromIdb;
          }
        }
      } catch (_) {
        // Fallback sang LocalStorage bên dưới
      }

      if (!loaded || loaded.length === 0) {
        const candidateKeys = [
          this.storageKey,
          'noir_studio_chapters_v34',
          'noir_studio_chapters',
          'novelist_chapters_v1'
        ];
        for (let i = 0; i < candidateKeys.length; i += 1) {
          try {
            const raw = localStorage.getItem(candidateKeys[i]);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed) && parsed.length > 0) {
                loaded = parsed;
                break;
              }
            }
          } catch (_) {
            // Bỏ qua key hỏng
          }
        }
      }

      if (!loaded || loaded.length === 0) {
        const defaultId = 'chap_intro_001';
        loaded = [
          {
            id: defaultId,
            title: 'Chương 1: Khởi đầu trong màn sương',
            displayTitle: 'Chương 1: Khởi đầu trong màn sương',
            order: 0,
            status: 'DRAFT',
            content: '',
            beats: '',
            notes: '',
            wordCount: 0,
            createdAt: Date.now(),
            updatedAt: Date.now()
          }
        ];
      }

      this.chapters = loaded
        .map((c, idx) => this.normalizeChapterRecord(c, idx))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      let savedActiveId = null;
      try {
        savedActiveId = localStorage.getItem(this.activeIdKey);
      } catch (_) {
        savedActiveId = null;
      }

      const foundActive =
        this.chapters.find((c) => c.id === savedActiveId) || this.chapters[0];
      if (this.NS.state) {
        this.NS.state.activeChapterId = foundActive ? foundActive.id : null;
      }

      this.loadActiveChapterIntoEditor();
      this.renderChapterTreeAndQuickSwitcher();
      return this.chapters;
    }

    normalizeChapterRecord(raw, idx = 0) {
      const content = typeof raw?.content === 'string' ? raw.content : '';
      const title = String(raw?.displayTitle || raw?.title || `Chương ${idx + 1}`).trim();
      return {
        id: String(raw?.id || `chap_${Date.now()}_${idx}`),
        title,
        displayTitle: title,
        order: typeof raw?.order === 'number' ? raw.order : idx,
        status: raw?.status === 'APPROVED' ? 'APPROVED' : 'DRAFT',
        content,
        beats: typeof raw?.beats === 'string' ? raw.beats : '',
        notes: typeof raw?.notes === 'string' ? raw.notes : '',
        sceneMarkers: Array.isArray(raw?.sceneMarkers) ? raw.sceneMarkers : [],
        wordCount:
          typeof raw?.wordCount === 'number'
            ? raw.wordCount
            : this.utils.countVietnameseWords(content),
        createdAt: Number(raw?.createdAt) || Date.now(),
        updatedAt: Number(raw?.updatedAt) || Date.now()
      };
    }

    async persistChapters() {
      try {
        this.chapters.forEach((c, idx) => {
          c.order = idx;
          c.displayTitle = c.displayTitle || c.title;
          c.title = c.displayTitle;
          c.wordCount = this.utils.countVietnameseWords(c.content || '');
        });

        try {
          localStorage.setItem(this.storageKey, JSON.stringify(this.chapters));
          if (this.NS.state?.activeChapterId) {
            localStorage.setItem(this.activeIdKey, this.NS.state.activeChapterId);
          }
        } catch (_) {
          // Bỏ qua nếu LocalStorage đầy dung lượng (đã có IDB dự phòng)
        }

        if (this.NS.idb && typeof this.NS.idb.set === 'function') {
          const storeName = this.NS.constants?.STORES?.CHAPTERS || 'chapters';
          for (let i = 0; i < this.chapters.length; i += 1) {
            await this.NS.idb.set(storeName, this.chapters[i].id, this.chapters[i]);
          }
        }
        return true;
      } catch (_) {
        return false;
      }
    }

    getActiveChapter() {
      const activeId = this.NS.state?.activeChapterId;
      if (activeId) {
        const hit = this.chapters.find((c) => c.id === activeId);
        if (hit) return hit;
      }
      if (this.chapters.length > 0) {
        if (this.NS.state) this.NS.state.activeChapterId = this.chapters[0].id;
        return this.chapters[0];
      }
      return null;
    }

    getApprovedChapters() {
      return this.chapters.filter((c) => c.status === 'APPROVED');
    }

    getDraftChapters() {
      return this.chapters.filter((c) => c.status !== 'APPROVED');
    }

    getChapterById(id) {
      return this.chapters.find((c) => c.id === id) || null;
    }

    /**
     * Đồng bộ dữ liệu từ các ô soạn thảo trên màn hình Tab 1 vào object chương hiện tại.
     */
    syncEditorToActiveChapter() {
      if (this._suppressSyncOnce) return null;
      const chap = this.getActiveChapter();
      if (!chap || typeof document === 'undefined') return chap;

      const titleEl = document.getElementById('input-chapter-title');
      const contentEl = document.getElementById('textarea-chapter-content');
      const beatsEl = document.getElementById('textarea-chapter-beats');

      let changed = false;

      if (titleEl) {
        const nextTitle = String(titleEl.value || '').trim() || chap.displayTitle || 'Chương chưa đặt tên';
        if (nextTitle !== chap.displayTitle || nextTitle !== chap.title) {
          chap.displayTitle = nextTitle;
          chap.title = nextTitle;
          changed = true;
        }
      }

      if (contentEl && contentEl.value !== chap.content) {
        chap.content = contentEl.value;
        chap.wordCount = this.utils.countVietnameseWords(chap.content);
        changed = true;
      }

      if (beatsEl && beatsEl.value !== chap.beats) {
        chap.beats = beatsEl.value;
        changed = true;
      }

      if (changed) {
        chap.updatedAt = Date.now();
        this.updateLiveWordStatsUI(chap.content);
        this.renderQuickSwitcherOnly();
      }
      return chap;
    }

    /**
     * Nạp dữ liệu từ chương đang được chọn vào giao diện soạn thảo Tab 1.
     */
    loadActiveChapterIntoEditor() {
      const chap = this.getActiveChapter();
      if (!chap || typeof document === 'undefined') return null;

      this._suppressSyncOnce = true;
      try {
        const titleEl = document.getElementById('input-chapter-title');
        const contentEl = document.getElementById('textarea-chapter-content');
        const beatsEl = document.getElementById('textarea-chapter-beats');

        if (titleEl) titleEl.value = chap.displayTitle || chap.title || '';
        if (contentEl) contentEl.value = chap.content || '';
        if (beatsEl) beatsEl.value = chap.beats || '';

        this.updateActiveStatusBadgeUI(chap);
        this.updateLiveWordStatsUI(chap.content || '');
      } finally {
        this._suppressSyncOnce = false;
      }

      if (this.NS.sceneBuilder && typeof this.NS.sceneBuilder.renderMarkersListUI === 'function') {
        try {
          this.NS.sceneBuilder.renderMarkersListUI();
        } catch (_) {
          // Bỏ qua nếu module 13 chưa sẵn sàng
        }
      }

      if (this.NS.bus && typeof this.NS.bus.emit === 'function') {
        const evt = this.NS.constants?.EVENTS?.CHAPTER_SELECTED || 'chapter:selected';
        this.NS.bus.emit(evt, { chapterId: chap.id, chapter: chap });
      }
      return chap;
    }

    updateActiveStatusBadgeUI(chap) {
      if (typeof document === 'undefined') return;
      const badgeEl = document.getElementById('active-chapter-status-badge');
      if (!badgeEl || !chap) return;
      if (chap.status === 'APPROVED') {
        badgeEl.textContent = '✅ Đã duyệt';
        badgeEl.className =
          'text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/35 shrink-0 cursor-pointer';
      } else {
        badgeEl.textContent = '📝 Bản nháp';
        badgeEl.className =
          'text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/35 shrink-0 cursor-pointer';
      }
      badgeEl.title = 'Nhấn để đổi nhanh trạng thái Bản nháp ⇄ Đã duyệt';
    }

    updateLiveWordStatsUI(text) {
      if (typeof document === 'undefined') return;
      const wc = this.utils.countVietnameseWords(text || '');
      const pc = this.utils.countParagraphs(text || '');
      const rt = this.utils.estimateReadingTimeMinutes(wc);

      const wordEl = document.getElementById('stat-word-count');
      const paraEl = document.getElementById('stat-paragraph-count');
      const readEl = document.getElementById('stat-reading-time');

      if (wordEl) wordEl.textContent = `${wc.toLocaleString('vi-VN')} từ`;
      if (paraEl) paraEl.textContent = `${pc.toLocaleString('vi-VN')} đoạn`;
      if (readEl) readEl.textContent = `~${rt} phút đọc`;
    }

    selectChapter(chapterId) {
      this.syncEditorToActiveChapter();
      const target = this.chapters.find((c) => c.id === chapterId);
      if (!target) return null;

      if (this.NS.state) {
        this.NS.state.activeChapterId = target.id;
      }
      try {
        localStorage.setItem(this.activeIdKey, target.id);
      } catch (_) {
        // Bỏ qua
      }

      this.loadActiveChapterIntoEditor();
      this.renderChapterTreeAndQuickSwitcher();
      return target;
    }

    createNewChapter(customTitle = '', initialContent = '') {
      this.syncEditorToActiveChapter();
      const nextNum = this.chapters.length + 1;
      const title = String(customTitle || '').trim() || `Chương ${nextNum}: Chương mới`;
      const newChap = this.normalizeChapterRecord(
        {
          id: `chap_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          title,
          displayTitle: title,
          order: this.chapters.length,
          status: 'DRAFT',
          content: String(initialContent || ''),
          beats: '',
          notes: '',
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        this.chapters.length
      );

      this.chapters.push(newChap);
      if (this.NS.state) {
        this.NS.state.activeChapterId = newChap.id;
      }
      this.loadActiveChapterIntoEditor();
      this.renderChapterTreeAndQuickSwitcher();
      this.persistChapters();

      this.utils.showToast(`🌱 Đã tạo "${newChap.displayTitle}" và chuyển tới trình soạn thảo!`, 'success');
      return newChap;
    }

    renameChapter(chapterId, newTitle) {
      const chap = this.chapters.find((c) => c.id === chapterId);
      if (!chap) return false;
      const cleaned = String(newTitle || '').trim();
      if (!cleaned) return false;

      chap.displayTitle = cleaned;
      chap.title = cleaned;
      chap.updatedAt = Date.now();

      if (this.NS.state?.activeChapterId === chap.id) {
        const titleEl = document.getElementById('input-chapter-title');
        if (titleEl && titleEl.value !== cleaned) {
          titleEl.value = cleaned;
        }
      }

      this.renderChapterTreeAndQuickSwitcher();
      this.persistChapters();
      return true;
    }

    async deleteChapter(chapterId) {
      if (this.chapters.length <= 1) {
        this.utils.showToast('⚠️ Bạn cần giữ lại ít nhất 1 chương trong dự án truyện!', 'warning');
        return false;
      }
      const idx = this.chapters.findIndex((c) => c.id === chapterId);
      if (idx === -1) return false;

      const target = this.chapters[idx];
      let confirmed = true;
      if (typeof this.NS.confirmDialog === 'function') {
        confirmed = await this.NS.confirmDialog({
          title: 'Xóa chương khỏi bản thảo?',
          message: `Bạn có chắc muốn xóa "${target.displayTitle}" (${(target.wordCount || 0).toLocaleString('vi-VN')} từ)?\nHệ thống vẫn có bản chụp an toàn trong Kho Phiên Bản Tab 6 nếu bạn muốn khôi phục sau.`,
          confirmLabel: 'Xóa chương này',
          cancelLabel: 'Giữ lại',
          danger: true
        });
      }
      if (!confirmed) return false;

      if (this.NS.versionVault && typeof this.NS.versionVault.createSnapshot === 'function') {
        try {
          this.NS.versionVault.createSnapshot(`Trước khi xóa: ${target.displayTitle}`, 'PRE_DELETE');
        } catch (_) {
          // Bỏ qua
        }
      }

      this.chapters.splice(idx, 1);
      try {
        if (this.NS.idb && typeof this.NS.idb.delete === 'function') {
          await this.NS.idb.delete(this.NS.constants?.STORES?.CHAPTERS || 'chapters', target.id);
        }
      } catch (_) {
        // Bỏ qua
      }

      if (this.NS.state?.activeChapterId === target.id) {
        const nextChap = this.chapters[Math.min(idx, this.chapters.length - 1)] || this.chapters[0];
        this.NS.state.activeChapterId = nextChap ? nextChap.id : null;
        this.loadActiveChapterIntoEditor();
      }

      this.renderChapterTreeAndQuickSwitcher();
      await this.persistChapters();
      this.utils.showToast(`🗑️ Đã xóa "${target.displayTitle}".`, 'info');
      return true;
    }

    toggleChapterApprovalStatus(chapterId) {
      const chap = this.chapters.find((c) => c.id === chapterId) || this.getActiveChapter();
      if (!chap) return null;
      const nextStatus = chap.status === 'APPROVED' ? 'DRAFT' : 'APPROVED';
      chap.status = nextStatus;
      chap.updatedAt = Date.now();

      if (this.NS.state?.activeChapterId === chap.id) {
        this.updateActiveStatusBadgeUI(chap);
      }
      this.renderChapterTreeAndQuickSwitcher();
      this.persistChapters();

      const msg =
        nextStatus === 'APPROVED'
          ? `✅ Đã đưa "${chap.displayTitle}" vào danh sách Đã duyệt!`
          : `📝 Đã chuyển "${chap.displayTitle}" về lại trạng thái Bản nháp.`;
      this.utils.showToast(msg, 'success');
      return chap;
    }

    renderQuickSwitcherOnly() {
      if (typeof document === 'undefined') return;
      const switcher = document.getElementById('quick-chapter-switcher');
      if (!switcher) return;
      const activeId = this.NS.state?.activeChapterId;
      const esc = (s) => this.utils.escapeHtml(s);
      switcher.innerHTML = this.chapters
        .map((c) => {
          const badge = c.status === 'APPROVED' ? '✅' : '📝';
          const selected = c.id === activeId ? 'selected' : '';
          return `<option value="${esc(c.id)}" ${selected}>${badge} ${esc(c.displayTitle)} (${(c.wordCount || 0).toLocaleString('vi-VN')} từ)</option>`;
        })
        .join('');
    }

    renderChapterTreeAndQuickSwitcher() {
      if (typeof document === 'undefined') return;
      this.ensureHelpersReady();
      this.renderQuickSwitcherOnly();

      const allCount = this.chapters.length;
      const draftCount = this.getDraftChapters().length;
      const approvedCount = this.getApprovedChapters().length;

      const cAllEl = document.getElementById('count-all-chapters');
      const cDraftEl = document.getElementById('count-draft-chapters');
      const cAppEl = document.getElementById('count-approved-chapters');
      if (cAllEl) cAllEl.textContent = String(allCount);
      if (cDraftEl) cDraftEl.textContent = String(draftCount);
      if (cAppEl) cAppEl.textContent = String(approvedCount);

      const filter = this.NS.state?.chapterFilter || 'ALL';
      document.querySelectorAll('.chapter-filter-btn').forEach((btn) => {
        const mode =
          btn.getAttribute('data-chapter-filter') || btn.getAttribute('data-filter') || 'ALL';
        const isSelected = mode === filter;
        btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
        if (isSelected) {
          btn.classList.add('bg-emerald-600', 'text-white', 'shadow-sm');
          btn.classList.remove('text-zinc-400', 'hover:text-white', 'bg-emerald-500/20', 'text-emerald-300', 'border-emerald-500/40');
        } else {
          btn.classList.remove('bg-emerald-600', 'text-white', 'shadow-sm', 'bg-emerald-500/20', 'text-emerald-300', 'border-emerald-500/40');
          btn.classList.add('text-zinc-400', 'hover:text-white');
        }
      });

      const treeContainer = document.getElementById('chapter-tree-container');
      if (!treeContainer) return;

      const filtered = this.chapters.filter((c) => {
        if (filter === 'APPROVED') return c.status === 'APPROVED';
        if (filter === 'DRAFT') return c.status !== 'APPROVED';
        return true;
      });

      if (filtered.length === 0) {
        const emptyMsg =
          filter === 'DRAFT'
            ? 'Hiện không có chương Bản nháp nào (tất cả chương đã được duyệt).'
            : filter === 'APPROVED'
            ? 'Chưa có chương nào ở trạng thái Đã duyệt chính thức.'
            : 'Chưa có chương nào trong bộ lọc hiện tại.';
        treeContainer.innerHTML = `
          <div class="p-4 text-center rounded-xl border border-dashed border-zinc-800 text-xs text-zinc-400">
            ${emptyMsg}
          </div>
        `;
        return;
      }

      const activeId = this.NS.state?.activeChapterId;
      const esc = (s) => this.utils.escapeHtml(s);

      treeContainer.innerHTML = filtered
        .map((chap, displayIdx) => {
          const isActive = chap.id === activeId;
          const isApproved = chap.status === 'APPROVED';
          const borderCls = isActive
            ? 'border-emerald-500/60 bg-emerald-500/10 shadow-lg shadow-emerald-950/30'
            : 'border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-800/70 hover:border-zinc-700';

          return `
            <div data-chap-card="${esc(chap.id)}" class="group rounded-xl border p-2.5 transition cursor-pointer ${borderCls}">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0 flex-1" data-action="select-chap" data-chap-id="${esc(chap.id)}">
                  <div class="flex items-center gap-1.5">
                    <span class="text-[10px] font-mono text-zinc-500 shrink-0">#${displayIdx + 1}</span>
                    <span class="text-xs font-bold truncate ${isActive ? 'text-emerald-200' : 'text-zinc-200'}">${esc(chap.displayTitle)}</span>
                  </div>
                  <div class="flex items-center gap-2 mt-1 text-[10px] text-zinc-400">
                    <span class="${isApproved ? 'text-emerald-400' : 'text-amber-400'} font-semibold">${isApproved ? '✅ Đã duyệt' : '📝 Nháp'}</span>
                    <span>•</span>
                    <span>${(chap.wordCount || 0).toLocaleString('vi-VN')} từ</span>
                  </div>
                </div>
                <div class="flex items-center gap-1 opacity-75 group-hover:opacity-100 shrink-0">
                  <button type="button" data-action="toggle-status" data-chap-id="${esc(chap.id)}" title="${isApproved ? 'Chuyển về Bản nháp' : 'Duyệt thành bản chính thức'}" class="p-1 rounded-lg hover:bg-zinc-700/80 text-[11px]">${isApproved ? '↩️' : '✅'}</button>
                  <button type="button" data-action="move-up" data-chap-id="${esc(chap.id)}" title="Đưa lên trên" class="p-1 rounded-lg hover:bg-zinc-700/80 text-[11px]">▲</button>
                  <button type="button" data-action="delete-chap" data-chap-id="${esc(chap.id)}" title="Xóa chương này" class="p-1 rounded-lg hover:bg-rose-500/20 text-rose-400 text-[11px]">🗑️</button>
                </div>
              </div>
            </div>
          `;
        })
        .join('');

      treeContainer.querySelectorAll('[data-action="select-chap"]').forEach((el) => {
        el.addEventListener('click', () => {
          this.selectChapter(el.getAttribute('data-chap-id'));
        });
      });

      treeContainer.querySelectorAll('[data-action="toggle-status"]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleChapterApprovalStatus(btn.getAttribute('data-chap-id'));
        });
      });

      treeContainer.querySelectorAll('[data-action="move-up"]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const cid = btn.getAttribute('data-chap-id');
          if (this.surgery && typeof this.surgery.moveChapter === 'function') {
            this.surgery.moveChapter(cid, -1);
          }
        });
      });

      treeContainer.querySelectorAll('[data-action="delete-chap"]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.deleteChapter(btn.getAttribute('data-chap-id'));
        });
      });
    }

    bindDomEvents() {
      if (typeof document === 'undefined') return;
      const bind = (id, evt, handler) => {
        const el = document.getElementById(id);
        if (!el || el.dataset[`noirMod08_${evt}`]) return;
        el.dataset[`noirMod08_${evt}`] = '1';
        el.addEventListener(evt, handler);
      };

      bind('btn-new-draft-chapter', 'click', () => this.createNewChapter());
      bind('btn-tab1-quick-new-chapter', 'click', (e) => {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        const created = this.createNewChapter();
        if (created) {
          const titleInput = document.getElementById('input-chapter-title');
          if (titleInput) {
            titleInput.focus();
            try { titleInput.select(); } catch (_e) {}
          }
          this.utils.showToast(
            `✨ Đã tạo "${created.displayTitle || 'Chương mới'}"! Bạn có thể bắt đầu gõ ngay tại Bàn Viết Truyện.`,
            'success',
            3200
          );
        }
      });

      bind('quick-chapter-switcher', 'change', (e) => {
        this.selectChapter(e.target.value);
      });

      bind('input-chapter-title', 'input', (e) => {
        const chap = this.getActiveChapter();
        if (!chap || this._suppressSyncOnce) return;
        const val = String(e.target.value || '').trim();
        chap.displayTitle = val || 'Chương chưa đặt tên';
        chap.title = chap.displayTitle;
        chap.updatedAt = Date.now();
        this.renderQuickSwitcherOnly();
        if (this.NS.autoSaver?.scheduleDebouncedSave) {
          this.NS.autoSaver.scheduleDebouncedSave(800);
        }
      });

      bind('textarea-chapter-content', 'input', (e) => {
        if (this._suppressSyncOnce) return;
        const chap = this.getActiveChapter();
        if (chap) {
          chap.content = e.target.value;
          chap.wordCount = this.utils.countVietnameseWords(chap.content);
          chap.updatedAt = Date.now();
          this.updateLiveWordStatsUI(chap.content);
        }
        if (this.NS.autoSaver?.scheduleDebouncedSave) {
          this.NS.autoSaver.scheduleDebouncedSave(900);
        }
      });

      bind('textarea-chapter-beats', 'input', (e) => {
        if (this._suppressSyncOnce) return;
        const chap = this.getActiveChapter();
        if (chap) {
          chap.beats = e.target.value;
          chap.updatedAt = Date.now();
        }
        if (this.NS.autoSaver?.scheduleDebouncedSave) {
          this.NS.autoSaver.scheduleDebouncedSave(900);
        }
      });

      bind('active-chapter-status-badge', 'click', () => {
        const chap = this.getActiveChapter();
        if (chap) this.toggleChapterApprovalStatus(chap.id);
      });

      document.querySelectorAll('.chapter-filter-btn').forEach((btn) => {
        if (btn.dataset.noirMod08FilterBound) return;
        btn.dataset.noirMod08FilterBound = '1';
        btn.addEventListener('click', () => {
          if (this.NS.state) {
            this.NS.state.chapterFilter =
              btn.getAttribute('data-chapter-filter') || btn.getAttribute('data-filter') || 'ALL';
          }
          this.renderChapterTreeAndQuickSwitcher();
        });
      });

      bind('btn-open-chapter-studio-ops', 'click', () => {
        this.ensureHelpersReady();
        if (this.studioModal && typeof this.studioModal.openModal === 'function') {
          this.studioModal.openModal();
        }
      });
    }

    async init() {
      if (this.initialized) return this;
      this.initialized = true;
      this.ensureHelpersReady();
      this.bindDomEvents();
      await this.loadChaptersFromStorage();
      return this;
    }
  }

  // ==========================================================================
  // PHẦN 8: KIỂM TOÁN CÂN BẰNG ĐỘ DÀI CHƯƠNG & TIẾN ĐỘ TOÀN BỘ TẬP TRUYỆN
  // ==========================================================================
  class ChapterBookBalanceAndTitleAuditor {
    constructor(manager) {
      this.manager = manager;
    }

    auditManuscriptPacingAndTitles() {
      const list = Array.isArray(this.manager.chapters) ? this.manager.chapters : [];
      if (list.length === 0) {
        return {
          totalChapters: 0,
          totalWords: 0,
          avgWordsPerChapter: 0,
          genericTitleIds: [],
          shortChapterIds: [],
          longChapterIds: [],
          advice: ['Hãy tạo chương đầu tiên để bắt đầu kiểm toán bố cục tập truyện.']
        };
      }

      const wordCounts = list.map((c) => c.wordCount || this.manager.utils.countVietnameseWords(c.content || ''));
      const totalWords = wordCounts.reduce((a, b) => a + b, 0);
      const nonEmptyCounts = wordCounts.filter((w) => w > 0);
      const avgWordsPerChapter =
        nonEmptyCounts.length > 0
          ? Math.round(nonEmptyCounts.reduce((a, b) => a + b, 0) / nonEmptyCounts.length)
          : 0;

      const genericTitleIds = [];
      const shortChapterIds = [];
      const longChapterIds = [];

      list.forEach((chap, idx) => {
        const wc = wordCounts[idx];
        const title = String(chap.displayTitle || chap.title || '').trim();
        if (/^(chương mới|untitled|chương \d+\s*:?\s*chương mới|bản nháp)/i.test(title)) {
          genericTitleIds.push(chap.id);
        }
        if (wc > 0 && avgWordsPerChapter >= 800 && wc < avgWordsPerChapter * 0.45) {
          shortChapterIds.push({ id: chap.id, title, wordCount: wc });
        }
        if (wc > 0 && avgWordsPerChapter >= 800 && wc > avgWordsPerChapter * 2.15) {
          longChapterIds.push({ id: chap.id, title, wordCount: wc });
        }
      });

      const advice = [];
      if (genericTitleIds.length > 0) {
        advice.push(
          `Có ${genericTitleIds.length} chương vẫn đang để tiêu đề tạm ("Chương mới"). Hãy đặt tên giàu gợi hình để độc giả dễ nhớ.`
        );
      }
      if (shortChapterIds.length > 0) {
        advice.push(
          `${shortChapterIds.length} chương ngắn bất thường dưới 45% độ dài trung bình (~${avgWordsPerChapter} từ/chương): cân nhắc gộp hoặc bồi đắp thêm cảnh tâm lý.`
        );
      }
      if (longChapterIds.length > 0) {
        advice.push(
          `${longChapterIds.length} chương rất dài (> 215% trung bình): có thể dùng công cụ Tách Chương Tại Con Trỏ để chia nhịp đọc nhẹ nhàng hơn.`
        );
      }
      if (advice.length === 0) {
        advice.push(`Bố cục ${list.length} chương cân đối (${totalWords.toLocaleString('vi-VN')} từ tổng cộng, trung bình ${avgWordsPerChapter.toLocaleString('vi-VN')} từ/chương).`);
      }

      return {
        totalChapters: list.length,
        totalWords,
        avgWordsPerChapter,
        genericTitleIds,
        shortChapterIds,
        longChapterIds,
        advice
      };
    }

    getFormattedSummaryText() {
      const report = this.auditManuscriptPacingAndTitles();
      return [
        `📚 TỔNG QUAN BỐ CỤC: ${report.totalChapters} chương • ${report.totalWords.toLocaleString('vi-VN')} từ`,
        `⚖️ Độ dài trung bình: ${report.avgWordsPerChapter.toLocaleString('vi-VN')} từ/chương`,
        ...report.advice.map((line) => `• ${line}`)
      ].join('\n');
    }
  }

  const chapterManager = new ChapterRegistryAndApprovalGate();
  chapterManager.bookAuditor = new ChapterBookBalanceAndTitleAuditor(chapterManager);
  window.NoirStudio.ChapterBookBalanceAndTitleAuditor = ChapterBookBalanceAndTitleAuditor;
  window.NoirStudio.ChapterLiteraryMetricsCalculator = ChapterLiteraryMetricsCalculator;
  window.NoirStudio.ChapterSurgeryAndReorderEngine = ChapterSurgeryAndReorderEngine;
  window.NoirStudio.BidirectionalApprovalGateController = BidirectionalApprovalGateController;
  window.NoirStudio.ChapterStudioOperationsModalUI = ChapterStudioOperationsModalUI;
  window.NoirStudio.ChapterManuscriptExporter = ChapterManuscriptExporter;
  window.NoirStudio.ChapterGlobalSearchAndOutlineMatrix = ChapterGlobalSearchAndOutlineMatrix;
  window.NoirStudio.ChapterRegistryAndApprovalGate = ChapterRegistryAndApprovalGate;
  window.NoirStudio.chapterManager = chapterManager;
  window.NoirStudio.chapterTree = chapterManager;

  if (typeof window.NoirStudio.registerModule === 'function') {
    window.NoirStudio.registerModule('mod08', chapterManager);
  }
})();
