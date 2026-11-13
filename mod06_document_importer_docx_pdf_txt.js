/**
 * ============================================================================
 * MODULE 06: BỘ ĐỌC TÀI LIỆU ĐA ĐỊNH DẠNG (.DOCX, .PDF, .TXT, .MD, .JSON, .HTML)
 *            PHÂN TÁCH ĐA CHƯƠNG THÔNG MINH, CHUẨN HÓA UNICODE TIẾNG VIỆT,
 *            NHẬN DIỆN THỰC THỂ VĂN HỌC & TÓM TẮT TRÍCH XUẤT 0 TOKEN (TEXTRANK)
 * ============================================================================
 * Phiên bản: NoirStudio Modular Architecture v36.0
 * Tập tin: mod06_document_importer_docx_pdf_txt.js
 * Mục tiêu:
 *   1. Cung cấp lớp `LocalDocumentParserAndSummarizer` gắn vào `window.NoirStudio.docParser`.
 *   2. Đọc chính xác các tệp `.docx` (Mammoth + Bộ giải nén ZIP/XML thuần JS dự phòng),
 *      `.pdf` (PDF.js + Khôi phục bố cục dòng/cột + Bộ quét luồng PDF dự phòng),
 *      `.txt`, `.md`, `.html`, `.json` (hỗ trợ cả bản sao lưu toàn cục & danh sách chương).
 *   3. Tự động sửa lỗi bảng mã Tiếng Việt (NFD tổ hợp -> NFC dựng sẵn, lỗi Mojibake,
 *      dấu ngoặc kép hội thoại, dấu gạch ngang lời thoại, ngắt dòng lỗi từ PDF/OCR).
 *   4. Tự động nhận diện và tách 1 file chứa nhiều chương (Chương 1, Hồi 1, Chapter 1,
 *      Quyển 1, Phần 1, số La Mã, số đếm Tiếng Việt) thành danh sách chương độc lập.
 *   5. Thuật toán tóm tắt trích xuất 0 Token (Lexical TextRank kết hợp vị trí kịch tính
 *      Mở đầu - Phát triển - Cao trào - Kết thúc) & tự động trích xuất Nhân vật / Địa điểm.
 * ============================================================================
 */

