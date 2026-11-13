/**
 * ============================================================================
 * ✍️ WEB VIẾT TIỂU THUYẾT CỦA BI — MODULE 16 (BATCH 4)
 * TÊN FILE: mod16_master_prompt_synthesizer_two_step.js
 * ============================================================================
 * ĐỘNG CƠ TỔNG HỢP PROMPT TỔNG 2 BƯỚC & THỰC THI VIẾT TIỂU THUYẾT CHÍNH THỨC
 * (MasterPromptSynthesizerAndExecutionEngine — v36.0 SUPREME EDITION)
 *
 * Thiết kế bởi Kiến trúc sư Phần mềm 30 năm kinh nghiệm:
 * 1. Khắc phục triệt để lỗi "bắt nhập lại câu lệnh / báo trống câu lệnh giả":
 *    - Tự động đọc và đồng bộ thời gian thực từ #s18-fullscreen-prompt-textarea,
 *      #mode5-prompt-input, #textarea-chapter-beats, localStorage, lịch sử lệnh
 *      và beats của chương đang mở.
 *    - Không bao giờ chặn tác giả bằng lỗi "Vui lòng nhập câu lệnh" khi tác giả
 *      đã gõ nội dung ở bất kỳ ô nào hoặc khi đã có mốc phân cảnh / cốt truyện!
 * 2. Thực thi quy trình 2 bước chuẩn xác theo yêu cầu của tác giả:
 *    - Bước 1 (#btn-run-master-prompt-synthesis trong #modal-fullscreen-ai-command):
 *      Hiển thị màn hình chờ (#global-ai-blocking-loader), kết nối 100% Story Bible
 *      + Hồ sơ nhân vật + Ma trận Ai Biết Gì + Sổ cái Phục bút + Từ cấm sáo rỗng
 *      + Mốc chuyển cảnh / Đổi POV + Ký ức chống quên BM25 RAG + Câu lệnh tác giả
 *      thành "Prompt Tổng Hợp Chính Thức", rồi mở #modal-confirm-synthesized-prompt.
 *    - Bước 2 (#modal-confirm-synthesized-prompt):
 *      Cho phép tác giả kiểm tra / chỉnh sửa trực tiếp #textarea-synthesized-master-prompt,
 *      chọn lại mô hình AI lần thứ 2 tại #confirm-modal-model-select kèm khuyến cáo
 *      dùng từ Gemini Flash trở lên (Gemini 3.8 Flash, Gemini 3.1 Pro, Gemini 4 Argon)
 *      thay vì Flash-Lite để văn phong giàu cảm xúc nhất, và bấm
 *      #btn-execute-official-novel-prompt để chạy chính thức!
 * 3. Tích hợp Bộ Kiểm Định Ngữ Cảnh Trước Chuyến Bay (Pre-Flight Epistemic &
 *    Continuity Validator), Bộ Phân Bổ Ngân Sách Ngữ Cảnh (Context Budget Optimizer),
 *    Kho Mẫu Lệnh Văn Học (Literary Command Templates), và Bộ Chuẩn Hóa Đầu Ra
 *    Tiểu Thuyết Tiếng Việt.
 * ============================================================================
 */
