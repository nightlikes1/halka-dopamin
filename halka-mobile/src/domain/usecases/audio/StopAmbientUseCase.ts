// Çalan ortam sesini durdurur
import type { AsyncResult } from '@core/result/Result';
import type { AudioPort } from '@domain/ports/AudioPort';

export class StopAmbientUseCase {
  constructor(private readonly audio: AudioPort) {}

  execute(): AsyncResult<void> {
    return this.audio.stopAmbient();
  }
}
