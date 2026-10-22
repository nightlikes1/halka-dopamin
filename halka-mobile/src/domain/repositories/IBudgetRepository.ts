// Bütçe repository sözleşmesi
import type { Budget } from '@domain/entities/Budget';
import type { IEntityRepository } from '@domain/repositories/IEntityRepository';

export type IBudgetRepository = IEntityRepository<Budget>;
