/**
 * ============================================================================
 * MODULE 20: ĐỒNG HỒ TẬP TRUNG POMODORO ĐỒNG BỘ HAI CHIỀU 100%
 * Tệp: mod20_bidirectional_pomodoro_sync_engine.js
 * ============================================================================
 * Nhiệm vụ chuyên biệt:
 *   1. Xóa bỏ hoàn toàn lỗi lệch bộ đếm cũ: dùng DUY NHẤT một nguồn trạng thái
 *      (`noir_unified_pomodoro_state_v36`) và một bộ đếm thời gian dựa trên
 *      mốc thời gian thực (`targetEndEpochMs`) để dù tab chạy nền vẫn chính xác tuyệt đối.
 *   2. Đồng bộ hai chiều 100% giữa:
 *      - Cụm điều khiển Tab 5 (`#tab5-pomo-time-display`, `#btn-tab5-pomo-toggle`,
 *        `#btn-tab5-pomo-mode-switch`, `#btn-tab5-pomo-reset`, `#tab5-pomo-work-min`,
 *        `#tab5-pomo-break-min`, `#tab5-pomo-phase-badge`, `#tab5-pomo-sessions-count`,
 *        `#tab5-pomo-words-written`).
 *      - Thanh Pomodoro nổi góc dưới trái (`#s15-floating-pomodoro-pill`,
 *        `#floating-pomo-time`, `#btn-floating-pomo-toggle`, `#btn-floating-pomo-reset`,
 *        `#btn-floating-pomo-collapse`, `#floating-pomo-controls`).
 *      Bấm chạy/tạm dừng/đặt lại từ Tab 5 hay từ Thanh nổi đều kích hoạt cùng
 *      một phương thức và vẽ lại cả hai giao diện ngay lập tức trong cùng khung hình.
 *   3. Tính số từ thực viết trong phiên chạy nước rút, chuông thiền WebAudio dịu êm,
 *      4 chế độ nhịp viết chuyên sâu (25/5, 50/10, 15/3, 90/15), đồng bộ đa tab.
 * ============================================================================
 */
