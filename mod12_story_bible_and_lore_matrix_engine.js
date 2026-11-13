/**
 * ============================================================================
 * ✍️ WEB VIẾT TIỂU THUYẾT CỦA BI — MODULE 12 (v38.0 SUPREME EDITION)
 * ============================================================================
 * Tệp: mod12_story_bible_and_lore_matrix_engine.js
 * Chức năng chính:
 *   1. Hệ thống Quản trị Story Bible Chính Thức & Khung Cấu Trúc Mẫu (Template
 *      Frame) tại Tab 4 (StoryBibleAndLoreMatrixEngine — window.NoirStudio.storyBible).
 *   2. Kho Mẫu Story Bible Chuyên Sâu theo 6 Thể loại lớn:
 *      - Light Novel (Fantasy / Học Viện / Dị Giới)
 *      - Trinh Thám — Tâm Lý Noir
 *      - Tiên Hiệp — Tu Chân Cổ Điển
 *      - Đô Thị — Tâm Lý & Thương Trường
 *      - Huyền Huyễn — Cổ Đại Phương Đông
 *      - Khoa Huyễn — Cyberpunk / Hậu Tận Thế
 *   3. Hồ Sơ Nhân Vật Đa Chiều, Thư viện Hình mẫu Tâm lý (Archetypes), Ma trận
 *      Quan hệ & Quy tắc Xưng hô Tiếng Việt chuẩn xác, đồng bộ trực tiếp với
 *      thanh Chèn Thoại Nhanh (#quick-character-chips-bar) tại Bàn viết Tab 1.
 *   4. Ma Trận Bất Đối Xứng "Ai Biết Gì" (Asymmetric Knowledge Matrix) giúp
 *      ngăn chặn triệt để lỗi AI để nhân vật nói/nghĩ về bí mật chưa được tiết lộ.
 *   5. Sổ Cái Phục Bút & Manh Mối (Chekhov's Gun Ledger) theo dõi trạng thái
 *      Gieo manh mối (PLANTED) ➔ Bồi đắp ➔ Thu hồi (RESOLVED).
 *   6. Danh Sách Từ Sáo Rỗng Cấm AI Sử Dụng (Anti-Cliché Blacklist) & Biên dịch
 *      100% toàn bộ dữ liệu thành Khối Ngữ Cảnh Story Bible chuẩn mực nạp vào
 *      Prompt Tổng Hợp Chính Thức (buildCompiledBibleBlockForPrompt).
 * ============================================================================
 */
