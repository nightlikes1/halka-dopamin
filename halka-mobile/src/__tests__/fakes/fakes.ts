// Testlerde kullanılan sahte (fake) uygulamalar
import { AudioFailure, StorageFailure } from '@core/errors/Failure';
import { err, ok, okVoid, type AsyncResult, type Result } from '@core/result/Result';
import type { KeyValueStorage } from '@data/datasources/KeyValueStorage';
import type { AmbientType, SoundEffect } from '@domain/entities/Audio';
import type { HalkaSnapshot } from '@domain/entities/HalkaSnapshot';
import type { AudioPort } from '@domain/ports/AudioPort';
import type { ClipboardPort } from '@domain/ports/ClipboardPort';
import type { Clock } from '@domain/ports/Clock';
import type { IEntityRepository } from '@domain/repositories/IEntityRepository';
import type { Repositories } from '@domain/repositories/Repositories';

// Bellek içi repository; hata senaryoları için açılıp kapatılabilir
export class InMemoryRepository<T> implements IEntityRepository<T> {
  failOnGet = false;
  failOnSave = false;
  saveCount = 0;

  constructor(public value: T) {}

  async get(): AsyncResult<T> {
    return this.failOnGet ? err(new StorageFailure('okuma hatası')) : ok(this.value);
  }

  async save(value: T): AsyncResult<void> {
    if (this.failOnSave) return err(new StorageFailure('yazma hatası'));
    this.saveCount += 1;
    this.value = value;
    return okVoid();
  }
}

export type FakeRepositories = { [K in keyof Repositories]: InMemoryRepository<RepoValue<K>> };
type RepoValue<K extends keyof Repositories> =
  Repositories[K] extends IEntityRepository<infer T> ? T : never;

export function createFakeRepositories(snapshot: HalkaSnapshot): FakeRepositories {
  return {
    profile: new InMemoryRepository(snapshot.profile),
    layout: new InMemoryRepository(snapshot.activeWidgetIds),
    water: new InMemoryRepository(snapshot.water),
    pomodoro: new InMemoryRepository(snapshot.pomodoro),
    tasks: new InMemoryRepository(snapshot.tasks),
    streak: new InMemoryRepository(snapshot.streak),
    notes: new InMemoryRepository(snapshot.notes),
    mood: new InMemoryRepository(snapshot.mood),
    bigOne: new InMemoryRepository(snapshot.bigOne),
    budget: new InMemoryRepository(snapshot.budget),
  };
}

// Sabit/ilerletilebilir saat
export class FakeClock implements Clock {
  constructor(private current: Date) {}

  now(): Date {
    return new Date(this.current.getTime());
  }

  advance(ms: number): void {
    this.current = new Date(this.current.getTime() + ms);
  }

  set(date: Date): void {
    this.current = date;
  }
}

export class FakeAudioPort implements AudioPort {
  enabled = true;
  ambient: AmbientType | null = null;
  played: SoundEffect[] = [];
  failStart = false;

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) this.ambient = null;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  playEffect(effect: SoundEffect): Result<void> {
    this.played.push(effect);
    return okVoid();
  }

  async startAmbient(type: AmbientType): AsyncResult<void> {
    if (this.failStart) return err(new AudioFailure('başlatılamadı'));
    this.ambient = type;
    return okVoid();
  }

  async stopAmbient(): AsyncResult<void> {
    this.ambient = null;
    return okVoid();
  }

  getCurrentAmbient(): AmbientType | null {
    return this.ambient;
  }
}

export class FakeClipboard implements ClipboardPort {
  copied: string[] = [];

  async copyText(text: string): AsyncResult<void> {
    this.copied.push(text);
    return okVoid();
  }
}

// Bellek içi anahtar-değer deposu
export class InMemoryKeyValueStorage implements KeyValueStorage {
  readonly data = new Map<string, string>();
  failOnRead = false;
  failOnWrite = false;
  writeCount = 0;

  async getItem(key: string): Promise<string | null> {
    if (this.failOnRead) throw new Error('read failed');
    return this.data.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    if (this.failOnWrite) throw new Error('write failed');
    this.writeCount += 1;
    this.data.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.data.delete(key);
  }
}

// 14 Ekim 2026, 10:00 (yerel saat)
export const TEST_NOW = new Date(2026, 9, 14, 10, 0, 0);
export const TEST_TODAY = '2026-10-14';
