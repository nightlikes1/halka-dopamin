// Zincir DTO <-> Entity (tarihler doğrulanır, sıralanır, tekrarlar atılır)
import type { StreakDto } from '@data/dto/HalkaStorageDto';
import type { Mapper } from '@data/mappers/Mapper';
import type { Streak } from '@domain/entities/Streak';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const streakMapper: Mapper<StreakDto, Streak> = {
  toEntity: (dto) => ({
    habitName: dto.habitName,
    bestStreak: Math.max(0, Math.round(dto.bestStreak)),
    checkedDates: [...new Set(dto.checkedDates.filter((d) => ISO_DATE.test(d)))].sort(),
  }),
  toDto: (entity) => ({
    habitName: entity.habitName,
    bestStreak: entity.bestStreak,
    checkedDates: [...entity.checkedDates],
  }),
};
