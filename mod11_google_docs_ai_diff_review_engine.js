/**
 * ============================================================================
 * ✍️ WEB VIẾT TIỂU THUYẾT CỦA BI — MODULE 11 (v38.0 SUPREME EDITION)
 * ============================================================================
 * Tệp: mod11_google_docs_ai_diff_review_engine.js
 * Chức năng chính:
 *   1. Động cơ Kiểm duyệt Đoạn văn AI viết kiểu Google Docs tại Tab 1
 *      (GoogleDocsStyleAIDiffEngine — window.NoirStudio.aiDiff).
 *   2. Phân biệt trực quan bằng màu sắc giữa đoạn do Người viết (Human) và
 *      đoạn do AI mới sinh ra (AI Emerald/Teal Highlight) ngay trên Bàn viết.
 *   3. Chỉ hiển thị Thanh công cụ duyệt (#ai-diff-review-toolbar) và Bề mặt
 *      duyệt màu (#ai-diff-review-surface) khi thực sự có đầu ra AI vừa được
 *      Chèn nối tiếp (APPEND) hoặc Thay thế (REPLACE) vào bản thảo.
 *   4. Hỗ trợ Chấp nhận từng đoạn (✓ Chấp nhận đoạn này), Sửa nhanh trực tiếp
 *      (✏️ Sửa nhanh), Từ chối từng đoạn (✕ Từ chối), Tách/Gộp đoạn, Chuẩn hóa
 *      hội thoại "- Câu thoại (Tên nhân vật)", Chấp nhận tất cả, Hoàn nguyên
 *      tất cả và Chuyển đổi linh hoạt sang Sửa tay trực tiếp.
 *   5. Tích hợp Thuật toán So khớp Chuỗi con Chung Dài nhất (LCS Word/Sentence
 *      Diff), Bộ chấm điểm Nhịp văn & Ngũ quan cho từng đoạn AI, cùng Sổ cái
 *      Lịch sử Phiên bản Đoạn văn (Segment Revision Ledger).
 * ============================================================================
 */
