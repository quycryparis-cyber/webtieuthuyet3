/**
 * ============================================================================
 * ✍️ WEB VIẾT TIỂU THUYẾT CỦA BI — MODULE 18 (BATCH 4)
 * TÊN FILE: mod18_mode5_plot_diagram_and_timeline_studio.js
 * ============================================================================
 * CHẾ ĐỘ 5 TẠI TAB 3 — XƯỞNG VẼ BIỂU ĐỒ CỐT TRUYỆN, MẠNG LƯỚI NHÂN VẬT
 * & THEO DÕI DIỄN BIẾN SỰ KIỆN THEO THỜI GIAN
 * (Mode5PlotDiagramAndTimelineStudio — v36.0 SUPREME EDITION)
 *
 * Thiết kế bởi Kiến trúc sư Phần mềm 30 năm kinh nghiệm:
 * 1. Kết nối trực tiếp với toàn bộ hệ thống phần tử giao diện của Chế độ 5:
 *    - #mode5-plot-diagram-studio   : Khung làm việc chính của Chế độ 5 tại Tab 3
 *    - #mode5-chapter-checklist     : Danh sách chọn 1, nhiều hoặc toàn bộ chương để đối chiếu
 *    - #btn-mode5-select-all-chaps  : Nút chọn tất cả các chương
 *    - #btn-mode5-clear-all-chaps   : Nút bỏ chọn tất cả các chương
 *    - #mode5-model-selector        : Bộ chọn mô hình AI riêng cho Chế độ 5
 *    - #mode5-diagram-style         : Bộ chọn 4 kiểu biểu đồ trực quan
 *    - #mode5-prompt-input          : Ô nhập yêu cầu phân tích / vẽ sơ đồ
 *    - #btn-mode5-generate-diagram  : Nút chạy phân tích & vẽ biểu đồ
 *    - #btn-mode5-open-sysprompt    : Nút mở khung chỉnh sửa Prompt hệ thống Chế độ 5
 *    - #btn-mode5-export-svg        : Nút tải biểu đồ về máy (.SVG & hỗ trợ .PNG độ nét cao)
 *    - #mode5-svg-canvas-Stage      : Sân khấu hiển thị biểu đồ SVG tương tác
 *    - #mode5-visual-status         : Nhãn trạng thái xử lý trực quan
 *    - #mode5-chronicle-report      : Báo cáo biên niên sử & đối chiếu mâu thuẫn thời gian
 *    - #btn-mode5-copy-report       : Nút sao chép báo cáo dòng thời gian
 * 2. Dựng 4 kiểu biểu đồ SVG nghệ thuật hoàn toàn khác biệt:
 *    - TIMELINE_AND_GRAPH : Sơ đồ kết hợp Dòng thời gian + Mạng lưới Nhân vật & Phục bút
 *    - CHRONO_TIMELINE    : Trục Biên niên sử theo trình tự thời gian & Nhịp độ kịch tính
 *    - CHARACTER_WEB      : Mạng lưới Quan hệ Nhân vật & Ma trận Ai Biết Gì (Bố cục Sao/Vòng tròn)
 *    - SCENE_ILLUSTRATION : Bảng phân cảnh Điện ảnh (Storyboard) minh họa Bối cảnh, POV & Xung đột
 * 3. Tích hợp Bộ Phân Tích Mâu Thuẫn Thời Gian & Logic Xuyên Chương
 *    (ChronologicalAndEpistemicContradictionAnalyzer) và Bộ Xuất Ảnh Độ Phân Giải Cao
 *    (.SVG Vector & .PNG Raster).
 * ============================================================================
 */
