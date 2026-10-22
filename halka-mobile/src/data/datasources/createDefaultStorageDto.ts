// İlk kurulum için varsayılan DTO (domain varsayılanlarından üretilir)
import type { HalkaStorageDto } from '@data/dto/HalkaStorageDto';
import { snapshotToDto } from '@data/mappers/snapshotMapper';
import { createDefaultSnapshot } from '@domain/entities/defaults';
import { todayOf, type Clock } from '@domain/ports/Clock';

export function createDefaultStorageDto(clock: Clock): HalkaStorageDto {
  return snapshotToDto(createDefaultSnapshot(todayOf(clock)));
}
