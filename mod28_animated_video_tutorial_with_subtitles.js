/**
 * ============================================================================
 * NOIR STUDIO v38.0 — MODULE 28: VIDEO HƯỚNG DẪN TƯƠNG TÁC CÓ PHỤ ĐỀ CHI TIẾT,
 * SƠ ĐỒ TÍNH NĂNG A-Z, NHẬT KÝ ĐẠI TU & CẨM NANG MÔ HÌNH AI MỚI NHẤT
 * ============================================================================
 * Nhiệm vụ:
 *  - Xây dựng Trình phát Video Hoạt Họa 60FPS trực tiếp bằng HTML5 Canvas
 *    minh họa trực quan từng màn hình, quy trình 2 bước AI, Chế độ 5 vẽ sơ đồ,
 *    Google Docs Diff Review, Pomodoro đồng bộ 2 chiều & Kho Phiên Bản Tab 6.
 *  - Đồng bộ Phụ Đề Tiếng Việt theo từng giây (cùng Bảng Lời Thoại Có Thể Bấm
 *    Để Tua Nhanh đến đúng giây cần xem), tùy chỉnh tốc độ 0.75x - 1.5x.
 *  - Cung cấp Nhật ký Đại tu v38.0 chi tiết từng bản vá lỗi, Bảng đối chiếu
 *    các dòng mô hình Gemini mới nhất & Bộ phím tắt tối ưu cho Desktop/Mobile.
 * ============================================================================
 */
