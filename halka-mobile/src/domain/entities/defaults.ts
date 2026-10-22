// İlk kurulumda kullanılan varsayılan (örnek) veriler — web sürümüyle aynı içerik
import { addDays } from '@core/utils/date';
import { BUDGET_DEFAULT_LIMIT } from '@domain/entities/Budget';
import type { HalkaSnapshot } from '@domain/entities/HalkaSnapshot';
import { PROFILE_DEFAULT_NAME } from '@domain/entities/Profile';
import { DEFAULT_POMODORO_DURATIONS } from '@domain/entities/Pomodoro';
import { WATER_DEFAULT_TARGET } from '@domain/entities/Water';

export function createDefaultSnapshot(today: string): HalkaSnapshot {
  return {
    profile: {
      name: PROFILE_DEFAULT_NAME,
      title: 'Kişisel Hayat Yöneticisi',
      viewMode: 'cockpit',
      soundEnabled: true,
      lastActiveDate: today,
    },
    activeWidgetIds: ['water', 'pomodoro', 'tasks', 'streak'],
    water: { current: 1250, target: WATER_DEFAULT_TARGET },
    pomodoro: {
      mode: 'work',
      durations: DEFAULT_POMODORO_DURATIONS,
      remainingSeconds: DEFAULT_POMODORO_DURATIONS.work * 60,
      endsAt: null,
      completedSessions: 2,
    },
    tasks: {
      items: [
        { id: 't1', text: 'Halka sistemini kişiselleştir', done: true, priority: 'high' },
        { id: 't2', text: 'Önemli projeye 45 dakika odaklan', done: false, priority: 'high' },
        { id: 't3', text: 'Kitap oku ve not al (20 dk)', done: false, priority: 'normal' },
      ],
    },
    streak: {
      habitName: 'Günlük Odak & Gelişim',
      bestStreak: 14,
      // Dünden geriye 5 günlük seri
      checkedDates: [5, 4, 3, 2, 1].map((offset) => addDays(today, -offset)),
    },
    notes: {
      content:
        '📌 Bugünün İlhamı: "Küçük adımların zinciri, büyük dönüşümlerin halkasıdır."\n- Odaklanmayı dağıtan bildirimleri kapat.\n- Akşam yürüyüşü yap.',
    },
    mood: {
      todayMood: 'energetic',
      energyLevel: 8,
      reflection: 'Enerjim yerinde, zihnim berrak.',
    },
    bigOne: {
      goal: 'Önemli web arayüzünü tamamla',
      isCompleted: false,
      category: 'Kariyer',
    },
    budget: {
      limit: BUDGET_DEFAULT_LIMIT,
      expenses: [
        {
          id: 'b1',
          label: 'Kahve & Atıştırmalık',
          amount: 120,
          createdAt: `${today}T09:00:00.000Z`,
        },
      ],
    },
  };
}
