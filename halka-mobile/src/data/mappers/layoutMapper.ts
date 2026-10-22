// Halka düzeni DTO <-> Entity (geçersiz ve tekrarlı kimlikler ayıklanır)
import type { LayoutDto } from '@data/dto/HalkaStorageDto';
import type { Mapper } from '@data/mappers/Mapper';
import { isWidgetId, type WidgetId } from '@domain/entities/WidgetId';

export const layoutMapper: Mapper<LayoutDto, readonly WidgetId[]> = {
  toEntity: (dto) => [...new Set(dto.activeWidgetIds.filter(isWidgetId))],
  toDto: (entity) => ({ activeWidgetIds: [...entity] }),
};
