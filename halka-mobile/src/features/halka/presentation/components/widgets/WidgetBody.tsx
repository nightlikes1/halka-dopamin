// Eklenti kimliğine göre doğru gövdeyi seçer
import type { WidgetId } from '@features/halka/domain/entities/WidgetId';
import { AmbientWidget } from '@features/halka/presentation/components/widgets/ambient/AmbientWidget';
import { BigOneWidget } from '@features/halka/presentation/components/widgets/bigOne/BigOneWidget';
import { BreathingWidget } from '@features/halka/presentation/components/widgets/breathing/BreathingWidget';
import { BudgetWidget } from '@features/halka/presentation/components/widgets/budget/BudgetWidget';
import { MoodWidget } from '@features/halka/presentation/components/widgets/mood/MoodWidget';
import { NotesWidget } from '@features/halka/presentation/components/widgets/notes/NotesWidget';
import { PomodoroWidget } from '@features/halka/presentation/components/widgets/pomodoro/PomodoroWidget';
import { StreakWidget } from '@features/halka/presentation/components/widgets/streak/StreakWidget';
import { TasksWidget } from '@features/halka/presentation/components/widgets/tasks/TasksWidget';
import type { WidgetVariant } from '@features/halka/presentation/components/widgets/types';
import { WaterWidget } from '@features/halka/presentation/components/widgets/water/WaterWidget';

interface WidgetBodyProps {
  readonly id: WidgetId;
  readonly variant: WidgetVariant;
}

export function WidgetBody({ id, variant }: WidgetBodyProps) {
  switch (id) {
    case 'water':
      return <WaterWidget variant={variant} />;
    case 'pomodoro':
      return <PomodoroWidget variant={variant} />;
    case 'tasks':
      return <TasksWidget variant={variant} />;
    case 'streak':
      return <StreakWidget variant={variant} />;
    case 'notes':
      return <NotesWidget variant={variant} />;
    case 'breathing':
      return <BreathingWidget variant={variant} />;
    case 'mood':
      return <MoodWidget variant={variant} />;
    case 'ambient':
      return <AmbientWidget variant={variant} />;
    case 'bigOne':
      return <BigOneWidget variant={variant} />;
    case 'budget':
      return <BudgetWidget variant={variant} />;
    default: {
      // Yeni bir WidgetId eklenip burası unutulursa derleme hatası verir
      const unreachable: never = id;
      return unreachable;
    }
  }
}
