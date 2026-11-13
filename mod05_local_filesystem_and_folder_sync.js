/**
 * ============================================================================
 * MODULE 05: LOCAL FILE SYSTEM ACCESS API & 6-FOLDER WORKSPACE SYNC ENGINE
 * ============================================================================
 * Phiên bản: v38.0.0-SUPREME-MODULAR (2026)
 * Tệp: mod05_local_filesystem_and_folder_sync.js
 * Nhiệm vụ:
 *   1. Kết nối trực tiếp một Thư mục Ổ cứng trên máy tính Windows / macOS
 *      thông qua File System Access API (`window.showDirectoryPicker`), tự động
 *      tạo đủ 6 thư mục con chuẩn hóa (`01_Chuong_Goc_Chua_Duyet` ...
 *      `06_Sao_Luu_Code_Va_Ban_Thao`).
 *   2. Lưu trữ & phục hồi `FileSystemDirectoryHandle` vào kho IndexedDB
 *      `workspace_handles`, tự động kiểm tra và gia hạn quyền đọc/ghi.
 *   3. Cung cấp bộ API đồng bộ hai chiều (`window.NoirStudio.fsEngine`):
 *      - `isSupported()`, `tryRestoreSavedFolderHandle()`, `requestConnectFolder()`
 *      - `ensureSubFolders()`, `writeTextFile(subFolder, fileName, content)`
 *      - `readTextFile(subFolder, fileName)`, `listFilesInSubFolder(subFolder)`
 *      - `syncAllManuscriptsToLocalFolder()`, `importMissingChaptersFromLocalFolder()`
 *      - `updateHeaderStatusUI(connected, folderName)` cập nhật `#btn-connect-local-folder`.
 *   4. Trên Điện thoại / Trình duyệt không hỗ trợ `showDirectoryPicker`, tự động
 *      chuyển sang chế độ Xuất Gói Thư Mục Ảo (.HTML Bundle / Tải xuống sạch sẽ)
 *      để không bao giờ báo lỗi văng màn hình.
 * ============================================================================
 */

