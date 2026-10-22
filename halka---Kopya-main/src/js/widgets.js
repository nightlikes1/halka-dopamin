// Widget Definitions, Templates, Event Handlers & State Management

export const WIDGET_CATALOG = [
  {
    id: 'water',
    name: 'Su Takibi',
    category: 'Sağlık',
    icon: '💧',
    desc: 'Günlük su tüketim hedefini belirle ve tek tıkla bardak ekle.',
    accent: '#38bdf8'
  },
  {
    id: 'pomodoro',
    name: 'Pomodoro Odak',
    category: 'Üretkenlik',
    icon: '⏱️',
    desc: '25 dakikalık derin odaklanma seansları ve mola zamanlayıcısı.',
    accent: '#f43f5e'
  },
  {
    id: 'tasks',
    name: 'Günlük Görevler',
    category: 'Üretkenlik',
    icon: '✅',
    desc: 'Bugünün öncelikli yapılacaklar listesi ve ilerleme çubuğu.',
    accent: '#10b981'
  },
  {
    id: 'streak',
    name: 'Zinciri Kırma',
    category: 'Alışkanlık',
    icon: '⛓️',
    desc: 'Her gün tekrarlanan alışkanlıkların ardışık gün zinciri.',
    accent: '#f59e0b'
  },
  {
    id: 'notes',
    name: 'Hızlı Not Defteri',
    category: 'Düşünce',
    icon: '📝',
    desc: 'Aklına gelen fikirleri anında kaydet, otomatik saklanır.',
    accent: '#8b5cf6'
  },
  {
    id: 'breathing',
    name: 'Kutu Nefesi (Zen)',
    category: 'Sağlık & Zihin',
    icon: '🧘',
    desc: '4-4-4-4 nefes döngüsüyle kalp ritmini düzenle ve sakinleş.',
    accent: '#06b6d4'
  },
  {
    id: 'mood',
    name: 'Ruh Hali & Enerji',
    category: 'Farkındalık',
    icon: '🌟',
    desc: 'Günün duygu durumunu ve enerji seviyeni kaydet.',
    accent: '#ec4899'
  },
  {
    id: 'ambient',
    name: 'Ortam Sesleri',
    category: 'Odak',
    icon: '🎧',
    desc: 'Sentezlenmiş yağmur, uzay ve kafe sesleriyle odaklan.',
    accent: '#6366f1'
  },
  {
    id: 'bigOne',
    name: 'Günün Ana Hedefi',
    category: 'Odak',
    icon: '🎯',
    desc: 'Bugün ne olursa olsun bitirilmesi gereken 1 numaralı görev.',
    accent: '#eab308'
  },
  {
    id: 'budget',
    name: 'Günlük Harcama',
    category: 'Finans',
    icon: '💰',
    desc: 'Günün harcama limitini ve anlık harcamalarını takip et.',
    accent: '#14b8a6'
  }
];

export class WidgetManager {
  constructor(storageManager, soundManager, onStateChange) {
    this.storage = storageManager;
    this.sound = soundManager;
    this.onStateChange = onStateChange || (() => {});
    this.pomodoroTimerId = null;
    this.breathingTimerId = null;
  }

  // Renders the HTML card for a widget
  renderWidgetHtml(id) {
    const catalogItem = WIDGET_CATALOG.find(w => w.id === id);
    if (!catalogItem) return '';

    const data = this.storage.getWidgetData(id);

    return `
      <article class="widget-card" id="widget-${id}" data-widget-id="${id}" style="--widget-accent: ${catalogItem.accent}">
        <header class="widget-header">
          <div class="widget-title-area">
            <span class="widget-icon">${catalogItem.icon}</span>
            <div class="widget-title-text">
              <h3 class="widget-title">${catalogItem.name}</h3>
              <span class="widget-category">${catalogItem.category}</span>
            </div>
            <span class="widget-collapsed-summary">${this.getWidgetSummaryText(id, data)}</span>
          </div>
          <div class="widget-actions">
            <button class="widget-btn-focus" title="Halkada Odaklan" aria-label="Halkada Odaklan">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
            </button>
            <button class="widget-btn-collapse" title="Küçült / Büyüt" aria-label="Küçült / Büyüt">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <button class="widget-btn-remove" title="Bu Eklentiyi Sil" aria-label="Eklentiyi Sil">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </header>

        <div class="widget-body">
          ${this.getWidgetBodyHtml(id, data)}
        </div>
      </article>
    `;
  }

