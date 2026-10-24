// Cihaza özel arayüz tercihleri (sunucuya gitmez): görsel stil, renk teması ve karşılama ekranının görülmesi.
// Okuma hatası uygulamayı durdurmaz; varsayılan değer döner.
import AsyncStorage from '@react-native-async-storage/async-storage';

// core/theme/tokens.ts ColorScheme / ThemeMode ile aynı (veri katmanı tema katmanına bağlanamaz)
export type VisualStyle = 'particles' | 'classic';
export type ThemeModePreference = 'dark' | 'light';

const VISUAL_STYLE_KEY = 'halka.visualStyle';
const THEME_MODE_KEY = 'halka.themeMode';
const ONBOARDING_KEY = 'halka.onboardingSeen';

export const DEFAULT_VISUAL_STYLE: VisualStyle = 'particles';
export const DEFAULT_THEME_MODE: ThemeModePreference = 'dark';

export interface DevicePreferences {
  readonly visualStyle: VisualStyle;
  readonly themeMode: ThemeModePreference;
  readonly onboardingSeen: boolean;
}

const isScheme = (value: string | null): value is VisualStyle =>
  value === 'particles' || value === 'classic';

const isThemeMode = (value: string | null): value is ThemeModePreference =>
  value === 'dark' || value === 'light';

export async function loadDevicePreferences(): Promise<DevicePreferences> {
  try {
    const [style, mode, seen] = await Promise.all([
      AsyncStorage.getItem(VISUAL_STYLE_KEY),
      AsyncStorage.getItem(THEME_MODE_KEY),
      AsyncStorage.getItem(ONBOARDING_KEY),
    ]);
    return {
      visualStyle: isScheme(style) ? style : DEFAULT_VISUAL_STYLE,
      themeMode: isThemeMode(mode) ? mode : DEFAULT_THEME_MODE,
      onboardingSeen: seen === 'true',
    };
  } catch {
    return {
      visualStyle: DEFAULT_VISUAL_STYLE,
      themeMode: DEFAULT_THEME_MODE,
      onboardingSeen: false,
    };
  }
}

// Başarılıysa true
export async function saveVisualStyle(style: VisualStyle): Promise<boolean> {
  try {
    await AsyncStorage.setItem(VISUAL_STYLE_KEY, style);
    return true;
  } catch {
    return false;
  }
}

// Başarılıysa true
export async function saveThemeMode(mode: ThemeModePreference): Promise<boolean> {
  try {
    await AsyncStorage.setItem(THEME_MODE_KEY, mode);
    return true;
  } catch {
    return false;
  }
}

export async function markOnboardingSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  } catch {
    // Kaydedilemezse karşılama ekranı bir sonraki açılışta yeniden görünür; sorun değil
  }
}
