// Eklentiyi halkadan çıkarır; ortam sesi eklentisi çıkarılırsa ses de durur
import { ok, type AsyncResult } from '@core/result/Result';
import type { WidgetId } from '@domain/entities/WidgetId';
import type { AudioPort } from '@domain/ports/AudioPort';
import type { ILayoutRepository } from '@domain/repositories/ILayoutRepository';
import { updateEntity } from '@domain/usecases/shared/updateEntity';

export class RemoveWidgetUseCase {
  constructor(
    private readonly repository: ILayoutRepository,
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