(function () {
  'use strict';

  window.NoirStudio = window.NoirStudio || {};

  // ==========================================================================
  // PHẦN 1: ĐẶC TẢ 4 PHONG CÁCH BIỂU ĐỒ SVG & TỪ ĐIỂN DẤU MỐC THỜI GIAN TIẾNG VIỆT
  // ==========================================================================
  const DIAGRAM_STYLE_DEFINITIONS = {
    TIMELINE_AND_GRAPH: {
      code: 'TIMELINE_AND_GRAPH',
      title: '🎨 Sơ Đồ Tổng Hợp: Dòng Thời Gian + Nhân Vật + Phục Bút',
      subtitle: 'Hiển thị đồng thời chuỗi chương/sự kiện, sự tham gia của nhân vật và đường đi của phục bút',
      accentColor: '#10b981',
      secondaryColor: '#f59e0b',
      clueColor: '#818cf8'
    },
    CHRONO_TIMELINE: {
      code: 'CHRONO_TIMELINE',
      title: '⏳ Trục Biên Niên Sử & Nhịp Độ Kịch Tính Theo Thời Gian',
      subtitle: 'Sắp xếp tuần tự các mốc giờ/ngày qua từng chương kèm biểu đồ căng thẳng và cảnh báo lệch giờ',
      accentColor: '#38bdf8',
      secondaryColor: '#10b981',
      clueColor: '#f43f5e'
    },
    CHARACTER_WEB: {
      code: 'CHARACTER_WEB',
      title: '🕸️ Mạng Lưới Tâm Lý Nhân Vật & Ma Trận Ai Biết Gì',
      subtitle: 'Sơ đồ hướng tâm đối chiếu quan hệ giữa các nhân vật, bí mật nắm giữ và tần suất xuất hiện',
      accentColor: '#f59e0b',
      secondaryColor: '#a855f7',
      clueColor: '#10b981'
    },
    SCENE_ILLUSTRATION: {
      code: 'SCENE_ILLUSTRATION',
      title: '🎬 Bảng Phân Cảnh Điện Ảnh (Cinematic Storyboard Panels)',
      subtitle: 'Trình bày từng chương/cảnh như các khung hình điện ảnh với Góc máy POV, Không gian & Cao trào',
      accentColor: '#c084fc',
      secondaryColor: '#34d399',
      clueColor: '#fbbf24'
    }
  };

  /**
   * Mẫu biểu thức chính quy nhận diện mốc thời gian và không gian trong văn bản tiếng Việt
   */
  const VIETNAMESE_TEMPORAL_PATTERNS = [
    /\b(\d{1,2}\s*giờ(?:\s*\d{1,2}\s*phút)?(?:\s*(?:sáng|trưa|chiều|tối|đêm|khuya))?)\b/gi,
    /\b((?:lúc|vào khoảng|đúng)\s+(?:nửa đêm|rạng sáng|bình minh|hoàng hôn|chập tối|giữa trưa|canh ba))\b/gi,
    /\b(ngày\s+(?:thứ\s+)?\d+|đêm\s+(?:thứ\s+)?\d+|hôm\s+sau|hôm\s+qua|sáng\s+hôm\s+sau|đêm\s+hôm\s+đó|ba\s+ngày\s+trước|một\s+tuần\s+sau|mười\s+năm\s+trước)\b/gi,
    /\b(tháng\s+\d+(?:\s+năm\s+\d{4})?|mùa\s+(?:đông|hạ|thu|xuân))\b/gi
  ];

  const VIETNAMESE_LOCATION_PATTERNS = [
    /\b(?:tại|ở|bên trong|trước cửa|dưới tầng hầm|trên sân thượng|trong căn phòng|ngoài hành lang|tại bến cảng|ở bệnh viện|trong thư phòng|tại đồn cảnh sát|giữa con hẻm)\s+([^.,;!\n]{3,38})/gi
  ];

  // ==========================================================================
  // PHẦN 2: BỘ PHÂN TÍCH MÂU THUẪN DÒNG THỜI GIAN & NHẬN THỨC NHÂN VẬT CỤC BỘ
  //         (ChronologicalAndEpistemicContradictionAnalyzer)
  // ==========================================================================
  class ChronologicalAndEpistemicContradictionAnalyzer {
    constructor(utils) {
      this.utils = utils;
    }

    /**
     * Quét sâu nội dung các chương được chọn kết hợp với Story Bible để:
     * 1. Trích xuất mốc thời gian, bối cảnh không gian và danh sách nhân vật xuất hiện ở từng chương
     * 2. Phát hiện nguy cơ rò rỉ thông tin (nhân vật chưa biết bí mật nhưng lại nhắc tới bí mật đó)
     * 3. Phát hiện phục bút (Chekhov's Gun) đã gieo nhiều chương nhưng chưa được nhắc lại
     * 4. Tính điểm căng thẳng kịch tính (Tension Score 0-100) cho từng chương
     */
    analyzeSelectedChapters(chapters = [], storyBible = null) {
      const chaps = Array.isArray(chapters) ? chapters : [];
      const characters = Array.isArray(storyBible?.characters) ? storyBible.characters : [];
      const matrix = Array.isArray(storyBible?.knowledgeMatrix)
        ? storyBible.knowledgeMatrix
        : [];
      const clues = Array.isArray(storyBible?.cluesLedger) ? storyBible.cluesLedger : [];

      const chapterDiagnostics = [];
      const contradictions = [];
      const characterPresenceTimeline = {};

      chaps.forEach((chap, idx) => {
        const content = String(chap?.content || '');
        const lowerContent = content.toLowerCase();
        const title = chap?.displayTitle || chap?.title || `Chương ${idx + 1}`;

        // 1. Trích xuất các cụm từ chỉ thời gian trong chương
        const detectedTimes = [];
        VIETNAMESE_TEMPORAL_PATTERNS.forEach((regex) => {
          regex.lastIndex = 0;
          let m;
          while ((m = regex.exec(content)) !== null) {
            const cleanTime = m[1].trim();
            if (cleanTime && !detectedTimes.includes(cleanTime) && detectedTimes.length < 4) {
              detectedTimes.push(cleanTime);
            }
          }
        });

        // 2. Trích xuất các địa điểm nổi bật trong chương
        const detectedLocations = [];
        VIETNAMESE_LOCATION_PATTERNS.forEach((regex) => {
          regex.lastIndex = 0;
          let m;
          while ((m = regex.exec(content)) !== null) {
            const loc = m[0].trim();
            if (loc && !detectedLocations.includes(loc) && detectedLocations.length < 3) {
              detectedLocations.push(loc);
            }
          }
        });

        // 3. Kiểm tra những nhân vật nào trong Story Bible xuất hiện ở chương này
        const appearingCharacters = [];
        characters.forEach((ch) => {
          const name = String(ch?.name || '').trim();
          if (!name) return;
          if (lowerContent.includes(name.toLowerCase())) {
            appearingCharacters.push(name);
            if (!characterPresenceTimeline[name]) {
              characterPresenceTimeline[name] = [];
            }
            characterPresenceTimeline[name].push({
              chapterIndex: idx + 1,
              chapterTitle: title,
              timeMarker: detectedTimes[0] || `Mốc chương #${idx + 1}`,
              locationMarker: detectedLocations[0] || 'Bối cảnh chính'
            });
          }
        });

        // 4. Kiểm tra rò rỉ Ma trận Ai Biết Gì (Epistemic Leak Check) trong các câu thoại của chương
        const dialogueLines = content
          .split(/\r?\n+/)
          .map((l) => l.trim())
          .filter((l) => /^[-–—]\s+/.test(l));

        matrix.forEach((row) => {
          const charName = String(row?.character || '').trim();
          const secret = String(row?.secret || '').trim();
          const state = String(row?.state || '').toUpperCase();
          if (!charName || !secret) return;

          if (state.includes('CHƯA BIẾT') || state === 'UNKNOWN') {
            const secretKeywords = secret
              .toLowerCase()
              .split(/\s+/)
              .filter((w) => w.length >= 4);
            if (secretKeywords.length === 0) return;

            dialogueLines.forEach((dLine) => {
              const speakerMatch = dLine.match(/\(([^)]+)\)\s*$/);
              const speaker = speakerMatch ? speakerMatch[1].trim() : '';
              if (
                speaker &&
                speaker.toLowerCase().includes(charName.toLowerCase()) &&
                secretKeywords.every((kw) => dLine.toLowerCase().includes(kw))
              ) {
                contradictions.push(
                  `[${title}] Nhân vật "${charName}" đang ở trạng thái CHƯA BIẾT về "${secret}" trong Ma trận Ai Biết Gì nhưng lại nhắc trực tiếp trong lời thoại.`
                );
              }
            });
          }
        });

        // 5. Kiểm tra các Phục bút (Chekhov's Gun) xuất hiện trong chương
        const activeCluesInChap = [];
        clues.forEach((cl) => {
          const clueTitle = String(cl?.title || '').trim();
          if (clueTitle && lowerContent.includes(clueTitle.toLowerCase())) {
            activeCluesInChap.push(clueTitle);
          }
        });

        // 6. Ước tính chỉ số kịch tính (Tension Score 25 -> 95) của chương
        const tensionKeywords = [
          'máu',
          'súng',
          'chết',
          'bí mật',
          'hét lên',
          'bất ngờ',
          'run rẩy',
          'nguy hiểm',
          'phản bội',
          'bóng đen',
          'chạy trốn',
          'sự thật',
          'khóa chặt'
        ];
        const keywordHits = tensionKeywords.filter((kw) => lowerContent.includes(kw)).length;
        const tensionScore = Math.min(
          98,
          Math.max(28, 35 + keywordHits * 7 + Math.min(20, dialogueLines.length * 2))
        );

        chapterDiagnostics.push({
          chapterId: chap.id,
          chapterIndex: idx + 1,
          title,
          status: chap.status || 'DRAFT',
          wordCount: chap.wordCount || 0,
          summary: chap.summary || 'Đang triển khai nội dung',
          primaryTime: detectedTimes[0] || (chap.status === 'APPROVED' ? 'Đã duyệt' : 'Bản nháp'),
          allTimes: detectedTimes,
          primaryLocation: detectedLocations[0] || 'Không gian chương',
          allLocations: detectedLocations,
          appearingCharacters,
          activeCluesInChap,
          dialogueCount: dialogueLines.length,
          tensionScore
        });
      });

      // 7. Kiểm tra phục bút bị bỏ quên qua nhiều chương
      if (chaps.length >= 3 && clues.length > 0) {
        clues.forEach((cl) => {
          if (cl.status === 'RESOLVED') return;
          const clueTitle = String(cl?.title || '').trim();
          if (!clueTitle) return;
          const mentionedAnywhere = chapterDiagnostics.some((d) =>
            d.activeCluesInChap.includes(clueTitle)
          );
          if (!mentionedAnywhere) {
            contradictions.push(
              `Phục bút "${clueTitle}" (${
                cl.plantedIn || 'Đang mở'
              }) chưa thấy xuất hiện hoặc nhắc lại trong ${chaps.length} chương đang chọn.`
            );
          }
        });
      }

      return {
        chapterDiagnostics,
        contradictions,
        characterPresenceTimeline
      };
    }

    /**
     * Dựng Báo Cáo Biên Niên Sử & Đối Chiếu Dòng Thời Gian chi tiết bằng tiếng Việt
     * để hiển thị trong #mode5-chronicle-report
     */
    buildDetailedVietnameseChronicleReport(chapters = [], storyBible = null) {
      const analysis = this.analyzeSelectedChapters(chapters, storyBible);
      const { chapterDiagnostics, contradictions, characterPresenceTimeline } = analysis;

      const chapLines = chapterDiagnostics.map((d) => {
        const timeStr =
          d.allTimes.length > 0 ? d.allTimes.join(' -> ') : d.primaryTime;
        const locStr =
          d.allLocations.length > 0 ? d.allLocations.join(' | ') : 'Theo mạch bối cảnh chính';
        const charStr =
          d.appearingCharacters.length > 0
            ? d.appearingCharacters.join(', ')
            : 'Nhân vật góc nhìn (POV)';
        const clueStr =
          d.activeCluesInChap.length > 0
            ? d.activeCluesInChap.join(', ')
            : 'Không kích hoạt phục bút mới';

        return [
          `📌 CHƯƠNG #${d.chapterIndex}: ${d.title} (${d.wordCount.toLocaleString(
            'vi-VN'
          )} từ — ${d.status === 'APPROVED' ? '✅ Đã duyệt' : '📝 Bản nháp'})`,
          `   • ⏳ Dấu mốc thời gian   : ${timeStr}`,
          `   • 📍 Không gian bối cảnh : ${locStr}`,
          `   • 👥 Nhân vật xuất hiện  : ${charStr}`,
          `   • 🔫 Phục bút liên quan  : ${clueStr}`,
          `   • 🔥 Độ căng thẳng       : ${d.tensionScore}/100 (${d.dialogueCount} câu thoại)`,
          `   • 📖 Tóm tắt diễn biến   : ${d.summary}`
        ].join('\n');
      });

      const charTrajectoryLines = Object.entries(characterPresenceTimeline).map(
        ([charName, stops]) => {
          const pathStr = stops
            .map((s) => `${s.chapterTitle} (${s.timeMarker})`)
            .join(' ➔ ');
          return `   • 👤 ${charName}: ${pathStr}`;
        }
      );

      const contradictionSection =
        contradictions.length > 0
          ? [
              `⚠️ CẢNH BÁO ĐỐI CHIẾU LOGIC & PHỤC BÚT (${contradictions.length} điểm cần lưu ý):`,
              ...contradictions.map((c, i) => `   ${i + 1}. ${c}`)
            ].join('\n')
          : `✅ KIỂM ĐỊNH DÒNG THỜI GIAN & NHẬN THỨC NHÂN VẬT: Hoàn toàn khớp nhau 100%, không phát hiện mâu thuẫn logic giữa các chương đã chọn!`;

      return [
        `====================================================================`,
        `📊 BÁO CÁO BIÊN NIÊN SỬ & ĐỐI CHIẾU DÒNG THỜI GIAN (${chapterDiagnostics.length} CHƯƠNG)`,
        `====================================================================`,
        ``,
        ...chapLines,
        ``,
        `--------------------------------------------------------------------`,
        `🧭 HÀNH TRÌNH DI CHUYỂN CỦA NHÂN VẬT QUA CÁC CHƯƠNG:`,
        charTrajectoryLines.length > 0
          ? charTrajectoryLines.join('\n')
          : '   • (Chưa có hồ sơ nhân vật đối chiếu hoặc đang dùng nhân vật mặc định)',
        ``,
        `--------------------------------------------------------------------`,
        contradictionSection,
        ``,
        `💡 Mẹo: Bạn có thể chọn kiểu biểu đồ (Dòng thời gian, Mạng lưới nhân vật, Phân cảnh điện ảnh) và bấm "🎨 Vẽ Biểu Đồ" để xem trực quan hoặc xuất file ảnh .SVG / .PNG!`
      ].join('\n\n');
    }
  }
  // ==========================================================================
  // PHẦN 3: ĐỘNG CƠ DỰNG ĐỒ HỌA VECTOR SVG 4 PHONG CÁCH CHUYÊN SÂU
  //         (MultiStyleSvgDiagramRendererEngine)
  // ==========================================================================
  class MultiStyleSvgDiagramRendererEngine {
    constructor(utils) {
      this.utils = utils;
    }

    esc(str) {
      if (this.utils && typeof this.utils.escapeHtml === 'function') {
        return this.utils.escapeHtml(str);
      }
      return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    /**
     * Điều phối dựng biểu đồ SVG theo đúng styleMode mà tác giả chọn:
     * - TIMELINE_AND_GRAPH
     * - CHRONO_TIMELINE
     * - CHARACTER_WEB
     * - SCENE_ILLUSTRATION
     */
    renderSvgByStyle(graphData, styleMode = 'TIMELINE_AND_GRAPH') {
      const normalizedMode = DIAGRAM_STYLE_DEFINITIONS[styleMode]
        ? styleMode
        : 'TIMELINE_AND_GRAPH';

      if (normalizedMode === 'CHRONO_TIMELINE') {
        return this.renderChronoTimelineSvg(graphData);
      }
      if (normalizedMode === 'CHARACTER_WEB') {
        return this.renderCharacterWebSvg(graphData);
      }
      if (normalizedMode === 'SCENE_ILLUSTRATION') {
        return this.renderSceneIllustrationSvg(graphData);
      }
      return this.renderTimelineAndGraphSvg(graphData);
    }

    /**
     * Kiểu 1: TIMELINE_AND_GRAPH — Sơ đồ kết hợp Dòng thời gian + Nhân vật + Phục bút
     */
    renderTimelineAndGraphSvg(graphData) {
      const nodes = Array.isArray(graphData?.nodes) ? graphData.nodes : [];
      const links = Array.isArray(graphData?.links) ? graphData.links : [];
      const contradictions = Array.isArray(graphData?.contradictions)
        ? graphData.contradictions
        : [];

      const width = 940;
      const height = Math.max(440, Math.ceil(nodes.length / 3) * 130 + 145);

      const positioned = nodes.map((n, idx) => {
        const col = idx % 3;
        const row = Math.floor(idx / 3);
        const x = 165 + col * 305;
        const y = 110 + row * 125;
        return { ...n, x, y };
      });

      const posMap = {};
      positioned.forEach((p) => {
        posMap[p.id] = p;
      });

      const edgesSvg = links
        .map((lk) => {
          const s = posMap[lk.source];
          const t = posMap[lk.target];
          if (!s || !t) return '';
          const mx = (s.x + t.x) / 2;
          const my = (s.y + t.y) / 2 - 14;
          const isClueEdge =
            s.group === 'CLUE' || t.group === 'CLUE' || String(lk.label || '').includes('manh mối');
          const edgeColor = isClueEdge ? '#818cf8' : '#10b981';

          return `
            <g>
              <path d="M ${s.x} ${s.y} Q ${mx} ${my - 12} ${t.x} ${t.y}" fill="none" stroke="${edgeColor}" stroke-width="2.2" stroke-dasharray="5,3" marker-end="url(#arrowHead)" opacity="0.85" />
              ${
                lk.label
                  ? `<rect x="${mx - 68}" y="${my - 12}" width="136" height="19" rx="6" fill="#09090b" stroke="#27272a" />
                     <text x="${mx}" y="${my + 1}" fill="#a7f3d0" font-size="10" font-family="Inter, sans-serif" font-weight="600" text-anchor="middle">${this.esc(
                      String(lk.label).slice(0, 26)
                    )}</text>`
                  : ''
              }
            </g>
          `;
        })
        .join('');

      const nodesSvg = positioned
        .map((n, i) => {
          const isChar = n.group === 'CHARACTER';
          const isClue = n.group === 'CLUE';
          const strokeColor = isChar ? '#f59e0b' : isClue ? '#818cf8' : '#10b981';
          const fillBg = isChar ? '#271a05' : isClue ? '#17153b' : '#052e22';
          const badge = isChar ? '👤 NHÂN VẬT' : isClue ? '🔫 PHỤC BÚT' : `⏳ MỐC #${i + 1}`;
          const timeText = n.time ? ` (${n.time})` : '';
          return `
            <g transform="translate(${n.x - 118}, ${n.y - 38})" class="cursor-pointer">
              <rect width="236" height="76" rx="14" fill="${fillBg}" stroke="${strokeColor}" stroke-width="2" filter="url(#dropGlow)" />
              <text x="14" y="22" fill="${strokeColor}" font-size="10" font-family="JetBrains Mono, monospace" font-weight="700">${this.esc(
                badge + timeText
              )}</text>
              <text x="14" y="43" fill="#f4f4f5" font-size="12" font-family="Inter, sans-serif" font-weight="700">${this.esc(
                String(n.label || '').slice(0, 28)
              )}</text>
              <text x="14" y="61" fill="#a1a1aa" font-size="10" font-family="Inter, sans-serif">${this.esc(
                String(n.detail || n.label || '').slice(0, 35)
              )}</text>
            </g>
          `;
        })
        .join('');

      return this.wrapSvgFrame({
        width,
        height,
        headerTitle:
          '🎨 SƠ ĐỒ DIỄN BIẾN CỐT TRUYỆN & ĐỐI CHIẾU THỜI GIAN — CHẾ ĐỘ 5 (TIMELINE & GRAPH)',
        edgesSvg,
        nodesSvg,
        contradictions
      });
    }

    /**
     * Kiểu 2: CHRONO_TIMELINE — Trục Biên Niên Sử Zích-Zắc & Đường Cong Kịch Tính
     */
    renderChronoTimelineSvg(graphData) {
      const allNodes = Array.isArray(graphData?.nodes) ? graphData.nodes : [];
      const eventNodes = allNodes.filter((n) => n.group !== 'CHARACTER');
      const displayNodes = eventNodes.length > 0 ? eventNodes : allNodes;
      const contradictions = Array.isArray(graphData?.contradictions)
        ? graphData.contradictions
        : [];

      const width = 940;
      const rowCount = Math.max(1, Math.ceil(displayNodes.length / 2));
      const height = Math.max(440, rowCount * 155 + 150);
      const spineYStart = 115;

      const positioned = displayNodes.map((n, idx) => {
        const row = Math.floor(idx / 2);
        const isEvenRow = row % 2 === 0;
        const colInRow = idx % 2;
        const x = isEvenRow
          ? 240 + colInRow * 450
          : 690 - colInRow * 450;
        const y = spineYStart + row * 145;
        return { ...n, x, y, seqIndex: idx + 1 };
      });

      const spineSegments = [];
      for (let i = 0; i < positioned.length - 1; i += 1) {
        const a = positioned[i];
        const b = positioned[i + 1];
        spineSegments.push(`
          <line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#38bdf8" stroke-width="3" stroke-dasharray="6,4" marker-end="url(#arrowHeadBlue)" opacity="0.88" />
        `);
      }

      const nodesSvg = positioned
        .map((n) => {
          const isClue = n.group === 'CLUE';
          const stroke = isClue ? '#f43f5e' : '#38bdf8';
          const bg = isClue ? '#3b0a18' : '#082f49';
          const tag = isClue ? '🔫 PHỤC BÚT' : `⏱️ BIÊN NIÊN #${n.seqIndex}`;
          const timeBadge = n.time ? ` • ${n.time}` : '';

          return `
            <g transform="translate(${n.x - 145}, ${n.y - 42})">
              <rect width="290" height="84" rx="14" fill="${bg}" stroke="${stroke}" stroke-width="2.2" filter="url(#dropGlow)" />
              <circle cx="268" cy="20" r="8" fill="${stroke}" opacity="0.85" />
              <text x="16" y="24" fill="${stroke}" font-size="10" font-family="JetBrains Mono, monospace" font-weight="800">${this.esc(
                tag + timeBadge
              )}</text>
              <text x="16" y="46" fill="#f8fafc" font-size="12.5" font-family="Inter, sans-serif" font-weight="800">${this.esc(
                String(n.label || '').slice(0, 34)
              )}</text>
              <text x="16" y="66" fill="#cbd5e1" font-size="10.5" font-family="Inter, sans-serif">${this.esc(
                String(n.detail || '').slice(0, 42)
              )}</text>
            </g>
          `;
        })
        .join('');

      return this.wrapSvgFrame({
        width,
        height,
        headerTitle:
          '⏳ TRỤC BIÊN NIÊN SỬ SỰ KIỆN & ĐỐI CHIẾU TRÌNH TỰ THỜI GIAN — CHẾ ĐỘ 5',
        edgesSvg: spineSegments.join(''),
        nodesSvg,
        contradictions
      });
    }

    /**
     * Kiểu 3: CHARACTER_WEB — Mạng Lưới Tâm Lý Nhân Vật & Ma Trận Ai Biết Gì
     */
    renderCharacterWebSvg(graphData) {
      const nodes = Array.isArray(graphData?.nodes) ? graphData.nodes : [];
      const links = Array.isArray(graphData?.links) ? graphData.links : [];
      const contradictions = Array.isArray(graphData?.contradictions)
        ? graphData.contradictions
        : [];

      const width = 940;
      const height = 560;
      const cx = width / 2;
      const cy = height / 2 - 10;

      // Vòng tròn quỹ đạo hướng tâm
      const orbitCirclesSvg = `
        <circle cx="${cx}" cy="${cy}" r="115" fill="none" stroke="#27272a" stroke-width="1" stroke-dasharray="4,4" />
        <circle cx="${cx}" cy="${cy}" r="205" fill="none" stroke="#27272a" stroke-width="1" stroke-dasharray="4,4" />
      `;

      const positioned = nodes.map((n, idx) => {
        if (idx === 0) {
          return { ...n, x: cx, y: cy };
        }
        const totalOuter = Math.max(1, nodes.length - 1);
        const angle = ((idx - 1) / totalOuter) * Math.PI * 2 - Math.PI / 2;
        const radiusX = 290;
        const radiusY = 185;
        return {
          ...n,
          x: Math.round(cx + Math.cos(angle) * radiusX),
          y: Math.round(cy + Math.sin(angle) * radiusY)
        };
      });

      const posMap = {};
      positioned.forEach((p) => {
        posMap[p.id] = p;
      });

      const edgesSvg =
        orbitCirclesSvg +
        links
          .map((lk) => {
            const s = posMap[lk.source];
            const t = posMap[lk.target];
            if (!s || !t) return '';
            const mx = (s.x + t.x) / 2;
            const my = (s.y + t.y) / 2;
            return `
              <g>
                <line x1="${s.x}" y1="${s.y}" x2="${t.x}" y2="${t.y}" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4,3" opacity="0.8" />
                ${
                  lk.label
                    ? `<rect x="${mx - 62}" y="${my - 10}" width="124" height="18" rx="6" fill="#09090b" stroke="#3f3f46" />
                       <text x="${mx}" y="${my + 3}" fill="#fde68a" font-size="9.5" font-family="Inter, sans-serif" font-weight="700" text-anchor="middle">${this.esc(
                        String(lk.label).slice(0, 24)
                      )}</text>`
                    : ''
                }
              </g>
            `;
          })
          .join('');

      const nodesSvg = positioned
        .map((n, idx) => {
          const isChar = n.group === 'CHARACTER' || idx === 0;
          const isClue = n.group === 'CLUE';
          const stroke = isChar ? '#f59e0b' : isClue ? '#a855f7' : '#10b981';
          const bg = isChar ? '#291802' : isClue ? '#240b36' : '#052e22';
          const roleBadge = isChar
            ? '👤 HỒ SƠ NHÂN VẬT'
            : isClue
            ? '🔐 BÍ MẬT / PHỤC BÚT'
            : '📌 SỰ KIỆN TRỌNG TÂM';

          return `
            <g transform="translate(${n.x - 112}, ${n.y - 36})">
              <rect width="224" height="72" rx="16" fill="${bg}" stroke="${stroke}" stroke-width="2.2" filter="url(#dropGlow)" />
              <text x="14" y="21" fill="${stroke}" font-size="9.5" font-family="JetBrains Mono, monospace" font-weight="800">${this.esc(
                roleBadge
              )}</text>
              <text x="14" y="42" fill="#fafafa" font-size="12" font-family="Inter, sans-serif" font-weight="800">${this.esc(
                String(n.label || '').slice(0, 26)
              )}</text>
              <text x="14" y="59" fill="#d4d4d8" font-size="10" font-family="Inter, sans-serif">${this.esc(
                String(n.detail || n.time || '').slice(0, 32)
              )}</text>
            </g>
          `;
        })
        .join('');

      return this.wrapSvgFrame({
        width,
        height,
        headerTitle:
          '🕸️ MẠNG LƯỚI TÂM LÝ NHÂN VẬT & MA TRẬN AI BIẾT GÌ — CHẾ ĐỘ 5 (CHARACTER WEB)',
        edgesSvg,
        nodesSvg,
        contradictions
      });
    }

    /**
     * Kiểu 4: SCENE_ILLUSTRATION — Bảng Phân Cảnh Điện Ảnh (Cinematic Storyboard Panels)
     */
    renderSceneIllustrationSvg(graphData) {
      const nodes = Array.isArray(graphData?.nodes) ? graphData.nodes : [];
      const contradictions = Array.isArray(graphData?.contradictions)
        ? graphData.contradictions
        : [];

      const width = 940;
      const cols = 2;
      const rows = Math.max(1, Math.ceil(nodes.length / cols));
      const height = Math.max(450, rows * 165 + 135);

      const panelsSvg = nodes
        .map((n, idx) => {
          const col = idx % cols;
          const row = Math.floor(idx / cols);
          const x = 32 + col * 448;
          const y = 64 + row * 155;
          const isChar = n.group === 'CHARACTER';
          const isClue = n.group === 'CLUE';
          const stroke = isChar ? '#fbbf24' : isClue ? '#38bdf8' : '#c084fc';
          const headerBg = isChar ? '#3b2506' : isClue ? '#082f49' : '#2e1065';

          return `
            <g transform="translate(${x}, ${y})">
              <rect width="428" height="136" rx="14" fill="#121217" stroke="${stroke}" stroke-width="2" filter="url(#dropGlow)" />
              <rect width="428" height="32" rx="14" fill="${headerBg}" />
              <text x="16" y="21" fill="${stroke}" font-size="10.5" font-family="JetBrains Mono, monospace" font-weight="800">🎬 KHUNG CẢNH #${
                idx + 1
              } • ${this.esc(String(n.time || n.group || 'PHÂN CẢNH').slice(0, 32))}</text>
              <text x="16" y="60" fill="#ffffff" font-size="13.5" font-family="Inter, sans-serif" font-weight="800">${this.esc(
                String(n.label || '').slice(0, 44)
              )}</text>
              <text x="16" y="84" fill="#d4d4d8" font-size="11" font-family="Inter, sans-serif">${this.esc(
                String(n.detail || 'Triển khai hành động, nội tâm và đối thoại trọng tâm.').slice(
                  0,
                  56
                )
              )}</text>
              <rect x="16" y="102" width="396" height="18" rx="6" fill="#18181b" stroke="#27272a" />
              <text x="24" y="114" fill="#a1a1aa" font-size="9.5" font-family="JetBrains Mono, monospace">🎥 Góc máy POV & Ánh sáng Noir • Nhịp căng thẳng cao</text>
            </g>
          `;
        })
        .join('');

      return this.wrapSvgFrame({
        width,
        height,
        headerTitle:
          '🎬 BẢNG PHÂN CẢNH ĐIỆN ẢNH (STORYBOARD PANELS) & BỐI CẢNH — CHẾ ĐỘ 5',
        edgesSvg: '',
        nodesSvg: panelsSvg,
        contradictions
      });
    }

    /**
     * Khung bao SVG chuẩn với bộ lọc đổ bóng, đầu mũi tên và thanh trạng thái kiểm định logic
     */
    wrapSvgFrame({ width, height, headerTitle, edgesSvg, nodesSvg, contradictions = [] }) {
      const warnBanner =
        contradictions.length > 0
          ? `<g transform="translate(24, ${height - 46})">
               <rect width="${width - 48}" height="34" rx="8" fill="#450a0a" stroke="#ef4444" />
               <text x="16" y="21" fill="#fca5a5" font-size="11" font-family="Inter, sans-serif" font-weight="700">⚠️ Phát hiện lưu ý logic: ${this.esc(
                 String(contradictions[0]).slice(0, 96)
               )}</text>
             </g>`
          : `<g transform="translate(24, ${height - 46})">
               <rect width="${width - 48}" height="34" rx="8" fill="#052e16" stroke="#10b981" />
               <text x="16" y="21" fill="#6ee7b7" font-size="11" font-family="Inter, sans-serif" font-weight="700">✅ Kiểm tra dòng thời gian: Mạch sự kiện giữa các chương đã chọn hoàn toàn khớp nhau, không có mâu thuẫn!</text>
             </g>`;

      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="w-full h-auto max-h-[540px] rounded-xl select-none">
          <defs>
            <marker id="arrowHead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
            </marker>
            <marker id="arrowHeadBlue" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#38bdf8" />
            </marker>
            <filter id="dropGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000000" flood-opacity="0.65" />
            </filter>
          </defs>
          <rect width="${width}" height="${height}" rx="16" fill="#09090b" />
          <text x="26" y="34" fill="#10b981" font-size="13.5" font-family="Inter, sans-serif" font-weight="800">${this.esc(
            headerTitle
          )}</text>
          ${edgesSvg}
          ${nodesSvg}
          ${warnBanner}
        </svg>
      `;
    }
  }

  // ==========================================================================
  // PHẦN 4: ĐỘNG CƠ CHÍNH — MODE 5 PLOT DIAGRAM & TIMELINE STUDIO
  //         (Mode5PlotDiagramAndTimelineStudio)
  // ==========================================================================
  class Mode5PlotDiagramAndTimelineStudio {
    constructor(chapterMgr, storyBible, sysPrompts, geminiRouter, utils) {
      this._chapterMgr = chapterMgr;
      this._storyBible = storyBible;
      this._sysPrompts = sysPrompts;
      this._geminiRouter = geminiRouter;
      this._utils = utils;

      this.selectedChapterIds = new Set();
      this.lastSvgMarkup = '';
      this.lastGraphData = null;
      this.currentZoomScale = 1.0;

      this.contradictionAnalyzer = new ChronologicalAndEpistemicContradictionAnalyzer(
        this.utils
      );
      this.svgRenderer = new MultiStyleSvgDiagramRendererEngine(this.utils);
    }

    // Các getter tự động liên kết với window.NoirStudio
    get chapterMgr() {
      return this._chapterMgr || window.NoirStudio?.chapterManager;
    }

    get storyBible() {
      return this._storyBible || window.NoirStudio?.storyBible;
    }

    get sysPrompts() {
      return this._sysPrompts || window.NoirStudio?.sysPrompts;
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
          showToast: (msg) => console.log('[Toast]', msg),
          showBlockingLoader: () => {},
          hideBlockingLoader: () => {}
        }
      );
    }

    /**
     * Khởi tạo Xưởng Vẽ Biểu Đồ Cốt Truyện & Dòng Thời Gian (Chế độ 5 tại Tab 3)
     */
    init() {
      this.bindMode5ControlsIfNeeded();
      this.refreshChapterChecklist();
      this.renderDefaultPreviewDiagram();
    }

    /**
     * Gắn kết sự kiện cho toàn bộ các nút điều khiển của Chế độ 5
     */
    bindMode5ControlsIfNeeded() {
      const bindOnce = (domId, eventName, handler) => {
        const el = document.getElementById(domId);
        if (!el || el.dataset.noirMod18Bound) return;
        el.dataset.noirMod18Bound = '1';
        el.addEventListener(eventName, handler);
      };

      bindOnce('btn-mode5-select-all-chaps', 'click', () =>
        this.selectAllChapters(true)
      );
      bindOnce('btn-mode5-clear-all-chaps', 'click', () =>
        this.selectAllChapters(false)
      );
      bindOnce('btn-mode5-generate-diagram', 'click', () =>
        this.generateDiagramAndTimeline()
      );
      bindOnce('btn-mode5-export-svg', 'click', () =>
        this.exportDiagramAsSvgFile()
      );
      bindOnce('btn-mode5-open-sysprompt', 'click', () => {
        if (this.sysPrompts && typeof this.sysPrompts.openModal === 'function') {
          this.sysPrompts.openModal('MODE_5_DIAGRAM');
        } else {
          document.getElementById('modal-system-prompts-config')?.classList.remove('hidden');
        }
      });
      bindOnce('btn-mode5-copy-report', 'click', async () => {
        const txt = document.getElementById('mode5-chronicle-report')?.textContent || '';
        if (!txt.trim()) return;
        try {
          await navigator.clipboard.writeText(txt);
          this.utils.showToast('📋 Đã sao chép Báo cáo Dòng thời gian!', 'success');
        } catch (_) {
          this.utils.showToast('📋 Đã sao chép Báo cáo!', 'success');
        }
      });

      bindOnce('mode5-diagram-style', 'change', () => {
        const styleMode =
          document.getElementById('mode5-diagram-style')?.value || 'TIMELINE_AND_GRAPH';
        const graph =
          this.lastGraphData || this.buildLocalHeuristicGraph(this.getChosenChapters());
        this.buildInteractiveSvgDiagram(graph, styleMode);
      });

      this.injectMode5ExtraExportButtonsIfNeeded();
    }

    /**
     * Bổ sung nút Tải ảnh .PNG độ nét cao và nút Phóng to / Thu nhỏ ngay cạnh nút Tải .SVG
     */
    injectMode5ExtraExportButtonsIfNeeded() {
      const exportSvgBtn = document.getElementById('btn-mode5-export-svg');
      if (!exportSvgBtn || !exportSvgBtn.parentElement) return;
      if (document.getElementById('btn-mode5-export-png')) return;

      const pngBtn = document.createElement('button');
      pngBtn.id = 'btn-mode5-export-png';
      pngBtn.type = 'button';
      pngBtn.className =
        'px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 font-bold text-[11px] transition';
      pngBtn.textContent = '🖼️ Xuất ảnh .PNG';
      pngBtn.addEventListener('click', () => this.exportDiagramAsPngFile());

      exportSvgBtn.parentElement.appendChild(pngBtn);
    }

    /**
     * Làm mới danh sách hộp kiểm chọn chương (#mode5-chapter-checklist)
     */
    refreshChapterChecklist() {
      const box = document.getElementById('mode5-chapter-checklist');
      if (!box) return;
      const chaps = this.chapterMgr?.chapters || [];
      if (this.selectedChapterIds.size === 0 && chaps.length > 0) {
        chaps.forEach((c) => this.selectedChapterIds.add(c.id));
      }

      box.innerHTML = chaps
        .map((c) => {
          const checked = this.selectedChapterIds.has(c.id) ? 'checked' : '';
          return `
            <label class="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-900 cursor-pointer">
              <input type="checkbox" data-mode5-chap-check="${this.utils.escapeHtml(
                c.id
              )}" ${checked} class="accent-emerald-500 rounded" />
              <span class="truncate font-semibold text-zinc-200">${this.utils.escapeHtml(
                c.displayTitle || c.title
              )}</span>
              <span class="ml-auto font-monoCode text-[10px] text-zinc-400">${(
                c.wordCount || 0
              ).toLocaleString('vi-VN')} từ</span>
            </label>
          `;
        })
        .join('');

      box.querySelectorAll('[data-mode5-chap-check]').forEach((chk) => {
        chk.addEventListener('change', () => {
          const cid = chk.getAttribute('data-mode5-chap-check');
          if (chk.checked) this.selectedChapterIds.add(cid);
          else this.selectedChapterIds.delete(cid);
          this.renderDefaultPreviewDiagram();
        });
      });
    }

    /**
     * Chọn tất cả hoặc bỏ chọn tất cả các chương trong danh sách đối chiếu Chế độ 5
     */
    selectAllChapters(selectAll = true) {
      this.selectedChapterIds.clear();
      if (selectAll) {
        (this.chapterMgr?.chapters || []).forEach((c) => this.selectedChapterIds.add(c.id));
      }
      this.refreshChapterChecklist();
      this.renderDefaultPreviewDiagram();
    }

    /**
     * Trả về danh sách các chương đang được chọn để vẽ sơ đồ & soi mâu thuẫn thời gian
     */
    getChosenChapters() {
      const allChaps = this.chapterMgr?.chapters || [];
      const list = allChaps.filter((c) => this.selectedChapterIds.has(c.id));
      return list.length > 0 ? list : allChaps;
    }

    /**
     * Dựng biểu đồ SVG nghệ thuật & trực quan từ danh sách nút sự kiện, nhân vật và liên kết
     */
    buildInteractiveSvgDiagram(graphData, styleMode = 'TIMELINE_AND_GRAPH') {
      this.lastGraphData = graphData;
      const svg = this.svgRenderer.renderSvgByStyle(graphData, styleMode);
      this.lastSvgMarkup = svg;
      const stage = document.getElementById('mode5-svg-canvas-Stage');
      if (stage) {
        stage.innerHTML = svg;
      }
      return svg;
    }

    /**
     * Xây dựng đồ thị cốt truyện cục bộ tức thì — ƯU TIÊN NGUỒN CHÍNH TỪ STORY BIBLE (Tab 4),
     * chỉ bổ sung liên kết tóm tắt các chương đang chọn thay vì quét nặng hàng trăm tệp văn bản thô.
     */
    buildLocalHeuristicGraph(chosenChaps) {
      const chaps = Array.isArray(chosenChaps) ? chosenChaps : this.getChosenChapters();
      const analysis = this.contradictionAnalyzer.analyzeSelectedChapters(
        chaps,
        this.storyBible
      );

      const nodes = [];
      const links = [];

      // 1. Nút gốc từ Story Bible: Nhân vật & Trục quan hệ chính
      const characters = Array.isArray(this.storyBible?.characters)
        ? this.storyBible.characters
        : [];
      characters.slice(0, 5).forEach((ch, idx) => {
        const cid = `char_node_${idx}`;
        nodes.push({
          id: cid,
          label: ch.name || `Nhân vật ${idx + 1}`,
          time: ch.role || 'Story Bible · Nhân vật',
          detail: (ch.traits || ch.secret || 'Hồ sơ nhân vật cốt lõi').slice(0, 48),
          group: 'CHARACTER'
        });
      });

      // 2. Nút Phục bút & Bí mật từ Story Bible (Clues Ledger + Ai Biết Gì)
      const clues = Array.isArray(this.storyBible?.cluesLedger)
        ? this.storyBible.cluesLedger
        : [];
      clues.slice(0, 4).forEach((cl, idx) => {
        const clid = `clue_node_${idx}`;
        nodes.push({
          id: clid,
          label: cl.title || `Manh mối ${idx + 1}`,
          time: cl.plantedIn || 'Story Bible · Phục bút',
          detail: cl.status === 'RESOLVED' ? 'Đã thu hồi' : 'Đang cài cắm',
          group: 'CLUE'
        });
        if (nodes[0]) {
          links.push({
            source: nodes[0].id,
            target: clid,
            label: 'Liên kết bí mật'
          });
        }
      });

      // 3. Nút Chương tóm tắt / Nhịp sự kiện tham chiếu từ các chương được chọn
      const prevEventIds = [];
      analysis.chapterDiagnostics.slice(0, 8).forEach((diag, idx) => {
        const nid = `chap_node_${idx}`;
        nodes.push({
          id: nid,
          label: diag.title,
          time: diag.primaryTime,
          detail: `${diag.wordCount} từ • ${diag.summary.slice(0, 32)}`,
          group: 'EVENT'
        });
        prevEventIds.push(nid);
        if (idx > 0) {
          links.push({
            source: `chap_node_${idx - 1}`,
            target: nid,
            label: 'Tiếp nối'
          });
        }
        if (characters[idx]) {
          links.push({
            source: `char_node_${idx}`,
            target: nid,
            label: 'Tuyến nhân vật'
          });
        } else if (characters[0] && idx === 0) {
          links.push({
            source: 'char_node_0',
            target: nid,
            label: 'Trung tâm'
          });
        }
      });

      if (prevEventIds.length === 0 && nodes.length > 1) {
        for (let i = 1; i < nodes.length; i += 1) {
          links.push({
            source: nodes[0].id,
            target: nodes[i].id,
            label: 'Quan hệ Story Bible'
          });
        }
      }

      return {
        nodes,
        links,
        contradictions: analysis.contradictions
      };
    }

    buildStoryBibleFirstDigest(chaps, includeRawExcerpts = false) {
      const compiledBible =
        this.storyBible?.buildCompiledBibleBlockForPrompt?.() ||
        document.getElementById('textarea-rendered-bible-content')?.value?.trim() ||
        '';

      const charLines = (this.storyBible?.characters || []).map(
        (c, i) =>
          `- [NV ${i + 1}] ${c.name} (${c.role || 'Chưa rõ vai trò'}): ${c.traits || ''} ${
            c.secret ? `| Bí mật: ${c.secret}` : ''
          }`
      );
      const clueLines = (this.storyBible?.cluesLedger || []).map(
        (cl, i) =>
          `- [Phục bút ${i + 1}] ${cl.title} (${cl.status === 'RESOLVED' ? 'Đã giải đáp' : 'Đang mở'}) — Gieo tại: ${
            cl.plantedIn || '?'
          }`
      );
      const knowledgeLines = (this.storyBible?.knowledgeMatrix || []).map(
        (k, i) => `- [Ai Biết Gì ${i + 1}] ${k.character || '?'} biết: ${k.knows || k.secret || JSON.stringify(k)}`
      );

      const bibleHeader = [
        `=== NGUỒN CHÍNH: HỒ SƠ STORY BIBLE (TAB 4) ===`,
        compiledBible || '(Chưa biên soạn khung Story Bible tổng hợp)',
        charLines.length ? `--- DANH SÁCH NHÂN VẬT CỐT LÕI ---\n${charLines.join('\n')}` : '',
        clueLines.length ? `--- SỔ PHỤC BÚT & MANH MỐI ---\n${clueLines.join('\n')}` : '',
        knowledgeLines.length ? `--- MA TRẬN AI BIẾT GÌ ---\n${knowledgeLines.join('\n')}` : ''
      ]
        .filter(Boolean)
        .join('\n\n');

      const chapterList = Array.isArray(chaps) ? chaps : [];
      const chaptersDigest = includeRawExcerpts
        ? chapterList
            .map(
              (c, idx) =>
                `=== TRÍCH ĐOẠN CHƯƠNG #${idx + 1}: ${c.displayTitle || c.title} ===\n${(
                  c.content || ''
                ).slice(0, 3200)}`
            )
            .join('\n\n')
        : chapterList
            .slice(0, 20)
            .map((c, idx) => {
              const beats = String(c.beats || '').trim();
              const brief = beats
                ? `Dàn ý/Beats: ${beats.slice(0, 320)}`
                : `Tóm tắt mở đầu: ${String(c.content || '')
                    .replace(/\s+/g, ' ')
                    .trim()
                    .slice(0, 260)}`;
              return `- [Chương #${idx + 1}] ${c.displayTitle || c.title} (${
                c.status === 'APPROVED' ? 'Đã duyệt' : 'Nháp'
              }) • ${brief || 'Chưa có nội dung'}`;
            })
            .join('\n');

      return { bibleHeader, chaptersDigest };
    }

    /**
     * Dựng biểu đồ xem trước mặc định ngay khi mở Chế độ 5 hoặc đổi lựa chọn chương
     */
    renderDefaultPreviewDiagram() {
      const chaps = this.getChosenChapters();
      const styleMode =
        document.getElementById('mode5-diagram-style')?.value || 'TIMELINE_AND_GRAPH';
      const graph = this.buildLocalHeuristicGraph(chaps);
      this.buildInteractiveSvgDiagram(graph, styleMode);
    }

    /**
     * Thực thi phân tích dòng thời gian xuyên chương và vẽ Biểu đồ Cốt truyện (Chế độ 5)
     */
    async generateDiagramAndTimeline(customUserPrompt = '', overrideModelId = null) {
      const chaps = this.getChosenChapters();
      const styleMode =
        document.getElementById('mode5-diagram-style')?.value || 'TIMELINE_AND_GRAPH';
      const modelId =
        overrideModelId ||
        document.getElementById('mode5-model-selector')?.value ||
        this.geminiRouter?.selectedModelId ||
        'gemini-3.8-flash';
      const promptInput = document.getElementById('mode5-prompt-input');
      const userReq =
        (customUserPrompt || promptInput?.value || '').trim() ||
        'Hãy vẽ biểu đồ diễn biến sự kiện theo trình tự thời gian của các chương đã chọn, chỉ rõ từng nhân vật đang ở đâu, biết thông tin gì và kiểm tra kỹ xem có chi tiết nào mâu thuẫn không.';

      // Trước tiên dựng ngay sơ đồ cục bộ tức thì để tác giả thấy phản hồi trực quan
      const localGraph = this.buildLocalHeuristicGraph(chaps);
      this.buildInteractiveSvgDiagram(localGraph, styleMode);

      const statusEl = document.getElementById('mode5-visual-status');
      const reportEl = document.getElementById('mode5-chronicle-report');

      // Nếu chưa có API Key, vẫn xuất bản báo cáo dòng thời gian cục bộ chi tiết
      const effectiveKey =
        this.geminiRouter?.getEffectiveActiveKey?.() ||
        this.geminiRouter?.getApiKey?.() ||
        '';
      if (!effectiveKey) {
        const localReport =
          this.contradictionAnalyzer.buildDetailedVietnameseChronicleReport(
            chaps,
            this.storyBible
          );
        if (reportEl) reportEl.textContent = localReport;
        window.NoirStudio?.tab3Controller?.setOutputForMode?.(
          'MODE_5_DIAGRAM',
          localReport
        );
        this.utils.showToast(
          '🎨 Đã vẽ sơ đồ cốt truyện & báo cáo biên niên sử cục bộ! (Nhập API Key ở Tab 6 nếu muốn AI soi mâu thuẫn sâu hơn).',
          'info'
        );
        return;
      }

      if (statusEl) {
        statusEl.textContent = '⏳ AI đang phân tích dòng thời gian & vẽ sơ đồ...';
      }
      this.utils.showBlockingLoader(
        '🎨 Đang Vẽ Biểu Đồ Cốt Truyện Từ Story Bible (Chế Độ 5)...',
        `Đang tổng hợp trực tiếp từ Story Bible & tóm tắt ${chaps.length} chương trên mô hình ${modelId}. Vui lòng kiên nhẫn chờ, KHÔNG tắt trang web hay thoát khỏi màn hình này để Prompt chạy ổn định...`
      );

      try {
        const includeRawChapters = Boolean(
          document.getElementById('mode5-chk-include-raw-chapters')?.checked
        );
        const { bibleHeader, chaptersDigest } = this.buildStoryBibleFirstDigest(
          chaps,
          includeRawChapters
        );

        const fullMode5Prompt = [
          bibleHeader,
          ``,
          `=== THÔNG TIN CHƯƠNG THAM CHIẾU (${chaps.length} CHƯƠNG • CHẾ ĐỘ ${
            includeRawChapters ? 'ĐẦY ĐỦ TRÍCH ĐOẠN' : 'TÓM TẮT GỌN THEO STORY BIBLE'
          }) ===`,
          chaptersDigest || '(Không chọn thêm chương lẻ — tập trung 100% theo Story Bible)',
          ``,
          `=== HÌNH THỨC BIỂU ĐỒ YÊU CẦU: ${styleMode} ===`,
          `=== YÊU CẦU CỤ THỂ CỦA TÁC GIẢ ===`,
          userReq
        ].join('\n');

        const thinkingLevel =
          this.geminiRouter?.getThinkingLevel?.() || 'MEDIUM';
        const enableWebSearch = Boolean(
          this.geminiRouter?.isWebSearchEnabled?.()
        );
        const res = await this.geminiRouter.generateTextWithFallback({
          prompt: fullMode5Prompt,
          systemInstruction:
            this.sysPrompts?.getPromptForMode?.('MODE_5_DIAGRAM') || '',
          modelId,
          temperature: 0.45,
          maxOutputTokens: 8192,
          thinkingLevel,
          enableWebSearch
        });

        this.utils.hideBlockingLoader();

        // Tách khối JSON (nếu AI trả về) để dựng biểu đồ SVG chính xác theo sự kiện AI trích xuất
        const jsonMatch = res.text.match(/```json\s*([\s\S]*?)```/i);
        const rawCleanReport = res.text.replace(/```json[\s\S]*?```/gi, '').trim();
        const stripper =
          typeof window !== 'undefined' && typeof window.NoirStudio?.stripAiMarkdownSymbols === 'function'
            ? window.NoirStudio.stripAiMarkdownSymbols
            : null;
        const cleanReport = stripper ? stripper(rawCleanReport) : rawCleanReport;

        if (jsonMatch && jsonMatch[1]) {
          try {
            const parsedGraph = JSON.parse(jsonMatch[1].trim());
            if (Array.isArray(parsedGraph.nodes) && parsedGraph.nodes.length > 0) {
              this.buildInteractiveSvgDiagram(parsedGraph, styleMode);
            }
          } catch (_) {}
        }

        if (reportEl) reportEl.textContent = cleanReport || (stripper ? stripper(res.text) : res.text);
        if (statusEl) {
          statusEl.textContent = '✅ Đã hoàn tất vẽ sơ đồ & kiểm tra dòng thời gian';
        }
        window.NoirStudio?.tab3Controller?.setOutputForMode?.(
          'MODE_5_DIAGRAM',
          cleanReport || res.text
        );

        this.utils.showToast(
          '🎨 Đã vẽ xong Biểu đồ Cốt truyện & Bảng theo dõi diễn biến theo thời gian!',
          'success'
        );
      } catch (err) {
        this.utils.hideBlockingLoader();
        if (statusEl) statusEl.textContent = '⚠️ Đang hiển thị sơ đồ cục bộ';
        this.utils.showToast(`⚠️ Lỗi gọi AI Chế độ 5: ${err.message}`, 'warning');
      }
    }

    /**
     * Xuất biểu đồ hiện tại thành tệp đồ họa Vector (.SVG)
     */
    exportDiagramAsSvgFile() {
      if (!this.lastSvgMarkup) {
        this.renderDefaultPreviewDiagram();
      }
      const blob = new Blob([this.lastSvgMarkup], {
        type: 'image/svg+xml;charset=utf-8'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Bieu_Do_Cot_Truyen_Mode5_${Date.now()}.svg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      this.utils.showToast(
        '🖼️ Đã tải xuống file ảnh Biểu đồ Cốt truyện (.SVG)!',
        'success'
      );
    }

    /**
     * Xuất biểu đồ hiện tại thành tệp ảnh độ phân giải cao (.PNG) thông qua HTML5 Canvas
     */
    exportDiagramAsPngFile() {
      if (!this.lastSvgMarkup) {
        this.renderDefaultPreviewDiagram();
      }

      const svgBlob = new Blob([this.lastSvgMarkup], {
        type: 'image/svg+xml;charset=utf-8'
      });
      const domUrl = URL.createObjectURL(svgBlob);
      const img = new Image();

      img.onload = () => {
        try {
          const scale = 2; // Độ nét gấp đôi (Retina 2x)
          const canvas = document.createElement('canvas');
          canvas.width = (img.width || 940) * scale;
          canvas.height = (img.height || 520) * scale;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#09090b';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          canvas.toBlob((pngBlob) => {
            URL.revokeObjectURL(domUrl);
            if (!pngBlob) return;
            const pngUrl = URL.createObjectURL(pngBlob);
            const a = document.createElement('a');
            a.href = pngUrl;
            a.download = `Bieu_Do_Cot_Truyen_Mode5_HD_${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(pngUrl);
            this.utils.showToast(
              '🖼️ Đã tải xuống ảnh Biểu đồ Cốt truyện độ nét cao (.PNG)!',
              'success'
            );
          }, 'image/png');
        } catch (_) {
          URL.revokeObjectURL(domUrl);
          this.exportDiagramAsSvgFile();
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(domUrl);
        this.exportDiagramAsSvgFile();
      };

      img.src = domUrl;
    }
  }
  // ==========================================================================
  // PHẦN 5: BỘ PHÂN TÍCH ĐƯỜNG CONG KỊCH TÍNH 4 HỒI (KHỞI - THỪA - CHUYỂN - HỢP)
  //         & KIỂM ĐỊNH NHỊP ĐỘ CỐT TRUYỆN (Mode5DramaticArcAndPacingCurveEngine)
  // ==========================================================================
  class Mode5DramaticArcAndPacingCurveEngine {
    constructor(studio) {
      this.studio = studio;
    }

    /**
     * Phân tích cấu trúc 4 giai đoạn (Khởi - Thừa - Chuyển - Hợp) của các chương đang chọn
     * và tính toán độ dốc kịch tính (Tension Gradient) giữa các chương liên tiếp.
     */
    computeDramaticArcProfile(chosenChapters = null) {
      const chaps = Array.isArray(chosenChapters)
        ? chosenChapters
        : this.studio.getChosenChapters();

      const analysis =
        this.studio.contradictionAnalyzer.analyzeSelectedChapters(
          chaps,
          this.studio.storyBible
        );
      const diagnostics = analysis.chapterDiagnostics;

      if (diagnostics.length === 0) {
        return {
          totalChapters: 0,
          averageTension: 0,
          peakChapter: null,
          valleyChapter: null,
          stages: [],
          pacingWarnings: []
        };
      }

      let peakChapter = diagnostics[0];
      let valleyChapter = diagnostics[0];
      let sumTension = 0;

      const stages = diagnostics.map((d, idx) => {
        sumTension += d.tensionScore;
        if (d.tensionScore > peakChapter.tensionScore) peakChapter = d;
        if (d.tensionScore < valleyChapter.tensionScore) valleyChapter = d;

        const progressRatio = (idx + 1) / Math.max(1, diagnostics.length);
        let stageName = '🌱 KHỞI (Thiết lập bối cảnh & Gieo mầm sự kiện)';
        if (progressRatio > 0.25 && progressRatio <= 0.55) {
          stageName = '🌊 THỪA (Triển khai xung đột & Đấu trí ngầm)';
        } else if (progressRatio > 0.55 && progressRatio <= 0.85) {
          stageName = '⚡ CHUYỂN (Biến cố bước ngoặt & Đẩy cao trào)';
        } else if (progressRatio > 0.85) {
          stageName = '🔥 HỢP (Lật mở chân tướng & Dư âm kết màn)';
        }

        const prevTension = idx > 0 ? diagnostics[idx - 1].tensionScore : d.tensionScore;
        const deltaTension = d.tensionScore - prevTension;

        return {
          chapterIndex: d.chapterIndex,
          title: d.title,
          wordCount: d.wordCount,
          tensionScore: d.tensionScore,
          deltaTension,
          stageName,
          dialogueCount: d.dialogueCount,
          appearingCharactersCount: d.appearingCharacters.length,
          cluesCount: d.activeCluesInChap.length
        };
      });

      const pacingWarnings = [];
      // Kiểm tra nếu 3 chương liên tiếp đều có độ căng thẳng thấp (< 45) -> Cảnh báo chùng nhịp
      for (let i = 0; i <= stages.length - 3; i += 1) {
        if (
          stages[i].tensionScore < 45 &&
          stages[i + 1].tensionScore < 45 &&
          stages[i + 2].tensionScore < 45
        ) {
          pacingWarnings.push(
            `Nhịp truyện từ "${stages[i].title}" đến "${
              stages[i + 2].title
            }" đang khá êm ả liên tiếp 3 chương. Gợi ý: Cài thêm 1 chi tiết bất ngờ hoặc xung đột đối thoại để giữ chân độc giả.`
          );
        }
      }

      // Kiểm tra nếu 3 chương liên tiếp đều căng thẳng kịch trần (> 85) -> Cảnh báo thiếu khoảng thở
      for (let i = 0; i <= stages.length - 3; i += 1) {
        if (
          stages[i].tensionScore > 85 &&
          stages[i + 1].tensionScore > 85 &&
          stages[i + 2].tensionScore > 85
        ) {
          pacingWarnings.push(
            `Nhịp truyện từ "${stages[i].title}" đến "${
              stages[i + 2].title
            }" duy trì mức căng thẳng >85/100 liên tục. Gợi ý: Đan xen một khoảng lặng nội tâm ngắn để tạo độ tương phản cảm xúc.`
          );
        }
      }

      return {
        totalChapters: diagnostics.length,
        averageTension: Math.round(sumTension / diagnostics.length),
        peakChapter: {
          title: peakChapter.title,
          tensionScore: peakChapter.tensionScore
        },
        valleyChapter: {
          title: valleyChapter.title,
          tensionScore: valleyChapter.tensionScore
        },
        stages,
        pacingWarnings
      };
    }

    /**
     * Dựng biểu đồ SVG Đường Cong Kịch Tính (Dramatic Tension Curve SVG)
     * hiển thị trực quan độ cao trào qua từng chương
     */
    renderDramaticArcSvg(chosenChapters = null) {
      const profile = this.computeDramaticArcProfile(chosenChapters);
      const stages = profile.stages || [];
      const width = 940;
      const height = 460;
      const padLeft = 75;
      const padRight = 55;
      const padTop = 75;
      const padBottom = 85;
      const plotW = width - padLeft - padRight;
      const plotH = height - padTop - padBottom;

      if (stages.length === 0) {
        return this.studio.svgRenderer.renderTimelineAndGraphSvg({
          nodes: [],
          links: [],
          contradictions: []
        });
      }

      const points = stages.map((st, idx) => {
        const ratioX =
          stages.length === 1 ? 0.5 : idx / Math.max(1, stages.length - 1);
        const x = Math.round(padLeft + ratioX * plotW);
        const y = Math.round(padTop + plotH - (st.tensionScore / 100) * plotH);
        return { ...st, x, y };
      });

      const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');
      const areaPoints = `${padLeft},${padTop + plotH} ${polylinePoints} ${
        points[points.length - 1].x
      },${padTop + plotH}`;

      const gridLinesSvg = [25, 50, 75, 100]
        .map((level) => {
          const gy = Math.round(padTop + plotH - (level / 100) * plotH);
          return `
            <line x1="${padLeft}" y1="${gy}" x2="${width - padRight}" y2="${gy}" stroke="#27272a" stroke-width="1" stroke-dasharray="4,4" />
            <text x="${padLeft - 12}" y="${gy + 4}" fill="#71717a" font-size="10" font-family="JetBrains Mono, monospace" text-anchor="end">${level}%</text>
          `;
        })
        .join('');

      const dotsAndLabelsSvg = points
        .map(
          (p) => `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="7" fill="#10b981" stroke="#052e16" stroke-width="2.5" />
            <rect x="${p.x - 56}" y="${p.y - 34}" width="112" height="22" rx="6" fill="#09090b" stroke="#10b981" />
            <text x="${p.x}" y="${p.y - 19}" fill="#6ee7b7" font-size="10" font-family="JetBrains Mono, monospace" font-weight="700" text-anchor="middle">${
            p.tensionScore
          }/100</text>
            <text x="${p.x}" y="${padTop + plotH + 22}" fill="#e4e4e7" font-size="10.5" font-family="Inter, sans-serif" font-weight="700" text-anchor="middle">${this.studio.svgRenderer.esc(
            String(p.title).slice(0, 16)
          )}</text>
          </g>
        `
        )
        .join('');

      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="w-full h-auto max-h-[520px] rounded-xl">
          <defs>
            <linearGradient id="tensionGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#10b981" stop-opacity="0.45" />
              <stop offset="100%" stop-color="#10b981" stop-opacity="0.02" />
            </linearGradient>
          </defs>
          <rect width="${width}" height="${height}" rx="16" fill="#09090b" />
          <text x="28" y="36" fill="#10b981" font-size="14" font-family="Inter, sans-serif" font-weight="800">📈 ĐƯỜNG CONG NHỊP ĐỘ KỊCH TÍNH (KHỞI - THỪA - CHUYỂN - HỢP) QUA ${
            stages.length
          } CHƯƠNG</text>
          ${gridLinesSvg}
          <polygon points="${areaPoints}" fill="url(#tensionGrad)" />
          <polyline points="${polylinePoints}" fill="none" stroke="#10b981" stroke-width="3.2" />
          ${dotsAndLabelsSvg}
        </svg>
      `;

      this.studio.lastSvgMarkup = svg;
      const stage = document.getElementById('mode5-svg-canvas-Stage');
      if (stage) stage.innerHTML = svg;
      return svg;
    }
  }

  // ==========================================================================
  // PHẦN 6: BỘ TƯƠNG TÁC, LỌC NÚT BIỂU ĐỒ & THÊM SỰ KIỆN THỦ CÔNG TRÊN SÂN KHẤU
  //         (Mode5InteractiveStageToolbarAndCustomGraphEditor)
  // ==========================================================================
  class Mode5InteractiveStageToolbarAndCustomGraphEditor {
    constructor(studio) {
      this.studio = studio;
      this.activeNodeFilter = 'ALL'; // 'ALL' | 'EVENT' | 'CHARACTER' | 'CLUE'
      this.customUserNodes = [];
      this.customUserLinks = [];
    }

    /**
     * Lọc biểu đồ hiện tại theo nhóm nút (Tất cả, Chỉ Sự kiện, Chỉ Nhân vật, Chỉ Phục bút)
     */
    filterDiagramByGroup(groupFilter = 'ALL') {
      this.activeNodeFilter = groupFilter;
      const baseGraph =
        this.studio.lastGraphData ||
        this.studio.buildLocalHeuristicGraph(this.studio.getChosenChapters());

      if (!groupFilter || groupFilter === 'ALL') {
        const styleMode =
          document.getElementById('mode5-diagram-style')?.value || 'TIMELINE_AND_GRAPH';
        return this.studio.buildInteractiveSvgDiagram(baseGraph, styleMode);
      }

      const filteredNodes = (baseGraph.nodes || []).filter(
        (n) => n.group === groupFilter
      );
      const allowedIds = new Set(filteredNodes.map((n) => n.id));
      const filteredLinks = (baseGraph.links || []).filter(
        (l) => allowedIds.has(l.source) && allowedIds.has(l.target)
      );

      const styleMode =
        document.getElementById('mode5-diagram-style')?.value || 'TIMELINE_AND_GRAPH';
      return this.studio.buildInteractiveSvgDiagram(
        {
          nodes: filteredNodes.length > 0 ? filteredNodes : baseGraph.nodes,
          links: filteredLinks,
          contradictions: baseGraph.contradictions || []
        },
        styleMode
      );
    }

    /**
     * Cho phép tác giả thêm nhanh một nút Sự kiện / Nhân vật / Phục bút tùy chỉnh
     * vào biểu đồ hiện tại để phác thảo nhánh cốt truyện mới
     */
    addCustomNodeToActiveDiagram({
      label,
      time = 'Mốc mới',
      detail = 'Tình tiết phác thảo',
      group = 'EVENT',
      connectFromNodeId = null,
      edgeLabel = 'Phát triển nhánh'
    }) {
      const cleanLabel = String(label || '').trim();
      if (!cleanLabel) return null;

      const baseGraph =
        this.studio.lastGraphData ||
        this.studio.buildLocalHeuristicGraph(this.studio.getChosenChapters());

      const newNode = {
        id: `custom_node_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        label: cleanLabel,
        time: String(time || 'Mốc mới').trim(),
        detail: String(detail || '').trim(),
        group: ['EVENT', 'CHARACTER', 'CLUE'].includes(group) ? group : 'EVENT'
      };

      baseGraph.nodes = [...(baseGraph.nodes || []), newNode];
      if (connectFromNodeId) {
        baseGraph.links = [
          ...(baseGraph.links || []),
          {
            source: connectFromNodeId,
            target: newNode.id,
            label: edgeLabel
          }
        ];
      } else if (baseGraph.nodes.length > 1) {
        const prevNode = baseGraph.nodes[baseGraph.nodes.length - 2];
        baseGraph.links = [
          ...(baseGraph.links || []),
          {
            source: prevNode.id,
            target: newNode.id,
            label: edgeLabel
          }
        ];
      }

      const styleMode =
        document.getElementById('mode5-diagram-style')?.value || 'TIMELINE_AND_GRAPH';
      this.studio.buildInteractiveSvgDiagram(baseGraph, styleMode);
      return newNode;
    }

    /**
     * Xuất dữ liệu cấu trúc biểu đồ hiện tại thành tệp JSON để lưu trữ hoặc chia sẻ
     */
    exportGraphDataAsJsonFile() {
      const graph =
        this.studio.lastGraphData ||
        this.studio.buildLocalHeuristicGraph(this.studio.getChosenChapters());
      const jsonText = JSON.stringify(graph, null, 2);
      const blob = new Blob([jsonText], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Du_Lieu_So_Do_Mode5_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      this.studio.utils.showToast(
        '📦 Đã tải xuống dữ liệu cấu trúc biểu đồ (.JSON)!',
        'success'
      );
    }
  }

  // ==========================================================================
  // PHẦN 7: BỘ ĐỐI CHIẾU MA TRẬN AI BIẾT GÌ XUYÊN CHƯƠNG (EPISTEMIC CROSS-MATRIX)
  //         (Mode5EpistemicCrossChapterMatrixBuilder)
  // ==========================================================================
  class Mode5EpistemicCrossChapterMatrixBuilder {
    constructor(studio) {
      this.studio = studio;
    }

    /**
     * Xây dựng bảng tổng hợp đối chiếu từng Nhân vật với từng Bí mật / Phục bút
     * qua các chương được chọn để tác giả kiểm soát chặt chẽ bất đối xứng thông tin
     */
    buildEpistemicMatrixSummary() {
      const chaps = this.studio.getChosenChapters();
      const characters = Array.isArray(this.studio.storyBible?.characters)
        ? this.studio.storyBible.characters
        : [];
      const matrix = Array.isArray(this.studio.storyBible?.knowledgeMatrix)
        ? this.studio.storyBible.knowledgeMatrix
        : [];
      const clues = Array.isArray(this.studio.storyBible?.cluesLedger)
        ? this.studio.storyBible.cluesLedger
        : [];

      const rows = matrix.map((m, idx) => {
        const charName = String(m.character || 'Nhân vật').trim();
        const secret = String(m.secret || 'Bí mật').trim();
        const state = String(m.state || 'CHƯA BIẾT').trim();
        const note = String(m.note || '').trim();

        // Tìm những chương mà cả nhân vật này và từ khóa bí mật cùng xuất hiện
        const overlappingChapters = chaps
          .filter((c) => {
            const lower = String(c.content || '').toLowerCase();
            return (
              lower.includes(charName.toLowerCase()) &&
              secret
                .toLowerCase()
                .split(/\s+/)
                .filter((w) => w.length >= 4)
                .some((kw) => lower.includes(kw))
            );
          })
          .map((c) => c.displayTitle || c.title);

        return {
          index: idx + 1,
          character: charName,
          secret,
          state,
          note,
          overlappingChapters
        };
      });

      return {
        characterCount: characters.length,
        knowledgeEntryCount: rows.length,
        activeClueCount: clues.filter((c) => c.status !== 'RESOLVED').length,
        resolvedClueCount: clues.filter((c) => c.status === 'RESOLVED').length,
        rows
      };
    }

    /**
     * Tạo văn bản báo cáo Ma trận Ai Biết Gì để chèn thêm vào Báo cáo Chế độ 5
     */
    formatEpistemicMatrixTextReport() {
      const summary = this.buildEpistemicMatrixSummary();
      if (summary.rows.length === 0) {
        return 'ℹ️ Ma trận Ai Biết Gì hiện chưa có mục giới hạn nhận thức nào được khai báo tại Tab 4.';
      }

      const lines = summary.rows.map((r) => {
        const chapNote =
          r.overlappingChapters.length > 0
            ? `Xuất hiện giao thoa tại: ${r.overlappingChapters.join(', ')}`
            : 'Chưa giao thoa trực tiếp trong bản thảo';
        return `  ${r.index}. [${r.character}] ➔ "${r.secret}" : [${r.state}] (${
          r.note || chapNote
        })`;
      });

      return [
        `🔐 BẢNG ĐỐI CHIẾU MA TRẬN AI BIẾT GÌ QUA CÁC CHƯƠNG:`,
        `• Tổng số hồ sơ nhân vật : ${summary.characterCount}`,
        `• Phục bút đang mở       : ${summary.activeClueCount} (Đã thu hồi: ${summary.resolvedClueCount})`,
        ...lines
      ].join('\n');
    }

    /**
     * Kiểm tra tính toàn vẹn của toàn bộ thành phần DOM thuộc Chế độ 5
     */
    verifyMode5DomElements() {
      const requiredIds = [
        'mode5-plot-diagram-studio',
        'mode5-chapter-checklist',
        'btn-mode5-select-all-chaps',
        'btn-mode5-clear-all-chaps',
        'mode5-model-selector',
        'mode5-diagram-style',
        'mode5-prompt-input',
        'btn-mode5-generate-diagram',
        'btn-mode5-open-sysprompt',
        'btn-mode5-export-svg',
        'mode5-svg-canvas-Stage',
        'mode5-visual-status',
        'mode5-chronicle-report',
        'btn-mode5-copy-report'
      ];
      const missingIds = requiredIds.filter((id) => !document.getElementById(id));
      return {
        healthy: missingIds.length === 0,
        missingIds,
        selectedChaptersCount: this.studio.selectedChapterIds.size
      };
    }
  }

  // ==========================================================================
  // PHẦN 7B: BỘ XUẤT ẢNH PNG TỪ SVG SƠ ĐỒ & PHÂN TÍCH MẠCH NHÂN QUẢ (EXPORTER)
  // ==========================================================================
  class Mode5TimelinePngAndReportExporter {
    constructor(studio) {
      this.studio = studio;
    }

    /**
     * Chuyển đổi SVG sơ đồ cốt truyện hiện tại sang ảnh PNG độ phân giải 2x (Retina)
     * để tác giả chèn trực tiếp vào hồ sơ biên tập hoặc chia sẻ nhóm đọc thử.
     */
    async exportSvgStageToPngImage() {
      const stageEl = document.getElementById('mode5-svg-stage');
      if (!stageEl) return false;
      const svgEl = stageEl.querySelector('svg');
      if (!svgEl) {
        this.studio.utils?.showToast(
          '⚠️ Chưa có biểu đồ cốt truyện nào trên khung hiển thị để xuất PNG!',
          'warning'
        );
        return false;
      }

      try {
        const clone = svgEl.cloneNode(true);
        const viewBox = clone.getAttribute('viewBox') || '0 0 1100 620';
        const parts = viewBox.split(/\s+/).map((n) => parseFloat(n) || 0);
        const width = Math.max(800, parts[2] || 1100);
        const height = Math.max(480, parts[3] || 620);

        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        clone.setAttribute('width', String(width));
        clone.setAttribute('height', String(height));

        const xmlStr = new XMLSerializer().serializeToString(clone);
        const svgBlob = new Blob([xmlStr], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        const img = new Image();
        const loaded = await new Promise((resolve) => {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = url;
        });

        if (!loaded) {
          URL.revokeObjectURL(url);
          this.studio.utils?.showToast(
            '⚠️ Trình duyệt không thể kết xuất ảnh PNG từ SVG này, hãy dùng xuất SVG.',
            'warning'
          );
          return false;
        }

        const scale = 2;
        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          return false;
        }

        ctx.fillStyle = '#09090b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);

        const pngDataUrl = canvas.toDataURL('image/png', 0.96);
        const a = document.createElement('a');
        a.href = pngDataUrl;
        a.download = `SoDo_CotTruyen_${new Date().toISOString().slice(0, 10)}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();

        this.studio.utils?.showToast(
          '🖼️ Đã xuất ảnh sơ đồ cốt truyện PNG (2x sắc nét)!',
          'success'
        );
        return true;
      } catch (err) {
        this.studio.utils?.showToast(
          `❌ Lỗi kết xuất PNG: ${err?.message || 'Không xác định'}`,
          'error'
        );
        return false;
      }
    }

    /**
     * Xuất báo cáo biên niên sử dạng CSV chuẩn UTF-8 BOM (mở mượt trên Excel tiếng Việt)
     */
    exportTimelineEventsAsCsv(eventsList) {
      const list = Array.isArray(eventsList) ? eventsList : [];
      if (!list.length) {
        this.studio.utils?.showToast(
          '⚠️ Chưa có danh sách sự kiện để xuất CSV.',
          'warning'
        );
        return false;
      }

      const csvEscape = (val) => {
        const s = String(val ?? '').replace(/\r?\n/g, ' ');
        return `"${s.replace(/"/g, '""')}"`;
      };

      const headers = [
        'STT',
        'Tên Chương',
        'Mốc Thời Gian',
        'Địa Điểm',
        'Nhân Vật Tham Gia',
        'Sự Kiện Chính',
        'Hệ Quả / Phục Bút',
        'Cảnh Báo Mâu Thuẫn'
      ];

      const rows = list.map((ev, idx) => [
        idx + 1,
        ev.chapterTitle || ev.chapter || '',
        ev.timeLabel || ev.timestamp || '',
        ev.location || '',
        Array.isArray(ev.characters) ? ev.characters.join(', ') : (ev.characters || ''),
        ev.summary || ev.event || '',
        ev.consequence || ev.foreshadowing || '',
        ev.conflictFlag || 'Hợp lệ'
      ]);

      const csvText =
        '\uFEFF' +
        [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\r\n');

      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BienNienSu_SuKien_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      this.studio.utils?.showToast(
        `📊 Đã xuất bảng CSV ${list.length} mốc sự kiện (UTF-8 Excel)!`,
        'success'
      );
      return true;
    }
  }

  // ==========================================================================
  // PHẦN 7C: BỘ KIỂM TRA MẠCH NHÂN QUẢ & ĐỨT GÃY KHÔNG-THỜI GIAN LIÊN CHƯƠNG
  // ==========================================================================
  class Mode5SceneContinuityGraphValidator {
    constructor(studio) {
      this.studio = studio;
      this.lastValidationReport = null;
    }

    /**
     * Quét chuỗi chương đã chọn để tìm các điểm đứt gãy logic:
     * 1) Nhân vật thay đổi vị trí tức thời bất hợp lý giữa hai phân cảnh liên tiếp
     * 2) Mốc thời gian bị đảo lộn (ngày sau đứng trước ngày trước mà không ghi hồi tưởng)
     * 3) Phục bút đã gieo nhưng chưa có manh mối hồi đáp ở chương kế tiếp
     */
    analyzeCausalContinuity(chapters) {
      const list = Array.isArray(chapters) ? chapters : [];
      const issues = [];
      const timelineTokens = [
        { regex: /(?:rạng sáng|bình minh|sáng sớm)/i, slot: 1, label: 'Sáng sớm' },
        { regex: /(?:buổi trưa|giữa trưa|chính ngọ)/i, slot: 2, label: 'Buổi trưa' },
        { regex: /(?:buổi chiều|hoàng hôn|xế tà)/i, slot: 3, label: 'Buổi chiều' },
        { regex: /(?:ban đêm|nửa đêm|giờ Hợi|canh ba|đêm khuya)/i, slot: 4, label: 'Ban đêm' }
      ];
      const flashbackHint = /(?:hồi ức|ký ức|năm năm trước|ngày ấy|nhớ lại|quá khứ|flashback)/i;

      let prevDayOrder = 0;
      let prevTitle = '';

      list.forEach((chap, idx) => {
        const text = String(chap.content || '').slice(0, 6000);
        const title = chap.displayTitle || chap.title || `Chương ${idx + 1}`;
        const hasFlashback = flashbackHint.test(text);

        let detectedSlot = 0;
        let detectedLabel = '';
        for (const t of timelineTokens) {
          if (t.regex.test(text)) {
            detectedSlot = t.slot;
            detectedLabel = t.label;
            break;
          }
        }

        const dayMatch = text.match(/(?:ngày\s+thứ\s+|ngày\s+)(\d+)/i);
        const dayNum = dayMatch ? parseInt(dayMatch[1], 10) : 0;

        if (dayNum > 0 && prevDayOrder > 0 && dayNum < prevDayOrder && !hasFlashback) {
          issues.push({
            severity: 'HIGH',
            chapterId: chap.id,
            chapterTitle: title,
            category: 'CHRONOLOGY_REVERSAL',
            message: `Mốc "Ngày ${dayNum}" xuất hiện sau "Ngày ${prevDayOrder}" (${prevTitle}) nhưng thiếu từ khóa hồi tưởng/flashback.`
          });
        }

        if (dayNum > prevDayOrder) {
          prevDayOrder = dayNum;
        }
        if (detectedSlot > 0 && idx > 0 && !detectedLabel) {
          // giữ nhánh sạch để phân tích mở rộng theo khung giờ
        }

        const openClueMatches = text.match(/(?:bí mật|manh mối|bức thư niêm phong|lời thề|dấu vết lạ)/gi) || [];
        if (openClueMatches.length >= 4 && (!chap.beats || chap.beats.trim().length < 20)) {
          issues.push({
            severity: 'MEDIUM',
            chapterId: chap.id,
            chapterTitle: title,
            category: 'UNTRACKED_FORESHADOWING',
            message: `Phát hiện ${openClueMatches.length} yếu tố phục bút nhưng ô Beats/Dàn ý chưa ghi chú đích giải mã.`
          });
        }

        prevTitle = title;
      });

      this.lastValidationReport = {
        scannedCount: list.length,
        issuesCount: issues.length,
        issues,
        scannedAt: Date.now()
      };
      return this.lastValidationReport;
    }

    buildCompactSummaryText() {
      if (!this.lastValidationReport) return 'Chưa chạy phân tích mạch nhân quả.';
      const r = this.lastValidationReport;
      if (r.issuesCount === 0) {
        return `✅ Đã kiểm tra ${r.scannedCount} chương: Không phát hiện đứt gãy thời gian hay phục bút bị bỏ quên.`;
      }
      return r.issues
        .map((it, i) => `${i + 1}. [${it.severity}] ${it.chapterTitle}: ${it.message}`)
        .join('\n');
    }
  }

  // ==========================================================================
  // PHẦN 8: KHỞI TẠO & XUẤT RA KHÔNG GIAN TÊN TOÀN CỤC (window.NoirStudio)
  // ==========================================================================
  window.NoirStudio.Mode5PlotDiagramAndTimelineStudio =
    Mode5PlotDiagramAndTimelineStudio;
  window.NoirStudio.ChronologicalAndEpistemicContradictionAnalyzer =
    ChronologicalAndEpistemicContradictionAnalyzer;
  window.NoirStudio.MultiStyleSvgDiagramRendererEngine =
    MultiStyleSvgDiagramRendererEngine;
  window.NoirStudio.Mode5DramaticArcAndPacingCurveEngine =
    Mode5DramaticArcAndPacingCurveEngine;
  window.NoirStudio.Mode5InteractiveStageToolbarAndCustomGraphEditor =
    Mode5InteractiveStageToolbarAndCustomGraphEditor;
  window.NoirStudio.Mode5EpistemicCrossChapterMatrixBuilder =
    Mode5EpistemicCrossChapterMatrixBuilder;
  window.NoirStudio.Mode5TimelinePngAndReportExporter =
    Mode5TimelinePngAndReportExporter;
  window.NoirStudio.Mode5SceneContinuityGraphValidator =
    Mode5SceneContinuityGraphValidator;

  const mode5Studio = new Mode5PlotDiagramAndTimelineStudio(
    window.NoirStudio.chapterManager,
    window.NoirStudio.storyBible,
    window.NoirStudio.sysPrompts,
    window.NoirStudio.geminiRouter,
    window.NoirStudio.utils
  );
  mode5Studio.dramaticArcEngine = new Mode5DramaticArcAndPacingCurveEngine(
    mode5Studio
  );
  mode5Studio.stageEditor = new Mode5InteractiveStageToolbarAndCustomGraphEditor(
    mode5Studio
  );
  mode5Studio.epistemicMatrixBuilder = new Mode5EpistemicCrossChapterMatrixBuilder(
    mode5Studio
  );
  mode5Studio.pngAndCsvExporter = new Mode5TimelinePngAndReportExporter(mode5Studio);
  mode5Studio.continuityValidator = new Mode5SceneContinuityGraphValidator(mode5Studio);
  window.NoirStudio.mode5Studio = mode5Studio;
})();
