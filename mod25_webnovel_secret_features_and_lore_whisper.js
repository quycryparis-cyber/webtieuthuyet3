/**
 * ============================================================================
 * MODULE 25: TÍNH NĂNG BÍ MẬT DÒNG WEB NOVEL, TỪ ĐIỂN NGŨ QUAN & LORE WHISPER
 * Tệp: mod25_webnovel_secret_features_and_lore_whisper.js
 * ============================================================================
 * Nhiệm vụ chuyên biệt:
 *   1. Điều khiển Trung tâm Từ Điển Ngũ Quan (Show-Don't-Tell) & Lời Tác Giả
 *      Đầu/Cuối Chương (`#modal-sensory-and-author-notes`, `#btn-open-sensory-assistant`,
 *      `#btn-close-sensory-modal`, `#sensory-and-author-notes-body`).
 *   2. Thanh Nhắc Nhở Nhất Quán Nhân Vật / Lore Ngầm (`#passive-lore-whisper-bar`,
 *      `#passive-lore-whisper-content`, `#btn-dismiss-lore-whisper`): tự động phát hiện
 *      khi bạn vừa gõ tên một nhân vật hoặc manh mối từ Story Bible và thì thầm
 *      nhắc lại ngoại hình, cách xưng hô, bí mật nhân vật đó KHÔNG biết để tránh quên.
 *   3. Quản lý Mục Tiêu Số Từ Mỗi Ngày (`#daily-goal-progress-pill`), xuất API
 *      `updateDailyGoalFromActiveProject()` đồng bộ trực tiếp với `mod09` AutoSaver.
 *   4. Bổ sung công cụ WebNovel chuyên nghiệp: Kho Móc Câu Kết Chương (Cliffhanger),
 *      Bộ Sinh Tên Nhân Vật (Việt / Nhật Light Novel / Tây Phương / Cổ Phong),
 *      và Lời Tác Giả Đầu/Cuối từng chương kèm Bộ đếm Tiến Độ Cuốn Sách.
 * ============================================================================
 */
