// Günlük harcama ve bütçe

export interface Expense {
  readonly id: string;
  readonly label: string;
  readonly amount: number;
  readonly createdAt: string; // ISO tarih-saat
}

export interface Budget {
  readonly limit: number;
  readonly expenses: readonly Expense[];
}

export interface BudgetSummary {
  readonly spent: number;
  readonly remaining: number;
  readonly pct: number;
  readonly isWarning: boolean;
}

export const BUDGET_DEFAULT_LIMIT = 500;
export const BUDGET_WARNING_PCT = 80;
export const EXPENSE_MAX_AMOUNT = 1_000_000;
export const EXPENSE_LABEL_MAX_LENGTH = 40;
export const EXPENSE_DEFAULT_LABEL = 'Harcama';

export function getBudgetSummary(budget: Budget): BudgetSummary {
  const limit = budget.limit > 0 ? budget.limit : BUDGET_DEFAULT_LIMIT;
  const spent = budget.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const pct = Math.min(100, Math.round((spent / limit) * 100));
  return {
    spent,
    remaining: Math.max(0, limit - spent),
    pct,
    isWarning: pct > BUDGET_WARNING_PCT,
  };
}
