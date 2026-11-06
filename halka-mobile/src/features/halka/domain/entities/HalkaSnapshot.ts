// Uygulamanın tüm kalıcı durumunun anlık görüntüsü
import type { BigOne } from '@features/halka/domain/entities/BigOne';
import type { Budget } from '@features/halka/domain/entities/Budget';
import type { Mood } from '@features/halka/domain/entities/Mood';
import type { Note } from '@features/halka/domain/entities/Note';
import type { Pomodoro } from '@features/halka/domain/entities/Pomodoro';
import type { Profile } from '@features/halka/domain/entities/Profile';
import type { Streak } from '@features/halka/domain/entities/Streak';
import type { TaskList } from '@features/halka/domain/entities/Task';
import type { Water } from '@features/halka/domain/entities/Water';
import type { WidgetId } from '@features/halka/domain/entities/WidgetId';

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
