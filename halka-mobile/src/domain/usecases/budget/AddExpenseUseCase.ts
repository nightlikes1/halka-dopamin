// Yeni harcama kaydı ekler
import { ValidationFailure } from '@core/errors/Failure';
import { err, ok, type AsyncResult } from '@core/result/Result';
import { createId } from '@core/utils/id';
import {
  EXPENSE_DEFAULT_LABEL,
  EXPENSE_LABEL_MAX_LENGTH,
  EXPENSE_MAX_AMOUNT,
  type Budget,
  type Expense,
} from '@domain/entities/Budget';
import type { Clock } from '@domain/ports/Clock';
import type { IBudgetRepository } from '@domain/repositories/IBudgetRepository';
import { updateEntity } from '@domain/usecases/shared/updateEntity';

export interface AddExpenseInput {
  readonly amount: number;
  readonly label?: string;
}

export class AddExpenseUseCase {
  constructor(
    private readonly repository: IBudgetRepository,
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
