// Arayüz geri bildirimi için kısa ses efekti çalar
import type { Result } from '@core/result/Result';
import type { SoundEffect } from '@domain/entities/Audio';
import type { AudioPort } from '@domain/ports/AudioPort';

export class PlaySoundEffectUseCase {
  constructor(private readonly audio: AudioPort) {}

  execute(effect: SoundEffect): Result<void> {
    return this.audio.playEffect(effect);
  }
}