(function initNoirStudioLocalFilesystemModule(globalScope) {
  'use strict';

  const root = globalScope || (typeof window !== 'undefined' ? window : globalThis);
  root.NoirStudio = root.NoirStudio || {};
  const NS = root.NoirStudio;

  // ==========================================================================
  // PHẦN 1: DANH MỤC 6 THƯ MỤC CHUẨN & QUY TẮC ĐẶT TÊN TỆP AN TOÀN ĐA HỆ ĐIỀU HÀNH
  // ==========================================================================

  const DEFAULT_WORKBOOK_FOLDERS = Object.freeze([
    '01_Chuong_Goc_Chua_Duyet',
    '02_Chuong_Da_Duyet',
    '03_Story_Bible_Local',
    '04_Chi_Muc_Chong_Quen',
    '05_Bang_Trang_Y_Tuong',
    '06_Sao_Luu_Code_Va_Ban_Thao'
  ]);

  const HANDLE_STORAGE_KEY = 'noir_studio_root_dir_handle_v1';
  const SYNC_META_STORAGE_KEY = 'noir_v38_local_fs_sync_metadata';
  const REMEMBERED_FOLDER_META_KEY = 'noir_workspace_remembered_folder_v1';
  const REMEMBERED_FOLDER_IDB_KEY = '__noir_persist_folder_meta_v1';
  const MOBILE_WORKSPACE_IDB_KEY = '__noir_persist_mobile_workspace_v1';
  const FOLDER_PREF_COOKIE_NAME = 'noir_studio_folder_ck';

  function writeSafeHttpPreferenceCookie(cookieName, rawJson) {
    try {
      if (typeof document === 'undefined' || typeof location === 'undefined') return false;
      if (!String(location.protocol || '').startsWith('http')) return false;
      const encoded = encodeURIComponent(String(rawJson || ''));
      if (encoded.length > 3500) return false;
      document.cookie = `${cookieName}=${encoded}; max-age=31536000; path=/; SameSite=Lax`;
      return true;
    } catch (_e) {
      return false;
    }
  }

  function readSafeHttpPreferenceCookie(cookieName) {
    try {
      if (typeof document === 'undefined' || !document.cookie) return '';
      const prefix = `${cookieName}=`;
      const parts = document.cookie.split(';');
      for (let i = 0; i < parts.length; i += 1) {
        const item = parts[i].trim();
        if (item.startsWith(prefix)) {
          return decodeURIComponent(item.slice(prefix.length));
        }
      }
    } catch (_e) {
      // Bỏ qua
    }
    return '';
  }

  class CrossPlatformFilePathSanitizer {
    /**
     * Làm sạch tên file hợp lệ cho Windows NTFS, macOS APFS và Linux Ext4:
     * loại bỏ ký tự cấm `<>:"/\|?*`, tên thiết bị Windows (`CON`, `PRN`, `AUX`),
     * chuẩn hóa dấu tiếng Việt thành slug rõ ràng.
     */
    sanitizeFileName(rawName, extension = 'txt') {
      const utils = NS.utils;
      let base = String(rawName || 'ban_thao').trim();
      const reservedWinNames = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;

      if (utils && typeof utils.stripVietnameseDiacritics === 'function') {
        base = utils.stripVietnameseDiacritics(base);
      }

      base = base
        .replace(/[<>:"/\\|?*\x00-\x1f]+/g, '_')
        .replace(/\s+/g, '_')
        .replace(/_{2,}/g, '_')
        .replace(/^[._]+|[._]+$/g, '')
        .slice(0, 82);

      if (!base || reservedWinNames.test(base)) {
        base = `Chuong_${Date.now()}`;
      }

      const cleanExt = String(extension || '')
        .replace(/^\.+/, '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toLowerCase();

      if (!cleanExt) return base;
      if (base.toLowerCase().endsWith(`.${cleanExt}`)) return base;
      return `${base}.${cleanExt}`;
    }

    /**
     * Đặt tên tệp theo số thứ tự chương chuẩn (`001_Ten_Chuong.txt`)
     * để khi mở bằng File Explorer luôn xếp đúng thứ tự từ Chương 1 đến Chương cuối.
     */
    buildOrderedChapterFileName(chapterRecord, indexZeroBased = 0, ext = 'txt') {
      const orderNum = String((chapterRecord?.order ?? indexZeroBased) + 1).padStart(3, '0');
      const titleSlug = this.sanitizeFileName(
        chapterRecord?.displayTitle || chapterRecord?.title || `Chuong_${orderNum}`,
        ''
      );
      return `${orderNum}_${titleSlug}.${ext}`;
    }
  }

  // ==========================================================================
  // PHẦN 2: QUẢN LÝ QUYỀN TRUY CẬP THƯ MỤC & HÀM ĐỌC GHI ATOMIC FILE HANDLE
  // ==========================================================================

  class DirectoryPermissionGuardian {
    constructor() {
      this.permissionState = 'prompt';
    }

    async queryReadWritePermission(dirHandle) {
      if (!dirHandle || typeof dirHandle.queryPermission !== 'function') {
        return 'denied';
      }
      try {
        const res = await dirHandle.queryPermission({ mode: 'readwrite' });
        this.permissionState = res;
        return res;
      } catch (_) {
        return 'denied';
      }
    }

    async evaluateHandlePermission(dirHandle) {
      if (!dirHandle) {
        return { ok: false, state: 'denied', needsOneClickConfirm: false };
      }
      try {
        if (typeof dirHandle.queryPermission !== 'function') {
          this.permissionState = 'granted';
          return { ok: true, state: 'granted', needsOneClickConfirm: false };
        }
        const cur = await dirHandle.queryPermission({ mode: 'readwrite' });
        this.permissionState = cur;
        if (cur === 'granted') {
          return { ok: true, state: 'granted', needsOneClickConfirm: false };
        }
        if (typeof dirHandle.requestPermission === 'function') {
          try {
            const req = await dirHandle.requestPermission({ mode: 'readwrite' });
            this.permissionState = req;
            if (req === 'granted') {
              return { ok: true, state: 'granted', needsOneClickConfirm: false };
            }
            return {
              ok: false,
              state: req || 'denied',
              needsOneClickConfirm: req === 'prompt'
            };
          } catch (reqErr) {
            const isActivationErr =
              reqErr?.name === 'NotAllowedError' ||
              reqErr?.name === 'SecurityError' ||
              String(reqErr?.message || '').toLowerCase().includes('activation');
            this.permissionState = isActivationErr ? 'prompt' : 'denied';
            return {
              ok: false,
              state: isActivationErr ? 'prompt_expired' : 'denied',
              needsOneClickConfirm: isActivationErr
            };
          }
        }
      } catch (_e) {
        this.permissionState = 'denied';
      }
      return { ok: false, state: 'denied', needsOneClickConfirm: false };
    }

    async requestReadWritePermission(dirHandle) {
      const res = await this.evaluateHandlePermission(dirHandle);
      return Boolean(res.ok);
    }

    /**
     * Đọc danh sách toàn bộ file nằm trong một thư mục con (lọc bỏ file ẩn hệ thống)
     */
    async listDirectoryEntries(subDirHandle) {
      const results = [];
      if (!subDirHandle || typeof subDirHandle.values !== 'function') {
        return results;
      }
      try {
        for await (const entry of subDirHandle.values()) {
          if (entry.name.startsWith('.') || entry.name === 'desktop.ini') continue;
          let sizeBytes = 0;
          let lastModified = 0;
          if (entry.kind === 'file') {
            try {
              const fileObj = await entry.getFile();
              sizeBytes = fileObj.size || 0;
              lastModified = fileObj.lastModified || 0;
            } catch (_) {
              // Bỏ qua file đang bị app khác khóa đọc
            }
          }
          results.push({
            name: entry.name,
            kind: entry.kind,
            sizeBytes,
            lastModified,
            handle: entry
          });
        }
      } catch (_) {
        return results;
      }
      return results.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    }

    /**
     * Ghi văn bản UTF-8 nguyên tử vào file (tránh cắt nửa chừng nếu mất điện)
     */
    async writeUtf8TextFileHandle(subDirHandle, fileName, textContent) {
      if (!subDirHandle) return false;
      const cleanContent = typeof textContent === 'string' ? textContent : String(textContent ?? '');
      const fileHandle = await subDirHandle.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(new Blob([cleanContent], { type: 'text/plain;charset=utf-8' }));
      await writable.close();
      return true;
    }

    /**
     * Đọc nội dung văn bản UTF-8 từ một file có sẵn trong thư mục con
     */
    async readUtf8TextFileHandle(subDirHandle, fileName) {
      if (!subDirHandle) return null;
      try {
        const fileHandle = await subDirHandle.getFileHandle(fileName, { create: false });
        const fileObj = await fileHandle.getFile();
        return await fileObj.text();
      } catch (_) {
        return null;
      }
    }
  }

  // ==========================================================================
  // PHẦN 3: BỘ ĐỒNG BỘ 6 THƯ MỤC ĐỊNH KỲ & DỌN DẸP TỆP ĐỔI TRẠNG THÁI
  // ==========================================================================

  class SixFolderWorkspaceSynchronizer {
    constructor(fsEngine, sanitizer) {
      this.NS = window.NoirStudio;
      this.fs = fsEngine;
      this.sanitizer = sanitizer;
      this.lastSyncSummary = null;
    }

    /**
     * Ghi đồng bộ toàn bộ 6 thư mục trên ổ cứng cục bộ từ dữ liệu Studio hiện hành:
     * - Thư mục 01: Toàn bộ chương Bản Nháp (.txt) + dọn bỏ file trùng bên 02
     * - Thư mục 02: Toàn bộ chương Đã Duyệt Bản Chính (.txt & .md) + dọn file trùng bên 01
     * - Thư mục 03: Story Bible Tổng hợp, Hồ sơ Nhân vật, Ma trận Ai Biết Gì, Sổ cái Phục bút
     * - Thư mục 04: Chỉ mục chống quên BM25 RAG Chunks (.json)
     * - Thư mục 05: Bảng trắng ý tưởng nhanh & Sơ đồ mốc phân cảnh POV
     * - Thư mục 06: Gói sao lưu toàn dự án + 5 bản chụp Version History mới nhất
     */
    async executeFullSixFolderSync() {
      if (!this.fs.isConnected()) {
        return { synced: false, reason: 'Chưa kết nối thư mục ổ cứng.' };
      }

      const okFolders = await this.fs.ensureSubFolders();
      if (!okFolders) {
        return { synced: false, reason: 'Thiếu quyền ghi vào các thư mục con.' };
      }

      const counts = {
        draftsWritten: 0,
        approvedWritten: 0,
        bibleFilesWritten: 0,
        ragFilesWritten: 0,
        scratchpadWritten: 0,
        backupsWritten: 0,
        staleFilesCleaned: 0
      };

      const chapters = this.NS.chapterManager?.chapters || [];
      const activeDraftNames = new Set();
      const activeApprovedNames = new Set();

      // 1 & 2. Đồng bộ Chương Nháp (01) & Chương Đã Duyệt (02)
      for (let i = 0; i < chapters.length; i += 1) {
        const chap = chapters[i];
        const fileName = this.sanitizer.buildOrderedChapterFileName(chap, i, 'txt');
        const headerBlock = [
          `====================================================================`,
          `${chap.displayTitle || chap.title}`,
          `Trạng thái: ${chap.status === 'APPROVED' ? 'BẢN ĐÃ DUYỆT' : 'BẢN NHÁP'} | Số từ: ${chap.wordCount || 0}`,
          `Cập nhật lần cuối: ${this.NS.utils?.formatTimestampVN?.(chap.updatedAt) || new Date().toLocaleString('vi-VN')}`,
          `====================================================================`,
          chap.beats ? `\n[DÀN Ý / BEATS]:\n${chap.beats}\n\n--------------------------------------------------------------------\n` : '',
          chap.content || ''
        ].join('\n');

        if (chap.status === 'APPROVED') {
          activeApprovedNames.add(fileName);
          await this.fs.writeTextFile('02_Chuong_Da_Duyet', fileName, headerBlock);
          counts.approvedWritten += 1;
        } else {
          activeDraftNames.add(fileName);
          await this.fs.writeTextFile('01_Chuong_Goc_Chua_Duyet', fileName, headerBlock);
          counts.draftsWritten += 1;
        }
      }

      // Dọn file bị đổi trạng thái (VD: từ Nháp chuyển sang Đã duyệt thì xóa bản cũ ở 01)
      counts.staleFilesCleaned += await this.removeMovedChapterFiles(
        '01_Chuong_Goc_Chua_Duyet',
        activeDraftNames
      );
      counts.staleFilesCleaned += await this.removeMovedChapterFiles(
        '02_Chuong_Da_Duyet',
        activeApprovedNames
      );

      // 3. Đồng bộ Hồ sơ Story Bible (03)
      const bibleRendered = localStorage.getItem('noir_s10_rendered_bible_content') || '';
      if (bibleRendered.trim()) {
        await this.fs.writeTextFile('03_Story_Bible_Local', '00_Story_Bible_Tong_Hop.md', bibleRendered);
        counts.bibleFilesWritten += 1;
      }

      const chars = this.NS.idb?.getLocalJSON?.('noir_s10_character_profiles_v1', []) || [];
      if (chars.length > 0) {
        const charMd = chars
          .map(
            (c, idx) =>
              `## ${idx + 1}. ${c.name || c.ten || 'Nhân vật'}\n- Vai trò: ${c.role || ''}\n- Tính cách / Bí mật: ${c.traits || c.notes || ''}\n`
          )
          .join('\n');
        await this.fs.writeTextFile('03_Story_Bible_Local', '01_Ho_So_Nhan_Vat.md', charMd);
        await this.fs.writeTextFile(
          '03_Story_Bible_Local',
          '01_Ho_So_Nhan_Vat.json',
          JSON.stringify(chars, null, 2)
        );
        counts.bibleFilesWritten += 2;
      }

      const clues = this.NS.idb?.getLocalJSON?.('noir_s10_clues_ledger_v1', []) || [];
      if (clues.length > 0) {
        await this.fs.writeTextFile(
          '03_Story_Bible_Local',
          '02_So_Cai_Phuc_But.json',
          JSON.stringify(clues, null, 2)
        );
        counts.bibleFilesWritten += 1;
      }

      const antiCliche = localStorage.getItem('noir_s10_anti_cliche_blacklist_v1') || '';
      if (antiCliche.trim()) {
        await this.fs.writeTextFile('03_Story_Bible_Local', '03_Danh_Sach_Tu_Cam_AI.txt', antiCliche);
        counts.bibleFilesWritten += 1;
      }

      // 4. Đồng bộ Chỉ mục chống quên BM25 RAG (04)
      const ragChunks = this.NS.rag?.chunks || [];
      if (Array.isArray(ragChunks) && ragChunks.length > 0) {
        await this.fs.writeTextFile(
          '04_Chi_Muc_Chong_Quen',
          'bm25_memory_index.json',
          JSON.stringify({ indexedAt: Date.now(), totalChunks: ragChunks.length, chunks: ragChunks.slice(0, 400) }, null, 2)
        );
        counts.ragFilesWritten += 1;
      }

      // 5. Đồng bộ Bảng trắng ý tưởng & Mốc chuyển cảnh (05)
      const scratchpad = localStorage.getItem('noir_quick_scratchpad_notes') || '';
      if (scratchpad.trim()) {
        await this.fs.writeTextFile('05_Bang_Trang_Y_Tuong', 'Bang_Trang_Y_Tuong_Nhanh.md', scratchpad);
        counts.scratchpadWritten += 1;
      }

      const sceneMarkers = this.NS.idb?.getLocalJSON?.('noir_s18_scene_pov_markers_v1', {});
      if (sceneMarkers && Object.keys(sceneMarkers).length > 0) {
        await this.fs.writeTextFile(
          '05_Bang_Trang_Y_Tuong',
          'So_Do_Moc_Phan_Canh_POV.json',
          JSON.stringify(sceneMarkers, null, 2)
        );
        counts.scratchpadWritten += 1;
      }

      // 6. Đồng bộ Sao lưu Toàn Dự Án vào thư mục 06
      if (this.NS.emergencyVault?.assembleFullWorkspaceSnapshotPayload) {
        const snapshot = await this.NS.emergencyVault.assembleFullWorkspaceSnapshotPayload();
        await this.fs.writeTextFile(
          '06_Sao_Luu_Code_Va_Ban_Thao',
          'NoirStudio_Latest_Full_Snapshot.json',
          JSON.stringify(snapshot, null, 2)
        );
        counts.backupsWritten += 1;
      }

      // Sinh file README_HUONG_DAN.txt trong thư mục gốc nếu chưa có
      await this.fs.writeTextFileToRoot(
        'README_THU_MUC_TRUYEN.txt',
        this.buildFolderStructureGuideText()
      );

      this.lastSyncSummary = {
        synced: true,
        syncedAt: Date.now(),
        counts
      };

      try {
        localStorage.setItem(SYNC_META_STORAGE_KEY, JSON.stringify(this.lastSyncSummary));
      } catch (_) {
        // Bỏ qua
      }

      return this.lastSyncSummary;
    }

    async removeMovedChapterFiles(subFolder, activeFileNamesSet) {
      let deleted = 0;
      const existing = await this.fs.listFilesInSubFolder(subFolder);
      for (let i = 0; i < existing.length; i += 1) {
        const item = existing[i];
        if (item.kind !== 'file') continue;
        if (!item.name.endsWith('.txt')) continue;
        if (!activeFileNamesSet.has(item.name)) {
          const ok = await this.fs.deleteFile(subFolder, item.name);
          if (ok) deleted += 1;
        }
      }
      return deleted;
    }

    buildFolderStructureGuideText() {
      return [
        '========================================================================',
        '📚 KHÔNG GIAN LÀM VIỆC TIỂU THUYẾT CỤC BỘ — NOIR STUDIO v38',
        '========================================================================',
        'Cấu trúc 6 thư mục được đồng bộ tự động từ ứng dụng viết tiểu thuyết:',
        '  1. 01_Chuong_Goc_Chua_Duyet  -> Chứa bản nháp đang viết từng chương (.txt)',
        '  2. 02_Chuong_Da_Duyet        -> Chứa các chương đã chốt bản chính thức (.txt)',
        '  3. 03_Story_Bible_Local      -> Kinh thánh cốt truyện, Nhân vật, Phục bút',
        '  4. 04_Chi_Muc_Chong_Quen     -> Chỉ mục bộ nhớ tìm kiếm cục bộ BM25 RAG',
        '  5. 05_Bang_Trang_Y_Tuong     -> Sổ ghi chú nhanh & Mốc chuyển phân cảnh POV',
        '  6. 06_Sao_Luu_Code_Va_Ban_Thao -> File sao lưu toàn bộ dự án (.json)',
        '',
        'Lưu ý: Bạn có thể sao chép toàn bộ thư mục cha này lên Google Drive / OneDrive',
        'hoặc chép sang máy khác để bảo quản tác phẩm vĩnh viễn.',
        '========================================================================'
      ].join('\r\n');
    }
  }

  // ==========================================================================
  // PHẦN 4: NHẬP NGƯỢC BẢN THẢO TỪ Ổ CỨNG & XUẤT GÓI THƯ MỤC ẢO CHO DI ĐỘNG
  // ==========================================================================

  class ExternalFolderManuscriptImporter {
    constructor(fsEngine) {
      this.NS = window.NoirStudio;
      this.fs = fsEngine;
    }

    /**
     * Loại bỏ khối header do Studio sinh ra khi đọc lại tệp `.txt` từ thư mục ổ cứng
     * để chỉ lấy phần nội dung truyện tinh khiết và phần Beats (nếu có).
     */
    parseSyncedChapterFileText(rawFileText, fallbackTitle) {
      const normalized = String(rawFileText || '').replace(/\r\n/g, '\n');
      let title = String(fallbackTitle || '')
        .replace(/^\d{3}_/, '')
        .replace(/\.(txt|md)$/i, '')
        .replace(/_/g, ' ')
        .trim();

      let content = normalized;
      let beats = '';

      const sepRegex = /^={15,}\n([\s\S]*?)\n={15,}\n*/;
      const headerMatch = normalized.match(sepRegex);
      if (headerMatch) {
        const firstHeaderLine = headerMatch[1].split('\n')[0]?.trim();
        if (firstHeaderLine) title = firstHeaderLine;
        content = normalized.slice(headerMatch[0].length);
      }

      const beatsBlockRegex = /^\[DÀN Ý \/ BEATS\]:\n([\s\S]*?)\n-{15,}\n*/;
      const beatsMatch = content.match(beatsBlockRegex);
      if (beatsMatch) {
        beats = beatsMatch[1].trim();
        content = content.slice(beatsMatch[0].length);
      }

      return {
        title: title || 'Chương nhập từ ổ cứng',
        beats,
        content: content.trim()
      };
    }

    /**
     * Quét 2 thư mục `01_Chuong_Goc_Chua_Duyet` và `02_Chuong_Da_Duyet` xem có tệp mới
     * được tác giả thả vào bằng File Explorer hay sửa bên ngoài hay không.
     */
    async scanAndImportNewOrExternalChapters() {
      if (!this.fs.isConnected()) {
        return { imported: 0, updated: 0 };
      }

      const cm = this.NS.chapterManager;
      if (!cm || !Array.isArray(cm.chapters)) {
        return { imported: 0, updated: 0 };
      }

      const targetFolders = [
        { folder: '01_Chuong_Goc_Chua_Duyet', status: 'DRAFT' },
        { folder: '02_Chuong_Da_Duyet', status: 'APPROVED' }
      ];

      let imported = 0;
      let updated = 0;

      for (let f = 0; f < targetFolders.length; f += 1) {
        const { folder, status } = targetFolders[f];
        const entries = await this.fs.listFilesInSubFolder(folder);
        for (let i = 0; i < entries.length; i += 1) {
          const item = entries[i];
          if (item.kind !== 'file' || !/\.(txt|md)$/i.test(item.name)) continue;

          const text = await this.fs.readTextFile(folder, item.name);
          if (text === null) continue;

          const parsed = this.parseSyncedChapterFileText(text, item.name);
          const normTitle = parsed.title.toLowerCase();

          const existing = cm.chapters.find(
            (c) => String(c.displayTitle || c.title || '').trim().toLowerCase() === normTitle
          );

          if (!existing) {
            const newChap = cm.normalizeChapterRecord(
              {
                id: `chap_fs_${Date.now()}_${imported}`,
                title: parsed.title,
                displayTitle: parsed.title,
                status,
                content: parsed.content,
                beats: parsed.beats,
                order: cm.chapters.length,
                updatedAt: item.lastModified || Date.now()
              },
              cm.chapters.length
            );
            cm.chapters.push(newChap);
            imported += 1;
          } else if (
            item.lastModified &&
            item.lastModified > (existing.updatedAt || 0) + 5000 &&
            parsed.content &&
            parsed.content !== existing.content
          ) {
            existing.content = parsed.content;
            if (parsed.beats) existing.beats = parsed.beats;
            existing.status = status;
            existing.wordCount = this.NS.utils?.countVietnameseWords?.(parsed.content) || 0;
            existing.updatedAt = item.lastModified;
            updated += 1;
          }
        }
      }

      if (imported > 0 || updated > 0) {
        await cm.persistChapters();
        cm.renderChapterTreeAndQuickSwitcher?.();
        cm.loadActiveChapterIntoEditor?.();
      }

      return { imported, updated };
    }
  }

  class MobileVirtualFolderBundleFallback {
    constructor(sanitizer) {
      this.NS = window.NoirStudio;
      this.sanitizer = sanitizer;
    }

    /**
     * Khi chạy trên điện thoại (iOS/Android) nơi trình duyệt không hỗ trợ
     * chọn thư mục ổ cứng `showDirectoryPicker`, tạo một Gói Kho Lưu Trữ 6 Thư Mục
     * dạng trang HTML tự chứa mở xem ngoại tuyến bất cứ đâu.
     */
    async downloadVirtualWorkspaceBundleHtml() {
      const chapters = this.NS.chapterManager?.chapters || [];
      const bible = localStorage.getItem('noir_s10_rendered_bible_content') || '(Trống)';
      const esc = (s) =>
        this.NS.utils?.escapeHtml?.(s) ||
        String(s ?? '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');

      const draftChapters = chapters.filter((c) => c.status !== 'APPROVED');
      const approvedChapters = chapters.filter((c) => c.status === 'APPROVED');

      const renderChapterCards = (list) =>
        list.length === 0
          ? '<p class="empty">Chưa có chương nào trong thư mục này.</p>'
          : list
              .map(
                (c) => `
          <details class="card">
            <summary><strong>${esc(c.displayTitle || c.title)}</strong> <span>(${(c.wordCount || 0).toLocaleString('vi-VN')} từ)</span></summary>
            ${c.beats ? `<div class="beats"><b>Dàn ý:</b><pre>${esc(c.beats)}</pre></div>` : ''}
            <div class="body">${esc(c.content || '')
              .split(/\n+/)
              .map((p) => `<p>${p}</p>`)
              .join('')}</div>
          </details>`
              )
              .join('\n');

      const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Gói Không Gian 6 Thư Mục — Noir Studio</title>
  <style>
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: #09090b; color: #e4e4e7; margin: 0; padding: 1.2rem; line-height: 1.75; }
    .wrap { max-width: 900px; margin: 0 auto; }
    h1 { color: #34d399; font-size: 1.4rem; }
    .folder { margin: 1.5rem 0; padding: 1rem; border: 1px solid #27272a; border-radius: 14px; background: #18181b; }
    .folder h2 { margin: 0 0 0.75rem 0; font-size: 1.05rem; color: #fbbf24; }
    .card { border: 1px solid #3f3f46; border-radius: 10px; padding: 0.7rem 0.9rem; margin-bottom: 0.65rem; background: #111114; }
    .card summary { cursor: pointer; display: flex; justify-content: space-between; gap: 0.5rem; }
    .beats { background: #1e1b4b; padding: 0.6rem; border-radius: 8px; margin: 0.6rem 0; font-size: 0.9rem; }
    pre { white-space: pre-wrap; font-family: inherit; margin: 0; }
    .empty { color: #71717a; font-style: italic; font-size: 0.9rem; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>📂 Hồ Sơ Không Gian 6 Thư Mục (Bản Đọc Ngoại Tuyến Đa Thiết Bị)</h1>
    <p>Xuất lúc: ${esc(new Date().toLocaleString('vi-VN'))} • Tổng cộng ${chapters.length} chương</p>

    <section class="folder">
      <h2>📁 01_Chuong_Goc_Chua_Duyet (${draftChapters.length} tệp)</h2>
      ${renderChapterCards(draftChapters)}
    </section>

    <section class="folder">
      <h2>📁 02_Chuong_Da_Duyet (${approvedChapters.length} tệp)</h2>
      ${renderChapterCards(approvedChapters)}
    </section>

    <section class="folder">
      <h2>📁 03_Story_Bible_Local</h2>
      <pre>${esc(bible)}</pre>
    </section>
  </div>
</body>
</html>`;

      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `KhongGian_6ThuMuc_${new Date().toISOString().slice(0, 10)}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2500);

      this.NS.utils?.showToast(
        '📱 Đã đóng gói 6 thư mục thành Gói Hồ Sơ Ngoại Tuyến (.HTML) tải về điện thoại!',
        'success',
        4000
      );
      return true;
    }
  }

  // ==========================================================================
  // PHẦN 5: HÀNG ĐỢI GHI ĐĨA KHÔNG NGHẼN & BẢNG ĐIỀU KHIỂN THƯ MỤC TRONG TAB 2
  // ==========================================================================

  class LocalDiskWriteQueueScheduler {
    constructor(fsEngine) {
      this.fs = fsEngine;
      this.pendingQueue = new Map();
      this.flushTimer = null;
      this.isFlushing = false;
      this.totalFilesWrittenCount = 0;
      this.totalWriteFailures = 0;
    }

    enqueueFileWrite(subFolder, fileName, content, delayMs = 650) {
      const queueKey = `${subFolder}::${fileName}`;
      this.pendingQueue.set(queueKey, {
        subFolder,
        fileName,
        content,
        queuedAt: Date.now()
      });

      if (this.flushTimer) {
        clearTimeout(this.flushTimer);
      }
      this.flushTimer = setTimeout(() => {
        this.flushPendingWrites();
      }, Math.max(120, delayMs));
    }

    async flushPendingWrites() {
      if (this.isFlushing || this.pendingQueue.size === 0) return 0;
      if (!this.fs.isConnected()) return 0;

      this.isFlushing = true;
      const batch = Array.from(this.pendingQueue.values());
      this.pendingQueue.clear();
      let okCount = 0;

      try {
        for (let i = 0; i < batch.length; i += 1) {
          const item = batch[i];
          const ok = await this.fs.writeTextFile(item.subFolder, item.fileName, item.content);
          if (ok) {
            okCount += 1;
            this.totalFilesWrittenCount += 1;
          } else {
            this.totalWriteFailures += 1;
          }
        }
      } finally {
        this.isFlushing = false;
      }
      return okCount;
    }
  }

  class Tab2LocalFolderExplorerWidget {
    constructor(fsEngine) {
      this.NS = window.NoirStudio;
      this.fs = fsEngine;
      this.cardInjected = false;
    }

    get utils() {
      return (
        this.NS.utils || {
          escapeHtml: (s) => String(s ?? ''),
          showToast: () => {},
          formatTimestampVN: (t) => new Date(t || Date.now()).toLocaleString('vi-VN')
        }
      );
    }

    injectFolderExplorerPanelIfNeeded() {
      if (typeof document === 'undefined') return;
      const screen2 = document.getElementById('s14-screen-2-files');
      if (!screen2) return;
      if (document.getElementById('mod05-tab2-folder-sync-panel')) return;

      const panel = document.createElement('div');
      panel.id = 'mod05-tab2-folder-sync-panel';
      panel.className =
        'mt-4 rounded-2xl border border-zinc-800/90 bg-zinc-900/75 p-4 space-y-3';

      panel.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2.5">
          <div>
            <h4 class="text-sm font-extrabold text-amber-300 flex items-center gap-1.5">
              <span>📁 Đồng Bộ Ổ Cứng Cục Bộ (6 Thư Mục Tiêu Chuẩn)</span>
            </h4>
            <p class="text-[11px] text-zinc-400">
              Khi kết nối thư mục trên máy tính, mọi chương viết và Story Bible sẽ tự động ghi thẳng thành file .txt/.md trên ổ đĩa của bạn.
            </p>
          </div>
          <span id="mod05-tab2-connection-pill" class="px-2.5 py-1 rounded-full text-[11px] font-bold border border-zinc-700 bg-zinc-800 text-zinc-300">
            ⏳ Chưa nối thư mục
          </span>
        </div>

        <div id="mod05-tab2-folders-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs"></div>

        <div class="flex flex-wrap items-center gap-2 pt-1">
          <button type="button" id="btn-mod05-connect-folder-tab2" class="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/40 text-amber-200 text-xs font-bold transition">
            🔗 Chọn Thư Mục Lưu Truyện
          </button>
          <button type="button" id="btn-mod05-sync-all-now" class="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/35 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition">
            🔄 Đồng Bộ Toàn Bộ Ra 6 Thư Mục
          </button>
          <button type="button" id="btn-mod05-import-from-disk" class="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/35 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition">
            📥 Quét Nhập File Sửa Từ Ổ Đĩa
          </button>
          <button type="button" id="btn-mod05-download-mobile-bundle" class="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-semibold transition">
            📱 Tải Gói 6 Thư Mục (Cho Điện Thoại)
          </button>
        </div>
      `;

      screen2.appendChild(panel);
      this.bindPanelEvents();
      this.refreshFolderGridUI();
      this.cardInjected = true;
    }

    bindPanelEvents() {
      const bind = (id, fn) => {
        const el = document.getElementById(id);
        if (!el || el.dataset.mod05Bound) return;
        el.dataset.mod05Bound = '1';
        el.addEventListener('click', fn);
      };

      bind('btn-mod05-connect-folder-tab2', () => this.fs.requestConnectFolder());
      bind('btn-mod05-sync-all-now', async () => {
        const res = await this.fs.syncAllManuscriptsToLocalFolder();
        if (res.synced) {
          await this.refreshFolderGridUI();
        }
      });
      bind('btn-mod05-import-from-disk', async () => {
        const r = await this.fs.importExternalEditsFromFolder();
        if (r.imported > 0 || r.updated > 0) {
          this.utils.showToast(
            `📥 Đã nhập ${r.imported} chương mới và cập nhật ${r.updated} chương sửa từ ổ đĩa!`,
            'success'
          );
          await this.refreshFolderGridUI();
        } else {
          this.utils.showToast('ℹ️ Không có file .txt/.md nào mới hơn trên ổ đĩa.', 'info');
        }
      });
      bind('btn-mod05-download-mobile-bundle', () =>
        this.fs.mobileBundle.downloadVirtualWorkspaceBundleHtml()
      );
    }

    async refreshFolderGridUI() {
      if (typeof document === 'undefined') return;
      const pill = document.getElementById('mod05-tab2-connection-pill');
      const grid = document.getElementById('mod05-tab2-folders-grid');
      const connected = this.fs.isConnected();

      if (pill) {
        if (connected) {
          pill.textContent = `📂 Đã nối: ${this.fs.getConnectedFolderName()}`;
          pill.className =
            'px-2.5 py-1 rounded-full text-[11px] font-bold border border-emerald-500/40 bg-emerald-500/15 text-emerald-300';
        } else if (!this.fs.isSupported()) {
          pill.textContent = '📱 Chế độ Di động / Web Offline';
          pill.className =
            'px-2.5 py-1 rounded-full text-[11px] font-bold border border-sky-500/40 bg-sky-500/15 text-sky-300';
        } else {
          pill.textContent = '⚪ Chưa kết nối ổ cứng';
          pill.className =
            'px-2.5 py-1 rounded-full text-[11px] font-bold border border-zinc-700 bg-zinc-800 text-zinc-400';
        }
      }

      if (!grid) return;
      const folderDescs = this.NS.constants?.LOCAL_FOLDER_DESCRIPTIONS || {};
      const folders = this.fs.getTargetFolderNames();
      const esc = (s) => this.utils.escapeHtml(s);

      const fileCounts = {};
      if (connected) {
        for (let i = 0; i < folders.length; i += 1) {
          const entries = await this.fs.listFilesInSubFolder(folders[i]);
          fileCounts[folders[i]] = entries.filter((e) => e.kind === 'file').length;
        }
      }

      grid.innerHTML = folders
        .map((folderName) => {
          const count = connected ? fileCounts[folderName] || 0 : '—';
          const desc = folderDescs[folderName] || 'Thư mục đồng bộ tự động của Studio.';
          return `
            <div class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-950/70 space-y-1">
              <div class="flex items-center justify-between gap-2">
                <span class="font-mono text-[11px] font-bold text-zinc-200 truncate">📁 ${esc(folderName)}</span>
                <span class="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-emerald-300 font-bold shrink-0">${count} tệp</span>
              </div>
              <p class="text-[10px] text-zinc-500 line-clamp-2 leading-snug">${esc(desc)}</p>
            </div>
          `;
        })
        .join('');
    }
  }

  // ==========================================================================
  // PHẦN 6: BỘ LUÂN PHIÊN BẢN SAO LƯU THƯ MỤC 06 & TẠO CHỈ MỤC TỆP ĐỊA PHƯƠNG
  // ==========================================================================

  class FolderBackupSnapshotRotator {
    constructor(fsEngine, sanitizer) {
      this.NS = window.NoirStudio;
      this.fs = fsEngine;
      this.sanitizer = sanitizer;
      this.maxRollingBackups = 10;
    }

    /**
     * Ghi một bản chụp dự phòng có gắn nhãn thời gian vào `06_Sao_Luu_Code_Va_Ban_Thao`
     * và tự động dọn bớt bản cũ vượt quá `maxRollingBackups` để không tốn dung lượng đĩa.
     */
    async writeRollingTimestampedSnapshot(reasonLabel = 'AutoSync') {
      if (!this.fs.isConnected()) return false;
      const folder = '06_Sao_Luu_Code_Va_Ban_Thao';
      let payloadObj = null;

      if (this.NS.emergencyVault?.assembleFullWorkspaceSnapshotPayload) {
        payloadObj = await this.NS.emergencyVault.assembleFullWorkspaceSnapshotPayload();
      } else {
        payloadObj = {
          capturedAt: Date.now(),
          reason: reasonLabel,
          chapters: this.NS.chapterManager?.chapters || []
        };
      }

      const d = new Date();
      const stamp = [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, '0'),
        String(d.getDate()).padStart(2, '0'),
        '_',
        String(d.getHours()).padStart(2, '0'),
        String(d.getMinutes()).padStart(2, '0')
      ].join('');

      const cleanReason = this.sanitizer.sanitizeFileName(reasonLabel, '').slice(0, 24);
      const fileName = `RollingBackup_${stamp}_${cleanReason}.json`;
      await this.fs.writeTextFile(folder, fileName, JSON.stringify(payloadObj, null, 2));

      // Dọn các file RollingBackup thừa cũ hơn
      const entries = await this.fs.listFilesInSubFolder(folder);
      const rolling = entries
        .filter((e) => e.kind === 'file' && e.name.startsWith('RollingBackup_') && e.name.endsWith('.json'))
        .sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));

      if (rolling.length > this.maxRollingBackups) {
        const excess = rolling.slice(this.maxRollingBackups);
        for (let i = 0; i < excess.length; i += 1) {
          await this.fs.deleteFile(folder, excess[i].name);
        }
      }
      return fileName;
    }

    /**
     * Tổng hợp báo cáo thống kê dung lượng toàn bộ 6 thư mục trên ổ đĩa
     */
    async computeFolderDiskFootprintReport() {
      if (!this.fs.isConnected()) {
        return {
          connected: false,
          totalFiles: 0,
          totalBytes: 0,
          folders: []
        };
      }

      const folderNames = this.fs.getTargetFolderNames();
      const folders = [];
      let totalFiles = 0;
      let totalBytes = 0;

      for (let i = 0; i < folderNames.length; i += 1) {
        const name = folderNames[i];
        const entries = await this.fs.listFilesInSubFolder(name);
        const files = entries.filter((e) => e.kind === 'file');
        const folderBytes = files.reduce((sum, f) => sum + (f.sizeBytes || 0), 0);
        totalFiles += files.length;
        totalBytes += folderBytes;
        folders.push({
          folderName: name,
          fileCount: files.length,
          sizeKB: Math.round((folderBytes / 1024) * 10) / 10,
          latestFile: files[0]?.name || null
        });
      }

      return {
        connected: true,
        rootFolderName: this.fs.getConnectedFolderName(),
        totalFiles,
        totalBytes,
        totalKB: Math.round((totalBytes / 1024) * 10) / 10,
        folders
      };
    }
  }

  // ==========================================================================
  // PHẦN 7: LỚP CHỦ QUẢN ĐỒNG BỘ Ổ CỨNG (`window.NoirStudio.fsEngine`)
  // ==========================================================================

  class LocalFileSystemWorkspaceEngine {
    constructor() {
      this.NS = window.NoirStudio;
      this.rootDirHandle = null;
      this.opfsRootHandle = null;
      this.mobileWorkspaceFolder = null;
      this._mobileStorageKey = 'noir_mobile_workspace_folder_v1';
      this._pendingReconnectHandle = null;
      this.lastConnectError = '';
      this.fallbackModeActive = false;
      this.rememberedFolderMeta = null;
      this.subFolderHandles = new Map();
      this.initialized = false;

      this.sanitizer = new CrossPlatformFilePathSanitizer();
      this.permissionGuardian = new DirectoryPermissionGuardian();
      this.synchronizer = new SixFolderWorkspaceSynchronizer(this, this.sanitizer);
      this.importer = new ExternalFolderManuscriptImporter(this);
      this.mobileBundle = new MobileVirtualFolderBundleFallback(this.sanitizer);
      this.writeScheduler = new LocalDiskWriteQueueScheduler(this);
      this.tab2Widget = new Tab2LocalFolderExplorerWidget(this);
      this.backupRotator = new FolderBackupSnapshotRotator(this, this.sanitizer);
      this.loadSavedMobileWorkspaceState();
      this.loadRememberedFolderMetaSync();
    }

    get utils() {
      return (
        this.NS.utils || {
          showToast: () => {},
          escapeHtml: (s) => String(s ?? ''),
          formatTimestampVN: (t) => new Date(t || Date.now()).toLocaleString('vi-VN')
        }
      );
    }

    getTargetFolderNames() {
      return Array.isArray(this.NS.constants?.LOCAL_FOLDERS)
        ? this.NS.constants.LOCAL_FOLDERS
        : DEFAULT_WORKBOOK_FOLDERS;
    }

    loadRememberedFolderMetaSync() {
      try {
        const rawLs = localStorage.getItem(REMEMBERED_FOLDER_META_KEY);
        if (rawLs) {
          const parsed = JSON.parse(rawLs);
          if (parsed && parsed.folderName) {
            this.rememberedFolderMeta = parsed;
            return parsed;
          }
        }
      } catch (_e) {}
      try {
        const rawCk = readSafeHttpPreferenceCookie(FOLDER_PREF_COOKIE_NAME);
        if (rawCk) {
          const parsed = JSON.parse(rawCk);
          if (parsed && parsed.folderName) {
            this.rememberedFolderMeta = parsed;
            return parsed;
          }
        }
      } catch (_e) {}
      return this.rememberedFolderMeta;
    }

    async saveRememberedFolderMeta(meta) {
      this.rememberedFolderMeta = meta || null;
      try {
        if (meta) {
          const raw = JSON.stringify(meta);
          localStorage.setItem(REMEMBERED_FOLDER_META_KEY, raw);
          writeSafeHttpPreferenceCookie(FOLDER_PREF_COOKIE_NAME, raw);
          await this.NS.idb?.set?.('state_cache', REMEMBERED_FOLDER_IDB_KEY, meta);
        } else {
          localStorage.removeItem(REMEMBERED_FOLDER_META_KEY);
          writeSafeHttpPreferenceCookie(FOLDER_PREF_COOKIE_NAME, '');
          await this.NS.idb?.delete?.('state_cache', REMEMBERED_FOLDER_IDB_KEY);
        }
      } catch (_e) {
        // Không làm gián đoạn kết nối thư mục chính
      }
    }

    loadSavedMobileWorkspaceState() {
      try {
        const raw = localStorage.getItem(this._mobileStorageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.confirmedByUser && parsed.folderName) {
            this.mobileWorkspaceFolder = parsed;
            return parsed;
          }
        }
      } catch (_e) {
        // Bỏ qua
      }
      this.mobileWorkspaceFolder = null;
      return null;
    }

    saveMobileWorkspaceState(record) {
      this.mobileWorkspaceFolder = record || null;
      try {
        if (record) {
          localStorage.setItem(this._mobileStorageKey, JSON.stringify(record));
          this.NS.idb?.set?.('state_cache', MOBILE_WORKSPACE_IDB_KEY, record)?.catch?.(() => {});
        } else {
          localStorage.removeItem(this._mobileStorageKey);
          this.NS.idb?.delete?.('state_cache', MOBILE_WORKSPACE_IDB_KEY)?.catch?.(() => {});
        }
      } catch (_e) {
        // Bỏ qua
      }
    }

    isSupported() {
      return (
        typeof window !== 'undefined' &&
        typeof window.showDirectoryPicker === 'function'
      );
    }

    isConnected() {
      if (this.rootDirHandle) return true;
      if (
        this.opfsRootHandle &&
        this.mobileWorkspaceFolder?.confirmedByUser &&
        this.mobileWorkspaceFolder?.folderName
      ) {
        return true;
      }
      if (
        this.mobileWorkspaceFolder?.confirmedByUser &&
        this.mobileWorkspaceFolder?.folderName
      ) {
        return true;
      }
      return false;
    }

    hasPendingReconnectHandle() {
      return Boolean(this._pendingReconnectHandle && !this.rootDirHandle);
    }

    getPendingFolderName() {
      return (
        this._pendingReconnectHandle?.name ||
        (!this.isConnected() ? this.rememberedFolderMeta?.folderName || '' : '')
      );
    }

    getConnectedFolderName() {
      if (this.rootDirHandle?.name) return this.rootDirHandle.name;
      if (this.mobileWorkspaceFolder?.folderName) {
        return this.mobileWorkspaceFolder.folderName;
      }
      if (this.opfsRootHandle?.name) return this.opfsRootHandle.name;
      return '';
    }

    async initOpfsDirectoryIfAvailable(folderName) {
      if (
        typeof navigator === 'undefined' ||
        !navigator.storage ||
        typeof navigator.storage.getDirectory !== 'function'
      ) {
        return null;
      }
      try {
        const root = await navigator.storage.getDirectory();
        const safeName = this.sanitizer.sanitizeFileName(folderName || 'Noir_LightNovel_Workspace', '');
        const workspaceDir = await root.getDirectoryHandle(safeName, { create: true });
        this.opfsRootHandle = workspaceDir;
        this.subFolderHandles.clear();
        await this.ensureSubFolders();
        return workspaceDir;
      } catch (_e) {
        return null;
      }
    }

    async connectMobileWorkspaceFolder({ folderName = '', fileList = null } = {}) {
      let chosenName = String(folderName || '').trim();
      let fileCountFromPicker = 0;
      if (fileList && fileList.length > 0) {
        fileCountFromPicker = fileList.length;
        const firstRel = String(fileList[0].webkitRelativePath || '');
        const seg = firstRel.split('/').filter(Boolean)[0];
        if (seg && !chosenName) {
          chosenName = seg;
        } else if (seg && chosenName === 'Noir_LightNovel_Workspace') {
          chosenName = seg;
        }
      }
      const cleanName = this.sanitizer.sanitizeFileName(
        chosenName || 'Noir_LightNovel_Workspace',
        ''
      );
      if (!cleanName) {
        return { ok: false, message: 'Tên thư mục làm việc không hợp lệ.' };
      }

      const record = {
        folderName: cleanName,
        confirmedByUser: true,
        mode: fileCountFromPicker > 0 ? 'webkitdirectory+opfs' : 'mobile_opfs_pending',
        fileCountFromPicker,
        opfsBacked: false,
        connectedAt: Date.now()
      };
      this.lastConnectError = '';
      this.saveMobileWorkspaceState(record);
      this.rememberedFolderMeta = {
        folderName: cleanName,
        mode: record.mode,
        isFallbackWorkspace: true,
        connectedAt: record.connectedAt
      };
      this.updateHeaderStatusUI(true, cleanName);
      if (this.NS.bus?.emit) {
        this.NS.bus.emit(
          this.NS.constants?.EVENTS?.FS_CONNECTED || 'fs:connected',
          { folderName: cleanName, mode: record.mode }
        );
      }
      await this.saveRememberedFolderMeta(this.rememberedFolderMeta);

      try {
        const opfsHandle = await this.initOpfsDirectoryIfAvailable(cleanName);
        record.opfsBacked = Boolean(opfsHandle);
        record.mode =
          fileCountFromPicker > 0
            ? 'webkitdirectory+opfs'
            : opfsHandle
            ? 'opfs'
            : 'mobile_virtual';
        this.saveMobileWorkspaceState(record);
        if (opfsHandle) {
          await this.syncAllManuscriptsToLocalFolder();
        }
        await this.tab2Widget.refreshFolderGridUI?.();
      } catch (_e) {
        // Giữ nguyên trạng thái thư mục di động đã xác nhận kể cả khi OPFS hạn chế
      }
      return { ok: true, folderName: cleanName, ...record };
    }

    /**
     * Thử phục hồi quyền truy cập Thư mục Ổ cứng đã kết nối ở phiên làm việc trước
     * từ IndexedDB (`workspace_handles`), hoặc khôi phục thư mục OPFS / dự phòng đã xác nhận.
     */
    async tryRestoreSavedFolderHandle() {
      // Nạp thêm dữ liệu dự phòng từ IndexedDB nếu LocalStorage bị thiếu ở lần truy cập mới
      if (!this.mobileWorkspaceFolder) {
        try {
          const idbMobile = await this.NS.idb?.get?.('state_cache', MOBILE_WORKSPACE_IDB_KEY, null);
          if (idbMobile && idbMobile.confirmedByUser && idbMobile.folderName) {
            this.saveMobileWorkspaceState(idbMobile);
          }
        } catch (_e) {}
      }
      if (!this.rememberedFolderMeta) {
        try {
          const idbMeta = await this.NS.idb?.get?.('state_cache', REMEMBERED_FOLDER_IDB_KEY, null);
          if (idbMeta && idbMeta.folderName) {
            this.rememberedFolderMeta = idbMeta;
          }
        } catch (_e) {}
      }

      if (this.isSupported()) {
        try {
          const storeName = this.NS.constants?.STORES?.WORKSPACE_HANDLES || 'workspace_handles';
          const savedHandle = await this.NS.idb?.get?.(storeName, HANDLE_STORAGE_KEY, null);
          if (savedHandle) {
            const perm = await this.permissionGuardian.queryReadWritePermission(savedHandle);
            if (perm === 'granted') {
              this.rootDirHandle = savedHandle;
              this.lastConnectError = '';
              await this.ensureSubFolders();
              await this.saveRememberedFolderMeta({
                folderName: savedHandle.name,
                mode: 'desktop_fs_handle',
                isFallbackWorkspace: false,
                connectedAt: Date.now()
              });
              this.updateHeaderStatusUI(true, savedHandle.name);
              this.tab2Widget.refreshFolderGridUI?.();
              if (this.NS.bus?.emit) {
                this.NS.bus.emit(
                  this.NS.constants?.EVENTS?.FS_CONNECTED || 'fs:connected',
                  { folderName: savedHandle.name, restored: true }
                );
              }
              return true;
            }

            // Lưu tạm handle chờ 1 cú nhấp cấp lại quyền từ người dùng
            this._pendingReconnectHandle = savedHandle;
            await this.saveRememberedFolderMeta({
              folderName: savedHandle.name,
              mode: 'desktop_fs_handle_pending',
              isFallbackWorkspace: false,
              connectedAt: Date.now()
            });
            this.updateHeaderStatusUI(false, savedHandle.name, true);
            if (this.NS.bus?.emit) {
              this.NS.bus.emit(
                this.NS.constants?.EVENTS?.FS_DISCONNECTED || 'fs:disconnected',
                { pendingFolderName: savedHandle.name }
              );
            }
            return false;
          }
        } catch (_e) {
          // Tiếp tục kiểm tra kho dự phòng bên dưới
        }
      }

      // Khôi phục tự động kho làm việc OPFS / dự phòng (Di động hoặc khi mở file://)
      const savedMobile = this.loadSavedMobileWorkspaceState();
      if (savedMobile && savedMobile.confirmedByUser && savedMobile.folderName) {
        await this.initOpfsDirectoryIfAvailable(savedMobile.folderName);
        this.lastConnectError = '';
        this.updateHeaderStatusUI(true, savedMobile.folderName);
        this.tab2Widget.refreshFolderGridUI?.();
        if (this.NS.bus?.emit) {
          this.NS.bus.emit(
            this.NS.constants?.EVENTS?.FS_CONNECTED || 'fs:connected',
            { folderName: savedMobile.folderName, restored: true }
          );
        }
        return true;
      }

      this.updateHeaderStatusUI(false, '');
      if (this.NS.bus?.emit) {
        this.NS.bus.emit(
          this.NS.constants?.EVENTS?.FS_DISCONNECTED || 'fs:disconnected',
          { pendingFolderName: this.rememberedFolderMeta?.folderName || '' }
        );
      }
      return false;
    }

    async reconnectPendingFolder() {
      if (!this.isSupported() || !this._pendingReconnectHandle) return false;
      this.lastConnectError = '';
      try {
        const permRes = await this.permissionGuardian.evaluateHandlePermission(
          this._pendingReconnectHandle
        );
        if (!permRes.ok) {
          this.lastConnectError =
            'Trình duyệt chưa cấp quyền Đọc/Ghi cho thư mục đã nhớ. Vui lòng thử bấm lại hoặc chọn thư mục khác.';
          this.fallbackModeActive = true;
          this.NS.bus?.emit?.('fs:connect_error', { error: this.lastConnectError });
          return false;
        }
        this.rootDirHandle = this._pendingReconnectHandle;
        this._pendingReconnectHandle = null;
        this.fallbackModeActive = false;
        this.subFolderHandles.clear();
        this.rememberedFolderMeta = {
          folderName: this.rootDirHandle.name,
          mode: 'desktop_fs_handle',
          isFallbackWorkspace: false,
          connectedAt: Date.now()
        };
        this.updateHeaderStatusUI(true, this.rootDirHandle.name);
        if (this.NS.bus?.emit) {
          this.NS.bus.emit(
            this.NS.constants?.EVENTS?.FS_CONNECTED || 'fs:connected',
            { folderName: this.rootDirHandle.name, reconnected: true }
          );
        }
        try {
          const storeName = this.NS.constants?.STORES?.WORKSPACE_HANDLES || 'workspace_handles';
          await this.NS.idb?.set?.(storeName, HANDLE_STORAGE_KEY, this.rootDirHandle);
        } catch (_idbErr) {}
        await this.saveRememberedFolderMeta(this.rememberedFolderMeta);
        await this.ensureSubFolders();
        try {
          await this.syncAllManuscriptsToLocalFolder();
          await this.tab2Widget.refreshFolderGridUI?.();
        } catch (_syncErr) {}
        this.utils.showToast(
          `📂 Đã nối lại thư mục "${this.rootDirHandle.name}" và đồng bộ xong!`,
          'success'
        );
        return true;
      } catch (err) {
        this.lastConnectError = err?.message || 'Không thể cấp lại quyền thư mục cũ.';
        this.fallbackModeActive = true;
        this.NS.bus?.emit?.('fs:connect_error', { error: this.lastConnectError });
        return false;
      }
    }

    /**
     * Mở hộp thoại chọn thư mục Windows/macOS để tác giả liên kết 6 thư mục lưu trữ
     */
    async requestConnectFolder(forceFreshPick = false) {
      this.lastConnectError = '';
      if (!this.isSupported()) {
        this.fallbackModeActive = true;
        if (document.body?.dataset?.appGateLocked === 'true') {
          this.utils.showToast(
            '📱 Hãy chọn hoặc xác nhận Tên thư mục làm việc ngay trên màn hình chào để vào Studio.',
            'info',
            3800
          );
          return false;
        }
        this.utils.showToast(
          '📱 Trình duyệt di động chưa hỗ trợ nối thẳng thư mục ổ cứng. Hệ thống sẽ đóng gói Gói 6 Thư Mục ngoại tuyến (.HTML) cho bạn!',
          'info',
          4200
        );
        await this.mobileBundle.downloadVirtualWorkspaceBundleHtml();
        return false;
      }

      // Nếu đang có thư mục cũ chỉ chờ cấp lại quyền theo thao tác bấm nút
      if (!forceFreshPick && this._pendingReconnectHandle && !this.rootDirHandle) {
        const okRe = await this.reconnectPendingFolder();
        if (okRe) return true;
      }

      try {
        let pickedHandle = null;
        try {
          pickedHandle = await window.showDirectoryPicker({
            id: 'noir_novel_workspace_dir',
            mode: 'readwrite'
          });
        } catch (pickerOptErr) {
          if (pickerOptErr?.name === 'TypeError') {
            pickedHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
          } else {
            throw pickerOptErr;
          }
        }

        if (!pickedHandle) return false;
        const permRes = await this.permissionGuardian.evaluateHandlePermission(pickedHandle);
        if (!permRes.ok) {
          if (permRes.needsOneClickConfirm) {
            this._pendingReconnectHandle = pickedHandle;
            try {
              const storeName = this.NS.constants?.STORES?.WORKSPACE_HANDLES || 'workspace_handles';
              await this.NS.idb?.set?.(storeName, HANDLE_STORAGE_KEY, pickedHandle);
            } catch (_e) {}
            await this.saveRememberedFolderMeta({
              folderName: pickedHandle.name,
              mode: 'desktop_fs_handle_pending',
              isFallbackWorkspace: false,
              connectedAt: Date.now()
            });
            this.lastConnectError = `Đã nhận thư mục "${pickedHandle.name}", nhưng thao tác chọn mất hơn vài giây nên trình duyệt cần 1 cú nhấp xác nhận quyền Ghi. Hãy bấm nút "🔄 Nối lại thư mục" ở trên!`;
          } else {
            this.lastConnectError = `Bạn chưa cấp quyền Đọc/Ghi cho thư mục "${pickedHandle.name || 'đã chọn'}". Hãy bấm lại và chọn "Cho phép chỉnh sửa tệp" (hoặc chọn 1 thư mục con trong ổ D:\\).`;
            this.fallbackModeActive = true;
          }
          this.utils.showToast(`⚠️ ${this.lastConnectError}`, 'warning', 5200);
          this.NS.bus?.emit?.('fs:connect_error', { error: this.lastConnectError });
          return false;
        }

        this.rootDirHandle = pickedHandle;
        this.fallbackModeActive = false;
        this.lastConnectError = '';
        this.subFolderHandles.clear();
        this._pendingReconnectHandle = null;
        this.rememberedFolderMeta = {
          folderName: pickedHandle.name,
          mode: 'desktop_fs_handle',
          isFallbackWorkspace: false,
          connectedAt: Date.now()
        };
        this.updateHeaderStatusUI(true, pickedHandle.name);
        if (this.NS.bus?.emit) {
          this.NS.bus.emit(
            this.NS.constants?.EVENTS?.FS_CONNECTED || 'fs:connected',
            { folderName: pickedHandle.name }
          );
        }

        try {
          const storeName = this.NS.constants?.STORES?.WORKSPACE_HANDLES || 'workspace_handles';
          await this.NS.idb?.set?.(storeName, HANDLE_STORAGE_KEY, pickedHandle);
        } catch (_idbErr) {
          // Vẫn giữ handle trong RAM phiên hiện tại nếu IDB hạn chế clone handle
        }

        await this.saveRememberedFolderMeta(this.rememberedFolderMeta);

        try {
          await this.ensureSubFolders();
          await this.syncAllManuscriptsToLocalFolder();
          await this.tab2Widget.refreshFolderGridUI?.();
        } catch (_syncErr) {}

        this.utils.showToast(
          `📂 Đã liên kết & đồng bộ toàn bộ 6 thư mục vào "${pickedHandle.name}"!`,
          'success',
          4200
        );
        return true;
      } catch (err) {
        const msg = String(err?.message || '');
        const lower = msg.toLowerCase();
        if (err && err.name === 'AbortError') {
          this.lastConnectError =
            'Hộp thoại chọn thư mục vừa bị đóng hoặc Chrome từ chối mở trực tiếp thư mục hệ thống (Desktop/Documents/Downloads/C:\\). Hãy chọn một thư mục con riêng (VD: D:\\TruyenCuaBi) hoặc dùng Kho Làm Việc Dự Phòng bên dưới.';
          this.fallbackModeActive = true;
          this.NS.bus?.emit?.('fs:connect_error', { error: this.lastConnectError });
          return false;
        }
        const isFileOrOriginBlocked =
          (typeof window !== 'undefined' && window.location?.protocol === 'file:') ||
          err?.name === 'SecurityError' ||
          err?.name === 'NotAllowedError' ||
          lower.includes('system') ||
          lower.includes('origin') ||
          lower.includes('secure');
        if (isFileOrOriginBlocked) {
          this.fallbackModeActive = true;
          this.lastConnectError =
            window.location?.protocol === 'file:'
              ? 'Chrome/Edge thường chặn quyền ghi ổ cứng trực tiếp khi mở tệp qua file:// (hoặc khi chọn thư mục hệ thống). Hãy dùng Khung Thư Mục Dự Phòng vừa mở bên dưới (tự lưu bền vững trên máy) hoặc chạy web qua http://localhost!'
              : `Trình duyệt từ chối thư mục này (${err?.name || 'SecurityError'}: ${msg || 'thư mục chứa tệp hệ thống hoặc chưa cấp quyền'}). Hãy chọn thư mục riêng (VD: D:\\TruyenCuaBi) hoặc dùng Khung Thư Mục Dự Phòng bên dưới!`;
        } else {
          this.fallbackModeActive = true;
          this.lastConnectError = `Không thể kết nối thư mục (${err?.name || 'Lỗi'}): ${msg || 'Lỗi quyền truy cập'}.`;
        }
        this.utils.showToast(`❌ ${this.lastConnectError}`, 'error', 5500);
        this.NS.bus?.emit?.('fs:connect_error', { error: this.lastConnectError });
        return false;
      }
    }

    async disconnectFolder() {
      this.rootDirHandle = null;
      this.opfsRootHandle = null;
      this.subFolderHandles.clear();
      this._pendingReconnectHandle = null;
      this.lastConnectError = '';
      this.fallbackModeActive = false;
      this.saveMobileWorkspaceState(null);
      await this.saveRememberedFolderMeta(null);
      try {
        const storeName = this.NS.constants?.STORES?.WORKSPACE_HANDLES || 'workspace_handles';
        await this.NS.idb?.delete?.(storeName, HANDLE_STORAGE_KEY);
      } catch (_) {
        // Bỏ qua
      }
      this.updateHeaderStatusUI(false, '');
      this.tab2Widget.refreshFolderGridUI?.();
      if (this.NS.bus?.emit) {
        this.NS.bus.emit(
          this.NS.constants?.EVENTS?.FS_DISCONNECTED || 'fs:disconnected',
          {}
        );
      }
      this.utils.showToast('🔌 Đã ngắt liên kết thư mục ổ cứng.', 'info');
    }

    getActiveRootHandle() {
      return this.rootDirHandle || this.opfsRootHandle || null;
    }

    async ensureSubFolders() {
      const rootHandle = this.getActiveRootHandle();
      if (!rootHandle) return false;
      if (this.rootDirHandle) {
        const perm = await this.permissionGuardian.queryReadWritePermission(this.rootDirHandle);
        if (perm !== 'granted') return false;
      }

      const folderNames = this.getTargetFolderNames();
      try {
        for (let i = 0; i < folderNames.length; i += 1) {
          const name = folderNames[i];
          const subHandle = await rootHandle.getDirectoryHandle(name, { create: true });
          this.subFolderHandles.set(name, subHandle);
        }
        return true;
      } catch (_) {
        return false;
      }
    }

    async getSubFolderHandle(subFolderName) {
      const rootHandle = this.getActiveRootHandle();
      if (!rootHandle) return null;
      if (this.subFolderHandles.has(subFolderName)) {
        return this.subFolderHandles.get(subFolderName);
      }
      try {
        const sub = await rootHandle.getDirectoryHandle(subFolderName, { create: true });
        this.subFolderHandles.set(subFolderName, sub);
        return sub;
      } catch (_) {
        return null;
      }
    }

    async writeTextFile(subFolder, fileName, content) {
      if (!this.getActiveRootHandle()) return false;
      try {
        const subHandle = await this.getSubFolderHandle(subFolder);
        if (!subHandle) return false;
        const ok = await this.permissionGuardian.writeUtf8TextFileHandle(
          subHandle,
          fileName,
          content
        );
        if (ok && this.NS.bus?.emit) {
          this.NS.bus.emit(
            this.NS.constants?.EVENTS?.FS_FILE_WRITTEN || 'fs:file_written',
            { subFolder, fileName }
          );
        }
        return ok;
      } catch (_) {
        return false;
      }
    }

    async writeTextFileToRoot(fileName, content) {
      const rootHandle = this.getActiveRootHandle();
      if (!rootHandle) return false;
      try {
        return await this.permissionGuardian.writeUtf8TextFileHandle(
          rootHandle,
          fileName,
          content
        );
      } catch (_) {
        return false;
      }
    }

    async readTextFile(subFolder, fileName) {
      if (!this.getActiveRootHandle()) return null;
      try {
        const subHandle = await this.getSubFolderHandle(subFolder);
        if (!subHandle) return null;
        return await this.permissionGuardian.readUtf8TextFileHandle(subHandle, fileName);
      } catch (_) {
        return null;
      }
    }

    async deleteFile(subFolder, fileName) {
      if (!this.getActiveRootHandle()) return false;
      try {
        const subHandle = await this.getSubFolderHandle(subFolder);
        if (!subHandle || typeof subHandle.removeEntry !== 'function') return false;
        await subHandle.removeEntry(fileName);
        return true;
      } catch (_) {
        return false;
      }
    }

    async listFilesInSubFolder(subFolder) {
      if (!this.getActiveRootHandle()) return [];
      const subHandle = await this.getSubFolderHandle(subFolder);
      if (!subHandle) return [];
      return this.permissionGuardian.listDirectoryEntries(subHandle);
    }

    async syncSingleChapterToDisk(chapterRecord, indexZeroBased = 0) {
      if (!this.isConnected() || !chapterRecord) return false;
      const fileName = this.sanitizer.buildOrderedChapterFileName(
        chapterRecord,
        indexZeroBased,
        'txt'
      );
      const targetFolder =
        chapterRecord.status === 'APPROVED'
          ? '02_Chuong_Da_Duyet'
          : '01_Chuong_Goc_Chua_Duyet';
      const body = [
        `====================================================================`,
        `${chapterRecord.displayTitle || chapterRecord.title}`,
        `Trạng thái: ${chapterRecord.status === 'APPROVED' ? 'BẢN ĐÃ DUYỆT' : 'BẢN NHÁP'} | Số từ: ${chapterRecord.wordCount || 0}`,
        `====================================================================`,
        chapterRecord.beats ? `\n[DÀN Ý / BEATS]:\n${chapterRecord.beats}\n\n--------------------------------------------------------------------\n` : '',
        chapterRecord.content || ''
      ].join('\n');

      this.writeScheduler.enqueueFileWrite(targetFolder, fileName, body, 500);
      return true;
    }

    async syncAllManuscriptsToLocalFolder() {
      const res = await this.synchronizer.executeFullSixFolderSync();
      if (res.synced) {
        const c = res.counts;
        this.utils.showToast(
          `📁 Đã đồng bộ ổ cứng (${c.draftsWritten} nháp, ${c.approvedWritten} đã duyệt, ${c.bibleFilesWritten} hồ sơ Bible)!`,
          'success',
          3600
        );
        if (this.NS.bus?.emit) {
          this.NS.bus.emit(
            this.NS.constants?.EVENTS?.FS_SYNC_COMPLETED || 'fs:sync_completed',
            res
          );
        }
      }
      return res;
    }

    async importExternalEditsFromFolder() {
      return this.importer.scanAndImportNewOrExternalChapters();
    }

    /**
     * Cập nhật nút `#btn-connect-local-folder` trên thanh Header trên cả Máy tính & Điện thoại
     */
    updateHeaderStatusUI(connected, folderName = '', needsReconnectClick = false) {
      if (typeof document === 'undefined') return;
      const btn = document.getElementById('btn-connect-local-folder');
      if (!btn) return;

      if (connected) {
        const shortName = String(folderName || 'Ổ cứng').slice(0, 18);
        btn.innerHTML = `<span class="inline-flex items-center gap-1.5"><span>📂</span><span class="hidden sm:inline">${this.utils.escapeHtml(shortName)}</span><span class="sm:hidden">Đã nối</span></span>`;
        btn.className =
          'px-2.5 py-1.5 rounded-xl border border-emerald-500/45 bg-emerald-500/15 text-emerald-300 text-xs font-bold hover:bg-emerald-500/25 transition shrink-0';
        btn.title = `Đang đồng bộ tự động vào thư mục: ${folderName}`;
      } else if (needsReconnectClick && folderName) {
        btn.innerHTML = `<span class="inline-flex items-center gap-1.5"><span>🔄</span><span class="hidden sm:inline">Nối lại (${this.utils.escapeHtml(folderName.slice(0, 12))})</span><span class="sm:hidden">Nối lại</span></span>`;
        btn.className =
          'px-2.5 py-1.5 rounded-xl border border-amber-500/50 bg-amber-500/15 text-amber-300 text-xs font-bold hover:bg-amber-500/25 transition shrink-0';
        btn.title = `Nhấn để cấp lại quyền ghi nhanh vào thư mục cũ: ${folderName}`;
      } else if (!this.isSupported()) {
        btn.innerHTML = `<span class="inline-flex items-center gap-1.5"><span>📦</span><span class="hidden sm:inline">Gói 6 Thư mục</span><span class="sm:hidden">Gói File</span></span>`;
        btn.className =
          'px-2.5 py-1.5 rounded-xl border border-sky-500/35 bg-sky-500/10 text-sky-300 text-xs font-semibold hover:bg-sky-500/20 transition shrink-0';
        btn.title = 'Tải gói lưu trữ 6 thư mục ngoại tuyến về điện thoại/máy tính bảng';
      } else {
        btn.innerHTML = `<span class="inline-flex items-center gap-1.5"><span>📂</span><span class="hidden sm:inline">Nối Ổ Cứng</span><span class="sm:hidden">Ổ cứng</span></span>`;
        btn.className =
          'px-2.5 py-1.5 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition shrink-0';
        btn.title = 'Liên kết thư mục máy tính để tự động sao lưu 6 thư mục theo thời gian thực';
      }
    }

    bindHeaderButton() {
      if (typeof document === 'undefined') return;
      const btn = document.getElementById('btn-connect-local-folder');
      if (btn && !btn.dataset.noirMod05Bound) {
        btn.dataset.noirMod05Bound = '1';
        btn.addEventListener('click', () => this.requestConnectFolder());
      }
    }

    async init() {
      if (this.initialized) return this;
      this.initialized = true;
      this.bindHeaderButton();
      this.tab2Widget.injectFolderExplorerPanelIfNeeded();
      await this.tryRestoreSavedFolderHandle();
      return this;
    }
  }

  // ==========================================================================
  // PHẦN 8: XUẤT MỤC LỤC OBSIDIAN WIKILINKS & KIỂM TRA XUNG ĐỘT FILE NGOẠI TUYẾN
  // ==========================================================================

  class ObsidianMarkdownAndCatalogExporter {
    constructor(fsEngine, sanitizer) {
      this.NS = window.NoirStudio;
      this.fs = fsEngine;
      this.sanitizer = sanitizer;
    }

    /**
     * Tạo tệp mục lục `00_MUC_LUC_TAC_PHAM.md` ở gốc thư mục ổ cứng
     * giúp tác giả mở toàn bộ thư mục truyện trong Obsidian / VS Code cực kỳ trực quan.
     */
    buildMasterCatalogMarkdown() {
      const chapters = this.NS.chapterManager?.chapters || [];
      const totalWords = chapters.reduce((s, c) => s + (c.wordCount || 0), 0);
      const nowStr = this.fs.utils.formatTimestampVN(Date.now());

      const lines = [
        `# 📚 MỤC LỤC BẢN THẢO TIỂU THUYẾT`,
        `- **Cập nhật lần cuối:** ${nowStr}`,
        `- **Tổng số chương:** ${chapters.length} chương`,
        `- **Tổng độ dài bản thảo:** ${totalWords.toLocaleString('vi-VN')} từ`,
        '',
        '## 📝 Danh Sách Các Chương Hiện Có',
        ''
      ];

      chapters.forEach((chap, idx) => {
        const fileName = this.sanitizer.buildOrderedChapterFileName(chap, idx, 'txt');
        const folder =
          chap.status === 'APPROVED'
            ? '02_Chuong_Da_Duyet'
            : '01_Chuong_Goc_Chua_Duyet';
        const statusIcon = chap.status === 'APPROVED' ? '✅ Đã duyệt' : '📝 Bản nháp';
        lines.push(
          `${idx + 1}. **${chap.displayTitle || chap.title}** — ${statusIcon} (${(
            chap.wordCount || 0
          ).toLocaleString('vi-VN')} từ) → \`${folder}/${fileName}\``
        );
      });

      const chars = this.NS.idb?.getLocalJSON?.('noir_s10_character_profiles_v1', []) || [];
      if (Array.isArray(chars) && chars.length > 0) {
        lines.push('');
        lines.push('## 👥 Hồ Sơ Nhân Vật Chính (Story Bible)');
        chars.slice(0, 25).forEach((ch) => {
          lines.push(`- **${ch.name || ch.ten || 'Nhân vật'}**: ${ch.role || 'Chưa rõ vai trò'}`);
        });
      }

      return lines.join('\n');
    }

    async writeMasterCatalogToDiskRoot() {
      if (!this.fs.isConnected()) return false;
      const md = this.buildMasterCatalogMarkdown();
      return this.fs.writeTextFileToRoot('00_MUC_LUC_TAC_PHAM.md', md);
    }

    /**
     * Xuất toàn bộ bản thảo thành chuỗi XML RSS/OPF đơn giản dùng để kiểm tra cấu trúc
     * hoặc nhập sang phần mềm đọc sách ngoại tuyến.
     */
    buildWorkspaceManifestJson() {
      const chapters = this.NS.chapterManager?.chapters || [];
      return JSON.stringify(
        {
          manifestVersion: '38.0',
          generatedAt: Date.now(),
          rootFolder: this.fs.getConnectedFolderName() || 'PortableWorkspace',
          folders: this.fs.getTargetFolderNames(),
          chapters: chapters.map((c, idx) => ({
            id: c.id,
            title: c.displayTitle || c.title,
            status: c.status,
            wordCount: c.wordCount || 0,
            diskFile: this.sanitizer.buildOrderedChapterFileName(c, idx, 'txt')
          }))
        },
        null,
        2
      );
    }
  }

  /**
   * Bộ phát hiện xung đột sửa file ngoài ổ cứng vs trình duyệt
   * (Ví dụ: Tác giả mở file `001_Chuong_1.txt` bằng Word sửa thêm 200 chữ trong lúc Tab web vẫn mở).
   */
  class ExternalDiskConflictDetector {
    constructor(fsEngine, sanitizer, importer) {
      this.NS = window.NoirStudio;
      this.fs = fsEngine;
      this.sanitizer = sanitizer;
      this.importer = importer;
      this.detectedConflicts = [];
    }

    async scanForExternalDiskModifications() {
      this.detectedConflicts = [];
      if (!this.fs.isConnected()) return this.detectedConflicts;

      const chapters = this.NS.chapterManager?.chapters || [];
      for (let i = 0; i < chapters.length; i += 1) {
        const chap = chapters[i];
        const subFolder =
          chap.status === 'APPROVED'
            ? '02_Chuong_Da_Duyet'
            : '01_Chuong_Goc_Chua_Duyet';
        const fileName = this.sanitizer.buildOrderedChapterFileName(chap, i, 'txt');
        const entries = await this.fs.listFilesInSubFolder(subFolder);
        const diskEntry = entries.find((e) => e.name === fileName);
        if (!diskEntry) continue;

        if (diskEntry.lastModified > (chap.updatedAt || 0) + 12000) {
          const diskRaw = await this.fs.readTextFile(subFolder, fileName);
          if (diskRaw !== null) {
            const parsed = this.importer.parseSyncedChapterFileText(diskRaw, fileName);
            if (parsed.content && parsed.content.trim() !== (chap.content || '').trim()) {
              this.detectedConflicts.push({
                chapterId: chap.id,
                chapterTitle: chap.displayTitle || chap.title,
                fileName,
                subFolder,
                diskModifiedAt: diskEntry.lastModified,
                appUpdatedAt: chap.updatedAt || 0,
                diskContent: parsed.content,
                diskWordCount: this.NS.utils?.countVietnameseWords?.(parsed.content) || 0,
                appWordCount: chap.wordCount || 0
              });
            }
          }
        }
      }
      return this.detectedConflicts;
    }

    async applyDiskVersionToApp(conflictItem) {
      if (!conflictItem) return false;
      const cm = this.NS.chapterManager;
      const chap = cm?.chapters?.find((c) => c.id === conflictItem.chapterId);
      if (!chap) return false;

      if (this.NS.versionVault?.createSnapshot) {
        this.NS.versionVault.createSnapshot(
          `Trước khi nhập bản sửa từ ổ đĩa (${chap.displayTitle})`,
          'PRE_DISK_MERGE'
        );
      }

      chap.content = conflictItem.diskContent;
      chap.wordCount = this.NS.utils?.countVietnameseWords?.(chap.content) || 0;
      chap.updatedAt = Date.now();
      await cm.persistChapters();
      if (this.NS.state?.activeChapterId === chap.id) {
        cm.loadActiveChapterIntoEditor();
      }
      cm.renderChapterTreeAndQuickSwitcher();
      return true;
    }

    /**
     * Xuất tóm tắt kết quả đồng bộ ổ cứng thành dòng trạng thái thân thiện cho người dùng
     */
    formatSyncHealthMessage() {
      if (!this.fs.isSupported()) {
        return 'Đang chạy trên thiết bị di động hoặc trình duyệt chưa hỗ trợ nối trực tiếp thư mục — hãy dùng nút "Tải Gói 6 Thư Mục".';
      }
      if (!this.fs.isConnected()) {
        return 'Chưa nối thư mục máy tính. Bấm "Nối Ổ Cứng" trên thanh trên cùng để tự lưu bản thảo ra file .txt.';
      }
      const writes = this.fs.writeScheduler?.totalFilesWrittenCount || 0;
      return `Đang đồng bộ với "${this.fs.getConnectedFolderName()}" (Đã ghi ${writes} tệp trong phiên này).`;
    }
  }

  /**
   * Trình sao lưu tự động định kỳ các tệp thiết yếu (Story Bible + Chapters)
   * ra 6 thư mục mỗi khi có sự kiện lưu trữ lớn từ AutoSaver hoặc Approval.
   */
  class WorkspaceEventBusDiskMirror {
    constructor(fsEngine) {
      this.NS = window.NoirStudio;
      this.fs = fsEngine;
      this._subscribed = false;
    }

    subscribeToStudioEvents() {
      if (this._subscribed || !this.NS.bus || typeof this.NS.bus.on !== 'function') {
        return;
      }
      this._subscribed = true;

      const events = this.NS.constants?.EVENTS || {};
      const saveEvt = events.CHAPTER_SAVED || 'chapter:saved';
      const approvedEvt = events.CHAPTER_APPROVED || 'chapter:approved';
      const bibleEvt = events.BIBLE_UPDATED || 'bible:updated';

      this.NS.bus.on(saveEvt, () => {
        if (!this.fs.isConnected()) return;
        const active = this.NS.chapterManager?.getActiveChapter?.();
        const chapters = this.NS.chapterManager?.chapters || [];
        const idx = active ? chapters.findIndex((c) => c.id === active.id) : 0;
        if (active) {
          this.fs.syncSingleChapterToDisk(active, Math.max(0, idx));
        }
      });

      this.NS.bus.on(approvedEvt, () => {
        if (this.fs.isConnected()) {
          this.fs.syncAllManuscriptsToLocalFolder();
        }
      });

      this.NS.bus.on(bibleEvt, () => {
        if (!this.fs.isConnected()) return;
        const bible = localStorage.getItem('noir_s10_rendered_bible_content') || '';
        if (bible.trim()) {
          this.fs.writeScheduler.enqueueFileWrite(
            '03_Story_Bible_Local',
            '00_Story_Bible_Tong_Hop.md',
            bible,
            1200
          );
        }
      });
    }
  }

  // ==========================================================================
  // PHẦN 9: TRÌNH XEM TRƯỚC TỆP ĐỊA PHƯƠNG & KIỂM CHỨNG ĐỌC/GHI Ổ CỨNG
  // ==========================================================================

  class LocalFolderDiagnosticAndPreviewController {
    constructor(fsEngine, backupRotator, conflictDetector) {
      this.NS = window.NoirStudio;
      this.fs = fsEngine;
      this.backupRotator = backupRotator;
      this.conflictDetector = conflictDetector;
      this.lastSelfTestReport = null;
    }

    /**
     * Chạy kiểm chứng đọc/ghi thực tế trên thư mục đã kết nối (tạo file probe tạm rồi xóa ngay)
     * để chắc chắn hệ điều hành (Windows Controlled Folder Access / Antivirus) không chặn ghi.
     */
    async verifyDiskWriteReadPermissionsProbe() {
      if (!this.fs.isConnected()) {
        return {
          passed: false,
          reason: 'Chưa kết nối thư mục ổ cứng cục bộ.'
        };
      }

      const probeFolder = '06_Sao_Luu_Code_Va_Ban_Thao';
      const probeFile = `.__noir_probe_${Date.now()}.tmp`;
      const expectedPayload = `NoirStudio Probe UTF-8: Tiếng Việt Ă Â Đ Ê Ô Ơ Ư (${Date.now()})`;

      try {
        const wrote = await this.fs.writeTextFile(probeFolder, probeFile, expectedPayload);
        if (!wrote) {
          return {
            passed: false,
            reason: 'Không thể tạo tệp kiểm thử (Thiếu quyền Write).'
          };
        }

        const readBack = await this.fs.readTextFile(probeFolder, probeFile);
        await this.fs.deleteFile(probeFolder, probeFile);

        const exactMatch = readBack === expectedPayload;
        this.lastSelfTestReport = {
          passed: exactMatch,
          testedAt: Date.now(),
          rootFolder: this.fs.getConnectedFolderName(),
          reason: exactMatch
            ? 'Đọc & Ghi UTF-8 hoạt động hoàn hảo 100%!'
            : 'Nội dung đọc lại không khớp mã hóa UTF-8.'
        };
        return this.lastSelfTestReport;
      } catch (err) {
        return {
          passed: false,
          reason: err?.message || 'Lỗi truy cập hệ thống tệp tin.'
        };
      }
    }

    /**
     * Mở cửa sổ xem nhanh nội dung từng file đang nằm trong 6 thư mục ổ cứng
     * ngay bên trong ứng dụng mà không phải chuyển cửa sổ File Explorer.
     */
    async openFolderTreePreviewOverlay() {
      if (typeof document === 'undefined') return;
      if (!this.fs.isConnected()) {
        this.fs.utils.showToast(
          'ℹ️ Hãy bấm "Nối Ổ Cứng" trước để duyệt danh sách tệp trong 6 thư mục.',
          'info'
        );
        return;
      }

      const existing = document.getElementById('mod05-disk-inspector-modal');
      if (existing) existing.remove();

      const footprint = await this.backupRotator.computeFolderDiskFootprintReport();
      const esc = (s) => this.fs.utils.escapeHtml(s);

      const folderCards = [];
      for (let i = 0; i < footprint.folders.length; i += 1) {
        const info = footprint.folders[i];
        const entries = await this.fs.listFilesInSubFolder(info.folderName);
        const files = entries.filter((e) => e.kind === 'file');

        const filesHtml =
          files.length === 0
            ? '<div class="text-[11px] text-zinc-500 italic py-1">(Thư mục trống)</div>'
            : files
                .slice(0, 18)
                .map(
                  (f) => `
                <div class="flex items-center justify-between gap-2 py-1 border-b border-zinc-800/70 text-[11px]">
                  <button type="button" data-preview-folder="${esc(info.folderName)}" data-preview-file="${esc(f.name)}" class="text-left text-zinc-200 hover:text-emerald-300 truncate font-mono">📄 ${esc(f.name)}</button>
                  <span class="text-zinc-500 shrink-0">${Math.max(1, Math.round((f.sizeBytes || 0) / 1024))} KB</span>
                </div>`
                )
                .join('');

        folderCards.push(`
          <div class="rounded-xl border border-zinc-800 bg-zinc-900/90 p-3 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-amber-300">📁 ${esc(info.folderName)}</span>
              <span class="text-[11px] text-zinc-400">${info.fileCount} tệp (${info.sizeKB} KB)</span>
            </div>
            <div class="max-h-40 overflow-y-auto pr-1">${filesHtml}</div>
          </div>
        `);
      }

      const overlay = document.createElement('div');
      overlay.id = 'mod05-disk-inspector-modal';
      overlay.className =
        'fixed inset-0 z-[10010] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6';

      overlay.innerHTML = `
        <div class="w-full max-w-4xl max-h-[88vh] rounded-2xl border border-zinc-700 bg-zinc-950 flex flex-col overflow-hidden shadow-2xl">
          <div class="flex items-center justify-between gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-900">
            <div>
              <h3 class="text-sm font-extrabold text-emerald-300">📂 Trình Duyệt 6 Thư Mục Ổ Cứng: ${esc(footprint.rootFolderName)}</h3>
              <p class="text-[11px] text-zinc-400">Tổng cộng ${footprint.totalFiles} tệp • ${footprint.totalKB} KB trên ổ đĩa thật</p>
            </div>
            <button type="button" id="btn-close-mod05-inspector" class="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 font-bold">✕ Đóng</button>
          </div>
          <div class="p-4 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
            ${folderCards.join('')}
          </div>
          <div id="mod05-file-preview-drawer" class="hidden border-t border-zinc-800 bg-zinc-900/95 p-3 max-h-56 overflow-y-auto space-y-1.5">
            <div class="flex items-center justify-between">
              <span id="mod05-preview-filename" class="text-xs font-bold text-indigo-300 font-mono"></span>
              <button type="button" id="btn-mod05-close-preview-drawer" class="text-[11px] text-zinc-400 hover:text-zinc-100">Ẩn xem trước</button>
            </div>
            <pre id="mod05-preview-textbody" class="text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed font-sans bg-zinc-950 p-2.5 rounded-lg border border-zinc-800"></pre>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);
      overlay.querySelector('#btn-close-mod05-inspector')?.addEventListener('click', () => overlay.remove());
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
      });
      overlay.querySelector('#btn-mod05-close-preview-drawer')?.addEventListener('click', () => {
        overlay.querySelector('#mod05-file-preview-drawer')?.classList.add('hidden');
      });

      overlay.querySelectorAll('[data-preview-file]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const folder = btn.getAttribute('data-preview-folder');
          const file = btn.getAttribute('data-preview-file');
          const content = await this.fs.readTextFile(folder, file);
          const drawer = overlay.querySelector('#mod05-file-preview-drawer');
          const fnEl = overlay.querySelector('#mod05-preview-filename');
          const bodyEl = overlay.querySelector('#mod05-preview-textbody');
          if (fnEl) fnEl.textContent = `${folder}/${file}`;
          if (bodyEl) bodyEl.textContent = content !== null ? content.slice(0, 8000) : '(Không thể đọc nội dung tệp)';
          if (drawer) drawer.classList.remove('hidden');
        });
      });
    }

    /**
     * Xuất toàn bộ nội dung Story Bible + Các Chương thành một tệp Markdown tổng hợp
     * duy nhất lưu trực tiếp vào thư mục `02_Chuong_Da_Duyet`
     */
    async writeCompiledManuscriptMarkdownToDisk() {
      if (!this.fs.isConnected()) return false;
      const chapters = this.NS.chapterManager?.chapters || [];
      const compiled = chapters
        .map((c, idx) => {
          const title = c.displayTitle || c.title || `Chương ${idx + 1}`;
          return `# ${title}\n\n${(c.content || '').trim()}\n`;
        })
        .join('\n\n---\n\n');
      return this.fs.writeTextFile('02_Chuong_Da_Duyet', '00_TOAN_BO_TAC_PHAM_TONG_HOP.md', compiled);
    }

    /**
     * Khởi chạy đối chiếu đồng bộ và thông báo cho tác giả nếu có file chỉnh tay bên ngoài
     */
    async checkAndNotifyExternalConflicts() {
      const conflicts = await this.conflictDetector.scanForExternalDiskModifications();
      if (conflicts.length > 0) {
        this.fs.utils.showToast(
          `🔔 Phát hiện ${conflicts.length} tệp trong thư mục ổ cứng vừa được sửa ngoài App! Mở Tab 2 -> Quét Nhập File Sửa để hợp nhất.`,
          'info',
          5000
        );
      }
      return conflicts;
    }
  }

  // ==========================================================================
  // PHẦN 10: ĐÓNG GÓI THƯ MỤC THÀNH FILE .ZIP THẬT 6 THƯ MỤC (ZERO-DEPENDENCY)
  // ==========================================================================

  class PureJsSixFolderZipBuilder {
    constructor(fsEngine, sanitizer) {
      this.NS = window.NoirStudio;
      this.fs = fsEngine;
      this.sanitizer = sanitizer;
    }

    computeCrc32Uint8(bytes) {
      if (!this._table) {
        const tbl = new Uint32Array(256);
        for (let i = 0; i < 256; i += 1) {
          let c = i;
          for (let j = 0; j < 8; j += 1) {
            c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
          }
          tbl[i] = c >>> 0;
        }
        this._table = tbl;
      }
      let crc = 0xffffffff;
      for (let i = 0; i < bytes.length; i += 1) {
        crc = (crc >>> 8) ^ this._table[(crc ^ bytes[i]) & 0xff];
      }
      return (crc ^ 0xffffffff) >>> 0;
    }

    buildZipBlobFromFileEntries(fileEntries) {
      const encoder = new TextEncoder();
      const localParts = [];
      const centralParts = [];
      let offset = 0;

      const dosTimeDate = (ts) => {
        const d = new Date(ts || Date.now());
        const time =
          ((d.getHours() & 0x1f) << 11) |
          ((d.getMinutes() & 0x3f) << 5) |
          ((d.getSeconds() >> 1) & 0x1f);
        const date =
          (((Math.max(1980, d.getFullYear()) - 1980) & 0x7f) << 9) |
          (((d.getMonth() + 1) & 0x0f) << 5) |
          (d.getDate() & 0x1f);
        return { time, date };
      };

      fileEntries.forEach((entry) => {
        const nameBytes = encoder.encode(entry.path);
        const dataBytes = encoder.encode(entry.content || '');
        const crc = this.computeCrc32Uint8(dataBytes);
        const dt = dosTimeDate(entry.modifiedAt);

        const localHeader = new ArrayBuffer(30);
        const lv = new DataView(localHeader);
        lv.setUint32(0, 0x04034b50, true);
        lv.setUint16(4, 20, true);
        lv.setUint16(6, 0x0800, true); // UTF-8 filename flag
        lv.setUint16(8, 0, true); // STORE method
        lv.setUint16(10, dt.time, true);
        lv.setUint16(12, dt.date, true);
        lv.setUint32(14, crc, true);
        lv.setUint32(18, dataBytes.length, true);
        lv.setUint32(22, dataBytes.length, true);
        lv.setUint16(26, nameBytes.length, true);
        lv.setUint16(28, 0, true);

        const centralHeader = new ArrayBuffer(46);
        const cv = new DataView(centralHeader);
        cv.setUint32(0, 0x02014b50, true);
        cv.setUint16(4, 20, true);
        cv.setUint16(6, 20, true);
        cv.setUint16(8, 0x0800, true);
        cv.setUint16(10, 0, true);
        cv.setUint16(12, dt.time, true);
        cv.setUint16(14, dt.date, true);
        cv.setUint32(16, crc, true);
        cv.setUint32(20, dataBytes.length, true);
        cv.setUint32(24, dataBytes.length, true);
        cv.setUint16(28, nameBytes.length, true);
        cv.setUint16(30, 0, true);
        cv.setUint16(32, 0, true);
        cv.setUint16(34, 0, true);
        cv.setUint16(36, 0, true);
        cv.setUint32(38, 0, true);
        cv.setUint32(42, offset, true);

        localParts.push(new Uint8Array(localHeader), nameBytes, dataBytes);
        centralParts.push(new Uint8Array(centralHeader), nameBytes);
        offset += 30 + nameBytes.length + dataBytes.length;
      });

      const centralSize = centralParts.reduce((s, p) => s + p.length, 0);
      const eocd = new ArrayBuffer(22);
      const ev = new DataView(eocd);
      ev.setUint32(0, 0x06054b50, true);
      ev.setUint16(4, 0, true);
      ev.setUint16(6, 0, true);
      ev.setUint16(8, fileEntries.length, true);
      ev.setUint16(10, fileEntries.length, true);
      ev.setUint32(12, centralSize, true);
      ev.setUint32(16, offset, true);
      ev.setUint16(20, 0, true);

      return new Blob([...localParts, ...centralParts, new Uint8Array(eocd)], {
        type: 'application/zip'
      });
    }

    async downloadSixFoldersAsRealZip() {
      const chapters = this.NS.chapterManager?.chapters || [];
      const entries = [];

      chapters.forEach((chap, idx) => {
        const folder =
          chap.status === 'APPROVED'
            ? '02_Chuong_Da_Duyet'
            : '01_Chuong_Goc_Chua_Duyet';
        const fileName = this.sanitizer.buildOrderedChapterFileName(chap, idx, 'txt');
        entries.push({
          path: `${folder}/${fileName}`,
          content: `${chap.displayTitle || chap.title}\n\n${chap.content || ''}`,
          modifiedAt: chap.updatedAt || Date.now()
        });
      });

      const bible = localStorage.getItem('noir_s10_rendered_bible_content') || '';
      entries.push({
        path: '03_Story_Bible_Local/00_Story_Bible_Tong_Hop.md',
        content: bible || '# Story Bible hiện chưa có nội dung.',
        modifiedAt: Date.now()
      });

      const scratch = localStorage.getItem('noir_quick_scratchpad_notes') || '';
      entries.push({
        path: '05_Bang_Trang_Y_Tuong/Bang_Trang_Nhanh.md',
        content: scratch || '# Ghi chú ý tưởng nhanh',
        modifiedAt: Date.now()
      });

      const blob = this.buildZipBlobFromFileEntries(entries);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NoirStudio_6ThuMuc_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2500);

      this.fs.utils.showToast(
        `🗜️ Đã nén & tải xuống tệp .ZIP chuẩn gồm ${entries.length} tệp trong 6 thư mục!`,
        'success',
        3800
      );
      return true;
    }
  }

  // Khởi tạo & gắn vào không gian tên toàn cục `window.NoirStudio.fsEngine`
  const fsEngine = new LocalFileSystemWorkspaceEngine();
  fsEngine.obsidianExporter = new ObsidianMarkdownAndCatalogExporter(fsEngine, fsEngine.sanitizer);
  fsEngine.conflictDetector = new ExternalDiskConflictDetector(
    fsEngine,
    fsEngine.sanitizer,
    fsEngine.importer
  );
  fsEngine.busMirror = new WorkspaceEventBusDiskMirror(fsEngine);
  fsEngine.diagnosticViewer = new LocalFolderDiagnosticAndPreviewController(
    fsEngine,
    fsEngine.backupRotator,
    fsEngine.conflictDetector
  );
  fsEngine.zipBuilder = new PureJsSixFolderZipBuilder(fsEngine, fsEngine.sanitizer);

  const origSyncAll = fsEngine.syncAllManuscriptsToLocalFolder.bind(fsEngine);
  fsEngine.syncAllManuscriptsToLocalFolder = async function syncWithCatalogAndRotation() {
    const res = await origSyncAll();
    if (res && res.synced) {
      await fsEngine.obsidianExporter.writeMasterCatalogToDiskRoot();
      await fsEngine.writeTextFile(
        '06_Sao_Luu_Code_Va_Ban_Thao',
        'Workspace_Manifest.json',
        fsEngine.obsidianExporter.buildWorkspaceManifestJson()
      );
    }
    return res;
  };

  // ==========================================================================
  // PHẦN 11: BÁO CÁO KIỂM KÊ THƯ MỤC & ĐỒNG HỒ THEO DÕI BĂNG THÔNG GHI ĐĨA
  // ==========================================================================

  class FolderInventoryReportGenerator {
    constructor(fsEngine, backupRotator) {
      this.fs = fsEngine;
      this.backupRotator = backupRotator;
    }

    async buildHumanReadableDiskInventoryText() {
      const footprint = await this.backupRotator.computeFolderDiskFootprintReport();
      if (!footprint.connected) {
        return 'Chưa kết nối thư mục ổ cứng cục bộ để lập báo cáo kiểm kê.';
      }
      const lines = [
        `📂 BÁO CÁO KIỂM KÊ Ổ CỨNG CỤC BỘ: ${footprint.rootFolderName}`,
        `Tổng số tệp: ${footprint.totalFiles} tệp • Tổng dung lượng: ${footprint.totalKB} KB`,
        '------------------------------------------------------------------------'
      ];
      footprint.folders.forEach((f, idx) => {
        lines.push(
          `${idx + 1}. ${f.folderName}: ${f.fileCount} tệp (${f.sizeKB} KB)${f.latestFile ? ` — Mới nhất: ${f.latestFile}` : ''}`
        );
      });
      return lines.join('\n');
    }

    async downloadDiskInventoryReportTxt() {
      const txt = await this.buildHumanReadableDiskInventoryText();
      const blob = new Blob(['\uFEFF' + txt], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BaoCao_6ThuMuc_${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      this.fs.utils.showToast('📋 Đã xuất Báo cáo kiểm kê 6 Thư mục (.TXT)!', 'success');
      return true;
    }

    getTelemetryStats() {
      return {
        isSupported: this.fs.isSupported(),
        isConnected: this.fs.isConnected(),
        folderName: this.fs.getConnectedFolderName(),
        filesWrittenInSession: this.fs.writeScheduler?.totalFilesWrittenCount || 0,
        writeFailuresInSession: this.fs.writeScheduler?.totalWriteFailures || 0
      };
    }
  }

  fsEngine.inventoryReporter = new FolderInventoryReportGenerator(
    fsEngine,
    fsEngine.backupRotator
  );

  const origInitMod05 = fsEngine.init.bind(fsEngine);
  fsEngine.init = async function initEnhancedMod05() {
    await origInitMod05();
    fsEngine.busMirror.subscribeToStudioEvents();
    return fsEngine;
  };

  NS.fsEngine = fsEngine;
  NS.fileSystemEngine = fsEngine;
  NS.localFs = fsEngine;
  NS.LocalFileSystemWorkspaceEngine = LocalFileSystemWorkspaceEngine;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        fsEngine.bindHeaderButton();
        fsEngine.tab2Widget.injectFolderExplorerPanelIfNeeded();
      });
    } else {
      fsEngine.bindHeaderButton();
      fsEngine.tab2Widget.injectFolderExplorerPanelIfNeeded();
    }
  }

  if (typeof NS.registerModule === 'function') {
    NS.registerModule('mod05', fsEngine);
  }
})(typeof window !== 'undefined' ? window : globalThis);
