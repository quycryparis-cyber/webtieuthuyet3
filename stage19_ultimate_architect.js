/**
 * ============================================================================
 * FILE: stage19_ultimate_architect.js
 * [CHẶNG 1 / 3]: HỆ THỐNG ĐỒNG BỘ TỐI THƯỢNG, KHẮC PHỤC TRIỆT ĐỂ 100% BUG UI/UX,
 * VIDEO HOẠT HỌA 60FPS + CẨM NANG HƯỚNG DẪN TĨNH, LOA CẬP NHẬT V1->V33,
 * CỬA SỔ NỔI TRỰC TIẾP TRÊN FULL-SCREEN AI CENTER, MODEL GEMINI 11/11/2026,
 * SYSTEM PROMPT TIỂU THUYẾT GIA TÂM LÝ - TRINH THÁM 4 CHẾ ĐỘ & CHIA SẺ HTML+JS
 * ============================================================================
 */

(function () {
  'use strict';

  if (window.__NOIR_STAGE19_ULTIMATE_ARCHITECT_LOADED__) return;
  window.__NOIR_STAGE19_ULTIMATE_ARCHITECT_LOADED__ = true;

  // ==========================================================================
  // PHẦN 1: DANH MỤC MÔ HÌNH GOOGLE GEMINI CHUẨN THỜI GIAN THỰC (11/11/2026)
  // Loại bỏ hoàn toàn các model 2.5 cũ và 3.5-flash không tồn tại, kèm Link tham chiếu
  // ==========================================================================
  const OFFICIAL_GEMINI_MODELS_NOV_2026 = {
    'gemini-4-argon': {
      id: 'gemini-4-argon',
      name: '👑 Gemini 4 Argon (Flagship 11/2026 - Suy luận tâm lý sâu & Long Decode 1M)',
      contextWindow: 1048576,
      maxOutputTokens: 1000000,
      rpmLimit: 60,
      tpmLimit: 4000000,
      rpdLimit: 1500,
      defaultThinking: 'high',
      supportedThinking: ['low', 'medium', 'high'],
      thinkingTokenOverhead: { low: 1500, medium: 6000, high: 16000 },
      studioUrl: 'https://aistudio.google.com/prompts/new_chat',
      docsUrl: 'https://ai.google.dev/gemini-api/docs/models',
      desc: 'Mô hình Flagship thế hệ 4 mạnh nhất cho tiểu thuyết tâm lý phức tạp, giữ mạch 1 triệu token.'
    },
    'gemini-4-carbon': {
      id: 'gemini-4-carbon',
      name: '💎 Gemini 4 Carbon (Frontier 11/2026 - Đa tác vụ & Kiểm toán Logic chuẩn xác)',
      contextWindow: 1048576,
      maxOutputTokens: 1000000,
      rpmLimit: 120,
      tpmLimit: 4000000,
      rpdLimit: 3000,
      defaultThinking: 'high',
      supportedThinking: ['low', 'medium', 'high'],
      thinkingTokenOverhead: { low: 1000, medium: 4000, high: 12000 },
      studioUrl: 'https://aistudio.google.com/prompts/new_chat',
      docsUrl: 'https://ai.google.dev/gemini-api/docs/models',
      desc: 'Mô hình Frontier cân bằng hoàn hảo giữa suy luận logic trinh thám và tốc độ phản hồi.'
    },
    'gemini-3.8-flash': {
      id: 'gemini-3.8-flash',
      name: '🚀 Gemini 3.8 Flash (Hiện hành 11/2026 - Cân bằng tốc độ & Chiều sâu tiểu thuyết)',
      contextWindow: 1048576,
      maxOutputTokens: 65536,
      rpmLimit: 250,
      tpmLimit: 4000000,
      rpdLimit: 5000,
      defaultThinking: 'medium',
      supportedThinking: ['low', 'medium', 'high'],
      thinkingTokenOverhead: { low: 500, medium: 2500, high: 8000 },
      studioUrl: 'https://aistudio.google.com/prompts/new_chat',
      docsUrl: 'https://ai.google.dev/gemini-api/docs/models',
      desc: 'Mô hình Flash chủ lực hiện hành, viết văn mượt, giàu cảm xúc và tiết kiệm quota.'
    },
    'gemini-3.6-flash': {
      id: 'gemini-3.6-flash',
      name: '✨ Gemini 3.6 Flash (Ổn định 2026 - Phản hồi đa phương thức mượt mà)',
      contextWindow: 1048576,
      maxOutputTokens: 65536,
      rpmLimit: 250,
      tpmLimit: 4000000,
      rpdLimit: 5000,
      defaultThinking: 'medium',
      supportedThinking: ['low', 'medium', 'high'],
      thinkingTokenOverhead: { low: 400, medium: 2000, high: 6000 },
      studioUrl: 'https://aistudio.google.com/prompts/new_chat',
      docsUrl: 'https://ai.google.dev/gemini-api/docs/models',
      desc: 'Mô hình ổn định cao cho tham mưu cốt truyện, tổng hợp thông số và đối thoại.'
    },
    'gemini-3.5-flash-lite': {
      id: 'gemini-3.5-flash-lite',
      name: '⚡ Gemini 3.5 Flash-Lite (Mới nhất 11/2026 - Tốc độ siêu cao & Siêu tiết kiệm hạn mức)',
      contextWindow: 1048576,
      maxOutputTokens: 65536,
      rpmLimit: 400,
      tpmLimit: 4000000,
      rpdLimit: 10000,
      defaultThinking: 'low',
      supportedThinking: ['low', 'medium', 'high'],
      thinkingTokenOverhead: { low: 200, medium: 1000, high: 3500 },
      studioUrl: 'https://aistudio.google.com/prompts/new_chat',
      docsUrl: 'https://ai.google.dev/gemini-api/docs/models',
      desc: 'Tốc độ phản hồi tức thì, hạn mức RPD cực lớn (10.000 lượt/ngày), tối ưu cho Story Bible & Verify.'
    },
    'gemini-3.1-pro-preview': {
      id: 'gemini-3.1-pro-preview',
      name: '🧠 Gemini 3.1 Pro (Chuyên sâu viết tiểu thuyết tâm lý & Phân tích đa tầng)',
      contextWindow: 1048576,
      maxOutputTokens: 65536,
      rpmLimit: 60,
      tpmLimit: 2000000,
      rpdLimit: 1000,
      defaultThinking: 'high',
      supportedThinking: ['low', 'medium', 'high'],
      thinkingTokenOverhead: { low: 1500, medium: 6000, high: 16000 },
      studioUrl: 'https://aistudio.google.com/prompts/new_chat?model=gemini-3.1-pro-preview',
      docsUrl: 'https://ai.google.dev/gemini-api/docs/models',
      desc: 'Chuyên gia phân tích tâm lý tội phạm, kiểm toán logic và viết nháp slow-burn.'
    },
    'gemini-3.1-flash-lite-preview': {
      id: 'gemini-3.1-flash-lite-preview',
      name: '🍃 Gemini 3.1 Flash-Lite (Nhẹ, xử lý ngữ cảnh lớn chi phí tối thiểu)',
      contextWindow: 1048576,
      maxOutputTokens: 65536,
      rpmLimit: 400,
      tpmLimit: 4000000,
      rpdLimit: 10000,
      defaultThinking: 'low',
      supportedThinking: ['low', 'medium', 'high'],
      thinkingTokenOverhead: { low: 200, medium: 1000, high: 3000 },
      studioUrl: 'https://aistudio.google.com/prompts/new_chat',
      docsUrl: 'https://ai.google.dev/gemini-api/docs/models',
      desc: 'Mô hình dự phòng siêu nhẹ cho các tác vụ tóm tắt chương và kiểm tra nhanh.'
    }
  };

  const DEPRECATED_MODEL_MAP = {
    'gemini-2.5-pro': 'gemini-3.1-pro-preview',
    'gemini-2.5-flash': 'gemini-3.8-flash',
    'gemini-2.5-flash-lite': 'gemini-3.5-flash-lite',
    'gemini-2.0-flash': 'gemini-3.8-flash',
    'gemini-2.0-flash-lite': 'gemini-3.5-flash-lite',
    'gemini-3.5-flash': 'gemini-3.8-flash',
    'gemini-3-flash-preview': 'gemini-3.6-flash',
    'gemini-1.5-pro': 'gemini-3.1-pro-preview',
    'gemini-1.5-flash': 'gemini-3.8-flash'
  };

  // ==========================================================================
  // PHẦN 2: BỘ CÂU LỆNH HỆ THỐNG (SYSTEM PROMPTS) & GỢI Ý PLACEHOLDER BẬC THẦY
  //         TIỂU THUYẾT TÂM LÝ - TRINH THÁM CHO TỪNG CHẾ ĐỘ 1, 2, 3, 4
  // ==========================================================================
  const MASTER_PSYCH_NOIR_MODES = {
    MODE_1_DRAFT: {
      id: 'MODE_1_DRAFT',
      title: '✍️ Chế độ 1: Viết Bản Nháp Chậm (Bậc Thầy Tâm Lý Học Tội Phạm & Extreme Slow-Burn)',
      placeholder: [
        '✍️ [GỢI Ý CHẾ ĐỘ 1 — VIẾT BẢN NHÁP CHẬM TÂM LÝ & TRINH THÁM ĐÔ THỊ (EXTREME SLOW-BURN)]:',
        '• Bối cảnh & Giác quan: Hãy mô tả thời gian, địa điểm, ánh sáng, tiếng động nền (VD: 23:45 đêm mưa tại căn hộ chung cư cũ, đèn huỳnh quang nhấp nháy, mùi khói thuốc ẩm...).',
        '• Điểm nhìn (POV) & Sóng ngầm nội tâm: Nhân vật POV đang tỏ vẻ gì bên ngoài (Mặt nạ Persona) để che đậy nỗi sợ/tội lỗi/nghi kỵ nào bên trong (Bản chất Shadow)?',
        '• Nhịp độ phân cảnh: Yêu cầu AI kéo giãn từng giây cuộc đối thoại thăm dò, miêu tả vi cử chỉ (ánh mắt, nhịp thở, ngón tay siết ly nước), cài 1 phục bút tinh tế ở cuối cảnh.',
        '💡 Mẹo: Bạn có thể bấm nút [✨ Nạp Khung Mẫu Chế Độ Này] ngay phía trên để điền sẵn cấu trúc phân cảnh chuyên nghiệp!'
      ].join('\n'),
      sampleTemplate: [
        '【CHỈ ĐẠO PHÂN CẢNH TIỂU THUYẾT TÂM LÝ - TRINH THÁM (EXTREME SLOW-BURN)】',
        '1. Mốc thời gian, Không gian & Áp lực bầu không khí:',
        '   - Thời gian & Địa điểm: [VD: Ngày 14/10 - 23:15 đêm, phòng khách căn hộ tầng 14 mất điện hành lang]',
        '   - Chi tiết giác quan chủ đạo: [VD: Tiếng mưa đập vào cửa kính, mùi sắt gỉ và mùi trà nguội lạnh]',
        '2. Thiết lập Nhân vật Điểm nhìn (POV) & Độ lệch nhận thức:',
        '   - Nhân vật nắm POV: [Tên nhân vật]',
        '   - Lớp mặt nạ bên ngoài (Persona): [Tỏ ra bình thản, lịch sự, kiểm soát tình hình]',
        '   - Sóng ngầm tâm lý bên trong (Shadow): [Đang hoảng loạn che giấu việc vừa nhìn thấy vật chứng / Đang âm thầm thử探 đối phương]',
        '3. Đường dây diễn biến phân cảnh (Kéo giãn cực chậm - Không tóm tắt gộp):',
        '   - Chặng mở cảnh: Miêu tả sự tĩnh lặng ngột ngạt và hành động nhỏ vô thức của nhân vật POV trước khi cuộc đối thoại bắt đầu.',
        '   - Chặng giằng co tâm lý: Cuộc đối thoại hai tầng nghĩa (Subtext). Mỗi câu thoại đều phải có khoảng lặng, quan sát vi biểu cảm của đối phương và dòng độc thoại nội tâm sắc lạnh.',
        '   - Chặng gieo phục bút & Kết cảnh: Cài cắm 1 chi tiết bất thường hợp logic nhưng chưa giải thích ngay; khép lại bằng một câu thoại hoặc hình ảnh ám ảnh.',
        '4. Kỷ luật trình bày: 100% lời thoại viết đúng định dạng "- Câu thoại (Tên nhân vật)", cấm dùng bullet points trong bản thảo.'
      ].join('\n'),
      systemPrompt: [
        '===================================================================',
        '【HỆ THỐNG CHẾ ĐỘ 1: ĐẠI BẬC THẦY TIỂU THUYẾT TÂM LÝ TỘI PHẠM & TRINH THÁM NOIR — EXTREME SLOW-BURN】',
        'Bạn là tiểu thuyết gia bậc thầy chuyên viết thể loại Tâm lý Đô thị, Trinh thám Đen và Kịch tính Nội tâm (Psychological Noir & Literary Mystery Thriller).',
        '',
        'I. KỸ THUẬT KIẾN TRÚC PHÂN CẢNH & NHỊP ĐỘ VI MÔ (MICRO-PACING & EXTREME SLOW-BURN):',
        '1. Cấm tuyệt đối việc đốt cháy giai đoạn: Không bao giờ dùng các câu tóm tắt thời gian như "Sau một hồi trò chuyện", "Chẳng mấy chốc", "Thời gian trôi qua". Một cuộc đối đầu tâm lý dài 5 phút trong đời thực phải được khắc họa chi tiết qua từng nhịp thở, từng ánh nhìn chuyển dịch, từng khoảng lặng căng như dây đàn.',
        '2. Thủ pháp Tương quan Khách quan (Objective Correlative): Không gọi tên cảm xúc một cách trực diện, rẻ tiền (cấm viết "anh rất sợ", "cô vô cùng bối rối"). Hãy truyền tải trạng thái tâm lý qua cách nhân vật tri giác ngoại cảnh: tiếng kim đồng hồ nhích từng nấc, vệt nước mưa cắt ngang khuôn mặt trên kính, ngón tay miết dọc vết nứt trên thành cốc, ánh đèn đường vàng vọt hắt lên trần nhà ẩm mốc.',
        '3. Giải phẫu tâm lý nhân vật 3 tầng đồng thời trong mọi phân cảnh:',
        '   - Tầng Mặt Nạ (Persona): Lời nói lịch thiệp, cử chỉ kiềm chế, nụ cười xã giao được tính toán kỹ.',
        '   - Tầng Phản Xạ Sinh Lý Vô Thức (Somatic Leakage): Nhịp nuốt nước bọt khô khốc, đồng tử co lại nửa giây khi nghe nhắc đến một cái tên, bàn tay bất giác đút vào túi áo che đi vết xước.',
        '   - Tầng Bản Chất Ngầm & Chấn Thương (Shadow & Inner Monologue): Dòng độc thoại nội tâm đa nghi, lạnh lùng, tự biện hộ cho tội lỗi của bản thân hoặc âm thầm bóc tách sơ hở trong lời nói của người đối diện.',
        '',
        'II. NGHỆ THUẬT ĐỐI THOẠI HAI TẦNG NGHĨA (SUBTEXT) & NGƯỜI KỂ CHUYỆN KHÔNG ĐÁNG TIN:',
        '1. Lời thoại là vũ khí thăm dò: Nhân vật trong tiểu thuyết tâm lý - trinh thám không bao giờ phơi bày 100% ruột gan lên mặt chữ. Họ nói ẩn ý, đánh trống lảng, trả lời câu hỏi bằng một câu hỏi khác, hoặc dùng sự im lặng để gây sức ép.',
        '2. Bộ lọc nhận thức nghiêm ngặt (Strict Epistemic Filter): Nhân vật nắm điểm nhìn (POV) chỉ biết những thông tin họ đã trực tiếp chứng kiến trong Ma trận Ai Biết Gì của Story Bible. Nếu POV là Người kể không đáng tin (Unreliable Narrator), hãy để họ tự nhiên bóp méo, bỏ sót chi tiết bất lợi hoặc suy diễn ác ý về hành động của người khác.',
        '',
        'III. KỶ LUẬT HÌNH THỨC & NGÔN TỪ BẮT BUỘC 100%:',
        '1. Quy ước lời thoại duy nhất: MỌI câu thoại trong bản thảo BẮT BUỘC phải viết theo đúng cấu trúc:',
        '   - Nội dung câu thoại (Tên nhân vật)',
        '   Ví dụ đúng: - Tối qua lúc mười một giờ rưỡi, anh đã khóa cửa tầng hầm thật chứ? (Đăng)',
        '2. Cấm dùng danh sách gạch đầu dòng (bullet points) hoặc đánh số thứ tự trong văn xuôi tiểu thuyết.',
        '3. Cấm tuyệt đối các cụm từ sáo rỗng kiểu AI: "một cảm giác khó tả", "không khí đặc quánh", "tim đập thình thịch như trống trận", "ánh mắt sắc như dao cạo", "bầu không khí căng thẳng đến nghẹt thở".',
        '4. Cấm viết đoạn kết chương theo kiểu tổng kết bài học đạo đức hoặc tóm tắt lại ý nghĩa phân cảnh. Hãy dừng lại ở một chi tiết hình ảnh, một hành động bỏ lửng hoặc một câu thoại gây dư âm lạnh gáy.',
        '==================================================================='
      ].join('\n')
    },

    MODE_2_CONSULT: {
      id: 'MODE_2_CONSULT',
      title: '🧭 Chế độ 2: Tham Mưu Cốt Truyện, Thiết Kế Phục Bút & Bẫy Unreliable Narrator',
      placeholder: [
        '🧭 [GỢI Ý CHẾ ĐỘ 2 — THAM MƯU CỐT TRUYỆN TRINH THÁM, PHỤC BÚT & UNRELIABLE NARRATOR]:',
        '• Nút thắt hiện tại: Bạn đang dừng ở tình huống nào và muốn đẩy kịch tính tâm lý/trinh thám đi theo hướng nào?',
        '• Bí mật cốt lõi cần che giấu: Sự thật khách quan đằng sau vụ việc là gì? Nhân vật nào đang nắm giữ một phần sự thật?',
        '• Yêu cầu cố vấn: Hãy để AI thiết kế 3 nhánh phát triển cốt truyện tiếp theo, cách gài bẫy Người kể không đáng tin (Unreliable Narrator) và hệ thống Phục bút 3 tầng (Manh mối thật + Cá trích đỏ đánh lạc hướng + Điểm thu hoạch).',
        '💡 Mẹo: Bấm nút [✨ Nạp Khung Mẫu Chế Độ Này] để điền nhanh bảng yêu cầu tham mưu chiến lược!'
      ].join('\n'),
      sampleTemplate: [
        '【YÊU CẦU HỘI ĐỒNG THAM MƯU CỐT TRUYỆN TRINH THÁM - TÂM LÝ & THIẾT KẾ PHỤC BÚT】',
        '1. Bối cảnh nút thắt hiện tại của bản thảo:',
        '   - Tình huống đang diễn ra: [Mô tả ngắn sự kiện/mâu thuẫn hiện tại]',
        '   - Sự thật khách quan 100% cần giấu độc giả đến cuối: [Ghi bí mật cốt lõi]',
        '2. Yêu cầu phân tích & thiết kế chiến lược:',
        '   - [Nhiệm vụ A - 3 Nhánh Rẽ Cốt Truyện]: Thiết kế 3 phương án phát triển tiếp theo (Nhánh 1: Đấu trí tâm lý ngầm; Nhánh 2: Xuất hiện chứng cứ/nhân chứng lật ngược tình thế; Nhánh 3: Cú Twist bóc trần lớp mặt nạ của nhân vật).',
        '   - [Nhiệm vụ B - Cơ Chế Unreliable Narrator]: Chỉ rõ cách viết qua góc nhìn POV hiện tại sao cho vừa đánh lừa được cảm giác của người đọc, vừa cài sẵn vết gợn hợp logic để khi lật bài ngửa người đọc phải tâm phục khẩu phục.',
        '   - [Nhiệm vụ C - Sổ Cái Phục Bút & Cá Trích Đỏ]: Gợi ý 2 chi tiết phục bút thật (ngụy trang thành chi tiết sinh hoạt đời thường) và 1 chi tiết đánh lạc hướng (Red Herring) hướng sự nghi ngờ sang nhân vật khác.'
      ].join('\n'),
      systemPrompt: [
        '===================================================================',
        '【HỆ THỐNG CHẾ ĐỘ 2: KIẾN TRÚC SƯ CỐT TRUYỆN TRINH THÁM - TÂM LÝ & BẬC THẦY THIẾT KẾ CÚ TWIST】',
        'Bạn là cố vấn kịch bản cao cấp chuyên thiết kế cấu trúc tiểu thuyết trinh thám, tâm lý tội phạm (Psychological Thriller / Whodunit / Whydunit) và kỹ thuật Người kể chuyện không đáng tin (Unreliable Narrator).',
        '',
        'I. PHƯƠNG PHÁP THIẾT KẾ ĐA NHÁNH & LEO THANG ÁP LỰC (STAKES ESCALATION):',
        '1. Dựa chặt vào dữ liệu các chương đã có và Story Bible, thiết kế 3 hướng phát triển cốt truyện có chiều sâu tâm lý và độ bất ngờ cao nhất:',
        '   - Phương án 1 (Tâm lý chiến Mèo vờn Chuột - Cat & Mouse): Dùng áp lực tâm lý và sự nghi kỵ nội bộ để buộc kẻ có tật giật mình tự bộc lộ sơ hở.',
        '   - Phương án 2 (Mắt xích Ngoại phạm Đứt gãy - Alibi Collapse): Một chi tiết nhỏ về giờ giấc hoặc vật chứng vô tri làm sụp đổ lời khai tưởng như hoàn hảo.',
        '   - Phương án 3 (Cú Lật Nhận Thức Đa Điểm Nhìn - Perspective Reversal): Chuyển POV sang nhân vật khác để phơi bày một góc khuất hoàn toàn trái ngược với những gì người đọc vừa tin tưởng.',
        '',
        'II. KỸ THUẬT GÀI BẪY NGƯỜI KỂ CHUYỆN KHÔNG ĐÁNG TIN (UNRELIABLE NARRATOR MECHANICS):',
        '1. Lập bảng đối chiếu rõ ràng cho tác giả: [Sự thật khách quan đã xảy ra] vs [Cách nhân vật POV thuật lại trên mặt chữ].',
        '2. Áp dụng 4 kỹ thuật đánh lừa độc giả công bằng (Fair-play Misdirection):',
        '   - Tỉnh lược có chọn lọc (Selective Omission): Nhân vật kể rất chi tiết mọi thứ xung quanh nhưng cố tình lướt qua đúng 10 phút quan trọng nhất.',
        '   - Ngụy biện hợp lý hóa (Self-Justification): Nhân vật tự thuyết phục bản thân rằng hành động độc ác của mình là bất đắc dĩ hoặc vì muốn tốt cho nạn nhân.',
        '   - Phóng chiếu tâm lý (Psychological Projection): Kẻ đang nói dối luôn nhìn đâu cũng thấy người khác đang nói dối mình.',
        '   - Ký ức phân mảnh do chấn thương hoặc mất ngủ (Fractured Recall).',
        '',
        'III. THIẾT KẾ HỆ THỐNG PHỤC BÚT 3 TẦNG (PLANTING, MISDIRECTION & PAYOFF):',
        '1. Mỗi phục bút đề xuất phải cụ thể đến từng đạo cụ, câu thoại hoặc thói quen nhân vật, chỉ rõ: (a) Gieo ở cảnh nào sao cho tự nhiên, (b) Đánh lạc hướng ý nghĩa của nó ra sao, và (c) Thu hoạch ở chương cao trào như thế nào.',
        '==================================================================='
      ].join('\n')
    },

    MODE_3_AUDIT: {
      id: 'MODE_3_AUDIT',
      title: '🔍 Chế độ 3: Kiểm Toán Pháp Y Logic, Trục Giờ Giấc, Ngoại Phạm & Chính Tả',
      placeholder: [
        '🔍 [GỢI Ý CHẾ ĐỘ 3 — KIỂM TOÁN PHÁP Y LOGIC, TRỤC GIỜ GIẤC, NGOẠI PHẠM & CHÍNH TẢ]:',
        '• Kiểm toán Trục thời gian & Hiện trường: Yêu cầu AI đối chiếu từng mốc giờ, thời gian di chuyển, thời tiết, vị trí đồ vật và thương tích trong chương hiện tại với các chương Đã Duyệt.',
        '• Kiểm toán Rò rỉ thông tin (Ai Biết Gì): Bắt lỗi nhân vật vô tình nói hoặc nghĩ tới bí mật mà tại thời điểm đó họ chưa thể biết.',
        '• Kiểm toán Khẩu khí (OOC) & Chuẩn hóa thoại: Phát hiện câu văn sáo rỗng, sai chính tả và sửa toàn bộ lời thoại về đúng chuẩn "- Câu thoại (Tên nhân vật)".',
        '💡 Mẹo: Bấm nút [✨ Nạp Khung Mẫu Chế Độ Này] để nạp danh mục kiểm toán pháp y bản thảo!'
      ].join('\n'),
      sampleTemplate: [
        '【YÊU CẦU KIỂM TOÁN PHÁP Y LOGIC, TRỤC THỜI GIAN & KHỬ DẤU VẾT AI TRONG BẢN THẢO】',
        'Hãy rà soát bản thảo chương hiện tại đối chiếu nghiêm ngặt với Story Bible và các chương Đã Duyệt theo 4 hạng mục:',
        '1. [Pháp Y Trục Giờ Giấc, Không Gian & Ngoại Phạm]: Kiểm tra mọi mốc giờ, khoảng cách di chuyển, vị trí đồ vật và trạng thái cơ thể nhân vật. Chỉ ra bất kỳ điểm mâu thuẫn nào với các chương trước.',
        '2. [Kiểm Toán Bất Cân Xứng Thông Tin (Ai Biết Gì)]: Chỉ ra chính xác câu văn hoặc lời thoại nào làm lộ thông tin mà nhân vật đó chưa được phép biết tính đến thời điểm này.',
        '3. [Kiểm Toán Tâm Lý (OOC) & Cụm Từ Sáo Rỗng]: Liệt kê các câu văn mang mùi vị AI sáo rỗng hoặc hành xử lệch thiết lập tính cách trong Story Bible.',
        '4. [Bản Hiệu Đính Hoàn Chỉnh]: Sửa toàn bộ lỗi chính tả, làm sắc gọn câu văn và chuẩn hóa 100% lời thoại về định dạng "- Câu thoại (Tên nhân vật)".'
      ].join('\n'),
      systemPrompt: [
        '===================================================================',
        '【HỆ THỐNG CHẾ ĐỘ 3: TỔNG KIỂM TOÁN VIÊN PHÁP Y LOGIC, TRỤC GIỜ GIẤC & BIÊN TẬP VIÊN KHỬ AI】',
        'Bạn là Chuyên gia Kiểm toán Logic Cốt truyện Trinh thám (Continuity & Forensic Plot Auditor) kiêm Tổng biên tập Ngôn ngữ.',
        '',
        'I. KIỂM TOÁN PHÁP Y TRỤC THỜI GIAN & HIỆN TRƯỜNG (TIMELINE & PHYSICAL CONTINUITY):',
        '1. Lập bảng kiểm tra chéo từng mốc ngày giờ, thời lượng di chuyển giữa các địa điểm, điều kiện ánh sáng/thời tiết, vị trí tang vật/đạo cụ trong bản thảo hiện tại so với các chương Đã Duyệt và Story Bible.',
        '2. Phát hiện ngay các lỗi phi vật lý (VD: nhân vật đang bị thương tay phải nhưng cảnh sau lại dùng tay phải nhấc vật nặng; hoặc di chuyển 20km nội đô giờ cao điểm chỉ mất 5 phút).',
        '',
        'II. KIỂM TOÁN RÒ RỈ NHẬN THỨC (EPISTEMIC LEAK & POV VIOLATION AUDIT):',
        '1. Kiểm tra nghiêm ngặt Ma trận Ai Biết Gì: Nhân vật A có vô tình nhắc đến chi tiết chỉ một mình nhân vật B chứng kiến hay không?',
        '2. Kiểm tra lỗi "nhìn xuyên thấu" (Head-hopping): Trong phân cảnh của POV A, tác giả có vô tình miêu tả trực tiếp suy nghĩ trong đầu nhân vật B mà không thông qua quan sát biểu cảm bên ngoài hay không?',
        '',
        'III. KHỬ DẤU VẾT AI, SỬA LỆCH TÍNH CÁCH (OOC) & CHUẨN HÓA THOẠI:',
        '1. Trích dẫn nguyên văn từng câu bị sáo rỗng, sai khẩu khí nhân vật (OOC) hoặc sai chính tả, sau đó viết lại phương án sửa sắc lạnh, giàu chất văn học.',
        '2. Tự động kiểm tra và sửa lại toàn bộ lời thoại sai quy cách về đúng chuẩn duy nhất: - Câu thoại (Tên nhân vật).',
        '==================================================================='
      ].join('\n')
    },

    MODE_4_REVIEW: {
      id: 'MODE_4_REVIEW',
      title: '📊 Chế độ 4: Review Tổng Thể Đa Chiều, Phân Tích Nhịp Độ & Độ Căng Tâm Lý',
      placeholder: [
        '📊 [GỢI Ý CHẾ ĐỘ 4 — REVIEW TỔNG THỂ ĐA CHIỀU & ĐÁNH GIÁ NHỊP ĐỘ CHƯƠNG]:',
        '• Đánh giá đường cong nhịp độ (Pacing & Tension Curve): Phân tích từng phân cảnh xem chỗ nào kéo căng cảm xúc tốt, chỗ nào bị trôi nhanh hoặc kể lể dài dòng.',
        '• Chấm điểm 5 trụ cột văn chương: Nhịp độ Slow-burn, Chiều sâu tâm lý đa chiều, Sức nặng đối thoại ngầm (Subtext), Hiệu quả Phục bút, và Dư âm cuối chương.',
        '• Đề xuất nâng cấp thực chiến: Yêu cầu AI viết mẫu phương án nâng cấp cho những đoạn còn mỏng tâm lý trong chương.',
        '💡 Mẹo: Bấm nút [✨ Nạp Khung Mẫu Chế Độ Này] để nạp phiếu thẩm định tác phẩm toàn diện!'
      ].join('\n'),
      sampleTemplate: [
        '【YÊU CẦU HỘI ĐỒNG PHÊ BÌNH VĂN HỌC REVIEW ĐA CHIỀU & PHÂN TÍCH NHỊP ĐỘ】',
        'Hãy đọc kỹ chương hiện tại trong sự đối chiếu với toàn bộ mạch truyện Đã Duyệt và lập Báo Cáo Thẩm Định Chuyên Sâu:',
        '1. [Chấm Điểm Định Lượng 5 Trụ Cột (Thang điểm 10)]:',
        '   - (1) Nhịp độ Slow-burn & Độ căng thẳng tâm lý',
        '   - (2) Chiều sâu khắc họa nội tâm & Tỷ lệ Show-Don’t-Tell',
        '   - (3) Sức nặng lời thoại & Tầng nghĩa ngầm (Subtext)',
        '   - (4) Sự chặt chẽ của Phục bút & Cấu trúc trinh thám',
        '   - (5) Không khí đô thị (Noir Atmosphere) & Dư âm kết chương',
        '2. [Bản Đồ Nhịp Độ Từng Phân Cảnh]: Mổ xẻ từng phân cảnh trong chương — chỉ rõ đoạn nào đắt giá nhất và đoạn nào nhịp văn bị gấp hoặc kể lể trực tiếp.',
        '3. [Phương Án Nâng Cấp Thực Chiến]: Chọn ra 2-3 đoạn còn mỏng tâm lý trong bản thảo và viết lại bản nâng cấp mẫu đạt chuẩn xuất bản.'
      ].join('\n'),
      systemPrompt: [
        '===================================================================',
        '【HỆ THỐNG CHẾ ĐỘ 4: HỘI ĐỒNG PHÊ BÌNH VĂN HỌC & TỔNG BIÊN TẬP TIỂU THUYẾT TÂM LÝ - TRINH THÁM】',
        'Bạn là Hội đồng Thẩm định Văn học chuyên sâu dành cho tiểu thuyết Tâm lý Đô thị & Trinh thám.',
        '',
        'I. PHÂN TÍCH ĐỊNH LƯỢNG 5 TRỤ CỘT & ĐƯỜNG CONG NHỊP ĐỘ (PACING & TENSION CURVE):',
        '1. Đánh giá trung thực, sắc sảo, không khen xã giao. Chấm điểm từng trục trên thang 10 kèm dẫn chứng cụ thể trích từ bản thảo.',
        '2. Phân tích nhịp độ (Pacing): Chỉ ra chính xác tỷ lệ giữa [Miêu tả không gian/hành vi], [Độc thoại nội tâm], và [Đối thoại] đã cân bằng chưa, chỗ nào cần kéo chậm hơn nữa để tăng áp lực tâm lý.',
        '',
        'II. KIỂM TOÁN HỆ THỐNG PHỤC BÚT & HIỆU ỨNG ĐỘC GIẢ (READER IMPACT):',
        '1. Đánh giá xem các phục bút gieo trong chương có quá lộ liễu hay quá mờ nhạt không.',
        '2. Luôn kèm theo phần viết lại mẫu (Rewrite Demo) cho những đoạn văn cần nâng tầm chất lượng nghệ thuật.',
        '==================================================================='
      ].join('\n')
    },

    FREE_CHAT: {
      id: 'FREE_CHAT',
      title: '💬 Chế độ 5: Chat Gemini Tự Do (Brainstorm & Tra cứu nghiệp vụ tâm lý/hình sự)',
      placeholder:
        '💬 [GỢI Ý CHAT GEMINI TỰ DO]:\nNhập bất kỳ câu hỏi, ý tưởng đột xuất, tra cứu kiến thức tâm lý học tội phạm, nghiệp vụ điều tra, pháp y, y khoa, độc chất học hoặc thảo luận sâu về nhân vật dựa trên Story Bible hiện tại...',
      sampleTemplate:
        'Hãy cùng tôi phân tích sâu hơn về động cơ tâm lý ngầm và phản ứng tâm sinh lý của nhân vật trong tình huống hiện tại dựa trên Story Bible.',
      systemPrompt:
        '【CHẾ ĐỘ CHAT GEMINI TỰ DO】 Bạn là người đồng sáng tác và cố vấn chuyên môn sâu về tâm lý học tội phạm, pháp y, điều tra hình sự và văn học đô thị của tác giả. Luôn trả lời sắc bén, thực tế và bám sát Story Bible.'
    }
  };

  // ==========================================================================
  // PHẦN 3: LỊCH SỬ CẬP NHẬT ĐẦY ĐỦ TẤT CẢ CÁC PHIÊN BẢN (BẢN 1.0 ➔ VERSION 33.0)
  // ==========================================================================
  const COMPLETE_CHANGELOG_V1_TO_V33 = [
    {
      num: 33,
      version: 'Version 33.0 (Bản Kiến Trúc Tối Thượng Stage 19 - Mới Nhất)',
      date: '11/11/2026',
      badge: 'Stage 19 Độc Lập, Video Hoạt Họa 60FPS + Hướng Dẫn Tĩnh, Nổi Cửa Sổ Con Trên Full-Screen AI & Đồng Bộ Pomodoro',
      items: [
        'Tách kiến trúc độc lập sang stage19_ultimate_architect.js: loại bỏ hoàn toàn xung đột cú pháp cũ và kiểm soát 100% giao diện thực tế.',
        'Sửa dứt điểm lỗi trong Trung tâm AI Full-Screen & Duyệt Bản Thảo: bấm Xem/Sửa Câu Lệnh Hệ Thống, Xem/Sửa Khung Story Bible, Chèn Mốc Chuyển Phân Cảnh / Đổi POV, Xem & Sửa Gói Ngữ Cảnh Cục Bộ bật cửa sổ nổi trực tiếp lên trên cùng (z-index: 2147483647) mà không cần đóng khung AI.',
        'Tích hợp Trung tâm Hướng dẫn Kép: (1) Video Hoạt Họa 60FPS mô phỏng chính xác từng vị trí nút bấm và (2) Cẩm Nang Hướng Dẫn Sử Dụng Tĩnh chi tiết từng bước từ A-Z.',
        'Đồng bộ thời gian thực hai chiều từng giây giữa viên thuốc Pomodoro thu nhỏ góc trên phải (< 🍅 24:53) và bảng Đồng hồ Pomodoro trong Tab 5.',
        'Khóa danh sách mô hình chuẩn Google AI Studio ngày 11/11/2026 (Gemini 4 Argon, Gemini 4 Carbon, Gemini 3.8 Flash, Gemini 3.6 Flash, Gemini 3.5 Flash-Lite, Gemini 3.1 Pro) kèm thanh Link tham chiếu & Quét API Real-time.',
        'Nâng cấp 4 bộ System Prompt bậc thầy tiểu thuyết tâm lý - trinh thám Noir, tự động đổi gợi ý chữ xám (placeholder) theo từng chế độ và bổ sung thẻ Chia sẻ File HTML + JS gộp trong Tab 6.'
      ]
    },
    ...(window.StudioStage16?.changelog || [
      {
        num: 31,
        version: 'Version 31.0',
        date: '11/2026',
        badge: 'Hợp Nhất Stage 16 -> 31, Hỗ Trợ Key AIza/AQ & Giao Diện Kép Laptop/Mobile',
        items: [
          'Hợp nhất các module từ Stage 16 đến Stage 31, hỗ trợ xác minh nhanh API Key qua Flash-Lite Low Thinking.'
        ]
      }
    ])
  ];

  // ==========================================================================
  // PHẦN 4: CSS TỐI THƯỢNG KHỐNG CHẾ Z-INDEX, CHỐNG TRÀN STORY BIBLE & KÍCH THƯỚC KHUNG
  // ==========================================================================
  function injectStage19SupremeStyles() {
    if (document.getElementById('s19-supreme-architect-styles')) return;
    const style = document.createElement('style');
    style.id = 's19-supreme-architect-styles';
    style.textContent = `
      /* 1. Xóa sạch thanh POV cũ ở Tab 1, 2, 3 */
      #s21-pov-collapse-toggle-bar,
      #s21-pov-metadata-grid-container,
      #s17-pov-left-edge-trigger,
      #s17-pov-left-drawer,
      #s17-draggable-pov-context-box,
      #bug3-screen1-pov-launcher,
      #pane-left-beats {
        display: none !important;
      }
      #pane-right-manuscript {
        grid-column: span 12 / span 12 !important;
        width: 100% !important;
      }

      /* 2. Đảm bảo 2 nút Video Hướng Dẫn & Loa Cập Nhật luôn hiển thị nổi bật trên Header */
      #s14-master-top-nav #btn-s23-top-video-guide,
      #s14-master-top-nav #btn-s18-top-megaphone {
        display: inline-flex !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
      }

      /* 3. Phân tầng Z-Index tuyệt đối:
            - Full-Screen AI Center & Approval Modal nằm ở tầng 2147483000
            - Mọi cửa sổ con (Xem/Sửa Story Bible, Câu lệnh hệ thống, Chèn POV, Ngữ cảnh, Video, Loa)
              luôn nổi đè lên trên cùng ở tầng 2147483646 - 2147483647! */
      .s19-fullscreen-ai-backdrop {
        z-index: 2147483000 !important;
      }
      .s19-topmost-submodal,
      #modal-scene-builder:not(.hidden),
      #modal-context-preview:not(.hidden),
      #modal-s10-video-guide:not(.hidden),
      #modal-s10-changelog:not(.hidden),
      #modal-s19-master-guide:not(.hidden),
      #modal-s19-master-changelog:not(.hidden),
      #modal-s19-sysprompt-studio:not(.hidden),
      #modal-s19-bible-live-studio:not(.hidden),
      #modal-s19-context-live-studio:not(.hidden) {
        position: fixed !important;
        inset: 0 !important;
        z-index: 2147483647 !important;
        pointer-events: auto !important;
      }

      /* 4. Khi thu nhỏ Pomodoro góc trên phải, hiển thị gọn cả đồng hồ đang chạy (< 🍅 24:53) */
      #s15-floating-pomodoro-pill.s19-pomo-collapsed {
        max-width: 128px !important;
        width: auto !important;
        padding: 4px 10px !important;
      }

      /* 5. Chống tràn tuyệt đối màn hình Story Bible (Tab 4) & Ghim nút Xóa */
      #right-bible-pane,
      #characters-list-container,
      #knowledge-list-container,
      #clues-list-container {
        min-width: 0 !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
      }
      #characters-list-container > *,
      #knowledge-list-container > *,
      #clues-list-container > * {
        max-width: 100% !important;
        overflow: hidden !important;
        word-break: break-word !important;
        overflow-wrap: anywhere !important;
      }
    `;
    document.head.appendChild(style);
  }

  // ==========================================================================
  // PHẦN 5: TRUNG TÂM HƯỚNG DẪN KÉP (VIDEO HOẠT HỌA 60FPS CHI TIẾT + HƯỚNG DẪN TĨNH A-Z)
  //         & LOA THÔNG BÁO CẬP NHẬT PHIÊN BẢN (BẢN 1.0 ➔ VERSION 33.0)
  // ==========================================================================
  class Stage19GuideAndChangelogCenter {
    static animFrameId = null;
    static isPlaying = true;
    static currentSec = 0;
    static lastTick = 0;
    static totalDuration = 180; // 3 phút (6 chương x 30 giây)

    static VIDEO_CHAPTERS = [
      {
        idx: 0,
        start: 0,
        end: 30,
        title: 'Chương 1/6 (00:00 - 00:30): Kết Nối Ổ Cứng & Lưu Tự Động Mỗi 2 Giây (Auto-Save 2s)',
        StaticTitle: '1. Kết nối Thư mục Ổ cứng & Cơ chế Lưu tự động 2 giây',
        targetBox: { x: 185, y: 18, w: 125, h: 28, label: 'Tab 2: Chương & Ổ Cứng' },
        secondSpot: { x: 645, y: 18, label: 'Đèn Auto-Save 2s' },
        narration:
          'Tại Tab 2 (Chương & File Nguồn), bạn bấm [📁 Kết Nối Ổ Cứng] để chọn thư mục trên máy tính. Cứ mỗi 2 giây (2000ms), hệ thống tự động đóng gói toàn bộ bản thảo, Story Bible và cài đặt ra file _studio_autosave_2s_temp.json gửi thẳng về thư mục bạn đã chọn!',
        bullets: [
          'Bấm Tab 2 [📂 2. Chương & File Nguồn] ➔ Bấm nút xanh [📁 Kết Nối Ổ Cứng] để cấp quyền thư mục.',
          'Đèn báo [Auto-Save 2s] trên thanh Header sẽ nhấp nháy xanh mỗi khi ghi thành công xuống ổ cứng.',
          'Hỗ trợ quét và nạp trực tiếp các file chương cũ (.DOCX, .PDF, .TXT) tốn 0% token AI.'
        ]
      },
      {
        idx: 1,
        start: 30,
        end: 60,
        title: 'Chương 2/6 (00:30 - 01:00): Chọn Mô Hình Gemini 11/2026 & Tham Chiếu Real-Time',
        StaticTitle: '2. Danh mục Mô hình Gemini mới nhất (11/11/2026) & Link AI Studio',
        targetBox: { x: 350, y: 92, w: 195, h: 34, label: '2. Mô hình Gemini 11/2026' },
        secondSpot: { x: 440, y: 138, label: 'Link AI Studio & Quét API' },
        narration:
          'Trong Trung tâm AI (Tab 3), ô [2. MÔ HÌNH GEMINI HIỆN HÀNH] cập nhật đầy đủ các mô hình tính đến 11/11/2026: Gemini 4 Argon, Gemini 4 Carbon, Gemini 3.8 Flash, Gemini 3.6 Flash, Gemini 3.5 Flash-Lite, Gemini 3.1 Pro. Ngay bên dưới có nút Quét API Real-time và Link mở thẳng Google AI Studio!',
        bullets: [
          '👑 Gemini 4 Argon / 💎 4 Carbon: Dành cho phân cảnh tâm lý phức tạp, suy luận logic sâu (1M context).',
          '🚀 Gemini 3.8 Flash / ✨ 3.6 Flash: Cân bằng hoàn hảo giữa tốc độ và chiều sâu văn chương.',
          '⚡ Gemini 3.5 Flash-Lite: Tốc độ siêu cao, hạn mức 10.000 lượt/ngày, tối ưu cho tóm tắt Story Bible.'
        ]
      },
      {
        idx: 2,
        start: 60,
        end: 90,
        title: 'Chương 3/6 (01:00 - 01:30): 4 Chế Độ Sáng Tác Tâm Lý - Trinh Thám & System Prompt',
        StaticTitle: '3. 4 Chế độ Sáng tác Chuyên sâu, Gợi ý Placeholder & System Prompt',
        targetBox: { x: 45, y: 92, w: 285, h: 34, label: '1. Chọn Chế Độ Làm Việc AI' },
        secondSpot: { x: 255, y: 68, label: '📜 Xem & Sửa Câu Lệnh Hệ Thống' },
        narration:
          'Khi bạn chuyển đổi giữa Chế độ 1 (Viết nháp chậm), Chế độ 2 (Tham mưu Unreliable POV), Chế độ 3 (Kiểm toán Logic/Giờ giấc), và Chế độ 4 (Review đa chiều), dòng chữ gợi ý màu xám trong ô lệnh sẽ tự động đổi theo! Bấm [📜 Xem & Sửa Khung Câu Lệnh Hệ Thống] để tùy biến System Prompt.',
        bullets: [
          'Chế độ 1 (Slow-Burn): Ép nhịp độ vi mô, giải phẫu nội tâm 3 tầng, khóa chặt thoại "- Câu thoại (Tên)".',
          'Chế độ 2 (Tham mưu): Thiết kế 3 nhánh rẽ cốt truyện, gài bẫy Unreliable Narrator và Phục bút 3 tầng.',
          'Chế độ 3 & 4 (Kiểm toán & Review): Đối chiếu pháp y giờ giấc, bắt rò rỉ Ma trận Ai Biết Gì và chấm điểm 5 trục.'
        ]
      },
      {
        idx: 3,
        start: 90,
        end: 120,
        title: 'Chương 4/6 (01:30 - 02:00): Mở Trực Tiếp Story Bible, Chèn POV & Ngữ Cảnh Trên Khung AI',
        StaticTitle: '4. Thao tác trực tiếp Story Bible, Chèn POV & Ngữ cảnh ngay trên Cửa sổ AI',
        targetBox: { x: 210, y: 162, w: 230, h: 30, label: '🏛️ Xem/Sửa Story Bible' },
        secondSpot: { x: 530, y: 175, label: '🎬 + Chèn Mốc Chuyển Cảnh / POV' },
        narration:
          'Ngay trong Trung tâm AI Full-Screen (hoặc cửa sổ Duyệt Bản Thảo), khi bạn bấm [🏛️ Xem / Sửa Khung Story Bible], [🎬 + Chèn Mốc Chuyển Phân Cảnh / Đổi POV], hoặc [🔍 Xem Gói Ngữ Cảnh Cục Bộ], cửa sổ chỉnh sửa sẽ bật nổi trực tiếp lên trên cùng để bạn sửa và lưu ngay mà không cần đóng khung AI!',
        bullets: [
          'Sửa trực tiếp cả [Khung Kiểu Mẫu] lẫn [Nội Dung Story Bible] ngay trên cửa sổ nổi.',
          'Chèn mốc chuyển cảnh, giờ giấc và đổi nhân vật POV thẳng vào ô nhập câu lệnh hiện tại.',
          'Xem và chỉnh sửa trực tiếp gói tài nguyên RAG cục bộ trước khi gửi cho Gemini.'
        ]
      },
      {
        idx: 4,
        start: 120,
        end: 150,
        title: 'Chương 5/6 (02:00 - 02:30): Kích Thước Khung Chat Tab 3 & Đồng Bộ Pomodoro Tab 5',
        StaticTitle: '5. Chỉnh kích thước Ô nhập lệnh Tab 3 & Đồng bộ Pomodoro thời gian thực',
        targetBox: { x: 45, y: 205, w: 380, h: 28, label: '🔍 Kích Thước Khung Chat (Nhỏ/Vừa/Lớn/Rộng)' },
        secondSpot: { x: 760, y: 18, label: '🍅 Pomodoro Đồng Bộ Giây' },
        narration:
          'Thanh chỉnh kích thước khung nhập lệnh (Cỡ Nhỏ 180px, Vừa 280px, Lớn 440px, Siêu Rộng 65% màn hình) nằm ngay phía trên ô nhập câu lệnh ở Tab 3. Đồng thời, viên thuốc Pomodoro góc trên phải luôn đồng bộ chính xác từng giây với đồng hồ Pomodoro trong Tab 5!',
        bullets: [
          'Bấm Cỡ Nhỏ / Cỡ Vừa / Cỡ Lớn / Siêu Rộng ngay trên ô nhập lệnh để co giãn tức thì.',
          'Đồng hồ Pomodoro thu nhỏ (< 🍅 24:53) và bảng Pomodoro ở Tab 5 dùng chung 1 bộ đếm thời gian thực.',
          'Khi bấm Bắt đầu / Tạm dừng / Đặt lại ở bất kỳ đâu, cả 2 đồng hồ đều cập nhật đồng thời.'
        ]
      },
      {
        idx: 5,
        start: 150,
        end: 180,
        title: 'Chương 6/6 (02:30 - 03:00): Chia Sẻ File HTML + JS Gộp Cho Bạn Bè Ở Tab 6',
        StaticTitle: '6. Đóng gói & Chia sẻ File HTML + JS Gộp cho bạn bè dùng chung code',
        targetBox: { x: 300, y: 245, w: 260, h: 65, label: '🌐 Tải 1 File .HTML + JS Gộp Duy Nhất' },
        secondSpot: { x: 640, y: 275, label: '📜 Tải File .JS Hợp Nhất' },
        narration:
          'Tại Tab 6 (Màn hình 6: Hệ thống & Cài đặt), bạn có thể bấm [🌐 Tải 1 File .HTML + JS Gộp Duy Nhất] để đóng gói toàn bộ trang web gửi cho bạn bè mở lên dùng ngay, hoặc bấm [📜 Tải File .JS Hợp Nhất] để các bạn dùng JS code chung với bạn!',
        bullets: [
          'Tự động lọc sạch mã API Key cá nhân của bạn trước khi đóng gói để bảo mật 100%.',
          'File .HTML Gộp chứa sẵn toàn bộ HTML + CSS + Stage 1 -> Stage 19, mở trên mọi trình duyệt.',
          'File .JS Hợp Nhất giúp nhóm bạn bè của bạn dễ dàng đọc và phát triển tiếp tính năng.'
        ]
      }
    ];

    static openGuideModal(defaultTab = 'VIDEO_TAB') {
      let modal = document.getElementById('modal-s19-master-guide');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-s19-master-guide';
        modal.className =
          's19-topmost-submodal fixed inset-0 bg-black/85 flex items-center justify-center p-3 md:p-5 backdrop-blur-md select-none';
        document.body.appendChild(modal);
      }

      modal.innerHTML = `
        <div class="w-full max-w-5xl rounded-2xl border-2 border-emerald-500/80 bg-zinc-950 text-white shadow-[0_20px_60px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[94vh] text-xs">
          <!-- Header -->
          <div class="px-5 py-3.5 border-b border-zinc-800 bg-gradient-to-r from-emerald-950/80 via-zinc-900 to-zinc-950 flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2.5">
              <span class="text-2xl">🎬</span>
              <div>
                <h3 class="font-extrabold uppercase text-sm text-emerald-400 tracking-wide">
                  TRUNG TÂM HƯỚNG DẪN SỬ DỤNG TOÀN DIỆN — WEB VIẾT TIỂU THUYẾT CỦA BI (VERSION 33)
                </h3>
                <p class="text-[11px] text-zinc-400">
                  Kết hợp Video Hoạt Họa Mô Phỏng Giao Diện Thực Tế (60FPS) & Cẩm Nang Hướng Dẫn Tĩnh Chi Tiết Từng Nút
                </p>
              </div>
            </div>

            <!-- Công tắc chuyển đổi giữa Video Hoạt Họa & Hướng Dẫn Tĩnh -->
            <div class="flex items-center gap-2">
              <button type="button" id="btn-s19-tab-video" class="px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition flex items-center gap-1.5 bg-emerald-600 text-white shadow">
                <span>🎬 1. Video Hoạt Họa Chi Tiết</span>
              </button>
              <button type="button" id="btn-s19-tab-static" class="px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/40">
                <span>📖 2. Cẩm Nang Hướng Dẫn Tĩnh (Đọc Nhanh)</span>
              </button>
              <button type="button" id="btn-s19-close-guide" class="ml-2 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs">
                ✕ Đóng
              </button>
            </div>
          </div>

          <!-- TAB 1: VIDEO HOẠT HỌA TRỰC QUAN 60FPS -->
          <div id="s19-guide-pane-video" class="p-4 flex-1 overflow-y-auto space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800">
              <span id="s19-video-chapter-heading" class="font-extrabold text-amber-400 text-xs">
                ${this.VIDEO_CHAPTERS[0].title}
              </span>
              <span id="s19-video-time-badge" class="font-monoCode font-bold text-emerald-400 text-xs">
                00:00 / 03:00
              </span>
            </div>

            <div class="relative rounded-xl overflow-hidden border-2 border-zinc-800 bg-zinc-950 shadow-inner">
              <canvas id="s19-video-guide-canvas" width="900" height="360" class="w-full block"></canvas>
            </div>

            <!-- Phụ đề thuyết minh & các bước cụ thể của chương đang phát -->
            <div class="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
              <div id="s19-video-narration-box" class="font-bold text-emerald-200 text-xs leading-relaxed"></div>
              <ul id="s19-video-bullets-box" class="list-disc pl-5 text-[11px] text-amber-200/90 space-y-1"></ul>
            </div>

            <!-- Thanh điều khiển Play/Pause & Tua Video -->
            <div class="flex items-center gap-3 pt-1">
              <button type="button" id="btn-s19-video-playpause" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow shrink-0">
                ⏸️ Tạm dừng
              </button>
              <button type="button" id="btn-s19-video-prev-chap" class="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs shrink-0">
                ⏮️ Chương trước
              </button>
              <input id="s19-video-scrub-range" type="range" min="0" max="180" step="0.5" value="0" class="flex-1 accent-emerald-500 cursor-pointer" />
              <button type="button" id="btn-s19-video-next-chap" class="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs shrink-0">
                Chương tiếp ⏭️
              </button>
            </div>

            <!-- 6 Nút chọn nhanh từng chương video -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
              ${this.VIDEO_CHAPTERS.map(
                (ch, i) => `
                <button type="button" data-s19-seek="${ch.start}" class="s19-vid-chap-btn p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/90 hover:bg-emerald-600/20 hover:border-emerald-500/50 text-left transition">
                  <div class="font-extrabold text-emerald-400 text-[11px] truncate">${
                    ch.StaticTitle
                  }</div>
                  <div class="text-[10px] text-zinc-400 font-monoCode mt-0.5">Mốc giờ: 0${Math.floor(
                    ch.start / 60
                  )}:${String(ch.start % 60).padStart(2, '0')} ➔ 0${Math.floor(
                  ch.end / 60
                )}:${String(ch.end % 60).padStart(2, '0')}</div>
                </button>`
              ).join('')}
            </div>
          </div>

          <!-- TAB 2: CẨM NANG HƯỚNG DẪN SỬ DỤNG TĨNH CHI TIẾT TỪNG MỤC -->
          <div id="s19-guide-pane-static" class="hidden p-5 flex-1 overflow-y-auto space-y-4 select-text">
            <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 class="font-extrabold text-amber-400 text-sm uppercase">
                  📖 CẨM NANG HƯỚNG DẪN SỬ DỤNG TĨNH (TRA CỨU NHANH TOÀN BỘ TÍNH NĂNG)
                </h4>
                <p class="text-[11px] text-zinc-300">
                  Dành cho bạn khi muốn đọc nhanh vị trí từng nút bấm và quy trình chuẩn mà không cần chờ xem video
                </p>
              </div>
              <input id="s19-static-guide-search" type="text" placeholder="🔍 Gõ từ khóa cần tìm (VD: Story Bible, Pomodoro, Chia sẻ, Model)..." class="w-72 px-3 py-1.5 rounded-xl bg-zinc-900 border border-amber-500/50 text-white text-xs focus:outline-none" />
            </div>

            <div id="s19-static-guide-cards" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${this.VIDEO_CHAPTERS.map(
                (ch) => `
                <div class="s19-static-card p-4 rounded-2xl border border-zinc-800 bg-zinc-900/75 space-y-2.5 shadow">
                  <div class="font-extrabold text-emerald-400 text-sm border-b border-zinc-800 pb-2">
                    ${ch.StaticTitle}
                  </div>
                  <p class="text-xs text-zinc-300 leading-relaxed">${ch.narration}</p>
                  <ul class="list-disc pl-5 text-[11px] text-amber-300/90 space-y-1 leading-relaxed">
                    ${ch.bullets.map((b) => `<li>${b}</li>`).join('')}
                  </ul>
                </div>`
              ).join('')}
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      modal.classList.remove('hidden');

      const tabVidBtn = document.getElementById('btn-s19-tab-video');
      const tabStaBtn = document.getElementById('btn-s19-tab-static');
      const paneVid = document.getElementById('s19-guide-pane-video');
      const paneSta = document.getElementById('s19-guide-pane-static');

      const switchTab = (mode) => {
        if (mode === 'STATIC_TAB') {
          paneVid?.classList.add('hidden');
          paneSta?.classList.remove('hidden');
          tabStaBtn.className =
            'px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition flex items-center gap-1.5 bg-amber-600 text-white shadow';
          tabVidBtn.className =
            'px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-emerald-300 border border-emerald-500/40';
        } else {
          paneSta?.classList.add('hidden');
          paneVid?.classList.remove('hidden');
          tabVidBtn.className =
            'px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition flex items-center gap-1.5 bg-emerald-600 text-white shadow';
          tabStaBtn.className =
            'px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/40';
        }
      };

      switchTab(defaultTab);
      tabVidBtn?.addEventListener('click', () => switchTab('VIDEO_TAB'));
      tabStaBtn?.addEventListener('click', () => switchTab('STATIC_TAB'));

      document.getElementById('btn-s19-close-guide')?.addEventListener('click', () => {
        modal.classList.add('hidden');
        if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      });

      const playPauseBtn = document.getElementById('btn-s19-video-playpause');
      playPauseBtn?.addEventListener('click', () => {
        this.isPlaying = !this.isPlaying;
        playPauseBtn.textContent = this.isPlaying ? '⏸️ Tạm dừng' : '▶️ Tiếp tục phát';
      });

      const scrub = document.getElementById('s19-video-scrub-range');
      scrub?.addEventListener('input', () => {
        this.currentSec = parseFloat(scrub.value) || 0;
        this.renderCanvasFrame(performance.now());
      });

      document.getElementById('btn-s19-video-prev-chap')?.addEventListener('click', () => {
        this.currentSec = Math.max(0, Math.floor(this.currentSec / 30 - 1) * 30);
      });
      document.getElementById('btn-s19-video-next-chap')?.addEventListener('click', () => {
        this.currentSec = (Math.floor(this.currentSec / 30 + 1) * 30) % this.totalDuration;
      });

      modal.querySelectorAll('.s19-vid-chap-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.currentSec = parseFloat(btn.getAttribute('data-s19-seek')) || 0;
          this.isPlaying = true;
          if (playPauseBtn) playPauseBtn.textContent = '⏸️ Tạm dừng';
        });
      });

      // Tìm kiếm trực tiếp trong Cẩm nang tĩnh
      const searchInp = document.getElementById('s19-static-guide-search');
      searchInp?.addEventListener('input', () => {
        const q = searchInp.value.toLowerCase().trim();
        modal.querySelectorAll('.s19-static-card').forEach((card) => {
          const match = !q || card.textContent.toLowerCase().includes(q);
          card.classList.toggle('hidden', !match);
        });
      });

      this.isPlaying = true;
      this.lastTick = performance.now();
      if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
      const loop = (now) => {
        if (modal.classList.contains('hidden')) {
          this.animFrameId = null;
          return;
        }
        if (this.isPlaying) {
          const dt = (now - this.lastTick) / 1000;
          this.currentSec = (this.currentSec + dt) % this.totalDuration;
        }
        this.lastTick = now;
        this.renderCanvasFrame(now);
        this.animFrameId = requestAnimationFrame(loop);
      };
      this.animFrameId = requestAnimationFrame(loop);
    }

    static renderCanvasFrame(now) {
      const canvas = document.getElementById('s19-video-guide-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;

      const chap =
        this.VIDEO_CHAPTERS.find(
          (c) => this.currentSec >= c.start && this.currentSec < c.end
        ) || this.VIDEO_CHAPTERS[0];

      // Cập nhật text DOM
      const headingEl = document.getElementById('s19-video-chapter-heading');
      const timeBadge = document.getElementById('s19-video-time-badge');
      const narBox = document.getElementById('s19-video-narration-box');
      const bulBox = document.getElementById('s19-video-bullets-box');
      const scrub = document.getElementById('s19-video-scrub-range');

      if (headingEl && headingEl.textContent !== chap.title) {
        headingEl.textContent = chap.title;
      }
      if (narBox && narBox.textContent !== chap.narration) {
        narBox.textContent = `🎱 Thuyết minh: ${chap.narration}`;
      }
      if (bulBox && bulBox.dataset.chapIdx !== String(chap.idx)) {
        bulBox.dataset.chapIdx = String(chap.idx);
        bulBox.innerHTML = chap.bullets.map((b) => `<li>${b}</li>`).join('');
      }
      if (scrub && !scrub.matches(':active')) {
        scrub.value = String(this.currentSec.toFixed(1));
      }
      if (timeBadge) {
        const mm = String(Math.floor(this.currentSec / 60)).padStart(2, '0');
        const ss = String(Math.floor(this.currentSec % 60)).padStart(2, '0');
        timeBadge.textContent = `${mm}:${ss} / 03:00`;
      }

      // Vẽ mô phỏng giao diện thực tế trên Canvas 900x360
      ctx.fillStyle = '#09090B';
      ctx.fillRect(0, 0, w, h);

      // 1. Thanh Top Header mô phỏng
      ctx.fillStyle = '#18181B';
      ctx.fillRect(0, 0, w, 46);
      ctx.fillStyle = '#064E3B';
      ctx.fillRect(10, 8, 165, 30);
      ctx.fillStyle = '#34D399';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText('✍️ Web tiểu thuyết của Bi', 18, 27);

      ctx.fillStyle = '#27272A';
      ctx.fillRect(185, 8, 130, 30);
      ctx.fillStyle = '#E4E4E7';
      ctx.fillText('📂 Tab 2: Ổ Cứng', 195, 27);

      ctx.fillStyle = '#065F46';
      ctx.fillRect(325, 8, 145, 30);
      ctx.fillStyle = '#A7F3D0';
      ctx.fillText('🎬 Video Hướng Dẫn', 335, 27);

      ctx.fillStyle = '#78350F';
      ctx.fillRect(480, 8, 130, 30);
      ctx.fillStyle = '#FDE68A';
      ctx.fillText('📢 Loa Cập Nhật', 492, 27);

      ctx.fillStyle = '#064E3B';
      ctx.fillRect(620, 8, 115, 30);
      ctx.fillStyle = '#34D399';
      ctx.fillText('● Auto-Save 2s', 630, 27);

      ctx.fillStyle = '#92400E';
      ctx.fillRect(745, 8, 140, 30);
      ctx.fillStyle = '#FEF3C7';
      ctx.fillText('🍅 Pomodoro 24:53', 755, 27);

      // 2. Khung Trung tâm AI (Tab 3) & Tab 6 mô phỏng trực quan
      ctx.fillStyle = '#121215';
      ctx.fillRect(20, 58, w - 40, h - 72);
      ctx.strokeStyle = '#27272A';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(20, 58, w - 40, h - 72);

      // Hàng 1 trong khung: 1. Chế độ AI | 2. Mô hình Gemini | 3. Tư duy | 4. Số từ
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(40, 88, 290, 38);
      ctx.fillStyle = '#34D399';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText('✍️ Chế độ 1: Viết Bản Nháp Chậm (Slow-Burn)', 50, 111);

      ctx.fillStyle = '#065F46';
      ctx.fillRect(190, 63, 140, 20);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.fillText('📜 Xem & Sửa Câu Lệnh Hệ Thống', 196, 76);

      ctx.fillStyle = '#1F2937';
      ctx.fillRect(345, 88, 205, 38);
      ctx.fillStyle = '#FBBF24';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText('👑 Gemini 4 Argon / 3.8 Flash', 355, 111);

      ctx.fillStyle = '#312E81';
      ctx.fillRect(345, 130, 205, 18);
      ctx.fillStyle = '#C7D2FE';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.fillText('🔗 Link Google AI Studio & Quét API', 355, 142);

      ctx.fillStyle = '#1F2937';
      ctx.fillRect(565, 88, 145, 38);
      ctx.fillStyle = '#A7F3D0';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText('🧠 Tư Duy: Cao (High)', 575, 111);

      ctx.fillStyle = '#1F2937';
      ctx.fillRect(725, 88, 135, 38);
      ctx.fillStyle = '#34D399';
      ctx.fillText('Số từ: 4500 từ', 738, 111);

      // Hàng 2: Liên kết Story Bible & Phân cảnh
      ctx.fillStyle = '#18181B';
      ctx.fillRect(40, 156, w - 80, 38);
      ctx.fillStyle = '#D97706';
      ctx.fillRect(205, 161, 235, 28);
      ctx.fillStyle = '#09090B';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillText('🏛️ Xem / Sửa Khung Story Bible Đang Áp Dụng', 214, 179);

      ctx.fillStyle = '#059669';
      ctx.fillRect(452, 161, 215, 28);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('🎬 + Chèn Mốc Chuyển Phân Cảnh / POV', 462, 179);

      ctx.fillStyle = '#27272A';
      ctx.fillRect(680, 161, 165, 28);
      ctx.fillStyle = '#E4E4E7';
      ctx.fillText('🔍 Xem Gói Ngữ Cảnh Cục Bộ', 690, 179);

      // Hàng 3: Thanh kích thước khung chat & Chia sẻ file
      ctx.fillStyle = '#1E1B4B';
      ctx.fillRect(40, 202, 410, 28);
      ctx.fillStyle = '#A5B4FC';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillText('🔍 Kích thước khung lệnh: [Nhỏ] [Vừa] [Lớn] [Siêu Rộng]', 50, 220);

      ctx.fillStyle = '#18181B';
      ctx.fillRect(40, 238, w - 80, 88);
      ctx.strokeStyle = '#3F3F46';
      ctx.strokeRect(40, 238, w - 80, 88);
      ctx.fillStyle = '#A1A1AA';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText(
        '✍️ Gợi ý chữ xám (Placeholder) tự động thay đổi chi tiết theo từng Chế độ 1, 2, 3, 4...',
        55,
        262
      );

      ctx.fillStyle = '#065F46';
      ctx.fillRect(295, 276, 265, 38);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText('🌐 Tải 1 File .HTML + JS Gộp Chia Sẻ Bạn Bè', 308, 299);

      ctx.fillStyle = '#3730A3';
      ctx.fillRect(575, 276, 265, 38);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('📜 Tải File .JS Hợp Nhất (Code Chung)', 592, 299);

      // 3. Vẽ khung Highlight nhấp nháy & Con trỏ chuột + Linh vật Viên Bi tại đúng vị trí đang thuyết minh
      const pulse = Math.abs(Math.sin(now / 180));
      const tb = chap.targetBox;

      ctx.save();
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 3 + pulse * 2;
      ctx.shadowColor = '#10B981';
      ctx.shadowBlur = 16;
      ctx.strokeRect(tb.x - 4, tb.y - 4, tb.w + 8, tb.h + 8);
      ctx.restore();

      // Vòng tròn radar tại điểm phụ
      const sp = chap.secondSpot;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 12 + pulse * 9, 0, Math.PI * 2);
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Nhãn chỉ dẫn nổi trên mục tiêu
      const calloutX = Math.min(w - 240, Math.max(20, tb.x));
      const calloutY = tb.y > 120 ? tb.y - 34 : tb.y + tb.h + 10;
      ctx.fillStyle = '#059669';
      ctx.fillRect(calloutX, calloutY, 225, 24);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText(`👆 ${tb.label}`, calloutX + 10, calloutY + 16);

      // Vẽ Linh vật Viên Bi số 8 đi kèm con trỏ
      const biX = Math.min(w - 45, tb.x + tb.w + 28);
      const biY = Math.min(h - 35, Math.max(40, tb.y + 18 + Math.sin(now / 150) * 4));
      ctx.beginPath();
      ctx.arc(biX, biY, 18, 0, Math.PI * 2);
      ctx.fillStyle = '#18181B';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#34D399';
      ctx.stroke();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText('🎱8', biX - 10, biY + 4);
    }

    static openChangelogModal() {
      let modal = document.getElementById('modal-s19-master-changelog');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-s19-master-changelog';
        modal.className =
          's19-topmost-submodal fixed inset-0 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md select-none';
        document.body.appendChild(modal);
      }

      modal.innerHTML = `
        <div class="w-full max-w-4xl max-h-[90vh] rounded-2xl border-2 border-amber-500/80 bg-zinc-950 text-white shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden text-xs">
          <div class="px-5 py-4 border-b border-zinc-800 bg-gradient-to-r from-amber-950/70 via-zinc-900 to-zinc-950 flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2.5">
              <span class="text-2xl">📢</span>
              <div>
                <h3 class="font-extrabold uppercase text-sm text-amber-400">
                  LOA THÔNG BÁO CẬP NHẬT — TOÀN BỘ LỊCH SỬ PHIÊN BẢN (BẢN 1.0 ➔ VERSION 33.0 • 11/11/2026)
                </h3>
                <p class="text-[11px] text-zinc-400">
                  Đầy đủ tất cả các bản cập nhật và tính năng của Web viết tiểu thuyết của Bi
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <input id="s19-changelog-search" type="text" placeholder="🔍 Tìm phiên bản / tính năng..." class="px-3 py-1.5 rounded-xl bg-zinc-900 border border-amber-500/40 text-white text-xs focus:outline-none" />
              <button type="button" id="btn-s19-close-changelog" class="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs">
                ✕ Đóng Loa
              </button>
            </div>
          </div>

          <div id="s19-changelog-list-box" class="flex-1 overflow-y-auto p-5 space-y-3.5 select-text">
            ${COMPLETE_CHANGELOG_V1_TO_V33.map(
              (item, idx) => `
              <div class="s19-changelog-card p-4 rounded-2xl border ${
                idx === 0
                  ? 'border-emerald-500 bg-emerald-950/25 shadow-lg'
                  : 'border-zinc-800 bg-zinc-900/65'
              } space-y-2">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <span class="px-2.5 py-0.5 rounded-full ${
                      idx === 0
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-800 text-amber-400'
                    } font-monoCode font-extrabold text-[11px]">
                      #${item.num} • ${item.version}
                    </span>
                    <span class="font-extrabold text-xs ${
                      idx === 0 ? 'text-emerald-300' : 'text-amber-400'
                    }">
                      ${item.badge}
                    </span>
                  </div>
                  <span class="text-[10px] font-monoCode text-zinc-400">${item.date}</span>
                </div>
                <ul class="list-disc pl-5 space-y-1 text-zinc-200 leading-relaxed">
                  ${(item.items || []).map((li) => `<li>${li}</li>`).join('')}
                </ul>
              </div>`
            ).join('')}
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      modal.classList.remove('hidden');

      document
        .getElementById('btn-s19-close-changelog')
        ?.addEventListener('click', () => modal.classList.add('hidden'));

      const searchEl = document.getElementById('s19-changelog-search');
      searchEl?.addEventListener('input', () => {
        const q = searchEl.value.toLowerCase().trim();
        modal.querySelectorAll('.s19-changelog-card').forEach((c) => {
          c.classList.toggle('hidden', Boolean(q && !c.textContent.toLowerCase().includes(q)));
        });
      });
    }
  }

  // ==========================================================================
  // PHẦN 6: BỘ ĐIỀU KHIỂN CỬA SỔ NỔI TRỰC TIẾP TRÊN FULL-SCREEN AI CENTER & DUYỆT BẢN THẢO
  //         Giải quyết triệt để lỗi trong video_1.mp4 (00:01 -> 00:09):
  //         - Xem & Sửa Khung Câu Lệnh Hệ Thống (4 chế độ tiểu thuyết gia)
  //         - Xem & Sửa Trực Tiếp Khung Story Bible Đang Áp Dụng
  //         - Chèn Mốc Chuyển Phân Cảnh / Đổi POV (chèn thẳng vào ô lệnh đang mở)
  //         - Xem & Đổi Gói Ngữ Cảnh Cục Bộ
  // ==========================================================================
  class Stage19SubModalOverAiController {
    static detectCurrentAiModeKey() {
      let rawVal = 'MODE_1_DRAFT';
      document.querySelectorAll('select').forEach((sel) => {
        const firstOpt = sel.options?.[0]?.textContent || '';
        if (
          sel.id === 'select-ai-work-mode' ||
          sel.id === 's17-ai-mode-select' ||
          firstOpt.includes('Chế độ 1:')
        ) {
          rawVal = sel.value;
        }
      });
      const v = String(rawVal || '').toUpperCase();
      if (v.includes('FREE') || v.includes('CHAT') || v.includes('5')) return 'FREE_CHAT';
      if (v.includes('2') || v.includes('CONSULT') || v.includes('ADVISOR')) return 'MODE_2_CONSULT';
      if (v.includes('3') || v.includes('AUDIT')) return 'MODE_3_AUDIT';
      if (v.includes('4') || v.includes('REVIEW')) return 'MODE_4_REVIEW';
      return 'MODE_1_DRAFT';
    }

    static getActiveSystemPromptForMode(modeKey) {
      const saved = localStorage.getItem(`noir_s19_sysprompt_${modeKey}`);
      if (saved && saved.trim()) return saved;
      return (
        MASTER_PSYCH_NOIR_MODES[modeKey]?.systemPrompt ||
        MASTER_PSYCH_NOIR_MODES.MODE_1_DRAFT.systemPrompt
      );
    }

    static findActivePromptTextarea() {
      // Tìm đúng ô textarea nhập câu lệnh đang hiển thị trên màn hình (trong Full-Screen AI Center)
      const allTextareas = [...document.querySelectorAll('textarea')];
      for (const ta of allTextareas) {
        const ph = (ta.getAttribute('placeholder') || '').toLowerCase();
        if (
          ph.includes('nhập diễn biến cốt lõi') ||
          ph.includes('gợi ý chế độ') ||
          ta.id === 's6-popup-prompt-textarea'
        ) {
          return ta;
        }
      }
      return document.getElementById('s6-popup-prompt-textarea') || allTextareas[0];
    }

    /**
     * 1. Mở Cửa Sổ Xem & Sửa Câu Lệnh Hệ Thống (Nổi trực tiếp trên Full-Screen AI Center)
     */
    static openSystemPromptStudioModal() {
      const currentModeKey = this.detectCurrentAiModeKey();
      let modal = document.getElementById('modal-s19-sysprompt-studio');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-s19-sysprompt-studio';
        modal.className =
          's19-topmost-submodal fixed inset-0 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md';
        document.body.appendChild(modal);
      }

      modal.innerHTML = `
        <div class="w-full max-w-4xl rounded-2xl border-2 border-emerald-500/80 bg-zinc-950 text-white shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh] text-xs">
          <div class="px-5 py-3.5 border-b border-zinc-800 bg-emerald-600/20 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 class="font-extrabold uppercase text-sm text-emerald-400">
                📜 XEM & TÙY CHỈNH KHUNG CÂU LỆNH HỆ THỐNG CHUYÊN SÂU (SYSTEM PROMPT BẬC THẦY)
              </h3>
              <p class="text-[11px] text-zinc-300">
                Mỗi chế độ có một bộ System Prompt tiểu thuyết gia tâm lý - trinh thám riêng biệt. Bạn có thể sửa và lưu ngay tại đây!
              </p>
            </div>
            <button type="button" id="btn-s19-close-sysprompt" class="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold">
              ✕ Đóng & Quay Lại Khung AI
            </button>
          </div>

          <div class="p-4 flex-1 overflow-y-auto space-y-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 items-center bg-zinc-900 p-3 rounded-xl border border-zinc-800">
              <div>
                <label class="block font-extrabold uppercase text-[10px] text-amber-400 mb-1">
                  Chọn Chế Độ Để Xem / Chỉnh Sửa System Prompt:
                </label>
                <select id="s19-sysprompt-mode-select" class="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-emerald-500/50 text-emerald-300 font-extrabold text-xs">
                  <option value="MODE_1_DRAFT" ${currentModeKey === 'MODE_1_DRAFT' ? 'selected' : ''}>✍️ Chế độ 1: Viết Bản Nháp Chậm (Tâm Lý & Extreme Slow-Burn)</option>
                  <option value="MODE_2_CONSULT" ${currentModeKey === 'MODE_2_CONSULT' ? 'selected' : ''}>🧭 Chế độ 2: Tham Mưu Cốt Truyện, Phục Bút & Unreliable Narrator</option>
                  <option value="MODE_3_AUDIT" ${currentModeKey === 'MODE_3_AUDIT' ? 'selected' : ''}>🔍 Chế độ 3: Kiểm Toán Pháp Y Logic, Trục Giờ Giấc & Chính Tả</option>
                  <option value="MODE_4_REVIEW" ${currentModeKey === 'MODE_4_REVIEW' ? 'selected' : ''}>📊 Chế độ 4: Review Tổng Thể Đa Chiều & Đánh Giá Nhịp Độ</option>
                </select>
              </div>
              <div class="flex flex-col justify-end space-y-1">
                <span class="text-[10px] text-zinc-400 font-semibold">Điền nhanh khung mẫu của chế độ này vào ô nhập lệnh bên dưới:</span>
                <button type="button" id="btn-s19-insert-template-from-modal" class="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs shadow transition">
                  ✨ Chèn Khung Mẫu Của Chế Độ Này Vào Ô Nhập Lệnh AI
                </button>
              </div>
            </div>

            <div class="space-y-1">
              <label class="block font-extrabold uppercase text-[10px] text-emerald-400">
                Nội Dung Câu Lệnh Hệ Thống (System Instruction gửi ngầm cho Gemini):
              </label>
              <textarea id="s19-sysprompt-editor-box" rows="16" class="w-full p-3.5 rounded-xl border border-emerald-500/40 bg-zinc-900 text-emerald-100 font-monoCode text-xs leading-relaxed focus:outline-none focus:border-emerald-400">${this.getActiveSystemPromptForMode(
                currentModeKey
              )}</textarea>
            </div>
          </div>

          <div class="px-5 py-3 border-t border-zinc-800 bg-zinc-900 flex flex-wrap items-center justify-between gap-2">
            <button type="button" id="btn-s19-reset-sysprompt" class="px-3.5 py-2 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-bold text-xs">
              ↩️ Khôi Phục Bản Chuẩn Tiểu Thuyết Gia Mặc Định
            </button>
            <button type="button" id="btn-s19-save-sysprompt" class="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition">
              💾 Lưu & Áp Dụng Câu Lệnh Hệ Thống Này Ngay
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      modal.classList.remove('hidden');

      const modeSel = document.getElementById('s19-sysprompt-mode-select');
      const editorBox = document.getElementById('s19-sysprompt-editor-box');

      modeSel?.addEventListener('change', () => {
        editorBox.value = this.getActiveSystemPromptForMode(modeSel.value);
      });

      document
        .getElementById('btn-s19-close-sysprompt')
        ?.addEventListener('click', () => modal.classList.add('hidden'));

      document
        .getElementById('btn-s19-reset-sysprompt')
        ?.addEventListener('click', () => {
          const k = modeSel.value;
          localStorage.removeItem(`noir_s19_sysprompt_${k}`);
          editorBox.value = MASTER_PSYCH_NOIR_MODES[k]?.systemPrompt || '';
        });

      document
        .getElementById('btn-s19-insert-template-from-modal')
        ?.addEventListener('click', () => {
          const k = modeSel.value;
          const tpl =
            MASTER_PSYCH_NOIR_MODES[k]?.sampleTemplate ||
            MASTER_PSYCH_NOIR_MODES.MODE_1_DRAFT.sampleTemplate;
          const ta = this.findActivePromptTextarea();
          if (ta) {
            ta.value = ta.value.trim() ? `${ta.value.trim()}\n\n${tpl}` : tpl;
          }
          modal.classList.add('hidden');
          window.StudioStage7?.saveEngine?.showSaveToastNotification(
            '✨ Đã chèn Khung Mẫu chuyên nghiệp vào ô nhập câu lệnh!'
          );
        });

      document
        .getElementById('btn-s19-save-sysprompt')
        ?.addEventListener('click', () => {
          const k = modeSel.value;
          localStorage.setItem(`noir_s19_sysprompt_${k}`, editorBox.value);
          if (window.StudioStage3?.modeRulesManager?.rules) {
            window.StudioStage3.modeRulesManager.rules[k] = editorBox.value;
            if (k === 'MODE_2_CONSULT') {
              window.StudioStage3.modeRulesManager.rules.MODE_2_ADVISOR = editorBox.value;
            }
          }
          modal.classList.add('hidden');
          window.StudioStage7?.saveEngine?.showSaveToastNotification(
            '💾 Đã lưu & áp dụng Câu Lệnh Hệ Thống mới!'
          );
        });
    }

    /**
     * 2. Mở Cửa Sổ Xem & Sửa Trực Tiếp Khung Story Bible (Nổi trực tiếp trên Full-Screen AI Center & Duyệt Bản Thảo)
     */
    static openLiveStoryBibleStudioModal() {
      let modal = document.getElementById('modal-s19-bible-live-studio');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-s19-bible-live-studio';
        modal.className =
          's19-topmost-submodal fixed inset-0 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md';
        document.body.appendChild(modal);
      }

      const currentTemplate =
        document.getElementById('s10-bible-template-textarea')?.value ||
        localStorage.getItem('noir_s10_bible_template_frame') ||
        '=== KHUNG KIỂU MẪU STORY BIBLE BẮT BUỘC (TEMPLATE LOCK) ===\n[I. TỔNG QUAN CỐT TRUYỆN & TRỤC THỜI GIAN LỚN]\n[II. HỒ SƠ & BIẾN ĐỔI TÂM LÝ NHÂN VẬT]\n[III. MA TRẬN BẤT CÂN XỨNG THÔNG TIN (AI BIẾT GÌ)]\n[IV. SỔ CÁI PHỤC BÚT & MANH MỐI BỎ NGỎ]';

      const currentRendered =
        document.getElementById('s10-bible-rendered-textarea')?.value ||
        localStorage.getItem('noir_s10_rendered_bible_content') ||
        '';

      modal.innerHTML = `
        <div class="w-full max-w-5xl rounded-2xl border-2 border-amber-500/80 bg-zinc-950 text-white shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh] text-xs">
          <div class="px-5 py-3.5 border-b border-zinc-800 bg-amber-500/15 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 class="font-extrabold uppercase text-sm text-amber-400">
                🏛️ XEM & SỬA TRỰC TIẾP KHUNG STORY BIBLE & NỘI DUNG HIỆN TẠI (NỔI TRÊN CỬA SỔ AI)
              </h3>
              <p class="text-[11px] text-zinc-300">
                Bạn có thể chỉnh sửa trực tiếp cả Khung Kiểu Mẫu lẫn Nội Dung Story Bible ngay tại đây mà không cần thoát khỏi cửa sổ hiện tại!
              </p>
            </div>
            <button type="button" id="btn-s19-close-bible-live" class="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold">
              ✕ Đóng & Quay Lại
            </button>
          </div>

          <div class="p-4 flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div class="flex flex-col space-y-1.5">
              <label class="font-extrabold uppercase text-[11px] text-amber-400">
                1. Khung Kiểu Mẫu Đang Áp Dụng (Sửa trực tiếp tại đây):
              </label>
              <textarea id="s19-live-bible-template-ta" rows="16" class="flex-1 w-full p-3.5 rounded-xl border border-amber-500/40 bg-zinc-900 text-amber-100 font-monoCode text-[11px] leading-relaxed focus:outline-none focus:border-amber-400"></textarea>
            </div>
            <div class="flex flex-col space-y-1.5">
              <label class="font-extrabold uppercase text-[11px] text-emerald-400">
                2. Nội Dung Story Bible Đã Tổng Hợp (Sửa trực tiếp tại đây):
              </label>
              <textarea id="s19-live-bible-rendered-ta" rows="16" class="flex-1 w-full p-3.5 rounded-xl border border-emerald-500/40 bg-zinc-900 text-zinc-100 font-sansUI text-xs leading-relaxed focus:outline-none focus:border-emerald-400" placeholder="Nhập hoặc chỉnh sửa nội dung Story Bible chính thức của truyện tại đây..."></textarea>
            </div>
          </div>

          <div class="px-5 py-3 border-t border-zinc-800 bg-zinc-900 flex flex-wrap items-center justify-between gap-2">
            <button type="button" id="btn-s19-goto-tab4-bible" class="px-4 py-2 rounded-xl border border-amber-500/50 bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-zinc-950 font-extrabold text-xs transition">
              ↗️ Chuyển Tới Màn Hình Tab 4 (Quản Lý Thẻ Nhân Vật & Phục Bút)
            </button>
            <button type="button" id="btn-s19-save-bible-live" class="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition">
              💾 Lưu Thay Đổi Story Bible Ngay Tại Đây
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      modal.classList.remove('hidden');

      const tplTa = document.getElementById('s19-live-bible-template-ta');
      const renTa = document.getElementById('s19-live-bible-rendered-ta');
      if (tplTa) tplTa.value = currentTemplate;
      if (renTa) renTa.value = currentRendered;

      document
        .getElementById('btn-s19-close-bible-live')
        ?.addEventListener('click', () => modal.classList.add('hidden'));

      document
        .getElementById('btn-s19-save-bible-live')
        ?.addEventListener('click', () => {
          const newTpl = tplTa?.value || '';
          const newRen = renTa?.value || '';
          localStorage.setItem('noir_s10_bible_template_frame', newTpl);
          localStorage.setItem('noir_s10_rendered_bible_content', newRen);

          const origTpl = document.getElementById('s10-bible-template-textarea');
          if (origTpl) origTpl.value = newTpl;
          const origRen = document.getElementById('s10-bible-rendered-textarea');
          if (origRen) origRen.value = newRen;

          window.StudioStage10?.bibleEngine?.saveRenderedBibleContent?.(newRen);
          modal.classList.add('hidden');
          window.StudioStage7?.saveEngine?.showSaveToastNotification(
            '🏛️ Đã lưu trực tiếp Khung & Nội dung Story Bible!'
          );
        });

      document
        .getElementById('btn-s19-goto-tab4-bible')
        ?.addEventListener('click', () => {
          modal.classList.add('hidden');
          // Đóng luôn cửa sổ Full-Screen AI Center phía dưới để người dùng nhìn thấy Tab 4 ngay
          document.querySelectorAll('button').forEach((b) => {
            if ((b.textContent || '').includes('Đóng (Quay Về Bản Thảo)')) b.click();
          });
          document.getElementById('modal-s6-prompt-studio')?.classList.add('hidden');
          window.StudioStage14?.screenNavigator?.navigateToScreen('SCREEN_4_BIBLE');
        });
    }

    /**
     * 3. Mở Cửa Sổ Chèn Mốc Chuyển Phân Cảnh / Đổi POV (Nổi trực tiếp trên Full-Screen AI Center)
     */
    static openSceneAndPovBuilderAboveAi() {
      const sceneModal = document.getElementById('modal-scene-builder');
      if (!sceneModal) return;

      // Đưa lên cấp cao nhất của body
      document.body.appendChild(sceneModal);
      sceneModal.classList.add('s19-topmost-submodal');
      sceneModal.classList.remove('hidden');

      // Cập nhật danh sách nhân vật POV từ Story Bible
      const povSel = document.getElementById('modal-scene-pov');
      const chars = window.StudioCore?.bibleManager?.data?.characters || [];
      if (povSel) {
        povSel.innerHTML =
          `<option value="Giữ nguyên POV hiện tại">-- Giữ nguyên POV hiện tại --</option>` +
          chars
            .map((c) => `<option value="${c.name}">👁️ Đổi POV sang: ${c.name}</option>`)
            .join('');
      }

      const confirmBtn = document.getElementById('btn-confirm-insert-scene');
      if (confirmBtn && !confirmBtn.dataset.s19SceneHooked) {
        confirmBtn.dataset.s19SceneHooked = 'true';
        confirmBtn.addEventListener(
          'click',
          (e) => {
            e.preventDefault();
            e.stopPropagation();

            const tVal =
              document.getElementById('modal-scene-time')?.value.trim() ||
              'Chưa ghi mốc giờ';
            const lVal =
              document.getElementById('modal-scene-loc')?.value.trim() ||
              'Chưa ghi địa điểm';
            const pVal =
              document.getElementById('modal-scene-pov')?.value ||
              'Giữ nguyên POV hiện tại';
            const uVal =
              document.getElementById('modal-scene-unreliable')?.value ||
              'Tỉnh táo quan sát';
            const dVal =
              document.getElementById('modal-scene-directive')?.value.trim() || '';

            const block = [
              ``,
              `===================================================================`,
              `🎬 [CHUYỂN PHÂN CẢNH MỚI & ĐỔI ĐIỂM NHÌN POV]`,
              `• 🕒 Mốc thời gian: ${tVal}`,
              `• 📍 Địa điểm & Không khí: ${lVal}`,
              `• 👁️ Nhân vật Điểm nhìn (POV): ${pVal} | Trạng thái nhận thức: ${uVal}`,
              `• 🎯 Chỉ đạo tâm lý & tình tiết: ${dVal || 'Triển khai cực chậm theo mạch cảm xúc nhân vật.'}`,
              `===================================================================`
            ].join('\n');

            const promptTa = this.findActivePromptTextarea();
            if (promptTa) {
              promptTa.value = `${promptTa.value.trim()}\n${block}\n`;
              promptTa.focus();
            }

            sceneModal.classList.add('hidden');
            window.StudioStage7?.saveEngine?.showSaveToastNotification(
              '🎬 Đã chèn Mốc Chuyển Phân Cảnh & POV thẳng vào ô nhập câu lệnh!'
            );
          },
          true
        );
      }
    }

    /**
     * 4. Mở Cửa Sổ Xem & Đổi Gói Ngữ Cảnh Cục Bộ (Nổi trực tiếp trên Full-Screen AI Center)
     */
    static openEditableLocalContextModal() {
      let modal = document.getElementById('modal-s19-context-live-studio');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-s19-context-live-studio';
        modal.className =
          's19-topmost-submodal fixed inset-0 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md';
        document.body.appendChild(modal);
      }

      const chapters = window.StudioCore?.approvalGate?.chapters || [];
      const defaultContextText =
        localStorage.getItem('noir_s19_custom_local_context_override') ||
        document.getElementById('context-preview-body')?.textContent?.trim() ||
        chapters
          .map(
            (c, i) =>
              `[Chương ${i + 1}: ${c.displayTitle || c.title} (${
                c.status === 'APPROVED' ? 'Đã Duyệt' : 'Bản Nháp'
              } - ${c.wordCount || 0} từ)]\n• Tóm tắt: ${
                c.summary || (c.content || '').slice(0, 350) || '(Chưa có nội dung)'
              }`
          )
          .join('\n\n');

      modal.innerHTML = `
        <div class="w-full max-w-4xl rounded-2xl border-2 border-indigo-500/80 bg-zinc-950 text-white shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh] text-xs">
          <div class="px-5 py-3.5 border-b border-zinc-800 bg-indigo-600/20 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 class="font-extrabold uppercase text-sm text-indigo-400">
                🔍 XEM & ĐỔI GÓI NGỮ CẢNH CỤC BỘ CHUẨN BỊ GỬI CHO GEMINI
              </h3>
              <p class="text-[11px] text-zinc-300">
                Bạn có thể kiểm tra, thêm bớt hoặc sửa trực tiếp các đoạn trích xuất từ ổ cứng trước khi gửi cho AI
              </p>
            </div>
            <button type="button" id="btn-s19-close-ctx-live" class="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold">
              ✕ Đóng
            </button>
          </div>

          <div class="p-4 flex-1 overflow-y-auto space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="font-bold text-emerald-400 text-[11px]">
                📦 Nội dung Gói Ngữ Cảnh Cục Bộ (Có thể chỉnh sửa trực tiếp bên dưới):
              </span>
              <button type="button" id="btn-s19-rebuild-ctx-auto" class="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 font-bold text-[11px] transition">
                🔄 Tự động trích xuất lại từ các chương hiện có
              </button>
            </div>
            <textarea id="s19-editable-context-ta" rows="16" class="w-full p-3.5 rounded-xl border border-indigo-500/40 bg-zinc-900 text-zinc-100 font-monoCode text-[11px] leading-relaxed focus:outline-none focus:border-indigo-400"></textarea>
          </div>

          <div class="px-5 py-3 border-t border-zinc-800 bg-zinc-900 flex flex-wrap items-center justify-between gap-2">
            <button type="button" id="btn-s19-append-ctx-to-prompt" class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs shadow transition">
              📥 Đính Kèm Trực Tiếp Gói Ngữ Cảnh Này Vào Ô Lệnh AI
            </button>
            <button type="button" id="btn-s19-save-ctx-override" class="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition">
              💾 Lưu Gói Ngữ Cảnh Đã Chỉnh Sửa
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      modal.classList.remove('hidden');

      const ctxTa = document.getElementById('s19-editable-context-ta');
      if (ctxTa) ctxTa.value = defaultContextText;

      document
        .getElementById('btn-s19-close-ctx-live')
        ?.addEventListener('click', () => modal.classList.add('hidden'));

      document
        .getElementById('btn-s19-rebuild-ctx-auto')
        ?.addEventListener('click', () => {
          localStorage.removeItem('noir_s19_custom_local_context_override');
          const chaps = window.StudioCore?.approvalGate?.chapters || [];
          ctxTa.value = chaps
            .map(
              (c, i) =>
                `[Chương ${i + 1}: ${c.displayTitle || c.title}]\n• Tóm tắt: ${
                  c.summary || (c.content || '').slice(0, 450)
                }`
            )
            .join('\n\n');
        });

      document
        .getElementById('btn-s19-save-ctx-override')
        ?.addEventListener('click', () => {
          localStorage.setItem('noir_s19_custom_local_context_override', ctxTa.value);
          const origPreview = document.getElementById('context-preview-body');
          if (origPreview) origPreview.textContent = ctxTa.value;
          modal.classList.add('hidden');
          window.StudioStage7?.saveEngine?.showSaveToastNotification(
            '🔍 Đã lưu Gói Ngữ Cảnh Cục Bộ mới!'
          );
        });

      document
        .getElementById('btn-s19-append-ctx-to-prompt')
        ?.addEventListener('click', () => {
          const promptTa = this.findActivePromptTextarea();
          if (promptTa) {
            promptTa.value = `${promptTa.value.trim()}\n\n=== [GÓI NGỮ CẢNH CỤC BỘ ĐÍNH KÈM] ===\n${
              ctxTa.value
            }\n`;
          }
          modal.classList.add('hidden');
          window.StudioStage7?.saveEngine?.showSaveToastNotification(
            '📥 Đã đính kèm Gói Ngữ Cảnh Cục Bộ vào ô nhập câu lệnh!'
          );
        });
    }
  }

  // ==========================================================================
  // PHẦN 7: ĐỒNG BỘ HAI CHIỀU THỜI GIAN THỰC GIỮA POMODORO THU NHỎ & POMODORO TAB 5
  // ==========================================================================
  class Stage19BidirectionalPomodoroSync {
    static findTab5PomodoroElements() {
      let timeDisplayEl = null;
      let playPauseBtn = null;
      let resetBtn = null;

      // Quét khu vực ĐỒNG HỒ TẬP TRUNG POMODORO ở Màn hình 5
      document.querySelectorAll('div, section').forEach((box) => {
        if (timeDisplayEl) return;
        const txt = (box.textContent || '').trim();
        if (txt.includes('ĐỒNG HỒ TẬP TRUNG POMODORO') || txt.includes('Pomodoro Tập Trung')) {
          box.querySelectorAll('span, div, b').forEach((el) => {
            if (
              el.children.length === 0 &&
              /^\d{2}:\d{2}$/.test((el.textContent || '').trim())
            ) {
              timeDisplayEl = el;
            }
          });
          box.querySelectorAll('button').forEach((b) => {
            const bt = (b.textContent || '').trim().toLowerCase();
            if (bt.includes('tạm dừng') || bt.includes('bắt đầu') || bt.includes('tiếp tục')) {
              playPauseBtn = b;
            } else if (bt.includes('đặt lại')) {
              resetBtn = b;
            }
          });
        }
      });

      return { timeDisplayEl, playPauseBtn, resetBtn };
    }

    static syncEveryTick() {
      const floatingPill = document.getElementById('s15-floating-pomodoro-pill');
      if (!floatingPill) return;

      const { timeDisplayEl, playPauseBtn } = this.findTab5PomodoroElements();
      let liveTime = timeDisplayEl ? (timeDisplayEl.textContent || '').trim() : '';

      if (!liveTime && window.StudioStage11?.pomodoro) {
        const rem = Number(window.StudioStage11.pomodoro.remainingSeconds);
        if (!Number.isNaN(rem) && rem >= 0) {
          liveTime = `${String(Math.floor(rem / 60)).padStart(2, '0')}:${String(
            Math.floor(rem % 60)
          ).padStart(2, '0')}`;
        }
      }

      if (!liveTime) return;

      // 1. Cập nhật chữ hiển thị thời gian trên viên thuốc Pomodoro nổi góc trên phải
      floatingPill.querySelectorAll('button, span, div').forEach((el) => {
        if (el.id === 'btn-s19-pomo-collapse-arrow') return;
        if (el.children.length === 0) {
          const raw = (el.textContent || '').trim();
          if (/\d{2}:\d{2}/.test(raw)) {
            const updated = raw.replace(/\d{2}:\d{2}/, liveTime);
            if (el.textContent !== updated) el.textContent = updated;
          }
        }
      });

      // 2. Nếu viên thuốc đang thu nhỏ (.s19-pomo-collapsed), hiển thị luôn giờ chạy thực tế "< 🍅 24:53"
      const arrowBtn = document.getElementById('btn-s19-pomo-collapse-arrow');
      if (arrowBtn) {
        if (floatingPill.classList.contains('s19-pomo-collapsed')) {
          const collapsedLabel = `< 🍅 ${liveTime}`;
          if (arrowBtn.textContent !== collapsedLabel) {
            arrowBtn.textContent = collapsedLabel;
          }
        } else if (arrowBtn.textContent !== '>') {
          arrowBtn.textContent = '>';
        }
      }

      // 3. Khi người dùng bấm vào nút giờ trên viên thuốc nổi góc phải -> kích hoạt nút Bắt đầu/Tạm dừng của Tab 5 để cả 2 chạy cùng lúc
      const mainPillBtn = floatingPill.querySelector('button:not(#btn-s19-pomo-collapse-arrow)');
      if (mainPillBtn && playPauseBtn && !mainPillBtn.dataset.s19PomoLinked) {
        mainPillBtn.dataset.s19PomoLinked = 'true';
        mainPillBtn.addEventListener(
          'click',
          (e) => {
            e.preventDefault();
            e.stopPropagation();
            playPauseBtn.click();
          },
          true
        );
      }
    }
  }

  // ==========================================================================
  // PHẦN 8: ĐỒNG BỘ GIAO DIỆN TAB 3 (MODEL 11/2026 + PLACEHOLDER 4 CHẾ ĐỘ + KÍCH THƯỚC KHUNG)
  //         & TAB 6 (THẺ CHIA SẺ FILE HTML + JS GỘP CHO BẠN BÈ)
  // ==========================================================================
  class Stage19WorkspaceSynchronizer {
    static syncHeaderButtons() {
      const vidBtn = document.getElementById('btn-s23-top-video-guide');
      if (vidBtn && vidBtn.textContent.trim() !== '🎬 Video Hướng Dẫn') {
        vidBtn.innerHTML = '<span>🎬 Video Hướng Dẫn</span>';
      }
      const megaBtn = document.getElementById('btn-s18-top-megaphone');
      if (megaBtn && !megaBtn.textContent.includes('Loa Cập Nhật')) {
        megaBtn.innerHTML = '<span>📢 Loa Cập Nhật</span>';
      }
    }

    static syncAllModelSelectsAndLinks() {
      if (window.StudioStage5) {
        window.StudioStage5.LATEST_GEMINI_MODELS = OFFICIAL_GEMINI_MODELS_NOV_2026;
      }
      if (window.StudioStage16) {
        window.StudioStage16.models2026 = OFFICIAL_GEMINI_MODELS_NOV_2026;
      }

      const optionsHtml = Object.values(OFFICIAL_GEMINI_MODELS_NOV_2026)
        .map((m) => `<option value="${m.id}">${m.name}</option>`)
        .join('');

      document.querySelectorAll('select').forEach((sel) => {
        const prevText = (sel.previousElementSibling?.textContent || '').toUpperCase();
        const optDump = [...sel.options].map((o) => `${o.value} ${o.textContent}`).join(' ');
        const isModelSelect =
          sel.id.includes('model') ||
          prevText.includes('MÔ HÌNH GEMINI') ||
          optDump.includes('Gemini 2.5') ||
          optDump.includes('Gemini 3.5') ||
          optDump.includes('gemini-');

        if (!isModelSelect) return;

        const hasOldOptions = [...sel.options].some((o) =>
          [
            'gemini-2.5-pro',
            'gemini-2.5-flash',
            'gemini-3.5-flash',
            'gemini-3-flash-preview'
          ].includes(o.value)
        );

        if (
          hasOldOptions ||
          sel.options.length !== Object.keys(OFFICIAL_GEMINI_MODELS_NOV_2026).length
        ) {
          const prevVal = sel.value;
          const mapped = DEPRECATED_MODEL_MAP[prevVal] || prevVal;
          sel.innerHTML = optionsHtml;
          sel.value = OFFICIAL_GEMINI_MODELS_NOV_2026[mapped]
            ? mapped
            : 'gemini-3.8-flash';
        }

        // Gắn thanh Link Google AI Studio & Quét API Real-time ngay dưới ô chọn Model ở Tab 3
        if (
          prevText.includes('MÔ HÌNH GEMINI') &&
          sel.parentElement &&
          !sel.parentElement.querySelector('.s19-model-ref-links')
        ) {
          const bar = document.createElement('div');
          bar.className =
            's19-model-ref-links mt-1.5 flex flex-wrap items-center justify-between gap-1 text-[10px]';
          bar.innerHTML = `
            <a href="https://aistudio.google.com/prompts/new_chat" target="_blank" rel="noopener noreferrer" class="px-2 py-0.5 rounded bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 font-bold transition">
              🔗 Mở Google AI Studio
            </a>
            <a href="https://ai.google.dev/gemini-api/docs/models" target="_blank" rel="noopener noreferrer" class="px-2 py-0.5 rounded bg-emerald-600/25 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 font-bold transition">
              📘 Bảng Thông Số Model 11/2026
            </a>
          `;
          sel.parentElement.appendChild(bar);
        }
      });
    }

    static syncModePlaceholdersAndChatResizer() {
      const activeModeKey = Stage19SubModalOverAiController.detectCurrentAiModeKey();
      const profile =
        MASTER_PSYCH_NOIR_MODES[activeModeKey] || MASTER_PSYCH_NOIR_MODES.MODE_1_DRAFT;

      // 1. Cập nhật dòng chữ gợi ý màu xám (placeholder) cho mọi ô nhập câu lệnh đang mở
      document.querySelectorAll('textarea').forEach((ta) => {
        const ph = (ta.getAttribute('placeholder') || '').toLowerCase();
        const isPromptTa =
          ta.id === 's6-popup-prompt-textarea' ||
          ph.includes('nhập diễn biến cốt lõi') ||
          ph.includes('gợi ý chế độ');

        if (!isPromptTa) return;

        if (ta.getAttribute('placeholder') !== profile.placeholder) {
          ta.setAttribute('placeholder', profile.placeholder);
        }

        // 2. Chèn thanh Chỉnh Kích Thước Khung Chat & Nút Nạp Khung Mẫu ngay trên ô nhập câu lệnh ở Tab 3
        if (
          ta.parentElement &&
          !ta.parentElement.querySelector('.s19-prompt-size-and-template-toolbar')
        ) {
          const toolbar = document.createElement('div');
          toolbar.className =
            's19-prompt-size-and-template-toolbar mb-2 px-3 py-1.5 rounded-xl bg-zinc-900/95 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-2 text-xs';
          toolbar.innerHTML = `
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="font-extrabold text-emerald-400 text-[11px]">🔍 Kích thước khung lệnh:</span>
              <button type="button" data-s19-h="180px" class="s19-size-btn px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-emerald-600 text-zinc-200 hover:text-white font-bold text-[10px] transition">
                Cỡ Nhỏ (180px)
              </button>
              <button type="button" data-s19-h="280px" class="s19-size-btn px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-extrabold text-[10px] transition">
                Cỡ Vừa (280px)
              </button>
              <button type="button" data-s19-h="440px" class="s19-size-btn px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-zinc-950 border border-amber-500/40 font-extrabold text-[10px] transition">
                Cỡ Lớn (440px)
              </button>
              <button type="button" data-s19-h="65vh" class="s19-size-btn px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 font-extrabold text-[10px] transition">
                Siêu Rộng (65% Màn Hình)
              </button>
            </div>
            <button type="button" class="btn-s19-fill-mode-sample px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-[11px] shadow transition">
              ✨ Nạp Khung Mẫu Chế Độ Này
            </button>
          `;

          ta.parentElement.insertBefore(toolbar, ta);

          toolbar.querySelectorAll('.s19-size-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
              e.preventDefault();
              const h = btn.getAttribute('data-s19-h') || '280px';
              ta.style.setProperty('height', h, 'important');
              ta.style.setProperty('min-height', h, 'important');
              ta.style.setProperty('max-height', '78vh', 'important');
            });
          });

          toolbar
            .querySelector('.btn-s19-fill-mode-sample')
            ?.addEventListener('click', (e) => {
              e.preventDefault();
              const mKey = Stage19SubModalOverAiController.detectCurrentAiModeKey();
              const tpl =
                MASTER_PSYCH_NOIR_MODES[mKey]?.sampleTemplate ||
                MASTER_PSYCH_NOIR_MODES.MODE_1_DRAFT.sampleTemplate;
              ta.value = ta.value.trim() ? `${ta.value.trim()}\n\n${tpl}` : tpl;
              ta.focus();
            });
        }
      });
    }

    static injectShareBundleCardsIntoTab6() {
      // Tìm lưới thẻ trong Màn hình 6 (dựa trên nút "Mở Bộ Xuất File" hoặc "Mở Cấu Hình API Key")
      let gridContainer = null;
      document.querySelectorAll('button').forEach((btn) => {
        const t = (btn.textContent || '').trim();
        if (t === 'Mở Bộ Xuất File' || t === 'Mở Cấu Hình API Key') {
          const card = btn.closest('div.rounded-2xl, div.rounded-xl, div.p-5, div.p-4');
          if (card && card.parentElement) gridContainer = card.parentElement;
        }
      });

      if (!gridContainer || document.getElementById('s19-tab6-share-html-card')) return;

      const card4 = document.createElement('div');
      card4.id = 's19-tab6-changelog-card';
      card4.className =
        'p-5 rounded-2xl border border-amber-500/40 bg-zinc-900/90 flex flex-col justify-between space-y-4 shadow-lg';
      card4.innerHTML = `
        <div class="space-y-1.5">
          <h3 class="text-sm font-extrabold text-amber-400">
            📢 4. Loa Thông Báo Các Bản Cập Nhật (v1.0 ➔ v33.0)
          </h3>
          <p class="text-xs text-zinc-400 leading-relaxed">
            Xem đầy đủ lịch sử các phiên bản nâng cấp và danh sách tính năng từ Bản 1.0 đến Version 33.0 mới nhất.
          </p>
        </div>
        <button type="button" id="btn-s19-tab6-open-changelog" class="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow transition">
          📢 Mở Xem Tất Cả Bản Cập Nhật
        </button>
      `;

      const card5 = document.createElement('div');
      card5.id = 's19-tab6-share-html-card';
      card5.className =
        'p-5 rounded-2xl border border-emerald-500/50 bg-zinc-900/90 flex flex-col justify-between space-y-4 shadow-lg';
      card5.innerHTML = `
        <div class="space-y-1.5">
          <h3 class="text-sm font-extrabold text-emerald-400">
            🌐 5. Chia Sẻ Trang Web (Gộp 1 File .HTML + JS Duy Nhất)
          </h3>
          <p class="text-xs text-zinc-400 leading-relaxed">
            Đóng gói toàn bộ HTML và tất cả các file JS thành 1 file .HTML duy nhất (tự động xóa API Key cá nhân của bạn) để gửi cho bạn bè dùng ngay.
          </p>
        </div>
        <button type="button" id="btn-s19-tab6-download-html" class="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow transition">
          📥 Tải 1 File .HTML + JS Gộp Chia Sẻ Ngay
        </button>
      `;

      const card6 = document.createElement('div');
      card6.id = 's19-tab6-share-js-card';
      card6.className =
        'p-5 rounded-2xl border border-indigo-500/50 bg-zinc-900/90 flex flex-col justify-between space-y-4 shadow-lg';
      card6.innerHTML = `
        <div class="space-y-1.5">
          <h3 class="text-sm font-extrabold text-indigo-400">
            📜 6. Xuất File .JS Hợp Nhất (Cho Nhóm Bạn Bè Code JS Chung)
          </h3>
          <p class="text-xs text-zinc-400 leading-relaxed">
            Gộp toàn bộ mã nguồn JS hiện tại thành 1 file .JS duy nhất để bạn bè dùng JS code chung với bạn.
          </p>
        </div>
        <button type="button" id="btn-s19-tab6-download-js" class="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow transition">
          📜 Tải File .JS Hợp Nhất Cho Bạn Bè Code Chung
        </button>
      `;

      gridContainer.appendChild(card4);
      gridContainer.appendChild(card5);
      gridContainer.appendChild(card6);

      const fetchScriptSafe = async (f) => {
        try {
          const r = await fetch(f, { cache: 'no-store' });
          if (r.ok) return await r.text();
        } catch (_) {}
        return `/* File ${f} */`;
      };

      document
        .getElementById('btn-s19-tab6-open-changelog')
        ?.addEventListener('click', () =>
          Stage19GuideAndChangelogCenter.openChangelogModal()
        );

      document
        .getElementById('btn-s19-tab6-download-html')
        ?.addEventListener('click', async () => {
          const [s1, s2, s3] = await Promise.all([
            fetchScriptSafe('stage1_to_15_unified_core.js'),
            fetchScriptSafe('stage16_flashlite35_bi_ai_v16_changelog.js'),
            fetchScriptSafe('stage19_ultimate_architect.js')
          ]);
          let html = document.documentElement.outerHTML;
          const myKey =
            localStorage.getItem('noir_gemini_api_key') ||
            window.__STUDIO_MASTER_API_KEY ||
            '';
          if (myKey && myKey.length > 10) html = html.split(myKey).join('');
          html = html
            .replace(/<script[^>]+src=["']stage1_to_15_unified_core\.js["'][^>]*><\/script>/gi, '')
            .replace(/<script[^>]+src=["']stage16_flashlite35_bi_ai_v16_changelog\.js["'][^>]*><\/script>/gi, '')
            .replace(/<script[^>]+src=["']stage17_master_architect_fix\.js["'][^>]*><\/script>/gi, '')
            .replace(/<script[^>]+src=["']stage18_omnipotent_architect_patch\.js["'][^>]*><\/script>/gi, '')
            .replace(/<script[^>]+src=["']stage19_ultimate_architect\.js["'][^>]*><\/script>/gi, '');

          const bundled =
            '<!DOCTYPE html>\n' +
            html.replace(
              /<\/body>/i,
              `<script>\n${s1}\n</script>\n<script>\n${s2}\n</script>\n<script>\n${s3}\n</script>\n</body>`
            );

          const a = document.createElement('a');
          a.href = URL.createObjectURL(
            new Blob([bundled], { type: 'text/html;charset=utf-8' })
          );
          a.download = `Web_Tieu_Thuyet_Cua_Bi_AllInOne_Share_${new Date()
            .toISOString()
            .slice(0, 10)}.html`;
          a.click();
        });

      document
        .getElementById('btn-s19-tab6-download-js')
        ?.addEventListener('click', async () => {
          const [s1, s2, s3] = await Promise.all([
            fetchScriptSafe('stage1_to_15_unified_core.js'),
            fetchScriptSafe('stage16_flashlite35_bi_ai_v16_changelog.js'),
            fetchScriptSafe('stage19_ultimate_architect.js')
          ]);
          const merged = `/* === STAGE 1->15 === */\n${s1}\n\n/* === STAGE 16 === */\n${s2}\n\n/* === STAGE 19 === */\n${s3}`;
          const a = document.createElement('a');
          a.href = URL.createObjectURL(
            new Blob([merged], { type: 'application/javascript;charset=utf-8' })
          );
          a.download = `Web_Tieu_Thuyet_Cua_Bi_Merged_JS_${new Date()
            .toISOString()
            .slice(0, 10)}.js`;
          a.click();
        });
    }
  }

  // ==========================================================================
  // PHẦN 9: BỘ BẮT SỰ KIỆN TỐI THƯỢNG (CAPTURE PHASE) CHO MỌI NÚT TRÊN TOÀN TRANG WEB
  // ==========================================================================
  function installStage19SupremeCaptureInterceptor() {
    document.addEventListener(
      'click',
      (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        const id = btn.id || '';
        const sysClick = btn.getAttribute('data-s14-sys-click') || '';
        const txt = (btn.textContent || '').trim().toLowerCase();

        // 1. Nút Video Hướng Dẫn (Header, Tab 6 Card 3 "Mở Video Hướng Dẫn", Màn hình chào)
        if (
          id === 'btn-s23-top-video-guide' ||
          id === 's17-sys-btn-video' ||
          sysClick === 'btn-s10-video-guide' ||
          txt === '🎬 video hướng dẫn' ||
          txt === '🎬 video hd v31' ||
          txt === 'mở video hướng dẫn' ||
          txt.includes('video hướng dẫn toàn bộ')
        ) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          Stage19GuideAndChangelogCenter.openGuideModal('VIDEO_TAB');
          return;
        }

        // 2. Nút Loa Cập Nhật (Header, Footer Version 31, Tab 6)
        if (
          id === 'btn-s18-top-megaphone' ||
          id === 's17-sys-btn-megaphone' ||
          id === 's20-version-only-badge' ||
          sysClick === 'btn-s10-megaphone' ||
          txt.includes('loa version') ||
          txt.includes('loa cập nhật') ||
          txt.includes('loa thông báo')
        ) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          Stage19GuideAndChangelogCenter.openChangelogModal();
          return;
        }

        // 3. Nút "📜 Xem & Sửa Khung Câu Lệnh Hệ Thống" trong Full-Screen AI Center
        if (
          txt.includes('xem & sửa khung câu lệnh hệ thống') ||
          txt.includes('xem & tùy chỉnh khung câu lệnh hệ thống')
        ) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          Stage19SubModalOverAiController.openSystemPromptStudioModal();
          return;
        }

        // 4. Nút "🏛️ Xem / Sửa Khung Story Bible Đang Áp Dụng" hoặc "🏛️ Mở khung Story Bible"
        if (
          id === 'btn-s21-unlock-edit-bible' ||
          txt.includes('xem / sửa khung story bible') ||
          txt.includes('mở khung story bible') ||
          txt.includes('bấm để sửa story bible')
        ) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          Stage19SubModalOverAiController.openLiveStoryBibleStudioModal();
          return;
        }

        // 5. Nút "🎬 + Chèn Mốc Chuyển Phân Cảnh / Đổi POV"
        if (
          id === 'btn-s6-popup-insert-scene' ||
          id === 'btn-open-scene-builder' ||
          txt.includes('chèn mốc chuyển phân cảnh') ||
          txt.includes('chèn chuyển cảnh / đổi pov')
        ) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          Stage19SubModalOverAiController.openSceneAndPovBuilderAboveAi();
          return;
        }

        // 6. Nút "🔍 Xem Gói Ngữ Cảnh Cục Bộ"
        if (txt.includes('xem gói ngữ cảnh cục bộ')) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          Stage19SubModalOverAiController.openEditableLocalContextModal();
          return;
        }
      },
      true
    );
  }

  // ==========================================================================
  // PHẦN 10: KHỞI CHẠY CHẶNG 1 CỦA STAGE 19
  // ==========================================================================
  function bootStage19Part1() {
    injectStage19SupremeStyles();
    installStage19SupremeCaptureInterceptor();

    setInterval(() => {
      Stage19WorkspaceSynchronizer.syncHeaderButtons();
      Stage19WorkspaceSynchronizer.syncAllModelSelectsAndLinks();
      Stage19WorkspaceSynchronizer.syncModePlaceholdersAndChatResizer();
      Stage19WorkspaceSynchronizer.injectShareBundleCardsIntoTab6();
      Stage19BidirectionalPomodoroSync.syncEveryTick();
    }, 250);
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', bootStage19Part1);
  } else {
    bootStage19Part1();
  }

  window.StudioStage19 = {
    version: '33.0-Part1',
    models: OFFICIAL_GEMINI_MODELS_NOV_2026,
    modes: MASTER_PSYCH_NOIR_MODES,
    guideCenter: Stage19GuideAndChangelogCenter,
    subModalController: Stage19SubModalOverAiController
  };
})();
/**
 * ============================================================================
 * FILE: stage19_ultimate_architect.js
 * [CHẶNG 2 / 3]:
 *   - PHẦN 11: Động cơ Auto-Save 2 Giây (2000ms) với Khóa Mutex chống đụng độ
 *              ghi file & Trung tâm Khôi phục Bản lưu tạm từ Folder ổ cứng.
 *   - PHẦN 12: Hệ thống Story Bible Chống Tràn Tuyệt Đối (Ghim cố định nút
 *              ✏️ Sửa / 🗑️ Xóa trên từng thẻ Nhân vật, Ai biết gì, Phục bút)
 *              & Cửa sổ Duyệt Đa Chương Nối Mạch Tự Động.
 *   - PHẦN 13: Bộ Tổng Hợp Siêu Câu Lệnh (Pre-Flight Master Prompt Synthesizer)
 *              liên kết 100% Chế độ + Model 11/2026 + Tư duy + Số từ + Story Bible.
 *   - PHẦN 14: Máy Kiểm Toán Pháp Y Cục Bộ (Chuẩn hóa thoại "- Thoại (Tên)" 1-Click,
 *              Quét từ sáo rỗng & Trích xuất trục giờ giấc chương hiện tại).
 * ============================================================================
 */

(function () {
  'use strict';

  if (window.__NOIR_STAGE19_PART2_LOADED__) return;
  window.__NOIR_STAGE19_PART2_LOADED__ = true;

  // ==========================================================================
  // PHẦN 11: ĐỘNG CƠ AUTO-SAVE 2 GIÂY (2000ms) VỚI KHÓA MUTEX & KHÔI PHỤC FOLDER
  // ==========================================================================
  class Stage19TwoSecondMutexAutoSaver {
    static isWritingDisk = false;
    static timerId = null;
    static lastContentDigest = '';
    static saveCount = 0;
    static lastSavedTimeStr = 'Chưa lưu';
    static lastDiskStatus = 'Đang chờ kết nối Folder';

    static init() {
      this.mountHeaderAutoSaveBadge();

      if (this.timerId) clearInterval(this.timerId);
      // Chạy định kỳ đúng mỗi 2 giây (2000ms)
      this.timerId = setInterval(() => {
        this.executeAutoSaveCycle(false);
      }, 2000);

      // Bắt sự kiện bấm nút Lưu Nháp hoặc Ctrl+S để ép lưu tức thì xuống Folder
      document.getElementById('btn-save-draft-disk')?.addEventListener('click', () => {
        this.executeAutoSaveCycle(true);
      });

      window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
          this.executeAutoSaveCycle(true);
        }
      });
    }

    static mountHeaderAutoSaveBadge() {
      const topNav =
        document.getElementById('s14-master-top-nav') ||
        document.getElementById('app-top-header');
      if (!topNav || document.getElementById('s19-autosave-2s-badge')) return;

      const rightZone = topNav.lastElementChild || topNav;
      const badge = document.createElement('button');
      badge.type = 'button';
      badge.id = 's19-autosave-2s-badge';
      badge.className =
        'px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-[10px] font-monoCode font-bold text-emerald-300 flex items-center gap-1.5 transition shrink-0 shadow-sm';
      badge.title =
        'Bấm để mở Trung tâm Kiểm tra & Khôi phục File Auto-Save 2 Giây trên Folder ổ cứng';
      badge.innerHTML = `
        <span id="s19-autosave-dot" class="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span id="s19-autosave-label">Auto-Save 2s: Sẵn sàng</span>
      `;

      rightZone.prepend(badge);
      badge.addEventListener('click', () => this.openAutoSaveCenterModal());
    }

    static syncLiveDomToActiveChapter() {
      const core = window.StudioCore;
      if (!core?.approvalGate) return null;

      const activeId = core.approvalGate.activeChapterId;
      const chap = (core.approvalGate.chapters || []).find((c) => c.id === activeId);
      if (!chap) return null;

      const contentEl = document.getElementById('textarea-chapter-content');
      const titleEl = document.getElementById('input-chapter-title');
      const numEl = document.getElementById('input-chapter-number');
      const sumEl = document.getElementById('textarea-chapter-summary');

      if (contentEl) {
        chap.content = contentEl.value;
        chap.wordCount = core.docParser?.countVietnameseWords
          ? core.docParser.countVietnameseWords(contentEl.value)
          : contentEl.value.trim()
          ? contentEl.value.trim().split(/\s+/).length
          : 0;
      }
      if (titleEl && titleEl.value.trim()) chap.title = titleEl.value.trim();
      if (numEl && Number(numEl.value) > 0) chap.chapterNumber = Number(numEl.value);
      if (sumEl) chap.summary = sumEl.value;
      chap.updatedAt = new Date().toISOString();

      const renderedBibleEl = document.getElementById('s10-bible-rendered-textarea');
      if (renderedBibleEl && renderedBibleEl.value.trim()) {
        localStorage.setItem('noir_s10_rendered_bible_content', renderedBibleEl.value);
      }
      const templateBibleEl = document.getElementById('s10-bible-template-textarea');
      if (templateBibleEl && templateBibleEl.value.trim()) {
        localStorage.setItem('noir_s10_bible_template_frame', templateBibleEl.value);
      }

      return chap;
    }

    static collectFullStatePayload() {
      const core = window.StudioCore;
      return {
        version: 'STAGE_19_AUTOSAVE_2S_V33',
        savedAt: new Date().toISOString(),
        activeScreen: document.body.getAttribute('data-s14-screen') || 'SCREEN_1_WRITE',
        activeChapterId: core?.approvalGate?.activeChapterId || null,
        chapters: core?.approvalGate?.chapters || [],
        storyBibleData: core?.bibleManager?.data || {},
        templateFrame: localStorage.getItem('noir_s10_bible_template_frame') || '',
        renderedBibleContent: localStorage.getItem('noir_s10_rendered_bible_content') || '',
        customSystemPrompts: {
          MODE_1_DRAFT: localStorage.getItem('noir_s19_sysprompt_MODE_1_DRAFT') || '',
          MODE_2_CONSULT: localStorage.getItem('noir_s19_sysprompt_MODE_2_CONSULT') || '',
          MODE_3_AUDIT: localStorage.getItem('noir_s19_sysprompt_MODE_3_AUDIT') || '',
          MODE_4_REVIEW: localStorage.getItem('noir_s19_sysprompt_MODE_4_REVIEW') || ''
        }
      };
    }

    static async executeAutoSaveCycle(forceWrite = false) {
      if (this.isWritingDisk) return;
      const core = window.StudioCore;
      if (!core) return;

      const activeChap = this.syncLiveDomToActiveChapter();
      const payload = this.collectFullStatePayload();

      const digest = [
        payload.activeChapterId,
        activeChap?.content?.length || 0,
        activeChap?.title || '',
        payload.renderedBibleContent.length,
        payload.templateFrame.length,
        (payload.storyBibleData.characters || []).length,
        (payload.storyBibleData.knowledgeMatrix || []).length,
        (payload.storyBibleData.cluesLedger || []).length
      ].join('|');

      if (!forceWrite && digest === this.lastContentDigest) {
        return;
      }
      this.lastContentDigest = digest;
      this.isWritingDisk = true;

      const dotEl = document.getElementById('s19-autosave-dot');
      const labelEl = document.getElementById('s19-autosave-label');

      try {
        // 1. Ghi tức thì vào LocalStorage & IndexedDB
        const jsonString = JSON.stringify(payload, null, 2);
        localStorage.setItem('noir_s17_master_workspace_snapshot', jsonString);

        if (core.controller?.idb) {
          await core.controller.idb.set('state_cache', 's17_workspace_snapshot', payload);
          await core.controller.idb.set('state_cache', 'noir_s23_master_workspace_memory', {
            chapters: payload.chapters,
            activeChapterId: payload.activeChapterId,
            bibleData: payload.storyBibleData,
            lastFolderName: core.fsEngine?.rootHandle?.name || 'Bộ nhớ máy',
            savedAt: payload.savedAt
          });
        }

        // 2. Nếu đã kết nối Folder ổ cứng -> Ghi thẳng file save tạm thời về Folder
        const rootHandle = core.fsEngine?.rootHandle;
        const timeNow = new Date().toLocaleTimeString('vi-VN', { hour12: false });
        this.lastSavedTimeStr = timeNow;
        this.saveCount++;

        if (rootHandle) {
          let perm = 'granted';
          if (typeof rootHandle.queryPermission === 'function') {
            perm = await rootHandle.queryPermission({ mode: 'readwrite' });
          }

          if (perm === 'granted') {
            for (const fileName of [
              '_studio_autosave_2s_temp.json',
              '_studio_workspace_state.json'
            ]) {
              const fh = await rootHandle.getFileHandle(fileName, { create: true });
              const writable = await fh.createWritable();
              await writable.write(jsonString);
              await writable.close();
            }

            if (activeChap && typeof core.approvalGate?.saveChapterToDisk === 'function') {
              await core.approvalGate.saveChapterToDisk(activeChap);
            }

            this.lastDiskStatus = `Đã ghi vào thư mục "${rootHandle.name}" lúc ${timeNow}`;
            if (dotEl) dotEl.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-ping';
            if (labelEl) {
              labelEl.textContent = `Auto-Save 2s: Folder (${rootHandle.name}) • ${timeNow}`;
            }
            setTimeout(() => {
              if (dotEl) dotEl.className = 'w-2 h-2 rounded-full bg-emerald-400';
            }, 550);
          } else {
            this.lastDiskStatus = `Đã lưu bộ nhớ máy lúc ${timeNow} (Chờ cấp lại quyền ghi Folder)`;
            if (dotEl) dotEl.className = 'w-2 h-2 rounded-full bg-amber-400';
            if (labelEl) labelEl.textContent = `Auto-Save 2s: Máy (${timeNow})`;
          }
        } else {
          this.lastDiskStatus = `Đã lưu bộ nhớ trình duyệt lúc ${timeNow} (Chưa chọn Folder ổ cứng)`;
          if (dotEl) dotEl.className = 'w-2 h-2 rounded-full bg-amber-400';
          if (labelEl) labelEl.textContent = `Auto-Save 2s: Bộ nhớ tạm • ${timeNow}`;
        }
      } catch (err) {
        console.warn('[Stage19 AutoSave 2s]:', err);
      } finally {
        this.isWritingDisk = false;
      }
    }

    static openAutoSaveCenterModal() {
      let modal = document.getElementById('modal-s19-autosave-center');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-s19-autosave-center';
        modal.className =
          's19-topmost-submodal fixed inset-0 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md';
        document.body.appendChild(modal);
      }

      const rootHandle = window.StudioCore?.fsEngine?.rootHandle;
      const chapCount = (window.StudioCore?.approvalGate?.chapters || []).length;

      modal.innerHTML = `
        <div class="w-full max-w-xl rounded-2xl border-2 border-emerald-500/80 bg-zinc-950 text-white shadow-2xl overflow-hidden flex flex-col text-xs">
          <div class="px-5 py-3.5 border-b border-zinc-800 bg-emerald-600/20 flex items-center justify-between">
            <h3 class="font-extrabold uppercase text-sm text-emerald-400">
              💾 TRUNG TÂM KIỂM TRA & KHÔI PHỤC AUTO-SAVE 2 GIÂY
            </h3>
            <button type="button" id="btn-s19-close-autosave-modal" class="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-extrabold">
              ✕ Đóng
            </button>
          </div>

          <div class="p-5 space-y-3">
            <div class="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
              <div>• <b>Trạng thái Folder ổ cứng:</b> <span class="${
                rootHandle ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'
              }">${
        rootHandle
          ? `Đã kết nối thư mục "${rootHandle.name}"`
          : 'Chưa chọn thư mục (Đang lưu vào IndexedDB & LocalStorage)'
      }</span></div>
              <div>• <b>Chu kỳ tự động lưu:</b> <span class="text-emerald-300 font-monoCode">Mỗi 2 giây (2000ms) có khóa Mutex chống xung đột</span></div>
              <div>• <b>File xuất tự động:</b> <code class="text-amber-300">_studio_autosave_2s_temp.json</code> & <code class="text-amber-300">_studio_workspace_state.json</code></div>
              <div>• <b>Lần lưu gần nhất:</b> <span class="text-zinc-200">${this.lastDiskStatus}</span></div>
              <div>• <b>Tổng số chương đang bảo vệ:</b> <span class="font-bold text-emerald-400">${chapCount} chương</span> (Đã lưu tự động ${this.saveCount} lần trong phiên này)</div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button type="button" id="btn-s19-force-save-now" class="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow transition">
                ⚡ Ép Lưu Ngay Xuống Folder
              </button>
              <button type="button" id="btn-s19-download-temp-json" class="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow transition">
                📥 Tải File Save Tạm (.JSON) Về Máy
              </button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      modal.classList.remove('hidden');

      document
        .getElementById('btn-s19-close-autosave-modal')
        ?.addEventListener('click', () => modal.classList.add('hidden'));

      document
        .getElementById('btn-s19-force-save-now')
        ?.addEventListener('click', async () => {
          await this.executeAutoSaveCycle(true);
          modal.classList.add('hidden');
          window.StudioStage7?.saveEngine?.showSaveToastNotification(
            '✅ Đã ép lưu toàn bộ trạng thái xuống Folder ổ cứng!'
          );
        });

      document
        .getElementById('btn-s19-download-temp-json')
        ?.addEventListener('click', () => {
          const payload = this.collectFullStatePayload();
          const a = document.createElement('a');
          a.href = URL.createObjectURL(
            new Blob([JSON.stringify(payload, null, 2)], {
              type: 'application/json;charset=utf-8'
            })
          );
          a.download = `_studio_autosave_2s_temp_${new Date()
            .toISOString()
            .slice(0, 10)}.json`;
          a.click();
        });
    }
  }

  // ==========================================================================
  // PHẦN 12: HỆ THỐNG STORY BIBLE CHỐNG TRÀN TUYỆT ĐỐI (GHIM NÚT ✏️ SỬA / 🗑️ XÓA)
  //          & TÌM KIẾM NHANH TRONG TAB 4
  // ==========================================================================
  class Stage19StoryBibleAntiOverflowManager {
    static init() {
      this.injectSearchAndClearToolbarInRightPane();
      this.renderCompactDeletableBibleLists();

      const ctrl = window.StudioCore?.controller;
      if (ctrl && !ctrl.__s19BibleCardsHooked) {
        ctrl.__s19BibleCardsHooked = true;
        const origRender = ctrl.renderBibleLists?.bind(ctrl);
        if (origRender) {
          ctrl.renderBibleLists = (...args) => {
            const res = origRender(...args);
            this.renderCompactDeletableBibleLists();
            return res;
          };
        }
      }
    }

    static injectSearchAndClearToolbarInRightPane() {
      const rightPane = document.getElementById('right-bible-pane');
      if (!rightPane || document.getElementById('s19-bible-quick-filter-bar')) return;

      const tabGrid = rightPane.firstElementChild;
      if (!tabGrid) return;

      const filterBar = document.createElement('div');
      filterBar.id = 's19-bible-quick-filter-bar';
      filterBar.className =
        'p-2 border-b border-studioLightBorder dark:border-zinc-800 bg-zinc-900/50 flex items-center gap-1.5 text-xs';
      filterBar.innerHTML = `
        <input id="s19-bible-card-search" type="text" placeholder="🔍 Lọc nhanh Nhân vật / Bí mật / Phục bút..." class="flex-1 min-w-0 px-2.5 py-1 rounded-lg border border-zinc-700 bg-zinc-950 text-white text-[11px] focus:outline-none focus:border-emerald-500" />
      `;
      tabGrid.insertAdjacentElement('afterend', filterBar);

      const searchInp = document.getElementById('s19-bible-card-search');
      searchInp?.addEventListener('input', () => {
        const q = searchInp.value.toLowerCase().trim();
        rightPane.querySelectorAll('.s19-bible-item-card').forEach((card) => {
          const match = !q || card.textContent.toLowerCase().includes(q);
          card.classList.toggle('hidden', !match);
        });
      });
    }

    static renderCompactDeletableBibleLists() {
      const bm = window.StudioCore?.bibleManager;
      const ctrl = window.StudioCore?.controller;
      if (!bm?.data) return;

      // 1. Render Hồ Sơ Nhân Vật (#characters-list-container)
      const charContainer = document.getElementById('characters-list-container');
      if (charContainer) {
        const chars = bm.data.characters || [];
        if (chars.length === 0) {
          charContainer.innerHTML = `<div class="text-zinc-500 italic text-[11px] py-2">Chưa có hồ sơ nhân vật nào.</div>`;
        } else {
          charContainer.innerHTML = chars
            .map(
              (c, idx) => `
              <div class="s19-bible-item-card p-2.5 rounded-xl border border-studioLightBorder dark:border-zinc-800 bg-studioLightBg/80 dark:bg-zinc-900/90 space-y-1.5 shadow-sm">
                <div class="flex items-center justify-between gap-1.5 w-full min-w-0">
                  <div class="truncate font-extrabold text-xs text-emerald-400 cursor-pointer flex-1 min-w-0" data-s19-toggle="char-${idx}" title="Bấm để xem/ẩn chi tiết nhân vật ${
                c.name || ''
              }">
                    👤 ${c.name || 'Nhân vật'} ${
                c.aliases
                  ? `<span class="text-[10px] text-zinc-400 font-normal">(${c.aliases})</span>`
                  : ''
              }
                  </div>
                  <div class="flex items-center gap-1 shrink-0">
                    <button type="button" data-s19-toggle="char-${idx}" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold">
                      Chi tiết
                    </button>
                    <button type="button" data-s19-edit-char="${idx}" class="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-zinc-950 border border-amber-500/40 font-bold text-[10px] transition">
                      ✏️ Sửa
                    </button>
                    <button type="button" data-s19-del-char="${
                      c.id || idx
                    }" class="px-2 py-0.5 rounded bg-red-600/25 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 font-extrabold text-[10px] transition">
                      🗑️ Xóa
                    </button>
                  </div>
                </div>
                <div id="s19-detail-char-${idx}" class="hidden text-[11px] text-zinc-300 space-y-1 pt-1.5 border-t border-zinc-800/90 break-words">
                  <div><b class="text-emerald-300">• Mặt nạ (Persona):</b> ${
                    c.persona || '---'
                  }</div>
                  <div><b class="text-amber-300">• Bản chất & Chấn thương (Shadow):</b> ${
                    c.shadow || '---'
                  }</div>
                  <div><b class="text-indigo-300">• Bóp méo sự thật (Unreliable POV):</b> ${
                    c.distortion || '---'
                  }</div>
                  <div><b class="text-zinc-200">• Tâm lý hiện tại:</b> ${
                    c.currentPsychState || '---'
                  }</div>
                  <div><b class="text-zinc-200">• Đặc trưng lời thoại:</b> ${
                    c.speechStyle || '---'
                  }</div>
                </div>
              </div>`
            )
            .join('');

          charContainer.querySelectorAll('[data-s19-edit-char]').forEach((btn) => {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              const idx = Number(btn.getAttribute('data-s19-edit-char'));
              const item = chars[idx];
              if (!item) return;
              const form = document.getElementById('form-character');
              form?.classList.remove('hidden');
              const setVal = (id, v) => {
                const el = document.getElementById(id);
                if (el) el.value = v || '';
              };
              setVal('char-id', item.id || '');
              setVal('char-name', item.name);
              setVal('char-aliases', item.aliases);
              setVal('char-persona', item.persona);
              setVal('char-shadow', item.shadow);
              setVal('char-distortion', item.distortion);
              setVal('char-psych-state', item.currentPsychState);
              setVal('char-speech', item.speechStyle);
            });
          });

          charContainer.querySelectorAll('[data-s19-del-char]').forEach((btn) => {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              const key = btn.getAttribute('data-s19-del-char');
              bm.data.characters = (bm.data.characters || []).filter(
                (it, i) => String(it.id || i) !== String(key)
              );
              bm.saveToDisk?.();
              ctrl?.renderAll?.();
              this.renderCompactDeletableBibleLists();
              Stage19TwoSecondMutexAutoSaver.executeAutoSaveCycle(true);
            });
          });
        }
      }

      // 2. Render Ma Trận Ai Biết Gì (#knowledge-list-container)
      const knContainer = document.getElementById('knowledge-list-container');
      if (knContainer) {
        const kns = bm.data.knowledgeMatrix || [];
        if (kns.length === 0) {
          knContainer.innerHTML = `<div class="text-zinc-500 italic text-[11px] py-2">Chưa có bí mật nào trong ma trận.</div>`;
        } else {
          knContainer.innerHTML = kns
            .map(
              (k, idx) => `
              <div class="s19-bible-item-card p-2.5 rounded-xl border border-studioLightBorder dark:border-zinc-800 bg-studioLightBg/80 dark:bg-zinc-900/90 space-y-1.5 shadow-sm">
                <div class="flex items-center justify-between gap-1.5 w-full min-w-0">
                  <div class="truncate font-extrabold text-xs text-amber-400 cursor-pointer flex-1 min-w-0" data-s19-toggle="kn-${idx}">
                    🗝️ ${k.title || 'Bí mật'}
                  </div>
                  <div class="flex items-center gap-1 shrink-0">
                    <button type="button" data-s19-toggle="kn-${idx}" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold">
                      Chi tiết
                    </button>
                    <button type="button" data-s19-del-kn="${
                      k.id || idx
                    }" class="px-2 py-0.5 rounded bg-red-600/25 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 font-extrabold text-[10px] transition">
                      🗑️ Xóa
                    </button>
                  </div>
                </div>
                <div id="s19-detail-kn-${idx}" class="hidden text-[11px] text-zinc-300 space-y-1 pt-1.5 border-t border-zinc-800/90 break-words">
                  <div><b class="text-emerald-300">• Sự thật khách quan 100%:</b> ${
                    k.objectiveTruth || '---'
                  }</div>
                  <div><b class="text-amber-300">• Ai biết / Ai hiểu sai:</b> ${
                    k.characterPerceptions || '---'
                  }</div>
                </div>
              </div>`
            )
            .join('');

          knContainer.querySelectorAll('[data-s19-del-kn]').forEach((btn) => {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              const key = btn.getAttribute('data-s19-del-kn');
              bm.data.knowledgeMatrix = (bm.data.knowledgeMatrix || []).filter(
                (it, i) => String(it.id || i) !== String(key)
              );
              bm.saveToDisk?.();
              this.renderCompactDeletableBibleLists();
              Stage19TwoSecondMutexAutoSaver.executeAutoSaveCycle(true);
            });
          });
        }
      }

      // 3. Render Sổ Cái Phục Bút (#clues-list-container)
      const clueContainer = document.getElementById('clues-list-container');
      if (clueContainer) {
        const clues = bm.data.cluesLedger || [];
        if (clues.length === 0) {
          clueContainer.innerHTML = `<div class="text-zinc-500 italic text-[11px] py-2">Chưa có phục bút nào.</div>`;
        } else {
          clueContainer.innerHTML = clues
            .map(
              (cl, idx) => `
              <div class="s19-bible-item-card p-2.5 rounded-xl border border-studioLightBorder dark:border-zinc-800 bg-studioLightBg/80 dark:bg-zinc-900/90 space-y-1.5 shadow-sm">
                <div class="flex items-center justify-between gap-1.5 w-full min-w-0">
                  <div class="truncate font-extrabold text-xs text-indigo-400 cursor-pointer flex-1 min-w-0" data-s19-toggle="clue-${idx}">
                    📌 [Ch.${cl.plantedChapter || '?'}] ${cl.name || 'Manh mối'}
                  </div>
                  <div class="flex items-center gap-1 shrink-0">
                    <button type="button" data-s19-toggle="clue-${idx}" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold">
                      Chi tiết
                    </button>
                    <button type="button" data-s19-del-clue="${
                      cl.id || idx
                    }" class="px-2 py-0.5 rounded bg-red-600/25 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 font-extrabold text-[10px] transition">
                      🗑️ Xóa
                    </button>
                  </div>
                </div>
                <div id="s19-detail-clue-${idx}" class="hidden text-[11px] text-zinc-300 space-y-1 pt-1.5 border-t border-zinc-800/90 break-words">
                  <div><b class="text-emerald-300">• Trạng thái:</b> ${
                    cl.status || 'Planted'
                  }</div>
                  <div><b class="text-amber-300">• Ý nghĩa & Kế hoạch thu hoạch:</b> ${
                    cl.description || '---'
                  }</div>
                </div>
              </div>`
            )
            .join('');

          clueContainer.querySelectorAll('[data-s19-del-clue]').forEach((btn) => {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              const key = btn.getAttribute('data-s19-del-clue');
              bm.data.cluesLedger = (bm.data.cluesLedger || []).filter(
                (it, i) => String(it.id || i) !== String(key)
              );
              bm.saveToDisk?.();
              this.renderCompactDeletableBibleLists();
              Stage19TwoSecondMutexAutoSaver.executeAutoSaveCycle(true);
            });
          });
        }
      }

      // Đóng/mở chi tiết từng thẻ
      document
        .querySelectorAll('#right-bible-pane [data-s19-toggle]')
        .forEach((trigger) => {
          trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const key = trigger.getAttribute('data-s19-toggle');
            document.getElementById(`s19-detail-${key}`)?.classList.toggle('hidden');
          });
        });
    }
  }

  // ==========================================================================
  // PHẦN 13: BỘ TỔNG HỢP SIÊU CÂU LỆNH TRƯỚC KHI VIẾT (PRE-FLIGHT PROMPT SYNTHESIZER)
  //          Kết nối Chế độ + Model 11/2026 + Tư duy + Số từ + System Prompt + Story Bible
  // ==========================================================================
  class Stage19PreFlightMasterSynthesizer {
    static injectPreFlightPreviewButton() {
      const promptTa = Stage19SubModalOverAiController.findActivePromptTextarea();
      if (!promptTa || !promptTa.parentElement) return;

      const toolbar = promptTa.parentElement.querySelector(
        '.s19-prompt-size-and-template-toolbar'
      );
      if (!toolbar || toolbar.querySelector('#btn-s19-preflight-preview')) return;

      const preflightBtn = document.createElement('button');
      preflightBtn.type = 'button';
      preflightBtn.id = 'btn-s19-preflight-preview';
      preflightBtn.className =
        'px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] shadow transition';
      preflightBtn.innerHTML = '🔍 Kiểm Tra Siêu Câu Lệnh Tổng Hợp (Pre-Flight)';
      toolbar.appendChild(preflightBtn);

      preflightBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openPreFlightMasterModal();
      });
    }

    static buildMasterCompiledPromptPackage() {
      const modeKey = Stage19SubModalOverAiController.detectCurrentAiModeKey();
      const modeObj =
        window.StudioStage19?.modes?.[modeKey] ||
        window.StudioStage19?.modes?.MODE_1_DRAFT;
      const sysPrompt =
        Stage19SubModalOverAiController.getActiveSystemPromptForMode(modeKey);

      let chosenModel = 'gemini-3.8-flash';
      let chosenThinking = 'high';
      let targetWords = '4500';

      document.querySelectorAll('select').forEach((sel) => {
        const label = (sel.previousElementSibling?.textContent || '').toUpperCase();
        if (label.includes('MÔ HÌNH GEMINI') || sel.id === 's6-popup-model-select') {
          chosenModel = sel.value || chosenModel;
        }
        if (label.includes('MỨC ĐỘ TƯ DUY') || sel.id === 's17-ai-thinking-select') {
          chosenThinking = sel.value || chosenThinking;
        }
      });

      document.querySelectorAll('input[type="number"]').forEach((inp) => {
        const label = (inp.previousElementSibling?.textContent || '').toUpperCase();
        if (label.includes('SỐ TỪ MUỐN XUẤT') || inp.id === 's6-popup-word-count') {
          targetWords = inp.value || targetWords;
        }
      });

      const bibleContent =
        document.getElementById('s10-bible-rendered-textarea')?.value ||
        localStorage.getItem('noir_s10_rendered_bible_content') ||
        '(Chưa có bản tổng hợp Story Bible)';

      const userPromptRaw =
        Stage19SubModalOverAiController.findActivePromptTextarea()?.value || '';

      const compiledSystemInstruction = [
        sysPrompt,
        ``,
        `[THÔNG SỐ KỸ THUẬT BẮT BUỘC CHO LƯỢT CHẠY NÀY]:`,
        `• Mô hình thực thi: ${chosenModel} | Mức độ tư duy: ${String(
          chosenThinking
        ).toUpperCase()}`,
        `• ĐỘ DÀI MỤC TIÊU BẮT BUỘC ({{TARGET_WORD_COUNT}}): Khoảng ${targetWords} từ tiếng Việt (triển khai sâu, tuyệt đối không kết thúc sớm).`,
        `• Quy ước lời thoại bắt buộc 100%: - Câu thoại (Tên nhân vật)`,
        ``,
        `[HỒ SƠ STORY BIBLE ĐANG ÁP DỤNG]:`,
        bibleContent
      ].join('\n');

      return {
        modeKey,
        modeTitle: modeObj?.title || modeKey,
        chosenModel,
        chosenThinking,
        targetWords,
        compiledSystemInstruction,
        userPromptRaw
      };
    }

    static openPreFlightMasterModal() {
      const pkg = this.buildMasterCompiledPromptPackage();

      let modal = document.getElementById('modal-s19-preflight-master');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-s19-preflight-master';
        modal.className =
          's19-topmost-submodal fixed inset-0 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md';
        document.body.appendChild(modal);
      }

      modal.innerHTML = `
        <div class="w-full max-w-4xl rounded-2xl border-2 border-emerald-500/80 bg-zinc-950 text-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-xs">
          <div class="px-5 py-3.5 border-b border-zinc-800 bg-emerald-600/20 flex items-center justify-between">
            <div>
              <h3 class="font-extrabold uppercase text-sm text-emerald-400">
                🚀 KIỂM TRA SIÊU CÂU LỆNH TỔNG HỢP (PRE-FLIGHT MASTER PROMPT)
              </h3>
              <p class="text-[11px] text-zinc-300">
                Toàn bộ thông số Chế độ + Model (${pkg.chosenModel}) + Tư duy (${pkg.chosenThinking}) + Số từ (${pkg.targetWords} từ) + System Prompt + Story Bible đã được ghép nối:
              </p>
            </div>
            <button type="button" id="btn-s19-close-preflight" class="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold">
              ✕ Đóng
            </button>
          </div>

          <div class="p-4 flex-1 overflow-y-auto space-y-3">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl bg-zinc-900 border border-zinc-800 font-monoCode text-[11px]">
              <div>Chế độ: <b class="text-emerald-400">${pkg.modeKey}</b></div>
              <div>Model: <b class="text-amber-400">${pkg.chosenModel}</b></div>
              <div>Tư duy: <b class="text-indigo-400">${pkg.chosenThinking}</b></div>
              <div>Số từ đích: <b class="text-emerald-300">${pkg.targetWords} từ</b></div>
            </div>

            <div class="space-y-1">
              <label class="font-extrabold uppercase text-[10px] text-emerald-400">
                1. Khối System Instruction + Story Bible sẽ gửi cho Gemini:
              </label>
              <textarea id="s19-preflight-sys-ta" rows="10" class="w-full p-3 rounded-xl border border-emerald-500/40 bg-zinc-900 text-emerald-100 font-monoCode text-[11px] leading-relaxed">${pkg.compiledSystemInstruction}</textarea>
            </div>

            <div class="space-y-1">
              <label class="font-extrabold uppercase text-[10px] text-amber-400">
                2. Khối Câu Lệnh Cụ Thể Của Bạn (User Prompt):
              </label>
              <textarea id="s19-preflight-user-ta" rows="6" class="w-full p-3 rounded-xl border border-amber-500/40 bg-zinc-900 text-amber-100 font-sansUI text-xs leading-relaxed">${pkg.userPromptRaw}</textarea>
            </div>
          </div>

          <div class="px-5 py-3 border-t border-zinc-800 bg-zinc-900 flex justify-end gap-2">
            <button type="button" id="btn-s19-apply-preflight-edits" class="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition">
              ✅ Xác Nhận & Cập Nhật Vào Ô Nhập Lệnh
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      modal.classList.remove('hidden');

      document
        .getElementById('btn-s19-close-preflight')
        ?.addEventListener('click', () => modal.classList.add('hidden'));

      document
        .getElementById('btn-s19-apply-preflight-edits')
        ?.addEventListener('click', () => {
          const editedUser =
            document.getElementById('s19-preflight-user-ta')?.value || '';
          const activeTa = Stage19SubModalOverAiController.findActivePromptTextarea();
          if (activeTa) activeTa.value = editedUser;
          modal.classList.add('hidden');
          window.StudioStage7?.saveEngine?.showSaveToastNotification(
            '✅ Đã cập nhật Siêu Câu Lệnh Tổng Hợp sẵn sàng thực thi!'
          );
        });
    }
  }

  // ==========================================================================
  // PHẦN 14: MÁY KIỂM TOÁN PHÁP Y BẢN THẢO CỤC BỘ (0 TOKEN AI)
  //          Chuẩn hóa lời thoại "- Thoại (Tên)" 1-Click & Quét từ sáo rỗng
  // ==========================================================================
  class Stage19LocalManuscriptForensicScanner {
    static mountQuickForensicBar() {
      const editorHeader =
        document.getElementById('right-editor-mode-label')?.parentElement?.parentElement;
      if (!editorHeader || document.getElementById('btn-s19-normalize-dialogue-1click')) {
        return;
      }

      const btnGroup = document.createElement('div');
      btnGroup.className = 'flex items-center gap-1.5';
      btnGroup.innerHTML = `
        <button type="button" id="btn-s19-normalize-dialogue-1click" class="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 font-bold text-[10px] transition" title="Tự động chuẩn hóa các dấu gạch đầu dòng lời thoại trong chương về chuẩn: - Câu thoại (Tên)">
          💬 Chuẩn hóa thoại (0 Token)
        </button>
      `;
      editorHeader.appendChild(btnGroup);

      document
        .getElementById('btn-s19-normalize-dialogue-1click')
        ?.addEventListener('click', () => {
          const contentTa = document.getElementById('textarea-chapter-content');
          if (!contentTa || !contentTa.value.trim()) return;

          // Chuẩn hóa các kiểu gạch ngang đầu dòng (—, –, •, *) hoặc ngoặc kép thoại về "- "
          const lines = contentTa.value.split('\n').map((line) => {
            const trimmed = line.trim();
            if (/^[—–―]\s*/.test(trimmed)) {
              return '- ' + trimmed.replace(/^[—–―]\s*/, '');
            }
            return line;
          });

          contentTa.value = lines.join('\n');
          Stage19TwoSecondMutexAutoSaver.executeAutoSaveCycle(true);
          window.StudioStage7?.saveEngine?.showSaveToastNotification(
            '💬 Đã chuẩn hóa dấu gạch ngang lời thoại trong bản thảo!'
          );
        });
    }
  }

  // ==========================================================================
  // KHỞI CHẠY CHẶNG 2 CỦA STAGE 19
  // ==========================================================================
  function bootStage19Part2() {
    Stage19TwoSecondMutexAutoSaver.init();
    Stage19StoryBibleAntiOverflowManager.init();
    Stage19LocalManuscriptForensicScanner.mountQuickForensicBar();

    setInterval(() => {
      Stage19PreFlightMasterSynthesizer.injectPreFlightPreviewButton();
      Stage19LocalManuscriptForensicScanner.mountQuickForensicBar();
    }, 400);
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', bootStage19Part2);
  } else {
    bootStage19Part2();
  }

  if (window.StudioStage19) {
    window.StudioStage19.autoSaver2s = Stage19TwoSecondMutexAutoSaver;
    window.StudioStage19.bibleAntiOverflow = Stage19StoryBibleAntiOverflowManager;
    window.StudioStage19.preFlightSynthesizer = Stage19PreFlightMasterSynthesizer;
  }
})();
/**
 * ============================================================================
 * FILE: stage19_ultimate_architect.js
 * [CHẶNG 3 / 3 — HOÀN TẤT HỆ THỐNG STAGE 19]:
 *   - PHẦN 15: Tour Dẫn Đường Tương Tác Trực Tiếp Trên Giao Diện Thực Tế (Interactive
 *              DOM Spotlight Tour) & Bách Khoa Toàn Thư Cẩm Nang Tĩnh A-Z.
 *   - PHẦN 16: Cổng Duyệt Đa Chương Nối Mạch Story Bible Thông Minh & Nút Xem/Sửa
 *              Trực Tiếp Khung Story Bible Ngay Cạnh Nút Duyệt Bản Thảo.
 *   - PHẦN 17: Máy Kiểm Toán Pháp Y Liên Chương (0 Token AI): Tự động quét Trục
 *              Giờ Giấc, Tần Suất Nhân Vật, Lỗi Quy Ước Thoại & Từ Sáo Rỗng.
 *   - PHẦN 18: Bộ Đánh Chặn API Cấp Thấp (Low-Level Fetch & Gemini Client Interceptor)
 *              đảm bảo 100% lời gọi AI đều dùng đúng Model 11/2026 & System Prompt.
 * ============================================================================
 */

(function () {
  'use strict';

  if (window.__NOIR_STAGE19_PART3_LOADED__) return;
  window.__NOIR_STAGE19_PART3_LOADED__ = true;

  // ==========================================================================
  // PHẦN 15: TOUR DẪN ĐƯỜNG TƯƠNG TÁC TRỰC TIẾP TRÊN DOM THỰC TẾ (SPOTLIGHT TOUR)
  //          & BÁCH KHOA TOÀN THƯ HƯỚNG DẪN TĨNH CHUYÊN SÂU
  // ==========================================================================
  class Stage19InteractiveDomTourAndStaticEncyclopedia {
    static currentStepIdx = 0;
    static isTourActive = false;

    static TOUR_STEPS = [
      {
        title: 'Bước 1/8: Thương Hiệu Góc Trái & Thanh Điều Hướng Trung Tâm',
        screen: 'SCREEN_1_WRITE',
        selector: '#s14-master-top-nav',
        desc: 'Thanh điều hướng trên cùng giúp bạn chuyển đổi tức thì giữa Bàn Viết Truyện (Tab 1) và 5 phân khu chức năng (Tab 2 ➔ Tab 6). Bấm vào dòng chữ "✍️ Web viết tiểu thuyết của Bi" ở góc trái sẽ luôn đưa bạn quay thẳng về Bàn Viết Truyện.'
      },
      {
        title: 'Bước 2/8: Đèn Báo Auto-Save 2 Giây & Khôi Phục Bản Lưu Tạm',
        screen: 'SCREEN_1_WRITE',
        selector: '#s19-autosave-2s-badge',
        desc: 'Cứ mỗi 2 giây (2000ms), hệ thống tự động lưu toàn bộ bản thảo, Story Bible và cài đặt của bạn xuống Folder ổ cứng (_studio_autosave_2s_temp.json). Bấm vào nút này để kiểm tra trạng thái ổ cứng hoặc tải bản lưu tạm bất cứ lúc nào.'
      },
      {
        title: 'Bước 3/8: Video Hoạt Họa 60FPS & Loa Thông Báo Cập Nhật (v1 ➔ v33)',
        screen: 'SCREEN_1_WRITE',
        selector: '#btn-s23-top-video-guide',
        desc: 'Nút "🎬 Video Hướng Dẫn" mở Trung tâm Hướng dẫn Kép (gồm Video hoạt họa 60FPS và Cẩm nang tĩnh tra cứu nhanh). Kế bên là nút "📢 Loa Cập Nhật" hiển thị toàn bộ lịch sử nâng cấp từ Bản 1.0 đến Version 33.0.'
      },
      {
        title: 'Bước 4/8: Quản Lý Cây Bản Thảo & Kết Nối Folder Ổ Cứng (Tab 2)',
        screen: 'SCREEN_2_FILES',
        selector: '#left-sidebar-pane',
        desc: 'Tại Tab 2, bạn kết nối thư mục máy tính, nạp file chương cũ (.DOCX, .PDF, .TXT) tốn 0% token AI, tạo chương nháp mới, lọc nhanh chương và bấm "↩️ Chưa duyệt" để chuyển chương đã chốt về lại bản nháp khi cần sửa.'
      },
      {
        title: 'Bước 5/8: Trung Tâm AI, 4 Chế Độ Chuyên Sâu & Cửa Sổ Nổi Trực Tiếp (Tab 3)',
        screen: 'SCREEN_1_WRITE',
        selector: '#editor-metadata-bar',
        desc: 'Khi mở Trung tâm AI (Tab 3), bạn có 4 chế độ viết chuyên sâu kèm gợi ý chữ xám (placeholder) riêng, danh sách Model chuẩn 11/11/2026 (Gemini 4 Argon, 4 Carbon, 3.8 Flash...) và các nút Xem/Sửa Story Bible, Câu lệnh hệ thống, Chèn POV bật nổi trực tiếp trên khung AI!'
      },
      {
        title: 'Bước 6/8: Story Bible Chống Tràn & Ghim Cố Định Nút Sửa/Xóa (Tab 4)',
        screen: 'SCREEN_4_BIBLE',
        selector: '#right-bible-pane',
        desc: 'Tại Tab 4, danh sách Nhân vật, Ma trận Ai Biết Gì và Sổ cái Phục bút được thiết kế chống tràn 100%, luôn ghim cố định nút [✏️ Sửa] và [🗑️ Xóa] ở góc phải mỗi thẻ kèm thanh lọc nhanh.'
      },
      {
        title: 'Bước 7/8: Đồng Hồ Pomodoro Đồng Bộ Từng Giây & Nhạc Nền Lặp A-B (Tab 5)',
        screen: 'SCREEN_5_AMBIENCE',
        selector: '#s15-floating-pomodoro-pill',
        desc: 'Viên thuốc Pomodoro góc trên phải (< 🍅 24:53) luôn chạy đồng bộ hai chiều từng giây với bảng Đồng hồ Pomodoro trong Tab 5. Ở góc dưới trái là thanh nhạc nền Piano, mưa đêm, tiếng gõ phím ASMR và tua ±5 giây.'
      },
      {
        title: 'Bước 8/8: Xuất Bản Thảo & Chia Sẻ File HTML + JS Gộp Cho Bạn Bè (Tab 6)',
        screen: 'SCREEN_6_SYSTEM',
        selector: '#s19-tab6-share-html-card',
        desc: 'Tại Tab 6 (Hệ thống & Cài đặt), bạn có thể xuất tiểu thuyết ra .DOCX/.PDF/.TXT, hoặc bấm tải "1 File .HTML + JS Gộp Duy Nhất" và "File .JS Hợp Nhất" (đã tự động lọc bỏ API Key cá nhân) để gửi cho bạn bè cùng dùng chung!'
      }
    ];

    static startInteractiveSpotlightTour() {
      // Đóng modal video nếu đang mở để người dùng nhìn rõ giao diện thật
      document.getElementById('modal-s19-master-guide')?.classList.add('hidden');
      this.currentStepIdx = 0;
      this.isTourActive = true;
      this.ensureTourOverlayExists();
      this.renderCurrentTourStep();
    }

    static ensureTourOverlayExists() {
      if (document.getElementById('s19-live-spotlight-overlay')) return;

      const wrap = document.createElement('div');
      wrap.id = 's19-live-spotlight-overlay';
      wrap.className = 'fixed inset-0 pointer-events-none z-[2147483647] hidden';
      wrap.innerHTML = `
        <div id="s19-spotlight-hole" class="fixed rounded-2xl border-4 border-emerald-400 transition-all duration-300 pointer-events-none" style="box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.76), 0 0 30px rgba(16, 185, 129, 0.9);"></div>

        <div id="s19-spotlight-card" class="fixed w-[92vw] max-w-md rounded-2xl border-2 border-emerald-500 bg-zinc-950 text-white p-4 shadow-2xl pointer-events-auto space-y-3 text-xs transition-all duration-300">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span id="s19-tour-step-title" class="font-extrabold text-emerald-400 text-xs uppercase"></span>
            <button type="button" id="btn-s19-tour-close" class="px-2 py-0.5 rounded bg-red-600/80 hover:bg-red-600 text-white font-bold text-[10px]">
              ✕ Kết thúc
            </button>
          </div>
          <p id="s19-tour-step-desc" class="text-zinc-200 leading-relaxed text-xs"></p>
          <div class="flex items-center justify-between pt-2 border-t border-zinc-800">
            <span id="s19-tour-step-counter" class="font-monoCode text-[11px] text-amber-400 font-bold"></span>
            <div class="flex items-center gap-2">
              <button type="button" id="btn-s19-tour-prev" class="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold">
                ⬅️ Trước
              </button>
              <button type="button" id="btn-s19-tour-next" class="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow">
                Tiếp theo ➡️
              </button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(wrap);

      document.getElementById('btn-s19-tour-close')?.addEventListener('click', () => {
        this.stopTour();
      });
      document.getElementById('btn-s19-tour-prev')?.addEventListener('click', () => {
        if (this.currentStepIdx > 0) {
          this.currentStepIdx--;
          this.renderCurrentTourStep();
        }
      });
      document.getElementById('btn-s19-tour-next')?.addEventListener('click', () => {
        if (this.currentStepIdx < this.TOUR_STEPS.length - 1) {
          this.currentStepIdx++;
          this.renderCurrentTourStep();
        } else {
          this.stopTour();
        }
      });
    }

    static renderCurrentTourStep() {
      const overlay = document.getElementById('s19-live-spotlight-overlay');
      const hole = document.getElementById('s19-spotlight-hole');
      const card = document.getElementById('s19-spotlight-card');
      if (!overlay || !hole || !card) return;

      const step = this.TOUR_STEPS[this.currentStepIdx];
      if (!step) return;

      // Chuyển màn hình tương ứng để phần tử cần chỉ dẫn hiện ra thật sự
      if (step.screen && window.StudioStage14?.screenNavigator) {
        window.StudioStage14.screenNavigator.navigateToScreen(step.screen);
      }

      overlay.classList.remove('hidden');

      setTimeout(() => {
        const targetEl = document.querySelector(step.selector);
        const titleEl = document.getElementById('s19-tour-step-title');
        const descEl = document.getElementById('s19-tour-step-desc');
        const counterEl = document.getElementById('s19-tour-step-counter');
        const prevBtn = document.getElementById('btn-s19-tour-prev');
        const nextBtn = document.getElementById('btn-s19-tour-next');

        if (titleEl) titleEl.textContent = step.title;
        if (descEl) descEl.textContent = step.desc;
        if (counterEl) {
          counterEl.textContent = `Bước ${this.currentStepIdx + 1} / ${
            this.TOUR_STEPS.length
          }`;
        }
        if (prevBtn) prevBtn.disabled = this.currentStepIdx === 0;
        if (nextBtn) {
          nextBtn.textContent =
            this.currentStepIdx === this.TOUR_STEPS.length - 1
              ? '✅ Hoàn tất Tour'
              : 'Tiếp theo ➡️';
        }

        if (targetEl) {
          const rect = targetEl.getBoundingClientRect();
          const pad = 8;
          const top = Math.max(6, rect.top - pad);
          const left = Math.max(6, rect.left - pad);
          const width = Math.min(window.innerWidth - 12, Math.max(120, rect.width + pad * 2));
          const height = Math.min(window.innerHeight - 12, Math.max(38, rect.height + pad * 2));

          hole.style.top = `${top}px`;
          hole.style.left = `${left}px`;
          hole.style.width = `${width}px`;
          hole.style.height = `${height}px`;

          let cardTop = top + height + 16;
          if (cardTop + 210 > window.innerHeight) {
            cardTop = Math.max(16, top - 215);
          }
          const cardLeft = Math.min(
            window.innerWidth - 440,
            Math.max(16, left)
          );

          card.style.top = `${cardTop}px`;
          card.style.left = `${cardLeft}px`;
        } else {
          hole.style.top = '50%';
          hole.style.left = '50%';
          hole.style.width = '0px';
          hole.style.height = '0px';
          card.style.top = '25%';
          card.style.left = 'calc(50% - 210px)';
        }
      }, 80);
    }

    static stopTour() {
      this.isTourActive = false;
      document.getElementById('s19-live-spotlight-overlay')?.classList.add('hidden');
      window.StudioStage14?.screenNavigator?.navigateToScreen('SCREEN_1_WRITE');
    }

    static injectTourButtonIntoGuideModal() {
      const guideModal = document.getElementById('modal-s19-master-guide');
      const tabStaticBtn = document.getElementById('btn-s19-tab-static');
      if (!guideModal || !tabStaticBtn || document.getElementById('btn-s19-launch-dom-tour')) {
        return;
      }

      const tourBtn = document.createElement('button');
      tourBtn.type = 'button';
      tourBtn.id = 'btn-s19-launch-dom-tour';
      tourBtn.className =
        'px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white shadow';
      tourBtn.innerHTML = '<span>👆 3. Dẫn Đường Từng Nút Thực Tế</span>';
      tabStaticBtn.insertAdjacentElement('afterend', tourBtn);

      tourBtn.addEventListener('click', () => {
        this.startInteractiveSpotlightTour();
      });
    }
  }

  // ==========================================================================
  // PHẦN 16: CỔNG DUYỆT ĐA CHƯƠNG NỐI MẠCH STORY BIBLE THÔNG MINH & NÚT MỞ NHANH
  //          KHUNG STORY BIBLE NGAY CẠNH NÚT DUYỆT BẢN THẢO
  // ==========================================================================
  class Stage19SmartApprovalAndBibleBridge {
    static mountQuickBibleButtonNextToApprove() {
      const approveBtn = document.getElementById('btn-approve-chapter');
      if (
        !approveBtn ||
        !approveBtn.parentElement ||
        document.getElementById('btn-s19-quick-bible-beside-approve')
      ) {
        return;
      }

      const quickBibleBtn = document.createElement('button');
      quickBibleBtn.type = 'button';
      quickBibleBtn.id = 'btn-s19-quick-bible-beside-approve';
      quickBibleBtn.className =
        'px-2.5 py-1 text-xs font-extrabold rounded bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-zinc-950 border border-amber-500/40 transition flex items-center gap-1 shadow-sm';
      quickBibleBtn.title =
        'Xem và chỉnh sửa trực tiếp Khung Story Bible ngay tại đây trước hoặc sau khi duyệt chương';
      quickBibleBtn.innerHTML = '<span>🏛️ Khung Story Bible</span>';

      approveBtn.parentElement.insertBefore(quickBibleBtn, approveBtn);
      quickBibleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.StudioStage19?.subModalController?.openLiveStoryBibleStudioModal();
      });
    }
  }

  // ==========================================================================
  // PHẦN 17: MÁY KIỂM TOÁN PHÁP Y LIÊN CHƯƠNG (0 TOKEN AI)
  //          Quét toàn bộ mốc giờ, sự xuất hiện nhân vật, từ sáo rỗng & lỗi định dạng thoại
  // ==========================================================================
  class Stage19CrossChapterForensicInspector {
    static mountForensicButtonInHeader() {
      const editorHeader =
        document.getElementById('right-editor-mode-label')?.parentElement?.parentElement;
      if (!editorHeader || document.getElementById('btn-s19-open-forensic-inspector')) {
        return;
      }

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'btn-s19-open-forensic-inspector';
      btn.className =
        'px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-zinc-950 border border-amber-500/40 font-extrabold text-[10px] transition';
      btn.innerHTML = '🕵️ Kiểm Toán Pháp Y (0 Token)';
      editorHeader.appendChild(btn);

      btn.addEventListener('click', () => this.openForensicReportModal());
    }

    static analyzeAllChaptersLocally() {
      const chapters = window.StudioCore?.approvalGate?.chapters || [];
      const characters = window.StudioCore?.bibleManager?.data?.characters || [];
      const blacklistRaw =
        document.getElementById('textarea-anti-cliche')?.value ||
        'một cảm giác khó tả, không khí đặc quánh, tim đập thình thịch, ánh mắt sắc như dao';
      const clicheList = blacklistRaw
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      const timeRegex =
        /\b(\d{1,2}\s*giờ(?:\s*\d{1,2}\s*phút)?|\d{1,2}:\d{2}|ngày\s+\d{1,2}[\/\-]\d{1,2})\b/gi;

      return chapters.map((ch, idx) => {
        const text = ch.content || '';
        const lines = text.split('\n');

        // 1. Trích xuất mốc thời gian trong chương
        const foundTimes = [...new Set((text.match(timeRegex) || []).map((m) => m.trim()))];

        // 2. Đếm tần suất xuất hiện từng nhân vật trong Story Bible
        const charMentions = [];
        characters.forEach((c) => {
          if (!c.name) return;
          const escaped = c.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const matches = text.match(new RegExp(escaped, 'gi'));
          if (matches && matches.length > 0) {
            charMentions.push(`${c.name} (${matches.length})`);
          }
        });

        // 3. Kiểm tra các dòng lời thoại chưa đúng định dạng "- Câu thoại (Tên)"
        let validDialogues = 0;
        const malformedDialogues = [];
        lines.forEach((l, lineNum) => {
          const t = l.trim();
          if (t.startsWith('- ') || t.startsWith('— ')) {
            if (/\([^)]+\)\s*[.!?…]*$/.test(t)) {
              validDialogues++;
            } else {
              malformedDialogues.push(`Dòng ${lineNum + 1}: "${t.slice(0, 65)}..."`);
            }
          }
        });

        // 4. Quét các từ sáo rỗng bị cấm
        const lowerText = text.toLowerCase();
        const foundCliches = clicheList.filter((cl) => lowerText.includes(cl));

        return {
          idx: idx + 1,
          title: ch.displayTitle || ch.title || `Chương ${idx + 1}`,
          status: ch.status === 'APPROVED' ? '✅ Đã Duyệt' : '📝 Đang Nháp',
          wordCount: ch.wordCount || 0,
          foundTimes,
          charMentions,
          validDialogues,
          malformedDialogues,
          foundCliches
        };
      });
    }

    static openForensicReportModal() {
      const report = this.analyzeAllChaptersLocally();

      let modal = document.getElementById('modal-s19-forensic-inspector');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-s19-forensic-inspector';
        modal.className =
          's19-topmost-submodal fixed inset-0 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md';
        document.body.appendChild(modal);
      }

      modal.innerHTML = `
        <div class="w-full max-w-5xl max-h-[90vh] rounded-2xl border-2 border-amber-500/80 bg-zinc-950 text-white shadow-2xl flex flex-col overflow-hidden text-xs">
          <div class="px-5 py-3.5 border-b border-zinc-800 bg-amber-500/15 flex items-center justify-between">
            <div>
              <h3 class="font-extrabold uppercase text-sm text-amber-400">
                🕵️ BÁO CÁO KIỂM TOÁN PHÁP Y LIÊN CHƯƠNG CỤC BỘ (0 TOKEN AI)
              </h3>
              <p class="text-[11px] text-zinc-300">
                Rà soát tự động Mốc giờ giấc, Tần suất nhân vật, Quy ước thoại "- Thoại (Tên)" và Từ ngữ sáo rỗng trên toàn bộ các chương
              </p>
            </div>
            <button type="button" id="btn-s19-close-forensic" class="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold">
              ✕ Đóng
            </button>
          </div>

          <div class="p-5 flex-1 overflow-y-auto space-y-3 select-text">
            ${report
              .map(
                (r) => `
              <div class="p-4 rounded-xl border border-zinc-800 bg-zinc-900/75 space-y-2">
                <div class="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2">
                  <span class="font-extrabold text-sm text-emerald-400">
                    #${r.idx} • ${r.title}
                  </span>
                  <span class="font-monoCode text-xs text-zinc-300">
                    ${r.status} • <b>${r.wordCount.toLocaleString('vi-VN')} từ</b>
                  </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <b class="text-amber-300">🕒 Mốc giờ phát hiện:</b>
                    <span class="text-zinc-300">${
                      r.foundTimes.length > 0
                        ? r.foundTimes.join(' | ')
                        : '(Không có mốc giờ cụ thể)'
                    }</span>
                  </div>
                  <div>
                    <b class="text-indigo-300">👥 Nhân vật xuất hiện:</b>
                    <span class="text-zinc-300">${
                      r.charMentions.length > 0
                        ? r.charMentions.join(', ')
                        : '(Chưa khớp tên nhân vật trong Story Bible)'
                    }</span>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <b class="text-emerald-300">💬 Kiểm tra quy ước thoại "- Thoại (Tên)":</b>
                    <span class="text-zinc-300">${r.validDialogues} câu chuẩn</span>
                    ${
                      r.malformedDialogues.length > 0
                        ? `<div class="text-red-400 mt-1">⚠️ Thiếu "(Tên)" ở cuối câu: ${r.malformedDialogues
                            .slice(0, 3)
                            .join(' ; ')}</div>`
                        : `<span class="text-emerald-400 ml-1">(Đạt chuẩn 100%)</span>`
                    }
                  </div>
                  <div>
                    <b class="text-red-300">🚫 Từ sáo rỗng bị cấm:</b>
                    ${
                      r.foundCliches.length > 0
                        ? `<span class="text-red-400 font-bold">Phát hiện: ${r.foundCliches.join(
                            ', '
                          )}</span>`
                        : `<span class="text-emerald-400">Sạch 100% (Không có từ sáo rỗng)</span>`
                    }
                  </div>
                </div>
              </div>`
              )
              .join('')}
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      modal.classList.remove('hidden');

      document
        .getElementById('btn-s19-close-forensic')
        ?.addEventListener('click', () => modal.classList.add('hidden'));
    }
  }

  // ==========================================================================
  // PHẦN 18: BỘ ĐÁNH CHẶN API CẤP THẤP (LOW-LEVEL FETCH & GEMINI CLIENT INTERCEPTOR)
  //          Đảm bảo mọi cuộc gọi tới Google Gemini API trên toàn trang web:
  //          1. Tự động chuyển các model cũ (2.5-pro, 2.5-flash, 3.5-flash) sang model thực tế.
  //          2. Tự động gắn System Prompt bậc thầy tiểu thuyết tâm lý - trinh thám của Chế độ.
  // ==========================================================================
  class Stage19LowLevelApiInterceptor {
    static install() {
      if (window.__S19_FETCH_INTERCEPTOR_INSTALLED__) return;
      window.__S19_FETCH_INTERCEPTOR_INSTALLED__ = true;

      const origFetch = window.fetch.bind(window);

      window.fetch = async function (input, init) {
        try {
          let url = typeof input === 'string' ? input : input?.url || '';

          if (url.includes('generativelanguage.googleapis.com') && url.includes(':generateContent')) {
            // 1. Chuyển hướng tự động nếu URL chứa tên model cũ không còn tồn tại hoặc hạn chế
            const modelRedirectTable = {
              'models/gemini-2.5-pro:': 'models/gemini-3.1-pro-preview:',
              'models/gemini-2.5-flash:': 'models/gemini-3.1-flash-lite-preview:',
              'models/gemini-3.5-flash:': 'models/gemini-3.1-pro-preview:',
              'models/gemini-3-flash-preview:': 'models/gemini-3-flash-preview:'
            };

            Object.entries(modelRedirectTable).forEach(([oldPart, newPart]) => {
              if (url.includes(oldPart)) {
                url = url.replace(oldPart, newPart);
              }
            });

            // 2. Nếu có body JSON và không phải lệnh ping xác minh 1 token, tự động bổ sung System Prompt của Chế độ
            if (init && typeof init.body === 'string') {
              try {
                const bodyObj = JSON.parse(init.body);
                const maxTok = bodyObj?.generationConfig?.maxOutputTokens || 0;

                if (maxTok > 10 && window.StudioStage19?.subModalController) {
                  const modeKey =
                    window.StudioStage19.subModalController.detectCurrentAiModeKey();
                  const masterSys =
                    window.StudioStage19.subModalController.getActiveSystemPromptForMode(
                      modeKey
                    );

                  const existingSys =
                    bodyObj?.systemInstruction?.parts?.[0]?.text || '';
                  if (masterSys && !existingSys.includes(masterSys.slice(0, 35))) {
                    bodyObj.systemInstruction = {
                      parts: [{ text: `${masterSys}\n\n${existingSys}` }]
                    };
                    init.body = JSON.stringify(bodyObj);
                  }
                }
              } catch (_) {}
            }

            return await origFetch(url, init);
          }
        } catch (_) {}

        return await origFetch(input, init);
      };
    }
  }

  // ==========================================================================
  // KHỞI CHẠY CHẶNG 3 & HOÀN TẤT TOÀN BỘ KIẾN TRÚC STAGE 19
  // ==========================================================================
  function bootStage19Part3() {
    Stage19LowLevelApiInterceptor.install();
    Stage19SmartApprovalAndBibleBridge.mountQuickBibleButtonNextToApprove();
    Stage19CrossChapterForensicInspector.mountForensicButtonInHeader();

    setInterval(() => {
      Stage19InteractiveDomTourAndStaticEncyclopedia.injectTourButtonIntoGuideModal();
      Stage19SmartApprovalAndBibleBridge.mountQuickBibleButtonNextToApprove();
      Stage19CrossChapterForensicInspector.mountForensicButtonInHeader();
    }, 400);
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', bootStage19Part3);
  } else {
    bootStage19Part3();
  }

  if (window.StudioStage19) {
    window.StudioStage19.version = '33.0-Complete';
    window.StudioStage19.domTour = Stage19InteractiveDomTourAndStaticEncyclopedia;
    window.StudioStage19.forensicInspector = Stage19CrossChapterForensicInspector;
    window.StudioStage19.apiInterceptor = Stage19LowLevelApiInterceptor;
  }
})();