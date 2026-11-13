/**
 * ============================================================================
 * MODULE 22: TÙY CHỈNH KIỂU CHỮ TRANG SÁCH, GIAO DIỆN SÁNG/TỐI & ĐỘNG CƠ
 *            ĐỒ HỌA NỀN ĐỘNG 60FPS CANVAS (TYPOGRAPHY & AMBIENT CANVAS ENGINE)
 * ============================================================================
 * Tệp: mod22_typography_and_60fps_ambient_canvas.js
 * Thuộc hệ thống: Web Viết Tiểu Thuyết Của Bi — Studio Sáng Tác Đa Nền Tảng
 *
 * Chức năng cốt lõi:
 * 1. Quản lý toàn diện Kiểu chữ Bàn viết (Typography):
 *    - Font chữ (#select-novel-font-family): Merriweather, Lora, Noto Serif,
 *      Literata, Inter, Times New Roman.
 *    - Cỡ chữ (#bug13-font-size-input): 13px -> 30px.
 *    - Giãn dòng (#bug13-line-height-select): 1.6, 1.85, 2.1.
 *    - Khổ rộng trang sách (#bug13-page-width-select): 100%, 900px, 740px.
 * 2. Chuyển đổi Giao diện Sáng (Giấy kem cổ điển) / Tối (Đêm Noir) qua nút
 *    #btn-toggle-theme và nhãn biểu tượng #theme-icon-label, kèm các tông màu
 *    bảo vệ mắt ban đêm (Sepia, Mực Đêm, Rừng Trúc).
 * 3. Động cơ Vật lý Hạt 60FPS trên #ambient-bg-canvas (Tự động tạm dừng khi ẩn
 *    tab để tiết kiệm pin tối đa trên điện thoại & laptop):
 *    - FIREFLIES (✨ Đom Đóm Đêm): Đom đóm phát quang sinh học đa lớp có chiều sâu
 *      Bokeh và quỹ đạo lượn tự nhiên.
 *    - LANTERNS (🏮 Đèn Lồng Ấm): Đèn trời Khổng Minh bay lên với lõi lửa bập bùng
 *      và tàn lửa vàng rơi nhẹ.
 *    - STARDUST (🌌 Bụi Sao Đêm): Dải ngân hà 3 lớp thị sai, sao lấp lánh bốn cánh
 *      và sao băng vệt sáng ngang trời.
 *    - RAIN_DROPS (🌧️ Mưa Trên Kính): Mưa xiên ngoài trời + giọt nước đọng và
 *      trượt dài ngoằn ngoèo trên mặt kính cửa sổ.
 *    - AUTUMN (🍂 Lá Thu Rơi): Lá phong và lá ngân hạnh xoay nghiêng 3D theo
 *      từng đợt gió mùa thu.
 *    - NONE (⬛ Nền Tĩnh Tối Giản): Tắt hoàn toàn vòng lặp đồ họa (0% GPU).
 * 4. Tải hình ảnh hoặc video cá nhân từ máy làm hình nền (#input-custom-bg-media,
 *    #btn-upload-custom-bg, #ambient-bg-video, #ambient-bg-image) kèm bộ chỉnh
 *    độ mờ kính chắn #ambient-frosted-shield.
 * ============================================================================
 */

