/**
 * ============================================================================
 * MODULE 23: CHUẨN HÓA THOẠI TIẾNG VIỆT, TÌM THAY THẾ & CÔNG CỤ SOẠN THẢO
 * Tệp: mod23_dialogue_normalizer_and_vn_editor_tools.js
 * ============================================================================
 * Nhiệm vụ chuyên biệt:
 *   1. Chuẩn hóa câu thoại tiểu thuyết Tiếng Việt (`#btn-instant-clean-dialogue`)
 *      sang chuẩn studio `- Câu thoại tự nhiên. (Tên nhân vật)`, sửa khoảng trắng
 *      dấu câu, chuẩn hóa dấu ba chấm `…` & dấu gạch ngang `—`.
 *   2. Thanh Tìm kiếm & Thay thế tức thì (`#editor-find-replace-bar`,
 *      `#input-find-text`, `#input-replace-text`, `#btn-do-replace-next`,
 *      `#btn-do-replace-all`, `#find-replace-match-count`) kèm tùy chọn phân biệt
 *      chữ hoa/thường & đếm kết quả theo thời gian thực.
 *   3. Chế độ Máy Đánh Chữ (`#btn-toggle-typewriter-mode`) luôn giữ dòng đang gõ
 *      ở vị trí dễ nhìn nhất trên màn hình (Desktop & Mobile).
 *   4. Thanh Chèn Nhanh Mobile (`#mobile-writer-quickbar` với `[data-quick-insert]`):
 *      xử lý thông minh `\n`, đặt con trỏ tự động vào giữa cặp ngoặc `()` hoặc `“”`.
 * ============================================================================
 */
