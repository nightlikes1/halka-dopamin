// Özelliklere göre repository implementasyonları
import type { HalkaLocalDataSource } from '@data/datasources/HalkaLocalDataSource';
import { bigOneMapper } from '@data/mappers/bigOneMapper';
import { budgetMapper } from '@data/mappers/budgetMapper';
import { layoutMapper } from '@data/mappers/layoutMapper';
import { moodMapper } from '@data/mappers/moodMapper';
import { notesMapper } from '@data/mappers/notesMapper';
import { pomodoroMapper } from '@data/mappers/pomodoroMapper';
import { profileMapper } from '@data/mappers/profileMapper';
import { streakMapper } from '@data/mappers/streakMapper';
import { tasksMapper } from '@data/mappers/tasksMapper';
import { waterMapper } from '@data/mappers/waterMapper';
import { SliceRepository } from '@data/repositories/SliceRepository';
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
import type { Repositories } from '@domain/repositories/Repositories';

export class ProfileRepository extends SliceRepository<'profile', Profile> {
  constructor(dataSource: HalkaLocalDataSource) {
    super(dataSource, 'profile', profileMapper);
  }
}

export class LayoutRepository extends SliceRepository<'layout', readonly WidgetId[]> {
  constructor(dataSource: HalkaLocalDataSource) {
    super(dataSource, 'layout', layoutMapper);
  }
}

export class WaterRepository extends SliceRepository<'water', Water> {
  constructor(dataSource: HalkaLocalDataSource) {
    super(dataSource, 'water', waterMapper);
  }
}

export class PomodoroRepository extends SliceRepository<'pomodoro', Pomodoro> {
  constructor(dataSource: HalkaLocalDataSource) {
    super(dataSource, 'pomodoro', pomodoroMapper);
  }
}

export class TasksRepository extends SliceRepository<'tasks', TaskList> {
  constructor(dataSource: HalkaLocalDataSource) {
    super(dataSource, 'tasks', tasksMapper);
  }
}

export class StreakRepository extends SliceRepository<'streak', Streak> {
  constructor(dataSource: HalkaLocalDataSource) {
    super(dataSource, 'streak', streakMapper);
  }
}

export class NotesRepository extends SliceRepository<'notes', Note> {
  constructor(dataSource: HalkaLocalDataSource) {
    super(dataSource, 'notes', notesMapper);
  }
}

export class MoodRepository extends SliceRepository<'mood', Mood> {
  constructor(dataSource: HalkaLocalDataSource) {
    super(dataSource, 'mood', moodMapper);
  }
}

export class BigOneRepository extends SliceRepository<'bigOne', BigOne> {
  constructor(dataSource: HalkaLocalDataSource) {
    super(dataSource, 'bigOne', bigOneMapper);
  }
}

export class BudgetRepository extends SliceRepository<'budget', Budget> {
  constructor(dataSource: HalkaLocalDataSource) {
    super(dataSource, 'budget', budgetMapper);
  }
}

export function createRepositories(dataSource: HalkaLocalDataSource): Repositories {
  return {
    profile: new ProfileRepository(dataSource),
    layout: new LayoutRepository(dataSource),
    water: new WaterRepository(dataSource),
    pomodoro: new PomodoroRepository(dataSource),
    tasks: new TasksRepository(dataSource),
    streak: new StreakRepository(dataSource),
    notes: new NotesRepository(dataSource),
    mood: new MoodRepository(dataSource),
    bigOne: new BigOneRepository(dataSource),
    budget: new BudgetRepository(dataSource),
  };
}
