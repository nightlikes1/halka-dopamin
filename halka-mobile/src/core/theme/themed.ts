// Temaya bağlı modül sabitleri: değer ilk erişimde aktif temayla üretilir ve tema başına önbelleğe
// alınır. Tema değişince (applyThemeMode) sonraki erişim yeni temanın değerini döndürür; çağrı yerleri
// `styles.card`, `typography.body` biçiminde aynı kalır. Uygulama yeniden yüklenmeden tema değişir.
import { StyleSheet, type ViewStyle, type TextStyle, type ImageStyle } from 'react-native';
import { activeThemeMode, type ThemeMode } from '@core/theme/tokens';

export function themed<T extends object>(factory: () => T): T {
  const cache: Partial<Record<ThemeMode, T>> = {};
  const current = (): T => {
    const mode = activeThemeMode();
    const cached = cache[mode];
    if (cached) return cached;
    const value = factory();
    cache[mode] = value;
    return value;
  };
  return new Proxy({} as T, {
    get: (_target, key) => Reflect.get(current(), key),
    has: (_target, key) => Reflect.has(current(), key),
    ownKeys: () => Reflect.ownKeys(current()),
    getOwnPropertyDescriptor: (_target, key) => {
      const descriptor = Reflect.getOwnPropertyDescriptor(current(), key);
      return descriptor ? { ...descriptor, configurable: true } : undefined;
    },
  });
}

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

// StyleSheet.create'in temaya bağlı karşılığı
export function themedStyles<T extends NamedStyles<T>>(factory: () => T & NamedStyles<T>): T {
  return themed(() => StyleSheet.create(factory()) as T);
}
