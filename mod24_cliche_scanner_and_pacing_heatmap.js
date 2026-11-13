/**
 * ============================================================================
 * MODULE 24: BỘ QUÉT SÁO NGỮ AI (ANTI-CLICHE), LẶP TỪ & HEATMAP NHỊP CẢNH
 * Tệp: mod24_cliche_scanner_and_pacing_heatmap.js
 * ============================================================================
 * Nhiệm vụ chuyên biệt:
 *   1. Điều khiển Bảng Trắng Nháp Nhanh Ý Tưởng & Cửa sổ Soi Sáo Ngữ AI
 *      (`#modal-quick-scratchpad`, `#btn-open-scratchpad`, `#btn-scan-cliches`,
 *      `#btn-close-scratchpad`, `#scratchpad-modal-title`,
 *      `#textarea-quick-scratchpad`, `#cliche-and-pacing-report-box`).
 *   2. Quét đối chiếu bản thảo với Danh sách Từ Cấm Story Bible (Tab 4),
 *      bộ `ANTI_CLICHE_TAXONOMY` của `mod01` và hơn 40 mẫu sáo ngữ AI dịch máy,
 *      đề xuất cụm từ thay thế giàu hình ảnh do con người viết.
 *   3. Dựng Bản đồ nhiệt nhịp truyện (Pacing Heatmap) theo từng phân đoạn chương:
 *      đo độ dài câu, mật độ đối thoại, tốc độ hành động và từ lặp cận kề (Echo words).
 *   4. Cho phép tác giả bấm trực tiếp vào bất kỳ lỗi sáo ngữ/lặp từ nào để nhảy
 *      thẳng con trỏ tới đúng vị trí đó trong ô viết Tab 1 (`#textarea-chapter-content`).
 * ============================================================================
 */
