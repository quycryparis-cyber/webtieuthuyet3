/**
 * ============================================================================
 * FILE: stage18_omnipotent_architect_patch.js (PHẦN 1 / 2 - BẢN ĐẠI TU V18.5)
 * SENIOR 30-YEAR ARCHITECT MASTER PATCH — CLEAN UI & FULL FEATURE RESTORATION
 * ----------------------------------------------------------------------------
 * Giải quyết triệt để trong Phần 1 / 2:
 * - BUG 8: Lọc sạch 100% các model rác (Nano Banana, Image, TTS, Transcribe,
 *   Robotics, Computer-Use, Carbon, Argon, Omni...), chỉ giữ lại DUY NHẤT các
 *   mô hình sinh văn bản Gemini chính thống đang hiện hành tới ngày hôm nay
 *   trên tất cả các Tab.
 * - BUG 1: Tách Chatbot Viên Bi thành 2 chế độ với 2 khung DOM & bộ xử lý riêng:
 *   + Chế độ 1 (Hỗ Trợ Trang Web): Hiểu 100% mọi tính năng, mọi nút bấm trong web,
 *     hỗ trợ nút bấm Mở Trực Tiếp 1-Click, và TUYỆT ĐỐI TỪ CHỐI trả lời các câu
 *     hỏi ngoài luồng (như "Tôi nhớ Bơ", tâm sự cá nhân...), nhắc chuyển sang Chế độ 2.
 *   + Chế độ 2 (Trò Chuyện Gemini): Trò chuyện, tâm sự tự do thoải mái.
 * - BUG 2: Xóa sạch mọi ký tự Markdown lạ như dấu **, *, #, ` và xóa bỏ hoàn toàn
 *   phần mở ngoặc tên model (gemini-3.5-flash-lite) trong câu trả lời của Viên Bi.
 * - BUG 3: Giọng AI Tiếng Việt Cute chuẩn từ chính Gemini Audio TTS (kết hợp luồng
 *   âm thanh Tiếng Việt chuẩn), có nút chọn & chuyển đổi giữa 👦 Giọng Nam Cute
 *   và 👧 Giọng Nữ Cute (tuyệt đối không bị giọng tiếng Anh đọc tiếng Việt).
 * - BUG 4: Kéo thả di chuyển mượt mà 60FPS cho cả quả cầu Viên Bi lẫn khung chat.
 * - Chặn triệt để bảng "Manage passwords..." của trình duyệt đè lên ô tên chương.
 * ============================================================================
 */

