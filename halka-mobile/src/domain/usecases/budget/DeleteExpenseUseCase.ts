// Harcama kaydını siler
import { ok, type AsyncResult } from '@core/result/Result';
import type { Budget } from '@domain/entities/Budget';
import type { IBudgetRepository } from '@domain/repositories/IBudgetRepository';
import { updateEntity } from '@domain/usecases/shared/updateEntity';

export class DeleteExpenseUseCase {
  constructor(private readonly repository: IBudgetRepository) {}

  execute(expenseId: string): AsyncResult<Budget> {
    return updateEntity(this.repository, (budget) =>
      ok({ ...budget, expenses: budget.expenses.filter((expense) => expense.id !== expenseId) }),
    );
  }
}