(function (global) {
  'use strict';

  const NS = (global.NoirStudio = global.NoirStudio || {});

  const AUTHOR_NOTES_STORAGE_KEY = 'noir_v38_chapter_author_notes_v1';

  // ==========================================================================
  // KHO TỪ ĐIỂN NGŨ QUAN SHOW-DON'T-TELL (5 GIÁC QUAN VĂN HỌC CHỌN LỌC)
  // ==========================================================================
  const FIVE_SENSES_LITERARY_THESAURUS = Object.freeze({
    SIGHT: {
      id: 'SIGHT',
      title: '👁️ Thị Giác (Ánh Sáng, Bóng Đổ & Vi Biểu Cảm)',
      moodHint: 'Tạo cảm giác điện ảnh ngay lập tức thay vì kể tính từ khô.',
      entries: [
        {
          emotion: 'Căng thẳng / Che giấu bí mật',
          phrase: 'Ánh đèn huỳnh quang nhấp nháy cắt ngang sống mũi hắn, hắt một vệt bóng xám dài xuống mặt bàn gỗ.'
        },
        {
          emotion: 'Hoảng hốt kìm nén',
          phrase: 'Đầu ngón tay đang giữ quai tách khẽ khựng lại, làm gợn sóng nhỏ trong lòng chén trà sậm màu.'
        },
        {
          emotion: 'Cô độc / Lạnh lẽo đô thị',
          phrase: 'Ánh neon từ biển hiệu đối diện rỉ qua khe rèm chớp, nhuộm xanh bệ cửa sổ ẩm sương.'
        },
        {
          emotion: 'Ngỡ ngàng sững sờ',
          phrase: 'Đồng tử mở to hơn bình thường một chút, phản chiếu nguyên vẹn ngọn lửa nhỏ đang rung trước gió.'
        },
        {
          emotion: 'Kiệt sức sau biến cố',
          phrase: 'Quầng thâm mờ dưới mi mắt khiến cái chớp mắt của cô chậm hơn bình thường nửa nhịp.'
        },
        {
          emotion: 'Cảnh giác tột độ',
          phrase: 'Ánh nhìn quét nhanh qua khe cửa khép hờ, dừng đúng hai giây ở vệt bùn mới in cạnh thảm chùi chân.'
        }
      ]
    },
    HEARING: {
      id: 'HEARING',
      title: '👂 Thính Giác (Âm Thanh Nền & Khoảng Lặng)',
      moodHint: 'Dùng âm thanh rất khẽ để làm nổi bật bầu không khí im lặng đáng sợ.',
      entries: [
        {
          emotion: 'Ngột ngạt chờ đợi',
          phrase: 'Tiếng kim giây đồng hồ đeo tay gõ đều đặn vào khoảng lặng đặc quánh giữa hai người.'
        },
        {
          emotion: 'Đêm khuya / Bất an',
          phrase: 'Ngoài hành lang vang lên tiếng bước chân đế mềm chậm rãi, dừng lại đúng trước cánh cửa số 402 rồi im bặt.'
        },
        {
          emotion: 'Kìm nén tức giận',
          phrase: 'Giọng nói hạ thấp xuống nửa quãng, khàn đi nhưng từng chữ đều gằn sắc như lưỡi dao cùn miết qua mặt kính.'
        },
        {
          emotion: 'Mưa buồn / Hồi tưởng',
          phrase: 'Tiếng mưa gõ lộp bộp lên mái tôn cũ đều như tiếng gõ nhịp, át đi cả tiếng thở dài vừa thoát ra.'
        },
        {
          emotion: 'Sợ hãi bản năng',
          phrase: 'Tiếng bản lề rỉ sét rít lên một vệt chói tai trước khi luồng gió lạnh lùa thẳng vào căn phòng.'
        },
        {
          emotion: 'Bối rối mất bình tĩnh',
          phrase: 'Âm thanh cổ áo sột soạt khi hắn vô thức nuốt khan làm lộ rõ sự lúng túng.'
        }
      ]
    },
    SMELL: {
      id: 'SMELL',
      title: '👃 Khứu Giác (Mùi Ký Ức & Không Gian)',
      moodHint: 'Khứu giác kích hoạt ký ức độc giả mạnh mẽ hơn bất kỳ giác quan nào khác.',
      entries: [
        {
          emotion: 'Phòng kín lâu ngày / Bí ẩn',
          phrase: 'Mùi giấy cũ ẩm mốc quyện cùng mùi sát trùng nhàn nhạt bốc lên từ chiếc tủ hồ sơ khóa kín.'
        },
        {
          emotion: 'Căng thẳng noir trinh thám',
          phrase: 'Khói thuốc lá rẻ tiền quẩn quanh cổ áo khoác, lẫn với mùi đất ướt sau cơn mưa đêm.'
        },
        {
          emotion: 'Ấm áp / Chữa lành',
          phrase: 'Hương gừng nướng và vỏ quýt thoang thoảng từ góc bếp xua tan cảm giác buốt giá ngoài hiên.'
        },
        {
          emotion: 'Nguy hiểm rình rập',
          phrase: 'Một thoảng mùi kim loại tanh nồng trộn lẫn hương nước hoa gỗ đàn hương lạc lõng giữa hẻm vắng.'
        },
        {
          emotion: 'Hoài niệm quá khứ',
          phrase: 'Mùi nắng giòn còn vương trên tập vở cũ khiến đầu óc anh bất chợt trôi ngược về mùa hè năm mười bảy tuổi.'
        }
      ]
    },
    TOUCH: {
      id: 'TOUCH',
      title: '✋ Xúc Giác (Nhiệt Độ, Trọng Lượng & Phản Ứng Cơ Thể)',
      moodHint: 'Đưa cảm giác lên thẳng bề mặt da để người đọc cùng rùng mình hoặc ấm lòng.',
      entries: [
        {
          emotion: 'Sốc / Lạnh sống lưng',
          phrase: 'Lớp vải sơ mi sau lưng dán chặt vào da thịt lạnh ngắt bởi giọt mồ hôi vừa tươm ra không báo trước.'
        },
        {
          emotion: 'Cầm cự đau đớn',
          phrase: 'Các đốt ngón tay siết chặt quai túi đến mức gân mu bàn tay nổi hằn, móng tay bấm vào lòng bàn tay rát buốt.'
        },
        {
          emotion: 'Trấn an / Tin tưởng',
          phrase: 'Hơi ấm từ bàn tay đặt khẽ lên mu bàn tay lạnh cóng truyền sang chậm rãi như ngọn nến vừa thắp.'
        },
        {
          emotion: 'Mệt rã rời',
          phrase: 'Hai mi mắt nặng trĩu như đeo chì, từng khớp vai nhức buốt theo mỗi nhịp hít vào.'
        },
        {
          emotion: 'Chấn động tâm lý',
          phrase: 'Mặt sàn dưới gót giày dường như chao nghiêng mất nửa giây khiến đầu gối cô mềm nhũn.'
        }
      ]
    },
    TASTE: {
      id: 'TASTE',
      title: '👅 Vị Giác (Vị Đắng Nội Tâm & Cảm Giác Miệng)',
      moodHint: 'Chi tiết nhỏ nhưng tạo ấn tượng chân thực cực mạnh ở các đoạn độc thoại nội tâm.',
      entries: [
        {
          emotion: 'Cay đắng / Nuốt nhục',
          phrase: 'Đầu lưỡi khô rát, để lại vị đắng nghét của tách cà phê đen nguội lạnh từ hai tiếng trước.'
        },
        {
          emotion: 'Kìm máu / Bị thương',
          phrase: 'Vị mặn chát pha lẫn mùi rỉ sắt tràn nhẹ qua kẽ răng khi cô cắn chặt môi ngăn tiếng rên.'
        },
        {
          emotion: 'Hoảng loạn / Nôn nao',
          phrase: 'Cổ họng nghẹn đắng lại, dạ dày cuộn trào cảm giác lợm giọng khiến anh không thốt nổi một từ.'
        },
        {
          emotion: 'Khoảnh khắc bình yên hiếm hoi',
          phrase: 'Vị ngọt thanh của viên kẹo bạc hà tan dần nơi đầu lưỡi, xoa dịu cơn đau đầu âm ỉ suốt cả chiều.'
        }
      ]
    }
  });

  // ==========================================================================
  // KHO MÓC CÂU KẾT CHƯƠNG (CLIFFHANGER HOOKS) & NGÂN HÀNG TÊN NHÂN VẬT
  // ==========================================================================
  const CLIFFHANGER_HOOK_TEMPLATES = Object.freeze([
    {
      type: 'Tiết lộ danh tính ngược',
      template: 'Ngay khi tờ ảnh cũ rơi xuống mặt bàn, cái tên viết bằng mực đỏ phía sau lại chính là tên của [Nhân vật đáng tin nhất].'
    },
    {
      type: 'Tin nhắn / Cuộc gọi nửa đêm',
      template: 'Màn hình điện thoại sáng bừng giữa bóng tối với dòng tin ngắn vỏn vẹn ba chữ: "Đừng mở cửa."'
    },
    {
      type: 'Sai lệch ký ức / Hiện trường',
      template: 'Hắn chắc chắn mình đã khóa trái chiếc ngăn kéo lúc rời phòng — thế nhưng chiếc chìa khóa đồng lúc này lại nằm ngay trên gối.'
    },
    {
      type: 'Câu hỏi bỏ lửng gây sởn gai ốc',
      template: '- Cậu nghĩ suốt ba năm qua... người đang ngồi nói chuyện với cậu mỗi tối thực sự là ai? (Nhân vật B)'
    },
    {
      type: 'Đếm ngược thời gian gấp',
      template: 'Đồng hồ trên tháp chuông vừa điểm mười hai tiếng, và đúng lúc ấy toàn bộ đèn hành lang đồng loạt tắt phụt.'
    },
    {
      type: 'Sự phản bội bất ngờ',
      template: 'Lưỡi dao không dừng lại ở cổ đối phương, mà quay ngược lại kề sát ngay động mạch của chính người vừa giải cứu cô.'
    }
  ]);

  const CHARACTER_NAME_BANKS = Object.freeze({
    VIETNAMESE_MODERN: {
      label: '🇻🇳 Việt Nam Hiện Đại / Trinh Thám',
      surnames: ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Dương', 'Trịnh', 'Phan'],
      middles: ['Minh', 'Gia', 'Nhật', 'Thảo', 'Hải', 'Thanh', 'Khánh', 'Bảo', 'Ngọc', 'Hoài', 'Đức', 'Phương'],
      givens: ['Khang', 'Lâm', 'Vy', 'Chi', 'An', 'Tú', 'Khoa', 'Nghi', 'Huy', 'Trang', 'Quân', 'Nhi', 'Phúc', 'Mi']
    },
    LIGHT_NOVEL_JP: {
      label: '🇯🇵 Light Novel Nhật Bản',
      surnames: ['Kurosawa', 'Tachibana', 'Shirogane', 'Hoshino', 'Akiyama', 'Kanzaki', 'Mizuhara', 'Fujiwara', 'Kirishima', 'Takahashi'],
      middles: [''],
      givens: ['Ren', 'Akira', 'Sora', 'Yuki', 'Haruto', 'Reina', 'Kaito', 'Shiori', 'Hinako', 'Kazuki', 'Mio', 'Takumi']
    },
    DARK_FANTASY_WEST: {
      label: '🏰 Phương Tây / Fantasy / Gothic',
      surnames: ['Vance', 'Blackwood', 'Thorne', 'Mercer', 'Ashford', 'Ravencroft', 'Valen', 'Sterling', 'Corvus', 'Moreau'],
      middles: [''],
      givens: ['Julian', 'Evelyn', 'Damian', 'Lyra', 'Cassian', 'Clara', 'Victor', 'Seraphina', 'Gideon', 'Iris']
    },
    ANCIENT_EASTERN: {
      label: '🏮 Cổ Phong / Huyền Huyễn',
      surnames: ['Thẩm', 'Lục', 'Mộ', 'Tạ', 'Cố', 'Tiêu', 'Yến', 'Giang', 'Bạch', 'Lăng', 'Sở', 'Vân'],
      middles: [''],
      givens: ['Triệt', 'Thanh Uyển', 'Vô Trần', 'Khinh Ca', 'Yến Từ', 'Tử Mặc', 'Huyền Sương', 'Linh Khê', 'Cảnh Ngôn', 'Trường Uyên']
    }
  });

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

  function getDailyGoalKey() {
    return (
      NS.constants?.STORAGE_KEYS?.DAILY_GOAL || 'noir_v38_daily_word_goal_state'
    );
  }

  function getTodayDateKey() {
    return new Date().toISOString().slice(0, 10);
  }

  // ==========================================================================
  // LỚP 1: THANH THÌ THẦM LORE WHISPER NGẦM THEO THỜI GIAN THỰC KHI VIẾT TAB 1
  // ==========================================================================
  class PassiveLoreWhisperObserver {
    constructor(engine) {
      this.engine = engine;
      this.dismissedUntil = 0;
      this.lastWhisperCharName = '';
      this.debounceTimer = null;
    }

    dismissCurrentBar() {
      const bar = document.getElementById('passive-lore-whisper-bar');
      if (bar) bar.classList.add('hidden');
      // Ẩn tạm 90 giây nếu tác giả chủ động bấm tắt
      this.dismissedUntil = Date.now() + 90000;
    }

    inspectRecentContextAroundCursor(textarea) {
      if (!textarea || Date.now() < this.dismissedUntil) return null;

      const pos = Number(textarea.selectionStart ?? textarea.value.length);
      const lookBack = textarea.value.slice(Math.max(0, pos - 160), pos);
      if (!lookBack.trim()) return null;

      const bible = NS.storyBible;
      const chars = Array.isArray(bible?.characters) ? bible.characters : [];
      if (chars.length === 0) return null;

      const lowerTail = lookBack.toLowerCase();
      let bestChar = null;
      let bestIndex = -1;

      for (const ch of chars) {
        const name = String(ch?.name || '').trim();
        if (name.length < 2) continue;
        const idx = lowerTail.lastIndexOf(name.toLowerCase());
        if (idx > bestIndex) {
          bestIndex = idx;
          bestChar = ch;
        }
      }

      if (!bestChar) return null;

      // Tìm những bí mật nhân vật này CHƯA BIẾT trong Ma trận Ai Biết Gì
      const matrix = Array.isArray(bible?.knowledgeMatrix)
        ? bible.knowledgeMatrix
        : [];
      const blindSpots = matrix
        .filter((k) =>
          String(k.whoDoesNotKnow || '')
            .toLowerCase()
            .includes(bestChar.name.toLowerCase())
        )
        .map((k) => k.secret);

      return {
        character: bestChar,
        blindSpots
      };
    }

    scheduleWhisperCheck() {
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.runWhisperCheckNow();
      }, 420);
    }

    runWhisperCheckNow() {
      const textarea = document.getElementById('textarea-chapter-content');
      const bar = document.getElementById('passive-lore-whisper-bar');
      const contentEl = document.getElementById('passive-lore-whisper-content');
      if (!textarea || !bar || !contentEl) return;

      const hit = this.inspectRecentContextAroundCursor(textarea);
      if (!hit) {
        if (!bar.classList.contains('hidden')) {
          bar.classList.add('hidden');
        }
        return;
      }

      const ch = hit.character;
      const esc = getUtils().escapeHtml;
      const parts = [
        `<span class="px-1.5 py-0.5 rounded bg-teal-500/20 border border-teal-400/40 text-teal-200 font-bold shrink-0">🔮 Gợi nhớ: ${esc(ch.name)}</span>`,
        `<span class="text-zinc-200 truncate"><strong>Vai trò:</strong> ${esc(ch.role || 'NV')}</span>`
      ];

      if (ch.speechStyle) {
        parts.push(
          `<span class="text-teal-200 truncate">· <strong>Thoại:</strong> ${esc(ch.speechStyle)}</span>`
        );
      }

      if (hit.blindSpots.length > 0) {
        parts.push(
          `<span class="text-amber-300 font-semibold truncate">· <strong>⚠️ CHƯA BIẾT:</strong> ${esc(hit.blindSpots[0])}</span>`
        );
      } else if (ch.traits) {
        parts.push(
          `<span class="text-zinc-300 truncate">· ${esc(ch.traits)}</span>`
        );
      }

      contentEl.innerHTML = parts.join(' ');
      bar.classList.remove('hidden');
      this.lastWhisperCharName = ch.name;
    }
  }

  // ==========================================================================
  // LỚP 2: THEO DÕI MỤC TIÊU TỪ HÀNG NGÀY (#daily-goal-progress-pill) & LỊCH SỬ 7 NGÀY
  // ==========================================================================
  class DailyWordGoalAndStreakTracker {
    constructor() {
      this.state = this.loadState();
    }

    createDefaultGoalState() {
      const today = getTodayDateKey();
      return {
        dateKey: today,
        dailyTarget: 2000,
        baselineProjectWords: 0,
        lastObservedProjectWords: 0,
        todayAddedWords: 0,
        weeklyLog: {}
      };
    }

    loadState() {
      const today = getTodayDateKey();
      try {
        const raw = localStorage.getItem(getDailyGoalKey());
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            const def = this.createDefaultGoalState();
            const isSameDay = parsed.dateKey === today;
            const weeklyLog =
              parsed.weeklyLog && typeof parsed.weeklyLog === 'object'
                ? parsed.weeklyLog
                : {};
            return {
              dateKey: today,
              dailyTarget: Math.max(
                100,
                Math.min(50000, Number(parsed.dailyTarget || 2000))
              ),
              baselineProjectWords: isSameDay
                ? Number(parsed.baselineProjectWords || 0)
                : Number(parsed.lastObservedProjectWords || 0),
              lastObservedProjectWords: Number(
                parsed.lastObservedProjectWords || 0
              ),
              todayAddedWords: isSameDay
                ? Math.max(0, Number(parsed.todayAddedWords || 0))
                : 0,
              weeklyLog
            };
          }
        }
      } catch (_) {}
      return this.createDefaultGoalState();
    }

    persistState() {
      try {
        localStorage.setItem(getDailyGoalKey(), JSON.stringify(this.state));
      } catch (_) {}
      if (NS.state) {
        NS.state.dailyWordGoal = { ...this.state };
      }
    }

    computeTotalProjectWordsNow() {
      const chapters = NS.chapterManager?.chapters || NS.state?.chapters || [];
      const activeId =
        NS.chapterManager?.getActiveChapter?.()?.id || NS.state?.activeChapterId;
      const editorVal =
        document.getElementById('textarea-chapter-content')?.value;
      const utils = getUtils();

      if (Array.isArray(chapters) && chapters.length > 0) {
        let sum = 0;
        for (const ch of chapters) {
          if (ch.id === activeId && typeof editorVal === 'string') {
            sum += utils.countVietnameseWords(editorVal);
          } else {
            sum += utils.countVietnameseWords(ch.content || '');
          }
        }
        return sum;
      }

      if (typeof editorVal === 'string') {
        return utils.countVietnameseWords(editorVal);
      }
      return 0;
    }

    updateFromActiveProject() {
      const today = getTodayDateKey();
      const totalNow = this.computeTotalProjectWordsNow();

      if (this.state.dateKey !== today) {
        this.state.dateKey = today;
        this.state.baselineProjectWords = totalNow;
        this.state.todayAddedWords = 0;
      }

      if (
        this.state.baselineProjectWords === 0 &&
        this.state.lastObservedProjectWords === 0 &&
        totalNow > 0
      ) {
        // Lần khởi tạo đầu tiên trong ngày khi mở dự án sẵn -> đặt mốc hiện tại để chỉ đếm từ viết mới
        this.state.baselineProjectWords = totalNow;
      }

      const deltaSinceLast = totalNow - this.state.lastObservedProjectWords;
      if (deltaSinceLast > 0 && this.state.lastObservedProjectWords > 0) {
        this.state.todayAddedWords += deltaSinceLast;
      } else if (totalNow > this.state.baselineProjectWords) {
        const net = totalNow - this.state.baselineProjectWords;
        if (net > this.state.todayAddedWords) {
          this.state.todayAddedWords = net;
        }
      }

      this.state.lastObservedProjectWords = totalNow;
      this.state.weeklyLog[today] = this.state.todayAddedWords;

      // Giữ lịch sử tối đa 30 ngày gần nhất
      const keys = Object.keys(this.state.weeklyLog).sort();
      while (keys.length > 30) {
        const oldest = keys.shift();
        if (oldest) delete this.state.weeklyLog[oldest];
      }

      this.persistState();
      this.renderPillUI();
      return { ...this.state };
    }

    setDailyTarget(newTarget) {
      const safe = Math.max(
        100,
        Math.min(50000, parseInt(newTarget, 10) || 2000)
      );
      this.state.dailyTarget = safe;
      this.persistState();
      this.renderPillUI();
      return safe;
    }

    renderPillUI() {
      const pill = document.getElementById('daily-goal-progress-pill');
      if (!pill) return;

      const added = Number(this.state.todayAddedWords || 0);
      const target = Math.max(100, Number(this.state.dailyTarget || 2000));
      const pct = Math.min(100, Math.round((added / target) * 100));

      pill.textContent = `🎯 ${added.toLocaleString('vi-VN')} / ${target.toLocaleString('vi-VN')} từ hôm nay (${pct}%)`;
      if (added >= target) {
        pill.className =
          'hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-400 text-amber-300 font-monoCode font-bold text-[10px] cursor-pointer';
      } else {
        pill.className =
          'hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-monoCode font-bold text-[10px] cursor-pointer';
      }
    }
  }

  // ==========================================================================
  // LỚP 3: KHO LỜI TÁC GIẢ ĐẦU/CUỐI CHƯƠNG KIỂU WEB NOVEL & MÁY SINH TÊN
  // ==========================================================================
  class ChapterAuthorNotesAndNameStudio {
    constructor() {
      this.notesByChapterId = this.loadAllNotes();
    }

    loadAllNotes() {
      try {
        const raw = localStorage.getItem(AUTHOR_NOTES_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') return parsed;
        }
      } catch (_) {}
      return {};
    }

    persistNotes() {
      try {
        localStorage.setItem(
          AUTHOR_NOTES_STORAGE_KEY,
          JSON.stringify(this.notesByChapterId)
        );
      } catch (_) {}
    }

    getNotesForChapter(chapterId) {
      if (!chapterId) return { preNote: '', postNote: '' };
      return (
        this.notesByChapterId[chapterId] || { preNote: '', postNote: '' }
      );
    }

    saveNotesForChapter(chapterId, preNote, postNote) {
      if (!chapterId) return false;
      this.notesByChapterId[chapterId] = {
        preNote: String(preNote || '').trim(),
        postNote: String(postNote || '').trim(),
        updatedAt: Date.now()
      };
      this.persistNotes();
      if (NS.bus && typeof NS.bus.emit === 'function') {
        NS.bus.emit('author_notes:saved', { chapterId });
      }
      return true;
    }

    generateRandomNamesBatch(bankKey = 'VIETNAMESE_MODERN', count = 6) {
      const bank =
        CHARACTER_NAME_BANKS[bankKey] ||
        CHARACTER_NAME_BANKS.VIETNAMESE_MODERN;
      const picked = new Set();
      let safetyLoop = 0;

      while (picked.size < count && safetyLoop < 60) {
        safetyLoop += 1;
        const sur =
          bank.surnames[Math.floor(Math.random() * bank.surnames.length)];
        const mid =
          bank.middles[Math.floor(Math.random() * bank.middles.length)];
        const giv = bank.givens[Math.floor(Math.random() * bank.givens.length)];
        const fullName = [sur, mid, giv].filter(Boolean).join(' ');
        picked.add(fullName);
      }
      return Array.from(picked);
    }
  }

  // ==========================================================================
  // LỚP 4: TRÌNH VẼ CỬA SỔ TỪ ĐIỂN NGŨ QUAN, LỜI TÁC GIẢ & CÔNG CỤ WEB NOVEL
  // ==========================================================================
  class SensoryAndWebNovelModalRenderer {
    constructor(engine) {
      this.engine = engine;
      this.activeModalTab = 'SENSORY'; // 'SENSORY' | 'AUTHOR_NOTES' | 'HOOKS_NAMES'
      this.activeSenseKey = 'SIGHT';
      this.searchFilter = '';
    }

    renderModalBody() {
      const bodyEl = document.getElementById('sensory-and-author-notes-body');
      if (!bodyEl) return;
      const esc = getUtils().escapeHtml;

      const tabNav = [
        '<div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-800">',
        '  <div class="flex flex-wrap gap-1.5">',
        this.buildTabBtnHtml('SENSORY', '✨ 1. Từ Điển Ngũ Quan (Show-Don\'t-Tell)'),
        this.buildTabBtnHtml('AUTHOR_NOTES', '💌 2. Lời Tác Giả Đầu/Cuối Chương'),
        this.buildTabBtnHtml('HOOKS_NAMES', '🪝 3. Móc Câu Kết Chương, Tên NV & KPI'),
        '  </div>',
        '  <span class="text-[10px] text-teal-300 font-semibold">Bấm chèn 1 chạm thẳng vào vị trí con trỏ Tab 1</span>',
        '</div>'
      ].join('\n');

      let panelHtml = '';
      if (this.activeModalTab === 'SENSORY') {
        panelHtml = this.buildSensoryPanelHtml();
      } else if (this.activeModalTab === 'AUTHOR_NOTES') {
        panelHtml = this.buildAuthorNotesPanelHtml();
      } else {
        panelHtml = this.buildHooksAndNamesPanelHtml();
      }

      bodyEl.innerHTML = `${tabNav}\n<div class="pt-3 space-y-4">${panelHtml}</div>`;
      this.bindRenderedModalEvents(bodyEl);
    }

    buildTabBtnHtml(key, label) {
      const esc = getUtils().escapeHtml;
      const isActive = this.activeModalTab === key;
      const cls = isActive
        ? 'bg-teal-600 text-white border-teal-400 shadow'
        : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-teal-500/50';
      return `<button type="button" data-webnovel-modal-tab="${esc(
        key
      )}" class="px-3 py-1.5 rounded-xl border font-bold text-xs transition ${cls}">${esc(
        label
      )}</button>`;
    }

    buildSensoryPanelHtml() {
      const esc = getUtils().escapeHtml;
      const senseKeys = Object.keys(FIVE_SENSES_LITERARY_THESAURUS);
      const currentSense =
        FIVE_SENSES_LITERARY_THESAURUS[this.activeSenseKey] ||
        FIVE_SENSES_LITERARY_THESAURUS.SIGHT;

      const filterLow = this.searchFilter.trim().toLowerCase();
      let matchingEntries = [];
      if (filterLow) {
        for (const sk of senseKeys) {
          const cat = FIVE_SENSES_LITERARY_THESAURUS[sk];
          for (const entry of cat.entries) {
            if (
              entry.emotion.toLowerCase().includes(filterLow) ||
              entry.phrase.toLowerCase().includes(filterLow)
            ) {
              matchingEntries.push({ ...entry, catTitle: cat.title });
            }
          }
        }
      } else {
        matchingEntries = currentSense.entries.map((e) => ({
          ...e,
          catTitle: currentSense.title
        }));
      }

      return [
        '<div class="flex flex-wrap items-center justify-between gap-2">',
        '  <div class="flex flex-wrap gap-1.5">',
        ...senseKeys.map((sk) => {
          const cat = FIVE_SENSES_LITERARY_THESAURUS[sk];
          const isSel = sk === this.activeSenseKey && !filterLow;
          const cls = isSel
            ? 'bg-emerald-600/25 border-emerald-400 text-emerald-200'
            : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-emerald-500/40';
          return `<button type="button" data-sense-key="${esc(
            sk
          )}" class="px-2.5 py-1 rounded-lg border font-bold text-[11px] transition ${cls}">${esc(
            cat.title.split(' (')[0]
          )}</button>`;
        }),
        '  </div>',
        `  <input id="input-sensory-search" type="text" value="${esc(
          this.searchFilter
        )}" placeholder="Tìm cảm xúc (căng thẳng, mưa, sợ, khói...)" class="px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-950 text-xs min-w-[230px] select-text" />`,
        '</div>',
        `<div class="text-[11px] text-zinc-400 italic">${esc(currentSense.moodHint)}</div>`,
        matchingEntries.length === 0
          ? '<div class="p-4 text-center text-zinc-500 italic">Không tìm thấy mẫu miêu tả nào khớp từ khóa.</div>'
          : `<div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">${matchingEntries
              .map(
                (item) =>
                  `<div class="p-3 rounded-xl border border-zinc-800 bg-zinc-950/90 hover:border-teal-500/50 space-y-2 transition">` +
                  `  <div class="flex items-center justify-between gap-2">` +
                  `    <span class="px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 font-bold text-[10px]">${esc(
                    item.emotion
                  )}</span>` +
                  `    <button type="button" data-insert-sensory-phrase="${esc(
                    item.phrase
                  )}" class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shrink-0">↳ Chèn vào bản thảo</button>` +
                  `  </div>` +
                  `  <p class="text-xs text-zinc-200 leading-relaxed select-text">“${esc(
                    item.phrase
                  )}”</p>` +
                  `</div>`
              )
              .join('')}</div>`
      ].join('\n');
    }

    buildAuthorNotesPanelHtml() {
      const esc = getUtils().escapeHtml;
      const chap = NS.chapterManager?.getActiveChapter?.();
      const chapId = chap?.id || NS.state?.activeChapterId || 'default_chap';
      const chapTitle = chap?.displayTitle || chap?.title || 'Chương hiện tại';
      const notes = this.engine.notesAndNames.getNotesForChapter(chapId);

      return [
        `<div class="p-3 rounded-xl border border-teal-500/30 bg-teal-950/30 text-teal-200 text-xs">Đang biên tập Lời Tác Giả cho: <strong>${esc(
          chapTitle
        )}</strong>. Ghi chú này lưu riêng theo từng chương giống hệt nền tảng WebNovel / Syosetu.</div>`,
        '<div class="space-y-2">',
        '  <label class="block font-bold text-amber-300 uppercase text-[11px]">🌅 Lời Tác Giả Đầu Chương (Tóm tắt nhẹ hoặc gửi gắm độc giả):</label>',
        `  <textarea id="textarea-webnovel-prenote" data-note-chap-id="${esc(
          chapId
        )}" rows="3" placeholder="Ví dụ: Chúc mọi người đọc chương mới vui vẻ! Chương này đánh dấu bước ngoặt tâm lý quan trọng..." class="w-full p-3 rounded-xl border border-zinc-700 bg-zinc-950 text-xs select-text">${esc(
          notes.preNote
        )}</textarea>`,
        '</div>',
        '<div class="space-y-2">',
        '  <label class="block font-bold text-emerald-300 uppercase text-[11px]">🌇 Lời Tác Giả Cuối Chương (Thả thính chương sau / Hỏi ý kiến độc giả):</label>',
        `  <textarea id="textarea-webnovel-postnote" rows="3" placeholder="Ví dụ: Theo các bạn, ai là người đã gửi bức thư ở cuối cảnh? Hẹn gặp lại vào tối mai nhé!" class="w-full p-3 rounded-xl border border-zinc-700 bg-zinc-950 text-xs select-text">${esc(
          notes.postNote
        )}</textarea>`,
        '</div>',
        '<div class="flex flex-wrap items-center justify-end gap-2">',
        '  <button type="button" id="btn-save-webnovel-author-notes" class="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs shadow">💾 Lưu Lời Tác Giả Cho Chương Này</button>',
        '</div>'
      ].join('\n');
    }

    buildHooksAndNamesPanelHtml() {
      const esc = getUtils().escapeHtml;
      const goalSt = this.engine.goalTracker.state;
      const namesSample = this.engine.notesAndNames.generateRandomNamesBatch(
        this.activeNameBank || 'VIETNAMESE_MODERN',
        6
      );

      const bankOptions = Object.entries(CHARACTER_NAME_BANKS)
        .map(
          ([k, v]) =>
            `<option value="${esc(k)}" ${
              (this.activeNameBank || 'VIETNAMESE_MODERN') === k ? 'selected' : ''
            }>${esc(v.label)}</option>`
        )
        .join('');

      return [
        // 1. Khối đặt KPI từ hàng ngày
        '<div class="p-3.5 rounded-2xl border border-emerald-500/35 bg-zinc-950/90 space-y-2">',
        '  <div class="font-extrabold text-emerald-300 uppercase text-xs">🎯 Mục Tiêu Sản Lượng Viết Hôm Nay & Tiến Độ 7 Ngày</div>',
        '  <div class="flex flex-wrap items-center gap-3">',
        `    <span class="text-xs text-zinc-200">Đã viết hôm nay: <strong class="text-emerald-400">${goalSt.todayAddedWords.toLocaleString(
          'vi-VN'
        )}</strong> từ</span>`,
        '    <div class="flex items-center gap-1.5">',
        '      <label class="text-[11px] text-zinc-400">Mục tiêu/ngày:</label>',
        `      <input id="input-webnovel-daily-target" type="number" min="100" max="50000" step="100" value="${goalSt.dailyTarget}" class="w-24 px-2.5 py-1 rounded-lg border border-zinc-700 bg-zinc-900 font-monoCode font-bold text-emerald-300" />`,
        '      <button type="button" id="btn-apply-daily-goal" class="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold">Cập nhật KPI</button>',
        '    </div>',
        '  </div>',
        '</div>',
        // 2. Kho móc câu Cliffhanger
        '<div class="p-3.5 rounded-2xl border border-indigo-500/35 bg-zinc-950/90 space-y-2">',
        '  <div class="font-extrabold text-indigo-300 uppercase text-xs">🪝 Kho Móc Câu Kết Chương (Cliffhanger Hooks Hút Bạn Đọc)</div>',
        '  <div class="grid grid-cols-1 md:grid-cols-2 gap-2">',
        ...CLIFFHANGER_HOOK_TEMPLATES.map(
          (hk) =>
            `<div class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 space-y-1.5">` +
            `  <div class="flex items-center justify-between gap-2">` +
            `    <span class="text-[10px] font-bold text-indigo-300">${esc(
              hk.type
            )}</span>` +
            `    <button type="button" data-insert-sensory-phrase="${esc(
              hk.template
            )}" class="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px]">Chèn kết chương</button>` +
            `  </div>` +
            `  <div class="text-[11px] text-zinc-300 leading-snug">${esc(
              hk.template
            )}</div>` +
            `</div>`
        ),
        '  </div>',
        '</div>',
        // 3. Máy sinh tên nhân vật đa văn hóa
        '<div class="p-3.5 rounded-2xl border border-amber-500/35 bg-zinc-950/90 space-y-2">',
        '  <div class="flex flex-wrap items-center justify-between gap-2">',
        '    <span class="font-extrabold text-amber-300 uppercase text-xs">🎭 Máy Sinh Tên Nhân Vật Tức Thì</span>',
        '    <div class="flex items-center gap-2">',
        `      <select id="select-webnovel-name-bank" class="px-2.5 py-1 rounded-lg border border-zinc-700 bg-zinc-900 text-amber-200 font-bold text-[11px]">${bankOptions}</select>`,
        '      <button type="button" id="btn-roll-new-names" class="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px]">🎲 Đổi lô tên khác</button>',
        '    </div>',
        '  </div>',
        `  <div id="webnovel-generated-names-row" class="flex flex-wrap gap-1.5">${namesSample
          .map(
            (name) =>
              `<button type="button" data-insert-sensory-phrase="${esc(
                name
              )}" class="px-2.5 py-1 rounded-lg border border-amber-500/30 bg-zinc-900 hover:bg-amber-500/20 text-amber-200 font-semibold text-xs">${esc(
                name
              )}</button>`
          )
          .join('')}</div>`,
        '</div>'
      ].join('\n');
    }

    bindRenderedModalEvents(bodyEl) {
      bodyEl.querySelectorAll('[data-webnovel-modal-tab]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.activeModalTab = btn.getAttribute('data-webnovel-modal-tab');
          this.renderModalBody();
        });
      });

      bodyEl.querySelectorAll('[data-sense-key]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.activeSenseKey = btn.getAttribute('data-sense-key');
          this.searchFilter = '';
          this.renderModalBody();
        });
      });

      const searchEl = bodyEl.querySelector('#input-sensory-search');
      if (searchEl) {
        searchEl.addEventListener('input', (ev) => {
          this.searchFilter = ev.target?.value || '';
          const pos = searchEl.selectionStart || 0;
          this.renderModalBody();
          const fresh = document.getElementById('input-sensory-search');
          if (fresh) {
            fresh.focus();
            fresh.setSelectionRange(pos, pos);
          }
        });
      }

      bodyEl.querySelectorAll('[data-insert-sensory-phrase]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const phrase = btn.getAttribute('data-insert-sensory-phrase');
          this.engine.insertPhraseIntoManuscriptAtCursor(phrase);
        });
      });

      const saveNotesBtn = bodyEl.querySelector('#btn-save-webnovel-author-notes');
      if (saveNotesBtn) {
        saveNotesBtn.addEventListener('click', () => {
          const preEl = document.getElementById('textarea-webnovel-prenote');
          const postEl = document.getElementById('textarea-webnovel-postnote');
          const chapId = preEl?.getAttribute('data-note-chap-id') || 'default_chap';
          this.engine.notesAndNames.saveNotesForChapter(
            chapId,
            preEl?.value || '',
            postEl?.value || ''
          );
          getUtils().showToast(
            '💌 Đã lưu Lời Tác Giả Đầu/Cuối Chương thành công!',
            'success'
          );
        });
      }

      const applyGoalBtn = bodyEl.querySelector('#btn-apply-daily-goal');
      if (applyGoalBtn) {
        applyGoalBtn.addEventListener('click', () => {
          const inp = document.getElementById('input-webnovel-daily-target');
          const savedTarget = this.engine.goalTracker.setDailyTarget(
            inp ? inp.value : 2000
          );
          getUtils().showToast(
            `🎯 Đã đặt mục tiêu mới: ${savedTarget.toLocaleString('vi-VN')} từ/ngày!`,
            'success'
          );
        });
      }

      const bankSelect = bodyEl.querySelector('#select-webnovel-name-bank');
      if (bankSelect) {
        bankSelect.addEventListener('change', (ev) => {
          this.activeNameBank = ev.target?.value || 'VIETNAMESE_MODERN';
          this.renderModalBody();
        });
      }

      const rollBtn = bodyEl.querySelector('#btn-roll-new-names');
      if (rollBtn) {
        rollBtn.addEventListener('click', () => {
          this.renderModalBody();
        });
      }
    }
  }

  // ==========================================================================
  // LỚP 5: BỘ PHÂN TÍCH TỈ LỆ NGŨ QUAN, CHUYỂN ĐỊNH DẠNG WEB NOVEL & PHÚT ĐỌC
  // ==========================================================================
  const SENSORY_DETECTION_LEXICON = Object.freeze({
    SIGHT: ['ánh sáng', 'bóng tối', 'màu', 'vệt', 'phản chiếu', 'lờ mờ', 'rực', 'nhòe', 'sáng', 'tối'],
    HEARING: ['tiếng', 'âm thanh', 'thì thầm', 'vang', 'lách tách', 'lộp bộp', 'rít', 'im bặt', 'hơi thở'],
    SMELL: ['mùi', 'hương', 'khói', 'ẩm mốc', 'tanh', 'nồng', 'thơm'],
    TOUCH: ['lạnh', 'nóng', 'buốt', 'rát', 'siết', 'run', 'nhám', 'trơn', 'nặng'],
    TASTE: ['đắng', 'mặn', 'chát', 'ngọt', 'lợ', 'khô khốc']
  });

  const WEBNOVEL_DIALOGUE_MICRO_ACTIONS = Object.freeze([
    {
      mood: 'Do dự / Giấu giếm',
      beat: 'Ngón tay cái khẽ miết dọc viền chiếc bật lửa bạc rồi mới chịu lên tiếng.'
    },
    {
      mood: 'Châm biếm / Lạnh nhạt',
      beat: 'Hắn không nhìn đối phương mà chỉ chăm chú chỉnh lại gấu tay áo.'
    },
    {
      mood: 'Sốc / Đứng hình',
      beat: 'Đôi môi khẽ hé nhưng không bật ra âm thanh nào trong suốt hai nhịp thở.'
    },
    {
      mood: 'Cố giữ bình tĩnh',
      beat: 'Cô hít một hơi thật chậm qua mũi, vai hạ xuống vài milimet như vừa tháo một chiếc mặt nạ.'
    }
  ]);

  class WebNovelCraftMetricsAndFormatConverter {
    auditFiveSensesDensityInChapter(text) {
      const lower = String(text || '').toLowerCase();
      const counts = {};
      let totalHits = 0;

      for (const [senseKey, words] of Object.entries(SENSORY_DETECTION_LEXICON)) {
        let hitCount = 0;
        for (const w of words) {
          const idxList = lower.split(w).length - 1;
          hitCount += Math.max(0, idxList);
        }
        counts[senseKey] = hitCount;
        totalHits += hitCount;
      }

      const activeSensesCount = Object.values(counts).filter((c) => c > 0).length;
      const missingSenses = Object.keys(counts).filter((k) => counts[k] === 0);

      return {
        counts,
        totalHits,
        activeSensesCount,
        missingSenses,
        advice:
          activeSensesCount <= 2
            ? `Chương mới chỉ chạm ${activeSensesCount}/5 giác quan. Hãy mở Từ điển Ngũ Quan bổ sung thêm chi tiết về mùi vị hoặc âm thanh để cảnh sống động gấp đôi!`
            : `Độ phủ giác quan tốt (${activeSensesCount}/5 giác quan xuất hiện tự nhiên).`
      };
    }

    formatForWebNovelPlatformExport(rawChapterText, chapterObj = {}, notes = null) {
      const cleanBody = String(rawChapterText || '').trim();
      const lines = [];
      if (chapterObj.displayTitle || chapterObj.title) {
        lines.push(`【${chapterObj.displayTitle || chapterObj.title}】`);
        lines.push('');
      }
      if (notes?.preNote) {
        lines.push(`✎ Lời tác giả đầu chương: ${notes.preNote}`);
        lines.push('---');
        lines.push('');
      }
      lines.push(cleanBody);
      if (notes?.postNote) {
        lines.push('');
        lines.push('---');
        lines.push(`💬 Lời tác giả cuối chương: ${notes.postNote}`);
      }
      return lines.join('\n');
    }

    computeSerialPublicationReadiness(chapters = []) {
      const utils = getUtils();
      const wordCounts = chapters.map((ch) =>
        utils.countVietnameseWords(ch.content || '')
      );
      const totalWords = wordCounts.reduce((s, n) => s + n, 0);
      const bufferChaptersCount = chapters.filter(
        (c) => c.status === 'APPROVED'
      ).length;
      const weeklySlotsAt3PerWeek = Math.floor(bufferChaptersCount / 3);

      return {
        totalChapters: chapters.length,
        approvedBufferChapters: bufferChaptersCount,
        estimatedWeeksOfBuffer: weeklySlotsAt3PerWeek,
        totalWords,
        advice:
          bufferChaptersCount < 5
            ? 'Nên tích trữ thêm ít nhất 5 chương Đã Duyệt làm kho dự trữ (Backlog) trước khi đăng định kỳ.'
            : `Kho dự trữ an toàn: đủ đăng đều 3 chương/tuần trong khoảng ${weeklySlotsAt3PerWeek} tuần liên tiếp!`
      };
    }
  }

  // ==========================================================================
  // LỚP 6: ĐỘNG CƠ TỔNG HỢP TÍNH NĂNG WEB NOVEL (`NoirStudio.webNovelFeatures`)
  // ==========================================================================
  class WebNovelSecretFeaturesEngine {
    constructor() {
      this.loreWhisper = new PassiveLoreWhisperObserver(this);
      this.goalTracker = new DailyWordGoalAndStreakTracker();
      this.notesAndNames = new ChapterAuthorNotesAndNameStudio();
      this.modalRenderer = new SensoryAndWebNovelModalRenderer(this);
      this.craftMetrics = new WebNovelCraftMetricsAndFormatConverter();
      this.hasInitialized = false;
    }

    init() {
      this.updateDailyGoalFromActiveProject();
      this.bindDOM();
      this.hasInitialized = true;
      return this;
    }

    /**
     * Được `mod09` (`autoSaver`) gọi mỗi lần đồng bộ lưu chữ.
     */
    updateDailyGoalFromActiveProject() {
      return this.goalTracker.updateFromActiveProject();
    }

    openSensoryAndAuthorNotesModal(initialTab = 'SENSORY') {
      const modal = document.getElementById('modal-sensory-and-author-notes');
      if (!modal) return false;
      this.modalRenderer.activeModalTab = initialTab;
      this.modalRenderer.renderModalBody();
      this.appendLiveSensoryAuditBanner();
      modal.classList.remove('hidden');
      return true;
    }

    appendLiveSensoryAuditBanner() {
      const body = document.getElementById('sensory-and-author-notes-body');
      if (!body || this.modalRenderer.activeModalTab !== 'SENSORY') return;
      const text =
        document.getElementById('textarea-chapter-content')?.value || '';
      const audit = this.craftMetrics.auditFiveSensesDensityInChapter(text);
      const esc = getUtils().escapeHtml;

      const banner = document.createElement('div');
      banner.className =
        'p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/25 flex flex-wrap items-center justify-between gap-2 text-[11px] text-emerald-200';
      banner.innerHTML = [
        `<span>📡 Cảm biến 5 giác quan chương đang viết: <strong>${audit.activeSensesCount}/5</strong> (${audit.totalHits} từ khóa giác quan)</span>`,
        `<span class="text-zinc-300 text-[10px]">${esc(audit.advice)}</span>`
      ].join('');
      body.appendChild(banner);
    }

    closeSensoryAndAuthorNotesModal() {
      const modal = document.getElementById('modal-sensory-and-author-notes');
      if (modal) modal.classList.add('hidden');
    }

    insertPhraseIntoManuscriptAtCursor(phrase) {
      const editor = document.getElementById('textarea-chapter-content');
      const clean = String(phrase || '').trim();
      if (!editor || !clean) return false;

      if (NS.autoSaver && typeof NS.autoSaver.pushUndoSnapshot === 'function') {
        NS.autoSaver.pushUndoSnapshot(
          editor.value,
          'Trước khi chèn mẫu từ Điển Ngũ Quan'
        );
      }

      const start = Number(editor.selectionStart ?? editor.value.length);
      const end = Number(editor.selectionEnd ?? editor.value.length);
      const needsSpaceBefore =
        start > 0 && !/[\s\n(]$/.test(editor.value.slice(0, start));
      const inserted = `${needsSpaceBefore ? ' ' : ''}${clean}`;

      editor.value =
        editor.value.slice(0, start) + inserted + editor.value.slice(end);
      const caretEnd = start + inserted.length;
      editor.focus();
      editor.setSelectionRange(caretEnd, caretEnd);

      if (NS.editorTools && typeof NS.editorTools.notifyEditorMutated === 'function') {
        NS.editorTools.notifyEditorMutated('SENSORY_PHRASE_INSERT');
      } else if (
        NS.chapterManager &&
        typeof NS.chapterManager.syncEditorToActiveChapter === 'function'
      ) {
        NS.chapterManager.syncEditorToActiveChapter();
      }

      this.closeSensoryAndAuthorNotesModal();
      getUtils().showToast('✨ Đã chèn cụm miêu tả vào bản thảo!', 'success', 2200);
      return true;
    }

    getFormattedChapterWithAuthorNotes(chapterId) {
      const chap =
        NS.chapterManager?.getChapterById?.(chapterId) ||
        NS.chapterManager?.getActiveChapter?.();
      if (!chap) return '';
      const notes = this.notesAndNames.getNotesForChapter(chap.id);
      return this.craftMetrics.formatForWebNovelPlatformExport(
        chap.content || '',
        chap,
        notes
      );
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
        'btn-open-sensory-assistant',
        'click',
        () => this.openSensoryAndAuthorNotesModal('SENSORY'),
        'mod25_open_sensory_modal'
      );

      bindOnce(
        'btn-close-sensory-modal',
        'click',
        () => this.closeSensoryAndAuthorNotesModal(),
        'mod25_close_sensory_modal'
      );

      bindOnce(
        'daily-goal-progress-pill',
        'click',
        () => this.openSensoryAndAuthorNotesModal('HOOKS_NAMES'),
        'mod25_daily_goal_pill_click'
      );

      bindOnce(
        'btn-dismiss-lore-whisper',
        'click',
        () => this.loreWhisper.dismissCurrentBar(),
        'mod25_dismiss_lore_whisper'
      );

      bindOnce(
        'textarea-chapter-content',
        'input',
        () => {
          this.loreWhisper.scheduleWhisperCheck();
          this.updateDailyGoalFromActiveProject();
        },
        'mod25_editor_lore_and_goal_input'
      );

      bindOnce(
        'textarea-chapter-content',
        'click',
        () => {
          this.loreWhisper.scheduleWhisperCheck();
        },
        'mod25_editor_click_lore_check'
      );
    }

    getHealthReport() {
      const chapters = NS.chapterManager?.chapters || NS.state?.chapters || [];
      return {
        module: 'mod25_webnovel_secret_features_and_lore_whisper.js',
        initialized: this.hasInitialized,
        dailyGoal: { ...this.goalTracker.state },
        authorNotesCount: Object.keys(this.notesAndNames.notesByChapterId).length,
        publicationReadiness:
          this.craftMetrics.computeSerialPublicationReadiness(chapters),
        dialogueMicroActionsAvailable: WEBNOVEL_DIALOGUE_MICRO_ACTIONS.length
      };
    }
  }

  // ==========================================================================
  // LỚP 7: BỘ ĐO TÍNH KỊCH TÍNH HÌNH ĐỒ SÓNG (DRAMATIC TENSION ARC STUDIO)
  // ==========================================================================
  const CHAPTER_OUTLINE_TEMPLATES = Object.freeze([
    {
      id: 'kishotenketsu',
      name: '🌸 Khởi - Thừa - Chuyển - Hợp (4 Hồi Light Novel Cổ Điển)',
      beats: [
        '1. Khởi (Ki): Thiết lập bối cảnh & trạng thái sinh hoạt thường nhật có vết nứt nhẹ.',
        '2. Thừa (Sho): Nhân vật theo đuổi mục tiêu nhỏ, tương tác phát triển quan hệ/manh mối.',
        '3. Chuyển (Ten): Cú ngoặt bất ngờ đảo ngược tình thế hoặc bóc trần thông tin sai lệch.',
        '4. Hợp (Ketsu): Hệ quả tâm lý mới + câu móc mở sang chương tiếp theo.'
      ]
    },
    {
      id: 'thriller_hook_cycle',
      name: '🔪 Vòng Xoáy Nghi Ngờ (Trinh Thám / Tâm Lý Dark Noir)',
      beats: [
        '1. Hiện trường / Câu hỏi mồi: Mở đầu bằng một nghịch lý vật lý hoặc lời nói dối rõ ràng.',
        '2. Truy vết áp lực: Nhân vật đi thu thập chứng cứ dưới đồng hồ đếm ngược.',
        '3. Ngõ cụt giả tạo: Mọi giả thuyết ban đầu sụp đổ vì bằng chứng mới xuất hiện.',
        '4. Cú lật cuối chương: Phát hiện đối thủ đang ở gần hơn tưởng tượng rất nhiều.'
      ]
    },
    {
      id: 'emotional_payoff',
      name: '💧 Cao Trào Nội Tâm & Chữa Lành (Character Drama)',
      beats: [
        '1. Rào cản im lặng: Hai nhân vật tránh né vấn đề cốt lõi bằng chuyện tầm phào.',
        '2. Va chạm vô tình: Một đồ vật hoặc câu nói lỡ miệng khơi lại vết thương cũ.',
        '3. Bộc lộ thật lòng: Phá vỡ lớp mặt nạ phòng vệ qua hành động cụ thể thay vì sến súa.',
        '4. Khoảng lắng đổi thay: Không giải quyết hết mọi thứ nhưng ánh nhìn đã khác xưa.'
      ]
    }
  ]);

  class WebNovelMicroBeatAndWeeklyPlanner {
    constructor(engine) {
      this.engine = engine;
    }

    getAvailableOutlineStructures() {
      return CHAPTER_OUTLINE_TEMPLATES.map((t) => ({ ...t }));
    }

    build7DayGoalHistoryBarsHtml() {
      const log = this.engine.goalTracker.state.weeklyLog || {};
      const target = Math.max(100, this.engine.goalTracker.state.dailyTarget || 2000);
      const esc = getUtils().escapeHtml;
      const days = [];

      for (let i = 6; i >= 0; i -= 1) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const words = Number(log[key] || 0);
        const pct = Math.min(100, Math.max(6, Math.round((words / target) * 100)));
        const reached = words >= target;
        days.push({
          key,
          dayLabel: d.toLocaleDateString('vi-VN', { weekday: 'short' }),
          words,
          pct,
          reached
        });
      }

      return [
        '<div class="pt-2 border-t border-zinc-800 space-y-1.5">',
        '  <div class="text-[10px] font-bold uppercase text-zinc-400">📅 Lịch sử đạt KPI viết 7 ngày qua:</div>',
        '  <div class="grid grid-cols-7 gap-1.5">',
        ...days.map(
          (d) =>
            `<div class="p-1.5 rounded-lg border ${
              d.reached
                ? 'border-amber-400/50 bg-amber-950/30'
                : 'border-zinc-800 bg-zinc-900'
            } text-center space-y-1" title="${esc(d.key)}: ${d.words} từ">` +
            `  <div class="h-10 flex items-end justify-center"><div class="w-full max-w-[18px] rounded-t ${
              d.reached ? 'bg-amber-400' : 'bg-emerald-500'
            }" style="height: ${d.pct}%;"></div></div>` +
            `  <div class="text-[9px] font-bold text-zinc-300">${esc(d.dayLabel)}</div>` +
            `  <div class="text-[9px] font-monoCode text-zinc-400">${d.words}</div>` +
            '</div>'
        ),
        '  </div>',
        '</div>'
      ].join('\n');
    }

    buildDialogueMicroActionsHtml() {
      const esc = getUtils().escapeHtml;
      return [
        '<div class="p-3.5 rounded-2xl border border-teal-500/30 bg-zinc-950/90 space-y-2">',
        '  <div class="font-extrabold text-teal-300 uppercase text-xs">🎬 Hành Động Nhỏ Giữa Hai Câu Thoại (Chống "Đầu Biết Nói Trong Khoảng Trống")</div>',
        '  <div class="grid grid-cols-1 md:grid-cols-2 gap-2">',
        ...WEBNOVEL_DIALOGUE_MICRO_ACTIONS.map(
          (ma) =>
            `<div class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 space-y-1">` +
            `  <div class="flex items-center justify-between gap-2">` +
            `    <span class="text-[10px] font-bold text-teal-300">${esc(ma.mood)}</span>` +
            `    <button type="button" data-insert-sensory-phrase="${esc(ma.beat)}" class="px-2 py-0.5 rounded bg-teal-600 hover:bg-teal-500 text-white font-bold text-[10px]">Chèn mẫu</button>` +
            `  </div>` +
            `  <div class="text-[11px] text-zinc-300">${esc(ma.beat)}</div>` +
            `</div>`
        ),
        '  </div>',
        '</div>'
      ].join('\n');
    }
  }

  // Nối thêm khung 7-ngày KPI & Hành động giữa hai câu thoại vào Modal WebNovel
  const origRenderWebNovelModal =
    SensoryAndWebNovelModalRenderer.prototype.renderModalBody;
  SensoryAndWebNovelModalRenderer.prototype.renderModalBody = function () {
    origRenderWebNovelModal.call(this);
    const bodyEl = document.getElementById('sensory-and-author-notes-body');
    if (!bodyEl || !this.engine.microBeatPlanner) return;

    if (this.activeModalTab === 'HOOKS_NAMES') {
      const extraWrap = document.createElement('div');
      extraWrap.className = 'space-y-3';
      extraWrap.innerHTML = [
        this.engine.microBeatPlanner.build7DayGoalHistoryBarsHtml(),
        this.engine.microBeatPlanner.buildDialogueMicroActionsHtml()
      ].join('\n');
      bodyEl.appendChild(extraWrap);
      this.bindRenderedModalEvents(extraWrap);
    }
  };

  // ==========================================================================
  // LỚP 8: BỘ KIỂM TRA SẴN SÀNG XUẤT BẢN WEB NOVEL & KHO CHI TIẾT KHÔNG GIAN/THỜI TIẾT
  // ==========================================================================
  const WEATHER_AND_NOIR_ATMOSPHERE_CUES = Object.freeze([
    {
      weather: '🌧️ Mưa đêm & Đèn đường',
      visualAudioCue: 'Hạt mưa đập chéo vào mặt kính quán cà phê, kéo nhòe vệt đèn hậu đỏ rực bên kia đại lộ.'
    },
    {
      weather: '🌫️ Sương sớm vùng cao / Đà Lạt',
      visualAudioCue: 'Lớp sương trắng bàng bạc vắt ngang hàng thông, thấm lạnh qua gấu áo len ngay khi cửa vừa hé.'
    },
    {
      weather: '☀️ Trưa nắng gắt ngột ngạt',
      visualAudioCue: 'Mặt đường nhựa bốc hơi nóng hập hừ, ánh nắng chói chang khiến bóng đổ dưới chân co rút thành một chấm đen sắc lẹm.'
    },
    {
      weather: '🌃 Đêm mất điện / Ánh nến',
      visualAudioCue: 'Bóng trần nhà rung rinh theo ngọn bấc đèn cầy mỗi lần có luồng gió lùa qua khe cửa gỗ mục.'
    },
    {
      weather: '🍂 Gió thu cuối chiều',
      visualAudioCue: 'Cơn gió se sắt cuốn theo mùi hoa sữa hăng hắc và tiếng lá khô lạo xạo lăn qua bậc thềm đá.'
    }
  ]);

  class WebNovelPublishReadinessInspector {
    constructor(engine) {
      this.engine = engine;
    }

    evaluateActiveChapterWebNovelReadiness() {
      const chap = NS.chapterManager?.getActiveChapter?.();
      const text =
        document.getElementById('textarea-chapter-content')?.value ||
        chap?.content ||
        '';
      const title =
        document.getElementById('input-chapter-title')?.value ||
        chap?.displayTitle ||
        chap?.title ||
        '';

      const utils = getUtils();
      const words = utils.countVietnameseWords(text);
      const firstSentence =
        text
          .trim()
          .split(/(?<=[.!?…])\s+|\n+/)[0] || '';
      const lastLines = text
        .trim()
        .split('\n')
        .filter((l) => l.trim().length > 0);
      const closingLine = lastLines[lastLines.length - 1] || '';

      const sensory =
        this.engine.craftMetrics.auditFiveSensesDensityInChapter(text);
      const notes = this.engine.notesAndNames.getNotesForChapter(
        chap?.id || 'default_chap'
      );

      const checks = [
        {
          id: 'word_length',
          label: 'Độ dài chuẩn WebNovel (≥ 1.200 từ)',
          passed: words >= 1200,
          detail: `Hiện tại: ${words.toLocaleString('vi-VN')} từ`
        },
        {
          id: 'opening_hook',
          label: 'Câu mở đầu gọn sắc kéo độc giả (< 35 từ)',
          passed:
            firstSentence.length > 0 &&
            utils.countVietnameseWords(firstSentence) <= 35,
          detail: firstSentence
            ? `Mở đầu ${utils.countVietnameseWords(firstSentence)} từ`
            : 'Chưa có nội dung'
        },
        {
          id: 'sensory_depth',
          label: 'Độ phủ đa giác quan (≥ 3/5 giác quan)',
          passed: sensory.activeSensesCount >= 3,
          detail: `${sensory.activeSensesCount}/5 giác quan xuất hiện`
        },
        {
          id: 'closing_punch',
          label: 'Đoạn kết để lại dư âm hoặc câu hỏi mở',
          passed: closingLine.length >= 12,
          detail: closingLine
            ? `Câu cuối: "${closingLine.slice(0, 48)}..."`
            : 'Chưa có câu kết'
        },
        {
          id: 'author_notes',
          label: 'Lời tác giả giao lưu bạn đọc đầu/cuối chương',
          passed: Boolean(notes.preNote || notes.postNote),
          detail:
            notes.preNote || notes.postNote
              ? 'Đã soạn Lời tác giả'
              : 'Tùy chọn: thêm 1 câu hỏi cuối chương tăng bình luận'
        }
      ];

      const passedCount = checks.filter((c) => c.passed).length;
      const readinessPercent = Math.round((passedCount / checks.length) * 100);

      return {
        title: title || 'Chương chưa đặt tên',
        words,
        readinessPercent,
        passedCount,
        totalChecks: checks.length,
        checks
      };
    }

    buildWeatherAtmosphereSectionHtml() {
      const esc = getUtils().escapeHtml;
      return [
        '<div class="p-3.5 rounded-2xl border border-sky-500/30 bg-zinc-950/90 space-y-2">',
        '  <div class="font-extrabold text-sky-300 uppercase text-xs">🌦️ Bối Cảnh Thời Tiết & Ánh Sáng Điện Ảnh (Chèn Nhanh Mở Cảnh)</div>',
        '  <div class="grid grid-cols-1 md:grid-cols-2 gap-2">',
        ...WEATHER_AND_NOIR_ATMOSPHERE_CUES.map(
          (w) =>
            `<div class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 space-y-1">` +
            `  <div class="flex items-center justify-between gap-2">` +
            `    <span class="text-[10px] font-bold text-sky-300">${esc(w.weather)}</span>` +
            `    <button type="button" data-insert-sensory-phrase="${esc(w.visualAudioCue)}" class="px-2 py-0.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px]">Chèn mở cảnh</button>` +
            `  </div>` +
            `  <div class="text-[11px] text-zinc-300">${esc(w.visualAudioCue)}</div>` +
            `</div>`
        ),
        '  </div>',
        '</div>'
      ].join('\n');
    }

    buildReadinessChecklistHtml() {
      const audit = this.evaluateActiveChapterWebNovelReadiness();
      const esc = getUtils().escapeHtml;
      return [
        '<div class="p-3.5 rounded-2xl border border-emerald-500/30 bg-zinc-950/90 space-y-2">',
        '  <div class="flex items-center justify-between">',
        `    <span class="font-extrabold text-emerald-300 uppercase text-xs">✅ Danh Sách Kiểm Tra Trước Khi Đăng Chương (${esc(audit.title)})</span>`,
        `    <span class="font-monoCode font-bold text-xs text-emerald-300">${audit.readinessPercent}% đạt chuẩn</span>`,
        '  </div>',
        '  <div class="space-y-1">',
        ...audit.checks.map(
          (c) =>
            `<div class="flex items-center justify-between gap-2 text-[11px] px-2.5 py-1.5 rounded-lg border ${
              c.passed
                ? 'border-emerald-500/30 bg-emerald-950/25 text-emerald-200'
                : 'border-zinc-800 bg-zinc-900/80 text-zinc-400'
            }">` +
            `  <span>${c.passed ? '☑' : '☐'} <strong>${esc(c.label)}</strong></span>` +
            `  <span class="text-[10px] font-monoCode">${esc(c.detail)}</span>` +
            '</div>'
        ),
        '  </div>',
        '</div>'
      ].join('\n');
    }
  }

  // Nối phần Thời tiết mở cảnh vào tab SENSORY và Checklist trước khi đăng vào AUTHOR_NOTES
  const prevRenderWebModal2 =
    SensoryAndWebNovelModalRenderer.prototype.renderModalBody;
  SensoryAndWebNovelModalRenderer.prototype.renderModalBody = function () {
    prevRenderWebModal2.call(this);
    const bodyEl = document.getElementById('sensory-and-author-notes-body');
    if (!bodyEl || !this.engine.publishInspector) return;

    if (this.activeModalTab === 'SENSORY') {
      const wrap = document.createElement('div');
      wrap.innerHTML =
        this.engine.publishInspector.buildWeatherAtmosphereSectionHtml();
      bodyEl.appendChild(wrap);
      this.bindRenderedModalEvents(wrap);
    } else if (this.activeModalTab === 'AUTHOR_NOTES') {
      const wrap = document.createElement('div');
      wrap.innerHTML =
        this.engine.publishInspector.buildReadinessChecklistHtml();
      bodyEl.appendChild(wrap);
    }
  };

  // ==========================================================================
  // ĐĂNG KÝ SINGLETON LÊN `window.NoirStudio.webNovelFeatures`
  // ==========================================================================
  const webNovelFeaturesEngine = new WebNovelSecretFeaturesEngine();
  webNovelFeaturesEngine.microBeatPlanner =
    new WebNovelMicroBeatAndWeeklyPlanner(webNovelFeaturesEngine);
  webNovelFeaturesEngine.publishInspector =
    new WebNovelPublishReadinessInspector(webNovelFeaturesEngine);

  webNovelFeaturesEngine.checkWebNovelPublishReadiness = () =>
    webNovelFeaturesEngine.publishInspector.evaluateActiveChapterWebNovelReadiness();

  /**
   * Gợi ý câu hỏi khai thác nội tâm và tầng ẩn ý (Subtext) giúp nhân vật Light Novel có chiều sâu.
   */
  class InnerMonologueAndSubtextPrompts {
    constructor() {
      this.sceneArchetypes = {
        CONFRONTATION: {
          title: 'Đối đầu căng thẳng / Đấu trí',
          questions: [
            'Nhân vật đang cố giấu điều gì qua cách đặt tay hoặc ánh nhìn?',
            'Lời nói ra nghe lịch sự nhưng hàm ý đe dọa nằm ở từ khóa nào?',
            'Nếu nhân vật chọn im lặng 3 giây trước khi đáp, khoảng lặng đó báo hiệu điều gì?',
          ],
          subtextStarters: [
            'Cậu vẫn mỉm cười, nhưng đầu ngón tay đặt trên chuôi tách đã trắng bệch.',
            'Câu trả lời ấy đúng từng chữ, chỉ tiếc là nó tránh né đúng điều quan trọng nhất.',
            'Không ai nhắc lại chuyện đêm mưa tuần trước, như thể chỉ cần gọi tên nó sẽ lập tức sụp đổ.',
          ],
        },
        CONFESSION_OR_TRUST: {
          title: 'Thổ lộ / Giao phó bí mật',
          questions: [
            'Nhân vật sợ mất điều gì nhất ngay trước khoảnh khắc nói thật?',
            'Có chi tiết đời thường nhỏ nào (tiếng ấm nước, vết sẹo cũ) làm dịu sự kịch tính quá đà?',
            'Phản ứng đầu tiên của người nghe có hơi lệch nhịp kỳ vọng thay vì đồng ý ngay không?',
          ],
          subtextStarters: [
            'Cô không nhìn thẳng vào mắt anh mà cúi xuống sửa lại mép tay áo đã phẳng từ lâu.',
            'Lời thú nhận bật ra nhẹ tênh, trái ngược hoàn toàn với cơn run rẩy giấu sau vạt áo.',
            'Anh gật đầu rất khẽ, nhưng khoảng cách giữa hai chiếc ghế vẫn giữ nguyên nửa sải tay.',
          ],
        },
        AFTERMATH_AND_DECISION: {
          title: 'Lắng đọng hậu biến cố / Bước ngoặt quyết định',
          questions: [
            'Sau biến cố vừa rồi, thói quen nào của nhân vật thay đổi vĩnh viễn?',
            'Vật kỷ niệm hay dấu vết nhỏ nào còn sót lại ở hiện trường đóng vai trò điểm neo cảm xúc?',
            'Quyết tâm cuối cảnh hướng về một hành động cụ thể nào trong chương kế tiếp?',
          ],
          subtextStarters: [
            'Ánh đèn hành lang hắt xuống nền gạch một vệt dài, chia đôi chiếc bóng vừa bước qua ngưỡng cửa.',
            'Tờ ghi chú bị xé mất góc dưới cùng vẫn nằm yên trong túi áo ngực, khô cứng vì mồ hôi.',
            'Từ đêm nay, cánh cổng phía sau lưng sẽ không còn mở lại theo cách cũ nữa.',
          ],
        },
      };
    }

    getSubtextPromptPack(archetypeKey = 'CONFRONTATION') {
      const upper = String(archetypeKey || 'CONFRONTATION').toUpperCase();
      return this.sceneArchetypes[upper] || this.sceneArchetypes.CONFRONTATION;
    }

    listAllSubtextPacks() {
      return Object.entries(this.sceneArchetypes).map(([key, pack]) => ({
        key,
        title: pack.title,
        questionCount: pack.questions.length,
        starterCount: pack.subtextStarters.length,
      }));
    }
  }

  /**
   * Chẩn đoán chất lượng 300 chữ mở chương (Hook) và đoạn kết giữ chân độc giả WebNovel.
   */
  class WebNovelHookDiagnosticAnalyzer {
    constructor() {
      this.passiveOpeningIndicators = [
        /^hôm\s+nay\s+là/i,
        /^buổi\s+sáng\s+hôm\s+ấy/i,
        /^tên\s+(?:tôi|mình|cậu\s+ấy)\s+là/i,
        /^xin\s+chào/i,
        /^trong\s+một\s+thế\s+giới/i,
      ];
      this.engagementSignals = [
        '?', '!', '「', '“', 'máu', 'tiếng', 'chạy', 'biến mất', 'bí mật',
        'chết', 'cửa', 'bỗng', 'ngay lập tức', 'không thể', 'hắn', 'cô ấy',
      ];
    }

    diagnoseChapterOpeningAndHook(rawText) {
      const text = String(rawText || '').trim();
      if (!text) {
        return {
          hasContent: false,
          hookScore: 0,
          verdict: 'Chương chưa có nội dung để đánh giá hook mở đầu và kết thúc.',
          suggestions: ['Hãy viết ít nhất 100–300 chữ mở cảnh trước khi chạy chẩn đoán WebNovel.'],
        };
      }
      const words = text.split(/\s+/).filter(Boolean);
      const openingChunk = words.slice(0, 120).join(' ');
      const closingChunk = words.slice(Math.max(0, words.length - 120)).join(' ');
      const firstLine = text.split('\n').map((l) => l.trim()).find(Boolean) || '';

      let openingPenalty = 0;
      const warnings = [];
      for (const re of this.passiveOpeningIndicators) {
        if (re.test(firstLine)) {
          openingPenalty += 20;
          warnings.push('Câu mở đầu mang tính giới thiệu lý lịch hoặc thời tiết thụ động, dễ khiến độc giả WebNovel lướt qua.');
          break;
        }
      }

      const hasEarlyDialogueOrAction = /[「“"?!]/.test(openingChunk);
      const closingHasCliffhangerSignal = /[?!…]|nhưng|tuy\s+nhiên|đột\s+nhiên|chưa\s+kịp|bóng\s+dáng/i.test(closingChunk);
      let signalHits = 0;
      const lowerClosing = closingChunk.toLowerCase();
      for (const sig of this.engagementSignals) {
        if (openingChunk.toLowerCase().includes(sig) || lowerClosing.includes(sig)) {
          signalHits += 1;
        }
      }

      const rawScore = 58 + (hasEarlyDialogueOrAction ? 16 : 0) + (closingHasCliffhangerSignal ? 16 : 0) + Math.min(18, signalHits * 3) - openingPenalty;
      const hookScore = Math.max(15, Math.min(100, rawScore));

      if (!hasEarlyDialogueOrAction) {
        warnings.push('2 đoạn đầu chưa thấy lời thoại hoặc xung đột tức thì.');
      }
      if (!closingHasCliffhangerSignal) {
        warnings.push('Đoạn kết chương hơi khép kín; cân nhắc thêm câu hỏi bỏ ngỏ hoặc chuyển biến bất ngờ để kéo lượt đọc chương sau.');
      }

      return {
        hasContent: true,
        totalWords: words.length,
        firstSentencePreview: firstLine.slice(0, 90),
        hasEarlyDialogueOrAction,
        closingHasCliffhangerSignal,
        hookScore,
        verdict:
          hookScore >= 82
            ? 'Mở & Kết chương giữ nhịp cuốn hút chuẩn Light Novel / WebNovel.'
            : hookScore >= 60
              ? 'Ổn, có thể tăng lực kéo ở câu đầu tiên hoặc câu chốt cuối chương.'
              : 'Nên đẩy xung đột/hành động lên sớm hơn ở 100 chữ đầu.',
        suggestions: warnings,
      };
    }
  }

  /**
   * Theo dõi các cột mốc sản lượng chữ theo phiên/ngày và ghi nhận thành tựu sáng tác.
   */
  class ChapterWordMilestoneCelebrator {
    constructor(storageKey = 'noir_vn_word_milestones_v38') {
      this.storageKey = storageKey;
      this.thresholds = [300, 800, 1500, 2500, 4000, 6000, 10000];
      this.unlockedSet = this.loadUnlocked();
    }

    loadUnlocked() {
      try {
        if (typeof localStorage === 'undefined') return new Set();
        const raw = localStorage.getItem(this.storageKey);
        if (!raw) return new Set();
        const parsed = JSON.parse(raw);
        return new Set(Array.isArray(parsed) ? parsed : []);
      } catch (_err) {
        return new Set();
      }
    }

    saveUnlocked() {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(this.storageKey, JSON.stringify(Array.from(this.unlockedSet)));
        }
      } catch (_err) {
        // Không làm gián đoạn tác giả nếu bộ nhớ trình duyệt hạn chế
      }
    }

    evaluateWordMilestoneProgress(currentWords, notifyOnNewUnlock = false) {
      const count = Math.max(0, Number(currentWords || 0));
      const newlyUnlocked = [];
      let nextMilestone = null;

      for (const threshold of this.thresholds) {
        if (count >= threshold) {
          const key = `words_${threshold}`;
          if (!this.unlockedSet.has(key)) {
            this.unlockedSet.add(key);
            newlyUnlocked.push(threshold);
          }
        } else if (nextMilestone === null) {
          nextMilestone = threshold;
        }
      }

      if (newlyUnlocked.length > 0) {
        this.saveUnlocked();
        if (notifyOnNewUnlock && NS.uiUtils?.showToast) {
          const topReached = newlyUnlocked[newlyUnlocked.length - 1];
          NS.uiUtils.showToast(
            `Tuyệt vời! Bạn vừa chạm mốc ${topReached.toLocaleString('vi-VN')} chữ trong chương hiện tại.`,
            'success'
          );
        }
      }

      const progressToNextPct = nextMilestone
        ? Math.min(99, Math.round((count / nextMilestone) * 100))
        : 100;

      return {
        currentWords: count,
        unlockedMilestones: Array.from(this.unlockedSet),
        newlyUnlocked,
        nextMilestone,
        wordsRemainingForNext: nextMilestone ? Math.max(0, nextMilestone - count) : 0,
        progressToNextPct,
      };
    }

    resetMilestonesForFreshProject() {
      this.unlockedSet.clear();
      this.saveUnlocked();
    }
  }

  const subtextPrompts = new InnerMonologueAndSubtextPrompts();
  const hookAnalyzer = new WebNovelHookDiagnosticAnalyzer();
  const milestoneCelebrator = new ChapterWordMilestoneCelebrator();

  webNovelFeaturesEngine.subtextPrompts = subtextPrompts;
  webNovelFeaturesEngine.hookAnalyzer = hookAnalyzer;
  webNovelFeaturesEngine.milestoneCelebrator = milestoneCelebrator;

  webNovelFeaturesEngine.getSubtextPromptPack = (archetypeKey) =>
    subtextPrompts.getSubtextPromptPack(archetypeKey);

  webNovelFeaturesEngine.listAllSubtextPacks = () =>
    subtextPrompts.listAllSubtextPacks();

  webNovelFeaturesEngine.diagnoseChapterOpeningAndHook = (rawText) => {
    const src =
      typeof rawText === 'string'
        ? rawText
        : document?.getElementById?.('textarea-chapter-content')?.value ||
          document?.getElementById?.('manuscript-editor')?.value ||
          '';
    return hookAnalyzer.diagnoseChapterOpeningAndHook(src);
  };

  webNovelFeaturesEngine.evaluateWordMilestoneProgress = (wordCount, notify = false) =>
    milestoneCelebrator.evaluateWordMilestoneProgress(wordCount, notify);

  /**
   * Kho mẫu câu móc kết chương (Cliffhanger Templates) phân loại theo thể loại Light Novel.
   */
  class ChapterCliffhangerTemplateVault {
    constructor() {
      this.templatesByCategory = {
        MYSTERY_REVEAL: {
          label: 'Hé lộ manh mối bất ngờ',
          templates: [
            'Trên mặt bàn trống trơn, bức ảnh từng bị thiêu rụi ba năm trước vẫn nằm nguyên vẹn ở đó.',
            'Cậu nhận ra giọng nói vang lên từ đầu dây bên kia chưa từng thuộc về một người còn sống.',
            'Chữ ký ở trang cuối cùng không phải của thủ phạm—mà là nét bút của chính sư phụ cậu.',
          ],
        },
        SUDDEN_THREAT: {
          label: 'Hiểm họa cận kề / Đảo chiều cục diện',
          templates: [
            'Toàn bộ ánh đèn trong hành lang đồng loạt tắt phụt ngay khoảnh khắc tiếng khóa cửa vang lên.',
            'Hắn còn chưa kịp rút kiếm thì thanh chắn cửa sắt nặng hàng tạ đã bật tung khỏi bản lề.',
            'Bóng người đứng ngoài làn mưa ngước lên—và nụ cười quen thuộc ấy lại xuất hiện trên gương mặt hoàn toàn xa lạ.',
          ],
        },
        EMOTIONAL_STING: {
          label: 'Dư chấn tình cảm / Quyết định khó nói',
          templates: [
            'Cô xoay người bước đi, không hề biết rằng lời từ biệt ấy là lần cuối cùng cả hai còn đứng cùng một phía.',
            'Anh lặng lẽ đặt chiếc chìa khóa xuống bậc thềm, như cách duy nhất để giữ lời hứa năm xưa.',
            'Nếu mở phong thư này ra, mọi bình yên suốt mười năm qua sẽ lập tức trở thành dối trá.',
          ],
        },
      };
    }

    listCategories() {
      return Object.entries(this.templatesByCategory).map(([id, group]) => ({
        id,
        label: group.label,
        count: group.templates.length,
      }));
    }

    getTemplatesByCategory(categoryId = 'MYSTERY_REVEAL') {
      const upper = String(categoryId || 'MYSTERY_REVEAL').toUpperCase();
      return this.templatesByCategory[upper] || this.templatesByCategory.MYSTERY_REVEAL;
    }

    suggestCliffhangersForDraft(rawText) {
      const lower = String(rawText || '').toLowerCase();
      let recommendedKey = 'EMOTIONAL_STING';
      if (/máu|kiếm|tấn công|bẫy|nguy|chết|đoạt|sát/.test(lower)) {
        recommendedKey = 'SUDDEN_THREAT';
      } else if (/bí mật|thư|hồ sơ|dấu vết|mật mã|ký ức|nghi ngờ/.test(lower)) {
        recommendedKey = 'MYSTERY_REVEAL';
      }
      return {
        recommendedCategory: recommendedKey,
        pack: this.getTemplatesByCategory(recommendedKey),
      };
    }
  }

  /**
   * Chấm điểm khả năng giữ chân độc giả WebNovel theo độ dài cảnh, mật độ thoại và lực kéo đoạn cuối.
   */
  class WebNovelReaderRetentionScorer {
    constructor(idealMinWords = 1200, idealMaxWords = 3500) {
      this.idealMinWords = idealMinWords;
      this.idealMaxWords = idealMaxWords;
    }

    scoreChapterRetention(rawText) {
      const text = String(rawText || '').trim();
      const words = text ? text.split(/\s+/).filter(Boolean) : [];
      const wordCount = words.length;
      const paragraphs = text
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map((p) => p.trim())
        .filter(Boolean);

      const dialogueParagraphs = paragraphs.filter((p) => /^(?:["“「『\-–—]|——)/.test(p)).length;
      const dialogueRatio = paragraphs.length > 0 ? dialogueParagraphs / paragraphs.length : 0;
      const longMobileWalls = paragraphs.filter((p) => p.split(/\s+/).length > 110).length;
      const hasQuestionOrExclamationAtEnd = /[?!…]$/.test(paragraphs[paragraphs.length - 1] || '');

      let lengthScore = 60;
      if (wordCount >= this.idealMinWords && wordCount <= this.idealMaxWords) {
        lengthScore = 100;
      } else if (wordCount >= 600 && wordCount < this.idealMinWords) {
        lengthScore = 78;
      } else if (wordCount > this.idealMaxWords) {
        lengthScore = 82;
      } else if (wordCount < 300) {
        lengthScore = 35;
      }

      const mobileComfortScore = Math.max(20, 100 - longMobileWalls * 14);
      const dialogueFitScore = dialogueRatio >= 0.2 && dialogueRatio <= 0.65 ? 95 : 72;
      const finaleHookScore = hasQuestionOrExclamationAtEnd ? 95 : 70;

      const compositeScore = Math.round(
        lengthScore * 0.3 +
        mobileComfortScore * 0.3 +
        dialogueFitScore * 0.2 +
        finaleHookScore * 0.2
      );

      return {
        wordCount,
        paragraphCount: paragraphs.length,
        dialoguePercent: Math.round(dialogueRatio * 100),
        longMobileWalls,
        hasQuestionOrExclamationAtEnd,
        scores: {
          lengthScore,
          mobileComfortScore,
          dialogueFitScore,
          finaleHookScore,
          compositeScore,
        },
        summaryAdvice:
          longMobileWalls > 2
            ? `Có ${longMobileWalls} đoạn dài >110 từ, nên ngắt nhịp để độc giả điện thoại không bị mỏi mắt.`
            : compositeScore >= 85
              ? 'Chương đạt độ thoáng và lực giữ chân rất tốt cho cả Web lẫn Mobile.'
              : 'Đạt mức khá; cân nhắc trau chuốt thêm câu mở hoặc đoạn kết.',
      };
    }
  }

  const cliffhangerVault = new ChapterCliffhangerTemplateVault();
  const retentionScorer = new WebNovelReaderRetentionScorer();

  webNovelFeaturesEngine.cliffhangerVault = cliffhangerVault;
  webNovelFeaturesEngine.retentionScorer = retentionScorer;

  webNovelFeaturesEngine.suggestCliffhangersForActiveChapter = (rawText) => {
    const src =
      typeof rawText === 'string'
        ? rawText
        : document?.getElementById?.('textarea-chapter-content')?.value ||
          document?.getElementById?.('manuscript-editor')?.value ||
          '';
    return cliffhangerVault.suggestCliffhangersForDraft(src);
  };

  webNovelFeaturesEngine.scoreWebNovelRetention = (rawText) => {
    const src =
      typeof rawText === 'string'
        ? rawText
        : document?.getElementById?.('textarea-chapter-content')?.value ||
          document?.getElementById?.('manuscript-editor')?.value ||
          '';
    return retentionScorer.scoreChapterRetention(src);
  };

  /**
   * Định dạng tóm tắt tiến độ viết chữ trong ngày phục vụ hiển thị nhanh ở thanh trạng thái và báo cáo.
   */
  webNovelFeaturesEngine.formatDailyWritingPaceSummary = (wordsToday, dailyGoal) => {
    const target = Math.max(100, Number(dailyGoal || 2000));
    const current = Math.max(0, Number(wordsToday || 0));
    const pct = Math.min(999, Math.round((current / target) * 100));
    const remaining = Math.max(0, target - current);
    const tier =
      pct >= 100
        ? 'Hoàn thành xuất sắc mục tiêu ngày'
        : pct >= 70
          ? 'Sắp chạm đích mục tiêu hôm nay'
          : pct >= 35
            ? 'Đang giữ nhịp viết ổn định'
            : 'Khởi động nhẹ nhàng cho phiên viết mới';
    return {
      wordsToday: current,
      dailyGoal: target,
      percent: pct,
      remainingWords: remaining,
      statusLabel: tier,
    };
  };

  NS.webNovelFeatures = webNovelFeaturesEngine;
  NS.WebNovelSecretFeaturesEngine = WebNovelSecretFeaturesEngine;
  NS.FIVE_SENSES_LITERARY_THESAURUS = FIVE_SENSES_LITERARY_THESAURUS;
  NS.InnerMonologueAndSubtextPrompts = InnerMonologueAndSubtextPrompts;
  NS.WebNovelHookDiagnosticAnalyzer = WebNovelHookDiagnosticAnalyzer;
  NS.ChapterWordMilestoneCelebrator = ChapterWordMilestoneCelebrator;
  NS.ChapterCliffhangerTemplateVault = ChapterCliffhangerTemplateVault;
  NS.WebNovelReaderRetentionScorer = WebNovelReaderRetentionScorer;

  if (typeof NS.registerModule === 'function') {
    NS.registerModule('mod25', webNovelFeaturesEngine);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        if (!webNovelFeaturesEngine.hasInitialized) webNovelFeaturesEngine.init();
      });
    } else {
      webNovelFeaturesEngine.init();
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
