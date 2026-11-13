/**
 * ============================================================================
 * MODULE 03: HUMANIZED UI TOASTS, BLOCKING LOADER & VIETNAMESE LITERARY NLP
 * ============================================================================
 * Phiên bản: v38.0.0-SUPREME-MODULAR (2026)
 * Nhiệm vụ:
 *   1. Cung cấp bộ tiện ích giao diện thân thiện (`HumanizedUIAndTextUtils` -> `window.NoirStudio.utils`):
 *      - `escapeHtml(raw)` & `unescapeHtml(str)` chống XSS tuyệt đối.
 *      - `countVietnameseWords(text)`, `countParagraphs(text)`, `estimateReadingTimeMinutes(wordCount)`.
 *      - `formatTimestampVN(ts)`, `formatRelativeTimeVN(ts)`, `formatDurationMMSS(seconds)`.
 *      - Hệ thống thông báo nổi `showToast(message, type, durationMs)` tự động tạo khay hiển thị,
 *        chống trùng lặp thông báo và hỗ trợ 4 cấp độ (`success`, `info`, `warn`, `error`).
 *      - Màn hình chờ toàn cục khi chạy AI `showBlockingLoader`, `updateBlockingLoader`, `hideBlockingLoader`
 *        kèm đồng hồ đếm giây thực tế và nút ẩn chạy ngầm.
 *   2. Cung cấp Động cơ Xử lý Ngôn ngữ Tự nhiên Văn học Tiếng Việt (`VietnameseLiteraryNLPEngine`):
 *      - Chuẩn hóa bảng mã Unicode dựng sẵn (NFC), bỏ dấu tiếng Việt (`stripVietnameseDiacritics`),
 *        tạo tên file an toàn (`slugifyVietnameseFilename`).
 *      - Bộ tách câu văn học tiếng Việt (`splitSentencesVN`) nhận diện các từ viết tắt phổ biến.
 *      - Bộ bóc tách và thống kê hội thoại (`extractDialoguesVN`) hỗ trợ chuẩn `- Câu thoại (Tên)`
 *        lẫn ngoặc kép `“...”`, tính tỷ lệ Hội thoại / Tự sự và tần suất lên tiếng của từng nhân vật.
 *      - Từ điển Từ láy tượng hình / tượng thanh & Từ ghép văn học tiếng Việt phục vụ phân tích
 *        nhịp điệu câu văn, mật độ ngũ quan và sắc thái cảm xúc (Emotional Valence).
 * ============================================================================
 */

