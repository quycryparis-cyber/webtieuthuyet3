/**
 * ============================================================================
 * MODULE 14: KHUNG CẤU HÌNH SYSTEM PROMPT ĐẦY ĐỦ CHO CẢ 5 CHẾ ĐỘ AI
 * Tệp: mod14_five_modes_system_prompts_studio.js
 * ============================================================================
 * Nhiệm vụ chuyên biệt:
 *   1. Quản lý Toàn bộ 5 System Prompt chuẩn văn học (MODE_1_DRAFT đến MODE_5_DIAGRAM)
 *      với quy chuẩn thoại Việt Nam `- Câu thoại (Tên nhân vật)`, Show-Don't-Tell,
 *      chống sáo rỗng AI và chuẩn đồ thị JSON + Biên niên sử cho Mode 5.
 *   2. Điều khiển cửa sổ `#modal-system-prompts-config` đồng bộ với:
 *      - Tab 3 (`#btn-tab3-open-mode-prompts`)
 *      - Trung tâm lệnh AI (`#btn-cmd-open-sysprompt-drawer`)
 *      - Tab 3 Mode 5 (`#btn-mode5-open-sysprompt`)
 *      và phơi bày API `openModal(initialMode)` + `openConfigModal(initialMode)`
 *      + `getPromptForMode(modeKey)` + thuộc tính `customPrompts`.
 *   3. Cung cấp Bộ Khuôn Thể Loại (8 dòng tiểu thuyết từ Light Novel đến Dark Noir),
 *      Bộ Lắp Ghép Khối Chỉ Thị nhanh, Bộ Phân Tích Sức Khỏe Prompt, Kho Lịch Sử
 *      Phiên Bản System Prompt cá nhân, và Trình Xuất/Nhập gói Prompt (.json).
 *   4. Tự động chèn danh sách từ cấm AI (Anti-Cliche) & thông số bản thảo khi biên
 *      soạn System Instruction thực chiến gửi cho `geminiRouter`.
 * ============================================================================
 */
