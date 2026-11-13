/**
 * ============================================================================
 * MODULE 15: KÉT SẮT GEMINI API KEY & BỘ ĐỊNH TUYẾN ZERO-CONGESTION CLIENT
 * Tệp: mod15_api_key_vault_and_zero_congestion_client.js
 * ============================================================================
 * Nhiệm vụ chuyên biệt:
 *   1. Quản lý Két Sắt Gemini API Key (`#modal-api-key-vault`) lưu cục bộ an toàn
 *      trên trình duyệt người dùng + hỗ trợ Kho Key Dự Phòng xoay vòng khi hết quota.
 *   2. Đồng bộ 100% 3 trình chọn mô hình trên toàn giao diện:
 *      - `#select-gemini-model` (Trung tâm Điều khiển AI)
 *      - `#confirm-modal-model-select` (Cửa sổ Xác nhận Prompt Tổng hợp Bước 2/2)
 *      - `#mode5-model-selector` (Studio Biểu đồ Cốt truyện & Thời gian Chế độ 5)
 *      tuyệt đối KHÔNG chứa nút mở Google Studio hay bảng thông số dư thừa.
 *   3. Kích hoạt cảnh báo `#confirm-model-lite-warning` theo thời gian thực bất cứ
 *      khi nào người dùng chọn mô hình dòng Flash-Lite, khuyến cáo nâng lên Flash/Pro/Argon.
 *   4. Động cơ gọi API Gemini `generateTextWithFallback(...)` chống nghẽn cổ chai:
 *      tự động trượt sang endpoint dự phòng khi gặp 429/503/404, ghi nhận telemetry
 *      sang `mod02`, hỗ trợ AbortController khi người dùng bấm Hủy ở Màn hình chờ.
 * ============================================================================
 */