(function () {
  'use strict';

  if (window.__NOIR_MOD11_AI_DIFF_LOADED__) return;
  window.__NOIR_MOD11_AI_DIFF_LOADED__ = true;

  window.NoirStudio = window.NoirStudio || {
    state: {
      activeScreen: 'SCREEN_1_WRITE',
      activeChapterId: null,
      chapterFilter: 'ALL',
      isSaving: false,
      isDirty: false,
      lastSavedAt: Date.now()
    }
  };

  // ==========================================================================
  // PHẦN 1: HẰNG SỐ ĐỐI CHIẾU VĂN BẢN, TỪ ĐIỂN NGŨ QUAN & MẪU CẢNH BÁO SÁO RỖNG
  // ==========================================================================
  const DIFF_ENGINE_CONFIG = {
    VERSION: '38.0.0-MOD11',
    STORAGE_KEY_MAIN: 'noir_v36_active_ai_diff_state',
    STORAGE_KEY_AUDIT_LOG: 'noir_v38_ai_diff_audit_trail',
    STORAGE_KEY_COMMENTS: 'noir_v38_ai_diff_margin_comments',
    STORAGE_KEY_PREFS: 'noir_v38_ai_diff_user_prefs',
    MAX_AUDIT_ENTRIES: 120,
    MAX_SEGMENT_REVISIONS: 25,
    LCS_MAX_TOKENS_THRESHOLD: 1600,
    SENSORY_LEXICON: {
      VISUAL: [
        'ánh sáng', 'bóng tối', 'màu', 'lấp lánh', 'mờ ảo', 'rực rỡ', 'nhợt nhạt',
        'hắt bóng', 'phản chiếu', 'tia nắng', 'ánh đèn', 'đỏ thẫm', 'xanh ngọc',
        'vàng vọt', 'đen kịt', 'sương mù', 'lấp loáng', 'nhíu mày', 'ánh nhìn',
        'khói', 'bóng dáng', 'tia chớp', 'hoàng hôn', 'bình minh', 'ngọn nến'
      ],
      AUDITORY: [
        'tiếng', 'âm thanh', 'vang lên', 'thì thầm', 'gào thét', 'rên rỉ', 'lách tách',
        'lộp bộp', 'xào xạc', 'vọng lại', 'im lặng', 'tĩnh mịch', 'ngân dài', 'khàn đặc',
        'cọt kẹt', 'ầm ầm', 'rì rào', 'tiếng bước chân', 'nhịp thở', 'tiếng mưa',
        'tiếng gió', 'leng keng', 'chát chúa', 'trầm thấp', 'vang vọng'
      ],
      OLFACTORY: [
        'mùi', 'hương', 'ngai ngái', 'tanh nồng', 'thơm ngát', 'ẩm mốc', 'khét lẹt',
        'mùi máu', 'mùi mưa', 'mùi thuốc súng', 'mùi cà phê', 'hương trầm', 'nồng nặc',
        'thoang thoảng', 'hăng hắc', 'mùi gỗ mục', 'mùi đất ẩm', 'mùi khói thuốc'
      ],
      TACTILE: [
        'lạnh buốt', 'nóng rẫy', 'ướt sũng', 'run rẩy', 'nhói buốt', 'đau rát',
        'mềm mại', 'thô ráp', 'sắc lạnh', 'ẩm ướt', 'cứng ngắc', 'tê dại',
        'nhịp tim', 'mồ hôi', 'hơi ấm', 'lạnh lẽo', 'chạm vào', 'siết chặt',
        'bàn tay', 'ngón tay', 'cơn ớn lạnh', 'nặng trĩu', 'nhẹ bẫng'
      ],
      INTERNAL_PSYCH: [
        'tự hỏi', 'nhớ lại', 'ký ức', 'linh cảm', 'nghi ngờ', 'do dự', 'quyết tâm',
        'trống rỗng', 'nghẹt thở', 'dằn vặt', 'nỗi sợ', 'hy vọng', 'tuyệt vọng',
        'bình tĩnh', 'phán đoán', 'suy luận', 'nhận ra', 'thầm nghĩ', 'cảnh giác'
      ]
    },
    COMMON_AI_CLICHES: [
      'một luồng điện chạy dọc sống lưng',
      'thở dài một tiếng',
      'ánh mắt phức tạp',
      'khẽ nhếch môi tạo thành một vòng cung',
      'không khỏi cảm thán trong lòng',
      'trong lòng dâng lên một cảm giác khó tả',
      'bầu không khí bỗng trở nên tĩnh lặng đến đáng sợ',
      'nụ cười nửa miệng đầy ẩn ý',
      'như một tảng đá đè nặng trong lòng',
      'hít một hơi thật sâu',
      'nắm chặt hai bàn tay đến trắng bệch',
      'ánh mắt sắc như dao cạo',
      'không hẹn mà cùng',
      'thời gian như ngừng trôi'
    ],
    CLICHE_REPLACEMENT_SUGGESTIONS: {
      'một luồng điện chạy dọc sống lưng': 'các đốt sống lưng chợt lạnh toát, từng sợi lông tơ dựng đứng',
      'thở dài một tiếng': 'khẽ buông một nhịp thở nặng nề qua kẽ răng',
      'ánh mắt phức tạp': 'đôi đồng tử giao động giữa vẻ hoài nghi và nỗi xót xa khó gọi tên',
      'khẽ nhếch môi tạo thành một vòng cung': 'khóe môi hơi nhướng lên thành một nét cười nhạt không chạm tới đáy mắt',
      'không khỏi cảm thán trong lòng': 'bất giác lặng người đi trước cảnh tượng trước mắt',
      'trong lòng dâng lên một cảm giác khó tả': 'lồng ngực chợt thắt lại bởi một dự cảm chẳng lành',
      'bầu không khí bỗng trở nên tĩnh lặng đến đáng sợ': 'căn phòng chìm vào khoảng lặng đặc quánh, chỉ còn nghe rõ tiếng kim đồng hồ nhích từng nhịp khô khốc',
      'nụ cười nửa miệng đầy ẩn ý': 'nét cười kín đáo thoáng qua nơi khóe miệng như đã nắm thóp được đối phương',
      'như một tảng đá đè nặng trong lòng': 'khiến từng nhịp thở đều trở nên nặng nhọc như bị rút cạn dưỡng khí',
      'hít một hơi thật sâu': 'kéo một luồng không khí lạnh buốt vào đầy buồng phổi để trấn tĩnh',
      'nắm chặt hai bàn tay đến trắng bệch': 'các khớp ngón tay siết chặt vào lòng bàn tay đến mức mất hết sắc máu',
      'ánh mắt sắc như dao cạo': 'cặp mắt lạnh lùng quét qua như muốn nhìn xuyên thấu từng lớp ngụy trang',
      'không hẹn mà cùng': 'gần như cùng một khoảnh khắc phản xạ',
      'thời gian như ngừng trôi': 'mọi chuyển động xung quanh dường như chậm lại trong khoảnh khắc ngắn ngủi'
    }
  };

  /**
   * Hàm lấy STUDIO_CONSTANTS an toàn tuyệt đối (hỗ trợ cả khi nạp độc lập hoặc theo thứ tự)
   */
  function getStudioConstants() {
    if (window.NoirStudio && window.NoirStudio.constants) {
      return window.NoirStudio.constants;
    }
    return {
      STORES: {
        WORKSPACE_HANDLES: 'workspace_handles',
        CHAPTERS: 'chapters',
        STORY_BIBLE: 'story_bible',
        RAG_CHUNKS: 'rag_chunks',
        STATE_CACHE: 'state_cache'
      },
      STORAGE_KEYS: {
        AI_DIFF_STATE: 'noir_v36_active_ai_diff_state',
        ANTI_CLICHE: 'noir_s10_anti_cliche_blacklist_v1',
        CHARACTERS: 'noir_s10_character_profiles_v1'
      },
      DEFAULT_ANTI_CLICHE: DIFF_ENGINE_CONFIG.COMMON_AI_CLICHES
    };
  }

  // ==========================================================================
  // PHẦN 2: BỘ TÁCH TỪ, TÁCH CÂU & PHÂN TÍCH HỘI THOẠI TIẾNG VIỆT CHUYÊN SÂU
  // ==========================================================================
  class VietnameseSentenceAndWordTokenizer {
    /**
     * Tách một đoạn văn bản dài thành danh sách các đoạn văn chuẩn (Paragraphs)
     */
    static splitIntoParagraphs(rawText) {
      if (!rawText || typeof rawText !== 'string') return [];
      return rawText
        .replace(/\r\n/g, '\n')
        .split(/\n\s*\n+/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);
    }

    /**
     * Tách một đoạn văn thành danh sách các câu (Sentences) có giữ nguyên dấu kết câu
     */
    static splitIntoSentences(paragraphText) {
      if (!paragraphText || typeof paragraphText !== 'string') return [];
      const clean = paragraphText.trim();
      if (!clean) return [];

      // Xử lý riêng dòng hội thoại bắt đầu bằng dấu gạch ngang
      const lines = clean.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const sentences = [];

      for (const line of lines) {
        if (/^[-–—]\s+/.test(line)) {
          sentences.push(line);
          continue;
        }
        const parts = line
          .split(/(?<=[.!?…]+["”’)]*)\s+/u)
          .map((s) => s.trim())
          .filter(Boolean);
        if (parts.length > 0) {
          sentences.push(...parts);
        } else {
          sentences.push(line);
        }
      }
      return sentences;
    }

    /**
     * Tách văn bản thành mảng các token (từ và khoảng trắng/dấu câu) phục vụ thuật toán LCS Diff
     */
    static tokenizeForWordDiff(text) {
      if (!text || typeof text !== 'string') return [];
      const tokens = [];
      const regex = /(\s+|[^\s\p{L}\p{N}]+|[\p{L}\p{N}_]+)/gu;
      let match;
      while ((match = regex.exec(text)) !== null) {
        tokens.push(match[0]);
      }
      return tokens;
    }

    /**
     * Kiểm tra xem một đoạn văn có phải là câu thoại nhân vật hay không
     */
    static analyzeDialogueStructure(paragraphText) {
      if (!paragraphText || typeof paragraphText !== 'string') {
        return {
          hasDialogue: false,
          isStandardFormat: true,
          speakerName: null,
          dialogueLineCount: 0,
          nonStandardLines: []
        };
      }

      const lines = paragraphText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      let hasDialogue = false;
      let dialogueLineCount = 0;
      let speakerName = null;
      const nonStandardLines = [];

      // Quy ước chuẩn của tác giả Bi: - Câu thoại (Tên nhân vật)
      const standardRegex = /^[-–—]\s+.+\(([^()]+)\)\s*[.!?…]*$/;

      for (const line of lines) {
        const startsWithDash = /^[-–—]\s*/.test(line);
        const hasQuotes = /[“"”].+[“"”]/.test(line);

        if (startsWithDash || hasQuotes) {
          hasDialogue = true;
          dialogueLineCount += 1;

          const stdMatch = line.match(standardRegex);
          if (stdMatch) {
            if (!speakerName) speakerName = stdMatch[1].trim();
          } else {
            nonStandardLines.push(line);
          }
        }
      }

      return {
        hasDialogue,
        isStandardFormat: !hasDialogue || nonStandardLines.length === 0,
        speakerName,
        dialogueLineCount,
        nonStandardLines
      };
    }

    /**
     * Tự động chuẩn hóa câu thoại trong đoạn văn về đúng định dạng:
     * - Câu nói của nhân vật (Tên nhân vật)
     */
    static normalizeParagraphDialogue(paragraphText, defaultSpeaker = 'Nhân vật chính') {
      if (!paragraphText || typeof paragraphText !== 'string') return '';
      const lines = paragraphText.split(/\r?\n/);

      const normalizedLines = lines.map((rawLine) => {
        const trimmed = rawLine.trim();
        if (!trimmed) return rawLine;

        // Nếu đã đúng chuẩn "- Câu thoại (Tên nhân vật)" thì giữ nguyên
        if (/^-\s+.+\([^()]+\)\s*$/.test(trimmed)) {
          return trimmed;
        }

        // Trường hợp: “Câu thoại,” Lâm Phong nói. hoặc "Câu thoại" - Lâm Phong
        const quotedWithSpeaker = trimmed.match(
          /^[“"']([^”"']+)[”"']\s*[,–—-]*\s*([A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][\p{L}\s]{1,25}?)\s*(?:nói|đáp|hỏi|thì thầm|quát|cười|lẩm bẩm|lạnh lùng nói|khẽ nói)?[.!?…]*$/u
        );
        if (quotedWithSpeaker) {
          const speech = quotedWithSpeaker[1].trim().replace(/[,]+$/, '');
          const speaker = quotedWithSpeaker[2].trim();
          return `- ${speech} (${speaker})`;
        }

        // Trường hợp dòng bắt đầu bằng dấu gạch ngang nhưng chưa có (Tên nhân vật) ở cuối
        if (/^[-–—]\s+/.test(trimmed)) {
          let content = trimmed.replace(/^[-–—]\s+/, '').trim();
          content = content.replace(/^[“"']|[”"']$/g, '').trim();

          // Kiểm tra xem cuối câu có "- Tên nhân vật" không
          const trailingSpeaker = content.match(/^(.*?)\s+[-–—]\s+([^\d\W][\p{L}\s]{1,25})$/u);
          if (trailingSpeaker) {
            return `- ${trailingSpeaker[1].trim()} (${trailingSpeaker[2].trim()})`;
          }

          if (!/\([^()]+\)\s*$/.test(content)) {
            return `- ${content} (${defaultSpeaker})`;
          }
          return `- ${content}`;
        }

        // Trường hợp dòng chỉ có ngoặc kép bọc toàn bộ câu thoại
        if (/^[“"'][^”"']+[”"'][.!?…]*$/.test(trimmed)) {
          const inner = trimmed.replace(/^[“"']|[”"'][.!?…]*$/g, '').trim();
          return `- ${inner} (${defaultSpeaker})`;
        }

        return trimmed;
      });

      return normalizedLines.join('\n');
    }
  }

  // ==========================================================================
  // PHẦN 3: THUẬT TOÁN SO KHỚP CHUỖI CON CHUNG DÀI NHẤT (LCS WORD/SENTENCE DIFF)
  // ==========================================================================
  class MyersAndLCSWordDiffEngine {
    /**
     * Tính toán sự khác biệt từng từ giữa hai đoạn văn bản (oldText vs newText)
     * Trả về mảng các phần tử: { type: 'EQUAL' | 'INSERT' | 'DELETE', value: string }
     */
    static computeWordDiff(oldText, newText) {
      const a = VietnameseSentenceAndWordTokenizer.tokenizeForWordDiff(oldText || '');
      const b = VietnameseSentenceAndWordTokenizer.tokenizeForWordDiff(newText || '');

      if (a.length === 0 && b.length === 0) return [];
      if (a.length === 0) return [{ type: 'INSERT', value: newText || '' }];
      if (b.length === 0) return [{ type: 'DELETE', value: oldText || '' }];

      // Nếu đoạn văn quá dài vượt ngưỡng ma trận DP đầy đủ, dùng thuật toán Neo Đầu-Cuối + Cửa sổ trượt
      if (a.length * b.length > DIFF_ENGINE_CONFIG.LCS_MAX_TOKENS_THRESHOLD * 450) {
        return this.computeWindowedDiff(a, b);
      }

      // Thuật toán thu gọn tiền tố & hậu tố giống hệt nhau để tăng tốc độ gấp 10 lần
      let start = 0;
      while (start < a.length && start < b.length && a[start] === b[start]) {
        start++;
      }

      let endA = a.length - 1;
      let endB = b.length - 1;
      while (endA >= start && endB >= start && a[endA] === b[endB]) {
        endA--;
        endB--;
      }

      const prefix = a.slice(0, start);
      const suffix = a.slice(endA + 1);
      const midA = a.slice(start, endA + 1);
      const midB = b.slice(start, endB + 1);

      const rawOps = [];
      if (prefix.length > 0) {
        rawOps.push({ type: 'EQUAL', value: prefix.join('') });
      }

      if (midA.length === 0 && midB.length > 0) {
        rawOps.push({ type: 'INSERT', value: midB.join('') });
      } else if (midB.length === 0 && midA.length > 0) {
        rawOps.push({ type: 'DELETE', value: midA.join('') });
      } else if (midA.length > 0 && midB.length > 0) {
        const m = midA.length;
        const n = midB.length;
        const dp = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1));

        for (let i = m - 1; i >= 0; i--) {
          for (let j = n - 1; j >= 0; j--) {
            if (midA[i] === midB[j]) {
              dp[i][j] = dp[i + 1][j + 1] + 1;
            } else {
              const down = dp[i + 1][j];
              const right = dp[i][j + 1];
              dp[i][j] = down >= right ? down : right;
            }
          }
        }

        let i = 0;
        let j = 0;
        while (i < m && j < n) {
          if (midA[i] === midB[j]) {
            rawOps.push({ type: 'EQUAL', value: midA[i] });
            i++;
            j++;
          } else if (dp[i + 1][j] >= dp[i][j + 1]) {
            rawOps.push({ type: 'DELETE', value: midA[i] });
            i++;
          } else {
            rawOps.push({ type: 'INSERT', value: midB[j] });
            j++;
          }
        }
        while (i < m) {
          rawOps.push({ type: 'DELETE', value: midA[i++] });
        }
        while (j < n) {
          rawOps.push({ type: 'INSERT', value: midB[j++] });
        }
      }

      if (suffix.length > 0) {
        rawOps.push({ type: 'EQUAL', value: suffix.join('') });
      }

      return this.coalesceDiffOps(rawOps);
    }

    /**
     * Thuật toán dự phòng theo câu khi văn bản quá dài
     */
    static computeWindowedDiff(tokensA, tokensB) {
      const textA = tokensA.join('');
      const textB = tokensB.join('');
      const sentsA = VietnameseSentenceAndWordTokenizer.splitIntoSentences(textA);
      const sentsB = VietnameseSentenceAndWordTokenizer.splitIntoSentences(textB);

      const setA = new Set(sentsA);
      const setB = new Set(sentsB);
      const ops = [];

      for (const s of sentsA) {
        if (!setB.has(s)) {
          ops.push({ type: 'DELETE', value: s + ' ' });
        }
      }
      for (const s of sentsB) {
        if (setA.has(s)) {
          ops.push({ type: 'EQUAL', value: s + ' ' });
        } else {
          ops.push({ type: 'INSERT', value: s + ' ' });
        }
      }
      return this.coalesceDiffOps(ops);
    }

    /**
     * Gộp các thao tác liên tiếp cùng loại (EQUAL, INSERT, DELETE) thành chuỗi liền mạch
     */
    static coalesceDiffOps(ops) {
      if (!Array.isArray(ops) || ops.length === 0) return [];
      const merged = [];
      for (const op of ops) {
        if (!op || !op.value) continue;
        const prev = merged[merged.length - 1];
        if (prev && prev.type === op.type) {
          prev.value += op.value;
        } else {
          merged.push({ type: op.type, value: op.value });
        }
      }
      return merged;
    }

    /**
     * Kết xuất mảng Diff ra mã HTML kiểu Track Changes của Google Docs
     */
    static renderDiffToHtml(oldText, newText, escapeFn) {
      const esc =
        typeof escapeFn === 'function'
          ? escapeFn
          : (s) =>
              String(s || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');

      const ops = this.computeWordDiff(oldText, newText);
      let insertedWords = 0;
      let deletedWords = 0;

      const html = ops
        .map((op) => {
          if (op.type === 'EQUAL') {
            return `<span class="text-zinc-200">${esc(op.value)}</span>`;
          }
          if (op.type === 'DELETE') {
            deletedWords += op.value.trim().split(/\s+/).filter(Boolean).length;
            return `<del class="px-1 py-0.5 rounded bg-rose-500/20 text-rose-300 line-through decoration-rose-400/90" title="Phần đã lược bỏ">${esc(
              op.value
            )}</del>`;
          }
          if (op.type === 'INSERT') {
            insertedWords += op.value.trim().split(/\s+/).filter(Boolean).length;
            return `<ins class="px-1 py-0.5 rounded bg-emerald-500/25 text-emerald-200 border-b-2 border-emerald-400 no-underline font-semibold" title="Phần mới bổ sung">${esc(
              op.value
            )}</ins>`;
          }
          return esc(op.value);
        })
        .join('');

      return {
        html,
        insertedWords,
        deletedWords,
        opCount: ops.length
      };
    }
  }

  // ==========================================================================
  // PHẦN 4: BỘ PHÂN TÍCH CHẤT LƯỢNG VĂN HỌC & NGŨ QUAN CHO TỪNG ĐOẠN VĂN AI
  // ==========================================================================
  class ProseQualityAndStyleAnalyzerForDiff {
    /**
     * Lấy danh sách từ cấm sáo rỗng từ Story Bible (hoặc danh sách mặc định)
     */
    static getActiveAntiClicheList() {
      const constants = getStudioConstants();
      const raw =
        document.getElementById('textarea-anti-cliche-blacklist')?.value ||
        localStorage.getItem(constants.STORAGE_KEYS.ANTI_CLICHE) ||
        '';
      const customList = raw
        .split(/[,;\n]+/)
        .map((s) => s.trim().toLowerCase())
        .filter((s) => s.length >= 3);

      const merged = new Set([
        ...DIFF_ENGINE_CONFIG.COMMON_AI_CLICHES.map((c) => c.toLowerCase()),
        ...customList
      ]);
      return Array.from(merged);
    }

    /**
     * Phân tích toàn diện 1 đoạn văn AI để hiển thị huy hiệu đánh giá ngay trên thẻ Google Docs Diff
     */
    static analyzeSegment(text) {
      const clean = String(text || '').trim();
      if (!clean) {
        return {
          wordCount: 0,
          sentenceCount: 0,
          avgSentenceWords: 0,
          pacingLabel: 'Chưa rõ',
          pacingColor: 'text-zinc-400',
          sensesDetected: [],
          clichesFound: [],
          dialogueInfo: {
            hasDialogue: false,
            isStandardFormat: true,
            speakerName: null,
            nonStandardLines: []
          },
          qualityScore: 80
        };
      }

      const words = clean.split(/\s+/).filter(Boolean);
      const wordCount = words.length;
      const sentences = VietnameseSentenceAndWordTokenizer.splitIntoSentences(clean);
      const sentenceCount = Math.max(1, sentences.length);
      const avgSentenceWords = Math.round((wordCount / sentenceCount) * 10) / 10;

      // Đánh giá nhịp điệu câu văn
      let pacingLabel = 'Nhịp cân bằng';
      let pacingColor = 'text-emerald-300';
      if (avgSentenceWords <= 11) {
        pacingLabel = '⚡ Nhịp nhanh / Dồn dập';
        pacingColor = 'text-amber-300';
      } else if (avgSentenceWords >= 28) {
        pacingLabel = '🌊 Nhịp chậm / Nội tâm sâu';
        pacingColor = 'text-indigo-300';
      }

      // Phát hiện 5 giác quan (Show, Don't Tell)
      const lower = clean.toLowerCase();
      const sensesDetected = [];
      const senseLabels = {
        VISUAL: { icon: '👁️', name: 'Thị giác' },
        AUDITORY: { icon: '👂', name: 'Thính giác' },
        OLFACTORY: { icon: '👃', name: 'Khứu giác' },
        TACTILE: { icon: '✋', name: 'Xúc giác' },
        INTERNAL_PSYCH: { icon: '💭', name: 'Nội tâm' }
      };

      Object.keys(DIFF_ENGINE_CONFIG.SENSORY_LEXICON).forEach((senseKey) => {
        const keywords = DIFF_ENGINE_CONFIG.SENSORY_LEXICON[senseKey];
        const matched = keywords.filter((kw) => lower.includes(kw));
        if (matched.length > 0) {
          sensesDetected.push({
            key: senseKey,
            icon: senseLabels[senseKey].icon,
            name: senseLabels[senseKey].name,
            matches: matched.slice(0, 3)
          });
        }
      });

      // Quét các cụm từ sáo rỗng AI
      const blacklist = this.getActiveAntiClicheList();
      const clichesFound = [];
      for (const phrase of blacklist) {
        if (phrase && lower.includes(phrase)) {
          clichesFound.push({
            phrase,
            suggestion:
              DIFF_ENGINE_CONFIG.CLICHE_REPLACEMENT_SUGGESTIONS[phrase] ||
              'Hãy thay bằng hành động cụ thể hoặc chi tiết 5 giác quan'
          });
        }
      }

      // Kiểm tra cấu trúc hội thoại
      const dialogueInfo = VietnameseSentenceAndWordTokenizer.analyzeDialogueStructure(clean);

      // Tính điểm chất lượng đoạn văn (thang 100)
      let score = 82;
      score += Math.min(12, sensesDetected.length * 4);
      if (dialogueInfo.hasDialogue && dialogueInfo.isStandardFormat) score += 4;
      if (dialogueInfo.hasDialogue && !dialogueInfo.isStandardFormat) score -= 8;
      score -= clichesFound.length * 9;
      if (wordCount < 12) score -= 5;
      score = Math.max(40, Math.min(100, score));

      return {
        wordCount,
        sentenceCount,
        avgSentenceWords,
        pacingLabel,
        pacingColor,
        sensesDetected,
        clichesFound,
        dialogueInfo,
        qualityScore: score
      };
    }

    /**
     * Tự động khử các cụm từ sáo rỗng phổ biến trong đoạn văn AI bằng gợi ý văn học giàu hình ảnh
     */
    static autoPolishClichesInSegment(text) {
      let polished = String(text || '');
      let replacedCount = 0;

      Object.entries(DIFF_ENGINE_CONFIG.CLICHE_REPLACEMENT_SUGGESTIONS).forEach(
        ([cliche, replacement]) => {
          const escaped = cliche.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const rx = new RegExp(escaped, 'gi');
          if (rx.test(polished)) {
            polished = polished.replace(rx, replacement);
            replacedCount += 1;
          }
        }
      );

      return {
        text: polished,
        replacedCount
      };
    }
  }

  // ==========================================================================
  // PHẦN 5: SỔ CÁI LỊCH SỬ CHỈNH SỬA ĐOẠN VĂN & GHI CHÚ BÊN LỀ KIỂU GOOGLE DOCS
  // ==========================================================================
  class SegmentRevisionHistoryLedger {
    constructor(idb) {
      this.idb = idb;
      this.auditLog = [];
      this.marginComments = {};
    }

    getIdb() {
      return this.idb || window.NoirStudio?.idb || null;
    }

    loadFromStorage() {
      const idb = this.getIdb();
      if (idb && typeof idb.getLocalJSON === 'function') {
        this.auditLog = idb.getLocalJSON(DIFF_ENGINE_CONFIG.STORAGE_KEY_AUDIT_LOG, []);
        this.marginComments = idb.getLocalJSON(DIFF_ENGINE_CONFIG.STORAGE_KEY_COMMENTS, {});
      } else {
        try {
          this.auditLog = JSON.parse(
            localStorage.getItem(DIFF_ENGINE_CONFIG.STORAGE_KEY_AUDIT_LOG) || '[]'
          );
          this.marginComments = JSON.parse(
            localStorage.getItem(DIFF_ENGINE_CONFIG.STORAGE_KEY_COMMENTS) || '{}'
          );
        } catch (_) {
          this.auditLog = [];
          this.marginComments = {};
        }
      }
      if (!Array.isArray(this.auditLog)) this.auditLog = [];
      if (!this.marginComments || typeof this.marginComments !== 'object') {
        this.marginComments = {};
      }
    }

    saveToStorage() {
      if (this.auditLog.length > DIFF_ENGINE_CONFIG.MAX_AUDIT_ENTRIES) {
        this.auditLog = this.auditLog.slice(0, DIFF_ENGINE_CONFIG.MAX_AUDIT_ENTRIES);
      }
      const idb = this.getIdb();
      if (idb && typeof idb.setLocalJSON === 'function') {
        idb.setLocalJSON(DIFF_ENGINE_CONFIG.STORAGE_KEY_AUDIT_LOG, this.auditLog);
        idb.setLocalJSON(DIFF_ENGINE_CONFIG.STORAGE_KEY_COMMENTS, this.marginComments);
      } else {
        try {
          localStorage.setItem(
            DIFF_ENGINE_CONFIG.STORAGE_KEY_AUDIT_LOG,
            JSON.stringify(this.auditLog)
          );
          localStorage.setItem(
            DIFF_ENGINE_CONFIG.STORAGE_KEY_COMMENTS,
            JSON.stringify(this.marginComments)
          );
        } catch (_) {}
      }
    }

    /**
     * Ghi nhận một hành động kiểm duyệt của tác giả (ACCEPT, REJECT, EDIT, SPLIT, MERGE, POLISH)
     */
    recordDecision({
      chapterId,
      chapterTitle,
      segmentId,
      actionType,
      beforeText,
      afterText,
      note = ''
    }) {
      const entry = {
        id: 'audit_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        timestamp: Date.now(),
        chapterId: chapterId || 'unknown',
        chapterTitle: chapterTitle || 'Chương hiện tại',
        segmentId: segmentId || '',
        actionType: actionType || 'REVIEW',
        beforeText: String(beforeText || '').slice(0, 1200),
        afterText: String(afterText || '').slice(0, 1200),
        note
      };
      this.auditLog.unshift(entry);
      this.saveToStorage();
      return entry;
    }

    getAuditHistoryForChapter(chapterId, limit = 25) {
      return this.auditLog
        .filter((e) => !chapterId || e.chapterId === chapterId)
        .slice(0, limit);
    }

    /**
     * Thêm ghi chú biên tập bên lề cho 1 đoạn văn (Google Docs Margin Comment)
     */
    addMarginComment(chapterId, segmentId, commentText, authorName = 'Tác giả Bi') {
      if (!chapterId || !segmentId || !commentText || !commentText.trim()) return null;
      const key = `${chapterId}::${segmentId}`;
      if (!Array.isArray(this.marginComments[key])) {
        this.marginComments[key] = [];
      }
      const comment = {
        id: 'cmt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
        author: authorName,
        text: commentText.trim(),
        createdAt: Date.now(),
        resolved: false
      };
      this.marginComments[key].push(comment);
      this.saveToStorage();
      return comment;
    }

    getCommentsForSegment(chapterId, segmentId) {
      if (!chapterId || !segmentId) return [];
      const key = `${chapterId}::${segmentId}`;
      return Array.isArray(this.marginComments[key]) ? this.marginComments[key] : [];
    }

    deleteMarginComment(chapterId, segmentId, commentId) {
      const key = `${chapterId}::${segmentId}`;
      if (!Array.isArray(this.marginComments[key])) return;
      this.marginComments[key] = this.marginComments[key].filter((c) => c.id !== commentId);
      this.saveToStorage();
    }
  }

  // ==========================================================================
  // PHẦN 6: BỘ KHỬ NHIỄU MARKDOWN & CHUẨN HÓA ĐẦU RA AI TRƯỚC KHI ĐƯA VÀO DIFF
  // ==========================================================================
  class AIOutputSanitizerForManuscript {
    /**
     * Làm sạch các tiêu đề thừa, rào chắn markdown hoặc lời chào của AI trước khi tách đoạn
     */
    static sanitizeRawAIOutput(rawText) {
      if (!rawText || typeof rawText !== 'string') return '';
      let text = rawText.replace(/\r\n/g, '\n').trim();

      // Loại bỏ các khối code fence bọc ngoài nếu AI vô tình bọc toàn bộ chương trong ```markdown
      if (/^```(?:markdown|text|txt)?\s*\n/i.test(text) && /\n```\s*$/.test(text)) {
        text = text.replace(/^```(?:markdown|text|txt)?\s*\n/i, '').replace(/\n```\s*$/, '');
      }

      // Loại bỏ những dòng mở đầu/kết thúc mang tính giao tiếp của AI nếu có
      const lines = text.split('\n');
      const cleanedLines = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (
          i === 0 &&
          /^(dưới đây là|đây là bản nháp|tuyệt vời!|chào bạn,|theo yêu cầu của bạn)/i.test(line) &&
          line.length < 130
        ) {
          continue;
        }
        cleanedLines.push(lines[i]);
      }

      return cleanedLines.join('\n').trim();
    }

    /**
     * Tách thông minh văn bản AI thành các đoạn kiểm duyệt độc lập (Segments)
     * hỗ trợ cả phân cảnh (* * *) và hội thoại liên hoàn
     */
    static buildSmartSegmentsFromAI(cleanAI, baseTimestamp = Date.now()) {
      const sanitized = this.sanitizeRawAIOutput(cleanAI);
      if (!sanitized) return [];

      const rawParagraphs = VietnameseSentenceAndWordTokenizer.splitIntoParagraphs(sanitized);
      const segments = [];

      rawParagraphs.forEach((para, idx) => {
        const analysis = ProseQualityAndStyleAnalyzerForDiff.analyzeSegment(para);
        segments.push({
          id: `ai_seg_${baseTimestamp}_${idx}`,
          type: 'AI',
          text: para,
          originalAiText: para,
          createdAt: baseTimestamp + idx,
          editedCount: 0,
          revisionHistory: [
            {
              version: 1,
              label: 'Bản AI sinh gốc',
              text: para,
              timestamp: baseTimestamp
            }
          ],
          qualityScore: analysis.qualityScore,
          sensesCount: analysis.sensesDetected.length,
          clicheCount: analysis.clichesFound.length
        });
      });

      return segments;
    }
  }

  // ==========================================================================
  // PHẦN 7: ĐỘNG CƠ CHÍNH — GOOGLE DOCS STYLE AI DIFF ENGINE (MODULE 11)
  // ==========================================================================
  class GoogleDocsStyleAIDiffEngine {
    constructor(idb, chapterMgr, autoSaver, versionVault, utils) {
      this._idb = idb || null;
      this._chapterMgr = chapterMgr || null;
      this._autoSaver = autoSaver || null;
      this._versionVault = versionVault || null;
      this._utils = utils || null;

      // Map chapterId -> { originalText, mode, createdAt, segments: [{ id, type: 'HUMAN'|'AI', text, ... }] }
      this.chapterDiffMap = {};
      this.isManualEditOverride = false;
      this.activeInlineEditorSegId = null;
      this.activeDiffCompareSegId = null;
      this.filterMode = 'ALL'; // 'ALL' | 'ONLY_AI' | 'NEEDS_POLISH'
      this.showQualityBadges = true;
      this.undoSegmentDecisionStack = [];
      this.revisionLedger = new SegmentRevisionHistoryLedger(this._idb);
      this._domEventsBound = false;
    }

    // Các Getter tự động kết nối an toàn với window.NoirStudio
    get idb() {
      return this._idb || window.NoirStudio?.idb || {
        getLocalJSON: (k, fb) => {
          try {
            const r = localStorage.getItem(k);
            return r ? JSON.parse(r) : fb;
          } catch (_) {
            return fb;
          }
        },
        setLocalJSON: (k, v) => {
          try {
            localStorage.setItem(k, JSON.stringify(v));
            return true;
          } catch (_) {
            return false;
          }
        }
      };
    }

    set idb(val) {
      this._idb = val;
    }

    get chapterMgr() {
      return this._chapterMgr || window.NoirStudio?.chapterManager || null;
    }

    set chapterMgr(val) {
      this._chapterMgr = val;
    }

    get autoSaver() {
      return this._autoSaver || window.NoirStudio?.autoSaver || null;
    }

    set autoSaver(val) {
      this._autoSaver = val;
    }

    get versionVault() {
      return this._versionVault || window.NoirStudio?.versionVault || null;
    }

    set versionVault(val) {
      this._versionVault = val;
    }

    get utils() {
      return (
        this._utils ||
        window.NoirStudio?.utils || {
          escapeHtml: (s) =>
            String(s ?? '')
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
          formatTimestampVN: (ts) => new Date(ts || Date.now()).toLocaleString('vi-VN'),
          showToast: (msg) => console.log('[Toast]', msg)
        }
      );
    }

    set utils(val) {
      this._utils = val;
    }

    /**
     * Khởi tạo trạng thái kiểm duyệt đoạn văn AI từ bộ nhớ cục bộ và gắn sự kiện thanh công cụ
     */
    init() {
      const constants = getStudioConstants();
      const saved = this.idb.getLocalJSON(constants.STORAGE_KEYS.AI_DIFF_STATE, {});
      if (saved && typeof saved === 'object') {
        this.chapterDiffMap = saved;
      }

      const prefs = this.idb.getLocalJSON(DIFF_ENGINE_CONFIG.STORAGE_KEY_PREFS, null);
      if (prefs && typeof prefs === 'object') {
        this.showQualityBadges = prefs.showQualityBadges !== false;
        this.filterMode = prefs.filterMode || 'ALL';
      }

      this.revisionLedger.loadFromStorage();
      this.bindToolbarDOMEvents();
      this.refreshReviewSurfaceForActiveChapter();
    }

    /**
     * Gắn sự kiện cho 3 nút trên thanh công cụ duyệt đoạn AI (#ai-diff-review-toolbar)
     * với cờ chống gắn trùng lặp 100%
     */
    bindToolbarDOMEvents() {
      if (this._domEventsBound) return;

      const btnAcceptAll = document.getElementById('btn-ai-diff-accept-all');
      const btnRejectAll = document.getElementById('btn-ai-diff-reject-all');
      const btnToggleEdit = document.getElementById('btn-ai-diff-toggle-edit-view');

      if (btnAcceptAll && !btnAcceptAll.dataset.mod11Bound) {
        btnAcceptAll.dataset.mod11Bound = '1';
        btnAcceptAll.addEventListener('click', () => {
          this.acceptAllForActiveChapter();
        });
      }

      if (btnRejectAll && !btnRejectAll.dataset.mod11Bound) {
        btnRejectAll.dataset.mod11Bound = '1';
        btnRejectAll.addEventListener('click', () => {
          this.rejectAllForActiveChapter();
        });
      }

      if (btnToggleEdit && !btnToggleEdit.dataset.mod11Bound) {
        btnToggleEdit.dataset.mod11Bound = '1';
        btnToggleEdit.addEventListener('click', () => {
          this.toggleManualEditView();
        });
      }

      this._domEventsBound = Boolean(btnAcceptAll && btnRejectAll && btnToggleEdit);
    }

    /**
     * Lưu trạng thái kiểm duyệt xuống LocalStorage / IndexedDB
     */
    persistDiffState() {
      const constants = getStudioConstants();
      this.idb.setLocalJSON(constants.STORAGE_KEYS.AI_DIFF_STATE, this.chapterDiffMap);
      this.idb.setLocalJSON(DIFF_ENGINE_CONFIG.STORAGE_KEY_PREFS, {
        showQualityBadges: this.showQualityBadges,
        filterMode: this.filterMode
      });
    }

    /**
     * Kiểm tra xem một chương có đang chứa đoạn văn AI chờ duyệt hay không
     */
    hasPendingAISegments(chapterId = null) {
      const cid =
        chapterId ||
        this.chapterMgr?.activeChapterId ||
        this.chapterMgr?.getActiveChapter()?.id;
      if (!cid || !this.chapterDiffMap[cid]) return false;
      const segments = this.chapterDiffMap[cid].segments || [];
      return segments.some((s) => s && s.type === 'AI');
    }

    /**
     * Đưa đầu ra AI vào Bản thảo Tab 1 kèm đánh dấu màu khác biệt kiểu Google Docs
     * @param {string} aiText Nội dung AI vừa sinh ra
     * @param {'APPEND'|'REPLACE'} mode Chèn nối tiếp hay Thay thế toàn bộ
     */
    async applyAIOutputToManuscriptWithDiff(aiText, mode = 'APPEND') {
      const sanitizedRaw = AIOutputSanitizerForManuscript.sanitizeRawAIOutput(String(aiText || ''));
      const nsRef = typeof window !== 'undefined' ? window.NoirStudio : null;
      const cleanAI =
        nsRef && typeof nsRef.stripAiMarkdownSymbols === 'function'
          ? nsRef.stripAiMarkdownSymbols(sanitizedRaw)
          : sanitizedRaw;
      if (!cleanAI) {
        this.utils.showToast(
          '⚠️ Cửa sổ đầu ra AI đang trống, chưa có nội dung để đưa vào bản thảo!',
          'warning'
        );
        return false;
      }

      if (!this.chapterMgr) {
        this.utils.showToast('⚠️ Đang khởi tạo trình quản lý chương, vui lòng thử lại.', 'warning');
        return false;
      }

      const chap = this.chapterMgr.syncEditorToActiveChapter();
      if (!chap) return false;

      // Tự động chụp mốc phiên bản trước khi chèn AI để tác giả luôn có thể hoàn nguyên
      if (this.versionVault && typeof this.versionVault.createSnapshot === 'function') {
        await this.versionVault.createSnapshot(
          `Lưu tự động trước khi ${
            mode === 'REPLACE' ? 'thay thế' : 'chèn nối tiếp'
          } đầu ra AI vào "${chap.displayTitle || chap.title}"`,
          'PRE_AI'
        );
      }

      const previousHumanText = chap.content || '';
      if (this.autoSaver && typeof this.autoSaver.forcePushUndoSnapshot === 'function') {
        this.autoSaver.forcePushUndoSnapshot(previousHumanText);
      }

      // Tách đoạn AI theo từng đoạn văn thông minh kèm phân tích chất lượng
      const nowTs = Date.now();
      const aiSegments = AIOutputSanitizerForManuscript.buildSmartSegmentsFromAI(cleanAI, nowTs);
      if (aiSegments.length === 0) {
        this.utils.showToast('⚠️ Không tìm thấy đoạn văn hợp lệ trong đầu ra AI.', 'warning');
        return false;
      }

      const segments = [];
      if (mode === 'APPEND' && previousHumanText.trim().length > 0) {
        // Nếu chương này đang có sẵn các đoạn diff chưa duyệt, giữ nguyên chúng
        const existingState = this.chapterDiffMap[chap.id];
        if (
          existingState &&
          Array.isArray(existingState.segments) &&
          existingState.segments.length > 0
        ) {
          segments.push(...existingState.segments);
        } else {
          // Tách phần người viết thành các đoạn HUMAN rõ ràng để hiển thị liền mạch
          const humanParas =
            VietnameseSentenceAndWordTokenizer.splitIntoParagraphs(previousHumanText);
          if (humanParas.length > 0) {
            humanParas.forEach((hp, hIdx) => {
              segments.push({
                id: `human_base_${nowTs}_${hIdx}`,
                type: 'HUMAN',
                text: hp,
                createdAt: nowTs
              });
            });
          } else {
            segments.push({
              id: 'human_base_' + nowTs,
              type: 'HUMAN',
              text: previousHumanText.trim(),
              createdAt: nowTs
            });
          }
        }
      }

      segments.push(...aiSegments);

      this.chapterDiffMap[chap.id] = {
        originalText:
          this.chapterDiffMap[chap.id]?.originalText !== undefined && mode === 'APPEND'
            ? this.chapterDiffMap[chap.id].originalText
            : previousHumanText,
        latestSnapshotBeforeBatch: previousHumanText,
        mode,
        createdAt: nowTs,
        segments
      };

      this.isManualEditOverride = false;
      this.activeInlineEditorSegId = null;
      this.activeDiffCompareSegId = null;
      this.undoSegmentDecisionStack = [];

      this.revisionLedger.recordDecision({
        chapterId: chap.id,
        chapterTitle: chap.displayTitle || chap.title,
        segmentId: 'BATCH_' + mode,
        actionType: mode === 'REPLACE' ? 'BATCH_REPLACE_AI' : 'BATCH_APPEND_AI',
        beforeText: previousHumanText.slice(-500),
        afterText: cleanAI.slice(0, 500),
        note: `Đưa ${aiSegments.length} đoạn AI vào bản thảo (${mode})`
      });

      this.persistDiffState();
      this.syncSegmentsToChapterContent(chap.id);
      this.refreshReviewSurfaceForActiveChapter();

      // Chuyển ngay sang Tab 1 để tác giả nhìn thấy màu đánh dấu đoạn AI viết và duyệt
      window.NoirStudio.navigator?.navigateToScreen('SCREEN_1_WRITE');
      this.utils.showToast(
        `✨ Đã đưa ${aiSegments.length} đoạn AI vào Bản thảo Tab 1! Các đoạn AI viết được tô màu xanh ngọc để bạn duyệt (Chấp nhận / Sửa nhanh / Từ chối).`,
        'success',
        4500
      );
      return true;
    }

    /**
     * Đồng bộ danh sách các đoạn (HUMAN + AI) vào nội dung thực của Chương và ô Textarea
     */
    syncSegmentsToChapterContent(chapterId) {
      const state = this.chapterDiffMap[chapterId];
      if (!this.chapterMgr || !Array.isArray(this.chapterMgr.chapters)) return;
      const chap = this.chapterMgr.chapters.find((c) => c.id === chapterId);
      if (!chap || !state || !Array.isArray(state.segments)) return;

      const combined = state.segments
        .map((s) => String(s.text || '').trim())
        .filter(Boolean)
        .join('\n\n');

      chap.content = combined;
      chap.wordCount = this.utils.countVietnameseWords(combined);

      const editor = document.getElementById('textarea-chapter-content');
      if (editor && chap.id === this.chapterMgr.activeChapterId) {
        editor.value = combined;
        if (typeof this.chapterMgr.updateLiveWordStatsUI === 'function') {
          this.chapterMgr.updateLiveWordStatsUI(combined);
        }
      }

      if (this.autoSaver && typeof this.autoSaver.triggerSave === 'function') {
        this.autoSaver.triggerSave(false);
      }
    }

    /**
     * Kết xuất Bề mặt Duyệt Màu kiểu Google Docs (#ai-diff-review-surface) tại Tab 1.
     * QUY TẮC BẤT KHẢ XÂM PHẠM: Chỉ hiển thị thanh công cụ và bề mặt màu khi thực sự
     * có ít nhất 1 đoạn AI đang chờ duyệt trong chương đang mở!
     */
    refreshReviewSurfaceForActiveChapter() {
      this.bindToolbarDOMEvents();

      const chap = this.chapterMgr ? this.chapterMgr.getActiveChapter() : null;
      const toolbar = document.getElementById('ai-diff-review-toolbar');
      const surface = document.getElementById('ai-diff-review-surface');
      const textarea = document.getElementById('textarea-chapter-content');
      const pendingBadge = document.getElementById('ai-diff-pending-count');
      const toggleBtn = document.getElementById('btn-ai-diff-toggle-edit-view');

      if (!chap || !toolbar || !surface || !textarea) return;

      const diffState = this.chapterDiffMap[chap.id];
      const aiSegments = diffState
        ? (diffState.segments || []).filter((s) => s && s.type === 'AI')
        : [];

      // Chỉ hiển thị giao diện duyệt màu khi thực sự có đoạn AI chờ duyệt trong chương này
      if (!diffState || aiSegments.length === 0) {
        delete this.chapterDiffMap[chap.id];
        this.persistDiffState();
        toolbar.classList.add('hidden');
        surface.classList.add('hidden');
        textarea.classList.remove('hidden');
        return;
      }

      toolbar.classList.remove('hidden');
      const totalAiWords = aiSegments.reduce(
        (sum, seg) => sum + this.utils.countVietnameseWords(seg.text || ''),
        0
      );

      if (pendingBadge) {
        pendingBadge.textContent = `${aiSegments.length} đoạn AI chờ duyệt (+${totalAiWords.toLocaleString(
          'vi-VN'
        )} từ)`;
      }

      if (this.isManualEditOverride) {
        surface.classList.add('hidden');
        textarea.classList.remove('hidden');
        if (toggleBtn) {
          toggleBtn.textContent = '👁️ Xem màu phân biệt AI / Người viết';
        }
        return;
      }

      if (toggleBtn) {
        toggleBtn.textContent = '✏️ Sửa tay trực tiếp';
      }
      surface.classList.remove('hidden');
      textarea.classList.add('hidden');

      const humanSegmentsCount = (diffState.segments || []).filter(
        (s) => s && s.type === 'HUMAN'
      ).length;

      // Thanh điều khiển phụ bên trong Bề mặt duyệt Google Docs (Lọc nhanh, Chuẩn hóa thoại, Khử từ sáo rỗng, Hoàn tác bước duyệt vừa rồi)
      const subHeaderHtml = this.buildSubHeaderDashboardHtml(
        chap,
        aiSegments,
        humanSegmentsCount,
        totalAiWords
      );

      let aiCounter = 0;
      const cardsHtml = (diffState.segments || [])
        .map((seg, idx) => {
          if (!seg) return '';

          if (seg.type === 'HUMAN') {
            if (this.filterMode === 'ONLY_AI' || this.filterMode === 'NEEDS_POLISH') {
              return '';
            }
            return this.buildHumanSegmentHtml(seg, idx);
          }

          aiCounter += 1;
          const analysis = ProseQualityAndStyleAnalyzerForDiff.analyzeSegment(seg.text);

          if (
            this.filterMode === 'NEEDS_POLISH' &&
            analysis.clichesFound.length === 0 &&
            analysis.dialogueInfo.isStandardFormat
          ) {
            return '';
          }

          return this.buildAISegmentCardHtml(chap, seg, idx, aiCounter, analysis);
        })
        .join('');

      surface.innerHTML = subHeaderHtml + (cardsHtml || '<div class="p-6 text-center text-zinc-400 italic">Không có đoạn nào khớp với bộ lọc hiện tại.</div>');

      this.bindReviewSurfaceCardEvents(surface, chap);
    }

    /**
     * Dựng bảng tóm tắt chất lượng & thanh công cụ biên tập nhanh phía trên bề mặt duyệt
     */
    buildSubHeaderDashboardHtml(chap, aiSegments, humanCount, totalAiWords) {
      let totalCliches = 0;
      let totalNonStdDialogue = 0;
      let totalSensoryRich = 0;

      aiSegments.forEach((seg) => {
        const an = ProseQualityAndStyleAnalyzerForDiff.analyzeSegment(seg.text);
        totalCliches += an.clichesFound.length;
        if (an.dialogueInfo.hasDialogue && !an.dialogueInfo.isStandardFormat) {
          totalNonStdDialogue += 1;
        }
        if (an.sensesDetected.length >= 2) {
          totalSensoryRich += 1;
        }
      });

      const canUndoDecision = this.undoSegmentDecisionStack.length > 0;

      return `
        <div class="mb-5 p-3.5 rounded-2xl border border-emerald-500/40 bg-zinc-900/90 font-sansUI text-xs space-y-2.5 select-none">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-[11px]">
                📊 Tổng quan bản duyệt: ${aiSegments.length} đoạn AI (${totalAiWords.toLocaleString('vi-VN')} từ) • ${humanCount} đoạn Người viết
              </span>
              <span class="px-2 py-0.5 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-300 text-[11px] font-semibold">
                ✨ ${totalSensoryRich}/${aiSegments.length} đoạn giàu ngũ quan
              </span>
              ${
                totalCliches > 0
                  ? `<span class="px-2 py-0.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-bold">⚠️ Phát hiện ${totalCliches} cụm từ sáo rỗng</span>`
                  : `<span class="px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">✅ 0 từ sáo rỗng</span>`
              }
            </div>

            <div class="flex items-center gap-1.5 flex-wrap">
              <button type="button" data-diff-batch-action="NORMALIZE_ALL_DIALOGUE" class="px-2.5 py-1 rounded-lg border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-bold text-[11px] transition" title="Tự động chuẩn hóa mọi câu thoại trong các đoạn AI về đúng chuẩn: - Câu thoại (Tên nhân vật)">
                🧹 Chuẩn hóa thoại AI ${totalNonStdDialogue > 0 ? `(${totalNonStdDialogue})` : ''}
              </button>
              <button type="button" data-diff-batch-action="POLISH_ALL_CLICHES" class="px-2.5 py-1 rounded-lg border border-teal-500/40 bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 font-bold text-[11px] transition" title="Tự động thay thế các cụm từ sáo rỗng AI bằng hình ảnh văn học tinh tế">
                ✨ Khử sáo rỗng tự động ${totalCliches > 0 ? `(${totalCliches})` : ''}
              </button>
              <button type="button" data-diff-batch-action="UNDO_LAST_DECISION" ${
                canUndoDecision ? '' : 'disabled'
              } class="px-2.5 py-1 rounded-lg border ${
                canUndoDecision
                  ? 'border-indigo-500/50 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300'
                  : 'border-zinc-800 bg-zinc-900 text-zinc-600 cursor-not-allowed'
              } font-bold text-[11px] transition" title="Hoàn tác thao tác Chấp nhận / Từ chối / Sửa đoạn vừa thực hiện">
                ↩️ Hoàn tác thao tác đoạn (${this.undoSegmentDecisionStack.length})
              </button>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800 text-[11px]">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-zinc-400 font-bold">Chế độ hiển thị:</span>
              <button type="button" data-diff-filter="ALL" class="px-2.5 py-0.5 rounded-lg font-bold transition ${
                this.filterMode === 'ALL'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }">Tất cả đoạn</button>
              <button type="button" data-diff-filter="ONLY_AI" class="px-2.5 py-0.5 rounded-lg font-bold transition ${
                this.filterMode === 'ONLY_AI'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }">Chỉ hiện đoạn AI (${aiSegments.length})</button>
              <button type="button" data-diff-filter="NEEDS_POLISH" class="px-2.5 py-0.5 rounded-lg font-bold transition ${
                this.filterMode === 'NEEDS_POLISH'
                  ? 'bg-amber-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }">Đoạn cần chuốt lại (${totalCliches + totalNonStdDialogue})</button>
            </div>

            <div class="flex items-center gap-2">
              <button type="button" data-diff-batch-action="TOGGLE_QUALITY_BADGES" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold">
                ${this.showQualityBadges ? '👁️ Ẩn nhãn phân tích ngũ quan' : '👁️ Hiện nhãn phân tích ngũ quan'}
              </button>
            </div>
          </div>
        </div>
      `;
    }

    /**
     * Dựng đoạn văn do Người viết (HUMAN) với màu chữ chuẩn của bản thảo
     */
    buildHumanSegmentHtml(seg, idx) {
      return `
        <div class="group relative mb-4 p-3 rounded-xl border border-transparent hover:border-zinc-800/80 transition" data-human-seg-box="${this.utils.escapeHtml(
          seg.id
        )}">
          <div class="hidden group-hover:flex items-center justify-between text-[10px] font-sansUI text-zinc-500 mb-1 select-none">
            <span>✍️ Đoạn chính thức của tác giả #${idx + 1} (${this.utils.countVietnameseWords(
              seg.text
            )} từ)</span>
            <button type="button" data-reopen-ai-review="${this.utils.escapeHtml(
              seg.id
            )}" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold">
              🔄 Chuyển lại sang trạng thái chờ duyệt
            </button>
          </div>
          <div class="text-studioLightText dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">${this.utils.escapeHtml(
            seg.text
          )}</div>
        </div>
      `;
    }

    /**
     * Dựng Thẻ Kiểm Duyệt Đoạn AI viết (Tô màu xanh ngọc Emerald đặc trưng kèm đầy đủ nút thao tác)
     */
    buildAISegmentCardHtml(chap, seg, idx, aiOrderNum, analysis) {
      const segIdEsc = this.utils.escapeHtml(seg.id);
      const isEditingInline = this.activeInlineEditorSegId === seg.id;
      const isComparingDiff = this.activeDiffCompareSegId === seg.id;
      const hasBeenEdited =
        seg.originalAiText && seg.originalAiText.trim() !== seg.text.trim();
      const comments = this.revisionLedger.getCommentsForSegment(chap.id, seg.id);

      // Các huy hiệu ngũ quan & cảnh báo từ sáo rỗng
      let badgesHtml = '';
      if (this.showQualityBadges) {
        const sensePills = analysis.sensesDetected
          .map(
            (s) =>
              `<span class="px-1.5 py-0.5 rounded bg-teal-500/20 border border-teal-500/40 text-teal-200 text-[10px]" title="Từ ngữ ngũ quan: ${this.utils.escapeHtml(
                s.matches.join(', ')
              )}">${s.icon} ${s.name}</span>`
          )
          .join('');

        const clichePills = analysis.clichesFound
          .map(
            (cl) =>
              `<span class="px-1.5 py-0.5 rounded bg-rose-500/25 border border-rose-500/50 text-rose-200 text-[10px] font-bold" title="Gợi ý thay thế: ${this.utils.escapeHtml(
                cl.suggestion
              )}">🚫 Sáo rỗng: "${this.utils.escapeHtml(cl.phrase)}"</span>`
          )
          .join('');

        const dialoguePill = analysis.dialogueInfo.hasDialogue
          ? analysis.dialogueInfo.isStandardFormat
            ? `<span class="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-[10px]">💬 Thoại chuẩn (${this.utils.escapeHtml(
                analysis.dialogueInfo.speakerName || 'NV'
              )})</span>`
            : `<button type="button" data-fix-seg-dialogue="${segIdEsc}" class="px-1.5 py-0.5 rounded bg-amber-500/25 border border-amber-400 text-amber-200 text-[10px] font-bold hover:bg-amber-500/40" title="Bấm để tự động chuẩn hóa về dạng: - Câu thoại (Tên nhân vật)">⚠️ Chuẩn hóa thoại ngay</button>`
          : '';

        badgesHtml = `
          <div class="flex flex-wrap items-center gap-1.5 mb-2 font-sansUI select-none">
            <span class="px-1.5 py-0.5 rounded bg-zinc-900/90 border border-zinc-700 ${analysis.pacingColor} text-[10px] font-semibold">
              ${analysis.pacingLabel} (~${analysis.avgSentenceWords} từ/câu)
            </span>
            ${sensePills}
            ${dialoguePill}
            ${clichePills}
            ${
              hasBeenEdited
                ? `<button type="button" data-compare-seg-diff="${segIdEsc}" class="px-1.5 py-0.5 rounded bg-indigo-500/25 border border-indigo-400 text-indigo-200 text-[10px] font-bold hover:bg-indigo-500/40">🔍 Xem vết sửa LCS Diff</button>`
                : ''
            }
          </div>
        `;
      }

      // Nội dung chính hoặc khung sửa trực tiếp hoặc khung so sánh vết sửa LCS
      let bodySectionHtml = '';
      if (isEditingInline) {
        bodySectionHtml = `
          <div class="mt-2 space-y-2 font-sansUI">
            <textarea id="inline-seg-editor-${segIdEsc}" rows="5" class="w-full p-3 rounded-xl border-2 border-amber-400 bg-zinc-950 text-emerald-100 font-serifNovel text-sm leading-relaxed focus:outline-none">${this.utils.escapeHtml(
              seg.text
            )}</textarea>
            <div class="flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <div class="flex items-center gap-1.5 flex-wrap">
                <button type="button" data-inline-save-accept="${segIdEsc}" class="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold">
                  💾 Lưu & Chấp nhận thành văn bản chính thức
                </button>
                <button type="button" data-inline-save-keep-ai="${segIdEsc}" class="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold">
                  ✏️ Lưu bản sửa (Giữ màu AI để duyệt tiếp)
                </button>
                <button type="button" data-inline-split-seg="${segIdEsc}" class="px-2.5 py-1.5 rounded-lg border border-indigo-400/50 bg-indigo-500/15 hover:bg-indigo-500/30 text-indigo-200 font-bold" title="Tách đoạn văn này làm 2 đoạn độc lập theo dòng xuống hàng">
                  ✂️ Tách làm 2 đoạn
                </button>
              </div>
              <button type="button" data-inline-cancel-edit="${segIdEsc}" class="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold">
                Hủy
              </button>
            </div>
          </div>
        `;
      } else if (isComparingDiff && seg.originalAiText) {
        const diffResult = MyersAndLCSWordDiffEngine.renderDiffToHtml(
          seg.originalAiText,
          seg.text,
          (s) => this.utils.escapeHtml(s)
        );
        bodySectionHtml = `
          <div class="p-3 rounded-xl border border-indigo-500/40 bg-zinc-950/90 space-y-2">
            <div class="flex items-center justify-between font-sansUI text-[11px] text-indigo-300 border-b border-zinc-800 pb-1.5">
              <span>🔍 <strong>So sánh vết sửa từng từ (LCS Word Diff):</strong> +${diffResult.insertedWords} từ mới / -${diffResult.deletedWords} từ xóa</span>
              <button type="button" data-compare-seg-diff="${segIdEsc}" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold">Đóng so sánh</button>
            </div>
            <div class="leading-relaxed whitespace-pre-wrap">${diffResult.html}</div>
          </div>
        `;
      } else {
        bodySectionHtml = `
          <div class="text-emerald-700 dark:text-emerald-200 leading-relaxed whitespace-pre-wrap">${this.utils.escapeHtml(
            seg.text
          )}</div>
        `;
      }

      // Danh sách ghi chú bên lề nếu có
      const commentsHtml =
        comments.length > 0
          ? `<div class="mt-2.5 pt-2 border-t border-emerald-500/20 space-y-1 font-sansUI text-[11px]">
              ${comments
                .map(
                  (c) => `
                  <div class="flex items-center justify-between gap-2 px-2.5 py-1 rounded-lg bg-zinc-900/90 border border-amber-500/30 text-amber-200">
                    <span>📌 <strong>${this.utils.escapeHtml(c.author)}:</strong> ${this.utils.escapeHtml(
                      c.text
                    )}</span>
                    <button type="button" data-del-seg-comment="${segIdEsc}" data-comment-id="${this.utils.escapeHtml(
                      c.id
                    )}" class="text-zinc-400 hover:text-rose-400 font-bold">✕</button>
                  </div>
                `
                )
                .join('')}
            </div>`
          : '';

      return `
        <div class="mb-4 p-3.5 rounded-2xl border-2 border-emerald-500/60 bg-emerald-500/10 dark:bg-emerald-950/40 transition shadow-sm" data-ai-seg-box="${segIdEsc}">
          <div class="flex flex-wrap items-center justify-between gap-2 mb-2 pb-1.5 border-b border-emerald-500/30 font-sansUI text-[11px]">
            <span class="font-extrabold text-emerald-400 flex items-center gap-1.5 flex-wrap">
              <span>🤖 Đoạn do AI viết #${idx + 1}</span>
              <span class="font-monoCode text-[10px] text-emerald-300/80">(${analysis.wordCount} từ • ${
        analysis.sentenceCount
      } câu)</span>
              <span class="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-monoCode text-[10px]">Điểm văn phong: ${
                analysis.qualityScore
              }/100</span>
            </span>
            <div class="flex items-center gap-1.5 flex-wrap">
              <button type="button" data-accept-seg="${segIdEsc}" class="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold transition">
                ✓ Chấp nhận đoạn này
              </button>
              <button type="button" data-edit-seg="${segIdEsc}" class="px-2.5 py-1 rounded-lg border border-amber-400/50 bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 font-bold transition">
                ✏️ Sửa nhanh
              </button>
              <button type="button" data-inline-open-edit="${segIdEsc}" class="px-2 py-1 rounded-lg border border-indigo-400/40 bg-indigo-500/15 hover:bg-indigo-500/30 text-indigo-200 font-bold transition" title="Mở khung soạn thảo nhiều dòng ngay trong thẻ này">
                📝 Sửa tại chỗ
              </button>
              <button type="button" data-add-seg-comment="${segIdEsc}" class="px-2 py-1 rounded-lg border border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 font-semibold transition" title="Gắn ghi chú bên lề cho đoạn này">
                📌 Ghi chú
              </button>
              <button type="button" data-reject-seg="${segIdEsc}" class="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-extrabold transition">
                ✕ Từ chối (Xóa đoạn này)
              </button>
            </div>
          </div>
          ${badgesHtml}
          ${bodySectionHtml}
          ${commentsHtml}
        </div>
      `;
    }

    /**
     * Gắn toàn bộ sự kiện tương tác cho các nút trên từng đoạn văn trong Bề mặt duyệt
     */
    bindReviewSurfaceCardEvents(surface, chap) {
      if (!surface || !chap) return;

      // 1. Nút Chấp nhận đoạn
      surface.querySelectorAll('[data-accept-seg]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.acceptSegment(chap.id, btn.getAttribute('data-accept-seg'));
        });
      });

      // 2. Nút Từ chối đoạn
      surface.querySelectorAll('[data-reject-seg]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.rejectSegment(chap.id, btn.getAttribute('data-reject-seg'));
        });
      });

      // 3. Nút Sửa nhanh (Prompt chuẩn tương thích ngược + cập nhật lịch sử)
      surface.querySelectorAll('[data-edit-seg]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.editSingleSegment(chap.id, btn.getAttribute('data-edit-seg'));
        });
      });

      // 4. Nút Mở khung Sửa tại chỗ nhiều dòng (Inline Textarea)
      surface.querySelectorAll('[data-inline-open-edit]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const segId = btn.getAttribute('data-inline-open-edit');
          this.activeInlineEditorSegId =
            this.activeInlineEditorSegId === segId ? null : segId;
          this.refreshReviewSurfaceForActiveChapter();
        });
      });

      // 5. Lưu sửa tại chỗ & Chấp nhận thành HUMAN
      surface.querySelectorAll('[data-inline-save-accept]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const segId = btn.getAttribute('data-inline-save-accept');
          const box = document.getElementById(`inline-seg-editor-${segId}`);
          if (box) {
            this.applyInlineSegmentEdit(chap.id, segId, box.value, true);
          }
        });
      });

      // 6. Lưu sửa tại chỗ nhưng giữ màu AI để rà soát tiếp
      surface.querySelectorAll('[data-inline-save-keep-ai]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const segId = btn.getAttribute('data-inline-save-keep-ai');
          const box = document.getElementById(`inline-seg-editor-${segId}`);
          if (box) {
            this.applyInlineSegmentEdit(chap.id, segId, box.value, false);
          }
        });
      });

      // 7. Tách 1 đoạn văn dài thành 2 đoạn độc lập
      surface.querySelectorAll('[data-inline-split-seg]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const segId = btn.getAttribute('data-inline-split-seg');
          const box = document.getElementById(`inline-seg-editor-${segId}`);
          this.splitSegmentInTwo(chap.id, segId, box ? box.value : null);
        });
      });

      // 8. Hủy sửa tại chỗ
      surface.querySelectorAll('[data-inline-cancel-edit]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.activeInlineEditorSegId = null;
          this.refreshReviewSurfaceForActiveChapter();
        });
      });

      // 9. Chuẩn hóa câu thoại cho riêng 1 đoạn
      surface.querySelectorAll('[data-fix-seg-dialogue]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const segId = btn.getAttribute('data-fix-seg-dialogue');
          this.normalizeSingleSegmentDialogue(chap.id, segId);
        });
      });

      // 10. Bật/tắt chế độ xem vết sửa từng từ LCS Word Diff
      surface.querySelectorAll('[data-compare-seg-diff]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const segId = btn.getAttribute('data-compare-seg-diff');
          this.activeDiffCompareSegId =
            this.activeDiffCompareSegId === segId ? null : segId;
          this.refreshReviewSurfaceForActiveChapter();
        });
      });

      // 11. Thêm ghi chú bên lề cho đoạn
      surface.querySelectorAll('[data-add-seg-comment]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const segId = btn.getAttribute('data-add-seg-comment');
          const note = window.prompt(
            'Nhập ghi chú biên tập cho đoạn văn này (Ví dụ: Cần bổ sung chi tiết ánh mắt của Lâm Phong):'
          );
          if (note && note.trim()) {
            this.revisionLedger.addMarginComment(chap.id, segId, note.trim());
            this.refreshReviewSurfaceForActiveChapter();
            this.utils.showToast('📌 Đã gắn ghi chú biên tập vào đoạn văn!', 'info', 2000);
          }
        });
      });

      // 12. Xóa ghi chú bên lề
      surface.querySelectorAll('[data-del-seg-comment]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const segId = btn.getAttribute('data-del-seg-comment');
          const cid = btn.getAttribute('data-comment-id');
          this.revisionLedger.deleteMarginComment(chap.id, segId, cid);
          this.refreshReviewSurfaceForActiveChapter();
        });
      });

      // 13. Chuyển lại 1 đoạn HUMAN sang trạng thái chờ duyệt AI nếu tác giả muốn duyệt lại
      surface.querySelectorAll('[data-reopen-ai-review]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const segId = btn.getAttribute('data-reopen-ai-review');
          this.reopenHumanSegmentAsAI(chap.id, segId);
        });
      });

      // 14. Các nút lọc (ALL / ONLY_AI / NEEDS_POLISH)
      surface.querySelectorAll('[data-diff-filter]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.filterMode = btn.getAttribute('data-diff-filter') || 'ALL';
          this.persistDiffState();
          this.refreshReviewSurfaceForActiveChapter();
        });
      });

      // 15. Các thao tác hàng loạt trên thanh tổng quan phụ
      surface.querySelectorAll('[data-diff-batch-action]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const action = btn.getAttribute('data-diff-batch-action');
          if (action === 'NORMALIZE_ALL_DIALOGUE') {
            this.normalizeAllAIDialoguesInChapter(chap.id);
          } else if (action === 'POLISH_ALL_CLICHES') {
            this.autoPolishAllAIClichesInChapter(chap.id);
          } else if (action === 'UNDO_LAST_DECISION') {
            this.undoLastSegmentDecision(chap.id);
          } else if (action === 'TOGGLE_QUALITY_BADGES') {
            this.showQualityBadges = !this.showQualityBadges;
            this.persistDiffState();
            this.refreshReviewSurfaceForActiveChapter();
          }
        });
      });
    }

    /**
     * Lưu快照 trạng thái segments của chương vào ngăn xếp hoàn tác nội bộ trước khi chấp nhận/từ chối/sửa
     */
    pushSegmentUndoSnapshot(chapterId) {
      const state = this.chapterDiffMap[chapterId];
      if (!state || !Array.isArray(state.segments)) return;
      this.undoSegmentDecisionStack.push({
        chapterId,
        segmentsSnapshot: JSON.parse(JSON.stringify(state.segments)),
        timestamp: Date.now()
      });
      if (this.undoSegmentDecisionStack.length > 30) {
        this.undoSegmentDecisionStack.shift();
      }
    }

    /**
     * Hoàn tác quyết định duyệt đoạn gần nhất (ví dụ lỡ bấm Từ chối 1 đoạn AI)
     */
    undoLastSegmentDecision(chapterId) {
      const last = this.undoSegmentDecisionStack.pop();
      if (!last) {
        this.utils.showToast('↩️ Không còn thao tác duyệt đoạn nào để hoàn tác.', 'info', 2000);
        return;
      }
      const targetChapId = last.chapterId || chapterId;
      if (!this.chapterDiffMap[targetChapId]) {
        this.chapterDiffMap[targetChapId] = {
          originalText: '',
          mode: 'APPEND',
          createdAt: Date.now(),
          segments: last.segmentsSnapshot
        };
      } else {
        this.chapterDiffMap[targetChapId].segments = last.segmentsSnapshot;
      }
      this.persistDiffState();
      this.syncSegmentsToChapterContent(targetChapId);
      this.refreshReviewSurfaceForActiveChapter();
      this.utils.showToast('↩️ Đã khôi phục lại đoạn văn vừa thao tác!', 'success', 2200);
    }

    /**
     * Chấp nhận 1 đoạn AI thành văn bản chính thức (HUMAN)
     */
    acceptSegment(chapterId, segId) {
      const state = this.chapterDiffMap[chapterId];
      if (!state || !Array.isArray(state.segments)) return;
      const seg = state.segments.find((s) => s.id === segId);
      if (!seg) return;

      this.pushSegmentUndoSnapshot(chapterId);
      seg.type = 'HUMAN';
      seg.acceptedAt = Date.now();

      this.revisionLedger.recordDecision({
        chapterId,
        segmentId: segId,
        actionType: 'ACCEPT_SEGMENT',
        beforeText: seg.originalAiText || seg.text,
        afterText: seg.text,
        note: 'Chấp nhận đoạn AI vào bản thảo chính thức'
      });

      this.persistDiffState();
      this.syncSegmentsToChapterContent(chapterId);
      this.refreshReviewSurfaceForActiveChapter();
      this.utils.showToast('✓ Đã chấp nhận đoạn văn AI vào bản thảo chính thức!', 'success', 2000);
    }

    /**
     * Từ chối và xóa bỏ 1 đoạn AI khỏi bản thảo
     */
    rejectSegment(chapterId, segId) {
      const state = this.chapterDiffMap[chapterId];
      if (!state || !Array.isArray(state.segments)) return;
      const targetSeg = state.segments.find((s) => s.id === segId);
      if (!targetSeg) return;

      this.pushSegmentUndoSnapshot(chapterId);
      state.segments = state.segments.filter((s) => s.id !== segId);

      this.revisionLedger.recordDecision({
        chapterId,
        segmentId: segId,
        actionType: 'REJECT_SEGMENT',
        beforeText: targetSeg.text,
        afterText: '',
        note: 'Từ chối và loại bỏ đoạn AI'
      });

      this.persistDiffState();
      this.syncSegmentsToChapterContent(chapterId);
      this.refreshReviewSurfaceForActiveChapter();
      this.utils.showToast(
        '✕ Đã từ chối và loại bỏ đoạn văn AI đó khỏi bản thảo.',
        'info',
        2000
      );
    }

    /**
     * Sửa nhanh 1 đoạn AI và chấp nhận thành văn bản chính thức
     */
    editSingleSegment(chapterId, segId) {
      const state = this.chapterDiffMap[chapterId];
      if (!state || !Array.isArray(state.segments)) return;
      const seg = state.segments.find((s) => s.id === segId);
      if (!seg) return;

      const edited = window.prompt(
        'Chỉnh sửa nội dung đoạn văn này (Sau khi sửa sẽ được chấp nhận thành văn bản chính thức):',
        seg.text
      );
      if (edited !== null) {
        const cleanEdited = edited.trim();
        if (!cleanEdited) {
          this.rejectSegment(chapterId, segId);
          return;
        }
        this.pushSegmentUndoSnapshot(chapterId);
        const beforeText = seg.text;
        seg.text = cleanEdited;
        seg.type = 'HUMAN';
        seg.editedCount = (seg.editedCount || 0) + 1;

        if (!Array.isArray(seg.revisionHistory)) seg.revisionHistory = [];
        seg.revisionHistory.push({
          version: seg.revisionHistory.length + 1,
          label: 'Tác giả sửa nhanh & chấp nhận',
          text: cleanEdited,
          timestamp: Date.now()
        });

        this.revisionLedger.recordDecision({
          chapterId,
          segmentId: segId,
          actionType: 'QUICK_EDIT_ACCEPT',
          beforeText,
          afterText: cleanEdited,
          note: 'Sửa nhanh và chấp nhận đoạn văn'
        });

        this.persistDiffState();
        this.syncSegmentsToChapterContent(chapterId);
        this.refreshReviewSurfaceForActiveChapter();
        this.utils.showToast('✏️ Đã cập nhật và chấp nhận đoạn văn vừa sửa!', 'success', 2200);
      }
    }

    /**
     * Áp dụng nội dung sửa từ khung soạn thảo nhiều dòng tại chỗ (Inline Editor)
     */
    applyInlineSegmentEdit(chapterId, segId, newText, acceptImmediately = true) {
      const state = this.chapterDiffMap[chapterId];
      if (!state || !Array.isArray(state.segments)) return;
      const seg = state.segments.find((s) => s.id === segId);
      if (!seg) return;

      const clean = String(newText || '').trim();
      if (!clean) {
        this.rejectSegment(chapterId, segId);
        return;
      }

      this.pushSegmentUndoSnapshot(chapterId);
      const oldText = seg.text;
      if (!seg.originalAiText) seg.originalAiText = oldText;
      seg.text = clean;
      seg.editedCount = (seg.editedCount || 0) + 1;
      if (acceptImmediately) {
        seg.type = 'HUMAN';
      }

      this.activeInlineEditorSegId = null;
      this.revisionLedger.recordDecision({
        chapterId,
        segmentId: segId,
        actionType: acceptImmediately ? 'INLINE_EDIT_ACCEPT' : 'INLINE_EDIT_KEEP_AI',
        beforeText: oldText,
        afterText: clean
      });

      this.persistDiffState();
      this.syncSegmentsToChapterContent(chapterId);
      this.refreshReviewSurfaceForActiveChapter();
      this.utils.showToast(
        acceptImmediately
          ? '💾 Đã lưu chỉnh sửa và đưa đoạn văn vào bản thảo chính thức!'
          : '✏️ Đã lưu chỉnh sửa (Bạn có thể bấm Xem vết sửa LCS Diff trên thẻ)!',
        'success',
        2400
      );
    }

    /**
     * Tách 1 đoạn AI thành các đoạn nhỏ hơn theo dấu xuống dòng
     */
    splitSegmentInTwo(chapterId, segId, overrideText = null) {
      const state = this.chapterDiffMap[chapterId];
      if (!state || !Array.isArray(state.segments)) return;
      const idx = state.segments.findIndex((s) => s.id === segId);
      if (idx === -1) return;

      const seg = state.segments[idx];
      const sourceText = String(overrideText !== null ? overrideText : seg.text || '').trim();
      let parts = sourceText
        .split(/\r?\n+/)
        .map((p) => p.trim())
        .filter(Boolean);

      // Nếu đoạn văn không có dấu xuống dòng, tự động tách ở giữa số câu
      if (parts.length < 2) {
        const sents = VietnameseSentenceAndWordTokenizer.splitIntoSentences(sourceText);
        if (sents.length < 2) {
          this.utils.showToast(
            '⚠️ Đoạn văn này chỉ có 1 câu nên không thể tách nhỏ hơn.',
            'warning'
          );
          return;
        }
        const half = Math.ceil(sents.length / 2);
        parts = [sents.slice(0, half).join(' '), sents.slice(half).join(' ')];
      }

      this.pushSegmentUndoSnapshot(chapterId);
      const now = Date.now();
      const newSegs = parts.map((pText, pIdx) => ({
        id: `${seg.id}_part${pIdx + 1}_${now}`,
        type: 'AI',
        text: pText,
        originalAiText: pText,
        createdAt: now + pIdx
      }));

      state.segments.splice(idx, 1, ...newSegs);
      this.activeInlineEditorSegId = null;
      this.persistDiffState();
      this.syncSegmentsToChapterContent(chapterId);
      this.refreshReviewSurfaceForActiveChapter();
      this.utils.showToast(
        `✂️ Đã tách thành ${newSegs.length} đoạn độc lập để bạn duyệt dễ dàng hơn!`,
        'info',
        2400
      );
    }

    /**
     * Chuẩn hóa câu thoại cho 1 đoạn văn AI về dạng "- Câu thoại (Tên nhân vật)"
     */
    normalizeSingleSegmentDialogue(chapterId, segId) {
      const state = this.chapterDiffMap[chapterId];
      if (!state || !Array.isArray(state.segments)) return;
      const seg = state.segments.find((s) => s.id === segId);
      if (!seg) return;

      const defaultSpeaker =
        window.NoirStudio?.storyBible?.characters?.[0]?.name || 'Nhân vật chính';
      const normalized = VietnameseSentenceAndWordTokenizer.normalizeParagraphDialogue(
        seg.text,
        defaultSpeaker
      );

      if (normalized === seg.text) {
        this.utils.showToast('💬 Câu thoại trong đoạn này đã ở định dạng chuẩn!', 'info', 2000);
        return;
      }

      this.pushSegmentUndoSnapshot(chapterId);
      if (!seg.originalAiText) seg.originalAiText = seg.text;
      seg.text = normalized;
      this.persistDiffState();
      this.syncSegmentsToChapterContent(chapterId);
      this.refreshReviewSurfaceForActiveChapter();
      this.utils.showToast(
        '🧹 Đã chuẩn hóa câu thoại về định dạng "- Câu thoại (Tên nhân vật)"!',
        'success',
        2200
      );
    }

    /**
     * Chuẩn hóa câu thoại cho toàn bộ các đoạn AI đang chờ duyệt trong chương
     */
    normalizeAllAIDialoguesInChapter(chapterId) {
      const state = this.chapterDiffMap[chapterId];
      if (!state || !Array.isArray(state.segments)) return;

      const defaultSpeaker =
        window.NoirStudio?.storyBible?.characters?.[0]?.name || 'Nhân vật chính';
      let changedCount = 0;

      this.pushSegmentUndoSnapshot(chapterId);
      state.segments.forEach((seg) => {
        if (seg && seg.type === 'AI') {
          const next = VietnameseSentenceAndWordTokenizer.normalizeParagraphDialogue(
            seg.text,
            defaultSpeaker
          );
          if (next !== seg.text) {
            if (!seg.originalAiText) seg.originalAiText = seg.text;
            seg.text = next;
            changedCount += 1;
          }
        }
      });

      this.persistDiffState();
      this.syncSegmentsToChapterContent(chapterId);
      this.refreshReviewSurfaceForActiveChapter();
      this.utils.showToast(
        changedCount > 0
          ? `🧹 Đã chuẩn hóa hội thoại cho ${changedCount} đoạn văn AI!`
          : '✅ Toàn bộ câu thoại trong các đoạn AI đã đúng định dạng chuẩn!',
        'success',
        2500
      );
    }

    /**
     * Tự động khử các cụm từ sáo rỗng trong toàn bộ các đoạn AI đang chờ duyệt
     */
    autoPolishAllAIClichesInChapter(chapterId) {
      const state = this.chapterDiffMap[chapterId];
      if (!state || !Array.isArray(state.segments)) return;

      let totalReplaced = 0;
      this.pushSegmentUndoSnapshot(chapterId);

      state.segments.forEach((seg) => {
        if (seg && seg.type === 'AI') {
          const res = ProseQualityAndStyleAnalyzerForDiff.autoPolishClichesInSegment(seg.text);
          if (res.replacedCount > 0) {
            if (!seg.originalAiText) seg.originalAiText = seg.text;
            seg.text = res.text;
            totalReplaced += res.replacedCount;
          }
        }
      });

      this.persistDiffState();
      this.syncSegmentsToChapterContent(chapterId);
      this.refreshReviewSurfaceForActiveChapter();
      this.utils.showToast(
        totalReplaced > 0
          ? `✨ Đã tự động chuốt lại ${totalReplaced} cụm từ sáo rỗng bằng hình ảnh văn học tinh tế!`
          : '✅ Không phát hiện cụm từ sáo rỗng phổ biến nào cần thay thế.',
        'success',
        2800
      );
    }

    /**
     * Đưa 1 đoạn văn HUMAN trở lại trạng thái chờ duyệt AI
     */
    reopenHumanSegmentAsAI(chapterId, segId) {
      const state = this.chapterDiffMap[chapterId];
      if (!state || !Array.isArray(state.segments)) return;
      const seg = state.segments.find((s) => s.id === segId);
      if (!seg) return;

      this.pushSegmentUndoSnapshot(chapterId);
      seg.type = 'AI';
      if (!seg.originalAiText) seg.originalAiText = seg.text;
      this.persistDiffState();
      this.refreshReviewSurfaceForActiveChapter();
    }

    /**
     * Chấp nhận toàn bộ các đoạn AI đang chờ duyệt trong chương hiện tại
     */
    acceptAllForActiveChapter() {
      const chap = this.chapterMgr ? this.chapterMgr.getActiveChapter() : null;
      if (!chap || !this.chapterDiffMap[chap.id]) return;

      const aiCount = (this.chapterDiffMap[chap.id].segments || []).filter(
        (s) => s && s.type === 'AI'
      ).length;

      this.syncSegmentsToChapterContent(chap.id);
      this.revisionLedger.recordDecision({
        chapterId: chap.id,
        chapterTitle: chap.displayTitle || chap.title,
        segmentId: 'ALL_SEGMENTS',
        actionType: 'ACCEPT_ALL_AI',
        beforeText: `${aiCount} đoạn AI chờ duyệt`,
        afterText: chap.content.slice(-500),
        note: `Chấp nhận toàn bộ ${aiCount} đoạn AI vào bản thảo chính thức`
      });

      delete this.chapterDiffMap[chap.id];
      this.isManualEditOverride = false;
      this.activeInlineEditorSegId = null;
      this.activeDiffCompareSegId = null;
      this.persistDiffState();
      this.refreshReviewSurfaceForActiveChapter();

      this.utils.showToast(
        '✅ Đã chấp nhận toàn bộ đoạn văn AI bổ sung vào bản thảo chính thức!',
        'success'
      );
    }

    /**
     * Từ chối toàn bộ phần AI mới thêm và hoàn nguyên bản thảo gốc của tác giả
     */
    rejectAllForActiveChapter() {
      const chap = this.chapterMgr ? this.chapterMgr.getActiveChapter() : null;
      if (!chap || !this.chapterDiffMap[chap.id]) return;

      const state = this.chapterDiffMap[chap.id];
      const restored = state.originalText ?? '';

      this.revisionLedger.recordDecision({
        chapterId: chap.id,
        chapterTitle: chap.displayTitle || chap.title,
        segmentId: 'ALL_SEGMENTS',
        actionType: 'REJECT_ALL_RESTORE',
        beforeText: chap.content.slice(-500),
        afterText: restored.slice(-500),
        note: 'Từ chối toàn bộ phần AI và hoàn nguyên bản thảo gốc'
      });

      chap.content = restored;
      chap.wordCount = this.utils.countVietnameseWords(restored);
      const editor = document.getElementById('textarea-chapter-content');
      if (editor) editor.value = restored;
      if (this.chapterMgr && typeof this.chapterMgr.updateLiveWordStatsUI === 'function') {
        this.chapterMgr.updateLiveWordStatsUI(restored);
      }

      delete this.chapterDiffMap[chap.id];
      this.isManualEditOverride = false;
      this.activeInlineEditorSegId = null;
      this.activeDiffCompareSegId = null;
      this.persistDiffState();
      this.refreshReviewSurfaceForActiveChapter();

      if (this.autoSaver && typeof this.autoSaver.triggerSave === 'function') {
        this.autoSaver.triggerSave(false);
      }

      this.utils.showToast(
        '↩️ Đã từ chối toàn bộ phần AI vừa thêm và hoàn nguyên bản thảo gốc của bạn!',
        'warning'
      );
    }

    /**
     * Chuyển đổi giữa Chế độ Xem màu phân biệt AI / Người viết và Sửa tay trực tiếp trong Textarea
     */
    toggleManualEditView() {
      const chap = this.chapterMgr ? this.chapterMgr.getActiveChapter() : null;
      if (!chap || !this.chapterDiffMap[chap.id]) return;

      if (this.isManualEditOverride) {
        // Nếu tác giả vừa sửa tay trong textarea, đồng bộ lại với danh sách đoạn
        const editor = document.getElementById('textarea-chapter-content');
        if (editor) {
          chap.content = editor.value;
          this.reconcileManualTextareaEditsIntoSegments(chap.id, editor.value);
        }
        this.isManualEditOverride = false;
      } else {
        this.isManualEditOverride = true;
      }
      this.refreshReviewSurfaceForActiveChapter();
    }

    /**
     * Khi tác giả chuyển sang "Sửa tay trực tiếp" trên Textarea rồi quay lại chế độ xem màu,
     * đối chiếu thông minh các đoạn trong Textarea với các đoạn AI/HUMAN đã biết để giữ nguyên màu đánh dấu!
     */
    reconcileManualTextareaEditsIntoSegments(chapterId, fullEditedText) {
      const state = this.chapterDiffMap[chapterId];
      if (!state || !Array.isArray(state.segments)) return;

      const editedParas =
        VietnameseSentenceAndWordTokenizer.splitIntoParagraphs(fullEditedText);
      if (editedParas.length === 0) {
        state.segments = [];
        this.persistDiffState();
        return;
      }

      const oldAiTexts = new Set(
        state.segments
          .filter((s) => s && s.type === 'AI')
          .map((s) => s.text.trim())
      );

      const now = Date.now();
      const updatedSegments = editedParas.map((para, idx) => {
        const trimmed = para.trim();
        // Tìm xem đoạn này có khớp hoàn toàn hoặc khớp >= 65% từ đầu với 1 đoạn AI cũ không
        let matchedAiSeg = state.segments.find(
          (s) => s && s.type === 'AI' && s.text.trim() === trimmed
        );

        if (!matchedAiSeg) {
          const prefix = trimmed.slice(0, Math.min(48, Math.floor(trimmed.length * 0.65)));
          if (prefix.length >= 18) {
            matchedAiSeg = state.segments.find(
              (s) => s && s.type === 'AI' && s.text.trim().startsWith(prefix)
            );
          }
        }

        if (matchedAiSeg || oldAiTexts.has(trimmed)) {
          return {
            id: matchedAiSeg ? matchedAiSeg.id : `ai_seg_reconciled_${now}_${idx}`,
            type: 'AI',
            text: trimmed,
            originalAiText: matchedAiSeg?.originalAiText || matchedAiSeg?.text || trimmed,
            createdAt: matchedAiSeg?.createdAt || now
          };
        }

        return {
          id: `human_seg_reconciled_${now}_${idx}`,
          type: 'HUMAN',
          text: trimmed,
          createdAt: now
        };
      });

      state.segments = updatedSegments;
      this.persistDiffState();
    }
  }

  // ==========================================================================
  // PHẦN 8: KHỞI TẠO ĐỐI TƯỢNG TOÀN CỤC & ĐĂNG KÝ VÀO WINDOW.NOIRSTUDIO
  // ==========================================================================
  const aiDiffEngine = new GoogleDocsStyleAIDiffEngine(
    window.NoirStudio?.idb || null,
    window.NoirStudio?.chapterManager || null,
    window.NoirStudio?.autoSaver || null,
    window.NoirStudio?.versionVault || null,
    window.NoirStudio?.utils || null
  );

  window.GoogleDocsStyleAIDiffEngine = GoogleDocsStyleAIDiffEngine;
  window.MyersAndLCSWordDiffEngine = MyersAndLCSWordDiffEngine;
  window.ProseQualityAndStyleAnalyzerForDiff = ProseQualityAndStyleAnalyzerForDiff;
  window.NoirStudio.aiDiff = aiDiffEngine;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      aiDiffEngine.init();
    });
  } else {
    setTimeout(() => {
      aiDiffEngine.init();
    }, 0);
  }
})();