(function (global) {
  'use strict';

  const NS = (global.NoirStudio = global.NoirStudio || {});

  const SCRATCHPAD_TABS_STORAGE_KEY = 'noir_v38_scratchpad_multi_tabs_v1';

  // Kho sáo ngữ AI phổ biến & Phương án thay thế tự nhiên kiểu tác giả thực thụ
  const HUMANIZED_CLICHE_REPLACEMENTS = Object.freeze([
    {
      phrase: 'nhếch mép cười lạnh',
      category: 'Biểu cảm sáo rỗng',
      humanAlternatives: [
        'khóe môi khẽ kéo lên một độ cong nhạt thếch',
        'hắn bật cười bằng mũi, tiếng cười khô khốc không chạm tới đáy mắt',
        'cằm hắn hất nhẹ về phía cửa, không buồn che giấu vẻ châm chọc'
      ]
    },
    {
      phrase: 'khóe môi khẽ nhếch',
      category: 'Biểu cảm sáo rỗng',
      humanAlternatives: [
        'một bên khóe miệng khẽ giật nhẹ rồi bình thản khép lại',
        'cô cong môi như vừa nhớ ra chuyện khôi hài cũ kỹ',
        'nụ cười mỏng thoáng qua rồi tắt ngấm dưới bóng đèn vàng'
      ]
    },
    {
      phrase: 'lóe lên tia sắc bén',
      category: 'Miêu tả ánh mắt máy móc',
      humanAlternatives: [
        'ánh nhìn của y đột ngột dừng lại trên cổ tay đối phương',
        'hắn nheo mắt nửa nhịp như đang cân đo lời nói dối trước mặt',
        'đồng tử thu nhỏ lại khi tia sáng từ mặt bàn phản chiếu lên'
      ]
    },
    {
      phrase: 'chạy dọc sống lưng',
      category: 'Cảm giác sợ hãi mòn sáo',
      humanAlternatives: [
        'sau gáy đột nhiên lạnh toát như vừa có ai thổi khẽ vào cổ áo',
        'hai đốt ngón tay bất chợt tê cứng dưới lớp tay áo khoác',
        'hơi thở khựng lại ngang lồng ngực mất vài giây'
      ]
    },
    {
      phrase: 'không hẹn mà cùng',
      category: 'Chuyển cảnh công thức',
      humanAlternatives: [
        'cả hai gần như quay đầu về phía cửa cùng một khoảnh khắc',
        'tiếng bước chân ngoài hành lang kéo mọi ánh nhìn dạt về một phía',
        'không cần ai ra hiệu, ba người tự động nín thở nhìn nhau'
      ]
    },
    {
      phrase: 'thở phào nhẹ nhõm',
      category: 'Kể cảm xúc thay vì tả',
      humanAlternatives: [
        'đôi vai căng cứng nãy giờ mới chịu buông xuôi vài phân',
        'cô tựa lưng vào mép tường lạnh, chậm rãi xả hết luồng khí nóng bị nén trong phổi',
        'bàn tay siết chặt quai túi từ lúc nào giờ mới chịu nới lỏng các đốt ngón'
      ]
    },
    {
      phrase: 'ánh mắt thâm sâu khó lường',
      category: 'Tả chung chung không hình ảnh',
      humanAlternatives: [
        'y nhìn thẳng vào ly trà đã nguội mà không chớp mắt một lần nào',
        'khó mà đoán được người đàn ông ấy đang tính toán điều gì phía sau gọng kính',
        'bóng rèm che nửa gương mặt khiến chẳng ai đọc nổi ý nghĩ trong mắt hắn'
      ]
    },
    {
      phrase: 'bầu không khí như ngưng đọng',
      category: 'Cường điệu sáo ngữ',
      humanAlternatives: [
        'tiếng kim đồng hồ treo tường bỗng trở nên chói tai lạ thường',
        'chỉ còn nghe tiếng đá tan lách tách trong cốc nước đặt giữa bàn',
        'cả căn phòng rơi vào khoảng lặng đặc quánh, đến tiếng hít thở cũng hóa thừa thãi'
      ]
    },
    {
      phrase: 'đồng tử co rút kịch liệt',
      category: 'Dịch máy Convert/AI',
      humanAlternatives: [
        'hắn khựng người, ly cà phê trên tay khẽ sánh ra ngoài mép đĩa',
        'hơi thở đột ngột đứt quãng ngay giữa nửa câu nói',
        'gò má cô thoáng mất hết sắc máu trong chớp mắt'
      ]
    },
    {
      phrase: 'khí chất bức người',
      category: 'Tả uy áp trừu tượng',
      humanAlternatives: [
        'cách hắn đứng chắn ngay lối ra khiến người đối diện vô thức lùi nửa bước',
        'giọng nói trầm thấp nhưng không để chừa bất kỳ đường lui nào cho cuộc thương lượng',
        'mùi tuyết tùng lạnh lẽo từ chiếc áo choàng tràn khắp khoảng sân hẹp'
      ]
    },
    {
      phrase: 'cười như không cười',
      category: 'Sáo ngữ dịch trực tiếp',
      humanAlternatives: [
        'môi giữ nét nhã nhặn nhưng ánh mắt lại lạnh băng chẳng mảy may dao động',
        'nụ cười lịch sự đến mức nghe ra rõ sự xa cách',
        'khẽ gật đầu bằng nụ cười xã giao không chút gợn ấm'
      ]
    },
    {
      phrase: 'bất giác',
      category: 'Trạng từ thừa hay lặp của AI',
      humanAlternatives: [
        '(Lược bỏ thẳng "bất giác", viết trực tiếp hành động: "ngón tay cô chạm vào...")',
        'trong vô thức / chẳng kịp nghĩ ngợi / gần như theo phản xạ'
      ]
    },
    {
      phrase: 'vô thức',
      category: 'Trạng từ lặp tần suất cao',
      humanAlternatives: [
        '(Thay bằng hành vi cụ thể không qua lý trí: "đến khi nhận ra thì anh đã đứng trước cổng")'
      ]
    }
  ]);

  const VIETNAMESE_ECHO_STOPWORDS = new Set([
    'và',
    'của',
    'là',
    'trong',
    'với',
    'cho',
    'một',
    'các',
    'những',
    'đã',
    'đang',
    'sẽ',
    'có',
    'không',
    'được',
    'khi',
    'này',
    'đó',
    'như',
    'để',
    'mà',
    'thì',
    'vào',
    'ra',
    'lên',
    'xuống',
    'từ',
    'đến',
    'ở',
    'tại',
    'về',
    'bởi',
    'vì',
    'nên',
    'nhưng',
    'cũng',
    'rất',
    'quá',
    'lại',
    'còn',
    'đều'
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

  function escapeRegExp(str) {
    return String(str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // ==========================================================================
  // LỚP 1: ĐỘNG CƠ QUÉT SÁO NGỮ AI & LẬP CHỈ MỤC VỊ TRÍ ĐỂ NHẢY TỚI TRONG TAB 1
  // ==========================================================================
  class AntiClicheBlacklistScanner {
    collectActiveBlacklistTerms() {
      const mergedMap = new Map();

      // 1. Nguồn chuẩn từ HUMANIZED_CLICHE_REPLACEMENTS
      for (const item of HUMANIZED_CLICHE_REPLACEMENTS) {
        mergedMap.set(item.phrase.toLowerCase(), {
          phrase: item.phrase,
          category: item.category,
          alternatives: item.humanAlternatives,
          source: 'Kho Sáo Ngữ AI Studio'
        });
      }

      // 2. Nguồn từ mod01 CONSTANTS.DEFAULT_ANTI_CLICHE & ANTI_CLICHE_TAXONOMY
      const mod01Defaults = NS.constants?.DEFAULT_ANTI_CLICHE || [];
      for (const raw of mod01Defaults) {
        const clean = String(raw || '').trim();
        if (!clean) continue;
        const low = clean.toLowerCase();
        if (!mergedMap.has(low)) {
          mergedMap.set(low, {
            phrase: clean,
            category: 'Sáo ngữ mặc định Studio',
            alternatives: [
              'Thay bằng cử chỉ cơ thể cụ thể hoặc phản ứng vật lý trong không gian cảnh'
            ],
            source: 'Danh sách chuẩn mod01'
          });
        }
      }

      const tax = NS.constants?.ANTI_CLICHE_TAXONOMY;
      if (tax && typeof tax === 'object') {
        for (const [catKey, items] of Object.entries(tax)) {
          if (!Array.isArray(items)) continue;
          for (const ph of items) {
            const clean = String(ph || '').trim();
            if (!clean) continue;
            const low = clean.toLowerCase();
            if (!mergedMap.has(low)) {
              mergedMap.set(low, {
                phrase: clean,
                category: catKey,
                alternatives: [
                  'Diễn tả gián tiếp qua ánh mắt, giọng nói hoặc tiểu tiết bối cảnh'
                ],
                source: 'Taxonomy Văn học'
              });
            }
          }
        }
      }

      // 3. Nguồn tùy chỉnh của chính tác giả tại Tab 4 (#textarea-anti-cliche-blacklist)
      const textareaBlacklist =
        document.getElementById('textarea-anti-cliche-blacklist')?.value || '';
      const storyBibleCustom = Array.isArray(NS.storyBible?.antiClicheList)
        ? NS.storyBible.antiClicheList
        : [];
      const customRawList = [
        ...textareaBlacklist.split(/[\n,;]+/),
        ...storyBibleCustom
      ];

      for (const raw of customRawList) {
        const clean = String(raw || '').trim();
        if (clean.length < 2) continue;
        const low = clean.toLowerCase();
        if (!mergedMap.has(low)) {
          mergedMap.set(low, {
            phrase: clean,
            category: 'Từ cấm riêng của Tác giả (Tab 4)',
            alternatives: [
              'Viết lại tự nhiên bằng từ ngữ đặc trưng riêng của nhân vật'
            ],
            source: 'Story Bible Blacklist'
          });
        }
      }

      return Array.from(mergedMap.values());
    }

    scanTextForCliches(chapterText) {
      const text = String(chapterText || '');
      const blacklist = this.collectActiveBlacklistTerms();
      const hits = [];

      if (!text.trim()) {
        return { totalHits: 0, uniquePhrases: 0, hits };
      }

      for (const item of blacklist) {
        const cleanPhrase = item.phrase.trim();
        if (cleanPhrase.length < 2) continue;
        const re = new RegExp(escapeRegExp(cleanPhrase), 'gi');
        let m;
        const offsets = [];
        while ((m = re.exec(text)) !== null) {
          const ctxStart = Math.max(0, m.index - 28);
          const ctxEnd = Math.min(text.length, m.index + m[0].length + 34);
          const snippet = text
            .slice(ctxStart, ctxEnd)
            .replace(/\s+/g, ' ')
            .trim();
          offsets.push({
            start: m.index,
            end: m.index + m[0].length,
            matchedText: m[0],
            snippet
          });
          if (offsets.length >= 25) break;
        }

        if (offsets.length > 0) {
          hits.push({
            phrase: item.phrase,
            category: item.category,
            source: item.source,
            count: offsets.length,
            alternatives: item.alternatives,
            occurrences: offsets
          });
        }
      }

      hits.sort((a, b) => b.count - a.count);
      const totalHits = hits.reduce((sum, h) => sum + h.count, 0);

      return {
        totalHits,
        uniquePhrases: hits.length,
        hits
      };
    }

    scanLocalEchoWordRepetitions(chapterText, windowWords = 55) {
      const words = String(chapterText || '')
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .split(/\s+/)
        .filter((w) => w.length >= 3 && !VIETNAMESE_ECHO_STOPWORDS.has(w));

      const countsByEcho = new Map();
      for (let i = 0; i < words.length; i += 1) {
        const w = words[i];
        const lookLimit = Math.min(words.length, i + windowWords);
        for (let j = i + 1; j < lookLimit; j += 1) {
          if (words[j] === w) {
            countsByEcho.set(w, (countsByEcho.get(w) || 0) + 1);
            break;
          }
        }
      }

      return Array.from(countsByEcho.entries())
        .filter(([, count]) => count >= 2)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([word, echoEvents]) => ({
          word,
          echoEvents,
          note: `Từ "${word}" lặp sát nhau khoảng ${echoEvents + 1} cụm gần kề — thử thay bằng từ đồng nghĩa hoặc lược bớt.`
        }));
    }
  }

  // ==========================================================================
  // LỚP 2: BỘ DỰNG BẢN ĐỒ NHIỆT NHỊP TRUYỆN (PACING HEATMAP) & ĐỘNG TỪ LỌC
  // ==========================================================================
  const FILTER_AND_TELL_VERBS = Object.freeze([
    {
      token: 'cảm thấy',
      advice: 'Thay bằng phản ứng sinh lý cụ thể (ngực thắt lại, cổ họng đắng chát, hai vai chùng xuống).'
    },
    {
      token: 'nhận ra',
      advice: 'Để nhân vật trực tiếp nhìn/nghe dấu hiệu thay vì viết "y nhận ra".'
    },
    {
      token: 'có vẻ như',
      advice: 'Dùng chi tiết quan sát trực diện để tăng độ dứt khoát thay vì phỏng đoán.'
    },
    {
      token: 'dường như',
      advice: 'Hạn chế lạm dụng quá 3 lần/chương để tránh văn phong bị mơ hồ.'
    },
    {
      token: 'bỗng nhiên',
      advice: 'Cắt bớt "bỗng nhiên" trước hành động đột ngột sẽ khiến câu văn đâm thẳng mạnh hơn.'
    }
  ]);

  class NarrativePacingAndHeatmapAnalyzer {
    computePacingSegments(chapterText, segmentCount = 6) {
      const text = String(chapterText || '').trim();
      if (!text) return [];

      const rawParagraphs = text
        .split(/\n+/)
        .map((p) => p.trim())
        .filter(Boolean);

      if (rawParagraphs.length === 0) return [];

      const effectiveSegments = Math.min(
        segmentCount,
        Math.max(1, rawParagraphs.length)
      );
      const chunkSize = Math.ceil(rawParagraphs.length / effectiveSegments);
      const segmentNames = [
        'Mở màn',
        'Dẫn nhập',
        'Triển khai',
        'Thắt nút',
        'Cao trào',
        'Kết & Dư âm'
      ];
      const segments = [];
      const utils = getUtils();

      for (let idx = 0; idx < effectiveSegments; idx += 1) {
        const slice = rawParagraphs.slice(
          idx * chunkSize,
          (idx + 1) * chunkSize
        );
        if (slice.length === 0) continue;

        const blockText = slice.join('\n');
        const words = utils.countVietnameseWords(blockText);
        const sentences = blockText
          .split(/(?<=[.!?…])\s+|\n+/)
          .filter((s) => s.trim().length > 0);
        const avgSentenceWords =
          sentences.length > 0
            ? Math.round(words / sentences.length)
            : words;

        const dialogueLines = slice.filter((l) => /^[-–—]\s+/.test(l)).length;
        const dialogueRatio = Math.round((dialogueLines / slice.length) * 100);

        const tensionMatches =
          blockText.match(
            /[!?]|(?:\b(?:máu|dao|chạy|hét|im lặng|bí mật|chết|bắn|ngã|vỡ|run|giật)\b)/gi
          ) || [];
        const tensionDensity =
          words > 0 ? Math.min(100, Math.round((tensionMatches.length / (words / 35)) * 42)) : 0;

        // Tốc độ câu ngắn (avgSentenceWords nhỏ -> nhịp nhanh; dài -> lắng sâu)
        const speedScore =
          avgSentenceWords <= 10
            ? 90
            : avgSentenceWords <= 16
              ? 72
              : avgSentenceWords <= 24
                ? 50
                : 32;

        const intensityScore = Math.min(
          100,
          Math.max(15, Math.round(speedScore * 0.45 + tensionDensity * 0.55))
        );

        let paceLabel = 'Nhịp vừa';
        let barColor = 'from-sky-500 to-indigo-500';
        if (intensityScore >= 72) {
          paceLabel = 'Căng / Nhanh';
          barColor = 'from-rose-500 to-amber-500';
        } else if (intensityScore <= 42) {
          paceLabel = 'Trầm / Sâu';
          barColor = 'from-teal-500 to-emerald-500';
        }

        segments.push({
          index: idx + 1,
          label:
            segmentNames[
              Math.min(
                segmentNames.length - 1,
                Math.floor((idx / Math.max(1, effectiveSegments - 1)) * (segmentNames.length - 1))
              )
            ] || `Khúc ${idx + 1}`,
          words,
          avgSentenceWords,
          dialogueRatio,
          intensityScore,
          paceLabel,
          barColor,
          firstLinePreview: slice[0].slice(0, 72)
        });
      }

      return segments;
    }

    scanFilterAndTellVerbs(chapterText) {
      const text = String(chapterText || '');
      if (!text.trim()) return [];

      const findings = [];
      for (const spec of FILTER_AND_TELL_VERBS) {
        const re = new RegExp(`\\b${escapeRegExp(spec.token)}\\b`, 'gi');
        const matches = text.match(re);
        if (matches && matches.length > 0) {
          findings.push({
            token: spec.token,
            count: matches.length,
            advice: spec.advice
          });
        }
      }
      return findings.sort((a, b) => b.count - a.count);
    }

    computeOverallProseCrispnessScore(
      clicheResult,
      echoList,
      filterVerbs,
      segments
    ) {
      let score = 96;
      score -= Math.min(35, (clicheResult?.totalHits || 0) * 5);
      score -= Math.min(20, (echoList?.length || 0) * 3);
      score -= Math.min(
        18,
        filterVerbs.reduce((s, f) => s + Math.max(0, f.count - 1), 0) * 2
      );

      // Thưởng điểm nếu nhịp truyện có dao động giữa lắng và cao trào
      if (segments.length >= 3) {
        const vals = segments.map((s) => s.intensityScore);
        const swing = Math.max(...vals) - Math.min(...vals);
        if (swing >= 18) score += 4;
      }

      return Math.max(25, Math.min(100, Math.round(score)));
    }
  }

  // ==========================================================================
  // LỚP 3: QUẢN LÝ BẢNG TRẮNG NHÁP NHANH NHIỀU NGĂN LƯU BỀN VỮNG
  // ==========================================================================
  class MultiTabScratchpadStore {
    constructor() {
      this.activeTab = 'QUICK_IDEAS';
      this.tabs = this.loadTabs();
    }

    getMainStorageKey() {
      return (
        NS.constants?.STORAGE_KEYS?.SCRATCHPAD || 'noir_quick_scratchpad_notes'
      );
    }

    loadTabs() {
      const legacyText = (() => {
        try {
          return localStorage.getItem(this.getMainStorageKey()) || '';
        } catch (_) {
          return '';
        }
      })();

      try {
        const raw = localStorage.getItem(SCRATCHPAD_TABS_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            return {
              QUICK_IDEAS:
                typeof parsed.QUICK_IDEAS === 'string'
                  ? parsed.QUICK_IDEAS
                  : legacyText,
              DIALOGUE_SPARKS: String(parsed.DIALOGUE_SPARKS || ''),
              OUTLINE_FIXES: String(parsed.OUTLINE_FIXES || '')
            };
          }
        }
      } catch (_) {}

      return {
        QUICK_IDEAS: legacyText,
        DIALOGUE_SPARKS: '',
        OUTLINE_FIXES: ''
      };
    }

    persistActiveText(text) {
      this.tabs[this.activeTab] = String(text || '');
      try {
        localStorage.setItem(SCRATCHPAD_TABS_STORAGE_KEY, JSON.stringify(this.tabs));
        // Luôn giữ khóa gốc tương thích với mod04 / mod05 / mod10 Backup Vault
        localStorage.setItem(
          this.getMainStorageKey(),
          this.tabs.QUICK_IDEAS || String(text || '')
        );
      } catch (_) {}

      if (NS.bus && typeof NS.bus.emit === 'function') {
        NS.bus.emit('scratchpad:updated', {
          activeTab: this.activeTab,
          length: String(text || '').length
        });
      }
    }

    switchTab(tabKey) {
      if (!Object.prototype.hasOwnProperty.call(this.tabs, tabKey)) return '';
      this.activeTab = tabKey;
      return this.tabs[tabKey] || '';
    }

    getCurrentTabText() {
      return this.tabs[this.activeTab] || '';
    }
  }

  // ==========================================================================
  // LỚP 4: TRÌNH KẾT XUẤT BÁO CÁO SÁO NGỮ & BẢN ĐỒ NHIỆT TRỰC QUAN
  // ==========================================================================
  class ClicheAndPacingReportRenderer {
    constructor(engine) {
      this.engine = engine;
    }

    ensureScratchpadTabStripMounted() {
      const ta = document.getElementById('textarea-quick-scratchpad');
      if (!ta || !ta.parentElement) return false;
      if (document.getElementById('scratchpad-subtabs-strip')) return true;

      const strip = document.createElement('div');
      strip.id = 'scratchpad-subtabs-strip';
      strip.className = 'flex flex-wrap items-center justify-between gap-2 pb-1';
      strip.innerHTML = [
        '<div class="flex flex-wrap items-center gap-1.5">',
        '  <button type="button" data-scratch-tab="QUICK_IDEAS" class="px-2.5 py-1 rounded-lg bg-amber-500/25 border border-amber-400 text-amber-200 font-bold text-[11px]">📝 Ý Tưởng Chợt Lóe</button>',
        '  <button type="button" data-scratch-tab="DIALOGUE_SPARKS" class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold text-[11px]">💬 Câu Thoại Đắt Giá</button>',
        '  <button type="button" data-scratch-tab="OUTLINE_FIXES" class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold text-[11px]">🔧 Ghi Chú Sửa Plot</button>',
        '</div>',
        '<div class="flex items-center gap-1.5">',
        '  <button type="button" id="btn-scratchpad-append-to-editor" class="px-2.5 py-1 rounded-lg bg-emerald-600/20 border border-emerald-500/40 hover:bg-emerald-600/35 text-emerald-300 font-bold text-[11px]">↳ Chèn nháp vào chương</button>',
        '  <button type="button" id="btn-scratchpad-rescan-now" class="px-2.5 py-1 rounded-lg bg-rose-600/20 border border-rose-500/40 hover:bg-rose-600/35 text-rose-300 font-bold text-[11px]">🔍 Quét lại chương</button>',
        '</div>'
      ].join('\n');

      ta.parentElement.insertBefore(strip, ta);

      strip.querySelectorAll('[data-scratch-tab]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const nextTab = btn.getAttribute('data-scratch-tab');
          this.engine.scratchpadStore.persistActiveText(ta.value);
          ta.value = this.engine.scratchpadStore.switchTab(nextTab);
          this.updateSubtabButtonStyles(nextTab);
        });
      });

      strip
        .querySelector('#btn-scratchpad-append-to-editor')
        ?.addEventListener('click', () => {
          this.engine.insertScratchpadDraftToEditor(ta.value);
        });

      strip
        .querySelector('#btn-scratchpad-rescan-now')
        ?.addEventListener('click', () => {
          this.engine.runFullScanAndRenderReport();
        });

      return true;
    }

    updateSubtabButtonStyles(activeKey) {
      const strip = document.getElementById('scratchpad-subtabs-strip');
      if (!strip) return;
      strip.querySelectorAll('[data-scratch-tab]').forEach((btn) => {
        const key = btn.getAttribute('data-scratch-tab');
        if (key === activeKey) {
          btn.className =
            'px-2.5 py-1 rounded-lg bg-amber-500/25 border border-amber-400 text-amber-200 font-bold text-[11px]';
        } else {
          btn.className =
            'px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold text-[11px]';
        }
      });
    }

    renderScanReportIntoModal(scanBundle) {
      const box = document.getElementById('cliche-and-pacing-report-box');
      if (!box) return;
      const esc = getUtils().escapeHtml;

      const {
        chapterTitle,
        wordCount,
        crispnessScore,
        clicheResult,
        echoList,
        filterVerbs,
        segments
      } = scanBundle;

      const scoreBadgeTone =
        crispnessScore >= 85
          ? 'text-emerald-300 border-emerald-500/40 bg-emerald-500/15'
          : crispnessScore >= 65
            ? 'text-amber-300 border-amber-500/40 bg-amber-500/15'
            : 'text-rose-300 border-rose-500/40 bg-rose-500/15';

      // 1. Phần đầu tổng quan + Bản đồ nhiệt nhịp truyện
      const heatmapHtml =
        segments.length === 0
          ? '<div class="text-[11px] text-zinc-500 italic">Chưa đủ nội dung văn bản để vẽ Heatmap nhịp truyện.</div>'
          : [
              '<div class="space-y-1.5">',
              '  <div class="text-[11px] font-bold uppercase text-indigo-300">📊 Bản Đồ Nhiệt Nhịp Độ & Căng Thẳng Theo Từng Khúc Chương</div>',
              '  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">',
              ...segments.map(
                (seg) =>
                  `<div class="p-2 rounded-xl border border-zinc-800 bg-zinc-900/90 space-y-1" title="${esc(
                    seg.firstLinePreview
                  )}">` +
                  `  <div class="flex items-center justify-between text-[10px]"><strong class="text-zinc-200">${esc(
                    seg.label
                  )}</strong><span class="font-monoCode text-amber-300">${seg.intensityScore}%</span></div>` +
                  `  <div class="w-full h-2 rounded-full bg-zinc-800 overflow-hidden"><div class="h-full bg-gradient-to-r ${seg.barColor}" style="width: ${seg.intensityScore}%;"></div></div>` +
                  `  <div class="text-[9px] text-zinc-400">${esc(
                    seg.paceLabel
                  )} · ~${seg.avgSentenceWords} từ/câu · ${seg.dialogueRatio}% thoại</div>` +
                  '</div>'
              ),
              '  </div>',
              '</div>'
            ].join('\n');

      // 2. Danh sách sáo ngữ AI phát hiện (bấm là nhảy ngay tới đúng vị trí trong Tab 1)
      const clicheListHtml =
        clicheResult.hits.length === 0
          ? '<div class="p-3 rounded-xl border border-emerald-500/35 bg-emerald-950/30 text-emerald-200 text-xs font-semibold">✨ Tuyệt vời! Không phát hiện cụm sáo ngữ AI rập khuôn nào trong chương này.</div>'
          : [
              `<div class="space-y-2">`,
              `  <div class="text-[11px] font-bold uppercase text-rose-300">🚨 Phát Hiện ${clicheResult.totalHits} Vị Trí Nghi Sáo Ngữ AI (${clicheResult.uniquePhrases} mẫu từ) — Bấm để nhảy thẳng tới đoạn sửa:</div>`,
              ...clicheResult.hits.map((hit, hitIdx) => {
                const firstOcc = hit.occurrences[0];
                const altText = (hit.alternatives || []).slice(0, 2).join('  |  ');
                const safeFirstReplace =
                  (hit.alternatives &&
                    hit.alternatives[0] &&
                    !hit.alternatives[0].startsWith('(') &&
                    !hit.alternatives[0].startsWith('Thay bằng') &&
                    !hit.alternatives[0].startsWith('Viết lại'))
                    ? hit.alternatives[0]
                    : '';

                return [
                  `<div class="p-2.5 rounded-xl border border-rose-500/35 bg-rose-950/25 space-y-1.5 text-[11px]">`,
                  `  <div class="flex flex-wrap items-center justify-between gap-2">`,
                  `    <div class="font-bold text-rose-200">“${esc(hit.phrase)}” <span class="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px]">×${hit.count}</span> <span class="text-[10px] font-normal text-zinc-400">· ${esc(hit.category)}</span></div>`,
                  `    <div class="flex items-center gap-1.5">`,
                  `      <button type="button" data-jump-offset="${firstOcc.start}" data-jump-end="${firstOcc.end}" class="px-2.5 py-0.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px]">🎯 Tới chỗ lỗi</button>`,
                  safeFirstReplace
                    ? `<button type="button" data-quick-fix-idx="${hitIdx}" data-fix-phrase="${esc(hit.phrase)}" data-fix-replacement="${esc(safeFirstReplace)}" class="px-2.5 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px]">✨ Thay mẫu người viết</button>`
                    : '',
                  `    </div>`,
                  `  </div>`,
                  `  <div class="text-[10px] text-zinc-300 italic">Ngữ cảnh: “…${esc(firstOcc.snippet)}…”</div>`,
                  altText
                    ? `  <div class="text-[10px] text-emerald-300">💡 Gợi ý viết lại giàu hình ảnh: ${esc(altText)}</div>`
                    : '',
                  `</div>`
                ].join('');
              }),
              '</div>'
            ].join('\n');

      // 3. Từ lặp gần nhau (Echo Words) & Động từ kể thay vì tả
      const echoHtml =
        echoList.length === 0
          ? ''
          : [
              '<div class="p-2.5 rounded-xl border border-amber-500/30 bg-amber-950/20 space-y-1 text-[11px]">',
              '  <div class="font-bold uppercase text-amber-300">🔁 Từ Bị Lặp Gần Nhau Trong Đoạn Ngắn (Echo Words):</div>',
              `  <div class="flex flex-wrap gap-1.5">${echoList
                .map(
                  (e) =>
                    `<button type="button" data-find-word="${esc(
                      e.word
                    )}" class="px-2 py-0.5 rounded-lg border border-amber-500/35 bg-zinc-900 hover:bg-amber-500/20 text-amber-200 font-semibold text-[10px]" title="${esc(
                      e.note
                    )}">“${esc(e.word)}” (lặp ×${e.echoEvents})</button>`
                )
                .join('')}</div>`,
              '</div>'
            ].join('\n');

      const filterHtml =
        filterVerbs.length === 0
          ? ''
          : [
              '<div class="p-2.5 rounded-xl border border-purple-500/30 bg-purple-950/20 space-y-1 text-[11px]">',
              '  <div class="font-bold uppercase text-purple-300">👁️ Động Từ Kể Cảm Xúc / Phỏng Đoán (Cân nhắc chuyển sang Show-Don\'t-Tell):</div>',
              ...filterVerbs.map(
                (fv) =>
                  `<div class="text-[10px] text-zinc-300">• <strong>"${esc(
                    fv.token
                  )}"</strong> (${fv.count} lần): ${esc(fv.advice)}</div>`
              ),
              '</div>'
            ].join('\n');

      box.innerHTML = [
        '<div class="p-3 rounded-xl border border-zinc-800 bg-zinc-900/90 flex flex-wrap items-center justify-between gap-2">',
        `  <div><div class="font-extrabold text-zinc-100 text-xs">Báo Cáo Độ Sắc Nét Văn Phong: ${esc(
          chapterTitle
        )}</div><div class="text-[10px] text-zinc-400">Tổng dung lượng quét: ${wordCount.toLocaleString(
          'vi-VN'
        )} từ</div></div>`,
        `  <div class="px-3 py-1 rounded-full border font-extrabold text-xs ${scoreBadgeTone}">Độ tự nhiên Con Người: ${crispnessScore}/100</div>`,
        '</div>',
        heatmapHtml,
        clicheListHtml,
        echoHtml,
        filterHtml
      ]
        .filter(Boolean)
        .join('\n');

      this.bindReportInteractiveButtons(box);
    }

    bindReportInteractiveButtons(box) {
      box.querySelectorAll('[data-jump-offset]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const start = parseInt(btn.getAttribute('data-jump-offset'), 10) || 0;
          const end = parseInt(btn.getAttribute('data-jump-end'), 10) || start;
          this.engine.jumpToPositionInTab1Editor(start, end);
        });
      });

      box.querySelectorAll('[data-quick-fix-idx]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const phrase = btn.getAttribute('data-fix-phrase');
          const replacement = btn.getAttribute('data-fix-replacement');
          this.engine.replaceOneClicheInEditor(phrase, replacement);
        });
      });

      box.querySelectorAll('[data-find-word]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const word = btn.getAttribute('data-find-word');
          this.engine.openFindBarForWord(word);
        });
      });
    }
  }

  // ==========================================================================
  // LỚP 5: BỘ PHÂN TÍCH TỪ TÍNH TỪ LẠM DỤNG, CÂU BỊ ĐỘNG & TỔNG QUAN TOÀN BỘ SÁCH
  // ==========================================================================
  const HEAVY_MODIFIER_WORDS = Object.freeze([
    'vô cùng',
    'cực kỳ',
    'hết sức',
    'hoàn toàn',
    'tuyệt đối',
    'thực sự',
    'quả thật',
    'khó tin',
    'kinh khủng',
    'đáng sợ'
  ]);

  const PASSIVE_FILLER_CONSTRUCTIONS = Object.freeze([
    'bị làm cho',
    'được biết đến là',
    'có thể nói rằng',
    'một cách kỳ lạ',
    'một cách chậm rãi',
    'một cách lạnh lùng',
    'trở nên căng thẳng',
    'mang lại cảm giác'
  ]);

  class LiteraryStyleWeaknessAndBookScanner {
    constructor(engine) {
      this.engine = engine;
    }

    scanHeavyModifiersAndFillers(chapterText) {
      const text = String(chapterText || '');
      const wordCount = Math.max(1, getUtils().countVietnameseWords(text));
      const modifierHits = [];
      const fillerHits = [];

      for (const word of HEAVY_MODIFIER_WORDS) {
        const re = new RegExp(`\\b${escapeRegExp(word)}\\b`, 'gi');
        const m = text.match(re);
        if (m && m.length >= 2) {
          modifierHits.push({ token: word, count: m.length });
        }
      }

      for (const filler of PASSIVE_FILLER_CONSTRUCTIONS) {
        const re = new RegExp(escapeRegExp(filler), 'gi');
        const m = text.match(re);
        if (m && m.length >= 1) {
          fillerHits.push({ token: filler, count: m.length });
        }
      }

      const totalModifiers = modifierHits.reduce((s, i) => s + i.count, 0);
      const modifierDensityPct =
        Math.round((totalModifiers / wordCount) * 1000) / 10;

      return {
        modifierHits: modifierHits.sort((a, b) => b.count - a.count),
        fillerHits: fillerHits.sort((a, b) => b.count - a.count),
        modifierDensityPerThousand: modifierDensityPct,
        verdict:
          modifierDensityPct > 4.5
            ? 'Mật độ phó từ cường điệu ("vô cùng/cực kỳ/hết sức") hơi cao — cắt bớt để động từ tự tỏa lực mạnh hơn.'
            : 'Tỷ lệ phó từ bổ trợ đang ở mức tự nhiên.'
      };
    }

    scanAllChaptersSummary() {
      const chapters = NS.chapterManager?.chapters || NS.state?.chapters || [];
      const rows = [];
      for (const ch of chapters) {
        const text = String(ch.content || '');
        const wc = getUtils().countVietnameseWords(text);
        const clicheRes = this.engine.blacklistScanner.scanTextForCliches(text);
        const echoRes =
          this.engine.blacklistScanner.scanLocalEchoWordRepetitions(text);
        const filterVerbs =
          this.engine.pacingAnalyzer.scanFilterAndTellVerbs(text);
        const segments = this.engine.pacingAnalyzer.computePacingSegments(text, 4);
        const score = this.engine.pacingAnalyzer.computeOverallProseCrispnessScore(
          clicheRes,
          echoRes,
          filterVerbs,
          segments
        );
        rows.push({
          chapterId: ch.id,
          title: ch.displayTitle || ch.title || 'Chương',
          words: wc,
          clicheCount: clicheRes.totalHits,
          echoCount: echoRes.length,
          crispnessScore: score
        });
      }
      return rows;
    }

    exportBookStyleAuditMarkdown() {
      const rows = this.scanAllChaptersSummary();
      const lines = [
        `# BÁO CÁO QUÉT SÁO NGỮ AI & NHỊP VĂN PHONG TOÀN TẬP (${new Date().toLocaleString('vi-VN')})`,
        '',
        '| Chương | Số Từ | Sáo Ngữ AI | Từ Lặp Gần | Điểm Tự Nhiên |',
        '|---|---:|---:|---:|---:|'
      ];
      for (const r of rows) {
        lines.push(
          `| ${r.title} | ${r.words} | ${r.clicheCount} | ${r.echoCount} | ${r.crispnessScore}/100 |`
        );
      }
      return lines.join('\n');
    }
  }

  // ==========================================================================
  // LỚP 6: TRUNG TÂM NHÁP NHANH & SOI SÁO NGỮ (`NoirStudio.clicheScanner`)
  // ==========================================================================
  class ClicheScannerAndScratchpadEngine {
    constructor() {
      this.blacklistScanner = new AntiClicheBlacklistScanner();
      this.pacingAnalyzer = new NarrativePacingAndHeatmapAnalyzer();
      this.scratchpadStore = new MultiTabScratchpadStore();
      this.reportRenderer = new ClicheAndPacingReportRenderer(this);
      this.bookStyleAuditor = new LiteraryStyleWeaknessAndBookScanner(this);
      this.lastScanBundle = null;
      this.hasInitialized = false;
    }

    init() {
      this.hydrateScratchpadFromStorage();
      this.reportRenderer.ensureScratchpadTabStripMounted();
      this.bindDOM();
      this.hasInitialized = true;
      return this;
    }

    hydrateScratchpadFromStorage() {
      const ta = document.getElementById('textarea-quick-scratchpad');
      if (ta) {
        ta.value = this.scratchpadStore.getCurrentTabText();
      }
    }

    getActiveChapterTextAndTitle() {
      const editor = document.getElementById('textarea-chapter-content');
      const titleInp = document.getElementById('input-chapter-title');
      const activeChap = NS.chapterManager?.getActiveChapter?.();
      return {
        title:
          titleInp?.value?.trim() ||
          activeChap?.displayTitle ||
          activeChap?.title ||
          'Chương đang viết',
        text: editor ? editor.value : activeChap?.content || ''
      };
    }

    openModal({ autoScan = false, customTitle = '' } = {}) {
      const modal = document.getElementById('modal-quick-scratchpad');
      const titleEl = document.getElementById('scratchpad-modal-title');
      const reportBox = document.getElementById('cliche-and-pacing-report-box');
      if (!modal) return false;

      this.reportRenderer.ensureScratchpadTabStripMounted();
      this.hydrateScratchpadFromStorage();

      if (titleEl) {
        titleEl.textContent =
          customTitle ||
          (autoScan
            ? '🔍 Báo Cáo Soi Sáo Ngữ AI (Anti-Cliche) & Bản Đồ Nhiệt Nhịp Truyện'
            : '⚡ Bảng Trắng Nháp Nhanh Ý Tưởng & Kiểm Tra Nhịp Văn Phong');
      }

      modal.classList.remove('hidden');

      if (autoScan) {
        if (reportBox) reportBox.classList.remove('hidden');
        this.runFullScanAndRenderReport();
      } else if (reportBox) {
        if (this.lastScanBundle) {
          reportBox.classList.remove('hidden');
        } else {
          reportBox.classList.add('hidden');
        }
      }

      return true;
    }

    closeModal() {
      const modal = document.getElementById('modal-quick-scratchpad');
      if (modal) modal.classList.add('hidden');
    }

    runFullScanAndRenderReport() {
      const { title, text } = this.getActiveChapterTextAndTitle();
      const utils = getUtils();
      const wordCount = utils.countVietnameseWords(text);
      const clicheResult = this.blacklistScanner.scanTextForCliches(text);
      const echoList =
        this.blacklistScanner.scanLocalEchoWordRepetitions(text);
      const filterVerbs = this.pacingAnalyzer.scanFilterAndTellVerbs(text);
      const segments = this.pacingAnalyzer.computePacingSegments(text, 6);
      const styleWeakness =
        this.bookStyleAuditor.scanHeavyModifiersAndFillers(text);
      const crispnessScore =
        this.pacingAnalyzer.computeOverallProseCrispnessScore(
          clicheResult,
          echoList,
          filterVerbs,
          segments
        );

      const bundle = {
        chapterTitle: title,
        wordCount,
        crispnessScore,
        clicheResult,
        echoList,
        filterVerbs,
        segments,
        styleWeakness
      };

      this.lastScanBundle = bundle;

      const reportBox = document.getElementById('cliche-and-pacing-report-box');
      if (reportBox) {
        reportBox.classList.remove('hidden');
        this.reportRenderer.renderScanReportIntoModal(bundle);
        this.appendStyleWeaknessBlock(reportBox, styleWeakness);
      }

      if (NS.bus && typeof NS.bus.emit === 'function') {
        NS.bus.emit('cliche:scanned', {
          chapterTitle: title,
          totalHits: clicheResult.totalHits,
          crispnessScore
        });
      }

      return bundle;
    }

    appendStyleWeaknessBlock(reportBox, styleWeakness) {
      if (
        !reportBox ||
        (!styleWeakness.modifierHits.length && !styleWeakness.fillerHits.length)
      ) {
        return;
      }
      const esc = getUtils().escapeHtml;
      const div = document.createElement('div');
      div.className =
        'p-2.5 rounded-xl border border-zinc-700 bg-zinc-900/80 space-y-1 text-[10px] text-zinc-300';
      div.innerHTML = [
        `<div class="font-bold text-teal-300 uppercase">🎛️ Mật Độ Phó Từ & Cụm Đệm: ${esc(
          styleWeakness.verdict
        )}</div>`,
        styleWeakness.modifierHits.length > 0
          ? `<div>Phó từ hay lặp: ${styleWeakness.modifierHits
              .map((m) => `<strong>${esc(m.token)}</strong> (×${m.count})`)
              .join(', ')}</div>`
          : '',
        styleWeakness.fillerHits.length > 0
          ? `<div>Cụm văn kể hơi dài dòng: ${styleWeakness.fillerHits
              .map((f) => `<strong>"${esc(f.token)}"</strong> (×${f.count})`)
              .join(', ')}</div>`
          : ''
      ]
        .filter(Boolean)
        .join('');
      reportBox.appendChild(div);
    }

    jumpToPositionInTab1Editor(startOffset, endOffset) {
      this.closeModal();
      if (NS.navigator && typeof NS.navigator.navigateToScreen === 'function') {
        NS.navigator.navigateToScreen('SCREEN_1_WRITE');
      }
      const editor = document.getElementById('textarea-chapter-content');
      if (!editor) return false;
      const len = editor.value.length;
      const s = Math.max(0, Math.min(len, startOffset));
      const e = Math.max(s, Math.min(len, endOffset));

      setTimeout(() => {
        editor.focus();
        editor.setSelectionRange(s, e);
        const beforeLines = editor.value.slice(0, s).split('\n').length;
        const lineHeight = parseFloat(getComputedStyle(editor).lineHeight) || 26;
        editor.scrollTop = Math.max(
          0,
          beforeLines * lineHeight - editor.clientHeight * 0.35
        );
      }, 60);

      getUtils().showToast(
        '🎯 Đã nhảy tới đúng cụm từ cần trau chuốt trong bản thảo!',
        'info',
        2200
      );
      return true;
    }

    replaceOneClicheInEditor(phrase, replacement) {
      const editor = document.getElementById('textarea-chapter-content');
      if (!editor || !phrase || !replacement) return false;

      const re = new RegExp(escapeRegExp(phrase), 'i');
      if (!re.test(editor.value)) return false;

      if (NS.autoSaver && typeof NS.autoSaver.pushUndoSnapshot === 'function') {
        NS.autoSaver.pushUndoSnapshot(
          editor.value,
          `Trước khi thay sáo ngữ "${phrase}"`
        );
      }

      editor.value = editor.value.replace(re, replacement);

      if (NS.editorTools && typeof NS.editorTools.notifyEditorMutated === 'function') {
        NS.editorTools.notifyEditorMutated('CLICHE_AUTO_REPLACE');
      }
      this.runFullScanAndRenderReport();
      getUtils().showToast(
        `✨ Đã thay 1 chỗ "${phrase}" bằng cách diễn đạt tự nhiên hơn!`,
        'success'
      );
      return true;
    }

    openFindBarForWord(word) {
      this.closeModal();
      if (NS.navigator && typeof NS.navigator.navigateToScreen === 'function') {
        NS.navigator.navigateToScreen('SCREEN_1_WRITE');
      }
      const findInp = document.getElementById('input-find-text');
      if (findInp) findInp.value = String(word || '');
      if (NS.editorTools?.findEngine) {
        NS.editorTools.findEngine.openBar(false);
        NS.editorTools.findEngine.findNextAndHighlight();
      }
    }

    insertScratchpadDraftToEditor(draftText) {
      const text = String(draftText || '').trim();
      const editor = document.getElementById('textarea-chapter-content');
      if (!text || !editor) {
        getUtils().showToast('⚠️ Ô nháp nhanh đang trống.', 'warn');
        return false;
      }

      if (NS.autoSaver && typeof NS.autoSaver.pushUndoSnapshot === 'function') {
        NS.autoSaver.pushUndoSnapshot(editor.value, 'Trước khi chèn từ Nháp nhanh');
      }

      const existing = editor.value.replace(/\s+$/, '');
      editor.value = existing ? `${existing}\n\n${text}` : text;
      if (NS.editorTools && typeof NS.editorTools.notifyEditorMutated === 'function') {
        NS.editorTools.notifyEditorMutated('INSERT_FROM_SCRATCHPAD');
      }
      this.closeModal();
      getUtils().showToast('↳ Đã chèn ghi chú từ Bảng Trắng vào cuối bản thảo Tab 1!', 'success');
      return true;
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
        'btn-open-scratchpad',
        'click',
        () => this.openModal({ autoScan: false }),
        'mod24_open_scratchpad'
      );

      bindOnce(
        'btn-scan-cliches',
        'click',
        () => this.openModal({ autoScan: true }),
        'mod24_open_scan_cliches'
      );

      bindOnce(
        'btn-close-scratchpad',
        'click',
        () => this.closeModal(),
        'mod24_close_scratchpad'
      );

      bindOnce(
        'textarea-quick-scratchpad',
        'input',
        (ev) => {
          this.scratchpadStore.persistActiveText(ev.target?.value || '');
        },
        'mod24_scratchpad_input'
      );
    }

    getHealthReport() {
      const bundle = this.runScanHeadless();
      return {
        module: 'mod24_cliche_scanner_and_pacing_heatmap.js',
        initialized: this.hasInitialized,
        crispnessScore: bundle.crispnessScore,
        clichesFound: bundle.clicheResult.totalHits,
        echoWordsFound: bundle.echoList.length
      };
    }

    runScanHeadless() {
      const { title, text } = this.getActiveChapterTextAndTitle();
      const clicheResult = this.blacklistScanner.scanTextForCliches(text);
      const echoList =
        this.blacklistScanner.scanLocalEchoWordRepetitions(text);
      const filterVerbs = this.pacingAnalyzer.scanFilterAndTellVerbs(text);
      const segments = this.pacingAnalyzer.computePacingSegments(text, 6);
      const crispnessScore =
        this.pacingAnalyzer.computeOverallProseCrispnessScore(
          clicheResult,
          echoList,
          filterVerbs,
          segments
        );
      return {
        chapterTitle: title,
        wordCount: getUtils().countVietnameseWords(text),
        crispnessScore,
        clicheResult,
        echoList,
        filterVerbs,
        segments
      };
    }
  }

  // ==========================================================================
  // LỚP 7: BỘ GỢI Ý ĐỘ DÀI CÂU & TƯƠNG QUAN ĐỐI THOẠI / MIÊU TẢ THEO THỂ LOẠI
  // ==========================================================================
  const GENRE_PACING_BENCHMARKS = Object.freeze({
    LIGHT_NOVEL: {
      label: 'Light Novel Hiện Đại',
      idealSentenceWordsMin: 9,
      idealSentenceWordsMax: 18,
      idealDialoguePctMin: 35,
      idealDialoguePctMax: 60
    },
    NOIR_THRILLER: {
      label: 'Trinh Thám / Noir Tâm Lý',
      idealSentenceWordsMin: 11,
      idealSentenceWordsMax: 22,
      idealDialoguePctMin: 25,
      idealDialoguePctMax: 48
    },
    XIANXIA_FANTASY: {
      label: 'Huyền Ảo / Tu Tiên / Sử Thi',
      idealSentenceWordsMin: 12,
      idealSentenceWordsMax: 24,
      idealDialoguePctMin: 22,
      idealDialoguePctMax: 45
    },
    ROMANCE_DRAMA: {
      label: 'Tình Cảm Tâm Lý / Chữa Lành',
      idealSentenceWordsMin: 10,
      idealSentenceWordsMax: 20,
      idealDialoguePctMin: 30,
      idealDialoguePctMax: 55
    }
  });

  class GenreRhythmAndSentenceVarietyAdvisor {
    constructor(engine) {
      this.engine = engine;
    }

    evaluateSentenceLengthVariety(chapterText) {
      const sentences = String(chapterText || '')
        .split(/(?<=[.!?…])\s+|\n+/)
        .map((s) => s.trim())
        .filter((s) => s.length >= 6);

      if (sentences.length < 4) {
        return {
          totalSentences: sentences.length,
          shortSentences: 0,
          mediumSentences: 0,
          longSentences: 0,
          varietyScore: 100,
          advice: 'Cần thêm vài câu hoàn chỉnh để đo độ đa dạng nhịp câu.'
        };
      }

      const utils = getUtils();
      let shortSentences = 0;
      let mediumSentences = 0;
      let longSentences = 0;

      for (const s of sentences) {
        const wc = utils.countVietnameseWords(s);
        if (wc <= 8) shortSentences += 1;
        else if (wc <= 20) mediumSentences += 1;
        else longSentences += 1;
      }

      const total = sentences.length;
      const shortPct = Math.round((shortSentences / total) * 100);
      const medPct = Math.round((mediumSentences / total) * 100);
      const longPct = Math.round((longSentences / total) * 100);

      let varietyScore = 95;
      let advice =
        'Phối hợp nhịp câu ngắn/vừa/dài rất hài hòa, tạo nhạc tính tự nhiên khi đọc!';

      if (shortPct > 68) {
        varietyScore = 72;
        advice =
          'Nhiều câu ngắn rời rạc liên tiếp (>68%). Hãy nối vài câu miêu tả liền ý để văn phong trôi chảy hơn.';
      } else if (longPct > 45) {
        varietyScore = 68;
        advice =
          'Tỷ lệ câu quá dài >20 từ hơi cao. Tách bớt ở các đoạn cao trào để giữ sự sắc gọn.';
      } else if (shortSentences === 0) {
        varietyScore = 78;
        advice =
          'Thiếu những câu nhấn ngắn 3–6 từ tạo điểm dừng cảm xúc đột ngột.';
      }

      return {
        totalSentences: total,
        shortSentences,
        mediumSentences,
        longSentences,
        shortPct,
        medPct,
        longPct,
        varietyScore,
        advice
      };
    }

    compareChapterAgainstGenreBenchmark(chapterText, genreKey = 'LIGHT_NOVEL') {
      const bench =
        GENRE_PACING_BENCHMARKS[genreKey] || GENRE_PACING_BENCHMARKS.LIGHT_NOVEL;
      const segments = this.engine.pacingAnalyzer.computePacingSegments(
        chapterText,
        4
      );
      const avgSentence =
        segments.length > 0
          ? Math.round(
              segments.reduce((s, seg) => s + seg.avgSentenceWords, 0) /
                segments.length
            )
          : 0;
      const avgDialogue =
        segments.length > 0
          ? Math.round(
              segments.reduce((s, seg) => s + seg.dialogueRatio, 0) /
                segments.length
            )
          : 0;

      return {
        genreLabel: bench.label,
        avgSentenceWords: avgSentence,
        idealSentenceRange: `${bench.idealSentenceWordsMin}-${bench.idealSentenceWordsMax} từ/câu`,
        avgDialoguePercent: avgDialogue,
        idealDialogueRange: `${bench.idealDialoguePctMin}-${bench.idealDialoguePctMax}%`,
        fitsSentencePace:
          avgSentence >= bench.idealSentenceWordsMin &&
          avgSentence <= bench.idealSentenceWordsMax,
        fitsDialoguePace:
          avgDialogue >= bench.idealDialoguePctMin &&
          avgDialogue <= bench.idealDialoguePctMax
      };
    }
  }

  // Nối phân tích đa dạng nhịp câu vào báo cáo Modal Quét Sáo Ngữ
  const origRenderScanModal =
    ClicheAndPacingReportRenderer.prototype.renderScanReportIntoModal;
  ClicheAndPacingReportRenderer.prototype.renderScanReportIntoModal = function (
    scanBundle
  ) {
    origRenderScanModal.call(this, scanBundle);
    const box = document.getElementById('cliche-and-pacing-report-box');
    if (!box || !this.engine.rhythmAdvisor) return;

    const { text } = this.engine.getActiveChapterTextAndTitle();
    const variety =
      this.engine.rhythmAdvisor.evaluateSentenceLengthVariety(text);
    const bench = this.engine.rhythmAdvisor.compareChapterAgainstGenreBenchmark(
      text,
      'LIGHT_NOVEL'
    );
    const esc = getUtils().escapeHtml;

    const meter = document.createElement('div');
    meter.className =
      'p-2.5 rounded-xl border border-sky-500/30 bg-sky-950/20 space-y-1 text-[10px] text-zinc-300';
    meter.innerHTML = [
      `<div class="font-bold text-sky-300 uppercase">🎵 Nhạc Tính Độ Dài Câu (${variety.totalSentences} câu · Điểm: ${variety.varietyScore}/100)</div>`,
      `<div>Câu ngắn (≤8 từ): <strong>${variety.shortPct || 0}%</strong> · Câu vừa (9–20 từ): <strong>${variety.medPct || 0}%</strong> · Câu dài (>20 từ): <strong>${variety.longPct || 0}%</strong></div>`,
      `<div class="text-sky-200">${esc(variety.advice)} <span class="text-zinc-400">(Chuẩn ${esc(bench.genreLabel)}: ${bench.idealSentenceRange}, ${bench.idealDialogueRange} thoại)</span></div>`
    ].join('');
    box.appendChild(meter);
  };

  // ==========================================================================
  // LỚP 8: BIỂU ĐỒ ĐƯỜNG SÓNG CẢM XÚC & BẮT LỖI CẤU TRÚC CÂU ĐỐI XỨNG AI
  // ==========================================================================
  const POSITIVE_WARM_LEXICON = Object.freeze([
    'ấm áp',
    'mỉm cười',
    'nhẹ nhõm',
    'tin tưởng',
    'hi vọng',
    'hy vọng',
    'bình yên',
    'ánh nắng',
    'bảo vệ',
    'dịu dàng',
    'thở ra'
  ]);

  const DARK_TENSE_LEXICON = Object.freeze([
    'máu',
    'lạnh ngắt',
    'tối',
    'bóng đêm',
    'sợ hãi',
    'phản bội',
    'cái chết',
    'ngạt thở',
    'im lặng',
    'run rẩy',
    'lưỡi dao',
    'nghi ngờ',
    'biến mất'
  ]);

  class EmotionArcAndAiSymmetryDetector {
    constructor(engine) {
      this.engine = engine;
    }

    traceEmotionPolarityCurve(chapterText, buckets = 6) {
      const blocks = String(chapterText || '')
        .split(/\n+/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (blocks.length === 0) return [];

      const countBuckets = Math.min(buckets, blocks.length);
      const step = Math.ceil(blocks.length / countBuckets);
      const curve = [];

      for (let i = 0; i < countBuckets; i += 1) {
        const text = blocks.slice(i * step, (i + 1) * step).join(' ').toLowerCase();
        let warm = 0;
        let dark = 0;
        for (const w of POSITIVE_WARM_LEXICON) {
          warm += Math.max(0, text.split(w).length - 1);
        }
        for (const d of DARK_TENSE_LEXICON) {
          dark += Math.max(0, text.split(d).length - 1);
        }
        const polarity = Math.max(-10, Math.min(10, warm * 2 - dark * 2));
        curve.push({
          bucket: i + 1,
          warmHits: warm,
          darkHits: dark,
          polarity,
          tone:
            polarity > 1
              ? 'Sáng / Ấm áp'
              : polarity < -1
                ? 'Tối / Áp lực cao'
                : 'Trung tính cân bằng'
        });
      }
      return curve;
    }

    detectAiSymmetricTriadPatterns(chapterText) {
      const text = String(chapterText || '');
      const patterns = [
        {
          label: 'Cấu trúc AI lặp nhịp "Không phải... mà là..."',
          regex: /không\s+phải\s+[^.!?\n]{3,55},?\s+mà\s+(?:chính\s+)?là\b/gi
        },
        {
          label: 'Cụm đối xứng liệt kê 3 vế máy móc ("Không chỉ... mà còn...")',
          regex: /không\s+chỉ\s+[^.!?\n]{3,65}\s+mà\s+còn\b/gi
        },
        {
          label: 'Lối dẫn chuyện giả triết lý "Có lẽ... hoặc cũng có lẽ..."',
          regex: /có\s+lẽ\s+[^.!?\n]{3,55},?\s+cũng\s+có\s+lẽ\b/gi
        },
        {
          label: 'Kể cảm xúc kép sáo rỗng ("vừa... lại vừa...")',
          regex: /vừa\s+[^\s]{2,14}\s+[^\s]{1,14},?\s+lại\s+vừa\b/gi
        }
      ];

      const findings = [];
      for (const p of patterns) {
        const matches = text.match(p.regex);
        if (matches && matches.length >= 2) {
          findings.push({
            label: p.label,
            count: matches.length,
            sample: matches[0].slice(0, 88)
          });
        }
      }
      return findings;
    }

    buildPolaritySparklineSvg(curve = []) {
      if (!Array.isArray(curve) || curve.length < 2) return '';
      const width = 280;
      const height = 46;
      const midY = 23;
      const pts = curve.map((pt, idx) => {
        const x = Math.round((idx / (curve.length - 1)) * (width - 20) + 10);
        const y = Math.round(midY - (pt.polarity / 10) * 16);
        return `${x},${y}`;
      });
      return [
        `<svg viewBox="0 0 ${width} ${height}" class="w-full max-w-md h-12 rounded-lg bg-zinc-950/90 border border-zinc-800">`,
        `  <line x1="8" y1="${midY}" x2="${width - 8}" y2="${midY}" stroke="#3f3f46" stroke-dasharray="3 3" stroke-width="1" />`,
        `  <polyline fill="none" stroke="#34d399" stroke-width="2.2" points="${pts.join(' ')}" />`,
        ...curve.map((pt, idx) => {
          const x = Math.round((idx / (curve.length - 1)) * (width - 20) + 10);
          const y = Math.round(midY - (pt.polarity / 10) * 16);
          const fill = pt.polarity < 0 ? '#fb7185' : pt.polarity > 0 ? '#34d399' : '#facc15';
          return `<circle cx="${x}" cy="${y}" r="3.2" fill="${fill}" />`;
        }),
        '</svg>'
      ].join('');
    }
  }

  // Nối biểu đồ cảm xúc & cảnh báo cấu trúc câu đối xứng vào Modal Báo Cáo
  const prevRenderScan =
    ClicheAndPacingReportRenderer.prototype.renderScanReportIntoModal;
  ClicheAndPacingReportRenderer.prototype.renderScanReportIntoModal = function (
    scanBundle
  ) {
    prevRenderScan.call(this, scanBundle);
    const box = document.getElementById('cliche-and-pacing-report-box');
    if (!box || !this.engine.emotionTracer) return;

    const { text } = this.engine.getActiveChapterTextAndTitle();
    const curve = this.engine.emotionTracer.traceEmotionPolarityCurve(text, 6);
    const symmetries =
      this.engine.emotionTracer.detectAiSymmetricTriadPatterns(text);
    const esc = getUtils().escapeHtml;

    if (curve.length >= 2) {
      const wrap = document.createElement('div');
      wrap.className =
        'p-2.5 rounded-xl border border-indigo-500/30 bg-indigo-950/20 space-y-1.5 text-[10px] text-zinc-300';
      wrap.innerHTML = [
        '<div class="font-bold text-indigo-300 uppercase">〰️ Đường Sóng Nhiệt Cảm Xúc (Xanh: Ấm sáng · Đỏ: Tối căng thẳng)</div>',
        this.engine.emotionTracer.buildPolaritySparklineSvg(curve),
        symmetries.length > 0
          ? `<div class="text-amber-300 pt-1">📐 Phát hiện lặp cấu trúc câu AI: ${symmetries
              .map((s) => `<strong>${esc(s.label)}</strong> (×${s.count})`)
              .join('; ')}</div>`
          : ''
      ]
        .filter(Boolean)
        .join('\n');
      box.appendChild(wrap);
    }
  };

  // ==========================================================================
  // ĐĂNG KÝ SINGLETON LÊN `window.NoirStudio.clicheScanner`
  // ==========================================================================
  const clicheScannerEngine = new ClicheScannerAndScratchpadEngine();
  clicheScannerEngine.rhythmAdvisor =
    new GenreRhythmAndSentenceVarietyAdvisor(clicheScannerEngine);
  clicheScannerEngine.emotionTracer = new EmotionArcAndAiSymmetryDetector(
    clicheScannerEngine
  );

  clicheScannerEngine.exportBookStyleMarkdown = () =>
    clicheScannerEngine.bookStyleAuditor.exportBookStyleAuditMarkdown();
  clicheScannerEngine.scanAllChaptersForCliches = () =>
    clicheScannerEngine.bookStyleAuditor.scanAllChaptersSummary();
  clicheScannerEngine.traceEmotionArc = (text) =>
    clicheScannerEngine.emotionTracer.traceEmotionPolarityCurve(
      typeof text === 'string'
        ? text
        : clicheScannerEngine.getActiveChapterTextAndTitle().text
    );

  /**
   * Kiểm tra hiện tượng lặp âm/lặp từ ngữ đặc trưng (echo words) gần nhau giữa các câu văn tiếng Việt.
   */
  class CharacterVoiceEchoAuditor {
    constructor(windowWords = 28) {
      this.windowWords = windowWords;
      this.stopWords = new Set([
        'và', 'là', 'của', 'có', 'không', 'trong', 'ngoài', 'một', 'những', 'các',
        'này', 'kia', 'đó', 'đây', 'khi', 'nếu', 'nhưng', 'mà', 'thì', 'lại',
        'cũng', 'vẫn', 'đã', 'đang', 'sẽ', 'cho', 'với', 'từ', 'đến', 'lên', 'xuống',
        'vào', 'ra', 'qua', 'về', 'anh', 'em', 'cô', 'cậu', 'hắn', 'y', 'nàng', 'tôi',
        'ta', 'ngươi', 'họ', 'chúng', 'rằng', 'như', 'vậy', 'nên', 'bởi', 'vì', 'tại',
      ]);
    }

    tokenizeWordsWithOffsets(rawText) {
      const tokens = [];
      const regex = /[\p{L}\p{N}_-]+/gu;
      let match;
      while ((match = regex.exec(String(rawText || ''))) !== null) {
        tokens.push({
          word: match[0],
          lower: match[0].toLowerCase(),
          index: match.index,
        });
      }
      return tokens;
    }

    auditVoiceEchoes(rawText) {
      const tokens = this.tokenizeWordsWithOffsets(rawText);
      const echoClusters = [];
      const pairCounts = new Map();

      for (let i = 0; i < tokens.length; i += 1) {
        const cur = tokens[i];
        if (cur.lower.length < 3 || this.stopWords.has(cur.lower)) continue;

        const maxLookahead = Math.min(tokens.length - 1, i + this.windowWords);
        for (let j = i + 1; j <= maxLookahead; j += 1) {
          const target = tokens[j];
          if (target.lower === cur.lower) {
            const distanceWords = j - i;
            pairCounts.set(cur.lower, (pairCounts.get(cur.lower) || 0) + 1);
            echoClusters.push({
              word: cur.lower,
              distanceWords,
              firstOffset: cur.index,
              repeatOffset: target.index,
              excerpt: String(rawText || '').slice(
                Math.max(0, cur.index - 18),
                Math.min(String(rawText || '').length, target.index + cur.word.length + 18)
              ),
            });
            break;
          }
        }
      }

      const topRepeatedWords = Array.from(pairCounts.entries())
        .map(([word, hits]) => ({ word, closeRepeatHits: hits }))
        .sort((a, b) => b.closeRepeatHits - a.closeRepeatHits)
        .slice(0, 12);

      return {
        totalTokensScanned: tokens.length,
        closeEchoCount: echoClusters.length,
        topRepeatedWords,
        sampleEchoes: echoClusters.slice(0, 16),
        cleanlinessScore: Math.max(0, 100 - Math.min(80, echoClusters.length * 4)),
      };
    }
  }

  /**
   * So sánh nhịp điệu chuyển cảnh giữa đoạn mở, đoạn cao trào và đoạn kết chương.
   */
  class SceneBoundaryPacingComparator {
    constructor() {
      this.tensionVerbs = [
        'lao', 'chém', 'va', 'vỡ', 'nổ', 'gào', 'thét', 'giật', 'né', 'chạy',
        'run', 'nghẹt', 'sụp', 'bắn', 'đỡ', 'cắn', 'siết', 'ngã', 'thoát', 'đuổi',
      ];
      this.calmMarkers = [
        'trầm', 'lặng', 'gió', 'mưa', 'ánh', 'thở', 'ngồi', 'nhìn', 'mỉm',
        'chậm', 'nhẹ', 'mùi', 'khói', 'trà', 'đêm', 'chiều', 'tĩnh', 'im',
      ];
    }

    scoreSegmentIntensity(segmentText) {
      const clean = String(segmentText || '').toLowerCase();
      if (!clean.trim()) {
        return { wordCount: 0, sentenceCount: 0, avgSentenceWords: 0, tensionHits: 0, calmHits: 0, tempoScore: 0 };
      }
      const words = clean.split(/\s+/).filter(Boolean);
      const sentences = clean.split(/[.!?…]+/).filter((s) => s.trim().length > 0);
      let tensionHits = 0;
      let calmHits = 0;
      for (const verb of this.tensionVerbs) {
        if (clean.includes(verb)) tensionHits += 1;
      }
      for (const marker of this.calmMarkers) {
        if (clean.includes(marker)) calmHits += 1;
      }
      const avgSentenceWords = sentences.length > 0 ? Number((words.length / sentences.length).toFixed(1)) : words.length;
      const shortnessBoost = avgSentenceWords > 0 && avgSentenceWords <= 14 ? 22 : avgSentenceWords <= 20 ? 12 : 4;
      const tempoScore = Math.min(100, Math.max(5, Math.round(tensionHits * 11 - calmHits * 4 + shortnessBoost + 25)));
      return {
        wordCount: words.length,
        sentenceCount: sentences.length,
        avgSentenceWords,
        tensionHits,
        calmHits,
        tempoScore,
      };
    }

    compareOpeningMiddleEnding(rawText) {
      const text = String(rawText || '');
      const len = text.length;
      if (len < 120) {
        return {
          enoughContent: false,
          recommendation: 'Cần ít nhất ~120 ký tự để phân tích độ dốc nhịp độ chương.',
        };
      }
      const firstThirdEnd = Math.floor(len * 0.3);
      const middleEnd = Math.floor(len * 0.72);
      const opening = this.scoreSegmentIntensity(text.slice(0, firstThirdEnd));
      const climaxZone = this.scoreSegmentIntensity(text.slice(firstThirdEnd, middleEnd));
      const ending = this.scoreSegmentIntensity(text.slice(middleEnd));

      const hookStrength = ending.tempoScore >= opening.tempoScore - 5
        ? 'Kết chương giữ được dư âm hoặc lực kéo tốt'
        : 'Đoạn kết hạ nhịp hơi nhanh, cân nhắc gài thêm câu móc (cliffhanger)';

      return {
        enoughContent: true,
        opening,
        climaxZone,
        ending,
        tempoDeltaClimaxVsOpening: climaxZone.tempoScore - opening.tempoScore,
        recommendation: hookStrength,
      };
    }
  }

  /**
   * Tổng hợp gợi ý chỉnh văn phong gần người thật cho các cụm câu hay bị "mùi AI".
   */
  class AntiClicheQuickFixPreviewHelper {
    constructor() {
      this.humanRewriteBank = [
        {
          pattern: /không\s+chỉ\s+là[^,.!?]{2,50}\s+mà\s+còn/i,
          label: 'Cấu trúc liệt kê "không chỉ... mà còn"',
          tip: 'Tách thành hành động cụ thể hoặc miêu tả phản ứng cơ thể nhân vật thay vì tổng kết lý thuyết.',
          exampleAfter: 'Tay cô siết chặt cán kiếm. Gió lạnh lùa qua cổ áo còn buốt hơn cả lời đe dọa vừa rồi.',
        },
        {
          pattern: /một\s+cảm\s+giác\s+(?:khó\s+tả|kỳ\s+lạ|bất\s+an)\s+(?:dâng\s+lên|trỗi\s+dậy)/i,
          label: 'Cụm trừu tượng "một cảm giác khó tả dâng lên"',
          tip: 'Dùng nguyên tắc Show Don’t Tell: miêu tả nhịp tim, mồ hôi, đồng tử hoặc khoảng lặng đột ngột.',
          exampleAfter: 'Gáy hắn lạnh toát, từng sợi lông tơ dựng đứng trước khi tiếng bước chân kịp vang lên.',
        },
        {
          pattern: /ánh\s+mắt\s+(?:sắc\s+bén|lạnh\s+lùng|kiên\s+định)\s+như\s+dao/i,
          label: 'Hình ảnh sáo mòn "ánh mắt sắc bén như dao"',
          tip: 'Gắn ánh nhìn với hành động tương tác cụ thể trong không gian.',
          exampleAfter: 'Hắn không chớp mắt, nhìn thẳng vào vết nứt trên chén trà như thể đang đo thời gian còn lại của đối phương.',
        },
        {
          pattern: /không\s+ai\s+ngờ\s+rằng|định\s+mệnh\s+đã\s+an\s+bài/i,
          label: 'Giọng kể tóm tắt kiểu thuyết minh',
          tip: 'Để nhân vật tự đối diện hệ quả trong cảnh sau thay vì tác giả tiết lộ trước.',
          exampleAfter: 'Cánh cửa vừa khép lại, tờ giấy hẹn dưới gầm bàn mới khẽ trượt ra ngoài.',
        },
      ];
    }

    buildSuggestionBundle(rawText) {
      const source = String(rawText || '');
      const suggestions = [];
      for (const item of this.humanRewriteBank) {
        const match = source.match(item.pattern);
        if (match) {
          suggestions.push({
            label: item.label,
            matchedExcerpt: match[0],
            offset: match.index || 0,
            coachingTip: item.tip,
            humanizedExample: item.exampleAfter,
          });
        }
      }
      return {
        detectedPatternCount: suggestions.length,
        suggestions,
        summaryNote:
          suggestions.length === 0
            ? 'Không phát hiện mẫu câu liệt kê hay sáo ngữ phổ biến của AI.'
            : `Phát hiện ${suggestions.length} cụm có thể viết lại tự nhiên, giàu hình ảnh hơn.`,
      };
    }
  }

  const voiceEchoAuditor = new CharacterVoiceEchoAuditor();
  const boundaryComparator = new SceneBoundaryPacingComparator();
  const quickFixHelper = new AntiClicheQuickFixPreviewHelper();

  clicheScannerEngine.voiceEchoAuditor = voiceEchoAuditor;
  clicheScannerEngine.boundaryComparator = boundaryComparator;
  clicheScannerEngine.quickFixHelper = quickFixHelper;

  clicheScannerEngine.auditCharacterVoiceEchoes = (text) => {
    const src = typeof text === 'string' ? text : clicheScannerEngine.getActiveChapterTextAndTitle().text;
    return voiceEchoAuditor.auditVoiceEchoes(src);
  };

  clicheScannerEngine.compareSceneBoundaryPacing = (text) => {
    const src = typeof text === 'string' ? text : clicheScannerEngine.getActiveChapterTextAndTitle().text;
    return boundaryComparator.compareOpeningMiddleEnding(src);
  };

  clicheScannerEngine.buildAntiClicheSuggestionBundle = (text) => {
    const src = typeof text === 'string' ? text : clicheScannerEngine.getActiveChapterTextAndTitle().text;
    return quickFixHelper.buildSuggestionBundle(src);
  };

  /**
   * Đo tỷ lệ cân bằng giữa Thoại (Dialogue), Hành động (Action) và Mô tả nội tâm (Narration).
   */
  class DialogueToNarrationBalanceGauge {
    constructor() {
      this.actionCueWords = [
        'bước', 'quay', 'giơ', 'nắm', 'rút', 'đẩy', 'kéo', 'chạy', 'nhảy', 'ném',
        'ngồi', 'đứng', 'mở', 'đóng', 'gõ', 'cầm', 'đặt', 'lùi', 'tiến', 'xoay',
      ];
    }

    evaluateBalance(rawText) {
      const lines = String(rawText || '')
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0 && !/^(?:\*{3,}|-{3,}|={3,})$/.test(l));

      if (lines.length === 0) {
        return {
          paragraphCount: 0,
          dialogueRatioPct: 0,
          actionNarrationRatioPct: 0,
          reflectiveNarrationRatioPct: 0,
          verdict: 'Chưa có dữ liệu đoạn văn.',
        };
      }

      let dialogueLines = 0;
      let actionLines = 0;
      let reflectiveLines = 0;

      for (const line of lines) {
        if (/^(?:["“「『\-–—]|——)/.test(line) || /[「“"].+[」”"]/.test(line)) {
          dialogueLines += 1;
          continue;
        }
        const lower = line.toLowerCase();
        const hasActionCue = this.actionCueWords.some((w) => lower.includes(w));
        if (hasActionCue) {
          actionLines += 1;
        } else {
          reflectiveLines += 1;
        }
      }

      const total = lines.length;
      const dialogueRatioPct = Math.round((dialogueLines / total) * 100);
      const actionNarrationRatioPct = Math.round((actionLines / total) * 100);
      const reflectiveNarrationRatioPct = Math.max(0, 100 - dialogueRatioPct - actionNarrationRatioPct);

      let verdict = 'Cân bằng tự nhiên giữa thoại, hành động và trần thuật.';
      if (dialogueRatioPct > 65) {
        verdict = 'Thoại đang chiếm tỷ trọng rất cao (>65%), nên xen thêm động tác nhỏ hoặc phản ứng không gian.';
      } else if (dialogueRatioPct < 15 && total >= 6) {
        verdict = 'Chương thiên hẳn về kể tả (>85%), cân nhắc chèn thoại ngắn để tăng sinh khí.';
      } else if (reflectiveNarrationRatioPct > 65) {
        verdict = 'Nhiều đoạn nội tâm/miêu tả liên tiếp, chú ý giữ mạch vận động cho cảnh.';
      }

      return {
        paragraphCount: total,
        dialogueParagraphs: dialogueLines,
        actionParagraphs: actionLines,
        reflectiveParagraphs: reflectiveLines,
        dialogueRatioPct,
        actionNarrationRatioPct,
        reflectiveNarrationRatioPct,
        verdict,
      };
    }
  }

  const balanceGauge = new DialogueToNarrationBalanceGauge();
  clicheScannerEngine.balanceGauge = balanceGauge;
  clicheScannerEngine.evaluateDialogueNarrationBalance = (text) => {
    const src = typeof text === 'string' ? text : clicheScannerEngine.getActiveChapterTextAndTitle().text;
    return balanceGauge.evaluateBalance(src);
  };

  NS.clicheScanner = clicheScannerEngine;
  NS.ClicheScannerAndScratchpadEngine = ClicheScannerAndScratchpadEngine;
  NS.CharacterVoiceEchoAuditor = CharacterVoiceEchoAuditor;
  NS.SceneBoundaryPacingComparator = SceneBoundaryPacingComparator;
  NS.AntiClicheQuickFixPreviewHelper = AntiClicheQuickFixPreviewHelper;
  NS.DialogueToNarrationBalanceGauge = DialogueToNarrationBalanceGauge;

  if (typeof NS.registerModule === 'function') {
    NS.registerModule('mod24', clicheScannerEngine);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        if (!clicheScannerEngine.hasInitialized) clicheScannerEngine.init();
      });
    } else {
      clicheScannerEngine.init();
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
