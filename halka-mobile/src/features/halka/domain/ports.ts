// Halka panosunun dış dünya sözleşmeleri: depolama, ses, pano (uygulamaları data katmanında)
import type { AsyncResult, Result } from '@core/result/Result';
import type { AmbientType, SoundEffect } from '@features/halka/domain/entities/Audio';
import type { BigOne } from '@features/halka/domain/entities/BigOne';
import type { Budget } from '@features/halka/domain/entities/Budget';
import type { Mood } from '@features/halka/domain/entities/Mood';
import type { Note } from '@features/halka/domain/entities/Note';
import type { Pomodoro } from '@features/halka/domain/entities/Pomodoro';
import type { Profile } from '@features/halka/domain/entities/Profile';
import type { Streak } from '@features/halka/domain/entities/Streak';
import type { TaskList } from '@features/halka/domain/entities/Task';
import type { Water } from '@features/halka/domain/entities/Water';
import type { WidgetId } from '@features/halka/domain/entities/WidgetId';

// Tek bir varlığı okuyan/yazan genel repository sözleşmesi
export interface IEntityRepository<T> {
  get(): AsyncResult<T>;
  save(value: T): AsyncResult<void>;
}

// Tüm repository'lerin toplu tipi (DI için)
export interface Repositories {
  readonly profile: IEntityRepository<Profile>;
  readonly layout: IEntityRepository<readonly WidgetId[]>;
  readonly water: IEntityRepository<Water>;
  readonly pomodoro: IEntityRepository<Pomodoro>;
  readonly tasks: IEntityRepository<TaskList>;
  readonly streak: IEntityRepository<Streak>;
  readonly notes: IEntityRepository<Note>;
  readonly mood: IEntityRepository<Mood>;
  readonly bigOne: IEntityRepository<BigOne>;
  readonly budget: IEntityRepository<Budget>;
}

// Ses altyapısı için domain portu (uygulaması data katmanında)
export interface AudioPort {
  setEnabled(enabled: boolean): void;
  isEnabled(): boolean;
  playEffect(effect: SoundEffect): Result<void>;
  startAmbient(type: AmbientType): Promise<Result<void>>;
  stopAmbient(): Promise<Result<void>>;
  getCurrentAmbient(): AmbientType | null;
}

// Pano erişimi için domain portu
export interface ClipboardPort {
  copyText(text: string): AsyncResult<void>;
}
