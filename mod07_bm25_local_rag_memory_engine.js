/**
 * ============================================================================
 * MODULE 07: ĐỘNG CƠ TÌM KIẾM CHỐNG QUÊN CỤC BỘ BM25+ (0 TOKEN LOCAL RAG)
 *            NHẬN DIỆN TỪ GHÉP TIẾNG VIỆT, ĐỒNG NGHĨA VĂN HỌC, ĐỒNG XUẤT HIỆN
 *            THỰC THỂ, TRỌNG SỐ THỜI GIAN & TÔ SÁNG NGỮ CẢNH TỨC THÌ
 * ============================================================================
 * Phiên bản: NoirStudio Modular Architecture v36.0
 * Tập tin: mod07_bm25_local_rag_memory_engine.js
 * Mục tiêu:
 *   1. Cung cấp lớp `LocalBM25MemoryEngine` gắn vào `window.NoirStudio.rag`.
 *   2. Triển khai đầy đủ các phương thức bắt buộc:
 *      - `tokenizeVN(text)`
 *      - `rebuildIndexFromChapters(chapters)`
 *      - `search(query, topK)`
 *      - `renderSearchResultsUI(query)`
 *   3. Cập nhật tức thời `#rag-index-count`, `#cmd-rag-status-pill`, `#rag-search-results`
 *      và hỗ trợ nhảy trực tiếp tới chương đích (`[data-rag-jump-chap]`) tại `SCREEN_1_WRITE`.
 *   4. Tích hợp từ điển Hư từ (Stopwords), Từ ghép Tiếng Việt (Compound Words),
 *      Mở rộng truy vấn đồng nghĩa (Query Expansion), chấm điểm lai BM25+ / TF-IDF,
 *      tăng điểm đồng xuất hiện nhân vật (Entity Co-occurrence), trọng số độ mới (Temporal Recency)
 *      và bộ tô sáng ngữ cảnh an toàn (Context Snippet Highlighter).
 * ============================================================================
 */

