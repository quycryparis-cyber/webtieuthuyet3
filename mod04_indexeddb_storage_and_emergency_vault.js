/**
 * ============================================================================
 * MODULE 04: INDEXEDDB MULTI-STORE STORAGE ENGINE, COMPRESSION & EMERGENCY VAULT
 * ============================================================================
 * Phiên bản: v38.0.0-SUPREME-MODULAR (2026)
 * Tệp: mod04_indexeddb_storage_and_emergency_vault.js
 * Nhiệm vụ:
 *   1. Quản lý cơ sở dữ liệu IndexedDB (`NoirPsychStudio_LocalDB_v1`) đa kho
 *      chứa (`workspace_handles`, `chapters`, `story_bible`, `rag_chunks`,
 *      `state_cache`) với cơ chế mở an toàn, tự động phục hồi lỗi kết nối và
 *      dự phòng RAM Cache khi trình duyệt ở chế độ Ẩn danh hạn chế IDB.
 *   2. Cung cấp API chuẩn cho toàn bộ 30 modules qua `window.NoirStudio.idb`:
 *      - `open()`, `set(store, key, val)`, `get(store, key)`, `getAll(store)`
 *      - `delete(store, key)`, `clearStore(store)`, `bulkSet(store, entries)`
 *      - `getLocalJSON(key, fallback)`, `setLocalJSON(key, value)`
 *   3. Trang bị Bộ Nén Dữ Liệu UTF-16 & Checksum Toàn Vẹn (FNV-1a / CRC32) giúp
 *      tiết kiệm dung lượng LocalStorage/IDB khi lưu hàng trăm chương truyện.
 *   4. Theo dõi dung lượng Quota trình duyệt (`StorageQuotaMonitor`) và Két Sắt
 *      Cứu Hộ Toàn Dự Án (`EmergencyWorkspaceVault`: xuất/nhập file `.noirbackup.json`
 *      chứa trọn bộ Chương, Story Bible, Nhân vật, Mốc cảnh, Lịch sử phiên bản).
 * ============================================================================
 */

