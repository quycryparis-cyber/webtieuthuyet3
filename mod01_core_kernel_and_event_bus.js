/**
 * ============================================================================
 * MODULE 01: CORE KERNEL, CONSTANTS, REACTIVE STATE, EVENT BUS & MUTEX ENGINE
 * ============================================================================
 * Phiên bản: v38.0.0-SUPREME-MODULAR (2026)
 * Nhiệm vụ:
 *   1. Khởi tạo không gian tên toàn cục duy nhất `window.NoirStudio` (Zero-Conflict).
 *   2. Định nghĩa bảng hằng số `STUDIO_CONSTANTS`, cấu hình IndexedDB, LocalStorage,
 *      6 thư mục ổ cứng cục bộ, từ điển hơn 120 cụm từ sáo rỗng AI tiếng Việt,
 *      và danh mục phím tắt / sự kiện chuẩn hóa toàn hệ thống.
 *   3. Quản lý kho trạng thái trung tâm `window.NoirStudio.state` kèm bộ kiểm tra
 *      toàn vẹn dữ liệu, chụp ảnh trạng thái (State Snapshot) và theo dõi thay đổi.
 *   4. Hệ thống Pub/Sub EventBus đa luồng (`window.NoirStudio.bus`) hỗ trợ Wildcard,
 *      độ ưu tiên (Priority), lịch sử sự kiện, phát lại (Replay), bất đồng bộ (`emitAsync`)
 *      và Middleware chặn lọc lỗi.
 *   5. Hàng đợi khóa bất đồng bộ (`window.NoirStudio.mutex`) hỗ trợ khóa theo tên tài nguyên,
 *      chống xung đột khi vừa lưu tự động 2s vừa đồng bộ ổ cứng hoặc cập nhật Story Bible.
 *   6. Bộ gắn sự kiện DOM chống nhân đôi (`window.NoirStudio.bindOnce`), quản lý phím tắt
 *      (`window.NoirStudio.shortcuts`), bộ đo hiệu năng (`window.NoirStudio.profiler`)
 *      và nhật ký chẩn đoán (`window.NoirStudio.logger`).
 * ============================================================================
 */

