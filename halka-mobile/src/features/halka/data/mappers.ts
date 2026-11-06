// Kalıcı JSON (DTO) ile uygulama modeli (Entity) arasındaki dönüşümler; bozuk veri burada düzeltilir
import { clamp } from '@core/utils/format';
import {
  type BigOneDto,
  type BudgetDto,
  type HalkaStorageDto,
  type LayoutDto,
  type MoodDto,
  type NotesDto,
  type PomodoroDto,
  type ProfileDto,
  STORAGE_SCHEMA_VERSION,
  type StreakDto,
  type TasksDto,
  type WaterDto,
} from '@features/halka/data/storage';
import type { BigOne } from '@features/halka/domain/entities/BigOne';
import { type Budget, BUDGET_DEFAULT_LIMIT } from '@features/halka/domain/entities/Budget';
import { createDefaultSnapshot } from '@features/halka/domain/entities/defaults';
import type { HalkaSnapshot } from '@features/halka/domain/entities/HalkaSnapshot';
import { ENERGY_MAX, ENERGY_MIN, isMoodId, type Mood } from '@features/halka/domain/entities/Mood';
import type { Note } from '@features/halka/domain/entities/Note';
import {
  DEFAULT_POMODORO_DURATIONS,
  type Pomodoro,
  POMODORO_MODES,
  type PomodoroMode,
} from '@features/halka/domain/entities/Pomodoro';
import type { Profile, ViewMode } from '@features/halka/domain/entities/Profile';
import type { Streak } from '@features/halka/domain/entities/Streak';
import type { TaskList, TaskPriority } from '@features/halka/domain/entities/Task';
import { type Water, WATER_DEFAULT_TARGET } from '@features/halka/domain/entities/Water';
import { isWidgetId, type WidgetId } from '@features/halka/domain/entities/WidgetId';
import { type Clock, todayOf } from '@core/utils/clock';

// DTO <-> Entity dönüşüm sözleşmesi
export interface Mapper<TDto, TEntity> {
  toEntity(dto: TDto): TEntity;
  toDto(entity: TEntity): TDto;
}

// Profil DTO <-> Entity

// Web sürümündeki 'orbital' değeri 'cockpit' olarak yorumlanır
const toViewMode = (value: string): ViewMode => (value === 'grid' ? 'grid' : 'cockpit');

export const profileMapper: Mapper<ProfileDto, Profile> = {
  toEntity: (dto) => ({
    name: dto.name,
    title: dto.title,
    viewMode: toViewMode(dto.viewMode),
    soundEnabled: dto.soundEnabled,
    lastActiveDate: dto.lastActiveDate,
  }),
  toDto: (entity) => ({
    name: entity.name,
    title: entity.title,
    viewMode: entity.viewMode,
    soundEnabled: entity.soundEnabled,
    lastActiveDate: entity.lastActiveDate,
  }),
};

// Halka düzeni DTO <-> Entity (geçersiz ve tekrarlı kimlikler ayıklanır)
export const layoutMapper: Mapper<LayoutDto, readonly WidgetId[]> = {
  toEntity: (dto) => [...new Set(dto.activeWidgetIds.filter(isWidgetId))],
  toDto: (entity) => ({ activeWidgetIds: [...entity] }),
};

// Su DTO <-> Entity
export const waterMapper: Mapper<WaterDto, Water> = {
  toEntity: (dto) => ({
    current: Math.max(0, dto.current),
    target: dto.target > 0 ? dto.target : WATER_DEFAULT_TARGET,
  }),
  toDto: (entity) => ({ current: entity.current, target: entity.target }),
};

// Pomodoro DTO <-> Entity
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

// Görev listesi DTO <-> Entity
const toPriority = (value: string): TaskPriority => (value === 'high' ? 'high' : 'normal');

