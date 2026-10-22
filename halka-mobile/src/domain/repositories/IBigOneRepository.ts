// Günün ana hedefi repository sözleşmesi
import type { BigOne } from '@domain/entities/BigOne';
import type { IEntityRepository } from '@domain/repositories/IEntityRepository';

export type IBigOneRepository = IEntityRepository<BigOne>;
