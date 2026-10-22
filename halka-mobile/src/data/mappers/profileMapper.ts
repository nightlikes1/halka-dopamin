// Profil DTO <-> Entity
import type { ProfileDto } from '@data/dto/HalkaStorageDto';
import type { Mapper } from '@data/mappers/Mapper';
import type { Profile, ViewMode } from '@domain/entities/Profile';

// Web sürümündeki 'orbital' değeri 'cockpit' olarak yorumlanır
const toViewMode = (value: string): ViewMode => (value === 'grid' ? 'grid' : 'cockpit');

export const profileMapper: Mapper<ProfileDto, Profile> = {
  toEntity: (dto) => ({
    name: dto.name,
    title: dto.title,
    viewMode: toViewMode(dto.viewMode),
    soundEnabled: dto.soundEnabled,
    lastActiveDate: dto.lastActiveDate,
  }),
  toDto: (entity) => ({
    name: entity.name,
    title: entity.title,
    viewMode: entity.viewMode,
    soundEnabled: entity.soundEnabled,
    lastActiveDate: entity.lastActiveDate,
  }),
};
