// Günlük görevler

export type TaskPriority = 'high' | 'normal';

export interface Task {
  readonly id: string;
  readonly text: string;
  readonly done: boolean;
  readonly priority: TaskPriority;
}

export interface TaskList {
  readonly items: readonly Task[];
}

export interface TaskProgress {
  readonly done: number;
  readonly total: number;
  readonly pct: number;
}

export const TASK_TEXT_MAX_LENGTH = 120;

export function getTaskProgress(list: TaskList): TaskProgress {
  const total = list.items.length;
  const done = list.items.filter((task) => task.done).length;
  return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
}
