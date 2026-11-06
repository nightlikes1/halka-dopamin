// Küçültülmüş kart başlığında gösterilen kısa özet
import { toIsoDate } from '@core/utils/date';
import { formatCurrency, formatMinutesSeconds } from '@core/utils/format';
import type { AmbientType } from '@features/halka/domain/entities/Audio';
import { getBudgetSummary } from '@features/halka/domain/entities/Budget';
import type { HalkaSnapshot } from '@features/halka/domain/entities/HalkaSnapshot';
import { getMoodOption } from '@features/halka/domain/entities/Mood';
import { getRemainingSeconds } from '@features/halka/domain/entities/Pomodoro';
import { getCurrentStreak } from '@features/halka/domain/entities/Streak';
import { getTaskProgress } from '@features/halka/domain/entities/Task';
import type { WidgetId } from '@features/halka/domain/entities/WidgetId';

interface SummaryContext {
  readonly snapshot: HalkaSnapshot;
  readonly now: Date;
  readonly currentAmbient: AmbientType | null;
}

export function getWidgetSummary(id: WidgetId, { snapshot, now, currentAmbient }: SummaryContext) {
  switch (id) {
    case 'water':
      return `${snapshot.water.current} ml`;
    case 'pomodoro':
      return formatMinutesSeconds(getRemainingSeconds(snapshot.pomodoro, now.getTime()));
    case 'tasks': {
      const { done, total } = getTaskProgress(snapshot.tasks);
      return `${done}/${total}`;
    }
    case 'streak':
      return `${getCurrentStreak(snapshot.streak, toIsoDate(now))} gün`;
    case 'notes': {
      const length = snapshot.notes.content.length;
      return length > 0 ? `${length} harf` : 'Not';
    }
    case 'breathing':
      return 'Zen';
    case 'mood':
      return getMoodOption(snapshot.mood.todayMood).icon;
    case 'ambient':
      return currentAmbient ? 'Çalıyor' : 'Sessiz';
    case 'bigOne':
      return snapshot.bigOne.isCompleted ? '✓ Bitti' : 'Hedef';
    case 'budget':
      return formatCurrency(getBudgetSummary(snapshot.budget).remaining);
    default: {
      const unreachable: never = id;
      return unreachable;
    }
  }
}
