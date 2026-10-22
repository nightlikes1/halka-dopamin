// Kalıcı depolamadaki JSON şeması (DTO) — zod ile çalışma anında doğrulanır
import { z } from 'zod';

export const profileDtoSchema = z.object({
  name: z.string(),
  title: z.string(),
  viewMode: z.string(),
  soundEnabled: z.boolean(),
  lastActiveDate: z.string(),
});

export const layoutDtoSchema = z.object({
  activeWidgetIds: z.array(z.string()),
});

export const waterDtoSchema = z.object({
  current: z.number(),
  target: z.number(),
});

export const pomodoroDtoSchema = z.object({
  mode: z.string(),
  workMinutes: z.number(),
  shortBreakMinutes: z.number(),
  longBreakMinutes: z.number(),
  remainingSeconds: z.number(),
  endsAtMs: z.number().nullable(),
  completedSessions: z.number(),
});

export const taskDtoSchema = z.object({
  id: z.string(),
  text: z.string(),
  done: z.boolean(),
  priority: z.string(),
});

export const tasksDtoSchema = z.object({
  items: z.array(taskDtoSchema),
});

export const streakDtoSchema = z.object({
  habitName: z.string(),
  bestStreak: z.number(),
  checkedDates: z.array(z.string()),
});

export const notesDtoSchema = z.object({
  content: z.string(),
});

export const moodDtoSchema = z.object({
  todayMood: z.string(),
  energyLevel: z.number(),
  reflection: z.string(),
});

export const bigOneDtoSchema = z.object({
  goal: z.string(),
  isCompleted: z.boolean(),
  category: z.string(),
});

export const expenseDtoSchema = z.object({
  id: z.string(),
  label: z.string(),
  amount: z.number(),
  createdAt: z.string(),
});

export const budgetDtoSchema = z.object({
  limit: z.number(),
  expenses: z.array(expenseDtoSchema),
});

export type ProfileDto = z.infer<typeof profileDtoSchema>;
export type LayoutDto = z.infer<typeof layoutDtoSchema>;
export type WaterDto = z.infer<typeof waterDtoSchema>;
export type PomodoroDto = z.infer<typeof pomodoroDtoSchema>;
export type TaskDto = z.infer<typeof taskDtoSchema>;
export type TasksDto = z.infer<typeof tasksDtoSchema>;
export type StreakDto = z.infer<typeof streakDtoSchema>;
export type NotesDto = z.infer<typeof notesDtoSchema>;
export type MoodDto = z.infer<typeof moodDtoSchema>;
export type BigOneDto = z.infer<typeof bigOneDtoSchema>;
export type ExpenseDto = z.infer<typeof expenseDtoSchema>;
export type BudgetDto = z.infer<typeof budgetDtoSchema>;

export interface HalkaStorageDto {
  schemaVersion: number;
  profile: ProfileDto;
  layout: LayoutDto;
  water: WaterDto;
  pomodoro: PomodoroDto;
  tasks: TasksDto;
  streak: StreakDto;
  notes: NotesDto;
  mood: MoodDto;
  bigOne: BigOneDto;
  budget: BudgetDto;
}

export type HalkaSliceKey = Exclude<keyof HalkaStorageDto, 'schemaVersion'>;
