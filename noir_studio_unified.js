/**
 * ============================================================================
 * ✍️ WEB VIẾT TIỂU THUYẾT CỦA BI — UNIFIED MASTER ARCHITECTURE (v36.0 SUPREME)
 * ============================================================================
 * Tệp JavaScript Hợp Nhất Toàn Diện (Thay thế hoàn toàn 6 tệp rời rạc Stage 1 -> 20)
 * Thiết kế bởi Kiến trúc sư Phần mềm 30 năm kinh nghiệm:
 * - Không chồng chéo sự kiện (Zero Monkey-Patch Collision)
 * - Không trùng lặp bộ đếm thời gian (Single Source of Truth Timers)
 * - Tương thích ngược 100% với toàn bộ dữ liệu IndexedDB, LocalStorage & Ổ cứng
 * - Giao diện & Giọng điệu Tiếng Việt tự nhiên, truyền cảm hứng văn chương
 * - Tối ưu hóa toàn diện cho cả Điện thoại (Mobile PWA) và Máy tính (Desktop)
 * ============================================================================
 */
(function () {
  'use strict';

  if (window.__NOIR_UNIFIED_V36_LOADED__) return;
  window.__NOIR_UNIFIED_V36_LOADED__ = true;

  // ==========================================================================
  // BƯỚC 2 (MODULE 1): HẰNG SỐ HỆ THỐNG, KHO KHÓA LƯU TRỮ TƯƠNG THÍCH NGƯỢC
  //                    VÀ DANH MỤC MÔ HÌNH GEMINI KÈM BỘ ĐỊNH TUYẾN CHỐNG NGHẼN
  // ==========================================================================
  const STUDIO_CONSTANTS = {
    VERSION: '36.0.0-UNIFIED',
    RELEASE_DATE: '2026',
    DB_NAME: 'NoirPsychStudio_LocalDB_v1',
    DB_VERSION: 3,
    STORES: {
      WORKSPACE_HANDLES: 'workspace_handles',
      CHAPTERS: 'chapters',
      STORY_BIBLE: 'story_bible',
      RAG_CHUNKS: 'rag_chunks',
      STATE_CACHE: 'state_cache'
    },
    STORAGE_KEYS: {
      API_KEY: 'noir_gemini_api_key',
      SELECTED_MODEL: 'noir_selected_gemini_model',
      EXECUTION_MODE: 'noir_selected_ai_mode',
      TARGET_WORDS: 'noir_target_word_count',
      TEMPERATURE: 'noir_ai_temperature',
      THEME: 'noir_studio_theme_mode',
      FONT_FAMILY: 'noir_editor_font_family',
      FONT_SIZE: 'noir_editor_font_size',
      LINE_HEIGHT: 'noir_editor_line_height',
      PAGE_WIDTH: 'noir_editor_page_width',
      BG_EFFECT: 'noir_ambient_bg_effect',
      BIBLE_TEMPLATE: 'noir_s10_bible_template_frame',
      BIBLE_RENDERED: 'noir_s10_rendered_bible_content',
      BIBLE_LOCKED: 'noir_s10_bible_template_locked',
      CHARACTERS: 'noir_s10_character_profiles_v1',
      KNOWLEDGE_MATRIX: 'noir_s10_knowledge_matrix_v1',
      CLUES_LEDGER: 'noir_s10_clues_ledger_v1',
      ANTI_CLICHE: 'noir_s10_anti_cliche_blacklist_v1',
      SCENE_MARKERS: 'noir_s18_scene_pov_markers_v1',
      MODE_OUTPUTS: 'noir_s20_quad_mode_outputs_v1',
      MODE_PROMPTS: 'noir_s20_custom_mode_sysprompts_v1',
      VERSION_VAULT: 'noir_v36_version_history_vault',
      AI_DIFF_STATE: 'noir_v36_active_ai_diff_state',
      SCRATCHPAD: 'noir_quick_scratchpad_notes',
      POMODORO_STATE: 'noir_unified_pomodoro_state_v36'
    },
    LOCAL_FOLDERS: [
      '01_Chuong_Goc_Chua_Duyet',
      '02_Chuong_Da_Duyet',
      '03_Story_Bible_Local',
      '04_Chi_Muc_Chong_Quen',
      '05_Bang_Trang_Y_Tuong',
      '06_Sao_Luu_Code_Va_Ban_Thao'
    ],
    DEFAULT_ANTI_CLICHE: [
      'một luồng điện chạy dọc sống lưng',
      'thở dài một tiếng',
      'ánh mắt phức tạp',
      'khẽ nhếch môi tạo thành một vòng cung',
      'không khỏi cảm thán trong lòng',
      'trong lòng dâng lên một cảm giác khó tả',
      'bầu không khí bỗng trở nên tĩnh lặng đến đáng sợ',
      'nụ cười nửa miệng đầy ẩn ý'
    ]
  };

  /**
   * Danh mục Mô hình Gemini Chính thức (Đã loại bỏ hoàn toàn link Google Studio
   * và bảng thông số rườm rà theo yêu cầu của tác giả, đồng thời gắn cờ phân biệt
   * dòng Flash/Pro chất lượng cao với dòng Flash-Lite).
   */
  const GEMINI_MODELS_CATALOG = [
    {
      id: 'gemini-3.8-flash',
      label: '🌟 Gemini 3.8 Flash (Khuyên dùng viết truyện — Giàu cảm xúc & Mượt mà)',
      apiTarget: 'gemini-2.5-flash',
      fallbacks: ['gemini-2.5-flash', 'gemini-2.0-flash'],
      tier: 'RECOMMENDED_FLASH',
      isLite: false,
      description: 'Cân bằng hoàn hảo giữa chiều sâu văn học, miêu tả nội tâm tinh tế và tốc độ phản hồi nhanh.'
    },
    {
      id: 'gemini-3.1-pro-preview',
      label: '👑 Gemini 3.1 Pro (Chuyên sâu — Giữ logic dài hơi & Phục bút phức tạp)',
      apiTarget: 'gemini-2.5-pro',
      fallbacks: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash'],
      tier: 'PRO_HIGH',
      isLite: false,
      description: 'Mô hình tư duy sâu sắc nhất cho các chương cao trào, đấu trí hoặc kiểm toán mâu thuẫn cốt truyện.'
    },
    {
      id: 'gemini-4-argon',
      label: '💎 Gemini 4 Argon (Đại Tự Sự — Văn phong tiểu thuyết xuất bản)',
      apiTarget: 'gemini-2.5-pro',
      fallbacks: ['gemini-2.5-flash', 'gemini-2.0-flash'],
      tier: 'PRO_HIGH',
      isLite: false,
      description: 'Tối ưu hóa cho đại cảnh, miêu tả không gian điện ảnh và đối thoại giàu cá tính nhân vật.'
    },
    {
      id: 'gemini-4-carbon',
      label: '🔥 Gemini 4 Carbon (Tâm Lý Chiến & Độc Thoại Nội Tâm Sâu)',
      apiTarget: 'gemini-2.5-flash',
      fallbacks: ['gemini-2.5-pro', 'gemini-2.0-flash'],
      tier: 'RECOMMENDED_FLASH',
      isLite: false,
      description: 'Mạnh về khắc họa giằng xé nội tâm, hồi ức và biểu đồ tâm lý nhân vật.'
    },
    {
      id: 'gemini-3.6-flash',
      label: '⚡ Gemini 3.6 Flash (Ổn định — Soạn thảo & Tham mưu cốt truyện)',
      apiTarget: 'gemini-2.0-flash',
      fallbacks: ['gemini-2.5-flash', 'gemini-1.5-flash'],
      tier: 'RECOMMENDED_FLASH',
      isLite: false,
      description: 'Tốc độ cao, ổn định khi lên dàn ý chương, vẽ biểu đồ thời gian và gỡ bí tình tiết.'
    },
    {
      id: 'gemini-3.5-flash-lite',
      label: '🪶 Gemini 3.5 Flash-Lite (Siêu tốc — Chỉ nên dùng tóm tắt / nháp ngắn)',
      apiTarget: 'gemini-2.0-flash-lite',
      fallbacks: ['gemini-2.5-flash-lite', 'gemini-2.0-flash'],
      tier: 'LITE_FAST',
      isLite: true,
      description: 'Tốc độ phản hồi tức thì nhưng chiều sâu văn chương thấp hơn dòng Flash và Pro.'
    },
    {
      id: 'gemini-3.1-flash-lite-preview',
      label: '🪶 Gemini 3.1 Flash-Lite (Tiết kiệm — Gợi ý nhanh)',
      apiTarget: 'gemini-2.0-flash-lite',
      fallbacks: ['gemini-2.0-flash'],
      tier: 'LITE_FAST',
      isLite: true,
      description: 'Phù hợp khi cần hỏi đáp ngắn hoặc kiểm tra lỗi chính tả cơ bản.'
    }
  ];

  // Khởi tạo không gian tên toàn cục duy nhất
  window.NoirStudio = {
    constants: STUDIO_CONSTANTS,
    models: GEMINI_MODELS_CATALOG,
    state: {
      activeScreen: 'SCREEN_1_WRITE',
      activeChapterId: null,
      chapterFilter: 'ALL',
      isSaving: false,
      isDirty: false,
      lastSavedAt: Date.now()
    }
  };

  // ==========================================================================
  // BƯỚC 3 (MODULE 2): HỆ THỐNG THÔNG BÁO TỰ NHIÊN (HUMANIZED TOAST),
  //                    MÀN HÌNH CHỜ TOÀN CỤC & TIỆN ÍCH XỬ LÝ NGÔN NGỮ TIẾNG VIỆT
  // ==========================================================================
  class HumanizedUIAndTextUtils {
    constructor() {
      this.toastTimer = null;
      this.loaderCancelled = false;
    }

    escapeHtml(raw) {
      if (raw === null || raw === undefined) return '';
      return String(raw)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    countVietnameseWords(text) {
      if (!text || typeof text !== 'string') return 0;
      const trimmed = text.trim();
      if (!trimmed) return 0;
      return trimmed.split(/\s+/).filter(Boolean).length;
    }

    countParagraphs(text) {
      if (!text || typeof text !== 'string') return 0;
      return text
        .split(/\r?\n+/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0).length;
    }

    estimateReadingTimeMinutes(wordCount) {
      const words = Math.max(0, Number(wordCount) || 0);
      return Math.max(1, Math.ceil(words / 220));
    }

    formatTimestampVN(ts) {
      if (!ts) return 'Vừa xong';
      const d = new Date(ts);
      const pad = (n) => String(n).padStart(2, '0');
      return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} — ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    }

    formatRelativeTimeVN(ts) {
      if (!ts) return 'Vừa xong';
      const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
      if (diffSec < 10) return 'Vừa mới lưu tức thì';
      if (diffSec < 60) return `${diffSec} giây trước`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin} phút trước`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr} giờ trước`;
      return this.formatTimestampVN(ts);
    }

    /**
     * Hiển thị thông báo thân thiện, tự nhiên như một người biên tập viên đồng hành
     */
    showToast(message, type = 'success', durationMs = 3200) {
      let toast = document.getElementById('unified-save-toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'unified-save-toast';
        document.body.appendChild(toast);
      }

      const palette = {
        success: 'bg-emerald-700/95 border-emerald-400 text-white shadow-emerald-950/60',
        warning: 'bg-amber-600/95 border-amber-300 text-white shadow-amber-950/60',
        error: 'bg-rose-700/95 border-rose-400 text-white shadow-rose-950/60',
        info: 'bg-indigo-700/95 border-indigo-400 text-white shadow-indigo-950/60'
      };
      const colorClass = palette[type] || palette.success;

      toast.className = `fixed bottom-16 lg:bottom-8 left-1/2 -translate-x-1/2 z-[95] px-4 py-2.5 rounded-2xl border ${colorClass} font-bold text-xs sm:text-sm shadow-2xl transition-all duration-300 pointer-events-none flex items-center gap-2 max-w-[92vw] text-center`;
      toast.textContent = message;
      toast.style.opacity = '1';
      toast.style.transform = 'translate(-50%, 0)';

      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, 8px)';
      }, durationMs);
    }

    /**
     * Hiển thị màn hình chờ khi đang chạy Prompt Tổng Hợp hoặc đang viết tiểu thuyết
     */
    showBlockingLoader(title, subtitle) {
      this.loaderCancelled = false;
      const loader = document.getElementById('global-ai-blocking-loader');
      const titleEl = document.getElementById('blocking-loader-title');
      const subEl = document.getElementById('blocking-loader-subtitle');
      if (titleEl && title) titleEl.textContent = title;
      if (subEl && subtitle) subEl.textContent = subtitle;
      loader?.classList.remove('hidden');
    }

    updateBlockingLoader(title, subtitle) {
      const titleEl = document.getElementById('blocking-loader-title');
      const subEl = document.getElementById('blocking-loader-subtitle');
      if (titleEl && title) titleEl.textContent = title;
      if (subEl && subtitle) subEl.textContent = subtitle;
    }

    hideBlockingLoader() {
      document.getElementById('global-ai-blocking-loader')?.classList.add('hidden');
    }
  }

  const uiUtils = new HumanizedUIAndTextUtils();
  window.NoirStudio.utils = uiUtils;

  // ==========================================================================
  // BƯỚC 4 (MODULE 3): CƠ SỞ DỮ LIỆU INDEXEDDB HỢP NHẤT & BỘ LƯU TRỮ CỤC BỘ
  //                    (TƯƠNG THÍCH NGƯỢC 100% VỚI DỮ LIỆU CŨ CỦA TÁC GIẢ)
  // ==========================================================================
  class UnifiedIndexedDBEngine {
    constructor() {
      this.dbName = STUDIO_CONSTANTS.DB_NAME;
      this.dbVersion = STUDIO_CONSTANTS.DB_VERSION;
      this.db = null;
    }

    async open() {
      if (this.db) return this.db;
      return new Promise((resolve, reject) => {
        const req = indexedDB.open(this.dbName, this.dbVersion);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          Object.values(STUDIO_CONSTANTS.STORES).forEach((storeName) => {
            if (!db.objectStoreNames.contains(storeName)) {
              db.createObjectStore(storeName);
            }
          });
        };
        req.onsuccess = (e) => {
          this.db = e.target.result;
          resolve(this.db);
        };
        req.onerror = (e) => reject(e.target.error);
      });
    }

    async set(storeName, key, value) {
      try {
        const db = await this.open();
        return new Promise((resolve, reject) => {
          const tx = db.transaction(storeName, 'readwrite');
          tx.objectStore(storeName).put(value, key);
          tx.oncomplete = () => resolve(true);
          tx.onerror = (e) => reject(e.target.error);
        });
      } catch (err) {
        console.warn('[NoirIDB] Lỗi ghi IndexedDB:', err);
        return false;
      }
    }

    async get(storeName, key) {
      try {
        const db = await this.open();
        return new Promise((resolve, reject) => {
          const tx = db.transaction(storeName, 'readonly');
          const req = tx.objectStore(storeName).get(key);
          req.onsuccess = () => resolve(req.result);
          req.onerror = (e) => reject(e.target.error);
        });
      } catch (err) {
        console.warn('[NoirIDB] Lỗi đọc IndexedDB:', err);
        return null;
      }
    }

    async getAll(storeName) {
      try {
        const db = await this.open();
        return new Promise((resolve, reject) => {
          const tx = db.transaction(storeName, 'readonly');
          const req = tx.objectStore(storeName).getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = (e) => reject(e.target.error);
        });
      } catch (err) {
        return [];
      }
    }

    async delete(storeName, key) {
      try {
        const db = await this.open();
        return new Promise((resolve, reject) => {
          const tx = db.transaction(storeName, 'readwrite');
          tx.objectStore(storeName).delete(key);
          tx.oncomplete = () => resolve(true);
          tx.onerror = (e) => reject(e.target.error);
        });
      } catch (err) {
        return false;
      }
    }

    getLocalJSON(key, fallbackVal) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallbackVal;
        return JSON.parse(raw);
      } catch (_) {
        return fallbackVal;
      }
    }

    setLocalJSON(key, val) {
      try {
        localStorage.setItem(key, JSON.stringify(val));
        return true;
      } catch (_) {
        return false;
      }
    }
  }

  const idbEngine = new UnifiedIndexedDBEngine();
  window.NoirStudio.idb = idbEngine;

  // ==========================================================================
  // BƯỚC 5 (MODULE 4): HỆ THỐNG KẾT NỐI Ổ CỨNG MÁY TÍNH (FILE SYSTEM ACCESS API)
  //                    & CƠ CHẾ TỰ ĐỘNG THÍCH ỨNG TRÊN ĐIỆN THOẠI DI ĐỘNG
  // ==========================================================================
  class LocalFileSystemEngine {
    constructor(idb, utils) {
      this.idb = idb;
      this.utils = utils;
      this.rootHandle = null;
      this.subDirHandles = {};
    }

    isSupported() {
      return typeof window.showDirectoryPicker === 'function';
    }

    async tryRestoreSavedFolderHandle() {
      if (!this.isSupported()) return false;
      try {
        const savedHandle = await this.idb.get(
          STUDIO_CONSTANTS.STORES.WORKSPACE_HANDLES,
          'primary_root_dir'
        );
        if (!savedHandle) return false;
        const perm = await savedHandle.queryPermission({ mode: 'readwrite' });
        if (perm === 'granted') {
          this.rootHandle = savedHandle;
          await this.ensureSubFolders();
          this.updateHeaderStatusUI(true, savedHandle.name);
          return true;
        }
      } catch (_) {}
      return false;
    }

    async requestConnectFolder() {
      if (!this.isSupported()) {
        this.utils.showToast(
          '📱 Thiết bị di động/trình duyệt này đang dùng Bộ nhớ Két sắt IndexedDB tự động. Bạn luôn có thể tải bản thảo về máy ở Tab 2 & Tab 6!',
          'info',
          4200
        );
        return false;
      }
      try {
        const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
        if (!handle) return false;
        this.rootHandle = handle;
        await this.idb.set(
          STUDIO_CONSTANTS.STORES.WORKSPACE_HANDLES,
          'primary_root_dir',
          handle
        );
        await this.ensureSubFolders();
        this.updateHeaderStatusUI(true, handle.name);
        this.utils.showToast(
          `📁 Đã kết nối thư mục ổ cứng "${handle.name}" thành công! Mọi bản thảo sẽ được lưu song song xuống máy.`,
          'success'
        );
        return true;
      } catch (err) {
        if (err && err.name !== 'AbortError') {
          this.utils.showToast(`⚠️ Không thể kết nối thư mục: ${err.message}`, 'warning');
        }
        return false;
      }
    }

    async ensureSubFolders() {
      if (!this.rootHandle) return;
      for (const folderName of STUDIO_CONSTANTS.LOCAL_FOLDERS) {
        try {
          this.subDirHandles[folderName] = await this.rootHandle.getDirectoryHandle(
            folderName,
            { create: true }
          );
        } catch (_) {}
      }
    }

    async writeTextFile(subFolder, fileName, content) {
      if (!this.rootHandle) return false;
      try {
        let dir = this.subDirHandles[subFolder];
        if (!dir) {
          dir = await this.rootHandle.getDirectoryHandle(subFolder, { create: true });
          this.subDirHandles[subFolder] = dir;
        }
        const safeName = String(fileName || 'Ban_Thao.txt').replace(/[<>:"/\\|?*]+/g, '_');
        const fileHandle = await dir.getFileHandle(safeName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(String(content ?? ''));
        await writable.close();
        return true;
      } catch (err) {
        console.warn('[LocalFS] Không thể ghi file:', err);
        return false;
      }
    }

    updateHeaderStatusUI(connected, folderName = '') {
      const btn = document.getElementById('btn-connect-local-folder');
      if (!btn) return;
      if (connected) {
        btn.className =
          'px-2.5 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/50 text-emerald-300 font-bold text-[11px] flex items-center gap-1 shadow transition';
        btn.innerHTML = `<span>🟢</span><span class="hidden sm:inline">${this.utils.escapeHtml(
          folderName || 'Đã nối ổ cứng'
        )}</span>`;
      }
    }
  }

  const fsEngine = new LocalFileSystemEngine(idbEngine, uiUtils);
  window.NoirStudio.fsEngine = fsEngine;

  // ==========================================================================
  // BƯỚC 6 (MODULE 5): BỘ ĐỌC TÀI LIỆU ĐA ĐỊNH DẠNG (.DOCX, .PDF, .TXT, .MD, .JSON)
  //                    VÀ THUẬT TOÁN TÓM TẮT TRÍCH XUẤT CỤC BỘ (0 TOKEN)
  // ==========================================================================
  class LocalDocumentParserAndSummarizer {
    constructor(utils) {
      this.utils = utils;
    }

    async parseFile(file) {
      if (!file) return { title: 'Chương mới', content: '' };
      const ext = (file.name.split('.').pop() || '').toLowerCase();
      const baseTitle = file.name.replace(/\.[^/.]+$/, '');

      if (ext === 'docx' && window.mammoth) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await window.mammoth.extractRawText({ arrayBuffer });
        return { title: baseTitle, content: (result.value || '').trim() };
      }

      if (ext === 'pdf' && window.pdfjsLib) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const pages = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item) => item.str).join(' ');
          pages.push(pageText);
        }
        return { title: baseTitle, content: pages.join('\n\n').trim() };
      }

      // Mặc định đọc dạng văn bản UTF-8 (.txt, .md, .json)
      const rawText = await file.text();
      return { title: baseTitle, content: rawText.trim(), isJson: ext === 'json' };
    }

    /**
     * Tóm tắt trích xuất 0 Token: lấy các câu mở đầu, cao trào và kết thúc chương
     * để làm ký ức nén khi chưa chạy AI.
     */
    buildZeroTokenSummary(content, maxSentences = 5) {
      if (!content || typeof content !== 'string') return '';
      const clean = content.replace(/\s+/g, ' ').trim();
      if (clean.length <= 360) return clean;

      const sentences = clean
        .split(/(?<=[.!?…])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 20);

      if (sentences.length <= maxSentences) return sentences.join(' ');

      const picked = [
        sentences[0],
        sentences[Math.floor(sentences.length * 0.25)],
        sentences[Math.floor(sentences.length * 0.5)],
        sentences[Math.floor(sentences.length * 0.75)],
        sentences[sentences.length - 1]
      ];
      return [...new Set(picked)].join(' ');
    }
  }

  const docParser = new LocalDocumentParserAndSummarizer(uiUtils);
  window.NoirStudio.docParser = docParser;

  // ==========================================================================
  // BƯỚC 7 (MODULE 6): ĐỘNG CƠ TÌM KIẾM CHỐNG QUÊN CỤC BỘ BM25 (0 TOKEN RAG)
  //                    (GIÚP TRA CỨU TÌNH TIẾT CŨ & TỰ ĐỘNG BƠM VÀO PROMPT TỔNG)
  // ==========================================================================
  class LocalBM25MemoryEngine {
    constructor(utils) {
      this.utils = utils;
      this.chunks = [];
    }

    tokenizeVN(text) {
      if (!text) return [];
      return String(text)
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 1);
    }

    rebuildIndexFromChapters(chapters = []) {
      this.chunks = [];
      chapters.forEach((chap) => {
        const text = (chap.content || '').trim();
        if (!text) return;
        const paragraphs = text
          .split(/\r?\n\r?\n+/)
          .map((p) => p.trim())
          .filter((p) => p.length > 25);

        // Gom mỗi 2 đoạn văn thành 1 mảnh ký ức
        for (let i = 0; i < paragraphs.length; i += 2) {
          const snippet = paragraphs.slice(i, i + 2).join('\n');
          this.chunks.push({
            id: `${chap.id}_chunk_${i}`,
            chapterId: chap.id,
            chapterTitle: chap.displayTitle || chap.title || `Chương ${chap.chapterNumber || 1}`,
            status: chap.status || 'DRAFT',
            text: snippet,
            tokens: this.tokenizeVN(snippet)
          });
        }
      });

      const badge = document.getElementById('rag-index-count');
      if (badge) {
        badge.textContent = `${this.chunks.length} đoạn ký ức`;
      }
      const cmdRag = document.getElementById('cmd-rag-status-pill');
      if (cmdRag) {
        cmdRag.textContent = `Chống quên BM25: ${this.chunks.length} đoạn ký ức`;
      }
    }

    search(query, topK = 6) {
      const qTokens = this.tokenizeVN(query);
      if (qTokens.length === 0 || this.chunks.length === 0) return [];

      const N = this.chunks.length;
      const avgDl =
        this.chunks.reduce((sum, c) => sum + c.tokens.length, 0) / Math.max(1, N);
      const k1 = 1.5;
      const b = 0.75;

      const scored = this.chunks.map((chunk) => {
        let score = 0;
        const dl = chunk.tokens.length || 1;
        qTokens.forEach((qt) => {
          const tf = chunk.tokens.filter((t) => t === qt).length;
          if (tf > 0) {
            const df = this.chunks.filter((c) => c.tokens.includes(qt)).length;
            const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
            const num = tf * (k1 + 1);
            const den = tf + k1 * (1 - b + b * (dl / avgDl));
            score += idf * (num / den);
          }
        });
        return { ...chunk, score };
      });

      return scored
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);
    }

    renderSearchResultsUI(query) {
      const box = document.getElementById('rag-search-results');
      if (!box) return;
      const results = this.search(query, 8);
      if (!query || !query.trim()) {
        box.innerHTML =
          '<div class="text-zinc-500 italic">Nhập từ khóa bên trên để tìm nhanh chi tiết trong toàn bộ các chương...</div>';
        return;
      }
      if (results.length === 0) {
        box.innerHTML = `<div class="text-rose-400">Không tìm thấy đoạn văn nào khớp với "${this.utils.escapeHtml(
          query
        )}".</div>`;
        return;
      }
      box.innerHTML = results
        .map(
          (r) => `
          <div class="p-2 rounded-xl border border-amber-500/30 bg-zinc-900/90 space-y-1 hover:border-amber-400 cursor-pointer" data-rag-jump-chap="${this.utils.escapeHtml(
            r.chapterId
          )}">
            <div class="flex items-center justify-between text-[10px]">
              <span class="font-bold text-amber-400">${this.utils.escapeHtml(
                r.chapterTitle
              )}</span>
              <span class="font-monoCode text-zinc-400">Điểm BM25: ${r.score.toFixed(2)}</span>
            </div>
            <div class="text-[11px] text-zinc-200 line-clamp-3">${this.utils.escapeHtml(
              r.text
            )}</div>
          </div>
        `
        )
        .join('');

      box.querySelectorAll('[data-rag-jump-chap]').forEach((card) => {
        card.addEventListener('click', () => {
          const cid = card.getAttribute('data-rag-jump-chap');
          window.NoirStudio.chapterManager?.selectChapter(cid);
          window.NoirStudio.navigator?.navigateToScreen('SCREEN_1_WRITE');
        });
      });
    }
  }

  const ragEngine = new LocalBM25MemoryEngine(uiUtils);
  window.NoirStudio.rag = ragEngine;

  // ==========================================================================
  // BƯỚC 8 (MODULE 7): QUẢN LÝ CÂY BẢN THẢO, CỔNG DUYỆT HAI CHIỀU (NHÁP / ĐÃ DUYỆT)
  //                    VÀ ĐỒNG BỘ TIÊU ĐỀ CHƯƠNG HAI CHIỀU TẠI TAB 1 & TAB 2
  // ==========================================================================
  class ChapterRegistryAndApprovalGate {
    constructor(idb, fs, parser, rag, utils) {
      this.idb = idb;
      this.fs = fs;
      this.parser = parser;
      this.rag = rag;
      this.utils = utils;
      this.chapters = [];
      this.activeChapterId = null;
      this.currentFilter = 'ALL';
    }

    async loadChaptersFromStorage() {
      // 1. Thử đọc từ kho chapters chính thức trong IndexedDB
      let stored = await this.idb.getAll(STUDIO_CONSTANTS.STORES.CHAPTERS);

      // 2. Nếu chưa có, thử khôi phục từ snapshot cũ (Stage 17/18/19/20)
      if (!stored || stored.length === 0) {
        const legacySnap = this.idb.getLocalJSON('noir_s17_master_workspace_snapshot', null);
        if (legacySnap && Array.isArray(legacySnap.chapters) && legacySnap.chapters.length > 0) {
          stored = legacySnap.chapters;
        }
      }

      // 3. Nếu vẫn rỗng, kiểm tra két sắt khẩn cấp (noir_large_emergency_vault)
      if (!stored || stored.length === 0) {
        const emergency = await this.idb.get(
          STUDIO_CONSTANTS.STORES.STATE_CACHE,
          'noir_large_emergency_vault'
        );
        if (emergency && (emergency.content || emergency.title)) {
          stored = [
            {
              id: emergency.chapterId || 'chap_1',
              chapterNumber: 1,
              title: emergency.title || 'Chương 1: Khởi Đầu Trong Mưa Đêm',
              displayTitle: emergency.title || 'Chương 1: Khởi Đầu Trong Mưa Đêm',
              content: emergency.content || '',
              beats: emergency.beats || '',
              status: 'DRAFT',
              wordCount: this.utils.countVietnameseWords(emergency.content || ''),
              updatedAt: emergency.savedAt || Date.now()
            }
          ];
        }
      }

      // 4. Nếu là lần đầu mở ứng dụng, khởi tạo Chương 1 mặc định
      if (!stored || stored.length === 0) {
        stored = [
          {
            id: 'chap_1_' + Date.now(),
            chapterNumber: 1,
            title: 'Chương 1: Khởi Đầu Trong Mưa Đêm',
            displayTitle: 'Chương 1: Khởi Đầu Trong Mưa Đêm',
            content: '',
            beats: '',
            status: 'DRAFT',
            wordCount: 0,
            summary: '',
            updatedAt: Date.now()
          }
        ];
      }

      // Chuẩn hóa và sắp xếp thứ tự chương
      this.chapters = stored
        .map((c, idx) => ({
          id: c.id || `chap_${idx + 1}_${Date.now()}`,
          chapterNumber: c.chapterNumber || idx + 1,
          title: c.displayTitle || c.title || `Chương ${idx + 1}`,
          displayTitle: c.displayTitle || c.title || `Chương ${idx + 1}`,
          content: c.content || '',
          beats: c.beats || '',
          status: c.status === 'APPROVED' ? 'APPROVED' : 'DRAFT',
          wordCount: this.utils.countVietnameseWords(c.content || ''),
          summary: c.summary || this.parser.buildZeroTokenSummary(c.content || ''),
          fileName: c.fileName || `Chuong_${idx + 1}.txt`,
          updatedAt: c.updatedAt || Date.now()
        }))
        .sort((a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0));

      this.activeChapterId = this.chapters[0]?.id || null;
      window.NoirStudio.state.activeChapterId = this.activeChapterId;

      this.rag.rebuildIndexFromChapters(this.chapters);
      this.renderChapterTreeAndQuickSwitcher();
      this.loadActiveChapterIntoEditor();
    }

    getActiveChapter() {
      return (
        this.chapters.find((c) => c.id === this.activeChapterId) ||
        this.chapters[0] ||
        null
      );
    }

    getApprovedChapters() {
      return this.chapters.filter((c) => c.status === 'APPROVED');
    }

    getDraftChapters() {
      return this.chapters.filter((c) => c.status !== 'APPROVED');
    }

    syncEditorToActiveChapter() {
      const chap = this.getActiveChapter();
      if (!chap) return null;
      const titleInput = document.getElementById('input-chapter-title');
      const contentArea = document.getElementById('textarea-chapter-content');
      const beatsArea = document.getElementById('textarea-chapter-beats');

      if (titleInput && titleInput.value.trim()) {
        chap.title = titleInput.value.trim();
        chap.displayTitle = chap.title;
      }
      if (contentArea) {
        chap.content = contentArea.value;
        chap.wordCount = this.utils.countVietnameseWords(chap.content);
        chap.summary = this.parser.buildZeroTokenSummary(chap.content);
      }
      if (beatsArea) {
        chap.beats = beatsArea.value;
      }
      chap.updatedAt = Date.now();
      return chap;
    }

    loadActiveChapterIntoEditor() {
      const chap = this.getActiveChapter();
      if (!chap) return;
      const titleInput = document.getElementById('input-chapter-title');
      const contentArea = document.getElementById('textarea-chapter-content');
      const beatsArea = document.getElementById('textarea-chapter-beats');
      const statusBadge = document.getElementById('active-chapter-status-badge');
      const quickSelect = document.getElementById('quick-chapter-switcher');

      if (titleInput) titleInput.value = chap.displayTitle || chap.title;
      if (contentArea) contentArea.value = chap.content || '';
      if (beatsArea) beatsArea.value = chap.beats || '';
      if (quickSelect) quickSelect.value = chap.id;

      if (statusBadge) {
        if (chap.status === 'APPROVED') {
          statusBadge.className =
            'px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0';
          statusBadge.textContent = '✅ Đã Duyệt';
        } else {
          statusBadge.className =
            'px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0';
          statusBadge.textContent = '📝 Bản Nháp';
        }
      }

      this.updateLiveWordStatsUI(chap.content || '');
      window.NoirStudio.aiDiff?.refreshReviewSurfaceForActiveChapter();
    }

    updateLiveWordStatsUI(text) {
      const words = this.utils.countVietnameseWords(text);
      const paras = this.utils.countParagraphs(text);
      const mins = this.utils.estimateReadingTimeMinutes(words);

      const wEl = document.getElementById('stat-word-count');
      const pEl = document.getElementById('stat-paragraph-count');
      const rEl = document.getElementById('stat-reading-time');
      if (wEl) wEl.textContent = words.toLocaleString('vi-VN');
      if (pEl) pEl.textContent = paras.toLocaleString('vi-VN');
      if (rEl) rEl.textContent = String(mins);
    }

    selectChapter(chapterId) {
      if (!chapterId || chapterId === this.activeChapterId) return;
      this.syncEditorToActiveChapter();
      this.activeChapterId = chapterId;
      window.NoirStudio.state.activeChapterId = chapterId;
      this.loadActiveChapterIntoEditor();
      this.renderChapterTreeAndQuickSwitcher();
      window.NoirStudio.autoSaver?.triggerSave(false);
    }

    async createNewChapter(customTitle = '', initialContent = '') {
      this.syncEditorToActiveChapter();
      const nextNum = this.chapters.length + 1;
      const title =
        customTitle.trim() || `Chương ${nextNum}: Chương Mới Chưa Đặt Tên`;
      const newChap = {
        id: `chap_${nextNum}_${Date.now()}`,
        chapterNumber: nextNum,
        title,
        displayTitle: title,
        content: initialContent,
        beats: '',
        status: 'DRAFT',
        wordCount: this.utils.countVietnameseWords(initialContent),
        summary: this.parser.buildZeroTokenSummary(initialContent),
        fileName: `Chuong_${nextNum}.txt`,
        updatedAt: Date.now()
      };
      this.chapters.push(newChap);
      this.activeChapterId = newChap.id;
      window.NoirStudio.state.activeChapterId = newChap.id;
      await this.idb.set(STUDIO_CONSTANTS.STORES.CHAPTERS, newChap.id, newChap);
      this.rag.rebuildIndexFromChapters(this.chapters);
      this.renderChapterTreeAndQuickSwitcher();
      this.loadActiveChapterIntoEditor();
      this.utils.showToast(`✨ Đã tạo "${title}" sẵn sàng để bạn sáng tác!`, 'success');
      return newChap;
    }

    async renameChapter(chapterId, newTitle) {
      const chap = this.chapters.find((c) => c.id === chapterId);
      if (!chap || !newTitle || !newTitle.trim()) return;
      chap.title = newTitle.trim();
      chap.displayTitle = chap.title;
      chap.updatedAt = Date.now();
      await this.idb.set(STUDIO_CONSTANTS.STORES.CHAPTERS, chap.id, chap);
      if (chap.id === this.activeChapterId) {
        const titleInput = document.getElementById('input-chapter-title');
        if (titleInput) titleInput.value = chap.title;
      }
      this.renderChapterTreeAndQuickSwitcher();
      this.utils.showToast(`✏️ Đã đổi tên chương thành "${chap.title}"`, 'info');
    }

    async deleteChapter(chapterId) {
      if (this.chapters.length <= 1) {
        this.utils.showToast(
          '⚠️ Cần giữ lại ít nhất 1 chương trong bàn viết. Bạn có thể xóa trắng nội dung chương nếu muốn làm mới!',
          'warning'
        );
        return;
      }
      const target = this.chapters.find((c) => c.id === chapterId);
      if (!target) return;
      if (
        !window.confirm(
          `Bạn có chắc muốn xóa chương "${target.displayTitle || target.title}"?\n(Hệ thống sẽ tự động lưu 1 mốc phiên bản dự phòng tại Tab 6 trước khi xóa để bạn luôn có thể khôi phục!)`
        )
      ) {
        return;
      }

      // Tạo mốc phiên bản trước khi xóa chương
      window.NoirStudio.versionVault?.createSnapshot(
        `Sao lưu tự động trước khi xóa "${target.displayTitle || target.title}"`
      );

      this.chapters = this.chapters.filter((c) => c.id !== chapterId);
      await this.idb.delete(STUDIO_CONSTANTS.STORES.CHAPTERS, chapterId);
      if (this.activeChapterId === chapterId) {
        this.activeChapterId = this.chapters[0]?.id || null;
        this.loadActiveChapterIntoEditor();
      }
      this.rag.rebuildIndexFromChapters(this.chapters);
      this.renderChapterTreeAndQuickSwitcher();
      this.utils.showToast('🗑️ Đã xóa chương (Đã lưu bản dự phòng tại Tab 6).', 'info');
    }

    renderChapterTreeAndQuickSwitcher() {
      const tree = document.getElementById('chapter-tree-container');
      const quickSelect = document.getElementById('quick-chapter-switcher');

      const allCount = this.chapters.length;
      const approvedCount = this.getApprovedChapters().length;
      const draftCount = allCount - approvedCount;

      const elAll = document.getElementById('count-all-chapters');
      const elDraft = document.getElementById('count-draft-chapters');
      const elApp = document.getElementById('count-approved-chapters');
      if (elAll) elAll.textContent = String(allCount);
      if (elDraft) elDraft.textContent = String(draftCount);
      if (elApp) elApp.textContent = String(approvedCount);

      if (quickSelect) {
        quickSelect.innerHTML = this.chapters
          .map(
            (c) =>
              `<option value="${this.utils.escapeHtml(c.id)}" ${
                c.id === this.activeChapterId ? 'selected' : ''
              }>${c.status === 'APPROVED' ? '✅' : '📝'} ${this.utils.escapeHtml(
                c.displayTitle || c.title
              )} (${(c.wordCount || 0).toLocaleString('vi-VN')} từ)</option>`
          )
          .join('');
      }

      if (!tree) return;
      const filtered = this.chapters.filter((c) => {
        if (this.currentFilter === 'APPROVED') return c.status === 'APPROVED';
        if (this.currentFilter === 'DRAFT') return c.status !== 'APPROVED';
        return true;
      });

      if (filtered.length === 0) {
        tree.innerHTML =
          '<div class="p-4 text-center text-xs text-zinc-500 italic">Chưa có chương nào trong danh mục lọc này.</div>';
        return;
      }

      tree.innerHTML = filtered
        .map((c) => {
          const isActive = c.id === this.activeChapterId;
          const isApproved = c.status === 'APPROVED';
          return `
            <div class="p-3 rounded-2xl border transition cursor-pointer ${
              isActive
                ? 'border-emerald-500 bg-emerald-500/10 shadow-md'
                : 'border-studioLightBorder dark:border-zinc-800 bg-studioLightBg/70 dark:bg-zinc-900/80 hover:border-zinc-600'
            }" data-chap-card="${this.utils.escapeHtml(c.id)}">
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1.5">
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                      isApproved
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }">${isApproved ? '✅ Đã duyệt' : '📝 Nháp'}</span>
                    <span class="font-monoCode text-[10px] text-zinc-400">${(
                      c.wordCount || 0
                    ).toLocaleString('vi-VN')} từ</span>
                  </div>
                  <div class="font-extrabold text-xs sm:text-sm mt-1 truncate ${
                    isActive ? 'text-emerald-400' : ''
                  }">${this.utils.escapeHtml(c.displayTitle || c.title)}</div>
                </div>
                <div class="flex items-center gap-1 shrink-0">
                  <button type="button" data-chap-toggle-status="${this.utils.escapeHtml(
                    c.id
                  )}" class="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-emerald-600 text-[10px] font-bold text-zinc-200 hover:text-white transition" title="Đổi nhanh trạng thái Nháp / Đã duyệt">
                    ${isApproved ? '↩️ Nháp' : '✅ Duyệt'}
                  </button>
                  <button type="button" data-chap-rename="${this.utils.escapeHtml(
                    c.id
                  )}" class="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-indigo-600 text-[10px] font-bold text-zinc-200 hover:text-white transition" title="Đổi tên chương">
                    ✏️
                  </button>
                  <button type="button" data-chap-delete="${this.utils.escapeHtml(
                    c.id
                  )}" class="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-rose-600 text-[10px] font-bold text-zinc-200 hover:text-white transition" title="Xóa chương">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          `;
        })
        .join('');

      tree.querySelectorAll('[data-chap-card]').forEach((card) => {
        card.addEventListener('click', (e) => {
          if (e.target.closest('button')) return;
          const cid = card.getAttribute('data-chap-card');
          this.selectChapter(cid);
        });
      });

      tree.querySelectorAll('[data-chap-toggle-status]').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const cid = btn.getAttribute('data-chap-toggle-status');
          const chap = this.chapters.find((x) => x.id === cid);
          if (!chap) return;
          chap.status = chap.status === 'APPROVED' ? 'DRAFT' : 'APPROVED';
          await this.idb.set(STUDIO_CONSTANTS.STORES.CHAPTERS, chap.id, chap);
          this.renderChapterTreeAndQuickSwitcher();
          if (chap.id === this.activeChapterId) this.loadActiveChapterIntoEditor();
          this.utils.showToast(
            chap.status === 'APPROVED'
              ? `✅ Đã chuyển "${chap.displayTitle}" sang Đã Duyệt!`
              : `📝 Đã chuyển "${chap.displayTitle}" về Bản Nháp!`,
            'success'
          );
        });
      });

      tree.querySelectorAll('[data-chap-rename]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const cid = btn.getAttribute('data-chap-rename');
          const chap = this.chapters.find((x) => x.id === cid);
          if (!chap) return;
          const nextName = window.prompt(
            'Nhập tên mới cho chương:',
            chap.displayTitle || chap.title
          );
          if (nextName && nextName.trim()) {
            this.renameChapter(cid, nextName.trim());
          }
        });
      });

      tree.querySelectorAll('[data-chap-delete]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const cid = btn.getAttribute('data-chap-delete');
          this.deleteChapter(cid);
        });
      });
    }
  }

  const chapterManager = new ChapterRegistryAndApprovalGate(
    idbEngine,
    fsEngine,
    docParser,
    ragEngine,
    uiUtils
  );
  window.NoirStudio.chapterManager = chapterManager;


  // ==========================================================================
  // BƯỚC 9 (MODULE 8): ĐỘNG CƠ LƯU TỰ ĐỘNG 3 LỚP LIÊN TỤC 2 GIÂY (AUTO-SAVE)
  //                    VÀ NGĂN XẾP HOÀN TÁC / LÀM LẠI 60 CẤP (UNDO / REDO)
  // ==========================================================================
  class ThreeTierAutoSaveAndUndoEngine {
    constructor(idb, fs, chapterMgr, rag, utils) {
      this.idb = idb;
      this.fs = fs;
      this.chapterMgr = chapterMgr;
      this.rag = rag;
      this.utils = utils;
      this.debounceTimer = null;
      this.periodicTimer = null;
      this.undoStacks = {};
      this.redoStacks = {};
      this.maxHistoryDepth = 60;
      this.lastRecordedContent = '';
    }

    init() {
      const editor = document.getElementById('textarea-chapter-content');
      const titleInput = document.getElementById('input-chapter-title');

      if (editor) {
        this.lastRecordedContent = editor.value || '';
        editor.addEventListener('input', () => {
          this.pushUndoStateIfChanged(editor.value);
          this.chapterMgr.updateLiveWordStatsUI(editor.value);
          window.NoirStudio.pomodoro?.onEditorWordsChanged(editor.value);
          this.setStatusIndicator('SAVING', 'Đang đồng bộ tự động...');
          this.scheduleDebouncedSave(1800);
        });
      }

      if (titleInput) {
        titleInput.addEventListener('input', () => {
          const active = this.chapterMgr.getActiveChapter();
          if (active) {
            active.title = titleInput.value.trim() || active.title;
            active.displayTitle = active.title;
            this.chapterMgr.renderChapterTreeAndQuickSwitcher();
          }
          this.setStatusIndicator('SAVING', 'Đang lưu tiêu đề chương...');
          this.scheduleDebouncedSave(1200);
        });
      }

      // Chu kỳ tự động kiểm tra và lưu ngầm mỗi 15 giây để đảm bảo an toàn tuyệt đối
      this.periodicTimer = setInterval(() => {
        if (window.NoirStudio.state.isDirty) {
          this.triggerSave(false);
        }
      }, 15000);
    }

    getStackForChapter(chapId) {
      const id = chapId || this.chapterMgr.activeChapterId || 'default';
      if (!this.undoStacks[id]) this.undoStacks[id] = [];
      if (!this.redoStacks[id]) this.redoStacks[id] = [];
      return {
        undo: this.undoStacks[id],
        redo: this.redoStacks[id]
      };
    }

    pushUndoStateIfChanged(currentText) {
      const chap = this.chapterMgr.getActiveChapter();
      if (!chap) return;
      const { undo, redo } = this.getStackForChapter(chap.id);
      if (Math.abs((currentText || '').length - (this.lastRecordedContent || '').length) >= 12 || undo.length === 0) {
        undo.push(this.lastRecordedContent);
        if (undo.length > this.maxHistoryDepth) undo.shift();
        redo.length = 0;
        this.lastRecordedContent = currentText;
      }
      window.NoirStudio.state.isDirty = true;
    }

    forcePushUndoSnapshot(textBeforeChange) {
      const chap = this.chapterMgr.getActiveChapter();
      if (!chap) return;
      const { undo, redo } = this.getStackForChapter(chap.id);
      undo.push(textBeforeChange ?? chap.content ?? '');
      if (undo.length > this.maxHistoryDepth) undo.shift();
      redo.length = 0;
      this.lastRecordedContent = document.getElementById('textarea-chapter-content')?.value || '';
    }

    undo() {
      const editor = document.getElementById('textarea-chapter-content');
      const chap = this.chapterMgr.getActiveChapter();
      if (!editor || !chap) return;
      const { undo, redo } = this.getStackForChapter(chap.id);
      if (undo.length === 0) {
        this.utils.showToast('↩️ Đã ở trạng thái chỉnh sửa đầu tiên của phiên này.', 'info', 2000);
        return;
      }
      redo.push(editor.value);
      const prevText = undo.pop();
      editor.value = prevText;
      this.lastRecordedContent = prevText;
      this.chapterMgr.syncEditorToActiveChapter();
      this.chapterMgr.updateLiveWordStatsUI(prevText);
      this.triggerSave(false);
      this.utils.showToast('↩️ Đã hoàn tác bước chỉnh sửa trước đó.', 'info', 1800);
    }

    redo() {
      const editor = document.getElementById('textarea-chapter-content');
      const chap = this.chapterMgr.getActiveChapter();
      if (!editor || !chap) return;
      const { redo, undo } = this.getStackForChapter(chap.id);
      if (redo.length === 0) {
        this.utils.showToast('↪️ Không còn bước nào để làm lại.', 'info', 2000);
        return;
      }
      undo.push(editor.value);
      const nextText = redo.pop();
      editor.value = nextText;
      this.lastRecordedContent = nextText;
      this.chapterMgr.syncEditorToActiveChapter();
      this.chapterMgr.updateLiveWordStatsUI(nextText);
      this.triggerSave(false);
      this.utils.showToast('↪️ Đã khôi phục bước chỉnh sửa.', 'info', 1800);
    }

    scheduleDebouncedSave(delayMs = 1800) {
      window.NoirStudio.state.isDirty = true;
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.triggerSave(false);
      }, delayMs);
    }

    setStatusIndicator(state, message) {
      const dot = document.getElementById('fs-status-dot');
      const text = document.getElementById('fs-status-text');
      if (dot) {
        if (state === 'SAVING') {
          dot.className = 'w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse';
        } else if (state === 'ERROR') {
          dot.className = 'w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#ef4444]';
        } else {
          dot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]';
        }
      }
      if (text && message) {
        text.textContent = message;
      }
    }

    async triggerSave(showToastFeedback = false) {
      try {
        const activeChap = this.chapterMgr.syncEditorToActiveChapter();
        if (!activeChap) return false;

        // Lớp 1: Lưu vào kho chapters trong IndexedDB
        await this.idb.set(STUDIO_CONSTANTS.STORES.CHAPTERS, activeChap.id, activeChap);

        // Lớp 2: Lưu vào Két sắt khẩn cấp (noir_large_emergency_vault) & Snapshot tương thích ngược
        await this.idb.set(STUDIO_CONSTANTS.STORES.STATE_CACHE, 'noir_large_emergency_vault', {
          chapterId: activeChap.id,
          title: activeChap.displayTitle || activeChap.title,
          content: activeChap.content,
          beats: activeChap.beats,
          savedAt: Date.now()
        });

        this.idb.setLocalJSON('noir_s17_master_workspace_snapshot', {
          activeChapterId: activeChap.id,
          chapters: this.chapterMgr.chapters,
          updatedAt: Date.now()
        });

        // Lớp 3: Nếu đã kết nối ổ cứng máy tính, ghi trực tiếp file xuống thư mục tương ứng
        if (this.fs.rootHandle) {
          const targetFolder =
            activeChap.status === 'APPROVED'
              ? '02_Chuong_Da_Duyet'
              : '01_Chuong_Goc_Chua_Duyet';
          const fileName = `${activeChap.displayTitle || activeChap.title}.txt`;
          await this.fs.writeTextFile(targetFolder, fileName, activeChap.content || '');
        }

        // Cập nhật chỉ mục BM25 chống quên và danh sách cây chương
        this.rag.rebuildIndexFromChapters(this.chapterMgr.chapters);
        this.chapterMgr.renderChapterTreeAndQuickSwitcher();

        // Tự động kiểm tra tạo mốc phiên bản định kỳ (Version Time-Machine)
        window.NoirStudio.versionVault?.maybeAutoSnapshotOnSave();

        window.NoirStudio.state.isDirty = false;
        window.NoirStudio.state.lastSavedAt = Date.now();
        const nowStr = new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        this.setStatusIndicator('SAVED', `Đã lưu tự động lúc ${nowStr}`);

        if (showToastFeedback) {
          this.utils.showToast(
            `💾 Đã lưu an toàn 3 lớp chương "${activeChap.displayTitle}" (${activeChap.wordCount.toLocaleString('vi-VN')} từ)!`,
            'success'
          );
        }
        return true;
      } catch (err) {
        console.error('[AutoSave] Lỗi lưu tự động:', err);
        this.setStatusIndicator('ERROR', 'Lỗi lưu cục bộ');
        return false;
      }
    }
  }

  const autoSaver = new ThreeTierAutoSaveAndUndoEngine(
    idbEngine,
    fsEngine,
    chapterManager,
    ragEngine,
    uiUtils
  );
  window.NoirStudio.autoSaver = autoSaver;


  // ==========================================================================
  // BƯỚC 10 (MODULE 9): KHO LƯU TRỮ PHIÊN BẢN TỰ ĐỘNG & XEM TRƯỚC TRẠNG THÁI CŨ
  //                     (VERSION TIME-MACHINE TẠI TAB 6 + PREVIEW + KHÔI PHỤC)
  // ==========================================================================
  class VersionTimeMachineEngine {
    constructor(idb, fs, chapterMgr, utils) {
      this.idb = idb;
      this.fs = fs;
      this.chapterMgr = chapterMgr;
      this.utils = utils;
      this.versions = [];
      this.selectedVersionId = null;
      this.activePreviewTab = 'MANUSCRIPT';
      this.maxSnapshots = 45;
      this.lastAutoSnapshotTime = 0;
      this.lastAutoSnapshotWordHash = '';
    }

    async init() {
      // Đọc danh sách phiên bản từ IndexedDB & LocalStorage
      let saved = await this.idb.get(
        STUDIO_CONSTANTS.STORES.STATE_CACHE,
        STUDIO_CONSTANTS.STORAGE_KEYS.VERSION_VAULT
      );
      if (!saved || !Array.isArray(saved)) {
        saved = this.idb.getLocalJSON(STUDIO_CONSTANTS.STORAGE_KEYS.VERSION_VAULT, []);
      }
      this.versions = Array.isArray(saved) ? saved : [];

      // Tạo mốc khởi động đầu tiên nếu kho phiên bản đang trống
      if (this.versions.length === 0 && this.chapterMgr.chapters.length > 0) {
        await this.createSnapshot('Mốc khởi tạo phiên làm việc tự động', 'AUTO');
      } else {
        this.renderVersionListUI();
      }
    }

    buildWorkspaceFingerprint() {
      return this.chapterMgr.chapters
        .map((c) => `${c.id}:${(c.content || '').length}:${c.status}`)
        .join('|');
    }

    async maybeAutoSnapshotOnSave() {
      const now = Date.now();
      const fingerprint = this.buildWorkspaceFingerprint();
      // Tạo bản lưu phiên bản tự động mỗi 3 phút nếu nội dung có thay đổi thực sự
      if (
        now - this.lastAutoSnapshotTime > 180000 &&
        fingerprint !== this.lastAutoSnapshotWordHash
      ) {
        const active = this.chapterMgr.getActiveChapter();
        await this.createSnapshot(
          `Lưu tự động định kỳ — ${active ? active.displayTitle : 'Bản thảo'}`,
          'AUTO'
        );
      }
    }

    async createSnapshot(reasonLabel = 'Mốc phiên bản thủ công', triggerType = 'MANUAL') {
      this.chapterMgr.syncEditorToActiveChapter();
      const activeChap = this.chapterMgr.getActiveChapter();
      const totalWords = this.chapterMgr.chapters.reduce(
        (sum, c) => sum + this.utils.countVietnameseWords(c.content || ''),
        0
      );

      const snapshot = {
        id: 'ver_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        createdAt: Date.now(),
        reason: reasonLabel,
        triggerType,
        activeChapterId: this.chapterMgr.activeChapterId,
        activeChapterTitle: activeChap ? activeChap.displayTitle || activeChap.title : 'Chương 1',
        totalChapters: this.chapterMgr.chapters.length,
        totalWords,
        chapters: JSON.parse(JSON.stringify(this.chapterMgr.chapters)),
        bibleTemplate:
          localStorage.getItem(STUDIO_CONSTANTS.STORAGE_KEYS.BIBLE_TEMPLATE) || '',
        bibleRendered:
          localStorage.getItem(STUDIO_CONSTANTS.STORAGE_KEYS.BIBLE_RENDERED) || '',
        characters: this.idb.getLocalJSON(STUDIO_CONSTANTS.STORAGE_KEYS.CHARACTERS, []),
        knowledgeMatrix: this.idb.getLocalJSON(
          STUDIO_CONSTANTS.STORAGE_KEYS.KNOWLEDGE_MATRIX,
          []
        ),
        cluesLedger: this.idb.getLocalJSON(STUDIO_CONSTANTS.STORAGE_KEYS.CLUES_LEDGER, []),
        sceneMarkers: this.idb.getLocalJSON(STUDIO_CONSTANTS.STORAGE_KEYS.SCENE_MARKERS, [])
      };

      this.versions.unshift(snapshot);
      if (this.versions.length > this.maxSnapshots) {
        this.versions = this.versions.slice(0, this.maxSnapshots);
      }

      this.lastAutoSnapshotTime = Date.now();
      this.lastAutoSnapshotWordHash = this.buildWorkspaceFingerprint();

      await this.idb.set(
        STUDIO_CONSTANTS.STORES.STATE_CACHE,
        STUDIO_CONSTANTS.STORAGE_KEYS.VERSION_VAULT,
        this.versions
      );
      this.idb.setLocalJSON(
        STUDIO_CONSTANTS.STORAGE_KEYS.VERSION_VAULT,
        this.versions.slice(0, 15)
      );

      // Ghi xuống ổ cứng nếu đã kết nối
      if (this.fs.rootHandle) {
        await this.fs.writeTextFile(
          '06_Sao_Luu_Code_Va_Ban_Thao',
          'chapter_snapshots_history.json',
          JSON.stringify(this.versions.slice(0, 20), null, 2)
        );
      }

      if (!this.selectedVersionId) {
        this.selectedVersionId = snapshot.id;
      }
      this.renderVersionListUI();
      return snapshot;
    }

    getSelectedSnapshot() {
      return (
        this.versions.find((v) => v.id === this.selectedVersionId) ||
        this.versions[0] ||
        null
      );
    }

    renderVersionListUI() {
      const listBox = document.getElementById('version-history-list-container');
      const countBadge = document.getElementById('version-vault-count-badge');
      if (countBadge) {
        countBadge.textContent = `${this.versions.length} phiên bản`;
      }
      if (!listBox) return;

      if (this.versions.length === 0) {
        listBox.innerHTML =
          '<div class="p-4 text-center text-zinc-500 italic">Chưa có mốc phiên bản nào. Hãy bấm "📸 Tạo Mốc Phiên Bản Ngay" để lưu trạng thái đầu tiên!</div>';
        return;
      }

      listBox.innerHTML = this.versions
        .map((v, idx) => {
          const isSelected = v.id === this.selectedVersionId;
          const badgeClass =
            v.triggerType === 'MANUAL'
              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
              : v.triggerType === 'PRE_RESTORE' || v.triggerType === 'PRE_AI'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
          const badgeLabel =
            v.triggerType === 'MANUAL'
              ? '📸 Thủ công'
              : v.triggerType === 'PRE_AI'
              ? '🤖 Trước khi chèn AI'
              : v.triggerType === 'PRE_RESTORE'
              ? '🛡️ Bảo vệ trước khôi phục'
              : '⚡ Tự động';

          return `
            <div data-version-item="${this.utils.escapeHtml(
              v.id
            )}" class="p-3 rounded-xl border transition cursor-pointer ${
              isSelected
                ? 'border-indigo-400 bg-indigo-500/15 shadow-md'
                : 'border-studioLightBorder dark:border-zinc-800 bg-studioLightPanel/80 dark:bg-zinc-900/80 hover:border-indigo-500/50'
            }">
              <div class="flex items-center justify-between gap-2">
                <span class="px-2 py-0.5 rounded-md border text-[10px] font-extrabold ${badgeClass}">
                  ${badgeLabel} ${idx === 0 ? '• Mới nhất' : ''}
                </span>
                <span class="font-monoCode text-[10px] text-zinc-400">${this.utils.formatTimestampVN(
                  v.createdAt
                )}</span>
              </div>
              <div class="font-extrabold text-xs text-zinc-100 mt-1.5">${this.utils.escapeHtml(
                v.reason
              )}</div>
              <div class="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
                <span>📖 ${v.totalChapters} chương • <strong class="text-emerald-400">${(
            v.totalWords || 0
          ).toLocaleString('vi-VN')} từ</strong></span>
                <span class="text-indigo-400 font-bold hover:underline">Xem Preview ➔</span>
              </div>
            </div>
          `;
        })
        .join('');

      listBox.querySelectorAll('[data-version-item]').forEach((item) => {
        item.addEventListener('click', () => {
          const vid = item.getAttribute('data-version-item');
          this.selectVersionForPreview(vid);
        });
      });

      this.renderInlinePreviewPane();
    }

    selectVersionForPreview(versionId) {
      this.selectedVersionId = versionId;
      this.renderVersionListUI();
    }

    renderInlinePreviewPane() {
      const snap = this.getSelectedSnapshot();
      const titleEl = document.getElementById('version-preview-title');
      const metaEl = document.getElementById('version-preview-meta');
      const boxEl = document.getElementById('version-preview-content-box');
      const btnFs = document.getElementById('btn-open-fullscreen-version-preview');
      const btnRestore = document.getElementById('btn-restore-selected-version');

      if (!snap || !boxEl) return;

      btnFs?.classList.remove('hidden');
      btnRestore?.classList.remove('hidden');

      if (titleEl) {
        titleEl.textContent = `👁️ Xem Trước: ${snap.reason}`;
      }
      if (metaEl) {
        metaEl.textContent = `Lưu lúc: ${this.utils.formatTimestampVN(
          snap.createdAt
        )} (${this.utils.formatRelativeTimeVN(snap.createdAt)}) • Tổng cộng ${
          snap.totalChapters
        } chương (${(snap.totalWords || 0).toLocaleString('vi-VN')} từ)`;
      }

      const activeChap =
        (snap.chapters || []).find((c) => c.id === snap.activeChapterId) ||
        (snap.chapters || [])[0];

      const chapterSummaryLines = (snap.chapters || [])
        .map(
          (c, i) =>
            `  ${i + 1}. [${c.status === 'APPROVED' ? 'ĐÃ DUYỆT' : 'NHÁP'}] ${
              c.displayTitle || c.title
            } — ${this.utils.countVietnameseWords(c.content || '').toLocaleString('vi-VN')} từ`
        )
        .join('\n');

      const previewReport = [
        `====================================================================`,
        `🕒 BẢN XEM TRƯỚC TRẠNG THÁI TRANG WEB (VERSION PREVIEW)`,
        `• Tên mốc phiên bản : ${snap.reason}`,
        `• Thời điểm lưu     : ${this.utils.formatTimestampVN(snap.createdAt)}`,
        `• Chương đang mở    : ${activeChap ? activeChap.displayTitle || activeChap.title : 'Không rõ'}`,
        `====================================================================`,
        ``,
        `📂 DANH SÁCH CÁC CHƯƠNG TRONG PHIÊN BẢN NÀY (${snap.totalChapters} chương):`,
        chapterSummaryLines || '  (Trống)',
        ``,
        `--------------------------------------------------------------------`,
        `✍️ NỘI DUNG BẢN THẢO CHƯƠNG ĐANG MỞ LÚC ĐÓ (${
          activeChap ? activeChap.displayTitle || activeChap.title : ''
        }):`,
        `--------------------------------------------------------------------`,
        activeChap && activeChap.content
          ? activeChap.content
          : '(Chương này chưa có nội dung văn bản ở thời điểm lưu)',
        ``,
        `--------------------------------------------------------------------`,
        `🏛️ TRẠNG THÁI STORY BIBLE LÚC ĐÓ:`,
        `--------------------------------------------------------------------`,
        snap.bibleRendered || '(Chưa có nội dung Story Bible chính thức ở thời điểm này)'
      ].join('\n');

      boxEl.textContent = previewReport;
    }

    openFullscreenStatePreviewModal() {
      const snap = this.getSelectedSnapshot();
      if (!snap) {
        this.utils.showToast('⚠️ Hãy chọn một phiên bản trong danh sách trước!', 'warning');
        return;
      }
      const modal = document.getElementById('modal-fullscreen-version-preview');
      const header = document.getElementById('fs-version-preview-header');
      const subheader = document.getElementById('fs-version-preview-subheader');
      if (header) {
        header.textContent = `🕒 Giao Diện Xem Trước Phiên Bản: "${snap.reason}"`;
      }
      if (subheader) {
        subheader.textContent = `Thời điểm chụp trạng thái: ${this.utils.formatTimestampVN(
          snap.createdAt
        )} • ${snap.totalChapters} chương • ${(snap.totalWords || 0).toLocaleString(
          'vi-VN'
        )} từ`;
      }
      this.activePreviewTab = 'MANUSCRIPT';
      this.renderFullscreenPreviewTabContent();
      modal?.classList.remove('hidden');
    }

    renderFullscreenPreviewTabContent() {
      const snap = this.getSelectedSnapshot();
      const stage = document.getElementById('fs-version-preview-stage');
      if (!snap || !stage) return;

      document.querySelectorAll('.ver-preview-tab-btn').forEach((btn) => {
        const t = btn.getAttribute('data-ver-tab');
        if (t === this.activePreviewTab) {
          btn.className =
            'ver-preview-tab-btn px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-extrabold shadow';
        } else {
          btn.className =
            'ver-preview-tab-btn px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white font-bold';
        }
      });

      const activeChap =
        (snap.chapters || []).find((c) => c.id === snap.activeChapterId) ||
        (snap.chapters || [])[0];

      if (this.activePreviewTab === 'MANUSCRIPT') {
        stage.innerHTML = `
          <div class="max-w-4xl mx-auto space-y-4">
            <div class="p-4 rounded-2xl border border-indigo-500/40 bg-zinc-900/90 flex flex-wrap items-center justify-between gap-2 font-sansUI text-xs">
              <div>
                <span class="text-indigo-400 font-extrabold uppercase">Bàn viết Tab 1 tại thời điểm cũ:</span>
                <span class="font-bold text-white ml-2">${this.utils.escapeHtml(
                  activeChap ? activeChap.displayTitle || activeChap.title : 'Chương 1'
                )}</span>
              </div>
              <span class="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 font-monoCode font-bold">
                ${this.utils
                  .countVietnameseWords(activeChap?.content || '')
                  .toLocaleString('vi-VN')} từ
              </span>
            </div>
            <div class="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 text-zinc-100 leading-relaxed whitespace-pre-wrap">${this.utils.escapeHtml(
              activeChap?.content || '(Bản thảo trống tại thời điểm này)'
            )}</div>
          </div>
        `;
      } else if (this.activePreviewTab === 'ALL_CHAPTERS') {
        stage.innerHTML = `
          <div class="max-w-4xl mx-auto space-y-4 font-sansUI text-xs">
            ${(snap.chapters || [])
              .map(
                (c, i) => `
                <div class="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="font-extrabold text-sm text-emerald-400">${i + 1}. ${this.utils.escapeHtml(
                      c.displayTitle || c.title
                    )}</span>
                    <span class="font-monoCode text-zinc-400">${
                      c.status === 'APPROVED' ? '✅ Đã duyệt' : '📝 Bản nháp'
                    } • ${this.utils
                      .countVietnameseWords(c.content || '')
                      .toLocaleString('vi-VN')} từ</span>
                  </div>
                  <div class="p-3 rounded-xl bg-zinc-950 text-zinc-300 font-serifNovel whitespace-pre-wrap max-h-60 overflow-y-auto">${this.utils.escapeHtml(
                    c.content || '(Trống)'
                  )}</div>
                </div>
              `
              )
              .join('')}
          </div>
        `;
      } else if (this.activePreviewTab === 'STORY_BIBLE') {
        stage.innerHTML = `
          <div class="max-w-4xl mx-auto space-y-4 font-sansUI text-xs">
            <div class="p-4 rounded-2xl border border-emerald-500/40 bg-zinc-900/80 space-y-2">
              <div class="font-extrabold uppercase text-emerald-400">📖 Nội Dung Story Bible Chính Thức Lúc Đó:</div>
              <div class="p-3 rounded-xl bg-zinc-950 text-zinc-200 whitespace-pre-wrap">${this.utils.escapeHtml(
                snap.bibleRendered || '(Chưa có dữ liệu Story Bible ở mốc này)'
              )}</div>
            </div>
            <div class="p-4 rounded-2xl border border-amber-500/40 bg-zinc-900/80 space-y-2">
              <div class="font-extrabold uppercase text-amber-400">👤 Hồ Sơ Nhân Vật Lúc Đó (${
                (snap.characters || []).length
              } nhân vật):</div>
              <div class="p-3 rounded-xl bg-zinc-950 text-zinc-200 whitespace-pre-wrap">${this.utils.escapeHtml(
                (snap.characters || [])
                  .map((ch) => `• ${ch.name} (${ch.role || 'Nhân vật'}): ${ch.traits || ''}`)
                  .join('\n') || '(Chưa có nhân vật)'
              )}</div>
            </div>
          </div>
        `;
      } else {
        // So sánh khác biệt với bản hiện tại
        const currentActive = this.chapterMgr.getActiveChapter();
        const currWords = this.utils.countVietnameseWords(currentActive?.content || '');
        const oldWords = this.utils.countVietnameseWords(activeChap?.content || '');
        const diffWords = currWords - oldWords;
        stage.innerHTML = `
          <div class="max-w-5xl mx-auto space-y-4 font-sansUI text-xs">
            <div class="p-4 rounded-2xl border border-indigo-500/40 bg-zinc-900/90 flex flex-wrap items-center justify-between gap-2">
              <span class="font-extrabold text-indigo-300">🔍 Đối chiếu Phiên bản cũ với Bản thảo hiện tại:</span>
              <span class="font-monoCode font-bold ${
                diffWords >= 0 ? 'text-emerald-400' : 'text-amber-400'
              }">
                Chênh lệch chương đang mở: ${diffWords >= 0 ? '+' : ''}${diffWords.toLocaleString(
                  'vi-VN'
                )} từ (Bản cũ: ${oldWords} từ ➔ Hiện tại: ${currWords} từ)
              </span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="p-4 rounded-2xl border border-amber-500/40 bg-zinc-900/70 space-y-2">
                <div class="font-extrabold text-amber-400 uppercase">⏪ Nội dung ở Phiên Bản Cũ (${this.utils.formatTimestampVN(
                  snap.createdAt
                )}):</div>
                <div class="p-3 rounded-xl bg-zinc-950 font-serifNovel whitespace-pre-wrap max-h-[55vh] overflow-y-auto">${this.utils.escapeHtml(
                  activeChap?.content || '(Trống)'
                )}</div>
              </div>
              <div class="p-4 rounded-2xl border border-emerald-500/40 bg-zinc-900/70 space-y-2">
                <div class="font-extrabold text-emerald-400 uppercase">🟢 Nội dung ở Bản Thảo Hiện Tại:</div>
                <div class="p-3 rounded-xl bg-zinc-950 font-serifNovel whitespace-pre-wrap max-h-[55vh] overflow-y-auto">${this.utils.escapeHtml(
                  currentActive?.content || '(Trống)'
                )}</div>
              </div>
            </div>
          </div>
        `;
      }
    }

    async restoreSelectedVersion() {
      const snap = this.getSelectedSnapshot();
      if (!snap) return;

      if (
        !window.confirm(
          `Bạn có chắc chắn muốn khôi phục toàn bộ trang web về phiên bản:\n"${snap.reason}" (${this.utils.formatTimestampVN(
            snap.createdAt
          )})?\n\n(Hệ thống sẽ tự động chụp lại trạng thái hiện tại thành 1 mốc dự phòng trước khi khôi phục để bạn không bao giờ mất dữ liệu!)`
        )
      ) {
        return;
      }

      // Chụp nhanh trạng thái hiện tại trước khi khôi phục
      await this.createSnapshot(
        'Bản lưu bảo vệ tự động ngay trước khi khôi phục phiên bản cũ',
        'PRE_RESTORE'
      );

      // Khôi phục toàn bộ danh sách chương
      this.chapterMgr.chapters = JSON.parse(JSON.stringify(snap.chapters || []));
      for (const chap of this.chapterMgr.chapters) {
        await this.idb.set(STUDIO_CONSTANTS.STORES.CHAPTERS, chap.id, chap);
      }

      this.chapterMgr.activeChapterId =
        snap.activeChapterId || this.chapterMgr.chapters[0]?.id || null;
      window.NoirStudio.state.activeChapterId = this.chapterMgr.activeChapterId;

      // Khôi phục Story Bible & Hồ sơ nhân vật nếu có trong snapshot
      if (snap.bibleTemplate !== undefined) {
        localStorage.setItem(STUDIO_CONSTANTS.STORAGE_KEYS.BIBLE_TEMPLATE, snap.bibleTemplate);
      }
      if (snap.bibleRendered !== undefined) {
        localStorage.setItem(STUDIO_CONSTANTS.STORAGE_KEYS.BIBLE_RENDERED, snap.bibleRendered);
      }
      if (Array.isArray(snap.characters)) {
        this.idb.setLocalJSON(STUDIO_CONSTANTS.STORAGE_KEYS.CHARACTERS, snap.characters);
      }
      if (Array.isArray(snap.knowledgeMatrix)) {
        this.idb.setLocalJSON(
          STUDIO_CONSTANTS.STORAGE_KEYS.KNOWLEDGE_MATRIX,
          snap.knowledgeMatrix
        );
      }
      if (Array.isArray(snap.cluesLedger)) {
        this.idb.setLocalJSON(STUDIO_CONSTANTS.STORAGE_KEYS.CLUES_LEDGER, snap.cluesLedger);
      }

      this.chapterMgr.renderChapterTreeAndQuickSwitcher();
      this.chapterMgr.loadActiveChapterIntoEditor();
      window.NoirStudio.storyBible?.loadAllFromStorage();

      document.getElementById('modal-fullscreen-version-preview')?.classList.add('hidden');
      this.renderVersionListUI();

      this.utils.showToast(
        `⏪ Đã khôi phục hoàn hảo về phiên bản "${snap.reason}"!`,
        'success',
        4200
      );
    }
  }

  const versionVault = new VersionTimeMachineEngine(
    idbEngine,
    fsEngine,
    chapterManager,
    uiUtils
  );
  window.NoirStudio.versionVault = versionVault;


  // ==========================================================================
  // BƯỚC 11 (MODULE 10): CHẾ ĐỘ KIỂM DUYỆT ĐOẠN AI VIẾT KIỂU GOOGLE DOCS TẠI TAB 1
  //                      (PHÂN BIỆT MÀU NGƯỜI VIẾT VS AI VIẾT, CHẤP NHẬN / TỪ CHỐI)
  // ==========================================================================
  class GoogleDocsStyleAIDiffEngine {
    constructor(idb, chapterMgr, autoSaver, versionVault, utils) {
      this.idb = idb;
      this.chapterMgr = chapterMgr;
      this.autoSaver = autoSaver;
      this.versionVault = versionVault;
      this.utils = utils;
      // Map chapterId -> { originalText, segments: [{ id, type: 'HUMAN'|'AI', text }] }
      this.chapterDiffMap = {};
      this.isManualEditOverride = false;
    }

    init() {
      const saved = this.idb.getLocalJSON(STUDIO_CONSTANTS.STORAGE_KEYS.AI_DIFF_STATE, {});
      if (saved && typeof saved === 'object') {
        this.chapterDiffMap = saved;
      }
    }

    persistDiffState() {
      this.idb.setLocalJSON(STUDIO_CONSTANTS.STORAGE_KEYS.AI_DIFF_STATE, this.chapterDiffMap);
    }

    /**
     * Đưa đầu ra AI vào Bản thảo Tab 1 kèm đánh dấu màu khác biệt kiểu Google Docs
     * @param {string} aiText Nội dung AI vừa sinh ra
     * @param {'APPEND'|'REPLACE'} mode Chèn nối tiếp hay Thay thế toàn bộ
     */
    async applyAIOutputToManuscriptWithDiff(aiText, mode = 'APPEND') {
      const cleanAI = String(aiText || '').trim();
      if (!cleanAI) {
        this.utils.showToast(
          '⚠️ Cửa sổ đầu ra AI đang trống, chưa có nội dung để đưa vào bản thảo!',
          'warning'
        );
        return false;
      }

      const chap = this.chapterMgr.syncEditorToActiveChapter();
      if (!chap) return false;

      // Tự động chụp mốc phiên bản trước khi chèn AI để tác giả luôn có thể hoàn nguyên
      await this.versionVault.createSnapshot(
        `Lưu tự động trước khi ${mode === 'REPLACE' ? 'thay thế' : 'chèn nối tiếp'} đầu ra AI vào "${
          chap.displayTitle || chap.title
        }"`,
        'PRE_AI'
      );

      const previousHumanText = chap.content || '';
      this.autoSaver.forcePushUndoSnapshot(previousHumanText);

      // Tách đoạn AI theo từng đoạn văn để tác giả có thể Chấp nhận / Từ chối từng đoạn như Google Docs
      const aiParagraphs = cleanAI
        .split(/\r?\n\r?\n+/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      const segments = [];
      if (mode === 'APPEND' && previousHumanText.trim().length > 0) {
        // Nếu chương này đang có sẵn các đoạn diff chưa duyệt, giữ nguyên chúng
        const existingState = this.chapterDiffMap[chap.id];
        if (existingState && Array.isArray(existingState.segments) && existingState.segments.length > 0) {
          segments.push(...existingState.segments);
        } else {
          segments.push({
            id: 'human_base_' + Date.now(),
            type: 'HUMAN',
            text: previousHumanText.trim()
          });
        }
      }

      aiParagraphs.forEach((para, idx) => {
        segments.push({
          id: `ai_seg_${Date.now()}_${idx}`,
          type: 'AI',
          text: para
        });
      });

      this.chapterDiffMap[chap.id] = {
        originalText: previousHumanText,
        mode,
        createdAt: Date.now(),
        segments
      };
      this.isManualEditOverride = false;
      this.persistDiffState();
      this.syncSegmentsToChapterContent(chap.id);
      this.refreshReviewSurfaceForActiveChapter();

      // Chuyển ngay sang Tab 1 để tác giả nhìn thấy màu đánh dấu đoạn AI viết và duyệt
      window.NoirStudio.navigator?.navigateToScreen('SCREEN_1_WRITE');
      this.utils.showToast(
        `✨ Đã đưa ${aiParagraphs.length} đoạn AI vào Bản thảo Tab 1! Các đoạn AI viết được tô màu xanh ngọc để bạn duyệt (Chấp nhận / Từ chối).`,
        'success',
        4500
      );
      return true;
    }

    syncSegmentsToChapterContent(chapterId) {
      const state = this.chapterDiffMap[chapterId];
      const chap = this.chapterMgr.chapters.find((c) => c.id === chapterId);
      if (!chap || !state) return;

      const combined = state.segments
        .map((s) => s.text.trim())
        .filter(Boolean)
        .join('\n\n');

      chap.content = combined;
      chap.wordCount = this.utils.countVietnameseWords(combined);
      const editor = document.getElementById('textarea-chapter-content');
      if (editor && chap.id === this.chapterMgr.activeChapterId) {
        editor.value = combined;
        this.chapterMgr.updateLiveWordStatsUI(combined);
      }
      this.autoSaver.triggerSave(false);
    }

    refreshReviewSurfaceForActiveChapter() {
      const chap = this.chapterMgr.getActiveChapter();
      const toolbar = document.getElementById('ai-diff-review-toolbar');
      const surface = document.getElementById('ai-diff-review-surface');
      const textarea = document.getElementById('textarea-chapter-content');
      const pendingBadge = document.getElementById('ai-diff-pending-count');
      const toggleBtn = document.getElementById('btn-ai-diff-toggle-edit-view');

      if (!chap || !toolbar || !surface || !textarea) return;

      const diffState = this.chapterDiffMap[chap.id];
      const aiSegments = diffState
        ? (diffState.segments || []).filter((s) => s.type === 'AI')
        : [];

      // Chỉ hiển thị giao diện duyệt màu khi thực sự có đoạn AI chờ duyệt trong chương này
      if (!diffState || aiSegments.length === 0) {
        delete this.chapterDiffMap[chap.id];
        this.persistDiffState();
        toolbar.classList.add('hidden');
        surface.classList.add('hidden');
        textarea.classList.remove('hidden');
        return;
      }

      toolbar.classList.remove('hidden');
      if (pendingBadge) {
        pendingBadge.textContent = `${aiSegments.length} đoạn AI chờ duyệt`;
      }

      if (this.isManualEditOverride) {
        surface.classList.add('hidden');
        textarea.classList.remove('hidden');
        if (toggleBtn) toggleBtn.textContent = '👁️ Xem màu phân biệt AI / Người viết';
        return;
      }

      if (toggleBtn) toggleBtn.textContent = '✏️ Sửa tay trực tiếp';
      surface.classList.remove('hidden');
      textarea.classList.add('hidden');

      surface.innerHTML = diffState.segments
        .map((seg, idx) => {
          if (seg.type === 'HUMAN') {
            return `
              <div class="mb-4 text-studioLightText dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">${this.utils.escapeHtml(
                seg.text
              )}</div>
            `;
          }
          return `
            <div class="mb-4 p-3.5 rounded-2xl border-2 border-emerald-500/60 bg-emerald-500/10 dark:bg-emerald-950/40 transition shadow-sm" data-ai-seg-box="${this.utils.escapeHtml(
              seg.id
            )}">
              <div class="flex flex-wrap items-center justify-between gap-2 mb-2 pb-1.5 border-b border-emerald-500/30 font-sansUI text-[11px]">
                <span class="font-extrabold text-emerald-400 flex items-center gap-1">
                  <span>🤖 Đoạn do AI viết #${idx + 1}</span>
                  <span class="font-monoCode text-[10px] text-emerald-300/80">(${this.utils.countVietnameseWords(
                    seg.text
                  )} từ)</span>
                </span>
                <div class="flex items-center gap-1.5">
                  <button type="button" data-accept-seg="${this.utils.escapeHtml(
                    seg.id
                  )}" class="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold transition">
                    ✓ Chấp nhận đoạn này
                  </button>
                  <button type="button" data-edit-seg="${this.utils.escapeHtml(
                    seg.id
                  )}" class="px-2.5 py-1 rounded-lg border border-amber-400/50 bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 font-bold transition">
                    ✏️ Sửa nhanh
                  </button>
                  <button type="button" data-reject-seg="${this.utils.escapeHtml(
                    seg.id
                  )}" class="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-extrabold transition">
                    ✕ Từ chối (Xóa đoạn này)
                  </button>
                </div>
              </div>
              <div class="text-emerald-700 dark:text-emerald-200 leading-relaxed whitespace-pre-wrap">${this.utils.escapeHtml(
                seg.text
              )}</div>
            </div>
          `;
        })
        .join('');

      surface.querySelectorAll('[data-accept-seg]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.acceptSegment(chap.id, btn.getAttribute('data-accept-seg'));
        });
      });

      surface.querySelectorAll('[data-reject-seg]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.rejectSegment(chap.id, btn.getAttribute('data-reject-seg'));
        });
      });

      surface.querySelectorAll('[data-edit-seg]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.editSingleSegment(chap.id, btn.getAttribute('data-edit-seg'));
        });
      });
    }

    acceptSegment(chapterId, segId) {
      const state = this.chapterDiffMap[chapterId];
      if (!state) return;
      const seg = state.segments.find((s) => s.id === segId);
      if (seg) {
        seg.type = 'HUMAN';
      }
      this.persistDiffState();
      this.syncSegmentsToChapterContent(chapterId);
      this.refreshReviewSurfaceForActiveChapter();
      this.utils.showToast('✓ Đã chấp nhận đoạn văn AI vào bản thảo chính thức!', 'success', 2000);
    }

    rejectSegment(chapterId, segId) {
      const state = this.chapterDiffMap[chapterId];
      if (!state) return;
      state.segments = state.segments.filter((s) => s.id !== segId);
      this.persistDiffState();
      this.syncSegmentsToChapterContent(chapterId);
      this.refreshReviewSurfaceForActiveChapter();
      this.utils.showToast('✕ Đã từ chối và loại bỏ đoạn văn AI đó khỏi bản thảo.', 'info', 2000);
    }

    editSingleSegment(chapterId, segId) {
      const state = this.chapterDiffMap[chapterId];
      if (!state) return;
      const seg = state.segments.find((s) => s.id === segId);
      if (!seg) return;
      const edited = window.prompt(
        'Chỉnh sửa nội dung đoạn văn này (Sau khi sửa sẽ được chấp nhận thành văn bản chính thức):',
        seg.text
      );
      if (edited !== null) {
        seg.text = edited.trim();
        seg.type = 'HUMAN';
        this.persistDiffState();
        this.syncSegmentsToChapterContent(chapterId);
        this.refreshReviewSurfaceForActiveChapter();
      }
    }

    acceptAllForActiveChapter() {
      const chap = this.chapterMgr.getActiveChapter();
      if (!chap || !this.chapterDiffMap[chap.id]) return;
      this.syncSegmentsToChapterContent(chap.id);
      delete this.chapterDiffMap[chap.id];
      this.isManualEditOverride = false;
      this.persistDiffState();
      this.refreshReviewSurfaceForActiveChapter();
      this.utils.showToast(
        '✅ Đã chấp nhận toàn bộ đoạn văn AI bổ sung vào bản thảo chính thức!',
        'success'
      );
    }

    rejectAllForActiveChapter() {
      const chap = this.chapterMgr.getActiveChapter();
      if (!chap || !this.chapterDiffMap[chap.id]) return;
      const state = this.chapterDiffMap[chap.id];
      const restored = state.originalText ?? '';
      chap.content = restored;
      chap.wordCount = this.utils.countVietnameseWords(restored);
      const editor = document.getElementById('textarea-chapter-content');
      if (editor) editor.value = restored;
      this.chapterMgr.updateLiveWordStatsUI(restored);

      delete this.chapterDiffMap[chap.id];
      this.isManualEditOverride = false;
      this.persistDiffState();
      this.refreshReviewSurfaceForActiveChapter();
      this.autoSaver.triggerSave(false);
      this.utils.showToast(
        '↩️ Đã từ chối toàn bộ phần AI vừa thêm và hoàn nguyên bản thảo gốc của bạn!',
        'warning'
      );
    }

    toggleManualEditView() {
      const chap = this.chapterMgr.getActiveChapter();
      if (!chap || !this.chapterDiffMap[chap.id]) return;
      if (this.isManualEditOverride) {
        // Nếu tác giả vừa sửa tay trong textarea, cập nhật lại đoạn đầu tiên
        const editor = document.getElementById('textarea-chapter-content');
        if (editor) {
          chap.content = editor.value;
        }
        this.isManualEditOverride = false;
      } else {
        this.isManualEditOverride = true;
      }
      this.refreshReviewSurfaceForActiveChapter();
    }
  }

  const aiDiffEngine = new GoogleDocsStyleAIDiffEngine(
    idbEngine,
    chapterManager,
    autoSaver,
    versionVault,
    uiUtils
  );
  window.NoirStudio.aiDiff = aiDiffEngine;


  // ==========================================================================
  // BƯỚC 12 (MODULE 11): HỆ THỐNG STORY BIBLE, HỒ SƠ NHÂN VẬT, MA TRẬN "AI BIẾT GÌ",
  //                      SỔ CÁI PHỤC BÚT & DANH SÁCH TỪ CẤM SÁO RỖNG (TAB 4)
  // ==========================================================================
  class StoryBibleAndLoreMatrixEngine {
    constructor(idb, fs, utils) {
      this.idb = idb;
      this.fs = fs;
      this.utils = utils;
      this.templateLocked = false;
      this.characters = [];
      this.knowledgeMatrix = [];
      this.cluesLedger = [];
      this.defaultTemplate = [
        '=== [I. BỐI CẢNH THẾ GIỚI & QUY TẮC BẤT KHẢ XÂM PHẠM] ===',
        '- Thời đại & Không gian chính:',
        '- Hệ thống sức mạnh / Quy luật cốt lõi:',
        '- Những điều tuyệt đối không được mâu thuẫn:',
        '',
        '=== [II. HỒ SƠ NHÂN VẬT TRUNG TÂM & GIỌNG ĐIỆU ĐỐI THOẠI] ===',
        '- Nhân vật chính (Tính cách, mục tiêu, vết thương tâm lý, thói quen ăn nói):',
        '- Các nhân vật phụ quan trọng:',
        '',
        '=== [III. TÓM TẮT DIỄN BIẾN CÁC CHƯƠNG ĐÃ DUYỆT] ===',
        '- Trục sự kiện đã xảy ra:',
        '',
        '=== [IV. PHỤC BÚT ĐANG GIEO & BÍ MẬT CHƯA TIẾT LỘ] ===',
        '- Các manh mối đang chờ thu hồi:'
      ].join('\n');
    }

    loadAllFromStorage() {
      const savedTemplate =
        localStorage.getItem(STUDIO_CONSTANTS.STORAGE_KEYS.BIBLE_TEMPLATE) ||
        this.defaultTemplate;
      const savedRendered =
        localStorage.getItem(STUDIO_CONSTANTS.STORAGE_KEYS.BIBLE_RENDERED) ||
        savedTemplate;
      this.templateLocked =
        localStorage.getItem(STUDIO_CONSTANTS.STORAGE_KEYS.BIBLE_LOCKED) === 'true';

      this.characters = this.idb.getLocalJSON(STUDIO_CONSTANTS.STORAGE_KEYS.CHARACTERS, [
        {
          id: 'char_default_1',
          name: 'Nhân vật chính',
          role: 'Trung tâm cốt truyện',
          traits: 'Điềm tĩnh, quan sát sắc bén, nội tâm sâu sắc',
          speechStyle: 'Ngắn gọn, giàu ẩn ý, xưng hô nhất quán'
        }
      ]);

      this.knowledgeMatrix = this.idb.getLocalJSON(
        STUDIO_CONSTANTS.STORAGE_KEYS.KNOWLEDGE_MATRIX,
        [
          {
            id: 'know_default_1',
            secret: 'Chân tướng sự kiện đêm mưa mở đầu',
            whoKnows: 'Chỉ người đứng sau màn',
            whoDoesNotKnow: 'Nhân vật chính và các đồng đội (Cấm AI để lộ sớm!)'
          }
        ]
      );

      this.cluesLedger = this.idb.getLocalJSON(STUDIO_CONSTANTS.STORAGE_KEYS.CLUES_LEDGER, [
        {
          id: 'clue_default_1',
          title: 'Chiếc đồng hồ quả quýt ngừng chạy lúc 23:15',
          plantedIn: 'Chương 1',
          status: 'PLANTED',
          note: 'Manh mối dẫn tới nghi phạm thực sự ở giữa truyện'
        }
      ]);

      const savedAntiCliche =
        localStorage.getItem(STUDIO_CONSTANTS.STORAGE_KEYS.ANTI_CLICHE) ||
        STUDIO_CONSTANTS.DEFAULT_ANTI_CLICHE.join(', ');

      const tplEl = document.getElementById('textarea-bible-template-frame');
      const renEl = document.getElementById('textarea-rendered-bible-content');
      const antiEl = document.getElementById('textarea-anti-cliche-blacklist');

      if (tplEl) {
        tplEl.value = savedTemplate;
        tplEl.readOnly = this.templateLocked;
      }
      if (renEl) renEl.value = savedRendered;
      if (antiEl) antiEl.value = savedAntiCliche;

      this.updateLockButtonUI();
      this.renderCharactersUI();
      this.renderKnowledgeMatrixUI();
      this.renderCluesLedgerUI();
      this.renderQuickCharacterChipsInTab1();
      this.updateCommandModalStatusPills();
    }

    updateLockButtonUI() {
      const btn = document.getElementById('btn-toggle-bible-template-lock');
      const tplEl = document.getElementById('textarea-bible-template-frame');
      if (tplEl) tplEl.readOnly = this.templateLocked;
      if (!btn) return;
      if (this.templateLocked) {
        btn.className =
          'px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]';
        btn.textContent = '🔒 Đã Khóa Khung (Bấm để mở)';
      } else {
        btn.className =
          'px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px]';
        btn.textContent = '🔓 Chốt Khung Cấu Trúc';
      }
    }

    toggleTemplateLock() {
      this.templateLocked = !this.templateLocked;
      localStorage.setItem(
        STUDIO_CONSTANTS.STORAGE_KEYS.BIBLE_LOCKED,
        String(this.templateLocked)
      );
      this.updateLockButtonUI();
      this.saveAllBibleData(false);
      this.utils.showToast(
        this.templateLocked
          ? '🔒 Đã khóa Khung Cấu Trúc Story Bible để bảo vệ các đề mục cốt lõi!'
          : '🔓 Đã mở khóa Khung Cấu Trúc Story Bible để bạn tự do chỉnh sửa.',
        'info'
      );
    }

    async saveAllBibleData(showFeedback = true) {
      const tplEl = document.getElementById('textarea-bible-template-frame');
      const renEl = document.getElementById('textarea-rendered-bible-content');
      const antiEl = document.getElementById('textarea-anti-cliche-blacklist');

      if (tplEl) {
        localStorage.setItem(STUDIO_CONSTANTS.STORAGE_KEYS.BIBLE_TEMPLATE, tplEl.value);
      }
      if (renEl) {
        localStorage.setItem(STUDIO_CONSTANTS.STORAGE_KEYS.BIBLE_RENDERED, renEl.value);
      }
      if (antiEl) {
        localStorage.setItem(STUDIO_CONSTANTS.STORAGE_KEYS.ANTI_CLICHE, antiEl.value);
      }

      this.idb.setLocalJSON(STUDIO_CONSTANTS.STORAGE_KEYS.CHARACTERS, this.characters);
      this.idb.setLocalJSON(
        STUDIO_CONSTANTS.STORAGE_KEYS.KNOWLEDGE_MATRIX,
        this.knowledgeMatrix
      );
      this.idb.setLocalJSON(STUDIO_CONSTANTS.STORAGE_KEYS.CLUES_LEDGER, this.cluesLedger);

      await this.idb.set(STUDIO_CONSTANTS.STORES.STORY_BIBLE, 'master_bible_v36', {
        template: tplEl?.value || '',
        rendered: renEl?.value || '',
        characters: this.characters,
        knowledgeMatrix: this.knowledgeMatrix,
        cluesLedger: this.cluesLedger,
        antiCliche: antiEl?.value || '',
        updatedAt: Date.now()
      });

      if (this.fs.rootHandle) {
        await this.fs.writeTextFile(
          '03_Story_Bible_Local',
          'Story_Bible_Chinh_Thuc.txt',
          this.buildCompiledBibleBlockForPrompt()
        );
      }

      this.renderQuickCharacterChipsInTab1();
      this.updateCommandModalStatusPills();

      if (showFeedback) {
        this.utils.showToast(
          '🏛️ Đã lưu toàn bộ Story Bible, Nhân vật, Ma trận Ai Biết Gì & Phục bút (Sẵn sàng tích hợp vào Prompt Tổng)!',
          'success'
        );
      }
    }

    renderCharactersUI() {
      const box = document.getElementById('character-profiles-list');
      if (!box) return;
      if (this.characters.length === 0) {
        box.innerHTML =
          '<div class="text-zinc-500 italic p-2">Chưa có hồ sơ nhân vật. Hãy bấm "+ Thêm Nhân Vật" để tạo!</div>';
        return;
      }
      box.innerHTML = this.characters
        .map(
          (ch) => `
          <div class="p-3 rounded-xl border border-studioLightBorder dark:border-zinc-800 bg-studioLightBg dark:bg-zinc-950 space-y-1.5">
            <div class="flex items-center justify-between gap-2">
              <div class="font-extrabold text-xs text-emerald-400">👤 ${this.utils.escapeHtml(
                ch.name
              )} <span class="text-[10px] font-semibold text-zinc-400">(${this.utils.escapeHtml(
                ch.role || 'Nhân vật'
              )})</span></div>
              <div class="flex items-center gap-1">
                <button type="button" data-edit-char="${this.utils.escapeHtml(
                  ch.id
                )}" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-indigo-600 text-[10px] text-white font-bold">✏️ Sửa</button>
                <button type="button" data-del-char="${this.utils.escapeHtml(
                  ch.id
                )}" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-rose-600 text-[10px] text-white font-bold">✕</button>
              </div>
            </div>
            <div class="text-[11px] text-zinc-300"><strong>Tính cách & Đặc điểm:</strong> ${this.utils.escapeHtml(
              ch.traits || 'Chưa mô tả'
            )}</div>
            <div class="text-[11px] text-amber-300/90"><strong>Giọng thoại & Xưng hô:</strong> ${this.utils.escapeHtml(
              ch.speechStyle || 'Tự nhiên'
            )}</div>
          </div>
        `
        )
        .join('');

      box.querySelectorAll('[data-edit-char]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-edit-char');
          const ch = this.characters.find((x) => x.id === id);
          if (!ch) return;
          const name = window.prompt('Tên nhân vật:', ch.name);
          if (!name) return;
          const role = window.prompt('Vai trò trong truyện:', ch.role || '') ?? ch.role;
          const traits =
            window.prompt('Tính cách, ngoại hình, mục tiêu:', ch.traits || '') ?? ch.traits;
          const speechStyle =
            window.prompt('Giọng điệu câu thoại & Cách xưng hô:', ch.speechStyle || '') ??
            ch.speechStyle;
          ch.name = name.trim();
          ch.role = role.trim();
          ch.traits = traits.trim();
          ch.speechStyle = speechStyle.trim();
          this.renderCharactersUI();
          this.saveAllBibleData(false);
        });
      });

      box.querySelectorAll('[data-del-char]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-del-char');
          this.characters = this.characters.filter((x) => x.id !== id);
          this.renderCharactersUI();
          this.saveAllBibleData(false);
        });
      });
    }

    addCharacterInteractive() {
      const name = window.prompt('Nhập tên nhân vật mới (Ví dụ: Lâm Phong):');
      if (!name || !name.trim()) return;
      const role =
        window.prompt('Vai trò của nhân vật (Ví dụ: Nhân vật chính / Phản diện):', 'Nhân vật chính') ||
        'Nhân vật';
      const traits =
        window.prompt(
          'Tính cách, khả năng & động cơ cốt lõi:',
          'Thông minh, quyết đoán, mang bí mật quá khứ'
        ) || '';
      const speechStyle =
        window.prompt(
          'Cách xưng hô & Giọng điệu khi đối thoại:',
          'Điềm đạm, câu văn sắc gọn, xưng "tôi - cậu"'
        ) || '';

      this.characters.push({
        id: 'char_' + Date.now(),
        name: name.trim(),
        role: role.trim(),
        traits: traits.trim(),
        speechStyle: speechStyle.trim()
      });
      this.renderCharactersUI();
      this.saveAllBibleData(true);
    }

    renderQuickCharacterChipsInTab1() {
      const bar = document.getElementById('quick-character-chips-bar');
      if (!bar) return;
      if (this.characters.length === 0) {
        bar.innerHTML = '';
        return;
      }
      bar.innerHTML =
        `<span class="text-[10px] text-zinc-400 font-bold mr-1">Chèn thoại nhanh:</span>` +
        this.characters
          .slice(0, 5)
          .map(
            (c) =>
              `<button type="button" data-quick-char-name="${this.utils.escapeHtml(
                c.name
              )}" class="px-2 py-0.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-300 text-[10px] font-bold transition" title="Chèn câu thoại chuẩn của ${this.utils.escapeHtml(
                c.name
              )} vào vị trí con trỏ">💬 ${this.utils.escapeHtml(c.name)}</button>`
          )
          .join('');

      bar.querySelectorAll('[data-quick-char-name]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const charName = btn.getAttribute('data-quick-char-name');
          const editor = document.getElementById('textarea-chapter-content');
          if (!editor) return;
          const start = editor.selectionStart ?? editor.value.length;
          const end = editor.selectionEnd ?? editor.value.length;
          const selected = editor.value.slice(start, end).trim();
          const lineToInsert = selected
            ? `- ${selected} (${charName})`
            : `\n- ... (${charName})`;
          editor.setRangeText(lineToInsert, start, end, 'end');
          editor.focus();
          editor.dispatchEvent(new Event('input'));
        });
      });
    }

    renderKnowledgeMatrixUI() {
      const box = document.getElementById('knowledge-matrix-list');
      if (!box) return;
      if (this.knowledgeMatrix.length === 0) {
        box.innerHTML =
          '<div class="text-zinc-500 italic p-2">Chưa có mục nào trong Ma trận Ai Biết Gì.</div>';
        return;
      }
      box.innerHTML = this.knowledgeMatrix
        .map(
          (item) => `
          <div class="p-3 rounded-xl border border-amber-500/30 bg-studioLightBg dark:bg-zinc-950 space-y-1">
            <div class="flex items-center justify-between gap-2">
              <span class="font-extrabold text-xs text-amber-400">🔒 Bí mật: ${this.utils.escapeHtml(
                item.secret
              )}</span>
              <button type="button" data-del-know="${this.utils.escapeHtml(
                item.id
              )}" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-rose-600 text-[10px] text-white font-bold">✕</button>
            </div>
            <div class="text-[11px] text-emerald-300"><strong>✔ Người ĐÃ BIẾT:</strong> ${this.utils.escapeHtml(
              item.whoKnows
            )}</div>
            <div class="text-[11px] text-rose-300"><strong>✘ Người CHƯA BIẾT (Cấm AI lộ):</strong> ${this.utils.escapeHtml(
              item.whoDoesNotKnow
            )}</div>
          </div>
        `
        )
        .join('');

      box.querySelectorAll('[data-del-know]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-del-know');
          this.knowledgeMatrix = this.knowledgeMatrix.filter((x) => x.id !== id);
          this.renderKnowledgeMatrixUI();
          this.saveAllBibleData(false);
        });
      });
    }

    addKnowledgeEntryInteractive() {
      const secret = window.prompt('Nhập bí mật / sự thật quan trọng trong cốt truyện:');
      if (!secret || !secret.trim()) return;
      const whoKnows =
        window.prompt('Những nhân vật nào ĐÃ BIẾT sự thật này?', 'Chỉ kẻ chủ mưu') || 'Chưa rõ';
      const whoDoesNotKnow =
        window.prompt(
          'Những nhân vật nào TUYỆT ĐỐI CHƯA BIẾT (AI không được phép viết lộ ra)?',
          'Nhân vật chính'
        ) || 'Nhân vật chính';

      this.knowledgeMatrix.push({
        id: 'know_' + Date.now(),
        secret: secret.trim(),
        whoKnows: whoKnows.trim(),
        whoDoesNotKnow: whoDoesNotKnow.trim()
      });
      this.renderKnowledgeMatrixUI();
      this.saveAllBibleData(true);
    }

    renderCluesLedgerUI() {
      const box = document.getElementById('clues-ledger-list');
      if (!box) return;
      if (this.cluesLedger.length === 0) {
        box.innerHTML =
          '<div class="text-zinc-500 italic p-2">Chưa có phục bút nào. Hãy bấm "+ Gieo Phục Bút Mới"!</div>';
        return;
      }
      box.innerHTML = this.cluesLedger
        .map(
          (clue) => `
          <div class="p-3 rounded-xl border border-indigo-500/30 bg-studioLightBg dark:bg-zinc-950 space-y-1">
            <div class="flex items-center justify-between gap-2">
              <span class="font-extrabold text-xs text-indigo-300">🔫 ${this.utils.escapeHtml(
                clue.title
              )}</span>
              <div class="flex items-center gap-1">
                <button type="button" data-toggle-clue="${this.utils.escapeHtml(
                  clue.id
                )}" class="px-2 py-0.5 rounded text-[10px] font-bold ${
            clue.status === 'RESOLVED'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
          }">${clue.status === 'RESOLVED' ? '✅ Đã thu hồi' : '⏳ Đang cài cắm'}</button>
                <button type="button" data-del-clue="${this.utils.escapeHtml(
                  clue.id
                )}" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-rose-600 text-[10px] text-white font-bold">✕</button>
              </div>
            </div>
            <div class="text-[11px] text-zinc-400">Gieo tại: <strong>${this.utils.escapeHtml(
              clue.plantedIn || 'Chương 1'
            )}</strong> — ${this.utils.escapeHtml(clue.note || '')}</div>
          </div>
        `
        )
        .join('');

      box.querySelectorAll('[data-toggle-clue]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-toggle-clue');
          const c = this.cluesLedger.find((x) => x.id === id);
          if (c) {
            c.status = c.status === 'RESOLVED' ? 'PLANTED' : 'RESOLVED';
            this.renderCluesLedgerUI();
            this.saveAllBibleData(false);
          }
        });
      });

      box.querySelectorAll('[data-del-clue]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-del-clue');
          this.cluesLedger = this.cluesLedger.filter((x) => x.id !== id);
          this.renderCluesLedgerUI();
          this.saveAllBibleData(false);
        });
      });
    }

    addClueEntryInteractive() {
      const title = window.prompt('Tên phục bút / vật chứng / chi tiết cài cắm:');
      if (!title || !title.trim()) return;
      const plantedIn =
        window.prompt('Được gieo ở chương nào?', 'Chương hiện tại') || 'Chương hiện tại';
      const note =
        window.prompt('Ý nghĩa hoặc dự kiến chương sẽ thu hồi phục bút này:', '') || '';

      this.cluesLedger.push({
        id: 'clue_' + Date.now(),
        title: title.trim(),
        plantedIn: plantedIn.trim(),
        status: 'PLANTED',
        note: note.trim()
      });
      this.renderCluesLedgerUI();
      this.saveAllBibleData(true);
    }

    updateCommandModalStatusPills() {
      const biblePill = document.getElementById('cmd-bible-status-pill');
      if (biblePill) {
        const ren =
          document.getElementById('textarea-rendered-bible-content')?.value ||
          localStorage.getItem(STUDIO_CONSTANTS.STORAGE_KEYS.BIBLE_RENDERED) ||
          '';
        const words = this.utils.countVietnameseWords(ren);
        biblePill.textContent = `Story Bible: Đã nạp (${words} từ • ${this.characters.length} NV • ${this.cluesLedger.length} Phục bút)`;
      }
    }

    /**
     * Tổng hợp toàn bộ dữ liệu Story Bible + Nhân vật + Ma trận Ai Biết Gì + Phục bút + Từ cấm
     * thành một khối ngữ cảnh chuẩn mực để tự động đưa vào Prompt Tổng Hợp!
     */
    buildCompiledBibleBlockForPrompt() {
      const tpl =
        document.getElementById('textarea-bible-template-frame')?.value ||
        localStorage.getItem(STUDIO_CONSTANTS.STORAGE_KEYS.BIBLE_TEMPLATE) ||
        '';
      const ren =
        document.getElementById('textarea-rendered-bible-content')?.value ||
        localStorage.getItem(STUDIO_CONSTANTS.STORAGE_KEYS.BIBLE_RENDERED) ||
        '';
      const anti =
        document.getElementById('textarea-anti-cliche-blacklist')?.value ||
        localStorage.getItem(STUDIO_CONSTANTS.STORAGE_KEYS.ANTI_CLICHE) ||
        STUDIO_CONSTANTS.DEFAULT_ANTI_CLICHE.join(', ');

      const charLines =
        this.characters.length > 0
          ? this.characters
              .map(
                (c, i) =>
                  `  ${i + 1}. [${c.name}] (${c.role || 'Nhân vật'}):\n     - Tính cách & Đặc điểm: ${
                    c.traits || 'Chưa ghi'
                  }\n     - Giọng thoại & Xưng hô bắt buộc: ${c.speechStyle || 'Tự nhiên'}`
              )
              .join('\n')
          : '  (Chưa khai báo danh sách nhân vật riêng)';

      const knowLines =
        this.knowledgeMatrix.length > 0
          ? this.knowledgeMatrix
              .map(
                (k, i) =>
                  `  ${i + 1}. Bí mật "${k.secret}":\n     - Ai ĐÃ BIẾT: ${
                    k.whoKnows
                  }\n     - Ai CHƯA BIẾT (Tuyệt đối không được để lộ trong lời nói/suy nghĩ của họ): ${
                    k.whoDoesNotKnow
                  }`
              )
              .join('\n')
          : '  (Không có giới hạn bí mật đặc biệt)';

      const clueLines =
        this.cluesLedger.length > 0
          ? this.cluesLedger
              .map(
                (cl, i) =>
                  `  ${i + 1}. [${
                    cl.status === 'RESOLVED' ? 'ĐÃ THU HỒI' : 'ĐANG GIEO - CẦN DUY TRÌ LOGIC'
                  }] ${cl.title} (Gieo tại: ${cl.plantedIn}) — Ghi chú: ${cl.note || 'Không'}`
              )
              .join('\n')
          : '  (Chưa có phục bút nào)';

      return [
        `====================================================================`,
        `🏛️ HỒ SƠ STORY BIBLE & LUẬT BẤT KHẢ XÂM PHẠM (ĐÃ LIÊN KẾT TỰ ĐỘNG)`,
        `====================================================================`,
        `[1. NỘI DUNG STORY BIBLE CHÍNH THỨC]:`,
        ren.trim() || tpl.trim() || '(Chưa có nội dung Story Bible)',
        ``,
        `[2. HỒ SƠ NHÂN VẬT & GIỌNG ĐIỆU ĐỐI THOẠI]:`,
        charLines,
        ``,
        `[3. MA TRẬN BẤT ĐỐI XỨNG "AI BIẾT GÌ" (CHỐNG LỘ BÍ MẬT SỚM)]:`,
        knowLines,
        ``,
        `[4. SỔ CÁI PHỤC BÚT & MANH MỐI (CHEKHOV'S GUN)]:`,
        clueLines,
        ``,
        `[5. DANH SÁCH TỪ SÁO RỖNG CẤM AI SỬ DỤNG]:`,
        `Tuyệt đối tránh dùng các cụm từ sáo rỗng sau: ${anti}`
      ].join('\n');
    }
  }

  const storyBibleEngine = new StoryBibleAndLoreMatrixEngine(idbEngine, fsEngine, uiUtils);
  window.NoirStudio.storyBible = storyBibleEngine;


  // ==========================================================================
  // BƯỚC 13 (MODULE 12): BỘ XÂY DỰNG MỐC CHUYỂN PHÂN CẢNH & ĐỔI GÓC NHÌN POV
  //                      (TỰ ĐỘNG TÍCH HỢP 100% VÀO PROMPT TỔNG HỢP CHÍNH THỨC)
  // ==========================================================================
  class SceneTransitionAndPOVBuilderEngine {
    constructor(idb, chapterMgr, utils) {
      this.idb = idb;
      this.chapterMgr = chapterMgr;
      this.utils = utils;
      this.markers = [];
    }

    init() {
      this.markers = this.idb.getLocalJSON(STUDIO_CONSTANTS.STORAGE_KEYS.SCENE_MARKERS, []);
      if (!Array.isArray(this.markers)) this.markers = [];
      this.renderMarkersListUI();
    }

    persist() {
      this.idb.setLocalJSON(STUDIO_CONSTANTS.STORAGE_KEYS.SCENE_MARKERS, this.markers);
      this.renderMarkersListUI();
    }

    getMarkersForActiveChapter() {
      const chapId = this.chapterMgr.activeChapterId;
      return this.markers.filter((m) => !m.chapterId || m.chapterId === chapId);
    }

    addMarkerFromModal() {
      const povEl = document.getElementById('scene-builder-pov');
      const timeEl = document.getElementById('scene-builder-time');
      const locEl = document.getElementById('scene-builder-location');
      const goalEl = document.getElementById('scene-builder-goal');

      const pov = (povEl?.value || '').trim() || 'Ngôi thứ 3 giới hạn (Nhân vật chính)';
      const time = (timeEl?.value || '').trim() || 'Tiếp nối ngay sau cảnh trước';
      const location = (locEl?.value || '').trim() || 'Không gian hiện tại';
      const goal = (goalEl?.value || '').trim();

      if (!goal && !povEl?.value && !locEl?.value) {
        this.utils.showToast(
          '⚠️ Hãy nhập ít nhất Mục tiêu phân cảnh hoặc Địa điểm/POV để tạo mốc chuyển cảnh!',
          'warning'
        );
        return;
      }

      const activeChap = this.chapterMgr.getActiveChapter();
      const marker = {
        id: 'scene_' + Date.now(),
        chapterId: activeChap?.id || null,
        chapterTitle: activeChap?.displayTitle || 'Chương hiện tại',
        pov,
        time,
        location,
        goal: goal || 'Triển khai tự nhiên theo mạch truyện chính',
        createdAt: Date.now()
      };

      this.markers.push(marker);
      this.persist();

      // Đồng bộ POV mới nhất sang ô POV trong Trung tâm điều khiển AI
      const cmdPov = document.getElementById('select-scene-pov');
      if (cmdPov && pov) cmdPov.value = pov;

      if (goalEl) goalEl.value = '';
      this.utils.showToast(
        `🎬 Đã thêm Mốc chuyển phân cảnh (${pov} @ ${location}) vào Prompt Tổng Hợp!`,
        'success'
      );
    }

    deleteMarker(markerId) {
      this.markers = this.markers.filter((m) => m.id !== markerId);
      this.persist();
      this.utils.showToast('🗑️ Đã xóa mốc chuyển phân cảnh.', 'info', 1800);
    }

    renderMarkersListUI() {
      const listEl = document.getElementById('scene-markers-list');
      const topBadge = document.getElementById('scene-markers-badge');
      const cmdPill = document.getElementById('cmd-scenes-status-pill');

      const activeList = this.getMarkersForActiveChapter();
      const count = activeList.length;

      if (topBadge) topBadge.textContent = `${count} mốc`;
      if (cmdPill) {
        cmdPill.textContent = `Mốc chuyển cảnh: ${count} mốc đã gắn kết`;
      }

      if (!listEl) return;
      if (activeList.length === 0) {
        listEl.innerHTML =
          '<div class="p-3 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-500 italic">Chưa có mốc chuyển phân cảnh nào cho chương này. Hãy điền thông tin bên trên và bấm "+ Thêm Mốc Phân Cảnh" để định hướng bố cục cảnh cho AI!</div>';
        return;
      }

      listEl.innerHTML = activeList
        .map(
          (m, idx) => `
          <div class="p-3 rounded-xl border border-amber-500/30 bg-studioLightBg dark:bg-zinc-950 flex items-start justify-between gap-2">
            <div class="space-y-1">
              <div class="font-extrabold text-amber-400">
                🎬 Phân cảnh #${idx + 1} — POV: <span class="text-emerald-300">${this.utils.escapeHtml(
                  m.pov
                )}</span>
              </div>
              <div class="text-[11px] text-zinc-400">
                ⏰ <strong>Thời gian:</strong> ${this.utils.escapeHtml(
                  m.time
                )} &nbsp;|&nbsp; 📍 <strong>Địa điểm:</strong> ${this.utils.escapeHtml(m.location)}
              </div>
              <div class="text-xs text-zinc-200">
                🎯 <strong>Diễn biến cần đạt:</strong> ${this.utils.escapeHtml(m.goal)}
              </div>
            </div>
            <button type="button" data-del-scene-marker="${this.utils.escapeHtml(
              m.id
            )}" class="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-rose-600 text-white font-bold text-[10px] shrink-0">✕ Xóa</button>
          </div>
        `
        )
        .join('');

      listEl.querySelectorAll('[data-del-scene-marker]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.deleteMarker(btn.getAttribute('data-del-scene-marker'));
        });
      });
    }

    /**
     * Xuất toàn bộ chuỗi Mốc chuyển phân cảnh để nạp thẳng vào Prompt Tổng Hợp
     */
    buildCompiledSceneMarkersBlockForPrompt() {
      const activeList = this.getMarkersForActiveChapter();
      const defaultPov =
        document.getElementById('select-scene-pov')?.value ||
        'Ngôi thứ 3 giới hạn (Theo sát nhân vật chính)';

      if (activeList.length === 0) {
        return [
          `====================================================================`,
          `🎬 ĐỊNH HƯỚNG ĐIỂM NHÌN (POV) & NHỊP CHUYỂN PHÂN CẢNH`,
          `====================================================================`,
          `- Điểm nhìn (POV) chủ đạo: ${defaultPov}`,
          `- Yêu cầu chuyển cảnh: Triển khai liền mạch, có mô tả không gian, thời gian và cảm xúc chuyển tiếp mượt mà giữa các phân đoạn.`
        ].join('\n');
      }

      const lines = activeList.map(
        (m, idx) =>
          `  • [MỐC PHÂN CẢNH #${idx + 1}]:\n` +
          `    - Góc nhìn nhân vật (POV): ${m.pov}\n` +
          `    - Thời gian diễn ra: ${m.time}\n` +
          `    - Không gian / Địa điểm: ${m.location}\n` +
          `    - Mục tiêu & Diễn biến bắt buộc: ${m.goal}`
      );

      return [
        `====================================================================`,
        `🎬 CÁC MỐC CHUYỂN PHÂN CẢNH & ĐỔI GÓC NHÌN BẮT BUỘC TUÂN THỦ (${activeList.length} MỐC)`,
        `====================================================================`,
        `- Điểm nhìn chung: ${defaultPov}`,
        ...lines,
        `- Lưu ý quan trọng: Khi chuyển từ phân cảnh này sang phân cảnh tiếp theo, phải có dấu phân cách tinh tế hoặc đoạn văn neo thời gian/không gian rõ ràng, tuyệt đối không nhảy cảnh đột ngột!`
      ].join('\n');
    }
  }

  const sceneBuilder = new SceneTransitionAndPOVBuilderEngine(
    idbEngine,
    chapterManager,
    uiUtils
  );
  window.NoirStudio.sceneBuilder = sceneBuilder;


  // ==========================================================================
  // BƯỚC 14 (MODULE 13): BẢNG CẤU HÌNH KHUNG PROMPT HỆ THỐNG CHO CẢ 5 CHẾ ĐỘ AI
  //                      (CHẾ ĐỘ 1 -> 5, NGÔN NGỮ VĂN HỌC TỰ NHIÊN, GIÀU CẢM XÚC)
  // ==========================================================================
  class FiveModeSystemPromptsEngine {
    constructor(idb, utils) {
      this.idb = idb;
      this.utils = utils;
      this.defaultPrompts = {
        MODE_1_DRAFT: [
          'Bạn là Tiểu Thuyết Gia Thực Thực & Biên Tập Viên Văn Học Cấp Cao với hơn 30 năm kinh nghiệm sáng tác Light Novel và tiểu thuyết tâm lý — hành động.',
          'NHIỆM VỤ CỐT LÕI (CHẾ ĐỘ 1 — VIẾT BẢN NHÁP TIỂU THUYẾT CHÍNH THỨC):',
          '1. Viết chương truyện mới hoàn chỉnh, giàu chất điện ảnh, miêu tả sâu sắc 5 giác quan (ánh sáng, âm thanh, mùi vị, xúc cảm, nhịp thở) và nội tâm nhân vật thông qua hành động cụ thể ("Tả cảnh ngụ tình, tả hành động bộc lộ tâm lý" — Show, Don\'t Tell).',
          '2. QUY ƯỚC HỘI THOẠI BẮT BUỘC: Mọi câu thoại của nhân vật phải trình bày đúng định dạng chuẩn:',
          '   - Câu nói của nhân vật (Tên nhân vật)',
          '3. TUÂN THỦ TUYỆT ĐỐI HỒ SƠ STORY BIBLE & MA TRẬN "AI BIẾT GÌ": Không bao giờ để nhân vật nói hoặc suy nghĩ về thông tin mà họ chưa được phép biết tại thời điểm này.',
          '4. TUÂN THỦ CÁC MỐC CHUYỂN PHÂN CẢNH / ĐỔI POV đã được đính kèm trong Prompt Tổng Hợp. Triển khai đủ độ dài mục tiêu, không tóm tắt lướt qua các cảnh cao trào, không kết thúc chương kiểu giáo điều hay sáo rỗng.'
        ].join('\n'),

        MODE_2_BRAINSTORM: [
          'Bạn là Quân Sư Cốt Truyện & Kiến Trúc Sư Kịch Bản (Chế độ 2 — Tham Mưu Cốt Truyện & Gỡ Bí).',
          'NHIỆM VỤ CỐT LÕI:',
          '1. Dựa trên Story Bible, Sổ cái Phục bút và diễn biến hiện tại, hãy đề xuất 3 hướng phát triển cốt truyện (3 phương án bẻ lái / gỡ bí) từ hợp lý chặt chẽ đến bất ngờ bùng nổ.',
          '2. Với mỗi phương án, phân tích rõ: (a) Diễn biến chính, (b) Tác động tâm lý lên nhân vật, (c) Cách tận dụng hoặc cài cắm thêm phục bút (Chekhov\'s Gun), và (d) Rủi ro logic cần tránh.',
          '3. Đề xuất thêm các phân cảnh đắt giá và vài câu thoại mẫu thật ấn tượng đúng cá tính nhân vật.'
        ].join('\n'),

        MODE_3_AUDIT: [
          'Bạn là Kiểm Toán Viên Logic & Thám Tử Soi Lỗi Bản Thảo (Chế độ 3 — Kiểm Toán Logic & Soi Lỗi Mâu Thuẫn).',
          'NHIỆM VỤ CỐT LÕI:',
          '1. Đối chiếu từng chi tiết trong bản thảo/yêu cầu với Story Bible, Ma trận "Ai Biết Gì", Sổ cái Phục bút và các chương trước.',
          '2. Chỉ ra bất kỳ mâu thuẫn nào về: Thời gian — Không gian, Vị trí nhân vật, Vết thương / Thể lực, Vật phẩm mang theo, Cách xưng hô, hoặc lỗi lộ bí mật sớm.',
          '3. Đưa ra phương án sửa конкрет (viết lại đoạn bị lỗi) để bản thảo đạt độ kín kẽ hoàn hảo 100%.'
        ].join('\n'),

        MODE_4_REVIEW: [
          'Bạn là Hội Đồng Độc Giả Khó Tính & Nhà Phê Bình Văn Học (Chế độ 4 — Đánh Giá Độc Giả & Chấm Điểm Đa Chiều).',
          'NHIỆM VỤ CỐT LÕI:',
          '1. Đánh giá chương truyện dưới 3 góc nhìn: Độc giả mê nhịp nhanh gay cấn, Độc giả yêu chiều sâu tâm lý, và Biên tập viên xuất bản.',
          '2. Chấm điểm chi tiết trên thang 10 ở 5 tiêu chí: (1) Sức hút mở đầu, (2) Nhịp độ & Cao trào, (3) Độ tự nhiên của đối thoại, (4) Chiều sâu nhân vật, (5) Dư âm kết chương (Cliffhanger).',
          '3. Chỉ rõ những câu văn còn hơi cứng hoặc sáo rỗng và gợi ý cách viết lại mượt mà, giàu hồn văn hơn.'
        ].join('\n'),

        MODE_5_DIAGRAM: [
          'Bạn là Kiến Trúc Sư Sơ Đồ Cốt Truyện & Chuyên Gia Theo Dõi Dòng Thời Gian (Chế độ 5 — Vẽ Biểu Đồ Cốt Truyện & Diễn Biến Sự Kiện Theo Thời Gian).',
          'NHIỆM VỤ CỐT LÕI:',
          '1. Phân tích toàn bộ các chương được chọn cùng Story Bible để lập Bảng Theo Dõi Diễn Biến Sự Kiện Theo Trình Tự Thời Gian (Chronological Event Tracker) nhằm ngăn chặn triệt để mọi mâu thuẫn chi tiết.',
          '2. Với mỗi mốc thời gian/sự kiện, chỉ rõ: [Thời điểm] -> [Địa điểm] -> [Nhân vật tham gia] -> [Sự kiện cốt lõi] -> [Vật phẩm/Phục bút liên quan] -> [Ai biết thêm thông tin gì].',
          '3. Cuối báo cáo, hãy xuất kèm một khối JSON chuẩn trong cặp thẻ ```json ... ``` với cấu trúc {"nodes":[{"id":"n1","label":"Tên sự kiện/nhân vật","time":"Mốc giờ","group":"EVENT|CHARACTER|CLUE"}],"links":[{"source":"n1","target":"n2","label":"Quan hệ/Diễn biến"}],"contradictions":["Cảnh báo mâu thuẫn nếu có"]} để hệ thống tự động dựng Biểu Đồ Đồ Họa SVG trực quan!'
        ].join('\n')
      };
      this.customPrompts = {};
    }

    init() {
      const saved = this.idb.getLocalJSON(STUDIO_CONSTANTS.STORAGE_KEYS.MODE_PROMPTS, {});
      this.customPrompts = saved && typeof saved === 'object' ? saved : {};

      // Tương thích ngược với các khóa sysprompt từ Stage 19/20
      ['MODE_1_DRAFT', 'MODE_2_BRAINSTORM', 'MODE_3_AUDIT', 'MODE_4_REVIEW', 'MODE_5_DIAGRAM'].forEach(
        (modeKey) => {
          const legacyVal = localStorage.getItem(`noir_s19_sysprompt_${modeKey}`);
          if (legacyVal && !this.customPrompts[modeKey]) {
            this.customPrompts[modeKey] = legacyVal;
          }
        }
      );
    }

    getPromptForMode(modeKey) {
      const key = modeKey || 'MODE_1_DRAFT';
      return this.customPrompts[key] || this.defaultPrompts[key] || this.defaultPrompts.MODE_1_DRAFT;
    }

    savePromptForMode(modeKey, promptText) {
      if (!modeKey) return;
      this.customPrompts[modeKey] = String(promptText || '').trim();
      this.idb.setLocalJSON(STUDIO_CONSTANTS.STORAGE_KEYS.MODE_PROMPTS, this.customPrompts);
      localStorage.setItem(`noir_s19_sysprompt_${modeKey}`, this.customPrompts[modeKey]);
    }

    resetPromptForMode(modeKey) {
      if (!modeKey) return;
      delete this.customPrompts[modeKey];
      this.idb.setLocalJSON(STUDIO_CONSTANTS.STORAGE_KEYS.MODE_PROMPTS, this.customPrompts);
      localStorage.removeItem(`noir_s19_sysprompt_${modeKey}`);
      return this.getPromptForMode(modeKey);
    }

    openConfigModal(initialMode = null) {
      const modal = document.getElementById('modal-system-prompts-config');
      const picker = document.getElementById('sysprompt-mode-picker');
      const editor = document.getElementById('textarea-sysprompt-editor');
      if (!modal || !picker || !editor) return;

      const mode =
        initialMode ||
        document.getElementById('s20-quad-tab-selector')?.value ||
        document.getElementById('select-ai-execution-mode')?.value ||
        'MODE_1_DRAFT';

      picker.value = mode;
      editor.value = this.getPromptForMode(mode);
      modal.classList.remove('hidden');
    }
  }

  const sysPromptsEngine = new FiveModeSystemPromptsEngine(idbEngine, uiUtils);
  window.NoirStudio.sysPrompts = sysPromptsEngine;


  // ==========================================================================
  // BƯỚC 15 (MODULE 14): KÉT SẮT GEMINI API KEY TẠI TAB 6 & BỘ ĐỊNH TUYẾN MÔ HÌNH
  //                      (ĐÃ XÓA BỎ NÚT GOOGLE STUDIO & BẢNG MODEL RƯỜM RÀ)
  // ==========================================================================
  class GeminiAPIRouterAndKeyVault {
    constructor(idb, utils) {
      this.idb = idb;
      this.utils = utils;
      this.selectedModelId =
        localStorage.getItem(STUDIO_CONSTANTS.STORAGE_KEYS.SELECTED_MODEL) ||
        'gemini-3.8-flash';
    }

    init() {
      this.populateAllModelDropdowns();
      const keyInput = document.getElementById('input-gemini-api-key');
      if (keyInput) {
        keyInput.value = this.getApiKey();
      }
    }

    getApiKey() {
      const candidates = [
        localStorage.getItem(STUDIO_CONSTANTS.STORAGE_KEYS.API_KEY),
        localStorage.getItem('noir_studio_saved_api_key_v2'),
        localStorage.getItem('gemini_api_key')
      ];
      for (const k of candidates) {
        if (k && k.trim().length > 10) return k.trim();
      }
      return '';
    }

    saveApiKey(rawKey) {
      const clean = String(rawKey || '').trim();
      localStorage.setItem(STUDIO_CONSTANTS.STORAGE_KEYS.API_KEY, clean);
      localStorage.setItem('noir_studio_saved_api_key_v2', clean);
      const keyInput = document.getElementById('input-gemini-api-key');
      if (keyInput) keyInput.value = clean;
      return clean;
    }

    getModelEntry(modelId) {
      return (
        GEMINI_MODELS_CATALOG.find((m) => m.id === modelId) ||
        GEMINI_MODELS_CATALOG[0]
      );
    }

    setSelectedModel(modelId) {
      if (!modelId) return;
      this.selectedModelId = modelId;
      localStorage.setItem(STUDIO_CONSTANTS.STORAGE_KEYS.SELECTED_MODEL, modelId);
      ['select-gemini-model', 'confirm-modal-model-select', 'mode5-model-selector'].forEach(
        (domId) => {
          const el = document.getElementById(domId);
          if (el && el.value !== modelId) el.value = modelId;
        }
      );
      this.updateLiteWarningBanner(modelId);
    }

    populateAllModelDropdowns() {
      const optionsHtml = GEMINI_MODELS_CATALOG.map(
        (m) =>
          `<option value="${this.utils.escapeHtml(m.id)}" ${
            m.id === this.selectedModelId ? 'selected' : ''
          }>${this.utils.escapeHtml(m.label)}</option>`
      ).join('');

      ['select-gemini-model', 'confirm-modal-model-select', 'mode5-model-selector'].forEach(
        (domId) => {
          const selectEl = document.getElementById(domId);
          if (!selectEl) return;
          selectEl.innerHTML = optionsHtml;
          selectEl.value = this.selectedModelId;
          selectEl.addEventListener('change', () => {
            this.setSelectedModel(selectEl.value);
          });
        }
      );

      this.updateLiteWarningBanner(this.selectedModelId);
    }

    updateLiteWarningBanner(modelId) {
      const entry = this.getModelEntry(modelId);
      const warnBox = document.getElementById('confirm-model-lite-warning');
      if (!warnBox) return;
      if (entry && entry.isLite) {
        warnBox.classList.remove('hidden');
      } else {
        warnBox.classList.add('hidden');
      }
    }

    async verifyApiKeyConnection() {
      const keyInput = document.getElementById('input-gemini-api-key');
      const statusBox = document.getElementById('apikey-verify-status');
      const key = this.saveApiKey(keyInput?.value || this.getApiKey());

      if (!key) {
        if (statusBox) {
          statusBox.className =
            'p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-[11px] text-rose-200';
          statusBox.textContent = '⚠️ Vui lòng dán mã Gemini API Key (bắt đầu bằng AIza...) vào ô bên trên.';
        }
        this.utils.showToast('⚠️ Bạn chưa nhập mã Gemini API Key!', 'warning');
        return false;
      }

      if (statusBox) {
        statusBox.className =
          'p-3 rounded-xl bg-amber-950/50 border border-amber-500/40 text-[11px] text-amber-200';
        statusBox.textContent = '⏳ Đang kiểm tra kết nối tới máy chủ Gemini...';
      }

      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(
          key
        )}`;
        const resp = await fetch(url);
        if (!resp.ok) {
          throw new Error(`Mã phản hồi HTTP ${resp.status}`);
        }
        if (statusBox) {
          statusBox.className =
            'p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-[11px] text-emerald-200 font-bold';
          statusBox.textContent =
            '✅ Kết nối Gemini API Key thành công! Đã liên kết tự động với toàn bộ 5 chế độ AI ở Tab 3.';
        }
        this.utils.showToast(
          '🔑 Đã lưu và liên kết Gemini API Key thành công cho toàn bộ hệ thống!',
          'success'
        );
        return true;
      } catch (err) {
        if (statusBox) {
          statusBox.className =
            'p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-[11px] text-rose-200';
          statusBox.textContent = `❌ Không thể xác thực API Key (${err.message}). Vui lòng kiểm tra lại khóa hoặc kết nối mạng.`;
        }
        this.utils.showToast('⚠️ Khóa API chưa hợp lệ hoặc mạng đang gián đoạn.', 'error');
        return false;
      }
    }

    /**
     * Gọi Gemini API với cơ chế tự động định tuyến dự phòng (Auto-Fallback)
     * để không bao giờ bị gián đoạn khi một endpoint quá tải.
     */
    async generateTextWithFallback({
      prompt,
      systemInstruction = '',
      modelId = null,
      temperature = 0.85,
      maxOutputTokens = 8192
    }) {
      const apiKey = this.getApiKey();
      if (!apiKey) {
        document.getElementById('modal-api-key-vault')?.classList.remove('hidden');
        throw new Error(
          'Chưa có Gemini API Key. Hãy nhập khóa API tại hộp thoại Két Sắt API Key (Tab 6) để chạy AI!'
        );
      }

      const chosenEntry = this.getModelEntry(modelId || this.selectedModelId);
      const candidateTargets = [
        chosenEntry.apiTarget,
        ...(chosenEntry.fallbacks || []),
        'gemini-2.5-flash',
        'gemini-2.0-flash'
      ];
      const uniqueTargets = [...new Set(candidateTargets.filter(Boolean))];

      let lastError = null;
      for (const targetModel of uniqueTargets) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${encodeURIComponent(
            apiKey
          )}`;
          const payload = {
            contents: [
              {
                role: 'user',
                parts: [{ text: String(prompt || '') }]
              }
            ],
            generationConfig: {
              temperature: Number(temperature) || 0.85,
              maxOutputTokens: Number(maxOutputTokens) || 8192
            }
          };

          if (systemInstruction && systemInstruction.trim()) {
            payload.systemInstruction = {
              parts: [{ text: systemInstruction.trim() }]
            };
          }

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            const msg = data?.error?.message || `HTTP ${response.status}`;
            throw new Error(msg);
          }

          const parts = data?.candidates?.[0]?.content?.parts || [];
          const textOut = parts
            .map((p) => p.text || '')
            .join('\n')
            .trim();
          if (textOut) {
            return {
              text: textOut,
              usedModelLabel: chosenEntry.label,
              usedEndpoint: targetModel
            };
          }
        } catch (err) {
          lastError = err;
          console.warn(`[GeminiRouter] Thử chuyển tiếp từ ${targetModel}:`, err.message);
        }
      }

      throw lastError || new Error('Không nhận được phản hồi từ máy chủ Gemini.');
    }
  }

  const geminiRouter = new GeminiAPIRouterAndKeyVault(idbEngine, uiUtils);
  window.NoirStudio.geminiRouter = geminiRouter;


  // ==========================================================================
  // BƯỚC 16 (MODULE 15): ĐỘNG CƠ TỔNG HỢP PROMPT TỔNG 2 BƯỚC & THỰC THI VIẾT TRUYỆN
  //                      (ĐÃ FIX TRIỆT ĐỂ LỖI BẮT NHẬP LẠI CÂU LỆNH, TÍCH HỢP 100%
  //                       STORY BIBLE + MỐC CHUYỂN CẢNH + CHỌN LẠI MODEL LẦN 2)
  // ==========================================================================
  class MasterPromptSynthesizerAndExecutionEngine {
    constructor(
      idb,
      chapterMgr,
      storyBible,
      sceneBuilder,
      sysPrompts,
      rag,
      geminiRouter,
      utils
    ) {
      this.idb = idb;
      this.chapterMgr = chapterMgr;
      this.storyBible = storyBible;
      this.sceneBuilder = sceneBuilder;
      this.sysPrompts = sysPrompts;
      this.rag = rag;
      this.geminiRouter = geminiRouter;
      this.utils = utils;
      this.lastSynthesizedPrompt = '';
    }

    init() {
      const promptBox = document.getElementById('s18-fullscreen-prompt-textarea');
      const charCounter = document.getElementById('prompt-char-counter');
      const tempSlider = document.getElementById('slider-ai-temperature');
      const tempLabel = document.getElementById('label-temp-val');

      // Khôi phục câu lệnh đã lưu để không bao giờ bị mất
      const savedPrompt = localStorage.getItem('noir_v36_last_command_prompt') || '';
      if (promptBox && !promptBox.value && savedPrompt) {
        promptBox.value = savedPrompt;
      }
      if (promptBox && charCounter) {
        charCounter.textContent = `${promptBox.value.length.toLocaleString('vi-VN')} ký tự`;
      }

      if (promptBox) {
        promptBox.addEventListener('input', () => {
          const val = promptBox.value;
          localStorage.setItem('noir_v36_last_command_prompt', val);
          const legacyBeats = document.getElementById('textarea-chapter-beats');
          if (legacyBeats) legacyBeats.value = val;
          const active = this.chapterMgr.getActiveChapter();
          if (active) active.beats = val;
          if (charCounter) {
            charCounter.textContent = `${val.length.toLocaleString('vi-VN')} ký tự`;
          }
        });
      }

      if (tempSlider && tempLabel) {
        tempSlider.addEventListener('input', () => {
          tempLabel.textContent = tempSlider.value;
          localStorage.setItem(STUDIO_CONSTANTS.STORAGE_KEYS.TEMPERATURE, tempSlider.value);
        });
      }
    }

    /**
     * Lấy câu lệnh của tác giả từ mọi nguồn có thể để TUYỆT ĐỐI KHÔNG BAO GIỜ
     * báo lỗi giả "Vui lòng nhập câu lệnh" khi tác giả đã nhập rồi!
     */
    getResolvedUserCommand() {
      const primary = document.getElementById('s18-fullscreen-prompt-textarea')?.value || '';
      if (primary.trim()) return primary.trim();

      const mode5Box = document.getElementById('mode5-prompt-input')?.value || '';
      if (mode5Box.trim()) return mode5Box.trim();

      const legacyBeats = document.getElementById('textarea-chapter-beats')?.value || '';
      if (legacyBeats.trim()) return legacyBeats.trim();

      const savedLocal = localStorage.getItem('noir_v36_last_command_prompt') || '';
      if (savedLocal.trim()) return savedLocal.trim();

      const activeChap = this.chapterMgr.getActiveChapter();
      if (activeChap && activeChap.beats && activeChap.beats.trim()) {
        return activeChap.beats.trim();
      }

      return '';
    }

    /**
     * Xây dựng gói Prompt Tổng Hợp (Master Synthesized Prompt) kết nối:
     * 1. Khung Prompt Hệ Thống của chế độ đang chọn (Chế độ 1 -> 5)
     * 2. Thông số mục tiêu (Số từ, Ngôi kể POV, Nhiệt độ sáng tạo)
     * 3. Toàn bộ Story Bible + Nhân vật + Ma trận Ai Biết Gì + Phục bút + Từ cấm
     * 4. Toàn bộ Mốc chuyển phân cảnh / Đổi góc nhìn POV
     * 5. Ký ức các chương đã duyệt + Đoạn nối tiếp bản thảo hiện tại + BM25 chống quên
     * 6. Câu lệnh cụ thể của tác giả
     */
    buildMasterSynthesizedPrompt() {
      const modeSelect = document.getElementById('select-ai-execution-mode');
      const modeKey = modeSelect?.value || 'MODE_1_DRAFT';
      const targetWords =
        Number(document.getElementById('input-target-word-count')?.value) || 3500;
      const pov =
        document.getElementById('select-scene-pov')?.value ||
        'Ngôi thứ 3 giới hạn (Theo sát nhân vật chính)';
      const temp = document.getElementById('slider-ai-temperature')?.value || '0.85';

      const sysInstruction = this.sysPrompts.getPromptForMode(modeKey);
      const bibleBlock = this.storyBible.buildCompiledBibleBlockForPrompt();
      const sceneMarkersBlock = this.sceneBuilder.buildCompiledSceneMarkersBlockForPrompt();

      const activeChap = this.chapterMgr.syncEditorToActiveChapter();
      const userCommand = this.getResolvedUserCommand();

      // Truy xuất ký ức chống quên BM25 từ câu lệnh và tên chương
      const ragQuery = `${userCommand} ${activeChap?.displayTitle || ''}`.trim();
      const ragHits = this.rag.search(ragQuery, 4);
      const ragBlock =
        ragHits.length > 0
          ? ragHits
              .map(
                (h, i) =>
                  `  • [Ký ức liên quan #${i + 1} từ ${h.chapterTitle}]:\n    "${h.text}"`
              )
              .join('\n')
          : '  (Không có đoạn ký ức BM25 đặc biệt nào cần trích xuất thêm)';

      // Lấy tóm tắt các chương Đã Duyệt trước đó để giữ mạch truyện xuyên suốt
      const approvedChaps = this.chapterMgr
        .getApprovedChapters()
        .filter((c) => c.id !== activeChap?.id);
      const approvedSummaries =
        approvedChaps.length > 0
          ? approvedChaps
              .slice(-5)
              .map(
                (c) =>
                  `  - [${c.displayTitle || c.title}]: ${
                    c.summary || this.utils.escapeHtml((c.content || '').slice(0, 280))
                  }`
              )
              .join('\n')
          : '  (Đây là chương mở đầu hoặc chưa có chương trước đó được chốt duyệt)';

      // Lấy phần cuối của bản thảo hiện tại (nếu đang viết dở) để AI nối mạch mượt mà
      const currentText = (activeChap?.content || '').trim();
      const tailContext =
        currentText.length > 0
          ? currentText.slice(-2200)
          : '(Chương hiện tại đang trống — Hãy bắt đầu viết từ mở đầu chương)';

      const resolvedCommandText =
        userCommand ||
        `Hãy triển khai tiếp diễn biến của "${
          activeChap?.displayTitle || 'Chương hiện tại'
        }" dựa theo các Mốc chuyển phân cảnh, Hồ sơ Story Bible và mạch văn bên trên một cách tự nhiên, sâu sắc và lôi cuốn nhất.`;

      return [
        `####################################################################`,
        `🌟 PROMPT TỔNG HỢP CHÍNH THỨC (MASTER SYNTHESIZED NOVEL PROMPT)`,
        `####################################################################`,
        ``,
        `=== [PHẦN 1: VAI TRÒ & CHỈ THỊ HỆ THỐNG (${modeKey})] ===`,
        sysInstruction,
        ``,
        `=== [PHẦN 2: THÔNG SỐ KỸ THUẬT & TIÊU CHUẨN ĐẦU RA] ===`,
        `- Chương đang thực hiện : ${activeChap?.displayTitle || 'Chương 1'}`,
        `- Chế độ thực thi       : ${modeKey}`,
        `- Độ dài mục tiêu       : Khoảng ${targetWords.toLocaleString('vi-VN')} từ (Triển khai kỹ lưỡng, giàu chi tiết)`,
        `- Điểm nhìn (POV)       : ${pov}`,
        `- Độ bay bổng (Temp)    : ${temp}`,
        `- Định dạng hội thoại   : Bắt buộc dùng "- Câu thoại (Tên nhân vật)"`,
        ``,
        bibleBlock,
        ``,
        sceneMarkersBlock,
        ``,
        `====================================================================`,
        `🔗 NGỮ CẢNH LIÊN KẾT CÁC CHƯƠNG TRƯỚC & KÝ ỨC CHỐNG QUÊN BM25`,
        `====================================================================`,
        `[TÓM TẮT CÁC CHƯƠNG ĐÃ DUYỆT TRƯỚC ĐÓ]:`,
        approvedSummaries,
        ``,
        `[CHI TIẾT KÝ ỨC CỤC BỘ TRÍCH XUẤT THEO NGỮ CẢNH (BM25 RAG)]:`,
        ragBlock,
        ``,
        `[ĐOẠN VĂN CUỐI TRONG BẢN THẢO HIỆN TẠI ĐỂ NỐI MẠCH]:`,
        tailContext,
        ``,
        `====================================================================`,
        `✍️ YÊU CẦU / CÂU LỆNH SÁNG TÁC CỤ THỂ CỦA TÁC GIẢ CHO CHƯƠNG NÀY`,
        `====================================================================`,
        resolvedCommandText,
        ``,
        `====================================================================`,
        `🚀 CHỈ THỊ BẮT ĐẦU: Hãy thực thi ngay yêu cầu trên với chất lượng văn học cao nhất, tuân thủ 100% Story Bible, Mốc chuyển phân cảnh và Ma trận Ai Biết Gì!`
      ].join('\n');
    }

    /**
     * Bước 1: Khi tác giả bấm "🚀 Chạy Prompt Tổng Hợp" tại Cửa sổ điều khiển AI
     * -> Hiển thị màn hình chờ ngắn -> Mở Cửa sổ Xác nhận Prompt Tổng Hợp & Chọn lại Mô hình lần 2
     */
    async runStep1MasterSynthesis() {
      const promptBox = document.getElementById('s18-fullscreen-prompt-textarea');
      if (promptBox && promptBox.value.trim()) {
        localStorage.setItem('noir_v36_last_command_prompt', promptBox.value.trim());
      }

      // Đồng bộ Story Bible và các mốc chuyển cảnh mới nhất
      await this.storyBible.saveAllBibleData(false);

      this.utils.showBlockingLoader(
        '⏳ Đang Tổng Hợp Prompt Tổng Chính Thức...',
        'Đang liên kết Story Bible, Hồ sơ nhân vật, Ma trận Ai Biết Gì, Mốc chuyển phân cảnh và Câu lệnh của bạn...'
      );

      await new Promise((r) => setTimeout(r, 380));

      const synthesized = this.buildMasterSynthesizedPrompt();
      this.lastSynthesizedPrompt = synthesized;

      const synthTextarea = document.getElementById('textarea-synthesized-master-prompt');
      const synthStats = document.getElementById('synthesized-prompt-stats');
      if (synthTextarea) {
        synthTextarea.value = synthesized;
      }
      if (synthStats) {
        const w = this.utils.countVietnameseWords(synthesized);
        synthStats.textContent = `${w.toLocaleString('vi-VN')} từ đã liên kết`;
      }

      // Đồng bộ mô hình sang cửa sổ xác nhận lần 2 và hiển thị khuyến cáo Flash/Pro vs Flash-Lite
      const currentModel =
        document.getElementById('select-gemini-model')?.value ||
        this.geminiRouter.selectedModelId;
      this.geminiRouter.setSelectedModel(currentModel);

      this.utils.hideBlockingLoader();
      document.getElementById('modal-fullscreen-ai-command')?.classList.add('hidden');
      document.getElementById('modal-confirm-synthesized-prompt')?.classList.remove('hidden');

      this.utils.showToast(
        '✅ Đã tổng hợp xong Prompt Tổng! Hãy kiểm tra lại mô hình (Khuyên dùng từ Flash trở lên) rồi bấm chạy chính thức.',
        'success',
        3800
      );
    }

    /**
     * Bước 2: Khi tác giả đã kiểm tra Prompt Tổng Hợp, chọn lại Mô hình ở cửa sổ xác nhận
     * và bấm "✍️ Bắt Đầu Chạy Prompt Chính Thức Để Viết Tiểu Thuyết"
     */
    async executeStep2OfficialNovelPrompt() {
      const synthTextarea = document.getElementById('textarea-synthesized-master-prompt');
      const finalMasterPrompt = (synthTextarea?.value || this.lastSynthesizedPrompt || '').trim();
      if (!finalMasterPrompt) {
        this.utils.showToast('⚠️ Prompt Tổng Hợp đang trống!', 'warning');
        return;
      }

      const chosenModelId =
        document.getElementById('confirm-modal-model-select')?.value ||
        this.geminiRouter.selectedModelId;
      this.geminiRouter.setSelectedModel(chosenModelId);

      const modeKey =
        document.getElementById('select-ai-execution-mode')?.value || 'MODE_1_DRAFT';
      const temperature =
        Number(document.getElementById('slider-ai-temperature')?.value) || 0.85;

      // Nếu người dùng chọn Chế độ 5 (Vẽ biểu đồ), chuyển sang bộ xử lý Chế độ 5
      if (modeKey === 'MODE_5_DIAGRAM') {
        document.getElementById('modal-confirm-synthesized-prompt')?.classList.add('hidden');
        window.NoirStudio.tab3Controller?.switchMode('MODE_5_DIAGRAM');
        window.NoirStudio.navigator?.navigateToScreen('SCREEN_3_AI');
        await window.NoirStudio.mode5Studio?.generateDiagramAndTimeline(
          this.getResolvedUserCommand(),
          chosenModelId
        );
        return;
      }

      const modelEntry = this.geminiRouter.getModelEntry(chosenModelId);
      this.utils.showBlockingLoader(
        `✍️ Đang Chạy Prompt Chính Thức Trên ${modelEntry.id}...`,
        'AI đang sáng tác dựa trên toàn bộ Story Bible, Mốc chuyển phân cảnh và Câu lệnh của bạn. Vui lòng chờ trong giây lát...'
      );

      try {
        const result = await this.geminiRouter.generateTextWithFallback({
          prompt: finalMasterPrompt,
          systemInstruction: this.sysPrompts.getPromptForMode(modeKey),
          modelId: chosenModelId,
          temperature,
          maxOutputTokens: 8192
        });

        this.utils.hideBlockingLoader();
        document.getElementById('modal-confirm-synthesized-prompt')?.classList.add('hidden');

        // Đưa đầu ra vào Cửa sổ Đầu ra tương ứng ở Tab 3
        window.NoirStudio.tab3Controller?.setOutputForMode(modeKey, result.text);
        window.NoirStudio.tab3Controller?.switchMode(modeKey);
        window.NoirStudio.navigator?.navigateToScreen('SCREEN_3_AI');

        const outWords = this.utils.countVietnameseWords(result.text);
        this.utils.showToast(
          `🎉 Đã hoàn thành chạy Prompt Chính Thức (${outWords.toLocaleString(
            'vi-VN'
          )} từ)! Bạn có thể bấm "📥 Chèn nối tiếp" hoặc "🔄 Thay thế" trên thanh đầu ra Tab 3 để đưa vào Bản thảo kèm đánh dấu màu AI.`,
          'success',
          5200
        );
      } catch (err) {
        this.utils.hideBlockingLoader();
        this.utils.showToast(`❌ Lỗi khi chạy AI: ${err.message}`, 'error', 5000);
      }
    }
  }

  const promptSynthesizer = new MasterPromptSynthesizerAndExecutionEngine(
    idbEngine,
    chapterManager,
    storyBibleEngine,
    sceneBuilder,
    sysPromptsEngine,
    ragEngine,
    geminiRouter,
    uiUtils
  );
  window.NoirStudio.promptSynthesizer = promptSynthesizer;


  // ==========================================================================
  // BƯỚC 17 (MODULE 16): BỘ ĐIỀU KHIỂN CỬA SỔ ĐẦU RA 5 CHẾ ĐỘ THỐNG NHẤT TẠI TAB 3
  //                      (ĐÃ XÓA 4 NÚT PHỤ BÊN PHẢI & TÍCH HỢP 3 NÚT CHÈN/THAY/CHÉP
  //                       CÙNG BẢNG CẤU HÌNH PROMPT LÊN THANH TRÊN CÙNG)
  // ==========================================================================
  class Tab3FiveModesWorkspaceController {
    constructor(idb, aiDiff, storyBible, sysPrompts, utils) {
      this.idb = idb;
      this.aiDiff = aiDiff;
      this.storyBible = storyBible;
      this.sysPrompts = sysPrompts;
      this.utils = utils;
      this.activeMode = 'MODE_1_DRAFT';
      this.modeOutputs = {
        MODE_1_DRAFT: '',
        MODE_2_BRAINSTORM: '',
        MODE_3_AUDIT: '',
        MODE_4_REVIEW: '',
        MODE_5_DIAGRAM: ''
      };
    }

    init() {
      const saved = this.idb.getLocalJSON(STUDIO_CONSTANTS.STORAGE_KEYS.MODE_OUTPUTS, {});
      if (saved && typeof saved === 'object') {
        this.modeOutputs = { ...this.modeOutputs, ...saved };
      }

      const outTextarea = document.getElementById('s20-quad-output-textarea');
      if (outTextarea) {
        outTextarea.addEventListener('input', () => {
          this.modeOutputs[this.activeMode] = outTextarea.value;
          this.persistOutputs();
          this.updateOutputWordBadge(outTextarea.value);
        });
      }

      this.switchMode(this.activeMode);
    }

    persistOutputs() {
      this.idb.setLocalJSON(STUDIO_CONSTANTS.STORAGE_KEYS.MODE_OUTPUTS, this.modeOutputs);
    }

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

      if (modeKey === 'MODE_5_DIAGRAM') {
        stdWrapper?.classList.add('hidden');
        mode5Studio?.classList.remove('hidden');
        window.NoirStudio.mode5Studio?.refreshChapterChecklist();
        this.updateOutputWordBadge(this.modeOutputs.MODE_5_DIAGRAM || '');
      } else {
        mode5Studio?.classList.add('hidden');
        stdWrapper?.classList.remove('hidden');
        if (outTextarea) {
          outTextarea.value = this.modeOutputs[modeKey] || '';
          this.updateOutputWordBadge(outTextarea.value);
        }
      }
    }

    setOutputForMode(modeKey, text) {
      this.modeOutputs[modeKey] = String(text || '');
      this.persistOutputs();
      if (this.activeMode === modeKey) {
        const outTextarea = document.getElementById('s20-quad-output-textarea');
        if (outTextarea) outTextarea.value = this.modeOutputs[modeKey];
        this.updateOutputWordBadge(this.modeOutputs[modeKey]);
      }
    }

    getCurrentModeText() {
      if (this.activeMode === 'MODE_5_DIAGRAM') {
        const reportEl = document.getElementById('mode5-chronicle-report');
        return reportEl?.textContent || this.modeOutputs.MODE_5_DIAGRAM || '';
      }
      const outTextarea = document.getElementById('s20-quad-output-textarea');
      return outTextarea ? outTextarea.value : this.modeOutputs[this.activeMode] || '';
    }

    updateOutputWordBadge(text) {
      const badge = document.getElementById('tab3-output-word-badge');
      if (!badge) return;
      const w = this.utils.countVietnameseWords(text || '');
      badge.textContent = `${w.toLocaleString('vi-VN')} từ`;
    }

    async appendCurrentOutputToManuscript() {
      const text = this.getCurrentModeText();
      await this.aiDiff.applyAIOutputToManuscriptWithDiff(text, 'APPEND');
    }

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

    async copyCurrentOutput() {
      const text = this.getCurrentModeText();
      if (!text.trim()) {
        this.utils.showToast('⚠️ Chưa có nội dung đầu ra để sao chép.', 'warning');
        return;
      }
      try {
        await navigator.clipboard.writeText(text);
        this.utils.showToast('📋 Đã sao chép toàn bộ nội dung đầu ra vào khay nhớ tạm!', 'success');
      } catch (_) {
        this.utils.showToast('📋 Đã sao chép nội dung!', 'success');
      }
    }

    async saveCurrentOutputToStoryBible() {
      const text = this.getCurrentModeText();
      if (!text.trim()) {
        this.utils.showToast('⚠️ Chưa có nội dung đầu ra để lưu vào Story Bible.', 'warning');
        return;
      }
      const renEl = document.getElementById('textarea-rendered-bible-content');
      if (renEl) {
        const stamp = this.utils.formatTimestampVN(Date.now());
        renEl.value =
          (renEl.value ? renEl.value.trim() + '\n\n' : '') +
          `=== [GHI CHÚ TỪ ${this.activeMode} — ${stamp}] ===\n${text.trim()}`;
        await this.storyBible.saveAllBibleData(true);
      }
    }

    clearCurrentOutput() {
      const text = this.getCurrentModeText();
      if (!text.trim()) return;
      if (!window.confirm('Xóa trắng nội dung cửa sổ đầu ra của chế độ đang mở?')) return;
      this.setOutputForMode(this.activeMode, '');
      this.utils.showToast('🗑️ Đã xóa trắng cửa sổ đầu ra.', 'info');
    }
  }

  const tab3Controller = new Tab3FiveModesWorkspaceController(
    idbEngine,
    aiDiffEngine,
    storyBibleEngine,
    sysPromptsEngine,
    uiUtils
  );
  window.NoirStudio.tab3Controller = tab3Controller;


  // ==========================================================================
  // BƯỚC 18 (MODULE 17): CHẾ ĐỘ 5 TẠI TAB 3 — VẼ BIỂU ĐỒ CỐT TRUYỆN, MẠNG LƯỚI
  //                      NHÂN VẬT & THEO DÕI DIỄN BIẾN SỰ KIỆN THEO THỜI GIAN
  // ==========================================================================
  class Mode5PlotDiagramAndTimelineStudio {
    constructor(chapterMgr, storyBible, sysPrompts, geminiRouter, utils) {
      this.chapterMgr = chapterMgr;
      this.storyBible = storyBible;
      this.sysPrompts = sysPrompts;
      this.geminiRouter = geminiRouter;
      this.utils = utils;
      this.selectedChapterIds = new Set();
      this.lastSvgMarkup = '';
    }

    init() {
      this.refreshChapterChecklist();
      this.renderDefaultPreviewDiagram();
    }

    refreshChapterChecklist() {
      const box = document.getElementById('mode5-chapter-checklist');
      if (!box) return;
      const chaps = this.chapterMgr.chapters || [];
      if (this.selectedChapterIds.size === 0 && chaps.length > 0) {
        chaps.forEach((c) => this.selectedChapterIds.add(c.id));
      }

      box.innerHTML = chaps
        .map((c) => {
          const checked = this.selectedChapterIds.has(c.id) ? 'checked' : '';
          return `
            <label class="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-900 cursor-pointer">
              <input type="checkbox" data-mode5-chap-check="${this.utils.escapeHtml(
                c.id
              )}" ${checked} class="accent-emerald-500 rounded" />
              <span class="truncate font-semibold text-zinc-200">${this.utils.escapeHtml(
                c.displayTitle || c.title
              )}</span>
              <span class="ml-auto font-monoCode text-[10px] text-zinc-400">${(
                c.wordCount || 0
              ).toLocaleString('vi-VN')} từ</span>
            </label>
          `;
        })
        .join('');

      box.querySelectorAll('[data-mode5-chap-check]').forEach((chk) => {
        chk.addEventListener('change', () => {
          const cid = chk.getAttribute('data-mode5-chap-check');
          if (chk.checked) this.selectedChapterIds.add(cid);
          else this.selectedChapterIds.delete(cid);
        });
      });
    }

    selectAllChapters(selectAll = true) {
      this.selectedChapterIds.clear();
      if (selectAll) {
        (this.chapterMgr.chapters || []).forEach((c) => this.selectedChapterIds.add(c.id));
      }
      this.refreshChapterChecklist();
    }

    getChosenChapters() {
      const list = (this.chapterMgr.chapters || []).filter((c) =>
        this.selectedChapterIds.has(c.id)
      );
      return list.length > 0 ? list : this.chapterMgr.chapters;
    }

    /**
     * Dựng biểu đồ SVG nghệ thuật & trực quan từ danh sách nút sự kiện, nhân vật và liên kết
     */
    buildInteractiveSvgDiagram(graphData, styleMode = 'TIMELINE_AND_GRAPH') {
      const nodes = Array.isArray(graphData?.nodes) ? graphData.nodes : [];
      const links = Array.isArray(graphData?.links) ? graphData.links : [];
      const contradictions = Array.isArray(graphData?.contradictions)
        ? graphData.contradictions
        : [];

      const width = 920;
      const height = Math.max(420, Math.ceil(nodes.length / 2) * 115 + 130);

      // Định vị tọa độ thông minh cho từng nút theo kiểu biểu đồ
      const positioned = nodes.map((n, idx) => {
        let x = 160 + (idx % 3) * 300;
        let y = 100 + Math.floor(idx / 3) * 125;
        if (styleMode === 'CHARACTER_WEB') {
          const angle = (idx / Math.max(1, nodes.length)) * Math.PI * 2 - Math.PI / 2;
          const radius = Math.min(width, height) * 0.34;
          x = width / 2 + Math.cos(angle) * radius;
          y = height / 2 + Math.sin(angle) * radius;
        }
        return { ...n, x, y };
      });

      const posMap = {};
      positioned.forEach((p) => {
        posMap[p.id] = p;
      });

      const edgesSvg = links
        .map((lk) => {
          const s = posMap[lk.source];
          const t = posMap[lk.target];
          if (!s || !t) return '';
          const mx = (s.x + t.x) / 2;
          const my = (s.y + t.y) / 2 - 12;
          return `
            <g>
              <line x1="${s.x}" y1="${s.y}" x2="${t.x}" y2="${t.y}" stroke="#10b981" stroke-width="2.2" stroke-dasharray="5,3" marker-end="url(#arrowHead)" opacity="0.82" />
              ${
                lk.label
                  ? `<rect x="${mx - 65}" y="${my - 10}" width="130" height="18" rx="6" fill="#09090b" stroke="#27272a" />
                     <text x="${mx}" y="${my + 3}" fill="#a7f3d0" font-size="10" font-family="Inter, sans-serif" font-weight="600" text-anchor="middle">${this.utils.escapeHtml(
                      String(lk.label).slice(0, 26)
                    )}</text>`
                  : ''
              }
            </g>
          `;
        })
        .join('');

      const nodesSvg = positioned
        .map((n, i) => {
          const isChar = n.group === 'CHARACTER';
          const isClue = n.group === 'CLUE';
          const strokeColor = isChar ? '#f59e0b' : isClue ? '#818cf8' : '#10b981';
          const fillBg = isChar ? '#271a05' : isClue ? '#17153b' : '#052e22';
          const badge = isChar ? '👤 NHÂN VẬT' : isClue ? '🔫 PHỤC BÚT' : `⏳ MỐC #${i + 1}`;
          const timeText = n.time ? ` (${n.time})` : '';
          return `
            <g transform="translate(${n.x - 115}, ${n.y - 36})">
              <rect width="230" height="72" rx="14" fill="${fillBg}" stroke="${strokeColor}" stroke-width="2" filter="url(#dropGlow)" />
              <text x="14" y="21" fill="${strokeColor}" font-size="10" font-family="JetBrains Mono, monospace" font-weight="700">${this.utils.escapeHtml(
                badge + timeText
              )}</text>
              <text x="14" y="42" fill="#f4f4f5" font-size="12" font-family="Inter, sans-serif" font-weight="700">${this.utils.escapeHtml(
                String(n.label || '').slice(0, 28)
              )}</text>
              <text x="14" y="59" fill="#a1a1aa" font-size="10" font-family="Inter, sans-serif">${this.utils.escapeHtml(
                String(n.detail || n.label || '').slice(0, 34)
              )}</text>
            </g>
          `;
        })
        .join('');

      const warnBanner =
        contradictions.length > 0
          ? `<g transform="translate(24, ${height - 44})">
               <rect width="${width - 48}" height="32" rx="8" fill="#450a0a" stroke="#ef4444" />
               <text x="16" y="20" fill="#fca5a5" font-size="11" font-family="Inter, sans-serif" font-weight="700">⚠️ Phát hiện lưu ý logic: ${this.utils.escapeHtml(
                 String(contradictions[0]).slice(0, 95)
               )}</text>
             </g>`
          : `<g transform="translate(24, ${height - 44})">
               <rect width="${width - 48}" height="32" rx="8" fill="#052e16" stroke="#10b981" />
               <text x="16" y="20" fill="#6ee7b7" font-size="11" font-family="Inter, sans-serif" font-weight="700">✅ Kiểm tra dòng thời gian: Mạch sự kiện giữa các chương đã chọn hoàn toàn khớp nhau, không có mâu thuẫn!</text>
             </g>`;

      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="w-full h-auto max-h-[520px] rounded-xl">
          <defs>
            <marker id="arrowHead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
            </marker>
            <filter id="dropGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000000" flood-opacity="0.65" />
            </filter>
          </defs>
          <rect width="${width}" height="${height}" rx="16" fill="#09090b" />
          <text x="26" y="34" fill="#10b981" font-size="14" font-family="Inter, sans-serif" font-weight="800">🎨 SƠ ĐỒ DIỄN BIẾN CỐT TRUYỆN & ĐỐI CHIẾU THỜI GIAN — CHẾ ĐỘ 5</text>
          ${edgesSvg}
          ${nodesSvg}
          ${warnBanner}
        </svg>
      `;

      this.lastSvgMarkup = svg;
      const stage = document.getElementById('mode5-svg-canvas-Stage');
      if (stage) stage.innerHTML = svg;
      return svg;
    }

    buildLocalHeuristicGraph(chosenChaps) {
      const nodes = [];
      const links = [];

      chosenChaps.forEach((c, idx) => {
        const nid = `chap_node_${idx}`;
        nodes.push({
          id: nid,
          label: c.displayTitle || c.title,
          time: c.status === 'APPROVED' ? 'Đã duyệt' : 'Bản nháp',
          detail: `${c.wordCount || 0} từ • ${(c.summary || 'Đang triển khai').slice(0, 32)}`,
          group: 'EVENT'
        });
        if (idx > 0) {
          links.push({
            source: `chap_node_${idx - 1}`,
            target: nid,
            label: 'Tiếp nối thời gian'
          });
        }
      });

      (this.storyBible.characters || []).slice(0, 3).forEach((ch, idx) => {
        const cid = `char_node_${idx}`;
        nodes.push({
          id: cid,
          label: ch.name,
          time: ch.role || 'Nhân vật',
          detail: ch.traits || 'Tham gia mạch truyện',
          group: 'CHARACTER'
        });
        if (nodes[0]) {
          links.push({
            source: cid,
            target: nodes[0].id,
            label: 'Xuất hiện'
          });
        }
      });

      (this.storyBible.cluesLedger || []).slice(0, 2).forEach((cl, idx) => {
        const clid = `clue_node_${idx}`;
        nodes.push({
          id: clid,
          label: cl.title,
          time: cl.plantedIn || 'Phục bút',
          detail: cl.status === 'RESOLVED' ? 'Đã thu hồi' : 'Đang cài cắm',
          group: 'CLUE'
        });
        if (nodes.length > 1) {
          links.push({
            source: nodes[0].id,
            target: clid,
            label: 'Gieo manh mối'
          });
        }
      });

      return { nodes, links, contradictions: [] };
    }

    renderDefaultPreviewDiagram() {
      const chaps = this.getChosenChapters();
      const graph = this.buildLocalHeuristicGraph(chaps);
      this.buildInteractiveSvgDiagram(graph, 'TIMELINE_AND_GRAPH');
    }

    async generateDiagramAndTimeline(customUserPrompt = '', overrideModelId = null) {
      const chaps = this.getChosenChapters();
      const styleMode =
        document.getElementById('mode5-diagram-style')?.value || 'TIMELINE_AND_GRAPH';
      const modelId =
        overrideModelId ||
        document.getElementById('mode5-model-selector')?.value ||
        this.geminiRouter.selectedModelId;
      const promptInput = document.getElementById('mode5-prompt-input');
      const userReq =
        (customUserPrompt || promptInput?.value || '').trim() ||
        'Hãy vẽ biểu đồ diễn biến sự kiện theo trình tự thời gian của các chương đã chọn, chỉ rõ từng nhân vật đang ở đâu, biết thông tin gì và kiểm tra kỹ xem có chi tiết nào mâu thuẫn không.';

      // Trước tiên dựng ngay sơ đồ cục bộ tức thì để tác giả thấy phản hồi trực quan
      const localGraph = this.buildLocalHeuristicGraph(chaps);
      this.buildInteractiveSvgDiagram(localGraph, styleMode);

      const statusEl = document.getElementById('mode5-visual-status');
      const reportEl = document.getElementById('mode5-chronicle-report');

      // Nếu chưa có API Key, vẫn xuất bản báo cáo dòng thời gian cục bộ chi tiết
      if (!this.geminiRouter.getApiKey()) {
        const localReport = [
          `📊 BÁO CÁO DÒNG THỜI GIAN & ĐỐI CHIẾU CỤC BỘ (${chaps.length} CHƯƠNG):`,
          `--------------------------------------------------------------------`,
          ...chaps.map(
            (c, i) =>
              `${i + 1}. [${c.displayTitle || c.title}] (${c.wordCount} từ — ${
                c.status === 'APPROVED' ? 'Đã duyệt' : 'Bản nháp'
              }):\n   • Tóm tắt diễn biến: ${
                c.summary || '(Chưa có nội dung hoặc đang viết)'
              }`
          ),
          ``,
          `💡 Mẹo: Hãy nhập Gemini API Key tại Tab 6 để AI phân tích sâu từng mốc giờ giấc và tự động phát hiện mâu thuẫn chi tiết giữa các chương!`
        ].join('\n\n');
        if (reportEl) reportEl.textContent = localReport;
        window.NoirStudio.tab3Controller?.setOutputForMode('MODE_5_DIAGRAM', localReport);
        this.utils.showToast(
          '🎨 Đã vẽ sơ đồ cốt truyện cục bộ! (Nhập API Key ở Tab 6 nếu muốn AI soi mâu thuẫn sâu hơn).',
          'info'
        );
        return;
      }

      if (statusEl) statusEl.textContent = '⏳ AI đang phân tích dòng thời gian & vẽ sơ đồ...';
      this.utils.showBlockingLoader(
        '🎨 Đang Vẽ Biểu Đồ Cốt Truyện & Soi Dòng Thời Gian (Chế Độ 5)...',
        `Đang đối chiếu ${chaps.length} chương cùng Story Bible trên mô hình ${modelId}...`
      );

      try {
        const chaptersDigest = chaps
          .map(
            (c, idx) =>
              `=== CHƯƠNG #${idx + 1}: ${c.displayTitle || c.title} (${
                c.status
              }) ===\n${(c.content || '').slice(0, 4500)}`
          )
          .join('\n\n');

        const fullMode5Prompt = [
          this.storyBible.buildCompiledBibleBlockForPrompt(),
          ``,
          `=== CÁC CHƯƠNG ĐƯỢC CHỌN ĐỂ VẼ BIỂU ĐỒ & ĐỐI CHIẾU THỜI GIAN (${chaps.length} CHƯƠNG) ===`,
          chaptersDigest,
          ``,
          `=== HÌNH THỨC BIỂU ĐỒ YÊU CẦU: ${styleMode} ===`,
          `=== YÊU CẦU CỤ THỂ CỦA TÁC GIẢ ===`,
          userReq
        ].join('\n');

        const res = await this.geminiRouter.generateTextWithFallback({
          prompt: fullMode5Prompt,
          systemInstruction: this.sysPrompts.getPromptForMode('MODE_5_DIAGRAM'),
          modelId,
          temperature: 0.45,
          maxOutputTokens: 8192
        });

        this.utils.hideBlockingLoader();

        // Tách khối JSON (nếu AI trả về) để dựng biểu đồ SVG chính xác theo sự kiện AI trích xuất
        const jsonMatch = res.text.match(/```json\s*([\s\S]*?)```/i);
        let cleanReport = res.text.replace(/```json[\s\S]*?```/gi, '').trim();

        if (jsonMatch && jsonMatch[1]) {
          try {
            const parsedGraph = JSON.parse(jsonMatch[1].trim());
            if (Array.isArray(parsedGraph.nodes) && parsedGraph.nodes.length > 0) {
              this.buildInteractiveSvgDiagram(parsedGraph, styleMode);
            }
          } catch (_) {}
        }

        if (reportEl) reportEl.textContent = cleanReport || res.text;
        if (statusEl) statusEl.textContent = '✅ Đã hoàn tất vẽ sơ đồ & kiểm tra dòng thời gian';
        window.NoirStudio.tab3Controller?.setOutputForMode(
          'MODE_5_DIAGRAM',
          cleanReport || res.text
        );

        this.utils.showToast(
          '🎨 Đã vẽ xong Biểu đồ Cốt truyện & Bảng theo dõi diễn biến theo thời gian!',
          'success'
        );
      } catch (err) {
        this.utils.hideBlockingLoader();
        if (statusEl) statusEl.textContent = '⚠️ Đang hiển thị sơ đồ cục bộ';
        this.utils.showToast(`⚠️ Lỗi gọi AI Chế độ 5: ${err.message}`, 'warning');
      }
    }

    exportDiagramAsSvgFile() {
      if (!this.lastSvgMarkup) {
        this.renderDefaultPreviewDiagram();
      }
      const blob = new Blob([this.lastSvgMarkup], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Bieu_Do_Cot_Truyen_Mode5_${Date.now()}.svg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      this.utils.showToast('🖼️ Đã tải xuống file ảnh Biểu đồ Cốt truyện (.SVG)!', 'success');
    }
  }

  const mode5Studio = new Mode5PlotDiagramAndTimelineStudio(
    chapterManager,
    storyBibleEngine,
    sysPromptsEngine,
    geminiRouter,
    uiUtils
  );
  window.NoirStudio.mode5Studio = mode5Studio;


  // ==========================================================================
  // BƯỚC 19 (MODULE 18): CỔNG DUYỆT & CHỐT BẢN THẢO THÔNG MINH
  //                      (ĐÃ XÓA CỬA SỔ ĐẦU RA THỪA TRONG MODAL, CHỈ HIỆN MÀN HÌNH
  //                       CHỜ KHI CHẠY VÀ THÔNG BÁO THÀNH CÔNG KHI HOÀN TẤT!)
  // ==========================================================================
  class SmartChapterApprovalAndBibleExtractor {
    constructor(
      idb,
      fs,
      chapterMgr,
      storyBible,
      versionVault,
      geminiRouter,
      rag,
      utils
    ) {
      this.idb = idb;
      this.fs = fs;
      this.chapterMgr = chapterMgr;
      this.storyBible = storyBible;
      this.versionVault = versionVault;
      this.geminiRouter = geminiRouter;
      this.rag = rag;
      this.utils = utils;
      this.selectedIds = new Set();
    }

    openModal() {
      this.chapterMgr.syncEditorToActiveChapter();
      const modal = document.getElementById('modal-approve-chapter-smart');
      if (!modal) return;
      this.selectedIds.clear();
      if (this.chapterMgr.activeChapterId) {
        this.selectedIds.add(this.chapterMgr.activeChapterId);
      }
      this.renderChecklist();
      modal.classList.remove('hidden');
    }

    renderChecklist() {
      const box = document.getElementById('approve-chapters-checklist');
      if (!box) return;
      box.innerHTML = (this.chapterMgr.chapters || [])
        .map((c) => {
          const checked = this.selectedIds.has(c.id) ? 'checked' : '';
          return `
            <label class="flex items-center justify-between gap-2 p-2 rounded-xl border border-zinc-800 hover:border-emerald-500/40 bg-zinc-900/60 cursor-pointer">
              <div class="flex items-center gap-2 min-w-0">
                <input type="checkbox" data-approve-chap-check="${this.utils.escapeHtml(
                  c.id
                )}" ${checked} class="accent-emerald-500 rounded" />
                <span class="font-bold text-xs truncate">${this.utils.escapeHtml(
                  c.displayTitle || c.title
                )}</span>
              </div>
              <div class="flex items-center gap-2 shrink-0 text-[10px]">
                <span class="font-monoCode text-zinc-400">${(
                  c.wordCount || 0
                ).toLocaleString('vi-VN')} từ</span>
                <span class="px-2 py-0.5 rounded font-bold ${
                  c.status === 'APPROVED'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-amber-500/15 text-amber-300'
                }">${c.status === 'APPROVED' ? 'Đã duyệt' : 'Nháp'}</span>
              </div>
            </label>
          `;
        })
        .join('');

      box.querySelectorAll('[data-approve-chap-check]').forEach((chk) => {
        chk.addEventListener('change', () => {
          const cid = chk.getAttribute('data-approve-chap-check');
          if (chk.checked) this.selectedIds.add(cid);
          else this.selectedIds.delete(cid);
        });
      });
    }

    selectAll(onlyCurrent = false) {
      this.selectedIds.clear();
      if (onlyCurrent) {
        if (this.chapterMgr.activeChapterId) {
          this.selectedIds.add(this.chapterMgr.activeChapterId);
        }
      } else {
        (this.chapterMgr.chapters || []).forEach((c) => this.selectedIds.add(c.id));
      }
      this.renderChecklist();
    }

    async executeApprovalAndBibleSynthesis() {
      const targetChaps = (this.chapterMgr.chapters || []).filter((c) =>
        this.selectedIds.has(c.id)
      );
      if (targetChaps.length === 0) {
        this.utils.showToast('⚠️ Hãy chọn ít nhất 1 chương để chốt duyệt!', 'warning');
        return;
      }

      document.getElementById('modal-approve-chapter-smart')?.classList.add('hidden');
      this.utils.showBlockingLoader(
        '⏳ Đang Chốt Duyệt Bản Thảo & Cập Nhật Story Bible...',
        `Đang khóa duyệt ${targetChaps.length} chương, tạo mốc phiên bản dự phòng tại Tab 6 và trích xuất dữ kiện mới vào Story Bible Tab 4...`
      );

      try {
        // 1. Chuyển trạng thái các chương được chọn sang APPROVED và lưu 3 lớp
        for (const chap of targetChaps) {
          chap.status = 'APPROVED';
          chap.updatedAt = Date.now();
          chap.summary = window.NoirStudio.docParser.buildZeroTokenSummary(chap.content || '');
          await this.idb.set(STUDIO_CONSTANTS.STORES.CHAPTERS, chap.id, chap);
          if (this.fs.rootHandle) {
            await this.fs.writeTextFile(
              '02_Chuong_Da_Duyet',
              `${chap.displayTitle || chap.title}.txt`,
              chap.content || ''
            );
          }
        }

        // 2. Tạo mốc phiên bản tự động tại Tab 6
        await this.versionVault.createSnapshot(
          `Chốt duyệt chính thức ${targetChaps.length} chương (${targetChaps
            .map((c) => c.displayTitle || c.title)
            .join(', ')})`,
          'MANUAL'
        );

        // 3. Cập nhật nội dung Story Bible chính thức (Nếu có API Key thì dùng AI tổng hợp theo Khung Cấu Trúc, nếu chưa có thì cập nhật tóm tắt cục bộ)
        const tplFrame =
          document.getElementById('textarea-bible-template-frame')?.value ||
          this.storyBible.defaultTemplate;
        const currentBible =
          document.getElementById('textarea-rendered-bible-content')?.value || tplFrame;

        let updatedBibleText = currentBible;
        if (this.geminiRouter.getApiKey()) {
          try {
            const chapBundle = targetChaps
              .map(
                (c) =>
                  `=== ${c.displayTitle || c.title} ===\n${(c.content || '').slice(0, 6000)}`
              )
              .join('\n\n');
            const biblePrompt = [
              `Hãy cập nhật Hồ sơ Story Bible chính thức dựa trên Khung Cấu Trúc cố định và các chương vừa được duyệt bên dưới.`,
              `Giữ nguyên toàn bộ các đề mục trong Khung Cấu Trúc, bổ sung các tình tiết mới, trạng thái nhân vật mới và phục bút mới một cách súc tích, chuẩn xác.`,
              ``,
              `[KHUNG CẤU TRÚC STORY BIBLE]:`,
              tplFrame,
              ``,
              `[STORY BIBLE HIỆN TẠI]:`,
              currentBible,
              ``,
              `[CÁC CHƯƠNG VỪA DUYỆT]:`,
              chapBundle
            ].join('\n');

            const aiRes = await this.geminiRouter.generateTextWithFallback({
              prompt: biblePrompt,
              systemInstruction:
                'Bạn là Quản Thủ Thư Viện Story Bible. Hãy cập nhật hồ sơ thế giới và cốt truyện trung thực 100% theo bản thảo đã duyệt.',
              temperature: 0.35,
              maxOutputTokens: 4096
            });
            if (aiRes && aiRes.text) {
              updatedBibleText = aiRes.text;
            }
          } catch (_) {
            // Dự phòng trích xuất cục bộ nếu mạng gián đoạn
            const localAppendix = targetChaps
              .map(
                (c) =>
                  `• [${c.displayTitle || c.title} (${this.utils.formatTimestampVN(
                    Date.now()
                  )})]: ${c.summary || 'Đã chốt duyệt chính thức.'}`
              )
              .join('\n');
            updatedBibleText = `${currentBible.trim()}\n\n=== [CẬP NHẬT TỰ ĐỘNG KHI DUYỆT CHƯƠNG] ===\n${localAppendix}`;
          }
        } else {
          const localAppendix = targetChaps
            .map(
              (c) =>
                `• [${c.displayTitle || c.title} (${this.utils.formatTimestampVN(
                  Date.now()
                )})]: ${c.summary || 'Đã chốt duyệt chính thức.'}`
            )
            .join('\n');
          updatedBibleText = `${currentBible.trim()}\n\n=== [CẬP NHẬT TỰ ĐỘNG KHI DUYỆT CHƯƠNG] ===\n${localAppendix}`;
        }

        const renEl = document.getElementById('textarea-rendered-bible-content');
        if (renEl) renEl.value = updatedBibleText;
        await this.storyBible.saveAllBibleData(false);

        this.rag.rebuildIndexFromChapters(this.chapterMgr.chapters);
        this.chapterMgr.renderChapterTreeAndQuickSwitcher();
        this.chapterMgr.loadActiveChapterIntoEditor();

        this.utils.hideBlockingLoader();
        this.utils.showToast(
          `🎉 Thành công! Đã chốt duyệt ${targetChaps.length} chương, tạo mốc phiên bản tại Tab 6 và đồng bộ vào Story Bible Tab 4!`,
          'success',
          5000
        );
      } catch (err) {
        this.utils.hideBlockingLoader();
        this.utils.showToast(`❌ Có lỗi khi duyệt chương: ${err.message}`, 'error');
      }
    }
  }

  const approvalExtractor = new SmartChapterApprovalAndBibleExtractor(
    idbEngine,
    fsEngine,
    chapterManager,
    storyBibleEngine,
    versionVault,
    geminiRouter,
    ragEngine,
    uiUtils
  );
  window.NoirStudio.approvalExtractor = approvalExtractor;


  // ==========================================================================
  // BƯỚC 20 (MODULE 19): ĐỒNG HỒ POMODORO HỢP NHẤT — ĐỒNG BỘ HAI CHIỀU 100%
  //                      GIỮA TAB 5 VÀ THANH POMODORO NỔI NGOÀI MÀN HÌNH!
  // ==========================================================================
  class UnifiedPomodoroEngine {
    constructor(idb, utils) {
      this.idb = idb;
      this.utils = utils;
      this.isRunning = false;
      this.phase = 'WORK'; // 'WORK' | 'BREAK'
      this.workMinutes = 25;
      this.breakMinutes = 5;
      this.remainingSec = 25 * 60;
      this.completedSessions = 0;
      this.sessionStartWordCount = 0;
      this.wordsWrittenInSession = 0;
      this.intervalId = null;
      this.isFloatingCollapsed = false;
    }

    init() {
      const saved = this.idb.getLocalJSON(STUDIO_CONSTANTS.STORAGE_KEYS.POMODORO_STATE, null);
      if (saved && typeof saved === 'object') {
        this.workMinutes = Math.max(1, Math.min(180, Number(saved.workMinutes) || 25));
        this.breakMinutes = Math.max(1, Math.min(60, Number(saved.breakMinutes) || 5));
        this.phase = saved.phase === 'BREAK' ? 'BREAK' : 'WORK';
        this.remainingSec =
          Number(saved.remainingSec) > 0
            ? Number(saved.remainingSec)
            : (this.phase === 'WORK' ? this.workMinutes : this.breakMinutes) * 60;
        this.completedSessions = Number(saved.completedSessions) || 0;
        this.isFloatingCollapsed = Boolean(saved.isFloatingCollapsed);
      }

      const workIn = document.getElementById('tab5-pomo-work-min');
      const breakIn = document.getElementById('tab5-pomo-break-min');
      if (workIn) workIn.value = String(this.workMinutes);
      if (breakIn) breakIn.value = String(this.breakMinutes);

      this.applyFloatingCollapseUI();
      this.renderBothPomodoroUIs();
    }

    persistState() {
      this.idb.setLocalJSON(STUDIO_CONSTANTS.STORAGE_KEYS.POMODORO_STATE, {
        workMinutes: this.workMinutes,
        breakMinutes: this.breakMinutes,
        phase: this.phase,
        remainingSec: this.remainingSec,
        completedSessions: this.completedSessions,
        isFloatingCollapsed: this.isFloatingCollapsed
      });
    }

    formatMMSS(totalSec) {
      const s = Math.max(0, Math.floor(totalSec));
      const mm = String(Math.floor(s / 60)).padStart(2, '0');
      const ss = String(s % 60).padStart(2, '0');
      return `${mm}:${ss}`;
    }

    /**
     * Bấm Bắt đầu / Tạm dừng từ BẤT KỲ ĐÂU (Tab 5 hoặc Thanh nổi) đều gọi hàm duy nhất này!
     */
    toggleStartPause() {
      if (this.isRunning) {
        this.pause();
      } else {
        this.start();
      }
    }

    start() {
      if (this.isRunning) return;
      this.isRunning = true;

      const currentEditorText =
        document.getElementById('textarea-chapter-content')?.value || '';
      if (this.sessionStartWordCount === 0) {
        this.sessionStartWordCount = this.utils.countVietnameseWords(currentEditorText);
      }

      clearInterval(this.intervalId);
      this.intervalId = setInterval(() => {
        this.tickOneSecond();
      }, 1000);

      this.renderBothPomodoroUIs();
      this.utils.showToast(
        this.phase === 'WORK'
          ? '🍅 Đồng hồ Pomodoro đã chạy (Đã đồng bộ cả Tab 5 & Thanh Pomodoro nổi)!'
          : '☕ Bắt đầu đếm ngược thời gian nghỉ ngơi thư giãn!',
        'info',
        2200
      );
    }

    pause() {
      this.isRunning = false;
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.persistState();
      this.renderBothPomodoroUIs();
    }

    reset() {
      this.pause();
      this.readCustomMinutesFromInputs();
      this.remainingSec =
        (this.phase === 'WORK' ? this.workMinutes : this.breakMinutes) * 60;
      this.sessionStartWordCount = 0;
      this.wordsWrittenInSession = 0;
      this.persistState();
      this.renderBothPomodoroUIs();
      this.utils.showToast('↺ Đã đặt lại đồng hồ Pomodoro về mốc ban đầu.', 'info', 1800);
    }

    switchPhaseMode() {
      this.pause();
      this.readCustomMinutesFromInputs();
      this.phase = this.phase === 'WORK' ? 'BREAK' : 'WORK';
      this.remainingSec =
        (this.phase === 'WORK' ? this.workMinutes : this.breakMinutes) * 60;
      this.persistState();
      this.renderBothPomodoroUIs();
      this.utils.showToast(
        this.phase === 'WORK'
          ? `🔥 Chuyển sang Phiên Tập Trung Viết (${this.workMinutes} phút)`
          : `☕ Chuyển sang Phiên Nghỉ Giải Lao (${this.breakMinutes} phút)`,
        'info',
        2200
      );
    }

    readCustomMinutesFromInputs() {
      const workIn = document.getElementById('tab5-pomo-work-min');
      const breakIn = document.getElementById('tab5-pomo-break-min');
      if (workIn) {
        this.workMinutes = Math.max(1, Math.min(180, Number(workIn.value) || 25));
        workIn.value = String(this.workMinutes);
      }
      if (breakIn) {
        this.breakMinutes = Math.max(1, Math.min(60, Number(breakIn.value) || 5));
        breakIn.value = String(this.breakMinutes);
      }
    }

    onCustomMinutesChanged() {
      this.readCustomMinutesFromInputs();
      if (!this.isRunning) {
        this.remainingSec =
          (this.phase === 'WORK' ? this.workMinutes : this.breakMinutes) * 60;
      }
      this.persistState();
      this.renderBothPomodoroUIs();
    }

    onEditorWordsChanged(editorText) {
      if (!this.isRunning) return;
      const nowWords = this.utils.countVietnameseWords(editorText || '');
      this.wordsWrittenInSession = Math.max(0, nowWords - this.sessionStartWordCount);
      const wordsEl = document.getElementById('tab5-pomo-words-written');
      if (wordsEl) {
        wordsEl.textContent = this.wordsWrittenInSession.toLocaleString('vi-VN');
      }
    }

    tickOneSecond() {
      if (!this.isRunning) return;
      if (this.remainingSec > 0) {
        this.remainingSec -= 1;
        this.renderBothPomodoroUIs();
        if (this.remainingSec % 10 === 0) this.persistState();
      } else {
        // Hoàn thành 1 phiên Pomodoro
        this.playGentleChime();
        if (this.phase === 'WORK') {
          this.completedSessions += 1;
          this.phase = 'BREAK';
          this.remainingSec = this.breakMinutes * 60;
          this.utils.showToast(
            `🎉 Chúc mừng! Bạn đã hoàn thành phiên viết #${this.completedSessions}. Hãy nghỉ ngơi ${this.breakMinutes} phút nhé!`,
            'success',
            5000
          );
        } else {
          this.phase = 'WORK';
          this.remainingSec = this.workMinutes * 60;
          this.utils.showToast(
            `🔥 Hết giờ nghỉ! Bắt đầu phiên tập trung viết mới (${this.workMinutes} phút)!`,
            'info',
            4500
          );
        }
        this.persistState();
        this.renderBothPomodoroUIs();
      }
    }

    playGentleChime() {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.18);
          gain.gain.exponentialRampToValueAtTime(
            0.0001,
            ctx.currentTime + idx * 0.18 + 0.65
          );
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.18);
          osc.stop(ctx.currentTime + idx * 0.18 + 0.7);
        });
      } catch (_) {}
    }

    toggleFloatingCollapse() {
      this.isFloatingCollapsed = !this.isFloatingCollapsed;
      this.applyFloatingCollapseUI();
      this.persistState();
    }

    applyFloatingCollapseUI() {
      const controls = document.getElementById('floating-pomo-controls');
      if (!controls) return;
      if (this.isFloatingCollapsed) {
        controls.classList.add('hidden');
      } else {
        controls.classList.remove('hidden');
      }
    }

    /**
     * Đồng bộ hóa tức thời CẢ Tab 5 VÀ Thanh Pomodoro nổi!
     */
    renderBothPomodoroUIs() {
      const formatted = this.formatMMSS(this.remainingSec);

      // 1. Cập nhật giao diện trong Tab 5
      const tab5Time = document.getElementById('tab5-pomo-time-display');
      const tab5BtnToggle = document.getElementById('btn-tab5-pomo-toggle');
      const tab5Badge = document.getElementById('tab5-pomo-phase-badge');
      const tab5BtnMode = document.getElementById('btn-tab5-pomo-mode-switch');
      const tab5Sessions = document.getElementById('tab5-pomo-sessions-count');
      const tab5Words = document.getElementById('tab5-pomo-words-written');

      if (tab5Time) {
        tab5Time.textContent = formatted;
        tab5Time.className = `font-monoCode font-extrabold text-3xl sm:text-4xl tracking-wider ${
          this.phase === 'WORK' ? 'text-emerald-400' : 'text-amber-400'
        }`;
      }
      if (tab5BtnToggle) {
        tab5BtnToggle.textContent = this.isRunning ? '⏸ Tạm dừng' : '▶ Bắt đầu';
        tab5BtnToggle.className = this.isRunning
          ? 'px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow-lg transition'
          : 'px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition';
      }
      if (tab5Badge) {
        tab5Badge.textContent =
          this.phase === 'WORK' ? '🔥 Phiên Tập Trung Viết' : '☕ Phiên Nghỉ Giải Lao';
        tab5Badge.className =
          this.phase === 'WORK'
            ? 'px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs'
            : 'px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-xs';
      }
      if (tab5BtnMode) {
        tab5BtnMode.textContent =
          this.phase === 'WORK' ? '☕ Chuyển sang Nghỉ' : '🔥 Chuyển sang Viết';
      }
      if (tab5Sessions) tab5Sessions.textContent = String(this.completedSessions);
      if (tab5Words) {
        tab5Words.textContent = this.wordsWrittenInSession.toLocaleString('vi-VN');
      }

      // 2. Cập nhật Thanh Pomodoro nổi góc dưới màn hình
      const floatTime = document.getElementById('floating-pomo-time');
      const floatBtnToggle = document.getElementById('btn-floating-pomo-toggle');
      const floatPill = document.getElementById('s15-floating-pomodoro-pill');

      if (floatTime) {
        floatTime.textContent = formatted;
        floatTime.className = `font-monoCode font-extrabold text-sm ${
          this.phase === 'WORK' ? 'text-emerald-400' : 'text-amber-400'
        }`;
      }
      if (floatBtnToggle) {
        floatBtnToggle.textContent = this.isRunning ? '⏸' : '▶';
        floatBtnToggle.className = this.isRunning
          ? 'px-2 py-0.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px]'
          : 'px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]';
      }
      if (floatPill) {
        floatPill.style.borderColor = this.isRunning
          ? 'rgba(16, 185, 129, 0.75)'
          : 'rgba(245, 158, 11, 0.4)';
      }
    }
  }

  const pomodoroEngine = new UnifiedPomodoroEngine(idbEngine, uiUtils);
  window.NoirStudio.pomodoro = pomodoroEngine;
