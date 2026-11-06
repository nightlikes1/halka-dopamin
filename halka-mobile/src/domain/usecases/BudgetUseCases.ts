// Harcama ekleme ve silme
import { ValidationFailure } from '@core/errors/Failure';
import { type AsyncResult, err, ok } from '@core/result/Result';
import { createId } from '@core/utils/id';
import {
  type Budget,
  type Expense,
  EXPENSE_DEFAULT_LABEL,
  EXPENSE_LABEL_MAX_LENGTH,
  EXPENSE_MAX_AMOUNT,
} from '@domain/entities/Budget';
import type { Clock, IEntityRepository } from '@domain/ports';
import { updateEntity } from '@domain/usecases/updateEntity';

// Yeni harcama kaydı ekler
export interface AddExpenseInput {
  readonly amount: number;
  readonly label?: string;
}

export class AddExpenseUseCase {
  constructor(
    private readonly repository: IEntityRepository<Budget>,
    private readonly clock: Clock,
  ) {}

  async execute({ amount, label }: AddExpenseInput): AsyncResult<Budget> {
    if (!Number.isFinite(amount) || amount <= 0 || amount > EXPENSE_MAX_AMOUNT) {
      return err(new ValidationFailure('Geçersiz harcama tutarı.'));
    }
    const trimmedLabel = (label ?? '').trim().slice(0, EXPENSE_LABEL_MAX_LENGTH);
    const expense: Expense = {
      id: createId('b'),
      label: trimmedLabel.length > 0 ? trimmedLabel : EXPENSE_DEFAULT_LABEL,
      amount: Math.round(amount * 100) / 100,
      createdAt: this.clock.now().toISOString(),
    };
    return updateEntity(this.repository, (budget) =>
      ok({ ...budget, expenses: [expense, ...budget.expenses] }),
    );
  }
}

// Harcama kaydını siler
export class DeleteExpenseUseCase {
  constructor(private readonly repository: IEntityRepository<Budget>) {}

  execute(expenseId: string): AsyncResult<Budget> {
    return updateEntity(this.repository, (budget) =>
      ok({ ...budget, expenses: budget.expenses.filter((expense) => expense.id !== expenseId) }),
    );
  }
}