(function () {
  'use strict';

  if (window.__NOIR_MOD12_STORY_BIBLE_LOADED__) return;
  window.__NOIR_MOD12_STORY_BIBLE_LOADED__ = true;

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
  // PHẦN 1: KHO MẪU KHUNG CẤU TRÚC STORY BIBLE THEO 6 THỂ LOẠI TIỂU THUYẾT
  // ==========================================================================
  const STORY_BIBLE_GENRE_PRESETS = {
    DEFAULT_UNIVERSAL: {
      id: 'DEFAULT_UNIVERSAL',
      label: '🏛️ Khung Chuẩn Đa Năng (Light Novel / Tiểu Thuyết Hiện Đại)',
      badge: 'Mặc định chuẩn',
      templateText: [
        '=== [I. BỐI CẢNH THẾ GIỚI & QUY TẮC BẤT KHẢ XÂM PHẠM] ===',
        '- Thời đại & Không gian chính: Thành phố cảng sương mù những năm 2020, nơi giao thoa giữa những khu phố cổ trầm mặc và các tòa tháp tài chính hiện đại.',
        '- Hệ thống quy luật cốt lõi: Mọi sự kiện đều tuân theo logic tâm lý và nhân quả thực tế; không có phép màu giải cứu vô lý (No Deus Ex Machina).',
        '- Những điều tuyệt đối không được mâu thuẫn: Trình tự ngày giờ giữa các chương, vết thương thể chất của nhân vật, và giới hạn thông tin mỗi người nắm giữ.',
        '',
        '=== [II. HỒ SƠ NHÂN VẬT TRUNG TÂM & GIỌNG ĐIỆU ĐỐI THOẠI] ===',
        '- Nhân vật chính (Tính cách, mục tiêu, vết thương tâm lý, thói quen ăn nói): Điềm tĩnh, quan sát sắc bén từng cử chỉ nhỏ của người đối diện, câu thoại ngắn gọn nhưng giàu ẩn ý.',
        '- Các nhân vật phụ quan trọng & Mạng lưới quan hệ: Đồng sự, đối thủ ngầm, người nắm giữ ký ức quá khứ.',
        '- Quy ước định dạng câu thoại bắt buộc: Luôn viết theo chuẩn "- Câu nói của nhân vật (Tên nhân vật)".',
        '',
        '=== [III. TÓM TẮT DIỄN BIẾN CÁC CHƯƠNG ĐÃ DUYỆT] ===',
        '- Trục sự kiện đã xảy ra: Khởi đầu từ cuộc gặp gỡ định mệnh trong đêm mưa, phát hiện manh mối đầu tiên dẫn tới chuỗi bí mật bị chôn vùi.',
        '',
        '=== [IV. PHỤC BÚT ĐANG GIEO & BÍ MẬT CHƯA TIẾT LỘ] ===',
        '- Các manh mối đang chờ thu hồi: Chiếc đồng hồ quả quýt ngừng chạy lúc 23:15; bức thư không đề tên người gửi.',
        '- Định hướng cao trào sắp tới: Cuộc đối chất trực diện tại tầng thượng khi bức màn sự thật dần hé mở.'
      ].join('\n'),
      sampleAntiCliche: [
        'một luồng điện chạy dọc sống lưng',
        'thở dài một tiếng',
        'ánh mắt phức tạp',
        'khẽ nhếch môi tạo thành một vòng cung',
        'không khỏi cảm thán trong lòng',
        'trong lòng dâng lên một cảm giác khó tả',
        'bầu không khí bỗng trở nên tĩnh lặng đến đáng sợ',
        'nụ cười nửa miệng đầy ẩn ý'
      ]
    },

    LIGHT_NOVEL_FANTASY: {
      id: 'LIGHT_NOVEL_FANTASY',
      label: '⚔️ Light Novel — Học Viện Giả Tưởng & Dị Giới (Fantasy / Isekai)',
      badge: 'Light Novel',
      templateText: [
        '=== [I. THẾ GIỚI QUAN, ĐỊA LÝ & HỆ THỐNG MA THUẬT / KỸ NĂNG] ===',
        '- Đại lục & Quốc gia trung tâm: Đế quốc Aethelgard và Học viện Thánh Kiếm Hoàng Gia tọa lạc trên đảo nổi giữa hồ Thiên Kính.',
        '- Nguồn gốc & Cấp bậc Sức mạnh: Hệ thống Ma Mạch 7 Tầng (Khởi Nguyên ➔ Cộng Hưởng ➔ Kết Tinh ➔ Linh Hồn ➔ Vực Sâu ➔ Thánh Vực ➔ Thần Thoại).',
        '- Cái giá của Sức mạnh (Giới hạn bắt buộc): Mỗi lần thi triển ma pháp vượt cấp sẽ làm đóng băng một phần xúc cảm hoặc hao tổn tuổi thọ; tuyệt đối không được dùng kỹ năng tối thượng liên tục mà không chịu phản phệ.',
        '',
        '=== [II. DÀN NHÂN VẬT CHÍNH & ĐẶC TRƯNG TƯƠNG TÁC LIGHT NOVEL] ===',
        '- Nam/Nữ chính (Tính cách, năng lực ẩn giấu, thói quen đời thường): Bề ngoài tỏ ra lười biếng, thích ngồi góc thư viện đọc sách cổ, nhưng thực chất là người duy nhất giải mã được Cổ Ngữ Thất Lạc.',
        '- Đồng đội / Nữ chính đồng hành: Kiếm sĩ thiên tài kiêu hãnh nhưng vụng về trong giao tiếp đời thường; Pháp sư giả kim tinh quái.',
        '- Quy tắc Xưng hô & Hội thoại: Giữ nhịp đối thoại tung hứng tự nhiên, giàu hình ảnh biểu cảm (Show, Don\'t Tell), định dạng "- Câu thoại (Tên nhân vật)".',
        '',
        '=== [III. NHẬT KÝ HÀNH TRÌNH & CÁC ARC CỐT TRUYỆN ĐÃ QUA] ===',
        '- Arc 1 (Khởi đầu): Kỳ thi tuyển sinh đẫm máu dưới Mê Cung Ngầm và sự thức tỉnh của Di Vật Cổ Đại.',
        '- Những thay đổi về trang bị / cấp độ hiện tại của nhóm nhân vật chính.',
        '',
        '=== [IV. BÍ MẬT THẾ GIỚI & PHỤC BÚT ĐANG CÀI CẮM] ===',
        '- Chân tướng về cuộc Đại Chiến Trăm Năm Trước bị giáo hội viết lại lịch sử.',
        '- Ấn ký kỳ lạ trên mu bàn tay trái của nhân vật chính chỉ phát sáng khi tới gần di tích cổ.'
      ].join('\n'),
      sampleAntiCliche: [
        'sát khí nồng đậm đến mức thực chất hóa',
        'hít vào một ngụm khí lạnh',
        'cằm muốn rớt xuống đất',
        'ánh mắt lóe lên tia sáng sắc lạnh',
        'một luồng sức mạnh hủy thiên diệt địa',
        'khẽ nhếch môi tạo thành một vòng cung'
      ]
    },

    TRINH_THAM_TAM_LY_NOIR: {
      id: 'TRINH_THAM_TAM_LY_NOIR',
      label: '🕵️ Trinh Thám — Tâm Lý Tội Phạm & Đấu Trí Noir',
      badge: 'Trinh Thám Noir',
      templateText: [
        '=== [I. BỐI CẢNH KHÔNG GIAN, THỜI GIAN & LUẬT TRINH THÁM CÔNG BẰNG] ===',
        '- Không gian vụ án: Biệt thự cổ biệt lập trên đồi sương mù / Khu chung cư cũ kỹ ngập trong mưa đêm tháng Mười Một.',
        '- Khung thời gian nghiệm尸 & Bằng chứng ngoại phạm (Alibi): Mọi mốc giờ đều phải khớp chính xác từng phút từ 21:00 đến 03:00 sáng.',
        '- Luật Công Bằng Trinh Thám (Knox\'s Decalogue): Mọi manh mối suy luận ra hung thủ đều phải được mô tả tinh tế trước mắt độc giả trước khi phá án; cấm tuyệt đối việc hung thủ là nhân vật chưa từng xuất hiện.',
        '',
        '=== [II. HỒ SƠ ĐIỀU TRA VIÊN & CÁC NGHI PHẠM TRỌNG ĐIỂM] ===',
        '- Điều tra viên / Nhân vật chính: Sắc sảo, mắc chứng mất ngủ kinh niên, luôn chú ý tới những vết xước trên giày, mùi khói thuốc và nhịp chớp mắt khi người khác nói dối.',
        '- Danh sách Nghi phạm (Động cơ, Cơ hội, Điểm khuất tất):',
        '  1. Nghi phạm A: Có mặt tại hiện trường lúc 22:30 nhưng khai báo gian dối.',
        '  2. Nghi phạm B: Nắm giữ di chúc / tài liệu mật liên quan tới nạn nhân.',
        '',
        '=== [III. BIÊN BẢN HIỆN TRƯỜNG & DIỄN BIẾN ĐIỀU TRA ĐÃ DUYỆT] ===',
        '- Các vật chứng đã thu thập hợp lệ.',
        '- Các lời khai đã được kiểm chứng và những điểm mâu thuẫn đang chờ bóc trần.',
        '',
        '=== [IV. MANH MỐI THẬT VS CÁ TRÍCH ĐỎ (RED HERRING)] ===',
        '- Manh mối đánh lạc hướng (Red Herring): Vết máu trên rèm cửa thực chất được tạo ra sau khi nạn nhân đã tử vong.',
        '- Chìa khóa phá án thật sự: Nhiệt độ tách trà trên bàn và chiếc đồng hồ đeo tay bị chỉnh lệch 15 phút.'
      ].join('\n'),
      sampleAntiCliche: [
        'một luồng điện chạy dọc sống lưng',
        'bầu không khí bỗng trở nên tĩnh lặng đến đáng sợ',
        'ánh mắt sắc như dao cạo',
        'nụ cười nửa miệng đầy ẩn ý',
        'trực giác mách bảo rằng',
        'không khí đặc quánh lại'
      ]
    },

    TIEN_HIEP_CO_DIEN: {
      id: 'TIEN_HIEP_CO_DIEN',
      label: '🏔️ Tiên Hiệp — Tu Chân Cổ Điển & Đại Đạo Tranh Phong',
      badge: 'Tiên Hiệp',
      templateText: [
        '=== [I. CẢNH GIỚI TU HÀNH, THIÊN ĐỊA QUY TẮC & ĐỊA ĐỒ TU CHÂN GIỚI] ===',
        '- Hệ thống Cảnh giới: Luyện Khí ➔ Trúc Cơ ➔ Kim Đan ➔ Nguyên Anh ➔ Hóa Thần ➔ Luyện Hư ➔ Hợp Thể ➔ Đại Thừa ➔ Độ Kiếp.',
        '- Quy luật Thiên Đạo & Tâm Ma: Tu hành không chỉ là tích lũy linh lực mà là quá trình minh ngộ bản tâm; kẻ sát phạt vô độ tất sinh Tâm Ma khi độ kiếp.',
        '- Thế lực & Tông môn: Cửu Đại Tiên Môn vùng Trung Châu, Yêu Tộc Bắc Hoang, và các Cổ Tộc ẩn thế.',
        '',
        '=== [II. ĐẠO TÂM NHÂN VẬT CHÍNH & QUY TẮC NGÔN TỪ CỔ PHONG] ===',
        '- Nhân vật chính (Đạo tâm, Công pháp, Pháp bảo bản mệnh): Xuất thân bình phàm nơi sơn thôn, tính tình kiên nghị, trọng tình nghĩa nhưng quyết đoán trước kẻ thù.',
        '- Pháp bảo & Linh vật đang sở hữu (Ghi rõ công năng và hạn chế để không bị "buff" quá đà).',
        '- Giọng văn & Xưng hô: Điềm đạm, mang âm hưởng cổ điển trang nhã (xưng "ta - đạo hữu / tiền bối / sư huynh"), tránh dùng từ ngữ hiện đại lạc quẻ.',
        '',
        '=== [III. TRỤC SỰ KIỆN TU HÀNH QUA CÁC CHƯƠNG ĐÃ DUYỆT] ===',
        '- Cảnh giới hiện tại, thương thế đang điều trị và số lượng linh thạch / đan dược còn lại.',
        '',
        '=== [IV. NHÂN QUẢ CHƯA LIỄU KẾT & BÍ CẢNH SẮP MỞ] ===',
        '- Ân oán với cố nhân từ thuở vi mạt.',
        '- Bí mật đằng sau mảnh ngọc giản tàn khuyết tìm thấy dưới đáy Hàn Đàm.'
      ].join('\n'),
      sampleAntiCliche: [
        'hít vào một ngụm khí lạnh',
        'khủng bố như斯',
        'một cỗ uy áp hủy thiên diệt địa',
        'nhếch miệng cười lạnh',
        'con kiến hôi mà cũng dám',
        'sát ý ngập trời'
      ]
    },

    DO_THI_THUONG_TRUONG: {
      id: 'DO_THI_THUONG_TRUONG',
      label: '🏙️ Đô Thị Hiện Đại — Tâm Lý Xã Hội & Đấu Trí Thương Trường',
      badge: 'Đô Thị',
      templateText: [
        '=== [I. BỐI CẢNH XÃ HỘI, KINH TẾ & QUY LUẬT THƯƠNG TRƯỜNG] ===',
        '- Không gian chính: Đô thị tài chính sầm uất, nơi các tập đoàn công nghệ và bất động sản cạnh tranh từng phần trăm cổ phần.',
        '- Quy tắc thực tế: Mọi kế hoạch thâu tóm, đầu tư, đàm phán đều phải tuân theo quy trình tài chính, pháp lý và tâm lý học hành vi hợp lý; không hạ thấp trí thông minh của đối thủ.',
        '',
        '=== [II. HỒ SƠ NHÂN VẬT, ĐỊA VỊ & PHONG THÁI GIAO TIẾP] ===',
        '- Nhân vật chính: Từng trải qua biến cố phá sản năm 25 tuổi, nay trở lại với tư duy chiến lược sắc lạnh, thấu hiểu lòng người, giữ khoảng cách lịch thiệp nhưng khó đoán.',
        '- Đối tác, Tri kỷ & Đối thủ cạnh tranh: Mỗi nhân vật đều có lợi ích riêng, gia cảnh riêng và điểm yếu tình cảm riêng.',
        '',
        '=== [III. TIẾN ĐỘ DỰ ÁN & DIỄN BIẾN CÁC CHƯƠNG ĐÃ DUYỆT] ===',
        '- Tình hình nguồn vốn, các hợp đồng đã ký và những cái bẫy tài chính đang giăng ra.',
        '',
        '=== [IV. QUÂN BÀI TẨY & BƯỚC NGOẶT TÂM LÝ] ===',
        '- Bản hợp đồng phụ lục chưa công bố.',
        '- Mối liên hệ thật sự giữa người cộng sự thân tín và tập đoàn đối thủ.'
      ].join('\n'),
      sampleAntiCliche: [
        'tổng tài bá đạo',
        'trong vòng ba phút tôi muốn có toàn bộ thông tin',
        'khẽ nhếch môi tạo thành một vòng cung',
        'ánh mắt phức tạp',
        'thở dài một tiếng',
        'bầu không khí bỗng trở nên tĩnh lặng đến đáng sợ'
      ]
    },

    HUYEN_HUYEN_KY_AO: {
      id: 'HUYEN_HUYEN_KY_AO',
      label: '🐉 Huyền Huyễn — Thần Thoại Phương Đông & Cổ Giới Bí Ẩn',
      badge: 'Huyền Huyễn',
      templateText: [
        '=== [I. KỶ NGUYÊN THẦN THOẠI, DỊ TƯỢNG & QUY LUẬT CỔ GIỚI] ===',
        '- Bối cảnh: Thế giới hậu Hoàng Hôn Chư Thần, khi tàn tích của các vị thần cổ đại hóa thành những vùng Cấm Khu sương mù vĩnh cửu.',
        '- Hệ thống Huyết Mạch & Cổ Tự: Con người thức tỉnh năng lực thông qua việc giải mã Thần Văn khắc trên xương cốt thượng cổ.',
        '',
        '=== [II. HỒ SƠ NHÂN VẬT & KHÍ CHẤT VĂN CHƯƠNG] ===',
        '- Nhân vật chính: Người gác đèn nơi biên ải Bắc Cảnh, mang trong người dòng máu lai giữa Phàm nhân và Cổ Thần đã tuyệt tích.',
        '- Giọng văn chủ đạo: Hùng tráng, giàu chất thơ bi tráng, miêu tả thiên nhiên hùng vĩ gắn liền với nỗi cô độc của con người.',
        '',
        '=== [III. BIÊN NIÊN SỬ HÀNH TRÌNH ĐÃ DUYỆT] ===',
        '- Các vùng đất đã đi qua, các thần vật đã thu thập và những lời thề sinh tử.',
        '',
        '=== [IV. LỜI TIÊN TRI CỔ ĐẠI & PHỤC BÚT CHƯA MỞ] ===',
        '- Tiếng chuông đồng vọng ra từ đáy biển mỗi đêm trăng máu.',
        '- Thân phận thật sự của thiếu nữ mù bán hoa giấy ở thành Trường An.'
      ].join('\n'),
      sampleAntiCliche: [
        'một luồng điện chạy dọc sống lưng',
        'hít vào một ngụm khí lạnh',
        'ánh mắt phức tạp',
        'không khỏi cảm thán trong lòng',
        'sát khí ngút trời'
      ]
    }
  };

  // ==========================================================================
  // PHẦN 2: THƯ VIỆN 12 HÌNH MẪU NHÂN VẬT VĂN HỌC (CHARACTER ARCHETYPES)
  // ==========================================================================
  const CHARACTER_ARCHETYPE_LIBRARY = [
    {
      id: 'ARCH_STRATEGIST',
      label: '♟️ Quân Sư Điềm Tĩnh / Kẻ Điều Khiển Sau Màn',
      role: 'Nhân vật chính / Quân sư trung tâm',
      traits:
        'Điềm tĩnh trước mọi biến cố, luôn tính trước ba bước, hiếm khi bộc lộ cảm xúc thật trên gương mặt, có thói quen gõ nhẹ ngón trỏ lên mặt bàn khi suy nghĩ.',
      speechStyle:
        'Câu văn ngắn gọn, lịch thiệp nhưng sắc bén, thường trả lời câu hỏi bằng một câu hỏi ngược lại; xưng "tôi - cậu" hoặc "tôi - anh/chị".',
      innerWound: 'Từng vì một quyết định quá lý trí trong quá khứ mà đánh mất người đồng đội thân thiết nhất.',
      defaultRelation: 'Giữ khoảng cách an toàn nhưng âm thầm bảo vệ người mình trân trọng'
    },
    {
      id: 'ARCH_DETECTIVE_NOIR',
      label: '🕵️ Thám Tử Trầm Mặc / Điều Tra Viên Ám Ảnh',
      role: 'Nhân vật chính (Trinh thám / Tâm lý)',
      traits:
        'Quan sát vi biểu cảm cực nhạy, mắc chứng mất ngủ, trí nhớ hình ảnh siêu phàm, bề ngoài có vẻ bất cần nhưng mang lòng trắc ẩn sâu sắc với kẻ yếu.',
      speechStyle:
        'Giọng trầm khàn, pha chút châm biếm nhẹ, đi thẳng vào trọng tâm sự thật; xưng "tôi - ông/bà/anh/cô".',
      innerWound: 'Vụ án đầu tiên trong sự nghiệp vẫn còn một mảnh ghép chưa được đưa ra ánh sáng.',
      defaultRelation: 'Hoài nghi mọi lời khai cho tới khi có vật chứng xác thực'
    },
    {
      id: 'ARCH_SWORD_PRODIGY',
      label: '⚔️ Kiếm Khách Cô Độc / Thiên Tài Lạnh Lùng',
      role: 'Đồng hành chủ lực / Đối thủ truyền kiếp',
      traits:
        'Kỷ luật thép, kiệm lời, chỉ tin vào lưỡi kiếm trong tay, nhưng lại bối rối trước những cử chỉ quan tâm đời thường.',
      speechStyle:
        'Cực kỳ ngắn gọn, hiếm khi nói quá hai câu liên tiếp, âm điệu dứt khoát; xưng "ta - ngươi" hoặc "tôi - cậu".',
      innerWound: 'Gánh vác trách nhiệm phục hưng gia tộc/tông môn đã suy tàn sau một đêm huyết chiến.',
      defaultRelation: 'Ngoài lạnh trong nóng, sẵn sàng chắn mũi kiếm cho đồng đội'
    },
    {
      id: 'ARCH_CHARMING_RIVAL',
      label: '🎭 Phản Diện Lịch Lãm / Đối Thủ Đấu Trí Xứng Tầm',
      role: 'Phản diện trung tâm / Đối trọng trí tuệ',
      traits:
        'Phong thái quý tộc, uyên bác, yêu nghệ thuật và âm nhạc cổ điển, không bao giờ nổi giận mất kiểm soát, coi cuộc đối đầu với nhân vật chính là một ván cờ nghệ thuật.',
      speechStyle:
        'Từ tốn, giàu triết lý và ẩn dụ, luôn mỉm cười lịch sự ngay cả khi đang dồn đối phương vào chân tường; xưng "tôi - ngài/bạn hiền".',
      innerWound: 'Tin rằng thế giới hiện tại đã mục nát và cần một trật tự mới dù phải đánh đổi bằng máu.',
      defaultRelation: 'Vừa là kẻ thù nguy hiểm nhất, vừa là người hiểu nhân vật chính sâu sắc nhất'
    },
    {
      id: 'ARCH_BRIGHT_COMPANION',
      label: '🌟 Đồng Đội Nhiệt Huyết / Ánh Dương Giữa Đêm Tối',
      role: 'Bạn đồng hành / Điểm tựa tinh thần',
      traits:
        'Tràn đầy năng lượng, trực giác nhạy bén, trung thành tuyệt đối, là sợi dây kéo nhân vật chính trở về với nhân tính khi đứng trước vực thẳm.',
      speechStyle:
        'Tự nhiên, sinh động, giàu cảm xúc, đôi khi nói nhanh khi hào hứng; xưng "tớ - cậu" hoặc "em - anh/chị".',
      innerWound: 'Che giấu nỗi sợ bị bỏ lại phía sau dưới nụ cười rạng rỡ thường trực.',
      defaultRelation: 'Tin tưởng nhân vật chính vô điều kiện'
    },
    {
      id: 'ARCH_MYSTERIOUS_MENTOR',
      label: '🕯️ Người Dẫn Đường Bí Ẩn / Tiền Bối Ẩn Thế',
      role: 'Sư phụ / Người nắm giữ bí mật cổ xưa',
      traits:
        'Thâm sâu khó lường, thường xuất hiện ở những quán trà nhỏ hoặc hiệu sách cũ, nắm giữ nửa sự thật về nguồn gốc thế giới.',
      speechStyle:
        'Điềm đạm, pha chút hài hước từng trải, hay gợi mở thay vì nói toạc đáp án; xưng "ta - con/tiểu hữu" hoặc "lão - cậu".',
      innerWound: 'Mang thương tích vĩnh viễn từ cuộc chiến của thế hệ trước.',
      defaultRelation: 'Dẫn dắt nhưng để nhân vật chính tự lựa chọn con đường của mình'
    },
    {
      id: 'ARCH_DOUBLE_AGENT',
      label: '🦊 Kẻ Hai Mặt / Người Cung Cấp Tình Báo Chợ Đen',
      role: 'Trung lập / Nhân vật bẻ lái cốt truyện',
      traits:
        'Linh hoạt, thực dụng, giỏi cải trang và thu thập tin tức, luôn đặt lợi ích lên bàn cân nhưng vẫn có một giới hạn đạo đức riêng không bao giờ bước qua.',
      speechStyle:
        'Khéo léo, nửa đùa nửa thật, hay dùng thành ngữ hoặc lối nói vòng vo; xưng "tôi - quý khách / người anh em".',
      innerWound: 'Không có quê hương hay chốn dung thân thực sự.',
      defaultRelation: 'Hợp tác theo giao kèo nhưng nhiều lần cứu nguy bất ngờ'
    },
    {
      id: 'ARCH_TRAGIC_HEIRESS',
      label: '❄️ Tiểu Thư Gia Tộc Suy Tàn / Nữ Chính Nội Tâm Sâu Sắc',
      role: 'Nữ chính / Nhân vật trung tâm mạch tình cảm & chính trị',
      traits:
        'Kiên cường dưới vẻ ngoài mong manh, thông tuệ lễ nghi và mưu lược gia tộc, không bao giờ khóc trước mặt kẻ thù.',
      speechStyle:
        'Chuẩn mực, dịu dàng nhưng ẩn chứa sự kiên định không thể lay chuyển; xưng "tôi - anh" hoặc "thiếp/ta - chàng/huynh".',
      innerWound: 'Bị cuốn vào vòng xoáy tranh giành quyền lực ngay từ thuở niên thiếu.',
      defaultRelation: 'Ban đầu đề phòng nhân vật chính, sau trở thành tri kỷ đồng sinh cộng tử'
    }
  ];

  /**
   * Hàm lấy STUDIO_CONSTANTS an toàn tuyệt đối
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
        BIBLE_TEMPLATE: 'noir_s10_bible_template_frame',
        BIBLE_RENDERED: 'noir_s10_rendered_bible_content',
        BIBLE_LOCKED: 'noir_s10_bible_template_locked',
        CHARACTERS: 'noir_s10_character_profiles_v1',
        KNOWLEDGE_MATRIX: 'noir_s10_knowledge_matrix_v1',
        CLUES_LEDGER: 'noir_s10_clues_ledger_v1',
        ANTI_CLICHE: 'noir_s10_anti_cliche_blacklist_v1'
      },
      DEFAULT_ANTI_CLICHE: STORY_BIBLE_GENRE_PRESETS.DEFAULT_UNIVERSAL.sampleAntiCliche
    };
  }

  // ==========================================================================
  // PHẦN 3: MA TRẬN QUAN HỆ NHÂN VẬT & TỪ ĐIỂN XƯNG HÔ TIẾNG VIỆT ĐA THỂ LOẠI
  // ==========================================================================
  const VIETNAMESE_PRONOUN_PRESETS = {
    MODERN_PEER_CALM: {
      id: 'MODERN_PEER_CALM',
      label: 'Современ / Hiện đại: "Tôi — Cậu" (Bình đẳng, điềm tĩnh, Light Novel)',
      selfPronoun: 'tôi',
      targetPronoun: 'cậu',
      toneNote: 'Giữ khoảng cách vừa phải, lịch sự nhưng có chiều sâu nội tâm'
    },
    MODERN_ROMANCE_WARM: {
      id: 'MODERN_ROMANCE_WARM',
      label: 'Hiện đại / Tình cảm: "Anh — Em" (Gần gũi, ấm áp hoặc giằng xé)',
      selfPronoun: 'anh',
      targetPronoun: 'em',
      toneNote: 'Thích hợp cho quan hệ tình cảm, tiền bối — hậu bối thân thiết'
    },
    MODERN_FORMAL_NOIR: {
      id: 'MODERN_FORMAL_NOIR',
      label: 'Trinh thám / Công sở: "Tôi — Ông/Bà/Anh/Chị" (Chuẩn mực, điều tra)',
      selfPronoun: 'tôi',
      targetPronoun: 'anh/chị',
      toneNote: 'Ngôn ngữ sắc lạnh, khách quan, dùng khi thẩm vấn hoặc đàm phán'
    },
    YOUTH_SCHOOL_LN: {
      id: 'YOUTH_SCHOOL_LN',
      label: 'Học đường / Thanh xuân: "Tớ — Cậu" (Trẻ trung, trong sáng)',
      selfPronoun: 'tớ',
      targetPronoun: 'cậu',
      toneNote: 'Nhịp thoại nhanh, giàu biểu cảm tuổi học trò'
    },
    ANCIENT_EQUAL_DAO: {
      id: 'ANCIENT_EQUAL_DAO',
      label: 'Tiên hiệp / Cổ trang: "Ta — Đạo hữu / Các hạ" (Ngang hàng, khách khí)',
      selfPronoun: 'ta',
      targetPronoun: 'đạo hữu',
      toneNote: 'Văn phong cổ nhã, dùng giữa các tu sĩ hoặc kiếm khách'
    },
    ANCIENT_SENIOR_JUNIOR: {
      id: 'ANCIENT_SENIOR_JUNIOR',
      label: 'Tiên hiệp / Sư môn: "Vãn bối / Đệ tử — Tiền bối / Sư tôn"',
      selfPronoun: 'vãn bối',
      targetPronoun: 'tiền bối',
      toneNote: 'Tôn kính, giữ lễ tiết tôn ti trật tự trong tông môn'
    },
    ANCIENT_SUPREME_OVERLORD: {
      id: 'ANCIENT_SUPREME_OVERLORD',
      label: 'Bá giả / Thượng vị: "Bổn tọa / Ta — Ngươi" (Uy nghiêm, áp đảo)',
      selfPronoun: 'bổn tọa',
      targetPronoun: 'ngươi',
      toneNote: 'Dùng cho cường giả đỉnh phong hoặc phản diện bề trên'
    },
    ROYAL_NOBLE_FANTASY: {
      id: 'ROYAL_NOBLE_FANTASY',
      label: 'Quý tộc / Hoàng gia Âu cổ: "Thần / Tôi — Điện hạ / Ngài"',
      selfPronoun: 'tôi',
      targetPronoun: 'Ngài',
      toneNote: 'Trang trọng, lịch lãm kiểu Light Novel Fantasy phương Tây'
    }
  };

  /**
   * Động cơ Quản lý Quan hệ Đa chiều & Kiểm toán Nhất quán Xưng hô Nhân vật
   */
  class VietnamesePronounAndRelationshipMatrixEngine {
    constructor(idb) {
      this.idb = idb;
      this.storageKey = 'noir_v38_character_relationships_v1';
      this.relationships = [];
    }

    getIdb() {
      return this.idb || window.NoirStudio?.idb || null;
    }

    loadRelationships() {
      const idb = this.getIdb();
      if (idb && typeof idb.getLocalJSON === 'function') {
        this.relationships = idb.getLocalJSON(this.storageKey, []);
      } else {
        try {
          this.relationships = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        } catch (_) {
          this.relationships = [];
        }
      }
      if (!Array.isArray(this.relationships)) {
        this.relationships = [];
      }
      return this.relationships;
    }

    saveRelationships() {
      const idb = this.getIdb();
      if (idb && typeof idb.setLocalJSON === 'function') {
        idb.setLocalJSON(this.storageKey, this.relationships);
      } else {
        try {
          localStorage.setItem(this.storageKey, JSON.stringify(this.relationships));
        } catch (_) {}
      }
    }

    addOrUpdateRelationship({
      sourceChar,
      targetChar,
      relationLabel,
      pronounPair,
      trustScore = 50,
      dynamicNote = ''
    }) {
      const src = String(sourceChar || '').trim();
      const tgt = String(targetChar || '').trim();
      if (!src || !tgt) return null;

      const existing = this.relationships.find(
        (r) =>
          r.sourceChar.toLowerCase() === src.toLowerCase() &&
          r.targetChar.toLowerCase() === tgt.toLowerCase()
      );

      if (existing) {
        existing.relationLabel = relationLabel || existing.relationLabel;
        existing.pronounPair = pronounPair || existing.pronounPair;
        existing.trustScore = Number(trustScore) || existing.trustScore;
        existing.dynamicNote = dynamicNote || existing.dynamicNote;
        existing.updatedAt = Date.now();
        this.saveRelationships();
        return existing;
      }

      const rel = {
        id: 'rel_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        sourceChar: src,
        targetChar: tgt,
        relationLabel: relationLabel || 'Đồng hành / Đối trọng',
        pronounPair: pronounPair || 'tôi - cậu',
        trustScore: Math.max(-100, Math.min(100, Number(trustScore) || 50)),
        dynamicNote: dynamicNote || 'Xưng hô nhất quán trong mọi phân cảnh',
        updatedAt: Date.now()
      };
      this.relationships.push(rel);
      this.saveRelationships();
      return rel;
    }

    deleteRelationship(relId) {
      this.relationships = this.relationships.filter((r) => r.id !== relId);
      this.saveRelationships();
    }

    /**
     * Quét văn bản chương để phát hiện câu thoại của nhân vật có dùng sai đại từ xưng hô đã khóa không
     */
    auditPronounConsistencyInText(chapterText, charactersList = []) {
      if (!chapterText || typeof chapterText !== 'string') return [];
      const lines = chapterText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const warnings = [];

      const charMap = {};
      (charactersList || []).forEach((c) => {
        if (c && c.name) {
          charMap[c.name.trim().toLowerCase()] = c;
        }
      });

      const stdDialogueRx = /^[-–—]\s+(.+)\(([^()]+)\)\s*[.!?…]*$/;

      lines.forEach((line, idx) => {
        const m = line.match(stdDialogueRx);
        if (!m) return;
        const speech = m[1].trim().toLowerCase();
        const speaker = m[2].trim();
        const charObj = charMap[speaker.toLowerCase()];
        if (!charObj || !charObj.speechStyle) return;

        const styleLower = charObj.speechStyle.toLowerCase();
        // Nếu nhân vật khóa xưng "tôi" nhưng trong thoại lại xưng "bổn tọa" hoặc "trẫm" (hoặc ngược lại)
        if (
          styleLower.includes('tôi') &&
          !styleLower.includes('ta') &&
          /\b(bổn tọa|lão phu|bần đạo|trẫm)\b/i.test(speech)
        ) {
          warnings.push({
            lineIndex: idx + 1,
            speaker,
            line,
            reason: `Nhân vật [${speaker}] có thiết lập giọng thoại "${charObj.speechStyle}", nhưng câu thoại lại dùng đại từ cổ trang không khớp.`
          });
        } else if (
          (styleLower.includes('bổn tọa') || styleLower.includes('vãn bối')) &&
          /\b(tớ|cậu ấy|ok|okay)\b/i.test(speech)
        ) {
          warnings.push({
            lineIndex: idx + 1,
            speaker,
            line,
            reason: `Nhân vật cổ phong [${speaker}] đang dùng đại từ hiện đại ("tớ/cậu") lệch thiết lập.`
          });
        }
      });

      return warnings;
    }

    /**
     * Xuất khối quy tắc quan hệ & xưng hô để ghép vào Prompt Tổng Hợp
     */
    buildRelationshipPromptSection() {
      if (!Array.isArray(this.relationships) || this.relationships.length === 0) {
        return '';
      }
      const lines = this.relationships.map(
        (r, idx) =>
          `  ${idx + 1}. [${r.sourceChar}] ➔ [${r.targetChar}] (${r.relationLabel}): Xưng hô bắt buộc "${
            r.pronounPair
          }" — Lưu ý tương tác: ${r.dynamicNote || 'Tự nhiên'}`
      );
      return [
        ``,
        `[2B. MA TRẬN QUAN HỆ & QUY TẮC XƯNG HÔ SONG PHƯƠNG]:`,
        ...lines
      ].join('\n');
    }
  }

  // ==========================================================================
  // PHẦN 4: BỘ KIỂM TOÁN MA TRẬN "AI BIẾT GÌ" (ASYMMETRIC KNOWLEDGE VALIDATOR)
  // ==========================================================================
  class AsymmetricKnowledgeValidator {
    /**
     * Trích xuất các từ khóa đặc trưng từ nội dung một Bí mật (Secret)
     */
    static extractKeywordsFromSecret(secretText) {
      if (!secretText || typeof secretText !== 'string') return [];
      const stopWords = new Set([
        'chân', 'tướng', 'sự', 'kiện', 'việc', 'người', 'những', 'trong', 'ngoài',
        'của', 'và', 'hoặc', 'là', 'đã', 'đang', 'sẽ', 'một', 'các', 'này', 'đó',
        'khi', 'nơi', 'về', 'với', 'cho', 'không', 'có', 'được', 'bị', 'tại'
      ]);

      return secretText
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .split(/\s+/)
        .map((w) => w.trim())
        .filter((w) => w.length >= 4 && !stopWords.has(w));
    }

    /**
     * Kiểm tra xem bản thảo chương hiện tại có vô tình để nhân vật nằm trong danh sách
     * "CHƯA BIẾT" (whoDoesNotKnow) nói ra từ khóa của Bí mật hay không!
     */
    static scanManuscriptForKnowledgeLeaks(chapterText, knowledgeMatrix = []) {
      if (!chapterText || !Array.isArray(knowledgeMatrix) || knowledgeMatrix.length === 0) {
        return [];
      }

      const leaks = [];
      const lines = chapterText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const stdDialogueRx = /^[-–—]\s+(.+)\(([^()]+)\)\s*[.!?…]*$/;

      for (const item of knowledgeMatrix) {
        if (!item || !item.secret || !item.whoDoesNotKnow) continue;
        const forbiddenNames = item.whoDoesNotKnow
          .split(/[,;&/]+/)
          .map((n) => n.replace(/\(.*?\)/g, '').trim().toLowerCase())
          .filter((n) => n.length >= 2);

        const secretKeywords = this.extractKeywordsFromSecret(item.secret);
        if (secretKeywords.length < 2) continue;

        lines.forEach((line) => {
          const m = line.match(stdDialogueRx);
          if (!m) return;
          const speechLower = m[1].toLowerCase();
          const speakerLower = m[2].trim().toLowerCase();

          const isForbiddenSpeaker = forbiddenNames.some(
            (fn) =>
              speakerLower.includes(fn) ||
              (fn === 'nhân vật chính' && speakerLower.length > 0)
          );
          if (!isForbiddenSpeaker) return;

          const matchedKw = secretKeywords.filter((kw) => speechLower.includes(kw));
          if (matchedKw.length >= Math.min(3, secretKeywords.length)) {
            leaks.push({
              secret: item.secret,
              speaker: m[2].trim(),
              whoDoesNotKnow: item.whoDoesNotKnow,
              matchedKeywords: matchedKw,
              excerpt: line.slice(0, 140)
            });
          }
        });
      }

      return leaks;
    }
  }

  // ==========================================================================
  // PHẦN 5: BỘ QUÉT TỰ ĐỘNG TRÍCH XUẤT THỰC THỂ & PHỤC BÚT TỪ BẢN THẢO (0 TOKEN)
  // ==========================================================================
  class AutoLoreEntityExtractor {
    /**
     * Tự động quét bản thảo đang mở để tìm các tên nhân vật xuất hiện trong cặp ngoặc
     * của quy ước hội thoại "- Câu thoại (Tên nhân vật)" mà chưa có trong Hồ sơ nhân vật!
     */
    static discoverNewCharactersFromManuscript(chapterText, existingCharacters = []) {
      if (!chapterText || typeof chapterText !== 'string') return [];

      const existingSet = new Set(
        (existingCharacters || []).map((c) => String(c.name || '').trim().toLowerCase())
      );

      const counts = {};
      const lines = chapterText.split(/\r?\n/);
      const dialogueRx = /^[-–—]\s+.+\(([^()]{2,32})\)\s*[.!?…]*$/;

      for (const rawLine of lines) {
        const line = rawLine.trim();
        const match = line.match(dialogueRx);
        if (match) {
          const speaker = match[1].trim();
          const lower = speaker.toLowerCase();
          if (!existingSet.has(lower)) {
            counts[speaker] = (counts[speaker] || 0) + 1;
          }
        }
      }

      return Object.entries(counts)
        .map(([name, dialogueCount]) => ({
          name,
          dialogueCount,
          suggestedRole: dialogueCount >= 4 ? 'Nhân vật quan trọng trong chương' : 'Nhân vật phụ xuất hiện'
        }))
        .sort((a, b) => b.dialogueCount - a.dialogueCount);
    }

    /**
     * Bóc tách thực thể cục bộ 0-Token bằng bộ lọc regex & chia đoạn ngữ cảnh Story Bible
     * khi người dùng dán hoặc cập nhật Story Bible chính thức.
     */
    static parseStructuredEntitiesLocally(bibleText) {
      if (!bibleText || typeof bibleText !== 'string') return null;
      const res = {
        characters: [],
        knowledgeMatrix: [],
        cluesLedger: []
      };

      const lines = bibleText.split(/\r?\n/);
      let currentSection = '';

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const lower = line.toLowerCase();
        if (lower.includes('hồ sơ') || lower.includes('nhân vật')) {
          currentSection = 'CHARS';
          continue;
        } else if (lower.includes('ai biết gì') || lower.includes('bí mật') || lower.includes('ma trận')) {
          currentSection = 'KNOW';
          continue;
        } else if (lower.includes('phục bút') || lower.includes('manh mối') || lower.includes('chekhov')) {
          currentSection = 'CLUES';
          continue;
        } else if (line.startsWith('[') && line.endsWith(']')) {
          currentSection = '';
        }

        // Bóc tách nhân vật
        if (currentSection === 'CHARS' || lower.includes('nhân vật:')) {
          const charMatch = line.match(/^[-*+•]\s*(?:Nhân vật:\s*)?([A-ZÀ-Ỹ][A-Za-zÀ-ỹ\s]{1,30})(?:\s*[:(—–-]\s*(.*))?$/);
          if (charMatch) {
            const cName = charMatch[1].trim();
            const rest = charMatch[2] ? charMatch[2].replace(/[()]/g, '').trim() : '';
            if (cName.length >= 2 && !cName.toLowerCase().startsWith('chương')) {
              res.characters.push({
                name: cName,
                role: rest ? (rest.length > 50 ? rest.slice(0, 48) + '...' : rest) : 'Nhân vật trong truyện',
                traits: rest || 'Xuất hiện trong Story Bible',
                speechStyle: 'Nhất quán theo bối cảnh',
                innerWound: ''
              });
            }
          }
        }

        // Bóc tách ma trận Ai biết gì
        if (currentSection === 'KNOW' || lower.includes('bí mật:')) {
          const knowMatch = line.match(/^[-*+•]\s*(?:Bí mật:\s*)?([^:—–-]+)(?:[:—–-]\s*(.*))?$/);
          if (knowMatch) {
            const sec = knowMatch[1].trim();
            const desc = knowMatch[2] || '';
            if (sec.length >= 4) {
              res.knowledgeMatrix.push({
                secret: sec,
                whoKnows: desc ? 'Nhân vật liên quan' : 'Người trong cuộc',
                whoDoesNotKnow: 'Nhân vật chính (Cấm lộ sớm)'
              });
            }
          }
        }

        // Bóc tách phục bút
        if (currentSection === 'CLUES' || lower.includes('phục bút:')) {
          const clueMatch = line.match(/^[-*+•]\s*(?:Phục bút:\s*)?([^:—–-]+)(?:[:—–-]\s*(.*))?$/);
          if (clueMatch) {
            const clTitle = clueMatch[1].trim();
            const clNote = clueMatch[2] || '';
            if (clTitle.length >= 4) {
              res.cluesLedger.push({
                title: clTitle,
                plantedIn: 'Story Bible',
                status: 'PLANTED',
                note: clNote || 'Ghi nhận từ Story Bible'
              });
            }
          }
        }
      }

      return res;
    }
  }

  // ==========================================================================
  // PHẦN 6: BỘ MẪU PHỤC BÚT (CHEKHOV'S GUN TEMPLATES) & MA TRẬN BÍ MẬT MẪU
  // ==========================================================================
  const CHEKHOV_CLUE_PRESET_PACKS = [
    {
      category: 'TRINH_THAM_NOIR',
      label: '🕵️ Gói Phục Bút Trinh Thám — Vật Chứng & Lệch Giờ',
      items: [
        {
          title: 'Chiếc đồng hồ quả quýt ngừng chạy lúc 23:15',
          plantedIn: 'Chương 1',
          status: 'PLANTED',
          note: 'Thời điểm đồng hồ vỡ không trùng với giờ tử vong thật sự của nạn nhân (Ngụy tạo Alibi)'
        },
        {
          title: 'Vết bùn đất đỏ chỉ có ở khu nhà kho bến cảng phía Đông',
          plantedIn: 'Chương 2',
          status: 'PLANTED',
          note: 'Dính trên gấu quần của người tự xưng không rời khỏi phòng sách suốt đêm mưa'
        },
        {
          title: 'Tách trà Bá Tước vẫn còn ấm khi cảnh sát ập vào',
          plantedIn: 'Chương 3',
          status: 'PLANTED',
          note: 'Chứng tỏ hung thủ vừa mới rời đi qua lối mật đạo chưa đầy 5 phút trước'
        }
      ]
    },
    {
      category: 'LIGHT_NOVEL_FANTASY',
      label: '⚔️ Gói Phục Bút Light Novel — Di Vật & Thân Phận Ẩn',
      items: [
        {
          title: 'Vết sẹo hình bán nguyệt phát sáng khi tiếp xúc với Cổ Ngữ',
          plantedIn: 'Chương 1',
          status: 'PLANTED',
          note: 'Dấu ấn phong ấn một nửa ký ức thời thơ ấu của nhân vật chính'
        },
        {
          title: 'Trang cuối bị xé rách trong Nhật ký của Viện Trưởng đời thứ nhất',
          plantedIn: 'Chương 4',
          status: 'PLANTED',
          note: 'Ghi chép tên thật của vị thần đã phản bội loài người'
        },
        {
          title: 'Thanh đoản kiếm rỉ sét mua ở chợ trời không thể bị ma thuật ăn mòn',
          plantedIn: 'Chương 2',
          status: 'PLANTED',
          note: 'Vỏ ngoài rỉ sét chỉ là lớp ngụy trang của Thần Khí Phá Pháp'
        }
      ]
    },
    {
      category: 'TIEN_HIEP_HUYEN_HUYEN',
      label: '🏔️ Gói Phục Bút Tiên Hiệp — Nhân Quả & Cổ Ngọc',
      items: [
        {
          title: 'Mảnh ngọc bội ấm áp hấp thụ một giọt máu tâm đầu khi đột phá',
          plantedIn: 'Chương 1',
          status: 'PLANTED',
          note: 'Chìa khóa mở ra Động Phủ của Đại Năng thượng cổ ở quyển 2'
        },
        {
          title: 'Lời dặn không được bước vào Vạn Kiếm Cốc trước khi đạt Kim Đan',
          plantedIn: 'Chương 3',
          status: 'PLANTED',
          note: 'Dưới đáy cốc giam giữ tàn hồn có ân oán huyết hải với sư môn'
        }
      ]
    }
  ];

  const KNOWLEDGE_MATRIX_PRESET_PACKS = [
    {
      id: 'KNOW_PACK_NOIR',
      label: '🕵️ Mẫu Bí Mật Trinh Thám: Kẻ Phản Bội Nội Gián',
      secret: 'Phó đội trưởng Trần Minh chính là người đã xóa dữ liệu camera hành lang lúc 22:40',
      whoKnows: 'Trần Minh và kẻ chủ mưu đứng sau tập đoàn Hóa Sinh',
      whoDoesNotKnow: 'Nhân vật chính Lâm Phong và toàn bộ đội điều tra (Tuyệt đối cấm AI viết lộ ra trước Chương 10!)'
    },
    {
      id: 'KNOW_PACK_LN',
      label: '⚔️ Mẫu Bí Mật Light Novel: Thân Phận Thật Của Đồng Đội',
      secret: 'Cô bạn cùng bàn trầm lặng thực chất là Công chúa lưu vong của Vương quốc Phương Bắc',
      whoKnows: 'Chỉ bản thân cô ấy và người hộ vệ già giả làm quản thư viện',
      whoDoesNotKnow: 'Nhân vật chính và toàn bộ học viên trong lớp (Cấm nhân vật chính gọi đúng thân phận công chúa khi chưa tới cảnh lật bài!)'
    },
    {
      id: 'KNOW_PACK_TIEN_HIEP',
      label: '🏔️ Mẫu Bí Mật Tiên Hiệp: Nguồn Gốc Linh Căn Phế Vật',
      secret: 'Linh căn của nhân vật chính không bị phế mà đang bị Cửu Chuyển Phong Ấn Trận hút linh khí để nuôi dưỡng thần mộc dưới lòng đất',
      whoKnows: 'Chỉ vị Đại Trưởng Lão ẩn cư ở Hậu Sơn',
      whoDoesNotKnow: 'Nhân vật chính, các đệ tử ngoại môn và gia tộc (Nhân vật chính vẫn tưởng mình tư chất kém nên phải nỗ lực gấp mười lần)'
    }
  ];

  // ==========================================================================
  // PHẦN 7: ĐỘNG CƠ CHÍNH — STORY BIBLE AND LORE MATRIX ENGINE (MODULE 12)
  // ==========================================================================
  class StoryBibleAndLoreMatrixEngine {
    constructor(idb, fs, utils) {
      this._idb = idb || null;
      this._fs = fs || null;
      this._utils = utils || null;

      this.templateLocked = false;
      this.activeGenrePresetId = 'DEFAULT_UNIVERSAL';
      this.characters = [];
      this.knowledgeMatrix = [];
      this.cluesLedger = [];
      this.relationshipEngine = new VietnamesePronounAndRelationshipMatrixEngine(this._idb);
      this._domEventsBound = false;

      this.defaultTemplate = STORY_BIBLE_GENRE_PRESETS.DEFAULT_UNIVERSAL.templateText;
    }

    get idb() {
      return (
        this._idb ||
        window.NoirStudio?.idb || {
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
          },
          set: async () => true,
          get: async () => null
        }
      );
    }

    set idb(val) {
      this._idb = val;
    }

    get fs() {
      return (
        this._fs ||
        window.NoirStudio?.fsEngine || {
          rootHandle: null,
          writeTextFile: async () => false
        }
      );
    }

    set fs(val) {
      this._fs = val;
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
     * Khởi tạo và nạp toàn bộ dữ liệu Story Bible từ bộ nhớ cục bộ
     */
    init() {
      this.loadAllFromStorage();
      this.bindTab4DOMEvents();
      this.injectGenreTemplateToolbarIfMissing();
    }

    /**
     * Đọc toàn bộ Khung mẫu, Nội dung Story Bible chính thức, Hồ sơ nhân vật,
     * Ma trận Ai Biết Gì, Sổ cái Phục bút & Danh sách Từ cấm từ LocalStorage / IndexedDB
     */
    loadAllFromStorage() {
      const constants = getStudioConstants();

      const fallbackDefaultTemplate =
        this.defaultTemplate ||
        (typeof STORY_BIBLE_GENRE_PRESETS !== 'undefined' &&
          STORY_BIBLE_GENRE_PRESETS.DEFAULT_UNIVERSAL?.templateText) ||
        '=== KHUNG CẤU TRÚC STORY BIBLE TIỂU THUYẾT ===\n[I. THẾ GIỚI QUAN & BỐI CẢNH CỐT LÕI]\n- Thời đại, không gian và quy tắc chi phối.';

      const rawTemplate = localStorage.getItem(constants.STORAGE_KEYS.BIBLE_TEMPLATE);
      const savedTemplate =
        rawTemplate && rawTemplate.trim() ? rawTemplate : fallbackDefaultTemplate;
      const rawRendered = localStorage.getItem(constants.STORAGE_KEYS.BIBLE_RENDERED);
      const savedRendered =
        rawRendered && rawRendered.trim() ? rawRendered : savedTemplate;
      this.templateLocked =
        localStorage.getItem(constants.STORAGE_KEYS.BIBLE_LOCKED) === 'true';

      this.activeGenrePresetId =
        localStorage.getItem('noir_v38_active_bible_genre_preset') ||
        'DEFAULT_UNIVERSAL';

      this.characters = this.idb.getLocalJSON(constants.STORAGE_KEYS.CHARACTERS, [
        {
          id: 'char_default_1',
          name: 'Nhân vật chính',
          role: 'Trung tâm cốt truyện',
          traits: 'Điềm tĩnh, quan sát sắc bén, nội tâm sâu sắc',
          speechStyle: 'Ngắn gọn, giàu ẩn ý, xưng hô nhất quán',
          innerWound: 'Mang ký ức chưa lời giải từ sự kiện mở đầu',
          archetypeId: 'ARCH_STRATEGIST'
        }
      ]);

      this.knowledgeMatrix = this.idb.getLocalJSON(
        constants.STORAGE_KEYS.KNOWLEDGE_MATRIX,
        [
          {
            id: 'know_default_1',
            secret: 'Chân tướng sự kiện đêm mưa mở đầu',
            whoKnows: 'Chỉ người đứng sau màn',
            whoDoesNotKnow: 'Nhân vật chính và các đồng đội (Cấm AI để lộ sớm!)'
          }
        ]
      );

      this.cluesLedger = this.idb.getLocalJSON(constants.STORAGE_KEYS.CLUES_LEDGER, [
        {
          id: 'clue_default_1',
          title: 'Chiếc đồng hồ quả quýt ngừng chạy lúc 23:15',
          plantedIn: 'Chương 1',
          status: 'PLANTED',
          note: 'Manh mối dẫn tới nghi phạm thực sự ở giữa truyện'
        }
      ]);

      this.relationshipEngine.loadRelationships();

      const savedAntiCliche =
        localStorage.getItem(constants.STORAGE_KEYS.ANTI_CLICHE) ||
        (constants.DEFAULT_ANTI_CLICHE || STORY_BIBLE_GENRE_PRESETS.DEFAULT_UNIVERSAL.sampleAntiCliche).join(', ');

      const tplEl = document.getElementById('textarea-bible-template-frame');
      const renEl = document.getElementById('textarea-rendered-bible-content');
      const antiEl = document.getElementById('textarea-anti-cliche-blacklist');

      if (tplEl) {
        tplEl.value = savedTemplate;
        tplEl.readOnly = this.templateLocked;
      }
      if (renEl) renEl.value = savedRendered;
      if (antiEl) antiEl.value = savedAntiCliche;

      this.updateLockButtonUI();
      this.renderCharactersUI();
      this.renderKnowledgeMatrixUI();
      this.renderCluesLedgerUI();
      this.renderQuickCharacterChipsInTab1();
      this.updateCommandModalStatusPills();
    }

    /**
     * Gắn sự kiện cho các nút thao tác trong Tab 4 (với cờ chống gắn trùng lặp 100%)
     */
    bindTab4DOMEvents() {
      const btnLock = document.getElementById('btn-toggle-bible-template-lock');
      const btnSaveAll = document.getElementById('btn-bible-save-all');
      const btnAddChar = document.getElementById('btn-add-character-profile');
      const btnAddKnow = document.getElementById('btn-add-knowledge-entry');
      const btnAddClue = document.getElementById('btn-add-clue-entry');
      const tplEl = document.getElementById('textarea-bible-template-frame');
      const renEl = document.getElementById('textarea-rendered-bible-content');
      const antiEl = document.getElementById('textarea-anti-cliche-blacklist');

      if (btnLock && !btnLock.dataset.mod12Bound) {
        btnLock.dataset.mod12Bound = '1';
        btnLock.addEventListener('click', () => {
          this.toggleTemplateLock();
        });
      }

      if (btnSaveAll && !btnSaveAll.dataset.mod12Bound) {
        btnSaveAll.dataset.mod12Bound = '1';
        btnSaveAll.addEventListener('click', () => {
          this.saveAllBibleData(true);
        });
      }

      if (btnAddChar && !btnAddChar.dataset.mod12Bound) {
        btnAddChar.dataset.mod12Bound = '1';
        btnAddChar.addEventListener('click', () => {
          this.addCharacterInteractive();
        });
      }

      if (btnAddKnow && !btnAddKnow.dataset.mod12Bound) {
        btnAddKnow.dataset.mod12Bound = '1';
        btnAddKnow.addEventListener('click', () => {
          this.addKnowledgeEntryInteractive();
        });
      }

      if (btnAddClue && !btnAddClue.dataset.mod12Bound) {
        btnAddClue.dataset.mod12Bound = '1';
        btnAddClue.addEventListener('click', () => {
          this.addClueEntryInteractive();
        });
      }

      // Nạp câu lệnh chuẩn mẫu NotebookLM & gắn sự kiện xuất PDF gộp tất cả chương (Tab 4)
      const nblmPromptEl = document.getElementById('textarea-tab4-notebooklm-prompt');
      if (nblmPromptEl && !nblmPromptEl.value.trim()) {
        nblmPromptEl.value = [
          'Bạn là Biên Tập Viên Cốt Truyện Cấp Cao. Hãy đọc toàn bộ tệp PDF các chương tiểu thuyết tôi vừa tải lên (theo đúng thứ tự từ Chương 1 đến chương cuối cùng hiện có) và tổng hợp thành một BẢN STORY BIBLE TỔNG HỢP CHI TIẾT NHẤT CÓ THỂ.',
          '',
          'YÊU CẦU BẮT BUỘC (KHÔNG ĐƯỢC LƯỢC BỎ CHI TIẾT QUAN TRỌNG):',
          '1. THỜI GIAN & BỐI CẢNH HIỆN TẠI: Tính đến trang cuối cùng của tệp PDF, mốc thời gian chính xác là ngày/giờ/mùa nào? Nhân vật chính đang ở đâu, mang trên người những đồ vật/vết thương/trạng thái tâm lý gì?',
          '2. MẠCH TRUYỆN LIÊN HOÀN TỪ CHƯƠNG 1 ĐẾN HIỆN TẠI: Lập bảng tóm tắt chi tiết diễn biến từng chương (Chương 1, Chương 2, Chương 3... đến chương cuối), nêu rõ nhân quả nối tiếp nhau giữa các chương.',
          '3. HỒ SƠ TỪNG NHÂN VẬT & QUAN HỆ XƯNG HÔ: Tên tuổi, ngoại hình, tính cách, động cơ ngầm, bí mật riêng, sự thay đổi tâm lý và cặp đại từ xưng hô chuẩn với từng nhân vật khác.',
          '4. MA TRẬN "AI BIẾT GÌ — AI CHƯA BIẾT": Liệt kê từng bí mật/sự thật trong truyện, chỉ rõ tính đến chương cuối thì ai ĐÃ BIẾT và ai CHƯA BIẾT để tránh tuyệt đối việc nhân vật tự dưng biết trước kịch bản.',
          '5. SỔ CÁI PHỤC BÚT & MANH MỐI (CHEKHOV\'S GUN): Liệt kê toàn bộ chi tiết nhỏ, lời hứa, đồ vật đã gieo từ các chương đầu — đánh dấu rõ cái nào [ĐANG TREO CHỜ THU HỒI] và cái nào [ĐÃ GIẢI ĐÁP].',
          '6. LUẬT BẤT KHẢ XÂM PHẠM CỦA THẾ GIỚI TRUYỆN: Hệ thống sức mạnh, giới hạn năng lực, quy tắc logic tuyệt đối không được vi phạm khi viết các chương kế tiếp.'
        ].join('\n');
      }

      const btnCopyNblm = document.getElementById('btn-tab4-copy-notebooklm-prompt');
      if (btnCopyNblm && !btnCopyNblm.dataset.mod12Bound) {
        btnCopyNblm.dataset.mod12Bound = '1';
        btnCopyNblm.addEventListener('click', async () => {
          const textToCopy = document.getElementById('textarea-tab4-notebooklm-prompt')?.value || '';
          if (!textToCopy.trim()) return;
          try {
            await navigator.clipboard.writeText(textToCopy);
          } catch (_e) {
            const ta = document.getElementById('textarea-tab4-notebooklm-prompt');
            if (ta) {
              ta.select();
              try { document.execCommand('copy'); } catch (_e2) {}
            }
          }
          const statusPill = document.getElementById('tab4-nblm-copy-status-pill');
          if (statusPill) {
            statusPill.textContent = `✅ Đã copy lệnh (${textToCopy.length} ký tự)`;
            statusPill.className =
              'px-2.5 py-0.5 rounded-full border border-amber-400/50 bg-amber-500/20 text-amber-200 font-extrabold text-[10px]';
          }
          this.utils.showToast(
            '📋 Đã sao chép câu lệnh Story Bible chi tiết! Hãy tải PDF gộp lên NotebookLM rồi dán câu lệnh này nhé.',
            'success',
            4000
          );
        });
      }

      const btnToggleNblmPreview = document.getElementById('btn-tab4-toggle-nblm-prompt-preview');
      const wrapNblmPreview = document.getElementById('tab4-notebooklm-prompt-preview-wrap');
      if (btnToggleNblmPreview && wrapNblmPreview && !btnToggleNblmPreview.dataset.mod12Bound) {
        btnToggleNblmPreview.dataset.mod12Bound = '1';
        btnToggleNblmPreview.addEventListener('click', () => {
          const isHidden = wrapNblmPreview.classList.toggle('hidden');
          btnToggleNblmPreview.textContent = isHidden
            ? '👁️ Xem trước nội dung câu lệnh ▾'
            : '🔼 Thu gọn khung câu lệnh ▴';
        });
      }

      const btnExportAllPdfNblm = document.getElementById('btn-tab4-export-all-chapters-pdf');
      if (btnExportAllPdfNblm && !btnExportAllPdfNblm.dataset.mod12Bound) {
        btnExportAllPdfNblm.dataset.mod12Bound = '1';
        btnExportAllPdfNblm.addEventListener('click', () => {
          const exp = window.NoirStudio?.exporter;
          if (exp && typeof exp.exportMergedManuscriptPdfForNotebookLM === 'function') {
            exp.exportMergedManuscriptPdfForNotebookLM();
          } else {
            const scopeSel = document.getElementById('export-scope-select');
            if (scopeSel) scopeSel.value = 'ALL_CHAPTERS';
            exp?.openExporterModal?.();
          }
        });
      }

      // Tự động lưu ngầm khi tác giả gõ vào các ô Textarea của Story Bible
      [tplEl, renEl, antiEl].forEach((el) => {
        if (el && !el.dataset.mod12InputBound) {
          el.dataset.mod12InputBound = '1';
          el.addEventListener('input', () => {
            this.saveAllBibleData(false);
          });
        }
      });

      // Gắn sự kiện đồng bộ Gemini Flash cho nút #btn-tab4-sync-bible-entities & sự kiện dán vào ô Box 2
      const btnSyncEntities = document.getElementById('btn-tab4-sync-bible-entities');
      if (btnSyncEntities && !btnSyncEntities.dataset.mod12Bound) {
        btnSyncEntities.dataset.mod12Bound = '1';
        btnSyncEntities.addEventListener('click', () => {
          this.syncStructuredEntitiesFromOfficialBible({ manual: true });
        });
      }

      if (renEl && !renEl.dataset.mod12PasteBound) {
        renEl.dataset.mod12PasteBound = '1';
        renEl.addEventListener('paste', () => {
          setTimeout(() => {
            const val = (renEl.value || '').trim();
            if (val.length >= 40) {
              this.syncStructuredEntitiesFromOfficialBible({ isAutoPaste: true });
            }
          }, 600);
        });
      }

      this._domEventsBound = true;
    }

    /**
     * Bóc tách và cập nhật tự động Hồ sơ nhân vật, Ma trận Ai biết gì và Sổ cái phục bút
     * trực tiếp từ ô "2. Nội dung Story Bible chính thức" bằng Gemini Flash (đã kết nối API Key)
     * kèm bộ phân tích ngữ pháp cấu trúc dự phòng 0-Token tức thời.
     */
    async syncStructuredEntitiesFromOfficialBible(options = {}) {
      const renEl = document.getElementById('textarea-rendered-bible-content');
      const bibleText = (renEl?.value || '').trim();
      const statusPill = document.getElementById('tab4-entity-sync-status');

      if (!bibleText || bibleText.length < 30) {
        if (!options.silent) {
          this.utils.showToast(
            '⚠️ Ô "2. Nội dung Story Bible chính thức" hiện chưa có đủ nội dung để bóc tách.',
            'warning',
            3500
          );
        }
        return false;
      }

      if (statusPill) {
        statusPill.classList.remove('hidden');
        statusPill.textContent = '⚡ Gemini Flash đang bóc tách...';
        statusPill.className =
          'px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold animate-pulse';
      }

      let parsedData = null;
      let usedGeminiFlash = false;

      // 1. Nếu đã kết nối API Key, ưu tiên gọi Gemini Flash
      const router = window.NoirStudio?.geminiRouter;
      const effectiveKey = router?.getEffectiveActiveKey?.() || router?.getApiKey?.() || '';

      if (effectiveKey && effectiveKey.length >= 8 && router?.isCurrentKeyFlashLiteVerified?.()) {
        try {
          const extractionPrompt = [
            'Bạn là Chuyên gia Cấu trúc Cốt truyện & Story Bible Tiểu thuyết.',
            'Hãy phân tích kỹ Bản Story Bible chính thức dưới đây và bóc tách thành một đối tượng JSON hợp lệ DUY NHẤT theo schema sau:',
            '{',
            '  "characters": [',
            '    { "name": "Tên nhân vật", "role": "Vai trò (Chính / Phản diện / Phụ)", "traits": "Tính cách & đặc điểm", "speechStyle": "Giọng thoại & xưng hô", "innerWound": "Vết thương nội tâm / Động cơ" }',
            '  ],',
            '  "knowledgeMatrix": [',
            '    { "secret": "Tên bí mật hoặc sự thật", "whoKnows": "Ai đã biết", "whoDoesNotKnow": "Ai chưa biết (cấm AI để lộ sớm)" }',
            '  ],',
            '  "cluesLedger": [',
            '    { "title": "Chi tiết phục bút hoặc manh mối", "plantedIn": "Chương gieo", "status": "PLANTED", "note": "Ghi chú ý nghĩa thu hồi" }',
            '  ]',
            '}',
            'QUY TẮC BẮT BUỘC:',
            '1. Chỉ trả về chuỗi JSON thuần, bắt đầu bằng { và kết thúc bằng }.',
            '2. Không kèm bất kỳ lời giải thích, mở đầu hay khối ```json markdown.',
            '3. Bóc tách đầy đủ tất cả nhân vật, bí mật và phục bút có trong Story Bible.',
            '',
            '=== BẢN STORY BIBLE CHÍNH THỨC ===',
            bibleText
          ].join('\n');

          const resp = await router.generateTextWithFallback(extractionPrompt, {
            preferredModelId: 'gemini-3.8-flash',
            temperature: 0.2,
            maxOutputTokens: 3000
          });

          if (resp && resp.text) {
            const raw = resp.text.trim();
            const cleanJson = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
            const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              parsedData = JSON.parse(jsonMatch[0]);
              usedGeminiFlash = true;
            }
          }
        } catch (_geminiErr) {
          // Bỏ qua lỗi và chuyển sang bộ bóc tách nội bộ tức thời
        }
      }

      // 2. Bộ bóc tách ngữ nghĩa nội bộ 0-Token nếu không có API Key hoặc Gemini chưa phản hồi
      if (!parsedData || (!parsedData.characters && !parsedData.knowledgeMatrix && !parsedData.cluesLedger)) {
        parsedData = AutoLoreEntityExtractor.parseStructuredEntitiesLocally(bibleText);
      }

      if (!parsedData) {
        if (statusPill) {
          statusPill.textContent = '❌ Không bóc tách được';
          statusPill.className =
            'px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold';
        }
        return false;
      }

      // 3. Tiến hành gộp dữ liệu thông minh (tránh nhân đôi, cập nhật thông tin mới nhất)
      let addedChars = 0;
      let addedKnow = 0;
      let addedClues = 0;

      if (Array.isArray(parsedData.characters)) {
        parsedData.characters.forEach((c) => {
          if (!c.name || !c.name.trim()) return;
          const cleanName = c.name.trim();
          const existing = this.characters.find(
            (x) => x.name.trim().toLowerCase() === cleanName.toLowerCase()
          );
          if (existing) {
            if (c.role) existing.role = c.role.trim();
            if (c.traits) existing.traits = c.traits.trim();
            if (c.speechStyle) existing.speechStyle = c.speechStyle.trim();
            if (c.innerWound) existing.innerWound = c.innerWound.trim();
          } else {
            this.characters.push({
              id: 'char_auto_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
              name: cleanName,
              role: (c.role || 'Nhân vật').trim(),
              traits: (c.traits || 'Được bóc tách từ Story Bible').trim(),
              speechStyle: (c.speechStyle || 'Nhất quán theo mạch truyện').trim(),
              innerWound: (c.innerWound || '').trim()
            });
            addedChars += 1;
          }
        });
      }

      if (Array.isArray(parsedData.knowledgeMatrix)) {
        parsedData.knowledgeMatrix.forEach((k) => {
          if (!k.secret || !k.secret.trim()) return;
          const cleanSecret = k.secret.trim();
          const existing = this.knowledgeMatrix.find(
            (x) => x.secret.trim().toLowerCase() === cleanSecret.toLowerCase()
          );
          if (existing) {
            if (k.whoKnows) existing.whoKnows = k.whoKnows.trim();
            if (k.whoDoesNotKnow) existing.whoDoesNotKnow = k.whoDoesNotKnow.trim();
          } else {
            this.knowledgeMatrix.push({
              id: 'know_auto_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
              secret: cleanSecret,
              whoKnows: (k.whoKnows || 'Người trong cuộc').trim(),
              whoDoesNotKnow: (k.whoDoesNotKnow || 'Nhân vật chính (Cấm lộ sớm)').trim()
            });
            addedKnow += 1;
          }
        });
      }

      if (Array.isArray(parsedData.cluesLedger)) {
        parsedData.cluesLedger.forEach((cl) => {
          if (!cl.title || !cl.title.trim()) return;
          const cleanTitle = cl.title.trim();
          const existing = this.cluesLedger.find(
            (x) => x.title.trim().toLowerCase() === cleanTitle.toLowerCase()
          );
          if (existing) {
            if (cl.plantedIn) existing.plantedIn = cl.plantedIn.trim();
            if (cl.status) existing.status = cl.status.trim();
            if (cl.note) existing.note = cl.note.trim();
          } else {
            this.cluesLedger.push({
              id: 'clue_auto_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
              title: cleanTitle,
              plantedIn: (cl.plantedIn || 'Chương hiện tại').trim(),
              status: (cl.status || 'PLANTED').trim(),
              note: (cl.note || 'Manh mối quan trọng từ Story Bible').trim()
            });
            addedClues += 1;
          }
        });
      }

      // 4. Mở rộng các bảng dữ kiện để tác giả nhìn thấy kết quả ngay
      const charBody = document.getElementById('tab4-card-chars-body');
      const knowBody = document.getElementById('tab4-card-knowledge-body');
      const cluesBody = document.getElementById('tab4-card-clues-body');
      if (charBody) charBody.classList.remove('hidden');
      if (knowBody) knowBody.classList.remove('hidden');
      if (cluesBody) cluesBody.classList.remove('hidden');

      // 5. Cập nhật giao diện và lưu trữ
      this.renderCharactersUI();
      this.renderKnowledgeMatrixUI();
      this.renderCluesLedgerUI();
      this.renderQuickCharacterChipsInTab1();
      this.saveAllBibleData(false);

      if (statusPill) {
        statusPill.textContent = usedGeminiFlash ? '✅ Flash đồng bộ xong' : '✅ Đã đồng bộ cấu trúc';
        statusPill.className =
          'px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold';
      }

      const methodLabel = usedGeminiFlash ? 'Gemini Flash (AI Studio)' : 'Bộ phân tích cấu trúc Story Bible';
      this.utils.showToast(
        `✨ ${methodLabel} đã đồng bộ thành công: ${this.characters.length} nhân vật (${addedChars} mới), ${this.knowledgeMatrix.length} bí mật (${addedKnow} mới), ${this.cluesLedger.length} phục bút (${addedClues} mới)!`,
        'success',
        4600
      );
      return true;
    }

    /**
     * Bổ sung thanh chọn nhanh Mẫu Thể Loại (Light Novel, Trinh Thám, Tiên Hiệp, Đô Thị, Huyền Huyễn),
     * Hình mẫu Nhân vật (Archetypes) và Quét nhân vật tự động từ bản thảo ngay trong Tab 4
     */
    injectGenreTemplateToolbarIfMissing() {
      const bibleMainView = document.getElementById('s10-story-bible-main-view');
      if (!bibleMainView || document.getElementById('mod12-genre-presets-bar')) return;

      const toolbar = document.createElement('div');
      toolbar.id = 'mod12-genre-presets-bar';
      toolbar.className =
        'p-3.5 rounded-2xl border border-emerald-500/30 bg-studioLightPanel dark:bg-zinc-900/90 flex flex-wrap items-center justify-between gap-2 text-xs';

      const presetOptionsHtml = Object.values(STORY_BIBLE_GENRE_PRESETS)
        .map(
          (p) =>
            `<option value="${this.utils.escapeHtml(p.id)}" ${
              p.id === this.activeGenrePresetId ? 'selected' : ''
            }>${this.utils.escapeHtml(p.label)}</option>`
        )
        .join('');

      const archetypeOptionsHtml = CHARACTER_ARCHETYPE_LIBRARY.map(
        (a) =>
          `<option value="${this.utils.escapeHtml(a.id)}">${this.utils.escapeHtml(
            a.label
          )}</option>`
      ).join('');

      toolbar.innerHTML = `
        <div class="flex flex-wrap items-center gap-2">
          <span class="font-extrabold uppercase text-emerald-400 text-[11px]">📚 Mẫu Thể Loại Story Bible:</span>
          <select id="mod12-select-genre-preset" class="px-2.5 py-1.5 rounded-xl border border-emerald-500/40 bg-studioLightBg dark:bg-zinc-950 font-bold text-xs text-emerald-300">
            ${presetOptionsHtml}
          </select>
          <button type="button" id="btn-mod12-apply-genre-preset" class="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/35 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] transition">
            ✨ Nạp Khung Mẫu Này
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <select id="mod12-select-char-archetype" class="px-2.5 py-1.5 rounded-xl border border-amber-500/40 bg-studioLightBg dark:bg-zinc-950 font-semibold text-xs text-amber-300">
            ${archetypeOptionsHtml}
          </select>
          <button type="button" id="btn-mod12-add-archetype-char" class="px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/35 border border-amber-500/40 text-amber-300 font-bold text-[11px] transition">
            👤 + Thêm Từ Hình Mẫu
          </button>
          <button type="button" id="btn-mod12-scan-manuscript-chars" class="px-3 py-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/15 hover:bg-indigo-500/30 text-indigo-300 font-bold text-[11px] transition" title="Tự động quét các tên nhân vật trong câu thoại của chương đang mở để thêm vào Hồ sơ">
            🔍 Quét Nhân Vật Từ Bản Thảo
          </button>
          <button type="button" id="btn-mod12-audit-knowledge-leaks" class="px-3 py-1.5 rounded-xl border border-rose-500/40 bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 font-bold text-[11px] transition" title="Kiểm tra xem chương đang mở có vô tình để lộ bí mật hoặc lệch xưng hô không">
            🛡️ Kiểm Toán Lộ Bí Mật & Xưng Hô
          </button>
        </div>
      `;

      // Chèn ngay dưới phần header đầu tiên của Tab 4
      const firstChild = bibleMainView.firstElementChild;
      if (firstChild && firstChild.nextSibling) {
        bibleMainView.insertBefore(toolbar, firstChild.nextSibling);
      } else {
        bibleMainView.prepend(toolbar);
      }

      document
        .getElementById('btn-mod12-apply-genre-preset')
        ?.addEventListener('click', () => {
          const sel = document.getElementById('mod12-select-genre-preset');
          if (sel) this.applyGenrePresetTemplate(sel.value);
        });

      document
        .getElementById('btn-mod12-add-archetype-char')
        ?.addEventListener('click', () => {
          const sel = document.getElementById('mod12-select-char-archetype');
          if (sel) this.addCharacterFromArchetype(sel.value);
        });

      document
        .getElementById('btn-mod12-scan-manuscript-chars')
        ?.addEventListener('click', () => {
          this.scanActiveChapterAndSuggestCharacters();
        });

      document
        .getElementById('btn-mod12-audit-knowledge-leaks')
        ?.addEventListener('click', () => {
          this.runKnowledgeAndPronounAuditOnActiveChapter();
        });
    }

    /**
     * Nạp một Khung cấu trúc mẫu theo thể loại (Light Novel / Trinh Thám / Tiên Hiệp / Đô Thị / Huyền Huyễn)
     */
    applyGenrePresetTemplate(presetId) {
      const preset =
        STORY_BIBLE_GENRE_PRESETS[presetId] ||
        STORY_BIBLE_GENRE_PRESETS.DEFAULT_UNIVERSAL;
      if (this.templateLocked) {
        this.utils.showToast(
          '🔒 Khung Cấu Trúc đang khóa! Hãy bấm mở khóa trước khi đổi sang mẫu thể loại mới.',
          'warning'
        );
        return;
      }

      const tplEl = document.getElementById('textarea-bible-template-frame');
      const renEl = document.getElementById('textarea-rendered-bible-content');
      const antiEl = document.getElementById('textarea-anti-cliche-blacklist');

      if (
        tplEl &&
        tplEl.value.trim().length > 40 &&
        !window.confirm(
          `Áp dụng khung mẫu "${preset.label}" vào ô Khung Cấu Trúc Story Bible?\n(Nội dung Story Bible chính thức bên phải sẽ được giữ nguyên hoặc bổ sung nếu đang trống)`
        )
      ) {
        return;
      }

      this.activeGenrePresetId = preset.id;
      localStorage.setItem('noir_v38_active_bible_genre_preset', preset.id);

      if (tplEl) tplEl.value = preset.templateText;
      if (renEl && (!renEl.value.trim() || renEl.value.trim() === this.defaultTemplate.trim())) {
        renEl.value = preset.templateText;
      }
      if (antiEl && Array.isArray(preset.sampleAntiCliche)) {
        const existing = antiEl.value
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        const combined = [...new Set([...existing, ...preset.sampleAntiCliche])];
        antiEl.value = combined.join(', ');
      }

      this.saveAllBibleData(false);
      this.utils.showToast(
        `📚 Đã nạp mẫu cấu trúc "${preset.badge}" vào Story Bible!`,
        'success'
      );
    }

    /**
     * Thêm nhân vật mới dựa trên Hình mẫu Tâm lý (Archetype)
     */
    addCharacterFromArchetype(archetypeId) {
      const arch =
        CHARACTER_ARCHETYPE_LIBRARY.find((a) => a.id === archetypeId) ||
        CHARACTER_ARCHETYPE_LIBRARY[0];
      const customName = window.prompt(
        `Nhập tên cho nhân vật theo hình mẫu [${arch.label}]:`,
        'Lâm Phong'
      );
      if (!customName || !customName.trim()) return;

      this.characters.push({
        id: 'char_' + Date.now(),
        name: customName.trim(),
        role: arch.role,
        traits: `${arch.traits} (Vết thương tâm lý: ${arch.innerWound})`,
        speechStyle: arch.speechStyle,
        archetypeId: arch.id
      });

      this.renderCharactersUI();
      this.saveAllBibleData(true);
    }

    /**
     * Quét bản thảo chương đang mở để tự động phát hiện nhân vật mới từ câu thoại "- Câu thoại (Tên nhân vật)"
     */
    scanActiveChapterAndSuggestCharacters() {
      const editorText =
        document.getElementById('textarea-chapter-content')?.value ||
        window.NoirStudio?.chapterManager?.getActiveChapter()?.content ||
        '';
      if (!editorText.trim()) {
        this.utils.showToast(
          '⚠️ Bản thảo chương đang mở hiện chưa có nội dung để quét nhân vật.',
          'warning'
        );
        return;
      }

      const discovered = AutoLoreEntityExtractor.discoverNewCharactersFromManuscript(
        editorText,
        this.characters
      );

      if (discovered.length === 0) {
        this.utils.showToast(
          '✅ Tất cả nhân vật có câu thoại trong chương này đều đã nằm trong Hồ Sơ Nhân Vật!',
          'info',
          3200
        );
        return;
      }

      let addedCount = 0;
      discovered.forEach((d) => {
        if (
          window.confirm(
            `Phát hiện nhân vật "${d.name}" xuất hiện ${d.dialogueCount} lần trong câu thoại của chương hiện tại.\nBạn có muốn thêm "${d.name}" vào Hồ Sơ Nhân Vật Story Bible không?`
          )
        ) {
          this.characters.push({
            id: 'char_' + Date.now() + '_' + addedCount,
            name: d.name,
            role: d.suggestedRole,
            traits: 'Được trích xuất tự động từ bản thảo chương hiện tại',
            speechStyle: 'Nhất quán theo ngữ cảnh xuất hiện trong chương'
          });
          addedCount += 1;
        }
      });

      if (addedCount > 0) {
        this.renderCharactersUI();
        this.saveAllBibleData(true);
      }
    }

    /**
     * Kiểm toán nhanh xem bản thảo hiện tại có vi phạm Ma trận Ai Biết Gì hoặc lệch xưng hô không
     */
    runKnowledgeAndPronounAuditOnActiveChapter() {
      const editorText =
        document.getElementById('textarea-chapter-content')?.value ||
        window.NoirStudio?.chapterManager?.getActiveChapter()?.content ||
        '';
      if (!editorText.trim()) {
        this.utils.showToast('⚠️ Chương hiện tại đang trống, chưa có nội dung để kiểm toán.', 'warning');
        return;
      }

      const leaks = AsymmetricKnowledgeValidator.scanManuscriptForKnowledgeLeaks(
        editorText,
        this.knowledgeMatrix
      );
      const pronounWarnings = this.relationshipEngine.auditPronounConsistencyInText(
        editorText,
        this.characters
      );

      if (leaks.length === 0 && pronounWarnings.length === 0) {
        this.utils.showToast(
          '🛡️ Kiểm toán hoàn tất: Không phát hiện lỗi lộ bí mật sớm hay lệch đại từ xưng hô trong chương này!',
          'success',
          4000
        );
        return;
      }

      const reportLines = [];
      if (leaks.length > 0) {
        reportLines.push(`⚠️ PHÁT HIỆN ${leaks.length} NGHI VẤN LỘ BÍ MẬT SỚM:`);
        leaks.forEach((lk, i) => {
          reportLines.push(
            `  ${i + 1}. Nhân vật [${lk.speaker}] thuộc diện CHƯA BIẾT "${lk.secret}", nhưng câu thoại có chứa từ khóa (${lk.matchedKeywords.join(', ')}):\n     "${lk.excerpt}"`
          );
        });
      }
      if (pronounWarnings.length > 0) {
        reportLines.push(`\n⚠️ PHÁT HIỆN ${pronounWarnings.length} DÒNG THOẠI LỆCH ĐẠI TỪ XƯNG HÔ:`);
        pronounWarnings.forEach((pw, i) => {
          reportLines.push(`  ${i + 1}. Dòng #${pw.lineIndex}: ${pw.reason}\n     "${pw.line}"`);
        });
      }

      window.alert(reportLines.join('\n'));
    }

    /**
     * Cập nhật giao diện nút Khóa / Mở khóa Khung Cấu Trúc Story Bible
     */
    updateLockButtonUI() {
      const btn = document.getElementById('btn-toggle-bible-template-lock');
      const tplEl = document.getElementById('textarea-bible-template-frame');
      if (tplEl) tplEl.readOnly = this.templateLocked;
      if (!btn) return;
      if (this.templateLocked) {
        btn.className =
          'px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]';
        btn.textContent = '🔒 Đã Khóa Khung (Bấm để mở)';
      } else {
        btn.className =
          'px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px]';
        btn.textContent = '🔓 Chốt Khung Cấu Trúc';
      }
    }

    /**
     * Đổi trạng thái Khóa / Mở khóa Khung Cấu Trúc Story Bible
     */
    toggleTemplateLock() {
      const constants = getStudioConstants();
      this.templateLocked = !this.templateLocked;
      localStorage.setItem(
        constants.STORAGE_KEYS.BIBLE_LOCKED,
        String(this.templateLocked)
      );
      this.updateLockButtonUI();
      this.saveAllBibleData(false);
      this.utils.showToast(
        this.templateLocked
          ? '🔒 Đã khóa Khung Cấu Trúc Story Bible để bảo vệ các đề mục cốt lõi!'
          : '🔓 Đã mở khóa Khung Cấu Trúc Story Bible để bạn tự do chỉnh sửa.',
        'info'
      );
    }

    /**
     * Lưu toàn bộ dữ liệu Story Bible xuống LocalStorage, IndexedDB và Ổ cứng cục bộ
     */
    async saveAllBibleData(showFeedback = true) {
      const constants = getStudioConstants();
      const tplEl = document.getElementById('textarea-bible-template-frame');
      const renEl = document.getElementById('textarea-rendered-bible-content');
      const antiEl = document.getElementById('textarea-anti-cliche-blacklist');

      if (tplEl) {
        localStorage.setItem(constants.STORAGE_KEYS.BIBLE_TEMPLATE, tplEl.value);
      }
      if (renEl) {
        localStorage.setItem(constants.STORAGE_KEYS.BIBLE_RENDERED, renEl.value);
      }
      if (antiEl) {
        localStorage.setItem(constants.STORAGE_KEYS.ANTI_CLICHE, antiEl.value);
      }

      this.idb.setLocalJSON(constants.STORAGE_KEYS.CHARACTERS, this.characters);
      this.idb.setLocalJSON(
        constants.STORAGE_KEYS.KNOWLEDGE_MATRIX,
        this.knowledgeMatrix
      );
      this.idb.setLocalJSON(constants.STORAGE_KEYS.CLUES_LEDGER, this.cluesLedger);
      this.relationshipEngine.saveRelationships();

      if (typeof this.idb.set === 'function') {
        await this.idb.set(constants.STORES.STORY_BIBLE, 'master_bible_v36', {
          template: tplEl?.value || '',
          rendered: renEl?.value || '',
          characters: this.characters,
          relationships: this.relationshipEngine.relationships,
          knowledgeMatrix: this.knowledgeMatrix,
          cluesLedger: this.cluesLedger,
          antiCliche: antiEl?.value || '',
          updatedAt: Date.now()
        });
      }

      if (this.fs && this.fs.rootHandle && typeof this.fs.writeTextFile === 'function') {
        await this.fs.writeTextFile(
          '03_Story_Bible_Local',
          'Story_Bible_Chinh_Thuc.txt',
          this.buildCompiledBibleBlockForPrompt()
        );
      }

      this.renderQuickCharacterChipsInTab1();
      this.updateCommandModalStatusPills();

      if (showFeedback) {
        this.utils.showToast(
          '🏛️ Đã lưu toàn bộ Story Bible, Nhân vật, Ma trận Ai Biết Gì & Phục bút (Sẵn sàng tích hợp vào Prompt Tổng)!',
          'success'
        );
      }
    }

    /**
     * Kết xuất danh sách Hồ sơ Nhân vật đa chiều (#character-profiles-list) tại Tab 4
     * kèm Ma trận Quan hệ & Xưng hô giữa các nhân vật
     */
    renderCharactersUI() {
      const charsBadge = document.getElementById('tab4-chars-count-badge');
      if (charsBadge) charsBadge.textContent = `${this.characters.length} NV`;
      const box = document.getElementById('character-profiles-list');
      if (!box) return;
      if (this.characters.length === 0) {
        box.innerHTML =
          '<div class="text-zinc-500 italic p-2">Chưa có hồ sơ nhân vật. Hãy bấm "+ Thêm Nhân Vật" hoặc chọn từ Hình mẫu để tạo!</div>';
        return;
      }

      const charCardsHtml = this.characters
        .map(
          (ch) => `
          <div class="p-3 rounded-xl border border-studioLightBorder dark:border-zinc-800 bg-studioLightBg dark:bg-zinc-950 space-y-1.5">
            <div class="flex items-center justify-between gap-2">
              <div class="font-extrabold text-xs text-emerald-400">👤 ${this.utils.escapeHtml(
                ch.name
              )} <span class="text-[10px] font-semibold text-zinc-400">(${this.utils.escapeHtml(
                ch.role || 'Nhân vật'
              )})</span></div>
              <div class="flex items-center gap-1">
                <button type="button" data-rel-char="${this.utils.escapeHtml(
                  ch.id
                )}" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-teal-600 text-[10px] text-teal-200 font-bold" title="Thiết lập quan hệ & đại từ xưng hô với nhân vật khác">🤝 Quan hệ</button>
                <button type="button" data-edit-char="${this.utils.escapeHtml(
                  ch.id
                )}" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-indigo-600 text-[10px] text-white font-bold">✏️ Sửa</button>
                <button type="button" data-del-char="${this.utils.escapeHtml(
                  ch.id
                )}" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-rose-600 text-[10px] text-white font-bold">✕</button>
              </div>
            </div>
            <div class="text-[11px] text-zinc-300"><strong>Tính cách & Đặc điểm:</strong> ${this.utils.escapeHtml(
              ch.traits || 'Chưa mô tả'
            )}</div>
            <div class="text-[11px] text-amber-300/90"><strong>Giọng thoại & Xưng hô:</strong> ${this.utils.escapeHtml(
              ch.speechStyle || 'Tự nhiên'
            )}</div>
          </div>
        `
        )
        .join('');

      const rels = this.relationshipEngine.relationships || [];
      const relSectionHtml =
        rels.length > 0
          ? `<div class="mt-3 pt-2.5 border-t border-zinc-800 space-y-1.5">
              <div class="text-[11px] font-extrabold uppercase text-teal-400">🤝 Ma Trận Xưng Hô & Quan Hệ Đã Khóa (${rels.length}):</div>
              ${rels
                .map(
                  (r) => `
                  <div class="px-2.5 py-1.5 rounded-lg border border-teal-500/30 bg-zinc-900/90 flex items-center justify-between gap-2 text-[11px]">
                    <div>
                      <strong class="text-emerald-300">${this.utils.escapeHtml(
                        r.sourceChar
                      )}</strong> ➔ <strong class="text-amber-300">${this.utils.escapeHtml(
                        r.targetChar
                      )}</strong>
                      <span class="text-zinc-400">(${this.utils.escapeHtml(
                        r.relationLabel
                      )})</span>:
                      <span class="text-teal-200 font-semibold">Xưng hô "${this.utils.escapeHtml(
                        r.pronounPair
                      )}"</span>
                    </div>
                    <button type="button" data-del-char-rel="${this.utils.escapeHtml(
                      r.id
                    )}" class="text-zinc-400 hover:text-rose-400 font-bold">✕</button>
                  </div>
                `
                )
                .join('')}
            </div>`
          : '';

      box.innerHTML = charCardsHtml + relSectionHtml;

      // Sự kiện sửa nhân vật
      box.querySelectorAll('[data-edit-char]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-edit-char');
          const ch = this.characters.find((x) => x.id === id);
          if (!ch) return;
          const name = window.prompt('Tên nhân vật:', ch.name);
          if (!name) return;
          const role = window.prompt('Vai trò trong truyện:', ch.role || '') ?? ch.role;
          const traits =
            window.prompt('Tính cách, ngoại hình, mục tiêu:', ch.traits || '') ?? ch.traits;
          const speechStyle =
            window.prompt('Giọng điệu câu thoại & Cách xưng hô:', ch.speechStyle || '') ??
            ch.speechStyle;
          ch.name = name.trim();
          ch.role = role.trim();
          ch.traits = traits.trim();
          ch.speechStyle = speechStyle.trim();
          this.renderCharactersUI();
          this.saveAllBibleData(false);
        });
      });

      // Sự kiện xóa nhân vật
      box.querySelectorAll('[data-del-char]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-del-char');
          this.characters = this.characters.filter((x) => x.id !== id);
          this.renderCharactersUI();
          this.saveAllBibleData(false);
        });
      });

      // Sự kiện thêm mối quan hệ & đại từ xưng hô giữa 2 nhân vật
      box.querySelectorAll('[data-rel-char]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-rel-char');
          const srcChar = this.characters.find((x) => x.id === id);
          if (!srcChar) return;
          const otherNames = this.characters
            .filter((x) => x.id !== id)
            .map((x) => x.name)
            .join(', ');
          const targetName = window.prompt(
            `Thiết lập quan hệ từ [${srcChar.name}] tới nhân vật nào? ${
              otherNames ? `(Gợi ý: ${otherNames})` : ''
            }`,
            this.characters.find((x) => x.id !== id)?.name || ''
          );
          if (!targetName || !targetName.trim()) return;
          const relLabel =
            window.prompt(
              `Mối quan hệ giữa [${srcChar.name}] và [${targetName.trim()}] là gì?`,
              'Đồng đội tin cậy / Đối thủ'
            ) || 'Đồng hành';
          const pronounPair =
            window.prompt(
              `Cách xưng hô bắt buộc khi [${srcChar.name}] nói chuyện với [${targetName.trim()}] (Ví dụ: tôi - cậu, anh - em, ta - đạo hữu):`,
              'tôi - cậu'
            ) || 'tôi - cậu';

          this.relationshipEngine.addOrUpdateRelationship({
            sourceChar: srcChar.name,
            targetChar: targetName.trim(),
            relationLabel: relLabel.trim(),
            pronounPair: pronounPair.trim()
          });
          this.renderCharactersUI();
          this.saveAllBibleData(true);
        });
      });

      // Sự kiện xóa mối quan hệ
      box.querySelectorAll('[data-del-char-rel]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const relId = btn.getAttribute('data-del-char-rel');
          this.relationshipEngine.deleteRelationship(relId);
          this.renderCharactersUI();
          this.saveAllBibleData(false);
        });
      });
    }

    /**
     * Thêm nhân vật mới tương tác trực tiếp từ nút "+ Thêm Nhân Vật"
     */
    addCharacterInteractive() {
      const name = window.prompt('Nhập tên nhân vật mới (Ví dụ: Lâm Phong):');
      if (!name || !name.trim()) return;
      const role =
        window.prompt(
          'Vai trò của nhân vật (Ví dụ: Nhân vật chính / Phản diện):',
          'Nhân vật chính'
        ) || 'Nhân vật';
      const traits =
        window.prompt(
          'Tính cách, khả năng & động cơ cốt lõi:',
          'Thông minh, quyết đoán, mang bí mật quá khứ'
        ) || '';
      const speechStyle =
        window.prompt(
          'Cách xưng hô & Giọng điệu khi đối thoại:',
          'Điềm đạm, câu văn sắc gọn, xưng "tôi - cậu"'
        ) || '';

      this.characters.push({
        id: 'char_' + Date.now(),
        name: name.trim(),
        role: role.trim(),
        traits: traits.trim(),
        speechStyle: speechStyle.trim()
      });
      this.renderCharactersUI();
      this.saveAllBibleData(true);
    }

    /**
     * Kết xuất các nút Chèn Thoại Nhanh (#quick-character-chips-bar) trên thanh công cụ Bàn viết Tab 1
     * để tác giả bấm 1 chạm là chèn ngay câu thoại chuẩn `- ... (Tên nhân vật)`
     */
    renderQuickCharacterChipsInTab1() {
      const bar = document.getElementById('quick-character-chips-bar');
      if (!bar) return;
      if (this.characters.length === 0) {
        bar.innerHTML = '';
        return;
      }
      bar.innerHTML =
        `<span class="text-[10px] text-zinc-400 font-bold mr-1">Chèn thoại nhanh:</span>` +
        this.characters
          .slice(0, 6)
          .map(
            (c) =>
              `<button type="button" data-quick-char-name="${this.utils.escapeHtml(
                c.name
              )}" class="px-2 py-0.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-300 text-[10px] font-bold transition" title="Chèn câu thoại chuẩn của ${this.utils.escapeHtml(
                c.name
              )} vào vị trí con trỏ">💬 ${this.utils.escapeHtml(c.name)}</button>`
          )
          .join('');

      bar.querySelectorAll('[data-quick-char-name]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const charName = btn.getAttribute('data-quick-char-name');
          const editor = document.getElementById('textarea-chapter-content');
          if (!editor) return;
          const start = editor.selectionStart ?? editor.value.length;
          const end = editor.selectionEnd ?? editor.value.length;
          const selected = editor.value.slice(start, end).trim();
          const lineToInsert = selected
            ? `- ${selected} (${charName})`
            : `\n- ... (${charName})`;
          editor.setRangeText(lineToInsert, start, end, 'end');
          editor.focus();
          editor.dispatchEvent(new Event('input'));
        });
      });
    }

    /**
     * Kết xuất Ma trận Bất đối xứng "Ai Biết Gì" (#knowledge-matrix-list) tại Tab 4
     */
    renderKnowledgeMatrixUI() {
      const knowBadge = document.getElementById('tab4-knowledge-count-badge');
      if (knowBadge) knowBadge.textContent = `${this.knowledgeMatrix.length} Bí mật`;
      const box = document.getElementById('knowledge-matrix-list');
      if (!box) return;
      if (this.knowledgeMatrix.length === 0) {
        box.innerHTML =
          '<div class="text-zinc-500 italic p-2">Chưa có mục nào trong Ma trận Ai Biết Gì.</div>';
        return;
      }
      box.innerHTML = this.knowledgeMatrix
        .map(
          (item) => `
          <div class="p-3 rounded-xl border border-amber-500/30 bg-studioLightBg dark:bg-zinc-950 space-y-1">
            <div class="flex items-center justify-between gap-2">
              <span class="font-extrabold text-xs text-amber-400">🔒 Bí mật: ${this.utils.escapeHtml(
                item.secret
              )}</span>
              <div class="flex items-center gap-1">
                <button type="button" data-edit-know="${this.utils.escapeHtml(
                  item.id
                )}" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-indigo-600 text-[10px] text-white font-bold">✏️ Sửa</button>
                <button type="button" data-del-know="${this.utils.escapeHtml(
                  item.id
                )}" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-rose-600 text-[10px] text-white font-bold">✕</button>
              </div>
            </div>
            <div class="text-[11px] text-emerald-300"><strong>✔ Người ĐÃ BIẾT:</strong> ${this.utils.escapeHtml(
              item.whoKnows
            )}</div>
            <div class="text-[11px] text-rose-300"><strong>✘ Người CHƯA BIẾT (Cấm AI lộ):</strong> ${this.utils.escapeHtml(
              item.whoDoesNotKnow
            )}</div>
          </div>
        `
        )
        .join('');

      box.querySelectorAll('[data-edit-know]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-edit-know');
          const item = this.knowledgeMatrix.find((x) => x.id === id);
          if (!item) return;
          const secret = window.prompt('Nội dung bí mật / sự thật:', item.secret);
          if (!secret || !secret.trim()) return;
          const whoKnows =
            window.prompt('Những nhân vật ĐÃ BIẾT sự thật này:', item.whoKnows) ?? item.whoKnows;
          const whoDoesNotKnow =
            window.prompt(
              'Những nhân vật TUYỆT ĐỐI CHƯA BIẾT (Cấm AI để lộ):',
              item.whoDoesNotKnow
            ) ?? item.whoDoesNotKnow;
          item.secret = secret.trim();
          item.whoKnows = whoKnows.trim();
          item.whoDoesNotKnow = whoDoesNotKnow.trim();
          this.renderKnowledgeMatrixUI();
          this.saveAllBibleData(false);
        });
      });

      box.querySelectorAll('[data-del-know]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-del-know');
          this.knowledgeMatrix = this.knowledgeMatrix.filter((x) => x.id !== id);
          this.renderKnowledgeMatrixUI();
          this.saveAllBibleData(false);
        });
      });
    }

    /**
     * Thêm một mục mới vào Ma trận "Ai Biết Gì"
     */
    addKnowledgeEntryInteractive() {
      const secret = window.prompt('Nhập bí mật / sự thật quan trọng trong cốt truyện:');
      if (!secret || !secret.trim()) return;
      const whoKnows =
        window.prompt('Những nhân vật nào ĐÃ BIẾT sự thật này?', 'Chỉ kẻ chủ mưu') ||
        'Chưa rõ';
      const whoDoesNotKnow =
        window.prompt(
          'Những nhân vật nào TUYỆT ĐỐI CHƯA BIẾT (AI không được phép viết lộ ra)?',
          'Nhân vật chính'
        ) || 'Nhân vật chính';

      this.knowledgeMatrix.push({
        id: 'know_' + Date.now(),
        secret: secret.trim(),
        whoKnows: whoKnows.trim(),
        whoDoesNotKnow: whoDoesNotKnow.trim()
      });
      this.renderKnowledgeMatrixUI();
      this.saveAllBibleData(true);
    }

    /**
     * Kết xuất Sổ cái Phục bút & Manh mối (#clues-ledger-list) tại Tab 4
     */
    renderCluesLedgerUI() {
      const cluesBadge = document.getElementById('tab4-clues-count-badge');
      if (cluesBadge) cluesBadge.textContent = `${this.cluesLedger.length} Phục bút`;
      const box = document.getElementById('clues-ledger-list');
      if (!box) return;
      if (this.cluesLedger.length === 0) {
        box.innerHTML =
          '<div class="text-zinc-500 italic p-2">Chưa có phục bút nào. Hãy bấm "+ Gieo Phục Bút Mới"!</div>';
        return;
      }
      box.innerHTML = this.cluesLedger
        .map(
          (clue) => `
          <div class="p-3 rounded-xl border border-indigo-500/30 bg-studioLightBg dark:bg-zinc-950 space-y-1">
            <div class="flex items-center justify-between gap-2">
              <span class="font-extrabold text-xs text-indigo-300">🔫 ${this.utils.escapeHtml(
                clue.title
              )}</span>
              <div class="flex items-center gap-1">
                <button type="button" data-toggle-clue="${this.utils.escapeHtml(
                  clue.id
                )}" class="px-2 py-0.5 rounded text-[10px] font-bold ${
            clue.status === 'RESOLVED'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
          }">${clue.status === 'RESOLVED' ? '✅ Đã thu hồi' : '⏳ Đang cài cắm'}</button>
                <button type="button" data-edit-clue="${this.utils.escapeHtml(
                  clue.id
                )}" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-indigo-600 text-[10px] text-white font-bold">✏️</button>
                <button type="button" data-del-clue="${this.utils.escapeHtml(
                  clue.id
                )}" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-rose-600 text-[10px] text-white font-bold">✕</button>
              </div>
            </div>
            <div class="text-[11px] text-zinc-400">Gieo tại: <strong>${this.utils.escapeHtml(
              clue.plantedIn || 'Chương 1'
            )}</strong> — ${this.utils.escapeHtml(clue.note || '')}</div>
          </div>
        `
        )
        .join('');

      box.querySelectorAll('[data-toggle-clue]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-toggle-clue');
          const c = this.cluesLedger.find((x) => x.id === id);
          if (c) {
            c.status = c.status === 'RESOLVED' ? 'PLANTED' : 'RESOLVED';
            this.renderCluesLedgerUI();
            this.saveAllBibleData(false);
          }
        });
      });

      box.querySelectorAll('[data-edit-clue]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-edit-clue');
          const c = this.cluesLedger.find((x) => x.id === id);
          if (!c) return;
          const title = window.prompt('Tên phục bút / vật chứng:', c.title);
          if (!title || !title.trim()) return;
          const plantedIn = window.prompt('Gieo tại chương nào?', c.plantedIn || '') ?? c.plantedIn;
          const note = window.prompt('Ý nghĩa & Kế hoạch thu hồi:', c.note || '') ?? c.note;
          c.title = title.trim();
          c.plantedIn = plantedIn.trim();
          c.note = note.trim();
          this.renderCluesLedgerUI();
          this.saveAllBibleData(false);
        });
      });

      box.querySelectorAll('[data-del-clue]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-del-clue');
          this.cluesLedger = this.cluesLedger.filter((x) => x.id !== id);
          this.renderCluesLedgerUI();
          this.saveAllBibleData(false);
        });
      });
    }

    /**
     * Gieo một Phục bút mới từ nút "+ Gieo Phục Bút Mới"
     */
    addClueEntryInteractive() {
      const title = window.prompt('Tên phục bút / vật chứng / chi tiết cài cắm:');
      if (!title || !title.trim()) return;
      const plantedIn =
        window.prompt('Được gieo ở chương nào?', 'Chương hiện tại') || 'Chương hiện tại';
      const note =
        window.prompt('Ý nghĩa hoặc dự kiến chương sẽ thu hồi phục bút này:', '') || '';

      this.cluesLedger.push({
        id: 'clue_' + Date.now(),
        title: title.trim(),
        plantedIn: plantedIn.trim(),
        status: 'PLANTED',
        note: note.trim()
      });
      this.renderCluesLedgerUI();
      this.saveAllBibleData(true);
    }

    /**
     * Cập nhật huy hiệu trạng thái Story Bible trên Cửa sổ Trung tâm Điều khiển AI (#cmd-bible-status-pill)
     */
    updateCommandModalStatusPills() {
      const constants = getStudioConstants();
      const biblePill = document.getElementById('cmd-bible-status-pill');
      if (biblePill) {
        const ren =
          document.getElementById('textarea-rendered-bible-content')?.value ||
          localStorage.getItem(constants.STORAGE_KEYS.BIBLE_RENDERED) ||
          '';
        const words = this.utils.countVietnameseWords(ren);
        biblePill.textContent = `Story Bible: Đã nạp (${words} từ • ${this.characters.length} NV • ${this.cluesLedger.length} Phục bút)`;
      }
    }

    /**
     * Tổng hợp toàn bộ dữ liệu Story Bible + Nhân vật + Quan hệ Xưng hô + Ma trận Ai Biết Gì
     * + Phục bút + Từ cấm thành một khối ngữ cảnh chuẩn mực để tự động đưa 100% vào Prompt Tổng Hợp!
     */
    buildCompiledBibleBlockForPrompt() {
      const constants = getStudioConstants();
      const tpl =
        document.getElementById('textarea-bible-template-frame')?.value ||
        localStorage.getItem(constants.STORAGE_KEYS.BIBLE_TEMPLATE) ||
        '';
      const ren =
        document.getElementById('textarea-rendered-bible-content')?.value ||
        localStorage.getItem(constants.STORAGE_KEYS.BIBLE_RENDERED) ||
        '';
      const anti =
        document.getElementById('textarea-anti-cliche-blacklist')?.value ||
        localStorage.getItem(constants.STORAGE_KEYS.ANTI_CLICHE) ||
        (constants.DEFAULT_ANTI_CLICHE || STORY_BIBLE_GENRE_PRESETS.DEFAULT_UNIVERSAL.sampleAntiCliche).join(', ');

      const charLines =
        this.characters.length > 0
          ? this.characters
              .map(
                (c, i) =>
                  `  ${i + 1}. [${c.name}] (${c.role || 'Nhân vật'}):\n     - Tính cách & Đặc điểm: ${
                    c.traits || 'Chưa ghi'
                  }\n     - Giọng thoại & Xưng hô bắt buộc: ${c.speechStyle || 'Tự nhiên'}`
              )
              .join('\n')
          : '  (Chưa khai báo danh sách nhân vật riêng)';

      const relBlock = this.relationshipEngine.buildRelationshipPromptSection();

      const knowLines =
        this.knowledgeMatrix.length > 0
          ? this.knowledgeMatrix
              .map(
                (k, i) =>
                  `  ${i + 1}. Bí mật "${k.secret}":\n     - Ai ĐÃ BIẾT: ${
                    k.whoKnows
                  }\n     - Ai CHƯA BIẾT (Tuyệt đối không được để lộ trong lời nói/suy nghĩ của họ): ${
                    k.whoDoesNotKnow
                  }`
              )
              .join('\n')
          : '  (Không có giới hạn bí mật đặc biệt)';

      const clueLines =
        this.cluesLedger.length > 0
          ? this.cluesLedger
              .map(
                (cl, i) =>
                  `  ${i + 1}. [${
                    cl.status === 'RESOLVED' ? 'ĐÃ THU HỒI' : 'ĐANG GIEO - CẦN DUY TRÌ LOGIC'
                  }] ${cl.title} (Gieo tại: ${cl.plantedIn}) — Ghi chú: ${cl.note || 'Không'}`
              )
              .join('\n')
          : '  (Chưa có phục bút nào)';

      return [
        `====================================================================`,
        `🏛️ HỒ SƠ STORY BIBLE & LUẬT BẤT KHẢ XÂM PHẠM (ĐÃ LIÊN KẾT TỰ ĐỘNG)`,
        `====================================================================`,
        `[1. NỘI DUNG STORY BIBLE CHÍNH THỨC]:`,
        ren.trim() || tpl.trim() || '(Chưa có nội dung Story Bible)',
        ``,
        `[2. HỒ SƠ NHÂN VẬT & GIỌNG ĐIỆU ĐỐI THOẠI]:`,
        charLines,
        relBlock,
        ``,
        `[3. MA TRẬN BẤT ĐỐI XỨNG "AI BIẾT GÌ" (CHỐNG LỘ BÍ MẬT SỚM)]:`,
        knowLines,
        ``,
        `[4. SỔ CÁI PHỤC BÚT & MANH MỐI (CHEKHOV'S GUN)]:`,
        clueLines,
        ``,
        `[5. DANH SÁCH TỪ SÁO RỖNG CẤM AI SỬ DỤNG]:`,
        `Tuyệt đối tránh dùng các cụm từ sáo rỗng sau: ${anti}`
      ]
        .filter((line) => line !== undefined)
        .join('\n');
    }
  }

  // ==========================================================================
  // PHẦN 8: KHỞI TẠO ĐỐI TƯỢNG TOÀN CỤC & ĐĂNG KÝ VÀO WINDOW.NOIRSTUDIO
  // ==========================================================================
  const storyBibleEngine = new StoryBibleAndLoreMatrixEngine(
    window.NoirStudio?.idb || null,
    window.NoirStudio?.fsEngine || null,
    window.NoirStudio?.utils || null
  );

  window.StoryBibleAndLoreMatrixEngine = StoryBibleAndLoreMatrixEngine;
  window.STORY_BIBLE_GENRE_PRESETS = STORY_BIBLE_GENRE_PRESETS;
  window.CHARACTER_ARCHETYPE_LIBRARY = CHARACTER_ARCHETYPE_LIBRARY;
  window.VIETNAMESE_PRONOUN_PRESETS = VIETNAMESE_PRONOUN_PRESETS;
  window.CHEKHOV_CLUE_PRESET_PACKS = CHEKHOV_CLUE_PRESET_PACKS;
  window.KNOWLEDGE_MATRIX_PRESET_PACKS = KNOWLEDGE_MATRIX_PRESET_PACKS;
  window.NoirStudio.storyBible = storyBibleEngine;
  window.NoirStudio.bibleEngine = storyBibleEngine;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      storyBibleEngine.init();
    });
  } else {
    setTimeout(() => {
      storyBibleEngine.init();
    }, 0);
  }
})();
