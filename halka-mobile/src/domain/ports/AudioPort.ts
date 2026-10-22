// Ses altyapısı için domain portu (uygulaması data katmanında)
import type { Result } from '@core/result/Result';
import type { AmbientType, SoundEffect } from '@domain/entities/Audio';

export interface AudioPort {
  setEnabled(enabled: boolean): void;
  isEnabled(): boolean;
  playEffect(effect: SoundEffect): Result<void>;
  startAmbient(type: AmbientType): Promise<Result<void>>;
  stopAmbient(): Promise<Result<void>>;
  getCurrentAmbient(): AmbientType | null;
}
