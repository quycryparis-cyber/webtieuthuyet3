/**
 * ============================================================================
 * MODULE 02: GEMINI 2026 MODELS CATALOG, SMART ROUTER & QUALITY ADVISOR ENGINE
 * ============================================================================
 * Phiên bản: v38.0.0-SUPREME-MODULAR (2026)
 * Nhiệm vụ:
 *   1. Định nghĩa danh mục mô hình thế hệ mới `GEMINI_MODELS_CATALOG` (`window.NoirStudio.models`)
 *      bao gồm: Gemini 3.8 Flash, Gemini 3.1 Pro, Gemini 4 Argon, Gemini 4 Carbon,
 *      Gemini 3.6 Flash, Gemini 3.5 Flash-Lite và Gemini 3.1 Flash-Lite.
 *   2. Cung cấp đầy đủ cấu hình định tuyến chống nghẽn (`apiTarget` và chuỗi `fallbacks`
 *      đa tầng) để đảm bảo khi Google API cao điểm hoặc giới hạn RPM, hệ thống tự động
 *      chuyển tiếp mượt mà không bao giờ làm đứt mạch sáng tác.
 *   3. Triển khai `ModelQualityAdvisorAndTokenBudgetEngine` (`window.NoirStudio.modelAdvisor`):
 *      - Phân tích độ phức tạp của câu lệnh, số từ mục tiêu (3.000 - 4.000+ từ) và chế độ AI (1-5).
 *      - Tự động phát hiện và hiển thị khuyến cáo văn học thân thiện khi người dùng chọn dòng
 *        `Flash-Lite` cho tác vụ viết tiểu thuyết dài hơi, khuyên dùng từ `Gemini Flash` trở lên
 *        (`Gemini 3.8 Flash`, `Gemini 3.1 Pro`, `Gemini 4 Argon`, `Gemini 4 Carbon`).
 *      - Bộ ước tính Token chuyên biệt cho tiếng Việt có dấu (Vietnamese Token Estimator)
 *        và bộ phân bổ ngân sách ngữ cảnh (Context Window Budget Allocator).
 *   4. Triển khai `ModelCircuitBreakerAndHealthTracker` (`window.NoirStudio.modelHealth`):
 *      theo dõi độ trễ từng endpoint, tự động cách ly tạm thời nhánh bị lỗi 429/503 và
 *      đồng bộ hóa tất cả các ô chọn mô hình trên giao diện (Tab 3, Modal Lệnh AI, Modal Xác Nhận).
 * ============================================================================
 */

