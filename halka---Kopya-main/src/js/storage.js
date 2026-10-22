// LocalStorage Management and State Store for Halka OS

const STORAGE_KEY = 'halka_life_os_data_v1';

const DEFAULT_DATA = {
  profile: {
    name: 'Kullanıcı',
    title: 'Kişisel Hayat Yöneticisi',
    theme: 'cyber-cyan', // 'cyber-cyan' | 'neon-violet' | 'gold-chain' | 'emerald-zen'
    viewMode: 'orbital', // 'orbital' | 'grid'
    soundEnabled: true,
    lastActiveDate: new Date().toISOString().split('T')[0]
  },
  // Active widget IDs in display order around the ring
  activeWidgetIds: ['water', 'pomodoro', 'tasks', 'streak'],
  widgetsData: {
    water: {
      current: 1250,
      target: 2500,
      step: 250,
      history: []
    },
    pomodoro: {
      mode: 'work', // 'work' | 'shortBreak' | 'longBreak'
      timeLeft: 25 * 60,
      isRunning: false,
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      completedSessions: 2
    },
    tasks: {
      items: [
        { id: 't1', text: 'Halka sistemini kişiselleştir', done: true, priority: 'high' },
        { id: 't2', text: 'Önemli projeye 45 dakika odaklan', done: false, priority: 'high' },
        { id: 't3', text: 'Kitap oku ve not al (20 dk)', done: false, priority: 'normal' }
      ]
    },
    streak: {
      habitName: 'Günlük Odak & Gelişim',
      currentStreak: 5,
      bestStreak: 14,
      lastCheckedDate: new Date().toISOString().split('T')[0],
      history: [true, true, true, true, true, false, true]
    },
    notes: {
      content: '📌 Bugünün İlhamı: "Küçük adımların zinciri, büyük dönüşümlerin halkasıdır."\n- Odaklanmayı dağıtan bildirimleri kapat.\n- Akşam yürüyüşü yap.'
    },
    breathing: {
      cyclesCompleted: 3,
      currentPhase: 'idle'
    },
    mood: {
      todayMood: 'energetic', // 'great', 'energetic', 'calm', 'tired', 'low'
      energyLevel: 8,
      reflection: 'Enerjim yerinde, zihnim berrak.'
    },
    ambient: {
      soundType: 'none',
      volume: 0.5
    },
    bigOne: {
      goal: 'Önemli web arayüzünü tamamla',
      isCompleted: false,
      category: 'Kariyer'
    },
    budget: {
      limit: 500,
      spent: 120,
      items: [
        { id: 'b1', name: 'Kahve & Atıştırmalık', amount: 120 }
      ]
    }
  }
};

export class StorageManager {
  constructor() {
    this.data = this.load();
    this.checkDailyReset();
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          ...DEFAULT_DATA,
          ...parsed,
          profile: { ...DEFAULT_DATA.profile, ...(parsed.profile || {}) },
          widgetsData: { ...DEFAULT_DATA.widgetsData, ...(parsed.widgetsData || {}) }
        };
      }
    } catch (e) {
      console.warn('Halka: Storage read failed, falling back to defaults', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Halka: Storage save error', e);
    }
  }

  checkDailyReset() {
    const today = new Date().toISOString().split('T')[0];
    if (this.data.profile.lastActiveDate !== today) {
      // New day: keep streak logic, reset daily counters if needed
      this.data.profile.lastActiveDate = today;
      // Reset water for new day if needed, or prompt
      this.save();
    }
  }

  getProfile() {
    return this.data.profile;
  }

  updateProfile(updates) {
    this.data.profile = { ...this.data.profile, ...updates };
    this.save();
  }

  getActiveWidgetIds() {
    return this.data.activeWidgetIds;
  }

  addWidget(id) {
    if (!this.data.activeWidgetIds.includes(id)) {
      this.data.activeWidgetIds.push(id);
      this.save();
      return true;
    }
    return false;
  }

  removeWidget(id) {
    this.data.activeWidgetIds = this.data.activeWidgetIds.filter(item => item !== id);
    this.save();
  }

  reorderWidgets(newOrder) {
    this.data.activeWidgetIds = newOrder;
    this.save();
  }

  getWidgetData(id) {
    return this.data.widgetsData[id] || {};
  }

  updateWidgetData(id, partialData) {
    this.data.widgetsData[id] = {
      ...(this.data.widgetsData[id] || {}),
      ...partialData
    };
    this.save();
  }

  resetAll() {
    this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    this.save();
  }
}

export const storage = new StorageManager();