(function () {
  'use strict';

  window.NoirStudio = window.NoirStudio || {};

  // ==========================================================================
  // PHẦN 1: HẰNG SỐ LƯU TRỮ, PRESET KIỂU CHỮ SÁCH IN & BẢNG MÀU HIỆU ỨNG
  // ==========================================================================

  const AMBIENCE_STORAGE_KEYS = {
    THEME: 'noir_studio_theme_mode',
    FONT_FAMILY: 'noir_editor_font_family',
    FONT_SIZE: 'noir_editor_font_size',
    LINE_HEIGHT: 'noir_editor_line_height',
    PAGE_WIDTH: 'noir_editor_page_width',
    BG_EFFECT: 'noir_ambient_bg_effect',
    FROST_OPACITY: 'noir_mod22_frost_shield_opacity_v1',
    PARTICLE_DENSITY: 'noir_mod22_particle_density_v1',
    WIND_STRENGTH: 'noir_mod22_wind_strength_v1',
    PARALLAX_ENABLED: 'noir_mod22_parallax_enabled_v1',
    LETTER_SPACING: 'noir_mod22_letter_spacing_v1',
    PARA_SPACING: 'noir_mod22_paragraph_spacing_v1',
    PAPER_TINT: 'noir_mod22_paper_tint_preset_v1'
  };

  /**
   * Bộ sưu tập Preset Kiểu chữ Trang sách chuẩn xuất bản (1-Click Book Typography)
   */
  const BOOK_TYPOGRAPHY_PRESETS = [
    {
      id: 'PRESET_LIGHT_NOVEL_STD',
      name: '📖 Chuẩn Light Novel Hiện Đại',
      badge: 'Khuyên dùng',
      fontFamily: "'Merriweather', serif",
      fontSize: 17,
      lineHeight: '1.85',
      pageWidth: '900px',
      letterSpacing: '0.01em',
      description: 'Cân bằng hoàn hảo giữa độ thoáng của thoại và chiều sâu miêu tả nội tâm.'
    },
    {
      id: 'PRESET_CLASSIC_PAPERBACK',
      name: '📚 Sách In Văn Học Kinh Điển',
      badge: 'Tập trung cao',
      fontFamily: "'Lora', serif",
      fontSize: 18,
      lineHeight: '1.85',
      pageWidth: '740px',
      letterSpacing: '0.015em',
      description: 'Khổ trang 740px giúp mắt không phải đảo ngang quá xa, đọc và sửa bản thảo cực kỳ êm mắt.'
    },
    {
      id: 'PRESET_CRISP_EDITORIAL',
      name: '✒️ Bản Thảo Biên Tập Sắc Nét',
      badge: 'Soát lỗi tốt',
      fontFamily: "'Noto Serif', serif",
      fontSize: 16,
      lineHeight: '1.6',
      pageWidth: '100%',
      letterSpacing: '0em',
      description: 'Nét chữ rõ ràng, gọn gàng trên toàn khung màn hình để dễ dàng rà soát câu chữ và bố cục.'
    },
    {
      id: 'PRESET_LATE_NIGHT_LARGE',
      name: '🌙 Đêm Khuya Chữ Lớn Chống Mỏi Mắt',
      badge: 'Bảo vệ thị lực',
      fontFamily: "'Merriweather', serif",
      fontSize: 20,
      lineHeight: '2.1',
      pageWidth: '900px',
      letterSpacing: '0.02em',
      description: 'Cỡ chữ 20px kèm giãn dòng 2.1 thoáng rộng, dành riêng cho những phiên viết sau 23h đêm.'
    },
    {
      id: 'PRESET_MODERN_SANS',
      name: '💻 Giao Diện Web Novel Tối Giản',
      badge: 'Không chân',
      fontFamily: "'Inter', sans-serif",
      fontSize: 16,
      lineHeight: '1.85',
      pageWidth: '900px',
      letterSpacing: '0.005em',
      description: 'Font chữ không chân hiện đại, sắc nét trên cả màn hình điện thoại và máy tính bảng.'
    }
  ];

  /**
   * Cấu hình chi tiết cho 6 chế độ Hiệu ứng Không gian Nền 60FPS
   */
  const AMBIENT_EFFECT_CONFIGS = {
    FIREFLIES: {
      key: 'FIREFLIES',
      label: '✨ Đom Đóm Đêm',
      description: 'Đàn đom đóm phát sáng nhịp nhàng giữa khu vườn đêm tĩnh mịch.',
      baseCountDesktop: 58,
      baseCountMobile: 30,
      defaultFrostOpacity: 0.28
    },
    LANTERNS: {
      key: 'LANTERNS',
      label: '🏮 Đèn Lồng Ấm',
      description: 'Hàng chục chiếc đèn trời ấm áp từ từ bay lên bầu trời đêm cùng tàn lửa lấp lánh.',
      baseCountDesktop: 34,
      baseCountMobile: 18,
      defaultFrostOpacity: 0.30
    },
    STARDUST: {
      key: 'STARDUST',
      label: '🌌 Bụi Sao Đêm',
      description: 'Bầu trời sao đa tầng lấp lánh kèm những vệt sao băng xé ngang màn đêm.',
      baseCountDesktop: 110,
      baseCountMobile: 55,
      defaultFrostOpacity: 0.24
    },
    RAIN_DROPS: {
      key: 'RAIN_DROPS',
      label: '🌧️ Mưa Trên Kính',
      description: 'Những giọt mưa đêm trượt dài trên mặt kính cửa sổ kèm tia mưa rơi xiên ngoài hiên.',
      baseCountDesktop: 76,
      baseCountMobile: 40,
      defaultFrostOpacity: 0.32
    },
    AUTUMN: {
      key: 'AUTUMN',
      label: '🍂 Lá Thu Rơi',
      description: 'Lá phong đỏ và lá ngân hạnh vàng xoay tròn trong làn gió heo may.',
      baseCountDesktop: 44,
      baseCountMobile: 24,
      defaultFrostOpacity: 0.28
    },
    NONE: {
      key: 'NONE',
      label: '⬛ Nền Tĩnh Tối Giản',
      description: 'Tắt hoàn toàn chuyển động nền để đạt sự tĩnh lặng tuyệt đối và tiết kiệm pin tối đa.',
      baseCountDesktop: 0,
      baseCountMobile: 0,
      defaultFrostOpacity: 0.35
    }
  };

  // ==========================================================================
  // PHẦN 2: CÁC LỚP THỰC THỂ HẠT VẬT LÝ 60FPS (PARTICLE ENTITIES)
  // ==========================================================================

  /**
   * Thực thể 1: Đom Đóm Phát Quang Sinh Học (Bioluminescent Firefly)
   */
  class FireflyParticle {
    constructor(canvasWidth, canvasHeight, depthLayer = 1) {
      this.depth = depthLayer; // 0: Xa (nhỏ, mờ), 1: Trung bình, 2: Gần (Bokeh lớn)
      this.reset(canvasWidth, canvasHeight, true);
    }

    reset(w, h, randomPos = true) {
      this.x = randomPos ? Math.random() * w : Math.random() < 0.5 ? -20 : w + 20;
      this.y = randomPos ? Math.random() * h : h + 20;

      const speedScale = this.depth === 2 ? 0.65 : this.depth === 1 ? 0.42 : 0.22;
      this.vx = (Math.random() - 0.5) * speedScale;
      this.vy = -0.15 - Math.random() * speedScale * 0.65;

      this.radius = this.depth === 2 ? 3.2 + Math.random() * 2.4 : this.depth === 1 ? 1.8 + Math.random() * 1.4 : 1.0 + Math.random() * 0.8;
      this.glowRadius = this.radius * (this.depth === 2 ? 7.5 : 5.5);

      this.pulsePhase = Math.random() * Math.PI * 2;
      this.pulseSpeed = 0.018 + Math.random() * 0.028;
      this.wanderAngle = Math.random() * Math.PI * 2;
      this.wanderRate = 0.015 + Math.random() * 0.025;

      // Màu sắc: Xanh ngọc lục bảo pha vàng nắng ấm
      const palettes = [
        { core: '236, 253, 245', mid: '52, 211, 153', outer: '16, 185, 129' },
        { core: '254, 249, 195', mid: '163, 230, 53', outer: '101, 163, 13' },
        { core: '254, 243, 199', mid: '251, 191, 36', outer: '217, 119, 6' }
      ];
      this.palette = palettes[Math.floor(Math.random() * palettes.length)];
    }

    update(w, h, windStrength = 1.0) {
      this.pulsePhase += this.pulseSpeed;
      this.wanderAngle += (Math.random() - 0.5) * this.wanderRate;

      const steerX = Math.cos(this.wanderAngle) * 0.015 * windStrength;
      const steerY = Math.sin(this.wanderAngle) * 0.012;

      this.vx = (this.vx + steerX) * 0.985;
      this.vy = (this.vy + steerY) * 0.985;

      this.x += this.vx + 0.08 * windStrength * (this.depth + 1) * 0.35;
      this.y += this.vy;

      // Bọc biên màn hình mượt mà
      const margin = 40;
      if (this.x < -margin) this.x = w + margin * 0.5;
      if (this.x > w + margin) this.x = -margin * 0.5;
      if (this.y < -margin) this.y = h + margin * 0.5;
      if (this.y > h + margin) this.y = -margin * 0.5;
    }

    draw(ctx, parallaxOffsetX = 0, parallaxOffsetY = 0) {
      const alphaWave = Math.pow((Math.sin(this.pulsePhase) + 1) * 0.5, 1.6);
      const alpha = 0.12 + alphaWave * (this.depth === 2 ? 0.72 : this.depth === 1 ? 0.62 : 0.38);

      const px = this.x + parallaxOffsetX * (this.depth + 1) * 0.35;
      const py = this.y + parallaxOffsetY * (this.depth + 1) * 0.35;

      const grad = ctx.createRadialGradient(px, py, 0.2, px, py, this.glowRadius);
      grad.addColorStop(0, `rgba(${this.palette.core}, ${Math.min(1, alpha * 1.25).toFixed(3)})`);
      grad.addColorStop(0.35, `rgba(${this.palette.mid}, ${(alpha * 0.65).toFixed(3)})`);
      grad.addColorStop(1, `rgba(${this.palette.outer}, 0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, this.glowRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Thực thể 2: Đèn Lồng Khổng Minh Bay Đêm (Floating Warm Sky Lantern)
   */
  class WarmLanternParticle {
    constructor(w, h) {
      this.reset(w, h, true);
    }

    reset(w, h, initialRandomY = false) {
      this.depthScale = 0.35 + Math.random() * 0.75; // 0.35 (xa) -> 1.1 (gần)
      this.width = 18 * this.depthScale;
      this.height = 25 * this.depthScale;

      this.x = Math.random() * w;
      this.y = initialRandomY ? Math.random() * h : h + this.height + Math.random() * 60;

      this.riseSpeed = (0.28 + Math.random() * 0.35) * this.depthScale;
      this.swayPhase = Math.random() * Math.PI * 2;
      this.swaySpeed = 0.012 + Math.random() * 0.016;
      this.swayAmp = (0.25 + Math.random() * 0.35) * this.depthScale;
      this.flickerPhase = Math.random() * Math.PI * 2;
      this.tiltAngle = 0;
    }

    update(w, h, windStrength = 1.0) {
      this.swayPhase += this.swaySpeed;
      this.flickerPhase += 0.08 + Math.random() * 0.05;

      const dx = Math.sin(this.swayPhase) * this.swayAmp + 0.14 * windStrength * this.depthScale;
      this.x += dx;
      this.y -= this.riseSpeed;
      this.tiltAngle = Math.sin(this.swayPhase) * 0.08;

      if (this.y < -this.height * 2.5) {
        this.reset(w, h, false);
      }
      if (this.x > w + 60) this.x = -50;
      if (this.x < -60) this.x = w + 50;
    }

    draw(ctx, parallaxOffsetX = 0, parallaxOffsetY = 0) {
      const px = this.x + parallaxOffsetX * this.depthScale * 0.5;
      const py = this.y + parallaxOffsetY * this.depthScale * 0.5;
      const flicker = 0.86 + Math.sin(this.flickerPhase) * 0.14;
      const baseAlpha = Math.min(0.88, (0.35 + this.depthScale * 0.45) * flicker);

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(this.tiltAngle);

      // 1. Quầng sáng tỏa ra xung quanh đèn lồng
      const haloRadius = this.height * 2.1;
      const haloGrad = ctx.createRadialGradient(0, this.height * 0.15, 1, 0, 0, haloRadius);
      haloGrad.addColorStop(0, `rgba(254, 240, 138, ${(baseAlpha * 0.65).toFixed(3)})`);
      haloGrad.addColorStop(0.4, `rgba(245, 158, 11, ${(baseAlpha * 0.26).toFixed(3)})`);
      haloGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(0, 0, haloRadius, 0, Math.PI * 2);
      ctx.fill();

      // 2. Thân lồng đèn giấy lụa (Hình thang bo tròn mềm mại)
      const hw = this.width * 0.5;
      const hh = this.height * 0.5;
      const bodyGrad = ctx.createLinearGradient(0, -hh, 0, hh);
      bodyGrad.addColorStop(0, `rgba(180, 83, 9, ${(baseAlpha * 0.85).toFixed(3)})`);
      bodyGrad.addColorStop(0.55, `rgba(245, 158, 11, ${(baseAlpha * 0.92).toFixed(3)})`);
      bodyGrad.addColorStop(1, `rgba(254, 240, 138, ${Math.min(1, baseAlpha * 1.05).toFixed(3)})`);

      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(-hw * 0.72, -hh);
      ctx.quadraticCurveTo(0, -hh * 1.18, hw * 0.72, -hh);
      ctx.quadraticCurveTo(hw * 1.12, 0, hw * 0.62, hh);
      ctx.lineTo(-hw * 0.62, hh);
      ctx.quadraticCurveTo(-hw * 1.12, 0, -hw * 0.72, -hh);
      ctx.closePath();
      ctx.fill();

      // 3. Ngọn lửa tim đèn ở đáy lồng
      ctx.fillStyle = `rgba(255, 255, 255, ${(baseAlpha * 0.95).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(0, hh * 0.78, Math.max(1.5, this.width * 0.14 * flicker), 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  /**
   * Thực thể 3: Bụi Sao Đêm & Sao Băng (Cosmic Stardust & Shooting Meteor)
   */
  class CosmicStarParticle {
    constructor(w, h) {
      this.reset(w, h);
    }

    reset(w, h) {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.layer = Math.floor(Math.random() * 3); // 0, 1, 2
      this.radius = this.layer === 2 ? 1.6 + Math.random() * 1.1 : this.layer === 1 ? 1.0 + Math.random() * 0.7 : 0.6 + Math.random() * 0.5;
      this.twinklePhase = Math.random() * Math.PI * 2;
      this.twinkleSpeed = 0.015 + Math.random() * 0.035;
      this.hasCrossSpike = this.layer === 2 && Math.random() < 0.35;

      const starColors = [
        '224, 231, 255', // Trắng xanh Indigo
        '167, 243, 208', // Xanh ngọc nhạt
        '254, 243, 199', // Vàng kim ấm
        '244, 244, 245'  // Trắng bạc
      ];
      this.rgb = starColors[Math.floor(Math.random() * starColors.length)];
    }

    update(w, h) {
      this.twinklePhase += this.twinkleSpeed;
      this.x -= (this.layer + 1) * 0.04;
      if (this.x < -10) this.x = w + 10;
    }

    draw(ctx, parallaxOffsetX = 0, parallaxOffsetY = 0) {
      const px = this.x + parallaxOffsetX * (this.layer + 1) * 0.25;
      const py = this.y + parallaxOffsetY * (this.layer + 1) * 0.25;
      const twinkle = (Math.sin(this.twinklePhase) + 1) * 0.5;
      const alpha = 0.22 + twinkle * 0.72;

      ctx.fillStyle = `rgba(${this.rgb}, ${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(px, py, this.radius, 0, Math.PI * 2);
      ctx.fill();

      // Tia sáng chữ thập cho các ngôi sao sáng nhất
      if (this.hasCrossSpike && twinkle > 0.6) {
        const spikeLen = this.radius * 4.2 * twinkle;
        ctx.strokeStyle = `rgba(${this.rgb}, ${(alpha * 0.45).toFixed(3)})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(px - spikeLen, py);
        ctx.lineTo(px + spikeLen, py);
        ctx.moveTo(px, py - spikeLen);
        ctx.lineTo(px, py + spikeLen);
        ctx.stroke();
      }
    }
  }

  /**
   * Thực thể Sao Băng Xẹt Ngang Trời (Shooting Meteor)
   */
  class ShootingMeteorParticle {
    constructor(w, h) {
      this.active = false;
      this.reset(w, h);
    }

    reset(w, h) {
      this.active = false;
      this.x = Math.random() * w * 0.85 + w * 0.1;
      this.y = Math.random() * h * 0.45;
      const angle = (Math.PI * 0.72) + (Math.random() - 0.5) * 0.2;
      const speed = 9 + Math.random() * 6;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.tailLength = 65 + Math.random() * 55;
      this.life = 0;
      this.maxLife = 42 + Math.floor(Math.random() * 25);
    }

    trigger(w, h) {
      this.reset(w, h);
      this.active = true;
    }

    update(w, h) {
      if (!this.active) {
        if (Math.random() < 0.0045) {
          this.trigger(w, h);
        }
        return;
      }
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
      if (this.life >= this.maxLife || this.x < -100 || this.y > h + 100) {
        this.active = false;
      }
    }

    draw(ctx) {
      if (!this.active) return;
      const progress = this.life / this.maxLife;
      const alpha = Math.sin(progress * Math.PI) * 0.85;

      const normLen = Math.hypot(this.vx, this.vy) || 1;
      const tailX = this.x - (this.vx / normLen) * this.tailLength;
      const tailY = this.y - (this.vy / normLen) * this.tailLength;

      const grad = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
      grad.addColorStop(0, `rgba(255, 255, 255, ${alpha.toFixed(3)})`);
      grad.addColorStop(0.3, `rgba(167, 243, 208, ${(alpha * 0.6).toFixed(3)})`);
      grad.addColorStop(1, 'rgba(99, 102, 241, 0)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
    }
  }

  /**
   * Thực thể 4: Giọt Mưa Trên Kính Cửa Sổ (Window Glass Raindrop & Streak)
   */
  class WindowRaindropParticle {
    constructor(w, h, isGlassBead = false) {
      this.isGlassBead = isGlassBead;
      this.reset(w, h, true);
    }

    reset(w, h, randomY = false) {
      this.x = Math.random() * (w + 120) - 60;
      this.y = randomY ? Math.random() * h : -30 - Math.random() * 80;

      if (this.isGlassBead) {
        // Giọt nước bám trên mặt kính rồi trượt xuống ngoằn ngoèo
        this.radius = 2.0 + Math.random() * 2.6;
        this.vy = 0.25 + Math.random() * 0.85;
        this.vx = 0;
        this.stutterPhase = Math.random() * Math.PI * 2;
        this.trailBeads = [];
        this.alpha = 0.35 + Math.random() * 0.38;
      } else {
        // Tia mưa rơi xiên ngoài khung cửa sổ
        this.length = 16 + Math.random() * 24;
        this.vy = 9.5 + Math.random() * 6.5;
        this.vx = 1.4 + Math.random() * 1.2;
        this.alpha = 0.14 + Math.random() * 0.24;
      }
    }

    update(w, h, windStrength = 1.0) {
      if (this.isGlassBead) {
        this.stutterPhase += 0.09;
        // Chuyển động trượt dừng ngắt quãng do sức căng bề mặt nước trên kính
        const slipFactor = Math.max(0.08, Math.sin(this.stutterPhase) + 0.65);
        const stepY = this.vy * slipFactor;
        const stepX = Math.sin(this.y * 0.045 + this.stutterPhase) * 0.28;

        this.x += stepX;
        this.y += stepY;

        if (Math.random() < 0.18 && this.trailBeads.length < 6) {
          this.trailBeads.push({
            x: this.x,
            y: this.y - this.radius,
            r: Math.max(0.8, this.radius * (0.32 + Math.random() * 0.25)),
            a: this.alpha * 0.7
          });
        }

        for (let i = this.trailBeads.length - 1; i >= 0; i--) {
          this.trailBeads[i].a -= 0.003;
          if (this.trailBeads[i].a <= 0.02) {
            this.trailBeads.splice(i, 1);
          }
        }

        if (this.y > h + 30) {
          this.reset(w, h, false);
        }
      } else {
        this.x += this.vx * windStrength;
        this.y += this.vy;
        if (this.y > h + 40 || this.x > w + 80) {
          this.reset(w, h, false);
        }
      }
    }

    draw(ctx, parallaxOffsetX = 0, parallaxOffsetY = 0) {
      if (this.isGlassBead) {
        const px = this.x + parallaxOffsetX * 0.6;
        const py = this.y + parallaxOffsetY * 0.6;

        // Vẽ các hạt nước nhỏ li ti đọng lại phía sau đường trượt
        for (let i = 0; i < this.trailBeads.length; i++) {
          const b = this.trailBeads[i];
          ctx.fillStyle = `rgba(224, 242, 254, ${Math.min(1, b.a * 1.65).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(b.x + parallaxOffsetX * 0.6, b.y + parallaxOffsetY * 0.6, b.r * 1.15, 0, Math.PI * 2);
          ctx.fill();
        }

        // Vẽ giọt nước chính với điểm phản quang trắng rõ nét
        ctx.fillStyle = `rgba(125, 211, 252, ${Math.min(0.95, this.alpha * 1.45).toFixed(3)})`;
        ctx.beginPath();
        ctx.ellipse(px, py, this.radius * 0.92, this.radius * 1.35, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.98, this.alpha * 1.6).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(px - this.radius * 0.25, py - this.radius * 0.35, Math.max(0.8, this.radius * 0.34), 0, Math.PI * 2);
        ctx.fill();
      } else {
        const px = this.x + parallaxOffsetX * 0.2;
        const py = this.y + parallaxOffsetY * 0.2;

        ctx.strokeStyle = `rgba(186, 230, 253, ${Math.min(0.9, this.alpha * 1.5).toFixed(3)})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px - this.vx * 2.1, py - this.length * 1.25);
        ctx.stroke();
      }
    }
  }

  /**
   * Thực thể 5: Lá Thu Rơi Xoay 3D (Falling Maple & Ginkgo Autumn Leaf)
   */
  class AutumnLeafParticle {
    constructor(w, h) {
      this.reset(w, h, true);
    }

    reset(w, h, initialRandomY = false) {
      this.x = Math.random() * w;
      this.y = initialRandomY ? Math.random() * h : -30 - Math.random() * 60;

      this.size = 7 + Math.random() * 7.5;
      this.leafShape = Math.random() < 0.55 ? 'MAPLE' : 'GINKGO';

      this.vy = 0.55 + Math.random() * 0.65;
      this.vx = (Math.random() - 0.35) * 0.55;

      this.flutterPhase = Math.random() * Math.PI * 2;
      this.flutterSpeed = 0.022 + Math.random() * 0.024;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.025;
      this.flip3DPhase = Math.random() * Math.PI * 2;
      this.flip3DSpeed = 0.03 + Math.random() * 0.03;

      const leafColors = [
        { fill: '217, 119, 6', vein: '254, 243, 199' },  // Vàng hổ phách
        { fill: '225, 29, 72', vein: '254, 205, 211' },  // Đỏ phong thẫm
        { fill: '234, 88, 12', vein: '255, 237, 213' },  // Cam chiều thu
        { fill: '245, 158, 11', vein: '254, 249, 195' }  // Vàng ngân hạnh
      ];
      this.color = leafColors[Math.floor(Math.random() * leafColors.length)];
      this.alpha = 0.52 + Math.random() * 0.32;
    }

    update(w, h, windStrength = 1.0) {
      this.flutterPhase += this.flutterSpeed;
      this.rotation += this.rotationSpeed;
      this.flip3DPhase += this.flip3DSpeed;

      // Chuyển động con lắc khí động học khi chiếc lá chao nghiêng trong gió
      const pendulumX = Math.sin(this.flutterPhase) * 0.85;
      const liftY = Math.abs(Math.cos(this.flutterPhase)) * 0.22;

      this.x += this.vx + pendulumX + 0.32 * windStrength;
      this.y += Math.max(0.2, this.vy - liftY);

      if (this.y > h + 40) {
        this.reset(w, h, false);
      }
      if (this.x > w + 50) this.x = -40;
      if (this.x < -50) this.x = w + 40;
    }

    draw(ctx, parallaxOffsetX = 0, parallaxOffsetY = 0) {
      const px = this.x + parallaxOffsetX * 0.45;
      const py = this.y + parallaxOffsetY * 0.45;
      const scaleY3D = Math.max(0.22, Math.abs(Math.cos(this.flip3DPhase)));

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(this.rotation);
      ctx.scale(1, scaleY3D);

      const s = this.size;
      ctx.fillStyle = `rgba(${this.color.fill}, ${this.alpha.toFixed(3)})`;
      ctx.strokeStyle = `rgba(${this.color.vein}, ${(this.alpha * 0.65).toFixed(3)})`;
      ctx.lineWidth = 0.8;

      ctx.beginPath();
      if (this.leafShape === 'GINKGO') {
        // Lá Ngân hạnh hình quạt (Ginkgo Biloba Fan Leaf)
        ctx.moveTo(0, s * 0.8);
        ctx.quadraticCurveTo(-s * 1.1, -s * 0.2, -s * 0.85, -s * 0.85);
        ctx.quadraticCurveTo(-s * 0.2, -s * 1.05, 0, -s * 0.55);
        ctx.quadraticCurveTo(s * 0.2, -s * 1.05, s * 0.85, -s * 0.85);
        ctx.quadraticCurveTo(s * 1.1, -s * 0.2, 0, s * 0.8);
      } else {
        // Lá Phong thu thanh thoát
        ctx.moveTo(0, -s * 1.15);
        ctx.quadraticCurveTo(s * 0.85, -s * 0.35, s * 0.55, s * 0.55);
        ctx.quadraticCurveTo(0, s * 0.95, 0, s * 1.15);
        ctx.quadraticCurveTo(0, s * 0.95, -s * 0.55, s * 0.55);
        ctx.quadraticCurveTo(-s * 0.85, -s * 0.35, 0, -s * 1.15);
      }
      ctx.closePath();
      ctx.fill();

      // Gân lá chính giữa
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.75);
      ctx.lineTo(0, s * 1.05);
      ctx.stroke();

      ctx.restore();
    }
  }

  // ==========================================================================
  // PHẦN 3: BỘ KẾT XUẤT ĐỒ HỌA CANVAS 60FPS TIẾT KIỆM PIN (CANVAS RENDERER)
  // ==========================================================================

  class AmbientCanvasPhysicsRenderer {
    constructor() {
      this.canvas = null;
      this.ctx = null;
      this.activeEffectKey = 'FIREFLIES';
      this.particles = [];
      this.meteors = [];
      this.rafId = null;
      this.isRunning = false;

      this.logicalWidth = window.innerWidth || 1280;
      this.logicalHeight = window.innerHeight || 720;
      this.dpr = Math.min(2, window.devicePixelRatio || 1);

      // Hệ số tùy chỉnh từ người dùng
      this.densityMultiplier = 1.0;
      this.windStrength = 1.0;
      this.parallaxEnabled = true;
      this.targetParallaxX = 0;
      this.targetParallaxY = 0;
      this.currentParallaxX = 0;
      this.currentParallaxY = 0;

      // Đo FPS thực tế
      this.frameCount = 0;
      this.lastFpsCheckTime = performance.now();
      this.measuredFps = 60;
    }

    attachCanvas(canvasEl) {
      this.canvas = canvasEl;
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.handleResize();

      window.addEventListener('resize', () => {
        this.handleResize();
      });

      // Tự động tạm dừng khi người dùng chuyển sang tab khác để tiết kiệm pin 100%
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.pauseLoop();
        } else if (this.activeEffectKey !== 'NONE') {
          this.startLoop();
        }
      });

      // Hiệu ứng thị sai nhẹ theo chuột (Mouse Parallax)
      window.addEventListener(
        'mousemove',
        (ev) => {
          if (!this.parallaxEnabled || this.activeEffectKey === 'NONE') return;
          const nx = (ev.clientX / Math.max(1, this.logicalWidth)) - 0.5;
          const ny = (ev.clientY / Math.max(1, this.logicalHeight)) - 0.5;
          this.targetParallaxX = -nx * 24;
          this.targetParallaxY = -ny * 16;
        },
        { passive: true }
      );
    }

    handleResize() {
      if (!this.canvas || !this.ctx) return;
      this.logicalWidth = window.innerWidth || 1280;
      this.logicalHeight = window.innerHeight || 720;
      this.dpr = Math.min(2, window.devicePixelRatio || 1);

      this.canvas.width = Math.floor(this.logicalWidth * this.dpr);
      this.canvas.height = Math.floor(this.logicalHeight * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

      if (this.activeEffectKey !== 'NONE' && this.particles.length === 0) {
        this.rebuildParticlesForEffect(this.activeEffectKey);
      }
    }

    setEffect(effectKey) {
      const validKey = AMBIENT_EFFECT_CONFIGS[effectKey] ? effectKey : 'NONE';
      this.activeEffectKey = validKey;

      if (validKey === 'NONE') {
        this.pauseLoop();
        this.particles = [];
        this.meteors = [];
        if (this.ctx) {
          this.ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight);
        }
        return;
      }

      this.rebuildParticlesForEffect(validKey);
      if (!document.hidden) {
        this.startLoop();
      }
    }

    rebuildParticlesForEffect(effectKey) {
      const cfg = AMBIENT_EFFECT_CONFIGS[effectKey] || AMBIENT_EFFECT_CONFIGS.NONE;
      const isMobile = this.logicalWidth < 768;
      const baseCount = isMobile ? cfg.baseCountMobile : cfg.baseCountDesktop;
      const count = Math.max(0, Math.round(baseCount * this.densityMultiplier));

      this.particles = [];
      this.meteors = [];
      const w = this.logicalWidth;
      const h = this.logicalHeight;

      if (effectKey === 'FIREFLIES') {
        for (let i = 0; i < count; i++) {
          const depth = i % 6 === 0 ? 2 : i % 2 === 0 ? 1 : 0;
          this.particles.push(new FireflyParticle(w, h, depth));
        }
      } else if (effectKey === 'LANTERNS') {
        for (let i = 0; i < count; i++) {
          this.particles.push(new WarmLanternParticle(w, h));
        }
      } else if (effectKey === 'STARDUST') {
        for (let i = 0; i < count; i++) {
          this.particles.push(new CosmicStarParticle(w, h));
        }
        this.meteors.push(new ShootingMeteorParticle(w, h));
        this.meteors.push(new ShootingMeteorParticle(w, h));
      } else if (effectKey === 'RAIN_DROPS') {
        for (let i = 0; i < count; i++) {
          const isBead = i < Math.floor(count * 0.36);
          this.particles.push(new WindowRaindropParticle(w, h, isBead));
        }
      } else if (effectKey === 'AUTUMN') {
        for (let i = 0; i < count; i++) {
          this.particles.push(new AutumnLeafParticle(w, h));
        }
      }
    }

    startLoop() {
      if (this.isRunning) return;
      this.isRunning = true;
      this.lastFpsCheckTime = performance.now();
      this.frameCount = 0;

      const loop = (now) => {
        if (!this.isRunning) return;

        this.frameCount++;
        if (now - this.lastFpsCheckTime >= 1000) {
          this.measuredFps = Math.min(60, Math.round((this.frameCount * 1000) / (now - this.lastFpsCheckTime)));
          this.frameCount = 0;
          this.lastFpsCheckTime = now;
          const fpsBadge = document.getElementById('mod22-live-fps-badge');
          if (fpsBadge) {
            fpsBadge.textContent = `${this.measuredFps} FPS`;
          }
        }

        this.renderStep();
        this.rafId = requestAnimationFrame(loop);
      };

      this.rafId = requestAnimationFrame(loop);
    }

    pauseLoop() {
      this.isRunning = false;
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    }

    renderStep() {
      if (!this.ctx) return;
      const ctx = this.ctx;
      const w = this.logicalWidth;
      const h = this.logicalHeight;

      ctx.clearRect(0, 0, w, h);

      // Nội suy mượt cho dịch chuyển thị sai (Smooth Lerp Parallax)
      this.currentParallaxX += (this.targetParallaxX - this.currentParallaxX) * 0.05;
      this.currentParallaxY += (this.targetParallaxY - this.currentParallaxY) * 0.05;

      const px = this.parallaxEnabled ? this.currentParallaxX : 0;
      const py = this.parallaxEnabled ? this.currentParallaxY : 0;

      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        p.update(w, h, this.windStrength);
        p.draw(ctx, px, py);
      }

      for (let m = 0; m < this.meteors.length; m++) {
        const meteor = this.meteors[m];
        meteor.update(w, h);
        meteor.draw(ctx);
      }
    }
  }

  // ==========================================================================
  // PHẦN 4: LỚP ĐIỀU KHIỂN CHÍNH (TypographyAndAmbientCanvasEngine)
  // ==========================================================================

  class TypographyAndAmbientCanvasEngine {
    constructor() {
      this._initialized = false;

      // Trạng thái Giao diện Sáng/Tối & Kiểu chữ
      this.themeMode = 'DARK'; // 'DARK' | 'LIGHT'
      this.fontFamily = "'Merriweather', serif";
      this.fontSizePx = 17;
      this.lineHeight = '1.85';
      this.pageWidth = '100%';
      this.letterSpacing = '0.01em';
      this.frostShieldOpacity = 0.30;

      // Trạng thái Hình nền / Video cá nhân
      this.customMediaObjectUrl = null;
      this.customMediaType = null; // 'IMAGE' | 'VIDEO' | null

      // Bộ kết xuất hạt 60FPS
      this.canvasRenderer = new AmbientCanvasPhysicsRenderer();
    }

    notify(message, type = 'info') {
      if (window.NoirStudio && window.NoirStudio.utils && typeof window.NoirStudio.utils.showToast === 'function') {
        window.NoirStudio.utils.showToast(message, type);
      } else {
        console.log(`[NoirStudio Ambience - ${type}] ${message}`);
      }
    }

    init() {
      if (this._initialized) return;
      this._initialized = true;

      this.restoreSavedSettings();

      const canvasEl = document.getElementById('ambient-bg-canvas');
      if (canvasEl) {
        this.canvasRenderer.attachCanvas(canvasEl);
      }

      this.bindCoreDomControls();
      this.injectTypographyStudioDeck();
      this.applyThemeToDOM(false);
      this.applyTypographySettings(false);
      this.setBackgroundEffect(this.canvasRenderer.activeEffectKey, false);
      this.applyFrostedShieldOpacity(this.frostShieldOpacity);
    }

    restoreSavedSettings() {
      try {
        const savedTheme = localStorage.getItem(AMBIENCE_STORAGE_KEYS.THEME);
        if (savedTheme === 'LIGHT' || savedTheme === 'DARK') {
          this.themeMode = savedTheme;
        } else {
          this.themeMode = document.documentElement.classList.contains('dark') ? 'DARK' : 'LIGHT';
        }

        const savedFont = localStorage.getItem(AMBIENCE_STORAGE_KEYS.FONT_FAMILY);
        if (savedFont) this.fontFamily = savedFont;

        const savedSize = localStorage.getItem(AMBIENCE_STORAGE_KEYS.FONT_SIZE);
        if (savedSize) {
          this.fontSizePx = Math.max(13, Math.min(30, parseInt(savedSize, 10) || 17));
        }

        const savedLh = localStorage.getItem(AMBIENCE_STORAGE_KEYS.LINE_HEIGHT);
        if (savedLh) this.lineHeight = savedLh;

        const savedPw = localStorage.getItem(AMBIENCE_STORAGE_KEYS.PAGE_WIDTH);
        if (savedPw) this.pageWidth = savedPw;

        const savedLs = localStorage.getItem(AMBIENCE_STORAGE_KEYS.LETTER_SPACING);
        if (savedLs) this.letterSpacing = savedLs;

        const savedEffect = localStorage.getItem(AMBIENCE_STORAGE_KEYS.BG_EFFECT);
        if (savedEffect && AMBIENT_EFFECT_CONFIGS[savedEffect]) {
          this.canvasRenderer.activeEffectKey = savedEffect;
        }

        const savedFrost = localStorage.getItem(AMBIENCE_STORAGE_KEYS.FROST_OPACITY);
        if (savedFrost !== null) {
          this.frostShieldOpacity = Math.max(0.05, Math.min(0.85, parseFloat(savedFrost) || 0.30));
        }

        const savedDensity = localStorage.getItem(AMBIENCE_STORAGE_KEYS.PARTICLE_DENSITY);
        if (savedDensity !== null) {
          this.canvasRenderer.densityMultiplier = Math.max(0.3, Math.min(2.2, parseFloat(savedDensity) || 1.0));
        }

        const savedWind = localStorage.getItem(AMBIENCE_STORAGE_KEYS.WIND_STRENGTH);
        if (savedWind !== null) {
          this.canvasRenderer.windStrength = Math.max(0.0, Math.min(2.5, parseFloat(savedWind) || 1.0));
        }
      } catch (_err) {
        // Bỏ qua lỗi quyền truy cập LocalStorage
      }
    }

    bindCoreDomControls() {
      const themeBtn = document.getElementById('btn-toggle-theme');
      const zenBtn = document.getElementById('btn-toggle-zen-mode');
      const fontSelect = document.getElementById('select-novel-font-family');
      const sizeInput = document.getElementById('bug13-font-size-input');
      const lhSelect = document.getElementById('bug13-line-height-select');
      const pwSelect = document.getElementById('bug13-page-width-select');
      const customBgInput = document.getElementById('input-custom-bg-media');
      const uploadBgBtn = document.getElementById('btn-upload-custom-bg');

      // 1. Nút đổi Giao diện Sáng / Tối (#btn-toggle-theme)
      if (themeBtn) {
        themeBtn.addEventListener('click', () => {
          this.toggleTheme();
        });
      }

      // 2. Nút Chế độ Tập trung Toàn màn hình Zen Mode (#btn-toggle-zen-mode)
      if (zenBtn && zenBtn.dataset.mod22Bound !== 'true') {
        zenBtn.dataset.mod22Bound = 'true';
        zenBtn.addEventListener('click', () => {
          this.toggleZenFullscreenMode();
        });
      }

      // 3. Các trình chọn Font chữ, Cỡ chữ, Giãn dòng, Khổ rộng trang sách
      if (fontSelect) {
        fontSelect.value = this.fontFamily;
        fontSelect.addEventListener('change', () => {
          this.applyTypographySettings(true);
        });
      }

      if (sizeInput) {
        sizeInput.value = String(this.fontSizePx);
        sizeInput.addEventListener('input', () => {
          this.applyTypographySettings(false);
        });
        sizeInput.addEventListener('change', () => {
          this.applyTypographySettings(true);
        });
      }

      if (lhSelect) {
        lhSelect.value = this.lineHeight;
        lhSelect.addEventListener('change', () => {
          this.applyTypographySettings(true);
        });
      }

      if (pwSelect) {
        pwSelect.value = this.pageWidth;
        pwSelect.addEventListener('change', () => {
          this.applyTypographySettings(true);
        });
      }

      // 4. Tải Ảnh / Video cá nhân từ máy làm hình nền (#btn-upload-custom-bg & #input-custom-bg-media)
      if (uploadBgBtn && customBgInput) {
        uploadBgBtn.addEventListener('click', () => {
          customBgInput.click();
        });
        customBgInput.addEventListener('change', (ev) => {
          const file = ev.target.files && ev.target.files[0];
          if (file) {
            this.loadCustomMediaBackground(file);
          }
          customBgInput.value = '';
        });
      }

      // 5. Các nút chọn Hiệu ứng Nền động 60FPS (.bg-effect-btn)
      const effectBtns = document.querySelectorAll('.bg-effect-btn');
      effectBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const effectKey = btn.getAttribute('data-bg-effect') || 'NONE';
          this.setBackgroundEffect(effectKey, true);
        });
      });
    }

    /**
     * Áp dụng toàn bộ cài đặt Font chữ, Cỡ chữ, Giãn dòng và Khổ rộng trang sách
     * lên bàn viết chính (#textarea-chapter-content) và các vùng đọc bản thảo
     */
    applyTypographySettings(showToastFeedback = false) {
      const fontSelect = document.getElementById('select-novel-font-family');
      const sizeInput = document.getElementById('bug13-font-size-input');
      const lhSelect = document.getElementById('bug13-line-height-select');
      const pwSelect = document.getElementById('bug13-page-width-select');

      if (fontSelect && fontSelect.value) {
        this.fontFamily = fontSelect.value;
      }
      if (sizeInput && sizeInput.value) {
        this.fontSizePx = Math.max(13, Math.min(30, parseInt(sizeInput.value, 10) || 17));
        sizeInput.value = String(this.fontSizePx);
      }
      if (lhSelect && lhSelect.value) {
        this.lineHeight = lhSelect.value;
      }
      if (pwSelect && pwSelect.value) {
        this.pageWidth = pwSelect.value;
      }

      // Cập nhật biến CSS toàn cục (:root)
      const rootStyle = document.documentElement.style;
      rootStyle.setProperty('--novel-font-family', this.fontFamily);
      rootStyle.setProperty('--novel-font-size', `${this.fontSizePx}px`);
      rootStyle.setProperty('--novel-line-height', String(this.lineHeight));
      rootStyle.setProperty('--novel-max-width', this.pageWidth);

      // Áp dụng trực tiếp lên các vùng soạn thảo và xem trước bản thảo
      const editorTargets = [
        document.getElementById('textarea-chapter-content'),
        document.getElementById('ai-diff-review-surface'),
        document.getElementById('s20-quad-output-textarea'),
        document.getElementById('mod22-typography-specimen-preview')
      ];

      editorTargets.forEach((el) => {
        if (!el) return;
        el.style.fontFamily = this.fontFamily;
        el.style.fontSize = `${this.fontSizePx}px`;
        el.style.lineHeight = String(this.lineHeight);
        el.style.letterSpacing = this.letterSpacing;
      });

      const mainEditor = document.getElementById('textarea-chapter-content');
      const diffSurface = document.getElementById('ai-diff-review-surface');
      if (mainEditor) {
        mainEditor.style.maxWidth = this.pageWidth;
      }
      if (diffSurface) {
        diffSurface.style.maxWidth = this.pageWidth;
      }

      // Lưu vào LocalStorage
      try {
        localStorage.setItem(AMBIENCE_STORAGE_KEYS.FONT_FAMILY, this.fontFamily);
        localStorage.setItem(AMBIENCE_STORAGE_KEYS.FONT_SIZE, String(this.fontSizePx));
        localStorage.setItem(AMBIENCE_STORAGE_KEYS.LINE_HEIGHT, String(this.lineHeight));
        localStorage.setItem(AMBIENCE_STORAGE_KEYS.PAGE_WIDTH, this.pageWidth);
        localStorage.setItem(AMBIENCE_STORAGE_KEYS.LETTER_SPACING, this.letterSpacing);
      } catch (_err) {
        // Bỏ qua
      }

      if (showToastFeedback) {
        this.notify(
          `🔤 Đã áp dụng kiểu chữ: ${this.fontSizePx}px • Giãn dòng ${this.lineHeight} • Khổ trang ${this.pageWidth}`,
          'success'
        );
      }
    }

    /**
     * Đổi giao diện Sáng (Giấy kem cổ điển) <-> Tối (Đêm Noir)
     */
    toggleTheme() {
      this.themeMode = this.themeMode === 'DARK' ? 'LIGHT' : 'DARK';
      this.applyThemeToDOM(true);
    }

    applyThemeToDOM(showToastFeedback = false) {
      const htmlEl = document.documentElement;
      const iconLabel = document.getElementById('theme-icon-label');
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');

      if (this.themeMode === 'DARK') {
        htmlEl.classList.add('dark');
        if (iconLabel) iconLabel.textContent = '🌙';
        if (metaThemeColor) metaThemeColor.setAttribute('content', '#09090b');
      } else {
        htmlEl.classList.remove('dark');
        if (iconLabel) iconLabel.textContent = '☀️';
        if (metaThemeColor) metaThemeColor.setAttribute('content', '#F7F4EB');
      }

      try {
        localStorage.setItem(AMBIENCE_STORAGE_KEYS.THEME, this.themeMode);
      } catch (_err) {
        // Bỏ qua
      }

      this.applyFrostedShieldOpacity(this.frostShieldOpacity);

      if (showToastFeedback) {
        this.notify(
          this.themeMode === 'DARK'
            ? '🌙 Đã chuyển sang giao diện Đêm Noir (Dịu mắt khi sáng tác ban đêm)'
            : '☀️ Đã chuyển sang giao diện Giấy Kem Sáng (Cảm giác trang sách in cổ điển)',
          'info'
        );
      }
    }

    /**
     * Bật/Tắt chế độ Tập trung Toàn màn hình (Zen Mode)
     */
    toggleZenFullscreenMode() {
      if (!document.fullscreenElement) {
        document.documentElement
          .requestFullscreen()
          .then(() => {
            this.notify('🧘 Đã bật Chế độ Tập trung Toàn màn hình (Zen Mode). Bấm ESC để thoát.', 'success');
          })
          .catch(() => {
            this.notify('🧘 Chế độ tập trung đã sẵn sàng.', 'info');
          });
      } else {
        document
          .exitFullscreen()
          .then(() => {
            this.notify('🧘 Đã thoát Chế độ Toàn màn hình.', 'info');
          })
          .catch(() => {});
      }
    }

    /**
     * Đồng bộ trạng thái lớp phủ trong suốt của toàn Studio khi có Nền / Hiệu ứng / Ảnh / Video hoạt động
     */
    syncAmbientBodyState() {
      const videoEl = document.getElementById('ambient-bg-video');
      const imageEl = document.getElementById('ambient-bg-image');
      const hasEffect =
        Boolean(this.canvasRenderer?.activeEffectKey) &&
        this.canvasRenderer.activeEffectKey !== 'NONE';
      const hasVideo = Boolean(videoEl && !videoEl.classList.contains('hidden') && videoEl.getAttribute('src'));
      const hasImage = Boolean(imageEl && !imageEl.classList.contains('hidden') && imageEl.getAttribute('src'));
      const isActive = hasEffect || hasVideo || hasImage;

      document.body?.classList?.toggle('noir-ambient-active', isActive);

      const clearHeaderBtn = document.getElementById('btn-clear-custom-bg');
      if (clearHeaderBtn) {
        clearHeaderBtn.classList.toggle('hidden', !(hasVideo || hasImage));
      }
    }

    /**
     * Chọn Hiệu ứng Không gian Nền 60FPS ('FIREFLIES', 'LANTERNS', 'STARDUST', 'RAIN_DROPS', 'AUTUMN', 'NONE')
     */
    setBackgroundEffect(effectKey, showToastFeedback = true) {
      const validKey = AMBIENT_EFFECT_CONFIGS[effectKey] ? effectKey : 'NONE';
      this.canvasRenderer.setEffect(validKey);

      try {
        localStorage.setItem(AMBIENCE_STORAGE_KEYS.BG_EFFECT, validKey);
      } catch (_err) {
        // Bỏ qua
      }

      this.syncBackgroundEffectButtonsUI();
      this.syncAmbientBodyState();

      if (showToastFeedback) {
        const cfg = AMBIENT_EFFECT_CONFIGS[validKey] || AMBIENT_EFFECT_CONFIGS.NONE;
        if (validKey === 'NONE') {
          this.notify('⬛ Đã chuyển sang Nền Tĩnh Tối Giản (Tiết kiệm pin tối đa).', 'info');
        } else {
          this.notify(`🌌 Đã bật hiệu ứng nền 60FPS: ${cfg.label} — ${cfg.description}`, 'success');
        }
      }
    }

    syncBackgroundEffectButtonsUI() {
      const activeKey = this.canvasRenderer.activeEffectKey;
      const btns = document.querySelectorAll('.bg-effect-btn');
      btns.forEach((btn) => {
        const key = btn.getAttribute('data-bg-effect');
        if (key === activeKey) {
          btn.className =
            'bg-effect-btn py-1.5 px-2 rounded-xl border-2 border-emerald-400 bg-emerald-500/20 text-emerald-300 font-extrabold text-[11px] shadow';
        } else {
          btn.className =
            'bg-effect-btn py-1.5 px-2 rounded-xl border border-zinc-800 bg-zinc-950 hover:border-indigo-500 text-zinc-300 text-[11px] font-semibold';
        }
      });
    }

    /**
     * Tải tệp Hình ảnh (image/*) hoặc Video (video/*) cá nhân từ máy làm hình nền không gian viết
     */
    loadCustomMediaBackground(file) {
      if (!file) return;
      const videoEl = document.getElementById('ambient-bg-video');
      const imageEl = document.getElementById('ambient-bg-image');

      if (this.customMediaObjectUrl) {
        try {
          URL.revokeObjectURL(this.customMediaObjectUrl);
        } catch (_e) {
          // Bỏ qua
        }
        this.customMediaObjectUrl = null;
      }

      const objectUrl = URL.createObjectURL(file);
      this.customMediaObjectUrl = objectUrl;

      const mime = (file.type || '').toLowerCase();
      const isVideo = mime.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(file.name || '');

      if (isVideo) {
        this.customMediaType = 'VIDEO';
        if (imageEl) {
          imageEl.classList.add('hidden');
          imageEl.removeAttribute('src');
        }
        if (videoEl) {
          videoEl.src = objectUrl;
          videoEl.classList.remove('hidden');
          videoEl.muted = true;
          videoEl.loop = true;
          videoEl.play().catch(() => {});
        }
        try {
          localStorage.removeItem('noir_v36_active_proc_wallpaper');
        } catch (_e) {}
        this.syncAmbientBodyState();
        this.notify(`🎬 Đã đặt Video nền cá nhân: "${file.name}"`, 'success');
      } else {
        this.customMediaType = 'IMAGE';
        if (videoEl) {
          videoEl.pause();
          videoEl.classList.add('hidden');
          videoEl.removeAttribute('src');
        }
        if (imageEl) {
          imageEl.src = objectUrl;
          imageEl.classList.remove('hidden');
        }
        try {
          localStorage.removeItem('noir_v36_active_proc_wallpaper');
        } catch (_e) {}
        this.syncAmbientBodyState();
        this.notify(`🖼️ Đã đặt Ảnh nền cá nhân: "${file.name}"`, 'success');
      }
    }

    /**
     * Xóa ảnh/video nền cá nhân để quay về nền mặc định
     */
    clearCustomMediaBackground() {
      const videoEl = document.getElementById('ambient-bg-video');
      const imageEl = document.getElementById('ambient-bg-image');

      if (videoEl) {
        videoEl.pause();
        videoEl.classList.add('hidden');
        videoEl.removeAttribute('src');
      }
      if (imageEl) {
        imageEl.classList.add('hidden');
        imageEl.removeAttribute('src');
      }
      if (this.customMediaObjectUrl) {
        try {
          URL.revokeObjectURL(this.customMediaObjectUrl);
        } catch (_e) {
          // Bỏ qua
        }
        this.customMediaObjectUrl = null;
      }
      this.customMediaType = null;
      try {
        localStorage.removeItem('noir_v36_active_proc_wallpaper');
      } catch (_e) {}
      if (this.wallpaperExt) {
        this.wallpaperExt.activeWallpaperId = null;
        this.wallpaperExt.syncWallpaperButtonsUI?.();
      }
      this.syncAmbientBodyState();
      this.notify('🧹 Đã gỡ ảnh/video/tranh nền, quay về nền mặc định.', 'info');
    }

    /**
     * Điều chỉnh độ mờ lớp kính chắn bảo vệ chữ (#ambient-frosted-shield)
     */
    applyFrostedShieldOpacity(opacityVal) {
      const clamped = Math.max(0.05, Math.min(0.85, Number(opacityVal) || 0.18));
      this.frostShieldOpacity = clamped;

      const shield = document.getElementById('ambient-frosted-shield');
      if (shield) {
        if (this.themeMode === 'DARK') {
          shield.style.backgroundColor = `rgba(9, 9, 11, ${clamped.toFixed(2)})`;
        } else {
          shield.style.backgroundColor = `rgba(247, 244, 235, ${clamped.toFixed(2)})`;
        }
      }

      try {
        localStorage.setItem(AMBIENCE_STORAGE_KEYS.FROST_OPACITY, String(clamped));
      } catch (_err) {
        // Bỏ qua
      }
    }

    /**
     * Tích hợp Bảng điều khiển Kiểu chữ Sách in & Tinh chỉnh Vật lý Hạt 60FPS vào Tab 5
     */
    injectTypographyStudioDeck() {
      const typoBox = document.getElementById('s14-panel-typography-box');
      if (!typoBox || document.getElementById('mod22-advanced-typography-deck')) return;

      const deck = document.createElement('div');
      deck.id = 'mod22-advanced-typography-deck';
      deck.className =
        'pt-4 mt-2 border-t border-studioLightBorder dark:border-zinc-800 space-y-4 text-xs';

      deck.innerHTML = `
        <!-- Hàng 1: 5 Mẫu Kiểu Chữ Sách Xuất Bản Chọn Nhanh (1-Click Book Typography Presets) -->
        <div class="space-y-2">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="font-extrabold text-indigo-400">📚 Bộ Mẫu Trang Sách Chuẩn Xuất Bản (1-Click Book Typography):</span>
            <span id="mod22-live-fps-badge" class="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 font-monoCode font-bold text-[10px] text-emerald-300">60 FPS</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            ${BOOK_TYPOGRAPHY_PRESETS.map(
              (preset) => `
              <button type="button" data-typo-preset="${preset.id}" class="mod22-typo-preset-card p-2.5 rounded-xl border border-zinc-800 hover:border-indigo-500 bg-studioLightBg dark:bg-zinc-950 text-left transition flex flex-col justify-between gap-1">
                <div>
                  <div class="flex items-center justify-between gap-1">
                    <span class="font-extrabold text-[11px] text-emerald-400">${preset.name}</span>
                  </div>
                  <span class="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 text-[9px] font-bold">${preset.badge} • ${preset.fontSize}px</span>
                </div>
                <p class="text-[10px] text-zinc-400 leading-snug mt-1">${preset.description}</p>
              </button>
            `
            ).join('')}
          </div>
        </div>

        <!-- Hàng 2: Tinh chỉnh Vật lý Hạt Nền (Mật độ, Sức gió, Độ mờ Kính chắn) & Khung Xem Trước Chữ -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div class="lg:col-span-6 p-3.5 rounded-xl bg-studioLightBg dark:bg-zinc-950 border border-indigo-500/30 space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="font-extrabold text-indigo-300">🎛️ Tinh Chỉnh Vật Lý Hạt Nền & Lớp Kính Mờ:</span>
              <button type="button" id="btn-mod22-clear-custom-bg" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-rose-600 text-[10px] font-bold text-zinc-300 hover:text-white transition">
                🗑️ Gỡ Ảnh/Video Nền
              </button>
            </div>

            <div class="flex items-center gap-2">
              <span class="w-32 text-[11px] text-zinc-400">Độ tối lớp kính chắn:</span>
              <input id="mod22-slider-frost-opacity" type="range" min="5" max="80" value="${Math.round(
                this.frostShieldOpacity * 100
              )}" class="flex-1 accent-indigo-500" />
              <span id="mod22-label-frost-val" class="w-10 text-right font-monoCode text-[11px] text-indigo-300">${Math.round(
                this.frostShieldOpacity * 100
              )}%</span>
            </div>

            <div class="flex items-center gap-2">
              <span class="w-32 text-[11px] text-zinc-400">Mật độ hạt 60FPS:</span>
              <input id="mod22-slider-particle-density" type="range" min="40" max="200" value="${Math.round(
                this.canvasRenderer.densityMultiplier * 100
              )}" class="flex-1 accent-emerald-500" />
              <span id="mod22-label-density-val" class="w-10 text-right font-monoCode text-[11px] text-emerald-300">${Math.round(
                this.canvasRenderer.densityMultiplier * 100
              )}%</span>
            </div>

            <div class="flex items-center gap-2">
              <span class="w-32 text-[11px] text-zinc-400">Sức gió không gian:</span>
              <input id="mod22-slider-wind-strength" type="range" min="0" max="220" value="${Math.round(
                this.canvasRenderer.windStrength * 100
              )}" class="flex-1 accent-amber-500" />
              <span id="mod22-label-wind-val" class="w-10 text-right font-monoCode text-[11px] text-amber-300">${Math.round(
                this.canvasRenderer.windStrength * 100
              )}%</span>
            </div>
          </div>

          <!-- Khung Xem Trước Bản Thảo (Live Book Specimen Preview) -->
          <div class="lg:col-span-6 p-3.5 rounded-xl bg-studioLightBg dark:bg-zinc-950 border border-emerald-500/30 flex flex-col justify-between space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-extrabold text-emerald-400">👁️ Xem Trước Trang Sách Thực Tế (Live Typography Preview):</span>
              <span class="text-[10px] text-zinc-400">Tự động đồng bộ với Bàn viết Tab 1</span>
            </div>
            <div id="mod22-typography-specimen-preview" class="p-3 rounded-xl border border-studioLightBorder dark:border-zinc-800 bg-studioLightPanel/80 dark:bg-zinc-900/90 select-text">
              Mưa đêm gõ nhịp đều đặn lên ô cửa kính mờ hơi sương. Ánh đèn bàn vàng ấm hắt lên trang bản thảo còn thơm mùi mực mới.<br/>
              - Đêm nay chúng ta sẽ viết tiếp chương cao trào chứ? (Lâm Phong)
            </div>
          </div>
        </div>
      `;

      typoBox.appendChild(deck);

      // Gắn sự kiện cho các thẻ Preset Kiểu chữ
      deck.querySelectorAll('.mod22-typo-preset-card').forEach((card) => {
        card.addEventListener('click', () => {
          const presetId = card.getAttribute('data-typo-preset');
          const preset = BOOK_TYPOGRAPHY_PRESETS.find((p) => p.id === presetId);
          if (!preset) return;

          this.fontFamily = preset.fontFamily;
          this.fontSizePx = preset.fontSize;
          this.lineHeight = preset.lineHeight;
          this.pageWidth = preset.pageWidth;
          this.letterSpacing = preset.letterSpacing || '0.01em';

          const fontSelect = document.getElementById('select-novel-font-family');
          const sizeInput = document.getElementById('bug13-font-size-input');
          const lhSelect = document.getElementById('bug13-line-height-select');
          const pwSelect = document.getElementById('bug13-page-width-select');

          if (fontSelect) fontSelect.value = this.fontFamily;
          if (sizeInput) sizeInput.value = String(this.fontSizePx);
          if (lhSelect) lhSelect.value = this.lineHeight;
          if (pwSelect) pwSelect.value = this.pageWidth;

          this.applyTypographySettings(false);
          this.notify(`📚 Đã áp dụng mẫu trang sách: ${preset.name}`, 'success');
        });
      });

      const frostSlider = document.getElementById('mod22-slider-frost-opacity');
      const frostLabel = document.getElementById('mod22-label-frost-val');
      if (frostSlider) {
        frostSlider.addEventListener('input', (ev) => {
          const pct = parseInt(ev.target.value, 10) || 30;
          if (frostLabel) frostLabel.textContent = `${pct}%`;
          this.applyFrostedShieldOpacity(pct / 100);
        });
      }

      const densitySlider = document.getElementById('mod22-slider-particle-density');
      const densityLabel = document.getElementById('mod22-label-density-val');
      if (densitySlider) {
        densitySlider.addEventListener('input', (ev) => {
          const pct = parseInt(ev.target.value, 10) || 100;
          if (densityLabel) densityLabel.textContent = `${pct}%`;
          this.canvasRenderer.densityMultiplier = pct / 100;
          try {
            localStorage.setItem(AMBIENCE_STORAGE_KEYS.PARTICLE_DENSITY, String(pct / 100));
          } catch (_e) {
            // Bỏ qua
          }
          if (this.canvasRenderer.activeEffectKey !== 'NONE') {
            this.canvasRenderer.rebuildParticlesForEffect(this.canvasRenderer.activeEffectKey);
          }
        });
      }

      const windSlider = document.getElementById('mod22-slider-wind-strength');
      const windLabel = document.getElementById('mod22-label-wind-val');
      if (windSlider) {
        windSlider.addEventListener('input', (ev) => {
          const pct = parseInt(ev.target.value, 10) || 100;
          if (windLabel) windLabel.textContent = `${pct}%`;
          this.canvasRenderer.windStrength = pct / 100;
          try {
            localStorage.setItem(AMBIENCE_STORAGE_KEYS.WIND_STRENGTH, String(pct / 100));
          } catch (_e) {
            // Bỏ qua
          }
        });
      }

      const clearBgBtn = document.getElementById('btn-mod22-clear-custom-bg');
      if (clearBgBtn) {
        clearBgBtn.addEventListener('click', () => {
          this.clearCustomMediaBackground();
        });
      }

      const clearHeaderBtn = document.getElementById('btn-clear-custom-bg');
      if (clearHeaderBtn && !clearHeaderBtn.dataset.noirMod22Bound) {
        clearHeaderBtn.dataset.noirMod22Bound = '1';
        clearHeaderBtn.addEventListener('click', () => {
          this.clearCustomMediaBackground();
        });
      }

      const bgVisSlider = document.getElementById('mod22-bg-visibility-slider');
      if (bgVisSlider && !bgVisSlider.dataset.noirMod22Bound) {
        bgVisSlider.dataset.noirMod22Bound = '1';
        const applyPaneAlphaFromVis = (visPct) => {
          const clampedVis = Math.max(15, Math.min(95, Number(visPct) || 68));
          const darkPaneAlpha = Math.max(0.10, Math.min(0.76, 0.92 - clampedVis / 100)).toFixed(2);
          const darkCardAlpha = Math.max(0.30, Math.min(0.84, 1.04 - clampedVis * 0.82 / 100)).toFixed(2);
          const lightPaneAlpha = Math.max(0.22, Math.min(0.86, 0.98 - clampedVis / 100)).toFixed(2);
          const lightCardAlpha = Math.max(0.42, Math.min(0.90, 1.06 - clampedVis * 0.72 / 100)).toFixed(2);
          document.documentElement.style.setProperty('--noir-ambient-pane-dark', darkPaneAlpha);
          document.documentElement.style.setProperty('--noir-ambient-card-dark', darkCardAlpha);
          document.documentElement.style.setProperty('--noir-ambient-pane-light', lightPaneAlpha);
          document.documentElement.style.setProperty('--noir-ambient-card-light', lightCardAlpha);
          // Tự động giảm tối lớp kính chắn để nền hiện rõ ngay khi kéo thanh trượt
          const shield = document.getElementById('ambient-frosted-shield');
          if (shield && document.body?.classList?.contains('noir-ambient-active')) {
            const autoShield = Math.max(0.04, Math.min(0.48, 0.56 - (clampedVis / 100) * 0.52));
            shield.style.backgroundColor =
              this.themeMode === 'DARK'
                ? `rgba(6, 10, 18, ${autoShield.toFixed(2)})`
                : `rgba(247, 244, 235, ${autoShield.toFixed(2)})`;
          }
          try {
            localStorage.setItem('noir_v36_ambient_visibility_pct', String(clampedVis));
          } catch (_e) {}
        };
        try {
          const savedVis = localStorage.getItem('noir_v36_ambient_visibility_pct');
          bgVisSlider.value = savedVis || '68';
        } catch (_e) {
          bgVisSlider.value = '68';
        }
        applyPaneAlphaFromVis(bgVisSlider.value);
        bgVisSlider.addEventListener('input', (ev) => {
          applyPaneAlphaFromVis(ev.target.value);
        });
      }
    }
  }

  // ==========================================================================
  // PHẦN 5: BỘ TẠO TRANH NỀN NGHỆ THUẬT TỰ SINH 0MB (PROCEDURAL SVG WALLPAPERS)
  //         & BỘ BẢO VỆ THỊ LỰC BAN ĐÊM (CIRCADIAN EYE-CARE KELVIN FILTER)
  // ==========================================================================

  const PROCEDURAL_ART_WALLPAPERS = [
    {
      id: 'WALL_MISTY_BAMBOO',
      title: '🎋 Rừng Trúc Sương Đêm',
      subtitle: 'Thủy mặc cổ phong thanh tịnh',
      skyTop: '#0b2e28',
      skyBottom: '#1f6353',
      moonColor: '#ccfbf1',
      mountainBack: '#134e40',
      mountainFront: '#0a2922',
      accentSilhouette: 'BAMBOO'
    },
    {
      id: 'WALL_NOIR_CITY_SKYLINE',
      title: '🏙️ Phố Đêm Mưa Noir',
      subtitle: 'Ánh đèn vàng phản chiếu mặt đường ướt',
      skyTop: '#101633',
      skyBottom: '#2d2a5e',
      moonColor: '#fde68a',
      mountainBack: '#1b1e42',
      mountainFront: '#0f1229',
      accentSilhouette: 'CITY_WINDOWS'
    },
    {
      id: 'WALL_MOONLIT_PAGODA',
      title: '🏯 Cổ Tự Dưới Trăng Rằm',
      subtitle: 'Kiếm hiệp / Tiên hiệp huyền ảo',
      skyTop: '#151945',
      skyBottom: '#392f7a',
      moonColor: '#fef08a',
      mountainBack: '#21225c',
      mountainFront: '#111236',
      accentSilhouette: 'PAGODA_PEAK'
    },
    {
      id: 'WALL_AUTUMN_VALLEY',
      title: '🍁 Thung Lũng Phong Đỏ',
      subtitle: 'Chiều thu lãng mạn trầm buồn',
      skyTop: '#3b1520',
      skyBottom: '#8c3128',
      moonColor: '#fed7aa',
      mountainBack: '#571e24',
      mountainFront: '#290d12',
      accentSilhouette: 'PINE_TREES'
    },
    {
      id: 'WALL_STARRY_FJORD',
      title: '🌌 Vịnh Biển Bắc Cực Quang',
      subtitle: 'Kỳ ảo / Viễn tưởng bao la',
      skyTop: '#081d36',
      skyBottom: '#155469',
      moonColor: '#6ee7b7',
      mountainBack: '#0e364a',
      mountainFront: '#071c29',
      accentSilhouette: 'AURORA_PEAKS'
    },
    {
      id: 'WALL_WARM_LIBRARY_GOLD',
      title: '🕯️ Thư Phòng Ánh Nến Cổ',
      subtitle: 'Trinh thám cổ điển / Học viện',
      skyTop: '#2b1b0e',
      skyBottom: '#5e3c1b',
      moonColor: '#fde047',
      mountainBack: '#3d2713',
      mountainFront: '#1f1308',
      accentSilhouette: 'ARCH_WINDOWS'
    },
    {
      id: 'WALL_PURE_BLACK',
      title: '⬛ Nền Đen Tối Giản',
      subtitle: 'Đen kịt OLED tuyệt đối',
      skyTop: '#000000',
      skyBottom: '#000000',
      moonColor: '#000000',
      mountainBack: '#000000',
      mountainFront: '#000000',
      accentSilhouette: 'SOLID_BLACK',
      isSolidBlack: true
    },
    {
      id: 'WALL_PURE_WHITE',
      title: '⬜ Nền Trắng Tối Giản',
      subtitle: 'Trắng tinh giấy in sắc nét',
      skyTop: '#ffffff',
      skyBottom: '#f8f8f8',
      moonColor: '#ffffff',
      mountainBack: '#f4f4f5',
      mountainFront: '#e4e4e7',
      accentSilhouette: 'SOLID_WHITE',
      isSolidWhite: true
    }
  ];

  /**
   * Bảng tông màu ánh sáng ấm bảo vệ mắt ban đêm (Kelvin Eye-Care Filter)
   */
  const CIRCADIAN_EYE_CARE_PROFILES = {
    NATURAL_6500K: {
      id: 'NATURAL_6500K',
      label: '☀️ 6500K Chuẩn Gốc (Không lọc sáng xanh)',
      cssFilter: 'none',
      paperTintDark: '',
      paperTintLight: '',
      description: 'Màu sắc nguyên bản độ tương phản cao.'
    },
    WARM_READING_4800K: {
      id: 'WARM_READING_4800K',
      label: '🌤️ 4800K Dịu Mắt (Giảm 25% ánh sáng xanh)',
      cssFilter: 'sepia(0.10) saturate(0.95)',
      paperTintDark: 'rgba(18, 17, 14, 0.94)',
      paperTintLight: '#F4EFE1',
      description: 'Phù hợp cho các phiên viết kéo dài 2-3 giờ liên tục.'
    },
    CANDLELIGHT_3400K: {
      id: 'CANDLELIGHT_3400K',
      label: '🕯️ 3400K Ánh Nến Đêm Khuya (Giảm 55% sáng xanh)',
      cssFilter: 'sepia(0.24) saturate(0.90) brightness(0.96)',
      paperTintDark: 'rgba(20, 16, 12, 0.95)',
      paperTintLight: '#EDE4CE',
      description: 'Bảo vệ giấc ngủ và chống mỏi mắt khi sáng tác sau nửa đêm.'
    },
    E_INK_KINDLE: {
      id: 'E_INK_KINDLE',
      label: '📟 Màn Hình Mực Điện Tử E-Ink (Đơn sắc tĩnh tại)',
      cssFilter: 'grayscale(0.75) contrast(1.04)',
      paperTintDark: 'rgba(16, 16, 16, 0.96)',
      paperTintLight: '#EAE8E1',
      description: 'Tái hiện cảm giác máy đọc sách Kindle Paperwhite chống xao nhãng.'
    }
  };

  class ProceduralWallpaperAndEyeCareExtension {
    constructor(ambienceEngineInstance) {
      this.engine = ambienceEngineInstance;
      this.activeWallpaperId = null;
      this.activeEyeCareId = 'NATURAL_6500K';
      this.firstLineIndentEnabled = false;
    }

    initExtension() {
      this.engine.wallpaperExt = this;
      this.restoreExtensionState();
      this.injectWallpaperAndEyeCarePanel();
      this.applyEyeCareProfile(this.activeEyeCareId, false);
      this.applyFirstLineIndentStyle(this.firstLineIndentEnabled, false);
      if (this.activeWallpaperId) {
        this.generateAndApplySvgWallpaper(this.activeWallpaperId, false);
      }
      this.engine.syncAmbientBodyState?.();
    }

    restoreExtensionState() {
      try {
        const savedEyeCare = localStorage.getItem(AMBIENCE_STORAGE_KEYS.PAPER_TINT);
        if (savedEyeCare && CIRCADIAN_EYE_CARE_PROFILES[savedEyeCare]) {
          this.activeEyeCareId = savedEyeCare;
        }
        const savedIndent = localStorage.getItem(AMBIENCE_STORAGE_KEYS.PARA_SPACING);
        this.firstLineIndentEnabled = savedIndent === 'INDENT_ON';
        const savedWp = localStorage.getItem('noir_v36_active_proc_wallpaper');
        if (savedWp && PROCEDURAL_ART_WALLPAPERS.some((w) => w.id === savedWp)) {
          this.activeWallpaperId = savedWp;
        }
      } catch (_err) {
        // Bỏ qua
      }
    }

    syncWallpaperButtonsUI() {
      document.querySelectorAll('.mod22-proc-wp-btn').forEach((btn) => {
        const id = btn.getAttribute('data-proc-wallpaper');
        const isActive = id && id === this.activeWallpaperId;
        btn.className = isActive
          ? 'mod22-proc-wp-btn px-2.5 py-1.5 rounded-lg border-2 border-emerald-400 bg-emerald-500/20 text-left transition shadow'
          : 'mod22-proc-wp-btn px-2.5 py-1.5 rounded-lg border border-zinc-800 hover:border-emerald-500 bg-zinc-900 text-left transition';
      });
      const clearWpBtn = document.getElementById('btn-mod22-clear-wallpaper');
      if (clearWpBtn) {
        clearWpBtn.classList.toggle('hidden', !this.activeWallpaperId);
      }
    }

    clearWallpaper(showToast = true) {
      this.activeWallpaperId = null;
      try {
        localStorage.removeItem('noir_v36_active_proc_wallpaper');
      } catch (_e) {}
      const imageEl = document.getElementById('ambient-bg-image');
      if (imageEl) {
        imageEl.classList.add('hidden');
        imageEl.removeAttribute('src');
      }
      if (typeof document !== 'undefined' && document.body?.dataset?.minimalBg) {
        delete document.body.dataset.minimalBg;
      }
      this.syncWallpaperButtonsUI();
      this.engine.syncAmbientBodyState?.();
      if (showToast) {
        this.engine.notify('🧹 Đã tắt tranh nền nghệ thuật 0MB.', 'info');
      }
    }

    /**
     * Vẽ tranh nền SVG nghệ thuật độ phân giải cao (1920x1080) hoàn toàn bằng mã lệnh 0MB
     * và nạp trực tiếp vào thẻ #ambient-bg-image
     */
    generateAndApplySvgWallpaper(wallpaperId, showToast = true) {
      const wp = PROCEDURAL_ART_WALLPAPERS.find((w) => w.id === wallpaperId);
      if (!wp) return;

      this.activeWallpaperId = wp.id;
      try {
        localStorage.setItem('noir_v36_active_proc_wallpaper', wp.id);
      } catch (_e) {}

      // Xử lý chuyên biệt cho 2 lựa chọn Nền Đơn Sắc Tối Giản
      if (wp.accentSilhouette === 'SOLID_BLACK') {
        const svgMarkup = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080"><rect width="1920" height="1080" fill="#000000" /></svg>';
        const encodedSvg = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgMarkup);
        const imageEl = document.getElementById('ambient-bg-image');
        const videoEl = document.getElementById('ambient-bg-video');
        if (videoEl) { videoEl.pause(); videoEl.classList.add('hidden'); }
        if (imageEl) { imageEl.src = encodedSvg; imageEl.classList.remove('hidden'); }
        if (typeof document !== 'undefined' && document.body) {
          document.body.dataset.minimalBg = 'black';
        }
        this.syncWallpaperButtonsUI();
        this.engine.syncAmbientBodyState?.();
        if (showToast) this.engine.notify('⬛ Đã bật Nền Đen Tối Giản OLED tuyệt đối chống chói mắt.', 'success');
        return;
      }
      if (wp.accentSilhouette === 'SOLID_WHITE') {
        const svgMarkup = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080"><rect width="1920" height="1080" fill="#ffffff" /></svg>';
        const encodedSvg = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgMarkup);
        const imageEl = document.getElementById('ambient-bg-image');
        const videoEl = document.getElementById('ambient-bg-video');
        if (videoEl) { videoEl.pause(); videoEl.classList.add('hidden'); }
        if (imageEl) { imageEl.src = encodedSvg; imageEl.classList.remove('hidden'); }
        if (typeof document !== 'undefined' && document.body) {
          document.body.dataset.minimalBg = 'white';
        }
        this.syncWallpaperButtonsUI();
        this.engine.syncAmbientBodyState?.();
        if (showToast) this.engine.notify('⬜ Đã bật Nền Trắng Tối Giản kiểu trang giấy in.', 'success');
        return;
      }
      if (typeof document !== 'undefined' && document.body?.dataset?.minimalBg) {
        delete document.body.dataset.minimalBg;
      }

      let foregroundSilhouetteSvg = '';
      if (wp.accentSilhouette === 'BAMBOO') {
        foregroundSilhouetteSvg = `
          <g stroke="#34d399" stroke-opacity="0.48" stroke-width="6" fill="none">
            <path d="M180,1080 Q210,720 160,260" />
            <path d="M225,1080 Q260,680 245,200" />
            <path d="M1670,1080 Q1630,740 1705,280" />
            <path d="M1740,1080 Q1700,660 1775,180" />
          </g>
          <g fill="#6ee7b7" fill-opacity="0.38">
            <ellipse cx="145" cy="400" rx="34" ry="8" transform="rotate(-25 145 400)" />
            <ellipse cx="195" cy="340" rx="38" ry="8" transform="rotate(20 195 340)" />
            <ellipse cx="265" cy="450" rx="35" ry="7" transform="rotate(32 265 450)" />
            <ellipse cx="1690" cy="390" rx="38" ry="8" transform="rotate(-28 1690 390)" />
            <ellipse cx="1740" cy="320" rx="34" ry="7" transform="rotate(22 1740 320)" />
          </g>
        `;
      } else if (wp.accentSilhouette === 'AURORA_PEAKS') {
        foregroundSilhouetteSvg = `
          <path d="M0,340 Q420,180 860,310 T1920,210 L1920,440 Q1420,330 960,470 T0,430 Z" fill="#34d399" fill-opacity="0.26" />
          <path d="M0,410 Q500,260 1020,390 T1920,290 L1920,480 L0,490 Z" fill="#38bdf8" fill-opacity="0.22" />
        `;
      } else if (wp.accentSilhouette === 'PINE_TREES') {
        foregroundSilhouetteSvg = `
          <g fill="#f97316" fill-opacity="0.26">
            <polygon points="120,860 190,640 260,860" />
            <polygon points="210,880 290,610 370,880" />
            <polygon points="1580,870 1660,600 1740,870" />
          </g>
        `;
      } else if (wp.accentSilhouette === 'CITY_WINDOWS') {
        const rects = [];
        const buildings = [
          { x: 80, w: 140, h: 420 },
          { x: 240, w: 190, h: 540 },
          { x: 450, w: 130, h: 360 },
          { x: 1320, w: 170, h: 490 },
          { x: 1510, w: 210, h: 580 },
          { x: 1740, w: 150, h: 410 }
        ];
        buildings.forEach((b) => {
          const by = 1080 - b.h;
          rects.push(`<rect x="${b.x}" y="${by}" width="${b.w}" height="${b.h}" fill="${wp.mountainFront}" opacity="0.92" />`);
          for (let wy = by + 28; wy < 1020; wy += 36) {
            for (let wx = b.x + 18; wx < b.x + b.w - 24; wx += 28) {
              if ((wx + wy) % 3 === 0) {
                rects.push(
                  `<rect x="${wx}" y="${wy}" width="12" height="18" rx="2" fill="#f59e0b" fill-opacity="0.28" />`
                );
              }
            }
          }
        });
        foregroundSilhouetteSvg = rects.join('');
      } else if (wp.accentSilhouette === 'PAGODA_PEAK') {
        foregroundSilhouetteSvg = `
          <g fill="${wp.mountainFront}" opacity="0.95">
            <polygon points="1480,620 1560,570 1640,620" />
            <polygon points="1495,570 1560,525 1625,570" />
            <polygon points="1510,525 1560,480 1610,525" />
            <rect x="1530" y="525" width="60" height="110" />
            <rect x="1552" y="560" width="16" height="28" rx="4" fill="#fde047" fill-opacity="0.55" />
          </g>
        `;
      } else if (wp.accentSilhouette === 'ARCH_WINDOWS') {
        foregroundSilhouetteSvg = `
          <g stroke="#d97706" stroke-opacity="0.18" stroke-width="3" fill="none">
            <rect x="120" y="140" width="280" height="720" rx="140" />
            <rect x="1520" y="140" width="280" height="720" rx="140" />
          </g>
        `;
      }

      const svgMarkup = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
          <defs>
            <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="${wp.skyTop}" />
              <stop offset="100%" stop-color="${wp.skyBottom}" />
            </linearGradient>
            <radialGradient id="moonGlow" cx="76%" cy="24%" r="36%">
              <stop offset="0%" stop-color="${wp.moonColor}" stop-opacity="0.78" />
              <stop offset="40%" stop-color="${wp.moonColor}" stop-opacity="0.30" />
              <stop offset="100%" stop-color="${wp.moonColor}" stop-opacity="0" />
            </radialGradient>
            <linearGradient id="mistBand" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="${wp.moonColor}" stop-opacity="0.06" />
              <stop offset="50%" stop-color="${wp.moonColor}" stop-opacity="0.22" />
              <stop offset="100%" stop-color="${wp.moonColor}" stop-opacity="0.06" />
            </linearGradient>
          </defs>
          <rect width="1920" height="1080" fill="url(#skyGrad)" />
          <circle cx="1460" cy="260" r="460" fill="url(#moonGlow)" />
          <circle cx="1460" cy="260" r="64" fill="${wp.moonColor}" fill-opacity="0.92" />
          <rect x="0" y="640" width="1920" height="120" fill="url(#mistBand)" />
          <path d="M0,780 Q360,610 740,730 T1480,670 T1920,740 L1920,1080 L0,1080 Z" fill="${wp.mountainBack}" opacity="0.88" />
          <path d="M0,860 Q480,720 960,840 T1920,790 L1920,1080 L0,1080 Z" fill="${wp.mountainFront}" opacity="0.95" />
          ${foregroundSilhouetteSvg}
        </svg>
      `.trim();

      const encodedSvg = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgMarkup);
      const imageEl = document.getElementById('ambient-bg-image');
      const videoEl = document.getElementById('ambient-bg-video');

      if (videoEl) {
        videoEl.pause();
        videoEl.classList.add('hidden');
      }
      if (imageEl) {
        imageEl.src = encodedSvg;
        imageEl.classList.remove('hidden');
      }

      this.syncWallpaperButtonsUI();
      this.engine.syncAmbientBodyState?.();
      if (showToast) {
        this.engine.notify(`🎨 Đã áp dụng tranh nền nghệ thuật 0MB: "${wp.title}"`, 'success');
      }
    }

    /**
     * Áp dụng chế độ lọc ánh sáng xanh bảo vệ mắt (Circadian Kelvin Filter)
     */
    applyEyeCareProfile(profileId, showToast = true) {
      const profile = CIRCADIAN_EYE_CARE_PROFILES[profileId] || CIRCADIAN_EYE_CARE_PROFILES.NATURAL_6500K;
      this.activeEyeCareId = profile.id;

      const mainWorkspace = document.getElementById('app-main-workspace');
      if (mainWorkspace) {
        mainWorkspace.style.filter = profile.cssFilter;
      }

      try {
        localStorage.setItem(AMBIENCE_STORAGE_KEYS.PAPER_TINT, profile.id);
      } catch (_err) {
        // Bỏ qua
      }

      if (showToast) {
        this.engine.notify(`👁️ Chế độ bảo vệ thị lực: ${profile.label}`, 'info');
      }
    }

    /**
     * Bật/Tắt chế độ thụt đầu dòng đoạn văn kiểu Sách in truyền thống
     */
    applyFirstLineIndentStyle(enabled, showToast = true) {
      this.firstLineIndentEnabled = Boolean(enabled);
      const editorEl = document.getElementById('textarea-chapter-content');
      const specimenEl = document.getElementById('mod22-typography-specimen-preview');

      const indentVal = this.firstLineIndentEnabled ? '1.6em' : '0px';
      if (editorEl) {
        editorEl.style.textIndent = indentVal;
      }
      if (specimenEl) {
        specimenEl.style.textIndent = indentVal;
      }

      try {
        localStorage.setItem(
          AMBIENCE_STORAGE_KEYS.PARA_SPACING,
          this.firstLineIndentEnabled ? 'INDENT_ON' : 'INDENT_OFF'
        );
      } catch (_err) {
        // Bỏ qua
      }

      if (showToast) {
        this.engine.notify(
          this.firstLineIndentEnabled
            ? '📐 Đã bật thụt đầu dòng trang sách in truyền thống.'
            : '📐 Đã tắt thụt đầu dòng (Canh lề thẳng chuẩn Web Novel).',
          'info'
        );
      }
    }

    injectWallpaperAndEyeCarePanel() {
      const deck = document.getElementById('mod22-advanced-typography-deck');
      if (!deck || document.getElementById('mod22-wallpaper-eyecare-row')) return;

      const extraRow = document.createElement('div');
      extraRow.id = 'mod22-wallpaper-eyecare-row';
      extraRow.className =
        'p-3.5 rounded-xl bg-studioLightBg dark:bg-zinc-950 border border-studioLightBorder dark:border-zinc-800 space-y-3';

      extraRow.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          <!-- Bộ chọn Nhiệt độ màu Bảo vệ mắt (Kelvin Eye-Care) -->
          <div class="lg:col-span-5 space-y-1.5">
            <label class="block text-[10px] font-extrabold uppercase text-amber-400">
              🕯️ Chế Độ Bảo Vệ Thị Lực Ban Đêm (Circadian Eye-Care):
            </label>
            <div class="flex flex-wrap items-center gap-2">
              <select id="mod22-select-eyecare-kelvin" class="noir-dark-select flex-1 min-w-[160px] px-2.5 py-1.5 rounded-lg border border-zinc-700 bg-zinc-950 font-semibold text-[11px] text-white">
                ${Object.values(CIRCADIAN_EYE_CARE_PROFILES)
                  .map((p) => `<option value="${p.id}">${p.label}</option>`)
                  .join('')}
              </select>
              <button type="button" id="btn-mod22-toggle-indent" class="px-2.5 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 hover:border-emerald-500 font-bold text-[11px] text-zinc-200 shrink-0 whitespace-nowrap" title="Thụt lề dòng đầu tiên kiểu sách in">
                ⇥ Thụt đầu dòng
              </button>
            </div>
          </div>

          <!-- 6 Tranh nền SVG Nghệ thuật Tự sinh (0MB) -->
          <div class="lg:col-span-7 space-y-1.5">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="text-[10px] font-extrabold uppercase text-emerald-400">
                🎨 Kho Tranh Nền Nghệ Thuật Tự Sinh (0MB — Không Cần Tải File):
              </span>
              <button type="button" id="btn-mod22-clear-wallpaper" class="hidden px-2 py-0.5 rounded-lg border border-rose-500/40 bg-rose-500/15 hover:bg-rose-600 text-rose-200 hover:text-white font-bold text-[10px]">
                ✕ Tắt tranh nền
              </button>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              ${PROCEDURAL_ART_WALLPAPERS.map(
                (wp) => `
                <button type="button" data-proc-wallpaper="${wp.id}" class="mod22-proc-wp-btn px-2.5 py-1.5 rounded-lg border border-zinc-800 hover:border-emerald-500 bg-zinc-900 text-left transition">
                  <div class="font-bold text-[10px] text-emerald-300 truncate">${wp.title}</div>
                  <div class="text-[9px] text-zinc-400 truncate">${wp.subtitle}</div>
                </button>
              `
              ).join('')}
            </div>
          </div>
        </div>
      `;

      deck.appendChild(extraRow);

      const eyeSelect = document.getElementById('mod22-select-eyecare-kelvin');
      if (eyeSelect) {
        eyeSelect.value = this.activeEyeCareId;
        eyeSelect.addEventListener('change', (ev) => {
          this.applyEyeCareProfile(ev.target.value, true);
        });
      }

      const indentBtn = document.getElementById('btn-mod22-toggle-indent');
      if (indentBtn) {
        indentBtn.addEventListener('click', () => {
          this.applyFirstLineIndentStyle(!this.firstLineIndentEnabled, true);
        });
      }

      extraRow.querySelectorAll('.mod22-proc-wp-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const wpId = btn.getAttribute('data-proc-wallpaper');
          if (this.activeWallpaperId === wpId) {
            this.clearWallpaper(true);
          } else {
            this.generateAndApplySvgWallpaper(wpId, true);
          }
        });
      });

      const clearWpBtn = document.getElementById('btn-mod22-clear-wallpaper');
      if (clearWpBtn) {
        clearWpBtn.addEventListener('click', () => {
          this.clearWallpaper(true);
        });
      }

      this.syncWallpaperButtonsUI();
    }
  }

  // ==========================================================================
  // PHẦN 6: BỘ GIÁM SÁT TƯƠNG PHẢN ĐỌC (WCAG READABILITY & CONTRAST AUDITOR)
  //         & BỘ NHẮC NGHỈ MẮT 20-20-20 CHO TÁC GIẢ VIẾT ĐÊM
  // ==========================================================================

  class ReadabilityErgonomicsAdvisor {
    constructor(ambienceEngineInstance) {
      this.engine = ambienceEngineInstance;
      this.sessionStartTimestamp = Date.now();
      this.eyeRestReminderMinutes = 45;
      this.reminderEnabled = false;
      this.reminderTimer = null;
    }

    /**
     * Tính toán điểm số dễ đọc của cấu hình kiểu chữ hiện tại (0 -> 100 điểm)
     * dựa trên quy chuẩn công thái học thị giác cho văn bản tiếng Việt dài
     */
    evaluateTypographyErgonomics() {
      const fontSize = Number(this.engine.fontSizePx) || 17;
      const lineHeight = parseFloat(this.engine.lineHeight) || 1.85;
      const pageWidth = String(this.engine.pageWidth || '100%');
      const isDark = this.engine.themeMode === 'DARK';

      let score = 100;
      const advisories = [];

      // 1. Đánh giá cỡ chữ (Tối ưu cho tiểu thuyết là 16px - 21px)
      if (fontSize < 15) {
        score -= 18;
        advisories.push(
          `Cỡ chữ hiện tại (${fontSize}px) hơi nhỏ khi viết chương dài trên 3.000 từ. Khuyên dùng từ 17px đến 19px.`
        );
      } else if (fontSize > 24) {
        score -= 8;
        advisories.push(
          `Cỡ chữ lớn (${fontSize}px) giúp nhìn rõ nhưng làm giảm lượng ngữ cảnh hiển thị trên một trang.`
        );
      } else {
        advisories.push(`Cỡ chữ ${fontSize}px nằm trong vùng vàng công thái học thị giác.`);
      }

      // 2. Đánh giá độ giãn dòng (Tiếng Việt có dấu thanh cao nên cần >= 1.75)
      if (lineHeight < 1.7) {
        score -= 14;
        advisories.push(
          `Giãn dòng ${lineHeight} hơi sát đối với chữ tiếng Việt có dấu mũ và dấu nặng. Mức 1.85 giúp mắt chuyển dòng mượt hơn.`
        );
      } else {
        advisories.push(`Giãn dòng ${lineHeight} rất thoáng cho văn bản tiếng Việt có dấu.`);
      }

      // 3. Đánh giá độ dài dòng (Khổ rộng trang sách)
      if (pageWidth === '100%' && window.innerWidth > 1440) {
        score -= 10;
        advisories.push(
          'Trên màn hình máy tính rộng, khổ 900px hoặc 740px giúp mắt không phải quét ngang quá xa từ trái sang phải.'
        );
      } else {
        advisories.push(`Khổ trang ${pageWidth} giữ độ dài câu lý tưởng (65 - 85 ký tự/dòng).`);
      }

      return {
        score: Math.max(50, Math.min(100, score)),
        themeLabel: isDark ? 'Đêm Noir (Chống chói)' : 'Giấy Kem Sáng (Cổ điển)',
        advisories
      };
    }

    toggleEyeRestReminder(enable) {
      this.reminderEnabled = Boolean(enable);
      if (this.reminderTimer) {
        clearInterval(this.reminderTimer);
        this.reminderTimer = null;
      }
      if (this.reminderEnabled) {
        this.reminderTimer = setInterval(() => {
          if (document.hidden) return;
          this.engine.notify(
            '🌿 [Bảo vệ mắt 20-20-20]: Bạn đã tập trung viết liên tục 45 phút! Hãy phóng tầm mắt nhìn xa 6 mét trong 20 giây để thư giãn võng mạc nhé.',
            'info'
          );
        }, this.eyeRestReminderMinutes * 60 * 1000);
      }
    }
  }

  // ==========================================================================
  // PHẦN 6B: HIỆU CHỈNH ĐỘ TƯƠNG PHẢN WCAG & GỢI Ý NHỊP THỞ TẬP TRUNG
  // ==========================================================================

  class AmbientContrastCalibratorAndBreathCoach {
    constructor(engine) {
      this.engine = engine;
      this.breathActive = false;
      this.presetsStorageKey = 'noir_studio_custom_theme_bookmarks_v1';
    }

    computeRelativeLuminance(hexColor) {
      const hex = String(hexColor || '#09090b').replace('#', '');
      const full = hex.length === 3
        ? hex.split('').map((c) => c + c).join('')
        : hex.padEnd(6, '0').slice(0, 6);
      const r = parseInt(full.slice(0, 2), 16) / 255;
      const g = parseInt(full.slice(2, 4), 16) / 255;
      const b = parseInt(full.slice(4, 6), 16) / 255;
      const linearize = (v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
      return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
    }

    evaluateContrastRatio(bgHex, fgHex) {
      const l1 = this.computeRelativeLuminance(bgHex);
      const l2 = this.computeRelativeLuminance(fgHex);
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      const ratio = Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
      return {
        ratio,
        grade: ratio >= 7 ? 'AAA (Rất dịu mắt khi viết dài)' : ratio >= 4.5 ? 'AA (Đạt chuẩn)' : 'LOW (Cần tăng tương phản)'
      };
    }

    saveCurrentAppearanceBookmark(label) {
      try {
        const current = JSON.parse(localStorage.getItem(this.presetsStorageKey) || '[]');
        const list = Array.isArray(current) ? current : [];
        const entry = {
          id: `theme_${Date.now()}`,
          label: String(label || `Góc viết ${list.length + 1}`).trim(),
          state: { ...this.engine.state },
          createdAt: Date.now()
        };
        const updated = [entry, ...list].slice(0, 12);
        localStorage.setItem(this.presetsStorageKey, JSON.stringify(updated));
        this.engine.notify(`🎨 Đã lưu cấu hình góc viết "${entry.label}"!`, 'success');
        return entry;
      } catch (_) {
        return null;
      }
    }

    getSavedBookmarks() {
      try {
        const raw = JSON.parse(localStorage.getItem(this.presetsStorageKey) || '[]');
        return Array.isArray(raw) ? raw : [];
      } catch (_) {
        return [];
      }
    }
  }

  // ==========================================================================
  // PHẦN 7: KHỞI TẠO ĐỐI TƯỢNG & ĐĂNG KÝ VÀO KHÔNG GIAN TÊN WINDOW.NOIRSTUDIO
  // ==========================================================================

  const ambienceEngine = new TypographyAndAmbientCanvasEngine();
  const wallpaperExtension = new ProceduralWallpaperAndEyeCareExtension(ambienceEngine);
  const ergonomicsAdvisor = new ReadabilityErgonomicsAdvisor(ambienceEngine);
  const contrastCalibrator = new AmbientContrastCalibratorAndBreathCoach(ambienceEngine);

  ambienceEngine.wallpaperExtension = wallpaperExtension;
  ambienceEngine.ergonomicsAdvisor = ergonomicsAdvisor;
  ambienceEngine.contrastCalibrator = contrastCalibrator;

  const originalInit = ambienceEngine.init.bind(ambienceEngine);
  ambienceEngine.init = function () {
    originalInit();
    wallpaperExtension.initExtension();
  };

  window.NoirStudio.TypographyAndAmbientCanvasEngine = TypographyAndAmbientCanvasEngine;
  window.NoirStudio.ambience = ambienceEngine;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      ambienceEngine.init();
    });
  } else {
    ambienceEngine.init();
  }
})();
