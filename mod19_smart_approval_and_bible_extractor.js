/**
 * ============================================================================
 * MODULE 19: DUYỆT & CHỐT BẢN THẢO THÔNG MINH + TRÍCH XUẤT STORY BIBLE
 * Tệp: mod19_smart_approval_and_bible_extractor.js
 * ============================================================================
 * Nhiệm vụ chuyên biệt:
 *   1. Điều khiển cửa sổ `#modal-approve-chapter-smart` (KHÔNG chứa cửa sổ đầu ra
 *      dư thừa bên trong; chỉ hiển thị danh sách chương cần chốt và nút chạy).
 *   2. Trước khi chốt duyệt: rà soát xem còn đoạn AI chưa duyệt màu Google Docs
 *      hay không, tự động tạo mốc Time-Machine (`CHAPTER_APPROVED`) để tác giả
 *      an toàn tuyệt đối 100%.
 *   3. Khi bấm "Chạy Tổng Hợp & Chốt Duyệt Bản Thảo Ngay": bật màn hình chờ
 *      toàn cục, chạy phân tích sự kiện/nhân vật/ma trận Ai Biết Gì/phục bút
 *      bằng Gemini AI (nếu có Key) HOẶC bộ tách NLP Tiếng Việt 0 Token (khi offline).
 *   4. Đẩy chương vào trạng thái `APPROVED`, hòa trộn dữ kiện mới vào Story Bible
 *      (Tab 4), tái lập chỉ mục BM25 chống quên (Tab 2), đồng bộ thư mục cục bộ
 *      `02_Chuong_Da_Duyet`, đóng modal và báo thành công gọn gàng.
 * ============================================================================
 */