export const tasksMapper: Mapper<TasksDto, TaskList> = {
  toEntity: (dto) => ({
    items: dto.items.map((item) => ({
      id: item.id,
      text: item.text,
      done: item.done,
      priority: toPriority(item.priority),
    })),
  }),
  toDto: (entity) => ({
    items: entity.items.map((task) => ({
      id: task.id,
      text: task.text,
      done: task.done,
      priority: task.priority,
    })),
  }),
};

// Zincir DTO <-> Entity (tarihler doğrulanır, sıralanır, tekrarlar atılır)
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const streakMapper: Mapper<StreakDto, Streak> = {
  toEntity: (dto) => ({
    habitName: dto.habitName,
    bestStreak: Math.max(0, Math.round(dto.bestStreak)),
    checkedDates: [...new Set(dto.checkedDates.filter((d) => ISO_DATE.test(d)))].sort(),
  }),
  toDto: (entity) => ({
    habitName: entity.habitName,
    bestStreak: entity.bestStreak,
    checkedDates: [...entity.checkedDates],
  }),
};

// Not DTO <-> Entity
export const notesMapper: Mapper<NotesDto, Note> = {
  toEntity: (dto) => ({ content: dto.content }),
  toDto: (entity) => ({ content: entity.content }),
};

// Ruh hali DTO <-> Entity
export const moodMapper: Mapper<MoodDto, Mood> = {
  toEntity: (dto) => ({
    todayMood: isMoodId(dto.todayMood) ? dto.todayMood : 'calm',
    energyLevel: clamp(Math.round(dto.energyLevel), ENERGY_MIN, ENERGY_MAX),
    reflection: dto.reflection,
  }),
  toDto: (entity) => ({
    todayMood: entity.todayMood,
    energyLevel: entity.energyLevel,
    reflection: entity.reflection,
  }),
};

// Ana hedef DTO <-> Entity
export const bigOneMapper: Mapper<BigOneDto, BigOne> = {
  toEntity: (dto) => ({ goal: dto.goal, isCompleted: dto.isCompleted, category: dto.category }),
  toDto: (entity) => ({
    goal: entity.goal,
    isCompleted: entity.isCompleted,
    category: entity.category,
  }),
};

// Bütçe DTO <-> Entity
export const budgetMapper: Mapper<BudgetDto, Budget> = {
  toEntity: (dto) => ({
    limit: dto.limit > 0 ? dto.limit : BUDGET_DEFAULT_LIMIT,
    expenses: dto.expenses
      .filter((expense) => expense.amount > 0)
      .map((expense) => ({
        id: expense.id,
        label: expense.label,
        amount: expense.amount,
        createdAt: expense.createdAt,
      })),
  }),
  toDto: (entity) => ({
    limit: entity.limit,
    expenses: entity.expenses.map((expense) => ({
      id: expense.id,
      label: expense.label,
      amount: expense.amount,
      createdAt: expense.createdAt,
    })),
  }),
};

// Tüm anlık görüntüyü DTO'ya çevirir (varsayılan veriyi üretmek için)
export function snapshotToDto(snapshot: HalkaSnapshot): HalkaStorageDto {
  return {
    schemaVersion: STORAGE_SCHEMA_VERSION,
    profile: profileMapper.toDto(snapshot.profile),
    layout: layoutMapper.toDto(snapshot.activeWidgetIds),
    water: waterMapper.toDto(snapshot.water),
    pomodoro: pomodoroMapper.toDto(snapshot.pomodoro),
    tasks: tasksMapper.toDto(snapshot.tasks),
    streak: streakMapper.toDto(snapshot.streak),
    notes: notesMapper.toDto(snapshot.notes),
    mood: moodMapper.toDto(snapshot.mood),
    bigOne: bigOneMapper.toDto(snapshot.bigOne),
    budget: budgetMapper.toDto(snapshot.budget),
  };
}

// İlk kurulum için varsayılan DTO (domain varsayılanlarından üretilir)
export function createDefaultStorageDto(clock: Clock): HalkaStorageDto {
  return snapshotToDto(createDefaultSnapshot(todayOf(clock)));
}