(function (global) {
  'use strict';

  const NS = (global.NoirStudio = global.NoirStudio || {});

  const DEFAULT_MODEL_FALLBACK_ID = 'gemini-3.8-flash';
  const API_KEY_BACKUP_VAULT_KEY = 'noir_gemini_backup_keys_vault_v1';
  const API_CALL_HISTORY_LOG_KEY = 'noir_gemini_api_call_ledger_v1';
  const GEMINI_FLASHLITE_VERIFIED_STORAGE_KEY = 'noir_gemini_flashlite_verified_v1';
  const API_KEY_COOKIE_NAME = 'noir_gemini_api_key_ck';
  const VERIFIED_COOKIE_NAME = 'noir_gemini_verified_ck';
  const IDB_API_KEY_BACKUP_KEY = '__noir_persist_api_key_v1';
  const IDB_VERIFIED_BACKUP_KEY = '__noir_persist_flashlite_verified_v1';
  const _runtimeTransportByDigest = new Map();

  function writePersistCookieIfHttp(name, value) {
    try {
      if (typeof document === 'undefined' || typeof location === 'undefined') return false;
      if (!String(location.protocol || '').startsWith('http')) return false;
      if (!value) {
        document.cookie = `${name}=; max-age=0; path=/; SameSite=Lax`;
        return true;
      }
      const encoded = encodeURIComponent(String(value));
      if (encoded.length > 3500) return false;
      document.cookie = `${name}=${encoded}; max-age=31536000; path=/; SameSite=Lax`;
      return true;
    } catch (_e) {
      return false;
    }
  }

  function readPersistCookieIfAny(name) {
    try {
      if (typeof document === 'undefined' || !document.cookie) return '';
      const prefix = `${name}=`;
      const parts = document.cookie.split(';');
      for (let i = 0; i < parts.length; i += 1) {
        const item = parts[i].trim();
        if (item.startsWith(prefix)) {
          return decodeURIComponent(item.slice(prefix.length));
        }
      }
    } catch (_e) {}
    return '';
  }

  const GEMINI_TRANSPORT_SPECS = Object.freeze({
    AI_STUDIO_HEADER: {
      id: 'AI_STUDIO_HEADER',
      label: 'Google AI Studio (Header x-goog-api-key)',
      isVertex: false,
      buildGenerateUrl: (ep, action, _key, isStream) =>
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
          ep
        )}:${action}${isStream ? '?alt=sse' : ''}`,
      buildModelsUrl: (_key, pageSize = 40) =>
        `https://generativelanguage.googleapis.com/v1beta/models?pageSize=${pageSize}`,
      buildPostHeaders: (key) => ({
        'Content-Type': 'application/json',
        'x-goog-api-key': key
      }),
      buildGetHeaders: (key) => ({ 'x-goog-api-key': key })
    },
    AI_STUDIO_QUERY: {
      id: 'AI_STUDIO_QUERY',
      label: 'Google AI Studio (?key=)',
      isVertex: false,
      buildGenerateUrl: (ep, action, key, isStream) =>
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
          ep
        )}:${action}?${isStream ? 'alt=sse&' : ''}key=${encodeURIComponent(key)}`,
      buildModelsUrl: (key, pageSize = 40) =>
        `https://generativelanguage.googleapis.com/v1beta/models?pageSize=${pageSize}&key=${encodeURIComponent(
          key
        )}`,
      buildPostHeaders: () => ({ 'Content-Type': 'application/json' }),
      buildGetHeaders: () => ({})
    },
    VERTEX_EXPRESS_HEADER: {
      id: 'VERTEX_EXPRESS_HEADER',
      label: 'Vertex AI Express (Header x-goog-api-key)',
      isVertex: true,
      buildGenerateUrl: (ep, action, _key, isStream) =>
        `https://aiplatform.googleapis.com/v1/publishers/google/models/${encodeURIComponent(
          ep
        )}:${action}${isStream ? '?alt=sse' : ''}`,
      buildModelsUrl: null,
      buildPostHeaders: (key) => ({
        'Content-Type': 'application/json',
        'x-goog-api-key': key
      }),
      buildGetHeaders: null
    },
    VERTEX_EXPRESS_QUERY: {
      id: 'VERTEX_EXPRESS_QUERY',
      label: 'Vertex AI Express (?key=)',
      isVertex: true,
      buildGenerateUrl: (ep, action, key, isStream) =>
        `https://aiplatform.googleapis.com/v1/publishers/google/models/${encodeURIComponent(
          ep
        )}:${action}?${isStream ? 'alt=sse&' : ''}key=${encodeURIComponent(key)}`,
      buildModelsUrl: null,
      buildPostHeaders: () => ({ 'Content-Type': 'application/json' }),
      buildGetHeaders: null
    },
    VERTEX_EXPRESS_BETA_HEADER: {
      id: 'VERTEX_EXPRESS_BETA_HEADER',
      label: 'Vertex AI Express v1beta1 (Header x-goog-api-key)',
      isVertex: true,
      buildGenerateUrl: (ep, action, _key, isStream) =>
        `https://aiplatform.googleapis.com/v1beta1/publishers/google/models/${encodeURIComponent(
          ep
        )}:${action}${isStream ? '?alt=sse' : ''}`,
      buildModelsUrl: null,
      buildPostHeaders: (key) => ({
        'Content-Type': 'application/json',
        'x-goog-api-key': key
      }),
      buildGetHeaders: null
    },
    VERTEX_EXPRESS_BETA_QUERY: {
      id: 'VERTEX_EXPRESS_BETA_QUERY',
      label: 'Vertex AI Express v1beta1 (?key=)',
      isVertex: true,
      buildGenerateUrl: (ep, action, key, isStream) =>
        `https://aiplatform.googleapis.com/v1beta1/publishers/google/models/${encodeURIComponent(
          ep
        )}:${action}?${isStream ? 'alt=sse&' : ''}key=${encodeURIComponent(key)}`,
      buildModelsUrl: null,
      buildPostHeaders: () => ({ 'Content-Type': 'application/json' }),
      buildGetHeaders: null
    }
  });

  function sanitizeGeminiApiKeyString(raw) {
    return String(raw || '')
      .replace(/[\u200B-\u200D\uFEFF\r\n\t\s]+/g, '')
      .replace(/^["'`]+|["'`]+$/g, '')
      .trim();
  }

  function computeGeminiKeyDigest(rawKey) {
    const str = sanitizeGeminiApiKeyString(rawKey);
    if (!str) return '';
    let h1 = 0x811c9dc5;
    let h2 = 0x9e3779b9;
    for (let i = 0; i < str.length; i += 1) {
      const ch = str.charCodeAt(i);
      h1 ^= ch;
      h1 = Math.imul(h1, 0x01000193) >>> 0;
      h2 = (Math.imul(h2 ^ ch, 0x85ebca6b) + str.length) >>> 0;
    }
    return `${h1.toString(16)}_${h2.toString(16)}_${str.length}`;
  }

  function readSavedVerifiedRecord() {
    try {
      const raw = localStorage.getItem(GEMINI_FLASHLITE_VERIFIED_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (_e) {}
    try {
      const ck = readPersistCookieIfAny(VERIFIED_COOKIE_NAME);
      if (ck) {
        const parsedCk = JSON.parse(ck);
        if (parsedCk && typeof parsedCk === 'object') {
          try {
            localStorage.setItem(GEMINI_FLASHLITE_VERIFIED_STORAGE_KEY, ck);
          } catch (_lsErr) {}
          return parsedCk;
        }
      }
    } catch (_e2) {}
    return null;
  }

  function setRuntimeTransportForKey(rawKey, transportType) {
    const digest = computeGeminiKeyDigest(rawKey);
    if (digest && transportType && GEMINI_TRANSPORT_SPECS[transportType]) {
      _runtimeTransportByDigest.set(digest, transportType);
    }
  }

  function getVerifiedTransportForKey(rawKey) {
    const digest = computeGeminiKeyDigest(rawKey);
    if (!digest) return '';
    const cached = _runtimeTransportByDigest.get(digest);
    if (cached && GEMINI_TRANSPORT_SPECS[cached]) return cached;
    const rec = readSavedVerifiedRecord();
    if (rec && rec.keyDigest === digest && rec.transportType && GEMINI_TRANSPORT_SPECS[rec.transportType]) {
      return rec.transportType;
    }
    return '';
  }

  function getTransportOrderForKey(rawKey, preferredTransport = '') {
    const clean = sanitizeGeminiApiKeyString(rawKey);
    const isAqKey = clean.startsWith('AQ.');
    const hinted = preferredTransport || getVerifiedTransportForKey(clean);
    // Nếu khóa đã xác thực qua Google AI Studio (Flash-Lite OK), KHÔNG tự rơi sang Vertex AI Express
    // tránh lỗi "Agent Platform API has not been used in project..." đè lên fallback Pro/Flash!
    if (hinted && hinted.startsWith('AI_STUDIO_')) {
      const studioTransports = isAqKey
        ? ['AI_STUDIO_HEADER', 'AI_STUDIO_QUERY']
        : ['AI_STUDIO_QUERY', 'AI_STUDIO_HEADER'];
      return [hinted, ...studioTransports.filter((t) => t !== hinted)];
    }
    const baseOrder = isAqKey
      ? [
          'AI_STUDIO_HEADER',
          'AI_STUDIO_QUERY',
          'VERTEX_EXPRESS_HEADER',
          'VERTEX_EXPRESS_QUERY',
          'VERTEX_EXPRESS_BETA_HEADER',
          'VERTEX_EXPRESS_BETA_QUERY'
        ]
      : [
          'AI_STUDIO_QUERY',
          'AI_STUDIO_HEADER',
          'VERTEX_EXPRESS_QUERY',
          'VERTEX_EXPRESS_HEADER'
        ];
    if (hinted && GEMINI_TRANSPORT_SPECS[hinted]) {
      return [hinted, ...baseOrder.filter((t) => t !== hinted)];
    }
    return baseOrder;
  }

  function buildGeminiEndpointRequestSpec({
    endpointModel,
    apiKey,
    transportType = 'AI_STUDIO_QUERY',
    action = 'generateContent',
    isStream = false
  }) {
    const spec = GEMINI_TRANSPORT_SPECS[transportType] || GEMINI_TRANSPORT_SPECS.AI_STUDIO_QUERY;
    return {
      transportType: spec.id,
      transportLabel: spec.label,
      isVertex: Boolean(spec.isVertex),
      url: spec.buildGenerateUrl(endpointModel, action, apiKey, isStream),
      headers: spec.buildPostHeaders(apiKey)
    };
  }

  function buildVerifyFailureMessage(keyStr, bestHttpError, lastNetworkError) {
    const clean = sanitizeGeminiApiKeyString(keyStr);
    const isAqKey = clean.startsWith('AQ.');
    if (bestHttpError) {
      const code = bestHttpError.status;
      const raw = String(bestHttpError.rawMessage || bestHttpError.message || '').slice(0, 180);
      const via = bestHttpError.transportLabel || 'Gemini API';
      if (code === 400 || raw.toLowerCase().includes('api_key_invalid') || raw.toLowerCase().includes('key not valid')) {
        const aqTip = isAqKey
          ? ' Lưu ý với key AQ.: nếu là key Vertex AI Express hoặc Google Cloud Auth mới, hãy kiểm tra lại key đã copy đủ ký tự và kích hoạt Gemini API trong Google Cloud Project chưa.'
          : '';
        return `Google từ chối API Key (HTTP 400 tại ${via}): ${raw}.${aqTip}`;
      }
      if (code === 401 || code === 403) {
        return `API Key chưa đủ quyền hoặc bị hạn chế (HTTP ${code} tại ${via}): ${raw}. Hãy kiểm tra API Restrictions (HTTP Referrer / Gemini API) trong Google AI Studio / Cloud Console.`;
      }
      if (code === 429) {
        return `API Key hợp lệ nhưng đang hết hạn ngạch tạm thời (HTTP 429 tại ${via}): ${raw}. Vui lòng đợi 30–60 giây rồi bấm "Xác thực Flash-Lite" lại.`;
      }
      if (code === 404) {
        return `Không tìm thấy mô hình Flash-Lite khả dụng trên tài khoản (HTTP 404 tại ${via}): ${raw}.`;
      }
      return `Lỗi từ máy chủ Google (HTTP ${code} tại ${via}): ${raw}`;
    }
    if (lastNetworkError) {
      const detail = String(lastNetworkError.rawMessage || lastNetworkError.message || '').slice(0, 160);
      const corsTip = isAqKey
        ? ' Nếu trình duyệt báo CORS/Failed to fetch với key AQ., hãy tạo khóa API trong Google AI Studio (aistudio.google.com/apikey) hoặc kiểm tra mạng/VPN/AdBlock.'
        : ' Kiểm tra kết nối Internet, VPN, AdBlock hoặc thử mở ứng dụng qua http://localhost.';
      return `Không kết nối được tới máy chủ Google (${detail}).${corsTip}`;
    }
    return 'Không thể xác thực API Key với Gemini Flash-Lite. Hãy kiểm tra lại khóa hoặc kết nối mạng.';
  }

  // Bảng mô hình tối thiểu dự phòng nếu mod02 chưa sẵn sàng
  const SAFE_INLINE_MODELS_CATALOG = Object.freeze([
    {
      id: 'gemini-3.8-flash',
      label: 'Gemini 3.8 Flash — Nhanh, Sắc Nét & Giàu Cảm Xúc (Khuyên dùng)',
      tier: 'BALANCED',
      endpointCandidates: ['gemini-3.8-flash', 'gemini-2.5-flash'],
      isLite: false
    },
    {
      id: 'gemini-3.1-pro-preview',
      label: 'Gemini 3.1 Pro Preview — Tâm Lý Sâu Sắc & Cốt Truyện Nhiều Tầng',
      tier: 'PRO',
      endpointCandidates: ['gemini-3.1-pro-preview', 'gemini-2.5-pro', 'gemini-2.5-flash'],
      isLite: false
    },
    {
      id: 'gemini-4-argon',
      label: 'Gemini 4 Argon — Flagship Thế Hệ Mới Cho Tiểu Thuyết Dài Hơi (Gói Pro/Ultra)',
      tier: 'FLAGSHIP',
      endpointCandidates: ['gemini-4-argon', 'gemini-4-argon-preview', 'gemini-3.1-pro-preview', 'gemini-2.5-pro', 'gemini-3.8-flash'],
      isLite: false
    },
    {
      id: 'gemini-4-carbon',
      label: 'Gemini 4 Carbon — Tư Duy Logic & Kiểm Toán Chặt Chẽ (Gói Ultra)',
      tier: 'FLAGSHIP',
      endpointCandidates: ['gemini-4-carbon', 'gemini-4-carbon-preview', 'gemini-3.1-pro-preview', 'gemini-2.5-pro', 'gemini-3.8-flash'],
      isLite: false
    },
    {
      id: 'gemini-4-hydrogen',
      label: '🧪 Gemini 4 Hydrogen — Siêu Suy Luận XHIGH & Cân Bằng Mạnh Toàn Diện',
      tier: 'FLAGSHIP',
      endpointCandidates: ['gemini-4-hydrogen', 'gemini-4-hydrogen-preview', 'gemini-4-argon', 'gemini-3.1-pro-preview', 'gemini-3.8-flash', 'gemini-2.5-flash'],
      supportsXHighThinking: true,
      supportedThinkingLevels: ['LOW', 'MEDIUM', 'HIGH', 'XHIGH'],
      defaultThinkingLevel: 'HIGH',
      isLite: false
    },
    {
      id: 'gemini-3.6-flash',
      label: 'Gemini 3.6 Flash — Cân Bằng Tốc Độ & Độ Mượt Thoại',
      tier: 'BALANCED',
      endpointCandidates: ['gemini-3.6-flash', 'gemini-2.5-flash'],
      isLite: false
    },
    {
      id: 'gemini-3.5-flash-lite',
      label: 'Gemini 3.5 Flash-Lite — Siêu Nhanh (Chỉ hợp nháp ý ngắn)',
      tier: 'LIGHT',
      endpointCandidates: ['gemini-3.5-flash-lite', 'gemini-2.5-flash-lite'],
      isLite: true
    },
    {
      id: 'gemini-3.1-flash-lite-preview',
      label: 'Gemini 3.1 Flash-Lite Preview — Thử Nghiệm Nháp Nhanh',
      tier: 'LIGHT',
      endpointCandidates: ['gemini-3.1-flash-lite-preview', 'gemini-2.5-flash-lite'],
      isLite: true
    }
  ]);

  function getUtils() {
    return NS.utils || {
      escapeHtml: (s) =>
        String(s == null ? '' : s)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;'),
      countVietnameseWords: (t) =>
        String(t || '')
          .trim()
          .split(/\s+/)
          .filter(Boolean).length,
      showToast: () => {}
    };
  }

  function getStorageKeys() {
    return (
      NS.constants?.STORAGE_KEYS || {
        API_KEY: 'noir_gemini_api_key',
        SELECTED_MODEL: 'noir_selected_gemini_model'
      }
    );
  }

  // ==========================================================================
  // LỚP 1: QUẢN LÝ KÉT SẮT API KEY & XOAY VÒNG KEY DỰ PHÒNG AN TOÀN
  // ==========================================================================
  class ApiKeyVaultAndRotationManager {
    constructor() {
      this.primaryKey = this.loadPrimaryKey();
      this.backupKeys = this.loadBackupKeys();
      this.lastVerifiedAt = 0;
      this.lastVerificationSummary = null;
    }

    sanitizeKeyString(raw) {
      return sanitizeGeminiApiKeyString(raw);
    }

    isPlausibleGeminiKeyFormat(keyStr) {
      const cleaned = this.sanitizeKeyString(keyStr);
      if (!cleaned) return { valid: false, reason: 'Khóa API đang trống.' };
      if (cleaned.length < 24) {
        return {
          valid: false,
          reason: 'Khóa API quá ngắn (Gemini API Key thường bắt đầu bằng AIza... hoặc AQ.... và dài từ 32 ký tự trở lên).'
        };
      }
      if (/^(AIza[0-9A-Za-z\-_]{20,}|AQ\.[0-9A-Za-z\-_.]{18,})$/.test(cleaned)) {
        return { valid: true, warning: '' };
      }
      return {
        valid: true,
        warning: 'Định dạng key không bắt đầu bằng tiền tố AIza... hoặc AQ... thông thường — hệ thống vẫn sẽ thử xác thực trực tiếp qua API.'
      };
    }

    maskKeyForDisplay(keyStr) {
      const cleaned = this.sanitizeKeyString(keyStr);
      if (!cleaned) return 'Chưa có API Key';
      if (cleaned.length <= 10) return '••••••••••';
      return `${cleaned.slice(0, 6)}••••••••••••${cleaned.slice(-4)}`;
    }

    loadPrimaryKey() {
      const keyName = getStorageKeys().API_KEY || 'noir_gemini_api_key';
      try {
        const stored = this.sanitizeKeyString(localStorage.getItem(keyName) || '');
        if (stored) return stored;
      } catch (_) {}
      const fromCookie = this.sanitizeKeyString(readPersistCookieIfAny(API_KEY_COOKIE_NAME));
      if (fromCookie) {
        try {
          localStorage.setItem(keyName, fromCookie);
        } catch (_e) {}
        return fromCookie;
      }
      return '';
    }

    savePrimaryKey(rawKey) {
      const cleaned = this.sanitizeKeyString(rawKey);
      const keyName = getStorageKeys().API_KEY || 'noir_gemini_api_key';
      this.primaryKey = cleaned;
      try {
        if (cleaned) {
          localStorage.setItem(keyName, cleaned);
        } else {
          localStorage.removeItem(keyName);
        }
        writePersistCookieIfHttp(API_KEY_COOKIE_NAME, cleaned);
        if (NS.idb && typeof NS.idb.set === 'function') {
          if (cleaned) {
            NS.idb.set('state_cache', IDB_API_KEY_BACKUP_KEY, cleaned).catch(() => {});
          } else {
            NS.idb.delete?.('state_cache', IDB_API_KEY_BACKUP_KEY)?.catch?.(() => {});
          }
        }
        return true;
      } catch (_) {
        return false;
      }
    }

    loadBackupKeys() {
      try {
        const raw = localStorage.getItem(API_KEY_BACKUP_VAULT_KEY);
        if (!raw) return [];
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          return arr
            .map((item) => ({
              id: String(item.id || `bk_${Date.now()}`),
              label: String(item.label || 'Key dự phòng'),
              key: this.sanitizeKeyString(item.key),
              cooldownUntil: Number(item.cooldownUntil || 0),
              errorCount: Number(item.errorCount || 0)
            }))
            .filter((item) => item.key.length >= 20);
        }
      } catch (_) {}
      return [];
    }

    persistBackupKeys() {
      try {
        localStorage.setItem(
          API_KEY_BACKUP_VAULT_KEY,
          JSON.stringify(this.backupKeys)
        );
      } catch (_) {}
    }

    addBackupKey(rawKey, label = 'Key dự phòng') {
      const cleaned = this.sanitizeKeyString(rawKey);
      const format = this.isPlausibleGeminiKeyFormat(cleaned);
      if (!format.valid) {
        return { ok: false, error: format.reason };
      }
      if (
        cleaned === this.primaryKey ||
        this.backupKeys.some((k) => k.key === cleaned)
      ) {
        return { ok: false, error: 'Key này đã có sẵn trong két sắt.' };
      }
      const entry = {
        id: `bk_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        label: String(label || `Key dự phòng #${this.backupKeys.length + 1}`).trim(),
        key: cleaned,
        cooldownUntil: 0,
        errorCount: 0
      };
      this.backupKeys.push(entry);
      this.persistBackupKeys();
      return { ok: true, entry };
    }

    removeBackupKey(id) {
      const prevLen = this.backupKeys.length;
      this.backupKeys = this.backupKeys.filter((k) => k.id !== id);
      if (this.backupKeys.length !== prevLen) {
        this.persistBackupKeys();
        return true;
      }
      return false;
    }

    getCandidateKeysForRequest() {
      const now = Date.now();
      const candidates = [];
      if (this.primaryKey) {
        candidates.push({
          source: 'PRIMARY',
          label: 'Key Chính',
          key: this.primaryKey
        });
      }
      for (const bk of this.backupKeys) {
        if (bk.key && bk.cooldownUntil <= now) {
          candidates.push({
            source: 'BACKUP',
            label: bk.label,
            id: bk.id,
            key: bk.key
          });
        }
      }
      return candidates;
    }

    markKeyRateLimited(keyStr, cooldownMs = 65000) {
      const found = this.backupKeys.find((b) => b.key === keyStr);
      if (found) {
        found.cooldownUntil = Date.now() + cooldownMs;
        found.errorCount += 1;
        this.persistBackupKeys();
      }
    }
  }

  // ==========================================================================
  // LỚP 2: SỔ CÁI NHẬT KÝ CUỘC GỌI GEMINI API & CHẨN ĐOÁN LỖI MẠNG
  // ==========================================================================
  class ApiExecutionLedgerAndDiagnostics {
    constructor() {
      this.entries = this.loadEntries();
    }

    loadEntries() {
      try {
        const raw = localStorage.getItem(API_CALL_HISTORY_LOG_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.slice(0, 60) : [];
      } catch (_) {
        return [];
      }
    }

    recordCall(entry) {
      const normalized = {
        id: `api_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: Date.now(),
        requestedModel: entry.requestedModel || 'unknown',
        usedEndpoint: entry.usedEndpoint || entry.requestedModel || 'unknown',
        keyLabel: entry.keyLabel || 'Key Chính',
        status: entry.status || 'SUCCESS',
        httpStatus: Number(entry.httpStatus || 200),
        durationMs: Math.round(Number(entry.durationMs || 0)),
        promptChars: Number(entry.promptChars || 0),
        outputWords: Number(entry.outputWords || 0),
        errorMessage: entry.errorMessage ? String(entry.errorMessage).slice(0, 220) : ''
      };
      this.entries.unshift(normalized);
      if (this.entries.length > 60) {
        this.entries.length = 60;
      }
      try {
        localStorage.setItem(
          API_CALL_HISTORY_LOG_KEY,
          JSON.stringify(this.entries)
        );
      } catch (_) {}
      return normalized;
    }

    getSummaryStats() {
      const total = this.entries.length;
      const successes = this.entries.filter((e) => e.status === 'SUCCESS');
      const avgLatency =
        successes.length > 0
          ? Math.round(
              successes.reduce((s, e) => s + e.durationMs, 0) / successes.length
            )
          : 0;
      const totalOutputWords = successes.reduce(
        (s, e) => s + (e.outputWords || 0),
        0
      );
      return {
        totalCalls: total,
        successCalls: successes.length,
        failedCalls: total - successes.length,
        avgLatencyMs: avgLatency,
        totalOutputWords,
        lastEntry: this.entries[0] || null
      };
    }

    translateHttpErrorToHumanVietnamese(statusCode, rawErrorText = '') {
      if (NS.apiErrorAdvisor && typeof NS.apiErrorAdvisor.explainError === 'function') {
        try {
          const advised = NS.apiErrorAdvisor.explainError(statusCode, rawErrorText);
          if (advised && advised.humanMessage) {
            return advised.humanMessage;
          }
        } catch (_) {}
      }

      const lower = String(rawErrorText || '').toLowerCase();
      const shortRaw = String(rawErrorText || '').trim().slice(0, 140);
      if (statusCode === 400 && (lower.includes('api key not valid') || lower.includes('api_key_invalid'))) {
        return `Khóa API Key không hợp lệ hoặc đã bị thu hồi (${shortRaw || 'HTTP 400'}). Hãy kiểm tra lại chuỗi AIza... hoặc AQ.... trong Cổng Kết Nối / Két Sắt Tab 6.`;
      }
      if (statusCode === 401 || statusCode === 403) {
        return `Khóa API chưa được cấp quyền dùng Gemini API hoặc bị hạn chế vùng/billing/HTTP Referrer (${shortRaw || 'HTTP ' + statusCode}).`;
      }
      if (statusCode === 404 || lower.includes('not found')) {
        return 'Endpoint mô hình thử nghiệm này chưa mở cho tài khoản; hệ thống đang tự trượt sang mô hình dự phòng tương đương.';
      }
      if (statusCode === 429 || lower.includes('quota') || lower.includes('resource_exhausted')) {
        return 'Đụng giới hạn lượt gọi (Rate Limit / Quota 429). Hệ thống sẽ tự nghỉ nhịp ngắn hoặc đổi mô hình/key dự phòng.';
      }
      if (statusCode >= 500 && statusCode <= 599) {
        return `Máy chủ Gemini đang bận tạm thời (HTTP ${statusCode}). Hệ thống sẽ tự thử lại mượt mà.`;
      }
      if (lower.includes('failed to fetch') || lower.includes('networkerror')) {
        return 'Không thể kết nối mạng tới máy chủ Google Gemini. Vui lòng kiểm tra Wi-Fi/4G hoặc tường lửa trình duyệt.';
      }
      return `Lỗi kết nối AI (Mã ${statusCode || 'NET'}): ${String(rawErrorText || 'Không rõ nguyên nhân').slice(0, 140)}`;
    }
  }

  // ==========================================================================
  // LỚP 3: TRÌNH ĐÓNG GÓI PAYLOAD GEMINI & BỘ GIẢI MÃ PHẢN HỒI AN TOÀN
  // ==========================================================================
  class GeminiPayloadAndResponseAdapter {
    resolveFallbackThinkingConfig(thinkingLevel, endpointModel) {
      if (
        NS.modelAdvisor &&
        typeof NS.modelAdvisor.resolveThinkingConfigForEndpoint === 'function'
      ) {
        return NS.modelAdvisor.resolveThinkingConfigForEndpoint(
          thinkingLevel,
          endpointModel
        );
      }
      const lvl = String(thinkingLevel || 'MEDIUM').trim().toUpperCase();
      const ep = String(endpointModel || '').toLowerCase();
      if (/gemini-(?:1\.|2\.0-flash(?!-thinking))/.test(ep)) return null;
      if (/gemini-4/.test(ep)) {
        if (lvl === 'MINIMAL') return { thinkingLevel: 'LOW' };
        const safeG4 = ['LOW', 'MEDIUM', 'HIGH', 'XHIGH'].includes(lvl) ? lvl : 'HIGH';
        return { thinkingLevel: safeG4 };
      }
      if (/gemini-3|(?:flash|pro|flash-lite)-latest/.test(ep)) {
        const clampedG3 = lvl === 'XHIGH' ? 'HIGH' : lvl;
        const safe = ['MINIMAL', 'LOW', 'MEDIUM', 'HIGH'].includes(clampedG3) ? clampedG3 : 'MEDIUM';
        if (ep.includes('pro') && safe === 'MINIMAL') return { thinkingLevel: 'LOW' };
        if (ep.includes('pro') && safe === 'MEDIUM') return { thinkingLevel: 'HIGH' };
        return { thinkingLevel: safe };
      }
      if (ep.includes('2.5')) {
        const budgets = ep.includes('pro')
          ? { MINIMAL: 512, LOW: 1024, MEDIUM: 8192, HIGH: 24576, XHIGH: 32768 }
          : { MINIMAL: 0, LOW: 1024, MEDIUM: 8192, HIGH: 16384, XHIGH: 24576 };
        return { thinkingBudget: budgets[lvl] !== undefined ? budgets[lvl] : 8192 };
      }
      return null;
    }

    buildGenerateContentPayload({
      prompt,
      systemInstruction = '',
      temperature = 0.78,
      maxOutputTokens = 8192,
      safetyMode = 'LITERARY_CREATIVE',
      thinkingLevel = '',
      endpointModel = '',
      enableWebSearch = false
    }) {
      const clampedTemp = Math.max(0, Math.min(2.0, Number(temperature ?? 0.78)));
      const clampedTokens = Math.max(256, Math.min(32768, Number(maxOutputTokens || 8192)));

      const generationConfig = {
        temperature: clampedTemp,
        topP: clampedTemp > 0.9 ? 0.96 : 0.92,
        topK: 40,
        maxOutputTokens: clampedTokens
      };

      if (thinkingLevel) {
        const thinkingCfg = this.resolveFallbackThinkingConfig(thinkingLevel, endpointModel);
        if (thinkingCfg && typeof thinkingCfg === 'object') {
          generationConfig.thinkingConfig = thinkingCfg;
        }
      }

      const payload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: String(prompt || '') }]
          }
        ],
        generationConfig
      };

      if (enableWebSearch) {
        payload.tools = [{ googleSearch: {} }];
      }

      if (systemInstruction && String(systemInstruction).trim().length > 0) {
        payload.systemInstruction = {
          parts: [{ text: String(systemInstruction).trim() }]
        };
      }

      if (safetyMode === 'LITERARY_CREATIVE') {
        payload.safetySettings = [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_ONLY_HIGH'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_ONLY_HIGH'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_ONLY_HIGH'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_ONLY_HIGH'
          }
        ];
      }

      return payload;
    }

    extractTextFromGeminiResponse(jsonData) {
      if (!jsonData || typeof jsonData !== 'object') {
        return { ok: false, text: '', reason: 'Phản hồi JSON từ máy chủ rỗng.' };
      }

      if (jsonData.promptFeedback?.blockReason) {
        return {
          ok: false,
          text: '',
          reason: `Bộ lọc an toàn đầu vào tạm chặn (${jsonData.promptFeedback.blockReason}). Hãy giảm bớt từ nhạy cảm trực diện trong câu lệnh.`
        };
      }

      const candidate = Array.isArray(jsonData.candidates)
        ? jsonData.candidates[0]
        : null;
      if (!candidate) {
        return {
          ok: false,
          text: '',
          reason: 'Gemini không trả về nhánh ứng viên nội dung nào.'
        };
      }

      const finishReason = candidate.finishReason || 'STOP';
      const parts = Array.isArray(candidate.content?.parts)
        ? candidate.content.parts
        : [];
      const nonThoughtText = parts
        .filter((p) => typeof p?.text === 'string' && !p.thought)
        .map((p) => p.text)
        .join('\n')
        .trim();
      const extractedText =
        nonThoughtText ||
        parts
          .filter((p) => typeof p?.text === 'string')
          .map((p) => p.text)
          .join('\n')
          .trim();

      if (!extractedText) {
        return {
          ok: false,
          text: '',
          finishReason,
          reason:
            finishReason === 'SAFETY'
              ? 'Đầu ra bị bộ lọc an toàn SAFETY tạm ngắt giữa chừng. Hãy thử diễn đạt cảnh bạo lực/nhạy cảm theo lối ẩn dụ tâm lý.'
              : `Không trích xuất được văn bản từ phản hồi (Trạng thái: ${finishReason}).`
        };
      }

      const truncatedByMaxTokens = finishReason === 'MAX_TOKENS';
      return {
        ok: true,
        text: truncatedByMaxTokens
          ? `${extractedText}\n\n[... Lưu ý: Chương viết đã chạm ngưỡng độ dài 1 lượt xuất, bạn có thể bấm Chế độ 1 viết nối tiếp phần còn lại.]`
          : extractedText,
        finishReason,
        truncatedByMaxTokens,
        usageMetadata: jsonData.usageMetadata || null
      };
    }
  }

  // ==========================================================================
  // LỚP 4: BỘ ĐIỀU PHỐI HÀNG ĐỢI ZERO-CONGESTION & RETRY MỀM
  // ==========================================================================
  class ZeroCongestionRequestScheduler {
    constructor(vaultMgr, ledger) {
      this.vaultMgr = vaultMgr;
      this.ledger = ledger;
      this.adapter = new GeminiPayloadAndResponseAdapter();
      this.inFlightAbortControllers = new Set();
      this.activeConcurrency = 0;
      this.maxConcurrency = 2;
    }

    sleepMs(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    abortAllPendingRequests() {
      let aborted = 0;
      for (const ctrl of this.inFlightAbortControllers) {
        try {
          ctrl.abort(new Error('USER_CANCELLED_TASK'));
          aborted += 1;
        } catch (_) {}
      }
      this.inFlightAbortControllers.clear();
      return aborted;
    }

    getModelEndpointChain(requestedModelId, liveModelsOverride = null) {
      const liveModels = Array.isArray(liveModelsOverride)
        ? liveModelsOverride
        : NS.geminiRouter?.liveProbe?.getCachedOrLiveModels?.() || [];

      if (NS.modelAdvisor && typeof NS.modelAdvisor.buildFallbackChain === 'function') {
        try {
          const chain = NS.modelAdvisor.buildFallbackChain(requestedModelId, liveModels);
          if (Array.isArray(chain) && chain.length > 0) {
            return chain;
          }
        } catch (_) {}
      }

      const catalog = Array.isArray(NS.models) && NS.models.length > 0
        ? NS.models
        : SAFE_INLINE_MODELS_CATALOG;
      const target =
        catalog.find((m) => m.id === requestedModelId) ||
        catalog.find((m) => m.id === DEFAULT_MODEL_FALLBACK_ID) ||
        catalog[0];

      const verifiedRec = readSavedVerifiedRecord();
      const rawList = [
        requestedModelId && liveModels.includes(requestedModelId) ? requestedModelId : '',
        ...(Array.isArray(target?.endpointCandidates) ? target.endpointCandidates : []),
        target?.apiTarget || '',
        ...(Array.isArray(target?.fallbacks) ? target.fallbacks : []),
        ...liveModels,
        'gemini-2.5-flash',
        'gemini-flash-latest',
        'gemini-3-flash-preview',
        'gemini-2.5-pro',
        'gemini-pro-latest',
        'gemini-2.0-flash',
        'gemini-flash-lite-latest',
        verifiedRec?.modelEndpoint || ''
      ];
      return Array.from(new Set(rawList.filter(Boolean)));
    }

    async waitForSlot(timeoutMs = 15000) {
      const start = Date.now();
      while (this.activeConcurrency >= this.maxConcurrency) {
        if (Date.now() - start > timeoutMs) {
          throw new Error(
            'Hàng đợi gọi AI đang bận, vui lòng đợi tác vụ trước hoàn tất.'
          );
        }
        await this.sleepMs(160);
      }
      this.activeConcurrency += 1;
    }

    releaseSlot() {
      this.activeConcurrency = Math.max(0, this.activeConcurrency - 1);
    }

    async executeSingleEndpointCall({
      endpointModel,
      apiKey,
      payload,
      externalSignal = null,
      timeoutMs = 115000
    }) {
      const transportOrder = getTransportOrderForKey(apiKey);
      let bestHttpError = null;
      let lastNetworkError = null;

      for (let tIdx = 0; tIdx < transportOrder.length; tIdx += 1) {
        const transportType = transportOrder[tIdx];
        const reqSpec = buildGeminiEndpointRequestSpec({
          endpointModel,
          apiKey,
          transportType,
          action: 'generateContent',
          isStream: false
        });

        let activePayload = payload;
        for (let cfgAttempt = 0; cfgAttempt < 2; cfgAttempt += 1) {
          const ctrl = new AbortController();
          this.inFlightAbortControllers.add(ctrl);

          const onExternalAbort = () => ctrl.abort(externalSignal?.reason);
          if (externalSignal) {
            if (externalSignal.aborted) {
              this.inFlightAbortControllers.delete(ctrl);
              throw new Error('Đã hủy theo yêu cầu của tác giả.');
            }
            externalSignal.addEventListener('abort', onExternalAbort, { once: true });
          }

          const timer = setTimeout(() => {
            ctrl.abort(new Error('REQUEST_TIMEOUT_EXCEEDED'));
          }, timeoutMs);

          try {
            const response = await fetch(reqSpec.url, {
              method: 'POST',
              headers: reqSpec.headers,
              body: JSON.stringify(activePayload),
              signal: ctrl.signal
            });

            const rawText = await response.text();
            let parsedJson = null;
            try {
              parsedJson = rawText ? JSON.parse(rawText) : null;
            } catch (_) {}

            if (!response.ok) {
              const errDetail =
                parsedJson?.error?.message || rawText || `HTTP ${response.status}`;
              const lowerDetail = String(errDetail).toLowerCase();

              // Tự động gỡ thinkingConfig / googleSearch tools nếu endpoint cụ thể không hỗ trợ tham số mở rộng
              const hasThinkingOrTools = Boolean(
                activePayload?.generationConfig?.thinkingConfig || activePayload?.tools
              );
              if (
                cfgAttempt === 0 &&
                response.status === 400 &&
                hasThinkingOrTools &&
                (lowerDetail.includes('thinking') ||
                  lowerDetail.includes('google_search') ||
                  lowerDetail.includes('tool') ||
                  lowerDetail.includes('unknown name'))
              ) {
                const strippedPayload = JSON.parse(JSON.stringify(activePayload));
                if (strippedPayload.generationConfig) {
                  delete strippedPayload.generationConfig.thinkingConfig;
                }
                delete strippedPayload.tools;
                activePayload = strippedPayload;
                continue;
              }

              const err = new Error(errDetail);
              err.httpStatus = response.status;
              err.rawDetail = errDetail;
              err.transportType = transportType;
              err.isVertexApiDisabled =
                Boolean(GEMINI_TRANSPORT_SPECS[transportType]?.isVertex) &&
                (response.status === 403 ||
                  lowerDetail.includes('agent platform api') ||
                  lowerDetail.includes('aiplatform'));
              // Giữ nguyên lỗi có ý nghĩa từ AI Studio thay vì để Vertex 403 ghi đè
              if (
                !bestHttpError ||
                (bestHttpError.httpStatus === 404 && !err.isVertexApiDisabled)
              ) {
                bestHttpError = err;
              }

              const shouldTryNextTransport =
                response.status === 400 ||
                response.status === 401 ||
                response.status === 403 ||
                response.status === 404;
              if (shouldTryNextTransport && tIdx < transportOrder.length - 1) {
                break; // chuyển sang transport kế tiếp ngay
              }
              throw err;
            }

            const unpacked = this.adapter.extractTextFromGeminiResponse(parsedJson);
            if (!unpacked.ok) {
              const err = new Error(unpacked.reason || 'Lỗi đọc đầu ra Gemini.');
              err.httpStatus = 422;
              throw err;
            }

            setRuntimeTransportForKey(apiKey, transportType);
            unpacked.transportType = transportType;
            try {
              const hRemReq = response.headers?.get?.('x-ratelimit-remaining-requests');
              const hLimReq = response.headers?.get?.('x-ratelimit-limit-requests');
              const hResetReq = response.headers?.get?.('x-ratelimit-reset-requests');
              if (hRemReq || hLimReq || hResetReq) {
                unpacked.rateLimitHeaders = {
                  remainingRequests: hRemReq !== null ? Number(hRemReq) : null,
                  limitRequests: hLimReq !== null ? Number(hLimReq) : null,
                  resetRequests: hResetReq || ''
                };
              }
            } catch (_hErr) {}
            return unpacked;
          } catch (err) {
            if (externalSignal?.aborted || String(err?.message || '').includes('hủy')) {
              throw err;
            }
            if (!err?.httpStatus) {
              lastNetworkError = err;
              if (tIdx < transportOrder.length - 1) {
                break;
              }
            }
            if (bestHttpError && err !== bestHttpError && err?.httpStatus !== 422) {
              throw bestHttpError;
            }
            throw err;
          } finally {
            clearTimeout(timer);
            this.inFlightAbortControllers.delete(ctrl);
            if (externalSignal) {
              externalSignal.removeEventListener('abort', onExternalAbort);
            }
          }
        }
      }

      throw bestHttpError || lastNetworkError || new Error('Không thể kết nối tới điểm cuối Gemini.');
    }

    async runWithFallback({
      prompt,
      systemInstruction = '',
      modelId = DEFAULT_MODEL_FALLBACK_ID,
      temperature = 0.78,
      maxOutputTokens = 8192,
      thinkingLevel = '',
      enableWebSearch = false,
      stopSignal = null
    }) {
      const candidateKeys = this.vaultMgr.getCandidateKeysForRequest();
      if (candidateKeys.length === 0) {
        throw new Error(
          'Chưa cấu hình Gemini API Key. Hãy mở Cổng Kết Nối hoặc Tab 6 -> "Cấu hình Gemini API Key" để nhập khóa (AIza... hoặc AQ...).'
        );
      }

      const router = NS.geminiRouter || null;
      const effectiveThinking =
        thinkingLevel || (typeof router?.getThinkingLevel === 'function' ? router.getThinkingLevel() : 'MEDIUM');
      const effectiveWebSearch = Boolean(
        enableWebSearch || (typeof router?.isWebSearchEnabled === 'function' && router.isWebSearchEnabled())
      );

      let endpoints = this.getModelEndpointChain(modelId);
      const overallStart = Date.now();
      let lastError = null;

      await this.waitForSlot();
      try {
        for (let keyIdx = 0; keyIdx < candidateKeys.length; keyIdx += 1) {
          const keyObj = candidateKeys[keyIdx];
          const attemptedEndpoints = new Set();
          let keyEndpoints = endpoints.slice();
          let liveProbedForKey = false;

          for (let epIdx = 0; epIdx < keyEndpoints.length; epIdx += 1) {
            const ep = keyEndpoints[epIdx];
            if (!ep || attemptedEndpoints.has(ep)) continue;
            attemptedEndpoints.add(ep);

            if (stopSignal && stopSignal.aborted) {
              throw new Error('Đã hủy tác vụ AI theo yêu cầu.');
            }

            if (NS.rateLimiter && typeof NS.rateLimiter.waitBeforeCall === 'function') {
              try {
                await NS.rateLimiter.waitBeforeCall(ep);
              } catch (_) {}
            }

            const payload = this.adapter.buildGenerateContentPayload({
              prompt,
              systemInstruction,
              temperature,
              maxOutputTokens,
              thinkingLevel: effectiveThinking,
              endpointModel: ep,
              enableWebSearch: effectiveWebSearch
            });

            const attemptStart = Date.now();
            try {
              const res = await this.executeSingleEndpointCall({
                endpointModel: ep,
                apiKey: keyObj.key,
                payload,
                externalSignal: stopSignal
              });

              const durationMs = Date.now() - attemptStart;
              const outWords = getUtils().countVietnameseWords(res.text);

              if (NS.modelHealth && typeof NS.modelHealth.recordSuccess === 'function') {
                NS.modelHealth.recordSuccess(ep, durationMs);
              }
              if (NS.modelAnalytics && typeof NS.modelAnalytics.recordSuccess === 'function') {
                NS.modelAnalytics.recordSuccess(ep, durationMs, outWords);
              }

              this.ledger.recordCall({
                requestedModel: modelId,
                usedEndpoint: ep,
                keyLabel: keyObj.label,
                status: 'SUCCESS',
                httpStatus: 200,
                durationMs,
                promptChars: String(prompt || '').length,
                outputWords: outWords
              });

              const usedTokens =
                Number(res.usageMetadata?.totalTokenCount || 0) ||
                Math.ceil((String(prompt || '').length + String(res.text || '').length) / 3.4);
              router?.quotaTracker?.recordCallTelemetry?.({
                modelId: ep,
                requestedModelId: modelId,
                status: 'SUCCESS',
                httpStatus: 200,
                tokensUsed: usedTokens,
                transportType: res.transportType || '',
                rateLimitHeaders: res.rateLimitHeaders || null
              });

              return {
                text: res.text,
                modelId,
                usedEndpoint: ep,
                transportType: res.transportType || '',
                thinkingLevel: effectiveThinking,
                fromFallback: ep !== keyEndpoints[0] || keyIdx > 0,
                keyLabel: keyObj.label,
                durationMs: Date.now() - overallStart,
                finishReason: res.finishReason,
                usageMetadata: res.usageMetadata
              };
            } catch (err) {
              lastError = err;
              const status = Number(err?.httpStatus || 0);
              const durationMs = Date.now() - attemptStart;

              if (NS.modelHealth && typeof NS.modelHealth.recordFailure === 'function') {
                NS.modelHealth.recordFailure(ep, status || 500, err.message);
              }

              this.ledger.recordCall({
                requestedModel: modelId,
                usedEndpoint: ep,
                keyLabel: keyObj.label,
                status: 'FAILED',
                httpStatus: status,
                durationMs,
                promptChars: String(prompt || '').length,
                outputWords: 0,
                errorMessage: err.message
              });

              router?.quotaTracker?.recordCallTelemetry?.({
                modelId: ep,
                requestedModelId: modelId,
                status: 'FAILED',
                httpStatus: status,
                tokensUsed: 0,
                errorDetail: err?.rawDetail || err?.message || ''
              });

              if (
                String(err?.message || '').includes('hủy') ||
                String(err?.message || '').includes('USER_CANCELLED')
              ) {
                throw err;
              }

              // Nếu 404 và chưa quét danh sách mô hình sống thật trên tài khoản -> tự động quét ngay & nối thêm vào hàng chờ thử lại!
              if (status === 404 && !liveProbedForKey && router?.liveProbe) {
                liveProbedForKey = true;
                try {
                  const probeRes = await router.liveProbe.probeKeyAndFetchLiveModels(keyObj.key);
                  const liveArr = Array.isArray(router.liveProbe.lastLiveModels)
                    ? router.liveProbe.lastLiveModels
                    : [];
                  const expanded = this.getModelEndpointChain(modelId, liveArr);
                  expanded.forEach((candEp) => {
                    if (candEp && !attemptedEndpoints.has(candEp) && !keyEndpoints.includes(candEp)) {
                      keyEndpoints.push(candEp);
                    }
                  });
                  if (probeRes?.ok && router.modelSync) {
                    router.modelSync.populateAllDropdowns(router.getSelectedModelId());
                  }
                } catch (_probeErr) {}
              }

              // Chỉ ngắt vòng fallback model nếu chính API Key bị từ chối hoàn toàn (invalid/expired),
              // KHÔNG ngắt khi gặp lỗi 403/400 ở mức model hoặc Vertex Agent Platform API để còn thử fallback model kế tiếp!
              const rawLow = String(err?.rawDetail || err?.message || '').toLowerCase();
              const isHardInvalidKey =
                (status === 400 || status === 401 || status === 403) &&
                !err?.isVertexApiDisabled &&
                (rawLow.includes('api_key_invalid') ||
                  rawLow.includes('api key not valid') ||
                  rawLow.includes('api key expired') ||
                  rawLow.includes('invalid authentication credentials'));
              if (isHardInvalidKey) {
                break;
              }

              // Nếu 429 quá tải, nghỉ jitter ngắn rồi thử endpoint kế tiếp
              if (status === 429 || status === 503) {
                this.vaultMgr.markKeyRateLimited(keyObj.key, 65000);
                const jitter = 450 + Math.floor(Math.random() * 650);
                await this.sleepMs(jitter);
              }
            }
          }
        }
      } finally {
        this.releaseSlot();
      }

      const statusCode = Number(lastError?.httpStatus || 0);
      let friendlyMsg = this.ledger.translateHttpErrorToHumanVietnamese(
        statusCode,
        lastError?.rawDetail || lastError?.message || ''
      );
      if (statusCode === 429) {
        friendlyMsg += ' · Xem hạn mức trực tiếp tại AI Studio (aistudio.google.com/rate-limit) hoặc mở Gemini Web (gemini.google.com).';
      }
      const wrapped = new Error(friendlyMsg);
      wrapped.originalError = lastError;
      wrapped.httpStatus = statusCode;
      throw wrapped;
    }
  }

  // ==========================================================================
  // LỚP 5: BỘ ĐỒNG BỘ 3 DROPDOWN MÔ HÌNH & CẢNH BÁO FLASH-LITE THỜI GIAN THỰC
  // ==========================================================================
  class UnifiedModelSelectorSyncAndGuard {
    constructor(router) {
      this.router = router;
      this.selectorIds = Object.freeze([
        'select-gemini-model',
        'confirm-modal-model-select',
        'mode5-model-selector',
        'chat-model-selector',
        'tab4-bible-model-select',
        'smart-approve-model-select'
      ]);
      this.liveDiscoveredModels = [];
    }

    registerLiveDiscoveredModels(modelsDetailList = []) {
      if (!Array.isArray(modelsDetailList)) return;
      const seen = new Set();
      const cleaned = [];
      for (const item of modelsDetailList) {
        const id = typeof item === 'string'
          ? item.replace(/^models\//, '').trim()
          : String(item?.id || '').replace(/^models\//, '').trim();
        if (!id || seen.has(id) || id.includes('embedding') || id.includes('imagen')) continue;
        seen.add(id);
        const low = id.toLowerCase();
        const isLite = low.includes('lite') || low.includes('8b');
        const isGemini4 = low.includes('gemini-4') || low.includes('hydrogen') || low.includes('argon') || low.includes('carbon');
        const isPro = low.includes('pro') || isGemini4;
        const disp = typeof item === 'object' && item?.displayName
          ? String(item.displayName)
          : id;
        const priorityRank =
          isGemini4 ? 8
            : isPro ? (low.includes('3.') || low.includes('2.5') || low.includes('latest') ? 10 : 20)
              : !isLite ? (low.includes('3.') || low.includes('2.5') || low.includes('latest') ? 15 : 25)
                : 50;
        cleaned.push({
          id,
          label: `🌐 [Live API] ${disp} (${id})`,
          shortLabel: disp,
          apiTarget: id,
          fallbacks: isPro
            ? ['gemini-2.5-pro', 'gemini-pro-latest', 'gemini-flash-latest', 'gemini-2.5-flash']
            : ['gemini-flash-latest', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-lite-latest'],
          tier: isLite ? 'LITE_FAST' : (isPro ? 'PRO_HIGH' : 'BALANCED'),
          isLite,
          priorityRank,
          isLiveDiscovered: true
        });
      }
      cleaned.sort((a, b) => (a.priorityRank - b.priorityRank) || a.id.localeCompare(b.id));
      this.liveDiscoveredModels = cleaned;
    }

    getCatalog() {
      const baseCatalog =
        Array.isArray(NS.models) && NS.models.length > 0
          ? NS.models
          : SAFE_INLINE_MODELS_CATALOG;
      if (!Array.isArray(this.liveDiscoveredModels) || this.liveDiscoveredModels.length === 0) {
        return baseCatalog;
      }
      const existingIds = new Set(baseCatalog.map((m) => m.id));
      const extras = this.liveDiscoveredModels.filter((m) => !existingIds.has(m.id));
      return [...baseCatalog, ...extras];
    }

    isFlashLiteModel(modelId) {
      const id = String(modelId || '').toLowerCase();
      if (id.includes('flash-lite') || id.includes('lite')) return true;
      const entry = this.getModelEntry(modelId);
      return Boolean(
        entry &&
          (entry.isLite ||
            String(entry.tier || '').toUpperCase() === 'LIGHT' ||
            String(entry.label || '').toLowerCase().includes('flash-lite'))
      );
    }

    getModelEntry(modelId) {
      const catalog = this.getCatalog();
      return (
        catalog.find((m) => m.id === modelId) ||
        catalog.find((m) => m.id === DEFAULT_MODEL_FALLBACK_ID) ||
        catalog[0]
      );
    }

    formatDropdownOptionLabel(model) {
      const baseLabel = model.label || model.name || model.id;
      const isLite = this.isFlashLiteModel(model.id);
      if (isLite) {
        return `⚠️ ${baseLabel} [Flash-Lite · Chỉ hợp nháp nhanh]`;
      }
      if (
        model.id === DEFAULT_MODEL_FALLBACK_ID ||
        String(model.tier || '').toUpperCase() === 'BALANCED' ||
        String(model.tier || '').toUpperCase() === 'RECOMMENDED_FLASH'
      ) {
        return `⭐ ${baseLabel}`;
      }
      return `💎 ${baseLabel}`;
    }

    buildGroupedOptionsHtml(catalog) {
      const esc = getUtils().escapeHtml;
      const renderOpt = (m) =>
        `<option value="${esc(m.id)}">${esc(this.formatDropdownOptionLabel(m))}</option>`;

      const flashGroup = [];
      const gemini4Group = [];
      const proArgonGroup = [];
      const liveMainGroup = [];
      const liteGroup = [];

      catalog.forEach((m) => {
        const isLite = this.isFlashLiteModel(m.id);
        const low = String(m.id || '').toLowerCase();
        if (isLite) {
          liteGroup.push(m);
        } else if (m.isLiveDiscovered) {
          liveMainGroup.push(m);
        } else if (low.includes('hydrogen') || low.includes('argon') || low.includes('carbon') || low.includes('gemini-4')) {
          gemini4Group.push(m);
        } else if (low.includes('pro')) {
          proArgonGroup.push(m);
        } else {
          flashGroup.push(m);
        }
      });

      const sections = [];
      if (flashGroup.length > 0) {
        sections.push(`<optgroup label="⭐ Dòng Flash Khuyên Dùng (Cân bằng & Mượt)">${flashGroup.map(renderOpt).join('')}</optgroup>`);
      }
      if (gemini4Group.length > 0) {
        sections.push(`<optgroup label="🚀 Thế Hệ Gemini 4 (Hydrogen 4 · Argon 4 · Carbon 4)">${gemini4Group.map(renderOpt).join('')}</optgroup>`);
      }
      if (proArgonGroup.length > 0) {
        sections.push(`<optgroup label="👑 Dòng Pro Chuyên Sâu (Văn học & Logic)">${proArgonGroup.map(renderOpt).join('')}</optgroup>`);
      }
      if (liveMainGroup.length > 0) {
        sections.push(`<optgroup label="🌐 Mô Hình Live Mở Sẵn Từ API Key (Pro / Flash)">${liveMainGroup.map(renderOpt).join('')}</optgroup>`);
      }
      if (liteGroup.length > 0) {
        sections.push(`<optgroup label="🪶 Dòng Flash-Lite (Chỉ dùng nháp nhanh / tiết kiệm)">${liteGroup.map(renderOpt).join('')}</optgroup>`);
      }
      return sections.join('');
    }

    populateAllDropdowns(selectedId) {
      const catalog = this.getCatalog();
      const validId =
        catalog.find((m) => m.id === selectedId)?.id || DEFAULT_MODEL_FALLBACK_ID;
      const groupedHtml = this.buildGroupedOptionsHtml(catalog);

      for (const domId of this.selectorIds) {
        const selectEl = document.getElementById(domId);
        if (!selectEl) continue;

        const prevSelected = selectEl.value;
        selectEl.innerHTML = groupedHtml;

        if (domId === 'chat-model-selector') {
          const chatPreferred =
            NS.mascotBi?.prefs?.chatModelId ||
            (catalog.some((m) => m.id === prevSelected) ? prevSelected : '') ||
            catalog.find((m) => /flash-lite/i.test(m.id))?.id ||
            'gemini-3.5-flash-lite';
          selectEl.value = catalog.some((m) => m.id === chatPreferred)
            ? chatPreferred
            : catalog.find((m) => /flash-lite/i.test(m.id))?.id || validId;
        } else {
          const finalVal =
            catalog.some((m) => m.id === validId)
              ? validId
              : catalog.some((m) => m.id === prevSelected)
                ? prevSelected
                : catalog[0].id;
          selectEl.value = finalVal;
        }
      }

      this.updateLiteWarningBanner(validId);
      return validId;
    }

    updateLiteWarningBanner(modelId) {
      const banner = document.getElementById('confirm-model-lite-warning');
      if (!banner) return false;
      const isLite = this.isFlashLiteModel(modelId);
      if (isLite) {
        banner.classList.remove('hidden');
        banner.setAttribute('data-lite-warning-active', 'true');
        if (!banner.querySelector('.noir-quick-upgrade-row')) {
          const row = document.createElement('div');
          row.className = 'noir-quick-upgrade-row flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-rose-500/30';
          row.innerHTML = `
            <span class="text-[10px] font-bold text-zinc-300 mr-1">Đổi nhanh sang bản mạnh:</span>
            <button type="button" data-quick-upgrade-model="gemini-3.8-flash" class="px-2 py-0.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white font-bold text-[10px] transition">🌟 Gemini 3.8 Flash</button>
            <button type="button" data-quick-upgrade-model="gemini-4-hydrogen" class="px-2 py-0.5 rounded-lg bg-cyan-600/80 hover:bg-cyan-500 text-white font-bold text-[10px] transition">🧪 Gemini 4 Hydrogen</button>
            <button type="button" data-quick-upgrade-model="gemini-4-argon" class="px-2 py-0.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-500 text-white font-bold text-[10px] transition">💎 Gemini 4 Argon (Pro)</button>
            <button type="button" data-quick-upgrade-model="gemini-3.1-pro-preview" class="px-2 py-0.5 rounded-lg bg-amber-600/80 hover:bg-amber-500 text-white font-bold text-[10px] transition">👑 Gemini 3.1 Pro</button>
          `;
          row.addEventListener('click', (ev) => {
            const btn = ev.target.closest('[data-quick-upgrade-model]');
            if (!btn) return;
            const targetId = btn.getAttribute('data-quick-upgrade-model');
            if (targetId && this.router?.setSelectedModel) {
              this.router.setSelectedModel(targetId);
              getUtils().showToast(`✨ Đã chuyển sang ${targetId} để viết mượt & sâu sắc hơn!`, 'success', 2600);
            }
          });
          banner.appendChild(row);
        }
      } else {
        banner.classList.add('hidden');
        banner.setAttribute('data-lite-warning-active', 'false');
      }
      return isLite;
    }

    syncSelectionValueAcrossDOM(modelId) {
      for (const domId of this.selectorIds) {
        const el = document.getElementById(domId);
        if (el && el.value !== modelId) {
          const hasOption = Array.from(el.options || []).some(
            (opt) => opt.value === modelId
          );
          if (hasOption) el.value = modelId;
        }
      }
      this.updateLiteWarningBanner(modelId);
    }
  }

  // ==========================================================================
  // LỚP 6: MỞ RỘNG GIAO DIỆN KÉT SẮT API KEY (KEY DỰ PHÒNG & NHẬT KÝ GỌI API)
  // ==========================================================================
  class ApiKeyVaultModalEnhancer {
    constructor(router) {
      this.router = router;
      this.mounted = false;
    }

    ensureVaultExtrasMounted() {
      const modal = document.getElementById('modal-api-key-vault');
      const statusEl = document.getElementById('apikey-verify-status');
      if (!modal || !statusEl || !statusEl.parentElement) return false;

      if (document.getElementById('apikey-vault-extras-panel')) {
        this.mounted = true;
        this.refreshExtrasPanel();
        return true;
      }

      const panel = document.createElement('div');
      panel.id = 'apikey-vault-extras-panel';
      panel.className =
        'pt-3 border-t border-zinc-800 space-y-3 text-[11px]';
      panel.innerHTML = [
        '<div id="apikey-telemetry-summary-box" class="p-2.5 rounded-xl bg-zinc-950/90 border border-zinc-800 text-zinc-300 flex flex-wrap items-center justify-between gap-2"></div>',
        '<div class="space-y-1.5">',
        '  <div class="flex items-center justify-between">',
        '    <span class="font-bold text-amber-300 uppercase text-[10px]">🔄 Kho Key Dự Phòng Tự Xoay Vòng Khi Hết Quota (Tùy chọn)</span>',
        '    <span id="apikey-backup-count-badge" class="font-monoCode text-[10px] text-zinc-400">0 key dự phòng</span>',
        '  </div>',
        '  <div class="flex gap-1.5">',
        '    <input id="input-backup-gemini-key" type="password" placeholder="Dán thêm AIzaSy... dự phòng (nếu có nhiều key)" class="flex-1 px-2.5 py-1.5 rounded-lg border border-zinc-700 bg-zinc-950 font-monoCode text-[11px]" />',
        '    <button type="button" id="btn-add-backup-gemini-key" class="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold shrink-0">+ Thêm Key</button>',
        '  </div>',
        '  <div id="apikey-backup-list-container" class="max-h-28 overflow-y-auto space-y-1"></div>',
        '</div>'
      ].join('\n');

      statusEl.parentElement.appendChild(panel);
      this.bindExtrasEvents();
      this.refreshExtrasPanel();
      this.mounted = true;
      return true;
    }

    refreshExtrasPanel() {
      const telemetryBox = document.getElementById('apikey-telemetry-summary-box');
      const countBadge = document.getElementById('apikey-backup-count-badge');
      const listBox = document.getElementById('apikey-backup-list-container');
      const esc = getUtils().escapeHtml;

      if (telemetryBox) {
        const stats = this.router.ledger.getSummaryStats();
        const primaryMasked = this.router.vaultMgr.maskKeyForDisplay(
          this.router.getEffectiveActiveKey() || this.router.getApiKey()
        );
        telemetryBox.innerHTML = [
          `<span>Key chính: <strong class="font-monoCode text-emerald-300">${esc(primaryMasked)}</strong></span>`,
          `<span>Đã gọi: <strong>${stats.successCalls}/${stats.totalCalls}</strong> thành công · TB <strong>${stats.avgLatencyMs}ms</strong></span>`
        ].join('');
      }

      const backups = this.router.vaultMgr.backupKeys;
      if (countBadge) {
        countBadge.textContent = `${backups.length} key dự phòng`;
      }

      if (listBox) {
        if (backups.length === 0) {
          listBox.innerHTML =
            '<div class="text-[10px] text-zinc-500 italic">Chưa thêm key dự phòng. Khi gặp lỗi 429 hết quota, hệ thống sẽ tự xoay sang các key ở đây.</div>';
        } else {
          listBox.innerHTML = backups
            .map(
              (bk) =>
                `<div class="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-2">` +
                `  <div class="truncate"><span class="font-bold text-amber-200">${esc(bk.label)}</span> · <span class="font-monoCode text-zinc-400">${esc(this.router.vaultMgr.maskKeyForDisplay(bk.key))}</span></div>` +
                `  <button type="button" data-remove-backup-key="${esc(bk.id)}" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-rose-600 text-zinc-200 font-bold text-[10px]">Xóa</button>` +
                `</div>`
            )
            .join('');
        }
      }
    }

    bindExtrasEvents() {
      const bindOnce =
        typeof NS.bindOnce === 'function'
          ? NS.bindOnce.bind(NS)
          : (el, ev, fn) => {
              const t = typeof el === 'string' ? document.getElementById(el) : el;
              if (t) t.addEventListener(ev, fn);
            };

      bindOnce(
        'btn-add-backup-gemini-key',
        'click',
        () => {
          const inp = document.getElementById('input-backup-gemini-key');
          if (!inp) return;
          const res = this.router.vaultMgr.addBackupKey(inp.value);
          if (!res.ok) {
            getUtils().showToast(`⚠️ ${res.error}`, 'warn');
            return;
          }
          inp.value = '';
          this.refreshExtrasPanel();
          getUtils().showToast('✅ Đã lưu thêm Gemini API Key dự phòng!', 'success');
        },
        'mod15_add_backup_key'
      );

      bindOnce(
        'apikey-backup-list-container',
        'click',
        (ev) => {
          const btn = ev.target.closest('[data-remove-backup-key]');
          if (!btn) return;
          const id = btn.getAttribute('data-remove-backup-key');
          if (this.router.vaultMgr.removeBackupKey(id)) {
            this.refreshExtrasPanel();
            getUtils().showToast('🗑️ Đã gỡ key dự phòng khỏi két sắt.', 'info', 2000);
          }
        },
        'mod15_remove_backup_key'
      );
    }
  }

  // ==========================================================================
  // LỚP 7: BỘ KIỂM TRA DANH SÁCH MÔ HÌNH LIVE TỪ API KEY & DỰ TOÁN TOKEN
  // ==========================================================================
  class GeminiLiveModelsInspectorAndProbe {
    constructor(vaultMgr, ledger) {
      this.vaultMgr = vaultMgr;
      this.ledger = ledger;
      this.lastLiveModels = [];
      this.lastLiveModelsDetailed = [];
      this.lastProbeAt = 0;
    }

    getCachedOrLiveModels(apiKey = '') {
      if (Array.isArray(this.lastLiveModels) && this.lastLiveModels.length > 0) {
        return this.lastLiveModels.slice();
      }
      try {
        const clean = this.vaultMgr.sanitizeKeyString(apiKey || this.vaultMgr.primaryKey);
        const digest = computeGeminiKeyDigest(clean);
        const raw = localStorage.getItem('noir_v40_live_models_snapshot_v1');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && (!digest || parsed.keyDigest === digest) && Array.isArray(parsed.models)) {
            this.lastLiveModels = parsed.models.slice();
            if (Array.isArray(parsed.details)) {
              this.lastLiveModelsDetailed = parsed.details;
              this.router?.modelSync?.registerLiveDiscoveredModels?.(parsed.details);
            }
            return this.lastLiveModels.slice();
          }
        }
      } catch (_e) {}
      return [];
    }

    async probeKeyAndFetchLiveModels(candidateKey = '') {
      const apiKey = this.vaultMgr.sanitizeKeyString(
        candidateKey || this.vaultMgr.primaryKey
      );
      if (!apiKey) {
        return {
          ok: false,
          httpStatus: 0,
          message: 'Bạn chưa nhập Gemini API Key để kiểm tra.'
        };
      }

      const formatCheck = this.vaultMgr.isPlausibleGeminiKeyFormat(apiKey);
      if (!formatCheck.valid) {
        return {
          ok: false,
          httpStatus: 0,
          message: formatCheck.reason
        };
      }

      const probeTransports = apiKey.startsWith('AQ.')
        ? ['AI_STUDIO_HEADER', 'AI_STUDIO_QUERY']
        : ['AI_STUDIO_QUERY', 'AI_STUDIO_HEADER'];

      const started = Date.now();
      let lastFailureResult = null;

      for (const tId of probeTransports) {
        const spec = GEMINI_TRANSPORT_SPECS[tId];
        if (!spec || !spec.buildModelsUrl) continue;
        const url = spec.buildModelsUrl(apiKey, 200);
        const headers = spec.buildGetHeaders ? spec.buildGetHeaders(apiKey) : {};

        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 9000);
        try {
          const res = await fetch(url, {
            method: 'GET',
            headers,
            signal: ctrl.signal
          });
          const rawText = await res.text();
          let data = null;
          try {
            data = rawText ? JSON.parse(rawText) : null;
          } catch (_) {}

          if (!res.ok) {
            const rawErr = data?.error?.message || rawText || `HTTP ${res.status}`;
            lastFailureResult = {
              ok: false,
              httpStatus: res.status,
              latencyMs: Date.now() - started,
              message: this.ledger.translateHttpErrorToHumanVietnamese(
                res.status,
                rawErr
              )
            };
            continue;
          }

          const modelsArr = Array.isArray(data?.models) ? data.models : [];
          const genCapable = modelsArr.filter((m) => {
            const id = String(m?.name || '').replace(/^models\//, '').toLowerCase();
            if (!id.includes('gemini') || id.includes('embedding')) return false;
            if (Array.isArray(m?.supportedGenerationMethods) && m.supportedGenerationMethods.length > 0) {
              return m.supportedGenerationMethods.includes('generateContent');
            }
            return true;
          });

          this.lastLiveModelsDetailed = genCapable.map((m) => ({
            id: String(m.name || '').replace(/^models\//, ''),
            displayName: String(m.displayName || '').trim(),
            inputTokenLimit: Number(m.inputTokenLimit || 0),
            outputTokenLimit: Number(m.outputTokenLimit || 0),
            thinking: Boolean(m.thinking)
          }));
          this.lastLiveModels = this.lastLiveModelsDetailed.map((d) => d.id);
          this.lastProbeAt = Date.now();

          setRuntimeTransportForKey(apiKey, tId);
          try {
            localStorage.setItem(
              'noir_v40_live_models_snapshot_v1',
              JSON.stringify({
                keyDigest: computeGeminiKeyDigest(apiKey),
                fetchedAt: this.lastProbeAt,
                models: this.lastLiveModels,
                details: this.lastLiveModelsDetailed
              })
            );
          } catch (_lsErr) {}

          if (this.router?.modelSync) {
            this.router.modelSync.registerLiveDiscoveredModels(this.lastLiveModelsDetailed);
            this.router.modelSync.populateAllDropdowns(this.router.getSelectedModelId());
          }
          if (this.router?.quotaTracker) {
            this.router.quotaTracker.renderRealtimeQuotaWidget();
          }

          return {
            ok: true,
            httpStatus: 200,
            transportType: tId,
            latencyMs: Date.now() - started,
            availableCount: this.lastLiveModels.length,
            sampleModels: this.lastLiveModels.slice(0, 6),
            warningNote: formatCheck.warning || '',
            message: `Kết nối Gemini API thành công (${Date.now() - started}ms) — Key của bạn đang mở khóa ${this.lastLiveModels.length} điểm truy cập Gemini.`
          };
        } catch (err) {
          lastFailureResult = {
            ok: false,
            httpStatus: 0,
            latencyMs: Date.now() - started,
            message:
              err?.name === 'AbortError'
                ? 'Hết thời gian chờ kết nối (9 giây). Hãy kiểm tra lại kết nối Internet.'
                : this.ledger.translateHttpErrorToHumanVietnamese(
                    0,
                    err?.message || 'Lỗi mạng'
                  )
          };
        } finally {
          clearTimeout(timer);
        }
      }

      return (
        lastFailureResult || {
          ok: false,
          httpStatus: 0,
          latencyMs: Date.now() - started,
          message: 'Không thể lấy danh sách mô hình từ Google AI Studio.'
        }
      );
    }

    async discoverLiveFlashLiteModels(candidateKey = '') {
      try {
        const probe = await this.probeKeyAndFetchLiveModels(candidateKey);
        if (!probe?.ok || !Array.isArray(this.lastLiveModels)) {
          return [];
        }
        const flashLites = this.lastLiveModels.filter(
          (id) => /flash/i.test(id) && /lite|8b/i.test(id)
        );
        const regularFlash = this.lastLiveModels.filter(
          (id) => /gemini-2\.[05]-flash$/i.test(id)
        );
        return Array.from(new Set([...flashLites, ...regularFlash]));
      } catch (_e) {
        return [];
      }
    }

    estimatePayloadBudgetBeforeSend(promptText, systemInstruction = '', modelId = '') {
      const charTotal =
        String(promptText || '').length + String(systemInstruction || '').length;
      const approxTokens = Math.ceil(charTotal / 3.4);
      const isHeavy = approxTokens > 36000;
      return {
        totalChars: charTotal,
        approxInputTokens: approxTokens,
        isHeavy,
        advice: isHeavy
          ? 'Gói ngữ cảnh khá dài (>36k token). Khuyến nghị dùng Gemini 3.8 Flash / 3.1 Pro / Argon để đọc trọn vẹn không rớt chi tiết.'
          : `Dung lượng gói Prompt ~${approxTokens.toLocaleString('vi-VN')} token — tối ưu mượt cho ${modelId || 'Gemini Flash'}.`
      };
    }
  }

  // ==========================================================================
  // LỚP 7B: BỘ ĐO HẠN MỨC QUOTA NGẮN HẠN (5 GIỜ) & DÀI HẠN (TUẦN 7 NGÀY) THỜI GIAN THỰC
  // ==========================================================================
  const THINKING_LEVEL_STORAGE_KEY = 'noir_v40_thinking_level_v1';
  const WEB_SEARCH_STORAGE_KEY = 'noir_v40_web_search_v1';
  const DAILY_QUOTA_PT_STORAGE_KEY = 'noir_v40_daily_quota_pt_v1';
  const QUOTA_LEDGER_V2_STORAGE_KEY = 'noir_v40_quota_ledger_5h_week_v2';
  const FIVE_HOURS_MS = 5 * 3600 * 1000;
  const SEVEN_DAYS_MS = 7 * 24 * 3600 * 1000;

  class RealTimeQuotaTelemetryTracker {
    constructor(router) {
      this.router = router;
      this.minuteEvents = []; // { ts, tokens, ok, status, modelId }
      this.cooldownUntilMs = 0;
      this.lastRateLimitScope = ''; // '' | 'SHORT_TERM_5H' | 'LONG_TERM_WEEKLY' | 'LONG_TERM_RPD_DAILY'
      this.lastRateLimitDetail = '';
      this.lastUsedEndpoint = '';
      this.lastUsedTransport = '';
      this.liveRateLimitHeaders = null;
      this._timerId = null;
    }

    getActiveKeyDigest() {
      const key =
        this.router?.getEffectiveActiveKey?.() ||
        this.router?.vaultMgr?.primaryKey ||
        '';
      return computeGeminiKeyDigest(key || 'anon_key') || 'anon_key';
    }

    getActiveKeyMask() {
      const key =
        this.router?.getEffectiveActiveKey?.() ||
        this.router?.vaultMgr?.primaryKey ||
        '';
      if (!key || key.length < 6) return 'Chưa nối Key';
      return `••••${key.slice(-4)}`;
    }

    loadPersistedLedgerEvents(nowMs = Date.now()) {
      const digest = this.getActiveKeyDigest();
      const cutoffWeek = nowMs - SEVEN_DAYS_MS;
      try {
        const raw = localStorage.getItem(QUOTA_LEDGER_V2_STORAGE_KEY);
        if (raw) {
          const allMap = JSON.parse(raw);
          const list = Array.isArray(allMap?.[digest]) ? allMap[digest] : [];
          return list.filter((ev) => ev && Number(ev.ts || 0) >= cutoffWeek);
        }
      } catch (_e) {}
      return [];
    }

    savePersistedLedgerEvents(eventsList, nowMs = Date.now()) {
      const digest = this.getActiveKeyDigest();
      const cutoffWeek = nowMs - SEVEN_DAYS_MS;
      try {
        const raw = localStorage.getItem(QUOTA_LEDGER_V2_STORAGE_KEY);
        const allMap = raw ? JSON.parse(raw) || {} : {};
        allMap[digest] = (Array.isArray(eventsList) ? eventsList : [])
          .filter((ev) => ev && Number(ev.ts || 0) >= cutoffWeek)
          .slice(-600);
        localStorage.setItem(QUOTA_LEDGER_V2_STORAGE_KEY, JSON.stringify(allMap));
      } catch (_e) {}
    }

    getPacificDateString(nowMs = Date.now()) {
      try {
        return new Intl.DateTimeFormat('en-CA', {
          timeZone: 'America/Los_Angeles',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).format(new Date(nowMs));
      } catch (_e) {
        return new Date(nowMs).toISOString().slice(0, 10);
      }
    }

    getMsUntilWeeklyBoundary(nowMs = Date.now()) {
      const events = this.loadPersistedLedgerEvents(nowMs);
      if (events.length > 0) {
        const oldestTs = Number(events[0].ts || nowMs);
        return Math.max(60000, oldestTs + SEVEN_DAYS_MS - nowMs);
      }
      return SEVEN_DAYS_MS;
    }

    formatDurationVN(ms) {
      const safeMs = Math.max(0, Number(ms) || 0);
      const totalMins = Math.ceil(safeMs / 60000);
      const days = Math.floor(totalMins / (60 * 24));
      const hours = Math.floor((totalMins % (60 * 24)) / 60);
      const mins = totalMins % 60;
      if (days > 0) return `${days}n ${hours}g`;
      if (hours > 0) return `${hours}g ${mins}p`;
      return `${mins}p`;
    }

    loadDailyBucket() {
      const todayPt = this.getPacificDateString();
      try {
        const raw = localStorage.getItem(DAILY_QUOTA_PT_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.ptDate === todayPt) {
            return {
              ptDate: todayPt,
              requestsCount: Number(parsed.requestsCount || 0),
              tokensTotal: Number(parsed.tokensTotal || 0),
              failedCount: Number(parsed.failedCount || 0),
              exhaustedDaily: Boolean(parsed.exhaustedDaily)
            };
          }
        }
      } catch (_e) {}
      return {
        ptDate: todayPt,
        requestsCount: 0,
        tokensTotal: 0,
        failedCount: 0,
        exhaustedDaily: false
      };
    }

    saveDailyBucket(bucket) {
      try {
        localStorage.setItem(DAILY_QUOTA_PT_STORAGE_KEY, JSON.stringify(bucket));
      } catch (_e) {}
    }

    recordCallTelemetry({
      modelId = '',
      requestedModelId = '',
      status = 'SUCCESS',
      httpStatus = 200,
      tokensUsed = 0,
      transportType = '',
      errorDetail = '',
      rateLimitHeaders = null
    }) {
      const now = Date.now();
      const tokNum = Math.max(0, Number(tokensUsed || 0));
      this.pruneOldMinuteEvents(now);
      const entryObj = {
        ts: now,
        tokens: tokNum,
        ok: status === 'SUCCESS',
        status: Number(httpStatus || 0),
        modelId: modelId || requestedModelId
      };
      this.minuteEvents.push(entryObj);

      const ledger = this.loadPersistedLedgerEvents(now);
      ledger.push(entryObj);
      this.savePersistedLedgerEvents(ledger, now);

      if (rateLimitHeaders && typeof rateLimitHeaders === 'object') {
        this.liveRateLimitHeaders = rateLimitHeaders;
      }

      const daily = this.loadDailyBucket();
      daily.requestsCount += 1;
      daily.tokensTotal += tokNum;

      if (status === 'SUCCESS') {
        this.lastUsedEndpoint = modelId || requestedModelId;
        if (transportType) this.lastUsedTransport = transportType;
        if (this.lastRateLimitScope === 'SHORT_TERM_5H' && now >= this.cooldownUntilMs) {
          this.lastRateLimitScope = '';
          this.lastRateLimitDetail = '';
        }
      } else {
        daily.failedCount += 1;
        if (Number(httpStatus) === 429) {
          const lowErr = String(errorDetail || '').toLowerCase();
          const isLongTerm =
            lowErr.includes('week') ||
            lowErr.includes('per day') ||
            lowErr.includes('daily') ||
            lowErr.includes('rpd') ||
            lowErr.includes('requestsperday');
          this.lastRateLimitScope = isLongTerm ? 'LONG_TERM_WEEKLY' : 'SHORT_TERM_5H';
          this.lastRateLimitDetail = String(errorDetail || '').slice(0, 140);
          if (isLongTerm) {
            daily.exhaustedDaily = true;
            this.cooldownUntilMs = now + 180000;
          } else {
            this.cooldownUntilMs = now + 62000;
          }
        }
      }

      this.saveDailyBucket(daily);
      this.renderRealtimeQuotaWidget();
      if (NS.bus && typeof NS.bus.emit === 'function') {
        NS.bus.emit('ai:quota_updated', this.getSnapshot());
      }
    }

    pruneOldMinuteEvents(nowMs = Date.now()) {
      const cutoff = nowMs - 60000;
      this.minuteEvents = this.minuteEvents.filter((ev) => ev.ts >= cutoff);
    }

    getSnapshot() {
      const now = Date.now();
      this.pruneOldMinuteEvents(now);
      const daily = this.loadDailyBucket();
      const weekEvents = this.loadPersistedLedgerEvents(now);
      const fiveHourCutoff = now - FIVE_HOURS_MS;
      const events5h = weekEvents.filter((ev) => Number(ev.ts || 0) >= fiveHourCutoff);

      const modelId = this.router?.getSelectedModelId?.() || DEFAULT_MODEL_FALLBACK_ID;
      const base =
        NS.modelAdvisor?.getQuotaBaselineForModel?.(modelId) || {
          tierLabel: 'Flash Balanced',
          shortTerm5hReqLimit: 250,
          shortTerm5hTokenLimit: 2500000,
          longTermWeeklyReqLimit: 1800,
          longTermWeeklyTokenLimit: 12000000,
          shortTermRpmLimit: 15,
          shortTermTpmLimit: 1000000,
          longTermRpdLimit: 500
        };

      const rpmUsed = this.minuteEvents.length;
      const tpmUsed = this.minuteEvents.reduce((sum, e) => sum + Number(e.tokens || 0), 0);
      const req5hUsed = events5h.length;
      const tok5hUsed = events5h.reduce((sum, e) => sum + Number(e.tokens || 0), 0);
      const reqWeekUsed = Math.max(weekEvents.length, daily.requestsCount);
      const tokWeekUsed = weekEvents.reduce((sum, e) => sum + Number(e.tokens || 0), 0) || daily.tokensTotal;

      const ms5hRecover =
        events5h.length > 0
          ? Math.max(60000, Number(events5h[0].ts || now) + FIVE_HOURS_MS - now)
          : FIVE_HOURS_MS;
      const msWeekReset = this.getMsUntilWeeklyBoundary(now);

      const cooldownSec =
        this.cooldownUntilMs > now ? Math.ceil((this.cooldownUntilMs - now) / 1000) : 0;

      const verifiedRec = this.router?.loadFlashLiteVerificationRecord?.();
      const transportNow =
        this.lastUsedTransport || verifiedRec?.transportType || 'Chưa chạy';
      const liveModelsCount = this.router?.liveProbe?.getCachedOrLiveModels?.().length || 0;

      const short5hLimit = Number(base.shortTerm5hReqLimit || 250);
      const weeklyLimit = Number(base.longTermWeeklyReqLimit || 1800);
      const isOverShortTerm = cooldownSec > 0 || req5hUsed >= short5hLimit;
      const isOverLongTerm = daily.exhaustedDaily || reqWeekUsed >= weeklyLimit;

      return {
        modelId,
        keyMask: this.getActiveKeyMask(),
        tierLabel: base.tierLabel,
        liveHeaders: this.liveRateLimitHeaders,
        shortTerm: {
          windowLabel: '5 Giờ',
          used5hReq: req5hUsed,
          limit5hReq: short5hLimit,
          used5hTokens: tok5hUsed,
          recover5hLabel: this.formatDurationVN(ms5hRecover),
          rpmUsed,
          rpmLimit: base.shortTermRpmLimit || 15,
          tpmUsed,
          tpmLimit: base.shortTermTpmLimit || 1000000,
          cooldownSec,
          limited: isOverShortTerm
        },
        longTerm: {
          windowLabel: 'Tuần (7 ngày)',
          ptDate: daily.ptDate,
          weeklyUsed: reqWeekUsed,
          weeklyLimit,
          weeklyTokens: tokWeekUsed,
          rpdUsed: Math.max(daily.requestsCount, reqWeekUsed),
          rpdLimit: weeklyLimit,
          dailyTokens: tokWeekUsed,
          resetInLabel: this.formatDurationVN(msWeekReset),
          exhausted: isOverLongTerm
        },
        transportType: transportNow,
        lastUsedEndpoint: this.lastUsedEndpoint || verifiedRec?.modelEndpoint || '',
        liveModelsCount,
        hasVerifiedKey: Boolean(this.router?.isCurrentKeyFlashLiteVerified?.()),
        rateLimitScope: this.lastRateLimitScope,
        rateLimitDetail: this.lastRateLimitDetail,
        links: NS.modelAdvisor?.getRealtimeGoogleLinks?.() || {
          apiKeyStudio: 'https://aistudio.google.com/app/apikey',
          usageDashboard: 'https://aistudio.google.com/usage',
          rateLimitDashboard: 'https://aistudio.google.com/rate-limit',
          rateLimitsDocs: 'https://ai.google.dev/gemini-api/docs/rate-limits',
          modelsCatalogDocs: 'https://ai.google.dev/gemini-api/docs/models',
          geminiWebApp: 'https://gemini.google.com/'
        }
      };
    }

    renderRealtimeQuotaWidget() {
      if (typeof document === 'undefined') return;
      const snap = this.getSnapshot();
      const esc = getUtils().escapeHtml;
      const host = document.getElementById('ai-realtime-quota-widget');
      const confirmBadge = document.getElementById('confirm-modal-quota-badge');
      const shortPct = Math.min(
        100,
        Math.round((snap.shortTerm.used5hReq / Math.max(1, snap.shortTerm.limit5hReq)) * 100)
      );
      const longPct = Math.min(
        100,
        Math.round((snap.longTerm.weeklyUsed / Math.max(1, snap.longTerm.weeklyLimit)) * 100)
      );
      const isLimited = snap.shortTerm.limited || snap.longTerm.exhausted;

      if (host) {
        const statusBadge = isLimited
          ? `<span class="px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/50 text-rose-300 font-extrabold text-[10px]">🔴 ${snap.longTerm.exhausted ? 'Chạm hạn mức tuần' : `Nghỉ ${snap.shortTerm.cooldownSec || 60}s`}</span>`
          : `<span class="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-[10px]">🟢 Key ${esc(snap.keyMask)} · Realtime OK</span>`;

        const hdrHint =
          snap.liveHeaders && snap.liveHeaders.remainingRequests !== null
            ? ` · còn ${snap.liveHeaders.remainingRequests} slot API`
            : '';

        host.innerHTML = [
          `<div class="flex flex-wrap items-center justify-between gap-1.5">`,
          `  <div class="flex items-center gap-1.5">${statusBadge}<span class="font-monoCode text-[10px] text-zinc-400">${esc(snap.transportType)} · ${snap.liveModelsCount} live${esc(hdrHint)}</span></div>`,
          `  <button type="button" id="btn-refresh-live-models-quota" class="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-emerald-600 text-[10px] font-bold text-emerald-300 hover:text-white transition" title="Quét lại danh sách mô hình sống & hạn mức theo API Key đang nối">🔄 Quét Live</button>`,
          `</div>`,
          `<div class="grid grid-cols-2 gap-1.5 text-[10px] font-monoCode">`,
          `  <div class="px-2 py-1 rounded-lg bg-zinc-950/90 border border-zinc-800" title="Hạn mức Ngắn hạn trong cửa sổ 5 giờ gắn trực tiếp với API Key & tài khoản Gemini của bạn">`,
          `    <div class="flex justify-between text-sky-300 font-bold"><span>⚡ Ngắn hạn (5h)</span><span>${snap.shortTerm.used5hReq}/${snap.shortTerm.limit5hReq} lượt</span></div>`,
          `    <div class="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-0.5"><div class="h-full ${shortPct >= 85 ? 'bg-rose-500' : 'bg-sky-400'}" style="width:${Math.max(4, shortPct)}%"></div></div>`,
          `    <div class="text-[9px] text-zinc-400 mt-0.5">${snap.shortTerm.used5hTokens.toLocaleString('vi-VN')} tok · ${snap.shortTerm.rpmUsed} RPM · Hồi: ${esc(snap.shortTerm.recover5hLabel)}</div>`,
          `  </div>`,
          `  <div class="px-2 py-1 rounded-lg bg-zinc-950/90 border border-zinc-800" title="Hạn mức Dài hạn theo Tuần (7 ngày) gắn với tài khoản & API Key đang dùng">`,
          `    <div class="flex justify-between text-amber-300 font-bold"><span>📅 Dài hạn (Tuần)</span><span>${snap.longTerm.weeklyUsed}/${snap.longTerm.weeklyLimit} lượt</span></div>`,
          `    <div class="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-0.5"><div class="h-full ${longPct >= 85 ? 'bg-rose-500' : 'bg-amber-400'}" style="width:${Math.max(4, longPct)}%"></div></div>`,
          `    <div class="text-[9px] text-zinc-400 mt-0.5">Reset tuần: ${esc(snap.longTerm.resetInLabel)} · ${snap.longTerm.weeklyTokens.toLocaleString('vi-VN')} tok (${snap.longTerm.rpdUsed} RPD)</div>`,
          `  </div>`,
          `</div>`,
          `<div class="flex flex-wrap items-center justify-between gap-1 text-[10px] pt-0.5">`,
          `  <a href="${esc(snap.links.usageDashboard || snap.links.rateLimitDashboard)}" target="_blank" rel="noopener noreferrer" class="text-emerald-300 hover:text-emerald-200 underline font-semibold">📊 Hạn mức AI Studio ↗</a>`,
          `  <a href="${esc(snap.links.rateLimitDashboard)}" target="_blank" rel="noopener noreferrer" class="text-teal-300 hover:text-teal-200 underline font-semibold">📈 Quota Key ↗</a>`,
          `  <a href="${esc(snap.links.modelsCatalogDocs)}" target="_blank" rel="noopener noreferrer" class="text-sky-300 hover:text-sky-200 underline font-semibold">🤖 Bảng Model Live ↗</a>`,
          `  <a href="${esc(snap.links.geminiWebApp)}" target="_blank" rel="noopener noreferrer" class="${isLimited ? 'px-1.5 py-0.5 rounded bg-rose-600/30 text-rose-200 font-bold border border-rose-500/40' : 'text-indigo-300 hover:text-indigo-200 underline font-semibold'}">🌐 Gemini Web${isLimited ? ' (Dùng thay khi hết hạn mức!)' : ' ↗'}</a>`,
          `</div>`
        ].join('');

        const refreshBtn = document.getElementById('btn-refresh-live-models-quota');
        if (refreshBtn && refreshBtn.dataset.mod15Bound !== '1') {
          refreshBtn.dataset.mod15Bound = '1';
          refreshBtn.addEventListener('click', async () => {
            refreshBtn.disabled = true;
            refreshBtn.textContent = '⏳ Đang quét...';
            try {
              const res = await this.router.liveProbe.probeKeyAndFetchLiveModels();
              if (res?.ok) {
                getUtils().showToast(
                  `🔄 Đã đồng bộ ${res.availableCount} mô hình sống real-time từ API Key của bạn!`,
                  'success'
                );
              } else {
                getUtils().showToast(`⚠️ ${res?.message || 'Không quét được danh sách mô hình.'}`, 'warn');
              }
            } finally {
              refreshBtn.disabled = false;
              this.renderRealtimeQuotaWidget();
            }
          });
        }
      }

      if (confirmBadge) {
        confirmBadge.innerHTML = `<span class="${isLimited ? 'text-rose-300' : 'text-emerald-300'} font-monoCode font-bold">⚡ Ngắn hạn (5h): ${snap.shortTerm.used5hReq}/${snap.shortTerm.limit5hReq} (${snap.shortTerm.rpmUsed} RPM) · 📅 Dài hạn (Tuần): ${snap.longTerm.weeklyUsed}/${snap.longTerm.weeklyLimit} (${snap.longTerm.rpdUsed} RPD)</span> <a href="${esc(snap.links.rateLimitDashboard)}" target="_blank" rel="noopener noreferrer" class="underline text-sky-300 ml-1">Xem Quota Account ↗</a>`;
      }
    }

    startAutoRefreshTimer() {
      if (this._timerId || typeof setInterval === 'undefined') return;
      this._timerId = setInterval(() => {
        const modal = document.getElementById('modal-fullscreen-ai-command');
        if (modal && !modal.classList.contains('hidden')) {
          this.renderRealtimeQuotaWidget();
        }
      }, 5000);
    }
  }

  // ==========================================================================
  // LỚP 8: ĐỘNG CƠ ĐỊNH TUYẾN GEMINI TRUNG TÂM (`NoirStudio.geminiRouter`)
  // ==========================================================================
  class ApiKeyVaultAndGeminiRouterEngine {
    constructor() {
      this.vaultMgr = new ApiKeyVaultAndRotationManager();
      this.ledger = new ApiExecutionLedgerAndDiagnostics();
      this.scheduler = new ZeroCongestionRequestScheduler(
        this.vaultMgr,
        this.ledger
      );
      this.modelSync = new UnifiedModelSelectorSyncAndGuard(this);
      this.vaultEnhancer = new ApiKeyVaultModalEnhancer(this);
      this.liveProbe = new GeminiLiveModelsInspectorAndProbe(
        this.vaultMgr,
        this.ledger
      );
      this.liveProbe.router = this;
      this.quotaTracker = new RealTimeQuotaTelemetryTracker(this);
      this._selectedModelId = this.loadSelectedModelIdFromStorage();
      this._thinkingLevel = this.loadThinkingLevelFromStorage();
      this._webSearchEnabled = this.loadWebSearchEnabledFromStorage();
      this.hasInitialized = false;
    }

    get selectedModelId() {
      return this._selectedModelId;
    }

    set selectedModelId(val) {
      this.setSelectedModel(val);
    }

    loadThinkingLevelFromStorage() {
      try {
        const v = String(localStorage.getItem(THINKING_LEVEL_STORAGE_KEY) || 'MEDIUM').toUpperCase();
        return ['MINIMAL', 'LOW', 'MEDIUM', 'HIGH', 'XHIGH'].includes(v) ? v : 'MEDIUM';
      } catch (_e) {
        return 'MEDIUM';
      }
    }

    getThinkingLevel() {
      return this._thinkingLevel || 'MEDIUM';
    }

    getThinkingLevelLabel(level = null) {
      const lvl = String(level || this.getThinkingLevel()).toUpperCase();
      if (lvl === 'MINIMAL') return 'Tối thiểu (Nhanh)';
      if (lvl === 'LOW') return 'Thấp (Gọn)';
      if (lvl === 'HIGH') return 'Cao (Sâu logic)';
      if (lvl === 'XHIGH') return 'Siêu cao · XHIGH (Tối đa Gemini 4)';
      return 'Trung bình (Cân bằng)';
    }

    setThinkingLevel(level) {
      const normalized = String(level || 'MEDIUM').trim().toUpperCase();
      const valid = ['MINIMAL', 'LOW', 'MEDIUM', 'HIGH', 'XHIGH'].includes(normalized)
        ? normalized
        : 'MEDIUM';
      this._thinkingLevel = valid;
      try {
        localStorage.setItem(THINKING_LEVEL_STORAGE_KEY, valid);
      } catch (_e) {}
      this.syncThinkingLevelControlsDOM();
      this.quotaTracker.renderRealtimeQuotaWidget();
      if (NS.bus && typeof NS.bus.emit === 'function') {
        NS.bus.emit('ai:thinking_changed', { thinkingLevel: valid });
      }
      return valid;
    }

    loadWebSearchEnabledFromStorage() {
      try {
        return localStorage.getItem(WEB_SEARCH_STORAGE_KEY) === 'true';
      } catch (_e) {
        return false;
      }
    }

    isWebSearchEnabled() {
      return Boolean(this._webSearchEnabled);
    }

    setWebSearchEnabled(flag) {
      this._webSearchEnabled = Boolean(flag);
      try {
        localStorage.setItem(WEB_SEARCH_STORAGE_KEY, this._webSearchEnabled ? 'true' : 'false');
      } catch (_e) {}
      const chk = document.getElementById('checkbox-ai-web-search');
      if (chk) chk.checked = this._webSearchEnabled;
      return this._webSearchEnabled;
    }

    syncThinkingLevelControlsDOM() {
      if (typeof document === 'undefined') return;
      const lvl = this.getThinkingLevel();
      [
        'select-ai-thinking-level',
        'confirm-modal-thinking-select',
        'chat-thinking-level-select',
        'mode5-thinking-level-select',
        'tab4-bible-thinking-select',
        'smart-approve-thinking-select'
      ].forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.value !== lvl) {
          const hasOpt = Array.from(el.options || []).some((o) => o.value === lvl);
          el.value = hasOpt ? lvl : 'HIGH';
        }
      });
      document.querySelectorAll('.ai-thinking-pill-btn[data-thinking-level]').forEach((btn) => {
        const isMatch = btn.getAttribute('data-thinking-level') === lvl;
        btn.classList.toggle('bg-cyan-600', isMatch);
        btn.classList.toggle('text-white', isMatch);
        btn.classList.toggle('border-cyan-400', isMatch);
        btn.classList.toggle('bg-zinc-900', !isMatch);
        btn.classList.toggle('text-zinc-400', !isMatch);
        btn.classList.toggle('border-zinc-700', !isMatch);
      });
      const chk = document.getElementById('checkbox-ai-web-search');
      if (chk) chk.checked = this.isWebSearchEnabled();
    }

    async init() {
      this._selectedModelId = this.loadSelectedModelIdFromStorage();
      this._thinkingLevel = this.loadThinkingLevelFromStorage();
      this._webSearchEnabled = this.loadWebSearchEnabledFromStorage();
      await this.restorePersistentKeyAndVerificationFromIdb();
      this.liveProbe.getCachedOrLiveModels();
      this.populateAllModelDropdowns();
      this.hydrateApiKeyInputFromVault();
      this.syncThinkingLevelControlsDOM();
      this.bindDOM();
      this.quotaTracker.renderRealtimeQuotaWidget();
      this.quotaTracker.startAutoRefreshTimer();
      if (!this._busQuotaBound && NS.bus && typeof NS.bus.on === 'function') {
        this._busQuotaBound = true;
        const refreshAll = () => {
          this.syncThinkingLevelControlsDOM();
          this.quotaTracker.renderRealtimeQuotaWidget();
        };
        NS.bus.on(NS.constants?.EVENTS?.API_KEY_VERIFIED || 'ai:api_key_verified', refreshAll);
        NS.bus.on(NS.constants?.EVENTS?.API_KEY_UPDATED || 'ai:api_key_updated', refreshAll);
        NS.bus.on(NS.constants?.EVENTS?.MODEL_CHANGED || 'ai:model_changed', refreshAll);
      }
      this.hasInitialized = true;
      return this;
    }

    async restorePersistentKeyAndVerificationFromIdb() {
      try {
        const keyName = getStorageKeys().API_KEY || 'noir_gemini_api_key';
        if (!this.vaultMgr.loadPrimaryKey() && NS.idb && typeof NS.idb.get === 'function') {
          const backupKey = await NS.idb.get('state_cache', IDB_API_KEY_BACKUP_KEY, '');
          const clean = this.vaultMgr.sanitizeKeyString(backupKey);
          if (clean) {
            this.vaultMgr.primaryKey = clean;
            try {
              localStorage.setItem(keyName, clean);
            } catch (_lsErr) {}
            writePersistCookieIfHttp(API_KEY_COOKIE_NAME, clean);
          }
        }
        if (!this.loadFlashLiteVerificationRecord() && NS.idb && typeof NS.idb.get === 'function') {
          const backupRec = await NS.idb.get('state_cache', IDB_VERIFIED_BACKUP_KEY, null);
          if (backupRec && typeof backupRec === 'object' && backupRec.keyDigest) {
            const serialized = JSON.stringify(backupRec);
            try {
              localStorage.setItem(GEMINI_FLASHLITE_VERIFIED_STORAGE_KEY, serialized);
            } catch (_lsErr) {}
            writePersistCookieIfHttp(VERIFIED_COOKIE_NAME, serialized);
          }
        }
      } catch (_e) {
        // Không làm gián đoạn khởi động
      }
    }

    loadSelectedModelIdFromStorage() {
      const storageKey =
        getStorageKeys().SELECTED_MODEL || 'noir_selected_gemini_model';
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored && this.getModelEntry(stored)) {
          return stored;
        }
      } catch (_) {}
      if (
        NS.modelAdvisor &&
        typeof NS.modelAdvisor.getDefaultRecommendedModel === 'function'
      ) {
        const rec = NS.modelAdvisor.getDefaultRecommendedModel();
        if (rec && rec.id) return rec.id;
      }
      return DEFAULT_MODEL_FALLBACK_ID;
    }

    getSelectedModelId() {
      return this._selectedModelId || DEFAULT_MODEL_FALLBACK_ID;
    }

    setSelectedModel(modelId) {
      const entry = this.getModelEntry(modelId);
      const resolved = entry ? entry.id : DEFAULT_MODEL_FALLBACK_ID;
      this._selectedModelId = resolved;
      const storageKey =
        getStorageKeys().SELECTED_MODEL || 'noir_selected_gemini_model';
      try {
        localStorage.setItem(storageKey, resolved);
      } catch (_) {}

      if (NS.state) {
        NS.state.selectedModelId = resolved;
      }
      this.modelSync.syncSelectionValueAcrossDOM(resolved);

      if (NS.bus && typeof NS.bus.emit === 'function') {
        NS.bus.emit(
          NS.constants?.EVENTS?.MODEL_CHANGED || 'ai:model_changed',
          { modelId: resolved, isLite: this.modelSync.isFlashLiteModel(resolved) }
        );
      }
      return resolved;
    }

    getModelEntry(modelId) {
      return this.modelSync.getModelEntry(modelId);
    }

    isLiteModel(modelId) {
      return this.modelSync.isFlashLiteModel(modelId || this._selectedModelId);
    }

    updateLiteWarningBanner(modelId) {
      return this.modelSync.updateLiteWarningBanner(
        modelId || this._selectedModelId
      );
    }

    populateAllModelDropdowns() {
      return this.modelSync.populateAllDropdowns(this._selectedModelId);
    }

    computeKeyDigest(rawKey) {
      return computeGeminiKeyDigest(rawKey);
    }

    getLowestFlashLiteVerifyChain() {
      return [
        'gemini-2.5-flash-lite',
        'gemini-2.5-flash-lite-preview-09-2025',
        'gemini-2.0-flash-lite',
        'gemini-2.0-flash-lite-001',
        'gemini-3.5-flash-lite',
        'gemini-3.1-flash-lite-preview',
        'gemini-1.5-flash-8b',
        'gemini-2.5-flash',
        'gemini-2.0-flash'
      ];
    }

    loadFlashLiteVerificationRecord() {
      return readSavedVerifiedRecord();
    }

    saveFlashLiteVerificationRecord(
      rawKey,
      modelEndpoint,
      latencyMs = 0,
      transportType = 'AI_STUDIO_QUERY'
    ) {
      const clean = this.vaultMgr.sanitizeKeyString(rawKey);
      if (!clean || !modelEndpoint) return null;
      setRuntimeTransportForKey(clean, transportType);
      const rec = {
        keyDigest: this.computeKeyDigest(clean),
        keyLast4: clean.slice(-4),
        modelEndpoint: String(modelEndpoint),
        transportType: String(transportType || 'AI_STUDIO_QUERY'),
        verifiedAt: Date.now(),
        latencyMs: Number(latencyMs) || 0
      };
      try {
        const serialized = JSON.stringify(rec);
        localStorage.setItem(
          GEMINI_FLASHLITE_VERIFIED_STORAGE_KEY,
          serialized
        );
        writePersistCookieIfHttp(VERIFIED_COOKIE_NAME, serialized);
        if (NS.idb && typeof NS.idb.set === 'function') {
          NS.idb.set('state_cache', IDB_VERIFIED_BACKUP_KEY, rec).catch(() => {});
        }
      } catch (_e) {
        // Bỏ qua lỗi quota localStorage
      }
      return rec;
    }

    clearFlashLiteVerificationRecord() {
      this.vaultMgr.lastVerifiedAt = 0;
      this.vaultMgr.lastVerificationSummary = null;
      try {
        localStorage.removeItem('noir_gemini_flashlite_verified_v1');
        writePersistCookieIfHttp(VERIFIED_COOKIE_NAME, '');
        if (NS.idb && typeof NS.idb.delete === 'function') {
          NS.idb.delete('state_cache', IDB_VERIFIED_BACKUP_KEY).catch(() => {});
        }
      } catch (_e) {
        // Bỏ qua
      }
    }

    getApiKey() {
      if (!this.vaultMgr.primaryKey) {
        this.vaultMgr.primaryKey = this.vaultMgr.loadPrimaryKey();
      }
      return this.vaultMgr.primaryKey;
    }

    getEffectiveActiveKey() {
      const primary = this.vaultMgr.sanitizeKeyString(this.getApiKey());
      if (primary) return primary;
      const candidates = this.vaultMgr.getCandidateKeysForRequest();
      if (Array.isArray(candidates) && candidates.length > 0) {
        return this.vaultMgr.sanitizeKeyString(candidates[0].key || '');
      }
      return '';
    }

    isCurrentKeyFlashLiteVerified() {
      const activeKey = this.getEffectiveActiveKey();
      if (!activeKey) return false;
      const rec = this.loadFlashLiteVerificationRecord();
      if (!rec || !rec.keyDigest || !rec.modelEndpoint) return false;
      return rec.keyDigest === this.computeKeyDigest(activeKey);
    }

    saveApiKey(rawKey) {
      const prevKey = this.vaultMgr.sanitizeKeyString(this.getApiKey());
      const nextKey = this.vaultMgr.sanitizeKeyString(rawKey);
      const ok = this.vaultMgr.savePrimaryKey(nextKey);
      if (prevKey !== nextKey || !nextKey) {
        this.clearFlashLiteVerificationRecord();
        if (NS.bus && typeof NS.bus.emit === 'function') {
          NS.bus.emit(
            NS.constants?.EVENTS?.API_KEY_VERIFIED || 'ai:api_key_verified',
            {
              verified: false,
              modelEndpoint: '',
              hasKey: Boolean(this.getEffectiveActiveKey())
            }
          );
        }
      }
      this.hydrateApiKeyInputFromVault();
      if (NS.bus && typeof NS.bus.emit === 'function') {
        NS.bus.emit(
          NS.constants?.EVENTS?.API_KEY_UPDATED || 'ai:api_key_updated',
          {
            hasKey: Boolean(this.getEffectiveActiveKey()),
            hasPrimaryKey: Boolean(this.getApiKey())
          }
        );
      }
      return ok;
    }

    hydrateApiKeyInputFromVault() {
      const input = document.getElementById('input-gemini-api-key');
      const gateInput = document.getElementById('gate-input-gemini-api-key');
      const statusBox = document.getElementById('apikey-verify-status');
      const currentKey = this.getApiKey();
      if (input && input.value !== currentKey) {
        input.value = currentKey;
      }
      if (gateInput && gateInput.value !== currentKey) {
        gateInput.value = currentKey;
      }
      const isVerified = this.isCurrentKeyFlashLiteVerified();
      const rec = isVerified ? this.loadFlashLiteVerificationRecord() : null;
      if (statusBox && currentKey) {
        if (isVerified && rec) {
          statusBox.innerHTML = `<span class="text-emerald-300 font-bold">✅ Khóa (${this.vaultMgr.maskKeyForDisplay(
            currentKey
          )}) đã xác thực qua ${getUtils().escapeHtml(rec.modelEndpoint)} (${
            rec.latencyMs || 0
          }ms).</span>`;
        } else if (!this.vaultMgr.lastVerifiedAt) {
          statusBox.textContent = `🔒 Đã nạp khóa cục bộ (${this.vaultMgr.maskKeyForDisplay(
            currentKey
          )}). Đang chờ xác thực tự động qua Gemini Flash-Lite...`;
        }
      } else if (statusBox && !currentKey) {
        statusBox.textContent =
          'Chưa có khóa API nào được lưu. Mở Google AI Studio để lấy khóa.';
      }
    }

    openApiKeyModal() {
      return this.openApiKeyVaultModal();
    }

    openApiKeyVaultModal() {
      const modal = document.getElementById('modal-api-key-vault');
      if (!modal) return false;
      this.hydrateApiKeyInputFromVault();
      this.vaultEnhancer.ensureVaultExtrasMounted();
      modal.classList.remove('hidden');
      const input = document.getElementById('input-gemini-api-key');
      if (input) setTimeout(() => input.focus(), 40);
      return true;
    }

    closeApiKeyVaultModal() {
      const modal = document.getElementById('modal-api-key-vault');
      if (modal) modal.classList.add('hidden');
    }

    async verifyKeyWithLowestFlashLite(explicitKey = null, options = {}) {
      const { autoSave = true, emitEvents = true } = options;
      const candidate = this.vaultMgr.sanitizeKeyString(
        explicitKey !== null ? explicitKey : this.getEffectiveActiveKey()
      );
      if (!candidate) {
        this.clearFlashLiteVerificationRecord();
        if (emitEvents && NS.bus && typeof NS.bus.emit === 'function') {
          NS.bus.emit(
            NS.constants?.EVENTS?.API_KEY_VERIFIED || 'ai:api_key_verified',
            { verified: false, modelEndpoint: '', hasKey: false }
          );
        }
        return {
          ok: false,
          verified: false,
          empty: true,
          message: 'Chưa nhập Gemini API Key.'
        };
      }

      if (autoSave && candidate !== this.getApiKey()) {
        this.saveApiKey(candidate);
      }

      const formatCheck = this.vaultMgr.isPlausibleGeminiKeyFormat(candidate);
      if (!formatCheck.valid) {
        this.clearFlashLiteVerificationRecord();
        this.hydrateApiKeyInputFromVault();
        if (emitEvents && NS.bus && typeof NS.bus.emit === 'function') {
          NS.bus.emit(
            NS.constants?.EVENTS?.API_KEY_VERIFIED || 'ai:api_key_verified',
            {
              verified: false,
              modelEndpoint: '',
              hasKey: Boolean(candidate),
              error: formatCheck.reason
            }
          );
        }
        return {
          ok: false,
          verified: false,
          message: formatCheck.reason
        };
      }

      const discoveredModels = await this.liveProbe.discoverLiveFlashLiteModels(candidate);
      const endpoints = Array.from(
        new Set([...discoveredModels, ...this.getLowestFlashLiteVerifyChain()].filter(Boolean))
      );
      const transportOrder = getTransportOrderForKey(candidate);

      let bestHttpError = null;
      let lastNetworkError = null;

      for (const transportType of transportOrder) {
        for (const ep of endpoints) {
          const reqSpec = buildGeminiEndpointRequestSpec({
            endpointModel: ep,
            apiKey: candidate,
            transportType,
            action: 'generateContent',
            isStream: false
          });
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), 14000);
          const started = Date.now();
          try {
            const res = await fetch(reqSpec.url, {
              method: 'POST',
              headers: reqSpec.headers,
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: 'Ping' }] }],
                generationConfig: { maxOutputTokens: 8, temperature: 0 }
              }),
              signal: ctrl.signal
            });
            const latencyMs = Date.now() - started;
            const bodyText = await res.text();
            let data = null;
            try {
              data = bodyText ? JSON.parse(bodyText) : null;
            } catch (_e) {
              data = null;
            }

            if (res.ok && !data?.error) {
              const replyPreview = String(
                data?.candidates?.[0]?.content?.parts?.[0]?.text || 'OK'
              )
                .trim()
                .slice(0, 60);
              const rec = this.saveFlashLiteVerificationRecord(
                candidate,
                ep,
                latencyMs,
                transportType
              );
              this.vaultMgr.lastVerifiedAt = rec?.verifiedAt || Date.now();
              this.hydrateApiKeyInputFromVault();
              if (emitEvents && NS.bus && typeof NS.bus.emit === 'function') {
                NS.bus.emit(
                  NS.constants?.EVENTS?.API_KEY_VERIFIED || 'ai:api_key_verified',
                  {
                    verified: true,
                    modelEndpoint: ep,
                    transportType,
                    latencyMs,
                    keyLast4: candidate.slice(-4)
                  }
                );
              }
              return {
                ok: true,
                verified: true,
                modelEndpoint: ep,
                transportType,
                transportLabel: reqSpec.transportLabel,
                latencyMs,
                replyPreview,
                message: `Đã xác thực API Key qua ${ep} (${reqSpec.transportLabel}, ${latencyMs}ms).`
              };
            }

            const errMsg =
              data?.error?.message || bodyText || `HTTP ${res.status} từ ${ep}`;
            const httpErrInfo = {
              status: res.status,
              modelEndpoint: ep,
              transportType,
              transportLabel: reqSpec.transportLabel,
              rawMessage: errMsg
            };
            if (!bestHttpError || bestHttpError.status === 404) {
              bestHttpError = httpErrInfo;
            }

            // Nếu lỗi xác thực/quyền/key không hợp lệ trên cổng vận chuyển này -> đổi sang transport kế tiếp ngay
            if (res.status === 400 || res.status === 401 || res.status === 403) {
              break;
            }
          } catch (err) {
            lastNetworkError = {
              networkError: true,
              modelEndpoint: ep,
              transportType,
              transportLabel: reqSpec.transportLabel,
              rawMessage:
                err?.name === 'AbortError'
                  ? `Hết thời gian chờ khi gọi ${ep}`
                  : err?.message || 'Lỗi mạng/CORS'
            };
            // Nếu trình duyệt chặn CORS header x-goog-api-key trên transport này -> chuyển transport kế tiếp ngay
            if (!reqSpec.isVertex && transportType.includes('HEADER')) {
              break;
            }
            if (reqSpec.isVertex) {
              break;
            }
          } finally {
            clearTimeout(timer);
          }
        }
      }

      const finalMessage = buildVerifyFailureMessage(
        candidate,
        bestHttpError,
        lastNetworkError
      );
      const lastFailure = {
        ok: false,
        verified: false,
        status: bestHttpError?.status || 0,
        networkError: !bestHttpError && Boolean(lastNetworkError),
        modelEndpoint: bestHttpError?.modelEndpoint || lastNetworkError?.modelEndpoint || '',
        rawDetail: bestHttpError?.rawMessage || lastNetworkError?.rawMessage || '',
        message: finalMessage
      };

      this.clearFlashLiteVerificationRecord();
      this.hydrateApiKeyInputFromVault();
      if (emitEvents && NS.bus && typeof NS.bus.emit === 'function') {
        NS.bus.emit(
          NS.constants?.EVENTS?.API_KEY_VERIFIED || 'ai:api_key_verified',
          {
            verified: false,
            modelEndpoint: '',
            hasKey: Boolean(candidate),
            error: lastFailure.message
          }
        );
      }
      return lastFailure;
    }

    async verifyApiKeyConnection(explicitKey = null) {
      const input = document.getElementById('input-gemini-api-key');
      const statusBox = document.getElementById('apikey-verify-status');
      const btn = document.getElementById('btn-save-and-verify-apikey');

      const candidate = this.vaultMgr.sanitizeKeyString(
        explicitKey !== null ? explicitKey : input?.value || this.getApiKey()
      );

      this.saveApiKey(candidate);

      if (!candidate) {
        if (statusBox) {
          statusBox.innerHTML =
            '<span class="text-amber-300 font-bold">⚠️ Đã xóa khóa API khỏi bộ nhớ máy. Nhập khóa AIza... hoặc AQ... mới bất cứ lúc nào.</span>';
        }
        getUtils().showToast('Đã xóa API Key khỏi két sắt cục bộ.', 'info');
        return { ok: false, cleared: true };
      }

      if (btn) {
        btn.disabled = true;
        btn.textContent = '⏳ Đang xác thực Flash-Lite...';
      }
      if (statusBox) {
        statusBox.innerHTML =
          '<span class="text-sky-300">⏳ Đang xác thực khóa API với mô hình Gemini Flash-Lite thấp nhất...</span>';
      }

      try {
        const flashResult = await this.verifyKeyWithLowestFlashLite(candidate, {
          autoSave: false,
          emitEvents: true
        });
        if (flashResult.ok) {
          let probeSummary = null;
          try {
            probeSummary = await this.liveProbe.probeKeyAndFetchLiveModels(
              candidate
            );
          } catch (_e) {
            probeSummary = null;
          }
          const combined = {
            ...flashResult,
            sampleModels: probeSummary?.sampleModels || [flashResult.modelEndpoint],
            warningNote: probeSummary?.warningNote || ''
          };
          this.vaultMgr.lastVerificationSummary = combined;
          const esc = getUtils().escapeHtml;
          if (statusBox) {
            statusBox.innerHTML = [
              `<div class="text-emerald-300 font-bold">✅ ${esc(flashResult.message)}</div>`,
              combined.sampleModels?.length
                ? `<div class="text-[10px] text-zinc-400 mt-1">Mẫu endpoint khả dụng: <span class="font-monoCode text-emerald-200">${esc(
                    combined.sampleModels.join(', ')
                  )}</span></div>`
                : '',
              combined.warningNote
                ? `<div class="text-[10px] text-amber-300 mt-1">⚠️ ${esc(
                    combined.warningNote
                  )}</div>`
                : ''
            ].join('');
          }
          getUtils().showToast(
            `✅ Đã xác thực API Key qua ${flashResult.modelEndpoint}!`,
            'success'
          );
          this.vaultEnhancer.refreshExtrasPanel();
          return combined;
        }
        if (statusBox) {
          statusBox.innerHTML = `<span class="text-rose-300 font-bold">❌ ${getUtils().escapeHtml(
            flashResult.message
          )}</span>`;
        }
        getUtils().showToast(`⚠️ ${flashResult.message}`, 'warn');
        this.vaultEnhancer.refreshExtrasPanel();
        return flashResult;
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = '💾 Lưu & Xác Thực Flash-Lite';
        }
      }
    }

    async generateTextWithFallback(argOrOpts, maybeOpts = null) {
      const normalizedOpts =
        typeof argOrOpts === 'string'
          ? Object.assign({}, maybeOpts || {}, {
              prompt: argOrOpts,
              modelId: (maybeOpts && (maybeOpts.modelId || maybeOpts.preferredModelId || maybeOpts.model)) || null
            })
          : argOrOpts && typeof argOrOpts === 'object'
            ? argOrOpts
            : {};
      const {
        prompt,
        systemInstruction = '',
        modelId = null,
        temperature = 0.78,
        maxOutputTokens = 8192,
        thinkingLevel = '',
        enableWebSearch = null,
        stopSignal = null
      } = normalizedOpts;
      const targetModel = modelId || normalizedOpts.model || normalizedOpts.preferredModelId || this.getSelectedModelId();
      const targetThinking = thinkingLevel || this.getThinkingLevel();
      const targetWebSearch =
        enableWebSearch !== null ? Boolean(enableWebSearch) : this.isWebSearchEnabled();
      if (!prompt || String(prompt).trim().length === 0) {
        throw new Error('Nội dung Prompt gửi tới AI đang trống.');
      }

      const budget = this.liveProbe.estimatePayloadBudgetBeforeSend(
        prompt,
        systemInstruction,
        targetModel
      );
      if (NS.logger && typeof NS.logger.info === 'function') {
        NS.logger.info('mod15: dispatch generateTextWithFallback', {
          modelId: targetModel,
          thinkingLevel: targetThinking,
          webSearch: targetWebSearch,
          approxTokens: budget.approxInputTokens
        });
      }

      return this.scheduler.runWithFallback({
        prompt,
        systemInstruction,
        modelId: targetModel,
        temperature,
        maxOutputTokens,
        thinkingLevel: targetThinking,
        enableWebSearch: targetWebSearch,
        stopSignal
      });
    }

    cancelAllPendingCalls() {
      return this.scheduler.abortAllPendingRequests();
    }

    bindDOM() {
      const bindOnce =
        typeof NS.bindOnce === 'function'
          ? NS.bindOnce.bind(NS)
          : (el, ev, fn) => {
              const t = typeof el === 'string' ? document.getElementById(el) : el;
              if (t) t.addEventListener(ev, fn);
            };

      bindOnce(
        'btn-s6-card-apikey',
        'click',
        () => this.openApiKeyVaultModal(),
        'mod15_open_apikey_modal'
      );

      bindOnce(
        'btn-close-apikey-modal',
        'click',
        () => this.closeApiKeyVaultModal(),
        'mod15_close_apikey_modal'
      );

      bindOnce(
        'btn-toggle-show-apikey',
        'click',
        () => {
          const inp = document.getElementById('input-gemini-api-key');
          if (!inp) return;
          inp.type = inp.type === 'password' ? 'text' : 'password';
        },
        'mod15_toggle_apikey_visibility'
      );

      bindOnce(
        'btn-save-and-verify-apikey',
        'click',
        () => this.verifyApiKeyConnection(),
        'mod15_save_and_verify_apikey'
      );

      for (const selId of this.modelSync.selectorIds) {
        bindOnce(
          selId,
          'change',
          (ev) => {
            const nextModel = ev.target?.value || DEFAULT_MODEL_FALLBACK_ID;
            const resolved = this.setSelectedModel(nextModel);
            this.quotaTracker.renderRealtimeQuotaWidget();
            const entry = this.getModelEntry(resolved);
            if (selId === 'confirm-modal-model-select') {
              if (this.isLiteModel(resolved)) {
                getUtils().showToast(
                  '💡 Khuyến cáo: Dòng Flash-Lite phù hợp nháp ngắn; viết chương chính thức nên dùng từ Gemini Flash trở lên!',
                  'warn',
                  3800
                );
              } else {
                getUtils().showToast(
                  `🤖 Đã chọn mô hình thực thi: ${entry?.id || resolved}`,
                  'info',
                  2200
                );
              }
            }
          },
          `mod15_sync_${selId}`
        );
      }

      // Đồng bộ Mức Độ Tư Duy (Thấp / Trung bình / Cao / XHIGH / Tối thiểu) realtime tới API Key & tất cả Tab/Modal
      [
        'select-ai-thinking-level',
        'confirm-modal-thinking-select',
        'chat-thinking-level-select',
        'mode5-thinking-level-select',
        'tab4-bible-thinking-select',
        'smart-approve-thinking-select'
      ].forEach(
        (thId) => {
          bindOnce(
            thId,
            'change',
            (ev) => {
              const lvl = this.setThinkingLevel(ev.target?.value || 'MEDIUM');
              getUtils().showToast(
                `🧠 Mức độ tư duy AI: ${this.getThinkingLevelLabel(lvl)} (Đã đồng bộ API Key)`,
                'info',
                1900
              );
            },
            `mod15_thinking_${thId}`
          );
        }
      );

      if (typeof document !== 'undefined') {
        document.querySelectorAll('.ai-thinking-pill-btn[data-thinking-level]').forEach((btn) => {
          if (btn.dataset.mod15ThinkingBound === '1') return;
          btn.dataset.mod15ThinkingBound = '1';
          btn.addEventListener('click', () => {
            const lvl = this.setThinkingLevel(btn.getAttribute('data-thinking-level') || 'MEDIUM');
            getUtils().showToast(
              `🧠 Mức độ tư duy: ${this.getThinkingLevelLabel(lvl)}`,
              'info',
              1700
            );
          });
        });
      }

      bindOnce(
        'checkbox-ai-web-search',
        'change',
        (ev) => {
          const on = this.setWebSearchEnabled(Boolean(ev.target?.checked));
          getUtils().showToast(
            on
              ? '🌐 Đã bật tìm kiếm Google Search Real-time khi chạy Gemini!'
              : '🔌 Đã tắt tìm kiếm web (chỉ dùng ngữ cảnh Story Bible & bản thảo).',
            'info',
            2200
          );
        },
        'mod15_toggle_web_search'
      );

      bindOnce(
        'btn-cancel-blocking-loader',
        'click',
        () => {
          const aborted = this.cancelAllPendingCalls();
          getUtils().hideBlockingLoader();
          if (aborted > 0) {
            getUtils().showToast(
              '🛑 Đã hủy kết nối AI đang chờ theo yêu cầu.',
              'warn'
            );
          }
        },
        'mod15_cancel_inflight_loader'
      );
    }

    getHealthReport() {
      return {
        module: 'mod15_api_key_vault_and_zero_congestion_client.js',
        initialized: this.hasInitialized,
        hasPrimaryKey: Boolean(this.getApiKey()),
        hasEffectiveKey: Boolean(this.getEffectiveActiveKey()),
        isFlashLiteVerified: this.isCurrentKeyFlashLiteVerified(),
        backupKeysCount: this.vaultMgr.backupKeys.length,
        selectedModelId: this.getSelectedModelId(),
        isLiteSelected: this.isLiteModel(),
        ledgerSummary: this.ledger.getSummaryStats()
      };
    }
  }

  // ==========================================================================
  // LỚP 9: BỘ ĐỌC LUỒNG SSE STREAMING THEO THỜI GIAN THỰC (:streamGenerateContent)
  // ==========================================================================
  class GeminiSSEStreamDecoderClient {
    constructor(router) {
      this.router = router;
    }

    async streamGenerateText({
      prompt,
      systemInstruction = '',
      modelId = null,
      temperature = 0.78,
      maxOutputTokens = 8192,
      thinkingLevel = '',
      enableWebSearch = null,
      onChunk = null,
      stopSignal = null
    }) {
      const targetModel = modelId || this.router.getSelectedModelId();
      const targetThinking = thinkingLevel || this.router.getThinkingLevel();
      const targetWebSearch =
        enableWebSearch !== null ? Boolean(enableWebSearch) : this.router.isWebSearchEnabled();
      const candidateKeys = this.router.vaultMgr.getCandidateKeysForRequest();
      if (candidateKeys.length === 0) {
        throw new Error(
          'Chưa có Gemini API Key. Hãy mở Tab 6 -> Cấu hình Gemini API Key trước khi chạy.'
        );
      }

      const endpoints = this.router.scheduler.getModelEndpointChain(targetModel);
      const activeKey = candidateKeys[0].key;
      const endpoint = endpoints[0] || DEFAULT_MODEL_FALLBACK_ID;
      const payload = this.router.scheduler.adapter.buildGenerateContentPayload({
        prompt,
        systemInstruction,
        temperature,
        maxOutputTokens,
        thinkingLevel: targetThinking,
        endpointModel: endpoint,
        enableWebSearch: targetWebSearch
      });

      const bestTransport = getTransportOrderForKey(activeKey)[0];
      const streamSpec = buildGeminiEndpointRequestSpec({
        endpointModel: endpoint,
        apiKey: activeKey,
        transportType: bestTransport,
        action: 'streamGenerateContent',
        isStream: true
      });

      const ctrl = new AbortController();
      this.router.scheduler.inFlightAbortControllers.add(ctrl);
      const onExt = () => ctrl.abort(stopSignal?.reason);
      if (stopSignal) {
        if (stopSignal.aborted) throw new Error('Đã hủy theo yêu cầu.');
        stopSignal.addEventListener('abort', onExt, { once: true });
      }

      const started = Date.now();
      let accumulatedText = '';

      try {
        const res = await fetch(streamSpec.url, {
          method: 'POST',
          headers: streamSpec.headers,
          body: JSON.stringify(payload),
          signal: ctrl.signal
        });

        if (!res.ok || !res.body) {
          // Nếu luồng SSE bị từ chối hoặc trình duyệt hạn chế ReadableStream, rơi về call thường
          return this.router.generateTextWithFallback({
            prompt,
            systemInstruction,
            modelId: targetModel,
            temperature,
            maxOutputTokens,
            thinkingLevel: targetThinking,
            enableWebSearch: targetWebSearch,
            stopSignal
          });
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let lineBuffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          lineBuffer += decoder.decode(value, { stream: true });

          const lines = lineBuffer.split('\n');
          lineBuffer = lines.pop() || '';

          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line.startsWith('data:')) continue;
            const jsonStr = line.slice(5).trim();
            if (!jsonStr || jsonStr === '[DONE]') continue;

            try {
              const evtObj = JSON.parse(jsonStr);
              const parts = evtObj?.candidates?.[0]?.content?.parts || [];
              const chunkText = parts
                .filter((p) => typeof p?.text === 'string')
                .map((p) => p.text)
                .join('');
              if (chunkText) {
                accumulatedText += chunkText;
                if (typeof onChunk === 'function') {
                  onChunk(chunkText, accumulatedText);
                }
              }
            } catch (_) {}
          }
        }

        if (!accumulatedText.trim()) {
          return this.router.generateTextWithFallback({
            prompt,
            systemInstruction,
            modelId: targetModel,
            temperature,
            maxOutputTokens,
            thinkingLevel: targetThinking,
            enableWebSearch: targetWebSearch,
            stopSignal
          });
        }

        const durationMs = Date.now() - started;
        const outWords = getUtils().countVietnameseWords(accumulatedText);
        this.router.ledger.recordCall({
          requestedModel: targetModel,
          usedEndpoint: endpoint,
          keyLabel: candidateKeys[0].label,
          status: 'SUCCESS',
          httpStatus: 200,
          durationMs,
          promptChars: String(prompt || '').length,
          outputWords: outWords
        });

        return {
          text: accumulatedText,
          modelId: targetModel,
          usedEndpoint: endpoint,
          fromFallback: false,
          durationMs
        };
      } finally {
        this.router.scheduler.inFlightAbortControllers.delete(ctrl);
        if (stopSignal) {
          stopSignal.removeEventListener('abort', onExt);
        }
      }
    }
  }

  // ==========================================================================
  // LỚP 10: CỐ VẤN QUOTA, TẦN SUẤT GỌI & BẢNG NHẬT KÝ TRỰC QUAN TRONG MODAL KEY
  // ==========================================================================
  class GeminiQuotaCoachAndCallLedgerUI {
    constructor(router) {
      this.router = router;
    }

    evaluateCurrentSessionPace() {
      const ledger = this.router.ledger.entries || [];
      const now = Date.now();
      const oneMinuteAgo = now - 60000;
      const fifteenMinutesAgo = now - 900000;

      const callsLastMin = ledger.filter((e) => e.timestamp >= oneMinuteAgo).length;
      const callsLast15Min = ledger.filter(
        (e) => e.timestamp >= fifteenMinutesAgo
      ).length;
      const rateLimitHits = ledger.filter(
        (e) => e.timestamp >= fifteenMinutesAgo && e.httpStatus === 429
      ).length;

      let statusLabel = 'Rất thông thoáng';
      let advice =
        'Tần suất gọi AI hoàn toàn khỏe mạnh, hầu như không có nguy cơ đụng giới hạn RPM.';

      if (rateLimitHits >= 2) {
        statusLabel = 'Đang căng giới hạn (429)';
        advice =
          'Bạn vừa chạm giới hạn quota miễn phí liên tiếp. Gợi ý: thêm 1 Key dự phòng vào Két sắt hoặc đợi khoảng 45 giây rồi chạy tiếp.';
      } else if (callsLastMin >= 8) {
        statusLabel = 'Nhịp gọi khá cao';
        advice =
          'Bạn đang gọi nhiều lượt trong 1 phút. Hãy gộp các câu lệnh nhỏ thành 1 Prompt Tổng Hợp để tiết kiệm quota tối đa.';
      }

      return {
        callsLastMin,
        callsLast15Min,
        rateLimitHits,
        statusLabel,
        advice
      };
    }

    buildLedgerHtmlTable(limit = 6) {
      const entries = (this.router.ledger.entries || []).slice(0, limit);
      const esc = getUtils().escapeHtml;
      if (entries.length === 0) {
        return '<div class="text-[10px] text-zinc-500 italic">Chưa ghi nhận lượt gọi Gemini API nào trong phiên làm việc này.</div>';
      }

      return [
        '<div class="max-h-36 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950/90 divide-y divide-zinc-800/80">',
        ...entries.map((e) => {
          const timeStr = new Date(e.timestamp).toLocaleTimeString('vi-VN');
          const okBadge =
            e.status === 'SUCCESS'
              ? '<span class="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">OK</span>'
              : `<span class="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">HTTP ${e.httpStatus || 'ERR'}</span>`;
          return [
            '<div class="px-2.5 py-1.5 flex items-center justify-between gap-2 text-[10px]">',
            `  <div class="flex items-center gap-1.5 min-w-0 truncate">${okBadge} <span class="font-monoCode text-zinc-200 truncate">${esc(e.usedEndpoint)}</span></div>`,
            `  <div class="font-monoCode text-zinc-400 shrink-0">${e.durationMs}ms · ${e.outputWords} từ · ${esc(timeStr)}</div>`,
            '</div>'
          ].join('');
        }),
        '</div>'
      ].join('\n');
    }

    mountDiagnosticLedgerWidget() {
      const panel = document.getElementById('apikey-vault-extras-panel');
      if (!panel) return;
      let widget = document.getElementById('apikey-ledger-diagnostic-box');
      if (!widget) {
        widget = document.createElement('div');
        widget.id = 'apikey-ledger-diagnostic-box';
        widget.className = 'pt-2 border-t border-zinc-800 space-y-1.5';
        panel.appendChild(widget);
      }

      const pace = this.evaluateCurrentSessionPace();
      const esc = getUtils().escapeHtml;
      widget.innerHTML = [
        '<div class="flex items-center justify-between">',
        '  <span class="font-bold uppercase text-[10px] text-sky-300">📡 Nhật Ký Kết Nối Gemini Gần Nhất</span>',
        `  <span class="text-[10px] font-semibold text-zinc-400">${esc(pace.statusLabel)} (${pace.callsLast15Min} lượt/15p)</span>`,
        '</div>',
        this.buildLedgerHtmlTable(5),
        `<div class="text-[10px] text-zinc-400">${esc(pace.advice)}</div>`
      ].join('\n');
    }

    async runMultiKeyPingBenchmark() {
      const keys = this.router.vaultMgr.getCandidateKeysForRequest();
      const results = [];
      for (const kObj of keys) {
        const probe = await this.router.liveProbe.probeKeyAndFetchLiveModels(
          kObj.key
        );
        results.push({
          label: kObj.label,
          masked: this.router.vaultMgr.maskKeyForDisplay(kObj.key),
          ok: probe.ok,
          latencyMs: probe.latencyMs || 0,
          message: probe.message
        });
      }
      return results;
    }
  }

  // Nối thêm bảng nhật ký kết nối vào Két sắt API Key mỗi lần mở/refresh
  const origRefreshExtras = ApiKeyVaultModalEnhancer.prototype.refreshExtrasPanel;
  ApiKeyVaultModalEnhancer.prototype.refreshExtrasPanel = function () {
    origRefreshExtras.call(this);
    if (this.router.quotaCoach) {
      this.router.quotaCoach.mountDiagnosticLedgerWidget();
    }
  };

  // ==========================================================================
  // LỚP 11: CỐ VẤN TRÁNH LỌC NHẦM AN TOÀN VĂN HỌC & BẢNG PHÂN CẤP DỰ PHÒNG
  // ==========================================================================
  const LITERARY_SAFETY_REPHRASE_HINTS = Object.freeze([
    {
      pattern: /(tự sát|tự tử|kết liễu đời mình|treo cổ|cắt cổ tay)/gi,
      suggestion: 'rời bỏ cuộc chơi giữa đêm tối / chạm tới bờ vực tuyệt vọng không lối về'
    },
    {
      pattern: /(tra tấn dã man|xẻ thịt|chặt tay chân|máu me be bét)/gi,
      suggestion: 'những vết hằn tàn khốc của cuộc thẩm vấn / mùi tanh kim loại đặc quánh trong căn hầm ẩm'
    },
    {
      pattern: /(cưỡng hiếp|xâm hại tình dục|hiếp dâm)/gi,
      suggestion: 'sự xâm phạm thô bạo / ký ức tổn thương không thể cất thành lời'
    },
    {
      pattern: /(chế tạo bom|thuốc nổ quân dụng|chất độc chết người)/gi,
      suggestion: 'thứ hỗn hợp nguy hiểm được giấu dưới đáy hòm gỗ / cơ chế kích nổ bí mật'
    }
  ]);

  class GeminiSafetyAndEndpointResilienceAdvisor {
    constructor(router) {
      this.router = router;
    }

    scanPromptForSafetyFalsePositiveRisk(promptText) {
      const text = String(promptText || '');
      const matched = [];
      for (const rule of LITERARY_SAFETY_REPHRASE_HINTS) {
        if (rule.pattern.test(text)) {
          rule.pattern.lastIndex = 0;
          const m = text.match(rule.pattern);
          matched.push({
            triggerSample: m ? m[0] : '',
            saferLiteraryAlternative: rule.suggestion
          });
        }
      }
      return {
        hasRisk: matched.length > 0,
        findings: matched,
        recommendation:
          matched.length > 0
            ? 'Trong tiểu thuyết trinh thám/kinh dị, dùng ngôn từ gợi tả gián tiếp giúp văn chương tinh tế hơn và tránh bộ lọc an toàn tự động.'
            : 'Văn bản đầu vào sạch sẽ, an toàn cho mọi cấp mô hình.'
      };
    }

    buildFallbackChainPreviewForModel(modelId) {
      const targetId = modelId || this.router.getSelectedModelId();
      const chain = this.router.scheduler.getModelEndpointChain(targetId);
      const isLite = this.router.isLiteModel(targetId);
      return {
        requestedModelId: targetId,
        isLiteModel: isLite,
        qualityTierNote: isLite
          ? 'Cảnh báo: Đang dùng Flash-Lite (chỉ khuyến nghị để viết nháp nhanh).'
          : 'Đạt chuẩn chất lượng văn học (Flash / Pro / Argon trở lên).',
        fallbackEndpoints: chain,
        formattedSummary: chain
          .map((ep, idx) => (idx === 0 ? `① Chính: ${ep}` : `↳ Dự phòng #${idx}: ${ep}`))
          .join('  →  ')
      };
    }

    formatDiagnosticsReportForUser() {
      const stats = this.router.ledger.getSummaryStats();
      const chainInfo = this.buildFallbackChainPreviewForModel();
      const hasPrimary = Boolean(this.router.getApiKey());
      const backupCount = this.router.vaultMgr.backupKeys.length;
      const lines = [
        '=== BÁO CÁO TRẠNG THÁI ĐỊNH TUYẾN GEMINI API ===',
        `- API Key chính: ${hasPrimary ? this.router.vaultMgr.maskKeyForDisplay(this.router.getApiKey()) : 'Chưa thiết lập'}`,
        `- Số Key dự phòng sẵn sàng: ${backupCount}`,
        `- Mô hình mặc định đang chọn: ${chainInfo.requestedModelId}`,
        `- Khuyến nghị chất lượng: ${chainInfo.qualityTierNote}`,
        `- Chuỗi trượt tự động chống nghẽn: ${chainInfo.formattedSummary}`,
        `- Tổng lượt gọi phiên bản: ${stats.successCalls}/${stats.totalCalls} thành công · Tốc độ TB: ${stats.avgLatencyMs}ms`
      ];
      return lines.join('\n');
    }

    clearHistoryLedger() {
      this.router.ledger.entries = [];
      try {
        localStorage.removeItem(API_CALL_HISTORY_LOG_KEY);
      } catch (_) {}
      if (this.router.vaultEnhancer.mounted) {
        this.router.vaultEnhancer.refreshExtrasPanel();
      }
      return true;
    }
  }

  // ==========================================================================
  // LỚP 12: CẢM BIẾN TRẠNG THÁI MẠNG & GỢI Ý MÔ HÌNH TỐI ƯU THEO CHẾ ĐỘ AI
  // ==========================================================================
  class NetworkReconnectAndModeRecommender {
    constructor(router) {
      this.router = router;
      this.isOnline =
        typeof navigator !== 'undefined' ? navigator.onLine !== false : true;
      this.offlineSince = this.isOnline ? 0 : Date.now();
      this.listenersBound = false;
    }

    attachNetworkListeners() {
      if (this.listenersBound || typeof window === 'undefined') return;
      this.listenersBound = true;

      window.addEventListener('online', () => {
        this.isOnline = true;
        this.offlineSince = 0;
        if (NS.bus && typeof NS.bus.emit === 'function') {
          NS.bus.emit('network:restored', { timestamp: Date.now() });
        }
        getUtils().showToast(
          '🌐 Đã khôi phục kết nối mạng — AI Gemini sẵn sàng chạy lại bình thường!',
          'success',
          2600
        );
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.offlineSince = Date.now();
        if (NS.bus && typeof NS.bus.emit === 'function') {
          NS.bus.emit('network:lost', { timestamp: Date.now() });
        }
        getUtils().showToast(
          '✈️ Đang mất kết nối Internet — Bạn vẫn viết truyện & lưu tự động offline 100% nhé!',
          'warn',
          3200
        );
      });
    }

    recommendBestModelForExecutionMode(modeKey) {
      const mapping = {
        MODE_1_DRAFT: {
          preferredId: 'gemini-3.8-flash',
          alternativeId: 'gemini-4-argon',
          reason:
            'Chế độ viết bản thảo cần cảm xúc tự nhiên, đối thoại sống động và sức bền trên 3.000+ từ — Gemini 3.8 Flash / Argon cho chất lượng rất ổn định.'
        },
        MODE_2_BRAINSTORM: {
          preferredId: 'gemini-4-hydrogen',
          alternativeId: 'gemini-3.1-pro-preview',
          reason:
            'Tham mưu cốt truyện và bẻ lái nhiều tầng nên ưu tiên Gemini 4 Hydrogen (tư duy Cao/XHIGH), 3.1 Pro hoặc 3.8 Flash để không bị ý tưởng lối mòn.'
        },
        MODE_3_AUDIT: {
          preferredId: 'gemini-4-hydrogen',
          alternativeId: 'gemini-4-carbon',
          reason:
            'Kiểm toán logic đòi hỏi suy luận khắt khe và bắt lỗ hổng dòng thời gian — dòng Gemini 4 Hydrogen (XHIGH), Carbon hoặc Pro soi cực kỳ kỹ.'
        },
        MODE_4_REVIEW: {
          preferredId: 'gemini-3.8-flash',
          alternativeId: 'gemini-4-hydrogen',
          reason:
            'Hội đồng độc giả beta đánh giá đa chiều mượt mà và chi tiết trên Gemini 3.8 Flash / Gemini 4 Hydrogen trở lên.'
        },
        MODE_5_DIAGRAM: {
          preferredId: 'gemini-4-hydrogen',
          alternativeId: 'gemini-3.8-flash',
          reason:
            'Vẽ biểu đồ cốt truyện Mode 5 cần xuất chuẩn cấu trúc JSON nodes/edges và phát hiện xung đột giờ giấc.'
        }
      };

      const picked = mapping[modeKey] || mapping.MODE_1_DRAFT;
      const entry =
        this.router.getModelEntry(picked.preferredId) ||
        this.router.getModelEntry(picked.alternativeId);

      return {
        modeKey,
        recommendedModelId: entry ? entry.id : DEFAULT_MODEL_FALLBACK_ID,
        reason: picked.reason
      };
    }

    ensureOnlineOrThrow() {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        throw new Error(
          'Thiết bị đang ngoại tuyến (Offline). Dữ liệu bản thảo vẫn được tự động lưu an toàn trên máy; hãy bật Wi-Fi/4G khi cần gọi Gemini.'
        );
      }
      return true;
    }
  }

  // ==========================================================================
  // ĐĂNG KÝ SINGLETON LÊN `window.NoirStudio.geminiRouter`
  // ==========================================================================
  const geminiRouterEngine = new ApiKeyVaultAndGeminiRouterEngine();
  geminiRouterEngine.streamClient = new GeminiSSEStreamDecoderClient(
    geminiRouterEngine
  );
  geminiRouterEngine.quotaCoach = new GeminiQuotaCoachAndCallLedgerUI(
    geminiRouterEngine
  );
  geminiRouterEngine.resilienceAdvisor =
    new GeminiSafetyAndEndpointResilienceAdvisor(geminiRouterEngine);
  geminiRouterEngine.networkObserver = new NetworkReconnectAndModeRecommender(
    geminiRouterEngine
  );

  geminiRouterEngine.streamGenerateText = (opts) =>
    geminiRouterEngine.streamClient.streamGenerateText(opts);
  geminiRouterEngine.checkSafetyFalsePositive = (txt) =>
    geminiRouterEngine.resilienceAdvisor.scanPromptForSafetyFalsePositiveRisk(txt);
  geminiRouterEngine.getDiagnosticsText = () =>
    geminiRouterEngine.resilienceAdvisor.formatDiagnosticsReportForUser();
  geminiRouterEngine.recommendModelForMode = (modeKey) =>
    geminiRouterEngine.networkObserver.recommendBestModelForExecutionMode(modeKey);

  geminiRouterEngine.showGeminiWebFallbackNoticeModal = ({
    promptText = '',
    modelId = '',
    errorMessage = '',
    onFallbackFlashRetry = null
  } = {}) => {
    if (typeof document === 'undefined' || !document.body) return;
    const existing = document.getElementById('modal-gemini-web-fallback-copy');
    if (existing) existing.remove();

    const safePrompt = String(promptText || '').trim();
    const modelLabel =
      geminiRouterEngine.getModelEntry?.(modelId)?.shortLabel ||
      modelId ||
      'Gemini Pro / Argon 4';

    const overlay = document.createElement('div');
    overlay.id = 'modal-gemini-web-fallback-copy';
    overlay.className =
      'fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5';
    overlay.innerHTML = `
      <div class="w-full max-w-2xl rounded-2xl border-2 border-amber-500/60 bg-zinc-900 shadow-2xl overflow-hidden text-xs">
        <div class="px-5 py-3.5 border-b border-zinc-800 bg-amber-950/50 flex items-center justify-between gap-2">
          <button type="button" id="btn-close-gemini-fallback-notice" class="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shrink-0">
            ✕ Đóng
          </button>
          <h3 class="font-extrabold text-sm text-amber-300 flex-1">
            ⚠️ Mô hình "${(NS.uiUtils?.escapeHtml || ((s) => String(s)))(modelLabel)}" hiện không chạy được qua API Key
          </h3>
        </div>
        <div class="p-5 space-y-4 text-zinc-200 leading-relaxed">
          <div class="p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-[13px] space-y-2">
            <p>
              Hiện tại mô hình bạn chọn không dùng được qua khóa API (do hết hạn mức, hạn chế vùng/tài khoản hoặc dự án Cloud chưa mở quyền).
            </p>
            <p class="text-zinc-100 font-semibold">
              👉 Cách xử lý nhanh trong 3 giây: Hãy bấm để copy
              <button type="button" id="btn-inline-copy-fallback-prompt" class="underline decoration-2 decoration-emerald-400 text-emerald-300 hover:text-emerald-200 font-extrabold cursor-pointer px-1">
                câu lệnh dưới đây
              </button>
              để dán trực tiếp vào
              <a href="https://gemini.google.com/app" target="_blank" rel="noopener noreferrer" class="px-2 py-0.5 rounded-lg bg-indigo-500/30 border border-indigo-400/60 text-indigo-200 hover:bg-indigo-500/50 font-extrabold underline inline-flex items-center gap-1">
                <span>✨ Gemini của bạn ↗</span>
              </a>
              !
            </p>
          </div>
          ${
            errorMessage
              ? `<div class="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] text-rose-300 font-monoCode">Chi tiết kỹ thuật: ${(
                  NS.uiUtils?.escapeHtml || ((s) => String(s))
                )(String(errorMessage).slice(0, 260))}</div>`
              : ''
          }
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold uppercase text-emerald-400">📋 Toàn văn câu lệnh đã tổng hợp sẵn để bạn dán sang Gemini Web:</span>
              <span id="fallback-copy-badge" class="text-[11px] font-bold text-zinc-400">Bấm nút "câu lệnh dưới đây" hoặc khung dưới để chép</span>
            </div>
            <textarea id="textarea-gemini-web-fallback-prompt" readonly rows="7" class="w-full p-3 rounded-xl border border-zinc-700 bg-zinc-950 text-zinc-200 font-monoCode text-[11px] select-text focus:outline-none focus:border-emerald-500"></textarea>
          </div>
          <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div class="flex flex-wrap items-center gap-2">
              <button type="button" id="btn-modal-copy-fallback-prompt" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow transition">
                📋 Copy Toàn Bộ Câu Lệnh Ngay
              </button>
              <a href="https://gemini.google.com/app" target="_blank" rel="noopener noreferrer" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow transition">
                🌐 Mở Gemini Của Bạn (Web) ↗
              </a>
            </div>
            ${
              typeof onFallbackFlashRetry === 'function'
                ? '<button type="button" id="btn-fallback-retry-flash38" class="px-3.5 py-2 rounded-xl border border-emerald-500/50 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-extrabold transition">⚡ Chạy thử bằng Gemini 3.8 Flash</button>'
                : ''
            }
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    const ta = document.getElementById('textarea-gemini-web-fallback-prompt');
    if (ta) ta.value = safePrompt || '(Chưa có nội dung câu lệnh)';

    const copyAction = async () => {
      try {
        await navigator.clipboard.writeText(safePrompt);
      } catch (_e) {
        if (ta) {
          ta.select();
          try {
            document.execCommand('copy');
          } catch (_e2) {}
        }
      }
      const badge = document.getElementById('fallback-copy-badge');
      if (badge) {
        badge.textContent = '✅ Đã copy toàn bộ câu lệnh vào khay nhớ tạm!';
        badge.className = 'text-[11px] font-extrabold text-emerald-400';
      }
      NS.uiUtils?.showToast?.(
        '📋 Đã copy toàn văn câu lệnh! Bạn hãy dán vào Gemini của bạn (gemini.google.com) nhé.',
        'success',
        3600
      );
    };

    document.getElementById('btn-close-gemini-fallback-notice')?.addEventListener('click', () => overlay.remove());
    document.getElementById('btn-inline-copy-fallback-prompt')?.addEventListener('click', copyAction);
    document.getElementById('btn-modal-copy-fallback-prompt')?.addEventListener('click', copyAction);
    document.getElementById('btn-fallback-retry-flash38')?.addEventListener('click', () => {
      overlay.remove();
      if (typeof onFallbackFlashRetry === 'function') onFallbackFlashRetry();
    });
  };

  const origInitRouter = ApiKeyVaultAndGeminiRouterEngine.prototype.init;
  ApiKeyVaultAndGeminiRouterEngine.prototype.init = function () {
    origInitRouter.call(this);
    if (this.networkObserver) {
      this.networkObserver.attachNetworkListeners();
    }
    return this;
  };

  NS.geminiRouter = geminiRouterEngine;
  NS.ApiKeyVaultAndGeminiRouterEngine = ApiKeyVaultAndGeminiRouterEngine;

  if (typeof NS.registerModule === 'function') {
    NS.registerModule('mod15', geminiRouterEngine);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        if (!geminiRouterEngine.hasInitialized) geminiRouterEngine.init();
      });
    } else {
      geminiRouterEngine.init();
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
