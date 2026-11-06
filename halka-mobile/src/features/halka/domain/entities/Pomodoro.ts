// Pomodoro zamanlayıcısı
// Not: Çalışırken kalan süre yerine bitiş zamanı (endsAt) tutulur;
// böylece uygulama arka plana düşse bile süre kaymaz.

export type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';

export const POMODORO_MODES: readonly PomodoroMode[] = ['work', 'shortBreak', 'longBreak'];

// Süreler dakika cinsindendir
export interface PomodoroDurations {
  readonly work: number;
  readonly shortBreak: number;
  readonly longBreak: number;
}

export interface Pomodoro {
  readonly mode: PomodoroMode;
  readonly durations: PomodoroDurations;
  // Duraklatılmışken kalan süre (saniye)
  readonly remainingSeconds: number;
  // Çalışıyorsa bitiş zamanı (epoch ms), değilse null
  readonly endsAt: number | null;
  readonly completedSessions: number;
}

export const DEFAULT_POMODORO_DURATIONS: PomodoroDurations = {
  work: 25,
  shortBreak: 5,
  longBreak: 15,
};

// Kaç odak seansından sonra uzun mola verilir
export const SESSIONS_BEFORE_LONG_BREAK = 4;

export function getModeDurationSeconds(pomodoro: Pomodoro, mode: PomodoroMode): number {
  return pomodoro.durations[mode] * 60;
}

export function isPomodoroRunning(pomodoro: Pomodoro): boolean {
  return pomodoro.endsAt !== null;
}

export function getRemainingSeconds(pomodoro: Pomodoro, nowMs: number): number {
  if (pomodoro.endsAt === null) return pomodoro.remainingSeconds;
  return Math.max(0, Math.ceil((pomodoro.endsAt - nowMs) / 1000));
}

export function isPomodoroFinished(pomodoro: Pomodoro, nowMs: number): boolean {
  return isPomodoroRunning(pomodoro) && getRemainingSeconds(pomodoro, nowMs) <= 0;
}
