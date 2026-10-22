// Günlük harcama ViewModel'i
import { useCallback, useMemo } from 'react';
import { getBudgetSummary } from '@domain/entities/Budget';
import type { AddExpenseInput } from '@domain/usecases/budget/AddExpenseUseCase';
import { useSoundEffect } from '@presentation/hooks/useSoundEffect';
import { useDI } from '@presentation/providers/DIProvider';
import { useHalkaStore, useSnapshotSlice } from '@presentation/store/useHalkaStore';
import { handleResult } from '@presentation/utils/handleResult';

export function useBudget() {
  const budget = useSnapshotSlice('budget');
  const patch = useHalkaStore((s) => s.patch);
  const { budget: useCases } = useDI();
  const play = useSoundEffect();

  const summary = useMemo(() => getBudgetSummary(budget), [budget]);

  const addExpense = useCallback(
    async (input: AddExpenseInput): Promise<boolean> =>
      handleResult(await useCases.addExpense.execute(input), (value) => {
        patch('budget', value);
        play('click');
      }),
    [useCases, patch, play],
  );

  const deleteExpense = useCallback(
    async (expenseId: string) => {
      handleResult(await useCases.deleteExpense.execute(expenseId), (value) => {
        patch('budget', value);
        play('delete');
      });
    },
    [useCases, patch, play],
  );

  return { budget, summary, addExpense, deleteExpense };
}
