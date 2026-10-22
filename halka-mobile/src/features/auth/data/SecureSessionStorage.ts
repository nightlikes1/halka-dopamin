// Oturumu expo-secure-store ile şifreli saklar (token AsyncStorage'a yazılmaz).
// HTTP istemcisi token'ı senkron okuyabilsin diye bellek içi kopya tutulur.
import * as SecureStore from 'expo-secure-store';
import { StorageFailure } from '@core/errors/Failure';
import { err, ok, okVoid, type AsyncResult } from '@core/result/Result';
import { storedSessionSchema, toAuthSession } from '@features/auth/data/authDto';
import type { AuthSession } from '@features/auth/domain/entities';
import type { SessionStorage } from '@features/auth/domain/ports';

const SESSION_KEY = 'halka_auth_session';

// SecureStore yerine testlerde bellek içi uygulama verilebilir
export interface SecureKeyValueStore {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  deleteItemAsync(key: string): Promise<void>;
}

export class SecureSessionStorage implements SessionStorage {
  private current: AuthSession | null = null;

  constructor(private readonly store: SecureKeyValueStore = SecureStore) {}

  // Senkron erişim (HTTP interceptor için)
  peekToken(): string | null {
    return this.current?.token ?? null;
  }

  async load(): AsyncResult<AuthSession | null> {
    try {
      const raw = await this.store.getItemAsync(SESSION_KEY);
      if (raw === null) {
        this.current = null;
        return ok(null);
      }
      const parsed = storedSessionSchema.safeParse(JSON.parse(raw) as unknown);
      // Bozuk kayıt: oturum yok sayılır
      this.current = parsed.success ? toAuthSession(parsed.data) : null;
      return ok(this.current);
    } catch (error) {
      return err(new StorageFailure('Oturum bilgisi okunamadı.', error));
    }
  }

  async save(session: AuthSession): AsyncResult<void> {
    try {
      await this.store.setItemAsync(SESSION_KEY, JSON.stringify(session));
      this.current = session;
      return okVoid();
    } catch (error) {
      return err(new StorageFailure('Oturum bilgisi kaydedilemedi.', error));
    }
  }

  async clear(): AsyncResult<void> {
    this.current = null;
    try {
      await this.store.deleteItemAsync(SESSION_KEY);
      return okVoid();
    } catch (error) {
      return err(new StorageFailure('Oturum bilgisi silinemedi.', error));
    }
  }
}
