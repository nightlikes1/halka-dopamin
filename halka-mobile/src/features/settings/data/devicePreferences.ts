// Cihaza özel arayüz tercihleri (sunucuya gitmez): görsel stil, renk modu ve karşılama ekranının görülmesi. Okuma hatası uygulamayı durdurmaz; varsayılan değer döner.
import AsyncStorage from '@react-native-async-storage/async-storage';

// core/theme/tokens.ts ColorScheme ile aynı (veri katmanı tema katmanına bağlanamaz)
export type VisualStyle = 'particles' | 'classic';
// 'system' telefonun açık/koyu ayarını izler
export type ThemeModePreference = 'system' | 'dark' | 'light';

const VISUAL_STYLE_KEY = 'halka.visualStyle';
const THEME_MODE_KEY = 'halka.themeMode';
const ONBOARDING_KEY = 'halka.onboardingSeen';

export interface DevicePreferences {
  readonly visualStyle: VisualStyle;
  readonly themeMode: ThemeModePreference;
  readonly onboardingSeen: boolean;
}

// Kayıt yoksa: Liquid Glass + telefonun açık/koyu ayarı
export const DEFAULT_DEVICE_PREFERENCES: DevicePreferences = {
  visualStyle: 'particles',
  themeMode: 'system',
  onboardingSeen: false,
};

const isScheme = (value: string | null): value is VisualStyle =>
  value === 'particles' || value === 'classic';

const isThemeMode = (value: string | null): value is ThemeModePreference =>
  value === 'system' || value === 'dark' || value === 'light';

export async function loadDevicePreferences(): Promise<DevicePreferences> {
  const defaults = DEFAULT_DEVICE_PREFERENCES;
  try {
    const [style, mode, seen] = await Promise.all([
      AsyncStorage.getItem(VISUAL_STYLE_KEY),
      AsyncStorage.getItem(THEME_MODE_KEY),
      AsyncStorage.getItem(ONBOARDING_KEY),
    ]);
    return {
      visualStyle: isScheme(style) ? style : defaults.visualStyle,
      themeMode: isThemeMode(mode) ? mode : defaults.themeMode,
      onboardingSeen: seen === 'true',
    };
  } catch {
    return defaults;
  }
}

async function save(key: string, value: string): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

// Başarılıysa true
export const saveVisualStyle = (style: VisualStyle): Promise<boolean> =>
  save(VISUAL_STYLE_KEY, style);

// Başarılıysa true
export const saveThemeMode = (mode: ThemeModePreference): Promise<boolean> =>
  save(THEME_MODE_KEY, mode);

export async function markOnboardingSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  } catch {
    // Kaydedilemezse karşılama ekranı bir sonraki açılışta yeniden görünür; sorun değil
  }
}
