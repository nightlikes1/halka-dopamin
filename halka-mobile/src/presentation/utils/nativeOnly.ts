// Reanimated düzen animasyonları (entering/exiting/layout) web'de sonradan eklenen öğeyi akıştan çıkarıp
// bir an öncekilerin üstüne bindiriyor. Bu animasyonlar yalnızca mobilde verilir; web'de animasyonsuz.
import { Platform } from 'react-native';

export function nativeOnly<T>(animation: T): T | undefined {
  return Platform.OS === 'web' ? undefined : animation;
}
