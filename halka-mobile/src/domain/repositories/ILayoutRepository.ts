// Aktif eklenti sırası (halka düzeni) repository sözleşmesi
import type { WidgetId } from '@domain/entities/WidgetId';
import type { IEntityRepository } from '@domain/repositories/IEntityRepository';

export type ILayoutRepository = IEntityRepository<readonly WidgetId[]>;
