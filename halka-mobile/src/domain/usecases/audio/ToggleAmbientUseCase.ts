// Ortam sesini açar; aynı ses tekrar seçilirse kapatır
import { ValidationFailure } from '@core/errors/Failure';
import { err, ok, type AsyncResult } from '@core/result/Result';
import type { AmbientType } from '@domain/entities/Audio';
import type { AudioPort } from '@domain/ports/AudioPort';

export class ToggleAmbientUseCase {
  constructor(private readonly audio: AudioPort) {}

  // Çalan sesi döndürür (kapatıldıysa null)
  async execute(type: AmbientType): AsyncResult<AmbientType | null> {
    if (!this.audio.isEnabled()) {
      return err(new ValidationFailure('Sesler kapalı. Üst menüden 🔇 simgesiyle açabilirsin.'));
    }
    if (this.audio.getCurrentAmbient() === type) {
      const stopped = await this.audio.stopAmbient();
      return stopped.ok ? ok(null) : stopped;
    }
    const started = await this.audio.startAmbient(type);
    return started.ok ? ok(type) : started;
  }
}
