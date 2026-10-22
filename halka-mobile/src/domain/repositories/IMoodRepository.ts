// Ruh hali repository sözleşmesi
import type { Mood } from '@domain/entities/Mood';
import type { IEntityRepository } from '@domain/repositories/IEntityRepository';

export type IMoodRepository = IEntityRepository<Mood>;
