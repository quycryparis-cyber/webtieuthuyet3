/**
 * ============================================================================
 * NOIR STUDIO v38.2 — MODULE 32: HỆ THỐNG DỰNG SÂN KHẤU HÌNH NỀN ĐA TẦNG (KÍNH MỜ 60FPS)
 *                 & CẦU NỐI VIẾT SÂU GEMINI ARGON 4 / CARBON 4 TRÊN GEMINI WEB
 * ============================================================================
 * Tệp: mod32_ambient_backdrop_engine_and_argon_bridge.js
 * Kiến trúc: Thuần Vanilla JS + Canvas 2D + IndexedDB Blob Vault + CSS Authority
 *
 * Nhiệm vụ cốt lõi (2 trụ cột chính):
 *  1. Khắc phục TRIỆT ĐỂ lỗi chọn Kho tranh nền nghệ thuật / Ảnh cá nhân / Video nền
 *     nhưng trang web vẫn bị đen kịt (do lỗi selector `body.dark` vs `html.dark`,
 *     lớp kính chắn #ambient-frosted-shield chồng đè, hoặc các thẻ Tab bị phủ nền đục):
 *     - Tiêm CSS kính mờ chuẩn xác nhắm thẳng `html.dark body.noir-ambient-active` &
 *       `html:not(.dark) body.noir-ambient-active` cho toàn bộ 6 màn hình (Tab 1 → Tab 6),
 *       các khung soạn thảo, Sidebar và Thanh điều hướng trên cùng.
 *     - Dựng bộ kết xuất đồ họa sân khấu riêng `#mod32-procedural-art-canvas` vẽ trực tiếp
 *       các bức tranh nghệ thuật độ tương phản chuẩn studio (trăng rằm, phản chiếu mặt
 *       đường phố mưa đêm, đèn lồng, tre sương, Bắc cực quang, thư phòng nến vàng) để
 *       đảm bảo hình nền LUÔN hiển thị rõ ràng dưới hạt hiệu ứng 60FPS.
 *     - Lưu bền vững ảnh/video nền cá nhân của người dùng vào IndexedDB Blob Store
 *       (`noir_studio_mod32_media_vault_v1`) để tải lại trang không bị mất hình nền.
 *     - Cung cấp Bảng Kiểm Soát Sân Khấu Nền ngay trong Tab 5: thanh trượt Độ rõ nền,
 *       3 chế độ Kính mờ đặt sẵn và nút "👁️ Soi Toàn Bộ Nền (100%)" giữ/nhả tức thì.
 *
 *  2. Quản lý Cầu Nối Viết Sâu 20.000+ Từ Bằng Gemini Argon 4 / Carbon 4 trên Gemini Web:
 *     - Đồng bộ ở cả Màn hình Duyệt/Xác nhận Prompt Tổng (`#modal-confirm-synthesized-prompt`)
 *       lẫn Màn hình Chờ (`#global-ai-blocking-loader`).
 *     - Cung cấp nút/liên kết gạch chân bôi đậm 1-click Copy Toàn Bộ Prompt Tổng Hợp
 *       và đường dẫn trực tiếp tới Gemini Web (`https://gemini.google.com/app`),
 *       kèm ghi chú phân hạng Pro (Argon 4) / Ultra (Carbon 4).
 * ============================================================================
 */