(function (global) {
  'use strict';

  const NS = (global.NoirStudio = global.NoirStudio || {});

  const EDITOR_PREFS_STORAGE_KEY = 'noir_v38_editor_tools_prefs_v1';

  const VIETNAMESE_DIALOGUE_VERBS = Object.freeze([
    'nói',
    'hỏi',
    'đáp',
    'trả lời',
    'thì thầm',
    'gắt',
    'lẩm bẩm',
    'cười nhạt',
    'khẽ đáp',
    'hét lên',
    'quát',
    'than thở',
    'ngắt lời',
    'tiếp lời',
    'chêm vào',
    'lên tiếng',
    'nhắc nhỏ',
    'khẳng định'
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
  // LỚP 1: BỘ CHUẨN HÓA CÂU THOẠI & CHÍNH TẢ DẤU CÂU TIẾNG VIỆT
  // ==========================================================================
  class VietnameseDialogueAndPunctuationNormalizer {
    constructor() {
      this.defaultOptions = {
        convertQuotedStandaloneLinesToDash: true,
        normalizeThreeDotsToEllipsis: false,
        collapseExcessBlankLines: true,
        fixSpacingBeforePunctuation: true,
        normalizeDashDialoguePrefix: true,
        preserveSceneDividers: true
      };
    }

    normalizeManuscriptText(rawText, userOpts = {}) {
      const opts = { ...this.defaultOptions, ...userOpts };
      let text = String(rawText || '');
      if (!text.trim()) {
        return {
          changed: false,
          cleanedText: text,
          stats: {
            dialogueLinesFormatted: 0,
            quotesConverted: 0,
            spacingFixes: 0,
            blankLinesCollapsed: 0
          }
        };
      }

      const original = text;
      const stats = {
        dialogueLinesFormatted: 0,
        quotesConverted: 0,
        spacingFixes: 0,
        blankLinesCollapsed: 0
      };

      // Chuẩn hóa ký tự xuống dòng CRLF -> LF & tab thừa đầu dòng
      text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

      const lines = text.split('\n');
      const outputLines = [];

      for (let i = 0; i < lines.length; i += 1) {
        let line = lines[i].replace(/\u00A0/g, ' ').replace(/[ \t]+$/g, '');
        const trimmed = line.trim();

        // Giữ nguyên dải phân cách phân cảnh như `* * *` hoặc `---`
        if (/^(\*\s*\*\s*\*|---+|===+)$/.test(trimmed)) {
          outputLines.push('* * *');
          continue;
        }

        if (!trimmed) {
          outputLines.push('');
          continue;
        }

        // 1. Sửa dấu gạch đầu dòng thoại không đồng nhất (–, —, -, * thoại)
        if (
          opts.normalizeDashDialoguePrefix &&
          /^\s*([–—\-•])\s*(\S.*)$/.test(line)
        ) {
          const m = line.match(/^\s*([–—\-•])\s*(\S.*)$/);
          if (m && !/^(\*\s*\*|---)/.test(trimmed)) {
            const body = m[2].trim();
            const normalized = `- ${body}`;
            if (normalized !== line.trim()) {
              stats.dialogueLinesFormatted += 1;
            }
            line = normalized;
          }
        }

        // 2. Chuyển dòng thoại chỉ bọc trong ngoặc kép `"..."` hoặc `“...”` thành `- ...`
        if (
          opts.convertQuotedStandaloneLinesToDash &&
          /^(["“])([^"”\n]{3,320})(["”])(\s*\([^()\n]{2,34}\))?$/.test(trimmed)
        ) {
          const qm = trimmed.match(
            /^(["“])([^"”\n]{3,320})(["”])(\s*\([^()\n]{2,34}\))?$/
          );
          if (qm) {
            const spoken = qm[2].trim();
            const tag = qm[4] ? ` ${qm[4].trim()}` : '';
            line = `- ${spoken}${tag}`;
            stats.quotesConverted += 1;
          }
        }

        // 3. Chuyển mẫu `Tên NV nói: "Câu thoại"` khi đứng riêng cả dòng sang `- Câu thoại (Tên NV)`
        const verbAlt = VIETNAMESE_DIALOGUE_VERBS.map(escapeRegExp).join('|');
        const inlineSpeakerRe = new RegExp(
          `^([A-ZÀ-Ỹ][\\p{L}\\s]{1,28})\\s+(?:${verbAlt})\\s*:\\s*["“]([^"”\\n]{3,300})["”]([.!?…]?)$`,
          'u'
        );
        const inlineMatch = line.match(inlineSpeakerRe);
        if (inlineMatch) {
          const speakerName = inlineMatch[1].trim();
          let body = inlineMatch[2].trim();
          if (inlineMatch[3] && !/[.!?…]$/.test(body)) {
            body += inlineMatch[3];
          }
          line = `- ${body} (${speakerName})`;
          stats.quotesConverted += 1;
        }

        // 4. Dọn khoảng trắng trước dấu câu (trừ trước chữ ký chú thích `(Tên NV)`)
        if (opts.fixSpacingBeforePunctuation) {
          const beforePunct = line;
          line = line
            .replace(/([^\s(])\s+([,.;:!?])(?![\d)])/g, '$1$2')
            .replace(/([,;!?])([^\s"”’)\d\n])/g, '$1 $2')
            .replace(/ {2,}/g, ' ');
          if (line !== beforePunct) {
            stats.spacingFixes += 1;
          }
        }

        // 5. Chuẩn hóa dấu ba chấm nếu người dùng bật tùy chọn
        if (opts.normalizeThreeDotsToEllipsis && /\.{3}/.test(line)) {
          line = line.replace(/\.{3,}/g, '…');
        }

        outputLines.push(line);
      }

      let finalText = outputLines.join('\n');

      // Thu gọn nhiều dòng trống liên tiếp (trên 2 dòng xuống dòng) về đúng 1 dòng ngăn cách đoạn
      if (opts.collapseExcessBlankLines) {
        const beforeCollapse = finalText;
        finalText = finalText.replace(/\n{3,}/g, '\n\n').trim();
        if (finalText !== beforeCollapse) {
          stats.blankLinesCollapsed += 1;
        }
      }

      return {
        changed: finalText !== original,
        cleanedText: finalText,
        stats
      };
    }

    analyzeDialogueBalance(rawText) {
      const lines = String(rawText || '').split('\n');
      let dialogueLines = 0;
      let taggedDialogueLines = 0;
      let narrativeParas = 0;
      let dialogueWords = 0;
      let totalWords = 0;
      const utils = getUtils();

      for (const raw of lines) {
        const t = raw.trim();
        if (!t || /^(\*\s*\*\s*\*|---)$/.test(t)) continue;
        const wc = utils.countVietnameseWords(t);
        totalWords += wc;

        if (/^[-–—]\s+/.test(t)) {
          dialogueLines += 1;
          dialogueWords += wc;
          if (/\([^()\n]{2,34}\)\s*$/.test(t)) {
            taggedDialogueLines += 1;
          }
        } else {
          narrativeParas += 1;
        }
      }

      const dialoguePct =
        totalWords > 0 ? Math.round((dialogueWords / totalWords) * 100) : 0;

      return {
        dialogueLines,
        taggedDialogueLines,
        narrativeParas,
        dialogueWords,
        totalWords,
        dialoguePercent: dialoguePct,
        recommendation:
          dialoguePct > 68
            ? 'Tỷ lệ đối thoại rất cao (>68%) — cân nhắc chèn thêm hành động cơ thể & không gian giữa các lượt thoại.'
            : dialoguePct < 10 && totalWords > 400
              ? 'Ít đối thoại (<10%) — đoạn văn nặng tính trần thuật, có thể mở thêm thoại ngắn tạo tương tác.'
              : 'Tỷ lệ Thoại / Miêu tả cân bằng tự nhiên!'
      };
    }
  }

  // ==========================================================================
  // LỚP 2: ĐỘNG CƠ TÌM KIẾM & THAY THẾ TRONG BẢN THẢO TAB 1
  // ==========================================================================
  class ManuscriptFindAndReplaceEngine {
    constructor(tools) {
      this.tools = tools;
      this.isOpen = false;
      this.caseSensitive = false;
      this.wholeWord = false;
      this.lastMatchIndex = -1;
      this.matches = [];
    }

    getEditor() {
      return document.getElementById('textarea-chapter-content');
    }

    buildSearchRegex(query, flagsOverride = null) {
      if (!query) return null;
      const escaped = escapeRegExp(query);
      const pattern = this.wholeWord
        ? `(?<=^|[^\\p{L}\\p{N}_])${escaped}(?=$|[^\\p{L}\\p{N}_])`
        : escaped;
      const flags =
        flagsOverride || `${this.caseSensitive ? '' : 'i'}gu`;
      try {
        return new RegExp(pattern, flags);
      } catch (_) {
        // Dự phòng cho trình duyệt cũ không hỗ trợ lookbehind
        return new RegExp(escaped, `${this.caseSensitive ? '' : 'i'}g`);
      }
    }

    scanMatches() {
      const editor = this.getEditor();
      const findInp = document.getElementById('input-find-text');
      const countBadge = document.getElementById('find-replace-match-count');

      const query = findInp ? findInp.value : '';
      this.matches = [];

      if (!editor || !query) {
        if (countBadge) countBadge.textContent = '';
        return [];
      }

      const text = editor.value || '';
      const regex = this.buildSearchRegex(query);
      if (!regex) {
        if (countBadge) countBadge.textContent = '0 kết quả';
        return [];
      }

      let m;
      while ((m = regex.exec(text)) !== null) {
        this.matches.push({
          start: m.index,
          end: m.index + m[0].length,
          matchedText: m[0]
        });
        if (m.index === regex.lastIndex) regex.lastIndex += 1;
        if (this.matches.length >= 2000) break;
      }

      if (countBadge) {
        countBadge.textContent =
          this.matches.length > 0
            ? `${this.matches.length} vị trí khớp`
            : 'Không tìm thấy';
      }
      return this.matches;
    }

    highlightMatchInEditor(matchObj) {
      const editor = this.getEditor();
      if (!editor || !matchObj) return;
      editor.focus();
      editor.setSelectionRange(matchObj.start, matchObj.end);

      // Cuộn nhẹ để kết quả hiện trong vùng nhìn thấy
      const textBefore = editor.value.slice(0, matchObj.start);
      const approxLines = textBefore.split('\n').length;
      const linePx =
        parseFloat(getComputedStyle(editor).lineHeight) || 26;
      const targetScroll = Math.max(
        0,
        approxLines * linePx - editor.clientHeight * 0.35
      );
      editor.scrollTop = targetScroll;
    }

    findNextAndHighlight() {
      const matches = this.scanMatches();
      if (matches.length === 0) {
        getUtils().showToast('Không tìm thấy từ khóa trong chương hiện tại.', 'warn', 2000);
        return null;
      }
      const editor = this.getEditor();
      const curPos = editor ? editor.selectionEnd || 0 : 0;
      let nextIdx = matches.findIndex((m) => m.start >= curPos);
      if (nextIdx < 0) nextIdx = 0;

      this.lastMatchIndex = nextIdx;
      this.highlightMatchInEditor(matches[nextIdx]);
      const badge = document.getElementById('find-replace-match-count');
      if (badge) {
        badge.textContent = `Vị trí ${nextIdx + 1}/${matches.length}`;
      }
      return matches[nextIdx];
    }

    replaceFirstOrSelected() {
      const editor = this.getEditor();
      const findInp = document.getElementById('input-find-text');
      const replaceInp = document.getElementById('input-replace-text');
      if (!editor || !findInp) return false;

      const query = findInp.value;
      if (!query) {
        getUtils().showToast('⚠️ Hãy nhập từ cần tìm trước.', 'warn', 2000);
        return false;
      }

      const replacement = replaceInp ? replaceInp.value : '';
      const matches = this.scanMatches();
      if (matches.length === 0) {
        getUtils().showToast('Không có vị trí nào khớp để thay thế.', 'warn', 2000);
        return false;
      }

      const selStart = editor.selectionStart;
      const selEnd = editor.selectionEnd;
      let target = matches.find(
        (m) => m.start === selStart && m.end === selEnd
      );
      if (!target) {
        target =
          matches.find((m) => m.start >= selStart) || matches[0];
      }

      this.tools.pushUndoCheckpointBeforeEdit('Trước khi Thay thế 1 vị trí');
      const val = editor.value;
      editor.value =
        val.slice(0, target.start) + replacement + val.slice(target.end);

      const newEnd = target.start + replacement.length;
      editor.focus();
      editor.setSelectionRange(newEnd, newEnd);
      this.tools.notifyEditorMutated('FIND_REPLACE_ONE');
      this.scanMatches();
      getUtils().showToast('✓ Đã thay thế 1 vị trí!', 'success', 1800);
      return true;
    }

    replaceAllOccurrences() {
      const editor = this.getEditor();
      const findInp = document.getElementById('input-find-text');
      const replaceInp = document.getElementById('input-replace-text');
      if (!editor || !findInp) return 0;

      const query = findInp.value;
      if (!query) {
        getUtils().showToast('⚠️ Hãy nhập từ cần tìm trước khi thay tất cả.', 'warn');
        return 0;
      }

      const replacement = replaceInp ? replaceInp.value : '';
      const regex = this.buildSearchRegex(query);
      if (!regex) return 0;

      const original = editor.value || '';
      let replacedCount = 0;
      const nextText = original.replace(regex, () => {
        replacedCount += 1;
        return replacement;
      });

      if (replacedCount === 0) {
        getUtils().showToast('Không tìm thấy từ khóa nào phù hợp.', 'info');
        return 0;
      }

      this.tools.pushUndoCheckpointBeforeEdit(
        `Trước khi Thay thế tất cả "${query}"`
      );
      editor.value = nextText;
      this.tools.notifyEditorMutated('FIND_REPLACE_ALL');
      this.scanMatches();
      getUtils().showToast(
        `✅ Đã thay thế thành công ${replacedCount} vị trí "${query}" → "${replacement}"!`,
        'success',
        3200
      );
      return replacedCount;
    }

    openBar(prefillSelection = true) {
      const bar = document.getElementById('editor-find-replace-bar');
      const findInp = document.getElementById('input-find-text');
      const editor = this.getEditor();
      if (!bar) return false;

      bar.classList.remove('hidden');
      this.isOpen = true;

      if (prefillSelection && editor && findInp) {
        const s = editor.selectionStart;
        const e = editor.selectionEnd;
        if (e > s && e - s <= 80) {
          const selected = editor.value.slice(s, e).trim();
          if (selected && !selected.includes('\n')) {
            findInp.value = selected;
          }
        }
      }

      this.scanMatches();
      if (findInp) {
        setTimeout(() => {
          findInp.focus();
          findInp.select();
        }, 30);
      }
      return true;
    }

    closeBar() {
      const bar = document.getElementById('editor-find-replace-bar');
      if (bar) bar.classList.add('hidden');
      this.isOpen = false;
    }
  }

  // ==========================================================================
  // LỚP 3: CHẾ ĐỘ MÁY ĐÁNH CHỮ (TYPEWRITER SCROLL) & CHÈN NHANH MOBILE
  // ==========================================================================
  class TypewriterScrollAndMobileQuickbarEngine {
    constructor(tools) {
      this.tools = tools;
      this.typewriterActive = false;
      this.mirrorDiv = null;
      this.loadPrefs();
    }

    loadPrefs() {
      try {
        const raw = localStorage.getItem(EDITOR_PREFS_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          this.typewriterActive = Boolean(parsed?.typewriterActive);
        }
      } catch (_) {}
    }

    savePrefs() {
      try {
        localStorage.setItem(
          EDITOR_PREFS_STORAGE_KEY,
          JSON.stringify({ typewriterActive: this.typewriterActive })
        );
      } catch (_) {}
    }

    ensureMirrorMeasurer(textarea) {
      if (!this.mirrorDiv) {
        const div = document.createElement('div');
        div.id = 'mod23-typewriter-mirror';
        div.setAttribute('aria-hidden', 'true');
        div.style.position = 'fixed';
        div.style.top = '-9999px';
        div.style.left = '-9999px';
        div.style.visibility = 'hidden';
        div.style.pointerEvents = 'none';
        div.style.whiteSpace = 'pre-wrap';
        div.style.wordWrap = 'break-word';
        div.style.overflowWrap = 'break-word';
        document.body.appendChild(div);
        this.mirrorDiv = div;
      }

      const cs = getComputedStyle(textarea);
      const copyProps = [
        'fontFamily',
        'fontSize',
        'fontWeight',
        'lineHeight',
        'letterSpacing',
        'paddingTop',
        'paddingRight',
        'paddingBottom',
        'paddingLeft',
        'boxSizing',
        'tabSize'
      ];
      for (const prop of copyProps) {
        this.mirrorDiv.style[prop] = cs[prop];
      }
      this.mirrorDiv.style.width = `${textarea.clientWidth}px`;
      return this.mirrorDiv;
    }

    measureCaretVerticalPixel(textarea) {
      const mirror = this.ensureMirrorMeasurer(textarea);
      const pos = Number(textarea.selectionStart || 0);
      const before = textarea.value.slice(0, pos);
      mirror.textContent = before;

      const span = document.createElement('span');
      span.textContent = textarea.value.slice(pos, pos + 1) || '\u200b';
      mirror.appendChild(span);

      const topPx = span.offsetTop;
      return topPx;
    }

    centerActiveLineInViewport(smooth = false) {
      if (!this.typewriterActive) return;
      const textarea = document.getElementById('textarea-chapter-content');
      if (!textarea) return;

      const caretY = this.measureCaretVerticalPixel(textarea);
      const targetScrollTop = Math.max(
        0,
        caretY - Math.round(textarea.clientHeight * 0.44)
      );

      if (smooth && typeof textarea.scrollTo === 'function') {
        textarea.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
      } else {
        textarea.scrollTop = targetScrollTop;
      }
    }

    toggleTypewriterMode(explicitVal = null) {
      this.typewriterActive =
        typeof explicitVal === 'boolean' ? explicitVal : !this.typewriterActive;
      this.savePrefs();
      this.syncTypewriterButtonUI();

      if (this.typewriterActive) {
        this.centerActiveLineInViewport(true);
        getUtils().showToast(
          '⌨️ Đã bật Chế độ Máy Đánh Chữ — dòng đang viết luôn giữ ở tâm mắt!',
          'success',
          2600
        );
      } else {
        getUtils().showToast('⌨️ Đã tắt Chế độ Máy Đánh Chữ.', 'info', 1800);
      }
      return this.typewriterActive;
    }

    syncTypewriterButtonUI() {
      const btn = document.getElementById('btn-toggle-typewriter-mode');
      const textarea = document.getElementById('textarea-chapter-content');
      if (btn) {
        btn.setAttribute(
          'data-typewriter-active',
          this.typewriterActive ? 'true' : 'false'
        );
        if (this.typewriterActive) {
          btn.classList.add('ring-2', 'ring-emerald-400', 'bg-emerald-600/20', 'text-emerald-300');
        } else {
          btn.classList.remove('ring-2', 'ring-emerald-400', 'bg-emerald-600/20', 'text-emerald-300');
        }
      }
      if (textarea) {
        if (this.typewriterActive) {
          textarea.classList.add('typewriter-focus-active');
        } else {
          textarea.classList.remove('typewriter-focus-active');
        }
      }
    }

    decodeQuickInsertSequence(rawToken) {
      return String(rawToken || '')
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t');
    }

    insertSnippetAtEditorCaret(rawToken) {
      const textarea = document.getElementById('textarea-chapter-content');
      if (!textarea) return false;

      const decoded = this.decodeQuickInsertSequence(rawToken);
      const start = Number(textarea.selectionStart ?? textarea.value.length);
      const end = Number(textarea.selectionEnd ?? textarea.value.length);
      const selected = textarea.value.slice(start, end);

      let inserted = decoded;
      let nextCursorPos = start + inserted.length;

      // Nếu đang bôi đen chữ & bấm cặp ngoặc `()` hoặc `“”` -> bọc luôn quanh đoạn chữ
      if (decoded === '“”') {
        if (selected) {
          inserted = `“${selected}”`;
          nextCursorPos = start + inserted.length;
        } else {
          nextCursorPos = start + 1;
        }
      } else if (decoded === ' ()' || decoded === '()') {
        if (selected) {
          inserted = ` (${selected})`;
          nextCursorPos = start + inserted.length;
        } else {
          nextCursorPos = start + decoded.indexOf('(') + 1;
        }
      }

      const before = textarea.value.slice(0, start);
      const after = textarea.value.slice(end);
      textarea.value = before + inserted + after;
      textarea.focus();
      textarea.setSelectionRange(nextCursorPos, nextCursorPos);

      this.tools.notifyEditorMutated('MOBILE_QUICK_INSERT');
      if (this.typewriterActive) {
        this.centerActiveLineInViewport(false);
      }
      return true;
    }
  }

  // ==========================================================================
  // LỚP 4: BỘ TĂNG CƯỜNG THANH TÌM & THAY THẾ + GỢI Ý SỬA NHANH BẢN THẢO
  // ==========================================================================
  class FindReplaceBarAndStyleEnhancer {
    constructor(tools) {
      this.tools = tools;
      this.enhancementsMounted = false;
    }

    ensureFindBarExtrasMounted() {
      const bar = document.getElementById('editor-find-replace-bar');
      const countBadge = document.getElementById('find-replace-match-count');
      if (!bar || !countBadge || !countBadge.parentElement) return false;
      if (document.getElementById('btn-find-jump-next-only')) {
        this.enhancementsMounted = true;
        return true;
      }

      const nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.id = 'btn-find-jump-next-only';
      nextBtn.className =
        'px-2.5 py-1 rounded-lg border border-amber-500/40 bg-zinc-900 hover:bg-zinc-800 text-amber-200 font-bold text-[11px]';
      nextBtn.textContent = '🔎 Tìm tiếp';

      const caseLabel = document.createElement('label');
      caseLabel.className =
        'inline-flex items-center gap-1 text-[11px] text-zinc-300 cursor-pointer select-none px-1';
      caseLabel.innerHTML =
        '<input id="chk-find-case-sensitive" type="checkbox" class="accent-amber-500" /> Phân biệt HOA/thường';

      const wholeLabel = document.createElement('label');
      wholeLabel.className =
        'inline-flex items-center gap-1 text-[11px] text-zinc-300 cursor-pointer select-none px-1';
      wholeLabel.innerHTML =
        '<input id="chk-find-whole-word" type="checkbox" class="accent-amber-500" /> Nguyên từ';

      countBadge.parentElement.insertBefore(nextBtn, countBadge);
      countBadge.parentElement.insertBefore(caseLabel, countBadge);
      countBadge.parentElement.insertBefore(wholeLabel, countBadge);

      nextBtn.addEventListener('click', () => {
        this.tools.findEngine.findNextAndHighlight();
      });
      caseLabel
        .querySelector('input')
        ?.addEventListener('change', (ev) => {
          this.tools.findEngine.caseSensitive = Boolean(ev.target?.checked);
          this.tools.findEngine.scanMatches();
        });
      wholeLabel
        .querySelector('input')
        ?.addEventListener('change', (ev) => {
          this.tools.findEngine.wholeWord = Boolean(ev.target?.checked);
          this.tools.findEngine.scanMatches();
        });

      this.enhancementsMounted = true;
      return true;
    }
  }

  // ==========================================================================
  // LỚP 5: BỘ RÀ SOÁT NHỊP ĐOẠN VĂN, LẶP TỪ LIỀN KỀ & CHIA ĐOẠN ĐỌC MOBILE
  // ==========================================================================
  class VietnameseCopyeditAndParagraphRefiner {
    splitDenseParagraphForMobileReading(rawText, maxWordsPerPara = 95) {
      const paragraphs = String(rawText || '').split('\n');
      const result = [];
      let splitCount = 0;

      for (const line of paragraphs) {
        const trimmed = line.trim();
        if (!trimmed || /^[-–—]\s+/.test(trimmed) || /^(\*\s*\*\s*\*|---)$/.test(trimmed)) {
          result.push(line);
          continue;
        }

        const words = trimmed.split(/\s+/).filter(Boolean);
        if (words.length <= maxWordsPerPara) {
          result.push(trimmed);
          continue;
        }

        // Tách nhẹ nhàng theo ranh giới câu hoàn chỉnh để người đọc điện thoại đỡ mỏi mắt
        const sentences = trimmed
          .split(/(?<=[.!?…])\s+/)
          .filter((s) => s.trim().length > 0);
        if (sentences.length < 3) {
          result.push(trimmed);
          continue;
        }

        let buffer = [];
        let bufWords = 0;
        for (const sent of sentences) {
          const sw = sent.split(/\s+/).filter(Boolean).length;
          if (bufWords > 0 && bufWords + sw > Math.floor(maxWordsPerPara * 0.72)) {
            result.push(buffer.join(' '));
            result.push('');
            buffer = [sent];
            bufWords = sw;
            splitCount += 1;
          } else {
            buffer.push(sent);
            bufWords += sw;
          }
        }
        if (buffer.length > 0) {
          result.push(buffer.join(' '));
        }
      }

      return {
        changed: splitCount > 0,
        splitCount,
        text: result.join('\n').replace(/\n{3,}/g, '\n\n')
      };
    }

    findAdjacentRepeatedSentenceStarters(rawText) {
      const sentences = String(rawText || '')
        .split(/(?<=[.!?…])\s+|\n+/)
        .map((s) => s.trim())
        .filter((s) => s.length >= 12 && !/^[-–—]/.test(s));

      const repeats = [];
      let prevStarter = '';
      for (let i = 0; i < sentences.length; i += 1) {
        const words = sentences[i].split(/\s+/).filter(Boolean);
        const starter = (words[0] || '').toLowerCase();
        if (starter && starter.length >= 2 && starter === prevStarter) {
          repeats.push({
            starter: words[0],
            previousSentence: sentences[i - 1].slice(0, 80),
            currentSentence: sentences[i].slice(0, 80)
          });
        }
        prevStarter = starter;
      }
      return repeats;
    }

    findDenseNarrativeWalls(rawText, thresholdWords = 115) {
      const blocks = String(rawText || '').split(/\n{2,}/);
      const utils = getUtils();
      const walls = [];
      blocks.forEach((blk, idx) => {
        const t = blk.trim();
        if (!t || /^[-–—]\s+/.test(t)) return;
        const w = utils.countVietnameseWords(t);
        if (w >= thresholdWords) {
          walls.push({
            paragraphIndex: idx + 1,
            wordCount: w,
            excerpt: t.slice(0, 90)
          });
        }
      });
      return walls;
    }

    findUntaggedLongDialogueStreaks(rawText, streakMin = 4) {
      const lines = String(rawText || '').split('\n');
      const streaks = [];
      let currentStreak = 0;
      let startLine = -1;

      lines.forEach((line, idx) => {
        const t = line.trim();
        const isDialogue = /^[-–—]\s+/.test(t);
        const hasTag = /\([^()\n]{2,34}\)\s*$/.test(t);
        if (isDialogue && !hasTag) {
          if (currentStreak === 0) startLine = idx + 1;
          currentStreak += 1;
        } else {
          if (currentStreak >= streakMin) {
            streaks.push({
              startLine,
              count: currentStreak,
              note: `${currentStreak} dòng thoại liên tiếp chưa chú thích nhân vật nói hoặc xen hành động.`
            });
          }
          currentStreak = 0;
        }
      });

      if (currentStreak >= streakMin) {
        streaks.push({
          startLine,
          count: currentStreak,
          note: `${currentStreak} dòng thoại liên tiếp cuối chương chưa chú thích nhân vật.`
        });
      }
      return streaks;
    }

    buildEditorCopyeditAudit(rawText) {
      const repeatedStarters = this.findAdjacentRepeatedSentenceStarters(rawText);
      const denseWalls = this.findDenseNarrativeWalls(rawText);
      const untaggedStreaks = this.findUntaggedLongDialogueStreaks(rawText);

      let hygieneScore = 100;
      hygieneScore -= Math.min(25, repeatedStarters.length * 4);
      hygieneScore -= Math.min(25, denseWalls.length * 8);
      hygieneScore -= Math.min(20, untaggedStreaks.length * 7);
      hygieneScore = Math.max(30, hygieneScore);

      return {
        hygieneScore,
        repeatedStarters,
        denseWalls,
        untaggedStreaks
      };
    }
  }

  // ==========================================================================
  // LỚP 6: BỘ ĐIỀU PHỐI BÀN PHÍM & CÔNG CỤ SOẠN THẢO TAB 1 (`NoirStudio.editorTools`)
  // ==========================================================================
  class DialogueNormalizerAndEditorToolsController {
    constructor() {
      this.normalizer = new VietnameseDialogueAndPunctuationNormalizer();
      this.findEngine = new ManuscriptFindAndReplaceEngine(this);
      this.typewriterEngine = new TypewriterScrollAndMobileQuickbarEngine(this);
      this.findBarEnhancer = new FindReplaceBarAndStyleEnhancer(this);
      this.copyeditRefiner = new VietnameseCopyeditAndParagraphRefiner();
      this.hasInitialized = false;
    }

    init() {
      this.findBarEnhancer.ensureFindBarExtrasMounted();
      this.typewriterEngine.syncTypewriterButtonUI();
      this.bindDOM();
      this.hasInitialized = true;
      return this;
    }

    getEditorElement() {
      return document.getElementById('textarea-chapter-content');
    }

    pushUndoCheckpointBeforeEdit(reasonLabel = 'Trước khi chỉnh sửa văn bản') {
      const editor = this.getEditorElement();
      if (!editor) return false;
      if (NS.autoSaver && typeof NS.autoSaver.pushUndoSnapshot === 'function') {
        try {
          NS.autoSaver.pushUndoSnapshot(editor.value, reasonLabel);
          return true;
        } catch (_) {}
      }
      return false;
    }

    notifyEditorMutated(reasonTag = 'EDITOR_TOOLS_EDIT') {
      const editor = this.getEditorElement();
      if (!editor) return;

      // Đồng bộ ngược lại mod08 & mod09 & word stats tức thì
      if (
        NS.chapterManager &&
        typeof NS.chapterManager.syncEditorToActiveChapter === 'function'
      ) {
        NS.chapterManager.syncEditorToActiveChapter();
      }
      if (
        NS.chapterManager &&
        typeof NS.chapterManager.updateLiveWordStatsUI === 'function'
      ) {
        NS.chapterManager.updateLiveWordStatsUI(editor.value);
      }
      if (NS.autoSaver && typeof NS.autoSaver.scheduleAutoSave === 'function') {
        NS.autoSaver.scheduleAutoSave(reasonTag);
      }

      if (NS.bus && typeof NS.bus.emit === 'function') {
        NS.bus.emit('editor:content_mutated', { source: reasonTag });
      }
    }

    runInstantCleanDialogueOnActiveChapter(options = {}) {
      const editor = this.getEditorElement();
      if (!editor) return { changed: false };

      const raw = editor.value || '';
      if (!raw.trim()) {
        getUtils().showToast(
          '⚠️ Chương hiện tại đang trống, chưa có câu thoại để chuẩn hóa.',
          'warn'
        );
        return { changed: false };
      }

      const result = this.normalizer.normalizeManuscriptText(raw, options);
      if (!result.changed) {
        getUtils().showToast(
          '✨ Tuyệt vời! Văn bản & câu thoại chương này đã gọn chuẩn sẵn rồi.',
          'success',
          2400
        );
        return result;
      }

      this.pushUndoCheckpointBeforeEdit('Trước khi Chuẩn hóa Thoại & Văn bản');
      editor.value = result.cleanedText;
      this.notifyEditorMutated('CLEAN_DIALOGUE');

      const s = result.stats;
      const details = [];
      if (s.dialogueLinesFormatted > 0) {
        details.push(`${s.dialogueLinesFormatted} dòng gạch thoại`);
      }
      if (s.quotesConverted > 0) {
        details.push(`${s.quotesConverted} thoại ngoặc kép → gạch đầu dòng`);
      }
      if (s.spacingFixes > 0) {
        details.push(`${s.spacingFixes} dòng sửa khoảng trắng dấu câu`);
      }
      if (s.blankLinesCollapsed > 0) {
        details.push('gọn dòng trống thừa');
      }

      getUtils().showToast(
        `🧹 Đã chuẩn hóa bản thảo sạch đẹp (${details.join(', ') || 'đã căn chỉnh'})! Có thể bấm Hoàn tác nếu muốn quay lại.`,
        'success',
        3600
      );
      return result;
    }

    runMobileParagraphSplitOnActiveChapter() {
      const editor = this.getEditorElement();
      if (!editor || !editor.value.trim()) return { changed: false };

      const res = this.copyeditRefiner.splitDenseParagraphForMobileReading(
        editor.value
      );
      if (!res.changed) {
        getUtils().showToast(
          '📱 Các đoạn văn hiện tại đã có độ dài thoáng đẹp trên điện thoại!',
          'info'
        );
        return res;
      }

      this.pushUndoCheckpointBeforeEdit('Trước khi tách đoạn thoáng cho Mobile');
      editor.value = res.text;
      this.notifyEditorMutated('MOBILE_SPLIT_PARAGRAPHS');
      getUtils().showToast(
        `📱 Đã tách ${res.splitCount} đoạn văn quá dài để đọc mượt trên điện thoại!`,
        'success'
      );
      return res;
    }

    wrapEditorSelectionWith(prefix, suffix = '') {
      const editor = this.getEditorElement();
      if (!editor) return false;
      const start = Number(editor.selectionStart ?? editor.value.length);
      const end = Number(editor.selectionEnd ?? editor.value.length);
      const selected = editor.value.slice(start, end);

      this.pushUndoCheckpointBeforeEdit('Chèn cặp ký tự định dạng');
      const wrapped = `${prefix}${selected}${suffix}`;
      editor.value =
        editor.value.slice(0, start) + wrapped + editor.value.slice(end);
      editor.focus();
      if (selected) {
        editor.setSelectionRange(start + wrapped.length, start + wrapped.length);
      } else {
        editor.setSelectionRange(start + prefix.length, start + prefix.length);
      }
      this.notifyEditorMutated('WRAP_SELECTION');
      return true;
    }

    tagSelectedLineWithSpeaker(speakerName) {
      const editor = this.getEditorElement();
      const name = String(speakerName || '').trim();
      if (!editor || !name) return false;

      const pos = Number(editor.selectionStart || 0);
      const val = editor.value;
      const lineStart = val.lastIndexOf('\n', Math.max(0, pos - 1)) + 1;
      let lineEnd = val.indexOf('\n', pos);
      if (lineEnd < 0) lineEnd = val.length;

      const curLine = val.slice(lineStart, lineEnd);
      const trimmed = curLine.trim();
      if (!trimmed) return false;

      let updatedLine = trimmed.startsWith('- ') ? trimmed : `- ${trimmed}`;
      if (/\([^()\n]{2,34}\)\s*$/.test(updatedLine)) {
        updatedLine = updatedLine.replace(
          /\([^()\n]{2,34}\)\s*$/,
          `(${name})`
        );
      } else {
        updatedLine = `${updatedLine} (${name})`;
      }

      this.pushUndoCheckpointBeforeEdit('Gắn tên nhân vật cho dòng thoại');
      editor.value =
        val.slice(0, lineStart) + updatedLine + val.slice(lineEnd);
      const caret = lineStart + updatedLine.length;
      editor.focus();
      editor.setSelectionRange(caret, caret);
      this.notifyEditorMutated('TAG_DIALOGUE_SPEAKER');
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
        'btn-instant-clean-dialogue',
        'click',
        () => this.runInstantCleanDialogueOnActiveChapter(),
        'mod23_clean_dialogue'
      );

      bindOnce(
        'btn-open-find-replace',
        'click',
        () => {
          if (this.findEngine.isOpen) {
            this.findEngine.closeBar();
          } else {
            this.findEngine.openBar(true);
          }
        },
        'mod23_toggle_find_bar'
      );

      bindOnce(
        'btn-close-find-replace',
        'click',
        () => this.findEngine.closeBar(),
        'mod23_close_find_bar'
      );

      bindOnce(
        'input-find-text',
        'input',
        () => this.findEngine.scanMatches(),
        'mod23_find_input'
      );

      bindOnce(
        'input-find-text',
        'keydown',
        (ev) => {
          if (ev.key === 'Enter') {
            ev.preventDefault();
            this.findEngine.findNextAndHighlight();
          } else if (ev.key === 'Escape') {
            this.findEngine.closeBar();
          }
        },
        'mod23_find_keydown'
      );

      bindOnce(
        'btn-do-replace-next',
        'click',
        () => this.findEngine.replaceFirstOrSelected(),
        'mod23_replace_next'
      );

      bindOnce(
        'btn-do-replace-all',
        'click',
        () => this.findEngine.replaceAllOccurrences(),
        'mod23_replace_all'
      );

      bindOnce(
        'btn-toggle-typewriter-mode',
        'click',
        () => this.typewriterEngine.toggleTypewriterMode(),
        'mod23_toggle_typewriter'
      );

      // Thanh chèn nhanh trên điện thoại (`#mobile-writer-quickbar`)
      const quickbar = document.getElementById('mobile-writer-quickbar');
      if (quickbar) {
        bindOnce(
          quickbar,
          'click',
          (ev) => {
            const btn = ev.target.closest('[data-quick-insert]');
            if (!btn) return;
            ev.preventDefault();
            const rawToken = btn.getAttribute('data-quick-insert');
            this.typewriterEngine.insertSnippetAtEditorCaret(rawToken);
          },
          'mod23_mobile_quickbar_click'
        );
      }

      // Giữ dòng đang gõ ở giữa màn hình khi bật Máy Đánh Chữ
      bindOnce(
        'textarea-chapter-content',
        'input',
        () => {
          if (this.typewriterEngine.typewriterActive) {
            this.typewriterEngine.centerActiveLineInViewport(false);
          }
          if (this.findEngine.isOpen) {
            this.findEngine.scanMatches();
          }
        },
        'mod23_editor_input_typewriter'
      );

      bindOnce(
        'textarea-chapter-content',
        'keyup',
        (ev) => {
          if (
            this.typewriterEngine.typewriterActive &&
            (ev.key === 'Enter' ||
              ev.key === 'ArrowUp' ||
              ev.key === 'ArrowDown')
          ) {
            this.typewriterEngine.centerActiveLineInViewport(true);
          }
        },
        'mod23_editor_keyup_typewriter'
      );

      // Phím tắt biên tập chuyên nghiệp trên Tab 1 (Ctrl+H Mở Tìm & Thay thế)
      if (typeof document !== 'undefined') {
        bindOnce(
          document,
          'keydown',
          (ev) => {
            const activeScreen = document.body?.getAttribute('data-s14-screen');
            if (activeScreen && activeScreen !== 'SCREEN_1_WRITE') return;

            if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'h') {
              ev.preventDefault();
              this.findEngine.openBar(true);
            } else if (
              (ev.ctrlKey || ev.metaKey) &&
              ev.shiftKey &&
              ev.key.toLowerCase() === 'd'
            ) {
              ev.preventDefault();
              this.runInstantCleanDialogueOnActiveChapter();
            }
          },
          'mod23_global_editor_shortcuts'
        );
      }
    }

    getHealthReport() {
      const editor = this.getEditorElement();
      const text = editor ? editor.value : '';
      return {
        module: 'mod23_dialogue_normalizer_and_vn_editor_tools.js',
        initialized: this.hasInitialized,
        typewriterActive: this.typewriterEngine.typewriterActive,
        findBarOpen: this.findEngine.isOpen,
        dialogueBalance: this.normalizer.analyzeDialogueBalance(text),
        copyeditAudit: this.copyeditRefiner.buildEditorCopyeditAudit(text)
      };
    }
  }

  // ==========================================================================
  // LỚP 7: BỘ TỰ ĐỘNG ĐÓNG NGOẶC THÔNG MINH, CHUYỂN ĐỔI QUY TẮC DẤU THANH & ĐẾM DÒNG
  // ==========================================================================
  const OLD_TO_NEW_TONE_PAIRS = Object.freeze([
    ['hòa', 'hoà'],
    ['hóa', 'hoá'],
    ['họa', 'hoạ'],
    ['hỏa', 'hoả'],
    ['khóa', 'khoá'],
    ['khỏa', 'khoả'],
    ['lòa', 'loà'],
    ['lóa', 'loá'],
    ['tòa', 'toà'],
    ['tỏa', 'toả'],
    ['xóa', 'xoá'],
    ['thủy', 'thuỷ'],
    ['túy', 'tuý'],
    ['tụy', 'tuỵ'],
    ['hủy', 'huỷ'],
    ['quý', 'quý']
  ]);

  class VietnameseOrthographyAndQuickMacrosEngine {
    constructor(controller) {
      this.controller = controller;
      this.smartPairsEnabled = true;
      this.orthographyMode = 'NEW'; // 'NEW' (hòa, thúy) | 'OLD' (hoà, thuý)
    }

    convertTonePlacementStyle(rawText, targetStyle = 'NEW') {
      let text = String(rawText || '');
      let conversions = 0;

      for (const [newForm, oldForm] of OLD_TO_NEW_TONE_PAIRS) {
        if (newForm === oldForm) continue;
        const fromWord = targetStyle === 'OLD' ? newForm : oldForm;
        const toWord = targetStyle === 'OLD' ? oldForm : newForm;
        const re = new RegExp(`\\b${escapeRegExp(fromWord)}\\b`, 'giu');
        text = text.replace(re, (matched) => {
          conversions += 1;
          if (matched[0] === matched[0].toUpperCase()) {
            return toWord[0].toUpperCase() + toWord.slice(1);
          }
          return toWord;
        });
      }

      return { text, conversions, targetStyle };
    }

    insertDialogueLineWithCharacterDropdown(characterName = '') {
      const editor = this.controller.getEditorElement();
      if (!editor) return false;

      const pos = Number(editor.selectionStart ?? editor.value.length);
      const val = editor.value;
      const needLeadingNewline = pos > 0 && val[pos - 1] !== '\n';
      const charTag = characterName ? ` (${characterName})` : '';
      const prefix = `${needLeadingNewline ? '\n' : ''}- `;
      const inserted = `${prefix}${charTag}`;

      editor.value = val.slice(0, pos) + inserted + val.slice(pos);
      const caretTarget = pos + prefix.length;
      editor.focus();
      editor.setSelectionRange(caretTarget, caretTarget);
      this.controller.notifyEditorMutated('INSERT_DIALOGUE_LINE');
      return true;
    }

    splitChapterHeaderLinesFromBody(rawText) {
      const lines = String(rawText || '').replace(/\r\n/g, '\n').split('\n');
      let titleCandidate = '';
      let bodyStartIndex = 0;

      for (let i = 0; i < Math.min(4, lines.length); i += 1) {
        const t = lines[i].trim();
        if (!t) continue;
        if (/^(chương|hồi|tiết|part|chapter)\s+\d+/i.test(t) && t.length <= 120) {
          titleCandidate = t;
          bodyStartIndex = i + 1;
          break;
        }
      }

      const body = lines.slice(bodyStartIndex).join('\n').trimStart();
      return { titleCandidate, body };
    }

    measureCurrentLineAndSelectionInfo() {
      const editor = this.controller.getEditorElement();
      if (!editor) return { line: 1, column: 1, selectedWords: 0 };

      const pos = Number(editor.selectionStart || 0);
      const end = Number(editor.selectionEnd || 0);
      const before = editor.value.slice(0, pos);
      const lines = before.split('\n');
      const selected = editor.value.slice(pos, end);

      return {
        line: lines.length,
        column: (lines[lines.length - 1] || '').length + 1,
        selectedWords: getUtils().countVietnameseWords(selected),
        selectedChars: selected.length
      };
    }

    mountDialogueHealthMiniBarInTab1() {
      const quickbar = document.getElementById('mobile-writer-quickbar');
      if (!quickbar || document.getElementById('btn-mobile-quick-clean-dialogue')) {
        return false;
      }

      const extraBtns = [
        {
          id: 'btn-mobile-quick-clean-dialogue',
          label: '🧹 Chuẩn thoại',
          action: () => this.controller.runInstantCleanDialogueOnActiveChapter()
        },
        {
          id: 'btn-mobile-quick-split-mobile',
          label: '📐 Tách đoạn thoáng',
          action: () => this.controller.runMobileParagraphSplitOnActiveChapter()
        }
      ];

      for (const spec of extraBtns) {
        const b = document.createElement('button');
        b.type = 'button';
        b.id = spec.id;
        b.className =
          'px-2.5 py-1 rounded-lg bg-emerald-900/60 border border-emerald-500/40 text-emerald-200 font-bold shrink-0';
        b.textContent = spec.label;
        b.addEventListener('click', (ev) => {
          ev.preventDefault();
          spec.action();
        });
        quickbar.appendChild(b);
      }
      return true;
    }
  }

  // ==========================================================================
  // LỚP 8: BỘ TRÍCH XUẤT & CHUẨN HÓA ĐỒNG LOẠT TOÀN BỘ CHƯƠNG (SERIES CLEANER)
  // ==========================================================================
  class SeriesWideDialogueAndCopyeditSuite {
    constructor(controller) {
      this.controller = controller;
    }

    auditAcrossAllChapters() {
      const chapters =
        NS.chapterManager?.chapters || NS.state?.chapters || [];
      const report = [];

      for (const ch of chapters) {
        const balance = this.controller.normalizer.analyzeDialogueBalance(
          ch.content || ''
        );
        const copyedit =
          this.controller.copyeditRefiner.buildEditorCopyeditAudit(
            ch.content || ''
          );
        report.push({
          chapterId: ch.id,
          title: ch.displayTitle || ch.title || 'Chương',
          hygieneScore: copyedit.hygieneScore,
          dialoguePercent: balance.dialoguePercent,
          untaggedStreaksCount: copyedit.untaggedStreaks.length,
          denseWallsCount: copyedit.denseWalls.length,
          repeatedStartersCount: copyedit.repeatedStarters.length
        });
      }
      return report;
    }

    async cleanDialogueAcrossAllDraftChapters() {
      const mgr = NS.chapterManager;
      if (!mgr || !Array.isArray(mgr.chapters)) return 0;

      if (typeof mgr.syncEditorToActiveChapter === 'function') {
        mgr.syncEditorToActiveChapter();
      }

      let updatedCount = 0;
      for (const ch of mgr.chapters) {
        if (ch.status === 'APPROVED') continue;
        const res = this.controller.normalizer.normalizeManuscriptText(
          ch.content || ''
        );
        if (res.changed) {
          ch.content = res.cleanedText;
          ch.updatedAt = Date.now();
          updatedCount += 1;
        }
      }

      if (updatedCount > 0) {
        if (typeof mgr.loadActiveChapterIntoEditor === 'function') {
          mgr.loadActiveChapterIntoEditor();
        }
        if (typeof mgr.persistChapters === 'function') {
          await mgr.persistChapters();
        }
        getUtils().showToast(
          `🧹 Đã chuẩn hóa câu thoại cho ${updatedCount} chương Bản Nháp!`,
          'success'
        );
      } else {
        getUtils().showToast(
          '✨ Toàn bộ chương Bản Nháp đã được căn chuẩn sẵn.',
          'info'
        );
      }
      return updatedCount;
    }

    buildSelectionStatusText() {
      const info =
        this.controller.orthography.measureCurrentLineAndSelectionInfo();
      if (info.selectedChars > 0) {
        return `Dòng ${info.line}:${info.column} · Đang chọn ${info.selectedWords} từ (${info.selectedChars} ký tự)`;
      }
      return `Dòng ${info.line}, Cột ${info.column}`;
    }
  }

  // ==========================================================================
  // LỚP 9: KIỂM ĐỊNH PHÂN BỔ NGƯỜI NÓI & THAO TÁC CHỌN ĐOẠN VĂN BẢN NÂNG CAO
  // ==========================================================================
  class DialogueSpeakerAnalyticsAndTextOps {
    constructor(controller) {
      this.controller = controller;
    }

    extractSpeakerDistribution(chapterText) {
      const counts = new Map();
      const untaggedLines = [];
      const lines = String(chapterText || '').split('\n');

      lines.forEach((raw, idx) => {
        const t = raw.trim();
        if (!/^[-–—]\s+/.test(t)) return;
        const m = t.match(/\(([^()\n]{2,34})\)\s*$/);
        if (m && m[1]) {
          const speaker = m[1].trim();
          counts.set(speaker, (counts.get(speaker) || 0) + 1);
        } else {
          untaggedLines.push({
            lineNumber: idx + 1,
            preview: t.slice(0, 72)
          });
        }
      });

      const speakers = Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([name, turns]) => ({ name, turns }));

      return {
        totalSpeakersDetected: speakers.length,
        totalTaggedTurns: speakers.reduce((s, sp) => s + sp.turns, 0),
        untaggedDialogueTurns: untaggedLines.length,
        speakers,
        sampleUntagged: untaggedLines.slice(0, 5)
      };
    }

    autoCapitalizeFirstLetterAfterSentencePunctuation(rawText) {
      let count = 0;
      const fixed = String(rawText || '').replace(
        /(^|[.!?…]\s+)([a-zàáâãèéêìíòóôõùúăđĩũơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵýỷỹ])/gm,
        (match, prefix, ch) => {
          count += 1;
          return prefix + ch.toUpperCase();
        }
      );
      return { text: fixed, fixedCount: count };
    }

    convertSelectedLinesToDialogueBlock() {
      const editor = this.controller.getEditorElement();
      if (!editor) return false;

      const start = Number(editor.selectionStart ?? 0);
      const end = Number(editor.selectionEnd ?? 0);
      if (end <= start) return false;

      const selected = editor.value.slice(start, end);
      const converted = selected
        .split('\n')
        .map((line) => {
          const t = line.trim();
          if (!t) return '';
          return /^[-–—]\s+/.test(t) ? t : `- ${t}`;
        })
        .join('\n');

      if (converted === selected) return false;
      this.controller.pushUndoCheckpointBeforeEdit(
        'Chuyển vùng chọn thành các dòng thoại'
      );
      editor.value =
        editor.value.slice(0, start) + converted + editor.value.slice(end);
      editor.focus();
      editor.setSelectionRange(start, start + converted.length);
      this.controller.notifyEditorMutated('CONVERT_SELECTION_TO_DIALOGUE');
      return true;
    }

    insertSceneBreakDividerAtCursor() {
      const editor = this.controller.getEditorElement();
      if (!editor) return false;

      const pos = Number(editor.selectionStart ?? editor.value.length);
      const before = editor.value.slice(0, pos).replace(/\s+$/, '');
      const after = editor.value.slice(pos).replace(/^\s+/, '');
      const divider = '\n\n* * *\n\n';

      this.controller.pushUndoCheckpointBeforeEdit('Chèn dải phân cách chuyển cảnh');
      editor.value = before + divider + after;
      const nextPos = before.length + divider.length;
      editor.focus();
      editor.setSelectionRange(nextPos, nextPos);
      this.controller.notifyEditorMutated('INSERT_SCENE_DIVIDER');
      return true;
    }

    swapSelectedParagraphWithNext() {
      const editor = this.controller.getEditorElement();
      if (!editor) return false;

      const pos = Number(editor.selectionStart || 0);
      const paragraphs = editor.value.split(/\n{2,}/);
      if (paragraphs.length < 2) return false;

      let running = 0;
      let targetIdx = 0;
      for (let i = 0; i < paragraphs.length; i += 1) {
        const len = paragraphs[i].length + 2;
        if (pos <= running + len || i === paragraphs.length - 1) {
          targetIdx = i;
          break;
        }
        running += len;
      }

      if (targetIdx >= paragraphs.length - 1) return false;
      this.controller.pushUndoCheckpointBeforeEdit('Đổi thứ tự đoạn văn');
      const temp = paragraphs[targetIdx];
      paragraphs[targetIdx] = paragraphs[targetIdx + 1];
      paragraphs[targetIdx + 1] = temp;

      editor.value = paragraphs.join('\n\n');
      this.controller.notifyEditorMutated('SWAP_PARAGRAPHS');
      return true;
    }

    buildSpeakerDistributionSummaryText() {
      const editor = this.controller.getEditorElement();
      if (!editor) return '';
      const dist = this.extractSpeakerDistribution(editor.value);
      if (dist.speakers.length === 0) {
        return `Chưa có câu thoại gắn thẻ (Tên nhân vật). Hiện có ${dist.untaggedDialogueTurns} câu thoại dạng "- ...".`;
      }
      return dist.speakers
        .map((s) => `${s.name}: ${s.turns} lượt`)
        .join(' · ');
    }
  }

  // ==========================================================================
  // ĐĂNG KÝ SINGLETON LÊN `window.NoirStudio.editorTools`
  // ==========================================================================
  const editorToolsEngine = new DialogueNormalizerAndEditorToolsController();
  editorToolsEngine.orthography = new VietnameseOrthographyAndQuickMacrosEngine(
    editorToolsEngine
  );
  editorToolsEngine.seriesSuite = new SeriesWideDialogueAndCopyeditSuite(
    editorToolsEngine
  );
  editorToolsEngine.speakerAnalytics = new DialogueSpeakerAnalyticsAndTextOps(
    editorToolsEngine
  );

  const origInitMod23 = editorToolsEngine.init.bind(editorToolsEngine);
  editorToolsEngine.init = function () {
    origInitMod23();
    this.orthography.mountDialogueHealthMiniBarInTab1();
    return this;
  };

  editorToolsEngine.normalizeDialogueNow = (opts) =>
    editorToolsEngine.runInstantCleanDialogueOnActiveChapter(opts);
  editorToolsEngine.splitDenseParagraphsForMobile = () =>
    editorToolsEngine.runMobileParagraphSplitOnActiveChapter();
  editorToolsEngine.convertOrthographyTone = (style) => {
    const ed = editorToolsEngine.getEditorElement();
    if (!ed) return 0;
    const res = editorToolsEngine.orthography.convertTonePlacementStyle(
      ed.value,
      style
    );
    if (res.conversions > 0) {
      editorToolsEngine.pushUndoCheckpointBeforeEdit(
        `Chuyển chuẩn dấu thanh kiểu ${style}`
      );
      ed.value = res.text;
      editorToolsEngine.notifyEditorMutated('ORTHOGRAPHY_CONVERT');
    }
    return res.conversions;
  };
  editorToolsEngine.auditAllChaptersCopyedit = () =>
    editorToolsEngine.seriesSuite.auditAcrossAllChapters();
  editorToolsEngine.getSpeakerStats = (text) =>
    editorToolsEngine.speakerAnalytics.extractSpeakerDistribution(
      typeof text === 'string'
        ? text
        : editorToolsEngine.getEditorElement()?.value || ''
    );

  /**
   * Kiểm tra nhịp độ xuống dòng, mật độ đoạn văn dài và nhịp cắt cảnh trong bản thảo Light Novel.
   */
  class LineEndingAndParagraphFlowInspector {
    constructor(options = {}) {
      this.longParagraphWordThreshold = options.longParagraphWordThreshold || 140;
      this.shortBurstWordLimit = options.shortBurstWordLimit || 12;
      this.sceneDividerRegex = /^\s*(?:\*{3,}|-{3,}|={3,}|#{2,}|◇|❖|※)\s*$/;
    }

    splitCleanParagraphs(rawText) {
      const normalized = String(rawText || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      return normalized.split('\n').map((line, index) => ({
        lineNumber: index + 1,
        rawLine: line,
        trimmed: line.trim(),
      }));
    }

    countWordsSimple(segment) {
      const cleaned = String(segment || '').trim();
      if (!cleaned) return 0;
      return cleaned.split(/\s+/).filter(Boolean).length;
    }

    inspectParagraphFlow(rawText) {
      const rows = this.splitCleanParagraphs(rawText);
      const nonEmptyRows = rows.filter((r) => r.trimmed.length > 0 && !this.sceneDividerRegex.test(r.trimmed));
      const dividerRows = rows.filter((r) => this.sceneDividerRegex.test(r.trimmed));
      const heavyBlocks = [];
      const shortPunchyLines = [];
      let totalWords = 0;
      let dialogueParagraphCount = 0;
      let trailingSpacesLineCount = 0;
      let consecutiveBlankRuns = 0;
      let currentBlankRun = 0;

      for (const row of rows) {
        if (/[ \t]+$/.test(row.rawLine)) {
          trailingSpacesLineCount += 1;
        }
        if (!row.trimmed) {
          currentBlankRun += 1;
          if (currentBlankRun === 3) {
            consecutiveBlankRuns += 1;
          }
          continue;
        }
        currentBlankRun = 0;
        if (this.sceneDividerRegex.test(row.trimmed)) continue;

        const wc = this.countWordsSimple(row.trimmed);
        totalWords += wc;
        if (/^(?:["“「『\-–—]|——)/.test(row.trimmed)) {
          dialogueParagraphCount += 1;
        }
        if (wc >= this.longParagraphWordThreshold) {
          heavyBlocks.push({
            lineNumber: row.lineNumber,
            wordCount: wc,
            preview: row.trimmed.slice(0, 72) + (row.trimmed.length > 72 ? '...' : ''),
          });
        } else if (wc > 0 && wc <= this.shortBurstWordLimit) {
          shortPunchyLines.push({
            lineNumber: row.lineNumber,
            wordCount: wc,
            preview: row.trimmed,
          });
        }
      }

      const avgWordsPerParagraph = nonEmptyRows.length > 0
        ? Number((totalWords / nonEmptyRows.length).toFixed(1))
        : 0;
      const dialogueSharePercent = nonEmptyRows.length > 0
        ? Math.round((dialogueParagraphCount / nonEmptyRows.length) * 100)
        : 0;

      return {
        totalLines: rows.length,
        nonEmptyParagraphs: nonEmptyRows.length,
        sceneDividers: dividerRows.length,
        totalWords,
        avgWordsPerParagraph,
        dialogueParagraphCount,
        dialogueSharePercent,
        heavyWallOfTextCount: heavyBlocks.length,
        heavyBlocks: heavyBlocks.slice(0, 12),
        shortPunchyLineCount: shortPunchyLines.length,
        trailingSpacesLineCount,
        tripleBlankLineRuns: consecutiveBlankRuns,
        lightNovelReadabilityGrade:
          heavyBlocks.length === 0 && avgWordsPerParagraph <= 65
            ? 'Sáng rõ - chuẩn nhịp Light Novel'
            : heavyBlocks.length <= 2
              ? 'Tốt - có vài đoạn trần thuật hơi dày'
              : 'Nên tách nhỏ đoạn dài để dễ đọc trên điện thoại',
      };
    }

    normalizeMultipleBlankLines(rawText) {
      const normalized = String(rawText || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      const cleanedLines = normalized.split('\n').map((line) => line.replace(/[ \t]+$/g, ''));
      return cleanedLines.join('\n').replace(/\n{3,}/g, '\n\n');
    }
  }

  /**
   * Quản lý bộ gõ tắt và cụm ký tự đặc thù Light Novel (dấu ngắt cảnh, tên riêng, ngoặc Nhật).
   */
  class CustomQuickInsertMacrosManager {
    constructor(storageKey = 'noir_vn_quick_macros_v38') {
      this.storageKey = storageKey;
      this.defaultMacros = [
        { trigger: '/ngatcanh', expansion: '\n\n***\n\n', label: 'Ngắt phân cảnh chuẩn ***' },
        { trigger: '/nhaykep', expansion: '「  」', label: 'Ngoặc lời thoại Light Novel 「 」' },
        { trigger: '/suynghi', expansion: '『  』', label: 'Ngoặc độc thoại nội tâm 『 』' },
        { trigger: '/bacham', expansion: '……', label: 'Dấu lửng sáu chấm kiểu Nhật' },
        { trigger: '/ngang', expansion: '——', label: 'Gạch nối ngắt nhịp đôi' },
        { trigger: '/hoiuc', expansion: '\n◇ ◇ ◇\n', label: 'Mốc chuyển cảnh hồi ức' },
      ];
      this.customMacros = this.loadCustomMacros();
    }

    loadCustomMacros() {
      try {
        if (typeof localStorage === 'undefined') return [];
        const raw = localStorage.getItem(this.storageKey);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch (_err) {
        return [];
      }
    }

    saveCustomMacros() {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(this.storageKey, JSON.stringify(this.customMacros));
        }
      } catch (_err) {
        // Không làm gián đoạn tác giả nếu localStorage bị đầy
      }
    }

    getAllMacros() {
      const map = new Map();
      for (const item of this.defaultMacros) {
        map.set(item.trigger, item);
      }
      for (const custom of this.customMacros) {
        if (custom && custom.trigger) {
          map.set(custom.trigger, custom);
        }
      }
      return Array.from(map.values());
    }

    registerMacro(trigger, expansion, label = '') {
      const cleanTrigger = String(trigger || '').trim();
      const cleanExpansion = String(expansion || '');
      if (!cleanTrigger || !cleanExpansion) return null;
      const existingIdx = this.customMacros.findIndex((m) => m.trigger === cleanTrigger);
      const entry = {
        trigger: cleanTrigger,
        expansion: cleanExpansion,
        label: String(label || `Gõ tắt ${cleanTrigger}`),
        updatedAt: new Date().toISOString(),
      };
      if (existingIdx >= 0) {
        this.customMacros[existingIdx] = entry;
      } else {
        this.customMacros.push(entry);
      }
      this.saveCustomMacros();
      return entry;
    }

    removeCustomMacro(trigger) {
      const target = String(trigger || '').trim();
      const before = this.customMacros.length;
      this.customMacros = this.customMacros.filter((m) => m.trigger !== target);
      if (this.customMacros.length !== before) {
        this.saveCustomMacros();
        return true;
      }
      return false;
    }

    expandMacrosInText(inputText) {
      let result = String(inputText || '');
      const macros = this.getAllMacros();
      let replacements = 0;
      for (const macro of macros) {
        if (!macro.trigger || !result.includes(macro.trigger)) continue;
        const escaped = macro.trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`(^|\\s)${escaped}(?=\\s|$)`, 'g');
        result = result.replace(re, (_match, prefix) => {
          replacements += 1;
          return `${prefix}${macro.expansion}`;
        });
      }
      return {
        text: result,
        replacementsApplied: replacements,
      };
    }
  }

  /**
   * Kiểm tra tính nhất quán của dấu ngoặc thoại («», 「」, "", “”) và phát hiện ngoặc bị quên đóng.
   */
  class DialogueQuoteConsistencyChecker {
    constructor() {
      this.quotePairs = [
        { id: 'curlyDouble', label: 'Ngoặc cong “ ”', open: '“', close: '”' },
        { id: 'jpCorner', label: 'Ngoặc góc Nhật 「 」', open: '「', close: '」' },
        { id: 'jpInner', label: 'Ngoặc kép Nhật 『 』', open: '『', close: '』' },
        { id: 'guillemet', label: 'Ngoặc « »', open: '«', close: '»' },
      ];
    }

    countCharOccurrences(text, ch) {
      let count = 0;
      for (let i = 0; i < text.length; i += 1) {
        if (text[i] === ch) count += 1;
      }
      return count;
    }

    auditConsistency(rawText) {
      const text = String(rawText || '');
      const lines = text.replace(/\r\n/g, '\n').split('\n');
      const pairStats = this.quotePairs.map((pair) => {
        const opens = this.countCharOccurrences(text, pair.open);
        const closes = this.countCharOccurrences(text, pair.close);
        return {
          id: pair.id,
          label: pair.label,
          openCount: opens,
          closeCount: closes,
          balanced: opens === closes,
          delta: opens - closes,
        };
      });

      const straightQuotesCount = this.countCharOccurrences(text, '"');
      const lineLevelMismatches = [];

      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        for (const pair of this.quotePairs) {
          const lo = this.countCharOccurrences(trimmed, pair.open);
          const lc = this.countCharOccurrences(trimmed, pair.close);
          if (lo !== lc) {
            lineLevelMismatches.push({
              lineNumber: idx + 1,
              pairId: pair.id,
              pairLabel: pair.label,
              openCount: lo,
              closeCount: lc,
              excerpt: trimmed.slice(0, 68) + (trimmed.length > 68 ? '...' : ''),
            });
          }
        }
        const straightOnLine = this.countCharOccurrences(trimmed, '"');
        if (straightOnLine % 2 !== 0) {
          lineLevelMismatches.push({
            lineNumber: idx + 1,
            pairId: 'straightDouble',
            pairLabel: 'Ngoặc thẳng " bị lẻ',
            openCount: straightOnLine,
            closeCount: 0,
            excerpt: trimmed.slice(0, 68) + (trimmed.length > 68 ? '...' : ''),
          });
        }
      });

      const dominantStyle = pairStats
        .slice()
        .sort((a, b) => b.openCount + b.closeCount - (a.openCount + a.closeCount))[0];

      return {
        pairStats,
        straightDoubleQuotes: straightQuotesCount,
        straightQuotesBalanced: straightQuotesCount % 2 === 0,
        dominantDialogueStyle:
          dominantStyle && dominantStyle.openCount > 0
            ? dominantStyle.label
            : straightQuotesCount > 0
              ? 'Ngoặc thẳng "..."'
              : 'Chưa phát hiện thoại đóng ngoặc',
        mismatchCount: lineLevelMismatches.length,
        mismatches: lineLevelMismatches.slice(0, 15),
        allClean:
          pairStats.every((p) => p.balanced) &&
          straightQuotesCount % 2 === 0 &&
          lineLevelMismatches.length === 0,
      };
    }

    autoCloseDanglingQuotesInLines(rawText) {
      const lines = String(rawText || '').replace(/\r\n/g, '\n').split('\n');
      let fixedCount = 0;
      const repaired = lines.map((line) => {
        let updated = line;
        for (const pair of this.quotePairs) {
          const opens = this.countCharOccurrences(updated, pair.open);
          const closes = this.countCharOccurrences(updated, pair.close);
          if (opens === closes + 1) {
            updated = `${updated.trimEnd()}${pair.close}`;
            fixedCount += 1;
          }
        }
        return updated;
      });
      return {
        text: repaired.join('\n'),
        linesRepaired: fixedCount,
      };
    }
  }

  const flowInspector = new LineEndingAndParagraphFlowInspector();
  const quickMacrosManager = new CustomQuickInsertMacrosManager();
  const quoteChecker = new DialogueQuoteConsistencyChecker();

  editorToolsEngine.flowInspector = flowInspector;
  editorToolsEngine.quickMacros = quickMacrosManager;
  editorToolsEngine.quoteChecker = quoteChecker;

  editorToolsEngine.inspectParagraphFlow = (text) => {
    const source = typeof text === 'string' ? text : editorToolsEngine.getEditorElement()?.value || '';
    return flowInspector.inspectParagraphFlow(source);
  };

  editorToolsEngine.normalizeMultipleBlankLinesInEditor = () => {
    const editor = editorToolsEngine.getEditorElement?.();
    if (!editor) return { changed: false, reason: 'missing_editor' };
    const before = editor.value || '';
    const after = flowInspector.normalizeMultipleBlankLines(before);
    if (before === after) {
      NS.uiUtils?.showToast?.('Khoảng trống đoạn văn đã gọn gàng sẵn rồi.', 'info');
      return { changed: false };
    }
    editor.value = after;
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    NS.uiUtils?.showToast?.('Đã thu gọn các dòng trống thừa trong bản thảo.', 'success');
    return { changed: true };
  };

  editorToolsEngine.registerQuickMacro = (trigger, expansion, label) =>
    quickMacrosManager.registerMacro(trigger, expansion, label);

  editorToolsEngine.expandQuickMacros = (text) => quickMacrosManager.expandMacrosInText(text);

  editorToolsEngine.auditDialogueQuoteConsistency = (text) => {
    const source = typeof text === 'string' ? text : editorToolsEngine.getEditorElement()?.value || '';
    return quoteChecker.auditConsistency(source);
  };

  editorToolsEngine.repairDanglingDialogueQuotesInEditor = () => {
    const editor = editorToolsEngine.getEditorElement?.();
    if (!editor) return { linesRepaired: 0 };
    const result = quoteChecker.autoCloseDanglingQuotesInLines(editor.value || '');
    if (result.linesRepaired > 0) {
      editor.value = result.text;
      editor.dispatchEvent(new Event('input', { bubbles: true }));
      NS.uiUtils?.showToast?.(`Đã tự động đóng ${result.linesRepaired} dấu ngoặc thoại bị mở quên.`, 'success');
    } else {
      NS.uiUtils?.showToast?.('Tất cả dấu ngoặc thoại đều đã đóng mở cân đối.', 'success');
    }
    return { linesRepaired: result.linesRepaired };
  };

  NS.editorTools = editorToolsEngine;
  NS.DialogueNormalizerAndEditorToolsController =
    DialogueNormalizerAndEditorToolsController;
  NS.LineEndingAndParagraphFlowInspector = LineEndingAndParagraphFlowInspector;
  NS.CustomQuickInsertMacrosManager = CustomQuickInsertMacrosManager;
  NS.DialogueQuoteConsistencyChecker = DialogueQuoteConsistencyChecker;

  if (typeof NS.registerModule === 'function') {
    NS.registerModule('mod23', editorToolsEngine);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        if (!editorToolsEngine.hasInitialized) editorToolsEngine.init();
      });
    } else {
      editorToolsEngine.init();
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