(function () {
  'use strict';

  window.NoirStudio = window.NoirStudio || {};

  // ==========================================================================
  // PHẦN 1: TỪ ĐIỂN HƯ TỪ, TỪ GHÉP VĂN HỌC & MỞ RỘNG TRUY VẤN ĐỒNG NGHĨA TIẾNG VIỆT
  // ==========================================================================
  const VIETNAMESE_RAG_DICTIONARY = {
    // Danh sách từ dừng (Stopwords) Tiếng Việt mở rộng để loại bỏ nhiễu khi tính IDF
    STOPWORDS: new Set([
      'là', 'và', 'của', 'có', 'những', 'các', 'một', 'trong', 'được', 'cho',
      'với', 'không', 'đã', 'này', 'đến', 'khi', 'về', 'như', 'từ', 'cũng',
      'người', 'ra', 'phải', 'trên', 'tại', 'theo', 'sẽ', 'mà', 'để', 'nhưng',
      'vào', 'còn', 'bị', 'do', 'bởi', 'vì', 'nếu', 'thì', 'hay', 'hoặc',
      'rằng', 'rất', 'lại', 'đang', 'vẫn', 'chỉ', 'hơn', 'nhất', 'cả', 'mọi',
      'mỗi', 'nào', 'đâu', 'sao', 'vậy', 'thế', 'nên', 'cần', 'muốn', 'biết',
      'thấy', 'làm', 'đi', 'lên', 'xuống', 'qua', 'vừa', 'mới', 'đều', 'chưa',
      'chẳng', 'đừng', 'chớ', 'hãy', 'bằng', 'giữa', 'sau', 'trước', 'ngoài',
      'dưới', 'cùng', 'nhiều', 'ít', 'lớn', 'nhỏ', 'tốt', 'xấu', 'lúc', 'nơi',
      'chỗ', 'việc', 'chuyện', 'điều', 'cách', 'phần', 'bên', 'phía', 'hướng',
      'đây', 'đó', 'kia', 'ấy', 'nọ', 'tôi', 'ta', 'mình', 'chúng', 'họ',
      'nó', 'hắn', 'y', 'nàng', 'cô', 'anh', 'chị', 'em', 'ông', 'bà', 'bác',
      'chú', 'cậu', 'gì', 'ai', 'chi', 'bao', 'nhiêu', 'bấy', 'vài', 'mấy',
      'toàn', 'bộ', 'nhé', 'nhỉ', 'chứ', 'ư', 'à', 'ạ', 'ơi', 'hả', 'hử',
      'cái', 'con', 'chiếc', 'tấm', 'bức', 'cuốn', 'quyển', 'tờ', 'viên',
      'ngôi', 'căn', 'tòa', 'nhà', 'phòng', 'lần', 'bước', 'tiếng', 'hơi',
      'chút', 'tí', 'nữa', 'thêm', 'bớt', 'luôn', 'ngay', 'liền', 'xong',
      'rồi', 'tuy', 'dù', 'mặc', 'hầu', 'gần', 'xa', 'cao', 'thấp', 'dài',
      'ngắn', 'rộng', 'hẹp', 'nhanh', 'chậm', 'sớm', 'muộn', 'cũ', 'mới'
    ]),

    // Từ điển từ ghép 2-3 âm tiết Tiếng Việt trong tiểu thuyết trinh thám, tâm lý, kỳ ảo, ngôn tình
    COMPOUND_WORDS: new Set([
      // Trinh thám - Hình sự - Pháp y
      'hiện trường', 'hung thủ', 'sát nhân', 'nạn nhân', 'nhân chứng', 'vật chứng',
      'bằng chứng', 'chứng cứ', 'ngoại phạm', 'động cơ', 'manh mối', 'phục bút',
      'dấu vân tay', 'vết máu', 'nhóm máu', 'khám nghiệm', 'tử thi', 'thi thể',
      'pháp y', 'cảnh sát', 'thám tử', 'thanh tra', 'điều tra', 'thẩm vấn',
      'hồ sơ', 'mật mã', 'mật khẩu', 'két sắt', 'chìa khóa', 'nhật ký',
      'di chúc', 'hợp đồng', 'bức thư', 'nặc danh', 'tống tiền', 'bắt cóc',
      'mất tích', 'ám sát', 'đầu độc', 'thuốc độc', 'thuốc mê', 'khẩu súng',
      'viên đạn', 'vỏ đạn', 'con dao', 'hung khí', 'vết thương', 'vết sẹo',
      'camera an ninh', 'hộp đen', 'cuộn băng', 'ghi âm', 'điện thoại',
      'tầng hầm', 'sân thượng', 'nhà kho', 'bến cảng', 'con hẻm', 'nghĩa trang',
      'bệnh viện', 'nhà xác', 'phòng thí nghiệm', 'tòa án', 'nhà tù',

      // Tâm lý - Nội tâm - Quan hệ nhân vật
      'ký ức', 'hồi ức', 'quá khứ', 'ác mộng', 'ảo giác', 'hoang tưởng',
      'tâm lý', 'nội tâm', 'bí mật', 'sự thật', 'lời nói dối', 'phản bội',
      'thù hận', 'báo thù', 'trả thù', 'chuộc lỗi', 'tội lỗi', 'lương tâm',
      'tuyệt vọng', 'cô đơn', 'ám ảnh', 'chấn thương', 'mất trí nhớ',
      'nhân cách', 'đa nhân cách', 'thôi miên', 'độc thoại', 'ánh mắt',
      'nụ cười', 'giọt nước mắt', 'nhịp tim', 'hơi thở', 'giọng nói',
      'tiếng bước chân', 'bóng tối', 'ánh sáng', 'mưa đêm', 'sương mù',

      // Bối cảnh - Thế giới quan - Kỳ ảo - Cổ trang - Hiện đại
      'thành phố', 'thị trấn', 'ngôi làng', 'biệt thự', 'dinh thự', 'lâu đài',
      'hoàng cung', 'kinh thành', 'giang hồ', 'võ lâm', 'môn phái', 'tông môn',
      'huyết thống', 'gia tộc', 'thừa kế', 'lời nguyền', 'phong ấn', 'cổ vật',
      'bảo vật', 'linh hồn', 'ma quỷ', 'bóng ma', 'thần bí', 'siêu nhiên',
      'không gian', 'thời gian', 'vòng lặp', 'tương lai', 'định mệnh',
      'số phận', 'bi kịch', 'cao trào', 'kết cục', 'khởi đầu'
    ]),

    // Nhóm từ đồng nghĩa & liên tưởng giúp mở rộng truy vấn (Query Expansion) 0 Token
    SYNONYM_CLUSTERS: [
      ['hung thủ', 'sát nhân', 'kẻ giết người', 'thủ phạm', 'tội phạm', 'kẻ thủ ác'],
      ['manh mối', 'chứng cứ', 'bằng chứng', 'vật chứng', 'dấu vết', 'phục bút'],
      ['thi thể', 'tử thi', 'xác chết', 'nạn nhân', 'cái xác'],
      ['vũ khí', 'hung khí', 'con dao', 'khẩu súng', 'viên đạn', 'thuốc độc'],
      ['ký ức', 'hồi ức', 'kỷ niệm', 'quá khứ', 'trí nhớ'],
      ['bí mật', 'ẩn giấu', 'che giấu', 'sự thật', 'chân tướng'],
      ['bức thư', 'lá thư', 'tờ giấy', 'nhật ký', 'lời nhắn', 'di thư'],
      ['biệt thự', 'dinh thự', 'tòa nhà', 'căn nhà', 'ngôi nhà'],
      ['tầng hầm', 'hầm ngầm', 'mật thất', 'phòng kín', 'căn phòng'],
      ['thám tử', 'thanh tra', 'cảnh sát', 'điều tra viên', 'đội trưởng'],
      ['hoảng sợ', 'kinh hoàng', 'sợ hãi', 'khiếp đảm', 'rùng mình', 'tuyệt vọng'],
      ['phản bội', 'lừa dối', 'bán đứng', 'âm mưu', 'cạm bẫy']
    ]
  };

  // ==========================================================================
  // PHẦN 2: BỘ TÁCH TỪ TIẾNG VIỆT, NHẬN DIỆN TỪ GHÉP & KHỬ DẤU PHỤC VỤ TÌM MỜ
  // ==========================================================================
  class VietnameseLinguisticTokenizer {
    constructor() {
      this.stopwords = VIETNAMESE_RAG_DICTIONARY.STOPWORDS;
      this.compounds = VIETNAMESE_RAG_DICTIONARY.COMPOUND_WORDS;
      this.synonymMap = this.buildBidirectionalSynonymMap(
        VIETNAMESE_RAG_DICTIONARY.SYNONYM_CLUSTERS
      );
    }

    /**
     * Xây dựng bảng ánh xạ từ đồng nghĩa hai chiều
     */
    buildBidirectionalSynonymMap(clusters) {
      const map = new Map();
      for (const group of clusters) {
        for (const term of group) {
          const cleanTerm = term.toLowerCase().trim();
          const others = group.filter((x) => x.toLowerCase().trim() !== cleanTerm);
          map.set(cleanTerm, others);
        }
      }
      return map;
    }

    /**
     * Loại bỏ dấu thanh Tiếng Việt (chuyển về bảng chữ cái ASCII không dấu)
     * Giúp tác giả gõ tìm kiếm nhanh không dấu vẫn tìm ra đúng đoạn văn có dấu.
     */
    stripVietnameseDiacritics(str) {
      if (!str || typeof str !== 'string') return '';
      return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase();
    }

    /**
     * Kiểm tra chuỗi truy vấn có chứa dấu Tiếng Việt hay không
     */
    hasVietnameseDiacritics(str) {
      if (!str) return false;
      return /[àáảãạăắằẳẵặâấầẩẫậđèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]/i.test(
        str
      );
    }

    /**
     * Tách từ đơn cơ bản (tương thích ngược 100% với `tokenizeVN(text)` trong hệ thống gốc)
     */
    tokenizeUnigrams(text, removeStopwords = false) {
      if (!text) return [];
      const normalized = String(text)
        .normalize('NFC')
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 1);

      if (!removeStopwords) return normalized;
      return normalized.filter((w) => !this.stopwords.has(w));
    }

    /**
     * Tách từ nâng cao kết hợp Từ đơn (Unigrams) + Từ ghép 2-3 âm tiết (Compound Words)
     * + Cụm tên riêng viết hoa (Proper Noun Bigrams)
     */
    tokenizeWithCompoundsAndEntities(text) {
      if (!text) {
        return {
          allTokens: [],
          meaningfulTokens: [],
          compoundTokens: [],
          asciiTokens: [],
          properNames: []
        };
      }

      const cleanText = String(text).normalize('NFC');
      const unigrams = this.tokenizeUnigrams(cleanText, false);
      const meaningfulTokens = unigrams.filter((w) => !this.stopwords.has(w));
      const compoundTokens = [];

      // 1. Nhận diện từ ghép 2 âm tiết và 3 âm tiết từ từ điển văn học
      for (let i = 0; i < unigrams.length - 1; i++) {
        const bi = `${unigrams[i]} ${unigrams[i + 1]}`;
        if (this.compounds.has(bi)) {
          compoundTokens.push(bi.replace(/\s+/g, '_'));
        }
        if (i + 2 < unigrams.length) {
          const tri = `${unigrams[i]} ${unigrams[i + 1]} ${unigrams[i + 2]}`;
          if (this.compounds.has(tri)) {
            compoundTokens.push(tri.replace(/\s+/g, '_'));
          }
        }
      }

      // 2. Nhận diện cụm tên riêng viết hoa liên tiếp (VD: "Lâm Phong", "Trần Hải")
      const properNames = [];
      const properRegex =
        /\b([A-ZÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ][a-zàáảãạăắằẳẵặâấầẩẫậđèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]+(?:\s+[A-ZÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ][a-zàáảãạăắằẳẵặâấầẩẫậđèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]+){1,2})\b/g;

      let match = null;
      while ((match = properRegex.exec(cleanText)) !== null) {
        const nameLower = match[1].trim().toLowerCase();
        properNames.push(nameLower);
        compoundTokens.push(nameLower.replace(/\s+/g, '_'));
      }

      const combinedTokens = [...unigrams, ...compoundTokens];
      const asciiTokens = unigrams.map((t) => this.stripVietnameseDiacritics(t));

      return {
        allTokens: combinedTokens,
        meaningfulTokens: [...meaningfulTokens, ...compoundTokens],
        compoundTokens,
        asciiTokens,
        properNames: [...new Set(properNames)]
      };
    }

    /**
     * Mở rộng truy vấn bằng từ đồng nghĩa văn học (Query Expansion)
     */
    expandQueryWithSynonyms(queryText) {
      if (!queryText) return [];
      const lower = queryText.normalize('NFC').toLowerCase().trim();
      const expandedTerms = [];

      for (const [term, synonyms] of this.synonymMap.entries()) {
        if (lower.includes(term)) {
          for (const syn of synonyms.slice(0, 3)) {
            expandedTerms.push(syn);
          }
        }
      }

      return [...new Set(expandedTerms)];
    }
  }

  // ==========================================================================
  // PHẦN 3: BỘ PHÂN ĐOẠN BẢN THẢO THÔNG MINH (SEMANTIC NARRATIVE CHUNKER)
  // ==========================================================================
  class SemanticNarrativeChunker {
    constructor(tokenizer) {
      this.tokenizer = tokenizer;
      this.clueKeywords = [
        'manh mối', 'chứng cứ', 'bằng chứng', 'vết máu', 'dấu vân tay',
        'bức thư', 'nhật ký', 'chìa khóa', 'mật mã', 'két sắt', 'di chúc',
        'hồ sơ', 'tấm ảnh', 'cuộn băng', 'ghi âm', 'vết sẹo', 'con dao',
        'khẩu súng', 'viên đạn', 'thuốc độc', 'bí mật', 'phục bút', 'hung thủ'
      ];
      this.highEmotionKeywords = [
        'kinh hoàng', 'tuyệt vọng', 'run rẩy', 'hét lên', 'gào thét',
        'khóc nấc', 'nước mắt', 'máu tươi', 'lạnh sống lưng', 'rùng mình',
        'phản bội', 'căm hận', 'sững sờ', 'bàng hoàng', 'chết lặng', 'nghẹt thở'
      ];
    }

    /**
     * Phân tách danh sách chương thành các mảnh ký ức (Chunks) có ngữ cảnh liền mạch
     */
    buildChunksFromChapters(chapters = []) {
      const chunks = [];
      if (!Array.isArray(chapters) || chapters.length === 0) {
        return chunks;
      }

      const totalChapters = chapters.length;

      chapters.forEach((chap, chapIdx) => {
        if (!chap) return;
        const rawText = String(chap.content || '').trim();
        if (!rawText) return;

        const chapterId = chap.id || `chap_${chapIdx + 1}`;
        const chapterNumber = Number(chap.chapterNumber) || chapIdx + 1;
        const chapterTitle =
          chap.displayTitle || chap.title || `Chương ${chapterNumber}`;
        const status = chap.status === 'APPROVED' ? 'APPROVED' : 'DRAFT';

        // Tách đoạn văn theo dòng trống hoặc ngắt dòng thực sự
        const rawParagraphs = rawText
          .split(/\r?\n\r?\n+/)
          .map((p) => p.trim())
          .filter((p) => p.length > 25);

        // Nếu tác giả chỉ xuống dòng đơn (\n) mà không cách dòng (\n\n), tách theo từng cụm dòng đơn
        const paragraphs =
          rawParagraphs.length <= 1 && rawText.length > 450
            ? rawText
                .split(/\r?\n+/)
                .map((p) => p.trim())
                .filter((p) => p.length > 25)
            : rawParagraphs;

        if (paragraphs.length === 0 && rawText.length > 0) {
          paragraphs.push(rawText);
        }

        // Gom mỗi 2 đoạn văn thành 1 mảnh ký ức (kèm trượt cửa sổ nhẹ nếu đoạn quá ngắn)
        for (let i = 0; i < paragraphs.length; i += 2) {
          const slice = paragraphs.slice(i, i + 2);
          // Nếu 2 đoạn văn quá ngắn (< 120 ký tự) và còn đoạn kế tiếp, lấy thêm đoạn thứ 3
          if (slice.join('\n').length < 120 && i + 2 < paragraphs.length) {
            slice.push(paragraphs[i + 2]);
          }

          const snippet = slice.join('\n');
          const tokenized = this.tokenizer.tokenizeWithCompoundsAndEntities(snippet);
          const meta = this.analyzeSnippetNarrativeFeatures(snippet);

          chunks.push({
            id: `${chapterId}_chunk_${i}`,
            chapterId,
            chapterNumber,
            chapterIndex: chapIdx,
            chapterTitle,
            status,
            paragraphIndex: i,
            text: snippet,
            lowerText: snippet.normalize('NFC').toLowerCase(),
            asciiText: this.tokenizer.stripVietnameseDiacritics(snippet),
            tokens: tokenized.allTokens,
            meaningfulTokens: tokenized.meaningfulTokens,
            compoundTokens: tokenized.compoundTokens,
            asciiTokens: tokenized.asciiTokens,
            properNames: tokenized.properNames,
            hasDialogue: meta.hasDialogue,
            dialogueCount: meta.dialogueCount,
            hasClueMention: meta.hasClueMention,
            clueTermsFound: meta.clueTermsFound,
            emotionalIntensity: meta.emotionalIntensity,
            temporalOrderRatio:
              totalChapters > 1 ? chapIdx / (totalChapters - 1) : 1.0,
            updatedAt: chap.updatedAt || Date.now()
          });
        }
      });

      return chunks;
    }

    /**
     * Phân tích đặc trưng văn học của mảnh ký ức (hội thoại, manh mối, cường độ cảm xúc)
     */
    analyzeSnippetNarrativeFeatures(snippet) {
      const lines = snippet.split('\n').map((l) => l.trim()).filter(Boolean);
      let dialogueCount = 0;
      for (const l of lines) {
        if (/^(?:—|–|-|“|"|«)/.test(l)) {
          dialogueCount++;
        }
      }

      const lower = snippet.toLowerCase();
      const clueTermsFound = [];
      for (const kw of this.clueKeywords) {
        if (lower.includes(kw)) {
          clueTermsFound.push(kw);
        }
      }

      let emotionHits = 0;
      for (const emo of this.highEmotionKeywords) {
        if (lower.includes(emo)) {
          emotionHits++;
        }
      }

      return {
        hasDialogue: dialogueCount > 0,
        dialogueCount,
        hasClueMention: clueTermsFound.length > 0,
        clueTermsFound,
        emotionalIntensity: Math.min(5, emotionHits)
      };
    }
  }

  // ==========================================================================
  // PHẦN 4: CHỈ MỤC ĐẢO (INVERTED INDEX) & ĐỘNG CƠ CHẤM ĐIỂM LAI BM25+ / TF-IDF
  // ==========================================================================
  class HybridBM25PlusScoringEngine {
    constructor(tokenizer) {
      this.tokenizer = tokenizer;
      // Tham số chuẩn của Okapi BM25+ tối ưu cho văn bản tiểu thuyết Tiếng Việt
      this.k1 = 1.55;
      this.b = 0.72;
      this.delta = 1.0;

      // Bảng chỉ mục đảo giúp tra cứu tức thì O(1)
      this.invertedIndex = new Map(); // token -> Map<chunkIndex, termFrequency>
      this.asciiInvertedIndex = new Map(); // asciiToken -> Map<chunkIndex, termFrequency>
      this.docFreqMap = new Map(); // token -> số lượng chunk chứa token
      this.asciiDocFreqMap = new Map();
      this.avgDocLength = 1;
      this.totalChunks = 0;
    }

    /**
     * Xây dựng lại chỉ mục đảo (Inverted Index) từ danh sách các mảnh ký ức (Chunks)
     */
    compileInvertedIndex(chunks = []) {
      this.invertedIndex.clear();
      this.asciiInvertedIndex.clear();
      this.docFreqMap.clear();
      this.asciiDocFreqMap.clear();

      this.totalChunks = chunks.length;
      if (this.totalChunks === 0) {
        this.avgDocLength = 1;
        return;
      }

      let totalTokenCount = 0;

      chunks.forEach((chunk, chunkIdx) => {
        const tokens = chunk.tokens || [];
        totalTokenCount += tokens.length;

        // 1. Đếm tần suất từ có dấu (UTF-8 NFC)
        const localFreq = new Map();
        for (const t of tokens) {
          localFreq.set(t, (localFreq.get(t) || 0) + 1);
        }

        for (const [term, tf] of localFreq.entries()) {
          let postings = this.invertedIndex.get(term);
          if (!postings) {
            postings = new Map();
            this.invertedIndex.set(term, postings);
          }
          postings.set(chunkIdx, tf);
          this.docFreqMap.set(term, (this.docFreqMap.get(term) || 0) + 1);
        }

        // 2. Đếm tần suất từ không dấu (ASCII) phục vụ tìm kiếm gõ tắt không dấu
        const asciiTokens = chunk.asciiTokens || [];
        const localAsciiFreq = new Map();
        for (const at of asciiTokens) {
          if (!at) continue;
          localAsciiFreq.set(at, (localAsciiFreq.get(at) || 0) + 1);
        }

        for (const [aTerm, tf] of localAsciiFreq.entries()) {
          let aPostings = this.asciiInvertedIndex.get(aTerm);
          if (!aPostings) {
            aPostings = new Map();
            this.asciiInvertedIndex.set(aTerm, aPostings);
          }
          aPostings.set(chunkIdx, tf);
          this.asciiDocFreqMap.set(aTerm, (this.asciiDocFreqMap.get(aTerm) || 0) + 1);
        }
      });

      this.avgDocLength = Math.max(1, totalTokenCount / this.totalChunks);
    }

    /**
     * Tính chỉ số IDF (Inverse Document Frequency) theo công thức Robertson-Spärck Jones BM25
     */
    computeIDF(df, N) {
      if (df <= 0 || N <= 0) return 0;
      return Math.log(1 + (N - df + 0.5) / (df + 0.5));
    }

    /**
     * Tính khoảng cách gần nhất (Proximity Span) giữa các từ khóa truy vấn trong đoạn văn
     */
    computeTermProximityBonus(chunkTokens, queryUnigrams) {
      if (!chunkTokens || queryUnigrams.length < 2) return 0;
      const positions = [];

      for (let i = 0; i < chunkTokens.length; i++) {
        if (queryUnigrams.includes(chunkTokens[i])) {
          positions.push({ token: chunkTokens[i], pos: i });
        }
      }

      if (positions.length < 2) return 0;

      let minGap = Infinity;
      for (let i = 0; i < positions.length - 1; i++) {
        if (positions[i].token !== positions[i + 1].token) {
          const gap = Math.abs(positions[i + 1].pos - positions[i].pos);
          if (gap < minGap) minGap = gap;
        }
      }

      if (!Number.isFinite(minGap)) return 0;
      if (minGap === 1) return 2.2; // Hai từ khóa đứng sát cạnh nhau
      if (minGap <= 3) return 1.35; // Nằm trong cùng cụm từ ngắn
      if (minGap <= 8) return 0.65; // Nằm trong cùng một câu văn
      return 0.15;
    }

    /**
     * Tính điểm tăng cường khi nhiều nhân vật hoặc phục bút cùng xuất hiện trong 1 đoạn ký ức
     */
    computeEntityCoOccurrenceBonus(chunk, queryProperNames, queryCompounds) {
      let bonus = 0;

      // Nếu truy vấn nhắc đến tên riêng nhân vật và đoạn văn cũng có tên riêng đó
      if (queryProperNames.length > 0 && Array.isArray(chunk.properNames)) {
        let matchedCharacters = 0;
        for (const qName of queryProperNames) {
          if (chunk.properNames.includes(qName) || chunk.lowerText.includes(qName)) {
            matchedCharacters++;
          }
        }
        if (matchedCharacters === 1) {
          bonus += 1.8;
        } else if (matchedCharacters >= 2) {
          // Đồng xuất hiện từ 2 nhân vật trở lên trong cùng 1 cảnh -> tăng mạnh trọng số tương tác!
          bonus += 3.6 + (matchedCharacters - 2) * 1.4;
        }
      }

      // Nếu khớp từ ghép chuyên ngành (VD: "dấu vân tay", "hiện trường", "ngoại phạm")
      if (queryCompounds.length > 0 && Array.isArray(chunk.compoundTokens)) {
        const chunkCompoundSet = new Set(chunk.compoundTokens);
        for (const qc of queryCompounds) {
          if (chunkCompoundSet.has(qc)) {
            bonus += 1.65;
          }
        }
      }

      return bonus;
    }

    /**
     * Chấm điểm toàn diện từng mảnh ký ức theo thuật toán BM25+ kết hợp TF-IDF,
     * Cụm từ chính xác (Exact Phrase), Đồng xuất hiện thực thể (Entity Co-occurrence)
     * và Trọng số Thời gian / Trạng thái duyệt (Temporal & Canon Weighting).
     */
    rankChunksForQuery(chunks, rawQuery, options = {}) {
      if (!rawQuery || !rawQuery.trim() || !chunks || chunks.length === 0) {
        return [];
      }

      const {
        topK = 6,
        filterStatus = 'ALL', // 'ALL' | 'APPROVED' | 'DRAFT'
        onlyClues = false,
        onlyDialogue = false,
        preferRecentChapters = false,
        boostApprovedCanon = true,
        enableSynonymExpansion = true
      } = options;

      const cleanQuery = rawQuery.normalize('NFC').trim();
      const lowerQuery = cleanQuery.toLowerCase();
      const queryHasDiacritics = this.tokenizer.hasVietnameseDiacritics(cleanQuery);
      const queryParsed = this.tokenizer.tokenizeWithCompoundsAndEntities(cleanQuery);

      // Nếu người dùng nhập toàn từ dừng (VD: "là gì"), giữ lại toàn bộ unigrams
      const activeQueryTokens =
        queryParsed.meaningfulTokens.length > 0
          ? queryParsed.meaningfulTokens
          : queryParsed.allTokens;

      const expandedSynonyms = enableSynonymExpansion
        ? this.tokenizer.expandQueryWithSynonyms(cleanQuery)
        : [];
      const synonymTokens = expandedSynonyms.flatMap((syn) =>
        this.tokenizer.tokenizeUnigrams(syn, true)
      );

      const N = chunks.length;
      const results = [];

      for (let idx = 0; idx < N; idx++) {
        const chunk = chunks[idx];

        // 1. Áp dụng bộ lọc trạng thái hoặc đặc trưng cảnh
        if (filterStatus === 'APPROVED' && chunk.status !== 'APPROVED') continue;
        if (filterStatus === 'DRAFT' && chunk.status === 'APPROVED') continue;
        if (onlyClues && !chunk.hasClueMention) continue;
        if (onlyDialogue && !chunk.hasDialogue) continue;

        const dl = Math.max(1, chunk.tokens.length);
        let bm25Score = 0;
        let tfidfScore = 0;
        let matchedTermCount = 0;
        const matchedKeywords = [];

        // 2. Tính điểm BM25+ và TF-IDF trên tập từ khóa chính
        for (const qt of activeQueryTokens) {
          const postings = this.invertedIndex.get(qt);
          const tf = postings ? postings.get(idx) || 0 : 0;

          if (tf > 0) {
            matchedTermCount++;
            matchedKeywords.push(qt.replace(/_/g, ' '));
            const df = this.docFreqMap.get(qt) || 1;
            const idf = this.computeIDF(df, N);

            // Công thức Okapi BM25+
            const num = tf * (this.k1 + 1);
            const den = tf + this.k1 * (1 - this.b + this.b * (dl / this.avgDocLength));
            const termBm25 = idf * (num / den + this.delta * 0.15);

            // Từ ghép hoặc tên riêng có trọng số gấp 1.35 lần từ đơn
            const weightMultiplier = qt.includes('_') ? 1.35 : 1.0;
            bm25Score += termBm25 * weightMultiplier;

            // Điểm TF-IDF log-normalized
            tfidfScore += (1 + Math.log(tf)) * idf;
          } else if (!queryHasDiacritics) {
            // 3. Nếu người dùng gõ tìm kiếm không dấu, đối chiếu trên chỉ mục ASCII
            const asciiQt = this.tokenizer.stripVietnameseDiacritics(qt);
            const aPostings = this.asciiInvertedIndex.get(asciiQt);
            const aTf = aPostings ? aPostings.get(idx) || 0 : 0;
            if (aTf > 0) {
              matchedTermCount++;
              matchedKeywords.push(asciiQt);
              const aDf = this.asciiDocFreqMap.get(asciiQt) || 1;
              const aIdf = this.computeIDF(aDf, N);
              const num = aTf * (this.k1 + 1);
              const den = aTf + this.k1 * (1 - this.b + this.b * (dl / this.avgDocLength));
              bm25Score += aIdf * (num / den) * 0.82;
            }
          }
        }

        // 4. Điểm mở rộng từ đồng nghĩa (Synonym Expansion) với trọng số nhẹ (0.35x)
        if (synonymTokens.length > 0) {
          for (const synT of synonymTokens) {
            if (activeQueryTokens.includes(synT)) continue;
            const postings = this.invertedIndex.get(synT);
            const tf = postings ? postings.get(idx) || 0 : 0;
            if (tf > 0) {
              const df = this.docFreqMap.get(synT) || 1;
              const idf = this.computeIDF(df, N);
              bm25Score += idf * 0.35;
              matchedKeywords.push(synT);
            }
          }
        }

        // 5. Kiểm tra khớp nguyên cụm từ truy vấn (Exact Substring Match)
        let exactPhraseBonus = 0;
        if (lowerQuery.length >= 4 && chunk.lowerText.includes(lowerQuery)) {
          exactPhraseBonus = 3.2;
          if (!matchedKeywords.includes(lowerQuery)) {
            matchedKeywords.push(lowerQuery);
          }
        } else if (
          !queryHasDiacritics &&
          lowerQuery.length >= 4 &&
          chunk.asciiText.includes(this.tokenizer.stripVietnameseDiacritics(lowerQuery))
        ) {
          exactPhraseBonus = 2.4;
        }

        // Nếu không khớp bất kỳ từ nào và không khớp cụm từ nào thì bỏ qua
        if (bm25Score <= 0 && exactPhraseBonus <= 0) {
          continue;
        }

        // 6. Điểm khoảng cách từ khóa (Term Proximity) & Đồng xuất hiện nhân vật (Entity Co-occurrence)
        const proximityBonus = this.computeTermProximityBonus(
          chunk.tokens,
          queryParsed.allTokens
        );
        const entityBonus = this.computeEntityCoOccurrenceBonus(
          chunk,
          queryParsed.properNames,
          queryParsed.compoundTokens
        );

        // 7. Điểm khớp tiêu đề chương
        let titleBonus = 0;
        if (chunk.chapterTitle && chunk.chapterTitle.toLowerCase().includes(lowerQuery)) {
          titleBonus = 1.75;
        }

        // 8. Tổ hợp điểm lai (Hybrid Score)
        let finalScore =
          bm25Score * 0.82 +
          tfidfScore * 0.18 +
          exactPhraseBonus +
          proximityBonus +
          entityBonus +
          titleBonus;

        // 9. Điều chỉnh theo Độ phủ truy vấn (Query Coverage Ratio)
        if (activeQueryTokens.length > 1) {
          const coverageRatio = matchedTermCount / activeQueryTokens.length;
          if (coverageRatio >= 0.8) {
            finalScore *= 1.22;
          }
        }

        // 10. Trọng số Độ tin cậy Bản đã duyệt (Approved Canon) & Trọng số Thời gian (Temporal Recency)
        if (boostApprovedCanon && chunk.status === 'APPROVED') {
          finalScore *= 1.08;
        }
        if (preferRecentChapters) {
          finalScore *= 0.92 + 0.18 * (chunk.temporalOrderRatio || 0);
        }

        results.push({
          ...chunk,
          score: Number(finalScore.toFixed(4)),
          bm25Raw: Number(bm25Score.toFixed(3)),
          tfidfRaw: Number(tfidfScore.toFixed(3)),
          exactPhraseBonus: Number(exactPhraseBonus.toFixed(2)),
          entityBonus: Number(entityBonus.toFixed(2)),
          matchedKeywords: [...new Set(matchedKeywords)]
        });
      }

      results.sort((a, b) => b.score - a.score);
      return results.slice(0, Math.max(1, topK));
    }
  }

  // ==========================================================================
  // PHẦN 5: BỘ TÔ SÁNG NGỮ CẢNH AN TOÀN & ĐÓNG GÓI KÝ ỨC TỰ ĐỘNG CHO PROMPT AI
  // ==========================================================================
  class RagContextHighlighterAndPromptBuilder {
    constructor(utils, tokenizer) {
      this.utils = utils;
      this.tokenizer = tokenizer;
    }

    /**
     * Thoát mã HTML an toàn rồi tô sáng (Highlight) các từ khóa khớp trong đoạn văn
     */
    highlightSnippetSafeHtml(snippetText, rawQuery, matchedKeywords = []) {
      if (!snippetText) return '';
      const escapedText = this.utils.escapeHtml(snippetText);
      if (!rawQuery || !rawQuery.trim()) return escapedText;

      // Tập hợp các cụm từ cần tô sáng (ưu tiên cụm dài trước để không bị cắt lẻ)
      const candidateTerms = new Set();
      const cleanQuery = rawQuery.normalize('NFC').trim();
      if (cleanQuery.length >= 2) {
        candidateTerms.add(cleanQuery);
      }

      if (Array.isArray(matchedKeywords)) {
        for (const kw of matchedKeywords) {
          const cleanKw = String(kw || '').replace(/_/g, ' ').trim();
          if (cleanKw.length >= 2) {
            candidateTerms.add(cleanKw);
          }
        }
      }

      const rawTokens = this.tokenizer.tokenizeUnigrams(cleanQuery, true);
      for (const rt of rawTokens) {
        if (rt.length >= 2) {
          candidateTerms.add(rt);
        }
      }

      const sortedTerms = Array.from(candidateTerms)
        .map((t) => this.utils.escapeHtml(t))
        .filter((t) => t.length >= 2)
        .sort((a, b) => b.length - a.length);

      if (sortedTerms.length === 0) return escapedText;

      // Thoát các ký tự đặc biệt trong biểu thức chính quy
      const escapedRegexParts = sortedTerms.map((term) =>
        term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      );

      try {
        const highlightRegex = new RegExp(`(${escapedRegexParts.join('|')})`, 'gi');
        return escapedText.replace(
          highlightRegex,
          '<mark class="bg-amber-500/30 text-amber-200 px-1 rounded font-bold">$1</mark>'
        );
      } catch (_) {
        return escapedText;
      }
    }

    /**
     * Cắt cửa sổ văn bản tập trung quanh vị trí xuất hiện từ khóa đầu tiên nếu đoạn quá dài
     */
    extractFocusedSnippetWindow(text, rawQuery, maxLength = 380) {
      if (!text) return '';
      if (text.length <= maxLength) return text;

      const cleanQuery = (rawQuery || '').normalize('NFC').trim().toLowerCase();
      const lowerText = text.toLowerCase();
      let hitPos = cleanQuery ? lowerText.indexOf(cleanQuery) : -1;

      if (hitPos === -1 && cleanQuery) {
        const tokens = this.tokenizer.tokenizeUnigrams(cleanQuery, true);
        for (const t of tokens) {
          const p = lowerText.indexOf(t);
          if (p !== -1) {
            hitPos = p;
            break;
          }
        }
      }

      if (hitPos === -1) {
        return text.slice(0, maxLength).trim() + '…';
      }

      const halfWindow = Math.floor(maxLength / 2);
      const start = Math.max(0, hitPos - halfWindow);
      const end = Math.min(text.length, start + maxLength);

      let slice = text.slice(start, end).trim();
      if (start > 0) slice = '…' + slice;
      if (end < text.length) slice = slice + '…';
      return slice;
    }

    /**
     * Tự động trích xuất từ khóa quan trọng từ đoạn văn hoặc dàn ý đang viết
     * để làm câu truy vấn tự động cho động cơ chống quên BM25+ (0 Token)
     */
    extractAutoQueryFromActiveDraft(draftText = '', beatsText = '', chapterTitle = '') {
      const combined = `${chapterTitle || ''}\n${beatsText || ''}\n${(draftText || '').slice(-1800)}`.trim();
      if (!combined) return '';

      const parsed = this.tokenizer.tokenizeWithCompoundsAndEntities(combined);
      const priorityTerms = [];

      // 1. Ưu tiên cao nhất: Tên riêng nhân vật xuất hiện ở cuối chương đang viết
      for (const name of parsed.properNames.slice(0, 6)) {
        priorityTerms.push(name);
      }

      // 2. Ưu tiên thứ hai: Từ ghép văn học / phục bút / bối cảnh
      for (const comp of parsed.compoundTokens.slice(0, 8)) {
        priorityTerms.push(comp.replace(/_/g, ' '));
      }

      // 3. Ưu tiên thứ ba: Các từ đơn có tần suất xuất hiện lặp lại trong đoạn cuối
      const freqMap = new Map();
      for (const w of parsed.meaningfulTokens) {
        if (w.includes('_') || w.length < 3) continue;
        freqMap.set(w, (freqMap.get(w) || 0) + 1);
      }

      const topWords = Array.from(freqMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([w]) => w);

      return [...new Set([...priorityTerms, ...topWords])].join(' ');
    }

    /**
     * Đóng gói các mảnh ký ức BM25+ thành khối văn bản chuẩn bị bơm vào Prompt Tổng Hợp AI
     */
    formatRetrievedChunksForPrompt(results = [], queryLabel = '') {
      if (!Array.isArray(results) || results.length === 0) {
        return '• (Chưa có đoạn ký ức quá khứ nào khớp trực tiếp với truy vấn hiện tại.)';
      }

      const lines = [
        `=== [KÝ ỨC CHỐNG QUÊN BM25+ TRÍCH XUẤT TỰ ĐỘNG (${results.length} ĐOẠN LIÊN QUAN NHẤT)] ===`
      ];
      if (queryLabel) {
        lines.push(`• Trọng tâm truy hồi: "${queryLabel}"`);
      }

      results.forEach((item, idx) => {
        const statusTag = item.status === 'APPROVED' ? 'BẢN ĐÃ DUYỆT' : 'BẢN NHÁP';
        const matchInfo =
          Array.isArray(item.matchedKeywords) && item.matchedKeywords.length > 0
            ? ` | Khớp: ${item.matchedKeywords.slice(0, 5).join(', ')}`
            : '';
        lines.push(
          `\n[Mảnh Ký Ức #${idx + 1} — Nguồn: ${item.chapterTitle} (${statusTag}) — Điểm BM25+: ${item.score.toFixed(
            2
          )}${matchInfo}]`
        );
        lines.push(item.text);
      });

      return lines.join('\n');
    }
  }

  // ==========================================================================
  // PHẦN 6: BỘ PHÂN TÍCH ĐỒ THỊ ĐỒNG XUẤT HIỆN NHÂN VẬT & DÒNG THỜI GIAN PHỤC BÚT
  // ==========================================================================
  class EntityCoOccurrenceAndClueTimelineAnalyzer {
    constructor(tokenizer) {
      this.tokenizer = tokenizer;
    }

    /**
     * Xây dựng ma trận đồng xuất hiện giữa các nhân vật trên toàn bộ các mảnh ký ức BM25
     * Giúp phát hiện hai nhân vật nào từng gặp nhau ở chương nào và tần suất tương tác.
     */
    buildCharacterCoOccurrenceNetwork(chunks = []) {
      const charAppearances = new Map(); // name -> Set<chunkId>
      const pairInteractions = new Map(); // "NameA|||NameB" -> { charA, charB, count, chapters: Set, sampleChunk }

      for (const chunk of chunks) {
        const names = Array.isArray(chunk.properNames) ? chunk.properNames : [];
        if (names.length === 0) continue;

        for (const n of names) {
          if (!charAppearances.has(n)) {
            charAppearances.set(n, new Set());
          }
          charAppearances.get(n).add(chunk.id);
        }

        // Xét các cặp nhân vật cùng xuất hiện trong 1 mảnh ký ức
        for (let i = 0; i < names.length; i++) {
          for (let j = i + 1; j < names.length; j++) {
            const [a, b] = [names[i], names[j]].sort();
            const pairKey = `${a}|||${b}`;
            let record = pairInteractions.get(pairKey);
            if (!record) {
              record = {
                charA: a,
                charB: b,
                coOccurrenceCount: 0,
                chapters: new Set(),
                latestSnippet: chunk.text
              };
              pairInteractions.set(pairKey, record);
            }
            record.coOccurrenceCount += 1;
            record.chapters.add(chunk.chapterTitle);
            record.latestSnippet = chunk.text;
          }
        }
      }

      const topCharacters = Array.from(charAppearances.entries())
        .map(([name, setIds]) => ({
          name,
          chunkCount: setIds.size
        }))
        .sort((a, b) => b.chunkCount - a.chunkCount)
        .slice(0, 25);

      const topPairs = Array.from(pairInteractions.values())
        .map((r) => ({
          charA: r.charA,
          charB: r.charB,
          coOccurrenceCount: r.coOccurrenceCount,
          chaptersList: Array.from(r.chapters),
          latestSnippet: r.latestSnippet
        }))
        .sort((a, b) => b.coOccurrenceCount - a.coOccurrenceCount)
        .slice(0, 25);

      return {
        topCharacters,
        topPairs
      };
    }

    /**
     * Truy vết lịch sử xuất hiện của một Manh mối / Phục bút xuyên suốt từ Chương 1 đến hiện tại
     */
    traceClueTimelineAcrossChapters(clueKeyword, chunks = []) {
      if (!clueKeyword || !clueKeyword.trim() || !Array.isArray(chunks)) {
        return [];
      }

      const needle = clueKeyword.normalize('NFC').trim().toLowerCase();
      const timeline = [];

      for (const chunk of chunks) {
        if (chunk.lowerText && chunk.lowerText.includes(needle)) {
          timeline.push({
            chunkId: chunk.id,
            chapterId: chunk.chapterId,
            chapterNumber: chunk.chapterNumber,
            chapterTitle: chunk.chapterTitle,
            status: chunk.status,
            paragraphIndex: chunk.paragraphIndex,
            text: chunk.text,
            stageLabel:
              timeline.length === 0
                ? '🌱 Gieo phục bút lần đầu'
                : '🔄 Tái xuất hiện / Triển khai'
          });
        }
      }

      if (timeline.length > 1) {
        timeline[timeline.length - 1].stageLabel = '🎯 Mốc xuất hiện gần nhất';
      }

      return timeline;
    }
  }

  // ==========================================================================
  // PHẦN 7: HỘP THOẠI XEM CHI TIẾT ĐOẠN KÝ ỨC & PHÂN TÍCH ĐIỂM BM25+
  // ==========================================================================
  class RagChunkInspectorModalUI {
    constructor(ragEngine) {
      this.rag = ragEngine;
      this.modalId = 'noir-mod07-rag-inspector-modal';
    }

    ensureModal() {
      let modal = document.getElementById(this.modalId);
      if (modal) return modal;

      modal = document.createElement('div');
      modal.id = this.modalId;
      modal.className =
        'hidden fixed inset-0 z-[97] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 font-sansUI';
      modal.innerHTML = `
        <div class="w-full max-w-3xl rounded-3xl border border-amber-500/40 bg-zinc-950 text-zinc-100 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
          <div class="px-5 py-4 border-b border-zinc-800 bg-zinc-900/90 flex items-center justify-between gap-3">
            <div>
              <h3 id="mod07-inspector-title" class="font-extrabold text-sm sm:text-base text-amber-400">
                🧠 Chi Tiết Mảnh Ký Ức Chống Quên BM25+
              </h3>
              <p id="mod07-inspector-subtitle" class="text-[11px] text-zinc-400 mt-0.5"></p>
            </div>
            <button type="button" id="btn-mod07-close-inspector" class="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-rose-600 text-xs font-bold text-zinc-300 hover:text-white transition">
              ✕ Đóng
            </button>
          </div>
          <div id="mod07-inspector-body" class="p-5 overflow-y-auto space-y-4 text-xs flex-1"></div>
          <div class="px-5 py-3.5 border-t border-zinc-800 bg-zinc-900/90 flex items-center justify-between gap-3">
            <button type="button" id="btn-mod07-copy-chunk" class="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs transition">
              📋 Sao chép đoạn ký ức này
            </button>
            <button type="button" id="btn-mod07-jump-to-chapter" class="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow-lg transition">
              📖 Mở Chương Này Tại Bàn Viết (Tab 1)
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      modal
        .querySelector('#btn-mod07-close-inspector')
        ?.addEventListener('click', () => modal.classList.add('hidden'));

      return modal;
    }

    openChunkDetail(chunkResult, currentQuery = '') {
      if (!chunkResult) return;
      const modal = this.ensureModal();
      const esc = (s) => this.rag.utils.escapeHtml(s);

      const titleEl = modal.querySelector('#mod07-inspector-title');
      const subEl = modal.querySelector('#mod07-inspector-subtitle');
      const bodyEl = modal.querySelector('#mod07-inspector-body');
      const btnCopy = modal.querySelector('#btn-mod07-copy-chunk');
      const btnJump = modal.querySelector('#btn-mod07-jump-to-chapter');

      if (titleEl) {
        titleEl.textContent = `🧠 ${chunkResult.chapterTitle} — Đoạn #${
          (chunkResult.paragraphIndex || 0) + 1
        }`;
      }
      if (subEl) {
        subEl.textContent = `Trạng thái: ${
          chunkResult.status === 'APPROVED' ? '✅ Bản Đã Duyệt' : '📝 Bản Nháp'
        } • Điểm tổng hợp BM25+: ${(chunkResult.score || 0).toFixed(2)}`;
      }

      if (bodyEl) {
        const highlightedHtml = this.rag.highlighter.highlightSnippetSafeHtml(
          chunkResult.text,
          currentQuery,
          chunkResult.matchedKeywords || []
        );

        const kwBadges =
          Array.isArray(chunkResult.matchedKeywords) && chunkResult.matchedKeywords.length > 0
            ? chunkResult.matchedKeywords
                .map(
                  (kw) =>
                    `<span class="px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[11px]">${esc(
                      kw
                    )}</span>`
                )
                .join(' ')
            : '<span class="text-zinc-500 italic">Khớp ngữ nghĩa mở rộng</span>';

        bodyEl.innerHTML = `
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80">
              <div class="text-[10px] text-zinc-400">Điểm BM25+ Gốc</div>
              <div class="font-monoCode font-extrabold text-sm text-amber-400">${(
                chunkResult.bm25Raw ||
                chunkResult.score ||
                0
              ).toFixed(2)}</div>
            </div>
            <div class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80">
              <div class="text-[10px] text-zinc-400">Điểm TF-IDF</div>
              <div class="font-monoCode font-extrabold text-sm text-emerald-400">${(
                chunkResult.tfidfRaw || 0
              ).toFixed(2)}</div>
            </div>
            <div class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80">
              <div class="text-[10px] text-zinc-400">Thưởng Cụm Chính Xác</div>
              <div class="font-monoCode font-extrabold text-sm text-indigo-400">+${(
                chunkResult.exactPhraseBonus || 0
              ).toFixed(2)}</div>
            </div>
            <div class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80">
              <div class="text-[10px] text-zinc-400">Thưởng Thực Thể</div>
              <div class="font-monoCode font-extrabold text-sm text-rose-400">+${(
                chunkResult.entityBonus || 0
              ).toFixed(2)}</div>
            </div>
          </div>

          <div class="space-y-1.5">
            <div class="font-bold text-zinc-300 text-[11px] uppercase">Từ khóa & Thực thể khớp trong đoạn:</div>
            <div class="flex flex-wrap gap-1.5">${kwBadges}</div>
          </div>

          <div class="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/90 font-serifNovel text-sm leading-relaxed whitespace-pre-wrap text-zinc-100">${highlightedHtml}</div>
        `;
      }

      if (btnCopy) {
        btnCopy.onclick = async () => {
          try {
            await navigator.clipboard.writeText(chunkResult.text || '');
            this.rag.utils.showToast('📋 Đã sao chép đoạn ký ức vào bộ nhớ tạm!', 'success');
          } catch (_) {}
        };
      }

      if (btnJump) {
        btnJump.onclick = () => {
          modal.classList.add('hidden');
          window.NoirStudio.chapterManager?.selectChapter(chunkResult.chapterId);
          window.NoirStudio.navigator?.navigateToScreen('SCREEN_1_WRITE');
        };
      }

      modal.classList.remove('hidden');
    }
  }

  // ==========================================================================
  // PHẦN 8: BỘ KIỂM TOÁN TÍNH NHẤT QUÁN & ĐỐI CHIẾU CHÉO VỚI HỒ SƠ STORY BIBLE
  // ==========================================================================
  class LocalLoreAndContinuityCrossChecker {
    constructor(tokenizer) {
      this.tokenizer = tokenizer;
      this.loreEntries = [];
    }

    /**
     * Đồng bộ hóa dữ liệu từ Story Bible (Nhân vật, Ma trận Tri thức, Sổ cái Phục bút)
     * vào bộ nhớ đối chiếu nhanh 0-Token.
     */
    syncFromStoryBibleEngine() {
      this.loreEntries = [];
      const sb = window.NoirStudio.storyBible;
      if (!sb) return this.loreEntries;

      // 1. Nạp danh sách Nhân vật
      if (Array.isArray(sb.characters)) {
        sb.characters.forEach((ch, idx) => {
          if (!ch || !ch.name) return;
          const desc = `${ch.name} (${ch.role || 'Nhân vật'}): ${ch.traits || ''}`;
          const parsed = this.tokenizer.tokenizeWithCompoundsAndEntities(desc);
          this.loreEntries.push({
            id: `lore_char_${idx}`,
            category: 'CHARACTER',
            title: `👤 Nhân vật: ${ch.name}`,
            text: desc,
            lowerText: desc.toLowerCase(),
            tokens: parsed.allTokens
          });
        });
      }

      // 2. Nạp Ma trận Ai Biết Gì (Knowledge Matrix)
      if (Array.isArray(sb.knowledgeMatrix)) {
        sb.knowledgeMatrix.forEach((km, idx) => {
          if (!km) return;
          const desc = `Nhân vật ${km.character || ''} — Bí mật/Sự thật: "${
            km.secret || ''
          }" — Trạng thái: ${km.state || 'Chưa biết'}`;
          const parsed = this.tokenizer.tokenizeWithCompoundsAndEntities(desc);
          this.loreEntries.push({
            id: `lore_km_${idx}`,
            category: 'KNOWLEDGE',
            title: `🧠 Tri thức: ${km.character || 'Nhân vật'}`,
            text: desc,
            lowerText: desc.toLowerCase(),
            tokens: parsed.allTokens
          });
        });
      }

      // 3. Nạp Sổ cái Phục bút (Clues Ledger)
      if (Array.isArray(sb.cluesLedger)) {
        sb.cluesLedger.forEach((cl, idx) => {
          if (!cl) return;
          const desc = `Phục bút "${cl.title || ''}" (Cài ở: ${
            cl.plantedIn || 'Chưa rõ'
          }) — Trạng thái: ${cl.status === 'RESOLVED' ? 'Đã thu hồi' : 'Đang mở'}`;
          const parsed = this.tokenizer.tokenizeWithCompoundsAndEntities(desc);
          this.loreEntries.push({
            id: `lore_clue_${idx}`,
            category: 'CLUE',
            title: `🗝️ Phục bút: ${cl.title || 'Manh mối'}`,
            text: desc,
            lowerText: desc.toLowerCase(),
            tokens: parsed.allTokens
          });
        });
      }

      return this.loreEntries;
    }

    /**
     * Tìm các mục trong Story Bible khớp với từ khóa tra cứu của tác giả
     */
    searchMatchingLoreItems(rawQuery, maxItems = 4) {
      if (!rawQuery || !rawQuery.trim()) return [];
      this.syncFromStoryBibleEngine();
      if (this.loreEntries.length === 0) return [];

      const lowerQ = rawQuery.normalize('NFC').trim().toLowerCase();
      const qTokens = this.tokenizer.tokenizeUnigrams(lowerQ, true);

      const matches = [];
      for (const item of this.loreEntries) {
        let score = 0;
        if (item.lowerText.includes(lowerQ)) {
          score += 3.0;
        }
        for (const qt of qTokens) {
          if (item.tokens.includes(qt)) {
            score += 1.2;
          }
        }
        if (score > 0) {
          matches.push({ ...item, score });
        }
      }

      return matches.sort((a, b) => b.score - a.score).slice(0, maxItems);
    }

    /**
     * Quét nhanh bản thảo đang viết để cảnh báo nếu có nhân vật nhắc tới bí mật
     * mà trong Ma trận Tri thức (Knowledge Matrix) nhân vật đó "Chưa biết" (0 Token).
     */
    detectZeroTokenKnowledgeLeaks(activeChapterText = '') {
      if (!activeChapterText || typeof activeChapterText !== 'string') return [];
      const sb = window.NoirStudio.storyBible;
      if (!sb || !Array.isArray(sb.knowledgeMatrix) || sb.knowledgeMatrix.length === 0) {
        return [];
      }

      const warnings = [];
      const paragraphs = activeChapterText
        .split(/\r?\n\r?\n+/)
        .map((p) => p.trim())
        .filter((p) => p.length > 20);

      for (const km of sb.knowledgeMatrix) {
        const charName = (km.character || '').trim();
        const secretText = (km.secret || '').trim();
        const state = (km.state || '').toUpperCase();

        // Chỉ kiểm tra các bí mật mà nhân vật hiện tại CHƯA BIẾT
        if (
          !charName ||
          !secretText ||
          (state.includes('ĐÃ BIẾT') && !state.includes('CHƯA'))
        ) {
          continue;
        }

        const secretKeywords = this.tokenizer
          .tokenizeUnigrams(secretText, true)
          .filter((w) => w.length >= 3);
        if (secretKeywords.length === 0) continue;

        for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
          const para = paragraphs[pIdx];
          const lowerPara = para.toLowerCase();
          if (!lowerPara.includes(charName.toLowerCase())) continue;

          let hitSecretWords = 0;
          for (const skw of secretKeywords) {
            if (lowerPara.includes(skw)) {
              hitSecretWords++;
            }
          }

          if (
            hitSecretWords >= Math.max(2, Math.ceil(secretKeywords.length * 0.6))
          ) {
            warnings.push({
              character: charName,
              secret: secretText,
              state: km.state || 'Chưa biết',
              paragraphNumber: pIdx + 1,
              excerpt: para.slice(0, 180)
            });
          }
        }
      }

      return warnings;
    }
  }

  // ==========================================================================
  // PHẦN 9: BỘ GỢI Ý TỪ KHÓA TÌM KIẾM NHANH & LỊCH SỬ TRA CỨU CỤC BỘ
  // ==========================================================================
  class RagSearchHistoryAndSuggestionManager {
    constructor() {
      this.storageKey = 'noir_mod07_recent_rag_queries_v1';
      this.recentQueries = this.loadRecentQueries();
    }

    loadRecentQueries() {
      try {
        const raw = localStorage.getItem(this.storageKey);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.slice(0, 12) : [];
      } catch (_) {
        return [];
      }
    }

    recordQuery(query) {
      if (!query || typeof query !== 'string') return;
      const clean = query.trim();
      if (clean.length < 2) return;

      this.recentQueries = [
        clean,
        ...this.recentQueries.filter((q) => q.toLowerCase() !== clean.toLowerCase())
      ].slice(0, 12);

      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.recentQueries));
      } catch (_) {}
    }

    /**
     * Sinh danh sách các thẻ gợi ý tra cứu nhanh dựa trên các nhân vật và phục bút xuất hiện nhiều nhất
     */
    buildSmartQuickChips(chunks = []) {
      const nameCounts = new Map();
      const clueCounts = new Map();

      for (const c of chunks) {
        if (Array.isArray(c.properNames)) {
          for (const n of c.properNames) {
            nameCounts.set(n, (nameCounts.get(n) || 0) + 1);
          }
        }
        if (Array.isArray(c.clueTermsFound)) {
          for (const cl of c.clueTermsFound) {
            clueCounts.set(cl, (clueCounts.get(cl) || 0) + 1);
          }
        }
      }

      const topNames = Array.from(nameCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([n]) => n);

      const topClues = Array.from(clueCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([cl]) => cl);

      return [...new Set([...topNames, ...topClues, ...this.recentQueries.slice(0, 3)])].slice(
        0,
        10
      );
    }
  }

  // ==========================================================================
  // PHẦN 10: LỚP CHÍNH `LocalBM25MemoryEngine` (PUBLIC API MODULE 07)
  // ==========================================================================
  class LocalBM25MemoryEngine {
    constructor(utils) {
      this.utils = utils || this.createFallbackUtils();
      this.chunks = [];
      this.tokenizer = new VietnameseLinguisticTokenizer();
      this.chunker = new SemanticNarrativeChunker(this.tokenizer);
      this.scorer = new HybridBM25PlusScoringEngine(this.tokenizer);
      this.highlighter = new RagContextHighlighterAndPromptBuilder(
        this.utils,
        this.tokenizer
      );
      this.networkAnalyzer = new EntityCoOccurrenceAndClueTimelineAnalyzer(
        this.tokenizer
      );
      this.loreChecker = new LocalLoreAndContinuityCrossChecker(this.tokenizer);
      this.suggestionMgr = new RagSearchHistoryAndSuggestionManager();
      this.inspectorModal = new RagChunkInspectorModalUI(this);

      // Tùy chọn lọc hiện hành trên giao diện tra cứu RAG
      this.activeSearchFilter = 'ALL'; // 'ALL' | 'APPROVED' | 'DRAFT' | 'CLUES' | 'DIALOGUE'
      this.lastSearchQuery = '';
      this.lastRebuiltAt = 0;
    }

    createFallbackUtils() {
      return {
        escapeHtml(raw) {
          if (raw === null || raw === undefined) return '';
          return String(raw)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
        },
        showToast(msg) {
          console.log('[NoirStudio RAG]', msg);
        }
      };
    }

    /**
     * Phương thức bắt buộc #1: Tách từ Tiếng Việt chuẩn (tương thích 100% chữ ký gốc)
     */
    tokenizeVN(text) {
      return this.tokenizer.tokenizeUnigrams(text, false);
    }

    /**
     * Phương thức bắt buộc #2: Tái lập chỉ mục chống quên từ toàn bộ danh sách chương
     * Cập nhật đồng thời `#rag-index-count` và `#cmd-rag-status-pill`
     */
    rebuildIndexFromChapters(chapters = []) {
      this.chunks = this.chunker.buildChunksFromChapters(chapters);
      this.scorer.compileInvertedIndex(this.chunks);
      this.loreChecker.syncFromStoryBibleEngine();
      this.lastRebuiltAt = Date.now();

      const badge = document.getElementById('rag-index-count');
      if (badge) {
        badge.textContent = `${this.chunks.length} đoạn ký ức`;
      }

      const cmdRag = document.getElementById('cmd-rag-status-pill');
      if (cmdRag) {
        cmdRag.textContent = `Chống quên BM25: ${this.chunks.length} đoạn ký ức`;
      }

      // Lưu bản đệm chỉ mục nhẹ vào IndexedDB nếu cần tra cứu ngoại tuyến nhanh
      if (window.NoirStudio.idb && window.NoirStudio.constants) {
        try {
          window.NoirStudio.idb.set(
            window.NoirStudio.constants.STORES.RAG_CHUNKS,
            'latest_rag_summary_meta',
            {
              totalChunks: this.chunks.length,
              vocabularySize: this.scorer.invertedIndex.size,
              updatedAt: this.lastRebuiltAt
            }
          );
        } catch (_) {}
      }

      return this.chunks;
    }

    /**
     * Phương thức bắt buộc #3: Tìm kiếm các đoạn ký ức liên quan nhất bằng thuật toán BM25+ lai
     */
    search(query, topK = 6, customOptions = {}) {
      if (!query || !String(query).trim() || this.chunks.length === 0) {
        return [];
      }

      // Nếu chỉ mục đảo chưa kịp biên dịch (ví dụ mảng chunks bị gán trực tiếp từ bên ngoài), tự động biên dịch
      if (this.scorer.totalChunks !== this.chunks.length) {
        this.scorer.compileInvertedIndex(this.chunks);
      }

      const filterMode = customOptions.filterMode || this.activeSearchFilter || 'ALL';
      const searchOptions = {
        topK,
        filterStatus:
          filterMode === 'APPROVED'
            ? 'APPROVED'
            : filterMode === 'DRAFT'
            ? 'DRAFT'
            : 'ALL',
        onlyClues: filterMode === 'CLUES',
        onlyDialogue: filterMode === 'DIALOGUE',
        preferRecentChapters: Boolean(customOptions.preferRecentChapters),
        boostApprovedCanon: customOptions.boostApprovedCanon !== false,
        enableSynonymExpansion: customOptions.enableSynonymExpansion !== false
      };

      const ranked = this.scorer.rankChunksForQuery(this.chunks, query, searchOptions);

      // Dự phòng tương thích ngược nếu mảng chunks được tạo thủ công không qua SemanticNarrativeChunker
      if (ranked.length === 0 && this.chunks.length > 0 && !this.chunks[0].lowerText) {
        return this.legacyFallbackSearch(query, topK);
      }

      return ranked;
    }

    /**
     * Thuật toán BM25 dự phòng thuần túy trong trường hợp chunks được khởi tạo tối giản
     */
    legacyFallbackSearch(query, topK = 6) {
      const qTokens = this.tokenizeVN(query);
      if (qTokens.length === 0 || this.chunks.length === 0) return [];

      const N = this.chunks.length;
      const avgDl =
        this.chunks.reduce((sum, c) => sum + (c.tokens ? c.tokens.length : 1), 0) /
        Math.max(1, N);
      const k1 = 1.5;
      const b = 0.75;

      const scored = this.chunks.map((chunk) => {
        let score = 0;
        const tokens = chunk.tokens || this.tokenizeVN(chunk.text || '');
        const dl = tokens.length || 1;
        qTokens.forEach((qt) => {
          const tf = tokens.filter((t) => t === qt).length;
          if (tf > 0) {
            const df = this.chunks.filter((c) =>
              (c.tokens || []).includes(qt)
            ).length;
            const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
            const num = tf * (k1 + 1);
            const den = tf + k1 * (1 - b + b * (dl / avgDl));
            score += idf * (num / den);
          }
        });
        return { ...chunk, score };
      });

      return scored
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);
    }

    /**
     * Phương thức bắt buộc #4: Hiển thị kết quả tìm kiếm trực quan tại `#rag-search-results`
     * Kèm thanh lọc nhanh, thẻ gợi ý từ khóa, tô sáng ngữ cảnh và nhảy trực tiếp tới chương đích.
     */
    renderSearchResultsUI(query) {
      const box = document.getElementById('rag-search-results');
      if (!box) return;

      this.lastSearchQuery = query || '';
      const trimmedQuery = (query || '').trim();

      // Nếu ô tìm kiếm đang trống, hiển thị các thẻ gợi ý thông minh từ bản thảo hiện tại
      if (!trimmedQuery) {
        const quickChips = this.suggestionMgr.buildSmartQuickChips(this.chunks);
        const chipsHtml =
          quickChips.length > 0
            ? `
              <div class="mt-2 flex flex-wrap gap-1.5">
                ${quickChips
                  .map(
                    (chip) =>
                      `<button type="button" data-rag-quick-chip="${this.utils.escapeHtml(
                        chip
                      )}" class="px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-amber-600/30 border border-zinc-700 hover:border-amber-500/50 text-[10px] text-amber-300 font-bold transition">🔎 ${this.utils.escapeHtml(
                        chip
                      )}</button>`
                  )
                  .join('')}
              </div>
            `
            : '';

        box.innerHTML = `
          <div class="space-y-1.5">
            <div class="text-zinc-500 italic">
              Nhập từ khóa bên trên để tìm nhanh chi tiết, nhân vật hoặc phục bút trong toàn bộ ${this.chunks.length} đoạn ký ức...
            </div>
            ${chipsHtml}
          </div>
        `;

        box.querySelectorAll('[data-rag-quick-chip]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const val = btn.getAttribute('data-rag-quick-chip') || '';
            const inputEl = document.getElementById('input-rag-quick-search');
            if (inputEl) inputEl.value = val;
            this.renderSearchResultsUI(val);
          });
        });
        return;
      }

      this.suggestionMgr.recordQuery(trimmedQuery);
      const results = this.search(trimmedQuery, 8);
      const loreMatches = this.loreChecker.searchMatchingLoreItems(trimmedQuery, 2);

      if (results.length === 0 && loreMatches.length === 0) {
        box.innerHTML = `
          <div class="p-3 rounded-xl border border-rose-500/30 bg-rose-950/20 text-rose-300 text-xs">
            Không tìm thấy đoạn văn nào khớp với "<strong>${this.utils.escapeHtml(
              trimmedQuery
            )}</strong>" trong bộ lọc hiện tại (${this.activeSearchFilter}).
          </div>
        `;
        return;
      }

      // Thanh công cụ lọc nhanh kết quả RAG
      const filterButtons = [
        { id: 'ALL', label: 'Tất cả' },
        { id: 'APPROVED', label: '✅ Đã duyệt' },
        { id: 'DRAFT', label: '📝 Nháp' },
        { id: 'CLUES', label: '🗝️ Phục bút' },
        { id: 'DIALOGUE', label: '💬 Lời thoại' }
      ]
        .map(
          (f) => `
          <button type="button" data-rag-filter-mode="${f.id}" class="px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
            this.activeSearchFilter === f.id
              ? 'bg-amber-500 text-zinc-950 font-extrabold'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }">${f.label}</button>
        `
        )
        .join('');

      const loreHtml =
        loreMatches.length > 0
          ? loreMatches
              .map(
                (lm) => `
                <div class="p-2 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-0.5">
                  <div class="flex items-center justify-between text-[10px]">
                    <span class="font-extrabold text-emerald-400">${this.utils.escapeHtml(
                      lm.title
                    )}</span>
                    <span class="text-emerald-300/80 font-monoCode">Story Bible</span>
                  </div>
                  <div class="text-[11px] text-zinc-200">${this.highlighter.highlightSnippetSafeHtml(
                    lm.text,
                    trimmedQuery
                  )}</div>
                </div>
              `
              )
              .join('')
          : '';

      const cardsHtml = results
        .map((r, rIdx) => {
          const focusedWindow = this.highlighter.extractFocusedSnippetWindow(
            r.text,
            trimmedQuery,
            340
          );
          const highlightedSnippet = this.highlighter.highlightSnippetSafeHtml(
            focusedWindow,
            trimmedQuery,
            r.matchedKeywords || []
          );
          const statusBadge =
            r.status === 'APPROVED'
              ? '<span class="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">✅ Đã duyệt</span>'
              : '<span class="px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 text-[9px] font-bold">📝 Nháp</span>';

          return `
            <div class="p-2.5 rounded-xl border border-amber-500/30 bg-zinc-900/90 space-y-1.5 hover:border-amber-400 cursor-pointer transition" data-rag-jump-chap="${this.utils.escapeHtml(
              r.chapterId
            )}" data-rag-result-idx="${rIdx}">
              <div class="flex items-center justify-between gap-2 text-[10px]">
                <div class="flex items-center gap-1.5 min-w-0">
                  ${statusBadge}
                  <span class="font-bold text-amber-400 truncate">${this.utils.escapeHtml(
                    r.chapterTitle
                  )}</span>
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                  <span class="font-monoCode text-zinc-400">Điểm BM25: ${r.score.toFixed(
                    2
                  )}</span>
                  <button type="button" data-rag-inspect-idx="${rIdx}" class="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-amber-600 text-[9px] font-bold text-zinc-200 hover:text-white transition" title="Xem đầy đủ đoạn ký ức & phân tích điểm">
                    🔍 Chi tiết
                  </button>
                </div>
              </div>
              <div class="text-[11px] text-zinc-200 line-clamp-3 leading-relaxed">${highlightedSnippet}</div>
            </div>
          `;
        })
        .join('');

      box.innerHTML = `
        <div class="space-y-2">
          <div class="flex flex-wrap items-center justify-between gap-1 pb-1 border-b border-zinc-800">
            <div class="flex flex-wrap items-center gap-1">${filterButtons}</div>
            <span class="text-[10px] text-zinc-400 font-monoCode">${results.length} kết quả</span>
          </div>
          ${loreHtml}
          <div class="space-y-2">${cardsHtml}</div>
        </div>
      `;

      // Gắn sự kiện đổi chế độ lọc nhanh
      box.querySelectorAll('[data-rag-filter-mode]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.activeSearchFilter = btn.getAttribute('data-rag-filter-mode') || 'ALL';
          this.renderSearchResultsUI(trimmedQuery);
        });
      });

      // Gắn sự kiện mở hộp thoại xem chi tiết đoạn ký ức
      box.querySelectorAll('[data-rag-inspect-idx]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.getAttribute('data-rag-inspect-idx'), 10);
          if (results[idx]) {
            this.inspectorModal.openChunkDetail(results[idx], trimmedQuery);
          }
        });
      });

      // Gắn sự kiện bấm vào thẻ kết quả (`[data-rag-jump-chap]`) để chọn chương & nhảy về Bàn viết Tab 1
      box.querySelectorAll('[data-rag-jump-chap]').forEach((card) => {
        card.addEventListener('click', (e) => {
          if (e.target.closest('[data-rag-inspect-idx]')) return;
          const cid = card.getAttribute('data-rag-jump-chap');
          window.NoirStudio.chapterManager?.selectChapter(cid);
          window.NoirStudio.navigator?.navigateToScreen('SCREEN_1_WRITE');
        });
      });
    }

    /**
     * Tự động trích xuất khối Ký ức Chống quên BM25+ dựa trên nội dung chương đang mở
     * phục vụ bộ biên dịch Prompt Tổng Hợp (Mega-Prompt Compiler).
     */
    buildAutoRagContextForActiveChapter(topK = 6) {
      const chapMgr = window.NoirStudio.chapterManager;
      const activeChap = chapMgr ? chapMgr.getActiveChapter() : null;
      const draftText =
        document.getElementById('textarea-chapter-content')?.value ||
        activeChap?.content ||
        '';
      const beatsText =
        document.getElementById('textarea-chapter-beats')?.value ||
        activeChap?.beats ||
        '';
      const titleText =
        document.getElementById('input-chapter-title')?.value ||
        activeChap?.displayTitle ||
        '';

      const autoQuery = this.highlighter.extractAutoQueryFromActiveDraft(
        draftText,
        beatsText,
        titleText
      );
      if (!autoQuery) {
        return '• (Chưa có dữ liệu truy vấn tự động từ bản thảo đang mở.)';
      }

      const retrieved = this.search(autoQuery, topK, {
        boostApprovedCanon: true,
        enableSynonymExpansion: true
      });

      return this.highlighter.formatRetrievedChunksForPrompt(retrieved, autoQuery);
    }

    /**
     * Truy xuất mạng lưới đồng xuất hiện nhân vật trên toàn bộ tiểu thuyết
     */
    getCharacterCoOccurrenceReport() {
      return this.networkAnalyzer.buildCharacterCoOccurrenceNetwork(this.chunks);
    }

    /**
     * Truy vết dòng thời gian xuất hiện của một phục bút / vật phẩm qua các chương
     */
    traceClueTimeline(clueKeyword) {
      return this.networkAnalyzer.traceClueTimelineAcrossChapters(
        clueKeyword,
        this.chunks
      );
    }

    /**
     * Kiểm tra rò rỉ thông tin nhân vật (Knowledge Leak) không tốn Token
     */
    checkKnowledgeLeaksInText(chapterText) {
      return this.loreChecker.detectZeroTokenKnowledgeLeaks(chapterText);
    }

    /**
     * Báo cáo thống kê sức khỏe chỉ mục BM25+ hiện hành
     */
    getIndexDiagnostics() {
      const approvedChunks = this.chunks.filter((c) => c.status === 'APPROVED').length;
      const draftChunks = this.chunks.length - approvedChunks;
      const clueChunks = this.chunks.filter((c) => c.hasClueMention).length;
      const dialogueChunks = this.chunks.filter((c) => c.hasDialogue).length;

      return {
        totalChunks: this.chunks.length,
        approvedChunks,
        draftChunks,
        clueChunks,
        dialogueChunks,
        vocabularyTermsCount: this.scorer.invertedIndex.size,
        asciiTermsCount: this.scorer.asciiInvertedIndex.size,
        averageChunkTokenLength: Number(this.scorer.avgDocLength.toFixed(1)),
        lastRebuiltAt: this.lastRebuiltAt
      };
    }

    /**
     * Kiểm toán dòng thời gian của một nhân vật cụ thể xuyên suốt các chương (0 Token)
     */
    auditCharacterTimeline(characterName) {
      return this.continuityAuditor.auditCharacterChronology(
        characterName,
        this.chunks
      );
    }

    /**
     * Phát hiện các cụm từ miêu tả bị lặp lại quá nhiều giữa các chương
     */
    scanRepetitiveNGramsAcrossNovel(n = 4, minRepeats = 3) {
      return this.continuityAuditor.detectRepetitiveNGrams(
        this.chunks,
        n,
        minRepeats
      );
    }

    /**
     * Mở Bảng Điều Khiển Trung Tâm Ký Ức BM25+ (Phân tích đồng xuất hiện nhân vật & Truy vết phục bút)
     */
    openMemoryAnalyticsDashboard() {
      this.continuityAuditor.openAnalyticsModal(this);
    }
  }

  // ==========================================================================
  // PHẦN 11: BỘ KIỂM TOÁN DÒNG THỜI GIAN NHÂN VẬT & QUÉT LẶP TỪ LIÊN CHƯƠNG
  // ==========================================================================
  class RagTemporalContinuityAuditor {
    constructor(tokenizer, utils) {
      this.tokenizer = tokenizer;
      this.utils = utils;
      this.dashboardModalId = 'noir-mod07-analytics-dashboard-modal';

      this.injuryMarkers = [
        'bị thương', 'chảy máu', 'gãy tay', 'gãy chân', 'bất tỉnh', 'hôn mê',
        'trúng đạn', 'vết đâm', 'kiệt sức', 'ngất xỉu', 'băng bó', 'đau nhói'
      ];

      this.locationShiftMarkers = [
        'bước vào', 'rời khỏi', 'đi tới', 'chạy đến', 'trở về', 'đặt chân tới',
        'ẩn nấp tại', 'có mặt ở', 'xuất hiện tại', 'nhốt trong'
      ];
    }

    /**
     * Theo dõi hành trình, trạng thái thể chất và sự dịch chuyển không gian của 1 nhân vật qua từng chương
     */
    auditCharacterChronology(characterName, chunks = []) {
      if (!characterName || !characterName.trim() || !Array.isArray(chunks)) {
        return {
          characterName: characterName || '',
          totalMentions: 0,
          entries: [],
          potentialWarnings: []
        };
      }

      const needle = characterName.normalize('NFC').trim().toLowerCase();
      const entries = [];
      const potentialWarnings = [];
      let lastInjuryChapter = null;

      for (const chunk of chunks) {
        if (!chunk.lowerText || !chunk.lowerText.includes(needle)) continue;

        const foundInjuries = this.injuryMarkers.filter((m) =>
          chunk.lowerText.includes(m)
        );
        const foundMoves = this.locationShiftMarkers.filter((m) =>
          chunk.lowerText.includes(m)
        );

        if (foundInjuries.length > 0) {
          lastInjuryChapter = chunk.chapterTitle;
        } else if (
          lastInjuryChapter &&
          lastInjuryChapter !== chunk.chapterTitle &&
          /chạy nhanh|nhảy vọt|tung cú đấm|lao vút/i.test(chunk.lowerText)
        ) {
          potentialWarnings.push({
            chapterTitle: chunk.chapterTitle,
            note: `Nhân vật "${characterName}" từng ghi nhận trạng thái chấn thương ở "${lastInjuryChapter}" nhưng vận động mạnh ở "${chunk.chapterTitle}". Hãy kiểm tra xem vết thương đã được xử lý chưa.`
          });
        }

        entries.push({
          chunkId: chunk.id,
          chapterId: chunk.chapterId,
          chapterTitle: chunk.chapterTitle,
          status: chunk.status,
          injuries: foundInjuries,
          movements: foundMoves,
          coPresentCharacters: (chunk.properNames || []).filter(
            (n) => n !== needle
          ),
          snippet: chunk.text.slice(0, 240)
        });
      }

      return {
        characterName,
        totalMentions: entries.length,
        entries,
        potentialWarnings
      };
    }

    /**
     * Quét các cụm N-gram (4-5 từ liên tiếp) bị lặp lại nhiều lần giữa các chương khác nhau
     * giúp tác giả làm giàu vốn từ và tránh lặp ngữ điệu vô thức.
     */
    detectRepetitiveNGrams(chunks = [], n = 4, minRepeats = 3) {
      if (!Array.isArray(chunks) || chunks.length === 0) return [];
      const ngramMap = new Map(); // phrase -> { count, chapters: Set }

      for (const chunk of chunks) {
        const tokens = chunk.tokens || [];
        if (tokens.length < n) continue;

        const seenInChunk = new Set();
        for (let i = 0; i <= tokens.length - n; i++) {
          const slice = tokens.slice(i, i + n);
          // Bỏ qua các cụm chứa từ ghép đánh dấu '_'
          if (slice.some((t) => t.includes('_'))) continue;
          const phrase = slice.join(' ');
          if (phrase.length < 14) continue;
          if (seenInChunk.has(phrase)) continue;
          seenInChunk.add(phrase);

          let rec = ngramMap.get(phrase);
          if (!rec) {
            rec = { phrase, count: 0, chapters: new Set() };
            ngramMap.set(phrase, rec);
          }
          rec.count += 1;
          rec.chapters.add(chunk.chapterTitle);
        }
      }

      return Array.from(ngramMap.values())
        .filter((item) => item.count >= minRepeats && item.chapters.size >= 2)
        .sort((a, b) => b.count - a.count)
        .slice(0, 20)
        .map((item) => ({
          phrase: item.phrase,
          count: item.count,
          chapters: Array.from(item.chapters)
        }));
    }

    /**
     * Hiển thị hộp thoại Bảng Điều Khiển Phân Tích Ký Ức BM25+
     */
    openAnalyticsModal(ragInstance) {
      let modal = document.getElementById(this.dashboardModalId);
      if (!modal) {
        modal = document.createElement('div');
        modal.id = this.dashboardModalId;
        modal.className =
          'hidden fixed inset-0 z-[97] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 font-sansUI';
        modal.innerHTML = `
          <div class="w-full max-w-4xl rounded-3xl border border-amber-500/40 bg-zinc-950 text-zinc-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div class="px-5 py-4 border-b border-zinc-800 bg-zinc-900/90 flex items-center justify-between gap-3">
              <div>
                <h3 class="font-extrabold text-sm sm:text-base text-amber-400">
                  🧭 Trung Tâm Phân Tích Ký Ức & Mạng Lưới Tương Tác Nhân Vật (BM25+ Local RAG)
                </h3>
                <p id="mod07-dashboard-subtitle" class="text-[11px] text-zinc-400 mt-0.5"></p>
              </div>
              <button type="button" id="btn-mod07-close-dashboard" class="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-rose-600 text-xs font-bold text-zinc-300 hover:text-white transition">
                ✕ Đóng
              </button>
            </div>
            <div id="mod07-dashboard-body" class="p-5 overflow-y-auto space-y-5 text-xs flex-1"></div>
          </div>
        `;
        document.body.appendChild(modal);
        modal
          .querySelector('#btn-mod07-close-dashboard')
          ?.addEventListener('click', () => modal.classList.add('hidden'));
      }

      const diag = ragInstance.getIndexDiagnostics();
      const coNet = ragInstance.getCharacterCoOccurrenceReport();
      const repPhrases = this.detectRepetitiveNGrams(ragInstance.chunks, 4, 3);
      const esc = (s) => this.utils.escapeHtml(s);

      const subEl = modal.querySelector('#mod07-dashboard-subtitle');
      if (subEl) {
        subEl.textContent = `Tổng cộng ${diag.totalChunks} mảnh ký ức (${diag.approvedChunks} đã duyệt, ${diag.draftChunks} bản nháp) • Từ vựng: ${diag.vocabularyTermsCount.toLocaleString('vi-VN')} mục từ`;
      }

      const bodyEl = modal.querySelector('#mod07-dashboard-body');
      if (bodyEl) {
        const pairsHtml =
          coNet.topPairs.length > 0
            ? coNet.topPairs
                .slice(0, 8)
                .map(
                  (p) => `
                  <div class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/70 flex items-center justify-between gap-2">
                    <div>
                      <span class="font-extrabold text-amber-300">👥 ${esc(
                        p.charA
                      )} ⇄ ${esc(p.charB)}</span>
                      <div class="text-[10px] text-zinc-400 mt-0.5">Xuất hiện chung tại: ${esc(
                        p.chaptersList.join(', ')
                      )}</div>
                    </div>
                    <span class="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-monoCode font-bold text-[11px]">
                      ${p.coOccurrenceCount} cảnh
                    </span>
                  </div>
                `
                )
                .join('')
            : '<div class="text-zinc-500 italic">Chưa có đủ dữ liệu đồng xuất hiện giữa các nhân vật.</div>';

        const repeatHtml =
          repPhrases.length > 0
            ? repPhrases
                .slice(0, 8)
                .map(
                  (rp) => `
                  <div class="p-2 rounded-xl border border-zinc-800 bg-zinc-900/60 flex items-center justify-between gap-2">
                    <span class="font-serifNovel italic text-zinc-200">"${esc(
                      rp.phrase
                    )}"</span>
                    <span class="text-[10px] text-zinc-400 font-monoCode">${
                      rp.count
                    } lần (${rp.chapters.length} chương)</span>
                  </div>
                `
                )
                .join('')
            : '<div class="text-zinc-500 italic">Văn phong rất đa dạng, không phát hiện cụm 4 từ nào bị lặp quá mức giữa các chương!</div>';

        bodyEl.innerHTML = `
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="p-3 rounded-2xl border border-zinc-800 bg-zinc-900/90">
              <div class="text-[10px] text-zinc-400 uppercase font-bold">Tổng Mảnh Ký Ức</div>
              <div class="text-lg font-extrabold text-amber-400 font-monoCode mt-0.5">${diag.totalChunks}</div>
            </div>
            <div class="p-3 rounded-2xl border border-zinc-800 bg-zinc-900/90">
              <div class="text-[10px] text-zinc-400 uppercase font-bold">Mảnh Chứa Phục Bút</div>
              <div class="text-lg font-extrabold text-emerald-400 font-monoCode mt-0.5">${diag.clueChunks}</div>
            </div>
            <div class="p-3 rounded-2xl border border-zinc-800 bg-zinc-900/90">
              <div class="text-[10px] text-zinc-400 uppercase font-bold">Mảnh Giàu Hội Thoại</div>
              <div class="text-lg font-extrabold text-indigo-400 font-monoCode mt-0.5">${diag.dialogueChunks}</div>
            </div>
            <div class="p-3 rounded-2xl border border-zinc-800 bg-zinc-900/90">
              <div class="text-[10px] text-zinc-400 uppercase font-bold">Quy Mô Từ Điển</div>
              <div class="text-lg font-extrabold text-rose-400 font-monoCode mt-0.5">${diag.vocabularyTermsCount}</div>
            </div>
          </div>

          <div class="space-y-2">
            <h4 class="font-extrabold text-amber-400 uppercase text-[11px]">
              🤝 Các Cặp Nhân Vật Đồng Xuất Hiện Nhiều Nhất Trong Cùng Cảnh:
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">${pairsHtml}</div>
          </div>

          <div class="space-y-2">
            <h4 class="font-extrabold text-indigo-400 uppercase text-[11px]">
              🔁 Radar Quét Cụm Từ Lặp Liên Chương (N-Gram Echo Detector):
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">${repeatHtml}</div>
          </div>
        `;
      }

      modal.classList.remove('hidden');
    }
  }

  // Khởi tạo và gắn vào không gian tên toàn cục `window.NoirStudio.rag`
  const ragEngine = new LocalBM25MemoryEngine(window.NoirStudio.utils);
  ragEngine.continuityAuditor = new RagTemporalContinuityAuditor(
    ragEngine.tokenizer,
    ragEngine.utils
  );
  window.LocalBM25MemoryEngine = LocalBM25MemoryEngine;
  window.NoirStudio.rag = ragEngine;
})();