(function () {
  'use strict';

  if (window.__NOIR_STAGE18_V5_MASTER_LOADED__) return;
  window.__NOIR_STAGE18_V5_MASTER_LOADED__ = true;

  // ==========================================================================
  // MODULE 1: DANH MỤC DUY NHẤT CÁC MÔ HÌNH VĂN BẢN GEMINI HIỆN HÀNH (FIX BUG 8)
  // Xóa bỏ toàn bộ các model Nano Banana, Image, TTS, Transcribe, Robotics, Carbon...
  // ==========================================================================
  const CURRENT_OFFICIAL_GEMINI_TEXT_MODELS = [
    {
      id: 'gemini-3.5-flash-lite',
      label: '⚡ Gemini 3.5 Flash-Lite (Mới nhất - Tốc độ cao & Tiết kiệm hạn mức)'
    },
    {
      id: 'gemini-3.5-flash',
      label: '🚀 Gemini 3.5 Flash (Hiện hành - Cân bằng tốc độ & chiều sâu)'
    },
    {
      id: 'gemini-3.1-pro-preview',
      label: '🧠 Gemini 3.1 Pro Preview (Hiện hành - Suy luận tâm lý & Viết tiểu thuyết sâu)'
    },
    {
      id: 'gemini-3-flash-preview',
      label: '✨ Gemini 3.0 Flash Preview (Hiện hành - Phản hồi nhanh đa tác vụ)'
    },
    {
      id: 'gemini-2.5-pro',
      label: '💎 Gemini 2.5 Pro (Ổn định - Văn phong tiểu thuyết chi tiết)'
    },
    {
      id: 'gemini-2.5-flash',
      label: '⚡ Gemini 2.5 Flash (Ổn định - Tổng hợp nhanh)'
    }
  ];

  const ALLOWED_MODEL_IDS_SET = new Set(
    CURRENT_OFFICIAL_GEMINI_TEXT_MODELS.map((m) => m.id)
  );

  const LEGACY_TO_CURRENT_MODEL_MAP = {
    'gemini-2.5-flash-lite': 'gemini-3.5-flash-lite',
    'gemini-2.5-flash-lite-preview': 'gemini-3.5-flash-lite',
    'gemini-2.0-flash-lite': 'gemini-3.5-flash-lite',
    'gemini-2.0-flash': 'gemini-3.5-flash',
    'gemini-1.5-flash': 'gemini-3.5-flash-lite',
    'gemini-1.5-pro': 'gemini-3.1-pro-preview',
    'gemini-3.8-flash': 'gemini-3.5-flash',
    'gemini-3.7-flash': 'gemini-3.5-flash',
    'gemini-3.6-flash': 'gemini-3.5-flash',
    'gemini-4-argon': 'gemini-3.1-pro-preview',
    'gemini-4-carbon': 'gemini-3.1-pro-preview',
    'gemini-3.1-pro-preview-customtools': 'gemini-3.1-pro-preview'
  };

  const StrictModelCatalogController = {
    normalizeModelId(rawId) {
      const clean = String(rawId || 'gemini-3.5-flash-lite')
        .replace(/^models\//, '')
        .trim();
      if (LEGACY_TO_CURRENT_MODEL_MAP[clean]) {
        return LEGACY_TO_CURRENT_MODEL_MAP[clean];
      }
      if (ALLOWED_MODEL_IDS_SET.has(clean)) {
        return clean;
      }
      // Nếu là bất kỳ model lạ nào (image, banana, tts, transcribe, robotics...) -> đưa về model văn bản chuẩn
      if (clean.includes('pro')) return 'gemini-3.1-pro-preview';
      return 'gemini-3.5-flash-lite';
    },

    /**
     * Lọc và cập nhật đồng bộ TẤT CẢ các thẻ <select> chọn mô hình trên toàn bộ trang web:
     * Chỉ giữ lại đúng 6 mô hình văn bản Gemini hiện hành, xóa sạch mọi model rác!
     */
    enforceCleanModelsAcrossAllSelects() {
      const selectSelectors = [
        '#select-active-gemini-model',
        '#s18-fullscreen-model-select',
        '#select-tab4-bible-model',
        '#select-bug6-bible-model',
        '#s21-popup-bible-model',
        '#s15-bible-model-select',
        '#s15-approve-model-select',
        '#s5-select-model',
        '#s6-popup-model-select',
        '#s9-bugfixer-model-select'
      ];

      document
        .querySelectorAll(selectSelectors.join(', '))
        .forEach((sel) => {
          if (!sel) return;
          const prevVal = sel.value;
          const normalizedVal = this.normalizeModelId(prevVal);

          const currentOptionsSig = Array.from(sel.options || [])
            .map((o) => o.value)
            .join('|');
          const targetSig = CURRENT_OFFICIAL_GEMINI_TEXT_MODELS.map(
            (m) => m.id
          ).join('|');

          if (currentOptionsSig !== targetSig) {
            sel.innerHTML = CURRENT_OFFICIAL_GEMINI_TEXT_MODELS.map(
              (m) => `<option value="${m.id}">${m.label}</option>`
            ).join('');
          }

          if (ALLOWED_MODEL_IDS_SET.has(normalizedVal)) {
            sel.value = normalizedVal;
          } else if (
            sel.id.includes('bible') ||
            sel.id.includes('bug6') ||
            sel.id.includes('approve')
          ) {
            sel.value = 'gemini-3.5-flash-lite';
          } else {
            sel.value = 'gemini-3.1-pro-preview';
          }
        });

      // Ghi đè hàm scanAvailableModelsFromKey cũ để khi bấm "Quét từ API Key" cũng chỉ lọc lấy các model văn bản hiện hành
      if (window.StudioStage2?.settings) {
        window.StudioStage2.settings.scanAvailableModelsFromKey = async () => {
          this.enforceCleanModelsAcrossAllSelects();
          window.StudioStage7?.saveEngine?.showSaveToastNotification?.(
            '✅ Đã cập nhật danh sách các mô hình Gemini hiện hành mới nhất!'
          );
        };
      }
    }
  };

  // ==========================================================================
  // MODULE 2: QUẢN LÝ KEY API, CHỐNG HIỆN BẢNG MANAGE PASSWORDS & FETCH INTERCEPTOR
  // ==========================================================================
  const MasterApiKeyVault = {
    activeKey: '',
    isValid: false,
    isVerifying: false,
    verifyDebounceTimer: null,
    verifyAbortController: null,

    sanitizeKey(raw) {
      if (!raw || typeof raw !== 'string') return '';
      return raw
        .replace(/[\u200B-\u200D\uFEFF\u00A0\r\n\t"'`“”<>]/g, '')
        .trim();
    },

    isPlausibleKeyFormat(cleanKey) {
      if (!cleanKey || typeof cleanKey !== 'string') return false;
      if (cleanKey.startsWith('AIza') && cleanKey.length >= 35) return true;
      if (cleanKey.startsWith('AQ.') && cleanKey.length >= 32) return true;
      return cleanKey.length >= 35;
    },

    loadPersistedKey() {
      const candidates = [
        window.__STUDIO_MASTER_API_KEY,
        localStorage.getItem('noir_gemini_api_key'),
        localStorage.getItem('noir_studio_saved_api_key_v2'),
        sessionStorage.getItem('noir_s16u_verified_key'),
        window.StudioStage2?.settings?.config?.apiKey
      ];
      for (const c of candidates) {
        const clean = this.sanitizeKey(c);
        if (this.isPlausibleKeyFormat(clean)) return clean;
      }
      return '';
    },

    synchronizeKeyEverywhere(validKey) {
      const clean = this.sanitizeKey(validKey);
      this.activeKey = clean;
      this.isValid = Boolean(clean);
      this.isVerifying = false;
      window.__STUDIO_MASTER_API_KEY = clean;

      window.__NOIR_API_KEY_STATE__ = {
        isValid: Boolean(clean),
        isVerifying: false,
        lastVerifiedKey: clean,
        verifyDebounceTimer: null
      };

      if (clean) {
        localStorage.setItem('noir_gemini_api_key', clean);
        localStorage.setItem('noir_studio_saved_api_key_v2', clean);
        sessionStorage.setItem('noir_s16u_verified_key', clean);

        if (window.StudioStage2?.settings) {
          window.StudioStage2.settings.config.apiKey = clean;
        }
        if (window.StudioCore?.idb) {
          window.StudioCore.idb
            .set('state_cache', 'persisted_google_studio_api_key', clean)
            .catch(() => {});
        }
      }

      ['s6-welcome-api-key', 'input-gemini-api-key', 's5-input-api-key'].forEach(
        (id) => {
          const el = document.getElementById(id);
          if (el && el.value !== clean) el.value = clean;
        }
      );
    },

    /**
     * Tắt triệt để bảng "Manage passwords..." của trình duyệt (Ảnh image_305b59.png):
     * Không dùng type="password" mà dùng type="text" kèm class .s18-masked-key-input (-webkit-text-security: disc)
     */
    disarmBrowserPasswordManagerPopup() {
      document
        .querySelectorAll('input[type="password"]')
        .forEach((inp) => {
          inp.type = 'text';
          inp.classList.add('s18-masked-key-input');
          inp.setAttribute('autocomplete', 'off');
          inp.setAttribute('autocorrect', 'off');
          inp.setAttribute('autocapitalize', 'off');
          inp.setAttribute('spellcheck', 'false');
        });

      const titleInp = document.getElementById('input-chapter-title');
      if (titleInp) {
        titleInp.setAttribute('autocomplete', 'off');
        titleInp.setAttribute('name', 'novel_chapter_heading_non_auth');
      }
    },

    installFetchAndClientInterceptor() {
      if (window.__S18_V5_FETCH_INSTALLED__) return;
      window.__S18_V5_FETCH_INSTALLED__ = true;

      const origFetch = window.fetch.bind(window);

      window.fetch = async function (input, init) {
        try {
          let urlStr = typeof input === 'string' ? input : input?.url || '';
          if (urlStr.includes('generativelanguage.googleapis.com')) {
            const masterKey =
              MasterApiKeyVault.activeKey ||
              MasterApiKeyVault.loadPersistedKey();
            const isVerifyCall =
              init?.headers && init.headers['X-Studio-Key-Verify'] === '1';

            // Tự động ánh xạ mọi model cũ trên URL sang model hiện hành (không chạm vào model TTS khi đang đọc giọng nói)
            if (!urlStr.includes('tts')) {
              urlStr = urlStr.replace(
                /\/models\/([^:?]+)/,
                (_, rawModel) =>
                  `/models/${StrictModelCatalogController.normalizeModelId(
                    rawModel
                  )}`
              );
            }

            if (!isVerifyCall && masterKey) {
              const u = new URL(urlStr);
              u.searchParams.set('key', masterKey);
              urlStr = u.toString();
            }

            const cleanHeaders = { ...(init?.headers || {}) };
            delete cleanHeaders['X-Studio-Key-Verify'];
            const patchedInit = init
              ? { ...init, headers: cleanHeaders }
              : init;

            let res = await origFetch(urlStr, patchedInit);

            if (
              (res.status === 404 || res.status === 400) &&
              !isVerifyCall &&
              !urlStr.includes('tts')
            ) {
              const cloned = res.clone();
              const errJson = await cloned.json().catch(() => ({}));
              const errMsg = errJson?.error?.message || '';
              if (
                /no longer available|not found|not supported|update your code/i.test(
                  errMsg
                )
              ) {
                const fallbacks = [
                  'gemini-3.5-flash-lite',
                  'gemini-3.5-flash',
                  'gemini-3.1-pro-preview',
                  'gemini-3-flash-preview',
                  'gemini-2.5-flash',
                  'gemini-2.5-pro'
                ];
                for (const fb of fallbacks) {
                  const retryUrl = urlStr.replace(
                    /\/models\/[^:?]+/,
                    `/models/${fb}`
                  );
                  if (retryUrl === urlStr) continue;
                  const retryRes = await origFetch(retryUrl, patchedInit);
                  if (retryRes.ok) return retryRes;
                }
              }
            }
            return res;
          }
        } catch (_) {}
        return origFetch(input, init);
      };
    }
  };

  MasterApiKeyVault.installFetchAndClientInterceptor();

  // ==========================================================================
  // MODULE 3: HỆ THỐNG GIỌNG NÓI AI TIẾNG VIỆT CUTE TỪ GEMINI (NAM / NỮ) (FIX BUG 3)
  // Tuyệt đối không dùng giọng tiếng Anh của Windows đọc tiếng Việt!
  // ==========================================================================
  const GeminiCuteVietnameseVoiceEngine = {
    voiceEnabled: localStorage.getItem('noir_s18_bi_voice_on') !== 'false',
    voiceGender: localStorage.getItem('noir_s18_bi_voice_gender') || 'FEMALE', // 'FEMALE' | 'MALE'
    currentAudio: new Audio(),
    audioCtx: null,
    activeSourceNode: null,

    stopSpeaking() {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (_) {}
      try {
        if (this.activeSourceNode) {
          this.activeSourceNode.stop();
          this.activeSourceNode = null;
        }
      } catch (_) {}
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      } catch (_) {}
    },

    toggleVoiceGender() {
      this.voiceGender = this.voiceGender === 'FEMALE' ? 'MALE' : 'FEMALE';
      localStorage.setItem('noir_s18_bi_voice_gender', this.voiceGender);
      const sample =
        this.voiceGender === 'MALE'
          ? 'Chào bạn! Đây là giọng nam cute của Viên Bi nè!'
          : 'Chào bạn! Đây là giọng nữ cute của Viên Bi nè!';
      this.speakVietnameseCute(sample);
      return this.voiceGender;
    },

    /**
     * Phát giọng đọc Tiếng Việt Cute (Nam hoặc Nữ):
     * - Ưu tiên 1: Gọi trực tiếp Gemini Native Audio TTS (`gemini-2.5-flash-preview-tts` / `gemini-3.1-flash-tts-preview`)
     *   với giọng Nam (`Puck`) hoặc giọng Nữ (`Aoede`) kết hợp tinh chỉnh cao độ cute.
     * - Ưu tiên 2: Nếu mạng chậm hoặc model TTS đang bận, dùng luồng Google Vietnamese TTS chuẩn (`tl=vi`)
     *   với bộ biến điệu âm sắc Nam/Nữ cute (Tuyệt đối không dùng giọng tiếng Anh của Windows!).
     */
    async speakVietnameseCute(rawText) {
      if (!this.voiceEnabled || !rawText) return;
      this.stopSpeaking();

      const cleanText = String(rawText)
        .replace(/[*#_`~>|•]/g, ' ')
        .replace(/\(gemini-[^)]+\)/gi, ' ')
        .replace(/[🎱👋✨🚀✅✕🔒🔓📂📖💬🏛️🎛️🎵⏱️👤📤🛠️🌐📢🎬👆👦👧]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 280);

      if (!cleanText) return;

      const apiKey =
        MasterApiKeyVault.activeKey || MasterApiKeyVault.loadPersistedKey();

      // Kênh 1: Gọi chính thức Gemini Audio TTS API bằng Key API của người dùng
      if (apiKey) {
        const spokenByGemini = await this.trySpeakViaGeminiNativeTTS(
          cleanText,
          apiKey
        );
        if (spokenByGemini) return;
      }

      // Kênh 2: Phát qua luồng Google Vietnamese Audio Stream (tl=vi chuẩn tiếng Việt 100%, không bao giờ bị giọng Anh)
      await this.speakViaVietnameseCloudStream(cleanText);
    },

    async trySpeakViaGeminiNativeTTS(text, apiKey) {
      const ttsModels = [
        'gemini-2.5-flash-preview-tts',
        'gemini-3.1-flash-tts-preview'
      ];
      // Chọn giọng gốc từ Gemini: 'Puck' (Nam trẻ trung) hoặc 'Aoede' (Nữ trong trẻo)
      const voiceName = this.voiceGender === 'MALE' ? 'Puck' : 'Aoede';
      const stylePrompt =
        this.voiceGender === 'MALE'
          ? `Hãy đọc câu tiếng Việt sau bằng giọng nam trẻ trung, ấm áp, dễ thương, phát âm chuẩn tiếng Việt: "${text}"`
          : `Hãy đọc câu tiếng Việt sau bằng giọng nữ trong trẻo, tươi tắn, dễ thương, phát âm chuẩn tiếng Việt: "${text}"`;

      for (const modelId of ttsModels) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${encodeURIComponent(
            apiKey
          )}`;
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: stylePrompt }] }],
              generationConfig: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName }
                  }
                }
              }
            })
          });

          if (!res.ok) continue;
          const data = await res.json();
          const inlineData =
            data?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
          if (inlineData && inlineData.data) {
            // Điều chỉnh tốc độ/cao độ nhẹ để giọng nghe cute tự nhiên
            const pitchRate = this.voiceGender === 'MALE' ? 1.04 : 1.09;
            await this.playBase64PcmAudio(inlineData.data, 24000, pitchRate);
            return true;
          }
        } catch (_) {}
      }
      return false;
    },

    playBase64PcmAudio(base64Data, sampleRate = 24000, playbackRate = 1.06) {
      return new Promise((resolve) => {
        try {
          const bin = atob(base64Data);
          const bytes = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) {
            bytes[i] = bin.charCodeAt(i);
          }
          const int16 = new Int16Array(bytes.buffer);
          const float32 = new Float32Array(int16.length);
          for (let i = 0; i < int16.length; i++) {
            float32[i] = int16[i] / 32768.0;
          }

          if (!this.audioCtx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioCtx();
          }
          if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
          }

          const buffer = this.audioCtx.createBuffer(
            1,
            float32.length,
            sampleRate
          );
          buffer.getChannelData(0).set(float32);

          const source = this.audioCtx.createBufferSource();
          source.buffer = buffer;
          source.playbackRate.value = playbackRate;
          source.connect(this.audioCtx.destination);
          this.activeSourceNode = source;
          source.onended = () => {
            this.activeSourceNode = null;
            resolve(true);
          };
          source.start(0);
        } catch (_) {
          resolve(false);
        }
      });
    },

    async speakViaVietnameseCloudStream(text) {
      try {
        const shortText = text.slice(0, 180);
        const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(
          shortText
        )}`;
        const audio = this.currentAudio;
        audio.src = url;
        // Giọng Nữ cute: nâng nhẹ tần số (1.18); Giọng Nam cute: trầm ấm vừa phải (0.94)
        if ('preservesPitch' in audio) audio.preservesPitch = false;
        if ('webkitPreservesPitch' in audio) audio.webkitPreservesPitch = false;
        audio.playbackRate = this.voiceGender === 'MALE' ? 0.94 : 1.16;
        await audio.play();
      } catch (_) {}
    }
  };

  // ==========================================================================
  // MODULE 4: CHATBOT VIÊN BI 2 CHẾ ĐỘ ĐỘC LẬP HOÀN TOÀN, XÓA SẠCH DẤU ** &
  // TÊN MODEL TRONG NGOẶC, KÉO THẢ MƯỢT MÀ 60FPS (FIX BUG 1, BUG 2, BUG 3, BUG 4)
  // ==========================================================================
  const COMPLETE_WEB_FEATURES_MAP = [
    {
      id: 'TAB_1_WRITING_DESK',
      title: '✍️ Tab 1: Bàn Viết Truyện Chính, Tiêu Đề Chương & Khung POV Kéo Thả',
      keywords: [
        'tab 1', 'màn hình 1', 'bàn viết', 'viết truyện', 'soạn thảo', 'tiêu đề chương',
        'tên chương', 'pov', 'bối cảnh', 'điểm nhìn', 'người kể', 'mốc giờ', 'địa điểm',
        'lưu bài', 'ctrl+s', 'hoàn tác', 'ctrl+z'
      ],
      desc: 'Tại Tab 1 (Bàn Viết Truyện), bạn soạn thảo nội dung tiểu thuyết chính, sửa Tiêu đề chương ở thanh trên cùng (tự động đồng bộ với các phần khác), bấm nút Duyệt & Chốt Bản Thảo ở góc phải, hoặc kéo thả tự do khung POV & Bối cảnh.',
      btnText: '✍️ Mở Ngay Tab 1: Bàn Viết Truyện',
      action: () => window.StudioStage18?.navigateToTab?.('SCREEN_1_WRITE')
    },
    {
      id: 'TAB_2_CHAPTER_TREE_AND_DISK',
      title: '📂 Tab 2: Cây Bản Thảo, Chọn Thư Mục Ổ Cứng, Nạp File & Hủy Duyệt Chương',
      keywords: [
        'tab 2', 'màn hình 2', 'cây bản thảo', 'chương truyện', 'file nguồn', 'ổ cứng',
        'thư mục', 'nạp file', 'docx', 'pdf', 'txt', 'file save', 'hủy duyệt', 'chưa duyệt',
        'sắp xếp chương', 'đổi tên chương', 'xóa chương', 'trục giờ giấc', 'tra cứu'
      ],
      desc: 'Tại Tab 2 (Chương & File Nguồn), cột trái gồm khung Kết nối ổ cứng (tự động lưu từng con chữ ra file Save tổng), Nạp file DOCX/PDF/TXT, tạo Chương nháp mới, lọc chương, sắp xếp Lên/Xuống, Đổi tên và nút "↩️ Hủy duyệt" để chuyển chương Đã chốt về lại Chưa duyệt.',
      btnText: '📂 Mở Ngay Tab 2: Chương & File Nguồn',
      action: () => window.StudioStage18?.navigateToTab?.('SCREEN_2_FILES')
    },
    {
      id: 'TAB_3_FULLSCREEN_AI_AND_APPROVE',
      title: '🤖 Tab 3: Chọn Chế Độ Chạy Mô Hình (Full Screen) & Duyệt Chốt Bản Thảo',
      keywords: [
        'tab 3', 'màn hình 3', 'trợ lý ai', 'nhập câu lệnh', 'prompt', 'chế độ 1', 'chế độ 2',
        'chế độ 3', 'chế độ 4', 'viết bản nháp', 'tham mưu', 'kiểm toán logic', 'review',
        'chọn mô hình', 'model', 'mức độ tư duy', 'thinking', 'số từ', 'chuyển cảnh',
        'câu lệnh hệ thống', 'duyệt bản thảo', 'chốt bản thảo', 'chat tự do'
      ],
      desc: 'Tại Tab 3 (Trợ Lý AI & Chat Gemini), bạn có 2 nút lớn: (1) Nút mở Cửa sổ Full Screen Chọn Chế Độ Chạy Mô Hình (chọn 4 chế độ AI, sửa câu lệnh hệ thống, chọn mô hình Gemini hiện hành, mức độ tư duy, số từ muốn xuất, xem Story Bible và nhập câu lệnh) và (2) Nút Duyệt & Chốt Bản Thảo Full Screen.',
      btnText: '🤖 Mở Ngay Tab 3: Trợ Lý AI & Chạy Mô Hình',
      action: () => window.StudioStage18?.navigateToTab?.('SCREEN_3_AI')
    },
    {
      id: 'TAB_4_STORY_BIBLE_AND_CHARACTERS',
      title: '🏛️ Tab 4: Story Bible Tự Động Nối Mạch, Khóa Kiểu Mẫu & Hồ Sơ Nhân Vật',
      keywords: [
        'tab 4', 'màn hình 4', 'story bible', 'khóa kiểu mẫu', 'mở khóa mẫu', 'dàn ý',
        'nhân vật', 'hồ sơ tâm lý', 'ai biết gì', 'bất cân xứng', 'phục bút', 'manh mối',
        'từ cấm', 'sáo rỗng', 'nhật ký', 'log'
      ],
      desc: 'Tại Tab 4 (Story Bible & Nhân Vật), bạn quản lý Khung dàn mẫu Story Bible (có nút Khóa/Mở kiểu mẫu), chọn các chương cần tổng hợp để AI tự động cập nhật Story Bible nối mạch từ Chương 1, và quản lý Hồ sơ nhân vật, Ma trận Ai biết gì, Sổ cái Phục bút, Danh sách từ cấm.',
      btnText: '🏛️ Mở Ngay Tab 4: Story Bible & Nhân Vật',
      action: () => window.StudioStage18?.navigateToTab?.('SCREEN_4_BIBLE')
    },
    {
      id: 'TAB_5_MUSIC_POMODORO_TYPOGRAPHY',
      title: '🎵 Tab 5: Trình Phát Nhạc (Lặp A-B), Đồng Hồ Pomodoro & Cỡ Chữ Trang Sách',
      keywords: [
        'tab 5', 'màn hình 5', 'nhạc', 'âm nhạc', 'mp3', 'lặp đoạn', 'a-b', 'tốc độ nhạc',
        'tua nhạc', 'pomodoro', 'đồng hồ', 'bấm giờ', 'tập trung', 'cỡ chữ', 'font chữ',
        'khổ trang', 'giãn dòng', 'light novel'
      ],
      desc: 'Tại Tab 5 (Nhạc, Không Gian & Chữ), bạn có 3 tùy chọn gọn gàng: (1) Mở trình phát nhạc MP3 & chỉnh dải lặp đoạn A-B, (2) Mở đồng hồ bấm giờ tập trung Pomodoro, (3) Chỉnh Font chữ, Cỡ chữ và Khổ trang sách Light Novel.',
      btnText: '🎵 Mở Ngay Tab 5: Nhạc, Pomodoro & Chữ',
      action: () => window.StudioStage18?.navigateToTab?.('SCREEN_5_AMBIENCE')
    },
    {
      id: 'TAB_6_SYSTEM_EXPORT_KEY_GUIDE',
      title: '⚙️ Tab 6: Hệ Thống & Cài Đặt, Đổi Key API, Xuất File DOCX/PDF/TXT & Video HD',
      keywords: [
        'tab 6', 'màn hình 6', 'hệ thống', 'cài đặt', 'key api', 'api key', 'đổi key',
        'màn hình đầu vào', 'xuất file', 'tải file', 'in sách', 'video hướng dẫn', 'tutorial',
        'loa thông báo', 'version 31', 'lịch sử cập nhật', 'điện thoại', 'laptop', 'múi giờ'
      ],
      desc: 'Tại Tab 6 (Hệ Thống & Cài Đặt), bạn có thể Mở Màn Hình Đầu Vào để đổi Key API & Thư mục ổ cứng, Xuất bản thảo ra file .DOCX / .PDF / .TXT, Xem Video HD Hướng Dẫn 5 phút, Mở Loa Thông Báo Phiên Bản và chỉnh kích thước khung Chat AI.',
      btnText: '⚙️ Mở Ngay Tab 6: Hệ Thống, Key API & Xuất File',
      action: () => window.StudioStage18?.navigateToTab?.('SCREEN_6_SYSTEM')
    }
  ];

  const DualSeparatedChatbotBiEngine = {
    currentMode: 'WEB_SUPPORT', // 'WEB_SUPPORT' | 'CASUAL_CHAT'
    casualChatHistory: [],

    /**
     * FIX BUG 2: Hàm làm sạch tuyệt đối câu trả lời của Chatbot:
     * - Xóa sạch mọi dấu **, *, #, `, ~~~
     * - Xóa sạch mọi cụm mở ngoặc tên model như (gemini-3.5-flash-lite), (gemini-2.5-flash)...
     */
    sanitizeBotReplyText(rawText) {
      if (!rawText) return '';
      return String(rawText)
        .replace(/\(gemini-[a-zA-Z0-9._-]+\)/gi, '')
        .replace(/\[\[CAP:[A-Z0-9_]+\]\]/gi, '')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/[*#_`~]+/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    },

    renderCuteBiSVG(pose = 'IDLE', size = 68) {
      const isHappy = pose === 'HAPPY';
      const eyes = isHappy
        ? `
          <path d="M 31 48 Q 37 40 43 48" stroke="#FFFFFF" stroke-width="3.4" stroke-linecap="round" fill="none"/>
          <path d="M 57 48 Q 63 40 69 48" stroke="#FFFFFF" stroke-width="3.4" stroke-linecap="round" fill="none"/>
        `
        : `
          <ellipse cx="37" cy="48" rx="6.2" ry="6.8" fill="#FFFFFF"/>
          <ellipse cx="38" cy="48.5" rx="4.2" ry="4.8" fill="#09090B"/>
          <circle cx="36" cy="46" r="2.2" fill="#FFFFFF"/>
          <ellipse cx="63" cy="48" rx="6.2" ry="6.8" fill="#FFFFFF"/>
          <ellipse cx="62" cy="48.5" rx="4.2" ry="4.8" fill="#09090B"/>
          <circle cx="60" cy="46" r="2.2" fill="#FFFFFF"/>
        `;

      return `
        <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="bi-mascot-avatar select-none">
          <path d="M 50 15 Q 48 6 41 8 Q 45 14 50 15" fill="#34D399"/>
          <path d="M 50 15 Q 53 5 60 8 Q 56 14 50 15" fill="#10B981"/>
          <line x1="40" y1="78" x2="36" y2="95" stroke="#10B981" stroke-width="4" stroke-linecap="round"/>
          <ellipse cx="33" cy="95" rx="5.5" ry="2.8" fill="#34D399"/>
          <line x1="60" y1="78" x2="64" y2="95" stroke="#10B981" stroke-width="4" stroke-linecap="round"/>
          <ellipse cx="67" cy="95" rx="5.5" ry="2.8" fill="#34D399"/>
          <path d="M 22 55 Q 10 62 18 70" stroke="#10B981" stroke-width="3.8" stroke-linecap="round" fill="none"/>
          <circle cx="18" cy="70" r="3.5" fill="#34D399"/>
          <path d="M 76 54 Q 92 40 88 24" stroke="#10B981" stroke-width="4" stroke-linecap="round" fill="none"/>
          <circle cx="88" cy="24" r="3.8" fill="#34D399"/>
          <circle cx="50" cy="48" r="32" fill="url(#biCuteGradV5)" stroke="#34D399" stroke-width="2.5"/>
          <ellipse cx="36" cy="27" rx="11" ry="5.5" transform="rotate(-22 36 27)" fill="rgba(255,255,255,0.28)"/>
          <circle cx="50" cy="26.5" r="9.5" fill="#FFFFFF"/>
          <text x="50" y="30.5" text-anchor="middle" fill="#09090B" font-size="12" font-weight="900" font-family="Inter, sans-serif">8</text>
          ${eyes}
          <ellipse cx="27.5" cy="54" rx="5.2" ry="2.8" fill="#FB7185" opacity="0.88"/>
          <ellipse cx="72.5" cy="54" rx="5.2" ry="2.8" fill="#FB7185" opacity="0.88"/>
          <path d="M 41 55 Q 50 67 59 55 Z" fill="#E11D48" stroke="#FFFFFF" stroke-width="2" stroke-linejoin="round"/>
          <defs>
            <radialGradient id="biCuteGradV5" cx="35%" cy="28%" r="72%">
              <stop offset="0%" stop-color="#52525B"/>
              <stop offset="45%" stop-color="#27272A"/>
              <stop offset="100%" stop-color="#09090B"/>
            </radialGradient>
          </defs>
        </svg>
      `;
    },

    init() {
      this.mountMascotAndDualChatPanel();
      this.enableSmooth60FpsDragging();
    },

    mountMascotAndDualChatPanel() {
      document.getElementById('s11-mascot-bi-corner')?.remove();
      document.getElementById('s11-mascot-bi-panel')?.remove();

      // 1. Quả cầu Linh vật Viên Bi ở góc màn hình (Kéo thả mượt mà)
      const corner = document.createElement('div');
      corner.id = 's11-mascot-bi-corner';
      corner.className =
        'fixed bottom-9 right-5 z-[2147483640] flex flex-col items-end gap-1.5 select-none cursor-grab active:cursor-grabbing';
      corner.innerHTML = `
        <div id="s11-bi-speech-bubble" class="px-3.5 py-2 rounded-2xl rounded-br-none bg-emerald-600 text-white text-[11px] font-bold shadow-2xl border border-emerald-400/60 max-w-[230px] cursor-pointer leading-snug">
          👋 Chào bạn! Mình là <b>Viên Bi Cute</b>. Giữ chuột để kéo mình đi bất cứ đâu hoặc bấm vào mình nhé!
        </div>
        <div id="btn-s11-open-bi-hub" title="Giữ chuột để kéo di chuyển Viên Bi, hoặc bấm để mở Trợ lý Viên Bi">
          ${this.renderCuteBiSVG('IDLE', 70)}
        </div>
      `;
      document.body.appendChild(corner);

      // 2. Bảng Chat Viên Bi với 2 KHUNG CHAT TÁCH BIỆT HOÀN TOÀN (Fix Bug 1, 2, 3)
      const panel = document.createElement('div');
      panel.id = 's11-mascot-bi-panel';
      panel.className =
        'hidden fixed bottom-24 right-5 z-[2147483642] w-[410px] max-w-[95vw] rounded-3xl border-2 border-emerald-500/75 bg-zinc-950 text-white shadow-2xl overflow-hidden flex flex-col max-h-[82vh] text-xs select-none';

      const genderLabel =
        GeminiCuteVietnameseVoiceEngine.voiceGender === 'MALE'
          ? '👦 Giọng Nam Cute'
          : '👧 Giọng Nữ Cute';

      panel.innerHTML = `
        <!-- Thanh tiêu đề nắm kéo di chuyển mượt mà -->
        <div id="s18-bi-panel-drag-handle" class="px-4 py-3 bg-gradient-to-r from-emerald-900/70 via-zinc-900 to-zinc-950 border-b border-zinc-800 flex items-center justify-between cursor-move">
          <div class="flex items-center gap-2.5">
            <div class="shrink-0">${this.renderCuteBiSVG('HAPPY', 44)}</div>
            <div>
              <h3 class="font-extrabold text-sm text-emerald-400">Trợ Lý AI Viên Bi Cute 🎱</h3>
              <p class="text-[10px] text-zinc-400 font-semibold">✋ Giữ thanh này để kéo di chuyển tự do</p>
            </div>
          </div>

          <div class="flex items-center gap-1">
            <button type="button" id="btn-s18-bi-gender-switch" class="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-zinc-950 border border-amber-500/40 font-extrabold text-[10px] transition" title="Đổi giữa Giọng Nam Cute và Giọng Nữ Cute">
              ${genderLabel}
            </button>
            <button type="button" id="btn-s18-bi-voice-toggle" class="px-2 py-1 rounded-lg ${
              GeminiCuteVietnameseVoiceEngine.voiceEnabled
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-800 text-zinc-400'
            } font-extrabold text-[10px] transition" title="Bật/Tắt giọng nói Tiếng Việt của Viên Bi">
              ${
                GeminiCuteVietnameseVoiceEngine.voiceEnabled
                  ? '🔊 BẬT'
                  : '🔇 TẮT'
              }
            </button>
            <button type="button" id="btn-s18-bi-panel-close" class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-red-600 font-extrabold text-xs">✕</button>
          </div>
        </div>

        <div class="p-3.5 space-y-3 overflow-y-auto flex-1 flex flex-col">
          
          <!-- Nút chuyển đổi 2 Chế Độ Riêng Biệt -->
          <div class="grid grid-cols-2 gap-2 shrink-0">
            <button type="button" id="btn-s18-tab-support" class="py-2 px-3 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-lg transition flex items-center justify-center gap-1.5">
              <span>🛠️ 1. Hỗ Trợ Trang Web</span>
            </button>
            <button type="button" id="btn-s18-tab-casual" class="py-2 px-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5">
              <span>💬 2. Trò Chuyện Gemini</span>
            </button>
          </div>

          <!-- ==================== KHUNG 1: CHỈ HỖ TRỢ TRANG WEB (CÓ Ô TÌM NHANH + CHẶN NGOÀI LUỒNG) ==================== -->
          <div id="s18-bi-mode1-support-container" class="flex-1 flex flex-col space-y-2.5 overflow-hidden">
            <div class="space-y-1 shrink-0">
              <input id="s18-bi-support-search" type="text" placeholder="🔍 Gõ tìm & mở nhanh tính năng (VD: duyệt chương, story bible, nhạc, pomodoro)..." class="w-full px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-zinc-900 text-xs focus:outline-none focus:border-emerald-400 select-text" />
              <div id="s18-bi-support-quicklinks" class="max-h-24 overflow-y-auto space-y-1 pt-0.5"></div>
            </div>

            <!-- Lịch sử Chat riêng của Chế độ 1 (Hỗ trợ trang web) -->
            <div id="s18-bi-support-messages-box" class="h-48 overflow-y-auto p-2.5 rounded-2xl bg-zinc-900/95 border border-emerald-500/40 space-y-2.5 select-text">
              <div class="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[11px] leading-relaxed">
                🎱 <b>Viên Bi:</b> Đây là <b>Chế độ 1 (Chuyên Hỗ Trợ Trang Web)</b>. Mình nắm rõ toàn bộ 6 Tab và mọi nút bấm trong web để giải đáp và mở trực tiếp giúp bạn! (Chế độ này chỉ trả lời về tính năng web; nếu bạn muốn tâm sự ngoài luồng, hãy bấm sang tab <b>💬 2. Trò Chuyện Gemini</b> bên cạnh nhé!).
              </div>
            </div>
          </div>

          <!-- ==================== KHUNG 2: TRÒ CHUYỆN GEMINI TỰ DO (HOÀN TOÀN TÁCH RIÊNG) ==================== -->
          <div id="s18-bi-mode2-casual-container" class="hidden flex-1 flex flex-col space-y-2 overflow-hidden">
            <div id="s18-bi-casual-messages-box" class="h-64 overflow-y-auto p-2.5 rounded-2xl bg-zinc-900/95 border border-amber-500/40 space-y-2.5 select-text">
              <div class="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-[11px] leading-relaxed">
                🎱 <b>Viên Bi:</b> Đây là <b>Chế độ 2 (Trò Chuyện Thường)</b> tách biệt hoàn toàn với kỹ thuật web. Bạn muốn tâm sự chuyện tình cảm, cuộc sống hay bất cứ điều gì thì cứ thoải mái kể cho Bi nghe nha!
              </div>
            </div>
          </div>

          <!-- Ô nhập tin nhắn dùng cho chế độ đang mở -->
          <div class="flex gap-1.5 shrink-0 pt-1">
            <input id="s18-bi-unified-input" type="text" autocomplete="off" placeholder="Hỏi Bi về tính năng trong trang web..." class="flex-1 px-3.5 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-xs focus:outline-none focus:border-emerald-400 select-text" />
            <button type="button" id="btn-s18-bi-unified-send" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow">
              Gửi
            </button>
          </div>

        </div>
      `;

      document.body.appendChild(panel);

      // Render danh sách nút mở nhanh trong Chế độ 1
      const renderSupportQuickLinks = (q = '') => {
        const box = document.getElementById('s18-bi-support-quicklinks');
        if (!box) return;
        const cleanQ = q.toLowerCase().trim();
        const filtered = COMPLETE_WEB_FEATURES_MAP.filter(
          (f) =>
            !cleanQ ||
            f.title.toLowerCase().includes(cleanQ) ||
            f.keywords.some((k) => k.includes(cleanQ))
        );
        box.innerHTML = filtered
          .map(
            (f) => `
            <button type="button" data-cap-id="${f.id}" class="w-full py-1.5 px-2.5 rounded-xl border border-zinc-800 hover:border-emerald-500 bg-zinc-950 hover:bg-emerald-950/50 text-left font-bold text-[11px] flex items-center justify-between transition">
              <span class="truncate">${f.title}</span>
              <span class="text-emerald-400 shrink-0 ml-2">Mở ➔</span>
            </button>
          `
          )
          .join('');

        box.querySelectorAll('[data-cap-id]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-cap-id');
            const found = COMPLETE_WEB_FEATURES_MAP.find((f) => f.id === id);
            if (found) found.action();
          });
        });
      };

      renderSupportQuickLinks('');

      document
        .getElementById('s18-bi-support-search')
        ?.addEventListener('input', (e) =>
          renderSupportQuickLinks(e.target.value)
        );

      // Sự kiện đóng bảng chat
      document
        .getElementById('btn-s18-bi-panel-close')
        ?.addEventListener('click', () => {
          panel.classList.add('hidden');
          GeminiCuteVietnameseVoiceEngine.stopSpeaking();
        });

      // Sự kiện đổi Giọng Nam Cute / Giọng Nữ Cute (Fix Bug 3)
      document
        .getElementById('btn-s18-bi-gender-switch')
        ?.addEventListener('click', (e) => {
          const newGender = GeminiCuteVietnameseVoiceEngine.toggleVoiceGender();
          e.currentTarget.textContent =
            newGender === 'MALE' ? '👦 Giọng Nam Cute' : '👧 Giọng Nữ Cute';
        });

      // Sự kiện bật/tắt giọng đọc
      document
        .getElementById('btn-s18-bi-voice-toggle')
        ?.addEventListener('click', (e) => {
          const on = !GeminiCuteVietnameseVoiceEngine.voiceEnabled;
          GeminiCuteVietnameseVoiceEngine.voiceEnabled = on;
          localStorage.setItem('noir_s18_bi_voice_on', String(on));
          e.currentTarget.textContent = on ? '🔊 BẬT' : '🔇 TẮT';
          e.currentTarget.className = `px-2 py-1 rounded-lg ${
            on ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400'
          } font-extrabold text-[10px] transition`;
          if (!on) GeminiCuteVietnameseVoiceEngine.stopSpeaking();
        });

      // Chuyển đổi giữa 2 Chế độ riêng biệt (Fix Bug 1)
      const btnTabSupport = document.getElementById('btn-s18-tab-support');
      const btnTabCasual = document.getElementById('btn-s18-tab-casual');
      const contSupport = document.getElementById(
        's18-bi-mode1-support-container'
      );
      const contCasual = document.getElementById(
        's18-bi-mode2-casual-container'
      );
      const unifiedInput = document.getElementById('s18-bi-unified-input');

      const switchMode = (targetMode) => {
        this.currentMode = targetMode;
        if (targetMode === 'WEB_SUPPORT') {
          contSupport?.classList.remove('hidden');
          contCasual?.classList.add('hidden');
          if (btnTabSupport) {
            btnTabSupport.className =
              'py-2 px-3 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-lg transition flex items-center justify-center gap-1.5';
          }
          if (btnTabCasual) {
            btnTabCasual.className =
              'py-2 px-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5';
          }
          if (unifiedInput) {
            unifiedInput.placeholder =
              'Hỏi Bi vị trí nút bấm hoặc tính năng trong trang web...';
          }
        } else {
          contSupport?.classList.add('hidden');
          contCasual?.classList.remove('hidden');
          if (btnTabCasual) {
            btnTabCasual.className =
              'py-2 px-3 rounded-xl bg-amber-600 text-white font-extrabold text-xs shadow-lg transition flex items-center justify-center gap-1.5';
          }
          if (btnTabSupport) {
            btnTabSupport.className =
              'py-2 px-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5';
          }
          if (unifiedInput) {
            unifiedInput.placeholder =
              'Trò chuyện, tâm sự tự do mọi chủ đề cùng Viên Bi...';
          }
        }
      };

      btnTabSupport?.addEventListener('click', () => switchMode('WEB_SUPPORT'));
      btnTabCasual?.addEventListener('click', () => switchMode('CASUAL_CHAT'));

      const submitChatMessage = () => {
        const val = (unifiedInput?.value || '').trim();
        if (!val) return;
        unifiedInput.value = '';
        if (this.currentMode === 'WEB_SUPPORT') {
          this.handleMode1StrictWebSupport(val);
        } else {
          this.handleMode2FreeCasualChat(val);
        }
      };

      document
        .getElementById('btn-s18-bi-unified-send')
        ?.addEventListener('click', submitChatMessage);
      unifiedInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') submitChatMessage();
      });
    },

    /**
     * XỬ LÝ CHẾ ĐỘ 1 (CHỈ HỖ TRỢ TRANG WEB - FIX BUG 1 & BUG 2):
     * - Kiểm tra nghiêm ngặt: Nếu câu hỏi không liên quan đến tính năng web (VD: "Tôi nhớ Bơ",
     *   tâm sự tình cảm, hỏi chuyện ngoài luồng) -> TỪ CHỐI NGAY LẬP TỨC và kèm nút chuyển sang Chế độ 2!
     * - Nếu liên quan đến tính năng web -> Giải đáp rõ ràng (không có dấu **, không có tên model) + Nút Mở Trực Tiếp!
     */
    async handleMode1StrictWebSupport(userQuestion) {
      const box = document.getElementById('s18-bi-support-messages-box');
      if (!box) return;

      const uBubble = document.createElement('div');
      uBubble.className =
        'p-2 rounded-xl bg-zinc-800 text-right font-bold text-[11px] text-white';
      uBubble.textContent = `Bạn: ${userQuestion}`;
      box.appendChild(uBubble);
      box.scrollTop = box.scrollHeight;

      const qLower = userQuestion.toLowerCase().trim();

      // Danh sách toàn bộ từ khóa thuộc phạm vi trang web
      const allWebKeywords = [
        'tab', 'màn hình', 'chương', 'bản thảo', 'story bible', 'nhân vật', 'phục bút',
        'ai biết gì', 'từ cấm', 'nhạc', 'mp3', 'a-b', 'lặp', 'pomodoro', 'đồng hồ',
        'cỡ chữ', 'font', 'khổ trang', 'xuất file', 'docx', 'pdf', 'txt', 'in sách',
        'key', 'api', 'mô hình', 'model', 'gemini', 'flash', 'pro', 'tư duy', 'thinking',
        'số từ', 'câu lệnh', 'prompt', 'chế độ', 'duyệt', 'chốt', 'hủy duyệt', 'nháp',
        'ổ cứng', 'thư mục', 'lưu', 'save', 'hoàn tác', 'undo', 'redo', 'pov', 'bối cảnh',
        'điểm nhìn', 'chuyển cảnh', 'video', 'hướng dẫn', 'tutorial', 'loa', 'version',
        'phiên bản', 'cập nhật', 'cài đặt', 'hệ thống', 'múi giờ', 'laptop', 'điện thoại',
        'web', 'nút', 'ở đâu', 'làm sao', 'cách dùng', 'mở', 'đóng', 'thu gọn', 'phóng to'
      ];

      const isRelatedToWeb = allWebKeywords.some((kw) => qLower.includes(kw));

      // 1. NẾU CÂU HỎI NGOÀI LUỒNG (KHÔNG LIÊN QUAN ĐẾN TÍNH NĂNG TRANG WEB):
      // Chặn đứng ngay tại chỗ, không gọi AI lan man như trong ảnh image_312994.png!
      if (!isRelatedToWeb) {
        const rejectText =
          'Ở Chế độ 1 (Hỗ Trợ Trang Web), Viên Bi chỉ được phép giải đáp và mở trực tiếp các tính năng bên trong trang web viết tiểu thuyết thôi nè! Để tâm sự hoặc trò chuyện ngoài luồng, bạn bấm nút chuyển sang Chế độ 2 (Trò Chuyện Gemini) ngay bên dưới nhé!';

        const rCard = document.createElement('div');
        rCard.className =
          'p-3 rounded-xl bg-amber-500/15 border border-amber-500/50 space-y-2 text-[11px] leading-relaxed';
        rCard.innerHTML = `
          <div>🎱 <b>Viên Bi:</b> ${rejectText}</div>
          <button type="button" class="btn-switch-to-casual w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow transition">
            💬 Chuyển Sang Chế Độ 2 (Trò Chuyện Thường) & Gửi Câu Này Ngay
          </button>
        `;
        box.appendChild(rCard);
        box.scrollTop = box.scrollHeight;
        GeminiCuteVietnameseVoiceEngine.speakVietnameseCute(rejectText);

        rCard
          .querySelector('.btn-switch-to-casual')
          ?.addEventListener('click', () => {
            document.getElementById('btn-s18-tab-casual')?.click();
            this.handleMode2FreeCasualChat(userQuestion);
          });
        return;
      }

      // 2. NẾU CÂU HỎI LIÊN QUAN ĐẾN TÍNH NĂNG TRANG WEB:
      // Tìm tính năng khớp nhất để gắn nút Mở Trực Tiếp 1-Click
      let bestCap = COMPLETE_WEB_FEATURES_MAP[0];
      let maxScore = 0;
      for (const cap of COMPLETE_WEB_FEATURES_MAP) {
        let sc = 0;
        for (const kw of cap.keywords) {
          if (qLower.includes(kw)) sc += kw.length * 3;
        }
        if (sc > maxScore) {
          maxScore = sc;
          bestCap = cap;
        }
      }

      const waitDiv = document.createElement('div');
      waitDiv.className =
        'p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[11px]';
      waitDiv.textContent = '🎱 Viên Bi: Đang tra cứu bản đồ tính năng trang web...';
      box.appendChild(waitDiv);
      box.scrollTop = box.scrollHeight;

      const fullWebContext = COMPLETE_WEB_FEATURES_MAP.map(
        (c) => `- ${c.title}: ${c.desc}`
      ).join('\n');

      let replyText = bestCap.desc;
      const apiKey =
        MasterApiKeyVault.activeKey || MasterApiKeyVault.loadPersistedKey();

      if (apiKey) {
        try {
          const res = await window.StudioStage3.geminiClient.generateContent({
            apiKey,
            modelId: 'gemini-3.5-flash-lite',
            thinkingLevel: 'low',
            systemInstruction: `Bạn là Trợ lý Kỹ thuật Chuyên trách của trang web "Web viết tiểu thuyết của Bi".
DƯỚI ĐÂY LÀ TOÀN BỘ BẢN ĐỒ TÍNH NĂNG TRONG WEB:
${fullWebContext}
QUY TẮC BẮT BUỘC:
1. Chỉ trả lời ngắn gọn (2-4 câu) hướng dẫn đúng tính năng trong web mà người dùng đang hỏi.
2. Tuyệt đối KHÔNG trả lời bất kỳ nội dung nào ngoài tính năng của trang web.
3. Tuyệt đối KHÔNG dùng ký tự dấu sao (** hoặc *) hay dấu thăng (#) trong câu trả lời.`,
            userPrompt: userQuestion,
            temperature: 0.15,
            maxOutputTokens: 1024
          });
          if (res?.text) {
            replyText = this.sanitizeBotReplyText(res.text);
          }
        } catch (_) {}
      }

      waitDiv.remove();

      const card = document.createElement('div');
      card.className =
        'p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 space-y-2 text-[11px] leading-relaxed';
      card.innerHTML = `
        <div>🎱 <b>Viên Bi:</b> ${replyText}</div>
        <button type="button" class="btn-open-direct-feature w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow transition">
          ${bestCap.btnText}
        </button>
      `;
      box.appendChild(card);
      box.scrollTop = box.scrollHeight;

      GeminiCuteVietnameseVoiceEngine.speakVietnameseCute(replyText);

      card
        .querySelector('.btn-open-direct-feature')
        ?.addEventListener('click', () => {
          bestCap.action();
        });
    },

    /**
     * XỬ LÝ CHẾ ĐỘ 2 (TRÒ CHUYỆN GEMINI TỰ DO - FIX BUG 1 & BUG 2):
     * Tách biệt hoàn toàn trên khung #s18-bi-casual-messages-box, không có dấu ** và không có (gemini-3.5-flash-lite)
     */
    async handleMode2FreeCasualChat(userText) {
      const box = document.getElementById('s18-bi-casual-messages-box');
      if (!box) return;

      const uBubble = document.createElement('div');
      uBubble.className =
        'p-2 rounded-xl bg-amber-500/20 text-right font-bold text-[11px] text-white';
      uBubble.textContent = `Bạn: ${userText}`;
      box.appendChild(uBubble);

      const rBubble = document.createElement('div');
      rBubble.className =
        'p-2.5 rounded-xl bg-zinc-900 border border-amber-500/40 text-[11px] leading-relaxed';
      rBubble.textContent = '🎱 Viên Bi: Đang suy nghĩ...';
      box.appendChild(rBubble);
      box.scrollTop = box.scrollHeight;

      const apiKey =
        MasterApiKeyVault.activeKey || MasterApiKeyVault.loadPersistedKey();
      if (!apiKey) {
        rBubble.textContent =
          '🎱 Viên Bi: Bạn hãy kết nối Google Gemini API Key ở Tab 6 (Hệ thống & Cài đặt) để trò chuyện cùng Bi nhé!';
        return;
      }

      this.casualChatHistory.push({ role: 'user', text: userText });
      const transcript = this.casualChatHistory
        .slice(-8)
        .map((m) => `${m.role === 'user' ? 'Người dùng' : 'Viên Bi'}: ${m.text}`)
        .join('\n');

      try {
        const res = await window.StudioStage3.geminiClient.generateContent({
          apiKey,
          modelId: 'gemini-3.5-flash-lite',
          thinkingLevel: 'low',
          systemInstruction:
            'Bạn là Viên Bi, người bạn thân thiết, tâm lý, chân thành và ấm áp của người dùng. Hãy trò chuyện tự nhiên, đúng trọng tâm câu chuyện người dùng đang chia sẻ. TUYỆT ĐỐI KHÔNG dùng dấu sao (** hoặc *) trong câu trả lời.',
          userPrompt: transcript,
          temperature: 0.75,
          maxOutputTokens: 1500
        });

        const cleanAnswer = this.sanitizeBotReplyText(res.text);
        this.casualChatHistory.push({ role: 'model', text: cleanAnswer });
        // FIX BUG 2: Chỉ hiện "🎱 Viên Bi:", tuyệt đối không có "(gemini-3.5-flash-lite)" hay dấu **
        rBubble.textContent = `🎱 Viên Bi: ${cleanAnswer}`;
        GeminiCuteVietnameseVoiceEngine.speakVietnameseCute(cleanAnswer);
      } catch (err) {
        rBubble.textContent = `🎱 Viên Bi: Tạm thời chưa kết nối được (${err.message}).`;
      }
      box.scrollTop = box.scrollHeight;
    },

    /**
     * FIX BUG 4: KÉO THẢ DI CHUYỂN MƯỢT MÀ 60FPS CHO CẢ QUẢ CẦU VIÊN BI LẪN BẢNG CHAT
     */
    enableSmooth60FpsDragging() {
      const corner = document.getElementById('s11-mascot-bi-corner');
      const panel = document.getElementById('s11-mascot-bi-panel');
      const panelHandle = document.getElementById('s18-bi-panel-drag-handle');
      const openBtn = document.getElementById('btn-s11-open-bi-hub');
      const bubble = document.getElementById('s11-bi-speech-bubble');

      const attachDrag = (targetEl, handleEl, storageKey, onClickIfNoDrag) => {
        if (!targetEl || !handleEl) return;

        try {
          const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
          if (saved && typeof saved.x === 'number' && typeof saved.y === 'number') {
            const x = Math.max(8, Math.min(window.innerWidth - 80, saved.x));
            const y = Math.max(8, Math.min(window.innerHeight - 80, saved.y));
            targetEl.style.right = 'auto';
            targetEl.style.bottom = 'auto';
            targetEl.style.left = `${x}px`;
            targetEl.style.top = `${y}px`;
          }
        } catch (_) {}

        let isDown = false;
        let moved = false;
        let startX = 0;
        let startY = 0;
        let initLeft = 0;
        let initTop = 0;

        handleEl.addEventListener('pointerdown', (e) => {
          if (
            e.target.closest('button') &&
            handleEl === panelHandle
          ) {
            return;
          }
          isDown = true;
          moved = false;
          const rect = targetEl.getBoundingClientRect();
          startX = e.clientX;
          startY = e.clientY;
          initLeft = rect.left;
          initTop = rect.top;
          handleEl.setPointerCapture?.(e.pointerId);
        });

        handleEl.addEventListener('pointermove', (e) => {
          if (!isDown) return;
          const dx = e.clientX - startX;
          const dy = e.clientY - startY;
          if (!moved && Math.hypot(dx, dy) > 5) {
            moved = true;
          }
          if (moved) {
            const nextL = Math.max(
              6,
              Math.min(
                window.innerWidth - targetEl.offsetWidth - 6,
                initLeft + dx
              )
            );
            const nextT = Math.max(
              6,
              Math.min(
                window.innerHeight - targetEl.offsetHeight - 6,
                initTop + dy
              )
            );
            targetEl.style.right = 'auto';
            targetEl.style.bottom = 'auto';
            targetEl.style.left = `${nextL}px`;
            targetEl.style.top = `${nextT}px`;
          }
        });

        handleEl.addEventListener('pointerup', (e) => {
          if (!isDown) return;
          isDown = false;
          handleEl.releasePointerCapture?.(e.pointerId);
          if (moved) {
            const rect = targetEl.getBoundingClientRect();
            localStorage.setItem(
              storageKey,
              JSON.stringify({ x: Math.round(rect.left), y: Math.round(rect.top) })
            );
          } else if (typeof onClickIfNoDrag === 'function') {
            onClickIfNoDrag();
          }
        });
      };

      const toggleBiPanel = () => {
        panel?.classList.toggle('hidden');
        bubble?.classList.add('hidden');
      };

      attachDrag(
        corner,
        openBtn,
        'noir_s18_v5_bi_corner_pos',
        toggleBiPanel
      );
      attachDrag(panel, panelHandle, 'noir_s18_v5_bi_panel_pos', null);

      bubble?.addEventListener('click', toggleBiPanel);
    }
  };
  // ==========================================================================
  // MODULE 5: LÀM SẠCH TUYỆT ĐỐI TAB 1 & TAB 2 — CHỈ ĐỂ LẠI TIÊU ĐỀ CHƯƠNG
  // ĐỒNG BỘ 2 CHIỀU & NÚT DUYỆT BẢN THẢO Ở GÓC TRÊN TAB 1 (FIX BUG 5, 6, 9)
  // ==========================================================================
  const CleanTab1AndTab2HeaderController = {
    init() {
      this.injectCleanHeaderCSS();
      this.buildMinimalSynchronizedHeaderBar();
      this.bindTwoWayChapterTitleSync();
    },

    injectCleanHeaderCSS() {
      if (document.getElementById('s18-v5-clean-headers-css')) return;
      const style = document.createElement('style');
      style.id = 's18-v5-clean-headers-css';
      style.textContent = `
        /* 1. Xóa vĩnh viễn các thanh công cụ rườm rà, khung Key API phụ, nhãn Đã duyệt/Đang nháp,
           nút Lưu nháp, Mở khóa về nháp ở đầu khung soạn thảo (Fix ảnh 30adf1, 30535a, 305018, 304c17, 2fe6ff) */
        #s17-manuscript-top-toggle-strip,
        #editor-metadata-bar,
        #s18-tab3-compact-master-header,
        #s18-tab3-apikey-bar,
        #stage2-telemetry-mount-point,
        #stage2-continuation-bar-mount {
          display: none !important;
        }

        /* 2. Ẩn ký tự Key API bằng CSS để trình duyệt không bao giờ hiện bảng "Manage passwords..." (Fix ảnh 305b59) */
        .s18-masked-key-input {
          -webkit-text-security: disc !important;
          text-security: disc !important;
        }

        /* 3. Ở Tab 1 và Tab 2: Khung bản thảo luôn mở rộng 100% chiều ngang, ẩn khung câu lệnh trái */
        body[data-s14-screen="SCREEN_1_WRITE"] #pane-left-beats,
        body[data-s14-screen="SCREEN_2_FILES"] #pane-left-beats {
          display: none !important;
        }
        body[data-s14-screen="SCREEN_1_WRITE"] #pane-right-manuscript,
        body[data-s14-screen="SCREEN_2_FILES"] #pane-right-manuscript {
          grid-column: span 12 / span 12 !important;
          width: 100% !important;
        }

        /* 4. Ở Tab 2 (Chương & File Nguồn): Ẩn cả nút Duyệt trên thanh tiêu đề để đúng yêu cầu Bug 6 */
        body[data-s14-screen="SCREEN_2_FILES"] #btn-s18-tab1-corner-approve,
        body[data-s14-screen="SCREEN_2_FILES"] #s18-tab3-two-big-buttons-bar {
          display: none !important;
        }

        /* 5. Thanh 2 Nút To của Tab 3 chỉ hiển thị khi đang ở Tab 3 (SCREEN_3_AI) */
        body:not([data-s14-screen="SCREEN_3_AI"]) #s18-tab3-two-big-buttons-bar {
          display: none !important;
        }
        body[data-s14-screen="SCREEN_3_AI"] #s18-tab3-two-big-buttons-bar {
          display: flex !important;
        }
        body[data-s14-screen="SCREEN_3_AI"] #s18-minimal-chapter-header-bar {
          display: none !important;
        }
        body[data-s14-screen="SCREEN_3_AI"] #pane-left-beats {
          display: none !important;
        }
        body[data-s14-screen="SCREEN_3_AI"] #pane-right-manuscript {
          grid-column: span 12 / span 12 !important;
          width: 100% !important;
        }
      `;
      document.head.appendChild(style);
    },

    /**
     * Thanh Tiêu Đề Chương Tối Giản ở Tab 1 & Tab 2:
     * - Chỉ hiển thị: Số thứ tự chương + Ô Tiêu đề chương (liên kết đồng bộ mọi nơi)
     * - Ở góc phải Tab 1: Chỉ có duy nhất nút "✅ DUYỆT & CHỐT BẢN THẢO"
     */
    buildMinimalSynchronizedHeaderBar() {
      const centerPane = document.getElementById('center-editor-pane');
      if (!centerPane || document.getElementById('s18-minimal-chapter-header-bar'))
        return;

      const cleanBar = document.createElement('div');
      cleanBar.id = 's18-minimal-chapter-header-bar';
      cleanBar.className =
        'px-4 py-2 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between gap-3 shrink-0 select-none';

      cleanBar.innerHTML = `
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <span class="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-extrabold text-xs shrink-0">
            📖 Chương
          </span>
          <input
            id="s18-clean-chapter-num"
            type="number"
            min="1"
            value="1"
            autocomplete="off"
            class="w-14 px-2 py-1.5 text-xs font-monoCode font-bold rounded-xl border border-zinc-700 bg-zinc-900 text-emerald-400 text-center focus:outline-none focus:border-emerald-500"
            title="Số thứ tự chương"
          />
          <input
            id="s18-clean-chapter-title"
            type="text"
            autocomplete="off"
            name="studio_clean_chapter_title_sync"
            placeholder="Nhập tiêu đề chương tại đây (Tự động đồng bộ toàn hệ thống)..."
            class="flex-1 min-w-[180px] px-3.5 py-1.5 text-xs md:text-sm font-extrabold rounded-xl border border-zinc-700 bg-zinc-900 text-white focus:outline-none focus:border-emerald-500 select-text"
          />
        </div>

        <!-- Góc trên bên phải Tab 1: Duy nhất nút Duyệt & Chốt Bản Thảo -->
        <button
          type="button"
          id="btn-s18-tab1-corner-approve"
          class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition flex items-center gap-1.5 shrink-0"
        >
          <span>✅ DUYỆT & CHỐT BẢN THẢO</span>
        </button>
      `;

      centerPane.prepend(cleanBar);

      document
        .getElementById('btn-s18-tab1-corner-approve')
        ?.addEventListener('click', () => {
          FullScreenTab3AndApprovalWorkbench.openFullScreenApprovalModal();
        });
    },

    /**
     * Đồng bộ 2 chiều thời gian thực giữa Ô Tiêu Đề Chương của Tab 1/2 với Cây Bản Thảo & toàn bộ các Tab
     */
    bindTwoWayChapterTitleSync() {
      const cleanNum = document.getElementById('s18-clean-chapter-num');
      const cleanTitle = document.getElementById('s18-clean-chapter-title');
      const origNum = document.getElementById('input-chapter-number');
      const origTitle = document.getElementById('input-chapter-title');

      const syncFromActiveChapterToCleanBar = () => {
        const activeChap =
          window.StudioCore?.approvalGate?.getActiveChapter?.();
        if (!activeChap) return;
        const numVal = activeChap.chapterNumber || 1;
        const titleVal = activeChap.displayTitle || activeChap.title || '';

        if (cleanNum && document.activeElement !== cleanNum) {
          cleanNum.value = String(numVal);
        }
        if (cleanTitle && document.activeElement !== cleanTitle) {
          cleanTitle.value = titleVal;
        }
        const fsTitleBadge = document.getElementById(
          's18-fs-current-chapter-badge'
        );
        if (fsTitleBadge) {
          fsTitleBadge.textContent = `Chương ${numVal}: ${titleVal}`;
        }
      };

      const pushCleanBarChangesEverywhere = () => {
        const activeChap =
          window.StudioCore?.approvalGate?.getActiveChapter?.();
        const newNum = parseInt(cleanNum?.value || '1', 10) || 1;
        const newTitle = (cleanTitle?.value || '').trim();

        if (origNum) origNum.value = String(newNum);
        if (origTitle && newTitle) origTitle.value = newTitle;

        if (activeChap) {
          activeChap.chapterNumber = newNum;
          if (newTitle) {
            activeChap.title = newTitle;
            activeChap.displayTitle = newTitle;
          }
        }

        window.StudioCore?.controller?.renderChaptersTree?.();
        window.StudioCore?.controller?.saveWorkspaceStateToIDB?.();

        const fsTitleBadge = document.getElementById(
          's18-fs-current-chapter-badge'
        );
        if (fsTitleBadge) {
          fsTitleBadge.textContent = `Chương ${newNum}: ${newTitle}`;
        }
      };

      cleanNum?.addEventListener('input', pushCleanBarChangesEverywhere);
      cleanTitle?.addEventListener('input', pushCleanBarChangesEverywhere);

      // Mỗi khi người dùng click chọn chương khác ở Cây bản thảo Tab 2, đồng bộ ngay lên thanh tiêu đề
      document.addEventListener('click', (e) => {
        if (
          e.target.closest('#list-draft-chapters, #list-approved-chapters')
        ) {
          setTimeout(syncFromActiveChapterToCleanBar, 40);
        }
      });

      setInterval(syncFromActiveChapterToCleanBar, 700);
    }
  };

  // ==========================================================================
  // MODULE 6: ĐẠI TU TAB 3 — CHỈ ĐỂ LẠI 2 NÚT TO MỞ CỬA SỔ FULL SCREEN
  // (CHỌN CHẾ ĐỘ CHẠY MÔ HÌNH / NHẬP LỆNH & DUYỆT CHỐT BẢN THẢO KHÔNG TRÀN VIỀN)
  // (FIX BUG 7)
  // ==========================================================================
  const FullScreenTab3AndApprovalWorkbench = {
    lastSynthesizedPayload: null,

    init() {
      this.injectTwoBigButtonsInTab3();
      this.buildFullScreenAiCommandModal();
      this.upgradeApprovalModalToFullScreenNonOverflow();
    },

    /**
     * Tại Tab 3 (3. Trợ Lý AI & Chat Gemini):
     * Xóa sạch các khung phụ và khung Key API, chỉ hiển thị 2 Nút To trên đầu trang bản thảo
     */
    injectTwoBigButtonsInTab3() {
      const centerPane = document.getElementById('center-editor-pane');
      if (!centerPane || document.getElementById('s18-tab3-two-big-buttons-bar'))
        return;

      const bigBar = document.createElement('div');
      bigBar.id = 's18-tab3-two-big-buttons-bar';
      bigBar.className =
        'px-5 py-3.5 border-b-2 border-emerald-500/40 bg-zinc-950 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0 select-none';

      bigBar.innerHTML = `
        <button
          type="button"
          id="btn-s18-tab3-big-open-ai-modal"
          class="flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs md:text-sm shadow-xl transition transform active:scale-[0.99] flex items-center justify-center gap-2.5"
        >
          <span class="text-lg">🎛️</span>
          <span>CHỌN CHẾ ĐỘ CHẠY MÔ HÌNH, THÔNG SỐ & NHẬP CÂU LỆNH AI (FULL SCREEN)</span>
        </button>

        <button
          type="button"
          id="btn-s18-tab3-big-open-approve-modal"
          class="sm:w-80 py-3.5 px-5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs md:text-sm shadow-xl transition transform active:scale-[0.99] flex items-center justify-center gap-2"
        >
          <span class="text-lg">✅</span>
          <span>DUYỆT & CHỐT BẢN THẢO</span>
        </button>
      `;

      centerPane.prepend(bigBar);

      document
        .getElementById('btn-s18-tab3-big-open-ai-modal')
        ?.addEventListener('click', () => {
          this.openFullScreenAiWorkbench();
        });

      document
        .getElementById('btn-s18-tab3-big-open-approve-modal')
        ?.addEventListener('click', () => {
          this.openFullScreenApprovalModal();
        });
    },

    /**
     * CỬA SỔ FULL SCREEN 1: CHỌN CHẾ ĐỘ CHẠY MÔ HÌNH, SỐ TỪ, STORY BIBLE, NHẬP CÂU LỆNH & DUYỆT
     * (Thiết kế 100vw x 100vh chống tràn viền tuyệt đối)
     */
    buildFullScreenAiCommandModal() {
      if (document.getElementById('modal-s18-fullscreen-ai-workbench')) return;

      const modal = document.createElement('div');
      modal.id = 'modal-s18-fullscreen-ai-workbench';
      modal.className =
        'hidden fixed inset-0 w-screen h-screen bg-zinc-950 z-[2147483643] flex flex-col overflow-hidden text-xs text-white select-none';

      modal.innerHTML = `
        <!-- Header Cố Định Trên Cùng -->
        <div class="px-6 py-3.5 border-b border-zinc-800 bg-zinc-900 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div class="flex items-center gap-3">
            <span class="px-3 py-1 rounded-xl bg-emerald-600 text-white font-extrabold text-xs">
              🎛️ TRUNG TÂM CHỌN CHẾ ĐỘ CHẠY MÔ HÌNH & NHẬP CÂU LỆNH (FULL SCREEN)
            </span>
            <span id="s18-fs-current-chapter-badge" class="font-monoCode font-bold text-amber-400 text-xs">
              Chương 1
            </span>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" id="btn-s18-fs-open-approve-inside" class="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow transition">
              ✅ Mở Khung Duyệt & Chốt Bản Thảo
            </button>
            <button type="button" id="btn-s18-fs-close-workbench" class="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-red-600 text-white font-extrabold text-xs transition">
              ✕ Đóng Cửa Sổ (Quay Về Bản Thảo)
            </button>
          </div>
        </div>

        <!-- Thân Giữa Cuộn Mượt Mà (Không bao giờ tràn viền) -->
        <div class="flex-1 overflow-y-auto p-6 space-y-5 max-w-6xl w-full mx-auto">
          
          <!-- KHỐI 1: CHỌN CHẾ ĐỘ (1-4), MÔ HÌNH HIỆN HÀNH, MỨC TƯ DUY & SỐ TỪ MUỐN XUẤT -->
          <div class="p-5 rounded-2xl border border-emerald-500/40 bg-zinc-900/90 space-y-4 shadow-lg">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
              
              <!-- 1. Chế độ làm việc + Nút Xem/Sửa Câu Lệnh Hệ Thống -->
              <div class="lg:col-span-5 space-y-1.5">
                <div class="flex items-center justify-between">
                  <label class="font-extrabold uppercase text-[11px] text-emerald-400">
                    1. CHỌN CHẾ ĐỘ LÀM VIỆC CỦA AI:
                  </label>
                  <button type="button" id="btn-s18-fs-edit-system-rule" class="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 font-extrabold text-[10px] transition">
                    📜 Xem & Sửa Khung Câu Lệnh Hệ Thống
                  </button>
                </div>
                <select id="s18-fullscreen-mode-select" class="w-full px-3.5 py-2.5 rounded-xl border-2 border-emerald-500/60 bg-zinc-950 text-emerald-400 font-extrabold text-xs focus:outline-none">
                  <option value="MODE_1_DRAFT">✍️ Chế độ 1: Viết Bản Nháp Chậm (Chi tiết tâm lý sâu, thoại: - Câu thoại (Tên))</option>
                  <option value="MODE_2_ADVISOR">🧭 Chế độ 2: Tham Mưu Cốt Truyện, Phục Bút & Unreliable Narrator</option>
                  <option value="MODE_3_AUDIT">🔍 Chế độ 3: Kiểm Toán Logic, Trục Giờ Giấc, Ngoại Phạm & Chính Tả</option>
                  <option value="MODE_4_REVIEW">📊 Chế độ 4: Review Tổng Thể Đa Chiều & Đánh Giá Nhịp Độ Chương</option>
                </select>
              </div>

              <!-- 2. Chọn Mô Hình Gemini Hiện Hành (Đã lọc sạch model rác) -->
              <div class="lg:col-span-3 space-y-1.5">
                <label class="block font-extrabold uppercase text-[11px] text-amber-400">
                  2. MÔ HÌNH GEMINI HIỆN HÀNH:
                </label>
                <select id="s18-fullscreen-model-select" class="w-full px-3 py-2.5 rounded-xl border border-zinc-700 bg-zinc-950 font-monoCode font-bold text-white text-xs focus:outline-none focus:border-emerald-500"></select>
              </div>

              <!-- 3. Mức Độ Tư Duy -->
              <div class="lg:col-span-2 space-y-1.5">
                <label class="block font-extrabold uppercase text-[11px] text-indigo-400">
                  3. MỨC ĐỘ TƯ DUY:
                </label>
                <select id="s18-fullscreen-thinking-select" class="w-full px-3 py-2.5 rounded-xl border border-zinc-700 bg-zinc-950 font-bold text-emerald-400 text-xs focus:outline-none">
                  <option value="high">🧠 Cao (High - Sâu sắc)</option>
                  <option value="medium">⚖️ Vừa (Medium - Cân bằng)</option>
                  <option value="low">⚡ Thấp (Low - Nhanh)</option>
                </select>
              </div>

              <!-- 4. Số Từ Muốn Xuất -->
              <div class="lg:col-span-2 space-y-1.5">
                <label class="block font-extrabold uppercase text-[11px] text-emerald-400">
                  4. SỐ TỪ MUỐN XUẤT:
                </label>
                <input id="s18-fullscreen-word-count" type="number" min="300" max="50000" step="500" value="4500" class="w-full px-3 py-2.5 rounded-xl border-2 border-emerald-500/60 bg-zinc-950 font-monoCode font-extrabold text-emerald-400 text-xs focus:outline-none" />
              </div>

            </div>
          </div>

          <!-- KHỐI 2: LIÊN KẾT STORY BIBLE & CHÈN MỐC CHUYỂN ĐỔI PHÂN CẢNH -->
          <div class="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/75 flex flex-wrap items-center justify-between gap-3">
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-extrabold uppercase text-[11px] text-amber-400">
                🏛️ Liên Kết Story Bible & Phân Cảnh:
              </span>
              <button type="button" id="btn-s18-fs-view-bible" class="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-zinc-950 border border-amber-500/40 font-extrabold text-xs transition">
                🏛️ Xem / Sửa Khung Story Bible Đang Áp Dụng
              </button>
              <button type="button" id="btn-s18-fs-insert-scene" class="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 font-extrabold text-xs transition">
                🎬 + Chèn Mốc Chuyển Phân Cảnh / Đổi POV
              </button>
            </div>
            <button type="button" id="btn-s18-fs-preview-context" class="px-3 py-1.5 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-bold text-xs transition">
              🔍 Xem Gói Ngữ Cảnh Cục Bộ
            </button>
          </div>

          <!-- KHỐI 3: CỬA SỔ NHẬP CÂU LỆNH & Ý TƯỞNG CHƯƠNG TRUYỆN CỦA NGƯỜI DÙNG -->
          <div class="p-5 rounded-2xl border-2 border-emerald-500/50 bg-zinc-900 space-y-2.5 shadow-xl">
            <div class="flex items-center justify-between">
              <label class="font-extrabold uppercase text-xs text-emerald-400">
                ✍️ NHẬP CÂU LỆNH & Ý TƯỞNG CỤ THỂ CHO CHƯƠNG TRUYỆN CỦA BẠN:
              </label>
              <button type="button" id="btn-s18-fs-clear-prompt" class="px-2.5 py-1 rounded-lg border border-zinc-700 hover:bg-red-950/60 text-zinc-400 hover:text-red-300 font-bold text-[11px]">
                🗑️ Xóa trắng ô lệnh
              </button>
            </div>
            <textarea
              id="s18-fullscreen-prompt-textarea"
              rows="11"
              placeholder="Nhập diễn biến cốt lõi, chiều sâu tâm lý hoặc tình tiết bạn muốn AI triển khai tại đây... Khi bấm nút OK bên dưới, hệ thống sẽ hiện màn hình chờ xoay xoay và dùng Gemini Flash tổng hợp toàn bộ thông số cho bạn duyệt trước khi viết!"
              class="w-full p-4 rounded-xl border border-zinc-700 bg-zinc-950 text-zinc-100 text-xs md:text-sm leading-relaxed select-text focus:outline-none focus:border-emerald-400 resize-y"
            ></textarea>
          </div>

        </div>

        <!-- Footer Cố Định Dưới Đáy (Luôn nằm gọn trong màn hình, không bao giờ tràn viền) -->
        <div class="px-6 py-4 border-t border-zinc-800 bg-zinc-900 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div class="text-[11px] text-zinc-400">
            🔗 Mọi thông số trên đều được liên kết trực tiếp với Google Gemini API Key của bạn.
          </div>
          <div class="flex items-center gap-3">
            <button type="button" id="btn-s18-fs-cancel-bottom" class="px-5 py-2.5 rounded-xl border border-zinc-700 hover:bg-zinc-800 font-extrabold text-xs">
              Đóng
            </button>
            <button type="button" id="btn-s18-fs-run-synthesis-now" class="px-7 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs md:text-sm shadow-xl transition flex items-center gap-2">
              <span>🚀 OK — TỔNG HỢP CÂU LỆNH & CHẠY MÔ HÌNH NGAY</span>
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      // Đồng bộ danh sách 6 model hiện hành
      StrictModelCatalogController.enforceCleanModelsAcrossAllSelects();

      const fsMode = document.getElementById('s18-fullscreen-mode-select');
      const fsModel = document.getElementById('s18-fullscreen-model-select');
      const fsThink = document.getElementById(
        's18-fullscreen-thinking-select'
      );
      const fsWords = document.getElementById('s18-fullscreen-word-count');
      const fsPrompt = document.getElementById(
        's18-fullscreen-prompt-textarea'
      );

      const syncFsToMainControls = () => {
        const mainMode = document.getElementById('select-ai-work-mode');
        const mainModel = document.getElementById('select-active-gemini-model');
        const mainThink = document.getElementById(
          'select-active-thinking-level'
        );
        const mainWords = document.getElementById('input-target-word-count');
        const mainBeats = document.getElementById('textarea-chapter-beats');

        if (mainMode && fsMode) mainMode.value = fsMode.value;
        if (mainModel && fsModel) mainModel.value = fsModel.value;
        if (mainThink && fsThink) mainThink.value = fsThink.value;
        if (mainWords && fsWords) mainWords.value = fsWords.value;
        if (mainBeats && fsPrompt) mainBeats.value = fsPrompt.value;

        if (window.StudioStage2?.settings) {
          window.StudioStage2.settings.activeModeId = fsMode?.value || 'MODE_1_DRAFT';
          window.StudioStage2.settings.thinkingLevel = fsThink?.value || 'high';
          window.StudioStage2.settings.targetWordCount =
            parseInt(fsWords?.value || '4500', 10) || 4500;
          window.StudioStage2.settings.saveConfig({
            modelId: fsModel?.value || 'gemini-3.1-pro-preview'
          });
        }
      };

      [fsMode, fsModel, fsThink, fsWords, fsPrompt].forEach((el) => {
        el?.addEventListener('input', syncFsToMainControls);
        el?.addEventListener('change', syncFsToMainControls);
      });

      const closeFsWorkbench = () => {
        syncFsToMainControls();
        modal.classList.add('hidden');
      };

      document
        .getElementById('btn-s18-fs-close-workbench')
        ?.addEventListener('click', closeFsWorkbench);
      document
        .getElementById('btn-s18-fs-cancel-bottom')
        ?.addEventListener('click', closeFsWorkbench);

      document
        .getElementById('btn-s18-fs-edit-system-rule')
        ?.addEventListener('click', () => {
          window.StudioStage3?.modeRulesManager?.openRuleEditorModal(
            fsMode?.value || 'MODE_1_DRAFT'
          );
        });

      document
        .getElementById('btn-s18-fs-view-bible')
        ?.addEventListener('click', () => {
          window.StudioStage10?.bibleEngine?.openQuickStoryBiblePreviewModal?.();
        });

      document
        .getElementById('btn-s18-fs-insert-scene')
        ?.addEventListener('click', () => {
          document.getElementById('btn-open-scene-builder')?.click();
        });

      document
        .getElementById('btn-s18-fs-preview-context')
        ?.addEventListener('click', () => {
          syncFsToMainControls();
          window.StudioStage3?.previewContextPackageModal?.();
        });

      document
        .getElementById('btn-s18-fs-clear-prompt')
        ?.addEventListener('click', () => {
          if (fsPrompt && confirm('Xóa trắng nội dung ô nhập câu lệnh?')) {
            fsPrompt.value = '';
            syncFsToMainControls();
          }
        });

      document
        .getElementById('btn-s18-fs-open-approve-inside')
        ?.addEventListener('click', () => {
          closeFsWorkbench();
          this.openFullScreenApprovalModal();
        });

      // Khi bấm nút OK Chạy Mô Hình trong cửa sổ Full Screen
      document
        .getElementById('btn-s18-fs-run-synthesis-now')
        ?.addEventListener('click', () => {
          syncFsToMainControls();
          modal.classList.add('hidden');
          // Kích hoạt luồng kiểm tra câu lệnh trống -> Màn hình chờ xoay xoay -> Gemini Flash tổng hợp
          document.getElementById('btn-run-primary-ai-action')?.click();
        });
    },

    openFullScreenAiWorkbench() {
      StrictModelCatalogController.enforceCleanModelsAcrossAllSelects();
      const modal = document.getElementById(
        'modal-s18-fullscreen-ai-workbench'
      );
      const fsPrompt = document.getElementById(
        's18-fullscreen-prompt-textarea'
      );
      const mainBeats = document.getElementById('textarea-chapter-beats');
      if (fsPrompt && mainBeats) {
        fsPrompt.value = mainBeats.value || '';
      }
      modal?.classList.remove('hidden');
    },

    /**
     * CỬA SỔ FULL SCREEN 2: SỬA TRIỆT ĐỂ LỖI TRÀN VIỀN MÀN HÌNH DUYỆT BẢN THẢO (Ảnh image_304c3c.png)
     * Chuyển hộp thoại #modal-bug6-smart-approve thành bố cục Full Screen Co Giãn Chuẩn Xác
     */
    upgradeApprovalModalToFullScreenNonOverflow() {
      const style = document.createElement('style');
      style.id = 's18-v5-fix-approve-modal-overflow';
      style.textContent = `
        /* Khắc phục triệt để lỗi tràn viền hộp thoại Duyệt bản thảo (Ảnh image_304c3c.png) */
        #modal-bug6-smart-approve {
          padding: 12px !important;
          z-index: 2147483644 !important;
        }
        #modal-bug6-smart-approve > div {
          width: 96vw !important;
          max-width: 980px !important;
          height: 92vh !important;
          max-height: 92vh !important;
          display: flex !important;
          flex-direction: column !important;
          overflow: hidden !important;
          border-radius: 20px !important;
        }
        #modal-bug6-smart-approve > div > div:nth-child(2) {
          flex: 1 1 auto !important;
          overflow-y: auto !important;
          min-height: 0 !important;
        }
        #modal-bug6-smart-approve > div > div:last-child {
          flex-shrink: 0 !important;
          position: sticky !important;
          bottom: 0 !important;
          background: #09090B !important;
          z-index: 10 !important;
        }
      `;
      document.head.appendChild(style);
    },

    openFullScreenApprovalModal() {
      StrictModelCatalogController.enforceCleanModelsAcrossAllSelects();
      if (window.StudioStage10?.bibleEngine?.openSmartApprovalModal) {
        window.StudioStage10.bibleEngine.openSmartApprovalModal();
      } else {
        document
          .getElementById('modal-bug6-smart-approve')
          ?.classList.remove('hidden');
      }
    }
  };

  // ==========================================================================
  // MODULE 7: ĐỒNG HỒ POMODORO NỔI & TRÌNH PHÁT NHẠC MP3 NỔI ĐỒNG NHẤT 100%
  // Đóng/Mở thu nhỏ (< / >) và Nút [✕] hỏi chạy nền hay tắt hẳn y hệt nhau (FIX BUG 10)
  // ==========================================================================
  const TwinFloatingPomodoroAndMp3Controller = {
    pomoRemainingSec: 25 * 60,
    pomoIsRunning: false,
    pomoInterval: null,
    pendingDismissType: null, // 'POMO' | 'MP3'

    init() {
      this.destroyLegacyConflictingPomodoroDOM();
      this.injectTwinFloatingBarsCSS();
      this.buildIdenticalPomodoroBar();
      this.buildIdenticalMp3Bar();
      this.buildBackgroundOrKillConfirmModal();
      this.bindTab5ReopenTriggers();
    },

    /**
     * Xóa hẳn phần tử #s15-floating-pomodoro-pill cũ bị CSS của Stage 16 khóa cứng
     * để thay bằng #s18-twin-pomo-bar hoạt động y hệt thanh MP3!
     */
    destroyLegacyConflictingPomodoroDOM() {
      document.getElementById('s15-floating-pomodoro-pill')?.remove();
      document.getElementById('s19-floating-mp3-bar')?.remove();
    },

    injectTwinFloatingBarsCSS() {
      if (document.getElementById('s18-twin-floating-bars-css')) return;
      const style = document.createElement('style');
      style.id = 's18-twin-floating-bars-css';
      style.textContent = `
        #s15-floating-pomodoro-pill {
          display: none !important;
        }
        .s18-twin-floating-bar {
          position: fixed;
          z-index: 2147483638;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 9999px;
          background: rgba(18, 18, 22, 0.96);
          color: #FFFFFF;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.65);
          user-select: none;
          font-size: 11px;
          transition: box-shadow 0.2s ease;
        }
        .s18-twin-floating-bar.s18-bar-closed {
          display: none !important;
        }
        .s18-twin-floating-bar.s18-bar-collapsed .s18-twin-expandable-body {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
    },

    /**
     * 1. Thanh Đồng Hồ Pomodoro Nổi (#s18-twin-pomo-bar):
     *    Cấu trúc đóng/mở thu nhỏ (< / >) và nút [✕] giống hệt 100% với Thanh Nhạc MP3!
     */
    buildIdenticalPomodoroBar() {
      let bar = document.getElementById('s18-twin-pomo-bar');
      if (bar) bar.remove();

      const isClosed =
        localStorage.getItem('noir_s18_v5_pomo_closed') === 'true';
      const isCollapsed =
        localStorage.getItem('noir_s18_v5_pomo_collapsed') === 'true';

      bar = document.createElement('div');
      bar.id = 's18-twin-pomo-bar';
      bar.className = `s18-twin-floating-bar top-16 right-4 border-2 border-amber-500/75 ${
        isClosed ? 's18-bar-closed' : ''
      } ${isCollapsed ? 's18-bar-collapsed' : ''}`;

      bar.innerHTML = `
        <!-- Nút biểu tượng kiêm tay nắm kéo & nút mở nhanh khi đang thu nhỏ -->
        <button type="button" id="btn-s18-pomo-pill-icon" class="px-2.5 py-1 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-[11px] flex items-center gap-1 cursor-move">
          <span>🍅</span>
          <span id="s18-pomo-mini-time" class="font-monoCode">25:00</span>
        </button>

        <!-- Phần thân mở rộng (Ẩn đi khi bấm nút <, hiện lại khi bấm nút >) -->
        <div class="s18-twin-expandable-body flex items-center gap-1.5">
          <button type="button" id="btn-s18-pomo-playpause" class="px-2.5 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] transition">
            ▶ Chạy
          </button>
          <button type="button" id="btn-s18-pomo-reset" class="px-2 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-[11px]" title="Đặt lại đồng hồ">
            ↺
          </button>
          <button type="button" id="btn-s18-pomo-set-min" class="px-2 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-bold text-[10px]" title="Đổi số phút Pomodoro">
            ⚙️ Phút
          </button>
        </div>

        <!-- Nút [<] Thu nhỏ / [>] Mở rộng (Hoạt động y hệt thanh MP3) -->
        <button type="button" id="btn-s18-pomo-collapse-toggle" class="px-2 py-1 rounded-full bg-zinc-800 hover:bg-amber-600 text-amber-300 hover:text-zinc-950 font-monoCode font-extrabold text-xs transition" title="Thu nhỏ (<) hoặc Mở rộng (>) thanh Pomodoro">
          ${isCollapsed ? '&gt;' : '&lt;'}
        </button>

        <!-- Nút [✕] Tắt thanh Pomodoro (Hỏi chạy nền hay mất hẳn) -->
        <button type="button" id="btn-s18-pomo-close-x" class="px-2 py-1 rounded-full bg-red-950/90 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 font-extrabold text-xs transition" title="Đóng thanh Pomodoro">
          ✕
        </button>
      `;

      document.body.appendChild(bar);
      this.makeTwinBarDraggable(
        bar,
        document.getElementById('btn-s18-pomo-pill-icon'),
        'noir_s18_v5_pomo_pos',
        () => {
          // Nếu đang ở trạng thái thu nhỏ mà người dùng click vào viên thuốc 🍅 -> Mở rộng ra ngay!
          if (bar.classList.contains('s18-bar-collapsed')) {
            document.getElementById('btn-s18-pomo-collapse-toggle')?.click();
          }
        }
      );

      const renderTime = () => {
        const m = Math.floor(this.pomoRemainingSec / 60);
        const s = this.pomoRemainingSec % 60;
        const str = `${String(m).padStart(2, '0')}:${String(s).padStart(
          2,
          '0'
        )}`;
        const t1 = document.getElementById('s18-pomo-mini-time');
        const t2 = document.getElementById('s11-pomo-time-display');
        if (t1) t1.textContent = str;
        if (t2) t2.textContent = str;
      };

      const playPauseBtn = document.getElementById('btn-s18-pomo-playpause');
      playPauseBtn?.addEventListener('click', () => {
        if (this.pomoIsRunning) {
          this.pomoIsRunning = false;
          clearInterval(this.pomoInterval);
          playPauseBtn.textContent = '▶ Chạy';
        } else {
          this.pomoIsRunning = true;
          playPauseBtn.textContent = '⏸ Dừng';
          this.pomoInterval = setInterval(() => {
            if (this.pomoRemainingSec > 0) {
              this.pomoRemainingSec--;
              renderTime();
            } else {
              clearInterval(this.pomoInterval);
              this.pomoIsRunning = false;
              playPauseBtn.textContent = '▶ Chạy';
              window.StudioStage7?.saveEngine?.showSaveToastNotification?.(
                '🔔 Đã hoàn thành phiên tập trung Pomodoro!'
              );
            }
          }, 1000);
        }
      });

      document
        .getElementById('btn-s18-pomo-reset')
        ?.addEventListener('click', () => {
          this.pomoIsRunning = false;
          clearInterval(this.pomoInterval);
          const customMin =
            parseInt(localStorage.getItem('noir_s18_pomo_custom_min') || '25', 10) ||
            25;
          this.pomoRemainingSec = customMin * 60;
          if (playPauseBtn) playPauseBtn.textContent = '▶ Chạy';
          renderTime();
        });

      document
        .getElementById('btn-s18-pomo-set-min')
        ?.addEventListener('click', () => {
          const curMin = Math.max(1, Math.round(this.pomoRemainingSec / 60));
          const inputMin = prompt(
            'Nhập số phút tập trung Pomodoro bạn muốn đặt (VD: 25, 45, 60):',
            String(curMin)
          );
          const parsed = parseInt(inputMin || '', 10);
          if (parsed && parsed > 0 && parsed <= 240) {
            localStorage.setItem('noir_s18_pomo_custom_min', String(parsed));
            this.pomoRemainingSec = parsed * 60;
            renderTime();
          }
        });

      // Nút [<] / [>] đóng mở thu nhỏ mượt mà 100%
      const collapseBtn = document.getElementById(
        'btn-s18-pomo-collapse-toggle'
      );
      collapseBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const nowCollapsed = bar.classList.toggle('s18-bar-collapsed');
        localStorage.setItem(
          'noir_s18_v5_pomo_collapsed',
          String(nowCollapsed)
        );
        collapseBtn.innerHTML = nowCollapsed ? '&gt;' : '&lt;';
      });

      // Nút [✕] mở Pop-up hỏi chạy nền hay mất hẳn
      document
        .getElementById('btn-s18-pomo-close-x')
        ?.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openConfirmModal('POMO');
        });
    },

    /**
     * 2. Thanh Trình Phát Nhạc MP3 Nổi (#s18-twin-mp3-bar):
     *    Cấu trúc đồng bộ 100% với Thanh Pomodoro
     */
    buildIdenticalMp3Bar() {
      let bar = document.getElementById('s18-twin-mp3-bar');
      if (bar) bar.remove();

      const isClosed =
        localStorage.getItem('noir_s18_v5_mp3_closed') === 'true';
      const isCollapsed =
        localStorage.getItem('noir_s18_v5_mp3_collapsed') === 'true';

      bar = document.createElement('div');
      bar.id = 's18-twin-mp3-bar';
      bar.className = `s18-twin-floating-bar bottom-10 left-4 border-2 border-emerald-500/75 ${
        isClosed ? 's18-bar-closed' : ''
      } ${isCollapsed ? 's18-bar-collapsed' : ''}`;

      bar.innerHTML = `
        <button type="button" id="btn-s18-mp3-pill-icon" class="px-2.5 py-1 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-[11px] flex items-center gap-1 cursor-move">
          <span>🎵</span>
          <span id="s18-mp3-mini-time" class="font-monoCode">00:00</span>
        </button>

        <div class="s18-twin-expandable-body flex items-center gap-1.5">
          <button type="button" id="btn-s18-mp3-playpause" class="px-2.5 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] transition">
            ⏯️ Phát/Dừng
          </button>
          <button type="button" id="btn-s18-mp3-pick-file" class="px-2.5 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-zinc-950 border border-amber-500/40 font-bold text-[10px] transition">
            📂 Chọn MP3
          </button>
          <button type="button" id="btn-s18-mp3-back5" class="px-2 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-monoCode font-bold text-[10px]">
            -5s
          </button>
          <button type="button" id="btn-s18-mp3-fwd5" class="px-2 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-emerald-300 font-monoCode font-bold text-[10px]">
            +5s
          </button>
        </div>

        <button type="button" id="btn-s18-mp3-collapse-toggle" class="px-2 py-1 rounded-full bg-zinc-800 hover:bg-emerald-600 text-emerald-300 hover:text-white font-monoCode font-extrabold text-xs transition" title="Thu nhỏ (<) hoặc Mở rộng (>) thanh Nhạc">
          ${isCollapsed ? '&gt;' : '&lt;'}
        </button>

        <button type="button" id="btn-s18-mp3-close-x" class="px-2 py-1 rounded-full bg-red-950/90 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 font-extrabold text-xs transition" title="Đóng thanh Nhạc">
          ✕
        </button>
      `;

      document.body.appendChild(bar);
      this.makeTwinBarDraggable(
        bar,
        document.getElementById('btn-s18-mp3-pill-icon'),
        'noir_s18_v5_mp3_pos',
        () => {
          if (bar.classList.contains('s18-bar-collapsed')) {
            document.getElementById('btn-s18-mp3-collapse-toggle')?.click();
          }
        }
      );

      const getAudio = () =>
        window.StudioStage8?.audioPlayer?.htmlAudioPlayer ||
        document.getElementById('s8-native-audio-bar');

      document
        .getElementById('btn-s18-mp3-playpause')
        ?.addEventListener('click', () => {
          const audio = getAudio();
          if (!audio) return;
          if (!audio.src) {
            document.getElementById('s8-custom-mp3-input')?.click() ||
              document.getElementById('s8-input-local-mp3')?.click();
            return;
          }
          if (audio.paused) audio.play().catch(() => {});
          else audio.pause();
        });

      document
        .getElementById('btn-s18-mp3-pick-file')
        ?.addEventListener('click', () => {
          document.getElementById('s8-custom-mp3-input')?.click() ||
            document.getElementById('s8-input-local-mp3')?.click();
        });

      document
        .getElementById('btn-s18-mp3-back5')
        ?.addEventListener('click', () => {
          const audio = getAudio();
          if (audio && audio.src) {
            audio.currentTime = Math.max(0, (audio.currentTime || 0) - 5);
          }
        });

      document
        .getElementById('btn-s18-mp3-fwd5')
        ?.addEventListener('click', () => {
          const audio = getAudio();
          if (audio && audio.src) {
            audio.currentTime = Math.min(
              audio.duration || 9999,
              (audio.currentTime || 0) + 5
            );
          }
        });

      const audio = getAudio();
      if (audio) {
        audio.addEventListener('timeupdate', () => {
          const lbl = document.getElementById('s18-mp3-mini-time');
          if (!lbl) return;
          const sec = Math.floor(audio.currentTime || 0);
          lbl.textContent = `${String(Math.floor(sec / 60)).padStart(
            2,
            '0'
          )}:${String(sec % 60).padStart(2, '0')}`;
        });
      }

      const collapseBtn = document.getElementById(
        'btn-s18-mp3-collapse-toggle'
      );
      collapseBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const nowCollapsed = bar.classList.toggle('s18-bar-collapsed');
        localStorage.setItem(
          'noir_s18_v5_mp3_collapsed',
          String(nowCollapsed)
        );
        collapseBtn.innerHTML = nowCollapsed ? '&gt;' : '&lt;';
      });

      document
        .getElementById('btn-s18-mp3-close-x')
        ?.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openConfirmModal('MP3');
        });
    },

    buildBackgroundOrKillConfirmModal() {
      if (document.getElementById('modal-s18-twin-dismiss-confirm')) return;

      const modal = document.createElement('div');
      modal.id = 'modal-s18-twin-dismiss-confirm';
      modal.className =
        'hidden fixed inset-0 bg-black/85 z-[2147483646] flex items-center justify-center p-4 backdrop-blur-sm select-none text-xs text-white';

      modal.innerHTML = `
        <div class="w-full max-w-md rounded-3xl border-2 border-emerald-500/80 bg-zinc-950 p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 id="s18-twin-dismiss-title" class="font-extrabold uppercase text-sm text-emerald-400">
              TẮT THANH CÔNG CỤ NỔI
            </h3>
            <button type="button" id="btn-s18-twin-dismiss-cancel" class="px-2 py-0.5 rounded hover:bg-zinc-800 font-bold">✕</button>
          </div>
          <p id="s18-twin-dismiss-question" class="text-sm font-bold text-zinc-100 leading-relaxed">
            Bạn muốn tiện ích này tiếp tục chạy nền không hay mất hẳn (tắt hẳn)?
          </p>
          <p class="text-[11px] text-zinc-400">
            • Bạn luôn có thể bật lại thanh này bất cứ lúc nào trong <b>Tab 5 (5. Nhạc, Không Gian & Chữ)</b>.
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            <button type="button" id="btn-s18-twin-keep-bg" class="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition">
              ✅ Có (Chạy nền & Ẩn thanh)
            </button>
            <button type="button" id="btn-s18-twin-kill-all" class="py-3 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg transition">
              🛑 Không (Mất hẳn & Dừng chạy)
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      document
        .getElementById('btn-s18-twin-dismiss-cancel')
        ?.addEventListener('click', () => modal.classList.add('hidden'));

      document
        .getElementById('btn-s18-twin-keep-bg')
        ?.addEventListener('click', () => {
          modal.classList.add('hidden');
          this.executeDismiss(this.pendingDismissType, false);
        });

      document
        .getElementById('btn-s18-twin-kill-all')
        ?.addEventListener('click', () => {
          modal.classList.add('hidden');
          this.executeDismiss(this.pendingDismissType, true);
        });
    },

    openConfirmModal(type) {
      this.pendingDismissType = type;
      const modal = document.getElementById('modal-s18-twin-dismiss-confirm');
      const title = document.getElementById('s18-twin-dismiss-title');
      const question = document.getElementById('s18-twin-dismiss-question');
      if (!modal) return;

      if (type === 'POMO') {
        if (title) title.textContent = '🍅 TẮT THANH ĐỒNG HỒ POMODORO';
        if (question) {
          question.textContent =
            'Bạn muốn Đồng hồ Pomodoro tiếp tục đếm giờ chạy nền không hay mất hẳn (dừng hẳn)?';
        }
      } else {
        if (title) title.textContent = '🎵 TẮT THANH TRÌNH PHÁT NHẠC';
        if (question) {
          question.textContent =
            'Bạn muốn Nhạc tiếp tục phát chạy nền không hay mất hẳn (dừng nhạc luôn)?';
        }
      }
      modal.classList.remove('hidden');
    },

    executeDismiss(type, stopCompletely) {
      if (type === 'POMO') {
        localStorage.setItem('noir_s18_v5_pomo_closed', 'true');
        document
          .getElementById('s18-twin-pomo-bar')
          ?.classList.add('s18-bar-closed');
        if (stopCompletely) {
          this.pomoIsRunning = false;
          clearInterval(this.pomoInterval);
          const btn = document.getElementById('btn-s18-pomo-playpause');
          if (btn) btn.textContent = '▶ Chạy';
        }
      } else {
        localStorage.setItem('noir_s18_v5_mp3_closed', 'true');
        document
          .getElementById('s18-twin-mp3-bar')
          ?.classList.add('s18-bar-closed');
        if (stopCompletely) {
          const audio =
            window.StudioStage8?.audioPlayer?.htmlAudioPlayer ||
            document.getElementById('s8-native-audio-bar');
          if (audio) {
            try {
              audio.pause();
            } catch (_) {}
          }
          window.StudioStage8?.audioPlayer?.stopAllProceduralSounds?.();
        }
      }
    },

    bindTab5ReopenTriggers() {
      document.addEventListener(
        'click',
        (e) => {
          if (
            e.target.closest(
              '[data-bug13-target="s14-panel-music-box"], #btn-s18-restore-float-music'
            )
          ) {
            localStorage.setItem('noir_s18_v5_mp3_closed', 'false');
            localStorage.setItem('noir_s18_v5_mp3_collapsed', 'false');
            const mp3Bar = document.getElementById('s18-twin-mp3-bar');
            mp3Bar?.classList.remove('s18-bar-closed', 's18-bar-collapsed');
            const cBtn = document.getElementById(
              'btn-s18-mp3-collapse-toggle'
            );
            if (cBtn) cBtn.innerHTML = '&lt;';
          }

          if (
            e.target.closest(
              '[data-bug13-target="s14-panel-pomodoro-box"], #btn-s18-restore-float-pomo'
            )
          ) {
            localStorage.setItem('noir_s18_v5_pomo_closed', 'false');
            localStorage.setItem('noir_s18_v5_pomo_collapsed', 'false');
            const pomoBar = document.getElementById('s18-twin-pomo-bar');
            pomoBar?.classList.remove('s18-bar-closed', 's18-bar-collapsed');
            const cBtn = document.getElementById(
              'btn-s18-pomo-collapse-toggle'
            );
            if (cBtn) cBtn.innerHTML = '&lt;';
          }
        },
        true
      );
    },

    makeTwinBarDraggable(barEl, handleEl, storageKey, onClickWithoutDrag) {
      if (!barEl || !handleEl) return;
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
        if (saved && typeof saved.x === 'number' && typeof saved.y === 'number') {
          barEl.style.right = 'auto';
          barEl.style.bottom = 'auto';
          barEl.style.left = `${Math.max(
            6,
            Math.min(window.innerWidth - 90, saved.x)
          )}px`;
          barEl.style.top = `${Math.max(
            6,
            Math.min(window.innerHeight - 45, saved.y)
          )}px`;
        }
      } catch (_) {}

      let isDown = false;
      let dragged = false;
      let startX = 0;
      let startY = 0;
      let initL = 0;
      let initT = 0;

      handleEl.addEventListener('pointerdown', (e) => {
        isDown = true;
        dragged = false;
        const rect = barEl.getBoundingClientRect();
        startX = e.clientX;
        startY = e.clientY;
        initL = rect.left;
        initT = rect.top;
        handleEl.setPointerCapture?.(e.pointerId);
      });

      handleEl.addEventListener('pointermove', (e) => {
        if (!isDown) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (!dragged && Math.hypot(dx, dy) > 5) dragged = true;
        if (dragged) {
          barEl.style.right = 'auto';
          barEl.style.bottom = 'auto';
          barEl.style.left = `${Math.max(
            6,
            Math.min(window.innerWidth - barEl.offsetWidth - 6, initL + dx)
          )}px`;
          barEl.style.top = `${Math.max(
            6,
            Math.min(window.innerHeight - barEl.offsetHeight - 6, initT + dy)
          )}px`;
        }
      });

      handleEl.addEventListener('pointerup', (e) => {
        if (!isDown) return;
        isDown = false;
        handleEl.releasePointerCapture?.(e.pointerId);
        if (dragged) {
          const rect = barEl.getBoundingClientRect();
          localStorage.setItem(
            storageKey,
            JSON.stringify({ x: Math.round(rect.left), y: Math.round(rect.top) })
          );
        } else if (typeof onClickWithoutDrag === 'function') {
          onClickWithoutDrag();
        }
      });
    }
  };
  // ==========================================================================
  // MODULE 8: QUẢN LÝ MÀN HÌNH ĐẦU VÀO 2 BƯỚC (BƯỚC 1: TỰ CHỌN SẴN THƯ MỤC CŨ
  // Ở LẦN 2 + BƯỚC 2: AUTO-VERIFY KEY API 1 KHUNG DUY NHẤT, KHÔNG BẬT MANAGE PASSWORDS)
  // ==========================================================================
  const SystemFolderStep1Manager = {
    hasSelectedFolder: false,
    savedFolderName: '',
    savedDirectoryHandle: null,
    isPermissionGranted: false,

    async loadPreviouslySelectedFolder() {
      try {
        const metaRaw = localStorage.getItem('noir_s18_saved_folder_meta');
        if (metaRaw) {
          const meta = JSON.parse(metaRaw);
          if (meta && meta.folderName) {
            this.savedFolderName = meta.folderName;
            this.hasSelectedFolder = true;
          }
        }
        const legacyName = localStorage.getItem('noir_s23_last_folder_name');
        if (
          !this.savedFolderName &&
          legacyName &&
          legacyName !== 'Bộ nhớ máy'
        ) {
          this.savedFolderName = legacyName;
          this.hasSelectedFolder = true;
        }

        const idb =
          window.StudioCore?.idb || window.StudioCore?.controller?.idb;
        if (idb) {
          const handle = await idb.get('fs_handles', 'root_workspace_dir');
          if (handle) {
            this.savedDirectoryHandle = handle;
            this.savedFolderName = handle.name || this.savedFolderName;
            this.hasSelectedFolder = true;
            localStorage.setItem(
              'noir_s18_saved_folder_meta',
              JSON.stringify({
                folderName: this.savedFolderName,
                savedAt: Date.now()
              })
            );
            if (typeof handle.queryPermission === 'function') {
              const perm = await handle.queryPermission({ mode: 'readwrite' });
              if (perm === 'granted') {
                this.isPermissionGranted = true;
                if (window.StudioCore?.fsEngine) {
                  window.StudioCore.fsEngine.rootHandle = handle;
                  await window.StudioCore.fsEngine.ensureStudioDirectories?.();
                  window.StudioCore.fsEngine.updateHeaderIndicators?.(
                    true,
                    handle.name
                  );
                }
              }
            }
          }
        }
      } catch (_) {}
      this.renderStep1FolderUI();
      return this.hasSelectedFolder;
    },

    async promptUserToChooseNewFolder() {
      try {
        if (!('showDirectoryPicker' in window)) {
          alert(
            'Trình duyệt hiện tại không hỗ trợ chọn thư mục trực tiếp. Vui lòng dùng Chrome, Edge hoặc Brave trên máy tính.'
          );
          return false;
        }
        const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
        if (!handle) return false;

        this.savedDirectoryHandle = handle;
        this.savedFolderName = handle.name;
        this.hasSelectedFolder = true;
        this.isPermissionGranted = true;

        localStorage.setItem(
          'noir_s18_saved_folder_meta',
          JSON.stringify({ folderName: handle.name, savedAt: Date.now() })
        );
        localStorage.setItem('noir_s23_last_folder_name', handle.name);

        const idb =
          window.StudioCore?.idb || window.StudioCore?.controller?.idb;
        if (idb) {
          await idb.set('fs_handles', 'root_workspace_dir', handle);
        }
        if (window.StudioCore?.fsEngine) {
          window.StudioCore.fsEngine.rootHandle = handle;
          await window.StudioCore.fsEngine.ensureStudioDirectories?.();
          window.StudioCore.fsEngine.updateHeaderIndicators?.(
            true,
            handle.name
          );
        }
        document
          .getElementById('s18-welcome-red-block-alert')
          ?.classList.add('hidden');
        this.renderStep1FolderUI();
        return true;
      } catch (_) {
        return false;
      }
    },

    async activatePreSelectedFolderIfNeeded() {
      if (!this.savedDirectoryHandle) return this.hasSelectedFolder;
      try {
        if (typeof this.savedDirectoryHandle.queryPermission === 'function') {
          let perm = await this.savedDirectoryHandle.queryPermission({
            mode: 'readwrite'
          });
          if (perm !== 'granted') {
            perm = await this.savedDirectoryHandle.requestPermission({
              mode: 'readwrite'
            });
          }
          if (perm === 'granted') {
            this.isPermissionGranted = true;
            if (window.StudioCore?.fsEngine) {
              window.StudioCore.fsEngine.rootHandle = this.savedDirectoryHandle;
              await window.StudioCore.fsEngine.ensureStudioDirectories?.();
              window.StudioCore.fsEngine.updateHeaderIndicators?.(
                true,
                this.savedFolderName
              );
            }
          }
        }
      } catch (_) {}
      this.renderStep1FolderUI();
      return true;
    },

    renderStep1FolderUI() {
      const statusBadge = document.getElementById('s18-welcome-folder-status');
      const preselectedBox = document.getElementById(
        's18-step1-preselected-box'
      );
      const firstTimeBox = document.getElementById('s18-step1-firsttime-box');
      const folderNameSpan = document.getElementById(
        's18-preselected-folder-name'
      );

      if (this.hasSelectedFolder && this.savedFolderName) {
        if (statusBadge) {
          statusBadge.className =
            'px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-[11px] font-monoCode text-emerald-300 font-extrabold';
          statusBadge.textContent = `✅ Đã chọn sẵn: /${this.savedFolderName}`;
        }
        if (folderNameSpan) {
          folderNameSpan.textContent = `📁 /${this.savedFolderName}`;
        }
        preselectedBox?.classList.remove('hidden');
        firstTimeBox?.classList.add('hidden');
      } else {
        if (statusBadge) {
          statusBadge.className =
            'px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/50 text-[11px] font-monoCode text-red-300 font-extrabold animate-pulse';
          statusBadge.textContent =
            '⚠️ Bắt buộc chọn thư mục hệ thống (Lần đầu)';
        }
        preselectedBox?.classList.add('hidden');
        firstTimeBox?.classList.remove('hidden');
      }
    }
  };

  async function verifyApiKeyRealtimeWithFlashLite35Low(rawKeyInput) {
    // Luôn xóa các banner lỗi trùng lặp nếu Stage 16 tạo ra
    document
      .querySelectorAll(
        '.noir-apikey-status-banner, #s16-api-verify-status, #s17-api-verify-status, #s19-apikey-missing-error'
      )
      .forEach((el) => el.remove());

    const cleanKey = MasterApiKeyVault.sanitizeKey(rawKeyInput);

    if (MasterApiKeyVault.verifyAbortController) {
      MasterApiKeyVault.verifyAbortController.abort();
    }

    if (!MasterApiKeyVault.isPlausibleKeyFormat(cleanKey)) {
      MasterApiKeyVault.isValid = false;
      MasterApiKeyVault.isVerifying = false;
      window.__NOIR_API_KEY_STATE__ = {
        isValid: false,
        isVerifying: false,
        lastVerifiedKey: ''
      };
      updateWelcomeKeyBanner(
        'INVALID',
        '🚨 Xác minh thất bại! Key API đang trống, không tồn tại hoặc đã bị xóa bớt ký tự. Vui lòng kiểm tra lại!'
      );
      return false;
    }

    MasterApiKeyVault.isVerifying = true;
    MasterApiKeyVault.isValid = false;
    window.__NOIR_API_KEY_STATE__ = {
      isValid: false,
      isVerifying: true,
      lastVerifiedKey: ''
    };

    updateWelcomeKeyBanner(
      'VERIFYING',
      '⏳ Đang tự động Verify lại Key API bằng Gemini 3.5 Flash-Lite (Chế độ Tư duy Thấp)...'
    );

    const abortCtrl = new AbortController();
    MasterApiKeyVault.verifyAbortController = abortCtrl;

    const verifyModels = [
      'gemini-3.5-flash-lite',
      'gemini-3.5-flash',
      'gemini-3-flash-preview',
      'gemini-2.5-flash'
    ];

    for (const modelId of verifyModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${encodeURIComponent(
          cleanKey
        )}`;

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Studio-Key-Verify': '1'
          },
          signal: abortCtrl.signal,
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'ok' }] }],
            generationConfig: { maxOutputTokens: 1, temperature: 0 }
          })
        });

        if (res.ok) {
          MasterApiKeyVault.synchronizeKeyEverywhere(cleanKey);
          StrictModelCatalogController.enforceCleanModelsAcrossAllSelects();
          updateWelcomeKeyBanner(
            'VALID',
            '✅ Đã xác minh thành công (bằng Gemini 3.5 Flash-Lite Chế độ Thấp)! Key API hợp lệ và đã đồng bộ toàn bộ tính năng AI.'
          );
          document
            .getElementById('s18-welcome-red-block-alert')
            ?.classList.add('hidden');
          return true;
        }

        const errData = await res.json().catch(() => ({}));
        const errMsg = errData?.error?.message || `HTTP ${res.status}`;

        if (
          res.status === 404 ||
          /no longer available|not found/i.test(errMsg)
        ) {
          continue;
        }

        if (
          res.status === 400 ||
          res.status === 403 ||
          /API_KEY_INVALID|key not valid|invalid api key|permission_denied/i.test(
            errMsg
          )
        ) {
          MasterApiKeyVault.isValid = false;
          MasterApiKeyVault.isVerifying = false;
          updateWelcomeKeyBanner(
            'INVALID',
            `🚨 Xác minh thất bại! Key API không tồn tại hoặc bị sai ký tự (${errMsg}).`
          );
          return false;
        }
      } catch (err) {
        if (err.name === 'AbortError') return false;
      }
    }

    MasterApiKeyVault.isValid = false;
    MasterApiKeyVault.isVerifying = false;
    updateWelcomeKeyBanner(
      'INVALID',
      '🚨 Xác minh thất bại! Key API không hợp lệ hoặc mạng bị gián đoạn.'
    );
    return false;
  }

  function updateWelcomeKeyBanner(stateType, messageHtml) {
    const el = document.getElementById('s23-live-key-verify-status');
    if (!el) return;
    el.classList.remove('hidden');
    if (stateType === 'VALID') {
      el.className =
        'mt-2.5 px-4 py-2.5 rounded-xl border-2 border-emerald-500/80 bg-emerald-950/80 text-emerald-300 font-bold text-xs flex items-center gap-2 shadow-lg';
    } else if (stateType === 'VERIFYING') {
      el.className =
        'mt-2.5 px-4 py-2.5 rounded-xl border-2 border-amber-500/80 bg-amber-950/80 text-amber-300 font-bold text-xs flex items-center gap-2 shadow-lg animate-pulse';
    } else {
      el.className =
        'mt-2.5 px-4 py-2.5 rounded-xl border-2 border-red-500 bg-gradient-to-r from-red-950/95 via-rose-950/90 to-zinc-950 text-red-200 font-bold text-xs flex items-center gap-2 shadow-lg';
    }
    el.innerHTML = `<span>${messageHtml}</span>`;
  }

  function showWelcomeRedBlockAlert(customMsg) {
    const msg =
      customMsg ||
      (!SystemFolderStep1Manager.hasSelectedFolder
        ? '🚨 BƯỚC 1 CHƯA HOÀN TẤT: Vui lòng chọn Thư mục hệ thống ở Bước 1 trước khi bắt đầu!'
        : MasterApiKeyVault.isVerifying
        ? '⏳ Hệ thống đang xác minh Key API bằng Gemini 3.5 Flash-Lite... Vui lòng đợi 1 giây!'
        : '🚨 BƯỚC 2 CHƯA HỢP LỆ: Bạn chưa có Key API hợp lệ! Vui lòng nhập đúng Google Gemini API Key.');

    const alertEl = document.getElementById('s18-welcome-red-block-alert');
    if (alertEl) {
      alertEl.classList.remove('hidden');
      alertEl.innerHTML = `
        <div class="flex items-center gap-2.5">
          <span class="text-lg animate-bounce">🚫</span>
          <div>
            <div class="font-extrabold uppercase text-red-200 text-xs">Chưa Thể Chuyển Tiếp Qua Màn Hình Chính</div>
            <div class="text-[11px] text-red-100 mt-0.5">${msg}</div>
          </div>
        </div>
      `;
    }
  }

  function ensureFullFeaturedWelcomeApiKeyModal() {
    let modal = document.getElementById('modal-s6-welcome-launcher');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'modal-s6-welcome-launcher';
    modal.className =
      'fixed inset-0 bg-black/90 z-[2147483645] flex items-center justify-center p-4 backdrop-blur-md select-none';

    modal.innerHTML = `
      <div class="w-full max-w-2xl rounded-3xl border-2 border-emerald-500/70 bg-zinc-950 text-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-xs">
        <div class="px-6 py-4 border-b border-zinc-800 bg-gradient-to-r from-emerald-950/80 via-zinc-900 to-zinc-950 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <span class="text-xl">🔑</span>
            <div>
              <h2 class="text-sm md:text-base font-extrabold uppercase tracking-wide text-emerald-400">
                MÀN HÌNH ĐẦU VÀO: CHỌN THƯ MỤC HỆ THỐNG (BƯỚC 1) & KEY API GEMINI (BƯỚC 2)
              </h2>
              <p class="text-[11px] text-zinc-400">
                Tự động chọn sẵn Thư mục lần trước & nhớ Key API • Auto-Verify bằng Gemini 3.5 Flash-Lite (Chế độ Thấp)
              </p>
            </div>
          </div>
          <button type="button" id="btn-s6-close-welcome-top" class="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-red-600 text-zinc-200 hover:text-white font-extrabold text-xs transition">
            ✕ Đóng
          </button>
        </div>

        <div class="p-6 space-y-5 overflow-y-auto flex-1">
          <div id="s18-welcome-red-block-alert" class="hidden p-4 rounded-2xl border-2 border-red-500 bg-gradient-to-r from-red-950 via-rose-950 to-zinc-950 text-red-100 shadow-lg"></div>

          <!-- BƯỚC 1: CHỌN THƯ MỤC HỆ THỐNG -->
          <div class="p-4 rounded-2xl border-2 border-emerald-500/60 bg-zinc-900/85 space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="font-extrabold uppercase text-xs text-emerald-400">
                📁 BƯỚC 1 (LÀM ĐẦU TIÊN): CHỌN THƯ MỤC HỆ THỐNG TRÊN MÁY TÍNH
              </span>
              <span id="s18-welcome-folder-status" class="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-[11px] font-monoCode text-amber-300 font-bold">
                Đang kiểm tra thư mục...
              </span>
            </div>

            <div id="s18-step1-preselected-box" class="hidden space-y-2">
              <div class="p-3.5 rounded-xl border-2 border-emerald-500 bg-emerald-950/50 flex flex-wrap items-center justify-between gap-3">
                <div class="space-y-0.5">
                  <div class="text-[10px] font-extrabold uppercase text-emerald-300">
                    ✅ ĐÃ CHỌN SẴN THƯ MỤC LẦN TRƯỚC:
                  </div>
                  <div id="s18-preselected-folder-name" class="text-sm font-monoCode font-extrabold text-white">
                    📁 /Thư_Mục_Của_Bạn
                  </div>
                  <div class="text-[11px] text-emerald-200/80">
                    Dữ liệu thư mục đã được lưu sẵn. Bạn chỉ cần bấm chọn lại nếu muốn đổi sang thư mục mới.
                  </div>
                </div>
                <button type="button" id="btn-s18-change-new-folder" class="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-amber-600 text-amber-300 hover:text-zinc-950 border border-amber-500/50 font-extrabold text-xs transition shrink-0">
                  🔄 Chọn Lại Thư Mục Mới
                </button>
              </div>
            </div>

            <div id="s18-step1-firsttime-box" class="space-y-2">
              <button type="button" id="s6-welcome-connect-disk" class="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg transition flex items-center justify-center gap-2">
                <span>📁 Bấm Chọn Thư Mục Hệ Thống Trên Máy Tính (Bước Đầu Tiên)</span>
              </button>
            </div>
          </div>

          <!-- BƯỚC 2: NHẬP & AUTO-VERIFY GEMINI API KEY (Ẩn ký tự bằng CSS s18-masked-key-input để không bật Manage passwords) -->
          <div class="p-4 rounded-2xl border-2 border-amber-500/60 bg-zinc-900/90 space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="font-extrabold uppercase text-xs text-amber-400">
                🔑 BƯỚC 2: NHẬP HOẶC LẤY TỰ ĐỘNG GOOGLE GEMINI API KEY
              </span>
              <button type="button" id="btn-s19-auto-fetch-apikey" class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-white font-extrabold text-[11px] shadow transition">
                🌐 Lấy Key API Tự Động Từ Google AI Studio
              </button>
            </div>

            <div class="flex items-center gap-2">
              <input
                id="s6-welcome-api-key"
                type="text"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
                spellcheck="false"
                name="studio_gemini_token_non_password"
                placeholder="Dán mã Google Gemini API Key vào đây..."
                class="s18-masked-key-input flex-1 py-3 px-4 rounded-xl border-2 border-emerald-500/60 bg-zinc-950 font-monoCode font-bold text-sm text-emerald-300 focus:outline-none select-text"
              />
              <button type="button" id="btn-s19-quick-paste-key" class="px-3.5 py-3 rounded-xl bg-emerald-800/60 hover:bg-emerald-600 border border-emerald-500/50 text-emerald-200 hover:text-white font-extrabold text-xs transition shrink-0">
                📋 Paste
              </button>
              <button type="button" id="btn-s24-toggle-key-visibility" class="px-3.5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-zinc-200 font-extrabold text-xs transition shrink-0">
                👁️ Hiện
              </button>
            </div>

            <div id="s23-live-key-verify-status" class="mt-2 px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-950 text-zinc-400 font-bold text-xs flex items-center gap-2">
              <span>🔍 Trạng thái: Hãy nhập hoặc dán Key API để hệ thống tự động xác minh bằng Gemini 3.5 Flash-Lite.</span>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-zinc-800 bg-zinc-900/90 grid grid-cols-1 md:grid-cols-3 gap-3">
          <button type="button" id="btn-s17-welcome-write-now" class="py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs md:text-sm shadow-xl transition flex items-center justify-center gap-2">
            <span>✍️ Soạn thảo ngay</span>
          </button>
          <button type="button" id="btn-s17-welcome-open-ai" class="py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs md:text-sm shadow-xl transition flex items-center justify-center gap-2">
            <span>🤖 Mở cửa sổ câu lệnh AI</span>
          </button>
          <button type="button" id="btn-s17-welcome-video-guide" class="py-3.5 px-4 rounded-2xl border-2 border-amber-500/60 bg-amber-500/15 hover:bg-amber-500 hover:text-zinc-950 text-amber-300 font-extrabold text-xs md:text-sm transition flex items-center justify-center gap-2">
            <span>🎬 Video hướng dẫn sử dụng</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document
      .getElementById('modal-s21-device-selector-gate')
      ?.classList.add('hidden');

    SystemFolderStep1Manager.loadPreviouslySelectedFolder();

    document
      .getElementById('s6-welcome-connect-disk')
      ?.addEventListener('click', () =>
        SystemFolderStep1Manager.promptUserToChooseNewFolder()
      );
    document
      .getElementById('btn-s18-change-new-folder')
      ?.addEventListener('click', () =>
        SystemFolderStep1Manager.promptUserToChooseNewFolder()
      );

    const apiKeyInput = document.getElementById('s6-welcome-api-key');
    const pasteBtn = document.getElementById('btn-s19-quick-paste-key');
    const eyeBtn = document.getElementById('btn-s24-toggle-key-visibility');

    apiKeyInput?.addEventListener('input', () => {
      MasterApiKeyVault.isValid = false;
      MasterApiKeyVault.isVerifying = true;
      updateWelcomeKeyBanner(
        'VERIFYING',
        '⏳ Phát hiện chỉnh sửa — Đang tự động Verify lại Key API bằng Gemini 3.5 Flash-Lite...'
      );
      clearTimeout(MasterApiKeyVault.verifyDebounceTimer);
      MasterApiKeyVault.verifyDebounceTimer = setTimeout(() => {
        verifyApiKeyRealtimeWithFlashLite35Low(apiKeyInput.value);
      }, 250);
    });

    apiKeyInput?.addEventListener('paste', () => {
      setTimeout(() => {
        const clean = MasterApiKeyVault.sanitizeKey(apiKeyInput.value);
        apiKeyInput.value = clean;
        verifyApiKeyRealtimeWithFlashLite35Low(clean);
      }, 40);
    });

    eyeBtn?.addEventListener('click', () => {
      if (!apiKeyInput) return;
      const isMasked = apiKeyInput.classList.toggle('s18-masked-key-input');
      eyeBtn.innerHTML = isMasked ? '👁️ Hiện' : '🙈 Ẩn';
    });

    pasteBtn?.addEventListener('click', async () => {
      try {
        const clip = await navigator.clipboard.readText();
        const clean = MasterApiKeyVault.sanitizeKey(clip);
        if (apiKeyInput) {
          apiKeyInput.value = clean;
          await verifyApiKeyRealtimeWithFlashLite35Low(clean);
        }
      } catch (_) {
        apiKeyInput?.focus();
      }
    });

    document
      .getElementById('btn-s19-auto-fetch-apikey')
      ?.addEventListener('click', () => {
        window.open(
          'https://aistudio.google.com/apikey',
          '_blank',
          'noopener,noreferrer'
        );
      });

    const guardEntryButton = (btnId, callback) => {
      document.getElementById(btnId)?.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!SystemFolderStep1Manager.hasSelectedFolder) {
          showWelcomeRedBlockAlert();
          return;
        }
        await SystemFolderStep1Manager.activatePreSelectedFolderIfNeeded();

        if (MasterApiKeyVault.isVerifying) {
          showWelcomeRedBlockAlert();
          return;
        }
        if (!MasterApiKeyVault.isValid || !MasterApiKeyVault.activeKey) {
          const ok = await verifyApiKeyRealtimeWithFlashLite35Low(
            apiKeyInput?.value || ''
          );
          if (!ok) {
            showWelcomeRedBlockAlert();
            return;
          }
        }

        document
          .getElementById('s18-welcome-red-block-alert')
          ?.classList.add('hidden');
        document.body.classList.remove('s16u-gate-locked');
        modal.classList.add('hidden');
        callback();
      });
    };

    guardEntryButton('btn-s6-close-welcome-top', () =>
      navigateDirectlyToScreen('SCREEN_1_WRITE')
    );
    guardEntryButton('btn-s17-welcome-write-now', () =>
      navigateDirectlyToScreen('SCREEN_1_WRITE')
    );
    guardEntryButton('btn-s17-welcome-open-ai', () => {
      navigateDirectlyToScreen('SCREEN_3_AI');
      FullScreenTab3AndApprovalWorkbench.openFullScreenAiWorkbench();
    });
    guardEntryButton('btn-s17-welcome-video-guide', () =>
      window.StudioStage18?.openVideoTutorialModal?.()
    );

    const savedKey = MasterApiKeyVault.loadPersistedKey();
    if (savedKey) {
      if (apiKeyInput) apiKeyInput.value = savedKey;
      verifyApiKeyRealtimeWithFlashLite35Low(savedKey);
    }
  }

  // ==========================================================================
  // MODULE 9: ĐIỀU HƯỚNG TỨC THÌ VỀ MÀN HÌNH 1 KHI BẤM "✍️ WEB VIẾT TIỂU THUYẾT CỦA BI"
  // ==========================================================================
  function navigateDirectlyToScreen(screenId = 'SCREEN_1_WRITE') {
    [
      'modal-s18-fullscreen-ai-workbench',
      'modal-s6-prompt-command',
      'modal-s6-prompt-studio',
      'modal-s6-custom-exporter',
      'modal-s10-changelog',
      'modal-s10-video-guide',
      'modal-s19-timezone-picker',
      'modal-s21-bible-chapters-selector',
      'modal-bug6-smart-approve',
      'modal-bug6-quick-bible-preview',
      'modal-mode-system-rule-editor',
      'modal-bug11-prompt-synthesizer'
    ].forEach((id) => document.getElementById(id)?.classList.add('hidden'));

    const nav =
      window.StudioStage14?.navigator || window.StudioStage14?.screenNavigator;
    if (nav && typeof nav.navigateToScreen === 'function') {
      nav.navigateToScreen(screenId);
    } else {
      document.body.setAttribute('data-s14-screen', screenId);
    }

    document
      .querySelectorAll('#s14-master-top-nav [data-s14-tab]')
      .forEach((btn) => {
        btn.classList.remove('hidden');
        btn.classList.toggle(
          'active-tab',
          btn.getAttribute('data-s14-tab') === screenId
        );
      });

    document
      .getElementById('s17-other-features-dropdown')
      ?.classList.add('hidden');
  }

  function bindBrandButtonReturnToScreen1() {
    const topNav = document.getElementById('s14-master-top-nav');
    if (topNav && topNav.firstElementChild) {
      const brandEl = topNav.firstElementChild;
      brandEl.id = 'btn-s18-top-left-brand-home';
      brandEl.className =
        'flex items-center gap-2 shrink-0 cursor-pointer px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition active:scale-95 select-none';
      brandEl.title = 'Bấm vào đây để trở về ngay Màn hình 1 (1. Bàn Viết Truyện)';
      brandEl.innerHTML = `
        <span class="w-2.5 h-2.5 rounded-full bg-white"></span>
        <span>✍️ Web viết tiểu thuyết của Bi</span>
      `;
    }

    if (!window.__S18_V5_BRAND_CLICK__) {
      window.__S18_V5_BRAND_CLICK__ = true;
      document.addEventListener(
        'click',
        (e) => {
          const hit = e.target.closest(
            '#btn-s18-top-left-brand-home, #s14-master-top-nav > div:first-child, .btn-s14-back-to-write, #btn-s15-universal-back-to-write'
          );
          if (hit) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            navigateDirectlyToScreen('SCREEN_1_WRITE');
            window.StudioStage7?.saveEngine?.showSaveToastNotification?.(
              '✍️ Đã trở về Màn hình 1: Bàn Viết Truyện!'
            );
          }
        },
        true
      );
    }
  }

  // ==========================================================================
  // MODULE 10: LUỒNG TỔNG HỢP CÂU LỆNH CÓ MÀN HÌNH CHỜ XOAY XOAY KHÓA TƯƠNG TÁC
  //            & POP-UP HỎI XÁC NHẬN KHI CHƯA NHẬP CÂU LỆNH
  // ==========================================================================
  const BlockingSynthesisAndExecutionPipeline = {
    lastSynthesizedPayload: null,

    init() {
      this.injectEmptyPromptConfirmModal();
      this.injectBlockingSpinnerOverlay();
      this.injectSynthesizedApprovalModal();
      this.interceptRunButtons();
    },

    injectEmptyPromptConfirmModal() {
      if (document.getElementById('modal-s18-empty-prompt-confirm')) return;
      const modal = document.createElement('div');
      modal.id = 'modal-s18-empty-prompt-confirm';
      modal.className =
        'hidden fixed inset-0 bg-black/85 z-[2147483646] flex items-center justify-center p-4 backdrop-blur-sm select-none text-xs text-white';

      modal.innerHTML = `
        <div class="w-full max-w-lg rounded-3xl border-2 border-amber-500/80 bg-zinc-950 p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 class="font-extrabold uppercase text-sm text-amber-400">
              ⚠️ BẠN CHƯA NHẬP CÂU LỆNH CỤ THỂ CHO CHƯƠNG TRUYỆN
            </h3>
            <button type="button" id="btn-s18-close-empty-modal" class="px-2 py-0.5 rounded hover:bg-zinc-800 font-bold">✕</button>
          </div>
          <p class="text-sm font-bold text-zinc-100 leading-relaxed">
            Bạn chưa nhập câu lệnh cụ thể cho chương truyện bạn muốn viết, bạn muốn tiếp tục chứ?
          </p>
          <div class="flex flex-wrap items-center justify-end gap-2.5 pt-2">
            <button type="button" id="btn-s18-empty-back-to-input" class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition">
              ✍️ Quay lại nhập câu lệnh
            </button>
            <button type="button" id="btn-s18-empty-continue-run" class="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow-lg transition">
              ✅ Vẫn tiếp tục tổng hợp
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      document
        .getElementById('btn-s18-close-empty-modal')
        ?.addEventListener('click', () => modal.classList.add('hidden'));

      document
        .getElementById('btn-s18-empty-back-to-input')
        ?.addEventListener('click', () => {
          modal.classList.add('hidden');
          FullScreenTab3AndApprovalWorkbench.openFullScreenAiWorkbench();
          setTimeout(() => {
            document.getElementById('s18-fullscreen-prompt-textarea')?.focus();
          }, 60);
        });

      document
        .getElementById('btn-s18-empty-continue-run')
        ?.addEventListener('click', () => {
          modal.classList.add('hidden');
          this.runFlashSynthesisWithBlockingSpinner('');
        });
    },

    injectBlockingSpinnerOverlay() {
      if (document.getElementById('modal-s18-blocking-spinner-overlay')) return;
      const overlay = document.createElement('div');
      overlay.id = 'modal-s18-blocking-spinner-overlay';
      overlay.className =
        'hidden fixed inset-0 bg-black/90 z-[2147483647] flex flex-col items-center justify-center p-6 backdrop-blur-md select-none cursor-wait text-white';

      overlay.innerHTML = `
        <div class="w-full max-w-md rounded-3xl border-2 border-emerald-500/80 bg-zinc-950 p-7 shadow-[0_0_60px_rgba(16,185,129,0.4)] text-center space-y-4 pointer-events-auto">
          <div class="relative w-16 h-16 mx-auto flex items-center justify-center">
            <div class="absolute inset-0 rounded-full border-4 border-emerald-500/25 border-t-emerald-400 animate-spin"></div>
            <span class="text-2xl">🎱</span>
          </div>
          <h3 id="s18-spinner-main-title" class="text-base font-extrabold uppercase tracking-wide text-emerald-400">
            ⏳ GEMINI FLASH ĐANG TỔNG HỢP CÂU LỆNH CỦA BẠN...
          </h3>
          <p id="s18-spinner-sub-desc" class="text-xs text-zinc-300 leading-relaxed">
            Đang kết hợp tự động: Câu lệnh cá nhân + Rule Chế độ làm việc + Số từ mong muốn + Điểm nhìn POV + Story Bible. Vui lòng chờ trong giây lát...
          </p>
          <div id="s18-spinner-model-badge" class="inline-block px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 font-monoCode font-bold text-[11px] text-emerald-300">
            Model tổng hợp: gemini-3.5-flash-lite
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
    },

    showBlockingSpinner(titleText, descText, badgeText) {
      const overlay = document.getElementById(
        'modal-s18-blocking-spinner-overlay'
      );
      const tEl = document.getElementById('s18-spinner-main-title');
      const dEl = document.getElementById('s18-spinner-sub-desc');
      const bEl = document.getElementById('s18-spinner-model-badge');
      if (tEl && titleText) tEl.textContent = titleText;
      if (dEl && descText) dEl.textContent = descText;
      if (bEl && badgeText) bEl.textContent = badgeText;
      overlay?.classList.remove('hidden');
    },

    hideBlockingSpinner() {
      document
        .getElementById('modal-s18-blocking-spinner-overlay')
        ?.classList.add('hidden');
    },

    injectSynthesizedApprovalModal() {
      let modal = document.getElementById('modal-bug11-prompt-synthesizer');
      if (modal) modal.remove();

      modal = document.createElement('div');
      modal.id = 'modal-bug11-prompt-synthesizer';
      modal.className =
        'hidden fixed inset-0 bg-black/85 z-[2147483645] flex items-center justify-center p-4 backdrop-blur-sm select-none text-xs text-white';

      modal.innerHTML = `
        <div class="w-full max-w-4xl rounded-3xl border-2 border-emerald-500/70 bg-zinc-950 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
          <div class="px-6 py-4 border-b border-zinc-800 bg-emerald-950/50 flex items-center justify-between">
            <div>
              <h3 class="font-extrabold uppercase text-sm text-emerald-400">
                ✅ ĐÃ TỔNG HỢP XONG CÂU LỆNH & THÔNG SỐ — BẤM DUYỆT ĐỂ CHẠY MÔ HÌNH ĐÃ CHỌN
              </h3>
              <p id="s18-synth-used-flash-label" class="text-[11px] text-zinc-400">
                Đã được Gemini Flash tổng hợp hoàn chỉnh từ mọi yêu cầu của bạn.
              </p>
            </div>
            <button type="button" id="btn-s18-close-synth-modal" class="px-3 py-1 rounded-xl bg-zinc-800 hover:bg-red-600 font-bold">✕</button>
          </div>

          <div id="s18-synth-chips-bar" class="px-6 py-2.5 bg-zinc-900 border-b border-zinc-800 flex flex-wrap items-center gap-2 text-[11px] font-monoCode"></div>

          <div class="p-6 space-y-2 overflow-y-auto flex-1">
            <label class="block font-extrabold uppercase text-[11px] text-amber-400">
              📝 Bản Prompt Tổng Hợp Cuối Cùng (Có thể chỉnh sửa thêm trước khi bấm Duyệt & Chạy):
            </label>
            <textarea id="textarea-bug11-synthesized-prompt" rows="13" class="w-full p-4 rounded-2xl border-2 border-emerald-500/40 bg-zinc-900 text-zinc-100 font-monoCode text-xs leading-relaxed select-text focus:outline-none focus:border-emerald-400"></textarea>
          </div>

          <div class="px-6 py-4 border-t border-zinc-800 bg-zinc-900/90 flex flex-wrap items-center justify-between gap-3">
            <span class="text-[11px] text-zinc-400">
              Khi bấm nút bên phải, hệ thống sẽ chạy đúng <b>Mô hình Gemini</b> và <b>Mức độ tư duy</b> bạn đã chọn.
            </span>
            <div class="flex items-center gap-2.5">
              <button type="button" id="btn-s18-cancel-synth-modal" class="px-4 py-2.5 rounded-xl border border-zinc-700 hover:bg-zinc-800 font-bold">
                Quay Lại Sửa
              </button>
              <button type="button" id="btn-s18-approve-and-execute-final" class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs md:text-sm shadow-xl transition flex items-center gap-2">
                <span>🚀 Duyệt & Chạy Prompt Viết Truyện Hoàn Chỉnh Ngay</span>
              </button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      document
        .getElementById('btn-s18-close-synth-modal')
        ?.addEventListener('click', () => modal.classList.add('hidden'));
      document
        .getElementById('btn-s18-cancel-synth-modal')
        ?.addEventListener('click', () => {
          modal.classList.add('hidden');
          FullScreenTab3AndApprovalWorkbench.openFullScreenAiWorkbench();
        });

      document
        .getElementById('btn-s18-approve-and-execute-final')
        ?.addEventListener('click', async () => {
          const editedPrompt =
            document.getElementById('textarea-bug11-synthesized-prompt')
              ?.value || '';
          if (!editedPrompt.trim() || !this.lastSynthesizedPayload) return;
          modal.classList.add('hidden');
          await this.executeFinalApprovedPrompt({
            ...this.lastSynthesizedPayload,
            synthesizedUserPrompt: editedPrompt
          });
        });
    },

    interceptRunButtons() {
      document.addEventListener(
        'click',
        (e) => {
          const btn = e.target.closest(
            '#btn-run-primary-ai-action, #btn-s6-popup-run-primary'
          );
          if (!btn) return;

          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();

          const activeKey =
            MasterApiKeyVault.activeKey ||
            MasterApiKeyVault.loadPersistedKey();
          if (!activeKey) {
            ensureFullFeaturedWelcomeApiKeyModal();
            showWelcomeRedBlockAlert();
            return;
          }

          const fsPrompt = document.getElementById(
            's18-fullscreen-prompt-textarea'
          );
          const beatsArea = document.getElementById('textarea-chapter-beats');
          let rawPrompt = (fsPrompt?.value || beatsArea?.value || '').trim();
          if (beatsArea && rawPrompt) beatsArea.value = rawPrompt;

          if (!rawPrompt) {
            document
              .getElementById('modal-s18-empty-prompt-confirm')
              ?.classList.remove('hidden');
            return;
          }

          this.runFlashSynthesisWithBlockingSpinner(rawPrompt);
        },
        true
      );
    },

    async runFlashSynthesisWithBlockingSpinner(userRawPrompt) {
      window.StudioCore?.controller?.syncActiveEditorFieldsToChapterObject?.();

      const apiKey =
        MasterApiKeyVault.activeKey || MasterApiKeyVault.loadPersistedKey();

      const modeId =
        document.getElementById('s18-fullscreen-mode-select')?.value ||
        document.getElementById('select-ai-work-mode')?.value ||
        'MODE_1_DRAFT';

      const selectedModel = StrictModelCatalogController.normalizeModelId(
        document.getElementById('s18-fullscreen-model-select')?.value ||
          document.getElementById('select-active-gemini-model')?.value ||
          'gemini-3.1-pro-preview'
      );

      const thinkingLevel =
        document.getElementById('s18-fullscreen-thinking-select')?.value ||
        document.getElementById('select-active-thinking-level')?.value ||
        'high';

      const targetWordCount = Math.max(
        200,
        parseInt(
          document.getElementById('s18-fullscreen-word-count')?.value ||
            document.getElementById('input-target-word-count')?.value ||
            '4500',
          10
        )
      );

      const chap = window.StudioCore?.approvalGate?.getActiveChapter?.();
      const povChar =
        document.getElementById('select-scene-pov')?.value ||
        chap?.povCharacter ||
        'Đa điểm nhìn';
      const povRel =
        document.getElementById('select-pov-reliability')?.value ||
        chap?.povReliability ||
        'reliable';
      const sceneTime =
        document.getElementById('input-scene-timestamp')?.value?.trim() ||
        chap?.timelineTimestamp ||
        'Tiếp nối mạch hiện tại';
      const sceneLoc =
        document.getElementById('input-scene-location')?.value?.trim() ||
        chap?.location ||
        'Theo diễn biến chương';

      const sceneDirectives =
        window.StudioStage2?.settings?.extractSceneTransitionDirectives?.(
          userRawPrompt
        ) || [];

      const modeRuleObj = window.StudioStage3?.modeRulesManager
        ? window.StudioStage3.modeRulesManager.getRuleForMode(
            modeId,
            targetWordCount
          )
        : {
            name: modeId,
            systemRule: `Triển khai khoảng ${targetWordCount} từ. Thoại: - Câu thoại (Tên nhân vật).`,
            boosterPrompt: ''
          };

      this.showBlockingSpinner(
        '⏳ GEMINI FLASH ĐANG TỔNG HỢP CÂU LỆNH & CÁC YÊU CẦU...',
        'Đang dùng mô hình Gemini Flash của bạn để hợp nhất Câu lệnh + Chế độ + Số từ + Điểm nhìn POV + Mốc chuyển cảnh...',
        'Đang chạy tổng hợp: gemini-3.5-flash-lite'
      );

      const structuredDraft = [
        `=== 1. CHẾ ĐỘ THỰC THI & YÊU CẦU ĐỘ DÀI ===`,
        `- Chế độ: ${modeRuleObj.name}`,
        `- Độ dài bắt buộc: Khoảng ${targetWordCount} từ.`,
        `- Quy ước lời thoại bắt buộc 100%: - Câu thoại (Tên nhân vật)`,
        `- Định hướng chế độ: ${modeRuleObj.boosterPrompt}`,
        ``,
        `=== 2. ĐIỂM NHÌN (POV), GIỜ GIẤC & BỐI CẢNH ===`,
        `- Chương: #${chap?.chapterNumber || 1} - ${
          chap?.displayTitle || chap?.title || ''
        }`,
        `- Mốc giờ: ${sceneTime} | Địa điểm: ${sceneLoc} | POV: ${povChar} (${povRel})`,
        ``,
        `=== 3. MỐC CHUYỂN ĐỔI PHÂN CẢNH (${sceneDirectives.length} mốc) ===`,
        sceneDirectives.length > 0
          ? sceneDirectives
              .map(
                (s) =>
                  `• Cảnh #${s.index}: [Giờ: ${s.time}] [Địa điểm: ${s.location}] [POV: ${s.pov}] -> Chỉ đạo: ${s.directive}`
              )
              .join('\n')
          : '• Triển khai liền mạch theo bối cảnh chung.',
        ``,
        `=== 4. CÂU LỆNH & Ý TƯỞNG CỦA TÁC GIẢ ===`,
        userRawPrompt ||
          '(Tự động triển khai tiếp nối tự nhiên dựa trên mạch chương trước và Story Bible hiện tại).'
      ].join('\n');

      let synthesizedResult = structuredDraft;
      let flashUsed = 'gemini-3.5-flash-lite';

      for (const fModel of [
        'gemini-3.5-flash-lite',
        'gemini-3.5-flash',
        'gemini-3-flash-preview',
        'gemini-2.5-flash'
      ]) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${fModel}:generateContent?key=${encodeURIComponent(
            apiKey
          )}`;
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: {
                parts: [
                  {
                    text: `Bạn là Trợ lý Tổng hợp Prompt Tiểu thuyết. Hãy kết hợp toàn bộ thông số và yêu cầu bên dưới thành MỘT BẢN CHỈ ĐẠO PROMPT TỔNG HỢP mạch lạc, rõ ràng, giữ nguyên yêu cầu ${targetWordCount} từ, POV ${povChar}, các mốc chuyển cảnh và quy ước thoại "- Câu thoại (Tên nhân vật)". Không tự viết truyện ở bước này.`
                  }
                ]
              },
              contents: [{ role: 'user', parts: [{ text: structuredDraft }] }],
              generationConfig: { temperature: 0.25, maxOutputTokens: 4096 }
            })
          });

          if (res.ok) {
            const data = await res.json();
            const txt = (data?.candidates?.[0]?.content?.parts || [])
              .filter((p) => !p.thought && typeof p.text === 'string')
              .map((p) => p.text)
              .join('\n')
              .trim();
            if (txt && txt.length > 60) {
              synthesizedResult = txt;
              flashUsed = fModel;
              break;
            }
          }
        } catch (_) {}
      }

      this.hideBlockingSpinner();

      this.lastSynthesizedPayload = {
        apiKey,
        modeId,
        selectedModel,
        thinkingLevel,
        targetWordCount,
        systemInstruction: modeRuleObj.systemRule,
        boosterPrompt: modeRuleObj.boosterPrompt,
        povChar
      };

      const synthModal = document.getElementById(
        'modal-bug11-prompt-synthesizer'
      );
      const chipsBar = document.getElementById('s18-synth-chips-bar');
      const usedLabel = document.getElementById('s18-synth-used-flash-label');
      const promptArea = document.getElementById(
        'textarea-bug11-synthesized-prompt'
      );

      if (usedLabel) {
        usedLabel.textContent = `⚡ Đã tổng hợp tự động bằng ${flashUsed} trên Key API của bạn.`;
      }
      if (chipsBar) {
        chipsBar.innerHTML = `
          <span class="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold">Mô hình chạy viết truyện: ${selectedModel}</span>
          <span class="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold">Mức tư duy: ${thinkingLevel.toUpperCase()}</span>
          <span class="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold">Số từ mục tiêu: ${targetWordCount.toLocaleString(
            'vi-VN'
          )} từ</span>
          <span class="px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 font-bold">POV: ${povChar}</span>
        `;
      }
      if (promptArea) promptArea.value = synthesizedResult;
      synthModal?.classList.remove('hidden');
    },

    async executeFinalApprovedPrompt(payload) {
      this.showBlockingSpinner(
        `🚀 ĐANG VIẾT TRUYỆN BẰNG ${payload.selectedModel.toUpperCase()}...`,
        `Đang thực thi với Mức tư duy: ${payload.thinkingLevel.toUpperCase()} và Mục tiêu: ${payload.targetWordCount.toLocaleString(
          'vi-VN'
        )} từ...`,
        `Model đang chạy: ${payload.selectedModel}`
      );
      try {
        await window.StudioStage3.executeConfirmedSynthesizedPrompt(payload);
      } finally {
        this.hideBlockingSpinner();
      }
    }
  };

  // ==========================================================================
  // MODULE 11: THU GỌN TAB 4, AUTO-SAVE TAB 2, KÍCH HOẠT TAB 6 & VIDEO HD 5 PHÚT
  // ==========================================================================
  function setupTab2Tab4Tab6And5MinVideo() {
    // 11A. Khung Kết nối ổ cứng ở cột trái Tab 2
    const leftSidebar = document.getElementById('left-sidebar-pane');
    if (leftSidebar && !document.getElementById('s14-files-screen-toolbar')) {
      const toolbar = document.createElement('div');
      toolbar.id = 's14-files-screen-toolbar';
      toolbar.className =
        'p-3 border-b border-zinc-800 bg-zinc-900/95 space-y-2 text-xs shrink-0';
      toolbar.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="font-extrabold uppercase text-[10px] text-amber-400">📁 KẾT NỐI Ổ CỨNG & NẠP FILE NGUỒN</span>
          <span class="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-monoCode font-bold text-[9px]">● Auto-Save BẬT</span>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button type="button" id="btn-s18-tab2-connect-folder" class="py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] shadow">📁 Kết Nối Ổ Cứng</button>
          <button type="button" id="btn-s18-tab2-import-files" class="py-2 px-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-[11px] shadow">📥 Nạp DOCX/PDF/TXT</button>
        </div>
      `;
      leftSidebar.prepend(toolbar);

      document
        .getElementById('btn-s18-tab2-connect-folder')
        ?.addEventListener('click', () =>
          SystemFolderStep1Manager.promptUserToChooseNewFolder()
        );
      document
        .getElementById('btn-s18-tab2-import-files')
        ?.addEventListener('click', () =>
          document.getElementById('btn-scan-legacy-files')?.click()
        );
    }

    // 11B. Thu gọn khung cấu hình lớn ở Tab 4 (Story Bible)
    const bibleView = document.getElementById('s10-story-bible-main-view');
    const topCard = bibleView?.firstElementChild;
    if (topCard && !document.getElementById('s18-tab4-compact-toggle-bar')) {
      const toggleBar = document.createElement('div');
      toggleBar.id = 's18-tab4-compact-toggle-bar';
      toggleBar.className =
        'px-4 py-2 rounded-2xl border border-emerald-500/40 bg-zinc-900 flex flex-wrap items-center justify-between gap-2 text-xs select-none shadow';
      toggleBar.innerHTML = `
        <span class="font-extrabold uppercase text-emerald-400">🏛️ STORY BIBLE TỰ ĐỘNG & HỒ SƠ NHÂN VẬT</span>
        <div class="flex items-center gap-2">
          <button type="button" id="btn-s18-tab4-quick-sync" class="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow">⚡ Chọn Chương & Cập Nhật Story Bible Ngay</button>
          <button type="button" id="btn-s18-tab4-expand-config" class="px-3 py-1 rounded-xl bg-zinc-800 hover:bg-amber-600 text-amber-300 hover:text-zinc-950 border border-amber-500/40 font-extrabold text-xs">▼ Mở rộng Khung Chọn Chương, Khóa Mẫu & Mô Hình AI</button>
        </div>
      `;
      bibleView.insertBefore(toggleBar, topCard);
      topCard.classList.add('hidden');

      document
        .getElementById('btn-s18-tab4-expand-config')
        ?.addEventListener('click', (e) => {
          const isHidden = topCard.classList.toggle('hidden');
          e.currentTarget.textContent = isHidden
            ? '▼ Mở rộng Khung Chọn Chương, Khóa Mẫu & Mô Hình AI'
            : '▲ Thu gọn Khung Cấu Hình Story Bible';
        });
      document
        .getElementById('btn-s18-tab4-quick-sync')
        ?.addEventListener('click', () => {
          document.getElementById('btn-s10-sync-bible-now')?.click();
        });
    }

    // 11C. Kích hoạt các nút ở Tab 6
    document.addEventListener(
      'click',
      (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const id = btn.id || '';
        const txt = (btn.textContent || '').trim();

        if (
          id === 's17-sys-btn-welcome' ||
          id === 'btn-s6-card-apikey' ||
          txt.includes('Mở Màn Hình Đầu Vào')
        ) {
          e.preventDefault();
          e.stopPropagation();
          ensureFullFeaturedWelcomeApiKeyModal();
          return;
        }
        if (
          id === 's17-sys-btn-megaphone' ||
          id === 's20-version-only-badge' ||
          txt.includes('Loa Thông Báo Version')
        ) {
          e.preventDefault();
          e.stopPropagation();
          document
            .getElementById('modal-s10-changelog')
            ?.classList.remove('hidden');
          return;
        }
        if (
          id === 's17-sys-btn-video' ||
          id === 'btn-s6-card-tutorial' ||
          txt.includes('Video HD Hướng Dẫn')
        ) {
          e.preventDefault();
          e.stopPropagation();
          document
            .getElementById('modal-s10-video-guide')
            ?.classList.remove('hidden');
        }
      },
      true
    );
  }

  // ==========================================================================
  // MODULE 12: BỘ CANH GÁC CHỐNG HỒI QUY & KHỞI ĐỘNG TỔNG LỰC (MASTER BOOTLOADER)
  // ==========================================================================
  function bootStage18V5MasterAll() {
    try {
      StrictModelCatalogController.enforceCleanModelsAcrossAllSelects();
      MasterApiKeyVault.disarmBrowserPasswordManagerPopup();
      ensureFullFeaturedWelcomeApiKeyModal();
      bindBrandButtonReturnToScreen1();
      CleanTab1AndTab2HeaderController.init();
      FullScreenTab3AndApprovalWorkbench.init();
      TwinFloatingPomodoroAndMp3Controller.init();
      DualSeparatedChatbotBiEngine.init();
      BlockingSynthesisAndExecutionPipeline.init();
      setupTab2Tab4Tab6And5MinVideo();

      window.StudioStage18 = {
        navigateToTab: navigateDirectlyToScreen,
        openFullScreenAiWorkbench: () =>
          FullScreenTab3AndApprovalWorkbench.openFullScreenAiWorkbench(),
        openFullScreenApprovalModal: () =>
          FullScreenTab3AndApprovalWorkbench.openFullScreenApprovalModal(),
        openVideoTutorialModal: () =>
          document
            .getElementById('modal-s10-video-guide')
            ?.classList.remove('hidden')
      };

      // Watchdog định kỳ 800ms: Ngăn Stage 16/17 vẽ lại thanh Pomodoro cũ, nhét lại model rác hoặc bật lại type="password"
      if (!window.__S18_V5_WATCHDOG__) {
        window.__S18_V5_WATCHDOG__ = setInterval(() => {
          document.getElementById('s15-floating-pomodoro-pill')?.remove();
          document.getElementById('s19-floating-mp3-bar')?.remove();
          StrictModelCatalogController.enforceCleanModelsAcrossAllSelects();
          MasterApiKeyVault.disarmBrowserPasswordManagerPopup();
        }, 800);
      }
    } catch (err) {
      console.error('Stage 18 V5 Boot Error:', err);
    }
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(bootStage18V5MasterAll, 300);
      setTimeout(bootStage18V5MasterAll, 1200);
    });
  } else {
    setTimeout(bootStage18V5MasterAll, 200);
    setTimeout(bootStage18V5MasterAll, 1000);
  }
})();