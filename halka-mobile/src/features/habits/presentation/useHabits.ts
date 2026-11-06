// Alışkanlık ViewModel'i: liste ekranlar arasında paylaşılır (Zustand).
// Ekleme anında görünür (pendingHabits); sunucu kaydedince gerçek listeye geçer, hata olursa kalkar.
import { useCallback, useMemo } from 'react';
import { create } from 'zustand';
import { pendingHabit, type CreateHabitInput, type Habit } from '@features/habits/domain/entities';
import { useDI } from '@presentation/providers/DIProvider';
import { handleResult } from '@presentation/utils/handleResult';

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

interface HabitStoreState {
  readonly habits: readonly Habit[];
  readonly pendingHabits: readonly Habit[];
  readonly status: LoadState;
  readonly errorMessage: string | null;
  // Ekleme/silme sayacı: bu sırada başlamış yenilemenin eski listesi değişikliği ezmesin
  readonly revision: number;
  set(partial: Partial<Omit<HabitStoreState, 'set'>>): void;
}

const useHabitStore = create<HabitStoreState>()((set) => ({
  habits: [],
  pendingHabits: [],
  status: 'idle',
  errorMessage: null,
  revision: 0,
  set: (partial) => set(partial),
}));

export function useHabits() {
  const { habits: useCases } = useDI();
  const habits = useHabitStore((s) => s.habits);
  const pendingHabits = useHabitStore((s) => s.pendingHabits);
  const status = useHabitStore((s) => s.status);
  const errorMessage = useHabitStore((s) => s.errorMessage);
  const setState = useHabitStore((s) => s.set);

  const reload = useCallback(async () => {
    const { revision } = useHabitStore.getState();
    setState({ status: 'loading', errorMessage: null });
    const result = await useCases.list.execute();
    if (!result.ok) {
      setState({ status: 'error', errorMessage: result.error.message });
    } else if (useHabitStore.getState().revision === revision) {
      setState({ habits: result.value, status: 'ready' });
    } else {
      setState({ status: 'ready' });
    }
  }, [useCases, setState]);

  const createHabit = useCallback(
    async (input: CreateHabitInput): Promise<boolean> => {
      const pending = pendingHabit(input, new Date().toISOString());
      setState({ pendingHabits: [...useHabitStore.getState().pendingHabits, pending] });
      const result = await useCases.create.execute(input);
      setState({
        pendingHabits: useHabitStore.getState().pendingHabits.filter((h) => h.id !== pending.id),
      });
      return handleResult(result, (habit) => {
        const latest = useHabitStore.getState();
        setState({ habits: [...latest.habits, habit], revision: latest.revision + 1 });
      });
    },
    [useCases, setState],
  );

  const archiveHabit = useCallback(
    async (id: string): Promise<boolean> =>
      handleResult(await useCases.archive.execute(id), () => {
        const latest = useHabitStore.getState();
        setState({
          habits: latest.habits.filter((habit) => habit.id !== id),
          revision: latest.revision + 1,
        });
      }),
    [useCases, setState],
  );

  // Ekranda gösterilecek liste; check-in ve karakter yalnızca kayıtlı olanları (habits) kullanır
  const allHabits = useMemo(() => [...habits, ...pendingHabits], [habits, pendingHabits]);

  return {
    habits,
    pendingHabits,
    allHabits,
    status,
    errorMessage,
    reload,
    createHabit,
    archiveHabit,
  };
}
