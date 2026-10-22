// Eklenti kimliğine göre doğru gövdeyi seçer
import type { WidgetId } from '@domain/entities/WidgetId';
import { AmbientWidget } from '@presentation/components/widgets/ambient/AmbientWidget';
import { BigOneWidget } from '@presentation/components/widgets/bigOne/BigOneWidget';
import { BreathingWidget } from '@presentation/components/widgets/breathing/BreathingWidget';
import { BudgetWidget } from '@presentation/components/widgets/budget/BudgetWidget';
import { MoodWidget } from '@presentation/components/widgets/mood/MoodWidget';
import { NotesWidget } from '@presentation/components/widgets/notes/NotesWidget';
import { PomodoroWidget } from '@presentation/components/widgets/pomodoro/PomodoroWidget';
import { StreakWidget } from '@presentation/components/widgets/streak/StreakWidget';
import { TasksWidget } from '@presentation/components/widgets/tasks/TasksWidget';
import type { WidgetVariant } from '@presentation/components/widgets/types';
import { WaterWidget } from '@presentation/components/widgets/water/WaterWidget';

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
