/**
 * ============================================================================
 * MODULE 10: VERSION TIME-MACHINE VAULT & INTERACTIVE STATE PREVIEW (TAB 6)
 * ============================================================================
 * Phiên bản: v38.0.0-SUPREME-MODULAR (2026)
 * Tệp: mod10_version_time_machine_and_live_preview.js
 * Nhiệm vụ:
 *   1. Ghi nhận liên tục & tự động các Phiên bản toàn diện của ứng dụng
 *      (Chương đang mở, Toàn bộ cây chương, Story Bible, Mốc phân cảnh,
 *      Bảng nháp ý tưởng, Sổ cái phục bút) mỗi khi lưu bản thảo hoặc trước
 *      các thao tác thay đổi lớn (AI chèn/thay thế, xóa chương, khôi phục).
 *   2. Hiển thị danh sách phiên bản trực quan trong Tab 6 (`#tab6-version-history-vault`)
 *      kèm bộ đếm, lọc loại mốc, xem trước tức thì (`#version-preview-content-box`).
 *   3. Vận hành Cửa Sổ Xem Trước Trạng Thái Cũ Toàn Màn Hình
 *      (`#modal-fullscreen-version-preview`) mô phỏng lại 4 góc nhìn của dự án
 *      tại thời điểm cũ (`MANUSCRIPT`, `ALL_CHAPTERS`, `STORY_BIBLE`, `DIFF_COMPARE`
 *      so sánh trực quan từng dòng với bản hiện tại).
 *   4. Khôi phục an toàn 1 chạm về bất kỳ phiên bản nào (`restoreSelectedVersion`)
 *      và tự động chụp 1 bản bảo vệ trước khi quay ngược thời gian.
 * ============================================================================
 */

