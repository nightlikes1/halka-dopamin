// Ses efektleri ve ortam sesi
import { ValidationFailure } from '@core/errors/Failure';
import { type AsyncResult, err, ok, type Result } from '@core/result/Result';
import type { AmbientType, SoundEffect } from '@domain/entities/Audio';
import type { AudioPort } from '@domain/ports';

// Arayüz geri bildirimi için kısa ses efekti çalar
export class PlaySoundEffectUseCase {
  constructor(private readonly audio: AudioPort) {}

  execute(effect: SoundEffect): Result<void> {
    return this.audio.playEffect(effect);
  }
}

// Çalan ortam sesini durdurur
export class StopAmbientUseCase {
  constructor(private readonly audio: AudioPort) {}

  execute(): AsyncResult<void> {
    return this.audio.stopAmbient();
  }
}

// Ortam sesini açar; aynı ses tekrar seçilirse kapatır
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
