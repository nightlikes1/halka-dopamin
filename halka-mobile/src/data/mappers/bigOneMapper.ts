// Ana hedef DTO <-> Entity
import type { BigOneDto } from '@data/dto/HalkaStorageDto';
import type { Mapper } from '@data/mappers/Mapper';
import type { BigOne } from '@domain/entities/BigOne';

export const bigOneMapper: Mapper<BigOneDto, BigOne> = {
  toEntity: (dto) => ({ goal: dto.goal, isCompleted: dto.isCompleted, category: dto.category }),
  toDto: (entity) => ({
    goal: entity.goal,
    isCompleted: entity.isCompleted,
    category: entity.category,
  }),
};
