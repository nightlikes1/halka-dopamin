// Halkaya yeni eklenti ekler (sona)
import { ValidationFailure } from '@core/errors/Failure';
import { err, ok, type AsyncResult } from '@core/result/Result';
import type { WidgetId } from '@domain/entities/WidgetId';
import type { ILayoutRepository } from '@domain/repositories/ILayoutRepository';
import { updateEntity } from '@domain/usecases/shared/updateEntity';

export class AddWidgetUseCase {
  constructor(private readonly repository: ILayoutRepository) {}

  execute(widgetId: WidgetId): AsyncResult<readonly WidgetId[]> {
    return updateEntity(this.repository, (ids) =>
      ids.includes(widgetId)
        ? err(new ValidationFailure('Bu eklenti zaten halkada.'))
        : ok([...ids, widgetId]),
    );
  }
}
