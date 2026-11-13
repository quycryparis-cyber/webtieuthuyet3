/**
 * ============================================================================
 * MODULE 35: GHI CÔNG TÁC GIẢ (MAI HẢI ĐĂNG), LỊCH SỬ 3 NGÀY CÙNG AI
 *             VÀ KÊNH KẾT NỐI CHÍNH THỨC (GMAIL & FACEBOOK)
 *             (mod35_author_credits_and_social_hub.js)
 * ============================================================================
 * Nhiệm vụ cốt lõi:
 *   1. Trình bày trang trọng mục Ghi Công Tác Giả (Author Credits) ngay tại Tab 6:
 *      - Tác giả duy nhất: Mai Hải Đăng.
 *      - Khung chạy chữ tự động từ trên xuống dưới (Auto-Scrolling Credits),
 *        bắt đầu bằng lời tâm sự chân thành về hành trình 3 ngày làm web cùng AI
 *        từ nỗi đau không có công cụ viết truyện riêng, qua toàn bộ vai trò đều do
 *        Mai Hải Đăng đảm nhiệm, và khép lại bằng lời cảm ơn cộng đồng.
 *      - Đầy đủ nút điều khiển mượt mà: Phát / Tạm dừng, Chạy lại từ đầu, Tốc độ
 *        đọc (Chậm / Vừa / Nhanh), chế độ Rạp chiếu toàn màn hình & Xuất tệp ghi công.
 *   2. Hiển thị công khai thông tin liên hệ chính chủ ngay tại Tab 6 & Rạp chiếu:
 *      - Gmail: quycryparis@gmail.com (kèm nút sao chép 1 chạm & mở trình soạn thư).
 *      - Facebook: Biểu tượng icon Facebook liên kết trực tiếp tới
 *        https://www.facebook.com/MDangKyNang.
 *   3. Bảo chứng ghi công đồng bộ trên Cổng Kết Nối Đầu Vào & Popup Sức Khỏe Tự Lưu 3 Tầng.
 *
 * Kiến trúc thuần khiết: Đăng ký qua `window.NoirStudio.registerModule('mod35', ...)`.
 * ============================================================================
 */
