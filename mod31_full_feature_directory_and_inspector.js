/**
 * ============================================================================
 * NOIR STUDIO v39.0 — MODULE 31: BÁCH KHOA TOÀN THƯ TÍNH NĂNG, HƯỚNG DẪN A-Z
 * & TRẠM ĐIỀU HƯỚNG THÔNG MINH (TÍCH HỢP TẠI ĐẦU TAB 6)
 * ============================================================================
 * Nhiệm vụ:
 *  - Tổng hợp 100% tính năng, nút bấm, quy trình viết tiểu thuyết, mẹo chống AI
 *    quên cốt truyện với NotebookLM, xuất sách PDF / Word OOXML .DOCX chuẩn
 *    chỉnh và bộ phím tắt vào một Bách Khoa Toàn Thư trực quan ngay đầu Tab 6.
 *  - Cho phép người dùng tìm kiếm tức thì theo từ khóa hoặc lọc theo 8 phân khu
 *    (Cổng API/Thư mục, Tab 1..6, Thanh Nổi & Mascot Bi Số 8).
 *  - Cung cấp nút "Đi tới & Làm nổi bật ngay" trên từng thẻ hướng dẫn: tự động
 *    chuyển đúng Tab, mở bung thẻ đang thu gọn, cuộn mượt tới vị trí nút bấm
 *    và phát sáng viền spotlight giúp nhìn thấy ngay lập tức.
 *  - Bao gồm 4 phân mục tương tác:
 *      (1) Bách Khoa Tính Năng A-Z (Tìm kiếm + Lọc + Đi tới & Phát sáng)
 *      (2) 6 Quy Trình Thực Chiến Từ Lúc Mới Mở Web Tới Lúc Xuất Sách
 *      (3) Bảng Phím Tắt, Thao Tác Điện Thoại & Trung Tâm Xử Lý Sự Cố
 *      (4) Trạng Thái Hệ Thống Live & Kiến Trúc 31 Module Thuần Khiết
 * ============================================================================
 */