(function (global) {
  'use strict';

  const NS = (global.NoirStudio = global.NoirStudio || {});

  const POMODORO_HISTORY_KEY = 'noir_v38_pomodoro_sessions_history';
  const MAX_SESSION_HISTORY = 120;

  const POMODORO_CADENCE_PRESETS = Object.freeze([
    {
      id: 'classic_25_5',
      label: '🍅 Kinh điển (25p viết · 5p nghỉ)',
      workMinutes: 25,
      breakMinutes: 5,
      description: 'Cân bằng hoàn hảo giữa tốc độ gõ chữ và nhịp giữ sức bền mắt.'
    },
    {
      id: 'flash_sprint_15_3',
      label: '⚡ Nước rút phá bí (15p viết · 3p nghỉ)',
      workMinutes: 15,
      breakMinutes: 3,
      description: 'Tuyệt chiêu vượt qua "hội chứng trang trắng" — chỉ cần gõ liên tục 15 phút.'
    },
    {
      id: 'deep_flow_50_10',
      label: '🌊 Dòng chảy sâu (50p viết · 10p nghỉ)',
      workMinutes: 50,
      breakMinutes: 10,
      description: 'Dành cho phân cảnh tâm lý nặng hoặc đối thoại dài cần giữ mạch cảm xúc liền.'
    },
    {
      id: 'marathon_90_15',
      label: '🏔️ Marathon Chương Dài (90p viết · 15p nghỉ)',
      workMinutes: 90,
      breakMinutes: 15,
      description: 'Chu kỳ sinh học 90 phút để hoàn tất trọn vẹn một chương Light Novel 3.500+ từ.'
    }
  ]);

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
      NS.constants?.STORAGE_KEYS?.POMODORO_STATE ||
      'noir_unified_pomodoro_state_v36'
    );
  }

  function getTodayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function formatMmSs(totalSeconds) {
    const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
    const mins = Math.floor(safe / 60);
    const secs = safe % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  // ==========================================================================
  // LỚP 1: ÂM BÁO CHUÔNG THIỀN DỊU ÊM BẰNG WEB AUDIO API (KHÔNG CẦN MP3 NGOÀI)
  // ==========================================================================
  class PomodoroZenBellAudioSynth {
    constructor() {
      this.audioCtx = null;
      this.muted = false;
    }

    ensureContext() {
      if (typeof window === 'undefined') return null;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      if (!this.audioCtx) {
        try {
          this.audioCtx = new AudioCtx();
        } catch (_) {
          return null;
        }
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    }

    playGentleBell(type = 'WORK_DONE') {
      if (this.muted) return false;
      const ctx = this.ensureContext();
      if (!ctx) return false;

      try {
        const now = ctx.currentTime;
        const notes =
          type === 'WORK_DONE'
            ? [528, 660, 792] // Hợp âm trưởng ấm áp báo hiệu tới giờ nghỉ
            : [440, 554.37, 659.25]; // Hợp âm thanh thoát báo hiệu quay lại bàn viết

        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.14);

          gain.gain.setValueAtTime(0.0001, now + idx * 0.14);
          gain.gain.exponentialRampToValueAtTime(0.09, now + idx * 0.14 + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.14 + 0.85);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.14);
          osc.stop(now + idx * 0.14 + 0.9);
        });
        return true;
      } catch (_) {
        return false;
      }
    }

    playSoftClickFeedback() {
      if (this.muted) return;
      const ctx = this.ensureContext();
      if (!ctx) return;
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(620, now);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.07);
      } catch (_) {}
    }
  }

  // ==========================================================================
  // LỚP 2: SỔ NHẬT KÝ PHIÊN TẬP TRUNG & TỐC ĐỘ GÕ CHỮ (WPM SPRINT STATS)
  // ==========================================================================
  class PomodoroSessionVelocityLedger {
    constructor() {
      this.records = this.loadHistory();
    }

    loadHistory() {
      try {
        const raw = localStorage.getItem(POMODORO_HISTORY_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.slice(0, MAX_SESSION_HISTORY) : [];
      } catch (_) {
        return [];
      }
    }

    persistHistory() {
      try {
        localStorage.setItem(POMODORO_HISTORY_KEY, JSON.stringify(this.records));
      } catch (_) {}
    }

    getTotalProjectWordCountNow() {
      const chapters = NS.chapterManager?.chapters || NS.state?.chapters || [];
      const activeId =
        NS.chapterManager?.getActiveChapter?.()?.id || NS.state?.activeChapterId;
      const editorVal =
        document.getElementById('textarea-chapter-content')?.value;
      const utils = getUtils();

      if (Array.isArray(chapters) && chapters.length > 0) {
        let total = 0;
        for (const ch of chapters) {
          if (ch.id === activeId && typeof editorVal === 'string') {
            total += utils.countVietnameseWords(editorVal);
          } else {
            total += utils.countVietnameseWords(ch.content || '');
          }
        }
        return total;
      }

      if (typeof editorVal === 'string') {
        return utils.countVietnameseWords(editorVal);
      }
      return 0;
    }

    recordCompletedSprint({
      phase = 'WORK',
      durationMinutes = 25,
      wordsWritten = 0
    }) {
      const entry = {
        id: `pomo_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        dateKey: getTodayKey(),
        completedAt: Date.now(),
        phase,
        durationMinutes: Math.max(1, Number(durationMinutes || 25)),
        wordsWritten: Math.max(0, Number(wordsWritten || 0)),
        wordsPerMinute:
          durationMinutes > 0
            ? Math.round((Math.max(0, wordsWritten) / durationMinutes) * 10) / 10
            : 0
      };
      this.records.unshift(entry);
      if (this.records.length > MAX_SESSION_HISTORY) {
        this.records.length = MAX_SESSION_HISTORY;
      }
      this.persistHistory();
      return entry;
    }

    getTodayStats() {
      const today = getTodayKey();
      const todayWork = this.records.filter(
        (r) => r.dateKey === today && r.phase === 'WORK'
      );
      const totalMinutes = todayWork.reduce(
        (sum, r) => sum + (r.durationMinutes || 0),
        0
      );
      const totalWords = todayWork.reduce(
        (sum, r) => sum + (r.wordsWritten || 0),
        0
      );
      return {
        sessionsToday: todayWork.length,
        totalFocusMinutesToday: totalMinutes,
        totalSprintWordsToday: totalWords,
        avgWpmToday:
          totalMinutes > 0
            ? Math.round((totalWords / totalMinutes) * 10) / 10
            : 0,
        recentRuns: todayWork.slice(0, 6)
      };
    }
  }

  // ==========================================================================
  // LỚP 3: KHO TRẠNG THÁI DUY NHẤT (SINGLE SOURCE OF TRUTH) CHO POMODORO
  // ==========================================================================
  class UnifiedPomodoroStateStore {
    constructor() {
      this.state = this.createDefaultState();
    }

    createDefaultState() {
      const today = getTodayKey();
      return {
        phase: 'WORK', // 'WORK' | 'BREAK'
        isRunning: false,
        workMinutes: 25,
        breakMinutes: 5,
        remainingSeconds: 25 * 60,
        targetEndEpochMs: 0,
        lastTickAt: Date.now(),
        sessionDateKey: today,
        sessionsCompletedToday: 0,
        wordsAtSessionStart: 0,
        wordsWrittenThisSession: 0,
        isFloatingCollapsed: true,
        autoContinueNextPhase: false,
        soundEnabled: true,
        showInDocumentTitle: true
      };
    }

    normalizeLoadedState(raw) {
      const def = this.createDefaultState();
      if (!raw || typeof raw !== 'object') return def;

      const workMinutes = Math.max(
        1,
        Math.min(180, parseInt(raw.workMinutes, 10) || 25)
      );
      const breakMinutes = Math.max(
        1,
        Math.min(60, parseInt(raw.breakMinutes, 10) || 5)
      );
      const phase = raw.phase === 'BREAK' ? 'BREAK' : 'WORK';
      const defaultPhaseSecs = (phase === 'BREAK' ? breakMinutes : workMinutes) * 60;

      let remainingSeconds =
        typeof raw.remainingSeconds === 'number' && !Number.isNaN(raw.remainingSeconds)
          ? Math.max(0, Math.min(180 * 60, Math.round(raw.remainingSeconds)))
          : defaultPhaseSecs;

      let isRunning = Boolean(raw.isRunning);
      const targetEndEpochMs = Number(raw.targetEndEpochMs || 0);

      if (isRunning && targetEndEpochMs > 0) {
        const diffSec = Math.ceil((targetEndEpochMs - Date.now()) / 1000);
        if (diffSec > 0) {
          remainingSeconds = diffSec;
        } else {
          remainingSeconds = 0;
          isRunning = false;
        }
      }

      const today = getTodayKey();
      const sameDay = raw.sessionDateKey === today;

      return {
        phase,
        isRunning,
        workMinutes,
        breakMinutes,
        remainingSeconds,
        targetEndEpochMs: isRunning ? targetEndEpochMs : 0,
        lastTickAt: Date.now(),
        sessionDateKey: today,
        sessionsCompletedToday: sameDay
          ? Math.max(0, parseInt(raw.sessionsCompletedToday, 10) || 0)
          : 0,
        wordsAtSessionStart: Math.max(0, Number(raw.wordsAtSessionStart || 0)),
        wordsWrittenThisSession: sameDay
          ? Math.max(0, Number(raw.wordsWrittenThisSession || 0))
          : 0,
        isFloatingCollapsed:
          typeof raw.isFloatingCollapsed === 'boolean'
            ? raw.isFloatingCollapsed
            : true,
        autoContinueNextPhase: Boolean(raw.autoContinueNextPhase),
        soundEnabled: raw.soundEnabled !== false,
        showInDocumentTitle: raw.showInDocumentTitle !== false
      };
    }

    loadFromStorage() {
      try {
        const rawText = localStorage.getItem(getStorageKey());
        if (rawText) {
          this.state = this.normalizeLoadedState(JSON.parse(rawText));
          this.syncIntoCentralStudioState();
          return this.state;
        }
      } catch (_) {}
      this.state = this.createDefaultState();
      this.syncIntoCentralStudioState();
      return this.state;
    }

    saveToStorage() {
      this.state.lastTickAt = Date.now();
      try {
        localStorage.setItem(getStorageKey(), JSON.stringify(this.state));
      } catch (_) {}
      this.syncIntoCentralStudioState();
    }

    syncIntoCentralStudioState() {
      if (NS.state) {
        NS.state.pomodoro = {
          ...(NS.state.pomodoro || {}),
          mode: this.state.phase,
          isRunning: this.state.isRunning,
          remainingSeconds: this.state.remainingSeconds,
          workMinutes: this.state.workMinutes,
          breakMinutes: this.state.breakMinutes,
          completedSessions: this.state.sessionsCompletedToday,
          isFloatingCollapsed: this.state.isFloatingCollapsed
        };
      }
    }
  }

  // ==========================================================================
  // LỚP 4: TRÌNH VẼ ĐỒNG BỘ HAI CHIỀU (TAB 5 PANEL  <===>  THANH NỔI GÓC TRÁI)
  // ==========================================================================
  class DualViewPomodoroSynchronizer {
    constructor(engine) {
      this.engine = engine;
    }

    syncBothViews(state) {
      this.renderTab5Panel(state);
      this.renderFloatingPill(state);
      this.renderDocumentTitle(state);
      this.renderEnhancerWidgets(state);
    }

    renderTab5Panel(state) {
      const formatted = formatMmSs(state.remainingSeconds);
      const isWork = state.phase === 'WORK';

      const timeEl = document.getElementById('tab5-pomo-time-display');
      if (timeEl) {
        timeEl.textContent = formatted;
        timeEl.classList.remove(
          'text-emerald-400',
          'text-amber-400',
          'text-sky-400'
        );
        timeEl.classList.add(
          state.isRunning
            ? isWork
              ? 'text-emerald-400'
              : 'text-amber-400'
            : 'text-sky-400'
        );
      }

      const phaseBadge = document.getElementById('tab5-pomo-phase-badge');
      if (phaseBadge) {
        if (isWork) {
          phaseBadge.textContent = state.isRunning
            ? '🔥 Đang Viết Tập Trung'
            : '✍️ Phiên Tập Trung Viết';
          phaseBadge.className =
            'px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs';
        } else {
          phaseBadge.textContent = state.isRunning
            ? '☕ Đang Nghỉ Thư Giãn'
            : '☕ Giờ Nghỉ Ngơi Mắt';
          phaseBadge.className =
            'px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-xs';
        }
      }

      const toggleBtn = document.getElementById('btn-tab5-pomo-toggle');
      if (toggleBtn) {
        if (state.isRunning) {
          toggleBtn.textContent = '⏸ Tạm dừng';
          toggleBtn.setAttribute('data-pomo-running', 'true');
          toggleBtn.className =
            'px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow-lg transition';
        } else {
          toggleBtn.textContent = '▶ Bắt đầu';
          toggleBtn.setAttribute('data-pomo-running', 'false');
          toggleBtn.className =
            'px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition';
        }
      }

      const modeSwitchBtn = document.getElementById('btn-tab5-pomo-mode-switch');
      if (modeSwitchBtn) {
        modeSwitchBtn.textContent = isWork
          ? '☕ Chuyển sang Nghỉ'
          : '🔥 Chuyển sang Viết';
      }

      const workInput = document.getElementById('tab5-pomo-work-min');
      if (workInput && document.activeElement !== workInput) {
        workInput.value = String(state.workMinutes);
      }

      const breakInput = document.getElementById('tab5-pomo-break-min');
      if (breakInput && document.activeElement !== breakInput) {
        breakInput.value = String(state.breakMinutes);
      }

      const sessionsCountEl = document.getElementById('tab5-pomo-sessions-count');
      if (sessionsCountEl) {
        sessionsCountEl.textContent = String(state.sessionsCompletedToday || 0);
      }

      const wordsWrittenEl = document.getElementById('tab5-pomo-words-written');
      if (wordsWrittenEl) {
        wordsWrittenEl.textContent = Number(
          state.wordsWrittenThisSession || 0
        ).toLocaleString('vi-VN');
      }
    }

    renderFloatingPill(state) {
      const pill = document.getElementById('s15-floating-pomodoro-pill');
      const timeEl = document.getElementById('floating-pomo-time');
      const toggleBtn = document.getElementById('btn-floating-pomo-toggle');
      const controlsWrap = document.getElementById('floating-pomo-controls');
      const collapseBtn = document.getElementById('btn-floating-pomo-collapse');
      const formatted = formatMmSs(state.remainingSeconds);
      const isWork = state.phase === 'WORK';

      if (timeEl) {
        timeEl.textContent = formatted;
        timeEl.classList.remove(
          'text-emerald-400',
          'text-amber-400',
          'text-sky-400'
        );
        timeEl.classList.add(
          state.isRunning
            ? isWork
              ? 'text-emerald-400'
              : 'text-amber-400'
            : 'text-sky-400'
        );
      }

      if (toggleBtn) {
        if (state.isRunning) {
          toggleBtn.textContent = '⏸';
          toggleBtn.title = 'Tạm dừng đồng hồ Pomodoro (Đồng bộ với Tab 5)';
          toggleBtn.setAttribute('data-pomo-running', 'true');
          toggleBtn.className =
            'px-2 py-0.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px]';
        } else {
          toggleBtn.textContent = '▶';
          toggleBtn.title = 'Bắt đầu đồng hồ Pomodoro (Đồng bộ với Tab 5)';
          toggleBtn.setAttribute('data-pomo-running', 'false');
          toggleBtn.className =
            'px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]';
        }
      }

      if (controlsWrap) {
        if (state.isFloatingCollapsed) {
          controlsWrap.classList.add('hidden');
        } else {
          controlsWrap.classList.remove('hidden');
        }
      }

      if (collapseBtn) {
        collapseBtn.textContent = isWork ? '🍅' : '☕';
        collapseBtn.title = state.isFloatingCollapsed
          ? 'Mở rộng nút điều khiển Pomodoro'
          : 'Thu gọn thanh Pomodoro';
      }

      if (pill) {
        pill.setAttribute('data-pomo-phase', state.phase);
        pill.setAttribute(
          'data-pomo-running',
          state.isRunning ? 'true' : 'false'
        );
        pill.classList.remove(
          'border-emerald-400',
          'border-amber-500/40',
          'ring-2',
          'ring-emerald-500/35',
          'ring-amber-500/35'
        );
        if (state.isRunning) {
          pill.classList.add(
            isWork ? 'border-emerald-400' : 'border-amber-500/40',
            'ring-2',
            isWork ? 'ring-emerald-500/35' : 'ring-amber-500/35'
          );
        } else {
          pill.classList.add('border-amber-500/40');
        }
      }
    }

    renderDocumentTitle(state) {
      if (typeof document === 'undefined' || !state.showInDocumentTitle) return;
      if (!this.engine.baseDocumentTitle) {
        this.engine.baseDocumentTitle =
          document.title.replace(/^\[[^\]]+\]\s*/, '') ||
          'Web viết tiểu thuyết của Bi';
      }
      if (state.isRunning) {
        const icon = state.phase === 'WORK' ? '🍅' : '☕';
        document.title = `[${icon} ${formatMmSs(state.remainingSeconds)}] ${this.engine.baseDocumentTitle}`;
      } else {
        document.title = this.engine.baseDocumentTitle;
      }
    }

    renderEnhancerWidgets(state) {
      const box = document.getElementById('tab5-pomo-extra-enhancer');
      if (!box) return;

      const totalPhaseSeconds =
        (state.phase === 'BREAK' ? state.breakMinutes : state.workMinutes) * 60;
      const pctDone =
        totalPhaseSeconds > 0
          ? Math.min(
              100,
              Math.max(
                0,
                Math.round(
                  ((totalPhaseSeconds - state.remainingSeconds) /
                    totalPhaseSeconds) *
                    100
                )
              )
            )
          : 0;

      const progressFill = document.getElementById('tab5-pomo-progress-fill');
      const progressPctText = document.getElementById('tab5-pomo-progress-pct');
      if (progressFill) {
        progressFill.style.width = `${pctDone}%`;
      }
      if (progressPctText) {
        progressPctText.textContent = `${pctDone}%`;
      }

      const todayStats = this.engine.ledger.getTodayStats();
      const summaryEl = document.getElementById('tab5-pomo-today-summary');
      if (summaryEl) {
        summaryEl.innerHTML = [
          `<span>Hôm nay: <strong class="text-amber-300">${todayStats.sessionsToday}</strong> phiên (${todayStats.totalFocusMinutesToday} phút tập trung)</span>`,
          `<span>Tốc độ TB: <strong class="text-emerald-300">${todayStats.avgWpmToday} từ/phút</strong></span>`
        ].join(' · ');
      }
    }
  }

  // ==========================================================================
  // LỚP 5: THANH TIỆN ÍCH MỞ RỘNG TRONG TAB 5 (CHỌN NHỊP NHANH, CHUÔNG & TIẾN ĐỘ)
  // ==========================================================================
  class Tab5PomodoroPanelEnhancer {
    constructor(engine) {
      this.engine = engine;
    }

    ensureExtraPanelMounted() {
      const box = document.getElementById('s14-panel-pomodoro-box');
      if (!box) return false;
      if (document.getElementById('tab5-pomo-extra-enhancer')) return true;

      const esc = getUtils().escapeHtml;
      const st = this.engine.store.state;

      const wrap = document.createElement('div');
      wrap.id = 'tab5-pomo-extra-enhancer';
      wrap.className =
        'pt-3 border-t border-amber-500/20 space-y-3 text-[11px]';
      wrap.innerHTML = [
        '<div class="space-y-1">',
        '  <div class="flex items-center justify-between text-[10px] font-bold text-zinc-400">',
        '    <span>Tiến độ phiên hiện tại (Đồng bộ 2 chiều với Thanh nổi 🍅)</span>',
        '    <span id="tab5-pomo-progress-pct" class="font-monoCode text-emerald-400">0%</span>',
        '  </div>',
        '  <div class="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">',
        '    <div id="tab5-pomo-progress-fill" class="h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-300" style="width: 0%;"></div>',
        '  </div>',
        '</div>',
        '<div class="flex flex-wrap items-center justify-between gap-2">',
        '  <div class="flex flex-wrap gap-1.5">',
        ...POMODORO_CADENCE_PRESETS.map(
          (p) =>
            `<button type="button" data-pomo-preset="${esc(p.id)}" title="${esc(p.description)}" class="px-2.5 py-1 rounded-lg border border-amber-500/35 bg-zinc-900 hover:bg-amber-500/20 text-amber-200 font-semibold transition">${esc(p.label)}</button>`
        ),
        '  </div>',
        '  <div class="flex items-center gap-2">',
        `    <label class="inline-flex items-center gap-1.5 cursor-pointer text-zinc-300"><input id="chk-pomo-sound-bell" type="checkbox" class="accent-emerald-500" ${st.soundEnabled ? 'checked' : ''} /> 🔔 Chuông thiền báo hết giờ</label>`,
        `    <label class="inline-flex items-center gap-1.5 cursor-pointer text-zinc-300"><input id="chk-pomo-auto-next" type="checkbox" class="accent-amber-500" ${st.autoContinueNextPhase ? 'checked' : ''} /> 🔁 Tự chuyển phiên</label>`,
        '  </div>',
        '</div>',
        '<div id="tab5-pomo-today-summary" class="text-[11px] text-zinc-400 flex flex-wrap gap-3"></div>'
      ].join('\n');

      box.appendChild(wrap);
      this.bindEnhancerEvents();
      return true;
    }

    bindEnhancerEvents() {
      const bindOnce =
        typeof NS.bindOnce === 'function'
          ? NS.bindOnce.bind(NS)
          : (el, ev, fn) => {
              const t = typeof el === 'string' ? document.getElementById(el) : el;
              if (t) t.addEventListener(ev, fn);
            };

      bindOnce(
        'tab5-pomo-extra-enhancer',
        'click',
        (ev) => {
          const btn = ev.target.closest('[data-pomo-preset]');
          if (!btn) return;
          const pid = btn.getAttribute('data-pomo-preset');
          const preset = POMODORO_CADENCE_PRESETS.find((x) => x.id === pid);
          if (!preset) return;
          this.engine.applyCadencePreset(preset.workMinutes, preset.breakMinutes);
          getUtils().showToast(`⏱️ Đã chọn nhịp ${preset.label}`, 'success', 2400);
        },
        'mod20_preset_click'
      );

      bindOnce(
        'chk-pomo-sound-bell',
        'change',
        (ev) => {
          const checked = Boolean(ev.target?.checked);
          this.engine.store.state.soundEnabled = checked;
          this.engine.bellSynth.muted = !checked;
          this.engine.store.saveToStorage();
        },
        'mod20_sound_toggle'
      );

      bindOnce(
        'chk-pomo-auto-next',
        'change',
        (ev) => {
          this.engine.store.state.autoContinueNextPhase = Boolean(
            ev.target?.checked
          );
          this.engine.store.saveToStorage();
        },
        'mod20_autonext_toggle'
      );
    }
  }

  // ==========================================================================
  // LỚP 6: ĐỘNG CƠ ĐỒNG HỒ POMODORO ĐỒNG BỘ HAI CHIỀU (`NoirStudio.pomodoro`)
  // ==========================================================================
  class BidirectionalPomodoroSyncEngine {
    constructor() {
      this.store = new UnifiedPomodoroStateStore();
      this.syncRenderer = new DualViewPomodoroSynchronizer(this);
      this.bellSynth = new PomodoroZenBellAudioSynth();
      this.ledger = new PomodoroSessionVelocityLedger();
      this.enhancer = new Tab5PomodoroPanelEnhancer(this);
      this.intervalHandle = null;
      this.baseDocumentTitle = '';
      this.hasInitialized = false;
    }

    get state() {
      return this.store.state;
    }

    init() {
      this.loadStateFromStorage();
      this.enhancer.ensureExtraPanelMounted();
      this.bindDOM();
      this.syncAllViews();

      if (this.store.state.isRunning) {
        this.ensureTickerRunning();
      }
      this.hasInitialized = true;
      return this;
    }

    /**
     * Được gọi khi khởi động và bởi `mod04` khi có thay đổi từ tab trình duyệt khác.
     */
    loadStateFromStorage() {
      const loaded = this.store.loadFromStorage();
      this.bellSynth.muted = !loaded.soundEnabled;

      if (loaded.isRunning) {
        this.ensureTickerRunning();
      } else {
        this.stopTickerOnly();
      }

      if (this.hasInitialized) {
        this.syncAllViews();
      }
      return loaded;
    }

    syncAllViews() {
      this.refreshWordsWrittenInCurrentSprint();
      this.syncRenderer.syncBothViews(this.store.state);
    }

    refreshWordsWrittenInCurrentSprint() {
      const st = this.store.state;
      if (st.phase === 'WORK' && st.wordsAtSessionStart > 0) {
        const curWords = this.ledger.getTotalProjectWordCountNow();
        if (curWords >= st.wordsAtSessionStart) {
          st.wordsWrittenThisSession = curWords - st.wordsAtSessionStart;
        }
      }
      return st.wordsWrittenThisSession;
    }

    ensureTickerRunning() {
      if (this.intervalHandle) return;
      this.intervalHandle = setInterval(() => this.onTick(), 1000);
    }

    stopTickerOnly() {
      if (this.intervalHandle) {
        clearInterval(this.intervalHandle);
        this.intervalHandle = null;
      }
    }

    startTimer(sourceTag = 'UNIFIED') {
      const st = this.store.state;
      if (st.remainingSeconds <= 0) {
        st.remainingSeconds =
          (st.phase === 'BREAK' ? st.breakMinutes : st.workMinutes) * 60;
      }

      if (st.phase === 'WORK' && st.wordsAtSessionStart === 0) {
        st.wordsAtSessionStart = this.ledger.getTotalProjectWordCountNow();
      }

      st.isRunning = true;
      st.targetEndEpochMs = Date.now() + st.remainingSeconds * 1000;
      this.store.saveToStorage();
      this.ensureTickerRunning();
      this.bellSynth.playSoftClickFeedback();
      this.syncAllViews();

      if (NS.bus && typeof NS.bus.emit === 'function') {
        NS.bus.emit(
          NS.constants?.EVENTS?.POMODORO_STARTED || 'pomodoro:started',
          {
            phase: st.phase,
            remainingSeconds: st.remainingSeconds,
            source: sourceTag
          }
        );
      }

      return true;
    }

    pauseTimer(sourceTag = 'UNIFIED') {
      const st = this.store.state;
      if (st.isRunning && st.targetEndEpochMs > 0) {
        st.remainingSeconds = Math.max(
          0,
          Math.ceil((st.targetEndEpochMs - Date.now()) / 1000)
        );
      }
      st.isRunning = false;
      st.targetEndEpochMs = 0;
      this.stopTickerOnly();
      this.store.saveToStorage();
      this.bellSynth.playSoftClickFeedback();
      this.syncAllViews();

      if (NS.bus && typeof NS.bus.emit === 'function') {
        NS.bus.emit(
          NS.constants?.EVENTS?.POMODORO_PAUSED || 'pomodoro:paused',
          {
            phase: st.phase,
            remainingSeconds: st.remainingSeconds,
            source: sourceTag
          }
        );
      }

      return true;
    }

    toggleStartPause(sourceTag = 'UNIFIED') {
      if (this.store.state.isRunning) {
        this.pauseTimer(sourceTag);
        return false;
      }
      this.startTimer(sourceTag);
      return true;
    }

    resetTimer(sourceTag = 'UNIFIED') {
      const st = this.store.state;
      st.isRunning = false;
      st.targetEndEpochMs = 0;
      this.stopTickerOnly();
      st.remainingSeconds =
        (st.phase === 'BREAK' ? st.breakMinutes : st.workMinutes) * 60;
      st.wordsAtSessionStart =
        st.phase === 'WORK' ? this.ledger.getTotalProjectWordCountNow() : 0;
      st.wordsWrittenThisSession = 0;
      this.store.saveToStorage();
      this.syncAllViews();

      if (NS.bus && typeof NS.bus.emit === 'function') {
        NS.bus.emit(
          NS.constants?.EVENTS?.POMODORO_RESET || 'pomodoro:reset',
          {
            phase: st.phase,
            remainingSeconds: st.remainingSeconds,
            source: sourceTag
          }
        );
      }
    }

    switchPhase(explicitPhase = null) {
      const st = this.store.state;
      st.isRunning = false;
      st.targetEndEpochMs = 0;
      this.stopTickerOnly();

      const nextPhase =
        explicitPhase === 'WORK' || explicitPhase === 'BREAK'
          ? explicitPhase
          : st.phase === 'WORK'
            ? 'BREAK'
            : 'WORK';

      st.phase = nextPhase;
      st.remainingSeconds =
        (nextPhase === 'BREAK' ? st.breakMinutes : st.workMinutes) * 60;
      st.wordsAtSessionStart =
        nextPhase === 'WORK' ? this.ledger.getTotalProjectWordCountNow() : 0;
      if (nextPhase === 'WORK') st.wordsWrittenThisSession = 0;

      this.store.saveToStorage();
      this.syncAllViews();

      if (NS.bus && typeof NS.bus.emit === 'function') {
        NS.bus.emit(
          NS.constants?.EVENTS?.POMODORO_PHASE_CHANGED || 'pomodoro:phase_changed',
          { phase: nextPhase, remainingSeconds: st.remainingSeconds }
        );
      }
      return nextPhase;
    }

    applyCadencePreset(workMins, breakMins) {
      const st = this.store.state;
      const safeWork = Math.max(1, Math.min(180, parseInt(workMins, 10) || 25));
      const safeBreak = Math.max(1, Math.min(60, parseInt(breakMins, 10) || 5));

      st.workMinutes = safeWork;
      st.breakMinutes = safeBreak;
      if (!st.isRunning) {
        st.remainingSeconds =
          (st.phase === 'BREAK' ? safeBreak : safeWork) * 60;
      }
      this.store.saveToStorage();
      this.syncAllViews();
    }

    updateDurationsFromInputs() {
      const workEl = document.getElementById('tab5-pomo-work-min');
      const breakEl = document.getElementById('tab5-pomo-break-min');
      const wVal = workEl ? parseInt(workEl.value, 10) : this.store.state.workMinutes;
      const bVal = breakEl
        ? parseInt(breakEl.value, 10)
        : this.store.state.breakMinutes;

      this.applyCadencePreset(wVal, bVal);
    }

    toggleFloatingCollapsed() {
      this.store.state.isFloatingCollapsed = !this.store.state.isFloatingCollapsed;
      this.store.saveToStorage();
      this.syncAllViews();
    }

    onTick() {
      const st = this.store.state;
      if (!st.isRunning) {
        this.stopTickerOnly();
        return;
      }

      const now = Date.now();
      const remaining =
        st.targetEndEpochMs > 0
          ? Math.max(0, Math.ceil((st.targetEndEpochMs - now) / 1000))
          : Math.max(0, st.remainingSeconds - 1);

      st.remainingSeconds = remaining;

      if (remaining > 0) {
        this.store.saveToStorage();
        this.syncAllViews();
        if (NS.bus && typeof NS.bus.emit === 'function') {
          NS.bus.emit(
            NS.constants?.EVENTS?.POMODORO_TICK || 'pomodoro:tick',
            { phase: st.phase, remainingSeconds: remaining }
          );
        }
        return;
      }

      // Đã chạm 00:00 -> Hoàn thành phiên!
      this.handlePhaseCompleted();
    }

    handlePhaseCompleted() {
      const st = this.store.state;
      const completedPhase = st.phase;
      st.isRunning = false;
      st.targetEndEpochMs = 0;
      this.stopTickerOnly();

      this.refreshWordsWrittenInCurrentSprint();

      if (completedPhase === 'WORK') {
        st.sessionsCompletedToday = (st.sessionsCompletedToday || 0) + 1;
        this.ledger.recordCompletedSprint({
          phase: 'WORK',
          durationMinutes: st.workMinutes,
          wordsWritten: st.wordsWrittenThisSession
        });
        this.bellSynth.playGentleBell('WORK_DONE');
        getUtils().showToast(
          `🎉 Tuyệt vời! Bạn đã hoàn tất phiên viết ${st.workMinutes} phút (+${st.wordsWrittenThisSession} từ). Hãy đứng dậy thư giãn mắt ${st.breakMinutes} phút nhé!`,
          'success',
          5500
        );
        st.phase = 'BREAK';
        st.remainingSeconds = st.breakMinutes * 60;
      } else {
        this.bellSynth.playGentleBell('BREAK_DONE');
        getUtils().showToast(
          `☕ Hết giờ nghỉ thư giãn! Sẵn sàng quay lại bàn viết với nguồn năng lượng mới chưa nào?`,
          'info',
          4800
        );
        st.phase = 'WORK';
        st.remainingSeconds = st.workMinutes * 60;
        st.wordsAtSessionStart = this.ledger.getTotalProjectWordCountNow();
        st.wordsWrittenThisSession = 0;
      }

      this.store.saveToStorage();
      this.syncAllViews();

      if (st.autoContinueNextPhase) {
        setTimeout(() => this.startTimer('AUTO_CONTINUE'), 400);
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

      // ======================================================================
      // LIÊN KẾT TAB 5 — ĐẢM BẢO BẤM TỪ TAB 5 CŨNG CẬP NHẬT THANH NỔI NGAY LẬP TỨC
      // ======================================================================
      bindOnce(
        'btn-tab5-pomo-toggle',
        'click',
        () => this.toggleStartPause('TAB5_BUTTON'),
        'mod20_tab5_toggle'
      );

      bindOnce(
        'btn-tab5-pomo-reset',
        'click',
        () => this.resetTimer('TAB5_BUTTON'),
        'mod20_tab5_reset'
      );

      bindOnce(
        'btn-tab5-pomo-mode-switch',
        'click',
        () => this.switchPhase(),
        'mod20_tab5_phase_switch'
      );

      bindOnce(
        'tab5-pomo-work-min',
        'change',
        () => this.updateDurationsFromInputs(),
        'mod20_tab5_work_min_change'
      );

      bindOnce(
        'tab5-pomo-break-min',
        'change',
        () => this.updateDurationsFromInputs(),
        'mod20_tab5_break_min_change'
      );

      // ======================================================================
      // LIÊN KẾT THANH NỔI (#s15-floating-pomodoro-pill) — CÙNG 1 NGUỒN SỰ THẬT
      // ======================================================================
      bindOnce(
        'btn-floating-pomo-toggle',
        'click',
        () => this.toggleStartPause('FLOATING_PILL'),
        'mod20_float_toggle'
      );

      bindOnce(
        'btn-floating-pomo-reset',
        'click',
        () => this.resetTimer('FLOATING_PILL'),
        'mod20_float_reset'
      );

      bindOnce(
        'btn-floating-pomo-collapse',
        'click',
        () => this.toggleFloatingCollapsed(),
        'mod20_float_collapse'
      );

      // Bấm đúp vào đồng hồ trên thanh nổi -> nhảy nhanh tới Tab 5 xem chi tiết
      bindOnce(
        'floating-pomo-time',
        'dblclick',
        () => {
          if (NS.navigator && typeof NS.navigator.navigateToScreen === 'function') {
            NS.navigator.navigateToScreen('SCREEN_5_AMBIENCE');
          }
        },
        'mod20_float_dblclick_nav'
      );

      // Cập nhật số từ viết được trong phiên khi tác giả gõ chữ ở Tab 1
      bindOnce(
        'textarea-chapter-content',
        'input',
        () => {
          if (this.store.state.isRunning && this.store.state.phase === 'WORK') {
            this.refreshWordsWrittenInCurrentSprint();
            const wEl = document.getElementById('tab5-pomo-words-written');
            if (wEl) {
              wEl.textContent = Number(
                this.store.state.wordsWrittenThisSession || 0
              ).toLocaleString('vi-VN');
            }
          }
        },
        'mod20_editor_sprint_word_track'
      );

      // Đồng bộ lại ngay khi chuyển Tab trình duyệt quay lại (tránh browser throttle)
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible' && this.store.state.isRunning) {
            this.onTick();
          }
        });
      }
    }

    getHealthReport() {
      return {
        module: 'mod20_bidirectional_pomodoro_sync_engine.js',
        initialized: this.hasInitialized,
        phase: this.store.state.phase,
        isRunning: this.store.state.isRunning,
        remainingSeconds: this.store.state.remainingSeconds,
        formattedTime: formatMmSs(this.store.state.remainingSeconds),
        sessionsCompletedToday: this.store.state.sessionsCompletedToday,
        todayStats: this.ledger.getTodayStats()
      };
    }
  }

  // ==========================================================================
  // LỚP 7: PHÂN TÍCH CHUỖI NGÀY TẬP TRUNG, BIỂU ĐỒ NĂNG SUẤT & NHẮC NHỞ SỨC KHỎE MẮT
  // ==========================================================================
  class PomodoroFocusStreakAndWellnessCoach {
    constructor(engine) {
      this.engine = engine;
    }

    computeDailyFocusStreakDays() {
      const records = this.engine.ledger.records || [];
      if (records.length === 0) return 0;

      const uniqueDates = new Set(
        records.filter((r) => r.phase === 'WORK').map((r) => r.dateKey)
      );
      if (uniqueDates.size === 0) return 0;

      let streak = 0;
      const cursor = new Date();
      while (true) {
        const key = cursor.toISOString().slice(0, 10);
        if (uniqueDates.has(key)) {
          streak += 1;
          cursor.setDate(cursor.getDate() - 1);
        } else if (streak === 0) {
          // Cho phép kiểm tra hôm qua nếu hôm nay tác giả chưa kết thúc phiên đầu tiên
          cursor.setDate(cursor.getDate() - 1);
          const yesterdayKey = cursor.toISOString().slice(0, 10);
          if (uniqueDates.has(yesterdayKey)) {
            streak += 1;
            cursor.setDate(cursor.getDate() - 1);
          } else {
            break;
          }
        } else {
          break;
        }
        if (streak > 365) break;
      }
      return streak;
    }

    buildWeeklyVelocityBreakdown() {
      const records = this.engine.ledger.records || [];
      const days = [];
      for (let offset = 6; offset >= 0; offset -= 1) {
        const d = new Date();
        d.setDate(d.getDate() - offset);
        const key = d.toISOString().slice(0, 10);
        const dayWork = records.filter(
          (r) => r.dateKey === key && r.phase === 'WORK'
        );
        const mins = dayWork.reduce((s, r) => s + (r.durationMinutes || 0), 0);
        const words = dayWork.reduce((s, r) => s + (r.wordsWritten || 0), 0);
        days.push({
          dateKey: key,
          shortDay: d.toLocaleDateString('vi-VN', { weekday: 'short' }),
          sessions: dayWork.length,
          minutes: mins,
          words
        });
      }
      return days;
    }

    getEyeRestWellnessTip() {
      const tips = [
        'Hãy áp dụng quy tắc 20-20-20: nhìn ra xa tối thiểu 6 mét trong 20 giây để cơ mắt nhả điều tiết.',
        'Uống một ngụm nước ấm và xoay nhẹ khớp cổ vai gáy trước khi quay lại cảnh cao trào kế tiếp.',
        'Đứng dậy vươn vai 30 giây — máu lưu thông tốt giúp câu thoại nhân vật sắc bén hơn hẳn.',
        'Thử nhắm mắt hít sâu 4 nhịp, hình dung khung cảnh tiếp theo bằng mùi vị và âm thanh trước khi gõ chữ.'
      ];
      const idx =
        (this.engine.store.state.sessionsCompletedToday || 0) % tips.length;
      return tips[idx];
    }

    renderSprintHistoryWidgetInsideTab5() {
      const extraWrap = document.getElementById('tab5-pomo-extra-enhancer');
      if (!extraWrap) return;

      let historyBox = document.getElementById('tab5-pomo-sprint-history-box');
      if (!historyBox) {
        historyBox = document.createElement('div');
        historyBox.id = 'tab5-pomo-sprint-history-box';
        historyBox.className = 'pt-2 border-t border-zinc-800 space-y-2';
        extraWrap.appendChild(historyBox);
      }

      const streak = this.computeDailyFocusStreakDays();
      const weekly = this.buildWeeklyVelocityBreakdown();
      const recentRuns = this.engine.ledger.getTodayStats().recentRuns;
      const esc = getUtils().escapeHtml;
      const maxWordsDay = Math.max(200, ...weekly.map((w) => w.words));

      historyBox.innerHTML = [
        '<div class="flex flex-wrap items-center justify-between gap-2">',
        `  <span class="font-bold text-amber-300 uppercase text-[10px]">🔥 Chuỗi ngày tập trung: ${streak} ngày liên tiếp</span>`,
        `  <span class="text-[10px] text-zinc-400 italic">${esc(this.getEyeRestWellnessTip())}</span>`,
        '</div>',
        '<div class="grid grid-cols-7 gap-1 pt-1">',
        ...weekly.map((day) => {
          const pct = Math.max(8, Math.round((day.words / maxWordsDay) * 100));
          return [
            `<div class="p-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-center space-y-1" title="${esc(day.dateKey)}: ${day.sessions} phiên · ${day.words} từ">`,
            `  <div class="h-8 flex items-end justify-center"><div class="w-full max-w-[16px] rounded-t bg-gradient-to-t from-emerald-600 to-amber-400" style="height: ${pct}%;"></div></div>`,
            `  <div class="text-[9px] text-zinc-400 font-bold">${esc(day.shortDay)}</div>`,
            `  <div class="text-[9px] font-monoCode text-emerald-300">${day.sessions}p</div>`,
            '</div>'
          ].join('');
        }),
        '</div>',
        recentRuns.length > 0
          ? `<div class="flex flex-wrap gap-1.5 pt-1">${recentRuns
              .map(
                (r) =>
                  `<span class="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-monoCode text-zinc-300">✅ ${r.durationMinutes}p · +${r.wordsWritten} từ (${r.wordsPerMinute} wpm)</span>`
              )
              .join('')}</div>`
          : ''
      ].join('\n');
    }
  }

  // ==========================================================================
  // LỚP 8: HƯỚNG DẪN NGHỈ NGƠI VI MÔ, WAKE LOCK DI ĐỘNG & ĐƯỜNG CONG TỐC ĐỘ VIẾT
  // ==========================================================================
  const MICRO_BREAK_EXERCISES = Object.freeze([
    {
      id: 'breath_478',
      title: '🌬️ Nhịp Thở 4-4-6 Giảm Căng Thẳng Vai Gáy',
      durationSec: 45,
      steps: [
        'Hít vào chậm bằng mũi trong 4 giây, thả lỏng hai cầu vai.',
        'Giữ nhẹ hơi thở 4 giây, nhắm hờ mắt tách khỏi ánh sáng màn hình.',
        'Thở ra êm ái qua miệng trong 6 giây — hình dung nhịp cảm xúc cảnh tiếp theo.'
      ]
    },
    {
      id: 'eye_palming',
      title: '👀 Thư Giãn Nhãn Cầu (Quy Tắc 20-20-20)',
      durationSec: 30,
      steps: [
        'Xoa nhẹ hai lòng bàn tay vào nhau 5 giây cho ấm lên.',
        'Áp khum lòng bàn tay lên hốc mắt (không ấn vào nhãn cầu) 15 giây.',
        'Mở mắt nhìn ra một vật thể ở xa ngoài cửa sổ hoặc góc phòng xa nhất.'
      ]
    },
    {
      id: 'wrist_neck_release',
      title: '🙌 Duỗi Cổ Tay & Ngón Tay Dân Gõ Phím',
      durationSec: 40,
      steps: [
        'Duỗi thẳng tay phải ra trước, dùng tay trái kéo nhẹ các đầu ngón về phía thân 10 giây.',
        'Đổi bên tay trái trong 10 giây tiếp theo.',
        'Xoay tròn cổ tay 5 vòng theo chiều kim đồng hồ và 5 vòng ngược lại.'
      ]
    }
  ]);

  class PomodoroSprintCurveAndMobileWakeLock {
    constructor(engine) {
      this.engine = engine;
      this.wakeLockSentinel = null;
      this.wakeLockWanted = false;
      this.sprintCheckpoints = [];
      this.lastCheckpointMinute = -1;
    }

    async setMobileScreenWakeLock(enabled) {
      this.wakeLockWanted = Boolean(enabled);
      if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
        return { supported: false, active: false };
      }

      try {
        if (enabled && !this.wakeLockSentinel) {
          this.wakeLockSentinel = await navigator.wakeLock.request('screen');
          this.wakeLockSentinel.addEventListener('release', () => {
            this.wakeLockSentinel = null;
          });
          return { supported: true, active: true };
        }
        if (!enabled && this.wakeLockSentinel) {
          await this.wakeLockSentinel.release();
          this.wakeLockSentinel = null;
        }
        return { supported: true, active: Boolean(this.wakeLockSentinel) };
      } catch (_) {
        return { supported: true, active: false };
      }
    }

    capturePeriodicSprintCheckpoint(state) {
      if (!state.isRunning || state.phase !== 'WORK') {
        this.lastCheckpointMinute = -1;
        return;
      }

      const elapsedSec = Math.max(
        0,
        state.workMinutes * 60 - state.remainingSeconds
      );
      const bucketMinute = Math.floor(elapsedSec / 60);
      if (bucketMinute > 0 && bucketMinute % 5 === 0 && bucketMinute !== this.lastCheckpointMinute) {
        this.lastCheckpointMinute = bucketMinute;
        this.sprintCheckpoints.push({
          timestamp: Date.now(),
          elapsedMinutes: bucketMinute,
          wordsWritten: Number(state.wordsWrittenThisSession || 0)
        });
        if (this.sprintCheckpoints.length > 36) {
          this.sprintCheckpoints.shift();
        }
      }
    }

    async requestBrowserNotificationPermissionAndNotify(title, body) {
      if (typeof Notification === 'undefined') return false;
      try {
        if (Notification.permission === 'granted') {
          new Notification(title, { body, tag: 'noir-pomodoro-alert' });
          return true;
        }
      } catch (_) {}
      return false;
    }

    renderBreakWellnessCardAndWakeLockControl() {
      const historyBox = document.getElementById('tab5-pomo-sprint-history-box');
      if (!historyBox || !historyBox.parentElement) return;

      let coachBox = document.getElementById('tab5-pomo-microbreak-coach-box');
      if (!coachBox) {
        coachBox = document.createElement('div');
        coachBox.id = 'tab5-pomo-microbreak-coach-box';
        coachBox.className =
          'p-3 rounded-xl border border-teal-500/30 bg-teal-950/25 space-y-2 text-[11px]';
        historyBox.parentElement.appendChild(coachBox);
      }

      const st = this.engine.store.state;
      const exerciseIdx =
        (st.sessionsCompletedToday || 0) % MICRO_BREAK_EXERCISES.length;
      const ex = MICRO_BREAK_EXERCISES[exerciseIdx];
      const esc = getUtils().escapeHtml;
      const wakeSupported =
        typeof navigator !== 'undefined' && 'wakeLock' in navigator;

      coachBox.innerHTML = [
        '<div class="flex flex-wrap items-center justify-between gap-2">',
        `  <span class="font-extrabold text-teal-300">${
          st.phase === 'BREAK'
            ? `☕ Giờ Nghỉ Đang Chạy — ${esc(ex.title)}`
            : `🧘 Gợi Ý Thư Giãn Sau Phiên Viết — ${esc(ex.title)}`
        }</span>`,
        wakeSupported
          ? `<label class="inline-flex items-center gap-1.5 cursor-pointer text-[10px] text-zinc-300"><input id="chk-pomo-mobile-wakelock" type="checkbox" class="accent-teal-400" ${
              this.wakeLockWanted ? 'checked' : ''
            } /> 📱 Giữ sáng màn hình điện thoại khi đếm</label>`
          : '',
        '</div>',
        `<ul class="space-y-0.5 text-[10px] text-zinc-300 list-disc list-inside">${ex.steps
          .map((s) => `<li>${esc(s)}</li>`)
          .join('')}</ul>`,
        '<div class="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-teal-500/20 text-[10px] text-zinc-400">',
        `  <span>Mốc ghi nhận 5 phút gần nhất: <strong class="text-emerald-300">${
          this.sprintCheckpoints.length > 0
            ? `Phút ${this.sprintCheckpoints[this.sprintCheckpoints.length - 1].elapsedMinutes}: +${this.sprintCheckpoints[this.sprintCheckpoints.length - 1].wordsWritten} từ`
            : 'Chưa phát sinh mốc 5 phút trong phiên hiện tại'
        }</strong></span>`,
        '  <div class="flex items-center gap-1.5">',
        '    <button type="button" id="btn-pomo-add-5min" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-emerald-300 font-bold">+5 phút</button>',
        '    <button type="button" id="btn-pomo-test-bell" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-bold">🔔 Thử chuông</button>',
        '  </div>',
        '</div>'
      ].join('\n');

      const bindOnce =
        typeof NS.bindOnce === 'function'
          ? NS.bindOnce.bind(NS)
          : (el, ev, fn) => {
              const t = typeof el === 'string' ? document.getElementById(el) : el;
              if (t) t.addEventListener(ev, fn);
            };

      bindOnce(
        'chk-pomo-mobile-wakelock',
        'change',
        async (ev) => {
          const want = Boolean(ev.target?.checked);
          const res = await this.setMobileScreenWakeLock(want);
          getUtils().showToast(
            want
              ? res.active
                ? '📱 Đã bật giữ sáng màn hình khi đồng hồ Pomodoro chạy.'
                : '📱 Trình duyệt hiện chưa cấp quyền giữ sáng màn hình ở tab này.'
              : 'Đã tắt giữ sáng màn hình tự động.',
            'info',
            2200
          );
        },
        'mod20_wakelock_toggle'
      );

      bindOnce(
        'btn-pomo-add-5min',
        'click',
        () => {
          this.engine.addExtraSeconds(300);
          getUtils().showToast('⏱️ Đã cộng thêm +5 phút vào đồng hồ hiện tại!', 'info', 2000);
        },
        'mod20_add_5min_btn'
      );

      bindOnce(
        'btn-pomo-test-bell',
        'click',
        () => {
          this.engine.bellSynth.playGentleBell(st.phase === 'WORK' ? 'WORK_DONE' : 'BREAK_DONE');
          getUtils().showToast('🔔 Đã phát thử âm chuông thiền Pomodoro!', 'info', 1800);
        },
        'mod20_test_bell_btn'
      );
    }

    formatProductivityExportText() {
      const stats = this.engine.ledger.getTodayStats();
      const streak = this.engine.wellnessCoach.computeDailyFocusStreakDays();
      const weekly = this.engine.wellnessCoach.buildWeeklyVelocityBreakdown();
      const lines = [
        '=== THỐNG KÊ TẬP TRUNG POMODORO & TỐC ĐỘ SÁNG TÁC ===',
        `- Chuỗi ngày viết tập trung liên tiếp: ${streak} ngày`,
        `- Hôm nay: ${stats.sessionsToday} phiên · ${stats.totalFocusMinutesToday} phút · +${stats.totalSprintWordsToday} từ (${stats.avgWpmToday} từ/phút)`,
        '',
        '7 ngày gần nhất:',
        ...weekly.map(
          (d) => `  • ${d.dateKey} (${d.shortDay}): ${d.sessions} phiên (${d.minutes} phút, +${d.words} từ)`
        )
      ];
      return lines.join('\n');
    }
  }

  BidirectionalPomodoroSyncEngine.prototype.addExtraSeconds = function (
    extraSecs = 300
  ) {
    const st = this.store.state;
    st.remainingSeconds = Math.min(
      180 * 60,
      Math.max(0, (st.remainingSeconds || 0) + Number(extraSecs || 0))
    );
    if (st.isRunning) {
      st.targetEndEpochMs = Date.now() + st.remainingSeconds * 1000;
    }
    this.store.saveToStorage();
    this.syncAllViews();
    return st.remainingSeconds;
  };

  // ==========================================================================
  // LỚP 9: HUY HIỆU THÀNH TÍCH TẬP TRUNG, ĐỒNG BỘ ÂM THANH & PHÍM TẮT TOÀN CỤC
  // ==========================================================================
  const POMODORO_MILESTONE_BADGES = Object.freeze([
    {
      id: 'first_spark',
      minSessionsTotal: 1,
      minWordsTotal: 100,
      icon: '🌱',
      title: 'Ngọn Lửa Khởi Đầu',
      desc: 'Hoàn thành phiên viết tập trung đầu tiên.'
    },
    {
      id: 'word_sprinter',
      minSessionsTotal: 3,
      minWordsTotal: 1500,
      icon: '⚡',
      title: 'Bút Lực Nước Rút',
      desc: 'Tích lũy từ 3 phiên viết tập trung & 1.500 từ trở lên.'
    },
    {
      id: 'night_novelist',
      minSessionsTotal: 8,
      minWordsTotal: 5000,
      icon: '🌙',
      title: 'Cú Đêm Văn Học',
      desc: 'Chinh phục 8 phiên viết sâu & vượt mốc 5.000 từ.'
    },
    {
      id: 'light_novel_master',
      minSessionsTotal: 20,
      minWordsTotal: 15000,
      icon: '🏆',
      title: 'Đại Tác Giả Bền Bỉ',
      desc: 'Cán mốc 20 phiên Pomodoro & hơn 15.000 từ thuần khiết.'
    }
  ]);

  class PomodoroAchievementsAndHarmonyBridge {
    constructor(engine) {
      this.engine = engine;
      this.shortcutsBound = false;
    }

    computeEarnedBadges() {
      const records = this.engine.ledger.records || [];
      const workRuns = records.filter((r) => r.phase === 'WORK');
      const totalSessions = workRuns.length;
      const totalWords = workRuns.reduce((s, r) => s + (r.wordsWritten || 0), 0);

      return POMODORO_MILESTONE_BADGES.map((badge) => ({
        ...badge,
        unlocked:
          totalSessions >= badge.minSessionsTotal &&
          totalWords >= badge.minWordsTotal,
        progressSessions: `${Math.min(totalSessions, badge.minSessionsTotal)}/${badge.minSessionsTotal}`,
        progressWords: `${Math.min(totalWords, badge.minWordsTotal)}/${badge.minWordsTotal}`
      }));
    }

    bindGlobalPomodoroKeyboardShortcuts() {
      if (this.shortcutsBound || typeof document === 'undefined') return;
      this.shortcutsBound = true;

      document.addEventListener('keydown', (ev) => {
        // Alt + P: Bật / Tạm dừng đồng hồ Pomodoro đồng bộ 2 chiều từ bất kỳ Tab nào
        if (ev.altKey && !ev.ctrlKey && !ev.metaKey && ev.key.toLowerCase() === 'p') {
          ev.preventDefault();
          const running = this.engine.toggleStartPause('GLOBAL_HOTKEY_ALT_P');
          getUtils().showToast(
            running
              ? '▶️ [Alt+P] Đã chạy đồng hồ Pomodoro (đồng bộ Tab 5 & Thanh nổi)!'
              : '⏸ [Alt+P] Đã tạm dừng đồng hồ Pomodoro!',
            'info',
            2200
          );
        }
        // Alt + Shift + P: Đặt lại đồng hồ về đầu phiên
        if (
          ev.altKey &&
          ev.shiftKey &&
          !ev.ctrlKey &&
          ev.key.toLowerCase() === 'p'
        ) {
          ev.preventDefault();
          this.engine.resetTimer('GLOBAL_HOTKEY_RESET');
          getUtils().showToast(
            '↺ [Alt+Shift+P] Đã đặt lại bộ đếm Pomodoro!',
            'info',
            2000
          );
        }
      });
    }

    syncWithTab5MusicStudioIfConfigured(phaseStarted) {
      const audioStudio = NS.audioStudio;
      if (!audioStudio) return;
      try {
        // Giảm nhẹ âm lượng nhạc nền khi chuyển sang Giờ Nghỉ để tác giả nghe chuông rõ hơn
        if (phaseStarted === 'BREAK' && typeof audioStudio.duckVolumeTemporarily === 'function') {
          audioStudio.duckVolumeTemporarily(0.65);
        }
      } catch (_) {}
    }

    renderBadgesStripInsideTab5() {
      const coachBox = document.getElementById('tab5-pomo-microbreak-coach-box');
      if (!coachBox || !coachBox.parentElement) return;

      let badgeBar = document.getElementById('tab5-pomo-badges-strip');
      if (!badgeBar) {
        badgeBar = document.createElement('div');
        badgeBar.id = 'tab5-pomo-badges-strip';
        badgeBar.className = 'pt-2 border-t border-zinc-800/80 space-y-1.5';
        coachBox.parentElement.appendChild(badgeBar);
      }

      const badges = this.computeEarnedBadges();
      const esc = getUtils().escapeHtml;
      badgeBar.innerHTML = [
        '<div class="flex items-center justify-between text-[10px]">',
        '  <span class="font-bold uppercase text-amber-300">🏅 Huy Hiệu Chuyên Cần Tập Trung (Phím tắt nhanh: Alt + P)</span>',
        `  <span class="text-zinc-500">Đã mở khóa ${badges.filter((b) => b.unlocked).length}/${badges.length}</span>`,
        '</div>',
        '<div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5">',
        ...badges.map((b) => {
          const styleCls = b.unlocked
            ? 'border-emerald-500/45 bg-emerald-950/35 text-emerald-200'
            : 'border-zinc-800 bg-zinc-900/60 text-zinc-500 opacity-75';
          return [
            `<div class="p-2 rounded-xl border text-[10px] space-y-0.5 ${styleCls}" title="${esc(b.desc)}">`,
            `  <div class="font-bold truncate">${b.icon} ${esc(b.title)}</div>`,
            `  <div class="font-monoCode text-[9px]">${b.unlocked ? '✓ Đã đạt' : `Phiên: ${b.progressSessions}`}</div>`,
            '</div>'
          ].join('');
        }),
        '</div>'
      ].join('\n');
    }

    verifyTwoWaySyncIntegrity() {
      const tab5Time = document
        .getElementById('tab5-pomo-time-display')
        ?.textContent?.trim();
      const floatTime = document
        .getElementById('floating-pomo-time')
        ?.textContent?.trim();
      const tab5BtnRunning = document
        .getElementById('btn-tab5-pomo-toggle')
        ?.getAttribute('data-pomo-running');
      const floatBtnRunning = document
        .getElementById('btn-floating-pomo-toggle')
        ?.getAttribute('data-pomo-running');

      const timeSynced = !tab5Time || !floatTime || tab5Time === floatTime;
      const stateSynced =
        !tab5BtnRunning ||
        !floatBtnRunning ||
        tab5BtnRunning === floatBtnRunning;

      return {
        healthy: timeSynced && stateSynced,
        timeSynced,
        stateSynced,
        tab5Time,
        floatTime,
        isRunning: this.engine.store.state.isRunning,
        phase: this.engine.store.state.phase
      };
    }
  }

  // ==========================================================================
  // LỚP 10: DỰ BÁO SỐ PHIÊN POMODORO ĐỂ HOÀN TẤT MỤC TIÊU TỪ TRONG NGÀY & XUẤT CSV
  // ==========================================================================
  class PomodoroGoalProjectionAndExporter {
    constructor(engine) {
      this.engine = engine;
    }

    getEstimatedSprintsToFinishDailyGoal() {
      const todayStats = this.engine.ledger.getTodayStats();
      const goalKey =
        NS.constants?.STORAGE_KEYS?.DAILY_GOAL || 'noir_v38_daily_word_goal_state';
      let dailyTarget = 2000;
      let dailyWritten = todayStats.totalSprintWordsToday || 0;

      try {
        const raw = localStorage.getItem(goalKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Number(parsed?.dailyTarget) > 0) {
            dailyTarget = Number(parsed.dailyTarget);
          }
          if (Number(parsed?.todayAddedWords) > dailyWritten) {
            dailyWritten = Number(parsed.todayAddedWords);
          }
        }
      } catch (_) {}

      const remainingWords = Math.max(0, dailyTarget - dailyWritten);
      const workMins = this.engine.store.state.workMinutes || 25;
      const effectiveWpm =
        todayStats.avgWpmToday > 2 ? todayStats.avgWpmToday : 18;
      const wordsPerSprint = Math.max(120, Math.round(effectiveWpm * workMins));
      const estimatedSprintsNeeded =
        remainingWords > 0 ? Math.ceil(remainingWords / wordsPerSprint) : 0;

      return {
        dailyTarget,
        dailyWritten,
        remainingWords,
        effectiveWpm,
        wordsPerSprint,
        estimatedSprintsNeeded,
        summaryLine:
          remainingWords === 0
            ? `🎯 Đã cán mốc mục tiêu ${dailyTarget.toLocaleString('vi-VN')} từ hôm nay!`
            : `🎯 Còn ${remainingWords.toLocaleString('vi-VN')} từ để đạt KPI ngày (~${estimatedSprintsNeeded} phiên Pomodoro nữa ở tốc độ ${effectiveWpm} từ/phút).`
      };
    }

    exportSprintHistoryCsv() {
      const records = this.engine.ledger.records || [];
      const rows = [
        'ID,Ngay,ThoiDiemHoanThanh,GiaiDoan,SoPhut,SoTuVietDuoc,TocDoWPM'
      ];
      for (const r of records) {
        const timeIso = new Date(r.completedAt).toISOString();
        rows.push(
          [
            r.id,
            r.dateKey,
            timeIso,
            r.phase,
            r.durationMinutes,
            r.wordsWritten,
            r.wordsPerMinute
          ].join(',')
        );
      }
      return rows.join('\n');
    }

    downloadSprintHistoryCsvFile() {
      const csv = this.exportSprintHistoryCsv();
      const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Pomodoro_NangSuat_Viet_${getTodayKey()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      getUtils().showToast('📊 Đã xuất bảng lịch sử năng suất Pomodoro (.csv)!', 'success');
    }

    mountGoalProjectionStrip() {
      const badgesStrip = document.getElementById('tab5-pomo-badges-strip');
      if (!badgesStrip || !badgesStrip.parentElement) return;

      let goalRow = document.getElementById('tab5-pomo-goal-projection-row');
      if (!goalRow) {
        goalRow = document.createElement('div');
        goalRow.id = 'tab5-pomo-goal-projection-row';
        goalRow.className =
          'pt-2 border-t border-zinc-800/70 flex flex-wrap items-center justify-between gap-2 text-[10px] text-zinc-300';
        badgesStrip.parentElement.appendChild(goalRow);
      }

      const proj = this.getEstimatedSprintsToFinishDailyGoal();
      const esc = getUtils().escapeHtml;
      goalRow.innerHTML = [
        `<span class="font-semibold text-emerald-300">${esc(proj.summaryLine)}</span>`,
        '<button type="button" id="btn-pomo-export-csv" class="px-2.5 py-1 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-bold">📥 Xuất lịch sử .CSV</button>'
      ].join('');

      const bindOnce =
        typeof NS.bindOnce === 'function'
          ? NS.bindOnce.bind(NS)
          : (el, ev, fn) => {
              const t = typeof el === 'string' ? document.getElementById(el) : el;
              if (t) t.addEventListener(ev, fn);
            };

      bindOnce(
        'btn-pomo-export-csv',
        'click',
        () => this.downloadSprintHistoryCsvFile(),
        'mod20_export_csv_click'
      );
    }
  }

  // ==========================================================================
  // ĐĂNG KÝ SINGLETON LÊN `window.NoirStudio.pomodoro`
  // ==========================================================================
  const pomodoroSyncEngine = new BidirectionalPomodoroSyncEngine();
  pomodoroSyncEngine.wellnessCoach = new PomodoroFocusStreakAndWellnessCoach(
    pomodoroSyncEngine
  );
  pomodoroSyncEngine.sprintCurve = new PomodoroSprintCurveAndMobileWakeLock(
    pomodoroSyncEngine
  );
  pomodoroSyncEngine.achievementsBridge =
    new PomodoroAchievementsAndHarmonyBridge(pomodoroSyncEngine);
  pomodoroSyncEngine.goalProjector = new PomodoroGoalProjectionAndExporter(
    pomodoroSyncEngine
  );

  const origSyncAll = BidirectionalPomodoroSyncEngine.prototype.syncAllViews;
  BidirectionalPomodoroSyncEngine.prototype.syncAllViews = function () {
    origSyncAll.call(this);
    if (this.wellnessCoach) {
      this.wellnessCoach.renderSprintHistoryWidgetInsideTab5();
    }
    if (this.sprintCurve) {
      this.sprintCurve.capturePeriodicSprintCheckpoint(this.store.state);
      this.sprintCurve.renderBreakWellnessCardAndWakeLockControl();
    }
    if (this.achievementsBridge) {
      this.achievementsBridge.renderBadgesStripInsideTab5();
    }
    if (this.goalProjector) {
      this.goalProjector.mountGoalProjectionStrip();
    }
  };

  const origBindDomPomo = BidirectionalPomodoroSyncEngine.prototype.bindDOM;
  BidirectionalPomodoroSyncEngine.prototype.bindDOM = function () {
    origBindDomPomo.call(this);
    if (this.achievementsBridge) {
      this.achievementsBridge.bindGlobalPomodoroKeyboardShortcuts();
    }
  };

  const origHandleCompleted =
    BidirectionalPomodoroSyncEngine.prototype.handlePhaseCompleted;
  BidirectionalPomodoroSyncEngine.prototype.handlePhaseCompleted = function () {
    const prevPhase = this.store.state.phase;
    origHandleCompleted.call(this);
    if (this.sprintCurve) {
      this.sprintCurve.requestBrowserNotificationPermissionAndNotify(
        prevPhase === 'WORK'
          ? '🍅 Hoàn thành phiên viết tiểu thuyết!'
          : '☕ Hết giờ nghỉ Pomodoro!',
        prevPhase === 'WORK'
          ? 'Hãy nghỉ ngơi mắt vài phút trước khi viết tiếp nhé.'
          : 'Mời bạn quay lại bàn viết!'
      );
    }
    if (this.achievementsBridge) {
      this.achievementsBridge.syncWithTab5MusicStudioIfConfigured(
        this.store.state.phase
      );
    }
  };

  pomodoroSyncEngine.getProductivitySummaryText = () =>
    pomodoroSyncEngine.sprintCurve.formatProductivityExportText();
  pomodoroSyncEngine.verifySyncIntegrity = () =>
    pomodoroSyncEngine.achievementsBridge.verifyTwoWaySyncIntegrity();
  pomodoroSyncEngine.getDailyGoalSprintProjection = () =>
    pomodoroSyncEngine.goalProjector.getEstimatedSprintsToFinishDailyGoal();

  pomodoroSyncEngine.resetTodayStatsOnly = () => {
    const st = pomodoroSyncEngine.store.state;
    st.sessionsCompletedToday = 0;
    st.wordsWrittenThisSession = 0;
    st.wordsAtSessionStart =
      st.phase === 'WORK' && st.isRunning
        ? pomodoroSyncEngine.ledger.getTotalProjectWordCountNow()
        : 0;
    pomodoroSyncEngine.store.saveToStorage();
    pomodoroSyncEngine.syncAllViews();
    return true;
  };

  pomodoroSyncEngine.setMuteBell = (muted) => {
    const flag = Boolean(muted);
    pomodoroSyncEngine.bellSynth.muted = flag;
    pomodoroSyncEngine.store.state.soundEnabled = !flag;
    pomodoroSyncEngine.store.saveToStorage();
    const chk = document.getElementById('chk-pomo-sound-bell');
    if (chk) chk.checked = !flag;
    return !flag;
  };

  pomodoroSyncEngine.setAutoContinueNextPhase = (enabled) => {
    const flag = Boolean(enabled);
    pomodoroSyncEngine.store.state.autoContinueNextPhase = flag;
    pomodoroSyncEngine.store.saveToStorage();
    const chk = document.getElementById('chk-pomo-auto-next');
    if (chk) chk.checked = flag;
    return flag;
  };

  pomodoroSyncEngine.getFloatingPillSyncDebugInfo = () => {
    const syncInfo =
      pomodoroSyncEngine.achievementsBridge.verifyTwoWaySyncIntegrity();
    const proj =
      pomodoroSyncEngine.goalProjector.getEstimatedSprintsToFinishDailyGoal();
    return {
      ...syncInfo,
      remainingSeconds: pomodoroSyncEngine.store.state.remainingSeconds,
      workMinutes: pomodoroSyncEngine.store.state.workMinutes,
      breakMinutes: pomodoroSyncEngine.store.state.breakMinutes,
      estimatedSprintsNeededForGoal: proj.estimatedSprintsNeeded
    };
  };

  pomodoroSyncEngine.completeCurrentPhaseImmediately = () => {
    pomodoroSyncEngine.store.state.remainingSeconds = 0;
    pomodoroSyncEngine.handlePhaseCompleted();
  };

  /**
   * Hỗ trợ phục hồi phiên tập trung sau sự cố tải lại trang và kết xuất thống kê tập trung.
   */
  class SessionFocusRecoveryHelper {
    constructor(engineInstance) {
      this.engine = engineInstance;
      this.recoveryStorageKey = 'noir_pomodoro_recovery_audit_v38';
    }

    snapshotFocusRecoveryMarker(reasonLabel = 'auto_checkpoint') {
      const storeState = this.engine?.store?.state || {};
      const marker = {
        savedAtIso: new Date().toISOString(),
        reason: String(reasonLabel || 'auto_checkpoint'),
        phase: String(storeState.phase || 'FOCUS'),
        isRunning: Boolean(storeState.isRunning),
        remainingSeconds: Number(storeState.remainingSeconds || 0),
        completedPomodoros: Number(storeState.completedPomodoros || 0),
        totalFocusMinutes: Number(storeState.totalFocusMinutes || 0),
        wordsAtStart: Number(storeState.wordsAtStart || 0),
      };
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(this.recoveryStorageKey, JSON.stringify(marker));
        }
      } catch (_err) {
        // Bỏ qua lỗi hạn mức bộ nhớ trình duyệt khi lưu mốc phục hồi nhẹ
      }
      return marker;
    }

    readLastFocusRecoveryMarker() {
      try {
        if (typeof localStorage === 'undefined') return null;
        const raw = localStorage.getItem(this.recoveryStorageKey);
        if (!raw) return null;
        return JSON.parse(raw);
      } catch (_err) {
        return null;
      }
    }

    buildDailyFocusSummaryReport() {
      const state = this.engine?.store?.state || {};
      const completedCount = Number(state.completedPomodoros || 0);
      const focusMinutes = Number(state.totalFocusMinutes || 0);
      const remainingMin = Math.floor(Number(state.remainingSeconds || 0) / 60);
      const remainingSec = Math.floor(Number(state.remainingSeconds || 0) % 60);
      const formattedRemain = `${String(remainingMin).padStart(2, '0')}:${String(remainingSec).padStart(2, '0')}`;
      return {
        exportedAt: new Date().toISOString(),
        currentPhase: String(state.phase || 'FOCUS'),
        isRunning: Boolean(state.isRunning),
        formattedRemainingTime: formattedRemain,
        completedSessionsToday: completedCount,
        accumulatedFocusMinutes: focusMinutes,
        estimatedFocusHours: Number((focusMinutes / 60).toFixed(2)),
        lastRecoveryMarker: this.readLastFocusRecoveryMarker(),
      };
    }

    exportFocusStatsJson() {
      const report = this.buildDailyFocusSummaryReport();
      return JSON.stringify(report, null, 2);
    }
  }

  const focusRecoveryHelper = new SessionFocusRecoveryHelper(pomodoroSyncEngine);
  pomodoroSyncEngine.focusRecoveryHelper = focusRecoveryHelper;
  pomodoroSyncEngine.snapshotFocusRecovery = (reason) =>
    focusRecoveryHelper.snapshotFocusRecoveryMarker(reason);
  pomodoroSyncEngine.getDailyFocusSummaryReport = () =>
    focusRecoveryHelper.buildDailyFocusSummaryReport();
  pomodoroSyncEngine.exportFocusStatsJson = () =>
    focusRecoveryHelper.exportFocusStatsJson();

  NS.pomodoro = pomodoroSyncEngine;
  NS.BidirectionalPomodoroSyncEngine = BidirectionalPomodoroSyncEngine;
  NS.SessionFocusRecoveryHelper = SessionFocusRecoveryHelper;

  if (typeof NS.registerModule === 'function') {
    NS.registerModule('mod20', pomodoroSyncEngine);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        if (!pomodoroSyncEngine.hasInitialized) pomodoroSyncEngine.init();
      });
    } else {
      pomodoroSyncEngine.init();
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
