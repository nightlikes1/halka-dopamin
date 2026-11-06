// Halkaya eklenti ekleme, çıkarma ve katalog
import { ValidationFailure } from '@core/errors/Failure';
import { type AsyncResult, err, ok } from '@core/result/Result';
import { WIDGET_CATALOG, type WidgetCatalogItem } from '@domain/entities/WidgetCatalog';
import type { WidgetId } from '@domain/entities/WidgetId';
import type { AudioPort, IEntityRepository } from '@domain/ports';
import { updateEntity } from '@domain/usecases/updateEntity';

// Halkaya yeni eklenti ekler (sona)
export class AddWidgetUseCase {
  constructor(private readonly repository: IEntityRepository<readonly WidgetId[]>) {}

  execute(widgetId: WidgetId): AsyncResult<readonly WidgetId[]> {
    return updateEntity(this.repository, (ids) =>
      ids.includes(widgetId)
        ? err(new ValidationFailure('Bu eklenti zaten halkada.'))
        : ok([...ids, widgetId]),
    );
  }
}

// Katalogdaki eklentileri aktiflik bilgisiyle döndürür
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

// Eklentiyi halkadan çıkarır; ortam sesi eklentisi çıkarılırsa ses de durur
export class RemoveWidgetUseCase {
  constructor(
    private readonly repository: IEntityRepository<readonly WidgetId[]>,
    private readonly audio: AudioPort,
  ) {}

  async execute(widgetId: WidgetId): AsyncResult<readonly WidgetId[]> {
    const result = await updateEntity(this.repository, (ids) =>
      ok(ids.filter((id) => id !== widgetId)),
    );
    if (result.ok && widgetId === 'ambient' && this.audio.getCurrentAmbient() !== null) {
      await this.audio.stopAmbient();
    }
    return result;
  }
}
