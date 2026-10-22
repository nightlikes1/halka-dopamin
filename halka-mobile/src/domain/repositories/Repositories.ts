// Tüm repository'lerin toplu tipi (DI için)
import type { IBigOneRepository } from '@domain/repositories/IBigOneRepository';
import type { IBudgetRepository } from '@domain/repositories/IBudgetRepository';
import type { ILayoutRepository } from '@domain/repositories/ILayoutRepository';
import type { IMoodRepository } from '@domain/repositories/IMoodRepository';
import type { INotesRepository } from '@domain/repositories/INotesRepository';
import type { IPomodoroRepository } from '@domain/repositories/IPomodoroRepository';
import type { IProfileRepository } from '@domain/repositories/IProfileRepository';
import type { IStreakRepository } from '@domain/repositories/IStreakRepository';
import type { ITasksRepository } from '@domain/repositories/ITasksRepository';
import type { IWaterRepository } from '@domain/repositories/IWaterRepository';

export interface Repositories {
  readonly profile: IProfileRepository;
  readonly layout: ILayoutRepository;
  readonly water: IWaterRepository;
  readonly pomodoro: IPomodoroRepository;
  readonly tasks: ITasksRepository;
  readonly streak: IStreakRepository;
  readonly notes: INotesRepository;
  readonly mood: IMoodRepository;
  readonly bigOne: IBigOneRepository;
  readonly budget: IBudgetRepository;
}
