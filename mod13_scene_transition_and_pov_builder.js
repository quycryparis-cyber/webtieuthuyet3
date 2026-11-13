/**
 * ============================================================================
 * ✍️ WEB VIẾT TIỂU THUYẾT CỦA BI — MODULE 13 (v38.0 SUPREME EDITION)
 * ============================================================================
 * Tệp: mod13_scene_transition_and_pov_builder.js
 * Chức năng chính:
 *   1. Bộ Xây Dựng Mốc Chuyển Phân Cảnh & Đổi Góc Nhìn Nhân Vật (POV)
 *      (SceneTransitionAndPOVBuilderEngine — window.NoirStudio.sceneBuilder).
 *   2. Tích hợp 100% toàn bộ các Mốc chuyển phân cảnh (POV, Thời gian, Địa điểm,
 *      Mục tiêu diễn biến, Kỹ thuật chuyển cảnh điện ảnh, Nhịp độ cảnh) vào
 *      Prompt Tổng Hợp Chính Thức (buildCompiledSceneMarkersBlockForPrompt).
 *   3. Thư viện 7 Chế độ Điểm Nhìn Trần Thuật (POV Consistency Rules) kèm Luật
 *      Chống Nhảy Điểm Nhìn Hỗn Loạn (Anti-Head-Hopping Enforcement).
 *   4. Thư viện 10 Khuôn Mẫu Nhịp Độ Phân Cảnh (Scene Pacing & Dramatic Beats)
 *      và 8 Kỹ Thuật Chuyển Cảnh Điện Ảnh (Match Cut, Sound Bridge, Sensory
 *      Trigger, Smash Cut, Time-Lapse Anchor...).
 *   5. Cho phép sắp xếp thứ tự phân cảnh, sửa nhanh mốc cảnh, chèn dấu ngắt cảnh
 *      trực tiếp vào Bàn viết Tab 1 và kiểm toán lỗi nhảy góc nhìn POV.
 * ============================================================================
 */