(function initNoirStudioGeminiModelsAndRouterModule(globalScope) {
  'use strict';

  const root = globalScope || (typeof window !== 'undefined' ? window : globalThis);
  root.NoirStudio = root.NoirStudio || {};
  const NS = root.NoirStudio;

  // ==========================================================================
  // PHẦN 1: DANH MỤC MÔ HÌNH GEMINI 2026 CHUẨN (`window.NoirStudio.models`)
  // ==========================================================================

  /**
   * Danh sách mô hình AI thế hệ 2026 tích hợp trong Studio.
   * Mỗi phần tử giữ nguyên các trường chuẩn:
   *   - `id`: Mã định danh hiển thị trong `<select>` và lưu trong LocalStorage
   *   - `label`: Tên hiển thị tiếng Việt thân thiện kèm biểu tượng phân cấp
   *   - `apiTarget`: Endpoint thực thi chính trên Google Generative Language API
   *   - `fallbacks`: Mảng các endpoint dự phòng tự động chuyển mạch khi nghẽn (429/503)
   *   - `tier`: Phân hạng chất lượng (`RECOMMENDED_FLASH`, `PRO_HIGH`, `LITE_FAST`)
   *   - `isLite`: Cờ đánh dấu mô hình rút gọn để bật cảnh báo khuyến cáo ở bước Xác nhận Prompt
   * Kèm theo hồ sơ năng lực văn học chi tiết phục vụ Bộ cố vấn chất lượng.
   */
  const GEMINI_MODELS_CATALOG = [
    {
      id: 'gemini-3.8-flash',
      label: '🌟 Gemini 3.8 Flash (Khuyên dùng viết truyện — Giàu cảm xúc & Mượt mà)',
      shortLabel: '🌟 Gemini 3.8 Flash (Khuyên dùng)',
      apiTarget: 'gemini-2.5-flash',
      fallbacks: ['gemini-flash-latest', 'gemini-3-flash-preview', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-lite-latest'],
      tier: 'RECOMMENDED_FLASH',
      isLite: false,
      contextWindowTokens: 1048576,
      maxOutputTokens: 16384,
      recommendedWordRange: { min: 1500, optimal: 3800, max: 6500 },
      recommendedTempRange: { min: 0.7, optimal: 0.85, max: 1.05 },
      scores: {
        literaryStyle: 9.5,
        emotionalResonance: 9.6,
        psychologicalDepth: 9.2,
        loreConsistency: 9.3,
        dialogueNaturalness: 9.6,
        speedAndResponsiveness: 9.5,
        antiClicheCompliance: 9.2
      },
      idealModes: ['MODE_1_DRAFT', 'MODE_2_BRAINSTORM', 'MODE_4_REVIEW', 'MODE_5_DIAGRAM'],
      strengthsSummary: 'Cân bằng hoàn hảo giữa tốc độ phản hồi nhanh và chiều sâu ngôn từ văn học Việt Nam. Giữ nhịp văn mượt mà, giàu hình ảnh ngũ quan (Show, Don\'t Tell) và hạn chế tối đa văn phong dịch máy.',
      editorialAdvice: 'Lựa chọn mặc định tốt nhất cho 90% các chương tiểu thuyết từ 3.000 đến 4.500 từ. Đặc biệt xuất sắc khi viết hội thoại đời thường, miêu tả không gian Noir và chuyển cảnh mượt mà.'
    },
    {
      id: 'gemini-3.1-pro-preview',
      label: '👑 Gemini 3.1 Pro (Chuyên sâu — Giữ logic dài hơi & Phục bút phức tạp)',
      shortLabel: '👑 Gemini 3.1 Pro (Chuyên sâu)',
      apiTarget: 'gemini-2.5-pro',
      fallbacks: ['gemini-3.1-pro-preview', 'gemini-pro-latest', 'gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.0-flash'],
      tier: 'PRO_HIGH',
      isLite: false,
      contextWindowTokens: 2097152,
      maxOutputTokens: 16384,
      recommendedWordRange: { min: 2000, optimal: 4200, max: 8000 },
      recommendedTempRange: { min: 0.65, optimal: 0.8, max: 0.95 },
      scores: {
        literaryStyle: 9.7,
        emotionalResonance: 9.4,
        psychologicalDepth: 9.8,
        loreConsistency: 9.9,
        dialogueNaturalness: 9.5,
        speedAndResponsiveness: 8.4,
        antiClicheCompliance: 9.7
      },
      idealModes: ['MODE_1_DRAFT', 'MODE_3_AUDIT', 'MODE_2_BRAINSTORM', 'MODE_5_DIAGRAM'],
      strengthsSummary: 'Sở hữu khả năng suy luận đa tầng và tuân thủ tuyệt đối Ma trận "Ai Biết Gì" cũng như Sổ cái Phục bút (Chekhov\'s Gun). Không bao giờ để nhân vật lộ bí mật sớm hoặc mâu thuẫn mốc thời gian.',
      editorialAdvice: 'Khuyên dùng cho các chương cao trào, phá án trinh thám, đấu trí đa phe phái hoặc khi chạy Chế độ 3 (Kiểm toán Logic) và Chế độ 5 (Vẽ biểu đồ cốt truyện theo thời gian).'
    },
    {
      id: 'gemini-4-argon',
      label: '💎 Gemini 4 Argon (Đại Tự Sự — Văn phong tiểu thuyết xuất bản)',
      shortLabel: '💎 Gemini 4 Argon (Đại Tự Sự)',
      apiTarget: 'gemini-4-argon',
      fallbacks: ['gemini-4-argon-preview', 'gemini-3.1-pro-preview', 'gemini-2.5-pro', 'gemini-pro-latest', 'gemini-flash-latest', 'gemini-2.5-flash'],
      tier: 'PRO_HIGH',
      isLite: false,
      contextWindowTokens: 2097152,
      maxOutputTokens: 16384,
      recommendedWordRange: { min: 2500, optimal: 4500, max: 9000 },
      recommendedTempRange: { min: 0.75, optimal: 0.88, max: 1.05 },
      scores: {
        literaryStyle: 9.9,
        emotionalResonance: 9.8,
        psychologicalDepth: 9.7,
        loreConsistency: 9.7,
        dialogueNaturalness: 9.8,
        speedAndResponsiveness: 8.2,
        antiClicheCompliance: 9.8
      },
      idealModes: ['MODE_1_DRAFT', 'MODE_4_REVIEW'],
      strengthsSummary: 'Tinh chỉnh chuyên sâu cho đại tự sự văn học (Literary Fiction & High Light Novel). Câu văn giàu nhạc tính, nhịp điệu biến hóa linh hoạt, miêu tả ẩn dụ tinh tế như sách in xuất bản.',
      editorialAdvice: 'Lựa chọn hàng đầu khi bạn muốn viết những chương mở đầu ấn tượng, chương kết quyển (Volume Finale) hoặc cần trau chuốt văn phong nghệ thuật đỉnh cao.'
    },
    {
      id: 'gemini-4-hydrogen',
      label: '🧪 Gemini 4 Hydrogen (Siêu Suy Luận XHIGH · Cân Bằng Mạnh Toàn Diện)',
      shortLabel: '🧪 Gemini 4 Hydrogen (XHIGH)',
      apiTarget: 'gemini-4-hydrogen',
      fallbacks: ['gemini-4-hydrogen-preview', 'gemini-4-argon', 'gemini-3.1-pro-preview', 'gemini-3.8-flash', 'gemini-pro-latest', 'gemini-flash-latest', 'gemini-2.5-flash'],
      tier: 'PRO_HIGH',
      isLite: false,
      contextWindowTokens: 1048576,
      maxOutputTokens: 16384,
      recommendedWordRange: { min: 2000, optimal: 4000, max: 7500 },
      recommendedTempRange: { min: 0.72, optimal: 0.85, max: 1.0 },
      supportsXHighThinking: true,
      supportedThinkingLevels: ['LOW', 'MEDIUM', 'HIGH', 'XHIGH'],
      defaultThinkingLevel: 'HIGH',
      scores: {
        literaryStyle: 9.7,
        emotionalResonance: 9.6,
        psychologicalDepth: 9.8,
        loreConsistency: 9.9,
        dialogueNaturalness: 9.6,
        speedAndResponsiveness: 9.4,
        antiClicheCompliance: 9.7
      },
      pros: [
        'Hỗ trợ đầy đủ 4 mức tư duy Gemini 4: LOW, MEDIUM, HIGH và Siêu Cao (XHIGH).',
        'Cân bằng xuất sắc giữa tốc độ phản hồi nhanh, sức bền logic Story Bible 1 triệu token và văn phong tự nhiên.',
        'Độ chính xác cao khi suy luận chuỗi phục bút, Ma trận Ai Biết Gì và dựng biểu đồ Chế độ 5.'
      ],
      cons: [
        'Khi bật mức tư duy XHIGH hoặc HIGH, thời gian suy luận trước lúc xuất chữ sẽ chậm hơn một chút.'
      ],
      editorialAdvice: 'Lựa chọn đa năng lý tưởng cho cả viết bản thảo sâu (Chế độ 1), kiểm toán mâu thuẫn (Chế độ 3), trích xuất Story Bible và Chatbot phân tích chuyên sâu.'
    },

    {
      id: 'gemini-4-carbon',
      label: '🔥 Gemini 4 Carbon (Tâm Lý Chiến & Độc Thoại Nội Tâm Sâu)',
      shortLabel: '🔥 Gemini 4 Carbon (Tâm Lý Chiến)',
      apiTarget: 'gemini-4-carbon',
      fallbacks: ['gemini-4-carbon-preview', 'gemini-3.1-pro-preview', 'gemini-2.5-pro', 'gemini-pro-latest', 'gemini-flash-latest', 'gemini-2.5-flash'],
      tier: 'PRO_ULTRA',
      isLite: false,
      contextWindowTokens: 1048576,
      maxOutputTokens: 16384,
      recommendedWordRange: { min: 1800, optimal: 3800, max: 6500 },
      recommendedTempRange: { min: 0.75, optimal: 0.85, max: 1.0 },
      scores: {
        literaryStyle: 9.6,
        emotionalResonance: 9.7,
        psychologicalDepth: 9.9,
        loreConsistency: 9.4,
        dialogueNaturalness: 9.7,
        speedAndResponsiveness: 9.2,
        antiClicheCompliance: 9.5
      },
      idealModes: ['MODE_1_DRAFT', 'MODE_2_BRAINSTORM', 'MODE_3_AUDIT'],
      strengthsSummary: 'Chuyên gia khắc họa xung đột nội tâm, sự giằng xé đạo đức, đối thoại ẩn ý (Subtext) và bầu không khí căng thẳng nghẹt thở.',
      editorialAdvice: 'Rất hợp với thể loại Trinh thám Tâm lý, Noir Đô thị, Kinh dị Dân gian hoặc những phân cảnh nhân vật đối mặt với biến cố tâm lý lớn.'
    },
    {
      id: 'gemini-3.6-flash',
      label: '⚡ Gemini 3.6 Flash (Ổn định — Soạn thảo & Tham mưu cốt truyện)',
      shortLabel: '⚡ Gemini 3.6 Flash (Ổn định)',
      apiTarget: 'gemini-2.0-flash',
      fallbacks: ['gemini-flash-latest', 'gemini-2.5-flash', 'gemini-flash-lite-latest'],
      tier: 'RECOMMENDED_FLASH',
      isLite: false,
      contextWindowTokens: 1048576,
      maxOutputTokens: 8192,
      recommendedWordRange: { min: 1000, optimal: 3200, max: 5000 },
      recommendedTempRange: { min: 0.7, optimal: 0.85, max: 1.0 },
      scores: {
        literaryStyle: 9.0,
        emotionalResonance: 8.9,
        psychologicalDepth: 8.8,
        loreConsistency: 9.1,
        dialogueNaturalness: 9.1,
        speedAndResponsiveness: 9.7,
        antiClicheCompliance: 8.9
      },
      idealModes: ['MODE_1_DRAFT', 'MODE_2_BRAINSTORM', 'MODE_4_REVIEW', 'MODE_5_DIAGRAM'],
      strengthsSummary: 'Độ ổn định kết nối cực cao, phản hồi nhanh và bám sát dàn ý phân cảnh. Thích hợp để vừa viết nháp vừa bàn bạc ý tưởng liên tục mà không lo giới hạn Quota.',
      editorialAdvice: 'Phù hợp cho cả viết nháp chương mới lẫn Chế độ 2 (Tham mưu cốt truyện & gỡ bí) và Chế độ 4 (Đánh giá độc giả).'
    },
    {
      id: 'gemini-3.5-flash-lite',
      label: '🪶 Gemini 3.5 Flash-Lite (Siêu tốc — Chỉ nên dùng tóm tắt / nháp ngắn)',
      shortLabel: '🪶 Gemini 3.5 Flash-Lite (Nháp ngắn)',
      apiTarget: 'gemini-flash-lite-latest',
      fallbacks: ['gemini-2.5-flash-lite', 'gemini-2.0-flash-lite', 'gemini-flash-latest', 'gemini-2.5-flash'],
      tier: 'LITE_FAST',
      isLite: true,
      contextWindowTokens: 1048576,
      maxOutputTokens: 8192,
      recommendedWordRange: { min: 300, optimal: 1200, max: 2200 },
      recommendedTempRange: { min: 0.6, optimal: 0.75, max: 0.9 },
      scores: {
        literaryStyle: 7.2,
        emotionalResonance: 7.0,
        psychologicalDepth: 6.8,
        loreConsistency: 7.5,
        dialogueNaturalness: 7.4,
        speedAndResponsiveness: 9.9,
        antiClicheCompliance: 7.0
      },
      idealModes: ['MODE_2_BRAINSTORM'],
      strengthsSummary: 'Tốc độ phản hồi gần như tức thời, tiêu thụ cực ít hạn ngạch API. Tuy nhiên khả năng miêu tả văn học sâu và dung lượng chương dài bị rút gọn đáng kể.',
      editorialAdvice: '⚠️ KHUYẾN CÁO: Chỉ nên dùng Flash-Lite để hỏi đáp nhanh, tóm tắt chương cũ hoặc phác thảo dàn ý ngắn. Khi viết chương tiểu thuyết chính thức (3.000 - 4.000+ từ), bạn nên đổi sang Gemini 3.8 Flash, Gemini 3.1 Pro hoặc Gemini 4 Argon!'
    },
    {
      id: 'gemini-3.1-flash-lite-preview',
      label: '🪶 Gemini 3.1 Flash-Lite (Tiết kiệm — Gợi ý nhanh)',
      shortLabel: '🪶 Gemini 3.1 Flash-Lite (Tiết kiệm)',
      apiTarget: 'gemini-3.1-flash-lite-preview',
      fallbacks: ['gemini-flash-lite-latest', 'gemini-2.5-flash-lite', 'gemini-2.0-flash-lite', 'gemini-flash-latest'],
      tier: 'LITE_FAST',
      isLite: true,
      contextWindowTokens: 1048576,
      maxOutputTokens: 8192,
      recommendedWordRange: { min: 200, optimal: 1000, max: 2000 },
      recommendedTempRange: { min: 0.6, optimal: 0.75, max: 0.9 },
      scores: {
        literaryStyle: 7.0,
        emotionalResonance: 6.9,
        psychologicalDepth: 6.7,
        loreConsistency: 7.3,
        dialogueNaturalness: 7.2,
        speedAndResponsiveness: 9.9,
        antiClicheCompliance: 6.8
      },
      idealModes: ['MODE_2_BRAINSTORM'],
      strengthsSummary: 'Phiên bản siêu nhẹ tiết kiệm băng thông và hạn ngạch API tối đa cho các truy vấn kiểm tra nhanh hoặc đặt tên nhân vật.',
      editorialAdvice: '⚠️ KHUYẾN CÁO: Không khuyến khích dùng để viết bản thảo chương chính thức vì câu văn dễ bị tóm lược nhanh. Hãy ưu tiên chọn từ Gemini Flash trở lên!'
    }
  ];

  // Gắn danh mục mô hình vào không gian tên chuẩn `window.NoirStudio.models`
  NS.models = GEMINI_MODELS_CATALOG;

  // ==========================================================================
  // PHẦN 2: HỒ SƠ THÔNG SỐ SINH VĂN BẢN CHO 5 CHẾ ĐỘ AI (`ModeSamplingProfiles`)
  // ==========================================================================

  /**
   * Cấu hình tham số lấy mẫu (Sampling Parameters) chuyên biệt cho từng Chế độ AI (1 - 5).
   * Giúp tinh chỉnh `temperature`, `topP`, `topK` và `maxOutputTokens` sát nhất
   * với bản chất công việc của từng chế độ.
   */
  const MODE_EXECUTION_SAMPLING_PROFILES = Object.freeze({
    MODE_1_DRAFT: {
      modeId: 'MODE_1_DRAFT',
      modeTitle: '✍️ Chế độ 1: Viết Bản Nháp Tiểu Thuyết (3.000 - 4.000+ từ)',
      preferredTiers: ['RECOMMENDED_FLASH', 'PRO_HIGH'],
      recommendedModelIds: ['gemini-3.8-flash', 'gemini-4-argon', 'gemini-4-carbon', 'gemini-3.1-pro-preview'],
      discourageLiteModels: true,
      defaultTemperature: 0.85,
      defaultTopP: 0.94,
      defaultTopK: 48,
      minMaxOutputTokens: 8192,
      optimalMaxOutputTokens: 16384,
      liteWarningMessage: [
        '⚠️ Khuyến cáo chất lượng văn học (Chế độ 1 — Viết Bản Nháp):',
        'Bạn đang chọn mô hình dòng Flash-Lite. Các mô hình Lite được thiết kế để tóm tắt nhanh nên thường có xu hướng rút gọn tình tiết, lướt nhanh qua miêu tả nội tâm và khó đạt đủ dung lượng 3.000 - 4.000+ từ.',
        '💡 Lời khuyên: Hãy chọn từ dòng Gemini Flash trở lên (như 🌟 Gemini 3.8 Flash, 🔥 Gemini 4 Carbon, 👑 Gemini 3.1 Pro hoặc 💎 Gemini 4 Argon) để câu văn giàu cảm xúc, đối thoại sống động và giữ trọn vẹn chiều sâu tiểu thuyết!'
      ].join('\n')
    },

    MODE_2_BRAINSTORM: {
      modeId: 'MODE_2_BRAINSTORM',
      modeTitle: '🧭 Chế độ 2: Tham Mưu Cốt Truyện, Bẻ Lái (Plot Twist) & Gỡ Bí',
      preferredTiers: ['RECOMMENDED_FLASH', 'PRO_HIGH'],
      recommendedModelIds: ['gemini-3.8-flash', 'gemini-4-hydrogen', 'gemini-3.1-pro-preview', 'gemini-3.6-flash', 'gemini-4-carbon'],
      discourageLiteModels: false,
      defaultTemperature: 0.92,
      defaultTopP: 0.95,
      defaultTopK: 50,
      minMaxOutputTokens: 6144,
      optimalMaxOutputTokens: 8192,
      liteWarningMessage: [
        '💡 Gợi ý cho Chế độ 2 (Tham mưu cốt truyện):',
        'Dòng Flash-Lite có thể đưa ra ý tưởng nhanh, nhưng nếu bạn cần thiết kế các cú bẻ lái (Plot Twist) sâu sắc và gắn kết chặt với Phục bút trong Story Bible, hãy ưu tiên 🌟 Gemini 3.8 Flash, 🧪 Gemini 4 Hydrogen hoặc 👑 Gemini 3.1 Pro.'
      ].join('\n')
    },

    MODE_3_AUDIT: {
      modeId: 'MODE_3_AUDIT',
      modeTitle: '🔍 Chế độ 3: Kiểm Toán Logic, Soi Lỗi Mâu Thuẫn & Ma Trận Ai Biết Gì',
      preferredTiers: ['PRO_HIGH', 'PRO_ULTRA', 'RECOMMENDED_FLASH'],
      recommendedModelIds: ['gemini-4-hydrogen', 'gemini-3.1-pro-preview', 'gemini-3.8-flash', 'gemini-4-carbon'],
      discourageLiteModels: true,
      defaultTemperature: 0.45,
      defaultTopP: 0.88,
      defaultTopK: 32,
      minMaxOutputTokens: 6144,
      optimalMaxOutputTokens: 8192,
      liteWarningMessage: [
        '⚠️ Khuyến cáo độ chính xác suy luận (Chế độ 3 — Kiểm toán Logic):',
        'Kiểm toán mâu thuẫn cốt truyện đòi hỏi khả năng đối chiếu chéo hàng chục chi tiết giữa Bản thảo và Story Bible (Ma trận Ai Biết Gì, thời gian, vết thương). Mô hình Flash-Lite có thể bỏ sót các mâu thuẫn tinh vi.',
        '💡 Lời khuyên: Hãy chọn 🧪 Gemini 4 Hydrogen (tư duy Cao/XHIGH), 👑 Gemini 3.1 Pro hoặc 🌟 Gemini 3.8 Flash để đạt độ chính xác cao nhất!'
      ].join('\n')
    },

    MODE_4_REVIEW: {
      modeId: 'MODE_4_REVIEW',
      modeTitle: '📊 Chế độ 4: Đánh Giá Độc Giả, Chấm Điểm Đa Chiều & Phê Bình Văn Học',
      preferredTiers: ['RECOMMENDED_FLASH', 'PRO_HIGH'],
      recommendedModelIds: ['gemini-3.8-flash', 'gemini-4-hydrogen', 'gemini-4-argon', 'gemini-3.1-pro-preview'],
      discourageLiteModels: true,
      defaultTemperature: 0.72,
      defaultTopP: 0.92,
      defaultTopK: 40,
      minMaxOutputTokens: 6144,
      optimalMaxOutputTokens: 8192,
      liteWarningMessage: [
        '💡 Khuyến cáo cho Chế độ 4 (Đánh giá độc giả & Chấm điểm):',
        'Để nhận được bài phân tích sâu sắc về nhịp điệu, sức hút câu mở đầu (Hook), chiều sâu nhân vật và gợi ý sửa câu văn cụ thể, bạn nên chọn từ 🌟 Gemini 3.8 Flash, 🧪 Gemini 4 Hydrogen hoặc 💎 Gemini 4 Argon trở lên.'
      ].join('\n')
    },

    MODE_5_DIAGRAM: {
      modeId: 'MODE_5_DIAGRAM',
      modeTitle: '🎨 Chế độ 5: Vẽ Biểu Đồ Cốt Truyện, Mạng Lưới Nhân Vật & Trục Thời Gian',
      preferredTiers: ['PRO_HIGH', 'RECOMMENDED_FLASH'],
      recommendedModelIds: ['gemini-4-hydrogen', 'gemini-3.8-flash', 'gemini-3.1-pro-preview', 'gemini-3.6-flash'],
      discourageLiteModels: true,
      defaultTemperature: 0.55,
      defaultTopP: 0.9,
      defaultTopK: 36,
      minMaxOutputTokens: 8192,
      optimalMaxOutputTokens: 12288,
      liteWarningMessage: [
        '⚠️ Khuyến cáo cho Chế độ 5 (Vẽ biểu đồ cốt truyện & Trục thời gian):',
        'Chế độ 5 yêu cầu tổng hợp cấu trúc JSON/SVG phức tạp kèm bảng đối chiếu diễn biến theo giờ/ngày qua nhiều chương. Hãy ưu tiên chọn 🧪 Gemini 4 Hydrogen, 🌟 Gemini 3.8 Flash hoặc 👑 Gemini 3.1 Pro để biểu đồ được vẽ chi tiết và chuẩn xác nhất!'
      ].join('\n')
    }
  });

  NS.modeSamplingProfiles = MODE_EXECUTION_SAMPLING_PROFILES;

  // ==========================================================================
  // PHẦN 3: BỘ THEO DÕI SỨC KHỎE ENDPOINT & NGẮT MẠCH (`ModelCircuitBreaker`)
  // ==========================================================================

  /**
   * Theo dõi trạng thái hoạt động thực tế của từng `apiTarget` (ví dụ `gemini-2.5-flash`,
   * `gemini-2.5-pro`, `gemini-2.0-flash`) trong phiên làm việc hiện tại.
   * Nếu một endpoint trả về lỗi `429 Too Many Requests` hoặc `503 Overloaded`,
   * hệ thống sẽ đánh dấu thời gian chờ hồi phục (Cooldown) để lần gọi kế tiếp
   * ưu tiên định tuyến sang nhánh khỏe mạnh ngay tức khắc.
   */
  class ModelCircuitBreakerAndHealthTracker {
    constructor() {
      this.endpointStates = new Map();
      this.rateLimitCooldownMs = 45000; // 45 giây cách ly tạm nếu dính 429
      this.serverErrorCooldownMs = 25000; // 25 giây cách ly tạm nếu dính 503
    }

    _ensureEndpointRecord(apiTarget) {
      const key = String(apiTarget || 'gemini-2.5-flash').trim();
      if (!this.endpointStates.has(key)) {
        this.endpointStates.set(key, {
          apiTarget: key,
          totalCalls: 0,
          successCount: 0,
          failureCount: 0,
          rateLimit429Count: 0,
          overload503Count: 0,
          lastLatencyMs: 0,
          avgLatencyMs: 0,
          cooldownUntil: 0,
          lastSuccessAt: 0,
          lastFailureAt: 0,
          lastErrorMessage: ''
        });
      }
      return this.endpointStates.get(key);
    }

    /**
     * Ghi nhận một lần gọi API thành công lên `apiTarget`.
     */
    recordSuccess(apiTarget, latencyMs) {
      const rec = this._ensureEndpointRecord(apiTarget);
      const dur = typeof latencyMs === 'number' && latencyMs >= 0 ? latencyMs : 0;
      rec.totalCalls += 1;
      rec.successCount += 1;
      rec.lastLatencyMs = dur;
      rec.avgLatencyMs = rec.successCount === 1
        ? dur
        : Math.round((rec.avgLatencyMs * (rec.successCount - 1) + dur) / rec.successCount);
      rec.cooldownUntil = 0;
      rec.lastSuccessAt = Date.now();
    }

    /**
     * Ghi nhận một lần gọi API thất bại để kích hoạt cơ chế tự chuyển luồng (Circuit Breaker).
     */
    recordFailure(apiTarget, statusCode, errorMessage) {
      const rec = this._ensureEndpointRecord(apiTarget);
      const now = Date.now();
      rec.totalCalls += 1;
      rec.failureCount += 1;
      rec.lastFailureAt = now;
      rec.lastErrorMessage = String(errorMessage || `HTTP ${statusCode}`);

      if (Number(statusCode) === 429) {
        rec.rateLimit429Count += 1;
        rec.cooldownUntil = now + this.rateLimitCooldownMs;
      } else if (Number(statusCode) >= 500) {
        rec.overload503Count += 1;
        rec.cooldownUntil = now + this.serverErrorCooldownMs;
      }
    }

    /**
     * Kiểm tra xem một `apiTarget` hiện có đang trong thời gian Cooldown hay không.
     */
    isEndpointHealthy(apiTarget) {
      const rec = this._ensureEndpointRecord(apiTarget);
      return Date.now() >= rec.cooldownUntil;
    }

    /**
     * Sắp xếp danh sách các endpoint ứng viên sao cho các endpoint khỏe mạnh
     * đứng trước, các endpoint đang bị Cooldown đẩy xuống cuối làm phương án vét cạn.
     */
    prioritizeCandidateTargets(rawCandidates) {
      const seen = new Set();
      const healthyList = [];
      const coolingDownList = [];

      const list = Array.isArray(rawCandidates) ? rawCandidates : [];
      for (let i = 0; i < list.length; i++) {
        const target = String(list[i] || '').trim();
        if (!target || seen.has(target)) continue;
        seen.add(target);

        if (this.isEndpointHealthy(target)) {
          healthyList.push(target);
        } else {
          coolingDownList.push(target);
        }
      }

      return healthyList.concat(coolingDownList);
    }

    /**
     * Xuất báo cáo sức khỏe của toàn bộ các nhánh mô hình.
     */
    getHealthSnapshot() {
      const list = [];
      const now = Date.now();
      this.endpointStates.forEach((rec) => {
        list.push(Object.assign({}, rec, {
          isHealthyNow: now >= rec.cooldownUntil,
          cooldownRemainingSec: rec.cooldownUntil > now
            ? Math.ceil((rec.cooldownUntil - now) / 1000)
            : 0
        }));
      });
      return list;
    }

    resetAllCooldowns() {
      this.endpointStates.forEach((rec) => {
        rec.cooldownUntil = 0;
      });
    }
  }

  NS.modelHealth = new ModelCircuitBreakerAndHealthTracker();

  // ==========================================================================
  // PHẦN 4: BỘ ƯỚC TÍNH TOKEN TIẾNG VIỆT & PHÂN BỔ NGÂN SÁCH NGỮ CẢNH
  // ==========================================================================

  /**
   * Ước tính chính xác số lượng Token của văn bản tiếng Việt trên bộ Tokenizer
   * SentencePiece của dòng Gemini 2.5 / 3.x / 4.x.
   * Tiếng Việt có dấu thanh và nguyên âm ghép thường chiếm trung bình ~1.32 đến ~1.48
   * token cho mỗi từ đơn (âm tiết), hoặc ~0.34 token cho mỗi ký tự UTF-8.
   */
  class VietnameseTokenEstimatorAndBudgetAllocator {
    constructor() {
      this.avgTokensPerVietnameseSyllable = 1.38;
      this.avgSyllablesPerOutputToken = 0.72;
      this.vietnameseDiacriticRegex = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/gi;
    }

    /**
     * Đếm số âm tiết (từ đơn) trong chuỗi văn bản tiếng Việt.
     */
    countSyllables(text) {
      const clean = String(text || '').trim();
      if (!clean) return 0;
      return clean.split(/\s+/).filter(Boolean).length;
    }

    /**
     * Ước tính số lượng Token đầu vào/đầu ra cho một đoạn văn bản tiếng Việt.
     */
    estimateVietnameseTokens(text) {
      const str = String(text || '');
      if (!str.trim()) return 0;

      const syllableCount = this.countSyllables(str);
      const charCount = str.length;
      const diacriticMatches = str.match(this.vietnameseDiacriticRegex);
      const diacriticCount = diacriticMatches ? diacriticMatches.length : 0;

      // Công thức lai giữa số âm tiết và mật độ dấu tiếng Việt
      const baseBySyllables = syllableCount * this.avgTokensPerVietnameseSyllable;
      const baseByChars = charCount * 0.31 + diacriticCount * 0.14;
      const estimated = Math.ceil((baseBySyllables * 0.65) + (baseByChars * 0.35));

      return Math.max(1, estimated);
    }

    /**
     * Tính toán `maxOutputTokens` tối ưu cần yêu cầu lên Gemini API để đảm bảo
     * AI viết đủ `targetWordCount` từ tiếng Việt mà không bị cắt cụt giữa chừng.
     */
    calculateRequiredMaxOutputTokens(targetWordCount, modelSpec) {
      const words = Math.max(300, Number(targetWordCount) || 3500);
      // Nhân hệ số an toàn 1.65 để bao phủ dấu câu, xuống dòng và cấu trúc Markdown
      const neededTokens = Math.ceil(words * this.avgTokensPerVietnameseSyllable * 1.65);
      const modelCap = modelSpec && typeof modelSpec.maxOutputTokens === 'number'
        ? modelSpec.maxOutputTokens
        : 16384;

      return Math.min(modelCap, Math.max(4096, neededTokens));
    }

    /**
     * Phân tích chi tiết dung lượng từng thành phần trong Gói Ngữ Cảnh (Context Package)
     * trước khi gửi đi trong Prompt Tổng Hợp.
     */
    analyzeContextPackageBreakdown(packageComponents, modelId) {
      const comp = packageComponents && typeof packageComponents === 'object' ? packageComponents : {};
      const modelSpec = GEMINI_MODELS_CATALOG.find((m) => m.id === modelId) || GEMINI_MODELS_CATALOG[0];
      const maxWindow = modelSpec.contextWindowTokens || 1048576;

      const sections = [
        { key: 'systemPrompt', label: '📜 Khung Prompt Hệ Thống (Chế độ đang chọn)', text: String(comp.systemPrompt || '') },
        { key: 'bibleContent', label: '🏛️ Hồ sơ Story Bible & Thế giới quan', text: String(comp.bibleContent || '') },
        { key: 'characters', label: '👤 Hồ sơ Nhân vật Đa chiều', text: String(comp.characters || '') },
        { key: 'knowledgeMatrix', label: '🧠 Ma trận "Ai Biết Gì" (Chống lộ bí mật)', text: String(comp.knowledgeMatrix || '') },
        { key: 'cluesLedger', label: '🔫 Sổ cái Phục bút & Manh mối (Chekhov\'s Gun)', text: String(comp.cluesLedger || '') },
        { key: 'antiCliche', label: '🚫 Danh sách Từ sáo rỗng cấm dùng', text: String(comp.antiCliche || '') },
        { key: 'sceneMarkers', label: '🎬 Mốc chuyển phân cảnh & Đổi góc nhìn POV', text: String(comp.sceneMarkers || '') },
        { key: 'ragMemories', label: '🔍 Đoạn ký ức chống quên BM25 (RAG)', text: String(comp.ragMemories || '') },
        { key: 'recentManuscript', label: '📖 Đoạn cuối Bản thảo hiện tại (Giữ mạch văn)', text: String(comp.recentManuscript || '') },
        { key: 'userCommand', label: '✍️ Câu lệnh & Dàn ý của Tác giả', text: String(comp.userCommand || '') }
      ];

      let totalWords = 0;
      let totalTokens = 0;
      const breakdownRows = [];

      for (let i = 0; i < sections.length; i++) {
        const s = sections[i];
        const words = this.countSyllables(s.text);
        const tokens = this.estimateVietnameseTokens(s.text);
        totalWords += words;
        totalTokens += tokens;
        breakdownRows.push({
          key: s.key,
          label: s.label,
          words,
          tokens,
          chars: s.text.length,
          active: words > 0
        });
      }

      const usagePercent = Number(((totalTokens / maxWindow) * 100).toFixed(3));

      return {
        modelId: modelSpec.id,
        modelLabel: modelSpec.label,
        contextWindowTokens: maxWindow,
        totalWords,
        totalTokens,
        usagePercent,
        remainingTokens: Math.max(0, maxWindow - totalTokens),
        isWithinSafeLimit: totalTokens < maxWindow * 0.85,
        breakdownRows
      };
    }
  }

  NS.tokenBudgetEngine = new VietnameseTokenEstimatorAndBudgetAllocator();

  // ==========================================================================
  // PHẦN 5: CỐ VẤN CHẤT LƯỢNG MÔ HÌNH & ĐỊNH TUYẾN (`window.NoirStudio.modelAdvisor`)
  // ==========================================================================

  /**
   * Bộ Cố vấn Chất lượng Mô hình & Định tuyến Thông minh (`ModelQualityAdvisorAndTokenBudgetEngine`).
   * Đảm nhiệm:
   *   1. Tra cứu thông tin mô hình theo `id` hoặc `apiTarget`.
   *   2. Kiểm tra xem người dùng có đang chọn dòng `Flash-Lite` cho tác vụ viết tiểu thuyết
   *      hay không, và hiển thị khuyến cáo văn học rõ ràng khuyên dùng từ `Gemini Flash`
   *      trở lên (`Gemini 3.8 Flash`, `Gemini 3.1 Pro`, `Gemini 4 Argon`, `Gemini 4 Carbon`).
   *   3. Đổ dữ liệu đồng bộ vào tất cả các thẻ `<select>` chọn mô hình trên giao diện
   *      (không có nút Google Studio dư thừa).
   *   4. Tính toán lộ trình thực thi API (`resolveExecutionRoute`) kết hợp trạng thái
   *      Circuit Breaker của `NS.modelHealth`.
   */
  class ModelQualityAdvisorAndTokenBudgetEngine {
    constructor(catalog, samplingProfiles, tokenEngine, healthTracker) {
      this.catalog = Array.isArray(catalog) ? catalog : GEMINI_MODELS_CATALOG;
      this.samplingProfiles = samplingProfiles || MODE_EXECUTION_SAMPLING_PROFILES;
      this.tokenEngine = tokenEngine || NS.tokenBudgetEngine;
      this.healthTracker = healthTracker || NS.modelHealth;
      this.defaultModelId = 'gemini-3.8-flash';
    }

    /**
     * Lấy cấu hình chi tiết của một mô hình theo `id` (hoặc trả về `gemini-3.8-flash` mặc định).
     */
    getModelById(modelId) {
      const target = String(modelId || '').trim();
      if (!target) {
        return this.catalog[0];
      }
      for (let i = 0; i < this.catalog.length; i++) {
        if (this.catalog[i].id === target) {
          return this.catalog[i];
        }
      }
      for (let i = 0; i < this.catalog.length; i++) {
        if (this.catalog[i].apiTarget === target) {
          return this.catalog[i];
        }
      }
      return this.catalog[0];
    }

    /**
     * Lấy mô hình khuyên dùng mặc định cho sáng tác tiểu thuyết (`gemini-3.8-flash`).
     */
    getDefaultRecommendedModel() {
      return this.getModelById(this.defaultModelId);
    }

    /**
     * Kiểm tra xem mã mô hình có phải dòng rút gọn `Flash-Lite` hay không.
     */
    isLiteModel(modelId) {
      const spec = this.getModelById(modelId);
      if (!spec) return false;
      return Boolean(spec.isLite || spec.tier === 'LITE_FAST' || String(spec.id).toLowerCase().includes('lite'));
    }

    /**
     * Đánh giá mức độ phù hợp của mô hình đang chọn với Chế độ AI (1-5) và Số từ mục tiêu.
     * Trả về thông điệp khuyến cáo thân thiện bằng tiếng Việt.
     */
    evaluateModelFitness(modelId, modeId, targetWordCount, promptText) {
      const spec = this.getModelById(modelId);
      const modeProfile = this.samplingProfiles[modeId] || this.samplingProfiles.MODE_1_DRAFT;
      const targetWords = Math.max(300, Number(targetWordCount) || 3500);
      const promptTokens = this.tokenEngine.estimateVietnameseTokens(promptText || '');
      const requiredOutputTokens = this.tokenEngine.calculateRequiredMaxOutputTokens(targetWords, spec);

      const isLite = this.isLiteModel(spec.id);
      let warningLevel = 'NONE'; // 'NONE' | 'ADVISORY' | 'STRONG_WARNING'
      let humanizedRecommendation = '';
      let suggestedUpgradeModelId = 'gemini-3.8-flash';

      if (isLite) {
        if (modeId === 'MODE_1_DRAFT' || targetWords >= 2200) {
          warningLevel = 'STRONG_WARNING';
          suggestedUpgradeModelId = targetWords >= 4000 ? 'gemini-4-argon' : 'gemini-3.8-flash';
          humanizedRecommendation = [
            `💡 Lưu ý quan trọng: Bạn đang chọn "${spec.shortLabel || spec.label}" (dòng Flash-Lite siêu tốc chỉ dành cho tóm tắt hoặc nháp ngắn).`,
            `Để viết chương tiểu thuyết ${targetWords.toLocaleString('vi-VN')} từ giàu cảm xúc, miêu tả ngũ quan sâu sắc và giữ vững logic Story Bible, bạn nên chọn từ dòng Gemini Flash trở lên như:`,
            `• 🌟 Gemini 3.8 Flash (Mượt mà, giàu cảm xúc — Khuyên dùng nhất)`,
            `• 👑 Gemini 3.1 Pro (Chuyên sâu logic dài hơi & Phục bút)`,
            `• 💎 Gemini 4 Argon (Đại tự sự — Văn phong tiểu thuyết xuất bản)`
          ].join('\n');
        } else {
          warningLevel = 'ADVISORY';
          suggestedUpgradeModelId = 'gemini-3.8-flash';
          humanizedRecommendation = modeProfile.liteWarningMessage;
        }
      } else {
        humanizedRecommendation = `✅ Đang sử dụng "${spec.shortLabel || spec.label}" — Hoàn toàn phù hợp cho ${modeProfile.modeTitle}. ${spec.editorialAdvice || ''}`;
      }

      return {
        modelId: spec.id,
        modelLabel: spec.label,
        tier: spec.tier,
        isLite,
        warningLevel,
        showLiteWarningBanner: isLite,
        suggestedUpgradeModelId,
        humanizedRecommendation,
        promptTokens,
        requiredOutputTokens,
        scores: spec.scores || {}
      };
    }

    /**
     * Tính toán lộ trình thực thi hoàn chỉnh (Primary Target + Ordered Fallbacks + GenerationConfig)
     * phục vụ Module 15 (`ZeroCongestionClient`).
     */
    resolveExecutionRoute(selectedModelId, executionMode, targetWordCount, customTemperature) {
      const spec = this.getModelById(selectedModelId);
      const modeProfile = this.samplingProfiles[executionMode] || this.samplingProfiles.MODE_1_DRAFT;
      const targetWords = Math.max(300, Number(targetWordCount) || 3500);

      // Tập hợp chuỗi endpoint: apiTarget chính + fallbacks của model + nhánh dự phòng toàn cục
      const rawChain = [spec.apiTarget]
        .concat(Array.isArray(spec.fallbacks) ? spec.fallbacks : [])
        .concat(['gemini-2.5-flash', 'gemini-2.0-flash']);

      const prioritizedTargets = this.healthTracker.prioritizeCandidateTargets(rawChain);

      let temperature = typeof customTemperature === 'number' && !Number.isNaN(customTemperature)
        ? customTemperature
        : modeProfile.defaultTemperature;
      temperature = Math.max(0.1, Math.min(1.3, Number(temperature.toFixed(2))));

      const maxOutputTokens = Math.max(
        modeProfile.minMaxOutputTokens || 8192,
        this.tokenEngine.calculateRequiredMaxOutputTokens(targetWords, spec)
      );

      return {
        selectedModelId: spec.id,
        selectedModelLabel: spec.label,
        tier: spec.tier,
        isLite: Boolean(spec.isLite),
        primaryApiTarget: prioritizedTargets[0] || spec.apiTarget || 'gemini-2.5-flash',
        candidateTargets: prioritizedTargets,
        generationConfig: {
          temperature,
          topP: modeProfile.defaultTopP || 0.94,
          topK: modeProfile.defaultTopK || 45,
          maxOutputTokens
        }
      };
    }

    /**
     * Xây dựng chuỗi endpoint dự phòng thực tế (kết hợp `apiTarget`, `fallbacks`,
     * danh sách mô hình sống mới quét từ `GET /v1beta/models` và alias `-latest`).
     */
    buildFallbackChain(selectedModelId, liveModelsList = []) {
      const requested = String(selectedModelId || '').trim();
      const catalog = Array.isArray(NS.models) && NS.models.length > 0 ? NS.models : this.catalog;
      const spec =
        catalog.find((m) => m.id === requested) ||
        this.getModelById(requested);

      const candidates = [];
      const liveArr = Array.isArray(liveModelsList) ? liveModelsList.filter(Boolean) : [];

      const pushUnique = (ep) => {
        const clean = String(ep || '').replace(/^models\//, '').trim();
        if (clean && !candidates.includes(clean)) {
          candidates.push(clean);
        }
      };

      // Nếu ID người dùng chọn trùng khớp trực tiếp mô hình sống trên API Key -> ưu tiên thử trước
      if (requested && (liveArr.includes(requested) || /^gemini-(?:2\.|3[-.]|4[-.]|flash-latest|pro-latest|flash-lite-latest)/i.test(requested))) {
        pushUnique(requested);
      }

      if (spec) {
        if (Array.isArray(spec.endpointCandidates)) {
          spec.endpointCandidates.forEach(pushUnique);
        }
        if (spec.apiTarget) {
          pushUnique(spec.apiTarget);
        }
        if (Array.isArray(spec.fallbacks)) {
          spec.fallbacks.forEach(pushUnique);
        }
      }

      // Ưu tiên các mô hình sống trả về từ Google API Key khớp cùng phân khúc (Pro / Gemini 4 / Flash / Lite)
      const isPro = requested.includes('pro') || requested.includes('argon') || requested.includes('carbon') || requested.includes('hydrogen') || String(spec?.tier || '').includes('PRO');
      const isLite = this.isLiteModel(requested);
      if (liveArr.length > 0) {
        const rankedLive = liveArr.filter((id) => {
          if (isLite) return id.includes('lite') || id.includes('flash');
          if (isPro) return id.includes('pro') || id.includes('hydrogen') || id.includes('argon') || id.includes('carbon') || id.includes('flash');
          return !id.includes('lite');
        });
        rankedLive.forEach(pushUnique);
        liveArr.forEach(pushUnique);
      }

      // Chuỗi alias ổn định toàn cục (Google AI Studio + Vertex Express)
      [
        'gemini-2.5-flash',
        'gemini-flash-latest',
        'gemini-3-flash-preview',
        'gemini-2.5-pro',
        'gemini-pro-latest',
        'gemini-2.0-flash',
        'gemini-flash-lite-latest'
      ].forEach(pushUnique);

      // Cuối cùng giữ lại modelEndpoint vừa xác thực Flash-Lite thành công trên Key như phao cứu sinh chắc chắn
      try {
        const verifiedRec = NS.geminiRouter?.loadFlashLiteVerificationRecord?.();
        if (verifiedRec?.modelEndpoint) {
          pushUnique(verifiedRec.modelEndpoint);
        }
      } catch (_) {}

      return this.healthTracker ? this.healthTracker.prioritizeCandidateTargets(candidates) : candidates;
    }

    /**
     * Chuyển đổi mức độ tư duy (`MINIMAL` / `LOW` / `MEDIUM` / `HIGH`)
     * sang cấu trúc `thinkingConfig` chuẩn Gemini API 2026 theo đúng thế hệ mô hình.
     */
    resolveThinkingConfigForEndpoint(thinkingLevel, endpointModel) {
      const normalizedLevel = String(thinkingLevel || 'MEDIUM').trim().toUpperCase();
      const ep = String(endpointModel || '').toLowerCase();

      // Dòng 1.0 / 1.5 / 2.0 (trừ 2.0-flash-thinking) không hỗ trợ thinkingConfig
      if (/gemini-(?:1\.|2\.0-flash(?!-thinking))/.test(ep)) {
        return null;
      }

      // Dòng Gemini 4.x (Hydrogen 4, Argon 4, Carbon 4): hỗ trợ LOW, MEDIUM, HIGH, XHIGH (không nhận MINIMAL)
      if (/gemini-4/.test(ep)) {
        if (normalizedLevel === 'MINIMAL') {
          return { thinkingLevel: 'LOW' };
        }
        const safeG4Level = ['LOW', 'MEDIUM', 'HIGH', 'XHIGH'].includes(normalizedLevel)
          ? normalizedLevel
          : 'HIGH';
        return { thinkingLevel: safeG4Level };
      }

      // Dòng Gemini 3.x / *-latest hỗ trợ MINIMAL, LOW, MEDIUM, HIGH (giới hạn XHIGH -> HIGH tránh lỗi 400)
      if (/gemini-3|(?:flash|pro|flash-lite)-latest/.test(ep)) {
        const clampedG3 = normalizedLevel === 'XHIGH' ? 'HIGH' : normalizedLevel;
        if (ep.includes('pro') && clampedG3 === 'MINIMAL') {
          return { thinkingLevel: 'LOW' };
        }
        const safeLevel = ['MINIMAL', 'LOW', 'MEDIUM', 'HIGH'].includes(clampedG3)
          ? clampedG3
          : 'MEDIUM';
        if (ep.includes('pro') && safeLevel === 'MEDIUM') {
          return { thinkingLevel: 'HIGH' };
        }
        return { thinkingLevel: safeLevel };
      }

      // Dòng Gemini 2.5 dùng `thinkingBudget` (token ngân sách suy luận)
      if (ep.includes('2.5')) {
        const budgetMap = ep.includes('pro')
          ? { MINIMAL: 512, LOW: 1024, MEDIUM: 8192, HIGH: 24576, XHIGH: 32768 }
          : { MINIMAL: 0, LOW: 1024, MEDIUM: 8192, HIGH: 16384, XHIGH: 24576 };
        return {
          thinkingBudget: budgetMap[normalizedLevel] !== undefined ? budgetMap[normalizedLevel] : 8192
        };
      }

      return null;
    }

    /**
     * Bảng ước lượng hạn mức ngắn hạn (cửa sổ 5 giờ) & dài hạn (tuần 7 ngày) theo từng dòng mô hình.
     */
    getQuotaBaselineForModel(modelId) {
      const id = String(modelId || '').toLowerCase();
      if (id.includes('hydrogen')) {
        return {
          tierLabel: 'Gemini 4 Hydrogen',
          shortTerm5hReqLimit: 120,
          shortTerm5hTokenLimit: 1800000,
          longTermWeeklyReqLimit: 700,
          longTermWeeklyTokenLimit: 9000000,
          shortTermRpmLimit: 8,
          shortTermTpmLimit: 320000,
          longTermRpdLimit: 180
        };
      }
      if (id.includes('pro') || id.includes('argon') || id.includes('carbon')) {
        return {
          tierLabel: 'Pro / Argon / Carbon',
          shortTerm5hReqLimit: 80,
          shortTerm5hTokenLimit: 1200000,
          longTermWeeklyReqLimit: 450,
          longTermWeeklyTokenLimit: 6000000,
          shortTermRpmLimit: 5,
          shortTermTpmLimit: 250000,
          longTermRpdLimit: 100
        };
      }
      if (id.includes('lite')) {
        return {
          tierLabel: 'Flash-Lite',
          shortTerm5hReqLimit: 600,
          shortTerm5hTokenLimit: 4000000,
          longTermWeeklyReqLimit: 4500,
          longTermWeeklyTokenLimit: 20000000,
          shortTermRpmLimit: 30,
          shortTermTpmLimit: 1000000,
          longTermRpdLimit: 1500
        };
      }
      return {
        tierLabel: 'Flash Balanced',
        shortTerm5hReqLimit: 250,
        shortTerm5hTokenLimit: 2500000,
        longTermWeeklyReqLimit: 1800,
        longTermWeeklyTokenLimit: 12000000,
        shortTermRpmLimit: 15,
        shortTermTpmLimit: 1000000,
        longTermRpdLimit: 500
      };
    }

    getRealtimeGoogleLinks() {
      return {
        apiKeyStudio: 'https://aistudio.google.com/app/apikey',
        usageDashboard: 'https://aistudio.google.com/usage',
        rateLimitDashboard: 'https://aistudio.google.com/rate-limit',
        rateLimitsDocs: 'https://ai.google.dev/gemini-api/docs/rate-limits',
        modelsCatalogDocs: 'https://ai.google.dev/gemini-api/docs/models',
        thinkingDocs: 'https://ai.google.dev/gemini-api/docs/thinking',
        geminiWebApp: 'https://gemini.google.com/'
      };
    }

    /**
     * Đổ danh sách mô hình vào một thẻ `<select>` cụ thể trên giao diện.
     */
    populateModelSelectElement(selectElOrId, selectedModelId) {
      if (typeof document === 'undefined') return null;
      const selectEl = typeof selectElOrId === 'string'
        ? document.getElementById(selectElOrId)
        : selectElOrId;
      if (!selectEl) return null;

      const chosenSpec = this.getModelById(selectedModelId);
      selectEl.innerHTML = '';

      for (let i = 0; i < this.catalog.length; i++) {
        const m = this.catalog[i];
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.label;
        if (m.id === chosenSpec.id) {
          opt.selected = true;
        }
        selectEl.appendChild(opt);
      }

      selectEl.value = chosenSpec.id;
      return selectEl;
    }

    /**
     * Đồng bộ hóa cả 3 trình đơn chọn mô hình trong Studio:
     *   1. `#select-gemini-model` (Trong cửa sổ Trung tâm Điều khiển AI)
     *   2. `#confirm-modal-model-select` (Trong cửa sổ Xác nhận Prompt Tổng Hợp lần cuối)
     *   3. `#mode5-model-selector` (Trong khung Chế độ 5 Vẽ biểu đồ cốt truyện)
     */
    populateAllStudioModelDropdowns(preferredModelId) {
      if (typeof document === 'undefined') return;
      let savedModelId = preferredModelId;
      if (!savedModelId && typeof localStorage !== 'undefined' && NS.constants && NS.constants.STORAGE_KEYS) {
        try {
          savedModelId = localStorage.getItem(NS.constants.STORAGE_KEYS.SELECTED_MODEL);
        } catch (_) {}
      }
      const chosen = this.getModelById(savedModelId || this.defaultModelId);

      const dropdownIds = [
        'select-gemini-model',
        'confirm-modal-model-select',
        'mode5-model-selector',
        'tab4-bible-model-select',
        'smart-approve-model-select'
      ];

      for (let i = 0; i < dropdownIds.length; i++) {
        this.populateModelSelectElement(dropdownIds[i], chosen.id);
      }

      this.updateConfirmModalLiteWarningBanner(chosen.id);
    }

    /**
     * Hiển thị hoặc ẩn khung cảnh báo màu hồng `#confirm-model-lite-warning`
     * trong cửa sổ Xác nhận Prompt Tổng Hợp khi người dùng chọn dòng `Flash-Lite`.
     */
    updateConfirmModalLiteWarningBanner(modelId) {
      if (typeof document === 'undefined') return;
      const warningBox = document.getElementById('confirm-model-lite-warning');
      if (!warningBox) return;

      const isLite = this.isLiteModel(modelId);
      if (isLite) {
        warningBox.classList.remove('hidden');
        const spec = this.getModelById(modelId);
        warningBox.innerHTML = [
          `💡 <strong>Lưu ý chất lượng văn học:</strong> Bạn đang chọn dòng <strong>${spec.shortLabel || spec.id}</strong> (chỉ tối ưu tốc độ siêu nhanh & tóm tắt nháp ngắn).`,
          `Để viết chương tiểu thuyết chính thức <strong>3.000 - 4.000+ từ</strong> giàu cảm xúc, đối thoại tự nhiên và giữ vững logic dài hơi, hãy ưu tiên đổi sang <strong>🌟 Gemini 3.8 Flash</strong>, <strong>👑 Gemini 3.1 Pro</strong> hoặc <strong>💎 Gemini 4 Argon</strong> ở ô chọn bên trên nhé!`
        ].join(' ');
      } else {
        warningBox.classList.add('hidden');
      }
    }
  }

  NS.modelAdvisor = new ModelQualityAdvisorAndTokenBudgetEngine(
    GEMINI_MODELS_CATALOG,
    MODE_EXECUTION_SAMPLING_PROFILES,
    NS.tokenBudgetEngine,
    NS.modelHealth
  );

  // ==========================================================================
  // PHẦN 6: MA TRẬN TƯ VẤN MÔ HÌNH THEO LOẠI PHÂN CẢNH VĂN HỌC (`SceneModelMatrix`)
  // ==========================================================================

  /**
   * Bảng ma trận đối chiếu 12 dạng phân cảnh tiểu thuyết điển hình với
   * mô hình Gemini tối ưu nhất, nhiệt độ sáng tạo (Temperature) khuyên dùng
   * và chiến thuật triển khai nhịp văn.
   */
  const LITERARY_SCENE_MODEL_MATRIX = Object.freeze({
    OPENING_HOOK_SCENE: {
      sceneType: 'OPENING_HOOK_SCENE',
      title: '🎬 Cảnh Mở Đầu Chương / Mở Đầu Truyện (Hook Scene)',
      primaryModelId: 'gemini-4-argon',
      secondaryModelId: 'gemini-3.8-flash',
      recommendedTemperature: 0.88,
      targetPacing: 'Chậm rãi, giàu chi tiết ngũ quan (Thị giác + Thính giác + Khứu giác), gieo ngay một câu hỏi hoặc bầu không khí khác thường trong 3 đoạn đầu tiên.',
      reason: 'Gemini 4 Argon và Gemini 3.8 Flash có khả năng tạo câu mở đầu giàu nhạc tính, tránh kiểu giới thiệu lý lịch nhân vật khô khan.'
    },

    PSYCHOLOGICAL_CONFRONTATION: {
      sceneType: 'PSYCHOLOGICAL_CONFRONTATION',
      title: '🔥 Cảnh Đấu Trí, Thẩm Vấn & Xung Đột Nội Tâm Căng Thẳng',
      primaryModelId: 'gemini-4-carbon',
      secondaryModelId: 'gemini-3.1-pro-preview',
      recommendedTemperature: 0.82,
      targetPacing: 'Đan xen chặt chẽ giữa câu thoại ngắn sắc bén, cử chỉ vi mô (ánh mắt, nhịp thở, ngón tay gõ bàn) và độc thoại nội tâm phán đoán ý đồ đối phương.',
      reason: 'Gemini 4 Carbon được tinh chỉnh chuyên sâu cho tâm lý chiến và đối thoại ngầm (Subtext), giữ cho cuộc đấu trí có sức nặng thực sự.'
    },

    MYSTERY_DEDUCTION_AND_REVEAL: {
      sceneType: 'MYSTERY_DEDUCTION_AND_REVEAL',
      title: '🕵️ Cảnh Suy Luận Phá Án, Lật Mở Bí Mật & Thu Hồi Phục Bút',
      primaryModelId: 'gemini-3.1-pro-preview',
      secondaryModelId: 'gemini-3.8-flash',
      recommendedTemperature: 0.72,
      targetPacing: 'Mạch lạc, chặt chẽ từng mắt xích nhân quả. Mỗi kết luận của nhân vật đều phải trích dẫn lại đúng manh mối đã gieo ở các chương trước.',
      reason: 'Gemini 3.1 Pro có năng lực suy luận logic dài hơi mạnh nhất, đảm bảo không vi phạm Ma trận "Ai Biết Gì" và khớp nối chính xác Sổ cái Phục bút.'
    },

    HIGH_OCTANE_ACTION_COMBAT: {
      sceneType: 'HIGH_OCTANE_ACTION_COMBAT',
      title: '⚔️ Cảnh Hành Động, Rượt Đuổi & Chiến Đấu Tốc Độ Cao',
      primaryModelId: 'gemini-3.8-flash',
      secondaryModelId: 'gemini-4-carbon',
      recommendedTemperature: 0.86,
      targetPacing: 'Câu văn ngắn, động từ mạnh, nhịp điệu dồn dập. Chú trọng vị trí không gian, khoảng cách, tiêu hao thể lực và hệ quả của từng đòn đánh.',
      reason: 'Gemini 3.8 Flash duy trì nhịp độ nhanh, liền mạch và miêu tả chuyển động vật lý rõ ràng mà không bị sa đà vào thuyết minh dài dòng.'
    },

    EMOTIONAL_HEALING_AND_CONFESSION: {
      sceneType: 'EMOTIONAL_HEALING_AND_CONFESSION',
      title: '☕ Cảnh Bộc Bạch Tâm Sự, Lãng Mạn & Chữa Lành Vết Thương Lòng',
      primaryModelId: 'gemini-3.8-flash',
      secondaryModelId: 'gemini-4-argon',
      recommendedTemperature: 0.88,
      targetPacing: 'Lắng đọng, nhiều khoảng lặng tinh tế. Dùng cảnh vật xung quanh (tiếng mưa rơi, ánh đèn vàng, tách trà ấm) làm nền tôn lên cảm xúc nhân vật.',
      reason: 'Gemini 3.8 Flash và Gemini 4 Argon xử lý sắc thái biểu cảm tiếng Việt rất mềm mại, tự nhiên, chạm tới cảm xúc người đọc.'
    },

    MULTI_CHARACTER_GROUP_DIALOGUE: {
      sceneType: 'MULTI_CHARACTER_GROUP_DIALOGUE',
      title: '🗣️ Cảnh Hội Họp Nhiều Nhân Vật (Từ 3 - 6 Nhân Vật Cùng Đối Thoại)',
      primaryModelId: 'gemini-3.1-pro-preview',
      secondaryModelId: 'gemini-3.8-flash',
      recommendedTemperature: 0.8,
      targetPacing: 'Phân biệt rõ giọng điệu, xưng hô và thái độ riêng của từng nhân vật. Bắt buộc ghi rõ tên người nói ở cuối mỗi câu thoại: - Câu thoại (Tên nhân vật).',
      reason: 'Gemini 3.1 Pro giữ vững tính cách riêng biệt của nhiều nhân vật cùng lúc mà không bị lẫn lộn xưng hô hay giọng văn.'
    },

    FOLK_HORROR_ATMOSPHERIC_DREAD: {
      sceneType: 'FOLK_HORROR_ATMOSPHERIC_DREAD',
      title: '🏮 Cảnh Kinh Dị Đêm Khuya, Làng Cổ & Bầu Không Khí Rợn Ngợp',
      primaryModelId: 'gemini-4-carbon',
      secondaryModelId: 'gemini-4-argon',
      recommendedTemperature: 0.85,
      targetPacing: 'Tập trung vào âm thanh bất thường trong đêm tĩnh mịch, mùi hương trầm/ẩm mốc, bóng tối lập lòe và cảm giác bị quan sát từ trong sương mù.',
      reason: 'Gemini 4 Carbon khắc họa nỗi sợ tâm lý và chất liệu dân gian Việt Nam rất chân thực mà không dùng các cụm từ sáo rỗng.'
    },

    WORLD_BUILDING_AND_LORE_DISCOVERY: {
      sceneType: 'WORLD_BUILDING_AND_LORE_DISCOVERY',
      title: '🏛️ Cảnh Khám Phá Di Tích, Lịch Sử Thế Giới & Quy Luật Sức Mạnh',
      primaryModelId: 'gemini-4-argon',
      secondaryModelId: 'gemini-3.1-pro-preview',
      recommendedTemperature: 0.82,
      targetPacing: 'Lồng ghép thông tin thế giới quan (Lore) thông qua trải nghiệm trực tiếp và hành động khám phá của nhân vật thay vì đổ thông tin (Info-dump).',
      reason: 'Gemini 4 Argon biến các dữ kiện khô khan trong Story Bible thành những đoạn miêu tả hùng vĩ, sống động như phim điện ảnh.'
    },

    VOLUME_CLIMAX_AND_CLIFFHANGER: {
      sceneType: 'VOLUME_CLIMAX_AND_CLIFFHANGER',
      title: '🌋 Cảnh Cao Trào Cuối Quyển & Cú Bẻ Lái Kết Chương (Cliffhanger)',
      primaryModelId: 'gemini-4-argon',
      secondaryModelId: 'gemini-3.1-pro-preview',
      recommendedTemperature: 0.86,
      targetPacing: 'Đẩy xung đột lên đỉnh điểm, giải quyết câu hỏi lớn nhưng lập tức mở ra một bí ẩn chấn động hơn ở câu kết cuối cùng của chương.',
      reason: 'Kết hợp sức nặng đại tự sự của Gemini 4 Argon và độ chuẩn xác cốt truyện của Gemini 3.1 Pro.'
    },

    PLOT_CONSISTENCY_AUDIT: {
      sceneType: 'PLOT_CONSISTENCY_AUDIT',
      title: '🔍 Kiểm Toán Mâu Thuẫn Cốt Truyện, Thời Gian & Trạng Thái Nhân Vật',
      primaryModelId: 'gemini-3.1-pro-preview',
      secondaryModelId: 'gemini-3.8-flash',
      recommendedTemperature: 0.4,
      targetPacing: 'Phân tích khách quan, liệt kê từng điểm nghi vấn kèm trích dẫn cụ thể và đề xuất phương án sửa chữa hợp logic nhất.',
      reason: 'Nhiệt độ thấp (0.4) kết hợp mô hình Pro giúp rà soát chính xác 100% các lỗi lệch giờ giấc, vị trí hoặc lộ thông tin.'
    },

    TIMELINE_AND_RELATIONSHIP_DIAGRAM: {
      sceneType: 'TIMELINE_AND_RELATIONSHIP_DIAGRAM',
      title: '🎨 Tổng Hợp Sơ Đồ Trục Thời Gian & Mạng Lưới Quan Hệ (Chế Độ 5)',
      primaryModelId: 'gemini-3.8-flash',
      secondaryModelId: 'gemini-3.1-pro-preview',
      recommendedTemperature: 0.55,
      targetPacing: 'Trích xuất có cấu trúc toàn bộ mốc sự kiện theo thứ tự thời gian, vị trí nhân vật và cảnh báo mâu thuẫn để dựng biểu đồ SVG trực quan.',
      reason: 'Gemini 3.8 Flash xử lý dữ liệu đa chương nhanh và xuất cấu trúc biểu đồ cực kỳ ổn định.'
    },

    QUICK_IDEA_SPARK_AND_NAMING: {
      sceneType: 'QUICK_IDEA_SPARK_AND_NAMING',
      title: '⚡ Gợi Ý Nhanh Tên Nhân Vật, Tên Chiêu Thức Hoặc Tóm Tắt Ngắn',
      primaryModelId: 'gemini-3.6-flash',
      secondaryModelId: 'gemini-3.5-flash-lite',
      recommendedTemperature: 0.9,
      targetPacing: 'Trả lời ngắn gọn, liệt kê nhiều phương án đa dạng trong vài giây.',
      reason: 'Tác vụ ngắn gọn duy nhất mà bạn có thể dùng Flash hoặc Flash-Lite để tiết kiệm thời gian.'
    }
  });

  NS.sceneModelMatrix = LITERARY_SCENE_MODEL_MATRIX;

  // ==========================================================================
  // PHẦN 7: BỘ PHÂN TÍCH ĐỘ PHỨC TẠP PROMPT & RỦI RO LOGIC (`PromptRiskAnalyzer`)
  // ==========================================================================

  /**
   * Phân tích câu lệnh của người dùng cùng dữ liệu Story Bible trước khi bấm
   * chạy Prompt Tổng Hợp, giúp phát hiện sớm các điểm thiếu sót (như quên chọn POV,
   * yêu cầu số từ quá lớn nhưng dàn ý quá ngắn, hoặc nhắc đến nhân vật chưa có
   * trong Hồ sơ nhân vật Tab 4).
   */
  class PromptComplexityAndRiskAnalyzer {
    /**
     * Phân tích toàn diện câu lệnh và trạng thái Story Bible hiện tại.
     */
    analyzeBeforeSynthesis(options) {
      const opts = options && typeof options === 'object' ? options : {};
      const userCommand = String(opts.userCommand || '').trim();
      const modeId = String(opts.modeId || 'MODE_1_DRAFT');
      const modelId = String(opts.modelId || 'gemini-3.8-flash');
      const targetWords = Math.max(300, Number(opts.targetWords) || 3500);
      const povText = String(opts.pov || '').trim();

      const state = NS.state || {};
      const sb = state.storyBible || {};
      const characters = Array.isArray(sb.characters) ? sb.characters : [];
      const knowledgeMatrix = Array.isArray(sb.knowledgeMatrix) ? sb.knowledgeMatrix : [];
      const cluesLedger = Array.isArray(sb.cluesLedger) ? sb.cluesLedger : [];
      const sceneMarkers = Array.isArray(state.sceneMarkers) ? state.sceneMarkers : [];

      const advisories = [];
      const strengths = [];

      // 1. Kiểm tra mô hình có phải Flash-Lite không
      if (NS.modelAdvisor && NS.modelAdvisor.isLiteModel(modelId)) {
        advisories.push({
          severity: 'HIGH',
          code: 'LITE_MODEL_SELECTED',
          title: 'Đang chọn mô hình dòng Flash-Lite rút gọn',
          suggestion: 'Hãy đổi sang 🌟 Gemini 3.8 Flash, 👑 Gemini 3.1 Pro hoặc 💎 Gemini 4 Argon ở bước xác nhận để bản thảo có chiều sâu văn học và đạt đủ số từ mục tiêu.'
        });
      } else {
        const spec = NS.modelAdvisor ? NS.modelAdvisor.getModelById(modelId) : null;
        strengths.push(`Mô hình chất lượng cao đã chọn: ${spec ? spec.shortLabel : modelId}`);
      }

      // 2. Kiểm tra độ dài câu lệnh so với số từ mục tiêu ở Chế độ 1
      const commandWords = NS.tokenBudgetEngine.countSyllables(userCommand);
      if (modeId === 'MODE_1_DRAFT' && commandWords < 15 && sceneMarkers.length === 0) {
        advisories.push({
          severity: 'MEDIUM',
          code: 'SHORT_BEAT_OUTLINE',
          title: 'Câu lệnh / Dàn ý chương đang khá ngắn (' + commandWords + ' từ)',
          suggestion: `Bạn đang đặt mục tiêu ${targetWords.toLocaleString('vi-VN')} từ nhưng dàn ý đầu vào hơi ngắn. Hệ thống sẽ tự động bổ sung khung phân cảnh 4 hồi và dữ kiện Story Bible để AI triển khai đầy đủ không bị đuối ý.`
        });
      } else if (commandWords >= 20) {
        strengths.push(`Câu lệnh chỉ đạo chi tiết (${commandWords} từ)`);
      }

      // 3. Kiểm tra liên kết Story Bible
      const hasBibleContent = Boolean(
        (sb.renderedContent && sb.renderedContent.trim().length > 20) ||
        (sb.templateFrame && sb.templateFrame.trim().length > 20)
      );
      if (hasBibleContent) {
        strengths.push('Hồ sơ Story Bible đã được nạp tự động 100%');
      } else {
        advisories.push({
          severity: 'LOW',
          code: 'BIBLE_MINIMAL',
          title: 'Nội dung Story Bible chính thức đang còn trống',
          suggestion: 'Bạn có thể cập nhật thế giới quan ở Tab 4 hoặc bấm "✅ Duyệt & Chốt Bản Thảo" sau khi viết xong để hệ thống tự động trích xuất vào Story Bible.'
        });
      }

      // 4. Kiểm tra các nhân vật xuất hiện trong câu lệnh
      const mentionedCharacters = [];
      const lowerCmd = userCommand.toLowerCase();
      for (let i = 0; i < characters.length; i++) {
        const ch = characters[i];
        if (ch && ch.name && lowerCmd.includes(ch.name.toLowerCase())) {
          mentionedCharacters.push(ch.name);
        }
      }
      if (mentionedCharacters.length > 0) {
        strengths.push(`Phát hiện nhân vật trong Hồ sơ: ${mentionedCharacters.join(', ')}`);
      }

      // 5. Kiểm tra Ma trận Ai Biết Gì & Phục bút
      if (knowledgeMatrix.length > 0) {
        strengths.push(`Đã kích hoạt ${knowledgeMatrix.length} quy tắc Ma trận "Ai Biết Gì" chống lộ bí mật`);
      }
      const activeClues = cluesLedger.filter((c) => c && c.status !== 'RESOLVED');
      if (activeClues.length > 0) {
        strengths.push(`Đang theo dõi ${activeClues.length} phục bút / manh mối chưa thu hồi`);
      }

      // 6. Kiểm tra mốc chuyển phân cảnh / đổi góc nhìn POV
      if (sceneMarkers.length > 0) {
        strengths.push(`Đã gắn kết ${sceneMarkers.length} mốc chuyển phân cảnh / đổi POV vào Prompt Tổng`);
      }

      return {
        modeId,
        modelId,
        targetWords,
        povText: povText || 'Ngôi thứ 3 giới hạn',
        commandWords,
        mentionedCharacters,
        advisories,
        strengths,
        isReadyForSynthesis: true
      };
    }
  }

  NS.promptRiskAnalyzer = new PromptComplexityAndRiskAnalyzer();

  // ==========================================================================
  // PHẦN 8: BỘ LẬP KẾ HOẠCH PHÂN BỔ SỐ TỪ 4 HỒI CHO CHƯƠNG DÀI (`LongChapterPlanner`)
  // ==========================================================================

  /**
   * Khi tác giả yêu cầu viết chương dài (ví dụ 3.000 - 5.000+ từ), các mô hình AI
   * thông thường rất dễ mắc bệnh "đầu voi đuôi chuột" (viết rất nhanh tới kết chương
   * chỉ sau 1.200 từ).
   * `SmartLongChapterPacingPlanner` tự động chia tổng số từ mục tiêu thành 4 Hồi (Acts)
   * với định mức từ cụ thể cho từng Hồi để đưa thẳng vào Prompt Tổng Hợp.
   */
  class SmartLongChapterPacingPlanner {
    /**
     * Tạo bản phân bổ dung lượng 4 Hồi theo tổng số từ mục tiêu và danh sách Mốc chuyển cảnh.
     */
    buildFourActWordAllocationPlan(targetWordCount, sceneMarkers) {
      const totalWords = Math.max(500, Number(targetWordCount) || 3500);
      const markers = Array.isArray(sceneMarkers) ? sceneMarkers : [];

      const act1Words = Math.round(totalWords * 0.22);
      const act2Words = Math.round(totalWords * 0.30);
      const act3Words = Math.round(totalWords * 0.30);
      const act4Words = Math.max(150, totalWords - (act1Words + act2Words + act3Words));

      const acts = [
        {
          actNumber: 1,
          title: 'HỒI I — KHỞI CẢNH, ĐỊNH VỊ KHÔNG GIAN & NEO CẢM XÚC',
          targetWords: act1Words,
          percentage: '22%',
          directive: [
            `Dung lượng bắt buộc cho Hồi I: khoảng ${act1Words.toLocaleString('vi-VN')} từ.`,
            'Mở đầu bằng chi tiết ngũ quan cụ thể (ánh sáng, âm thanh, mùi vị, xúc giác) gắn liền với trạng thái tâm lý hiện tại của nhân vật giữ góc nhìn (POV).',
            'Tuyệt đối không tóm tắt vội vã; hãy để độc giả bước vào không gian của phân cảnh một cách tự nhiên.'
          ].join(' ')
        },
        {
          actNumber: 2,
          title: 'HỒI II — PHÁT TRIỂN TÌNH TIẾT, ĐỐI THOẠI ĐA TẦNG & GIEO MANH MỐI',
          targetWords: act2Words,
          percentage: '30%',
          directive: [
            `Dung lượng bắt buộc cho Hồi II: khoảng ${act2Words.toLocaleString('vi-VN')} từ.`,
            'Triển khai tương tác giữa các nhân vật thông qua đối thoại chuẩn "- Câu thoại (Tên nhân vật)" kết hợp cử chỉ vi mô và độc thoại nội tâm.',
            'Tuân thủ nghiêm ngặt Ma trận "Ai Biết Gì": nhân vật chỉ phản ứng với thông tin họ thực sự biết.'
          ].join(' ')
        },
        {
          actNumber: 3,
          title: 'HỒI III — CAO TRÀO XUNG ĐỘT, ĐẤU TRÍ HOẶC BƯỚC NGOẶT TRỌNG TÂM',
          targetWords: act3Words,
          percentage: '30%',
          directive: [
            `Dung lượng bắt buộc cho Hồi III: khoảng ${act3Words.toLocaleString('vi-VN')} từ.`,
            'Đẩy mâu thuẫn chính của chương lên đỉnh điểm. Khắc họa rõ áp lực, sự lựa chọn khó khăn hoặc phát hiện quan trọng làm thay đổi cục diện.',
            'Không dùng từ ngữ sáo rỗng AI; dùng hành động và chi tiết cụ thể để truyền tải sức nặng của cao trào.'
          ].join(' ')
        },
        {
          actNumber: 4,
          title: 'HỒI IV — DƯ ÂM NỘI TÂM & MÓC CÂU KẾT CHƯƠNG (CLIFFHANGER)',
          targetWords: act4Words,
          percentage: '18%',
          directive: [
            `Dung lượng bắt buộc cho Hồi IV: khoảng ${act4Words.toLocaleString('vi-VN')} từ.`,
            'Lắng đọng cảm xúc sau cao trào, cập nhật trạng thái mới của nhân vật và kết thúc chương bằng một chi tiết gợi mở đắt giá khiến người đọc muốn lật ngay sang chương tiếp theo.'
          ].join(' ')
        }
      ];

      let formattedTextBlock = [
        `=== KẾ HOẠCH PHÂN BỔ DUNG LƯỢNG 4 HỒI (TỔNG MỤC TIÊU: ${totalWords.toLocaleString('vi-VN')} TỪ) ===`,
        `YÊU CẦU BẮT BUỘC: Triển khai đầy đủ, chi tiết cả 4 Hồi bên dưới để tổng độ dài toàn chương đạt khoảng ${totalWords.toLocaleString('vi-VN')} từ tiếng Việt. Không được tóm tắt hay cắt ngắn giữa chừng:`
      ];

      for (let i = 0; i < acts.length; i++) {
        const a = acts[i];
        formattedTextBlock.push(`• ${a.title} (~${a.targetWords} từ): ${a.directive}`);
      }

      if (markers.length > 0) {
        formattedTextBlock.push('');
        formattedTextBlock.push(`=== Lộ trình ${markers.length} Mốc Chuyển Phân Cảnh / Đổi Góc Nhìn (POV) cần lồng ghép tuần tự ===`);
        for (let m = 0; m < markers.length; m++) {
          const mk = markers[m];
          formattedTextBlock.push(
            `  [Mốc phân cảnh #${m + 1}] POV: ${mk.pov || 'Giữ nguyên'} | Thời gian: ${mk.time || 'Tiếp nối'} | Địa điểm: ${mk.location || 'Hiện tại'} | Mục tiêu cảnh: ${mk.goal || 'Phát triển mạch truyện'}`
          );
        }
      }

      return {
        totalTargetWords: totalWords,
        acts,
        sceneMarkersIncluded: markers.length,
        formattedPromptDirective: formattedTextBlock.join('\n')
      };
    }
  }

  NS.longChapterPlanner = new SmartLongChapterPacingPlanner();

  // ==========================================================================
  // PHẦN 9: BỘ PHIÊN DỊCH LỖI API THÂN THIỆN (`HumanizedApiErrorTranslator`)
  // ==========================================================================

  /**
   * Chuyển đổi mọi mã lỗi kỹ thuật từ Google Gemini API hoặc lỗi mạng thành
   * thông báo tiếng Việt thân thiện, dễ hiểu kèm hướng dẫn khắc phục cụ thể.
   */
  class HumanizedApiErrorTranslator {
    translateError(errorObjOrStatus, rawMessage, attemptedModel) {
      const status = typeof errorObjOrStatus === 'number'
        ? errorObjOrStatus
        : (errorObjOrStatus && errorObjOrStatus.status ? Number(errorObjOrStatus.status) : 0);

      const msg = String(
        rawMessage ||
        (errorObjOrStatus && errorObjOrStatus.message) ||
        errorObjOrStatus ||
        ''
      );
      const lower = msg.toLowerCase();

      if (status === 400 || lower.includes('api_key_invalid') || lower.includes('invalid api key') || lower.includes('key not valid')) {
        return {
          code: 'INVALID_API_KEY',
          httpStatus: 400,
          retryable: false,
          userTitle: '🔑 Khóa Gemini API Key chưa chính xác hoặc đã hết hạn',
          userMessage: `Khóa API bạn nhập chưa được máy chủ chấp nhận (bắt đầu bằng "AIza..." hoặc "AQ..."). Chi tiết: ${msg.slice(0, 140) || 'API_KEY_INVALID'}. Bạn hãy kiểm tra lại khóa trong Cổng Kết Nối hoặc Tab 6 nhé!`,
          suggestedAction: 'OPEN_API_KEY_MODAL'
        };
      }

      if (status === 401 || status === 403 || lower.includes('permission_denied') || lower.includes('unauthenticated')) {
        return {
          code: 'PERMISSION_DENIED',
          httpStatus: status || 403,
          retryable: false,
          userTitle: '🛡️ Khóa API chưa được cấp quyền truy cập mô hình này',
          userMessage: 'Khóa API của bạn chưa bật quyền Generative Language API hoặc bị giới hạn vùng. Hệ thống có thể tự động chuyển sang nhánh mô hình Flash tiêu chuẩn.',
          suggestedAction: 'SWITCH_FALLBACK_MODEL'
        };
      }

      if (status === 404 || lower.includes('not found') || lower.includes('is not found for api version')) {
        return {
          code: 'MODEL_ENDPOINT_NOT_FOUND',
          httpStatus: 404,
          retryable: true,
          userTitle: '🔄 Đang tự động định tuyến sang nhánh mô hình tương thích',
          userMessage: `Nhánh "${attemptedModel || 'đang chọn'}" đang bảo trì định danh trên máy chủ Google. Hệ thống tự động chuyển sang nhánh dự phòng tương đương ngay lập tức.`,
          suggestedAction: 'AUTO_FALLBACK_NEXT_TARGET'
        };
      }

      if (status === 429 || lower.includes('quota') || lower.includes('rate limit') || lower.includes('resource_exhausted')) {
        return {
          code: 'RATE_LIMITED_429',
          httpStatus: 429,
          retryable: true,
          userTitle: '⏳ Hạn ngạch gọi liên tiếp trong phút đang đầy (HTTP 429)',
          userMessage: 'Bạn vừa gửi nhiều yêu cầu liên tục khiến nhánh mô hình hiện tại tạm chạm giới hạn mỗi phút. Hệ thống đang tự động chuyển luồng sang nhánh dự phòng chống nghẽn!',
          suggestedAction: 'AUTO_FALLBACK_WITH_BACKOFF'
        };
      }

      if (status >= 500 || lower.includes('overloaded') || lower.includes('internal error') || lower.includes('unavailable')) {
        return {
          code: 'SERVER_OVERLOADED_5XX',
          httpStatus: status || 503,
          retryable: true,
          userTitle: '🌐 Máy chủ Google Gemini đang cao điểm tạm thời',
          userMessage: 'Máy chủ đang xử lý lượng truy cập lớn. Hệ thống đang tự động thử lại trên nhánh mô hình ổn định tiếp theo.',
          suggestedAction: 'AUTO_FALLBACK_WITH_BACKOFF'
        };
      }

      if (lower.includes('safety') || lower.includes('blocked') || lower.includes('prohibited_content')) {
        return {
          code: 'SAFETY_FILTER_TRIGGERED',
          httpStatus: 200,
          retryable: false,
          userTitle: '⚠️ Bộ lọc an toàn nội dung của API vừa kích hoạt',
          userMessage: 'Phân cảnh đang viết có một số từ khóa xung đột mạnh khiến bộ lọc mặc định của Google tạm dừng. Bạn hãy giảm nhẹ từ ngữ bạo lực trực diện và chuyển sang miêu tả tâm lý / ẩn dụ văn học nhé!',
          suggestedAction: 'ADJUST_PROMPT_WORDING'
        };
      }

      if (lower.includes('failed to fetch') || lower.includes('networkerror') || lower.includes('load failed')) {
        return {
          code: 'NETWORK_DISCONNECTED',
          httpStatus: 0,
          retryable: true,
          userTitle: '📡 Kết nối mạng Internet đang bị gián đoạn',
          userMessage: 'Không thể kết nối tới máy chủ Gemini. Bản thảo của bạn vẫn được lưu an toàn 100% trên máy. Hãy kiểm tra lại Wi-Fi/4G rồi thử lại nhé!',
          suggestedAction: 'CHECK_INTERNET_CONNECTION'
        };
      }

      return {
        code: 'GENERAL_API_ERROR',
        httpStatus: status || 0,
        retryable: true,
        userTitle: '⚠️ Có sự cố nhỏ khi kết nối với Trợ lý AI',
        userMessage: `Chi tiết: ${msg || 'Lỗi không xác định'}. Bạn hãy kiểm tra lại API Key tại Tab 6 hoặc đổi sang mô hình Gemini 3.8 Flash nhé.`,
        suggestedAction: 'RETRY_OR_SWITCH_MODEL'
      };
    }

    explainError(errorObjOrStatus, rawMessage, attemptedModel) {
      return this.translateError(errorObjOrStatus, rawMessage, attemptedModel);
    }
  }

  NS.apiErrorAdvisor = new HumanizedApiErrorTranslator();

  // ==========================================================================
  // PHẦN 10: BỘ ĐIỀU TIẾT TỐC ĐỘ GỌI API CHỐNG NGHẼN (`AdaptiveRateLimiter`)
  // ==========================================================================

  /**
   * Đảm bảo các yêu cầu gửi tới Google Gemini API luôn giữ khoảng cách an toàn
   * tối thiểu để tránh bị máy chủ Google chặn lỗi `429 Too Many Requests` khi
   * người dùng bấm liên tục.
   */
  class AdaptiveTokenBucketRateLimiter {
    constructor() {
      this.requestTimestamps = [];
      this.windowMs = 60000;
      this.maxRequestsPerMinute = 14;
      this.minIntervalBetweenCallsMs = 950;
      this.lastCallTimestamp = 0;
    }

    /**
     * Chờ khoảng thời gian ngắn hợp lý nếu người dùng vừa gọi API cách đây chưa tới 1 giây.
     */
    async acquireSlot() {
      const now = Date.now();
      this.requestTimestamps = this.requestTimestamps.filter((ts) => now - ts < this.windowMs);

      const elapsedSinceLast = now - this.lastCallTimestamp;
      if (elapsedSinceLast < this.minIntervalBetweenCallsMs) {
        const waitMs = this.minIntervalBetweenCallsMs - elapsedSinceLast;
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }

      const afterWait = Date.now();
      this.lastCallTimestamp = afterWait;
      this.requestTimestamps.push(afterWait);
      return {
        grantedAt: afterWait,
        callsInLastMinute: this.requestTimestamps.length
      };
    }

    getCurrentRPMUsage() {
      const now = Date.now();
      this.requestTimestamps = this.requestTimestamps.filter((ts) => now - ts < this.windowMs);
      return {
        callsInLastMinute: this.requestTimestamps.length,
        maxRecommendedRPM: this.maxRequestsPerMinute
      };
    }
  }

  NS.rateLimiter = new AdaptiveTokenBucketRateLimiter();

  // ==========================================================================
  // PHẦN 11: BỘ ĐỒNG BỘ GIAO DIỆN CHỌN MÔ HÌNH & THÔNG SỐ AI (`ModelUIController`)
  // ==========================================================================

  /**
   * Tự động gắn kết và đồng bộ hóa 2 chiều giữa LocalStorage và tất cả các
   * điều khiển chọn Mô hình, Nhiệt độ, Số từ mục tiêu, Chế độ chạy AI trên giao diện.
   */
  class StudioModelDropdownUIController {
    initBindings() {
      if (typeof document === 'undefined') return;
      const KEYS = NS.constants ? NS.constants.STORAGE_KEYS : {};

      // 1. Khôi phục model đã lưu hoặc dùng mặc định `gemini-3.8-flash`
      let savedModel = 'gemini-3.8-flash';
      try {
        if (typeof localStorage !== 'undefined' && KEYS.SELECTED_MODEL) {
          savedModel = localStorage.getItem(KEYS.SELECTED_MODEL) || 'gemini-3.8-flash';
        }
      } catch (_) {}

      NS.modelAdvisor.populateAllStudioModelDropdowns(savedModel);

      // 2. Đồng bộ khi người dùng đổi model ở bất kỳ ô chọn nào trong 3 ô
      const syncModelSelection = (newModelId, sourceElementId) => {
        const spec = NS.modelAdvisor.getModelById(newModelId);
        try {
          if (typeof localStorage !== 'undefined' && KEYS.SELECTED_MODEL) {
            localStorage.setItem(KEYS.SELECTED_MODEL, spec.id);
          }
        } catch (_) {}

        const allSelectIds = [
          'select-gemini-model',
          'confirm-modal-model-select',
          'mode5-model-selector',
          'tab4-bible-model-select',
          'smart-approve-model-select'
        ];
        for (let i = 0; i < allSelectIds.length; i++) {
          const id = allSelectIds[i];
          if (id === sourceElementId) continue;
          const el = document.getElementById(id);
          if (el && el.value !== spec.id) {
            el.value = spec.id;
          }
        }

        NS.modelAdvisor.updateConfirmModalLiteWarningBanner(spec.id);

        if (NS.bus && NS.constants && NS.constants.EVENTS) {
          NS.bus.emit(NS.constants.EVENTS.MODEL_SELECTED, {
            modelId: spec.id,
            modelLabel: spec.label,
            isLite: spec.isLite,
            sourceElementId
          });
        }
      };

      const bindDropdown = (elId) => {
        if (typeof NS.bindOnce === 'function') {
          NS.bindOnce(elId, 'change', (evt) => {
            syncModelSelection(evt.target.value, elId);
          }, `mod02_sync_${elId}`);
        }
      };

      bindDropdown('select-gemini-model');
      bindDropdown('confirm-modal-model-select');
      bindDropdown('mode5-model-selector');
      bindDropdown('tab4-bible-model-select');
      bindDropdown('smart-approve-model-select');

      // 3. Đồng bộ thanh trượt Nhiệt độ sáng tạo (Temperature)
      const tempSlider = document.getElementById('slider-ai-temperature');
      const tempLabel = document.getElementById('label-temp-val');
      if (tempSlider) {
        try {
          const savedTemp = localStorage.getItem(KEYS.TEMPERATURE);
          if (savedTemp) {
            tempSlider.value = savedTemp;
            if (tempLabel) tempLabel.textContent = savedTemp;
          }
        } catch (_) {}

        if (typeof NS.bindOnce === 'function') {
          NS.bindOnce(tempSlider, 'input', () => {
            if (tempLabel) tempLabel.textContent = tempSlider.value;
            try {
              localStorage.setItem(KEYS.TEMPERATURE, tempSlider.value);
            } catch (_) {}
          }, 'mod02_temp_slider_input');
        }
      }

      // 4. Đồng bộ Số từ đầu ra mong muốn (Target Word Count)
      const wordsInput = document.getElementById('input-target-word-count');
      if (wordsInput) {
        try {
          const savedWords = localStorage.getItem(KEYS.TARGET_WORDS);
          if (savedWords) {
            wordsInput.value = savedWords;
          }
        } catch (_) {}

        if (typeof NS.bindOnce === 'function') {
          NS.bindOnce(wordsInput, 'change', () => {
            const val = Math.max(300, Math.min(15000, Number(wordsInput.value) || 3500));
            wordsInput.value = String(val);
            try {
              localStorage.setItem(KEYS.TARGET_WORDS, String(val));
            } catch (_) {}
          }, 'mod02_target_words_change');
        }
      }
    }
  }

  NS.modelUIController = new StudioModelDropdownUIController();

  // ==========================================================================
  // PHẦN 12: THƯ VIỆN CHỈ THỊ NGHỆ THUẬT VĂN HỌC THEO MÔ HÌNH (`PromptEnhancers`)
  // ==========================================================================

  /**
   * Kho chỉ thị nâng cao chất lượng văn chương tiếng Việt (Literary Craft Directives)
   * được tối ưu hóa riêng cho từng phân hạng mô hình (`PRO_HIGH`, `RECOMMENDED_FLASH`, `LITE_FAST`).
   * Giúp mô hình phát huy tối đa thế mạnh biểu đạt và khắc phục triệt để văn phong công nghiệp.
   */
  const MODEL_TIER_LITERARY_ENHANCERS = Object.freeze({
    PRO_HIGH: {
      tierId: 'PRO_HIGH',
      tierTitle: 'Phân Hạng Chuyên Sâu & Đại Tự Sự (Gemini 4 Hydrogen / Gemini 3.1 Pro / Gemini 4 Argon)',
      coreDirectives: [
        '1. KIẾN TRÚC ĐẠI TỰ SỰ: Duy trì cấu trúc lớp lang giữa ngoại cảnh, hành động vật lý và dòng chảy ý thức (Stream of Consciousness) của nhân vật giữ điểm nhìn (POV).',
        '2. ĐỐI CHIẾU CHÉO ĐA TẦNG: Trước khi viết mỗi phân cảnh, tự động kiểm tra chéo với Ma trận "Ai Biết Gì" và Sổ cái Phục bút (Chekhov\'s Gun) để đảm bảo tính nhất quán tuyệt đối về mặt thời gian, không gian, thương tích và thông tin bí mật.',
        '3. NHẠC TÍNH TIẾNG VIỆT: Phối hợp nhịp nhàng giữa câu ngắn giàu động lực (trong cảnh căng thẳng/hành động) và câu ghép đa tầng giàu hình ảnh ẩn dụ (trong cảnh nội tâm/miêu tả không gian).',
        '4. ĐỐI THOẠI ĐA THANH (POLYPHONIC DIALOGUE): Mỗi nhân vật phải có vốn từ vựng, nhịp ngắt câu và thái độ phát ngôn độc lập. Bắt buộc trình bày đúng chuẩn: - Câu thoại (Tên nhân vật).'
      ],
      sensoryChecklist: [
        'Thị giác: Ánh sáng, bóng đổ, màu sắc biến đổi theo góc nhìn và khoảng cách.',
        'Thính giác: Âm thanh gần, âm thanh vọng từ xa, và cả những khoảng lặng đột ngột.',
        'Khứu giác & Vị giác: Mùi mưa trên nhựa đường, mùi gỗ cũ, khói thuốc, hương trà hoặc vị đắng nơi đầu lưỡi.',
        'Xúc giác & Cảm nhận cơ thể: Hơi lạnh qua lớp vải, độ nhám của bề mặt, nhịp tim và hơi thở thực tế.'
      ]
    },

    RECOMMENDED_FLASH: {
      tierId: 'RECOMMENDED_FLASH',
      tierTitle: 'Phân Hạng Cân Bằng Giàu Cảm Xúc (Gemini 3.8 Flash / Gemini 4 Carbon / Gemini 3.6 Flash)',
      coreDirectives: [
        '1. MƯỢT MÀ & GIÀU CẢM XÚC: Chú trọng sự tự nhiên, thuần Việt trong từng câu chữ; tuyệt đối tránh lối dịch cứng nhắc hoặc lạm dụng đại từ nhân xưng thiếu tự nhiên.',
        '2. NGUYÊN TẮC SHOW-DON\'T-TELL: Không dán nhãn cảm xúc bằng tính từ chung chung ("anh rất buồn", "cô vô cùng sợ hãi"); hãy thể hiện qua hành động nhỏ, ánh nhìn, lời nói ngập ngừng và tương tác với đồ vật xung quanh.',
        '3. GIỮ VỮNG DUNG LƯỢNG 4 HỒI: Triển khai chi tiết từng bước của phân cảnh, không đốt cháy giai đoạn hay tóm tắt lướt qua các cuộc đối thoại quan trọng.',
        '4. CHUẨN HÓA HỘI THOẠI: Trình bày 100% các câu thoại theo quy ước: - Câu thoại (Tên nhân vật).'
      ],
      sensoryChecklist: [
        'Kết hợp ít nhất 3 giác quan trong mỗi lần chuyển cảnh hoặc mở đầu đoạn mới.',
        'Gắn liền miêu tả cảnh vật với tâm trạng hiện tại của nhân vật POV.'
      ]
    },

    LITE_FAST: {
      tierId: 'LITE_FAST',
      tierTitle: 'Phân Hạng Siêu Tốc Rút Gọn (Gemini 3.5 Flash-Lite / Gemini 3.1 Flash-Lite)',
      coreDirectives: [
        '1. CHỐNG TÓM TẮT VỘI VÃ: Dù là mô hình tốc độ cao, tuyệt đối không được viết kiểu liệt kê dàn ý khi đang ở Chế độ 1 (Viết Bản Nháp). Phải viết thành văn xuôi tiểu thuyết hoàn chỉnh.',
        '2. BÁM SÁT STORY BIBLE: Không tự ý bịa thêm nhân vật phụ hoặc thiết lập mới mâu thuẫn với Hồ sơ nhân vật Tab 4.',
        '3. CHUẨN HÓA HỘI THOẠI: Bắt buộc ghi rõ tên người nói ở cuối câu thoại: - Câu thoại (Tên nhân vật).'
      ],
      sensoryChecklist: [
        'Ưu tiên miêu tả hành động rõ ràng và đối thoại trực tiếp.'
      ]
    }
  });

  NS.modelTierEnhancers = MODEL_TIER_LITERARY_ENHANCERS;

  // ==========================================================================
  // PHẦN 13: BỘ ĐÓNG GÓI PAYLOAD & PHÂN TÍCH PHẢN HỒI GEMINI (`PayloadBuilder`)
  // ==========================================================================

  /**
   * Chuẩn bị cấu trúc JSON Request Body gửi lên Google Gemini REST API (`generateContent`)
   * và bóc tách an toàn văn bản phản hồi cùng lý do kết thúc (`finishReason`).
   */
  class GeminiPayloadAndResponseConfigurator {
    constructor() {
      /**
       * Cấu hình bộ lọc an toàn ở mức `BLOCK_ONLY_HIGH` cho cả 4 danh mục
       * để các phân cảnh tiểu thuyết trinh thám, hành động, kinh dị dân gian
       * hoặc xung đột tâm lý không bị chặn nhầm bởi bộ lọc mặc định quá nhạy.
       */
      this.novelWritingSafetySettings = [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_ONLY_HIGH'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_ONLY_HIGH'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_ONLY_HIGH'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_ONLY_HIGH'
        }
      ];
    }

    /**
     * Xây dựng đối tượng JSON Payload chuẩn cho endpoint `:generateContent`.
     */
    buildGenerateContentPayload(promptText, systemInstructionText, generationConfig) {
      const cleanPrompt = String(promptText || '').trim();
      const cleanSys = String(systemInstructionText || '').trim();
      const genCfg = generationConfig && typeof generationConfig === 'object'
        ? generationConfig
        : { temperature: 0.85, topP: 0.94, topK: 45, maxOutputTokens: 16384 };

      const payload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: cleanPrompt }]
          }
        ],
        generationConfig: {
          temperature: typeof genCfg.temperature === 'number' ? genCfg.temperature : 0.85,
          topP: typeof genCfg.topP === 'number' ? genCfg.topP : 0.94,
          topK: typeof genCfg.topK === 'number' ? genCfg.topK : 45,
          maxOutputTokens: typeof genCfg.maxOutputTokens === 'number' ? genCfg.maxOutputTokens : 16384
        },
        safetySettings: this.novelWritingSafetySettings
      };

      if (cleanSys.length > 0) {
        payload.systemInstruction = {
          parts: [{ text: cleanSys }]
        };
      }

      return payload;
    }

    /**
     * Trích xuất văn bản và thông tin мета từ phản hồi JSON của Google Gemini API.
     */
    extractResponseDetails(rawJson) {
      if (!rawJson || typeof rawJson !== 'object') {
        return {
          ok: false,
          text: '',
          finishReason: 'EMPTY_RESPONSE',
          promptTokenCount: 0,
          candidatesTokenCount: 0,
          totalTokenCount: 0,
          warningMessage: 'Phản hồi từ máy chủ trống hoặc không đúng định dạng JSON.'
        };
      }

      const usage = rawJson.usageMetadata || {};
      const promptTokenCount = Number(usage.promptTokenCount) || 0;
      const candidatesTokenCount = Number(usage.candidatesTokenCount) || 0;
      const totalTokenCount = Number(usage.totalTokenCount) || (promptTokenCount + candidatesTokenCount);

      const candidates = Array.isArray(rawJson.candidates) ? rawJson.candidates : [];
      if (candidates.length === 0) {
        const blockReason = rawJson.promptFeedback && rawJson.promptFeedback.blockReason
          ? String(rawJson.promptFeedback.blockReason)
          : 'NO_CANDIDATES';
        return {
          ok: false,
          text: '',
          finishReason: blockReason,
          promptTokenCount,
          candidatesTokenCount,
          totalTokenCount,
          warningMessage: `Yêu cầu bị chặn bởi bộ lọc đầu vào (${blockReason}). Hãy điều chỉnh nhẹ từ ngữ nhạy cảm trong câu lệnh.`
        };
      }

      const firstCandidate = candidates[0] || {};
      const finishReason = String(firstCandidate.finishReason || 'STOP');
      const parts = firstCandidate.content && Array.isArray(firstCandidate.content.parts)
        ? firstCandidate.content.parts
        : [];

      const textChunks = [];
      for (let i = 0; i < parts.length; i++) {
        if (parts[i] && typeof parts[i].text === 'string') {
          textChunks.push(parts[i].text);
        }
      }

      const combinedText = textChunks.join('\n').trim();
      let warningMessage = '';

      if (finishReason === 'MAX_TOKENS') {
        warningMessage = '💡 Lưu ý: Đầu ra vừa chạm trần giới hạn Token tối đa của một lần gọi. Bạn có thể bấm chạy tiếp để nối thêm phần còn lại.';
      } else if (finishReason === 'SAFETY' || finishReason === 'RECITATION') {
        warningMessage = `⚠️ Phản hồi dừng sớm do bộ lọc (${finishReason}). Hãy giảm nhẹ các từ khóa nhạy cảm trực diện.`;
      }

      return {
        ok: combinedText.length > 0,
        text: combinedText,
        finishReason,
        promptTokenCount,
        candidatesTokenCount,
        totalTokenCount,
        warningMessage
      };
    }
  }

  NS.payloadConfigurator = new GeminiPayloadAndResponseConfigurator();

  // ==========================================================================
  // PHẦN 14: BỘ THỐNG KÊ HIỆU SUẤT SỬ DỤNG MÔ HÌNH (`ModelUsageAnalytics`)
  // ==========================================================================

  /**
   * Ghi nhận lịch sử sử dụng từng mô hình AI (số lần gọi, tổng số từ sinh ra,
   * thời gian phản hồi trung bình, tỷ lệ chuyển mạch dự phòng) giúp tác giả
   * biết mô hình nào đang viết hợp ý và hiệu quả nhất cho bộ truyện của mình.
   */
  class ModelTelemetryAndUsageAnalyticsEngine {
    constructor() {
      this.storageKey = 'noir_v38_model_usage_analytics_v1';
      this.records = {};
      this._loadFromStorage();
    }

    _loadFromStorage() {
      if (typeof localStorage === 'undefined') return;
      try {
        const raw = localStorage.getItem(this.storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            this.records = parsed;
          }
        }
      } catch (_) {
        this.records = {};
      }
    }

    _saveToStorage() {
      if (typeof localStorage === 'undefined') return;
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.records));
      } catch (_) {}
    }

    /**
     * Ghi nhận một lần thực thi AI hoàn tất.
     */
    recordGenerationRun(details) {
      const d = details && typeof details === 'object' ? details : {};
      const modelId = String(d.modelId || 'gemini-3.8-flash');
      const modeId = String(d.modeId || 'MODE_1_DRAFT');
      const wordsGenerated = Math.max(0, Number(d.wordsGenerated) || 0);
      const tokensUsed = Math.max(0, Number(d.tokensUsed) || 0);
      const durationMs = Math.max(1, Number(d.durationMs) || 1000);
      const usedFallback = Boolean(d.usedFallback);

      if (!this.records[modelId]) {
        this.records[modelId] = {
          modelId,
          runsCount: 0,
          totalWordsGenerated: 0,
          totalTokensUsed: 0,
          totalDurationMs: 0,
          fallbackCount: 0,
          modeBreakdown: {},
          lastUsedAt: 0
        };
      }

      const rec = this.records[modelId];
      rec.runsCount += 1;
      rec.totalWordsGenerated += wordsGenerated;
      rec.totalTokensUsed += tokensUsed;
      rec.totalDurationMs += durationMs;
      if (usedFallback) rec.fallbackCount += 1;
      rec.modeBreakdown[modeId] = (rec.modeBreakdown[modeId] || 0) + 1;
      rec.lastUsedAt = Date.now();

      if (NS.state && NS.state.sessionMetrics) {
        NS.state.sessionMetrics.aiRequestsCount += 1;
        NS.state.sessionMetrics.aiTokensEstimated += tokensUsed;
      }

      this._saveToStorage();
      return rec;
    }

    /**
     * Tạo bảng so sánh trực quan toàn bộ 7 mô hình trong danh mục kèm số liệu thực tế.
     */
    getFormattedModelsComparisonReport() {
      const rows = [];
      for (let i = 0; i < GEMINI_MODELS_CATALOG.length; i++) {
        const m = GEMINI_MODELS_CATALOG[i];
        const usage = this.records[m.id] || {
          runsCount: 0,
          totalWordsGenerated: 0,
          totalDurationMs: 0
        };
        const avgWordsPerRun = usage.runsCount > 0
          ? Math.round(usage.totalWordsGenerated / usage.runsCount)
          : 0;
        const avgSecondsPerRun = usage.runsCount > 0
          ? Number((usage.totalDurationMs / usage.runsCount / 1000).toFixed(1))
          : 0;

        rows.push({
          id: m.id,
          label: m.label,
          shortLabel: m.shortLabel,
          tier: m.tier,
          isLite: m.isLite,
          apiTarget: m.apiTarget,
          fallbacksCount: Array.isArray(m.fallbacks) ? m.fallbacks.length : 0,
          literaryScore: m.scores ? m.scores.literaryStyle : 9.0,
          logicScore: m.scores ? m.scores.loreConsistency : 9.0,
          runsCount: usage.runsCount,
          totalWordsGenerated: usage.totalWordsGenerated,
          avgWordsPerRun,
          avgSecondsPerRun,
          recommendationNote: m.editorialAdvice
        });
      }
      return rows;
    }
  }

  NS.modelAnalytics = new ModelTelemetryAndUsageAnalyticsEngine();

  // ==========================================================================
  // PHẦN 15: BỘ HIỂN THỊ BÁO CÁO GÓI NGỮ CẢNH & CẨM NANG CHỌN MÔ HÌNH (`PackageInspector`)
  // ==========================================================================

  /**
   * Phục vụ nút `📦 Kiểm tra Gói Ngữ Cảnh` (`#btn-preview-context-package`) tại Tab 3
   * và cung cấp bảng hướng dẫn chọn mô hình chi tiết cho người dùng.
   */
  class ModelContextPackageInspectorAndGuide {
    /**
     * Thu thập toàn bộ dữ kiện hiện có trong `NS.state` (Story Bible, Nhân vật,
     * Ma trận Ai Biết Gì, Phục bút, Từ cấm, Mốc chuyển phân cảnh, Ký ức BM25,
     * Đoạn cuối bản thảo) và trả về bản tóm tắt trực quan dễ đọc.
     */
    buildLiveContextPackageSummary() {
      const st = NS.state || {};
      const sb = st.storyBible || {};
      const chapters = Array.isArray(st.chapters) ? st.chapters : [];
      const activeChap = chapters.find((c) => c && c.id === st.activeChapterId) || chapters[0] || null;

      const templateFrame = String(sb.templateFrame || '').trim();
      const renderedBible = String(sb.renderedContent || '').trim();
      const characters = Array.isArray(sb.characters) ? sb.characters : [];
      const knowledgeMatrix = Array.isArray(sb.knowledgeMatrix) ? sb.knowledgeMatrix : [];
      const cluesLedger = Array.isArray(sb.cluesLedger) ? sb.cluesLedger : [];
      const antiCliche = String(sb.antiClicheBlacklist || '').trim();
      const sceneMarkers = Array.isArray(st.sceneMarkers) ? st.sceneMarkers : [];
      const ragChunks = Array.isArray(st.ragChunks) ? st.ragChunks : [];

      const activeManuscript = activeChap ? String(activeChap.content || '') : '';
      const tailExcerpt = activeManuscript.length > 2200
        ? activeManuscript.slice(-2200)
        : activeManuscript;

      let selectedModelId = 'gemini-3.8-flash';
      if (typeof document !== 'undefined') {
        const sel = document.getElementById('select-gemini-model');
        if (sel && sel.value) selectedModelId = sel.value;
      }

      const charactersText = characters.map((c, idx) => {
        return `${idx + 1}. ${c.name || 'Nhân vật'} (${c.role || 'Vai trò'}): ${c.personality || ''} | Trạng thái: ${c.currentStatus || 'Bình thường'}`;
      }).join('\n');

      const knowledgeText = knowledgeMatrix.map((k, idx) => {
        return `${idx + 1}. Bí mật: ${k.secretTitle || k.secret || ''} | Ai biết: ${k.whoKnows || ''} | Ai CHƯA biết: ${k.whoDoesNotKnow || ''}`;
      }).join('\n');

      const cluesText = cluesLedger.map((cl, idx) => {
        return `${idx + 1}. Phục bút: ${cl.clueName || cl.title || ''} (${cl.status || 'PLANTED'}) — Gieo tại: ${cl.plantedInChapter || ''}`;
      }).join('\n');

      const markersText = sceneMarkers.map((mk, idx) => {
        return `${idx + 1}. [POV: ${mk.pov || ''}] [Thời gian: ${mk.time || ''}] [Địa điểm: ${mk.location || ''}] -> ${mk.goal || ''}`;
      }).join('\n');

      const promptInputEl = typeof document !== 'undefined'
        ? document.getElementById('s18-fullscreen-prompt-textarea')
        : null;
      const userCommandText = promptInputEl ? String(promptInputEl.value || '') : '';

      const breakdown = NS.tokenBudgetEngine.analyzeContextPackageBreakdown({
        systemPrompt: 'Khung Prompt Hệ Thống 5 Chế độ chuẩn văn học Việt Nam',
        bibleContent: [templateFrame, renderedBible].filter(Boolean).join('\n\n'),
        characters: charactersText,
        knowledgeMatrix: knowledgeText,
        cluesLedger: cluesText,
        antiCliche,
        sceneMarkers: markersText,
        ragMemories: `Đã lập chỉ mục ${ragChunks.length} đoạn ký ức chống quên BM25`,
        recentManuscript: tailExcerpt,
        userCommand: userCommandText
      }, selectedModelId);

      const formattedLines = [
        '====================================================================',
        '📦 BÁO CÁO KIỂM TRA GÓI NGỮ CẢNH TỰ ĐỘNG ĐÍNH KÈM VÀO PROMPT TỔNG HỢP',
        '====================================================================',
        `• Mô hình đang chọn      : ${breakdown.modelLabel}`,
        `• Tổng số từ ngữ cảnh    : ${breakdown.totalWords.toLocaleString('vi-VN')} từ`,
        `• Ước tính Token ngữ cảnh: ~${breakdown.totalTokens.toLocaleString('vi-VN')} / ${breakdown.contextWindowTokens.toLocaleString('vi-VN')} tokens (${breakdown.usagePercent}%)`,
        `• Trạng thái bộ nhớ      : ${breakdown.isWithinSafeLimit ? '✅ Dư dả, an toàn tuyệt đối (Không lo tràn bộ nhớ)' : '⚠️ Ngữ cảnh rất lớn, hệ thống sẽ tự động lọc ưu tiên BM25'}`,
        '',
        '--- CHI TIẾT 10 LỚP DỮ LIỆU ĐƯỢC KẾT NỐI TRONG PROMPT TỔNG HỢP ---'
      ];

      for (let i = 0; i < breakdown.breakdownRows.length; i++) {
        const r = breakdown.breakdownRows[i];
        const statusBadge = r.active ? '✅ Đã nạp' : '⚪ Đang trống';
        formattedLines.push(
          `  ${i + 1}. ${r.label}: [${statusBadge}] — ${r.words.toLocaleString('vi-VN')} từ (~${r.tokens.toLocaleString('vi-VN')} tokens)`
        );
      }

      formattedLines.push('');
      formattedLines.push('--- THỐNG KÊ HỒ SƠ CHỐNG QUÊN (TAB 4 & TAB 2) ---');
      formattedLines.push(`  • Tổng số chương trong dự án : ${chapters.length} chương`);
      formattedLines.push(`  • Hồ sơ nhân vật đa chiều    : ${characters.length} nhân vật`);
      formattedLines.push(`  • Ma trận "Ai Biết Gì"       : ${knowledgeMatrix.length} quy tắc bảo mật thông tin`);
      formattedLines.push(`  • Sổ cái Phục bút (Chekhov)  : ${cluesLedger.length} manh mối`);
      formattedLines.push(`  • Mốc chuyển phân cảnh / POV : ${sceneMarkers.length} mốc`);
      formattedLines.push(`  • Chỉ mục ký ức BM25 (0-Token): ${ragChunks.length} đoạn văn bản`);
      formattedLines.push('');
      formattedLines.push('💡 Gợi ý: Bấm nút "🎛️ Chọn chế độ chạy mô hình, thông số và nhập câu lệnh" rồi bấm "🚀 Chạy Prompt Tổng Hợp" để xem toàn văn bản ghép nối chính thức!');

      return {
        breakdown,
        formattedReportText: formattedLines.join('\n')
      };
    }

    /**
     * Xuất cẩm nang tư vấn chọn mô hình bằng tiếng Việt để hiển thị trong Cẩm nang A-Z
     * hoặc khi người dùng hỏi Trợ lý Viên Bi Số 8.
     */
    getHumanizedModelSelectionGuideText() {
      return [
        '🌟 CẨM NANG CHỌN MÔ HÌNH GEMINI 2026 CHO TÁC GIẢ TIỂU THUYẾT:',
        '',
        '1. 🌟 Gemini 3.8 Flash (Khuyên dùng mặc định):',
        '   - Tốt nhất cho: Viết bản nháp chương mới 3.000 - 4.000+ từ (Chế độ 1), Tham mưu cốt truyện (Chế độ 2) và Vẽ biểu đồ (Chế độ 5).',
        '   - Ưu điểm: Văn phong tiếng Việt giàu cảm xúc, đối thoại tự nhiên, tốc độ phản hồi nhanh và ổn định.',
        '',
        '2. 👑 Gemini 3.1 Pro (Chuyên sâu logic & Phục bút):',
        '   - Tốt nhất cho: Các chương đấu trí, suy luận phá án, thu hồi phục bút phức tạp hoặc chạy Kiểm toán Logic (Chế độ 3).',
        '   - Ưu điểm: Giữ vững Ma trận "Ai Biết Gì", không bao giờ để nhân vật biết trước thông tin chưa tiết lộ.',
        '',
        '3. 💎 Gemini 4 Argon (Đại tự sự văn học):',
        '   - Tốt nhất cho: Chương mở đầu quyển, chương cao trào kết quyển hoặc khi cần văn phong trau chuốt như sách xuất bản.',
        '',
        '4. 🔥 Gemini 4 Carbon (Tâm lý chiến & Nội tâm sâu):',
        '   - Tốt nhất cho: Thể loại Trinh thám Noir, Kinh dị Dân gian và các phân cảnh giằng xé nội tâm.',
        '',
        '5. 🪶 Dòng Flash-Lite (Gemini 3.5 / 3.1 Flash-Lite):',
        '   - Lưu ý: Chỉ nên dùng để hỏi đáp nhanh hoặc tóm tắt ngắn. Khi viết truyện chính thức, hãy luôn chọn từ Gemini Flash trở lên!'
      ].join('\n');
    }

    /**
     * Dựng bảng HTML so sánh năng lực văn học của các mô hình Gemini 2026
     * phục vụ hiển thị trong Cẩm nang hoặc cửa sổ Kiểm tra hệ thống.
     */
    renderModelsComparisonTableHTML() {
      const rows = NS.modelAnalytics
        ? NS.modelAnalytics.getFormattedModelsComparisonReport()
        : [];
      const htmlParts = [
        '<div class="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs">',
        '  <div class="font-extrabold text-emerald-400 uppercase mb-2">🤖 Bảng Đánh Giá Năng Lực Văn Học Các Mô Hình Gemini 2026</div>',
        '  <table class="w-full text-left border-collapse">',
        '    <thead>',
        '      <tr class="border-b border-zinc-800 text-zinc-400 text-[11px]">',
        '        <th class="py-1.5 px-2">Mô hình AI</th>',
        '        <th class="py-1.5 px-2">Phân hạng</th>',
        '        <th class="py-1.5 px-2">Văn phong</th>',
        '        <th class="py-1.5 px-2">Logic / Bible</th>',
        '        <th class="py-1.5 px-2">Đã viết</th>',
        '      </tr>',
        '    </thead>',
        '    <tbody class="divide-y divide-zinc-900">'
      ];

      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const tierBadge = r.isLite
          ? '<span class="px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 font-bold text-[10px]">Nháp ngắn (Lite)</span>'
          : (r.tier === 'PRO_HIGH'
            ? '<span class="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-bold text-[10px]">Chuyên sâu (Pro)</span>'
            : '<span class="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold text-[10px]">Khuyên dùng (Flash)</span>');

        htmlParts.push(
          '      <tr>',
          `        <td class="py-1.5 px-2 font-bold text-zinc-200">${r.shortLabel || r.label}</td>`,
          `        <td class="py-1.5 px-2">${tierBadge}</td>`,
          `        <td class="py-1.5 px-2 font-monoCode text-emerald-400">${r.literaryScore}/10</td>`,
          `        <td class="py-1.5 px-2 font-monoCode text-indigo-300">${r.logicScore}/10</td>`,
          `        <td class="py-1.5 px-2 font-monoCode text-zinc-400">${r.totalWordsGenerated.toLocaleString('vi-VN')} từ (${r.runsCount} lần)</td>`,
          '      </tr>'
        );
      }

      htmlParts.push(
        '    </tbody>',
        '  </table>',
        '</div>'
      );
      return htmlParts.join('\n');
    }
  }

  NS.packageInspector = new ModelContextPackageInspectorAndGuide();

  // ==========================================================================
  // PHẦN 16: ĐĂNG KÝ MODULE 02 & KHỞI TẠO TỰ ĐỘNG KHI DOM SẴN SÀNG
  // ==========================================================================

  const modelsCatalogModuleInstance = {
    name: 'mod02_models_catalog',
    models: GEMINI_MODELS_CATALOG,
    modeSamplingProfiles: MODE_EXECUTION_SAMPLING_PROFILES,
    sceneModelMatrix: LITERARY_SCENE_MODEL_MATRIX,
    modelTierEnhancers: MODEL_TIER_LITERARY_ENHANCERS,
    modelAdvisor: NS.modelAdvisor,
    tokenBudgetEngine: NS.tokenBudgetEngine,
    modelHealth: NS.modelHealth,
    promptRiskAnalyzer: NS.promptRiskAnalyzer,
    longChapterPlanner: NS.longChapterPlanner,
    apiErrorAdvisor: NS.apiErrorAdvisor,
    rateLimiter: NS.rateLimiter,
    payloadConfigurator: NS.payloadConfigurator,
    modelAnalytics: NS.modelAnalytics,
    packageInspector: NS.packageInspector,
    uiController: NS.modelUIController,

    init() {
      NS.modelUIController.initBindings();
    },

    runHealthCheck() {
      return {
        module: 'mod02_gemini_models_catalog_and_router_config.js',
        healthy: Array.isArray(NS.models) && NS.models.length >= 7,
        modelsCount: Array.isArray(NS.models) ? NS.models.length : 0,
        defaultRecommendedModel: NS.modelAdvisor.getDefaultRecommendedModel().id,
        endpointsHealth: NS.modelHealth.getHealthSnapshot()
      };
    }
  };

  if (typeof NS.registerModule === 'function') {
    NS.registerModule('mod02_models_catalog', modelsCatalogModuleInstance);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        modelsCatalogModuleInstance.init();
      });
    } else {
      modelsCatalogModuleInstance.init();
    }
  }

})(typeof window !== 'undefined' ? window : globalThis);