(function () {
  'use strict';

  window.NoirStudio = window.NoirStudio || {};

  // ==========================================================================
  // PHẦN 1: DANH MỤC MẪU CÂU LỆNH SÁNG TÁC & CẤU HÌNH VĂN PHONG CHUYÊN SÂU
  // ==========================================================================
  const LITERARY_COMMAND_PRESETS = [
    {
      id: 'preset_opening_atmosphere',
      category: 'OPENING',
      label: '🌧️ Mở đầu chương: Dựng bầu không khí & Gieo mầm căng thẳng',
      summary: 'Mở màn chương mới bằng miêu tả đa giác quan, khắc họa nội tâm nhân vật chính và cài cắm chi tiết bất thường đầu tiên.',
      templateText: [
        'Hãy viết phần mở đầu cho chương này với nhịp điệu chậm rãi nhưng ẩn chứa sự bất an ngầm:',
        '1. Khắc họa không gian bối cảnh qua ít nhất 3 giác quan (ánh sáng/bóng tối, âm thanh vọng lại, mùi vị hoặc xúc giác lạnh lẽo).',
        '2. Đi sâu vào dòng suy nghĩ và trạng thái tâm lý hiện tại của nhân vật góc nhìn (POV) sau sự kiện ở chương trước.',
        '3. Cài cắm một chi tiết bất thường nhỏ nhưng đắt giá để dẫn dắt tự nhiên vào Mốc phân cảnh #1.',
        '4. Tuyệt đối tránh lối kể lể tóm tắt; hãy thể hiện cảm xúc qua hành động vô thức, nhịp thở và đối thoại hàm súc.'
      ].join('\n')
    },
    {
      id: 'preset_mind_game_dialogue',
      category: 'DIALOGUE',
      label: '♟️ Đối thoại đấu trí: Ẩn ý ngầm & Thăm dò thông tin',
      summary: 'Triển khai màn đối thoại căng thẳng giữa các nhân vật, tuân thủ nghiêm ngặt Ma trận Ai Biết Gì.',
      templateText: [
        'Hãy triển khai phân cảnh đối thoại đấu trí sâu sắc giữa các nhân vật trong cảnh này:',
        '1. Mọi câu thoại bắt buộc trình bày theo chuẩn: "- Câu thoại (Tên nhân vật)".',
        '2. Mỗi câu nói đều có lớp nghĩa bề mặt và ý đồ thăm dò, che giấu hoặc dẫn dụ ở tầng sâu.',
        '3. Xen kẽ giữa các câu thoại là miêu tả vi biểu cảm (ánh mắt thoáng dừng lại, ngón tay gõ nhẹ, nhịp ngắt quãng trước khi trả lời).',
        '4. Tuân thủ tuyệt đối Ma trận Ai Biết Gì: Nhân vật chưa biết bí mật thì không được nói hớ; nhân vật đang nắm bí mật chỉ tung hỏa mù vừa đủ.'
      ].join('\n')
    },
    {
      id: 'preset_climax_revelation',
      category: 'CLIMAX',
      label: '⚡ Cao trào & Lật mở sự thật: Bùng nổ cảm xúc & Thu hồi phục bút',
      summary: 'Đẩy xung đột lên đỉnh điểm, kích hoạt hoặc thu hồi phục bút đã gieo từ các chương trước.',
      templateText: [
        'Hãy viết phân cảnh cao trào của chương với sức nặng tâm lý và kịch tính cao nhất:',
        '1. Đẩy nhịp văn nhanh, dồn dập ở các đoạn hành động/phát hiện, nhưng lắng lại thật sâu ở khoảnh khắc nhân vật nhận ra sự thật.',
        '2. Kết nối chặt chẽ với các Phục bút (Chekhov\'s Gun) đã gieo trong Story Bible để màn lật mở vừa bất ngờ vừa hợp lý 100%.',
        '3. Miêu tả rõ sự sụp đổ hoặc chuyển biến nhận thức của nhân vật góc nhìn (POV) mà không dùng bất kỳ cụm từ sáo rỗng nào.',
        '4. Khép lại cao trào bằng một dư âm ám ảnh hoặc câu hỏi mở dẫn sang biến cố tiếp theo.'
      ].join('\n')
    },
    {
      id: 'preset_pov_transition_bridge',
      category: 'TRANSITION',
      label: '🎬 Chuyển cảnh & Đổi góc nhìn (POV): Mượt mà & Đổi tông giọng',
      summary: 'Thực hiện chuyển cảnh tự nhiên theo đúng danh sách Mốc chuyển phân cảnh và thay đổi màu sắc tâm lý theo nhân vật POV mới.',
      templateText: [
        'Hãy triển khai chương văn tuân thủ chính xác từng Mốc chuyển phân cảnh và Đổi góc nhìn (POV) đã thiết lập:',
        '1. Tại mỗi điểm chuyển cảnh, tạo một câu văn hoặc hình ảnh chuyển tiếp (visual/thematic bridge) để mạch đọc liền lạc.',
        '2. Khi đổi sang góc nhìn (POV) của nhân vật khác, hãy thay đổi rõ rệt cách quan sát thế giới, từ vựng nội tâm và định kiến riêng của nhân vật đó.',
        '3. Giữ nguyên tính nhất quán của dòng thời gian và vị trí địa lý giữa các cảnh song song hoặc nối tiếp.'
      ].join('\n')
    },
    {
      id: 'preset_psychological_introspection',
      category: 'PSYCHOLOGY',
      label: '🪞 Độc thoại nội tâm & Giằng xé đạo đức (Noir Psychological)',
      summary: 'Đào sâu vào vết thương tâm lý, ký ức ám ảnh và sự giằng xé trước một lựa chọn sinh tử.',
      templateText: [
        'Hãy tập trung khắc họa chiều sâu tâm lý và sự giằng xé nội tâm của nhân vật trong phân cảnh này:',
        '1. Sử dụng hình ảnh ẩn dụ gắn liền với quá khứ hoặc nỗi ám ảnh riêng của nhân vật thay vì gọi tên cảm xúc trực tiếp.',
        '2. Cho thấy sự mâu thuẫn giữa lý trí lạnh lùng và bản năng cảm xúc qua từng cử chỉ nhỏ nhặt.',
        '3. Dẫn dắt nhân vật đi đến một quyết định quan trọng làm thay đổi cục diện mối quan hệ hoặc cốt truyện.'
      ].join('\n')
    },
    {
      id: 'preset_investigative_deduction',
      category: 'MYSTERY',
      label: '🔍 Khám nghiệm hiện trường & Suy luận logic từng bước',
      summary: 'Dành cho phân cảnh tìm kiếm manh mối, lắp ghép dữ kiện và suy luận chặt chẽ.',
      templateText: [
        'Hãy viết phân cảnh quan sát hiện trường và suy luận logic một cách tỉ mỉ, sắc bén:',
        '1. Miêu tả chi tiết các dấu vết vật lý trong không gian theo trình tự quan sát thực tế của nhân vật.',
        '2. Trình bày quá trình loại trừ giả thuyết sai và kết nối các manh mối cũ (từ các chương đã duyệt) với manh mối mới vừa phát hiện.',
        '3. Đảm bảo người đọc có thể theo dõi từng mắt xích suy luận một cách thuyết phục, không nhảy cóc vô lý.'
      ].join('\n')
    },
    {
      id: 'preset_cliffhanger_ending',
      category: 'ENDING',
      label: '🪝 Kết chương gợi mở (Cliffhanger): Dư vị ám ảnh & Cuốn hút',
      summary: 'Khép lại chương bằng một phát hiện bất ngờ, một câu nói bỏ lửng hoặc một biến cố đột ngột khiến độc giả muốn đọc ngay chương sau.',
      templateText: [
        'Hãy hoàn thiện phần cuối chương và tạo một điểm kết (Cliffhanger) thật đắt giá:',
        '1. Giải quyết trọn vẹn mục tiêu chính của phân cảnh hiện tại nhưng mở ra một mối nguy hoặc bí ẩn lớn hơn.',
        '2. Câu văn cuối cùng phải cô đọng, giàu sức gợi hình và tạo tiếng vang tâm lý mạnh mẽ.',
        '3. Kiểm tra lại toàn bộ mạch văn để nối khớp hoàn hảo với đoạn cuối bản thảo đang có.'
      ].join('\n')
    }
  ];

  /**
   * Bảng quy chiếu đặc tả chuyên sâu cho từng chế độ trong 5 Chế độ Thực thi AI
   */
  const EXECUTION_MODE_SPECIFICATIONS = {
    MODE_1_DRAFT: {
      code: 'MODE_1_DRAFT',
      title: '✍️ Chế độ 1: Viết Bản Thảo Văn Học Chính Thức (Literary Drafting)',
      primaryGoal: 'Sáng tác văn xuôi tiểu thuyết hoàn chỉnh, giàu hình ảnh, cảm xúc chân thực, đối thoại sắc sảo và tuân thủ tuyệt đối Story Bible.',
      recommendedMinTemp: 0.7,
      recommendedMaxTemp: 0.95,
      defaultTargetWords: 3500,
      requireStrictDialogueFormat: true,
      requireAntiClicheEnforcement: true,
      requireEpistemicMatrixCheck: true,
      outputStructureGuide: [
        '• Viết trực tiếp văn bản tiểu thuyết hoàn chỉnh (không chèn lời bình của AI ở đầu hoặc cuối).',
        '• Chia đoạn văn rõ ràng, nhịp nhàng giữa miêu tả cảnh vật, hành động, nội tâm và hội thoại.',
        '• Mọi câu thoại bắt buộc định dạng: "- Câu thoại (Tên nhân vật)".',
        '• Triển khai đầy đủ các Mốc chuyển phân cảnh / Đổi góc nhìn (POV) theo thứ tự đã định.'
      ]
    },
    MODE_2_BRAINSTORM: {
      code: 'MODE_2_BRAINSTORM',
      title: '💡 Chế độ 2: Bàn Tròn Ý Tưởng & Thiết Kế Nhánh Cốt Truyện (Plot Brainstorming)',
      primaryGoal: 'Đề xuất các phương án phát triển tình tiết đột phá, nút thắt bất ngờ (plot twist), cách gỡ bí kịch bản và phương án thu hồi phục bút.',
      recommendedMinTemp: 0.8,
      recommendedMaxTemp: 1.0,
      defaultTargetWords: 2500,
      requireStrictDialogueFormat: false,
      requireAntiClicheEnforcement: true,
      requireEpistemicMatrixCheck: true,
      outputStructureGuide: [
        '• Đưa ra ít nhất 3 Phương Án Triển Khai Cốt Truyện khác nhau (từ hợp lý cổ điển đến đột phá bất ngờ).',
        '• Với mỗi phương án: Phân tích rõ Nguyên nhân -> Diễn biến -> Hệ quả tâm lý -> Tác động tới các chương sau.',
        '• Gợi ý các chi tiết Phục bút (Chekhov\'s Gun) có thể gieo mới hoặc kích hoạt trong chương này.',
        '• Đề xuất 3-5 câu thoại đắt giá hoặc hình ảnh ẩn dụ nghệ thuật mà tác giả có thể đưa vào bản thảo.'
      ]
    },
    MODE_3_AUDIT: {
      code: 'MODE_3_AUDIT',
      title: '🔍 Chế độ 3: Thanh Tra Logic, Mâu Thuẫn Thời Gian & Ma Trận Ai Biết Gì (Continuity Audit)',
      primaryGoal: 'Rà soát nghiêm ngặt toàn bộ lỗ hổng logic, sai lệch dòng thời gian, nhân vật biết trước thông tin chưa được tiết lộ (OOC / Epistemic Leak) và phục bút bị bỏ quên.',
      recommendedMinTemp: 0.25,
      recommendedMaxTemp: 0.55,
      defaultTargetWords: 2200,
      requireStrictDialogueFormat: false,
      requireAntiClicheEnforcement: false,
      requireEpistemicMatrixCheck: true,
      outputStructureGuide: [
        '• Lập Báo Cáo Thanh Tra Logic chia thành 4 mục rõ ràng:',
        '  1. Kiểm tra Dòng Thời Gian & Vị Trí Địa Lý giữa các chương.',
        '  2. Kiểm tra Ma Trận Ai Biết Gì (Có nhân vật nào nói hoặc hành xử dựa trên thông tin họ chưa từng biết không?).',
        '  3. Kiểm tra Tính Nhất Quán Tính Cách (OOC) & Trạng Thái Nhân Vật.',
        '  4. Đề xuất Cách Sửa Cụ Thể từng điểm mâu thuẫn (kèm đoạn văn mẫu đã chỉnh sửa).'
      ]
    },
    MODE_4_REVIEW: {
      code: 'MODE_4_REVIEW',
      title: '✨ Chế độ 4: Biên Tập Chuyên Sâu, Gọt Văn Chống Sáo Rỗng & Chuẩn Hóa Thoại (Literary Polish)',
      primaryGoal: 'Nâng cấp chất lượng văn chương của bản thảo, loại bỏ 100% từ ngữ sáo rỗng (Anti-Cliché), chuẩn hóa định dạng hội thoại và làm giàu nhạc tính tiếng Việt.',
      recommendedMinTemp: 0.5,
      recommendedMaxTemp: 0.8,
      defaultTargetWords: 3200,
      requireStrictDialogueFormat: true,
      requireAntiClicheEnforcement: true,
      requireEpistemicMatrixCheck: true,
      outputStructureGuide: [
        '• Phần 1: Nhận xét nhanh về nhịp điệu, giọng văn, các câu chữ chưa đắt hoặc dính từ cấm sáo rỗng.',
        '• Phần 2: Bản thảo đã được biên tập và gọt giũa hoàn chỉnh (giữ nguyên 100% cốt truyện và ý đồ của tác giả nhưng nâng tầm văn phong sắc sảo, giàu hình ảnh).',
        '• Chuẩn hóa toàn bộ câu thoại về đúng định dạng: "- Câu thoại (Tên nhân vật)".'
      ]
    },
    MODE_5_DIAGRAM: {
      code: 'MODE_5_DIAGRAM',
      title: '🎨 Chế độ 5: Vẽ Biểu Đồ Cốt Truyện, Mạng Lưới Nhân Vật & Đối Chiếu Thời Gian (Visual Chronicle)',
      primaryGoal: 'Trích xuất cấu trúc sự kiện, mạng lưới quan hệ nhân vật và dòng thời gian thành sơ đồ trực quan kèm báo cáo đối chiếu xuyên chương.',
      recommendedMinTemp: 0.3,
      recommendedMaxTemp: 0.6,
      defaultTargetWords: 2000,
      requireStrictDialogueFormat: false,
      requireAntiClicheEnforcement: false,
      requireEpistemicMatrixCheck: true,
      outputStructureGuide: [
        '• Trả về khối dữ liệu JSON chuẩn (nodes, links, contradictions) để dựng biểu đồ SVG tương tác.',
        '• Tiếp theo là Báo Cáo Biên Niên Sử & Đối Chiếu Dòng Thời Gian chi tiết qua từng chương đã chọn.'
      ]
    }
  };

  /**
   * Placeholder gợi ý chuyên biệt (chữ xám hướng dẫn) cho từng chế độ 1 -> 5 trong #s18-fullscreen-prompt-textarea
   */
  const MODE_PROMPT_PLACEHOLDERS = Object.freeze({
    MODE_1_DRAFT: [
      '✍️ [CHẾ ĐỘ 1 — VIẾT BẢN THẢO CHÍNH THỨC]',
      'Nhập diễn biến chương truyện, tâm lý nhân vật, bối cảnh không gian hoặc phân cảnh bạn muốn AI triển khai chi tiết (3.000 - 4.000+ từ) tại đây...',
      '',
      'Ví dụ gợi ý để viết sâu sắc, không tua nhanh:',
      '- Cảnh 1 (Mưa khuya ở sảnh ga): Nhân vật A giữ im lặng khi nhận phong thư nặc danh, miêu tả chậm cảm giác lạnh gáy, mùi nước mưa và ánh đèn vàng hắt lên ngón tay run.',
      '- Cảnh 2 (Đối thoại căng thẳng): Cuộc chạm trán với Nhân vật B, dùng lời nói ẩn ý chứ chưa vội lật bài ngửa ngay.',
      '- Lưu ý: Hệ thống tự động lồng ghép dàn ý đã phát triển ở Chế độ 2 (nếu có) + Story Bible + Mốc chuyển phân cảnh + Ma trận Ai Biết Gì.'
    ].join('\n'),

    MODE_2_BRAINSTORM: [
      'Bạn có thể liệt kê dàn ý thô ở đây (mỗi gạch đầu dòng là một nhịp sự kiện hoặc ý tưởng bạn đã nghĩ sẵn) để AI chi tiết hóa từng bước mà không tự ý tua nhanh mạch truyện...',
      '',
      'Ví dụ dàn ý thô cực hiệu quả cho Chế độ 2:',
      '- Bối cảnh mở đầu chương: Nhân vật chính trở lại căn phòng cũ sau cuộc cãi vã.',
      '- Ý tưởng muốn khai thác: Tìm thấy một mẩu giấy nhắn cũ hoặc một món đồ làm dấy lên nghi ngờ về người anh trai.',
      '- Yêu cầu AI: Dựa vào các gạch đầu dòng trên + Story Bible, hãy phát triển chi tiết 3 phương án diễn biến tâm lý chậm rãi cho riêng chương tiếp theo (chưa vội cho nhân vật biết sự thật ngay, giữ nhịp hồi hộp & gài phục bút tinh tế).'
    ].join('\n'),

    MODE_3_AUDIT: [
      '🔍 [CHẾ ĐỘ 3 — THANH TRA LOGIC & MA TRẬN AI BIẾT GÌ]',
      'Nêu những đoạn bạn nghi ngờ có lỗ hổng thời gian, sai vị trí đồ vật, nhân vật lỡ miệng biết trước bí mật chưa công khai (Epistemic Leak) hoặc chuyển góc nhìn POV bất hợp lý...',
      '',
      'Ví dụ yêu cầu kiểm toán:',
      '- Kiểm tra giúp tôi xem ở Chương 3 nhân vật C có biết quá sớm chi tiết chiếc chìa khóa bạc không?',
      '- Đối chiếu đồng hồ thời gian từ lúc 21:00 đến rạng sáng xem các nhân vật di chuyển giữa 2 địa điểm có khớp giờ không?',
      '- Soi kỹ đoạn cuối xem nhân vật có bị OOC (hành xử trái tính cách gốc) hoặc lặp từ AI hay không.'
    ].join('\n'),

    MODE_4_REVIEW: [
      '✨ [CHẾ ĐỘ 4 — HỘI ĐỒNG ĐỘC GIẢ BETA & BIÊN TẬP GỌT VĂN]',
      'Dán đoạn văn hoặc nêu trọng tâm bạn muốn biên tập: chấm điểm 6 trụ cột văn học, nhận xét nhịp đọc trên điện thoại, gọt bớt từ sáo rỗng hoặc viết lại lời thoại cho sắc bén hơn...',
      '',
      'Ví dụ yêu cầu gọt văn & đánh giá:',
      '- Đóng vai 3 nhóm độc giả (thích đấu trí, thích tâm lý, đọc giải trí nhanh) nhận xét xem mở đầu Chương này đủ cuốn chưa?',
      '- Chỉnh giúp tôi những câu văn kể lể cảm xúc thô thành tả qua hành động (Show Don\'t Tell), và chuẩn hóa toàn bộ câu thoại về dạng "- Câu thoại (Tên nhân vật)".'
    ].join('\n'),

    MODE_5_DIAGRAM: [
      '🎨 [CHẾ ĐỘ 5 — SƠ ĐỒ CỐT TRUYỆN & BIÊN NIÊN SỬ THỜI GIAN]',
      'Nhập phạm vi các chương, tuyến nhân vật hoặc nút thắt bí ẩn bạn muốn AI vẽ thành Sơ đồ SVG và đối chiếu bảng dòng thời gian chi tiết từ Story Bible...',
      '',
      'Ví dụ yêu cầu vẽ sơ đồ:',
      '- Hãy lập sơ đồ dòng thời gian và mối quan hệ nhân quả từ Chương 1 đến Chương 3 cho tuyến điều tra vụ mất tích tại ga tàu.',
      '- Đánh dấu đỏ những mốc thời gian có nguy cơ xung đột địa điểm hoặc nhân vật lộ bí mật.'
    ].join('\n')
  });

  /**
   * Danh mục tư vấn sử dụng Mô hình AI giúp tác giả chọn đúng giữa Flash / Pro / Argon và Flash-Lite
   */
  const MODEL_TIER_ADVISORY_GUIDE = {
    'gemini-3.8-flash': {
      badge: '🌟 KHUYÊN DÙNG SỐ 1 CHO VIẾT TIỂU THUYẾT',
      toneQuality: '9.5/10 — Giàu cảm xúc, từ vựng tiếng Việt tự nhiên, miêu tả tâm lý mượt mà',
      logicDepth: '9.0/10 — Bám sát Story Bible và Mốc chuyển cảnh',
      speedRating: '⚡ Nhanh & Ổn định',
      recommendationNote:
        'Lựa chọn tối ưu nhất để viết bản thảo chính thức (Chế độ 1) và gọt văn (Chế độ 4). Văn phong có hồn, giàu ẩn dụ và không bị khô cứng.'
    },
    'gemini-3.1-pro-preview': {
      badge: '👑 CHUYÊN GIA LOGIC DÀI HƠI & PHỤC BÚT PHỨC TẠP',
      toneQuality: '9.6/10 — Sâu sắc, chững chạc, cấu trúc tầng lớp chặt chẽ',
      logicDepth: '9.9/10 — Đối chiếu hoàn hảo hàng chục nhân vật và Ma trận Ai Biết Gì',
      speedRating: '⏳ Trung bình (Suy luận sâu)',
      recommendationNote:
        'Rất mạnh khi viết các chương cao trào đan xen nhiều tuyến nhân vật, đấu trí phức tạp hoặc khi chạy Thanh tra Logic (Chế độ 3).'
    },
    'gemini-4-argon': {
      badge: '💎 ĐỈNH CAO VĂN CHƯƠNG & ĐỘC THOẠI NỘI TÂM',
      toneQuality: '9.9/10 — Chất văn nghệ thuật cao, giàu nhạc tính và chiều sâu triết lý',
      logicDepth: '9.8/10 — Kết nối tinh tế các phục bút ẩn',
      speedRating: '⏳ Chậm hơn (Ưu tiên chất lượng tối đa)',
      recommendationNote:
        'Lý tưởng cho những phân cảnh tâm lý nặng đô, hồi tưởng bi kịch hoặc chương kết quyển cần sức nặng văn học đặc biệt.'
    },
    'gemini-3.1-flash-lite-preview': {
      badge: '⚡ SIÊU NHANH — CHỈ NÊN DÙNG ĐỂ NHÁP NHANH / HỎI ĐÁP NGẮN',
      toneQuality: '7.0/10 — Câu văn ngắn gọn, ít chiều sâu miêu tả nội tâm',
      logicDepth: '7.5/10 — Đáp ứng ngữ cảnh cơ bản',
      speedRating: '🚀 Tức thì',
      recommendationNote:
        '⚠️ LƯU Ý: Mô hình Flash-Lite ưu tiên tốc độ nên văn phong dễ bị tóm tắt hoặc kém bay bổng. Khi viết tiểu thuyết chính thức, bạn nên đổi sang Gemini 3.8 Flash hoặc Gemini 3.1 Pro!'
    }
  };

  // ==========================================================================
  // PHẦN 2: BỘ PHÂN BỔ NGÂN SÁCH NGỮ CẢNH & KIỂM ĐỊNH TRƯỚC CHUYẾN BAY
  //         (ContextBudgetAndPreFlightInspector)
  // ==========================================================================
  class ContextBudgetAndPreFlightInspector {
    constructor(utils) {
      this.utils = utils;
    }

    countWordsSafe(text) {
      if (this.utils && typeof this.utils.countVietnameseWords === 'function') {
        return this.utils.countVietnameseWords(text || '');
      }
      const raw = String(text || '').trim();
      return raw ? raw.split(/\s+/).filter(Boolean).length : 0;
    }

    estimateTokensFromVietnameseWords(wordCount) {
      const w = Math.max(0, Number(wordCount) || 0);
      return Math.ceil(w * 1.45);
    }

    /**
     * Phân tích chi tiết từng thành phần trong gói Prompt Tổng Hợp để hiển thị
     * thống kê minh bạch cho tác giả và đảm bảo không bỏ sót bất kỳ dữ liệu nào.
     */
    analyzeContextLayers({
      sysInstruction = '',
      techSpecBlock = '',
      bibleBlock = '',
      sceneMarkersBlock = '',
      approvedSummariesBlock = '',
      ragBlock = '',
      tailContextBlock = '',
      userCommandBlock = ''
    }) {
      const layers = [
        {
          id: 'layer_sys_prompt',
          label: '1. Chỉ thị Hệ thống & Vai trò Văn học',
          words: this.countWordsSafe(sysInstruction),
          chars: String(sysInstruction || '').length,
          status: sysInstruction.trim() ? 'READY' : 'EMPTY'
        },
        {
          id: 'layer_tech_specs',
          label: '2. Thông số Kỹ thuật (Số từ, POV, Temp, Chuẩn thoại)',
          words: this.countWordsSafe(techSpecBlock),
          chars: String(techSpecBlock || '').length,
          status: 'READY'
        },
        {
          id: 'layer_story_bible',
          label: '3. Hồ sơ Story Bible, Nhân vật, Ma trận Ai Biết Gì & Từ cấm',
          words: this.countWordsSafe(bibleBlock),
          chars: String(bibleBlock || '').length,
          status: bibleBlock.trim() ? 'READY' : 'EMPTY'
        },
        {
          id: 'layer_scene_markers',
          label: '4. Mốc Chuyển Phân Cảnh & Đổi Góc Nhìn (POV)',
          words: this.countWordsSafe(sceneMarkersBlock),
          chars: String(sceneMarkersBlock || '').length,
          status: sceneMarkersBlock.includes('Chưa đặt mốc') ? 'DEFAULT' : 'READY'
        },
        {
          id: 'layer_approved_continuity',
          label: '5. Tóm tắt Mạch Truyện Các Chương Đã Duyệt',
          words: this.countWordsSafe(approvedSummariesBlock),
          chars: String(approvedSummariesBlock || '').length,
          status: approvedSummariesBlock.includes('chưa có chương') ? 'INITIAL' : 'READY'
        },
        {
          id: 'layer_bm25_rag',
          label: '6. Ký Ức Chống Quên Cục Bộ (BM25 RAG)',
          words: this.countWordsSafe(ragBlock),
          chars: String(ragBlock || '').length,
          status: ragBlock.includes('Không có đoạn ký ức') ? 'STANDBY' : 'ACTIVE'
        },
        {
          id: 'layer_manuscript_tail',
          label: '7. Đoạn Cuối Bản Thảo Hiện Tại (Nối mạch)',
          words: this.countWordsSafe(tailContextBlock),
          chars: String(tailContextBlock || '').length,
          status: tailContextBlock.includes('đang trống') ? 'NEW_CHAPTER' : 'CONNECTED'
        },
        {
          id: 'layer_user_command',
          label: '8. Yêu Cầu / Câu Lệnh Cụ Thể Của Tác Giả',
          words: this.countWordsSafe(userCommandBlock),
          chars: String(userCommandBlock || '').length,
          status: userCommandBlock.trim() ? 'READY' : 'AUTO_INFERRED'
        }
      ];

      const totalWords = layers.reduce((acc, item) => acc + item.words, 0);
      const totalChars = layers.reduce((acc, item) => acc + item.chars, 0);
      const estimatedInputTokens = this.estimateTokensFromVietnameseWords(totalWords);

      return {
        layers,
        totalWords,
        totalChars,
        estimatedInputTokens
      };
    }

    /**
     * Đối chiếu câu lệnh của tác giả với Ma trận Ai Biết Gì, Trạng thái Nhân vật
     * và Sổ cái Phục bút để tạo danh sách Lưu Ý Tự Động (Epistemic & Continuity Guardrails)
     * đính kèm vào Prompt Tổng Hợp.
     */
    buildEpistemicAndContinuityGuardrails(storyBible, sceneBuilder, activeChapter, userCommand) {
      const notes = [];
      const characters = Array.isArray(storyBible?.characters) ? storyBible.characters : [];
      const matrix = Array.isArray(storyBible?.knowledgeMatrix) ? storyBible.knowledgeMatrix : [];
      const clues = Array.isArray(storyBible?.cluesLedger) ? storyBible.cluesLedger : [];
      const antiCliche = Array.isArray(storyBible?.antiClicheList) ? storyBible.antiClicheList : [];
      const markers = Array.isArray(sceneBuilder?.markers) ? sceneBuilder.markers : [];

      const combinedContextText = `${userCommand || ''} ${activeChapter?.displayTitle || ''} ${
        markers.map((m) => `${m.pov || ''} ${m.location || ''} ${m.goal || ''}`).join(' ')
      }`.toLowerCase();

      // 1. Kiểm tra nhân vật xuất hiện trong câu lệnh hoặc mốc phân cảnh
      const mentionedChars = characters.filter((ch) => {
        const name = String(ch?.name || '').trim().toLowerCase();
        return name && combinedContextText.includes(name);
      });

      if (mentionedChars.length > 0) {
        mentionedChars.forEach((ch) => {
          notes.push(
            `• [Nhân vật trọng tâm "${ch.name}" (${ch.role || 'Nhân vật'})]: Tính cách & Giọng điệu: ${
              ch.traits || 'Giữ đúng hồ sơ gốc'
            } | Mục tiêu/Bí mật: ${ch.goal || 'Theo mạch truyện'}.`
          );
        });
      } else if (characters.length > 0) {
        notes.push(
          `• [Hệ thống nhân vật]: Có ${characters.length} hồ sơ nhân vật trong Story Bible. Khi nhân vật nào xuất hiện, bắt buộc giữ đúng giọng nói, xưng hô và tâm lý của nhân vật đó.`
        );
      }

      // 2. Kiểm tra Ma trận Ai Biết Gì (Epistemic Boundaries)
      if (matrix.length > 0) {
        matrix.forEach((row) => {
          const charName = String(row.character || '').trim();
          const secret = String(row.secret || '').trim();
          const state = String(row.state || '').toUpperCase();
          if (!charName || !secret) return;

          if (state.includes('CHƯA BIẾT') || state === 'UNKNOWN') {
            notes.push(
              `• ⛔ [CẢNH BÁO GIỚI HẠN NHẬN THỨC]: Nhân vật "${charName}" HIỆN CHƯA BIẾT về sự thật/bí mật "${secret}". Tuyệt đối KHÔNG để "${charName}" nói, suy nghĩ hoặc hành động như thể đã biết điều này (trừ khi câu lệnh của tác giả yêu cầu tiết lộ ngay trong cảnh này).`
            );
          } else if (state.includes('NGHI NGỜ') || state === 'SUSPECTS') {
            notes.push(
              `• ⚠️ [TRẠNG THÁI NGHI NGỜ]: Nhân vật "${charName}" mới chỉ ĐANG NGHI NGỜ về "${secret}" (${
                row.note || 'Chưa có bằng chứng xác thực'
              }). Hãy thể hiện sự dò xét, bán tín bán nghi thay vì khẳng định chắc chắn.`
            );
          } else {
            notes.push(
              `• ✅ [ĐÃ NẮM THÔNG TIN]: Nhân vật "${charName}" ĐÃ BIẾT rõ về "${secret}" (${
                row.note || 'Có thể chủ động sử dụng thông tin này'
              }).`
            );
          }
        });
      }

      // 3. Kiểm tra Sổ cái Phục bút (Chekhov's Gun Clues)
      const activeClues = clues.filter((c) => c && c.status !== 'RESOLVED');
      if (activeClues.length > 0) {
        const clueSummary = activeClues
          .slice(0, 6)
          .map(
            (c) =>
              `"${c.title}" (Gieo tại: ${c.plantedIn || 'Chương trước'} -> Dự kiến thu hồi: ${
                c.payoffPlan || 'Chờ kích hoạt'
              })`
          )
          .join('; ');
        notes.push(
          `• 🔫 [PHỤC BÚT ĐANG CÀI CẮM (${activeClues.length} manh mối mở)]: ${clueSummary}. Hãy duy trì tính nhất quán của các vật chứng/chi tiết này nếu chúng xuất hiện.`
        );
      }

      // 4. Kiểm tra Mốc chuyển phân cảnh & Đổi POV
      if (markers.length > 0) {
        notes.push(
          `• 🎬 [LỘ TRÌNH ${markers.length} MỐC CHUYỂN PHÂN CẢNH]: Bắt buộc triển khai đầy đủ theo thứ tự từ Cảnh #1 đến Cảnh #${markers.length}, giữ đúng Điểm nhìn (POV) và Thời gian/Địa điểm của từng mốc.`
        );
      }

      // 5. Nhắc nhở chống từ sáo rỗng (Anti-Cliché)
      if (antiCliche.length > 0) {
        notes.push(
          `• 🚫 [KIỂM SOÁT CHỐNG SÁO RỖNG]: Tuyệt đối không sử dụng ${antiCliche.length} cụm từ cấm trong danh sách Anti-Cliché (ví dụ: "${antiCliche
            .slice(0, 4)
            .join('", "')}"). Hãy thay bằng chi tiết quan sát cụ thể, hành động cơ thể và hình ảnh mới mẻ.`
        );
      }

      return notes.join('\n');
    }

    /**
     * Phân tích đoạn cuối bản thảo hiện tại để hướng dẫn AI nối mạch tự nhiên nhất
     * (không lặp lại câu cuối, không đứt gãy hội thoại đang dang dở).
     */
    buildSeamlessContinuationDirective(currentText) {
      const trimmed = String(currentText || '').trim();
      if (!trimmed) {
        return {
          mode: 'FRESH_CHAPTER_START',
          tailExcerpt: '(Chương hiện tại đang trống — Hãy bắt đầu viết từ câu mở đầu chương)',
          continuationHint:
            'Chương này chưa có nội dung bản thảo. Hãy mở đầu chương thật ấn tượng, thiết lập ngay không gian, thời gian và tâm thế của nhân vật góc nhìn (POV).'
        };
      }

      const paragraphs = trimmed
        .split(/\r?\n+/)
        .map((p) => p.trim())
        .filter(Boolean);
      const lastParagraph = paragraphs[paragraphs.length - 1] || '';
      const endsInDialogue = /^[-–—]/.test(lastParagraph) || /\([^)]+\)\s*$/.test(lastParagraph);
      const tailExcerpt = trimmed.slice(-2400);

      let continuationHint =
        'Bản thảo hiện tại đang viết dở. Hãy đọc kỹ đoạn văn cuối cùng bên trên và viết NỐI TIẾP MƯỢT MÀ ngay sau câu cuối cùng (tuyệt đối không chép lặp lại đoạn đã có).';
      if (endsInDialogue) {
        continuationHint +=
          ' Lưu ý: Câu cuối cùng của bản thảo đang là một câu thoại — hãy tiếp nối bằng phản ứng, hành động hoặc lời đáp trả tự nhiên của nhân vật đối diện.';
      }

      return {
        mode: 'SEAMLESS_CONTINUATION',
        tailExcerpt,
        lastParagraph,
        endsInDialogue,
        continuationHint
      };
    }
  }

  // ==========================================================================
  // PHẦN 3: BỘ HẬU XỬ LÝ & KIỂM ĐỊNH ĐẦU RA VĂN HỌC TIẾNG VIỆT
  //         (VietnameseLiteraryOutputPostProcessor)
  // ==========================================================================
  class VietnameseLiteraryOutputPostProcessor {
    constructor(utils) {
      this.utils = utils;
    }

    /**
     * Chuẩn hóa văn bản đầu ra của AI:
     * - Loại bỏ các dòng rào đón thừa của AI (nếu ở Chế độ 1 Viết bản thảo)
     * - Chuẩn hóa khoảng trắng và dấu gạch ngang đầu dòng câu thoại
     * - Kiểm tra tỷ lệ tuân thủ định dạng thoại "- Câu thoại (Tên nhân vật)"
     * - Phát hiện xem còn sót cụm từ cấm Anti-Cliché nào không
     */
    processAndInspectOutput(rawText, modeKey, antiClicheList = []) {
      let cleaned = String(rawText || '').replace(/\r\n/g, '\n').trim();
      if (!cleaned) {
        return {
          text: '',
          stats: {
            wordCount: 0,
            paragraphCount: 0,
            dialogueLinesCount: 0,
            detectedCliches: []
          }
        };
      }

      // Ở Chế độ 1 (Viết bản thảo), gỡ bỏ các câu mở đầu kiểu trợ lý AI nếu vô tình xuất hiện
      if (modeKey === 'MODE_1_DRAFT') {
        cleaned = cleaned
          .replace(
            /^(Dưới đây là|Sau đây là|Chào bạn,?\s*dưới đây là|Tuyệt vời!?\s*Dưới đây là)[^\n]*:\s*\n+/i,
            ''
          )
          .trim();
      }

      // Gọt sạch toàn bộ ký hiệu Markdown/AI dư thừa (**, *, ###, ##, ---, ```, `) để bản thảo luôn thuần văn xuôi sạch đẹp
      if (modeKey !== 'MODE_5_DIAGRAM') {
        const stripper =
          typeof window !== 'undefined' && typeof window.NoirStudio?.stripAiMarkdownSymbols === 'function'
            ? window.NoirStudio.stripAiMarkdownSymbols
            : this.utils?.stripAiMarkdownSymbols?.bind(this.utils);
        if (typeof stripper === 'function') {
          cleaned = stripper(cleaned);
        }
      }

      // Chuẩn hóa dòng trống quá nhiều (tối đa 2 dòng xuống hàng liên tiếp)
      cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

      // Chuẩn hóa các dòng hội thoại bắt đầu bằng "– " hoặc "— " về "- " chuẩn
      const lines = cleaned.split('\n').map((line) => {
        const trimmedLine = line.trim();
        if (/^[–—]\s+/.test(trimmedLine)) {
          return trimmedLine.replace(/^[–—]\s+/, '- ');
        }
        return line;
      });
      cleaned = lines.join('\n');

      // Thống kê câu thoại và kiểm tra từ cấm Anti-Cliché
      const dialogueLines = lines.filter((l) => /^-\s+.+/.test(l.trim()));
      const lowerText = cleaned.toLowerCase();
      const detectedCliches = (Array.isArray(antiClicheList) ? antiClicheList : []).filter(
        (phrase) => {
          const p = String(phrase || '').trim().toLowerCase();
          return p && lowerText.includes(p);
        }
      );

      const wordCount =
        this.utils && typeof this.utils.countVietnameseWords === 'function'
          ? this.utils.countVietnameseWords(cleaned)
          : cleaned.split(/\s+/).filter(Boolean).length;

      const paragraphCount =
        this.utils && typeof this.utils.countParagraphs === 'function'
          ? this.utils.countParagraphs(cleaned)
          : lines.filter((l) => l.trim().length > 0).length;

      return {
        text: cleaned,
        stats: {
          wordCount,
          paragraphCount,
          dialogueLinesCount: dialogueLines.length,
          detectedCliches
        }
      };
    }
  }
  // ==========================================================================
  // PHẦN 4: BỘ QUẢN LÝ LỊCH SỬ CÂU LỆNH & KHÔI PHỤC TỨC THÌ
  //         (CommandHistoryAndSnapshotManager)
  // ==========================================================================
  class CommandHistoryAndSnapshotManager {
    constructor(idb, utils) {
      this.idb = idb;
      this.utils = utils;
      this.storageKey = 'noir_v36_command_prompt_history_stack';
      this.primaryPromptKey = 'noir_v36_last_command_prompt';
      this.maxHistoryEntries = 35;
      this.history = [];
      this.loadHistory();
    }

    loadHistory() {
      try {
        const raw = localStorage.getItem(this.storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            this.history = parsed;
          }
        }
      } catch (_) {
        this.history = [];
      }
    }

    saveHistory() {
      try {
        localStorage.setItem(
          this.storageKey,
          JSON.stringify(this.history.slice(0, this.maxHistoryEntries))
        );
      } catch (_) {}
    }

    recordCommandSnapshot({
      commandText,
      modeKey = 'MODE_1_DRAFT',
      chapterId = null,
      chapterTitle = '',
      modelId = 'gemini-3.8-flash',
      targetWords = 3500
    }) {
      const clean = String(commandText || '').trim();
      if (!clean) return null;

      try {
        localStorage.setItem(this.primaryPromptKey, clean);
      } catch (_) {}

      // Không lưu trùng lặp liên tiếp nếu câu lệnh giống hệt bản ghi mới nhất
      if (this.history.length > 0 && this.history[0].commandText === clean) {
        this.history[0].timestamp = Date.now();
        this.history[0].modeKey = modeKey;
        this.history[0].modelId = modelId;
        this.saveHistory();
        return this.history[0];
      }

      const entry = {
        id: `cmd_hist_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        timestamp: Date.now(),
        commandText: clean,
        modeKey,
        chapterId,
        chapterTitle: chapterTitle || 'Chương hiện tại',
        modelId,
        targetWords: Number(targetWords) || 3500,
        wordCount:
          this.utils && typeof this.utils.countVietnameseWords === 'function'
            ? this.utils.countVietnameseWords(clean)
            : clean.split(/\s+/).filter(Boolean).length
      };

      this.history.unshift(entry);
      if (this.history.length > this.maxHistoryEntries) {
        this.history = this.history.slice(0, this.maxHistoryEntries);
      }
      this.saveHistory();
      return entry;
    }

    getLatestSavedCommand() {
      const direct = localStorage.getItem(this.primaryPromptKey);
      if (direct && direct.trim()) {
        return direct.trim();
      }
      if (this.history.length > 0 && this.history[0].commandText) {
        return String(this.history[0].commandText).trim();
      }
      return '';
    }

    getHistoryList() {
      return [...this.history];
    }

    clearHistory() {
      this.history = [];
      this.saveHistory();
    }
  }

  // ==========================================================================
  // PHẦN 5: BỘ ĐO LƯỜNG HIỆU SUẤT & NHẬT KÝ THỰC THI AI
  //         (PromptExecutionTelemetryLogger)
  // ==========================================================================
  class PromptExecutionTelemetryLogger {
    constructor() {
      this.storageKey = 'noir_v36_prompt_execution_telemetry';
      this.maxLogs = 50;
      this.logs = [];
      this.loadLogs();
    }

    loadLogs() {
      try {
        const raw = localStorage.getItem(this.storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            this.logs = parsed;
          }
        }
      } catch (_) {
        this.logs = [];
      }
    }

    saveLogs() {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.logs.slice(0, this.maxLogs)));
      } catch (_) {}
    }

    recordExecution({
      modeKey,
      modelId,
      usedEndpoint,
      chapterTitle,
      promptWords,
      outputWords,
      durationMs,
      status = 'SUCCESS',
      errorMessage = ''
    }) {
      const item = {
        id: `exec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: Date.now(),
        modeKey: modeKey || 'MODE_1_DRAFT',
        modelId: modelId || 'gemini-3.8-flash',
        usedEndpoint: usedEndpoint || modelId || 'gemini-2.5-flash',
        chapterTitle: chapterTitle || 'Chương hiện tại',
        promptWords: Number(promptWords) || 0,
        outputWords: Number(outputWords) || 0,
        durationMs: Number(durationMs) || 0,
        status,
        errorMessage: String(errorMessage || '')
      };
      this.logs.unshift(item);
      if (this.logs.length > this.maxLogs) {
        this.logs = this.logs.slice(0, this.maxLogs);
      }
      this.saveLogs();
      return item;
    }

    getSummaryMetrics() {
      const totalRuns = this.logs.length;
      const successRuns = this.logs.filter((l) => l.status === 'SUCCESS');
      const totalGeneratedWords = successRuns.reduce((acc, l) => acc + (l.outputWords || 0), 0);
      const avgDurationMs =
        successRuns.length > 0
          ? Math.round(
              successRuns.reduce((acc, l) => acc + (l.durationMs || 0), 0) / successRuns.length
            )
          : 0;

      return {
        totalRuns,
        successCount: successRuns.length,
        failureCount: totalRuns - successRuns.length,
        totalGeneratedWords,
        avgDurationMs,
        recentLogs: this.logs.slice(0, 10)
      };
    }
  }

  // ==========================================================================
  // PHẦN 6: ĐỘNG CƠ CHÍNH — MASTER PROMPT SYNTHESIZER & EXECUTION ENGINE
  //         (MasterPromptSynthesizerAndExecutionEngine)
  // ==========================================================================
  class MasterPromptSynthesizerAndExecutionEngine {
    constructor(
      idb,
      chapterMgr,
      storyBible,
      sceneBuilder,
      sysPrompts,
      rag,
      geminiRouter,
      utils
    ) {
      this._idb = idb;
      this._chapterMgr = chapterMgr;
      this._storyBible = storyBible;
      this._sceneBuilder = sceneBuilder;
      this._sysPrompts = sysPrompts;
      this._rag = rag;
      this._geminiRouter = geminiRouter;
      this._utils = utils;

      this.lastSynthesizedPrompt = '';
      this.lastContextBreakdown = null;
      this.isSynthesizing = false;
      this.isExecutingOfficialPrompt = false;
      this.activePresetCategory = 'ALL';

      this.inspector = new ContextBudgetAndPreFlightInspector(this.utils);
      this.postProcessor = new VietnameseLiteraryOutputPostProcessor(this.utils);
      this.commandHistory = new CommandHistoryAndSnapshotManager(this.idb, this.utils);
      this.telemetry = new PromptExecutionTelemetryLogger();
    }

    // Các getter tự động liên kết với window.NoirStudio nếu mô-đun được nạp độc lập
    get constants() {
      return (
        window.NoirStudio?.constants || {
          STORAGE_KEYS: {
            SELECTED_MODEL: 'noir_selected_gemini_model',
            EXECUTION_MODE: 'noir_selected_ai_mode',
            TARGET_WORDS: 'noir_target_word_count',
            TEMPERATURE: 'noir_ai_temperature'
          }
        }
      );
    }

    get idb() {
      return this._idb || window.NoirStudio?.idb;
    }

    get chapterMgr() {
      return this._chapterMgr || window.NoirStudio?.chapterManager;
    }

    get storyBible() {
      return this._storyBible || window.NoirStudio?.storyBible;
    }

    get sceneBuilder() {
      return this._sceneBuilder || window.NoirStudio?.sceneBuilder;
    }

    get sysPrompts() {
      return this._sysPrompts || window.NoirStudio?.sysPrompts;
    }

    get rag() {
      return this._rag || window.NoirStudio?.rag;
    }

    get geminiRouter() {
      return this._geminiRouter || window.NoirStudio?.geminiRouter;
    }

    get utils() {
      return (
        this._utils ||
        window.NoirStudio?.utils || {
          escapeHtml: (s) => String(s || ''),
          countVietnameseWords: (s) =>
            String(s || '')
              .trim()
              .split(/\s+/)
              .filter(Boolean).length,
          countParagraphs: (s) =>
            String(s || '')
              .split(/\r?\n+/)
              .filter((l) => l.trim().length > 0).length,
          formatTimestampVN: () => new Date().toLocaleString('vi-VN'),
          showToast: (msg) => console.log('[Toast]', msg),
          showBlockingLoader: () => {},
          updateBlockingLoader: () => {},
          hideBlockingLoader: () => {}
        }
      );
    }

    /**
     * Khởi tạo toàn bộ giao diện, lắng nghe sự kiện đồng bộ thời gian thực giữa các ô
     * nhập câu lệnh để KHÔNG BAO GIỜ xảy ra lỗi mất câu lệnh hay báo trống câu lệnh giả.
     */
    init() {
      const promptBox = document.getElementById('s18-fullscreen-prompt-textarea');
      const charCounter = document.getElementById('prompt-char-counter');
      const tempSlider = document.getElementById('slider-ai-temperature');
      const tempLabel = document.getElementById('label-temp-val');
      const targetWordInput = document.getElementById('input-target-word-count');
      const modeSelect = document.getElementById('select-ai-execution-mode');
      const confirmModelSelect = document.getElementById('confirm-modal-model-select');
      const synthTextarea = document.getElementById('textarea-synthesized-master-prompt');

      // 1. Khôi phục câu lệnh đã lưu từ localStorage / lịch sử lệnh / chương hiện tại
      const savedPrompt =
        localStorage.getItem('noir_v36_last_command_prompt') ||
        this.commandHistory.getLatestSavedCommand() ||
        '';
      if (promptBox && !promptBox.value && savedPrompt) {
        promptBox.value = savedPrompt;
      }

      this.updatePromptCounterUI(promptBox?.value || '');

      // 2. Đồng bộ 2 chiều theo thời gian thực khi tác giả gõ vào #s18-fullscreen-prompt-textarea
      if (promptBox && !promptBox.dataset.noirMod16Bound) {
        promptBox.dataset.noirMod16Bound = '1';
        const syncHandler = () => {
          const val = promptBox.value;
          try {
            localStorage.setItem('noir_v36_last_command_prompt', val);
          } catch (_) {}

          const legacyBeats = document.getElementById('textarea-chapter-beats');
          if (legacyBeats && legacyBeats.value !== val) {
            legacyBeats.value = val;
          }

          const active = this.chapterMgr?.getActiveChapter?.();
          if (active) {
            active.beats = val;
          }

          this.updatePromptCounterUI(val);
        };

        promptBox.addEventListener('input', syncHandler);
        promptBox.addEventListener('change', syncHandler);
        promptBox.addEventListener('paste', () => setTimeout(syncHandler, 20));
      }

      // 3. Đồng bộ ngược nếu tác giả nhập vào #textarea-chapter-beats hoặc #mode5-prompt-input
      const legacyBeats = document.getElementById('textarea-chapter-beats');
      if (legacyBeats && !legacyBeats.dataset.noirMod16Bound) {
        legacyBeats.dataset.noirMod16Bound = '1';
        legacyBeats.addEventListener('input', () => {
          const val = legacyBeats.value;
          if (promptBox && promptBox.value !== val) {
            promptBox.value = val;
          }
          try {
            localStorage.setItem('noir_v36_last_command_prompt', val);
          } catch (_) {}
          this.updatePromptCounterUI(val);
        });
      }

      const mode5Input = document.getElementById('mode5-prompt-input');
      if (mode5Input && !mode5Input.dataset.noirMod16Bound) {
        mode5Input.dataset.noirMod16Bound = '1';
        mode5Input.addEventListener('input', () => {
          const val = mode5Input.value;
          if (val && val.trim() && promptBox && !promptBox.value.trim()) {
            promptBox.value = val;
            try {
              localStorage.setItem('noir_v36_last_command_prompt', val);
            } catch (_) {}
          }
        });
      }

      this.bindEnterToRunPromptWithConfirm();

      // 4. Khôi phục & đồng bộ thanh trượt Nhiệt độ sáng tạo (Temperature)
      if (tempSlider && tempLabel && !tempSlider.dataset.noirMod16Bound) {
        tempSlider.dataset.noirMod16Bound = '1';
        const savedTemp = localStorage.getItem(this.constants.STORAGE_KEYS.TEMPERATURE);
        if (savedTemp) {
          tempSlider.value = savedTemp;
          tempLabel.textContent = savedTemp;
        }
        tempSlider.addEventListener('input', () => {
          tempLabel.textContent = tempSlider.value;
          try {
            localStorage.setItem(this.constants.STORAGE_KEYS.TEMPERATURE, tempSlider.value);
          } catch (_) {}
        });
      }

      // 5. Khôi phục & đồng bộ Số từ mục tiêu (Target Word Count)
      if (targetWordInput && !targetWordInput.dataset.noirMod16Bound) {
        targetWordInput.dataset.noirMod16Bound = '1';
        const savedTargetWords = localStorage.getItem(this.constants.STORAGE_KEYS.TARGET_WORDS);
        if (savedTargetWords && Number(savedTargetWords) >= 300) {
          targetWordInput.value = savedTargetWords;
        }
        targetWordInput.addEventListener('change', () => {
          const cleanWords = Math.max(300, Math.min(25000, Number(targetWordInput.value) || 3500));
          targetWordInput.value = String(cleanWords);
          try {
            localStorage.setItem(this.constants.STORAGE_KEYS.TARGET_WORDS, String(cleanWords));
          } catch (_) {}
        });
      }

      // 6. Khôi phục & đồng bộ Chế độ Thực thi AI (Mode 1 -> Mode 5)
      if (modeSelect && !modeSelect.dataset.noirMod16Bound) {
        modeSelect.dataset.noirMod16Bound = '1';
        const savedMode = localStorage.getItem(this.constants.STORAGE_KEYS.EXECUTION_MODE);
        if (savedMode && EXECUTION_MODE_SPECIFICATIONS[savedMode]) {
          modeSelect.value = savedMode;
        }
        modeSelect.addEventListener('change', () => {
          const chosenMode = modeSelect.value || 'MODE_1_DRAFT';
          try {
            localStorage.setItem(this.constants.STORAGE_KEYS.EXECUTION_MODE, chosenMode);
          } catch (_) {}
          this.onExecutionModeChanged(chosenMode);
        });
      }

      // 7. Lắng nghe thay đổi trên ô chọn mô hình ở Cửa sổ xác nhận Bước 2 (#confirm-modal-model-select)
      if (confirmModelSelect && !confirmModelSelect.dataset.noirMod16Bound) {
        confirmModelSelect.dataset.noirMod16Bound = '1';
        confirmModelSelect.addEventListener('change', () => {
          const chosenModel = confirmModelSelect.value;
          this.geminiRouter?.setSelectedModel?.(chosenModel);
          this.updateStep2ModelAdvisoryUI(chosenModel);
        });
      }

      // 8. Lắng nghe khi tác giả chỉnh sửa trực tiếp #textarea-synthesized-master-prompt ở Bước 2
      if (synthTextarea && !synthTextarea.dataset.noirMod16Bound) {
        synthTextarea.dataset.noirMod16Bound = '1';
        synthTextarea.addEventListener('input', () => {
          this.lastSynthesizedPrompt = synthTextarea.value;
          const synthStats = document.getElementById('synthesized-prompt-stats');
          if (synthStats) {
            const w = this.utils.countVietnameseWords(synthTextarea.value);
            const estTokens = this.inspector.estimateTokensFromVietnameseWords(w);
            synthStats.textContent = `${w.toLocaleString('vi-VN')} từ đã liên kết (~${estTokens.toLocaleString(
              'vi-VN'
            )} tokens)`;
          }
        });
      }

      // 9. Gắn thanh công cụ Mẫu câu lệnh nhanh & Lịch sử lệnh ngay dưới ô nhập câu lệnh (nếu chưa gắn)
      this.injectQuickCommandPresetsBarIfNeeded();

      // 10. Gắn nút chuyển nhanh Chế độ 2 & đồng bộ UX cho chế độ hiện tại
      this.bindMode2GuidanceAndSwitchLinks();
      this.refreshCommandModeUX(modeSelect?.value || 'MODE_1_DRAFT');
    }

    /**
     * Lấy nội dung diễn biến cốt truyện đã phát triển tại Chế độ 2 (Tab 3 hoặc bộ nhớ cục bộ)
     */
    getMode2DevelopedOutlineText() {
      const mem = String(
        window.NoirStudio?.tab3Controller?.modeOutputs?.MODE_2_BRAINSTORM || ''
      ).trim();
      if (mem) return mem;
      try {
        return String(localStorage.getItem('noir_v36_mode2_latest_plot_outline') || '').trim();
      } catch (_) {
        return '';
      }
    }

    hasDevelopedMode2Plot() {
      return this.getMode2DevelopedOutlineText().length >= 25;
    }

    bindMode2GuidanceAndSwitchLinks() {
      const bindOnce = (id, fn) => {
        const el = document.getElementById(id);
        if (!el || el.dataset.noirMod16Mode2Bound) return;
        el.dataset.noirMod16Mode2Bound = '1';
        el.addEventListener('click', fn);
      };

      bindOnce('btn-jump-mode2-inline', () => this.switchToMode2AndFocus());
      bindOnce('btn-modal-jump-mode2-link', () => this.switchToMode2AndFocus());
      bindOnce('btn-modal-go-mode2-now', () => this.switchToMode2AndFocus());
      bindOnce('btn-close-mode1-missing-mode2-check', () => {
        document.getElementById('modal-mode1-missing-mode2-check')?.classList.add('hidden');
      });
      bindOnce('btn-modal-proceed-mode1-anyway', async () => {
        document.getElementById('modal-mode1-missing-mode2-check')?.classList.add('hidden');
        await this.runStep1MasterSynthesis(true);
      });
    }

    switchToMode2AndFocus() {
      document.getElementById('modal-mode1-missing-mode2-check')?.classList.add('hidden');
      document.getElementById('modal-confirm-synthesized-prompt')?.classList.add('hidden');
      document.getElementById('modal-fullscreen-ai-command')?.classList.remove('hidden');

      const modeSelect = document.getElementById('select-ai-execution-mode');
      if (modeSelect) {
        modeSelect.value = 'MODE_2_BRAINSTORM';
        try {
          localStorage.setItem(this.constants.STORAGE_KEYS.EXECUTION_MODE, 'MODE_2_BRAINSTORM');
        } catch (_) {}
      }
      this.onExecutionModeChanged('MODE_2_BRAINSTORM');

      const promptBox = document.getElementById('s18-fullscreen-prompt-textarea');
      if (promptBox) {
        promptBox.focus();
      }
      this.utils?.showToast?.(
        '🧭 Đã chuyển sang Chế độ 2! Hãy liệt kê vài gạch đầu dòng dàn ý thô rồi bảo AI chi tiết hóa nhé.',
        'info',
        4200
      );
    }

    refreshCommandModeUX(explicitModeKey = null) {
      const modeKey =
        explicitModeKey ||
        document.getElementById('select-ai-execution-mode')?.value ||
        'MODE_1_DRAFT';
      const promptBox = document.getElementById('s18-fullscreen-prompt-textarea');
      if (promptBox && MODE_PROMPT_PLACEHOLDERS[modeKey]) {
        promptBox.placeholder = MODE_PROMPT_PLACEHOLDERS[modeKey];
      }

      const mode2Advisory = document.getElementById('cmd-mode2-outline-advisory');
      if (mode2Advisory) {
        if (modeKey === 'MODE_2_BRAINSTORM') {
          mode2Advisory.classList.remove('hidden');
        } else {
          mode2Advisory.classList.add('hidden');
        }
      }

      const hasMode2 = this.hasDevelopedMode2Plot();
      const mode2Pill = document.getElementById('cmd-mode2-plot-pill');
      if (mode2Pill) {
        if (hasMode2) {
          mode2Pill.classList.remove('hidden');
        } else {
          mode2Pill.classList.add('hidden');
        }
      }

      const missingBanner = document.getElementById('cmd-mode1-missing-mode2-banner');
      if (missingBanner) {
        if (modeKey === 'MODE_1_DRAFT' && !hasMode2) {
          missingBanner.classList.remove('hidden');
        } else {
          missingBanner.classList.add('hidden');
        }
      }
    }

    /**
     * Cập nhật bộ đếm ký tự & số từ tại Cửa sổ điều khiển AI toàn màn hình
     */
    updatePromptCounterUI(rawText) {
      const charCounter = document.getElementById('prompt-char-counter');
      if (!charCounter) return;
      const text = String(rawText || '');
      const chars = text.length;
      const words = this.utils.countVietnameseWords(text);
      charCounter.textContent = `${words.toLocaleString('vi-VN')} từ • ${chars.toLocaleString(
        'vi-VN'
      )} ký tự`;
    }

    /**
     * Khi tác giả đổi Chế độ Thực thi AI (Mode 1 -> 5), tự động gợi ý thông số
     * nhiệt độ, cập nhật placeholder + ghi chú Chế độ 2 và đồng bộ với bộ chọn ở Tab 3.
     */
    onExecutionModeChanged(modeKey) {
      const spec = EXECUTION_MODE_SPECIFICATIONS[modeKey];
      if (!spec) return;

      this.refreshCommandModeUX(modeKey);

      const tab3Select = document.getElementById('s20-quad-tab-selector');
      if (tab3Select && tab3Select.value !== modeKey) {
        tab3Select.value = modeKey;
      }
    }

    /**
     * Hiển thị thông tin tư vấn chuyên sâu về Mô hình AI ngay trong Cửa sổ xác nhận Bước 2
     * để nhắc tác giả ưu tiên Gemini 3.8 Flash / Gemini 3.1 Pro / Gemini 4 Argon thay vì Flash-Lite.
     */
    updateStep2ModelAdvisoryUI(modelId) {
      const resolvedId =
        modelId ||
        document.getElementById('confirm-modal-model-select')?.value ||
        this.geminiRouter?.selectedModelId ||
        'gemini-3.8-flash';

      this.geminiRouter?.updateLiteWarningBanner?.(resolvedId);

      const entry = this.geminiRouter?.getModelEntry?.(resolvedId) || {
        id: resolvedId,
        isLite: resolvedId.includes('lite')
      };
      const warnBox = document.getElementById('confirm-model-lite-warning');
      if (warnBox) {
        if (entry.isLite) {
          warnBox.classList.remove('hidden');
        } else {
          warnBox.classList.add('hidden');
        }
      }

      // Cập nhật hộp thông tin chất lượng mô hình nếu có trên giao diện
      let advisoryPill = document.getElementById('mod16-step2-model-advisory-pill');
      const confirmSelect = document.getElementById('confirm-modal-model-select');
      if (!advisoryPill && confirmSelect && confirmSelect.parentElement) {
        advisoryPill = document.createElement('div');
        advisoryPill.id = 'mod16-step2-model-advisory-pill';
        advisoryPill.className =
          'mt-2 p-2.5 rounded-xl border text-[11px] leading-relaxed transition-all';
        confirmSelect.parentElement.appendChild(advisoryPill);
      }

      if (advisoryPill) {
        const guide =
          MODEL_TIER_ADVISORY_GUIDE[resolvedId] ||
          MODEL_TIER_ADVISORY_GUIDE['gemini-3.8-flash'];
        if (entry.isLite) {
          advisoryPill.className =
            'mt-2 p-2.5 rounded-xl border border-amber-500/50 bg-amber-950/40 text-amber-200 text-[11px] leading-relaxed';
        } else {
          advisoryPill.className =
            'mt-2 p-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/30 text-emerald-200 text-[11px] leading-relaxed';
        }
        advisoryPill.innerHTML = `
          <div class="flex flex-wrap items-center justify-between gap-1 font-extrabold mb-1">
            <span>${this.utils.escapeHtml(guide.badge)}</span>
            <span class="font-monoCode text-[10px] opacity-90">${this.utils.escapeHtml(
              guide.speedRating
            )}</span>
          </div>
          <div class="text-zinc-300">${this.utils.escapeHtml(guide.recommendationNote)}</div>
        `;
      }
    }

    /**
     * Tích hợp thanh chọn nhanh Mẫu Câu Lệnh Văn Học (Literary Command Presets)
     * và nút Khôi Phục Câu Lệnh Gần Nhất ngay trong #modal-fullscreen-ai-command
     */
    injectQuickCommandPresetsBarIfNeeded() {
      const promptBox = document.getElementById('s18-fullscreen-prompt-textarea');
      if (!promptBox || !promptBox.parentElement) return;
      if (document.getElementById('mod16-literary-presets-toolbar')) return;

      const toolbar = document.createElement('div');
      toolbar.id = 'mod16-literary-presets-toolbar';
      toolbar.className =
        'mt-2.5 pt-2.5 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]';

      const presetOptionsHtml = LITERARY_COMMAND_PRESETS.map(
        (p) =>
          `<option value="${this.utils.escapeHtml(p.id)}">${this.utils.escapeHtml(
            p.label
          )}</option>`
      ).join('');

      toolbar.innerHTML = `
        <div class="flex flex-wrap items-center gap-1.5 flex-1 min-w-[240px]">
          <span class="font-bold text-zinc-400 shrink-0">✨ Mẫu lệnh văn học:</span>
          <select id="mod16-select-command-preset" class="bg-zinc-950 border border-zinc-700/80 rounded-lg px-2.5 py-1 text-[11px] text-zinc-200 font-semibold focus:border-emerald-500 focus:outline-none max-w-full sm:max-w-[330px]">
            <option value="">-- Chọn mẫu chỉ thị sáng tác chuyên sâu --</option>
            ${presetOptionsHtml}
          </select>
          <button id="mod16-btn-insert-preset" type="button" class="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold transition">
            ➕ Chèn vào ô lệnh
          </button>
        </div>
        <div class="flex items-center gap-1.5">
          <button id="mod16-btn-restore-last-cmd" type="button" title="Khôi phục câu lệnh vừa dùng gần nhất" class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold transition">
            ↺ Khôi phục lệnh gần nhất
          </button>
        </div>
      `;

      promptBox.parentElement.appendChild(toolbar);

      const selectEl = document.getElementById('mod16-select-command-preset');
      const btnInsert = document.getElementById('mod16-btn-insert-preset');
      const btnRestore = document.getElementById('mod16-btn-restore-last-cmd');

      if (btnInsert && selectEl) {
        btnInsert.addEventListener('click', () => {
          const presetId = selectEl.value;
          if (!presetId) {
            this.utils.showToast(
              '💡 Hãy chọn 1 mẫu chỉ thị sáng tác trong danh sách trước khi chèn!',
              'info'
            );
            return;
          }
          this.applyCommandPreset(presetId, true);
        });
      }

      if (btnRestore) {
        btnRestore.addEventListener('click', () => {
          this.restorePreviousCommandIntoTextarea();
        });
      }
    }

    /**
     * Chèn mẫu câu lệnh văn học vào ô nhập câu lệnh hiện tại và đồng bộ ngay lập tức
     */
    applyCommandPreset(presetId, appendMode = true) {
      const preset = LITERARY_COMMAND_PRESETS.find((p) => p.id === presetId);
      if (!preset) return;

      const promptBox = document.getElementById('s18-fullscreen-prompt-textarea');
      if (!promptBox) return;

      const currentVal = promptBox.value.trim();
      const nextVal =
        appendMode && currentVal
          ? `${currentVal}\n\n${preset.templateText}`
          : preset.templateText;

      promptBox.value = nextVal;
      promptBox.dispatchEvent(new Event('input', { bubbles: true }));
      this.utils.showToast(`✨ Đã chèn mẫu lệnh: "${preset.label}"`, 'success', 2400);
    }

    /**
     * Khôi phục câu lệnh gần nhất trong lịch sử vào ô #s18-fullscreen-prompt-textarea
     */
    restorePreviousCommandIntoTextarea() {
      const latest = this.commandHistory.getLatestSavedCommand();
      if (!latest) {
        this.utils.showToast('ℹ️ Chưa có lịch sử câu lệnh trước đó để khôi phục.', 'info');
        return;
      }
      const promptBox = document.getElementById('s18-fullscreen-prompt-textarea');
      if (promptBox) {
        promptBox.value = latest;
        promptBox.dispatchEvent(new Event('input', { bubbles: true }));
        this.utils.showToast('↺ Đã khôi phục câu lệnh gần nhất vào ô soạn thảo!', 'success', 2200);
      }
    }

    /**
     * Lấy câu lệnh của tác giả từ mọi nguồn có thể để TUYỆT ĐỐI KHÔNG BAO GIỜ
     * báo lỗi giả "Vui lòng nhập câu lệnh" khi tác giả đã nhập rồi!
     */
    getResolvedUserCommand() {
      // Nguồn 1: Ô nhập câu lệnh chính trong Cửa sổ điều khiển AI (#s18-fullscreen-prompt-textarea)
      const primaryEl = document.getElementById('s18-fullscreen-prompt-textarea');
      const primary = primaryEl?.value || '';
      if (primary.trim()) {
        return primary.trim();
      }

      // Nguồn 2: Ô nhập câu lệnh tại Chế độ 5 Vẽ biểu đồ (#mode5-prompt-input)
      const mode5Box = document.getElementById('mode5-prompt-input')?.value || '';
      if (mode5Box.trim()) {
        if (primaryEl && !primaryEl.value) primaryEl.value = mode5Box.trim();
        return mode5Box.trim();
      }

      // Nguồn 3: Ô nhập dàn ý / beats chương (#textarea-chapter-beats)
      const legacyBeats = document.getElementById('textarea-chapter-beats')?.value || '';
      if (legacyBeats.trim()) {
        if (primaryEl && !primaryEl.value) primaryEl.value = legacyBeats.trim();
        return legacyBeats.trim();
      }

      // Nguồn 4: Bộ nhớ cục bộ tức thời (noir_v36_last_command_prompt)
      const savedLocal = localStorage.getItem('noir_v36_last_command_prompt') || '';
      if (savedLocal.trim()) {
        if (primaryEl && !primaryEl.value) primaryEl.value = savedLocal.trim();
        return savedLocal.trim();
      }

      // Nguồn 5: Beats lưu trong đối tượng chương đang mở (activeChap.beats)
      const activeChap = this.chapterMgr?.getActiveChapter?.();
      if (activeChap && activeChap.beats && String(activeChap.beats).trim()) {
        const chapBeats = String(activeChap.beats).trim();
        if (primaryEl && !primaryEl.value) primaryEl.value = chapBeats;
        return chapBeats;
      }

      // Nguồn 6: Lịch sử câu lệnh gần nhất
      const fromHistory = this.commandHistory.getLatestSavedCommand();
      if (fromHistory) {
        if (primaryEl && !primaryEl.value) primaryEl.value = fromHistory;
        return fromHistory;
      }

      return '';
    }

    /**
     * Xây dựng gói Prompt Tổng Hợp Chính Thức (Master Synthesized Prompt) kết nối 100%:
     * 1. Khung Prompt Hệ Thống của chế độ đang chọn (Chế độ 1 -> 5)
     * 2. Thông số mục tiêu (Số từ, Ngôi kể POV, Nhiệt độ sáng tạo, Chuẩn hội thoại)
     * 3. Toàn bộ Story Bible + Nhân vật + Ma trận Ai Biết Gì + Phục bút + Từ cấm sáo rỗng
     * 4. Toàn bộ Mốc chuyển phân cảnh / Đổi góc nhìn POV
     * 5. Bảng Kiểm Định Tự Động Trước Chuyến Bay (Epistemic & Continuity Guardrails)
     * 6. Ký ức các chương đã duyệt + Đoạn nối tiếp bản thảo hiện tại + BM25 chống quên
     * 7. Câu lệnh cụ thể của tác giả
     */
    buildMasterSynthesizedPrompt() {
      const modeSelect = document.getElementById('select-ai-execution-mode');
      const modeKey = modeSelect?.value || 'MODE_1_DRAFT';
      const modeSpec =
        EXECUTION_MODE_SPECIFICATIONS[modeKey] || EXECUTION_MODE_SPECIFICATIONS.MODE_1_DRAFT;

      const targetWords =
        Number(document.getElementById('input-target-word-count')?.value) ||
        modeSpec.defaultTargetWords ||
        3500;
      const pov =
        document.getElementById('select-scene-pov')?.value ||
        'Ngôi thứ 3 giới hạn (Theo sát nhân vật chính)';
      const temp = document.getElementById('slider-ai-temperature')?.value || '0.85';

      const sysInstruction =
        this.sysPrompts?.getPromptForMode?.(modeKey) || modeSpec.primaryGoal;
      const bibleBlock =
        this.storyBible?.buildCompiledBibleBlockForPrompt?.() ||
        '(Chưa có dữ liệu Story Bible)';
      const sceneMarkersBlock =
        this.sceneBuilder?.buildCompiledSceneMarkersBlockForPrompt?.() ||
        '(Chưa đặt mốc chuyển phân cảnh riêng)';

      const activeChap =
        this.chapterMgr?.syncEditorToActiveChapter?.() ||
        this.chapterMgr?.getActiveChapter?.() || {
          id: 'chap_default',
          displayTitle: 'Chương 1',
          title: 'Chương 1',
          content: ''
        };

      const userCommand = this.getResolvedUserCommand();

      // Truy xuất ký ức chống quên BM25 từ câu lệnh, tên chương và các mốc phân cảnh
      const sceneKeywords = Array.isArray(this.sceneBuilder?.markers)
        ? this.sceneBuilder.markers
            .map((m) => `${m.pov || ''} ${m.location || ''} ${m.goal || ''}`)
            .join(' ')
        : '';
      const ragQuery = `${userCommand} ${activeChap?.displayTitle || ''} ${sceneKeywords}`.trim();
      const ragHits = this.rag?.search ? this.rag.search(ragQuery, 5) : [];
      const ragBlock =
        Array.isArray(ragHits) && ragHits.length > 0
          ? ragHits
              .map(
                (h, i) =>
                  `  • [Ký ức liên quan #${i + 1} từ ${h.chapterTitle}]:\n    "${h.text}"`
              )
              .join('\n')
          : '  (Không có đoạn ký ức BM25 đặc biệt nào cần trích xuất thêm)';

      // Bug 3: Không chèn đoạn [TÓM TẮT CÁC CHƯƠNG ĐÃ DUYỆT TRƯỚC ĐÓ] dư thừa vào Prompt Tổng —
      // toàn bộ Story Bible chính thức (#textarea-rendered-bible-content + Nhân vật + Ma trận) đã được chép thẳng vào `bibleBlock`!
      const approvedSummaries = '';

      // Phân tích đoạn cuối bản thảo hiện tại để nối mạch mượt mà
      const currentText = String(activeChap?.content || '').trim();
      const continuationInfo = this.inspector.buildSeamlessContinuationDirective(currentText);
      const tailContext = continuationInfo.tailExcerpt;

      // Xây dựng bảng kiểm định nhận thức nhân vật & phục bút tự động (Pre-Flight Guardrails)
      const guardrailsBlock = this.inspector.buildEpistemicAndContinuityGuardrails(
        this.storyBible,
        this.sceneBuilder,
        activeChap,
        userCommand
      );

      // Nếu tác giả chưa nhập câu lệnh riêng, tự động tổng hợp chỉ thị thông minh từ Mốc phân cảnh & Story Bible
      const resolvedCommandText =
        userCommand ||
        `Hãy triển khai tiếp diễn biến của "${
          activeChap?.displayTitle || 'Chương hiện tại'
        }" dựa theo các Mốc chuyển phân cảnh, Hồ sơ Story Bible và mạch văn bên trên một cách tự nhiên, sâu sắc và lôi cuốn nhất.`;

      // Khi chạy Chế độ 1 (Viết bản thảo), lồng ghép khéo léo diễn biến cốt truyện đã phát triển tại Chế độ 2 (nếu có)
      const mode2OutlineText =
        modeKey === 'MODE_1_DRAFT' ? this.getMode2DevelopedOutlineText().slice(0, 12000) : '';
      const mode2WeaveSection = mode2OutlineText
        ? [
            ``,
            `====================================================================`,
            `🧭 DIỄN BIẾN & DÀN Ý CỐT TRUYỆN ĐÃ PHÁT TRIỂN Ở CHẾ ĐỘ 2 (LỒNG GHÉP SÂU)`,
            `====================================================================`,
            `Hãy lồng ghép khéo léo và triển khai chậm rãi, giàu chiều sâu tâm lý theo diễn biến cốt truyện từ Chế độ 2 dưới đây kết hợp hài hòa với Story Bible, Mốc chuyển phân cảnh và Câu lệnh bên dưới (tuyệt đối không tua nhanh sự kiện):`,
            mode2OutlineText
          ].join('\n')
        : '';

      const techSpecLines = [
        `- Chương đang thực hiện : ${activeChap?.displayTitle || 'Chương 1'}`,
        `- Chế độ thực thi       : ${modeSpec.title} (${modeKey})`,
        `- Mục tiêu cốt lõi      : ${modeSpec.primaryGoal}`,
        `- Độ dài mục tiêu       : Khoảng ${targetWords.toLocaleString('vi-VN')} từ (Triển khai kỹ lưỡng, giàu chi tiết)`,
        `- Điểm nhìn (POV)       : ${pov}`,
        `- Độ bay bổng (Temp)    : ${temp}`,
        `- Định dạng hội thoại   : Bắt buộc dùng "- Câu thoại (Tên nhân vật)"`,
        `- Hướng dẫn cấu trúc    :`,
        ...modeSpec.outputStructureGuide.map((line) => `  ${line}`)
      ].join('\n');

      // Lưu bảng phân tích dung lượng ngữ cảnh để hiển thị trong Cửa sổ Kiểm tra Ngữ cảnh
      this.lastContextBreakdown = this.inspector.analyzeContextLayers({
        sysInstruction,
        techSpecBlock: techSpecLines,
        bibleBlock,
        sceneMarkersBlock,
        approvedSummariesBlock: mode2OutlineText || approvedSummaries,
        ragBlock,
        tailContextBlock: tailContext,
        userCommandBlock: resolvedCommandText
      });

      return [
        `####################################################################`,
        `🌟 PROMPT TỔNG HỢP CHÍNH THỨC (MASTER SYNTHESIZED NOVEL PROMPT)`,
        `####################################################################`,
        ``,
        `=== [PHẦN 1: VAI TRÒ & CHỈ THỊ HỆ THỐNG (${modeKey})] ===`,
        sysInstruction,
        ``,
        `=== [PHẦN 2: THÔNG SỐ KỸ THUẬT & TIÊU CHUẨN ĐẦU RA] ===`,
        techSpecLines,
        ``,
        bibleBlock,
        ``,
        sceneMarkersBlock,
        mode2WeaveSection,
        ``,
        `====================================================================`,
        `🛡️ KIỂM ĐỊNH LOGIC, NHẬN THỨC NHÂN VẬT & PHỤC BÚT TRƯỚC KHI VIẾT`,
        `====================================================================`,
        guardrailsBlock || '• Tuân thủ đầy đủ hồ sơ nhân vật và bối cảnh trong Story Bible.',
        ``,
        `====================================================================`,
        `🔗 NGỮ CẢNH KÝ ỨC CỤC BỘ (BM25 RAG) & ĐOẠN NỐI MẠCH CHƯƠNG HIỆN TẠI`,
        `====================================================================`,
        `[CHI TIẾT KÝ ỨC CỤC BỘ TRÍCH XUẤT THEO NGỮ CẢNH (BM25 RAG)]:`,
        ragBlock,
        ``,
        `[ĐOẠN VĂN CUỐI TRONG BẢN THẢO HIỆN TẠI ĐỂ NỐI MẠCH]:`,
        tailContext,
        `-> Chỉ dẫn nối mạch: ${continuationInfo.continuationHint}`,
        ``,
        `====================================================================`,
        `✍️ YÊU CẦU / CÂU LỆNH SÁNG TÁC CỤ THỂ CỦA TÁC GIẢ CHO CHƯƠNG NÀY`,
        `====================================================================`,
        resolvedCommandText,
        ``,
        `====================================================================`,
        `🚀 CHỈ THỊ BẮT ĐẦU: Hãy thực thi ngay yêu cầu trên với chất lượng văn học cao nhất, tuân thủ 100% Story Bible, Mốc chuyển phân cảnh và Ma trận Ai Biết Gì!`
      ].join('\n');
    }

    /**
     * Mở Cửa sổ Xem Trước Gói Ngữ Cảnh (#modal-context-preview) để tác giả
     * kiểm tra toàn bộ gói dữ liệu trước hoặc trong lúc soạn lệnh.
     */
    openContextPackagePreviewModal() {
      const previewText = this.buildMasterSynthesizedPrompt();
      const previewEl = document.getElementById('pre-context-package-preview');
      if (previewEl) {
        if (this.lastContextBreakdown) {
          const headerSummary = [
            `📊 THỐNG KÊ GÓI NGỮ CẢNH ĐÃ KẾT NỐI:`,
            `• Tổng số từ ngữ cảnh : ${this.lastContextBreakdown.totalWords.toLocaleString('vi-VN')} từ (~${this.lastContextBreakdown.estimatedInputTokens.toLocaleString('vi-VN')} tokens)`,
            ...this.lastContextBreakdown.layers.map(
              (l) => `  - ${l.label}: ${l.words.toLocaleString('vi-VN')} từ [${l.status}]`
            ),
            `--------------------------------------------------------------------`,
            ``
          ].join('\n');
          previewEl.textContent = headerSummary + previewText;
        } else {
          previewEl.textContent = previewText;
        }
      }
      document.getElementById('modal-context-preview')?.classList.remove('hidden');
    }

    /**
     * Nhấn Enter trong ô gõ Prompt Tab 3 để chạy ngay:
     * - Shift+Enter để xuống dòng như bình thường.
     * - Tôn trọng bộ gõ Tiếng Việt IME (isComposing / keyCode 229).
     * - Hiện pop-up xác nhận Có/Không + checkbox "Không nhắc lại hộp thoại này nữa".
     */
    bindEnterToRunPromptWithConfirm() {
      const SKIP_KEY = 'noir_skip_enter_prompt_confirm_v1';
      const modal = document.getElementById('modal-confirm-enter-run-prompt');
      const chkSkipModal = document.getElementById('chk-skip-enter-prompt-confirm');
      const chkAskFooter = document.getElementById('chk-command-ask-before-enter');
      const btnConfirm = document.getElementById('btn-confirm-enter-run-prompt');
      const btnCancel = document.getElementById('btn-cancel-enter-run-prompt');

      const isSkipEnabled = () => {
        try {
          return localStorage.getItem(SKIP_KEY) === '1';
        } catch (_) {
          return false;
        }
      };

      const setSkipEnabled = (skip) => {
        try {
          localStorage.setItem(SKIP_KEY, skip ? '1' : '0');
        } catch (_) {}
        if (chkAskFooter) chkAskFooter.checked = !skip;
        if (chkSkipModal) chkSkipModal.checked = Boolean(skip);
      };

      if (chkAskFooter && !chkAskFooter.dataset.noirEnterSyncBound) {
        chkAskFooter.dataset.noirEnterSyncBound = '1';
        chkAskFooter.checked = !isSkipEnabled();
        chkAskFooter.addEventListener('change', () => {
          setSkipEnabled(!chkAskFooter.checked);
        });
      }

      let pendingAction = null;
      let pendingSourceEl = null;

      const closeConfirmModal = () => {
        modal?.classList.add('hidden');
        const el = pendingSourceEl;
        pendingAction = null;
        pendingSourceEl = null;
        el?.focus?.();
      };

      const executeConfirmedAction = () => {
        if (chkSkipModal?.checked) {
          setSkipEnabled(true);
        }
        const action = pendingAction;
        modal?.classList.add('hidden');
        pendingAction = null;
        pendingSourceEl = null;
        if (typeof action === 'function') action();
      };

      if (modal && !modal.dataset.noirEnterConfirmBound) {
        modal.dataset.noirEnterConfirmBound = '1';
        btnConfirm?.addEventListener('click', executeConfirmedAction);
        btnCancel?.addEventListener('click', closeConfirmModal);
        modal.addEventListener('click', (ev) => {
          if (ev.target === modal) closeConfirmModal();
        });
        document.addEventListener('keydown', (ev) => {
          if (ev.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeConfirmModal();
          }
        });
      }

      const attachEnterHandler = (textareaEl, onRun) => {
        if (!textareaEl || textareaEl.dataset.noirEnterRunBound === '1') return;
        textareaEl.dataset.noirEnterRunBound = '1';
        textareaEl.addEventListener('keydown', (ev) => {
          if (ev.isComposing || ev.keyCode === 229) return;
          if (ev.key !== 'Enter' || ev.shiftKey || ev.ctrlKey || ev.altKey || ev.metaKey) return;

          ev.preventDefault();
          if (isSkipEnabled() || !modal) {
            onRun();
            return;
          }
          if (chkSkipModal) chkSkipModal.checked = false;
          pendingAction = onRun;
          pendingSourceEl = textareaEl;
          modal.classList.remove('hidden');
          btnConfirm?.focus?.();
        });
      };

      const primaryPromptEl = document.getElementById('s18-fullscreen-prompt-textarea');
      attachEnterHandler(primaryPromptEl, () => this.runStep1MasterSynthesis());

      const mode5PromptEl = document.getElementById('mode5-prompt-input');
      attachEnterHandler(mode5PromptEl, () => {
        const m5 = window.NoirStudio?.mode5Studio || window.NoirStudio?.mode5Manager;
        if (m5 && typeof m5.generateDiagramAndTimeline === 'function') {
          m5.generateDiagramAndTimeline();
        } else {
          this.runStep1MasterSynthesis();
        }
      });
    }

    /**
     * BƯỚC 1: Khi tác giả bấm "🚀 Chạy Prompt Tổng Hợp" (#btn-run-master-prompt-synthesis)
     * tại Cửa sổ điều khiển AI (#modal-fullscreen-ai-command):
     * -> Lưu & đồng bộ câu lệnh + Story Bible + Mốc chuyển phân cảnh
     * -> Hiển thị màn hình chờ (#global-ai-blocking-loader)
     * -> Tổng hợp đầy đủ Prompt Tổng Hợp Chính Thức vào #textarea-synthesized-master-prompt
     * -> Mở Cửa sổ Xác nhận Prompt Tổng Hợp & Chọn lại Mô hình lần 2 (#modal-confirm-synthesized-prompt)
     */
    async runStep1MasterSynthesis(bypassMode2Check = false) {
      if (this.isSynthesizing) return;
      this.isSynthesizing = true;

      try {
        const promptBox = document.getElementById('s18-fullscreen-prompt-textarea');
        const resolvedCmd = this.getResolvedUserCommand();
        const currentModeKey =
          document.getElementById('select-ai-execution-mode')?.value || 'MODE_1_DRAFT';

        // Kiểm tra trước khi duyệt Prompt Chế độ 1: nếu Chế độ 2 chưa có diễn biến cốt truyện -> gợi ý chuyển qua Chế độ 2
        if (
          currentModeKey === 'MODE_1_DRAFT' &&
          !bypassMode2Check &&
          !this.hasDevelopedMode2Plot()
        ) {
          this.bindMode2GuidanceAndSwitchLinks();
          this.refreshCommandModeUX('MODE_1_DRAFT');
          const checkModal = document.getElementById('modal-mode1-missing-mode2-check');
          if (checkModal) {
            checkModal.classList.remove('hidden');
            return;
          }
        }

        if (promptBox && resolvedCmd && !promptBox.value.trim()) {
          promptBox.value = resolvedCmd;
        }

        if (resolvedCmd) {
          try {
            localStorage.setItem('noir_v36_last_command_prompt', resolvedCmd);
          } catch (_) {}
          const activeChap = this.chapterMgr?.getActiveChapter?.();
          const modeKey =
            document.getElementById('select-ai-execution-mode')?.value || 'MODE_1_DRAFT';
          const modelId =
            document.getElementById('select-gemini-model')?.value ||
            this.geminiRouter?.selectedModelId ||
            'gemini-3.8-flash';
          const targetWords =
            Number(document.getElementById('input-target-word-count')?.value) || 3500;

          this.commandHistory.recordCommandSnapshot({
            commandText: resolvedCmd,
            modeKey,
            chapterId: activeChap?.id || null,
            chapterTitle: activeChap?.displayTitle || activeChap?.title || '',
            modelId,
            targetWords
          });
        }

        // Đồng bộ Story Bible và các mốc chuyển cảnh mới nhất trước khi tổng hợp
        if (this.storyBible && typeof this.storyBible.saveAllBibleData === 'function') {
          await this.storyBible.saveAllBibleData(false);
        }

        this.utils.showBlockingLoader(
          '⏳ Đang Tổng Hợp Prompt Tổng Chính Thức (Bước 1/2)...',
          'Đang liên kết 100% Story Bible, Hồ sơ nhân vật, Ma trận Ai Biết Gì, Mốc chuyển phân cảnh, Ký ức BM25 và Câu lệnh của bạn. Vui lòng kiên nhẫn chờ, KHÔNG tắt trang web hay thoát khỏi màn hình này để chạy Prompt ổn định...'
        );

        await new Promise((r) => setTimeout(r, 120));

        const synthesized = this.buildMasterSynthesizedPrompt();
        this.lastSynthesizedPrompt = synthesized;

        const synthTextarea = document.getElementById('textarea-synthesized-master-prompt');
        const synthStats = document.getElementById('synthesized-prompt-stats');
        if (synthTextarea) {
          synthTextarea.value = synthesized;
        }
        if (synthStats) {
          const w = this.utils.countVietnameseWords(synthesized);
          const estTokens = this.inspector.estimateTokensFromVietnameseWords(w);
          synthStats.textContent = `${w.toLocaleString('vi-VN')} từ đã liên kết (~${estTokens.toLocaleString(
            'vi-VN'
          )} tokens)`;
        }

        // Đồng bộ mô hình, mức độ tư duy & hạn mức sang cửa sổ xác nhận lần 2 và hiển thị khuyến cáo Flash/Pro vs Flash-Lite
        const currentModel =
          document.getElementById('select-gemini-model')?.value ||
          this.geminiRouter?.selectedModelId ||
          'gemini-3.8-flash';
        const currentThinking =
          document.getElementById('select-ai-thinking-level')?.value ||
          this.geminiRouter?.getThinkingLevel?.() ||
          'MEDIUM';
        this.geminiRouter?.setSelectedModel?.(currentModel);
        this.geminiRouter?.setThinkingLevel?.(currentThinking);
        this.geminiRouter?.quotaTracker?.renderRealtimeQuotaWidget?.();
        this.updateStep2ModelAdvisoryUI(currentModel);

        this.utils.hideBlockingLoader();
        document.getElementById('modal-fullscreen-ai-command')?.classList.add('hidden');
        document.getElementById('modal-confirm-synthesized-prompt')?.classList.remove('hidden');

        this.utils.showToast(
          '✅ Đã tổng hợp xong Prompt Tổng! Hãy kiểm tra lại mô hình (Khuyên dùng từ Gemini Flash trở lên) rồi bấm chạy chính thức.',
          'success',
          4000
        );
      } catch (err) {
        this.utils.hideBlockingLoader();
        this.utils.showToast(
          `❌ Có lỗi khi tổng hợp Prompt Tổng: ${err.message || err}`,
          'error',
          4500
        );
      } finally {
        this.isSynthesizing = false;
      }
    }

    /**
     * BƯỚC 2: Khi tác giả đã kiểm tra/chỉnh sửa Prompt Tổng Hợp, chọn lại Mô hình ở
     * cửa sổ xác nhận (#confirm-modal-model-select) và bấm
     * "✍️ Bắt Đầu Chạy Prompt Chính Thức Để Viết Tiểu Thuyết" (#btn-execute-official-novel-prompt)
     */
    async executeStep2OfficialNovelPrompt() {
      if (this.isExecutingOfficialPrompt) {
        this.utils.showToast('⏳ Lệnh AI đang chạy rồi, vui lòng đợi phản hồi xong nhé...', 'info', 2200);
        return;
      }

      const synthTextarea = document.getElementById('textarea-synthesized-master-prompt');
      const finalMasterPrompt = (
        synthTextarea?.value ||
        this.lastSynthesizedPrompt ||
        this.buildMasterSynthesizedPrompt() ||
        ''
      ).trim();

      if (!finalMasterPrompt) {
        this.utils.showToast('⚠️ Prompt Tổng Hợp đang trống!', 'warning');
        return;
      }

      const runBtn = document.getElementById('btn-execute-official-novel-prompt');
      const origRunBtnHtml = runBtn ? runBtn.innerHTML : '';

      const chosenModelId =
        document.getElementById('confirm-modal-model-select')?.value ||
        this.geminiRouter?.selectedModelId ||
        'gemini-3.8-flash';
      this.geminiRouter?.setSelectedModel?.(chosenModelId);

      const modeKey =
        document.getElementById('select-ai-execution-mode')?.value || 'MODE_1_DRAFT';
      const temperature =
        Number(document.getElementById('slider-ai-temperature')?.value) || 0.85;

      // Nếu người dùng chọn Chế độ 5 (Vẽ biểu đồ), chuyển sang bộ xử lý Chế độ 5 tại Tab 3
      if (modeKey === 'MODE_5_DIAGRAM') {
        document.getElementById('modal-confirm-synthesized-prompt')?.classList.add('hidden');
        window.NoirStudio?.tab3Controller?.switchMode?.('MODE_5_DIAGRAM');
        window.NoirStudio?.navigator?.navigateToScreen?.('SCREEN_3_AI');
        await window.NoirStudio?.mode5Studio?.generateDiagramAndTimeline?.(
          this.getResolvedUserCommand(),
          chosenModelId
        );
        return;
      }

      this.isExecutingOfficialPrompt = true;
      if (runBtn) {
        runBtn.disabled = true;
        runBtn.innerHTML = '⏳ Đang gửi Prompt lên Gemini AI...';
      }

      const startTime = Date.now();
      const activeChap = this.chapterMgr?.getActiveChapter?.();
      const modelEntry = this.geminiRouter?.getModelEntry?.(chosenModelId) || {
        id: chosenModelId,
        label: chosenModelId
      };

      this.utils.showBlockingLoader(
        `✍️ Đang Chạy Prompt Chính Thức Trên ${modelEntry.id} (Bước 2/2)...`,
        'AI đang sáng tác dựa trên toàn bộ Story Bible, Mốc chuyển phân cảnh và Câu lệnh của bạn. Vui lòng kiên nhẫn chờ, KHÔNG tắt trang web hay thoát khỏi màn hình này để Prompt chạy ổn định...'
      );

      let safetyFailsafeTimer = null;
      try {
        const chosenThinkingLevel =
          document.getElementById('confirm-modal-thinking-select')?.value ||
          document.getElementById('select-ai-thinking-level')?.value ||
          this.geminiRouter?.getThinkingLevel?.() ||
          'MEDIUM';
        const enableWebSearch = Boolean(
          document.getElementById('checkbox-ai-web-search')?.checked ||
          this.geminiRouter?.isWebSearchEnabled?.()
        );

        const timeoutPromise = new Promise((_, reject) => {
          safetyFailsafeTimer = setTimeout(() => {
            reject(new Error('Quá thời gian chờ phản hồi từ Gemini (120 giây). Hãy bấm thử lại hoặc copy câu lệnh sang Gemini Web.'));
          }, 120000);
        });

        const result = await Promise.race([
          this.geminiRouter.generateTextWithFallback({
            prompt: finalMasterPrompt,
            systemInstruction: this.sysPrompts?.getPromptForMode?.(modeKey) || '',
            modelId: chosenModelId,
            temperature,
            maxOutputTokens: 8192,
            thinkingLevel: chosenThinkingLevel,
            enableWebSearch
          }),
          timeoutPromise
        ]);

        // Hậu xử lý & chuẩn hóa định dạng câu thoại tiểu thuyết tiếng Việt
        const antiClicheList = this.storyBible?.antiClicheList || [];
        const processed = this.postProcessor.processAndInspectOutput(
          result.text,
          modeKey,
          antiClicheList
        );
        const finalOutputText = processed.text || result.text;

        const durationMs = Date.now() - startTime;
        const promptWords = this.utils.countVietnameseWords(finalMasterPrompt);
        const outWords = processed.stats.wordCount;

        this.telemetry.recordExecution({
          modeKey,
          modelId: chosenModelId,
          usedEndpoint: result.usedEndpoint || chosenModelId,
          chapterTitle: activeChap?.displayTitle || activeChap?.title || 'Chương hiện tại',
          promptWords,
          outputWords: outWords,
          durationMs,
          status: 'SUCCESS'
        });

        this.utils.hideBlockingLoader();
        document.getElementById('modal-confirm-synthesized-prompt')?.classList.add('hidden');

        // Đưa đầu ra mới nhất thẳng vào Cửa sổ Đầu ra ở Tab 3, bật thông báo gây chú ý & mở ngay Tab 3
        window.NoirStudio?.tab3Controller?.setOutputForMode?.(modeKey, finalOutputText, {
          notifyNew: true,
          usedEndpoint: result.usedEndpoint || chosenModelId,
          wordCount: outWords
        });
        window.NoirStudio?.tab3Controller?.switchMode?.(modeKey);
        window.NoirStudio?.navigator?.navigateToScreen?.('SCREEN_3_AI');

        this.utils.showToast(
          `🎉 Đã xong (${outWords.toLocaleString(
            'vi-VN'
          )} từ)! Kết quả mới nhất đã hiển thị ở Tab 3 — hoặc chọn lại từ Lịch sử đầu ra góc dưới.`,
          'success',
          5600
        );
      } catch (err) {
        const durationMs = Date.now() - startTime;
        this.telemetry.recordExecution({
          modeKey,
          modelId: chosenModelId,
          usedEndpoint: chosenModelId,
          chapterTitle: activeChap?.displayTitle || activeChap?.title || 'Chương hiện tại',
          promptWords: this.utils.countVietnameseWords(finalMasterPrompt),
          outputWords: 0,
          durationMs,
          status: 'ERROR',
          errorMessage: err.message || String(err)
        });

        this.utils.hideBlockingLoader();
        this.utils.showToast(`❌ Lỗi khi chạy AI: ${err.message}`, 'error', 5200);

        // Bug 13: Khi mô hình Pro / Argon 4 hoặc key gặp lỗi/hết hạn mức -> hiện bảng hướng dẫn Copy câu lệnh dán thẳng vào Gemini Web
        if (typeof this.geminiRouter?.showGeminiWebFallbackNoticeModal === 'function') {
          this.geminiRouter.showGeminiWebFallbackNoticeModal({
            promptText: finalMasterPrompt,
            modelId: chosenModelId,
            errorMessage: err.message || String(err),
            onFallbackFlashRetry: () => {
              const sel = document.getElementById('confirm-modal-model-select');
              if (sel) sel.value = 'gemini-3.8-flash';
              this.geminiRouter?.setSelectedModel?.('gemini-3.8-flash');
              this.executeStep2OfficialNovelPrompt();
            }
          });
        }
      } finally {
        clearTimeout(safetyFailsafeTimer);
        this.isExecutingOfficialPrompt = false;
        if (runBtn) {
          runBtn.disabled = false;
          runBtn.innerHTML = origRunBtnHtml || '✍️ Bắt Đầu Chạy Prompt Chính Thức Để Viết Tiểu Thuyết';
        }
      }
    }

    /**
     * Tích hợp thanh công cụ kiểm soát chuyên sâu cho Cửa sổ Xác nhận Bước 2
     * (#modal-confirm-synthesized-prompt): Sao chép nhanh Prompt Tổng, Tải xuống
     * file .TXT dự phòng, Làm mới lại từ Story Bible, và Chẩn đoán chất lượng Prompt.
     */
    injectStep2SurgicalControlsIfNeeded() {
      const synthTextarea = document.getElementById('textarea-synthesized-master-prompt');
      if (!synthTextarea || !synthTextarea.parentElement) return;
      if (document.getElementById('mod16-step2-surgical-toolbar')) return;

      const bar = document.createElement('div');
      bar.id = 'mod16-step2-surgical-toolbar';
      bar.className =
        'mt-2 pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]';

      bar.innerHTML = `
        <div class="flex flex-wrap items-center gap-1.5">
          <button id="mod16-btn-copy-synth-prompt" type="button" class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold transition">
            📋 Sao chép Prompt Tổng
          </button>
          <button id="mod16-btn-export-synth-txt" type="button" class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold transition">
            💾 Tải file .TXT
          </button>
          <button id="mod16-btn-rebuild-fresh-synth" type="button" class="px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 font-bold transition">
            🔄 Tổng hợp lại từ đầu
          </button>
        </div>
        <div class="flex items-center gap-1.5">
          <button id="mod16-btn-run-prompt-diagnostics" type="button" class="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold transition">
            🩺 Kiểm định độ phủ ngữ cảnh
          </button>
        </div>
      `;

      synthTextarea.parentElement.appendChild(bar);

      document
        .getElementById('mod16-btn-copy-synth-prompt')
        ?.addEventListener('click', () => this.copySynthesizedPromptToClipboard());
      document
        .getElementById('mod16-btn-export-synth-txt')
        ?.addEventListener('click', () => this.exportSynthesizedPromptToFile());
      document
        .getElementById('mod16-btn-rebuild-fresh-synth')
        ?.addEventListener('click', () => this.resetSynthesizedPromptToFreshBuild());
      document
        .getElementById('mod16-btn-run-prompt-diagnostics')
        ?.addEventListener('click', () => this.runDeepPromptDiagnostics());
    }

    /**
     * Sao chép toàn bộ Prompt Tổng Hợp Chính Thức vào khay nhớ tạm
     */
    async copySynthesizedPromptToClipboard() {
      const synthTextarea = document.getElementById('textarea-synthesized-master-prompt');
      const text = (synthTextarea?.value || this.lastSynthesizedPrompt || '').trim();
      if (!text) {
        this.utils.showToast('⚠️ Chưa có nội dung Prompt Tổng Hợp để sao chép.', 'warning');
        return;
      }
      try {
        await navigator.clipboard.writeText(text);
        this.utils.showToast(
          '📋 Đã sao chép toàn bộ Prompt Tổng Hợp Chính Thức vào khay nhớ tạm!',
          'success'
        );
      } catch (_) {
        this.utils.showToast('📋 Đã sao chép Prompt Tổng Hợp!', 'success');
      }
    }

    /**
     * Xuất gói Prompt Tổng Hợp Chính Thức thành tệp văn bản (.TXT) để lưu trữ độc lập
     */
    exportSynthesizedPromptToFile() {
      const synthTextarea = document.getElementById('textarea-synthesized-master-prompt');
      const text = (
        synthTextarea?.value ||
        this.lastSynthesizedPrompt ||
        this.buildMasterSynthesizedPrompt()
      ).trim();
      if (!text) {
        this.utils.showToast('⚠️ Prompt Tổng Hợp đang trống!', 'warning');
        return;
      }
      const activeChap = this.chapterMgr?.getActiveChapter?.();
      const safeTitle = String(activeChap?.displayTitle || 'Chuong_Hien_Tai')
        .replace(/[\\/:*?"<>|]+/g, '_')
        .replace(/\s+/g, '_');
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Prompt_Tong_Hop_${safeTitle}_${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      this.utils.showToast('💾 Đã tải xuống tệp Prompt Tổng Hợp (.TXT)!', 'success');
    }

    /**
     * Tổng hợp lại Prompt Tổng Hợp từ dữ liệu Story Bible & Mốc phân cảnh mới nhất
     */
    resetSynthesizedPromptToFreshBuild() {
      const fresh = this.buildMasterSynthesizedPrompt();
      this.lastSynthesizedPrompt = fresh;
      const synthTextarea = document.getElementById('textarea-synthesized-master-prompt');
      const synthStats = document.getElementById('synthesized-prompt-stats');
      if (synthTextarea) {
        synthTextarea.value = fresh;
      }
      if (synthStats) {
        const w = this.utils.countVietnameseWords(fresh);
        const estTokens = this.inspector.estimateTokensFromVietnameseWords(w);
        synthStats.textContent = `${w.toLocaleString('vi-VN')} từ đã liên kết (~${estTokens.toLocaleString(
          'vi-VN'
        )} tokens)`;
      }
      this.utils.showToast(
        '🔄 Đã làm mới lại Prompt Tổng Hợp từ Story Bible và Mốc phân cảnh hiện tại!',
        'info'
      );
    }

    /**
     * Chạy kiểm định độ phủ ngữ cảnh 8 tầng của Prompt Tổng Hợp
     * (Kiểm tra xem đã có đủ Story Bible, Nhân vật, Ma trận Ai Biết Gì, Chuẩn thoại chưa)
     */
    runDeepPromptDiagnostics() {
      const synthTextarea = document.getElementById('textarea-synthesized-master-prompt');
      const currentPrompt = (
        synthTextarea?.value ||
        this.lastSynthesizedPrompt ||
        this.buildMasterSynthesizedPrompt()
      ).trim();

      const checks = [
        {
          name: 'Vai trò & Chỉ thị Hệ thống',
          passed: currentPrompt.includes('PHẦN 1: VAI TRÒ & CHỈ THỊ HỆ THNG') ||
                  currentPrompt.includes('PHẦN 1: VAI TRÒ & CHỈ THỊ HỆ THỐNG')
        },
        {
          name: 'Quy chuẩn hội thoại "- Câu thoại (Tên nhân vật)"',
          passed: currentPrompt.includes('- Câu thoại (Tên nhân vật)')
        },
        {
          name: 'Hồ sơ Story Bible & Thế giới',
          passed: currentPrompt.includes('STORY BIBLE') || currentPrompt.length > 800
        },
        {
          name: 'Ma trận Ai Biết Gì (Giới hạn nhận thức nhân vật)',
          passed:
            currentPrompt.includes('AI BIẾT GÌ') ||
            currentPrompt.includes('GIỚI HẠN NHẬN THỨC') ||
            (this.storyBible?.knowledgeMatrix?.length || 0) === 0
        },
        {
          name: 'Mốc chuyển phân cảnh & Đổi góc nhìn (POV)',
          passed:
            currentPrompt.includes('MỐC CHUYỂN PHÂN CẢNH') ||
            currentPrompt.includes('Điểm nhìn (POV)')
        },
        {
          name: 'Yêu cầu / Câu lệnh cụ thể của tác giả',
          passed: currentPrompt.includes('YÊU CẦU / CÂU LỆNH SÁNG TÁC')
        }
      ];

      const passedCount = checks.filter((c) => c.passed).length;
      const totalWords = this.utils.countVietnameseWords(currentPrompt);
      const estTokens = this.inspector.estimateTokensFromVietnameseWords(totalWords);

      this.utils.showToast(
        `🩺 Kiểm định Prompt Tổng: Đạt ${passedCount}/${checks.length} tiêu chuẩn vàng (${totalWords.toLocaleString(
          'vi-VN'
        )} từ • ~${estTokens.toLocaleString('vi-VN')} tokens). Sẵn sàng chạy chính thức!`,
        passedCount === checks.length ? 'success' : 'info',
        4500
      );

      return {
        passedCount,
        totalChecks: checks.length,
        checks,
        totalWords,
        estTokens
      };
    }

    /**
     * Xây dựng bộ mẫu câu thoại chuẩn mực tiếng Việt theo từng cảm xúc nhân vật
     * để làm tư liệu tham chiếu khi cần thiết
     */
    buildDialogueExemplarsBlock() {
      return [
        `=== [MẪU QUY CHUẨN TRÌNH BÀY HỘI THOẠI TIỂU THUYẾT] ===`,
        `- Chúng ta không còn nhiều thời gian trước khi sương mù phủ kín bến cảng đâu. (Lâm Phong)`,
        `- Anh nghĩ chỉ cần xóa sạch dấu chân trên cầu tàu là che mắt được bọn họ sao? (Hạ Vy)`,
        `- Ít nhất thì đêm nay, người nắm giữ chiếc chìa khóa đồng vẫn là tôi. (Lâm Phong)`,
        `Lưu ý: Luôn đặt dấu gạch ngang "-" ở đầu dòng thoại và ghi tên nhân vật trong ngoặc đơn "(Tên nhân vật)" ở cuối câu thoại.`
      ].join('\n');
    }

    /**
     * Trả về danh sách các mẫu câu lệnh văn học dựng sẵn
     */
    getCommandPresets(category = 'ALL') {
      if (!category || category === 'ALL') {
        return [...LITERARY_COMMAND_PRESETS];
      }
      return LITERARY_COMMAND_PRESETS.filter((p) => p.category === category);
    }

    /**
     * Trả về thông số kỹ thuật của một chế độ thực thi (Mode 1 -> Mode 5)
     */
    getExecutionModeSpec(modeKey = 'MODE_1_DRAFT') {
      return (
        EXECUTION_MODE_SPECIFICATIONS[modeKey] ||
        EXECUTION_MODE_SPECIFICATIONS.MODE_1_DRAFT
      );
    }

    /**
     * Trả về báo cáo thống kê nhật ký thực thi AI
     */
    getExecutionTelemetrySummary() {
      return this.telemetry.getSummaryMetrics();
    }

    /**
     * Trả về bảng tư vấn chọn mô hình AI (Flash / Pro / Argon vs Flash-Lite)
     */
    getModelTierAdvisory(modelId) {
      return (
        MODEL_TIER_ADVISORY_GUIDE[modelId] ||
        MODEL_TIER_ADVISORY_GUIDE['gemini-3.8-flash']
      );
    }

    /**
     * Khởi chạy nhanh quy trình tổng hợp cho một đoạn văn được bôi đen trong trình soạn thảo
     * (Hỗ trợ mở rộng đoạn văn, viết sâu nội tâm hoặc trau chuốt câu thoại tại chỗ)
     */
    async synthesizeForSelectedExcerpt(selectedExcerpt, actionType = 'EXPAND_DEPTH') {
      const cleanExcerpt = String(selectedExcerpt || '').trim();
      if (!cleanExcerpt) {
        this.utils.showToast(
          '⚠️ Hãy bôi đen một đoạn văn hoặc câu thoại trong bản thảo trước!',
          'warning'
        );
        return;
      }

      const actionDirectives = {
        EXPAND_DEPTH:
          'Hãy mở rộng đoạn văn được chọn dưới đây với chiều sâu tâm lý, miêu tả đa giác quan (ánh sáng, âm thanh, xúc giác) và nhịp điệu giàu cảm xúc hơn, giữ nguyên mạch sự kiện:',
        POLISH_DIALOGUE:
          'Hãy nâng cấp các câu thoại và miêu tả vi biểu cảm trong đoạn văn dưới đây sao cho sắc sảo, giàu ẩn ý đấu trí và tuân thủ chuẩn "- Câu thoại (Tên nhân vật)":',
        REMOVE_CLICHE:
          'Hãy viết lại đoạn văn dưới đây để loại bỏ hoàn toàn các cách diễn đạt sáo rỗng, thay thế bằng hình ảnh ẩn dụ độc đáo và quan sát tinh tế:'
      };

      const header = actionDirectives[actionType] || actionDirectives.EXPAND_DEPTH;
      const composedCmd = `${header}\n\n"""\n${cleanExcerpt}\n"""`;

      const promptBox = document.getElementById('s18-fullscreen-prompt-textarea');
      if (promptBox) {
        promptBox.value = composedCmd;
        promptBox.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        try {
          localStorage.setItem('noir_v36_last_command_prompt', composedCmd);
        } catch (_) {}
      }

      await this.runStep1MasterSynthesis();
    }

    /**
     * Kiểm tra tính sẵn sàng của toàn bộ đường ống tổng hợp 2 bước
     * (Phục vụ thanh tra hệ thống và tự động hồi phục trạng thái)
     */
    verifyPipelineHealth() {
      const hasPromptTextarea = Boolean(
        document.getElementById('s18-fullscreen-prompt-textarea')
      );
      const hasConfirmModal = Boolean(
        document.getElementById('modal-confirm-synthesized-prompt')
      );
      const hasConfirmSynthBox = Boolean(
        document.getElementById('textarea-synthesized-master-prompt')
      );
      const hasConfirmModelSelect = Boolean(
        document.getElementById('confirm-modal-model-select')
      );
      const hasExecuteBtn = Boolean(
        document.getElementById('btn-execute-official-novel-prompt')
      );
      const hasBlockingLoader = Boolean(
        document.getElementById('global-ai-blocking-loader')
      );

      return {
        healthy:
          hasPromptTextarea &&
          hasConfirmModal &&
          hasConfirmSynthBox &&
          hasConfirmModelSelect &&
          hasExecuteBtn &&
          hasBlockingLoader,
        components: {
          hasPromptTextarea,
          hasConfirmModal,
          hasConfirmSynthBox,
          hasConfirmModelSelect,
          hasExecuteBtn,
          hasBlockingLoader
        },
        resolvedCommandLength: this.getResolvedUserCommand().length,
        historyEntriesCount: this.commandHistory.getHistoryList().length
      };
    }

    /**
     * Tự động gắn thêm thanh công cụ Bước 2 khi mở cửa sổ xác nhận
     */
    ensureStep2EnhancementsMounted() {
      this.injectStep2SurgicalControlsIfNeeded();
      const currentModel =
        document.getElementById('confirm-modal-model-select')?.value ||
        this.geminiRouter?.selectedModelId ||
        'gemini-3.8-flash';
      this.updateStep2ModelAdvisoryUI(currentModel);
    }

    /**
     * Tạo bản tóm tắt siêu gọn về trạng thái Prompt Tổng Hợp hiện tại
     * để hiển thị trên thanh trạng thái hoặc nhật ký hệ thống
     */
    getQuickStatusDigest() {
      const cmd = this.getResolvedUserCommand();
      const modeKey =
        document.getElementById('select-ai-execution-mode')?.value || 'MODE_1_DRAFT';
      const modelId =
        document.getElementById('confirm-modal-model-select')?.value ||
        document.getElementById('select-gemini-model')?.value ||
        this.geminiRouter?.selectedModelId ||
        'gemini-3.8-flash';
      return {
        modeKey,
        modelId,
        hasUserCommand: Boolean(cmd),
        userCommandWords: this.utils.countVietnameseWords(cmd),
        lastSynthesizedWords: this.utils.countVietnameseWords(this.lastSynthesizedPrompt),
        isSynthesizing: this.isSynthesizing,
        isExecutingOfficialPrompt: this.isExecutingOfficialPrompt
      };
    }
  }

  // ==========================================================================
  // PHẦN 7: KHỞI TẠO & XUẤT RA KHÔNG GIAN TÊN TOÀN CỤC (window.NoirStudio)
  // ==========================================================================
  window.NoirStudio.MasterPromptSynthesizerAndExecutionEngine =
    MasterPromptSynthesizerAndExecutionEngine;
  window.NoirStudio.ContextBudgetAndPreFlightInspector = ContextBudgetAndPreFlightInspector;
  window.NoirStudio.VietnameseLiteraryOutputPostProcessor =
    VietnameseLiteraryOutputPostProcessor;
  window.NoirStudio.CommandHistoryAndSnapshotManager = CommandHistoryAndSnapshotManager;
  window.NoirStudio.PromptExecutionTelemetryLogger = PromptExecutionTelemetryLogger;

  const promptSynthesizer = new MasterPromptSynthesizerAndExecutionEngine(
    window.NoirStudio.idb,
    window.NoirStudio.chapterManager,
    window.NoirStudio.storyBible,
    window.NoirStudio.sceneBuilder,
    window.NoirStudio.sysPrompts,
    window.NoirStudio.rag,
    window.NoirStudio.geminiRouter,
    window.NoirStudio.utils
  );
  window.NoirStudio.promptSynthesizer = promptSynthesizer;
})();
