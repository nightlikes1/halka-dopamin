// Pomodoro DTO <-> Entity
import type { PomodoroDto } from '@data/dto/HalkaStorageDto';
import type { Mapper } from '@data/mappers/Mapper';
import {
  DEFAULT_POMODORO_DURATIONS,
  POMODORO_MODES,
  type Pomodoro,
  type PomodoroMode,
} from '@domain/entities/Pomodoro';

const toMode = (value: string): PomodoroMode =>
  POMODORO_MODES.find((mode) => mode === value) ?? 'work';

const positiveOr = (value: number, fallback: number): number => (value > 0 ? value : fallback);

export const pomodoroMapper: Mapper<PomodoroDto, Pomodoro> = {
  toEntity: (dto) => ({
    mode: toMode(dto.mode),
    durations: {
      work: positiveOr(dto.workMinutes, DEFAULT_POMODORO_DURATIONS.work),
      shortBreak: positiveOr(dto.shortBreakMinutes, DEFAULT_POMODORO_DURATIONS.shortBreak),
      longBreak: positiveOr(dto.longBreakMinutes, DEFAULT_POMODORO_DURATIONS.longBreak),
    },
    remainingSeconds: Math.max(0, Math.round(dto.remainingSeconds)),
    endsAt: dto.endsAtMs,
    completedSessions: Math.max(0, Math.round(dto.completedSessions)),
  }),
  toDto: (entity) => ({
    mode: entity.mode,
    workMinutes: entity.durations.work,
    shortBreakMinutes: entity.durations.shortBreak,
    longBreakMinutes: entity.durations.longBreak,
    remainingSeconds: entity.remainingSeconds,
    endsAtMs: entity.endsAt,
    completedSessions: entity.completedSessions,
  }),
};
