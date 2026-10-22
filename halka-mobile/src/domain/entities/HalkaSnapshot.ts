// Uygulamanın tüm kalıcı durumunun anlık görüntüsü
import type { BigOne } from '@domain/entities/BigOne';
import type { Budget } from '@domain/entities/Budget';
import type { Mood } from '@domain/entities/Mood';
import type { Note } from '@domain/entities/Note';
import type { Pomodoro } from '@domain/entities/Pomodoro';
import type { Profile } from '@domain/entities/Profile';
import type { Streak } from '@domain/entities/Streak';
import type { TaskList } from '@domain/entities/Task';
import type { Water } from '@domain/entities/Water';
import type { WidgetId } from '@domain/entities/WidgetId';

export interface HalkaSnapshot {
  readonly profile: Profile;
  readonly activeWidgetIds: readonly WidgetId[];
  readonly water: Water;
  readonly pomodoro: Pomodoro;
  readonly tasks: TaskList;
  readonly streak: Streak;
  readonly notes: Note;
  readonly mood: Mood;
  readonly bigOne: BigOne;
  readonly budget: Budget;
}
