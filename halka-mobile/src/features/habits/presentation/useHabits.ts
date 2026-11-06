// Alışkanlık ViewModel'i: liste ekranlar arasında paylaşılır (Zustand).
// Ekleme anında görünür (pendingHabits); sunucu kaydedince gerçek listeye geçer, hata olursa kalkar.
// Düzenleme ve silme de anında görünür, hata olursa eski haline döner.
import { useCallback, useMemo } from 'react';
import { create } from 'zustand';
import {
  pendingHabit,
  type CreateHabitInput,
  type Habit,
  type UpdateHabitInput,
} from '@features/habits/domain/entities';
import { useDI } from '@presentation/providers/DIProvider';
import { handleResult } from '@presentation/utils/handleResult';

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

interface HabitStoreState {
  readonly habits: readonly Habit[];
  readonly pendingHabits: readonly Habit[];
  readonly status: LoadState;
  readonly errorMessage: string | null;
  // Ekleme/düzenleme/silme sayacı: bu sırada başlamış yenilemenin eski listesi değişikliği ezmesin
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

  const updateHabit = useCallback(
    async (id: string, input: UpdateHabitInput): Promise<boolean> => {
      const original = useHabitStore.getState().habits.find((habit) => habit.id === id);
      const replace = (habit: Habit) => {
        const latest = useHabitStore.getState();
        setState({
          habits: latest.habits.map((item) => (item.id === id ? habit : item)),
          revision: latest.revision + 1,
        });
      };
      if (original) replace({ ...original, ...input });
      const result = await useCases.update.execute(id, input);
      if (!result.ok && original) replace(original);
      return handleResult(result, replace);
    },
    [useCases, setState],
  );

  const archiveHabit = useCallback(
    async (id: string): Promise<boolean> => {
      const before = useHabitStore.getState();
      const removed = before.habits.find((habit) => habit.id === id);
      setState({
        habits: before.habits.filter((habit) => habit.id !== id),
        revision: before.revision + 1,
      });
      const result = await useCases.archive.execute(id);
      const latest = useHabitStore.getState();
      // Başarıda da sayaç artar: silme sürerken başlamış yenilemenin listesi satırı geri getirmesin
      const habits =
        !result.ok && removed
          ? [...latest.habits, removed].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
          : latest.habits;
      setState({ habits, revision: latest.revision + 1 });
      return handleResult(result, () => undefined);
    },
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
    updateHabit,
    archiveHabit,
  };
}
