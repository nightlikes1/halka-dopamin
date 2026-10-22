// Pomodoro durum geçişleri (saf fonksiyonlar)
import {
  getModeDurationSeconds,
  getRemainingSeconds,
  SESSIONS_BEFORE_LONG_BREAK,
  type Pomodoro,
  type PomodoroMode,
} from '@domain/entities/Pomodoro';

export function startPomodoro(pomodoro: Pomodoro, nowMs: number): Pomodoro {
  if (pomodoro.endsAt !== null) return pomodoro;
  return { ...pomodoro, endsAt: nowMs + pomodoro.remainingSeconds * 1000 };
}

export function pausePomodoro(pomodoro: Pomodoro, nowMs: number): Pomodoro {
  if (pomodoro.endsAt === null) return pomodoro;
  return { ...pomodoro, remainingSeconds: getRemainingSeconds(pomodoro, nowMs), endsAt: null };
}

export function resetPomodoro(pomodoro: Pomodoro): Pomodoro {
  return {
    ...pomodoro,
    remainingSeconds: getModeDurationSeconds(pomodoro, pomodoro.mode),
    endsAt: null,
  };
}

export function switchPomodoroMode(pomodoro: Pomodoro, mode: PomodoroMode): Pomodoro {
  return {
    ...pomodoro,
    mode,
    remainingSeconds: getModeDurationSeconds(pomodoro, mode),
    endsAt: null,
  };
}

// Seans bitince: odak -> kısa/uzun mola, mola -> odak
export function completePomodoroSession(pomodoro: Pomodoro): Pomodoro {
  if (pomodoro.mode === 'work') {
    const completedSessions = pomodoro.completedSessions + 1;
    const nextMode: PomodoroMode =
      completedSessions % SESSIONS_BEFORE_LONG_BREAK === 0 ? 'longBreak' : 'shortBreak';
    return { ...switchPomodoroMode(pomodoro, nextMode), completedSessions };
  }
  return switchPomodoroMode(pomodoro, 'work');
}
