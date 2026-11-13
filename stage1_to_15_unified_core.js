/**
 * ============================================================================
 * FILE HỢP NHẤT: stage1_to_15_unified_core.js (PHẦN 1 / 3)
 * TỔNG HỢP TINH HOA TỪ STAGE 1 ĐẾN STAGE 15 - ĐỒNG BỘ 100% VỚI STAGE 16 & 17
 * ----------------------------------------------------------------------------
 * Bao gồm:
 * - Module 1: Hệ thống Nhật ký & Bắt lỗi tự động (UnifiedLogger)
 * - Module 2: Cơ sở dữ liệu IndexedDB Không Giới Hạn & Két Sắt 50.000+ Từ (UnifiedIDB)
 * - Module 3: Động cơ Ổ cứng Cục bộ File System Access API Tự Khôi Phục (UnifiedFSEngine)
 * - Module 4: Bộ Giải Mã DOCX / PDF / TXT & Đếm Từ Siêu Tốc 0ms Lag (UnifiedDocParser)
 * - Module 5: Máy Tìm Kiếm Ngữ Cảnh Cục Bộ BM25 Local RAG (UnifiedRAGEngine)
 * - Module 6: Cổng Phê Duyệt 2 Chiều (Duyệt ⇄ Hủy Duyệt Về Nháp - Fix Bug 5)
 * - Module 7: Quản Trị Story Bible Đa Điểm Nhìn & Khóa Kiểu Mẫu (Fix Bug 6 & 12 Core)
 * ============================================================================
 */

