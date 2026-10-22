// Pomodoro repository sözleşmesi
import type { Pomodoro } from '@domain/entities/Pomodoro';
import type { IEntityRepository } from '@domain/repositories/IEntityRepository';

export type IPomodoroRepository = IEntityRepository<Pomodoro>;