(function initMod28TutorialAndChangelog(globalScope) {
  'use strict';

  const NS = (globalScope.NoirStudio = globalScope.NoirStudio || {});

  /**
   * Danh sách 8 phân đoạn video hướng dẫn tương ứng toàn bộ hệ sinh thái 6 màn hình.
   */
  const VIDEO_TUTORIAL_CHAPTERS_DATA = Object.freeze([
    {
      id: 'CHAP_01_SIX_SCREENS',
      index: 1,
      title: '1. Làm Quen Giao Diện 6 Màn Hình (Máy Tính & Điện Thoại)',
      durationSec: 22,
      startSec: 0,
      endSec: 22,
      accentColor: '#10b981',
      badgeLabel: 'KIẾN TRÚC TỔNG QUAN',
      sceneType: 'SIX_SCREENS_MAP',
      summary:
        'Hiểu rõ cách 6 không gian tách biệt hoạt động không xung đột và cách dùng thanh điều hướng dưới đáy trên điện thoại.',
      keyActionSteps: [
        'Màn hình 1 (Bàn Viết): Khung soạn thảo rộng thoáng chuẩn sách in kèm thanh công cụ tiếng Việt.',
        'Màn hình 2 (Chương & Nguồn): Quản lý danh sách chương, lọc Đã duyệt/Nháp và tìm ký ức BM25 0 Token.',
        'Dưới màn hình nhỏ (Điện thoại/Tablet): Chạm thanh 6 nút cố định dưới đáy hoặc vuốt chuyển Tab mượt mà.',
      ],
    },
    {
      id: 'CHAP_02_TAB1_DIFF_AND_SENSES',
      index: 2,
      title: '2. Tab 1: Soạn Thảo, Chấp Nhận Thay Đổi AI Kiểu Google Docs & Ngũ Quan',
      durationSec: 24,
      startSec: 22,
      endSec: 46,
      accentColor: '#14b8a6',
      badgeLabel: 'BÀN VIẾT & AI DIFF',
      sceneType: 'TAB1_DIFF_REVIEW',
      summary:
        'Phân biệt rõ câu chữ do AI mới bổ sung bằng màu sắc nổi bật và dùng Từ điển Ngũ quan + Lore Whisper âm thầm.',
      keyActionSteps: [
        'Khi AI chèn hoặc nối tiếp văn bản vào bản thảo, đoạn mới đổi màu riêng để tác giả soát từng đoạn.',
        'Bấm "Chấp nhận" hoặc "Từ chối" từng cụm thay đổi giống tính năng đề xuất chỉnh sửa của Google Docs.',
        'Khi gõ tên nhân vật từ Story Bible, thanh Lore Whisper tự hiện nhẹ nhắc tính cách & bí mật tránh quên.',
      ],
    },
    {
      id: 'CHAP_03_TAB2_RAG_IMPORT',
      index: 3,
      title: '3. Tab 2: Nạp Truyện DOCX/PDF/TXT & Tìm Chi Tiết Cũ (BM25 - 0 Token)',
      durationSec: 24,
      startSec: 46,
      endSec: 70,
      accentColor: '#f59e0b',
      badgeLabel: 'QUẢN LÝ CHƯƠNG & RAG',
      sceneType: 'TAB2_CHAPTER_RAG',
      summary:
        'Nhập nhiều chương hoặc đề cương từ máy, đổi tên trực tiếp trên danh sách và tra cứu chi tiết cũ tức thì không tốn API.',
      keyActionSteps: [
        'Bấm "Nạp file .DOCX / .PDF / .TXT từ máy" để tách chương tự động vào bộ nhớ IndexedDB cục bộ.',
        'Dùng ô "Tra cứu chi tiết cũ BM25" để tìm xem chiếc nhẫn hay lời hứa cũ từng xuất hiện ở chương nào.',
        'Kết nối nút "Ổ cứng" trên thanh tiêu đề để đồng bộ file .TXT/.JSON thật ngay về thư mục máy tính.',
      ],
    },
    {
      id: 'CHAP_04_TAB3_TWO_STEP_AI',
      index: 4,
      title: '4. Tab 3: Quy Trình 2 Bước (Prompt Tổng Hợp -> Viết Truyện Chính Thức)',
      durationSec: 28,
      startSec: 70,
      endSec: 98,
      accentColor: '#34d399',
      badgeLabel: '5 CHẾ ĐỘ AI & CỔNG XÁC NHẬN',
      sceneType: 'TWO_STEP_PROMPT',
      summary:
        'Tự động gộp Story Bible + Mốc chuyển cảnh + Ký ức RAG + Câu lệnh trước khi cho phép bạn chọn lại mô hình viết chính thức.',
      keyActionSteps: [
        'Bấm nút "Chọn chế độ chạy mô hình, thông số và nhập câu lệnh" trong khung soạn lệnh siêu rộng mặc định.',
        'Bước 1: Hệ thống hợp nhất Story Bible, mốc POV, BM25 và câu lệnh thành Prompt Tổng Hợp hoàn chỉnh.',
        'Bước 2: Hộp thoại xác nhận hiển thị prompt đã lắp ghép, cho chọn mô hình lần cuối (khuyến cáo từ Flash trở lên).',
      ],
    },
    {
      id: 'CHAP_05_MODE5_TIMELINE_DIAGRAM',
      index: 5,
      title: '5. Chế Độ 5: Vẽ Biểu Đồ Cốt Truyện & Kiểm Tra Mâu Thuẫn Thời Gian',
      durationSec: 24,
      startSec: 98,
      endSec: 122,
      accentColor: '#818cf8',
      badgeLabel: 'CHẾ ĐỘ 5 & MỐC CẢNH',
      sceneType: 'MODE5_PLOT_GRAPH',
      summary:
        'Chọn danh sách chương muốn đối chiếu để AI dựng sơ đồ SVG dòng thời gian, nhân quả sự kiện và cảnh báo lỗ hổng logic.',
      keyActionSteps: [
        'Mở trình đơn thả xuống ở thanh trên Tab 3 và chọn "Chế độ 5: Vẽ Biểu Đồ Cốt Truyện".',
        'Đánh dấu các chương muốn quét (hoặc chọn nhanh tất cả chương Đã duyệt), chọn sơ đồ SVG + Bảng niên biểu.',
        'Xuất ảnh PNG/SVG độ nét cao hoặc chuyển thẳng các phát hiện mâu thuẫn thành ghi chú chỉnh sửa.',
      ],
    },
    {
      id: 'CHAP_06_TAB4_SMART_APPROVAL',
      index: 6,
      title: '6. Tab 4: Story Bible Đa Chiều & Duyệt Bản Thảo Không Thừa Cửa Sổ',
      durationSec: 22,
      startSec: 122,
      endSec: 144,
      accentColor: '#ec4899',
      badgeLabel: 'STORY BIBLE & CHỐT CHƯƠNG',
      sceneType: 'TAB4_BIBLE_MATRIX',
      summary:
        'Chốt khung mẫu Story Bible, quản lý Ma trận Ai Biết Gì để tránh lỡ miệng tiết lộ bí mật và chốt duyệt chương gọn sạch.',
      keyActionSteps: [
        'Khóa Khung Mẫu cấu trúc để AI khi cập nhật Story Bible không bao giờ làm vỡ dàn ý gốc của bạn.',
        'Bấm "Duyệt & Chốt Bản Thảo": Màn hình chờ xuất hiện gọn gàng, trích xuất nhân vật/manh mối rồi báo thành công.',
        'Không còn cửa sổ đầu ra thừa trong hộp thoại Duyệt vì mọi kết quả đã nằm gọn ở Tab 3 và Story Bible.',
      ],
    },
    {
      id: 'CHAP_07_TAB5_POMODORO_SYNC',
      index: 7,
      title: '7. Tab 5: Nhạc Nền MP3 Lặp A-B & Đồng Hồ Pomodoro Đồng Bộ 2 Chiều',
      durationSec: 22,
      startSec: 144,
      endSec: 166,
      accentColor: '#f97316',
      badgeLabel: 'TẬP TRUNG & ÂM THANH',
      sceneType: 'POMODORO_TWO_WAY_SYNC',
      summary:
        'Bấm Bắt đầu/Tạm dừng ở Tab 5 hay trên thanh Pomodoro nổi đều cập nhật chung 1 nguồn thời gian duy nhất.',
      keyActionSteps: [
        'Trạng thái đồng hồ lưu tập trung tại 1 bộ đếm duy nhất nên không còn tình trạng lệch pha giữa Tab 5 và thanh nổi.',
        'Kết hợp tiếng mưa, lửa trại, quán cà phê WebAudio không cần internet với tệp MP3 cá nhân lặp đoạn A-B.',
        'Mục tiêu chữ hằng ngày và chế độ Tập trung Toàn Màn Hình (Zen Mode) giúp hoàn thành chương nhanh hơn.',
      ],
    },
    {
      id: 'CHAP_08_TAB6_TIME_MACHINE_PDF',
      index: 8,
      title: '8. Tab 6: Kho Phiên Bản Time-Machine (Preview) & Xuất PDF Chọn Font/Cỡ Chữ',
      durationSec: 24,
      startSec: 166,
      endSec: 190,
      accentColor: '#38bdf8',
      badgeLabel: 'PHIÊN BẢN CŨ & XUẤT SÁCH',
      sceneType: 'VERSION_VAULT_AND_PDF',
      summary:
        'Lưu liên tục mọi cột mốc chỉnh sửa, mở Preview xem lại giao diện/nội dung cũ trước khi khôi phục và xuất PDF chuẩn in ấn.',
      keyActionSteps: [
        'Danh sách phiên bản tự động chụp liên tục bản thảo và Story Bible để không bao giờ mất công sức nếu lỡ tay xóa nhầm.',
        'Bấm vào một mốc bất kỳ để Preview ngay trạng thái cũ (hoặc phóng to toàn màn hình so sánh Diff trước-sau).',
        'Khi xuất PDF, tự chọn Font chữ (Merriweather, Times New Roman, Roboto...), Cỡ chữ (pt) và độ giãn dòng trực quan.',
      ],
    },
    {
      id: 'CHAP_09_MOD32_STAGE_AND_ARGON_BRIDGE',
      index: 9,
      order: 9,
      title: '9. Mod 32 & 33: Nền Kính Mờ Rõ Nét, Video Giao Diện Thật, Giọng Neural & Argon 4',
      shortTitle: '9. Mod 32 & 33: Video Thật & Argon 4',
      startSec: 190,
      endSec: 230,
      durationSec: 40,
      accentColor: '#a855f7',
      badgeLabel: 'MODULE 32 & 33 MỚI',
      sceneType: 'ARGON_WEB_AND_AMBIENT_STAGE',
      summary:
        'Sửa triệt để lỗi nền đen đặc khi chọn Tranh nghệ thuật / Video nền (IndexedDB bền vững + Kính mờ đa tầng) và cầu nối copy prompt 20.000+ từ chạy Argon 4 / Carbon 4 trên Gemini Web.',
      keyActionSteps: [
        'Trong Tab 5, bảng chẩn đoán Module 32 giữ nền luôn xuyên sáng đẹp với nút "Mở Hộp Công Cụ Nền", Preset độ trong suốt và giữ ảnh/video cá nhân qua IndexedDB.',
        'Trên màn hình Duyệt Prompt Tổng & màn hình Đang Chạy AI, bấm đường link gạch chân để 1 chạm chép trọn Prompt Tổng Hợp + mở thẳng Gemini Web.',
        'Lưu ý gói cước: Muốn viết sâu 20.000+ từ một mạch, cần nâng cấp Pro để dùng Argon 4 hoặc Ultra để dùng Carbon 4 trên Gemini Web.',
      ],
    },
  ]);

  /**
   * Hệ thống Phụ Đề Tiếng Việt đồng bộ chi tiết theo từng giây cho toàn bộ 8 phân đoạn video.
   */
  const SYNCHRONIZED_SUBTITLE_TRACK_V38 = Object.freeze([
    {
      id: 'SUB_01',
      chapterId: 'CHAP_01_SIX_SCREENS',
      startSec: 0,
      endSec: 5.5,
      speaker: 'Bé Bi Hướng Dẫn',
      speakerEn: 'Bi Guide',
      text: 'Chào mừng bạn tới Web Viết Tiểu Thuyết Của Bi! Trước khi vào viết, hãy dán API Key Gemini và chọn thư mục ổ cứng để bảo vệ truyện nhé.',
      textEn: 'Welcome to Bi’s Light Novel Studio! First, link your Gemini API Key and pick a local folder so your chapters stay safely backed up.',
    },
    {
      id: 'SUB_02',
      chapterId: 'CHAP_01_SIX_SCREENS',
      startSec: 5.5,
      endSec: 11.5,
      speaker: 'Bé Bi Hướng Dẫn',
      speakerEn: 'Bi Guide',
      text: 'Khi cả 2 bước xong, nút "Vào không gian viết tiểu thuyết" sẽ chuyển xanh lá rực rỡ. Bên trong là 6 Tab tách biệt cực gọn gàng!',
      textEn: 'Once both steps pass, the Enter Studio button turns bright green! Inside, 6 dedicated tabs keep every tool clean and clutter-free.',
    },
    {
      id: 'SUB_03',
      chapterId: 'CHAP_01_SIX_SCREENS',
      startSec: 11.5,
      endSec: 17.0,
      speaker: 'Bé Bi Hướng Dẫn',
      speakerEn: 'Bi Guide',
      text: 'Các thanh Nhạc, Pomodoro và AI nổi đều thu gọn sẵn ở góc, bạn kéo thả đi đâu cũng được và bấm dấu X tắt mở lại bất kỳ lúc nào.',
      textEn: 'Floating Music, Pomodoro, and AI bars start neatly collapsed—drag them anywhere, close them with X, and reopen from Tab 5 or Tab 6.',
    },
    {
      id: 'SUB_04',
      chapterId: 'CHAP_01_SIX_SCREENS',
      startSec: 17.0,
      endSec: 22.0,
      speaker: 'Mẹo nhỏ xinh',
      speakerEn: 'Cute Tip',
      text: 'Gõ phím Alt + 1 đến Alt + 6 để lướt qua lại giữa 6 Tab trong chớp mắt trên cả máy tính lẫn iPad nhé!',
      textEn: 'Press Alt + 1 through Alt + 6 to hop smoothly across all 6 screens in a blink!',
    },
    {
      id: 'SUB_05',
      chapterId: 'CHAP_02_TAB1_DIFF_AND_SENSES',
      startSec: 22.0,
      endSec: 28.0,
      speaker: 'Bé Bi Hướng Dẫn',
      speakerEn: 'Bi Guide',
      text: 'Tại Tab 1 Bàn Viết, khi AI chèn chữ mới vào truyện, đoạn văn của AI sẽ sáng màu riêng để bạn soi từng chữ thật dễ.',
      textEn: 'In Tab 1 Editor, AI-inserted passages highlight in a distinct tint so you can review every single sentence clearly.',
    },
    {
      id: 'SUB_06',
      chapterId: 'CHAP_02_TAB1_DIFF_AND_SENSES',
      startSec: 28.0,
      endSec: 34.5,
      speaker: 'Bé Bi Hướng Dẫn',
      speakerEn: 'Bi Guide',
      text: 'Giống hệt Google Docs, bấm Chấp nhận để giữ lại đoạn văn ưng ý hoặc Từ chối để trả về câu văn gốc của bạn nha.',
      textEn: 'Just like Google Docs Suggesting mode, click Accept to keep the lines or Reject to restore your original prose.',
    },
    {
      id: 'SUB_07',
      chapterId: 'CHAP_02_TAB1_DIFF_AND_SENSES',
      startSec: 34.5,
      endSec: 40.5,
      speaker: 'Từ Điển Ngũ Quan',
      speakerEn: 'Sensory Tools',
      text: 'Nút Từ điển Ngũ quan gợi ý từ tả ánh nhìn, âm thanh, hơi ấm rất tự nhiên để trang viết giàu chất văn học và cảm xúc.',
      textEn: 'Open the Sensory Dictionary for vivid sight, sound, and touch cues that keep your prose warm and human.',
    },
    {
      id: 'SUB_08',
      chapterId: 'CHAP_02_TAB1_DIFF_AND_SENSES',
      startSec: 40.5,
      endSec: 46.0,
      speaker: 'Nhắc Ký Ức Âm Thầm',
      speakerEn: 'Lore Whisper',
      text: 'Thanh Lore Whisper khẽ thì thầm tính cách và bí mật nhân vật ngay lúc bạn vừa gõ tên họ, khỏi sợ quên chi tiết cũ.',
      textEn: 'Lore Whisper gently reminds you of a character’s traits and secrets the moment you type their name.',
    },
    {
      id: 'SUB_09',
      chapterId: 'CHAP_03_TAB2_RAG_IMPORT',
      startSec: 46.0,
      endSec: 52.5,
      speaker: 'Bé Bi Hướng Dẫn',
      speakerEn: 'Bi Guide',
      text: 'Sang Tab 2 Quản Lý Chương: bạn tạo chương mới, lọc Bản nháp / Đã duyệt và đổi tên chương ngay trên danh sách cực nhanh.',
      textEn: 'In Tab 2 Chapters & Sources, create chapters, filter Draft or Approved status, and rename headings inline.',
    },
    {
      id: 'SUB_10',
      chapterId: 'CHAP_03_TAB2_RAG_IMPORT',
      startSec: 52.5,
      endSec: 58.5,
      speaker: 'Bé Bi Hướng Dẫn',
      speakerEn: 'Bi Guide',
      text: 'Bạn có thể nạp hàng loạt tệp .DOCX, .PDF, .TXT vào kho; thanh công cụ thu gọn sẵn ở đỉnh trang giúp màn hình thật thoáng.',
      textEn: 'Import .DOCX, .PDF, or .TXT manuscripts in batches while collapsible toolbars keep the workspace clean and spacious.',
    },
    {
      id: 'SUB_11',
      chapterId: 'CHAP_03_TAB2_RAG_IMPORT',
      startSec: 58.5,
      endSec: 64.5,
      speaker: 'Tìm Ký Ức 0 Token',
      speakerEn: 'Zero-Token BM25',
      text: 'Ô Tra cứu chi tiết cũ dùng thuật toán BM25 tìm lại kỷ vật hay lời hứa năm xưa chỉ trong tích tắc mà tốn 0 đồng API!',
      textEn: 'Local BM25 search digs up past props or promises across hundreds of chapters instantly at zero API cost.',
    },
    {
      id: 'SUB_12',
      chapterId: 'CHAP_03_TAB2_RAG_IMPORT',
      startSec: 64.5,
      endSec: 70.0,
      speaker: 'Sao Lưu Ổ Cứng',
      speakerEn: 'Disk Sync',
      text: 'Thư mục ổ cứng đã chọn ở đầu cổng luôn tự đồng bộ mọi chương thành file thật trên máy, an tâm sáng tác dài hơi.',
      textEn: 'Your linked hard-drive folder continuously saves real .TXT and .JSON copies so no draft is ever lost.',
    },
    {
      id: 'SUB_13',
      chapterId: 'CHAP_04_TAB3_TWO_STEP_AI',
      startSec: 70.0,
      endSec: 77.0,
      speaker: 'Bé Bi Hướng Dẫn',
      speakerEn: 'Bi Guide',
      text: 'Ở Tab 3 Trợ Lý AI, bấm nút xanh để mở bảng 5 chế độ, chọn Model Gemini thực, Mức tư duy Thấp/Trung bình/Cao và Hạn mức Realtime.',
      textEn: 'In Tab 3 AI Studio, choose among 5 writing modes, pick real Gemini models, Low/Medium/High Thinking, and watch live 5h/weekly quotas.',
    },
    {
      id: 'SUB_14',
      chapterId: 'CHAP_04_TAB3_TWO_STEP_AI',
      startSec: 77.0,
      endSec: 84.0,
      speaker: 'Bé Bi Hướng Dẫn',
      speakerEn: 'Bi Guide',
      text: 'Gõ xong câu lệnh chỉ cần ấn Enter (có hộp xác nhận an toàn); hệ thống copy thẳng Story Bible vào Prompt Tổng Hợp cho khỏi nhớ nhầm!',
      textEn: 'Press Enter to launch the confirmation popup; Step 1 injects the full Story Bible directly into the Master Prompt.',
    },
    {
      id: 'SUB_15',
      chapterId: 'CHAP_04_TAB3_TWO_STEP_AI',
      startSec: 84.0,
      endSec: 91.5,
      speaker: 'Bước 2 & Hoàn Thành',
      speakerEn: 'Step 2 & Alert',
      text: 'Lúc AI đang chạy, hãy giữ nguyên màn hình nhé. Xong việc là kết quả hiện ngay kèm chuông báo và nút Xem Bản Mới Nhất Ngay!',
      textEn: 'Keep the screen open while generating. When done, a bright alert banner and output appear right away!',
    },
    {
      id: 'SUB_16',
      chapterId: 'CHAP_04_TAB3_TWO_STEP_AI',
      startSec: 91.5,
      endSec: 98.0,
      speaker: 'Hỗ Trợ Viên Bi Số 8',
      speakerEn: 'Mascot Bi #8',
      text: 'Quả cầu Bi Số 8 có 2 chế độ: Tách riêng hỏi cách dùng Studio (kèm nút dẫn thẳng & phát sáng) với trò chuyện tâm sự tự nhiên.',
      textEn: 'Mascot Bi #8 separates Studio guide mode—complete with glowing deep-link buttons—from friendly creative chat.',
    },
    {
      id: 'SUB_17',
      chapterId: 'CHAP_05_MODE5_TIMELINE_DIAGRAM',
      startSec: 98.0,
      endSec: 105.0,
      speaker: 'Chế Độ 5: Cốt Truyện',
      speakerEn: 'Mode 5 Plot Graph',
      text: 'Chế độ 5 vẽ Biểu đồ Cốt Truyện dựa ngay trên Story Bible tinh gọn thay vì quét nặng hàng trăm tệp thô rườm rà.',
      textEn: 'Mode 5 builds your Story Arc & Timeline SVG straight from the structured Story Bible for crisp speed and accuracy.',
    },
    {
      id: 'SUB_18',
      chapterId: 'CHAP_05_MODE5_TIMELINE_DIAGRAM',
      startSec: 105.0,
      endSec: 113.5,
      speaker: 'Chế Độ 5: Cốt Truyện',
      speakerEn: 'Mode 5 Plot Graph',
      text: 'Sơ đồ giúp soi lỗ hổng thời gian, nhân quả giữa các chương và kiểm chứng ai biết bí mật nào ở từng hồi.',
      textEn: 'Spot timeline contradictions, causal chains, and who-knows-what secrets across every chapter arc.',
    },
    {
      id: 'SUB_19',
      chapterId: 'CHAP_05_MODE5_TIMELINE_DIAGRAM',
      startSec: 113.5,
      endSec: 122.0,
      speaker: 'Xuất Ảnh Sơ Đồ',
      speakerEn: 'Export Diagram',
      text: 'Bạn có thể phóng to, xoay ngang hoặc tải sơ đồ cốt truyện thành ảnh PNG/SVG sắc nét để kẹp vào hồ sơ tác phẩm.',
      textEn: 'Zoom, flip layouts, or download high-resolution PNG and SVG diagrams straight into your story bible folder.',
    },
    {
      id: 'SUB_20',
      chapterId: 'CHAP_06_TAB4_SMART_APPROVAL',
      startSec: 122.0,
      endSec: 129.0,
      speaker: 'Story Bible Lũy Tiến',
      speakerEn: 'Cumulative Bible',
      text: 'Tab 4 cập nhật Story Bible nối tiếp từ Chương 1 đến chương mới duyệt cuối cùng, không bao giờ chỉ nhớ mỗi chương lẻ vừa xong.',
      textEn: 'Tab 4 updates your Story Bible cumulatively from Chapter 1 right up to your newest approved chapter.',
    },
    {
      id: 'SUB_21',
      chapterId: 'CHAP_06_TAB4_SMART_APPROVAL',
      startSec: 129.0,
      endSec: 136.5,
      speaker: 'Mẹo NotebookLM',
      speakerEn: 'NotebookLM Companion',
      text: 'Viết cả trăm chương sợ AI quên? Bấm mở NotebookLM ngay trong Tab 4, tải PDF gộp toàn bộ truyện và chép Prompt mẫu chi tiết!',
      textEn: 'Writing a 100+ chapter epic? Use the Tab 4 NotebookLM card to export a merged manuscript PDF and copy our master Bible prompt!',
    },
    {
      id: 'SUB_22',
      chapterId: 'CHAP_06_TAB4_SMART_APPROVAL',
      startSec: 136.5,
      endSec: 144.0,
      speaker: 'Khóa Logic Xuyên Suốt',
      speakerEn: 'Plot Lock',
      text: 'Dán lại kết quả vào khung Story Bible để khóa chặt tên tuổi, cảnh giới, phục bút cho hàng trăm hồi kế tiếp.',
      textEn: 'Paste the summary back into Story Bible to lock names, lore, and foreshadowing across future arcs.',
    },
    {
      id: 'SUB_23',
      chapterId: 'CHAP_07_TAB5_POMODORO_SYNC',
      startSec: 144.0,
      endSec: 151.5,
      speaker: 'Không Gian Nền Sáng',
      speakerEn: 'Live Ambient Art',
      text: 'Ở Tab 5, hiệu ứng Mưa trên kính và 6 Tranh nền thủy mặc xuyên qua lớp kính mờ dịu nhẹ, kéo thanh Độ rõ nền để chỉnh đậm nhạt.',
      textEn: 'In Tab 5, raindrop effects and 6 hand-crafted wallpapers shine softly behind frosted glass cards—tune opacity anytime.',
    },
    {
      id: 'SUB_24',
      chapterId: 'CHAP_07_TAB5_POMODORO_SYNC',
      startSec: 151.5,
      endSec: 159.0,
      speaker: 'Âm Thanh & Pomodoro',
      speakerEn: 'Audio & Pomodoro',
      text: 'Nhạc nền MP3 lặp đoạn A-B mượt mà cùng đồng hồ Pomodoro đồng bộ 2 chiều giúp bạn vào guồng viết thật tập trung.',
      textEn: 'Enjoy seamless A-B looped MP3 music and two-way synced Pomodoro timers across Tab 5 and the floating pill.',
    },
    {
      id: 'SUB_25',
      chapterId: 'CHAP_07_TAB5_POMODORO_SYNC',
      startSec: 159.0,
      endSec: 166.0,
      speaker: 'Bảo Vệ Thị Lực',
      speakerEn: 'Typography Care',
      text: 'Chọn nhanh bộ chữ Light Novel kinh điển và đèn vàng đêm khuya 3400K để viết hàng giờ liền không mỏi mắt nhé!',
      textEn: 'Switch Light Novel typography presets and warm 3400K eye-care lighting for comfortable late-night writing.',
    },
    {
      id: 'SUB_26',
      chapterId: 'CHAP_08_TAB6_TIME_MACHINE_PDF',
      startSec: 166.0,
      endSec: 174.0,
      speaker: 'Cẩm Nang & Time Machine',
      speakerEn: 'Directory & Versions',
      text: 'Tab 6 có Bách Khoa Toàn Bộ Tính Năng (bấm nút là dẫn thẳng & phát sáng chỗ cần tìm) cùng Kho Phiên Bản tự động lưu liên tục.',
      textEn: 'Tab 6 hosts the Full Feature Encyclopedia (click any item to jump & spotlight it!) plus continuous Time-Machine snapshots.',
    },
    {
      id: 'SUB_27',
      chapterId: 'CHAP_08_TAB6_TIME_MACHINE_PDF',
      startSec: 174.0,
      endSec: 182.0,
      speaker: 'Xuất Word .DOCX Chuẩn',
      speakerEn: 'True OOXML .DOCX',
      text: 'Xuất Word .DOCX nay đóng gói chuẩn ZIP OOXML mở mượt trên Microsoft Word & Google Docs, bìa gói 1 trang "Web tiểu thuyết của Bi".',
      textEn: 'Word .DOCX export now packages genuine OOXML files ready for Word and Google Docs with a crisp 1-page cover.',
    },
    {
      id: 'SUB_28',
      chapterId: 'CHAP_08_TAB6_TIME_MACHINE_PDF',
      startSec: 182.0,
      endSec: 190.0,
      speaker: 'Bé Bi Chúc Ngủ Ngon',
      speakerEn: 'Happy Writing!',
      text: 'PDF mới hỏi trước Tên tác phẩm, Số chương & Bút danh, canh giữa đầu trang và đánh số trang 1, 2, 3 gọn đẹp. Chúc Bi viết thật hay nha!',
      textEn: 'PDF export asks your Title, Chapter, and Author first, with centered book title headers and clean page numbers. Happy writing!',
    },
    {
      id: 'SUB_29',
      startSec: 190.0,
      endSec: 199.5,
      chapterId: 'CHAP_09_MOD32_STAGE_AND_ARGON_BRIDGE',
      text: 'Module 32 mới sửa dứt điểm lỗi nền đen khi chọn tranh nghệ thuật hay ảnh/video cá nhân, dùng kính mờ chuẩn sáng/tối và lưu IndexedDB vĩnh viễn.',
      textEn: 'Module 32 fixes pitch-black backgrounds when selecting procedural art or custom media, using html.dark frosted glass and persistent IndexedDB.',
    },
    {
      id: 'SUB_30',
      startSec: 199.5,
      endSec: 209.0,
      chapterId: 'CHAP_09_MOD32_STAGE_AND_ARGON_BRIDGE',
      text: 'Nếu bạn muốn viết sâu 20.000+ từ một lượt bằng Argon 4 hay Carbon 4 mà API chưa mở trực tiếp, hãy bấm đường dẫn ngay trên màn hình duyệt/chờ Prompt!',
      textEn: 'To write 20,000+ deep words in one pass with Argon 4 or Carbon 4 while the API fix is pending, click the inline links right inside the Prompt review or waiting overlay!',
    },
    {
      id: 'SUB_31',
      startSec: 209.0,
      endSec: 218.0,
      chapterId: 'CHAP_09_MOD32_STAGE_AND_ARGON_BRIDGE',
      speaker: 'Cầu Nối Pro & Ultra',
      speakerEn: 'Pro & Ultra Bridge',
      text: 'Một chạm là chép trọn Prompt Tổng Hợp và mở thẳng Gemini Web. Lưu ý nhỏ: nâng cấp gói Pro để dùng Argon 4 và Ultra cho Carbon 4 nha!',
      textEn: 'One click copies the full synthesized prompt and opens Gemini Web directly. Reminder: Gemini Pro is required for Argon 4, and Ultra for Carbon 4.',
    },
    {
      id: 'SUB_32',
      startSec: 218.0,
      endSec: 230.0,
      chapterId: 'CHAP_09_MOD32_STAGE_AND_ARGON_BRIDGE',
      speaker: 'Module 33 Đồng Bộ & Giọng Neural',
      speakerEn: 'Mod 33 Live DOM & Neural Voice',
      text: 'Module 33 nay chiếu giao diện web thật lên video kèm giọng Neural Việt/Anh tự nhiên, Chatbot mặc định Flash-Lite và Tab 6 thu gọn siêu sạch!',
      textEn: 'Module 33 mirrors the real live web UI inside this video with natural VI/EN neural voice, defaults Chatbot to Flash-Lite, and streamlines Tab 6.',
    },
  ]);

  /**
   * Nhật ký nâng cấp hệ thống & danh sách chi tiết các lỗi đã được vá triệt để trong v38.0.
   */
  const SYSTEM_CHANGELOG_V38 = Object.freeze([
    {
      version: 'v38.5 — Tab 2 Header & Bộ Lọc Chuẩn Xác, Dẫn Hướng Chế Độ 1 -> 2, Khử Ký Tự Markdown AI, Tab 5 Select Đậm Đen & Bộ 3 Module 34-35-36',
      date: '13/11/2026',
      dateLabel: 'Mới nhất',
      badgeTone: 'emerald',
      highlights: [
        'Tab 2 — Chống chồng chữ thanh trên & Đưa nút "✅ Duyệt & Chốt Bản Thảo" sang bên TRÁI; tối ưu flex-wrap để badge trạng thái không bao giờ chui xuống sau bảng thống kê từ.',
        'Tab 2 — Sửa bộ lọc chương: bấm "Nháp" chỉ hiện chương Nháp, bấm "Đã duyệt" chỉ hiện chương Đã duyệt, bấm "Tất cả" mới hiện toàn bộ danh sách.',
        'Tab 3 — 5 Chế độ AI (Mod 14/16/17): thêm chữ dẫn xám riêng cho từng chế độ (Chế độ 2 gợi mở "Bạn có thể liệt kê dàn ý thô ở đây..."), nhắc thân thiện nhảy thẳng sang Chế độ 2 nếu chạy Chế độ 1 khi chưa có gợi ý diễn biến, và tự động dệt kết quả Chế độ 2 vào Prompt tổng hợp của Chế độ 1.',
        'Lọc sạch Markdown/ký tự thô (**, *, ###, ---, ```) khỏi mọi Prompt lẫn đầu ra AI ở 5 Chế độ, Diff Review (Mod 11), Chatbot Viên Bi Số 8 (Mod 27) và Niên biểu Chế độ 5 (Mod 18).',
        'Tab 5 — Sửa toàn bộ hộp chọn <select> sang nền đen chữ trắng tương phản chuẩn mực; bổ sung "Web do Mai Hải Đăng phát triển" ở Cổng kết nối và "Tác giả web: Mai Hải Đăng" ở bảng Kiểm tra sức khỏe Autosave 3 tầng.',
        'Ra mắt Mod 34 (Tab 6 Báo lỗi sạch mật khẩu cho người dùng), Mod 35 (Bảng Author Credits cuộn dọc tri ân tác giả duy nhất Mai Hải Đăng + Gmail/Facebook) và Mod 36 (Khiên Chống Reload ngăn rớt trang khi gõ, Backspace, Ctrl+Z hay sao lưu).'
      ],
    },
    {
      version: 'v38.4 — Tab 5 Nền Đơn Sắc & Thu Gọn, Tab 4 Box 1 Khuôn Mẫu & Bóc Tách Gemini Flash, Tab 1 Tạo Chương Mới & Lá Chắn Chống Reload',
      date: '13/11/2026',
      dateLabel: 'Bản phát hành hoàn thiện',
      badgeTone: 'emerald',
      highlights: [
        'Tab 5 — Nền Đơn Sắc & Thu Gọn: Bổ sung 2 lựa chọn Nền Đen Tối Giản (OLED pitch-black #000000) và Nền Trắng Tối Giản (#ffffff giấy in chữ tương phản cao) vào Kho Tranh Nền Nghệ Thuật 0MB; thêm thanh điều khiển nhanh "⏫ Thu gọn hết Tab 5" và "⏬ Mở rộng tất cả Tab 5" giúp tối ưu front-end gọn gàng.',
        'Tab 4 — Khung Story Bible Mẫu (Box 1) hiển thị song song Box 2: Sửa triệt để tình trạng Box 1 bị thu gọn để trống khoảng trắng lớn; mặc định mở rộng song song Khung Cấu Trúc Mẫu và Nội dung Story Bible chính thức.',
        'Tab 4 — Hướng dẫn dán ngược từ NotebookLM & Gemini Flash tự động bóc tách: Bổ sung chỉ dẫn chi tiết dán Story Bible từ NotebookLM vào ô Box 2; tích hợp nút "⚡ Đồng Bộ Gemini Flash" và sự kiện tự động kích hoạt mô hình Gemini Flash liên kết API Key để bóc tách cập nhật vào Hồ sơ nhân vật đa chiều, Ma trận "Ai biết gì" và Sổ cái phục bút.',
        'Tab 1 — Nút Tạo Chương Mới: Bổ sung nút "➕ Tạo Chương Mới" ngay cạnh bộ chọn chương ở Bàn viết Tab 1, bấm 1 cú nhấp là khởi tạo chương mới và bắt đầu gõ ngay mà không phải chuyển sang Tab 2.',
        'Lá Chắn Chống Tải Lại Trang (Anti-Reload Guard): Cấu hình bỏ qua tệp bản thảo trong VS Code Live Server (.vscode/settings.json) và cô lập ghi đĩa ngầm, đảm bảo quá trình gõ chữ và tự động sao lưu 3 tầng (RAM + IDB + Thư mục ổ cứng) diễn ra hoàn toàn êm đềm, không bao giờ tự động reload trang hay nhảy về màn hình Cổng kết nối.'
      ],
    },
    {
      version: 'v38.3 — Module 33: Bảo Chứng API/Thư Mục/Pro-Ultra, Giọng Neural VI/EN & Video Giao Diện Web Thật',
      date: '12/11/2026',
      dateLabel: 'Cập nhật trước',
      badgeTone: 'cyan',
      highlights: [
        'Sửa dứt điểm lỗi Tab 6 (Mod 31) báo sai "Chưa nối Key / Chưa gắn thư mục": đồng bộ thực tế 100% từ Router, Flash-Lite Verification Seal, Thư mục ổ cứng thật và bộ chọn Gói Tài Khoản (Standard / Pro -> Argon 4 / Ultra -> Carbon 4).',
        'Tab 4 Mẹo Chống Quên NotebookLM nâng cấp sang đường link bôi đậm gạch chân bấm trực tiếp ngay trong câu: tải PDF gộp toàn truyện, mở sổ tay NotebookLM và copy câu lệnh chuẩn chỉ 1 chạm.',
        'Chatbot Trợ Lý Viên Bi Số 8 (Mod 27) mặc định luôn chọn mô hình Gemini 3.5 Flash-Lite để phản hồi tức thì và tiết kiệm tối đa hạn mức dài hạn mà không làm ảnh hưởng mô hình viết văn sâu ở Tab 3.',
        'Video Hướng Dẫn chiếu chính xác giao diện thật của chính trang web đang chạy (#mod33-real-dom-stage không trùng DOM ID) kết hợp Động cơ Giọng Nói Neural Song Ngữ Việt/Anh (tách cụm nhịp thở, chuẩn hóa từ điển kỹ thuật, chọn giọng HoaiMy/NamMinh/Aria Neural).',
        'Tối ưu Front-end Tab 6: hiển thị Cụm Mục Nổi Bật Nhất ở trên cùng, rút gọn mặc định toàn bộ các khối phụ bên dưới kèm nút "Thu gọn hết các mục" / "Mở rộng tất cả" và ma trận tự kiểm tra 6 tầng.',
      ],
    },
    {
      version: 'v38.2 — Module 32: Sân Khấu Nền Đa Tầng Kính Mờ & Cầu Nối Gemini Web Argon 4 / Carbon 4',
      date: '12/11/2026',
      highlights: [
        'Vá triệt để lỗi đen đặc nền web khi chọn Kho Tranh Nghệ Thuật hoặc Tải Ảnh/Video nền: sửa selector CSS từ body.dark sang html.dark / html:not(.dark), bổ sung canvas vẽ tranh chuyên biệt #mod32-procedural-art-canvas (z-[2]) và lưu trữ nhị phân IndexedDB bền vững qua F5.',
        'Bảng điều khiển Module 32 trong Tab 5 (#mod32-backdrop-stage-panel): chọn nhanh Preset độ trong suốt kính (Rõ Nét 88%, Cân Bằng 72%, Phim Đêm 58%), nút "Soi Rõ Nền 100%" giữ chuột xem toàn bộ nền, bộ lọc màu rạp phim (Vignette, Glow) và tự động kiểm định live getComputedStyle.',
        'Cầu nối Gemini Web Argon 4 / Carbon 4 (20.000+ từ): tích hợp trực tiếp ở cả Màn hình Duyệt Prompt Tổng (#modal-confirm-synthesized-prompt) và Màn hình Đang Chạy AI (#global-ai-blocking-loader) với 2 đường link bôi đậm gạch chân ("ấn vào đây để copy toàn bộ prompt tổng hợp" + link thẳng tới gemini.google.com/app) và ghi chú rõ ràng cần nâng cấp Pro cho Argon 4, Ultra cho Carbon 4.',
        'Đồng bộ Video Hướng Dẫn Cảnh 9 (28 giây, phụ đề song ngữ Việt/Anh & giọng đọc AI) + Danh bạ tính năng Tab 3 & Tab 5 trong Module 31.',
      ],
    },
    {
      version: 'v38.0 — Đại Tu Kiến Trúc 30 Module Độc Lập & Giao Diện Người Thật',
      dateLabel: 'Cập nhật mới nhất',
      badgeTone: 'emerald',
      highlights: [
        'Hợp nhất thành 1 file HTML sạch và 30 tệp JavaScript chuyên biệt, xóa bỏ hoàn toàn tình trạng gắn trùng sự kiện hoặc xung đột trạng thái.',
        'Dọn gọn Tab 3: bỏ 4 nút chế độ bên phải, bỏ thanh phụ dư thừa và khung dưới; tích hợp trọn vẹn Chèn nối tiếp / Thay thế / Sao chép / Cấu hình Prompt lên thanh đầu.',
        'Bỏ link Google Studio thừa và bảng thông số model rườm rà trong bảng chọn mô hình (API Key đã liên kết trực tiếp từ Két Sắt Tab 6).',
        'Khung soạn lệnh AI mặc định mở ở kích thước siêu rộng, tự động sửa dứt điểm lỗi báo thiếu câu lệnh khi người dùng đã gõ lệnh.',
        'Quy trình chạy AI chia 2 bước tường minh: (1) Ghép Story Bible + Mốc chuyển cảnh/POV + RAG BM25 + Câu lệnh -> (2) Hộp thoại xác nhận chọn lại mô hình kèm cảnh báo tránh dùng Flash-Lite cho chương chính.',
        'Bổ sung Chế độ 5 (Mode 5): AI phân tích diễn biến nhiều chương tự chọn và vẽ Biểu đồ Cốt Truyện SVG + Niên biểu chống mâu thuẫn.',
        'Duyệt & Chốt Bản Thảo: gỡ bỏ cửa sổ đầu ra dư thừa, giữ màn hình chờ gọn gàng và tự động trích xuất cập nhật Story Bible + mở khóa trạng thái Đã duyệt.',
        'Google Docs AI Diff Review tại Tab 1: đoạn chữ AI thêm vào hiển thị màu riêng biệt để tác giả bấm Chấp nhận hoặc Không chấp nhận từng cụm.',
        'Pomodoro Đồng Bộ 2 Chiều: sử dụng chung 1 kho trạng thái cho cả Tab 5 và thanh nổi Pomodoro.',
        'Kho Phiên Bản Time-Machine tại Tab 6: lưu snapshot liên tục, xem trước Preview phiên bản cũ toàn màn hình, so sánh Diff và khôi phục an toàn.',
        'Xuất PDF nâng cao: bổ sung lựa chọn Font chữ, Cỡ chữ (pt), giãn dòng và khung Preview trực tiếp trước khi in PDF.',
        'Xóa ô Chương 2 dư thừa tại Tab 1 và trau chuốt lại toàn bộ từ ngữ nút bấm, thông báo thân thiện, tự nhiên.',
      ],
    },
    {
      version: 'v37.5 — Gói Tính Năng Bổ Trợ WebNovel & Tự Động Khôi Phục Khẩn Cấp',
      dateLabel: 'Bản nâng cấp nền tảng',
      badgeTone: 'indigo',
      highlights: [
        'Bổ sung Từ điển Ngũ quan (Thị giác, Thính giác, Khứu giác, Xúc giác, Nội tâm) kèm công cụ viết Lời Tác Giả đầu/cuối chương.',
        'Ra mắt Lore Whisper (nhắc ngầm hồ sơ nhân vật ngay khi đang gõ tên) và thanh theo dõi Mục tiêu chữ hằng ngày.',
        'Tích hợp Quét từ sáo rỗng AI (Anti-Cliché), Đường cong cảm xúc SVG, So sánh nhịp độ mở/cao trào/kết chương.',
        'Khóa lưu 3 tầng (LocalStorage tức thời + IndexedDB + Đồng bộ thư mục ổ cứng thật File System Access API).',
      ],
    },
    {
      version: 'v37.0 — Tối Ưu Hóa Điện Thoại (Mobile PWA) & Âm Thanh Ngoại Tuyến',
      dateLabel: 'Chuẩn hóa đa thiết bị',
      badgeTone: 'amber',
      highlights: [
        'Thiết kế thanh 6 Tab cố định dưới đáy cho điện thoại màn hình dọc kết hợp thanh chèn nhanh ngoặc thoại 「 」, — , ***.',
        'Trình phát nhạc MP3 tích hợp bộ lặp đoạn A-B chuẩn xác từng mili-giây và 7 hiệu ứng âm thanh WebAudio ngoại tuyến.',
        'Cảnh nền hạt sáng 60FPS tối ưu tiết kiệm pin trên điện thoại và chế độ Đèn lồng / Mưa / Đom đóm êm mắt.',
      ],
    },
  ]);

  /**
   * Bảng hướng dẫn chọn mô hình Gemini mới nhất & chiến lược giữ chất lượng văn chương.
   */
  const UP_TO_DATE_MODEL_STRATEGY_GUIDE = Object.freeze([
    {
      tier: 'CẤP ĐỘ CAO NHẤT — ĐỀ XUẤT VIẾT CHƯƠNG CHÍNH & PHỤC BÚT DÀI HƠI',
      models: ['gemini-3.1-pro-preview', 'gemini-pro-latest', 'gemini-2.5-pro'],
      badge: 'PRO TIER (Tư duy Cao)',
      toneClass: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
      advice:
        'Giàu chiều sâu tâm lý, giữ giọng văn tự nhiên như tác giả người thật, kiểm soát mạch phục bút dài 30–100 chương và rất hợp khi bật Mức độ tư duy Trung bình/Cao.'
    },
    {
      tier: 'CẤP ĐỘ CÂN BẰNG TỐC ĐỘ — ĐỀ XUẤT VIẾT MỞ RỘNG & ĐỐI THOẠI NHANH',
      models: ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-2.5-flash', 'gemini-3-flash-preview'],
      badge: 'FLASH TIER (Khuyên dùng)',
      toneClass: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
      advice:
        'Phản hồi nhanh, hạn mức rộng (Free/Tier đều mượt), tự động trượt sang alias live của Key và giữ câu văn ít sáo ngữ.'
    },
    {
      tier: 'CẤP ĐỘ NHẸ — CHỈ DÙNG GỢI Ý NHANH HOẶC XÁC THỰC KẾT NỐI',
      models: ['gemini-flash-lite-latest', 'gemini-2.5-flash-lite', 'gemini-3.1-flash-lite-preview'],
      badge: 'CẢNH BÁO FLASH-LITE',
      toneClass: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
      advice:
        'Rất tiết kiệm hạn mức ngắn hạn (RPM) & dài hạn (RPD), nhưng văn phong dễ tóm lược ngắn khi viết chương dài. Nên dùng Flash trở lên để viết tiểu thuyết.'
    }
  ]);

  /**
   * Danh sách phím tắt giúp thao tác nhanh như trình soạn thảo chuyên nghiệp.
   */
  const STUDIO_SHORTCUTS_CHEATSHEET = Object.freeze([
    { keys: 'Alt + 1 .. 6', action: 'Chuyển nhanh giữa 6 màn hình (Bàn Viết, Chương, AI, Bible, Nhạc, Cài đặt)' },
    { keys: 'Ctrl + S', action: 'Lưu cưỡng bức 3 tầng & tạo điểm mốc an toàn ngay lập tức' },
    { keys: 'Ctrl + F', action: 'Mở/Đóng thanh Tìm kiếm & Thay thế ngay trong Tab 1' },
    { keys: 'F11 (hoặc nút 🧘)', action: 'Bật/Tắt chế độ Tập Trung Toàn Màn Hình (Zen Mode)' },
    { keys: 'Ctrl + Shift + L', action: 'Quét nhanh sáo ngữ AI & phân tích nhịp độ đoạn văn' },
    { keys: 'Esc', action: 'Đóng hộp thoại hoặc thanh công cụ nổi đang mở trên cùng' },
  ]);

  /**
   * Trình phát âm thanh WebAudio nhẹ khi chuyển phân đoạn hướng dẫn (tắt mặc định để không làm phiền).
   */
  class TutorialTransitionChimeSynth {
    constructor() {
      this.audioCtx = null;
      this.enabled = false;
    }

    setEnabled(flag) {
      this.enabled = Boolean(flag);
    }

    playSoftTransitionTone(pitchHz = 528) {
      if (!this.enabled) return;
      try {
        const AudioCtx = globalScope.AudioContext || globalScope.webkitAudioContext;
        if (!AudioCtx) return;
        if (!this.audioCtx) {
          this.audioCtx = new AudioCtx();
        }
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume().catch(() => {});
        }
        const now = this.audioCtx.currentTime;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(pitchHz, now);
        osc.frequency.exponentialRampToValueAtTime(pitchHz * 1.18, now + 0.14);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.045, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.28);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      } catch (_err) {
        // Bỏ qua nếu trình duyệt chặn AudioContext trước khi có tương tác
      }
    }
  }

  /**
   * Trình đọc thuyết minh AI tự nhiên & dễ thương (Tiếng Việt / Tiếng Anh) đồng bộ theo phụ đề.
   */
  class TutorialAiVoiceNarrator {
    constructor() {
      this.enabled = false;
      this.language = 'vi-VN'; // 'vi-VN' | 'en-US'
      this.lastSpokenCueKey = '';
      this.playbackRate = 1.0;
    }

    isSupported() {
      return typeof globalScope !== 'undefined' && 'speechSynthesis' in globalScope && typeof globalScope.SpeechSynthesisUtterance === 'function';
    }

    setEnabled(flag) {
      this.enabled = Boolean(flag);
      if (!this.enabled) {
        this.stop();
      } else {
        this.lastSpokenCueKey = '';
      }
      return this.enabled;
    }

    setLanguage(lang) {
      this.language = lang === 'en-US' ? 'en-US' : 'vi-VN';
      this.lastSpokenCueKey = '';
      this.stop();
      return this.language;
    }

    setPlaybackRate(rate) {
      this.playbackRate = Math.max(0.7, Math.min(1.6, Number(rate || 1)));
    }

    pickBestCuteVoice(langCode) {
      if (!this.isSupported()) return null;
      const voices = globalScope.speechSynthesis.getVoices?.() || [];
      if (!voices.length) return null;
      const isVi = langCode === 'vi-VN';
      const preferredPatterns = isVi
        ? [/hoaimy/i, /linh/i, /an\b/i, /google.*tiếng việt/i, /vi[-_]vn/i]
        : [/aria.*natural/i, /jenny.*natural/i, /samantha/i, /google us english/i, /zira/i, /en[-_]us/i, /en[-_]gb/i];

      for (const rx of preferredPatterns) {
        const hit = voices.find((v) => rx.test(`${v.name} ${v.lang}`));
        if (hit) return hit;
      }
      return (
        voices.find((v) =>
          isVi ? /^vi/i.test(v.lang) : /^en/i.test(v.lang)
        ) || null
      );
    }

    speakCueIfNeeded(cue, isPlaying) {
      if (!this.enabled || !isPlaying || !cue || !this.isSupported()) return;
      const cueKey = `${cue.id}_${this.language}`;
      if (this.lastSpokenCueKey === cueKey) return;
      this.lastSpokenCueKey = cueKey;

      const textToRead =
        this.language === 'en-US' ? cue.textEn || cue.text : cue.text || cue.textEn;
      if (!textToRead) return;

      const neuralVoice = globalScope.NoirStudio?.neuralVoice;
      if (neuralVoice && typeof neuralVoice.speakText === 'function') {
        const spoken = neuralVoice.speakText(textToRead, this.language, {
          rate: Math.min(1.35, Math.max(0.86, this.playbackRate * 0.98)),
          pitch: 1.0,
        });
        if (spoken) return;
      }

      try {
        globalScope.speechSynthesis.cancel();
        const utter = new globalScope.SpeechSynthesisUtterance(textToRead);
        utter.lang = this.language;
        const bestVoice = this.pickBestCuteVoice(this.language);
        if (bestVoice) utter.voice = bestVoice;
        utter.pitch = 1.0;
        utter.rate = Math.min(1.35, Math.max(0.86, this.playbackRate * 0.98));
        utter.volume = 0.94;
        globalScope.speechSynthesis.speak(utter);
      } catch (_err) {
        // Bỏ qua an toàn nếu trình duyệt chưa cấp quyền SpeechSynthesis
      }
    }

    stop() {
      this.lastSpokenCueKey = '';
      globalScope.NoirStudio?.neuralVoice?.stopAll?.();
      if (!this.isSupported()) return;
      try {
        globalScope.speechSynthesis.cancel();
      } catch (_err) {}
    }
  }

  /**
   * Công cụ vẽ trình diễn Video Hoạt Họa 60FPS bằng HTML5 Canvas cho 8 phân đoạn hướng dẫn.
   * Hỗ trợ phát/tạm dừng, tua thanh trượt, marker từng chức năng, giọng đọc AI VI/EN & phụ đề song ngữ.
   */
  class AnimatedCanvasTutorialPlayer {
    constructor(options = {}) {
      this.chapters = Array.isArray(options.chapters) ? options.chapters : VIDEO_TUTORIAL_CHAPTERS_DATA;
      this.subtitles = Array.isArray(options.subtitles) ? options.subtitles : SYNCHRONIZED_SUBTITLE_TRACK_V38;
      this.totalDurationSec = this.chapters.reduce((acc, ch) => Math.max(acc, ch.endSec), 190);
      this.currentTimeSec = 0;
      this.playbackRate = 1.0;
      this.isPlaying = false;
      this.subtitlesVisible = true;
      this.subtitleLangMode = 'BOTH'; // 'BOTH' | 'VI' | 'EN'
      this.subtitleFontScale = 1.0;
      this.lastFrameTimestampMs = 0;
      this.rafId = null;
      this.activeChapterId = this.chapters[0]?.id || 'CHAP_01_SIX_SCREENS';
      this.lastCueId = '';
      this.chimeSynth = new TutorialTransitionChimeSynth();
      this.voiceNarrator = new TutorialAiVoiceNarrator();
      this.canvasEl = null;
      this.ctx = null;
      this.onTickCallbacks = new Set();
    }

    attachCanvas(canvasElement) {
      this.canvasEl = canvasElement || null;
      this.ctx = this.canvasEl ? this.canvasEl.getContext('2d') : null;
      this.resizeCanvasToContainer();
      this.renderCurrentFrame();
    }

    detachCanvas() {
      this.pause();
      this.canvasEl = null;
      this.ctx = null;
    }

    subscribeTick(callback) {
      if (typeof callback === 'function') {
        this.onTickCallbacks.add(callback);
      }
      return () => this.onTickCallbacks.delete(callback);
    }

    notifyTickListeners() {
      const state = this.getPlaybackSnapshot();
      this.onTickCallbacks.forEach((cb) => {
        try {
          cb(state);
        } catch (_err) {
          // Không để lỗi callback UI làm đứng vòng lặp dựng hình
        }
      });
    }

    resizeCanvasToContainer() {
      if (!this.canvasEl || typeof window === 'undefined') return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const rect = this.canvasEl.getBoundingClientRect();
      const targetCssWidth = Math.max(300, Math.round(rect.width || 720));
      const targetCssHeight = Math.round(targetCssWidth * (9 / 16));
      if (
        this.canvasEl.width !== Math.round(targetCssWidth * dpr) ||
        this.canvasEl.height !== Math.round(targetCssHeight * dpr)
      ) {
        this.canvasEl.width = Math.round(targetCssWidth * dpr);
        this.canvasEl.height = Math.round(targetCssHeight * dpr);
      }
      if (this.ctx) {
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    }

    getCurrentChapter() {
      const t = this.currentTimeSec;
      for (const ch of this.chapters) {
        if (t >= ch.startSec && t < ch.endSec) return ch;
      }
      return this.chapters[this.chapters.length - 1] || this.chapters[0];
    }

    getCurrentSubtitleCue() {
      const t = this.currentTimeSec;
      for (const cue of this.subtitles) {
        if (t >= cue.startSec && t < cue.endSec) return cue;
      }
      return this.subtitles[this.subtitles.length - 1] || null;
    }

    getPlaybackSnapshot() {
      const chapter = this.getCurrentChapter();
      const cue = this.getCurrentSubtitleCue();
      return {
        currentTimeSec: this.currentTimeSec,
        totalDurationSec: this.totalDurationSec,
        progressPct: Math.min(100, Math.max(0, (this.currentTimeSec / this.totalDurationSec) * 100)),
        isPlaying: this.isPlaying,
        playbackRate: this.playbackRate,
        subtitlesVisible: this.subtitlesVisible,
        subtitleFontScale: this.subtitleFontScale,
        chapter,
        cue,
      };
    }

    formatSecToMmSs(sec) {
      const safe = Math.max(0, Math.floor(Number(sec || 0)));
      const mm = Math.floor(safe / 60);
      const ss = safe % 60;
      return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
    }

    play() {
      if (this.isPlaying) return;
      if (this.currentTimeSec >= this.totalDurationSec - 0.15) {
        this.currentTimeSec = 0;
      }
      this.isPlaying = true;
      this.lastFrameTimestampMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
      this.voiceNarrator.speakCueIfNeeded(this.getCurrentSubtitleCue(), true);
      this.scheduleNextAnimationFrame();
      this.notifyTickListeners();
    }

    pause() {
      this.isPlaying = false;
      this.voiceNarrator.stop();
      if (this.rafId !== null && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      this.renderCurrentFrame();
      this.notifyTickListeners();
    }

    togglePlayPause() {
      if (this.isPlaying) {
        this.pause();
      } else {
        this.play();
      }
    }

    seekToSeconds(seconds, autoPlay = false) {
      const clamped = Math.max(0, Math.min(this.totalDurationSec - 0.05, Number(seconds || 0)));
      this.currentTimeSec = clamped;
      this.voiceNarrator.lastSpokenCueKey = '';
      const chap = this.getCurrentChapter();
      if (chap && chap.id !== this.activeChapterId) {
        this.activeChapterId = chap.id;
        this.chimeSynth.playSoftTransitionTone(480 + chap.index * 36);
      }
      this.renderCurrentFrame();
      this.notifyTickListeners();
      if (autoPlay && !this.isPlaying) {
        this.play();
      } else if (this.isPlaying) {
        this.voiceNarrator.speakCueIfNeeded(this.getCurrentSubtitleCue(), true);
      }
    }

    jumpToChapterById(chapterId, autoPlay = true) {
      const target = this.chapters.find((c) => c.id === chapterId);
      if (!target) return false;
      this.seekToSeconds(target.startSec + 0.05, autoPlay);
      return true;
    }

    stepChapter(delta) {
      const cur = this.getCurrentChapter();
      const curIdx = this.chapters.findIndex((c) => c.id === cur?.id);
      const nextIdx = Math.max(0, Math.min(this.chapters.length - 1, curIdx + delta));
      const target = this.chapters[nextIdx];
      if (target) {
        this.seekToSeconds(target.startSec + 0.05, this.isPlaying);
      }
    }

    setPlaybackRate(rate) {
      const num = Number(rate || 1);
      this.playbackRate = Math.max(0.5, Math.min(2.0, num));
      this.voiceNarrator.setPlaybackRate(this.playbackRate);
      this.notifyTickListeners();
    }

    setSubtitleLangMode(mode) {
      this.subtitleLangMode = ['BOTH', 'VI', 'EN'].includes(mode) ? mode : 'BOTH';
      this.renderCurrentFrame();
      this.notifyTickListeners();
      return this.subtitleLangMode;
    }

    toggleSubtitlesVisible() {
      this.subtitlesVisible = !this.subtitlesVisible;
      this.renderCurrentFrame();
      this.notifyTickListeners();
      return this.subtitlesVisible;
    }

    scheduleNextAnimationFrame() {
      if (!this.isPlaying || typeof requestAnimationFrame !== 'function') return;
      this.rafId = requestAnimationFrame((nowMs) => {
        if (!this.isPlaying) return;
        const deltaSec = Math.min(0.1, Math.max(0.001, (nowMs - this.lastFrameTimestampMs) / 1000));
        this.lastFrameTimestampMs = nowMs;
        this.currentTimeSec += deltaSec * this.playbackRate;

        const curChap = this.getCurrentChapter();
        if (curChap && curChap.id !== this.activeChapterId) {
          this.activeChapterId = curChap.id;
          this.chimeSynth.playSoftTransitionTone(460 + curChap.index * 34);
        }

        const curCue = this.getCurrentSubtitleCue();
        if (curCue && curCue.id !== this.lastCueId) {
          this.lastCueId = curCue.id;
          this.voiceNarrator.speakCueIfNeeded(curCue, true);
          this.notifyTickListeners();
        }

        if (this.currentTimeSec >= this.totalDurationSec) {
          this.currentTimeSec = this.totalDurationSec;
          this.pause();
          return;
        }

        this.renderCurrentFrame();
        this.notifyTickListeners();
        this.scheduleNextAnimationFrame();
      });
    }

    drawRoundedRect(ctx, x, y, w, h, radius) {
      const r = Math.min(radius, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    drawAnimatedPointer(ctx, x, y, pulseRatio, accentHex) {
      ctx.save();
      const ringRadius = 8 + pulseRatio * 14;
      ctx.strokeStyle = accentHex;
      ctx.globalAlpha = Math.max(0.1, 0.75 - pulseRatio * 0.65);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.globalAlpha = 1;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 12, y + 10);
      ctx.lineTo(x + 6, y + 11);
      ctx.lineTo(x + 4, y + 17);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    renderCurrentFrame() {
      if (!this.ctx || !this.canvasEl) return;
      const dpr = Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
      const w = this.canvasEl.width / dpr;
      const h = this.canvasEl.height / dpr;
      const ctx = this.ctx;
      const chap = this.getCurrentChapter() || this.chapters[0];
      const cue = this.getCurrentSubtitleCue();
      const sceneDuration = Math.max(1, chap.endSec - chap.startSec);
      const localSec = Math.max(0, this.currentTimeSec - chap.startSec);
      const localProgress = Math.min(1, localSec / sceneDuration);

      ctx.clearRect(0, 0, w, h);

      const domMirror = globalScope.NoirStudio?.liveDomVideoMirror;
      if (domMirror && domMirror.enabled) {
        domMirror.syncMirrorForChapter(chap.id, false);
        if (domMirror.isMirrorActiveAndMounted()) {
          const cue = this.getCurrentSubtitleCue();
          domMirror.drawTransparentLiveDomOverlay(this, ctx, w, h, chap, cue, localProgress);
          return;
        }
      }

      // Nền Studio tối mịn với quầng sáng động theo màu từng phân đoạn
      const bgGrad = ctx.createLinearGradient(0, 0, w, h);
      bgGrad.addColorStop(0, '#090d14');
      bgGrad.addColorStop(1, '#111827');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      const radial = ctx.createRadialGradient(w * 0.78, h * 0.22, 12, w * 0.78, h * 0.22, w * 0.65);
      radial.addColorStop(0, `${chap.accentColor}2e`);
      radial.addColorStop(1, 'transparent');
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, w, h);

      // Lưới tọa độ siêu mờ tạo chiều sâu kỹ thuật
      ctx.save();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.06)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < w; gx += 36) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, h);
        ctx.stroke();
      }
      for (let gy = 0; gy < h; gy += 36) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }
      ctx.restore();

      // Thanh tiêu đề giao diện THẬT của Web viết tiểu thuyết của Bi (6 Tab + Trạng thái lưu)
      this.drawRoundedRect(ctx, 14, 10, w - 28, 38, 10);
      ctx.fillStyle = 'rgba(10, 12, 16, 0.94)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.28)';
      ctx.stroke();

      // Logo Web tiểu thuyết của Bi
      this.drawRoundedRect(ctx, 20, 16, 128, 26, 7);
      ctx.fillStyle = '#052e16';
      ctx.fill();
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 9.5px Inter, system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('● ✍️ Web tiểu thuyết', 26, 29);

      // 6 Nút Tab mô phỏng đúng giao diện thật
      const activeTabMap = {
        CHAP_01_SIX_SCREENS: 0,
        CHAP_02_TAB1_DIFF_AND_SENSES: 0,
        CHAP_03_TAB2_RAG_IMPORT: 1,
        CHAP_04_TAB3_TWO_STEP_AI: 2,
        CHAP_05_MODE5_TIMELINE_DIAGRAM: 2,
        CHAP_06_TAB4_SMART_APPROVAL: 3,
        CHAP_07_TAB5_POMODORO_SYNC: 4,
        CHAP_08_TAB6_TIME_MACHINE_PDF: 5,
        CHAP_09_MOD32_STAGE_AND_ARGON_BRIDGE: 4,
      };
      const hotTab = activeTabMap[chap.id] ?? 0;
      const realTabs = ['1. Viết', '2. Chương', '3. AI 5 Chế Độ', '4. Bible', '5. Nhạc & Nền', '6. Cài Đặt'];
      const tabsStartX = 156;
      const tabsAvailW = Math.max(180, w - tabsStartX - 96);
      const pillW = Math.floor(tabsAvailW / 6) - 4;
      realTabs.forEach((lbl, idx) => {
        const px = tabsStartX + idx * (pillW + 4);
        const isOn = idx === hotTab;
        this.drawRoundedRect(ctx, px, 17, pillW, 24, 6);
        ctx.fillStyle = isOn ? '#059669' : 'rgba(24, 24, 27, 0.95)';
        ctx.fill();
        ctx.strokeStyle = isOn ? '#34d399' : 'rgba(63, 63, 70, 0.7)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = isOn ? '#ffffff' : '#a1a1aa';
        ctx.font = `bold ${Math.max(8, Math.min(9.5, pillW * 0.12))}px Inter, system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(lbl, px + pillW / 2, 29);
      });

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 10.5px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(
        `${this.formatSecToMmSs(this.currentTimeSec)} / ${this.formatSecToMmSs(this.totalDurationSec)}`,
        w - 22,
        29
      );

      // Khu vực dựng hoạt cảnh mô phỏng sát giao diện website
      const stageX = 18;
      const stageY = 56;
      const stageW = w - 36;
      const subBoxH = this.subtitlesVisible ? (this.subtitleLangMode === 'BOTH' ? 76 : 56) : 0;
      const stageH = this.subtitlesVisible ? h - subBoxH - 76 : h - 68;
      this.drawSceneStage(ctx, chap.sceneType, stageX, stageY, stageW, stageH, localProgress, chap.accentColor);

      // Thanh nổi thu gọn mô phỏng ở góc dưới sân khấu (🍅 Pomodoro | 🎵 Nhạc | 🤖 AI & 💬 Chat Bi)
      if (!this.subtitlesVisible || stageH > 130) {
        const dockY = stageY + stageH - 22;
        this.drawRoundedRect(ctx, stageX + 8, dockY, 152, 18, 9);
        ctx.fillStyle = 'rgba(9, 13, 20, 0.92)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(251, 146, 60, 0.5)';
        ctx.stroke();
        ctx.fillStyle = '#fdba74';
        ctx.font = 'bold 8.5px Inter, system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('🍅 25:00  •  🎵 Mưa Đêm', stageX + 16, dockY + 9);

        this.drawRoundedRect(ctx, stageX + stageW - 156, dockY, 148, 18, 9);
        ctx.fillStyle = 'rgba(9, 13, 20, 0.92)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
        ctx.stroke();
        ctx.fillStyle = '#6ee7b7';
        ctx.textAlign = 'right';
        ctx.fillText('🤖 AI 5 Chế Độ · 🎱 Bi #8', stageX + stageW - 14, dockY + 9);
      }

      // Dải phụ đề song ngữ (Tiếng Việt + English) ở chân khung video
      if (this.subtitlesVisible && cue) {
        const subBoxY = h - subBoxH - 10;
        this.drawRoundedRect(ctx, 18, subBoxY, w - 36, subBoxH, 12);
        ctx.fillStyle = 'rgba(2, 6, 23, 0.93)';
        ctx.fill();
        ctx.strokeStyle = `${chap.accentColor}99`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = chap.accentColor;
        ctx.font = 'bold 9.5px Inter, system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        const voiceBadge = this.voiceNarrator.enabled
          ? ` • 🎙️ ${this.voiceNarrator.language === 'en-US' ? 'EN Voice' : 'Giọng Việt Cute'}`
          : '';
        ctx.fillText(`PHỤ ĐỀ • ${(cue.speaker || '').toUpperCase()}${voiceBadge}`, 30, subBoxY + 6);

        const baseFont = Math.max(10, Math.min(13.5, Math.round(w * 0.0165 * this.subtitleFontScale)));
        if (this.subtitleLangMode === 'VI') {
          ctx.fillStyle = '#f8fafc';
          ctx.font = `600 ${baseFont}px Inter, system-ui, sans-serif`;
          this.drawWrappedSubtitleText(ctx, cue.text, 30, subBoxY + 21, w - 60, baseFont + 4, 2);
        } else if (this.subtitleLangMode === 'EN') {
          ctx.fillStyle = '#a5f3fc';
          ctx.font = `600 ${baseFont}px Inter, system-ui, sans-serif`;
          this.drawWrappedSubtitleText(ctx, cue.textEn || cue.text, 30, subBoxY + 21, w - 60, baseFont + 4, 2);
        } else {
          ctx.fillStyle = '#f8fafc';
          ctx.font = `600 ${baseFont}px Inter, system-ui, sans-serif`;
          this.drawWrappedSubtitleText(ctx, `🇻🇳 ${cue.text}`, 30, subBoxY + 20, w - 60, baseFont + 3, 2);
          ctx.fillStyle = '#67e8f9';
          ctx.font = `500 ${Math.max(9.5, baseFont - 1)}px Inter, system-ui, sans-serif`;
          this.drawWrappedSubtitleText(ctx, `🇬🇧 ${cue.textEn || ''}`, 30, subBoxY + 48, w - 60, baseFont + 2, 1);
        }
      }
    }

    drawWrappedSubtitleText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
      const words = String(text || '').split(/\s+/);
      const lines = [];
      let currentLine = '';
      for (const word of words) {
        const probe = currentLine ? `${currentLine} ${word}` : word;
        if (ctx.measureText(probe).width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
          if (lines.length >= maxLines) break;
        } else {
          currentLine = probe;
        }
      }
      if (currentLine && lines.length < maxLines) {
        lines.push(currentLine);
      }
      lines.forEach((line, idx) => {
        ctx.fillText(line, x, y + idx * lineHeight);
      });
    }

    drawSceneStage(ctx, sceneType, x, y, w, h, t, accent) {
      switch (sceneType) {
        case 'SIX_SCREENS_MAP':
          this.renderSceneSixScreensMap(ctx, x, y, w, h, t, accent);
          break;
        case 'TAB1_DIFF_REVIEW':
          this.renderSceneTab1DiffReview(ctx, x, y, w, h, t, accent);
          break;
        case 'TAB2_CHAPTER_RAG':
          this.renderSceneTab2ChapterRag(ctx, x, y, w, h, t, accent);
          break;
        case 'TWO_STEP_PROMPT':
          this.renderSceneTwoStepPrompt(ctx, x, y, w, h, t, accent);
          break;
        case 'MODE5_PLOT_GRAPH':
          this.renderSceneMode5PlotGraph(ctx, x, y, w, h, t, accent);
          break;
        case 'TAB4_BIBLE_MATRIX':
          this.renderSceneTab4BibleMatrix(ctx, x, y, w, h, t, accent);
          break;
        case 'POMODORO_TWO_WAY_SYNC':
          this.renderScenePomodoroSync(ctx, x, y, w, h, t, accent);
          break;
        case 'ARGON_WEB_AND_AMBIENT_STAGE':
          this.renderSceneArgonWebAndAmbientStage(ctx, x, y, w, h, t, accent);
          break;
        case 'VERSION_VAULT_AND_PDF':
        default:
          this.renderSceneVersionVaultAndPdf(ctx, x, y, w, h, t, accent);
          break;
      }
    }
  }

  // =========================================================================
  // BỘ DỰNG HOẠT CẢNH 8 PHÂN ĐOẠN VIDEO CHI TIẾT TRÊN HTML5 CANVAS
  // =========================================================================
  Object.assign(AnimatedCanvasTutorialPlayer.prototype, {
    renderSceneSixScreensMap(ctx, x, y, w, h, t, accent) {
      const tabs = [
        { code: '1. Viết', desc: 'Soạn thảo & Diff AI' },
        { code: '2. Chương', desc: 'Nguồn & BM25 RAG' },
        { code: '3. AI 5 Chế Độ', desc: 'Prompt Tổng & SVG' },
        { code: '4. Story Bible', desc: 'Hồ sơ & Duyệt' },
        { code: '5. Nhạc & Pomo', desc: 'MP3 A-B & Pomodoro' },
        { code: '6. Phiên Bản', desc: 'Time-Machine & PDF' },
      ];
      const activeIdx = Math.floor((t * 6) % 6);
      const cols = 3;
      const gap = 12;
      const cardW = (w - gap * (cols + 1)) / cols;
      const cardH = (h - 62) / 2;

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 11px Inter, system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('SƠ ĐỒ 6 MÀN HÌNH ĐỘC LẬP — TƯƠNG THÍCH DESKTOP & MOBILE BOTTOM NAV', x + 12, y + 6);

      tabs.forEach((item, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const cx = x + gap + col * (cardW + gap);
        const cy = y + 28 + row * (cardH + 10);
        const isHot = idx === activeIdx;

        this.drawRoundedRect(ctx, cx, cy, cardW, cardH, 10);
        ctx.fillStyle = isHot ? `${accent}22` : 'rgba(15, 23, 42, 0.82)';
        ctx.fill();
        ctx.strokeStyle = isHot ? accent : 'rgba(148, 163, 184, 0.25)';
        ctx.lineWidth = isHot ? 2 : 1;
        ctx.stroke();

        ctx.fillStyle = isHot ? accent : '#e2e8f0';
        ctx.font = 'bold 12px Inter, system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(item.code, cx + 12, cy + 12);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px Inter, system-ui, sans-serif';
        ctx.fillText(item.desc, cx + 12, cy + 32);

        if (isHot) {
          this.drawAnimatedPointer(ctx, cx + cardW - 28, cy + cardH - 22, (t * 6) % 1, accent);
        }
      });

      // Thanh Mobile Bottom Nav mô phỏng ở cạnh dưới
      const mobBarY = y + h - 22;
      this.drawRoundedRect(ctx, x + 12, mobBarY, w - 24, 20, 8);
      ctx.fillStyle = 'rgba(2, 6, 23, 0.9)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#a7f3d0';
      ctx.font = 'bold 10px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('📱 Mobile Bottom Nav 6 nút + Đã xóa ô Chương 2 dư thừa tại Tab 1', x + w / 2, mobBarY + 10);
    },

    renderSceneTab1DiffReview(ctx, x, y, w, h, t, accent) {
      const leftW = w * 0.62;
      const rightX = x + leftW + 14;
      const rightW = w - leftW - 14;

      // Khung trang giấy bản thảo bên trái
      this.drawRoundedRect(ctx, x, y, leftW, h, 12);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 11px Inter, system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('📄 BẢN THẢO TAB 1 — PHÂN BIỆT MÀU CHỮ AI VIẾT (GOOGLE DOCS DIFF)', x + 14, y + 12);

      // Đoạn tác giả viết
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '12px Georgia, serif';
      ctx.fillText('Tác giả: Tiếng mưa rả rích gõ lên mái tôn cũ kỹ...', x + 14, y + 40);

      // Đoạn AI mới chèn vào có nền màu khác biệt rõ ràng
      const revealAlpha = Math.min(1, t * 2.2);
      ctx.save();
      ctx.globalAlpha = revealAlpha;
      this.drawRoundedRect(ctx, x + 12, y + 66, leftW - 24, 58, 8);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.16)';
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.stroke();

      ctx.fillStyle = '#6ee7b7';
      ctx.font = 'bold 10px Inter, system-ui, sans-serif';
      ctx.fillText('+ ĐOẠN AI ĐỀ XUẤT BỔ SUNG (CỤM #1)', x + 22, y + 74);
      ctx.fillStyle = '#a7f3d0';
      ctx.font = 'italic 11.5px Georgia, serif';
      ctx.fillText('Ánh đèn hành lang chớp tắt, hắt lên vệt bùn mới cạnh bậc cửa.', x + 22, y + 92);

      // Nút Chấp nhận / Từ chối bên dưới cụm diff
      const clickedAccept = t > 0.65;
      this.drawRoundedRect(ctx, x + 22, y + 132, 118, 26, 7);
      ctx.fillStyle = clickedAccept ? '#10b981' : '#059669';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10.5px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(clickedAccept ? '✓ Đã Chấp Nhận' : '✓ Chấp nhận cụm này', x + 81, y + 145);

      this.drawRoundedRect(ctx, x + 150, y + 132, 110, 26, 7);
      ctx.fillStyle = 'rgba(225, 29, 72, 0.2)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.5)';
      ctx.stroke();
      ctx.fillStyle = '#fda4af';
      ctx.fillText('✕ Từ chối', x + 205, y + 145);
      ctx.restore();

      // Khung phải: Ngũ quan & Lore Whisper
      this.drawRoundedRect(ctx, rightX, y, rightW, h, 12);
      ctx.fillStyle = 'rgba(17, 24, 39, 0.9)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(20, 184, 166, 0.45)';
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#2dd4bf';
      ctx.font = 'bold 11px Inter, system-ui, sans-serif';
      ctx.fillText('✨ LORE WHISPER & NGŨ QUAN', rightX + 12, y + 12);

      const senses = ['👁️ Thị giác: bóng đổ, vệt mờ', '👂 Thính giác: tiếng kim giây', '🌫️ Khứu giác: mùi mưa ẩm', '💓 Nội tâm: ngón tay lạnh'];
      senses.forEach((s, i) => {
        const sy = y + 40 + i * 30;
        this.drawRoundedRect(ctx, rightX + 12, sy, rightW - 24, 24, 6);
        ctx.fillStyle = 'rgba(20, 184, 166, 0.12)';
        ctx.fill();
        ctx.fillStyle = '#ccfbf1';
        ctx.font = '10.5px Inter, system-ui, sans-serif';
        ctx.fillText(s, rightX + 20, sy + 6);
      });

      this.drawAnimatedPointer(ctx, x + 95, y + 146, (t * 4) % 1, accent);
    },

    renderSceneTab2ChapterRag(ctx, x, y, w, h, t, accent) {
      const colW = (w - 16) / 2;
      this.drawRoundedRect(ctx, x, y, colW, h, 12);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 11px Inter, system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('📂 CÂY CHƯƠNG & NẠP .DOCX/.PDF/.TXT', x + 12, y + 12);

      const chapItems = [
        'Chương 1: Khởi Đầu Trong Mưa [Đã Duyệt ✓]',
        'Chương 2: Vết Nứt Hành Lang [Đã Duyệt ✓]',
        'Chương 3: Tín Hiệu Lúc Nửa Đêm [Nháp]',
      ];
      chapItems.forEach((label, idx) => {
        const iy = y + 40 + idx * 38;
        const active = Math.floor(t * 3) === idx;
        this.drawRoundedRect(ctx, x + 12, iy, colW - 24, 30, 8);
        ctx.fillStyle = active ? 'rgba(245, 158, 11, 0.2)' : 'rgba(30, 41, 59, 0.75)';
        ctx.fill();
        ctx.strokeStyle = active ? '#f59e0b' : 'transparent';
        ctx.stroke();
        ctx.fillStyle = '#f8fafc';
        ctx.font = '10.5px Inter, system-ui, sans-serif';
        ctx.fillText(label, x + 20, iy + 9);
      });

      const rx = x + colW + 16;
      this.drawRoundedRect(ctx, rx, y, colW, h, 12);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
      ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 11px Inter, system-ui, sans-serif';
      ctx.fillText('🔍 BM25 CỤC BỘ (0 TOKEN API)', rx + 12, y + 12);

      this.drawRoundedRect(ctx, rx + 12, y + 36, colW - 24, 28, 7);
      ctx.fillStyle = '#020617';
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.stroke();
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '11px monospace';
      ctx.fillText('Từ khóa: "chiếc đồng hồ bạc"', rx + 20, y + 44);

      this.drawRoundedRect(ctx, rx + 12, y + 76, colW - 24, 68, 8);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
      ctx.fill();
      ctx.fillStyle = '#6ee7b7';
      ctx.font = 'bold 10.5px Inter, system-ui, sans-serif';
      ctx.fillText('Kết quả Chương 1 (Độ khớp 98%):', rx + 20, y + 84);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '10.5px Georgia, serif';
      ctx.fillText('"...mặt sau chiếc đồng hồ bạc khắc chữ A.K..."', rx + 20, y + 104);

      this.drawAnimatedPointer(ctx, rx + colW * 0.55, y + 50, (t * 5) % 1, accent);
    },

    renderSceneTwoStepPrompt(ctx, x, y, w, h, t, accent) {
      const boxW = (w - 44) / 3;
      const stepPhase = Math.floor(t * 3);

      // Bước 0: Khung đầu vào
      const x1 = x;
      this.drawRoundedRect(ctx, x1, y + 8, boxW, h - 16, 12);
      ctx.fillStyle = stepPhase === 0 ? 'rgba(16, 185, 129, 0.14)' : 'rgba(15, 23, 42, 0.88)';
      ctx.fill();
      ctx.strokeStyle = stepPhase === 0 ? accent : 'rgba(148, 163, 184, 0.25)';
      ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 11px Inter, system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('NHẬP LỆNH SIÊU RỘNG', x1 + 12, y + 18);
      const inputs = ['✓ Câu lệnh tác giả', '✓ Story Bible Tab 4', '✓ Mốc chuyển POV', '✓ Ký ức BM25 RAG'];
      inputs.forEach((lbl, idx) => {
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '10.5px Inter, system-ui, sans-serif';
        ctx.fillText(lbl, x1 + 12, y + 46 + idx * 24);
      });

      // Bước 1: Tổng hợp Prompt Tổng
      const x2 = x + boxW + 22;
      this.drawRoundedRect(ctx, x2, y + 8, boxW, h - 16, 12);
      ctx.fillStyle = stepPhase === 1 ? 'rgba(56, 189, 248, 0.14)' : 'rgba(15, 23, 42, 0.88)';
      ctx.fill();
      ctx.strokeStyle = stepPhase === 1 ? '#38bdf8' : 'rgba(148, 163, 184, 0.25)';
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px Inter, system-ui, sans-serif';
      ctx.fillText('BƯỚC 1: PROMPT TỔNG HỢP', x2 + 12, y + 18);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '10.5px Inter, system-ui, sans-serif';
      ctx.fillText('Ghép 100% dữ kiện thành', x2 + 12, y + 46);
      ctx.fillText('1 kịch bản chặt chẽ trước', x2 + 12, y + 64);
      ctx.fillText('khi viết bản chính thức.', x2 + 12, y + 82);

      // Bước 2: Cổng Xác Nhận & Chọn Model
      const x3 = x + (boxW + 22) * 2;
      this.drawRoundedRect(ctx, x3, y + 8, boxW, h - 16, 12);
      ctx.fillStyle = stepPhase === 2 ? 'rgba(245, 158, 11, 0.14)' : 'rgba(15, 23, 42, 0.88)';
      ctx.fill();
      ctx.strokeStyle = stepPhase === 2 ? '#f59e0b' : 'rgba(148, 163, 184, 0.25)';
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 11px Inter, system-ui, sans-serif';
      ctx.fillText('BƯỚC 2: CHỌN MÔ HÌNH', x3 + 12, y + 18);
      ctx.fillStyle = '#6ee7b7';
      ctx.font = 'bold 10.5px Inter, system-ui, sans-serif';
      ctx.fillText('Khuyên dùng: Flash / Pro', x3 + 12, y + 48);
      ctx.fillStyle = '#fca5a5';
      ctx.font = '10px Inter, system-ui, sans-serif';
      ctx.fillText('(!) Cảnh báo nếu chọn Lite', x3 + 12, y + 70);

      // Mũi tên nối 3 bước
      ctx.fillStyle = accent;
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('➔', x1 + boxW + 4, y + h * 0.45);
      ctx.fillText('➔', x2 + boxW + 4, y + h * 0.45);

      const px = x + 36 + t * (w - 90);
      this.drawAnimatedPointer(ctx, px, y + h * 0.65, (t * 4) % 1, accent);
    },

    renderSceneMode5PlotGraph(ctx, x, y, w, h, t, accent) {
      this.drawRoundedRect(ctx, x, y, w, h, 12);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(129, 140, 248, 0.45)';
      ctx.stroke();

      ctx.fillStyle = '#a5b4fc';
      ctx.font = 'bold 11px Inter, system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('📊 CHẾ ĐỘ 5: BIỂU ĐỒ DIỄN BIẾN CỐT TRUYỆN SVG & PHÁT HIỆN MÂU THUẪN', x + 14, y + 12);

      const nodes = [
        { nx: x + w * 0.16, ny: y + h * 0.46, label: 'Ch.1: Biến mất', sub: '21:15 Thứ Sáu' },
        { nx: x + w * 0.42, ny: y + h * 0.34, label: 'Ch.4: Chiếc nhẫn', sub: 'Manh mối #2' },
        { nx: x + w * 0.68, ny: y + h * 0.56, label: 'Ch.7: Đối chất', sub: 'Kiểm tra POV' },
        { nx: x + w * 0.88, ny: y + h * 0.42, label: 'Ch.9: Cao trào', sub: 'Khớp logic ✓' },
      ];

      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      nodes.forEach((n, idx) => {
        if (idx === 0) ctx.moveTo(n.nx, n.ny);
        else ctx.lineTo(n.nx, n.ny);
      });
      ctx.stroke();

      const activeNode = Math.floor((t * 4) % nodes.length);
      nodes.forEach((n, idx) => {
        const hot = idx === activeNode;
        ctx.beginPath();
        ctx.arc(n.nx, n.ny, hot ? 17 : 13, 0, Math.PI * 2);
        ctx.fillStyle = hot ? '#818cf8' : '#1e1b4b';
        ctx.fill();
        ctx.strokeStyle = '#c7d2fe';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(String(idx + 1), n.nx, n.ny - 5);

        ctx.fillStyle = hot ? '#e0e7ff' : '#94a3b8';
        ctx.font = 'bold 10px Inter, system-ui, sans-serif';
        ctx.fillText(n.label, n.nx, n.ny + 22);
        ctx.fillStyle = '#64748b';
        ctx.font = '9.5px Inter, system-ui, sans-serif';
        ctx.fillText(n.sub, n.nx, n.ny + 35);
      });

      this.drawAnimatedPointer(ctx, nodes[activeNode].nx + 12, nodes[activeNode].ny + 10, (t * 4) % 1, '#818cf8');
    },

    renderSceneTab4BibleMatrix(ctx, x, y, w, h, t, accent) {
      const leftW = w * 0.56;
      this.drawRoundedRect(ctx, x, y, leftW, h, 12);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
      ctx.stroke();

      ctx.fillStyle = '#f472b6';
      ctx.font = 'bold 11px Inter, system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('🏛️ MA TRẬN STORY BIBLE & KHÓA KHUNG MẪU', x + 12, y + 12);

      const pills = ['👤 Nhân vật: 4 hồ sơ khóa', '🧠 Ai Biết Gì: 6 bí mật', '🪡 Phục bút: 3 nút thắt mở', '🚫 Từ cấm AI: Đã bật'];
      pills.forEach((p, idx) => {
        const py = y + 38 + idx * 32;
        this.drawRoundedRect(ctx, x + 12, py, leftW - 24, 24, 7);
        ctx.fillStyle = 'rgba(236, 72, 153, 0.14)';
        ctx.fill();
        ctx.fillStyle = '#fbcfe8';
        ctx.font = '10.5px Inter, system-ui, sans-serif';
        ctx.fillText(p, x + 20, py + 6);
      });

      const rx = x + leftW + 14;
      const rw = w - leftW - 14;
      this.drawRoundedRect(ctx, rx, y, rw, h, 12);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 11px Inter, system-ui, sans-serif';
      ctx.fillText('✅ DUYỆT & CHỐT BẢN THẢO', rx + 12, y + 12);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '10.5px Inter, system-ui, sans-serif';
      ctx.fillText('• Đã bỏ khung đầu ra dư thừa', rx + 12, y + 40);
      ctx.fillText('• Chạy Prompt tổng hợp ngầm', rx + 12, y + 60);
      ctx.fillText('• Tự cập nhật Bible & báo xong', rx + 12, y + 80);

      this.drawRoundedRect(ctx, rx + 14, y + 112, rw - 28, 30, 8);
      ctx.fillStyle = t > 0.55 ? '#10b981' : '#059669';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(t > 0.55 ? '✓ Chốt Duyệt Thành Công!' : '🚀 Chốt Chương & Cập Nhật Bible', rx + rw / 2, y + 121);
      this.drawAnimatedPointer(ctx, rx + rw / 2 + 24, y + 128, (t * 4) % 1, accent);
    },

    renderScenePomodoroSync(ctx, x, y, w, h, t, accent) {
      const leftW = w * 0.46;
      const rightW = w * 0.46;
      const rx = x + w - rightW;
      const secsLeft = Math.max(1200, 1500 - Math.floor(t * 260));
      const timeTxt = this.formatSecToMmSs(secsLeft);
      const isRunning = t > 0.25;

      // Đồng hồ bên trái (Tab 5)
      this.drawRoundedRect(ctx, x, y + 10, leftW, h - 20, 12);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fill();
      ctx.strokeStyle = isRunning ? '#f97316' : 'rgba(148, 163, 184, 0.3)';
      ctx.stroke();

      ctx.fillStyle = '#fdba74';
      ctx.font = 'bold 11px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('TAB 5 — ĐỒNG HỒ POMODORO', x + leftW / 2, y + 22);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px monospace';
      ctx.fillText(timeTxt, x + leftW / 2, y + 58);
      ctx.fillStyle = isRunning ? '#4ade80' : '#94a3b8';
      ctx.font = 'bold 11px Inter, system-ui, sans-serif';
      ctx.fillText(isRunning ? '● ĐANG CHẠY ĐỒNG BỘ' : '❚❚ SẴN SÀNG', x + leftW / 2, y + 102);

      // Đồng hồ bên phải (Thanh Nổi Pomodoro Pill)
      this.drawRoundedRect(ctx, rx, y + 10, rightW, h - 20, 12);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fill();
      ctx.strokeStyle = isRunning ? '#f97316' : 'rgba(148, 163, 184, 0.3)';
      ctx.stroke();

      ctx.fillStyle = '#fdba74';
      ctx.font = 'bold 11px Inter, system-ui, sans-serif';
      ctx.fillText('THANH NỔI POMODORO PILL', rx + rightW / 2, y + 22);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px monospace';
      ctx.fillText(timeTxt, rx + rightW / 2, y + 58);
      ctx.fillStyle = isRunning ? '#4ade80' : '#94a3b8';
      ctx.font = 'bold 11px Inter, system-ui, sans-serif';
      ctx.fillText(isRunning ? '● KHỚP TỪNG GIÂY 100%' : '❚❚ CHỜ BẤM', rx + rightW / 2, y + 102);

      // Mũi tên đồng bộ 2 chiều giữa 2 khung
      ctx.fillStyle = '#fb923c';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('⇄', x + w / 2, y + h / 2 - 8);
      this.drawAnimatedPointer(ctx, x + leftW * 0.5, y + 114, (t * 4) % 1, accent);
    },

    renderSceneVersionVaultAndPdf(ctx, x, y, w, h, t, accent) {
      const halfW = (w - 16) / 2;

      // Trái: Tab 6 Time-Machine Preview
      this.drawRoundedRect(ctx, x, y, halfW, h, 12);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px Inter, system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('🕒 TAB 6: KHO PHIÊN BẢN & PREVIEW CŨ', x + 12, y + 12);

      const snapshots = ['v3 • 10:42 • Chốt Chương 2', 'v2 • 10:28 • Sửa thoại chính', 'v1 • 10:05 • Điểm mở đầu'];
      snapshots.forEach((snap, idx) => {
        const sy = y + 38 + idx * 32;
        const selected = idx === Math.floor(t * 3) % snapshots.length;
        this.drawRoundedRect(ctx, x + 12, sy, halfW - 24, 26, 7);
        ctx.fillStyle = selected ? 'rgba(56, 189, 248, 0.22)' : 'rgba(30, 41, 59, 0.7)';
        ctx.fill();
        ctx.fillStyle = selected ? '#e0f2fe' : '#94a3b8';
        ctx.font = '10.5px Inter, system-ui, sans-serif';
        ctx.fillText(snap, x + 20, sy + 7);
      });
      ctx.fillStyle = '#6ee7b7';
      ctx.font = 'bold 10.5px Inter, system-ui, sans-serif';
      ctx.fillText('👁️ Preview bản thảo & Khôi phục 1 chạm', x + 14, y + h - 24);

      // Phải: Xuất PDF Chọn Font & Cỡ Chữ
      const rx = x + halfW + 16;
      this.drawRoundedRect(ctx, rx, y, halfW, h, 12);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 11px Inter, system-ui, sans-serif';
      ctx.fillText('📤 XUẤT PDF: CHỌN FONT & CỠ CHỮ', rx + 12, y + 12);
      const specs = ['Font: Merriweather / Times / Lora', 'Cỡ chữ in: 11pt • 13pt • 15pt', 'Giãn dòng: 1.65 • Khổ A5 / A4', 'Xem trước trang in tức thì ✓'];
      specs.forEach((sp, i) => {
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '10.5px Inter, system-ui, sans-serif';
        ctx.fillText(sp, rx + 14, y + 42 + i * 24);
      });

      this.drawAnimatedPointer(ctx, x + halfW * 0.6, y + 84, (t * 4) % 1, accent);
    },

    renderSceneArgonWebAndAmbientStage(ctx, x, y, w, h, t, accent) {
      const halfW = (w - 16) / 2;

      // Trái: Cầu nối Argon 4 / Carbon 4 (20.000+ từ qua Gemini Web)
      this.drawRoundedRect(ctx, x, y, halfW, h, 12);
      ctx.fillStyle = 'rgba(24, 16, 48, 0.92)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
      ctx.stroke();

      ctx.fillStyle = '#d8b4fe';
      ctx.font = 'bold 11px Inter, system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('💎 CẦU NỐI GEMINI WEB (20.000+ TỪ)', x + 12, y + 12);

      // Link gạch chân 1: Copy toàn bộ Prompt tổng
      const pulseCopy = 0.72 + 0.28 * Math.sin(t * Math.PI * 4);
      this.drawRoundedRect(ctx, x + 12, y + 38, halfW - 24, 28, 8);
      ctx.fillStyle = `rgba(124, 58, 237, ${(0.22 * pulseCopy).toFixed(2)})`;
      ctx.fill();
      ctx.strokeStyle = '#c084fc';
      ctx.stroke();
      ctx.fillStyle = '#f5d0fe';
      ctx.font = 'bold 10px Inter, system-ui, sans-serif';
      ctx.fillText('📋 Ấn vào đây để copy toàn bộ Prompt tổng', x + 20, y + 47);

      // Link gạch chân 2: Mở Gemini Web Argon 4
      this.drawRoundedRect(ctx, x + 12, y + 74, halfW - 24, 28, 8);
      ctx.fillStyle = 'rgba(14, 165, 233, 0.18)';
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.stroke();
      ctx.fillStyle = '#bae6fd';
      ctx.fillText('🌐 Bấm vào đây mở Gemini Web (Argon 4)', x + 20, y + 83);

      // Lưu ý gói Pro / Ultra
      this.drawRoundedRect(ctx, x + 12, y + 110, halfW - 24, 34, 8);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.16)';
      ctx.fill();
      ctx.fillStyle = '#fde68a';
      ctx.font = 'bold 9.5px Inter, system-ui, sans-serif';
      ctx.fillText('⚡ Lưu ý: Nâng cấp Pro → Argon 4', x + 20, y + 116);
      ctx.fillText('   Nâng cấp Ultra → Carbon 4 nha!', x + 20, y + 130);

      // Phải: Sân Khấu Nền Đa Tầng Module 32 (Hết đen đặc)
      const rx = x + halfW + 16;
      this.drawRoundedRect(ctx, rx, y, halfW, h, 12);
      const gradBg = ctx.createLinearGradient(rx, y, rx + halfW, y + h);
      gradBg.addColorStop(0, '#0f172a');
      gradBg.addColorStop(0.55, '#1e1b4b');
      gradBg.addColorStop(1, '#064e3b');
      ctx.fillStyle = gradBg;
      ctx.fill();
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.55)';
      ctx.stroke();

      // Vẽ ánh trăng & đường chân trời minh họa tranh tự sinh
      ctx.beginPath();
      ctx.arc(rx + halfW - 36, y + 48, 16, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(253, 230, 138, 0.72)';
      ctx.fill();

      // Thẻ kính mờ đè lên tranh cho thấy hiệu ứng xuyên sáng
      this.drawRoundedRect(ctx, rx + 14, y + 36, halfW - 28, h - 52, 10);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.52)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.stroke();

      ctx.fillStyle = '#6ee7b7';
      ctx.font = 'bold 11px Inter, system-ui, sans-serif';
      ctx.fillText('🖼️ MODULE 32: KÍNH MỜ XUYÊN NỀN', rx + 12, y + 12);
      const stageNotes = [
        '✔ html.dark Frosted Glass (Xuyên nền)',
        '✔ Canvas Tranh z-[2] + IndexedDB F5',
        '✔ Preset: Rõ Nét 88% / Soi Nền 100%',
      ];
      stageNotes.forEach((line, idx) => {
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '10px Inter, system-ui, sans-serif';
        ctx.fillText(line, rx + 24, y + 50 + idx * 24);
      });

      this.drawAnimatedPointer(ctx, x + halfW * 0.45, y + 52 + Math.sin(t * 6) * 20, (t * 4) % 1, accent);
    },
  });

  /**
   * Bộ điều phối giao diện Cẩm nang A-Z, Video Hướng Dẫn Có Phụ Đề & Nhật ký v38.0 trong Modal #modal-tutorial-changelog-az.
   */
  class TutorialAndChangelogController {
    constructor() {
      this.hasInitialized = false;
      this.activeSubTab = 'VIDEO';
      this.transcriptFilterText = '';
      this.player = new AnimatedCanvasTutorialPlayer({
        chapters: VIDEO_TUTORIAL_CHAPTERS_DATA,
        subtitles: SYNCHRONIZED_SUBTITLE_TRACK_V38,
      });
      this.unsubscribeTick = null;
      this.resizeHandler = null;
    }

    init() {
      if (this.hasInitialized) return this;
      this.hasInitialized = true;
      this.bindCoreModalTriggers();
      this.unsubscribeTick = this.player.subscribeTick((state) => this.syncLivePlayerDom(state));
      return this;
    }

    bindCoreModalTriggers() {
      if (typeof document === 'undefined') return;
      const openBtn = document.getElementById('btn-s6-card-tutorial');
      const closeBtn = document.getElementById('btn-close-tutorial-modal');
      const modalEl = document.getElementById('modal-tutorial-changelog-az');

      const registerClick = (el, key, handler) => {
        if (!el) return;
        if (typeof NS.bindOnce === 'function') {
          NS.bindOnce(el, 'click', handler, key);
        } else if (!el.dataset[key]) {
          el.dataset[key] = '1';
          el.addEventListener('click', handler);
        }
      };

      registerClick(openBtn, 'mod28OpenTutorial', () => this.openModal('VIDEO'));
      registerClick(closeBtn, 'mod28CloseTutorial', () => this.closeModal());

      if (modalEl && !modalEl.dataset.mod28BackdropBound) {
        modalEl.dataset.mod28BackdropBound = '1';
        modalEl.addEventListener('click', (ev) => {
          if (ev.target === modalEl) {
            this.closeModal();
          }
        });
      }

      if (!this.resizeHandler && typeof window !== 'undefined') {
        this.resizeHandler = () => {
          if (!modalEl || modalEl.classList.contains('hidden')) return;
          this.player.resizeCanvasToContainer();
          this.player.renderCurrentFrame();
        };
        window.addEventListener('resize', this.resizeHandler);
      }
    }

    openModal(initialTab = 'VIDEO') {
      const modalEl = document.getElementById('modal-tutorial-changelog-az');
      if (!modalEl) return false;
      this.activeSubTab = ['VIDEO', 'CHANGELOG', 'MODELS', 'SHORTCUTS'].includes(initialTab)
        ? initialTab
        : 'VIDEO';
      modalEl.classList.remove('hidden');
      if (NS.modalStack?.register) {
        NS.modalStack.register('modal-tutorial-changelog-az', () => this.closeModal());
      }
      this.renderModalBody();
      if (this.activeSubTab === 'VIDEO') {
        this.mountVideoCanvasInDom();
      }
      return true;
    }

    closeModal() {
      this.player.detachCanvas();
      const modalEl = document.getElementById('modal-tutorial-changelog-az');
      if (modalEl) {
        modalEl.classList.add('hidden');
      }
      if (NS.modalStack?.unregister) {
        NS.modalStack.unregister('modal-tutorial-changelog-az');
      }
    }

    escapeHtmlSafe(value) {
      if (NS.uiUtils?.escapeHtml) return NS.uiUtils.escapeHtml(value);
      return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    switchSubTab(tabKey) {
      this.activeSubTab = tabKey;
      if (tabKey !== 'VIDEO') {
        this.player.detachCanvas();
      }
      this.renderModalBody();
      if (tabKey === 'VIDEO') {
        this.mountVideoCanvasInDom();
      }
    }

    mountVideoCanvasInDom() {
      const canvasEl = document.getElementById('mod28-tutorial-canvas');
      if (!canvasEl) return;
      const domMirror = globalScope.NoirStudio?.liveDomVideoMirror;
      if (domMirror && typeof domMirror.syncMirrorForChapter === 'function') {
        domMirror.syncMirrorForChapter(this.player.activeChapterId || 'CHAP_01_SIX_SCREENS', true);
      }
      globalScope.NoirStudio?.neuralVoice?.syncVoicePickerUI?.(this.player.voiceNarrator?.language || 'vi-VN');
      this.player.attachCanvas(canvasEl);
      this.syncLivePlayerDom(this.player.getPlaybackSnapshot());
    }

    renderModalBody() {
      const bodyEl = document.getElementById('tutorial-changelog-body');
      if (!bodyEl) return;

      const tabs = [
        { key: 'VIDEO', label: '🎬 Video Hướng Dẫn (Có Phụ Đề Tiếng Việt)' },
        { key: 'CHANGELOG', label: '📜 Nhật Ký Đại Tu & Vá Lỗi v38.0' },
        { key: 'MODELS', label: '🤖 Chọn Mô Hình Gemini Up-to-Date' },
        { key: 'SHORTCUTS', label: '⌨️ Phím Tắt & Mẹo Điện Thoại / PC' },
      ];

      const tabsBarHtml = `
        <div class="flex flex-wrap items-center gap-2 border-b border-studioLightBorder dark:border-zinc-800 pb-3">
          ${tabs
            .map((t) => {
              const active = t.key === this.activeSubTab;
              return `<button type="button" data-tut-tab="${t.key}" class="mod28-tut-tab-btn px-3.5 py-2 rounded-xl text-xs font-extrabold transition ${
                active
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
              }">${this.escapeHtmlSafe(t.label)}</button>`;
            })
            .join('')}
        </div>
      `;

      let contentHtml = '';
      if (this.activeSubTab === 'VIDEO') {
        contentHtml = this.buildVideoPlayerTabHtml();
      } else if (this.activeSubTab === 'CHANGELOG') {
        contentHtml = this.buildChangelogTabHtml();
      } else if (this.activeSubTab === 'MODELS') {
        contentHtml = this.buildModelStrategyTabHtml();
      } else {
        contentHtml = this.buildShortcutsAndTipsTabHtml();
      }

      bodyEl.innerHTML = `${tabsBarHtml}<div class="pt-2">${contentHtml}</div>`;
      this.bindRenderedTabControls(bodyEl);
    }

    buildVideoPlayerTabHtml() {
      const snap = this.player.getPlaybackSnapshot();
      const curChap = snap.chapter || VIDEO_TUTORIAL_CHAPTERS_DATA[0];
      const curCue = snap.cue;

      const markerChips = [
        { label: '🔐 Cổng API & 6 Tab', sec: 0, color: 'emerald' },
        { label: '✍️ Tab 1: Diff & Ngũ Quan', sec: 22.1, color: 'teal' },
        { label: '🗂️ Tab 2: Chương & BM25', sec: 46.1, color: 'amber' },
        { label: '🤖 Tab 3: 5 Chế Độ & Quotas', sec: 70.1, color: 'emerald' },
        { label: '📊 Mode 5: Sơ Đồ Bible', sec: 98.1, color: 'indigo' },
        { label: '🏛️ Tab 4: Bible & NotebookLM', sec: 122.1, color: 'pink' },
        { label: '🌧️ Tab 5: Nền Sáng & Nhạc', sec: 144.1, color: 'orange' },
        { label: '📤 Tab 6: TimeMachine & PDF/DOCX', sec: 166.1, color: 'sky' },
        { label: '💎 Mod 32: Nền Rõ Nét & Argon 4 Web', sec: 190.1, color: 'purple' },
      ];

      const segmentsBarHtml = VIDEO_TUTORIAL_CHAPTERS_DATA.map((ch) => {
        const widthPct = (((ch.endSec - ch.startSec) / this.player.totalDurationSec) * 100).toFixed(2);
        const isCurrent = ch.id === curChap.id;
        return `<button type="button" data-tut-seek="${ch.startSec}" title="${this.escapeHtmlSafe(ch.title)}" style="width:${widthPct}%; background:${isCurrent ? ch.accentColor : `${ch.accentColor}55`}" class="mod28-timeline-seg h-2.5 rounded-sm hover:opacity-100 transition-opacity cursor-pointer"></button>`;
      }).join('');

      const chaptersListHtml = VIDEO_TUTORIAL_CHAPTERS_DATA.map((ch) => {
        const isCurrent = ch.id === curChap.id;
        return `
          <button type="button" data-tut-chapter="${ch.id}" class="mod28-chapter-jump-btn w-full text-left p-2.5 rounded-xl border transition ${
            isCurrent
              ? 'border-emerald-500/70 bg-emerald-500/15 text-emerald-200'
              : 'border-zinc-800 bg-zinc-950/70 hover:border-zinc-700 text-zinc-300'
          }">
            <div class="flex items-center justify-between gap-2">
              <span class="font-bold text-[11px]">${this.escapeHtmlSafe(ch.title)}</span>
              <span class="font-monoCode text-[10px] text-emerald-400 shrink-0">${this.player.formatSecToMmSs(ch.startSec)}</span>
            </div>
            <div class="text-[10px] text-zinc-400 mt-1 line-clamp-2">${this.escapeHtmlSafe(ch.summary)}</div>
          </button>
        `;
      }).join('');

      const filterLower = this.transcriptFilterText.trim().toLowerCase();
      const filteredSubs = SYNCHRONIZED_SUBTITLE_TRACK_V38.filter((c) => {
        if (!filterLower) return true;
        return (
          c.text.toLowerCase().includes(filterLower) ||
          (c.textEn || '').toLowerCase().includes(filterLower) ||
          c.speaker.toLowerCase().includes(filterLower)
        );
      });

      const transcriptHtml = filteredSubs
        .map((cue) => {
          const isHot = curCue && cue.id === curCue.id;
          return `
            <button type="button" data-tut-seek="${cue.startSec}" class="mod28-subtitle-cue-btn w-full text-left p-2 rounded-lg border transition flex items-start gap-2.5 ${
              isHot
                ? 'border-emerald-500 bg-emerald-500/15 text-white'
                : 'border-zinc-800/80 bg-zinc-950/50 hover:bg-zinc-900 text-zinc-300'
            }">
              <span class="font-monoCode text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-emerald-400 shrink-0">${this.player.formatSecToMmSs(cue.startSec)}</span>
              <div class="min-w-0 space-y-0.5">
                <div class="text-[10px] font-bold text-teal-400">${this.escapeHtmlSafe(cue.speaker)} / ${this.escapeHtmlSafe(cue.speakerEn || 'Guide')}</div>
                <div class="text-[11px] leading-snug text-zinc-100">🇻🇳 ${this.escapeHtmlSafe(cue.text)}</div>
                <div class="text-[10px] leading-snug text-cyan-300/90">🇬🇧 ${this.escapeHtmlSafe(cue.textEn || '')}</div>
              </div>
            </button>
          `;
        })
        .join('');

      return `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div class="lg:col-span-7 space-y-3">
            <div id="mod28-video-frame-wrap" class="relative rounded-2xl border border-emerald-500/40 bg-black overflow-hidden shadow-2xl">
              <canvas id="mod28-tutorial-canvas" class="relative z-[3] w-full block aspect-video cursor-pointer"></canvas>
            </div>

            <!-- Thanh điều khiển phát Video, Tua theo Mốc Tab/Chức năng, Giọng đọc AI VI/EN & Phụ đề Song ngữ -->
            <div class="p-3 rounded-2xl border border-studioLightBorder dark:border-zinc-800 bg-zinc-950/90 space-y-2.5">
              <div id="mod28-timeline-markers-track" class="space-y-1.5">
                <div class="flex items-center gap-0.5 w-full" title="Bấm trực tiếp vào từng đoạn màu trên thanh để nhảy tới tính năng tương ứng">${segmentsBarHtml}</div>
                <div class="flex flex-wrap items-center gap-1">
                  ${markerChips
                    .map(
                      (m) =>
                        `<button type="button" data-tut-seek="${m.sec}" class="mod28-feature-marker-chip px-2 py-0.5 rounded-full border border-zinc-700/80 bg-zinc-900 hover:border-emerald-400 hover:bg-emerald-950/40 text-[10px] font-semibold text-zinc-200 transition">${this.escapeHtmlSafe(
                          m.label
                        )} <span class="font-monoCode text-emerald-400">${this.player.formatSecToMmSs(
                          m.sec
                        )}</span></button>`
                    )
                    .join('')}
                </div>
              </div>

              <div class="flex items-center gap-2">
                <span id="mod28-time-current" class="font-monoCode text-[11px] text-emerald-400 w-11">${this.player.formatSecToMmSs(snap.currentTimeSec)}</span>
                <input id="mod28-seek-slider" type="range" min="0" max="${this.player.totalDurationSec}" step="0.2" value="${snap.currentTimeSec}" class="flex-1 accent-emerald-500 cursor-pointer" />
                <span id="mod28-time-total" class="font-monoCode text-[11px] text-zinc-400 w-11 text-right">${this.player.formatSecToMmSs(snap.totalDurationSec)}</span>
              </div>

              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-1.5">
                  <button type="button" id="mod28-btn-prev-chap" class="px-2.5 py-1.5 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-zinc-200 font-bold text-[11px]">⏮ Trước</button>
                  <button type="button" id="mod28-btn-play-pause" class="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] shadow">${snap.isPlaying ? '⏸ Tạm dừng' : '▶ Phát Video'}</button>
                  <button type="button" id="mod28-btn-next-chap" class="px-2.5 py-1.5 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-zinc-200 font-bold text-[11px]">Tiếp ⏭</button>
                </div>

                <div class="flex items-center gap-1.5 flex-wrap">
                  <button type="button" id="mod28-btn-toggle-voice" class="px-2.5 py-1.5 rounded-xl border ${
                    this.player.voiceNarrator.enabled
                      ? 'border-pink-500/60 bg-pink-500/20 text-pink-200'
                      : 'border-zinc-700 bg-zinc-900 text-zinc-300'
                  } font-bold text-[11px]">
                    ${this.player.voiceNarrator.enabled ? '🎙️ Giọng đọc AI Cute: BẬT' : '🔇 Giọng đọc AI Cute: TẮT'}
                  </button>
                  <select id="mod28-voice-lang-select" title="Chọn ngôn ngữ giọng thuyết minh Neural VI/EN" class="px-2 py-1.5 rounded-xl border border-zinc-700 bg-zinc-900 text-[11px] font-bold text-pink-200">
                    <option value="vi-VN"${this.player.voiceNarrator.language === 'vi-VN' ? ' selected' : ''}>🇻🇳 Giọng Việt Neural</option>
                    <option value="en-US"${this.player.voiceNarrator.language === 'en-US' ? ' selected' : ''}>🇬🇧 English Neural</option>
                  </select>
                  <button type="button" id="mod33-btn-toggle-mirror-mode" class="px-2.5 py-1.5 rounded-xl border border-cyan-500/45 bg-cyan-500/15 text-cyan-200 font-bold text-[11px]" title="Chuyển giữa chế độ chiếu Giao diện Web Thật và Sơ đồ">
                    ${globalScope.NoirStudio?.liveDomVideoMirror?.enabled !== false ? '🖥️ Web Thật: BẬT' : '🎨 Sơ đồ: BẬT'}
                  </button>
                  <select id="mod28-sub-lang-select" title="Chọn ngôn ngữ hiển thị phụ đề" class="px-2 py-1.5 rounded-xl border border-zinc-700 bg-zinc-900 text-[11px] font-bold text-cyan-300">
                    <option value="BOTH"${this.player.subtitleLangMode === 'BOTH' ? ' selected' : ''}>💬 Phụ đề: Song ngữ VI + EN</option>
                    <option value="VI"${this.player.subtitleLangMode === 'VI' ? ' selected' : ''}>🇻🇳 Chỉ Tiếng Việt</option>
                    <option value="EN"${this.player.subtitleLangMode === 'EN' ? ' selected' : ''}>🇬🇧 English Only</option>
                  </select>
                  <select id="mod28-speed-select" class="px-2 py-1.5 rounded-xl border border-zinc-700 bg-zinc-900 text-[11px] font-bold text-zinc-200">
                    <option value="0.75"${snap.playbackRate === 0.75 ? ' selected' : ''}>0.75x</option>
                    <option value="1"${snap.playbackRate === 1 ? ' selected' : ''}>1.0x</option>
                    <option value="1.25"${snap.playbackRate === 1.25 ? ' selected' : ''}>1.25x</option>
                    <option value="1.5"${snap.playbackRate === 1.5 ? ' selected' : ''}>1.5x</option>
                  </select>
                  <button type="button" id="mod28-btn-toggle-subs" class="px-2.5 py-1.5 rounded-xl border border-teal-500/40 bg-teal-500/15 text-teal-300 font-bold text-[11px]">
                    ${snap.subtitlesVisible ? '💬 Phụ đề: BẬT' : '💬 Phụ đề: TẮT'}
                  </button>
                  <button type="button" id="mod28-btn-toggle-chime" class="px-2.5 py-1.5 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-300 font-bold text-[11px]">
                    ${this.player.chimeSynth.enabled ? '🔔 Chuông chuyển: BẬT' : '🔕 Chuông chuyển: TẮT'}
                  </button>
                </div>
              </div>
              <div class="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-zinc-800/80">
                <div class="flex items-center gap-1.5 flex-wrap flex-1 min-w-[200px]">
                  <select id="mod33-voice-select" title="Chọn giọng đọc Neural/hệ thống mượt nhất" class="flex-1 min-w-[170px] max-w-[300px] px-2.5 py-1 rounded-lg border border-zinc-700 bg-zinc-900 text-[10.5px] font-semibold text-zinc-200"></select>
                  <button type="button" id="mod33-btn-test-voice" class="px-2.5 py-1 rounded-lg border border-pink-500/45 bg-pink-500/15 hover:bg-pink-500/25 text-pink-200 font-bold text-[10.5px] transition">
                    🎙️ Nghe thử giọng
                  </button>
                </div>
                <span id="mod33-voice-quality-pill" class="text-[10px] font-semibold text-emerald-300 truncate max-w-full">
                  ✨ Đang tải bộ giọng Neural...
                </span>
              </div>
            </div>

            <!-- Hộp Phụ Đề Song Ngữ Lớn Dễ Đọc Cho Điện Thoại & Máy Tính -->
            <div class="p-3.5 rounded-2xl border border-teal-500/35 bg-teal-950/30 space-y-1.5">
              <div class="flex items-center justify-between text-[10px] font-extrabold uppercase text-teal-400">
                <span id="mod28-live-sub-speaker">${this.escapeHtmlSafe(curCue?.speaker || 'Bé Bi Hướng Dẫn')} • ${this.escapeHtmlSafe(curCue?.speakerEn || 'Bi Guide')}</span>
                <span id="mod28-live-chap-badge">${this.escapeHtmlSafe(curChap.badgeLabel)}</span>
              </div>
              <p id="mod28-live-sub-text" class="text-xs sm:text-sm font-semibold text-zinc-100 leading-relaxed">
                🇻🇳 ${this.escapeHtmlSafe(curCue?.text || curChap.summary)}
              </p>
              <p id="mod28-live-sub-text-en" class="text-[11px] sm:text-xs font-medium text-cyan-300 leading-relaxed">
                🇬🇧 ${this.escapeHtmlSafe(curCue?.textEn || '')}
              </p>
            </div>

            <!-- Các bước thao tác trọng tâm của phân đoạn đang phát -->
            <div class="p-3.5 rounded-2xl border border-studioLightBorder dark:border-zinc-800 bg-zinc-950/70 space-y-2">
              <div class="text-[11px] font-extrabold uppercase text-emerald-400">📌 Các Bước Thực Hành Trọng Tâm Trong Phân Đoạn Này:</div>
              <ul id="mod28-active-steps-list" class="space-y-1.5 text-[11px] text-zinc-300 list-disc pl-4">
                ${curChap.keyActionSteps.map((st) => `<li>${this.escapeHtmlSafe(st)}</li>`).join('')}
              </ul>
            </div>
          </div>

          <div class="lg:col-span-5 space-y-3 flex flex-col">
            <div class="p-3 rounded-2xl border border-studioLightBorder dark:border-zinc-800 bg-zinc-950/70 space-y-2">
              <div class="font-extrabold uppercase text-[11px] text-amber-400">📑 8 Mốc Chức Năng & Tab (Chạm Để Tua Tới Đúng Chỗ)</div>
              <div class="space-y-1.5 max-h-56 overflow-y-auto pr-1">${chaptersListHtml}</div>
            </div>

            <div class="p-3 rounded-2xl border border-studioLightBorder dark:border-zinc-800 bg-zinc-950/70 space-y-2 flex-1 flex flex-col">
              <div class="flex items-center justify-between gap-2">
                <span class="font-extrabold uppercase text-[11px] text-indigo-400">📜 Phụ Đề Song Ngữ (VI & EN)</span>
                <input id="mod28-transcript-search" type="text" value="${this.escapeHtmlSafe(this.transcriptFilterText)}" placeholder="Tìm câu phụ đề..." class="px-2.5 py-1 rounded-lg border border-zinc-700 bg-zinc-900 text-[11px] w-40 focus:outline-none focus:border-emerald-500" />
              </div>
              <div id="mod28-transcript-list" class="space-y-1.5 max-h-60 overflow-y-auto pr-1">${transcriptHtml}</div>
            </div>
          </div>
        </div>
      `;
    }

    buildChangelogTabHtml() {
      return `
        <div class="space-y-4">
          <div class="p-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/25">
            <div class="text-sm font-extrabold text-emerald-400">🚀 Tổng Kết Đại Tu Hệ Thống Noir Studio v38.0 (30 Module Thuần Khiết)</div>
            <p class="text-zinc-300 mt-1 text-xs">
              Toàn bộ ứng dụng đã được chuẩn hóa về 1 tệp HTML thống nhất cùng 30 module JavaScript tách biệt trách nhiệm, loại bỏ triệt để xung đột DOM/sự kiện và tối ưu cho cả máy tính lẫn điện thoại.
            </p>
          </div>
          ${SYSTEM_CHANGELOG_V38.map((release) => {
            const borderCls =
              release.badgeTone === 'emerald'
                ? 'border-emerald-500/40'
                : release.badgeTone === 'indigo'
                  ? 'border-indigo-500/40'
                  : 'border-amber-500/40';
            return `
              <div class="p-4 rounded-2xl border ${borderCls} bg-zinc-950/80 space-y-2.5">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <h4 class="font-extrabold text-sm text-white">${this.escapeHtmlSafe(release.version)}</h4>
                  <span class="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-bold">${this.escapeHtmlSafe(release.dateLabel)}</span>
                </div>
                <ul class="space-y-1.5 text-xs text-zinc-300 list-disc pl-5">
                  ${release.highlights.map((h) => `<li>${this.escapeHtmlSafe(h)}</li>`).join('')}
                </ul>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    buildModelStrategyTabHtml() {
      const router = NS.geminiRouter;
      const activeId = router?.selectedModelId || NS.state?.selectedModelId || 'gemini-3.8-flash';
      const thinkingLabel = router?.getThinkingLevelLabel?.() || 'Trung bình (Cân bằng)';
      const liveList = router?.liveProbe?.getCachedOrLiveModels?.() || [];
      return `
        <div class="space-y-4">
          <div class="p-4 rounded-2xl border border-sky-500/40 bg-sky-950/20 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div class="text-sm font-extrabold text-sky-300">🤖 Mô Hình Kích Hoạt: <span class="font-monoCode text-white">${this.escapeHtmlSafe(activeId)}</span> · 🧠 Tư duy: <span class="text-cyan-300">${this.escapeHtmlSafe(thinkingLabel)}</span></div>
              <p class="text-xs text-zinc-400 mt-1">
                API Key liên kết đồng bộ thời gian thực tại cả Trung tâm AI, Chat Bi Số 8, Mode 5 và tự động phát hiện ${liveList.length} điểm cuối live trên tài khoản của bạn.
              </p>
              <div class="flex flex-wrap items-center gap-3 mt-2 text-[11px]">
                <a href="https://ai.google.dev/gemini-api/docs/models" target="_blank" rel="noopener noreferrer" class="underline text-sky-300 hover:text-sky-200 font-bold">🌐 Danh sách Model Gemini Live ↗</a>
                <a href="https://aistudio.google.com/rate-limit" target="_blank" rel="noopener noreferrer" class="underline text-emerald-300 hover:text-emerald-200 font-bold">📊 Kiểm tra Hạn mức AI Studio ↗</a>
                <a href="https://gemini.google.com/" target="_blank" rel="noopener noreferrer" class="underline text-indigo-300 hover:text-indigo-200 font-bold">💬 Mở Gemini Web (Khi cần dự phòng) ↗</a>
              </div>
            </div>
            <button type="button" id="mod28-btn-open-apikey-vault" class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow">
              🔑 Kiểm Tra API Key Ngay
            </button>
          </div>
          <div class="grid grid-cols-1 gap-3">
            ${UP_TO_DATE_MODEL_STRATEGY_GUIDE.map((item) => `
              <div class="p-4 rounded-2xl border ${item.toneClass} space-y-2">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <span class="font-extrabold text-xs">${this.escapeHtmlSafe(item.tier)}</span>
                  <span class="px-2 py-0.5 rounded-full bg-black/40 font-monoCode text-[10px] font-bold">${this.escapeHtmlSafe(item.badge)}</span>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  ${item.models.map((m) => `<span class="px-2.5 py-1 rounded-lg bg-black/50 border border-white/10 font-monoCode text-[11px] font-bold">${this.escapeHtmlSafe(m)}</span>`).join('')}
                </div>
                <p class="text-xs text-zinc-200 leading-relaxed">${this.escapeHtmlSafe(item.advice)}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    buildShortcutsAndTipsTabHtml() {
      return `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 rounded-2xl border border-zinc-800 bg-zinc-950/80 space-y-3">
            <h4 class="font-extrabold text-sm text-emerald-400">⌨️ Bảng Phím Tắt Nhanh Trên Máy Tính</h4>
            <div class="space-y-2">
              ${STUDIO_SHORTCUTS_CHEATSHEET.map((sc) => `
                <div class="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800">
                  <kbd class="px-2 py-1 rounded-lg bg-zinc-950 border border-emerald-500/40 text-emerald-300 font-monoCode font-bold text-[11px] shrink-0">${this.escapeHtmlSafe(sc.keys)}</kbd>
                  <span class="text-xs text-zinc-300 text-right">${this.escapeHtmlSafe(sc.action)}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="p-4 rounded-2xl border border-zinc-800 bg-zinc-950/80 space-y-3">
            <h4 class="font-extrabold text-sm text-amber-400">📱 Mẹo Viết Nhanh Trên Điện Thoại & PWA</h4>
            <ul class="space-y-2 text-xs text-zinc-300 list-disc pl-4 leading-relaxed">
              <li><strong>Cài thành App độc lập:</strong> Trên Chrome (Android) hoặc Safari (iPhone), chọn <em>Thêm vào Màn hình chính</em> để ẩn thanh địa chỉ và mở toàn màn hình như ứng dụng thật.</li>
              <li><strong>Thanh chèn ký tự nhanh:</strong> Ngay dưới ô soạn thảo trên điện thoại có sẵn các nút chèn ngoặc thoại <code>「 」</code>, dấu lửng <code>…</code>, gạch nối <code>——</code> và dấu ngắt cảnh <code>***</code> bằng 1 chạm.</li>
              <li><strong>Khôi phục phòng sự cố:</strong> Trước khi đóng tab trên điện thoại, chạm nút Lưu hoặc để chế độ Auto-Save 3 tầng ghi tự động vào IndexedDB & Kho Phiên Bản Tab 6.</li>
            </ul>
          </div>
        </div>
      `;
    }

    bindRenderedTabControls(containerEl) {
      containerEl.querySelectorAll('.mod28-tut-tab-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const targetTab = btn.getAttribute('data-tut-tab') || 'VIDEO';
          this.switchSubTab(targetTab);
        });
      });

      const canvasEl = document.getElementById('mod28-tutorial-canvas');
      if (canvasEl) {
        canvasEl.addEventListener('click', () => this.player.togglePlayPause());
      }

      const playPauseBtn = document.getElementById('mod28-btn-play-pause');
      if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => this.player.togglePlayPause());
      }

      const prevBtn = document.getElementById('mod28-btn-prev-chap');
      if (prevBtn) {
        prevBtn.addEventListener('click', () => this.player.stepChapter(-1));
      }

      const nextBtn = document.getElementById('mod28-btn-next-chap');
      if (nextBtn) {
        nextBtn.addEventListener('click', () => this.player.stepChapter(1));
      }

      const sliderEl = document.getElementById('mod28-seek-slider');
      if (sliderEl) {
        sliderEl.addEventListener('input', () => {
          this.player.seekToSeconds(parseFloat(sliderEl.value) || 0, false);
        });
      }

      const speedEl = document.getElementById('mod28-speed-select');
      if (speedEl) {
        speedEl.addEventListener('change', () => {
          this.player.setPlaybackRate(parseFloat(speedEl.value) || 1);
        });
      }

      const subsToggleBtn = document.getElementById('mod28-btn-toggle-subs');
      if (subsToggleBtn) {
        subsToggleBtn.addEventListener('click', () => {
          const on = this.player.toggleSubtitlesVisible();
          subsToggleBtn.textContent = on ? '💬 Phụ đề: BẬT' : '💬 Phụ đề: TẮT';
        });
      }

      const chimeBtn = document.getElementById('mod28-btn-toggle-chime');
      if (chimeBtn) {
        chimeBtn.addEventListener('click', () => {
          const next = !this.player.chimeSynth.enabled;
          this.player.chimeSynth.setEnabled(next);
          chimeBtn.textContent = next ? '🔔 Chuông chuyển: BẬT' : '🔕 Chuông chuyển: TẮT';
        });
      }

      const voiceToggleBtn = document.getElementById('mod28-btn-toggle-voice');
      if (voiceToggleBtn) {
        voiceToggleBtn.addEventListener('click', () => {
          const next = this.player.voiceNarrator.setEnabled(!this.player.voiceNarrator.enabled);
          voiceToggleBtn.textContent = next ? '🎙️ Giọng đọc AI Cute: BẬT' : '🔇 Giọng đọc AI Cute: TẮT';
          voiceToggleBtn.classList.toggle('border-pink-500/60', next);
          voiceToggleBtn.classList.toggle('bg-pink-500/20', next);
          voiceToggleBtn.classList.toggle('text-pink-200', next);
          if (next && this.player.isPlaying) {
            this.player.voiceNarrator.speakCueIfNeeded(this.player.getCurrentSubtitleCue(), true);
          }
          this.player.renderCurrentFrame();
        });
      }

      const voiceLangSel = document.getElementById('mod28-voice-lang-select');
      if (voiceLangSel) {
        voiceLangSel.addEventListener('change', () => {
          this.player.voiceNarrator.setLanguage(voiceLangSel.value);
          globalScope.NoirStudio?.neuralVoice?.syncVoicePickerUI?.(voiceLangSel.value);
          if (this.player.voiceNarrator.enabled && this.player.isPlaying) {
            this.player.voiceNarrator.speakCueIfNeeded(this.player.getCurrentSubtitleCue(), true);
          }
          this.player.renderCurrentFrame();
        });
      }

      const mod33VoiceSel = document.getElementById('mod33-voice-select');
      if (mod33VoiceSel) {
        mod33VoiceSel.addEventListener('change', () => {
          const lang = document.getElementById('mod28-voice-lang-select')?.value || 'vi-VN';
          globalScope.NoirStudio?.neuralVoice?.setPreferredVoice?.(lang, mod33VoiceSel.value);
          globalScope.NoirStudio?.neuralVoice?.syncVoicePickerUI?.(lang);
        });
      }

      const mod33TestVoiceBtn = document.getElementById('mod33-btn-test-voice');
      if (mod33TestVoiceBtn) {
        mod33TestVoiceBtn.addEventListener('click', () => {
          const lang = document.getElementById('mod28-voice-lang-select')?.value || 'vi-VN';
          const sample =
            lang === 'en-US'
              ? 'Hello author Bi! Welcome to Noir Studio, where your live Light Novel interface guides every step smoothly.'
              : 'Xin chào tác giả Bi! Video hướng dẫn nay chiếu trực tiếp giao diện thật của Studio với giọng đọc tự nhiên.';
          globalScope.NoirStudio?.neuralVoice?.speakText?.(sample, lang, {
            rate: this.player.playbackRate || 0.98,
            pitch: 1.0,
          });
        });
      }

      const mod33MirrorToggleBtn = document.getElementById('mod33-btn-toggle-mirror-mode');
      if (mod33MirrorToggleBtn) {
        mod33MirrorToggleBtn.addEventListener('click', () => {
          const domMirror = globalScope.NoirStudio?.liveDomVideoMirror;
          if (!domMirror) return;
          const next = domMirror.setEnabled(!domMirror.enabled);
          mod33MirrorToggleBtn.textContent = next ? '🖥️ Web Thật: BẬT' : '🎨 Sơ đồ: BẬT';
          this.player.renderCurrentFrame();
        });
      }

      const subLangSel = document.getElementById('mod28-sub-lang-select');
      if (subLangSel) {
        subLangSel.addEventListener('change', () => {
          this.player.setSubtitleLangMode(subLangSel.value);
        });
      }

      containerEl.querySelectorAll('.mod28-chapter-jump-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const cid = btn.getAttribute('data-tut-chapter');
          if (cid) this.player.jumpToChapterById(cid, true);
        });
      });

      containerEl.querySelectorAll('.mod28-subtitle-cue-btn, .mod28-feature-marker-chip, .mod28-timeline-seg').forEach((btn) => {
        btn.addEventListener('click', () => {
          const sec = parseFloat(btn.getAttribute('data-tut-seek') || '0');
          this.player.seekToSeconds(sec + 0.05, true);
        });
      });

      const searchInput = document.getElementById('mod28-transcript-search');
      if (searchInput) {
        searchInput.addEventListener('input', () => {
          this.transcriptFilterText = searchInput.value || '';
          const listEl = document.getElementById('mod28-transcript-list');
          if (!listEl) return;
          const q = this.transcriptFilterText.trim().toLowerCase();
          const curCue = this.player.getCurrentSubtitleCue();
          const matches = SYNCHRONIZED_SUBTITLE_TRACK_V38.filter(
            (c) =>
              !q ||
              c.text.toLowerCase().includes(q) ||
              (c.textEn || '').toLowerCase().includes(q) ||
              c.speaker.toLowerCase().includes(q)
          );
          listEl.innerHTML = matches
            .map((cue) => {
              const hot = curCue && cue.id === curCue.id;
              return `
                <button type="button" data-tut-seek="${cue.startSec}" class="mod28-subtitle-cue-btn w-full text-left p-2 rounded-lg border transition flex items-start gap-2.5 ${
                  hot ? 'border-emerald-500 bg-emerald-500/15 text-white' : 'border-zinc-800/80 bg-zinc-950/50 hover:bg-zinc-900 text-zinc-300'
                }">
                  <span class="font-monoCode text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-emerald-400 shrink-0">${this.player.formatSecToMmSs(cue.startSec)}</span>
                  <div class="min-w-0 space-y-0.5">
                    <div class="text-[10px] font-bold text-teal-400">${this.escapeHtmlSafe(cue.speaker)} / ${this.escapeHtmlSafe(cue.speakerEn || 'Guide')}</div>
                    <div class="text-[11px] leading-snug text-zinc-100">🇻🇳 ${this.escapeHtmlSafe(cue.text)}</div>
                    <div class="text-[10px] leading-snug text-cyan-300/90">🇬🇧 ${this.escapeHtmlSafe(cue.textEn || '')}</div>
                  </div>
                </button>
              `;
            })
            .join('');
          listEl.querySelectorAll('.mod28-subtitle-cue-btn').forEach((subBtn) => {
            subBtn.addEventListener('click', () => {
              const sec = parseFloat(subBtn.getAttribute('data-tut-seek') || '0');
              this.player.seekToSeconds(sec + 0.05, true);
            });
          });
        });
      }

      const openVaultBtn = document.getElementById('mod28-btn-open-apikey-vault');
      if (openVaultBtn) {
        openVaultBtn.addEventListener('click', () => {
          this.closeModal();
          document.getElementById('btn-s6-card-apikey')?.click();
        });
      }
    }

    syncLivePlayerDom(snap) {
      if (!snap || this.activeSubTab !== 'VIDEO') return;
      const curTimeEl = document.getElementById('mod28-time-current');
      const sliderEl = document.getElementById('mod28-seek-slider');
      const playPauseBtn = document.getElementById('mod28-btn-play-pause');
      const subTextEl = document.getElementById('mod28-live-sub-text');
      const subTextEnEl = document.getElementById('mod28-live-sub-text-en');
      const subSpeakerEl = document.getElementById('mod28-live-sub-speaker');
      const chapBadgeEl = document.getElementById('mod28-live-chap-badge');
      const stepsEl = document.getElementById('mod28-active-steps-list');

      if (curTimeEl) curTimeEl.textContent = this.player.formatSecToMmSs(snap.currentTimeSec);
      if (sliderEl) sliderEl.value = String(snap.currentTimeSec);
      if (playPauseBtn) playPauseBtn.textContent = snap.isPlaying ? '⏸ Tạm dừng' : '▶ Phát Video';
      if (subTextEl && snap.cue) {
        subTextEl.textContent = `🇻🇳 ${snap.cue.text}`;
        subTextEl.classList.toggle('hidden', this.player.subtitleLangMode === 'EN');
      }
      if (subTextEnEl && snap.cue) {
        subTextEnEl.textContent = `🇬🇧 ${snap.cue.textEn || ''}`;
        subTextEnEl.classList.toggle('hidden', this.player.subtitleLangMode === 'VI');
      }
      if (subSpeakerEl && snap.cue) {
        subSpeakerEl.textContent = `${snap.cue.speaker} • ${snap.cue.speakerEn || 'Bi Guide'}`;
      }
      if (chapBadgeEl && snap.chapter) chapBadgeEl.textContent = snap.chapter.badgeLabel;

      if (stepsEl && snap.chapter && stepsEl.dataset.renderedChapterId !== snap.chapter.id) {
        stepsEl.dataset.renderedChapterId = snap.chapter.id;
        stepsEl.innerHTML = snap.chapter.keyActionSteps
          .map((st) => `<li>${this.escapeHtmlSafe(st)}</li>`)
          .join('');
      }

      document.querySelectorAll('.mod28-chapter-jump-btn').forEach((btn) => {
        const cid = btn.getAttribute('data-tut-chapter');
        const active = snap.chapter && cid === snap.chapter.id;
        btn.classList.toggle('border-emerald-500/70', Boolean(active));
        btn.classList.toggle('bg-emerald-500/15', Boolean(active));
      });
    }
  }

  const tutorialController = new TutorialAndChangelogController();

  NS.TUTORIAL_CHAPTERS_V38 = VIDEO_TUTORIAL_CHAPTERS_DATA;
  NS.TUTORIAL_SUBTITLES_V38 = SYNCHRONIZED_SUBTITLE_TRACK_V38;
  NS.CHANGELOG_ENTRIES_V38 = SYSTEM_CHANGELOG_V38;
  NS.MODEL_STRATEGY_GUIDE_V38 = UP_TO_DATE_MODEL_STRATEGY_GUIDE;
  NS.SHORTCUTS_CHEATSHEET_V38 = STUDIO_SHORTCUTS_CHEATSHEET;
  NS.AnimatedCanvasTutorialPlayer = AnimatedCanvasTutorialPlayer;
  NS.TutorialAndChangelogController = TutorialAndChangelogController;
  NS.tutorialAndChangelog = tutorialController;

  if (typeof NS.registerModule === 'function') {
    NS.registerModule('mod28', tutorialController);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        if (!tutorialController.hasInitialized) tutorialController.init();
      });
    } else {
      tutorialController.init();
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