(function initModule35AuthorCreditsAndSocialHub(global) {
  'use strict';

  const NS = (global.NoirStudio = global.NoirStudio || {});

  const MOD35_CONSTANTS = Object.freeze({
    MODULE_KEY: 'mod35',
    VERSION: '38.5.0',
    AUTHOR_NAME: 'Mai Hải Đăng',
    AUTHOR_ALIAS: 'Bi',
    AUTHOR_GMAIL: 'quycryparis@gmail.com',
    AUTHOR_FACEBOOK_URL: 'https://www.facebook.com/MDangKyNang',
    STORAGE_KEY_PREFS: 'noir_mod35_credits_prefs_v1',
    STORAGE_KEY_APPRECIATION: 'noir_mod35_author_appreciation_v1',
    DEFAULT_SCROLL_SPEED_PX_PER_SEC: 26,
    MIN_SCROLL_SPEED: 10,
    MAX_SCROLL_SPEED: 80
  });

  const AUTHOR_CREDITS_SCRIPT = Object.freeze({
    headlineTitle: 'WEB VIẾT TIỂU THUYẾT CỦA BI — GHI CÔNG TÁC GIẢ',
    subtitleTag: 'Được hoàn thiện bởi một tác giả yêu truyện trong 3 ngày đồng hành cùng AI',
    openingDedication:
      'Mình lấy cảm hứng từ nỗi đau không có web riêng, mình thì không biết lập trình nên là mình làm hơi lâu, cụ thể là 3 ngày với AI, mong mọi người thông cảm nếu có sai sót nha, có gì cứ report bug cho mình, mình rất cảm ơn mọi người đã dùng web mình.',
    closingGratitude:
      'Một lần nữa, xin chân thành cảm ơn từng tác giả đã tin tưởng đặt những chương truyện tâm huyết của bạn vào không gian nhỏ này. Chúc bạn luôn giữ được ngọn lửa sáng tác bền bỉ và không bao giờ bị hụt cảm hứng!',
    copyrightLine: 'Phát triển & chịu trách nhiệm bởi Mai Hải Đăng • Dành tặng cộng đồng viết tiểu thuyết'
  });

  const SOLO_ROLE_ROSTER = Object.freeze([
    {
      id: 'ROLE_FOUNDER',
      category: 'KHỞI XƯỚNG & TẦM NHÌN',
      roleTitle: 'Tác giả sản phẩm & Người khởi xướng dự án',
      personName: MOD35_CONSTANTS.AUTHOR_NAME,
      note: 'Từ nhu cầu có một bàn viết chuyên sâu dành riêng cho người sáng tác Light Novel dài hơi.'
    },
    {
      id: 'ROLE_UX',
      category: 'TRẢI NGHIỆM SÁNG TÁC',
      roleTitle: 'Thiết kế luồng 6 Màn Hình Studio & Bàn viết tập trung',
      personName: MOD35_CONSTANTS.AUTHOR_NAME,
      note: 'Tách bạch viết thảo, quản lý chương, AI 5 chế độ, Story Bible, không gian âm nhạc và xuất bản.'
    },
    {
      id: 'ROLE_AI_PROMPTING',
      category: 'CHỈ HUY HỆ THỐNG AI',
      roleTitle: 'Kiến tạo quy trình 5 Chế độ AI, Ma trận Ai Biết Gì & Prompt Tổng',
      personName: MOD35_CONSTANTS.AUTHOR_NAME,
      note: 'Kết nối Chế độ 2 lập dàn ý sang Chế độ 1 viết sâu, chặn sáo ngữ AI và ký hiệu rối mắt.'
    },
    {
      id: 'ROLE_DATA_SAFETY',
      category: 'AN TOÀN DỮ LIỆU',
      roleTitle: 'Định hình Tự Lưu 3 Tầng, Ghi nhớ Thư mục Ổ cứng & Khiên Chống Reload',
      personName: MOD35_CONSTANTS.AUTHOR_NAME,
      note: 'Đặt ưu tiên số 1 là bảo vệ từng con chữ tác giả gõ ra không bao giờ bị bay mất.'
    },
    {
      id: 'ROLE_QA_DEBUG',
      category: 'KIỂM THỬ THỰC CHIẾN',
      roleTitle: 'Thử nghiệm từng tính năng, soi từng điểm cấn và sửa lỗi liên tục',
      personName: MOD35_CONSTANTS.AUTHOR_NAME,
      note: 'Kiên nhẫn kiểm tra trên từng tab, ghi nhận từng chi tiết hiển thị để mài giũa hoàn thiện.'
    },
    {
      id: 'ROLE_BUILD_PARTNERSHIP',
      category: 'ĐÓNG GÓI CÙNG AI',
      roleTitle: 'Điều phối xây dựng toàn bộ ứng dụng web trong 3 ngày cùng AI',
      personName: MOD35_CONSTANTS.AUTHOR_NAME,
      note: 'Chứng minh rằng niềm đam mê kể chuyện vẫn có thể tạo ra công cụ riêng dù xuất phát điểm không phải lập trình viên.'
    }
  ]);

  const THREE_DAY_CREATION_TIMELINE = Object.freeze([
    {
      dayNumber: 1,
      dayTitle: 'Ngày 1 — Nỗi Đau Không Có Web Riêng & Viên Gạch Đầu Tiên',
      summary:
        'Bắt đầu từ cảm giác khó chịu khi viết tiểu thuyết dài tập trên các trình soạn thảo rời rạc: hay quên chi tiết nhân vật cũ, file Word nặng nề, và AI viết rời rạc không nhớ bối cảnh.',
      deliverables: [
        'Hình thành ý tưởng Studio 6 màn hình tách biệt hoàn toàn không gian viết và công cụ phụ.',
        'Đặt nền móng lưu trữ trực tiếp xuống thư mục ổ cứng người dùng + tự lưu dự phòng.',
        'Khởi tạo linh vật Trợ Lý Viên Bi Số 8 làm bạn đồng hành khi bí ý.'
      ]
    },
    {
      dayNumber: 2,
      dayTitle: 'Ngày 2 — Story Bible Chống Quên, 5 Chế Độ AI & Không Gian Cảm Hứng',
      summary:
        'Nhận ra viết hàng trăm chương sẽ làm AI thông thường quên cốt truyện nên tích hợp cầu nối NotebookLM, ma trận Ai Biết Gì, bảng phục bút cùng trình phát nhạc MP3 và hiệu ứng nền 60FPS.',
      deliverables: [
        'Tách 5 Chế độ AI chuyên sâu từ lập dàn ý đến thanh tra logic và vẽ biểu đồ SVG.',
        'Bổ sung trình đọc giọng tự nhiên Neural, đồng hồ Pomodoro đồng bộ và xuất sách PDF/DOCX/EPUB.',
        'Xây dựng Cổng Kết Nối API Key + Thư mục an toàn trước khi vào bàn viết.'
      ]
    },
    {
      dayNumber: 3,
      dayTitle: 'Ngày 3 — Lắng Nghe Từng Lỗi Nhỏ, Tối Ưu Giao Diện & Mở Kênh Report Bug',
      summary:
        'Dành trọn ngày thứ 3 kiểm thử khắt khe từng lỗi thực tế: sửa thanh công cụ Tab 2, nối mạch Chế độ 2 sang Chế độ 1, gọt bỏ ký hiệu AI thừa, làm tối rõ các menu chọn và lắp đặt Khiên chống tải lại trang.',
      deliverables: [
        'Khắc phục lỗi lọc chương Nháp / Đã duyệt và chống đè chữ ở thanh tiêu đề Tab 1-2.',
        'Hoàn thiện hộp thoại Báo Lỗi (Report Bug) và màn Ghi công Tác giả gửi lời tri ân tới người dùng.',
        'Mở kênh kết nối trực tiếp qua Gmail và Facebook để tiếp tục hoàn thiện mỗi ngày.'
      ]
    }
  ]);

  const STUDIO_CORE_PILLARS_SUMMARY = Object.freeze([
    {
      id: 'PILLAR_WRITE',
      icon: '✍️',
      title: 'Viết Tự Do Không Lo Mất Chữ',
      detail: 'Tự động lưu 3 tầng, không tải lại trang đột ngột, giữ trọn mạch cảm xúc.'
    },
    {
      id: 'PILLAR_REMEMBER',
      icon: '🧠',
      title: 'Chống Quên Cốt Truyện Dài Hơi',
      detail: 'Story Bible đa tầng, Ma trận Ai Biết Gì, Phục bút, BM25 cục bộ và NotebookLM.'
    },
    {
      id: 'PILLAR_AI_PROSE',
      icon: '🤖',
      title: '5 Chế Độ AI Thuần Văn Xuôi Sạch',
      detail: 'Tách biệt lập dàn ý và viết sâu, kiểm tra logic, loại bỏ hoàn toàn ký hiệu rối mắt.'
    },
    {
      id: 'PILLAR_ATMOSPHERE',
      icon: '🎧',
      title: 'Không Gian Tập Trung Theo Gu Riêng',
      detail: 'Nhạc lặp A-B, tiếng gõ phím cơ ASMR, Pomodoro và khung chữ chuẩn sách in.'
    }
  ]);

  // ==========================================================================
  // LỚP 1: TIỆN ÍCH AN TOÀN & ĐỊNH DẠNG DỮ LIỆU TÁC GIẢ
  // ==========================================================================
  class CreditsSafetyAndFormatHelper {
    escapeHtmlSafe(text) {
      if (NS.uiUtils && typeof NS.uiUtils.escapeHtml === 'function') {
        return NS.uiUtils.escapeHtml(text);
      }
      return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    getSocialSvgIcons() {
      return {
        facebook: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-4 h-4 fill-current shrink-0" aria-hidden="true"><path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z"/></svg>`,
        gmail: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-4 h-4 fill-current shrink-0" aria-hidden="true"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`
      };
    }

    validateSocialUrls() {
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(MOD35_CONSTANTS.AUTHOR_GMAIL);
      const fbValid = /^https:\/\/(www\.)?facebook\.com\/[A-Za-z0-9._-]+\/?$/i.test(
        MOD35_CONSTANTS.AUTHOR_FACEBOOK_URL
      );
      return {
        email: MOD35_CONSTANTS.AUTHOR_GMAIL,
        emailValid,
        facebookUrl: MOD35_CONSTANTS.AUTHOR_FACEBOOK_URL,
        facebookValid: fbValid
      };
    }
  }

  // ==========================================================================
  // LỚP 2: ĐỘNG CƠ CUỘN CHỮ TỰ ĐỘNG TỪ TRÊN XUỐNG (SmoothCreditsAnimator)
  // ==========================================================================
  class SmoothCreditsAutoscrollAnimator {
    constructor() {
      this.isPlaying = true;
      this.isHoverPaused = false;
      this.loopEnabled = true;
      this.speedPxPerSec = MOD35_CONSTANTS.DEFAULT_SCROLL_SPEED_PX_PER_SEC;
      this.rafId = null;
      this.lastFrameTime = 0;
      this.exactScrollAccumulator = 0;
      this.registeredViewports = new Map();
    }

    registerViewport(key, element) {
      if (!key || !element) return;
      this.registeredViewports.set(key, element);

      if (!element.dataset.noirMod35ScrollBound) {
        element.dataset.noirMod35ScrollBound = '1';
        element.addEventListener('mouseenter', () => {
          this.isHoverPaused = true;
        });
        element.addEventListener('mouseleave', () => {
          this.isHoverPaused = false;
          this.lastFrameTime = 0;
        });
        element.addEventListener('touchstart', () => {
          this.isHoverPaused = true;
        }, { passive: true });
        element.addEventListener('touchend', () => {
          setTimeout(() => {
            this.isHoverPaused = false;
            this.lastFrameTime = 0;
          }, 1500);
        }, { passive: true });
      }
    }

    unregisterViewport(key) {
      this.registeredViewports.delete(key);
    }

    isElementActuallyVisible(el) {
      if (!el || !el.isConnected) return false;
      if (el.offsetParent === null) return false;
      const rect = el.getBoundingClientRect();
      return rect.height > 10 && rect.width > 10;
    }

    startLoop() {
      if (this.rafId !== null || typeof requestAnimationFrame !== 'function') return;
      this.lastFrameTime = 0;
      const tick = (now) => {
        this.rafId = requestAnimationFrame(tick);
        if (!this.isPlaying || this.isHoverPaused) {
          this.lastFrameTime = now;
          return;
        }
        if (!this.lastFrameTime) {
          this.lastFrameTime = now;
          return;
        }
        const deltaSec = Math.min(0.1, Math.max(0, (now - this.lastFrameTime) / 1000));
        this.lastFrameTime = now;

        const stepPx = this.speedPxPerSec * deltaSec;
        if (stepPx <= 0) return;

        this.registeredViewports.forEach((el) => {
          if (!this.isElementActuallyVisible(el)) return;
          const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
          if (maxScroll <= 4) return;

          const curTop = Number(el._mod35FloatScrollTop ?? el.scrollTop);
          let nextTop = curTop + stepPx;

          if (nextTop >= maxScroll - 1) {
            if (this.loopEnabled) {
              nextTop = 0;
            } else {
              nextTop = maxScroll;
            }
          }
          el._mod35FloatScrollTop = nextTop;
          el.scrollTop = nextTop;
        });
      };
      this.rafId = requestAnimationFrame(tick);
    }

    stopLoop() {
      if (this.rafId !== null && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    }

    setPlaying(flag) {
      this.isPlaying = Boolean(flag);
      this.lastFrameTime = 0;
      if (this.isPlaying && this.rafId === null) {
        this.startLoop();
      }
      return this.isPlaying;
    }

    setSpeed(pxPerSec) {
      const num = Number(pxPerSec);
      if (Number.isFinite(num)) {
        this.speedPxPerSec = Math.min(
          MOD35_CONSTANTS.MAX_SCROLL_SPEED,
          Math.max(MOD35_CONSTANTS.MIN_SCROLL_SPEED, num)
        );
      }
      return this.speedPxPerSec;
    }

    replayFromTop() {
      this.registeredViewports.forEach((el) => {
        if (el) {
          el._mod35FloatScrollTop = 0;
          el.scrollTop = 0;
        }
      });
      this.lastFrameTime = 0;
      this.setPlaying(true);
    }
  }

  // ==========================================================================
  // LỚP 3: XUẤT BẢN GHI CÔNG & QUẢN LÝ LƯỢT KHÍCH LỆ CỤC BỘ
  // ==========================================================================
  class CreditsDigestAndAppreciationVault {
    constructor() {
      this.cheersCount = 0;
      this.lastCheeredAt = null;
      this.loadState();
    }

    loadState() {
      try {
        const raw = localStorage.getItem(MOD35_CONSTANTS.STORAGE_KEY_APPRECIATION);
        if (raw) {
          const parsed = JSON.parse(raw);
          this.cheersCount = Number(parsed.cheersCount || 0);
          this.lastCheeredAt = parsed.lastCheeredAt || null;
        }
      } catch (_) {}
    }

    saveState() {
      try {
        localStorage.setItem(
          MOD35_CONSTANTS.STORAGE_KEY_APPRECIATION,
          JSON.stringify({
            cheersCount: this.cheersCount,
            lastCheeredAt: this.lastCheeredAt
          })
        );
      } catch (_) {}
    }

    sendHeartAppreciation() {
      this.cheersCount += 1;
      this.lastCheeredAt = Date.now();
      this.saveState();
      return this.cheersCount;
    }

    buildCreditsPlainTextDigest() {
      const lines = [
        `====================================================================`,
        AUTHOR_CREDITS_SCRIPT.headlineTitle,
        AUTHOR_CREDITS_SCRIPT.subtitleTag,
        `====================================================================`,
        ``,
        `[LỜI MỞ ĐẦU TỪ TÁC GIẢ]`,
        AUTHOR_CREDITS_SCRIPT.openingDedication,
        ``,
        `[DANH SÁCH GHI CÔNG VAI TRÒ]`,
        ...SOLO_ROLE_ROSTER.map(
          (r, idx) =>
            `${idx + 1}. ${r.roleTitle} (${r.category}): ${r.personName}\n   -> ${r.note}`
        ),
        ``,
        `[NHẬT KÝ 3 NGÀY ĐỒNG HÀNH CÙNG AI]`,
        ...THREE_DAY_CREATION_TIMELINE.map((d) =>
          [
            `• ${d.dayTitle}`,
            `  ${d.summary}`,
            ...d.deliverables.map((x) => `  - ${x}`)
          ].join('\n')
        ),
        ``,
        `[LỜI CẢM ƠN KẾT THÚC]`,
        AUTHOR_CREDITS_SCRIPT.closingGratitude,
        ``,
        `[LIÊN HỆ TÁC GIẢ]`,
        `• Tác giả : ${MOD35_CONSTANTS.AUTHOR_NAME}`,
        `• Gmail   : ${MOD35_CONSTANTS.AUTHOR_GMAIL}`,
        `• Facebook: ${MOD35_CONSTANTS.AUTHOR_FACEBOOK_URL}`
      ];
      return lines.join('\n');
    }

    downloadCreditsTxt() {
      if (typeof document === 'undefined' || typeof Blob === 'undefined') return false;
      try {
        const txt = this.buildCreditsPlainTextDigest();
        const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ghi-cong-tac-gia-mai-hai-dang.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        return true;
      } catch (_) {
        return false;
      }
    }
  }

  // ==========================================================================
  // LỚP 4: XÂY DỰNG NỘI DUNG CREDIT STAGE (DÙNG CHUNG CHO THẺ TAB 6 & RẠP CHIẾU)
  // ==========================================================================
  class CreditsStageHtmlBuilder {
    constructor(helper) {
      this.helper = helper;
    }

    renderCreditsRollInnerHtml(compact = false) {
      const esc = (v) => this.helper.escapeHtmlSafe(v);
      const padClass = compact ? 'px-4 py-4 space-y-5' : 'px-6 py-6 space-y-7';

      const rolesHtml = SOLO_ROLE_ROSTER.map(
        (item) => `
          <div class="p-3 rounded-xl border border-zinc-800/90 bg-zinc-900/75 text-center space-y-1">
            <div class="text-[10px] font-extrabold uppercase tracking-wider text-violet-300">
              ${esc(item.category)}
            </div>
            <div class="text-xs font-semibold text-zinc-300">
              ${esc(item.roleTitle)}
            </div>
            <div class="text-sm sm:text-base font-extrabold text-white tracking-wide">
              ${esc(item.personName)}
            </div>
            <div class="text-[11px] text-zinc-400 leading-snug max-w-md mx-auto">
              ${esc(item.note)}
            </div>
          </div>
        `
      ).join('');

      const timelineHtml = THREE_DAY_CREATION_TIMELINE.map(
        (day) => `
          <div class="p-3.5 rounded-xl border border-indigo-500/35 bg-indigo-950/25 space-y-2 text-left">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded-md bg-indigo-600/30 border border-indigo-400/45 text-[10px] font-extrabold text-indigo-200">
                NGÀY ${day.dayNumber}
              </span>
              <span class="font-extrabold text-xs text-indigo-200">${esc(day.dayTitle)}</span>
            </div>
            <p class="text-[11px] text-zinc-300 leading-relaxed">${esc(day.summary)}</p>
            <ul class="space-y-1 text-[11px] text-zinc-400 list-disc pl-4">
              ${day.deliverables.map((d) => `<li>${esc(d)}</li>`).join('')}
            </ul>
          </div>
        `
      ).join('');

      const pillarsHtml = STUDIO_CORE_PILLARS_SUMMARY.map(
        (p) => `
          <div class="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-left space-y-0.5">
            <div class="font-extrabold text-xs text-emerald-300">${p.icon} ${esc(p.title)}</div>
            <div class="text-[11px] text-zinc-300 leading-snug">${esc(p.detail)}</div>
          </div>
        `
      ).join('');

      return `
        <div class="${padClass}">
          <!-- 1. Lời Mở Đầu & Tâm Sự 3 Ngày Làm Web Với AI -->
          <div class="text-center space-y-2.5 pb-4 border-b border-violet-500/30">
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-400/50 text-[10px] font-extrabold uppercase tracking-widest text-violet-200">
              🎬 ROLL GHI CÔNG TÁC GIẢ
            </div>
            <h4 class="text-base sm:text-lg font-extrabold text-white tracking-tight">
              ${esc(AUTHOR_CREDITS_SCRIPT.headlineTitle)}
            </h4>
            <p class="text-[11px] font-semibold text-amber-300">
              ${esc(AUTHOR_CREDITS_SCRIPT.subtitleTag)}
            </p>
            <blockquote ${
              compact ? 'id="mod35-opening-story-quote"' : 'id="mod35-modal-opening-story-quote"'
            } class="mt-2 p-3.5 rounded-2xl border border-amber-500/40 bg-amber-950/35 text-xs sm:text-[13px] text-amber-100 leading-relaxed italic text-left">
              "${esc(AUTHOR_CREDITS_SCRIPT.openingDedication)}"
            </blockquote>
          </div>

          <!-- 2. Toàn Bộ Vai Trò Do Một Mình Tác Giả Mai Hải Đăng Thực Hiện -->
          <div class="space-y-2.5">
            <div class="text-center text-[11px] font-extrabold uppercase tracking-widest text-emerald-300">
              ★ BẢNG PHÂN VAI &amp; THỰC HIỆN ĐỘC LẬP ★
            </div>
            <div class="grid grid-cols-1 gap-2.5">
              ${rolesHtml}
            </div>
          </div>

          <!-- 3. Nhật Ký Hành Trình 3 Ngày Xây Dựng Studio -->
          <div class="space-y-2.5">
            <div class="text-center text-[11px] font-extrabold uppercase tracking-widest text-indigo-300">
              ⏳ HÀNH TRÌNH 3 NGÀY ĐỒNG HÀNH CÙNG AI
            </div>
            <div class="space-y-2.5">
              ${timelineHtml}
            </div>
          </div>

          <!-- 4. 4 Trụ Cột Giá Trị Của Web Viết Tiểu Thuyết Của Bi -->
          <div class="space-y-2.5">
            <div class="text-center text-[11px] font-extrabold uppercase tracking-widest text-teal-300">
              💎 NHỮNG ĐIỀU STUDIO LUÔN BẢO VỆ CHO BẠN
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              ${pillarsHtml}
            </div>
          </div>

          <!-- 5. Lời Cảm Ơn Kết Thúc -->
          <div class="text-center space-y-2 pt-4 pb-6 border-t border-violet-500/30">
            <div class="text-xs font-extrabold uppercase tracking-widest text-rose-300">
              💖 LỜI CẢM ƠN TỪ MAI HẢI ĐĂNG
            </div>
            <p class="text-xs text-zinc-200 leading-relaxed max-w-lg mx-auto">
              ${esc(AUTHOR_CREDITS_SCRIPT.closingGratitude)}
            </p>
            <div class="text-[11px] font-bold text-violet-300 pt-1">
              ${esc(AUTHOR_CREDITS_SCRIPT.copyrightLine)}
            </div>
            <div class="text-[10px] text-zinc-500 pt-2">
              • Kết thúc vòng cuộn — Tự động quay lại từ đầu để đọc lại lời tâm sự •
            </div>
          </div>
        </div>
      `;
    }
  }

  // ==========================================================================
  // LỚP 5: BỘ ĐIỀU PHỐI TAB 6 CREDITS, MODAL RẠP CHIẾU & LIÊN HỆ XÃ HỘI
  // ==========================================================================
  class Tab6AuthorCreditsStudioController {
    constructor() {
      this.helper = new CreditsSafetyAndFormatHelper();
      this.animator = new SmoothCreditsAutoscrollAnimator();
      this.vault = new CreditsDigestAndAppreciationVault();
      this.stageBuilder = new CreditsStageHtmlBuilder(this.helper);

      this.isCardExpanded = true;
      this.initialized = false;
    }

    async init() {
      if (this.initialized) return this;
      this.initialized = true;
      this.loadPrefs();
      this.mountTab6CreditsCard();
      this.mountFullscreenCinemaModalIfNeeded();
      this.syncExternalAttributions();
      this.animator.startLoop();
      return this;
    }

    loadPrefs() {
      try {
        const raw = localStorage.getItem(MOD35_CONSTANTS.STORAGE_KEY_PREFS);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (typeof parsed.speed === 'number') {
            this.animator.setSpeed(parsed.speed);
          }
          if (typeof parsed.loop === 'boolean') {
            this.animator.loopEnabled = parsed.loop;
          }
        }
      } catch (_) {}
    }

    savePrefs() {
      try {
        localStorage.setItem(
          MOD35_CONSTANTS.STORAGE_KEY_PREFS,
          JSON.stringify({
            speed: this.animator.speedPxPerSec,
            loop: this.animator.loopEnabled
          })
        );
      } catch (_) {}
    }

    syncExternalAttributions() {
      if (typeof document === 'undefined') return;
      const gatePill = document.getElementById('gate-author-attribution-pill');
      if (gatePill && !gatePill.textContent.includes(MOD35_CONSTANTS.AUTHOR_NAME)) {
        gatePill.innerHTML = `<span>✍️ Web do <strong class="text-white">${this.helper.escapeHtmlSafe(
          MOD35_CONSTANTS.AUTHOR_NAME
        )}</strong> phát triển</span>`;
      }
    }

    mountTab6CreditsCard() {
      if (typeof document === 'undefined') return;
      const root = document.getElementById('tab6-author-credits-card-root');
      if (!root) return;

      const esc = (v) => this.helper.escapeHtmlSafe(v);
      const icons = this.helper.getSocialSvgIcons();

      root.innerHTML = `
        <div class="flex flex-wrap items-start justify-between gap-3">
          <button
            type="button"
            id="btn-mod35-toggle-credits-collapse"
            aria-expanded="true"
            class="text-left flex-1 min-w-[220px] group focus:outline-none"
          >
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-2 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/45 text-violet-300 font-extrabold text-[10px]">
                🎬 MODULE 35
              </span>
              <h3 class="text-sm sm:text-base font-extrabold text-violet-300 group-hover:text-violet-200 transition">
                Ghi Công Tác Giả (${esc(MOD35_CONSTANTS.AUTHOR_NAME)}) &amp; Kết Nối
              </h3>
              <span id="mod35-collapse-arrow" class="text-xs text-zinc-400 transition-transform" style="transform: rotate(180deg);">▾</span>
            </div>
            <p class="text-[11px] text-zinc-400 mt-1 leading-relaxed">
              Lời tâm sự 3 ngày làm web cùng AI của tác giả, chạy chữ ghi công tự động từ trên xuống &amp; kênh liên hệ trực tiếp.
            </p>
          </button>

          <div class="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              id="btn-mod35-open-cinema-modal"
              class="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs shadow transition"
            >
              🎞️ Phóng To Credits
            </button>
          </div>
        </div>

        <div id="mod35-credits-collapsible-body" class="pt-3 border-t border-zinc-800 space-y-3 text-xs">
          <!-- Hàng 1: Kênh Liên Hệ Chính Chủ (Gmail + Facebook Icon) -->
          <div class="p-3 rounded-xl border border-indigo-500/35 bg-zinc-950/90 flex flex-wrap items-center justify-between gap-2.5">
            <div class="space-y-0.5">
              <div class="text-[11px] font-extrabold text-indigo-300">
                📬 Kênh Kết Nối Tác Giả: <span class="text-white">${esc(MOD35_CONSTANTS.AUTHOR_NAME)}</span>
              </div>
              <div class="flex flex-wrap items-center gap-2 text-[11px] text-zinc-300">
                <span class="inline-flex items-center gap-1 font-monoCode text-emerald-300 select-text" id="mod35-author-gmail-text">
                  ${icons.gmail}
                  <span>${esc(MOD35_CONSTANTS.AUTHOR_GMAIL)}</span>
                </span>
                <button
                  type="button"
                  id="btn-mod35-copy-gmail"
                  class="px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-[10px] transition"
                  title="Sao chép địa chỉ Gmail tác giả"
                >
                  📋 Chép Gmail
                </button>
                <a
                  id="link-mod35-gmail-direct"
                  href="mailto:${esc(MOD35_CONSTANTS.AUTHOR_GMAIL)}"
                  class="px-2 py-0.5 rounded-lg bg-emerald-600/25 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-200 font-bold text-[10px] transition"
                >
                  ✉️ Mở Mail
                </a>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <a
                id="link-mod35-facebook-profile"
                href="${esc(MOD35_CONSTANTS.AUTHOR_FACEBOOK_URL)}"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1877F2] hover:bg-[#166FE5] text-white font-extrabold text-xs shadow-lg transition"
                title="Mở trang Facebook chính thức của Mai Hải Đăng"
              >
                ${icons.facebook}
                <span>Facebook</span>
              </a>
              <button
                type="button"
                id="btn-mod35-cheer-author"
                class="px-3 py-2 rounded-xl border border-rose-500/45 bg-rose-500/15 hover:bg-rose-500/25 text-rose-200 font-extrabold text-xs transition"
                title="Gửi một lời cảm ơn động viên tới tác giả"
              >
                ❤️ Ủng hộ tinh thần (<span id="mod35-cheer-count">${this.vault.cheersCount}</span>)
              </button>
            </div>
          </div>

          <!-- Hàng 2: Thanh Điều Khiển Chạy Chữ Tự Động Từ Trên Xuống -->
          <div class="flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div class="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                id="btn-mod35-play-pause"
                class="px-2.5 py-1 rounded-lg bg-violet-600/30 hover:bg-violet-600/45 border border-violet-500/50 text-violet-100 font-bold transition"
              >
                ⏸️ Tạm dừng cuộn
              </button>
              <button
                type="button"
                id="btn-mod35-replay"
                class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold transition"
              >
                🔄 Chạy lại từ đầu
              </button>
              <button
                type="button"
                id="btn-mod35-jump-bug-report"
                class="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 font-bold transition"
              >
                🐞 Report Bug cho mình
              </button>
            </div>

            <div class="flex items-center gap-1.5">
              <span class="text-zinc-400">Tốc độ:</span>
              <select id="mod35-select-scroll-speed" class="noir-dark-select px-2 py-1 rounded-lg border border-zinc-700 bg-zinc-950 text-white font-bold text-[11px]">
                <option value="16">Chậm (Dễ đọc)</option>
                <option value="26" selected>Vừa (Chuẩn)</option>
                <option value="45">Nhanh</option>
              </select>
              <button
                type="button"
                id="btn-mod35-download-credits"
                class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold transition"
                title="Tải xuống bản ghi công .TXT"
              >
                ⬇️ .TXT
              </button>
            </div>
          </div>

          <!-- Hàng 3: Sân Khấu Cuộn Chữ Tự Động Từ Trên Xuống -->
          <div class="relative rounded-2xl border border-violet-500/35 bg-gradient-to-b from-zinc-950 via-zinc-950/95 to-indigo-950/40 overflow-hidden shadow-inner">
            <div class="pointer-events-none absolute inset-x-0 top-0 h-5 bg-gradient-to-b from-zinc-950 to-transparent z-10"></div>
            <div
              id="mod35-credits-scroll-viewport"
              tabindex="0"
              aria-label="Bảng ghi công tác giả tự động chạy từ trên xuống"
              class="h-64 sm:h-72 overflow-y-auto select-text scroll-auto"
            >
              ${this.stageBuilder.renderCreditsRollInnerHtml(true)}
            </div>
            <div class="pointer-events-none absolute inset-x-0 bottom-0 h-7 bg-gradient-to-t from-zinc-950 to-transparent z-10"></div>
          </div>
        </div>
      `;

      const viewport = document.getElementById('mod35-credits-scroll-viewport');
      if (viewport) {
        this.animator.registerViewport('tab6_card', viewport);
      }

      const speedSel = document.getElementById('mod35-select-scroll-speed');
      if (speedSel) {
        speedSel.value = String(this.animator.speedPxPerSec);
      }

      this.bindCardEvents();
    }

    mountFullscreenCinemaModalIfNeeded() {
      if (typeof document === 'undefined') return;
      if (document.getElementById('mod35-credits-cinema-modal')) return;

      const esc = (v) => this.helper.escapeHtmlSafe(v);
      const icons = this.helper.getSocialSvgIcons();

      const modal = document.createElement('div');
      modal.id = 'mod35-credits-cinema-modal';
      modal.className =
        'hidden fixed inset-0 z-[85] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');

      modal.innerHTML = `
        <div class="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border-2 border-violet-500/50 bg-zinc-950 shadow-2xl overflow-hidden">
          <div class="px-5 py-3.5 border-b border-zinc-800 bg-zinc-900/90 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div class="flex items-center gap-2">
              <span class="text-base">🎬</span>
              <div>
                <h3 class="text-sm sm:text-base font-extrabold text-violet-300">
                  Bảng Ghi Công Chính Thức — ${esc(MOD35_CONSTANTS.AUTHOR_NAME)}
                </h3>
                <p class="text-[11px] text-zinc-400">Chạy tự động từ trên xuống dưới (rê chuột để tạm dừng đọc kỹ)</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" id="btn-mod35-modal-replay" class="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition">
                🔄 Phát lại từ đầu
              </button>
              <button type="button" id="btn-mod35-modal-close" class="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs transition">
                ✕ Đóng
              </button>
            </div>
          </div>

          <div id="mod35-modal-credits-viewport" class="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-950 via-zinc-950 to-indigo-950/35 select-text">
            ${this.stageBuilder.renderCreditsRollInnerHtml(false)}
          </div>

          <div class="px-5 py-3 border-t border-zinc-800 bg-zinc-900/80 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-zinc-300 font-bold">Gmail:</span>
              <a href="mailto:${esc(MOD35_CONSTANTS.AUTHOR_GMAIL)}" class="font-monoCode text-emerald-300 hover:underline">
                ${esc(MOD35_CONSTANTS.AUTHOR_GMAIL)}
              </a>
            </div>
            <a
              href="${esc(MOD35_CONSTANTS.AUTHOR_FACEBOOK_URL)}"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1877F2] hover:bg-[#166FE5] text-white font-extrabold text-xs transition"
            >
              ${icons.facebook}
              <span>Facebook Mai Hải Đăng</span>
            </a>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      const modalViewport = document.getElementById('mod35-modal-credits-viewport');
      if (modalViewport) {
        this.animator.registerViewport('cinema_modal', modalViewport);
      }

      document.getElementById('btn-mod35-modal-close')?.addEventListener('click', () => {
        modal.classList.add('hidden');
        NS.modalStack?.unregister?.('mod35-credits-cinema-modal');
      });
      document.getElementById('btn-mod35-modal-replay')?.addEventListener('click', () => {
        this.animator.replayFromTop();
        this.syncPlayPauseButtonLabel();
      });
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
          NS.modalStack?.unregister?.('mod35-credits-cinema-modal');
        }
      });
    }

    openCinemaModal() {
      this.mountFullscreenCinemaModalIfNeeded();
      const modal = document.getElementById('mod35-credits-cinema-modal');
      if (!modal) return false;
      modal.classList.remove('hidden');
      const mv = document.getElementById('mod35-modal-credits-viewport');
      if (mv) {
        mv._mod35FloatScrollTop = 0;
        mv.scrollTop = 0;
      }
      this.animator.setPlaying(true);
      this.syncPlayPauseButtonLabel();
      NS.modalStack?.register?.('mod35-credits-cinema-modal', () => {
        modal.classList.add('hidden');
      });
      return true;
    }

    setExpanded(flag) {
      this.isCardExpanded = Boolean(flag);
      const body = document.getElementById('mod35-credits-collapsible-body');
      const toggleBtn = document.getElementById('btn-mod35-toggle-credits-collapse');
      const arrow = document.getElementById('mod35-collapse-arrow');
      if (body) {
        if (this.isCardExpanded) body.classList.remove('hidden');
        else body.classList.add('hidden');
      }
      if (toggleBtn) {
        toggleBtn.setAttribute('aria-expanded', this.isCardExpanded ? 'true' : 'false');
      }
      if (arrow) {
        arrow.style.transform = this.isCardExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    }

    syncPlayPauseButtonLabel() {
      const btn = document.getElementById('btn-mod35-play-pause');
      if (!btn) return;
      btn.textContent = this.animator.isPlaying ? '⏸️ Tạm dừng cuộn' : '▶️ Tiếp tục chạy chữ';
    }

    bindCardEvents() {
      const bind = (id, evt, handler) => {
        const el = document.getElementById(id);
        if (!el || el.dataset.noirMod35Bound) return;
        el.dataset.noirMod35Bound = '1';
        el.addEventListener(evt, handler);
      };

      bind('btn-mod35-toggle-credits-collapse', 'click', () => {
        this.setExpanded(!this.isCardExpanded);
      });

      bind('btn-mod35-open-cinema-modal', 'click', () => {
        this.openCinemaModal();
      });

      bind('btn-mod35-play-pause', 'click', () => {
        this.animator.setPlaying(!this.animator.isPlaying);
        this.syncPlayPauseButtonLabel();
      });

      bind('btn-mod35-replay', 'click', () => {
        this.animator.replayFromTop();
        this.syncPlayPauseButtonLabel();
      });

      bind('btn-mod35-select-scroll-speed', 'change', () => {});
      bind('mod35-select-scroll-speed', 'change', (e) => {
        const val = Number(e?.target?.value || 26);
        this.animator.setSpeed(val);
        this.savePrefs();
      });

      bind('btn-mod35-copy-gmail', 'click', async () => {
        try {
          if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(MOD35_CONSTANTS.AUTHOR_GMAIL);
            NS.uiUtils?.showToast?.(
              `📋 Đã sao chép Gmail: ${MOD35_CONSTANTS.AUTHOR_GMAIL}`,
              'success'
            );
          }
        } catch (_) {}
      });

      bind('btn-mod35-cheer-author', 'click', () => {
        const nextCount = this.vault.sendHeartAppreciation();
        const countEl = document.getElementById('mod35-cheer-count');
        if (countEl) countEl.textContent = String(nextCount);
        NS.uiUtils?.showToast?.(
          '💖 Cảm ơn lời động viên của bạn dành cho Mai Hải Đăng!',
          'success',
          3200
        );
      });

      bind('btn-mod35-jump-bug-report', 'click', () => {
        if (NS.bugReporter && typeof NS.bugReporter.setExpanded === 'function') {
          NS.bugReporter.setExpanded(true);
          document.getElementById('mod34-textarea-bug-what')?.focus();
          document.getElementById('tab6-bug-report-card-root')?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      });

      bind('btn-mod35-download-credits', 'click', () => {
        if (this.vault.downloadCreditsTxt()) {
          NS.uiUtils?.showToast?.('⬇️ Đã tải tệp Ghi công tác giả (.TXT)!', 'success');
        }
      });
    }

    getHealthSummary() {
      const urls = this.helper.validateSocialUrls();
      return {
        moduleKey: MOD35_CONSTANTS.MODULE_KEY,
        initialized: this.initialized,
        authorName: MOD35_CONSTANTS.AUTHOR_NAME,
        authorGmail: urls.email,
        authorFacebookUrl: urls.facebookUrl,
        isCreditsAutoScrolling: this.animator.isPlaying,
        scrollSpeedPxPerSec: this.animator.speedPxPerSec,
        rolesCount: SOLO_ROLE_ROSTER.length,
        rolesSolelyCreditedToAuthor: SOLO_ROLE_ROSTER.every(
          (r) => r.personName === MOD35_CONSTANTS.AUTHOR_NAME
        )
      };
    }
  }

  // ==========================================================================
  // LỚP 6: PHỤ BẢN CẨM NANG & CÂU HỎI THƯỜNG GẶP VỀ TÁC GIẢ (AuthorFaqMatrix)
  // ==========================================================================
  const AUTHOR_STORY_FAQ = Object.freeze([
    {
      id: 'FAQ_WHY_BUILT',
      question: 'Vì sao bạn quyết định tạo ra Web Viết Tiểu Thuyết Của Bi?',
      answer:
        'Vì khi viết tiểu thuyết dài tập trên các công cụ phổ thông, mình gặp cảnh AI nhanh quên nhân vật, mất định dạng lời thoại hoặc file ngày càng nặng. Mình muốn một nơi tập trung hoàn chỉnh dành riêng cho người viết truyện tiếng Việt.'
    },
    {
      id: 'FAQ_HOW_LONG',
      question: 'Bạn mất bao lâu để hoàn thiện trang web này khi chưa biết lập trình?',
      answer:
        'Mình không xuất thân từ ngành lập trình nên tự điều phối, thiết kế luồng dùng và kiểm thử cùng AI suốt 3 ngày liên tục, rồi tiếp tục tinh chỉnh từng lỗi nhỏ theo góp ý thực tế.'
    },
    {
      id: 'FAQ_HOW_REPORT',
      question: 'Nếu người dùng gặp lỗi hoặc muốn góp ý tính năng mới thì gửi ở đâu?',
      answer:
        'Bạn có thể điền thẳng vào mục Report Bug ngay cạnh bảng Ghi Công ở Tab 6, hoặc liên hệ trực tiếp qua Gmail quycryparis@gmail.com hay Facebook cá nhân ở phía trên.'
    },
    {
      id: 'FAQ_DATA_PRIVACY',
      question: 'Bản thảo truyện và API Key của người viết được lưu ở đâu?',
      answer:
        'Toàn bộ bản thảo và Gemini API Key nằm ngay trong trình duyệt và thư mục ổ cứng của chính bạn, không gửi ra máy chủ bên thứ ba khi bạn gửi báo lỗi hay xem trang Ghi Công.'
    }
  ]);

  const WRITING_CRAFT_WISHES = Object.freeze([
    'Chúc trang viết đêm nay của bạn tuôn chảy mượt mà không gặp cảnh bí chữ.',
    'Mong từng nhân vật trong Story Bible đều giữ được hơi thở riêng và cá tính sắc nét.',
    'Một đoạn văn thật hay đôi khi chỉ bắt đầu từ vài gạch đầu dòng dàn ý thô ở Chế độ 2.',
    'Hãy cứ viết nháp thật thoải mái — hệ thống Tự Lưu 3 Tầng và Khiên Chống Reload sẽ giữ chữ giúp bạn.',
    'Khi nào mỏi mắt vì ánh sáng đêm khuya, nhớ bật bộ lọc nhiệt độ màu 3400K ở Tab 5 nhé.',
    'Mỗi góp ý Report Bug của bạn giúp trang web nhỏ này trưởng thành hơn từng ngày.'
  ]);

  class CreditsFaqAndQuotesWidget {
    constructor(helper) {
      this.helper = helper;
      this.activeFaqId = AUTHOR_STORY_FAQ[0].id;
    }

    getRotatingAuthorWish(seedIndex = null) {
      const idx =
        typeof seedIndex === 'number'
          ? Math.abs(Math.floor(seedIndex)) % WRITING_CRAFT_WISHES.length
          : new Date().getMinutes() % WRITING_CRAFT_WISHES.length;
      return WRITING_CRAFT_WISHES[idx];
    }

    renderFaqAccordionHtml() {
      const esc = (v) => this.helper.escapeHtmlSafe(v);
      return AUTHOR_STORY_FAQ.map(
        (faq) => `
          <details class="rounded-xl border border-zinc-800 bg-zinc-900/70 p-2.5 text-left" ${
            faq.id === this.activeFaqId ? 'open' : ''
          }>
            <summary class="cursor-pointer font-bold text-[11px] text-violet-200 hover:text-white select-none">
              ❓ ${esc(faq.question)}
            </summary>
            <p class="text-[11px] text-zinc-300 mt-1.5 leading-relaxed pl-4">
              ${esc(faq.answer)}
            </p>
          </details>
        `
      ).join('');
    }
  }

  class AuthorCreditsDiagnosticInspector {
    inspectCreditsIntegrity() {
      if (typeof document === 'undefined') {
        return { healthy: true, mode: 'headless' };
      }
      const rootExists = Boolean(document.getElementById('tab6-author-credits-card-root'));
      const viewport = document.getElementById('mod35-credits-scroll-viewport');
      const gmailLink = document.getElementById('link-mod35-gmail-direct');
      const fbLink = document.getElementById('link-mod35-facebook-profile');
      const quoteEl = document.getElementById('mod35-opening-story-quote');

      const hasGmail = Boolean(
        gmailLink && gmailLink.getAttribute('href')?.includes(MOD35_CONSTANTS.AUTHOR_GMAIL)
      );
      const hasFacebook = Boolean(
        fbLink && fbLink.getAttribute('href') === MOD35_CONSTANTS.AUTHOR_FACEBOOK_URL
      );
      const hasIntroText = Boolean(
        quoteEl && quoteEl.textContent?.includes('3 ngày với AI')
      );
      const canScroll = Boolean(viewport && viewport.scrollHeight >= viewport.clientHeight);

      return {
        healthy: rootExists && hasGmail && hasFacebook && hasIntroText,
        rootExists,
        hasGmail,
        hasFacebook,
        hasIntroText,
        canScroll
      };
    }
  }

  const prevBuildInner = CreditsStageHtmlBuilder.prototype.renderCreditsRollInnerHtml;
  CreditsStageHtmlBuilder.prototype.renderCreditsRollInnerHtml = function (compact = false) {
    const baseHtml = prevBuildInner.call(this, compact);
    const faqWidget = new CreditsFaqAndQuotesWidget(this.helper);
    const dailyWish = faqWidget.getRotatingAuthorWish();
    const esc = (v) => this.helper.escapeHtmlSafe(v);

    const extraSection = `
      <div class="px-4 sm:px-6 pb-6 space-y-3 border-t border-zinc-800/80 pt-4">
        <div class="text-center text-[11px] font-extrabold uppercase tracking-widest text-amber-300">
          ✨ CÂU CHUYỆN HẬU TRƯỜNG &amp; NHẮN NHỦ TỚI TÁC GIẢ
        </div>
        <div class="p-3 rounded-xl border border-emerald-500/35 bg-emerald-950/25 text-center text-[11px] text-emerald-200 font-semibold">
          "${esc(dailyWish)}"
        </div>
        <div class="space-y-2">
          ${faqWidget.renderFaqAccordionHtml()}
        </div>
      </div>
    `;
    return `${baseHtml}${extraSection}`;
  };

  Tab6AuthorCreditsStudioController.prototype.runIntegrityAudit = function () {
    const inspector = new AuthorCreditsDiagnosticInspector();
    return inspector.inspectCreditsIntegrity();
  };

  // ==========================================================================
  // BỘ MỞ RỘNG DANH BẠ CÔNG TRÌNH & PHÒNG CHIẾU ACCESSIBILITY (MOD 35 SUITE)
  // ==========================================================================

  /**
   * Nhật ký phát hành chính thức từ thế hệ kiến trúc 30 module đến 36 module.
   * Ghi nhận toàn bộ quá trình Mai Hải Đăng dùng AI để rèn giũa trang web trong 3 ngày.
   */
  const RELEASE_CHRONICLE_CATALOG = Object.freeze([
    {
      version: 'v38.5',
      dateLabel: 'Ngày thứ 3 · Đêm hoàn thiện chuẩn Google Engineer',
      badge: 'Mới nhất',
      badgeTone: 'emerald',
      soleAuthor: 'Mai Hải Đăng',
      headline: 'Thanh lọc văn phong AI thuần khiết, Cố vấn Chế độ 1 -> Chế độ 2 & Bộ 3 Module 34-35-36',
      highlights: [
        'Đưa nút Duyệt & Chốt Bản Thảo sang bên trái thanh Tab 2 và chống chồng chữ tuyệt đối ở mọi độ rộng.',
        'Sửa bộ lọc chương Tab 2: bấm Nháp chỉ hiện Nháp, bấm Đã duyệt chỉ hiện Đã duyệt, bấm Tổng mới hiện tất cả.',
        'Xây dựng Bộ 5 Prompt mẫu chuyên sâu với thanh chỉ dẫn xám riêng cho từng Chế độ (Chế độ 2 mở đầu bằng dàn ý thô).',
        'Khi chạy Chế độ 1 mà Chế độ 2 chưa có gợi ý diễn biến, bật nhắc thân thiện với cụm "Chế độ 2" gạch chân bấm nhảy thẳng sang Chế độ 2.',
        'Tự động dệt kết quả Chế độ 2 vào Prompt tổng hợp của Chế độ 1 để nối mạch truyện liền lạc.',
        'Cấm AI dùng ký tự thô (**, *, #, ---) trong 5 chế độ + Chatbot Bi, đồng thời lọc sạch văn bản đầu ra.',
        'Khử nền trắng chói cho toàn bộ hộp chọn <select> ở Tab 5 sang chữ trắng trên nền tối #09090b.',
        'Ra mắt Mod 34 (Báo lỗi người dùng), Mod 35 (Author Credits Mai Hải Đăng) và Mod 36 (Khiên Chống Reload mất chữ).'
      ],
      modulesTouched: ['index.html', 'mod03', 'mod08', 'mod09', 'mod11', 'mod14', 'mod16', 'mod17', 'mod18', 'mod21', 'mod22', 'mod27', 'mod28', 'mod30', 'mod31', 'mod34', 'mod35', 'mod36']
    },
    {
      version: 'v38.2',
      dateLabel: 'Ngày thứ 3 · Buổi chiều đồng bộ UI & Kho tranh 0MB',
      badge: 'Ổn định',
      badgeTone: 'sky',
      soleAuthor: 'Mai Hải Đăng',
      headline: 'Cổng Kết Nối 2 Bước, 2 Nền Tối Giản Đen/Trắng & Hồ Sơ Nhân Vật Song Hành Story Bible',
      highlights: [
        'Bổ sung 2 nền tối giản đen tuyền và trắng sáng cạnh kho 6 tranh nghệ thuật tự sinh 0MB.',
        'Khung Story Bible mẫu được mở rộng dễ tìm, đồng bộ trực tiếp Hồ Sơ Nhân Vật Đa Chiều và Ma trận Ai Biết Gì.',
        'Tích hợp quy trình NotebookLM khép kín: xuất PDF gộp mọi chương, dán prompt tổng hợp, nhận lại Bible chuẩn xác.',
        'Thống nhất hiển thị trạng thái kết nối API Key và Thư mục ổ cứng theo thời gian thực trên Tab 6.'
      ],
      modulesTouched: ['mod04', 'mod05', 'mod12', 'mod22', 'mod26', 'mod32', 'mod33']
    },
    {
      version: 'v37.8',
      dateLabel: 'Ngày thứ 2 · Tối ưu Cỗ Máy 5 Chế Độ & Video Hướng Dẫn DOM Thật',
      badge: 'Cốt lõi',
      badgeTone: 'violet',
      soleAuthor: 'Mai Hải Đăng',
      headline: 'Viết sâu 20.000+ từ qua Argon 4 / Carbon 4 & Video Hướng Dẫn Phủ Bóng Giao Diện Thật',
      highlights: [
        'Hiển thị đường dẫn gạch chân trực tiếp copy toàn bộ Prompt tổng hợp và mở Gemini Web chạy Argon 4 / Carbon 4.',
        'Mẹo chống quên tuyệt đối với NotebookLM có nút click trực tiếp ngay trên chữ gạch chân.',
        'Video hướng dẫn song ngữ Anh - Việt quay trực tiếp khung hình DOM thực tế của trang web.',
        'Định tuyến Chatbot Viên Bi Số 8 mặc định qua Flash-Lite để tiết kiệm quota dài hạn cho người viết.'
      ],
      modulesTouched: ['mod15', 'mod16', 'mod27', 'mod28', 'mod31', 'mod33']
    },
    {
      version: 'v36.5',
      dateLabel: 'Ngày thứ 2 · Buổi sáng Bảo Vệ Dữ Liệu 3 Tầng & Âm Thanh 60FPS',
      badge: 'Kiến trúc',
      badgeTone: 'amber',
      soleAuthor: 'Mai Hải Đăng',
      headline: 'Lưu Tự Động 3 Tầng LocalStorage + IndexedDB + 6 Thư Mục Ổ Cứng & Nhạc Lo-fi AB Loop',
      highlights: [
        'Khắc phục lỗi chọn thư mục và nhớ trạng thái API/Thư mục an toàn giữa các phiên làm việc.',
        'Bổ sung thanh chỉnh mức Tư duy Thấp / Trung bình / Cao kèm theo dõi hạn mức RPM / RPD trực tiếp.',
        'Các thanh nổi Pomodoro, Nhạc nền, Trợ lý Bi có thể thu gọn, kéo thả tự do và đóng/mở linh hoạt từ Tab 5.'
      ],
      modulesTouched: ['mod05', 'mod09', 'mod19', 'mod20', 'mod21', 'mod29']
    },
    {
      version: 'v35.0',
      dateLabel: 'Ngày thứ 1 · Khởi nguyên Hệ Sinh Thái Viết Tiểu Thuyết 30 Module',
      badge: 'Khởi tạo',
      badgeTone: 'zinc',
      soleAuthor: 'Mai Hải Đăng',
      headline: 'Từ 10 chữ đầu tiên tới Ý tưởng Biến Bàn Viết Thành Studio Tiểu Thuyết Toàn Diện',
      highlights: [
        'Xây dựng bộ lõi thuần Vanilla JS không framework, tải tức thì và không phụ thuộc server ngoài.',
        'Thiết kế 6 Tab công việc khép kín từ Viết tay, Quản lý chương, 5 Chế độ AI, Story Bible tới Xuất bản.',
        'Hoàn thành nền tảng RAG nội bộ TF-IDF giúp AI đọc hiểu bối cảnh truyện dài hàng trăm nghìn từ.'
      ],
      modulesTouched: ['mod01', 'mod02', 'mod03', 'mod06', 'mod07', 'mod10', 'mod13', 'mod24', 'mod25']
    }
  ]);

  /**
   * Các cột mốc sáng tác dành riêng cho tác giả dùng Studio do Mai Hải Đăng xây dựng.
   */
  const COMMUNITY_WRITING_MILESTONES = Object.freeze([
    {
      id: 'ms_first_spark',
      minWords: 1,
      minApproved: 0,
      icon: '🕯️',
      title: 'Ngọn Nến Đầu Tiên',
      note: 'Bạn đã gõ những con chữ đầu tiên trong Studio. Mọi đại tiểu thuyết đều bắt đầu từ dòng chữ thứ nhất.'
    },
    {
      id: 'ms_chapter_seal',
      minWords: 1500,
      minApproved: 1,
      icon: '📜',
      title: 'Chương Đã Chốt Dấu',
      note: 'Ít nhất 1 chương đã được Duyệt & Chốt Bản Thảo và đồng bộ vào hệ thống Story Bible.'
    },
    {
      id: 'ms_novella_stride',
      minWords: 10000,
      minApproved: 3,
      icon: '🖋️',
      title: 'Nhịp Bút Bền Bỉ',
      note: 'Vượt mốc 10.000 từ với 3 chương hoàn chỉnh — tương đương hồi mở màn của một bộ Light Novel thực thụ.'
    },
    {
      id: 'ms_story_architect',
      minWords: 30000,
      minApproved: 6,
      icon: '🏛️',
      title: 'Kiến Trúc Sư Thế Giới',
      note: 'Trên 30.000 từ — lúc này Story Bible, Ma trận Ai Biết Gì và Phục bút đã phát huy tối đa uy lực.'
    },
    {
      id: 'ms_volume_titan',
      minWords: 60000,
      minApproved: 10,
      icon: '👑',
      title: 'Chủ Nhân Quyển Một',
      note: 'Đạt dung lượng 1 quyển Light Novel hoàn chỉnh! Hãy dùng Tab 6 xuất sách DOCX / PDF lưu giữ thành quả.'
    },
    {
      id: 'ms_grand_epic',
      minWords: 120000,
      minApproved: 20,
      icon: '🌌',
      title: 'Đại Tự Sự Vượt Mọi Giới Hạn',
      note: 'Hơn 120.000 từ — Mai Hải Đăng xin gửi lời chúc mừng nồng nhiệt nhất tới sự kiên trì phi thường của bạn!'
    }
  ]);

  /**
   * Các triết lý thiết kế mà Mai Hải Đăng đặt làm kim chỉ nam trong 3 ngày dựng web cùng AI.
   */
  const SOLO_CRAFT_PILLARS = Object.freeze([
    {
      code: 'PILLAR-01',
      title: 'Quyền Riêng Tư Tuyệt Đối Của Bản Thảo',
      detail: 'Mọi dòng truyện bạn viết đều nằm trên trình duyệt và thư mục ổ cứng do chính tay bạn chọn. Không máy chủ trung gian nào tự ý giữ chữ của bạn.'
    },
    {
      code: 'PILLAR-02',
      title: 'AI Là Bút Lực, Không Phải Kẻ Áp Đặt Văn Phong',
      detail: 'Từng chế độ từ 1 đến 5 đều được thiết kế để nối đúng mạch truyện, tôn trọng góc nhìn nhân vật và loại bỏ sạch sẽ ký tự markdown công nghiệp.'
    },
    {
      code: 'PILLAR-03',
      title: 'An Tâm Tuyệt Đối Khi Gõ Phím Hàng Giờ',
      detail: 'Với lưu 3 tầng và Khiên chống reload Mod 36, bạn có thể viết thâu đêm mà không sợ mất bản thảo vì một phím lỡ tay hay sự cố trình duyệt.'
    },
    {
      code: 'PILLAR-04',
      title: 'Làm Ra Từ Tâm Huyết Một Người Trong 3 Ngày',
      detail: 'Từ giao diện tối dịu mắt ban đêm đến từng câu tooltip nhân tính đều được Mai Hải Đăng cùng AI trau chuốt liên tục qua từng phản hồi thực tế.'
    }
  ]);

  /**
   * Thu thập thống kê sáng tác thực tế từ hệ thống để hiển thị bảng Cột mốc trong Credit Hub.
   */
  class CommunityWritingMilestoneMatrix {
    constructor(helper) {
      this.helper = helper;
    }

    collectUserNovelStats() {
      const chapMgr = NS.chapterManager || NS.chapterTree || NS.chapters;
      const chapters = Array.isArray(chapMgr?.chapters)
        ? chapMgr.chapters
        : Array.isArray(NS.state?.chapters)
          ? NS.state.chapters
          : [];

      let totalWords = 0;
      let approvedCount = 0;
      let draftCount = 0;

      for (let i = 0; i < chapters.length; i += 1) {
        const ch = chapters[i];
        if (!ch || typeof ch !== 'object') continue;
        const text = typeof ch.content === 'string' ? ch.content.trim() : '';
        const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
        totalWords += words;
        if (String(ch.status || '').toUpperCase() === 'APPROVED') {
          approvedCount += 1;
        } else {
          draftCount += 1;
        }
      }

      const activeMilestones = COMMUNITY_WRITING_MILESTONES.map((ms) => {
        const wordsOk = totalWords >= ms.minWords;
        const approvedOk = approvedCount >= ms.minApproved;
        const unlocked = wordsOk && approvedOk;
        const wordPct = ms.minWords > 0 ? Math.min(100, Math.round((totalWords / ms.minWords) * 100)) : 100;
        return {
          ...ms,
          unlocked,
          wordPct
        };
      });

      const unlockedCount = activeMilestones.filter((m) => m.unlocked).length;
      return {
        totalWords,
        chapterCount: chapters.length,
        approvedCount,
        draftCount,
        unlockedCount,
        totalMilestones: activeMilestones.length,
        milestones: activeMilestones
      };
    }

    renderMilestoneSummaryBannerHtml() {
      const stats = this.collectUserNovelStats();
      const esc = (v) => this.helper.escapeHtmlSafe(v);
      const nextLocked = stats.milestones.find((m) => !m.unlocked) || stats.milestones[stats.milestones.length - 1];

      const badgeHtml = stats.milestones
        .map((m) => {
          const cardCls = m.unlocked
            ? 'border-emerald-500/45 bg-emerald-950/30 text-emerald-100'
            : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 opacity-75';
          const statusLabel = m.unlocked ? '✅ Đã mở' : `${m.wordPct}%`;
          return `
            <div class="rounded-xl border p-2.5 transition-all ${cardCls}" data-milestone-id="${esc(m.id)}">
              <div class="flex items-center justify-between gap-2">
                <span class="text-[11px] font-extrabold">${esc(m.icon)} ${esc(m.title)}</span>
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/40 border border-white/10">${esc(
                  statusLabel
                )}</span>
              </div>
              <p class="text-[10px] mt-1 leading-relaxed opacity-90">${esc(m.note)}</p>
              <div class="mt-1.5 text-[9px] text-zinc-400 font-semibold">
                Yêu cầu: ${esc(m.minWords.toLocaleString('vi-VN'))} từ · ${esc(m.minApproved)} chương đã duyệt
              </div>
            </div>
          `;
        })
        .join('');

      return `
        <section id="mod35-milestone-matrix-panel" class="rounded-2xl border border-amber-500/30 bg-zinc-950/90 p-3.5 space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 class="text-xs font-extrabold text-amber-200 flex items-center gap-1.5">
                🏆 Hành Trình Sáng Tác Của Bạn Cùng Studio
              </h4>
              <p class="text-[10px] text-zinc-400 mt-0.5">
                Thống kê trực tiếp từ kho chương hiện tại · Tác giả duy nhất: <strong class="text-white">${esc(
                  MOD35_CONSTANTS.AUTHOR_NAME
                )}</strong>
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
              <span class="px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200">
                📖 ${esc(stats.chapterCount)} chương (${esc(stats.approvedCount)} duyệt)
              </span>
              <span class="px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-200">
                ✍️ ${esc(stats.totalWords.toLocaleString('vi-VN'))} từ
              </span>
              <span class="px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-200">
                🎖️ ${esc(stats.unlockedCount)}/${esc(stats.totalMilestones)} cột mốc
              </span>
            </div>
          </div>

          <div class="rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <span class="text-zinc-300">
              Mục tiêu kế tiếp: <strong class="text-amber-300">${esc(nextLocked.icon)} ${esc(nextLocked.title)}</strong>
            </span>
            <span class="text-[10px] font-bold text-zinc-400">
              Tiến độ dung lượng: ${esc(nextLocked.wordPct)}%
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            ${badgeHtml}
          </div>
        </section>
      `;
    }
  }

  /**
   * Nhật ký Phiên bản (Release Diary Explorer Modal) cho phép người dùng tra cứu lại
   * toàn bộ chặng đường phát triển 3 ngày của Mai Hải Đăng cùng AI.
   */
  class ReleaseChangelogExplorerModal {
    constructor(helper, onCloseCallback) {
      this.helper = helper;
      this.onCloseCallback = typeof onCloseCallback === 'function' ? onCloseCallback : null;
      this.filterKeyword = '';
      this.selectedVersion = RELEASE_CHRONICLE_CATALOG[0].version;
      this.isOpen = false;
    }

    ensureModalDom() {
      if (typeof document === 'undefined') return null;
      let modal = document.getElementById('modal-mod35-release-diary');
      if (modal) return modal;

      modal = document.createElement('div');
      modal.id = 'modal-mod35-release-diary';
      modal.className =
        'fixed inset-0 z-[94] hidden flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'mod35-release-diary-title');

      modal.innerHTML = `
        <div class="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-amber-500/40 bg-zinc-950 shadow-2xl overflow-hidden">
          <div class="px-4 py-3 border-b border-zinc-800 bg-gradient-to-r from-amber-950/60 via-zinc-950 to-zinc-900 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 id="mod35-release-diary-title" class="text-sm font-extrabold text-amber-200 flex items-center gap-2">
                📚 Nhật Ký 3 Ngày Chế Tác Web Cùng AI — Tác giả: ${this.helper.escapeHtmlSafe(
                  MOD35_CONSTANTS.AUTHOR_NAME
                )}
              </h3>
              <p class="text-[11px] text-zinc-400 mt-0.5">
                Toàn bộ kiến trúc, giao diện, lập trình và kiểm thử đều do một mình tác giả Mai Hải Đăng thực hiện cùng AI.
              </p>
            </div>
            <button type="button" id="btn-mod35-close-release-diary" class="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold cursor-pointer">
              ✕ Đóng nhật ký
            </button>
          </div>

          <div class="px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/70 flex flex-wrap items-center justify-between gap-2">
            <div class="flex flex-wrap items-center gap-1.5" id="mod35-diary-version-pills"></div>
            <div class="flex items-center gap-2 w-full sm:w-auto">
              <input type="text" id="input-mod35-diary-search" placeholder="Tìm tính năng hoặc module (vd: Tab 2, NotebookLM, Mod 36)..." class="w-full sm:w-64 px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-[11px] text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400">
            </div>
          </div>

          <div id="mod35-diary-scroll-body" class="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"></div>

          <div class="px-4 py-2.5 border-t border-zinc-800 bg-zinc-900/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400">
            <span>✍️ Người xây dựng duy nhất: <strong class="text-amber-300">${this.helper.escapeHtmlSafe(
              MOD35_CONSTANTS.AUTHOR_NAME
            )}</strong></span>
            <span>✉️ Gmail: <strong class="text-emerald-300">${this.helper.escapeHtmlSafe(
              MOD35_CONSTANTS.AUTHOR_GMAIL
            )}</strong></span>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      this.bindModalEvents(modal);
      return modal;
    }

    bindModalEvents(modal) {
      const closeBtn = modal.querySelector('#btn-mod35-close-release-diary');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.close());
      }
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.close();
      });

      const searchInput = modal.querySelector('#input-mod35-diary-search');
      if (searchInput) {
        searchInput.addEventListener('input', () => {
          this.filterKeyword = String(searchInput.value || '').trim().toLowerCase();
          this.renderEntries();
        });
      }
    }

    open(initialVersion) {
      if (initialVersion) this.selectedVersion = initialVersion;
      const modal = this.ensureModalDom();
      if (!modal) return;
      this.isOpen = true;
      modal.classList.remove('hidden');
      this.renderEntries();
    }

    close() {
      const modal = document.getElementById('modal-mod35-release-diary');
      if (modal) modal.classList.add('hidden');
      this.isOpen = false;
      if (this.onCloseCallback) this.onCloseCallback();
    }

    getToneClasses(tone) {
      if (tone === 'emerald') return 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300';
      if (tone === 'sky') return 'bg-sky-500/15 border-sky-500/40 text-sky-300';
      if (tone === 'violet') return 'bg-violet-500/15 border-violet-500/40 text-violet-300';
      if (tone === 'amber') return 'bg-amber-500/15 border-amber-500/40 text-amber-300';
      return 'bg-zinc-800 border-zinc-700 text-zinc-300';
    }

    renderEntries() {
      const pillsRoot = document.getElementById('mod35-diary-version-pills');
      const bodyRoot = document.getElementById('mod35-diary-scroll-body');
      if (!pillsRoot || !bodyRoot) return;
      const esc = (v) => this.helper.escapeHtmlSafe(v);

      pillsRoot.innerHTML = [
        `<button type="button" data-diary-ver="ALL" class="mod35-diary-ver-pill px-2.5 py-1 rounded-lg text-[10px] font-bold border cursor-pointer ${
          this.selectedVersion === 'ALL'
            ? 'bg-amber-500/20 border-amber-400 text-amber-200'
            : 'bg-zinc-950 border-zinc-700 text-zinc-400 hover:text-white'
        }">Tất cả (${RELEASE_CHRONICLE_CATALOG.length})</button>`,
        ...RELEASE_CHRONICLE_CATALOG.map((item) => {
          const active = this.selectedVersion === item.version;
          return `
            <button type="button" data-diary-ver="${esc(item.version)}" class="mod35-diary-ver-pill px-2.5 py-1 rounded-lg text-[10px] font-bold border cursor-pointer ${
            active
              ? 'bg-amber-500/20 border-amber-400 text-amber-200'
              : 'bg-zinc-950 border-zinc-700 text-zinc-400 hover:text-white'
          }">${esc(item.version)}</button>
          `;
        })
      ].join('');

      pillsRoot.querySelectorAll('.mod35-diary-ver-pill').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.selectedVersion = btn.getAttribute('data-diary-ver') || 'ALL';
          this.renderEntries();
        });
      });

      const kw = this.filterKeyword;
      const visibleReleases = RELEASE_CHRONICLE_CATALOG.filter((rel) => {
        if (this.selectedVersion !== 'ALL' && !kw && rel.version !== this.selectedVersion) {
          return false;
        }
        if (!kw) return true;
        const haystack = [
          rel.version,
          rel.dateLabel,
          rel.headline,
          ...rel.highlights,
          ...rel.modulesTouched
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(kw);
      });

      if (!visibleReleases.length) {
        bodyRoot.innerHTML = `
          <div class="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 text-center text-xs text-zinc-400">
            Không tìm thấy cột mốc nào khớp từ khóa "<strong class="text-white">${esc(kw)}</strong>". Thử bấm "Tất cả" hoặc xóa ô tìm kiếm nhé.
          </div>
        `;
        return;
      }

      const pillarCards = SOLO_CRAFT_PILLARS.map(
        (p) => `
          <div class="rounded-xl border border-zinc-800 bg-zinc-900/70 p-2.5">
            <div class="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider">${esc(p.code)}</div>
            <div class="text-[11px] font-bold text-white mt-0.5">${esc(p.title)}</div>
            <p class="text-[10px] text-zinc-400 mt-1 leading-relaxed">${esc(p.detail)}</p>
          </div>
        `
      ).join('');

      const releaseCards = visibleReleases
        .map((rel) => {
          const toneCls = this.getToneClasses(rel.badgeTone);
          const bullets = rel.highlights
            .map(
              (hl) => `
                <li class="flex items-start gap-2 text-[11px] text-zinc-200 leading-relaxed">
                  <span class="text-amber-400 shrink-0 mt-0.5">◆</span>
                  <span>${esc(hl)}</span>
                </li>
              `
            )
            .join('');
          const modsBadges = rel.modulesTouched
            .map(
              (m) =>
                `<span class="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[9px] font-mono text-zinc-300">${esc(
                  m
                )}</span>`
            )
            .join('');

          return `
            <article class="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-2.5">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="px-2 py-0.5 rounded-lg border text-[11px] font-extrabold ${toneCls}">${esc(
            rel.version
          )} · ${esc(rel.badge)}</span>
                  <span class="text-[10px] text-zinc-400 font-semibold">${esc(rel.dateLabel)}</span>
                </div>
                <span class="text-[10px] font-bold text-amber-200">✍️ Tác giả: ${esc(rel.soleAuthor)}</span>
              </div>
              <h4 class="text-xs sm:text-sm font-extrabold text-white">${esc(rel.headline)}</h4>
              <ul class="space-y-1.5 pl-0.5">${bullets}</ul>
              <div class="pt-1 border-t border-zinc-800/80 flex flex-wrap items-center gap-1">
                <span class="text-[9px] text-zinc-500 mr-1 font-bold uppercase">Phạm vi:</span>
                ${modsBadges}
              </div>
            </article>
          `;
        })
        .join('');

      bodyRoot.innerHTML = `
        <div class="space-y-4">
          <div class="space-y-2">${releaseCards}</div>
          <div class="pt-2 border-t border-zinc-800">
            <h5 class="text-[11px] font-extrabold uppercase tracking-wider text-zinc-300 mb-2">
              🧭 4 Nguyên Tắc Cầm Tay Khi Mai Hải Đăng Xây Studio Này
            </h5>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">${pillarCards}</div>
          </div>
        </div>
      `;
    }
  }

  /**
   * Bộ điều khiển Trợ năng Phòng chiếu Credit (Accessibility & Cinema Controls):
   * cho phép chỉnh cỡ chữ cuộn, độ tương phản và điều khiển phím tắt an toàn trong Cinema Modal.
   */
  class CinemaAccessibilityController {
    constructor(helper) {
      this.helper = helper;
      this.fontScale = 'normal';
      this.highContrast = false;
      this.boundKeyHandler = null;
    }

    initKeyboardSupport(cinemaStageGetter) {
      if (typeof document === 'undefined' || this.boundKeyHandler) return;
      this.boundKeyHandler = (event) => {
        const modal = document.getElementById('mod35-credits-cinema-modal');
        if (!modal || modal.classList.contains('hidden')) return;

        const tag = String(document.activeElement?.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select' || document.activeElement?.isContentEditable) {
          return;
        }

        const stage = typeof cinemaStageGetter === 'function' ? cinemaStageGetter() : null;
        if (!stage) return;

        if (event.code === 'Space') {
          event.preventDefault();
          stage.togglePlayPause?.();
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          stage.nudgeSpeed?.(10);
        } else if (event.key === 'ArrowDown') {
          event.preventDefault();
          stage.nudgeSpeed?.(-10);
        } else if (event.key === 'r' || event.key === 'R') {
          event.preventDefault();
          stage.replayFromTop?.();
        }
      };
      document.addEventListener('keydown', this.boundKeyHandler, false);
    }

    applyVisualPreset(scale, contrast) {
      if (scale) this.fontScale = scale;
      if (typeof contrast === 'boolean') this.highContrast = contrast;

      const viewports = [
        document.getElementById('mod35-credits-scroll-viewport'),
        document.getElementById('mod35-modal-credits-viewport')
      ].filter(Boolean);

      for (let i = 0; i < viewports.length; i += 1) {
        const vp = viewports[i];
        vp.style.fontSize =
          this.fontScale === 'large' ? '1.1rem' : this.fontScale === 'compact' ? '0.92rem' : '';
        if (this.highContrast) {
          vp.classList.add('ring-2', 'ring-amber-400/60', 'bg-black');
        } else {
          vp.classList.remove('ring-2', 'ring-amber-400/60', 'bg-black');
        }
      }
      this.updateControlButtons();
    }

    updateControlButtons() {
      const scaleLabel =
        this.fontScale === 'large' ? '🔎 Cỡ chữ: Lớn' : this.fontScale === 'compact' ? '🔎 Cỡ chữ: Gọn' : '🔎 Cỡ chữ: Chuẩn';
      const contrastLabel = this.highContrast ? '🌓 Tương phản: Cao' : '🌓 Tương phản: Dịu';

      const btnScale = document.getElementById('btn-mod35-a11y-fontscale');
      const btnContrast = document.getElementById('btn-mod35-a11y-contrast');
      if (btnScale) btnScale.textContent = scaleLabel;
      if (btnContrast) btnContrast.textContent = contrastLabel;
    }

    cycleFontScale() {
      const next = this.fontScale === 'normal' ? 'large' : this.fontScale === 'large' ? 'compact' : 'normal';
      this.applyVisualPreset(next, this.highContrast);
    }

    toggleContrast() {
      this.applyVisualPreset(this.fontScale, !this.highContrast);
    }
  }

  /**
   * Trình tạo Thiệp Tri Ân / Huy Hiệu Tác Giả (Author Dedication Card Generator)
   * giúp người dùng sao chép nhanh thông tin giới thiệu trang web cho bạn bè viết truyện.
   */
  class AuthorSharePitchComposer {
    constructor(helper) {
      this.helper = helper;
    }

    buildRecommendationPitch() {
      return [
        'Mình đang dùng Web Viết Tiểu Thuyết Của Bi (do tác giả Mai Hải Đăng thiết kế & phát triển cùng AI trong 3 ngày).',
        'Web chạy hoàn toàn trên trình duyệt và đồng bộ thẳng vào thư mục ổ cứng riêng, có 5 chế độ trợ lý AI nối mạch Story Bible, lọc bỏ ký tự markdown thừa, khiên chống reload mất chữ và nhạc Lo-fi tập trung.',
        `Thông tin liên hệ tác giả Mai Hải Đăng — Gmail: ${MOD35_CONSTANTS.AUTHOR_GMAIL} | Facebook: ${MOD35_CONSTANTS.AUTHOR_FACEBOOK_URL}`
      ].join('\n');
    }

    async copyRecommendationToClipboard() {
      const pitch = this.buildRecommendationPitch();
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(pitch);
          return true;
        }
      } catch (e) {}
      try {
        const temp = document.createElement('textarea');
        temp.value = pitch;
        temp.setAttribute('readonly', 'true');
        temp.style.position = 'fixed';
        temp.style.opacity = '0';
        document.body.appendChild(temp);
        temp.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(temp);
        return Boolean(ok);
      } catch (e2) {
        return false;
      }
    }
  }

  // Nâng cấp CreditsStageHtmlBuilder để kèm Cột Mốc Sáng Tác & Triết lý Mai Hải Đăng bên trong luồng Credit
  const prevMod35RenderInnerWithFaq = CreditsStageHtmlBuilder.prototype.renderCreditsRollInnerHtml;
  CreditsStageHtmlBuilder.prototype.renderCreditsRollInnerHtml = function (compact = false) {
    const baseAndFaq = prevMod35RenderInnerWithFaq.call(this, compact);
    const esc = (v) => this.helper.escapeHtmlSafe(v);
    const pillarGrid = SOLO_CRAFT_PILLARS.map(
      (p) => `
        <div class="rounded-xl border border-zinc-800/90 bg-zinc-900/75 p-2.5 text-left">
          <div class="text-[10px] font-extrabold text-amber-300 tracking-wide">${esc(p.title)}</div>
          <p class="text-[10px] text-zinc-400 mt-1 leading-relaxed">${esc(p.detail)}</p>
        </div>
      `
    ).join('');

    const closingColophon = `
      <div class="px-4 sm:px-6 pb-8 space-y-3 border-t border-zinc-800/80 pt-4">
        <div class="text-center text-[11px] font-extrabold uppercase tracking-widest text-amber-300">
          📜 KIM CHỈ NAM THIẾT KẾ CỦA TÁC GIẢ MAI HẢI ĐĂNG
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          ${pillarGrid}
        </div>
        <div class="rounded-xl border border-amber-500/35 bg-gradient-to-r from-amber-950/35 via-zinc-950 to-amber-950/35 p-3 text-center space-y-1">
          <div class="text-xs font-extrabold text-amber-200">
            🎬 FIN · ${esc(AUTHOR_CREDITS_SCRIPT.headlineTitle)}
          </div>
          <p class="text-[11px] text-zinc-300">
            Tác giả duy nhất: <strong class="text-white">${esc(MOD35_CONSTANTS.AUTHOR_NAME)}</strong> · Tạo dựng bằng 3 ngày toàn tâm cùng AI
          </p>
          <p class="text-[10px] text-zinc-400">
            Chúc bạn luôn giữ được ngọn lửa cảm hứng cho từng chương truyện!
          </p>
        </div>
      </div>
    `;

    return `${baseAndFaq}${closingColophon}`;
  };

  /**
   * Khởi tạo thanh công cụ mở rộng dưới Card Credits Tab 6 (Cột mốc sáng tác,
   * Nhật ký 3 ngày, Chia sẻ nhanh & Trợ năng đọc Credits).
   */
  Tab6AuthorCreditsStudioController.prototype.initExtendedCreditsSuite = function () {
    this.milestoneMatrix = new CommunityWritingMilestoneMatrix(this.helper);
    this.releaseDiaryModal = new ReleaseChangelogExplorerModal(this.helper);
    this.a11yController = new CinemaAccessibilityController(this.helper);
    this.pitchComposer = new AuthorSharePitchComposer(this.helper);

    this.a11yController.initKeyboardSupport(() => ({
      togglePlayPause: () => document.getElementById('btn-mod35-play-pause')?.click(),
      replayFromTop: () => document.getElementById('btn-mod35-replay')?.click(),
      nudgeSpeed: (delta) => {
        const sel = document.getElementById('mod35-select-scroll-speed');
        if (!sel) return;
        const cur = Number(sel.value || 26);
        sel.value = delta > 0 ? (cur < 26 ? '26' : '45') : (cur > 26 ? '26' : '16');
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }));

    this.mountExtendedFooterInsideCard();
    this.refreshMilestoneMatrix();
  };

  Tab6AuthorCreditsStudioController.prototype.mountExtendedFooterInsideCard = function () {
    if (typeof document === 'undefined') return;
    const root = document.getElementById('tab6-author-credits-card-root');
    if (!root) return;

    if (!document.getElementById('mod35-extended-suite-footer')) {
      const footer = document.createElement('div');
      footer.id = 'mod35-extended-suite-footer';
      footer.className = 'mt-3 pt-3 border-t border-zinc-800/90 space-y-3';
      footer.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex flex-wrap items-center gap-1.5">
            <button type="button" id="btn-mod35-open-release-diary" class="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-200 text-[11px] font-bold cursor-pointer transition">
              📚 Nhật Ký 3 Ngày Chế Tác Web
            </button>
            <button type="button" id="btn-mod35-copy-share-pitch" class="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-200 text-[11px] font-bold cursor-pointer transition">
              🤝 Chia Sẻ Studio Cho Bạn Bè
            </button>
            <button type="button" id="btn-mod35-toggle-milestones" class="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-[11px] font-bold cursor-pointer transition">
              🏆 Bảng Cột Mốc Sáng Tác
            </button>
          </div>
          <div class="flex flex-wrap items-center gap-1.5">
            <button type="button" id="btn-mod35-a11y-fontscale" class="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-semibold cursor-pointer">
              🔎 Cỡ chữ: Chuẩn
            </button>
            <button type="button" id="btn-mod35-a11y-contrast" class="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-semibold cursor-pointer">
              🌓 Tương phản: Dịu
            </button>
          </div>
        </div>
        <div id="mod35-milestone-matrix-slot" class="hidden"></div>
      `;
      root.appendChild(footer);

      const diaryBtn = document.getElementById('btn-mod35-open-release-diary');
      if (diaryBtn) {
        diaryBtn.addEventListener('click', () => this.openReleaseDiaryModal('v38.5'));
      }

      const shareBtn = document.getElementById('btn-mod35-copy-share-pitch');
      if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
          const ok = await this.pitchComposer.copyRecommendationToClipboard();
          if (typeof NS.showHumanToast === 'function') {
            NS.showHumanToast(
              ok
                ? 'Đã sao chép lời giới thiệu Studio của Mai Hải Đăng! Cảm ơn bạn đã lan tỏa.'
                : 'Không thể tự động copy trên trình duyệt này, bạn có thể chép link Gmail/Facebook ngay phía trên nhé.',
              ok ? 'success' : 'info'
            );
          }
        });
      }

      const msToggle = document.getElementById('btn-mod35-toggle-milestones');
      const msSlot = document.getElementById('mod35-milestone-matrix-slot');
      if (msToggle && msSlot) {
        msToggle.addEventListener('click', () => {
          const isHidden = msSlot.classList.contains('hidden');
          if (isHidden) {
            this.refreshMilestoneMatrix();
            msSlot.classList.remove('hidden');
            msToggle.textContent = '🔽 Thu Gọn Cột Mốc';
          } else {
            msSlot.classList.add('hidden');
            msToggle.textContent = '🏆 Bảng Cột Mốc Sáng Tác';
          }
        });
      }

      const scaleBtn = document.getElementById('btn-mod35-a11y-fontscale');
      if (scaleBtn) {
        scaleBtn.addEventListener('click', () => this.a11yController.cycleFontScale());
      }
      const contrastBtn = document.getElementById('btn-mod35-a11y-contrast');
      if (contrastBtn) {
        contrastBtn.addEventListener('click', () => this.a11yController.toggleContrast());
      }
    }
  };

  Tab6AuthorCreditsStudioController.prototype.refreshMilestoneMatrix = function () {
    if (typeof document === 'undefined' || !this.milestoneMatrix) return;
    const slot = document.getElementById('mod35-milestone-matrix-slot');
    if (slot) {
      slot.innerHTML = this.milestoneMatrix.renderMilestoneSummaryBannerHtml();
    }
  };

  Tab6AuthorCreditsStudioController.prototype.openReleaseDiaryModal = function (versionTag) {
    if (!this.releaseDiaryModal) {
      this.releaseDiaryModal = new ReleaseChangelogExplorerModal(this.helper);
    }
    this.releaseDiaryModal.open(versionTag || 'v38.5');
  };

  Tab6AuthorCreditsStudioController.prototype.runExtendedCreditsDiagnostics = function () {
    const baseReport = this.runIntegrityAudit();
    const milestoneStats = this.milestoneMatrix ? this.milestoneMatrix.collectUserNovelStats() : null;
    const soleAuthorMatched = RELEASE_CHRONICLE_CATALOG.every(
      (entry) => entry.soleAuthor === MOD35_CONSTANTS.AUTHOR_NAME
    );

    const footerMounted = Boolean(
      typeof document !== 'undefined' && document.getElementById('mod35-extended-suite-footer')
    );

    return {
      ...baseReport,
      soleAuthorMatched,
      releaseCount: RELEASE_CHRONICLE_CATALOG.length,
      pillarCount: SOLO_CRAFT_PILLARS.length,
      milestoneCount: COMMUNITY_WRITING_MILESTONES.length,
      footerMounted,
      milestoneStats
    };
  };

  // Bọc init gốc để tự động kích hoạt bộ suite mở rộng khi khởi động Module 35
  const prevMod35ControllerInit = Tab6AuthorCreditsStudioController.prototype.init;
  Tab6AuthorCreditsStudioController.prototype.init = async function () {
    await Promise.resolve(prevMod35ControllerInit.apply(this, arguments));
    try {
      this.initExtendedCreditsSuite();
    } catch (err) {
      console.warn('[Mod35] Extended suite init fallback:', err);
    }
  };

  // ==========================================================================
  // ĐĂNG KÝ SINGLETON MODULE 35 LÊN `window.NoirStudio`
  // ==========================================================================
  const authorCreditsHub = new Tab6AuthorCreditsStudioController();
  NS.authorCredits = authorCreditsHub;
  NS.Mod35AuthorConstants = MOD35_CONSTANTS;
  NS.Mod35SoloRoles = SOLO_ROLE_ROSTER;
  NS.Mod35CreationTimeline = THREE_DAY_CREATION_TIMELINE;
  NS.Mod35ReleaseChronicle = RELEASE_CHRONICLE_CATALOG;

  if (typeof NS.registerModule === 'function') {
    NS.registerModule('mod35', authorCreditsHub);
  }
})(typeof window !== 'undefined' ? window : globalThis);
