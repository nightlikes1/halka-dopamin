// Eklentiyi halkadan çıkarır; ortam sesi eklentisi çıkarılırsa ses de durur
import { ok, type AsyncResult } from '@core/result/Result';
import type { WidgetId } from '@domain/entities/WidgetId';
import type { AudioPort, IEntityRepository } from '@domain/ports';
import { updateEntity } from '@domain/usecases/shared/updateEntity';

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