(function () {
  'use strict';

  if (window.__NOIR_MOD13_SCENE_BUILDER_LOADED__) return;
  window.__NOIR_MOD13_SCENE_BUILDER_LOADED__ = true;

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

  /**
   * Hàm lấy STUDIO_CONSTANTS an toàn tuyệt đối
   */
  function getStudioConstants() {
    if (window.NoirStudio && window.NoirStudio.constants) {
      return window.NoirStudio.constants;
    }
    return {
      STORAGE_KEYS: {
        SCENE_MARKERS: 'noir_s18_scene_pov_markers_v1'
      }
    };
  }

  // ==========================================================================
  // PHẦN 1: THƯ VIỆN 7 QUY TẮC ĐIỂM NHÌN TRẦN THUẬT (POV CONSISTENCY CATALOG)
  // ==========================================================================
  const POV_PERSPECTIVE_RULES_CATALOG = {
    THIRD_PERSON_LIMITED: {
      id: 'THIRD_PERSON_LIMITED',
      label: '🎥 Ngôi thứ 3 giới hạn (Theo sát nhân vật chính — Chuẩn Light Novel)',
      valueText: 'Ngôi thứ 3 giới hạn (Theo sát nhân vật chính)',
      cameraDistance: 'Cận cảnh tâm lý & trung cảnh hành động (Over-the-shoulder Camera)',
      allowedKnowledgeScope:
        'Chỉ mô tả những gì nhân vật giữ POV nhìn thấy, nghe thấy, ngửi thấy, chạm vào và suy luận trong đầu họ.',
      forbiddenViolations: [
        'CẤM NHẢY ĐIỂM NHÌN (No Head-Hopping): Tuyệt đối không viết trực tiếp suy nghĩ thầm kín của nhân vật khác trong cùng một phân cảnh.',
        'Mọi cảm xúc hoặc mưu tính của người đối diện phải được nhân vật POV phỏng đoán qua ánh mắt, giọng nói, nhịp thở hoặc cử chỉ ngoại hiện.',
        'Không mô tả những sự việc xảy ra sau lưng nhân vật POV nếu họ không nghe thấy tiếng động hoặc nhìn qua vật phản chiếu.'
      ],
      promptDirectiveBlock: [
        '• QUY TẮC ĐIỂM NHÌN (NGÔI THỨ 3 GIỚI HẠN): Đặt ống kính trần thuật gắn chặt vào giác quan và nhận thức của nhân vật giữ POV.',
        '• Mọi cảnh vật, ánh sáng, âm thanh đều phải đi qua lăng kính tâm trạng của nhân vật POV.',
        '• Tuyệt đối không nhảy sang đọc suy nghĩ trong đầu nhân vật phụ khi chưa có dấu chuyển phân cảnh chính thức!'
      ].join('\n')
    },

    FIRST_PERSON_TOI: {
      id: 'FIRST_PERSON_TOI',
      label: '👁️ Ngôi thứ 1 xưng "Tôi" (Độc thoại nội tâm sâu & Trinh thám Noir)',
      valueText: 'Ngôi thứ 1 (Xưng "Tôi" — Trực diện nội tâm nhân vật chính)',
      cameraDistance: 'Góc nhìn chủ quan 100% từ đôi mắt của "Tôi" (First-Person Subjective)',
      allowedKnowledgeScope:
        'Toàn bộ thế giới truyện được kể lại bằng giọng văn, vốn từ vựng, thành kiến và cảm xúc trực tiếp của "Tôi".',
      forbiddenViolations: [
        'Cấm mô tả gương mặt của chính "Tôi" một cách khách quan trừ khi "Tôi" đang soi gương, nhìn bóng nước hoặc cảm nhận cơ mặt mình căng cứng.',
        'Cấm biết trước tương lai hoặc biết sự việc diễn ra ở nơi "Tôi" không có mặt.',
        'Giọng văn dẫn chuyện cũng chính là giọng tâm sự của nhân vật "Tôi", không được dùng giọng văn trung lập vô hồn.'
      ],
      promptDirectiveBlock: [
        '• QUY TẮC ĐIỂM NHÌN (NGÔI THỨ 1 XƯNG "TÔI"): Toàn bộ lời dẫn chuyện phải mang đậm cá tính, nhịp thở và góc nhìn chủ quan của "Tôi".',
        '• Hãy để "Tôi" quan sát thế giới bằng những chi tiết sắc sảo, đan xen giữa hành động thực tại và những suy tưởng ngắn gọn đầy ám ảnh.',
        '• Tuyệt đối không mô tả biểu cảm gương mặt của "Tôi" như người ngoài nhìn vào!'
      ].join('\n')
    },

    FIRST_PERSON_CO_PHONG_TA: {
      id: 'FIRST_PERSON_CO_PHONG_TA',
      label: '🏔️ Ngôi thứ 1 cổ phong xưng "Ta" (Tiên Hiệp / Huyền Huyễn Tự Thuật)',
      valueText: 'Ngôi thứ 1 cổ phong (Xưng "Ta" — Tự thuật trầm hùng)',
      cameraDistance: 'Chủ quan cổ điển, vừa trải nghiệm trực tiếp vừa mang âm hưởng chiêm nghiệm',
      allowedKnowledgeScope:
        'Chỉ giới hạn trong thần thức, linh giác và tầm mắt của nhân vật "Ta".',
      forbiddenViolations: [
        'Cấm pha trộn đại từ "tôi" hoặc ngôn ngữ mạng hiện đại vào dòng tự thuật của "Ta".',
        'Không biết được âm mưu trong đầu kẻ địch nếu đối phương không lộ sát khí hoặc sơ hở chiêu thức.'
      ],
      promptDirectiveBlock: [
        '• QUY TẮC ĐIỂM NHÌN (NGÔI THỨ 1 CỔ PHONG XƯNG "TA"): Dẫn chuyện bằng ngôi "Ta" với văn phong cổ điển, điềm đạm và giàu khí chất.',
        '• Cảm nhận không gian thông qua tầm mắt, tiếng gió và linh giác của "Ta".'
      ].join('\n')
    },

    THIRD_PERSON_MULTI_ROTATING: {
      id: 'THIRD_PERSON_MULTI_ROTATING',
      label: '🔄 Ngôi thứ 3 Đa Điểm Nhìn Luân Phiên (Đổi POV theo từng Mốc Phân Cảnh)',
      valueText: 'Ngôi thứ 3 luân phiên (Mỗi phân cảnh khóa chặt 1 nhân vật POV)',
      cameraDistance: 'Thay đổi linh hoạt theo từng mốc phân cảnh đã định sẵn',
      allowedKnowledgeScope:
        'Ở Phân cảnh nào thì khóa chặt 100% vào nhân vật POV của Phân cảnh đó; khi qua dấu ngắt cảnh (* * *) mới chuyển sang nhân vật POV tiếp theo.',
      forbiddenViolations: [
        'Trong phạm vi 1 phân cảnh đơn lẻ, tuyệt đối không được trộn lẫn suy nghĩ của 2 nhân vật khác nhau.',
        'Khi chuyển sang nhân vật POV mới ở cảnh sau, phải thay đổi cả nhịp câu và cách dùng từ sao cho đúng với tính cách nhân vật đó.'
      ],
      promptDirectiveBlock: [
        '• QUY TẮC ĐA ĐIỂM NHÌN LUÂN PHIÊN: Mỗi mốc phân cảnh chỉ được phép nhìn qua lăng kính của ĐÚNG MỘT nhân vật POV đã chỉ định cho cảnh đó.',
        '• Khi chuyển sang mốc phân cảnh mới với POV mới, phải đặt dấu ngắt cảnh (* * *) rõ ràng và đổi màu sắc tâm lý theo nhân vật mới.'
      ].join('\n')
    },

    THIRD_PERSON_CINEMATIC_NOIR: {
      id: 'THIRD_PERSON_CINEMATIC_NOIR',
      label: '🎬 Ngôi thứ 3 Ống Kính Điện Ảnh Khách Quan (Show, Don\'t Tell Tuyệt Đối)',
      valueText: 'Ngôi thứ 3 ống kính điện ảnh (Khách quan, giàu hình ảnh & hành động)',
      cameraDistance: 'Ống kính máy quay điện ảnh (Cinematic Camera Eye)',
      allowedKnowledgeScope:
        'Không đi sâu vào giải thích suy nghĩ trừu tượng mà khắc họa toàn bộ tâm lý qua hành động, ánh sáng, bóng đổ, âm thanh và câu thoại.',
      forbiddenViolations: [
        'Hạn chế tối đa việc giải thích hộ cảm xúc ("anh cảm thấy buồn"); thay vào đó hãy miêu tả hành động cụ thể ("anh nhìn điếu thuốc cháy tàn đến tận đầu ngón tay mà không gạt tàn").'
      ],
      promptDirectiveBlock: [
        '• QUY TẮC ỐNG KÍNH ĐIỆN ẢNH: Hãy viết như một đạo diễn điện ảnh bậc thầy đang điều khiển ánh sáng, góc máy và âm thanh.',
        '• Bộc lộ toàn bộ giằng xé nội tâm qua cử chỉ tay chân, nhịp ngắt trong lời thoại và tương tác với đồ vật xung quanh.'
      ].join('\n')
    },

    THIRD_PERSON_OMNISCIENT: {
      id: 'THIRD_PERSON_OMNISCIENT',
      label: '🌌 Ngôi thứ 3 Toàn Tri Có Kiểm Soát (Đại Tự Sự / Sử Thi)',
      valueText: 'Ngôi thứ 3 toàn tri có kiểm soát (Bao quát đại cục & chiều sâu nhân vật)',
      cameraDistance: 'Từ toàn cảnh vĩ mô (Wide Pan) thu dần vào cận cảnh nhân vật trung tâm',
      allowedKnowledgeScope:
        'Người kể chuyện nắm rõ bối cảnh lịch sử và dòng chảy sự kiện, nhưng vẫn ưu tiên neo cảm xúc vào nhân vật chính của cảnh.',
      forbiddenViolations: [
        'Dù là ngôi toàn tri nhưng tuyệt đối KHÔNG ĐƯỢC TIẾT LỘ SỚM các bí mật đang khóa trong Ma trận "Ai Biết Gì" của Story Bible!'
      ],
      promptDirectiveBlock: [
        '• QUY TẮC NGÔI THỨ 3 TOÀN TRI CÓ KIỂM SOÁT: Mở đầu cảnh bằng góc nhìn bao quát giàu chất văn học, sau đó thu ống kính vào nhân vật trọng tâm.',
        '• Giữ kín các phục bút và bí mật theo đúng Ma trận "Ai Biết Gì".'
      ].join('\n')
    }
  };

  // ==========================================================================
  // PHẦN 2: THƯ VIỆN 10 KHUÔN MẪU NHỊP ĐỘ & MỤC TIÊU PHÂN CẢNH (SCENE TEMPLATES)
  // ==========================================================================
  const SCENE_PACING_AND_DRAMATIC_ARC_TEMPLATES = [
    {
      id: 'TPL_COLD_OPEN_HOOK',
      label: '⚡ 1. Mở Đầu Câu Khách Giữa Biến Cố (In Media Res)',
      suggestedTime: '23:45 — Đêm mưa tầm tã',
      suggestedLocation: 'Con hẻm cụt phía sau nhà hát cũ',
      pacingStyle: 'Nhịp nhanh, câu văn ngắn gọn, đánh mạnh vào thính giác và thị giác ngay dòng đầu tiên',
      goalTemplate:
        'Mở màn ngay tại thời điểm nguy cấp nhất để cuốn hút độc giả tức thì; nhân vật chính phát hiện vật chứng bất ngờ trước khi kẻ bám đuôi kịp xóa dấu vết.'
    },
    {
      id: 'TPL_PSYCH_INTERROGATION',
      label: '♟️ 2. Đối Chất Tâm Lý & Thẩm Vấn Ngầm (Dialogue Duel)',
      suggestedTime: '16:20 — Chiều muộn hoàng hôn',
      suggestedLocation: 'Phòng trà tầng thượng yên tĩnh / Phòng thẩm vấn ánh đèn vàng',
      pacingStyle: 'Nhịp căng thẳng ngầm, xen kẽ câu thoại sắc bén với miêu tả vi biểu cảm (ánh mắt, ngón tay, nhịp thở)',
      goalTemplate:
        'Hai nhân vật đấu trí qua từng câu nói tưởng như xã giao nhưng thực chất là thăm dò giới hạn của nhau; cài cắm 1 phục bút quan trọng qua câu nói bỏ lửng.'
    },
    {
      id: 'TPL_INVESTIGATION_CLUE',
      label: '🔍 3. Khám Phá Hiện Trường & Giải Mã Phục Bút',
      suggestedTime: '01:15 — Rạng sáng tĩnh mịch',
      suggestedLocation: 'Thư phòng khóa kín / Di tích cổ dưới lòng đất',
      pacingStyle: 'Nhịp chậm rãi, tỉ mỉ, giàu chi tiết xúc giác, mùi hương và suy luận logic chặt chẽ',
      goalTemplate:
        'Nhân vật POV kiểm tra từng dấu vết nhỏ tại hiện trường, nối kết manh mối chương trước với phát hiện mới, nhưng đồng thời nhận ra mình đang rơi vào một cái bẫy lớn hơn.'
    },
    {
      id: 'TPL_ACTION_AMBUSH',
      label: '⚔️ 4. Giao Chiến / Đột Kích Nhịp Độ Cao (High-Octane Action)',
      suggestedTime: 'Ngay lập tức sau cảnh trước (Không độ trễ)',
      suggestedLocation: 'Cầu cảng sương mù / Rừng cổ thụ phong ấn',
      pacingStyle: 'Nhịp dồn dập, động từ mạnh, câu ngắn đan xen câu trung bình, tuân thủ chặt chẽ vị trí không gian và thể lực',
      goalTemplate:
        'Cuộc chạm trán bùng nổ bất ngờ; nhân vật chính phải tận dụng địa hình và trí thông minh để hóa giải thế bất lợi, chịu một vết thương hợp lý nhưng giành được quyền chủ động.'
    },
    {
      id: 'TPL_CALM_BEFORE_STORM',
      label: '🔥 5. Khoảnh Khắc Lắng Đọng Trước Giông Bão (Character Bonding)',
      suggestedTime: '04:00 sáng — Trước giờ xuất phát',
      suggestedLocation: 'Bên bếp lửa trại / Ban công nhìn xuống thành phố ngủ yên',
      pacingStyle: 'Nhịp trầm ấm, sâu lắng, giàu chất thơ và chiều sâu tâm sự nội tâm',
      goalTemplate:
        'Sau biến cố căng thẳng, nhân vật chính và đồng đội có cuộc trò chuyện chân thành, hé lộ một góc vết thương quá khứ, làm sâu sắc thêm mối quan hệ trước khi bước vào trận quyết chiến.'
    },
    {
      id: 'TPL_TWIST_REVELATION',
      label: '🎭 6. Cao Trào Lật Bài & Bóc Trần Chân Tướng (Plot Twist)',
      suggestedTime: 'Thời khắc định mệnh',
      suggestedLocation: 'Đại sảnh trung tâm / Đỉnh tháp chuông',
      pacingStyle: 'Nhịp tăng dần đến nghẹt thở, sử dụng kỹ thuật tương phản giữa kỳ vọng và sự thật phũ phàng',
      goalTemplate:
        'Thu hồi phục bút đã gieo từ các chương trước; bức màn bí mật hé lộ theo cách hợp lý 100% về logic nhưng gây chấn động mạnh mẽ cho tâm lý nhân vật.'
    },
    {
      id: 'TPL_FLASHBACK_ECHO',
      label: '🕰️ 7. Hồi Ức Chớp Nhoáng Gợi Mở Từ Giác Quan (Sensory Flashback)',
      suggestedTime: 'Ký ức 5 năm trước (Đan xen thực tại)',
      suggestedLocation: 'Không gian ký ức nhuốm màu hoài niệm',
      pacingStyle: 'Nhịp mơ hồ, giàu hình ảnh ẩn dụ, chuyển tiếp mượt mà từ một mùi hương hoặc âm thanh ở hiện tại',
      goalTemplate:
        'Giải thích động cơ sâu kín của nhân vật thông qua một mảnh ký ức ngắn gọn, sắc nét, sau đó kéo ngay về thực tại với quyết tâm mới.'
    },
    {
      id: 'TPL_CLIFFHANGER_ENDING',
      label: '🪝 8. Kết Chương Bỏ Lửng Gây Nghiện (Cliffhanger Hook)',
      suggestedTime: 'Khoảnh khắc khép lại chương',
      suggestedLocation: 'Trước cánh cửa vừa hé mở / Cuộc gọi lúc nửa đêm',
      pacingStyle: 'Nhịp cô đọng, dồn toàn bộ sức nặng vào 2 đoạn văn cuối cùng',
      goalTemplate:
        'Khép lại chương truyện bằng một phát hiện làm đảo lộn mọi phán đoán trước đó hoặc một sự xuất hiện bất ngờ khiến độc giả lập tức muốn đọc tiếp chương sau.'
    }
  ];

  // ==========================================================================
  // PHẦN 3: THƯ VIỆN 8 KỸ THUẬT CHUYỂN CẢNH ĐIỆN ẢNH (CINEMATIC TRANSITIONS)
  // ==========================================================================
  const CINEMATIC_TRANSITION_TECHNIQUES = {
    MATCH_CUT_OBJECT: {
      id: 'MATCH_CUT_OBJECT',
      label: '🎞️ Match Cut (Chuyển cảnh đồng dạng qua hình ảnh/vật thể)',
      directive:
        'Sử dụng kỹ thuật Match Cut điện ảnh: Kết thúc cảnh trước bằng hình ảnh một vật thể (ví dụ: tàn thuốc đỏ rực, giọt nước mưa, vòng xoáy tách cà phê) và mở đầu cảnh này bằng một hình ảnh có hình dáng/chuyển động tương tự ở không gian mới.',
      sampleSnippet:
        '* * *\n\n Vệt khói trắng mảnh mai từ đầu điếu thuốc vừa tắt ngấm trong căn phòng thẩm vấn dường như nối dài ra, hòa vào màn sương mù dày đặc đang bao phủ lấy bến cảng phía Đông lúc hai giờ sáng.'
    },
    SOUND_BRIDGE: {
      id: 'SOUND_BRIDGE',
      label: '🔊 Sound Bridge (Cầu nối âm thanh xuyên qua hai không gian)',
      directive:
        'Sử dụng kỹ thuật Sound Bridge: Để âm thanh cuối cùng của cảnh trước (tiếng chuông đồng hồ, tiếng còi tàu, tiếng sấm rền) ngân dài và trở thành âm thanh mở màn cho không gian của phân cảnh mới.',
      sampleSnippet:
        '* * *\n\n Tiếng chuông nhà thờ ngân vang mười hai nhịp trầm đục không chỉ vọng qua khung cửa sổ phòng sách, mà còn dội xuống con phố lát đá ướt đẫm nơi chiếc xe đen vừa âm thầm dừng bánh.'
    },
    TIME_LAPSE_ANCHOR: {
      id: 'TIME_LAPSE_ANCHOR',
      label: '⏳ Time-Lapse Anchor (Neo bước nhảy thời gian bằng ánh sáng & thời tiết)',
      directive:
        'Sử dụng kỹ thuật Neo Thời Gian: Mô tả sự dịch chuyển của bóng nắng, nhiệt độ không khí hoặc ánh đèn đường để báo hiệu thời gian đã trôi qua một cách tự nhiên, đầy chất văn học.',
      sampleSnippet:
        '* * *\n\n Khi những vệt nắng quái cuối cùng tắt hẳn trên mái ngói rêu phong và hơi lạnh bắt đầu thấm qua lớp áo khoác dạ, ánh đèn vàng vọt nơi hành lang bệnh viện mới lần lượt bật sáng.'
    },
    CONTRAST_CUT: {
      id: 'CONTRAST_CUT',
      label: '🌓 Contrast Juxtaposition (Chuyển cảnh tương phản Nóng — Lạnh / Động — Tĩnh)',
      directive:
        'Sử dụng kỹ thuật Tương Phản Điện Ảnh: Đặt sự yên bình hoặc xa hoa của cảnh mới đối lập gay gắt với sự khốc liệt của cảnh vừa kết thúc để làm nổi bật chiều sâu bi kịch.',
      sampleSnippet:
        '* * *\n\n Trái ngược hoàn toàn với con hẻm ngập mùi thuốc súng và nước mưa lạnh buốt cách đó ba dãy phố, bên trong đại sảnh tầng năm mươi vẫn ngập tràn tiếng đàn dương cầm êm ái và hương rượu vang ấm nồng.'
    },
    SENSORY_ECHO: {
      id: 'SENSORY_ECHO',
      label: '👃 Sensory Echo (Chuyển cảnh qua sự gợi nhắc của mùi vị / xúc giác)',
      directive:
        'Sử dụng kỹ thuật Dư Âm Giác Quan: Dùng một mùi hương hoặc cảm giác xúc giác ở cuối cảnh trước làm chất xúc tác mở ra phân cảnh mới.',
      sampleSnippet:
        '* * *\n\n Mùi hương trầm ngai ngái vương trên mảnh giấy cổ vẫn còn đọng lại nơi đầu ngón tay, dẫn lối cho bước chân tìm đến ngôi đền hoang nằm khuất sau sườn núi Bắc.'
    },
    SMASH_CUT_SHOCK: {
      id: 'SMASH_CUT_SHOCK',
      label: '💥 Smash Cut (Cắt cảnh trực diện tạo nhịp điệu dồn dập)',
      directive:
        'Sử dụng kỹ thuật Smash Cut: Ngắt cảnh trước ngay ở đỉnh điểm câu hỏi và mở cảnh mới bằng một hành động trực diện không rào đón.',
      sampleSnippet:
        '* * *\n\n Cánh cửa sắt nặng nề bật mở cùng tiếng bản lề rít lên chát chúa.'
    }
  };

  // ==========================================================================
  // PHẦN 4: KIỂM TOÁN LỖI NHẢY ĐIỂM NHÌN (ANTI-HEAD-HOPPING AUDITOR)
  // ==========================================================================
  class POVHeadHoppingAuditorAndValidator {
    constructor(utilsRef) {
      this.utils = utilsRef;
    }

    getPovRuleByValue(rawPovText) {
      const target = String(rawPovText || '').toLowerCase();
      const entries = Object.values(POV_PERSPECTIVE_RULES_CATALOG);
      for (let i = 0; i < entries.length; i += 1) {
        const item = entries[i];
        if (
          target.includes(item.id.toLowerCase()) ||
          target.includes((item.valueText || '').toLowerCase()) ||
          target.includes((item.label || '').toLowerCase())
        ) {
          return item;
        }
      }
      if (target.includes('ngôi 1') || target.includes('ngôi thứ nhất') || target.includes('xưng tôi')) {
        return POV_PERSPECTIVE_RULES_CATALOG.FIRST_PERSON_CONFESSIONAL || entries[0];
      }
      return POV_PERSPECTIVE_RULES_CATALOG.THIRD_PERSON_LIMITED || entries[0];
    }

    /**
     * Phân tích đoạn văn của một phân cảnh xem có bị rò rỉ nội tâm của quá nhiều nhân vật
     * trong cùng 1 cảnh (lỗi Head-Hopping) hoặc lệch đại từ nhân xưng hay không.
     */
    auditSceneContentAgainstPOV(sceneText, povRuleText) {
      const text = String(sceneText || '').trim();
      const rule = this.getPovRuleByValue(povRuleText);
      const isFirstPerson =
        /ngôi thứ nhất|ngôi 1|xưng tôi|first/i.test(povRuleText || '') ||
        (rule && /FIRST/i.test(rule.id));

      if (!text) {
        return {
          status: 'EMPTY',
          score: 100,
          ruleTitle: rule ? rule.valueText : povRuleText,
          findings: ['Chưa có văn bản để kiểm toán góc nhìn POV.']
        };
      }

      const paras = text.split(/\n{2,}/).filter((p) => p.trim().length > 0);
      const findings = [];
      let penalty = 0;

      // Phát hiện dấu hiệu đọc suy nghĩ nội tâm của nhiều đối tượng khác nhau
      const mindAccessRegex =
        /\b([A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯẠ-Ỹ][a-zàáâãèéêìíòóôõùúăđĩũơưạ-ỹ]{1,18}|hắn|gã|y|cô ta|anh ta|nàng)\s+(?:nghĩ thầm|tự nhủ|bỗng thấy trong lòng|hiểu rằng trong tâm trí|chợt nhận ra nỗi sợ của chính mình|hối hận thầm)/gi;

      const innerMindOwners = new Set();
      paras.forEach((para, idx) => {
        let m;
        const r = new RegExp(mindAccessRegex.source, 'gi');
        while ((m = r.exec(para)) !== null) {
          innerMindOwners.add(m[1].trim().toLowerCase());
        }
        if (isFirstPerson && /\btôi\b/i.test(para) && /\bhắn tự nhủ\b/i.test(para)) {
          findings.push({
            paragraph: idx + 1,
            severity: 'WARN',
            detail:
              'Đoạn ' +
              (idx + 1) +
              ': Cảnh chọn góc nhìn Ngôi 1 (Tôi) nhưng xuất hiện cụm "hắn tự nhủ" mang tính toàn tri.'
          });
          penalty += 12;
        }
      });

      if (innerMindOwners.size >= 3) {
        findings.push({
          paragraph: 0,
          severity: 'WARN',
          detail: `Trong một phân cảnh ngắn đang mở luồng suy nghĩ nội tâm của ${innerMindOwners.size} đối tượng (${Array.from(innerMindOwners).slice(0, 4).join(', ')}). Cân nhắc giữ chặt máy quay sau vai 1 nhân vật POV.`
        });
        penalty += 15;
      }

      if (findings.length === 0) {
        findings.push({
          paragraph: 0,
          severity: 'OK',
          detail: 'Máy quay điểm nhìn giữ ổn định, không có dấu hiệu nhảy góc nhìn đột ngột!'
        });
      }

      return {
        status: penalty === 0 ? 'CLEAN' : 'WARNING',
        score: Math.max(40, 100 - penalty),
        ruleTitle: rule ? rule.valueText : povRuleText,
        findings
      };
    }

    buildPromptGuardDirectiveForPov(povValueText) {
      const rule = this.getPovRuleByValue(povValueText);
      const cameraNote = rule?.cameraDistance || 'Bám sát cảm nhận giác quan của nhân vật trọng tâm';
      const forbiddenNote =
        rule?.antiHeadHoppingRule ||
        'TUYỆT ĐỐI KHÔNG đọc trộm suy nghĩ nội tâm của nhân vật khác khi chưa chuyển mốc phân cảnh rõ ràng.';
      return `Máy quay: ${cameraNote}. Quy tắc khóa góc nhìn: ${forbiddenNote}`;
    }
  }

  // ==========================================================================
  // PHẦN 5: BỘ NÂNG CẤP MODAL XÂY DỰNG PHÂN CẢNH (TEMPLATES & CINEMATIC CUTS)
  // ==========================================================================
  class SceneTransitionModalEnhancer {
    constructor(builderEngine) {
      this.engine = builderEngine;
      this.injectedQuickBar = false;
      this.selectedTransitionId = 'MATCH_CUT_OBJECT';
      this.selectedTemplateId = '';
    }

    ensureEnhancedControlsInModal() {
      if (typeof document === 'undefined') return;
      const modal = document.getElementById('modal-scene-transition-builder');
      if (!modal) return;
      if (modal.querySelector('#scene-builder-enhancer-panel')) return;

      const goalEl = document.getElementById('scene-builder-goal');
      const saveBtn = document.getElementById('btn-save-scene-marker');
      const hostContainer = saveBtn?.parentElement || goalEl?.parentElement;
      if (!hostContainer) return;

      const panel = document.createElement('div');
      panel.id = 'scene-builder-enhancer-panel';
      panel.className =
        'mt-3 p-3 rounded-xl border border-indigo-500/25 bg-indigo-950/20 space-y-3 text-xs';

      const templateOptions = SCENE_PACING_AND_DRAMATIC_ARC_TEMPLATES.map(
        (tpl) => `<option value="${tpl.id}">${this.engine.utils.escapeHtml(tpl.label)}</option>`
      ).join('');

      const transitionOptions = Object.values(CINEMATIC_TRANSITION_TECHNIQUES)
        .map(
          (tr) =>
            `<option value="${tr.id}">${this.engine.utils.escapeHtml(tr.label)}</option>`
        )
        .join('');

      panel.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="font-bold text-indigo-300">🎞️ Trợ Lý Điện Ảnh & Khuôn Mẫu Nhịp Cảnh</span>
          <span class="text-[11px] text-zinc-400">Tự động điền nhanh + nhúng vào Prompt Tổng Hợp</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label for="scene-template-picker" class="block text-[11px] text-zinc-400 mb-1">Khuôn mẫu kịch tính phân cảnh</label>
            <select id="scene-template-picker" class="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-100 focus:border-indigo-500 outline-none">
              <option value="">-- Chọn mẫu điền nhanh nếu cần --</option>
              ${templateOptions}
            </select>
          </div>
          <div>
            <label for="scene-cinematic-cut-picker" class="block text-[11px] text-zinc-400 mb-1">Kỹ thuật chuyển cảnh (Cinematic Cut)</label>
            <select id="scene-cinematic-cut-picker" class="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-100 focus:border-indigo-500 outline-none">
              ${transitionOptions}
            </select>
          </div>
        </div>
        <div id="scene-cinematic-cut-preview" class="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800 text-[11px] text-zinc-300 leading-relaxed whitespace-pre-line"></div>
        <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
          <button type="button" id="btn-scene-insert-divider-into-tab1" class="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-[11px] font-semibold transition">
            ✂️ Chèn luôn mẫu đoạn chuyển cảnh này vào Bàn viết Tab 1
          </button>
          <span id="scene-pov-guideline-hint" class="text-[11px] text-emerald-300/90"></span>
        </div>
      `;

      if (saveBtn && saveBtn.parentElement) {
        saveBtn.parentElement.insertBefore(panel, saveBtn);
      } else {
        hostContainer.appendChild(panel);
      }

      const tplPicker = document.getElementById('scene-template-picker');
      const cutPicker = document.getElementById('scene-cinematic-cut-picker');
      const cutPreview = document.getElementById('scene-cinematic-cut-preview');
      const insertSampleBtn = document.getElementById('btn-scene-insert-divider-into-tab1');
      const povSelect = document.getElementById('scene-builder-pov');

      const updateCutPreview = () => {
        const chosenId = cutPicker ? cutPicker.value : 'MATCH_CUT_OBJECT';
        this.selectedTransitionId = chosenId;
        const tech = CINEMATIC_TRANSITION_TECHNIQUES[chosenId];
        if (cutPreview && tech) {
          cutPreview.textContent = `Chỉ đạo AI: ${tech.directive}\n\nVí dụ văn phong:\n${tech.sampleSnippet}`;
        }
      };

      const updatePovHint = () => {
        const hintEl = document.getElementById('scene-pov-guideline-hint');
        if (!hintEl || !povSelect) return;
        const rule = this.engine.auditor.getPovRuleByValue(povSelect.value);
        hintEl.textContent = rule ? `📷 ${rule.cameraDistance || rule.label}` : '';
      };

      if (tplPicker) {
        tplPicker.addEventListener('change', () => {
          const id = tplPicker.value;
          this.selectedTemplateId = id;
          const tpl = SCENE_PACING_AND_DRAMATIC_ARC_TEMPLATES.find((x) => x.id === id);
          if (!tpl) return;
          const timeEl = document.getElementById('scene-builder-time');
          const locEl = document.getElementById('scene-builder-location');
          const goalField = document.getElementById('scene-builder-goal');
          if (timeEl && !timeEl.value.trim()) timeEl.value = tpl.suggestedTime || '';
          if (locEl && !locEl.value.trim()) locEl.value = tpl.suggestedLocation || '';
          if (goalField) {
            goalField.value = `${tpl.goalTemplate}\n[Nhịp điệu: ${tpl.pacingStyle}]`;
          }
          this.engine.utils.showToast(`✨ Đã điền gợi ý khuôn mẫu "${tpl.label}"!`, 'info', 2200);
        });
      }

      if (cutPicker) {
        cutPicker.addEventListener('change', updateCutPreview);
      }

      if (povSelect) {
        povSelect.addEventListener('change', updatePovHint);
      }

      if (insertSampleBtn) {
        insertSampleBtn.addEventListener('click', () => {
          const tech = CINEMATIC_TRANSITION_TECHNIQUES[this.selectedTransitionId];
          const ta = document.getElementById('textarea-chapter-content');
          if (!ta || !tech) return;
          if (this.engine.utils?.cursorToolkit?.insertTextAtCursor) {
            this.engine.utils.cursorToolkit.insertTextAtCursor(ta, `\n\n${tech.sampleSnippet}\n\n`, {
              ensureNewlineBefore: true,
              ensureNewlineAfter: true
            });
          } else {
            ta.value = `${ta.value.trimEnd()}\n\n${tech.sampleSnippet}\n\n`;
            ta.dispatchEvent(new Event('input', { bubbles: true }));
          }
          this.engine.utils.showToast('✂️ Đã chèn phân đoạn chuyển cảnh mẫu vào Bàn viết Tab 1!', 'success');
        });
      }

      updateCutPreview();
      updatePovHint();
    }
  }

  // ==========================================================================
  // PHẦN 6: BỘ TỔ CHỨC CHUỖI PHÂN CẢNH, KIỂM TRA BƯỚC NHẢY THỜI GIAN & XUẤT THẺ
  // ==========================================================================
  class SceneSequenceOrganizerAndMarkdownExporter {
    constructor(engine) {
      this.engine = engine;
    }

    /**
     * Sắp xếp lại vị trí một Mốc Phân Cảnh theo hướng (-1 lên / +1 xuống)
     */
    moveMarkerInChapter(chapterId, markerId, delta) {
      const list = this.engine.markersByChapter[chapterId];
      if (!Array.isArray(list)) return false;
      const idx = list.findIndex((m) => m.id === markerId);
      if (idx === -1) return false;
      const targetIdx = idx + delta;
      if (targetIdx < 0 || targetIdx >= list.length) return false;

      const temp = list[idx];
      list[idx] = list[targetIdx];
      list[targetIdx] = temp;

      this.engine.persist();
      this.engine.renderMarkersListUI();
      this.engine.utils.showToast('🔀 Đã thay đổi thứ tự phân cảnh trong chương!', 'info', 2000);
      return true;
    }

    /**
     * Nhân bản một Mốc Phân Cảnh (ví dụ giữ nguyên Địa điểm/Thời gian nhưng đổi POV nhân vật khác)
     */
    duplicateMarkerInChapter(chapterId, markerId) {
      const list = this.engine.markersByChapter[chapterId];
      if (!Array.isArray(list)) return null;
      const idx = list.findIndex((m) => m.id === markerId);
      if (idx === -1) return null;

      const orig = list[idx];
      const clone = {
        ...orig,
        id: `scn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        goal: `${orig.goal || ''} (Góc nhìn nối tiếp / Phản hồi)`.trim(),
        createdAt: Date.now()
      };
      list.splice(idx + 1, 0, clone);
      this.engine.persist();
      this.engine.renderMarkersListUI();
      this.engine.utils.showToast('📑 Đã nhân bản Mốc phân cảnh kế tiếp!', 'success', 2200);
      return clone;
    }

    /**
     * Chèn nhanh 1 khối ghi chú Mốc Phân Cảnh có cấu trúc thẳng vào ô Dàn ý Beats của Tab 1
     */
    syncAllChapterMarkersToBeatsBox() {
      const markers = this.engine.getMarkersForActiveChapter();
      if (!markers.length) {
        this.engine.utils.showToast('⚠️ Chương hiện tại chưa có Mốc phân cảnh nào.', 'warning');
        return false;
      }

      const beatsEl = document.getElementById('textarea-chapter-beats');
      if (!beatsEl) return false;

      const formatted = markers
        .map((m, idx) => {
          const cutObj = m.transitionId ? CINEMATIC_TRANSITION_TECHNIQUES[m.transitionId] : null;
          const cutLabel = cutObj ? cutObj.label : 'Chuyển cảnh tự nhiên';
          return [
            `[CẢNH ${idx + 1}] POV: ${m.pov || 'Không rõ'} | Thời gian: ${m.time || 'Liên tiếp'} | Tại: ${m.location || 'Chưa rõ'}`,
            `- Kỹ thuật chuyển cảnh: ${cutLabel}`,
            `- Mục tiêu kịch bản: ${m.goal || '(Chưa nhập)'}`
          ].join('\n');
        })
        .join('\n\n---\n\n');

      const existing = beatsEl.value.trim();
      const markerHeader = '=== SƠ ĐỒ PHÂN CẢNH ĐÃ KHÓA ===';
      if (existing.includes(markerHeader)) {
        const before = existing.split(markerHeader)[0].trim();
        beatsEl.value = before
          ? `${before}\n\n${markerHeader}\n${formatted}`
          : `${markerHeader}\n${formatted}`;
      } else {
        beatsEl.value = existing
          ? `${existing}\n\n${markerHeader}\n${formatted}`
          : `${markerHeader}\n${formatted}`;
      }

      beatsEl.dispatchEvent(new Event('input', { bubbles: true }));
      this.engine.utils.showToast(
        `📌 Đã đồng bộ ${markers.length} Mốc phân cảnh vào khung Dàn ý / Beats Tab 1!`,
        'success'
      );
      return true;
    }

    /**
     * Xuất toàn bộ kịch bản phân cảnh của chương thành file Markdown dùng cho biên tập
     */
    exportChapterStoryboardMarkdown(chapterId) {
      const chap = window.NoirStudio?.chapterManager?.chapters?.find((c) => c.id === chapterId);
      const markers = this.engine.markersByChapter[chapterId] || [];
      if (!markers.length) {
        this.engine.utils.showToast('⚠️ Chương này chưa có Mốc phân cảnh nào để xuất.', 'warning');
        return false;
      }

      const title = chap?.displayTitle || chap?.title || 'Chuong_Hien_Tai';
      const mdLines = [
        `# 🎬 BẢNG PHÂN CẢNH & GÓC NHÌN: ${title}`,
        `> Tổng số phân cảnh: ${markers.length} • Xuất lúc: ${this.engine.utils.formatTimestampVN(Date.now())}`,
        '',
        '---',
        ''
      ];

      markers.forEach((m, i) => {
        const tech = m.transitionId ? CINEMATIC_TRANSITION_TECHNIQUES[m.transitionId] : null;
        mdLines.push(`## Phân cảnh ${i + 1}: ${m.location || 'Không gian mở'}`);
        mdLines.push(`- **Điểm nhìn (POV):** ${m.pov || 'Mặc định'}`);
        mdLines.push(`- **Mốc thời gian:** ${m.time || 'Liên tục'}`);
        mdLines.push(`- **Địa điểm:** ${m.location || 'Chưa xác định'}`);
        mdLines.push(`- **Chuyển cảnh:** ${tech ? tech.label : 'Chuyển cảnh tự nhiên'}`);
        mdLines.push(`- **Diễn biến cốt lõi:** ${m.goal || '(Trống)'}`);
        mdLines.push('');
      });

      const blob = new Blob(['\uFEFF' + mdLines.join('\n')], {
        type: 'text/markdown;charset=utf-8'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PhanCanh_${this.engine.utils.slugifyVietnameseFilename(title)}.md`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2500);
      this.engine.utils.showToast('🎬 Đã xuất Sơ đồ Phân cảnh Markdown (.MD)!', 'success');
      return true;
    }

    /**
     * Quét chuỗi mốc cảnh liên tiếp xem có điểm nhìn bất nhất hoặc thiếu thông tin địa điểm
     */
    analyzeSceneSequenceIntegrity(markers) {
      const list = Array.isArray(markers) ? markers : [];
      if (list.length === 0) {
        return {
          valid: true,
          score: 100,
          warnings: ['Chưa thiết lập mốc phân cảnh — AI sẽ viết liền mạch theo Beats hiện có.']
        };
      }

      const warnings = [];
      let prevPov = '';
      list.forEach((sc, idx) => {
        if (!String(sc.goal || '').trim()) {
          warnings.push(`Phân cảnh #${idx + 1} đang thiếu mục tiêu diễn biến cụ thể.`);
        }
        if (!String(sc.location || '').trim()) {
          warnings.push(`Phân cảnh #${idx + 1} chưa ghi rõ bối cảnh/địa điểm diễn ra.`);
        }
        if (prevPov && sc.pov && sc.pov !== prevPov && !sc.transitionId) {
          warnings.push(
            `Từ Cảnh #${idx} sang Cảnh #${idx + 1} có đổi POV (${prevPov} → ${sc.pov}) — nên chỉ định kỹ thuật chuyển cảnh rõ ràng.`
          );
        }
        prevPov = sc.pov || prevPov;
      });

      return {
        valid: warnings.length === 0,
        score: Math.max(50, 100 - warnings.length * 12),
        warnings
      };
    }
  }

  // ==========================================================================
  // PHẦN 6B: THƯ VIỆN MẪU XUNG ĐỘT VI MÔ CHO TỪNG PHÂN CẢNH (SCENE MICRO-TENSION)
  // ==========================================================================
  const SCENE_MICRO_CONFLICT_PROMPTS = Object.freeze([
    {
      id: 'CONFLICT_SECRET_AGENDA',
      name: '🎭 Mục đích ẩn giấu trong cuộc trò chuyện',
      hint: 'Nhân vật A muốn hỏi thông tin thật nhưng phải giả vờ nói chuyện phiếm về một món đồ vô hại trên bàn.'
    },
    {
      id: 'CONFLICT_TICKING_CLOCK',
      name: '⏱️ Áp lực thời gian đếm ngược',
      hint: 'Nhân vật chỉ có đúng 3 phút trước khi chuyến tàu cuối rời bến hoặc người gác cổng đi tuần trở lại.'
    },
    {
      id: 'CONFLICT_ENVIRONMENTAL_HAZARD',
      name: '🌧️ Bối cảnh thiên nhiên cản trở hành động',
      hint: 'Mưa lớn làm át tiếng bước chân hoặc sương mù che khuất tầm nhìn dưới 5 mét khiến mọi âm thanh đều thành mối đe dọa.'
    },
    {
      id: 'CONFLICT_MORAL_DILEMMA',
      name: '⚖️ Lựa chọn đánh đổi đạo đức',
      hint: 'Để cứu người bạn đồng hành ngay trước mắt, nhân vật buộc phải đánh rơi hoặc phá hủy manh mối duy nhất dẫn tới chân tướng.'
    },
    {
      id: 'CONFLICT_BETRAYAL_SUBTEXT',
      name: '🗡️ Tín hiệu phản bội tinh vi qua tiểu tiết',
      hint: 'Một chi tiết nhỏ không khớp (vết bùn khác màu trên gấu áo, thói quen cầm tách tay trái bị đổi) vô tình tố cáo lời nói dối.'
    }
  ]);

  class SceneMicroConflictHelper {
    getAllPresets() {
      return SCENE_MICRO_CONFLICT_PROMPTS;
    }

    appendConflictHintToGoalInput(presetId) {
      if (typeof document === 'undefined') return false;
      const preset = SCENE_MICRO_CONFLICT_PROMPTS.find((p) => p.id === presetId);
      const goalEl = document.getElementById('scene-builder-goal');
      if (!preset || !goalEl) return false;
      const cur = goalEl.value.trim();
      goalEl.value = cur
        ? `${cur}\n• Yếu tố kịch tính (${preset.name}): ${preset.hint}`
        : `• Yếu tố kịch tính (${preset.name}): ${preset.hint}`;
      return true;
    }
  }

  // ==========================================================================
  // PHẦN 7A: TRÌNH HIỂN THỊ DANH SÁCH THẺ PHÂN CẢNH & SỬA TRỰC TIẾP (UI CARD LIST)
  // ==========================================================================
  class SceneMarkersCardListRenderer {
    constructor(engine) {
      this.engine = engine;
    }

    renderIntoContainer() {
      if (typeof document === 'undefined') return;
      const listEl = document.getElementById('scene-markers-list');
      const badgeEl = document.getElementById('scene-markers-badge');
      const cmdPillEl = document.getElementById('cmd-scenes-status-pill');

      const markers = this.engine.getMarkersForActiveChapter();
      const count = markers.length;

      if (badgeEl) {
        badgeEl.textContent = String(count);
        if (count > 0) {
          badgeEl.classList.remove('hidden');
        }
      }

      if (cmdPillEl) {
        cmdPillEl.textContent =
          count > 0
            ? `🎬 ${count} mốc phân cảnh sẵn sàng nhúng vào Prompt`
            : '🎬 Chưa cài mốc phân cảnh (tự do theo Beats)';
        if (count > 0) {
          cmdPillEl.classList.remove('text-zinc-400', 'border-zinc-700');
          cmdPillEl.classList.add('text-emerald-300', 'border-emerald-500/40', 'bg-emerald-500/10');
        } else {
          cmdPillEl.classList.remove('text-emerald-300', 'border-emerald-500/40', 'bg-emerald-500/10');
          cmdPillEl.classList.add('text-zinc-400', 'border-zinc-700');
        }
      }

      if (!listEl) return;

      if (count === 0) {
        listEl.innerHTML = `
          <div class="p-4 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/50 text-center space-y-1.5">
            <div class="text-sm font-semibold text-zinc-300">Chưa có mốc chuyển phân cảnh nào cho chương này</div>
            <p class="text-xs text-zinc-500">
              Thêm các mốc chuyển cảnh (POV, Thời gian, Địa điểm, Mục tiêu) ở phía trên để AI viết đúng trình tự và tự động khóa không cho nhân vật nhảy góc nhìn lung tung.
            </p>
          </div>
        `;
        return;
      }

      const esc = (s) => this.engine.utils.escapeHtml(s);
      const chapterId = this.engine.getActiveChapterId();

      listEl.innerHTML = markers
        .map((m, idx) => {
          const cutObj = m.transitionId ? CINEMATIC_TRANSITION_TECHNIQUES[m.transitionId] : null;
          const cutLabel = cutObj ? cutObj.label : 'Chuyển cảnh tự nhiên';
          return `
            <div class="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3 space-y-2 hover:border-indigo-500/40 transition">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold shrink-0">Cảnh ${idx + 1}</span>
                  <span class="text-xs font-bold text-zinc-100 truncate">${esc(m.pov || 'Mặc định')}</span>
                </div>
                <div class="flex items-center gap-1 shrink-0">
                  <button type="button" data-scn-act="up" data-scn-id="${esc(m.id)}" title="Đưa phân cảnh lên trước" class="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] text-zinc-300">▲</button>
                  <button type="button" data-scn-act="down" data-scn-id="${esc(m.id)}" title="Đưa phân cảnh xuống sau" class="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] text-zinc-300">▼</button>
                  <button type="button" data-scn-act="dup" data-scn-id="${esc(m.id)}" title="Nhân bản phân cảnh này" class="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] text-zinc-300">📑</button>
                  <button type="button" data-scn-act="edit" data-scn-id="${esc(m.id)}" title="Chỉnh sửa nhanh" class="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] text-amber-300">✏️</button>
                  <button type="button" data-scn-act="del" data-scn-id="${esc(m.id)}" title="Xóa mốc này" class="px-2 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-[11px] text-rose-300">🗑️</button>
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-zinc-400">
                <div>🕒 <span class="text-zinc-200">${esc(m.time || 'Liên tiếp')}</span></div>
                <div>📍 <span class="text-zinc-200">${esc(m.location || 'Không gian mở')}</span></div>
              </div>
              <div class="text-[11px] text-indigo-300/90 font-medium">🎞️ ${esc(cutLabel)}</div>
              <div class="text-xs text-zinc-300 leading-relaxed bg-zinc-950/60 rounded-lg p-2 border border-zinc-800/80 whitespace-pre-line">${esc(m.goal || '(Chưa nhập diễn biến)')}</div>
            </div>
          `;
        })
        .join('');

      listEl.querySelectorAll('[data-scn-act]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const act = btn.getAttribute('data-scn-act');
          const mid = btn.getAttribute('data-scn-id');
          if (act === 'up') this.engine.organizer.moveMarkerInChapter(chapterId, mid, -1);
          else if (act === 'down') this.engine.organizer.moveMarkerInChapter(chapterId, mid, 1);
          else if (act === 'dup') this.engine.organizer.duplicateMarkerInChapter(chapterId, mid);
          else if (act === 'edit') this.engine.loadMarkerIntoFormForEdit(mid);
          else if (act === 'del') this.engine.removeMarker(mid);
        });
      });

      this.injectFooterActionsIfMissing(listEl, count, chapterId);
    }

    injectFooterActionsIfMissing(listEl, count, chapterId) {
      if (count === 0) return;
      const footer = document.createElement('div');
      footer.className = 'flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/80';
      footer.innerHTML = `
        <div class="flex flex-wrap gap-2">
          <button type="button" id="btn-scene-sync-to-beats" class="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/35 border border-emerald-500/35 text-emerald-300 text-xs font-semibold transition">
            📥 Ghi sơ đồ cảnh vào khung Beats Tab 1
          </button>
          <button type="button" id="btn-scene-export-md" class="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-semibold transition">
            📄 Xuất Storyboard (.MD)
          </button>
        </div>
        <button type="button" id="btn-scene-audit-pov" class="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/35 border border-indigo-500/35 text-indigo-300 text-xs font-semibold transition">
          🔍 Kiểm toán lỗi nhảy POV trong bản thảo
        </button>
      `;
      listEl.appendChild(footer);

      footer.querySelector('#btn-scene-sync-to-beats')?.addEventListener('click', () => {
        this.engine.organizer.syncAllChapterMarkersToBeatsBox();
      });
      footer.querySelector('#btn-scene-export-md')?.addEventListener('click', () => {
        this.engine.organizer.exportChapterStoryboardMarkdown(chapterId);
      });
      footer.querySelector('#btn-scene-audit-pov')?.addEventListener('click', () => {
        this.engine.runInteractivePovAuditToast();
      });
    }
  }

  // ==========================================================================
  // PHẦN 7B: BỘ GỢI Ý KHÔNG KHÍ BỐI CẢNH, THỜI TIẾT & TÂM LÝ NHÂN VẬT THEO CẢNH
  // ==========================================================================
  const SCENE_ATMOSPHERE_PRESETS = Object.freeze({
    RAINY_NIGHT_NOIR: {
      label: '🌧️ Đêm mưa neon & Hẻm tối Noir',
      sensoryLighting: 'Ánh đèn đường vàng vọt loang lổ trên mặt nhựa đường ướt sũng, cột đèn chập chờn.',
      sensorySound: 'Tiếng mưa gõ nhịp đều lên mái tôn hòa lẫn tiếng còi tàu xa xăm.',
      emotionalSubtext: 'Cảm giác bị theo dõi, cô lập, che giấu chân tướng sau lớp màn mưa.'
    },
    QUIET_INTERROGATION_ROOM: {
      label: '💡 Phòng thẩm vấn / Không gian kín áp lực cao',
      sensoryLighting: 'Một ngọn đèn bàn rọi thẳng xuống mặt bàn gỗ lạnh, bốn góc phòng chìm trong bóng tối.',
      sensorySound: 'Tiếng đồng hồ treo tường tích tắc khuếch đại mọi khoảng lặng giữa hai lời thoại.',
      emotionalSubtext: 'Cuộc đấu trí nghẹt thở, từng cái chớp mắt hay nhịp gõ ngón tay đều mang tính tố cáo.'
    },
    DAWN_AFTERMATH_HEALING: {
      label: '🌅 Bình minh hậu biến cố / Khoảnh khắc lắng đọng',
      sensoryLighting: 'Tia nắng đầu ngày xuyên qua lớp bụi mịn chiếu nghiêng lên khung cửa sổ cũ.',
      sensorySound: 'Tiếng chim sớm lác đác xen lẫn hơi thở chậm rãi sau một đêm dài mất ngủ.',
      emotionalSubtext: 'Vết thương vẫn còn nhói nhưng niềm tin mong manh giữa hai nhân vật bắt đầu nảy mầm.'
    },
    CROWDED_BANQUET_INTRIGUE: {
      label: '🥂 Tiệc thượng lưu / Nguy hiểm sau nụ cười',
      sensoryLighting: 'Đèn chùm pha lê lộng lẫy nhưng che khuất nhiều góc khuất sau những hàng cột đá.',
      sensorySound: 'Tiếng ly thủy tinh chạm khẽ, nhạc dương cầm du dương át đi những lời uy hiếp thì thầm.',
      emotionalSubtext: 'Lịch thiệp bên ngoài, dao găm bên trong — ai cũng đang đeo một chiếc mặt nạ hoàn hảo.'
    },
    ANCIENT_TEMPLE_MYSTERY: {
      label: '🏮 Cổ miếu / Khu di tích bị lãng quên',
      sensoryLighting: 'Ánh nến lập lòe hắt bóng dài ngoằng lên bức tường rêu phong phủ đầy chữ khắc mờ.',
      sensorySound: 'Tiếng gió rít qua khe cửa gỗ mục và bước chân vang vọng trên nền gạch đá.',
      emotionalSubtext: 'Sức nặng của quá khứ bị chôn vùi sắp sửa trỗi dậy ngay khoảnh khắc bức màn được vén lên.'
    },
    MOVING_TRAIN_CROSSROADS: {
      label: '🚆 Chuyến tàu đêm / Đường ranh giới không thể quay đầu',
      sensoryLighting: 'Ánh sáng đèn ga vút qua ô cửa kính tạo thành những vệt sáng tối đứt quãng trên gương mặt.',
      sensorySound: 'Nhịp bánh sắt nghiến trên đường ray đều đặn như đếm ngược thời gian chia ly.',
      emotionalSubtext: 'Hai nhân vật bị giam chung một toa tàu buộc phải đối diện sự thật trước ga cuối.'
    }
  });

  class SceneAtmosphereAndSettingCoach {
    constructor(engine) {
      this.engine = engine;
    }

    getPresetKeys() {
      return Object.keys(SCENE_ATMOSPHERE_PRESETS);
    }

    getPreset(key) {
      return SCENE_ATMOSPHERE_PRESETS[key] || SCENE_ATMOSPHERE_PRESETS.RAINY_NIGHT_NOIR;
    }

    /**
     * Dựa vào từ khóa Địa điểm & Thời gian tác giả vừa gõ trong Form,
     * gợi ý gói không khí ngũ quan phù hợp để nhúng thêm vào chỉ đạo cảnh cho AI.
     */
    suggestAtmosphereForScene(timeText, locationText) {
      const combined = `${timeText || ''} ${locationText || ''}`.toLowerCase();
      if (/(?:mưa|hẻm|đêm|bến cảng|nghĩa trang)/i.test(combined)) {
        return SCENE_ATMOSPHERE_PRESETS.RAINY_NIGHT_NOIR;
      }
      if (/(?:thẩm vấn|phòng kín|tầng hầm|cục cảnh sát|nhà giam)/i.test(combined)) {
        return SCENE_ATMOSPHERE_PRESETS.QUIET_INTERROGATION_ROOM;
      }
      if (/(?:bình minh|sáng sớm|ban mai|bệnh viện|vườn)/i.test(combined)) {
        return SCENE_ATMOSPHERE_PRESETS.DAWN_AFTERMATH_HEALING;
      }
      if (/(?:tiệc|khách sạn|đại sảnh|biệt thự|nhà hàng)/i.test(combined)) {
        return SCENE_ATMOSPHERE_PRESETS.CROWDED_BANQUET_INTRIGUE;
      }
      if (/(?:miếu|đền|cổ|núi|rừng|hoang)/i.test(combined)) {
        return SCENE_ATMOSPHERE_PRESETS.ANCIENT_TEMPLE_MYSTERY;
      }
      if (/(?:tàu|ga|xe buýt|sân bay|chuyến xe)/i.test(combined)) {
        return SCENE_ATMOSPHERE_PRESETS.MOVING_TRAIN_CROSSROADS;
      }
      return null;
    }

    formatAtmospherePromptBlock(marker) {
      const preset = this.suggestAtmosphereForScene(marker.time, marker.location);
      if (!preset) return '';
      return [
        `   • Gợi ý ánh sáng & thị giác: ${preset.sensoryLighting}`,
        `   • Gợi ý âm thanh nền: ${preset.sensorySound}`,
        `   • Nhịp cảm xúc ngầm (Subtext): ${preset.emotionalSubtext}`
      ].join('\n');
    }
  }

  /**
   * Bộ tạo Khung chuyển phân cảnh thông minh giữa 2 chương liền kề
   * (Cross-Chapter Bridge) giúp giữ nguyên vật phẩm, thương tích hoặc trạng thái
   * tâm lý của nhân vật ở dòng cuối chương trước sang dòng đầu chương mới.
   */
  class CrossChapterSceneContinuityBridge {
    extractLastParagraphHook(chapterContent) {
      const text = String(chapterContent || '').trim();
      if (!text) return '';
      const paras = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
      if (paras.length === 0) return '';
      const last = paras.slice(-2).join('\n\n');
      return last.length > 520 ? `…${last.slice(-520)}` : last;
    }

    buildPreviousChapterHandoffDirective(allChapters, activeChapterId) {
      const list = Array.isArray(allChapters) ? allChapters : [];
      const curIdx = list.findIndex((c) => c.id === activeChapterId);
      if (curIdx <= 0) return '';
      const prevChap = list[curIdx - 1];
      const hook = this.extractLastParagraphHook(prevChap?.content || '');
      if (!hook) return '';

      return [
        `--- LIÊN KẾT ĐẦU-CUỐI TỪ CHƯƠNG LIỀN TRƯỚC (${prevChap.displayTitle || prevChap.title}) ---`,
        `Đoạn kết ngay trước chương này để AI nối mạch không gian/cảm xúc mượt mà:`,
        hook
      ].join('\n');
    }
  }

  // ==========================================================================
  // PHẦN 7C: BỘ THEO DÕI NHÂN VẬT & ĐẠO CỤ XUẤT HIỆN TRONG TỪNG PHÂN CẢNH
  // ==========================================================================
  class SceneCastAndPropContinuityTracker {
    constructor(engine) {
      this.engine = engine;
    }

    /**
     * Tự động trích xuất danh sách nhân vật từ Story Bible (Module 12) hoặc văn bản mục tiêu
     * để hỗ trợ gợi ý POV nhanh khi tác giả tạo mốc chuyển phân cảnh mới.
     */
    getSuggestedCharacterPovOptions() {
      const suggestions = [
        'Ngôi thứ 3 giới hạn (Theo sát nhân vật chính)',
        'Ngôi thứ 1 (Xưng "Tôi" — Nội tâm trực diện)',
        'Ngôi thứ 3 đa điểm nhìn (Chuyển POV rõ rệt theo cảnh)',
        'Ngôi thứ 3 khách quan (Ống kính điện ảnh trung lập)'
      ];

      try {
        const bible = window.NoirStudio?.storyBible;
        const chars =
          bible?.data?.characters ||
          bible?.characters ||
          bible?.getAllCharacters?.() ||
          [];
        if (Array.isArray(chars)) {
          chars.slice(0, 12).forEach((ch) => {
            const name = ch?.name || ch?.ten || '';
            if (name && typeof name === 'string') {
              suggestions.push(`Ngôi 3 giới hạn theo góc nhìn [${name.trim()}]`);
            }
          });
        }
      } catch (_) {
        // Bỏ qua nếu Story Bible chưa nạp
      }

      return suggestions;
    }

    /**
     * Phát hiện nhanh các đạo cụ / thương tích quan trọng được nhắc trong các mốc cảnh trước
     * để cảnh báo AI giữ đúng tính liên tục vật lý (Continuity Lock).
     */
    extractContinuityPropsFromMarkers(markers) {
      const list = Array.isArray(markers) ? markers : [];
      const propHints = [];
      const injuryKeywords = [
        'bị thương', 'chảy máu', 'gãy tay', 'mất chìa khóa', 'cầm khẩu súng',
        'mảnh giấy', 'bức thư', 'cuốn sổ', 'nhẫn', 'chiếc đồng hồ', 'áo khoác ướt'
      ];

      list.forEach((m, idx) => {
        const goalLower = String(m.goal || '').toLowerCase();
        injuryKeywords.forEach((kw) => {
          if (goalLower.includes(kw)) {
            propHints.push(`Từ Cảnh ${idx + 1} (${m.location || 'Chưa rõ'}): lưu ý chi tiết "${kw}".`);
          }
        });
      });

      return propHints;
    }
  }

  // ==========================================================================
  // PHẦN 8: LỚP CHỦ QUẢN BỘ XÂY DỰNG PHÂN CẢNH & GÓC NHÌN (SCENE BUILDER)
  // ==========================================================================
  class SceneTransitionAndPOVBuilderEngine {
    constructor() {
      this.NS = window.NoirStudio;
      this.markersByChapter = {};
      this.editingMarkerId = null;
      this.initialized = false;
    }

    get utils() {
      return (
        this.NS.utils || {
          escapeHtml: (s) => String(s ?? ''),
          formatTimestampVN: (t) => new Date(t || Date.now()).toLocaleString('vi-VN'),
          slugifyVietnameseFilename: (t) => String(t || 'chuong').replace(/\W+/g, '_'),
          showToast: () => {}
        }
      );
    }

    getStorageKey() {
      const c = getStudioConstants();
      return c?.STORAGE_KEYS?.SCENE_MARKERS || 'noir_s18_scene_pov_markers_v1';
    }

    ensureSubSystems() {
      if (!this.auditor) this.auditor = new POVHeadHoppingAuditorAndValidator(this.utils);
      if (!this.modalEnhancer) this.modalEnhancer = new SceneTransitionModalEnhancer(this);
      if (!this.organizer) this.organizer = new SceneSequenceOrganizerAndMarkdownExporter(this);
      if (!this.conflictHelper) this.conflictHelper = new SceneMicroConflictHelper();
      if (!this.cardRenderer) this.cardRenderer = new SceneMarkersCardListRenderer(this);
      if (!this.atmosphereCoach) this.atmosphereCoach = new SceneAtmosphereAndSettingCoach(this);
      if (!this.continuityBridge) this.continuityBridge = new CrossChapterSceneContinuityBridge();
      if (!this.castTracker) this.castTracker = new SceneCastAndPropContinuityTracker(this);
    }

    getActiveChapterId() {
      if (this.NS.chapterManager && typeof this.NS.chapterManager.getActiveChapter === 'function') {
        const active = this.NS.chapterManager.getActiveChapter();
        if (active && active.id) return active.id;
      }
      if (this.NS.state?.activeChapterId) {
        return this.NS.state.activeChapterId;
      }
      return 'chap_default_001';
    }

    loadFromStorage() {
      try {
        const raw = localStorage.getItem(this.getStorageKey());
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            this.markersByChapter = parsed;
            return;
          }
        }
      } catch (_) {
        // Fallback object rỗng
      }
      this.markersByChapter = {};
    }

    persist() {
      try {
        localStorage.setItem(this.getStorageKey(), JSON.stringify(this.markersByChapter));
        if (this.NS.idb && typeof this.NS.idb.set === 'function') {
          const settingsStore = this.NS.constants?.STORES?.SETTINGS || 'settings';
          this.NS.idb.set(settingsStore, this.getStorageKey(), this.markersByChapter).catch(() => {});
        }
        return true;
      } catch (_) {
        return false;
      }
    }

    getMarkersForActiveChapter() {
      const chapId = this.getActiveChapterId();
      if (!Array.isArray(this.markersByChapter[chapId])) {
        this.markersByChapter[chapId] = [];
      }
      return this.markersByChapter[chapId];
    }

    openModal() {
      this.ensureSubSystems();
      if (typeof document === 'undefined') return;
      const modal = document.getElementById('modal-scene-transition-builder');
      if (!modal) return;
      this.modalEnhancer.ensureEnhancedControlsInModal();
      this.populateDynamicPovSuggestions();
      this.renderMarkersListUI();
      modal.classList.remove('hidden');
    }

    closeModal() {
      if (typeof document === 'undefined') return;
      const modal = document.getElementById('modal-scene-transition-builder');
      if (modal) modal.classList.add('hidden');
      this.editingMarkerId = null;
    }

    populateDynamicPovSuggestions() {
      if (typeof document === 'undefined') return;
      const povSelect = document.getElementById('scene-builder-pov');
      if (!povSelect || povSelect.tagName !== 'SELECT') return;

      const bible = this.NS.storyBible;
      const charList = bible?.data?.characters || bible?.characters || [];
      if (!Array.isArray(charList) || charList.length === 0) return;

      const existingVals = new Set(Array.from(povSelect.options).map((o) => o.value));
      charList.slice(0, 10).forEach((ch) => {
        const name = String(ch?.name || ch?.ten || '').trim();
        if (!name) return;
        const val = `Ngôi 3 giới hạn theo góc nhìn [${name}]`;
        if (!existingVals.has(val)) {
          const opt = document.createElement('option');
          opt.value = val;
          opt.textContent = `👤 ${val}`;
          povSelect.appendChild(opt);
        }
      });
    }

    addMarkerFromModal() {
      this.ensureSubSystems();
      if (typeof document === 'undefined') return null;

      const povEl = document.getElementById('scene-builder-pov');
      const timeEl = document.getElementById('scene-builder-time');
      const locEl = document.getElementById('scene-builder-location');
      const goalEl = document.getElementById('scene-builder-goal');
      const cutEl = document.getElementById('scene-cinematic-cut-picker');

      const pov = String(povEl?.value || 'Ngôi thứ 3 giới hạn (Theo sát nhân vật chính)').trim();
      const time = String(timeEl?.value || '').trim();
      const location = String(locEl?.value || '').trim();
      const goal = String(goalEl?.value || '').trim();
      const transitionId = String(cutEl?.value || this.modalEnhancer?.selectedTransitionId || 'MATCH_CUT_OBJECT');

      if (!goal && !location && !time) {
        this.utils.showToast(
          '⚠️ Bạn hãy nhập ít nhất Thời gian, Địa điểm hoặc Mục tiêu diễn biến của phân cảnh nhé!',
          'warning'
        );
        return null;
      }

      const chapId = this.getActiveChapterId();
      if (!Array.isArray(this.markersByChapter[chapId])) {
        this.markersByChapter[chapId] = [];
      }

      let savedMarker = null;
      if (this.editingMarkerId) {
        const existing = this.markersByChapter[chapId].find((m) => m.id === this.editingMarkerId);
        if (existing) {
          existing.pov = pov;
          existing.time = time;
          existing.location = location;
          existing.goal = goal;
          existing.transitionId = transitionId;
          existing.updatedAt = Date.now();
          savedMarker = existing;
          this.editingMarkerId = null;
          this.utils.showToast('✏️ Đã cập nhật Mốc chuyển phân cảnh!', 'success');
        }
      }

      if (!savedMarker) {
        savedMarker = {
          id: `scn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          pov,
          time,
          location,
          goal,
          transitionId,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        this.markersByChapter[chapId].push(savedMarker);
        this.utils.showToast(
          `🎬 Đã thêm Phân cảnh #${this.markersByChapter[chapId].length} (tự động nhúng vào Prompt Tổng Hợp)!`,
          'success'
        );
      }

      if (timeEl) timeEl.value = '';
      if (locEl) locEl.value = '';
      if (goalEl) goalEl.value = '';

      const saveBtn = document.getElementById('btn-save-scene-marker');
      if (saveBtn) {
        saveBtn.textContent = '➕ Lưu & Thêm Mốc Phân Cảnh';
      }

      this.persist();
      this.renderMarkersListUI();
      return savedMarker;
    }

    loadMarkerIntoFormForEdit(markerId) {
      const markers = this.getMarkersForActiveChapter();
      const target = markers.find((m) => m.id === markerId);
      if (!target || typeof document === 'undefined') return;

      this.editingMarkerId = target.id;
      const povEl = document.getElementById('scene-builder-pov');
      const timeEl = document.getElementById('scene-builder-time');
      const locEl = document.getElementById('scene-builder-location');
      const goalEl = document.getElementById('scene-builder-goal');
      const cutEl = document.getElementById('scene-cinematic-cut-picker');
      const saveBtn = document.getElementById('btn-save-scene-marker');

      if (povEl && target.pov) povEl.value = target.pov;
      if (timeEl) timeEl.value = target.time || '';
      if (locEl) locEl.value = target.location || '';
      if (goalEl) goalEl.value = target.goal || '';
      if (cutEl && target.transitionId) cutEl.value = target.transitionId;
      if (saveBtn) saveBtn.textContent = '💾 Cập Nhật Mốc Phân Cảnh Đang Sửa';
    }

    removeMarker(markerId) {
      const chapId = this.getActiveChapterId();
      const list = this.markersByChapter[chapId];
      if (!Array.isArray(list)) return false;
      const before = list.length;
      this.markersByChapter[chapId] = list.filter((m) => m.id !== markerId);
      if (this.editingMarkerId === markerId) {
        this.editingMarkerId = null;
      }
      if (this.markersByChapter[chapId].length !== before) {
        this.persist();
        this.renderMarkersListUI();
        this.utils.showToast('🗑️ Đã xóa mốc chuyển phân cảnh.', 'info', 2000);
        return true;
      }
      return false;
    }

    renderMarkersListUI() {
      this.ensureSubSystems();
      this.cardRenderer.renderIntoContainer();
    }

    runInteractivePovAuditToast() {
      this.ensureSubSystems();
      const chap = this.NS.chapterManager?.getActiveChapter?.();
      const text = chap?.content || document.getElementById('textarea-chapter-content')?.value || '';
      const markers = this.getMarkersForActiveChapter();
      const primaryPov = markers[0]?.pov || 'Ngôi thứ 3 giới hạn';
      const report = this.auditor.auditSceneContentAgainstPOV(text, primaryPov);
      const firstMsg = report.findings?.[0]?.detail || report.findings?.[0] || 'Hoàn tất kiểm toán.';
      const msg = typeof firstMsg === 'string' ? firstMsg : firstMsg.detail;
      this.utils.showToast(
        `📷 Điểm nhất quán POV: ${report.score}/100 — ${msg}`,
        report.status === 'CLEAN' ? 'success' : 'warning',
        5200
      );
      return report;
    }

    /**
     * HÀM CỐT LÕI: Biên dịch 100% toàn bộ các Mốc chuyển phân cảnh + Quy tắc chống nhảy POV
     * + Kỹ thuật chuyển cảnh + Không khí ngũ quan + Liên kết đầu-cuối chương trước
     * để Master Prompt Synthesizer (Module 16) bắt buộc nhúng vào Prompt Tổng Hợp!
     */
    buildCompiledSceneMarkersBlockForPrompt(options = {}) {
      this.ensureSubSystems();
      const chapId = options.chapterId || this.getActiveChapterId();
      const markers = Array.isArray(this.markersByChapter[chapId])
        ? this.markersByChapter[chapId]
        : [];

      const allChapters = this.NS.chapterManager?.chapters || [];
      const prevBridge = this.continuityBridge.buildPreviousChapterHandoffDirective(allChapters, chapId);

      if (markers.length === 0) {
        if (!prevBridge) return '';
        return [
          '====================================================================',
          '🎬 LIÊN KẾT MẠCH CHUYỂN CẢNH TỪ CHƯƠNG LIỀN TRƯỚC:',
          prevBridge,
          '===================================================================='
        ].join('\n');
      }

      const blocks = [
        '====================================================================',
        '🎬 SƠ ĐỒ PHÂN CẢNH & CHỐT GÓC NHÌN POV BẮT BUỘC (SCENE MARKERS):',
        'YÊU CẦU TỐI THƯỢNG: Tác phẩm PHẢI đi qua lần lượt từng phân cảnh dưới đây,',
        'ngăn cách giữa các phân cảnh bằng dấu `* * *`, giữ chặt máy quay đúng POV!',
        '===================================================================='
      ];

      if (prevBridge) {
        blocks.push(prevBridge);
        blocks.push('');
      }

      markers.forEach((m, idx) => {
        const tech = m.transitionId ? CINEMATIC_TRANSITION_TECHNIQUES[m.transitionId] : null;
        const povDirective = this.auditor.buildPromptGuardDirectiveForPov(m.pov);
        const atmoHint = this.atmosphereCoach.formatAtmospherePromptBlock(m);

        blocks.push(`[PHÂN CẢNH SỐ ${idx + 1}]`);
        blocks.push(`• Góc nhìn (POV): ${m.pov || 'Ngôi thứ 3 giới hạn'}`);
        blocks.push(`• Luật giữ ống kính: ${povDirective}`);
        if (m.time) blocks.push(`• Mốc thời gian: ${m.time}`);
        if (m.location) blocks.push(`• Địa điểm / Không gian: ${m.location}`);
        if (tech && idx > 0) {
          blocks.push(`• Kỹ thuật chuyển cảnh từ Cảnh ${idx} -> Cảnh ${idx + 1}: ${tech.directive}`);
        }
        blocks.push(`• Mục tiêu & Biến cố chính: ${m.goal || 'Triển khai mượt mà theo Beats.'}`);
        if (atmoHint) {
          blocks.push('• Gợi ý khí quyển & Ngũ quan cảnh này:');
          blocks.push(atmoHint);
        }
        const camBrief = this.cameraDirector?.buildLightingAndCameraBrief?.(m);
        if (camBrief) {
          blocks.push(camBrief);
        }
        const texBrief = this.textureAdvisor?.formatSensoryChecklistForPrompt?.(m.location);
        if (texBrief) {
          blocks.push(texBrief);
        }
        blocks.push('');
      });

      const continuityProps = this.castTracker.extractContinuityPropsFromMarkers(markers);
      if (continuityProps.length > 0) {
        blocks.push('⚠️ RÀNG BUỘC LIÊN TỤC VẬT PHẨM & THƯƠNG TÍCH GIỮA CÁC CẢNH:');
        continuityProps.forEach((hint) => blocks.push(`- ${hint}`));
      }

      return blocks.join('\n');
    }

    bindDomEvents() {
      if (typeof document === 'undefined') return;
      const bind = (id, handler) => {
        const el = document.getElementById(id);
        if (!el || el.dataset.noirMod13Bound) return;
        el.dataset.noirMod13Bound = '1';
        el.addEventListener('click', handler);
      };

      bind('btn-insert-scene-transition', () => this.openModal());
      bind('btn-cmd-add-scene-marker', () => this.openModal());
      bind('btn-close-scene-builder', () => this.closeModal());
      bind('btn-save-scene-marker', () => this.addMarkerFromModal());
    }

    init() {
      if (this.initialized) return this;
      this.initialized = true;
      this.ensureSubSystems();
      this.loadFromStorage();
      this.bindDomEvents();
      this.renderMarkersListUI();
      return this;
    }
  }

  // ==========================================================================
  // PHẦN 9: THƯ VIỆN 16 BƯỚC CHUYỂN CỰC CẢM XÚC & PHÂN TÍCH MỤC TIÊU CẢNH
  // ==========================================================================
  const SCENE_EMOTIONAL_POLARITY_ARCS = Object.freeze([
    {
      id: 'ARC_HOPE_TO_BETRAYAL',
      title: '💔 Hy vọng chạm tay → Phản bội / Vỡ mộng',
      startCharge: '+',
      endCharge: '--',
      usage: 'Dùng ở cuối hồi 1 hoặc cao trào giữa truyện để đẩy nhân vật vào thế đường cùng.',
      beatFormula:
        '1) Nhân vật tưởng đã nắm chắc phần thắng hoặc nhận được lời hứa; 2) Một chi tiết nhỏ lệch pha xuất hiện; 3) Chân tướng bị lật tung ngay trước mắt.'
    },
    {
      id: 'ARC_FEAR_TO_REVELATION',
      title: '🔦 Sợ hãi mù mờ → Thấu hiểu sự thật lạnh người',
      startCharge: '-',
      endCharge: '-+',
      usage: 'Phù hợp truyện trinh thám Noir, kinh dị tâm lý khi mở cửa phòng mật hoặc đọc nhật ký.',
      beatFormula:
        '1) Bóng tối và âm thanh lạ bao vây; 2) Nhân vật buộc phải đối diện nguồn phát ra nỗi sợ; 3) Nhận ra kẻ gây án không phải quái vật xa lạ mà là người quen.'
    },
    {
      id: 'ARC_COLD_TO_VULNERABLE',
      title: '🫂 Lạnh nhạt phòng thủ → Mở lòng chớp nhoáng',
      startCharge: '-',
      endCharge: '+',
      usage: 'Cảnh chữa lành chậm rãi giữa hai nhân vật từng mang nhiều vết thương quá khứ.',
      beatFormula:
        '1) Đối đáp cộc lốc giữ khoảng cách; 2) Một cử chỉ vô thức đầy quan tâm (đưa cốc trà ấm, che mưa); 3) Lớp băng cứng tạm nứt ra qua một câu nói thật lòng.'
    },
    {
      id: 'ARC_CALM_TO_AMBUSH',
      title: '⚡ Bình yên giả tạo → Phục kích bất ngờ',
      startCharge: '+',
      endCharge: '--',
      usage: 'Tạo cú giật thót tim chuyển từ cảnh sinh hoạt đời thường sang hành động nghẹt thở.',
      beatFormula:
        '1) Không khí êm ả với tiếng nói cười hoặc mùi cơm chiều; 2) Âm thanh nhỏ lạc nhịp (tiếng lên đạn / bóng người tắt đèn); 3) Tiếng kính vỡ hoặc đòn tấn công chớp nhoáng.'
    },
    {
      id: 'ARC_DOUBT_TO_RESOLVE',
      title: '🔥 Hoang mang dao động → Quyết tâm không quay đầu',
      startCharge: '-',
      endCharge: '++',
      usage: 'Khoảnh khắc trưởng thành nội tâm (Character Turning Point) trước trận chiến cuối.',
      beatFormula:
        '1) Nhân vật dằn vặt giữa an toàn cá nhân và trách nhiệm; 2) Ký ức hoặc vật kỷ niệm đánh thức lý do bắt đầu; 3) Gạt bỏ do dự, hành động dứt khoát.'
    },
    {
      id: 'ARC_COMIC_TO_STUNNED_SILENCE',
      title: '🤫 Đùa vui nhẹ nhõm → Lặng người vì một cái tên',
      startCharge: '+',
      endCharge: '-',
      usage: 'Kỹ thuật tương phản Light Novel Nhật Bản — thả lỏng người đọc rồi thả bom thông tin.',
      beatFormula:
        '1) Màn tung hứng hội thoại dí dỏm; 2) Một nhân vật vô tình buột miệng nhắc một mốc ngày tháng/bí danh cấm kỵ; 3) Nụ cười tắt lịm trên môi tất cả mọi người.'
    },
    {
      id: 'ARC_TRAPPED_TO_CLEVER_ESCAPE',
      title: '🗝️ Bị dồn chân tường → Lật kèo bằng trí tuệ',
      startCharge: '--',
      endCharge: '+',
      usage: 'Thể hiện IQ thực chiến của nhân vật chính thay vì thắng bằng sức mạnh phi lý.',
      beatFormula:
        '1) Đối thủ khóa hết đường lui; 2) Nhân vật chính tận dụng chính kiêu ngạo của kẻ địch hoặc chi tiết đã gieo ở đầu cảnh; 3) Thoát hiểm trong gang tấc.'
    },
    {
      id: 'ARC_SUSPICION_TO_MUTUAL_PACT',
      title: '🤝 Nghi kỵ chĩa súng vào nhau → Bắt tay tạm thời vì kẻ thù chung',
      startCharge: '-',
      endCharge: '+?',
      usage: 'Rất hiệu quả khi ghép cặp đối thủ cũ thành đồng minh bất đắc dĩ.',
      beatFormula:
        '1) Hai bên kìm kẹp nhau từng lời; 2) Mối nguy chung buộc cả hai phải chia sẻ mảnh thông tin; 3) Bắt tay thỏa thuận kèm điều kiện ngầm chưa ai tin hẳn ai.'
    },
    {
      id: 'ARC_NOSTALGIA_TO_GOODBYE',
      title: '🌧️ Hoài niệm ấm áp → Chia tay lặng lẽ không hẹn ngày về',
      startCharge: '+',
      endCharge: '-',
      usage: 'Phân cảnh tiễn biệt giàu dư âm văn học mà không cần khóc lóc ầm ĩ.',
      beatFormula:
        '1) Cùng nhắc lại kỷ niệm vụn vặt; 2) Bóng tàu hoặc tiếng còi xe báo giờ khởi hành; 3) Một người bước đi không ngoái lại để giấu giọt nước mắt.'
    },
    {
      id: 'ARC_DEFEAT_TO_DARK_AWAKENING',
      title: '🌑 Thất bại nhục nhã → Thức tỉnh mặt tối lạnh lẽo',
      startCharge: '--',
      endCharge: '-!',
      usage: 'Mở đầu cho giai đoạn Anti-Hero hoặc nhân vật thay đổi triết lý sống.',
      beatFormula:
        '1) Phép lịch sự và lòng tốt bị chà đạp; 2) Khoảnh khắc ngồi một mình trong bóng tối nhìn đôi tay bầm dập; 3) Nụ cười lạnh tanh báo hiệu màn trả giá sắp tới.'
    }
  ]);

  /**
   * Bộ chấm điểm & kiểm tra "Chất lượng Phân cảnh Đạt Chuẩn" (Scene Goal Validator)
   * đảm bảo mỗi cảnh đều có: Nhân vật muốn gì (Want) + Vật cản là gì (Obstacle) + Giá trị đổi chiều (Turn).
   */
  class SceneDramaticTurnAdvisor {
    constructor(builderEngine) {
      this.engine = builderEngine;
    }

    getPolarityArcs() {
      return SCENE_EMOTIONAL_POLARITY_ARCS;
    }

    evaluateMarkerDramaticWeight(marker) {
      const goal = String(marker?.goal || '').trim();
      const loc = String(marker?.location || '').trim();
      const time = String(marker?.time || '').trim();

      let score = 35;
      const recommendations = [];

      if (goal.length >= 45) score += 25;
      else recommendations.push('Mô tả mục tiêu cảnh còn ngắn — hãy thêm mâu thuẫn hoặc kết quả đảo chiều ở cuối cảnh.');

      if (loc.length >= 5) score += 15;
      else recommendations.push('Bổ sung Địa điểm cụ thể để AI dựng bối cảnh ánh sáng và không gian chính xác.');

      if (time.length >= 3) score += 10;
      else recommendations.push('Thêm Mốc thời gian (ví dụ: 22:15 hoặc Sáng hôm sau) tránh rối dòng thời gian.');

      if (/(?:nhưng|tuy nhiên|bất ngờ|phát hiện|bị chặn|ngăn cản|mâu thuẫn|giấu|nói dối|thú nhận)/i.test(goal)) {
        score += 15;
      } else {
        recommendations.push('Gợi ý chèn từ khóa xung đột/bước ngoặt ("nhưng", "bất ngờ phát hiện", "ngăn cản") để cảnh có kịch tính!');
      }

      return {
        score: Math.min(100, score),
        hasConflictHook: score >= 75,
        recommendations
      };
    }

    suggestRandomPolarityFormulaText() {
      const list = SCENE_EMOTIONAL_POLARITY_ARCS;
      const pick = list[Math.floor(Math.random() * list.length)];
      return `[${pick.title}] ${pick.beatFormula}`;
    }

    /**
     * Phân tích tỷ lệ Hội thoại vs Tự sự mong muốn cho cảnh dựa trên nhịp độ đã chọn
     */
    recommendDialogueTargetForMarker(marker) {
      const goalLower = String(marker?.goal || '').toLowerCase();
      if (/(?:thẩm vấn|tranh luận|đối chất|nói chuyện|hội thoại|cãi vã|tỏ tình)/i.test(goalLower)) {
        return {
          modeLabel: 'Cảnh giàu Đối thoại & Subtext',
          dialoguePercentRange: '55% - 75%',
          tip: 'Ưu tiên thoại ngắn gọn có ẩn ý, xen kẽ hành vi vi biểu cảm (gõ ngón tay, nhìn xuống, hít sâu) thay vì giải thích dài.'
        };
      }
      if (/(?:chiến đấu|rượt đuổi|chạy trốn|đột nhập|ám sát|hành động)/i.test(goalLower)) {
        return {
          modeLabel: 'Cảnh Hành động tốc độ cao',
          dialoguePercentRange: '10% - 25%',
          tip: 'Dùng động từ mạnh, câu ngắn ngắt nhịp nhanh, hạn chế nội tâm dài dòng giữa lúc giao tranh.'
        };
      }
      if (/(?:hồi ức|suy tư|điều tra hiện trường|khám phá|lần theo dấu vết)/i.test(goalLower)) {
        return {
          modeLabel: 'Cảnh Tâm lý / Điều tra chiều sâu',
          dialoguePercentRange: '20% - 40%',
          tip: 'Khai thác mạnh khứu giác, thính giác và dòng suy luận sắc bén của nhân vật POV.'
        };
      }
      return {
        modeLabel: 'Cảnh Tự sự Cân bằng',
        dialoguePercentRange: '35% - 50%',
        tip: 'Đan xen nhịp nhàng giữa hành động, miêu tả môi trường và lời thoại tự nhiên.'
      };
    }

    /**
     * Xuất toàn bộ thư viện Công thức Đảo Cực Cảm Xúc dưới dạng chuỗi gợi ý gọn nhẹ cho Modal AI
     */
    buildCompactSceneCraftCheatsheetText() {
      return SCENE_EMOTIONAL_POLARITY_ARCS.slice(0, 6)
        .map((arc, idx) => `${idx + 1}. ${arc.title}: ${arc.beatFormula}`)
        .join('\n');
    }
  }

  /**
   * Trình đồng bộ nhanh Mốc Phân Cảnh giữa Modal Phân cảnh và Modal Lệnh AI Toàn Màn Hình
   * giúp tác giả thấy ngay danh sách phân cảnh đã khóa khi mở cửa sổ chạy Prompt.
   */
  class SceneCommandModalLiveBadgeBridge {
    constructor(builderEngine) {
      this.engine = builderEngine;
    }

    refreshAllCommandBadges() {
      if (typeof document === 'undefined') return;
      const markers = this.engine.getMarkersForActiveChapter();
      const count = markers.length;
      const pill = document.getElementById('cmd-scenes-status-pill');
      if (pill) {
        if (count > 0) {
          const povPreview = markers
            .slice(0, 2)
            .map((m, i) => `Cảnh ${i + 1}: ${(m.location || m.pov || 'Chưa rõ').slice(0, 24)}`)
            .join(' → ');
          pill.textContent = `🎬 ${count} mốc cảnh sẵn sàng (${povPreview}${count > 2 ? '…' : ''})`;
          pill.title = 'Tất cả mốc chuyển phân cảnh này sẽ được hợp nhất 100% vào Prompt Tổng Hợp!';
        } else {
          pill.textContent = '🎬 Chưa cài mốc phân cảnh (tự do theo Beats)';
        }
      }
    }

    bindLiveModalObserver() {
      if (typeof document === 'undefined') return;
      const cmdBtn = document.getElementById('btn-open-fullscreen-ai-command');
      if (cmdBtn && !cmdBtn.dataset.noirMod13BridgeBound) {
        cmdBtn.dataset.noirMod13BridgeBound = '1';
        cmdBtn.addEventListener('click', () => {
          setTimeout(() => this.refreshAllCommandBadges(), 30);
        });
      }
    }
  }

  // ==========================================================================
  // PHẦN 10: THƯ VIỆN ỐNG KÍNH ĐIỆN ẢNH & ĐỒNG HỒ ÁNH SÁNG TỰ NHIÊN THEO CẢNH
  // ==========================================================================
  const CINEMATOGRAPHY_SHOT_FRAMING_GUIDE = Object.freeze({
    ECU_PSYCHOLOGICAL: {
      id: 'ECU_PSYCHOLOGICAL',
      name: '👁️ Đặc tả vi biểu cảm (Extreme Close-Up)',
      instruction:
        'Tập trung ống kính vào tiểu tiết siêu nhỏ: mạch máu giật nhẹ nơi thái dương, đầu ngón tay run khẽ trên mép cốc, đồng tử co lại khi nghe thấy một cái tên.'
    },
    OTS_CONFRONTATION: {
      id: 'OTS_CONFRONTATION',
      name: '🎭 Quay qua vai đối thoại (Over-the-Shoulder)',
      instruction:
        'Giữ khoảng cách vừa đủ để độc giả thấy được phản ứng của người đối diện qua bờ vai nhân vật POV, nhấn mạnh ranh giới tâm lý và thế trận áp đảo.'
    },
    DUTCH_TILT_UNEASE: {
      id: 'DUTCH_TILT_UNEASE',
      name: '📐 Góc nghiêng bất ổn (Dutch Tilt / Noir Suspense)',
      instruction:
        'Khung hình chông chênh, các đường thẳng kiến trúc nghiêng lệch tạo cảm giác bất an, dối trá hoặc sắp có biến cố phá vỡ trật tự.'
    },
    WIDE_ISOLATION: {
      id: 'WIDE_ISOLATION',
      name: '🏙️ Toàn cảnh cô lập (Extreme Wide Isolation)',
      instruction:
        'Thu nhỏ nhân vật giữa không gian mênh mông (ga tàu vắng, sân thượng đêm mưa, cánh đồng tuyết) để khắc họa nỗi cô độc hoặc sự bất lực.'
    },
    TRACKING_ACTION: {
      id: 'TRACKING_ACTION',
      name: '🏃 Máy quay bám đuổi liên tục (Long Tracking Shot)',
      instruction:
        'Di chuyển nhịp độ câu văn theo từng bước chạy, hơi thở dồn và tiếng va quệt vật cản, tránh ngắt nhịp bằng hồi tưởng dài dòng.'
    },
    SILHOUETTE_MYSTERY: {
      id: 'SILHOUETTE_MYSTERY',
      name: '🌒 Ngược sáng giấu diện mạo (Backlit Silhouette)',
      instruction:
        'Nhân vật bí ẩn đứng ngược nguồn sáng (ánh đèn hành lang, cửa sổ hoàng hôn), chỉ lộ đường nét bóng đổ và giọng nói trầm trước khi bước ra ánh sáng.'
    }
  });

  const BIOLOGICAL_CLOCK_LIGHTING_BANDS = Object.freeze([
    {
      keywords: ['00:', '01:', '02:', '03:', 'nửa đêm', 'rạng sáng', 'canh ba', 'giờ tý', 'giờ sửu'],
      bandName: 'Đêm sâu & Rạng sáng lạnh',
      lightingCue: 'Ánh sáng yếu ớt từ đèn đường vàng đục, màn hình điện thoại hắt sáng xanh, độ ẩm không khí cao.',
      voiceTone: 'Giọng nói hạ thấp tự nhiên, tiếng bước chân hoặc côn trùng đêm vang rõ bất thường.'
    },
    {
      keywords: ['05:', '06:', '07:', 'bình minh', 'sáng sớm', 'ban mai'],
      bandName: 'Bình minh khởi đầu',
      lightingCue: 'Tia nắng nhạt xuyên qua màn sương sớm, bụi mịn lơ lửng trong không khí mát lạnh.',
      voiceTone: 'Nhịp sinh hoạt bắt đầu chuyển động, mùi cà phê hoặc hơi đất ẩm sau đêm.'
    },
    {
      keywords: ['11:', '12:', '13:', 'giữa trưa', 'chính ngọ', 'nắng gắt'],
      bandName: 'Chính ngọ gay gắt',
      lightingCue: 'Nắng thẳng đứng đổ bóng gắt ngắn dưới chân, mặt đường bốc hơi nóng hừng hực.',
      voiceTone: 'Sự phơi bày trần trụi không còn góc tối ẩn náu.'
    },
    {
      keywords: ['16:', '17:', '18:', 'hoàng hôn', 'chiều muộn', 'xế tà', 'chạng vạng'],
      bandName: 'Hoàng hôn chuyển giao (Giờ Chạng Vạng)',
      lightingCue: 'Bầu trời nhuộm sắc cam thẫm và tím biếc, bóng người kéo dài lê thê trên nền gạch.',
      voiceTone: 'Gợi hoài niệm, chia ly hoặc ranh giới trước khi màn đêm buông xuống.'
    },
    {
      keywords: ['19:', '20:', '21:', '22:', '23:', 'buổi tối', 'tối muộn', 'đêm'],
      bandName: 'Màn đêm đô thị / Nội thất đèn vàng',
      lightingCue: 'Ánh đèn nội thất ấm hoặc biển hiệu neon phản chiếu trên mặt kính, tạo tương phản sáng-tối rõ rệt.',
      voiceTone: 'Không gian thu hẹp lại vào các phòng kín, quán rượu hoặc cuộc hẹn bí mật.'
    }
  ]);

  class SceneCameraAndLightingDirector {
    constructor(builderEngine) {
      this.engine = builderEngine;
    }

    getCameraShotGuide(shotId) {
      return CINEMATOGRAPHY_SHOT_FRAMING_GUIDE[shotId] || null;
    }

    getAllShotGuides() {
      return Object.values(CINEMATOGRAPHY_SHOT_FRAMING_GUIDE);
    }

    inferLightingBandFromTimeText(timeText) {
      const lower = String(timeText || '').toLowerCase();
      if (!lower) return null;
      for (let i = 0; i < BIOLOGICAL_CLOCK_LIGHTING_BANDS.length; i += 1) {
        const band = BIOLOGICAL_CLOCK_LIGHTING_BANDS[i];
        if (band.keywords.some((kw) => lower.includes(kw))) {
          return band;
        }
      }
      return null;
    }

    suggestShotFramingForMarker(marker) {
      const goal = String(marker?.goal || '').toLowerCase();
      if (/(?:chạy|rượt đuổi|đánh|né|chiến đấu|phá cửa)/i.test(goal)) {
        return CINEMATOGRAPHY_SHOT_FRAMING_GUIDE.TRACKING_ACTION;
      }
      if (/(?:đối chất|thẩm vấn|nói chuyện|tranh cãi|nhìn thẳng)/i.test(goal)) {
        return CINEMATOGRAPHY_SHOT_FRAMING_GUIDE.OTS_CONFRONTATION;
      }
      if (/(?:bí ẩn|giấu mặt|bóng đen|xuất hiện bất ngờ)/i.test(goal)) {
        return CINEMATOGRAPHY_SHOT_FRAMING_GUIDE.SILHOUETTE_MYSTERY;
      }
      if (/(?:sợ|nghi ngờ|hoang mang|dối trá|phát hiện)/i.test(goal)) {
        return CINEMATOGRAPHY_SHOT_FRAMING_GUIDE.ECU_PSYCHOLOGICAL;
      }
      if (/(?:cô đơn|sân thượng|bến cảng|một mình|chia tay)/i.test(goal)) {
        return CINEMATOGRAPHY_SHOT_FRAMING_GUIDE.WIDE_ISOLATION;
      }
      return CINEMATOGRAPHY_SHOT_FRAMING_GUIDE.DUTCH_TILT_UNEASE;
    }

    buildLightingAndCameraBrief(marker) {
      const shot = this.suggestShotFramingForMarker(marker);
      const band = this.inferLightingBandFromTimeText(marker?.time || '');
      const parts = [];
      if (shot) {
        parts.push(`📷 Góc máy gợi ý (${shot.name}): ${shot.instruction}`);
      }
      if (band) {
        parts.push(`☀️ Ánh sáng theo giờ (${band.bandName}): ${band.lightingCue} (${band.voiceTone})`);
      }
      return parts.join('\n');
    }

    /**
     * Đưa toàn bộ thống kê Phân cảnh của toàn bộ cuốn sách thành Báo cáo tổng quan nhanh
     */
    summarizeMarkersAcrossBook() {
      const map = this.engine.markersByChapter || {};
      const entries = Object.keys(map).filter((k) => Array.isArray(map[k]) && map[k].length > 0);
      let totalMarkers = 0;
      const povDistribution = {};

      entries.forEach((chapId) => {
        map[chapId].forEach((m) => {
          totalMarkers += 1;
          const p = String(m.pov || 'Khác').split('(')[0].trim();
          povDistribution[p] = (povDistribution[p] || 0) + 1;
        });
      });

      return {
        chaptersWithMarkersCount: entries.length,
        totalMarkers,
        povDistribution
      };
    }
  }

  // ==========================================================================
  // PHẦN 11: KHO CHẤT LIỆU NGŨ QUAN BẢN ĐỊA CHO TỪNG LOẠI KHÔNG GIAN TRUYỆN
  // ==========================================================================
  const VIETNAMESE_SETTING_TEXTURE_PACKS = Object.freeze([
    {
      id: 'CAFE_SIDEWALK',
      keywords: ['cà phê', 'quán nước', 'vỉa hè', 'trà đá', 'tiệm bánh'],
      settingTitle: 'Quán cà phê / Trà đá góc phố',
      visualProps: ['chiếc phin nhôm nhỏ giọt chậm', 'ghế nhựa thấp bạc màu', 'vệt nước đọng trên mặt bàn inox'],
      soundProps: ['tiếng muỗng khuấy đá lanh canh', 'tiếng xe máy rì rầm ngoài ngã tư', 'bản nhạc cũ phát nhỏ từ loa rè'],
      smellProps: ['mùi cà phê rang khét nhẹ hòa khói thuốc vương', 'hương hoa sữa hoặc mùi đất nóng sau nắng'],
      tactileProps: ['hơi lạnh toát ra từ thành ly đá làm ướt đầu ngón tay', 'cơn gió tạt ngang qua gáy']
    },
    {
      id: 'OLD_APARTMENT',
      keywords: ['chung cư', 'khu tập thể', 'cầu thang bộ', 'hành lang', 'phòng trọ'],
      settingTitle: 'Khu tập thể cũ / Chung cư lâu năm',
      visualProps: ['mảng tường vôi bong tróc lộ gạch đỏ', 'bóng đèn tuýp hành lang nhấp nháy xanh', 'dây phơi quần áo giăng ngang ban công'],
      soundProps: ['tiếng dép lê trên bậc thang xi măng vọng âm', 'tiếng cửa sắt kéo ken két', 'tiếng ti vi vọng qua bức vách mỏng'],
      smellProps: ['mùi ẩm mốc tường cũ trộn mùi xào nấu bữa chiều từ tầng dưới', 'mùi nước lau sàn chanh sả'],
      tactileProps: ['tay vịn cầu thang kim loại mát lạnh bám bụi', 'nền gạch bông trơn ẩm']
    },
    {
      id: 'SCHOOL_CORRIDOR',
      keywords: ['trường', 'lớp học', 'sân thượng trường', 'hành lang lớp', 'thư viện'],
      settingTitle: 'Học đường & Sân thượng giờ tan tầm',
      visualProps: ['bảng đen còn vương bụi phấn trắng', 'nắng chiều xiên qua dãy cửa sổ chớp', 'hàng ghế đá dưới tán phượng'],
      soundProps: ['tiếng trống trường rung dài', 'tiếng quạt trần quay cọt kẹt', 'tiếng bước chân vội vã cuối buổi học'],
      smellProps: ['mùi giấy vở mới và mực bút bi', 'mùi cỏ khô sân thể dục', 'hương gió mát trên lan can tầng thượng'],
      tactileProps: ['mặt bàn gỗ xước đầy vết khắc compa', 'nắng hắt ấm nóng lên vai áo đồng phục']
    },
    {
      id: 'HOSPITAL_NIGHT',
      keywords: ['bệnh viện', 'phòng cấp cứu', 'hành lang viện', 'y tế', 'phòng bệnh'],
      settingTitle: 'Bệnh viện về đêm',
      visualProps: ['ánh đèn trắng lạnh dọc hành lang vắng', 'màn hình nhịp tim chớp xanh đều đặn', 'rèm vải trắng ngăn giường bệnh'],
      soundProps: ['tiếng bíp điện tử ngắt quãng', 'tiếng bánh xe cáng lăn êm trên sàn nhựa', 'tiếng thì thầm nén nghẹn của người nhà'],
      smellProps: ['mùi cồn sát trùng nồng đặc trưng át hết mùi tự nhiên', 'hương khăn ướt lạnh'],
      tactileProps: ['ghế chờ inox lạnh buốt sống lưng', 'hơi điều hòa khô khốc khiến môi nứt nẻ']
    },
    {
      id: 'HARBOR_RIVER_WHARF',
      keywords: ['bến cảng', 'bến sông', 'cầu', 'boong tàu', 'sông nước', 'cảng biển'],
      settingTitle: 'Bến cảng / Bến sông lúc vãn khách',
      visualProps: ['ánh đèn pha tàu quét ngang mặt nước đen đặc', 'những thùng container xếp cao như vách núi', 'dây thừng bện to bằng cổ tay'],
      soundProps: ['tiếng sóng vỗ ì ạch vào mạn bê tông', 'tiếng còi tàu trầm đục vang xa', 'tiếng xích sắt va vào trụ neo'],
      smellProps: ['mùi bùn phù sa ngai ngái hay mùi muối biển mặn chát pha dầu máy diesel'],
      tactileProps: ['gió sông thổi rát mặt mang theo hơi nước lạnh', 'sàn gỗ cầu cảng rung nhẹ theo nhịp sóng']
    },
    {
      id: 'HIGHLAND_FOREST_MIST',
      keywords: ['rừng', 'núi', 'đèo', 'miếu', 'làng cổ', 'thị trấn sương mù'],
      settingTitle: 'Thị trấn sương mù / Rừng núi cao nguyên',
      visualProps: ['làn sương trắng đục nuốt chửng rặng thông sau năm mét', 'con đường đất đỏ uốn lượn', 'ánh lửa bếp củi lập lòe sau vách gỗ'],
      soundProps: ['tiếng lá thông reo vi vút như sóng biển', 'tiếng củi khô nổ lách tách', 'tiếng côn trùng rừng rả rích'],
      smellProps: ['mùi nhựa thông thơm hăng', 'mùi đất ẩm sau mưa và khói bếp thơm nồng'],
      tactileProps: ['cái lạnh thấm dần qua gấu tay áo', 'giọt sương đọng lạnh buốt trên tóc']
    },
    {
      id: 'LUXURY_OFFICE_PENTHOUSE',
      keywords: ['văn phòng', 'tập đoàn', 'phòng chủ tịch', 'khách sạn', 'penthouse', 'phòng họp'],
      settingTitle: 'Tòa nhà cao tầng / Phòng làm việc thượng lưu',
      visualProps: ['bức tường kính toàn cảnh nhìn xuống thành phố rực đèn', 'mặt bàn đá cẩm thạch phản chiếu ánh đèn vàng', 'cặp tài liệu da đen'],
      soundProps: ['tiếng giày da nện khẽ trên thảm dày triệt âm', 'tiếng gõ bàn phím cơ dứt khoát', 'tiếng băng tan trong ly thủy tinh'],
      smellProps: ['hương gỗ đàn hương thoang thoảng từ máy khuếch tán', 'mùi nước hoa trầm ấm sang trọng'],
      tactileProps: ['tay nắm cửa đồng thau nặng chịch mát tay', 'nệm ghế da êm lún tạo cảm giác quyền lực']
    },
    {
      id: 'NIGHT_MARKET_ALLEY',
      keywords: ['chợ đêm', 'hẻm nhỏ', 'phố cổ', 'quán ăn khuya', 'khu ổ chuột'],
      settingTitle: 'Hẻm ẩm thực & Chợ đêm náo nhiệt',
      visualProps: ['biển hiệu neon đỏ xanh chập chờn phản chiếu trên vũng nước', 'làn khói bếp than bay cuồn cuộn', 'những mái bạt xanh đỏ chăng sát nhau'],
      soundProps: ['tiếng chảo gang xào lửa lớn xèo xèo', 'tiếng rao hàng hòa tiếng còi xe', 'tiếng ly chạm bàn cạch cạch'],
      smellProps: ['mùi nước dùng ninh xương, hành phi thơm nức trộn lẫn khói than tổ ong'],
      tactileProps: ['hơi nóng phả ra từ sạp bếp khiến không khí đặc quánh giữa đêm mưa']
    }
  ]);

  class VietnameseSettingTextureAdvisor {
    findMatchingPack(locationText) {
      const lower = String(locationText || '').toLowerCase();
      if (!lower) return null;
      for (let i = 0; i < VIETNAMESE_SETTING_TEXTURE_PACKS.length; i += 1) {
        const pack = VIETNAMESE_SETTING_TEXTURE_PACKS[i];
        if (pack.keywords.some((kw) => lower.includes(kw))) {
          return pack;
        }
      }
      return null;
    }

    formatSensoryChecklistForPrompt(locationText) {
      const pack = this.findMatchingPack(locationText);
      if (!pack) return '';
      return [
        `🏺 Chất liệu bối cảnh "${pack.settingTitle}" gợi ý cho AI:`,
        `   - Thị giác: ${pack.visualProps.join('; ')}.`,
        `   - Âm thanh: ${pack.soundProps.join('; ')}.`,
        `   - Khứu giác / Xúc giác: ${pack.smellProps[0]} | ${pack.tactileProps[0]}.`
      ].join('\n');
    }

    getAllPackSummaries() {
      return VIETNAMESE_SETTING_TEXTURE_PACKS.map((p) => ({
        id: p.id,
        title: p.settingTitle,
        keywords: p.keywords.slice(0, 4)
      }));
    }
  }

  // ==========================================================================
  // PHẦN 12: BỘ DỰ TOÁN ĐỘ DÀI CHỮ THEO TỪNG PHÂN CẢNH & XUẤT DÀN Ý CẢNH
  // ==========================================================================
  class SceneLengthBudgetEstimator {
    constructor(builderEngine) {
      this.engine = builderEngine;
    }

    /**
     * Phân bổ ngân sách số từ mục tiêu cho từng Mốc phân cảnh trong chương
     * dựa trên độ phức tạp của Mục tiêu & Yếu tố xung đột.
     */
    estimateWordBudgetAllocation(totalChapterTargetWords = 3500) {
      const markers = this.engine.getMarkersForActiveChapter();
      if (!markers.length) {
        return {
          totalTarget: totalChapterTargetWords,
          scenes: [],
          advice: 'Chưa chia mốc phân cảnh — toàn bộ chương tính là 1 luồng cảnh liền mạch.'
        };
      }

      const weights = markers.map((m) => {
        const goal = String(m.goal || '');
        let w = 1.0;
        if (goal.length > 120) w += 0.35;
        if (/(?:cao trào|đối chất|trận chiến|bước ngoặt|phá án|thú nhận)/i.test(goal)) {
          w += 0.45;
        }
        if (/(?:ngắn gọn|lướt qua|chuyển tiếp|mở đầu ngắn)/i.test(goal)) {
          w -= 0.25;
        }
        return Math.max(0.5, w);
      });

      const sumWeight = weights.reduce((a, b) => a + b, 0) || 1;
      const scenes = markers.map((m, idx) => {
        const allocated = Math.round((weights[idx] / sumWeight) * totalChapterTargetWords);
        const pct = Math.round((weights[idx] / sumWeight) * 100);
        return {
          sceneIndex: idx + 1,
          markerId: m.id,
          pov: m.pov,
          location: m.location || 'Không gian tự do',
          estimatedWords: allocated,
          sharePercent: pct,
          estimatedParagraphs: Math.max(4, Math.round(allocated / 75))
        };
      });

      return {
        totalTarget: totalChapterTargetWords,
        scenes,
        advice: `Đã chia ${totalChapterTargetWords.toLocaleString('vi-VN')} từ thành ${scenes.length} phân cảnh có tỷ trọng kịch tính rõ ràng.`
      };
    }

    /**
     * Sinh bảng phân tích chi tiết thời lượng đọc từng cảnh để chèn cuối Modal
     */
    buildReadableBudgetReportVN(totalChapterTargetWords = 3500) {
      const plan = this.estimateWordBudgetAllocation(totalChapterTargetWords);
      if (!plan.scenes.length) return plan.advice;
      const lines = plan.scenes.map(
        (s) =>
          `• Cảnh ${s.sceneIndex} (${s.location}): ~${s.estimatedWords.toLocaleString('vi-VN')} từ (${s.sharePercent}%, khoảng ${s.estimatedParagraphs} đoạn văn)`
      );
      return [plan.advice, ...lines].join('\n');
    }

    /**
     * Gợi ý các từ khóa chuyển tiếp không gian/thời gian mượt mà tiếng Việt
     */
    getNaturalTransitionPhrasesVN() {
      return [
        'Khi bóng chiều vừa buông xuống mái ngói…',
        'Nửa giờ đồng hồ sau đó, ở bên kia con phố…',
        'Chưa kịp để dư âm câu nói lắng xuống…',
        'Trái ngược với vẻ tĩnh mịch nơi phòng đọc sách…',
        'Đúng khoảnh khắc chiếc đồng hồ quả lắc điểm nửa đêm…',
        'Cùng lúc ấy, tại một góc khuất không ai ngờ tới…',
        'Sáng hôm sau, khi sương còn chưa tan trên mặt hồ…',
        'Một tiếng gõ cửa gấp gáp đã cắt đứt dòng hồi tưởng.'
      ];
    }

    /**
     * Chèn nhanh một cụm từ chuyển cảnh tự nhiên ngay tại con trỏ Bàn viết Tab 1
     */
    insertRandomNaturalTransitionPhraseIntoTab1() {
      const phrases = this.getNaturalTransitionPhrasesVN();
      const pick = phrases[Math.floor(Math.random() * phrases.length)];
      const ta = typeof document !== 'undefined' ? document.getElementById('textarea-chapter-content') : null;
      if (!ta) return false;
      const snippet = `\n\n* * *\n\n${pick} `;
      if (this.engine.NS?.utils?.cursorToolkit?.insertTextAtCursor) {
        this.engine.NS.utils.cursorToolkit.insertTextAtCursor(ta, snippet);
      } else {
        ta.value = `${ta.value.trimEnd()}${snippet}`;
        ta.dispatchEvent(new Event('input', { bubbles: true }));
      }
      this.engine.utils.showToast('✨ Đã chèn cụm chuyển cảnh điện ảnh vào Tab 1!', 'success', 2400);
      return true;
    }

    /**
     * Tạo danh sách các phân cảnh nhanh theo cấu trúc 3 Hồi Kinh Điển (Setup - Confrontation - Climax)
     */
    seedClassicThreeSceneBlueprintForActiveChapter() {
      const chapId = this.engine.getActiveChapterId();
      const current = this.engine.getMarkersForActiveChapter();
      if (current.length >= 3) {
        this.engine.utils.showToast(
          'ℹ️ Chương này đã có từ 3 phân cảnh trở lên rồi.',
          'info'
        );
        return current;
      }

      const templates = [
        {
          id: `scn_${Date.now()}_a1`,
          pov: 'Ngôi thứ 3 giới hạn (Theo sát nhân vật chính)',
          time: 'Mở màn chương',
          location: 'Bối cảnh khởi phát yên ả hoặc ẩn chứa manh mối',
          goal: 'Thiết lập không khí, mục tiêu tức thời của nhân vật và gieo 1 tín hiệu bất thường đầu tiên.',
          transitionId: 'TIME_LAPSE_ANCHOR',
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        {
          id: `scn_${Date.now()}_a2`,
          pov: 'Ngôi thứ 3 giới hạn (Theo sát nhân vật chính)',
          time: 'Giữa chương — Cao trào leo thang',
          location: 'Không gian đối đầu hoặc nơi tìm kiếm chứng cứ',
          goal: 'Xảy ra va chạm lợi ích hoặc đấu trí trực diện; nhân vật gặp trở ngại ngoài dự tính.',
          transitionId: 'CONTRAST_CUT',
          createdAt: Date.now() + 1,
          updatedAt: Date.now() + 1
        },
        {
          id: `scn_${Date.now()}_a3`,
          pov: 'Ngôi thứ 3 giới hạn (Theo sát nhân vật chính)',
          time: 'Khoảnh khắc khép chương',
          location: 'Điểm chốt biến cố cuối chương',
          goal: 'Cú lật tình huống hoặc câu nói bỏ lửng gây tò mò mạnh buộc độc giả đọc tiếp chương sau (Cliffhanger).',
          transitionId: 'SMASH_CUT_SHOCK',
          createdAt: Date.now() + 2,
          updatedAt: Date.now() + 2
        }
      ];

      this.engine.markersByChapter[chapId] = [...current, ...templates];
      this.engine.persist();
      this.engine.renderMarkersListUI();
      this.engine.utils.showToast('🎬 Đã khởi tạo khung 3 phân cảnh chuẩn Light Novel!', 'success');
      return this.engine.markersByChapter[chapId];
    }
  }

  const sceneBuilder = new SceneTransitionAndPOVBuilderEngine();
  sceneBuilder.dramaticTurnAdvisor = new SceneDramaticTurnAdvisor(sceneBuilder);
  sceneBuilder.cmdBridge = new SceneCommandModalLiveBadgeBridge(sceneBuilder);
  sceneBuilder.cameraDirector = new SceneCameraAndLightingDirector(sceneBuilder);
  sceneBuilder.textureAdvisor = new VietnameseSettingTextureAdvisor();
  sceneBuilder.lengthEstimator = new SceneLengthBudgetEstimator(sceneBuilder);
  window.NoirStudio.SceneLengthBudgetEstimator = SceneLengthBudgetEstimator;
  window.NoirStudio.VIETNAMESE_SETTING_TEXTURE_PACKS = VIETNAMESE_SETTING_TEXTURE_PACKS;
  window.NoirStudio.VietnameseSettingTextureAdvisor = VietnameseSettingTextureAdvisor;
  window.NoirStudio.CINEMATOGRAPHY_SHOT_FRAMING_GUIDE = CINEMATOGRAPHY_SHOT_FRAMING_GUIDE;
  window.NoirStudio.SceneCameraAndLightingDirector = SceneCameraAndLightingDirector;
  sceneBuilder.dramaticTurnAdvisor = new SceneDramaticTurnAdvisor(sceneBuilder);
  sceneBuilder.cmdBridge = new SceneCommandModalLiveBadgeBridge(sceneBuilder);

  const origInitMod13 = sceneBuilder.init.bind(sceneBuilder);
  sceneBuilder.init = function initModule13Enhanced() {
    origInitMod13();
    sceneBuilder.cmdBridge.bindLiveModalObserver();
    sceneBuilder.cmdBridge.refreshAllCommandBadges();
    return sceneBuilder;
  };

  window.NoirStudio.SCENE_EMOTIONAL_POLARITY_ARCS = SCENE_EMOTIONAL_POLARITY_ARCS;
  window.NoirStudio.SceneDramaticTurnAdvisor = SceneDramaticTurnAdvisor;
  window.NoirStudio.SceneCommandModalLiveBadgeBridge = SceneCommandModalLiveBadgeBridge;
  window.NoirStudio.POV_PERSPECTIVE_RULES_CATALOG = POV_PERSPECTIVE_RULES_CATALOG;
  window.NoirStudio.SCENE_PACING_AND_DRAMATIC_ARC_TEMPLATES = SCENE_PACING_AND_DRAMATIC_ARC_TEMPLATES;
  window.NoirStudio.CINEMATIC_TRANSITION_TECHNIQUES = CINEMATIC_TRANSITION_TECHNIQUES;
  window.NoirStudio.POVHeadHoppingAuditorAndValidator = POVHeadHoppingAuditorAndValidator;
  window.NoirStudio.SceneTransitionAndPOVBuilderEngine = SceneTransitionAndPOVBuilderEngine;
  window.NoirStudio.sceneBuilder = sceneBuilder;

  if (typeof window.NoirStudio.registerModule === 'function') {
    window.NoirStudio.registerModule('mod13', sceneBuilder);
  }
})();
