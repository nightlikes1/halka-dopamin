// Alışkanlık ViewModel'i: liste ekranlar arasında paylaşılır (Zustand)
import { useCallback } from 'react';
import { create } from 'zustand';
import type { CreateHabitInput, Habit } from '@features/habits/domain/entities';
import { useDI } from '@presentation/providers/DIProvider';
import { handleResult } from '@presentation/utils/handleResult';

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

interface HabitStoreState {
  readonly habits: readonly Habit[];
  readonly status: LoadState;
  readonly errorMessage: string | null;
  set(partial: Partial<Omit<HabitStoreState, 'set'>>): void;
}

const useHabitStore = create<HabitStoreState>()((set) => ({
  habits: [],
  status: 'idle',
  errorMessage: null,
  set: (partial) => set(partial),
}));

export function useHabits() {
  const { habits: useCases } = useDI();
  const habits = useHabitStore((s) => s.habits);
  const status = useHabitStore((s) => s.status);
  const errorMessage = useHabitStore((s) => s.errorMessage);
  const setState = useHabitStore((s) => s.set);

  const reload = useCallback(async () => {
    setState({ status: 'loading', errorMessage: null });
    const result = await useCases.list.execute();
    if (result.ok) setState({ habits: result.value, status: 'ready' });
    else setState({ status: 'error', errorMessage: result.error.message });
  }, [useCases, setState]);

  const createHabit = useCallback(
    async (input: CreateHabitInput): Promise<boolean> =>
      handleResult(await useCases.create.execute(input), (habit) =>
        setState({ habits: [...useHabitStore.getState().habits, habit] }),
      ),
    [useCases, setState],
  );

  const archiveHabit = useCallback(
    async (id: string): Promise<boolean> =>
      handleResult(await useCases.archive.execute(id), () =>
        setState({ habits: useHabitStore.getState().habits.filter((habit) => habit.id !== id) }),
      ),
    [useCases, setState],
  );

  return { habits, status, errorMessage, reload, createHabit, archiveHabit };
}