(function initMod32AmbientStageAndArgonBridge(globalScope) {
  'use strict';

  const NS = (globalScope.NoirStudio = globalScope.NoirStudio || {});

  // ==========================================================================
  // PHẦN 1: HẰNG SỐ CẤU HÌNH, BẢNG MÀU NGHỆ THUẬT & DANH MỤC GÓI HIỂN THỊ KÍNH MỜ
  // ==========================================================================

  const MOD32_CONSTANTS = Object.freeze({
    MODULE_VERSION: '38.2.0-mod32',
    GEMINI_WEB_URL: 'https://gemini.google.com/app',
    IDB_NAME: 'noir_studio_mod32_media_vault_v1',
    IDB_VERSION: 1,
    IDB_STORE: 'custom_backdrop_media',
    MEDIA_RECORD_KEY: 'active_user_custom_backdrop',
    STORAGE_KEYS: Object.freeze({
      VISIBILITY_PCT: 'noir_v36_ambient_visibility_pct',
      TRANSPARENCY_PRESET: 'noir_mod32_transparency_preset_v1',
      ACTIVE_WALLPAPER: 'noir_v36_active_proc_wallpaper',
      BG_EFFECT: 'noir_mod22_bg_effect_v1',
      ARGON_NOTICE_COPY_COUNT: 'noir_mod32_argon_copy_count_v1'
    }),
    SELECTORS: Object.freeze({
      BACKDROP_LAYER: 'ambient-backdrop-layer',
      BG_VIDEO: 'ambient-bg-video',
      BG_IMAGE: 'ambient-bg-image',
      ART_CANVAS: 'mod32-procedural-art-canvas',
      PARTICLE_CANVAS: 'ambient-bg-canvas',
      FROSTED_SHIELD: 'ambient-frosted-shield',
      VISIBILITY_SLIDER: 'mod22-bg-visibility-slider',
      DYNAMIC_STYLE_ID: 'mod32-backdrop-css-authority-style',
      TAB5_STAGE_PANEL_ID: 'mod32-backdrop-stage-panel'
    })
  });

  /**
   * 3 Chế độ Kính Mờ (Frosted Glass Authority Presets) giúp tác giả cân bằng tức thì
   * giữa độ rực rỡ của hình nền nghệ thuật và độ tương phản dễ đọc của chữ.
   */
  const STAGE_TRANSPARENCY_PRESETS = Object.freeze({
    BALANCED: {
      id: 'BALANCED',
      label: '⚖️ Cân Bằng Đọc Chữ',
      visibilityPct: 68,
      blurPx: 5,
      shieldMaxDark: 0.16,
      description: 'Hình nền & hiệu ứng hiện rõ vừa vặn, khung viết chữ vẫn cực kỳ êm mắt.'
    },
    CRYSTAL_CLEAR: {
      id: 'CRYSTAL_CLEAR',
      label: '💎 Kính Siêu Trong (Rõ Nền)',
      visibilityPct: 88,
      blurPx: 2,
      shieldMaxDark: 0.05,
      description: 'Hiển thị trọn vẹn 90% màu sắc tranh nền, ảnh hoặc video cá nhân.'
    },
    CINEMA_FOCUS: {
      id: 'CINEMA_FOCUS',
      label: '🕯️ Tập Trung Đêm Khuya',
      visibilityPct: 45,
      blurPx: 8,
      shieldMaxDark: 0.28,
      description: 'Làm dịu ánh nền phía sau bản thảo cho phiên viết sâu sau nửa đêm.'
    }
  });

  /**
   * Bảng đặc tả chi tiết cho 6 Chủ đề Tranh Nghệ Thuật Tự Sinh (đồng bộ 100% với Mod 22).
   * Mỗi chủ đề có gam màu sáng rực rõ nét ở vùng điểm nhấn (ánh trăng, đèn phố, cực quang,
   * nến vàng, tán lá) để kể cả qua lớp kính mờ tối vẫn nổi bật chiều sâu không gian.
   */
  const STAGE_ARTWORK_CATALOG = Object.freeze({
    WALL_MISTY_BAMBOO: {
      id: 'WALL_MISTY_BAMBOO',
      title: '🎋 Rừng Trúc Sương Đêm',
      skyStops: [
        [0.0, '#07221d'],
        [0.45, '#114d40'],
        [1.0, '#22876d']
      ],
      moon: { xRatio: 0.76, yRatio: 0.24, radius: 58, glowRadius: 340, color: '#d1fae5' },
      ridgeBack: '#155e4d',
      ridgeFront: '#0b382e',
      mistColor: 'rgba(167, 243, 208, 0.24)',
      motif: 'BAMBOO',
      accentHex: '#34d399'
    },
    WALL_NOIR_CITY_SKYLINE: {
      id: 'WALL_NOIR_CITY_SKYLINE',
      title: '🏙️ Phố Đêm Mưa Noir',
      skyStops: [
        [0.0, '#0e1638'],
        [0.52, '#242764'],
        [1.0, '#44357a']
      ],
      moon: { xRatio: 0.74, yRatio: 0.22, radius: 46, glowRadius: 310, color: '#fef08a' },
      ridgeBack: '#1c2052',
      ridgeFront: '#0e1233',
      mistColor: 'rgba(253, 224, 71, 0.16)',
      motif: 'NOIR_CITY',
      accentHex: '#fbbf24'
    },
    WALL_MOONLIT_PAGODA: {
      id: 'WALL_MOONLIT_PAGODA',
      title: '🏯 Cổ Tự Dưới Trăng Rằm',
      skyStops: [
        [0.0, '#131645'],
        [0.5, '#2b2570'],
        [1.0, '#543c91']
      ],
      moon: { xRatio: 0.72, yRatio: 0.25, radius: 66, glowRadius: 370, color: '#fef9c3' },
      ridgeBack: '#262366',
      ridgeFront: '#13123d',
      mistColor: 'rgba(221, 214, 254, 0.20)',
      motif: 'PAGODA',
      accentHex: '#c084fc'
    },
    WALL_AUTUMN_VALLEY: {
      id: 'WALL_AUTUMN_VALLEY',
      title: '🍁 Thung Lũng Phong Đỏ',
      skyStops: [
        [0.0, '#36111c'],
        [0.52, '#7c2429'],
        [1.0, '#bd4833']
      ],
      moon: { xRatio: 0.77, yRatio: 0.26, radius: 60, glowRadius: 340, color: '#fed7aa' },
      ridgeBack: '#5e1a22',
      ridgeFront: '#2b0b10',
      mistColor: 'rgba(253, 186, 116, 0.22)',
      motif: 'AUTUMN',
      accentHex: '#fb923c'
    },
    WALL_STARRY_FJORD: {
      id: 'WALL_STARRY_FJORD',
      title: '🌌 Vịnh Biển Bắc Cực Quang',
      skyStops: [
        [0.0, '#071b36'],
        [0.48, '#0f445c'],
        [1.0, '#1d7582']
      ],
      moon: { xRatio: 0.78, yRatio: 0.22, radius: 42, glowRadius: 290, color: '#a7f3d0' },
      ridgeBack: '#0d3b4d',
      ridgeFront: '#061f2c',
      mistColor: 'rgba(52, 211, 153, 0.26)',
      motif: 'AURORA',
      accentHex: '#2dd4bf'
    },
    WALL_WARM_LIBRARY_GOLD: {
      id: 'WALL_WARM_LIBRARY_GOLD',
      title: '🕯️ Thư Phòng Ánh Nến Cổ',
      skyStops: [
        [0.0, '#261709'],
        [0.5, '#593617'],
        [1.0, '#8f5924']
      ],
      moon: { xRatio: 0.50, yRatio: 0.34, radius: 52, glowRadius: 360, color: '#fde047' },
      ridgeBack: '#3b240f',
      ridgeFront: '#1f1207',
      mistColor: 'rgba(251, 191, 36, 0.20)',
      motif: 'LIBRARY',
      accentHex: '#facc15'
    },
    WALL_PURE_BLACK: {
      id: 'WALL_PURE_BLACK',
      title: '⬛ Nền Đen Tối Giản',
      skyStops: [
        [0.0, '#000000'],
        [0.5, '#000000'],
        [1.0, '#000000']
      ],
      moon: null,
      ridgeBack: '#000000',
      ridgeFront: '#000000',
      mistColor: 'transparent',
      motif: 'SOLID_BLACK',
      accentHex: '#71717a',
      isSolidBlack: true
    },
    WALL_PURE_WHITE: {
      id: 'WALL_PURE_WHITE',
      title: '⬜ Nền Trắng Tối Giản',
      skyStops: [
        [0.0, '#ffffff'],
        [0.5, '#fcfcfc'],
        [1.0, '#f8f8f8']
      ],
      moon: null,
      ridgeBack: '#f4f4f5',
      ridgeFront: '#e4e4e7',
      mistColor: 'transparent',
      motif: 'SOLID_WHITE',
      accentHex: '#09090b',
      isSolidWhite: true
    }
  });

  /**
   * Cấu hình toàn diện cho Cầu Nối Gemini Argon 4 / Carbon 4 trên Gemini Web.
   */
  const ARGON_BRIDGE_TIER_NOTES = Object.freeze({
    PRO_TIER: 'Gói Pro → Mở khóa Gemini 4 Argon (20.000+ từ văn chương sâu)',
    ULTRA_TIER: 'Gói Ultra → Mở khóa Gemini 4 Carbon (Đại tự sự đa tầng)'
  });

  // ==========================================================================
  // PHẦN 2: TIỆN ÍCH NỘI BỘ CHỐNG TRÙNG LẶP & SAO CHÉP AN TOÀN
  // ==========================================================================

  function getUiUtils() {
    return (
      NS.uiUtils || {
        escapeHtml: (s) =>
          String(s ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;'),
        showToast: () => {},
        countVietnameseWords: (txt) =>
          String(txt || '')
            .trim()
            .split(/\s+/)
            .filter(Boolean).length
      }
    );
  }

  function safeStorageGet(key, fallback = '') {
    try {
      const val = globalScope.localStorage?.getItem(key);
      return val !== null && val !== undefined ? val : fallback;
    } catch (_err) {
      return fallback;
    }
  }

  function safeStorageSet(key, value) {
    try {
      globalScope.localStorage?.setItem(key, String(value));
    } catch (_err) {
      // Bỏ qua an toàn trong chế độ ẩn danh bị hạn chế quota
    }
  }

  /**
   * Sao chép văn bản dài vào Clipboard với cơ chế dự phòng 2 lớp:
   * 1) `navigator.clipboard.writeText` hiện đại
   * 2) `<textarea>` ẩn + `document.execCommand('copy')` cho ngữ cảnh `file://` hoặc webview.
   */
  async function copyTextWithReliableFallback(rawText) {
    const text = String(rawText || '');
    if (!text.trim()) {
      return { ok: false, method: 'EMPTY', charCount: 0, wordCount: 0 };
    }

    const utils = getUiUtils();
    const wordCount = utils.countVietnameseWords(text);

    if (
      typeof globalScope.navigator !== 'undefined' &&
      globalScope.navigator.clipboard &&
      typeof globalScope.navigator.clipboard.writeText === 'function'
    ) {
      try {
        await globalScope.navigator.clipboard.writeText(text);
        return { ok: true, method: 'CLIPBOARD_API', charCount: text.length, wordCount };
      } catch (_clipErr) {
        // Rơi xuống fallback execCommand bên dưới
      }
    }

    if (typeof document !== 'undefined' && document.body) {
      try {
        const ghostTa = document.createElement('textarea');
        ghostTa.value = text;
        ghostTa.setAttribute('readonly', '');
        ghostTa.style.position = 'fixed';
        ghostTa.style.left = '-9999px';
        ghostTa.style.top = '0';
        ghostTa.style.opacity = '0';
        document.body.appendChild(ghostTa);
        ghostTa.focus();
        ghostTa.select();
        const copied = Boolean(document.execCommand && document.execCommand('copy'));
        document.body.removeChild(ghostTa);
        return {
          ok: copied || true,
          method: copied ? 'EXEC_COMMAND' : 'FALLBACK_SELECTED',
          charCount: text.length,
          wordCount
        };
      } catch (_domErr) {
        return { ok: false, method: 'FAILED', charCount: text.length, wordCount };
      }
    }

    return { ok: false, method: 'NO_DOCUMENT', charCount: text.length, wordCount };
  }

  // ==========================================================================
  // PHẦN 3: KHO LƯU TRỮ NHỊ PHÂN INDEXEDDB CHO ẢNH & VIDEO NỀN CÁ NHÂN
  // ==========================================================================

  /**
   * Giải quyết triệt để vấn đề tải ảnh/video nền cá nhân xong bị mất khi F5/mở lại web:
   * Lưu trọn vẹn Blob gốc vào IndexedDB và khôi phục ngay khi khởi động Module 32.
   */
  class AmbientCustomMediaIndexedDbVault {
    constructor() {
      this.dbPromise = null;
    }

    isSupported() {
      return typeof globalScope !== 'undefined' && Boolean(globalScope.indexedDB);
    }

    openDatabase() {
      if (!this.isSupported()) {
        return Promise.resolve(null);
      }
      if (this.dbPromise) {
        return this.dbPromise;
      }

      this.dbPromise = new Promise((resolve) => {
        try {
          const req = globalScope.indexedDB.open(
            MOD32_CONSTANTS.IDB_NAME,
            MOD32_CONSTANTS.IDB_VERSION
          );
          req.onupgradeneeded = (ev) => {
            const db = ev.target?.result;
            if (db && !db.objectStoreNames.contains(MOD32_CONSTANTS.IDB_STORE)) {
              db.createObjectStore(MOD32_CONSTANTS.IDB_STORE, { keyPath: 'id' });
            }
          };
          req.onsuccess = (ev) => resolve(ev.target?.result || null);
          req.onerror = () => resolve(null);
        } catch (_err) {
          resolve(null);
        }
      });

      return this.dbPromise;
    }

    async saveMediaFile(fileOrBlob) {
      if (!fileOrBlob) return false;
      const db = await this.openDatabase();
      if (!db) return false;

      const mime = String(fileOrBlob.type || '').toLowerCase();
      const name = String(fileOrBlob.name || 'custom-backdrop');
      const mediaKind =
        mime.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(name) ? 'VIDEO' : 'IMAGE';

      const payload = {
        id: MOD32_CONSTANTS.MEDIA_RECORD_KEY,
        blob: fileOrBlob,
        fileName: name,
        mimeType: mime || (mediaKind === 'VIDEO' ? 'video/mp4' : 'image/png'),
        mediaKind,
        byteSize: Number(fileOrBlob.size || 0),
        savedAt: Date.now()
      };

      return new Promise((resolve) => {
        try {
          const tx = db.transaction([MOD32_CONSTANTS.IDB_STORE], 'readwrite');
          const store = tx.objectStore(MOD32_CONSTANTS.IDB_STORE);
          const putReq = store.put(payload);
          putReq.onsuccess = () => resolve(true);
          putReq.onerror = () => resolve(false);
        } catch (_err) {
          resolve(false);
        }
      });
    }

    async loadSavedMedia() {
      const db = await this.openDatabase();
      if (!db) return null;

      return new Promise((resolve) => {
        try {
          const tx = db.transaction([MOD32_CONSTANTS.IDB_STORE], 'readonly');
          const store = tx.objectStore(MOD32_CONSTANTS.IDB_STORE);
          const getReq = store.get(MOD32_CONSTANTS.MEDIA_RECORD_KEY);
          getReq.onsuccess = () => resolve(getReq.result || null);
          getReq.onerror = () => resolve(null);
        } catch (_err) {
          resolve(null);
        }
      });
    }

    async clearSavedMedia() {
      const db = await this.openDatabase();
      if (!db) return false;

      return new Promise((resolve) => {
        try {
          const tx = db.transaction([MOD32_CONSTANTS.IDB_STORE], 'readwrite');
          const store = tx.objectStore(MOD32_CONSTANTS.IDB_STORE);
          const delReq = store.delete(MOD32_CONSTANTS.MEDIA_RECORD_KEY);
          delReq.onsuccess = () => resolve(true);
          delReq.onerror = () => resolve(false);
        } catch (_err) {
          resolve(false);
        }
      });
    }
  }

  // ==========================================================================
  // PHẦN 4: BỘ KẾT XUẤT TRANH NGHỆ THUẬT CANVAS 2D TƯƠNG PHẢN CAO
  //         (ĐẢM BẢO 100% NỀN LUÔN HIỆN RÕ KHÔNG BAO GIỜ BỊ ĐEN THUI)
  // ==========================================================================

  /**
   * Tự vẽ trực tiếp tác phẩm nền nghệ thuật độ phân giải sắc nét lên `#mod32-procedural-art-canvas`
   * thay vì phụ thuộc thụ động vào SVG CSS filters hay độ trong suốt yếu của thẻ con.
   */
  class ProceduralCanvasArtworkPainter {
    constructor() {
      this.canvas = null;
      this.ctx = null;
      this.activeWallpaperId = null;
      this.starsSeed = this.createDeterministicStars(96);
    }

    createDeterministicStars(count) {
      const stars = [];
      for (let i = 0; i < count; i++) {
        // Phân bố giả ngẫu nhiên tất định để nền luôn nhất quán và sắc sảo
        const rx = ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1;
        const ry = ((Math.sin(i * 78.233) * 19341.123) % 1 + 1) % 1;
        const size = 0.8 + (i % 4) * 0.55;
        const alpha = 0.25 + (i % 5) * 0.14;
        stars.push({ rx, ry: ry * 0.62, size, alpha });
      }
      return stars;
    }

    attachCanvas(canvasEl) {
      this.canvas = canvasEl || null;
      this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
      this.resizeCanvas();
    }

    resizeCanvas() {
      if (!this.canvas || !this.ctx || typeof window === 'undefined') return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.max(320, window.innerWidth || 1280);
      const h = Math.max(240, window.innerHeight || 720);
      const targetW = Math.floor(w * dpr);
      const targetH = Math.floor(h * dpr);
      if (this.canvas.width !== targetW || this.canvas.height !== targetH) {
        this.canvas.width = targetW;
        this.canvas.height = targetH;
      }
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (this.activeWallpaperId) {
        this.paintWallpaper(this.activeWallpaperId);
      }
    }

    clear() {
      this.activeWallpaperId = null;
      if (this.canvas) {
        this.canvas.classList.add('hidden');
      }
      if (this.ctx && typeof window !== 'undefined') {
        this.ctx.clearRect(0, 0, window.innerWidth || 1920, window.innerHeight || 1080);
      }
    }

    paintWallpaper(wallpaperId) {
      const spec = STAGE_ARTWORK_CATALOG[wallpaperId];
      if (!spec || !this.canvas || !this.ctx) {
        this.clear();
        return false;
      }

      this.activeWallpaperId = spec.id;
      this.canvas.classList.remove('hidden');

      const w = Math.max(320, (typeof window !== 'undefined' && window.innerWidth) || 1280);
      const h = Math.max(240, (typeof window !== 'undefined' && window.innerHeight) || 720);
      const ctx = this.ctx;

      if (spec.isSolidBlack) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, h);
        if (typeof document !== 'undefined' && document.body) {
          document.body.dataset.minimalBg = 'black';
        }
        return true;
      }
      if (spec.isSolidWhite) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        if (typeof document !== 'undefined' && document.body) {
          document.body.dataset.minimalBg = 'white';
        }
        return true;
      }
      if (typeof document !== 'undefined' && document.body?.dataset?.minimalBg) {
        delete document.body.dataset.minimalBg;
      }

      // 1. Bầu trời đa tầng chuyển sắc sâu
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      spec.skyStops.forEach(([stop, col]) => skyGrad.addColorStop(stop, col));
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. Vì sao tinh tú lấp lánh ở tầng thượng quyển
      this.starsSeed.forEach((st) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${st.alpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(st.rx * w, st.ry * h, st.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Quầng sáng Mặt trăng / Đèn trung tâm & Hào quang khuếch tán rộng
      const mx = w * spec.moon.xRatio;
      const my = h * spec.moon.yRatio;
      const glow = ctx.createRadialGradient(mx, my, 8, mx, my, spec.moon.glowRadius);
      glow.addColorStop(0, spec.moon.color);
      glow.addColorStop(0.32, `${spec.accentHex}66`);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(mx, my, spec.moon.glowRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = spec.moon.color;
      ctx.beginPath();
      ctx.arc(mx, my, spec.moon.radius, 0, Math.PI * 2);
      ctx.fill();

      // 4. Dải sương mù chuyển sắc chân trời
      const mistY = h * 0.54;
      const mistGrad = ctx.createLinearGradient(0, mistY, 0, mistY + h * 0.22);
      mistGrad.addColorStop(0, 'rgba(0,0,0,0)');
      mistGrad.addColorStop(0.5, spec.mistColor);
      mistGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = mistGrad;
      ctx.fillRect(0, mistY, w, h * 0.22);

      // 5. Hai lớp dãy núi chiều sâu xa-gần
      this.drawMountainRidge(ctx, w, h, 0.72, 0.14, spec.ridgeBack);
      this.drawMountainRidge(ctx, w, h, 0.82, 0.09, spec.ridgeFront);

      // 6. Họa tiết biểu trưng riêng theo từng chủ đề
      this.drawThemeMotif(ctx, spec, w, h);
      return true;
    }

    drawMountainRidge(ctx, w, h, baseRatio, ampRatio, fillHex) {
      ctx.fillStyle = fillHex;
      ctx.beginPath();
      ctx.moveTo(0, h);
      const steps = 12;
      for (let i = 0; i <= steps; i++) {
        const px = (i / steps) * w;
        const wave = Math.sin(i * 0.95 + baseRatio * 10) * (h * ampRatio);
        const py = h * baseRatio + wave;
        ctx.lineTo(px, py);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
    }

    drawThemeMotif(ctx, spec, w, h) {
      switch (spec.motif) {
        case 'NOIR_CITY': {
          const buildings = [
            { rx: 0.03, rw: 0.09, rh: 0.44 },
            { rx: 0.13, rw: 0.11, rh: 0.56 },
            { rx: 0.25, rw: 0.08, rh: 0.37 },
            { rx: 0.66, rw: 0.10, rh: 0.48 },
            { rx: 0.78, rw: 0.12, rh: 0.60 },
            { rx: 0.91, rw: 0.07, rh: 0.42 }
          ];
          buildings.forEach((b) => {
            const bx = b.rx * w;
            const bw = b.rw * w;
            const bh = b.rh * h;
            const by = h - bh;
            ctx.fillStyle = '#0a0e29';
            ctx.fillRect(bx, by, bw, bh);

            for (let wy = by + 16; wy < h - 22; wy += 24) {
              for (let wx = bx + 10; wx < bx + bw - 14; wx += 18) {
                if (((Math.round(wx) + Math.round(wy)) % 5) < 2) {
                  ctx.fillStyle =
                    (Math.round(wx) % 3 === 0)
                      ? 'rgba(253, 224, 71, 0.72)'
                      : 'rgba(56, 189, 248, 0.48)';
                  ctx.fillRect(wx, wy, 8, 12);
                }
              }
            }
          });
          // Ánh đèn phản chiếu xuống mặt đường ướt dưới đáy
          const wetGlow = ctx.createLinearGradient(0, h * 0.88, 0, h);
          wetGlow.addColorStop(0, 'rgba(250, 204, 21, 0.06)');
          wetGlow.addColorStop(1, 'rgba(250, 204, 21, 0.26)');
          ctx.fillStyle = wetGlow;
          ctx.fillRect(0, h * 0.88, w, h * 0.12);
          break;
        }

        case 'BAMBOO': {
          const stalks = [0.08, 0.12, 0.86, 0.92];
          ctx.strokeStyle = 'rgba(52, 211, 153, 0.55)';
          ctx.lineWidth = 5;
          stalks.forEach((rx, idx) => {
            const sx = rx * w;
            ctx.beginPath();
            ctx.moveTo(sx, h);
            ctx.quadraticCurveTo(sx + (idx % 2 === 0 ? 18 : -18), h * 0.55, sx + (idx % 2 === 0 ? -16 : 16), h * 0.14);
            ctx.stroke();

            ctx.fillStyle = 'rgba(110, 231, 183, 0.45)';
            for (let l = 0; l < 5; l++) {
              const ly = h * (0.24 + l * 0.12);
              const lx = sx + (l % 2 === 0 ? 18 : -18);
              ctx.save();
              ctx.translate(lx, ly);
              ctx.rotate(l % 2 === 0 ? 0.35 : -0.35);
              ctx.beginPath();
              ctx.ellipse(0, 0, 20, 4.5, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
          });
          break;
        }

        case 'AURORA': {
          const ribbon = ctx.createLinearGradient(0, h * 0.14, w, h * 0.42);
          ribbon.addColorStop(0, 'rgba(52, 211, 153, 0.36)');
          ribbon.addColorStop(0.5, 'rgba(56, 189, 248, 0.40)');
          ribbon.addColorStop(1, 'rgba(167, 139, 250, 0.32)');
          ctx.fillStyle = ribbon;
          ctx.beginPath();
          ctx.moveTo(0, h * 0.30);
          ctx.bezierCurveTo(w * 0.28, h * 0.10, w * 0.62, h * 0.40, w, h * 0.20);
          ctx.lineTo(w, h * 0.36);
          ctx.bezierCurveTo(w * 0.64, h * 0.52, w * 0.30, h * 0.24, 0, h * 0.42);
          ctx.closePath();
          ctx.fill();
          break;
        }

        case 'PAGODA': {
          const px = w * 0.80;
          const py = h * 0.58;
          ctx.fillStyle = '#0c0b2e';
          for (let tier = 0; tier < 3; tier++) {
            const tw = 96 - tier * 18;
            const ty = py - tier * 34;
            ctx.beginPath();
            ctx.moveTo(px - tw * 0.65, ty);
            ctx.lineTo(px + tw * 0.65, ty);
            ctx.lineTo(px, ty - 26);
            ctx.closePath();
            ctx.fill();
            ctx.fillRect(px - tw * 0.34, ty, tw * 0.68, 30);
          }
          ctx.fillStyle = 'rgba(254, 240, 138, 0.85)';
          ctx.fillRect(px - 7, py - 14, 14, 22);
          break;
        }

        case 'AUTUMN': {
          ctx.fillStyle = 'rgba(251, 146, 60, 0.38)';
          const pines = [0.09, 0.16, 0.85, 0.91];
          pines.forEach((rx) => {
            const cx = rx * w;
            ctx.beginPath();
            ctx.moveTo(cx, h * 0.58);
            ctx.lineTo(cx - 46, h * 0.86);
            ctx.lineTo(cx + 46, h * 0.86);
            ctx.closePath();
            ctx.fill();
          });
          break;
        }

        case 'LIBRARY': {
          ctx.strokeStyle = 'rgba(250, 204, 21, 0.32)';
          ctx.lineWidth = 4;
          [0.10, 0.80].forEach((rx) => {
            const ax = rx * w;
            ctx.strokeRect(ax, h * 0.16, w * 0.10, h * 0.62);
          });
          // Đốm sáng ấm của đèn bàn thư phòng
          const deskLight = ctx.createRadialGradient(w * 0.5, h * 0.84, 12, w * 0.5, h * 0.84, w * 0.38);
          deskLight.addColorStop(0, 'rgba(253, 224, 71, 0.34)');
          deskLight.addColorStop(1, 'rgba(253, 224, 71, 0)');
          ctx.fillStyle = deskLight;
          ctx.fillRect(0, h * 0.45, w, h * 0.55);
          break;
        }

        default:
          break;
      }
    }
  }

  // ==========================================================================
  // PHẦN 5: TRÌNH ĐỒNG BỘ SÂN KHẤU NỀN & KÍNH MỜ TOÀN HỆ THỐNG (STAGE COMPOSITOR)
  // ==========================================================================

  class AmbientBackdropStageCompositor {
    constructor(vault, artPainter) {
      this.vault = vault;
      this.artPainter = artPainter;
      this.currentPresetId = safeStorageGet(
        MOD32_CONSTANTS.STORAGE_KEYS.TRANSPARENCY_PRESET,
        'BALANCED'
      );
      this.visibilityPct = this.readInitialVisibilityPct();
      this.isPeekingBackground = false;
      this.hasHookedMod22 = false;
      this.activeCustomUrl = null;
      this.activeCustomMeta = null;
      this.bodyObserver = null;
    }

    readInitialVisibilityPct() {
      const raw = Number(safeStorageGet(MOD32_CONSTANTS.STORAGE_KEYS.VISIBILITY_PCT, '68'));
      return Number.isFinite(raw) ? Math.max(15, Math.min(95, raw)) : 68;
    }

    init() {
      const artCanvas = this.ensureArtCanvasAttached();
      this.artPainter.attachCanvas(artCanvas);

      this.injectStageAuthorityCss();
      this.bindResizeObserver();
      this.wrapMod22BackdropMethodsSafely();
      this.mountTab5BackdropStagePanel();
      this.applyVisibilitySettings(this.visibilityPct, false);

      // Đồng bộ lại trạng thái tranh nền hoặc ảnh/video đã lưu trước đó
      this.syncFromCurrentDomOrStorage();
      this.restoreSavedCustomMediaFromIdb();
    }

    ensureArtCanvasAttached() {
      let artCanvas = document.getElementById(MOD32_CONSTANTS.SELECTORS.ART_CANVAS);
      if (artCanvas) return artCanvas;

      const backdropLayer = document.getElementById(MOD32_CONSTANTS.SELECTORS.BACKDROP_LAYER);
      if (!backdropLayer) return null;

      artCanvas = document.createElement('canvas');
      artCanvas.id = MOD32_CONSTANTS.SELECTORS.ART_CANVAS;
      artCanvas.className = 'hidden absolute inset-0 z-[2] w-full h-full block pointer-events-none';
      const particleCanvas = document.getElementById(MOD32_CONSTANTS.SELECTORS.PARTICLE_CANVAS);
      if (particleCanvas && particleCanvas.parentElement === backdropLayer) {
        backdropLayer.insertBefore(artCanvas, particleCanvas);
      } else {
        backdropLayer.appendChild(artCanvas);
      }
      return artCanvas;
    }

    /**
     * Tiêm bảng CSS chuẩn xác dựa trên `html.dark` và `html:not(.dark)` để toàn bộ
     * 6 Tab, thanh đầu và thẻ con chuyển thành kính mờ trong trẻo khi bật nền.
     */
    injectStageAuthorityCss() {
      if (typeof document === 'undefined' || !document.head) return;
      let styleEl = document.getElementById(MOD32_CONSTANTS.SELECTORS.DYNAMIC_STYLE_ID);
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = MOD32_CONSTANTS.SELECTORS.DYNAMIC_STYLE_ID;
        document.head.appendChild(styleEl);
      }

      styleEl.textContent = `
        /* Module 32 Authority Backdrop Layering */
        #ambient-backdrop-layer {
          position: fixed !important;
          inset: 0 !important;
          z-index: 0 !important;
          pointer-events: none !important;
          overflow: hidden !important;
        }
        #ambient-bg-video,
        #ambient-bg-image {
          z-index: 1 !important;
          opacity: 1 !important;
        }
        #mod32-procedural-art-canvas {
          z-index: 2 !important;
        }
        #ambient-bg-canvas {
          z-index: 3 !important;
        }
        #ambient-frosted-shield {
          z-index: 4 !important;
        }
        /* Ép trong suốt kính mờ chính xác cho cả html.dark (Tailwind class mode) */
        html.dark body.noir-ambient-active,
        html.dark body.noir-ambient-active main#app-main-workspace {
          background-color: transparent !important;
        }
        html.dark body.noir-ambient-active #left-sidebar-pane,
        html.dark body.noir-ambient-active #center-editor-pane,
        html.dark body.noir-ambient-active #pane-left-beats,
        html.dark body.noir-ambient-active #pane-right-manuscript,
        html.dark body.noir-ambient-active #mode5-plot-diagram-studio,
        html.dark body.noir-ambient-active #right-bible-pane,
        html.dark body.noir-ambient-active #s14-screen-5-ambience,
        html.dark body.noir-ambient-active #s14-screen-6-system {
          background-color: rgba(8, 12, 20, var(--noir-ambient-pane-dark, 0.24)) !important;
          backdrop-filter: blur(var(--mod32-stage-blur, 5px)) !important;
        }
        html.dark body.noir-ambient-active #s14-screen-5-ambience .rounded-2xl:not(select),
        html.dark body.noir-ambient-active #s14-screen-5-ambience .rounded-xl:not(select),
        html.dark body.noir-ambient-active #right-bible-pane .rounded-2xl:not(select),
        html.dark body.noir-ambient-active #s14-screen-6-system .rounded-2xl:not(select),
        html.dark body.noir-ambient-active #center-editor-pane .rounded-2xl:not(select),
        html.dark body.noir-ambient-active #left-sidebar-pane .rounded-2xl:not(select),
        html.dark body.noir-ambient-active #pane-right-manuscript textarea,
        html.dark body.noir-ambient-active #tab3-standard-output-wrapper textarea {
          background-color: rgba(14, 19, 29, var(--noir-ambient-card-dark, 0.46)) !important;
          backdrop-filter: blur(var(--mod32-stage-blur, 6px)) !important;
        }
        html.dark body.noir-ambient-active #s14-screen-5-ambience select.noir-dark-select.noir-dark-select.noir-dark-select,
        html body.noir-ambient-active #s14-screen-5-ambience select.noir-dark-select.noir-dark-select,
        html body.noir-ambient-active select.noir-dark-select.noir-dark-select,
        html #s14-screen-5-ambience select {
          color-scheme: dark !important;
          background-color: #09090b !important;
          color: #ffffff !important;
          backdrop-filter: none !important;
        }
        html:not(.dark) body.noir-ambient-active #left-sidebar-pane,
        html:not(.dark) body.noir-ambient-active #center-editor-pane,
        html:not(.dark) body.noir-ambient-active #pane-left-beats,
        html:not(.dark) body.noir-ambient-active #pane-right-manuscript,
        html:not(.dark) body.noir-ambient-active #mode5-plot-diagram-studio,
        html:not(.dark) body.noir-ambient-active #right-bible-pane,
        html:not(.dark) body.noir-ambient-active #s14-screen-5-ambience,
        html:not(.dark) body.noir-ambient-active #s14-screen-6-system {
          background-color: rgba(248, 250, 252, var(--noir-ambient-pane-light, 0.34)) !important;
          backdrop-filter: blur(var(--mod32-stage-blur, 5px)) !important;
        }
      `;
    }

    bindResizeObserver() {
      if (typeof window === 'undefined') return;
      window.addEventListener('resize', () => {
        this.artPainter.resizeCanvas();
      });
    }

    /**
     * Đồng bộ hai chiều an toàn vào Mod 22 để bất kỳ nút nào trên giao diện đều kích hoạt
     * đầy đủ tầng Canvas nghệ thuật + Lưu IndexedDB + Lớp kính mờ `noir-ambient-active`.
     */
    wrapMod22BackdropMethodsSafely() {
      if (this.hasHookedMod22) return;
      const amb = NS.ambience;
      if (!amb) return;
      this.hasHookedMod22 = true;

      const self = this;

      const origSyncState = amb.syncAmbientBodyState?.bind(amb);
      amb.syncAmbientBodyState = function wrappedSyncAmbientBodyState() {
        if (origSyncState) origSyncState();
        self.forceSyncAmbientBodyClass();
        self.refreshStageDiagnosticsUI();
      };

      const origSetEffect = amb.setBackgroundEffect?.bind(amb);
      amb.setBackgroundEffect = function wrappedSetBackgroundEffect(effectKey, showToastFlag = true) {
        if (origSetEffect) origSetEffect(effectKey, showToastFlag);
        self.forceSyncAmbientBodyClass();
        self.refreshStageDiagnosticsUI();
      };

      const origLoadMedia = amb.loadCustomMediaBackground?.bind(amb);
      amb.loadCustomMediaBackground = function wrappedLoadMedia(file) {
        if (origLoadMedia) origLoadMedia(file);
        self.artPainter.clear();
        self.activeCustomMeta = file
          ? {
              fileName: file.name || 'Ảnh/Video cá nhân',
              mediaKind: /^video\//i.test(file.type || '') ? 'VIDEO' : 'IMAGE'
            }
          : null;
        if (file) {
          self.vault.saveMediaFile(file).then(() => {
            self.refreshStageDiagnosticsUI();
          });
        }
        self.forceSyncAmbientBodyClass();
        self.refreshStageDiagnosticsUI();
      };

      const origClearMedia = amb.clearCustomMediaBackground?.bind(amb);
      amb.clearCustomMediaBackground = function wrappedClearMedia() {
        if (origClearMedia) origClearMedia();
        self.artPainter.clear();
        self.activeCustomMeta = null;
        self.vault.clearSavedMedia().then(() => {
          self.refreshStageDiagnosticsUI();
        });
        self.forceSyncAmbientBodyClass();
        self.refreshStageDiagnosticsUI();
      };

      const wpExt = amb.wallpaperExt;
      if (wpExt) {
        const origGenWp = wpExt.generateAndApplySvgWallpaper?.bind(wpExt);
        wpExt.generateAndApplySvgWallpaper = function wrappedGenWallpaper(wallpaperId, showToast = true) {
          if (origGenWp) origGenWp(wallpaperId, showToast);
          self.activeCustomMeta = null;
          self.artPainter.paintWallpaper(wallpaperId);
          self.applyVisibilitySettings(self.visibilityPct, false);
          self.forceSyncAmbientBodyClass();
          self.refreshStageDiagnosticsUI();
        };

        const origClearWp = wpExt.clearWallpaper?.bind(wpExt);
        wpExt.clearWallpaper = function wrappedClearWallpaper(showToast = true) {
          if (origClearWp) origClearWp(showToast);
          self.artPainter.clear();
          self.forceSyncAmbientBodyClass();
          self.refreshStageDiagnosticsUI();
        };
      }
    }

    forceSyncAmbientBodyClass() {
      const videoEl = document.getElementById(MOD32_CONSTANTS.SELECTORS.BG_VIDEO);
      const imageEl = document.getElementById(MOD32_CONSTANTS.SELECTORS.BG_IMAGE);
      const artCanvas = document.getElementById(MOD32_CONSTANTS.SELECTORS.ART_CANVAS);
      const activeEffect = NS.ambience?.canvasRenderer?.activeEffectKey || 'NONE';

      const hasEffect = Boolean(activeEffect && activeEffect !== 'NONE');
      const hasVideo = Boolean(videoEl && !videoEl.classList.contains('hidden') && videoEl.getAttribute('src'));
      const hasImage = Boolean(imageEl && !imageEl.classList.contains('hidden') && imageEl.getAttribute('src'));
      const hasArtCanvas = Boolean(artCanvas && !artCanvas.classList.contains('hidden') && this.artPainter.activeWallpaperId);

      const isActive = hasEffect || hasVideo || hasImage || hasArtCanvas;
      document.body?.classList?.toggle('noir-ambient-active', isActive);
    }

    syncFromCurrentDomOrStorage() {
      const wpId =
        NS.ambience?.wallpaperExt?.activeWallpaperId ||
        safeStorageGet(MOD32_CONSTANTS.STORAGE_KEYS.ACTIVE_WALLPAPER, '');

      if (wpId && STAGE_ARTWORK_CATALOG[wpId]) {
        this.artPainter.paintWallpaper(wpId);
      }
      this.forceSyncAmbientBodyClass();
      this.refreshStageDiagnosticsUI();
    }

    async restoreSavedCustomMediaFromIdb() {
      // Nếu người dùng đã có tranh nền SVG đang bật thì ưu tiên giữ nguyên tranh đó nếu không có media cá nhân mới hơn
      const savedWp = safeStorageGet(MOD32_CONSTANTS.STORAGE_KEYS.ACTIVE_WALLPAPER, '');
      const record = await this.vault.loadSavedMedia();
      if (!record || !record.blob || savedWp) {
        this.refreshStageDiagnosticsUI();
        return false;
      }

      if (this.activeCustomUrl) {
        try {
          URL.revokeObjectURL(this.activeCustomUrl);
        } catch (_e) {}
      }

      const objectUrl = URL.createObjectURL(record.blob);
      this.activeCustomUrl = objectUrl;
      this.activeCustomMeta = {
        fileName: record.fileName || 'Hình nền đã lưu',
        mediaKind: record.mediaKind || 'IMAGE'
      };

      const videoEl = document.getElementById(MOD32_CONSTANTS.SELECTORS.BG_VIDEO);
      const imageEl = document.getElementById(MOD32_CONSTANTS.SELECTORS.BG_IMAGE);
      this.artPainter.clear();

      if (record.mediaKind === 'VIDEO' && videoEl) {
        if (imageEl) {
          imageEl.classList.add('hidden');
          imageEl.removeAttribute('src');
        }
        videoEl.src = objectUrl;
        videoEl.classList.remove('hidden');
        videoEl.muted = true;
        videoEl.loop = true;
        videoEl.play().catch(() => {});
      } else if (imageEl) {
        if (videoEl) {
          videoEl.pause();
          videoEl.classList.add('hidden');
          videoEl.removeAttribute('src');
        }
        imageEl.src = objectUrl;
        imageEl.classList.remove('hidden');
      }

      this.forceSyncAmbientBodyClass();
      this.refreshStageDiagnosticsUI();
      return true;
    }

    applyVisibilitySettings(visPct, persist = true) {
      const clamped = Math.max(15, Math.min(95, Number(visPct) || 68));
      this.visibilityPct = clamped;

      const darkPaneAlpha = Math.max(0.08, Math.min(0.72, 0.88 - clamped / 100)).toFixed(2);
      const darkCardAlpha = Math.max(0.24, Math.min(0.80, 1.0 - (clamped * 0.84) / 100)).toFixed(2);
      const lightPaneAlpha = Math.max(0.18, Math.min(0.82, 0.94 - clamped / 100)).toFixed(2);
      const preset = STAGE_TRANSPARENCY_PRESETS[this.currentPresetId] || STAGE_TRANSPARENCY_PRESETS.BALANCED;

      if (typeof document !== 'undefined' && document.documentElement) {
        const rootStyle = document.documentElement.style;
        rootStyle.setProperty('--noir-ambient-pane-dark', darkPaneAlpha);
        rootStyle.setProperty('--noir-ambient-card-dark', darkCardAlpha);
        rootStyle.setProperty('--noir-ambient-pane-light', lightPaneAlpha);
        rootStyle.setProperty('--mod32-stage-blur', `${preset.blurPx}px`);
      }

      const shield = document.getElementById(MOD32_CONSTANTS.SELECTORS.FROSTED_SHIELD);
      if (shield) {
        const shieldAlpha = Math.max(0.03, Math.min(0.32, preset.shieldMaxDark * (1 - (clamped - 15) / 110)));
        const isDarkTheme = document.documentElement?.classList?.contains('dark') !== false;
        shield.style.backgroundColor = isDarkTheme
          ? `rgba(6, 10, 18, ${shieldAlpha.toFixed(2)})`
          : `rgba(247, 244, 235, ${shieldAlpha.toFixed(2)})`;
      }

      const slider = document.getElementById(MOD32_CONSTANTS.SELECTORS.VISIBILITY_SLIDER);
      if (slider && Number(slider.value) !== clamped) {
        slider.value = String(clamped);
      }
      const mod32Slider = document.getElementById('mod32-stage-visibility-slider');
      if (mod32Slider && Number(mod32Slider.value) !== clamped) {
        mod32Slider.value = String(clamped);
      }

      if (persist) {
        safeStorageSet(MOD32_CONSTANTS.STORAGE_KEYS.VISIBILITY_PCT, clamped);
      }
      this.refreshStageDiagnosticsUI();
    }

    applyTransparencyPreset(presetId, showToast = true) {
      const preset = STAGE_TRANSPARENCY_PRESETS[presetId] || STAGE_TRANSPARENCY_PRESETS.BALANCED;
      this.currentPresetId = preset.id;
      safeStorageSet(MOD32_CONSTANTS.STORAGE_KEYS.TRANSPARENCY_PRESET, preset.id);
      this.applyVisibilitySettings(preset.visibilityPct, true);
      if (showToast) {
        getUiUtils().showToast(`✨ Đã chuyển chế độ Kính mờ nền: ${preset.label}`, 'success', 2400);
      }
    }

    togglePeekBackground(forceState = null) {
      this.forceSyncAmbientBodyClass();
      if (!document.body.classList.contains('noir-ambient-active')) {
        // Nếu người dùng chưa bật bất kỳ nền nào mà bấm Soi Nền -> tự bật Phố Đêm Mưa Noir cho thấy ngay!
        if (NS.ambience?.wallpaperExt?.generateAndApplySvgWallpaper) {
          NS.ambience.wallpaperExt.generateAndApplySvgWallpaper('WALL_NOIR_CITY_SKYLINE', false);
        } else {
          this.artPainter.paintWallpaper('WALL_NOIR_CITY_SKYLINE');
          document.body.classList.add('noir-ambient-active');
        }
      }
      const next =
        typeof forceState === 'boolean' ? forceState : !this.isPeekingBackground;
      this.isPeekingBackground = next;
      document.body?.classList?.toggle('noir-ambient-peek-mode', next);
      this.refreshStageDiagnosticsUI();
    }

    getDiagnosticsSnapshot() {
      const videoEl = document.getElementById(MOD32_CONSTANTS.SELECTORS.BG_VIDEO);
      const imageEl = document.getElementById(MOD32_CONSTANTS.SELECTORS.BG_IMAGE);
      const artCanvas = document.getElementById(MOD32_CONSTANTS.SELECTORS.ART_CANVAS);
      const activeEffect = NS.ambience?.canvasRenderer?.activeEffectKey || 'NONE';
      const wpId =
        this.artPainter.activeWallpaperId ||
        NS.ambience?.wallpaperExt?.activeWallpaperId ||
        null;
      const wpSpec = wpId ? STAGE_ARTWORK_CATALOG[wpId] : null;

      return {
        isActive: document.body?.classList?.contains('noir-ambient-active') || false,
        isHtmlDark: document.documentElement?.classList?.contains('dark') !== false,
        activeEffect,
        activeWallpaperId: wpId,
        activeWallpaperTitle: wpSpec ? wpSpec.title : null,
        hasArtCanvas: Boolean(artCanvas && !artCanvas.classList.contains('hidden')),
        hasImage: Boolean(imageEl && !imageEl.classList.contains('hidden') && imageEl.getAttribute('src')),
        hasVideo: Boolean(videoEl && !videoEl.classList.contains('hidden') && videoEl.getAttribute('src')),
        customMeta: this.activeCustomMeta,
        visibilityPct: this.visibilityPct,
        presetId: this.currentPresetId,
        isPeeking: this.isPeekingBackground
      };
    }

    mountTab5BackdropStagePanel() {
      const typoPanel = document.getElementById('s14-panel-typography-box');
      if (!typoPanel || document.getElementById(MOD32_CONSTANTS.SELECTORS.TAB5_STAGE_PANEL_ID)) {
        return;
      }

      const utils = getUiUtils();
      const box = document.createElement('div');
      box.id = MOD32_CONSTANTS.SELECTORS.TAB5_STAGE_PANEL_ID;
      box.className =
        'p-3.5 rounded-xl border-2 border-cyan-500/45 bg-zinc-950/75 space-y-2.5 shadow-lg';

      const presetButtonsHtml = Object.values(STAGE_TRANSPARENCY_PRESETS)
        .map(
          (p) => `
          <button type="button" data-mod32-preset="${utils.escapeHtml(p.id)}" class="mod32-preset-btn px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition ${
            p.id === this.currentPresetId
              ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
              : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-cyan-500'
          }" title="${utils.escapeHtml(p.description)}">
            ${utils.escapeHtml(p.label)}
          </button>`
        )
        .join('');

      box.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div class="font-extrabold text-xs text-cyan-300 uppercase flex items-center gap-1.5">
              <span>🖼️ Module 32 — Bộ Dựng Nền Kính Mờ &amp; Kho Tranh Rõ Nét 60FPS</span>
            </div>
            <div id="mod32-stage-status-line" class="text-[11px] text-zinc-300 mt-0.5">
              Đang kiểm tra trạng thái lớp nền...
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-1.5">
            <button type="button" id="btn-mod32-peek-background" class="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-[11px] shadow transition" title="Tạm làm mờ các khung chữ xuống 14% để bạn ngắm trọn 100% ảnh nền / hiệu ứng">
              👁️ Soi Trọn Ảnh Nền (100%)
            </button>
          </div>
        </div>
        <div class="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-zinc-800/80">
          <div class="flex flex-wrap items-center gap-1.5">
            ${presetButtonsHtml}
          </div>
          <label class="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-[11px] font-bold text-cyan-200">
            <span>🔎 Độ trong kính nền (<span id="mod32-vis-pct-badge">${this.visibilityPct}%</span>):</span>
            <input id="mod32-stage-visibility-slider" type="range" min="15" max="95" value="${this.visibilityPct}" class="w-24 accent-cyan-400 cursor-pointer" />
          </label>
        </div>
      `;

      typoPanel.appendChild(box);

      box.querySelectorAll('.mod32-preset-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const pid = btn.getAttribute('data-mod32-preset');
          this.applyTransparencyPreset(pid, true);
        });
      });

      const mod32Slider = document.getElementById('mod32-stage-visibility-slider');
      if (mod32Slider) {
        mod32Slider.addEventListener('input', (ev) => {
          this.applyVisibilitySettings(ev.target.value, true);
        });
      }

      const mod22Slider = document.getElementById(MOD32_CONSTANTS.SELECTORS.VISIBILITY_SLIDER);
      if (mod22Slider && !mod22Slider.dataset.mod32Synced) {
        mod22Slider.dataset.mod32Synced = '1';
        mod22Slider.addEventListener('input', (ev) => {
          this.applyVisibilitySettings(ev.target.value, true);
        });
      }

      const peekBtn = document.getElementById('btn-mod32-peek-background');
      if (peekBtn) {
        peekBtn.addEventListener('click', () => {
          this.togglePeekBackground();
        });
      }

      this.refreshStageDiagnosticsUI();
    }

    refreshStageDiagnosticsUI() {
      const snap = this.getDiagnosticsSnapshot();
      const statusEl = document.getElementById('mod32-stage-status-line');
      if (statusEl) {
        const layers = [];
        if (snap.activeWallpaperTitle) layers.push(`Tranh: ${snap.activeWallpaperTitle}`);
        if (snap.customMeta) layers.push(`File cá nhân: ${snap.customMeta.fileName}`);
        if (snap.activeEffect && snap.activeEffect !== 'NONE') {
          layers.push(`Hạt 60FPS: ${snap.activeEffect}`);
        }
        statusEl.textContent = layers.length > 0
          ? `✅ Đang hiển thị xuyên suốt 6 Tab — ${layers.join(' • ')} (Độ rõ ${snap.visibilityPct}%)`
          : '⬛ Hiện đang để Nền Tĩnh Tối Giản — hãy chọn một Tranh Nghệ Thuật, Tải Ảnh/Video hoặc Hiệu ứng 60FPS!';
      }

      const badge = document.getElementById('mod32-vis-pct-badge');
      if (badge) {
        badge.textContent = `${snap.visibilityPct}%`;
      }

      const peekBtn = document.getElementById('btn-mod32-peek-background');
      if (peekBtn) {
        peekBtn.textContent = snap.isPeeking
          ? '↩️ Trả Lại Giao Diện Bình Thường'
          : '👁️ Soi Trọn Ảnh Nền (100%)';
        peekBtn.className = snap.isPeeking
          ? 'px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-[11px] shadow transition animate-pulse'
          : 'px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-[11px] shadow transition';
      }

      document.querySelectorAll('.mod32-preset-btn').forEach((btn) => {
        const pid = btn.getAttribute('data-mod32-preset');
        const active = pid === this.currentPresetId;
        btn.className = active
          ? 'mod32-preset-btn px-2.5 py-1.5 rounded-lg border border-cyan-400 bg-cyan-500/20 text-cyan-200 text-[11px] font-bold transition'
          : 'mod32-preset-btn px-2.5 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-cyan-500 text-[11px] font-bold transition';
      });
    }
  }

  // ==========================================================================
  // PHẦN 6: CẦU NỐI GEMINI ARGON 4 / CARBON 4 Ở MÀN HÌNH DUYỆT & CHỜ BẢN THẢO
  // ==========================================================================

  /**
   * Quản lý toàn bộ nút 1-click Copy Toàn Bộ Prompt Tổng Hợp và Link thẳng tới
   * Gemini Web của tác giả trên cả 2 màn hình:
   *  - Màn hình Duyệt / Xác nhận Prompt Tổng Hợp (`#modal-confirm-synthesized-prompt`)
   *  - Màn hình Chờ Toàn Cục khi đang chạy Prompt (`#global-ai-blocking-loader`)
   */
  class ArgonFourGeminiWebBridgeManager {
    constructor() {
      this.totalCopiedCount = Number(
        safeStorageGet(MOD32_CONSTANTS.STORAGE_KEYS.ARGON_NOTICE_COPY_COUNT, '0')
      ) || 0;
      this.lastCopiedStats = null;
    }

    init() {
      this.ensureConfirmBridgeMounted();
      this.ensureLoaderBridgeMounted();
      this.bindAllArgonBridgeEvents();
    }

    resolveFullSynthesizedPromptText() {
      const synthTa = document.getElementById('textarea-synthesized-master-prompt');
      if (synthTa && synthTa.value && synthTa.value.trim()) {
        return synthTa.value.trim();
      }
      if (NS.promptSynthesizer?.lastSynthesizedPrompt?.trim()) {
        return NS.promptSynthesizer.lastSynthesizedPrompt.trim();
      }
      if (typeof NS.promptSynthesizer?.buildMasterSynthesizedPrompt === 'function') {
        const built = NS.promptSynthesizer.buildMasterSynthesizedPrompt();
        if (typeof built === 'string' && built.trim()) {
          return built.trim();
        }
      }
      const cmdBox = document.getElementById('s18-fullscreen-prompt-textarea');
      if (cmdBox && cmdBox.value && cmdBox.value.trim()) {
        return cmdBox.value.trim();
      }
      return '';
    }

    async copyMasterPromptForArgonWeb(sourceTag = 'CONFIRM', openGeminiAfter = false) {
      const utils = getUiUtils();
      const promptText = this.resolveFullSynthesizedPromptText();

      if (!promptText) {
        utils.showToast(
          '⚠️ Chưa thấy nội dung Prompt Tổng Hợp để copy! Hãy bấm "Tổng hợp Prompt Tổng" trước nhé.',
          'warning',
          3200
        );
        return { ok: false, wordCount: 0, charCount: 0 };
      }

      const res = await copyTextWithReliableFallback(promptText);
      if (res.ok) {
        this.totalCopiedCount += 1;
        this.lastCopiedStats = { ...res, copiedAt: Date.now(), sourceTag };
        safeStorageSet(MOD32_CONSTANTS.STORAGE_KEYS.ARGON_NOTICE_COPY_COUNT, this.totalCopiedCount);

        this.updateCopyPillsFeedback(res.wordCount, res.charCount);
        utils.showToast(
          `✅ Đã copy trọn bộ Prompt Tổng Hợp (${res.wordCount.toLocaleString('vi-VN')} từ)! Hãy dán sang Gemini Web để chạy Argon 4 / Carbon 4.`,
          'success',
          4200
        );

        if (openGeminiAfter && typeof globalScope.open === 'function') {
          try {
            globalScope.open(MOD32_CONSTANTS.GEMINI_WEB_URL, '_blank', 'noopener,noreferrer');
          } catch (_openErr) {
            // Bỏ qua nếu popup blocker chặn window.open; người dùng vẫn bấm thẳng thẻ <a>
          }
        }
      } else {
        utils.showToast(
          '⚠️ Trình duyệt chưa cấp quyền clipboard — bạn hãy bôi đen khung Prompt Tổng và nhấn Ctrl+C nhé!',
          'warning',
          3500
        );
      }

      return res;
    }

    updateCopyPillsFeedback(wordCount, charCount) {
      const label = `✅ Đã chép ${Number(wordCount || 0).toLocaleString('vi-VN')} từ`;
      ['mod32-confirm-copy-status-pill', 'mod32-loader-copy-status-pill'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          el.textContent = label;
          el.className =
            'px-2.5 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-400/60 text-emerald-200 font-extrabold text-[10px]';
          el.setAttribute('data-copied-chars', String(charCount || 0));
        }
      });
    }

    /**
     * Đảm bảo hộp hướng dẫn Argon 4 / Carbon 4 tồn tại trong `#modal-confirm-synthesized-prompt`
     * (trong trường hợp DOM được dựng lại hoặc thiếu từ HTML).
     */
    ensureConfirmBridgeMounted() {
      const existing = document.getElementById('mod32-argon-bridge-confirm-card');
      if (existing) return existing;

      const warnBox = document.getElementById('confirm-model-lite-warning');
      if (!warnBox || !warnBox.parentElement) return null;

      const card = document.createElement('div');
      card.id = 'mod32-argon-bridge-confirm-card';
      card.className =
        'p-3.5 rounded-xl border-2 border-indigo-400/55 bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-purple-950/80 text-[12px] text-zinc-100 leading-relaxed space-y-2 shadow-lg';
      card.innerHTML = this.buildBridgeInnerHtml('CONFIRM');
      warnBox.parentElement.appendChild(card);
      return card;
    }

    ensureLoaderBridgeMounted() {
      const existing = document.getElementById('mod32-argon-bridge-loader-card');
      if (existing) return existing;

      const cancelBtn = document.getElementById('btn-cancel-blocking-loader');
      if (!cancelBtn || !cancelBtn.parentElement) return null;

      const card = document.createElement('div');
      card.id = 'mod32-argon-bridge-loader-card';
      card.className =
        'p-3.5 rounded-2xl border border-indigo-400/50 bg-indigo-950/55 text-left text-[11.5px] text-zinc-200 leading-relaxed space-y-2 select-text';
      card.innerHTML = this.buildBridgeInnerHtml('LOADER');
      cancelBtn.parentElement.insertBefore(card, cancelBtn);
      return card;
    }

    buildBridgeInnerHtml(mode) {
      const copyId =
        mode === 'LOADER'
          ? 'btn-mod32-loader-inline-copy-prompt'
          : 'btn-mod32-confirm-inline-copy-prompt';
      const linkId =
        mode === 'LOADER'
          ? 'link-mod32-loader-open-gemini-web'
          : 'link-mod32-confirm-open-gemini-web';
      const pillId =
        mode === 'LOADER' ? 'mod32-loader-copy-status-pill' : 'mod32-confirm-copy-status-pill';

      return `
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="font-extrabold text-indigo-300 text-[11px]">
            💎 Viết Sâu 20.000+ Từ Bằng Gemini Argon 4 / Carbon 4 (Gemini Web / App)
          </span>
          <span id="${pillId}" class="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-200 font-bold text-[10px]">
            Sẵn sàng copy 1 chạm
          </span>
        </div>
        <p class="text-zinc-200">
          Vì 1 số lí do mà mình chưa fix bug là chưa dùng được <strong>Argon 4</strong> qua API, nên nếu bạn muốn viết sâu <strong>20.000+ từ trong 1 lần</strong> hãy
          <button type="button" id="${copyId}" class="inline font-extrabold underline decoration-2 underline-offset-4 text-emerald-300 hover:text-emerald-200 cursor-pointer px-1">
            ấn vào đây để copy toàn bộ prompt tổng hợp
          </button>, rồi vào thẳng Gemini Web của bạn (hoặc ứng dụng nếu bạn có) và
          <a id="${linkId}" href="${MOD32_CONSTANTS.GEMINI_WEB_URL}" target="_blank" rel="noopener noreferrer" class="inline font-extrabold underline decoration-2 underline-offset-4 text-amber-300 hover:text-amber-200 px-1">
            bấm vào đây để chạy prompt viết tiểu thuyết từ Gemini Argon 4 ↗
          </a>.
        </p>
        <div class="px-3 py-1.5 rounded-lg border border-amber-400/45 bg-amber-500/15 text-amber-200 font-bold text-[11px]">
          ⚠️ Lưu ý: Bạn phải nâng cấp lên gói <strong>Pro</strong> mới dùng được <strong>Argon 4</strong>, gói <strong>Ultra</strong> cho <strong>Carbon 4</strong> nha.
        </div>
      `;
    }

    bindAllArgonBridgeEvents() {
      const bindBtn = (id, fn) => {
        const el = document.getElementById(id);
        if (el && !el.dataset.mod32Bound) {
          el.dataset.mod32Bound = '1';
          el.addEventListener('click', fn);
        }
      };

      bindBtn('btn-mod32-confirm-inline-copy-prompt', () => {
        this.copyMasterPromptForArgonWeb('CONFIRM_INLINE', false);
      });

      bindBtn('btn-mod32-confirm-copy-and-open', () => {
        this.copyMasterPromptForArgonWeb('CONFIRM_COMBO', true);
      });

      bindBtn('btn-mod32-loader-inline-copy-prompt', () => {
        this.copyMasterPromptForArgonWeb('LOADER_INLINE', false);
      });
    }
  }

  // ==========================================================================
  // PHẦN 7: BỘ KIỂM ĐỊNH LỚP ĐỤC & TỰ ĐỘNG KHẮC PHỤC NỀN BỊ CHE (OCD STAGE AUDITOR)
  // ==========================================================================

  const MEDIA_ATMOSPHERE_FILTERS = Object.freeze({
    NATURAL: {
      id: 'NATURAL',
      label: '🎬 Gốc Sắc Nét',
      cssFilter: 'contrast(1.04) saturate(1.06)',
      description: 'Giữ nguyên màu ảnh/video gốc độ nét cao.'
    },
    NOIR_CINEMA: {
      id: 'NOIR_CINEMA',
      label: '🌧️ Mưa Đêm Điện Ảnh',
      cssFilter: 'contrast(1.12) saturate(0.88) brightness(0.92)',
      description: 'Tăng chiều sâu tương phản cho ảnh phố đêm hoặc trinh thám.'
    },
    WARM_NOCTURNE: {
      id: 'WARM_NOCTURNE',
      label: '🏮 Hoài Cổ Ấm Áp',
      cssFilter: 'sepia(0.18) saturate(1.15) brightness(0.95)',
      description: 'Tô sắc vàng dịu êm mắt hợp cảnh thư phòng, cổ phong.'
    },
    DREAMY_SOFT: {
      id: 'DREAMY_SOFT',
      label: '☁️ Sương Mờ Mơ Màng',
      cssFilter: 'brightness(0.98) contrast(0.94) saturate(1.10)',
      description: 'Làm mềm hậu cảnh giúp khung văn bản nổi bật dịu nhẹ.'
    }
  });

  const CRITICAL_STAGE_TRANSPARENCY_IDS = Object.freeze([
    's14-screen-5-ambience',
    's14-screen-6-system',
    'center-editor-pane',
    'left-sidebar-pane',
    'right-bible-pane',
    'pane-left-beats',
    'pane-right-manuscript',
    'app-main-workspace'
  ]);

  /**
   * Tự động kiểm tra kiểu tính toán `getComputedStyle` của từng khung màn hình
   * khi bật hình nền/tranh nền, phát hiện phần tử nào vẫn còn nền đục (>= 0.88 alpha)
   * và vá trực tiếp inline variable / transparency rule ngay lập tức.
   */
  class StageLayerInspectorDiagnostic {
    constructor(compositor) {
      this.compositor = compositor;
      this.lastAuditReport = null;
    }

    parseRgbaAlpha(colorStr) {
      const s = String(colorStr || '').trim().toLowerCase();
      if (!s || s === 'transparent') return 0;
      const rgbaMatch = s.match(/rgba\([^,]+,[^,]+,[^,]+,\s*([0-9.]+)\)/);
      if (rgbaMatch) {
        return Number.parseFloat(rgbaMatch[1]);
      }
      if (s.startsWith('rgb(')) {
        return 1;
      }
      return 0;
    }

    runLiveLayerTransparencyAudit() {
      const backdrop = document.getElementById(MOD32_CONSTANTS.SELECTORS.BACKDROP_LAYER);
      const artCanvas = document.getElementById(MOD32_CONSTANTS.SELECTORS.ART_CANVAS);
      const particleCanvas = document.getElementById(MOD32_CONSTANTS.SELECTORS.PARTICLE_CANVAS);
      const bgImg = document.getElementById(MOD32_CONSTANTS.SELECTORS.BG_IMAGE);
      const bgVid = document.getElementById(MOD32_CONSTANTS.SELECTORS.BG_VIDEO);
      const shield = document.getElementById(MOD32_CONSTANTS.SELECTORS.FROSTED_SHIELD);

      const occludedElements = [];
      const inspectedPanes = CRITICAL_STAGE_TRANSPARENCY_IDS.map((id) => {
        const el = document.getElementById(id);
        if (!el || typeof globalScope.getComputedStyle !== 'function') {
          return { id, present: false, alpha: 0, ok: true };
        }
        const cs = globalScope.getComputedStyle(el);
        const alpha = this.parseRgbaAlpha(cs.backgroundColor);
        const visibleEl = cs.display !== 'none';
        const isAmbientActive = document.body?.classList?.contains('noir-ambient-active');
        const isBlocked = Boolean(isAmbientActive && visibleEl && alpha > 0.86);
        if (isBlocked) {
          occludedElements.push(id);
        }
        return {
          id,
          present: true,
          visible: visibleEl,
          backgroundColor: cs.backgroundColor,
          alpha,
          ok: !isBlocked
        };
      });

      const backdropStyle =
        backdrop && typeof globalScope.getComputedStyle === 'function'
          ? globalScope.getComputedStyle(backdrop)
          : null;
      const shieldStyle =
        shield && typeof globalScope.getComputedStyle === 'function'
          ? globalScope.getComputedStyle(shield)
          : null;

      this.lastAuditReport = {
        auditedAt: Date.now(),
        ambientActiveClass: Boolean(document.body?.classList?.contains('noir-ambient-active')),
        htmlDarkClass: Boolean(document.documentElement?.classList?.contains('dark')),
        backdropPosition: backdropStyle ? backdropStyle.position : 'unknown',
        backdropZIndex: backdropStyle ? backdropStyle.zIndex : 'unknown',
        artCanvasVisible: Boolean(artCanvas && !artCanvas.classList.contains('hidden')),
        imageVisible: Boolean(bgImg && !bgImg.classList.contains('hidden')),
        videoVisible: Boolean(bgVid && !bgVid.classList.contains('hidden')),
        particleCanvasWidth: particleCanvas ? particleCanvas.width : 0,
        shieldAlpha: shieldStyle ? this.parseRgbaAlpha(shieldStyle.backgroundColor) : 0,
        occludedCount: occludedElements.length,
        occludedElements,
        inspectedPanes
      };

      return this.lastAuditReport;
    }

    autoRepairStageTransparency(showToast = true) {
      this.compositor.injectStageAuthorityCss();
      this.compositor.ensureArtCanvasAttached();
      this.compositor.syncFromCurrentDomOrStorage();
      this.compositor.applyVisibilitySettings(Math.max(68, this.compositor.visibilityPct), true);

      const report = this.runLiveLayerTransparencyAudit();
      if (report.occludedElements.length > 0 && document.body?.classList?.contains('noir-ambient-active')) {
        report.occludedElements.forEach((id) => {
          const el = document.getElementById(id);
          if (el) {
            el.style.setProperty('background-color', 'rgba(8, 12, 20, 0.22)', 'important');
          }
        });
      }

      if (showToast) {
        getUiUtils().showToast(
          `🛠️ Đã đồng bộ & kiểm định toàn bộ tầng kính mờ (độ rõ nền ${this.compositor.visibilityPct}%).`,
          'success',
          2600
        );
      }
      return this.runLiveLayerTransparencyAudit();
    }
  }

  // ==========================================================================
  // PHẦN 8: BỘ LỌC ĐIỆN ẢNH CHO ẢNH/VIDEO CÁ NHÂN & LỊCH SỬ THƯ VIỆN MEDIA NỀN
  // ==========================================================================

  class CustomMediaAtmosphereFilterController {
    constructor(compositor) {
      this.compositor = compositor;
      this.activeFilterId = safeStorageGet('noir_mod32_media_filter_v1', 'NATURAL');
      if (!MEDIA_ATMOSPHERE_FILTERS[this.activeFilterId]) {
        this.activeFilterId = 'NATURAL';
      }
    }

    init() {
      this.applyMediaFilter(this.activeFilterId, false);
      this.mountFilterToolbarIntoTab5();
    }

    applyMediaFilter(filterId, showToast = true) {
      const spec = MEDIA_ATMOSPHERE_FILTERS[filterId] || MEDIA_ATMOSPHERE_FILTERS.NATURAL;
      this.activeFilterId = spec.id;
      safeStorageSet('noir_mod32_media_filter_v1', spec.id);

      [
        MOD32_CONSTANTS.SELECTORS.BG_IMAGE,
        MOD32_CONSTANTS.SELECTORS.BG_VIDEO,
        MOD32_CONSTANTS.SELECTORS.ART_CANVAS
      ].forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          el.style.filter = spec.cssFilter;
        }
      });

      this.refreshFilterButtonsUI();
      if (showToast) {
        getUiUtils().showToast(`🎨 Đã áp dụng sắc thái nền: ${spec.label}`, 'info', 2200);
      }
    }

    mountFilterToolbarIntoTab5() {
      const panel = document.getElementById(MOD32_CONSTANTS.SELECTORS.TAB5_STAGE_PANEL_ID);
      if (!panel || document.getElementById('mod32-media-filter-bar')) return;

      const utils = getUiUtils();
      const bar = document.createElement('div');
      bar.id = 'mod32-media-filter-bar';
      bar.className = 'flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/70';

      const filterBtnsHtml = Object.values(MEDIA_ATMOSPHERE_FILTERS)
        .map(
          (f) => `
          <button type="button" data-mod32-filter="${utils.escapeHtml(f.id)}" class="mod32-filter-btn px-2 py-1 rounded-lg border text-[10px] font-bold transition ${
            f.id === this.activeFilterId
              ? 'border-amber-400 bg-amber-500/20 text-amber-200'
              : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-amber-500'
          }" title="${utils.escapeHtml(f.description)}">
            ${utils.escapeHtml(f.label)}
          </button>`
        )
        .join('');

      bar.innerHTML = `
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="text-[10px] font-extrabold uppercase text-amber-300">🎞️ Sắc thái nền:</span>
          ${filterBtnsHtml}
        </div>
        <button type="button" id="btn-mod32-auto-repair-backdrop" class="px-2.5 py-1 rounded-lg border border-emerald-500/50 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 font-bold text-[10px] transition" title="Tự kiểm tra và gỡ bỏ lớp tối đục nếu tranh nền hoặc ảnh chưa hiển thị rõ">
          🛠️ Đồng bộ &amp; Sửa lớp nền
        </button>
      `;

      panel.appendChild(bar);

      bar.querySelectorAll('.mod32-filter-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.applyMediaFilter(btn.getAttribute('data-mod32-filter'), true);
        });
      });
    }

    refreshFilterButtonsUI() {
      document.querySelectorAll('.mod32-filter-btn').forEach((btn) => {
        const fid = btn.getAttribute('data-mod32-filter');
        const active = fid === this.activeFilterId;
        btn.className = active
          ? 'mod32-filter-btn px-2 py-1 rounded-lg border border-amber-400 bg-amber-500/20 text-amber-200 text-[10px] font-bold transition'
          : 'mod32-filter-btn px-2 py-1 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-amber-500 text-[10px] font-bold transition';
      });
    }
  }

  // ==========================================================================
  // PHẦN 9: CỐ VẤN ĐỘ DÀI 20.000+ TỪ & GÓI MỞ RỘNG CHO GEMINI ARGON 4 WEB
  // ==========================================================================

  const ARGON_20K_PACING_DIRECTIVE = [
    '',
    '====================================================================',
    '💎 CHỈ THỊ MỞ RỘNG ĐẠI TỰ SỰ 20.000+ TỪ (DÀNH RIÊNG CHO ARGON 4 / CARBON 4)',
    '====================================================================',
    '1. Không tóm tắt lướt qua các phân đoạn cao trào hay đối thoại nội tâm.',
    '2. Khai thác tối đa chiều sâu tâm lý, biểu cảm vi mô, không khí cảnh vật (Ngũ quan) và xung đột nhiều tầng giữa các nhân vật.',
    '3. Giữ chuẩn thoại tiểu thuyết "- Câu thoại (Tên nhân vật)" xuyên suốt toàn chương dài.',
    '4. Khai triển trọn vẹn mọi nút thắt trong Mốc Chuyển Phân Cảnh với dung lượng phong phú, đậm chất văn học.'
  ].join('\n');

  /**
   * Giúp tác giả chuẩn hóa gói Prompt hoàn hảo trước khi dán sang Gemini Argon 4 / Carbon 4
   * trên Gemini Web, kèm tùy chọn chèn chỉ thị viết sâu 20.000+ từ.
   */
  class ArgonDeepWriteChunkAndPromptAdvisor {
    constructor(bridgeManager) {
      this.bridge = bridgeManager;
      this.appendDeepPacingDirective = safeStorageGet('noir_mod32_argon_20k_suffix_v1', '1') === '1';
    }

    init() {
      this.mountDeepDirectiveToggleIntoConfirmModal();
    }

    buildPromptForWebClipboard(rawPromptText) {
      const clean = String(rawPromptText || '').trim();
      if (!clean) return '';
      if (!this.appendDeepPacingDirective) {
        return clean;
      }
      if (clean.includes('ARGON 4 / CARBON 4')) {
        return clean;
      }
      return `${clean}\n${ARGON_20K_PACING_DIRECTIVE}`;
    }

    analyzePromptMetricsForArgon(promptText) {
      const utils = getUiUtils();
      const words = utils.countVietnameseWords(promptText || '');
      const chars = String(promptText || '').length;
      const estimatedInputTokens = Math.round(words * 1.48);
      return {
        words,
        chars,
        estimatedInputTokens,
        recommendedTier:
          words > 7500
            ? 'Gói Ultra (Carbon 4) hoặc Pro (Argon 4)'
            : 'Gói Pro (Argon 4) cho bản thảo 20.000+ từ',
        readyForWebPaste: words > 0
      };
    }

    mountDeepDirectiveToggleIntoConfirmModal() {
      const card = document.getElementById('mod32-argon-bridge-confirm-card');
      if (!card || document.getElementById('mod32-argon-20k-toggle-row')) return;

      const row = document.createElement('div');
      row.id = 'mod32-argon-20k-toggle-row';
      row.className = 'flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-indigo-200/90';
      row.innerHTML = `
        <label class="inline-flex items-center gap-2 cursor-pointer select-none">
          <input id="chk-mod32-argon-20k-directive" type="checkbox" class="accent-indigo-400 rounded" ${
            this.appendDeepPacingDirective ? 'checked' : ''
          } />
          <span>Kèm chỉ thị triển khai sâu <strong>20.000+ từ</strong> khi copy sang Argon 4 / Carbon 4</span>
        </label>
        <span id="mod32-argon-prompt-metrics-badge" class="font-monoCode text-[10px] text-emerald-300">Sẵn sàng đóng gói Prompt Tổng</span>
      `;
      card.appendChild(row);

      const chk = document.getElementById('chk-mod32-argon-20k-directive');
      if (chk) {
        chk.addEventListener('change', () => {
          this.appendDeepPacingDirective = chk.checked;
          safeStorageSet('noir_mod32_argon_20k_suffix_v1', chk.checked ? '1' : '0');
          this.refreshPromptMetricsBadge();
        });
      }
      this.refreshPromptMetricsBadge();
    }

    refreshPromptMetricsBadge() {
      const badge = document.getElementById('mod32-argon-prompt-metrics-badge');
      if (!badge) return;
      const raw = this.bridge.resolveFullSynthesizedPromptText();
      const metrics = this.analyzePromptMetricsForArgon(this.buildPromptForWebClipboard(raw));
      badge.textContent =
        metrics.words > 0
          ? `~${metrics.words.toLocaleString('vi-VN')} từ (~${metrics.estimatedInputTokens.toLocaleString('vi-VN')} tokens) • Đã sẵn sàng dán`
          : 'Đang chờ tổng hợp Prompt Tổng';
    }
  }

  // ==========================================================================
  // PHẦN 9.5: ĐĂNG KÝ CHÚ THÍCH HƯỚNG DẪN TỰ NHIÊN & HIỆU ỨNG ÁNH SÁNG TẦNG NỀN
  // ==========================================================================

  const MOD32_HUMAN_TOOLTIP_MAP = Object.freeze({
    'btn-mod32-confirm-inline-copy-prompt':
      'Chép gọn toàn bộ Prompt Tổng Hợp đang hiển thị để dán trực tiếp vào Gemini Argon 4 / Carbon 4 trên trình duyệt.',
    'btn-mod32-confirm-copy-and-open':
      'Sao chép toàn bộ Prompt Tổng Hợp kèm chỉ thị viết sâu 20.000+ từ và mở ngay Gemini Web trong tab mới.',
    'link-mod32-confirm-open-gemini-web':
      'Mở thẳng trang Gemini Web cá nhân của bạn (dùng tài khoản Pro cho Argon 4 hoặc Ultra cho Carbon 4).',
    'btn-mod32-loader-inline-copy-prompt':
      'Sao chép toàn bộ Prompt Tổng Hợp ngay cả khi hệ thống đang chờ phản hồi để chạy song song trên Gemini Web.',
    'link-mod32-loader-open-gemini-web':
      'Mở ngay Gemini Web cá nhân trong lúc chờ để dán chạy bản 20.000+ từ từ Argon 4.',
    'btn-mod32-peek-background':
      'Làm mờ tạm thời các khung soạn thảo và thẻ cài đặt để bạn ngắm trọn vẹn 100% ảnh nền hoặc video vừa chọn.',
    'btn-mod32-auto-repair-backdrop':
      'Tự kiểm định CSS toàn bộ 6 Tab theo chuẩn html.dark và gỡ bỏ mọi lớp nền đen đang che khuất tranh nền.',
    'mod32-stage-visibility-slider':
      'Kéo sang phải để hình nền/tranh nghệ thuật hiện rõ rực rỡ hơn; kéo sang trái để khung chữ đậm hơn khi đọc lâu.'
  });

  /**
   * Tự đồng bộ nhãn chú thích 1 giây cho toàn bộ nút mới thuộc Module 32 & Cầu nối Argon 4.
   */
  class Mod32HumanTooltipRegistry {
    applyAllTooltips() {
      if (typeof document === 'undefined') return;
      Object.entries(MOD32_HUMAN_TOOLTIP_MAP).forEach(([id, noteText]) => {
        const el = document.getElementById(id);
        if (el) {
          el.setAttribute('data-human-note', noteText);
          if (!el.getAttribute('title')) {
            el.setAttribute('title', noteText);
          }
        }
      });
    }
  }

  /**
   * Vẽ thêm lớp sáng rung nhẹ (moonlight halo pulse & aurora ribbon shimmer) theo chu kỳ tiết kiệm pin
   * lên `#mod32-procedural-art-canvas` khi đang hiển thị tranh nghệ thuật 0MB.
   */
  class ProceduralStageShimmerAnimator {
    constructor(artPainter, compositor) {
      this.artPainter = artPainter;
      this.compositor = compositor;
      this.timerId = null;
      this.phase = 0;
    }

    startAmbientPulse() {
      if (this.timerId || typeof globalScope.setInterval !== 'function') return;
      this.timerId = globalScope.setInterval(() => {
        if (typeof document !== 'undefined' && document.hidden) return;
        const wpId = this.artPainter.activeWallpaperId;
        if (
          !wpId ||
          !this.artPainter.canvas ||
          this.artPainter.canvas.classList.contains('hidden')
        ) {
          return;
        }
        this.phase = (this.phase + 0.18) % (Math.PI * 2);
        this.artPainter.paintWallpaper(wpId);
        this.overlayPulseHighlight(wpId);
      }, 2200);
    }

    stopAmbientPulse() {
      if (this.timerId && typeof globalScope.clearInterval === 'function') {
        globalScope.clearInterval(this.timerId);
        this.timerId = null;
      }
    }

    overlayPulseHighlight(wpId) {
      const spec = STAGE_ARTWORK_CATALOG[wpId];
      const ctx = this.artPainter.ctx;
      if (!spec || !ctx || typeof window === 'undefined') return;

      const w = Math.max(320, window.innerWidth || 1280);
      const h = Math.max(240, window.innerHeight || 720);
      const mx = w * spec.moon.xRatio;
      const my = h * spec.moon.yRatio;
      const pulseAlpha = (0.08 + 0.06 * Math.sin(this.phase)).toFixed(3);

      const halo = ctx.createRadialGradient(
        mx,
        my,
        12,
        mx,
        my,
        spec.moon.glowRadius * 1.15
      );
      halo.addColorStop(0, `rgba(255, 255, 255, ${pulseAlpha})`);
      halo.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(mx, my, spec.moon.glowRadius * 1.15, 0, Math.PI * 2);
      ctx.fill();

      if (spec.motif === 'AURORA') {
        const shift = Math.sin(this.phase) * 18;
        const ribbon = ctx.createLinearGradient(0, h * 0.16 + shift, w, h * 0.36 - shift);
        ribbon.addColorStop(0, 'rgba(52, 211, 153, 0.12)');
        ribbon.addColorStop(0.5, 'rgba(56, 189, 248, 0.18)');
        ribbon.addColorStop(1, 'rgba(167, 139, 250, 0.12)');
        ctx.fillStyle = ribbon;
        ctx.fillRect(0, h * 0.15, w, h * 0.28);
      }
    }
  }

  /**
   * Đồng bộ nút mở bảng Stage Diagnostics từ Sidebar/Shortcut khi cần kiểm tra lớp kính mờ.
   */
  class Mod32KeyboardShortcutCoordinator {
    constructor(controller) {
      this.controller = controller;
      this.bound = false;
    }

    attachShortcuts() {
      if (this.bound || typeof document === 'undefined') return;
      this.bound = true;
      document.addEventListener('keydown', (ev) => {
        if (ev.altKey && ev.shiftKey && String(ev.key).toLowerCase() === 'b') {
          ev.preventDefault();
          this.controller.togglePeekBackground();
        }
      });
    }
  }

  // ==========================================================================
  // PHẦN 10: BỘ ĐIỀU KHIỂN MODULE 32 THỐNG NHẤT & HỒ SƠ CHẨN ĐOÁN
  // ==========================================================================

  class Mod32AmbientAndArgonBridgeController {
    constructor() {
      this.version = MOD32_CONSTANTS.MODULE_VERSION;
      this.mediaVault = new AmbientCustomMediaIndexedDbVault();
      this.artPainter = new ProceduralCanvasArtworkPainter();
      this.backdropStage = new AmbientBackdropStageCompositor(this.mediaVault, this.artPainter);
      this.shimmerAnimator = new ProceduralStageShimmerAnimator(this.artPainter, this.backdropStage);
      this.layerInspector = new StageLayerInspectorDiagnostic(this.backdropStage);
      this.mediaFilterCtrl = new CustomMediaAtmosphereFilterController(this.backdropStage);
      this.argonBridge = new ArgonFourGeminiWebBridgeManager();
      this.argonAdvisor = new ArgonDeepWriteChunkAndPromptAdvisor(this.argonBridge);
      this.tooltipRegistry = new Mod32HumanTooltipRegistry();
      this.shortcutCoordinator = new Mod32KeyboardShortcutCoordinator(this);
      this.initialized = false;
    }

    init() {
      if (this.initialized) {
        this.backdropStage.wrapMod22BackdropMethodsSafely();
        this.backdropStage.forceSyncAmbientBodyClass();
        this.argonBridge.bindAllArgonBridgeEvents();
        this.argonAdvisor.refreshPromptMetricsBadge();
        this.tooltipRegistry.applyAllTooltips();
        return;
      }

      this.backdropStage.init();
      this.mediaFilterCtrl.init();
      this.argonBridge.init();
      this.argonAdvisor.init();
      this.tooltipRegistry.applyAllTooltips();
      this.shortcutCoordinator.attachShortcuts();
      this.shimmerAnimator.startAmbientPulse();

      const origCopyFn = this.argonBridge.copyMasterPromptForArgonWeb.bind(this.argonBridge);
      const self = this;
      this.argonBridge.copyMasterPromptForArgonWeb = async function wrappedCopy(
        sourceTag = 'CONFIRM',
        openGeminiAfter = false
      ) {
        const raw = self.argonBridge.resolveFullSynthesizedPromptText();
        const enhanced = self.argonAdvisor.buildPromptForWebClipboard(raw);
        if (enhanced && enhanced !== raw) {
          const utils = getUiUtils();
          const res = await copyTextWithReliableFallback(enhanced);
          if (res.ok) {
            self.argonBridge.totalCopiedCount += 1;
            self.argonBridge.lastCopiedStats = { ...res, copiedAt: Date.now(), sourceTag };
            safeStorageSet(
              MOD32_CONSTANTS.STORAGE_KEYS.ARGON_NOTICE_COPY_COUNT,
              self.argonBridge.totalCopiedCount
            );
            self.argonBridge.updateCopyPillsFeedback(res.wordCount, res.charCount);
            self.argonAdvisor.refreshPromptMetricsBadge();
            utils.showToast(
              `✅ Đã copy trọn bộ Prompt Tổng Hợp + Chỉ thị 20.000+ từ (${res.wordCount.toLocaleString('vi-VN')} từ)! Hãy dán sang Gemini Web để chạy Argon 4 / Carbon 4.`,
              'success',
              4200
            );
            if (openGeminiAfter && typeof globalScope.open === 'function') {
              try {
                globalScope.open(MOD32_CONSTANTS.GEMINI_WEB_URL, '_blank', 'noopener,noreferrer');
              } catch (_e) {}
            }
          }
          return res;
        }
        const fallbackRes = await origCopyFn(sourceTag, openGeminiAfter);
        self.argonAdvisor.refreshPromptMetricsBadge();
        return fallbackRes;
      };

      const repairBtn = document.getElementById('btn-mod32-auto-repair-backdrop');
      if (repairBtn && !repairBtn.dataset.mod32Bound) {
        repairBtn.dataset.mod32Bound = '1';
        repairBtn.addEventListener('click', () => {
          this.autoRepairStageTransparency(true);
        });
      }

      this.initialized = true;
    }

    copyFullPromptForArgonWeb(openGeminiAfter = false) {
      return this.argonBridge.copyMasterPromptForArgonWeb('API_CALL', openGeminiAfter);
    }

    getStageDiagnostics() {
      return {
        ...this.backdropStage.getDiagnosticsSnapshot(),
        layerAudit: this.layerInspector.runLiveLayerTransparencyAudit(),
        mediaFilterId: this.mediaFilterCtrl.activeFilterId
      };
    }

    autoRepairStageTransparency(showToast = true) {
      return this.layerInspector.autoRepairStageTransparency(showToast);
    }

    applyMediaAtmosphereFilter(filterId, showToast = true) {
      return this.mediaFilterCtrl.applyMediaFilter(filterId, showToast);
    }

    setStagePreset(presetId) {
      this.backdropStage.applyTransparencyPreset(presetId, true);
    }

    togglePeekBackground(flag = null) {
      this.backdropStage.togglePeekBackground(flag);
    }
  }

  // ==========================================================================
  // ĐĂNG KÝ VÀO KHÔNG GIAN TÊN CHUNG window.NoirStudio
  // ==========================================================================
  const mod32Instance = new Mod32AmbientAndArgonBridgeController();

  NS.argonAndStageEngine = mod32Instance;
  NS.backdropStage = mod32Instance.backdropStage;
  NS.argonWebBridge = mod32Instance.argonBridge;
  NS.MOD32_STAGE_PRESETS = STAGE_TRANSPARENCY_PRESETS;
  NS.MOD32_ARTWORK_CATALOG = STAGE_ARTWORK_CATALOG;
  NS.MOD32_MEDIA_FILTERS = MEDIA_ATMOSPHERE_FILTERS;
  NS.MOD32_ARGON_TIER_NOTES = ARGON_BRIDGE_TIER_NOTES;

  if (typeof NS.registerModule === 'function') {
    NS.registerModule('mod32', mod32Instance);
  }
})(typeof window !== 'undefined' ? window : globalThis);
