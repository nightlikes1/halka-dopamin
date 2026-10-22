// Ruh hali DTO <-> Entity
import { clamp } from '@core/utils/format';
import type { MoodDto } from '@data/dto/HalkaStorageDto';
import type { Mapper } from '@data/mappers/Mapper';
import { ENERGY_MAX, ENERGY_MIN, isMoodId, type Mood } from '@domain/entities/Mood';

export const moodMapper: Mapper<MoodDto, Mood> = {
  toEntity: (dto) => ({
    todayMood: isMoodId(dto.todayMood) ? dto.todayMood : 'calm',
    energyLevel: clamp(Math.round(dto.energyLevel), ENERGY_MIN, ENERGY_MAX),
    reflection: dto.reflection,
  }),
  toDto: (entity) => ({
    todayMood: entity.todayMood,
    energyLevel: entity.energyLevel,
    reflection: entity.reflection,
  }),
};
