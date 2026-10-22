// Su takibi repository sözleşmesi
import type { Water } from '@domain/entities/Water';
import type { IEntityRepository } from '@domain/repositories/IEntityRepository';

export type IWaterRepository = IEntityRepository<Water>;
