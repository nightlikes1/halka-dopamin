// Su DTO <-> Entity
import type { WaterDto } from '@data/dto/HalkaStorageDto';
import type { Mapper } from '@data/mappers/Mapper';
import { WATER_DEFAULT_TARGET, type Water } from '@domain/entities/Water';

export const waterMapper: Mapper<WaterDto, Water> = {
  toEntity: (dto) => ({
    current: Math.max(0, dto.current),
    target: dto.target > 0 ? dto.target : WATER_DEFAULT_TARGET,
  }),
  toDto: (entity) => ({ current: entity.current, target: entity.target }),
};