(function initNoirStudioHumanizedUIAndVietnameseNLPModule(globalScope) {
  'use strict';

  const root = globalScope || (typeof window !== 'undefined' ? window : globalThis);
  root.NoirStudio = root.NoirStudio || {};
  const NS = root.NoirStudio;

  // ==========================================================================
  // PHẦN 1: TỪ ĐIỂN NGỮ ÂM, TỪ LÁY & SẮC THÁI CẢM XÚC VĂN HỌC TIẾNG VIỆT
  // ==========================================================================

  /**
   * Kho từ vựng Từ láy (Reduplicative Words) và Từ ngữ giàu hình tượng trong
   * văn chương tiếng Việt, dùng để đo độ giàu có về mặt thẩm mỹ của bản thảo.
   */
  const VIETNAMESE_LITERARY_LEXICON = Object.freeze({
    REDUPLICATIVE_VISUAL: [
      'lập lòe', 'lấp lánh', 'mờ mịt', 'chập chờn', 'thấp thoáng', 'lờ mờ',
      'rực rỡ', 'ngập ngừng', 'lênh đênh', 'chênh vênh', 'mênh mông', 'bát ngát',
      'thăm thẳm', 'hun hút', 'ngoằn ngoèo', 'khúc khuỷu', 'liêu xiêu', 'xiêu vẹo',
      'lất phất', 'rả rích', 'ầm ầm', 'cuồn cuộn', 'lững thững', 'thẫn thờ',
      'bần thần', 'ngơ ngác', 'sững sờ', 'bàng hoàng', 'run rẩy', 'lạnh lẽo'
    ],
    REDUPLICATIVE_AUDITORY: [
      'rì rầm', 'xào xạc', 'lộp độp', 'tí tách', 'văng vẳng', 'ngân nga',
      'thì thầm', 'thổn thức', 'nức nở', 'nghẹn ngào', 'lanh lảnh', 'trầm đục',
      'kẽo kẹt', 'lạo xạo', 'răng rắc', 'ầm ĩ', 'inh ỏi', 'tĩnh mịch',
      'vắng lặng', 'im ắng', 'rền vang', 'vi vu', 'rít gào', 'thều thào'
    ],
    EMOTIONAL_VALENCE_KEYWORDS: {
      NOIR_SUSPENSE: [
        'bóng tối', 'mưa đêm', 'khói thuốc', 'vết máu', 'hiện trường', 'nghi phạm',
        'bí mật', 'manh mối', 'lạnh lẽo', 'ngột ngạt', 'cảnh giác', 'đối chất',
        'hẻm sâu', 'đèn đường', 'vết sẹo', 'im lặng', 'sát khí', 'nguy hiểm',
        'dối trá', 'che giấu', 'thẩm vấn', 'bẫy', 'theo dõi', 'hồ sơ mật'
      ],
      MELANCHOLY_NOIR: [
        'cô độc', 'chia ly', 'ký ức', 'quá khứ', 'vết thương', 'nước mắt',
        'nhớ nhung', 'tiếc nuối', 'tàn phai', 'lạnh giá', 'trống rỗng', 'hoài niệm',
        'mưa phùn', 'chiều tà', 'hoàng hôn', 'cô đơn', 'lặng lẽ', 'xa xăm',
        'buồn bã', 'đau nhói', 'nghẹn đắng', 'vỡ vụn', 'mất mát', 'lãng quên'
      ],
      ACTION_CONFLICT: [
        'lao tới', 'vung kiếm', 'bóp cò', 'né tránh', 'va chạm', 'nổ tung',
        'chấn động', 'rượt đuổi', 'phản kích', 'đòn đánh', 'tốc độ', 'bùng nổ',
        'gầm lên', 'xông lên', 'chặn đứng', 'phá vỡ', 'sụp đổ', 'quyết tử',
        'máu tươi', 'thương tích', 'căng như dây đàn', 'ngàn cân treo sợi tóc'
      ],
      WARMTH_HEALING: [
        'ấm áp', 'dịu dàng', 'mỉm cười', 'nắng sớm', 'hương trà', 'bình yên',
        'che chở', 'vỗ về', 'tin tưởng', 'hy vọng', 'thanh thản', 'ngọt ngào',
        'thương yêu', 'chữa lành', 'nắm tay', 'ánh nắng', 'ban mai', 'trong trẻo',
        'êm đềm', 'thư thái', 'hạnh phúc', 'an lòng', 'bao dung', 'ấm lòng'
      ],
      MYSTERY_EERIE: [
        'kỳ quái', 'ma mị', 'sương mù', 'hương trầm', 'mái đình', 'cổ mộ',
        'lời nguyền', 'kiêng kỵ', 'bóng đen', 'tiếng gõ', 'lạnh gáy', 'hồn ma',
        'vọng lại', 'bùa chú', 'tế lễ', 'đêm rằm', 'giờ Hợi', 'miếu hoang',
        'lập lòe', 'âm u', 'rợn người', 'huyền bí', 'cấm địa', 'thề độc'
      ]
    },
    SENSORY_MARKERS: {
      VISUAL: [
        'ánh sáng', 'bóng tối', 'màu', 'nhìn', 'trông thấy', 'lóe lên', 'phản chiếu',
        'lấp lánh', 'mờ ảo', 'đỏ thẫm', 'xanh xao', 'vàng vọt', 'đen kịt', 'trắng xóa'
      ],
      AUDITORY: [
        'tiếng', 'âm thanh', 'vang lên', 'nghe thấy', 'thì thầm', 'vọng lại',
        'kẽo kẹt', 'rì rào', 'lộp độp', 'im lặng', 'giọng nói', 'tiếng bước chân'
      ],
      OLFACTORY: [
        'mùi', 'hương', 'ngửi', 'ngào ngạt', 'tanh nồng', 'ẩm mốc', 'khói',
        'mùi mưa', 'mùi máu', 'hương trầm', 'hăng hắc', 'thơm dịu', 'nồng nặc'
      ],
      TACTILE: [
        'lạnh buốt', 'nóng rát', 'nhám', 'trơn trượt', 'ướt sũng', 'run rẩy',
        'chạm vào', 'siết chặt', 'đau nhói', 'tê dại', 'hơi ấm', 'gió lạnh'
      ],
      GUSTATORY: [
        'vị', 'đắng ngắt', 'ngọt', 'mặn chát', 'chua', 'cay xè', 'khô khốc',
        'nơi đầu lưỡi', 'nuốt', 'nhấp một ngụm'
      ]
    }
  });

  NS.literaryLexicon = VIETNAMESE_LITERARY_LEXICON;

  // ==========================================================================
  // PHẦN 2: BẢNG CHUYỂN ĐỔI DẤU TIẾNG VIỆT & CHUẨN HÓA UNICODE
  // ==========================================================================

  /**
   * Bảng ánh xạ nguyên âm có dấu tiếng Việt sang ký tự Latin không dấu
   * phục vụ tìm kiếm không dấu, tạo mã ID và đặt tên file trên ổ cứng.
   */
  const VIETNAMESE_DIACRITIC_MAP = [
    { base: 'a', regex: /[àáảãạăằắẳẵặâầấẩẫậ]/g },
    { base: 'A', regex: /[ÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬ]/g },
    { base: 'e', regex: /[èéẻẽẹêềếểễệ]/g },
    { base: 'E', regex: /[ÈÉẺẼẸÊỀẾỂỄỆ]/g },
    { base: 'i', regex: /[ìíỉĩị]/g },
    { base: 'I', regex: /[ÌÍỈĨỊ]/g },
    { base: 'o', regex: /[òóỏõọôồốổỗộơờớởỡợ]/g },
    { base: 'O', regex: /[ÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢ]/g },
    { base: 'u', regex: /[ùúủũụưừứửữự]/g },
    { base: 'U', regex: /[ÙÚỦŨỤƯỪỨỬỮỰ]/g },
    { base: 'y', regex: /[ỳýỷỹỵ]/g },
    { base: 'Y', regex: /[ỲÝỶỸỴ]/g },
    { base: 'd', regex: /[đ]/g },
    { base: 'D', regex: /[Đ]/g }
  ];

  const VIETNAMESE_ABBREVIATIONS = new Set([
    'tp', 'gs', 'pgs', 'ts', 'ths', 'bs', 'ks', 'cn', 'đh', 'thpt', 'thcs',
    'q', 'p', 'tx', 'tt', 'tr', 'st', 'vd', 'v.v', 'vv', 'tnhh', 'cp',
    'mr', 'mrs', 'ms', 'dr', 'prof', 'st', 'no', 'vol', 'ch'
  ]);

  const VIETNAMESE_STOPWORDS = new Set([
    'và', 'của', 'là', 'có', 'được', 'cho', 'trong', 'với', 'những', 'các',
    'một', 'này', 'đó', 'khi', 'đã', 'sẽ', 'đang', 'nhưng', 'mà', 'nên',
    'vì', 'nếu', 'thì', 'từ', 'đến', 'tại', 'trên', 'dưới', 'vào', 'ra',
    'lên', 'xuống', 'lại', 'rồi', 'cũng', 'vẫn', 'còn', 'chỉ', 'đều', 'rất',
    'quá', 'lắm', 'hơn', 'nhất', 'không', 'chẳng', 'chưa', 'chớ', 'đừng',
    'anh', 'em', 'tôi', 'cô', 'hắn', 'gã', 'nàng', 'chàng', 'họ', 'chúng',
    'ta', 'mình', 'người', 'ấy', 'nọ', 'kia', 'đây', 'đấy', 'sao', 'nào'
  ]);

  const DIALOGUE_DASH_REGEX = /^\s*[-–—]\s*(.+?)\s*$/;
  const SPEAKER_TAG_AT_END_REGEX = /\s*\(([^()]{1,42})\)\s*[.?!…]*\s*$/;
  const INLINE_QUOTED_REGEX = /[“"]([^”"]{2,400})[”"]/g;

  // ==========================================================================
  // PHẦN 3: ĐỘNG CƠ XỬ LÝ NGÔN NGỮ TỰ NHIÊN VĂN HỌC TIẾNG VIỆT (VN NLP ENGINE)
  // ==========================================================================

  class VietnameseLiteraryNLPEngine {
    constructor() {
      this.diacriticMap = VIETNAMESE_DIACRITIC_MAP;
      this.lexicon = VIETNAMESE_LITERARY_LEXICON;
      this.abbreviations = VIETNAMESE_ABBREVIATIONS;
      this.stopwords = VIETNAMESE_STOPWORDS;
    }

    /**
     * Chuẩn hóa văn bản về bảng mã Unicode dựng sẵn NFC (tránh lỗi tổ hợp dấu NFD
     * khi copy từ macOS/PDF khiến AI đếm sai từ hoặc làm gãy font tiếng Việt).
     */
    normalizeUnicodeNFC(input) {
      if (input === null || input === undefined) return '';
      let text = String(input);
      if (typeof text.normalize === 'function') {
        text = text.normalize('NFC');
      }
      return text
        .replace(/\u200B|\u200C|\u200D|\uFEFF/g, '')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n');
    }

    /**
     * Bỏ dấu tiếng Việt chính xác giữ nguyên chữ hoa/thường để phục vụ
     * tìm kiếm gần đúng (fuzzy matching) và tạo định danh chuẩn ASCII.
     */
    stripVietnameseDiacritics(input) {
      let text = this.normalizeUnicodeNFC(input);
      if (!text) return '';
      for (let i = 0; i < this.diacriticMap.length; i += 1) {
        const entry = this.diacriticMap[i];
        text = text.replace(entry.regex, entry.base);
      }
      if (typeof text.normalize === 'function') {
        text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      }
      return text;
    }

    /**
     * Tạo tên tệp hoặc mã slug an toàn từ tiêu đề chương tiếng Việt.
     */
    slugifyVietnameseFilename(rawTitle, maxLength = 64) {
      const stripped = this.stripVietnameseDiacritics(rawTitle || 'ban_thao')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      const sliced = (stripped || 'chuong_moi').slice(0, Math.max(8, maxLength));
      return sliced.replace(/_+$/g, '') || 'chuong_moi';
    }

    /**
     * Tách từ / âm tiết tiếng Việt sạch, loại bỏ dấu câu rỗng.
     */
    tokenizeWordsVN(text) {
      const clean = this.normalizeUnicodeNFC(text).trim();
      if (!clean) return [];
      return clean
        .split(/\s+/)
        .map((w) => w.replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu, ''))
        .filter((w) => w.length > 0 && /[\p{L}\p{N}]/u.test(w));
    }

    /**
     * Đếm số từ chính xác theo chuẩn viết tiểu thuyết tiếng Việt.
     */
    countWords(text) {
      const clean = this.normalizeUnicodeNFC(text).trim();
      if (!clean) return 0;
      const matches = clean.match(/[\p{L}\p{N}_'-]+/gu);
      return matches ? matches.length : 0;
    }

    /**
     * Đếm số đoạn văn thực sự có nội dung (bỏ qua dòng trống hoặc dấu ngắt cảnh `* * *`).
     */
    countParagraphs(text) {
      const clean = this.normalizeUnicodeNFC(text).trim();
      if (!clean) return 0;
      const blocks = clean
        .split(/\n+/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !/^([*\-_—]\s*){2,}$/.test(line));
      return blocks.length;
    }

    /**
     * Ước lượng thời gian đọc trung bình cho độc giả tiểu thuyết (240 từ/phút).
     */
    estimateReadingTimeMinutes(wordCount, wpm = 240) {
      const n = Number(wordCount) || 0;
      if (n <= 0) return 0;
      return Math.max(1, Math.ceil(n / Math.max(120, wpm)));
    }

    /**
     * Tách câu văn học tiếng Việt thông minh: bảo vệ chữ viết tắt (`TP.`, `GS.`, `v.v.`),
     * số thập phân (`12.5`) và giữ nguyên dấu kết câu (`...`, `?!`, `.`).
     */
    splitSentencesVN(text) {
      const normalized = this.normalizeUnicodeNFC(text).trim();
      if (!normalized) return [];

      const protectedText = normalized
        .replace(/(\d+)\.(\d+)/g, '$1__DOT__$2')
        .replace(/\.\.\./g, '__ELLIPSIS__')
        .replace(/…/g, '__ELLIPSIS__');

      const lines = protectedText.split(/\n+/);
      const sentences = [];

      for (let li = 0; li < lines.length; li += 1) {
        const line = lines[li].trim();
        if (!line || /^([*\-_—]\s*){2,}$/.test(line)) continue;

        const chunks = line.split(/(?<=[.?!])\s+(?=[-\p{L}\p{N}“"«(])/u);
        for (let ci = 0; ci < chunks.length; ci += 1) {
          let s = chunks[ci]
            .replace(/__DOT__/g, '.')
            .replace(/__ELLIPSIS__/g, '…')
            .trim();
          if (!s) continue;

          if (sentences.length > 0) {
            const prev = sentences[sentences.length - 1];
            const lastTokenMatch = prev.match(/([A-Za-zÀ-ỹ]{1,6})\.$/);
            if (
              lastTokenMatch &&
              this.abbreviations.has(lastTokenMatch[1].toLowerCase())
            ) {
              sentences[sentences.length - 1] = `${prev} ${s}`;
              continue;
            }
          }
          sentences.push(s);
        }
      }

      return sentences;
    }

    /**
     * Bóc tách toàn bộ lời thoại trong bản thảo:
     * - Nhận diện chuẩn Noir Studio `- Lời thoại (Tên nhân vật)`
     * - Nhận diện hội thoại trong ngoặc kép `“...”` hoặc `"..."`
     * Trả về danh sách lời thoại, tổng số từ thoại, tỷ lệ % thoại/tự sự và thống kê nhân vật.
     */
    extractDialoguesVN(text) {
      const normalized = this.normalizeUnicodeNFC(text);
      if (!normalized.trim()) {
        return {
          dialogues: [],
          totalWords: 0,
          dialogueWords: 0,
          narrativeWords: 0,
          dialogueRatioPercent: 0,
          speakers: {}
        };
      }

      const lines = normalized.split('\n');
      const dialogues = [];
      const speakers = {};
      let dialogueWords = 0;

      lines.forEach((rawLine, lineIdx) => {
        const trimmed = rawLine.trim();
        if (!trimmed) return;

        const dashMatch = trimmed.match(DIALOGUE_DASH_REGEX);
        if (dashMatch) {
          let content = dashMatch[1].trim();
          let speaker = 'Chưa gán tên';
          const speakerMatch = content.match(SPEAKER_TAG_AT_END_REGEX);
          if (speakerMatch) {
            speaker = speakerMatch[1].trim();
            content = content.slice(0, speakerMatch.index).trim();
          }
          const wc = this.countWords(content);
          dialogueWords += wc;
          dialogues.push({
            type: 'DASH_NOIR',
            lineNumber: lineIdx + 1,
            speaker,
            text: content,
            wordCount: wc
          });
          speakers[speaker] = (speakers[speaker] || 0) + 1;
          return;
        }

        let qm;
        const quoteRegex = new RegExp(INLINE_QUOTED_REGEX.source, 'g');
        while ((qm = quoteRegex.exec(trimmed)) !== null) {
          const quoted = qm[1].trim();
          if (!quoted) continue;
          const wc = this.countWords(quoted);
          dialogueWords += wc;
          dialogues.push({
            type: 'INLINE_QUOTE',
            lineNumber: lineIdx + 1,
            speaker: 'Ngữ cảnh ngoặc kép',
            text: quoted,
            wordCount: wc
          });
        }
      });

      const totalWords = this.countWords(normalized);
      const narrativeWords = Math.max(0, totalWords - dialogueWords);
      const dialogueRatioPercent =
        totalWords > 0
          ? Math.min(100, Math.round((dialogueWords / totalWords) * 100))
          : 0;

      return {
        dialogues,
        totalWords,
        dialogueWords,
        narrativeWords,
        dialogueRatioPercent,
        speakers
      };
    }

    /**
     * Phân tích mật độ 5 giác quan (Show-Don't-Tell) trong bản thảo.
     */
    analyzeSensoryRichnessVN(text) {
      const normalized = this.normalizeUnicodeNFC(text).toLowerCase();
      const totalWords = Math.max(1, this.countWords(normalized));
      const counts = {
        VISUAL: 0,
        AUDITORY: 0,
        OLFACTORY: 0,
        TACTILE: 0,
        GUSTATORY: 0
      };
      const matchedTerms = {
        VISUAL: [],
        AUDITORY: [],
        OLFACTORY: [],
        TACTILE: [],
        GUSTATORY: []
      };

      const markers = this.lexicon.SENSORY_MARKERS || {};
      Object.keys(counts).forEach((senseKey) => {
        const terms = Array.isArray(markers[senseKey]) ? markers[senseKey] : [];
        terms.forEach((term) => {
          const idx = normalized.indexOf(term.toLowerCase());
          if (idx !== -1) {
            const occ = normalized.split(term.toLowerCase()).length - 1;
            counts[senseKey] += occ;
            if (occ > 0 && !matchedTerms[senseKey].includes(term)) {
              matchedTerms[senseKey].push(term);
            }
          }
        });
      });

      const totalHits = Object.values(counts).reduce((a, b) => a + b, 0);
      const activeSensesCount = Object.values(counts).filter((c) => c > 0).length;
      const densityPer1kWords = Math.round((totalHits / totalWords) * 1000 * 10) / 10;

      const missingSenses = Object.keys(counts).filter((k) => counts[k] === 0);
      const senseNamesVI = {
        VISUAL: 'Thị giác',
        AUDITORY: 'Thính giác',
        OLFACTORY: 'Khứu giác',
        TACTILE: 'Xúc giác',
        GUSTATORY: 'Vị giác'
      };

      let feedback = '';
      if (totalWords < 60) {
        feedback = 'Đoạn văn còn ngắn để đánh giá đầy đủ độ sâu ngũ quan.';
      } else if (activeSensesCount >= 4) {
        feedback = `Giàu chất điện ảnh (${activeSensesCount}/5 giác quan được kích hoạt, mật độ ${densityPer1kWords} điểm/1000 từ).`;
      } else if (missingSenses.length > 0) {
        const missingLabels = missingSenses.map((k) => senseNamesVI[k]).join(', ');
        feedback = `Nên điểm thêm chi tiết ${missingLabels} để cảnh truyện sống động hơn.`;
      }

      return {
        counts,
        matchedTerms,
        totalHits,
        activeSensesCount,
        densityPer1kWords,
        missingSenses: missingSenses.map((k) => senseNamesVI[k]),
        feedback
      };
    }

    /**
     * Phân tích sắc thái cảm xúc chủ đạo (Noir, Trầm buồn, Hành động, Chữa lành, Kỳ bí)
     * và đo độ giàu từ láy tiếng Việt.
     */
    analyzeEmotionalToneAndCadenceVN(text) {
      const normalized = this.normalizeUnicodeNFC(text).toLowerCase();
      const sentences = this.splitSentencesVN(text);
      const sentenceWordLengths = sentences.map((s) => this.countWords(s)).filter((n) => n > 0);

      const avgSentenceWords =
        sentenceWordLengths.length > 0
          ? Math.round(
              (sentenceWordLengths.reduce((a, b) => a + b, 0) /
                sentenceWordLengths.length) *
                10
            ) / 10
          : 0;

      const shortPunchSentences = sentenceWordLengths.filter((n) => n <= 8).length;
      const longFlowSentences = sentenceWordLengths.filter((n) => n >= 26).length;

      let pacingLabel = 'Nhịp cân bằng';
      if (sentenceWordLengths.length >= 4) {
        const shortRatio = shortPunchSentences / sentenceWordLengths.length;
        const longRatio = longFlowSentences / sentenceWordLengths.length;
        if (shortRatio >= 0.45) {
          pacingLabel = 'Nhịp dồn dập / Căng thẳng (Nhiều câu ngắn)';
        } else if (longRatio >= 0.35) {
          pacingLabel = 'Nhịp trầm lắng / Tự sự sâu (Nhiều câu dài)';
        }
      }

      const valenceScores = {};
      const valMap = this.lexicon.EMOTIONAL_VALENCE_KEYWORDS || {};
      Object.keys(valMap).forEach((toneKey) => {
        let score = 0;
        const kws = valMap[toneKey] || [];
        for (let i = 0; i < kws.length; i += 1) {
          const kw = kws[i].toLowerCase();
          if (normalized.includes(kw)) {
            score += normalized.split(kw).length - 1;
          }
        }
        valenceScores[toneKey] = score;
      });

      let dominantTone = 'NEUTRAL_BALANCED';
      let topScore = 0;
      Object.keys(valenceScores).forEach((k) => {
        if (valenceScores[k] > topScore) {
          topScore = valenceScores[k];
          dominantTone = k;
        }
      });

      const visualRedup = (this.lexicon.REDUPLICATIVE_VISUAL || []).filter((w) =>
        normalized.includes(w)
      );
      const auditoryRedup = (this.lexicon.REDUPLICATIVE_AUDITORY || []).filter((w) =>
        normalized.includes(w)
      );

      return {
        sentenceCount: sentences.length,
        avgSentenceWords,
        shortPunchSentences,
        longFlowSentences,
        pacingLabel,
        dominantTone,
        valenceScores,
        reduplicativeCount: visualRedup.length + auditoryRedup.length,
        reduplicativeSamples: [...visualRedup, ...auditoryRedup].slice(0, 12)
      };
    }

    /**
     * Phát hiện các từ lặp quá dày trong khoảng cách gần (Word Echo Detector)
     * để giúp tác giả sửa lỗi lặp từ vô thức trên cùng một trang viết.
     */
    detectLocalWordEchoesVN(text, minWordLen = 3, minCount = 3) {
      const words = this.tokenizeWordsVN(text).map((w) => w.toLowerCase());
      if (words.length < 25) return [];

      const counts = new Map();
      words.forEach((w) => {
        if (w.length < minWordLen || this.stopwords.has(w)) return;
        counts.set(w, (counts.get(w) || 0) + 1);
      });

      const echoes = [];
      counts.forEach((count, word) => {
        if (count >= minCount) {
          echoes.push({
            word,
            count,
            densityPercent: Math.round((count / words.length) * 1000) / 10
          });
        }
      });

      return echoes.sort((a, b) => b.count - a.count).slice(0, 15);
    }

    /**
     * Làm sạch nhẹ ký tự thừa trong đoạn hội thoại hoặc văn bản dán từ Word/Web
     * mà vẫn giữ nguyên ý đồ xuống dòng của tác giả.
     */
    sanitizePastedManuscriptText(rawText) {
      let text = this.normalizeUnicodeNFC(rawText);
      text = text
        .replace(/\t+/g, ' ')
        .replace(/[ ]{2,}/g, ' ')
        .replace(/\n{4,}/g, '\n\n\n')
        .replace(/^\s*[-–—]\s+/gm, '- ');
      return text;
    }

    /**
     * Trích nhanh các danh từ riêng viết hoa nhiều âm tiết (nghi vấn Tên nhân vật / Địa danh)
     */
    extractProperNounsCandidatesVN(text, minFrequency = 2) {
      const normalized = this.normalizeUnicodeNFC(text);
      const regex = /\b([A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯẠ-Ỹ][a-zàáâãèéêìíòóôõùúăđĩũơưạ-ỹ]+(?:\s+[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯẠ-Ỹ][a-zàáâãèéêìíòóôõùúăđĩũơưạ-ỹ]+){0,3})\b/g;
      const map = new Map();
      let m;
      while ((m = regex.exec(normalized)) !== null) {
        const candidate = m[1].trim();
        if (candidate.length < 3 || /^Chương\s+\d+$/i.test(candidate)) continue;
        map.set(candidate, (map.get(candidate) || 0) + 1);
      }

      const list = [];
      map.forEach((count, name) => {
        if (count >= minFrequency) {
          list.push({ name, count });
        }
      });
      return list.sort((a, b) => b.count - a.count).slice(0, 40);
    }
  }

  // ==========================================================================
  // PHẦN 4: HỆ THỐNG THÔNG BÁO THÂN THIỆN & MÀN HÌNH CHỜ AI TOÀN CỤC
  // ==========================================================================

  const HUMANIZED_TOAST_STYLE_MAP = Object.freeze({
    success: {
      icon: '✨',
      borderClass: 'border-emerald-500/45 bg-zinc-900/95 text-emerald-100',
      badgeClass: 'bg-emerald-500/15 text-emerald-300',
      label: 'Hoàn tất'
    },
    info: {
      icon: '💡',
      borderClass: 'border-sky-500/40 bg-zinc-900/95 text-sky-100',
      badgeClass: 'bg-sky-500/15 text-sky-300',
      label: 'Ghi chú'
    },
    warn: {
      icon: '⚠️',
      borderClass: 'border-amber-500/50 bg-zinc-900/95 text-amber-100',
      badgeClass: 'bg-amber-500/15 text-amber-300',
      label: 'Lưu ý'
    },
    warning: {
      icon: '⚠️',
      borderClass: 'border-amber-500/50 bg-zinc-900/95 text-amber-100',
      badgeClass: 'bg-amber-500/15 text-amber-300',
      label: 'Lưu ý'
    },
    error: {
      icon: '🛠️',
      borderClass: 'border-rose-500/50 bg-zinc-900/95 text-rose-100',
      badgeClass: 'bg-rose-500/15 text-rose-300',
      label: 'Cần xử lý'
    }
  });

  const HUMANIZED_MOTIVATIONAL_PHRASES_VN = Object.freeze([
    'Từng câu chữ bạn viết hôm nay đều đang thắp sáng thế giới truyện của riêng bạn.',
    'Bản thảo nháp không cần hoàn hảo ngay lập tức — cứ viết tuôn trào rồi mình cùng gọt giũa sau nhé!',
    'Mỗi chi tiết nhỏ gieo ở chương đầu đều có thể hóa thành cú lật ngoạn mục về sau.',
    'Hít một hơi sâu, giữ nhịp thở đều đặn và để nhân vật tự cất lên tiếng nói của họ.',
    'Nếu cảm thấy bí ý, hãy thử mở Tab 3 chế độ Kịch bản phân cảnh hoặc hỏi Bi Số 8 gợi ý góc nhìn đối lập!'
  ]);

  class HumanizedToastManager {
    constructor(utilsRef) {
      this.utils = utilsRef;
      this.activeTimer = null;
      this.lastMessageKey = '';
      this.lastShownAt = 0;
      this.toastHistory = [];
      this.maxHistory = 50;
    }

    ensureToastHostElement() {
      if (typeof document === 'undefined') return null;
      let el = document.getElementById('unified-save-toast');
      if (!el) {
        el = document.createElement('div');
        el.id = 'unified-save-toast';
        el.setAttribute('role', 'status');
        el.setAttribute('aria-live', 'polite');
        el.className =
          'fixed bottom-5 right-4 z-[9998] max-w-md px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-md transition-all duration-300 hidden pointer-events-auto';
        document.body.appendChild(el);
      }
      return el;
    }

    normalizeToastMessage(rawMsg) {
      let msg = String(rawMsg || '').trim();
      if (!msg) return 'Đã cập nhật trạng thái làm việc.';
      msg = msg
        .replace(/API Key rỗng/gi, 'Bạn chưa nhập Khóa API Gemini trong Tab 6')
        .replace(/Syntax Error/gi, 'Lỗi định dạng dữ liệu đầu vào')
        .replace(/Operation aborted/gi, 'Bạn đã tạm dừng thao tác này');
      return msg;
    }

    show(message, type = 'info', durationMs = 3400) {
      const normalizedMsg = this.normalizeToastMessage(message);
      const level = HUMANIZED_TOAST_STYLE_MAP[type] ? type : 'info';
      const now = Date.now();
      const dedupeKey = `${level}::${normalizedMsg}`;

      if (dedupeKey === this.lastMessageKey && now - this.lastShownAt < 900) {
        return false;
      }
      this.lastMessageKey = dedupeKey;
      this.lastShownAt = now;

      this.toastHistory.unshift({
        message: normalizedMsg,
        type: level,
        timestamp: now
      });
      if (this.toastHistory.length > this.maxHistory) {
        this.toastHistory.length = this.maxHistory;
      }

      const host = this.ensureToastHostElement();
      if (!host) return false;

      const palette = HUMANIZED_TOAST_STYLE_MAP[level];
      host.className = `fixed bottom-5 right-4 z-[9998] max-w-md px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-md transition-all duration-300 pointer-events-auto flex items-start gap-2.5 text-sm font-medium ${palette.borderClass}`;
      host.innerHTML = `
        <span class="shrink-0 text-base leading-none mt-0.5">${palette.icon}</span>
        <div class="flex-1 min-w-0 leading-snug break-words">${this.utils.escapeHtml(normalizedMsg)}</div>
        <button type="button" aria-label="Đóng thông báo" class="shrink-0 text-xs opacity-60 hover:opacity-100 px-1.5 py-0.5 rounded-lg hover:bg-white/10 transition">✕</button>
      `;

      const closeBtn = host.querySelector('button');
      if (closeBtn) {
        closeBtn.onclick = () => this.hideImmediate();
      }

      host.classList.remove('hidden');
      host.style.opacity = '1';
      host.style.transform = 'translateY(0)';

      if (this.activeTimer) {
        clearTimeout(this.activeTimer);
        this.activeTimer = null;
      }

      const safeDuration = Math.max(1200, Math.min(12000, Number(durationMs) || 3400));
      this.activeTimer = setTimeout(() => {
        this.hideImmediate();
      }, safeDuration);

      return true;
    }

    hideImmediate() {
      if (this.activeTimer) {
        clearTimeout(this.activeTimer);
        this.activeTimer = null;
      }
      if (typeof document === 'undefined') return;
      const host = document.getElementById('unified-save-toast');
      if (host) {
        host.classList.add('hidden');
      }
    }

    getRecentHistory(limit = 15) {
      return this.toastHistory.slice(0, limit);
    }
  }

  class GlobalAIBlockingLoaderController {
    constructor(utilsRef) {
      this.utils = utilsRef;
      this.isVisible = false;
      this.startedAt = 0;
      this.tickTimer = null;
      this.onCancelCallback = null;
      this.baseSubtitle = '';
      this.progressStepIndex = 0;
    }

    ensureCancelBinding() {
      if (typeof document === 'undefined') return;
      const btn = document.getElementById('btn-cancel-blocking-loader');
      if (btn && !btn.dataset.noirMod03CancelBound) {
        btn.dataset.noirMod03CancelBound = '1';
        btn.addEventListener('click', () => {
          const cb = this.onCancelCallback;
          this.hide();
          if (typeof cb === 'function') {
            try {
              cb();
            } catch (_) {
              // bỏ qua lỗi hủy
            }
          }
          this.utils.showToast('🛑 Đã ẩn màn hình chờ và dừng đợi tác vụ hiện tại.', 'warn', 2600);
        });
      }
    }

    show(titleText, subtitleText, cancelCallback = null) {
      this.isVisible = true;
      this.startedAt = Date.now();
      this.onCancelCallback = typeof cancelCallback === 'function' ? cancelCallback : null;
      this.baseSubtitle = String(
        subtitleText || 'Hệ thống đang tổng hợp dữ kiện và giữ nguyên mạch văn nhất quán...'
      );

      if (typeof document === 'undefined') return;
      const modal = document.getElementById('global-ai-blocking-loader');
      const titleEl = document.getElementById('blocking-loader-title');
      const subEl = document.getElementById('blocking-loader-subtitle');

      if (titleEl) {
        titleEl.textContent = String(titleText || '✨ Đang xử lý bằng Gemini AI...');
      }
      if (subEl) {
        subEl.textContent = this.baseSubtitle;
      }

      this.ensureCancelBinding();
      if (modal) {
        modal.classList.remove('hidden');
      }

      this.startElapsedTicker();
    }

    update(titleText, subtitleText) {
      if (typeof document === 'undefined') return;
      const titleEl = document.getElementById('blocking-loader-title');
      const subEl = document.getElementById('blocking-loader-subtitle');
      if (titleEl && titleText) {
        titleEl.textContent = String(titleText);
      }
      if (subEl && subtitleText) {
        this.baseSubtitle = String(subtitleText);
        const sec = Math.max(0, Math.floor((Date.now() - this.startedAt) / 1000));
        subEl.textContent = `${this.baseSubtitle} (${sec}s)`;
      }
    }

    startElapsedTicker() {
      if (this.tickTimer) {
        clearInterval(this.tickTimer);
        this.tickTimer = null;
      }
      this.tickTimer = setInterval(() => {
        if (!this.isVisible || typeof document === 'undefined') return;
        const subEl = document.getElementById('blocking-loader-subtitle');
        if (!subEl) return;
        const elapsedSec = Math.max(0, Math.floor((Date.now() - this.startedAt) / 1000));
        let hint = '';
        if (elapsedSec >= 18) {
          hint = ' — Chương dài hoặc mô hình suy luận sâu đang chắt lọc từng câu chữ...';
        } else if (elapsedSec >= 8) {
          hint = ' — Đang đối chiếu Story Bible & giữ văn phong tự nhiên...';
        }
        subEl.textContent = `${this.baseSubtitle}${hint} [${elapsedSec}s]`;
      }, 1000);
    }

    hide() {
      this.isVisible = false;
      this.onCancelCallback = null;
      if (this.tickTimer) {
        clearInterval(this.tickTimer);
        this.tickTimer = null;
      }
      if (typeof document !== 'undefined') {
        const modal = document.getElementById('global-ai-blocking-loader');
        if (modal) {
          modal.classList.add('hidden');
        }
      }
    }
  }

  // ==========================================================================
  // PHẦN 5: CHUẨN HÓA SỐ CHƯƠNG LA MÃ / TIẾNG VIỆT & BỘ ĐỊNH DẠNG THỜI GIAN
  // ==========================================================================

  const ROMAN_VALUES = Object.freeze({
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000
  });

  const VIETNAMESE_TEXT_NUMBERS = Object.freeze({
    'một': 1,
    'nhất': 1,
    'hai': 2,
    'nhị': 2,
    'ba': 3,
    'tam': 3,
    'bốn': 4,
    'tư': 4,
    'tứ': 4,
    'năm': 5,
    'ngũ': 5,
    'sáu': 6,
    'lục': 6,
    'bảy': 7,
    'thất': 7,
    'tám': 8,
    'bát': 8,
    'chín': 9,
    'cửu': 9,
    'mười': 10,
    'thập': 10
  });

  class VietnameseChapterNumeralParser {
    romanToInteger(romanRaw) {
      const roman = String(romanRaw || '').trim().toUpperCase();
      if (!roman || !/^[IVXLCDM]+$/.test(roman)) return 0;
      let total = 0;
      for (let i = 0; i < roman.length; i += 1) {
        const curr = ROMAN_VALUES[roman[i]] || 0;
        const next = ROMAN_VALUES[roman[i + 1]] || 0;
        if (curr < next) {
          total -= curr;
        } else {
          total += curr;
        }
      }
      return total;
    }

    /**
     * Bóc tách số thứ tự chương từ mọi định dạng phổ biến:
     * "Chương 12: ...", "Hồi IV - ...", "Chapter 03", "Chương Mười Hai"
     */
    extractChapterSequenceNumber(rawTitle, fallbackIndex = 0) {
      const title = String(rawTitle || '').trim();
      if (!title) return fallbackIndex;

      const arabicMatch = title.match(/(?:chương|hồi|phần|tập|màn|chapter|chap|ep|episode)\s*#?\s*(\d+)/i);
      if (arabicMatch) {
        return parseInt(arabicMatch[1], 10);
      }

      const leadingNumMatch = title.match(/^(\d{1,4})[\s.:_-]/);
      if (leadingNumMatch) {
        return parseInt(leadingNumMatch[1], 10);
      }

      const romanMatch = title.match(/(?:chương|hồi|phần|chapter)\s+([IVXLCDM]+)\b/i);
      if (romanMatch) {
        const val = this.romanToInteger(romanMatch[1]);
        if (val > 0) return val;
      }

      const lowered = title.toLowerCase();
      const textNumMatch = lowered.match(/(?:chương|hồi|phần)\s+([a-zàáảãạăằắẳẵặâầấẩẫậđ]+)/i);
      if (textNumMatch && VIETNAMESE_TEXT_NUMBERS[textNumMatch[1]]) {
        return VIETNAMESE_TEXT_NUMBERS[textNumMatch[1]];
      }

      return fallbackIndex;
    }

    /**
     * So sánh hai tiêu đề chương theo thứ tự tự nhiên (Natural Sort Order)
     */
    compareChapterTitlesNatural(titleA, titleB) {
      const numA = this.extractChapterSequenceNumber(titleA, -1);
      const numB = this.extractChapterSequenceNumber(titleB, -1);
      if (numA !== -1 && numB !== -1 && numA !== numB) {
        return numA - numB;
      }
      return String(titleA || '').localeCompare(String(titleB || ''), 'vi', {
        numeric: true,
        sensitivity: 'base'
      });
    }
  }

  // ==========================================================================
  // PHẦN 6: BỘ TIỆN ÍCH GIAO DIỆN THÂN THIỆN & ĐỊNH DẠNG DỮ LIỆU CHUNG
  // ==========================================================================

  class HumanizedUIAndTextUtils {
    constructor() {
      this.nlp = new VietnameseLiteraryNLPEngine();
      this.numeralParser = new VietnameseChapterNumeralParser();
      this.toastManager = new HumanizedToastManager(this);
      this.blockingLoader = new GlobalAIBlockingLoaderController(this);
    }

    escapeHtml(raw) {
      if (raw === null || raw === undefined) return '';
      return String(raw)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    unescapeHtml(raw) {
      if (raw === null || raw === undefined) return '';
      return String(raw)
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&gt;/g, '>')
        .replace(/&lt;/g, '<')
        .replace(/&amp;/g, '&');
    }

    stripHtmlTags(rawHtml) {
      if (!rawHtml) return '';
      return String(rawHtml)
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/gi, ' ')
        .trim();
    }

    countVietnameseWords(text) {
      return this.nlp.countWords(text);
    }

    countParagraphs(text) {
      return this.nlp.countParagraphs(text);
    }

    estimateReadingTimeMinutes(wordCount) {
      return this.nlp.estimateReadingTimeMinutes(wordCount);
    }

    stripVietnameseDiacritics(text) {
      return this.nlp.stripVietnameseDiacritics(text);
    }

    slugifyVietnameseFilename(title, maxLen = 64) {
      return this.nlp.slugifyVietnameseFilename(title, maxLen);
    }

    normalizeUnicodeNFC(text) {
      return this.nlp.normalizeUnicodeNFC(text);
    }

    formatNumberVN(value) {
      const num = Number(value) || 0;
      try {
        return num.toLocaleString('vi-VN');
      } catch (_) {
        return String(num);
      }
    }

    formatTimestampVN(timestamp) {
      const ts = Number(timestamp);
      if (!ts || Number.isNaN(ts)) return 'Vừa xong';
      const d = new Date(ts);
      if (Number.isNaN(d.getTime())) return 'Vừa xong';

      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();

      return `${hh}:${mm}:${ss} • ${dd}/${mo}/${yyyy}`;
    }

    formatRelativeTimeVN(timestamp) {
      const ts = Number(timestamp);
      if (!ts || Number.isNaN(ts)) return 'Vừa xong';
      const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
      if (diffSec < 12) return 'Vừa mới lưu';
      if (diffSec < 60) return `${diffSec} giây trước`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin} phút trước`;
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return `${diffHour} giờ trước`;
      const diffDay = Math.floor(diffHour / 24);
      if (diffDay < 30) return `${diffDay} ngày trước`;
      return this.formatTimestampVN(ts);
    }

    formatDurationMMSS(totalSeconds) {
      const safeSec = Math.max(0, Math.floor(Number(totalSeconds) || 0));
      const mins = Math.floor(safeSec / 60);
      const secs = safeSec % 60;
      return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    formatDurationHMS(totalSeconds) {
      const safeSec = Math.max(0, Math.floor(Number(totalSeconds) || 0));
      const hrs = Math.floor(safeSec / 3600);
      const mins = Math.floor((safeSec % 3600) / 60);
      const secs = safeSec % 60;
      if (hrs > 0) {
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }
      return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    truncateText(rawText, maxChars = 140) {
      const text = String(rawText || '').trim();
      if (text.length <= maxChars) return text;
      const sliced = text.slice(0, Math.max(10, maxChars - 1));
      const lastSpace = sliced.lastIndexOf(' ');
      return (lastSpace > maxChars * 0.55 ? sliced.slice(0, lastSpace) : sliced) + '…';
    }

    generateId(prefix = 'id') {
      const cleanPrefix = String(prefix || 'id').replace(/[^a-zA-Z0-9_-]/g, '');
      const rnd = Math.random().toString(36).slice(2, 8);
      return `${cleanPrefix}_${Date.now().toString(36)}_${rnd}`;
    }

    safeJsonParse(rawJson, fallbackValue = null) {
      if (typeof rawJson !== 'string' || !rawJson.trim()) return fallbackValue;
      try {
        return JSON.parse(rawJson);
      } catch (_) {
        return fallbackValue;
      }
    }

    safeJsonStringify(value, fallbackJson = '{}', space = 0) {
      try {
        return JSON.stringify(value, null, space);
      } catch (_) {
        return fallbackJson;
      }
    }

    debounce(fn, waitMs = 250) {
      let timerId = null;
      const debounced = function (...args) {
        const ctx = this;
        if (timerId) clearTimeout(timerId);
        timerId = setTimeout(() => {
          timerId = null;
          fn.apply(ctx, args);
        }, Math.max(10, waitMs));
      };
      debounced.cancel = () => {
        if (timerId) {
          clearTimeout(timerId);
          timerId = null;
        }
      };
      return debounced;
    }

    throttle(fn, limitMs = 150) {
      let lastRanAt = 0;
      let pendingTimer = null;
      return function (...args) {
        const ctx = this;
        const now = Date.now();
        const remaining = limitMs - (now - lastRanAt);
        if (remaining <= 0) {
          if (pendingTimer) {
            clearTimeout(pendingTimer);
            pendingTimer = null;
          }
          lastRanAt = now;
          fn.apply(ctx, args);
        } else if (!pendingTimer) {
          pendingTimer = setTimeout(() => {
            lastRanAt = Date.now();
            pendingTimer = null;
            fn.apply(ctx, args);
          }, remaining);
        }
      };
    }

    async copyTextToClipboard(text, successToastMsg = '') {
      const str = String(text ?? '');
      if (!str) {
        this.showToast('⚠️ Chưa có nội dung để sao chép vào khay nhớ tạm.', 'warn');
        return false;
      }
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(str);
          if (successToastMsg) this.showToast(successToastMsg, 'success');
          return true;
        }
      } catch (_) {
        // Thử fallback textarea nếu chạy file:// cục bộ không có HTTPS
      }

      try {
        if (typeof document !== 'undefined') {
          const temp = document.createElement('textarea');
          temp.value = str;
          temp.setAttribute('readonly', '');
          temp.style.position = 'fixed';
          temp.style.top = '-9999px';
          temp.style.left = '-9999px';
          document.body.appendChild(temp);
          temp.select();
          const ok = document.execCommand('copy');
          temp.remove();
          if (ok && successToastMsg) this.showToast(successToastMsg, 'success');
          return ok;
        }
      } catch (_) {
        // Bỏ qua nếu môi trường headless chặn clipboard
      }
      return false;
    }

    showToast(message, type = 'info', durationMs = 3400) {
      return this.toastManager.show(message, type, durationMs);
    }

    hideToast() {
      return this.toastManager.hideImmediate();
    }

    _appendLoaderStabilityNotice(subtitleText) {
      const base = String(subtitleText || '').trim();
      const lower = base.toLowerCase();
      if (lower.includes('không tắt') || lower.includes('không đóng')) {
        return base;
      }
      const notice =
        'Vui lòng kiên nhẫn chờ, KHÔNG tắt trang web hay rời khỏi màn hình này để quá trình chạy Prompt diễn ra ổn định.';
      return base ? `${base} • ${notice}` : notice;
    }

    showBlockingLoader(titleText, subtitleText, cancelCallback = null) {
      return this.blockingLoader.show(
        titleText,
        this._appendLoaderStabilityNotice(subtitleText),
        cancelCallback
      );
    }

    updateBlockingLoader(titleText, subtitleText) {
      return this.blockingLoader.update(
        titleText,
        this._appendLoaderStabilityNotice(subtitleText)
      );
    }

    hideBlockingLoader() {
      return this.blockingLoader.hide();
    }

    getRandomMotivationQuoteVN() {
      const list = HUMANIZED_MOTIVATIONAL_PHRASES_VN;
      return list[Math.floor(Math.random() * list.length)];
    }

    /**
     * Chuyển đổi văn bản thuần sang HTML đoạn văn giữ nguyên định dạng hội thoại `- Lời thoại`
     */
    renderManuscriptPreviewHtml(plainText, options = {}) {
      const text = this.normalizeUnicodeNFC(plainText);
      const classPrefix = options.classPrefix || 'noir-preview';
      if (!text.trim()) {
        return `<p class="italic text-zinc-500">Chưa có nội dung bản thảo...</p>`;
      }

      const paragraphs = text.split(/\n+/);
      return paragraphs
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed) return '<div class="h-2"></div>';
          if (/^([*\-_—]\s*){3,}$/.test(trimmed)) {
            return `<div class="${classPrefix}-divider text-center tracking-[0.6em] text-amber-400/75 py-2 select-none">* * *</div>`;
          }
          if (/^[-–—]\s+/.test(trimmed)) {
            return `<p class="${classPrefix}-dialogue pl-3 border-l-2 border-emerald-500/45 text-zinc-100 my-1.5 leading-relaxed">${this.escapeHtml(trimmed)}</p>`;
          }
          return `<p class="${classPrefix}-para text-zinc-200 my-1.5 leading-relaxed text-justify">${this.escapeHtml(trimmed)}</p>`;
        })
        .join('\n');
    }
  }

  // ==========================================================================
  // PHẦN 7: ĐỘNG CƠ CHẤM ĐIỂM NHỊP VĂN, PHÁT HIỆN LẶP CẤU TRÚC & SO SÁNH DIFF
  // ==========================================================================

  const TELLING_ADVERB_PATTERNS_VN = Object.freeze([
    'một cách kỳ lạ',
    'một cách chậm rãi',
    'một cách nhanh chóng',
    'một cách bất ngờ',
    'một cách lặng lẽ',
    'một cách đau đớn',
    'một cách lạnh lùng',
    'hết sức',
    'vô cùng',
    'cực kỳ',
    'tuyệt đối',
    'rất đỗi',
    'thật sự rất',
    'cảm thấy buồn',
    'cảm thấy sợ',
    'cảm thấy tức giận',
    'cảm thấy hạnh phúc',
    'trong lòng nghĩ thầm'
  ]);

  const PASSIVE_WEAK_VERBS_VN = Object.freeze([
    'đã bị',
    'bỗng nhiên bị',
    'dường như là',
    'có vẻ như là',
    'bắt đầu cảm thấy',
    'tiến hành việc',
    'thực hiện việc',
    'có sự xuất hiện của'
  ]);

  class VietnameseProseRhythmScorer {
    constructor(nlpEngine) {
      this.nlp = nlpEngine;
    }

    /**
     * Đo độ biến thiên độ dài câu (Sentence Burstiness) — văn hay thường xen kẽ
     * giữa câu ngắn tạo điểm nhấn và câu trung/dài giàu hình ảnh.
     */
    computeSentenceLengthVariance(sentenceLengths) {
      const len = sentenceLengths.length;
      if (len < 2) return { mean: sentenceLengths[0] || 0, stdDev: 0, burstiness: 'SINGLE_LINE' };
      const mean = sentenceLengths.reduce((a, b) => a + b, 0) / len;
      const variance =
        sentenceLengths.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / len;
      const stdDev = Math.sqrt(variance);
      let burstiness = 'BALANCED_FLOW';
      if (stdDev < 3.2 && len >= 6) {
        burstiness = 'MONOTONE_FLAT';
      } else if (stdDev > 11.5) {
        burstiness = 'HIGH_CONTRAST_DRAMATIC';
      }
      return {
        mean: Math.round(mean * 10) / 10,
        stdDev: Math.round(stdDev * 10) / 10,
        burstiness
      };
    }

    /**
     * Phát hiện lỗi mở đầu 3 câu liên tiếp bằng cùng một đại từ/tên riêng
     * (VD: "Hắn bước... Hắn nhìn... Hắn mỉm cười...").
     */
    detectConsecutiveSentenceStartEchoes(sentences) {
      if (!Array.isArray(sentences) || sentences.length < 3) return [];
      const anomalies = [];
      let streakStartIdx = 0;
      let prevFirstWord = '';
      let streakCount = 0;

      const getFirstWord = (s) => {
        const clean = String(s || '').replace(/^[-–—“"\s]+/, '').trim();
        const m = clean.match(/^([\p{L}\p{N}]+)/u);
        return m ? m[1].toLowerCase() : '';
      };

      for (let i = 0; i < sentences.length; i += 1) {
        const fw = getFirstWord(sentences[i]);
        if (fw && fw === prevFirstWord) {
          streakCount += 1;
        } else {
          if (streakCount >= 3) {
            anomalies.push({
              opener: prevFirstWord,
              streakCount,
              startSentenceIndex: streakStartIdx + 1,
              sample: sentences[streakStartIdx].slice(0, 90)
            });
          }
          prevFirstWord = fw;
          streakStartIdx = i;
          streakCount = fw ? 1 : 0;
        }
      }

      if (streakCount >= 3) {
        anomalies.push({
          opener: prevFirstWord,
          streakCount,
          startSentenceIndex: streakStartIdx + 1,
          sample: sentences[streakStartIdx].slice(0, 90)
        });
      }

      return anomalies;
    }

    /**
     * Quét các cụm từ "Kể lể thay vì miêu tả" (Telling over Showing) và giọng dịch máy cứng.
     */
    detectTellingAndMachineTranslationArtifacts(text) {
      const lower = this.nlp.normalizeUnicodeNFC(text).toLowerCase();
      const totalWords = Math.max(1, this.nlp.countWords(lower));
      const tellingHits = [];
      const passiveHits = [];

      TELLING_ADVERB_PATTERNS_VN.forEach((pattern) => {
        if (lower.includes(pattern)) {
          const count = lower.split(pattern).length - 1;
          tellingHits.push({ phrase: pattern, count });
        }
      });

      PASSIVE_WEAK_VERBS_VN.forEach((pattern) => {
        if (lower.includes(pattern)) {
          const count = lower.split(pattern).length - 1;
          passiveHits.push({ phrase: pattern, count });
        }
      });

      const tellingTotal = tellingHits.reduce((a, b) => a + b.count, 0);
      const passiveTotal = passiveHits.reduce((a, b) => a + b.count, 0);
      const densityPer1k = Math.round(((tellingTotal + passiveTotal) / totalWords) * 1000 * 10) / 10;

      return {
        tellingHits,
        passiveHits,
        tellingTotal,
        passiveTotal,
        densityPer1k
      };
    }

    /**
     * Chấm điểm tổng hợp chất lượng văn phong bản thảo (thang 0..100) kèm gợi ý biên tập.
     */
    evaluateFullChapterQuality(text) {
      const normalized = this.nlp.normalizeUnicodeNFC(text);
      const totalWords = this.nlp.countWords(normalized);
      if (totalWords < 15) {
        return {
          totalWords,
          overallScore: 0,
          grade: 'CHƯA ĐỦ DỮ LIỆU',
          tips: ['Hãy viết ít nhất 15–30 từ để hệ thống chấm điểm nhịp văn và độ giàu giác quan.'],
          metrics: null
        };
      }

      const sentences = this.nlp.splitSentencesVN(normalized);
      const lengths = sentences.map((s) => this.nlp.countWords(s)).filter((n) => n > 0);
      const varianceReport = this.computeSentenceLengthVariance(lengths);
      const startEchoes = this.detectConsecutiveSentenceStartEchoes(sentences);
      const tellingReport = this.detectTellingAndMachineTranslationArtifacts(normalized);
      const sensoryReport = this.nlp.analyzeSensoryRichnessVN(normalized);
      const dialogueReport = this.nlp.extractDialoguesVN(normalized);
      const emotionalReport = this.nlp.analyzeEmotionalToneAndCadenceVN(normalized);

      let score = 74;
      if (sensoryReport.activeSensesCount >= 4) score += 10;
      else if (sensoryReport.activeSensesCount >= 2) score += 5;

      if (varianceReport.burstiness === 'BALANCED_FLOW') score += 7;
      else if (varianceReport.burstiness === 'HIGH_CONTRAST_DRAMATIC') score += 8;
      else if (varianceReport.burstiness === 'MONOTONE_FLAT') score -= 8;

      if (emotionalReport.reduplicativeCount >= 4) score += 5;
      if (dialogueReport.dialogueRatioPercent >= 15 && dialogueReport.dialogueRatioPercent <= 62) {
        score += 4;
      }

      score -= Math.min(12, startEchoes.length * 4);
      score -= Math.min(15, Math.floor(tellingReport.densityPer1k * 1.6));

      const clampedScore = Math.max(25, Math.min(100, Math.round(score)));
      let grade = 'ỔN ĐỊNH';
      if (clampedScore >= 90) grade = 'XUẤT SẮC (CHUẨN XUẤT BẢN)';
      else if (clampedScore >= 80) grade = 'MƯỢT MÀ & GIÀU HÌNH ẢNH';
      else if (clampedScore >= 68) grade = 'KHÁ (CÓ THỂ TRAU CHUỐT THÊM)';
      else grade = 'CẦN BIÊN TẬP LẠI NHỊP CÂU';

      const tips = [];
      if (startEchoes.length > 0) {
        tips.push(
          `Phát hiện ${startEchoes.length} chỗ lặp từ mở đầu câu liên tiếp (ví dụ "${startEchoes[0].opener}" ${startEchoes[0].streakCount} lần). Hãy thử đảo trạng ngữ hoặc lồng hành động.`
        );
      }
      if (tellingReport.tellingHits.length > 0) {
        const samples = tellingReport.tellingHits.slice(0, 3).map((h) => `"${h.phrase}"`).join(', ');
        tips.push(`Có thể thay ${samples} bằng hành vi cơ thể / ánh mắt cụ thể (Show-Don't-Tell).`);
      }
      if (sensoryReport.feedback) {
        tips.push(sensoryReport.feedback);
      }
      if (varianceReport.burstiness === 'MONOTONE_FLAT') {
        tips.push('Độ dài các câu đang khá đều nhau. Hãy đan xen vài câu ngắn 3–6 chữ ở khoảnh khắc cao trào.');
      }
      if (tips.length === 0) {
        tips.push('Nhịp văn cân đối, hội thoại tự nhiên và mật độ ngũ quan rất hài hòa!');
      }

      return {
        totalWords,
        overallScore: clampedScore,
        grade,
        tips,
        metrics: {
          varianceReport,
          startEchoes,
          tellingReport,
          sensoryReport,
          dialogueReport,
          emotionalReport
        }
      };
    }
  }

  // ==========================================================================
  // PHẦN 8: SO SÁNH DIFF ĐOẠN VĂN (LCS LINE DIFF) & THAO TÁC CON TRỎ EDITOR
  // ==========================================================================

  class ManuscriptLineDiffUtility {
    /**
     * Tính toán tóm tắt sự thay đổi theo từng đoạn giữa hai phiên bản văn bản
     * (phục vụ xem nhanh khác biệt trong Kho Lưu Trữ Phiên Bản Tab 6).
     */
    computeParagraphDiff(oldText, newText) {
      const oldParas = String(oldText || '').split(/\r?\n/);
      const newParas = String(newText || '').split(/\r?\n/);
      const maxCheckOld = oldParas.slice(0, 500);
      const maxCheckNew = newParas.slice(0, 500);

      const m = maxCheckOld.length;
      const n = maxCheckNew.length;
      const dp = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1));

      for (let i = 1; i <= m; i += 1) {
        for (let j = 1; j <= n; j += 1) {
          if (maxCheckOld[i - 1] === maxCheckNew[j - 1]) {
            dp[i][j] = dp[i - 1][j - 1] + 1;
          } else {
            dp[i][j] = dp[i - 1][j] >= dp[i][j - 1] ? dp[i - 1][j] : dp[i][j - 1];
          }
        }
      }

      const ops = [];
      let i = m;
      let j = n;
      while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && maxCheckOld[i - 1] === maxCheckNew[j - 1]) {
          ops.push({ type: 'UNCHANGED', text: maxCheckNew[j - 1], oldLine: i, newLine: j });
          i -= 1;
          j -= 1;
        } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
          ops.push({ type: 'ADDED', text: maxCheckNew[j - 1], newLine: j });
          j -= 1;
        } else {
          ops.push({ type: 'REMOVED', text: maxCheckOld[i - 1], oldLine: i });
          i -= 1;
        }
      }

      ops.reverse();
      let addedLines = 0;
      let removedLines = 0;
      let unchangedLines = 0;
      ops.forEach((op) => {
        if (op.type === 'ADDED' && op.text.trim()) addedLines += 1;
        else if (op.type === 'REMOVED' && op.text.trim()) removedLines += 1;
        else if (op.type === 'UNCHANGED' && op.text.trim()) unchangedLines += 1;
      });

      return {
        ops,
        addedLines,
        removedLines,
        unchangedLines
      };
    }
  }

  class TextareaCursorToolkit {
    /**
     * Chèn chuỗi tại đúng vị trí con trỏ của <textarea> và bắn sự kiện `input`
     * để hệ thống auto-save + word counter tự cập nhật đồng bộ.
     */
    insertTextAtCursor(textareaEl, snippet, options = {}) {
      if (!textareaEl) return false;
      const str = String(snippet ?? '');
      const start = typeof textareaEl.selectionStart === 'number' ? textareaEl.selectionStart : textareaEl.value.length;
      const end = typeof textareaEl.selectionEnd === 'number' ? textareaEl.selectionEnd : start;
      const val = textareaEl.value || '';

      let prefix = '';
      let suffix = '';
      if (options.ensureNewlineBefore && start > 0 && val[start - 1] !== '\n') {
        prefix = '\n';
      }
      if (options.ensureNewlineAfter && end < val.length && val[end] !== '\n') {
        suffix = '\n';
      }

      const fullInsert = `${prefix}${str}${suffix}`;
      textareaEl.value = val.slice(0, start) + fullInsert + val.slice(end);
      const nextCaret = start + fullInsert.length;

      try {
        textareaEl.focus();
        textareaEl.setSelectionRange(nextCaret, nextCaret);
      } catch (_) {
        // Bỏ qua nếu element bị ẩn trên mobile
      }

      textareaEl.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    }

    /**
     * Bọc đoạn văn bản đang được bôi đen bằng cặp ký tự (VD: `“...”` hoặc `*...*`)
     */
    wrapSelection(textareaEl, leftWrapper, rightWrapper = leftWrapper) {
      if (!textareaEl) return false;
      const start = typeof textareaEl.selectionStart === 'number' ? textareaEl.selectionStart : 0;
      const end = typeof textareaEl.selectionEnd === 'number' ? textareaEl.selectionEnd : 0;
      const val = textareaEl.value || '';
      const selected = val.slice(start, end);
      const replacement = `${leftWrapper}${selected}${rightWrapper}`;
      textareaEl.value = val.slice(0, start) + replacement + val.slice(end);

      const newStart = start + leftWrapper.length;
      const newEnd = newStart + selected.length;
      try {
        textareaEl.focus();
        textareaEl.setSelectionRange(selected ? newEnd + rightWrapper.length : newStart, selected ? newEnd + rightWrapper.length : newStart);
      } catch (_) {
        // Bỏ qua
      }

      textareaEl.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    }

    /**
     * Cuộn nhẹ phần tử textarea đưa đoạn khớp regex vào vùng trung tâm (hỗ trợ Typewriter & Find)
     */
    scrollToCharacterIndex(textareaEl, charIndex) {
      if (!textareaEl) return false;
      const idx = Math.max(0, Math.min(textareaEl.value.length, Number(charIndex) || 0));
      const before = textareaEl.value.slice(0, idx);
      const lineIdx = before.split('\n').length - 1;
      const lineHeightPx = parseFloat(getComputedStyle(textareaEl).lineHeight) || 26;
      const targetScroll = Math.max(0, lineIdx * lineHeightPx - textareaEl.clientHeight * 0.35);
      textareaEl.scrollTop = targetScroll;
      try {
        textareaEl.focus();
        textareaEl.setSelectionRange(idx, idx);
      } catch (_) {
        // Bỏ qua
      }
      return true;
    }
  }

  // ==========================================================================
  // PHẦN 9: QUẢN LÝ NGĂN XẾP MODAL (ESCAPE / BACKDROP), DIALOG XÁC NHẬN & A11Y
  // ==========================================================================

  class ModalStackCoordinator {
    constructor() {
      this.registeredModalIds = [
        'modal-fullscreen-version-preview',
        'modal-confirm-synthesized-prompt',
        'modal-scene-transition-builder',
        'modal-system-prompts-config',
        'modal-fullscreen-ai-command',
        'modal-approve-chapter-smart',
        'modal-custom-book-exporter',
        'modal-api-key-vault',
        'modal-free-gemini-chat',
        'modal-quick-scratchpad',
        'modal-sensory-and-author-notes',
        'modal-tutorial-changelog-az'
      ];
      this._escapeBound = false;
    }

    initEscapeListener() {
      if (this._escapeBound || typeof document === 'undefined') return;
      this._escapeBound = true;
      document.addEventListener('keydown', (evt) => {
        if (evt.key !== 'Escape') return;
        const loader = document.getElementById('global-ai-blocking-loader');
        if (loader && !loader.classList.contains('hidden')) {
          return;
        }
        for (let i = 0; i < this.registeredModalIds.length; i += 1) {
          const modalId = this.registeredModalIds[i];
          const el = document.getElementById(modalId);
          if (el && !el.classList.contains('hidden')) {
            el.classList.add('hidden');
            evt.preventDefault();
            break;
          }
        }
      });
    }

    openModalById(modalId) {
      if (typeof document === 'undefined') return null;
      const el = document.getElementById(modalId);
      if (!el) return null;
      el.classList.remove('hidden');
      el.setAttribute('aria-hidden', 'false');
      return el;
    }

    closeModalById(modalId) {
      if (typeof document === 'undefined') return false;
      const el = document.getElementById(modalId);
      if (!el) return false;
      el.classList.add('hidden');
      el.setAttribute('aria-hidden', 'true');
      return true;
    }

    isAnyModalOpen() {
      if (typeof document === 'undefined') return false;
      return this.registeredModalIds.some((id) => {
        const el = document.getElementById(id);
        return el && !el.classList.contains('hidden');
      });
    }
  }

  /**
   * Hộp thoại xác nhận phi đồng bộ đẹp mắt thay thế `window.confirm` cứng nhắc
   * trên cả máy tính và điện thoại cảm ứng.
   */
  class HumanizedConfirmDialogService {
    constructor(utilsRef) {
      this.utils = utilsRef;
    }

    askConfirm(options = {}) {
      const {
        title = 'Xác nhận thao tác',
        message = 'Bạn có chắc chắn muốn thực hiện thay đổi này không?',
        confirmLabel = 'Đồng ý',
        cancelLabel = 'Để sau',
        danger = false
      } = options;

      if (typeof document === 'undefined') {
        return Promise.resolve(true);
      }

      return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className =
          'fixed inset-0 z-[10020] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');

        const accentBtn = danger
          ? 'bg-rose-600 hover:bg-rose-500 text-white'
          : 'bg-emerald-600 hover:bg-emerald-500 text-white';

        overlay.innerHTML = `
          <div class="w-full max-w-md rounded-2xl border border-zinc-700/80 bg-zinc-900 p-5 shadow-2xl space-y-4">
            <div class="flex items-start justify-between gap-3">
              <h3 class="text-base font-extrabold text-zinc-100 leading-snug">${this.utils.escapeHtml(title)}</h3>
            </div>
            <p class="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">${this.utils.escapeHtml(message)}</p>
            <div class="flex items-center justify-end gap-2.5 pt-2">
              <button type="button" data-confirm-act="cancel" class="px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition">${this.utils.escapeHtml(cancelLabel)}</button>
              <button type="button" data-confirm-act="ok" class="px-4 py-2 rounded-xl text-xs font-extrabold shadow transition ${accentBtn}">${this.utils.escapeHtml(confirmLabel)}</button>
            </div>
          </div>
        `;

        const cleanup = (answer) => {
          document.removeEventListener('keydown', onKey);
          overlay.remove();
          resolve(answer);
        };

        const onKey = (e) => {
          if (e.key === 'Escape') cleanup(false);
          if (e.key === 'Enter') cleanup(true);
        };

        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) cleanup(false);
        });
        overlay.querySelector('[data-confirm-act="cancel"]').addEventListener('click', () => cleanup(false));
        overlay.querySelector('[data-confirm-act="ok"]').addEventListener('click', () => cleanup(true));
        document.addEventListener('keydown', onKey);
        document.body.appendChild(overlay);
      });
    }
  }

  // ==========================================================================
  // PHẦN 10: BỘ PHÂN TÍCH TẦN SUẤT TỪ KHÓA & ĐỒNG BỘ GIAO DIỆN ĐA THIẾT BỊ
  // ==========================================================================

  class VietnameseSemanticKeywordExtractor {
    constructor(nlpEngine) {
      this.nlp = nlpEngine;
    }

    /**
     * Trích xuất cụm từ đặc trưng (Bigram + Unigram lọc stopword) trong một chương
     * để hỗ trợ Story Bible, RAG và hiển thị thẻ chủ đề nhanh.
     */
    extractTopSalientKeywords(text, topK = 18) {
      const normalized = this.nlp.normalizeUnicodeNFC(text).toLowerCase();
      const tokens = this.nlp.tokenizeWordsVN(normalized);
      if (!tokens.length) return [];

      const scores = new Map();
      const stopwords = this.nlp.stopwords;

      for (let i = 0; i < tokens.length; i += 1) {
        const w1 = tokens[i];
        if (w1.length >= 3 && !stopwords.has(w1) && !/^\d+$/.test(w1)) {
          scores.set(w1, (scores.get(w1) || 0) + 1);
        }
        if (i + 1 < tokens.length) {
          const w2 = tokens[i + 1];
          if (
            w1.length >= 2 &&
            w2.length >= 2 &&
            !stopwords.has(w1) &&
            !stopwords.has(w2)
          ) {
            const bigram = `${w1} ${w2}`;
            scores.set(bigram, (scores.get(bigram) || 0) + 1.8);
          }
        }
      }

      return Array.from(scores.entries())
        .map(([term, score]) => ({ term, score: Math.round(score * 10) / 10 }))
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);
    }

    /**
     * Tạo đoạn trích tóm tắt thông minh 2–3 câu giàu thông tin nhất từ đầu & cuối chương
     * dùng làm bản xem trước nhanh ở Danh sách Chương và Phiên bản cũ.
     */
    buildSmartChapterTeaser(text, maxChars = 220) {
      const clean = this.nlp.normalizeUnicodeNFC(text).trim();
      if (!clean) return 'Chương này hiện chưa có nội dung chữ.';
      const sentences = this.nlp.splitSentencesVN(clean);
      if (sentences.length <= 2) {
        const joined = clean.replace(/\s+/g, ' ');
        return joined.length <= maxChars ? joined : joined.slice(0, maxChars - 1) + '…';
      }
      const firstPart = sentences.slice(0, 2).join(' ');
      if (firstPart.length >= maxChars) {
        return firstPart.slice(0, maxChars - 1) + '…';
      }
      return firstPart;
    }

    /**
     * Tách một chương dài thành danh sách các phân cảnh (Scenes) dựa trên dấu ngắt cảnh
     * (`* * *`, `---`, `===`, `###`) hoặc dòng trống kép.
     */
    splitChapterIntoSceneBlocks(text) {
      const normalized = this.nlp.normalizeUnicodeNFC(text).trim();
      if (!normalized) return [];

      const dividerRegex = /^\s*(?:\*\s*\*\s*\*|-{3,}|={3,}|#{3,}|~{3,})\s*$/m;
      if (dividerRegex.test(normalized)) {
        return normalized
          .split(dividerRegex)
          .map((chunk, idx) => {
            const body = chunk.trim();
            return {
              sceneIndex: idx + 1,
              title: `Phân cảnh ${idx + 1}`,
              wordCount: this.nlp.countWords(body),
              preview: this.buildSmartChapterTeaser(body, 140),
              content: body
            };
          })
          .filter((s) => s.content.length > 0);
      }

      const paras = normalized.split(/\n{2,}/).filter((p) => p.trim().length > 0);
      if (paras.length <= 6) {
        return [
          {
            sceneIndex: 1,
            title: 'Phân cảnh mở màn',
            wordCount: this.nlp.countWords(normalized),
            preview: this.buildSmartChapterTeaser(normalized, 140),
            content: normalized
          }
        ];
      }

      const chunkSize = Math.ceil(paras.length / 3);
      const blocks = [];
      for (let i = 0; i < paras.length; i += chunkSize) {
        const body = paras.slice(i, i + chunkSize).join('\n\n');
        blocks.push({
          sceneIndex: blocks.length + 1,
          title: `Nhịp cảnh ${blocks.length + 1}`,
          wordCount: this.nlp.countWords(body),
          preview: this.buildSmartChapterTeaser(body, 140),
          content: body
        });
      }
      return blocks;
    }
  }

  class ViewportAndKeyboardAdapter {
    /**
     * Tự động hỗ trợ vùng an toàn bàn phím ảo trên điện thoại Android / iOS Safari
     * để thanh soạn thảo và thanh công cụ nổi không bị che khuất khi đang gõ.
     */
    initMobileViewportGuard() {
      if (typeof window === 'undefined' || typeof document === 'undefined') return;
      const updateVH = () => {
        const vv = window.visualViewport;
        const h = vv ? vv.height : window.innerHeight;
        document.documentElement.style.setProperty('--noir-visual-height', `${Math.round(h)}px`);
        if (vv && window.innerHeight - vv.height > 140) {
          document.body.classList.add('noir-mobile-keyboard-open');
        } else {
          document.body.classList.remove('noir-mobile-keyboard-open');
        }
      };

      updateVH();
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', updateVH);
      }
      window.addEventListener('resize', updateVH);
    }
  }

  // ==========================================================================
  // PHẦN 11: BỘ ĐỒ THỊ THỐNG KÊ TIẾN ĐỘ PHIÊN VIẾT & TÍNH TOÁN CHỈ SỐ TÁC GIẢ
  // ==========================================================================

  class AuthorSessionVelocityCalculator {
    constructor() {
      this.sessionStartedAt = Date.now();
      this.initialTotalWords = 0;
      this.peakWpm = 0;
      this.snapshots = [];
    }

    resetBaseline(currentTotalWords) {
      this.sessionStartedAt = Date.now();
      this.initialTotalWords = Number(currentTotalWords) || 0;
      this.snapshots = [{ ts: Date.now(), words: this.initialTotalWords }];
    }

    recordSnapshot(currentTotalWords) {
      const wc = Number(currentTotalWords) || 0;
      const now = Date.now();
      this.snapshots.push({ ts: now, words: wc });
      if (this.snapshots.length > 180) {
        this.snapshots.shift();
      }

      const elapsedMinutes = Math.max(0.25, (now - this.sessionStartedAt) / 60000);
      const netDelta = wc - this.initialTotalWords;
      const currentWpm = netDelta > 0 ? Math.round(netDelta / elapsedMinutes) : 0;
      if (currentWpm > this.peakWpm) {
        this.peakWpm = currentWpm;
      }

      return {
        netDeltaWords: netDelta,
        elapsedMinutes: Math.round(elapsedMinutes * 10) / 10,
        wordsPerMinute: currentWpm,
        peakWpm: this.peakWpm
      };
    }

    formatSpeedLabelVN(wpm) {
      const speed = Number(wpm) || 0;
      if (speed <= 0) return 'Đang khởi động mạch ý tưởng';
      if (speed < 15) return `${speed} từ/phút • Gọt giũa tỉ mỉ`;
      if (speed < 35) return `${speed} từ/phút • Nhịp viết ổn định`;
      return `${speed} từ/phút • Cảm hứng tuôn trào!`;
    }
  }

  // Mở rộng tiện ích bổ sung trên HumanizedUIAndTextUtils
  const proto = HumanizedUIAndTextUtils.prototype;
  proto.evaluateProseQuality = function (text) {
    if (!this.proseScorer) {
      this.proseScorer = new VietnameseProseRhythmScorer(this.nlp);
    }
    return this.proseScorer.evaluateFullChapterQuality(text);
  };
  proto.computeLineDiff = function (oldText, newText) {
    if (!this.diffUtil) {
      this.diffUtil = new ManuscriptLineDiffUtility();
    }
    return this.diffUtil.computeParagraphDiff(oldText, newText);
  };
  proto.extractSalientKeywords = function (text, topK = 16) {
    if (!this.keywordExtractor) {
      this.keywordExtractor = new VietnameseSemanticKeywordExtractor(this.nlp);
    }
    return this.keywordExtractor.extractTopSalientKeywords(text, topK);
  };
  proto.splitChapterIntoScenes = function (text) {
    if (!this.keywordExtractor) {
      this.keywordExtractor = new VietnameseSemanticKeywordExtractor(this.nlp);
    }
    return this.keywordExtractor.splitChapterIntoSceneBlocks(text);
  };
  proto.compareChapterTitlesNatural = function (a, b) {
    return this.numeralParser.compareChapterTitlesNatural(a, b);
  };
  proto.extractChapterNumber = function (title, fallbackIndex = 0) {
    return this.numeralParser.extractChapterSequenceNumber(title, fallbackIndex);
  };
  proto.stripAiMarkdownSymbols = function (rawText) {
    const src = String(rawText ?? '');
    if (!src) return '';
    let out = src.replace(/\r\n/g, '\n');
    out = out.replace(/```[a-zA-Z0-9_-]*\n?/g, '').replace(/```/g, '');
    out = out.replace(/^[ \t]*([-*_])(?:\s*\1){2,}[ \t]*$/gm, '');
    out = out.replace(/^[ \t]{0,3}#{1,6}[ \t]+/gm, '');
    out = out.replace(/^[ \t]*>[ \t]?/gm, '');
    out = out.replace(/^[ \t]*[\*\+][ \t]+/gm, '- ');
    out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '$1 ($2)');
    out = out.replace(/\*\*\*([^*\n]+)\*\*\*/g, '$1');
    out = out.replace(/\*\*([^*\n]+)\*\*/g, '$1');
    out = out.replace(/__([^_\n]+)__/g, '$1');
    out = out.replace(/(^|[^\w*])\*([^*\n]+)\*(?!\w)/gm, '$1$2');
    out = out.replace(/`([^`\n]+)`/g, '$1');
    out = out.replace(/\*\*|###|##|`/g, '');
    out = out.replace(/^[ \t]+$/gm, '');
    out = out.replace(/\n{3,}/g, '\n\n');
    return out.trim();
  };

  // Khởi tạo singleton & đăng ký vào `window.NoirStudio`
  const uiUtils = new HumanizedUIAndTextUtils();
  uiUtils.proseScorer = new VietnameseProseRhythmScorer(uiUtils.nlp);
  uiUtils.diffUtil = new ManuscriptLineDiffUtility();
  uiUtils.cursorToolkit = new TextareaCursorToolkit();
  uiUtils.modalStack = new ModalStackCoordinator();
  uiUtils.confirmService = new HumanizedConfirmDialogService(uiUtils);
  uiUtils.keywordExtractor = new VietnameseSemanticKeywordExtractor(uiUtils.nlp);
  uiUtils.viewportAdapter = new ViewportAndKeyboardAdapter();
  uiUtils.velocityCalc = new AuthorSessionVelocityCalculator();

  uiUtils.init = function initModule03Utils() {
    this.modalStack.initEscapeListener();
    this.viewportAdapter.initMobileViewportGuard();
  };

  NS.utils = uiUtils;
  NS.uiUtils = uiUtils;
  NS.stripAiMarkdownSymbols = (text) => uiUtils.stripAiMarkdownSymbols(text);
  NS.vnNlp = uiUtils.nlp;
  NS.proseScorer = uiUtils.proseScorer;
  NS.cursorToolkit = uiUtils.cursorToolkit;
  NS.modalStack = uiUtils.modalStack;
  NS.confirmDialog = (opts) => uiUtils.confirmService.askConfirm(opts);
  NS.VietnameseLiteraryNLPEngine = VietnameseLiteraryNLPEngine;
  NS.HumanizedUIAndTextUtils = HumanizedUIAndTextUtils;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => uiUtils.init());
    } else {
      uiUtils.init();
    }
  }

  if (typeof NS.registerModule === 'function') {
    NS.registerModule('mod03', uiUtils);
  }
})(typeof window !== 'undefined' ? window : globalThis);