(function initNoirStudioIndexedDBAndVaultModule(globalScope) {
  'use strict';

  const root = globalScope || (typeof window !== 'undefined' ? window : globalThis);
  root.NoirStudio = root.NoirStudio || {};
  const NS = root.NoirStudio;

  // ==========================================================================
  // PHẦN 1: CẤU HÌNH KHO LƯU TRỮ & BẢNG ÁNH XẠ TƯƠNG THÍCH NGƯỢC
  // ==========================================================================

  const CORE_STORES_LIST = Object.freeze([
    'workspace_handles',
    'chapters',
    'story_bible',
    'rag_chunks',
    'state_cache'
  ]);

  const STORE_ALIAS_MAP = Object.freeze({
    workspace_handles: 'workspace_handles',
    fs_handles: 'workspace_handles',
    chapters: 'chapters',
    manuscripts: 'chapters',
    story_bible: 'story_bible',
    bible: 'story_bible',
    rag_chunks: 'rag_chunks',
    rag: 'rag_chunks',
    state_cache: 'state_cache',
    settings: 'state_cache',
    versions: 'state_cache',
    version_vault: 'state_cache',
    ai_diff_logs: 'state_cache',
    audio_meta: 'state_cache'
  });

  const STORAGE_PRIORITY_CLASSES = Object.freeze({
    CRITICAL_DATA: [
      'noir_studio_chapters_v35',
      'noir_studio_chapters_v34',
      'noir_studio_chapters',
      'noir_v36_version_history_vault',
      'noir_s10_rendered_bible_content',
      'noir_s10_character_profiles_v1',
      'noir_s10_knowledge_matrix_v1',
      'noir_s10_clues_ledger_v1',
      'noir_gemini_api_key'
    ],
    RECOVERABLE_CACHE: [
      'noir_studio_rag_cache_temp',
      'noir_ui_transient_scroll',
      'noir_telemetry_temp_buf'
    ]
  });

  // ==========================================================================
  // PHẦN 2: BỘ TÍNH CHECKSUM TOÀN VẸN & NÉN CHUỖI AN TOÀN TIẾNG VIỆT UTF-8
  // ==========================================================================

  class DataIntegrityAndCompressionCodec {
    /**
     * Tính mã băm FNV-1a 32-bit siêu nhanh để kiểm chứng dữ liệu có bị sửa đổi
     * hay hỏng bit khi đọc ghi đa tầng.
     */
    computeFnv1aHash(input) {
      const str = String(input ?? '');
      let hash = 0x811c9dc5;
      for (let i = 0; i < str.length; i += 1) {
        hash ^= str.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
      }
      return (hash >>> 0).toString(16).padStart(8, '0');
    }

    /**
     * Tạo bảng CRC32 chuẩn ISO 3309 phục vụ kiểm tra gói sao lưu `.noirbackup.json`
     */
    getCrc32Table() {
      if (this._crcTable) return this._crcTable;
      const table = new Uint32Array(256);
      for (let n = 0; n < 256; n += 1) {
        let c = n;
        for (let k = 0; k < 8; k += 1) {
          c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        }
        table[n] = c >>> 0;
      }
      this._crcTable = table;
      return table;
    }

    computeCrc32(input) {
      const table = this.getCrc32Table();
      const str = String(input ?? '');
      let crc = 0 ^ -1;
      for (let i = 0; i < str.length; i += 1) {
        const code = str.charCodeAt(i);
        crc = (crc >>> 8) ^ table[(crc ^ (code & 0xff)) & 0xff];
        if (code > 0xff) {
          crc = (crc >>> 8) ^ table[(crc ^ ((code >>> 8) & 0xff)) & 0xff];
        }
      }
      return ((crc ^ -1) >>> 0).toString(16).padStart(8, '0');
    }

    /**
     * Nén nhẹ chuỗi JSON lặp từ tiếng Việt (dùng thuật toán Dictionary Token Substitution)
     * hoàn toàn lossless, tương thích mọi ký tự Unicode tiếng Việt và zero-dependency.
     */
    compressJsonSafely(jsonString) {
      const raw = String(jsonString || '');
      if (raw.length < 400) return `RAW:${raw}`;

      const frequentTokens = [
        '"displayTitle":',
        '"wordCount":',
        '"updatedAt":',
        '"createdAt":',
        '"APPROVED"',
        '"DRAFT"',
        '"content":',
        '"beats":',
        '"status":',
        '"order":',
        'Chương ',
        'nhân vật',
        'không thể',
        'trong phòng',
        'bỗng nhiên'
      ];

      let compressed = raw;
      const usedMap = [];
      for (let i = 0; i < frequentTokens.length; i += 1) {
        const tok = frequentTokens[i];
        if (compressed.includes(tok)) {
          const marker = `\uE000${i.toString(36)}\uE001`;
          const splitParts = compressed.split(tok);
          if (splitParts.length >= 3) {
            compressed = splitParts.join(marker);
            usedMap.push([i, tok]);
          }
        }
      }

      if (usedMap.length === 0 || compressed.length >= raw.length) {
        return `RAW:${raw}`;
      }

      const envelope = JSON.stringify({ m: usedMap, d: compressed });
      if (envelope.length + 4 >= raw.length) {
        return `RAW:${raw}`;
      }
      return `Z1:${envelope}`;
    }

    decompressJsonSafely(storedString) {
      const s = String(storedString || '');
      if (s.startsWith('RAW:')) {
        return s.slice(4);
      }
      if (s.startsWith('Z1:')) {
        try {
          const payload = JSON.parse(s.slice(3));
          let text = String(payload.d || '');
          const list = Array.isArray(payload.m) ? payload.m : [];
          for (let i = list.length - 1; i >= 0; i -= 1) {
            const [idx, tok] = list[i];
            const marker = `\uE000${Number(idx).toString(36)}\uE001`;
            text = text.split(marker).join(tok);
          }
          return text;
        } catch (_) {
          return s;
        }
      }
      return s;
    }

    /**
     * Tạo gói bọc có chữ ký kiểm chứng checksum
     */
    sealSignedRecord(key, dataObj) {
      const serialized = JSON.stringify(dataObj);
      const hash = this.computeFnv1aHash(serialized);
      return {
        __noirSealed: true,
        schemaVer: 2,
        key: String(key),
        savedAt: Date.now(),
        hash,
        payload: dataObj
      };
    }

    unwrapSignedRecord(record) {
      if (!record || typeof record !== 'object' || !record.__noirSealed) {
        return { intact: true, payload: record, wasSealed: false };
      }
      try {
        const serialized = JSON.stringify(record.payload);
        const actualHash = this.computeFnv1aHash(serialized);
        return {
          intact: actualHash === record.hash,
          payload: record.payload,
          savedAt: record.savedAt,
          wasSealed: true
        };
      } catch (_) {
        return { intact: false, payload: record.payload, wasSealed: true };
      }
    }
  }

  // ==========================================================================
  // PHẦN 3: BỘ CHUYỂN ĐỔI & ĐỒNG BỘ INDEXEDDB ĐA KHO (IDB ADAPTER ENGINE)
  // ==========================================================================

  class IndexedDBStorageAdapter {
    constructor() {
      this.NS = window.NoirStudio;
      this.db = null;
      this.openPromise = null;
      this.fallbackMemoryStores = new Map();
      this.codec = new DataIntegrityAndCompressionCodec();
      this.lastError = null;
      this.stats = {
        reads: 0,
        writes: 0,
        deletes: 0,
        memoryFallbacks: 0,
        lastOpenedAt: 0
      };
      this.ensureMemoryMaps();
    }

    getDbName() {
      return this.NS.constants?.DB_NAME || 'NoirPsychStudio_LocalDB_v1';
    }

    getDbVersion() {
      return Number(this.NS.constants?.DB_VERSION) || 3;
    }

    ensureMemoryMaps() {
      CORE_STORES_LIST.forEach((name) => {
        if (!this.fallbackMemoryStores.has(name)) {
          this.fallbackMemoryStores.set(name, new Map());
        }
      });
    }

    resolveStoreName(requestedStore) {
      const raw = String(requestedStore || 'state_cache').trim();
      const mapped = STORE_ALIAS_MAP[raw] || raw;
      if (this.db && this.db.objectStoreNames) {
        if (this.db.objectStoreNames.contains(mapped)) return mapped;
        if (this.db.objectStoreNames.contains(raw)) return raw;
        if (this.db.objectStoreNames.contains('state_cache')) return 'state_cache';
      }
      return CORE_STORES_LIST.includes(mapped) ? mapped : 'state_cache';
    }

    buildStorageKeyForAlias(resolvedStore, requestedStore, rawKey) {
      const req = String(requestedStore || resolvedStore);
      if (resolvedStore !== req && resolvedStore === 'state_cache') {
        return `__ns_${req}__::${String(rawKey)}`;
      }
      return String(rawKey);
    }

    /**
     * Mở kết nối IndexedDB an toàn kèm khóa chống mở trùng lúc khởi động
     */
    async open() {
      if (this.db) return this.db;
      if (this.openPromise) return this.openPromise;

      if (typeof indexedDB === 'undefined') {
        this.lastError = 'IndexedDB không khả dụng trong ngữ cảnh hiện tại.';
        return null;
      }

      this.openPromise = new Promise((resolve) => {
        try {
          const req = indexedDB.open(this.getDbName(), this.getDbVersion());

          req.onupgradeneeded = (evt) => {
            const db = evt.target.result;
            CORE_STORES_LIST.forEach((storeName) => {
              if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName);
              }
            });
          };

          req.onsuccess = (evt) => {
            const db = evt.target.result;
            let missingStore = false;
            CORE_STORES_LIST.forEach((storeName) => {
              if (!db.objectStoreNames.contains(storeName)) {
                missingStore = true;
              }
            });

            if (missingStore) {
              const nextVer = db.version + 1;
              db.close();
              const upgradeReq = indexedDB.open(this.getDbName(), nextVer);
              upgradeReq.onupgradeneeded = (upEvt) => {
                const upDb = upEvt.target.result;
                CORE_STORES_LIST.forEach((storeName) => {
                  if (!upDb.objectStoreNames.contains(storeName)) {
                    upDb.createObjectStore(storeName);
                  }
                });
              };
              upgradeReq.onsuccess = (upEvt) => {
                this.db = upEvt.target.result;
                this.attachDbLifecycleListeners(this.db);
                this.stats.lastOpenedAt = Date.now();
                this.openPromise = null;
                resolve(this.db);
              };
              upgradeReq.onerror = () => {
                this.lastError = upgradeReq.error?.message || 'Lỗi nâng cấp schema IndexedDB';
                this.openPromise = null;
                resolve(null);
              };
              return;
            }

            this.db = db;
            this.attachDbLifecycleListeners(db);
            this.stats.lastOpenedAt = Date.now();
            this.openPromise = null;
            resolve(db);
          };

          req.onerror = () => {
            this.lastError = req.error?.message || 'Không thể mở IndexedDB';
            this.openPromise = null;
            resolve(null);
          };

          req.onblocked = () => {
            this.lastError = 'Kết nối IndexedDB đang bị khóa bởi một tab cũ khác.';
            this.openPromise = null;
            resolve(null);
          };
        } catch (err) {
          this.lastError = err?.message || 'Lỗi khởi tạo IndexedDB';
          this.openPromise = null;
          resolve(null);
        }
      });

      return this.openPromise;
    }

    attachDbLifecycleListeners(db) {
      if (!db) return;
      db.onversionchange = () => {
        try {
          db.close();
          this.db = null;
        } catch (_) {
          // Bỏ qua
        }
      };
      db.onclose = () => {
        this.db = null;
      };
    }

    /**
     * Ghi một bản ghi vào đúng kho IndexedDB (hỗ trợ cả `keyPath` nếu legacy DB có
     * và out-of-line key mặc định cho store mới).
     */
    async set(storeName, key, value) {
      const k = String(key);
      const db = await this.open();
      const targetStore = this.resolveStoreName(storeName);
      const finalKey = this.buildStorageKeyForAlias(targetStore, storeName, k);

      this.ensureMemoryMaps();
      const memStore = this.fallbackMemoryStores.get(targetStore);
      if (memStore) memStore.set(finalKey, value);
      this.stats.writes += 1;

      if (!db) {
        this.stats.memoryFallbacks += 1;
        return false;
      }

      const executeWrite = () =>
        new Promise((resolve) => {
          try {
            const tx = db.transaction(targetStore, 'readwrite');
            const store = tx.objectStore(targetStore);
            const hasKeyPath = Boolean(store.keyPath);
            const req = hasKeyPath ? store.put(value) : store.put(value, finalKey);
            req.onsuccess = () => resolve(true);
            req.onerror = () => {
              this.lastError = req.error?.message || `IDB write error (${targetStore})`;
              resolve(false);
            };
            tx.onerror = () => resolve(false);
          } catch (err) {
            this.lastError = err?.message || 'Transaction error';
            resolve(false);
          }
        });

      if (this.NS.mutex && typeof this.NS.mutex.runExclusive === 'function') {
        return this.NS.mutex.runExclusive(executeWrite, `idb:${targetStore}`);
      }
      return executeWrite();
    }

    async get(storeName, key, fallbackValue = null) {
      const k = String(key);
      const db = await this.open();
      const targetStore = this.resolveStoreName(storeName);
      const finalKey = this.buildStorageKeyForAlias(targetStore, storeName, k);
      this.stats.reads += 1;

      if (!db) {
        this.stats.memoryFallbacks += 1;
        const memStore = this.fallbackMemoryStores.get(targetStore);
        return memStore && memStore.has(finalKey) ? memStore.get(finalKey) : fallbackValue;
      }

      return new Promise((resolve) => {
        try {
          const tx = db.transaction(targetStore, 'readonly');
          const store = tx.objectStore(targetStore);
          const req = store.get(finalKey);
          req.onsuccess = () => {
            if (req.result !== undefined) {
              resolve(req.result);
              return;
            }
            if (finalKey !== k) {
              const legacyReq = store.get(k);
              legacyReq.onsuccess = () =>
                resolve(legacyReq.result !== undefined ? legacyReq.result : fallbackValue);
              legacyReq.onerror = () => resolve(fallbackValue);
            } else {
              resolve(fallbackValue);
            }
          };
          req.onerror = () => resolve(fallbackValue);
        } catch (_) {
          resolve(fallbackValue);
        }
      });
    }

    async getAll(storeName) {
      const db = await this.open();
      const targetStore = this.resolveStoreName(storeName);
      this.stats.reads += 1;

      if (!db) {
        const memStore = this.fallbackMemoryStores.get(targetStore);
        return memStore ? Array.from(memStore.values()) : [];
      }

      return new Promise((resolve) => {
        try {
          const tx = db.transaction(targetStore, 'readonly');
          const store = tx.objectStore(targetStore);
          if (typeof store.getAll === 'function') {
            const req = store.getAll();
            req.onsuccess = () => {
              resolve(Array.isArray(req.result) ? req.result : []);
            };
            req.onerror = () => resolve([]);
          } else {
            const items = [];
            const cursorReq = store.openCursor();
            cursorReq.onsuccess = (evt) => {
              const cursor = evt.target.result;
              if (cursor) {
                items.push(cursor.value);
                cursor.continue();
              } else {
                resolve(items);
              }
            };
            cursorReq.onerror = () => resolve([]);
          }
        } catch (_) {
          resolve([]);
        }
      });
    }

    async getAllWithKeys(storeName) {
      const db = await this.open();
      const targetStore = this.resolveStoreName(storeName);
      if (!db) {
        const memStore = this.fallbackMemoryStores.get(targetStore);
        if (!memStore) return [];
        return Array.from(memStore.entries()).map(([k, v]) => ({ key: k, value: v }));
      }

      return new Promise((resolve) => {
        try {
          const rows = [];
          const tx = db.transaction(targetStore, 'readonly');
          const store = tx.objectStore(targetStore);
          const cursorReq = store.openCursor();
          cursorReq.onsuccess = (evt) => {
            const cursor = evt.target.result;
            if (cursor) {
              rows.push({ key: cursor.key, value: cursor.value });
              cursor.continue();
            } else {
              resolve(rows);
            }
          };
          cursorReq.onerror = () => resolve([]);
        } catch (_) {
          resolve([]);
        }
      });
    }

    async delete(storeName, key) {
      const k = String(key);
      const db = await this.open();
      const targetStore = this.resolveStoreName(storeName);
      const finalKey = this.buildStorageKeyForAlias(targetStore, storeName, k);
      this.stats.deletes += 1;

      const memStore = this.fallbackMemoryStores.get(targetStore);
      if (memStore) {
        memStore.delete(finalKey);
        memStore.delete(k);
      }

      if (!db) return true;

      return new Promise((resolve) => {
        try {
          const tx = db.transaction(targetStore, 'readwrite');
          const store = tx.objectStore(targetStore);
          store.delete(finalKey);
          if (finalKey !== k) {
            store.delete(k);
          }
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => resolve(false);
        } catch (_) {
          resolve(false);
        }
      });
    }

    async clearStore(storeName) {
      const db = await this.open();
      const targetStore = this.resolveStoreName(storeName);
      const memStore = this.fallbackMemoryStores.get(targetStore);
      if (memStore) memStore.clear();
      if (!db) return true;

      return new Promise((resolve) => {
        try {
          const tx = db.transaction(targetStore, 'readwrite');
          const store = tx.objectStore(targetStore);
          const req = store.clear();
          req.onsuccess = () => resolve(true);
          req.onerror = () => resolve(false);
        } catch (_) {
          resolve(false);
        }
      });
    }

    async bulkSet(storeName, entries) {
      const list = Array.isArray(entries) ? entries : [];
      if (list.length === 0) return true;
      const db = await this.open();
      const targetStore = this.resolveStoreName(storeName);

      if (!db) {
        for (let i = 0; i < list.length; i += 1) {
          await this.set(targetStore, list[i].key, list[i].value);
        }
        return true;
      }

      return new Promise((resolve) => {
        try {
          const tx = db.transaction(targetStore, 'readwrite');
          const store = tx.objectStore(targetStore);
          const hasKeyPath = Boolean(store.keyPath);
          for (let i = 0; i < list.length; i += 1) {
            const finalKey = this.buildStorageKeyForAlias(targetStore, storeName, list[i].key);
            if (hasKeyPath) {
              store.put(list[i].value);
            } else {
              store.put(list[i].value, finalKey);
            }
          }
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => resolve(false);
        } catch (_) {
          resolve(false);
        }
      });
    }

    getLocalJSON(key, fallbackValue = null) {
      try {
        const raw = localStorage.getItem(String(key));
        if (raw === null || raw === undefined || raw === '') return fallbackValue;
        const decoded = this.codec.decompressJsonSafely(raw);
        return JSON.parse(decoded);
      } catch (_) {
        return fallbackValue;
      }
    }

    setLocalJSON(key, value, useCompression = false) {
      try {
        const serialized = JSON.stringify(value);
        const finalStr = useCompression
          ? this.codec.compressJsonSafely(serialized)
          : serialized;
        localStorage.setItem(String(key), finalStr);
        return true;
      } catch (_) {
        return false;
      }
    }
  }

  // ==========================================================================
  // PHẦN 4: GIÁM SÁT DUNG LƯỢNG QUOTA & XIN QUYỀN LƯU TRỮ BỀN VỮNG (PERSISTENCE)
  // ==========================================================================

  class StorageQuotaAndHealthMonitor {
    constructor(idbAdapter) {
      this.idb = idbAdapter;
      this.persistedGranted = null;
      this.lastAuditReport = null;
    }

    /**
     * Đề nghị trình duyệt cấp quyền Persistent Storage để hệ điều hành (Android/Windows)
     * không bao giờ tự ý dọn dẹp dữ liệu bản thảo khi ổ cứng sắp đầy.
     */
    async requestPersistentStorageIfSupported() {
      try {
        if (typeof navigator === 'undefined' || !navigator.storage) {
          return false;
        }
        if (typeof navigator.storage.persisted === 'function') {
          const already = await navigator.storage.persisted();
          if (already) {
            this.persistedGranted = true;
            return true;
          }
        }
        if (typeof navigator.storage.persist === 'function') {
          const granted = await navigator.storage.persist();
          this.persistedGranted = Boolean(granted);
          return this.persistedGranted;
        }
      } catch (_) {
        // Trình duyệt chạy file:// có thể từ chối API storage.persist
      }
      return false;
    }

    /**
     * Đo dung lượng thực tế đang dùng ở LocalStorage & IndexedDB
     */
    async inspectStorageFootprint() {
      let localBytes = 0;
      const keyBreakdown = [];

      try {
        for (let i = 0; i < localStorage.length; i += 1) {
          const k = localStorage.key(i);
          if (!k) continue;
          const v = localStorage.getItem(k) || '';
          const byteLen = (k.length + v.length) * 2;
          localBytes += byteLen;
          keyBreakdown.push({
            key: k,
            bytes: byteLen,
            kb: Math.round((byteLen / 1024) * 10) / 10,
            isCritical: STORAGE_PRIORITY_CLASSES.CRITICAL_DATA.includes(k)
          });
        }
      } catch (_) {
        // Bỏ qua nếu LocalStorage bị khóa
      }

      keyBreakdown.sort((a, b) => b.bytes - a.bytes);

      let quotaBytes = 0;
      let usageBytes = 0;
      try {
        if (typeof navigator !== 'undefined' && navigator.storage?.estimate) {
          const est = await navigator.storage.estimate();
          quotaBytes = Number(est.quota) || 0;
          usageBytes = Number(est.usage) || 0;
        }
      } catch (_) {
        // Bỏ qua
      }

      const localLimitApproxBytes = 5 * 1024 * 1024; // ~5MB chuẩn chung trình duyệt
      const localUsagePercent = Math.min(
        100,
        Math.round((localBytes / localLimitApproxBytes) * 100)
      );

      this.lastAuditReport = {
        checkedAt: Date.now(),
        localStorageBytes: localBytes,
        localStorageKB: Math.round((localBytes / 1024) * 10) / 10,
        localUsagePercent,
        idbQuotaMB: quotaBytes ? Math.round(quotaBytes / (1024 * 1024)) : null,
        idbUsageMB: usageBytes ? Math.round((usageBytes / (1024 * 1024)) * 100) / 100 : null,
        persistedGranted: this.persistedGranted,
        topKeys: keyBreakdown.slice(0, 12)
      };

      return this.lastAuditReport;
    }

    /**
     * Giải phóng các key bộ nhớ đệm tạm nếu LocalStorage vượt quá 88% ngưỡng 5MB
     * nhưng TUYỆT ĐỐI bảo vệ toàn bộ Chương, Story Bible, Version Vault & API Key.
     */
    pruneDisposableCacheIfNeeded() {
      try {
        let totalChars = 0;
        for (let i = 0; i < localStorage.length; i += 1) {
          const k = localStorage.key(i);
          if (k) totalChars += (localStorage.getItem(k) || '').length + k.length;
        }
        const totalBytes = totalChars * 2;
        if (totalBytes < 4.3 * 1024 * 1024) {
          return { prunedCount: 0, freedKB: 0 };
        }

        let freedBytes = 0;
        let prunedCount = 0;
        STORAGE_PRIORITY_CLASSES.RECOVERABLE_CACHE.forEach((tempKey) => {
          const v = localStorage.getItem(tempKey);
          if (v !== null) {
            freedBytes += (v.length + tempKey.length) * 2;
            localStorage.removeItem(tempKey);
            prunedCount += 1;
          }
        });

        return {
          prunedCount,
          freedKB: Math.round((freedBytes / 1024) * 10) / 10
        };
      } catch (_) {
        return { prunedCount: 0, freedKB: 0 };
      }
    }
  }

  // ==========================================================================
  // PHẦN 5: KÉT SẮT CỨU HỘ TOÀN DỰ ÁN (.NOIRBACKUP.JSON) & KHÔI PHỤC DỮ LIỆU
  // ==========================================================================

  class EmergencyWorkspaceBackupVault {
    constructor(idbAdapter, quotaMonitor) {
      this.NS = window.NoirStudio;
      this.idb = idbAdapter;
      this.quotaMonitor = quotaMonitor;
    }

    get utils() {
      return (
        this.NS.utils || {
          showToast: () => {},
          formatTimestampVN: (t) => new Date(t || Date.now()).toLocaleString('vi-VN'),
          countVietnameseWords: (t) => (String(t || '').trim() ? String(t).trim().split(/\s+/).length : 0)
        }
      );
    }

    /**
     * Thu thập toàn bộ dữ liệu dự án từ RAM + LocalStorage + IndexedDB thành một
     * gói sao lưu hợp nhất có chữ ký kiểm chứng CRC32.
     */
    async assembleFullWorkspaceSnapshotPayload() {
      if (this.NS.chapterManager && typeof this.NS.chapterManager.syncEditorToActiveChapter === 'function') {
        this.NS.chapterManager.syncEditorToActiveChapter();
      }

      const keys = this.NS.constants?.STORAGE_KEYS || {};
      const chapters =
        this.NS.chapterManager?.chapters ||
        this.idb.getLocalJSON('noir_studio_chapters_v35', []) ||
        [];

      const storyBible = {
        templateFrame: localStorage.getItem(keys.BIBLE_TEMPLATE || 'noir_s10_bible_template_frame') || '',
        renderedContent: localStorage.getItem(keys.BIBLE_RENDERED || 'noir_s10_rendered_bible_content') || '',
        templateLocked: localStorage.getItem(keys.BIBLE_LOCKED || 'noir_s10_bible_template_locked') === 'true',
        characters: this.idb.getLocalJSON(keys.CHARACTERS || 'noir_s10_character_profiles_v1', []),
        knowledgeMatrix: this.idb.getLocalJSON(keys.KNOWLEDGE_MATRIX || 'noir_s10_knowledge_matrix_v1', []),
        cluesLedger: this.idb.getLocalJSON(keys.CLUES_LEDGER || 'noir_s10_clues_ledger_v1', []),
        antiCliche: localStorage.getItem(keys.ANTI_CLICHE || 'noir_s10_anti_cliche_blacklist_v1') || ''
      };

      const writingTools = {
        sceneMarkersByChapter: this.idb.getLocalJSON(keys.SCENE_MARKERS || 'noir_s18_scene_pov_markers_v1', {}),
        modeOutputs: this.idb.getLocalJSON(keys.MODE_OUTPUTS || 'noir_s20_quad_mode_outputs_v1', {}),
        customModePrompts: this.idb.getLocalJSON(keys.MODE_PROMPTS || 'noir_s20_custom_mode_sysprompts_v1', {}),
        versionVault: this.idb.getLocalJSON(keys.VERSION_VAULT || 'noir_v36_version_history_vault', []),
        scratchpadNotes: localStorage.getItem(keys.SCRATCHPAD || 'noir_quick_scratchpad_notes') || '',
        authorNotes: this.idb.getLocalJSON('noir_v38_author_chapter_notes', {})
      };

      const studioSettings = {
        selectedModel: localStorage.getItem(keys.SELECTED_MODEL || 'noir_selected_gemini_model') || '',
        executionMode: localStorage.getItem(keys.EXECUTION_MODE || 'noir_selected_ai_mode') || '',
        targetWords: localStorage.getItem(keys.TARGET_WORDS || 'noir_target_word_count') || '3500',
        temperature: localStorage.getItem(keys.TEMPERATURE || 'noir_ai_temperature') || '0.75',
        theme: localStorage.getItem(keys.THEME || 'noir_studio_theme_mode') || 'dark',
        fontFamily: localStorage.getItem(keys.FONT_FAMILY || 'noir_editor_font_family') || '',
        fontSize: localStorage.getItem(keys.FONT_SIZE || 'noir_editor_font_size') || '',
        lineHeight: localStorage.getItem(keys.LINE_HEIGHT || 'noir_editor_line_height') || '',
        pageWidth: localStorage.getItem(keys.PAGE_WIDTH || 'noir_editor_page_width') || '',
        bgEffect: localStorage.getItem(keys.BG_EFFECT || 'noir_ambient_bg_effect') || '',
        pomodoroState: this.idb.getLocalJSON(keys.POMODORO_STATE || 'noir_unified_pomodoro_state_v36', null),
        dailyGoalState: this.idb.getLocalJSON(keys.DAILY_GOAL || 'noir_v38_daily_word_goal_state', null),
        activeChapterId: this.NS.state?.activeChapterId || null
      };

      let totalWords = 0;
      chapters.forEach((c) => {
        totalWords += Number(c.wordCount) || this.utils.countVietnameseWords(c.content || '');
      });

      const bodyData = {
        chapters,
        storyBible,
        writingTools,
        studioSettings
      };

      const canonicalJson = JSON.stringify(bodyData);
      const crc32 = this.idb.codec.computeCrc32(canonicalJson);

      return {
        format: 'NOIR_STUDIO_FULL_BACKUP',
        schemaVersion: '38.0',
        exportedAt: Date.now(),
        exportedAtHuman: this.utils.formatTimestampVN(Date.now()),
        stats: {
          chaptersCount: chapters.length,
          totalWords,
          charactersCount: Array.isArray(storyBible.characters) ? storyBible.characters.length : 0,
          versionsCount: Array.isArray(writingTools.versionVault) ? writingTools.versionVault.length : 0
        },
        checksumCrc32: crc32,
        data: bodyData
      };
    }

    /**
     * Xuất file sao lưu `.json` chứa toàn bộ dữ liệu dự án để lưu an toàn ngoại tuyến
     */
    async exportFullBackupFile() {
      const snapshot = await this.assembleFullWorkspaceSnapshotPayload();
      const jsonStr = JSON.stringify(snapshot, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `NoirStudio_FullBackup_${dateStr}_${snapshot.stats.chaptersCount}Chuong.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 3000);

      this.utils.showToast(
        `🛡️ Đã xuất Két Sao Lưu Toàn Dự Án (${snapshot.stats.chaptersCount} chương, ${snapshot.stats.totalWords.toLocaleString('vi-VN')} từ)!`,
        'success',
        4200
      );
      return snapshot;
    }

    /**
     * Kiểm tra tính hợp lệ và toàn vẹn CRC32 của một file sao lưu trước khi nạp
     */
    validateBackupPayload(parsed) {
      if (!parsed || typeof parsed !== 'object') {
        return { valid: false, reason: 'Dữ liệu JSON rỗng hoặc sai cấu trúc.' };
      }
      const dataObj = parsed.data && typeof parsed.data === 'object' ? parsed.data : parsed;
      if (!Array.isArray(dataObj.chapters) && !dataObj.storyBible) {
        return {
          valid: false,
          reason: 'Tệp này không chứa danh sách Chương hoặc Story Bible của Studio.'
        };
      }

      let checksumMatches = true;
      if (parsed.checksumCrc32 && parsed.data) {
        const recomputed = this.idb.codec.computeCrc32(JSON.stringify(parsed.data));
        checksumMatches = recomputed === parsed.checksumCrc32;
      }

      return {
        valid: true,
        checksumMatches,
        chaptersCount: Array.isArray(dataObj.chapters) ? dataObj.chapters.length : 0,
        schemaVersion: parsed.schemaVersion || 'Legacy',
        data: dataObj
      };
    }

    /**
     * Khôi phục toàn bộ dự án từ một chuỗi JSON sao lưu (tạo điểm chụp bảo vệ trước khi ghi đè)
     */
    async restoreFromBackupJson(rawJsonText, options = { mode: 'REPLACE' }) {
      let parsed;
      try {
        parsed = JSON.parse(rawJsonText);
      } catch (err) {
        this.utils.showToast('❌ Tệp sao lưu bị lỗi cú pháp JSON, không thể giải mã.', 'error');
        return false;
      }

      const check = this.validateBackupPayload(parsed);
      if (!check.valid) {
        this.utils.showToast(`⚠️ ${check.reason}`, 'warning');
        return false;
      }

      if (!check.checksumMatches) {
        this.utils.showToast(
          '⚠️ Chú ý: Mã kiểm chứng CRC32 cho thấy tệp đã được chỉnh sửa thủ công — vẫn tiến hành nhập dữ liệu hợp lệ.',
          'warn',
          4000
        );
      }

      // Chụp ảnh bảo vệ trước khi khôi phục toàn phần
      if (this.NS.versionVault && typeof this.NS.versionVault.createSnapshot === 'function') {
        try {
          this.NS.versionVault.createSnapshot('Tự động bảo vệ trước khi Nạp File Sao Lưu', 'PRE_BACKUP_IMPORT');
        } catch (_) {
          // Bỏ qua
        }
      }

      const d = check.data;
      const keys = this.NS.constants?.STORAGE_KEYS || {};

      if (Array.isArray(d.chapters) && d.chapters.length > 0) {
        if (options.mode === 'MERGE' && this.NS.chapterManager?.chapters) {
          const existingIds = new Set(this.NS.chapterManager.chapters.map((c) => c.id));
          const extra = d.chapters.filter((c) => c && !existingIds.has(c.id));
          this.NS.chapterManager.chapters.push(
            ...extra.map((c, idx) =>
              this.NS.chapterManager.normalizeChapterRecord(c, this.NS.chapterManager.chapters.length + idx)
            )
          );
          await this.NS.chapterManager.persistChapters();
        } else {
          this.idb.setLocalJSON('noir_studio_chapters_v35', d.chapters);
          const chaptersStore = this.NS.constants?.STORES?.CHAPTERS || 'chapters';
          await this.idb.clearStore(chaptersStore);
          await this.idb.bulkSet(
            chaptersStore,
            d.chapters.map((c) => ({ key: c.id, value: c }))
          );
        }
      }

      if (d.storyBible && typeof d.storyBible === 'object') {
        const sb = d.storyBible;
        if (typeof sb.templateFrame === 'string') {
          localStorage.setItem(keys.BIBLE_TEMPLATE || 'noir_s10_bible_template_frame', sb.templateFrame);
        }
        if (typeof sb.renderedContent === 'string') {
          localStorage.setItem(keys.BIBLE_RENDERED || 'noir_s10_rendered_bible_content', sb.renderedContent);
        }
        localStorage.setItem(keys.BIBLE_LOCKED || 'noir_s10_bible_template_locked', sb.templateLocked ? 'true' : 'false');
        if (Array.isArray(sb.characters)) {
          this.idb.setLocalJSON(keys.CHARACTERS || 'noir_s10_character_profiles_v1', sb.characters);
        }
        if (Array.isArray(sb.knowledgeMatrix)) {
          this.idb.setLocalJSON(keys.KNOWLEDGE_MATRIX || 'noir_s10_knowledge_matrix_v1', sb.knowledgeMatrix);
        }
        if (Array.isArray(sb.cluesLedger)) {
          this.idb.setLocalJSON(keys.CLUES_LEDGER || 'noir_s10_clues_ledger_v1', sb.cluesLedger);
        }
        if (typeof sb.antiCliche === 'string') {
          localStorage.setItem(keys.ANTI_CLICHE || 'noir_s10_anti_cliche_blacklist_v1', sb.antiCliche);
        }
      }

      if (d.writingTools && typeof d.writingTools === 'object') {
        const wt = d.writingTools;
        if (wt.sceneMarkersByChapter) {
          this.idb.setLocalJSON(keys.SCENE_MARKERS || 'noir_s18_scene_pov_markers_v1', wt.sceneMarkersByChapter);
        }
        if (wt.modeOutputs) {
          this.idb.setLocalJSON(keys.MODE_OUTPUTS || 'noir_s20_quad_mode_outputs_v1', wt.modeOutputs);
        }
        if (wt.customModePrompts) {
          this.idb.setLocalJSON(keys.MODE_PROMPTS || 'noir_s20_custom_mode_sysprompts_v1', wt.customModePrompts);
        }
        if (Array.isArray(wt.versionVault)) {
          this.idb.setLocalJSON(keys.VERSION_VAULT || 'noir_v36_version_history_vault', wt.versionVault);
        }
        if (typeof wt.scratchpadNotes === 'string') {
          localStorage.setItem(keys.SCRATCHPAD || 'noir_quick_scratchpad_notes', wt.scratchpadNotes);
        }
      }

      if (d.studioSettings && typeof d.studioSettings === 'object') {
        const ss = d.studioSettings;
        if (ss.activeChapterId) {
          localStorage.setItem(
            keys.ACTIVE_CHAPTER_ID || 'noir_studio_active_chapter_v35',
            ss.activeChapterId
          );
        }
        if (ss.pomodoroState) {
          this.idb.setLocalJSON(keys.POMODORO_STATE || 'noir_unified_pomodoro_state_v36', ss.pomodoroState);
        }
        if (ss.dailyGoalState) {
          this.idb.setLocalJSON(keys.DAILY_GOAL || 'noir_v38_daily_word_goal_state', ss.dailyGoalState);
        }
      }

      // Yêu cầu các module nạp lại trạng thái mới từ ổ đĩa/IDB
      try {
        if (this.NS.chapterManager?.loadChaptersFromStorage) {
          await this.NS.chapterManager.loadChaptersFromStorage();
        }
        if (this.NS.storyBible?.loadFromStorage) {
          this.NS.storyBible.loadFromStorage();
        }
        if (this.NS.sceneBuilder?.loadFromStorage) {
          this.NS.sceneBuilder.loadFromStorage();
          this.NS.sceneBuilder.renderMarkersListUI?.();
        }
        if (this.NS.versionVault?.loadFromStorage) {
          this.NS.versionVault.loadFromStorage();
          this.NS.versionVault.renderVersionListUI?.();
        }
      } catch (_) {
        // Bỏ qua nếu một số module chưa khởi chạy
      }

      this.utils.showToast(
        `🎉 Đã khôi phục thành công gói sao lưu (${check.chaptersCount} chương)!`,
        'success',
        4500
      );
      return true;
    }
  }

  // ==========================================================================
  // PHẦN 6: BỘ DI TRÚ DỮ LIỆU CŨ (LEGACY MIGRATOR) & SỬA CHỮA JSON HỎNG
  // ==========================================================================

  class LegacyStorageMigratorAndRepairEngine {
    constructor(idbAdapter) {
      this.NS = window.NoirStudio;
      this.idb = idbAdapter;
      this.migrationLogKey = 'noir_v38_legacy_migration_report';
    }

    /**
     * Quét xem có dữ liệu từ các phiên bản cũ (`v30`..`v35`, bản đơn file cũ) chưa được
     * đồng bộ sang chuẩn IndexedDB đa kho hiện tại hay không.
     */
    async runAutomaticMigrationIfNeeded() {
      try {
        const prevReport = this.idb.getLocalJSON(this.migrationLogKey, null);
        if (prevReport && prevReport.completedAt) {
          return { skipped: true, report: prevReport };
        }

        const existingChapters = await this.idb.getAll('chapters');
        let migratedChaptersCount = 0;

        if (!existingChapters || existingChapters.length === 0) {
          const legacyKeys = [
            'noir_studio_chapters_v35',
            'noir_studio_chapters_v34',
            'noir_studio_chapters',
            'novelist_chapters_v1',
            'banthao_chapters_backup'
          ];
          for (let i = 0; i < legacyKeys.length; i += 1) {
            const candidate = this.idb.getLocalJSON(legacyKeys[i], null);
            if (Array.isArray(candidate) && candidate.length > 0) {
              const sanitized = candidate
                .filter((item) => item && typeof item === 'object')
                .map((item, idx) => this.repairChapterObject(item, idx));

              if (sanitized.length > 0) {
                await this.idb.bulkSet(
                  'chapters',
                  sanitized.map((c) => ({ key: c.id, value: c }))
                );
                migratedChaptersCount = sanitized.length;
                break;
              }
            }
          }
        }

        // Di trú Story Bible từ chuỗi cũ nếu store IDB đang trống
        const bibleRows = await this.idb.getAll('story_bible');
        let migratedBible = false;
        if (!bibleRows || bibleRows.length === 0) {
          const legacyBibleText =
            localStorage.getItem('noir_s10_rendered_bible_content') ||
            localStorage.getItem('noir_story_bible_content') ||
            '';
          if (legacyBibleText.trim().length > 0) {
            await this.idb.set('story_bible', 'rendered_master', {
              id: 'rendered_master',
              content: legacyBibleText,
              migratedAt: Date.now()
            });
            migratedBible = true;
          }
        }

        const report = {
          completedAt: Date.now(),
          migratedChaptersCount,
          migratedBible
        };
        this.idb.setLocalJSON(this.migrationLogKey, report);
        return { skipped: false, report };
      } catch (err) {
        return { skipped: false, error: err?.message || 'Migration warning' };
      }
    }

    repairChapterObject(raw, fallbackIndex = 0) {
      const id = String(raw.id || `chap_mig_${Date.now()}_${fallbackIndex}`);
      const title = String(
        raw.displayTitle || raw.title || raw.name || `Chương ${fallbackIndex + 1}`
      ).trim();
      const content = typeof raw.content === 'string' ? raw.content : String(raw.body || '');
      const status = raw.status === 'APPROVED' || raw.approved === true ? 'APPROVED' : 'DRAFT';
      return {
        id,
        title,
        displayTitle: title,
        order: typeof raw.order === 'number' ? raw.order : fallbackIndex,
        status,
        content,
        beats: typeof raw.beats === 'string' ? raw.beats : '',
        notes: typeof raw.notes === 'string' ? raw.notes : '',
        sceneMarkers: Array.isArray(raw.sceneMarkers) ? raw.sceneMarkers : [],
        wordCount:
          typeof raw.wordCount === 'number'
            ? raw.wordCount
            : content.trim()
              ? content.trim().split(/\s+/).length
              : 0,
        createdAt: Number(raw.createdAt) || Date.now(),
        updatedAt: Number(raw.updatedAt) || Date.now()
      };
    }

    /**
     * Phục hồi an toàn một chuỗi JSON bị cắt cụt dấu đóng ngoặc khi mất điện đột ngột
     */
    attemptRecoverTruncatedJsonArray(corruptText) {
      const raw = String(corruptText || '').trim();
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch (_) {
        // Thử cắt tới dấu `}` cuối cùng hợp lệ nếu là mảng object `[ {...}, {...`
        if (raw.startsWith('[')) {
          const lastObjEnd = raw.lastIndexOf('}');
          if (lastObjEnd > 2) {
            const candidate = raw.slice(0, lastObjEnd + 1) + ']';
            try {
              const recovered = JSON.parse(candidate);
              if (Array.isArray(recovered)) return recovered;
            } catch (__) {
              // Bỏ qua nếu hỏng nặng hơn
            }
          }
        }
        return null;
      }
    }
  }

  // ==========================================================================
  // PHẦN 7: TRẠM CANH SỰ CỐ ĐỘT NGỘT (CRASH RECOVERY BEACON) & ĐỒNG BỘ TAB
  // ==========================================================================

  class SessionCrashSentinelAndMirror {
    constructor(idbAdapter) {
      this.NS = window.NoirStudio;
      this.idb = idbAdapter;
      this.beaconKey = 'noir_v38_crash_beacon_active_draft';
      this.boundUnload = false;
    }

    /**
     * Ghi nhận bản sao khẩn cấp của chương đang gõ dở (chi phí ~0.2ms)
     * nhằm phòng ngừa đóng nhầm tab, hết pin điện thoại hoặc treo trình duyệt.
     */
    recordEmergencyDraftBeacon() {
      try {
        if (typeof document === 'undefined') return false;
        const titleEl = document.getElementById('input-chapter-title');
        const contentEl = document.getElementById('textarea-chapter-content');
        const beatsEl = document.getElementById('textarea-chapter-beats');
        if (!contentEl) return false;

        const payload = {
          chapterId: this.NS.state?.activeChapterId || null,
          title: titleEl ? titleEl.value : '',
          content: contentEl.value || '',
          beats: beatsEl ? beatsEl.value : '',
          capturedAt: Date.now()
        };

        const raw = JSON.stringify(payload);
        try {
          sessionStorage.setItem(this.beaconKey, raw);
        } catch (_) {
          // Bỏ qua
        }
        localStorage.setItem(this.beaconKey, raw);
        return true;
      } catch (_) {
        return false;
      }
    }

    /**
     * Kiểm tra lúc khởi động xem bản beacon khẩn cấp có mới hơn & dài hơn dữ liệu đã lưu không
     */
    checkForUnsavedCrashDraftRecovery() {
      try {
        const raw = localStorage.getItem(this.beaconKey);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || !parsed.chapterId || !parsed.content) return null;

        const chap = this.NS.chapterManager?.chapters?.find((c) => c.id === parsed.chapterId);
        if (!chap) return null;

        const savedUpdatedAt = Number(chap.updatedAt) || 0;
        const beaconCapturedAt = Number(parsed.capturedAt) || 0;
        const deltaChars = parsed.content.length - (chap.content || '').length;

        if (beaconCapturedAt > savedUpdatedAt + 1500 && Math.abs(deltaChars) >= 12) {
          return {
            chapterId: chap.id,
            chapterTitle: chap.displayTitle || chap.title,
            beacon: parsed,
            deltaChars
          };
        }
      } catch (_) {
        // Bỏ qua
      }
      return null;
    }

    bindPageUnloadGuard() {
      if (this.boundUnload || typeof window === 'undefined') return;
      this.boundUnload = true;

      const flushAll = () => {
        this.recordEmergencyDraftBeacon();
        if (this.NS.chapterManager && typeof this.NS.chapterManager.syncEditorToActiveChapter === 'function') {
          try {
            this.NS.chapterManager.syncEditorToActiveChapter();
            localStorage.setItem(
              this.NS.chapterManager.storageKey || 'noir_studio_chapters_v35',
              JSON.stringify(this.NS.chapterManager.chapters)
            );
          } catch (_) {
            // Bỏ qua khi đóng tab
          }
        }
      };

      window.addEventListener('pagehide', flushAll);
      window.addEventListener('beforeunload', flushAll);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          flushAll();
        }
      });
    }
  }

  // ==========================================================================
  // PHẦN 8: GIAO DIỆN QUẢN TRỊ KÉT SAO LƯU & ĐỒNG HỒ BỘ NHỚ TRONG TAB 6
  // ==========================================================================

  class Tab6VaultWidgetController {
    constructor(idbAdapter, quotaMonitor, emergencyVault, migrator, crashSentinel) {
      this.NS = window.NoirStudio;
      this.idb = idbAdapter;
      this.quotaMonitor = quotaMonitor;
      this.emergencyVault = emergencyVault;
      this.migrator = migrator;
      this.crashSentinel = crashSentinel;
      this.widgetInjected = false;
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

    /**
     * Chèn thẻ công cụ "Két Sắt Sao Lưu Toàn Dự Án & Sức Khỏe IndexedDB"
     * vào bên dưới màn hình Tab 6 (`#s14-screen-6-system`) một cách gọn gàng.
     */
    injectTab6StorageVaultCardIfNeeded() {
      if (typeof document === 'undefined') return;
      const sysScreen = document.getElementById('s14-screen-6-system');
      if (!sysScreen) return;
      if (document.getElementById('mod04-tab6-storage-vault-card')) return;

      const vaultCard = document.createElement('section');
      vaultCard.id = 'mod04-tab6-storage-vault-card';
      vaultCard.className =
        'mt-4 rounded-2xl border border-zinc-800/90 bg-zinc-900/75 p-4 sm:p-5 space-y-4';

      vaultCard.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div>
            <h3 class="text-sm sm:text-base font-extrabold text-emerald-300 flex items-center gap-2">
              <span>🛡️ Két Sắt Dữ Liệu Đa Tầng (IndexedDB & Sao Lưu Khẩn Cấp)</span>
            </h3>
            <p class="text-xs text-zinc-400 mt-0.5">
              Xuất file dự phòng toàn bộ Chương, Story Bible, Nhân vật và Lịch sử Phiên bản ra tệp .JSON hoặc khôi phục lại bất cứ lúc nào.
            </p>
          </div>
          <span id="mod04-persist-badge" class="px-2.5 py-1 rounded-full text-[11px] font-bold border border-zinc-700 bg-zinc-800 text-zinc-300">
            ⏳ Đang kiểm tra quyền lưu bền vững…
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div class="p-3 rounded-xl border border-zinc-800 bg-zinc-950/70 space-y-1">
            <div class="text-zinc-400 text-[11px]">Dung lượng Bộ nhớ Nhanh (LocalStorage)</div>
            <div id="mod04-ls-usage-label" class="text-sm font-bold text-zinc-100">Đang đo…</div>
            <div class="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden mt-1">
              <div id="mod04-ls-usage-bar" class="h-full bg-emerald-500 transition-all duration-300" style="width: 10%"></div>
            </div>
          </div>

          <div class="p-3 rounded-xl border border-zinc-800 bg-zinc-950/70 space-y-1">
            <div class="text-zinc-400 text-[11px]">Kho Dữ Liệu Lớn (IndexedDB Quota)</div>
            <div id="mod04-idb-usage-label" class="text-sm font-bold text-indigo-300">Đang kiểm tra…</div>
            <div class="text-[11px] text-zinc-500" id="mod04-idb-stats-label">Đọc: 0 • Ghi: 0</div>
          </div>

          <div class="p-3 rounded-xl border border-zinc-800 bg-zinc-950/70 space-y-1">
            <div class="text-zinc-400 text-[11px]">Bảo Vệ Chống Mất Dữ Liệu Đột Ngột</div>
            <div id="mod04-crash-guard-label" class="text-sm font-bold text-amber-300">🟢 Trạm canh đang hoạt động</div>
            <div class="text-[11px] text-zinc-500">Tự động lưu 2 giây/lần + Đèn báo khi đóng tab</div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2.5 pt-1">
          <button type="button" id="btn-mod04-export-full-backup" class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow transition">
            📥 Xuất File Sao Lưu Toàn Bộ (.JSON)
          </button>
          <button type="button" id="btn-mod04-import-backup-trigger" class="px-3.5 py-2 rounded-xl bg-indigo-600/25 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-200 text-xs font-bold transition">
            📤 Nhập / Khôi Phục Từ File Sao Lưu
          </button>
          <button type="button" id="btn-mod04-refresh-quota" class="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-semibold transition">
            🔄 Đo Lại Bộ Nhớ
          </button>
          <button type="button" id="btn-mod04-request-persist" class="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 text-xs font-semibold transition">
            🔒 Xin Quyền Khóa Chống Xóa
          </button>
          <input type="file" id="input-mod04-backup-file" accept=".json,application/json" class="hidden" />
        </div>

        <div id="mod04-diagnostic-breakdown" class="hidden rounded-xl border border-zinc-800 bg-zinc-950/90 p-3 text-[11px] text-zinc-300 space-y-1.5"></div>
      `;

      const anchor = document.getElementById('tab6-version-history-vault');
      if (anchor && anchor.parentElement === sysScreen) {
        anchor.insertAdjacentElement('afterend', vaultCard);
      } else {
        sysScreen.appendChild(vaultCard);
      }

      this.bindCardButtons();
      this.refreshStorageMetricsUI();
      this.widgetInjected = true;
    }

    bindCardButtons() {
      const exportBtn = document.getElementById('btn-mod04-export-full-backup');
      const importBtn = document.getElementById('btn-mod04-import-backup-trigger');
      const fileInput = document.getElementById('input-mod04-backup-file');
      const refreshBtn = document.getElementById('btn-mod04-refresh-quota');
      const persistBtn = document.getElementById('btn-mod04-request-persist');

      if (exportBtn && !exportBtn.dataset.bound) {
        exportBtn.dataset.bound = '1';
        exportBtn.addEventListener('click', () => this.emergencyVault.exportFullBackupFile());
      }

      if (importBtn && fileInput && !importBtn.dataset.bound) {
        importBtn.dataset.bound = '1';
        importBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', async (evt) => {
          const file = evt.target.files?.[0];
          evt.target.value = '';
          if (!file) return;
          try {
            const txt = await file.text();
            await this.emergencyVault.restoreFromBackupJson(txt, { mode: 'REPLACE' });
            this.refreshStorageMetricsUI();
          } catch (err) {
            this.utils.showToast(`❌ Không đọc được tệp sao lưu: ${err?.message || 'Lỗi'}`, 'error');
          }
        });
      }

      if (refreshBtn && !refreshBtn.dataset.bound) {
        refreshBtn.dataset.bound = '1';
        refreshBtn.addEventListener('click', async () => {
          await this.refreshStorageMetricsUI(true);
          this.utils.showToast('📊 Đã cập nhật số liệu bộ nhớ thực tế!', 'info', 2200);
        });
      }

      if (persistBtn && !persistBtn.dataset.bound) {
        persistBtn.dataset.bound = '1';
        persistBtn.addEventListener('click', async () => {
          const ok = await this.quotaMonitor.requestPersistentStorageIfSupported();
          this.refreshStorageMetricsUI();
          if (ok) {
            this.utils.showToast('🔒 Trình duyệt đã cấp quyền Lưu Trữ Bền Vững (Persistent Storage)!', 'success');
          } else {
            this.utils.showToast(
              'ℹ️ Thiết bị hiện chưa bật Persistent Storage tự động (có thể do chạy trực tiếp file://) — dữ liệu vẫn được bảo vệ bằng IndexedDB & JSON Backup.',
              'info',
              4200
            );
          }
        });
      }
    }

    async refreshStorageMetricsUI(showBreakdown = false) {
      const report = await this.quotaMonitor.inspectStorageFootprint();
      const lsLabel = document.getElementById('mod04-ls-usage-label');
      const lsBar = document.getElementById('mod04-ls-usage-bar');
      const idbLabel = document.getElementById('mod04-idb-usage-label');
      const idbStatsLabel = document.getElementById('mod04-idb-stats-label');
      const persistBadge = document.getElementById('mod04-persist-badge');
      const breakdownEl = document.getElementById('mod04-diagnostic-breakdown');

      if (lsLabel) {
        lsLabel.textContent = `${report.localStorageKB} KB / 5.120 KB (${report.localUsagePercent}%)`;
      }
      if (lsBar) {
        lsBar.style.width = `${Math.max(4, report.localUsagePercent)}%`;
        lsBar.className = `h-full transition-all duration-300 ${
          report.localUsagePercent > 82
            ? 'bg-rose-500'
            : report.localUsagePercent > 60
              ? 'bg-amber-500'
              : 'bg-emerald-500'
        }`;
      }
      if (idbLabel) {
        idbLabel.textContent =
          report.idbQuotaMB !== null
            ? `${report.idbUsageMB ?? 0} MB / ${report.idbQuotaMB} MB khả dụng`
            : 'IndexedDB Sẵn Sàng (Không giới hạn khắt khe)';
      }
      if (idbStatsLabel) {
        idbStatsLabel.textContent = `Đã đọc: ${this.idb.stats.reads} lượt • Đã ghi: ${this.idb.stats.writes} lượt`;
      }
      if (persistBadge) {
        if (this.quotaMonitor.persistedGranted === true) {
          persistBadge.textContent = '🔒 Đã Khóa Bảo Vệ Persistent';
          persistBadge.className =
            'px-2.5 py-1 rounded-full text-[11px] font-bold border border-emerald-500/40 bg-emerald-500/15 text-emerald-300';
        } else {
          persistBadge.textContent = '💾 Đa tầng IDB + LocalStorage';
          persistBadge.className =
            'px-2.5 py-1 rounded-full text-[11px] font-bold border border-zinc-700 bg-zinc-800 text-zinc-300';
        }
      }

      if (breakdownEl && showBreakdown && Array.isArray(report.topKeys)) {
        const esc = (s) => this.utils.escapeHtml(s);
        breakdownEl.classList.remove('hidden');
        breakdownEl.innerHTML =
          '<div class="font-bold text-zinc-200 mb-1">Chi tiết các khóa dữ liệu chiếm dung lượng nhiều nhất:</div>' +
          report.topKeys
            .slice(0, 8)
            .map(
              (item) =>
                `<div class="flex items-center justify-between gap-2 py-0.5 border-b border-zinc-900">
                  <span class="truncate font-mono text-zinc-400">${item.isCritical ? '🔐 ' : ''}${esc(item.key)}</span>
                  <span class="shrink-0 font-bold text-zinc-200">${item.kb} KB</span>
                </div>`
            )
            .join('');
      }
    }
  }

  // ==========================================================================
  // PHẦN 9: ĐỒNG BỘ ĐA TAB (CROSS-TAB SYNC), CHẨN ĐOÁN KHO & ĐĂNG KÝ MODULE 04
  // ==========================================================================

  class CrossTabStorageSynchronizer {
    constructor(idbAdapter, tab6Controller) {
      this.NS = window.NoirStudio;
      this.idb = idbAdapter;
      this.tab6Controller = tab6Controller;
      this._bound = false;
      this.conflictCount = 0;
      this.lastRemoteUpdateAt = 0;
    }

    initCrossTabListener() {
      if (this._bound || typeof window === 'undefined') return;
      this._bound = true;

      window.addEventListener('storage', (evt) => {
        if (!evt || !evt.key) return;
        this.lastRemoteUpdateAt = Date.now();

        const watchedKeys = [
          'noir_studio_chapters_v35',
          'noir_s10_rendered_bible_content',
          'noir_v36_version_history_vault',
          'noir_unified_pomodoro_state_v36'
        ];

        if (!watchedKeys.includes(evt.key)) return;
        this.conflictCount += 1;

        if (evt.key === 'noir_unified_pomodoro_state_v36') {
          if (this.NS.pomodoro && typeof this.NS.pomodoro.loadStateFromStorage === 'function') {
            this.NS.pomodoro.loadStateFromStorage();
          }
          return;
        }

        if (evt.key === 'noir_v36_version_history_vault') {
          if (this.NS.versionVault && typeof this.NS.versionVault.loadFromStorage === 'function') {
            this.NS.versionVault.loadFromStorage();
            this.NS.versionVault.renderVersionListUI?.();
          }
        }
      });
    }
  }

  /**
   * Bộ trợ giúp truy vấn, lọc, xuất từng kho dữ liệu trong IndexedDB
   * phục vụ kiểm tra chẩn đoán kỹ thuật và khôi phục bản thảo bị ẩn.
   */
  class IDBStoreDiagnosticInspector {
    constructor(idbAdapter) {
      this.idb = idbAdapter;
    }

    async inspectAllStoreCounts() {
      const counts = {};
      for (let i = 0; i < CORE_STORES_LIST.length; i += 1) {
        const name = CORE_STORES_LIST[i];
        try {
          const rows = await this.idb.getAll(name);
          counts[name] = Array.isArray(rows) ? rows.length : 0;
        } catch (_) {
          counts[name] = 0;
        }
      }
      return {
        dbName: this.idb.getDbName(),
        dbVersion: this.idb.getDbVersion(),
        isOpen: Boolean(this.idb.db),
        lastError: this.idb.lastError,
        storeRecordCounts: counts,
        ioStats: { ...this.idb.stats }
      };
    }

    async verifyRoundtripIntegrity() {
      const testStore = 'state_cache';
      const testKey = '__noir_idb_selftest_probe__';
      const payload = {
        probe: true,
        text: 'Kiểm chứng tiếng Việt: Ă Â Đ Ê Ô Ơ Ư ắ ằ ẳ ẵ ặ',
        ts: Date.now()
      };
      const wrote = await this.idb.set(testStore, testKey, payload);
      const readBack = await this.idb.get(testStore, testKey, null);
      await this.idb.delete(testStore, testKey);

      const passed =
        Boolean(readBack) &&
        readBack.text === payload.text &&
        readBack.ts === payload.ts;

      return {
        passed,
        usedIndexedDB: Boolean(wrote && this.idb.db),
        usedMemoryFallback: !this.idb.db
      };
    }

    /**
     * Trích xuất toàn bộ dữ liệu từ bảng `chapters` ra chuỗi Markdown gộp
     * trong tình huống giao diện soạn thảo gặp sự cố.
     */
    async emergencyDumpChaptersAsMarkdown() {
      const chapters = await this.idb.getAll('chapters');
      if (!Array.isArray(chapters) || chapters.length === 0) {
        return '# Chưa tìm thấy chương nào trong kho IndexedDB.';
      }
      const sorted = [...chapters].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      return sorted
        .map((c, i) => {
          const title = c.displayTitle || c.title || `Chương ${i + 1}`;
          return `# ${title}\n\n${c.content || ''}`;
        })
        .join('\n\n---\n\n');
    }

    /**
     * Dọn dẹp các khóa rác cũ quá hạn > 30 ngày trong `state_cache` nếu kích thước phình to
     */
    async cleanupStaleStateCacheRecords(maxAgeDays = 30) {
      const rows = await this.idb.getAllWithKeys('state_cache');
      const cutoff = Date.now() - Math.max(1, maxAgeDays) * 24 * 60 * 60 * 1000;
      let removed = 0;

      for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        const keyStr = String(row.key || '');
        if (!keyStr.startsWith('temp_') && !keyStr.startsWith('cache_')) continue;
        const ts = Number(row.value?.savedAt || row.value?.updatedAt || 0);
        if (ts > 0 && ts < cutoff) {
          await this.idb.delete('state_cache', keyStr);
          removed += 1;
        }
      }
      return { scanned: rows.length, removed };
    }
  }

  // ==========================================================================
  // PHẦN 9B: ĐỐI CHIẾU TOÀN VẸN IDB ⇄ LOCALSTORAGE & XUẤT KHO JSONL ARCHIVE
  // ==========================================================================

  class DualStorageMirrorConsistencyAuditor {
    constructor(idbAdapter, codec) {
      this.NS = window.NoirStudio;
      this.idb = idbAdapter;
      this.codec = codec;
      this.lastAudit = null;
    }

    /**
     * Đối chiếu giữa kho IndexedDB (`chapters`) và bản phản chiếu LocalStorage
     * nhằm phát hiện kịp thời nếu trình duyệt vừa dọn mất một trong hai tầng.
     */
    async auditChaptersMirrorConsistency() {
      const idbList = await this.idb.getAll('chapters');
      const lsList = this.idb.getLocalJSON('noir_studio_chapters_v35', []);

      const idbCount = Array.isArray(idbList) ? idbList.length : 0;
      const lsCount = Array.isArray(lsList) ? lsList.length : 0;

      const calcTotalWords = (arr) =>
        (Array.isArray(arr) ? arr : []).reduce(
          (sum, c) =>
            sum +
            (Number(c?.wordCount) ||
              (String(c?.content || '').trim()
                ? String(c.content).trim().split(/\s+/).length
                : 0)),
          0
        );

      const idbWords = calcTotalWords(idbList);
      const lsWords = calcTotalWords(lsList);

      let recommendation = 'SYNCED';
      let repaired = false;

      if (idbCount > 0 && lsCount === 0) {
        this.idb.setLocalJSON('noir_studio_chapters_v35', idbList);
        recommendation = 'RESTORED_LS_FROM_IDB';
        repaired = true;
      } else if (lsCount > 0 && idbCount === 0) {
        await this.idb.bulkSet(
          'chapters',
          lsList.filter((c) => c && c.id).map((c) => ({ key: c.id, value: c }))
        );
        recommendation = 'RESTORED_IDB_FROM_LS';
        repaired = true;
      } else if (idbWords > lsWords + 30) {
        recommendation = 'IDB_AHEAD_OF_LS';
      } else if (lsWords > idbWords + 30) {
        recommendation = 'LS_AHEAD_OF_IDB';
      }

      this.lastAudit = {
        auditedAt: Date.now(),
        idbCount,
        lsCount,
        idbWords,
        lsWords,
        recommendation,
        repaired
      };
      return this.lastAudit;
    }

    /**
     * Tạo bản sao lưu dạng JSON Lines (.jsonl) tối ưu cho dự án hàng trăm chương
     * (mỗi dòng là một bản ghi độc lập, không bị hỏng toàn file nếu một dòng bị lỗi).
     */
    async exportJsonLinesStreamArchive() {
      const chapters = this.NS.chapterManager?.chapters || (await this.idb.getAll('chapters')) || [];
      const lines = [];

      lines.push(
        JSON.stringify({
          recordType: 'META_HEADER',
          schema: 'NOIR_JSONL_ARCHIVE_V1',
          exportedAt: Date.now(),
          chaptersCount: chapters.length
        })
      );

      chapters.forEach((chap, idx) => {
        lines.push(
          JSON.stringify({
            recordType: 'CHAPTER',
            order: idx,
            id: chap.id,
            title: chap.displayTitle || chap.title,
            status: chap.status,
            wordCount: chap.wordCount,
            beats: chap.beats || '',
            content: chap.content || '',
            updatedAt: chap.updatedAt || Date.now(),
            hash: this.codec.computeFnv1aHash(chap.content || '')
          })
        );
      });

      const bibleContent = localStorage.getItem('noir_s10_rendered_bible_content') || '';
      if (bibleContent) {
        lines.push(
          JSON.stringify({
            recordType: 'STORY_BIBLE',
            content: bibleContent,
            hash: this.codec.computeFnv1aHash(bibleContent)
          })
        );
      }

      const characters = this.idb.getLocalJSON('noir_s10_character_profiles_v1', []);
      if (Array.isArray(characters)) {
        characters.forEach((ch) => {
          lines.push(
            JSON.stringify({
              recordType: 'CHARACTER_PROFILE',
              profile: ch
            })
          );
        });
      }

      return lines.join('\n');
    }

    /**
     * Tải xuống tệp `.jsonl` trực tiếp về máy tính / điện thoại
     */
    async downloadJsonLinesArchiveFile() {
      const text = await this.exportJsonLinesStreamArchive();
      const blob = new Blob([text], { type: 'application/x-ndjson;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NoirStudio_StreamArchive_${new Date().toISOString().slice(0, 10)}.jsonl`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2500);
      this.NS.utils?.showToast('📦 Đã xuất Kho Lưu Trữ Dòng (.JSONL An Toàn Từng Chương)!', 'success');
      return true;
    }

    /**
     * Phục hồi dữ liệu từ một chuỗi `.jsonl` bỏ qua các dòng lỗi lẻ (Fault-Tolerant Reader)
     */
    async parseAndRestoreJsonLinesArchive(rawJsonl) {
      const lines = String(rawJsonl || '')
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

      const chapters = [];
      const characters = [];
      let bibleContent = '';
      let corruptedLines = 0;

      lines.forEach((line) => {
        try {
          const obj = JSON.parse(line);
          if (obj.recordType === 'CHAPTER') {
            chapters.push({
              id: obj.id || `chap_jsonl_${Date.now()}_${chapters.length}`,
              title: obj.title || `Chương ${chapters.length + 1}`,
              displayTitle: obj.title || `Chương ${chapters.length + 1}`,
              order: typeof obj.order === 'number' ? obj.order : chapters.length,
              status: obj.status === 'APPROVED' ? 'APPROVED' : 'DRAFT',
              content: obj.content || '',
              beats: obj.beats || '',
              wordCount: Number(obj.wordCount) || 0,
              updatedAt: Number(obj.updatedAt) || Date.now()
            });
          } else if (obj.recordType === 'STORY_BIBLE' && obj.content) {
            bibleContent = obj.content;
          } else if (obj.recordType === 'CHARACTER_PROFILE' && obj.profile) {
            characters.push(obj.profile);
          }
        } catch (_) {
          corruptedLines += 1;
        }
      });

      if (chapters.length > 0) {
        this.idb.setLocalJSON('noir_studio_chapters_v35', chapters);
        await this.idb.clearStore('chapters');
        await this.idb.bulkSet(
          'chapters',
          chapters.map((c) => ({ key: c.id, value: c }))
        );
      }
      if (bibleContent) {
        localStorage.setItem('noir_s10_rendered_bible_content', bibleContent);
      }
      if (characters.length > 0) {
        this.idb.setLocalJSON('noir_s10_character_profiles_v1', characters);
      }

      return {
        importedChapters: chapters.length,
        importedCharacters: characters.length,
        hasBible: Boolean(bibleContent),
        corruptedLines
      };
    }

    /**
     * Tính bảng tóm tắt trạng thái sạch sẽ của từng tầng lưu trữ để hiển thị báo cáo chẩn đoán
     */
    buildHumanizedHealthSentence(auditObj) {
      const a = auditObj || this.lastAudit;
      if (!a) return 'Chưa chạy kiểm chứng đồng bộ giữa IndexedDB và LocalStorage.';
      if (a.recommendation === 'SYNCED') {
        return `✅ Cả hai tầng IndexedDB và LocalStorage đang khớp hoàn toàn (${a.idbCount} chương, ${a.idbWords.toLocaleString('vi-VN')} từ).`;
      }
      if (a.repaired) {
        return `🩹 Đã tự động vá đồng bộ giữa 2 kho lưu trữ (${a.recommendation}) — toàn bộ ${Math.max(a.idbCount, a.lsCount)} chương đều an toàn!`;
      }
      return `ℹ️ Chênh lệch nhẹ giữa RAM/LocalStorage (${a.lsWords} từ) và IDB (${a.idbWords} từ) — sẽ tự hợp nhất ở chu kỳ lưu kế tiếp.`;
    }
  }

  // ==========================================================================
  // PHẦN 9C: BỘ KIỂM TRA & LÀM SẠCH KHÓA LOCALSTORAGE AN TOÀN (JSON GUARD)
  // ==========================================================================

  class LocalStorageKeyIntegrityGuardian {
    constructor(idbAdapter, migrator) {
      this.idb = idbAdapter;
      this.migrator = migrator;
    }

    /**
     * Quét toàn bộ các khóa JSON trọng yếu trong LocalStorage xem có khóa nào bị cắt cụt
     * do đóng máy đột ngột khi đang lưu không, nếu có sẽ thử tự sửa ngay.
     */
    scanAndRepairCorruptedLocalJsonKeys() {
      const targetJsonKeys = [
        'noir_studio_chapters_v35',
        'noir_s10_character_profiles_v1',
        'noir_s10_knowledge_matrix_v1',
        'noir_s10_clues_ledger_v1',
        'noir_v36_version_history_vault',
        'noir_s18_scene_pov_markers_v1',
        'noir_s20_quad_mode_outputs_v1',
        'noir_s20_custom_mode_sysprompts_v1'
      ];

      const repairedKeys = [];
      const brokenKeys = [];

      targetJsonKeys.forEach((key) => {
        try {
          const raw = localStorage.getItem(key);
          if (!raw || !raw.trim()) return;
          const decompressed = this.idb.codec.decompressJsonSafely(raw);
          try {
            JSON.parse(decompressed);
          } catch (_) {
            const recovered = this.migrator.attemptRecoverTruncatedJsonArray(decompressed);
            if (Array.isArray(recovered)) {
              localStorage.setItem(key, JSON.stringify(recovered));
              repairedKeys.push(key);
            } else {
              brokenKeys.push(key);
            }
          }
        } catch (_) {
          // Bỏ qua nếu trình duyệt chặn quyền đọc storage
        }
      });

      return {
        checkedCount: targetJsonKeys.length,
        repairedKeys,
        brokenKeys
      };
    }

    /**
     * Sao chép nhanh toàn bộ bộ khóa JSON sang kho dự phòng `state_cache` của IndexedDB
     * làm lớp khiên thứ 3 đề phòng người dùng lỡ bấm "Xóa cookie/cache nhẹ".
     */
    async mirrorAllLocalConfigKeysToIdb() {
      const pairs = [];
      try {
        for (let i = 0; i < localStorage.length; i += 1) {
          const k = localStorage.key(i);
          if (!k || !k.startsWith('noir_')) continue;
          const val = localStorage.getItem(k);
          if (val && val.length < 450000) {
            pairs.push({ key: `ls_mirror::${k}`, value: { key: k, raw: val, mirroredAt: Date.now() } });
          }
        }
        if (pairs.length > 0) {
          await this.idb.bulkSet('state_cache', pairs);
        }
      } catch (_) {
        // Bỏ qua
      }
      return pairs.length;
    }

    async restoreMissingLocalKeysFromIdbMirror() {
      let restoredCount = 0;
      try {
        const rows = await this.idb.getAllWithKeys('state_cache');
        rows.forEach((row) => {
          const kStr = String(row.key || '');
          if (!kStr.startsWith('ls_mirror::')) return;
          const origKey = row.value?.key || kStr.replace('ls_mirror::', '');
          const origVal = row.value?.raw;
          if (origKey && typeof origVal === 'string' && !localStorage.getItem(origKey)) {
            localStorage.setItem(origKey, origVal);
            restoredCount += 1;
          }
        });
      } catch (_) {
        // Bỏ qua
      }
      return restoredCount;
    }
  }

  // Khởi tạo toàn bộ các thành phần của Module 04
  const idbEngine = new IndexedDBStorageAdapter();
  const quotaMonitor = new StorageQuotaAndHealthMonitor(idbEngine);
  const emergencyVault = new EmergencyWorkspaceBackupVault(idbEngine, quotaMonitor);
  const legacyMigrator = new LegacyStorageMigratorAndRepairEngine(idbEngine);
  const crashSentinel = new SessionCrashSentinelAndMirror(idbEngine);
  const tab6Controller = new Tab6VaultWidgetController(
    idbEngine,
    quotaMonitor,
    emergencyVault,
    legacyMigrator,
    crashSentinel
  );
  const crossTabSync = new CrossTabStorageSynchronizer(idbEngine, tab6Controller);
  const storeInspector = new IDBStoreDiagnosticInspector(idbEngine);
  const mirrorAuditor = new DualStorageMirrorConsistencyAuditor(idbEngine, idbEngine.codec);
  const keyGuardian = new LocalStorageKeyIntegrityGuardian(idbEngine, legacyMigrator);

  idbEngine.quotaMonitor = quotaMonitor;
  idbEngine.emergencyVault = emergencyVault;
  idbEngine.migrator = legacyMigrator;
  idbEngine.crashSentinel = crashSentinel;
  idbEngine.tab6Controller = tab6Controller;
  idbEngine.crossTabSync = crossTabSync;
  idbEngine.inspector = storeInspector;
  idbEngine.mirrorAuditor = mirrorAuditor;
  idbEngine.keyGuardian = keyGuardian;

  idbEngine.init = async function initModule04StorageAndVault() {
    if (this._initialized) return this;
    this._initialized = true;
    await this.open();
    keyGuardian.scanAndRepairCorruptedLocalJsonKeys();
    await keyGuardian.restoreMissingLocalKeysFromIdbMirror();
    await legacyMigrator.runAutomaticMigrationIfNeeded();
    await mirrorAuditor.auditChaptersMirrorConsistency();
    quotaMonitor.pruneDisposableCacheIfNeeded();
    crashSentinel.bindPageUnloadGuard();
    crossTabSync.initCrossTabListener();
    tab6Controller.injectTab6StorageVaultCardIfNeeded();
    return this;
  };

  NS.idb = idbEngine;
  NS.idbEngine = idbEngine;
  NS.emergencyVault = emergencyVault;
  NS.storageMonitor = quotaMonitor;
  NS.crashSentinel = crashSentinel;
  NS.IndexedDBStorageAdapter = IndexedDBStorageAdapter;
  NS.EmergencyWorkspaceBackupVault = EmergencyWorkspaceBackupVault;
  NS.StorageQuotaAndHealthMonitor = StorageQuotaAndHealthMonitor;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        tab6Controller.injectTab6StorageVaultCardIfNeeded();
      });
    } else {
      tab6Controller.injectTab6StorageVaultCardIfNeeded();
    }
  }

  if (typeof NS.registerModule === 'function') {
    NS.registerModule('mod04', idbEngine);
  }
})(typeof window !== 'undefined' ? window : globalThis);