(function () {
  'use strict';

  // Ngăn chặn nạp trùng lặp nếu script được gọi nhiều lần
  if (window.__NOIR_UNIFIED_STAGE_1_15_LOADED__) return;
  window.__NOIR_UNIFIED_STAGE_1_15_LOADED__ = true;

  // Đảm bảo meta no-referrer luôn có mặt để không bị chặn luồng âm thanh TTS
  if (!document.querySelector('meta[name="referrer"]')) {
    const meta = document.createElement('meta');
    meta.name = 'referrer';
    meta.content = 'no-referrer';
    document.head.prepend(meta);
  }

  // ==========================================================================
  // MODULE 1: HỆ THỐNG NHẬT KÝ HOẠT ĐỘNG & THEO DÕI LỖI (UNIFIED LOGGER)
  // ==========================================================================
  class UnifiedStudioLogger {
    constructor() {
      this.logs = [];
      this.maxLogs = 300;
      this.listeners = [];
    }

    log(message, level = 'INFO') {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('vi-VN', { hour12: false });
      const entry = {
        id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        time: timeStr,
        timestamp: now.getTime(),
        level: String(level).toUpperCase(),
        message: String(message || '')
      };

      this.logs.unshift(entry);
      if (this.logs.length > this.maxLogs) {
        this.logs.length = this.maxLogs;
      }

      this.renderToDOM(entry);
      this. updateFooterStatus(entry.message);
      this.listeners.forEach((fn) => {
        try {
          fn(entry);
        } catch (_) {}
      });
    }

    renderToDOM(entry) {
      const logBox = document.getElementById('system-activity-log');
      if (!logBox) return;

      const line = document.createElement('div');
      let colorClass = 'text-emerald-400';
      if (entry.level === 'WARN') colorClass = 'text-amber-400';
      if (entry.level === 'ERROR') colorClass = 'text-red-400 font-bold';
      if (entry.level === 'SUCCESS') colorClass = 'text-teal-300 font-semibold';

      line.className = `${colorClass} leading-snug break-words border-b border-zinc-900 pb-0.5`;
      line.textContent = `[${entry.time}] [${entry.level}] ${entry.message}`;
      logBox.prepend(line);

      while (logBox.children.length > 150) {
        logBox.removeChild(logBox.lastChild);
      }
    }

    updateFooterStatus(msg) {
      const footerMsg = document.getElementById('footer-status-message');
      if (footerMsg) {
        footerMsg.textContent = msg;
      }
    }

    clear() {
      this.logs = [];
      const logBox = document.getElementById('system-activity-log');
      if (logBox) logBox.innerHTML = '';
      this.log('Đã xóa nhật ký hệ thống cục bộ.', 'INFO');
    }

    onLog(callback) {
      if (typeof callback === 'function') {
        this.listeners.push(callback);
      }
    }
  }

  // ==========================================================================
  // MODULE 2: CƠ SỞ DỮ LIỆU INDEXEDDB CỤC BỘ SIÊU TỐC (UNIFIED IDB ENGINE)
  // ==========================================================================
  class UnifiedIndexedDBEngine {
    constructor(dbName = 'NoirPsychStudioUnifiedDB', version = 3) {
      this.dbName = dbName;
      this.version = version;
      this.dbPromise = null;
    }

    open() {
      if (this.dbPromise) return this.dbPromise;

      this.dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(this.dbName, this.version);

        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          const stores = [
            'fs_handles',
            'state_cache',
            'snapshots_store',
            'rag_chunks_store',
            'account_vaults'
          ];
          stores.forEach((storeName) => {
            if (!db.objectStoreNames.contains(storeName)) {
              db.createObjectStore(storeName);
            }
          });
        };

        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = (e) => reject(e.target.error);
      });

      return this.dbPromise;
    }

    async get(storeName, key) {
      try {
        const db = await this.open();
        return new Promise((resolve, reject) => {
          const tx = db.transaction(storeName, 'readonly');
          const store = tx.objectStore(storeName);
          const req = store.get(key);
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });
      } catch (_) {
        return null;
      }
    }

    async set(storeName, key, value) {
      try {
        const db = await this.open();
        return new Promise((resolve, reject) => {
          const tx = db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          const req = store.put(value, key);
          req.onsuccess = () => resolve(true);
          req.onerror = () => reject(req.error);
        });
      } catch (_) {
        return false;
      }
    }

    async delete(storeName, key) {
      try {
        const db = await this.open();
        return new Promise((resolve, reject) => {
          const tx = db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          const req = store.delete(key);
          req.onsuccess = () => resolve(true);
          req.onerror = () => reject(req.error);
        });
      } catch (_) {
        return false;
      }
    }
  }

  // ==========================================================================
  // MODULE 3: ĐỘNG CƠ QUẢN LÝ Ổ CỨNG CỤC BỘ (FILE SYSTEM ACCESS API + AUTO RECONNECT)
  // ==========================================================================
  class UnifiedFileSystemEngine {
    constructor(logger, idb) {
      this.logger = logger;
      this.idb = idb;
      this.rootHandle = null;
      this.subDirs = {};
      this.folderStructure = [
        '01_Chuong_Da_Duyet',
        '02_Ban_Nhap_Dang_Viet',
        '03_Story_Bible_Va_Nhan_Vat',
        '04_Chi_Muc_RAG_Cuc_Bo',
        '05_Bang_Trang_Y_Tuong',
        '06_Lich_Su_Phien_Ban_Snapshots'
      ];
    }

    isSupported() {
      return 'showDirectoryPicker' in window;
    }

    async connectNewDirectory() {
      if (!this.isSupported()) {
        throw new Error(
          'Trình duyệt của bạn không hỗ trợ File System Access API. Hãy dùng Chrome, Edge hoặc Brave trên máy tính.'
        );
      }

      const handle = await window.showDirectoryPicker({
        mode: 'readwrite'
      });

      this.rootHandle = handle;
      await this.idb.set('fs_handles', 'root_workspace_dir', handle);
      await this.ensureStudioDirectories();
      this.updateHeaderIndicators(true, handle.name);
      this.logger.log(`📁 Đã kết nối ổ cứng tại thư mục: "${handle.name}"`, 'SUCCESS');
      return handle;
    }

    async trySilentRestoreDirectory() {
      try {
        const savedHandle = await this.idb.get('fs_handles', 'root_workspace_dir');
        if (!savedHandle) return false;

        const perm = await savedHandle.queryPermission({ mode: 'readwrite' });
        if (perm === 'granted') {
          this.rootHandle = savedHandle;
          await this.ensureStudioDirectories();
          this.updateHeaderIndicators(true, savedHandle.name);
          this.logger.log(`🔄 Đã tự động khôi phục kết nối thư mục "${savedHandle.name}".`, 'SUCCESS');
          return true;
        } else {
          // Hiển thị nút Khôi phục 1-Click nếu trình duyệt cần xác nhận quyền sau khi khởi động lại máy
          const reconnectBtn = document.getElementById('btn-reconnect-folder');
          if (reconnectBtn) reconnectBtn.classList.remove('hidden');
          this.updateHeaderIndicators(false, `Chờ cấp lại quyền: ${savedHandle.name}`);
          return false;
        }
      } catch (_) {
        return false;
      }
    }

    async requestReconnectSavedDirectory() {
      const savedHandle = await this.idb.get('fs_handles', 'root_workspace_dir');
      if (!savedHandle) {
        return await this.connectNewDirectory();
      }
      const perm = await savedHandle.requestPermission({ mode: 'readwrite' });
      if (perm === 'granted') {
        this.rootHandle = savedHandle;
        await this.ensureStudioDirectories();
        this.updateHeaderIndicators(true, savedHandle.name);
        document.getElementById('btn-reconnect-folder')?.classList.add('hidden');
        this.logger.log(`✅ Đã khôi phục quyền ghi ổ cứng cho "${savedHandle.name}".`, 'SUCCESS');
        return true;
      }
      return false;
    }

    async ensureStudioDirectories() {
      if (!this.rootHandle) return;
      for (const dirName of this.folderStructure) {
        try {
          this.subDirs[dirName] = await this.rootHandle.getDirectoryHandle(dirName, {
            create: true
          });
        } catch (err) {
          this.logger.log(`Không thể tạo thư mục con ${dirName}: ${err.message}`, 'WARN');
        }
      }
    }

    updateHeaderIndicators(connected, labelText) {
      const dot = document.getElementById('fs-status-dot');
      const pathEl = document.getElementById('fs-folder-path');
      const scanBtn = document.getElementById('btn-scan-legacy-files');
      const ragBtn = document.getElementById('btn-rebuild-rag');

      if (dot) {
        dot.className = connected
          ? 'w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]'
          : 'w-3 h-3 rounded-full bg-amber-500';
        dot.title = connected ? 'Đã kết nối ổ cứng máy tính' : 'Chưa kết nối ổ cứng';
      }
      if (pathEl) {
        pathEl.textContent = connected
          ? `Ổ cứng: /${labelText} (Đồng bộ 100% cục bộ)`
          : labelText || 'Chưa kết nối thư mục máy tính (Lưu tạm IndexedDB)';
      }
      if (scanBtn) scanBtn.disabled = !connected;
      if (ragBtn) ragBtn.disabled = !connected;
    }

    async writeTextFile(subDirName, fileName, content) {
      if (!this.rootHandle) return false;
      try {
        const dir =
          subDirName && this.subDirs[subDirName]
            ? this.subDirs[subDirName]
            : this.rootHandle;
        const safeName = fileName.replace(/[\\/:*?"<>|]/g, '_');
        const fileHandle = await dir.getFileHandle(safeName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
        return true;
      } catch (err) {
        this.logger.log(`Lỗi ghi file ${fileName}: ${err.message}`, 'ERROR');
        return false;
      }
    }

    async writeDirectRootFile(fileName, content) {
      if (!this.rootHandle) {
        throw new Error('Chưa kết nối thư mục ổ cứng.');
      }
      const fileHandle = await this.rootHandle.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();
      return true;
    }

    async readTextFile(subDirName, fileName) {
      if (!this.rootHandle) return null;
      try {
        const dir =
          subDirName && this.subDirs[subDirName]
            ? this.subDirs[subDirName]
            : this.rootHandle;
        const fileHandle = await dir.getFileHandle(fileName);
        const file = await fileHandle.getFile();
        return await file.text();
      } catch (_) {
        return null;
      }
    }

    async deleteFile(subDirName, fileName) {
      if (!this.rootHandle) return false;
      try {
        const dir =
          subDirName && this.subDirs[subDirName]
            ? this.subDirs[subDirName]
            : this.rootHandle;
        const safeName = fileName.replace(/[\\/:*?"<>|]/g, '_');
        await dir.removeEntry(safeName);
        return true;
      } catch (_) {
        return false;
      }
    }

    async scanAllLegacyDocumentFiles() {
      if (!this.rootHandle) return [];
      const foundFiles = [];
      const ignoredDirs = new Set([
        '03_Story_Bible_Va_Nhan_Vat',
        '04_Chi_Muc_RAG_Cuc_Bo',
        '05_Bang_Trang_Y_Tuong',
        '06_Lich_Su_Phien_Ban_Snapshots',
        '.git',
        'node_modules'
      ]);

      const walkDir = async (dirHandle, relativePrefix = '') => {
        for await (const [entryName, handle] of dirHandle.entries()) {
          if (handle.kind === 'directory') {
            if (!ignoredDirs.has(entryName)) {
              await walkDir(handle, `${relativePrefix}${entryName}/`);
            }
          } else if (handle.kind === 'file') {
            const lower = entryName.toLowerCase();
            if (
              (lower.endsWith('.docx') ||
                lower.endsWith('.txt') ||
                lower.endsWith('.pdf') ||
                lower.endsWith('.md')) &&
              !lower.startsWith('~$')
            ) {
              const fileObj = await handle.getFile();
              foundFiles.push({
                name: entryName,
                relativePath: `${relativePrefix}${entryName}`,
                file: fileObj,
                isApprovedFolder: relativePrefix.includes('01_Chuong_Da_Duyet')
              });
            }
          }
        }
      };

      await walkDir(this.rootHandle);
      return foundFiles;
    }
  }

  // ==========================================================================
  // MODULE 4: BỘ GIẢI MÃ TÀI LIỆU CỤC BỘ (.DOCX / .PDF / .TXT) & ĐẾM TỪ 0MS LAG
  // ==========================================================================
  class UnifiedDocumentParser {
    constructor(logger) {
      this.logger = logger;
    }

    /**
     * Đếm từ tiếng Việt siêu tốc bằng vòng lặp mã ký tự ASCII/Unicode
     * (Chịu tải mượt mà các chương tiểu thuyết 50.000 - 150.000 từ với 0ms độ trễ)
     */
    countVietnameseWords(text) {
      if (!text) return 0;
      let count = 0;
      let inWord = false;
      const len = text.length;
      for (let i = 0; i < len; i++) {
        const code = text.charCodeAt(i);
        const isWhitespace =
          code === 32 || code === 10 || code === 13 || code === 9 || code === 160;
        if (!isWhitespace) {
          if (!inWord) {
            count++;
            inWord = true;
          }
        } else {
          inWord = false;
        }
      }
      return count;
    }

    countParagraphs(text) {
      if (!text) return 0;
      const lines = text.split('\n');
      let count = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().length > 0) count++;
      }
      return count;
    }

    async parseFileObject(file) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (ext === 'txt' || ext === 'md') {
        return await file.text();
      }
      if (ext === 'docx') {
        return await this.parseDocxBuffer(await file.arrayBuffer());
      }
      if (ext === 'pdf') {
        return await this.parsePdfBuffer(await file.arrayBuffer());
      }
      throw new Error(`Định dạng .${ext} không được hỗ trợ.`);
    }

    async parseDocxBuffer(arrayBuffer) {
      if (!window.mammoth) {
        throw new Error('Thư viện Mammoth.js chưa sẵn sàng để giải mã DOCX.');
      }
      const result = await window.mammoth.extractRawText({ arrayBuffer });
      return this.normalizeExtractedText(result.value || '');
    }

    async parsePdfBuffer(arrayBuffer) {
      if (!window.pdfjsLib) {
        throw new Error('Thư viện PDF.js chưa sẵn sàng để giải mã PDF.');
      }
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pageTexts = [];
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const strings = content.items.map((item) => item.str);
        pageTexts.push(strings.join(' '));
      }
      return this.normalizeExtractedText(pageTexts.join('\n\n'));
    }

    normalizeExtractedText(raw) {
      return String(raw || '')
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    }

    /**
     * Tự động rút trích Tóm tắt nén cục bộ (0 Token AI) dựa trên mật độ sự kiện & lời thoại
     */
    generateLocalZeroTokenSummary(content, maxSentences = 5) {
      if (!content || !content.trim()) return '';
      const paras = content
        .split('\n')
        .map((p) => p.trim())
        .filter((p) => p.length > 25);
      if (paras.length === 0) return content.slice(0, 300);

      const picked = [];
      picked.push(paras[0]);
      if (paras.length > 2) {
        picked.push(paras[Math.floor(paras.length / 2)]);
      }
      if (paras.length > 1) {
        picked.push(paras[paras.length - 1]);
      }

      return picked
        .slice(0, maxSentences)
        .map((p) => (p.length > 220 ? `${p.slice(0, 220)}...` : p))
        .join('\n• ');
    }
  }

  // ==========================================================================
  // MODULE 5: CHỈ MỤC CHỐNG QUÊN CỤC BỘ (LOCAL BM25 RAG ENGINE - 0 TOKEN)
  // ==========================================================================
  class UnifiedLocalRAGEngine {
    constructor(logger, docParser, idb) {
      this.logger = logger;
      this.docParser = docParser;
      this.idb = idb;
      this.chunks = [];
    }

    tokenizeVietnamese(text) {
      return String(text || '')
        .toLowerCase()
        .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'“”‘’[\]\\|<>]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length >= 2);
    }

    rebuildIndexFromApprovedChapters(approvedChapters) {
      this.chunks = [];
      const chunkSizeWords = 320;
      const overlapWords = 50;

      for (const chap of approvedChapters) {
        const text = chap.content || '';
        if (!text.trim()) continue;

        const words = text.split(/\s+/);
        let start = 0;
        let chunkIdx = 1;

        while (start < words.length) {
          const slice = words.slice(start, start + chunkSizeWords).join(' ');
          const tokens = this.tokenizeVietnamese(slice);
          const freqMap = {};
          tokens.forEach((t) => {
            freqMap[t] = (freqMap[t] || 0) + 1;
          });

          this.chunks.push({
            chunkId: `${chap.id}_c${chunkIdx}`,
            chapterId: chap.id,
            chapterNumber: chap.chapterNumber,
            chapterTitle: chap.displayTitle || chap.title,
            timelineTimestamp: chap.timelineTimestamp || 'Chưa rõ giờ',
            povCharacter: chap.povCharacter || 'Đa điểm nhìn',
            text: slice,
            tokenCount: tokens.length,
            freqMap
          });

          chunkIdx++;
          start += chunkSizeWords - overlapWords;
        }
      }

      const statEl = document.getElementById('stat-chunks-count');
      if (statEl) statEl.textContent = String(this.chunks.length);

      this.idb.set('rag_chunks_store', 'cached_rag_index', this.chunks).catch(() => {});
      return this.chunks.length;
    }

    searchRelevantChunks(queryText, topK = 8) {
      if (!queryText || !queryText.trim() || this.chunks.length === 0) {
        return this.chunks.slice(-topK);
      }

      const qTokens = this.tokenizeVietnamese(queryText);
      if (qTokens.length === 0) return this.chunks.slice(-topK);

      const N = this.chunks.length;
      const avgDl =
        this.chunks.reduce((sum, c) => sum + c.tokenCount, 0) / Math.max(1, N);
      const k1 = 1.5;
      const b = 0.75;

      const scored = this.chunks.map((chunk) => {
        let score = 0;
        for (const qt of qTokens) {
          const tf = chunk.freqMap[qt] || 0;
          if (tf === 0) continue;
          let df = 0;
          for (let i = 0; i < N; i++) {
            if (this.chunks[i].freqMap[qt]) df++;
          }
          const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
          const num = tf * (k1 + 1);
          const den = tf + k1 * (1 - b + b * (chunk.tokenCount / Math.max(1, avgDl)));
          score += idf * (num / den);
        }
        return { chunk, score };
      });

      return scored
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .map((item) => item.chunk);
    }
  }

  // ==========================================================================
  // MODULE 6: CỔNG PHÊ DUYỆT BẢN THẢO 2 CHIỀU (DUYỆT ⇄ HỦY DUYỆT VỀ NHÁP - FIX BUG 5)
  // ==========================================================================
  class UnifiedChapterApprovalGate {
    constructor(logger, fsEngine, docParser, ragEngine) {
      this.logger = logger;
      this.fsEngine = fsEngine;
      this.docParser = docParser;
      this.ragEngine = ragEngine;

      this.chapters = [];
      this.activeChapterId = null;
    }

    createNewDraftChapter(customTitle = '') {
      const nextNum = this.chapters.length + 1;
      const defaultTitle = customTitle || `Chương ${nextNum}: Bản nháp mới`;
      const newChap = {
        id: `chap_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        chapterNumber: nextNum,
        title: defaultTitle,
        displayTitle: defaultTitle,
        fileName: `Chuong_${String(nextNum).padStart(2, '0')}.txt`,
        status: 'DRAFT', // 'DRAFT' | 'APPROVED'
        timelineTimestamp: '',
        location: '',
        povCharacter: '',
        povReliability: 'reliable',
        beats: '',
        summary: '',
        content: '',
        wordCount: 0,
        updatedAt: Date.now()
      };

      this.chapters.push(newChap);
      this.activeChapterId = newChap.id;
      return newChap;
    }

    getActiveChapter() {
      return (
        this.chapters.find((c) => c.id === this.activeChapterId) ||
        this.chapters[0] ||
        null
      );
    }

    getDraftChapters() {
      return this.chapters.filter((c) => c.status !== 'APPROVED');
    }

    getApprovedChapters() {
      return this.chapters.filter((c) => c.status === 'APPROVED');
    }

    /**
     * Phê duyệt 1 chương hoặc nhiều chương cùng lúc (Hỗ trợ Bug 6)
     */
    async approveChapterById(chapterId, triggerAutoBibleEvent = true) {
      const chap = this.chapters.find((c) => c.id === chapterId);
      if (!chap) return null;

      chap.status = 'APPROVED';
      chap.wordCount = this.docParser.countVietnameseWords(chap.content || '');
      if (!chap.summary || !chap.summary.trim()) {
        chap.summary = this.docParser.generateLocalZeroTokenSummary(chap.content || '');
      }
      chap.updatedAt = Date.now();

      const fileName =
        chap.fileName ||
        `Chuong_${String(chap.chapterNumber).padStart(2, '0')}_${chap.title}.txt`;
      await this.fsEngine.writeTextFile('01_Chuong_Da_Duyet', fileName, chap.content || '');
      await this.fsEngine.deleteFile('02_Ban_Nhap_Dang_Viet', fileName);

      this.ragEngine.rebuildIndexFromApprovedChapters(this.getApprovedChapters());

      if (triggerAutoBibleEvent) {
        window.dispatchEvent(
          new CustomEvent('studio:chapter-approved', { detail: chap })
        );
      }

      this.logger.log(
        `✅ Đã duyệt chính thức "${chap.displayTitle || chap.title}" (${chap.wordCount.toLocaleString('vi-VN')} từ).`,
        'SUCCESS'
      );
      return chap;
    }

    /**
     * FIX BUG 5: Biến chương Đã Duyệt thành Chưa Duyệt (Đang Nháp) bất kỳ lúc nào
     * (Hỗ trợ bấm từ danh sách Cây bản thảo hoặc bấm trên thanh công cụ)
     */
    async unapproveChapterToDraft(chapterId) {
      const targetId = chapterId || this.activeChapterId;
      const chap = this.chapters.find((c) => c.id === targetId);
      if (!chap) return null;

      chap.status = 'DRAFT';
      chap.updatedAt = Date.now();

      const fileName =
        chap.fileName ||
        `Chuong_${String(chap.chapterNumber).padStart(2, '0')}_${chap.title}.txt`;
      await this.fsEngine.writeTextFile('02_Ban_Nhap_Dang_Viet', fileName, chap.content || '');
      await this.fsEngine.deleteFile('01_Chuong_Da_Duyet', fileName);

      this.ragEngine.rebuildIndexFromApprovedChapters(this.getApprovedChapters());

      window.dispatchEvent(
        new CustomEvent('studio:chapter-unapproved', { detail: chap })
      );

      this.logger.log(
        `🔓 Đã chuyển "${chap.displayTitle || chap.title}" từ Đã Duyệt về lại trạng thái ĐANG NHÁP (CHƯA DUYỆT).`,
        'WARN'
      );
      return chap;
    }
  }

  // ==========================================================================
  // MODULE 7: QUẢN TRỊ STORY BIBLE ĐA ĐIỂM NHÌN & DANH SÁCH TỪ CẤM
  // ==========================================================================
  class UnifiedStoryBibleManager {
    constructor(logger, fsEngine) {
      this.logger = logger;
      this.fsEngine = fsEngine;
      this.data = {
        characters: [],
        knowledgeMatrix: [],
        cluesLedger: [],
        antiClicheBlacklist: [
          'nhếch mép cười lạnh',
          'ánh mắt sắc như dao',
          'hít một hơi sâu',
          'bất giác',
          'không khỏi',
          'một cảm giác khó tả',
          'trái tim đập loạn nhịp'
        ]
      };
    }

    addOrUpdateCharacter(charObj) {
      const idx = this.data.characters.findIndex((c) => c.id === charObj.id);
      if (idx >= 0) {
        this.data.characters[idx] = { ...this.data.characters[idx], ...charObj };
      } else {
        this.data.characters.push({
          ...charObj,
          id: charObj.id || `char_${Date.now()}`
        });
      }
      this.persistToDisk();
    }

    deleteCharacter(id) {
      this.data.characters = this.data.characters.filter((c) => c.id !== id);
      this.persistToDisk();
    }

    addKnowledgeItem(item) {
      this.data.knowledgeMatrix.push({
        id: `kn_${Date.now()}`,
        title: item.title,
        objectiveTruth: item.objectiveTruth,
        characterPerceptions: item.characterPerceptions
      });
      this.persistToDisk();
    }

    deleteKnowledgeItem(id) {
      this.data.knowledgeMatrix = this.data.knowledgeMatrix.filter((k) => k.id !== id);
      this.persistToDisk();
    }

    addClueItem(item) {
      this.data.cluesLedger.push({
        id: `clue_${Date.now()}`,
        name: item.name,
        plantedChapter: item.plantedChapter || 1,
        status: item.status || 'Planted',
        description: item.description || ''
      });
      this.persistToDisk();
    }

    deleteClueItem(id) {
      this.data.cluesLedger = this.data.cluesLedger.filter((c) => c.id !== id);
      this.persistToDisk();
    }

    updateBlacklist(rawString) {
      this.data.antiClicheBlacklist = String(rawString || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      this.persistToDisk();
    }

    async persistToDisk() {
      await this.fsEngine.writeTextFile(
        '03_Story_Bible_Va_Nhan_Vat',
        'story_bible_master.json',
        JSON.stringify(this.data, null, 2)
      );
    }
  }

  // ==========================================================================
  // MODULE 8: BỘ ĐIỀU KHIỂN TRUNG TÂM STAGE 1 (UNIFIED CORE CONTROLLER)
  // ==========================================================================
  class UnifiedCoreStudioController {
    constructor() {
      this.logger = new UnifiedStudioLogger();
      this.idb = new UnifiedIndexedDBEngine();
      this.fsEngine = new UnifiedFileSystemEngine(this.logger, this.idb);
      this.docParser = new UnifiedDocumentParser(this.logger);
      this.ragEngine = new UnifiedLocalRAGEngine(this.logger, this.docParser, this.idb);
      this.approvalGate = new UnifiedChapterApprovalGate(
        this.logger,
        this.fsEngine,
        this.docParser,
        this.ragEngine
      );
      this.bibleManager = new UnifiedStoryBibleManager(this.logger, this.fsEngine);

      this.currentFontSize = parseInt(localStorage.getItem('noir_novel_font_size') || '16', 10);
      this.idleStatsTimer = null;
    }

    async init() {
      this.applySavedThemeAndTypography();
      await this.loadWorkspaceStateFromIDB();
      await this.fsEngine.trySilentRestoreDirectory();
      this.bindCoreDOMEvents();
      this.renderAll();
      this.logger.log(
        'Khởi tạo hoàn tất Lõi Lưu Trữ Cục Bộ, Cổng Phê Duyệt 2 Chiều (Bug 5) & Story Bible.',
        'SUCCESS'
      );
    }

    applySavedThemeAndTypography() {
      const savedTheme = localStorage.getItem('noir_studio_theme') || 'dark';
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      const themeLabel = document.getElementById('theme-icon-label');
      if (themeLabel) {
        themeLabel.textContent =
          savedTheme === 'dark' ? '☀️ Chế Độ Sáng' : '🌙 Chế Độ Tối';
      }
      document.documentElement.style.setProperty(
        '--novel-font-size',
        `${this.currentFontSize}px`
      );
      const fontLabel = document.getElementById('label-font-size');
      if (fontLabel) fontLabel.textContent = `${this.currentFontSize}px`;
    }

    async loadWorkspaceStateFromIDB() {
      const cached = await this.idb.get('state_cache', 'workspace_state_v1');
      if (cached && Array.isArray(cached.chapters) && cached.chapters.length > 0) {
        this.approvalGate.chapters = cached.chapters;
        this.approvalGate.activeChapterId =
          cached.activeChapterId || cached.chapters[0].id;
        if (cached.bible) {
          this.bibleManager.data = { ...this.bibleManager.data, ...cached.bible };
        }
      } else {
        this.approvalGate.createNewDraftChapter('Chương 1: Khởi đầu bản nháp');
      }
      this.ragEngine.rebuildIndexFromApprovedChapters(
        this.approvalGate.getApprovedChapters()
      );
    }

    async saveWorkspaceStateToIDB() {
      this.syncActiveEditorFieldsToChapterObject();
      await this.idb.set('state_cache', 'workspace_state_v1', {
        chapters: this.approvalGate.chapters,
        activeChapterId: this.approvalGate.activeChapterId,
        bible: this.bibleManager.data,
        savedAt: Date.now()
      });
    }

    syncActiveEditorFieldsToChapterObject() {
      const chap = this.approvalGate.getActiveChapter();
      if (!chap) return;

      const numEl = document.getElementById('input-chapter-number');
      const titleEl = document.getElementById('input-chapter-title');
      const timeEl = document.getElementById('input-scene-timestamp');
      const locEl = document.getElementById('input-scene-location');
      const povEl = document.getElementById('select-scene-pov');
      const relEl = document.getElementById('select-pov-reliability');
      const beatsEl = document.getElementById('textarea-chapter-beats');
      const sumEl = document.getElementById('textarea-chapter-summary');
      const contentEl = document.getElementById('textarea-chapter-content');

      if (numEl) chap.chapterNumber = parseInt(numEl.value, 10) || 1;
      if (titleEl && titleEl.value.trim()) {
        chap.title = titleEl.value.trim();
        if (!chap.displayTitle) chap.displayTitle = chap.title;
      }
      if (timeEl) chap.timelineTimestamp = timeEl.value.trim();
      if (locEl) chap.location = locEl.value.trim();
      if (povEl) chap.povCharacter = povEl.value;
      if (relEl) chap.povReliability = relEl.value;
      if (beatsEl) chap.beats = beatsEl.value;
      if (sumEl) chap.summary = sumEl.value;
      if (contentEl) {
        chap.content = contentEl.value;
        chap.wordCount = this.docParser.countVietnameseWords(chap.content);
      }
    }

    bindCoreDOMEvents() {
      // Nút Kết nối & Khôi phục ổ cứng
      document.getElementById('btn-connect-folder')?.addEventListener('click', async () => {
        try {
          await this.fsEngine.connectNewDirectory();
        } catch (err) {
          this.logger.log(`Hủy hoặc lỗi kết nối ổ cứng: ${err.message}`, 'WARN');
        }
      });

      document.getElementById('btn-reconnect-folder')?.addEventListener('click', async () => {
        await this.fsEngine.requestReconnectSavedDirectory();
      });

      // Quét file cũ .DOCX / .PDF / .TXT từ ổ cứng
      document.getElementById('btn-scan-legacy-files')?.addEventListener('click', async () => {
        await this.scanAndImportLegacyFilesFromDisk();
      });

      document.getElementById('btn-rebuild-rag')?.addEventListener('click', () => {
        const count = this.ragEngine.rebuildIndexFromApprovedChapters(
          this.approvalGate.getApprovedChapters()
        );
        this.logger.log(`🧠 Đã tái lập chỉ mục chống quên cục bộ: ${count} đoạn văn.`, 'SUCCESS');
      });

      // Tạo chương nháp mới
      document.getElementById('btn-create-new-draft')?.addEventListener('click', async () => {
        this.syncActiveEditorFieldsToChapterObject();
        this.approvalGate.createNewDraftChapter();
        await this.saveWorkspaceStateToIDB();
        this.renderAll();
      });

      // Lọc nhanh chương
      document.getElementById('input-filter-chapters')?.addEventListener('input', () => {
        this.renderChaptersTree();
      });

      // Lưu nháp
      document.getElementById('btn-save-draft-disk')?.addEventListener('click', async () => {
        await this.saveWorkspaceStateToIDB();
        const chap = this.approvalGate.getActiveChapter();
        if (chap) {
          const folder =
            chap.status === 'APPROVED' ? '01_Chuong_Da_Duyet' : '02_Ban_Nhap_Dang_Viet';
          await this.fsEngine.writeTextFile(
            folder,
            chap.fileName || `Chuong_${chap.chapterNumber}.txt`,
            chap.content || ''
          );
          this.logger.log(`💾 Đã lưu "${chap.displayTitle || chap.title}" xuống bộ nhớ.`, 'SUCCESS');
        }
      });

      // Nút Mở khóa chương Đã Duyệt về lại Đang Nháp trên thanh tiêu đề (Fix Bug 5)
      document.getElementById('btn-unlock-to-draft')?.addEventListener('click', async () => {
        this.syncActiveEditorFieldsToChapterObject();
        const chap = this.approvalGate.getActiveChapter();
        if (!chap) return;
        await this.approvalGate.unapproveChapterToDraft(chap.id);
        await this.saveWorkspaceStateToIDB();
        this.renderAll();
      });

      // Theo dõi thay đổi nội dung bản thảo
      const contentEl = document.getElementById('textarea-chapter-content');
      contentEl?.addEventListener('input', () => {
        this.updateLiveWordStats(contentEl.value);
      });

      // Nút tự rút trích tóm tắt nhanh (0 Token)
      document.getElementById('btn-auto-local-summary')?.addEventListener('click', () => {
        const content = document.getElementById('textarea-chapter-content')?.value || '';
        const sumEl = document.getElementById('textarea-chapter-summary');
        if (sumEl) {
          sumEl.value = this.docParser.generateLocalZeroTokenSummary(content);
          this.syncActiveEditorFieldsToChapterObject();
        }
      });

      // Đổi giao diện Sáng / Tối
      document.getElementById('btn-toggle-theme')?.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('noir_studio_theme', isDark ? 'dark' : 'light');
        const label = document.getElementById('theme-icon-label');
        if (label) {
          label.textContent = isDark ? '☀️ Chế Độ Sáng' : '🌙 Chế Độ Tối';
        }
      });

      // Tăng / Giảm cỡ chữ
      document.getElementById('btn-font-decrease')?.addEventListener('click', () => {
        this.currentFontSize = Math.max(12, this.currentFontSize - 1);
        this.applySavedThemeAndTypography();
      });
      document.getElementById('btn-font-increase')?.addEventListener('click', () => {
        this.currentFontSize = Math.min(28, this.currentFontSize + 1);
        this.applySavedThemeAndTypography();
      });

      // Chuyển tab cột trái & cột phải
      document.querySelectorAll('.left-tab-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const tab = btn.getAttribute('data-left-tab');
          ['chapters', 'timeline', 'rag-search'].forEach((t) => {
            document.getElementById(`left-tab-${t}`)?.classList.toggle('hidden', t !== tab);
          });
          document.querySelectorAll('.left-tab-btn').forEach((b) => {
            const active = b === btn;
            b.className = `left-tab-btn py-2.5 border-b-2 ${
              active
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-zinc-500'
            }`;
          });
        });
      });

      document.querySelectorAll('.right-tab-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const tab = btn.getAttribute('data-right-tab');
          ['characters', 'knowledge', 'clues', 'rules'].forEach((t) => {
            document.getElementById(`right-tab-${t}`)?.classList.toggle('hidden', t !== tab);
          });
          document.querySelectorAll('.right-tab-btn').forEach((b) => {
            const active = b === btn;
            b.className = `right-tab-btn py-2.5 border-b-2 ${
              active
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-zinc-500'
            }`;
          });
        });
      });
    }

    async scanAndImportLegacyFilesFromDisk() {
      try {
        const files = await this.fsEngine.scanAllLegacyDocumentFiles();
        if (files.length === 0) {
          this.logger.log('Không tìm thấy file .DOCX/.PDF/.TXT nào trong thư mục.', 'WARN');
          return;
        }
        let imported = 0;
        for (const f of files) {
          const exists = this.approvalGate.chapters.some((c) => c.fileName === f.name);
          if (exists) continue;
          const text = await this.docParser.parseFileObject(f.file);
          const nextNum = this.approvalGate.chapters.length + 1;
          const cleanTitle = f.name.replace(/\.(docx|pdf|txt|md)$/i, '');
          this.approvalGate.chapters.push({
            id: `chap_imp_${Date.now()}_${imported}`,
            chapterNumber: nextNum,
            title: cleanTitle,
            displayTitle: cleanTitle,
            fileName: f.name,
            status: f.isApprovedFolder ? 'APPROVED' : 'DRAFT',
            timelineTimestamp: '',
            location: '',
            povCharacter: '',
            povReliability: 'reliable',
            beats: '',
            summary: this.docParser.generateLocalZeroTokenSummary(text),
            content: text,
            wordCount: this.docParser.countVietnameseWords(text),
            updatedAt: Date.now()
          });
          imported++;
        }
        this.ragEngine.rebuildIndexFromApprovedChapters(
          this.approvalGate.getApprovedChapters()
        );
        await this.saveWorkspaceStateToIDB();
        this.renderAll();
        this.logger.log(`📥 Đã nạp thành công ${imported} file tư liệu vào Cây bản thảo.`, 'SUCCESS');
      } catch (err) {
        this.logger.log(`Lỗi nạp file: ${err.message}`, 'ERROR');
      }
    }

    updateLiveWordStats(text) {
      const compute = () => {
        const words = this.docParser.countVietnameseWords(text);
        const paras = this.docParser.countParagraphs(text);
        const wEl = document.getElementById('editor-word-count');
        const pEl = document.getElementById('editor-para-count');
        if (wEl) wEl.textContent = words.toLocaleString('vi-VN');
        if (pEl) pEl.textContent = paras.toLocaleString('vi-VN');
      };

      if (text && text.length > 35000) {
        clearTimeout(this.idleStatsTimer);
        this.idleStatsTimer = setTimeout(compute, 280);
      } else {
        compute();
      }
    }

    renderAll() {
      this.renderChaptersTree();
      this.renderActiveChapterToEditor();
      this.renderStoryBibleLists();
      this.renderTimelineEvents();
    }

    /**
     * Render Cây Bản Thảo kèm nút 🔓 Hủy Duyệt (Biến chương Đã Duyệt ➔ Chưa Duyệt - Fix Bug 5)
     * và các nút ⬆️ ⬇️ ✏️ 🗑️ đầy đủ
     */
    renderChaptersTree() {
      const draftListEl = document.getElementById('list-draft-chapters');
      const approvedListEl = document.getElementById('list-approved-chapters');
      if (!draftListEl || !approvedListEl) return;

      const filterQ = (
        document.getElementById('input-filter-chapters')?.value || ''
      )
        .toLowerCase()
        .trim();

      const drafts = this.approvalGate
        .getDraftChapters()
        .filter(
          (c) =>
            !filterQ ||
            (c.displayTitle || c.title).toLowerCase().includes(filterQ) ||
            (c.povCharacter || '').toLowerCase().includes(filterQ)
        );

      const approved = this.approvalGate
        .getApprovedChapters()
        .filter(
          (c) =>
            !filterQ ||
            (c.displayTitle || c.title).toLowerCase().includes(filterQ) ||
            (c.povCharacter || '').toLowerCase().includes(filterQ)
        );

      document.getElementById('stat-draft-count') &&
        (document.getElementById('stat-draft-count').textContent = String(drafts.length));
      document.getElementById('stat-approved-count') &&
        (document.getElementById('stat-approved-count').textContent = String(approved.length));
      document.getElementById('badge-draft-list-count') &&
        (document.getElementById('badge-draft-list-count').textContent = String(drafts.length));
      document.getElementById('badge-approved-list-count') &&
        (document.getElementById('badge-approved-list-count').textContent = String(
          approved.length
        ));

      const buildItemHTML = (chap, isApproved) => {
        const isActive = chap.id === this.approvalGate.activeChapterId;
        const li = document.createElement('li');
        li.className = `p-2 rounded-lg border transition cursor-pointer ${
          isActive
            ? 'border-emerald-500 bg-emerald-500/10 font-semibold'
            : 'border-studioLightBorder dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
        }`;

        li.innerHTML = `
          <div class="flex items-center justify-between gap-1">
            <span class="truncate text-xs">${chap.displayTitle || chap.title}</span>
            <span class="text-[10px] font-monoCode text-emerald-500 shrink-0">${(
              chap.wordCount || 0
            ).toLocaleString('vi-VN')}w</span>
          </div>
          <div class="flex items-center justify-between mt-1.5 pt-1 border-t border-zinc-500/10 text-[10px]">
            <span class="text-zinc-400 truncate max-w-[110px]">${
              chap.fileName || `Chương ${chap.chapterNumber}`
            }</span>
            <div class="flex items-center gap-1">
              ${
                isApproved
                  ? `<button type="button" class="btn-tree-unapprove px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-zinc-950 font-bold transition" title="Chuyển chương đã duyệt này về lại Chưa Duyệt (Đang Nháp)">↩️ Hủy duyệt</button>`
                  : `<button type="button" class="btn-tree-quick-approve px-1.5 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-600 text-emerald-400 hover:text-white font-bold transition" title="Duyệt chương này">✅</button>`
              }
              <button type="button" class="btn-tree-up px-1 py-0.5 rounded hover:bg-zinc-700" title="Di chuyển lên">⬆️</button>
              <button type="button" class="btn-tree-down px-1 py-0.5 rounded hover:bg-zinc-700" title="Di chuyển xuống">⬇️</button>
              <button type="button" class="btn-tree-rename px-1 py-0.5 rounded hover:bg-zinc-700" title="Đổi tên hiển thị">✏️</button>
              <button type="button" class="btn-tree-delete px-1 py-0.5 rounded hover:bg-red-600/30 text-red-400" title="Xóa chương">🗑️</button>
            </div>
          </div>
        `;

        li.addEventListener('click', async (e) => {
          if (e.target.closest('button')) return;
          this.syncActiveEditorFieldsToChapterObject();
          this.approvalGate.activeChapterId = chap.id;
          await this.saveWorkspaceStateToIDB();
          this.renderAll();
        });

        // FIX BUG 5: Bấm nút "↩️ Hủy duyệt" biến ngay chương Đã Duyệt thành Chưa Duyệt
        li.querySelector('.btn-tree-unapprove')?.addEventListener('click', async (e) => {
          e.stopPropagation();
          await this.approvalGate.unapproveChapterToDraft(chap.id);
          await this.saveWorkspaceStateToIDB();
          this.renderAll();
        });

        li.querySelector('.btn-tree-quick-approve')?.addEventListener('click', async (e) => {
          e.stopPropagation();
          this.approvalGate.activeChapterId = chap.id;
          this.renderAll();
          document.getElementById('btn-approve-chapter')?.click();
        });

        li.querySelector('.btn-tree-up')?.addEventListener('click', async (e) => {
          e.stopPropagation();
          const idx = this.approvalGate.chapters.findIndex((c) => c.id === chap.id);
          if (idx > 0) {
            const temp = this.approvalGate.chapters[idx - 1];
            this.approvalGate.chapters[idx - 1] = this.approvalGate.chapters[idx];
            this.approvalGate.chapters[idx] = temp;
            await this.saveWorkspaceStateToIDB();
            this.renderChaptersTree();
          }
        });

        li.querySelector('.btn-tree-down')?.addEventListener('click', async (e) => {
          e.stopPropagation();
          const idx = this.approvalGate.chapters.findIndex((c) => c.id === chap.id);
          if (idx >= 0 && idx < this.approvalGate.chapters.length - 1) {
            const temp = this.approvalGate.chapters[idx + 1];
            this.approvalGate.chapters[idx + 1] = this.approvalGate.chapters[idx];
            this.approvalGate.chapters[idx] = temp;
            await this.saveWorkspaceStateToIDB();
            this.renderChaptersTree();
          }
        });

        li.querySelector('.btn-tree-rename')?.addEventListener('click', async (e) => {
          e.stopPropagation();
          const newName = prompt(
            'Nhập tên hiển thị mới cho chương:',
            chap.displayTitle || chap.title
          );
          if (newName && newName.trim()) {
            chap.displayTitle = newName.trim();
            chap.title = newName.trim();
            await this.saveWorkspaceStateToIDB();
            this.renderAll();
          }
        });

        li.querySelector('.btn-tree-delete')?.addEventListener('click', async (e) => {
          e.stopPropagation();
          if (this.approvalGate.chapters.length <= 1) {
            alert('Cần giữ lại ít nhất 1 chương trong Cây bản thảo.');
            return;
          }
          if (!confirm(`Xóa chương "${chap.displayTitle || chap.title}"?`)) return;
          this.approvalGate.chapters = this.approvalGate.chapters.filter(
            (c) => c.id !== chap.id
          );
          if (this.approvalGate.activeChapterId === chap.id) {
            this.approvalGate.activeChapterId = this.approvalGate.chapters[0].id;
          }
          await this.saveWorkspaceStateToIDB();
          this.renderAll();
        });

        return li;
      };

      draftListEl.innerHTML = '';
      if (drafts.length === 0) {
        draftListEl.innerHTML = `<li class="text-zinc-400 italic text-[11px] py-2">Chưa có bản nháp nào.</li>`;
      } else {
        drafts.forEach((c) => draftListEl.appendChild(buildItemHTML(c, false)));
      }

      approvedListEl.innerHTML = '';
      if (approved.length === 0) {
        approvedListEl.innerHTML = `<li class="text-zinc-400 italic text-[11px] py-2">Chưa có chương nào được duyệt.</li>`;
      } else {
        approved.forEach((c) => approvedListEl.appendChild(buildItemHTML(c, true)));
      }
    }

    renderActiveChapterToEditor() {
      const chap = this.approvalGate.getActiveChapter();
      if (!chap) return;

      const badge = document.getElementById('current-chapter-status-badge');
      const approveBtn = document.getElementById('btn-approve-chapter');
      const unlockBtn = document.getElementById('btn-unlock-to-draft');

      if (chap.status === 'APPROVED') {
        if (badge) {
          badge.className =
            'px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
          badge.textContent = '✅ ĐÃ DUYỆT (CHÍNH THỨC)';
        }
        approveBtn?.classList.add('hidden');
        unlockBtn?.classList.remove('hidden');
      } else {
        if (badge) {
          badge.className =
            'px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-500/20 text-amber-500 border border-amber-500/30';
          badge.textContent = '📝 ĐANG NHÁP (CHƯA DUYỆT)';
        }
        approveBtn?.classList.remove('hidden');
        unlockBtn?.classList.add('hidden');
      }

      const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val ?? '';
      };

      setVal('input-chapter-number', chap.chapterNumber);
      setVal('input-chapter-title', chap.displayTitle || chap.title);
      setVal('input-scene-timestamp', chap.timelineTimestamp);
      setVal('input-scene-location', chap.location);
      setVal('select-scene-pov', chap.povCharacter);
      setVal('select-pov-reliability', chap.povReliability || 'reliable');
      setVal('textarea-chapter-beats', chap.beats);
      setVal('textarea-chapter-summary', chap.summary);
      setVal('textarea-chapter-content', chap.content);

      this.updateLiveWordStats(chap.content || '');
    }

    renderStoryBibleLists() {
      const povSelect = document.getElementById('select-scene-pov');
      const modalPovSelect = document.getElementById('modal-scene-pov');
      const chars = this.bibleManager.data.characters || [];

      if (povSelect) {
        const cur = povSelect.value;
        povSelect.innerHTML =
          `<option value="">-- Chọn nhân vật POV --</option>` +
          chars
            .map((c) => `<option value="${c.name}">${c.name}</option>`)
            .join('');
        povSelect.value = cur;
      }

      if (modalPovSelect) {
        modalPovSelect.innerHTML =
          `<option value="Giữ nguyên POV hiện tại">-- Giữ nguyên POV hiện tại --</option>` +
          chars
            .map((c) => `<option value="${c.name}">${c.name}</option>`)
            .join('');
      }

      const blArea = document.getElementById('textarea-anti-cliche');
      if (blArea) {
        blArea.value = (this.bibleManager.data.antiClicheBlacklist || []).join(', ');
      }
    }

    renderTimelineEvents() {
      const box = document.getElementById('timeline-events-container');
      if (!box) return;
      const approved = this.approvalGate.getApprovedChapters();
      if (approved.length === 0) {
        box.innerHTML = `<div class="text-zinc-400 italic text-[11px]">Chưa có mốc giờ chính thức.</div>`;
        return;
      }
      box.innerHTML = approved
        .map(
          (c) => `
          <div class="p-2 rounded border border-studioLightBorder dark:border-zinc-800 bg-studioLightBg dark:bg-zinc-950 space-y-0.5">
            <div class="font-bold text-emerald-500">${c.timelineTimestamp || 'Chưa gắn mốc giờ'}</div>
            <div class="font-semibold">${c.displayTitle || c.title}</div>
            <div class="text-[10px] text-zinc-400">POV: ${c.povCharacter || 'Đa điểm nhìn'} | Địa điểm: ${c.location || '---'}</div>
          </div>
        `
        )
        .join('');
    }
  }

  // Khởi tạo đối tượng toàn cục window.StudioCore tương thích ngược 100%
  const coreController = new UnifiedCoreStudioController();
  window.StudioCore = {
    logger: coreController.logger,
    idb: coreController.idb,
    fsEngine: coreController.fsEngine,
    docParser: coreController.docParser,
    ragEngine: coreController.ragEngine,
    approvalGate: coreController.approvalGate,
    bibleManager: coreController.bibleManager,
    controller: coreController
  };
  // ==========================================================================
  // MODULE 9: CẤU HÌNH AI, ĐỒNG HỒ HẠN MỨC, CHÈN CHUYỂN CẢNH & BẢNG TRẮNG
  //           (HỢP NHẤT STAGE 2 & STAGE 5 - GIẢI QUYẾT BUG 9 & BUG 10)
  // ==========================================================================
  class UnifiedAISettingsAndTelemetry {
    constructor(core) {
      this.core = core;
      this.config = this.loadConfig();
      this.scratchpadItems = this.loadScratchpad();
      this.activeModeId = localStorage.getItem('noir_active_ai_mode') || 'MODE_1_DRAFT';
      this.thinkingLevel = localStorage.getItem('noir_thinking_level') || 'high';
      this.targetWordCount = parseInt(localStorage.getItem('noir_target_word_count') || '4500', 10);
      this.multiStepState = {
        isActive: false,
        currentStep: 1,
        totalSteps: 1,
        accumulatedWords: 0,
        targetTotalWords: 4500,
        lastPromptUsed: ''
      };
    }

    loadConfig() {
      const defaults = {
        apiKey: localStorage.getItem('noir_gemini_api_key') || '',
        modelId: localStorage.getItem('noir_gemini_model_id') || 'gemini-3.1-pro-preview',
        maxWordsPerStep: 4000,
        modelContextLimit: 1000000,
        ragTopK: 8
      };
      try {
        const saved = JSON.parse(localStorage.getItem('noir_stage2_ai_config') || '{}');
        return {
          ...defaults,
          ...saved,
          apiKey: saved.apiKey || defaults.apiKey,
          modelId: saved.modelId || defaults.modelId
        };
      } catch (_) {
        return defaults;
      }
    }

    saveConfig(partial = {}) {
      this.config = { ...this.config, ...partial };
      localStorage.setItem('noir_stage2_ai_config', JSON.stringify(this.config));
      if (this.config.apiKey !== undefined) {
        localStorage.setItem('noir_gemini_api_key', this.config.apiKey);
      }
      if (this.config.modelId) {
        localStorage.setItem('noir_gemini_model_id', this.config.modelId);
      }
    }

    loadScratchpad() {
      try {
        return JSON.parse(localStorage.getItem('noir_scratchpad_items') || '[]');
      } catch (_) {
        return [];
      }
    }

    saveScratchpad() {
      localStorage.setItem('noir_scratchpad_items', JSON.stringify(this.scratchpadItems));
      this.core.fsEngine.writeTextFile(
        '05_Bang_Trang_Y_Tuong',
        'scratchpad_ideas.json',
        JSON.stringify(this.scratchpadItems, null, 2)
      );
    }

    /**
     * Trích xuất toàn bộ các thẻ [CHUYỂN PHÂN CẢNH / ĐỔI POV] trong khung Beats (Fix Bug 10)
     */
    extractSceneTransitionDirectives(beatsText = '') {
      const raw =
        beatsText ||
        document.getElementById('textarea-chapter-beats')?.value ||
        '';
      const matches = [
        ...raw.matchAll(
          /\[CHUYỂN PHÂN CẢNH\s*\|\s*Giờ:\s*([^|\]]+)\|\s*Địa điểm:\s*([^|\]]+)\|\s*POV:\s*([^|\]]+)\|\s*Tâm lý:\s*([^|\]]+)\]\s*(?:Chỉ đạo:\s*([^\n]+))?/gi
        )
      ];
      return matches.map((m, idx) => ({
        index: idx + 1,
        time: (m[1] || '').trim(),
        location: (m[2] || '').trim(),
        pov: (m[3] || '').trim(),
        unreliableState: (m[4] || '').trim(),
        directive: (m[5] || '').trim()
      }));
    }

    initUI() {
      this.mountTelemetryAndModeBar();
      this.mountMultiStepContinuationBar();
      this.bindSceneBuilderModal();
      this.bindScratchpadDrawer();
      this.bindAISettingsModal();
    }

    /**
     * Thanh Chọn Chế Độ 1-4 (Kèm nút Xem/Sửa Khung Câu Lệnh Hệ Thống - Fix Bug 8)
     * + Chọn Mô hình + Mức tư duy + Số từ muốn xuất (Fix Bug 9)
     */
    mountTelemetryAndModeBar() {
      const mount = document.getElementById('stage2-telemetry-mount-point');
      if (!mount) return;

      mount.innerHTML = `
        <div class="p-2.5 space-y-2 text-xs">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-end">
            
            <!-- Cột 1 (5/12): Chọn 4 Chế độ AI + Nút Xem/Sửa Khung Câu Lệnh Hệ Thống (Fix Bug 8) -->
            <div class="lg:col-span-5">
              <div class="flex items-center justify-between mb-1">
                <label class="text-[10px] font-bold uppercase text-zinc-400">
                  1. CHỌN CHẾ ĐỘ LÀM VIỆC CỦA AI:
                </label>
                <button type="button" id="btn-open-mode-system-rule-editor" class="px-2 py-0.5 rounded bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 font-bold text-[10px] transition flex items-center gap-1" title="Xem và tùy chỉnh khung câu lệnh hệ thống (System Rule & Booster) của chế độ đang chọn">
                  <span>📜 Xem & Sửa Khung Câu Lệnh Hệ Thống</span>
                </button>
              </div>
              <select id="select-ai-work-mode" class="w-full px-3 py-1.5 rounded-lg border-2 border-emerald-500/70 bg-studioLightPanel dark:bg-zinc-900 text-emerald-500 font-bold text-xs focus:outline-none">
                <option value="MODE_1_DRAFT">✍️ Chế độ 1: Viết Bản Nháp Chậm (Chi tiết tâm lý sâu, thoại: - Câu thoại (Tên))</option>
                <option value="MODE_2_ADVISOR">🧭 Chế độ 2: Tham Mưu Cốt Truyện, Phục Bút & Unreliable Narrator</option>
                <option value="MODE_3_AUDIT">🔍 Chế độ 3: Kiểm Toán Logic, Trục Giờ Giấc, Ngoại Phạm & Chính Tả</option>
                <option value="MODE_4_REVIEW">📊 Chế độ 4: Review Tổng Thể Đa Chiều & Đánh Giá Nhịp Độ Chương</option>
              </select>
            </div>

            <!-- Cột 2 (3/12): Chọn Mô Hình Gemini (Fix Bug 9) -->
            <div class="lg:col-span-3">
              <div class="flex items-center justify-between mb-1">
                <label class="text-[10px] font-bold uppercase text-zinc-400">2. MÔ HÌNH GEMINI:</label>
                <button type="button" id="btn-scan-models-from-key" class="text-[10px] font-bold text-amber-400 hover:underline">
                  🔄 Quét từ API Key
                </button>
              </div>
              <select id="select-active-gemini-model" class="w-full px-2.5 py-1.5 rounded-lg border border-studioLightBorder dark:border-zinc-700 bg-studioLightPanel dark:bg-zinc-900 font-monoCode font-semibold text-xs">
                <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview</option>
                <option value="gemini-3.1-pro-preview-customtools">gemini-3.1-pro-preview-customtools</option>
                <option value="gemini-2.5-pro">gemini-2.5-pro</option>
                <option value="gemini-2.5-flash">gemini-2.5-flash (Tốc độ cao)</option>
                <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite (Siêu tiết kiệm)</option>
              </select>
            </div>

            <!-- Cột 3 (2/12): Mức Độ Tư Duy (Thinking Level - Fix Bug 9) -->
            <div class="lg:col-span-2">
              <label class="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                3. MỨC ĐỘ TƯ DUY:
              </label>
              <select id="select-active-thinking-level" class="w-full px-2.5 py-1.5 rounded-lg border border-studioLightBorder dark:border-zinc-700 bg-studioLightPanel dark:bg-zinc-900 font-semibold text-xs">
                <option value="high">🧠 Tư Duy Cao (High - Sâu sắc)</option>
                <option value="medium">⚖️ Tư Duy Vừa (Medium - Cân bằng)</option>
                <option value="low">⚡ Tư Duy Thấp (Low - Nhanh & Nhẹ)</option>
              </select>
            </div>

            <!-- Cột 4 (2/12): Số Từ Muốn Xuất (Link trực tiếp vào System Prompt - Fix Bug 9) -->
            <div class="lg:col-span-2">
              <label class="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                4. SỐ TỪ MUỐN XUẤT:
              </label>
              <input id="input-target-word-count" type="number" min="300" max="50000" step="500" value="${this.targetWordCount}" class="w-full px-2.5 py-1.5 rounded-lg border border-emerald-500/60 bg-studioLightPanel dark:bg-zinc-900 font-monoCode font-bold text-emerald-400 text-xs" title="Số từ mong muốn này được nhúng trực tiếp vào Câu lệnh hệ thống để AI tuân thủ nghiêm ngặt" />
            </div>

          </div>

          <!-- Dòng Thực Thi Nhanh & Xem Trước Gói Ngữ Cảnh -->
          <div class="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-studioLightBorder dark:border-zinc-800">
            <div class="flex items-center gap-2 text-[11px]">
              <span class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-monoCode" id="telemetry-linked-summary">
                🔗 Đã kết nối thông số: Chế độ 1 | ${this.config.modelId} | Tư duy: ${this.thinkingLevel.toUpperCase()} | Mục tiêu: ${this.targetWordCount} từ
              </span>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" id="btn-preview-rag-payload" class="px-2.5 py-1 rounded border border-studioLightBorder dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[11px] font-medium">
                🔍 Xem Gói Ngữ Cảnh Cục Bộ
              </button>
              <button type="button" id="btn-run-primary-ai-action" class="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5">
                <span>🚀 Tổng Hợp Thông Số & Chạy Câu Lệnh AI</span>
              </button>
            </div>
          </div>
        </div>
      `;

      const modeSel = document.getElementById('select-ai-work-mode');
      const modelSel = document.getElementById('select-active-gemini-model');
      const thinkSel = document.getElementById('select-active-thinking-level');
      const wordInput = document.getElementById('input-target-word-count');

      if (modeSel) modeSel.value = this.activeModeId;
      if (modelSel) {
        if (![...modelSel.options].some((o) => o.value === this.config.modelId)) {
          const opt = document.createElement('option');
          opt.value = this.config.modelId;
          opt.textContent = this.config.modelId;
          modelSel.prepend(opt);
        }
        modelSel.value = this.config.modelId;
      }
      if (thinkSel) thinkSel.value = this.thinkingLevel;

      const updateSummaryBadge = () => {
        this.activeModeId = modeSel?.value || 'MODE_1_DRAFT';
        this.thinkingLevel = thinkSel?.value || 'high';
        this.targetWordCount = Math.max(200, parseInt(wordInput?.value || '4500', 10));
        this.saveConfig({ modelId: modelSel?.value || 'gemini-3.1-pro-preview' });

        localStorage.setItem('noir_active_ai_mode', this.activeModeId);
        localStorage.setItem('noir_thinking_level', this.thinkingLevel);
        localStorage.setItem('noir_target_word_count', String(this.targetWordCount));

        const badge = document.getElementById('telemetry-linked-summary');
        if (badge) {
          badge.textContent = `🔗 Đã liên kết: ${this.activeModeId} | Model: ${this.config.modelId} | Tư duy: ${this.thinkingLevel.toUpperCase()} | Mục tiêu: ${this.targetWordCount.toLocaleString('vi-VN')} từ`;
        }
      };

      modeSel?.addEventListener('change', updateSummaryBadge);
      modelSel?.addEventListener('change', updateSummaryBadge);
      thinkSel?.addEventListener('change', updateSummaryBadge);
      wordInput?.addEventListener('input', updateSummaryBadge);

      // Quét danh sách Model thực tế từ Google Gemini API Key của người dùng
      document.getElementById('btn-scan-models-from-key')?.addEventListener('click', async () => {
        await this.scanAvailableModelsFromKey();
      });

      // Mở cửa sổ Xem & Sửa Khung Câu Lệnh Hệ Thống (Fix Bug 8)
      document.getElementById('btn-open-mode-system-rule-editor')?.addEventListener('click', () => {
        window.StudioStage3?.modeRulesManager?.openRuleEditorModal(this.activeModeId);
      });

      // Bấm chạy câu lệnh AI -> Mở Pop-up Gemini tự động kết hợp thông số (Fix Bug 11)
      document.getElementById('btn-run-primary-ai-action')?.addEventListener('click', () => {
        window.StudioStage3?.synthesizerPopup?.openAndSynthesizePrompt();
      });

      document.getElementById('btn-preview-rag-payload')?.addEventListener('click', () => {
        window.StudioStage3?.previewContextPackageModal();
      });
    }

    async scanAvailableModelsFromKey() {
      const ALLOWED_CURRENT_MODELS = [
        { id: 'gemini-3.5-flash-lite', label: '⚡ Gemini 3.5 Flash-Lite (Mới nhất - Siêu tốc & Tiết kiệm)' },
        { id: 'gemini-3.5-flash', label: '🚀 Gemini 3.5 Flash (Hiện hành - Cân bằng)' },
        { id: 'gemini-3.1-pro-preview', label: '🧠 Gemini 3.1 Pro Preview (Hiện hành - Suy luận tâm lý sâu)' },
        { id: 'gemini-3-flash-preview', label: '✨ Gemini 3.0 Flash Preview (Hiện hành - Đa tác vụ)' },
        { id: 'gemini-2.5-pro', label: '💎 Gemini 2.5 Pro (Ổn định - Văn phong chi tiết)' },
        { id: 'gemini-2.5-flash', label: '⚡ Gemini 2.5 Flash (Ổn định - Nhanh)' }
      ];

      const sel = document.getElementById('select-active-gemini-model');
      if (sel) {
        const current = sel.value;
        sel.innerHTML = ALLOWED_CURRENT_MODELS.map(
          (m) => `<option value="${m.id}">${m.label}</option>`
        ).join('');
        if (ALLOWED_CURRENT_MODELS.some((m) => m.id === current)) {
          sel.value = current;
        } else {
          sel.value = 'gemini-3.1-pro-preview';
        }
        this.saveConfig({ modelId: sel.value });
      }
      this.core.logger.log(
        `🔄 Đã lọc và cập nhật ${ALLOWED_CURRENT_MODELS.length} mô hình văn bản Gemini hiện hành mới nhất.`,
        'SUCCESS'
      );
    }

    mountMultiStepContinuationBar() {
      const mount = document.getElementById('stage2-continuation-bar-mount');
      if (!mount) return;

      mount.innerHTML = `
        <div class="px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div class="flex items-center gap-2">
            <span id="continuation-status-text" class="text-[11px] text-zinc-400">
              Tiến độ viết: Sẵn sàng thực thi câu lệnh theo số từ mong muốn.
            </span>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" id="btn-continue-next-step" class="hidden px-3.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs pulse-continue-btn">
              ⏭️ Bấm Tiếp Để Viết Nối Chặng Tiếp Theo
            </button>
          </div>
        </div>
      `;

      document.getElementById('btn-continue-next-step')?.addEventListener('click', () => {
        window.StudioStage3?.continueNextMultiStepChunk();
      });
    }

    /**
     * FIX BUG 10: Bộ Chèn Chuyển Phân Cảnh & Đổi POV liên kết trực tiếp với Prompt tổng hợp
     */
    bindSceneBuilderModal() {
      const modal = document.getElementById('modal-scene-builder');
      const openBtn = document.getElementById('btn-open-scene-builder');
      const closeBtn = document.getElementById('btn-close-scene-modal');
      const cancelBtn = document.getElementById('btn-cancel-scene-modal');
      const confirmBtn = document.getElementById('btn-confirm-insert-scene');
      const quickTagBtn = document.getElementById('btn-insert-scene-break-tag');

      openBtn?.addEventListener('click', () => {
        this.core.controller.renderStoryBibleLists();
        modal?.classList.remove('hidden');
      });
      closeBtn?.addEventListener('click', () => modal?.classList.add('hidden'));
      cancelBtn?.addEventListener('click', () => modal?.classList.add('hidden'));

      confirmBtn?.addEventListener('click', () => {
        const time = document.getElementById('modal-scene-time')?.value.trim() || 'Chuyển cảnh tiếp theo';
        const loc = document.getElementById('modal-scene-loc')?.value.trim() || 'Không gian mới';
        const pov = document.getElementById('modal-scene-pov')?.value || 'Giữ nguyên POV hiện tại';
        const unrel = document.getElementById('modal-scene-unreliable')?.value || 'Tỉnh táo quan sát';
        const directive = document.getElementById('modal-scene-directive')?.value.trim() || 'Triển khai chi tiết nội tâm và tương tác.';

        const structuredTag = `\n[CHUYỂN PHÂN CẢNH | Giờ: ${time} | Địa điểm: ${loc} | POV: ${pov} | Tâm lý: ${unrel}]\nChỉ đạo: ${directive}\n`;

        const beatsArea = document.getElementById('textarea-chapter-beats');
        if (beatsArea) {
          const start = beatsArea.selectionStart || beatsArea.value.length;
          beatsArea.value =
            beatsArea.value.slice(0, start) +
            structuredTag +
            beatsArea.value.slice(start);
          this.core.controller.syncActiveEditorFieldsToChapterObject();
        }

        // Đồng bộ lên thanh POV hiện tại nếu người dùng chọn nhân vật cụ thể
        if (pov && pov !== 'Giữ nguyên POV hiện tại') {
          const mainPovSel = document.getElementById('select-scene-pov');
          if (mainPovSel) mainPovSel.value = pov;
        }
        const mainTimeInput = document.getElementById('input-scene-timestamp');
        if (mainTimeInput && !mainTimeInput.value.trim()) {
          mainTimeInput.value = time;
        }
        const mainLocInput = document.getElementById('input-scene-location');
        if (mainLocInput && !mainLocInput.value.trim()) {
          mainLocInput.value = loc;
        }

        modal?.classList.add('hidden');
        this.core.logger.log(
          `🎬 Đã chèn mốc chuyển phân cảnh (${time} - POV: ${pov}) và liên kết trực tiếp vào Prompt!`,
          'SUCCESS'
        );
      });

      quickTagBtn?.addEventListener('click', () => {
        const beatsArea = document.getElementById('textarea-chapter-beats');
        if (!beatsArea) return;
        const curPov = document.getElementById('select-scene-pov')?.value || 'Giữ nguyên POV';
        const curTime = document.getElementById('input-scene-timestamp')?.value || 'Mốc giờ mới';
        const curLoc = document.getElementById('input-scene-location')?.value || 'Hiện trường';
        const tag = `\n[CHUYỂN PHÂN CẢNH | Giờ: ${curTime} | Địa điểm: ${curLoc} | POV: ${curPov} | Tâm lý: Tỉnh táo quan sát]\nChỉ đạo: `;
        const pos = beatsArea.selectionStart || beatsArea.value.length;
        beatsArea.value = beatsArea.value.slice(0, pos) + tag + beatsArea.value.slice(pos);
        beatsArea.focus();
      });
    }

    bindScratchpadDrawer() {
      const drawer = document.getElementById('scratchpad-drawer');
      document.getElementById('btn-open-scratchpad')?.addEventListener('click', () => {
        drawer?.classList.toggle('hidden');
        this.renderScratchpadList();
      });
      document.getElementById('btn-close-scratchpad')?.addEventListener('click', () => {
        drawer?.classList.add('hidden');
      });
      document.getElementById('btn-add-scratchpad-item')?.addEventListener('click', () => {
        const tag = document.getElementById('scratchpad-tag-select')?.value || '#Ý_Tưởng';
        const title = document.getElementById('scratchpad-title-input')?.value.trim() || 'Ghi chú nhanh';
        const content = document.getElementById('scratchpad-content-input')?.value.trim() || '';
        if (!content) return;
        this.scratchpadItems.unshift({
          id: `idea_${Date.now()}`,
          tag,
          title,
          content,
          createdAt: new Date().toLocaleTimeString('vi-VN', { hour12: false })
        });
        document.getElementById('scratchpad-content-input').value = '';
        this.saveScratchpad();
        this.renderScratchpadList();
      });
      document.getElementById('scratchpad-search-input')?.addEventListener('input', () => {
        this.renderScratchpadList();
      });
      this.renderScratchpadList();
    }

    renderScratchpadList() {
      const badge = document.getElementById('badge-scratchpad-count');
      if (badge) badge.textContent = String(this.scratchpadItems.length);
      const box = document.getElementById('scratchpad-items-container');
      if (!box) return;
      const q = (document.getElementById('scratchpad-search-input')?.value || '').toLowerCase();
      const filtered = this.scratchpadItems.filter(
        (i) => !q || i.title.toLowerCase().includes(q) || i.content.toLowerCase().includes(q)
      );
      box.innerHTML = filtered
        .map(
          (item) => `
          <div class="p-2.5 rounded-lg border border-studioLightBorder dark:border-zinc-800 bg-studioLightBg dark:bg-zinc-950 space-y-1">
            <div class="flex justify-between items-center text-[10px]">
              <span class="font-bold text-amber-500">${item.tag} • ${item.title}</span>
              <button type="button" data-del-idea="${item.id}" class="text-red-400 hover:underline">Xóa</button>
            </div>
            <p class="text-xs select-text whitespace-pre-wrap">${item.content}</p>
          </div>
        `
        )
        .join('');

      box.querySelectorAll('[data-del-idea]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-del-idea');
          this.scratchpadItems = this.scratchpadItems.filter((i) => i.id !== id);
          this.saveScratchpad();
          this.renderScratchpadList();
        });
      });
    }

    bindAISettingsModal() {
      const modal = document.getElementById('modal-ai-settings');
      document.getElementById('btn-open-ai-settings')?.addEventListener('click', () => {
        const keyInput = document.getElementById('input-gemini-api-key');
        const modelInput = document.getElementById('input-gemini-model-id');
        if (keyInput) {
          keyInput.type = 'password'; // Mặc định luôn ẩn key API (Fix Bug 1)
          keyInput.value = this.config.apiKey || '';
        }
        if (modelInput) modelInput.value = this.config.modelId || 'gemini-3.1-pro-preview';
        modal?.classList.remove('hidden');
      });
      document.getElementById('btn-close-ai-settings')?.addEventListener('click', () => {
        modal?.classList.add('hidden');
      });
      document.getElementById('btn-save-ai-settings')?.addEventListener('click', () => {
        const apiKey = document.getElementById('input-gemini-api-key')?.value.trim() || '';
        const modelId = document.getElementById('input-gemini-model-id')?.value.trim() || 'gemini-3.1-pro-preview';
        const maxWordsPerStep = parseInt(document.getElementById('input-max-words-per-step')?.value || '4000', 10);
        const ragTopK = parseInt(document.getElementById('input-rag-topk')?.value || '8', 10);
        this.saveConfig({ apiKey, modelId, maxWordsPerStep, ragTopK });
        modal?.classList.add('hidden');
        this.core.logger.log('⚙️ Đã lưu cấu hình Gemini API Key & Model.', 'SUCCESS');
      });
    }
  }

  // ==========================================================================
  // MODULE 10: QUẢN LÝ RULE HỆ THỐNG 4 CHẾ ĐỘ (FIX BUG 8) & POP-UP GEMINI
  //            TỰ ĐỘNG TỔNG HỢP THÔNG SỐ CÂU LỆNH (FIX BUG 11)
  // ==========================================================================
  const DEFAULT_FOUR_MODES_RULES = {
    MODE_1_DRAFT: {
      name: '✍️ Chế độ 1: Viết Bản Nháp Chậm (Slow-Burn Novel Drafting)',
      systemRule: `Bạn là Tiểu thuyết gia Tâm lý Đô thị & Light Novel bậc thầy.
NHIỆM VỤ CỐT LÕI: Viết bản thảo tiểu thuyết chi tiết, nhịp độ chậm (Slow-burn), đào sâu nội tâm, 5 giác quan và không khí bối cảnh.
QUY TẮC BẮT BUỘC:
1. SỐ TỪ MỤC TIÊU: Phải triển khai đầy đủ độ dài khoảng {{TARGET_WORD_COUNT}} từ. Tuyệt đối không tóm tắt gộp hay cắt ngắn tình tiết.
2. QUY ƯỚC LỜI THOẠI BẮT BUỘC 100%: Mọi câu thoại phải viết trên một dòng riêng theo đúng định dạng:
- Câu thoại của nhân vật (Tên nhân vật)
Ví dụ: - Trời mưa lớn quá, chúng ta vào hiên trú tạm đi (Đăng)
3. CẤM TUYỆT ĐỐI: Không dùng danh sách dấu chấm đầu dòng (bullet points) trong văn xuôi tiểu thuyết, không dùng tiêu đề phụ markdown, không dùng các cụm từ sáo rỗng bị cấm.`,
      boosterPrompt: `[LỆNH TĂNG CƯỜNG CHẾ ĐỘ 1 - VIẾT BẢN NHÁP CHẬM]: Hãy đi thật chậm qua từng khoảnh khắc thời gian, miêu tả vi biểu cảm, nhịp thở, ánh sáng, âm thanh nền và sự giằng xé nội tâm theo đúng góc nhìn POV đã chọn để đạt mốc {{TARGET_WORD_COUNT}} từ.`
    },
    MODE_2_ADVISOR: {
      name: '🧭 Chế độ 2: Tham Mưu Cốt Truyện, Phục Bút & Unreliable Narrator',
      systemRule: `Bạn là Kiến trúc sư Cốt truyện & Chuyên gia Tâm lý học Tội phạm / Đô thị.
NHIỆM VỤ CỐT LÕI: Phân tích ý tưởng của tác giả và thiết kế các phương án triển khai cốt truyện, cài cắm phục bút (Chekhov's Gun), bẻ lái nhận thức (Plot Twist) và khai thác cơ chế Người kể chuyện không đáng tin (Unreliable Narrator).
QUY TẮC BẮT BUỘC:
1. Độ dài phân tích và đề xuất kịch bản: Khoảng {{TARGET_WORD_COUNT}} từ.
2. Đưa ra ít nhất 3 phương án phát triển tình tiết từ an toàn đến đột phá tâm lý sâu.
3. Chỉ rõ cách che giấu manh mối trong lời thoại và hành động của nhân vật POV hiện tại.`,
      boosterPrompt: `[LỆNH TĂNG CƯỜNG CHẾ ĐỘ 2 - THAM MƯU CỐT TRUYỆN]: Hãy đối chiếu chặt chẽ với Ma trận Ai Biết Gì và Sổ cái Phục bút trong Story Bible để tư vấn hướng đi bất ngờ nhưng hợp lý tuyệt đối về mặt tâm lý.`
    },
    MODE_3_AUDIT: {
      name: '🔍 Chế độ 3: Kiểm Toán Logic, Trục Giờ Giấc, Ngoại Phạm & Chính Tả',
      systemRule: `Bạn là Kiểm toán viên Logic Cốt truyện & Biên tập viên Ngữ pháp khắt khe.
NHIỆM VỤ CỐT LÕI: Rà soát toàn diện bản thảo hiện tại so với các chương đã duyệt và Story Bible để phát hiện:
1. Mâu thuẫn trục thời gian (giờ giấc di chuyển, chứng cứ ngoại phạm, thời tiết).
2. Lỗi rò rỉ thông tin (Nhân vật POV nói hoặc nghĩ về điều mà họ chưa thể biết ở thời điểm đó).
3. Lỗi lệch tính cách nhân vật (OOC), lỗi chính tả tiếng Việt, lỗi sai quy ước lời thoại "- Câu thoại (Tên)" và từ ngữ sáo rỗng.
4. Xuất báo cáo kiểm toán chi tiết khoảng {{TARGET_WORD_COUNT}} từ kèm phương án sửa trực tiếp từng câu lỗi.`,
      boosterPrompt: `[LỆNH TĂNG CƯỜNG CHẾ ĐỘ 3 - KIỂM TOÁN LOGIC]: Hãy soi kỹ từng mốc giờ, địa điểm chuyển cảnh và kiểm tra chéo với dữ liệu các chương trước để tìm ra mọi hạt sạn logic dù nhỏ nhất.`
    },
    MODE_4_REVIEW: {
      name: '📊 Chế độ 4: Review Tổng Thể Đa Chiều & Đánh Giá Nhịp Độ Chương',
      systemRule: `Bạn là Nhà Phê bình Văn học & Biên tập viên Xuất bản Tiểu thuyết Chuyên nghiệp.
NHIỆM VỤ CỐT LÕI: Đánh giá toàn diện chương truyện vừa viết dưới góc nhìn độc giả và biên tập viên:
1. Chấm điểm chi tiết (Thang điểm 10) về: Chiều sâu tâm lý, Nhịp độ (Pacing), Sức nặng lời thoại, Không khí bối cảnh và Sức hút cuối chương (Cliffhanger).
2. Phân tích những đoạn đắt giá nhất và những đoạn đang bị trôi nhanh hoặc thiếu cảm xúc giác quan.
3. Đề xuất bản viết lại mẫu cho các đoạn cần nâng cấp trong phạm vi khoảng {{TARGET_WORD_COUNT}} từ.`,
      boosterPrompt: `[LỆNH TĂNG CƯỜNG CHẾ ĐỘ 4 - REVIEW ĐA CHIỀU]: Hãy nhận xét thẳng thắn, sâu sắc, chỉ rõ từng dòng cần bồi đắp thêm nội tâm hoặc cắt tỉa cho sắc sảo hơn.`
    }
  };

  class EditableModeSystemRulesManager {
    constructor(core, stage2) {
      this.core = core;
      this.stage2 = stage2;
      this.rulesMap = this.loadRulesMap();
      this.injectRuleEditorModal();
    }

    loadRulesMap() {
      try {
        const saved = JSON.parse(localStorage.getItem('noir_s15_custom_mode_rules') || '{}');
        const merged = {};
        for (const key of Object.keys(DEFAULT_FOUR_MODES_RULES)) {
          merged[key] = {
            ...DEFAULT_FOUR_MODES_RULES[key],
            ...(saved[key] || {})
          };
        }
        return merged;
      } catch (_) {
        return JSON.parse(JSON.stringify(DEFAULT_FOUR_MODES_RULES));
      }
    }

    saveRulesMap() {
      localStorage.setItem('noir_s15_custom_mode_rules', JSON.stringify(this.rulesMap));
    }

    getRuleForMode(modeId, targetWords = 4500) {
      const entry = this.rulesMap[modeId] || this.rulesMap.MODE_1_DRAFT;
      const wStr = String(targetWords || 4500);
      return {
        name: entry.name,
        systemRule: entry.systemRule.replace(/\{\{TARGET_WORD_COUNT\}\}/g, wStr),
        boosterPrompt: entry.boosterPrompt.replace(/\{\{TARGET_WORD_COUNT\}\}/g, wStr),
        rawSystemRule: entry.systemRule,
        rawBoosterPrompt: entry.boosterPrompt
      };
    }

    /**
     * FIX BUG 8: Cửa sổ Xem & Tùy chỉnh Khung Câu Lệnh Hệ Thống + Câu Lệnh Tăng Cường cho từng chế độ 1-4
     * Có nút Sửa và hộp thoại Xác nhận Đồng ý / Không trước khi lưu
     */
    injectRuleEditorModal() {
      if (document.getElementById('modal-mode-system-rule-editor')) return;

      const modal = document.createElement('div');
      modal.id = 'modal-mode-system-rule-editor';
      modal.className =
        'hidden fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm select-none';

      modal.innerHTML = `
        <div class="w-full max-w-3xl rounded-2xl border-2 border-emerald-500/50 bg-studioLightPanel dark:bg-zinc-900 shadow-2xl overflow-hidden text-xs flex flex-col max-h-[90vh]">
          <div class="px-5 py-3.5 border-b border-studioLightBorder dark:border-zinc-800 bg-emerald-600/15 flex items-center justify-between">
            <div>
              <h3 class="font-bold uppercase text-sm text-emerald-400">
                📜 KHUNG CÂU LỆNH HỆ THỐNG & LỆNH TĂNG CƯỜNG (4 CHẾ ĐỘ AI)
              </h3>
              <p class="text-[11px] text-zinc-400">
                Biến <code class="text-amber-400">{{TARGET_WORD_COUNT}}</code> sẽ tự động được thay bằng Số từ muốn xuất mà bạn nhập.
              </p>
            </div>
            <button type="button" id="btn-close-mode-rule-modal" class="px-2.5 py-1 rounded hover:bg-zinc-800 font-bold">✕</button>
          </div>

          <div class="p-5 space-y-4 overflow-y-auto flex-1">
            <div>
              <label class="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                Chọn Chế Độ Để Xem Hoặc Tùy Chỉnh Rule:
              </label>
              <select id="modal-rule-mode-selector" class="w-full px-3 py-2 rounded-xl border border-emerald-500/50 bg-studioLightBg dark:bg-zinc-950 font-bold text-emerald-400 text-xs">
                <option value="MODE_1_DRAFT">✍️ Chế độ 1: Viết Bản Nháp Chậm</option>
                <option value="MODE_2_ADVISOR">🧭 Chế độ 2: Tham Mưu Cốt Truyện & Phục Bút</option>
                <option value="MODE_3_AUDIT">🔍 Chế độ 3: Kiểm Toán Logic & Chính Tả</option>
                <option value="MODE_4_REVIEW">📊 Chế độ 4: Review Tổng Thể Đa Chiều</option>
              </select>
            </div>

            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="text-[10px] font-bold uppercase text-emerald-400">
                  1. Khung Câu Lệnh Hệ Thống Cốt Lõi (System Instruction Rule):
                </label>
                <button type="button" id="btn-reset-default-mode-rule" class="text-[10px] text-zinc-400 hover:text-amber-400 underline">
                  Khôi phục mặc định chế độ này
                </button>
              </div>
              <textarea id="textarea-mode-system-rule" rows="8" class="w-full p-3 rounded-xl border border-studioLightBorder dark:border-zinc-700 bg-studioLightBg dark:bg-zinc-950 font-monoCode text-xs leading-relaxed select-text focus:outline-none focus:border-emerald-500"></textarea>
            </div>

            <div>
              <label class="block text-[10px] font-bold uppercase text-amber-400 mb-1">
                2. Câu Lệnh Tăng Cường Chuyên Biệt Cho Chế Độ Này (Mode Booster Prompt):
              </label>
              <textarea id="textarea-mode-booster-rule" rows="3" class="w-full p-3 rounded-xl border border-amber-500/40 bg-studioLightBg dark:bg-zinc-950 font-monoCode text-xs leading-relaxed select-text focus:outline-none focus:border-amber-500"></textarea>
            </div>
          </div>

          <div class="px-5 py-3.5 border-t border-studioLightBorder dark:border-zinc-800 bg-studioLightBg dark:bg-zinc-950 flex items-center justify-end gap-2.5">
            <button type="button" id="btn-cancel-mode-rule-modal" class="px-4 py-2 rounded-xl border border-studioLightBorder dark:border-zinc-700 hover:bg-zinc-800 font-semibold">
              Hủy
            </button>
            <button type="button" id="btn-save-mode-rule-confirm" class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg transition">
              ✏️ Sửa & Lưu Câu Lệnh Hệ Thống
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      const modeSel = document.getElementById('modal-rule-mode-selector');
      const sysArea = document.getElementById('textarea-mode-system-rule');
      const boostArea = document.getElementById('textarea-mode-booster-rule');

      const loadSelectedModeIntoFields = (mId) => {
        const entry = this.rulesMap[mId] || this.rulesMap.MODE_1_DRAFT;
        if (sysArea) sysArea.value = entry.systemRule;
        if (boostArea) boostArea.value = entry.boosterPrompt;
      };

      modeSel?.addEventListener('change', () => {
        loadSelectedModeIntoFields(modeSel.value);
      });

      document.getElementById('btn-reset-default-mode-rule')?.addEventListener('click', () => {
        const mId = modeSel.value;
        const def = DEFAULT_FOUR_MODES_RULES[mId];
        if (def && confirm('Khôi phục câu lệnh hệ thống mặc định cho chế độ này?')) {
          sysArea.value = def.systemRule;
          boostArea.value = def.boosterPrompt;
        }
      });

      document.getElementById('btn-close-mode-rule-modal')?.addEventListener('click', () => {
        modal.classList.add('hidden');
      });
      document.getElementById('btn-cancel-mode-rule-modal')?.addEventListener('click', () => {
        modal.classList.add('hidden');
      });

      // FIX BUG 8: Bấm nút Sửa -> Hiện xác nhận Đồng ý hay không -> Lưu và áp dụng ngay
      document.getElementById('btn-save-mode-rule-confirm')?.addEventListener('click', () => {
        const mId = modeSel.value;
        const modeTitle = this.rulesMap[mId]?.name || mId;
        const isAgreed = confirm(
          `XÁC NHẬN CẬP NHẬT RULE HỆ THỐNG:\nBạn có đồng ý lưu thay đổi khung câu lệnh hệ thống và lệnh tăng cường cho [${modeTitle}] không?`
        );
        if (!isAgreed) return;

        this.rulesMap[mId] = {
          ...this.rulesMap[mId],
          systemRule: sysArea.value.trim(),
          boosterPrompt: boostArea.value.trim()
        };
        this.saveRulesMap();
        modal.classList.add('hidden');
        this.core.logger.log(
          `📜 Đã cập nhật Khung câu lệnh hệ thống cho ${modeTitle}.`,
          'SUCCESS'
        );
      });
    }

    openRuleEditorModal(defaultModeId = 'MODE_1_DRAFT') {
      const modal = document.getElementById('modal-mode-system-rule-editor');
      const modeSel = document.getElementById('modal-rule-mode-selector');
      if (!modal || !modeSel) return;
      modeSel.value = defaultModeId || this.stage2.activeModeId || 'MODE_1_DRAFT';
      modeSel.dispatchEvent(new Event('change'));
      modal.classList.remove('hidden');
    }
  }

  // ==========================================================================
  // FIX BUG 11: MÀN HÌNH POP-UP GEMINI TỰ ĐỘNG KẾT HỢP CÁC THÔNG SỐ CÂU LỆNH
  // (Sử dụng Flash-Medium theo API Key người dùng, hết hạn mức tự về Flash-Lite)
  // ==========================================================================
  class GeminiPromptSynthesizerPopup {
    constructor(core, stage2, modeRulesManager, geminiClient) {
      this.core = core;
      this.stage2 = stage2;
      this.modeRulesManager = modeRulesManager;
      this.geminiClient = geminiClient;
      this.lastSynthesizedPayload = null;
      this.injectSynthesizerModal();
    }

    injectSynthesizerModal() {
      if (document.getElementById('modal-bug11-prompt-synthesizer')) return;

      const modal = document.createElement('div');
      modal.id = 'modal-bug11-prompt-synthesizer';
      modal.className =
        'hidden fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-sm select-none';

      modal.innerHTML = `
        <div class="w-full max-w-4xl rounded-2xl border-2 border-emerald-500/60 bg-studioLightPanel dark:bg-zinc-900 shadow-2xl overflow-hidden text-xs flex flex-col max-h-[92vh]">
          
          <!-- Header -->
          <div class="px-5 py-3.5 border-b border-studioLightBorder dark:border-zinc-800 bg-emerald-600/15 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div id="bug11-synth-spinner" class="w-4 h-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin"></div>
              <div>
                <h3 id="bug11-synth-title" class="font-bold uppercase text-sm text-emerald-400">
                  🧠 GEMINI ĐANG KẾT HỢP CÁC THÔNG SỐ CÂU LỆNH CỦA BẠN...
                </h3>
                <p id="bug11-synth-subtitle" class="text-[11px] text-zinc-400">
                  Đang tự động hợp nhất: Chế độ làm việc + Số từ mong muốn + Góc nhìn POV + Mốc chuyển cảnh + Câu lệnh cá nhân
                </p>
              </div>
            </div>
            <button type="button" id="btn-close-bug11-synth" class="px-2.5 py-1 rounded hover:bg-zinc-800 font-bold">✕</button>
          </div>

          <!-- Thẻ Tóm Tắt Thông Số Đã Liên Kết (Bug 8, 9, 10, 11) -->
          <div id="bug11-parameter-chips" class="px-5 py-2.5 bg-zinc-950/70 border-b border-zinc-800 flex flex-wrap items-center gap-2 text-[11px] font-monoCode"></div>

          <!-- Nội dung Prompt Tổng Hợp (Cho phép kiểm tra/chỉnh sửa trước khi xác nhận chạy) -->
          <div class="p-5 space-y-3 overflow-y-auto flex-1">
            <div class="flex items-center justify-between">
              <label class="text-[11px] font-bold uppercase text-amber-400">
                ✨ Bản Prompt Tổng Hợp Hoàn Chỉnh (Được Gemini Flash kết hợp tự động từ mọi thông số của bạn):
              </label>
              <span id="bug11-synth-model-used" class="text-[10px] font-monoCode text-emerald-400"></span>
            </div>
            <textarea id="textarea-bug11-synthesized-prompt" rows="13" class="w-full p-3.5 rounded-xl border border-emerald-500/40 bg-studioLightBg dark:bg-zinc-950 font-monoCode text-xs leading-relaxed select-text focus:outline-none focus:border-emerald-500"></textarea>
          </div>

          <!-- Footer Xác Nhận Chạy -->
          <div class="px-5 py-3.5 border-t border-studioLightBorder dark:border-zinc-800 bg-studioLightBg dark:bg-zinc-950 flex flex-wrap items-center justify-between gap-2">
            <span class="text-[11px] text-zinc-400">
              Kiểm tra bản Prompt tổng hợp bên trên rồi bấm <b>Xác Nhận</b> để chạy câu lệnh chính.
            </span>
            <div class="flex items-center gap-2">
              <button type="button" id="btn-cancel-bug11-synth" class="px-4 py-2 rounded-xl border border-studioLightBorder dark:border-zinc-700 hover:bg-zinc-800 font-semibold">
                Hủy Bỏ
              </button>
              <button type="button" id="btn-confirm-run-synthesized-prompt" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg transition flex items-center gap-1.5">
                <span>🚀 Xác Nhận & Chạy Prompt Tổng Hợp Ngay</span>
              </button>
            </div>
          </div>

        </div>
      `;

      document.body.appendChild(modal);

      document.getElementById('btn-close-bug11-synth')?.addEventListener('click', () => {
        modal.classList.add('hidden');
      });
      document.getElementById('btn-cancel-bug11-synth')?.addEventListener('click', () => {
        modal.classList.add('hidden');
      });

      document.getElementById('btn-confirm-run-synthesized-prompt')?.addEventListener('click', async () => {
        const finalUserPrompt = document.getElementById('textarea-bug11-synthesized-prompt')?.value || '';
        if (!finalUserPrompt.trim() || !this.lastSynthesizedPayload) return;
        modal.classList.add('hidden');

        await window.StudioStage3.executeConfirmedSynthesizedPrompt({
          ...this.lastSynthesizedPayload,
          synthesizedUserPrompt: finalUserPrompt
        });
      });
    }

    /**
     * Thu thập toàn bộ thông số (Chế độ 1-4, Số từ, Model, Mức tư duy, POV, Bối cảnh, Mốc chuyển cảnh, Câu lệnh cá nhân)
     * và gọi thực tế Gemini Flash (Medium) -> tự động hạ về Flash-Lite nếu hết hạn mức để tổng hợp Prompt!
     */
    async openAndSynthesizePrompt(customUserPromptText = null) {
      this.core.controller.syncActiveEditorFieldsToChapterObject();
      const apiKey = (
        this.stage2.config.apiKey ||
        localStorage.getItem('noir_gemini_api_key') ||
        ''
      ).trim();

      if (!apiKey) {
        alert('⚠️ Bạn chưa có Gemini API Key hợp lệ! Vui lòng nhập API Key trước khi chạy.');
        return;
      }

      const modeId =
        document.getElementById('select-ai-work-mode')?.value ||
        this.stage2.activeModeId ||
        'MODE_1_DRAFT';
      const selectedModel =
        document.getElementById('select-active-gemini-model')?.value ||
        this.stage2.config.modelId ||
        'gemini-3.1-pro-preview';
      const thinkingLevel =
        document.getElementById('select-active-thinking-level')?.value ||
        this.stage2.thinkingLevel ||
        'high';
      const targetWordCount = Math.max(
        200,
        parseInt(
          document.getElementById('input-target-word-count')?.value ||
            String(this.stage2.targetWordCount || 4500),
          10
        )
      );

      const chap = this.core.approvalGate.getActiveChapter();
      const povChar =
        document.getElementById('select-scene-pov')?.value ||
        chap?.povCharacter ||
        'Đa điểm nhìn / Tự động';
      const povRel =
        document.getElementById('select-pov-reliability')?.value ||
        chap?.povReliability ||
        'reliable';
      const sceneTime =
        document.getElementById('input-scene-timestamp')?.value.trim() ||
        chap?.timelineTimestamp ||
        'Tiếp nối mạch thời gian hiện tại';
      const sceneLoc =
        document.getElementById('input-scene-location')?.value.trim() ||
        chap?.location ||
        'Theo diễn biến chương';

      const userRawBeats =
        customUserPromptText !== null
          ? customUserPromptText
          : document.getElementById('textarea-chapter-beats')?.value.trim() || '';

      const sceneDirectives = this.stage2.extractSceneTransitionDirectives(userRawBeats);
      const modeRuleObj = this.modeRulesManager.getRuleForMode(modeId, targetWordCount);

      // Hiển thị Modal Pop-up ngay lập tức
      const modal = document.getElementById('modal-bug11-prompt-synthesizer');
      const spinner = document.getElementById('bug11-synth-spinner');
      const titleEl = document.getElementById('bug11-synth-title');
      const subEl = document.getElementById('bug11-synth-subtitle');
      const chipsEl = document.getElementById('bug11-parameter-chips');
      const promptArea = document.getElementById('textarea-bug11-synthesized-prompt');
      const modelUsedEl = document.getElementById('bug11-synth-model-used');
      const confirmBtn = document.getElementById('btn-confirm-run-synthesized-prompt');

      if (!modal || !promptArea) return;
      modal.classList.remove('hidden');
      spinner?.classList.remove('hidden');
      if (confirmBtn) confirmBtn.disabled = true;

      if (titleEl) {
        titleEl.textContent = '🧠 GEMINI ĐANG KẾT HỢP CÁC THÔNG SỐ CÂU LỆNH CỦA BẠN...';
      }
      if (subEl) {
        subEl.textContent =
          'Đang chạy mô hình Flash (Tư duy Trung bình, tự động hạ về Flash-Lite nếu hết hạn mức) để tổng hợp mọi thông số...';
      }

      if (chipsEl) {
        chipsEl.innerHTML = `
          <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Chế độ: ${modeRuleObj.name}</span>
          <span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">Số từ đích: ${targetWordCount.toLocaleString('vi-VN')} từ</span>
          <span class="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">POV: ${povChar} (${povRel})</span>
          <span class="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300">Giờ & Bối cảnh: ${sceneTime} @ ${sceneLoc}</span>
          <span class="px-2 py-0.5 rounded bg-pink-500/20 text-pink-300">Mốc chuyển cảnh: ${sceneDirectives.length} mốc</span>
          <span class="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">Model chạy chính: ${selectedModel} (${thinkingLevel.toUpperCase()})</span>
        `;
      }

      promptArea.value = '⏳ Gemini đang tự động tổng hợp các thông số câu lệnh của bạn...';

      // Khung dữ liệu nền gửi cho Gemini Flash tổng hợp
      const rawStructuredDraft = [
        `=== 1. MỤC TIÊU CHẾ ĐỘ & LỆNH TĂNG CƯỜNG ===`,
        `- Chế độ thực thi: ${modeRuleObj.name}`,
        `- Định hướng tăng cường: ${modeRuleObj.boosterPrompt}`,
        `- Yêu cầu độ dài bắt buộc: Khoảng ${targetWordCount} từ (Triển khai kỹ lưỡng, không cắt ngắn).`,
        `- Quy ước trình bày lời thoại bắt buộc: - Câu thoại (Tên nhân vật)`,
        ``,
        `=== 2. THÔNG SỐ GÓC NHÌN (POV), GIỜ GIẤC & BỐI CẢNH HIỆN TẠI ===`,
        `- Chương hiện tại: #${chap?.chapterNumber || 1} - ${chap?.displayTitle || chap?.title || ''}`,
        `- Mốc thời gian trong truyện: ${sceneTime}`,
        `- Địa điểm / Hiện trường: ${sceneLoc}`,
        `- Nhân vật nắm giữ góc nhìn (POV): ${povChar}`,
        `- Trạng thái nhận thức POV (Unreliable Narrator): ${povRel}`,
        ``,
        `=== 3. CÁC MỐC CHÈN CHUYỂN ĐỔI PHÂN CẢNH & ĐỔI POV (${sceneDirectives.length} mốc) ===`,
        sceneDirectives.length > 0
          ? sceneDirectives
              .map(
                (s) =>
                  `• Phân cảnh #${s.index}: [Giờ: ${s.time}] [Địa điểm: ${s.location}] [Chuyển POV sang: ${s.pov}] [Tâm lý: ${s.unreliableState}] -> Chỉ đạo: ${s.directive}`
              )
              .join('\n')
          : '• Giữ mạch phân cảnh liền mạch theo khung bối cảnh chung.',
        ``,
        `=== 4. Ý TƯỞNG & CÂU LỆNH CÁ NHÂN CỦA TÁC GIẢ ===`,
        userRawBeats || '(Tác giả yêu cầu triển khai tiếp nối tự nhiên từ mạch truyện và Story Bible hiện tại).'
      ].join('\n');

      // Gọi thực tế Gemini Flash (Medium) -> tự động về Flash-Lite (Low) nếu hết hạn mức
      let synthesizedPromptText = rawStructuredDraft;
      let usedSynthModel = 'Tổng hợp cục bộ';

      const synthChain = [
        { model: 'gemini-2.5-flash', thinking: 'medium' },
        { model: 'gemini-3-flash-preview', thinking: 'medium' },
        { model: 'gemini-3.5-flash-lite', thinking: 'low' },
        { model: 'gemini-2.0-flash-lite', thinking: 'low' }
      ];

      const synthInstruction = `Bạn là Bộ Tổng Hợp Prompt Thông Minh (Prompt Synthesizer) cho hệ thống sáng tác tiểu thuyết.
Nhiệm vụ của bạn: Kết hợp toàn bộ thông số kỹ thuật (Chế độ làm việc, Số từ mong muốn = ${targetWordCount} từ, Nhân vật POV = ${povChar}, Trạng thái tâm lý = ${povRel}, Mốc giờ = ${sceneTime}, Địa điểm = ${sceneLoc}, các Mốc chuyển phân cảnh và Câu lệnh cá nhân của tác giả) thành MỘT BẢN CHỈ ĐẠO PROMPT TỔNG HỢP mạch lạc, rõ ràng, thống nhất bằng tiếng Việt để gửi cho mô hình viết chính.
Yêu cầu tuyệt đối:
- Không tự viết nội dung truyện ở bước này; chỉ xuất ra bản Prompt Chỉ Đạo Tổng Hợp đã được tối ưu hóa.
- Giữ nguyên 100% mọi mốc giờ, tên nhân vật, mốc chuyển phân cảnh, yêu cầu ${targetWordCount} từ và quy ước thoại "- Câu thoại (Tên nhân vật)".`;

      for (const candidate of synthChain) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
            candidate.model
          )}:generateContent?key=${encodeURIComponent(apiKey)}`;

          const body = {
            systemInstruction: { parts: [{ text: synthInstruction }] },
            contents: [{ role: 'user', parts: [{ text: rawStructuredDraft }] }],
            generationConfig: {
              temperature: 0.25,
              maxOutputTokens: 4096
            }
          };

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });

          if (res.ok) {
            const data = await res.json();
            const parts = data?.candidates?.[0]?.content?.parts || [];
            const txt = parts
              .filter((p) => !p.thought && typeof p.text === 'string')
              .map((p) => p.text)
              .join('\n')
              .trim();
            if (txt && txt.length > 80) {
              synthesizedPromptText = txt;
              usedSynthModel = `Đã kết hợp tự động bằng ${candidate.model} (Tư duy: ${candidate.thinking.toUpperCase()})`;
              break;
            }
          }
        } catch (_) {
          // Tự động chuyển xuống Flash-Lite tiếp theo trong chuỗi nếu lỗi hoặc chạm hạn mức
        }
      }

      spinner?.classList.add('hidden');
      if (titleEl) {
        titleEl.textContent = '✅ ĐÃ TỔNG HỢP XONG CÂU LỆNH TỪ MỌI THÔNG SỐ CỦA BẠN!';
      }
      if (subEl) {
        subEl.textContent =
          'Bạn có thể xem lại hoặc chỉnh sửa trực tiếp bên dưới rồi bấm nút Xác nhận để chạy mượt mà.';
      }
      if (modelUsedEl) modelUsedEl.textContent = usedSynthModel;
      promptArea.value = synthesizedPromptText;
      if (confirmBtn) confirmBtn.disabled = false;

      this.lastSynthesizedPayload = {
        apiKey,
        modeId,
        selectedModel,
        thinkingLevel,
        targetWordCount,
        systemInstruction: modeRuleObj.systemRule,
        boosterPrompt: modeRuleObj.boosterPrompt,
        povChar,
        sceneTime,
        sceneLoc
      };
    }
  }

  // ==========================================================================
  // ĐỘNG CƠ GỌI GEMINI API CHÍNH + LIVE SSE STREAMING + HẬU XỬ LÝ THOẠI
  // ==========================================================================
  class UnifiedGeminiClientAndModesEngine {
    constructor(core, stage2) {
      this.core = core;
      this.stage2 = stage2;
      this.modeRulesManager = new EditableModeSystemRulesManager(core, stage2);
      this.synthesizerPopup = new GeminiPromptSynthesizerPopup(
        core,
        stage2,
        this.modeRulesManager,
        this
      );
      this.activeAbortController = null;
      this.enableLiveStreaming = true;
    }

    /**
     * Chuẩn hóa mọi dạng lời thoại về đúng quy ước: - Câu thoại (Tên nhân vật)
     * và xóa sạch các dấu bullet của AI
     */
    cleanAndEnforceDialogueConvention(rawText, defaultSpeaker = '') {
      if (!rawText) return '';
      const lines = String(rawText).replace(/\r\n/g, '\n').split('\n');
      const cleanedLines = [];

      for (let rawLine of lines) {
        let line = rawLine.trim();
        if (!line) {
          cleanedLines.push('');
          continue;
        }

        // Khử dấu bullet đầu dòng (* , • )
        line = line.replace(/^[*•]\s+/, '');

        // Chuyển đổi dạng: Tên: "Câu thoại" -> - Câu thoại (Tên)
        const colonQuoteMatch = line.match(
          /^([A-ZÀ-Ỹ][a-zA-ZÀ-ỹ\s]{0,20}):\s*["“](.+?)["”]$/
        );
        if (colonQuoteMatch) {
          line = `- ${colonQuoteMatch[2].trim()} (${colonQuoteMatch[1].trim()})`;
        }

        // Chuyển đổi dạng: "Câu thoại" - Tên nói -> - Câu thoại (Tên)
        const quoteDashMatch = line.match(
          /^["“](.+?)["”]\s*[-–—]\s*([A-ZÀ-Ỹ][a-zA-ZÀ-ỹ\s]{0,18})\s*(?:nói|đáp|hỏi|thì thầm|lẩm bẩm)?\.?$/i
        );
        if (quoteDashMatch) {
          line = `- ${quoteDashMatch[1].trim()} (${quoteDashMatch[2].trim()})`;
        }

        // Nếu dòng bắt đầu bằng "- " mà chưa có (Tên) ở cuối và có defaultSpeaker
        if (
          line.startsWith('- ') &&
          !/\([^()]+\)\.?$/.test(line) &&
          defaultSpeaker &&
          defaultSpeaker !== 'Đa điểm nhìn / Tự động'
        ) {
          line = `${line.replace(/[.]+$/, '')} (${defaultSpeaker})`;
        }

        cleanedLines.push(line);
      }

      return cleanedLines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    }

    buildLocalContextBlock(queryHint = '') {
      const bibleText =
        localStorage.getItem('noir_s10_rendered_bible_content') ||
        JSON.stringify(this.core.bibleManager.data, null, 2);
      const ragChunks = this.core.ragEngine.searchRelevantChunks(
        queryHint,
        this.stage2.config.ragTopK || 8
      );
      const blacklist = (this.core.bibleManager.data.antiClicheBlacklist || []).join(', ');
      const activeChap = this.core.approvalGate.getActiveChapter();
      const tailContent = (activeChap?.content || '').slice(-4500);

      return [
        `=== DỮ LIỆU STORY BIBLE ĐÃ KHÓA MẪU ===`,
        bibleText.slice(0, 12000),
        `\n=== DANH SÁCH TỪ NGỮ SÁO RỖNG BỊ CẤM TUYỆT ĐỐI ===`,
        blacklist,
        `\n=== CÁC ĐOẠN VĂN GỐC LIÊN QUAN TRÍCH XUẤT TỪ Ổ CỨNG (0 TOKEN RAG) ===`,
        ragChunks.length > 0
          ? ragChunks
              .map(
                (c) =>
                  `[${c.chapterTitle} | Giờ: ${c.timelineTimestamp} | POV: ${c.povCharacter}]: ${c.text}`
              )
              .join('\n---\n')
          : '(Chưa có đoạn trích RAG)',
        `\n=== ĐOẠN CUỐI BẢN THẢO ĐANG VIẾT (ĐỂ NỐI MẠCH LIỀN LẠC) ===`,
        tailContent || '(Chương mới bắt đầu)'
      ].join('\n');
    }

    previewContextPackageModal() {
      const modal = document.getElementById('modal-context-preview');
      const body = document.getElementById('context-preview-body');
      const sub = document.getElementById('context-preview-subtitle');
      if (!modal || !body) return;

      const beats = document.getElementById('textarea-chapter-beats')?.value || '';
      const pkg = this.buildLocalContextBlock(beats);
      body.textContent = pkg;
      if (sub) {
        sub.textContent = `Độ dài gói ngữ cảnh cục bộ: ${this.core.docParser
          .countVietnameseWords(pkg)
          .toLocaleString('vi-VN')} từ`;
      }
      modal.classList.remove('hidden');

      document.getElementById('btn-close-context-preview')?.addEventListener('click', () => {
        modal.classList.add('hidden');
      });
    }

    /**
     * Thực thi bản Prompt đã được Gemini Flash kết hợp & người dùng bấm Xác nhận (Fix Bug 8, 9, 10, 11)
     */
    async executeConfirmedSynthesizedPrompt(payload) {
      const {
        apiKey,
        modeId,
        selectedModel,
        thinkingLevel,
        targetWordCount,
        systemInstruction,
        boosterPrompt,
        povChar,
        synthesizedUserPrompt
      } = payload;

      const contextBlock = this.buildLocalContextBlock(synthesizedUserPrompt);
      const fullSystemInstruction = `${systemInstruction}\n\n${boosterPrompt}`;
      const fullUserPrompt = `${contextBlock}\n\n=== CHỈ ĐẠO TỔNG HỢP ĐÃ XÁC NHẬN ===\n${synthesizedUserPrompt}`;

      const contentArea = document.getElementById('textarea-chapter-content');
      const statusText = document.getElementById('continuation-status-text');
      const runBtn = document.getElementById('btn-run-primary-ai-action');

      if (runBtn) {
        runBtn.disabled = true;
        runBtn.textContent = `⏳ Đang chạy ${selectedModel} (${thinkingLevel.toUpperCase()})...`;
      }
      if (statusText) {
        statusText.textContent = `⏳ Đang thực thi ${modeId} (Mục tiêu: ${targetWordCount.toLocaleString(
          'vi-VN'
        )} từ)...`;
      }

      try {
        const result = await this.generateContent({
          apiKey,
          modelId: selectedModel,
          thinkingLevel,
          systemInstruction: fullSystemInstruction,
          userPrompt: fullUserPrompt,
          temperature: modeId === 'MODE_3_AUDIT' ? 0.25 : 0.72,
          maxOutputTokens: 65536
        });

        let finalOutput = result.text || '';
        if (modeId === 'MODE_1_DRAFT') {
          finalOutput = this.cleanAndEnforceDialogueConvention(finalOutput, povChar);
        }

        if (contentArea) {
          const prev = contentArea.value.trim();
          contentArea.value =
            modeId === 'MODE_1_DRAFT' && prev
              ? `${prev}\n\n${finalOutput}`
              : finalOutput;
          this.core.controller.syncActiveEditorFieldsToChapterObject();
          await this.core.controller.saveWorkspaceStateToIDB();
          this.core.controller.updateLiveWordStats(contentArea.value);
        }

        const generatedWords = this.core.docParser.countVietnameseWords(finalOutput);
        this.stage2.multiStepState = {
          isActive: generatedWords < targetWordCount * 0.85,
          currentStep: 1,
          totalSteps: Math.ceil(targetWordCount / Math.max(1000, generatedWords)),
          accumulatedWords: generatedWords,
          targetTotalWords: targetWordCount,
          lastPromptUsed: synthesizedUserPrompt,
          lastPayload: payload
        };

        const contBtn = document.getElementById('btn-continue-next-step');
        if (this.stage2.multiStepState.isActive && modeId === 'MODE_1_DRAFT') {
          contBtn?.classList.remove('hidden');
          if (statusText) {
            statusText.textContent = `✅ Đã viết ${generatedWords.toLocaleString(
              'vi-VN'
            )} / ${targetWordCount.toLocaleString(
              'vi-VN'
            )} từ. Bấm nút [Bấm Tiếp] bên phải nếu muốn AI viết nối thêm cho đủ mốc từ!`;
          }
        } else {
          contBtn?.classList.add('hidden');
          if (statusText) {
            statusText.textContent = `🎉 Hoàn tất thực thi (${generatedWords.toLocaleString(
              'vi-VN'
            )} từ) bằng model ${result.usedModel || selectedModel}!`;
          }
        }

        this.core.logger.log(
          `✨ Đã hoàn thành ${modeId}: Xuất ${generatedWords.toLocaleString('vi-VN')} từ với ${
            result.usedModel || selectedModel
          }.`,
          'SUCCESS'
        );
      } catch (err) {
        this.core.logger.log(`❌ Lỗi thực thi câu lệnh AI: ${err.message}`, 'ERROR');
        alert(`Lỗi gọi Gemini API: ${err.message}`);
      } finally {
        if (runBtn) {
          runBtn.disabled = false;
          runBtn.innerHTML = `<span>🚀 Tổng Hợp Thông Số & Chạy Câu Lệnh AI</span>`;
        }
      }
    }

    async continueNextMultiStepChunk() {
      const st = this.stage2.multiStepState;
      if (!st || !st.lastPayload) return;
      const remainingWords = Math.max(
        1000,
        st.targetTotalWords - st.accumulatedWords
      );
      const nextPayload = {
        ...st.lastPayload,
        targetWordCount: remainingWords,
        synthesizedUserPrompt: `${st.lastPromptUsed}\n\n[CHỈ ĐẠO NỐI CHẶNG TIẾP THEO]: Hãy viết tiếp nối liền mạch ngay sau câu cuối cùng của đoạn văn trên thêm khoảng ${remainingWords} từ nữa, giữ nguyên góc nhìn POV và quy ước thoại "- Câu thoại (Tên nhân vật)".`
      };
      await this.executeConfirmedSynthesizedPrompt(nextPayload);
    }

    /**
     * Hàm gọi Gemini API đa năng (Hỗ trợ truyền thinkingLevel, fallback model tự động & SSE Streaming)
     */
    async generateContent({
      apiKey,
      modelId = 'gemini-3.1-pro-preview',
      thinkingLevel = null,
      systemInstruction = '',
      userPrompt = '',
      temperature = 0.7,
      maxOutputTokens = 32768
    }) {
      const cleanKey = (
        apiKey ||
        this.stage2.config.apiKey ||
        localStorage.getItem('noir_gemini_api_key') ||
        ''
      ).trim();

      if (!cleanKey) {
        throw new Error('Chưa có Gemini API Key hợp lệ.');
      }

      const activeThink =
        thinkingLevel ||
        document.getElementById('select-active-thinking-level')?.value ||
        this.stage2.thinkingLevel ||
        'high';

      const fallbackModels = [
        modelId,
        'gemini-3.1-pro-preview',
        'gemini-2.5-pro',
        'gemini-2.5-flash',
        'gemini-3.5-flash-lite'
      ].filter((v, i, a) => v && a.indexOf(v) === i);

      let lastErr = null;

      for (const targetModel of fallbackModels) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
          targetModel
        )}:generateContent?key=${encodeURIComponent(cleanKey)}`;

        const generationConfig = {
          temperature,
          topP: 0.92,
          maxOutputTokens
        };

        if (targetModel.startsWith('gemini-3') || targetModel.includes('thinking')) {
          generationConfig.thinkingConfig = { thinkingLevel: activeThink };
        }

        const requestBody = {
          ...(systemInstruction
            ? { systemInstruction: { parts: [{ text: systemInstruction }] } }
            : {}),
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig
        };

        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          });

          if (!response.ok) {
            const errJson = await response.json().catch(() => ({}));
            const errMsg = errJson?.error?.message || `HTTP ${response.status}`;

            // Nếu model không nhận tham số thinkingConfig thì tự động gỡ và gọi lại ngay
            if (/thinking/i.test(errMsg) && requestBody.generationConfig.thinkingConfig) {
              delete requestBody.generationConfig.thinkingConfig;
              const retryRes = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
              });
              if (retryRes.ok) {
                const retryData = await retryRes.json();
                return this.extractTextFromResponse(retryData, targetModel);
              }
            }

            lastErr = new Error(errMsg);
            continue;
          }

          const data = await response.json();
          return this.extractTextFromResponse(data, targetModel);
        } catch (err) {
          lastErr = err;
        }
      }

      throw lastErr || new Error('Không thể kết nối tới máy chủ Gemini API.');
    }

    extractTextFromResponse(data, usedModel) {
      const parts = data?.candidates?.[0]?.content?.parts || [];
      const text = parts
        .filter((p) => !p.thought && typeof p.text === 'string')
        .map((p) => p.text)
        .join('\n')
        .trim();

      return {
        text,
        usedModel,
        usageMetadata: data?.usageMetadata || {}
      };
    }
  }

  // ==========================================================================
  // MODULE 11: LƯU 3 LỚP (CTRL+S), HOÀN TÁC 100 BƯỚC (CTRL+Z/Y), XUẤT FILE
  //            DOCX/PDF/TXT, CỬA SỔ POP-UP LỆNH & CHAT GEMINI TỰ DO
  //            (HỢP NHẤT STAGE 4, STAGE 6, STAGE 7 & STAGE 12)
  // ==========================================================================
  class UnifiedSaveUndoExportAndPromptStudio {
    constructor(core, stage2, stage3) {
      this.core = core;
      this.stage2 = stage2;
      this.stage3 = stage3;

      this.undoStacks = new Map(); // chapterId -> string[]
      this.redoStacks = new Map(); // chapterId -> string[]
      this.isFreeChatActive = false;
      this.freeChatHistory = [];
    }

    init() {
      this.injectReaderTypographyAndUndoBar();
      this.injectExpandablePromptPopupModal();
      this.injectCustomTypographyExporterModal();
      this.bindGlobalKeyboardShortcuts();
    }

    recordContentState(chapterId, text) {
      if (!chapterId) return;
      if (!this.undoStacks.has(chapterId)) {
        this.undoStacks.set(chapterId, []);
      }
      const stack = this.undoStacks.get(chapterId);
      if (stack.length > 0 && stack[stack.length - 1] === text) return;
      stack.push(text);
      if (stack.length > 100) stack.shift();
    }

    undo() {
      const chap = this.core.approvalGate.getActiveChapter();
      const area = document.getElementById('textarea-chapter-content');
      if (!chap || !area) return;

      const stack = this.undoStacks.get(chap.id) || [];
      if (stack.length === 0) return;

      if (!this.redoStacks.has(chap.id)) this.redoStacks.set(chap.id, []);
      this.redoStacks.get(chap.id).push(area.value);

      const prevText = stack.pop();
      area.value = prevText;
      this.core.controller.syncActiveEditorFieldsToChapterObject();
      this.core.controller.updateLiveWordStats(prevText);
      this.showSaveToastNotification('↩️ Đã hoàn tác (Ctrl+Z)');
    }

    redo() {
      const chap = this.core.approvalGate.getActiveChapter();
      const area = document.getElementById('textarea-chapter-content');
      if (!chap || !area) return;

      const rStack = this.redoStacks.get(chap.id) || [];
      if (rStack.length === 0) return;

      if (!this.undoStacks.has(chap.id)) this.undoStacks.set(chap.id, []);
      this.undoStacks.get(chap.id).push(area.value);

      const nextText = rStack.pop();
      area.value = nextText;
      this.core.controller.syncActiveEditorFieldsToChapterObject();
      this.core.controller.updateLiveWordStats(nextText);
      this.showSaveToastNotification('↪️ Đã làm lại (Ctrl+Y)');
    }

    async performImmediateSave(showToast = true) {
      this.core.controller.syncActiveEditorFieldsToChapterObject();
      const chap = this.core.approvalGate.getActiveChapter();
      if (!chap) return;

      // Lớp 1: IndexedDB chính
      await this.core.controller.saveWorkspaceStateToIDB();

      // Lớp 2: Két sắt khẩn cấp IndexedDB không giới hạn dung lượng (Hỗ trợ 50.000+ từ)
      await this.core.idb.set('state_cache', 'noir_large_emergency_vault', {
        chapterId: chap.id,
        title: chap.displayTitle || chap.title,
        content: chap.content || '',
        beats: chap.beats || '',
        wordCount: chap.wordCount || 0,
        savedAt: Date.now()
      });

      // Lớp 3: Ghi xuống ổ cứng máy tính nếu đã kết nối
      if (this.core.fsEngine.rootHandle) {
        const folder =
          chap.status === 'APPROVED' ? '01_Chuong_Da_Duyet' : '02_Ban_Nhap_Dang_Viet';
        await this.core.fsEngine.writeTextFile(
          folder,
          chap.fileName || `Chuong_${chap.chapterNumber}.txt`,
          chap.content || ''
        );
      }

      if (showToast) {
        this.showSaveToastNotification(
          `💾 Đã lưu an toàn 3 lớp: "${chap.displayTitle || chap.title}" (${(
            chap.wordCount || 0
          ).toLocaleString('vi-VN')} từ)`
        );
      }
    }

    showSaveToastNotification(message) {
      let toast = document.getElementById('unified-save-toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'unified-save-toast';
        toast.className =
          'fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs shadow-2xl transition-opacity duration-300 pointer-events-none';
        document.body.appendChild(toast);
      }
      toast.textContent = message;
      toast.style.opacity = '1';
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => {
        toast.style.opacity = '0';
      }, 2400);
    }

    injectReaderTypographyAndUndoBar() {
      const rightPane = document.getElementById('pane-right-manuscript');
      if (!rightPane || document.getElementById('stage6-reader-typography-bar')) return;

      const bar = document.createElement('div');
      bar.id = 'stage6-reader-typography-bar';
      bar.className =
        'px-3 py-1.5 border-b border-studioLightBorder dark:border-zinc-800 bg-studioLightPanel dark:bg-zinc-900 flex flex-wrap items-center justify-between gap-2 text-xs';

      bar.innerHTML = `
        <div class="flex items-center gap-1.5 flex-wrap">
          <button type="button" id="btn-s7-undo" class="px-2 py-1 rounded border border-studioLightBorder dark:border-zinc-700 hover:bg-zinc-800 text-[11px] font-semibold">
            <span>↩️ Hoàn tác</span>
          </button>
          <button type="button" id="btn-s7-redo" class="px-2 py-1 rounded border border-studioLightBorder dark:border-zinc-700 hover:bg-zinc-800 text-[11px] font-semibold">
            <span>↪️ Làm lại</span>
          </button>
          <button type="button" id="btn-s7-save-now" class="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold">
            <span>💾 Lưu (Ctrl+S)</span>
          </button>
          <button type="button" id="btn-instant-clean-dialogue" class="px-2.5 py-1 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 text-[11px] font-semibold">
            🧹 Chuẩn Hóa "- Thoại (Tên)" (0 Token)
          </button>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <select id="select-novel-font-family" class="px-2 py-1 rounded border border-studioLightBorder dark:border-zinc-700 bg-studioLightPanel dark:bg-zinc-900 text-[11px]">
            <option value="'Merriweather', serif">Font: Merriweather (Sách in)</option>
            <option value="'Inter', sans-serif">Font: Inter (Hiện đại)</option>
            <option value="'Georgia', serif">Font: Georgia (Cổ điển)</option>
          </select>
          <select id="select-novel-line-height" class="px-2 py-1 rounded border border-studioLightBorder dark:border-zinc-700 bg-studioLightPanel dark:bg-zinc-900 text-[11px]">
            <option value="1.6">Giãn dòng: 1.6</option>
            <option value="1.85" selected>Giãn dòng: 1.85 (Chuẩn LN)</option>
            <option value="2.1">Giãn dòng: 2.1 (Thoáng)</option>
          </select>
          <button type="button" id="btn-s6-open-custom-export" class="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold">
            <span>📤 Xuất DOCX / PDF / TXT</span>
          </button>
        </div>
      `;

      rightPane.prepend(bar);

      document.getElementById('btn-s7-undo')?.addEventListener('click', () => this.undo());
      document.getElementById('btn-s7-redo')?.addEventListener('click', () => this.redo());
      document.getElementById('btn-s7-save-now')?.addEventListener('click', () => {
        this.performImmediateSave(true);
      });

      document.getElementById('btn-instant-clean-dialogue')?.addEventListener('click', () => {
        const area = document.getElementById('textarea-chapter-content');
        if (!area) return;
        const chap = this.core.approvalGate.getActiveChapter();
        this.recordContentState(chap?.id, area.value);
        const pov = document.getElementById('select-scene-pov')?.value || '';
        area.value = this.stage3.cleanAndEnforceDialogueConvention(area.value, pov);
        this.performImmediateSave(true);
      });

      document.getElementById('select-novel-font-family')?.addEventListener('change', (e) => {
        const area = document.getElementById('textarea-chapter-content');
        if (area) area.style.fontFamily = e.target.value;
      });

      document.getElementById('select-novel-line-height')?.addEventListener('change', (e) => {
        document.documentElement.style.setProperty('--novel-line-height', e.target.value);
      });

      document.getElementById('btn-s6-open-custom-export')?.addEventListener('click', () => {
        document.getElementById('modal-s6-custom-exporter')?.classList.remove('hidden');
      });
    }

    /**
     * Cửa sổ Pop-up Nhập Câu Lệnh AI Phóng To & Chat Gemini Tự Do
     */
    injectExpandablePromptPopupModal() {
      if (document.getElementById('modal-s6-prompt-command')) return;

      const modal = document.createElement('div');
      modal.id = 'modal-s6-prompt-command';
      modal.className =
        'hidden fixed inset-0 bg-black/80 z-40 flex items-center justify-center p-4 backdrop-blur-sm';

      modal.innerHTML = `
        <div class="w-full max-w-5xl rounded-2xl border border-studioLightBorder dark:border-zinc-700 bg-studioLightPanel dark:bg-zinc-900 shadow-2xl overflow-hidden text-xs flex flex-col max-h-[90vh]">
          <div class="px-5 py-3 border-b border-studioLightBorder dark:border-zinc-800 bg-emerald-600/15 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="font-bold uppercase text-sm text-emerald-400">
                🤖 TRUNG TÂM TRỢ LÝ AI, 4 CHẾ ĐỘ SÁNG TÁC & CHAT GEMINI TỰ DO
              </span>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" id="btn-s7-toggle-freechat" class="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs">
                💬 Chuyển Sang Chat Gemini Tự Do
              </button>
              <button type="button" id="btn-s6-close-prompt-popup" class="px-2.5 py-1 rounded hover:bg-zinc-800 font-bold">✕</button>
            </div>
          </div>

          <!-- Khu vực 1: Soạn Câu Lệnh Chế Độ 1-4 -->
          <div id="s6-structured-prompt-body" class="p-5 space-y-3 overflow-y-auto flex-1">
            <div class="flex items-center justify-between">
              <label class="font-bold uppercase text-emerald-400">
                Nhập Ý Tưởng, Diễn Biến Chương Hoặc Yêu Cầu Cho AI:
              </label>
              <button type="button" id="btn-popup-open-rule-editor" class="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold text-[11px]">
                📜 Xem & Sửa Khung Câu Lệnh Hệ Thống (4 Chế Độ)
              </button>
            </div>
            <textarea id="textarea-s6-popup-prompt" rows="10" class="w-full p-3.5 rounded-xl border border-studioLightBorder dark:border-zinc-700 bg-studioLightBg dark:bg-zinc-950 text-xs leading-relaxed select-text focus:outline-none focus:border-emerald-500" placeholder="Nhập câu lệnh hoặc dàn ý phân cảnh tại đây... Khi bấm Chạy, Gemini sẽ tự động kết hợp cùng Chế độ, Số từ mong muốn, POV và Mốc chuyển cảnh của bạn!"></textarea>
            <div id="s6-popup-progress-status" class="text-[11px] font-monoCode text-amber-400"></div>
          </div>

          <!-- Khu vực 2: Khung Chat Gemini Tự Do -->
          <div id="s7-freechat-container" class="hidden p-5 flex-1 flex flex-col overflow-hidden gap-3">
            <div id="s7-freechat-messages" class="flex-1 overflow-y-auto p-3 rounded-xl border border-studioLightBorder dark:border-zinc-800 bg-studioLightBg dark:bg-zinc-950 space-y-2.5 select-text">
              <div class="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-300">
                💬 Chế độ Chat Gemini Tự Do: Bạn có thể hỏi đáp, bàn luận ý tưởng thoải mái như trên trang web Gemini thông thường.
              </div>
            </div>
            <div class="flex gap-2">
              <input id="input-s7-freechat" type="text" placeholder="Nhập tin nhắn hỏi Gemini..." class="flex-1 px-3.5 py-2 rounded-xl border border-studioLightBorder dark:border-zinc-700 bg-studioLightBg dark:bg-zinc-950 text-xs" />
              <button type="button" id="btn-s7-send-freechat" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                Gửi
              </button>
            </div>
          </div>

          <div class="px-5 py-3 border-t border-studioLightBorder dark:border-zinc-800 bg-studioLightBg dark:bg-zinc-950 flex items-center justify-end gap-2">
            <button type="button" id="btn-s6-popup-run-primary" class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg">
              🚀 Tổng Hợp Thông Số & Chạy Câu Lệnh (Pop-up Xác Nhận)
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      document.getElementById('btn-s6-close-prompt-popup')?.addEventListener('click', () => {
        modal.classList.add('hidden');
      });

      document.getElementById('btn-popup-open-rule-editor')?.addEventListener('click', () => {
        this.stage3.modeRulesManager.openRuleEditorModal();
      });

      document.getElementById('btn-s7-toggle-freechat')?.addEventListener('click', () => {
        this.toggleFreeChatMode(!this.isFreeChatActive);
      });

      document.getElementById('btn-s6-popup-run-primary')?.addEventListener('click', () => {
        const popupText = document.getElementById('textarea-s6-popup-prompt')?.value || '';
        const beatsArea = document.getElementById('textarea-chapter-beats');
        if (beatsArea && popupText.trim()) {
          beatsArea.value = popupText;
        }
        modal.classList.add('hidden');
        this.stage3.synthesizerPopup.openAndSynthesizePrompt(popupText);
      });

      const sendFreeChat = async () => {
        const input = document.getElementById('input-s7-freechat');
        const box = document.getElementById('s7-freechat-messages');
        const q = (input?.value || '').trim();
        if (!q || !box) return;
        input.value = '';

        const uDiv = document.createElement('div');
        uDiv.className = 'p-2.5 rounded-xl bg-zinc-800 text-right font-semibold';
        uDiv.textContent = `Bạn: ${q}`;
        box.appendChild(uDiv);

        const aDiv = document.createElement('div');
        aDiv.className = 'p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 whitespace-pre-wrap';
        aDiv.textContent = '⏳ Gemini đang trả lời...';
        box.appendChild(aDiv);
        box.scrollTop = box.scrollHeight;

        try {
          const res = await this.stage3.generateContent({
            apiKey: this.stage2.config.apiKey,
            modelId: this.stage2.config.modelId,
            userPrompt: q,
            temperature: 0.7
          });
          aDiv.textContent = res.text;
        } catch (err) {
          aDiv.textContent = `❌ Lỗi: ${err.message}`;
        }
        box.scrollTop = box.scrollHeight;
      };

      document.getElementById('btn-s7-send-freechat')?.addEventListener('click', sendFreeChat);
      document.getElementById('input-s7-freechat')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendFreeChat();
      });
    }

    openPromptCommandModal() {
      const modal = document.getElementById('modal-s6-prompt-command');
      const popupArea = document.getElementById('textarea-s6-popup-prompt');
      const beatsArea = document.getElementById('textarea-chapter-beats');
      if (popupArea && beatsArea) {
        popupArea.value = beatsArea.value;
      }
      modal?.classList.remove('hidden');
    }

    toggleFreeChatMode(enable) {
      this.isFreeChatActive = Boolean(enable);
      document.getElementById('s6-structured-prompt-body')?.classList.toggle(
        'hidden',
        this.isFreeChatActive
      );
      document.getElementById('s7-freechat-container')?.classList.toggle(
        'hidden',
        !this.isFreeChatActive
      );
      const btn = document.getElementById('btn-s7-toggle-freechat');
      if (btn) {
        btn.textContent = this.isFreeChatActive
          ? '✍️ Quay Lại Khung Chế Độ Viết Tiểu Thuyết'
          : '💬 Chuyển Sang Chat Gemini Tự Do';
      }
    }

    injectCustomTypographyExporterModal() {
      if (document.getElementById('modal-s6-custom-exporter')) return;

      const modal = document.createElement('div');
      modal.id = 'modal-s6-custom-exporter';
      modal.className =
        'hidden fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm select-none';

      modal.innerHTML = `
        <div class="w-full max-w-md rounded-2xl border border-studioLightBorder dark:border-zinc-700 bg-studioLightPanel dark:bg-zinc-900 shadow-2xl overflow-hidden text-xs">
          <div class="px-5 py-3.5 border-b border-studioLightBorder dark:border-zinc-800 bg-indigo-600/15 flex items-center justify-between">
            <h3 class="font-bold uppercase text-sm text-indigo-400">
              📤 XUẤT BẢN THẢO (.DOCX / .PDF / .TXT)
            </h3>
            <button type="button" id="btn-close-exporter-modal" class="px-2 py-0.5 rounded hover:bg-zinc-800 font-bold">✕</button>
          </div>
          <div class="p-5 space-y-3">
            <div>
              <label class="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Phạm vi chương muốn xuất:</label>
              <select id="export-scope-select" class="w-full px-3 py-1.5 rounded-lg border border-studioLightBorder dark:border-zinc-700 bg-studioLightBg dark:bg-zinc-950 font-semibold">
                <option value="CURRENT">Chương đang mở hiện tại</option>
                <option value="ALL_APPROVED">Toàn bộ các chương Đã Duyệt</option>
                <option value="ALL_CHAPTERS">Tất cả các chương trong Cây bản thảo</option>
              </select>
            </div>
            <div class="grid grid-cols-3 gap-2 pt-2">
              <button type="button" id="btn-export-txt-now" class="py-2.5 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-white font-bold">📄 Xuất .TXT</button>
              <button type="button" id="btn-export-docx-now" class="py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold">📘 Xuất .DOCX</button>
              <button type="button" id="btn-export-pdf-now" class="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold">📕 In / Xuất .PDF</button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      document.getElementById('btn-close-exporter-modal')?.addEventListener('click', () => {
        modal.classList.add('hidden');
      });

      const gatherExportText = () => {
        this.core.controller.syncActiveEditorFieldsToChapterObject();
        const scope = document.getElementById('export-scope-select')?.value || 'CURRENT';
        let list = [this.core.approvalGate.getActiveChapter()].filter(Boolean);
        if (scope === 'ALL_APPROVED') list = this.core.approvalGate.getApprovedChapters();
        if (scope === 'ALL_CHAPTERS') list = this.core.approvalGate.chapters;
        return list
          .map((c) => `${(c.displayTitle || c.title).toUpperCase()}\n\n${c.content || ''}`)
          .join('\n\n====================\n\n');
      };

      document.getElementById('btn-export-txt-now')?.addEventListener('click', () => {
        const text = gatherExportText();
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = ` Tieu_Thuyet_Export_${Date.now()}.txt`;
        a.click();
      });

      document.getElementById('btn-export-docx-now')?.addEventListener('click', () => {
        const text = gatherExportText();
        const htmlContent = `<html><head><meta charset="utf-8"></head><body style="font-family:'Times New Roman',serif;font-size:14pt;line-height:1.6;">${text
          .split('\n')
          .map((p) => `<p>${p}</p>`)
          .join('')}</body></html>`;
        const blob = new Blob(['\ufeff', htmlContent], {
          type: 'application/msword;charset=utf-8'
        });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `Tieu_Thuyet_Export_${Date.now()}.doc`;
        a.click();
      });

      document.getElementById('btn-export-pdf-now')?.addEventListener('click', () => {
        const text = gatherExportText();
        const win = window.open('', '_blank');
        if (!win) return;
        win.document.write(
          `<html><head><title>In Sách Tiểu Thuyết</title><style>body{font-family:Merriweather,Georgia,serif;padding:40px;line-height:1.8;max-width:750px;margin:auto;white-space:pre-wrap;}</style></head><body>${text}</body></html>`
        );
        win.document.close();
        win.focus();
        win.print();
      });
    }

    bindGlobalKeyboardShortcuts() {
      const contentArea = document.getElementById('textarea-chapter-content');
      contentArea?.addEventListener('input', () => {
        const chap = this.core.approvalGate.getActiveChapter();
        if (chap) this.recordContentState(chap.id, contentArea.value);
      });

      window.addEventListener('keydown', (e) => {
        // Khắc phục triệt để lỗi bấm Backspace ngoài ô nhập làm trang web lùi trang
        if (
          e.key === 'Backspace' &&
          !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '') &&
          !document.activeElement?.isContentEditable
        ) {
          e.preventDefault();
        }

        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
          e.preventDefault();
          this.performImmediateSave(true);
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
          if (document.activeElement === contentArea) {
            e.preventDefault();
            this.undo();
          }
        } else if (
          (e.ctrlKey || e.metaKey) &&
          (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))
        ) {
          if (document.activeElement === contentArea) {
            e.preventDefault();
            this.redo();
          }
        }
      });
    }
  }

  // ==========================================================================
  // MODULE 12: ĐỒ HỌA KHÔNG GIAN MƯA ĐÊM, TRÌNH PHÁT NHẠC & LẶP ĐOẠN A-B CHUẨN XÁC
  //            (HỢP NHẤT STAGE 8, STAGE 9, STAGE 11 & STAGE 14 A-B LOOP)
  // ==========================================================================
  class UnifiedAmbienceAndPrecisionAudioEngine {
    constructor(core) {
      this.core = core;
      this.htmlAudioPlayer = new Audio();
      this.htmlAudioPlayer.crossOrigin = 'anonymous';
      this.audioCtx = null;
      this.synthNodes = [];
      this.isPlayingSynth = false;

      // Thông số lặp đoạn A - B chính xác
      this.pointASec = 0;
      this.pointBSec = 60;
      this.abLoopEnabled = false;
      this.loopMode = 'LOOP_ALL';
    }

    init() {
      this.injectMusicPlayerWidget();
      this.installHighPrecisionABLoopMonitor();
    }

    formatMMSS(sec) {
      if (!sec || !isFinite(sec) || sec < 0) return '00:00';
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    parseMMSS(str) {
      if (!str) return 0;
      const clean = String(str).trim();
      if (clean.includes(':')) {
        const [m, s] = clean.split(':').map((n) => parseFloat(n) || 0);
        return m * 60 + s;
      }
      return Math.max(0, parseFloat(clean) || 0);
    }

    injectMusicPlayerWidget() {
      if (document.getElementById('s8-mini-music-widget')) return;

      const widget = document.createElement('div');
      widget.id = 's8-mini-music-widget';
      widget.className =
        'fixed bottom-9 left-4 z-30 w-80 rounded-2xl border border-studioLightBorder dark:border-zinc-700 bg-studioLightPanel/95 dark:bg-zinc-900/95 p-3 shadow-2xl space-y-2.5 text-xs select-none';

      widget.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="font-bold text-emerald-400">🎵 Trình Phát Nhạc & Lặp Đoạn A-B</span>
          <input type="file" id="s8-custom-mp3-input" accept="audio/*" class="hidden" />
          <button type="button" id="btn-s8-load-mp3" class="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px]">
            📂 Chọn Nhạc .MP3 Từ Máy
          </button>
        </div>

        <audio id="s8-native-audio-bar" controls class="w-full h-8"></audio>

        <div id="s9-advanced-audio-deck" class="space-y-2 pt-1 border-t border-studioLightBorder dark:border-zinc-800 text-[11px]">
          <div class="flex items-center justify-between gap-2">
            <span>Tốc độ phát:</span>
            <select id="s9-audio-speed-select" class="px-2 py-0.5 rounded border border-studioLightBorder dark:border-zinc-700 bg-studioLightBg dark:bg-zinc-950 font-monoCode">
              <option value="0.75">0.75x (Chậm)</option>
              <option value="1" selected>1.0x (Chuẩn)</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
            </select>
            <select id="s9-audio-loop-mode" class="px-2 py-0.5 rounded border border-studioLightBorder dark:border-zinc-700 bg-studioLightBg dark:bg-zinc-950">
              <option value="LOOP_ALL">🔁 Lặp cả bài</option>
              <option value="LOOP_AB">✂️ Lặp đoạn A-B</option>
            </select>
          </div>

          <!-- Bộ chỉnh dải lặp A -> B độc lập -->
          <div class="p-2 rounded-xl bg-studioLightBg dark:bg-zinc-950 border border-emerald-500/30 space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="font-bold text-emerald-400 text-[10px]">✂️ Dải lặp A ➔ B:</span>
              <button type="button" id="btn-s11-ab-toggle" class="px-2 py-0.5 rounded bg-zinc-700 text-white font-bold text-[10px]">
                ⏹️ Bật Lặp A-B
              </button>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-11 text-[10px] font-bold text-emerald-400">Điểm A:</span>
              <input id="s11-slider-point-a" type="range" min="0" max="300" step="1" value="0" class="flex-1 accent-emerald-500" />
              <input id="s11-input-point-a" type="text" value="00:00" class="w-12 px-1 py-0.5 rounded border border-zinc-700 bg-zinc-900 font-monoCode text-center text-[10px]" />
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-11 text-[10px] font-bold text-amber-400">Điểm B:</span>
              <input id="s11-slider-point-b" type="range" min="1" max="300" step="1" value="60" class="flex-1 accent-amber-500" />
              <input id="s11-input-point-b" type="text" value="01:00" class="w-12 px-1 py-0.5 rounded border border-zinc-700 bg-zinc-900 font-monoCode text-center text-[10px]" />
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(widget);

      const audioEl = document.getElementById('s8-native-audio-bar');
      this.htmlAudioPlayer = audioEl;
      audioEl.loop = true;

      const mp3Input = document.getElementById('s8-custom-mp3-input');
      document.getElementById('btn-s8-load-mp3')?.addEventListener('click', () => {
        mp3Input?.click();
      });
      mp3Input?.addEventListener('change', (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        audioEl.src = URL.createObjectURL(f);
        audioEl.play().catch(() => {});
      });

      document.getElementById('s9-audio-speed-select')?.addEventListener('change', (e) => {
        audioEl.playbackRate = parseFloat(e.target.value) || 1.0;
      });

      const sliderA = document.getElementById('s11-slider-point-a');
      const sliderB = document.getElementById('s11-slider-point-b');
      const inputA = document.getElementById('s11-input-point-a');
      const inputB = document.getElementById('s11-input-point-b');
      const toggleBtn = document.getElementById('btn-s11-ab-toggle');
      const loopSel = document.getElementById('s9-audio-loop-mode');

      audioEl.addEventListener('loadedmetadata', () => {
        const dur = Math.floor(audioEl.duration || 300);
        sliderA.max = String(dur);
        sliderB.max = String(dur);
        this.pointBSec = dur;
        sliderB.value = String(dur);
        inputB.value = this.formatMMSS(dur);
      });

      const refreshABBtn = () => {
        if (this.abLoopEnabled) {
          toggleBtn.className = 'px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px]';
          toggleBtn.textContent = `🔁 Đang Lặp (${this.formatMMSS(this.pointASec)} ➔ ${this.formatMMSS(this.pointBSec)})`;
        } else {
          toggleBtn.className = 'px-2 py-0.5 rounded bg-zinc-700 text-white font-bold text-[10px]';
          toggleBtn.textContent = '⏹️ Bật Lặp A-B';
        }
      };

      sliderA?.addEventListener('input', () => {
        this.pointASec = Math.min(parseFloat(sliderA.value) || 0, this.pointBSec - 1);
        inputA.value = this.formatMMSS(this.pointASec);
        refreshABBtn();
      });

      sliderB?.addEventListener('input', () => {
        this.pointBSec = Math.max(this.pointASec + 1, parseFloat(sliderB.value) || 10);
        inputB.value = this.formatMMSS(this.pointBSec);
        refreshABBtn();
      });

      inputA?.addEventListener('change', () => {
        this.pointASec = Math.min(this.parseMMSS(inputA.value), this.pointBSec - 1);
        sliderA.value = String(this.pointASec);
        inputA.value = this.formatMMSS(this.pointASec);
        refreshABBtn();
      });

      inputB?.addEventListener('change', () => {
        this.pointBSec = Math.max(this.pointASec + 1, this.parseMMSS(inputB.value));
        sliderB.value = String(this.pointBSec);
        inputB.value = this.formatMMSS(this.pointBSec);
        refreshABBtn();
      });

      toggleBtn?.addEventListener('click', () => {
        this.abLoopEnabled = !this.abLoopEnabled;
        if (this.abLoopEnabled && loopSel) loopSel.value = 'LOOP_AB';
        refreshABBtn();
      });

      loopSel?.addEventListener('change', () => {
        this.abLoopEnabled = loopSel.value === 'LOOP_AB';
        refreshABBtn();
      });
    }

    installHighPrecisionABLoopMonitor() {
      setInterval(() => {
        const audio = this.htmlAudioPlayer;
        if (!audio || audio.paused || !this.abLoopEnabled) return;
        if (audio.loop) audio.loop = false;

        const startA = Math.max(0, Number(this.pointASec) || 0);
        const rawEndB = Number(this.pointBSec) || 0;
        const dur = Number(audio.duration) || 0;
        if (rawEndB <= startA) return;

        const effectiveEndB =
          dur > 0 && rawEndB >= dur - 0.35 ? Math.max(startA + 0.5, dur - 0.35) : rawEndB;

        if (audio.currentTime >= effectiveEndB || audio.currentTime < startA - 0.5) {
          audio.currentTime = startA;
          audio.play().catch(() => {});
        }
      }, 40);
    }

    playSoundscape() {
      if (this.htmlAudioPlayer && this.htmlAudioPlayer.src) {
        this.htmlAudioPlayer.play().catch(() => {});
      }
    }
  }

  // Khởi tạo và xuất toàn cục các đối tượng Stage 2 -> Stage 9 để tương thích 100% với Stage 16 & 17
  const stage2Manager = new UnifiedAISettingsAndTelemetry(window.StudioCore);
  const stage3Engine = new UnifiedGeminiClientAndModesEngine(window.StudioCore, stage2Manager);
  const stage6And7Studio = new UnifiedSaveUndoExportAndPromptStudio(
    window.StudioCore,
    stage2Manager,
    stage3Engine
  );
  const stage8And9Audio = new UnifiedAmbienceAndPrecisionAudioEngine(window.StudioCore);

  window.StudioStage2 = {
    settings: stage2Manager,
    uiController: stage2Manager
  };

  window.StudioStage3 = {
    geminiClient: stage3Engine,
    modeRulesManager: stage3Engine.modeRulesManager,
    synthesizerPopup: stage3Engine.synthesizerPopup,
    previewContextPackageModal: () => stage3Engine.previewContextPackageModal(),
    executeConfirmedSynthesizedPrompt: (p) => stage3Engine.executeConfirmedSynthesizedPrompt(p),
    continueNextMultiStepChunk: () => stage3Engine.continueNextMultiStepChunk()
  };

  window.StudioStage4 = {
    bugFixer: { open: () => {} }
  };

  window.StudioStage5 = {
    upgrader: {
      layoutState: stage2Manager,
      processSuccessfulApiResponse: () => {}
    }
  };

  window.StudioStage6 = {
    openPromptCommandModal: () => stage6And7Studio.openPromptCommandModal()
  };

  window.StudioStage7 = {
    saveEngine: stage6And7Studio,
    freeChatEngine: stage6And7Studio,
    tutorialGuide: {
      steps: [],
      currentStepIndex: 0,
      startTour: () => {},
      renderCurrentStep: () => {},
      endTour: () => {}
    }
  };

  window.StudioStage8 = {
    audioPlayer: stage8And9Audio,
    visualEngine: { startAnimationLoop: () => {} }
  };

  window.StudioStage9 = {
    advancedAudio: stage8And9Audio,
    collapseManager: { collapseBar: () => {} }
  };
  // ==========================================================================
  // MODULE 13: STORY BIBLE TỰ ĐỘNG ĐA CHƯƠNG LIÊN MẠCH & DUYỆT BẢN THẢO THÔNG MINH
  //            (HỢP NHẤT STAGE 10 & 15 - GIẢI QUYẾT TRIỆT ĐỂ BUG 6 & BUG 12)
  // ==========================================================================
  const DEFAULT_UNIFIED_STORY_BIBLE_TEMPLATE = `=== KHUNG KIỂU MẪU STORY BIBLE CHUẨN (CẬP NHẬT TỰ ĐỘNG THEO CHƯƠNG) ===

[I. TỔNG QUAN CỐT TRUYỆN & TRỤC THỜI GIAN LIÊN MẠCH]
- Mốc thời gian mới nhất trong truyện: {{Cập nhật ngày/giờ mới nhất}}
- Địa điểm & Bối cảnh chính: {{Cập nhật các địa điểm đã xuất hiện}}
- Tóm tắt mạch truyện liên hoàn từ Chương 1 đến các chương vừa duyệt:
{{Tóm tắt liền mạch không đứt đoạn}}

[II. HỒ SƠ & BIẾN ĐỔI TÂM LÝ NHÂN VẬT]
- Nhân vật chính & Góc nhìn (POV):
  + Tên & Vai trò: {{Tên nhân vật}}
  + Mặt nạ xã hội (Persona) vs Bản chất ngầm (Shadow): {{Mô tả}}
  + Biến chuyển tâm lý & Nhận thức sai lệch (Unreliable Narrator) qua các chương vừa chọn: {{Cập nhật}}
- Các nhân vật phụ & Mối quan hệ nghi kỵ:
{{Danh sách nhân vật phụ và thái độ hiện tại}}

[III. MA TRẬN BẤT CÂN XỨNG THÔNG TIN (AI BIẾT GÌ / AI CHƯA BIẾT)]
- Sự thật khách quan đã xảy ra: {{Liệt kê sự thật}}
- Những thông tin nhân vật đã biết / đang hiểu lầm tính đến chương mới nhất: {{Cập nhật ai biết gì}}

[IV. SỔ CÁI PHỤC BÚT (CHEKHOV'S GUN) & MANH MỐI ĐANG MỞ]
- Phục bút mới gieo ở các chương vừa chọn: {{Chi tiết mới cài cắm}}
- Phục bút từ các chương trước đang triển khai hoặc đã giải quyết: {{Trạng thái các manh mối}}`;

  class SmartMultiChapterStoryBibleEngine {
    constructor(core, stage2, stage3) {
      this.core = core;
      this.stage2 = stage2;
      this.stage3 = stage3;

      this.isTemplateLocked =
        localStorage.getItem('noir_s10_bible_template_locked') !== 'false';
      this.templateFrame =
        localStorage.getItem('noir_s10_bible_template_frame') ||
        DEFAULT_UNIFIED_STORY_BIBLE_TEMPLATE;
      this.renderedBibleContent =
        localStorage.getItem('noir_s10_rendered_bible_content') ||
        'Chưa có dữ liệu tổng hợp. Hãy chọn các chương cần tổng hợp và bấm Cập Nhật Story Bible để AI tự động điền theo đúng khung mẫu bên trái!';
      this.customBibleRuleDirective =
        localStorage.getItem('noir_s15_bible_custom_rule') ||
        'Luôn giữ liên kết mạch truyện từ Chương 1 đến chương mới nhất. Tuyệt đối không làm mất dữ liệu nền của các chương trước khi cập nhật thêm các chương mới được chọn.';
    }

    init() {
      this.injectQuickPreviewBibleButtonNextToApprove();
      this.injectSmartApprovalWithChapterSelectorModal();
      this.injectStoryBibleMainWorkspace();
    }

    saveTemplateFrame(text) {
      this.templateFrame = text;
      localStorage.setItem('noir_s10_bible_template_frame', text);
    }

    saveRenderedBibleContent(text) {
      this.renderedBibleContent = text;
      localStorage.setItem('noir_s10_rendered_bible_content', text);
    }

    toggleTemplateLock() {
      this.isTemplateLocked = !this.isTemplateLocked;
      localStorage.setItem(
        'noir_s10_bible_template_locked',
        String(this.isTemplateLocked)
      );
      this.refreshTemplateLockUI();
    }

    refreshTemplateLockUI() {
      const tplArea = document.getElementById('s10-bible-template-textarea');
      const lockBtn = document.getElementById('btn-s10-toggle-template-lock');
      const lockBadge = document.getElementById('s10-template-lock-badge');
      if (!tplArea || !lockBtn) return;

      tplArea.readOnly = this.isTemplateLocked;
      if (this.isTemplateLocked) {
        lockBtn.className =
          'px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow transition flex items-center gap-1.5';
        lockBtn.innerHTML = `<span>🔒 Đang Khóa Kiểu Mẫu (Bấm để Mở khóa sửa khung)</span>`;
        if (lockBadge) {
          lockBadge.className =
            'px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold';
          lockBadge.textContent =
            '🔒 KHUNG MẪU ĐÃ KHÓA (AI BẮT BUỘC VIẾT THEO MẪU NÀY)';
        }
      } else {
        lockBtn.className =
          'px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition flex items-center gap-1.5';
        lockBtn.innerHTML = `<span>🔓 Đang Mở Kiểu Mẫu (Sửa xong bấm để Khóa lại)</span>`;
        if (lockBadge) {
          lockBadge.className =
            'px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold';
          lockBadge.textContent =
            '🔓 ĐANG MỞ KHÓA (TỰ DO DÁN / SỬA KHUNG DÀN Ý MẪU)';
        }
      }
    }

    /**
     * FIX BUG 6: Thêm nút nhỏ "🏛️ Mở khung Story Bible" ngay cạnh nút Duyệt Chương
     * và khi bấm vào có nút "✏️ Sửa khung Story Bible" điều hướng thẳng tới Tab Story Bible
     */
    injectQuickPreviewBibleButtonNextToApprove() {
      const approveBtn = document.getElementById('btn-approve-chapter');
      if (!approveBtn || !approveBtn.parentElement) return;

      if (!document.getElementById('btn-bug6-quick-open-bible')) {
        const quickBibleBtn = document.createElement('button');
        quickBibleBtn.type = 'button';
        quickBibleBtn.id = 'btn-bug6-quick-open-bible';
        quickBibleBtn.className =
          'px-2.5 py-1 text-xs font-bold rounded bg-amber-500/15 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 transition flex items-center gap-1';
        quickBibleBtn.title = 'Xem nhanh khung Story Bible hiện tại và chuyển tới màn hình sửa khung';
        quickBibleBtn.innerHTML = `<span>🏛️ Mở khung Story Bible</span>`;
        approveBtn.parentElement.insertBefore(quickBibleBtn, approveBtn);

        quickBibleBtn.addEventListener('click', () => {
          this.openQuickStoryBiblePreviewModal();
        });
      }

      // Ghi đè sự kiện bấm nút "✅ DUYỆT & CHỐT BẢN THẢO" để mở Modal Duyệt Đa Chương (Fix Bug 6)
      const newApproveBtn = approveBtn.cloneNode(true);
      approveBtn.parentNode.replaceChild(newApproveBtn, approveBtn);
      newApproveBtn.addEventListener('click', () => {
        this.openSmartApprovalModal();
      });
    }

    openQuickStoryBiblePreviewModal() {
      let modal = document.getElementById('modal-bug6-quick-bible-preview');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-bug6-quick-bible-preview';
        modal.className =
          'hidden fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm select-none';
        modal.innerHTML = `
          <div class="w-full max-w-3xl rounded-2xl border-2 border-amber-500/50 bg-studioLightPanel dark:bg-zinc-900 shadow-2xl overflow-hidden text-xs flex flex-col max-h-[88vh]">
            <div class="px-5 py-3.5 border-b border-studioLightBorder dark:border-zinc-800 bg-amber-500/15 flex items-center justify-between">
              <h3 class="font-bold uppercase text-sm text-amber-400">
                🏛️ XEM NHANH KHUNG STORY BIBLE & NỘI DUNG HIỆN TẠI
              </h3>
              <button type="button" id="btn-close-quick-bible-preview" class="px-2.5 py-1 rounded hover:bg-zinc-800 font-bold">✕</button>
            </div>
            <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto flex-1">
              <div class="flex flex-col">
                <span class="font-bold text-amber-400 mb-1 uppercase text-[11px]">📐 Khung Kiểu Mẫu Đang Áp Dụng:</span>
                <textarea id="quick-preview-bible-template" readonly rows="14" class="w-full p-3 rounded-xl border border-zinc-700 bg-zinc-950 text-zinc-200 font-monoCode text-[11px] leading-relaxed select-text"></textarea>
              </div>
              <div class="flex flex-col">
                <span class="font-bold text-emerald-400 mb-1 uppercase text-[11px]">📖 Nội Dung Story Bible Đã Tổng Hợp:</span>
                <textarea id="quick-preview-bible-rendered" readonly rows="14" class="w-full p-3 rounded-xl border border-zinc-700 bg-zinc-950 text-zinc-200 text-[11px] leading-relaxed select-text"></textarea>
              </div>
            </div>
            <div class="px-5 py-3.5 border-t border-studioLightBorder dark:border-zinc-800 bg-zinc-950 flex items-center justify-between">
              <span class="text-[11px] text-zinc-400">Bấm nút bên phải để chuyển thẳng tới màn hình chỉnh sửa khung Story Bible.</span>
              <div class="flex items-center gap-2">
                <button type="button" id="btn-Navigate-to-edit-bible" class="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-lg transition flex items-center gap-1.5">
                  <span>✏️ Sửa Khung Story Bible (Chuyển Tới Tab Story Bible)</span>
                </button>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(modal);

        document
          .getElementById('btn-close-quick-bible-preview')
          ?.addEventListener('click', () => modal.classList.add('hidden'));

        document
          .getElementById('btn-Navigate-to-edit-bible')
          ?.addEventListener('click', () => {
            modal.classList.add('hidden');
            document
              .getElementById('modal-bug6-smart-approve')
              ?.classList.add('hidden');
            // Điều hướng thẳng tới màn hình Story Bible và mở khóa sẵn để người dùng sửa khung
            if (window.StudioStage14?.navigator) {
              window.StudioStage14.navigator.navigateToScreen('SCREEN_4_BIBLE');
            } else if (window.StudioStage10) {
              window.StudioStage10.switchCorePillar('STORY_BIBLE');
            }
            if (this.isTemplateLocked) {
              this.toggleTemplateLock();
            }
            setTimeout(() => {
              document.getElementById('s10-bible-template-textarea')?.focus();
            }, 120);
          });
      }

      const tplEl = document.getElementById('quick-preview-bible-template');
      const renEl = document.getElementById('quick-preview-bible-rendered');
      if (tplEl) tplEl.value = this.templateFrame;
      if (renEl) renEl.value = this.renderedBibleContent;
      modal.classList.remove('hidden');
    }

    /**
     * FIX BUG 6: Màn hình Duyệt Bản Thảo & Gửi Prompt Cập Nhật Story Bible
     * - Có danh sách trình đơn thả xuống các chương chưa duyệt
     * - Có nút Chọn tất cả / Bỏ chọn tất cả / Chọn từng chương
     * - Có nút Mở khung Story Bible ngay bên trong
     * - Câu lệnh hệ thống cố định + tùy biến thông minh nối mạch từ Chương 1 đến các chương đã chọn
     */
    injectSmartApprovalWithChapterSelectorModal() {
      if (document.getElementById('modal-bug6-smart-approve')) return;

      const modal = document.createElement('div');
      modal.id = 'modal-bug6-smart-approve';
      modal.className =
        'hidden fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm select-none';

      modal.innerHTML = `
        <div class="w-full max-w-2xl rounded-2xl border-2 border-emerald-500/60 bg-studioLightPanel dark:bg-zinc-900 shadow-2xl overflow-hidden text-xs flex flex-col max-h-[92vh]">
          <div class="px-5 py-3.5 border-b border-studioLightBorder dark:border-zinc-800 bg-emerald-700/20 flex items-center justify-between">
            <h3 class="font-bold uppercase text-sm text-emerald-400 flex items-center gap-2">
              <span>✅ DUYỆT BẢN THẢO & GỬI PROMPT CẬP NHẬT STORY BIBLE</span>
            </h3>
            <div class="flex items-center gap-2">
              <button type="button" id="btn-modal-approve-open-bible" class="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 border border-amber-500/40 font-bold text-[11px]">
                🏛️ Mở Khung Story Bible
              </button>
              <button type="button" id="btn-close-bug6-approve-modal" class="px-2 py-0.5 rounded hover:bg-zinc-800 font-bold text-sm">✕</button>
            </div>
          </div>

          <div class="p-5 space-y-4 overflow-y-auto flex-1">
            <p class="text-zinc-300 leading-relaxed">
              Khi duyệt các chương bên dưới, hệ thống sẽ chốt bản thảo vào bộ nhớ chính thức và gửi Prompt tới Gemini để <b>tự động tóm tắt & cập nhật Story Bible theo đúng cấu trúc khung mẫu</b> mà vẫn giữ liền mạch các chương trước đó.
            </p>

            <!-- 1. DANH SÁCH TRÌNH ĐƠN THẢ XUỐNG CÁC CHƯƠNG CHƯA DUYỆT (CHỌN TẤT CẢ / BỎ CHỌN TẤT CẢ) -->
            <div class="p-3.5 rounded-xl border border-emerald-500/40 bg-zinc-950/80 space-y-2.5">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <button type="button" id="btn-toggle-unapproved-dropdown" class="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
                  <span>📋 Danh Sách Các Chương Chưa Duyệt (Bấm để mở/đóng)</span>
                  <span id="badge-selected-unapproved-count" class="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-monoCode text-[10px]">1 chương</span>
                </button>
                <div class="flex items-center gap-1.5">
                  <button type="button" id="btn-bug6-select-all-chaps" class="px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 font-bold text-[10px]">
                    ☑️ Chọn tất cả
                  </button>
                  <button type="button" id="btn-bug6-deselect-all-chaps" class="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-[10px]">
                    ⬜ Bỏ chọn tất cả
                  </button>
                </div>
              </div>

              <div id="bug6-unapproved-chapters-checklist" class="max-h-40 overflow-y-auto space-y-1.5 pt-1 border-t border-zinc-800"></div>
            </div>

            <!-- 2. CÂU LỆNH ĐỊNH HƯỚNG TÓM TẮT STORY BIBLE THÔNG MINH THEO CÁC CHƯƠNG ĐÃ CHỌN -->
            <div class="p-3.5 rounded-xl border border-studioLightBorder dark:border-zinc-800 bg-zinc-950/60 space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-bold uppercase text-[10px] text-amber-400">
                  🧭 Câu Lệnh Định Hướng Tóm Tắt Story Bible (Tự động nối mạch từ Chương 1 + Tùy biến của bạn):
                </label>
                <span id="bug6-continuity-indicator" class="text-[10px] font-monoCode text-emerald-400"></span>
              </div>
              <textarea id="textarea-bug6-custom-bible-directive" rows="3" class="w-full p-2.5 rounded-lg border border-zinc-700 bg-zinc-900 text-xs leading-relaxed select-text focus:outline-none focus:border-emerald-500" placeholder="Nhập thêm định hướng riêng nếu muốn (VD: Nhấn mạnh biến chuyển tâm lý của nhân vật chính ở chương 2 và manh mối chiếc chìa khóa ở chương 3)..."></textarea>
            </div>

            <!-- 3. CHỌN MÔ HÌNH AI & MỨC ĐỘ TƯ DUY ĐỂ CẬP NHẬT STORY BIBLE -->
            <div class="p-3.5 rounded-xl border border-studioLightBorder dark:border-zinc-800 bg-zinc-950/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                  CHỌN MÔ HÌNH AI CẬP NHẬT STORY BIBLE:
                </label>
                <select id="select-bug6-bible-model" class="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-900 font-bold text-xs text-white">
                  <option value="gemini-3.5-flash-lite">Gemini 3.5 / 2.5 Flash-Lite (Mặc định: Siêu Nhẹ, Tiết Kiệm Hạn Mức)</option>
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Cân bằng & Nhanh)</option>
                  <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro Preview (Phân tích sâu)</option>
                </select>
              </div>
              <div>
                <label class="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                  CHỌN MỨC ĐỘ TƯ DUY (THINKING LEVEL):
                </label>
                <select id="select-bug6-bible-thinking" class="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-900 font-bold text-emerald-400 text-xs">
                  <option value="low">⚡ Thấp (Low - Mặc định nhanh & Tiết kiệm)</option>
                  <option value="medium">⚖️ Trung bình (Medium - Cân bằng)</option>
                  <option value="high">🧠 Cao (High - Suy luận kỹ)</option>
                </select>
              </div>
            </div>

            <div id="bug6-approve-progress-msg" class="text-[11px] font-monoCode text-amber-400"></div>
          </div>

          <div class="px-5 py-3.5 border-t border-studioLightBorder dark:border-zinc-800 bg-zinc-950 flex flex-wrap items-center justify-between gap-2">
            <button type="button" id="btn-bug6-approve-only-no-ai" class="px-4 py-2.5 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-white font-bold transition">
              Chỉ Duyệt (Không gọi AI)
            </button>
            <button type="button" id="btn-bug6-approve-and-run-ai" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg transition flex items-center gap-1.5">
              <span>🚀 Duyệt Chương & Gửi Prompt Cập Nhật Story Bible Ngay</span>
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      document
        .getElementById('btn-close-bug6-approve-modal')
        ?.addEventListener('click', () => modal.classList.add('hidden'));

      document
        .getElementById('btn-modal-approve-open-bible')
        ?.addEventListener('click', () => this.openQuickStoryBiblePreviewModal());

      document
        .getElementById('btn-toggle-unapproved-dropdown')
        ?.addEventListener('click', () => {
          document
            .getElementById('bug6-unapproved-chapters-checklist')
            ?.classList.toggle('hidden');
        });

      document
        .getElementById('btn-bug6-select-all-chaps')
        ?.addEventListener('click', () => {
          modal
            .querySelectorAll('.bug6-chap-checkbox')
            .forEach((chk) => (chk.checked = true));
          this.updateApprovalChecklistSummary();
        });

      document
        .getElementById('btn-bug6-deselect-all-chaps')
        ?.addEventListener('click', () => {
          modal
            .querySelectorAll('.bug6-chap-checkbox')
            .forEach((chk) => (chk.checked = false));
          this.updateApprovalChecklistSummary();
        });

      // Nút 1: Chỉ duyệt các chương đã tích chọn (Không gọi AI)
      document
        .getElementById('btn-bug6-approve-only-no-ai')
        ?.addEventListener('click', async () => {
          const selectedIds = this.getSelectedChapterIdsInApprovalModal();
          if (selectedIds.length === 0) {
            alert('Vui lòng tích chọn ít nhất 1 chương để duyệt.');
            return;
          }
          for (const id of selectedIds) {
            await this.core.approvalGate.approveChapterById(id, false);
          }
          await this.core.controller.saveWorkspaceStateToIDB();
          this.core.controller.renderAll();
          modal.classList.add('hidden');
        });

      // Nút 2: Duyệt các chương đã chọn & Gửi Prompt Cập Nhật Story Bible Liên Mạch
      document
        .getElementById('btn-bug6-approve-and-run-ai')
        ?.addEventListener('click', async () => {
          const selectedIds = this.getSelectedChapterIdsInApprovalModal();
          if (selectedIds.length === 0) {
            alert('Vui lòng tích chọn ít nhất 1 chương để duyệt và cập nhật Story Bible.');
            return;
          }

          const modelId =
            document.getElementById('select-bug6-bible-model')?.value ||
            'gemini-3.5-flash-lite';
          const thinkingLevel =
            document.getElementById('select-bug6-bible-thinking')?.value || 'low';
          const customDirective =
            document.getElementById('textarea-bug6-custom-bible-directive')
              ?.value || '';

          const runBtn = document.getElementById('btn-bug6-approve-and-run-ai');
          const msgEl = document.getElementById('bug6-approve-progress-msg');
          if (runBtn) runBtn.disabled = true;
          if (msgEl) {
            msgEl.textContent = `⏳ Đang duyệt ${selectedIds.length} chương và gọi Gemini cập nhật Story Bible liên mạch...`;
          }

          try {
            for (const id of selectedIds) {
              await this.core.approvalGate.approveChapterById(id, false);
            }
            await this.core.controller.saveWorkspaceStateToIDB();
            this.core.controller.renderAll();

            await this.updateStoryBibleForSelectedChapters({
              selectedChapterIds: selectedIds,
              modelId,
              thinkingLevel,
              userDirective: customDirective
            });

            modal.classList.add('hidden');
            window.StudioStage7?.saveEngine?.showSaveToastNotification(
              `✅ Đã duyệt ${selectedIds.length} chương & cập nhật Story Bible thành công!`
            );
          } catch (err) {
            if (msgEl) msgEl.textContent = `❌ Lỗi: ${err.message}`;
            alert(`Lỗi khi cập nhật Story Bible: ${err.message}`);
          } finally {
            if (runBtn) runBtn.disabled = false;
          }
        });
    }

    openSmartApprovalModal() {
      this.core.controller.syncActiveEditorFieldsToChapterObject();
      const modal = document.getElementById('modal-bug6-smart-approve');
      const listEl = document.getElementById('bug6-unapproved-chapters-checklist');
      const dirArea = document.getElementById('textarea-bug6-custom-bible-directive');
      const msgEl = document.getElementById('bug6-approve-progress-msg');
      if (!modal || !listEl) return;

      if (msgEl) msgEl.textContent = '';

      // Lấy danh sách chương chưa duyệt (nếu tất cả đã duyệt thì hiển thị toàn bộ chương để người dùng chọn lại nếu muốn)
      const drafts = this.core.approvalGate.getDraftChapters();
      const pool = drafts.length > 0 ? drafts : this.core.approvalGate.chapters;
      const activeId = this.core.approvalGate.activeChapterId;

      listEl.innerHTML = pool
        .map((c) => {
          const isChecked = c.id === activeId || pool.length === 1;
          return `
            <label class="flex items-center justify-between gap-2 p-2 rounded-lg border border-zinc-800 hover:bg-zinc-900 cursor-pointer">
              <div class="flex items-center gap-2">
                <input type="checkbox" value="${c.id}" ${
            isChecked ? 'checked' : ''
          } class="bug6-chap-checkbox rounded w-4 h-4 accent-emerald-500" />
                <span class="font-semibold text-xs text-zinc-200">${
                  c.displayTitle || c.title
                }</span>
              </div>
              <span class="text-[10px] font-monoCode text-emerald-400">${(
                c.wordCount || 0
              ).toLocaleString('vi-VN')}w (${
            c.status === 'APPROVED' ? 'Đã duyệt' : 'Chưa duyệt'
          })</span>
            </label>
          `;
        })
        .join('');

      listEl.querySelectorAll('.bug6-chap-checkbox').forEach((chk) => {
        chk.addEventListener('change', () => this.updateApprovalChecklistSummary());
      });

      if (dirArea && !dirArea.value.trim()) {
        dirArea.value = this.customBibleRuleDirective;
      }

      this.updateApprovalChecklistSummary();
      modal.classList.remove('hidden');
    }

    getSelectedChapterIdsInApprovalModal() {
      const checks = document.querySelectorAll('.bug6-chap-checkbox:checked');
      return [...checks].map((c) => c.value);
    }

    updateApprovalChecklistSummary() {
      const selectedIds = this.getSelectedChapterIdsInApprovalModal();
      const badge = document.getElementById('badge-selected-unapproved-count');
      const contEl = document.getElementById('bug6-continuity-indicator');
      if (badge) badge.textContent = `${selectedIds.length} chương đã chọn`;

      // Tính toán các chương nền phía trước để thông báo nối mạch thông minh
      const allChaps = this.core.approvalGate.chapters;
      const selectedChaps = allChaps.filter((c) => selectedIds.includes(c.id));
      if (selectedChaps.length > 0 && contEl) {
        const maxChapNum = Math.max(
          ...selectedChaps.map((c) => c.chapterNumber || 1)
        );
        const precedingChaps = allChaps.filter(
          (c) =>
            !selectedIds.includes(c.id) &&
            (c.chapterNumber < maxChapNum || c.status === 'APPROVED')
        );
        contEl.textContent =
          precedingChaps.length > 0
            ? `🔗 Tự động nối mạch với ${precedingChaps.length} chương trước đó (Không đứt mạch)`
            : `🔗 Tổng hợp trực tiếp từ mạch khởi đầu`;
      }
    }

    /**
     * THUẬT TOÁN CẬP NHẬT STORY BIBLE LIÊN MẠCH THÔNG MINH (FIX BUG 6 & BUG 12):
     * - Ví dụ người dùng chọn Chương 2 và Chương 3: Hệ thống tự động lấy mạch nền của Chương 1
     *   (cùng dữ liệu Story Bible hiện có) kết hợp với toàn văn Chương 2 & Chương 3 và Khung mẫu đã khóa.
     */
    async updateStoryBibleForSelectedChapters({
      selectedChapterIds = [],
      modelId = 'gemini-3.5-flash-lite',
      thinkingLevel = 'low',
      userDirective = ''
    }) {
      const apiKey = (
        this.stage2.config.apiKey ||
        localStorage.getItem('noir_gemini_api_key') ||
        ''
      ).trim();

      if (!apiKey) {
        throw new Error(
          'Bạn chưa có Gemini API Key hợp lệ! Vui lòng nhập API Key trước.'
        );
      }

      const allChapters = [...this.core.approvalGate.chapters].sort(
        (a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0)
      );

      const targetChapters =
        selectedChapterIds.length > 0
          ? allChapters.filter((c) => selectedChapterIds.includes(c.id))
          : [this.core.approvalGate.getActiveChapter()].filter(Boolean);

      if (targetChapters.length === 0) {
        throw new Error('Không có chương nào được chọn để cập nhật Story Bible.');
      }

      // Tìm tất cả các chương đứng trước các chương được chọn (VD: chọn Ch.2 & Ch.3 -> tự động gom nền Ch.1)
      const maxSelectedIndex = Math.max(
        ...targetChapters.map((c) => allChapters.indexOf(c))
      );
      const precedingChapters = allChapters
        .slice(0, maxSelectedIndex)
        .filter((c) => !selectedChapterIds.includes(c.id));

      const precedingContinuityText =
        precedingChapters.length > 0
          ? precedingChapters
              .map((c) => {
                const autoSum =
                  c.summary && c.summary.trim()
                    ? c.summary
                    : this.core.docParser.generateLocalZeroTokenSummary(
                        c.content || '',
                        4
                      );
                return `• [MẠCH NỀN TRƯỚC ĐÓ - ${
                  c.displayTitle || c.title
                } | Giờ: ${c.timelineTimestamp || '---'} | POV: ${
                  c.povCharacter || '---'
                }]:\n${autoSum || (c.content || '').slice(0, 1200)}`;
              })
              .join('\n\n')
          : '(Các chương đang chọn bắt đầu ngay từ Chương 1)';

      const selectedChaptersFullPayload = targetChapters
        .map(
          (c) =>
            `--- BẮT ĐẦU NỘI DUNG CHƯƠNG ĐƯỢC CHỌN: ${
              c.displayTitle || c.title
            } (Chương #${c.chapterNumber} | Giờ: ${
              c.timelineTimestamp || 'Chưa ghi'
            } | POV: ${c.povCharacter || 'Đa điểm nhìn'}) ---\n${(
              c.content || ''
            ).slice(0, 18000)}`
        )
        .join('\n\n');

      const selectedNamesList = targetChapters
        .map((c) => c.displayTitle || c.title)
        .join(', ');

      // Câu lệnh hệ thống cố định + tùy biến thông minh theo các chương đã chọn
      const fixedAndAdaptiveSystemPrompt = [
        `Bạn là Hệ Thống Quản Trị & Tổng Hợp Story Bible Liên Mạch Thông Minh cho tiểu thuyết.`,
        `QUY TẮC CỐ ĐỊNH BẮT BUỘC 100%:`,
        `1. BÁM SÁT KHUNG KIỂU MẪU (TEMPLATE LOCK): Tác giả đã khóa [KHUNG KIỂU MẪU STORY BIBLE] ở Mục 1. Bạn bắt buộc phải điền và cập nhật thông tin theo đúng từng đề mục của khung mẫu đó.`,
        `2. CHỐNG ĐỨT MẠCH STORY BIBLE (SMART CONTINUITY): Tác giả vừa chọn cập nhật các chương: [${selectedNamesList}]. Hệ thống đã đính kèm [MẠCH NỀN CÁC CHƯƠNG TRƯỚC ĐÓ] và [BẢN STORY BIBLE HIỆN TẠI]. Bạn phải tổng hợp liền mạch toàn bộ tiến trình từ Chương 1 xuyên suốt qua các chương trước đó đến hết [${selectedNamesList}], tuyệt đối không làm rơi rớt tình tiết hay nhân vật của các chương trước.`,
        `3. CHỈ ĐẠO ĐỊNH HƯỚNG TÙY BIẾN THEO CHƯƠNG ĐÃ CHỌN: ${
          userDirective || this.customBibleRuleDirective
        }`
      ].join('\n');

      const compositeUserPrompt = [
        `=== 1. KHUNG KIỂU MẪU STORY BIBLE BẮT BUỘC PHẢI TUÂN THỦ ===`,
        this.templateFrame,
        `\n=== 2. BẢN STORY BIBLE HIỆN TẠI (TRƯỚC KHI CẬP NHẬT) ===`,
        this.renderedBibleContent,
        `\n=== 3. TÓM TẮT MẠCH NỀN CÁC CHƯƠNG TRƯỚC ĐÓ (ĐỂ NỐI MẠCH KHÔNG BỊ MẤT) ===`,
        precedingContinuityText,
        `\n=== 4. TOÀN VĂN CÁC CHƯƠNG VỪA CHỌN CẬP NHẬT (${selectedNamesList}) ===`,
        selectedChaptersFullPayload,
        `\n=== 5. ĐỊNH HƯỚNG TÓM TẮT TÙY CHỈNH CHO CÁC CHƯƠNG ĐÃ CHỌN ===`,
        `Hãy kết hợp mạch nền ở Mục 2 & Mục 3 với diễn biến mới của [${selectedNamesList}] ở Mục 4 theo đúng định hướng: "${
          userDirective || this.customBibleRuleDirective
        }" và xuất ra bản Story Bible hoàn chỉnh đúng cấu trúc Mục 1.`
      ].join('\n');

      const statusEl = document.getElementById('s10-bible-sync-status');
      if (statusEl) {
        statusEl.textContent = `⏳ Đang chạy ${modelId} (Tư duy: ${thinkingLevel.toUpperCase()}) để cập nhật Story Bible liên mạch cho: ${selectedNamesList}...`;
      }

      const res = await this.stage3.generateContent({
        apiKey,
        modelId,
        thinkingLevel,
        systemInstruction: fixedAndAdaptiveSystemPrompt,
        userPrompt: compositeUserPrompt,
        temperature: 0.25,
        maxOutputTokens: 16384
      });

      this.saveRenderedBibleContent(res.text.trim());
      const renderedArea = document.getElementById('s10-bible-rendered-textarea');
      if (renderedArea) renderedArea.value = this.renderedBibleContent;

      if (statusEl) {
        statusEl.textContent = `✅ Đã cập nhật Story Bible liên mạch (${selectedNamesList}) bằng ${
          res.usedModel || modelId
        } lúc ${new Date().toLocaleTimeString('vi-VN', { hour12: false })}!`;
      }

      this.core.logger.log(
        `🏛️ Đã cập nhật Story Bible liên mạch cho [${selectedNamesList}]!`,
        'SUCCESS'
      );
      return this.renderedBibleContent;
    }

    /**
     * FIX BUG 12: Không gian Story Bible ở Tab 4 cho phép chọn nhiều chương (Chọn tất cả / Bỏ chọn)
     * và liên kết trực tiếp API Key người dùng + Model + Mức tư duy
     */
    injectStoryBibleMainWorkspace() {
      const mainWorkspace = document.getElementById('app-main-workspace');
      if (!mainWorkspace || document.getElementById('s10-story-bible-main-view')) return;

      const section = document.createElement('section');
      section.id = 's10-story-bible-main-view';
      section.className =
        'hidden flex-1 flex flex-col overflow-hidden bg-studioLightBg/95 dark:bg-zinc-950/95 z-10 p-4 gap-3 text-xs';

      section.innerHTML = `
        <!-- Thanh Điều Khiển Story Bible Tự Động & Chọn Chương Liên Mạch (Fix Bug 12) -->
        <div class="p-3.5 rounded-2xl border border-studioLightBorder dark:border-zinc-800 bg-studioLightPanel dark:bg-zinc-900 space-y-3 shadow-sm">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-sm font-bold uppercase text-emerald-400">
                  🏛️ STORY BIBLE TỰ ĐỘNG CẬP NHẬT THEO CỐT TRUYỆN & CHƯƠNG MỚI
                </h2>
                <span id="s10-template-lock-badge" class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                  🔒 KHUNG MẪU ĐÃ KHÓA
                </span>
              </div>
              <p id="s10-bible-sync-status" class="text-[11px] text-zinc-400 mt-0.5">
                Bạn có thể mở khóa để dán mẫu Story Bible riêng vào khung bên trái, chọn các chương cần tổng hợp và bấm Cập Nhật ngay.
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <button type="button" id="btn-s10-toggle-template-lock" class="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow transition">
                🔒 Đang Khóa Kiểu Mẫu (Bấm để Mở khóa sửa khung)
              </button>
              <button type="button" id="btn-s10-sync-bible-now" class="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition">
                ⚡ Cập Nhật Story Bible Theo Các Chương Đã Chọn Ngay
              </button>
            </div>
          </div>

          <!-- Dòng Chọn Chương + Chọn Model AI + Mức Tư Duy Liên Kết Thẳng API Key (Fix Bug 12) -->
          <div class="pt-2.5 border-t border-studioLightBorder dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
            
            <!-- Dropdown Chọn Chương Để Cập Nhật Story Bible -->
            <div class="relative">
              <button type="button" id="btn-bug12-toggle-chap-dropdown" class="px-3 py-1.5 rounded-lg border border-emerald-500/50 bg-zinc-950 text-emerald-400 font-bold text-xs flex items-center gap-2">
                <span>📚 Chọn Chương Để Cập Nhật Story Bible</span>
                <span id="badge-bug12-chap-count" class="px-1.5 py-0.2 rounded bg-emerald-600 text-white font-monoCode text-[10px]">Hiện tại</span>
                <span>▾</span>
              </button>

              <div id="bug12-chapter-dropdown-panel" class="hidden absolute left-0 top-10 w-80 p-3 rounded-xl border-2 border-emerald-500/60 bg-zinc-900 shadow-2xl z-40 space-y-2">
                <div class="flex items-center justify-between pb-1.5 border-b border-zinc-800">
                  <span class="font-bold text-emerald-400 text-[11px]">Tick chọn chương:</span>
                  <div class="flex gap-1">
                    <button type="button" id="btn-bug12-select-all" class="px-2 py-0.5 rounded bg-emerald-600/20 text-emerald-300 text-[10px] font-bold">Chọn tất cả</button>
                    <button type="button" id="btn-bug12-deselect-all" class="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-bold">Bỏ chọn</button>
                  </div>
                </div>
                <div id="bug12-chapter-checkbox-list" class="max-h-48 overflow-y-auto space-y-1"></div>
              </div>
            </div>

            <!-- Chọn Model & Mức Tư Duy Cho Tab 4 -->
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-[10px] font-bold uppercase text-amber-400">🤖 MÔ HÌNH AI CẬP NHẬT STORY BIBLE:</span>
              <select id="select-tab4-bible-model" class="px-2.5 py-1.5 rounded-lg border border-zinc-700 bg-zinc-950 text-white font-semibold text-xs">
                <option value="gemini-3.5-flash-lite">Gemini 3.5 / 2.5 Flash-Lite (Siêu Nhẹ, Tiết Kiệm Hạn Mức)</option>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Nhanh & Cân bằng)</option>
                <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro Preview (Tư duy sâu)</option>
              </select>

              <span class="text-[10px] font-bold uppercase text-zinc-400">MỨC TƯ DUY:</span>
              <select id="select-tab4-bible-thinking" class="px-2.5 py-1.5 rounded-lg border border-zinc-700 bg-zinc-950 text-emerald-400 font-bold text-xs">
                <option value="low">⚡ Thấp (Low - Nhanh & Tiết kiệm)</option>
                <option value="medium">⚖️ Vừa (Medium)</option>
                <option value="high">🧠 Cao (High)</option>
              </select>
            </div>

          </div>
        </div>

        <!-- Khung 2 Cột: Cột Trái (Khung Kiểu Mẫu) | Cột Phải (Nội Dung Story Bible Chính Thức) -->
        <div class="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
          <div class="lg:col-span-5 rounded-2xl border border-studioLightBorder dark:border-zinc-800 bg-studioLightPanel dark:bg-zinc-900 p-3.5 flex flex-col overflow-hidden">
            <div class="flex items-center justify-between pb-2 mb-2 border-b border-studioLightBorder dark:border-zinc-800">
              <span class="font-bold uppercase text-amber-400">📐 1. Khung Dàn Mẫu Story Bible (Template Frame)</span>
              <button type="button" id="btn-s10-reset-default-template" class="text-[10px] text-zinc-400 hover:underline">Khôi phục mẫu gốc</button>
            </div>
            <textarea id="s10-bible-template-textarea" class="flex-1 w-full p-3 rounded-xl border border-studioLightBorder dark:border-zinc-800 bg-studioLightBg dark:bg-zinc-950 font-monoCode text-xs leading-relaxed select-text resize-none focus:outline-none"></textarea>
          </div>

          <div class="lg:col-span-7 rounded-2xl border border-studioLightBorder dark:border-zinc-800 bg-studioLightPanel dark:bg-zinc-900 p-3.5 flex flex-col overflow-hidden">
            <div class="flex items-center justify-between pb-2 mb-2 border-b border-studioLightBorder dark:border-zinc-800">
              <span class="font-bold uppercase text-emerald-400">📖 2. Nội Dung Story Bible Chính Thức (Bám Sát Mẫu Đã Khóa)</span>
              <button type="button" id="btn-s10-save-rendered-bible" class="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-[11px]">💾 Lưu Bản Story Bible</button>
            </div>
            <textarea id="s10-bible-rendered-textarea" class="flex-1 w-full p-4 rounded-xl border border-studioLightBorder dark:border-zinc-800 bg-studioLightBg dark:bg-zinc-950 novel-prose text-xs leading-relaxed select-text resize-none focus:outline-none"></textarea>
          </div>
        </div>
      `;

      mainWorkspace.appendChild(section);

      const tplArea = document.getElementById('s10-bible-template-textarea');
      const renArea = document.getElementById('s10-bible-rendered-textarea');
      if (tplArea) tplArea.value = this.templateFrame;
      if (renArea) renArea.value = this.renderedBibleContent;
      this.refreshTemplateLockUI();

      tplArea?.addEventListener('input', () => this.saveTemplateFrame(tplArea.value));
      renArea?.addEventListener('input', () => this.saveRenderedBibleContent(renArea.value));

      document
        .getElementById('btn-s10-toggle-template-lock')
        ?.addEventListener('click', () => this.toggleTemplateLock());

      document
        .getElementById('btn-s10-reset-default-template')
        ?.addEventListener('click', () => {
          if (this.isTemplateLocked) {
            alert('Hãy bấm Mở khóa kiểu mẫu trước khi đặt lại mẫu gốc.');
            return;
          }
          tplArea.value = DEFAULT_UNIFIED_STORY_BIBLE_TEMPLATE;
          this.saveTemplateFrame(DEFAULT_UNIFIED_STORY_BIBLE_TEMPLATE);
        });

      document
        .getElementById('btn-s10-save-rendered-bible')
        ?.addEventListener('click', () => {
          this.saveRenderedBibleContent(renArea.value);
          window.StudioStage7?.saveEngine?.showSaveToastNotification(
            '💾 Đã lưu nội dung Story Bible!'
          );
        });

      // Dropdown chọn chương ở Tab 4 (Fix Bug 12)
      const ddPanel = document.getElementById('bug12-chapter-dropdown-panel');
      document
        .getElementById('btn-bug12-toggle-chap-dropdown')
        ?.addEventListener('click', () => {
          if (ddPanel.classList.contains('hidden')) {
            this.renderTab4ChapterChecklist();
          }
          ddPanel.classList.toggle('hidden');
        });

      document
        .getElementById('btn-bug12-select-all')
        ?.addEventListener('click', () => {
          document
            .querySelectorAll('.bug12-tab4-chap-chk')
            .forEach((c) => (c.checked = true));
          this.updateTab4BadgeCount();
        });

      document
        .getElementById('btn-bug12-deselect-all')
        ?.addEventListener('click', () => {
          document
            .querySelectorAll('.bug12-tab4-chap-chk')
            .forEach((c) => (c.checked = false));
          this.updateTab4BadgeCount();
        });

      const syncBtn = document.getElementById('btn-s10-sync-bible-now');
      syncBtn?.addEventListener('click', async () => {
        this.core.controller.syncActiveEditorFieldsToChapterObject();
        let checkedIds = [
          ...document.querySelectorAll('.bug12-tab4-chap-chk:checked')
        ].map((c) => c.value);

        if (checkedIds.length === 0 && this.core.approvalGate.activeChapterId) {
          checkedIds = [this.core.approvalGate.activeChapterId];
        }

        const modelId =
          document.getElementById('select-tab4-bible-model')?.value ||
          'gemini-3.5-flash-lite';
        const thinkingLevel =
          document.getElementById('select-tab4-bible-thinking')?.value || 'low';

        syncBtn.disabled = true;
        syncBtn.textContent = '⏳ Đang cập nhật Story Bible...';
        try {
          await this.updateStoryBibleForSelectedChapters({
            selectedChapterIds: checkedIds,
            modelId,
            thinkingLevel
          });
        } catch (err) {
          alert(err.message);
        } finally {
          syncBtn.disabled = false;
          syncBtn.textContent =
            '⚡ Cập Nhật Story Bible Theo Các Chương Đã Chọn Ngay';
        }
      });
    }

    renderTab4ChapterChecklist() {
      const box = document.getElementById('bug12-chapter-checkbox-list');
      if (!box) return;
      const chaps = this.core.approvalGate.chapters;
      const activeId = this.core.approvalGate.activeChapterId;
      box.innerHTML = chaps
        .map(
          (c) => `
          <label class="flex items-center justify-between gap-2 p-1.5 rounded hover:bg-zinc-800 cursor-pointer">
            <div class="flex items-center gap-2 truncate">
              <input type="checkbox" value="${c.id}" ${
            c.id === activeId ? 'checked' : ''
          } class="bug12-tab4-chap-chk rounded accent-emerald-500" />
              <span class="truncate text-xs text-zinc-200">${
                c.displayTitle || c.title
              }</span>
            </div>
            <span class="text-[10px] font-monoCode text-emerald-400 shrink-0">${(
              c.wordCount || 0
            ).toLocaleString('vi-VN')}w</span>
          </label>
        `
        )
        .join('');

      box.querySelectorAll('.bug12-tab4-chap-chk').forEach((chk) => {
        chk.addEventListener('change', () => this.updateTab4BadgeCount());
      });
      this.updateTab4BadgeCount();
    }

    updateTab4BadgeCount() {
      const cnt = document.querySelectorAll('.bug12-tab4-chap-chk:checked').length;
      const badge = document.getElementById('badge-bug12-chap-count');
      if (badge) badge.textContent = cnt > 0 ? `${cnt} chương` : 'Hiện tại';
    }
  }

  // ==========================================================================
  // MODULE 14: ĐỒNG HỒ POMODORO, TÀI KHOẢN & LINH VẬT VIÊN BI SỐ 8 CUTE
  //            (HỢP NHẤT STAGE 10, 11, 13 & 15)
  // ==========================================================================
  class UnifiedPomodoroAndMascotSystem {
    constructor(core, stage2, stage3) {
      this.core = core;
      this.stage2 = stage2;
      this.stage3 = stage3;

      this.workMin = 25;
      this.breakMin = 5;
      this.remainingSec = 25 * 60;
      this.isRunning = false;
      this.timerId = null;
    }

    init() {
      this.injectPomodoroWidget();
      this.injectMascotBiWidget();
    }

    injectPomodoroWidget() {
      if (document.getElementById('s11-pomodoro-floating-widget')) return;
      const pomo = document.createElement('div');
      pomo.id = 's11-pomodoro-floating-widget';
      pomo.className =
        'p-4 rounded-2xl border border-studioLightBorder dark:border-zinc-800 bg-studioLightPanel dark:bg-zinc-900 flex flex-wrap items-center justify-between gap-3 text-xs';
      pomo.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold">🍅 Pomodoro Tập Trung</span>
          <span id="s11-pomo-time-display" class="font-monoCode font-extrabold text-xl text-emerald-400">25:00</span>
        </div>
        <div class="flex items-center gap-2">
          <input id="s11-pomo-work-min" type="number" min="5" max="120" value="25" class="w-16 px-2 py-1 rounded border border-zinc-700 bg-zinc-950 font-monoCode text-center" title="Số phút phiên tập trung" />
          <button type="button" id="btn-s11-pomo-start" class="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold">▶ Bắt đầu</button>
          <button type="button" id="btn-s11-pomo-reset" class="px-3 py-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-800 font-bold">↺ Đặt lại</button>
        </div>
      `;
      document.body.appendChild(pomo);

      const timeEl = document.getElementById('s11-pomo-time-display');
      const startBtn = document.getElementById('btn-s11-pomo-start');
      const minInput = document.getElementById('s11-pomo-work-min');

      const renderTime = () => {
        const m = Math.floor(this.remainingSec / 60);
        const s = this.remainingSec % 60;
        if (timeEl) {
          timeEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(
            2,
            '0'
          )}`;
        }
      };

      startBtn?.addEventListener('click', () => {
        if (this.isRunning) {
          this.isRunning = false;
          clearInterval(this.timerId);
          startBtn.textContent = '▶ Tiếp tục';
        } else {
          this.isRunning = true;
          startBtn.textContent = '⏸ Tạm dừng';
          this.timerId = setInterval(() => {
            if (this.remainingSec > 0) {
              this.remainingSec--;
              renderTime();
            } else {
              clearInterval(this.timerId);
              this.isRunning = false;
              startBtn.textContent = '▶ Bắt đầu';
              window.StudioStage7?.saveEngine?.showSaveToastNotification(
                '🔔 Đã hoàn thành phiên tập trung Pomodoro!'
              );
            }
          }, 1000);
        }
      });

      document.getElementById('btn-s11-pomo-reset')?.addEventListener('click', () => {
        this.isRunning = false;
        clearInterval(this.timerId);
        this.workMin = Math.max(1, parseInt(minInput?.value || '25', 10));
        this.remainingSec = this.workMin * 60;
        if (startBtn) startBtn.textContent = '▶ Bắt đầu';
        renderTime();
      });
    }

    injectMascotBiWidget() {
      if (document.getElementById('s11-mascot-bi-corner')) return;

      const dock = document.createElement('div');
      dock.id = 's11-mascot-bi-corner';
      dock.className =
        'fixed bottom-8 right-5 z-50 flex flex-col items-end gap-1 select-none';
      dock.innerHTML = `
        <div id="btn-s11-open-bi-hub" class="cursor-pointer" title="Trợ lý Linh vật Viên Bi số 8">
          <div class="w-12 h-12 rounded-full bg-zinc-900 border-2 border-emerald-400 shadow-2xl flex items-center justify-center text-lg font-extrabold text-white hover:scale-105 transition">
            🎱
          </div>
        </div>
      `;
      document.body.appendChild(dock);
    }
  }

  // ==========================================================================
  // MODULE 15: KIẾN TRÚC 6 MÀN HÌNH ĐỘC LẬP & TỐI ƯU FRONT-END MỤC 5 (FIX BUG 13)
  //            (HỢP NHẤT STAGE 14 & STAGE 15)
  // ==========================================================================
  class UnifiedSixScreensNavigator {
    constructor(core, stage2, bibleEngine) {
      this.core = core;
      this.stage2 = stage2;
      this.bibleEngine = bibleEngine;
      this.currentScreen = 'SCREEN_1_WRITE';
    }

    init() {
      this.injectMasterSixTabsBar();
      this.injectScreen5WithThreeToggleButtons();
      this.injectScreen6SystemTools();
      this.navigateToScreen('SCREEN_1_WRITE');
    }

    injectMasterSixTabsBar() {
      if (document.getElementById('s14-master-top-nav')) return;

      const style = document.createElement('style');
      style.textContent = `
        #app-top-header { display: none !important; }
        #s14-master-top-nav {
          height: 50px;
          background: #141417;
          border-bottom: 1px solid #27272A;
          z-index: 90;
        }
        .s14-nav-tab {
          padding: 6px 13px;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 700;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .s14-nav-tab.active-tab {
          background-color: #059669;
          color: #FFFFFF !important;
        }
        .s14-nav-tab:not(.active-tab) {
          color: #A1A1AA;
        }
        .s14-nav-tab:not(.active-tab):hover {
          background-color: rgba(16, 185, 129, 0.14);
          color: #34D399;
        }
        #s8-mini-music-widget.s14-docked-music {
          position: static !important;
          width: 100% !important;
          max-width: 100% !important;
          box-shadow: none !important;
        }
      `;
      document.head.appendChild(style);

      const nav = document.createElement('header');
      nav.id = 's14-master-top-nav';
      nav.className =
        'w-full px-4 flex items-center justify-between gap-2 shrink-0 select-none';

      nav.innerHTML = `
        <div class="flex items-center gap-2 shrink-0">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span class="font-bold text-xs text-emerald-400">Web viết tiểu thuyết của Bi</span>
        </div>

        <div class="flex items-center gap-1.5 overflow-x-auto py-1">
          <button type="button" data-s14-tab="SCREEN_1_WRITE" class="s14-nav-tab active-tab">✍️ 1. Bàn Viết Truyện</button>
          <button type="button" data-s14-tab="SCREEN_2_FILES" class="s14-nav-tab">📂 2. Chương & File Nguồn</button>
          <button type="button" data-s14-tab="SCREEN_3_AI" class="s14-nav-tab">🤖 3. Trợ Lý AI & Chat Gemini</button>
          <button type="button" data-s14-tab="SCREEN_4_BIBLE" class="s14-nav-tab">🏛️ 4. Story Bible & Nhân Vật</button>
          <button type="button" data-s14-tab="SCREEN_5_AMBIENCE" class="s14-nav-tab">🎵 5. Nhạc, Không Gian & Chữ</button>
          <button type="button" data-s14-tab="SCREEN_6_SYSTEM" class="s14-nav-tab">⚙️ 6. Xuất File, Vá Lỗi & Cài Đặt</button>
        </div>

        <div class="flex items-center gap-1.5 shrink-0">
          <button type="button" id="btn-s14-quick-theme" class="px-2.5 py-1 rounded border border-zinc-700 text-xs">☀️/🌙</button>
        </div>
      `;

      document.body.prepend(nav);

      nav.querySelectorAll('.s14-nav-tab').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.navigateToScreen(btn.getAttribute('data-s14-tab'));
        });
      });

      document
        .getElementById('btn-s14-quick-theme')
        ?.addEventListener('click', () => {
          document.getElementById('btn-toggle-theme')?.click();
        });
    }

    /**
     * FIX BUG 13: Ở mục 5. Nhạc, Không Gian & Chữ:
     * Thay vì show thẳng cả 3 khung (Trình phát nhạc, Pomodoro, Kiểu chữ),
     * chỉ hiện 3 nút tùy chọn:
     * 1. [🎵 Mở trình phát nhạc]
     * 2. [⏱️ Mở Pomodoro]
     * 3. [🔤 Chỉnh cỡ chữ, khổ trang sách]
     * Khi bấm vào từng mục mới hiện cụ thể mục đó!
     */
    injectScreen5WithThreeToggleButtons() {
      const workspace = document.getElementById('app-main-workspace');
      if (!workspace || document.getElementById('s14-screen-5-ambience')) return;

      const screen5 = document.createElement('section');
      screen5.id = 's14-screen-5-ambience';
      screen5.className =
        'hidden flex-1 overflow-y-auto p-6 bg-studioLightBg/95 dark:bg-zinc-950/95 z-10';

      screen5.innerHTML = `
        <div class="max-w-4xl mx-auto space-y-5 text-xs">
          <div class="flex items-center justify-between border-b border-studioLightBorder dark:border-zinc-800 pb-4">
            <div>
              <h2 class="text-base font-bold text-emerald-400 uppercase">
                🎵 Màn Hình 5: Tùy Chọn Nhạc Nền, Đồng Hồ Pomodoro & Kiểu Chữ Trang Sách
              </h2>
              <p class="text-zinc-400 mt-0.5">
                Bấm vào từng mục bên dưới để mở công cụ tương ứng (Giúp giao diện gọn gàng, tối ưu tốc độ).
              </p>
            </div>
            <button type="button" class="btn-s14-back-to-write px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow">
              ✍️ Quay Lại Bàn Viết Truyện
            </button>
          </div>

          <!-- 3 NÚT TÙY CHỌN GỌN GÀNG (FIX BUG 13: BẤM VÀO MỤC NÀO MỚI HIỆN CỤ THỂ MỤC ĐÓ) -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <button type="button" data-bug13-target="s14-panel-music-box" class="bug13-toggle-option-btn p-4 rounded-2xl border-2 border-emerald-500/50 bg-studioLightPanel dark:bg-zinc-900 hover:bg-emerald-500/10 text-left transition flex items-center justify-between shadow">
              <div>
                <div class="text-sm font-bold text-emerald-400">🎵 1. Mở Trình Phát Nhạc</div>
                <div class="text-[11px] text-zinc-400 mt-0.5">Nhạc MP3, chỉnh tốc độ & lặp đoạn A-B</div>
              </div>
              <span class="bug13-arrow text-emerald-400 font-bold text-sm">▾</span>
            </button>

            <button type="button" data-bug13-target="s14-panel-pomodoro-box" class="bug13-toggle-option-btn p-4 rounded-2xl border-2 border-amber-500/50 bg-studioLightPanel dark:bg-zinc-900 hover:bg-amber-500/10 text-left transition flex items-center justify-between shadow">
              <div>
                <div class="text-sm font-bold text-amber-400">⏱️ 2. Mở Đồng Hồ Pomodoro</div>
                <div class="text-[11px] text-zinc-400 mt-0.5">Bấm giờ tập trung viết & nghỉ giải lao</div>
              </div>
              <span class="bug13-arrow text-amber-400 font-bold text-sm">▾</span>
            </button>

            <button type="button" data-bug13-target="s14-panel-typography-box" class="bug13-toggle-option-btn p-4 rounded-2xl border-2 border-indigo-500/50 bg-studioLightPanel dark:bg-zinc-900 hover:bg-indigo-500/10 text-left transition flex items-center justify-between shadow">
              <div>
                <div class="text-sm font-bold text-indigo-400">🔤 3. Chỉnh Cỡ Chữ & Khổ Trang Sách</div>
                <div class="text-[11px] text-zinc-400 mt-0.5">Font chữ, cỡ chữ (A-/A+) & giãn dòng</div>
              </div>
              <span class="bug13-arrow text-indigo-400 font-bold text-sm">▾</span>
            </button>
          </div>

          <!-- KHUNG CHI TIẾT 1: TRÌNH PHÁT NHẠC (ẨN MẶC ĐỊNH CHO ĐẾN KHI BẤM NÚT 1) -->
          <div id="s14-panel-music-box" class="hidden p-5 rounded-2xl border border-emerald-500/40 bg-studioLightPanel dark:bg-zinc-900 space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="font-bold uppercase text-sm text-emerald-400">🎵 Trình Phát Nhạc Nền & Tùy Chỉnh Dải Lặp A ➔ B</h3>
              <button type="button" data-bug13-close="s14-panel-music-box" class="text-zinc-400 hover:text-white font-bold">Thu gọn ▴</button>
            </div>
            <div id="s14-music-dock-slot"></div>
          </div>

          <!-- KHUNG CHI TIẾT 2: ĐỒNG HỒ POMODORO (ẨN MẶC ĐỊNH CHO ĐẾN KHI BẤM NÚT 2) -->
          <div id="s14-panel-pomodoro-box" class="hidden p-5 rounded-2xl border border-amber-500/40 bg-studioLightPanel dark:bg-zinc-900 space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="font-bold uppercase text-sm text-amber-400">⏱️ Đồng Hồ Tập Trung Pomodoro</h3>
              <button type="button" data-bug13-close="s14-panel-pomodoro-box" class="text-zinc-400 hover:text-white font-bold">Thu gọn ▴</button>
            </div>
            <div id="s14-pomodoro-dock-slot"></div>
          </div>

          <!-- KHUNG CHI TIẾT 3: CỠ CHỮ & KHỔ TRANG SÁCH (ẨN MẶC ĐỊNH CHO ĐẾN KHI BẤM NÚT 3) -->
          <div id="s14-panel-typography-box" class="hidden p-5 rounded-2xl border border-indigo-500/40 bg-studioLightPanel dark:bg-zinc-900 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="font-bold uppercase text-sm text-indigo-400">🔤 Tùy Chỉnh Cỡ Chữ, Font Chữ & Khổ Trang Sách Light Novel</h3>
              <button type="button" data-bug13-close="s14-panel-typography-box" class="text-zinc-400 hover:text-white font-bold">Thu gọn ▴</button>
            </div>
            <div id="s14-typography-dock-slot" class="space-y-3"></div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-800">
              <div>
                <label class="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Cỡ chữ bản thảo (px):</label>
                <input id="bug13-font-size-input" type="number" min="12" max="28" value="16" class="w-full px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-950 font-monoCode font-bold text-emerald-400" />
              </div>
              <div>
                <label class="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Khổ rộng trang sách:</label>
                <select id="bug13-page-width-select" class="w-full px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-950 font-semibold">
                  <option value="100%">Toàn khung rộng (100%)</option>
                  <option value="860px">Khổ Light Novel chuẩn (860px)</option>
                  <option value="720px">Khổ sách in tập trung (720px)</option>
                </select>
              </div>
              <div>
                <label class="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Giãn dòng (Line Height):</label>
                <select id="bug13-line-height-select" class="w-full px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-950 font-semibold">
                  <option value="1.6">1.6 (Gọn)</option>
                  <option value="1.85" selected>1.85 (Chuẩn sách)</option>
                  <option value="2.1">2.1 (Thoáng rộng)</option>
                </select>
              </div>
            </div>
          </div>

        </div>
      `;

      workspace.appendChild(screen5);

      // Gắn Trình phát nhạc, Pomodoro và Thanh kiểu chữ vào đúng 3 hộc ẩn/hiện
      const musicWidget = document.getElementById('s8-mini-music-widget');
      const musicSlot = document.getElementById('s14-music-dock-slot');
      if (musicWidget && musicSlot) {
        musicWidget.classList.add('s14-docked-music');
        musicSlot.appendChild(musicWidget);
      }

      const pomoWidget = document.getElementById('s11-pomodoro-floating-widget');
      const pomoSlot = document.getElementById('s14-pomodoro-dock-slot');
      if (pomoWidget && pomoSlot) {
        pomoSlot.appendChild(pomoWidget);
      }

      const readerBar = document.getElementById('stage6-reader-typography-bar');
      const typoSlot = document.getElementById('s14-typography-dock-slot');
      if (readerBar && typoSlot) {
        typoSlot.appendChild(readerBar);
      }

      // Sự kiện bấm vào từng nút tùy chọn để hiện/ẩn cụ thể từng mục (Fix Bug 13)
      screen5.querySelectorAll('.bug13-toggle-option-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const targetId = btn.getAttribute('data-bug13-target');
          const targetPanel = document.getElementById(targetId);
          if (!targetPanel) return;
          const willShow = targetPanel.classList.contains('hidden');
          targetPanel.classList.toggle('hidden', !willShow);
          const arrow = btn.querySelector('.bug13-arrow');
          if (arrow) arrow.textContent = willShow ? '▴' : '▾';
        });
      });

      screen5.querySelectorAll('[data-bug13-close]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const targetId = btn.getAttribute('data-bug13-close');
          document.getElementById(targetId)?.classList.add('hidden');
        });
      });

      // Liên kết chỉnh cỡ chữ và khổ trang sách trong Mục 3
      document
        .getElementById('bug13-font-size-input')
        ?.addEventListener('input', (e) => {
          const px = Math.max(12, Math.min(28, parseInt(e.target.value || '16', 10)));
          document.documentElement.style.setProperty('--novel-font-size', `${px}px`);
        });

      document
        .getElementById('bug13-page-width-select')
        ?.addEventListener('change', (e) => {
          const area = document.getElementById('textarea-chapter-content');
          if (area) {
            area.style.maxWidth = e.target.value;
            area.style.margin = e.target.value === '100%' ? '0' : '0 auto';
          }
        });

      document
        .getElementById('bug13-line-height-select')
        ?.addEventListener('change', (e) => {
          document.documentElement.style.setProperty(
            '--novel-line-height',
            e.target.value
          );
        });
    }

    injectScreen6SystemTools() {
      const workspace = document.getElementById('app-main-workspace');
      if (!workspace || document.getElementById('s14-screen-6-system')) return;

      const screen6 = document.createElement('section');
      screen6.id = 's14-screen-6-system';
      screen6.className =
        'hidden flex-1 overflow-y-auto p-6 bg-studioLightBg/95 dark:bg-zinc-950/95 z-10';

      screen6.innerHTML = `
        <div class="max-w-5xl mx-auto space-y-6 text-xs">
          <div class="flex items-center justify-between border-b border-studioLightBorder dark:border-zinc-800 pb-4">
            <h2 class="text-base font-bold text-emerald-400 uppercase">
              ⚙️ Màn Hình 6: Xuất File Bản Thảo, Cấu Hình API Key & Hướng Dẫn Sử Dụng
            </h2>
            <button type="button" class="btn-s14-back-to-write px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow">
              ✍️ Quay Lại Bàn Viết Truyện
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-5 rounded-2xl border border-amber-500/40 bg-studioLightPanel dark:bg-zinc-900 space-y-3 flex flex-col justify-between">
              <div>
                <div class="text-sm font-bold text-amber-400">📤 1. Xuất File .DOCX / .PDF / .TXT</div>
                <p class="text-zinc-400 mt-1">Xuất chương hiện tại hoặc toàn bộ các chương đã duyệt ra file Word, PDF hoặc TXT.</p>
              </div>
              <button type="button" id="btn-s6-card-export" class="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold">Mở Bộ Xuất File</button>
            </div>

            <div class="p-5 rounded-2xl border border-emerald-500/40 bg-studioLightPanel dark:bg-zinc-900 space-y-3 flex flex-col justify-between">
              <div>
                <div class="text-sm font-bold text-emerald-400">🔑 2. Cấu Hình Gemini API Key & Model</div>
                <p class="text-zinc-400 mt-1">Kiểm tra, thay đổi Gemini API Key hoặc quét danh sách mô hình mới nhất.</p>
              </div>
              <button type="button" id="btn-s6-card-apikey" class="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold">Mở Cấu Hình API Key</button>
            </div>

            <div class="p-5 rounded-2xl border border-indigo-500/40 bg-studioLightPanel dark:bg-zinc-900 space-y-3 flex flex-col justify-between">
              <div>
                <div class="text-sm font-bold text-indigo-400">🎬 3. Video Hướng Dẫn Toàn Bộ Tính Năng</div>
                <p class="text-zinc-400 mt-1">Xem video hướng dẫn chi tiết từng nút bấm và quy trình sáng tác từ A đến Z.</p>
              </div>
              <button type="button" id="btn-s6-card-tutorial" class="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold">Mở Video Hướng Dẫn</button>
            </div>
          </div>
        </div>
      `;

      workspace.appendChild(screen6);

      document.querySelectorAll('.btn-s14-back-to-write').forEach((btn) => {
        btn.addEventListener('click', () =>
          this.navigateToScreen('SCREEN_1_WRITE')
        );
      });

      document
        .getElementById('btn-s6-card-export')
        ?.addEventListener('click', () => {
          document
            .getElementById('modal-s6-custom-exporter')
            ?.classList.remove('hidden');
        });

      document
        .getElementById('btn-s6-card-apikey')
        ?.addEventListener('click', () => {
          document.getElementById('btn-open-ai-settings')?.click();
        });

      document
        .getElementById('btn-s6-card-tutorial')
        ?.addEventListener('click', () => {
          window.StudioStage10?.openGuideWithVideoModal?.();
        });
    }

    navigateToScreen(screenId) {
      this.currentScreen = screenId;
      document.body.setAttribute('data-s14-screen', screenId);

      document.querySelectorAll('.s14-nav-tab').forEach((tab) => {
        tab.classList.toggle(
          'active-tab',
          tab.getAttribute('data-s14-tab') === screenId
        );
      });

      const leftPane = document.getElementById('left-sidebar-pane');
      const centerPane = document.getElementById('center-editor-pane');
      const rightPane = document.getElementById('right-bible-pane');
      const bibleView = document.getElementById('s10-story-bible-main-view');
      const screen5 = document.getElementById('s14-screen-5-ambience');
      const screen6 = document.getElementById('s14-screen-6-system');
      const beatsLeftCol = document.getElementById('pane-left-beats');
      const manuscriptRightCol = document.getElementById('pane-right-manuscript');
      const telemetryBar = document.getElementById(
        'stage2-telemetry-mount-point'
      );

      // Ẩn tất cả trước khi bật đúng màn hình
      leftPane?.classList.add('hidden');
      centerPane?.classList.add('hidden');
      rightPane?.classList.add('hidden');
      bibleView?.classList.add('hidden');
      screen5?.classList.add('hidden');
      screen6?.classList.add('hidden');

      if (screenId === 'SCREEN_1_WRITE') {
        centerPane?.classList.remove('hidden');
        beatsLeftCol?.classList.add('hidden');
        telemetryBar?.classList.add('hidden');
        if (manuscriptRightCol) {
          manuscriptRightCol.className =
            'lg:col-span-12 flex flex-col overflow-hidden';
        }
      } else if (screenId === 'SCREEN_2_FILES') {
        leftPane?.classList.remove('hidden');
        centerPane?.classList.remove('hidden');
        beatsLeftCol?.classList.add('hidden');
        telemetryBar?.classList.add('hidden');
        if (manuscriptRightCol) {
          manuscriptRightCol.className =
            'lg:col-span-12 flex flex-col overflow-hidden';
        }
      } else if (screenId === 'SCREEN_3_AI') {
        centerPane?.classList.remove('hidden');
        beatsLeftCol?.classList.remove('hidden');
        telemetryBar?.classList.remove('hidden');
        if (manuscriptRightCol) {
          manuscriptRightCol.className =
            'lg:col-span-7 flex flex-col overflow-hidden';
        }
      } else if (screenId === 'SCREEN_4_BIBLE') {
        rightPane?.classList.remove('hidden');
        bibleView?.classList.remove('hidden');
        this.bibleEngine.refreshTemplateLockUI();
      } else if (screenId === 'SCREEN_5_AMBIENCE') {
        screen5?.classList.remove('hidden');
      } else if (screenId === 'SCREEN_6_SYSTEM') {
        screen6?.classList.remove('hidden');
      }

      // Phát sự kiện để Stage 16/17 đồng bộ trạng thái ẩn/hiện khung POV (Fix Bug 3 & Bug 4)
      window.dispatchEvent(
        new CustomEvent('studio:screen-changed', { detail: { screenId } })
      );
    }
  }

  // ==========================================================================
  // KHỞI ĐỘNG ĐỒNG BỘ TOÀN BỘ FILE HỢP NHẤT (STAGE 1 -> STAGE 15)
  // ==========================================================================
  const smartBibleEngine = new SmartMultiChapterStoryBibleEngine(
    window.StudioCore,
    stage2Manager,
    stage3Engine
  );
  const pomoAndMascot = new UnifiedPomodoroAndMascotSystem(
    window.StudioCore,
    stage2Manager,
    stage3Engine
  );
  const sixScreensNav = new UnifiedSixScreensNavigator(
    window.StudioCore,
    stage2Manager,
    smartBibleEngine
  );

  window.StudioStage10 = {
    bibleEngine: smartBibleEngine,
    switchCorePillar: (pillar) => {
      if (pillar === 'STORY_BIBLE') {
        sixScreensNav.navigateToScreen('SCREEN_4_BIBLE');
      } else if (pillar === 'FILES') {
        sixScreensNav.navigateToScreen('SCREEN_2_FILES');
      } else if (pillar === 'GEMINI_CHAT') {
        sixScreensNav.navigateToScreen('SCREEN_3_AI');
      } else {
        sixScreensNav.navigateToScreen('SCREEN_1_WRITE');
      }
    },
    openGuideWithVideoModal: () => {
      document.getElementById('modal-s10-video-guide')?.classList.remove('hidden');
    }
  };

  window.StudioStage11 = {
    pomodoroTimer: pomoAndMascot,
    mascotBi: {
      featureDirectory: [],
      speakVietnameseText: () => {}
    }
  };

  window.StudioStage12 = {
    perfOptimizer: {},
    streamingEngine: stage3Engine,
    novelistSuite: {}
  };

  window.StudioStage13 = {
    i18n: { currentLang: 'vi', applyLanguage: () => {} },
    biAgent: { setBiPose: () => {}, voiceEngine: { speak: () => {} } }
  };

  window.StudioStage14 = {
    navigator: sixScreensNav
  };

  window.StudioStage15 = {
    bibleEngine: smartBibleEngine,
    navigator: sixScreensNav
  };

  window.addEventListener('DOMContentLoaded', async () => {
    await window.StudioCore.controller.init();
    stage2Manager.initUI();
    stage6And7Studio.init();
    stage8And9Audio.init();
    smartBibleEngine.init();
    pomoAndMascot.init();
    sixScreensNav.init();
  });
})();