(function () {
  'use strict';

  window.NoirStudio = window.NoirStudio || {};
  window.NoirStudio.state = window.NoirStudio.state || {
    activeScreen: 'SCREEN_1_WRITE',
    activeChapterId: null,
    chapterFilter: 'ALL',
    isSaving: false,
    isDirty: false,
    lastSavedAt: Date.now()
  };

  // ==========================================================================
  // PHẦN 1: TỪ ĐIỂN NGÔN NGỮ HỌC TIẾNG VIỆT & MẪU NHẬN DIỆN VĂN CHƯƠNG
  // ==========================================================================
  const VIETNAMESE_LEXICON_CONFIG = {
    // Bản đồ chuyển đổi tổ hợp dấu thanh rời (NFD) sang ký tự dựng sẵn (NFC)
    COMBINING_TONE_MARKS: [
      '\u0300', // Huyền
      '\u0301', // Sắc
      '\u0303', // Ngã
      '\u0309', // Hỏi
      '\u0323', // Nặng
      '\u0302', // Mũ (â, ê, ô)
      '\u0306', // Trăng (ă)
      '\u031B'  // Móc (ơ, ư)
    ],

    // Danh sách từ dừng (Stopwords) phục vụ thuật toán TextRank 0-Token trong bộ tóm tắt
    SUMMARY_STOPWORDS: new Set([
      'là', 'và', 'của', 'có', 'những', 'các', 'một', 'trong', 'được', 'cho',
      'với', 'không', 'đã', 'này', 'đến', 'khi', 'về', 'như', 'từ', 'cũng',
      'người', 'ra', 'phải', 'trên', 'tại', 'theo', 'sẽ', 'mà', 'để', 'nhưng',
      'vào', 'còn', 'bị', 'do', 'bởi', 'vì', 'nếu', 'thì', 'hay', 'hoặc',
      'rằng', 'rất', 'lại', 'đang', 'vẫn', 'chỉ', 'hơn', 'nhất', 'cả', 'mọi',
      'mỗi', 'nào', 'đâu', 'sao', 'vậy', 'thế', 'nên', 'cần', 'muốn', 'biết',
      'thấy', 'làm', 'đi', 'lên', 'xuống', 'qua', 'lại', 'vừa', 'mới', 'đều',
      'chưa', 'chẳng', 'đừng', 'chớ', 'hãy', 'bằng', 'giữa', 'sau', 'trước',
      'ngoài', 'dưới', 'cùng', 'nhiều', 'ít', 'lớn', 'nhỏ', 'tốt', 'xấu',
      'ngày', 'đêm', 'lúc', 'thời', 'gian', 'nơi', 'chỗ', 'việc', 'chuyện',
      'điều', 'cách', 'phần', 'bên', 'phía', 'hướng', 'đây', 'đó', 'kia',
      'ấy', 'nọ', 'tôi', 'ta', 'mình', 'chúng', 'họ', 'nó', 'hắn', 'y',
      'nàng', 'cô', 'anh', 'chị', 'em', 'ông', 'bà', 'bác', 'chú', 'cậu',
      'gì', 'ai', 'chi', 'bao', 'nhiêu', 'bấy', 'vài', 'mấy', 'toàn', 'bộ'
    ]),

    // Từ khóa báo hiệu bước ngoặt kịch tính / cao trào trong tiểu thuyết
    DRAMATIC_SIGNAL_WORDS: new Map([
      ['bất ngờ', 2.4],
      ['đột nhiên', 2.3],
      ['bỗng nhiên', 2.2],
      ['ngay lập tức', 2.0],
      ['hóa ra', 2.8],
      ['sự thật', 2.7],
      ['bí mật', 2.6],
      ['phản bội', 2.8],
      ['âm mưu', 2.5],
      ['sát nhân', 2.7],
      ['hung thủ', 2.9],
      ['vết máu', 2.5],
      ['máu tươi', 2.4],
      ['tiếng súng', 2.6],
      ['nhận ra', 2.2],
      ['phát hiện', 2.3],
      ['chứng cứ', 2.5],
      ['manh mối', 2.5],
      ['bằng chứng', 2.4],
      ['tuyệt vọng', 2.1],
      ['kinh hoàng', 2.3],
      ['rùng mình', 1.9],
      ['lạnh sống lưng', 1.8],
      ['quyết định', 2.1],
      ['thề rằng', 2.2],
      ['khóc nấc', 2.0],
      ['gào lên', 2.1],
      ['thì thầm', 1.7],
      ['cười lạnh', 1.8],
      ['nụ cười', 1.5],
      ['ánh mắt', 1.5],
      ['bóng tối', 1.6],
      ['cái chết', 2.6],
      ['thi thể', 2.7],
      ['hiện trường', 2.5],
      ['mật mã', 2.4],
      ['chìa khóa', 2.2],
      ['bức thư', 2.1],
      ['nhật ký', 2.2],
      ['hồ sơ', 2.0],
      ['lời nguyền', 2.3],
      ['ký ức', 2.0],
      ['quá khứ', 1.9],
      ['tương lai', 1.7],
      ['định mệnh', 2.1],
      ['kết thúc', 2.0],
      ['khởi đầu', 1.9]
    ]),

    // Danh xưng & chức danh đứng trước tên riêng Tiếng Việt để nhận diện nhân vật
    CHARACTER_HONORIFICS: [
      'thám tử', 'thanh tra', 'đội trưởng', 'đại úy', 'thiếu tá', 'đại tá',
      'bác sĩ', 'giáo sư', 'tiến sĩ', 'luật sư', 'nhà báo', 'phóng viên',
      'công tố viên', 'thẩm phán', 'hiệu trưởng', 'giám đốc', 'chủ tịch',
      'tổng giám đốc', 'thiếu gia', 'tiểu thư', 'công tử', 'lão gia',
      'phu nhân', 'quản gia', 'sư phụ', 'đại sư', 'đạo sĩ', 'pháp sư',
      'hoàng đế', 'bệ hạ', 'điện hạ', 'vương gia', 'công chúa', 'hoàng tử',
      'tướng quân', 'thống chế', 'đô đốc', 'thuyền trưởng', 'cha xứ',
      'linh mục', 'tu nữ', 'ông', 'bà', 'lão', 'gã', 'hắn', 'cô', 'nàng',
      'anh', 'chị', 'chú', 'bác', 'cậu', 'mợ', 'dì', 'dượng', 'thầy', 'cô giáo'
    ],

    // Động từ dẫn lời thoại giúp xác định chủ thể phát ngôn
    DIALOGUE_ATTRIBUTION_VERBS: [
      'nói', 'hỏi', 'đáp', 'trả lời', 'thì thầm', 'thầm thì', 'lẩm bẩm',
      'quát', 'hét', 'gầm', 'gào', 'kêu', 'than', 'thở dài', 'cười',
      'mỉm cười', 'cười khẩy', 'cười lạnh', 'nhíu mày', 'cau mày',
      'lắc đầu', 'gật đầu', 'nhìn', 'liếc', 'ngước nhìn', 'cúi đầu',
      'buột miệng', 'thốt lên', 'lên tiếng', 'ngắt lời', 'tiếp lời',
      'bổ sung', 'giải thích', 'kể', 'nhắc nhở', 'cảnh báo', 'đe dọa',
      'van xin', 'cầu khẩn', 'ra lệnh', 'chỉ đạo', 'phản bác', 'cãi'
    ],

    // Tiền tố địa điểm giúp trích xuất bối cảnh không gian
    LOCATION_PREFIXES: [
      'tại', 'ở', 'bên trong', 'phía trước', 'phía sau', 'dưới tầng hầm',
      'trên sân thượng', 'trong căn phòng', 'tại văn phòng', 'ở bệnh viện',
      'tại đồn cảnh sát', 'trong biệt thự', 'tại dinh thự', 'ở quán cà phê',
      'trong quán bar', 'nơi con hẻm', 'ngoài bến cảng', 'trên chuyến tàu',
      'tại sân bay', 'trong thư viện', 'ở trường đại học', 'tại nghĩa trang',
      'trong khu rừng', 'trên đỉnh núi', 'dưới lòng đất', 'tại tòa án',
      'thành phố', 'thị trấn', 'ngôi làng', 'khu phố', 'con đường', 'đại lộ',
      'tòa tháp', 'khách sạn', 'nhà ga', 'phòng thí nghiệm', 'nhà kho'
    ],

    // Từ khóa vật phẩm / phục bút (Clues / Artifacts)
    CLUE_OBJECT_KEYWORDS: [
      'bức thư', 'tờ giấy', 'cuốn nhật ký', 'quyển sổ', 'tập hồ sơ',
      'bản hợp đồng', 'di chúc', 'tấm ảnh', 'bức ảnh', 'cuộn băng',
      'đoạn ghi âm', 'thẻ nhớ', 'ổ cứng', 'mật khẩu', 'mật mã',
      'chìa khóa', 'chiếc nhẫn', 'dây chuyền', 'đồng hồ', 'con dao',
      'khẩu súng', 'viên đạn', 'vỏ đạn', 'lọ thuốc', 'ống tiêm',
      'vết máu', 'dấu vân tay', 'vết chân', 'mảnh vỡ', 'tàn thuốc',
      'hộp gỗ', 'két sắt', 'bản đồ', 'ký hiệu', 'ấn ký', 'cổ vật'
    ],

    // Bảng quy đổi chữ số Tiếng Việt sang số nguyên phục vụ bộ tách chương
    VIETNAMESE_NUMBER_WORDS: {
      'không': 0,
      'một': 1,
      'nhất': 1,
      'mốt': 1,
      'hai': 2,
      'nhị': 2,
      'ba': 3,
      'tam': 3,
      'bốn': 4,
      'tứ': 4,
      'tư': 4,
      'năm': 5,
      'ngũ': 5,
      'lăm': 5,
      'sáu': 6,
      'lục': 6,
      'bảy': 7,
      'thất': 7,
      'tám': 8,
      'bát': 8,
      'chín': 9,
      'cửu': 9,
      'mười': 10,
      'thập': 10,
      'mươi': 10,
      'trăm': 100
    }
  };

  // ==========================================================================
  // PHẦN 2: BỘ CHUẨN HÓA BẢNG MÃ UNICODE & SỬA LỖI VĂN BẢN TIẾNG VIỆT
  // ==========================================================================
  class VietnameseEncodingNormalizer {
    constructor() {
      // Bảng sửa các mẫu lỗi Mojibake phổ biến khi đọc file TXT cũ
      this.mojibakeReplacements = [
        [/Ã¡/g, 'á'],
        [/Ã /g, 'à'],
        [/áº£/g, 'ả'],
        [/Ã£/g, 'ã'],
        [/áº¡/g, 'ạ'],
        [/Äƒ/g, 'ă'],
        [/áº¯/g, 'ắ'],
        [/áº±/g, 'ằ'],
        [/áº³/g, 'ẳ'],
        [/áºµ/g, 'ẵ'],
        [/áº·/g, 'ặ'],
        [/Ã¢/g, 'â'],
        [/áº¥/g, 'ấ'],
        [/áº§/g, 'ầ'],
        [/áº©/g, 'ẩ'],
        [/áº«/g, 'ẫ'],
        [/áº­/g, 'ậ'],
        [/Ä‘/g, 'đ'],
        [/Ä\u0090/g, 'Đ'],
        [/Ã©/g, 'é'],
        [/Ã¨/g, 'è'],
        [/áº»/g, 'ẻ'],
        [/áº½/g, 'ẽ'],
        [/áº¹/g, 'ẹ'],
        [/Ãª/g, 'ê'],
        [/áº¿/g, 'ế'],
        [/á»\u0081/g, 'ề'],
        [/á»ƒ/g, 'ể'],
        [/á»…/g, 'ễ'],
        [/á»‡/g, 'ệ'],
        [/Ã­/g, 'í'],
        [/Ã¬/g, 'ì'],
        [/á»‰/g, 'ỉ'],
        [/Ä©/g, 'ĩ'],
        [/á»‹/g, 'ị'],
        [/Ã³/g, 'ó'],
        [/Ã²/g, 'ò'],
        [/á»\u008F/g, 'ỏ'],
        [/Ãµ/g, 'õ'],
        [/á»\u008D/g, 'ọ'],
        [/Ã´/g, 'ô'],
        [/á»‘/g, 'ố'],
        [/á»“/g, 'ồ'],
        [/á»•/g, 'ổ'],
        [/á»—/g, 'ỗ'],
        [/á»™/g, 'ộ'],
        [/Æ¡/g, 'ơ'],
        [/á»›/g, 'ớ'],
        [/á»\u009D/g, 'ờ'],
        [/á»Ÿ/g, 'ở'],
        [/á»¡/g, 'ỡ'],
        [/á»£/g, 'ợ'],
        [/Ãº/g, 'ú'],
        [/Ã¹/g, 'ù'],
        [/á»§/g, 'ủ'],
        [/Å©/g, 'ũ'],
        [/á»¥/g, 'ụ'],
        [/Æ°/g, 'ư'],
        [/á»©/g, 'ứ'],
        [/á»«/g, 'ừ'],
        [/á»­/g, 'ử'],
        [/á»¯/g, 'ữ'],
        [/á»±/g, 'ự'],
        [/Ã½/g, 'ý'],
        [/á»³/g, 'ỳ'],
        [/á»·/g, 'ỷ'],
        [/á»¹/g, 'ỹ'],
        [/á»µ/g, 'ỵ']
      ];
    }

    /**
     * Phát hiện bảng mã tốt nhất từ Uint8Array (UTF-8, UTF-16LE, UTF-16BE, Windows-1258)
     */
    decodeArrayBufferSmart(arrayBuffer) {
      if (!arrayBuffer) return '';
      const bytes = new Uint8Array(arrayBuffer);
      if (bytes.length === 0) return '';

      // Kiểm tra BOM (Byte Order Mark)
      if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
        return new TextDecoder('utf-8').decode(bytes.subarray(3));
      }
      if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
        return new TextDecoder('utf-16le').decode(bytes.subarray(2));
      }
      if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
        return new TextDecoder('utf-16be').decode(bytes.subarray(2));
      }

      // Kiểm tra tỷ lệ byte 0x00 xen kẽ (UTF-16 không có BOM)
      let zeroEven = 0;
      let zeroOdd = 0;
      const sampleLen = Math.min(bytes.length, 512);
      for (let i = 0; i < sampleLen; i++) {
        if (bytes[i] === 0) {
          if (i % 2 === 0) zeroEven++;
          else zeroOdd++;
        }
      }
      if (zeroOdd > sampleLen * 0.25 && zeroEven < sampleLen * 0.05) {
        return new TextDecoder('utf-16le').decode(bytes);
      }
      if (zeroEven > sampleLen * 0.25 && zeroOdd < sampleLen * 0.05) {
        return new TextDecoder('utf-16be').decode(bytes);
      }

      // Thử giải mã UTF-8 nghiêm ngặt trước
      try {
        const strictDecoder = new TextDecoder('utf-8', { fatal: true });
        return strictDecoder.decode(bytes);
      } catch (_) {
        // Nếu có ký tự không hợp lệ trong UTF-8, thử Windows-1258 (Tiếng Việt) hoặc Windows-1252
        try {
          return new TextDecoder('windows-1258').decode(bytes);
        } catch (_err2) {
          return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
        }
      }
    }

    /**
     * Chuẩn hóa toàn diện văn bản Tiếng Việt (Unicode NFC, sửa Mojibake, dấu câu văn học)
     */
    normalizeVietnameseLiteraryText(rawText, options = {}) {
      if (!rawText || typeof rawText !== 'string') return '';

      const {
        fixBrokenPdfLines = false,
        standardizeDialogueDashes = true,
        preserveExactSpacing = false
      } = options;

      let text = rawText;

      // 1. Gỡ bỏ BOM, ký tự điều khiển ẩn & Zero-Width Spaces (trừ newline và tab)
      text = text
        .replace(/^\uFEFF/, '')
        .replace(/[\u200B-\u200D\uFEFF\u00AD]/g, '')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n');

      // 2. Sửa lỗi Mojibake nếu phát hiện nhiều cụm 'Ã' hoặc 'áº'
      if (/(?:Ã¡|áº|á»|Æ°|Æ¡|Ä‘)/.test(text)) {
        for (const [pattern, replacement] of this.mojibakeReplacements) {
          text = text.replace(pattern, replacement);
        }
      }

      // 3. Chuẩn hóa Unicode Tổ Hợp (NFD) về Unicode Dựng Sẵn (NFC)
      if (typeof text.normalize === 'function') {
        text = text.normalize('NFC');
      }

      // 4. Sửa các ký tự ligature bị dính khi trích xuất từ PDF (fi, fl, ffi, ffl)
      text = text
        .replace(/\uFB00/g, 'ff')
        .replace(/\uFB01/g, 'fi')
        .replace(/\uFB02/g, 'fl')
        .replace(/\uFB03/g, 'ffi')
        .replace(/\uFB04/g, 'ffl');

      // 5. Nếu văn bản đến từ PDF bị ngắt dòng cứng giữa câu, nối lại thông minh
      if (fixBrokenPdfLines) {
        text = this.reconstructBrokenPdfParagraphs(text);
      }

      // 6. Chuẩn hóa lời thoại đầu đoạn văn (ví dụ "-- " hoặc "- " ở đầu dòng thành "— ")
      if (standardizeDialogueDashes) {
        text = text
          .split('\n')
          .map((line) => {
            const trimmedStart = line.trimStart();
            if (/^(?:--|—|–|-)\s+\S/.test(trimmedStart)) {
              return trimmedStart.replace(/^(?:--|—|–|-)\s+/, '— ');
            }
            return line;
          })
          .join('\n');
      }

      // 7. Làm sạch khoảng trắng thừa nhưng bảo toàn cấu trúc đoạn văn
      if (!preserveExactSpacing) {
        text = text
          .split('\n')
          .map((line) => line.replace(/[ \t]+/g, ' ').trim())
          .join('\n')
          .replace(/\n{3,}/g, '\n\n')
          .trim();
      }

      return text;
    }

    /**
     * Khôi phục đoạn văn bị ngắt dòng giữa chừng khi trích xuất từ file PDF
     */
    reconstructBrokenPdfParagraphs(rawPdfText) {
      const lines = rawPdfText.split('\n');
      const rebuilt = [];
      let buffer = '';

      const isHeadingOrDialogue = (str) => {
        if (!str) return false;
        if (/^(?:—|–|-|“|"|«|\[|\*+|\d+\.|Chương|CHƯƠNG|Hồi|HỒI|Phần|PHẦN|Quyển|QUYỂN|Chapter|CHAPTER)\b/.test(str)) {
          return true;
        }
        return false;
      };

      const endsSentence = (str) => {
        if (!str) return true;
        return /[.!?…:;”"»\])]$/.test(str.trim());
      };

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Bỏ qua các dòng chỉ chứa số trang đơn lẻ (VD: "- 12 -", "Trang 15", "15")
        if (/^(?:-\s*\d+\s*-|Trang\s+\d+|\d{1,4})$/i.test(line)) {
          continue;
        }

        if (!line) {
          if (buffer) {
            rebuilt.push(buffer.trim());
            buffer = '';
          }
          continue;
        }

        if (!buffer) {
          buffer = line;
          continue;
        }

        // Nếu dòng mới là tiêu đề chương hoặc lời thoại mới, hoặc dòng trước đã kết câu
        if (isHeadingOrDialogue(line) || endsSentence(buffer)) {
          rebuilt.push(buffer.trim());
          buffer = line;
        } else {
          // Nếu dòng trước bị ngắt ngang bởi dấu gạch nối từ
          if (buffer.endsWith('-') && /^[a-zàáảãạăắằẳẵặâấầẩẫậđèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]/i.test(line)) {
            buffer = buffer.slice(0, -1) + line;
          } else {
            buffer += ' ' + line;
          }
        }
      }

      if (buffer) {
        rebuilt.push(buffer.trim());
      }

      return rebuilt.join('\n\n');
    }
  }

  // ==========================================================================
  // PHẦN 3: BỘ TRÍCH XUẤT ĐA ĐỊNH DẠNG (.DOCX, .PDF, .HTML, .MD, .JSON, .TXT)
  // ==========================================================================
  class MultiFormatDocumentExtractor {
    constructor(encodingNormalizer) {
      this.normalizer = encodingNormalizer;
    }

    /**
     * Đọc file .DOCX bằng Mammoth (ưu tiên) kết hợp bộ giải nén ZIP + XML thuần JS dự phòng
     */
    async extractDocxContent(file, baseTitle) {
      const arrayBuffer = await file.arrayBuffer();
      const metadata = {
        format: 'DOCX',
        headings: [],
        notes: [],
        tablesCount: 0,
        extractionMethod: 'MAMMOTH_OR_NATIVE_XML'
      };

      // 1. Thử dùng thư viện Mammoth nếu đã nạp trên trang
      if (window.mammoth) {
        try {
          const rawRes = await window.mammoth.extractRawText({ arrayBuffer });
          let rawText = (rawRes && rawRes.value) ? rawRes.value : '';

          // Thử trích xuất thêm cấu trúc HTML từ Mammoth để nhận diện các thẻ Heading (H1/H2/H3)
          if (typeof window.mammoth.convertToHtml === 'function') {
            try {
              const htmlRes = await window.mammoth.convertToHtml({ arrayBuffer });
              if (htmlRes && htmlRes.value) {
                const structured = this.convertMammothHtmlToStructuredNovelText(htmlRes.value);
                if (structured.text && structured.text.length >= rawText.length * 0.85) {
                  rawText = structured.text;
                  metadata.headings = structured.headings;
                  metadata.tablesCount = structured.tablesCount;
                }
              }
            } catch (_) {}
          }

          if (rawText && rawText.trim().length > 0) {
            const normalized = this.normalizer.normalizeVietnameseLiteraryText(rawText, {
              fixBrokenPdfLines: false,
              standardizeDialogueDashes: true
            });
            return {
              title: metadata.headings[0] || baseTitle,
              content: normalized,
              metadata
            };
          }
        } catch (mammothErr) {
          console.warn('[DocParser] Mammoth gặp lỗi, chuyển sang bộ đọc ZIP/XML nội bộ:', mammothErr);
        }
      }

      // 2. Bộ giải nén ZIP + phân tích `word/document.xml` thuần JavaScript (khi Mammoth vắng mặt hoặc lỗi)
      try {
        const xmlText = await this.extractWordDocumentXmlFromZipBuffer(arrayBuffer);
        if (xmlText) {
          const parsedXml = this.parseWordProcessingMlXml(xmlText);
          metadata.extractionMethod = 'NATIVE_ZIP_XML_FALLBACK';
          metadata.headings = parsedXml.headings;
          metadata.tablesCount = parsedXml.tablesCount;
          const normalized = this.normalizer.normalizeVietnameseLiteraryText(parsedXml.text, {
            fixBrokenPdfLines: false,
            standardizeDialogueDashes: true
          });
          return {
            title: parsedXml.headings[0] || baseTitle,
            content: normalized,
            metadata
          };
        }
      } catch (zipErr) {
        console.warn('[DocParser] Không thể giải nén ZIP/XML nội bộ:', zipErr);
      }

      // 3. Dự phòng cuối: quét chuỗi văn bản UTF-8 khả dụng
      const fallbackRaw = this.normalizer.decodeArrayBufferSmart(arrayBuffer);
      return {
        title: baseTitle,
        content: this.normalizer.normalizeVietnameseLiteraryText(fallbackRaw),
        metadata
      };
    }

    /**
     * Chuyển đổi HTML xuất ra từ Mammoth sang văn bản tiểu thuyết giữ nguyên dấu phân cảnh & tiêu đề chương
     */
    convertMammothHtmlToStructuredNovelText(htmlString) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, 'text/html');
      const headings = [];
      let tablesCount = 0;
      const blocks = [];

      const walkNodes = (root) => {
        const children = Array.from(root.children || []);
        if (children.length === 0) {
          const txt = (root.textContent || '').trim();
          if (txt) blocks.push(txt);
          return;
        }

        for (const el of children) {
          const tag = (el.tagName || '').toUpperCase();
          if (/^H[1-6]$/.test(tag)) {
            const hText = (el.textContent || '').replace(/\s+/g, ' ').trim();
            if (hText) {
              headings.push(hText);
              blocks.push(`\n${hText}\n`);
            }
          } else if (tag === 'P' || tag === 'BLOCKQUOTE' || tag === 'LI') {
            // Bảo toàn thẻ <br> bên trong đoạn văn
            const clone = el.cloneNode(true);
            clone.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
            const pText = (clone.textContent || '').trim();
            if (pText) {
              blocks.push(pText);
            }
          } else if (tag === 'HR') {
            blocks.push('* * *');
          } else if (tag === 'TABLE') {
            tablesCount++;
            const rows = Array.from(el.querySelectorAll('tr'));
            const tableLines = rows
              .map((tr) =>
                Array.from(tr.querySelectorAll('th, td'))
                  .map((cell) => (cell.textContent || '').replace(/\s+/g, ' ').trim())
                  .filter(Boolean)
                  .join(' | ')
              )
              .filter(Boolean);
            if (tableLines.length > 0) {
              blocks.push(tableLines.join('\n'));
            }
          } else {
            walkNodes(el);
          }
        }
      };

      if (doc && doc.body) {
        walkNodes(doc.body);
      }

      return {
        text: blocks.join('\n\n').replace(/\n{3,}/g, '\n\n').trim(),
        headings,
        tablesCount
      };
    }

    /**
     * Giải nén tệp `word/document.xml` trực tiếp từ ArrayBuffer của file .docx (chuẩn PKZIP)
     * Sử dụng DecompressionStream('deflate-raw') có sẵn trên trình duyệt hiện đại.
     */
    async extractWordDocumentXmlFromZipBuffer(arrayBuffer) {
      const view = new DataView(arrayBuffer);
      const bytes = new Uint8Array(arrayBuffer);
      let offset = 0;

      while (offset + 30 <= bytes.length) {
        const signature = view.getUint32(offset, true);
        // Local File Header signature = 0x04034b50
        if (signature !== 0x04034b50) {
          break;
        }

        const generalFlag = view.getUint16(offset + 6, true);
        const compressionMethod = view.getUint16(offset + 8, true);
        let compressedSize = view.getUint32(offset + 18, true);
        const fileNameLen = view.getUint16(offset + 26, true);
        const extraFieldLen = view.getUint16(offset + 28, true);

        const nameBytes = bytes.subarray(offset + 30, offset + 30 + fileNameLen);
        const entryName = new TextDecoder('utf-8').decode(nameBytes);
        const dataStart = offset + 30 + fileNameLen + extraFieldLen;

        // Nếu bật bit 3 của generalFlag (Data Descriptor), tìm header tiếp theo để suy ra kích thước nén
        if ((generalFlag & 0x0008) !== 0 && compressedSize === 0) {
          let scan = dataStart;
          while (scan + 4 <= bytes.length) {
            if (
              bytes[scan] === 0x50 &&
              bytes[scan + 1] === 0x4b &&
              ((bytes[scan + 2] === 0x03 && bytes[scan + 3] === 0x04) ||
                (bytes[scan + 2] === 0x01 && bytes[scan + 3] === 0x02))
            ) {
              break;
            }
            scan++;
          }
          compressedSize = Math.max(0, scan - dataStart);
        }

        if (entryName === 'word/document.xml') {
          const compressedSlice = bytes.subarray(dataStart, dataStart + compressedSize);
          if (compressionMethod === 0) {
            return new TextDecoder('utf-8').decode(compressedSlice);
          }
          if (compressionMethod === 8 && typeof DecompressionStream === 'function') {
            const ds = new DecompressionStream('deflate-raw');
            const writer = ds.writable.getWriter();
            writer.write(compressedSlice);
            writer.close();
            const decompressedBuffer = await new Response(ds.readable).arrayBuffer();
            return new TextDecoder('utf-8').decode(new Uint8Array(decompressedBuffer));
          }
          return null;
        }

        offset = dataStart + compressedSize;
      }

      return null;
    }

    /**
     * Phân tích cây XML `word/document.xml` của Microsoft Word thành văn bản tiểu thuyết chuẩn
     */
    parseWordProcessingMlXml(xmlString) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
      const paragraphs = [];
      const headings = [];
      let tablesCount = 0;

      const tableNodes = xmlDoc.getElementsByTagName('w:tbl');
      tablesCount = tableNodes ? tableNodes.length : 0;

      const pNodes = xmlDoc.getElementsByTagName('w:p');
      for (let i = 0; i < pNodes.length; i++) {
        const p = pNodes[i];
        let isHeading = false;

        const pStyle = p.getElementsByTagName('w:pStyle')[0];
        if (pStyle) {
          const val = pStyle.getAttribute('w:val') || '';
          if (/^(?:Heading|Title|Subtitle|Chuong|TieuDe)/i.test(val)) {
            isHeading = true;
          }
        }

        let paraBuffer = '';
        const childNodes = p.getElementsByTagName('*');
        for (let j = 0; j < childNodes.length; j++) {
          const node = childNodes[j];
          const nodeName = node.nodeName;
          if (nodeName === 'w:t') {
            paraBuffer += node.textContent || '';
          } else if (nodeName === 'w:tab') {
            paraBuffer += '\t';
          } else if (nodeName === 'w:br' || nodeName === 'w:cr') {
            paraBuffer += '\n';
          }
        }

        const cleanPara = paraBuffer.trim();
        if (cleanPara) {
          if (isHeading) {
            headings.push(cleanPara);
          }
          paragraphs.push(cleanPara);
        }
      }

      return {
        text: paragraphs.join('\n\n'),
        headings,
        tablesCount
      };
    }

    /**
     * Đọc file .PDF bằng PDF.js với thuật toán khôi phục dòng/đoạn văn theo tọa độ Y/X
     */
    async extractPdfContent(file, baseTitle) {
      const arrayBuffer = await file.arrayBuffer();
      const metadata = {
        format: 'PDF',
        pageCount: 0,
        headings: [],
        extractionMethod: 'PDFJS_LAYOUT_RECONSTRUCTOR'
      };

      if (window.pdfjsLib) {
        try {
          const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          metadata.pageCount = pdf.numPages;
          const reconstructedPages = [];

          for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex++) {
            const page = await pdf.getPage(pageIndex);
            const textContent = await page.getTextContent();
            const items = Array.isArray(textContent.items) ? textContent.items : [];
            const pageText = this.reconstructPdfPageLayoutFromItems(items);
            if (pageText) {
              reconstructedPages.push(pageText);
            }
          }

          const rawCombined = reconstructedPages.join('\n\n');
          const normalized = this.normalizer.normalizeVietnameseLiteraryText(rawCombined, {
            fixBrokenPdfLines: true,
            standardizeDialogueDashes: true
          });

          return {
            title: baseTitle,
            content: normalized,
            metadata
          };
        } catch (pdfErr) {
          console.warn('[DocParser] PDF.js gặp lỗi, chuyển sang bộ quét luồng PDF dự phòng:', pdfErr);
        }
      }

      // Bộ quét văn bản dự phòng trực tiếp từ luồng PDF khi không có PDF.js
      metadata.extractionMethod = 'RAW_PDF_STREAM_FALLBACK';
      const fallbackPdfText = this.extractFallbackTextFromRawPdfBytes(arrayBuffer);
      const normalized = this.normalizer.normalizeVietnameseLiteraryText(fallbackPdfText, {
        fixBrokenPdfLines: true,
        standardizeDialogueDashes: true
      });

      return {
        title: baseTitle,
        content: normalized,
        metadata
      };
    }

    /**
     * Thuật toán ghép các mảnh ký tự (TextItem) trong 1 trang PDF theo tọa độ [x, y]
     * giúp giữ nguyên đoạn văn, phát hiện xuống dòng và khoảng cách giữa các đoạn.
     */
    reconstructPdfPageLayoutFromItems(items) {
      if (!items || items.length === 0) return '';

      // Lọc các item có chuỗi văn bản
      const validItems = items
        .map((item) => {
          const transform = Array.isArray(item.transform) ? item.transform : [1, 0, 0, 1, 0, 0];
          return {
            str: String(item.str || ''),
            x: Number(transform[4]) || 0,
            y: Number(transform[5]) || 0,
            height: Math.abs(Number(item.height) || Number(transform[3]) || 12),
            width: Math.abs(Number(item.width) || 0),
            hasEOL: Boolean(item.hasEOL)
          };
        })
        .filter((it) => it.str.length > 0);

      if (validItems.length === 0) return '';

      // Gom nhóm theo dòng dựa trên tọa độ Y (dung sai 3.5 đơn vị điểm ảnh PDF)
      const lines = [];
      const yTolerance = 3.5;

      for (const item of validItems) {
        let matchedLine = null;
        for (let i = lines.length - 1; i >= Math.max(0, lines.length - 6); i--) {
          if (Math.abs(lines[i].y - item.y) <= yTolerance) {
            matchedLine = lines[i];
            break;
          }
        }
        if (matchedLine) {
          matchedLine.items.push(item);
        } else {
          lines.push({
            y: item.y,
            height: item.height,
            items: [item]
          });
        }
      }

      // Sắp xếp các dòng từ trên xuống dưới (trong hệ tọa độ PDF gốc dưới-trái, Y lớn hơn nằm ở trên)
      lines.sort((a, b) => b.y - a.y);

      const paragraphBlocks = [];
      let currentParaLines = [];
      let prevLineY = null;
      let prevLineHeight = 12;

      for (const line of lines) {
        // Sắp xếp các từ trong cùng 1 dòng từ trái sang phải (X tăng dần)
        line.items.sort((a, b) => a.x - b.x);

        let lineStr = '';
        let lastRightX = null;

        for (const token of line.items) {
          if (lastRightX !== null) {
            const gap = token.x - lastRightX;
            if (gap > 2.2 && !lineStr.endsWith(' ') && !token.str.startsWith(' ')) {
              lineStr += ' ';
            }
          }
          lineStr += token.str;
          lastRightX = token.x + (token.width || token.str.length * 4.5);
        }

        const cleanLine = lineStr.replace(/\s+/g, ' ').trim();
        if (!cleanLine) continue;

        // Kiểm tra khoảng cách dọc giữa 2 dòng để phát hiện ngắt đoạn mới
        if (prevLineY !== null) {
          const verticalGap = Math.abs(prevLineY - line.y);
          const avgHeight = Math.max(8, (prevLineHeight + line.height) / 2);
          if (verticalGap > avgHeight * 1.65 && currentParaLines.length > 0) {
            paragraphBlocks.push(currentParaLines.join('\n'));
            currentParaLines = [];
          }
        }

        currentParaLines.push(cleanLine);
        prevLineY = line.y;
        prevLineHeight = line.height || 12;
      }

      if (currentParaLines.length > 0) {
        paragraphBlocks.push(currentParaLines.join('\n'));
      }

      return paragraphBlocks.join('\n\n');
    }

    /**
     * Bộ quét chuỗi văn bản dự phòng từ file PDF thô khi không có thư viện PDF.js
     */
    extractFallbackTextFromRawPdfBytes(arrayBuffer) {
      const rawLatin = new TextDecoder('latin1').decode(new Uint8Array(arrayBuffer));
      const extractedPieces = [];
      const tjRegex = /\(([^()\\]*(?:\\.[^()\\]*)*)\)\s*Tj/g;
      let match = null;
      while ((match = tjRegex.exec(rawLatin)) !== null) {
        const cleaned = match[1]
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
          .replace(/\\\(/g, '(')
          .replace(/\\\)/g, ')');
        if (cleaned.trim()) {
          extractedPieces.push(cleaned);
        }
      }
      return extractedPieces.join(' ');
    }

    /**
     * Đọc file HTML / XHTML (.html, .htm) và trích xuất văn bản tiểu thuyết sạch
     */
    extractHtmlDocumentContent(rawHtml, baseTitle) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawHtml, 'text/html');

      if (!doc || !doc.body) {
        return {
          title: baseTitle,
          content: this.normalizer.normalizeVietnameseLiteraryText(rawHtml),
          metadata: { format: 'HTML' }
        };
      }

      // Loại bỏ các thẻ không thuộc nội dung văn học
      doc.querySelectorAll('script, style, nav, footer, header, noscript, iframe, svg').forEach((el) => {
        el.remove();
      });

      const docTitle =
        (doc.querySelector('h1')?.textContent || doc.title || baseTitle).replace(/\s+/g, ' ').trim();

      const structured = this.convertMammothHtmlToStructuredNovelText(doc.body.innerHTML);
      const normalized = this.normalizer.normalizeVietnameseLiteraryText(structured.text, {
        fixBrokenPdfLines: false,
        standardizeDialogueDashes: true
      });

      return {
        title: docTitle || baseTitle,
        content: normalized,
        metadata: {
          format: 'HTML',
          headings: structured.headings,
          tablesCount: structured.tablesCount
        }
      };
    }

    /**
     * Đọc file Markdown (.md) giữ nguyên tiêu đề chương và nhịp văn xuôi
     */
    extractMarkdownDocumentContent(rawMd, baseTitle) {
      let text = this.normalizer.normalizeVietnameseLiteraryText(rawMd, {
        fixBrokenPdfLines: false,
        standardizeDialogueDashes: true
      });

      const headings = [];
      const lines = text.split('\n').map((line) => {
        const hMatch = line.match(/^(#{1,4})\s+(.+)$/);
        if (hMatch) {
          const cleanH = hMatch[2].replace(/[*_~`]+/g, '').trim();
          headings.push(cleanH);
          return cleanH;
        }
        // Chuyển dấu phân cảnh --- hoặc *** thành * * *
        if (/^(?:---|\*\*\*|___)\s*$/.test(line.trim())) {
          return '* * *';
        }
        // Gỡ cú pháp link markdown [text](url) -> text, và đậm/nghiêng bao ngoài
        return line
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
          .replace(/\*\*([^*]+)\*\*/g, '$1')
          .replace(/__([^_]+)__/g, '$1');
      });

      return {
        title: headings[0] || baseTitle,
        content: lines.join('\n').replace(/\n{3,}/g, '\n\n').trim(),
        metadata: {
          format: 'MARKDOWN',
          headings
        }
      };
    }

    /**
     * Đọc file JSON (.json): Hỗ trợ cả file Backup toàn bộ dự án NoirStudio,
     * mảng danh sách chương, hoặc 1 đối tượng chương đơn lẻ.
     */
    extractJsonDocumentContent(rawJsonText, baseTitle) {
      try {
        const parsed = JSON.parse(rawJsonText);

        // Trường hợp 1: Bản sao lưu toàn diện (Full Workspace Backup / Snapshot)
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed.chapters)) {
          const firstChap = parsed.chapters[0] || {};
          return {
            title: firstChap.displayTitle || firstChap.title || baseTitle,
            content: (firstChap.content || '').trim(),
            isJson: true,
            isMultiChapterJsonBundle: true,
            jsonChapters: parsed.chapters,
            jsonWorkspaceBundle: parsed,
            metadata: {
              format: 'JSON_WORKSPACE_BUNDLE',
              chaptersCount: parsed.chapters.length
            }
          };
        }

        // Trường hợp 2: Mảng các chương JSON
        if (Array.isArray(parsed) && parsed.length > 0 && (parsed[0].content !== undefined || parsed[0].title !== undefined)) {
          const firstChap = parsed[0];
          return {
            title: firstChap.displayTitle || firstChap.title || baseTitle,
            content: (firstChap.content || '').trim(),
            isJson: true,
            isMultiChapterJsonBundle: true,
            jsonChapters: parsed,
            metadata: {
              format: 'JSON_CHAPTER_ARRAY',
              chaptersCount: parsed.length
            }
          };
        }

        // Trường hợp 3: Một đối tượng chương đơn lẻ
        if (parsed && typeof parsed === 'object' && typeof parsed.content === 'string') {
          return {
            title: parsed.displayTitle || parsed.title || baseTitle,
            content: this.normalizer.normalizeVietnameseLiteraryText(parsed.content),
            beats: parsed.beats || '',
            status: parsed.status || 'DRAFT',
            isJson: true,
            metadata: {
              format: 'JSON_SINGLE_CHAPTER'
            }
          };
        }

        // Trường hợp 4: JSON bất kỳ khác
        return {
          title: baseTitle,
          content: JSON.stringify(parsed, null, 2),
          isJson: true,
          metadata: {
            format: 'JSON_RAW'
          }
        };
      } catch (_) {
        return {
          title: baseTitle,
          content: rawJsonText.trim(),
          isJson: true,
          metadata: {
            format: 'JSON_INVALID_FALLBACK'
          }
        };
      }
    }
  }

  // ==========================================================================
  // PHẦN 4: BỘ NHẬN DIỆN & PHÂN TÁCH ĐA CHƯƠNG THÔNG MINH (MULTI-CHAPTER SPLITTER)
  // ==========================================================================
  class MultiChapterBoundarySplitter {
    constructor() {
      // Biểu thức chính quy nhận diện tiêu đề Tập / Quyển / Phần đứng riêng một dòng
      this.volumeHeaderRegex =
        /^(?:QUYỂN|TẬP|PHẦN|VOLUME|BOOK|PART)\s+(?:THỨ\s+)?([0-9]+|[IVXLCDM]+|[A-ZÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ\s]{1,25})(?:\s*[:\-–—.]\s*(.*))?$/i;

      // Biểu thức chính quy nhận diện tiêu đề Chương / Hồi / Màn / Tiết / Chapter
      this.chapterHeaderRegex =
        /^(?:(?:QUYỂN|TẬP|PHẦN)\s+[^\n:–—\-]+\s*[:\-–—]\s*)?(?:(CHƯƠNG|HỒI|CHAPTER|ACT|MÀN|TIẾT|EPISODE)\s+(?:THỨ\s+)?([0-9]+|[IVXLCDM]+|[A-ZÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ\s]{1,24})|(MỞ ĐẦU|KHÚC DẠO ĐẦU|PROLOGUE|VĨ THANH|KẾT CỤC|EPILOGUE|NGOẠI TRUYỆN|PHIÊN NGOẠI))(?:\s*[:\-–—.|]\s*(.*)|\s+(.*))?$/i;

      // Biểu thức nhận diện dòng chỉ gồm Số La Mã độc lập (VD: "I.", "II - Đêm Mưa", "III")
      this.standaloneRomanRegex =
        /^([IVXLCDM]{1,7})(?:\s*[:.\-–—]\s*(.{0,90}))?$/;
    }

    /**
     * Chuyển đổi chuỗi số La Mã (I, II, IV, IX, XII...) sang số nguyên
     */
    parseRomanNumeral(romanStr) {
      if (!romanStr || typeof romanStr !== 'string') return null;
      const clean = romanStr.trim().toUpperCase();
      if (!/^[IVXLCDM]+$/.test(clean)) return null;

      const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
      let total = 0;
      let prev = 0;

      for (let i = clean.length - 1; i >= 0; i--) {
        const curr = map[clean[i]] || 0;
        if (curr < prev) {
          total -= curr;
        } else {
          total += curr;
          prev = curr;
        }
      }
      return total > 0 && total <= 3000 ? total : null;
    }

    /**
     * Chuyển đổi chữ số Tiếng Việt (VD: "mười hai", "hai mươi lăm", "thứ nhất") sang số nguyên
     */
    parseVietnameseNumberWords(phrase) {
      if (!phrase || typeof phrase !== 'string') return null;
      const words = phrase
        .toLowerCase()
        .replace(/^thứ\s+/i, '')
        .trim()
        .split(/\s+/)
        .filter(Boolean);

      if (words.length === 0) return null;

      const dict = VIETNAMESE_LEXICON_CONFIG.VIETNAMESE_NUMBER_WORDS;
      for (const w of words) {
        if (dict[w] === undefined && w !== 'lẻ' && w !== 'linh') {
          return null;
        }
      }

      if (words.length === 1) {
        return dict[words[0]] ?? null;
      }

      let result = 0;
      let currentTens = 0;

      for (let i = 0; i < words.length; i++) {
        const w = words[i];
        if (w === 'lẻ' || w === 'linh') continue;
        const val = dict[w];
        if (val === 100) {
          result = (currentTens || 1) * 100;
          currentTens = 0;
        } else if (val === 10) {
          currentTens = currentTens === 0 ? 10 : currentTens * 10;
        } else {
          currentTens += val;
        }
      }

      const finalNum = result + currentTens;
      return finalNum > 0 ? finalNum : null;
    }

    /**
     * Trích xuất số thứ tự chương từ chuỗi định danh (số Ả Rập, số La Mã, hoặc chữ Tiếng Việt)
     */
    resolveChapterNumber(rawNumToken, fallbackNumber) {
      if (!rawNumToken) return fallbackNumber;
      const trimmed = rawNumToken.trim();

      if (/^\d+$/.test(trimmed)) {
        return parseInt(trimmed, 10);
      }

      const romanVal = this.parseRomanNumeral(trimmed);
      if (romanVal !== null) {
        return romanVal;
      }

      const vnVal = this.parseVietnameseNumberWords(trimmed);
      if (vnVal !== null) {
        return vnVal;
      }

      return fallbackNumber;
    }

    /**
     * Kiểm tra một dòng văn bản có phải là tiêu đề chương thực sự hay không
     */
    inspectLineAsChapterHeader(line, prevLineEmpty, nextLineEmpty, fallbackIndex) {
      if (!line) return null;
      const trimmed = line.replace(/^[#*\s]+|[#*\s]+$/g, '').trim();

      // Tiêu đề chương không bao giờ quá dài (> 115 ký tự) hoặc bắt đầu bằng dấu gạch ngang lời thoại
      if (!trimmed || trimmed.length > 115) return null;
      if (/^(?:—|–|-|“|"|«)/.test(trimmed)) return null;

      // Nếu dòng kết thúc bằng dấu chấm hỏi hoặc dấu chấm than giữa đoạn hội thoại dài, bỏ qua
      if (trimmed.length > 75 && /[?!]$/.test(trimmed)) return null;

      // 1. Kiểm tra mẫu Chương / Hồi / Chapter / Mở đầu / Vĩ thanh / Ngoại truyện
      const chapMatch = trimmed.match(this.chapterHeaderRegex);
      if (chapMatch) {
        const prefixKeyword = chapMatch[1] || chapMatch[3] || 'Chương';
        const rawNumberToken = chapMatch[2] || '';
        const subtitle = (chapMatch[4] || chapMatch[5] || '').trim();

        // Đảm bảo rawNumberToken thực sự là số, số La Mã, hoặc số đếm Tiếng Việt
        if (rawNumberToken) {
          const isValidNum =
            /^\d+$/.test(rawNumberToken.trim()) ||
            this.parseRomanNumeral(rawNumberToken.trim()) !== null ||
            this.parseVietnameseNumberWords(rawNumberToken.trim()) !== null;

          if (!isValidNum) {
            return null;
          }
        }

        const resolvedNum = this.resolveChapterNumber(rawNumberToken, fallbackIndex);
        let formattedTitle = '';
        if (chapMatch[3]) {
          // Mở đầu / Vĩ thanh / Ngoại truyện
          const specialKind = chapMatch[3].trim();
          formattedTitle = subtitle ? `${specialKind}: ${subtitle}` : specialKind;
        } else {
          const normalizedPrefix =
            prefixKeyword.toUpperCase() === 'CHAPTER'
              ? 'Chương'
              : prefixKeyword.charAt(0).toUpperCase() + prefixKeyword.slice(1).toLowerCase();
          formattedTitle = subtitle
            ? `${normalizedPrefix} ${resolvedNum}: ${subtitle}`
            : `${normalizedPrefix} ${resolvedNum}`;
        }

        return {
          chapterNumber: resolvedNum,
          rawHeader: trimmed,
          title: formattedTitle,
          subtitle: subtitle || '',
          kind: chapMatch[3] ? 'SPECIAL' : 'STANDARD'
        };
      }

      // 2. Kiểm tra dòng Số La Mã độc lập (chỉ chấp nhận nếu có dòng trống phía trước và sau)
      if (prevLineEmpty && nextLineEmpty && trimmed.length <= 60) {
        const romanMatch = trimmed.match(this.standaloneRomanRegex);
        if (romanMatch) {
          const romanVal = this.parseRomanNumeral(romanMatch[1]);
          if (romanVal !== null && romanVal <= 150) {
            const sub = (romanMatch[2] || '').trim();
            return {
              chapterNumber: romanVal,
              rawHeader: trimmed,
              title: sub ? `Chương ${romanVal}: ${sub}` : `Chương ${romanVal}`,
              subtitle: sub,
              kind: 'ROMAN_SECTION'
            };
          }
        }
      }

      return null;
    }

    /**
     * Phân tách văn bản thô chứa nhiều chương thành mảng các đối tượng chương chuẩn
     */
    splitMultiChapterDocument(rawText, defaultTitle = 'Chương 1') {
      if (!rawText || typeof rawText !== 'string') {
        return [
          {
            chapterNumber: 1,
            title: defaultTitle,
            displayTitle: defaultTitle,
            volumeTitle: '',
            content: ''
          }
        ];
      }

      const lines = rawText.replace(/\r\n/g, '\n').split('\n');
      const detectedBoundaries = [];
      let currentVolumeTitle = '';

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const prevEmpty = i === 0 || lines[i - 1].trim() === '';
        const nextEmpty = i === lines.length - 1 || lines[i + 1].trim() === '';

        // Kiểm tra xem dòng này có phải tiêu đề Quyển / Tập / Phần không
        if (line && line.length <= 95 && prevEmpty) {
          const volMatch = line.match(this.volumeHeaderRegex);
          if (volMatch && !this.chapterHeaderRegex.test(line)) {
            currentVolumeTitle = line.replace(/^[#*\s]+|[#*\s]+$/g, '').trim();
            continue;
          }
        }

        const headerInfo = this.inspectLineAsChapterHeader(
          line,
          prevEmpty,
          nextEmpty,
          detectedBoundaries.length + 1
        );

        if (headerInfo) {
          detectedBoundaries.push({
            lineIndex: i,
            volumeTitle: currentVolumeTitle,
            ...headerInfo
          });
        }
      }

      // Nếu không phát hiện ranh giới đa chương hoặc chỉ có 1 tiêu đề ở ngay đầu file
      if (detectedBoundaries.length === 0) {
        return [
          {
            chapterNumber: 1,
            title: defaultTitle,
            displayTitle: defaultTitle,
            volumeTitle: '',
            content: rawText.trim()
          }
        ];
      }

      const results = [];

      // Nếu trước tiêu đề chương đầu tiên có một đoạn văn dài (> 250 ký tự), tách làm "Lời Mở Đầu / Dẫn Nhập"
      const firstBoundaryLine = detectedBoundaries[0].lineIndex;
      if (firstBoundaryLine > 0) {
        const preambleText = lines.slice(0, firstBoundaryLine).join('\n').trim();
        if (preambleText.length > 250) {
          results.push({
            chapterNumber: 0,
            title: 'Mở Đầu: Dẫn Nhập Bản Thảo',
            displayTitle: 'Mở Đầu: Dẫn Nhập Bản Thảo',
            volumeTitle: detectedBoundaries[0].volumeTitle || '',
            content: preambleText
          });
        }
      }

      for (let idx = 0; idx < detectedBoundaries.length; idx++) {
        const current = detectedBoundaries[idx];
        const nextLineIdx =
          idx + 1 < detectedBoundaries.length
            ? detectedBoundaries[idx + 1].lineIndex
            : lines.length;

        const bodyLines = lines.slice(current.lineIndex + 1, nextLineIdx);
        const bodyContent = bodyLines.join('\n').trim();

        // Bỏ qua các dòng Mục lục (Table of Contents) ở đầu sách nơi giữa 2 tiêu đề chương không có nội dung thực
        if (bodyContent.length < 35 && idx + 1 < detectedBoundaries.length) {
          continue;
        }

        const displayTitle = current.volumeTitle
          ? `[${current.volumeTitle}] ${current.title}`
          : current.title;

        results.push({
          chapterNumber: results.length + 1,
          title: displayTitle,
          displayTitle,
          volumeTitle: current.volumeTitle || '',
          content: bodyContent
        });
      }

      // Nếu toàn bộ ranh giới bị lọc hết do là mục lục, trả về nguyên bản thảo
      if (results.length === 0) {
        return [
          {
            chapterNumber: 1,
            title: defaultTitle,
            displayTitle: defaultTitle,
            volumeTitle: '',
            content: rawText.trim()
          }
        ];
      }

      return results;
    }
  }

  // ==========================================================================
  // PHẦN 5: THUẬT TOÁN TÓM TẮT TRÍCH XUẤT 0 TOKEN (TEXTRANK & NARRATIVE ARC)
  // ==========================================================================
  class ZeroTokenLiterarySummarizer {
    constructor() {
      this.stopwords = VIETNAMESE_LEXICON_CONFIG.SUMMARY_STOPWORDS;
      this.dramaticSignals = VIETNAMESE_LEXICON_CONFIG.DRAMATIC_SIGNAL_WORDS;
    }

    /**
     * Tách văn bản thành danh sách các câu văn hoàn chỉnh, giữ nguyên lời thoại
     */
    splitIntoLiterarySentences(content) {
      if (!content || typeof content !== 'string') return [];
      const clean = content
        .replace(/\r\n/g, '\n')
        .replace(/\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (!clean) return [];

      // Tách câu dựa trên dấu kết câu (. ! ? …) nhưng tránh tách nhầm tên viết tắt ngắn
      const rawSentences = clean.split(/(?<=[.!?…])\s+/);
      const mergedSentences = [];

      for (let i = 0; i < rawSentences.length; i++) {
        const s = rawSentences[i].trim();
        if (!s) continue;
        if (
          mergedSentences.length > 0 &&
          mergedSentences[mergedSentences.length - 1].length < 22
        ) {
          mergedSentences[mergedSentences.length - 1] += ' ' + s;
        } else {
          mergedSentences.push(s);
        }
      }

      return mergedSentences.filter((s) => s.length > 18);
    }

    /**
     * Tách từ có nghĩa (Content Words) phục vụ tính độ tương đồng câu trong đồ thị TextRank
     */
    tokenizeMeaningfulWords(sentence) {
      if (!sentence) return [];
      return sentence
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 1 && !this.stopwords.has(w));
    }

    /**
     * Tính điểm kịch tính văn học (Dramatic & Narrative Weight) cho từng câu
     */
    computeLiterarySalienceScore(sentence, index, totalSentences) {
      let score = 1.0;
      const lower = sentence.toLowerCase();

      // 1. Trọng số vị trí theo cấu trúc 5 hồi của chương truyện:
      // Mở đầu (0-12%), Điểm kích hoạt (20-30%), Bước ngoặt giữa chương (45-55%), Cao trào (72-88%), Kết chương (90-100%)
      const relativePos = totalSentences > 1 ? index / (totalSentences - 1) : 0;
      if (index === 0 || relativePos <= 0.08) {
        score += 1.65; // Câu mở đầu thiết lập bối cảnh
      } else if (index === totalSentences - 1 || relativePos >= 0.92) {
        score += 1.85; // Câu kết chương / Cliffhanger
      } else if (relativePos >= 0.72 && relativePos <= 0.88) {
        score += 1.45; // Vùng cao trào
      } else if (relativePos >= 0.45 && relativePos <= 0.55) {
        score += 1.25; // Điểm xoay chuyển giữa chương
      }

      // 2. Trọng số từ khóa kịch tính / phục bút / bước ngoặt
      for (const [phrase, boost] of this.dramaticSignals.entries()) {
        if (lower.includes(phrase)) {
          score += boost * 0.45;
        }
      }

      // 3. Trọng số tên riêng (chữ viết hoa giữa câu — dấu hiệu xuất hiện nhân vật hoặc địa danh)
      const words = sentence.split(/\s+/);
      let properNounCount = 0;
      for (let i = 1; i < words.length; i++) {
        const cleanWord = words[i].replace(/[^\p{L}]/gu, '');
        if (
          cleanWord.length >= 2 &&
          /^[A-ZÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ]/.test(
            cleanWord
          )
        ) {
          properNounCount++;
        }
      }
      score += Math.min(1.5, properNounCount * 0.32);

      // 4. Độ dài câu lý tưởng cho bản tóm tắt (từ 45 đến 210 ký tự)
      if (sentence.length >= 45 && sentence.length <= 210) {
        score += 0.45;
      } else if (sentence.length > 320) {
        score *= 0.78;
      }

      return score;
    }

    /**
     * Tính độ tương đồng Cosine/BM25 rút gọn giữa 2 tập hợp từ khóa của 2 câu
     */
    computeSentenceSimilarity(tokensA, tokensB) {
      if (!tokensA.length || !tokensB.length) return 0;
      const setB = new Set(tokensB);
      let overlap = 0;
      for (const t of tokensA) {
        if (setB.has(t)) overlap++;
      }
      if (overlap === 0) return 0;
      const norm = Math.log(tokensA.length + 1) + Math.log(tokensB.length + 1);
      return norm > 0 ? overlap / norm : 0;
    }

    /**
     * Thuật toán tóm tắt trích xuất 0 Token kết hợp TextRank + Phân bố 5 mốc cốt truyện
     */
    buildExtractiveSummary(content, maxSentences = 5) {
      if (!content || typeof content !== 'string') return '';
      const clean = content.replace(/\s+/g, ' ').trim();
      if (clean.length <= 360) return clean;

      const sentences = this.splitIntoLiterarySentences(content);
      if (sentences.length <= maxSentences) {
        return sentences.join(' ');
      }

      // Giới hạn số câu đưa vào ma trận TextRank để đảm bảo tốc độ dưới 5ms ngay cả với chương 15.000 từ
      const maxGraphNodes = 90;
      const step = sentences.length > maxGraphNodes ? Math.ceil(sentences.length / maxGraphNodes) : 1;
      const sampled = [];
      for (let i = 0; i < sentences.length; i += step) {
        sampled.push({
          originalIndex: i,
          text: sentences[i],
          tokens: this.tokenizeMeaningfulWords(sentences[i]),
          baseScore: this.computeLiterarySalienceScore(sentences[i], i, sentences.length)
        });
      }
      // Luôn đảm bảo câu cuối cùng của chương có mặt trong tập xét duyệt
      if (sampled[sampled.length - 1].originalIndex !== sentences.length - 1) {
        const lastIdx = sentences.length - 1;
        sampled.push({
          originalIndex: lastIdx,
          text: sentences[lastIdx],
          tokens: this.tokenizeMeaningfulWords(sentences[lastIdx]),
          baseScore: this.computeLiterarySalienceScore(sentences[lastIdx], lastIdx, sentences.length)
        });
      }

      const n = sampled.length;
      const rankScores = sampled.map((s) => s.baseScore);

      // Chạy 3 vòng lặp lan truyền điểm TextRank
      for (let iter = 0; iter < 3; iter++) {
        const nextScores = new Array(n).fill(0);
        for (let i = 0; i < n; i++) {
          let neighborSum = 0;
          for (let j = 0; j < n; j++) {
            if (i === j) continue;
            const sim = this.computeSentenceSimilarity(sampled[i].tokens, sampled[j].tokens);
            if (sim > 0) {
              neighborSum += sim * rankScores[j];
            }
          }
          nextScores[i] = 0.45 * sampled[i].baseScore + 0.55 * (neighborSum * 0.25 + sampled[i].baseScore);
        }
        for (let i = 0; i < n; i++) {
          rankScores[i] = nextScores[i];
        }
      }

      sampled.forEach((item, idx) => {
        item.finalScore = rankScores[idx];
      });

      // Chia chương thành `maxSentences` phân vùng cốt truyện (Mở đầu -> Phát triển -> Giữa chương -> Cao trào -> Kết thúc)
      // để bản tóm tắt luôn bao quát trọn vẹn mạch diễn biến từ đầu tới cuối chương!
      const chosenIndices = new Set();
      const chosenItems = [];
      const bucketCount = Math.max(1, maxSentences);
      const bucketSize = n / bucketCount;

      for (let b = 0; b < bucketCount; b++) {
        const startIdx = Math.floor(b * bucketSize);
        const endIdx = b === bucketCount - 1 ? n : Math.max(startIdx + 1, Math.floor((b + 1) * bucketSize));
        let bestInBucket = null;

        for (let k = startIdx; k < endIdx; k++) {
          const candidate = sampled[k];
          if (chosenIndices.has(candidate.originalIndex)) continue;
          if (!bestInBucket || candidate.finalScore > bestInBucket.finalScore) {
            bestInBucket = candidate;
          }
        }

        if (bestInBucket) {
          chosenIndices.add(bestInBucket.originalIndex);
          chosenItems.push(bestInBucket);
        }
      }

      // Sắp xếp lại theo đúng trình tự thời gian xuất hiện trong chương
      chosenItems.sort((a, b) => a.originalIndex - b.originalIndex);
      return chosenItems.map((it) => it.text).join(' ');
    }

    /**
     * Tự động trích xuất danh sách các nhịp cảnh (Scene Beats) từ nội dung chương (0 Token)
     */
    extractZeroTokenSceneBeats(content, maxBeats = 6) {
      if (!content || typeof content !== 'string') return '';
      const paragraphs = content
        .split(/\r?\n\r?\n+/)
        .map((p) => p.replace(/\s+/g, ' ').trim())
        .filter((p) => p.length > 40);

      if (paragraphs.length === 0) return '';

      const beats = [];
      const step = Math.max(1, Math.floor(paragraphs.length / maxBeats));

      for (let i = 0; i < paragraphs.length && beats.length < maxBeats; i += step) {
        const para = paragraphs[i];
        const firstSentence = this.splitIntoLiterarySentences(para)[0] || para.slice(0, 140);
        const phaseLabel =
          beats.length === 0
            ? 'Mở cảnh'
            : beats.length === maxBeats - 1 || i + step >= paragraphs.length
            ? 'Điểm kết / Dư âm'
            : `Nhịp ${beats.length + 1}`;
        beats.push(`• [${phaseLabel}]: ${firstSentence}`);
      }

      return beats.join('\n');
    }
  }

  // ==========================================================================
  // PHẦN 6: BỘ TỰ ĐỘNG PHÁT HIỆN NHÂN VẬT, ĐỊA ĐIỂM & VẬT PHẨM PHỤC BÚT KHI NHẬP FILE
  // ==========================================================================
  class LiteraryEntityAutoDetector {
    constructor() {
      // Danh sách các từ viết hoa đầu câu phổ biến không phải tên nhân vật
      this.commonSentenceStarters = new Set([
        'Nhưng', 'Tuy', 'Mặc', 'Dù', 'Nếu', 'Khi', 'Lúc', 'Trong', 'Ngoài',
        'Trên', 'Dưới', 'Giữa', 'Trước', 'Sau', 'Bên', 'Phía', 'Hướng',
        'Từ', 'Đến', 'Tới', 'Vì', 'Bởi', 'Do', 'Tại', 'Ở', 'Theo', 'Cùng',
        'Với', 'Để', 'Cho', 'Mà', 'Rồi', 'Sau', 'Đó', 'Đây', 'Kia', 'Ấy',
        'Thế', 'Vậy', 'Nên', 'Còn', 'Chỉ', 'Vẫn', 'Đang', 'Đã', 'Sẽ', 'Vừa',
        'Mới', 'Chưa', 'Không', 'Chẳng', 'Đừng', 'Hãy', 'Có', 'Là', 'Và',
        'Hoặc', 'Hay', 'Một', 'Hai', 'Ba', 'Bốn', 'Năm', 'Sáu', 'Bảy',
        'Tám', 'Chín', 'Mười', 'Nhiều', 'Ít', 'Mọi', 'Các', 'Những', 'Cả',
        'Toàn', 'Mỗi', 'Từng', 'Người', 'Kẻ', 'Ai', 'Gì', 'Đâu', 'Sao',
        'Nào', 'Bao', 'Bấy', 'Hắn', 'Nàng', 'Cô', 'Anh', 'Chị', 'Em', 'Ông',
        'Bà', 'Tôi', 'Ta', 'Mình', 'Họ', 'Nó', 'Chúng', 'Lão', 'Gã', 'Y',
        'Chương', 'Hồi', 'Phần', 'Quyển', 'Tập', 'Màn', 'Tiết', 'Ngày',
        'Đêm', 'Sáng', 'Trưa', 'Chiều', 'Tối', 'Khuya', 'Mùa', 'Xuân',
        'Hạ', 'Thu', 'Đông', 'Tháng', 'Năm', 'Giờ', 'Phút', 'Giây', 'Bỗng',
        'Chợt', 'Đột', 'Ngay', 'Lập', 'Tức', ' Thực', 'Thật', 'Quả', 'Đúng',
        'Có lẽ', 'Hình như', 'Dường như', 'Chắc hẳn', 'Tất nhiên', 'Tuy nhiên'
      ]);
    }

    /**
     * Phân tích văn bản để tự động phát hiện Nhân vật, Địa điểm và Manh mối / Vật phẩm
     */
    analyzeEntitiesInText(text) {
      if (!text || typeof text !== 'string') {
        return {
          characters: [],
          locations: [],
          clues: [],
          stats: { dialogueLines: 0, narrativeParagraphs: 0 }
        };
      }

      const candidateNames = new Map();
      const candidateLocations = new Map();
      const candidateClues = new Map();

      // 1. Quét cụm Danh xưng + Tên viết hoa (VD: "thám tử Lâm Phong", "bác sĩ Trần Hải", "tiểu thư Minh Ngọc")
      const honorificPattern = VIETNAMESE_LEXICON_CONFIG.CHARACTER_HONORIFICS.join('|');
      const honRegex = new RegExp(
        `\\b(${honorificPattern})\\s+([A-ZÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ][a-zàáảãạăắằẳẵặâấầẩẫậđèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]+(?:\\s+[A-ZÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ][a-zàáảãạăắằẳẵặâấầẩẫậđèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]+){0,2})`,
        'g'
      );

      let match = null;
      while ((match = honRegex.exec(text)) !== null) {
        const rolePrefix = match[1].trim();
        const properName = match[2].trim();
        if (this.commonSentenceStarters.has(properName.split(/\s+/)[0])) continue;
        const entry = candidateNames.get(properName) || {
          name: properName,
          roleHint: rolePrefix,
          count: 0,
          contexts: []
        };
        entry.count += 2;
        if (!entry.roleHint && rolePrefix) entry.roleHint = rolePrefix;
        candidateNames.set(properName, entry);
      }

      // 2. Quét cụm Tên riêng viết hoa 2-3 âm tiết đứng giữa câu hoặc đi kèm động từ hội thoại
      const properSequenceRegex =
        /(?<=[,;:—–\-\s])\b([A-ZÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ][a-zàáảãạăắằẳẵặâấầẩẫậđèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]{1,12}(?:\s+[A-ZÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ][a-zàáảãạăắằẳẵặâấầẩẫậđèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]{1,12}){1,2})\b/g;

      while ((match = properSequenceRegex.exec(text)) !== null) {
        const fullProper = match[1].trim();
        const parts = fullProper.split(/\s+/);
        if (parts.some((p) => this.commonSentenceStarters.has(p))) continue;

        const existing = candidateNames.get(fullProper) || {
          name: fullProper,
          roleHint: 'Nhân vật trong bản thảo',
          count: 0,
          contexts: []
        };
        existing.count += 1;
        candidateNames.set(fullProper, existing);
      }

      // 3. Quét địa danh / bối cảnh không gian
      const locPrefixPattern = VIETNAMESE_LEXICON_CONFIG.LOCATION_PREFIXES.join('|');
      const locRegex = new RegExp(
        `\\b(${locPrefixPattern})\\s+([A-ZÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ][a-zàáảãạăắằẳẵặâấầẩẫậđèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ0-9]+(?:\\s+[A-ZÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴa-zàáảãạăắằẳẵặâấầẩẫậđèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ0-9]+){0,3})`,
        'g'
      );

      while ((match = locRegex.exec(text)) !== null) {
        const prefix = match[1].trim();
        const locName = match[2].trim();
        if (this.commonSentenceStarters.has(locName.split(/\s+/)[0])) continue;
        const fullLoc = `${prefix} ${locName}`;
        candidateLocations.set(fullLoc, (candidateLocations.get(fullLoc) || 0) + 1);
      }

      // 4. Quét các vật phẩm / phục bút quan trọng xuất hiện trong chương
      const lowerText = text.toLowerCase();
      for (const clueKey of VIETNAMESE_LEXICON_CONFIG.CLUE_OBJECT_KEYWORDS) {
        let pos = 0;
        let occurrences = 0;
        while ((pos = lowerText.indexOf(clueKey, pos)) !== -1) {
          occurrences++;
          pos += clueKey.length;
        }
        if (occurrences > 0) {
          candidateClues.set(clueKey, occurrences);
        }
      }

      // 5. Đếm tỷ lệ lời thoại và đoạn tự sự
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
      let dialogueLines = 0;
      let narrativeParagraphs = 0;
      for (const l of lines) {
        if (/^(?:—|–|-|“|"|«)/.test(l)) {
          dialogueLines++;
        } else {
          narrativeParagraphs++;
        }
      }

      // Lọc ra các nhân vật xuất hiện từ 2 lần trở lên (hoặc có danh xưng rõ ràng)
      const characters = Array.from(candidateNames.values())
        .filter((item) => item.count >= 2)
        .sort((a, b) => b.count - a.count)
        .slice(0, 18)
        .map((item) => ({
          name: item.name,
          role: item.roleHint
            ? item.roleHint.charAt(0).toUpperCase() + item.roleHint.slice(1)
            : 'Nhân vật',
          mentions: item.count
        }));

      const locations = Array.from(candidateLocations.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([loc, count]) => ({ name: loc, mentions: count }));

      const clues = Array.from(candidateClues.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([clue, count]) => ({ title: clue, mentions: count }));

      return {
        characters,
        locations,
        clues,
        stats: {
          dialogueLines,
          narrativeParagraphs,
          dialogueRatioPercent:
            lines.length > 0 ? Math.round((dialogueLines / lines.length) * 100) : 0
        }
      };
    }

    /**
     * Đồng bộ hóa nhẹ nhàng các nhân vật mới phát hiện vào Story Bible nếu chưa tồn tại
     */
    syncDiscoveredCharactersToStoryBible(detectedCharacters = [], sourceTitle = 'Bản thảo nhập') {
      const sb = window.NoirStudio.storyBible;
      if (!sb || !Array.isArray(sb.characters) || !Array.isArray(detectedCharacters)) {
        return 0;
      }

      const existingNames = new Set(
        sb.characters.map((c) => (c.name || '').trim().toLowerCase())
      );

      let addedCount = 0;
      for (const det of detectedCharacters) {
        if (!det.name || det.mentions < 3) continue;
        const key = det.name.trim().toLowerCase();
        if (existingNames.has(key)) continue;

        existingNames.add(key);
        sb.characters.push({
          id: 'char_auto_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          name: det.name,
          role: det.role || 'Nhân vật phát hiện tự động',
          traits: `Xuất hiện ${det.mentions} lần khi nhập "${sourceTitle}".`
        });
        addedCount++;
      }

      if (addedCount > 0) {
        if (typeof sb.renderCharactersList === 'function') {
          sb.renderCharactersList();
        }
        if (typeof sb.saveAllBibleData === 'function') {
          sb.saveAllBibleData(false);
        }
      }

      return addedCount;
    }
  }

  // ==========================================================================
  // PHẦN 7: BỘ PHÂN TÍCH NHỊP ĐIỆU VĂN HỌC & CẤU TRÚC ĐOẠN VĂN (PROSE ANALYZER)
  // ==========================================================================
  class VietnameseProseCadenceAnalyzer {
    constructor() {
      this.sensoryLexicon = {
        visual: [
          'ánh sáng', 'bóng tối', 'màu', 'đỏ', 'đen', 'trắng', 'vàng', 'xanh',
          'xám', 'lấp lánh', 'mờ ảo', 'rực rỡ', 'nhợt nhạt', 'lung linh', 'chói lòa',
          'bóng đêm', 'sương mù', 'khói', 'tia nắng', 'ánh đèn', 'Ánh mắt', 'nhìn'
        ],
        auditory: [
          'tiếng', 'âm thanh', 'vang', 'vọng', 'thì thầm', 'gào', 'thét', 'rên rỉ',
          'lách cách', 'lộp độp', 'rào rào', 'im lặng', 'tĩnh mịch', 'nín thở',
          'tiếng bước chân', 'tiếng chuông', 'tiếng gió', 'tiếng mưa', 'nghe'
        ],
        tactile: [
          'lạnh', 'buốt', 'nóng', 'ấm', 'ẩm ướt', 'khô rát', 'nhói', 'đau',
          'run rẩy', 'rùng mình', 'mềm mại', 'thô ráp', 'sắc bén', 'nặng nề',
          'chạm', 'nắm chặt', 'siết', 'mồ hôi', 'nước mắt'
        ],
        olfactoryAndGustatory: [
          'mùi', 'hương', 'tanh', 'mùi máu', 'mùi ẩm mốc', 'mùi thuốc lá',
          'mùi cà phê', 'ngọt', 'đắng', 'chát', 'mặn', 'cay nồng', 'ngạt thở'
        ]
      };
    }

    /**
     * Phân tích nhịp điệu câu văn, mật độ ngũ quan và độ đa dạng từ vựng của tài liệu nhập vào
     */
    evaluateProseMetrics(text) {
      if (!text || typeof text !== 'string' || !text.trim()) {
        return {
          totalWords: 0,
          uniqueWords: 0,
          lexicalDiversity: 0,
          avgSentenceWords: 0,
          shortSentenceRatio: 0,
          longSentenceRatio: 0,
          sensoryBreakdown: { visual: 0, auditory: 0, tactile: 0, olfactory: 0 },
          pacingVerdict: 'Chưa có dữ liệu'
        };
      }

      const rawWords = text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .split(/\s+/)
        .filter(Boolean);

      const totalWords = rawWords.length;
      const uniqueSet = new Set(rawWords);
      const uniqueWords = uniqueSet.size;
      const lexicalDiversity =
        totalWords > 0 ? Number(((uniqueWords / totalWords) * 100).toFixed(1)) : 0;

      const sentences = text
        .split(/(?<=[.!?…])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 2);

      let shortCount = 0;
      let longCount = 0;
      for (const s of sentences) {
        const wLen = s.split(/\s+/).filter(Boolean).length;
        if (wLen <= 9) shortCount++;
        if (wLen >= 28) longCount++;
      }

      const avgSentenceWords =
        sentences.length > 0 ? Number((totalWords / sentences.length).toFixed(1)) : 0;
      const shortSentenceRatio =
        sentences.length > 0 ? Math.round((shortCount / sentences.length) * 100) : 0;
      const longSentenceRatio =
        sentences.length > 0 ? Math.round((longCount / sentences.length) * 100) : 0;

      const lower = text.toLowerCase();
      const countKeywords = (arr) =>
        arr.reduce((sum, kw) => {
          let idx = 0;
          let hits = 0;
          while ((idx = lower.indexOf(kw, idx)) !== -1) {
            hits++;
            idx += kw.length;
          }
          return sum + hits;
        }, 0);

      const sensoryBreakdown = {
        visual: countKeywords(this.sensoryLexicon.visual),
        auditory: countKeywords(this.sensoryLexicon.auditory),
        tactile: countKeywords(this.sensoryLexicon.tactile),
        olfactory: countKeywords(this.sensoryLexicon.olfactoryAndGustatory)
      };

      let pacingVerdict = 'Nhịp điệu cân bằng (Tự sự kết hợp miêu tả hài hòa)';
      if (shortSentenceRatio >= 45) {
        pacingVerdict = 'Nhịp nhanh, dồn dập (Nhiều câu ngắn, đối thoại hoặc hành động kịch tính)';
      } else if (longSentenceRatio >= 38) {
        pacingVerdict = 'Nhịp chậm, giàu chất thơ & nội tâm (Nhiều câu văn dài miêu tả sâu)';
      }

      return {
        totalWords,
        uniqueWords,
        lexicalDiversity,
        avgSentenceWords,
        shortSentenceRatio,
        longSentenceRatio,
        sensoryBreakdown,
        pacingVerdict
      };
    }
  }

  // ==========================================================================
  // PHẦN 8: GIAO DIỆN HỘP THOẠI KIỂM DUYỆT & TÁCH ĐA CHƯƠNG KHI NHẬP TÀI LIỆU
  // ==========================================================================
  class SmartDocumentImportModalController {
    constructor(parserInstance) {
      this.parser = parserInstance;
      this.pendingImportJob = null;
      this.modalId = 'noir-mod06-smart-import-modal';
    }

    ensureModalInDOM() {
      let modal = document.getElementById(this.modalId);
      if (modal) return modal;

      modal = document.createElement('div');
      modal.id = this.modalId;
      modal.className =
        'hidden fixed inset-0 z-[98] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 font-sansUI';
      modal.innerHTML = `
        <div class="w-full max-w-4xl rounded-3xl border border-emerald-500/40 bg-zinc-950 text-zinc-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div class="px-5 py-4 border-b border-zinc-800 bg-zinc-900/90 flex items-center justify-between gap-3">
            <div>
              <h3 id="mod06-import-modal-title" class="font-extrabold text-sm sm:text-base text-emerald-400 flex items-center gap-2">
                📥 Trình Nhập & Phân Tách Bản Thảo Thông Minh (0 Token)
              </h3>
              <p id="mod06-import-modal-subtitle" class="text-[11px] text-zinc-400 mt-0.5">
                Tự động chuẩn hóa Tiếng Việt NFC, phát hiện ranh giới chương và trích xuất tóm tắt cốt truyện.
              </p>
            </div>
            <button type="button" id="btn-mod06-close-import-modal" class="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-rose-600 text-xs font-bold text-zinc-300 hover:text-white transition">
              ✕ Đóng
            </button>
          </div>

          <div id="mod06-import-modal-body" class="p-5 overflow-y-auto space-y-4 text-xs flex-1"></div>

          <div class="px-5 py-3.5 border-t border-zinc-800 bg-zinc-900/90 flex flex-wrap items-center justify-between gap-3">
            <label class="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
              <input type="checkbox" id="chk-mod06-auto-sync-entities" checked class="accent-emerald-500 rounded" />
              <span>Tự động bổ sung Nhân vật mới phát hiện vào Hồ sơ Story Bible (Tab 4)</span>
            </label>
            <div class="flex items-center gap-2">
              <button type="button" id="btn-mod06-import-as-single" class="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs transition">
                📄 Gộp thành 1 Chương Duy Nhất
              </button>
              <button type="button" id="btn-mod06-confirm-split-import" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition">
                ✨ Nhập Toàn Bộ Các Chương Đã Chọn
              </button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      modal
        .querySelector('#btn-mod06-close-import-modal')
        ?.addEventListener('click', () => this.closeModal());

      modal
        .querySelector('#btn-mod06-import-as-single')
        ?.addEventListener('click', () => this.executePendingImport(false));

      modal
        .querySelector('#btn-mod06-confirm-split-import')
        ?.addEventListener('click', () => this.executePendingImport(true));

      return modal;
    }

    closeModal() {
      const modal = document.getElementById(this.modalId);
      modal?.classList.add('hidden');
      this.pendingImportJob = null;
    }

    openPreviewForMultiChapterImport(jobData) {
      const modal = this.ensureModalInDOM();
      this.pendingImportJob = jobData;

      const titleEl = modal.querySelector('#mod06-import-modal-title');
      const subEl = modal.querySelector('#mod06-import-modal-subtitle');
      const bodyEl = modal.querySelector('#mod06-import-modal-body');

      if (titleEl) {
        titleEl.textContent = `📥 Phát Hiện ${jobData.chapters.length} Chương Trong Tệp "${jobData.fileName}"`;
      }
      if (subEl) {
        subEl.textContent = `Tổng cộng ${jobData.totalWords.toLocaleString('vi-VN')} từ • Nhịp văn: ${jobData.proseMetrics.pacingVerdict}`;
      }

      if (bodyEl) {
        const esc = (s) => this.parser.utils.escapeHtml(s);
        const charBadges =
          jobData.entities.characters.length > 0
            ? jobData.entities.characters
                .slice(0, 10)
                .map(
                  (c) =>
                    `<span class="px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-[11px]">👤 ${esc(
                      c.name
                    )} (${c.mentions})</span>`
                )
                .join(' ')
            : '<span class="text-zinc-500 italic">Chưa phát hiện tên riêng nổi bật</span>';

        const chapterRows = jobData.chapters
          .map(
            (ch, idx) => `
            <label class="flex items-start justify-between gap-3 p-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 hover:border-emerald-500/40 cursor-pointer transition">
              <div class="flex items-start gap-2.5 min-w-0 flex-1">
                <input type="checkbox" data-mod06-chap-idx="${idx}" checked class="mt-1 accent-emerald-500 rounded" />
                <div class="min-w-0 flex-1">
                  <div class="font-extrabold text-xs sm:text-sm text-emerald-400 truncate">
                    ${idx + 1}. ${esc(ch.displayTitle || ch.title)}
                  </div>
                  <div class="text-[11px] text-zinc-400 line-clamp-2 mt-1">
                    ${esc(ch.summary || ch.content.slice(0, 180) || '(Trống)')}
                  </div>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 font-monoCode font-bold text-[11px] shrink-0">
                ${(ch.wordCount || 0).toLocaleString('vi-VN')} từ
              </span>
            </label>
          `
          )
          .join('');

        bodyEl.innerHTML = `
          <div class="p-3.5 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 space-y-2">
            <div class="font-extrabold text-indigo-300 uppercase text-[11px]">
              🔍 Nhân Vật & Thực Thể Tự Động Nhận Diện Khi Quét Bản Thảo:
            </div>
            <div class="flex flex-wrap gap-1.5">${charBadges}</div>
          </div>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-extrabold text-zinc-200 uppercase text-[11px]">
                📚 Danh Sách Các Chương Được Hệ Thống Tách Tự Động (${jobData.chapters.length} chương):
              </span>
              <span class="text-[11px] text-zinc-400">Bỏ chọn chương nào bạn không muốn nhập</span>
            </div>
            <div class="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
              ${chapterRows}
            </div>
          </div>
        `;
      }

      modal.classList.remove('hidden');
    }

    async executePendingImport(useSplitChapters = true) {
      const job = this.pendingImportJob;
      if (!job) return;

      const modal = document.getElementById(this.modalId);
      const syncEntities = Boolean(
        modal?.querySelector('#chk-mod06-auto-sync-entities')?.checked
      );

      let targetChapters = [];
      if (useSplitChapters && job.chapters.length > 1) {
        const checkedBoxes = Array.from(
          modal?.querySelectorAll('[data-mod06-chap-idx]:checked') || []
        );
        const indices = checkedBoxes.map((cb) =>
          parseInt(cb.getAttribute('data-mod06-chap-idx'), 10)
        );
        targetChapters = job.chapters.filter((_, idx) => indices.includes(idx));
      } else {
        targetChapters = [
          {
            title: job.baseTitle,
            displayTitle: job.baseTitle,
            content: job.rawNormalizedContent,
            wordCount: this.parser.utils.countVietnameseWords(job.rawNormalizedContent),
            summary: this.parser.buildZeroTokenSummary(job.rawNormalizedContent)
          }
        ];
      }

      this.closeModal();

      if (targetChapters.length === 0) {
        this.parser.utils.showToast('⚠️ Bạn chưa chọn chương nào để nhập!', 'warning');
        return;
      }

      await this.parser.commitImportedChaptersToWorkspace(targetChapters, {
        syncEntities,
        detectedCharacters: job.entities?.characters || [],
        sourceLabel: job.fileName
      });
    }
  }

  // ==========================================================================
  // PHẦN 9: LỚP CHÍNH `LocalDocumentParserAndSummarizer` (PUBLIC API MODULE 06)
  // ==========================================================================
  class LocalDocumentParserAndSummarizer {
    constructor(utils) {
      this.utils = utils || this.createFallbackUtils();
      this.encodingNormalizer = new VietnameseEncodingNormalizer();
      this.formatExtractor = new MultiFormatDocumentExtractor(this.encodingNormalizer);
      this.chapterSplitter = new MultiChapterBoundarySplitter();
      this.summarizer = new ZeroTokenLiterarySummarizer();
      this.entityDetector = new LiteraryEntityAutoDetector();
      this.proseAnalyzer = new VietnameseProseCadenceAnalyzer();
      this.importModal = new SmartDocumentImportModalController(this);
      this.importHistoryLogs = [];
    }

    /**
     * Tiện ích dự phòng an toàn nếu Module 06 được gọi độc lập trước Module 02
     */
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
        countVietnameseWords(text) {
          if (!text || typeof text !== 'string') return 0;
          const trimmed = text.trim();
          return trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
        },
        showToast(msg) {
          console.log('[NoirStudio Import]', msg);
        }
      };
    }

    /**
     * Phương thức cốt lõi #1: Đọc 1 File bất kỳ (.docx, .pdf, .txt, .md, .json, .html)
     * Giữ tương thích 100% với chữ ký `async parseFile(file)` của hệ thống hợp nhất,
     * đồng thời trả về thêm metadata phong phú (splitChapters, entities, proseMetrics, summary, beats).
     */
    async parseFile(file) {
      if (!file) {
        return {
          title: 'Chương mới',
          content: '',
          isJson: false,
          splitChapters: [],
          entities: { characters: [], locations: [], clues: [] },
          proseMetrics: null
        };
      }

      const fileName = file.name || 'Ban_Thao_Nhap.txt';
      const ext = (fileName.split('.').pop() || '').toLowerCase();
      const baseTitle = fileName.replace(/\.[^/.]+$/, '').trim() || 'Chương mới';

      let extractionResult = null;

      if (ext === 'docx') {
        extractionResult = await this.formatExtractor.extractDocxContent(file, baseTitle);
      } else if (ext === 'pdf') {
        extractionResult = await this.formatExtractor.extractPdfContent(file, baseTitle);
      } else if (ext === 'html' || ext === 'htm' || ext === 'xhtml') {
        const arrayBuffer = await file.arrayBuffer();
        const rawHtml = this.encodingNormalizer.decodeArrayBufferSmart(arrayBuffer);
        extractionResult = this.formatExtractor.extractHtmlDocumentContent(rawHtml, baseTitle);
      } else if (ext === 'md' || ext === 'markdown') {
        const arrayBuffer = await file.arrayBuffer();
        const rawMd = this.encodingNormalizer.decodeArrayBufferSmart(arrayBuffer);
        extractionResult = this.formatExtractor.extractMarkdownDocumentContent(rawMd, baseTitle);
      } else if (ext === 'json') {
        const arrayBuffer = await file.arrayBuffer();
        const rawJson = this.encodingNormalizer.decodeArrayBufferSmart(arrayBuffer);
        extractionResult = this.formatExtractor.extractJsonDocumentContent(rawJson, baseTitle);
      } else {
        // Mặc định đọc văn bản (.txt, .log, .csv, .rtf đơn giản) với bộ giải mã tự động phát hiện bảng mã
        const arrayBuffer = await file.arrayBuffer();
        const decodedText = this.encodingNormalizer.decodeArrayBufferSmart(arrayBuffer);
        const normalizedText = this.encodingNormalizer.normalizeVietnameseLiteraryText(
          decodedText,
          {
            fixBrokenPdfLines: false,
            standardizeDialogueDashes: true
          }
        );
        extractionResult = {
          title: baseTitle,
          content: normalizedText,
          isJson: false,
          metadata: { format: 'TXT' }
        };
      }

      const finalContent = (extractionResult.content || '').trim();
      const finalTitle = (extractionResult.title || baseTitle).trim();

      // Tự động phân tách nếu bên trong tệp có chứa nhiều chương
      const splitChapters = extractionResult.isMultiChapterJsonBundle
        ? (extractionResult.jsonChapters || []).map((c, idx) => ({
            chapterNumber: c.chapterNumber || idx + 1,
            title: c.displayTitle || c.title || `Chương ${idx + 1}`,
            displayTitle: c.displayTitle || c.title || `Chương ${idx + 1}`,
            content: this.encodingNormalizer.normalizeVietnameseLiteraryText(c.content || ''),
            beats: c.beats || this.summarizer.extractZeroTokenSceneBeats(c.content || ''),
            status: c.status === 'APPROVED' ? 'APPROVED' : 'DRAFT',
            wordCount: this.utils.countVietnameseWords(c.content || ''),
            summary: c.summary || this.buildZeroTokenSummary(c.content || '')
          }))
        : this.splitMultiChapterDocument(finalContent, finalTitle);

      // Phân tích thực thể và nhịp điệu văn chương
      const entities = this.entityDetector.analyzeEntitiesInText(finalContent);
      const proseMetrics = this.proseAnalyzer.evaluateProseMetrics(finalContent);
      const summary = this.buildZeroTokenSummary(finalContent, 5);
      const autoBeats = this.summarizer.extractZeroTokenSceneBeats(finalContent, 5);

      // Lưu nhật ký nhập tài liệu trong phiên
      this.importHistoryLogs.unshift({
        id: 'imp_' + Date.now(),
        fileName,
        format: ext.toUpperCase(),
        importedAt: Date.now(),
        wordCount: proseMetrics.totalWords,
        detectedChaptersCount: splitChapters.length,
        detectedCharactersCount: entities.characters.length
      });

      return {
        title: finalTitle,
        content: finalContent,
        isJson: Boolean(extractionResult.isJson || ext === 'json'),
        isMultiChapterJsonBundle: Boolean(extractionResult.isMultiChapterJsonBundle),
        jsonWorkspaceBundle: extractionResult.jsonWorkspaceBundle || null,
        summary,
        beats: extractionResult.beats || autoBeats,
        splitChapters,
        entities,
        proseMetrics,
        metadata: extractionResult.metadata || { format: ext.toUpperCase() }
      };
    }

    /**
     * Phương thức cốt lõi #2: Tóm tắt trích xuất 0 Token (TextRank + 5 mốc kịch tính)
     */
    buildZeroTokenSummary(content, maxSentences = 5) {
      return this.summarizer.buildExtractiveSummary(content, maxSentences);
    }

    /**
     * Phương thức cốt lõi #3: Phân tách văn bản nhiều chương thành danh sách chương độc lập
     */
    splitMultiChapterDocument(rawText, defaultTitle = 'Chương 1') {
      const normalized = this.encodingNormalizer.normalizeVietnameseLiteraryText(rawText || '', {
        fixBrokenPdfLines: false,
        standardizeDialogueDashes: true
      });
      const rawChaps = this.chapterSplitter.splitMultiChapterDocument(normalized, defaultTitle);

      return rawChaps.map((ch, idx) => {
        const cleanBody = (ch.content || '').trim();
        return {
          chapterNumber: ch.chapterNumber || idx + 1,
          title: ch.title || `Chương ${idx + 1}`,
          displayTitle: ch.displayTitle || ch.title || `Chương ${idx + 1}`,
          volumeTitle: ch.volumeTitle || '',
          content: cleanBody,
          beats: this.summarizer.extractZeroTokenSceneBeats(cleanBody, 5),
          wordCount: this.utils.countVietnameseWords(cleanBody),
          summary: this.buildZeroTokenSummary(cleanBody, 5),
          status: 'DRAFT'
        };
      });
    }

    /**
     * Phương thức cốt lõi #4: Nhập hàng loạt nhiều tệp (hoặc 1 tệp chứa nhiều chương) vào bàn viết
     */
    async importMultipleFilesToChapters(fileList, options = {}) {
      if (!fileList || fileList.length === 0) return [];
      const files = Array.from(fileList);
      const { autoConfirmMultiSplit = false, syncEntities = true } = options;

      // Nếu chỉ nhập 1 file duy nhất nhưng bên trong phát hiện nhiều chương (>= 2 chương),
      // hiển thị Hộp thoại Kiểm duyệt & Tách chương thông minh để tác giả chủ động chọn!
      if (files.length === 1 && !autoConfirmMultiSplit) {
        const singleFile = files[0];
        const parsed = await this.parseFile(singleFile);

        if (parsed.splitChapters && parsed.splitChapters.length > 1) {
          this.importModal.openPreviewForMultiChapterImport({
            fileName: singleFile.name,
            baseTitle: parsed.title,
            rawNormalizedContent: parsed.content,
            chapters: parsed.splitChapters,
            totalWords: parsed.proseMetrics?.totalWords || 0,
            entities: parsed.entities,
            proseMetrics: parsed.proseMetrics
          });
          return parsed.splitChapters;
        }

        // Nếu chỉ có 1 chương trong file, nhập trực tiếp vào cây bản thảo
        const singleChapList = [
          {
            title: parsed.title,
            displayTitle: parsed.title,
            content: parsed.content,
            beats: parsed.beats || '',
            wordCount: this.utils.countVietnameseWords(parsed.content),
            summary: parsed.summary || this.buildZeroTokenSummary(parsed.content)
          }
        ];

        return await this.commitImportedChaptersToWorkspace(singleChapList, {
          syncEntities,
          detectedCharacters: parsed.entities?.characters || [],
          sourceLabel: singleFile.name
        });
      }

      // Trường hợp chọn nhiều file cùng lúc
      const allExtractedChapters = [];
      let allDetectedCharacters = [];

      for (const file of files) {
        const parsed = await this.parseFile(file);
        if (parsed.splitChapters && parsed.splitChapters.length > 1) {
          allExtractedChapters.push(...parsed.splitChapters);
        } else {
          allExtractedChapters.push({
            title: parsed.title,
            displayTitle: parsed.title,
            content: parsed.content,
            beats: parsed.beats || '',
            wordCount: this.utils.countVietnameseWords(parsed.content),
            summary: parsed.summary || this.buildZeroTokenSummary(parsed.content)
          });
        }
        if (parsed.entities && Array.isArray(parsed.entities.characters)) {
          allDetectedCharacters = allDetectedCharacters.concat(parsed.entities.characters);
        }
      }

      return await this.commitImportedChaptersToWorkspace(allExtractedChapters, {
        syncEntities,
        detectedCharacters: allDetectedCharacters,
        sourceLabel: `${files.length} tệp tài liệu`
      });
    }

    /**
     * Ghi nhận danh sách chương đã trích xuất vào `window.NoirStudio.chapterManager` & IndexedDB
     */
    async commitImportedChaptersToWorkspace(chaptersToCreate, meta = {}) {
      const chapMgr = window.NoirStudio.chapterManager;
      if (!chapMgr) return chaptersToCreate;

      const createdRecords = [];
      for (const ch of chaptersToCreate) {
        const created = await chapMgr.createNewChapter(
          ch.displayTitle || ch.title || 'Chương mới',
          ch.content || ''
        );
        if (created && ch.beats && !created.beats) {
          created.beats = ch.beats;
          if (window.NoirStudio.idb && window.NoirStudio.constants) {
            await window.NoirStudio.idb.set(
              window.NoirStudio.constants.STORES.CHAPTERS,
              created.id,
              created
            );
          }
        }
        if (created) {
          createdRecords.push(created);
        }
      }

      if (meta.syncEntities && Array.isArray(meta.detectedCharacters)) {
        const addedChars = this.entityDetector.syncDiscoveredCharactersToStoryBible(
          meta.detectedCharacters,
          meta.sourceLabel || 'Tài liệu nhập'
        );
        if (addedChars > 0) {
          this.utils.showToast(
            `📥 Đã nhập ${createdRecords.length} chương & tự động thêm ${addedChars} nhân vật mới vào Story Bible!`,
            'success',
            4200
          );
          return createdRecords;
        }
      }

      if (createdRecords.length > 1) {
        this.utils.showToast(
          `📚 Đã tách và nhập thành công ${createdRecords.length} chương vào Cây Bản Thảo!`,
          'success',
          4000
        );
      }

      return createdRecords;
    }

    /**
     * Trích xuất danh sách nhân vật, địa danh và phục bút từ bất kỳ đoạn văn bản nào
     */
    extractEntitiesFromText(text) {
      return this.entityDetector.analyzeEntitiesInText(text);
    }

    /**
     * Phân tích nhịp điệu câu văn & mật độ ngũ quan cho một chương
     */
    analyzeProseCadence(text) {
      return this.proseAnalyzer.evaluateProseMetrics(text);
    }

    /**
     * Chuẩn hóa văn bản Tiếng Việt (NFC, dấu hội thoại, sửa lỗi ngắt dòng PDF)
     */
    normalizeVietnameseText(rawText, options = {}) {
      return this.encodingNormalizer.normalizeVietnameseLiteraryText(rawText, options);
    }
  }

  // Khởi tạo và đăng ký vào không gian tên toàn cục `window.NoirStudio.docParser`
  const docParser = new LocalDocumentParserAndSummarizer(window.NoirStudio.utils);
  window.LocalDocumentParserAndSummarizer = LocalDocumentParserAndSummarizer;
  window.NoirStudio.docParser = docParser;
})();