(function initMod31FullFeatureDirectoryAndInspector(globalScope) {
  'use strict';

  const NS = (globalScope.NoirStudio = globalScope.NoirStudio || {});

  const DIRECTORY_CATEGORY_FILTERS = Object.freeze([
    {
      id: 'ALL',
      label: 'Tất cả tính năng',
      shortLabel: 'Tất cả',
      badgeColor: 'emerald',
      description: 'Hiển thị toàn bộ chức năng xuyên suốt Studio',
    },
    {
      id: 'GATE',
      label: 'Cổng Kết Nối & Lưu Trữ',
      shortLabel: 'Cổng API & Thư mục',
      badgeColor: 'amber',
      description: 'Xác thực Gemini Flash-Lite, ghi nhớ Cookie/IndexedDB và đồng bộ ổ cứng',
    },
    {
      id: 'TAB1',
      label: 'Tab 1: Bàn Viết Truyện',
      shortLabel: 'Tab 1 (Bàn viết)',
      badgeColor: 'emerald',
      description: 'Soạn thảo chuẩn sách, AI Diff Google Docs, Lore Whisper & Từ điển Ngũ quan',
    },
    {
      id: 'TAB2',
      label: 'Tab 2: Chương & Nguồn',
      shortLabel: 'Tab 2 (Chương)',
      badgeColor: 'sky',
      description: 'Cây chương 2 chiều, nạp DOCX/PDF/TXT, tra cứu BM25 0 Token & làm sạch thoại',
    },
    {
      id: 'TAB3',
      label: 'Tab 3: Trợ Lý AI & 5 Chế Độ',
      shortLabel: 'Tab 3 (AI 5 Chế Độ)',
      badgeColor: 'indigo',
      description: 'Mô hình thật, Mức tư duy Thấp/Trung/Cao, Hạn mức 5h/Tuần, Enter chạy lệnh & Mode 5',
    },
    {
      id: 'TAB4',
      label: 'Tab 4: Story Bible & NotebookLM',
      shortLabel: 'Tab 4 (Story Bible)',
      badgeColor: 'pink',
      description: 'Cập nhật lũy tiến Ch.1..cuối, Cẩm nang NotebookLM truyện dài & Ma trận nhân vật',
    },
    {
      id: 'TAB5',
      label: 'Tab 5: Nhạc, Pomodoro & Nền',
      shortLabel: 'Tab 5 (Âm & Nền)',
      badgeColor: 'orange',
      description: 'Mưa trên kính, 6 Tranh thủy mặc, Ảnh/Video cá nhân, MP3 lặp A-B & Pomodoro 2 chiều',
    },
    {
      id: 'TAB6',
      label: 'Tab 6: Phiên Bản & Xuất Sách',
      shortLabel: 'Tab 6 (Xuất & Kho)',
      badgeColor: 'cyan',
      description: 'Time-Machine Preview, Xuất .DOCX OOXML thật, Xuất .PDF chuẩn bìa 1 trang & Video A-Z',
    },
    {
      id: 'FLOATING',
      label: 'Thanh Nổi & Bé Bi Số 8',
      shortLabel: 'Thanh nổi & Bi #8',
      badgeColor: 'violet',
      description: '3 thanh thu gọn kéo thả tự do, Bi Số 8 2 chế độ tách biệt & Deep-link phát sáng',
    },
  ]);

  const FULL_FEATURE_ENCYCLOPEDIA_CATALOG = Object.freeze([
    // ========================================================================
    // PHÂN KHU 1: CỔNG KẾT NỐI AN TOÀN & LƯU TRỮ Ổ CỨNG
    // ========================================================================
    {
      id: 'FEAT_GATE_GOOGLE_STUDIO',
      category: 'GATE',
      categoryLabel: 'Cổng Kết Nối & Lưu Trữ',
      title: 'Cổng Xác Thực Gemini API Key Qua Flash-Lite & Link AI Studio 1-Click',
      badge: 'Bắt buộc trước khi vào',
      moduleRef: 'Mod 15 & Mod 30',
      summary:
        'Bảo vệ trải nghiệm viết bằng màn hình kiểm tra trước khi vào Studio: bấm 1 nút mở thẳng Google AI Studio để lấy Key, dán Key vào để mô hình Flash-Lite nhẹ nhất tự kiểm tra tính hợp lệ thời gian thực.',
      whenToUse:
        'Mỗi lần mở web lần đầu tiên, khi đổi tài khoản Google AI Studio mới hoặc khi vừa quay lại trình duyệt để rà soát nhanh trạng thái Key trước lúc sáng tác.',
      stepByStep: [
        'Bấm nút "Mở Google AI Studio Để Copy API Key Ngay" để lấy khóa AIza... hoặc AQ... từ tài khoản Google của bạn.',
        'Dán khóa vào ô nhập liệu; hệ thống tự động gọi mô hình Flash-Lite nhẹ nhất để kiểm tra sống-chết mà không tốn đáng kể hạn mức.',
        'Nếu trước đó bạn đã lưu Key và Thư mục, Cổng kết nối vẫn hiện lại ngắn gọn để bạn rà soát và bấm nút xanh lá vào Studio.',
      ],
      proTip:
        'Bạn có thể mở lại Cổng kết nối bất kỳ lúc nào ngay trong Tab 6 bằng nút "Kiểm Tra / Đổi Key & Thư Mục Kết Nối" để thay Key mới mà không cần tải lại trang.',
      relatedIds: ['FEAT_GATE_DISK_FOLDER', 'FEAT_TAB3_QUOTA_MONITOR'],
      screenKey: 'SCREEN_6_SYSTEM',
      expandCollapseIds: [],
      targetDomId: 'btn-s6-open-connection-gate',
      actionLabel: 'Mở Cổng / Kiểm Tra Key & Thư Mục',
    },
    {
      id: 'FEAT_GATE_DISK_FOLDER',
      category: 'GATE',
      categoryLabel: 'Cổng Kết Nối & Lưu Trữ',
      title: 'Chọn & Ghi Nhớ Thư Mục Làm Việc Trên Ổ Cứng (Hỗ Trợ Cả PC Lẫn Điện Thoại)',
      badge: 'An toàn dữ liệu',
      moduleRef: 'Mod 05 & Mod 30',
      summary:
        'Kết nối trực tiếp một thư mục thật trên ổ cứng máy tính (qua File System Access API) để tự động sinh 6 thư mục con lưu bản thảo thô, chương đã duyệt, Story Bible và snapshot JSON. Tự động ghi nhớ bằng IndexedDB + Cookie.',
      whenToUse:
        'Ngay ở Cổng kết nối đầu tiên hoặc khi chuyển sang máy tính / ổ đĩa khác muốn sao lưu bản thảo dạng file thật dễ mở bằng Notepad/Word.',
      stepByStep: [
        'Trên máy tính Chrome/Edge, bấm "Chọn Thư Mục Làm Việc Trên Máy Tính" và cấp quyền cho thư mục truyện của bạn.',
        'Trên điện thoại hoặc trình duyệt không hỗ trợ File System Picker, chọn hộp thoại dự phòng đặt tên không gian làm việc hoặc chọn thư mục webkitdirectory.',
        'Từ lần truy cập thứ 2 trở đi, bấm "Kết nối lại thư mục đã nhớ" hoặc trình duyệt tự khôi phục nhanh chỉ bằng 1 lần chạm.',
      ],
      proTip:
        'Nên trỏ vào một thư mục riêng ví dụ D:\\TieuThuyetCuaBi thay vì thư mục Windows/System để trình duyệt cấp quyền ghi mượt mà nhất.',
      relatedIds: ['FEAT_GATE_ENTER_BUTTON', 'FEAT_TAB6_JSON_BACKUP'],
      screenKey: 'SCREEN_6_SYSTEM',
      expandCollapseIds: [],
      targetDomId: 'btn-connect-local-folder',
      actionLabel: 'Đi tới nút Kết Nối Ổ Cứng',
    },
    {
      id: 'FEAT_GATE_ENTER_BUTTON',
      category: 'GATE',
      categoryLabel: 'Cổng Kết Nối & Lưu Trữ',
      title: 'Nút "Vào Không Gian Viết Tiểu Thuyết" Đổi Màu Đỏ Khóa -> Xanh Lá Nhấp Nháy',
      badge: 'Trạng thái trực quan',
      moduleRef: 'Mod 30',
      summary:
        'Thay thế nút xám gây hiểu nhầm trước đây: nút sẽ giữ màu Đỏ Khóa cứng (không thể bấm vào web) chừng nào thiếu Key, chưa verify Flash-Lite hoặc chưa chọn Thư mục; chỉ khi hoàn tất cả 2 điều kiện mới chuyển Xanh Lá Đậm nhấp nhô mượt.',
      whenToUse:
        'Khi đứng tại Cổng kết nối đầu vào và muốn biết chắc chắn 100% cả API Key lẫn Thư mục làm việc đã sẵn sàng hay còn thiếu bước nào.',
      stepByStep: [
        'Quan sát 3 huy hiệu kiểm tra: (1) Đã nhập Key, (2) Đã verify Flash-Lite, (3) Đã chọn Thư mục ổ cứng.',
        'Chừng nào còn 1 tiêu chí chưa xanh, nút vào Studio giữ sắc Đỏ cảnh báo kèm dòng nhắc còn thiếu mục nào.',
        'Ngay khi đủ 3 tick xanh, nút bừng sáng Xanh Lá nhấp nháy nhẹ — bấm vào để bước vào Tab 1 viết truyện.',
      ],
      proTip:
        'Nếu bạn đang mở từ trình duyệt điện thoại chế độ ẩn danh, hãy lưu ý cấp lại tên thư mục để nút chuyển xanh nhé.',
      relatedIds: ['FEAT_GATE_GOOGLE_STUDIO', 'FEAT_GATE_DISK_FOLDER'],
      screenKey: 'SCREEN_6_SYSTEM',
      expandCollapseIds: [],
      targetDomId: 'btn-s6-open-connection-gate',
      actionLabel: 'Xem lại Cổng Kết Nối',
    },
    {
      id: 'FEAT_GATE_BACKSPACE_SHIELD',
      category: 'GATE',
      categoryLabel: 'Cổng Kết Nối & Lưu Trữ',
      title: 'Lá Chắn Chống Tự Reload / Điều Hướng Khi Bấm Phím Delete Hoặc Backspace Liên Tục',
      badge: 'Bảo vệ phiên viết',
      moduleRef: 'Mod 30',
      summary:
        'Ngăn chặn triệt để tình huống người dùng ấn nút Backspace hoặc Delete nhiều lần ngoài ô nhập liệu khiến trình duyệt hiểu nhầm là lệnh Quay lại trang trước hoặc làm mới mất trạng thái.',
      whenToUse:
        'Luôn tự động chạy ngầm xuyên suốt toàn bộ 6 Tab mỗi khi bạn nhấn Delete hoặc Backspace liên tục.',
      stepByStep: [
        'Khi con trỏ nằm trong ô gõ văn bản, textarea hay khung contentEditable: Backspace/Delete xóa chữ bình thường.',
        'Khi con trỏ nằm ngoài vùng nhập liệu (ví dụ vừa bấm nút xóa chữ xong vẫn giữ tay trên phím Backspace): sự kiện quay trang mặc định bị chặn êm.',
        'Mọi form trên web cũng được khóa chống submit reload trang bất ngờ.',
      ],
      proTip:
        'Kết hợp cùng Auto-Save 3 tầng và Kho Phiên Bản Tab 6, bạn gần như không bao giờ bị văng mất bản thảo đang viết dở.',
      relatedIds: ['FEAT_TAB6_TIME_MACHINE', 'FEAT_TAB1_THREE_TIER_SAVE'],
      screenKey: 'SCREEN_6_SYSTEM',
      expandCollapseIds: [],
      targetDomId: 'tab6-version-history-vault',
      actionLabel: 'Đi tới Khu Bảo Vệ Phiên Bản',
    },

    // ========================================================================
    // PHÂN KHU 2: TAB 1 - BÀN VIẾT TRUYỆN & PHÒNG DUYỆT DIFF
    // ========================================================================
    {
      id: 'FEAT_TAB1_BOOK_EDITOR',
      category: 'TAB1',
      categoryLabel: 'Tab 1: Bàn Viết Truyện',
      title: 'Khung Soạn Thảo Bản Thảo Chuẩn Sách In & Tiêu Đề Đồng Bộ 2 Chiều',
      badge: 'Không gian chính',
      moduleRef: 'Mod 22 & Mod 23',
      summary:
        'Khung soạn thảo rộng thoáng chuẩn sách in Light Novel với bộ đếm từ tiếng Việt chính xác, thời gian đọc ước tính, thanh tiến độ mục tiêu từ hằng ngày và ô đặt tên chương đồng bộ thẳng sang Cây chương Tab 2.',
      whenToUse:
        'Dùng hằng ngày để gõ trực tiếp chương mới, biên tập lại câu chữ hoặc đọc rà soát mượt trên màn hình lớn lẫn điện thoại.',
      stepByStep: [
        'Chọn hoặc gõ tên chương ngay tại thanh tiêu đề trên đỉnh Tab 1 — tên mới lập tức cập nhật ở Tab 2 và Tab 6.',
        'Bắt đầu gõ nội dung trong khung soạn thảo chính; góc trên liên tục báo giờ lưu gần nhất (Auto-Save 3 tầng).',
        'Khi viết xong, bấm nút xanh "Duyệt & Chốt Bản Thảo" ở góc phải trên để cập nhật Story Bible lũy tiến.',
      ],
      proTip:
        'Nhấn Ctrl + S bất cứ lúc nào để cưỡng bức lưu đồng thời cả LocalStorage, IndexedDB, ổ cứng thật và chụp 1 mốc ảnh trong Kho Phiên Bản.',
      relatedIds: ['FEAT_TAB1_AI_DIFF_REVIEW', 'FEAT_TAB1_ZEN_TYPEWRITER'],
      screenKey: 'SCREEN_1_WRITE',
      expandCollapseIds: [],
      targetDomId: 'btn-s7-save-now',
      actionLabel: 'Đi tới Tab 1 (Nút Lưu Ngay)',
    },
    {
      id: 'FEAT_TAB1_QUICK_NEW_CHAPTER',
      category: 'TAB1',
      categoryLabel: 'Tab 1: Bàn Viết Truyện',
      title: '➕ Tạo Chương Mới Nhanh Ngay Tại Bàn Viết Tab 1',
      badge: '1 Chạm Sáng Tác',
      moduleRef: 'Mod 08 & Mod 31',
      summary:
        'Nút bấm nổi bật trên thanh tiêu đề Tab 1 cho phép khởi tạo ngay chương nháp mới và tự động trỏ con trỏ chuột vào ô đặt tên/soạn thảo mà không cần rời Bàn viết.',
      whenToUse:
        'Khi vừa kết thúc một chương hoặc muốn mở ngay một phân cảnh mới để gõ tiếp liền mạch.',
      stepByStep: [
        'Tại Bàn viết Tab 1, bấm nút "➕ Tạo Chương Mới" màu xanh lá cạnh ô chọn chương.',
        'Hệ thống tự động thêm chương mới vào danh sách cây chương và chuyển con trỏ chuột vào ô tiêu đề.',
        'Nhập tên chương và bắt đầu gõ — hệ thống tự động lưu 3 tầng ngầm 100% êm đềm không bao giờ tải lại trang.',
      ],
      proTip:
        'Bạn có thể gõ phím tắt Alt+N (hoặc bấm nút này) bất cứ lúc nào.',
      relatedIds: ['FEAT_TAB2_CHAPTER_TREE', 'FEAT_TAB1_BOOK_EDITOR'],
      screenKey: 'SCREEN_1_WRITE',
      expandCollapseIds: [],
      targetDomId: 'btn-tab1-quick-new-chapter',
      actionLabel: 'Đi tới nút Tạo Chương Mới Tab 1',
    },
    {
      id: 'FEAT_TAB1_AI_DIFF_REVIEW',
      category: 'TAB1',
      categoryLabel: 'Tab 1: Bàn Viết Truyện',
      title: 'Duyệt Văn Bản AI Kiểu Google Docs (Phân Biệt Màu Chữ & Chấp Nhận / Từ Chối Từng Cụm)',
      badge: 'Google Docs Diff',
      moduleRef: 'Mod 11 & Mod 23',
      summary:
        'Mỗi khi bạn bấm "Chèn nối tiếp" hoặc "Thay thế" văn bản AI từ Tab 3 sang Tab 1, những câu chữ do AI mới thêm vào sẽ hiện màu nổi bật hoàn toàn tách biệt với chữ gốc của bạn để dễ soi từng đoạn.',
      whenToUse:
        'Ngay sau khi đưa kết quả từ AI ở Tab 3 vào bản thảo Tab 1 và muốn giữ lại những câu hay, gạch bỏ những đoạn sáo rỗng.',
      stepByStep: [
        'Bấm "Chèn nối tiếp" hoặc "Thay thế" tại Tab 3 — Studio tự chuyển về Tab 1 kèm chế độ Soi Thay Đổi (Diff View).',
        'Xem các đoạn highlight màu xanh/vàng do AI viết; bấm "Chấp nhận tất cả" hoặc duyệt từng cụm thay đổi riêng lẻ.',
        'Bấm "Chuyển Chế Độ Xem / Sửa Gọn" bất cứ lúc nào để trở lại khung soạn thảo thuần văn bản.',
      ],
      proTip:
        'Nếu lỡ bấm Chấp nhận hoặc Từ chối nhầm, nút Undo (Hoàn tác Ctrl+Z) đa tầng ở góc trên Tab 1 luôn giữ lại hàng chục bước trước đó.',
      relatedIds: ['FEAT_TAB3_INSERT_OR_REPLACE', 'FEAT_TAB1_UNDO_REDO'],
      screenKey: 'SCREEN_1_WRITE',
      expandCollapseIds: [],
      targetDomId: 'btn-ai-diff-toggle-edit-view',
      actionLabel: 'Đi tới nút Soi Diff Google Docs',
    },
    {
      id: 'FEAT_TAB1_SENSORY_DICTIONARY',
      category: 'TAB1',
      categoryLabel: 'Tab 1: Bàn Viết Truyện',
      title: 'Từ Điển Ngũ Quan (Thị Giác, Thính Giác, Khứu Giác, Xúc Giác) & Lời Tác Giả',
      badge: 'Giảm văn phong AI',
      moduleRef: 'Mod 25',
      summary:
        'Kho gợi ý từ vựng miêu tả cảm giác sống động (ánh sáng, tiếng động, mùi vị, xúc giác, phản ứng nội tâm) kèm ô soạn Lời tâm sự tác giả đầu/cuối chương chuẩn phong cách Web Novel.',
      whenToUse:
        'Khi cảm thấy đoạn miêu tả đang hơi khô, bị bí tính từ diễn tả bầu không khí, hoặc muốn đính kèm lời nhắn tác giả khi xuất sách.',
      stepByStep: [
        'Tại Tab 1, mở ngăn "Công cụ biên tập & Xuất sách" nếu đang thu gọn, rồi bấm nút "Từ điển Ngũ quan & Lời Tác Giả".',
        'Chọn nhóm giác quan cần gợi ý, chạm vào cụm từ ưng ý để sao chép hoặc chèn thẳng vào vị trí con trỏ.',
        'Điền thêm "Lời tác giả đầu/cuối chương" để tự động đi kèm khi xuất PDF/Word/EPUB.',
      ],
      proTip:
        'Kết hợp Từ điển Ngũ quan với bộ lọc Anti-Cliché ở Tab 4 giúp văn phong Light Novel của bạn tự nhiên, có hồn như truyện dịch cao cấp.',
      relatedIds: ['FEAT_TAB1_LORE_WHISPER', 'FEAT_TAB4_CLICHE_RADAR'],
      screenKey: 'SCREEN_1_WRITE',
      expandCollapseIds: [['tab1-collapsible-tools-body', 'btn-toggle-tab1-toolbar']],
      targetDomId: 'btn-open-sensory-assistant',
      actionLabel: 'Mở Từ Điển Ngũ Quan tại Tab 1',
    },
    {
      id: 'FEAT_TAB1_LORE_WHISPER',
      category: 'TAB1',
      categoryLabel: 'Tab 1: Bàn Viết Truyện',
      title: 'Thanh Lore Whisper (Nhắc Ngầm Hồ Sơ Nhân Vật Ngay Khi Đang Gõ Tên)',
      badge: 'Tự động theo nét gõ',
      moduleRef: 'Mod 24',
      summary:
        'Ngay khoảnh khắc bạn gõ tên một nhân vật hoặc thuật ngữ đang có trong Story Bible Tab 4, một dải nhắc nhẹ sẽ âm thầm hiện lên cho biết tính cách, mục tiêu và bí mật của người đó để bạn không viết sai tính cách.',
      whenToUse:
        'Khi truyện đã dài nhiều chương, có hàng chục nhân vật phụ lâu ngày mới tái xuất và bạn cần nhớ nhanh đặc điểm xưng hô của họ.',
      stepByStep: [
        'Đảm bảo nhân vật đã có tên trong Bảng Hồ Sơ Nhân Vật ở Tab 4 (tự trích xuất hoặc thêm tay).',
        'Đang viết ở Tab 1, chỉ cần gõ đúng tên nhân vật đó.',
        'Thanh Lore Whisper tự sáng lên gọn gàng ở cạnh trên, bấm nút tắt nếu muốn ẩn tạm.',
      ],
      proTip:
        'Mẹo: Điền rõ phần "Giọng điệu đặc trưng" trong Tab 4 để mỗi lần Lore Whisper hiện lên, bạn nhớ ngay nhân vật đó xưng tôi, ta hay bổn tọa.',
      relatedIds: ['FEAT_TAB4_CHARACTER_PROFILES', 'FEAT_TAB1_BOOK_EDITOR'],
      screenKey: 'SCREEN_1_WRITE',
      expandCollapseIds: [],
      targetDomId: 'btn-dismiss-lore-whisper',
      actionLabel: 'Đi tới khu vực Lore Whisper Tab 1',
    },
    {
      id: 'FEAT_TAB1_FIND_REPLACE',
      category: 'TAB1',
      categoryLabel: 'Tab 1: Bàn Viết Truyện',
      title: 'Tìm Kiếm & Thay Thế Hàng Loạt Trong Chương (Đổi Tên Nhân Vật / Sửa Lỗi Chính Tả)',
      badge: 'Ctrl + F',
      moduleRef: 'Mod 23',
      summary:
        'Thanh tìm kiếm và thay thế tức thì giúp bạn rà lại từ lặp, tìm từng chỗ xuất hiện hoặc đổi đồng loạt tên một địa danh / nhân vật trong chương chỉ bằng một cú bấm.',
      whenToUse:
        'Khi muốn đổi tên một nhân vật vừa đặt, tìm lại câu thoại bị gõ nhầm hoặc soát xem một từ đệm đã lặp quá nhiều lần chưa.',
      stepByStep: [
        'Bấm Ctrl + F hoặc mở thanh Công cụ Tab 1 -> bấm "Tìm & Thay thế".',
        'Nhập từ cần tìm ở ô trái và từ muốn đổi sang ở ô phải.',
        'Bấm "Tìm tiếp" để soi từng chỗ hoặc "Thay hết" nếu chắc chắn muốn sửa toàn bộ chương.',
      ],
      proTip:
        'Sau khi bấm "Thay hết", lịch sử Undo vẫn ghi nhận lại bản trước đó nên bạn hoàn toàn yên tâm thử nghiệm.',
      relatedIds: ['FEAT_TAB1_UNDO_REDO', 'FEAT_TAB2_CLEAN_DIALOGUE'],
      screenKey: 'SCREEN_1_WRITE',
      expandCollapseIds: [['tab1-collapsible-tools-body', 'btn-toggle-tab1-toolbar']],
      targetDomId: 'btn-open-find-replace',
      actionLabel: 'Đi tới nút Tìm & Thay Thế',
    },
    {
      id: 'FEAT_TAB1_ZEN_TYPEWRITER',
      category: 'TAB1',
      categoryLabel: 'Tab 1: Bàn Viết Truyện',
      title: 'Chế Độ Tập Trung Toàn Màn Hình (Zen Mode) & Máy Đánh Chữ (Typewriter Focus)',
      badge: 'F11 / Tập trung sâu',
      moduleRef: 'Mod 22 & Mod 23',
      summary:
        'Ẩn các thanh điều hướng phụ để đưa trang giấy vào trung tâm tầm nhìn, kết hợp chế độ giữ dòng đang gõ luôn nằm giữa màn hình và lớp nền mưa/ánh nến dịu mắt.',
      whenToUse:
        'Vào những buổi tối muốn viết liền mạch 2.000 - 4.000 chữ mà không bị phân tâm bởi thanh menu xung quanh.',
      stepByStep: [
        'Bấm "Công cụ biên tập" ở Tab 1 (hoặc dùng phím F11 trên máy tính) để bật Zen Mode.',
        'Bật thêm "Chế độ Máy đánh chữ" nếu muốn dòng con trỏ luôn giữ ở vùng trung tâm dễ nhìn.',
        'Nhấn Esc hoặc bấm lại nút thoát Zen Mode khi hoàn thành đoạn viết.',
      ],
      proTip:
        'Bật kèm tiếng Mưa đêm ở Tab 5 hoặc thanh Pomodoro thu gọn góc màn hình để đạt trạng thái nhập tâm (Flow) nhanh nhất.',
      relatedIds: ['FEAT_TAB5_POMODORO_SYNC', 'FEAT_TAB5_WALLPAPERS'],
      screenKey: 'SCREEN_1_WRITE',
      expandCollapseIds: [['tab1-collapsible-tools-body', 'btn-toggle-tab1-toolbar']],
      targetDomId: 'btn-toggle-zen-mode',
      actionLabel: 'Đi tới nút Zen Mode Tab 1',
    },
    {
      id: 'FEAT_TAB1_UNDO_REDO',
      category: 'TAB1',
      categoryLabel: 'Tab 1: Bàn Viết Truyện',
      title: 'Hệ Thống Undo / Redo Đa Tầng & Nháp Nhanh (Scratchpad)',
      badge: 'Ctrl+Z / Ghi chú nhanh',
      moduleRef: 'Mod 09 & Mod 23',
      summary:
        'Bộ đệm hoàn tác sâu cho phép lùi lại từng đoạn vừa xóa, đi kèm cửa sổ Sổ Nháp Nhanh (Scratchpad) giúp ghi vội ý tưởng thoại hoặc mảnh cốt truyện phụ mà không làm bẩn bản thảo chính.',
      whenToUse:
        'Khi lỡ xóa nhầm đoạn hay, hoặc tự dưng nảy ra một cảnh cao trào cho chương sau trong lúc đang viết chương hiện tại.',
      stepByStep: [
        'Dùng 2 nút Undo / Redo ngay trên thanh điều khiển Tab 1 để lùi hoặc tiến qua từng mốc chỉnh sửa.',
        'Mở "Sổ Nháp Nhanh (Scratchpad)" để dán các câu văn rời hoặc dàn ý dự phòng.',
        'Nội dung Sổ Nháp cũng được tự động lưu trữ an toàn vào ổ nhớ trình duyệt.',
      ],
      proTip:
        'Trước các pha cắt gọt mạnh tay trên 500 chữ, hãy ghé nút Phiên Bản (⏱️) trên đỉnh màn hình bấm "Tạo mốc thủ công" để giữ nguyên hiện trạng.',
      relatedIds: ['FEAT_TAB6_TIME_MACHINE', 'FEAT_TAB1_THREE_TIER_SAVE'],
      screenKey: 'SCREEN_1_WRITE',
      expandCollapseIds: [],
      targetDomId: 'btn-s7-undo',
      actionLabel: 'Đi tới nút Undo / Hoàn Tác Tab 1',
    },
    {
      id: 'FEAT_TAB1_THREE_TIER_SAVE',
      category: 'TAB1',
      categoryLabel: 'Tab 1: Bàn Viết Truyện',
      title: 'Chuẩn Lưu Trữ 3 Tầng Tự Động (LocalStorage + IndexedDB + Đồng Bộ Ổ Cứng Thật)',
      badge: 'Chống mất dữ liệu',
      moduleRef: 'Mod 05 & Mod 09',
      summary:
        'Mỗi thay đổi trên Tab 1 đều lần lượt được ghi vào bộ nhớ đệm tức thời, cơ sở dữ liệu trình duyệt bền vững IndexedDB và đồng bộ ra thư mục ổ cứng bạn đã chọn ngay từ Cổng khởi động.',
      whenToUse:
        'Chạy tự động liên tục mỗi vài giây và khi bạn bấm nút Lưu / chuyển chương.',
      stepByStep: [
        'Theo dõi chấm xanh góc trái thanh tiêu đề ("Đã lưu HH:MM:SS") để biết phiên lưu 3 tầng mới nhất.',
        'Bấm nút Lưu ngay nếu sắp tắt máy đột xuất để ép ghi đồng bộ xuống cả file ổ cứng.',
        'Nếu cần xuất file di động sang máy khác, tải thêm gói .JSON ở Tab 6.',
      ],
      proTip:
        'Ngay cả khi mất mạng hoàn toàn, toàn bộ Tab 1, Tab 2, Tab 4, Tab 5 và Tab 6 vẫn vận hành bình thường ngoại tuyến.',
      relatedIds: ['FEAT_GATE_DISK_FOLDER', 'FEAT_TAB6_JSON_BACKUP'],
      screenKey: 'SCREEN_1_WRITE',
      expandCollapseIds: [],
      targetDomId: 'btn-s7-save-now',
      actionLabel: 'Kiểm tra nút Lưu 3 Tầng Tab 1',
    },
    {
      id: 'FEAT_TAB1_COLLAPSIBLE_AND_MOBILE',
      category: 'TAB1',
      categoryLabel: 'Tab 1: Bàn Viết Truyện',
      title: 'Thanh Công Cụ Rút Gọn Sẵn & Bàn Phím Chèn Nhanh Dấu Ngoặc Cho Điện Thoại',
      badge: 'Gọn đẹp trên mọi màn hình',
      moduleRef: 'Mod 22 & Mod 23',
      summary:
        'Các thanh công cụ phụ ở Tab 1 mặc định được thu gọn sạch sẽ khi vừa vào web; riêng trên điện thoại có thêm thanh chèn nhanh cặp ngoặc thoại 「 」, dấu chấm lửng …, gạch nối —— và dấu ngắt phân cảnh ***.',
      whenToUse:
        'Khi mở web trên iPhone/Android hoặc khi muốn không gian màn hình viết sách rộng tối đa không bị rối nút.',
      stepByStep: [
        'Mới đăng nhập vào Studio, các thanh phụ đều thu gọn sẵn; bấm nút tiêu đề "Công cụ biên tập & Xuất sách" nếu cần mở ra.',
        'Trên điện thoại, mở "Thanh chèn nhanh" dưới bàn phím để bấm 1 chạm tạo ngoặc kép hoặc ngắt cảnh.',
        'Bấm "AI Hỗ Trợ" ngay thanh trên Tab 1 nếu muốn nhảy nhanh sang Tab 3 hoặc mở Chat Bi Số 8.',
      ],
      proTip:
        'Thanh công cụ thu gọn ở các Tab 1, 2, 3, 4, 5, 6 đều độc lập nên mở Tab này không làm chật Tab khác.',
      relatedIds: ['FEAT_TAB1_ZEN_TYPEWRITER', 'FEAT_FLOATING_COLLAPSE_DESIGN'],
      screenKey: 'SCREEN_1_WRITE',
      expandCollapseIds: [],
      targetDomId: 'btn-toggle-tab1-toolbar',
      actionLabel: 'Đi tới Nút Rút Gọn Công Cụ Tab 1',
    },

    // ========================================================================
    // PHÂN KHU 3: TAB 2 - QUẢN LÝ CHƯƠNG & NGUỒN TÀI LIỆU
    // ========================================================================
    {
      id: 'FEAT_TAB2_CHAPTER_TREE',
      category: 'TAB2',
      categoryLabel: 'Tab 2: Chương & Nguồn',
      title: 'Cây Bản Thảo Nhiều Chương, Đổi Tên Trực Tiếp & Khóa Duyệt 2 Chiều',
      badge: 'Quản lý tập trung',
      moduleRef: 'Mod 08',
      summary:
        'Sắp xếp toàn bộ Chương 1, Chương 2... từ đầu tới cuối truyện, cho phép tạo chương mới, sắp thứ tự, sửa tên trực tiếp và đánh dấu trạng thái Nháp / Đã duyệt đồng bộ hai chiều với Story Bible.',
      whenToUse:
        'Khi cần thêm hồi mới, nhảy qua lại đọc đối chiếu giữa các chương hoặc rà soát xem chương nào chưa được duyệt.',
      stepByStep: [
        'Mở Tab 2; danh sách bên trái liệt kê toàn bộ chương cùng số từ và nhãn Nháp / Đã duyệt.',
        'Bấm "+ Chương mới" để thêm chương kế tiếp, hoặc bấm vào tên chương để mở bản thảo xem trước bên phải.',
        'Gạt nút trạng thái duyệt hoặc bấm "Duyệt & Chốt Bản Thảo" để đưa chương đó vào mạch Story Bible liên hoàn.',
      ],
      proTip:
        'Khi đánh dấu duyệt trên Cây chương Tab 2, hệ thống cũng đồng bộ kích hoạt rà soát Story Bible lũy tiến từ Chương 1 đến chương mới nhất.',
      relatedIds: ['FEAT_TAB4_CUMULATIVE_BIBLE', 'FEAT_TAB2_BATCH_IMPORT'],
      screenKey: 'SCREEN_2_SOURCES',
      expandCollapseIds: [],
      targetDomId: 'btn-new-draft-chapter',
      actionLabel: 'Đi tới Tab 2 (+ Chương Mới)',
    },
    {
      id: 'FEAT_TAB2_BATCH_IMPORT',
      category: 'TAB2',
      categoryLabel: 'Tab 2: Chương & Nguồn',
      title: 'Nạp Bản Thảo Hàng Loạt Từ Máy (.DOCX, .PDF, .TXT, .MD) & Tự Động Tách Chương',
      badge: 'Nhập truyện có sẵn',
      moduleRef: 'Mod 06 & Mod 08',
      summary:
        'Nếu bạn đã viết sẵn truyện ở Word, PDF hoặc file văn bản bên ngoài, chỉ cần nạp vào Tab 2 — Studio tự động đọc nội dung tiếng Việt và cắt chia thành từng chương sạch sẽ.',
      whenToUse:
        'Khi mới chuyển dự án tiểu thuyết dài từ Word / Google Docs / điện thoại sang web viết tiểu thuyết của Bi.',
      stepByStep: [
        'Tại Tab 2, bấm vào vùng thu gọn "Lọc & Nạp" ở góc trên bên trái.',
        'Bấm nút "Nạp file từ máy" và chọn 1 hoặc nhiều file .TXT, .DOCX, .PDF.',
        'Kiểm tra danh sách chương vừa tách xuất hiện bên cột trái; từ giờ Tab 4 Story Bible và Tab 6 Exporter đều đọc được ngay.',
      ],
      proTip:
        'Sau khi nạp hàng loạt chương cũ, vào Tab 4 bấm cập nhật Story Bible hoặc dùng thẻ NotebookLM trong Tab 4 để tóm tắt mạch truyện chuẩn xác 100%.',
      relatedIds: ['FEAT_TAB4_NOTEBOOKLM_COMPANION', 'FEAT_TAB6_EXPORT_DOCX_OOXML'],
      screenKey: 'SCREEN_2_SOURCES',
      expandCollapseIds: [['tab2-filter-import-collapsible-body', 'btn-toggle-tab2-filters']],
      targetDomId: 'btn-import-files',
      actionLabel: 'Mở khay Lọc & Nạp File Tab 2',
    },
    {
      id: 'FEAT_TAB2_BM25_RAG',
      category: 'TAB2',
      categoryLabel: 'Tab 2: Chương & Nguồn',
      title: 'Tra Cứu Ký Ức Cũ Bằng Thuật Toán BM25 (0 Token API — Chạy Tức Thì Tại Chỗ)',
      badge: 'Miễn phí 0 Token',
      moduleRef: 'Mod 07',
      summary:
        'Tìm kiếm chính xác chi tiết cũ trong hàng trăm chương (ví dụ tên chiếc nhẫn, lời thề ở chương 4, vết sẹo bên vai trái) nhờ chỉ mục BM25 chạy ngay trên trình duyệt mà không tốn một đồng API nào.',
      whenToUse:
        'Bất cứ lúc nào bạn quên một chi tiết nhỏ đã nhắc ở các hồi đầu hoặc muốn AI lôi đúng đoạn văn chứng cứ đó nạp vào Prompt Tổng Hợp.',
      stepByStep: [
        'Tại Tab 2, mở mục thu gọn "Tra cứu chi tiết cũ (BM25)".',
        'Gõ từ khóa (ví dụ: "đồng hồ quả quýt", "công ty Nam Trung") rồi bấm Tìm kiếm.',
        'Các đoạn trích khớp nhất kèm số chương hiện lên ngay lập tức; hệ thống cũng tự chèn ngữ cảnh liên quan khi tổng hợp Prompt Tab 3.',
      ],
      proTip:
        'BM25 xử lý trên văn bản thuần cục bộ nên phản hồi dưới 50 mili-giây và không phụ thuộc hạn mức Gemini.',
      relatedIds: ['FEAT_TAB3_TWO_STEP_MASTER', 'FEAT_TAB4_NOTEBOOKLM_COMPANION'],
      screenKey: 'SCREEN_2_SOURCES',
      expandCollapseIds: [['tab2-rag-collapsible-body', 'btn-toggle-tab2-rag']],
      targetDomId: 'btn-rag-search',
      actionLabel: 'Mở Tra Cứu BM25 tại Tab 2',
    },
    {
      id: 'FEAT_TAB2_CLEAN_DIALOGUE',
      category: 'TAB2',
      categoryLabel: 'Tab 2: Chương & Nguồn',
      title: 'Chuẩn Hóa Câu Thoại Nhanh & Công Cụ Biên Tập Trong Khay Thu Gọn Tab 2',
      badge: 'Sửa định dạng 1-Click',
      moduleRef: 'Mod 08 & Mod 25',
      summary:
        'Tự động dọn khoảng trắng thừa, chuẩn hóa gạch đầu dòng hội thoại theo phong cách sách in tiếng Việt ngay trên chương đang chọn mà không cần sửa tay từng dòng.',
      whenToUse:
        'Sau khi copy văn bản từ nơi khác hoặc sau khi nạp file bên ngoài vào mà bị lệch định dạng dấu gạch thoại.',
      stepByStep: [
        'Mở chương cần làm đẹp trong Tab 2.',
        'Bấm vào menu thu gọn "Công cụ biên tập & Xuất sách" ở thanh giữa Tab 2.',
        'Chọn "Chuẩn hóa thoại nhanh" để hệ thống xử lý hàng trăm dòng chỉ trong 1 giây.',
      ],
      proTip:
        'Mọi thao tác chuẩn hóa đều lưu vào Undo nên bạn luôn có thể hoàn tác nếu thích giữ cách xuống dòng cũ.',
      relatedIds: ['FEAT_TAB2_CHAPTER_TREE', 'FEAT_TAB6_EXPORT_PDF_CUSTOM'],
      screenKey: 'SCREEN_2_SOURCES',
      expandCollapseIds: [],
      targetDomId: 'btn-instant-clean-dialogue',
      actionLabel: 'Đi tới nút Chuẩn Hóa Thoại Tab 2',
    },

    // ========================================================================
    // PHÂN KHU 4: TAB 3 - TRỢ LÝ AI, 5 CHẾ ĐỘ & QUOTA THỜI GIAN THỰC
    // ========================================================================
    {
      id: 'FEAT_TAB3_5_AI_MODES',
      category: 'TAB3',
      categoryLabel: 'Tab 3: Trợ Lý AI & 5 Chế Độ',
      title: '5 Chế Độ Viết Tiểu Thuyết Chuyên Biệt (Từ Viết Nháp, Tham Mưu Đến Vẽ Sơ Đồ)',
      badge: 'Lõi sáng tạo AI',
      moduleRef: 'Mod 16, 17, 18',
      summary:
        'Thay vì một ô chat chung chung dễ viết nhảm, Studio chia rạch ròi 5 chế độ: (1) Viết bản nháp dài 3.000-4.000+ từ, (2) Biên tập & Tinh chỉnh câu chữ, (3) Bàn mưu cốt truyện / Gỡ bí, (4) Sinh đoạn chuyển cảnh sâu, (5) Vẽ Biểu đồ Cốt Truyện theo Story Bible.',
      whenToUse:
        'Mỗi lần cần gọi Gemini thực hiện một công đoạn cụ thể trong sáng tác tiểu thuyết.',
      stepByStep: [
        'Mở Tab 3 rồi bấm nút xanh "Chọn chế độ chạy mô hình, thông số và nhập câu lệnh" (hoặc phím tắt mở nhanh).',
        'Trong hộp thoại siêu rộng, chọn đúng Chế độ 1–5 tại mục số 1.',
        'Chỉnh thêm Số từ đầu ra, Ngôi kể (POV) và Độ bay bổng (Temperature) cho hợp gu văn phong.',
      ],
      proTip:
        'Chế độ 1 kết hợp Ngôi thứ 3 giới hạn và Độ bay bổng 0.80–0.88 cho ra chất văn tâm lý tự nhiên, ít bị lặp sáo ngữ.',
      relatedIds: ['FEAT_TAB3_TWO_STEP_MASTER', 'FEAT_TAB3_MODE5_DIAGRAM'],
      screenKey: 'SCREEN_3_AI',
      expandCollapseIds: [],
      targetDomId: 'btn-open-fullscreen-ai-command',
      actionLabel: 'Mở Trung Tâm AI 5 Chế Độ Tab 3',
    },
    {
      id: 'FEAT_TAB3_REAL_MODELS_AND_THINKING',
      category: 'TAB3',
      categoryLabel: 'Tab 3: Trợ Lý AI & 5 Chế Độ',
      title: 'Đủ Hệ Mô Hình Pro / Flash / Argon / Flash-Lite & Mức Tư Duy Thấp / Trung Bình / Cao',
      badge: 'Liên kết Key Real-time',
      moduleRef: 'Mod 02 & Mod 15',
      summary:
        'Liên kết trực tiếp API Key với đầy đủ mô hình Pro, Flash, Argon-4 và Flash-Lite kèm bộ chọn Mức Độ Tư Duy (Thinking: Thấp / Trung bình / Cao). Xử lý thông minh lỗi 403/404/429 để không bị kẹt giả vào Flash-Lite.',
      whenToUse:
        'Khi cần chuyển sang dòng Pro / Flash viết chương cao trào (đặt Tư duy Cao) hoặc khi muốn tiết kiệm hạn mức cho khâu nháp nhanh.',
      stepByStep: [
        'Trong Trung tâm điều khiển AI Tab 3 hoặc Cổng Bước 2, chọn mô hình mong muốn ở danh sách "Mô hình Gemini".',
        'Chọn tiếp nút "Tư duy: Thấp / Trung bình / Cao" ngay kế bên để điều chỉnh chiều sâu suy luận của AI.',
        'Nếu mô hình Pro hoặc Argon-4 bị giới hạn endpoint trên Key miễn phí, hộp thoại dự phòng hiện sẵn link copy câu lệnh & link mở thẳng "Gemini của bạn".',
      ],
      proTip:
        'Khi mở hộp thoại dự phòng Pro/Argon-4, chỉ cần bấm chữ "câu lệnh dưới đây" là toàn văn Prompt Tổng Hợp tự động chép gọn vào clipboard cho bạn dán sang Gemini Web.',
      relatedIds: ['FEAT_TAB3_QUOTA_MONITOR', 'FEAT_TAB3_ENTER_KEY_RUN'],
      screenKey: 'SCREEN_3_AI',
      expandCollapseIds: [],
      targetDomId: 'btn-open-fullscreen-ai-command',
      actionLabel: 'Mở Chọn Mô Hình & Tư Duy Tab 3',
    },
    {
      id: 'FEAT_TAB3_QUOTA_MONITOR',
      category: 'TAB3',
      categoryLabel: 'Tab 3: Trợ Lý AI & 5 Chế Độ',
      title: 'Đồng Hồ Hạn Mức Ngắn Hạn (5 Giờ) & Dài Hạn (Tuần) Kèm Link Gemini Account Live',
      badge: 'Theo dõi Quota',
      moduleRef: 'Mod 15',
      summary:
        'Góc trên bên phải Trung tâm điều khiển AI và Cổng Bước 2 luôn hiển thị trực tiếp mức tiêu thụ Ngắn hạn (cửa sổ 5 giờ) và Dài hạn (hạn mức theo Tuần) gắn với API Key đang kết nối, kèm link tra cứu thực tế.',
      whenToUse:
        'Trước khi chạy một chương dài 4.000 chữ hoặc khi gặp lỗi 429 hết lượt ở một dòng model nào đó.',
      stepByStep: [
        'Mở khung điều khiển AI tại Tab 3 — quan sát dải "Ngắn hạn (5h)" và "Dài hạn (Tuần)" ở phần thông số.',
        'Bấm "Xem Quota Account" để mở trực tiếp trang giới hạn tốc độ & mô hình live trên Google AI Studio.',
        'Nếu hết hạn mức API Key trên mô hình nặng, chọn chuyển model nhẹ hơn hoặc dùng ngay phương án dán Prompt sang Gemini Web.',
      ],
      proTip:
        'Hạn mức 5 giờ tự động trượt nhả lượt liên tục; bạn không cần chờ sang ngày hôm sau nếu mới chạm ngưỡng ngắn hạn.',
      relatedIds: ['FEAT_TAB3_REAL_MODELS_AND_THINKING', 'FEAT_GATE_GOOGLE_STUDIO'],
      screenKey: 'SCREEN_3_AI',
      expandCollapseIds: [],
      targetDomId: 'btn-open-fullscreen-ai-command',
      actionLabel: 'Xem Hạn Mức 5h & Tuần Ở Tab 3',
    },
    {
      id: 'FEAT_TAB3_TWO_STEP_MASTER',
      category: 'TAB3',
      categoryLabel: 'Tab 3: Trợ Lý AI & 5 Chế Độ',
      title: 'Quy Trình 2 Bước: Copy Thẳng Story Bible Vào Prompt Tổng Hợp -> Chạy Chính Thức',
      badge: 'Khóa ký ức AI',
      moduleRef: 'Mod 16',
      summary:
        'Bước 1 lắp ghép nguyên văn toàn bộ Story Bible Tab 4 (loại bỏ đoạn tóm tắt thừa gây tam sao thất bản) + Hồ sơ nhân vật + Ma trận Ai Biết Gì + Phục bút + Câu lệnh thành Prompt Tổng Hợp để bạn kiểm tra kỹ trước Bước 2.',
      whenToUse:
        'Mọi lần yêu cầu AI viết chương mới hoặc tham mưu cốt truyện để đảm bảo AI nhớ chuẩn 100% thiết lập thế giới.',
      stepByStep: [
        'Gõ ý tưởng cảnh sắp viết vào ô soạn lệnh ở Tab 3 (hoặc nhấn nút Tổng hợp Prompt Bước 1).',
        'Tại màn hình Xác nhận Prompt Tổng Hợp, đọc lướt lại phần Story Bible đã copy thẳng vào — có thể chỉnh sửa thêm trực tiếp.',
        'Chọn mô hình lần cuối và bấm "Bắt Đầu Chạy Prompt Chính Thức" — màn hình chờ giữ ổn định sẽ hiện ra đến khi AI viết xong.',
      ],
      proTip:
        'Trong lúc AI đang chạy Prompt ở Bước 2, bạn không nên tắt trình duyệt hoặc đổi tab rời khỏi phiên để kết quả stream về đầy đủ nhất.',
      relatedIds: ['FEAT_TAB3_ENTER_KEY_RUN', 'FEAT_TAB3_NEW_OUTPUT_BANNER'],
      screenKey: 'SCREEN_3_AI',
      expandCollapseIds: [],
      targetDomId: 'btn-open-fullscreen-ai-command',
      actionLabel: 'Đi tới Khung Lệnh 2 Bước Tab 3',
    },
    {
      id: 'FEAT_TAB3_ENTER_KEY_RUN',
      category: 'TAB3',
      categoryLabel: 'Tab 3: Trợ Lý AI & 5 Chế Độ',
      title: 'Nhấn Enter Để Chạy Lệnh Nhanh Kèm Hộp Thoại Xác Nhận An Toàn (Có Tick Không Nhắc Lại)',
      badge: 'Tốc độ cao',
      moduleRef: 'Mod 16',
      summary:
        'Trong ô nhập câu lệnh Tab 3, gõ xong chỉ cần nhấn phím Enter (dùng Shift + Enter nếu muốn xuống dòng) để bật ngay hộp xác nhận Có / Không, kèm ô chọn "Không nhắc lại lần sau" khi đã quen tay.',
      whenToUse:
        'Khi muốn thao tác nhanh trên bàn phím máy tính mà không phải rê chuột tìm nút Tổng hợp bên dưới.',
      stepByStep: [
        'Gõ chỉ dẫn sáng tác vào ô câu lệnh lớn trong Tab 3.',
        'Nhấn Enter -> hộp thoại hỏi "Bạn có đồng ý chạy prompt ngay không?" bật lên tránh bấm nhầm.',
        'Tick vào "Không nhắc lại hộp thoại này nữa" nếu từ sau muốn Enter là chạy thẳng luôn quy trình tổng hợp.',
      ],
      proTip:
        'Nếu lỡ tick "Không nhắc lại" và muốn bật hỏi lại sau này, bạn vẫn giữ nguyên bước xem trước Prompt Tổng Hợp ở Bước 2 để kiểm duyệt.',
      relatedIds: ['FEAT_TAB3_TWO_STEP_MASTER', 'FEAT_TAB3_5_AI_MODES'],
      screenKey: 'SCREEN_3_AI',
      expandCollapseIds: [],
      targetDomId: 'btn-open-fullscreen-ai-command',
      actionLabel: 'Thử Phím Enter Trong Khung Lệnh Tab 3',
    },
    {
      id: 'FEAT_TAB3_NEW_OUTPUT_BANNER',
      category: 'TAB3',
      categoryLabel: 'Tab 3: Trợ Lý AI & 5 Chế Độ',
      title: 'Thông Báo Kết Quả Xong & Tự Hiện Đầu Ra Mới Nhất Ngay Trong Khung Chữ Tab 3',
      badge: 'Không bị lạc đầu ra',
      moduleRef: 'Mod 17',
      summary:
        'Ngay khi AI viết xong bất kỳ chế độ nào, kết quả tự động bung hiện rõ ràng tại Cửa Sổ Đầu Ra Tab 3 kèm thanh thông báo nhấp nháy nổi bật "Đã viết xong — Xem Bản Mới Nhất Ngay" và công cụ lịch sử đầu ra.',
      whenToUse:
        'Ngay sau khi AI chạy xong Prompt Bước 2 hoặc khi bạn muốn đối chiếu lại giữa các phiên bản AI vừa sinh trong từng chế độ.',
      stepByStep: [
        'Chờ màn hình chờ hoàn tất — Studio tự cuộn vào Cửa Sổ Đầu Ra Tab 3 kèm thanh thông báo xanh rực.',
        'Đọc trực tiếp hoặc chỉnh sửa câu chữ ngay trong khung đầu ra mới nhất đó.',
        'Dùng menu "Chế độ / Lịch sử đầu ra" ở thanh trên nếu muốn lật lại các bản AI vừa chạy trước đó.',
      ],
      proTip:
        'Chấm chọn sẵn nút "Chèn nối tiếp" hoặc "Thay thế" ngay trên đầu Tab 3 để đẩy mượt sang phòng soi màu Diff ở Tab 1.',
      relatedIds: ['FEAT_TAB3_INSERT_OR_REPLACE', 'FEAT_TAB1_AI_DIFF_REVIEW'],
      screenKey: 'SCREEN_3_AI',
      expandCollapseIds: [],
      targetDomId: 'tab3-unified-output-topbar',
      actionLabel: 'Đi tới Cửa Sổ Đầu Ra Tab 3',
    },
    {
      id: 'FEAT_TAB3_INSERT_OR_REPLACE',
      category: 'TAB3',
      categoryLabel: 'Tab 3: Trợ Lý AI & 5 Chế Độ',
      title: 'Chèn Nối Tiếp, Thay Thế, Sao Chép & Đưa Thẳng Kết Quả Vào Story Bible',
      badge: 'Thanh tác vụ gọn',
      moduleRef: 'Mod 17',
      summary:
        'Gộp toàn bộ nút hành động quan trọng lên thanh trên cùng Tab 3: đưa văn bản vừa viết vào cuối chương hiện tại ("Chèn nối tiếp"), thay toàn bộ chương ("Thay thế"), copy ra ngoài hoặc đẩy thẳng vào Story Bible.',
      whenToUse:
        'Ngay sau khi đọc xong đầu ra AI ở Tab 3 và hài lòng với đoạn truyện đó.',
      stepByStep: [
        'Bấm "Chèn nối tiếp" nếu AI vừa viết phần tiếp theo của chương đang soạn ở Tab 1.',
        'Bấm "Thay thế" nếu AI vừa biên tập lại toàn bộ chương hiện tại.',
        'Hoặc bấm "Lưu vào Story Bible" nếu bạn vừa dùng Chế độ 3 phân tích nhân vật/thế giới quan mới.',
      ],
      proTip:
        'Nút "Thêm" ở góc phải thanh trên gom gọn các nút ít dùng (Xóa khung, mở prompt hệ thống) để màn hình chính không bị rối.',
      relatedIds: ['FEAT_TAB1_AI_DIFF_REVIEW', 'FEAT_TAB4_CUMULATIVE_BIBLE'],
      screenKey: 'SCREEN_3_AI',
      expandCollapseIds: [],
      targetDomId: 'btn-tab3-append-to-manuscript',
      actionLabel: 'Đi tới nút Chèn Nối Tiếp Tab 3',
    },
    {
      id: 'FEAT_TAB3_MODE5_DIAGRAM',
      category: 'TAB3',
      categoryLabel: 'Tab 3: Trợ Lý AI & 5 Chế Độ',
      title: 'Chế Độ 5: Vẽ Biểu Đồ Cốt Truyện & Niên Biểu Dựa Theo Story Bible (Siêu Nhẹ, Chính Xác)',
      badge: 'Story Bible Graph',
      moduleRef: 'Mod 18',
      summary:
        'Thay vì đọc quét nặng nề hàng trăm file văn bản rời rạc, Chế độ 5 dựa trực tiếp vào Story Bible đã tổng hợp kết hợp các mốc thời gian để dựng sơ đồ SVG quan hệ nhân vật, nhánh nhân quả và cảnh báo mâu thuẫn.',
      whenToUse:
        'Sau mỗi vài chương duyệt xong khi bạn muốn nhìn toàn cảnh đường dây cốt truyện và phát hiện lỗ hổng logic.',
      stepByStep: [
        'Ở Tab 3, chuyển lựa chọn sang "Chế độ 5: Vẽ Biểu Đồ Cốt Truyện" hoặc bấm "Tiện ích AI & Mốc cảnh".',
        'Kiểm tra nguồn Story Bible đã liên kết rồi bấm "Phân Tích & Vẽ Biểu Đồ Cốt Truyện Ngay".',
        'Xem sơ đồ SVG tương tác và bấm "Xuất ảnh PNG/SVG" để lưu về máy làm sơ đồ tác phẩm.',
      ],
      proTip:
        'Khi Story Bible được cập nhật đều đặn (hoặc qua NotebookLM), biểu đồ ở Chế độ 5 vẽ chính xác từng nút thắt ở tận 200-300 chương!',
      relatedIds: ['FEAT_TAB4_CUMULATIVE_BIBLE', 'FEAT_TAB4_NOTEBOOKLM_COMPANION'],
      screenKey: 'SCREEN_3_AI',
      expandCollapseIds: [],
      targetDomId: 'btn-mode5-generate-diagram',
      actionLabel: 'Đi tới Trạm Vẽ Biểu Đồ Mode 5',
    },
    {
      id: 'FEAT_TAB3_SCENE_TRANSITION_BUILDER',
      category: 'TAB3',
      categoryLabel: 'Tab 3: Trợ Lý AI & 5 Chế Độ',
      title: 'Chèn Mốc Chuyển Phân Cảnh & Đổi Góc Nhìn (POV Switch Builder)',
      badge: 'Điều hướng góc nhìn',
      moduleRef: 'Mod 16',
      summary:
        'Công cụ tạo thẻ phân cảnh chuẩn xác (ví dụ chuyển từ góc nhìn nhân vật A ban ngày sang nhân vật B lúc nửa đêm ở địa điểm khác) và tự động kẹp vào Prompt Tổng Hợp.',
      whenToUse:
        'Khi một chương cần chuyển cảnh mượt mà hoặc chuyển góc nhìn kể chuyện sang một nhân vật khác mà sợ AI bị lẫn POV.',
      stepByStep: [
        'Bấm nút "Chèn Mốc Chuyển Cảnh" ngay trong Khung Lệnh AI Tab 3 hoặc thanh Tiện ích.',
        'Điền địa điểm, mốc thời gian, nhân vật giữ góc nhìn (POV) và không khí phân cảnh.',
        'Lưu mốc lại; Bước 1 của Prompt Tổng Hợp sẽ tự động gắn mốc đó cho AI viết chuẩn.',
      ],
      proTip:
        'Các thẻ `[CHUYỂN CẢNH ...]` sau này khi xuất PDF hoặc DOCX cũng được định dạng thành hộp chuyển cảnh tinh tế.',
      relatedIds: ['FEAT_TAB3_TWO_STEP_MASTER', 'FEAT_TAB6_EXPORT_PDF_CUSTOM'],
      screenKey: 'SCREEN_3_AI',
      expandCollapseIds: [],
      targetDomId: 'btn-insert-scene-transition',
      actionLabel: 'Mở Bộ Tạo Mốc Chuyển Cảnh',
    },

    // ========================================================================
    // PHÂN KHU 5: TAB 4 - STORY BIBLE LŨY TIẾN & NOTEBOOKLM
    // ========================================================================
    {
      id: 'FEAT_TAB4_FLASH_ENTITY_SYNC',
      category: 'TAB4',
      categoryLabel: 'Tab 4: Story Bible & NotebookLM',
      title: '⚡ Bóc Tách Tự Động Nhân Vật, Bí Mật & Phục Bút Bằng Gemini Flash',
      badge: 'Gemini Flash AI',
      moduleRef: 'Mod 12 & Mod 19',
      summary:
        'Sau khi nhận tóm tắt Story Bible chi tiết từ NotebookLM hoặc nhập nội dung vào ô 2. Nội dung Story Bible chính thức, Gemini Flash sẽ tự động bóc tách thành Hồ sơ nhân vật, Ma trận bí mật và Sổ cái phục bút.',
      whenToUse:
        'Sau khi dán tóm tắt Story Bible từ NotebookLM hoặc muốn làm mới hồ sơ nhân vật/phục bút nhanh chóng.',
      stepByStep: [
        'Vào Tab 4, dán Story Bible tổng hợp vào ô "2. Nội dung Story Bible chính thức".',
        'Bấm nút "⚡ Đồng Bộ Gemini Flash" (hoặc dán văn bản để hệ thống tự nhận diện).',
        'Gemini Flash phân tích và tự động điền các mục 3. Hồ sơ nhân vật đa chiều, 4. Ma trận Ai biết gì và 5. Sổ cái phục bút.',
      ],
      proTip:
        'Nếu không có mạng, bộ bóc tách ngữ nghĩa nội bộ 0-Token vẫn hoạt động ngay tức thì!',
      relatedIds: ['FEAT_TAB4_CUMULATIVE_BIBLE', 'FEAT_TAB4_NOTEBOOKLM_COMPANION'],
      screenKey: 'SCREEN_4_BIBLE',
      expandCollapseIds: [],
      targetDomId: 'btn-tab4-sync-bible-entities',
      actionLabel: 'Đi tới nút Đồng Bộ Gemini Flash Tab 4',
    },
    {
      id: 'FEAT_TAB4_CUMULATIVE_BIBLE',
      category: 'TAB4',
      categoryLabel: 'Tab 4: Story Bible & NotebookLM',
      title: 'Cập Nhật Story Bible Lũy Tiến Toàn Mạch (Từ Chương 1 Tới Chương Mới Duyệt Cuối)',
      badge: 'Không bị đứt mạch',
      moduleRef: 'Mod 12 & Mod 19',
      summary:
        'Khắc phục triệt để lỗi chỉ nhớ mỗi chương vừa duyệt: mỗi lần duyệt bản thảo xong, công cụ trích xuất tổng hợp xuyên suốt từ Chương 1 đến chương mới nhất (kết hợp giữ nguyên thiết lập cũ) để viết nên một bản Story Bible liên hoàn đầy đủ nhất.',
      whenToUse:
        'Mỗi khi hoàn tất một chương mới ở Tab 1 hoặc Tab 2 và bấm "Duyệt & Chốt Bản Thảo".',
      stepByStep: [
        'Bấm nút xanh "Duyệt & Chốt Bản Thảo" trên đỉnh Tab 1 hoặc ở Cây chương Tab 2.',
        'Kiểm tra danh sách các chương (được tự động gom từ Chương 1 tới chương đang chốt) trong hộp xác nhận duyệt.',
        'Chờ AI phân tích — Story Bible tại Tab 4 tự cập nhật chi tiết và đồng bộ thẳng vào các Prompt sau.',
      ],
      proTip:
        'Luôn bấm nút "Lưu Toàn Bộ Bible" nếu bạn tự sửa tay thêm các ghi chú riêng vào khung Story Bible để khóa vào ổ cứng.',
      relatedIds: ['FEAT_TAB4_NOTEBOOKLM_COMPANION', 'FEAT_TAB3_TWO_STEP_MASTER'],
      screenKey: 'SCREEN_4_BIBLE',
      expandCollapseIds: [['tab4-card-rendered-body', '']],
      targetDomId: 'textarea-rendered-bible-content',
      actionLabel: 'Xem Khung Story Bible Chính Thức Tab 4',
    },
    {
      id: 'FEAT_TAB4_NOTEBOOKLM_COMPANION',
      category: 'TAB4',
      categoryLabel: 'Tab 4: Story Bible & NotebookLM',
      title: 'Cẩm Nang Chống Quên Cho Truyện Dài Hàng Trăm Chương Cùng Google NotebookLM',
      badge: 'Giải pháp 100+ chương',
      moduleRef: 'Mod 12 & Mod 26',
      summary:
        'Cảnh báo chân thành và giải pháp thực tế ngay trong Tab 4: với truyện dài hàng trăm chương dễ vượt giới hạn nhớ của model thường, bạn bấm mở thẳng NotebookLM, tải 1 click file PDF gộp toàn bộ chương và chép ngay câu lệnh Prompt chuẩn mẫu chi tiết nhất.',
      whenToUse:
        'Khi tác phẩm của bạn đã vượt 15-30 chương trở lên hoặc khi bạn muốn tái tổng hợp một bộ Story Bible siêu chi tiết không sót bất kỳ manh mối nào từ đầu truyện.',
      stepByStep: [
        'Vào Tab 4, nhìn thẻ nổi bật "Mẹo Giữ Ký Ức Cho Truyện Dài Hàng Trăm Chương Với NotebookLM".',
        'Bấm nút "1. Tải PDF Gộp Toàn Bộ Chương" để đóng gói tất cả từ Chương 1 -> Chương cuối thành 1 bản PDF.',
        'Bấm "2. Mở Ngay Sổ Tay NotebookLM ↗", tải PDF vừa xuất vào đó, rồi bấm "3. Sao Chép Prompt Tổng Hợp Story Bible Chi Tiết" dán vào NotebookLM — nhận lại toàn văn Story Bible chuẩn mực và dán ngược vào khung Tab 4.',
      ],
      proTip:
        'NotebookLM đọc cực khỏe hàng triệu chữ nguồn cùng lúc mà không bị trôi trí nhớ, cực kỳ phù hợp làm bộ nhớ dài hạn song song cùng Studio!',
      relatedIds: ['FEAT_TAB4_CUMULATIVE_BIBLE', 'FEAT_TAB6_EXPORT_PDF_CUSTOM'],
      screenKey: 'SCREEN_4_BIBLE',
      expandCollapseIds: [],
      targetDomId: 'tab4-notebooklm-guide-card',
      actionLabel: 'Đi tới Cẩm Nang NotebookLM Tab 4',
    },
    {
      id: 'FEAT_TAB4_TEMPLATE_LOCK',
      category: 'TAB4',
      categoryLabel: 'Tab 4: Story Bible & NotebookLM',
      title: 'Khóa Khung Cấu Trúc Story Bible (Template Frame Lock)',
      badge: 'Giữ form ổn định',
      moduleRef: 'Mod 12',
      summary:
        'Cố định dàn mục chuẩn của Story Bible (Mốc thời gian, Địa điểm, Mạch truyện liên hoàn Ch.1->cuối, Quy tắc thế giới, Tuyến ẩn) để AI mỗi khi cập nhật tự động luôn tuân thủ đúng khung, không tự ý đổi bố cục.',
      whenToUse:
        'Khi bạn có cấu trúc Story Bible riêng theo thể loại (Tu tiên, Trinh thám, Học đường, Đô thị) và không muốn AI tự xóa mất mục nào.',
      stepByStep: [
        'Trong Tab 4, mở phần "1. Khung Mẫu Cấu Trúc Story Bible".',
        'Chỉnh sửa các đầu mục bạn muốn AI luôn phải trích xuất chi tiết.',
        'Bấm "Khóa Khung Mẫu" để chốt cứng khung làm chuẩn cho mọi lần Duyệt chương.',
      ],
      proTip:
        'Các đầu mục trong Khung Mẫu cũng đồng thời xuất hiện trong câu lệnh mẫu gửi cho NotebookLM!',
      relatedIds: ['FEAT_TAB4_CUMULATIVE_BIBLE', 'FEAT_TAB4_NOTEBOOKLM_COMPANION'],
      screenKey: 'SCREEN_4_BIBLE',
      expandCollapseIds: [['tab4-card-template-body', '']],
      targetDomId: 'btn-toggle-bible-template-lock',
      actionLabel: 'Đi tới Khung Mẫu Story Bible Tab 4',
    },
    {
      id: 'FEAT_TAB4_CHARACTER_PROFILES',
      category: 'TAB4',
      categoryLabel: 'Tab 4: Story Bible & NotebookLM',
      title: 'Hồ Sơ Nhân Vật Đa Chiều (Tính Cách, Mục Tiêu, Giọng Điệu & Quan Hệ)',
      badge: 'Liên kết Lore Whisper',
      moduleRef: 'Mod 12',
      summary:
        'Lưu thẻ hồ sơ cho từng nhân vật chính/phụ kèm vai trò, tính cách nổi bật, mục tiêu ngầm và cách xưng hô — dùng cả để nhắc bạn ở Tab 1 lẫn gửi cho AI ở Tab 3.',
      whenToUse:
        'Khi tạo nhân vật mới hoặc sau khi duyệt chương muốn bổ sung chi tiết tâm lý/ngoại hình cho nhân vật cũ.',
      stepByStep: [
        'Tại Tab 4, bấm "+ Thêm Nhân Vật" hoặc xem các thẻ do AI tự trích xuất sau khi duyệt chương.',
        'Điền rõ Tên, Vai trò, Tính cách, Động cơ và Giọng điệu đặc trưng.',
        'Bấm Lưu Story Bible; lập tức Lore Whisper Tab 1 và AI Prompt Tab 3 nhận diện ngay nhân vật này.',
      ],
      proTip:
        'Nếu chọn "Kèm Bảng Nhân Vật" trong hộp thoại Xuất Sách Tab 6, toàn bộ thẻ này cũng được chế bản đẹp thành trang Phụ lục cuối sách.',
      relatedIds: ['FEAT_TAB1_LORE_WHISPER', 'FEAT_TAB4_KNOWLEDGE_MATRIX'],
      screenKey: 'SCREEN_4_BIBLE',
      expandCollapseIds: [['tab4-card-chars-body', '']],
      targetDomId: 'btn-add-character-profile',
      actionLabel: 'Đi tới nút + Thêm Nhân Vật Tab 4',
    },
    {
      id: 'FEAT_TAB4_KNOWLEDGE_MATRIX',
      category: 'TAB4',
      categoryLabel: 'Tab 4: Story Bible & NotebookLM',
      title: 'Ma Trận "Ai Biết Gì" (Knowledge Asymmetric Matrix) & Sổ Cái Phục Bút',
      badge: 'Chống lộ bí mật',
      moduleRef: 'Mod 12 & Mod 13',
      summary:
        'Theo dõi rạch ròi bí mật nào mới chỉ có nhân vật A biết mà nhân vật B chưa biết, kèm Sổ cái Phục bút (Chekhov’s Gun: Đã gieo -> Đang treo -> Đã thu hồi) để không bị "đẻ lỗ hổng" khi viết dài.',
      whenToUse:
        'Đặc biệt hữu ích cho truyện trinh thám, mưu lược, đa góc nhìn (POV) hoặc truyện có nhiều cú twist chồng chéo.',
      stepByStep: [
        'Thêm mục vào "Ma trận Ai Biết Gì" mỗi khi có một bí mật mới được tiết lộ riêng cho một phe.',
        'Ghi các chi tiết gài bẫy từ sớm vào "Sổ cái Phục bút" kèm số chương đã gieo.',
        'Cả hai bảng này đều tự động kẹp vào Prompt Tổng Hợp Tab 3 để AI không vô tình cho nhân vật nói lộ điều họ chưa được biết!',
      ],
      proTip:
        'Khi một manh mối đã được giải mã ở chương cao trào, hãy đổi trạng thái phục bút thành Đã Thu Hồi để sạch gọn sổ cái.',
      relatedIds: ['FEAT_TAB3_TWO_STEP_MASTER', 'FEAT_TAB3_MODE5_DIAGRAM'],
      screenKey: 'SCREEN_4_BIBLE',
      expandCollapseIds: [['tab4-card-knowledge-body', ''], ['tab4-card-clues-body', '']],
      targetDomId: 'btn-add-knowledge-entry',
      actionLabel: 'Đi tới Ma Trận Ai Biết Gì Tab 4',
    },
    {
      id: 'FEAT_TAB4_CLICHE_RADAR',
      category: 'TAB4',
      categoryLabel: 'Tab 4: Story Bible & NotebookLM',
      title: 'Quét Từ Sáo Rỗng AI (Anti-Cliché Radar) & Biểu Đồ Cảm Xúc Câu Văn',
      badge: 'Làm sạch văn phong',
      moduleRef: 'Mod 13',
      summary:
        'Tự động rà soát bản thảo tìm những cụm từ đặc trưng máy móc do AI hay lạm dụng ("sống lưng lạnh toát", "hít một hơi khí lạnh", "đồng tử co rút", "ánh mắt phức tạp"...) và chấm nhịp độ cảm xúc của chương.',
      whenToUse:
        'Sau khi nhận bản viết từ AI hoặc trước khi chốt duyệt chương ở Tab 1 / Tab 4.',
      stepByStep: [
        'Mở mục "Quét Từ Sáo Rỗng & Nhịp Độ" trong Tab 4 (hoặc nhấn Ctrl+Shift+L).',
        'Bấm "Quét Ngay" để thấy số lần lặp của từng cụm sáo rỗng và biểu đồ nhịp cao trào.',
        'Quay lại Tab 1 sửa những câu bị dính sáo ngữ thành hành động và đối thoại chân thực hơn.',
      ],
      proTip:
        'Prompt Tổng Hợp tại Tab 3 cũng mặc định kẹp sẵn danh sách từ cấm này để AI né ngay từ lúc vừa viết.',
      relatedIds: ['FEAT_TAB1_SENSORY_DICTIONARY', 'FEAT_TAB3_TWO_STEP_MASTER'],
      screenKey: 'SCREEN_4_BIBLE',
      expandCollapseIds: [['tab4-card-cliche-body', '']],
      targetDomId: 'btn-scan-cliches',
      actionLabel: 'Đi tới Radar Quét Sáo Ngữ Tab 4',
    },

    // ========================================================================
    // PHÂN KHU 6: TAB 5 - ÂM NHẠC, POMODORO, HÌNH NỀN & CHỮ SÁCH
    // ========================================================================
    {
      id: 'FEAT_TAB5_MINIMAL_SOLID_BG_AND_COLLAPSE',
      category: 'TAB5',
      categoryLabel: 'Tab 5: Nhạc, Pomodoro & Nền',
      title: '⬛ Nền Đen Tối Giản, ⬜ Nền Trắng Tối Giản & Bảng Điều Khiển Nhanh Tab 5',
      badge: '0MB Tối Giản',
      moduleRef: 'Mod 22 & Mod 32',
      summary:
        'Bổ sung 2 lựa chọn Nền Đen Tối Giản OLED và Nền Trắng Tối Giản kiểu trang giấy in kèm 2 nút "⏫ Thu gọn hết Tab 5" và "⏬ Mở rộng tất cả Tab 5" giúp tối ưu front-end gọn gàng.',
      whenToUse:
        'Khi bạn muốn màn hình đen kịt tuyệt đối hoặc trắng tinh giấy in không họa tiết, hoặc muốn thu gọn toàn bộ công cụ Tab 5.',
      stepByStep: [
        'Vào Tab 5, tại thanh điều khiển nhanh đầu trang, bấm "⏫ Thu gọn hết Tab 5" để ẩn các thanh công cụ.',
        'Mở mục "3. Chỉnh Cỡ Chữ & Hình Nền", tại Kho Tranh Nền Nghệ Thuật chọn "⬛ Nền Đen Tối Giản" hoặc "⬜ Nền Trắng Tối Giản".',
        'Hệ thống tự động áp dụng toàn diện 6 tab và chuyển tương phản chữ tương ứng.',
      ],
      proTip:
        'Nền Trắng Tối Giản tự động đổi chữ bản thảo sang màu mực đen đậm nét như trang sách xuất bản thật.',
      relatedIds: ['FEAT_TAB5_WALLPAPERS', 'FEAT_MOD32_AMBIENT_STAGE'],
      screenKey: 'SCREEN_5_AMBIENCE',
      expandCollapseIds: [],
      targetDomId: 'btn-tab5-collapse-all',
      actionLabel: 'Đi tới Bảng Điều Khiển Nhanh Tab 5',
    },
    {
      id: 'FEAT_TAB5_WALLPAPERS',
      category: 'TAB5',
      categoryLabel: 'Tab 5: Nhạc, Pomodoro & Nền',
      title: 'Hiệu Ứng Không Gian Nền 60FPS (Mưa Trên Kính), 6 Tranh Thủy Mặc & Thanh Chỉnh Độ Rõ',
      badge: 'Không bị đen kịt',
      moduleRef: 'Mod 22',
      summary:
        'Tùy biến không gian viết với 6 hiệu ứng động (Mưa rơi trên kính, Đom đóm đêm, Đèn lồng ấm, Bụi sao, Lá thu) kết hợp 6 tranh nền nghệ thuật SVG 0MB hoặc ảnh/video tải từ máy, nhìn xuyên qua lớp kính mờ tinh tế.',
      whenToUse:
        'Khi muốn đổi tâm trạng không gian sáng tác theo bối cảnh chương (mưa đêm u buồn, thư phòng ánh nến hoặc rừng trúc thanh tịnh).',
      stepByStep: [
        'Vào Tab 5; chọn hiệu ứng ở hàng trên ("Mưa Trên Kính", "Đèn Lồng Ấm"...) hoặc chọn 1 trong 6 bức tranh tại "Kho Tranh Nền Nghệ Thuật".',
        'Hoặc bấm "Tải Ảnh / Video Nền Từ Máy" để dùng chính hình/video minh họa truyện của bạn.',
        'Kéo thanh "Độ rõ nền" hoặc "Độ tối lớp kính chắn" để nhìn rõ nền nghệ thuật phía sau mà vẫn đảm bảo chữ bản thảo sắc nét dễ đọc.',
      ],
      proTip:
        'Tất cả các hộp thẻ trên Tab 1–6 đều dùng kính mờ bán trong suốt (frosted glass) nên nền và hạt mưa luôn xuyên nhẹ rất đẹp!',
      relatedIds: ['FEAT_TAB5_TYPOGRAPHY_CARE', 'FEAT_TAB5_MP3_AND_NATURE'],
      screenKey: 'SCREEN_5_AMBIENCE',
      expandCollapseIds: [],
      targetDomId: 'btn-upload-custom-bg',
      actionLabel: 'Đi tới Bộ Nền & Tải Ảnh/Video Tab 5',
    },
    {
      id: 'FEAT_MOD32_AMBIENT_STAGE',
      category: 'TAB5',
      moduleRef: 'Mod 32',
      title: '💎 Sân Khấu Nền Đa Tầng Kính Mờ & Lưu Ảnh/Video IndexedDB',
      shortDesc: 'Vá lỗi nền đen đặc, giữ ảnh/video cá nhân sau khi F5, Preset kính mờ + Soi Rõ Nền 100% + Chẩn đoán live.',
      keywords: [
        'mod 32',
        'module 32',
        'nền đen',
        'tranh nghệ thuật',
        'kính mờ',
        'frosted glass',
        'soi rõ nền',
        'indexeddb',
        'ảnh nền',
        'video nền',
      ],
      detailGuide:
        'Module 32 tách riêng tầng canvas vẽ tranh nghệ thuật (#mod32-procedural-art-canvas), lưu nhị phân ảnh/video cá nhân vào IndexedDB để không mất khi tải lại trang, và tự động kiểm định độ trong suốt kính mờ trên cả Dark/Light mode.',
      relatedIds: ['FEAT_TAB5_WALLPAPERS', 'FEAT_TAB5_TYPOGRAPHY_CARE'],
      screenKey: 'SCREEN_5_AMBIENCE',
      expandCollapseIds: [['s14-panel-typography-box', '']],
      targetDomId: 'mod32-backdrop-stage-panel',
      actionLabel: 'Mở Sân Khấu Nền Module 32 (Tab 5)',
    },
    {
      id: 'FEAT_MOD32_ARGON_BRIDGE',
      category: 'TAB3',
      moduleRef: 'Mod 32 & Mod 16',
      title: '⚡ Cầu Nối Viết Sâu 20.000+ Từ: Copy Prompt & Mở Gemini Web Argon 4 / Carbon 4',
      shortDesc: '1 chạm copy trọn Prompt Tổng Hợp + link thẳng Gemini Web ngay tại màn hình duyệt & chờ bản thảo (Pro -> Argon 4, Ultra -> Carbon 4).',
      keywords: [
        'argon 4',
        'carbon 4',
        'gemini web',
        '20000 từ',
        '20.000 từ',
        'pro',
        'ultra',
        'copy prompt tổng hợp',
        'mod 32',
      ],
      detailGuide:
        'Vì Argon 4 chưa gọi trực tiếp ổn định qua API, Module 32 gắn trực tiếp hộp Cầu Nối trên cả Màn hình Duyệt Prompt Tổng và Màn hình Đang Chạy AI: 1 nút gạch chân bôi đậm chép trọn Prompt Tổng Hợp, 1 link mở thẳng Gemini Web để chạy Argon 4 (gói Pro) hoặc Carbon 4 (gói Ultra).',
      relatedIds: ['FEAT_TAB3_MASTER_PROMPT', 'FEAT_MOD32_AMBIENT_STAGE'],
      screenKey: 'SCREEN_3_AI_STUDIO',
      expandCollapseIds: [],
      targetDomId: 'btn-open-fullscreen-ai-command',
      actionLabel: 'Mở Trung Tâm AI Để Duyệt Prompt & Dùng Cầu Nối Argon 4',
    },
    {
      id: 'FEAT_TAB5_MP3_AND_NATURE',
      category: 'TAB5',
      categoryLabel: 'Tab 5: Nhạc, Pomodoro & Nền',
      title: 'Trình Phát MP3 Cá Nhân Lặp Chính Xác Đoạn A-B & 7 Âm Thanh Tự Nhiên Ngoại Tuyến',
      badge: 'Audio không quảng cáo',
      moduleRef: 'Mod 21',
      summary:
        'Nạp file MP3/WAV yêu thích từ máy và đặt điểm lặp A-B đúng đoạn cao trào bạn thích nghe khi viết cảnh đánh nhau hay cảnh buồn, hoặc phối trộn tiếng mưa, lửa trại, quán cà phê tạo bằng WebAudio 0MB.',
      whenToUse:
        'Mỗi phiên viết cần âm thanh ổn định giữ cảm xúc, không bị quảng cáo YouTube làm đứt mạch văn.',
      stepByStep: [
        'Ở Tab 5, bấm "Nạp file MP3 từ máy" (hoặc bật 1 âm thanh tự nhiên như Tiếng mưa, Lò sưởi).',
        'Khi bài hát chạy tới điểm muốn lặp, bấm "Đặt A" rồi tới đoạn kết bấm "Đặt B" -> vòng lặp A-B sẽ chạy chuẩn xác từng giây.',
        'Có thể thu gọn cửa sổ ra thanh Nhạc Nổi góc màn hình để chuyển bài hoặc đổi âm lượng bất kỳ lúc nào.',
      ],
      proTip:
        'Bấm nút X trên thanh Nhạc nổi nếu muốn ẩn hẳn khi không nghe, và vào mục Quản lý ở Tab 5 để bật hiện lại.',
      relatedIds: ['FEAT_FLOATING_COLLAPSE_DESIGN', 'FEAT_TAB5_POMODORO_SYNC'],
      screenKey: 'SCREEN_5_AMBIENCE',
      expandCollapseIds: [],
      targetDomId: 'btn-s8-load-mp3',
      actionLabel: 'Đi tới Trình Phát Nhạc MP3 Tab 5',
    },
    {
      id: 'FEAT_TAB5_POMODORO_SYNC',
      category: 'TAB5',
      categoryLabel: 'Tab 5: Nhạc, Pomodoro & Nền',
      title: 'Đồng Hồ Pomodoro Đồng Bộ 2 Chiều & Đếm Số Chữ Viết Trong Phiên',
      badge: '1 nguồn thời gian chung',
      moduleRef: 'Mod 20',
      summary:
        'Dù bạn bấm Bắt đầu / Tạm dừng / Đặt lại trong Tab 5 hay trên thanh Pomodoro kéo thả nổi ở màn hình khác, cả hai đều chạy chung một bộ đếm trung tâm tuyệt đối không bao giờ lệch giây.',
      whenToUse:
        'Áp dụng kỷ luật 25 phút viết liên tục + 5 phút nghỉ ngơi để tăng sản lượng từ mỗi ngày.',
      stepByStep: [
        'Đặt số phút Phiên viết (mặc định 25p) và Phút nghỉ (5p) trong Tab 5.',
        'Bấm "Bắt đầu Pomodoro" — đồng hồ nhỏ ở thanh nổi cũng lập tức nhảy số theo thời gian thực.',
        'Khi quay về Tab 1 viết chữ, số từ bạn mới gõ được tự cộng vào thống kê "Số chữ phiên này".',
      ],
      proTip:
        'Kéo thanh Pomodoro nổi đặt ở góc ít che chữ nhất, hoặc thu gọn lại thành một viên pin đồng hồ siêu nhỏ.',
      relatedIds: ['FEAT_FLOATING_COLLAPSE_DESIGN', 'FEAT_TAB5_TYPOGRAPHY_CARE'],
      screenKey: 'SCREEN_5_AMBIENCE',
      expandCollapseIds: [],
      targetDomId: 'btn-tab5-pomo-toggle',
      actionLabel: 'Đi tới Bộ Đếm Pomodoro Tab 5',
    },
    {
      id: 'FEAT_TAB5_TYPOGRAPHY_CARE',
      category: 'TAB5',
      categoryLabel: 'Tab 5: Nhạc, Pomodoro & Nền',
      title: '5 Bộ Mẫu Typography Sách In, Chế Độ Đèn Đêm 3400K & Khung Xem Trước Trực Tiếp',
      badge: 'Bảo vệ mắt đêm khuya',
      moduleRef: 'Mod 22',
      summary:
        'Một cú nhấp chuột để áp dụng ngay kiểu chữ chuẩn Light Novel (Merriweather / Lora / Inter), cỡ chữ, giãn dòng, thụt đầu dòng tiểu thuyết và bộ lọc ánh sáng xanh dịu êm cho phiên viết sau 23h đêm.',
      whenToUse:
        'Khi thấy chữ quá nhỏ, quá khít hoặc màn hình quá chói vào ban đêm.',
      stepByStep: [
        'Vào Tab 5, chọn 1 trong 5 bộ mẫu sách ("Chuẩn Light Novel Hiện Đại", "Đêm Khuya Chữ Lớn Chống Mỏi Mắt"...).',
        'Quan sát ngay chữ đổi kiểu trong khung Live Typography Preview kế bên.',
        'Chọn mức "3400K Ánh Nến Đêm Khuya" nếu đang viết trong phòng tắt đèn.',
      ],
      proTip:
        'Cài đặt Typography ở Tab 5 tự động lưu theo sở thích để áp dụng xuyên suốt khi quay lại Tab 1.',
      relatedIds: ['FEAT_TAB5_WALLPAPERS', 'FEAT_TAB6_EXPORT_PDF_CUSTOM'],
      screenKey: 'SCREEN_5_AMBIENCE',
      expandCollapseIds: [],
      targetDomId: 's14-screen-5-ambience',
      actionLabel: 'Đi tới Tùy Chỉnh Chữ & Ánh Sáng Tab 5',
    },
    {
      id: 'FEAT_TAB5_FLOATING_BAR_MANAGER',
      category: 'TAB5',
      categoryLabel: 'Tab 5: Nhạc, Pomodoro & Nền',
      title: 'Bảng Bật / Tắt & Đặt Lại Vị Trí Thanh Nhạc Nổi & Thanh Pomodoro Nổi',
      badge: 'Quản lý thanh nổi',
      moduleRef: 'Mod 20, 21, 29',
      summary:
        'Khi bạn bấm dấu X tắt hẳn thanh Nhạc hoặc thanh Pomodoro trên màn hình viết cho gọn, bảng quản lý ngay trong Tab 5 cho phép bạn gọi hiện lại tức thì hoặc đưa chúng về vị trí ban đầu nếu lỡ kéo khuất mép.',
      whenToUse:
        'Mỗi khi đã bấm X ẩn thanh Pomodoro/Nhạc nổi và muốn mở lại, hoặc sau khi xoay/đổi kích thước màn hình.',
      stepByStep: [
        'Mở Tab 5 — cuộn tới bảng "Quản Lý Hiện/Ẩn Thanh Nhạc & Pomodoro Nổi".',
        'Bấm bật lại "Thanh Nhạc Nổi" hoặc "Thanh Pomodoro Nổi" bằng 1 lần chạm.',
        'Nếu lỡ kéo thanh ra góc khó bấm, dùng nút "Đặt Lại Vị Trí Các Thanh Nổi" để căn về chỗ mặc định.',
      ],
      proTip:
        'Riêng Thanh AI Nổi có mục đóng/mở độc lập ngay ở phần đầu Tab 6 để phân tách đúng trách nhiệm từng khu vực!',
      relatedIds: ['FEAT_TAB6_FLOATING_AI_RESTORE', 'FEAT_FLOATING_COLLAPSE_DESIGN'],
      screenKey: 'SCREEN_5_AMBIENCE',
      expandCollapseIds: [],
      targetDomId: 'tab5-floating-bars-restore-panel',
      actionLabel: 'Đi tới Bảng Mở Lại Thanh Nhạc & Pomodoro',
    },

    // ========================================================================
    // PHÂN KHU 7: TAB 6 - PHIÊN BẢN, XUẤT FILE & HỆ THỐNG
    // ========================================================================
    {
      id: 'FEAT_TAB6_TIME_MACHINE',
      category: 'TAB6',
      categoryLabel: 'Tab 6: Phiên Bản & Xuất Sách',
      title: 'Kho Phiên Bản Time-Machine: Lưu Liên Tục, Xem Trước Toàn Màn Hình & Khôi Phục An Toàn',
      badge: 'Không bao giờ mất chữ',
      moduleRef: 'Mod 10',
      summary:
        'Tự động chụp ảnh toàn bộ bản thảo + Story Bible thành từng cột mốc theo thời gian; cho phép bấm vào bất kỳ mốc cũ nào để xem trước (Preview) trạng thái cũ hoặc phóng to so sánh trước-sau rồi khôi phục 1-Click.',
      whenToUse:
        'Khi lỡ tay xóa nhầm cả đoạn dài, muốn đọc lại một phiên bản viết nháp cũ tối hôm qua hoặc hoàn tác trước khi chỉnh sửa lớn.',
      stepByStep: [
        'Mở nút "Phiên Bản" nhanh trên thanh đầu hoặc vào mục Kho Phiên Bản ở Tab 6.',
        'Chọn một mốc thời gian cũ để xem trước nội dung và thông số lúc đó.',
        'Bấm "Xem Toàn Màn Hình" để so sánh chi tiết, hoặc bấm "Khôi Phục Phiên Bản Này" để đưa về bản thảo ngay.',
      ],
      proTip:
        'Mỗi lần bạn tự bấm nút "Tạo Mốc Phiên Bản Ngay", mốc đó được đánh dấu rõ để dễ tìm lại trước các lần sửa thử nghiệm.',
      relatedIds: ['FEAT_GATE_BACKSPACE_SHIELD', 'FEAT_TAB6_JSON_BACKUP'],
      screenKey: 'SCREEN_6_SYSTEM',
      expandCollapseIds: [['tab6-version-vault-collapsible-body', 'btn-toggle-tab6-vault']],
      targetDomId: 'btn-create-manual-version',
      actionLabel: 'Đi tới Kho Phiên Bản Time-Machine Tab 6',
    },
    {
      id: 'FEAT_TAB6_EXPORT_DOCX_OOXML',
      category: 'TAB6',
      categoryLabel: 'Tab 6: Phiên Bản & Xuất Sách',
      title: 'Xuất File Word .DOCX Chuẩn OOXML ZIP Thực Thụ (Mở Mượt Trên Word & Google Docs)',
      badge: 'Sửa lỗi file hỏng',
      moduleRef: 'Mod 26',
      summary:
        'Đóng gói tệp .DOCX nhị phân chuẩn OpenXML thực thụ (đủ cấu trúc ZIP + word/document.xml + header/footer/styles), giữ nguyên font chữ, cỡ chữ, bìa sách 1 trang, tiêu đề canh giữa Tên Tác Phẩm và số trang 1, 2, 3 gọn gàng.',
      whenToUse:
        'Khi cần tải bản thảo về máy để biên tập tiếp trong Microsoft Word, gửi cho biên tập viên nhà xuất bản hoặc tải lên Google Docs.',
      stepByStep: [
        'Mở Hộp thoại Xuất Sách (từ Tab 6 hoặc từ thanh Công cụ biên tập ở Tab 1 / Tab 2).',
        'Xác nhận 3 thông tin: Tên tác phẩm (gõ mới hoặc chọn từ danh sách đã lưu), Chương mấy (chọn từ Tab 2 hoặc toàn bộ), và Tên tác giả.',
        'Bấm nút xanh "Xuất File .DOCX" — file tải về có phần đầu chuẩn ZIP mở mượt trực tiếp trên mọi bộ gõ văn phòng!',
      ],
      proTip:
        'Header trong file Word và PDF chỉ đặt canh giữa đúng Tên Tác Phẩm, Footer chỉ đếm số trang đơn giản chứ không chèn ngày giờ rườm rà.',
      relatedIds: ['FEAT_TAB6_EXPORT_PDF_CUSTOM', 'FEAT_TAB4_NOTEBOOKLM_COMPANION'],
      screenKey: 'SCREEN_6_SYSTEM',
      expandCollapseIds: [],
      targetDomId: 'btn-s6-open-custom-export',
      actionLabel: 'Mở Hộp Thoại Xuất .DOCX / .PDF',
      optionalOpenModal: 'exporter',
    },
    {
      id: 'FEAT_TAB6_EXPORT_PDF_CUSTOM',
      category: 'TAB6',
      categoryLabel: 'Tab 6: Phiên Bản & Xuất Sách',
      title: 'Xuất Sách .PDF Tùy Chỉnh Font/Cỡ Chữ, Bìa Sách Gói 1 Trang & NXB "Web tiểu thuyết của Bi"',
      badge: 'Chế bản sách in',
      moduleRef: 'Mod 26',
      summary:
        'Trang bìa được khóa tỷ lệ in nằm gọn nghiêm ngặt trong đúng 1 trang đầu với thương hiệu Nhà xuất bản "Web tiểu thuyết của Bi"; hỏi rõ Tên tác phẩm, Số chương, Tác giả (nhắc bản quyền nếu khác tên) và in Header/Footer sạch sẽ.',
      whenToUse:
        'Khi muốn in bản thảo thành sách điện tử .PDF đẹp như sách giấy phát hành hoặc gộp PDF nạp vào NotebookLM.',
      stepByStep: [
        'Mở Hộp Thoại Xuất Sách; kiểm tra/chọn Tên tác phẩm (lịch sử lưu sẵn), Chương muốn xuất và Tên tác giả.',
        'Chọn Font chữ (Merriweather, Times New Roman, Lora...), Cỡ chữ (pt), Giãn dòng, Khổ giấy và Màu giấy.',
        'Xem ngay Khung Xem Thử Bìa & Văn Bản Trực Tiếp ở bên dưới, rồi bấm "Xuất / In .PDF Ngay" (chọn Save as PDF).',
      ],
      proTip:
        'Trong hộp thoại Print của Chrome/Edge, nhớ bỏ chọn "Headers and footers" của trình duyệt để vùng lề hiển thị đúng @page Tên Tác Phẩm & Số Trang của Studio.',
      relatedIds: ['FEAT_TAB6_EXPORT_DOCX_OOXML', 'FEAT_TAB4_NOTEBOOKLM_COMPANION'],
      screenKey: 'SCREEN_6_SYSTEM',
      expandCollapseIds: [],
      targetDomId: 'btn-s6-open-custom-export',
      actionLabel: 'Mở Chế Bản Sách .PDF & .EPUB',
      optionalOpenModal: 'exporter',
    },
    {
      id: 'FEAT_TAB6_VIDEO_TUTORIAL_BILINGUAL',
      category: 'TAB6',
      categoryLabel: 'Tab 6: Phiên Bản & Xuất Sách',
      title: 'Video Hướng Dẫn Tương Tác Giao Diện Thật: Tua Theo Mốc Tính Năng, Giọng Đọc Cute & Phụ Đề VI/EN',
      badge: 'Học trực quan A-Z',
      moduleRef: 'Mod 28',
      summary:
        'Trình phát Video minh họa mô phỏng đúng giao diện 6 Tab và các thanh nổi của website; cho phép bấm trực tiếp vào mốc từng Tab/chức năng để tua tới đúng giây cần xem, bật giọng đọc AI tự nhiên dễ thương (Tiếng Việt / English) cùng phụ đề song ngữ.',
      whenToUse:
        'Khi mới dùng lần đầu hoặc khi muốn giới thiệu cách vận hành website cho cộng tác viên bằng cả tiếng Việt lẫn tiếng Anh.',
      stepByStep: [
        'Mở thẻ "Video Hướng Dẫn & Nhật Ký" tại Tab 6 (hoặc từ thanh Công cụ nhanh).',
        'Chọn bật/tắt nút "Giọng đọc AI Cute", đổi ngôn ngữ giọng Việt / Anh và chế độ Phụ đề Song ngữ VI + EN.',
        'Bấm vào dải màu thời gian, các thẻ mốc Tab/Chức năng bên dưới khung video hoặc từng câu lời thoại để nhảy thẳng tới phần muốn học.',
      ],
      proTip:
        'Nên dùng trình duyệt Edge hoặc Chrome mới nhất để Web Speech API đọc được các giọng tự nhiên nhất cho cả Tiếng Việt và Tiếng Anh!',
      relatedIds: ['FEAT_FLOATING_BI_MASCOT', 'FEAT_TAB6_API_VAULT_AND_CHECK'],
      screenKey: 'SCREEN_6_SYSTEM',
      expandCollapseIds: [],
      targetDomId: 'btn-s6-card-tutorial',
      actionLabel: 'Mở Video Hướng Dẫn Song Ngữ Ngay',
      optionalOpenModal: 'tutorial',
    },
    {
      id: 'FEAT_TAB6_FLOATING_AI_RESTORE',
      category: 'TAB6',
      categoryLabel: 'Tab 6: Phiên Bản & Xuất Sách',
      title: 'Mục Riêng Quản Lý & Mở Lại Thanh AI Nổi (Khi Đã Bấm X Tắt Ở Màn Hình Chính)',
      badge: 'Tách biệt gọn gàng',
      moduleRef: 'Mod 27 & Mod 29',
      summary:
        'Nếu bạn bấm nút X để tắt hẳn Thanh AI Nổi (trên đó có nút AI 5 Chế Độ và Chat Bi Số 8) khỏi bàn viết, mục chuyên biệt ở Tab 6 hiển thị rõ trạng thái Đang Ẩn/Hiện và cho phép mở lại ngay.',
      whenToUse:
        'Sau khi bạn tắt Thanh AI Nổi bằng dấu X để tập trung viết tay hoàn toàn và lúc sau cần gọi thanh đó trở lại.',
      stepByStep: [
        'Chuyển sang Tab 6 (hoặc nhấn Alt + 6).',
        'Nhìn bảng "Thanh AI Rút Gọn & Trợ Lý Viên Bi Số 8" ngay phía dưới Time-Machine.',
        'Bấm nút "Hiện & Định Tâm Thanh AI Nổi" để thanh quay trở lại góc màn hình.',
      ],
      proTip:
        'Bạn cũng có thể bấm nút "Đặt Lại Vị Trí 3 Thanh Nổi" nếu cả 3 thanh từng bị kéo đi xa mép màn hình.',
      relatedIds: ['FEAT_FLOATING_COLLAPSE_DESIGN', 'FEAT_TAB5_FLOATING_BAR_MANAGER'],
      screenKey: 'SCREEN_6_SYSTEM',
      expandCollapseIds: [],
      targetDomId: 'btn-tab6-reopen-floating-ai',
      actionLabel: 'Đi tới Mục Mở Lại Thanh AI Nổi Tab 6',
    },
    {
      id: 'FEAT_TAB6_API_VAULT_AND_CHECK',
      category: 'TAB6',
      categoryLabel: 'Tab 6: Phiên Bản & Xuất Sách',
      title: 'Két Sắt API Key Gemini & Kiểm Định Hệ Thống Thuần Khiết 31 Module',
      badge: 'Đồng bộ đa màn',
      moduleRef: 'Mod 15 & Mod 30',
      summary:
        'Xem chi tiết mô hình đang kích hoạt, danh sách endpoint khả dụng trên Key hiện tại, thay Key khẩn cấp và mở bảng Kiểm Định Kiến Trúc xác minh toàn bộ 31 Module + các ID DOM cốt lõi.',
      whenToUse:
        'Khi muốn đổi API Key dự phòng, kiểm tra xem Key hiện tại có bị giới hạn khu vực hay kiểm tra sức khỏe tổng thể của ứng dụng.',
      stepByStep: [
        'Trong Tab 6, bấm nút "Kiểm Tra / Đổi Key & Thư Mục Kết Nối" hoặc mở Thẻ Công Cụ Hệ Thống -> "API Key".',
        'Dán Key mới rồi bấm Lưu & Xác Thực Flash-Lite để tất cả Tab 1, Tab 3, Tab 4 và Chat Bi Số 8 cập nhật tức thời.',
        'Bấm "Mở Kiểm Định Hệ Thống" để xem báo cáo kiểm chứng từng module từ Mod 01 đến Mod 31.',
      ],
      proTip:
        'Phím cứu hộ khẩn cấp Ctrl + Shift + Alt + R giúp dọn sạch mọi modal bị kẹt và căn chỉnh lại bố cục nếu gặp lỗi hiển thị đột ngột.',
      relatedIds: ['FEAT_GATE_GOOGLE_STUDIO', 'FEAT_TAB3_REAL_MODELS_AND_THINKING'],
      screenKey: 'SCREEN_6_SYSTEM',
      expandCollapseIds: [],
      targetDomId: 'btn-s6-open-connection-gate',
      actionLabel: 'Đi tới Kiểm Tra API Key & Thư Mục',
    },
    {
      id: 'FEAT_TAB6_JSON_BACKUP',
      category: 'TAB6',
      categoryLabel: 'Tab 6: Phiên Bản & Xuất Sách',
      title: 'Két Sắt Dự Phòng .JSON Toàn Dự Án & Chia Sẻ Gói Sáng Tác / Cài Thành App (PWA)',
      badge: 'Di chuyển đa thiết bị',
      moduleRef: 'Mod 04 & Mod 05',
      summary:
        'Đóng gói toàn bộ cây chương, Story Bible, Nhân vật, Ma trận Ai Biết Gì và lịch sử phiên bản thành một tệp .JSON duy nhất để mang sang máy khác, hoặc cài thẳng trang web thành Ứng dụng độc lập trên Desktop/Mobile.',
      whenToUse:
        'Khi muốn chuyển toàn bộ dự án truyện từ laptop sang điện thoại, sao lưu cuối tuần lên Google Drive, hoặc cài app chạy ngoại tuyến.',
      stepByStep: [
        'Cuộn xuống Két Sắt Dữ Liệu Đa Tầng ở Tab 6.',
        'Bấm "Xuất File Dự Phòng .JSON" để lưu nguyên cục dữ liệu tác phẩm về máy.',
        'Hoặc bấm "Cài Thành App Trên Thiết Bị" để ghim biểu tượng Noir Studio lên màn hình chính.',
      ],
      proTip:
        'Tệp .JSON dự phòng mở lại được ở bất kỳ trình duyệt nào hoàn toàn sạch sẽ không mất một dấu phẩy.',
      relatedIds: ['FEAT_GATE_DISK_FOLDER', 'FEAT_TAB6_TIME_MACHINE'],
      screenKey: 'SCREEN_6_SYSTEM',
      expandCollapseIds: [],
      targetDomId: 'btn-export-workspace-json',
      actionLabel: 'Đi tới nút Xuất Dự Phòng .JSON Tab 6',
    },

    // ========================================================================
    // PHÂN KHU 8: THANH NỔI KÉO THẢ & TRỢ LÝ VIÊN BI SỐ 8
    // ========================================================================
    {
      id: 'FEAT_FLOATING_COLLAPSE_DESIGN',
      category: 'FLOATING',
      categoryLabel: 'Thanh Nổi & Bé Bi Số 8',
      title: '3 Thanh Nổi Thu Gọn Sẵn Khi Đăng Nhập: Kéo Thả Tự Do, Rút Gọn & Đóng Bằng Nút X',
      badge: 'Chống rối màn hình',
      moduleRef: 'Mod 20, 21, 27, 29',
      summary:
        'Thanh Pomodoro, Thanh Âm Nhạc và Thanh AI mặc định thu gọn tinh tế ngay lần đăng nhập đầu tiên; bạn có thể nắm phần đầu kéo trượt tự do đi khắp màn hình, bấm rút gọn hoặc bấm dấu X tắt hẳn.',
      whenToUse:
        'Luôn xuất hiện nhỏ gọn ở các góc màn hình khi làm việc trên mọi Tab để bạn bật nhạc, xem giờ tập trung hoặc mở AI trong 1 giây.',
      stepByStep: [
        'Nhấn vào biểu tượng kéo (hoặc thanh tiêu đề nhỏ) để trượt thanh tới vị trí thoáng nhất.',
        'Bấm nút thu gọn (-) để ép thanh về kích thước viên thuốc siêu nhỏ, không che văn bản.',
        'Bấm dấu X nếu muốn tắt hoàn toàn thanh đó; bật lại thanh Nhạc/Pomodoro ở Tab 5 và thanh AI ở Tab 6.',
      ],
      proTip:
        'Vị trí kéo thả và trạng thái thu gọn được ghi nhớ xuyên suốt các lần bạn chuyển Tab 1..6.',
      relatedIds: ['FEAT_TAB5_FLOATING_BAR_MANAGER', 'FEAT_TAB6_FLOATING_AI_RESTORE'],
      screenKey: null,
      expandCollapseIds: [],
      targetDomId: 's11-mascot-bi-corner',
      actionLabel: 'Làm nổi bật Thanh AI & Mascot Nổi',
    },
    {
      id: 'FEAT_FLOATING_BI_MASCOT',
      category: 'FLOATING',
      categoryLabel: 'Thanh Nổi & Bé Bi Số 8',
      title: 'Trợ Lý Viên Bi Số 8 Với 2 Chế Độ Tách Biệt & Nút Dẫn Thẳng Tới Tính Năng Phát Sáng',
      badge: '2 chế độ thông minh',
      moduleRef: 'Mod 27',
      summary:
        'Viên Bi Số 8 tự phân biệt hai chế độ độc lập: (1) Hướng dẫn & Hỗ trợ tính năng Web (trả lời đúng trọng tâm chức năng, không tán gẫu lan man và gắn nút dẫn thẳng + phát sáng tới đúng nút cần dùng), (2) Phòng chat tán gẫu / bàn ý tưởng sáng tạo tự do. Kèm nút ✕ Đóng/Thoát rõ ràng.',
      whenToUse:
        'Khi quên một nút chức năng nằm ở Tab nào, muốn lắc bi gieo ý tưởng twist ngẫu nhiên, đặt tên nhân vật Nhật/Việt hoặc trò chuyện giải khuây cùng Gemini.',
      stepByStep: [
        'Bấm nút "Chat Bi" trên thanh AI nổi hoặc quả cầu Bi Số 8 góc dưới bên phải để mở cửa sổ chat.',
        'Hỏi thẳng "Làm sao xuất file Word?" hoặc "Chỗ đổi ảnh nền ở đâu?" -> Bi nhận diện Chế độ Hướng dẫn Web, giải thích ngắn gọn kèm nút bấm xanh dẫn thẳng và làm phát sáng nút đích.',
        'Muốn tâm sự, tán gẫu hoặc hỏi kiến thức đời thường -> Bi tự chuyển Chế độ Tán gẫu tự do (không còn kẹp khung chẩn đoán chương thừa thãi). Khi xong bấm ✕ Đóng hoặc phím Esc.',
      ],
      proTip:
        'Trong cửa sổ Chat Bi Số 8 bạn cũng chọn được thẳng Mô hình (Flash / Pro / Flash-Lite) và Mức tư duy liên kết chung một API Key!',
      relatedIds: ['FEAT_TAB3_REAL_MODELS_AND_THINKING', 'FEAT_FLOATING_COLLAPSE_DESIGN'],
      screenKey: null,
      expandCollapseIds: [],
      targetDomId: 'btn-open-free-gemini-chat',
      actionLabel: 'Mở Ngay Trợ Lý Viên Bi Số 8',
      optionalOpenModal: 'chat',
    },
    {
      id: 'FEAT_FLOATING_TOOLTIPS_HUMANIZED',
      category: 'FLOATING',
      categoryLabel: 'Thanh Nổi & Bé Bi Số 8',
      title: 'Hệ Thống Chú Giải Nổi (Hover Note 1 Giây) Văn Phong Tự Nhiên Trên Mọi Nút Bấm',
      badge: 'Dễ hiểu không thuật ngữ rối',
      moduleRef: 'Mod 29 & Mod 30',
      summary:
        'Rê chuột lên bất kỳ nút bấm hoặc thanh điều khiển nào trên website và dừng khoảng 1 giây, một thẻ chú giải súc tích, thân thiện sẽ hiện ra giải thích nút đó làm gì và dùng vào lúc nào.',
      whenToUse:
        'Bất kỳ lúc nào bạn nhìn thấy một biểu tượng hoặc nút lạ và muốn biết công dụng trước khi bấm thử.',
      stepByStep: [
        'Di con trỏ chuột lên nút bấm bạn đang tò mò và giữ yên khoảng 1 giây.',
        'Đọc thẻ chú giải hiển thị ngay phía trên hoặc dưới nút.',
        'Toàn bộ cụm từ hàn lâm khó hiểu đã được biên tập lại theo ngôn ngữ đời thường cho tác giả dễ nắm bắt.',
      ],
      proTip:
        'Nếu đọc chú giải vẫn muốn xem hướng dẫn từng bước chi tiết hơn, hãy mở ngay Bách Khoa Tính Năng này ở Tab 6 hoặc hỏi Bi Số 8.',
      relatedIds: ['FEAT_FLOATING_BI_MASCOT', 'FEAT_TAB6_VIDEO_TUTORIAL_BILINGUAL'],
      screenKey: 'SCREEN_6_SYSTEM',
      expandCollapseIds: [],
      targetDomId: 'tab6-mod31-feature-directory-root',
      actionLabel: 'Xem Đang Ở Bách Khoa Tab 6',
    },
  ]);

  const WORKFLOW_PLAYBOOKS_CATALOG = Object.freeze([
    {
      id: 'WF_FIRST_SETUP',
      title: 'Quy Trình 1: Khởi Động An Toàn Lần Đầu (Chỉ Mất 60 Giây)',
      audience: 'Người mới mở Web viết tiểu thuyết của Bi',
      tone: 'emerald',
      steps: [
        {
          label: 'Bước 1: Lấy & Dán Gemini API Key',
          detail: 'Bấm nút mở Google AI Studio ở Cổng kết nối -> copy Key -> dán vào ô xác thực bằng Flash-Lite.',
          screenKey: 'SCREEN_6_SYSTEM',
          targetDomId: 'btn-s6-open-connection-gate',
        },
        {
          label: 'Bước 2: Chọn Thư Mục Ổ Cứng Làm Việc',
          detail: 'Chọn thư mục thật trên PC (hoặc đặt tên kho lưu trên Mobile) để hệ thống ghi file sao lưu tự động.',
          screenKey: 'SCREEN_6_SYSTEM',
          targetDomId: 'btn-connect-local-folder',
        },
        {
          label: 'Bước 3: Chỉnh Font Chữ & Không Gian Nền Mắt Dịu',
          detail: 'Ghé Tab 5 chọn kiểu chữ Light Novel + hiệu ứng Mưa Trên Kính và thanh Độ rõ nền theo sở thích.',
          screenKey: 'SCREEN_5_AMBIENCE',
          targetDomId: 'btn-upload-custom-bg',
        },
      ],
    },
    {
      id: 'WF_WRITE_CLEAN_CHAPTER',
      title: 'Quy Trình 2: Viết Chương Mới Chuẩn Văn Phong Người Thật (Kết Hợp AI Tab 3 & Diff Tab 1)',
      audience: 'Viết từng chương mới giàu cảm xúc, không sáo ngữ',
      tone: 'indigo',
      steps: [
        {
          label: 'Bước 1: Chọn Đúng Chế Độ AI & Thông Số Ở Tab 3',
          detail: 'Mở Khung Lệnh AI Tab 3 -> chọn Chế độ 1 (Viết bản nháp), chọn Flash hoặc Pro + Tư duy Trung bình/Cao.',
          screenKey: 'SCREEN_3_AI',
          targetDomId: 'btn-open-fullscreen-ai-command',
        },
        {
          label: 'Bước 2: Nhấn Enter -> Soát Prompt Tổng Hợp Kèm Story Bible',
          detail: 'Kiểm tra phần Story Bible đã copy thẳng vào Prompt -> bấm "Bắt Đầu Chạy Prompt Chính Thức" và giữ màn hình chờ hoàn tất.',
          screenKey: 'SCREEN_3_AI',
          targetDomId: 'tab3-unified-output-topbar',
        },
        {
          label: 'Bước 3: Đưa Sang Tab 1 Soi Màu Diff Google Docs & Ngũ Quan',
          detail: 'Bấm "Chèn nối tiếp" -> duyệt từng cụm màu chữ AI ở Tab 1, sửa từ sáo rỗng bằng Từ điển Ngũ quan.',
          screenKey: 'SCREEN_1_WRITE',
          targetDomId: 'btn-ai-diff-toggle-edit-view',
        },
        {
          label: 'Bước 4: Bấm "Duyệt & Chốt Bản Thảo"',
          detail: 'Cập nhật Story Bible lũy tiến từ Chương 1 đến chương vừa hoàn thành để khóa chặt trí nhớ cho hồi kế tiếp.',
          screenKey: 'SCREEN_1_WRITE',
          targetDomId: 'btn-approve-chapter',
        },
      ],
    },
    {
      id: 'WF_LONG_EPIC_NOTEBOOKLM',
      title: 'Quy Trình 3: Quản Lý Đại Trường Thiên Hàng Trăm Chương Không Bị Quên Cốt Truyện',
      audience: 'Truyện dài từ 30 đến 300+ chương',
      tone: 'amber',
      steps: [
        {
          label: 'Bước 1: Xuất PDF Gộp Toàn Bộ Chương Trong Tab 4',
          detail: 'Bấm nút "Tải PDF Gộp Toàn Bộ Chương" ngay trong thẻ hướng dẫn NotebookLM tại Tab 4 và Save as PDF.',
          screenKey: 'SCREEN_4_BIBLE',
          targetDomId: 'tab4-notebooklm-guide-card',
        },
        {
          label: 'Bước 2: Tạo Sổ Tay NotebookLM & Copy Prompt Chi Tiết',
          detail: 'Bấm link mở thẳng NotebookLM -> nạp file PDF vừa tạo -> bấm Sao chép Prompt mẫu chi tiết rồi dán chạy bên NotebookLM.',
          screenKey: 'SCREEN_4_BIBLE',
          targetDomId: 'btn-tab4-copy-notebooklm-prompt',
        },
        {
          label: 'Bước 3: Dán Kết Quả Vào Khung Story Bible & Vẽ Biểu Đồ Mode 5',
          detail: 'Dán bản tổng hợp siêu chi tiết từ NotebookLM vào Story Bible Tab 4, sau đó qua Tab 3 chạy Chế độ 5 vẽ sơ đồ toàn cục.',
          screenKey: 'SCREEN_3_AI',
          targetDomId: 'btn-mode5-generate-diagram',
        },
      ],
    },
    {
      id: 'WF_PUBLISH_PDF_DOCX',
      title: 'Quy Trình 4: Đóng Gói Xuất Sách Đẹp (.DOCX Mở Mượt & .PDF Bìa 1 Trang)',
      audience: 'Xuất bản, gửi biên tập hoặc lưu trữ in ấn',
      tone: 'sky',
      steps: [
        {
          label: 'Bước 1: Rà Lỗi Chính Tả & Sáo Ngữ Lần Cuối',
          detail: 'Chạy Quét Từ Sáo Rỗng ở Tab 4 và Chuẩn Hóa Thoại Nhanh ở Tab 2.',
          screenKey: 'SCREEN_4_BIBLE',
          targetDomId: 'btn-scan-cliches',
        },
        {
          label: 'Bước 2: Điền Đúng Tên Tác Phẩm, Chọn Chương & Bút Danh',
          detail: 'Mở Xuất Sách Tab 6 -> nhập/chọn Tên tác phẩm, chọn chương cụ thể từ Tab 2 (hoặc tất cả) và kiểm tra bút danh.',
          screenKey: 'SCREEN_6_SYSTEM',
          targetDomId: 'btn-s6-open-custom-export',
        },
        {
          label: 'Bước 3: Tải .DOCX OOXML Hoặc In .PDF Header/Footer Chuẩn',
          detail: 'File .DOCX đóng gói chuẩn ZIP mở trực tiếp trên Word/Google Docs; PDF giữ Bìa gọn 1 trang NXB "Web tiểu thuyết của Bi", tiêu đề giữa đầu trang và số trang đơn giản.',
          screenKey: 'SCREEN_6_SYSTEM',
          targetDomId: 'btn-s6-open-custom-export',
          optionalOpenModal: 'exporter',
        },
      ],
    },
  ]);

  const SHORTCUTS_AND_MOBILE_GUIDE = Object.freeze([
    { keys: 'Alt + 1 .. 6', scope: 'Toàn Studio (PC)', desc: 'Chuyển nhanh giữa 6 màn hình chính không cần dùng chuột.' },
    { keys: 'Enter (tại ô Lệnh Tab 3)', scope: 'Khung Lệnh AI', desc: 'Chạy nhanh Prompt Tổng Hợp (bật hộp xác nhận Có/Không; Shift+Enter để xuống dòng).' },
    { keys: 'Ctrl + S', scope: 'Tab 1 & Toàn app', desc: 'Ép lưu 3 tầng (RAM/LocalStorage + IndexedDB + Ổ cứng thật) và đóng băng 1 mốc an toàn.' },
    { keys: 'Ctrl + F', scope: 'Tab 1 (Bàn viết)', desc: 'Mở nhanh thanh Tìm Kiếm & Thay Thế hàng loạt trong chương hiện tại.' },
    { keys: 'F11', scope: 'Tab 1', desc: 'Bật hoặc tắt Chế độ Tập Trung Toàn Màn Hình (Zen Mode).' },
    { keys: 'Ctrl + Shift + L', scope: 'Tab 4 / Biên tập', desc: 'Quét nhanh cụm từ sáo rỗng AI (Anti-Cliché) và nhịp điệu đoạn văn.' },
    { keys: 'Esc', scope: 'Cửa sổ nổi / Chat Bi', desc: 'Đóng nhanh hộp thoại trên cùng hoặc cửa sổ Trợ lý Bi Số 8 đang mở.' },
    { keys: 'Ctrl + Shift + Alt + R', scope: 'Cứu hộ khẩn cấp', desc: 'Dọn màn hình chờ lỡ bị kẹt và khôi phục lại trạng thái nút bấm bình thường.' },
  ]);

  const TROUBLESHOOTING_FAQ_CATALOG = Object.freeze([
    {
      id: 'FAQ_BLACK_WALLPAPER',
      question: 'Tại sao chọn Tranh nền hoặc Mưa Trên Kính mà thấy màn hình vẫn tối đen?',
      answer:
        'Trước đây nền thẻ nội dung đặt đặc gần 100% làm che mất hình nền phía sau. Bản mới đã mở lớp kính mờ bán trong suốt — bạn chỉ cần qua Tab 5 kéo thanh "Độ rõ nền" lên khoảng 65–85% và kéo giảm "Độ tối lớp kính chắn" xuống dưới 40% là nhìn thấy rõ hiệu ứng và tranh nền ngay!',
      screenKey: 'SCREEN_5_AMBIENCE',
      targetDomId: 'btn-upload-custom-bg',
      btnLabel: 'Chỉnh Độ Rõ Nền Tab 5',
    },
    {
      id: 'FAQ_BIBLE_STUCK_CH1',
      question: 'Duyệt tới 3–5 chương rồi mà Story Bible không cập nhật đủ tới chương cuối?',
      answer:
        'Bản mới đã sửa `mod19` và `mod08` để luôn đọc lũy tiến từ Chương 1 tới chương mới duyệt cuối cùng (không bỏ sót). Ngoài ra với truyện hàng trăm chương, hãy mở thẻ NotebookLM ngay trong Tab 4 để tải PDF gộp toàn bộ truyện và tạo Story Bible không quên chi tiết nào.',
      screenKey: 'SCREEN_4_BIBLE',
      targetDomId: 'tab4-notebooklm-guide-card',
      btnLabel: 'Mở Cẩm Nang NotebookLM Tab 4',
    },
    {
      id: 'FAQ_PRO_ARGON_403',
      question: 'Chọn Pro hoặc Argon-4 nhưng API Key miễn phí báo chưa hỗ trợ / hết hạn mức?',
      answer:
        'Một số API Key miễn phí chỉ mở Flash / Flash-Lite qua AI Studio endpoint hoặc bị chạm giới hạn 5h/Tuần. Studio sẽ không tự ý chạy lén mô hình khác mà bật sẵn cửa sổ hướng dẫn: bạn bấm thẳng chữ "câu lệnh dưới đây" để copy toàn bộ Prompt Tổng Hợp và bấm "Gemini của bạn" sang web Gemini chạy miễn phí ngay!',
      screenKey: 'SCREEN_3_AI',
      targetDomId: 'btn-open-fullscreen-ai-command',
      btnLabel: 'Kiểm Tra Model & Hạn Mức Tab 3',
    },
    {
      id: 'FAQ_DOCX_NOT_OPENING',
      question: 'File Word .DOCX tải về trước kia báo lỗi không mở được, nay sửa thế nào?',
      answer:
        'Bản cũ vô tình lưu mã HTML dưới đuôi .docx nên Word từ chối mở. Nay Module 26 đã tự đóng gói tệp nhị phân chuẩn OOXML ZIP thực thụ (có đủ document.xml, styles.xml, header tên tác phẩm canh giữa, footer số trang đơn giản), mở trơn tru trên Microsoft Word, LibreOffice và Google Docs.',
      screenKey: 'SCREEN_6_SYSTEM',
      targetDomId: 'btn-s6-open-custom-export',
      btnLabel: 'Mở Hộp Thoại Xuất .DOCX Chuẩn',
      optionalOpenModal: 'exporter',
    },
    {
      id: 'FAQ_LOST_FLOATING_BAR',
      question: 'Lỡ bấm nút X tắt mất Thanh Pomodoro, Thanh Nhạc hoặc Thanh AI Nổi thì tìm lại ở đâu?',
      answer:
        'Không cần tải lại trang! Nếu lỡ tắt Thanh Nhạc hoặc Thanh Pomodoro, mở Tab 5 phần Quản lý thanh nổi để bật lại. Nếu lỡ tắt Thanh AI Nổi (trên đó có Chat Bi Số 8), bấm nút "Hiện & Định Tâm Thanh AI Nổi" ngay tại Tab 6.',
      screenKey: 'SCREEN_6_SYSTEM',
      targetDomId: 'btn-tab6-reopen-floating-ai',
      btnLabel: 'Mở Lại Thanh AI Nổi Tab 6',
    },
  ]);

  const SYSTEM_ARCHITECTURE_MAP = Object.freeze([
    { group: 'Nhóm Lõi & Lưu Trữ (Mod 01–05)', modules: 'mod01 (Bootstrap), mod02 (Danh mục Model Gemini), mod03 (Hằng số Prompt 5 chế độ), mod04 (IndexedDB), mod05 (Đồng bộ Ổ cứng)' },
    { group: 'Nhóm Chương & Lịch Sử (Mod 06–10)', modules: 'mod06 (Nạp DOCX/PDF/TXT), mod07 (Tìm kiếm BM25 0-Token), mod08 (Cây chương 2 chiều), mod09 (Lưu 3 tầng & Undo), mod10 (Time-Machine Preview)' },
    { group: 'Nhóm AI & Story Bible (Mod 11–19)', modules: 'mod11 (Google Docs AI Diff), mod12 (Story Bible & NotebookLM), mod13 (Radar Anti-Cliché), mod14 (Soát logic), mod15 (API Vault & Quotas 5h/Tuần), mod16 (Prompt Tổng Hợp 2 Bước), mod17 (Đầu ra 5 Chế độ Tab 3), mod18 (Biểu đồ Mode 5), mod19 (Duyệt lũy tiến Ch.1..cuối)' },
    { group: 'Nhóm Tập Trung, Soạn Thảo & Xuất Sách (Mod 20–26)', modules: 'mod20 (Pomodoro 2 chiều), mod21 (MP3 Lặp A-B & 7 Âm tự nhiên), mod22 (60FPS Mưa & 6 Tranh nền), mod23 (Bàn viết Tab 1 & Tìm/Thay), mod24 (Lore Whisper & Mục tiêu chữ), mod25 (Từ điển Ngũ quan & Lời tác giả), mod26 (Xuất OOXML .DOCX & .PDF 1-Trang Bìa)' },
    { group: 'Nhóm Trợ Lý, Điều Hướng, Bảo Chứng & An Toàn Bản Thảo (Mod 27–36)', modules: 'mod27 (Bi Số 8 mặc định Flash-Lite + 2 Chế độ), mod28 (Video Chiếu Giao Diện Web Thật), mod29 (Điều hướng 6 Tab), mod30 (Cổng API/Thư mục), mod31 (Bách Khoa Tab 6), mod32 (Sân khấu Hình nền rõ & Cầu nối Argon 4), mod33 (Đồng bộ Key/Gói Pro-Ultra/Giọng Neural VI-EN), mod34 (Báo lỗi người dùng & lọc bí mật), mod35 (Author Credits cuộn dọc Mai Hải Đăng), mod36 (Khiên Chống Reload mất chữ)' },
  ]);

  const TONE_BADGE_CLASSES = Object.freeze({
    emerald: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300',
    amber: 'border-amber-500/40 bg-amber-500/15 text-amber-300',
    sky: 'border-sky-500/40 bg-sky-500/15 text-sky-300',
    indigo: 'border-indigo-500/40 bg-indigo-500/15 text-indigo-300',
    pink: 'border-pink-500/40 bg-pink-500/15 text-pink-300',
    orange: 'border-orange-500/40 bg-orange-500/15 text-orange-300',
    cyan: 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300',
    violet: 'border-violet-500/40 bg-violet-500/15 text-violet-300',
  });

  function stripVietnameseToneMarks(str) {
    return String(str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .trim();
  }

  function escapeHtmlText(str) {
    if (NS.uiUtils && typeof NS.uiUtils.escapeHtml === 'function') {
      return NS.uiUtils.escapeHtml(str);
    }
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  class FeatureDirectoryInspectorEngine {
    constructor() {
      this.hasInitialized = false;
      this.activeSectionTab = 'CATALOG'; // 'CATALOG' | 'WORKFLOWS' | 'SHORTCUTS_FAQ' | 'SYSTEM_MAP'
      this.activeCategory = 'ALL';
      this.searchQuery = '';
      this.expandedFeatureIds = new Set([
        'FEAT_GATE_GOOGLE_STUDIO',
        'FEAT_TAB3_REAL_MODELS_AND_THINKING',
        'FEAT_TAB4_NOTEBOOKLM_COMPANION',
        'FEAT_TAB6_EXPORT_DOCX_OOXML',
      ]);
      this.isDirectoryPanelCollapsed = true;
      this.spotlightTimerId = null;
    }

    init() {
      if (this.hasInitialized) {
        this.renderRoot();
        return this;
      }
      this.hasInitialized = true;
      this.renderRoot();
      this.attachLiveStateRefreshHooks();
      return this;
    }

    attachLiveStateRefreshHooks() {
      if (typeof document === 'undefined' || document.body?.dataset?.mod31HooksBound) return;
      if (document.body) {
        document.body.dataset.mod31HooksBound = '1';
      }
      document.addEventListener('click', (ev) => {
        const target = ev.target?.closest?.('[data-nav-screen], .desktop-tab-btn, .mobile-tab-btn');
        if (!target) return;
        const scr = target.getAttribute('data-nav-screen') || '';
        if (scr === 'SCREEN_6_SYSTEM') {
          setTimeout(() => this.refreshLiveDiagnosticsStrip(), 80);
        }
      });
    }

    collectLiveDiagnosticsSnapshot() {
      const chapMgr = NS.chapterManager || NS.chapterTree || NS.chapters;
      const chapters = Array.isArray(chapMgr?.chapters) ? chapMgr.chapters : [];
      const approvedCount = chapters.filter((c) => c.status === 'APPROVED').length;
      const totalWords = chapters.reduce((acc, c) => {
        const t = String(c.content || '').trim();
        return acc + (t ? t.split(/\s+/).filter(Boolean).length : 0);
      }, 0);

      const guardSnap = NS.unifiedConnectionGuard?.getUnifiedConnectionSnapshot?.();
      const router = NS.geminiRouter;
      const effectiveKey = guardSnap
        ? guardSnap.hasApiKey
        : Boolean(
            router?.getEffectiveActiveKey?.()?.trim?.() ||
              router?.getApiKey?.()?.trim?.() ||
              router?.hasUsableKey?.() ||
              localStorage.getItem('noir_studio_api_key') ||
              localStorage.getItem('noir_v36_gemini_api_key_primary')
          );
      const isFlashVerified = guardSnap
        ? guardSnap.isFlashVerified
        : Boolean(
            router?.isCurrentKeyFlashLiteVerified?.() ||
              NS.entryGate?.state?.hasVerifiedKey
          );
      const folderConnected = guardSnap
        ? guardSnap.folderConnected
        : Boolean(
            NS.fsEngine?.isConnected?.() ||
              NS.entryGate?.state?.hasFolderSelected
          );
      const folderName =
        guardSnap?.folderName ||
        NS.fsEngine?.getConnectedFolderName?.() ||
        'Lưu tự động 3 tầng + File thật';
      const planTierBadge =
        guardSnap?.planSpec?.badgeLabel || 'Standard / API Ready';
      const chatbotModel =
        guardSnap?.chatbotModel ||
        NS.mascotBi?.prefs?.chatModelId ||
        'gemini-3.5-flash-lite';
      const loadedModCount = NS.registry ? Object.keys(NS.registry).length : 36;
      const activeModel =
        router?.getSelectedModelId?.() || router?.selectedModelId || 'gemini-3.8-flash';
      const thinkingLevel = router?.getThinkingLevelLabel?.() || 'Trung bình';
      const floatingAiVisible = Boolean(
        !document.getElementById('s11-mascot-bi-corner')?.classList?.contains('hidden')
      );

      return {
        chaptersCount: chapters.length,
        approvedCount,
        totalWords,
        hasApiKey: effectiveKey,
        isFlashVerified,
        folderConnected,
        folderName,
        planTierBadge,
        chatbotModel,
        loadedModCount,
        activeModel,
        thinkingLevel,
        floatingAiVisible,
      };
    }

    refreshLiveDiagnosticsStrip() {
      const stripEl = document.getElementById('mod31-live-diagnostics-strip');
      if (!stripEl) return;
      stripEl.innerHTML = this.buildLiveDiagnosticsStripHtml();
    }

    buildLiveDiagnosticsStripHtml() {
      const snap = this.collectLiveDiagnosticsSnapshot();
      return `
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div class="p-2.5 rounded-xl border ${
            snap.isFlashVerified ? 'border-emerald-500/40 bg-emerald-950/25' : snap.hasApiKey ? 'border-sky-500/40 bg-sky-950/25' : 'border-amber-500/40 bg-amber-950/25'
          }">
            <div class="text-[10px] font-bold uppercase text-zinc-400">API Key & Mô Hình</div>
            <div class="text-xs font-extrabold ${
              snap.isFlashVerified ? 'text-emerald-300' : snap.hasApiKey ? 'text-sky-300' : 'text-amber-300'
            } truncate">${snap.isFlashVerified ? '✅ Đã verify Flash-Lite' : snap.hasApiKey ? '🔑 Đã có Key' : '⚠️ Chưa nối Key'}</div>
            <div class="text-[10px] text-zinc-400 font-monoCode truncate">${escapeHtmlText(snap.activeModel)} · Chat: ${escapeHtmlText(snap.chatbotModel)}</div>
          </div>

          <div class="p-2.5 rounded-xl border ${
            snap.folderConnected ? 'border-sky-500/40 bg-sky-950/25' : 'border-rose-500/40 bg-rose-950/20'
          }">
            <div class="text-[10px] font-bold uppercase text-zinc-400">Thư Mục Ổ Cứng</div>
            <div class="text-xs font-extrabold ${
              snap.folderConnected ? 'text-sky-300' : 'text-rose-300'
            } truncate">${snap.folderConnected ? `📁 Đã gắn: ${escapeHtmlText(snap.folderName)}` : '⚠️ Chưa gắn thư mục'}</div>
            <div class="text-[10px] text-zinc-400 truncate">${escapeHtmlText(snap.planTierBadge)}</div>
          </div>

          <div class="p-2.5 rounded-xl border border-indigo-500/35 bg-indigo-950/25">
            <div class="text-[10px] font-bold uppercase text-zinc-400">Quy Mô Tác Phẩm</div>
            <div class="text-xs font-extrabold text-indigo-200">${snap.chaptersCount} chương (${snap.approvedCount} đã duyệt)</div>
            <div class="text-[10px] text-zinc-400">${snap.totalWords.toLocaleString('vi-VN')} từ đã viết</div>
          </div>

          <div class="p-2.5 rounded-xl border border-teal-500/35 bg-teal-950/25">
            <div class="text-[10px] font-bold uppercase text-zinc-400">Hệ Thống & Thanh Nổi</div>
            <div class="text-xs font-extrabold text-teal-300">🛡️ ${snap.loadedModCount}/33 Module Sẵn Sàng</div>
            <div class="text-[10px] text-zinc-400">Thanh AI Nổi: ${snap.floatingAiVisible ? 'Đang hiện' : 'Đang ẩn (có thể bật lại)'}</div>
          </div>
        </div>
      `;
    }

    getFilteredCatalogItems() {
      const normalizedQuery = stripVietnameseToneMarks(this.searchQuery);
      return FULL_FEATURE_ENCYCLOPEDIA_CATALOG.filter((item) => {
        if (this.activeCategory !== 'ALL' && item.category !== this.activeCategory) {
          return false;
        }
        if (!normalizedQuery) return true;
        const haystack = stripVietnameseToneMarks(
          [
            item.title,
            item.badge,
            item.moduleRef,
            item.categoryLabel,
            item.summary,
            item.whenToUse,
            item.proTip,
            ...(item.stepByStep || []),
          ].join(' ')
        );
        return normalizedQuery
          .split(/\s+/)
          .filter(Boolean)
          .every((tok) => haystack.includes(tok));
      });
    }

    getCategoryCountsMap() {
      const counts = { ALL: FULL_FEATURE_ENCYCLOPEDIA_CATALOG.length };
      DIRECTORY_CATEGORY_FILTERS.forEach((cat) => {
        if (cat.id !== 'ALL') counts[cat.id] = 0;
      });
      FULL_FEATURE_ENCYCLOPEDIA_CATALOG.forEach((item) => {
        counts[item.category] = (counts[item.category] || 0) + 1;
      });
      return counts;
    }

    /**
     * Điều hướng thẳng tới đúng Tab / Modal chứa tính năng, tự mở khay đang thu gọn
     * và làm phát sáng nút/khung mục tiêu để người dùng nhìn thấy ngay lập tức!
     */
    navigateAndSpotlightFeature(options = {}) {
      const {
        screenKey = null,
        expandCollapseIds = [],
        targetDomId = '',
        optionalOpenModal = '',
        featureTitle = 'tính năng vừa chọn',
      } = options;

      // 1. Nếu có yêu cầu mở modal chuyên dụng (Video hướng dẫn / Xuất sách / Chat Bi)
      if (optionalOpenModal === 'tutorial') {
        document.getElementById('btn-s6-card-tutorial')?.click();
        NS.uiUtils?.showToast?.(`🎬 Đã mở trực tiếp ${featureTitle}!`, 'success');
        return true;
      }
      if (optionalOpenModal === 'exporter') {
        if (NS.exporter && typeof NS.exporter.openModal === 'function') {
          NS.exporter.openModal();
        } else {
          document.getElementById('btn-s6-open-custom-export')?.click();
        }
        NS.uiUtils?.showToast?.(`📤 Đã mở Hộp Thoại Xuất Sách cho ${featureTitle}!`, 'success');
        return true;
      }
      if (optionalOpenModal === 'chat') {
        if (NS.mascotChat && typeof NS.mascotChat.openChatModal === 'function') {
          NS.mascotChat.openChatModal();
        } else {
          document.getElementById('btn-open-free-gemini-chat')?.click();
        }
        NS.uiUtils?.showToast?.('🎱 Đã mở ngay Trợ Lý Viên Bi Số 8!', 'success');
        return true;
      }

      // 2. Chuyển Tab nếu tính năng nằm ở Tab cụ thể
      if (screenKey && NS.navigator && typeof NS.navigator.navigateToScreen === 'function') {
        NS.navigator.navigateToScreen(screenKey);
      }

      setTimeout(() => {
        // 3. Tự động bung các vùng đang thu gọn chứa nút mục tiêu
        if (Array.isArray(expandCollapseIds)) {
          expandCollapseIds.forEach((pair) => {
            const bodyId = Array.isArray(pair) ? pair[0] : pair;
            const toggleId = Array.isArray(pair) ? pair[1] : '';
            const bodyEl = bodyId ? document.getElementById(bodyId) : null;
            if (bodyEl && bodyEl.classList.contains('hidden')) {
              if (toggleId && document.getElementById(toggleId)) {
                document.getElementById(toggleId).click();
              } else {
                bodyEl.classList.remove('hidden');
              }
            }
          });
        }

        // 4. Tìm phần tử mục tiêu, gỡ tạm hidden nếu là thanh nổi bị tắt, cuộn vào tầm nhìn & làm phát sáng
        let targetEl = targetDomId ? document.getElementById(targetDomId) : null;
        if (targetEl && targetEl.classList.contains('hidden') && targetDomId === 's11-mascot-bi-corner') {
          document.getElementById('btn-tab6-reopen-floating-ai')?.click();
          targetEl = document.getElementById(targetDomId);
        }

        if (targetEl) {
          try {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
          } catch (_) {
            targetEl.scrollIntoView();
          }

          document.querySelectorAll('.noir-feature-spotlight').forEach((node) => {
            node.classList.remove('noir-feature-spotlight');
          });
          targetEl.classList.add('noir-feature-spotlight');
          if (this.spotlightTimerId) {
            clearTimeout(this.spotlightTimerId);
          }
          this.spotlightTimerId = setTimeout(() => {
            targetEl.classList.remove('noir-feature-spotlight');
          }, 4800);

          NS.uiUtils?.showToast?.(
            `🎯 Đã đưa bạn tới và làm sáng nổi bật: ${featureTitle}`,
            'success',
            3800
          );
          return true;
        }

        NS.uiUtils?.showToast?.(`📍 Đã mở màn hình chứa: ${featureTitle}`, 'info', 3000);
        return false;
      }, 130);

      return true;
    }

    buildSectionTabsBarHtml(filteredCount) {
      const tabs = [
        {
          id: 'CATALOG',
          label: `📚 Bách Khoa Tính Năng (${filteredCount}/${FULL_FEATURE_ENCYCLOPEDIA_CATALOG.length})`,
        },
        {
          id: 'WORKFLOWS',
          label: `🧭 Lộ Trình Thực Chiến (${WORKFLOW_PLAYBOOKS_CATALOG.length})`,
        },
        {
          id: 'SHORTCUTS_FAQ',
          label: '⌨️ Phím Tắt & Giải Đáp Lỗi Thường Gặp',
        },
        {
          id: 'SYSTEM_MAP',
          label: '🏗️ Kiến Trúc 31 Module & Trạng Thái',
        },
      ];

      return `
        <div class="flex flex-wrap items-center gap-1.5 pb-3 border-b border-studioLightBorder dark:border-zinc-800/80">
          ${tabs
            .map((t) => {
              const hot = t.id === this.activeSectionTab;
              return `
                <button type="button" data-mod31-tab="${t.id}" class="mod31-section-tab-btn px-3 py-2 rounded-xl text-[11px] font-extrabold transition ${
                  hot
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-zinc-900/75 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                }">
                  ${escapeHtmlText(t.label)}
                </button>
              `;
            })
            .join('')}
        </div>
      `;
    }

    buildCatalogSectionHtml(filteredItems) {
      const counts = this.getCategoryCountsMap();

      const filterPillsHtml = DIRECTORY_CATEGORY_FILTERS.map((cat) => {
        const active = cat.id === this.activeCategory;
        const clsTone = TONE_BADGE_CLASSES[cat.badgeColor] || TONE_BADGE_CLASSES.emerald;
        return `
          <button type="button" data-mod31-cat="${cat.id}" title="${escapeHtmlText(
          cat.description
        )}" class="mod31-cat-filter-btn px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition flex items-center gap-1.5 ${
          active
            ? `${clsTone} ring-1 ring-white/30 shadow-sm`
            : 'border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200'
        }">
            <span>${escapeHtmlText(cat.shortLabel)}</span>
            <span class="px-1.5 py-0.2 rounded-full bg-black/40 font-monoCode text-[10px]">${
              counts[cat.id] || 0
            }</span>
          </button>
        `;
      }).join('');

      const cardsHtml =
        filteredItems.length === 0
          ? `
            <div class="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 text-center space-y-2">
              <div class="text-sm font-bold text-amber-300">🔍 Không tìm thấy tính năng nào khớp với "${escapeHtmlText(
                this.searchQuery
              )}"</div>
              <p class="text-xs text-zinc-400">Thử từ khóa ngắn hơn như: <span class="text-emerald-300 font-semibold">PDF</span>, <span class="text-emerald-300 font-semibold">DOCX</span>, <span class="text-emerald-300 font-semibold">NotebookLM</span>, <span class="text-emerald-300 font-semibold">Pro</span>, <span class="text-emerald-300 font-semibold">mưa</span>, <span class="text-emerald-300 font-semibold">Bi số 8</span>...</p>
              <button type="button" id="mod31-btn-reset-filters" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">↺ Xem Lại Tất Cả Tính Năng</button>
            </div>
          `
          : filteredItems
              .map((item) => {
                const isOpen =
                  this.expandedFeatureIds.has(item.id) || Boolean(this.searchQuery.trim());
                const catMeta = DIRECTORY_CATEGORY_FILTERS.find((c) => c.id === item.category);
                const badgeCls =
                  TONE_BADGE_CLASSES[catMeta?.badgeColor || 'emerald'] ||
                  TONE_BADGE_CLASSES.emerald;
                return `
                  <article class="mod31-feature-card rounded-2xl border border-zinc-800/90 bg-zinc-950/75 hover:border-emerald-500/40 transition overflow-hidden">
                    <div class="p-3.5 flex flex-wrap items-start justify-between gap-2.5">
                      <button type="button" data-mod31-expand="${item.id}" class="mod31-expand-trigger flex-1 min-w-[220px] text-left space-y-1.5 focus:outline-none">
                        <div class="flex flex-wrap items-center gap-1.5">
                          <span class="px-2 py-0.5 rounded-full border text-[10px] font-bold ${badgeCls}">${escapeHtmlText(
                  item.categoryLabel
                )}</span>
                          <span class="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-[10px] font-semibold text-zinc-300">${escapeHtmlText(
                  item.badge
                )}</span>
                          <span class="px-2 py-0.5 rounded-full bg-black/40 font-monoCode text-[10px] text-zinc-400">${escapeHtmlText(
                  item.moduleRef
                )}</span>
                        </div>
                        <h4 class="text-xs sm:text-sm font-extrabold text-zinc-100 leading-snug">
                          ${isOpen ? '▾' : '▸'} ${escapeHtmlText(item.title)}
                        </h4>
                        <p class="text-[11px] text-zinc-400 leading-relaxed">${escapeHtmlText(
                  item.summary
                )}</p>
                      </button>

                      <div class="flex items-center gap-1.5 shrink-0">
                        <button type="button" data-mod31-goto="${item.id}" class="mod31-goto-feature-btn px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] shadow transition flex items-center gap-1">
                          <span>🎯</span>
                          <span>${escapeHtmlText(item.actionLabel || 'Đi tới & Làm nổi bật')}</span>
                        </button>
                        <button type="button" data-mod31-expand="${item.id}" title="Xem hướng dẫn từng bước" class="mod31-expand-trigger px-2.5 py-2 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-bold text-[11px]">
                          ${isOpen ? 'Thu gọn' : 'Chi tiết'}
                        </button>
                      </div>
                    </div>

                    ${
                      isOpen
                        ? `
                      <div class="px-3.5 pb-3.5 pt-2 border-t border-zinc-800/80 bg-black/25 space-y-2.5 text-[11px]">
                        <div class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60">
                          <span class="font-bold text-amber-300">🕒 Dùng khi nào: </span>
                          <span class="text-zinc-300">${escapeHtmlText(item.whenToUse)}</span>
                        </div>
                        <div class="space-y-1">
                          <div class="font-bold text-emerald-300">📋 Các bước thực hiện chuẩn:</div>
                          <ol class="list-decimal pl-5 space-y-1 text-zinc-200 leading-relaxed">
                            ${(item.stepByStep || [])
                              .map((st) => `<li>${escapeHtmlText(st)}</li>`)
                              .join('')}
                          </ol>
                        </div>
                        <div class="p-2.5 rounded-xl border border-indigo-500/30 bg-indigo-950/25 text-indigo-200">
                          <span class="font-bold">💡 Mẹo tác giả: </span>${escapeHtmlText(
                            item.proTip
                          )}
                        </div>
                      </div>
                    `
                        : ''
                    }
                  </article>
                `;
              })
              .join('');

      return `
        <div class="space-y-3">
          <div class="flex flex-wrap items-center gap-2">
            <div class="relative flex-1 min-w-[220px]">
              <input id="mod31-search-input" type="text" value="${escapeHtmlText(
                this.searchQuery
              )}" placeholder="🔍 Gõ tên tính năng cần tìm (ví dụ: NotebookLM, DOCX, PDF, nền mưa, tư duy, Bi số 8, Enter)..." class="w-full px-3.5 py-2 rounded-xl border border-zinc-700 bg-zinc-950 text-xs text-zinc-100 select-text focus:outline-none focus:border-emerald-500" />
            </div>
            <button type="button" id="mod31-btn-expand-all" class="px-2.5 py-2 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-[11px] font-bold text-zinc-300">📂 Mở hết chi tiết</button>
            <button type="button" id="mod31-btn-collapse-all" class="px-2.5 py-2 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-[11px] font-bold text-zinc-300">📁 Thu gọn hết</button>
          </div>

          <div class="flex flex-wrap items-center gap-1.5">${filterPillsHtml}</div>

          <div class="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">${cardsHtml}</div>
        </div>
      `;
    }

    buildWorkflowsSectionHtml() {
      return `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          ${WORKFLOW_PLAYBOOKS_CATALOG.map((wf) => {
            const cls = TONE_BADGE_CLASSES[wf.tone] || TONE_BADGE_CLASSES.emerald;
            return `
              <div class="p-3.5 rounded-2xl border border-zinc-800 bg-zinc-950/75 space-y-2.5">
                <div class="space-y-1">
                  <span class="inline-block px-2 py-0.5 rounded-full border text-[10px] font-bold ${cls}">${escapeHtmlText(
              wf.audience
            )}</span>
                  <h4 class="text-xs sm:text-sm font-extrabold text-white">${escapeHtmlText(
                    wf.title
                  )}</h4>
                </div>
                <div class="space-y-2">
                  ${wf.steps
                    .map(
                      (st, idx) => `
                    <div class="p-2.5 rounded-xl border border-zinc-800/90 bg-zinc-900/70 flex items-start justify-between gap-2">
                      <div class="space-y-0.5 text-[11px]">
                        <div class="font-bold text-emerald-300">${idx + 1}. ${escapeHtmlText(
                        st.label
                      )}</div>
                        <p class="text-zinc-400 leading-relaxed">${escapeHtmlText(st.detail)}</p>
                      </div>
                      <button type="button" data-mod31-wf-jump="${wf.id}:${idx}" class="mod31-wf-jump-btn px-2.5 py-1.5 rounded-lg bg-emerald-600/85 hover:bg-emerald-500 text-white font-bold text-[10px] shrink-0">
                        🎯 Mở
                      </button>
                    </div>
                  `
                    )
                    .join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    buildShortcutsAndFaqSectionHtml() {
      const shortcutsHtml = SHORTCUTS_AND_MOBILE_GUIDE.map(
        (sc) => `
          <div class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/75 flex items-center justify-between gap-2.5">
            <div class="space-y-0.5">
              <div class="text-[10px] font-bold text-zinc-400">${escapeHtmlText(sc.scope)}</div>
              <div class="text-[11px] text-zinc-200">${escapeHtmlText(sc.desc)}</div>
            </div>
            <kbd class="px-2.5 py-1 rounded-lg border border-emerald-500/40 bg-zinc-950 font-monoCode font-bold text-[10px] text-emerald-300 shrink-0">${escapeHtmlText(
              sc.keys
            )}</kbd>
          </div>
        `
      ).join('');

      const faqHtml = TROUBLESHOOTING_FAQ_CATALOG.map(
        (faq) => `
          <div class="p-3 rounded-xl border border-zinc-800 bg-zinc-950/80 space-y-1.5">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="text-xs font-extrabold text-amber-300">❓ ${escapeHtmlText(
                faq.question
              )}</div>
              <button type="button" data-mod31-faq-jump="${faq.id}" class="mod31-faq-jump-btn px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px]">
                🎯 ${escapeHtmlText(faq.btnLabel)}
              </button>
            </div>
            <p class="text-[11px] text-zinc-300 leading-relaxed">${escapeHtmlText(faq.answer)}</p>
          </div>
        `
      ).join('');

      return `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          <div class="lg:col-span-5 space-y-2">
            <div class="text-[11px] font-extrabold uppercase text-emerald-400">⌨️ Bộ Phím Tắt Nhanh & Cứu Hộ</div>
            <div class="space-y-1.5">${shortcutsHtml}</div>
          </div>
          <div class="lg:col-span-7 space-y-2">
            <div class="text-[11px] font-extrabold uppercase text-amber-400">🩺 Hỏi Đáp Xử Lý Nhanh & Sửa Lỗi Hay Gặp</div>
            <div class="space-y-2">${faqHtml}</div>
          </div>
        </div>
      `;
    }

    buildSystemMapSectionHtml() {
      const blocksHtml = SYSTEM_ARCHITECTURE_MAP.map(
        (grp) => `
          <div class="p-3 rounded-xl border border-zinc-800 bg-zinc-950/75 space-y-1">
            <div class="text-xs font-extrabold text-indigo-300">${escapeHtmlText(grp.group)}</div>
            <p class="text-[11px] text-zinc-300 leading-relaxed font-monoCode">${escapeHtmlText(
              grp.modules
            )}</p>
          </div>
        `
      ).join('');

      return `
        <div class="space-y-3">
          ${this.buildLiveDiagnosticsStripHtml()}
          <div class="space-y-2">${blocksHtml}</div>
        </div>
      `;
    }

    renderRoot() {
      const rootEl = document.getElementById('tab6-mod31-feature-directory-root');
      if (!rootEl) return;

      const filteredItems = this.getFilteredCatalogItems();
      let sectionBodyHtml = '';
      if (this.activeSectionTab === 'CATALOG') {
        sectionBodyHtml = this.buildCatalogSectionHtml(filteredItems);
      } else if (this.activeSectionTab === 'WORKFLOWS') {
        sectionBodyHtml = this.buildWorkflowsSectionHtml();
      } else if (this.activeSectionTab === 'SHORTCUTS_FAQ') {
        sectionBodyHtml = this.buildShortcutsAndFaqSectionHtml();
      } else {
        sectionBodyHtml = this.buildSystemMapSectionHtml();
      }

      rootEl.innerHTML = `
        <section class="rounded-2xl border border-emerald-500/40 bg-studioLightPanel/95 dark:bg-zinc-900/90 shadow-lg overflow-hidden">
          <div class="px-4 py-3 border-b border-studioLightBorder dark:border-zinc-800 bg-emerald-600/10 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 class="font-extrabold uppercase text-xs sm:text-sm text-emerald-400 flex items-center gap-2">
                <span>🧭 BÁCH KHOA TOÀN THƯ TÍNH NĂNG & TRẠM ĐIỀU HƯỚNG NHANH (MOD 31)</span>
              </h3>
              <p class="text-[11px] text-zinc-400 mt-0.5">
                Tóm tắt toàn bộ chức năng trên 6 Tab + Cổng kết nối + Thanh nổi; bấm nút <strong>"🎯 Đi tới & Làm nổi bật"</strong> ở bất kỳ mục nào để website tự mở đúng chỗ cho bạn!
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" id="mod31-btn-open-video-top" class="px-3 py-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 font-bold text-[11px] transition">
                🎬 Xem Video Minh Họa VI/EN
              </button>
              <button type="button" id="mod31-btn-toggle-panel" class="px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 font-bold text-[11px] transition">
                ${this.isDirectoryPanelCollapsed ? '▾ Mở Bách Khoa' : '▴ Thu Gọn'}
              </button>
            </div>
          </div>

          <div id="mod31-directory-panel-body" class="${
            this.isDirectoryPanelCollapsed ? 'hidden' : ''
          } p-4 space-y-3">
            <div id="mod31-live-diagnostics-strip">
              ${this.buildLiveDiagnosticsStripHtml()}
            </div>
            ${this.buildSectionTabsBarHtml(filteredItems.length)}
            <div class="pt-1">
              ${sectionBodyHtml}
            </div>
          </div>
        </section>
      `;

      this.bindDirectoryEvents(rootEl);
    }

    bindDirectoryEvents(rootEl) {
      const toggleBtn = document.getElementById('mod31-btn-toggle-panel');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
          this.isDirectoryPanelCollapsed = !this.isDirectoryPanelCollapsed;
          this.renderRoot();
        });
      }

      const openVidTop = document.getElementById('mod31-btn-open-video-top');
      if (openVidTop) {
        openVidTop.addEventListener('click', () => {
          this.navigateAndSpotlightFeature({
            optionalOpenModal: 'tutorial',
            featureTitle: 'Video Hướng Dẫn Song Ngữ VI/EN',
          });
        });
      }

      rootEl.querySelectorAll('.mod31-section-tab-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const nextTab = btn.getAttribute('data-mod31-tab') || 'CATALOG';
          this.activeSectionTab = nextTab;
          this.renderRoot();
        });
      });

      rootEl.querySelectorAll('.mod31-cat-filter-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.activeCategory = btn.getAttribute('data-mod31-cat') || 'ALL';
          this.renderRoot();
        });
      });

      const searchEl = document.getElementById('mod31-search-input');
      if (searchEl) {
        searchEl.addEventListener('input', () => {
          const caret = searchEl.selectionStart || 0;
          this.searchQuery = searchEl.value || '';
          this.renderRoot();
          const reInput = document.getElementById('mod31-search-input');
          if (reInput) {
            reInput.focus();
            try {
              reInput.setSelectionRange(caret, caret);
            } catch (_) {}
          }
        });
      }

      const resetBtn = document.getElementById('mod31-btn-reset-filters');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.searchQuery = '';
          this.activeCategory = 'ALL';
          this.renderRoot();
        });
      }

      const expandAllBtn = document.getElementById('mod31-btn-expand-all');
      if (expandAllBtn) {
        expandAllBtn.addEventListener('click', () => {
          FULL_FEATURE_ENCYCLOPEDIA_CATALOG.forEach((f) => this.expandedFeatureIds.add(f.id));
          this.renderRoot();
        });
      }

      const collapseAllBtn = document.getElementById('mod31-btn-collapse-all');
      if (collapseAllBtn) {
        collapseAllBtn.addEventListener('click', () => {
          this.expandedFeatureIds.clear();
          this.renderRoot();
        });
      }

      rootEl.querySelectorAll('.mod31-expand-trigger').forEach((btn) => {
        btn.addEventListener('click', () => {
          const fid = btn.getAttribute('data-mod31-expand');
          if (!fid) return;
          if (this.expandedFeatureIds.has(fid)) {
            this.expandedFeatureIds.delete(fid);
          } else {
            this.expandedFeatureIds.add(fid);
          }
          this.renderRoot();
        });
      });

      rootEl.querySelectorAll('.mod31-goto-feature-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const fid = btn.getAttribute('data-mod31-goto');
          const feat = FULL_FEATURE_ENCYCLOPEDIA_CATALOG.find((f) => f.id === fid);
          if (!feat) return;
          this.navigateAndSpotlightFeature({
            screenKey: feat.screenKey,
            expandCollapseIds: feat.expandCollapseIds,
            targetDomId: feat.targetDomId,
            optionalOpenModal: feat.optionalOpenModal || '',
            featureTitle: feat.title,
          });
        });
      });

      rootEl.querySelectorAll('.mod31-wf-jump-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const raw = btn.getAttribute('data-mod31-wf-jump') || '';
          const [wfId, stepIdxStr] = raw.split(':');
          const wf = WORKFLOW_PLAYBOOKS_CATALOG.find((w) => w.id === wfId);
          const step = wf?.steps?.[parseInt(stepIdxStr || '0', 10)];
          if (!step) return;
          this.navigateAndSpotlightFeature({
            screenKey: step.screenKey,
            targetDomId: step.targetDomId,
            optionalOpenModal: step.optionalOpenModal || '',
            featureTitle: step.label,
          });
        });
      });

      rootEl.querySelectorAll('.mod31-faq-jump-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const faqId = btn.getAttribute('data-mod31-faq-jump');
          const faq = TROUBLESHOOTING_FAQ_CATALOG.find((q) => q.id === faqId);
          if (!faq) return;
          this.navigateAndSpotlightFeature({
            screenKey: faq.screenKey,
            targetDomId: faq.targetDomId,
            optionalOpenModal: faq.optionalOpenModal || '',
            featureTitle: faq.btnLabel,
          });
        });
      });
    }
  }

  const featureDirectoryEngine = new FeatureDirectoryInspectorEngine();
  NS.FEATURE_ENCYCLOPEDIA_V39 = FULL_FEATURE_ENCYCLOPEDIA_CATALOG;
  NS.WORKFLOW_PLAYBOOKS_V39 = WORKFLOW_PLAYBOOKS_CATALOG;
  NS.FeatureDirectoryInspectorEngine = FeatureDirectoryInspectorEngine;
  NS.featureDirectory = featureDirectoryEngine;
  NS.mod31FeatureDirectory = featureDirectoryEngine;

  if (typeof NS.registerModule === 'function') {
    NS.registerModule('mod31', featureDirectoryEngine);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        featureDirectoryEngine.init();
      });
    } else {
      featureDirectoryEngine.init();
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
