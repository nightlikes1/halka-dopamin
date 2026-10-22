// Odak ekranı ViewModel'i (klasik ve parçacık görünümü ortak): mevcut Pomodoro use-case'lerine
// bağlı; yeni sayaç mantığı yoktur, yalnızca görünümün ihtiyaç duyduğu türetilmiş değerler.
import { strings } from '@core/i18n/tr';
import { padTwo } from '@core/utils/date';
import {
  getModeDurationSeconds,
  SESSIONS_BEFORE_LONG_BREAK,
  type PomodoroMode,
} from '@domain/entities/Pomodoro';
import { useBigOne } from '@presentation/hooks/useBigOne';
import { usePomodoro } from '@presentation/hooks/usePomodoro';
import { useProfile } from '@presentation/hooks/useProfile';
import { useTasks } from '@presentation/hooks/useTasks';

const t = strings.focus;

export const formatTime = (seconds: number) =>
  `${padTwo(Math.floor(seconds / 60))}:${padTwo(seconds % 60)}`;

// "Atla": odaktan sonra kısa ya da (her 4 seansta) uzun mola, moladan sonra odak
export function nextMode(mode: PomodoroMode, completedSessions: number): PomodoroMode {
  if (mode !== 'work') return 'work';
  return (completedSessions + 1) % SESSIONS_BEFORE_LONG_BREAK === 0 ? 'longBreak' : 'shortBreak';
}

export function useFocusSession() {
  const { pomodoro, isRunning, remainingSeconds, toggle, reset, changeMode } = usePomodoro();
  const { profile, toggleSound } = useProfile();
  const { bigOne } = useBigOne();
  const { items: tasks } = useTasks();

  const total = getModeDurationSeconds(pomodoro, pomodoro.mode);
  const paused = !isRunning && remainingSeconds < total;
  const sessionNumber = Math.min(
    (pomodoro.completedSessions % SESSIONS_BEFORE_LONG_BREAK) + 1,
    SESSIONS_BEFORE_LONG_BREAK,
  );
  const status = paused
    ? t.paused
    : pomodoro.mode === 'work'
      ? t.sessionOf(sessionNumber, SESSIONS_BEFORE_LONG_BREAK)
      : t.breakTime;

  const task =
    (bigOne.goal.trim() && !bigOne.isCompleted ? bigOne.goal.trim() : null) ??
    tasks.find((item) => !item.done)?.text ??
    null;

  const focusMinutes = pomodoro.completedSessions * pomodoro.durations.work;
  const goalPct = Math.min(
    100,
    Math.round((pomodoro.completedSessions / SESSIONS_BEFORE_LONG_BREAK) * 100),
  );

  return {
    pomodoro,
    isRunning,
    remainingSeconds,
    total,
    status,
    task,
    focusMinutes,
    goalPct,
    soundEnabled: profile.soundEnabled,
    toggle,
    reset,
    changeMode,
    toggleSound,
    skip: () => changeMode(nextMode(pomodoro.mode, pomodoro.completedSessions)),
  };
}
