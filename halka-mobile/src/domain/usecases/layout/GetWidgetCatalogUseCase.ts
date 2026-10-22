// Katalogdaki eklentileri aktiflik bilgisiyle döndürür
import { WIDGET_CATALOG, type WidgetCatalogItem } from '@domain/entities/WidgetCatalog';
import type { WidgetId } from '@domain/entities/WidgetId';

export interface CatalogEntry {
  readonly item: WidgetCatalogItem;
  readonly isActive: boolean;
}

export class GetWidgetCatalogUseCase {
  execute(activeIds: readonly WidgetId[]): CatalogEntry[] {
    const active = new Set(activeIds);
    return WIDGET_CATALOG.map((item) => ({ item, isActive: active.has(item.id) }));
  }
}