  getWidgetSummaryText(id, data) {
    switch (id) {
      case 'water':
        return `${data.current || 0} ml`;
      case 'pomodoro': {
        const t = data.timeLeft !== undefined ? data.timeLeft : 25 * 60;
        const m = Math.floor(t / 60).toString().padStart(2, '0');
        const s = (t % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
      }
      case 'tasks': {
        const items = data.items || [];
        const done = items.filter(t => t.done).length;
        return `${done}/${items.length}`;
      }
      case 'streak':
        return `${data.currentStreak || 0} gün`;
      case 'notes': {
        const len = (data.content || '').length;
        return len > 0 ? `${len} harf` : 'Not';
      }
      case 'breathing':
        return 'Zen';
      case 'mood': {
        const moodMap = { great: '🤩', energetic: '⚡', calm: '🧘', tired: '🥱', low: '🌧️' };
        return moodMap[data.todayMood] || 'Mod';
      }
      case 'ambient':
        return this.sound && this.sound.ambientSource ? 'Çalıyor' : 'Sessiz';
      case 'bigOne':
        return data.isCompleted ? '✓ Bitti' : 'Hedef';
      case 'budget': {
        const rem = Math.max(0, (data.limit || 500) - (data.spent || 0));
        return `${rem} ₺`;
      }
      default:
        return 'Aktif';
    }
  }

  getWidgetBodyHtml(id, data) {
    switch (id) {
      case 'water':
        return this.templateWater(data);
      case 'pomodoro':
        return this.templatePomodoro(data);
      case 'tasks':
        return this.templateTasks(data);
      case 'streak':
        return this.templateStreak(data);
      case 'notes':
        return this.templateNotes(data);
      case 'breathing':
        return this.templateBreathing(data);
      case 'mood':
        return this.templateMood(data);
      case 'ambient':
        return this.templateAmbient(data);
      case 'bigOne':
        return this.templateBigOne(data);
      case 'budget':
        return this.templateBudget(data);
      default:
        return `<p class="empty-state">Eklenti verisi hazır.</p>`;
    }
  }

  // Bind events to rendered widget element
  bindWidgetEvents(widgetEl) {
    const id = widgetEl.dataset.widgetId;
    if (!id) return;

    // Header remove button
    const removeBtn = widgetEl.querySelector('.widget-btn-remove');
    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.sound.playDelete();
        widgetEl.classList.add('removing');
        setTimeout(() => {
          this.storage.removeWidget(id);
          this.onStateChange({ type: 'remove', widgetId: id });
        }, 300);
      });
    }

    // Header focus button
    const focusBtn = widgetEl.querySelector('.widget-btn-focus');
    if (focusBtn) {
      focusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onStateChange({ type: 'focus', widgetId: id });
      });
    }

    // Card / Title area click to focus (if not clicking inputs/buttons)
    const titleArea = widgetEl.querySelector('.widget-title-area');
    if (titleArea) {
      titleArea.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onStateChange({ type: 'focus', widgetId: id });
      });
    }

    // Header collapse toggle
    const collapseBtn = widgetEl.querySelector('.widget-btn-collapse');
    if (collapseBtn) {
      collapseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.sound.playClick();
        widgetEl.classList.toggle('collapsed');
      });
    }

    // Specific widget body event binding
    switch (id) {
      case 'water':
        this.bindWaterEvents(widgetEl);
        break;
      case 'pomodoro':
        this.bindPomodoroEvents(widgetEl);
        break;
      case 'tasks':
        this.bindTasksEvents(widgetEl);
        break;
      case 'streak':
        this.bindStreakEvents(widgetEl);
        break;
      case 'notes':
        this.bindNotesEvents(widgetEl);
        break;
      case 'breathing':
        this.bindBreathingEvents(widgetEl);
        break;
      case 'mood':
        this.bindMoodEvents(widgetEl);
        break;
      case 'ambient':
        this.bindAmbientEvents(widgetEl);
        break;
      case 'bigOne':
        this.bindBigOneEvents(widgetEl);
        break;
      case 'budget':
        this.bindBudgetEvents(widgetEl);
        break;
    }
  }

  // --- 1. WATER TRACKER ---
  templateWater(data) {
    const current = data.current || 0;
    const target = data.target || 2500;
    const pct = Math.min(100, Math.round((current / target) * 100));

    return `
      <div class="water-container">
        <div class="water-display">
          <div class="water-gauge">
            <div class="water-wave" style="height: ${pct}%;"></div>
            <div class="water-gauge-text">
              <span class="water-amount">${current}</span>
              <span class="water-unit">/ ${target} ml</span>
            </div>
          </div>
          <div class="water-stats">
            <span class="water-percentage">%${pct}</span>
            <span class="water-status">${pct >= 100 ? 'Hedef Başarıldı! 🎉' : `${target - current} ml kaldı`}</span>
          </div>
        </div>

        <div class="water-actions">
          <button class="btn-chip btn-water-add" data-add="100">+100 ml</button>
          <button class="btn-chip btn-water-add primary" data-add="250">+250 ml</button>
          <button class="btn-chip btn-water-add" data-add="500">+500 ml</button>
          <button class="btn-icon btn-water-reset" title="Sıfırla">↺</button>
        </div>
      </div>
    `;
  }

  bindWaterEvents(el) {
    el.querySelectorAll('.btn-water-add').forEach(btn => {
      btn.addEventListener('click', () => {
        const addAmount = parseInt(btn.dataset.add, 10);
        const data = this.storage.getWidgetData('water');
        const nextCurrent = (data.current || 0) + addAmount;
        this.storage.updateWidgetData('water', { current: nextCurrent });
        this.sound.playWaterDrop();
        this.updateWidgetBody(el, 'water');
        this.onStateChange({ type: 'update', widgetId: 'water' });
      });
    });

    const resetBtn = el.querySelector('.btn-water-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.storage.updateWidgetData('water', { current: 0 });
        this.sound.playClick();
        this.updateWidgetBody(el, 'water');
        this.onStateChange({ type: 'update', widgetId: 'water' });
      });
    }
  }

  // --- 2. POMODORO TIMER ---
  templatePomodoro(data) {
    const timeLeft = data.timeLeft !== undefined ? data.timeLeft : 25 * 60;
    const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const secs = (timeLeft % 60).toString().padStart(2, '0');
    const isRunning = data.isRunning || false;
    const mode = data.mode || 'work';

    return `
      <div class="pomodoro-container">
        <div class="pomo-modes">
          <button class="pomo-mode-btn ${mode === 'work' ? 'active' : ''}" data-mode="work">Odak (25 dk)</button>
          <button class="pomo-mode-btn ${mode === 'shortBreak' ? 'active' : ''}" data-mode="shortBreak">Kısa Mola</button>
          <button class="pomo-mode-btn ${mode === 'longBreak' ? 'active' : ''}" data-mode="longBreak">Uzun Mola</button>
        </div>

        <div class="pomo-timer-display">
          <span class="pomo-time">${mins}:${secs}</span>
          <span class="pomo-sessions">Tamamlanan: <strong>${data.completedSessions || 0}</strong> seans</span>
        </div>

        <div class="pomo-controls">
          <button class="btn-action pomo-toggle ${isRunning ? 'btn-pause' : 'btn-start'}">
            ${isRunning ? 'Durdur' : 'Başlat'}
          </button>
          <button class="btn-chip pomo-reset">Sıfırla</button>
        </div>
      </div>
    `;
  }

  bindPomodoroEvents(el) {
    const toggleBtn = el.querySelector('.pomo-toggle');
    const resetBtn = el.querySelector('.pomo-reset');
    const modeBtns = el.querySelectorAll('.pomo-mode-btn');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const data = this.storage.getWidgetData('pomodoro');
        const isRunning = !data.isRunning;
        this.sound.playClick();
        this.storage.updateWidgetData('pomodoro', { isRunning });

        if (isRunning) {
          this.startPomodoroInterval(el);
        } else {
          this.stopPomodoroInterval();
        }
        this.updateWidgetBody(el, 'pomodoro');
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stopPomodoroInterval();
        const data = this.storage.getWidgetData('pomodoro');
        let defaultTime = 25 * 60;
        if (data.mode === 'shortBreak') defaultTime = 5 * 60;
        if (data.mode === 'longBreak') defaultTime = 15 * 60;
        this.storage.updateWidgetData('pomodoro', { timeLeft: defaultTime, isRunning: false });
        this.sound.playClick();
        this.updateWidgetBody(el, 'pomodoro');
      });
    }

    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.stopPomodoroInterval();
        const mode = btn.dataset.mode;
        let time = 25 * 60;
        if (mode === 'shortBreak') time = 5 * 60;
        if (mode === 'longBreak') time = 15 * 60;

        this.storage.updateWidgetData('pomodoro', { mode, timeLeft: time, isRunning: false });
        this.sound.playClick();
        this.updateWidgetBody(el, 'pomodoro');
      });
    });

    const data = this.storage.getWidgetData('pomodoro');
    if (data.isRunning && !this.pomodoroTimerId) {
      this.startPomodoroInterval(el);
    }
  }

  startPomodoroInterval(el) {
    this.stopPomodoroInterval();
    this.pomodoroTimerId = setInterval(() => {
      const data = this.storage.getWidgetData('pomodoro');
      if (data.timeLeft > 0) {
        this.storage.updateWidgetData('pomodoro', { timeLeft: data.timeLeft - 1 });
        this.updateWidgetBody(el, 'pomodoro', true);
      } else {
        // Complete session
        this.stopPomodoroInterval();
        this.sound.playChime();
        const nextSessions = (data.completedSessions || 0) + (data.mode === 'work' ? 1 : 0);
        this.storage.updateWidgetData('pomodoro', {
          isRunning: false,
          completedSessions: nextSessions,
          timeLeft: data.mode === 'work' ? 5 * 60 : 25 * 60,
          mode: data.mode === 'work' ? 'shortBreak' : 'work'
        });
        this.updateWidgetBody(el, 'pomodoro');
        this.onStateChange({ type: 'update', widgetId: 'pomodoro' });
      }
    }, 1000);
  }

  stopPomodoroInterval() {
    if (this.pomodoroTimerId) {
      clearInterval(this.pomodoroTimerId);
      this.pomodoroTimerId = null;
    }
  }

  // --- 3. DAILY TASKS ---
  templateTasks(data) {
    const items = data.items || [];
    const doneCount = items.filter(t => t.done).length;
    const totalCount = items.length;
    const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

    return `
      <div class="tasks-container">
        <div class="tasks-progress-bar">
          <div class="tasks-progress-fill" style="width: ${progress}%"></div>
        </div>
        <div class="tasks-stats">
          <span>İlerleme: %${progress}</span>
          <span>${doneCount}/${totalCount} Tamamlandı</span>
        </div>

        <form class="tasks-add-form">
          <input type="text" class="tasks-input" placeholder="Yeni görev ekle..." required autocomplete="off" />
          <button type="submit" class="btn-chip primary">+</button>
        </form>

        <ul class="tasks-list">
          ${items.length === 0 ? `<li class="empty-state">Tüm görevler bitti! 🎉</li>` : ''}
          ${items.map(item => `
            <li class="task-item ${item.done ? 'done' : ''}" data-task-id="${item.id}">
              <label class="task-checkbox-label">
                <input type="checkbox" class="task-check" ${item.done ? 'checked' : ''} />
                <span class="task-custom-box"></span>
                <span class="task-text">${escapeHtml(item.text)}</span>
              </label>
              <button class="task-btn-delete" title="Görevi Sil">×</button>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  bindTasksEvents(el) {
    const form = el.querySelector('.tasks-add-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('.tasks-input');
        const text = input.value.trim();
        if (!text) return;

        const data = this.storage.getWidgetData('tasks');
        const items = data.items || [];
        const newItem = {
          id: 't_' + Date.now(),
          text: text,
          done: false,
          priority: 'normal'
        };
        items.unshift(newItem);
        this.storage.updateWidgetData('tasks', { items });
        this.sound.playClick();
        input.value = '';
        this.updateWidgetBody(el, 'tasks');
        this.onStateChange({ type: 'update', widgetId: 'tasks' });
      });
    }

    el.querySelectorAll('.task-item').forEach(itemEl => {
      const taskId = itemEl.dataset.taskId;
      const check = itemEl.querySelector('.task-check');
      const delBtn = itemEl.querySelector('.task-btn-delete');

      if (check) {
        check.addEventListener('change', () => {
          const data = this.storage.getWidgetData('tasks');
          const items = (data.items || []).map(t => {
            if (t.id === taskId) {
              return { ...t, done: check.checked };
            }
            return t;
          });
          this.storage.updateWidgetData('tasks', { items });
          if (check.checked) {
            this.sound.playSuccess();
          } else {
            this.sound.playClick();
          }
          this.updateWidgetBody(el, 'tasks');
          this.onStateChange({ type: 'update', widgetId: 'tasks' });
        });
      }

      if (delBtn) {
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const data = this.storage.getWidgetData('tasks');
          const items = (data.items || []).filter(t => t.id !== taskId);
          this.storage.updateWidgetData('tasks', { items });
          this.sound.playDelete();
          this.updateWidgetBody(el, 'tasks');
          this.onStateChange({ type: 'update', widgetId: 'tasks' });
        });
      }
    });
  }

  // --- 4. HABIT STREAK (ZİNCİRİ KIRMA) ---
  templateStreak(data) {
    const streak = data.currentStreak || 0;
    const habit = data.habitName || 'Günlük Hedef';
    const history = data.history || [true, true, true, true, true, false, true];

    return `
      <div class="streak-container">
        <div class="streak-header">
          <div class="streak-flame-badge">
            <span class="flame-icon">🔥</span>
            <span class="streak-count">${streak}</span>
            <span class="streak-label">Gün Seri</span>
          </div>
          <div class="streak-habit-title" title="Alışkanlık adı">${escapeHtml(habit)}</div>
        </div>

        <div class="streak-chain-visual">
          <div class="chain-nodes">
            ${history.map((done, idx) => `
              <div class="chain-node ${done ? 'completed' : 'missed'}" title="${idx + 1}. Gün: ${done ? 'Yapıldı' : 'Boş'}">
                <span class="node-icon">${done ? '⛓️' : '○'}</span>
              </div>
            `).join('')}
          </div>
          <span class="chain-caption">Son 7 Günlük Zincir</span>
        </div>

        <button class="btn-action streak-check-btn">
          ✨ Bugünkü Halkayı Ekle
        </button>
      </div>
    `;
  }

  bindStreakEvents(el) {
    const btn = el.querySelector('.streak-check-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        const data = this.storage.getWidgetData('streak');
        const nextStreak = (data.currentStreak || 0) + 1;
        const history = [...(data.history || [true, true, true, true, true, false, true])];
        history.shift();
        history.push(true);

        this.storage.updateWidgetData('streak', {
          currentStreak: nextStreak,
          history: history,
          lastCheckedDate: new Date().toISOString().split('T')[0]
        });
        this.sound.playChainPulse();
        this.updateWidgetBody(el, 'streak');
        this.onStateChange({ type: 'update', widgetId: 'streak' });
      });
    }
  }

  // --- 5. QUICK NOTES ---
  templateNotes(data) {
    const content = data.content || '';
    return `
      <div class="notes-container">
        <textarea class="notes-textarea" placeholder="Hızlı bir düşünce karala...">${escapeHtml(content)}</textarea>
        <div class="notes-footer">
          <span class="notes-char-count">${content.length} karakter</span>
          <button class="btn-chip notes-copy-btn">Kopyala</button>
        </div>
      </div>
    `;
  }

  bindNotesEvents(el) {
    const textarea = el.querySelector('.notes-textarea');
    const copyBtn = el.querySelector('.notes-copy-btn');
    const countSpan = el.querySelector('.notes-char-count');

    if (textarea) {
      textarea.addEventListener('input', () => {
        this.storage.updateWidgetData('notes', { content: textarea.value });
        if (countSpan) countSpan.textContent = `${textarea.value.length} karakter`;
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        if (textarea) {
          navigator.clipboard.writeText(textarea.value);
          this.sound.playClick();
          copyBtn.textContent = 'Kopyalandı!';
          setTimeout(() => copyBtn.textContent = 'Kopyala', 1500);
        }
      });
    }
  }

  // --- 6. BREATHING (KUTU NEFESİ) ---
  templateBreathing(data) {
    return `
      <div class="breathing-container">
        <div class="breathing-circle-wrapper">
          <div class="breathing-orb">
            <span class="breathing-instruction">Hazır</span>
          </div>
        </div>
        <div class="breathing-timer-sub">4s Nefes Al • 4s Tut • 4s Ver • 4s Dinlen</div>
        <button class="btn-action breathing-toggle">Egzersizi Başlat</button>
      </div>
    `;
  }

  bindBreathingEvents(el) {
    const toggleBtn = el.querySelector('.breathing-toggle');
    const orb = el.querySelector('.breathing-orb');
    const text = el.querySelector('.breathing-instruction');

    let isRunning = false;
    let step = 0;
    const steps = [
      { label: 'Nefes Al (4s)', class: 'inhale' },
      { label: 'Tut (4s)', class: 'hold' },
      { label: 'Nefes Ver (4s)', class: 'exhale' },
      { label: 'Dinlen (4s)', class: 'rest' }
    ];

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        isRunning = !isRunning;
        this.sound.playClick();

        if (isRunning) {
          toggleBtn.textContent = 'Durdur';
          runCycle();
          this.breathingTimerId = setInterval(runCycle, 4000);
        } else {
          toggleBtn.textContent = 'Egzersizi Başlat';
          clearInterval(this.breathingTimerId);
          orb.className = 'breathing-orb';
          text.textContent = 'Hazır';
        }
      });
    }

    const runCycle = () => {
      const cur = steps[step];
      text.textContent = cur.label;
      orb.className = `breathing-orb ${cur.class}`;
      step = (step + 1) % steps.length;
    };
  }

  // --- 7. MOOD TRACKER ---
  templateMood(data) {
    const curMood = data.todayMood || 'calm';
    const energy = data.energyLevel || 8;
    const moods = [
      { id: 'great', icon: '🤩', label: 'Harika' },
      { id: 'energetic', icon: '⚡', label: 'Enerjik' },
      { id: 'calm', icon: '🧘', label: 'Sakin' },
      { id: 'tired', icon: '🥱', label: 'Yorgun' },
      { id: 'low', icon: '🌧️', label: 'Düşük' }
    ];

    return `
      <div class="mood-container">
        <div class="mood-selector">
          ${moods.map(m => `
            <button class="mood-btn ${curMood === m.id ? 'active' : ''}" data-mood="${m.id}" title="${m.label}">
              <span class="mood-icon">${m.icon}</span>
              <span class="mood-name">${m.label}</span>
            </button>
          `).join('')}
        </div>
        <div class="mood-energy">
          <label>Enerji Seviyesi: <strong class="energy-val">${energy}</strong>/10</label>
          <input type="range" class="energy-slider" min="1" max="10" value="${energy}" />
        </div>
      </div>
    `;
  }

  bindMoodEvents(el) {
    el.querySelectorAll('.mood-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const moodId = btn.dataset.mood;
        this.storage.updateWidgetData('mood', { todayMood: moodId });
        this.sound.playClick();
        this.updateWidgetBody(el, 'mood');
        this.onStateChange({ type: 'update', widgetId: 'mood' });
      });
    });

    const slider = el.querySelector('.energy-slider');
    const valText = el.querySelector('.energy-val');
    if (slider) {
      slider.addEventListener('input', () => {
        if (valText) valText.textContent = slider.value;
        this.storage.updateWidgetData('mood', { energyLevel: parseInt(slider.value, 10) });
      });
    }
  }

  // --- 8. AMBIENT SOUNDS ---
  templateAmbient(data) {
    const isPlaying = this.sound.ambientSource !== null;
    const curType = this.sound.currentAmbient;

    return `
      <div class="ambient-container">
        <div class="ambient-presets">
          <button class="btn-chip ambient-btn ${curType === 'rain' ? 'active' : ''}" data-ambient="rain">🌧️ Yağmur</button>
          <button class="btn-chip ambient-btn ${curType === 'focus' ? 'active' : ''}" data-ambient="focus">🧠 Pembe Gürültü</button>
          <button class="btn-chip ambient-btn ${curType === 'drone' ? 'active' : ''}" data-ambient="drone">🌌 Derin Uzay</button>
        </div>
        <div class="ambient-status">
          ${isPlaying ? `<span class="sound-wave-anim">♪ Sentezlenmiş Ortam Çalıyor...</span>` : 'Sessiz'}
        </div>
        ${isPlaying ? `<button class="btn-chip ambient-stop">Durdur ⏹</button>` : ''}
      </div>
    `;
  }

  bindAmbientEvents(el) {
    el.querySelectorAll('.ambient-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.ambient;
        this.sound.toggleAmbient(type);
        this.updateWidgetBody(el, 'ambient');
      });
    });

    const stopBtn = el.querySelector('.ambient-stop');
    if (stopBtn) {
      stopBtn.addEventListener('click', () => {
        this.sound.stopAmbient();
        this.updateWidgetBody(el, 'ambient');
      });
    }
  }

  // --- 9. ONE BIG THING (GÜNÜN ANA HEDEFİ) ---
  templateBigOne(data) {
    const goal = data.goal || 'Önemli web arayüzünü tamamla';
    const isCompleted = data.isCompleted || false;

    return `
      <div class="bigone-container ${isCompleted ? 'completed' : ''}">
        <div class="bigone-badge">#1 GÜNÜN ANA ODAĞI</div>
        <div class="bigone-title">${escapeHtml(goal)}</div>
        <button class="btn-action bigone-toggle-btn">
          ${isCompleted ? '✓ Tamamlandı' : 'Hedefi Tamamla'}
        </button>
      </div>
    `;
  }

  bindBigOneEvents(el) {
    const btn = el.querySelector('.bigone-toggle-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        const data = this.storage.getWidgetData('bigOne');
        const nextState = !data.isCompleted;
        this.storage.updateWidgetData('bigOne', { isCompleted: nextState });
        if (nextState) {
          this.sound.playSuccess();
        } else {
          this.sound.playClick();
        }
        this.updateWidgetBody(el, 'bigOne');
        this.onStateChange({ type: 'update', widgetId: 'bigOne' });
      });
    }
  }

  // --- 10. DAILY BUDGET ---
  templateBudget(data) {
    const limit = data.limit || 500;
    const spent = data.spent || 0;
    const remaining = Math.max(0, limit - spent);
    const pct = Math.min(100, Math.round((spent / limit) * 100));

    return `
      <div class="budget-container">
        <div class="budget-row">
          <span>Kalan Limit</span>
          <strong class="budget-amount">${remaining} ₺</strong>
        </div>
        <div class="tasks-progress-bar">
          <div class="tasks-progress-fill" style="width: ${pct}%; background: ${pct > 80 ? '#f43f5e' : '#14b8a6'}"></div>
        </div>
        <div class="tasks-stats">
          <span>Harcanan: ${spent} ₺</span>
          <span>Hedef: ${limit} ₺</span>
        </div>
        <form class="budget-add-form">
          <input type="number" class="budget-input" placeholder="Harcama ekle (₺)" required />
          <button type="submit" class="btn-chip primary">+</button>
        </form>
      </div>
    `;
  }

  bindBudgetEvents(el) {
    const form = el.querySelector('.budget-add-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('.budget-input');
        const val = parseFloat(input.value);
        if (isNaN(val) || val <= 0) return;

        const data = this.storage.getWidgetData('budget');
        const nextSpent = (data.spent || 0) + val;
        this.storage.updateWidgetData('budget', { spent: nextSpent });
        this.sound.playClick();
        input.value = '';
        this.updateWidgetBody(el, 'budget');
        this.onStateChange({ type: 'update', widgetId: 'budget' });
      });
    }
  }

  // Helper to re-render widget body without rebuilding whole card
  updateWidgetBody(widgetEl, id, onlyDisplay = false) {
    const data = this.storage.getWidgetData(id);
    const body = widgetEl.querySelector('.widget-body');
    if (body) {
      body.innerHTML = this.getWidgetBodyHtml(id, data);
      if (!onlyDisplay) {
        this.bindWidgetEvents(widgetEl);
      }
    }
  }

  // --- FOCUSED MODE RENDERER & TEMPLATES ---
  renderFocusedWidget(id, containerEl) {
    if (!containerEl) return;
    const data = this.storage.getWidgetData(id);
    containerEl.innerHTML = this.getFocusedWidgetHtml(id, data);
    this.bindFocusedWidgetEvents(containerEl, id);
  }

  getFocusedWidgetHtml(id, data) {
    switch (id) {
      case 'water':
        return this.templateFocusedWater(data);
      case 'pomodoro':
        return this.templateFocusedPomodoro(data);
      case 'tasks':
        return this.templateFocusedTasks(data);
      case 'streak':
        return this.templateFocusedStreak(data);
      case 'notes':
        return this.templateFocusedNotes(data);
      case 'breathing':
        return this.templateFocusedBreathing(data);
      case 'mood':
        return this.templateFocusedMood(data);
      case 'ambient':
        return this.templateFocusedAmbient(data);
      case 'bigOne':
        return this.templateFocusedBigOne(data);
      case 'budget':
        return this.templateFocusedBudget(data);
      default:
        return this.getWidgetBodyHtml(id, data);
    }
  }

  templateFocusedWater(data) {
    const current = data.current || 0;
    const target = data.target || 2500;
    const pct = Math.min(100, Math.round((current / target) * 100));

    return `
      <div class="focused-water-view">
        <div class="focused-water-hero">
          <div class="focused-water-gauge">
            <div class="water-wave" style="height: ${pct}%;"></div>
            <div class="focused-water-center-text">
              <span class="focused-pct">%${pct}</span>
              <span class="focused-status-sub">${pct >= 100 ? 'Hedef Tamamlandı! 🎉' : `${target - current} ml kaldı`}</span>
            </div>
          </div>
          <div class="focused-water-stats">
            <div class="stat-bubble">
              <span class="bubble-val">${current}</span>
              <span class="bubble-label">İçilen (ml)</span>
            </div>
            <div class="stat-bubble">
              <span class="bubble-val">${target}</span>
              <span class="bubble-label">Günlük Hedef</span>
            </div>
          </div>
        </div>

        <div class="focused-water-actions">
          <button class="btn-chip btn-f-water-add" data-add="100">+100 ml</button>
          <button class="btn-chip primary btn-f-water-add" data-add="250">+250 ml</button>
          <button class="btn-chip btn-f-water-add" data-add="500">+500 ml</button>
          <button class="btn-chip btn-f-water-add" data-add="750">+750 ml</button>
          <button class="btn-chip btn-f-water-reset">↺ Sıfırla</button>
        </div>
      </div>
    `;
  }

  templateFocusedPomodoro(data) {
    const timeLeft = data.timeLeft !== undefined ? data.timeLeft : 25 * 60;
    const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const secs = (timeLeft % 60).toString().padStart(2, '0');
    const isRunning = data.isRunning || false;
    const mode = data.mode || 'work';

    return `
      <div class="focused-pomodoro-view">
        <div class="pomo-modes">
          <button class="pomo-mode-btn ${mode === 'work' ? 'active' : ''}" data-mode="work">Odaklanma (25 dk)</button>
          <button class="pomo-mode-btn ${mode === 'shortBreak' ? 'active' : ''}" data-mode="shortBreak">Kısa Mola (5 dk)</button>
          <button class="pomo-mode-btn ${mode === 'longBreak' ? 'active' : ''}" data-mode="longBreak">Uzun Mola (15 dk)</button>
        </div>

        <div class="focused-timer-dial">
          <span class="focused-time-text">${mins}:${secs}</span>
          <span class="focused-pomo-badge">
            ${mode === 'work' ? '🧠 Derin Odak Zamanı' : '☕ Zihinsel Dinlenme'}
          </span>
          <div class="focused-pomo-sessions">
            Tamamlanan Seanslar: <strong>${data.completedSessions || 0}</strong> oturum
          </div>
        </div>

        <div class="focused-pomo-controls">
          <button class="btn-action f-pomo-toggle ${isRunning ? 'btn-pause' : 'btn-start'}">
            ${isRunning ? '⏸ Durdur' : '▶ Başlat'}
          </button>
          <button class="btn-chip f-pomo-reset">↺ Süreyi Sıfırla</button>
        </div>
      </div>
    `;
  }

  templateFocusedTasks(data) {
    const items = data.items || [];
    const doneCount = items.filter(t => t.done).length;
    const totalCount = items.length;
    const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

    return `
      <div class="focused-tasks-view">
        <div class="tasks-progress-bar">
          <div class="tasks-progress-fill" style="width: ${progress}%"></div>
        </div>
        <div class="tasks-stats">
          <span>İlerleme: %${progress}</span>
          <span>${doneCount} / ${totalCount} Görev Yapıldı</span>
        </div>

        <form class="focused-tasks-add-form">
          <input type="text" class="focused-tasks-input" placeholder="Yeni görev ekle ve Enter'a bas..." required autocomplete="off" />
          <button type="submit" class="btn-chip primary">+</button>
        </form>

        <ul class="focused-tasks-list">
          ${items.length === 0 ? `<li class="empty-state">Tüm görevler bitti! 🎉</li>` : ''}
          ${items.map(item => `
            <li class="task-item ${item.done ? 'done' : ''}" data-task-id="${item.id}">
              <label class="task-checkbox-label">
                <input type="checkbox" class="task-check" ${item.done ? 'checked' : ''} />
                <span class="task-custom-box"></span>
                <span class="task-text">${escapeHtml(item.text)}</span>
              </label>
              <button class="task-btn-delete" title="Görevi Sil">×</button>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  templateFocusedStreak(data) {
    const streak = data.currentStreak || 0;
    const habit = data.habitName || 'Günlük Hedef & Odak';
    const history = data.history || [true, true, true, true, true, false, true];

    return `
      <div class="focused-streak-view">
        <div class="focused-flame-hero">
          <span class="focused-flame-icon">🔥</span>
          <span class="focused-streak-num">${streak}</span>
          <span class="focused-streak-sub">GÜN KESİNTİSİZ ZİNCİR</span>
        </div>
        <div class="focused-habit-name">${escapeHtml(habit)}</div>

        <div class="focused-chain-track">
          <span class="chain-track-label">Son Günlerin Zincir Durumu:</span>
          <div class="chain-nodes">
            ${history.map((done, idx) => `
              <div class="chain-node ${done ? 'completed' : 'missed'}" title="${idx + 1}. Gün: ${done ? 'Yapıldı' : 'Boş'}">
                <span class="node-icon">${done ? '⛓️' : '○'}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <button class="btn-action f-streak-check-btn">
          ✨ Bugünkü Halkayı Kilitle & Ekle
        </button>
      </div>
    `;
  }

  templateFocusedNotes(data) {
    const content = data.content || '';
    return `
      <div class="focused-notes-view">
        <textarea class="focused-notes-textarea" placeholder="Düşüncelerini, hedeflerini veya notlarını buraya dök...">${escapeHtml(content)}</textarea>
        <div class="focused-notes-footer">
          <span class="f-notes-count">${content.length} karakter</span>
          <div class="notes-btns">
            <button class="btn-chip f-notes-copy">Panoya Kopyala</button>
            <button class="btn-chip f-notes-clear">Temizle</button>
          </div>
        </div>
      </div>
    `;
  }

  templateFocusedBreathing(data) {
    return `
      <div class="focused-breathing-view">
        <div class="focused-breathing-wrapper">
          <div class="breathing-orb focused-orb">
            <span class="breathing-instruction">Hazır</span>
          </div>
        </div>
        <div class="breathing-timer-sub">4s Nefes Al • 4s Tut • 4s Ver • 4s Dinlen</div>
        <button class="btn-action f-breathing-toggle">Egzersizi Başlat</button>
      </div>
    `;
  }

  templateFocusedMood(data) {
    const curMood = data.todayMood || 'calm';
    const energy = data.energyLevel || 8;
    const moods = [
      { id: 'great', icon: '🤩', label: 'Harika' },
      { id: 'energetic', icon: '⚡', label: 'Enerjik' },
      { id: 'calm', icon: '🧘', label: 'Sakin' },
      { id: 'tired', icon: '🥱', label: 'Yorgun' },
      { id: 'low', icon: '🌧️', label: 'Düşük' }
    ];

    return `
      <div class="focused-mood-view">
        <div class="mood-selector">
          ${moods.map(m => `
            <button class="mood-btn ${curMood === m.id ? 'active' : ''}" data-mood="${m.id}" title="${m.label}">
              <span class="mood-icon">${m.icon}</span>
              <span class="mood-name">${m.label}</span>
            </button>
          `).join('')}
        </div>
        <div class="mood-energy">
          <label>Enerji Seviyesi: <strong class="energy-val">${energy}</strong>/10</label>
          <input type="range" class="energy-slider" min="1" max="10" value="${energy}" />
        </div>
        <div class="focused-reflection-box">
          <input type="text" class="f-reflection-input" placeholder="Günün kısa hissi..." value="${escapeHtml(data.reflection || '')}" />
        </div>
      </div>
    `;
  }

  templateFocusedAmbient(data) {
    const isPlaying = this.sound.ambientSource !== null;
    const curType = this.sound.currentAmbient;

    return `
      <div class="focused-ambient-view">
        <div class="ambient-presets">
          <button class="btn-chip ambient-btn ${curType === 'rain' ? 'active' : ''}" data-ambient="rain">🌧️ Yağmur Sesi</button>
          <button class="btn-chip ambient-btn ${curType === 'focus' ? 'active' : ''}" data-ambient="focus">🧠 Pembe Gürültü</button>
          <button class="btn-chip ambient-btn ${curType === 'drone' ? 'active' : ''}" data-ambient="drone">🌌 Derin Uzay</button>
        </div>
        <div class="focused-ambient-visual">
          ${isPlaying ? `<div class="sound-wave-anim">♪ Sentezlenmiş Ses Dalgaları Çalıyor...</div>` : '<div class="sound-wave-muted">Sessiz</div>'}
        </div>
        ${isPlaying ? `<button class="btn-action ambient-stop">⏹ Sesi Durdur</button>` : ''}
      </div>
    `;
  }

  templateFocusedBigOne(data) {
    const goal = data.goal || 'Önemli web arayüzünü tamamla';
    const isCompleted = data.isCompleted || false;

    return `
      <div class="focused-bigone-view ${isCompleted ? 'completed' : ''}">
        <div class="bigone-badge">#1 GÜNÜN KRİTİK ODAĞI</div>
        <div class="focused-bigone-title">${escapeHtml(goal)}</div>
        <button class="btn-action f-bigone-toggle-btn">
          ${isCompleted ? '✓ Tamamlandı!' : 'Bu Hedefi Tamamla'}
        </button>
      </div>
    `;
  }

  templateFocusedBudget(data) {
    const limit = data.limit || 500;
    const spent = data.spent || 0;
    const remaining = Math.max(0, limit - spent);
    const pct = Math.min(100, Math.round((spent / limit) * 100));

    return `
      <div class="focused-budget-view">
        <div class="focused-budget-hero">
          <span class="f-budget-num">${remaining} ₺</span>
          <span class="f-budget-sub">Kalan Günlük Bütçe</span>
        </div>
        <div class="tasks-progress-bar">
          <div class="tasks-progress-fill" style="width: ${pct}%; background: ${pct > 80 ? '#f43f5e' : '#14b8a6'}"></div>
        </div>
        <div class="tasks-stats">
          <span>Harcanan: ${spent} ₺</span>
          <span>Limit: ${limit} ₺</span>
        </div>
        <form class="focused-budget-add-form">
          <input type="number" class="budget-input" placeholder="Harcama tutarı (₺)" required />
          <button type="submit" class="btn-chip primary">+</button>
        </form>
      </div>
    `;
  }

  bindFocusedWidgetEvents(containerEl, id) {
    // Water
    if (id === 'water') {
      containerEl.querySelectorAll('.btn-f-water-add').forEach(btn => {
        btn.addEventListener('click', () => {
          const addAmount = parseInt(btn.dataset.add, 10);
          const data = this.storage.getWidgetData('water');
          const nextCurrent = (data.current || 0) + addAmount;
          this.storage.updateWidgetData('water', { current: nextCurrent });
          this.sound.playWaterDrop();
          this.renderFocusedWidget('water', containerEl);
          this.onStateChange({ type: 'update', widgetId: 'water' });
        });
      });
      const resetBtn = containerEl.querySelector('.btn-f-water-reset');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.storage.updateWidgetData('water', { current: 0 });
          this.sound.playClick();
          this.renderFocusedWidget('water', containerEl);
          this.onStateChange({ type: 'update', widgetId: 'water' });
        });
      }
    }

    // Pomodoro
    if (id === 'pomodoro') {
      const toggleBtn = containerEl.querySelector('.f-pomo-toggle');
      const resetBtn = containerEl.querySelector('.f-pomo-reset');
      const modeBtns = containerEl.querySelectorAll('.pomo-mode-btn');

      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
          const data = this.storage.getWidgetData('pomodoro');
          const isRunning = !data.isRunning;
          this.sound.playClick();
          this.storage.updateWidgetData('pomodoro', { isRunning });

          if (isRunning) {
            this.startFocusedPomodoroInterval(containerEl);
          } else {
            this.stopPomodoroInterval();
          }
          this.renderFocusedWidget('pomodoro', containerEl);
        });
      }

      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.stopPomodoroInterval();
          const data = this.storage.getWidgetData('pomodoro');
          let defaultTime = 25 * 60;
          if (data.mode === 'shortBreak') defaultTime = 5 * 60;
          if (data.mode === 'longBreak') defaultTime = 15 * 60;
          this.storage.updateWidgetData('pomodoro', { timeLeft: defaultTime, isRunning: false });
          this.sound.playClick();
          this.renderFocusedWidget('pomodoro', containerEl);
        });
      }

      modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          this.stopPomodoroInterval();
          const mode = btn.dataset.mode;
          let time = 25 * 60;
          if (mode === 'shortBreak') time = 5 * 60;
          if (mode === 'longBreak') time = 15 * 60;

          this.storage.updateWidgetData('pomodoro', { mode, timeLeft: time, isRunning: false });
          this.sound.playClick();
          this.renderFocusedWidget('pomodoro', containerEl);
        });
      });

      const data = this.storage.getWidgetData('pomodoro');
      if (data.isRunning && !this.pomodoroTimerId) {
        this.startFocusedPomodoroInterval(containerEl);
      }
    }

    // Tasks
    if (id === 'tasks') {
      const form = containerEl.querySelector('.focused-tasks-add-form');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const input = form.querySelector('.focused-tasks-input');
          const text = input.value.trim();
          if (!text) return;

          const data = this.storage.getWidgetData('tasks');
          const items = data.items || [];
          items.unshift({ id: 't_' + Date.now(), text, done: false, priority: 'normal' });
          this.storage.updateWidgetData('tasks', { items });
          this.sound.playClick();
          input.value = '';
          this.renderFocusedWidget('tasks', containerEl);
          this.onStateChange({ type: 'update', widgetId: 'tasks' });
        });
      }

      containerEl.querySelectorAll('.task-item').forEach(itemEl => {
        const taskId = itemEl.dataset.taskId;
        const check = itemEl.querySelector('.task-check');
        const delBtn = itemEl.querySelector('.task-btn-delete');

        if (check) {
          check.addEventListener('change', () => {
            const data = this.storage.getWidgetData('tasks');
            const items = (data.items || []).map(t => t.id === taskId ? { ...t, done: check.checked } : t);
            this.storage.updateWidgetData('tasks', { items });
            if (check.checked) this.sound.playSuccess(); else this.sound.playClick();
            this.renderFocusedWidget('tasks', containerEl);
            this.onStateChange({ type: 'update', widgetId: 'tasks' });
          });
        }

        if (delBtn) {
          delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const data = this.storage.getWidgetData('tasks');
            const items = (data.items || []).filter(t => t.id !== taskId);
            this.storage.updateWidgetData('tasks', { items });
            this.sound.playDelete();
            this.renderFocusedWidget('tasks', containerEl);
            this.onStateChange({ type: 'update', widgetId: 'tasks' });
          });
        }
      });
    }

    // Streak
    if (id === 'streak') {
      const btn = containerEl.querySelector('.f-streak-check-btn');
      if (btn) {
        btn.addEventListener('click', () => {
          const data = this.storage.getWidgetData('streak');
          const nextStreak = (data.currentStreak || 0) + 1;
          const history = [...(data.history || [true, true, true, true, true, false, true])];
          history.shift();
          history.push(true);

          this.storage.updateWidgetData('streak', {
            currentStreak: nextStreak,
            history: history,
            lastCheckedDate: new Date().toISOString().split('T')[0]
          });
          this.sound.playChainPulse();
          this.renderFocusedWidget('streak', containerEl);
          this.onStateChange({ type: 'update', widgetId: 'streak' });
        });
      }
    }

    // Notes
    if (id === 'notes') {
      const textarea = containerEl.querySelector('.focused-notes-textarea');
      const copyBtn = containerEl.querySelector('.f-notes-copy');
      const clearBtn = containerEl.querySelector('.f-notes-clear');
      const countSpan = containerEl.querySelector('.f-notes-count');

      if (textarea) {
        textarea.addEventListener('input', () => {
          this.storage.updateWidgetData('notes', { content: textarea.value });
          if (countSpan) countSpan.textContent = `${textarea.value.length} karakter`;
        });
      }
      if (copyBtn && textarea) {
        copyBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(textarea.value);
          this.sound.playClick();
          copyBtn.textContent = 'Kopyalandı!';
          setTimeout(() => copyBtn.textContent = 'Panoya Kopyala', 1500);
        });
      }
      if (clearBtn && textarea) {
        clearBtn.addEventListener('click', () => {
          if (confirm('Notu temizlemek istediğinden emin misin?')) {
            textarea.value = '';
            this.storage.updateWidgetData('notes', { content: '' });
            if (countSpan) countSpan.textContent = '0 karakter';
          }
        });
      }
    }

    // Breathing
    if (id === 'breathing') {
      const toggleBtn = containerEl.querySelector('.f-breathing-toggle');
      const orb = containerEl.querySelector('.focused-orb');
      const text = containerEl.querySelector('.breathing-instruction');

      let isRunning = false;
      let step = 0;
      const steps = [
        { label: 'Nefes Al (4s)', class: 'inhale' },
        { label: 'Tut (4s)', class: 'hold' },
        { label: 'Nefes Ver (4s)', class: 'exhale' },
        { label: 'Dinlen (4s)', class: 'rest' }
      ];

      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
          isRunning = !isRunning;
          this.sound.playClick();

          if (isRunning) {
            toggleBtn.textContent = 'Durdur';
            runCycle();
            this.breathingTimerId = setInterval(runCycle, 4000);
          } else {
            toggleBtn.textContent = 'Egzersizi Başlat';
            clearInterval(this.breathingTimerId);
            if (orb) orb.className = 'breathing-orb focused-orb';
            if (text) text.textContent = 'Hazır';
          }
        });
      }

      const runCycle = () => {
        if (!orb || !text) return;
        const cur = steps[step];
        text.textContent = cur.label;
        orb.className = `breathing-orb focused-orb ${cur.class}`;
        step = (step + 1) % steps.length;
      };
    }

    // Mood
    if (id === 'mood') {
      containerEl.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const moodId = btn.dataset.mood;
          this.storage.updateWidgetData('mood', { todayMood: moodId });
          this.sound.playClick();
          this.renderFocusedWidget('mood', containerEl);
          this.onStateChange({ type: 'update', widgetId: 'mood' });
        });
      });
      const slider = containerEl.querySelector('.energy-slider');
      const valText = containerEl.querySelector('.energy-val');
      if (slider) {
        slider.addEventListener('input', () => {
          if (valText) valText.textContent = slider.value;
          this.storage.updateWidgetData('mood', { energyLevel: parseInt(slider.value, 10) });
        });
      }
      const refInput = containerEl.querySelector('.f-reflection-input');
      if (refInput) {
        refInput.addEventListener('change', () => {
          this.storage.updateWidgetData('mood', { reflection: refInput.value });
        });
      }
    }

    // Ambient
    if (id === 'ambient') {
      containerEl.querySelectorAll('.ambient-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const type = btn.dataset.ambient;
          this.sound.toggleAmbient(type);
          this.renderFocusedWidget('ambient', containerEl);
        });
      });
      const stopBtn = containerEl.querySelector('.ambient-stop');
      if (stopBtn) {
        stopBtn.addEventListener('click', () => {
          this.sound.stopAmbient();
          this.renderFocusedWidget('ambient', containerEl);
        });
      }
    }

    // Big One
    if (id === 'bigOne') {
      const btn = containerEl.querySelector('.f-bigone-toggle-btn');
      if (btn) {
        btn.addEventListener('click', () => {
          const data = this.storage.getWidgetData('bigOne');
          const nextState = !data.isCompleted;
          this.storage.updateWidgetData('bigOne', { isCompleted: nextState });
          if (nextState) this.sound.playSuccess(); else this.sound.playClick();
          this.renderFocusedWidget('bigOne', containerEl);
          this.onStateChange({ type: 'update', widgetId: 'bigOne' });
        });
      }
    }

    // Budget
    if (id === 'budget') {
      const form = containerEl.querySelector('.focused-budget-add-form');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const input = form.querySelector('.budget-input');
          const val = parseFloat(input.value);
          if (isNaN(val) || val <= 0) return;
          const data = this.storage.getWidgetData('budget');
          const nextSpent = (data.spent || 0) + val;
          this.storage.updateWidgetData('budget', { spent: nextSpent });
          this.sound.playClick();
          input.value = '';
          this.renderFocusedWidget('budget', containerEl);
          this.onStateChange({ type: 'update', widgetId: 'budget' });
        });
      }
    }
  }

  startFocusedPomodoroInterval(containerEl) {
    this.stopPomodoroInterval();
    this.pomodoroTimerId = setInterval(() => {
      const data = this.storage.getWidgetData('pomodoro');
      if (data.timeLeft > 0) {
        this.storage.updateWidgetData('pomodoro', { timeLeft: data.timeLeft - 1 });
        const timeDisplay = containerEl.querySelector('.focused-time-text');
        if (timeDisplay) {
          const mins = Math.floor((data.timeLeft - 1) / 60).toString().padStart(2, '0');
          const secs = ((data.timeLeft - 1) % 60).toString().padStart(2, '0');
          timeDisplay.textContent = `${mins}:${secs}`;
        }
      } else {
        this.stopPomodoroInterval();
        this.sound.playChime();
        const nextSessions = (data.completedSessions || 0) + (data.mode === 'work' ? 1 : 0);
        this.storage.updateWidgetData('pomodoro', {
          isRunning: false,
          completedSessions: nextSessions,
          timeLeft: data.mode === 'work' ? 5 * 60 : 25 * 60,
          mode: data.mode === 'work' ? 'shortBreak' : 'work'
        });
        this.renderFocusedWidget('pomodoro', containerEl);
        this.onStateChange({ type: 'update', widgetId: 'pomodoro' });
      }
    }, 1000);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}