(function initNoirStudioVersionTimeMachineModule(globalScope) {
  'use strict';

  const root = globalScope || (typeof window !== 'undefined' ? window : globalThis);
  root.NoirStudio = root.NoirStudio || {};
  const NS = root.NoirStudio;

  // ==========================================================================
  // PHẦN 1: CẤU HÌNH LOẠI PHIÊN BẢN, TÍNH FINGERPRINT & CHÍNH SÁCH LƯU GIỮ THÔNG MINH
  // ==========================================================================

  const VERSION_SNAPSHOT_TYPES = Object.freeze({
    AUTO_CONTINUOUS: {
      code: 'AUTO_CONTINUOUS',
      label: 'Tự động lưu',
      icon: '🕒',
      priority: 1,
      badgeClass: 'bg-zinc-800 text-zinc-300 border-zinc-700'
    },
    MANUAL_BOOKMARK: {
      code: 'MANUAL_BOOKMARK',
      label: 'Đánh dấu tay',
      icon: '🔖',
      priority: 5,
      badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
    },
    PRE_AI_APPLY: {
      code: 'PRE_AI_APPLY',
      label: 'Trước khi AI sửa',
      icon: '🤖',
      priority: 4,
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    },
    PRE_RESTORE: {
      code: 'PRE_RESTORE',
      label: 'Bảo vệ trước khôi phục',
      icon: '🛡️',
      priority: 5,
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    },
    PRE_DELETE: {
      code: 'PRE_DELETE',
      label: 'Trước khi xóa chương',
      icon: '⚠️',
      priority: 5,
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
    },
    CHAPTER_APPROVED: {
      code: 'CHAPTER_APPROVED',
      label: 'Mốc Duyệt Bản Chính',
      icon: '✅',
      priority: 5,
      badgeClass: 'bg-emerald-600/25 text-emerald-200 border-emerald-500/50'
    },
    PRE_DISK_MERGE: {
      code: 'PRE_DISK_MERGE',
      label: 'Trước gộp từ ổ đĩa',
      icon: '📂',
      priority: 4,
      badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40'
    },
    PRE_BACKUP_IMPORT: {
      code: 'PRE_BACKUP_IMPORT',
      label: 'Trước nhập file backup',
      icon: '📦',
      priority: 5,
      badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
    }
  });

  const AUTO_SNAPSHOT_MIN_INTERVAL_MS = 30000; // Chụp liên tục mỗi >= 30 giây nếu có đổi chữ
  const AUTO_SNAPSHOT_MIN_WORD_DELTA = 18; // Hoặc ngay lập tức nếu thêm/sửa >= 18 từ
  const MAX_STORED_VERSIONS_IDB = 75;
  const MAX_MIRRORED_LS_VERSIONS = 30;

  class VersionSnapshotFingerprintEngine {
    computeTextHash(str) {
      const s = String(str || '');
      let h = 0x811c9dc5;
      for (let i = 0; i < s.length; i += 1) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
      }
      return (h >>> 0).toString(16);
    }

    computeWorkspaceFingerprint(statePayload) {
      if (!statePayload) return '';
      const chapDigest = (statePayload.chapters || [])
        .map((c) => `${c.id}:${c.status}:${c.displayTitle}:${(c.content || '').length}:${this.computeTextHash(c.content)}`)
        .join('|');
      const bibleDigest = this.computeTextHash(statePayload.storyBibleContent || '');
      const charsDigest = this.computeTextHash(JSON.stringify(statePayload.characters || []));
      return `${chapDigest}##${bibleDigest}##${charsDigest}`;
    }

    deepCloneSafe(obj) {
      try {
        return JSON.parse(JSON.stringify(obj));
      } catch (_) {
        return obj;
      }
    }
  }

  class SmartVersionRetentionPolicy {
    /**
     * Sắp xếp và cắt tỉa thông minh khi tổng số bản chụp vượt quá `MAX_STORED_VERSIONS_IDB`:
     * Giữ nguyên tối đa các bản Thủ công / Trước khôi phục / Duyệt bản chính (priority >= 4),
     * chỉ dọn bớt các bản Auto cũ nhất theo nguyên tắc thưa dần theo thời gian.
     */
    pruneOverflowSnapshots(versionsList, maxLimit = MAX_STORED_VERSIONS_IDB) {
      const list = Array.isArray(versionsList) ? [...versionsList] : [];
      if (list.length <= maxLimit) return list;

      // Giữ luôn 12 bản mới nhất bất kể loại nào
      const newestProtectedCount = 12;
      const head = list.slice(0, newestProtectedCount);
      const tail = list.slice(newestProtectedCount);

      const importantOld = [];
      const autoOld = [];

      tail.forEach((v) => {
        const meta = VERSION_SNAPSHOT_TYPES[v.type] || VERSION_SNAPSHOT_TYPES.AUTO_CONTINUOUS;
        if (meta.priority >= 4) {
          importantOld.push(v);
        } else {
          autoOld.push(v);
        }
      });

      const budgetLeft = Math.max(0, maxLimit - head.length);
      const keptImportant = importantOld.slice(0, Math.floor(budgetLeft * 0.65));
      const keptAutoBudget = Math.max(0, budgetLeft - keptImportant.length);

      // Lấy đều đặn theo khoảng cách trên autoOld để giữ rải suốt dòng thời gian dài
      const sampledAuto = [];
      if (keptAutoBudget > 0 && autoOld.length > 0) {
        const step = Math.max(1, autoOld.length / keptAutoBudget);
        for (let i = 0; i < keptAutoBudget && Math.floor(i * step) < autoOld.length; i += 1) {
          sampledAuto.push(autoOld[Math.floor(i * step)]);
        }
      }

      return [...head, ...keptImportant, ...sampledAuto].sort(
        (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
      );
    }
  }

  // ==========================================================================
  // PHẦN 2: BỘ THU THẬP & ĐÓNG GÓI TRẠNG THÁI ỨNG DỤNG (STATE SNAPSHOTTER)
  // ==========================================================================

  class FullApplicationStateCapture {
    constructor(fingerprintEngine) {
      this.NS = window.NoirStudio;
      this.fp = fingerprintEngine;
    }

    /**
     * Chụp toàn bộ ảnh trạng thái sống của ứng dụng tại thời điểm gọi:
     * Chương đang mở, toàn bộ danh sách chương, Story Bible, Nhân vật,
     * Ma trận Ai biết gì, Sổ cái phục bút, Mốc phân cảnh, Ý tưởng nhanh, Cấu hình hiển thị.
     */
    captureCurrentWorkspaceState() {
      const cm = this.NS.chapterManager;
      if (cm && typeof cm.syncEditorToActiveChapter === 'function') {
        cm.syncEditorToActiveChapter();
      }

      const chapters = this.fp.deepCloneSafe(cm?.chapters || []);
      const activeChapterId =
        this.NS.state?.activeChapterId || chapters[0]?.id || null;
      const activeChap = chapters.find((c) => c.id === activeChapterId) || chapters[0] || null;

      let totalWords = 0;
      let approvedCount = 0;
      chapters.forEach((c) => {
        const wc =
          Number(c.wordCount) ||
          this.NS.utils?.countVietnameseWords?.(c.content || '') ||
          0;
        totalWords += wc;
        if (c.status === 'APPROVED') approvedCount += 1;
      });

      const keys = this.NS.constants?.STORAGE_KEYS || {};
      const storyBibleContent =
        localStorage.getItem(keys.BIBLE_RENDERED || 'noir_s10_rendered_bible_content') || '';
      const bibleTemplateFrame =
        localStorage.getItem(keys.BIBLE_TEMPLATE || 'noir_s10_bible_template_frame') || '';
      const characters = this.NS.idb?.getLocalJSON?.(
        keys.CHARACTERS || 'noir_s10_character_profiles_v1',
        []
      );
      const knowledgeMatrix = this.NS.idb?.getLocalJSON?.(
        keys.KNOWLEDGE_MATRIX || 'noir_s10_knowledge_matrix_v1',
        []
      );
      const cluesLedger = this.NS.idb?.getLocalJSON?.(
        keys.CLUES_LEDGER || 'noir_s10_clues_ledger_v1',
        []
      );
      const sceneMarkersByChapter = this.NS.idb?.getLocalJSON?.(
        keys.SCENE_MARKERS || 'noir_s18_scene_pov_markers_v1',
        {}
      );
      const scratchpadNotes =
        localStorage.getItem(keys.SCRATCHPAD || 'noir_quick_scratchpad_notes') || '';

      const uiSnapshot = {
        activeScreen: this.NS.state?.activeScreen || 'SCREEN_1_WRITE',
        selectedModel: localStorage.getItem(keys.SELECTED_MODEL || 'noir_selected_gemini_model') || '',
        fontFamily: localStorage.getItem(keys.FONT_FAMILY || 'noir_editor_font_family') || '',
        fontSize: localStorage.getItem(keys.FONT_SIZE || 'noir_editor_font_size') || '',
        theme: localStorage.getItem(keys.THEME || 'noir_studio_theme_mode') || 'dark'
      };

      const statePayload = {
        activeChapterId,
        activeChapterTitle: activeChap?.displayTitle || activeChap?.title || 'Chưa đặt tên',
        activeChapterWordCount: activeChap?.wordCount || 0,
        chapters,
        totalChapters: chapters.length,
        approvedChaptersCount: approvedCount,
        totalWords,
        storyBibleContent,
        bibleTemplateFrame,
        characters: Array.isArray(characters) ? characters : [],
        knowledgeMatrix: Array.isArray(knowledgeMatrix) ? knowledgeMatrix : [],
        cluesLedger: Array.isArray(cluesLedger) ? cluesLedger : [],
        sceneMarkersByChapter: sceneMarkersByChapter || {},
        scratchpadNotes,
        uiSnapshot
      };

      const fingerprint = this.fp.computeWorkspaceFingerprint(statePayload);
      return { statePayload, fingerprint };
    }
  }

  // ==========================================================================
  // PHẦN 3: TRÌNH HIỂN THỊ DANH SÁCH PHIÊN BẢN TAB 6 & KHUNG XEM TRƯỚC NỘI TẠI
  // ==========================================================================

  class VersionTab6ListAndInlinePreviewRenderer {
    constructor(vaultEngine) {
      this.NS = window.NoirStudio;
      this.vault = vaultEngine;
      this.activeFilterTag = 'ALL'; // 'ALL' | 'MANUAL' | 'AUTO' | 'MILESTONE'
      this.searchQuery = '';
      this.toolbarInjected = false;
    }

    ensureFilterToolbarInjected() {
      if (typeof document === 'undefined') return;
      const listEl = document.getElementById('version-history-list-container');
      if (!listEl || !listEl.parentElement) return;
      if (document.getElementById('mod10-version-filter-bar')) return;

      const bar = document.createElement('div');
      bar.id = 'mod10-version-filter-bar';
      bar.className = 'p-2 border-b border-zinc-800/80 bg-zinc-950/60 flex flex-wrap items-center gap-1.5 text-[11px]';
      bar.innerHTML = `
        <input type="text" id="input-mod10-version-search" placeholder="🔎 Tìm tên chương hoặc nhãn mốc..." class="flex-1 min-w-[140px] rounded-lg bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-[11px] text-zinc-200 focus:border-indigo-500 outline-none" />
        <div class="flex items-center gap-1">
          <button type="button" data-ver-filter="ALL" class="mod10-ver-filter-btn px-2 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold">Tất cả</button>
          <button type="button" data-ver-filter="MANUAL" class="mod10-ver-filter-btn px-2 py-1 rounded-lg bg-zinc-900 text-zinc-400 border border-zinc-800">🔖 Thủ công</button>
          <button type="button" data-ver-filter="MILESTONE" class="mod10-ver-filter-btn px-2 py-1 rounded-lg bg-zinc-900 text-zinc-400 border border-zinc-800">🛡️ Quan trọng</button>
        </div>
      `;

      listEl.parentElement.insertBefore(bar, listEl);

      const searchInput = document.getElementById('input-mod10-version-search');
      if (searchInput) {
        searchInput.addEventListener('input', () => {
          this.searchQuery = searchInput.value.trim().toLowerCase();
          this.renderList();
        });
      }

      bar.querySelectorAll('.mod10-ver-filter-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.activeFilterTag = btn.getAttribute('data-ver-filter') || 'ALL';
          bar.querySelectorAll('.mod10-ver-filter-btn').forEach((b) => {
            if (b === btn) {
              b.className = 'mod10-ver-filter-btn px-2 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold';
            } else {
              b.className = 'mod10-ver-filter-btn px-2 py-1 rounded-lg bg-zinc-900 text-zinc-400 border border-zinc-800';
            }
          });
          this.renderList();
        });
      });

      this.toolbarInjected = true;
    }

    renderList() {
      if (typeof document === 'undefined') return;
      this.ensureFilterToolbarInjected();

      const listEl = document.getElementById('version-history-list-container');
      const countBadge = document.getElementById('version-vault-count-badge');
      const allVersions = this.vault.versions || [];

      if (countBadge) {
        countBadge.textContent = `${allVersions.length} phiên bản đã lưu`;
      }

      if (!listEl) return;

      const filtered = allVersions.filter((v) => {
        if (this.activeFilterTag === 'MANUAL' && v.type !== 'MANUAL_BOOKMARK') {
          return false;
        }
        if (this.activeFilterTag === 'MILESTONE') {
          const meta = VERSION_SNAPSHOT_TYPES[v.type];
          if (!meta || meta.priority < 4) return false;
        }
        if (this.searchQuery) {
          const hay = `${v.reason || ''} ${v.snapshot?.activeChapterTitle || ''}`.toLowerCase();
          if (!hay.includes(this.searchQuery)) return false;
        }
        return true;
      });

      if (filtered.length === 0) {
        listEl.innerHTML = `
          <div class="p-5 text-center rounded-xl border border-dashed border-zinc-800 text-xs text-zinc-500 space-y-1">
            <div>🕒 Chưa có phiên bản nào khớp bộ lọc.</div>
            <p class="text-[11px] text-zinc-600">Hệ thống tự động lưu ảnh chụp liên tục mỗi khi bạn viết bài, hoặc bạn có thể bấm nút "Đánh Dấu Phiên Bản Ngay".</p>
          </div>
        `;
        return;
      }

      const esc = (s) => this.vault.utils.escapeHtml(s);
      const selectedId = this.vault.selectedVersionId;

      listEl.innerHTML = filtered
        .map((ver, idx) => {
          const isSelected = ver.id === selectedId;
          const meta = VERSION_SNAPSHOT_TYPES[ver.type] || VERSION_SNAPSHOT_TYPES.AUTO_CONTINUOUS;
          const snap = ver.snapshot || {};
          const nextVer = filtered[idx + 1];
          const prevWords = nextVer?.snapshot?.totalWords;
          const deltaWords =
            typeof prevWords === 'number' ? (snap.totalWords || 0) - prevWords : 0;
          const deltaBadge =
            deltaWords > 0
              ? `<span class="text-emerald-400">+${deltaWords.toLocaleString('vi-VN')} từ</span>`
              : deltaWords < 0
                ? `<span class="text-rose-400">${deltaWords.toLocaleString('vi-VN')} từ</span>`
                : `<span class="text-zinc-500">Giữ nguyên chữ</span>`;

          const cardClass = isSelected
            ? 'border-indigo-500/70 bg-indigo-500/15 shadow-lg shadow-indigo-950/30'
            : 'border-zinc-800/90 bg-zinc-900/70 hover:bg-zinc-800/80 hover:border-zinc-700';

          return `
            <div data-ver-card="${esc(ver.id)}" class="group rounded-xl border p-2.5 cursor-pointer transition space-y-1.5 ${cardClass}">
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-1.5 min-w-0">
                  <span class="px-1.5 py-0.5 rounded-md border text-[10px] font-bold shrink-0 ${meta.badgeClass}">${meta.icon} ${esc(meta.label)}</span>
                  <span class="text-[10px] text-zinc-500 font-mono shrink-0">${esc(this.vault.utils.formatRelativeTimeVN(ver.createdAt))}</span>
                </div>
                <button type="button" data-del-ver="${esc(ver.id)}" title="Xóa mốc phiên bản này" class="opacity-60 group-hover:opacity-100 text-[11px] text-zinc-400 hover:text-rose-400 px-1">✕</button>
              </div>
              <div class="text-xs font-bold ${isSelected ? 'text-indigo-200' : 'text-zinc-100'} truncate">${esc(ver.reason || snap.activeChapterTitle || 'Bản chụp trạng thái')}</div>
              <div class="flex flex-wrap items-center justify-between gap-2 text-[10px] text-zinc-400">
                <span class="truncate">📖 ${esc(snap.activeChapterTitle || '')} (${snap.totalChapters || 0} chương)</span>
                <span class="shrink-0 font-semibold">${(snap.totalWords || 0).toLocaleString('vi-VN')} từ • ${deltaBadge}</span>
              </div>
            </div>
          `;
        })
        .join('');

      listEl.querySelectorAll('[data-ver-card]').forEach((card) => {
        card.addEventListener('click', () => {
          this.vault.selectVersionForPreview(card.getAttribute('data-ver-card'));
        });
      });

      listEl.querySelectorAll('[data-del-ver]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.vault.deleteVersionById(btn.getAttribute('data-del-ver'));
        });
      });
    }

    renderInlinePreview(versionObj) {
      if (typeof document === 'undefined') return;
      const titleEl = document.getElementById('version-preview-title');
      const metaEl = document.getElementById('version-preview-meta');
      const contentBox = document.getElementById('version-preview-content-box');
      const fsBtn = document.getElementById('btn-open-fullscreen-version-preview');
      const restoreBtn = document.getElementById('btn-restore-selected-version');

      if (!versionObj) {
        if (titleEl) titleEl.textContent = '👁️ Khung Xem Trước Nhanh Phiên Bản Cũ';
        if (metaEl) metaEl.textContent = 'Hãy chọn một phiên bản ở cột trái để xem nội dung và trạng thái tại thời điểm đó.';
        if (contentBox) {
          contentBox.innerHTML = `<div class="p-8 text-center text-zinc-500 text-xs italic">Chưa chọn phiên bản nào.</div>`;
        }
        fsBtn?.classList.add('hidden');
        restoreBtn?.classList.add('hidden');
        return;
      }

      const snap = versionObj.snapshot || {};
      const activeChap =
        (snap.chapters || []).find((c) => c.id === snap.activeChapterId) ||
        (snap.chapters || [])[0];
      const meta = VERSION_SNAPSHOT_TYPES[versionObj.type] || VERSION_SNAPSHOT_TYPES.AUTO_CONTINUOUS;
      const esc = (s) => this.vault.utils.escapeHtml(s);

      if (titleEl) {
        titleEl.textContent = `${meta.icon} ${versionObj.reason || snap.activeChapterTitle}`;
      }
      if (metaEl) {
        metaEl.textContent = `Thời điểm: ${this.vault.utils.formatTimestampVN(versionObj.createdAt)} • Tổng ${snap.totalChapters || 0} chương (${(snap.totalWords || 0).toLocaleString('vi-VN')} từ)`;
      }

      fsBtn?.classList.remove('hidden');
      restoreBtn?.classList.remove('hidden');

      if (contentBox) {
        const chapText = activeChap?.content || '(Chương này khi đó đang trống)';
        const parasHtml = this.vault.utils?.renderManuscriptPreviewHtml
          ? this.vault.utils.renderManuscriptPreviewHtml(chapText.slice(0, 12000))
          : `<pre class="whitespace-pre-wrap">${esc(chapText)}</pre>`;

        contentBox.innerHTML = `
          <div class="mb-3 p-3 rounded-xl border border-indigo-500/30 bg-indigo-950/25 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div>
              <span class="font-bold text-indigo-300">📖 Đang mở lúc đó:</span>
              <span class="text-zinc-100 font-semibold">${esc(activeChap?.displayTitle || snap.activeChapterTitle || '')}</span>
            </div>
            <div class="text-[11px] text-zinc-400">
              Story Bible: ${(snap.storyBibleContent || '').length} ký tự • Nhân vật: ${(snap.characters || []).length}
            </div>
          </div>
          <div class="space-y-1.5 text-sm leading-relaxed">${parasHtml}</div>
        `;
      }
    }
  }

  // ==========================================================================
  // PHẦN 4: MÔ PHỎNG TRẠNG THÁI TRANG WEB CŨ TOÀN MÀN HÌNH (TIME-MACHINE MODAL)
  // ==========================================================================

  class FullscreenVersionSimulatorRenderer {
    constructor(vaultEngine) {
      this.NS = window.NoirStudio;
      this.vault = vaultEngine;
      this.currentModalTab = 'MANUSCRIPT'; // 'MANUSCRIPT' | 'ALL_CHAPTERS' | 'STORY_BIBLE' | 'DIFF_COMPARE'
      this.inspectedOldChapterId = null;
    }

    openModalForVersion(versionObj) {
      if (typeof document === 'undefined' || !versionObj) return;
      const modal = document.getElementById('modal-fullscreen-version-preview');
      if (!modal) return;

      const snap = versionObj.snapshot || {};
      this.inspectedOldChapterId = snap.activeChapterId || snap.chapters?.[0]?.id || null;
      this.currentModalTab = 'MANUSCRIPT';

      const headerEl = document.getElementById('fs-version-preview-header');
      const subEl = document.getElementById('fs-version-preview-subheader');
      if (headerEl) {
        headerEl.textContent = `🕰️ MÔ PHỎNG TRẠNG THÁI QUÁ KHỨ — ${versionObj.reason || snap.activeChapterTitle}`;
      }
      if (subEl) {
        subEl.textContent = `Chụp lúc ${this.vault.utils.formatTimestampVN(versionObj.createdAt)} • Đang mở: "${snap.activeChapterTitle}" • Tổng ${snap.totalChapters || 0} chương (${(snap.totalWords || 0).toLocaleString('vi-VN')} từ)`;
      }

      this.syncTabButtonsVisual();
      this.renderStageContent(versionObj);
      modal.classList.remove('hidden');
    }

    closeModal() {
      if (typeof document === 'undefined') return;
      document.getElementById('modal-fullscreen-version-preview')?.classList.add('hidden');
    }

    switchPreviewTab(tabName, versionObj) {
      this.currentModalTab = tabName || 'MANUSCRIPT';
      this.syncTabButtonsVisual();
      this.renderStageContent(versionObj);
    }

    syncTabButtonsVisual() {
      if (typeof document === 'undefined') return;
      document.querySelectorAll('.ver-preview-tab-btn').forEach((btn) => {
        const key = btn.getAttribute('data-ver-tab');
        if (key === this.currentModalTab) {
          btn.className =
            'ver-preview-tab-btn px-3 py-1.5 rounded-xl text-xs font-extrabold bg-indigo-600 text-white shadow transition';
        } else {
          btn.className =
            'ver-preview-tab-btn px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 transition';
        }
      });
    }

    renderStageContent(versionObj) {
      if (typeof document === 'undefined' || !versionObj) return;
      const stage = document.getElementById('fs-version-preview-stage');
      if (!stage) return;

      const snap = versionObj.snapshot || {};
      const esc = (s) => this.vault.utils.escapeHtml(s);

      if (this.currentModalTab === 'MANUSCRIPT') {
        const chap =
          (snap.chapters || []).find((c) => c.id === this.inspectedOldChapterId) ||
          (snap.chapters || []).find((c) => c.id === snap.activeChapterId) ||
          (snap.chapters || [])[0];

        if (!chap) {
          stage.innerHTML = '<div class="text-zinc-400 italic">Không có dữ liệu chương trong bản chụp này.</div>';
          return;
        }

        const fontStyle = snap.uiSnapshot?.fontFamily || 'serif';
        const fontSize = snap.uiSnapshot?.fontSize || '17px';
        const bodyHtml = this.vault.utils?.renderManuscriptPreviewHtml
          ? this.vault.utils.renderManuscriptPreviewHtml(chap.content || '')
          : `<pre class="whitespace-pre-wrap">${esc(chap.content || '')}</pre>`;

        stage.innerHTML = `
          <div class="max-w-3xl mx-auto rounded-2xl border border-zinc-800 bg-zinc-900/75 p-5 sm:p-7 space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
              <div>
                <div class="text-[11px] uppercase tracking-wider text-indigo-300 font-bold">Màn hình Đọc & Soạn Thảo (Trạng thái cũ)</div>
                <h4 class="text-lg font-extrabold text-zinc-100 mt-0.5">${esc(chap.displayTitle || chap.title)}</h4>
              </div>
              <span class="px-2.5 py-1 rounded-full text-[11px] font-bold ${chap.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}">
                ${chap.status === 'APPROVED' ? '✅ Đã duyệt' : '📝 Bản nháp'} • ${(chap.wordCount || 0).toLocaleString('vi-VN')} từ
              </span>
            </div>
            ${
              chap.beats
                ? `<div class="p-3 rounded-xl bg-indigo-950/35 border border-indigo-500/25 text-xs text-indigo-100">
                    <div class="font-bold text-indigo-300 mb-1">🎯 Khung Dàn ý (Beats) lúc đó:</div>
                    <div class="whitespace-pre-line leading-relaxed">${esc(chap.beats)}</div>
                  </div>`
                : ''
            }
            <div style="font-size:${esc(fontSize)}; font-family:${esc(fontStyle)};" class="text-zinc-200 leading-relaxed space-y-2">${bodyHtml}</div>
          </div>
        `;
        return;
      }

      if (this.currentModalTab === 'ALL_CHAPTERS') {
        const chaps = snap.chapters || [];
        const selectedOld =
          chaps.find((c) => c.id === this.inspectedOldChapterId) || chaps[0] || null;

        const sidebarItems = chaps
          .map((c, idx) => {
            const active = selectedOld && c.id === selectedOld.id;
            return `
              <button type="button" data-old-chap-pick="${esc(c.id)}" class="w-full text-left p-2.5 rounded-xl border text-xs transition ${active ? 'border-indigo-500 bg-indigo-500/20 text-indigo-100 font-bold' : 'border-zinc-800 bg-zinc-900/70 text-zinc-300 hover:bg-zinc-800'}">
                <div class="truncate">#${idx + 1}. ${esc(c.displayTitle || c.title)}</div>
                <div class="text-[10px] text-zinc-400 mt-0.5">${c.status === 'APPROVED' ? '✅ Đã duyệt' : '📝 Nháp'} • ${(c.wordCount || 0).toLocaleString('vi-VN')} từ</div>
              </button>
            `;
          })
          .join('');

        const contentHtml = selectedOld
          ? this.vault.utils?.renderManuscriptPreviewHtml?.(selectedOld.content || '') ||
            `<pre class="whitespace-pre-wrap">${esc(selectedOld.content || '')}</pre>`
          : '<div class="text-zinc-500 italic">Chọn một chương bên trái để đọc nội dung quá khứ.</div>';

        stage.innerHTML = `
          <div class="grid grid-cols-1 md:grid-cols-12 gap-4 h-full">
            <div class="md:col-span-4 space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              <div class="text-xs font-bold text-indigo-300 uppercase mb-1">Cây Bản Thảo Tại Thời Điểm Cũ (${chaps.length} chương)</div>
              ${sidebarItems}
            </div>
            <div class="md:col-span-8 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 max-h-[60vh] overflow-y-auto space-y-2">
              <h4 class="text-base font-extrabold text-emerald-300 border-b border-zinc-800 pb-2">${esc(selectedOld?.displayTitle || '')}</h4>
              <div class="text-sm leading-relaxed text-zinc-200">${contentHtml}</div>
            </div>
          </div>
        `;

        stage.querySelectorAll('[data-old-chap-pick]').forEach((btn) => {
          btn.addEventListener('click', () => {
            this.inspectedOldChapterId = btn.getAttribute('data-old-chap-pick');
            this.renderStageContent(versionObj);
          });
        });
        return;
      }

      if (this.currentModalTab === 'STORY_BIBLE') {
        const chars = snap.characters || [];
        const clues = snap.cluesLedger || [];
        const charCards =
          chars.length === 0
            ? '<div class="text-xs text-zinc-500 italic">Chưa có hồ sơ nhân vật tại thời điểm chụp.</div>'
            : chars
                .map(
                  (ch) => `
                <div class="p-3 rounded-xl border border-zinc-800 bg-zinc-900/80 text-xs space-y-1">
                  <div class="font-bold text-amber-300">${esc(ch.name || ch.ten || 'Nhân vật')}</div>
                  <div class="text-[11px] text-zinc-400">Vai trò: ${esc(ch.role || 'Chưa rõ')}</div>
                  <div class="text-zinc-300">${esc(ch.traits || ch.notes || '')}</div>
                </div>
              `
                )
                .join('');

        stage.innerHTML = `
          <div class="space-y-4">
            <div class="rounded-2xl border border-zinc-800 bg-zinc-900/75 p-4 space-y-2">
              <h4 class="text-xs font-extrabold text-emerald-300 uppercase">📖 Hồ Sơ Story Bible Tổng Hợp Lúc Đó</h4>
              <pre class="text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed font-sans bg-zinc-950/70 p-3 rounded-xl border border-zinc-800 max-h-60 overflow-y-auto">${esc(snap.storyBibleContent || '(Trống)')}</pre>
            </div>
            <div class="rounded-2xl border border-zinc-800 bg-zinc-900/75 p-4 space-y-2">
              <h4 class="text-xs font-extrabold text-amber-300 uppercase">👥 Nhân Vật (${chars.length}) & Manh Mối Phục Bút (${clues.length})</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">${charCards}</div>
            </div>
          </div>
        `;
        return;
      }

      // DIFF_COMPARE tab: So sánh từng đoạn giữa Bản Cũ (Old) và Bản Đang Viết Hiện Tại (Live)
      const oldChap =
        (snap.chapters || []).find((c) => c.id === snap.activeChapterId) ||
        (snap.chapters || [])[0];
      const curChap =
        this.NS.chapterManager?.chapters?.find((c) => c.id === oldChap?.id) ||
        this.NS.chapterManager?.getActiveChapter?.();

      const oldText = oldChap?.content || '';
      const curText = curChap?.content || '';
      const diffRes = this.vault.utils?.computeLineDiff
        ? this.vault.utils.computeLineDiff(oldText, curText)
        : { ops: [], addedLines: 0, removedLines: 0, unchangedLines: 0 };

      const opsHtml =
        diffRes.ops.length === 0
          ? '<div class="text-xs text-zinc-400 italic">Không tìm thấy nội dung để so sánh.</div>'
          : diffRes.ops
              .filter((op) => op.text.trim().length > 0)
              .slice(0, 260)
              .map((op) => {
                if (op.type === 'ADDED') {
                  return `<div class="px-3 py-1 rounded-lg bg-emerald-500/15 border-l-4 border-emerald-500 text-emerald-200 text-xs my-1"><span class="font-mono font-bold mr-2">+ [Mới thêm hiện tại]</span>${esc(op.text)}</div>`;
                }
                if (op.type === 'REMOVED') {
                  return `<div class="px-3 py-1 rounded-lg bg-rose-500/15 border-l-4 border-rose-500 text-rose-200 text-xs my-1 line-through opacity-85"><span class="font-mono font-bold mr-2">- [Chỉ có ở bản cũ]</span>${esc(op.text)}</div>`;
                }
                return `<div class="px-3 py-0.5 text-zinc-400 text-xs my-0.5">${esc(op.text)}</div>`;
              })
              .join('');

      stage.innerHTML = `
        <div class="space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl border border-zinc-800 bg-zinc-900/90 text-xs">
            <span class="font-bold text-indigo-300">🔍 So sánh "${esc(oldChap?.displayTitle || '')}" (Bản Cũ ⇄ Bản Hiện Tại)</span>
            <div class="flex items-center gap-3">
              <span class="text-rose-300 font-semibold">Có ở bản cũ (đã xóa/sửa): ${diffRes.removedLines} dòng</span>
              <span class="text-emerald-300 font-semibold">Mới thêm gần đây: ${diffRes.addedLines} dòng</span>
            </div>
          </div>
          <div class="rounded-2xl border border-zinc-800 bg-zinc-950/90 p-4 max-h-[58vh] overflow-y-auto">${opsHtml}</div>
        </div>
      `;
    }
  }

  // ==========================================================================
  // PHẦN 5: ĐỘNG CƠ KHÔI PHỤC AN TOÀN (ROLLBACK) & PHÂN TÍCH TIẾN ĐỘ TỪNG MỐC
  // ==========================================================================

  class VersionRollbackRestorerEngine {
    constructor(vaultEngine) {
      this.NS = window.NoirStudio;
      this.vault = vaultEngine;
    }

    /**
     * Khôi phục toàn bộ trạng thái dự án về đúng phiên bản `versionObj` đã chọn.
     * Quy trình 5 bước an toàn tuyệt đối:
     *   1. Hỏi xác nhận thân thiện với người dùng (nêu rõ thời điểm & số chữ).
     *   2. Tự động chụp ngay 1 phiên bản bảo vệ hiện tại (`PRE_RESTORE`) để phòng trường hợp đổi ý.
     *   3. Ghi trả toàn bộ Chương, Story Bible, Nhân vật, Ma trận, Phục bút, Mốc cảnh & Ghi chú.
     *   4. Nạp lại các module UI sống (`chapterManager`, `storyBible`, `sceneBuilder`).
     *   5. Làm mới danh sách phiên bản & đóng modal mô phỏng (nếu đang mở).
     */
    async restoreFullWorkspaceFromVersion(versionObj, options = { skipConfirm: false }) {
      if (!versionObj || !versionObj.snapshot) return false;
      const snap = versionObj.snapshot;

      if (!options.skipConfirm && typeof this.NS.confirmDialog === 'function') {
        const confirmed = await this.NS.confirmDialog({
          title: '🕰️ Khôi phục dự án về phiên bản cũ?',
          message: `Bạn chuẩn bị quay ngược thời gian về mốc:\n"${versionObj.reason || snap.activeChapterTitle}"\n• Chụp lúc: ${this.vault.utils.formatTimestampVN(versionObj.createdAt)}\n• Quy mô: ${snap.totalChapters || 0} chương (${(snap.totalWords || 0).toLocaleString('vi-VN')} từ)\n\nHệ thống sẽ tự động chụp lại 1 bản bảo vệ cho trạng thái hiện tại trước khi khôi phục!`,
          confirmLabel: 'Khôi phục ngay',
          cancelLabel: 'Xem lại thêm'
        });
        if (!confirmed) return false;
      }

      // 1. Chụp bảo vệ trạng thái hiện tại ngay lập tức trước khi ghi đè
      await this.vault.createSnapshot(
        `Tự động bảo vệ trước khi quay về "${String(versionObj.reason || '').slice(0, 32)}"`,
        'PRE_RESTORE',
        { bypassThrottle: true }
      );

      const keys = this.NS.constants?.STORAGE_KEYS || {};
      const fp = this.vault.fingerprintEngine;

      // 2. Phục hồi danh sách Chương
      const restoredChapters = fp.deepCloneSafe(snap.chapters || []);
      const cm = this.NS.chapterManager;
      if (cm && Array.isArray(restoredChapters) && restoredChapters.length > 0) {
        if (this.NS.autoSaver?.forcePushUndoSnapshot) {
          this.NS.autoSaver.forcePushUndoSnapshot(
            document.getElementById('textarea-chapter-content')?.value || '',
            'Trước khi khôi phục phiên bản cũ'
          );
        }

        cm.chapters = restoredChapters.map((c, idx) => cm.normalizeChapterRecord(c, idx));
        const nextActiveId =
          cm.chapters.find((c) => c.id === snap.activeChapterId)?.id ||
          cm.chapters[0]?.id ||
          null;

        if (this.NS.state) {
          this.NS.state.activeChapterId = nextActiveId;
        }
        try {
          if (nextActiveId) {
            localStorage.setItem(cm.activeIdKey || 'noir_studio_active_chapter_v35', nextActiveId);
          }
          localStorage.setItem(
            cm.storageKey || 'noir_studio_chapters_v35',
            JSON.stringify(cm.chapters)
          );
        } catch (_) {
          // Bỏ qua
        }

        if (this.NS.idb?.clearStore && this.NS.idb?.bulkSet) {
          const chaptersStore = this.NS.constants?.STORES?.CHAPTERS || 'chapters';
          await this.NS.idb.clearStore(chaptersStore);
          await this.NS.idb.bulkSet(
            chaptersStore,
            cm.chapters.map((c) => ({ key: c.id, value: c }))
          );
        }
      }

      // 3. Phục hồi Story Bible, Nhân vật, Ma trận, Phục bút, Mốc cảnh, Scratchpad
      try {
        localStorage.setItem(
          keys.BIBLE_RENDERED || 'noir_s10_rendered_bible_content',
          snap.storyBibleContent || ''
        );
        if (snap.bibleTemplateFrame) {
          localStorage.setItem(
            keys.BIBLE_TEMPLATE || 'noir_s10_bible_template_frame',
            snap.bibleTemplateFrame
          );
        }
        localStorage.setItem(
          keys.CHARACTERS || 'noir_s10_character_profiles_v1',
          JSON.stringify(snap.characters || [])
        );
        localStorage.setItem(
          keys.KNOWLEDGE_MATRIX || 'noir_s10_knowledge_matrix_v1',
          JSON.stringify(snap.knowledgeMatrix || [])
        );
        localStorage.setItem(
          keys.CLUES_LEDGER || 'noir_s10_clues_ledger_v1',
          JSON.stringify(snap.cluesLedger || [])
        );
        localStorage.setItem(
          keys.SCENE_MARKERS || 'noir_s18_scene_pov_markers_v1',
          JSON.stringify(snap.sceneMarkersByChapter || {})
        );
        if (typeof snap.scratchpadNotes === 'string') {
          localStorage.setItem(
            keys.SCRATCHPAD || 'noir_quick_scratchpad_notes',
            snap.scratchpadNotes
          );
        }
      } catch (_) {
        // Bỏ qua nếu trình duyệt hạn chế LocalStorage
      }

      // 4. Nạp lại các module UI sống để màn hình cập nhật tức thì
      try {
        if (cm) {
          cm.loadActiveChapterIntoEditor();
          cm.renderChapterTreeAndQuickSwitcher();
        }
        if (this.NS.storyBible?.loadFromStorage) {
          this.NS.storyBible.loadFromStorage();
        }
        if (this.NS.sceneBuilder?.loadFromStorage) {
          this.NS.sceneBuilder.loadFromStorage();
          this.NS.sceneBuilder.renderMarkersListUI?.();
        }
        if (this.NS.rag?.rebuildIndexFromChapters && cm?.chapters) {
          this.NS.rag.rebuildIndexFromChapters(cm.chapters);
        }
      } catch (_) {
        // Bỏ qua
      }

      // 5. Đóng modal xem trước & thông báo
      this.vault.simulator.closeModal();
      this.vault.renderVersionListUI();

      if (this.NS.bus?.emit) {
        this.NS.bus.emit(
          this.NS.constants?.EVENTS?.VERSION_RESTORED || 'version:restored',
          { versionId: versionObj.id, restoredAt: Date.now() }
        );
      }

      this.vault.utils.showToast(
        `🕰️ Đã khôi phục hoàn chỉnh trạng thái về mốc "${versionObj.reason || snap.activeChapterTitle}"!`,
        'success',
        4500
      );
      return true;
    }
  }

  class VersionProgressAnalyticsHelper {
    constructor(vaultEngine) {
      this.vault = vaultEngine;
    }

    /**
     * Phân tích lịch sử tăng trưởng chữ của cuốn tiểu thuyết qua các bản chụp
     */
    buildTimelineVelocityDigest() {
      const list = this.vault.versions || [];
      if (list.length === 0) {
        return {
          totalSnapshots: 0,
          oldestTimestamp: null,
          newestTimestamp: null,
          peakWordCount: 0,
          manualBookmarksCount: 0
        };
      }

      let peakWords = 0;
      let manualCount = 0;
      list.forEach((v) => {
        const w = v.snapshot?.totalWords || 0;
        if (w > peakWords) peakWords = w;
        if (v.type === 'MANUAL_BOOKMARK') manualCount += 1;
      });

      return {
        totalSnapshots: list.length,
        oldestTimestamp: list[list.length - 1]?.createdAt || null,
        newestTimestamp: list[0]?.createdAt || null,
        peakWordCount: peakWords,
        manualBookmarksCount: manualCount
      };
    }

    /**
     * Xuất toàn bộ lịch sử phiên bản kèm nội dung chi tiết ra file `.JSON` riêng
     */
    exportVersionVaultArchiveJson() {
      const list = this.vault.versions || [];
      if (list.length === 0) {
        this.vault.utils.showToast('⚠️ Kho Phiên Bản hiện đang trống.', 'warning');
        return false;
      }

      const payload = {
        format: 'NOIR_VERSION_VAULT_ARCHIVE',
        exportedAt: Date.now(),
        totalVersions: list.length,
        versions: list
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json;charset=utf-8'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `LichSu_PhienBan_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2500);
      this.vault.utils.showToast(`📦 Đã xuất ${list.length} mốc phiên bản ra file JSON!`, 'success');
      return true;
    }
  }

  // ==========================================================================
  // PHẦN 6: HỘP THOẠI ĐẶT TÊN MỐC PHIÊN BẢN THỦ CÔNG & ĐỐI CHIẾU HAI MỐC BẤT KỲ
  // ==========================================================================

  class ManualBookmarkLabelDialog {
    constructor(vaultEngine) {
      this.vault = vaultEngine;
    }

    /**
     * Hộp thoại nhỏ gọn thân thiện cho phép tác giả đặt nhãn riêng cho Phiên bản
     * (VD: "Trước khi sửa lại cú twist chương 4") hoặc bấm Enter để lưu ngay.
     */
    askVersionBookmarkLabel(defaultHint = '') {
      if (typeof document === 'undefined') {
        return Promise.resolve(defaultHint || 'Mốc đánh dấu thủ công');
      }

      return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className =
          'fixed inset-0 z-[10025] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4';

        const esc = (s) => this.vault.utils.escapeHtml(s);
        overlay.innerHTML = `
          <div class="w-full max-w-md rounded-2xl border border-indigo-500/40 bg-zinc-900 p-5 shadow-2xl space-y-3.5">
            <h3 class="text-sm font-extrabold text-indigo-300 flex items-center gap-2">
              <span>🔖 Tạo Mốc Phiên Bản Thủ Công (Snapshot)</span>
            </h3>
            <p class="text-xs text-zinc-400">
              Đặt tên gợi nhớ để dễ tìm lại trạng thái hiện tại của toàn bộ truyện & Story Bible sau này:
            </p>
            <input type="text" id="input-mod10-bookmark-label" value="${esc(defaultHint)}" placeholder="Ví dụ: Bản nháp gốc trước khi viết lại cao trào..." class="w-full rounded-xl bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-zinc-100 focus:border-indigo-500 outline-none" />
            <div class="flex items-center justify-end gap-2 pt-1">
              <button type="button" data-act="cancel" class="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300">Hủy</button>
              <button type="button" data-act="ok" class="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow">Lưu Phiên Bản Ngay</button>
            </div>
          </div>
        `;

        const inputEl = overlay.querySelector('#input-mod10-bookmark-label');
        const finish = (val) => {
          document.removeEventListener('keydown', onKey);
          overlay.remove();
          resolve(val);
        };
        const onKey = (e) => {
          if (e.key === 'Escape') finish(null);
          if (e.key === 'Enter') finish((inputEl?.value || '').trim() || defaultHint);
        };

        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) finish(null);
        });
        overlay.querySelector('[data-act="cancel"]')?.addEventListener('click', () => finish(null));
        overlay.querySelector('[data-act="ok"]')?.addEventListener('click', () =>
          finish((inputEl?.value || '').trim() || defaultHint)
        );
        document.addEventListener('keydown', onKey);
        document.body.appendChild(overlay);
        setTimeout(() => {
          inputEl?.focus();
          inputEl?.select();
        }, 20);
      });
    }
  }

  class CrossVersionPairComparator {
    constructor(vaultEngine) {
      this.vault = vaultEngine;
    }

    /**
     * Trả về bản tóm tắt khác biệt tổng thể giữa 2 phiên bản bất kỳ (`olderVer` vs `newerVer`)
     */
    compareTwoSnapshotsSummary(olderVer, newerVer) {
      if (!olderVer || !newerVer) return null;
      const oldSnap = olderVer.snapshot || {};
      const newSnap = newerVer.snapshot || {};

      const oldMap = new Map((oldSnap.chapters || []).map((c) => [c.id, c]));
      const newMap = new Map((newSnap.chapters || []).map((c) => [c.id, c]));

      const addedChapters = [];
      const removedChapters = [];
      const modifiedChapters = [];

      newMap.forEach((nc, id) => {
        const oc = oldMap.get(id);
        if (!oc) {
          addedChapters.push({ id, title: nc.displayTitle, words: nc.wordCount || 0 });
        } else if ((oc.content || '') !== (nc.content || '') || oc.status !== nc.status) {
          modifiedChapters.push({
            id,
            title: nc.displayTitle,
            deltaWords: (nc.wordCount || 0) - (oc.wordCount || 0),
            statusChanged: oc.status !== nc.status
          });
        }
      });

      oldMap.forEach((oc, id) => {
        if (!newMap.has(id)) {
          removedChapters.push({ id, title: oc.displayTitle, words: oc.wordCount || 0 });
        }
      });

      return {
        olderCreatedAt: olderVer.createdAt,
        newerCreatedAt: newerVer.createdAt,
        netWordChange: (newSnap.totalWords || 0) - (oldSnap.totalWords || 0),
        addedChapters,
        removedChapters,
        modifiedChapters
      };
    }
  }

  /**
   * Trình đồng bộ chọn phiên bản khôi phục một chương đơn lẻ thay vì cả dự án
   * (Selective Single-Chapter Rollback)
   */
  class SelectiveChapterFromVersionRestorer {
    constructor(vaultEngine) {
      this.NS = window.NoirStudio;
      this.vault = vaultEngine;
    }

    async restoreOnlySingleChapterFromVersion(versionObj, targetChapterId) {
      if (!versionObj?.snapshot?.chapters) return false;
      const oldChap = versionObj.snapshot.chapters.find((c) => c.id === targetChapterId);
      const cm = this.NS.chapterManager;
      if (!oldChap || !cm) return false;

      await this.vault.createSnapshot(
        `Trước khi lấy riêng "${oldChap.displayTitle}" từ bản cũ`,
        'PRE_RESTORE',
        { bypassThrottle: true }
      );

      const liveIdx = cm.chapters.findIndex((c) => c.id === targetChapterId);
      if (liveIdx >= 0) {
        cm.chapters[liveIdx] = cm.normalizeChapterRecord(oldChap, liveIdx);
      } else {
        cm.chapters.push(cm.normalizeChapterRecord(oldChap, cm.chapters.length));
      }

      if (this.NS.state?.activeChapterId === oldChap.id) {
        cm.loadActiveChapterIntoEditor();
      }
      cm.renderChapterTreeAndQuickSwitcher();
      await cm.persistChapters();

      this.vault.utils.showToast(
        `✅ Đã khôi phục riêng chương "${oldChap.displayTitle}" mà giữ nguyên các chương khác!`,
        'success'
      );
      return true;
    }
  }

  // ==========================================================================
  // PHẦN 7: LỚP CHỦ QUẢN KHO LỊCH SỬ PHIÊN BẢN (`window.NoirStudio.versionVault`)
  // ==========================================================================

  class VersionTimeMachineVaultEngine {
    constructor() {
      this.NS = window.NoirStudio;
      this.versions = [];
      this.selectedVersionId = null;
      this.lastAutoSnapshotAt = 0;
      this.lastCapturedFingerprint = '';
      this.lastAutoWordTotal = -1;
      this.initialized = false;

      this.fingerprintEngine = new VersionSnapshotFingerprintEngine();
      this.retentionPolicy = new SmartVersionRetentionPolicy();
      this.stateCapture = new FullApplicationStateCapture(this.fingerprintEngine);
      this.listRenderer = new VersionTab6ListAndInlinePreviewRenderer(this);
      this.simulator = new FullscreenVersionSimulatorRenderer(this);
      this.restorer = new VersionRollbackRestorerEngine(this);
      this.analytics = new VersionProgressAnalyticsHelper(this);
      this.bookmarkDialog = new ManualBookmarkLabelDialog(this);
      this.pairComparator = new CrossVersionPairComparator(this);
      this.singleChapterRestorer = new SelectiveChapterFromVersionRestorer(this);
    }

    get utils() {
      return (
        this.NS.utils || {
          escapeHtml: (s) => String(s ?? ''),
          countVietnameseWords: (t) =>
            String(t || '').trim() ? String(t).trim().split(/\s+/).length : 0,
          formatTimestampVN: (t) => new Date(t || Date.now()).toLocaleString('vi-VN'),
          formatRelativeTimeVN: () => 'Vừa xong',
          showToast: () => {}
        }
      );
    }

    getStorageKey() {
      return (
        this.NS.constants?.STORAGE_KEYS?.VERSION_VAULT || 'noir_v36_version_history_vault'
      );
    }

    async loadFromStorage() {
      let loaded = null;

      try {
        if (this.NS.idb && typeof this.NS.idb.get === 'function') {
          const idbStore = this.NS.constants?.STORES?.STATE_CACHE || 'state_cache';
          const fromIdb = await this.NS.idb.get(idbStore, 'version_vault_master_list', null);
          if (Array.isArray(fromIdb) && fromIdb.length > 0) {
            loaded = fromIdb;
          }
        }
      } catch (_) {
        // Fallback sang LocalStorage
      }

      if (!loaded) {
        try {
          const raw = localStorage.getItem(this.getStorageKey());
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              loaded = parsed;
            }
          }
        } catch (_) {
          loaded = [];
        }
      }

      this.versions = Array.isArray(loaded)
        ? loaded.filter((v) => v && v.id && v.snapshot).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        : [];

      if (this.versions.length > 0) {
        this.lastCapturedFingerprint = this.versions[0].fingerprint || '';
        this.lastAutoWordTotal = this.versions[0].snapshot?.totalWords ?? -1;
        this.lastAutoSnapshotAt = this.versions[0].createdAt || 0;
        if (!this.selectedVersionId) {
          this.selectedVersionId = this.versions[0].id;
        }
      }

      this.renderVersionListUI();
      return this.versions;
    }

    async persistVersions() {
      this.versions = this.retentionPolicy.pruneOverflowSnapshots(
        this.versions,
        MAX_STORED_VERSIONS_IDB
      );

      // Ghi đầy đủ vào IndexedDB (`state_cache`)
      try {
        if (this.NS.idb && typeof this.NS.idb.set === 'function') {
          const idbStore = this.NS.constants?.STORES?.STATE_CACHE || 'state_cache';
          await this.NS.idb.set(idbStore, 'version_vault_master_list', this.versions);
        }
      } catch (_) {
        // Bỏ qua nếu IDB lỗi tạm
      }

      // Phản chiếu 30 bản gần nhất vào LocalStorage (nếu tràn 5MB thì tự rút gọn xuống 10 bản)
      try {
        const subset = this.versions.slice(0, MAX_MIRRORED_LS_VERSIONS);
        localStorage.setItem(this.getStorageKey(), JSON.stringify(subset));
      } catch (_) {
        try {
          const compact = this.versions.slice(0, 8);
          localStorage.setItem(this.getStorageKey(), JSON.stringify(compact));
        } catch (__) {
          // Bỏ qua nếu LocalStorage đầy
        }
      }
      return true;
    }

    /**
     * Hàm chụp một mốc phiên bản toàn diện (hỗ trợ cả tự động lẫn thủ công).
     */
    async createSnapshot(reason = '', type = 'AUTO_CONTINUOUS', options = {}) {
      const { bypassThrottle = false, silent = false } = options;
      const { statePayload, fingerprint } = this.stateCapture.captureCurrentWorkspaceState();

      if (!bypassThrottle && fingerprint && fingerprint === this.lastCapturedFingerprint) {
        return null;
      }

      const activeChap = (statePayload.chapters || []).find(
        (c) => c.id === statePayload.activeChapterId
      );
      const autoReason =
        reason ||
        this.NS.autoSaver?.reasonSuggester?.buildReadableSnapshotReason?.(activeChap) ||
        `Mốc trạng thái: ${statePayload.activeChapterTitle}`;

      const versionEntry = {
        id: `ver_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type: VERSION_SNAPSHOT_TYPES[type] ? type : 'AUTO_CONTINUOUS',
        reason: String(autoReason).trim(),
        createdAt: Date.now(),
        fingerprint,
        snapshot: statePayload
      };

      this.versions.unshift(versionEntry);
      this.lastCapturedFingerprint = fingerprint;
      this.lastAutoSnapshotAt = versionEntry.createdAt;
      this.lastAutoWordTotal = statePayload.totalWords;
      this.selectedVersionId = versionEntry.id;

      await this.persistVersions();
      this.renderVersionListUI();

      if (this.NS.bus?.emit) {
        this.NS.bus.emit(
          this.NS.constants?.EVENTS?.VERSION_CREATED || 'version:created',
          { version: versionEntry }
        );
      }

      if (!silent && type === 'MANUAL_BOOKMARK') {
        this.utils.showToast(
          `🔖 Đã chụp & lưu mốc phiên bản "${versionEntry.reason}"!`,
          'success',
          3200
        );
      }

      return versionEntry;
    }

    /**
     * Được gọi tự động bởi Module 09 (AutoSaver) khi lưu bản thảo liên tục.
     * Tự động tạo snapshot mới nếu:
     *   - Chưa từng có snapshot nào
     *   - Đã qua >= 30 giây kể từ snapshot tự động trước VÀ có sự thay đổi nội dung
     *   - Hoặc người dùng vừa viết thêm / sửa >= 18 từ
     */
    async maybeAutoSnapshotOnSave() {
      const { statePayload, fingerprint } = this.stateCapture.captureCurrentWorkspaceState();
      if (!fingerprint || fingerprint === this.lastCapturedFingerprint) {
        return null;
      }

      const now = Date.now();
      const elapsed = now - (this.lastAutoSnapshotAt || 0);
      const currentWords = statePayload.totalWords || 0;
      const wordDelta =
        this.lastAutoWordTotal >= 0 ? Math.abs(currentWords - this.lastAutoWordTotal) : 999;

      const shouldSnap =
        this.versions.length === 0 ||
        elapsed >= AUTO_SNAPSHOT_MIN_INTERVAL_MS ||
        wordDelta >= AUTO_SNAPSHOT_MIN_WORD_DELTA;

      if (!shouldSnap) return null;

      return this.createSnapshot('', 'AUTO_CONTINUOUS', {
        bypassThrottle: false,
        silent: true
      });
    }

    getSelectedVersionObject() {
      if (!this.selectedVersionId) return null;
      return this.versions.find((v) => v.id === this.selectedVersionId) || null;
    }

    selectVersionForPreview(versionId) {
      this.selectedVersionId = versionId;
      this.listRenderer.renderList();
      const ver = this.getSelectedVersionObject();
      this.listRenderer.renderInlinePreview(ver);
      return ver;
    }

    openFullscreenStatePreviewModal(optionalVersionId = null) {
      if (optionalVersionId) {
        this.selectedVersionId = optionalVersionId;
      }
      let ver = this.getSelectedVersionObject();
      if (!ver && this.versions.length > 0) {
        this.selectedVersionId = this.versions[0].id;
        ver = this.versions[0];
      }
      if (!ver) {
        this.utils.showToast('⚠️ Chưa có phiên bản nào để xem trước.', 'warning');
        return false;
      }
      this.simulator.openModalForVersion(ver);
      return true;
    }

    async restoreSelectedVersion(options = { skipConfirm: false }) {
      const ver = this.getSelectedVersionObject();
      if (!ver) {
        this.utils.showToast('⚠️ Hãy chọn một phiên bản trong danh sách trước khi khôi phục.', 'warning');
        return false;
      }
      return this.restorer.restoreFullWorkspaceFromVersion(ver, options);
    }

    async deleteVersionById(versionId) {
      const idx = this.versions.findIndex((v) => v.id === versionId);
      if (idx === -1) return false;

      const target = this.versions[idx];
      this.versions.splice(idx, 1);
      if (this.selectedVersionId === versionId) {
        this.selectedVersionId = this.versions[0]?.id || null;
      }
      await this.persistVersions();
      this.renderVersionListUI();

      if (this.NS.bus?.emit) {
        this.NS.bus.emit(
          this.NS.constants?.EVENTS?.VERSION_DELETED || 'version:deleted',
          { versionId, reason: target.reason }
        );
      }
      this.utils.showToast('🗑️ Đã xóa mốc phiên bản khỏi danh sách.', 'info', 2000);
      return true;
    }

    renderVersionListUI() {
      this.listRenderer.renderList();
      const activeVer = this.getSelectedVersionObject();
      this.listRenderer.renderInlinePreview(activeVer);
    }

    bindDomEvents() {
      if (typeof document === 'undefined') return;
      const bind = (id, fn) => {
        const el = document.getElementById(id);
        if (!el || el.dataset.noirMod10Bound) return;
        el.dataset.noirMod10Bound = '1';
        el.addEventListener('click', fn);
      };

      bind('btn-create-manual-version', async () => {
        const active = this.NS.chapterManager?.getActiveChapter?.();
        const defaultHint = active
          ? `Mốc lưu: ${active.displayTitle}`
          : 'Mốc đánh dấu thủ công';
        const label = await this.bookmarkDialog.askVersionBookmarkLabel(defaultHint);
        if (!label) return;
        await this.createSnapshot(label, 'MANUAL_BOOKMARK', {
          bypassThrottle: true,
          silent: false
        });
      });

      bind('btn-open-fullscreen-version-preview', () => {
        this.openFullscreenStatePreviewModal();
      });

      bind('btn-restore-selected-version', () => {
        this.restoreSelectedVersion();
      });

      bind('btn-fs-restore-version-now', () => {
        this.restoreSelectedVersion();
      });

      bind('btn-close-fs-version-preview', () => {
        this.simulator.closeModal();
      });

      document.querySelectorAll('.ver-preview-tab-btn').forEach((btn) => {
        if (btn.dataset.noirMod10TabBound) return;
        btn.dataset.noirMod10TabBound = '1';
        btn.addEventListener('click', () => {
          const tabKey = btn.getAttribute('data-ver-tab') || 'MANUSCRIPT';
          const ver = this.getSelectedVersionObject();
          this.simulator.switchPreviewTab(tabKey, ver);
        });
      });

      // Nút truy cập nhanh Kho Phiên Bản ngay trên thanh Header (#btn-header-quick-versions)
      bind('btn-header-quick-versions', () => {
        if (this.NS.navigator?.switchScreen) {
          this.NS.navigator.switchScreen('SCREEN_6_SYSTEM');
        } else {
          document.querySelector('[data-screen="SCREEN_6_SYSTEM"]')?.click();
        }
        setTimeout(() => {
          const vaultBox = document.getElementById('tab6-version-history-vault');
          vaultBox?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          this.renderVersionListUI();
        }, 80);
      });
    }

    async init() {
      if (this.initialized) return this;
      this.initialized = true;
      this.bindDomEvents();
      await this.loadFromStorage();

      // Nếu mở app lần đầu đã có chương chữ nhưng chưa từng có version nào -> tạo mốc khởi điểm ngay
      if (this.versions.length === 0) {
        const chaps = this.NS.chapterManager?.chapters || [];
        const hasWords = chaps.some((c) => (c.content || '').trim().length > 0);
        if (hasWords) {
          await this.createSnapshot('Điểm khởi đầu phiên làm việc', 'AUTO_CONTINUOUS', {
            bypassThrottle: true,
            silent: true
          });
        }
      }
      return this;
    }
  }

  // ==========================================================================
  // PHẦN 8: BIỂU ĐỒ SVG XU HƯỚNG PHIÊN BẢN, KHÔI PHỤC RIÊNG CHƯƠNG & ĐĂNG KÝ
  // ==========================================================================

  class VersionWordGrowthSparklineSvg {
    constructor(vaultEngine) {
      this.vault = vaultEngine;
    }

    /**
     * Vẽ biểu đồ SVG đường tăng trưởng số từ qua các mốc phiên bản gần đây
     * giúp tác giả quan sát trực quan nhịp độ bồi đắp tác phẩm trong Tab 6.
     */
    buildSparklineCardHtml() {
      const list = (this.vault.versions || []).slice(0, 14).reverse();
      if (list.length < 2) return '';

      const values = list.map((v) => v.snapshot?.totalWords || 0);
      const minVal = Math.min(...values);
      const maxVal = Math.max(...values);
      const span = Math.max(1, maxVal - minVal);

      const width = 320;
      const height = 46;
      const padX = 8;
      const padY = 6;

      const coords = values.map((val, idx) => {
        const x =
          padX +
          (idx / Math.max(1, values.length - 1)) * (width - padX * 2);
        const y =
          height -
          padY -
          ((val - minVal) / span) * (height - padY * 2);
        return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
      });

      const polyPoints = coords.map((p) => `${p[0]},${p[1]}`).join(' ');
      const areaPoints = `${padX},${height - padY} ${polyPoints} ${coords[coords.length - 1][0]},${height - padY}`;
      const latestWords = values[values.length - 1];
      const deltaTotal = latestWords - values[0];
      const deltaLabel =
        deltaTotal >= 0
          ? `+${deltaTotal.toLocaleString('vi-VN')} từ`
          : `${deltaTotal.toLocaleString('vi-VN')} từ`;

      return `
        <div id="mod10-version-sparkline-box" class="mb-2 p-2.5 rounded-xl border border-zinc-800/90 bg-zinc-950/80 space-y-1">
          <div class="flex items-center justify-between text-[10px]">
            <span class="font-bold text-indigo-300">📈 Đường tăng trưởng (${list.length} mốc gần nhất)</span>
            <span class="${deltaTotal >= 0 ? 'text-emerald-400' : 'text-rose-400'} font-bold">${deltaLabel}</span>
          </div>
          <svg viewBox="0 0 ${width} ${height}" class="w-full h-11 overflow-visible" aria-hidden="true">
            <defs>
              <linearGradient id="mod10SparkFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#6366f1" stop-opacity="0.38" />
                <stop offset="100%" stop-color="#6366f1" stop-opacity="0.02" />
              </linearGradient>
            </defs>
            <polygon points="${areaPoints}" fill="url(#mod10SparkFill)" />
            <polyline fill="none" stroke="#818cf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${polyPoints}" />
            ${coords
              .map(
                (pt, i) =>
                  `<circle cx="${pt[0]}" cy="${pt[1]}" r="${i === coords.length - 1 ? 3.2 : 1.8}" fill="${
                    i === coords.length - 1 ? '#34d399' : '#a5b4fc'
                  }" />`
              )
              .join('')}
          </svg>
        </div>
      `;
    }
  }

  class VersionEventBusAutoRecorder {
    constructor(vaultEngine) {
      this.NS = window.NoirStudio;
      this.vault = vaultEngine;
      this._bound = false;
    }

    subscribeLifecycleSnapshots() {
      if (this._bound || !this.NS.bus || typeof this.NS.bus.on !== 'function') {
        return;
      }
      this._bound = true;

      const events = this.NS.constants?.EVENTS || {};
      const approvedEvt = events.CHAPTER_APPROVED || 'chapter:approved';
      const diffActivateEvt = events.AI_DIFF_ACTIVATED || 'aidiff:activated';
      const screenChangedEvt = events.SCREEN_CHANGED || 'screen:changed';

      this.NS.bus.on(approvedEvt, (payload) => {
        const title = payload?.chapter?.displayTitle || 'Chương truyện';
        this.vault.createSnapshot(`Chốt bản đã duyệt: ${title}`, 'CHAPTER_APPROVED', {
          bypassThrottle: true,
          silent: true
        });
      });

      this.NS.bus.on(diffActivateEvt, () => {
        this.vault.createSnapshot(
          'Trước khi áp dụng đoạn AI vào bản thảo',
          'PRE_AI_APPLY',
          { bypassThrottle: false, silent: true }
        );
      });

      this.NS.bus.on(screenChangedEvt, (payload) => {
        if (payload?.screen === 'SCREEN_6_SYSTEM') {
          this.vault.renderVersionListUI();
        }
      });
    }
  }

  // Mở rộng khung Preview toàn màn hình hỗ trợ nút Khôi Phục Riêng 1 Chương & Xuất JSON Kho Phiên Bản
  const origRenderStage = FullscreenVersionSimulatorRenderer.prototype.renderStageContent;
  FullscreenVersionSimulatorRenderer.prototype.renderStageContent = function (versionObj) {
    origRenderStage.call(this, versionObj);
    if (typeof document === 'undefined' || !versionObj) return;
    const stage = document.getElementById('fs-version-preview-stage');
    if (!stage || this.currentModalTab !== 'MANUSCRIPT') return;

    const targetChapId =
      this.inspectedOldChapterId || versionObj.snapshot?.activeChapterId;
    if (!targetChapId) return;

    const actionBar = document.createElement('div');
    actionBar.className =
      'max-w-3xl mx-auto mt-3 flex flex-wrap items-center justify-between gap-2 text-xs';
    actionBar.innerHTML = `
      <span class="text-[11px] text-zinc-400">💡 Bạn có thể chọn khôi phục toàn bộ dự án hoặc chỉ lấy lại riêng chương đang xem này:</span>
      <div class="flex flex-wrap gap-2">
        <button type="button" id="btn-mod10-restore-single-chap" class="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/40 text-amber-200 text-xs font-bold transition">
          📑 Chỉ Khôi Phục Riêng Chương Này
        </button>
        <button type="button" id="btn-mod10-export-vault-json" class="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-semibold transition">
          📦 Xuất Lịch Sử (.JSON)
        </button>
      </div>
    `;
    stage.appendChild(actionBar);

    actionBar
      .querySelector('#btn-mod10-restore-single-chap')
      ?.addEventListener('click', async () => {
        const ok = await this.vault.singleChapterRestorer.restoreOnlySingleChapterFromVersion(
          versionObj,
          targetChapId
        );
        if (ok) this.closeModal();
      });

    actionBar
      .querySelector('#btn-mod10-export-vault-json')
      ?.addEventListener('click', () => {
        this.vault.analytics.exportVersionVaultArchiveJson();
      });
  };

  // Mở rộng hiển thị Sparkline tăng trưởng ở đầu danh sách Tab 6
  const origRenderList = VersionTab6ListAndInlinePreviewRenderer.prototype.renderList;
  VersionTab6ListAndInlinePreviewRenderer.prototype.renderList = function () {
    origRenderList.call(this);
    if (typeof document === 'undefined') return;
    const listEl = document.getElementById('version-history-list-container');
    if (!listEl || !this.vault.sparklineSvg) return;
    const sparkHtml = this.vault.sparklineSvg.buildSparklineCardHtml();
    if (sparkHtml && !listEl.querySelector('#mod10-version-sparkline-box')) {
      listEl.insertAdjacentHTML('afterbegin', sparkHtml);
    }
  };

  // Khởi tạo singleton & đăng ký `window.NoirStudio.versionVault`
  const versionVault = new VersionTimeMachineVaultEngine();
  versionVault.sparklineSvg = new VersionWordGrowthSparklineSvg(versionVault);
  versionVault.busRecorder = new VersionEventBusAutoRecorder(versionVault);

  // ==========================================================================
  // PHẦN 9: SO SÁNH HAI MỐC PHIÊN BẢN BẤT KỲ & DỌN DẸP MỐC RỖNG / TRÙNG LẶP
  // ==========================================================================

  class VersionPairDiffDialogController {
    constructor(vaultEngine) {
      this.NS = window.NoirStudio;
      this.vault = vaultEngine;
      this.pinnedBaselineVersionId = null;
    }

    pinVersionAsBaseline(versionId) {
      const ver = this.vault.versions.find((v) => v.id === versionId);
      if (!ver) return false;
      this.pinnedBaselineVersionId = ver.id;
      this.vault.utils.showToast(
        `📌 Đã ghim mốc "${ver.reason}" làm Bản Gốc để so sánh! Bây giờ hãy chọn một mốc khác và bấm So sánh.`,
        'info',
        3600
      );
      return true;
    }

    openCompareTwoVersionsModal(baselineId, targetId) {
      if (typeof document === 'undefined') return false;
      const baseVer =
        this.vault.versions.find((v) => v.id === (baselineId || this.pinnedBaselineVersionId)) ||
        this.vault.versions[1];
      const targetVer =
        this.vault.versions.find((v) => v.id === (targetId || this.vault.selectedVersionId)) ||
        this.vault.versions[0];

      if (!baseVer || !targetVer || baseVer.id === targetVer.id) {
        this.vault.utils.showToast(
          'ℹ️ Cần có ít nhất 2 phiên bản khác nhau (hoặc ghim 1 mốc khác) để đối chiếu.',
          'info'
        );
        return false;
      }

      const [olderVer, newerVer] =
        (baseVer.createdAt || 0) <= (targetVer.createdAt || 0)
          ? [baseVer, targetVer]
          : [targetVer, baseVer];

      const summary = this.vault.pairComparator.compareTwoSnapshotsSummary(olderVer, newerVer);
      const oldChap =
        (olderVer.snapshot?.chapters || []).find((c) => c.id === newerVer.snapshot?.activeChapterId) ||
        (olderVer.snapshot?.chapters || [])[0];
      const newChap =
        (newerVer.snapshot?.chapters || []).find((c) => c.id === newerVer.snapshot?.activeChapterId) ||
        (newerVer.snapshot?.chapters || [])[0];

      const diffRes = this.vault.utils?.computeLineDiff
        ? this.vault.utils.computeLineDiff(oldChap?.content || '', newChap?.content || '')
        : { ops: [], addedLines: 0, removedLines: 0 };

      const existing = document.getElementById('mod10-pair-compare-modal');
      if (existing) existing.remove();

      const esc = (s) => this.vault.utils.escapeHtml(s);
      const opsHtml = diffRes.ops
        .filter((op) => op.text.trim().length > 0)
        .slice(0, 220)
        .map((op) => {
          if (op.type === 'ADDED') {
            return `<div class="px-2.5 py-1 rounded bg-emerald-500/15 border-l-4 border-emerald-500 text-emerald-200 text-xs my-1">+ ${esc(op.text)}</div>`;
          }
          if (op.type === 'REMOVED') {
            return `<div class="px-2.5 py-1 rounded bg-rose-500/15 border-l-4 border-rose-500 text-rose-200 text-xs my-1 line-through opacity-85">- ${esc(op.text)}</div>`;
          }
          return `<div class="px-2.5 py-0.5 text-zinc-400 text-xs">${esc(op.text)}</div>`;
        })
        .join('');

      const overlay = document.createElement('div');
      overlay.id = 'mod10-pair-compare-modal';
      overlay.className =
        'fixed inset-0 z-[10030] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6';

      overlay.innerHTML = `
        <div class="w-full max-w-4xl max-h-[88vh] rounded-2xl border border-indigo-500/40 bg-zinc-950 flex flex-col overflow-hidden shadow-2xl">
          <div class="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900">
            <div>
              <h3 class="text-sm font-extrabold text-indigo-300">🔍 Đối Chiếu Hai Phiên Bản Quá Khứ</h3>
              <p class="text-[11px] text-zinc-400">
                Cũ hơn: <span class="text-rose-300">${esc(olderVer.reason)}</span> (${esc(this.vault.utils.formatTimestampVN(olderVer.createdAt))})
                ⇄ Mới hơn: <span class="text-emerald-300">${esc(newerVer.reason)}</span> (${esc(this.vault.utils.formatTimestampVN(newerVer.createdAt))})
              </p>
            </div>
            <button type="button" id="btn-close-mod10-pair-diff" class="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200">✕ Đóng</button>
          </div>
          <div class="px-4 py-2 border-b border-zinc-800/80 bg-zinc-900/60 flex flex-wrap items-center gap-4 text-xs">
            <span class="font-bold text-zinc-200">Biến động toàn truyện: <span class="${summary.netWordChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${summary.netWordChange >= 0 ? '+' : ''}${summary.netWordChange} từ</span></span>
            <span class="text-zinc-400">Số chương sửa: <b class="text-amber-300">${summary.modifiedChapters.length}</b></span>
            <span class="text-emerald-300">+${diffRes.addedLines} dòng thêm</span>
            <span class="text-rose-300">-${diffRes.removedLines} dòng bớt</span>
          </div>
          <div class="p-4 overflow-y-auto flex-1 space-y-1 font-serifNovel leading-relaxed">
            ${opsHtml || '<div class="text-xs text-zinc-500 italic p-6 text-center">Hai phiên bản có nội dung chương đang mở giống hệt nhau.</div>'}
          </div>
        </div>
      `;

      document.body.appendChild(overlay);
      overlay.querySelector('#btn-close-mod10-pair-diff')?.addEventListener('click', () => overlay.remove());
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
      });
      return true;
    }
  }

  class VersionVaultMaintenanceCleaner {
    constructor(vaultEngine) {
      this.vault = vaultEngine;
    }

    /**
     * Quét dọn các bản chụp Auto bị trùng dấu vân tay (`fingerprint`) liên tiếp nhau
     * để danh sách Phiên bản gọn gàng và dễ tra cứu hơn.
     */
    async deduplicateRedundantSnapshots() {
      const seenFingerprints = new Set();
      const cleaned = [];
      let removedCount = 0;

      (this.vault.versions || []).forEach((v) => {
        const meta = VERSION_SNAPSHOT_TYPES[v.type];
        const isHighPriority = meta && meta.priority >= 4;
        if (!v.fingerprint || isHighPriority || !seenFingerprints.has(v.fingerprint)) {
          if (v.fingerprint) seenFingerprints.add(v.fingerprint);
          cleaned.push(v);
        } else {
          removedCount += 1;
        }
      });

      if (removedCount > 0) {
        this.vault.versions = cleaned;
        await this.vault.persistVersions();
        this.vault.renderVersionListUI();
        this.vault.utils.showToast(
          `🧹 Đã dọn gọn ${removedCount} bản chụp tự động trùng lặp mà vẫn giữ nguyên 100% các mốc quan trọng!`,
          'success'
        );
      }
      return removedCount;
    }

    /**
     * Xuất nhật ký tiến hóa bản thảo dạng Markdown để tác giả lưu hồ sơ biên tập
     */
    exportVersionChangelogMarkdown() {
      const list = this.vault.versions || [];
      if (!list.length) return '';
      const lines = [
        '# 🕰️ NHẬT KÝ CÁC PHIÊN BẢN SÁNG TÁC (VERSION TIMELINE)',
        `> Xuất lúc: ${this.vault.utils.formatTimestampVN(Date.now())}`,
        ''
      ];

      list.forEach((v, idx) => {
        const snap = v.snapshot || {};
        lines.push(
          `${idx + 1}. **[${this.vault.utils.formatTimestampVN(v.createdAt)}]** — ${v.reason || snap.activeChapterTitle} (${(snap.totalWords || 0).toLocaleString('vi-VN')} từ, ${snap.totalChapters || 0} chương)`
        );
      });

      const md = lines.join('\n');
      const blob = new Blob(['\uFEFF' + md], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NhatKy_PhienBan_${new Date().toISOString().slice(0, 10)}.md`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2500);
      return md;
    }
  }

  // ==========================================================================
  // PHẦN 10: TÌM KIẾM TOÀN VĂN XUYÊN SUỐT TẤT CẢ CÁC PHIÊN BẢN QUÁ KHỨ
  // ==========================================================================

  class VersionVaultFullTextSearcher {
    constructor(vaultEngine) {
      this.vault = vaultEngine;
    }

    /**
     * Tìm kiếm một câu hoặc chi tiết cũ bên trong toàn bộ nội dung chữ của
     * mọi phiên bản đã lưu trong Kho Lịch Sử (giúp tìm lại đoạn văn từng viết rồi xóa).
     */
    searchInsideHistoricalContents(rawQuery, maxHits = 12) {
      const q = String(rawQuery || '').trim().toLowerCase();
      if (q.length < 2) return [];
      const hits = [];
      const list = this.vault.versions || [];

      for (let i = 0; i < list.length; i += 1) {
        const ver = list[i];
        const chaps = ver.snapshot?.chapters || [];
        for (let ci = 0; ci < chaps.length; ci += 1) {
          const c = chaps[ci];
          const text = String(c.content || '');
          const pos = text.toLowerCase().indexOf(q);
          if (pos !== -1) {
            const start = Math.max(0, pos - 40);
            const end = Math.min(text.length, pos + q.length + 70);
            hits.push({
              versionId: ver.id,
              reason: ver.reason,
              createdAt: ver.createdAt,
              chapterId: c.id,
              chapterTitle: c.displayTitle || c.title,
              snippet: `${start > 0 ? '…' : ''}${text.slice(start, end).replace(/\s+/g, ' ').trim()}${end < text.length ? '…' : ''}`
            });
            if (hits.length >= maxHits) return hits;
          }
        }
      }
      return hits;
    }

    /**
     * Mở hộp thoại tìm nhanh một đoạn chữ cũ từng xuất hiện trong lịch sử lưu trữ
     */
    openDeepHistorySearchDialog() {
      if (typeof document === 'undefined') return;
      const existing = document.getElementById('mod10-deep-search-modal');
      if (existing) existing.remove();

      const esc = (s) => this.vault.utils.escapeHtml(s);
      const overlay = document.createElement('div');
      overlay.id = 'mod10-deep-search-modal';
      overlay.className =
        'fixed inset-0 z-[10031] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4';

      overlay.innerHTML = `
        <div class="w-full max-w-xl max-h-[82vh] rounded-2xl border border-zinc-700 bg-zinc-950 flex flex-col overflow-hidden shadow-2xl">
          <div class="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900">
            <h3 class="text-sm font-extrabold text-emerald-300">🔎 Tìm Lại Đoạn Văn Đã Xóa Trong Toàn Bộ Phiên Bản</h3>
            <button type="button" id="btn-close-mod10-deep-search" class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200">✕</button>
          </div>
          <div class="p-3 border-b border-zinc-800">
            <input type="text" id="input-mod10-deep-content-q" placeholder="Nhập cụm từ hoặc tên nhân vật từng xuất hiện ở bản cũ…" class="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-zinc-100 focus:border-emerald-500 outline-none" />
          </div>
          <div id="mod10-deep-search-results" class="p-3 overflow-y-auto space-y-2 flex-1 text-xs text-zinc-400">
            Gõ ít nhất 2 ký tự để lục lại toàn bộ kho lịch sử ${this.vault.versions.length} phiên bản.
          </div>
        </div>
      `;

      document.body.appendChild(overlay);
      overlay.querySelector('#btn-close-mod10-deep-search')?.addEventListener('click', () => overlay.remove());
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
      });

      const qInput = overlay.querySelector('#input-mod10-deep-content-q');
      const resBox = overlay.querySelector('#mod10-deep-search-results');

      qInput?.addEventListener('input', () => {
        const val = qInput.value.trim();
        if (val.length < 2) {
          resBox.innerHTML = 'Hãy nhập thêm ký tự để tìm kiếm sâu...';
          return;
        }
        const hits = this.searchInsideHistoricalContents(val, 15);
        if (hits.length === 0) {
          resBox.innerHTML = '<div class="italic text-zinc-500 p-4 text-center">Không tìm thấy cụm từ này trong lịch sử lưu trữ.</div>';
          return;
        }
        resBox.innerHTML = hits
          .map(
            (h) => `
          <div class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 space-y-1">
            <div class="flex items-center justify-between gap-2">
              <span class="font-bold text-indigo-300 truncate">${esc(h.reason)} • ${esc(h.chapterTitle)}</span>
              <button type="button" data-open-hit-ver="${esc(h.versionId)}" class="px-2 py-0.5 rounded bg-emerald-600/25 text-emerald-300 text-[11px] font-bold shrink-0">👁️ Xem bản này</button>
            </div>
            <div class="text-zinc-300 text-[11px] italic">${esc(h.snippet)}</div>
          </div>
        `
          )
          .join('');

        resBox.querySelectorAll('[data-open-hit-ver]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const vid = btn.getAttribute('data-open-hit-ver');
            overlay.remove();
            this.vault.selectVersionForPreview(vid);
            this.vault.openFullscreenStatePreviewModal(vid);
          });
        });
      });

      setTimeout(() => qInput?.focus(), 20);
    }
  }

  versionVault.deepSearcher = new VersionVaultFullTextSearcher(versionVault);
  versionVault.pairDiffController = new VersionPairDiffDialogController(versionVault);
  versionVault.maintenanceCleaner = new VersionVaultMaintenanceCleaner(versionVault);

  // Tích hợp nút Ghim & So sánh cặp phiên bản trực tiếp vào Khung Xem Trước Nhanh Tab 6
  const origRenderInline = VersionTab6ListAndInlinePreviewRenderer.prototype.renderInlinePreview;
  VersionTab6ListAndInlinePreviewRenderer.prototype.renderInlinePreview = function (versionObj) {
    origRenderInline.call(this, versionObj);
    if (typeof document === 'undefined' || !versionObj) return;
    const box = document.getElementById('version-preview-content-box');
    if (!box) return;

    const compareBar = document.createElement('div');
    compareBar.className =
      'mt-4 pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]';
    const hasPinned = Boolean(this.vault.pairDiffController?.pinnedBaselineVersionId);
    compareBar.innerHTML = `
      <span class="text-zinc-400">🔍 Muốn đối chiếu mốc này với một bản cũ hơn?</span>
      <div class="flex flex-wrap gap-1.5">
        <button type="button" id="btn-mod10-pin-ver-compare" class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-semibold transition">
          📌 Ghim Làm Bản Gốc
        </button>
        <button type="button" id="btn-mod10-run-pair-diff" class="px-2.5 py-1 rounded-lg ${hasPinned ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-200' : 'bg-zinc-800/70 border-zinc-700 text-zinc-300'} border font-semibold transition">
          ⇄ So Sánh Với Bản Đã Ghim / Liền Trước
        </button>
        <button type="button" id="btn-mod10-export-md-log" class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 transition">
          📄 Xuất Nhật Ký (.MD)
        </button>
      </div>
    `;
    box.appendChild(compareBar);

    compareBar.querySelector('#btn-mod10-pin-ver-compare')?.addEventListener('click', () => {
      this.vault.pairDiffController.pinVersionAsBaseline(versionObj.id);
    });
    compareBar.querySelector('#btn-mod10-run-pair-diff')?.addEventListener('click', () => {
      const baseId =
        this.vault.pairDiffController.pinnedBaselineVersionId ||
        this.vault.versions[1]?.id ||
        null;
      this.vault.pairDiffController.openCompareTwoVersionsModal(baseId, versionObj.id);
    });
    compareBar.querySelector('#btn-mod10-export-md-log')?.addEventListener('click', () => {
      this.vault.maintenanceCleaner.exportVersionChangelogMarkdown();
      this.vault.utils.showToast('📄 Đã tải xuống Nhật ký Phiên bản Markdown!', 'success');
    });
  };

  const origInitMod10 = versionVault.init.bind(versionVault);
  versionVault.init = async function initEnhancedMod10() {
    await origInitMod10();
    versionVault.busRecorder.subscribeLifecycleSnapshots();
    return versionVault;
  };

  versionVault.getHealthSummary = function () {
    const list = Array.isArray(versionVault.versions) ? versionVault.versions : [];
    const totalWordsLatest = list[0]?.totalWords || 0;
    const pinnedCount = list.filter((v) => v.pinned || v.type === 'MANUAL').length;
    return {
      module: 'mod10_version_time_machine_and_live_preview.js',
      snapshotsCount: list.length,
      pinnedCount,
      latestVersionLabel: list[0]?.reason || 'Chưa có mốc',
      totalWordsLatest
    };
  };

  versionVault.exportSingleVersionHtmlSnapshot = function (versionId) {
    const ver =
      (versionVault.versions || []).find((v) => v.id === versionId) ||
      versionVault.versions?.[0];
    if (!ver) return null;
    const esc = (s) =>
      String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    const chapters = ver.stateSnapshot?.chapters || [];
    const bodyHtml = chapters
      .map(
        (ch) =>
          `<section><h2>${esc(ch.displayTitle || ch.title)}</h2><pre style="white-space:pre-wrap;font-family:serif;">${esc(ch.content || '')}</pre></section>`
      )
      .join('<hr/>');
    return `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>${esc(ver.reason)}</title></head><body><h1>Mốc phiên bản: ${esc(ver.reason)}</h1>${bodyHtml}</body></html>`;
  };

  NS.VersionTimeMachineVaultEngine = VersionTimeMachineVaultEngine;
  NS.versionVault = versionVault;

  if (typeof NS.registerModule === 'function') {
    NS.registerModule('mod10', versionVault);
  }
})(typeof window !== 'undefined' ? window : globalThis);
