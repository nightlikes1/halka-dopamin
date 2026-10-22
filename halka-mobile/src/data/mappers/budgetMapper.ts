// Bütçe DTO <-> Entity
import type { BudgetDto } from '@data/dto/HalkaStorageDto';
import type { Mapper } from '@data/mappers/Mapper';
import { BUDGET_DEFAULT_LIMIT, type Budget } from '@domain/entities/Budget';

export const budgetMapper: Mapper<BudgetDto, Budget> = {
  toEntity: (dto) => ({
    limit: dto.limit > 0 ? dto.limit : BUDGET_DEFAULT_LIMIT,
    expenses: dto.expenses
      .filter((expense) => expense.amount > 0)
      .map((expense) => ({
        id: expense.id,
        label: expense.label,
        amount: expense.amount,
        createdAt: expense.createdAt,
      })),
  }),
  toDto: (entity) => ({
    limit: entity.limit,
    expenses: entity.expenses.map((expense) => ({
      id: expense.id,
      label: expense.label,
      amount: expense.amount,
      createdAt: expense.createdAt,
    })),
  }),
};
