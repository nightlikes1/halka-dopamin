// Yalnızca web önizlemesi için: expo-secure-store web'de çalışmadığından oturum tarayıcı belleğinde tutulur.
// Mobilde kullanılmaz (orada SecureStore şifreli saklar).
import type { SecureKeyValueStore } from '@features/auth/data/SecureSessionStorage';

export class BrowserKeyValueStore implements SecureKeyValueStore {
  async getItemAsync(key: string): Promise<string | null> {
    return globalThis.localStorage?.getItem(key) ?? null;
  }

  async setItemAsync(key: string, value: string): Promise<void> {
    globalThis.localStorage?.setItem(key, value);
  }

  async deleteItemAsync(key: string): Promise<void> {
    globalThis.localStorage?.removeItem(key);
  }
}