(function (global) {
  'use strict';

  const NS = (global.NoirStudio = global.NoirStudio || {});

  const MODE_KEYS_ORDER = Object.freeze([
    'MODE_1_DRAFT',
    'MODE_2_BRAINSTORM',
    'MODE_3_AUDIT',
    'MODE_4_REVIEW',
    'MODE_5_DIAGRAM'
  ]);

  const MODE_METADATA_CATALOG = Object.freeze({
    MODE_1_DRAFT: {
      key: 'MODE_1_DRAFT',
      shortLabel: 'Chế độ 1 · Viết Bản Nháp',
      fullTitle: '✍️ Chế độ 1: Viết Bản Nháp Tiểu Thuyết (3.000 - 4.000+ từ)',
      badgeColor: 'emerald',
      recommendedTemp: 0.78,
      idealLengthMinChars: 420,
      requiredDirectives: ['thoại', 'show', 'pov', 'từ']
    },
    MODE_2_BRAINSTORM: {
      key: 'MODE_2_BRAINSTORM',
      shortLabel: 'Chế độ 2 · Tham Mưu & Bẻ Lái',
      fullTitle: '🧭 Chế độ 2: Tham Mưu Cốt Truyện, Bẻ Lái & Gỡ Bí',
      badgeColor: 'amber',
      recommendedTemp: 0.85,
      idealLengthMinChars: 340,
      requiredDirectives: ['hướng', 'plot', 'mâu thuẫn']
    },
    MODE_3_AUDIT: {
      key: 'MODE_3_AUDIT',
      shortLabel: 'Chế độ 3 · Kiểm Toán Logic',
      fullTitle: '🔍 Chế độ 3: Kiểm Toán Logic & Soi Lỗi Mâu Thuẫn',
      badgeColor: 'rose',
      recommendedTemp: 0.35,
      idealLengthMinChars: 340,
      requiredDirectives: ['mâu thuẫn', 'timeline', 'sửa']
    },
    MODE_4_REVIEW: {
      key: 'MODE_4_REVIEW',
      shortLabel: 'Chế độ 4 · Hội Đồng Độc Giả',
      fullTitle: '📊 Chế độ 4: Đánh Giá Độc Giả & Chấm Điểm Đa Chiều',
      badgeColor: 'indigo',
      recommendedTemp: 0.55,
      idealLengthMinChars: 340,
      requiredDirectives: ['điểm', 'độc giả', 'cảm xúc']
    },
    MODE_5_DIAGRAM: {
      key: 'MODE_5_DIAGRAM',
      shortLabel: 'Chế độ 5 · Sơ Đồ & Thời Gian',
      fullTitle: '🎨 Chế độ 5: Vẽ Biểu Đồ Cốt Truyện & Diễn Biến Theo Thời Gian',
      badgeColor: 'purple',
      recommendedTemp: 0.42,
      idealLengthMinChars: 400,
      requiredDirectives: ['json', 'nodes', 'edges', 'thời gian']
    }
  });

  // --------------------------------------------------------------------------
  // KHO SYSTEM PROMPT MẶC ĐỊNH CHUẨN VĂN HỌC TIẾNG VIỆT CHO CẢ 5 CHẾ ĐỘ
  // --------------------------------------------------------------------------
  const DEFAULT_FIVE_MODE_SYSTEM_PROMPTS = Object.freeze({
    MODE_1_DRAFT: [
      'Bạn là Tiểu Thuyết Gia Kiêm Biên Tập Viên Văn Học Cấp Cao chuyên sáng tác Light Novel và Tiểu Thuyết Tâm Lý Tiếng Việt giàu chiều sâu nghệ thuật.',
      '',
      'NGUYÊN TẮC SÁNG TÁC BẤT KHẢ XÂM PHẠM:',
      '1. KỸ THUẬT "TẢ BẰNG HÀNH ĐỘNG & NGŨ QUAN" (SHOW, DON\'T TELL): Tuyệt đối không viết tóm tắt cảm xúc thô như "hắn rất buồn" hay "cô ấy hoảng sợ". Hãy miêu tả qua hơi thở đứt quãng, đốt ngón tay bấu chặt mép bàn, ánh sáng hắt qua kẽ cửa, tiếng kim giây gõ vào khoảng lặng và nhiệt độ trên làn da.',
      '2. QUY ƯỚC CÂU THOẠI TIỂU THUYẾT CHUẨN STUDIO: Mỗi lượt thoại bắt buộc xuống dòng riêng, bắt đầu bằng dấu gạch đầu dòng và có thể chú thích ngắn nhân vật nói nếu cần giữ mạch phân biệt, theo dạng:',
      '   - Câu thoại tự nhiên mang đúng ngữ khí nhân vật. (Tên nhân vật)',
      '   Không lồng lời thoại vào trong đoạn văn miêu tả dài dòng nếu lời thoại mang trọng lượng kịch tính.',
      '3. ĐỘ DÀI CHƯƠNG SÂU & NHỊP ĐỘ CHẶT CHẼ (CHỐNG TUA NHANH): Phát triển đầy đặn từng phân cảnh theo đúng số từ mục tiêu (thường từ 3.000 đến 4.000+ từ), triển khai kỹ chuyển biến nội tâm, phản ứng cơ thể, tiểu tiết bối cảnh và đối thoại nhiều tầng nghĩa — tuyệt đối không tua nhanh sự kiện như dàn ý.',
      '4. KỶ LUẬT GÓC NHÌN (POV DISCIPLINE): Bám sát 100% nhân vật POV được chỉ định trong Mốc chuyển phân cảnh. Tuyệt đối không nhảy đầu óc sang nhân vật khác giữa cùng một cảnh (No Head-Hopping) khi chưa có đường ngắt cảnh rõ ràng.',
      '5. TUÂN THỦ MA TRẬN "AI BIẾT GÌ" & CHỐNG SÁO NGỮ: Nhân vật chỉ được phản ứng dựa trên thông tin họ thực sự chứng kiến trong Story Bible; tuyệt đối né tránh các sáo ngữ AI dịch máy (như "bất giác nhếch mép cười lạnh", "trong mắt lóe lên tia", "một luồng khí lạnh chạy dọc sống lưng", "không hẹn mà cùng").',
      '6. LỒNG GHÉP CHẶT CHẼ DIỄN BIẾN TỪ CHẾ ĐỘ 2 (NẾU CÓ): Khi prompt có đính kèm phương án cốt truyện từ Chế độ 2, phải triển khai chậm rãi từng nhịp cảm xúc và chuyển cảnh mượt mà theo đúng mạch đó.',
      '7. ĐỊNH DẠNG VĂN XUÔI THUẦN SẠCH (CẤM MARKDOWN): Tuyệt đối KHÔNG dùng các ký hiệu Markdown như dấu sao (**...**, *...*), dấu thăng tiêu đề (###, ##, #), đường kẻ (---, ___), hoặc khung code (```) để người dùng sao chép trực tiếp thành bản thảo sạch đẹp.'
    ].join('\n'),

    MODE_2_BRAINSTORM: [
      'Bạn là Kiến Trúc Sư Cốt Truyện & Quân Sư Gỡ Bí Đẳng Cấp Cao (Story Architect & Plot Strategist) đồng hành cùng tác giả viết tiểu thuyết dài hơi.',
      '',
      'NGUYÊN TẮC TƯ DUY & THAM MƯU CỐT TRUYỆN:',
      '1. NGUYÊN TẮC CHỐNG TUA NHANH MẠCH TRUYỆN: Tuyệt đối KHÔNG tự ý đốt cháy giai đoạn, rút gọn 5 chương thành 1 đoạn hay giải quyết mâu thuẫn quá chóng vánh. Nếu tác giả đã nhập dàn ý thô, hãy tôn trọng 100% ý đồ gốc và CHỈ CHI TIẾT HÓA từng mắt xích cảnh, động cơ tâm lý, phục bút và bước ngoặt cảm xúc cho đúng chương đang chuẩn bị viết.',
      '2. ĐỌC SÂU STORY BIBLE & MA TRẬN PHỤC BÚT: Mọi phương án đề xuất đều phải bám sát tính cách gốc, nỗi sợ thầm kín, giới hạn năng lực và các manh mối đang treo trong bản thảo.',
      '3. ĐỀ XUẤT CẤU TRÚC RẼ NHÁNH CHI TIẾT (TỪ 3 ĐẾN 4 PHƯƠNG ÁN RÕ RÀNG):',
      '   - Phương án A (Chặt chẽ & Hợp logic nhất): Đẩy cao xung đột trực diện từ hạt giống đã gieo, đi từng bước chậm mà chắc.',
      '   - Phương án B (Cú bẻ lái tâm lý / Plot Twist bất ngờ): Lật ngược kỳ vọng độc giả dựa trên hiểu lầm thông tin trong Ma trận Ai Biết Gì.',
      '   - Phương án C (Chiều sâu cảm xúc & Phản ứng dây chuyền): Đặt nhân vật vào thế tiến thoái lưỡng nan đạo đức, bóc tách tổn thương nội tâm.',
      '   - Phương án D (Táo bạo & Phá cách cao độ): Đổi trục không gian/góc nhìn POV hoặc kích hoạt bí mật quá khứ đúng thời điểm.',
      '4. BẢN PHÂN TÍCH RỦI RO & ĐƯỜNG DÂY CHI TIẾT CHO TỪNG CẢNH: Với phương án trọng tâm, chia rõ: Mở đầu cảnh -> Điểm bùng phát xung đột -> Biến chuyển nội tâm -> Móc câu cuối chương -> Hệ quả sang chương kế & Lỗ hổng cần phòng ngừa.',
      '5. GỢI Ý CÂU THOẠI MỒI ĐẮT GIÁ: Đính kèm 2–4 câu thoại đắt giá theo đúng chuẩn "- Câu thoại (Tên nhân vật)" để tác giả mang thẳng sang Chế độ 1 viết bản thảo.',
      '6. ĐỊNH DẠNG VĂN BẢN THUẦN SẠCH (CẤM MARKDOWN): Không dùng các ký hiệu **, *, ###, ##, #, ---, ___ hay ```; trình bày bằng tiêu đề chữ in hoa, đánh số 1. 2. 3. và gạch đầu dòng gọn gàng.'
    ].join('\n'),

    MODE_3_AUDIT: [
      'Bạn là Tổng Kiểm Toán Logic Tiểu Thuyết & Chuyên Gia Bắt Bệnh Kịch Bản Cực Kỳ Khó Tính (Continuity & Logic Auditor).',
      '',
      'QUY TRÌNH SOI LỖI ĐA TẦNG KHÔNG KHOAN NHƯỢNG:',
      '1. ĐỐI CHIẾU DÒNG THỜI GIAN & KHÔNG GIAN (TIMELINE AUDIT): Kiểm tra chính xác ngày/giờ, mùa/thời tiết, vị trí địa lý, vết thương thể chất, trang phục và đồ vật nhân vật đang giữ từ đầu chương tới cuối chương so với Story Bible và các chương trước.',
      '2. KIỂM TRA MA TRẬN "AI BIẾT GÌ" (INFORMATION LEAK AUDIT): Phát hiện ngay lập tức nếu bất kỳ nhân vật nào nói, suy nghĩ hoặc hành động dựa trên bí mật mà họ chưa từng trực tiếp chứng kiến hoặc được kể lại.',
      '3. SOI TÍNH NHẤT QUÁN TÍNH CÁCH & SỨC MẠNH (OOC & POWER SCALE): Chỉ ra chỗ nhân vật hạ IQ bất thường, tự mâu thuẫn động cơ cốt lõi, hoặc vượt rào giới hạn năng lực chỉ để ép tình huống.',
      '4. BẮT LỖI GÓC NHÌN (HEAD-HOPPING), SÁO NGỮ AI & HỔNG NHỊP: Liệt kê các câu chuyển POV trái phép trong cùng đoạn, lặp từ, câu từ sáo rỗng hoặc phân cảnh bị tua nhanh phi thực tế.',
      '5. TRÌNH BÀY RÕ RÀNG 3 CỘT CHO TỪNG LỖI: [MỨC ĐỘ: NGHIÊM TRỌNG / TRUNG BÌNH / NHẸ] -> [TRÍCH DẪN NGUYÊN VĂN ĐOẠN LỖI] -> [CÁCH SỬA CỤ THỂ GIỮ NGUYÊN CẢM XÚC VĂN HỌC].',
      '6. ĐỊNH DẠNG VĂN BẢN THUẦN SẠCH (CẤM MARKDOWN): Tuyệt đối không dùng **, *, ###, ##, #, ---, ___ hoặc ``` trong báo cáo thanh tra.'
    ].join('\n'),

    MODE_4_REVIEW: [
      'Bạn là Hội Đồng 5 Độc Giả Beta Khó Tính Kiêm Chuyên Gia Xuất Bản Văn Học Đa Thị Trường (Light Novel Nhật-Việt / WebNovel / Tiểu Thuyết Giấy).',
      '',
      'QUY TRÌNH ĐÁNH GIÁ & BIÊN TẬP GỌT VĂN CHUYÊN SÂU:',
      '1. CHẤM ĐIỂM THANG 10 & NHẬN XÉT SẮC BÉN CHO 6 TRỤ CỘT VĂN HỌC:',
      '   - Sức hút câu mở đầu & Móc câu kết chương (Hook & Cliffhanger)',
      '   - Chiều sâu tâm lý nhân vật & Độ thuyết phục của động cơ',
      '   - Độ tự nhiên của lời thoại & Chất giọng riêng từng nhân vật',
      '   - Nhịp độ hành văn (Pacing), Ngôn ngữ ngũ quan & Tính điện ảnh (Show Don\'t Tell)',
      '   - Không khí thế giới quan & Tính chân thực tiểu tiết',
      '   - Giá trị cuốn hút độc giả bấm đọc ngay chương kế tiếp',
      '2. PHẢN HỒI NHẬP VAI CỦA 3 NHÓM ĐỘC GIẢ KHÁC NHAU:',
      '   - Độc giả thích suy luận logic & soi chi tiết cài cắm.',
      '   - Độc giả mẫn cảm cảm xúc, thích dằn vặt nội tâm & tương tác nhân vật.',
      '   - Độc giả phổ thông đọc giải trí nhanh trên điện thoại.',
      '3. ĐỀ XUẤT NÂNG CẤP TẠI CHỖ: Chỉ rõ câu văn hoặc đoạn văn có thể viết lại mượt hơn, giàu hình ảnh hơn và gọt sạch từ thừa / từ sáo rỗng.',
      '4. CHUẨN HÓA ĐỊNH DẠNG SẠCH SẼ: Khi viết lại câu thoại phải giữ đúng chuẩn "- Câu thoại (Tên nhân vật)". Tuyệt đối KHÔNG dùng ký hiệu Markdown (** , * , ### , ## , --- , `) trong toàn bộ phản hồi.'
    ].join('\n'),

    MODE_5_DIAGRAM: [
      'Bạn là Kiến Trúc Sư Sơ Đồ Cốt Truyện & Chuyên Gia Dựng Biên Niên Sử (Timeline & Continuity Architect) dựa trên HỒ SƠ STORY BIBLE LÀM GỐC.',
      '',
      'NGUỒN DỮ LIỆU CHÍNH: Ưu tiên đọc toàn diện Story Bible (Tab 4: Nhân vật, Bối cảnh, Phục bút, Ma trận Ai Biết Gì, Mốc thời gian) và dàn ý tóm tắt chương — KHÔNG đòi hỏi phải quét hàng trăm tệp văn bản thô.',
      '',
      'NHIỆM VỤ KÉP BẮT BUỘC:',
      'PHẦN 1 — XUẤT KHỐI DỮ LIỆU ĐỒ THỊ JSON CHUẨN ĐỂ VẼ BIỂU ĐỒ TƯƠNG TÁC SVG:',
      'Hãy luôn xuất ĐÚNG MỘT khối mã ```json ... ``` ở đầu phản hồi với cấu trúc chặt chẽ sau:',
      '```json',
      '{',
      '  "title": "Tên sơ đồ cốt truyện / Biên niên sử",',
      '  "nodes": [',
      '    { "id": "n1", "chapter": "Chương 1", "time": "21:30 Đêm 1", "label": "Tên sự kiện ngắn gọn", "lane": "Nhân vật / Địa điểm", "severity": "normal|pivot|conflict" }',
      '  ],',
      '  "edges": [',
      '    { "from": "n1", "to": "n2", "label": "Hệ quả / Liên kết", "conflict": false }',
      '  ]',
      '}',
      '```',
      '',
      'PHẦN 2 — BÁO CÁO BIÊN NIÊN SỬ SỰ KIỆN & CẢNH BÁO MÂU THUẪN THỜI GIAN (VĂN BẢN THUẦN KHÔNG MARKDOWN):',
      '1. Lập trình tự từng mốc thời gian rõ ràng (Ngày / Giờ / Địa điểm / Nhân vật có mặt / Biến đổi trạng thái tâm lý & đồ vật).',
      '2. Đánh dấu rõ nút thắt nhân quả giữa các chương được chọn để vẽ sơ đồ.',
      '3. Khoanh vùng mọi điểm nghi ngờ xung đột thời gian, trùng giờ sai vị trí địa lý hoặc nhân vật phân thân bất hợp lý giữa hai phân cảnh.',
      '4. Ở PHẦN 2, tuyệt đối KHÔNG dùng ký hiệu Markdown (** , * , ### , ## , --- , `); chỉ dùng tiêu đề chữ in hoa và đánh số sạch sẽ.'
    ].join('\n')
  });

  // --------------------------------------------------------------------------
  // BỘ KHUÔN PHONG CÁCH THỂ LOẠI (DÙNG ĐỂ GHÉP MỞ RỘNG HOẶC LẤY CẢM HỨNG)
  // --------------------------------------------------------------------------
  const GENRE_STYLE_PRESETS = Object.freeze([
    {
      id: 'noir_psychological',
      name: '🕵️ Noir Trinh Thám Tâm Lý (Dark & Slow-burn)',
      badge: 'Thế mạnh gốc',
      shortDesc: 'Câu văn sắc lạnh, giàu chi tiết ẩn ức nội tâm, bóng tối đô thị và cú lật tâm lý.',
      additivePrompt: [
        '[PHONG CÁCH BỔ TRỢ: NOIR TRINH THÁM TÂM LÝ]',
        '- Duy trì bầu không khí đặc quánh sự nghi ngờ, ánh sáng tương phản mạnh (đèn đường ẩm ướt, bóng đổ góc phòng, mùi khói hay cà phê đắng).',
        '- Mỗi câu thoại đều ẩn giấu ý đồ riêng hoặc khoảng lặng né tránh sự thật; tránh bộc lộ tâm can trực tiếp quá sớm.',
        '- Đan xen chi tiết vật chứng nhỏ tưởng như vô hại để làm nền cho cú lật logic về sau.'
      ].join('\n')
    },
    {
      id: 'light_novel_modern',
      name: '⚡ Light Novel Nhật-Việt Hiện Đại (Sắc nét & Dễ cuốn)',
      badge: 'Thị hiếu cao',
      shortDesc: 'Thoại thông minh bắt nhịp nhanh, độc thoại nội tâm dí dỏm hoặc gai góc, nhịp chuyển cảnh điện ảnh.',
      additivePrompt: [
        '[PHONG CÁCH BỔ TRỢ: LIGHT NOVEL HIỆN ĐẠI]',
        '- Ưu tiên nhịp cắt cảnh gọn, giàu tính hình ảnh giống anime/điện ảnh và tiếng nói nội tâm đặc sắc của nhân vật chính.',
        '- Phân bổ câu thoại ngắn sắc bén, có độ tung hứng rõ rệt giữa các nhân vật để đọc cực kỳ mượt trên màn hình điện thoại.',
        '- Tạo cao trào cảm xúc ở nửa sau mỗi phân cảnh và móc câu khéo léo ở cuối chương.'
      ].join('\n')
    },
    {
      id: 'fantasy_mythology',
      name: '🐉 Huyền Ảo / Tu Tiên / Sử Thi Worldbuilding',
      badge: 'Thế giới lớn',
      shortDesc: 'Ngôn từ trang trọng, giàu hình ảnh hùng vĩ, giữ kỷ luật hệ thống sức mạnh & tầng bậc quy tắc.',
      additivePrompt: [
        '[PHONG CÁCH BỔ TRỢ: HUYỀN ẢO & SỬ THI]',
        '- Giữ sự nhất quán tuyệt đối với hệ thống pháp tắc, cảnh giới, chi phí đánh đổi năng lực và địa danh trong Story Bible.',
        '- Tả chiến đấu bằng quỹ đạo đòn đánh, áp lực không khí, thời gian hồi chiêu và phản xạ chiến thuật thay vì chỉ hô tên chiêu thức.',
        '- Tránh từ ngữ hiện đại lạc tông trong lời văn dẫn chuyện cổ phong hoặc giả tưởng.'
      ].join('\n')
    },
    {
      id: 'horror_folklore',
      name: '🕯️ Kinh Dị Tâm Linh & Dân Gian Việt Nam',
      badge: 'Rợn gáy',
      shortDesc: 'Âm thanh rợn người từ những thứ quen thuộc, nỗi sợ leo thang chậm rãi qua giác quan.',
      additivePrompt: [
        '[PHONG CÁCH BỔ TRỢ: KINH DỊ TÂM LINH]',
        '- Xây dựng nỗi sợ bằng sự sai lệch tinh tế trong cái bình thường (tiếng gỗ co ngót lúc 3 giờ sáng, bóng phản chiếu chậm hơn nửa nhịp).',
        '- Hạn chế hù dọa rẻ tiền (jumpscare thuần túy); tập trung vào áp lực ngột ngạt, cảm giác bị dõi theo và sự cô lập tâm lý.',
        '- Sử dụng chất liệu đời sống Việt Nam chân thực (hẻm nhỏ, hương khói, mưa rào đêm khuya, nhịp sinh hoạt thường nhật).'
      ].join('\n')
    },
    {
      id: 'slice_of_life_healing',
      name: '🍃 Đời Thường Chữa Lành & Cảm Xúc Tinh Tế',
      badge: 'Sâu lắng',
      shortDesc: 'Chú trọng khoảnh khắc nhỏ đời thường, vị ngon ký ức, sự đồng cảm lặng lẽ.',
      additivePrompt: [
        '[PHONG CÁCH BỔ TRỢ: ĐỜI THƯỜNG CHỮA LÀNH]',
        '- Tôn vinh vẻ đẹp của những chi tiết giản dị (hơi ấm tách trà, nắng chiều qua rèm cửa, cái gật đầu không cần nói nhiều).',
        '- Biến khoảng lặng giữa hai câu thoại thành nơi cảm xúc lan tỏa tự nhiên nhất.',
        '- Không cố nhồi nhét kịch tính giả tạo; hãy để xung đột nội tâm tháo gỡ bằng sự thấu hiểu chân thành.'
      ].join('\n')
    },
    {
      id: 'cyberpunk_scifi',
      name: '🌆 Sci-Fi Cyberpunk & Công Nghệ Tương Lai',
      badge: 'Kỹ trị',
      shortDesc: 'Phản ánh mâu thuẫn giữa ký ức con người và thuật toán, kết cấu đô thị neon lạnh lẽo.',
      additivePrompt: [
        '[PHONG CÁCH BỔ TRỢ: SCI-FI CYBERPUNK]',
        '- Kết hợp thuật ngữ công nghệ một cách trực quan qua trải nghiệm cơ thể (độ trễ thần kinh, nhiễu sóng giao diện võng mạc, tiếng quạt tản nhiệt).',
        '- Giữ tính logic vật lý và giới hạn dữ liệu khi nhân vật xâm nhập hệ thống hoặc phân tích chứng cứ số.',
        '- Giữ câu hỏi nhân bản làm trục cảm xúc xuyên suốt lớp vỏ công nghệ.'
      ].join('\n')
    },
    {
      id: 'political_intrigue',
      name: '♟️ Đấu Trí Quyền Mưu & Chiến Lược Lạnh',
      badge: 'Cân não',
      shortDesc: 'Mỗi lời nói mang hai tầng nghĩa, nhân vật luôn tính trước ít nhất hai nước cờ.',
      additivePrompt: [
        '[PHONG CÁCH BỔ TRỢ: ĐẤU TRÍ QUYỀN MƯU]',
        '- Đảm bảo mọi quyết định của nhân vật phản diện đều thông minh, hợp lý theo lợi ích của họ — tuyệt đối không hạ IQ phản diện.',
        '- Dùng ẩn ý trong lời chào hỏi, tặng vật phẩm hay lựa chọn chỗ ngồi để phô diễn quyền lực ngầm.',
        '- Chỉ rõ ai nắm quân bài nào, ai đang hiểu lầm ở thời điểm kết cảnh.'
      ].join('\n')
    },
    {
      id: 'romance_tension',
      name: '🥀 Tình Cảm Gai Góc & Căng Thẳng Tâm Lý',
      badge: 'Tương tác',
      shortDesc: 'Lực kéo đẩy tinh tế giữa rung động và phòng vệ, không đường hóa gượng ép.',
      additivePrompt: [
        '[PHONG CÁCH BỔ TRỢ: TÌNH CẢM CÓ CHIỀU SÂU]',
        '- Tạo lực căng tự nhiên giữa điều nhân vật muốn nói và điều lòng tự trọng hoặc nỗi đau quá khứ buộc họ giữ lại.',
        '- Sử dụng ngôn ngữ cơ thể tinh vi (ánh mắt né tránh đúng lúc, nhịp tay khựng lại nửa giây, khoảng cách vật lý).',
        '- Phát triển sự tin tưởng từng bước một dựa trên biến cố chung thay vì rung động vô căn cứ.'
      ].join('\n')
    }
  ]);

  // --------------------------------------------------------------------------
  // BỘ LẮP GHÉP KHỐI CHỈ THỊ NHANH (BUILDING BLOCKS CHO PROMPT HỆ THỐNG)
  // --------------------------------------------------------------------------
  const SYSTEM_PROMPT_SNIPPET_BLOCKS = Object.freeze([
    {
      id: 'blk_dialogue_rule',
      label: '+ Quy chuẩn Thoại Studio',
      snippet:
        '\n- QUY CHUẨN THOẠI: Mọi câu thoại bắt buộc tách dòng riêng theo định dạng `- Lời thoại tự nhiên. (Tên nhân vật)` và tuyệt đối giữ đúng khẩu khí từng người.'
    },
    {
      id: 'blk_show_dont_tell',
      label: '+ Show Don\'t Tell 5 Giác Quan',
      snippet:
        '\n- NGŨ QUAN & HÀNH ĐỘNG: Cấm kể tóm tắt cảm xúc chung chung; bắt buộc truyền tải trạng thái tâm lý qua nhịp thở, ánh nhìn, nhiệt độ, mùi vị và chuyển động vi mô.'
    },
    {
      id: 'blk_no_head_hop',
      label: '+ Khóa POV Chống Nhảy Đầu',
      snippet:
        '\n- KỶ LUẬT POV: Chỉ phản ánh suy nghĩ, cảm giác của duy nhất nhân vật giữ POV hiện tại. Mọi nhân vật khác chỉ được thể hiện qua hành vi quan sát thấy từ bên ngoài.'
    },
    {
      id: 'blk_anti_cliche_strict',
      label: '+ Chặn Sáo Ngữ AI Dịch Máy',
      snippet:
        '\n- CẤM SÁO NGỮ AI: Tuyệt đối không dùng các cụm sáo rỗng: nhếch mép cười lạnh, lóe lên tia sắc bén, khí lạnh chạy dọc sống lưng, đồng tử co rút kịch liệt, bất giác thở phào.'
    },
    {
      id: 'blk_anti_rush',
      label: '+ Cấm Tua Nhanh Kịch Bản',
      snippet:
        '\n- CHỐNG TUA NHANH: Không được lướt qua sự kiện cao trào trong 1-2 câu tóm lược. Phải triển khai đầy đủ diễn biến thời gian thực và phản ứng tâm lý qua từng nhịp cảnh.'
    },
    {
      id: 'blk_mode5_json_contract',
      label: '+ Khung JSON Biểu Đồ Mode 5',
      snippet:
        '\n- ĐỊNH DẠNG ĐỒ THỊ MODE 5: Luôn xuất kèm khối ```json { "title": "...", "nodes": [{ "id": "n1", "chapter": "...", "time": "...", "label": "...", "lane": "...", "severity": "normal|pivot|conflict" }], "edges": [{ "from": "n1", "to": "n2", "label": "...", "conflict": false }] } ``` để hệ thống dựng SVG.'
    }
  ]);

  const SYSPROMPT_HISTORY_STORAGE_KEY = 'noir_s20_sysprompt_revisions_v1';
  const SYSPROMPT_GENRE_STORAGE_KEY = 'noir_s20_sysprompt_genre_overlay_v1';
  const MAX_REVISION_ENTRIES_PER_MODE = 15;

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

  function getStorageKey() {
    return (
      NS.constants?.STORAGE_KEYS?.MODE_PROMPTS ||
      'noir_s20_custom_mode_sysprompts_v1'
    );
  }

  // ==========================================================================
  // LỚP 1: BỘ PHÂN TÍCH SỨC KHỎE & SO SÁNH SYSTEM PROMPT
  // ==========================================================================
  class SystemPromptDiffAndHealthAnalyzer {
    analyzePrompt(modeKey, rawText) {
      const meta = MODE_METADATA_CATALOG[modeKey] || MODE_METADATA_CATALOG.MODE_1_DRAFT;
      const defaultPrompt = DEFAULT_FIVE_MODE_SYSTEM_PROMPTS[modeKey] || '';
      const text = String(rawText || '');
      const trimmed = text.trim();
      const lower = trimmed.toLowerCase();
      const utils = getUtils();

      const wordCount = utils.countVietnameseWords(trimmed);
      const charCount = trimmed.length;
      const estimatedTokens = Math.ceil(charCount / 3.4);
      const isCustomized =
        trimmed.length > 0 && trimmed !== defaultPrompt.trim();

      const missingDirectives = [];
      for (const reqToken of meta.requiredDirectives || []) {
        if (!lower.includes(reqToken.toLowerCase())) {
          missingDirectives.push(reqToken);
        }
      }

      let score = 100;
      const notes = [];

      if (trimmed.length < 120) {
        score -= 40;
        notes.push(
          'Prompt hệ thống hơi ngắn (< 120 ký tự), AI dễ tự do quá mức hoặc lạc quy chuẩn văn phong.'
        );
      } else if (trimmed.length < meta.idealLengthMinChars) {
        score -= 12;
        notes.push(
          'Có thể bổ sung thêm tiêu chí chống sáo ngữ hoặc quy tắc POV để AI giữ ổn định dài hơi hơn.'
        );
      }

      if (missingDirectives.length > 0) {
        score -= Math.min(30, missingDirectives.length * 10);
        notes.push(
          `Chế độ này nên nhắc tới: ${missingDirectives.join(', ')}.`
        );
      }

      if (modeKey === 'MODE_5_DIAGRAM' && !lower.includes('nodes')) {
        score -= 20;
        notes.push(
          'Chú ý: Chế độ 5 nên giữ mẫu JSON `"nodes"` và `"edges"` để Studio tự vẽ biểu đồ SVG tương tác.'
        );
      }

      if (notes.length === 0) {
        notes.push(
          'Cấu trúc System Prompt cân bằng rất tốt, đầy đủ khung định hướng văn học và rào chắn logic.'
        );
      }

      score = Math.max(15, Math.min(100, score));

      let gradeLabel = 'Xuất sắc';
      let gradeColor = 'emerald';
      if (score < 60) {
        gradeLabel = 'Cần bổ sung';
        gradeColor = 'rose';
      } else if (score < 85) {
        gradeLabel = 'Khá ổn';
        gradeColor = 'amber';
      }

      return {
        modeKey,
        wordCount,
        charCount,
        estimatedTokens,
        isCustomized,
        score,
        gradeLabel,
        gradeColor,
        missingDirectives,
        notes,
        lineDeltaVsDefault:
          trimmed.split('\n').length - defaultPrompt.trim().split('\n').length
      };
    }

    computeLineDiffSummary(currentText, defaultText) {
      const curLines = String(currentText || '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const defLines = String(defaultText || '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const defSet = new Set(defLines);
      const curSet = new Set(curLines);
      const added = curLines.filter((l) => !defSet.has(l));
      const removed = defLines.filter((l) => !curSet.has(l));
      const unchanged = curLines.filter((l) => defSet.has(l));

      return {
        addedCount: added.length,
        removedCount: removed.length,
        unchangedCount: unchanged.length,
        addedSamples: added.slice(0, 6),
        removedSamples: removed.slice(0, 6)
      };
    }
  }

  // ==========================================================================
  // LỚP 2: BỘ GIẢI MÃ BIẾN ĐỘNG & TIÊM NGỮ CẢNH THỂ LOẠI
  // ==========================================================================
  class SystemPromptVariableAndGenreCompiler {
    constructor() {
      this.selectedGenreIds = this.loadSelectedGenres();
    }

    loadSelectedGenres() {
      try {
        const raw = localStorage.getItem(SYSPROMPT_GENRE_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.filter((id) =>
            GENRE_STYLE_PRESETS.some((g) => g.id === id)
          );
        }
      } catch (_) {}
      return [];
    }

    persistSelectedGenres() {
      try {
        localStorage.setItem(
          SYSPROMPT_GENRE_STORAGE_KEY,
          JSON.stringify(this.selectedGenreIds)
        );
      } catch (_) {}
    }

    toggleGenrePreset(genreId) {
      if (!GENRE_STYLE_PRESETS.some((g) => g.id === genreId)) return false;
      const idx = this.selectedGenreIds.indexOf(genreId);
      if (idx >= 0) {
        this.selectedGenreIds.splice(idx, 1);
      } else {
        if (this.selectedGenreIds.length >= 2) {
          this.selectedGenreIds.shift();
        }
        this.selectedGenreIds.push(genreId);
      }
      this.persistSelectedGenres();
      return this.selectedGenreIds.includes(genreId);
    }

    getSelectedGenres() {
      return GENRE_STYLE_PRESETS.filter((g) =>
        this.selectedGenreIds.includes(g.id)
      );
    }

    compileInstruction(basePromptText, modeKey, runtimeOpts = {}) {
      let text = String(basePromptText || '').trim();
      if (!text) {
        text = DEFAULT_FIVE_MODE_SYSTEM_PROMPTS[modeKey] || '';
      }

      const targetWords =
        Number(
          runtimeOpts.targetWords ||
            NS.state?.activeTargetWords ||
            document.getElementById('input-target-word-count')?.value ||
            3500
        ) || 3500;

      const activePov =
        runtimeOpts.pov ||
        document.getElementById('select-scene-pov')?.value ||
        'Ngôi thứ 3 giới hạn (Khóa theo nhân vật POV từng phân cảnh)';

      const antiCliche =
        Array.isArray(runtimeOpts.antiClicheList) &&
        runtimeOpts.antiClicheList.length > 0
          ? runtimeOpts.antiClicheList
          : NS.storyBible?.antiClicheList ||
            NS.constants?.DEFAULT_ANTI_CLICHE ||
            [];

      const clichéJoined = antiCliche.slice(0, 18).join('; ');
      const genreNames = this.getSelectedGenres()
        .map((g) => g.name)
        .join(' + ');

      text = text
        .replace(/\{\{TARGET_WORDS\}\}/g, String(targetWords))
        .replace(/\{\{ACTIVE_POV\}\}/g, String(activePov))
        .replace(/\{\{CLICHE_LIST\}\}/g, clichéJoined)
        .replace(/\{\{PROJECT_GENRE\}\}/g, genreNames || 'Tiểu thuyết văn học')
        .replace(/\{\{DIALOGUE_FORMAT\}\}/g, '- Câu thoại tự nhiên. (Tên nhân vật)');

      const additiveSections = [text];

      const selectedGenres = this.getSelectedGenres();
      if (selectedGenres.length > 0 && modeKey === 'MODE_1_DRAFT') {
        additiveSections.push('');
        additiveSections.push(
          selectedGenres.map((g) => g.additivePrompt).join('\n\n')
        );
      }

      if (
        modeKey === 'MODE_1_DRAFT' &&
        antiCliche.length > 0 &&
        !text.includes('CẤM SÁO NGỮ AI BỔ SUNG')
      ) {
        additiveSections.push('');
        additiveSections.push(
          `[DANH SÁCH CỤM TỪ CẤM SÁO RỖNG ĐANG BẬT (${antiCliche.length} MỤC)]: ${clichéJoined}`
        );
      }

      return additiveSections.join('\n').trim();
    }
  }

  // ==========================================================================
  // LỚP 3: KHO LỊCH SỬ CHỈNH SỬA SYSTEM PROMPT (HỖ TRỢ HOÀN TÁC AN TOÀN)
  // ==========================================================================
  class SystemPromptRevisionHistoryStore {
    constructor() {
      this.revisionsByMode = this.loadRevisions();
    }

    loadRevisions() {
      try {
        const raw = localStorage.getItem(SYSPROMPT_HISTORY_STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      } catch (_) {}
      return {};
    }

    persistRevisions() {
      try {
        localStorage.setItem(
          SYSPROMPT_HISTORY_STORAGE_KEY,
          JSON.stringify(this.revisionsByMode)
        );
      } catch (_) {}
    }

    recordRevision(modeKey, promptText, noteLabel = 'Lưu chỉnh sửa') {
      const normalized = String(promptText || '').trim();
      if (!normalized || !MODE_KEYS_ORDER.includes(modeKey)) return null;

      if (!Array.isArray(this.revisionsByMode[modeKey])) {
        this.revisionsByMode[modeKey] = [];
      }

      const list = this.revisionsByMode[modeKey];
      if (list.length > 0 && list[0].text === normalized) {
        return list[0];
      }

      const utils = getUtils();
      const entry = {
        id: `sp_rev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        modeKey,
        timestamp: Date.now(),
        note: String(noteLabel || 'Lưu chỉnh sửa').trim(),
        wordCount: utils.countVietnameseWords(normalized),
        charCount: normalized.length,
        previewLine: normalized.split('\n')[0].slice(0, 96),
        text: normalized
      };

      list.unshift(entry);
      if (list.length > MAX_REVISION_ENTRIES_PER_MODE) {
        list.length = MAX_REVISION_ENTRIES_PER_MODE;
      }

      this.persistRevisions();
      return entry;
    }

    getRevisionsForMode(modeKey) {
      return Array.isArray(this.revisionsByMode[modeKey])
        ? [...this.revisionsByMode[modeKey]]
        : [];
    }

    getRevisionById(modeKey, revId) {
      const list = this.revisionsByMode[modeKey] || [];
      return list.find((r) => r.id === revId) || null;
    }

    clearModeHistory(modeKey) {
      if (!modeKey) return;
      delete this.revisionsByMode[modeKey];
      this.persistRevisions();
    }
  }

  // ==========================================================================
  // LỚP 4: TRÌNH TĂNG CƯỜNG GIAO DIỆN MODAL `#modal-system-prompts-config`
  // (CHÈN THANH SỨC KHỎE, KHUÔN THỂ LOẠI & KHỐI CHỈ THỊ MÀ KHÔNG ĐỤNG LAYOUT GỐC)
  // ==========================================================================
  class SystemPromptModalToolbarEnhancer {
    constructor(studio) {
      this.studio = studio;
      this.toolbarMounted = false;
      this.showRevisionDrawer = false;
      this.showCompareDiff = false;
    }

    ensureToolbarInjected() {
      const modal = document.getElementById('modal-system-prompts-config');
      const textarea = document.getElementById('textarea-sysprompt-editor');
      if (!modal || !textarea || !textarea.parentElement) return false;

      if (document.getElementById('sysprompt-studio-enhancer-bar')) {
        this.toolbarMounted = true;
        return true;
      }

      const parent = textarea.parentElement;

      // 1. Thanh đo sức khỏe, nút lắp ghép nhanh & công cụ Xuất/Nhập
      const topEnhanceBar = document.createElement('div');
      topEnhanceBar.id = 'sysprompt-studio-enhancer-bar';
      topEnhanceBar.className =
        'p-3 rounded-2xl border border-purple-500/30 bg-purple-950/20 space-y-2.5 text-[11px]';
      topEnhanceBar.innerHTML = [
        '<div class="flex flex-wrap items-center justify-between gap-2">',
        '  <div id="sysprompt-health-summary-pill" class="flex flex-wrap items-center gap-2"></div>',
        '  <div class="flex flex-wrap items-center gap-1.5">',
        '    <button type="button" id="btn-sysprompt-toggle-diff" class="px-2.5 py-1 rounded-lg border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-bold transition">⚖️ So với mặc định</button>',
        '    <button type="button" id="btn-sysprompt-toggle-revs" class="px-2.5 py-1 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold transition">🕰️ Lịch sử sửa (<span id="sysprompt-rev-count">0</span>)</button>',
        '    <button type="button" id="btn-sysprompt-export-json" class="px-2.5 py-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold transition">📤 Xuất gói Prompt</button>',
        '    <button type="button" id="btn-sysprompt-import-json" class="px-2.5 py-1 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-bold transition">📥 Nhập gói</button>',
        '    <input type="file" id="input-sysprompt-import-file" accept=".json" class="hidden" />',
        '  </div>',
        '</div>',
        '<div class="space-y-1.5">',
        '  <div class="flex items-center justify-between gap-2">',
        '    <span class="font-bold text-purple-300 uppercase text-[10px]">🧩 Lắp ghép nhanh chỉ thị chuẩn vào cuối ô soạn thảo:</span>',
        '    <span id="sysprompt-mode-hint-text" class="text-[10px] text-zinc-400"></span>',
        '  </div>',
        '  <div id="sysprompt-snippet-chips-row" class="flex flex-wrap gap-1.5"></div>',
        '</div>',
        '<div class="space-y-1.5 pt-1 border-t border-purple-500/20">',
        '  <div class="flex items-center justify-between gap-2">',
        '    <span class="font-bold text-emerald-300 uppercase text-[10px]">🎭 Lớp Áo Thể Loại Bổ Trợ (Tự động ghép khi Chế độ 1 viết truyện — chọn tối đa 2):</span>',
        '    <span id="sysprompt-genre-active-label" class="text-[10px] text-emerald-400 font-monoCode"></span>',
        '  </div>',
        '  <div id="sysprompt-genre-presets-row" class="flex flex-wrap gap-1.5"></div>',
        '</div>'
      ].join('\n');

      // 2. Ngăn xem Lịch sử sửa & So sánh Diff (ẩn mặc định)
      const sideDrawerBox = document.createElement('div');
      sideDrawerBox.id = 'sysprompt-auxiliary-drawer';
      sideDrawerBox.className =
        'hidden p-3.5 rounded-2xl border border-zinc-700 bg-zinc-950/95 space-y-2.5 text-[11px]';

      parent.insertBefore(topEnhanceBar, textarea);
      parent.insertBefore(sideDrawerBox, textarea);

      this.renderSnippetChips();
      this.renderGenreChips();
      this.bindEnhancerEvents();
      this.toolbarMounted = true;
      return true;
    }

    renderSnippetChips() {
      const row = document.getElementById('sysprompt-snippet-chips-row');
      if (!row) return;
      const esc = getUtils().escapeHtml;
      row.innerHTML = SYSTEM_PROMPT_SNIPPET_BLOCKS.map(
        (blk) =>
          `<button type="button" data-sysprompt-snippet-id="${esc(blk.id)}" class="px-2.5 py-1 rounded-lg border border-purple-500/35 bg-zinc-900/90 hover:bg-purple-600/30 text-purple-200 font-semibold transition">${esc(blk.label)}</button>`
      ).join('');
    }

    renderGenreChips() {
      const row = document.getElementById('sysprompt-genre-presets-row');
      const activeLabel = document.getElementById('sysprompt-genre-active-label');
      if (!row) return;
      const esc = getUtils().escapeHtml;
      const activeIds = this.studio.compiler.selectedGenreIds;

      if (activeLabel) {
        const names = this.studio.compiler
          .getSelectedGenres()
          .map((g) => g.name.replace(/^[^\s]+\s/, ''));
        activeLabel.textContent =
          names.length > 0 ? `Đang bật: ${names.join(' + ')}` : 'Chưa bật lớp áo thể loại';
      }

      row.innerHTML = GENRE_STYLE_PRESETS.map((g) => {
        const isActive = activeIds.includes(g.id);
        const cls = isActive
          ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200 shadow-sm'
          : 'border-zinc-700 bg-zinc-900/80 text-zinc-300 hover:border-emerald-500/50';
        return `<button type="button" data-sysprompt-genre-id="${esc(g.id)}" title="${esc(g.shortDesc)}" class="px-2.5 py-1 rounded-lg border font-semibold transition ${cls}">${isActive ? '✓ ' : ''}${esc(g.name)}</button>`;
      }).join('');
    }

    refreshHealthBar(modeKey, currentText) {
      const pill = document.getElementById('sysprompt-health-summary-pill');
      const hint = document.getElementById('sysprompt-mode-hint-text');
      const revCountEl = document.getElementById('sysprompt-rev-count');
      if (!pill) return;

      const report = this.studio.analyzer.analyzePrompt(modeKey, currentText);
      const esc = getUtils().escapeHtml;
      const badgeTone =
        report.gradeColor === 'emerald'
          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
          : report.gradeColor === 'amber'
            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
            : 'bg-rose-500/20 border-rose-500/40 text-rose-300';

      const customTag = report.isCustomized
        ? '<span class="px-2 py-0.5 rounded bg-purple-500/25 border border-purple-400/50 text-purple-200 font-bold">Đã tùy chỉnh riêng</span>'
        : '<span class="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">Đang dùng bản chuẩn Studio</span>';

      pill.innerHTML = [
        `<span class="px-2.5 py-0.5 rounded-full border font-extrabold ${badgeTone}">Độ chuẩn: ${report.score}/100 · ${esc(report.gradeLabel)}</span>`,
        `<span class="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 font-monoCode text-zinc-300">${report.wordCount} từ · ~${report.estimatedTokens} token</span>`,
        customTag
      ].join('');

      if (hint) {
        hint.textContent = report.notes[0] || '';
      }

      if (revCountEl) {
        revCountEl.textContent = String(
          this.studio.revisionStore.getRevisionsForMode(modeKey).length
        );
      }

      if (this.showCompareDiff || this.showRevisionDrawer) {
        this.renderAuxiliaryDrawer(modeKey, currentText);
      }
    }

    renderAuxiliaryDrawer(modeKey, currentText) {
      const drawer = document.getElementById('sysprompt-auxiliary-drawer');
      if (!drawer) return;

      if (!this.showCompareDiff && !this.showRevisionDrawer) {
        drawer.classList.add('hidden');
        drawer.innerHTML = '';
        return;
      }

      const esc = getUtils().escapeHtml;
      drawer.classList.remove('hidden');

      if (this.showCompareDiff) {
        const defText = DEFAULT_FIVE_MODE_SYSTEM_PROMPTS[modeKey] || '';
        const diff = this.studio.analyzer.computeLineDiffSummary(
          currentText,
          defText
        );
        drawer.innerHTML = [
          '<div class="flex items-center justify-between">',
          '  <strong class="text-indigo-300 uppercase">⚖️ Đối Chiếu Bản Hiện Tại So Với Bản Chuẩn Mặc Định</strong>',
          '  <button type="button" id="btn-sysprompt-close-aux" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold">Đóng ✕</button>',
          '</div>',
          `<div class="flex flex-wrap gap-2 text-[11px]"><span class="text-emerald-300 font-bold">+ ${diff.addedCount} dòng thêm mới</span> · <span class="text-rose-300 font-bold">- ${diff.removedCount} dòng mặc định đã bớt</span> · <span class="text-zinc-400">${diff.unchangedCount} dòng giữ nguyên</span></div>`,
          diff.addedSamples.length > 0
            ? `<div class="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 space-y-1 text-emerald-200">${diff.addedSamples.map((l) => `<div>+ ${esc(l.slice(0, 140))}</div>`).join('')}</div>`
            : '<div class="text-zinc-400">Chưa có dòng bổ sung khác biệt nào đáng kể so với khung chuẩn.</div>',
          diff.removedSamples.length > 0
            ? `<div class="p-2 rounded-lg bg-rose-950/35 border border-rose-500/30 space-y-1 text-rose-200">${diff.removedSamples.map((l) => `<div>- ${esc(l.slice(0, 140))}</div>`).join('')}</div>`
            : ''
        ].join('\n');
      } else if (this.showRevisionDrawer) {
        const revs = this.studio.revisionStore.getRevisionsForMode(modeKey);
        drawer.innerHTML = [
          '<div class="flex items-center justify-between">',
          `  <strong class="text-amber-300 uppercase">🕰️ Lịch Sử Các Bản Sửa Của ${esc(MODE_METADATA_CATALOG[modeKey]?.shortLabel || modeKey)}</strong>`,
          '  <button type="button" id="btn-sysprompt-close-aux" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold">Đóng ✕</button>',
          '</div>',
          revs.length === 0
            ? '<div class="text-zinc-400">Chưa có lịch sử sửa đổi nào cho chế độ này. Mỗi lần bạn bấm "Lưu Cấu Hình" sẽ tự lưu 1 mốc hoàn tác tại đây.</div>'
            : `<div class="max-h-44 overflow-y-auto space-y-1.5">${revs
                .map((r) => {
                  const timeStr = new Date(r.timestamp).toLocaleString('vi-VN');
                  return [
                    `<div class="p-2 rounded-xl border border-zinc-800 bg-zinc-900 flex items-center justify-between gap-2">`,
                    `  <div class="min-w-0 flex-1">`,
                    `    <div class="font-bold text-amber-200 truncate">${esc(r.note)} · <span class="font-monoCode text-zinc-400 font-normal">${esc(timeStr)}</span></div>`,
                    `    <div class="text-[10px] text-zinc-400 truncate">${r.wordCount} từ — ${esc(r.previewLine)}</div>`,
                    `  </div>`,
                    `  <button type="button" data-restore-sysprompt-rev="${esc(r.id)}" class="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold shrink-0">Khôi phục</button>`,
                    `</div>`
                  ].join('');
                })
                .join('')}</div>`
        ].join('\n');
      }

      const closeAuxBtn = document.getElementById('btn-sysprompt-close-aux');
      if (closeAuxBtn) {
        closeAuxBtn.onclick = () => {
          this.showCompareDiff = false;
          this.showRevisionDrawer = false;
          drawer.classList.add('hidden');
        };
      }

      drawer.querySelectorAll('[data-restore-sysprompt-rev]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const revId = btn.getAttribute('data-restore-sysprompt-rev');
          const rev = this.studio.revisionStore.getRevisionById(modeKey, revId);
          const editor = document.getElementById('textarea-sysprompt-editor');
          if (rev && editor) {
            editor.value = rev.text;
            this.refreshHealthBar(modeKey, rev.text);
            getUtils().showToast(
              '↺ Đã nạp lại mốc Prompt từ lịch sử. Bấm "Lưu Cấu Hình" để chốt áp dụng!',
              'info'
            );
          }
        });
      });
    }

    bindEnhancerEvents() {
      const bindOnce =
        typeof NS.bindOnce === 'function'
          ? NS.bindOnce.bind(NS)
          : (el, ev, fn) => {
              const target =
                typeof el === 'string' ? document.getElementById(el) : el;
              if (target) target.addEventListener(ev, fn);
            };

      bindOnce(
        'sysprompt-snippet-chips-row',
        'click',
        (ev) => {
          const btn = ev.target.closest('[data-sysprompt-snippet-id]');
          if (!btn) return;
          const blkId = btn.getAttribute('data-sysprompt-snippet-id');
          const blk = SYSTEM_PROMPT_SNIPPET_BLOCKS.find((b) => b.id === blkId);
          const editor = document.getElementById('textarea-sysprompt-editor');
          if (!blk || !editor) return;
          editor.value = `${editor.value.replace(/\s+$/, '')}\n${blk.snippet.trim()}`;
          editor.focus();
          editor.scrollTop = editor.scrollHeight;
          const picker = document.getElementById('sysprompt-mode-picker');
          this.refreshHealthBar(
            picker ? picker.value : 'MODE_1_DRAFT',
            editor.value
          );
          getUtils().showToast(`🧩 Đã chèn khối "${blk.label}" vào khung soạn thảo!`, 'success', 2200);
        },
        'mod14_snippet_click'
      );

      bindOnce(
        'sysprompt-genre-presets-row',
        'click',
        (ev) => {
          const btn = ev.target.closest('[data-sysprompt-genre-id]');
          if (!btn) return;
          const genreId = btn.getAttribute('data-sysprompt-genre-id');
          const enabled = this.studio.compiler.toggleGenrePreset(genreId);
          this.renderGenreChips();
          const preset = GENRE_STYLE_PRESETS.find((g) => g.id === genreId);
          getUtils().showToast(
            enabled
              ? `🎭 Đã bật lớp phong cách: ${preset?.name || genreId}`
              : `Đã tắt lớp phong cách: ${preset?.name || genreId}`,
            'info',
            2200
          );
        },
        'mod14_genre_click'
      );

      bindOnce(
        'btn-sysprompt-toggle-diff',
        'click',
        () => {
          this.showCompareDiff = !this.showCompareDiff;
          if (this.showCompareDiff) this.showRevisionDrawer = false;
          const picker = document.getElementById('sysprompt-mode-picker');
          const editor = document.getElementById('textarea-sysprompt-editor');
          this.renderAuxiliaryDrawer(
            picker ? picker.value : 'MODE_1_DRAFT',
            editor ? editor.value : ''
          );
        },
        'mod14_toggle_diff'
      );

      bindOnce(
        'btn-sysprompt-toggle-revs',
        'click',
        () => {
          this.showRevisionDrawer = !this.showRevisionDrawer;
          if (this.showRevisionDrawer) this.showCompareDiff = false;
          const picker = document.getElementById('sysprompt-mode-picker');
          const editor = document.getElementById('textarea-sysprompt-editor');
          this.renderAuxiliaryDrawer(
            picker ? picker.value : 'MODE_1_DRAFT',
            editor ? editor.value : ''
          );
        },
        'mod14_toggle_revs'
      );

      bindOnce(
        'btn-sysprompt-export-json',
        'click',
        () => this.studio.exportPromptPackJson(),
        'mod14_export_json'
      );

      bindOnce(
        'btn-sysprompt-import-json',
        'click',
        () => {
          const inp = document.getElementById('input-sysprompt-import-file');
          if (inp) inp.click();
        },
        'mod14_import_trigger'
      );

      bindOnce(
        'input-sysprompt-import-file',
        'change',
        async (ev) => {
          const file = ev.target?.files?.[0];
          if (!file) return;
          await this.studio.importPromptPackFile(file);
          ev.target.value = '';
        },
        'mod14_import_file_change'
      );
    }
  }

  // ==========================================================================
  // LỚP 5: BỘ KIỂM ĐỊNH CHẤT LƯỢNG & CỐ VẤN ĐỘ DÀI SYSTEM PROMPT ĐA CHẾ ĐỘ
  // ==========================================================================
  class SystemPromptQualityAndTokenEstimator {
    constructor(studio) {
      this.studio = studio;
    }

    estimateSystemPromptFootprint() {
      const summary = {};
      let totalWords = 0;
      let totalTokens = 0;
      let customizedCount = 0;

      for (const modeKey of MODE_KEYS_ORDER) {
        const promptText = this.studio.getPromptForMode(modeKey);
        const analysis = this.studio.analyzer.analyzePrompt(modeKey, promptText);
        summary[modeKey] = analysis;
        totalWords += analysis.wordCount;
        totalTokens += analysis.estimatedTokens;
        if (analysis.isCustomized) customizedCount += 1;
      }

      return {
        modes: summary,
        totalWords,
        totalTokens,
        customizedCount,
        activeGenres: this.studio.compiler.getSelectedGenres().map((g) => g.name)
      };
    }

    auditAllFiveModes() {
      const issues = [];
      for (const modeKey of MODE_KEYS_ORDER) {
        const promptText = this.studio.getPromptForMode(modeKey);
        const report = this.studio.analyzer.analyzePrompt(modeKey, promptText);
        if (report.score < 70) {
          issues.push({
            modeKey,
            score: report.score,
            advice: report.notes[0] || 'Nên mở rộng thêm khung hướng dẫn.'
          });
        }
      }
      return {
        healthy: issues.length === 0,
        issues
      };
    }

    buildPromptPreviewWithVariables(modeKey) {
      const base = this.studio.getPromptForMode(modeKey);
      return this.studio.compiler.compileInstruction(base, modeKey, {
        targetWords:
          Number(document.getElementById('input-target-word-count')?.value) ||
          NS.state?.activeTargetWords ||
          3500,
        pov: document.getElementById('select-scene-pov')?.value || ''
      });
    }
  }

  // ==========================================================================
  // LỚP 6: STUDIO QUẢN TRỊ 5 SYSTEM PROMPT TRUNG TÂM (`NoirStudio.sysPrompts`)
  // ==========================================================================
  class FiveModesSystemPromptsStudio {
    constructor() {
      this.defaultPrompts = { ...DEFAULT_FIVE_MODE_SYSTEM_PROMPTS };
      this.customPrompts = this.loadCustomPrompts();
      this.analyzer = new SystemPromptDiffAndHealthAnalyzer();
      this.compiler = new SystemPromptVariableAndGenreCompiler();
      this.revisionStore = new SystemPromptRevisionHistoryStore();
      this.toolbarEnhancer = new SystemPromptModalToolbarEnhancer(this);
      this.qualityEstimator = new SystemPromptQualityAndTokenEstimator(this);
      this.currentEditingMode = 'MODE_1_DRAFT';
      this.hasInitialized = false;
      this.draftUnsavedBuffer = {};
    }

    init() {
      this.loadCustomPrompts();
      this.bindDOM();
      this.hasInitialized = true;
      return this;
    }

    loadCustomPrompts() {
      const merged = { ...DEFAULT_FIVE_MODE_SYSTEM_PROMPTS };
      try {
        const raw = localStorage.getItem(getStorageKey());
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            for (const modeKey of MODE_KEYS_ORDER) {
              if (
                typeof parsed[modeKey] === 'string' &&
                parsed[modeKey].trim().length > 0
              ) {
                merged[modeKey] = parsed[modeKey];
              }
            }
          }
        }
      } catch (_) {}
      this.customPrompts = merged;
      return merged;
    }

    persistCustomPrompts() {
      try {
        localStorage.setItem(getStorageKey(), JSON.stringify(this.customPrompts));
        if (NS.bus && typeof NS.bus.emit === 'function') {
          NS.bus.emit('sysprompts:updated', {
            customPrompts: { ...this.customPrompts },
            timestamp: Date.now()
          });
        }
        return true;
      } catch (err) {
        if (NS.logger) {
          NS.logger.error('Không thể lưu System Prompt xuống localStorage', err);
        }
        return false;
      }
    }

    getPromptForMode(modeKey, opts = {}) {
      const safeKey = MODE_KEYS_ORDER.includes(modeKey)
        ? modeKey
        : 'MODE_1_DRAFT';
      const base =
        this.customPrompts[safeKey] ||
        this.defaultPrompts[safeKey] ||
        this.defaultPrompts.MODE_1_DRAFT;
      if (opts && opts.raw === true) {
        return base;
      }
      return this.compiler.compileInstruction(base, safeKey, opts);
    }

    getRawPromptForMode(modeKey) {
      const safeKey = MODE_KEYS_ORDER.includes(modeKey)
        ? modeKey
        : 'MODE_1_DRAFT';
      return (
        this.customPrompts[safeKey] ||
        this.defaultPrompts[safeKey] ||
        this.defaultPrompts.MODE_1_DRAFT
      );
    }

    savePromptForMode(modeKey, text, noteLabel = 'Cập nhật thủ công') {
      const safeKey = MODE_KEYS_ORDER.includes(modeKey)
        ? modeKey
        : 'MODE_1_DRAFT';
      const cleaned = String(text || '').trim();
      if (!cleaned) {
        getUtils().showToast(
          '⚠️ Nội dung Prompt hệ thống không được để trống hoàn toàn.',
          'warn'
        );
        return false;
      }

      const previous = this.customPrompts[safeKey];
      if (previous && previous.trim() && previous.trim() !== cleaned) {
        this.revisionStore.recordRevision(safeKey, previous, 'Trước khi lưu mới');
      }

      this.customPrompts[safeKey] = cleaned;
      delete this.draftUnsavedBuffer[safeKey];
      this.revisionStore.recordRevision(safeKey, cleaned, noteLabel);
      this.persistCustomPrompts();

      if (NS.autoSaver && typeof NS.autoSaver.scheduleAutoSave === 'function') {
        NS.autoSaver.scheduleAutoSave('SYSTEM_PROMPT_UPDATED');
      }
      return true;
    }

    resetPromptForMode(modeKey) {
      const safeKey = MODE_KEYS_ORDER.includes(modeKey)
        ? modeKey
        : 'MODE_1_DRAFT';
      const previous = this.customPrompts[safeKey];
      if (
        previous &&
        previous.trim() !== (this.defaultPrompts[safeKey] || '').trim()
      ) {
        this.revisionStore.recordRevision(
          safeKey,
          previous,
          'Trước khi khôi phục mặc định'
        );
      }

      this.customPrompts[safeKey] = this.defaultPrompts[safeKey];
      delete this.draftUnsavedBuffer[safeKey];
      this.persistCustomPrompts();
      return this.customPrompts[safeKey];
    }

    resetAllModesToDefault() {
      for (const modeKey of MODE_KEYS_ORDER) {
        this.resetPromptForMode(modeKey);
      }
      return { ...this.customPrompts };
    }

    loadEditorForMode(modeKey) {
      const safeKey = MODE_KEYS_ORDER.includes(modeKey)
        ? modeKey
        : 'MODE_1_DRAFT';
      this.currentEditingMode = safeKey;

      const picker = document.getElementById('sysprompt-mode-picker');
      const editor = document.getElementById('textarea-sysprompt-editor');
      if (picker && picker.value !== safeKey) {
        picker.value = safeKey;
      }
      if (editor) {
        const text =
          this.draftUnsavedBuffer[safeKey] ?? this.getRawPromptForMode(safeKey);
        editor.value = text;
        this.toolbarEnhancer.refreshHealthBar(safeKey, text);
      }
    }

    openModal(initialMode) {
      return this.openConfigModal(initialMode);
    }

    openConfigModal(initialMode) {
      const modal = document.getElementById('modal-system-prompts-config');
      if (!modal) return false;

      const activeSelectMode =
        document.getElementById('s20-quad-tab-selector')?.value ||
        document.getElementById('select-ai-execution-mode')?.value ||
        this.currentEditingMode ||
        'MODE_1_DRAFT';

      const targetMode = MODE_KEYS_ORDER.includes(initialMode)
        ? initialMode
        : MODE_KEYS_ORDER.includes(activeSelectMode)
          ? activeSelectMode
          : 'MODE_1_DRAFT';

      this.toolbarEnhancer.ensureToolbarInjected();
      this.toolbarEnhancer.renderGenreChips();
      this.loadEditorForMode(targetMode);

      modal.classList.remove('hidden');
      const editor = document.getElementById('textarea-sysprompt-editor');
      if (editor) {
        setTimeout(() => editor.focus(), 40);
      }
      return true;
    }

    closeModal() {
      const modal = document.getElementById('modal-system-prompts-config');
      if (modal) modal.classList.add('hidden');
      this.toolbarEnhancer.showCompareDiff = false;
      this.toolbarEnhancer.showRevisionDrawer = false;
    }

    exportPromptPackJson() {
      const payload = {
        schema: 'NoirPsychStudio_SystemPrompts_Pack_v1',
        exportedAt: new Date().toISOString(),
        activeGenres: this.compiler.selectedGenreIds,
        prompts: { ...this.customPrompts }
      };

      const jsonText = JSON.stringify(payload, null, 2);
      const blob = new Blob([jsonText], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Noi_Bo_SystemPrompts_5CheDo_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1200);
      getUtils().showToast('📤 Đã xuất gói 5 System Prompt (.json) thành công!', 'success');
    }

    async importPromptPackFile(file) {
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        const incoming = parsed?.prompts || parsed;
        if (!incoming || typeof incoming !== 'object') {
          throw new Error('Cấu trúc tệp JSON không hợp lệ.');
        }

        let updatedCount = 0;
        for (const modeKey of MODE_KEYS_ORDER) {
          if (typeof incoming[modeKey] === 'string' && incoming[modeKey].trim()) {
            this.savePromptForMode(modeKey, incoming[modeKey], 'Nhập từ file JSON');
            updatedCount += 1;
          }
        }

        if (Array.isArray(parsed?.activeGenres)) {
          this.compiler.selectedGenreIds = parsed.activeGenres.filter((id) =>
            GENRE_STYLE_PRESETS.some((g) => g.id === id)
          );
          this.compiler.persistSelectedGenres();
          this.toolbarEnhancer.renderGenreChips();
        }

        if (updatedCount > 0) {
          this.loadEditorForMode(this.currentEditingMode);
          getUtils().showToast(
            `📥 Đã nhập thành công ${updatedCount} System Prompt từ tệp!`,
            'success'
          );
        } else {
          getUtils().showToast(
            '⚠️ Không tìm thấy khóa MODE_1..MODE_5 hợp lệ trong tệp.',
            'warn'
          );
        }
      } catch (err) {
        getUtils().showToast(`❌ Lỗi nhập gói Prompt: ${err.message}`, 'error');
      }
    }

    bindDOM() {
      const bindOnce =
        typeof NS.bindOnce === 'function'
          ? NS.bindOnce.bind(NS)
          : (el, ev, fn) => {
              const t = typeof el === 'string' ? document.getElementById(el) : el;
              if (t) t.addEventListener(ev, fn);
            };

      // Các nút mở cửa sổ Cấu hình Prompt Hệ Thống từ khắp Studio
      bindOnce(
        'btn-tab3-open-mode-prompts',
        'click',
        () => {
          const curTab3Mode =
            document.getElementById('s20-quad-tab-selector')?.value ||
            'MODE_1_DRAFT';
          this.openConfigModal(curTab3Mode);
        },
        'mod14_open_from_tab3'
      );

      bindOnce(
        'btn-cmd-open-sysprompt-drawer',
        'click',
        () => {
          const cmdMode =
            document.getElementById('select-ai-execution-mode')?.value ||
            'MODE_1_DRAFT';
          this.openConfigModal(cmdMode);
        },
        'mod14_open_from_cmd'
      );

      bindOnce(
        'btn-mode5-open-sysprompt',
        'click',
        () => this.openConfigModal('MODE_5_DIAGRAM'),
        'mod14_open_from_mode5'
      );

      bindOnce(
        'btn-close-sysprompt-modal',
        'click',
        () => this.closeModal(),
        'mod14_close_modal'
      );

      bindOnce(
        'sysprompt-mode-picker',
        'change',
        (ev) => {
          const editor = document.getElementById('textarea-sysprompt-editor');
          if (editor && this.currentEditingMode) {
            this.draftUnsavedBuffer[this.currentEditingMode] = editor.value;
          }
          const nextMode = ev.target?.value || 'MODE_1_DRAFT';
          this.loadEditorForMode(nextMode);
        },
        'mod14_picker_change'
      );

      bindOnce(
        'textarea-sysprompt-editor',
        'input',
        (ev) => {
          const picker = document.getElementById('sysprompt-mode-picker');
          const curMode = picker?.value || this.currentEditingMode || 'MODE_1_DRAFT';
          this.draftUnsavedBuffer[curMode] = ev.target?.value || '';
          this.toolbarEnhancer.refreshHealthBar(curMode, ev.target?.value || '');
        },
        'mod14_editor_input'
      );

      bindOnce(
        'btn-reset-default-sysprompt',
        'click',
        () => {
          const picker = document.getElementById('sysprompt-mode-picker');
          const modeKey = picker?.value || this.currentEditingMode || 'MODE_1_DRAFT';
          const defVal = this.resetPromptForMode(modeKey);
          const editor = document.getElementById('textarea-sysprompt-editor');
          if (editor) editor.value = defVal;
          this.toolbarEnhancer.refreshHealthBar(modeKey, defVal);
          getUtils().showToast(
            `↺ Đã khôi phục System Prompt mặc định chuẩn văn học cho ${MODE_METADATA_CATALOG[modeKey]?.shortLabel || modeKey}!`,
            'info'
          );
        },
        'mod14_reset_default'
      );

      bindOnce(
        'btn-save-sysprompt-config',
        'click',
        () => {
          const picker = document.getElementById('sysprompt-mode-picker');
          const editor = document.getElementById('textarea-sysprompt-editor');
          const modeKey = picker?.value || this.currentEditingMode || 'MODE_1_DRAFT';
          if (!editor) return;
          if (this.savePromptForMode(modeKey, editor.value, 'Lưu thủ công tại Studio')) {
            this.toolbarEnhancer.refreshHealthBar(modeKey, editor.value);
            getUtils().showToast(
              `💾 Đã lưu System Prompt cho ${MODE_METADATA_CATALOG[modeKey]?.shortLabel || modeKey}! Sẽ tự động áp dụng vào Prompt Tổng Hợp.`,
              'success'
            );
          }
        },
        'mod14_save_config'
      );
    }

    getHealthReport() {
      return {
        module: 'mod14_five_modes_system_prompts_studio.js',
        initialized: this.hasInitialized,
        footprint: this.qualityEstimator.estimateSystemPromptFootprint(),
        audit: this.qualityEstimator.auditAllFiveModes()
      };
    }
  }

  // ==========================================================================
  // LỚP 7: BỘ HIỆU CHỈNH GIỌNG VĂN NHÂN VẬT, NHỊP CĂNG THẲNG & BIẾN ĐỘNG
  // ==========================================================================
  const NARRATIVE_TENSION_PROFILES = Object.freeze({
    SLOW_BURN_MYSTERY: {
      id: 'SLOW_BURN_MYSTERY',
      label: '🕯️ Nhịp Chậm Cài Cắm Manh Mối (Slow-Burn)',
      sentenceCadence: 'Phối hợp câu văn trung bình dài, nhịp quan sát chi tiết tỉ mỉ, đan xen khoảng lặng nghi ngờ.',
      dialogueRatio: '35% đối thoại ẩn ý / 65% miêu tả tâm lý và bối cảnh',
      directiveText:
        '[NHỊP CẢNH SLOW-BURN]: Dành thời gian cho bầu không khí thấm sâu, miêu tả chi tiết không gian vật lý, kéo dài sự dò xét giữa các nhân vật trước khi tung ra mảnh thông tin quan trọng.'
    },
    HIGH_STAKES_CLIMAX: {
      id: 'HIGH_STAKES_CLIMAX',
      label: '⚡ Nhịp Cao Trào Sinh Tử (High-Stakes Action)',
      sentenceCadence: 'Câu ngắn sắc bén, động từ mạnh dứt khoát, chuyển nhịp nhanh theo từng giây phản xạ.',
      dialogueRatio: '25% câu thoại gãy gọn / 75% hành động và áp lực sinh tồn',
      directiveText:
        '[NHỊP CẢNH CAO TRÀO]: Tăng tốc độ chuyển động, ưu tiên câu ngắn gãy gọn, truyền tải tiếng tim đập, hơi thở dồn dập và phản xạ chớp nhoáng trong không gian hẹp.'
    },
    PSYCHOLOGICAL_CONFRONTATION: {
      id: 'PSYCHOLOGICAL_CONFRONTATION',
      label: '♟️ Đấu Trí Nội Tâm & Đối Thoại Cân Não',
      sentenceCadence: 'Câu thoại nhiều tầng nghĩa đối đầu trực diện, xen kẽ độc thoại nội tâm sắc lạnh.',
      dialogueRatio: '60% đối thoại đấu trí / 40% tiểu tiết ánh mắt và vi biểu cảm',
      directiveText:
        '[NHỊP CẢNH ĐẤU TRÍ]: Mỗi câu thoại là một nước cờ. Giữa hai lượt thoại luôn miêu tả một chuyển động rất nhỏ (ánh mắt khựng lại, ngón tay gõ nhịp, độ trễ nửa giây trước khi trả lời).'
    },
    AFTERMATH_RECOVERY: {
      id: 'AFTERMATH_RECOVERY',
      label: '🌧️ Lắng Đọng Hậu Biến Cố & Hồi Tưởng',
      sentenceCadence: 'Văn phong trầm lắng, chú trọng âm thanh nền, dư chấn vết thương tâm lý và sự mệt mỏi thực tế.',
      dialogueRatio: '20% thoại thưa thớt / 80% không gian lắng đọng và suy tư',
      directiveText:
        '[NHỊP CẢNH HẬU BIẾN CỐ]: Để nhân vật có khoảng thở tiêu hóa mất mát hoặc cú sốc vừa qua. Tập trung vào giác quan thứ cấp (mưa tạt ngoài hiên, nước trà nguội, tiếng đồng hồ).'
    }
  });

  const PROMPT_VARIABLE_TOKENS_DOC = Object.freeze([
    {
      token: '{{PROJECT_GENRE}}',
      title: 'Tên thể loại đang bật',
      exampleValue: 'Noir Trinh Thám Tâm Lý + Light Novel',
      usageHint: 'Tự động điền tên tối đa 2 lớp áo thể loại bạn đang chọn ở thanh trên.'
    },
    {
      token: '{{TARGET_WORDS}}',
      title: 'Số từ mục tiêu của chương',
      exampleValue: '3500',
      usageHint: 'Lấy trực tiếp từ ô "Mục tiêu từ" trong Trung tâm lệnh AI.'
    },
    {
      token: '{{ACTIVE_POV}}',
      title: 'Góc nhìn POV đang chọn',
      exampleValue: 'Ngôi thứ 3 giới hạn theo Nhân vật chính',
      usageHint: 'Đồng bộ khóa góc nhìn chống nhảy đầu giữa chừng phân cảnh.'
    },
    {
      token: '{{DIALOGUE_FORMAT}}',
      title: 'Định dạng thoại chuẩn Studio',
      exampleValue: '- Câu thoại tự nhiên. (Tên nhân vật)',
      usageHint: 'Giữ nguyên chuẩn tách thoại để công cụ chuẩn hóa văn bản & xuất PDF/DOCX nhận diện mượt.'
    },
    {
      token: '{{CLICHE_LIST}}',
      title: 'Danh sách sáo ngữ AI bị cấm',
      exampleValue: 'nhếch mép cười lạnh; lóe lên tia sắc bén...',
      usageHint: 'Trích tự động từ Blacklist Anti-Cliche trong Story Bible (Tab 4).'
    }
  ]);

  const ADVANCED_CRAFT_PACKAGES = Object.freeze([
    {
      id: 'pack_vn_ln_flagship',
      name: '🏆 Bộ Chuẩn Flagship Light Novel Việt Nam (5 Chế Độ Đồng Bộ)',
      description: 'Tối ưu đọc mượt trên điện thoại, thoại sắc nét, nhịp nhanh nhưng vẫn giữ chiều sâu tâm lý.',
      adjustments: {
        MODE_1_DRAFT: [
          '',
          '[MỞ RỘNG FLAGSHIP LIGHT NOVEL]:',
          '- Chia đoạn văn thoáng nhịp (mỗi đoạn miêu tả tối đa 3-4 câu), tách bạch hẳn với lời thoại để đọc trên điện thoại cực kỳ dễ chịu.',
          '- Mỗi chương bắt buộc có ít nhất 1 điểm chuyển đổi cảm xúc rõ rệt và 1 câu chốt cuối chương tạo tò mò.'
        ].join('\n'),
        MODE_3_AUDIT: [
          '',
          '[SOI THÊM NHỊP ĐỌC MOBILE]: Kiểm tra các đoạn văn quá đặc (> 6 dòng) không có nhịp nghỉ và đánh dấu chỗ có thể tách đoạn cho thoáng.'
        ].join('\n')
      }
    },
    {
      id: 'pack_hardboiled_crime',
      name: '🕵️ Bộ Chuẩn Trinh Thám Điều Tra & Chặt Chẽ Chứng Cứ',
      description: 'Siết chặt logic vật chứng, thời gian biểu phút-giây và phản ứng chân thực của nghi phạm.',
      adjustments: {
        MODE_1_DRAFT: [
          '',
          '[MỞ RỘNG TRINH THÁM VẬT CHỨNG]:',
          '- Mọi manh mối vật lý khi xuất hiện lần đầu phải được đặt tự nhiên trong bối cảnh, không tự phát sáng lộ liễu.',
          '- Lời khai và lời nói dối của nhân vật phụ phải xuất phát từ nỗi sợ hoặc lợi ích cụ thể của chính họ.'
        ].join('\n'),
        MODE_5_DIAGRAM: [
          '',
          '[BIỂU ĐỒ ALIBI CHẾ ĐỘ 5]: Chú trọng đối chiếu khung giờ di chuyển (Alibi) của từng nhân vật để lật tẩy khả năng xuất hiện bất hợp lý tại hai nơi cùng lúc.'
        ].join('\n')
      }
    },
    {
      id: 'pack_mythic_progression',
      name: '⚔️ Bộ Chuẩn Huyền Ảo Cân Bằng Hệ Thống Sức Mạnh',
      description: 'Chống lạm phát sức mạnh (Power Creep), giữ vững nguyên tắc trả giá và chiến thuật trận địa.',
      adjustments: {
        MODE_1_DRAFT: [
          '',
          '[MỞ RỘNG CÂN BẰNG CHIẾN ĐẤU]:',
          '- Nhân vật thắng nhờ tận dụng địa hình, thông tin đối thủ và kẽ hở tâm lý thay vì đột phá vô lý giữa trận (Deus Ex Machina).',
          '- Mọi năng lực đặc biệt đều phải để lại hệ lụy tiêu hao thể lực hoặc tổn thương tinh thần tương xứng.'
        ].join('\n'),
        MODE_3_AUDIT: [
          '',
          '[KIỂM TOÁN HỆ THỐNG SỨC MẠNH]: Rà soát xem có nhân vật nào dùng kỹ năng vượt cấp mà không giải thích chi phí trả giá theo Story Bible hay không.'
        ].join('\n')
      }
    }
  ]);

  class LiteraryTensionAndCraftCalibrator {
    constructor(studio) {
      this.studio = studio;
      this.activeTensionId = this.loadActiveTensionId();
    }

    loadActiveTensionId() {
      try {
        const saved = localStorage.getItem('noir_s20_active_tension_profile_v1');
        if (saved && NARRATIVE_TENSION_PROFILES[saved]) {
          return saved;
        }
      } catch (_) {}
      return 'SLOW_BURN_MYSTERY';
    }

    setTensionProfile(profileId) {
      if (!NARRATIVE_TENSION_PROFILES[profileId]) return false;
      this.activeTensionId = profileId;
      try {
        localStorage.setItem('noir_s20_active_tension_profile_v1', profileId);
      } catch (_) {}
      return true;
    }

    getActiveTensionProfile() {
      return (
        NARRATIVE_TENSION_PROFILES[this.activeTensionId] ||
        NARRATIVE_TENSION_PROFILES.SLOW_BURN_MYSTERY
      );
    }

    applyCraftPackageOverlay(packageId) {
      const pkg = ADVANCED_CRAFT_PACKAGES.find((p) => p.id === packageId);
      if (!pkg) return false;
      let appliedModes = 0;
      for (const [modeKey, extraBlock] of Object.entries(pkg.adjustments)) {
        const current = this.studio.getRawPromptForMode(modeKey);
        if (!current.includes(extraBlock.trim().slice(0, 32))) {
          this.studio.savePromptForMode(
            modeKey,
            `${current.trim()}\n${extraBlock}`,
            `Áp dụng gói: ${pkg.name}`
          );
          appliedModes += 1;
        }
      }
      return appliedModes;
    }

    listAvailableTokens() {
      return PROMPT_VARIABLE_TOKENS_DOC.map((t) => ({ ...t }));
    }

    renderTokensHelperStrip(containerEl) {
      if (!containerEl) return;
      const esc = getUtils().escapeHtml;
      containerEl.innerHTML = [
        '<div class="text-[10px] font-bold uppercase text-purple-300 mb-1">🏷️ Thẻ biến tự động thay thế khi AI thực thi (Bấm để chèn vào con trỏ):</div>',
        '<div class="flex flex-wrap gap-1.5">',
        ...PROMPT_VARIABLE_TOKENS_DOC.map(
          (item) =>
            `<button type="button" data-sysprompt-var-token="${esc(item.token)}" title="${esc(item.title)} — ${esc(item.usageHint)}" class="px-2 py-0.5 rounded bg-zinc-900 border border-purple-500/30 hover:border-purple-400 text-purple-200 font-monoCode text-[10px]">${esc(item.token)}</button>`
        ),
        '</div>'
      ].join('\n');
    }

    renderTensionAndPackageRow(containerEl) {
      if (!containerEl) return;
      const esc = getUtils().escapeHtml;
      const activeTension = this.getActiveTensionProfile();
      containerEl.innerHTML = [
        '<div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">',
        '  <div class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/70 space-y-1.5">',
        '    <div class="text-[10px] font-bold uppercase text-amber-300">🎞️ Nhịp Độ Kể Chuyện Mặc Định Cho Chế Độ 1:</div>',
        `    <select id="select-sysprompt-tension-profile" class="w-full px-2.5 py-1.5 rounded-lg border border-zinc-700 bg-zinc-950 text-amber-200 font-bold text-[11px]">`,
        ...Object.values(NARRATIVE_TENSION_PROFILES).map(
          (tp) =>
            `<option value="${esc(tp.id)}" ${tp.id === activeTension.id ? 'selected' : ''}>${esc(tp.label)}</option>`
        ),
        '    </select>',
        `    <div id="sysprompt-tension-desc" class="text-[10px] text-zinc-400 leading-snug">${esc(activeTension.sentenceCadence)} (${esc(activeTension.dialogueRatio)})</div>`,
        '  </div>',
        '  <div class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/70 space-y-1.5">',
        '    <div class="text-[10px] font-bold uppercase text-teal-300">📦 Nạp Nhanh Gói Tinh Hoa Văn Phong Chuyên Sâu:</div>',
        '    <div class="flex flex-wrap gap-1.5">',
        ...ADVANCED_CRAFT_PACKAGES.map(
          (pkg) =>
            `<button type="button" data-sysprompt-craft-pack="${esc(pkg.id)}" title="${esc(pkg.description)}" class="px-2 py-1 rounded-lg border border-teal-500/40 bg-teal-950/40 hover:bg-teal-600/30 text-teal-200 font-semibold text-[10px] transition">${esc(pkg.name)}</button>`
        ),
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n');
    }
  }

  // Mở rộng `SystemPromptModalToolbarEnhancer` để tích hợp thẻ biến & nhịp truyện
  const origEnsureToolbar =
    SystemPromptModalToolbarEnhancer.prototype.ensureToolbarInjected;
  SystemPromptModalToolbarEnhancer.prototype.ensureToolbarInjected = function () {
    const mounted = origEnsureToolbar.call(this);
    if (!mounted) return false;
    const bar = document.getElementById('sysprompt-studio-enhancer-bar');
    if (bar && !document.getElementById('sysprompt-tokens-helper-wrap')) {
      const tokensWrap = document.createElement('div');
      tokensWrap.id = 'sysprompt-tokens-helper-wrap';
      tokensWrap.className = 'pt-1.5 border-t border-purple-500/20';
      const tensionWrap = document.createElement('div');
      tensionWrap.id = 'sysprompt-tension-packages-wrap';

      bar.appendChild(tokensWrap);
      bar.appendChild(tensionWrap);

      this.studio.craftCalibrator.renderTokensHelperStrip(tokensWrap);
      this.studio.craftCalibrator.renderTensionAndPackageRow(tensionWrap);
      this.bindCalibratorEvents();
    }
    return true;
  };

  SystemPromptModalToolbarEnhancer.prototype.bindCalibratorEvents = function () {
    const bindOnce =
      typeof NS.bindOnce === 'function'
        ? NS.bindOnce.bind(NS)
        : (el, ev, fn) => {
            const t = typeof el === 'string' ? document.getElementById(el) : el;
            if (t) t.addEventListener(ev, fn);
          };

    bindOnce(
      'sysprompt-tokens-helper-wrap',
      'click',
      (ev) => {
        const btn = ev.target.closest('[data-sysprompt-var-token]');
        if (!btn) return;
        const tok = btn.getAttribute('data-sysprompt-var-token');
        const editor = document.getElementById('textarea-sysprompt-editor');
        if (!tok || !editor) return;
        const start = Number(editor.selectionStart ?? editor.value.length);
        const end = Number(editor.selectionEnd ?? editor.value.length);
        editor.value =
          editor.value.slice(0, start) + tok + editor.value.slice(end);
        editor.focus();
        editor.selectionStart = editor.selectionEnd = start + tok.length;
        const picker = document.getElementById('sysprompt-mode-picker');
        this.refreshHealthBar(
          picker ? picker.value : 'MODE_1_DRAFT',
          editor.value
        );
      },
      'mod14_var_token_click'
    );

    bindOnce(
      'select-sysprompt-tension-profile',
      'change',
      (ev) => {
        const val = ev.target?.value;
        if (this.studio.craftCalibrator.setTensionProfile(val)) {
          const prof = this.studio.craftCalibrator.getActiveTensionProfile();
          const desc = document.getElementById('sysprompt-tension-desc');
          if (desc) {
            desc.textContent = `${prof.sentenceCadence} (${prof.dialogueRatio})`;
          }
          getUtils().showToast(`🎞️ Đã chuyển nhịp truyện sang: ${prof.label}`, 'info', 2300);
        }
      },
      'mod14_tension_change'
    );

    bindOnce(
      'sysprompt-tension-packages-wrap',
      'click',
      (ev) => {
        const btn = ev.target.closest('[data-sysprompt-craft-pack]');
        if (!btn) return;
        const pkgId = btn.getAttribute('data-sysprompt-craft-pack');
        const count = this.studio.craftCalibrator.applyCraftPackageOverlay(pkgId);
        this.studio.loadEditorForMode(this.studio.currentEditingMode);
        getUtils().showToast(
          count > 0
            ? `📦 Đã bổ sung tinh hoa văn phong vào ${count} chế độ AI!`
            : 'ℹ️ Gói tinh hoa này đã được tích hợp sẵn trong bộ System Prompt của bạn.',
          count > 0 ? 'success' : 'info'
        );
      },
      'mod14_craft_pack_click'
    );
  };

  // Tự động gắn thêm chỉ thị nhịp truyện vào Prompt Chế độ 1 khi biên soạn thực chiến
  const origGetPromptForMode =
    FiveModesSystemPromptsStudio.prototype.getPromptForMode;
  FiveModesSystemPromptsStudio.prototype.getPromptForMode = function (
    modeKey,
    opts = {}
  ) {
    const compiled = origGetPromptForMode.call(this, modeKey, opts);
    if (opts && opts.raw === true) return compiled;
    if (modeKey === 'MODE_1_DRAFT' && this.craftCalibrator) {
      const tension = this.craftCalibrator.getActiveTensionProfile();
      if (tension && tension.directiveText && !compiled.includes('[NHỊP CẢNH')) {
        return `${compiled}\n\n${tension.directiveText}`;
      }
    }
    return compiled;
  };

  // ==========================================================================
  // LỚP 8: BỘ MÔ PHỎNG XEM TRƯỚC SYSTEM INSTRUCTION THỰC CHIẾN & KIỂM TRA SẴN SÀNG
  // ==========================================================================
  class FiveModesDryRunPromptSimulator {
    constructor(studio) {
      this.studio = studio;
    }

    simulateCompiledOutput(modeKey, overrides = {}) {
      const safeKey = MODE_KEYS_ORDER.includes(modeKey)
        ? modeKey
        : 'MODE_1_DRAFT';
      const meta = MODE_METADATA_CATALOG[safeKey];
      const compiledText = this.studio.getPromptForMode(safeKey, overrides);
      const rawText = this.studio.getRawPromptForMode(safeKey);
      const utils = getUtils();
      const wordCount = utils.countVietnameseWords(compiledText);
      const charCount = compiledText.length;
      const estimatedTokens = Math.ceil(charCount / 3.4);

      const includesDialogueRule = /thoại|gạch đầu dòng|câu thoại/i.test(
        compiledText
      );
      const includesAntiCliche = /sáo ngữ|anti-cliche|nhếch mép|cấm sáo/i.test(
        compiledText
      );
      const includesPovDiscipline = /pov|góc nhìn|nhảy đầu/i.test(compiledText);
      const includesMode5Json =
        safeKey !== 'MODE_5_DIAGRAM' ||
        (/"nodes"/i.test(compiledText) && /"edges"/i.test(compiledText));

      return {
        modeKey: safeKey,
        modeTitle: meta.fullTitle,
        recommendedTemp: meta.recommendedTemp,
        rawWords: utils.countVietnameseWords(rawText),
        compiledWords: wordCount,
        compiledChars: charCount,
        estimatedTokens,
        activeGenreCount: this.studio.compiler.selectedGenreIds.length,
        activeTensionLabel:
          safeKey === 'MODE_1_DRAFT'
            ? this.studio.craftCalibrator.getActiveTensionProfile().label
            : null,
        complianceChecks: {
          includesDialogueRule,
          includesAntiCliche,
          includesPovDiscipline,
          includesMode5Json
        },
        compiledPreview: compiledText
      };
    }

    buildReadinessMatrixReport() {
      const rows = MODE_KEYS_ORDER.map((modeKey) => {
        const sim = this.simulateCompiledOutput(modeKey);
        const health = this.studio.analyzer.analyzePrompt(
          modeKey,
          sim.compiledPreview
        );
        return {
          modeKey,
          label: MODE_METADATA_CATALOG[modeKey].shortLabel,
          score: health.score,
          grade: health.gradeLabel,
          compiledWords: sim.compiledWords,
          estimatedTokens: sim.estimatedTokens,
          isCustomized: health.isCustomized,
          dialogueOk: sim.complianceChecks.includesDialogueRule,
          povOk: sim.complianceChecks.includesPovDiscipline,
          mode5JsonOk: sim.complianceChecks.includesMode5Json
        };
      });

      const avgScore = Math.round(
        rows.reduce((sum, r) => sum + r.score, 0) / Math.max(1, rows.length)
      );
      const totalTokensAllModes = rows.reduce(
        (sum, r) => sum + r.estimatedTokens,
        0
      );

      return {
        generatedAt: new Date().toISOString(),
        averageScore: avgScore,
        totalTokensAllModes,
        rows
      };
    }

    buildFormattedSummaryMarkdown() {
      const matrix = this.buildReadinessMatrixReport();
      const lines = [
        `# BÁO CÁO ĐỘ CHUẨN SYSTEM PROMPT 5 CHẾ ĐỘ (${new Date().toLocaleString('vi-VN')})`,
        `- Điểm trung bình toàn Studio: **${matrix.averageScore}/100**`,
        `- Tổng ước lượng quy mô cả 5 chế độ: **${matrix.totalTokensAllModes} tokens**`,
        '',
        '| Chế độ | Điểm | Trạng thái | Độ dài | Ước lượng |',
        '|---|---:|---|---:|---:|'
      ];
      for (const r of matrix.rows) {
        lines.push(
          `| ${r.label} | ${r.score}/100 | ${r.isCustomized ? 'Tùy chỉnh' : 'Mặc định'} | ${r.compiledWords} từ | ~${r.estimatedTokens} tok |`
        );
      }
      return lines.join('\n');
    }

    renderCompiledDryRunModalPreview(modeKey) {
      const sim = this.simulateCompiledOutput(modeKey);
      const drawer = document.getElementById('sysprompt-auxiliary-drawer');
      if (!drawer) return sim;
      const esc = getUtils().escapeHtml;
      drawer.classList.remove('hidden');
      drawer.innerHTML = [
        '<div class="flex items-center justify-between gap-2">',
        `  <strong class="text-emerald-300 uppercase">🔬 Xem Trước Bản Biên Dịch Thực Chiến (${esc(sim.modeTitle)})</strong>`,
        '  <button type="button" id="btn-sysprompt-close-dryrun" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold">Đóng ✕</button>',
        '</div>',
        `<div class="flex flex-wrap gap-2 text-[11px] text-zinc-300"><span><strong>${sim.compiledWords} từ</strong> (~${sim.estimatedTokens} token)</span> · <span>Thể loại đang ghép: <strong>${sim.activeGenreCount}</strong></span>${sim.activeTensionLabel ? ` · <span>Nhịp: <strong>${esc(sim.activeTensionLabel)}</strong></span>` : ''}</div>`,
        `<pre class="max-h-56 overflow-y-auto p-3 rounded-xl bg-zinc-900 border border-emerald-500/30 text-[11px] text-emerald-100 whitespace-pre-wrap font-monoCode">${esc(sim.compiledPreview)}</pre>`
      ].join('\n');
      const closeBtn = document.getElementById('btn-sysprompt-close-dryrun');
      if (closeBtn) {
        closeBtn.onclick = () => drawer.classList.add('hidden');
      }
      return sim;
    }
  }

  // Bổ sung nút "🔬 Xem trước bản ghép thực chiến" vào thanh công cụ Modal
  const prevBindEnhancer =
    SystemPromptModalToolbarEnhancer.prototype.bindEnhancerEvents;
  SystemPromptModalToolbarEnhancer.prototype.bindEnhancerEvents = function () {
    prevBindEnhancer.call(this);
    const bar = document.getElementById('sysprompt-studio-enhancer-bar');
    const diffBtn = document.getElementById('btn-sysprompt-toggle-diff');
    if (bar && diffBtn && !document.getElementById('btn-sysprompt-dryrun-preview')) {
      const simBtn = document.createElement('button');
      simBtn.type = 'button';
      simBtn.id = 'btn-sysprompt-dryrun-preview';
      simBtn.className =
        'px-2.5 py-1 rounded-lg border border-teal-500/40 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 font-bold transition';
      simBtn.textContent = '🔬 Xem bản gửi AI';
      diffBtn.parentElement.insertBefore(simBtn, diffBtn);
      simBtn.addEventListener('click', () => {
        const picker = document.getElementById('sysprompt-mode-picker');
        const modeKey = picker ? picker.value : this.studio.currentEditingMode;
        this.showCompareDiff = false;
        this.showRevisionDrawer = false;
        this.studio.dryRunSimulator.renderCompiledDryRunModalPreview(modeKey);
      });
    }
  };

  // ==========================================================================
  // ĐĂNG KÝ SINGLETON LÊN `window.NoirStudio.sysPrompts`
  // ==========================================================================
  const sysPromptsStudio = new FiveModesSystemPromptsStudio();
  sysPromptsStudio.craftCalibrator = new LiteraryTensionAndCraftCalibrator(
    sysPromptsStudio
  );
  sysPromptsStudio.dryRunSimulator = new FiveModesDryRunPromptSimulator(
    sysPromptsStudio
  );
  sysPromptsStudio.simulateCompiledOutput = (modeKey, overrides) =>
    sysPromptsStudio.dryRunSimulator.simulateCompiledOutput(modeKey, overrides);
  sysPromptsStudio.getReadinessMatrix = () =>
    sysPromptsStudio.dryRunSimulator.buildReadinessMatrixReport();

  NS.sysPrompts = sysPromptsStudio;
  NS.FiveModesSystemPromptsStudio = FiveModesSystemPromptsStudio;
  NS.DEFAULT_FIVE_MODE_SYSTEM_PROMPTS = DEFAULT_FIVE_MODE_SYSTEM_PROMPTS;
  NS.GENRE_STYLE_PRESETS = GENRE_STYLE_PRESETS;
  NS.NARRATIVE_TENSION_PROFILES = NARRATIVE_TENSION_PROFILES;

  if (typeof NS.registerModule === 'function') {
    NS.registerModule('mod14', sysPromptsStudio);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        if (!sysPromptsStudio.hasInitialized) sysPromptsStudio.init();
      });
    } else {
      sysPromptsStudio.init();
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
