// expo-audio ile önceden üretilmiş WAV dosyalarını çalan AudioPort uygulaması.
// Web'deki Web Audio API sentezinin RN karşılığı (bkz. scripts/generate-sounds.mjs).
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import ambientDrone from '@assets/sounds/ambient-drone.wav';
import ambientFocus from '@assets/sounds/ambient-focus.wav';
import ambientRain from '@assets/sounds/ambient-rain.wav';
import chainPulseSound from '@assets/sounds/chainPulse.wav';
import chimeSound from '@assets/sounds/chime.wav';
import clickSound from '@assets/sounds/click.wav';
import deleteSound from '@assets/sounds/delete.wav';
import focusExitSound from '@assets/sounds/focusExit.wav';
import focusZoomSound from '@assets/sounds/focusZoom.wav';
import successSound from '@assets/sounds/success.wav';
import waterDropSound from '@assets/sounds/waterDrop.wav';
import { AudioFailure } from '@core/errors/Failure';
import { err, okVoid, type AsyncResult, type Result } from '@core/result/Result';
import type { AmbientType, SoundEffect } from '@domain/entities/Audio';
import type { AudioPort } from '@domain/ports/AudioPort';

const EFFECT_SOURCES: Record<SoundEffect, number> = {
  click: clickSound,
  waterDrop: waterDropSound,
  chime: chimeSound,
  success: successSound,
  delete: deleteSound,
  chainPulse: chainPulseSound,
  focusZoom: focusZoomSound,
  focusExit: focusExitSound,
};

const AMBIENT_SOURCES: Record<AmbientType, number> = {
  rain: ambientRain,
  focus: ambientFocus,
  drone: ambientDrone,
};

const FADE_IN_MS = 1500;
const FADE_OUT_MS = 500;
const FADE_STEP_MS = 50;

export class ExpoAudioService implements AudioPort {
  private enabled = true;
  private modeConfigured = false;
  private readonly effectPlayers = new Map<SoundEffect, AudioPlayer>();
  private readonly fadeTimers = new Map<AudioPlayer, ReturnType<typeof setInterval>>();
  private ambientPlayer: AudioPlayer | null = null;
  private currentAmbient: AmbientType | null = null;

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) void this.stopAmbient();
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getCurrentAmbient(): AmbientType | null {
    return this.currentAmbient;
  }

  playEffect(effect: SoundEffect): Result<void> {
    if (!this.enabled) return okVoid();
    try {
      this.ensureAudioMode();
      const player = this.getEffectPlayer(effect);
      // Baştan çal: önce başa sar, sonra oynat
      player
        .seekTo(0)
        .then(() => player.play())
        .catch(() => undefined);
      return okVoid();
    } catch (error) {
      return err(new AudioFailure('Ses efekti çalınamadı.', error));
    }
  }

  async startAmbient(type: AmbientType): AsyncResult<void> {
    try {
      this.ensureAudioMode();
      this.releaseWithFade(this.ambientPlayer);
      const player = createAudioPlayer(AMBIENT_SOURCES[type]);
      player.loop = true;
      player.volume = 0;
      player.play();
      this.ambientPlayer = player;
      this.currentAmbient = type;
      this.rampVolume(player, 0, 1, FADE_IN_MS);
      return okVoid();
    } catch (error) {
      this.ambientPlayer = null;
      this.currentAmbient = null;
      return err(new AudioFailure('Ortam sesi başlatılamadı.', error));
    }
  }

  async stopAmbient(): AsyncResult<void> {
    try {
      this.releaseWithFade(this.ambientPlayer);
      return okVoid();
    } catch (error) {
      return err(new AudioFailure('Ortam sesi durdurulamadı.', error));
    } finally {
      this.ambientPlayer = null;
      this.currentAmbient = null;
    }
  }

  private ensureAudioMode(): void {
    if (this.modeConfigured) return;
    this.modeConfigured = true;
    setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' }).catch(() => {
      this.modeConfigured = false;
    });
  }

  private getEffectPlayer(effect: SoundEffect): AudioPlayer {
    const existing = this.effectPlayers.get(effect);
    if (existing) return existing;
    const player = createAudioPlayer(EFFECT_SOURCES[effect]);
    this.effectPlayers.set(effect, player);
    return player;
  }

  // Sesi kısarak durdurur ve oynatıcıyı serbest bırakır
  private releaseWithFade(player: AudioPlayer | null): void {
    if (!player) return;
    this.rampVolume(player, player.volume, 0, FADE_OUT_MS, () => {
      player.pause();
      player.remove();
    });
  }

  private rampVolume(
    player: AudioPlayer,
    from: number,
    to: number,
    durationMs: number,
    onDone?: () => void,
  ): void {
    const previous = this.fadeTimers.get(player);
    if (previous) clearInterval(previous);

    const steps = Math.max(1, Math.round(durationMs / FADE_STEP_MS));
    let step = 0;
    const timer = setInterval(() => {
      step += 1;
      try {
        player.volume = from + ((to - from) * step) / steps;
      } catch {
        // Oynatıcı serbest bırakılmış olabilir
        step = steps;
      }
      if (step >= steps) {
        clearInterval(timer);
        this.fadeTimers.delete(player);
        onDone?.();
      }
    }, FADE_STEP_MS);
    this.fadeTimers.set(player, timer);
  }
}