(function (global) {
  'use strict';

  const NS = (global.NoirStudio = global.NoirStudio || {});

  const APPROVAL_LEDGER_STORAGE_KEY = 'noir_v38_approval_audit_ledger_v1';
  const MAX_APPROVAL_HISTORY_RECORDS = 80;

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
      showToast: () => {},
      showBlockingLoader: () => {},
      hideBlockingLoader: () => {}
    };
  }

  // ==========================================================================
  // LỚP 1: BỘ KIỂM ĐỊNH TIỀN CHỐT DUYỆT (AI DIFF & CHẤT LƯỢNG CHƯƠNG)
  // ==========================================================================
  class PreApprovalAuditAndReadinessChecker {
    checkChaptersReadiness(chapters = []) {
      const utils = getUtils();
      const pendingAiDiffCount =
        NS.aiDiff && typeof NS.aiDiff.getPendingHunksCount === 'function'
          ? NS.aiDiff.getPendingHunksCount()
          : Array.isArray(NS.state?.activeAiDiffHunks)
            ? NS.state.activeAiDiffHunks.length
            : 0;

      const items = [];
      let totalWords = 0;
      let warningCount = 0;

      for (const ch of chapters) {
        const text = String(ch.content || '');
        const words = utils.countVietnameseWords(text);
        totalWords += words;

        const warnings = [];
        if (words === 0) {
          warnings.push('Chương đang trống nội dung');
          warningCount += 1;
        } else if (words < 120) {
          warnings.push(`Nội dung còn rất ngắn (${words} từ)`);
          warningCount += 1;
        }

        const isActive =
          NS.chapterManager?.getActiveChapter?.()?.id === ch.id ||
          NS.state?.activeChapterId === ch.id;
        if (isActive && pendingAiDiffCount > 0) {
          warnings.push(
            `Còn ${pendingAiDiffCount} đoạn AI tô màu chưa bấm Chấp nhận/Từ chối`
          );
          warningCount += 1;
        }

        const hasDialogue = /^\s*[-–—]\s+/m.test(text);
        const paragraphCount = text
          .split(/\n{2,}/)
          .filter((p) => p.trim().length > 0).length;

        items.push({
          chapterId: ch.id,
          title: ch.displayTitle || ch.title || 'Chương không tên',
          status: ch.status || 'DRAFT',
          wordCount: words,
          paragraphCount,
          hasDialogue,
          isActive,
          pendingAiDiffOnChapter: isActive ? pendingAiDiffCount : 0,
          warnings
        });
      }

      return {
        chaptersCount: chapters.length,
        totalWords,
        warningCount,
        hasUnresolvedAiDiff: items.some((it) => it.pendingAiDiffOnChapter > 0),
        items
      };
    }

    autoSettleActiveAiDiffIfRequested() {
      if (NS.aiDiff && typeof NS.aiDiff.acceptAllPendingHunks === 'function') {
        const pending =
          typeof NS.aiDiff.getPendingHunksCount === 'function'
            ? NS.aiDiff.getPendingHunksCount()
            : 0;
        if (pending > 0) {
          NS.aiDiff.acceptAllPendingHunks({ silent: true });
          return pending;
        }
      }
      return 0;
    }
  }

  // ==========================================================================
  // LỚP 2: BỘ TRÍCH XUẤT NLP TIẾNG VIỆT CỤC BỘ (CHẾ ĐỘ 0 TOKEN / OFFLINE)
  // ==========================================================================
  class VietnameseEntityAndClueLocalExtractor {
    extractCharactersFromDialogueAndProse(text, knownNames = []) {
      const content = String(text || '');
      const freq = new Map();

      // 1. Trích từ quy chuẩn thoại `- Câu thoại (Tên nhân vật)`
      const dialogueParenRegex = /^\s*[-–—][^\n]{2,320}\(([^()\n]{2,34})\)\s*$/gm;
      let match;
      while ((match = dialogueParenRegex.exec(content)) !== null) {
        const candidate = match[1].trim().replace(/[,.;:!?]+$/g, '');
        if (this.looksLikeVietnameseProperName(candidate)) {
          freq.set(candidate, (freq.get(candidate) || 0) + 3);
        }
      }

      // 2. Đối chiếu các nhân vật đã biết từ Story Bible
      for (const kn of knownNames) {
        if (!kn || kn.length < 2) continue;
        const escaped = kn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`(?:^|[^\\p{L}])${escaped}(?=$|[^\\p{L}])`, 'giu');
        const hits = content.match(re);
        if (hits && hits.length > 0) {
          freq.set(kn, (freq.get(kn) || 0) + hits.length);
        }
      }

      // 3. Phát hiện cụm 2–3 âm tiết viết hoa (tên riêng tiếng Việt có thể là nhân vật mới)
      const capPhraseRegex =
        /(?:[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼẾỀỂỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴÝỶỸ][a-zàáâãèéêìíòóôõùúăđĩũơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵýỷỹ]{1,12})(?:\s+[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼẾỀỂỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴÝỶỸ][a-zàáâãèéêìíòóôõùúăđĩũơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵýỷỹ]{1,12}){1,2}/g;

      const stoplist = new Set([
        'Chương',
        'Trong',
        'Ngoài',
        'Nhưng',
        'Tuy Nhiên',
        'Bỗng Nhiên',
        'Sài Gòn',
        'Hà Nội',
        'Việt Nam',
        'Đà Lạt',
        'Giữa Lúc',
        'Sau Đó',
        'Trước Khi',
        'Không Gian',
        'Thời Gian'
      ]);

      while ((match = capPhraseRegex.exec(content)) !== null) {
        const phrase = match[0].trim();
        if (!stoplist.has(phrase) && this.looksLikeVietnameseProperName(phrase)) {
          freq.set(phrase, (freq.get(phrase) || 0) + 1);
        }
      }

      return Array.from(freq.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([name, mentions]) => ({
          name,
          mentions,
          isKnown: knownNames.some(
            (k) => k.toLowerCase() === name.toLowerCase()
          )
        }));
    }

    looksLikeVietnameseProperName(raw) {
      const s = String(raw || '').trim();
      if (s.length < 2 || s.length > 34) return false;
      if (/\d/.test(s)) return false;
      const lowerBan = /^(nói nhỏ|thì thầm|cười khẩy|lạnh lùng|gắt lên|đáp lại)$/i;
      if (lowerBan.test(s)) return false;
      return true;
    }

    extractTimeAndSettingAnchors(text) {
      const lines = String(text || '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const timeRegex =
        /(?:\b\d{1,2}[:h]\d{0,2}\b|\b(?:sáng|trưa|chiều|tối|đêm|khuya|nửa đêm|bình minh|hoàng hôn|hôm sau|ngày hôm qua|hai ngày sau|tuần trước|năm ngoái)\b)/i;

      const anchors = [];
      for (const line of lines) {
        if (timeRegex.test(line)) {
          const clean = line.length > 140 ? `${line.slice(0, 137)}...` : line;
          anchors.push(clean);
          if (anchors.length >= 6) break;
        }
      }
      return anchors;
    }

    extractCluesAndMysteryLines(text) {
      const sentences = String(text || '')
        .split(/(?<=[.!?…])\s+|\n+/)
        .map((s) => s.trim())
        .filter((s) => s.length >= 16);

      const clueSignalRegex =
        /(?:bí mật|manh mối|vết xước|vết máu|chìa khóa|mật mã|phong thư|ảnh cũ|lời dối|ẩn giấu|ghi âm|nhật ký|dấu vân tay|đồng hồ dừng|kỳ lạ|nghi ngờ|phản bội|bằng chứng)/i;

      const findings = [];
      for (const sent of sentences) {
        if (clueSignalRegex.test(sent)) {
          findings.push(
            sent.length > 165 ? `${sent.slice(0, 162)}...` : sent
          );
          if (findings.length >= 6) break;
        }
      }
      return findings;
    }

    extractKeyPlotSummaryLines(text, maxLines = 4) {
      const paragraphs = String(text || '')
        .split(/\n{2,}/)
        .map((p) => p.replace(/\s+/g, ' ').trim())
        .filter((p) => p.length > 35 && !/^\s*[-–—]/.test(p));

      if (paragraphs.length === 0) {
        const compact = String(text || '').replace(/\s+/g, ' ').trim();
        return compact ? [compact.slice(0, 180)] : [];
      }

      const picks = [];
      picks.push(paragraphs[0]);
      if (paragraphs.length > 2) {
        picks.push(paragraphs[Math.floor(paragraphs.length / 2)]);
      }
      if (paragraphs.length > 1) {
        picks.push(paragraphs[paragraphs.length - 1]);
      }

      return Array.from(new Set(picks))
        .slice(0, maxLines)
        .map((p) => (p.length > 180 ? `${p.slice(0, 177)}...` : p));
    }

    analyzeChapterOffline(chapter, knownCharacterNames = []) {
      const content = String(chapter?.content || '');
      const title = chapter?.displayTitle || chapter?.title || 'Chương không tên';

      const characters = this.extractCharactersFromDialogueAndProse(
        content,
        knownCharacterNames
      );
      const timeAnchors = this.extractTimeAndSettingAnchors(content);
      const clueLines = this.extractCluesAndMysteryLines(content);
      const plotSummary = this.extractKeyPlotSummaryLines(content, 3);

      const dialogueKnowledgeHints = [];
      for (const ch of characters.slice(0, 4)) {
        if (ch.mentions >= 2) {
          dialogueKnowledgeHints.push({
            character: ch.name,
            knowledge: `Tham gia trực tiếp vào diễn biến của ${title} (xuất hiện ${ch.mentions} lần).`,
            chapterTitle: title
          });
        }
      }

      return {
        engine: 'LOCAL_NLP_0_TOKEN',
        chapterId: chapter?.id,
        chapterTitle: title,
        summaryBullets: plotSummary,
        newCharacters: characters
          .filter((c) => !c.isKnown && c.mentions >= 2)
          .map((c) => ({
            name: c.name,
            role: 'Nhân vật vừa xuất hiện trong bản thảo',
            notes: `Được nhắc ${c.mentions} lần tại ${title}.`
          })),
        activeCharacters: characters.map((c) => c.name),
        knowledgeUpdates: dialogueKnowledgeHints,
        clues: clueLines.map((line) => ({
          title: line.slice(0, 68),
          detail: line,
          originChapter: title,
          status: 'ĐANG TREO'
        })),
        timelineEvents: timeAnchors.map((a) => ({
          chapterTitle: title,
          note: a
        }))
      };
    }
  }

  // ==========================================================================
  // LỚP 3: BỘ TRÍCH XUẤT AI GEMINI CÓ CẤU TRÚC JSON CHO CHƯƠNG ĐÃ CHỐT DUYỆT
  // ==========================================================================
  class GeminiStructuredBibleExtractor {
    buildExtractionPromptForChapters(chapters, existingBibleText = '', knownChars = []) {
      const safeChapters = Array.isArray(chapters) ? chapters : [];
      const perChapBudget = Math.max(
        1800,
        Math.min(7500, Math.floor(28000 / Math.max(1, safeChapters.length)))
      );
      const chapDigest = safeChapters
        .map((ch, idx) => {
          const title = ch.displayTitle || ch.title || `Chương ${idx + 1}`;
          const trimmed = String(ch.content || '').trim();
          const headLen = Math.floor(perChapBudget * 0.58);
          const tailLen = Math.floor(perChapBudget * 0.42);
          const excerpt =
            trimmed.length <= perChapBudget
              ? trimmed
              : `${trimmed.slice(0, headLen)}\n...[Lược bớt phần giữa]...\n${trimmed.slice(-tailLen)}`;
          return `=== [THỨ TỰ ${idx + 1}] ${title} ===\n${excerpt}`;
        })
        .join('\n\n');

      const safeKnownChars = Array.isArray(knownChars) ? knownChars : [];
      const knownList = safeKnownChars.map((c) => c?.name || c).filter(Boolean).join(', ');
      const firstTitle = safeChapters[0]?.displayTitle || safeChapters[0]?.title || 'Chương 1';
      const lastTitle =
        safeChapters[safeChapters.length - 1]?.displayTitle ||
        safeChapters[safeChapters.length - 1]?.title ||
        'Chương mới nhất';

      return [
        `Hãy đọc TOÀN BỘ chuỗi chương theo đúng thứ tự từ "${firstTitle}" đến "${lastTitle}" dưới đây và cập nhật Story Bible LIÊN HOÀN XUYÊN SUỐT (không chỉ riêng chương cuối mà phải nối mạch đầy đủ từ Chương 1 đến chương vừa chốt duyệt).`,
        '',
        knownList ? `Nhân vật đã biết trước đó: ${knownList}` : 'Chưa có danh sách nhân vật cũ.',
        existingBibleText
          ? `Nội dung Story Bible hiện tại:\n${String(existingBibleText).slice(0, 12000)}`
          : '',
        '',
        `TOÀN BỘ NỘI DUNG TỪ ${firstTitle} ĐẾN ${lastTitle} (${safeChapters.length} chương):`,
        chapDigest,
        '',
        'BẮT BUỘC TRẢ VỀ ĐÚNG MỘT KHỐI JSON DUY NHẤT (không viết lan man ngoài JSON) theo cấu trúc sau:',
        '```json',
        '{',
        `  "chronicleSummaryParagraph": "Tóm tắt chi tiết diễn biến liên hoàn TỪ ${firstTitle} ĐẾN ${lastTitle}, nêu rõ từng bước ngoặt, thời gian/địa điểm hiện tại, quan hệ thay đổi và bí mật đã lộ hoặc còn giữ qua từng chương",`,
        '  "newCharacters": [',
        '    { "name": "Tên NV", "role": "Vai trò", "traits": "Tính cách/động cơ chi tiết", "speechStyle": "Cách xưng hô" }',
        '  ],',
        '  "knowledgeSecrets": [',
        '    { "secret": "Bí mật hoặc thông tin quan trọng mới lộ/ẩn", "whoKnows": "Những ai biết", "whoDoesNotKnow": "Những ai chưa biết" }',
        '  ],',
        '  "cluesLedger": [',
        '    { "title": "Tên manh mối / phục bút", "plantedIn": "Tên chương", "status": "PLANTED", "note": "Ý nghĩa hoặc dấu vết" }',
        '  ],',
        '  "resolvedClueTitles": ["Tên phục bút cũ đã được giải đáp nếu có"]',
        '}',
        '```'
      ]
        .filter(Boolean)
        .join('\n');
    }

    parseJsonPayloadFromAiText(rawText) {
      const text = String(rawText || '').trim();
      if (!text) return null;

      const fenced = text.match(/```json\s*([\s\S]*?)```/i);
      const rawCandidate = fenced && fenced[1] ? fenced[1].trim() : text;

      try {
        return JSON.parse(rawCandidate);
      } catch (_) {
        const firstBrace = rawCandidate.indexOf('{');
        const lastBrace = rawCandidate.lastIndexOf('}');
        if (firstBrace >= 0 && lastBrace > firstBrace) {
          try {
            return JSON.parse(rawCandidate.slice(firstBrace, lastBrace + 1));
          } catch (_) {}
        }
      }
      return null;
    }

    async extractUsingGeminiIfAvailable(chapters, bibleEngine) {
      const router = NS.geminiRouter;
      const apiKey =
        router?.getEffectiveActiveKey?.() || router?.getApiKey?.() || '';
      if (!apiKey || typeof router.generateTextWithFallback !== 'function') {
        return { usedAI: false, data: null, reason: 'NO_API_KEY' };
      }

      const existingBibleText =
        document.getElementById('textarea-rendered-bible-content')?.value || '';
      const knownChars = Array.isArray(bibleEngine?.characters)
        ? bibleEngine.characters
        : [];

      const prompt = this.buildExtractionPromptForChapters(
        chapters,
        existingBibleText,
        knownChars
      );

      const sysInstruction =
        'Bạn là Chuyên gia Tổng hợp Story Bible. Trả về đúng JSON hợp lệ chuẩn schema, văn phong Tiếng Việt súc tích, không bịa đặt chi tiết không có trong bản thảo.';

      try {
        const preferredModel =
          typeof router.getSelectedModelId === 'function'
            ? router.getSelectedModelId()
            : 'gemini-3.8-flash';
        const thinkingLevel =
          typeof router.getThinkingLevel === 'function'
            ? router.getThinkingLevel()
            : 'MEDIUM';
        const res = await router.generateTextWithFallback({
          prompt,
          systemInstruction: sysInstruction,
          modelId: preferredModel,
          temperature: 0.25,
          maxOutputTokens: 4096,
          thinkingLevel
        });

        const parsed = this.parseJsonPayloadFromAiText(res.text);
        if (!parsed || typeof parsed !== 'object') {
          return {
            usedAI: true,
            data: null,
            fallbackToLocal: true,
            rawText: res.text,
            reason: 'AI_JSON_PARSE_FAILED'
          };
        }

        return {
          usedAI: true,
          usedEndpoint: res.usedEndpoint || preferredModel,
          data: parsed
        };
      } catch (err) {
        return {
          usedAI: false,
          fallbackToLocal: true,
          errorMessage: err.message,
          data: null
        };
      }
    }
  }

  // ==========================================================================
  // LỚP 4: BỘ HÒA TRỘN & CHỐNG TRÙNG LẶP DỮ LIỆU VÀO STORY BIBLE (TAB 4)
  // ==========================================================================
  class StoryBibleReconciliationMerger {
    mergeExtractionResults(bibleEngine, chapters, aiResult, offlineResults) {
      const stats = {
        addedCharacters: 0,
        addedSecrets: 0,
        addedClues: 0,
        resolvedClues: 0,
        appendedSummaryLines: 0
      };

      if (!bibleEngine) return stats;
      if (!Array.isArray(bibleEngine.characters)) bibleEngine.characters = [];
      if (!Array.isArray(bibleEngine.knowledgeMatrix)) {
        bibleEngine.knowledgeMatrix = [];
      }
      if (!Array.isArray(bibleEngine.cluesLedger)) bibleEngine.cluesLedger = [];

      const existingCharNames = new Set(
        bibleEngine.characters.map((c) => String(c.name || '').trim().toLowerCase())
      );
      const existingSecrets = new Set(
        bibleEngine.knowledgeMatrix.map((k) =>
          String(k.secret || '').trim().toLowerCase().slice(0, 64)
        )
      );
      const existingClues = new Set(
        bibleEngine.cluesLedger.map((cl) =>
          String(cl.title || '').trim().toLowerCase()
        )
      );

      // 1. Gộp từ kết quả AI (nếu có)
      const aiData = aiResult?.data;
      if (aiData && typeof aiData === 'object') {
        if (Array.isArray(aiData.newCharacters)) {
          for (const ch of aiData.newCharacters) {
            const name = String(ch?.name || '').trim();
            if (!name || existingCharNames.has(name.toLowerCase())) continue;
            bibleEngine.characters.push({
              id: `char_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              name,
              role: String(ch.role || 'Nhân vật mới xuất hiện').trim(),
              traits: String(ch.traits || 'Trích xuất từ chương đã duyệt').trim(),
              speechStyle: String(ch.speechStyle || 'Tự nhiên theo bối cảnh').trim()
            });
            existingCharNames.add(name.toLowerCase());
            stats.addedCharacters += 1;
          }
        }

        if (Array.isArray(aiData.knowledgeSecrets)) {
          for (const ks of aiData.knowledgeSecrets) {
            const secret = String(ks?.secret || '').trim();
            const keySig = secret.toLowerCase().slice(0, 64);
            if (!secret || existingSecrets.has(keySig)) continue;
            bibleEngine.knowledgeMatrix.push({
              id: `know_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              secret,
              whoKnows: String(ks.whoKnows || 'Chưa rõ').trim(),
              whoDoesNotKnow: String(ks.whoDoesNotKnow || 'Các nhân vật khác').trim()
            });
            existingSecrets.add(keySig);
            stats.addedSecrets += 1;
          }
        }

        if (Array.isArray(aiData.cluesLedger)) {
          for (const cl of aiData.cluesLedger) {
            const title = String(cl?.title || '').trim();
            if (!title || existingClues.has(title.toLowerCase())) continue;
            bibleEngine.cluesLedger.push({
              id: `clue_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              title,
              plantedIn: String(
                cl.plantedIn || chapters[0]?.displayTitle || 'Chương đã duyệt'
              ).trim(),
              status: cl.status === 'RESOLVED' ? 'RESOLVED' : 'PLANTED',
              note: String(cl.note || '').trim()
            });
            existingClues.add(title.toLowerCase());
            stats.addedClues += 1;
          }
        }

        if (Array.isArray(aiData.resolvedClueTitles)) {
          for (const rTitle of aiData.resolvedClueTitles) {
            const low = String(rTitle || '').trim().toLowerCase();
            if (!low) continue;
            const found = bibleEngine.cluesLedger.find(
              (item) =>
                item.status !== 'RESOLVED' &&
                String(item.title || '').toLowerCase().includes(low)
            );
            if (found) {
              found.status = 'RESOLVED';
              stats.resolvedClues += 1;
            }
          }
        }
      }

      // 2. Bổ khuyết thông minh bằng dữ liệu phân tích cục bộ (khi offline hoặc AI bỏ sót)
      for (const off of offlineResults) {
        if (!aiData) {
          for (const nc of off.newCharacters || []) {
            const low = nc.name.toLowerCase();
            if (!existingCharNames.has(low)) {
              bibleEngine.characters.push({
                id: `char_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                name: nc.name,
                role: nc.role,
                traits: nc.notes,
                speechStyle: 'Tự nhiên theo hội thoại đã viết'
              });
              existingCharNames.add(low);
              stats.addedCharacters += 1;
            }
          }

          for (const cl of off.clues || []) {
            const low = cl.title.toLowerCase();
            if (!existingClues.has(low) && stats.addedClues < 4) {
              bibleEngine.cluesLedger.push({
                id: `clue_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                title: cl.title,
                plantedIn: cl.originChapter,
                status: 'PLANTED',
                note: cl.detail
              });
              existingClues.add(low);
              stats.addedClues += 1;
            }
          }
        }
      }

      // 3. Cập nhật khối Biên Niên Sử Liên Hoàn Xuyên Suốt từ Chương 1 đến chương mới nhất trong `#textarea-rendered-bible-content`
      const bibleTextarea = document.getElementById('textarea-rendered-bible-content');
      if (bibleTextarea) {
        const chapterList = Array.isArray(chapters) ? chapters : [];
        const firstTitle = chapterList[0]?.displayTitle || chapterList[0]?.title || 'Chương 1';
        const lastTitle =
          chapterList[chapterList.length - 1]?.displayTitle ||
          chapterList[chapterList.length - 1]?.title ||
          'Chương hiện tại';
        const dateBadge = new Date().toLocaleString('vi-VN');
        const chapterLines = [];

        if (aiData?.chronicleSummaryParagraph) {
          chapterLines.push(`- [Tổng hợp AI liên hoàn (${firstTitle} ➔ ${lastTitle})]:\n  ${String(aiData.chronicleSummaryParagraph).trim()}`);
        }
        const utils = getUtils();
        chapterList.forEach((ch, idx) => {
          const title = ch?.displayTitle || ch?.title || `Chương ${idx + 1}`;
          const offMatch = (offlineResults || []).find((o) => o?.chapterTitle === title);
          const snippet =
            offMatch?.summaryBullets?.[0] ||
            utils.summarizeTextSmart?.(ch?.content || '', 360) ||
            String(ch?.content || '').trim().slice(0, 320);
          if (snippet) {
            chapterLines.push(`- [${title}]: ${snippet}`);
          }
        });

        if (chapterLines.length > 0) {
          const markerStart = '=== [MẠCH TRUYỆN TÍCH LŨY TỰ ĐỘNG TỪ CHƯƠNG 1 ĐẾN HIỆN TẠI] ===';
          const markerEnd = '=== [HẾT PHẦN MẠCH TRUYỆN TÍCH LŨY TỰ ĐỘNG] ===';
          const freshBlock = [
            markerStart,
            `(Cập nhật lúc ${dateBadge} · Bao phủ ${chapterList.length} chương: ${firstTitle} ➔ ${lastTitle})`,
            ...chapterLines,
            markerEnd
          ].join('\n');

          let curVal = String(bibleTextarea.value || '');
          const sIdx = curVal.indexOf(markerStart);
          const eIdx = curVal.indexOf(markerEnd);
          if (sIdx >= 0 && eIdx > sIdx) {
            const before = curVal.slice(0, sIdx).replace(/\s+$/, '');
            const after = curVal.slice(eIdx + markerEnd.length).replace(/^\s+/, '');
            curVal = [before, freshBlock, after].filter(Boolean).join('\n\n');
          } else {
            curVal = curVal.trim() ? `${curVal.replace(/\s+$/, '')}\n\n${freshBlock}` : freshBlock;
          }
          bibleTextarea.value = `${curVal}\n`;
          stats.appendedSummaryLines = chapterLines.length;
        }
      }

      // 4. Làm mới UI Tab 4 & Lưu toàn bộ Bible
      if (typeof bibleEngine.renderCharactersUI === 'function') {
        bibleEngine.renderCharactersUI();
      }
      if (typeof bibleEngine.renderQuickCharacterChipsInTab1 === 'function') {
        bibleEngine.renderQuickCharacterChipsInTab1();
      }
      if (typeof bibleEngine.renderKnowledgeMatrixUI === 'function') {
        bibleEngine.renderKnowledgeMatrixUI();
      }
      if (typeof bibleEngine.renderCluesLedgerUI === 'function') {
        bibleEngine.renderCluesLedgerUI();
      }
      if (typeof bibleEngine.updateCommandModalStatusPills === 'function') {
        bibleEngine.updateCommandModalStatusPills();
      }
      if (typeof bibleEngine.saveAllBibleData === 'function') {
        bibleEngine.saveAllBibleData(false);
      }

      return stats;
    }
  }

  // ==========================================================================
  // LỚP 5: SỔ CÁI LỊCH SỬ CHỐT DUYỆT & THỐNG KÊ TIẾN ĐỘ TÁC PHẨM
  // ==========================================================================
  class ApprovalAuditLedgerStore {
    constructor() {
      this.records = this.loadRecords();
    }

    loadRecords() {
      try {
        const raw = localStorage.getItem(APPROVAL_LEDGER_STORAGE_KEY);
        if (!raw) return [];
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr.slice(0, MAX_APPROVAL_HISTORY_RECORDS) : [];
      } catch (_) {
        return [];
      }
    }

    persistRecords() {
      try {
        localStorage.setItem(
          APPROVAL_LEDGER_STORAGE_KEY,
          JSON.stringify(this.records)
        );
      } catch (_) {}
    }

    recordApprovalRun(entry) {
      const rec = {
        id: `appr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: Date.now(),
        chapterIds: Array.isArray(entry.chapterIds) ? entry.chapterIds : [],
        chapterTitles: Array.isArray(entry.chapterTitles) ? entry.chapterTitles : [],
        totalWordsApproved: Number(entry.totalWordsApproved || 0),
        engineMode: entry.engineMode || 'LOCAL_NLP_0_TOKEN',
        usedEndpoint: entry.usedEndpoint || '',
        bibleStats: entry.bibleStats || {}
      };
      this.records.unshift(rec);
      if (this.records.length > MAX_APPROVAL_HISTORY_RECORDS) {
        this.records.length = MAX_APPROVAL_HISTORY_RECORDS;
      }
      this.persistRecords();
      return rec;
    }

    getLastApprovalForChapter(chapterId) {
      return (
        this.records.find(
          (r) => Array.isArray(r.chapterIds) && r.chapterIds.includes(chapterId)
        ) || null
      );
    }

    getAggregateStats() {
      const totalRuns = this.records.length;
      const totalCharsAdded = this.records.reduce(
        (sum, r) => sum + Number(r.bibleStats?.addedCharacters || 0),
        0
      );
      const totalCluesAdded = this.records.reduce(
        (sum, r) => sum + Number(r.bibleStats?.addedClues || 0),
        0
      );
      return {
        totalRuns,
        totalCharsAdded,
        totalCluesAdded,
        latestRun: this.records[0] || null
      };
    }
  }

  // ==========================================================================
  // LỚP 6: TRÌNH VẼ DANH SÁCH CHƯƠNG & TỔNG QUAN TÁC ĐỘNG TRONG MODAL CHỐT DUYỆT
  // ==========================================================================
  class ApprovalChecklistModalRenderer {
    constructor(extractor) {
      this.extractor = extractor;
      this.selectedIds = new Set();
    }

    getAllChaptersSafe() {
      const mgr = NS.chapterManager;
      if (mgr && Array.isArray(mgr.chapters)) {
        return mgr.chapters;
      }
      if (Array.isArray(NS.state?.chapters)) {
        return NS.state.chapters;
      }
      return [];
    }

    getActiveChapterIdSafe() {
      return (
        NS.chapterManager?.getActiveChapter?.()?.id ||
        NS.chapterManager?.activeChapterId ||
        NS.state?.activeChapterId ||
        null
      );
    }

    resetSelectionToSmartDefault() {
      this.selectedIds.clear();
      const chapters = this.getAllChaptersSafe();
      const activeId = this.getActiveChapterIdSafe();

      // Mặc định ưu tiên chọn chương đang viết hoặc các chương DRAFT chưa duyệt
      const draftChapters = chapters.filter((c) => c.status !== 'APPROVED');
      if (activeId) {
        this.selectedIds.add(activeId);
      } else if (draftChapters.length > 0) {
        this.selectedIds.add(draftChapters[0].id);
      } else if (chapters.length > 0) {
        this.selectedIds.add(chapters[0].id);
      }
    }

    selectAllChapters() {
      const chapters = this.getAllChaptersSafe();
      this.selectedIds = new Set(chapters.map((c) => c.id));
      this.renderChecklist();
    }

    selectOnlyCurrentChapter() {
      const activeId = this.getActiveChapterIdSafe();
      this.selectedIds.clear();
      if (activeId) {
        this.selectedIds.add(activeId);
      }
      this.renderChecklist();
    }

    renderChecklist() {
      const box = document.getElementById('approve-chapters-checklist');
      if (!box) return;

      const chapters = this.getAllChaptersSafe();
      const activeId = this.getActiveChapterIdSafe();
      const utils = getUtils();
      const esc = utils.escapeHtml;

      if (chapters.length === 0) {
        box.innerHTML =
          '<div class="p-3 text-center text-zinc-400 italic">Chưa có chương bản thảo nào trong dự án.</div>';
        return;
      }

      const apiConnected = Boolean(
        NS.geminiRouter?.getEffectiveActiveKey?.() ||
          NS.geminiRouter?.getApiKey?.()
      );
      const readiness = this.extractor.readinessChecker.checkChaptersReadiness(
        chapters.filter((c) => this.selectedIds.has(c.id))
      );

      const headerBanner = [
        '<div class="mb-2 px-3 py-2 rounded-xl border border-emerald-500/25 bg-emerald-950/35 flex flex-wrap items-center justify-between gap-2 text-[11px]">',
        `  <span class="text-emerald-300 font-bold">Đã chọn ${this.selectedIds.size}/${chapters.length} chương · ${readiness.totalWords.toLocaleString('vi-VN')} từ</span>`,
        apiConnected
          ? '<span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">🤖 Chế độ Trích xuất Gemini AI + NLP</span>'
          : '<span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">⚡ Chế độ Tách NLP 0 Token (Offline)</span>',
        '</div>'
      ].join('');

      const aiDiffWarningBanner = readiness.hasUnresolvedAiDiff
        ? '<div class="mb-2 px-3 py-2 rounded-xl border border-amber-500/40 bg-amber-500/15 text-amber-200 text-[11px]">⚠️ Chương đang mở còn các đoạn AI tô màu chưa bấm duyệt ở Tab 1. Khi chốt duyệt, hệ thống sẽ tự động xác nhận giữ lại các đoạn AI hiện tại trước khi lưu kho Đã Duyệt.</div>'
        : '';

      const rowsHtml = chapters
        .map((ch) => {
          const isChecked = this.selectedIds.has(ch.id);
          const isActive = ch.id === activeId;
          const isApproved = ch.status === 'APPROVED';
          const wordCount = utils.countVietnameseWords(ch.content || '');
          const lastAppr = this.extractor.ledgerStore.getLastApprovalForChapter(
            ch.id
          );

          const statusBadge = isApproved
            ? '<span class="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[10px]">Đã duyệt</span>'
            : '<span class="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[10px]">Bản nháp</span>';

          const activePill = isActive
            ? '<span class="px-1.5 py-0.5 rounded bg-indigo-500/25 text-indigo-300 font-bold text-[10px]">Đang mở</span>'
            : '';

          const prevInfo = lastAppr
            ? ` · Chốt gần nhất: ${new Date(lastAppr.timestamp).toLocaleDateString('vi-VN')}`
            : '';

          return [
            `<label class="flex items-center justify-between gap-2 p-2.5 rounded-xl border ${
              isChecked
                ? 'border-emerald-500/60 bg-emerald-500/10'
                : 'border-zinc-800 bg-zinc-900/70'
            } hover:border-emerald-500/50 cursor-pointer transition">`,
            `  <div class="flex items-center gap-2.5 min-w-0 flex-1">`,
            `    <input type="checkbox" class="approve-chapter-checkbox w-4 h-4 accent-emerald-500 shrink-0" value="${esc(ch.id)}" ${isChecked ? 'checked' : ''} />`,
            `    <div class="min-w-0 flex-1">`,
            `      <div class="font-bold text-zinc-100 truncate flex items-center gap-1.5">${esc(ch.displayTitle || ch.title || 'Chương')} ${activePill}</div>`,
            `      <div class="text-[10px] text-zinc-400 font-monoCode">${wordCount.toLocaleString('vi-VN')} từ${esc(prevInfo)}</div>`,
            `    </div>`,
            `  </div>`,
            `  <div class="shrink-0">${statusBadge}</div>`,
            `</label>`
          ].join('');
        })
        .join('\n');

      box.innerHTML = `${headerBanner}${aiDiffWarningBanner}<div class="space-y-1.5">${rowsHtml}</div>`;

      box.querySelectorAll('.approve-chapter-checkbox').forEach((chk) => {
        chk.addEventListener('change', () => {
          const cid = chk.value;
          if (chk.checked) {
            this.selectedIds.add(cid);
          } else {
            this.selectedIds.delete(cid);
          }
          this.renderChecklist();
        });
      });
    }

    getSelectedChapterObjects() {
      const all = this.getAllChaptersSafe();
      return all.filter((c) => this.selectedIds.has(c.id));
    }
  }

  // ==========================================================================
  // LỚP 7: BỘ ĐỒNG BỘ CHỈ MỤC CHỐNG QUÊN (RAG) & THƯ MỤC ĐÃ DUYỆT SAU KHI CHỐT
  // ==========================================================================
  class PostApprovalSyncAndChronicleBridge {
    async promoteChaptersToApproved(selectedChapters) {
      const chapMgr = NS.chapterManager;
      let promotedCount = 0;

      if (chapMgr && typeof chapMgr.syncEditorToActiveChapter === 'function') {
        chapMgr.syncEditorToActiveChapter();
      }

      for (const chap of selectedChapters) {
        if (!chap) continue;
        const wasApproved = chap.status === 'APPROVED';

        if (
          chapMgr?.approvalGate &&
          typeof chapMgr.approvalGate.toggleChapterStatusBidirectional ===
            'function'
        ) {
          await chapMgr.approvalGate.toggleChapterStatusBidirectional(
            chap.id,
            'APPROVED',
            true
          );
        } else {
          chap.status = 'APPROVED';
          chap.approvedAt = Date.now();
          chap.updatedAt = Date.now();
        }

        if (!wasApproved || chap.status === 'APPROVED') {
          promotedCount += 1;
        }
      }

      if (chapMgr) {
        if (typeof chapMgr.persistChapters === 'function') {
          await chapMgr.persistChapters();
        }
        if (typeof chapMgr.renderChapterTreeAndQuickSwitcher === 'function') {
          chapMgr.renderChapterTreeAndQuickSwitcher();
        }
        const activeChap =
          typeof chapMgr.getActiveChapter === 'function'
            ? chapMgr.getActiveChapter()
            : null;
        if (activeChap && typeof chapMgr.updateActiveStatusBadgeUI === 'function') {
          chapMgr.updateActiveStatusBadgeUI(activeChap);
        }
      }

      return promotedCount;
    }

    async syncRagAndLocalFolders(allChapters, approvedChapters) {
      let ragChunksCount = 0;
      if (NS.rag && typeof NS.rag.rebuildIndexFromChapters === 'function') {
        try {
          const ragResult = await NS.rag.rebuildIndexFromChapters(allChapters);
          ragChunksCount = Number(
            ragResult?.totalChunks || ragResult?.chunkCount || NS.rag?.chunks?.length || 0
          );
        } catch (_) {}
      }

      let syncedFiles = 0;
      if (NS.fsEngine) {
        try {
          if (typeof NS.fsEngine.syncAllWorkspaceFiles === 'function') {
            await NS.fsEngine.syncAllWorkspaceFiles({ silent: true });
            syncedFiles = approvedChapters.length;
          } else if (
            NS.fsEngine.rootHandle &&
            typeof NS.fsEngine.writeChapterFile === 'function'
          ) {
            for (const ch of approvedChapters) {
              await NS.fsEngine.writeChapterFile(ch, '02_Chuong_Da_Duyet');
              syncedFiles += 1;
            }
          }
        } catch (_) {}
      }

      if (NS.mode5Studio && typeof NS.mode5Studio.renderChapterChecklist === 'function') {
        try {
          NS.mode5Studio.renderChapterChecklist();
        } catch (_) {}
      }

      return { ragChunksCount, syncedFiles };
    }

    async capturePreApprovalSafetySnapshot(chapters) {
      if (!NS.versionVault || typeof NS.versionVault.createSnapshot !== 'function') {
        return null;
      }
      const names = chapters
        .slice(0, 3)
        .map((c) => c.displayTitle || c.title || 'Chương')
        .join(', ');
      const suffix =
        chapters.length > 3 ? ` (+${chapters.length - 3} chương)` : '';
      const label = `Trước khi chốt duyệt: ${names}${suffix}`;
      try {
        return await NS.versionVault.createSnapshot(label, 'CHAPTER_APPROVED', {
          silent: true
        });
      } catch (_) {
        return null;
      }
    }
  }

  // ==========================================================================
  // LỚP 8: BỘ TẠO BÁO CÁO KẾT QUẢ CHỐT DUYỆT & KIỂM TRA SỨC KHỎE BẢN THẢO
  // ==========================================================================
  class ApprovalPipelineQualityReporter {
    buildCompletionSummaryMessage(selectedChapters, bibleStats, syncInfo, aiResult) {
      const chapCount = selectedChapters.length;
      const modeLabel = aiResult?.usedAI
        ? `Gemini AI (${aiResult.usedEndpoint || 'Flash'})`
        : 'Phân tích NLP 0 Token cục bộ';

      const parts = [
        `✅ Đã chốt duyệt ${chapCount} chương vào kho Đã Duyệt (${modeLabel})!`
      ];

      const updates = [];
      if (bibleStats.addedCharacters > 0) {
        updates.push(`+${bibleStats.addedCharacters} nhân vật`);
      }
      if (bibleStats.addedSecrets > 0) {
        updates.push(`+${bibleStats.addedSecrets} mục Ai Biết Gì`);
      }
      if (bibleStats.addedClues > 0) {
        updates.push(`+${bibleStats.addedClues} phục bút mới`);
      }
      if (bibleStats.resolvedClues > 0) {
        updates.push(`✓ thu hồi ${bibleStats.resolvedClues} phục bút`);
      }

      if (updates.length > 0) {
        parts.push(`Story Bible Tab 4 đã bổ sung: ${updates.join(', ')}.`);
      } else {
        parts.push('Biên niên sử Story Bible & chỉ mục chống quên Tab 2 đã được đồng bộ.');
      }

      if (syncInfo.ragChunksCount > 0) {
        parts.push(`(${syncInfo.ragChunksCount} đoạn ký ức BM25)`);
      }

      return parts.join(' ');
    }

    computeBookApprovalProgress(allChapters = []) {
      const utils = getUtils();
      let approvedChapters = 0;
      let draftChapters = 0;
      let approvedWords = 0;
      let draftWords = 0;

      for (const ch of allChapters) {
        const w = utils.countVietnameseWords(ch.content || '');
        if (ch.status === 'APPROVED') {
          approvedChapters += 1;
          approvedWords += w;
        } else {
          draftChapters += 1;
          draftWords += w;
        }
      }

      const totalChapters = allChapters.length;
      const totalWords = approvedWords + draftWords;
      const completionRatio =
        totalChapters > 0
          ? Math.round((approvedChapters / totalChapters) * 100)
          : 0;

      return {
        totalChapters,
        approvedChapters,
        draftChapters,
        approvedWords,
        draftWords,
        totalWords,
        completionRatio
      };
    }

    generateCrossChapterContinuityDigest(chapters = []) {
      const localExt = new VietnameseEntityAndClueLocalExtractor();
      const known = (NS.storyBible?.characters || []).map((c) => c.name);
      const timeline = [];
      for (const ch of chapters) {
        const off = localExt.analyzeChapterOffline(ch, known);
        timeline.push({
          chapterId: ch.id,
          title: off.chapterTitle,
          characters: off.activeCharacters.slice(0, 6),
          timeAnchors: off.timelineEvents.map((e) => e.note).slice(0, 3),
          clues: off.clues.map((c) => c.title).slice(0, 3)
        });
      }
      return timeline;
    }
  }

  // ==========================================================================
  // LỚP 9: BỘ PHÁT HIỆN HỒ SƠ CHƯA GHI NHẬN & TỔNG QUAN SỨC KHỎE BỘ TRUYỆN
  // ==========================================================================
  class ApprovedManuscriptConsistencyAuditor {
    constructor(extractor) {
      this.extractor = extractor;
    }

    findUnregisteredFrequentEntitiesAcrossApproved(chapters = []) {
      const localExt = this.extractor.localExtractor;
      const knownChars = (NS.storyBible?.characters || []).map((c) =>
        String(c.name || '').trim()
      );
      const knownLower = new Set(knownChars.map((n) => n.toLowerCase()));
      const globalCounts = new Map();

      for (const ch of chapters) {
        if (!ch || !ch.content) continue;
        const found = localExt.extractCharactersFromDialogueAndProse(
          ch.content,
          knownChars
        );
        for (const item of found) {
          const low = item.name.toLowerCase();
          if (knownLower.has(low)) continue;
          const prev = globalCounts.get(item.name) || {
            name: item.name,
            totalMentions: 0,
            chapters: []
          };
          prev.totalMentions += item.mentions;
          prev.chapters.push(ch.displayTitle || ch.title || 'Chương');
          globalCounts.set(item.name, prev);
        }
      }

      return Array.from(globalCounts.values())
        .filter((x) => x.totalMentions >= 2)
        .sort((a, b) => b.totalMentions - a.totalMentions)
        .slice(0, 10);
    }

    auditApprovedChaptersDialogueQuality(chapters = []) {
      const utils = getUtils();
      const rows = [];
      for (const ch of chapters) {
        const text = String(ch.content || '');
        const totalWords = utils.countVietnameseWords(text);
        const lines = text.split('\n');
        const dialogueLines = lines.filter((l) => /^\s*[-–—]\s+/.test(l));
        const taggedDialogueLines = dialogueLines.filter((l) =>
          /\([^()\n]{2,34}\)\s*$/.test(l.trim())
        );

        rows.push({
          chapterId: ch.id,
          title: ch.displayTitle || ch.title || 'Chương',
          totalWords,
          dialogueCount: dialogueLines.length,
          taggedDialogueCount: taggedDialogueLines.length,
          taggingRatio:
            dialogueLines.length > 0
              ? Math.round((taggedDialogueLines.length / dialogueLines.length) * 100)
              : 100
        });
      }
      return rows;
    }

    formatApprovalCertificateMarkdown(chapters, bibleStats, syncInfo) {
      const utils = getUtils();
      const totalWords = chapters.reduce(
        (sum, c) => sum + utils.countVietnameseWords(c.content || ''),
        0
      );
      return [
        `## CHỨNG NHẬN CHỐT DUYỆT BẢN THẢO (${new Date().toLocaleString('vi-VN')})`,
        `- Số chương chốt duyệt: **${chapters.length}** (${chapters.map((c) => c.displayTitle || c.title).join(', ')})`,
        `- Tổng dung lượng được niêm phong: **${totalWords.toLocaleString('vi-VN')} từ**`,
        `- Nhân vật mới thêm vào Story Bible: **${bibleStats.addedCharacters || 0}**`,
        `- Bí mật Ma trận Ai Biết Gì mới: **${bibleStats.addedSecrets || 0}**`,
        `- Phục bút mới cài / thu hồi: **${bibleStats.addedClues || 0} / ${bibleStats.resolvedClues || 0}**`,
        `- Chỉ mục BM25 chống quên: **${syncInfo.ragChunksCount || 0} đoạn ký ức**`
      ].join('\n');
    }
  }

  // ==========================================================================
  // LỚP 10: BỘ ĐIỀU KHIỂN TRUNG TÂM CHỐT DUYỆT (`NoirStudio.approvalExtractor`)
  // ==========================================================================
  class SmartApprovalAndBibleExtractorEngine {
    constructor() {
      this.readinessChecker = new PreApprovalAuditAndReadinessChecker();
      this.localExtractor = new VietnameseEntityAndClueLocalExtractor();
      this.aiExtractor = new GeminiStructuredBibleExtractor();
      this.bibleMerger = new StoryBibleReconciliationMerger();
      this.ledgerStore = new ApprovalAuditLedgerStore();
      this.checklistRenderer = new ApprovalChecklistModalRenderer(this);
      this.syncBridge = new PostApprovalSyncAndChronicleBridge();
      this.reporter = new ApprovalPipelineQualityReporter();
      this.consistencyAuditor = new ApprovedManuscriptConsistencyAuditor(this);
      this.isRunning = false;
      this.hasInitialized = false;
    }

    init() {
      this.bindDOM();
      this.hasInitialized = true;
      return this;
    }

    buildExtractionPromptForChapters(chapters, existingBibleText = '', knownChars = [], opts = {}) {
      if (this.aiExtractor && typeof this.aiExtractor.buildExtractionPromptForChapters === 'function') {
        return this.aiExtractor.buildExtractionPromptForChapters(
          chapters,
          existingBibleText,
          knownChars,
          opts
        );
      }
      return '';
    }

    openApprovalModal() {
      const modal = document.getElementById('modal-approve-chapter-smart');
      if (!modal) return false;

      if (
        NS.chapterManager &&
        typeof NS.chapterManager.syncEditorToActiveChapter === 'function'
      ) {
        NS.chapterManager.syncEditorToActiveChapter();
      }

      this.checklistRenderer.resetSelectionToSmartDefault();
      this.checklistRenderer.renderChecklist();
      modal.classList.remove('hidden');
      return true;
    }

    closeApprovalModal() {
      const modal = document.getElementById('modal-approve-chapter-smart');
      if (modal) modal.classList.add('hidden');
    }

    async runApprovalAndBibleSynthesis() {
      if (this.isRunning) {
        getUtils().showToast(
          '⏳ Đang xử lý chốt duyệt & đồng bộ Story Bible, vui lòng chờ giây lát...',
          'info'
        );
        return { ok: false, reason: 'BUSY' };
      }

      const utils = getUtils();
      if (
        NS.chapterManager &&
        typeof NS.chapterManager.syncEditorToActiveChapter === 'function'
      ) {
        NS.chapterManager.syncEditorToActiveChapter();
      }

      const selectedChapters =
        this.checklistRenderer.getSelectedChapterObjects();
      if (selectedChapters.length === 0) {
        utils.showToast(
          '⚠️ Hãy tích chọn ít nhất 1 chương trước khi chạy Chốt Duyệt Bản Thảo.',
          'warn'
        );
        return { ok: false, reason: 'NO_CHAPTER_SELECTED' };
      }

      this.isRunning = true;
      const runBtn = document.getElementById('btn-confirm-run-approval-synthesis');
      if (runBtn) runBtn.disabled = true;

      utils.showBlockingLoader(
        '⏳ Đang Chốt Duyệt & Tổng Hợp Dữ Kiện Vào Story Bible...',
        `Hệ thống đang niêm phong ${selectedChapters.length} chương vào kho Đã Duyệt, trích xuất nhân vật/phục bút và tái lập bộ nhớ chống quên.`
      );

      try {
        // Bước 1: Hoàn tất AI Diff đang mở (nếu có) & lưu mốc Time-Machine an toàn
        this.readinessChecker.autoSettleActiveAiDiffIfRequested();
        await this.syncBridge.capturePreApprovalSafetySnapshot(selectedChapters);

        // Bước 2: Gom TOÀN BỘ chuỗi chương đã duyệt + đang chọn theo đúng thứ tự từ Chương 1 đến hiện tại
        // để Story Bible luôn được cập nhật đầy đủ từ Chương 1 tới chương mới nhất (không bỏ sót chương trước/sau)
        const allChapsOrdered = this.checklistRenderer.getAllChaptersSafe();
        const selectedSet = new Set(selectedChapters.map((c) => c.id));
        const cumulativeChapters = allChapsOrdered.filter(
          (ch) => ch && (ch.status === 'APPROVED' || selectedSet.has(ch.id))
        );
        const targetChapters =
          cumulativeChapters.length > 0 ? cumulativeChapters : selectedChapters;

        const bibleEngine = NS.storyBible || null;
        const knownNames = (bibleEngine?.characters || []).map((c) => c.name);
        const offlineResults = targetChapters.map((ch) =>
          this.localExtractor.analyzeChapterOffline(ch, knownNames)
        );

        // Bước 3: Nếu có Gemini API Key -> trích xuất sâu liên hoàn từ Chương 1 đến chương mới nhất
        const aiResult = await this.aiExtractor.extractUsingGeminiIfAvailable(
          targetChapters,
          bibleEngine
        );

        // Bước 4: Hòa trộn vào Story Bible Tab 4 (bao phủ toàn bộ targetChapters từ Chương 1)
        const bibleStats = this.bibleMerger.mergeExtractionResults(
          bibleEngine,
          targetChapters,
          aiResult,
          offlineResults
        );

        // Bước 5: Chuyển trạng thái APPROVED cho các chương & đồng bộ RAG + Ổ cứng
        await this.syncBridge.promoteChaptersToApproved(selectedChapters);
        const allChapters = this.checklistRenderer.getAllChaptersSafe();
        const syncInfo = await this.syncBridge.syncRagAndLocalFolders(
          allChapters,
          selectedChapters
        );

        // Bước 6: Ghi nhật ký & phát sự kiện hoàn tất trên Event Bus
        const totalWordsApproved = selectedChapters.reduce(
          (sum, ch) => sum + utils.countVietnameseWords(ch.content || ''),
          0
        );
        this.ledgerStore.recordApprovalRun({
          chapterIds: selectedChapters.map((c) => c.id),
          chapterTitles: selectedChapters.map((c) => c.displayTitle || c.title),
          totalWordsApproved,
          engineMode: aiResult?.usedAI ? 'GEMINI_AI_STRUCTURED' : 'LOCAL_NLP_0_TOKEN',
          usedEndpoint: aiResult?.usedEndpoint || '',
          bibleStats
        });

        if (NS.bus && typeof NS.bus.emit === 'function') {
          NS.bus.emit(
            NS.constants?.EVENTS?.CHAPTER_APPROVED || 'chapter:approved',
            {
              chapterIds: selectedChapters.map((c) => c.id),
              bibleStats,
              ragChunksCount: syncInfo.ragChunksCount
            }
          );
        }

        if (NS.autoSaver && typeof NS.autoSaver.triggerManualSave === 'function') {
          await NS.autoSaver.triggerManualSave('CHỐT_DUYỆT_BẢN_THẢO');
        }

        utils.hideBlockingLoader();
        this.closeApprovalModal();

        const summaryMsg = this.reporter.buildCompletionSummaryMessage(
          selectedChapters,
          bibleStats,
          syncInfo,
          aiResult
        );
        utils.showToast(summaryMsg, 'success', 4800);

        return {
          ok: true,
          approvedCount: selectedChapters.length,
          bibleStats,
          syncInfo,
          usedAI: Boolean(aiResult?.usedAI)
        };
      } catch (err) {
        utils.hideBlockingLoader();
        utils.showToast(
          `❌ Có trục trặc khi tổng hợp chốt duyệt: ${err.message}`,
          'error',
          4200
        );
        return { ok: false, error: err.message };
      } finally {
        this.isRunning = false;
        if (runBtn) runBtn.disabled = false;
      }
    }

    /**
     * Đồng bộ Story Bible tích lũy từ Chương 1 đến chương đã duyệt mới nhất
     * (gọi tự động khi duyệt nhanh ở Tab 2 hoặc khi đồng bộ thủ công).
     */
    syncCumulativeStoryBibleFromApprovedChapters({ silent = true } = {}) {
      const bibleEngine = NS.storyBible || null;
      if (!bibleEngine) return null;
      const allChaps = this.checklistRenderer.getAllChaptersSafe();
      const approvedChaps = allChaps.filter((c) => c && c.status === 'APPROVED');
      if (approvedChaps.length === 0) return null;

      const knownNames = (bibleEngine.characters || []).map((c) => c.name);
      const offlineResults = approvedChaps.map((ch) =>
        this.localExtractor.analyzeChapterOffline(ch, knownNames)
      );
      const stats = this.bibleMerger.mergeExtractionResults(
        bibleEngine,
        approvedChaps,
        null,
        offlineResults
      );
      if (!silent) {
        getUtils().showToast(
          `🏛️ Đã đồng bộ Story Bible liên hoàn từ Chương 1 đến ${
            approvedChaps[approvedChaps.length - 1]?.displayTitle || 'chương mới nhất'
          }!`,
          'success'
        );
      }
      return stats;
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
        'btn-approve-chapter',
        'click',
        () => this.openApprovalModal(),
        'mod19_open_modal'
      );

      bindOnce(
        'btn-close-approve-modal',
        'click',
        () => this.closeApprovalModal(),
        'mod19_close_x'
      );

      bindOnce(
        'btn-cancel-approve-modal',
        'click',
        () => this.closeApprovalModal(),
        'mod19_close_cancel'
      );

      bindOnce(
        'btn-approve-select-all',
        'click',
        () => this.checklistRenderer.selectAllChapters(),
        'mod19_select_all'
      );

      bindOnce(
        'btn-approve-select-current',
        'click',
        () => this.checklistRenderer.selectOnlyCurrentChapter(),
        'mod19_select_current'
      );

      bindOnce(
        'btn-confirm-run-approval-synthesis',
        'click',
        () => this.runApprovalAndBibleSynthesis(),
        'mod19_confirm_run'
      );
    }

    getHealthReport() {
      return {
        module: 'mod19_smart_approval_and_bible_extractor.js',
        initialized: this.hasInitialized,
        isRunning: this.isRunning,
        aggregateLedger: this.ledgerStore.getAggregateStats(),
        bookProgress: this.reporter.computeBookApprovalProgress(
          this.checklistRenderer.getAllChaptersSafe()
        )
      };
    }
  }

  // ==========================================================================
  // LỚP 11: BỘ PHÂN TÍCH BIẾN ĐỘNG QUAN HỆ & HOÀN TÁC TRẠNG THÁI AN TOÀN
  // ==========================================================================
  class RelationshipShiftAndRevertCoordinator {
    constructor(extractor) {
      this.extractor = extractor;
      this.shiftPatterns = [
        {
          type: 'TRUST_BROKEN',
          label: 'Rạn nứt niềm tin / Phản bội',
          regex: /(?:phản bội|nói dối|lừa dối|âm thầm giấu|đâm sau lưng|nghi kỵ)/i
        },
        {
          type: 'ALLIANCE_FORMED',
          label: 'Bắt tay thỏa hiệp / Liên minh mới',
          regex: /(?:thỏa thuận|bắt tay|giao kèo|hợp tác|đồng minh|kề vai sát cánh)/i
        },
        {
          type: 'SECRET_REVEALED',
          label: 'Bí mật lớn bị phanh phui',
          regex: /(?:sự thật|thú nhận|phanh phui|vạch trần|bại lộ|lộ tẩy)/i
        },
        {
          type: 'HOSTILE_ESCALATION',
          label: 'Leo thang thù địch trực diện',
          regex: /(?:tuyên chiến|uy hiếp|rút dao|đe dọa|trả thù|đối đầu trực diện)/i
        }
      ];
    }

    detectDramaticShiftsInChapters(chapters = []) {
      const findings = [];
      for (const ch of chapters) {
        const title = ch.displayTitle || ch.title || 'Chương';
        const sentences = String(ch.content || '')
          .split(/(?<=[.!?…])\s+|\n+/)
          .map((s) => s.trim())
          .filter((s) => s.length >= 20);

        for (const sent of sentences) {
          for (const pat of this.shiftPatterns) {
            if (pat.regex.test(sent)) {
              findings.push({
                chapterId: ch.id,
                chapterTitle: title,
                shiftType: pat.type,
                shiftLabel: pat.label,
                excerpt: sent.length > 140 ? `${sent.slice(0, 137)}...` : sent
              });
              break;
            }
          }
          if (findings.length >= 16) break;
        }
      }
      return findings;
    }

    async revertChaptersBackToDraftSafe(chapterIds = []) {
      if (!Array.isArray(chapterIds) || chapterIds.length === 0) {
        return { reverted: 0 };
      }

      const chapMgr = NS.chapterManager;
      if (!chapMgr) return { reverted: 0 };

      const targetChapters = (chapMgr.chapters || []).filter((c) =>
        chapterIds.includes(c.id)
      );
      if (targetChapters.length === 0) return { reverted: 0 };

      if (
        NS.versionVault &&
        typeof NS.versionVault.createSnapshot === 'function'
      ) {
        await NS.versionVault.createSnapshot(
          `Trước khi chuyển ${targetChapters.length} chương về Bản Nháp`,
          'MANUAL',
          { silent: true }
        );
      }

      let count = 0;
      for (const chap of targetChapters) {
        if (
          chapMgr.approvalGate &&
          typeof chapMgr.approvalGate.toggleChapterStatusBidirectional ===
            'function'
        ) {
          await chapMgr.approvalGate.toggleChapterStatusBidirectional(
            chap.id,
            'DRAFT',
            true
          );
        } else {
          chap.status = 'DRAFT';
          chap.updatedAt = Date.now();
        }
        count += 1;
      }

      if (typeof chapMgr.persistChapters === 'function') {
        await chapMgr.persistChapters();
      }
      if (typeof chapMgr.renderChapterTreeAndQuickSwitcher === 'function') {
        chapMgr.renderChapterTreeAndQuickSwitcher();
      }
      if (
        NS.rag &&
        typeof NS.rag.rebuildIndexFromChapters === 'function'
      ) {
        await NS.rag.rebuildIndexFromChapters(chapMgr.chapters || []);
      }

      getUtils().showToast(
        `📝 Đã chuyển ${count} chương trở lại kho Bản Nháp để chỉnh sửa tiếp.`,
        'info'
      );
      return { reverted: count };
    }

    buildSeriesApprovalHeatmap(chapters = []) {
      const utils = getUtils();
      return chapters.map((ch, idx) => {
        const words = utils.countVietnameseWords(ch.content || '');
        const lastRec = this.extractor.ledgerStore.getLastApprovalForChapter(
          ch.id
        );
        return {
          index: idx + 1,
          id: ch.id,
          title: ch.displayTitle || ch.title || `Chương ${idx + 1}`,
          status: ch.status === 'APPROVED' ? 'APPROVED' : 'DRAFT',
          wordCount: words,
          readyScore:
            words >= 2500 ? 'Sẵn sàng xuất bản' : words >= 1000 ? 'Ổn định' : 'Cần viết thêm',
          lastApprovedAt: lastRec ? lastRec.timestamp : 0
        };
      });
    }
  }

  // ==========================================================================
  // LỚP 12: THANH TIẾN ĐỘ TỔNG THỂ SÁCH & LỊCH SỬ CHỐT DUYỆT TRONG MODAL
  // ==========================================================================
  class ApprovalModalProgressFooterController {
    constructor(extractor) {
      this.extractor = extractor;
    }

    mountOrUpdateFooterBar() {
      const modal = document.getElementById('modal-approve-chapter-smart');
      const checklist = document.getElementById('approve-chapters-checklist');
      if (!modal || !checklist || !checklist.parentElement) return false;

      let statsStrip = document.getElementById('approve-modal-book-progress-strip');
      if (!statsStrip) {
        statsStrip = document.createElement('div');
        statsStrip.id = 'approve-modal-book-progress-strip';
        statsStrip.className =
          'p-3 rounded-xl border border-zinc-800 bg-zinc-950/90 space-y-2 text-[11px]';
        checklist.parentElement.appendChild(statsStrip);
      }

      const chapters = this.extractor.checklistRenderer.getAllChaptersSafe();
      const progress = this.extractor.reporter.computeBookApprovalProgress(chapters);
      const ledgerAgg = this.extractor.ledgerStore.getAggregateStats();
      const recentRuns = this.extractor.ledgerStore.records.slice(0, 3);
      const esc = getUtils().escapeHtml;

      const shifts = this.extractor.shiftCoordinator.detectDramaticShiftsInChapters(
        this.extractor.checklistRenderer.getSelectedChapterObjects()
      );

      statsStrip.innerHTML = [
        '<div class="flex flex-wrap items-center justify-between gap-2">',
        `  <span class="font-bold text-emerald-300">📚 Tiến độ toàn bộ sách: ${progress.approvedChapters}/${progress.totalChapters} chương đã duyệt (${progress.completionRatio}%)</span>`,
        `  <span class="font-monoCode text-zinc-400">Đã chốt: ${progress.approvedWords.toLocaleString('vi-VN')} / ${progress.totalWords.toLocaleString('vi-VN')} từ</span>`,
        '</div>',
        '<div class="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">',
        `  <div class="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all" style="width: ${progress.completionRatio}%;"></div>`,
        '</div>',
        '<div class="flex flex-wrap items-center justify-between gap-2 text-[10px] text-zinc-400">',
        `  <span>Story Bible đã tích lũy: +${ledgerAgg.totalCharsAdded} nhân vật · +${ledgerAgg.totalCluesAdded} phục bút qua ${ledgerAgg.totalRuns} lần chốt</span>`,
        shifts.length > 0
          ? `<span class="text-amber-300 font-semibold">⚡ Phát hiện ${shifts.length} bước ngoặt kịch tính trong chương đang chọn</span>`
          : '<span>✨ Dữ liệu sẵn sàng niêm phong vào kho Đã Duyệt</span>',
        '</div>',
        recentRuns.length > 0
          ? `<div class="pt-1 border-t border-zinc-800/80 space-y-1"><div class="text-[10px] font-bold uppercase text-zinc-400">Lịch sử chốt gần đây:</div>${recentRuns
              .map(
                (r) =>
                  `<div class="text-[10px] text-zinc-300 flex items-center justify-between gap-2"><span class="truncate">• ${esc(
                    r.chapterTitles.join(', ')
                  )}</span><span class="font-monoCode text-zinc-500 shrink-0">${new Date(
                    r.timestamp
                  ).toLocaleString('vi-VN')}</span></div>`
              )
              .join('')}</div>`
          : ''
      ].join('\n');

      return true;
    }

    exportApprovalAuditReportMarkdown() {
      const chapters = this.extractor.checklistRenderer.getAllChaptersSafe();
      const heatmap =
        this.extractor.shiftCoordinator.buildSeriesApprovalHeatmap(chapters);
      const agg = this.extractor.ledgerStore.getAggregateStats();

      const lines = [
        '# BÁO CÁO TIẾN ĐỘ DUYỆT CHƯƠNG & CẬP NHẬT STORY BIBLE',
        `- Thời điểm xuất: ${new Date().toLocaleString('vi-VN')}`,
        `- Tổng số lần chốt duyệt đã thực hiện: ${agg.totalRuns}`,
        `- Tổng nhân vật mới được trích xuất tự động: ${agg.totalCharsAdded}`,
        `- Tổng phục bút được ghi nhận tự động: ${agg.totalCluesAdded}`,
        '',
        '## Bảng Trạng Thái Từng Chương',
        '| STT | Tên Chương | Trạng Thái | Số Từ | Đánh Giá |',
        '|---:|---|---|---:|---|'
      ];

      for (const row of heatmap) {
        lines.push(
          `| ${row.index} | ${row.title} | ${row.status} | ${row.wordCount} | ${row.readyScore} |`
        );
      }

      return lines.join('\n');
    }
  }

  // Nối Footer tiến độ vào mỗi lần mở/vẽ checklist Modal Chốt Duyệt
  const origRenderChecklist =
    ApprovalChecklistModalRenderer.prototype.renderChecklist;
  ApprovalChecklistModalRenderer.prototype.renderChecklist = function () {
    origRenderChecklist.call(this);
    if (this.extractor.progressFooter) {
      this.extractor.progressFooter.mountOrUpdateFooterBar();
    }
  };

  // ==========================================================================
  // LỚP 13: BỘ THEO DÕI CUNG HỒI TRUYỆN (ACT TRACKER) & KIỂM SOÁT PHỤC BÚT CHƯA THU HỒI
  // ==========================================================================
  class BookArcProgressionAndCluePayoffPlanner {
    constructor(extractor) {
      this.extractor = extractor;
    }

    evaluateUnresolvedCluesBacklog() {
      const clues = Array.isArray(NS.storyBible?.cluesLedger)
        ? NS.storyBible.cluesLedger
        : [];
      const planted = clues.filter((c) => c.status !== 'RESOLVED');
      const resolved = clues.filter((c) => c.status === 'RESOLVED');
      const payoffRatio =
        clues.length > 0
          ? Math.round((resolved.length / clues.length) * 100)
          : 100;

      const urgentReminder =
        planted.length >= 5
          ? `Bạn đang có ${planted.length} phục bút đang treo chưa thu hồi. Hãy cân nhắc giải đáp dần một vài manh mối nhỏ ở các chương kế tiếp để giữ nhịp thỏa mãn cho độc giả.`
          : planted.length > 0
            ? `Đang có ${planted.length} phục bút mở đường cho các cú bẻ lái sắp tới.`
            : 'Tất cả phục bút đã được xử lý gọn gàng.';

      return {
        totalClues: clues.length,
        plantedCount: planted.length,
        resolvedCount: resolved.length,
        payoffRatio,
        urgentReminder,
        oldestPlanted: planted.slice(0, 4).map((c) => ({
          title: c.title,
          plantedIn: c.plantedIn || 'Không rõ chương'
        }))
      };
    }

    buildApprovedArcStructureSummary(chapters = []) {
      const approved = chapters.filter((c) => c.status === 'APPROVED');
      const utils = getUtils();
      const blocks = approved.map((ch, idx) => {
        const words = utils.countVietnameseWords(ch.content || '');
        const lines = String(ch.content || '')
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean);
        const openingLine = (lines[0] || '').slice(0, 95);
        const closingLine = (lines[lines.length - 1] || '').slice(0, 95);

        return {
          order: idx + 1,
          id: ch.id,
          title: ch.displayTitle || ch.title || `Chương ${idx + 1}`,
          words,
          openingHook: openingLine,
          closingHook: closingLine
        };
      });

      const totalApprovedWords = blocks.reduce((s, b) => s + b.words, 0);
      const averageWordsPerChapter =
        blocks.length > 0 ? Math.round(totalApprovedWords / blocks.length) : 0;

      return {
        approvedCount: blocks.length,
        totalApprovedWords,
        averageWordsPerChapter,
        estimatedPrintPages: Math.max(1, Math.round(totalApprovedWords / 280)),
        estimatedReadingMinutes: Math.max(1, Math.round(totalApprovedWords / 220)),
        chapters: blocks
      };
    }

    detectOrphanedClueMentions(selectedChapters = []) {
      const clues = Array.isArray(NS.storyBible?.cluesLedger)
        ? NS.storyBible.cluesLedger
        : [];
      const planted = clues.filter((c) => c.status !== 'RESOLVED');
      const hits = [];

      for (const ch of selectedChapters) {
        const lowContent = String(ch.content || '').toLowerCase();
        if (!lowContent) continue;
        for (const clue of planted) {
          const keywords = String(clue.title || '')
            .toLowerCase()
            .split(/\s+/)
            .filter((w) => w.length >= 3);
          if (keywords.length === 0) continue;
          const hitCount = keywords.filter((kw) => lowContent.includes(kw)).length;
          if (hitCount >= Math.min(2, keywords.length)) {
            hits.push({
              chapterTitle: ch.displayTitle || ch.title || 'Chương',
              clueTitle: clue.title,
              plantedIn: clue.plantedIn || 'Trước đó'
            });
          }
        }
      }

      return hits.slice(0, 8);
    }

    buildPlainTextClueBacklogChecklist() {
      const evalRes = this.evaluateUnresolvedCluesBacklog();
      const lines = [
        '=== SỔ KIỂM TRA PHỤC BÚT & MỐC CỐT TRUYỆN ĐÃ CHỐT ===',
        `- Tổng số phục bút: ${evalRes.totalClues} (Đã thu hồi: ${evalRes.resolvedCount}, Đang treo: ${evalRes.plantedCount})`,
        `- Tỷ lệ thu hồi: ${evalRes.payoffRatio}%`,
        `- Khuyến nghị: ${evalRes.urgentReminder}`
      ];
      if (evalRes.oldestPlanted.length > 0) {
        lines.push('', 'Các manh mối đang treo lâu nhất:');
        for (const item of evalRes.oldestPlanted) {
          lines.push(`  • ${item.title} (gieo tại ${item.plantedIn})`);
        }
      }
      return lines.join('\n');
    }
  }

  // Nối thêm thông tin phục bút vào Footer Modal Chốt Duyệt
  const origMountFooter =
    ApprovalModalProgressFooterController.prototype.mountOrUpdateFooterBar;
  ApprovalModalProgressFooterController.prototype.mountOrUpdateFooterBar =
    function () {
      const mounted = origMountFooter.call(this);
      if (!mounted) return false;

      const statsStrip = document.getElementById(
        'approve-modal-book-progress-strip'
      );
      if (!statsStrip || !this.extractor.cluePlanner) return mounted;

      let clueHintEl = document.getElementById('approve-modal-clue-backlog-hint');
      if (!clueHintEl) {
        clueHintEl = document.createElement('div');
        clueHintEl.id = 'approve-modal-clue-backlog-hint';
        clueHintEl.className =
          'pt-1 border-t border-zinc-800/70 text-[10px] text-indigo-300';
        statsStrip.appendChild(clueHintEl);
      }

      const clueEval = this.extractor.cluePlanner.evaluateUnresolvedCluesBacklog();
      const relatedClues = this.extractor.cluePlanner.detectOrphanedClueMentions(
        this.extractor.checklistRenderer.getSelectedChapterObjects()
      );
      const esc = getUtils().escapeHtml;

      clueHintEl.innerHTML = [
        `<div>🔫 Phục bút Story Bible: <strong>${clueEval.resolvedCount}/${clueEval.totalClues}</strong> đã thu hồi (${clueEval.payoffRatio}%). ${esc(clueEval.urgentReminder)}</div>`,
        relatedClues.length > 0
          ? `<div class="text-emerald-300 mt-0.5">🔗 Phát hiện nhắc lại manh mối cũ: ${esc(
              relatedClues.map((r) => `"${r.clueTitle}"`).join(', ')
            )}</div>`
          : ''
      ].join('');

      return true;
    };

  // ==========================================================================
  // LỚP 14: MA TRẬN THEO DÕI MẬT ĐỘ XUẤT HIỆN NHÂN VẬT QUA TỪNG CHƯƠNG ĐÃ DUYỆT
  // ==========================================================================
  class CharacterAppearanceAndPacingCoverageBuilder {
    constructor(extractor) {
      this.extractor = extractor;
    }

    buildCharacterCoverageMatrix(chapters = []) {
      const approved = chapters.filter((c) => c.status === 'APPROVED');
      const bibleChars = Array.isArray(NS.storyBible?.characters)
        ? NS.storyBible.characters
        : [];
      if (approved.length === 0 || bibleChars.length === 0) {
        return {
          approvedChapterCount: approved.length,
          characterCount: bibleChars.length,
          rows: []
        };
      }

      const rows = bibleChars.map((chProfile) => {
        const name = String(chProfile.name || '').trim();
        const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = name
          ? new RegExp(`(?:^|[^\\p{L}])${escaped}(?=$|[^\\p{L}])`, 'giu')
          : null;

        let firstSeenChapter = null;
        let lastSeenChapter = null;
        let totalMentions = 0;
        const perChapter = [];

        for (const chap of approved) {
          const content = String(chap.content || '');
          const count = regex ? (content.match(regex) || []).length : 0;
          const title = chap.displayTitle || chap.title || 'Chương';
          if (count > 0) {
            if (!firstSeenChapter) firstSeenChapter = title;
            lastSeenChapter = title;
            totalMentions += count;
          }
          perChapter.push({ chapterId: chap.id, title, mentions: count });
        }

        const chaptersWithPresence = perChapter.filter((p) => p.mentions > 0).length;
        const absentStreakWarning =
          approved.length >= 4 &&
          chaptersWithPresence > 0 &&
          perChapter.slice(-2).every((p) => p.mentions === 0);

        return {
          name,
          role: chProfile.role || 'Nhân vật',
          firstSeenChapter,
          lastSeenChapter,
          totalMentions,
          chaptersWithPresence,
          presencePercent: Math.round(
            (chaptersWithPresence / Math.max(1, approved.length)) * 100
          ),
          absentStreakWarning
        };
      });

      rows.sort((a, b) => b.totalMentions - a.totalMentions);
      return {
        approvedChapterCount: approved.length,
        characterCount: bibleChars.length,
        rows
      };
    }

    buildCoverageSummaryText() {
      const chapters = this.extractor.checklistRenderer.getAllChaptersSafe();
      const matrix = this.buildCharacterCoverageMatrix(chapters);
      if (matrix.rows.length === 0) {
        return 'Chưa đủ dữ liệu chương Đã Duyệt và Nhân vật Story Bible để dựng ma trận tần suất.';
      }
      const lines = [
        `=== MA TRẬN MẬT ĐỘ NHÂN VẬT TRONG ${matrix.approvedChapterCount} CHƯƠNG ĐÃ DUYỆT ===`
      ];
      for (const r of matrix.rows.slice(0, 12)) {
        const warn = r.absentStreakWarning ? ' ⚠️ (Vắng mặt 2 chương gần nhất)' : '';
        lines.push(
          `• ${r.name} (${r.role}): ${r.totalMentions} lần tại ${r.chaptersWithPresence}/${matrix.approvedChapterCount} chương (${r.presencePercent}%)${warn}`
        );
      }
      return lines.join('\n');
    }

    exportCombinedBibleDeltaJson() {
      return JSON.stringify(
        {
          exportedAt: new Date().toISOString(),
          aggregateStats: this.extractor.ledgerStore.getAggregateStats(),
          bookProgress: this.extractor.reporter.computeBookApprovalProgress(
            this.extractor.checklistRenderer.getAllChaptersSafe()
          ),
          clueBacklog:
            this.extractor.cluePlanner.evaluateUnresolvedCluesBacklog(),
          characterCoverage: this.buildCharacterCoverageMatrix(
            this.extractor.checklistRenderer.getAllChaptersSafe()
          )
        },
        null,
        2
      );
    }
  }

  // ==========================================================================
  // ĐĂNG KÝ SINGLETON LÊN `window.NoirStudio.approvalExtractor`
  // ==========================================================================
  const approvalExtractorEngine = new SmartApprovalAndBibleExtractorEngine();
  approvalExtractorEngine.shiftCoordinator =
    new RelationshipShiftAndRevertCoordinator(approvalExtractorEngine);
  approvalExtractorEngine.progressFooter =
    new ApprovalModalProgressFooterController(approvalExtractorEngine);
  approvalExtractorEngine.cluePlanner =
    new BookArcProgressionAndCluePayoffPlanner(approvalExtractorEngine);
  approvalExtractorEngine.coverageBuilder =
    new CharacterAppearanceAndPacingCoverageBuilder(approvalExtractorEngine);

  approvalExtractorEngine.revertChaptersToDraft = (ids) =>
    approvalExtractorEngine.shiftCoordinator.revertChaptersBackToDraftSafe(ids);
  approvalExtractorEngine.getSeriesHeatmap = () =>
    approvalExtractorEngine.shiftCoordinator.buildSeriesApprovalHeatmap(
      approvalExtractorEngine.checklistRenderer.getAllChaptersSafe()
    );
  approvalExtractorEngine.exportAuditReportMarkdown = () =>
    approvalExtractorEngine.progressFooter.exportApprovalAuditReportMarkdown();
  approvalExtractorEngine.getApprovedArcSummary = () =>
    approvalExtractorEngine.cluePlanner.buildApprovedArcStructureSummary(
      approvalExtractorEngine.checklistRenderer.getAllChaptersSafe()
    );
  approvalExtractorEngine.getClueBacklogReport = () =>
    approvalExtractorEngine.cluePlanner.buildPlainTextClueBacklogChecklist();
  approvalExtractorEngine.getCharacterCoverageReport = () =>
    approvalExtractorEngine.coverageBuilder.buildCoverageSummaryText();

  approvalExtractorEngine.getQuickStatusSummary = () => {
    const chaps = approvalExtractorEngine.checklistRenderer.getAllChaptersSafe();
    const prog = approvalExtractorEngine.reporter.computeBookApprovalProgress(chaps);
    const backlog =
      approvalExtractorEngine.cluePlanner.evaluateUnresolvedCluesBacklog();
    return {
      approvedChapters: prog.approvedChapters,
      totalChapters: prog.totalChapters,
      completionRatio: prog.completionRatio,
      unresolvedClues: backlog.plantedCount,
      resolvedClues: backlog.resolvedCount
    };
  };

  approvalExtractorEngine.buildChapterWordTargetReadiness = (minWords = 1500) => {
    const chaps = approvalExtractorEngine.checklistRenderer.getAllChaptersSafe();
    const utils = getUtils();
    return chaps.map((ch) => {
      const words = utils.countVietnameseWords(ch.content || '');
      return {
        id: ch.id,
        title: ch.displayTitle || ch.title || 'Chương',
        status: ch.status || 'DRAFT',
        wordCount: words,
        meetsMinimum: words >= minWords,
        deficitWords: Math.max(0, minWords - words)
      };
    });
  };

  NS.approvalExtractor = approvalExtractorEngine;
  NS.SmartApprovalAndBibleExtractorEngine = SmartApprovalAndBibleExtractorEngine;

  if (typeof NS.registerModule === 'function') {
    NS.registerModule('mod19', approvalExtractorEngine);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        if (!approvalExtractorEngine.hasInitialized) approvalExtractorEngine.init();
      });
    } else {
      approvalExtractorEngine.init();
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
