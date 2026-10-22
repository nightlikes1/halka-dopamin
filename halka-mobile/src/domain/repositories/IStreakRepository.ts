// Zincir (seri) repository sözleşmesi
import type { Streak } from '@domain/entities/Streak';
import type { IEntityRepository } from '@domain/repositories/IEntityRepository';

export type IStreakRepository = IEntityRepository<Streak>;