(function initNoirStudioCoreKernelModule(globalScope) {
  'use strict';

  const root = globalScope || (typeof window !== 'undefined' ? window : globalThis);
  root.NoirStudio = root.NoirStudio || {};
  const NS = root.NoirStudio;

  // ==========================================================================
  // PHẦN 1: BẢNG HẰNG SỐ TRUNG TÂM & DANH MỤC TỪ SÁO RỖNG TIẾNG VIỆT
  // ==========================================================================

  /**
   * Danh sách hơn 120 cụm từ sáo rỗng (AI Clichés) thường gặp khi các mô hình
   * ngôn ngữ viết tiểu thuyết tiếng Việt. Được phân loại chi tiết và tổng hợp
   * thành chuỗi mặc định cho Story Bible (Tab 4) và Máy quét nhịp văn (Module 24).
   */
  const VIETNAMESE_AI_CLICHE_TAXONOMY = {
    PHYSICAL_REACTIONS: [
      'một luồng điện chạy dọc sống lưng',
      'sống lưng lạnh toát',
      'lạnh sống lưng',
      'hít một hơi khí lạnh',
      'hít vào một ngụm khí lạnh',
      'đồng tử co rút',
      'đồng tử co rút mạnh',
      'đồng tử giãn lớn',
      'nắm chặt hai bàn tay đến trắng bệch',
      'móng tay bấm sâu vào lòng bàn tay',
      'trái tim đập loạn nhịp',
      'tim đập thình thịch như muốn nhảy ra khỏi lồng ngực',
      'cổ họng khô khốc',
      'nuốt nước bọt một cách khó khăn',
      'mồ hôi lạnh chảy ròng ròng',
      'mồ hôi lạnh thấm đẫm lưng áo',
      'toàn thân cứng đờ như tượng đá',
      'chân như chôn chặt xuống đất',
      'hơi thở trở nên gấp gáp',
      'máu trong người như đông cứng lại',
      'cảm giác ớn lạnh chạy dọc cột sống',
      'bàn tay vô thức siết chặt'
    ],
    FACIAL_AND_GAZE_CLICHES: [
      'ánh mắt phức tạp',
      'trong mắt hiện lên tia phức tạp',
      'khẽ nhếch môi',
      'nhếch mép tạo thành một đường cong hoàn hảo',
      'nở một nụ cười nửa miệng',
      'nụ cười đầy ẩn ý',
      'nụ cười khổ sở',
      'nụ cười tự giễu',
      'ánh mắt sắc như dao cạo',
      'ánh mắt lạnh như băng ngàn năm',
      'ánh mắt sâu thẳm như vực không đáy',
      'ánh mắt sâu như biển cả',
      'trong mắt lóe lên một tia sáng lạnh lẽo',
      'trong mắt lóe lên tia kiên định',
      'hàng lông mày nhíu chặt',
      'chau mày thành hình chữ Xuyên',
      'khóe môi giật giật',
      'gương mặt không chút gợn sóng',
      'vẻ mặt bình tĩnh đến đáng sợ',
      'ánh mắt lộ rõ vẻ không thể tin nổi'
    ],
    VOICE_AND_SIGH_CLICHES: [
      'thở dài một tiếng',
      'khẽ thở dài trong lòng',
      'buông một tiếng thở dài nặng nề',
      'giọng nói trầm thấp vang lên',
      'giọng nói lạnh lẽo như từ địa ngục vọng về',
      'giọng nói bình thản như không',
      'giọng nói mang theo vài phần bất đắc dĩ',
      'giọng nói khàn đặc',
      'cất giọng đều đều không chút cảm xúc',
      'từng chữ từng chữ rơi xuống nặng như ngàn cân',
      'lời nói như búa tạ giáng xuống',
      'im lặng một hồi lâu mới lên tiếng'
    ],
    ATMOSPHERE_AND_ENVIRONMENT_CLICHES: [
      'không khí như đặc quánh lại',
      'không khí rơi vào trầm mặc',
      'bầu không khí trở nên ngột ngạt đến cực điểm',
      'sự im lặng đáng sợ bao trùm',
      'im lặng đến mức nghe thấy tiếng kim rơi',
      'thời gian như ngừng trôi',
      'không gian như đóng băng',
      'màn đêm buông xuống nuốt chửng vạn vật',
      'ánh đèn vàng vọt hắt bóng dài cô độc',
      'cơn gió lạnh lẽo thổi qua mang theo mùi máu tanh',
      'bóng tối như con quái vật khổng lồ',
      'bầu trời âm u như báo hiệu cơn bão lớn sắp tới'
    ],
    ABSTRACT_SUMMARY_AND_TELLING_CLICHES: [
      'không khỏi cảm thán',
      'trong lòng dâng lên một cảm giác khó tả',
      'một cảm xúc hỗn độn trào dâng',
      'tâm trạng rối như tơ vò',
      'ngổn ngang trăm mối tơ vò',
      'như có tảng đá lớn đè nặng trong ngực',
      'cảm thấy một sự bất an mơ hồ',
      'linh cảm chẳng lành',
      'số phận trêu ngươi',
      'bánh xe vận mệnh bắt đầu quay',
      'một chương mới của cuộc đời chính thức mở ra',
      'nhưng đó là chuyện của sau này',
      'không ai biết rằng quyết định này sẽ thay đổi tất cả',
      'chính thức bắt đầu cuộc hành trình đầy sóng gió',
      'tất cả chỉ mới là sự khởi đầu',
      'bão táp thực sự vẫn còn ở phía trước'
    ],
    TRANSLATION_ESE_AND_AWKWARD_PHRASING: [
      'hổ躯 chấn động',
      'thân thể chấn động mạnh',
      'trong lòng lộp bộp một tiếng',
      'khóe miệng co giật kịch liệt',
      'đầy mặt hắc tuyến',
      'trên trán hiện lên ba vạch đen',
      'toàn trường chết lặng',
      'hít sâu một hơi áp chế lửa giận',
      'con ngươi猛 nhiên co rụt lại',
      'khí thế bùng nổ dữ dội',
      'áp lực vô hình bao phủ khắp căn phòng',
      'không nói hai lời liền lao tới',
      'ánh mắt như muốn ăn tươi nuốt sống',
      'nụ cười làm khuynh đảo chúng sinh'
    ]
  };

  /**
   * Trải phẳng toàn bộ từ điển từ sáo rỗng thành mảng duy nhất không trùng lặp.
   */
  const DEFAULT_ANTI_CLICHE_ARRAY = (function buildDefaultAntiClicheList() {
    const seen = new Set();
    const list = [];
    const groups = Object.keys(VIETNAMESE_AI_CLICHE_TAXONOMY);
    for (let i = 0; i < groups.length; i++) {
      const items = VIETNAMESE_AI_CLICHE_TAXONOMY[groups[i]] || [];
      for (let j = 0; j < items.length; j++) {
        const normalized = String(items[j] || '').trim().toLowerCase();
        if (normalized && !seen.has(normalized)) {
          seen.add(normalized);
          list.push(items[j].trim());
        }
      }
    }
    return list;
  })();

  /**
   * Danh mục các sự kiện chuẩn hóa trên toàn bộ 30 Module của Studio.
   */
  const STUDIO_EVENTS = Object.freeze({
    // Sự kiện vòng đời hệ thống
    KERNEL_READY: 'kernel:ready',
    MODULE_REGISTERED: 'kernel:module_registered',
    BOOT_STARTED: 'boot:started',
    BOOT_PROGRESS: 'boot:progress',
    BOOT_COMPLETED: 'boot:completed',
    BOOT_ERROR: 'boot:error',

    // Sự kiện điều hướng 6 màn hình
    SCREEN_CHANGED: 'nav:screen_changed',
    MODAL_OPENED: 'ui:modal_opened',
    MODAL_CLOSED: 'ui:modal_closed',
    THEME_CHANGED: 'ui:theme_changed',
    ZEN_MODE_TOGGLED: 'ui:zen_mode_toggled',
    TYPEWRITER_TOGGLED: 'ui:typewriter_toggled',

    // Sự kiện bản thảo & cây chương
    CHAPTER_CREATED: 'chapter:created',
    CHAPTER_SELECTED: 'chapter:selected',
    CHAPTER_UPDATED: 'chapter:updated',
    CHAPTER_TITLE_CHANGED: 'chapter:title_changed',
    CHAPTER_STATUS_CHANGED: 'chapter:status_changed',
    CHAPTER_DELETED: 'chapter:deleted',
    CHAPTER_REORDERED: 'chapter:reordered',
    CHAPTER_FILTER_CHANGED: 'chapter:filter_changed',
    CHAPTER_APPROVED: 'chapter:approved',
    MANUSCRIPT_INPUT: 'manuscript:input',
    MANUSCRIPT_STATS_UPDATED: 'manuscript:stats_updated',

    // Sự kiện lưu tự động 3 lớp & phiên bản
    AUTOSAVE_TRIGGERED: 'autosave:triggered',
    AUTOSAVE_COMPLETED: 'autosave:completed',
    AUTOSAVE_FAILED: 'autosave:failed',
    VERSION_SNAPSHOT_CREATED: 'version:snapshot_created',
    VERSION_RESTORED: 'version:restored',
    VERSION_DELETED: 'version:deleted',
    UNDO_PERFORMED: 'history:undo',
    REDO_PERFORMED: 'history:redo',

    // Sự kiện kiểm duyệt AI Diff kiểu Google Docs
    AI_DIFF_ACTIVATED: 'aidiff:activated',
    AI_DIFF_SEGMENT_ACCEPTED: 'aidiff:segment_accepted',
    AI_DIFF_SEGMENT_REJECTED: 'aidiff:segment_rejected',
    AI_DIFF_ALL_ACCEPTED: 'aidiff:all_accepted',
    AI_DIFF_ALL_REJECTED: 'aidiff:all_rejected',

    // Sự kiện Story Bible & BM25 RAG
    BIBLE_UPDATED: 'bible:updated',
    BIBLE_LOCK_TOGGLED: 'bible:lock_toggled',
    CHARACTER_ADDED: 'bible:character_added',
    CHARACTER_UPDATED: 'bible:character_updated',
    CHARACTER_REMOVED: 'bible:character_removed',
    KNOWLEDGE_UPDATED: 'bible:knowledge_updated',
    CLUES_UPDATED: 'bible:clues_updated',
    ANTI_CLICHE_UPDATED: 'bible:anti_cliche_updated',
    SCENE_MARKER_ADDED: 'scene:marker_added',
    SCENE_MARKER_REMOVED: 'scene:marker_removed',
    RAG_INDEX_REBUILT: 'rag:index_rebuilt',
    RAG_SEARCH_COMPLETED: 'rag:search_completed',

    // Sự kiện AI & 5 Chế độ
    API_KEY_UPDATED: 'ai:api_key_updated',
    API_KEY_VERIFIED: 'ai:api_key_verified',
    MODEL_SELECTED: 'ai:model_selected',
    MODE_SELECTED: 'ai:mode_selected',
    SYSPROMPT_UPDATED: 'ai:sysprompt_updated',
    MASTER_PROMPT_SYNTHESIZED: 'ai:master_prompt_synthesized',
    AI_EXECUTION_STARTED: 'ai:execution_started',
    AI_EXECUTION_COMPLETED: 'ai:execution_completed',
    AI_EXECUTION_FAILED: 'ai:execution_failed',
    MODE5_DIAGRAM_RENDERED: 'ai:mode5_diagram_rendered',

    // Sự kiện Đồng hồ Pomodoro, Âm thanh & Giao diện chữ
    POMODORO_TICK: 'pomodoro:tick',
    POMODORO_STARTED: 'pomodoro:started',
    POMODORO_PAUSED: 'pomodoro:paused',
    POMODORO_RESET: 'pomodoro:reset',
    POMODORO_PHASE_CHANGED: 'pomodoro:phase_changed',
    AUDIO_PRESET_CHANGED: 'audio:preset_changed',
    TYPOGRAPHY_UPDATED: 'typography:updated',
    BG_EFFECT_CHANGED: 'ambience:bg_effect_changed',

    // Sự kiện Ổ cứng cục bộ (File System Access API)
    FS_CONNECTED: 'fs:connected',
    FS_DISCONNECTED: 'fs:disconnected',
    FS_FILE_WRITTEN: 'fs:file_written',
    FS_SYNC_COMPLETED: 'fs:sync_completed',
    FS_ERROR: 'fs:error'
  });

  /**
   * Cấu hình khung mẫu Story Bible mặc định (Khi người dùng mở lần đầu).
   */
  const DEFAULT_STORY_BIBLE_TEMPLATE_FRAME = [
    '# 🏛️ KHUNG CẤU TRÚC STORY BIBLE CHUẨN (BẢN KHUÔN MẪU)',
    '',
    '## 1. THẾ GIỚI QUAN & BỐI CẢNH CỐT LÕI',
    '- Thời đại / Không gian chính:',
    '- Bầu không khí chủ đạo (Tone & Mood):',
    '- Các thế lực / Tổ chức ngầm đang chi phối:',
    '',
    '## 2. QUY TẮC BẤT KHẢ XÂM PHẠM (HARD RULES)',
    '- Giới hạn sức mạnh / Công nghệ / Tâm lý:',
    '- Những điều tuyệt đối không thể xảy ra trong thế giới này:',
    '- Quy ước hội thoại bắt buộc: - Câu thoại (Tên nhân vật)',
    '',
    '## 3. TÓM TẮT DÒNG THỜI GIAN & CÁC CHƯƠNG ĐÃ DUYỆT',
    '- Khởi đầu:',
    '- Các bước ngoặt lớn đã xảy ra:',
    '- Tình trạng hiện tại của nhân vật chính:',
    '',
    '## 4. GHI CHÚ TRỌNG TÂM CHO CHƯƠNG TIẾP THEO',
    '- Mục tiêu cốt truyện cần đẩy tới:',
    '- Bí mật chưa được phép tiết lộ:'
  ].join('\n');

  /**
   * Bảng hằng số trung tâm của Studio (`window.NoirStudio.constants`).
   */
  const STUDIO_CONSTANTS = Object.freeze({
    VERSION: '38.0.0-SUPREME-MODULAR',
    RELEASE_DATE: '2026',
    STUDIO_TITLE: 'Web Viết Tiểu Thuyết Của Bi — Studio Sáng Tác Đa Nền Tảng',
    DB_NAME: 'NoirPsychStudio_LocalDB_v1',
    DB_VERSION: 3,

    STORES: Object.freeze({
      WORKSPACE_HANDLES: 'workspace_handles',
      CHAPTERS: 'chapters',
      STORY_BIBLE: 'story_bible',
      RAG_CHUNKS: 'rag_chunks',
      STATE_CACHE: 'state_cache'
    }),

    STORAGE_KEYS: Object.freeze({
      API_KEY: 'noir_gemini_api_key',
      SELECTED_MODEL: 'noir_selected_gemini_model',
      EXECUTION_MODE: 'noir_selected_ai_mode',
      TARGET_WORDS: 'noir_target_word_count',
      TEMPERATURE: 'noir_ai_temperature',
      THEME: 'noir_studio_theme_mode',
      FONT_FAMILY: 'noir_editor_font_family',
      FONT_SIZE: 'noir_editor_font_size',
      LINE_HEIGHT: 'noir_editor_line_height',
      PAGE_WIDTH: 'noir_editor_page_width',
      BG_EFFECT: 'noir_ambient_bg_effect',
      BIBLE_TEMPLATE: 'noir_s10_bible_template_frame',
      BIBLE_RENDERED: 'noir_s10_rendered_bible_content',
      BIBLE_LOCKED: 'noir_s10_bible_template_locked',
      CHARACTERS: 'noir_s10_character_profiles_v1',
      KNOWLEDGE_MATRIX: 'noir_s10_knowledge_matrix_v1',
      CLUES_LEDGER: 'noir_s10_clues_ledger_v1',
      ANTI_CLICHE: 'noir_s10_anti_cliche_blacklist_v1',
      SCENE_MARKERS: 'noir_s18_scene_pov_markers_v1',
      MODE_OUTPUTS: 'noir_s20_quad_mode_outputs_v1',
      MODE_PROMPTS: 'noir_s20_custom_mode_sysprompts_v1',
      VERSION_VAULT: 'noir_v36_version_history_vault',
      AI_DIFF_STATE: 'noir_v36_active_ai_diff_state',
      SCRATCHPAD: 'noir_quick_scratchpad_notes',
      POMODORO_STATE: 'noir_unified_pomodoro_state_v36',
      DAILY_GOAL: 'noir_v38_daily_word_goal_state'
    }),

    LOCAL_FOLDERS: Object.freeze([
      '01_Chuong_Goc_Chua_Duyet',
      '02_Chuong_Da_Duyet',
      '03_Story_Bible_Local',
      '04_Chi_Muc_Chong_Quen',
      '05_Bang_Trang_Y_Tuong',
      '06_Sao_Luu_Code_Va_Ban_Thao'
    ]),

    LOCAL_FOLDER_DESCRIPTIONS: Object.freeze({
      '01_Chuong_Goc_Chua_Duyet': 'Chứa các chương đang ở trạng thái Bản Nháp (DRAFT) tự động lưu trực tiếp ra file .txt/.md.',
      '02_Chuong_Da_Duyet': 'Chứa các chương đã được tác giả bấm Duyệt & Chốt Bản Thảo (APPROVED) chính thức.',
      '03_Story_Bible_Local': 'Chứa hồ sơ Story Bible, Hồ sơ nhân vật, Ma trận Ai Biết Gì, Sổ cái Phục bút và Danh sách từ cấm.',
      '04_Chi_Muc_Chong_Quen': 'Chứa chỉ mục tìm kiếm chống quên BM25 (RAG Chunks) để tra cứu tình tiết cũ 0 Token.',
      '05_Bang_Trang_Y_Tuong': 'Chứa nội dung Bảng trắng nháp nhanh ý tưởng, mốc chuyển cảnh và ghi chú chợt lóe.',
      '06_Sao_Luu_Code_Va_Ban_Thao': 'Chứa các bản sao lưu toàn diện dự án (.json) và kho lịch sử phiên bản Time-Machine.'
    }),

    SCREENS: Object.freeze({
      SCREEN_1_WRITE: 'SCREEN_1_WRITE',
      SCREEN_2_FILES: 'SCREEN_2_FILES',
      SCREEN_3_AI: 'SCREEN_3_AI',
      SCREEN_4_BIBLE: 'SCREEN_4_BIBLE',
      SCREEN_5_AMBIENCE: 'SCREEN_5_AMBIENCE',
      SCREEN_6_SYSTEM: 'SCREEN_6_SYSTEM'
    }),

    EXECUTION_MODES: Object.freeze({
      MODE_1_DRAFT: 'MODE_1_DRAFT',
      MODE_2_BRAINSTORM: 'MODE_2_BRAINSTORM',
      MODE_3_AUDIT: 'MODE_3_AUDIT',
      MODE_4_REVIEW: 'MODE_4_REVIEW',
      MODE_5_DIAGRAM: 'MODE_5_DIAGRAM'
    }),

    DEFAULT_ANTI_CLICHE: DEFAULT_ANTI_CLICHE_ARRAY,
    ANTI_CLICHE_TAXONOMY: VIETNAMESE_AI_CLICHE_TAXONOMY,
    DEFAULT_BIBLE_TEMPLATE_FRAME: DEFAULT_STORY_BIBLE_TEMPLATE_FRAME,
    EVENTS: STUDIO_EVENTS,

    LIMITS: Object.freeze({
      AUTOSAVE_DEBOUNCE_MS: 2000,
      UNDO_STACK_MAX_DEPTH: 120,
      VERSION_VAULT_MAX_SNAPSHOTS: 60,
      EMERGENCY_VAULT_RING_SIZE: 15,
      EVENT_HISTORY_MAX_ITEMS: 400,
      LOGGER_MAX_ENTRIES: 600,
      MIN_TARGET_WORDS: 300,
      MAX_TARGET_WORDS: 15000,
      DEFAULT_TARGET_WORDS: 3500
    })
  });

  NS.constants = STUDIO_CONSTANTS;

  // ==========================================================================
  // PHẦN 2: KHO TRẠNG THÁI TRUNG TÂM (CENTRAL REACTIVE STATE) & BỘ TỰ PHỤC HỒI
  // ==========================================================================

  /**
   * Tạo cấu trúc trạng thái mặc định chuẩn cho toàn bộ ứng dụng.
   * Mọi khóa trong `NS.state` đều được giữ nguyên tên để tương thích 100%
   * với tất cả 30 Module trong hệ thống.
   */
  function createDefaultStudioState() {
    const todayKey = new Date().toISOString().slice(0, 10);
    return {
      bootstrapped: false,
      bootTimestamp: Date.now(),
      activeScreen: STUDIO_CONSTANTS.SCREENS.SCREEN_1_WRITE,
      previousScreen: STUDIO_CONSTANTS.SCREENS.SCREEN_1_WRITE,

      // Quản lý danh sách chương & bộ lọc
      chapters: [],
      activeChapterId: null,
      chapterFilter: 'ALL',

      // Chỉ mục chống quên cục bộ BM25 (0 Token)
      ragChunks: [],

      // Hồ sơ Story Bible (Tab 4)
      storyBible: {
        templateFrame: STUDIO_CONSTANTS.DEFAULT_BIBLE_TEMPLATE_FRAME,
        renderedContent: '',
        templateLocked: false,
        characters: [],
        knowledgeMatrix: [],
        cluesLedger: [],
        antiClicheBlacklist: STUDIO_CONSTANTS.DEFAULT_ANTI_CLICHE.join(', ')
      },

      // Danh sách mốc chuyển phân cảnh / đổi góc nhìn POV
      sceneMarkers: [],

      // Đầu ra và Prompt hệ thống của 5 Chế độ AI (Tab 3)
      modeOutputs: {
        MODE_1_DRAFT: '',
        MODE_2_BRAINSTORM: '',
        MODE_3_AUDIT: '',
        MODE_4_REVIEW: '',
        MODE_5_DIAGRAM: ''
      },
      modePrompts: {},
      activeOutputMode: 'MODE_1_DRAFT',
      synthesizedMasterPrompt: '',

      // Kho lưu trữ phiên bản Time-Machine (Tab 6)
      versionVault: [],
      selectedVersionId: null,

      // Trạng thái kiểm duyệt thay đổi AI kiểu Google Docs (Tab 1)
      aiDiffState: {
        active: false,
        originalText: '',
        mergedText: '',
        segments: []
      },

      // Ngăn xếp Hoàn tác / Làm lại (Undo / Redo)
      undoStack: [],
      redoStack: [],
      isUndoRedoAction: false,

      // Đồng hồ tập trung Pomodoro đồng bộ 2 chiều (Tab 5 + Thanh nổi)
      pomodoro: {
        isRunning: false,
        mode: 'WORK', // 'WORK' | 'BREAK'
        workMinutes: 25,
        breakMinutes: 5,
        remainingSeconds: 25 * 60,
        completedSessions: 0,
        wordsAtSessionStart: 0,
        intervalId: null,
        collapsed: false
      },

      // Mục tiêu số từ viết trong ngày
      dailyGoal: {
        targetWords: 2000,
        baselineWords: 0,
        dateKey: todayKey
      },

      // Tay cầm thư mục ổ cứng cục bộ (File System Access API)
      localRootHandle: null,
      localSubHandles: {},

      // Trạng thái âm thanh không gian & lặp đoạn A-B
      audioState: {
        activePreset: 'OFF',
        volume: 0.45,
        abLoopEnabled: false,
        pointA: 0,
        pointB: 60
      },

      // Trạng thái hiển thị & chế độ tập trung
      bgEffect: 'FIREFLIES',
      typewriterMode: false,
      zenMode: false,

      // Số liệu thống kê phiên làm việc hiện tại
      sessionMetrics: {
        sessionStartAt: Date.now(),
        keystrokesCount: 0,
        aiRequestsCount: 0,
        aiTokensEstimated: 0,
        autoSavesCount: 0,
        manualSavesCount: 0,
        chaptersApprovedInSession: 0
      }
    };
  }

  /**
   * Khởi tạo hoặc hợp nhất trạng thái hiện có với trạng thái mặc định.
   */
  const initialDefaultState = createDefaultStudioState();
  if (!NS.state || typeof NS.state !== 'object') {
    NS.state = initialDefaultState;
  } else {
    const keys = Object.keys(initialDefaultState);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (typeof NS.state[k] === 'undefined') {
        NS.state[k] = initialDefaultState[k];
      }
    }
  }

  // Khởi tạo bảng đăng ký Module
  NS.modules = NS.modules || {};

  /**
   * Lớp Quản lý và Kiểm định Toàn vẹn Trạng thái (`StudioStateGuardian`).
   * Đảm bảo không bao giờ xảy ra lỗi `undefined` hoặc hỏng cấu trúc mảng/đối tượng
   * khi nạp dữ liệu cũ từ LocalStorage / IndexedDB hoặc file JSON bên ngoài.
   */
  class StudioStateGuardian {
    constructor(stateRef) {
      this.state = stateRef;
      this.watchers = new Map();
      this.snapshotHistory = [];
      this.maxSnapshots = 20;
    }

    /**
     * Sao chép sâu (Deep Clone) an toàn cho đối tượng JSON, bỏ qua các thuộc tính
     * không thể tuần tự hóa như `FileSystemDirectoryHandle` hoặc `intervalId`.
     */
    safeClone(obj) {
      if (obj === null || typeof obj !== 'object') {
        return obj;
      }
      if (obj instanceof Date) {
        return new Date(obj.getTime());
      }
      if (Array.isArray(obj)) {
        const arrCopy = [];
        for (let i = 0; i < obj.length; i++) {
          arrCopy.push(this.safeClone(obj[i]));
        }
        return arrCopy;
      }
      const copy = {};
      const keys = Object.keys(obj);
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (k === 'localRootHandle' || k === 'localSubHandles' || k === 'intervalId') {
          continue;
        }
        const val = obj[k];
        if (typeof val !== 'function') {
          copy[k] = this.safeClone(val);
        }
      }
      return copy;
    }

    /**
     * Kiểm tra và tự động sửa chữa cấu trúc `NS.state` nếu có trường bị hỏng.
     */
    validateAndHealState() {
      const report = {
        healedFields: [],
        timestamp: Date.now(),
        healthy: true
      };

      const defaults = createDefaultStudioState();

      // 1. Kiểm tra danh sách chương
      if (!Array.isArray(this.state.chapters)) {
        this.state.chapters = [];
        report.healedFields.push('chapters');
      } else {
        for (let i = 0; i < this.state.chapters.length; i++) {
          const ch = this.state.chapters[i];
          if (!ch || typeof ch !== 'object') {
            this.state.chapters.splice(i, 1);
            i--;
            report.healedFields.push('chapters[invalid_item]');
            continue;
          }
          if (!ch.id || typeof ch.id !== 'string') {
            ch.id = 'chap_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
            report.healedFields.push('chapter.id');
          }
          if (typeof ch.title !== 'string' || !ch.title.trim()) {
            ch.title = 'Chương ' + (i + 1) + ': Chưa đặt tiêu đề';
            report.healedFields.push('chapter.title');
          }
          if (typeof ch.content !== 'string') {
            ch.content = String(ch.content || '');
            report.healedFields.push('chapter.content');
          }
          if (typeof ch.beats !== 'string') {
            ch.beats = String(ch.beats || '');
          }
          if (ch.status !== 'DRAFT' && ch.status !== 'APPROVED') {
            ch.status = 'DRAFT';
            report.healedFields.push('chapter.status');
          }
          if (typeof ch.updatedAt !== 'number' || Number.isNaN(ch.updatedAt)) {
            ch.updatedAt = Date.now();
          }
          if (typeof ch.createdAt !== 'number' || Number.isNaN(ch.createdAt)) {
            ch.createdAt = ch.updatedAt;
          }
        }
      }

      // 2. Kiểm tra Story Bible
      if (!this.state.storyBible || typeof this.state.storyBible !== 'object') {
        this.state.storyBible = defaults.storyBible;
        report.healedFields.push('storyBible');
      } else {
        const sb = this.state.storyBible;
        if (typeof sb.templateFrame !== 'string') {
          sb.templateFrame = defaults.storyBible.templateFrame;
          report.healedFields.push('storyBible.templateFrame');
        }
        if (typeof sb.renderedContent !== 'string') {
          sb.renderedContent = '';
          report.healedFields.push('storyBible.renderedContent');
        }
        if (typeof sb.templateLocked !== 'boolean') {
          sb.templateLocked = Boolean(sb.templateLocked);
        }
        if (!Array.isArray(sb.characters)) {
          sb.characters = [];
          report.healedFields.push('storyBible.characters');
        }
        if (!Array.isArray(sb.knowledgeMatrix)) {
          sb.knowledgeMatrix = [];
          report.healedFields.push('storyBible.knowledgeMatrix');
        }
        if (!Array.isArray(sb.cluesLedger)) {
          sb.cluesLedger = [];
          report.healedFields.push('storyBible.cluesLedger');
        }
        if (typeof sb.antiClicheBlacklist !== 'string') {
          sb.antiClicheBlacklist = defaults.storyBible.antiClicheBlacklist;
          report.healedFields.push('storyBible.antiClicheBlacklist');
        }
      }

      // 3. Kiểm tra 5 chế độ đầu ra AI
      if (!this.state.modeOutputs || typeof this.state.modeOutputs !== 'object') {
        this.state.modeOutputs = defaults.modeOutputs;
        report.healedFields.push('modeOutputs');
      } else {
        const modeKeys = Object.keys(defaults.modeOutputs);
        for (let i = 0; i < modeKeys.length; i++) {
          const mk = modeKeys[i];
          if (typeof this.state.modeOutputs[mk] !== 'string') {
            this.state.modeOutputs[mk] = '';
            report.healedFields.push('modeOutputs.' + mk);
          }
        }
      }

      // 4. Kiểm tra các mảng và đối tượng cốt lõi khác
      if (!Array.isArray(this.state.ragChunks)) {
        this.state.ragChunks = [];
        report.healedFields.push('ragChunks');
      }
      if (!Array.isArray(this.state.sceneMarkers)) {
        this.state.sceneMarkers = [];
        report.healedFields.push('sceneMarkers');
      }
      if (!Array.isArray(this.state.versionVault)) {
        this.state.versionVault = [];
        report.healedFields.push('versionVault');
      }
      if (!Array.isArray(this.state.undoStack)) {
        this.state.undoStack = [];
      }
      if (!Array.isArray(this.state.redoStack)) {
        this.state.redoStack = [];
      }
      if (!this.state.aiDiffState || typeof this.state.aiDiffState !== 'object') {
        this.state.aiDiffState = defaults.aiDiffState;
        report.healedFields.push('aiDiffState');
      }
      if (!this.state.pomodoro || typeof this.state.pomodoro !== 'object') {
        this.state.pomodoro = defaults.pomodoro;
        report.healedFields.push('pomodoro');
      }
      if (!this.state.dailyGoal || typeof this.state.dailyGoal !== 'object') {
        this.state.dailyGoal = defaults.dailyGoal;
        report.healedFields.push('dailyGoal');
      }

      report.healthy = report.healedFields.length === 0;
      return report;
    }

    /**
     * Lấy chương đang mở hiện tại trong `NS.state`.
     */
    getActiveChapter() {
      const chapters = this.state.chapters || [];
      if (!chapters.length) return null;
      const targetId = this.state.activeChapterId;
      if (targetId) {
        for (let i = 0; i < chapters.length; i++) {
          if (chapters[i] && chapters[i].id === targetId) {
            return chapters[i];
          }
        }
      }
      return chapters[0] || null;
    }

    /**
     * Tính tổng số từ của toàn bộ các chương trong dự án (dùng bộ đếm chuẩn hoặc ước tính).
     */
    computeProjectSummaryMetrics() {
      const chapters = Array.isArray(this.state.chapters) ? this.state.chapters : [];
      let totalChapters = chapters.length;
      let approvedChapters = 0;
      let draftChapters = 0;
      let totalChars = 0;
      let totalWordsApprox = 0;

      for (let i = 0; i < chapters.length; i++) {
        const ch = chapters[i];
        if (!ch) continue;
        if (ch.status === 'APPROVED') {
          approvedChapters++;
        } else {
          draftChapters++;
        }
        const content = String(ch.content || '').trim();
        totalChars += content.length;
        if (content.length > 0) {
          const words = content.split(/\s+/).filter(Boolean).length;
          totalWordsApprox += words;
        }
      }

      const sb = this.state.storyBible || {};
      return {
        totalChapters,
        approvedChapters,
        draftChapters,
        totalChars,
        totalWordsApprox,
        charactersCount: Array.isArray(sb.characters) ? sb.characters.length : 0,
        knowledgeCount: Array.isArray(sb.knowledgeMatrix) ? sb.knowledgeMatrix.length : 0,
        cluesCount: Array.isArray(sb.cluesLedger) ? sb.cluesLedger.length : 0,
        sceneMarkersCount: Array.isArray(this.state.sceneMarkers) ? this.state.sceneMarkers.length : 0,
        ragChunksCount: Array.isArray(this.state.ragChunks) ? this.state.ragChunks.length : 0,
        versionSnapshotsCount: Array.isArray(this.state.versionVault) ? this.state.versionVault.length : 0
      };
    }

    /**
     * Lưu một bản chụp nhanh (In-memory Snapshot) phục vụ gỡ lỗi hoặc hoàn nguyên tức thời.
     */
    captureMemorySnapshot(label) {
      const snap = {
        id: 'mem_snap_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        label: String(label || 'Chụp trạng thái bộ nhớ'),
        createdAt: Date.now(),
        activeChapterId: this.state.activeChapterId,
        chaptersCount: Array.isArray(this.state.chapters) ? this.state.chapters.length : 0,
        payload: this.safeClone({
          chapters: this.state.chapters,
          activeChapterId: this.state.activeChapterId,
          storyBible: this.state.storyBible,
          sceneMarkers: this.state.sceneMarkers,
          modeOutputs: this.state.modeOutputs
        })
      };
      this.snapshotHistory.unshift(snap);
      if (this.snapshotHistory.length > this.maxSnapshots) {
        this.snapshotHistory.length = this.maxSnapshots;
      }
      return snap;
    }

    /**
     * Đăng ký hàm theo dõi khi một đường dẫn khóa trạng thái thay đổi.
     */
    watch(pathKey, callback) {
      if (!pathKey || typeof callback !== 'function') return () => {};
      if (!this.watchers.has(pathKey)) {
        this.watchers.set(pathKey, new Set());
      }
      const set = this.watchers.get(pathKey);
      set.add(callback);
      return () => {
        set.delete(callback);
      };
    }

    /**
     * Thông báo cho các watcher của một khóa cụ thể.
     */
    notifyWatchers(pathKey, newValue, oldValue) {
      const set = this.watchers.get(pathKey);
      if (!set || !set.size) return;
      set.forEach((cb) => {
        try {
          cb(newValue, oldValue, pathKey);
        } catch (err) {
          console.error('[NoirStudio StateGuardian] Lỗi thực thi Watcher tại khóa:', pathKey, err);
        }
      });
    }
  }

  NS.stateGuardian = new StudioStateGuardian(NS.state);

  // ==========================================================================
  // PHẦN 3: HỆ THỐNG NHẬT KÝ CHẨN ĐOÁN CÓ CẤU TRÚC (STRUCTURED TELEMETRY LOGGER)
  // ==========================================================================

  class StudioTelemetryLogger {
    constructor(maxEntries) {
      this.maxEntries = maxEntries || STUDIO_CONSTANTS.LIMITS.LOGGER_MAX_ENTRIES;
      this.entries = [];
      this.levelWeights = {
        DEBUG: 10,
        INFO: 20,
        WARN: 30,
        ERROR: 40,
        CRITICAL: 50
      };
      this.minConsoleLevel = 'INFO';
      this.counters = {
        DEBUG: 0,
        INFO: 0,
        WARN: 0,
        ERROR: 0,
        CRITICAL: 0
      };
    }

    /**
     * Ghi một bản ghi nhật ký mới vào bộ đệm vòng (Ring Buffer).
     */
    log(level, moduleName, message, meta) {
      const normalizedLevel = this.levelWeights[level] ? level : 'INFO';
      this.counters[normalizedLevel] = (this.counters[normalizedLevel] || 0) + 1;

      const entry = {
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        timestamp: Date.now(),
        isoTime: new Date().toISOString(),
        level: normalizedLevel,
        module: String(moduleName || 'CoreKernel'),
        message: String(message || ''),
        meta: meta !== undefined ? this._sanitizeMeta(meta) : null
      };

      this.entries.push(entry);
      if (this.entries.length > this.maxEntries) {
        this.entries.shift();
      }

      const currentWeight = this.levelWeights[normalizedLevel] || 20;
      const minWeight = this.levelWeights[this.minConsoleLevel] || 20;

      if (currentWeight >= minWeight && typeof console !== 'undefined') {
        const prefix = `[NoirStudio][${entry.module}][${normalizedLevel}]`;
        if (normalizedLevel === 'ERROR' || normalizedLevel === 'CRITICAL') {
          console.error(prefix, entry.message, entry.meta || '');
        } else if (normalizedLevel === 'WARN') {
          console.warn(prefix, entry.message, entry.meta || '');
        } else if (normalizedLevel === 'DEBUG') {
          console.debug(prefix, entry.message, entry.meta || '');
        }
      }

      return entry;
    }

    _sanitizeMeta(meta) {
      if (meta === null || meta === undefined) return null;
      if (meta instanceof Error) {
        return {
          name: meta.name,
          message: meta.message,
          stack: String(meta.stack || '').split('\n').slice(0, 6).join('\n')
        };
      }
      if (typeof meta !== 'object') {
        return meta;
      }
      try {
        return JSON.parse(JSON.stringify(meta));
      } catch (_) {
        return String(meta);
      }
    }

    debug(moduleName, message, meta) {
      return this.log('DEBUG', moduleName, message, meta);
    }

    info(moduleName, message, meta) {
      return this.log('INFO', moduleName, message, meta);
    }

    warn(moduleName, message, meta) {
      return this.log('WARN', moduleName, message, meta);
    }

    error(moduleName, message, meta) {
      return this.log('ERROR', moduleName, message, meta);
    }

    critical(moduleName, message, meta) {
      return this.log('CRITICAL', moduleName, message, meta);
    }

    /**
     * Lọc danh sách nhật ký theo cấp độ, tên module hoặc từ khóa.
     */
    queryLogs(filterOptions) {
      const opts = filterOptions || {};
      const levelFilter = opts.level ? String(opts.level).toUpperCase() : null;
      const moduleFilter = opts.module ? String(opts.module).toLowerCase() : null;
      const searchKeyword = opts.keyword ? String(opts.keyword).toLowerCase() : null;
      const limit = Number(opts.limit) > 0 ? Number(opts.limit) : 100;

      const results = [];
      for (let i = this.entries.length - 1; i >= 0; i--) {
        const item = this.entries[i];
        if (levelFilter && item.level !== levelFilter) continue;
        if (moduleFilter && !item.module.toLowerCase().includes(moduleFilter)) continue;
        if (searchKeyword) {
          const hay = (item.message + ' ' + JSON.stringify(item.meta || '')).toLowerCase();
          if (!hay.includes(searchKeyword)) continue;
        }
        results.push(item);
        if (results.length >= limit) break;
      }
      return results;
    }

    /**
     * Xuất báo cáo chẩn đoán hệ thống dưới dạng đối tượng JSON đầy đủ.
     */
    exportDiagnosticReport() {
      return {
        version: STUDIO_CONSTANTS.VERSION,
        generatedAt: new Date().toISOString(),
        counters: Object.assign({}, this.counters),
        registeredModules: Object.keys(NS.modules || {}),
        projectMetrics: NS.stateGuardian ? NS.stateGuardian.computeProjectSummaryMetrics() : {},
        recentErrors: this.queryLogs({ level: 'ERROR', limit: 25 }),
        recentWarnings: this.queryLogs({ level: 'WARN', limit: 25 }),
        recentLogs: this.entries.slice(-50)
      };
    }

    clear() {
      this.entries = [];
    }
  }

  NS.logger = new StudioTelemetryLogger(STUDIO_CONSTANTS.LIMITS.LOGGER_MAX_ENTRIES);

  // ==========================================================================
  // PHẦN 4: HỆ THỐNG PUB/SUB EVENT BUS ĐA LUỒNG (`window.NoirStudio.bus`)
  // ==========================================================================

  /**
   * Trạm trung chuyển sự kiện trung tâm (`StudioEventBus`).
   * Hỗ trợ:
   *  - Đăng ký sự kiện chuẩn `on(eventName, handler, options)`
   *  - Đăng ký một lần `once(eventName, handler, options)`
   *  - Hủy đăng ký `off(eventName, handler)`
   *  - Phát sự kiện đồng bộ `emit(eventName, payload)`
   *  - Phát sự kiện bất đồng bộ `emitAsync(eventName, payload)`
   *  - Lắng nghe ký tự đại diện (Wildcard): `*` hoặc `chapter:*`, `ai:*`
   *  - Lưu lịch sử sự kiện và phát lại (`replay`) cho các module khởi tạo muộn
   */
  class StudioEventBus {
    constructor() {
      this.listeners = new Map();
      this.wildcardListeners = new Map();
      this.history = [];
      this.maxHistory = STUDIO_CONSTANTS.LIMITS.EVENT_HISTORY_MAX_ITEMS;
      this.middlewares = [];
      this.paused = false;
      this.pausedQueue = [];
      this.channelStats = new Map();
      this.listenerIdCounter = 0;
    }

    /**
     * Kiểm tra xem tên sự kiện có phải dạng Wildcard (`*` hoặc `namespace:*`) hay không.
     */
    _isWildcardPattern(eventName) {
      return typeof eventName === 'string' && eventName.indexOf('*') !== -1;
    }

    /**
     * Chuyển mẫu Wildcard (ví dụ `chapter:*`) thành biểu thức chính quy.
     */
    _compileWildcardRegex(pattern) {
      const escaped = String(pattern)
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*');
      return new RegExp('^' + escaped + '$');
    }

    /**
     * Đăng ký lắng nghe một sự kiện.
     * @param {string} eventName Tên sự kiện hoặc mẫu Wildcard
     * @param {Function} handler Hàm xử lý `(payload, eventMeta) => void`
     * @param {Object} [options] Tùy chọn `{ priority: number, once: boolean, subscriberName: string }`
     * @returns {Function} Hàm hủy đăng ký (Unsubscribe function)
     */
    on(eventName, handler, options) {
      if (!eventName || typeof handler !== 'function') {
        return () => {};
      }

      const opts = options && typeof options === 'object' ? options : {};
      const priority = typeof opts.priority === 'number' ? opts.priority : 0;
      const once = Boolean(opts.once);
      const subscriberName = String(opts.subscriberName || 'anonymous');
      const subscriptionId = 'sub_' + (++this.listenerIdCounter);

      const entry = {
        id: subscriptionId,
        eventName,
        handler,
        priority,
        once,
        subscriberName,
        registeredAt: Date.now(),
        invocationCount: 0
      };

      if (this._isWildcardPattern(eventName)) {
        entry.regex = this._compileWildcardRegex(eventName);
        if (!this.wildcardListeners.has(eventName)) {
          this.wildcardListeners.set(eventName, []);
        }
        const wcList = this.wildcardListeners.get(eventName);
        wcList.push(entry);
        wcList.sort((a, b) => b.priority - a.priority);
        return () => this.off(eventName, handler);
      }

      if (!this.listeners.has(eventName)) {
        this.listeners.set(eventName, []);
      }
      const list = this.listeners.get(eventName);

      // Ngăn chặn đăng ký trùng lặp cùng một hàm handler trên cùng một sự kiện
      for (let i = 0; i < list.length; i++) {
        if (list[i].handler === handler) {
          return () => this.off(eventName, handler);
        }
      }

      list.push(entry);
      list.sort((a, b) => b.priority - a.priority);

      return () => this.off(eventName, handler);
    }

    /**
     * Đăng ký lắng nghe sự kiện duy nhất 1 lần rồi tự động gỡ bỏ.
     */
    once(eventName, handler, options) {
      const mergedOptions = Object.assign({}, options || {}, { once: true });
      return this.on(eventName, handler, mergedOptions);
    }

    /**
     * Gỡ bỏ hàm lắng nghe khỏi một sự kiện.
     */
    off(eventName, handler) {
      if (!eventName) return;

      if (this._isWildcardPattern(eventName)) {
        const wcList = this.wildcardListeners.get(eventName);
        if (!wcList) return;
        if (!handler) {
          this.wildcardListeners.delete(eventName);
          return;
        }
        for (let i = wcList.length - 1; i >= 0; i--) {
          if (wcList[i].handler === handler) {
            wcList.splice(i, 1);
          }
        }
        if (wcList.length === 0) {
          this.wildcardListeners.delete(eventName);
        }
        return;
      }

      const list = this.listeners.get(eventName);
      if (!list) return;
      if (!handler) {
        this.listeners.delete(eventName);
        return;
      }
      for (let i = list.length - 1; i >= 0; i--) {
        if (list[i].handler === handler) {
          list.splice(i, 1);
        }
      }
      if (list.length === 0) {
        this.listeners.delete(eventName);
      }
    }

    /**
     * Thêm một hàm Middleware chặn lọc hoặc biến đổi dữ liệu sự kiện trước khi phát.
     */
    useMiddleware(middlewareFn) {
      if (typeof middlewareFn === 'function') {
        this.middlewares.push(middlewareFn);
      }
    }

    /**
     * Thu thập toàn bộ các listener khớp với `eventName` (bao gồm cả Wildcard).
     */
    _collectMatchingEntries(eventName) {
      const matched = [];
      const directList = this.listeners.get(eventName);
      if (directList && directList.length > 0) {
        for (let i = 0; i < directList.length; i++) {
          matched.push(directList[i]);
        }
      }

      if (this.wildcardListeners.size > 0) {
        this.wildcardListeners.forEach((wcList) => {
          for (let i = 0; i < wcList.length; i++) {
            const item = wcList[i];
            if (item.regex && item.regex.test(eventName)) {
              matched.push(item);
            }
          }
        });
      }

      if (matched.length > 1) {
        matched.sort((a, b) => b.priority - a.priority);
      }
      return matched;
    }

    /**
     * Ghi nhận thống kê và lưu vào lịch sử sự kiện.
     */
    _recordEventEmission(eventName, payload, listenersCount) {
      const now = Date.now();
      const record = {
        eventName,
        payload,
        ts: now,
        listenersCount
      };

      this.history.push(record);
      if (this.history.length > this.maxHistory) {
        this.history.shift();
      }

      const stat = this.channelStats.get(eventName) || {
        eventName,
        emitCount: 0,
        lastEmittedAt: 0,
        errorsCount: 0
      };
      stat.emitCount += 1;
      stat.lastEmittedAt = now;
      this.channelStats.set(eventName, stat);

      return record;
    }

    /**
     * Phát một sự kiện đồng bộ tới mọi Module đã đăng ký.
     */
    emit(eventName, payload) {
      if (!eventName || typeof eventName !== 'string') return 0;

      if (this.paused) {
        this.pausedQueue.push({ eventName, payload, async: false });
        return 0;
      }

      let currentPayload = payload;
      for (let m = 0; m < this.middlewares.length; m++) {
        try {
          const mwResult = this.middlewares[m](eventName, currentPayload);
          if (mwResult === false) {
            return 0;
          }
          if (mwResult !== undefined) {
            currentPayload = mwResult;
          }
        } catch (mwErr) {
          NS.logger.error('EventBus', `Lỗi Middleware khi phát sự kiện ${eventName}`, mwErr);
        }
      }

      const matchedEntries = this._collectMatchingEntries(eventName);
      const record = this._recordEventEmission(eventName, currentPayload, matchedEntries.length);

      let invoked = 0;
      const toRemoveOnce = [];

      for (let i = 0; i < matchedEntries.length; i++) {
        const entry = matchedEntries[i];
        try {
          entry.invocationCount += 1;
          entry.handler(currentPayload, record);
          invoked += 1;
        } catch (err) {
          const stat = this.channelStats.get(eventName);
          if (stat) stat.errorsCount += 1;
          NS.logger.error('EventBus', `Lỗi thực thi sự kiện [${eventName}] tại subscriber [${entry.subscriberName}]`, err);
        }
        if (entry.once) {
          toRemoveOnce.push(entry);
        }
      }

      for (let r = 0; r < toRemoveOnce.length; r++) {
        this.off(toRemoveOnce[r].eventName, toRemoveOnce[r].handler);
      }

      return invoked;
    }

    /**
     * Phát sự kiện bất đồng bộ (`async/await`), chờ tất cả các handler hoàn thành.
     */
    async emitAsync(eventName, payload) {
      if (!eventName || typeof eventName !== 'string') return [];

      if (this.paused) {
        this.pausedQueue.push({ eventName, payload, async: true });
        return [];
      }

      const matchedEntries = this._collectMatchingEntries(eventName);
      const record = this._recordEventEmission(eventName, payload, matchedEntries.length);

      const results = [];
      const toRemoveOnce = [];

      for (let i = 0; i < matchedEntries.length; i++) {
        const entry = matchedEntries[i];
        try {
          entry.invocationCount += 1;
          const res = await Promise.resolve(entry.handler(payload, record));
          results.push({ subscriber: entry.subscriberName, status: 'fulfilled', value: res });
        } catch (err) {
          const stat = this.channelStats.get(eventName);
          if (stat) stat.errorsCount += 1;
          NS.logger.error('EventBus', `Lỗi bất đồng bộ [${eventName}] tại [${entry.subscriberName}]`, err);
          results.push({ subscriber: entry.subscriberName, status: 'rejected', error: err });
        }
        if (entry.once) {
          toRemoveOnce.push(entry);
        }
      }

      for (let r = 0; r < toRemoveOnce.length; r++) {
        this.off(toRemoveOnce[r].eventName, toRemoveOnce[r].handler);
      }

      return results;
    }

    /**
     * Phát lại sự kiện gần nhất có tên `eventName` cho một hàm xử lý mới đăng ký.
     */
    replayLast(eventName, handler) {
      if (!eventName || typeof handler !== 'function') return false;
      for (let i = this.history.length - 1; i >= 0; i--) {
        if (this.history[i].eventName === eventName) {
          try {
            handler(this.history[i].payload, this.history[i]);
            return true;
          } catch (err) {
            NS.logger.error('EventBus', `Lỗi replayLast cho sự kiện ${eventName}`, err);
            return false;
          }
        }
      }
      return false;
    }

    /**
     * Tạm dừng phát sự kiện (đưa vào hàng đợi tạm) và tiếp tục phát khi gọi `resume()`.
     */
    pause() {
      this.paused = true;
    }

    resume() {
      if (!this.paused) return;
      this.paused = false;
      const pending = this.pausedQueue.splice(0, this.pausedQueue.length);
      for (let i = 0; i < pending.length; i++) {
        const item = pending[i];
        if (item.async) {
          this.emitAsync(item.eventName, item.payload);
        } else {
          this.emit(item.eventName, item.payload);
        }
      }
    }

    /**
     * Lấy lịch sử sự kiện gần đây để kiểm tra luồng hoạt động.
     */
    getHistory(filterEventName, limit) {
      const max = Number(limit) > 0 ? Number(limit) : 50;
      if (!filterEventName) {
        return this.history.slice(-max);
      }
      const filtered = [];
      for (let i = this.history.length - 1; i >= 0; i--) {
        if (this.history[i].eventName === filterEventName) {
          filtered.unshift(this.history[i]);
          if (filtered.length >= max) break;
        }
      }
      return filtered;
    }

    /**
     * Báo cáo tổng quan các kênh sự kiện đang hoạt động.
     */
    getDiagnosticsSummary() {
      const channels = [];
      this.listeners.forEach((list, eventName) => {
        const stat = this.channelStats.get(eventName) || { emitCount: 0, lastEmittedAt: 0, errorsCount: 0 };
        channels.push({
          eventName,
          subscribersCount: list.length,
          emitCount: stat.emitCount,
          errorsCount: stat.errorsCount,
          lastEmittedAt: stat.lastEmittedAt
        });
      });
      return {
        totalDirectChannels: this.listeners.size,
        totalWildcardChannels: this.wildcardListeners.size,
        historySize: this.history.length,
        paused: this.paused,
        channels
      };
    }
  }

  NS.bus = new StudioEventBus();

  // ==========================================================================
  // PHẦN 5: HÀNG ĐỢI KHÓA BẤT ĐỒNG BỘ (`window.NoirStudio.mutex`)
  // ==========================================================================

  /**
   * Hàng đợi khóa tuần tự (`AsyncMutexQueue`) đảm bảo các thao tác ghi dữ liệu
   * nhạy cảm (như Lưu tự động 2s, Đồng bộ thư mục ổ cứng, Cập nhật Story Bible)
   * không bao giờ chạy chồng chéo gây mất mát hoặc ghi đè dữ liệu cũ lên dữ liệu mới.
   */
  class AsyncMutexQueue {
    constructor() {
      this._chain = Promise.resolve();
      this._namedChains = new Map();
      this._stats = {
        totalTasksExecuted: 0,
        totalFailures: 0,
        totalTimeouts: 0,
        activeTasksCount: 0,
        lastTaskCompletedAt: 0
      };
      this.defaultTimeoutMs = 45000;
    }

    /**
     * Thực thi một tác vụ bất đồng bộ trong hàng đợi độc quyền.
     * @param {Function} taskFn Hàm thực thi `async () => any`
     * @param {string} [resourceKey='global_default'] Tên kênh tài nguyên cần khóa
     * @param {number} [timeoutMs=45000] Thời gian chờ tối đa để tránh treo hàng đợi
     */
    runExclusive(taskFn, resourceKey, timeoutMs) {
      let fn = taskFn;
      let rawKey = resourceKey;
      if (typeof fn === 'string' && typeof resourceKey === 'function') {
        fn = resourceKey;
        rawKey = taskFn;
      }
      if (typeof fn !== 'function') {
        return Promise.resolve(null);
      }

      const key = typeof rawKey === 'string' && rawKey.trim()
        ? rawKey.trim()
        : 'global_default';
      const maxWait = typeof timeoutMs === 'number' && timeoutMs > 0
        ? timeoutMs
        : this.defaultTimeoutMs;

      const baseChain = key === 'global_default'
        ? this._chain
        : (this._namedChains.get(key) || Promise.resolve());

      const wrappedTask = () => {
        this._stats.activeTasksCount += 1;
        return new Promise((resolve, reject) => {
          let settled = false;
          const timer = setTimeout(() => {
            if (!settled) {
              settled = true;
              this._stats.totalTimeouts += 1;
              this._stats.activeTasksCount = Math.max(0, this._stats.activeTasksCount - 1);
              const timeoutErr = new Error(`[AsyncMutexQueue] Quá thời gian chờ (${maxWait}ms) trên tài nguyên [${key}]`);
              NS.logger.warn('MutexQueue', timeoutErr.message);
              reject(timeoutErr);
            }
          }, maxWait);

          Promise.resolve()
            .then(() => fn())
            .then((result) => {
              if (!settled) {
                settled = true;
                clearTimeout(timer);
                this._stats.totalTasksExecuted += 1;
                this._stats.lastTaskCompletedAt = Date.now();
                this._stats.activeTasksCount = Math.max(0, this._stats.activeTasksCount - 1);
                resolve(result);
              }
            })
            .catch((err) => {
              if (!settled) {
                settled = true;
                clearTimeout(timer);
                this._stats.totalFailures += 1;
                this._stats.activeTasksCount = Math.max(0, this._stats.activeTasksCount - 1);
                NS.logger.error('MutexQueue', `Lỗi tác vụ trong hàng đợi [${key}]`, err);
                reject(err);
              }
            });
        });
      };

      const nextPromise = baseChain.then(wrappedTask, wrappedTask);
      const safeTail = nextPromise.catch(() => {});

      if (key === 'global_default') {
        this._chain = safeTail;
      } else {
        this._namedChains.set(key, safeTail);
      }

      return nextPromise;
    }

    /**
     * Lấy thống kê tình trạng hàng đợi Mutex.
     */
    getStats() {
      return Object.assign({}, this._stats, {
        namedChannels: Array.from(this._namedChains.keys())
      });
    }
  }

  NS.mutex = new AsyncMutexQueue();

  // ==========================================================================
  // PHẦN 6: BỘ GẮN SỰ KIỆN DOM CHỐNG NHÂN ĐÔI (`window.NoirStudio.bindOnce`)
  // ==========================================================================

  /**
   * Quản lý toàn bộ các sự kiện DOM đã gắn thông qua `NS.bindOnce`.
   * Ngăn chặn triệt để lỗi một nút bấm bị gắn 2-3 lần sự kiện khi chuyển tab
   * hoặc khởi tạo lại giao diện.
   */
  class StudioDOMBindingRegistry {
    constructor() {
      this.boundRecords = new Map();
      this.totalBoundCount = 0;
      this.skippedDuplicateCount = 0;
    }

    /**
     * Gắn sự kiện vào phần tử DOM (hoặc ID chuỗi) đúng 1 lần duy nhất cho mỗi `bindKey`.
     */
    bindOnce(elOrId, eventName, handler, bindKey, options) {
      if (typeof document === 'undefined') return null;
      const el = typeof elOrId === 'string' ? document.getElementById(elOrId) : elOrId;
      if (!el || typeof handler !== 'function' || !eventName) return null;

      const elementIdentifier = el.id || el.tagName || 'dom_node';
      const key = String(bindKey || `${elementIdentifier}__${eventName}`).trim();
      const attrName = 'data-noir-bound-' + key.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();

      if (el.getAttribute && el.getAttribute(attrName) === '1') {
        this.skippedDuplicateCount += 1;
        return el;
      }

      if (el.setAttribute) {
        el.setAttribute(attrName, '1');
      }

      const wrappedHandler = function noirSafeDomEventHandler(evt) {
        try {
          if (eventName === 'keydown' && NS.state && NS.state.sessionMetrics) {
            NS.state.sessionMetrics.keystrokesCount += 1;
          }
          return handler.call(el, evt);
        } catch (err) {
          NS.logger.error('DOMBinder', `Lỗi xử lý sự kiện DOM [${eventName}] tại [${key}]`, err);
        }
      };

      el.addEventListener(eventName, wrappedHandler, options || false);
      this.totalBoundCount += 1;

      this.boundRecords.set(key, {
        key,
        elementId: el.id || null,
        tagName: el.tagName || 'UNKNOWN',
        eventName,
        attrName,
        boundAt: Date.now(),
        elRef: el,
        wrappedHandler,
        options: options || false
      });

      return el;
    }

    /**
     * Gỡ bỏ một sự kiện đã gắn theo `bindKey` nếu cần gắn lại hàm xử lý mới.
     */
    unbindByKey(bindKey) {
      const key = String(bindKey || '').trim();
      if (!key || !this.boundRecords.has(key)) return false;

      const rec = this.boundRecords.get(key);
      if (rec && rec.elRef) {
        try {
          rec.elRef.removeEventListener(rec.eventName, rec.wrappedHandler, rec.options);
          if (rec.elRef.removeAttribute && rec.attrName) {
            rec.elRef.removeAttribute(rec.attrName);
          }
        } catch (_) {}
      }
      this.boundRecords.delete(key);
      return true;
    }

    /**
     * Gắn sự kiện cho một danh sách phần tử khớp với CSS Selector.
     */
    bindSelectorAllOnce(selector, eventName, handlerFn, bindKeyPrefix) {
      if (typeof document === 'undefined' || !selector) return 0;
      const nodes = document.querySelectorAll(selector);
      let count = 0;
      nodes.forEach((node, idx) => {
        const subKey = `${bindKeyPrefix || selector}_${idx}_${eventName}`;
        const bound = this.bindOnce(node, eventName, (evt) => handlerFn(node, evt, idx), subKey);
        if (bound) count += 1;
      });
      return count;
    }

    /**
     * Xuất thống kê các sự kiện DOM đã gắn.
     */
    getReport() {
      return {
        totalBoundCount: this.totalBoundCount,
        activeBindings: this.boundRecords.size,
        skippedDuplicateCount: this.skippedDuplicateCount
      };
    }
  }

  NS.domBinder = new StudioDOMBindingRegistry();

  /**
   * Hàm tiện ích toàn cục `window.NoirStudio.bindOnce(elOrId, eventName, handler, bindKey)`
   * được tất cả 30 Module gọi trực tiếp.
   */
  NS.bindOnce = function bindOnceGlobal(elOrId, eventName, handler, bindKey, options) {
    return NS.domBinder.bindOnce(elOrId, eventName, handler, bindKey, options);
  };

  // ==========================================================================
  // PHẦN 7: HỆ THỐNG ĐĂNG KÝ & KIỂM ĐỊNH 30 MODULE (`window.NoirStudio.registerModule`)
  // ==========================================================================

  /**
   * Danh mục chuẩn của 30 Module trong kiến trúc v38.0 Supreme Modular.
   */
  const EXPECTED_30_MODULES_MANIFEST = Object.freeze([
    { index: 1, key: 'mod01_core_kernel', file: 'mod01_core_kernel_and_event_bus.js', title: 'Nhân Hệ Thống, Hằng Số & Trạm Sự Kiện EventBus' },
    { index: 2, key: 'mod02_models_catalog', file: 'mod02_gemini_models_catalog_and_router_config.js', title: 'Danh Mục Mô Hình Gemini 2026 & Cố Vấn Chất Lượng' },
    { index: 3, key: 'mod03_ui_nlp_utils', file: 'mod03_humanized_ui_toast_and_vn_nlp_utils.js', title: 'Thông Báo Thân Thiện & Xử Lý Ngôn Ngữ Tiếng Việt' },
    { index: 4, key: 'mod04_idb_storage', file: 'mod04_indexeddb_storage_and_emergency_vault.js', title: 'Cơ Sở Dữ Liệu IndexedDB & Két Sắt Khẩn Cấp' },
    { index: 5, key: 'mod05_local_fs', file: 'mod05_local_filesystem_and_folder_sync.js', title: 'Đồng Bộ Ổ Cứng Máy Tính 6 Thư Mục Tự Động' },
    { index: 6, key: 'mod06_doc_importer', file: 'mod06_document_importer_docx_pdf_txt.js', title: 'Trình Nạp Tài Liệu .DOCX, .PDF, .TXT & .JSON' },
    { index: 7, key: 'mod07_bm25_rag', file: 'mod07_bm25_local_rag_memory_engine.js', title: 'Bộ Nhớ Chống Quên Cục Bộ BM25 (0 Token)' },
    { index: 8, key: 'mod08_chapter_tree', file: 'mod08_chapter_tree_and_bidirectional_approval.js', title: 'Quản Lý Cây Bản Thảo & Đồng Bộ Tiêu Đề Hai Chiều' },
    { index: 9, key: 'mod09_autosave_undo', file: 'mod09_three_tier_autosave_and_undo_stack.js', title: 'Lưu Tự Động 3 Lớp Sau 2 Giây & Hoàn Tác Đa Tầng' },
    { index: 10, key: 'mod10_version_vault', file: 'mod10_version_time_machine_and_live_preview.js', title: 'Cỗ Máy Thời Gian Phiên Bản & Xem Trước Trạng Thái Cũ' },
    { index: 11, key: 'mod11_ai_diff_review', file: 'mod11_google_docs_ai_diff_review_engine.js', title: 'Duyệt Thay Đổi AI Kiểu Google Docs (Tô Màu Đoạn Mới)' },
    { index: 12, key: 'mod12_story_bible', file: 'mod12_story_bible_and_lore_matrix_engine.js', title: 'Trung Tâm Story Bible, Nhân Vật, Ai Biết Gì & Phục Bút' },
    { index: 13, key: 'mod13_scene_builder', file: 'mod13_scene_transition_and_pov_builder.js', title: 'Thiết Kế Mốc Chuyển Phân Cảnh & Đổi Góc Nhìn POV' },
    { index: 14, key: 'mod14_sysprompts_studio', file: 'mod14_five_modes_system_prompts_studio.js', title: 'Khung Cấu Hình System Prompt Cho Cả 5 Chế Độ AI' },
    { index: 15, key: 'mod15_api_client', file: 'mod15_api_key_vault_and_zero_congestion_client.js', title: 'Két Sắt API Key & Động Cơ Kết Nối Gemini Chống Nghẽn' },
    { index: 16, key: 'mod16_prompt_synthesizer', file: 'mod16_master_prompt_synthesizer_two_step.js', title: 'Trình Tổng Hợp Prompt Chính Thức 2 Bước Chuẩn Xác' },
    { index: 17, key: 'mod17_tab3_controller', file: 'mod17_tab3_five_modes_output_controller.js', title: 'Điều Phối Cửa Sổ Đầu Ra 5 Chế Độ Tại Tab 3' },
    { index: 18, key: 'mod18_mode5_diagram', file: 'mod18_mode5_plot_diagram_and_timeline_studio.js', title: 'Chế Độ 5: Vẽ Biểu Đồ Cốt Truyện & Trục Thời Gian SVG' },
    { index: 19, key: 'mod19_smart_approval', file: 'mod19_smart_approval_and_bible_extractor.js', title: 'Cổng Duyệt Chương Thông Minh & Tự Động Trích Xuất Bible' },
    { index: 20, key: 'mod20_pomodoro_sync', file: 'mod20_bidirectional_pomodoro_sync_engine.js', title: 'Đồng Hồ Tập Trung Pomodoro Đồng Bộ Hai Chiều 100%' },
    { index: 21, key: 'mod21_audio_soundscape', file: 'mod21_mp3_ab_loop_and_webaudio_soundscape.js', title: 'Trình Phát MP3 Lặp A-B & Âm Thanh Không Gian WebAudio' },
    { index: 22, key: 'mod22_typography_canvas', file: 'mod22_typography_and_60fps_ambient_canvas.js', title: 'Kiểu Chữ Trang Sách & Hiệu Ứng Nền Động 60FPS' },
    { index: 23, key: 'mod23_dialogue_tools', file: 'mod23_dialogue_normalizer_and_vn_editor_tools.js', title: 'Chuẩn Hóa Hội Thoại "- Thoại (Tên)" & Tìm Thay Thế' },
    { index: 24, key: 'mod24_cliche_scanner', file: 'mod24_cliche_scanner_and_pacing_heatmap.js', title: 'Máy Quét Từ Sáo Rỗng AI & Phân Tích Nhịp Văn' },
    { index: 25, key: 'mod25_webnovel_secrets', file: 'mod25_webnovel_secret_features_and_lore_whisper.js', title: 'Từ Điển Ngũ Quan Show-Dont-Tell & Nhắc Lore Ngầm' },
    { index: 26, key: 'mod26_book_exporter', file: 'mod26_pdf_docx_epub_custom_book_exporter.js', title: 'Bộ Xuất Sách .PDF Chọn Font/Cỡ Chữ, .DOCX & .TXT' },
    { index: 27, key: 'mod27_mascot_bi_so_8', file: 'mod27_mascot_bi_so_8_and_dual_chat_assistant.js', title: 'Linh Vật Viên Bi Số 8 & Phòng Chat Gemini Tự Do' },
    { index: 28, key: 'mod28_video_tutorial', file: 'mod28_animated_video_tutorial_with_subtitles.js', title: 'Video Hướng Dẫn Tương Tác Có Phụ Đề & Cẩm Nang A-Z' },
    { index: 29, key: 'mod29_responsive_nav', file: 'mod29_responsive_mobile_pwa_and_six_screens_nav.js', title: 'Điều Hướng 6 Màn Hình Đa Nền Tảng Điện Thoại & Máy Tính' },
    { index: 30, key: 'mod30_master_bootloader', file: 'mod30_master_bootloader_and_integrity_guard.js', title: 'Bộ Khởi Động Tổng Thể & Kiểm Định Toàn Vẹn 30 Module' }
  ]);

  NS.EXPECTED_MODULES_MANIFEST = EXPECTED_30_MODULES_MANIFEST;

  /**
   * Đăng ký một Module vào không gian tên `window.NoirStudio.modules`.
   */
  NS.registerModule = function registerStudioModule(name, instance) {
    if (!name || typeof name !== 'string') return instance;
    const cleanName = name.trim();
    NS.modules[cleanName] = instance;
    NS.logger.info('ModuleRegistry', `Đã đăng ký Module: ${cleanName}`);
    NS.bus.emit(STUDIO_CONSTANTS.EVENTS.MODULE_REGISTERED, {
      name: cleanName,
      registeredAt: Date.now()
    });
    return instance;
  };

  /**
   * Truy xuất một Module đã đăng ký theo tên.
   */
  NS.getModule = function getStudioModule(name) {
    if (!name) return null;
    return NS.modules[name] || null;
  };

  // ==========================================================================
  // PHẦN 8: TRÌNH QUẢN LÝ PHÍM TẮT ĐA NỀN TẢNG (`window.NoirStudio.shortcuts`)
  // ==========================================================================

  /**
   * Quản lý tổ hợp phím tắt bàn phím chuyên nghiệp cho tác giả tiểu thuyết.
   * Tự động quy đổi `Ctrl` trên Windows/Linux và `Command (⌘)` trên macOS.
   */
  class StudioShortcutManager {
    constructor() {
      this.shortcuts = new Map();
      this.enabled = true;
      this._registerBuiltInDefaults();
    }

    /**
     * Chuẩn hóa sự kiện bàn phím thành chuỗi định danh (ví dụ: `CTRL+S`, `CTRL+SHIFT+F`, `F11`).
     */
    normalizeKeyboardEvent(evt) {
      if (!evt || !evt.key) return '';
      const parts = [];
      if (evt.ctrlKey || evt.metaKey) parts.push('CTRL');
      if (evt.altKey) parts.push('ALT');
      if (evt.shiftKey) parts.push('SHIFT');

      const rawKey = String(evt.key).toUpperCase();
      if (rawKey !== 'CONTROL' && rawKey !== 'META' && rawKey !== 'ALT' && rawKey !== 'SHIFT') {
        parts.push(rawKey === ' ' ? 'SPACE' : rawKey);
      }
      return parts.join('+');
    }

    /**
     * Đăng ký một phím tắt mới.
     */
    register(comboString, config) {
      if (!comboString || !config || typeof config.handler !== 'function') return;
      const normalized = String(comboString).trim().toUpperCase();
      this.shortcuts.set(normalized, {
        combo: normalized,
        description: String(config.description || 'Phím tắt thao tác nhanh'),
        category: String(config.category || 'Chung'),
        preventDefault: config.preventDefault !== false,
        allowInInputs: config.allowInInputs !== false,
        handler: config.handler
      });
    }

    /**
     * Khởi tạo bộ danh mục phím tắt mặc định của Studio.
     */
    _registerBuiltInDefaults() {
      this.defaultCatalog = [
        { combo: 'CTRL+S', category: 'Bàn viết & Lưu trữ', description: 'Lưu an toàn 3 lớp ngay lập tức (IndexedDB + Két khẩn cấp + Ổ cứng)' },
        { combo: 'CTRL+Z', category: 'Bàn viết & Lưu trữ', description: 'Hoàn tác bước chỉnh sửa trước đó (Undo)' },
        { combo: 'CTRL+Y', category: 'Bàn viết & Lưu trữ', description: 'Làm lại bước vừa hoàn tác (Redo)' },
        { combo: 'CTRL+F', category: 'Bàn viết & Lưu trữ', description: 'Bật / Tắt thanh Tìm kiếm & Thay thế nhanh trong chương' },
        { combo: 'F11', category: 'Không gian tập trung', description: 'Bật / Tắt chế độ Tập trung toàn màn hình (Zen Mode)' },
        { combo: 'ALT+1', category: 'Điều hướng 6 Màn hình', description: 'Chuyển nhanh sang Tab 1: Bàn Viết Truyện Chính' },
        { combo: 'ALT+2', category: 'Điều hướng 6 Màn hình', description: 'Chuyển nhanh sang Tab 2: Quản Lý Chương & File Nguồn' },
        { combo: 'ALT+3', category: 'Điều hướng 6 Màn hình', description: 'Chuyển nhanh sang Tab 3: Trợ Lý AI & 5 Chế Độ Đầu Ra' },
        { combo: 'ALT+4', category: 'Điều hướng 6 Màn hình', description: 'Chuyển nhanh sang Tab 4: Trung Tâm Story Bible & Nhân Vật' },
        { combo: 'ALT+5', category: 'Điều hướng 6 Màn hình', description: 'Chuyển nhanh sang Tab 5: Nhạc Nền, Pomodoro & Kiểu Chữ' },
        { combo: 'ALT+6', category: 'Điều hướng 6 Màn hình', description: 'Chuyển nhanh sang Tab 6: Kho Phiên Bản, Xuất PDF & Cài Đặt' },
        { combo: 'ESCAPE', category: 'Cửa sổ & Chế độ', description: 'Đóng cửa sổ Modal đang mở hoặc thoát khỏi Zen Mode' }
      ];
    }

    /**
     * Xuất danh sách phím tắt để hiển thị trong Cẩm nang A-Z hoặc Trợ lý Viên Bi Số 8.
     */
    getCheatSheetList() {
      const merged = [];
      const seen = new Set();
      this.shortcuts.forEach((val, key) => {
        seen.add(key);
        merged.push({
          combo: val.combo,
          category: val.category,
          description: val.description
        });
      });
      for (let i = 0; i < this.defaultCatalog.length; i++) {
        const item = this.defaultCatalog[i];
        if (!seen.has(item.combo)) {
          merged.push(item);
        }
      }
      return merged;
    }
  }

  NS.shortcuts = new StudioShortcutManager();

  // ==========================================================================
  // PHẦN 9: BỘ ĐO HIỆU NĂNG & GIÁM SÁT TỐC ĐỘ (`window.NoirStudio.profiler`)
  // ==========================================================================

  class StudioPerformanceProfiler {
    constructor() {
      this.spans = new Map();
      this.completedSpans = [];
      this.maxCompletedSpans = 150;
    }

    /**
     * Bắt đầu đo thời gian thực thi của một tác vụ.
     */
    startSpan(spanName, metadata) {
      const id = String(spanName || 'unnamed_span');
      const now = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
      this.spans.set(id, {
        name: id,
        startTime: now,
        metadata: metadata || null
      });
      return id;
    }

    /**
     * Kết thúc đo thời gian thực thi và trả về số mili-giây.
     */
    endSpan(spanName) {
      const id = String(spanName || 'unnamed_span');
      const active = this.spans.get(id);
      if (!active) return 0;

      const now = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
      const durationMs = Math.max(0, Number((now - active.startTime).toFixed(2)));
      this.spans.delete(id);

      const record = {
        name: id,
        durationMs,
        finishedAt: Date.now(),
        metadata: active.metadata
      };

      this.completedSpans.push(record);
      if (this.completedSpans.length > this.maxCompletedSpans) {
        this.completedSpans.shift();
      }

      return durationMs;
    }

    /**
     * Lấy báo cáo trung bình thời gian chạy các tác vụ trong Studio.
     */
    getPerformanceSummary() {
      const grouped = {};
      for (let i = 0; i < this.completedSpans.length; i++) {
        const sp = this.completedSpans[i];
        if (!grouped[sp.name]) {
          grouped[sp.name] = { count: 0, totalMs: 0, maxMs: 0 };
        }
        const g = grouped[sp.name];
        g.count += 1;
        g.totalMs += sp.durationMs;
        if (sp.durationMs > g.maxMs) {
          g.maxMs = sp.durationMs;
        }
      }

      const summary = {};
      const keys = Object.keys(grouped);
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        const g = grouped[k];
        summary[k] = {
          calls: g.count,
          avgMs: Number((g.totalMs / g.count).toFixed(2)),
          maxMs: g.maxMs
        };
      }
      return summary;
    }
  }

  NS.profiler = new StudioPerformanceProfiler();

  // ==========================================================================
  // PHẦN 10: ĐỒNG BỘ ĐA TAB & CHỐNG GHI ĐÈ (`StudioCrossTabSyncEngine`)
  // ==========================================================================

  /**
   * Quản lý đồng bộ giữa nhiều tab trình duyệt nếu tác giả vô tình mở 2 tab
   * cùng lúc. Sử dụng `BroadcastChannel` kết hợp sự kiện `storage` để thông báo
   * ngay khi có chương mới được lưu hoặc duyệt ở tab khác.
   */
  class StudioCrossTabSyncEngine {
    constructor() {
      this.channelName = 'noir_studio_v38_crosstab_sync_channel';
      this.tabId = 'tab_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
      this.channel = null;
      this.isLeaderTab = true;
      this.knownPeers = new Map();
      this.lastBroadcastAt = 0;
      this._initChannel();
    }

    _initChannel() {
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          this.channel = new BroadcastChannel(this.channelName);
          this.channel.onmessage = (evt) => {
            this._handleIncomingMessage(evt.data);
          };
          this.broadcast('TAB_HELLO', {
            openedAt: Date.now(),
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
          });
        } catch (err) {
          NS.logger.warn('CrossTabSync', 'BroadcastChannel không khả dụng trong môi trường này', err);
        }
      }

      if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('beforeunload', () => {
          this.broadcast('TAB_GOODBYE', { closedAt: Date.now() });
        });
      }
    }

    /**
     * Phát thông điệp đồng bộ sang các tab khác đang mở cùng địa chỉ web.
     */
    broadcast(type, payload) {
      if (!this.channel || !type) return false;
      try {
        const packet = {
          senderTabId: this.tabId,
          type: String(type),
          timestamp: Date.now(),
          payload: payload || {}
        };
        this.channel.postMessage(packet);
        this.lastBroadcastAt = packet.timestamp;
        return true;
      } catch (err) {
        NS.logger.warn('CrossTabSync', `Không thể gửi gói tin [${type}]`, err);
        return false;
      }
    }

    /**
     * Xử lý gói tin nhận được từ một tab khác của Studio.
     */
    _handleIncomingMessage(packet) {
      if (!packet || typeof packet !== 'object') return;
      if (packet.senderTabId === this.tabId) return;

      const sender = String(packet.senderTabId || 'unknown_tab');
      this.knownPeers.set(sender, {
        tabId: sender,
        lastSeenAt: Date.now(),
        lastEventType: packet.type
      });

      if (packet.type === 'TAB_HELLO') {
        this.broadcast('TAB_WELCOME', {
          leaderTabId: this.tabId,
          activeChapterId: NS.state ? NS.state.activeChapterId : null
        });
      } else if (packet.type === 'TAB_GOODBYE') {
        this.knownPeers.delete(sender);
      } else if (packet.type === 'CHAPTER_SAVED_EXTERNAL') {
        NS.bus.emit('crosstab:chapter_saved', packet.payload);
      } else if (packet.type === 'BIBLE_SAVED_EXTERNAL') {
        NS.bus.emit('crosstab:bible_saved', packet.payload);
      }
    }

    /**
     * Trả về số lượng tab khác đang mở cùng lúc.
     */
    getActivePeersCount() {
      const now = Date.now();
      this.knownPeers.forEach((info, key) => {
        if (now - info.lastSeenAt > 120000) {
          this.knownPeers.delete(key);
        }
      });
      return this.knownPeers.size;
    }
  }

  NS.crossTabSync = new StudioCrossTabSyncEngine();

  // ==========================================================================
  // PHẦN 11: TRÌNH NHẬN DIỆN THIẾT BỊ & MÔI TRƯỜNG (`StudioDeviceDetector`)
  // ==========================================================================

  /**
   * Nhận diện chính xác thiết bị đang sử dụng (Điện thoại iOS/Android, Máy tính bảng,
   * Máy tính để bàn, hỗ trợ File System Access API, IndexedDB, WebAudio, Cảm ứng)
   * để tự động tối ưu giao diện 6 màn hình và cơ chế lưu trữ.
   */
  class StudioEnvironmentAndDeviceDetector {
    constructor() {
      this.profile = this.detectAll();
    }

    detectAll() {
      const hasWindow = typeof window !== 'undefined';
      const hasNavigator = typeof navigator !== 'undefined';
      const ua = hasNavigator ? String(navigator.userAgent || '') : '';

      const isIOS = /iPad|iPhone|iPod/.test(ua) ||
        (hasNavigator && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isAndroid = /Android/i.test(ua);
      const isMobileViewport = hasWindow && typeof window.innerWidth === 'number'
        ? window.innerWidth < 1024
        : false;
      const isTouchDevice = hasWindow && (
        'ontouchstart' in window ||
        (hasNavigator && navigator.maxTouchPoints > 0)
      );

      const supportsFileSystemAccess = hasWindow && typeof window.showDirectoryPicker === 'function';
      const supportsIndexedDB = hasWindow && typeof window.indexedDB !== 'undefined';
      const supportsWebAudio = hasWindow && (
        typeof window.AudioContext !== 'undefined' ||
        typeof window.webkitAudioContext !== 'undefined'
      );
      const supportsClipboardAPI = hasNavigator &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === 'function';
      const supportsBroadcastChannel = typeof BroadcastChannel !== 'undefined';

      let osName = 'Desktop OS';
      if (isIOS) osName = 'iOS / iPadOS';
      else if (isAndroid) osName = 'Android';
      else if (/Win/i.test(ua)) osName = 'Windows';
      else if (/Mac/i.test(ua)) osName = 'macOS';
      else if (/Linux/i.test(ua)) osName = 'Linux';

      return {
        osName,
        isIOS,
        isAndroid,
        isMobileOrTablet: isIOS || isAndroid || isMobileViewport,
        isTouchDevice,
        supportsFileSystemAccess,
        supportsIndexedDB,
        supportsWebAudio,
        supportsClipboardAPI,
        supportsBroadcastChannel,
        viewportWidth: hasWindow ? window.innerWidth : 1280,
        viewportHeight: hasWindow ? window.innerHeight : 800,
        devicePixelRatio: hasWindow && window.devicePixelRatio ? window.devicePixelRatio : 1
      };
    }

    refreshViewportMetrics() {
      this.profile = this.detectAll();
      return this.profile;
    }

    isDesktopFileSystemCapable() {
      return Boolean(this.profile && this.profile.supportsFileSystemAccess);
    }
  }

  NS.deviceDetector = new StudioEnvironmentAndDeviceDetector();

  // ==========================================================================
  // PHẦN 12: BỘ KIỂM ĐỊNH VÀ CHUẨN HÓA DỮ LIỆU ĐẦU VÀO (`StudioSchemaValidator`)
  // ==========================================================================

  /**
   * Chuẩn hóa toàn bộ các thực thể dữ liệu (Chương, Nhân vật, Ma trận Ai Biết Gì,
   * Phục bút Chekhov, Mốc chuyển phân cảnh, Bản chụp phiên bản) trước khi lưu vào
   * IndexedDB hoặc kết hợp vào Prompt Tổng Hợp.
   */
  class StudioDataSchemaValidator {
    /**
     * Chuẩn hóa một đối tượng Chương (Chapter Entity).
     */
    normalizeChapterEntity(rawChapter, fallbackIndex) {
      const idx = typeof fallbackIndex === 'number' ? fallbackIndex + 1 : 1;
      const src = rawChapter && typeof rawChapter === 'object' ? rawChapter : {};
      const now = Date.now();

      const id = typeof src.id === 'string' && src.id.trim()
        ? src.id.trim()
        : `chap_${now}_${Math.random().toString(36).slice(2, 7)}`;

      const title = typeof src.title === 'string' && src.title.trim()
        ? src.title.trim()
        : `Chương ${idx}: Chưa đặt tiêu đề`;

      const content = typeof src.content === 'string'
        ? src.content.replace(/\r\n/g, '\n')
        : '';

      const beats = typeof src.beats === 'string'
        ? src.beats.replace(/\r\n/g, '\n')
        : '';

      const status = src.status === 'APPROVED' ? 'APPROVED' : 'DRAFT';

      const createdAt = typeof src.createdAt === 'number' && !Number.isNaN(src.createdAt)
        ? src.createdAt
        : now;

      const updatedAt = typeof src.updatedAt === 'number' && !Number.isNaN(src.updatedAt)
        ? src.updatedAt
        : now;

      const authorNoteTop = typeof src.authorNoteTop === 'string' ? src.authorNoteTop.trim() : '';
      const authorNoteBottom = typeof src.authorNoteBottom === 'string' ? src.authorNoteBottom.trim() : '';

      return {
        id,
        title,
        content,
        beats,
        status,
        createdAt,
        updatedAt,
        authorNoteTop,
        authorNoteBottom
      };
    }

    /**
     * Chuẩn hóa hồ sơ một Nhân vật trong Story Bible (Tab 4).
     */
    normalizeCharacterProfile(rawChar) {
      const src = rawChar && typeof rawChar === 'object' ? rawChar : {};
      return {
        id: typeof src.id === 'string' && src.id.trim()
          ? src.id.trim()
          : `char_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: String(src.name || 'Nhân vật mới').trim(),
        role: String(src.role || 'Nhân vật chính / Phụ').trim(),
        personality: String(src.personality || '').trim(),
        speechStyle: String(src.speechStyle || '').trim(),
        currentStatus: String(src.currentStatus || 'Bình thường').trim(),
        coreMotivation: String(src.coreMotivation || '').trim(),
        hiddenTraumaOrSecret: String(src.hiddenTraumaOrSecret || '').trim(),
        updatedAt: Date.now()
      };
    }

    /**
     * Chuẩn hóa một mục trong Ma trận "Ai Biết Gì" (Knowledge Matrix - Tab 4).
     */
    normalizeKnowledgeMatrixEntry(rawEntry) {
      const src = rawEntry && typeof rawEntry === 'object' ? rawEntry : {};
      return {
        id: typeof src.id === 'string' && src.id.trim()
          ? src.id.trim()
          : `know_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        secretTitle: String(src.secretTitle || src.secret || 'Bí mật cốt truyện').trim(),
        whoKnows: String(src.whoKnows || 'Chỉ tác giả biết').trim(),
        whoDoesNotKnow: String(src.whoDoesNotKnow || 'Các nhân vật khác').trim(),
        revealCondition: String(src.revealCondition || 'Chưa tiết lộ').trim(),
        updatedAt: Date.now()
      };
    }

    /**
     * Chuẩn hóa một mục trong Sổ cái Phục bút & Manh mối (Chekhov's Gun - Tab 4).
     */
    normalizeClueLedgerEntry(rawClue) {
      const src = rawClue && typeof rawClue === 'object' ? rawClue : {};
      const validStates = ['PLANTED', 'DEVELOPING', 'RESOLVED'];
      const status = validStates.includes(src.status) ? src.status : 'PLANTED';
      return {
        id: typeof src.id === 'string' && src.id.trim()
          ? src.id.trim()
          : `clue_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        clueName: String(src.clueName || src.title || 'Phục bút mới').trim(),
        plantedInChapter: String(src.plantedInChapter || 'Chương hiện tại').trim(),
        intendedPayoff: String(src.intendedPayoff || '').trim(),
        status,
        updatedAt: Date.now()
      };
    }

    /**
     * Chuẩn hóa một Mốc chuyển phân cảnh / đổi góc nhìn POV (Scene Marker).
     */
    normalizeSceneMarker(rawMarker, indexNumber) {
      const src = rawMarker && typeof rawMarker === 'object' ? rawMarker : {};
      const idx = typeof indexNumber === 'number' ? indexNumber + 1 : 1;
      return {
        id: typeof src.id === 'string' && src.id.trim()
          ? src.id.trim()
          : `scene_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        order: idx,
        pov: String(src.pov || 'Ngôi thứ 3 giới hạn').trim(),
        time: String(src.time || 'Tiếp nối cảnh trước').trim(),
        location: String(src.location || 'Bối cảnh hiện tại').trim(),
        goal: String(src.goal || '').trim(),
        chapterId: src.chapterId || (NS.state ? NS.state.activeChapterId : null),
        createdAt: typeof src.createdAt === 'number' ? src.createdAt : Date.now()
      };
    }
  }

  NS.schemaValidator = new StudioDataSchemaValidator();

  // ==========================================================================
  // PHẦN 13: DANH MỤC KHUÔN MẪU THỂ LOẠI TIỂU THUYẾT (`StudioGenreCatalog`)
  // ==========================================================================

  /**
   * Kho thiết lập sẵn các Khuôn mẫu Thể loại Tiểu thuyết (Genre Archetypes)
   * hỗ trợ người viết khởi tạo nhanh khung Story Bible, giọng văn, nhiệt độ AI
   * và bộ quy tắc thẩm mỹ văn học đặc trưng.
   */
  const LITERARY_GENRE_ARCHETYPE_CATALOG = Object.freeze({
    NOIR_PSYCHOLOGICAL_THRILLER: {
      id: 'NOIR_PSYCHOLOGICAL_THRILLER',
      name: '🕵️ Trinh Thám Tâm Lý & Noir Đô Thị',
      recommendedTemperature: 0.8,
      recommendedTargetWords: 3800,
      defaultPov: 'Ngôi thứ 3 giới hạn (Bám sát tâm lý nhân vật chính)',
      stylisticRules: [
        'Ưu tiên miêu tả chi tiết hiện trường qua góc nhìn chủ quan, ánh sáng tương phản (bóng tối, đèn đường, khói thuốc, mưa đêm).',
        'Độc thoại nội tâm sắc lạnh, lý tính nhưng ẩn chứa vết thương quá khứ chưa lành.',
        'Mọi manh mối đưa ra phải tuân thủ chặt chẽ Ma trận Ai Biết Gì — nhân vật không được suy luận từ thông tin mà họ chưa từng tiếp xúc.',
        'Đối thoại ngắn gọn, nhiều hàm ý ngầm (Subtext), sử dụng định dạng: - Câu thoại (Tên nhân vật).'
      ],
      bibleTemplatePreset: [
        '# 🏛️ KHUNG STORY BIBLE: TRINH THÁM TÂM LÝ & NOIR ĐÔ THỊ',
        '',
        '## 1. BỐI CẢNH ĐÔ THỊ & BẦU KHÔNG KHÍ',
        '- Thành phố / Khu vực trọng điểm:',
        '- Thời tiết & Ánh sáng chủ đạo (Mưa đêm, sương mù, đèn neon):',
        '- Các tầng lớp xã hội & Góc khuất pháp lý:',
        '',
        '## 2. HỒ SƠ VỤ ÁN / BÍ ẨN TRUNG TÂM',
        '- Sự kiện khởi phát (Nạn nhân, Thời gian tử vong / Mất tích, Hiện trường):',
        '- Danh sách nghi phạm & Động cơ bề nổi:',
        '- Sự thật ngầm định (Chỉ tác giả biết):',
        '',
        '## 3. QUY TẮC LOGIC TRINH THÁM BẤT KHẢ XÂM PHẠM',
        '- Nhân vật chỉ biết những gì họ tận mắt thấy hoặc nghe được.',
        '- Không có sự trùng hợp ngẫu nhiên giải quyết vụ án (No Deus Ex Machina).',
        '- Mọi câu thoại tuân thủ định dạng: - Câu thoại (Tên nhân vật)'
      ].join('\n')
    },

    VIETNAMESE_FOLK_HORROR_MYSTERY: {
      id: 'VIETNAMESE_FOLK_HORROR_MYSTERY',
      name: '🏮 Kinh Dị Dân Gian & Linh Dị Cổ Truyền Việt Nam',
      recommendedTemperature: 0.85,
      recommendedTargetWords: 3600,
      defaultPov: 'Ngôi thứ 1 ("Tôi") hoặc Ngôi thứ 3 giới hạn',
      stylisticRules: [
        'Sử dụng chất liệu văn hóa bản địa Việt Nam chân thực: mái đình, cây đa, bến nước, tiếng mõ đêm, hương trầm, đèn dầu, tục lệ cổ.',
        'Gợi nỗi sợ từ sự tĩnh lặng, âm thanh vọng lại trong sương và những quy tắc kiêng kỵ truyền đời trong làng cổ.',
        'Tránh lạm dụng máu me rẻ tiền; tập trung vào bầu không khí lạnh lẽo và sự nghi kỵ giữa người với người.',
        'Chuẩn hóa hội thoại: - Câu thoại (Tên nhân vật).'
      ],
      bibleTemplatePreset: [
        '# 🏛️ KHUNG STORY BIBLE: KINH DỊ DÂN GIAN & LINH DỊ VIỆT NAM',
        '',
        '## 1. ĐỊA LÝ LÀNG CỔ & TRUYỀN THUYẾT ĐỊA PHƯƠNG',
        '- Tên làng / Vùng núi / Miếu cổ:',
        '- Lịch sử hình thành & Biến cố trăm năm trước:',
        '- Các địa điểm cấm địa trong làng:',
        '',
        '## 2. HỆ THỐNG KIÊNG KỴ & LUẬT LỆ DÂN GIAN',
        '- Những điều dân làng tuyệt đối không được làm sau giờ Hợi:',
        '- Hệ quả tâm linh / tâm lý khi phá vỡ lời thề cổ:',
        '',
        '## 3. DÒNG THỜI GIAN SỰ KIỆN & NHÂN VẬT',
        '- Lý do nhân vật chính đặt chân đến vùng đất này:',
        '- Những hiện tượng kỳ lạ đã xảy ra theo từng đêm:'
      ].join('\n')
    },

    LIGHT_NOVEL_FANTASY_ACADEMY: {
      id: 'LIGHT_NOVEL_FANTASY_ACADEMY',
      name: '⚔️ Light Novel Kỳ Ảo, Học Viện & Phiêu Lưu',
      recommendedTemperature: 0.9,
      recommendedTargetWords: 3500,
      defaultPov: 'Ngôi thứ 1 hoặc Ngôi thứ 3 giới hạn giàu nhịp điệu',
      stylisticRules: [
        'Nhịp văn linh hoạt, kết hợp hài hòa giữa các phân cảnh chiến đấu tốc độ cao và những đoạn tương tác đời thường sinh động giữa các nhân vật.',
        'Hệ thống ma thuật / kỹ năng phải có giới hạn năng lượng (Mana/Thể lực) và cái giá phải trả rõ ràng.',
        'Mỗi nhân vật có giọng điệu đối thoại đặc trưng, dễ phân biệt ngay cả khi đọc nhanh.',
        'Chuẩn hóa hội thoại: - Câu thoại (Tên nhân vật).'
      ],
      bibleTemplatePreset: [
        '# 🏛️ KHUNG STORY BIBLE: LIGHT NOVEL KỲ ẢO & PHIÊU LƯU',
        '',
        '## 1. THẾ GIỚI QUAN & HỆ THỐNG SỨC MẠNH',
        '- Lục địa / Học viện / Thành bang chính:',
        '- Phân cấp bậc sức mạnh & Giới hạn đánh đổi:',
        '- Các chủng tộc / Phe phái đối lập:',
        '',
        '## 2. NHÓM NHÂN VẬT ĐỒNG HÀNH (PARTY)',
        '- Vai trò chiến đấu & Tính cách tương phản:',
        '- Mục tiêu chung của cả nhóm trong Arc hiện tại:',
        '',
        '## 3. LỊCH TRÌNH SỰ KIỆN & BOSS / THỬ THÁCH',
        '- Các cột mốc đã vượt qua:',
        '- Bí mật về di tích cổ / Kẻ đứng sau màn:'
      ].join('\n')
    },

    XIANXIA_ANCIENT_WUXIA: {
      id: 'XIANXIA_ANCIENT_WUXIA',
      name: '🏔️ Huyền Huyễn Cổ Phong, Tiên Hiệp & Kiếm Hiệp',
      recommendedTemperature: 0.85,
      recommendedTargetWords: 4000,
      defaultPov: 'Ngôi thứ 3 giới hạn',
      stylisticRules: [
        'Ngôn từ trang trọng, giàu hình ảnh cổ phong (non cao, mây trắng, tiếng đàn, ánh kiếm, đạo tâm) nhưng mạch lạc, dễ hiểu, không lạm dụng từ Hán Việt tối nghĩa.',
        'Trọng tâm nằm ở nhân quả, sự lựa chọn đạo tâm của nhân vật khi đứng trước ân oán và cơ duyên.',
        'Hệ thống cảnh giới tu luyện phải nhất quán tuyệt đối từ đầu đến cuối bộ truyện.',
        'Chuẩn hóa hội thoại: - Câu thoại (Tên nhân vật).'
      ],
      bibleTemplatePreset: [
        '# 🏛️ KHUNG STORY BIBLE: HUYỀN HUYỄN CỔ PHONG & TIÊN HIỆP',
        '',
        '## 1. CẢNH GIỚI TU LUYỆN & QUY LUẬT THIÊN ĐỊA',
        '- Hệ thống cảnh giới từ thấp đến cao:',
        '- Pháp bảo, Công pháp & Đan dược đặc thù:',
        '',
        '## 2. BẢN ĐỒ THẾ LỰC & TÔNG MÔN',
        '- Chính đạo / Ma đạo / Thế gia ẩn thế:',
        '- Ân oán lịch sử giữa các tông môn:',
        '',
        '## 3. HÀNH TRÌNH ĐẠO TÂM CỦA NHÂN VẬT CHÍNH',
        '- Cảnh giới hiện tại & Pháp bảo đang sở hữu:',
        '- Nhân quả chưa giải quyết:'
      ].join('\n')
    },

    MODERN_SLICE_OF_LIFE_ROMANCE: {
      id: 'MODERN_SLICE_OF_LIFE_ROMANCE',
      name: '☕ Đô Thị Đời Thường, Tâm Lý Chữa Lành & Lãng Mạn',
      recommendedTemperature: 0.85,
      recommendedTargetWords: 3400,
      defaultPov: 'Ngôi thứ 3 giới hạn hoặc Ngôi thứ 1 giàu cảm xúc',
      stylisticRules: [
        'Tập trung vào những rung động tinh tế, cử chỉ nhỏ nhặt đời thường (tiếng muỗng chạm ly sứ, ánh nắng chiều qua rèm cửa, mùi mưa đầu mùa).',
        'Tránh kịch tính hóa khiên cưỡng; để cảm xúc nhân vật phát triển tự nhiên qua đối thoại và sự đồng cảm.',
        'Ngôn từ trong sáng, giàu chất thơ và chiều sâu chiêm nghiệm.',
        'Chuẩn hóa hội thoại: - Câu thoại (Tên nhân vật).'
      ],
      bibleTemplatePreset: [
        '# 🏛️ KHUNG STORY BIBLE: ĐÔ THỊ CHỮA LÀNH & TÂM LÝ TÌNH CẢM',
        '',
        '## 1. KHÔNG GIAN SỐNG & NHỊP ĐIỆU ĐỜI THƯỜNG',
        '- Thành phố, Quán nhỏ, Khu phố hoặc Nơi làm việc:',
        '- Mùa trong năm & Sắc thái cảm xúc chủ đạo:',
        '',
        '## 2. CHIỀU SÂU TÂM LÝ HAI NHÂN VẬT CHÍNH',
        '- Vết thương lòng trong quá khứ / Áp lực cuộc sống hiện tại:',
        '- Cách hai nhân vật dần mở lòng và chữa lành cho nhau:',
        '',
        '## 3. CÁC CỘT MỐC PHÁT TRIỂN QUAN HỆ',
        '- Lần gặp gỡ đầu tiên:',
        '- Những kỷ niệm chung đã hình thành:'
      ].join('\n')
    },

    SCI_FI_CYBERPUNK_DYSTOPIA: {
      id: 'SCI_FI_CYBERPUNK_DYSTOPIA',
      name: '🌌 Khoa Huyễn Cyberpunk, Tương Lai & Trí Tuệ Nhân Tạo',
      recommendedTemperature: 0.8,
      recommendedTargetWords: 3800,
      defaultPov: 'Ngôi thứ 3 giới hạn',
      stylisticRules: [
        'Kết hợp miêu tả công nghệ cao (mạng thần kinh, cấy ghép sinh học, đô thị tầng ngầm, mưa axit) với triết lý về bản sắc con người và ký ức.',
        'Hệ thống công nghệ phải có quy칙 vật lý/logic nội tại rõ ràng.',
        'Chuẩn hóa hội thoại: - Câu thoại (Tên nhân vật).'
      ],
      bibleTemplatePreset: [
        '# 🏛️ KHUNG STORY BIBLE: KHOA HUYỄN CYBERPUNK & TƯƠNG LAI',
        '',
        '## 1. NỀN VĂN MINH & CẤU TRÚC ĐẠI ĐÔ THỊ',
        '- Năm / Kỷ nguyên tương lai:',
        '- Tập đoàn thống trị (Mega-Corporations) & Khu ổ chuột tầng đáy:',
        '',
        '## 2. QUY TẮC CÔNG NGHỆ & GIỚI HẠN SINH HỌC',
        '- Công nghệ cấy ghép / Mạng ý thức / AI:',
        '- Rủi ro quá tải thần kinh hoặc đánh mất ký ức gốc:',
        '',
        '## 3. NHIỆM VỤ & ÂM MƯU TRUNG TÂM',
        '- Dữ liệu mật đang bị săn lùng:',
        '- Sự thật đằng sau hệ thống điều khiển trung tâm:'
      ].join('\n')
    }
  });

  NS.genreCatalog = LITERARY_GENRE_ARCHETYPE_CATALOG;

  // ==========================================================================
  // PHẦN 14: BỘ QUẢN LÝ LỆNH TÁC VỤ & MACRO (`StudioCommandMacroEngine`)
  // ==========================================================================

  /**
   * Hỗ trợ thực thi chuỗi thao tác tự động (Macros) dành cho tác giả tiểu thuyết:
   * ví dụ "Chuẩn hóa văn bản + Quét từ sáo rỗng + Lưu tự động + Tạo mốc phiên bản".
   */
  class StudioCommandMacroEngine {
    constructor() {
      this.macros = new Map();
      this.executionLog = [];
      this._registerDefaultMacros();
    }

    registerMacro(macroId, definition) {
      if (!macroId || !definition || typeof definition.execute !== 'function') return;
      this.macros.set(String(macroId).trim(), {
        id: String(macroId).trim(),
        title: String(definition.title || macroId),
        description: String(definition.description || ''),
        stepsDescription: Array.isArray(definition.stepsDescription) ? definition.stepsDescription : [],
        execute: definition.execute
      });
    }

    async runMacro(macroId, contextPayload) {
      const id = String(macroId || '').trim();
      const macro = this.macros.get(id);
      if (!macro) {
        throw new Error(`Không tìm thấy Macro [${id}]`);
      }

      NS.profiler.startSpan(`macro:${id}`);
      try {
        const result = await Promise.resolve(macro.execute(contextPayload || {}));
        const elapsedMs = NS.profiler.endSpan(`macro:${id}`);
        this.executionLog.push({
          macroId: id,
          executedAt: Date.now(),
          elapsedMs,
          success: true
        });
        if (this.executionLog.length > 80) {
          this.executionLog.shift();
        }
        return result;
      } catch (err) {
        NS.profiler.endSpan(`macro:${id}`);
        this.executionLog.push({
          macroId: id,
          executedAt: Date.now(),
          success: false,
          errorMessage: err && err.message ? err.message : String(err)
        });
        NS.logger.error('MacroEngine', `Lỗi khi chạy Macro [${id}]`, err);
        throw err;
      }
    }

    _registerDefaultMacros() {
      this.registerMacro('MACRO_POLISH_AND_SNAPSHOT', {
        title: '✨ Chuẩn Hóa Hội Thoại + Lưu 3 Lớp + Chụp Phiên Bản',
        description: 'Tự động chuẩn hóa toàn bộ câu thoại về dạng "- Câu thoại (Tên nhân vật)", lưu an toàn 3 lớp và tạo mốc phiên bản mới.',
        stepsDescription: [
          'Bước 1: Chuẩn hóa dấu câu và định dạng hội thoại tiểu thuyết',
          'Bước 2: Lưu bản thảo vào IndexedDB, Két khẩn cấp và Ổ cứng',
          'Bước 3: Tạo bản chụp nhanh trong Kho lưu trữ phiên bản Tab 6'
        ],
        execute: async () => {
          if (NS.dialogueTools && typeof NS.dialogueTools.normalizeActiveManuscriptDialogue === 'function') {
            NS.dialogueTools.normalizeActiveManuscriptDialogue();
          }
          if (NS.autosave && typeof NS.autosave.saveNow === 'function') {
            await NS.autosave.saveNow(true);
          }
          if (NS.versionVault && typeof NS.versionVault.createSnapshot === 'function') {
            await NS.versionVault.createSnapshot('📸 Bản lưu sau khi Chuẩn hóa Hội thoại');
          }
          return { ok: true };
        }
      });

      this.registerMacro('MACRO_FULL_SAFETY_BACKUP', {
        title: '🛡️ Sao Lưu Khẩn Cấp Toàn Diện Dự Án',
        description: 'Kiểm định toàn vẹn trạng thái, lưu 3 lớp, tạo mốc phiên bản và đồng bộ toàn bộ 6 thư mục ổ cứng.',
        stepsDescription: [
          'Bước 1: Kiểm tra và tự phục hồi cấu trúc dữ liệu trạng thái',
          'Bước 2: Lưu đồng bộ toàn bộ chương và Story Bible',
          'Bước 3: Ghi file thật vào 6 thư mục trên ổ cứng máy tính (nếu đã kết nối)'
        ],
        execute: async () => {
          NS.stateGuardian.validateAndHealState();
          if (NS.autosave && typeof NS.autosave.saveNow === 'function') {
            await NS.autosave.saveNow(true);
          }
          if (NS.fsEngine && typeof NS.fsEngine.syncAllWorkspaceToDisk === 'function') {
            await NS.fsEngine.syncAllWorkspaceToDisk();
          }
          return { ok: true };
        }
      });
    }

    listMacros() {
      const list = [];
      this.macros.forEach((m) => {
        list.push({
          id: m.id,
          title: m.title,
          description: m.description,
          stepsDescription: m.stepsDescription
        });
      });
      return list;
    }
  }

  NS.macroEngine = new StudioCommandMacroEngine();

  // ==========================================================================
  // PHẦN 15: LÁ CHẮN BẮT LỖI TOÀN CỤC & TỰ ĐỘNG BẢO VỆ BẢN THẢO (`ErrorBoundary`)
  // ==========================================================================

  /**
   * Bắt mọi lỗi ngoại lệ chưa được xử lý (`window.onerror` và `unhandledrejection`)
   * để đảm bảo giao diện soạn thảo của người dùng không bao giờ bị đơ trắng màn hình,
   * đồng thời kích hoạt ghi khẩn cấp nội dung đang gõ vào LocalStorage.
   */
  class StudioGlobalErrorBoundary {
    constructor() {
      this.caughtErrors = [];
      this.maxRecordedErrors = 50;
      this.installed = false;
    }

    install() {
      if (this.installed || typeof window === 'undefined') return;
      this.installed = true;

      window.addEventListener('error', (event) => {
        this._recordAndProtect('WINDOW_ERROR', {
          message: event.message || 'Lỗi thực thi JavaScript',
          filename: event.filename || '',
          lineno: event.lineno || 0,
          colno: event.colno || 0
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason;
        this._recordAndProtect('UNHANDLED_PROMISE_REJECTION', {
          message: reason && reason.message ? reason.message : String(reason || 'Promise rejected')
        });
      });
    }

    _recordAndProtect(errorType, details) {
      const entry = {
        type: errorType,
        details,
        timestamp: Date.now(),
        activeScreen: NS.state ? NS.state.activeScreen : 'UNKNOWN',
        activeChapterId: NS.state ? NS.state.activeChapterId : null
      };

      this.caughtErrors.push(entry);
      if (this.caughtErrors.length > this.maxRecordedErrors) {
        this.caughtErrors.shift();
      }

      NS.logger.error('ErrorBoundary', `Đã chặn lỗi toàn cục [${errorType}]`, details);

      // Bảo vệ khẩn cấp nội dung đang gõ trong khung soạn thảo chính nếu có
      try {
        if (typeof document !== 'undefined' && typeof localStorage !== 'undefined') {
          const editorEl = document.getElementById('textarea-chapter-content');
          const titleEl = document.getElementById('input-chapter-title');
          if (editorEl && editorEl.value && editorEl.value.trim().length > 0) {
            const emergencyBackup = {
              savedAt: Date.now(),
              reason: errorType,
              chapterId: NS.state ? NS.state.activeChapterId : null,
              chapterTitle: titleEl ? titleEl.value : 'Bản thảo khẩn cấp',
              content: editorEl.value
            };
            localStorage.setItem('noir_crash_shield_last_editor_backup', JSON.stringify(emergencyBackup));
          }
        }
      } catch (_) {}
    }

    getErrorHistory() {
      return this.caughtErrors.slice();
    }
  }

  NS.errorBoundary = new StudioGlobalErrorBoundary();
  NS.errorBoundary.install();

  // ==========================================================================
  // PHẦN 16: BỘ TIỆN ÍCH CẤU HÌNH NHANH & TRẠNG THÁI HỆ THỐNG (`KernelHelper`)
  // ==========================================================================

  /**
   * Cung cấp các phương thức kiểm tra sức khỏe toàn diện cho 30 Module.
   */
  const coreKernelModuleInstance = {
    name: 'mod01_core_kernel',
    version: STUDIO_CONSTANTS.VERSION,
    constants: STUDIO_CONSTANTS,
    state: NS.state,
    stateGuardian: NS.stateGuardian,
    bus: NS.bus,
    mutex: NS.mutex,
    domBinder: NS.domBinder,
    shortcuts: NS.shortcuts,
    profiler: NS.profiler,
    logger: NS.logger,
    crossTabSync: NS.crossTabSync,
    deviceDetector: NS.deviceDetector,
    schemaValidator: NS.schemaValidator,
    macroEngine: NS.macroEngine,
    errorBoundary: NS.errorBoundary,

    /**
     * Chạy kiểm định sức khỏe của Module 01 và trả về báo cáo chi tiết.
     */
    runHealthCheck() {
      const stateValidation = NS.stateGuardian.validateAndHealState();
      const busDiag = NS.bus.getDiagnosticsSummary();
      const mutexStats = NS.mutex.getStats();
      const domReport = NS.domBinder.getReport();
      const deviceProfile = NS.deviceDetector.refreshViewportMetrics();

      return {
        module: 'mod01_core_kernel_and_event_bus.js',
        version: STUDIO_CONSTANTS.VERSION,
        healthy: true,
        stateValidation,
        busDiag,
        mutexStats,
        domReport,
        deviceProfile,
        registeredModulesCount: Object.keys(NS.modules || {}).length
      };
    }
  };

  NS.registerModule('mod01_core_kernel', coreKernelModuleInstance);
  NS.bus.emit(STUDIO_CONSTANTS.EVENTS.KERNEL_READY, {
    version: STUDIO_CONSTANTS.VERSION,
    timestamp: Date.now()
  });

})(typeof window !== 'undefined' ? window : globalThis);
