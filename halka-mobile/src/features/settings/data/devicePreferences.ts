// Cihaza özel arayüz tercihleri (sunucuya gitmez): tema ailesi, görsel stil, renk modu ve karşılama
// ekranının görülmesi. Okuma hatası uygulamayı durdurmaz; varsayılan değer döner.
import AsyncStorage from '@react-native-async-storage/async-storage';

// core/theme/tokens.ts ColorScheme / ThemeFamily ile aynı (veri katmanı tema katmanına bağlanamaz)
export type VisualStyle = 'particles' | 'classic';
export type ThemeFamilyPreference = 'obsidian' | 'halka';
// 'system' telefonun açık/koyu ayarını izler
export type ThemeModePreference = 'system' | 'dark' | 'light';

const VISUAL_STYLE_KEY = 'halka.visualStyle';
const THEME_MODE_KEY = 'halka.themeMode';
const THEME_FAMILY_KEY = 'halka.themeFamily';
const ONBOARDING_KEY = 'halka.onboardingSeen';

export interface DevicePreferences {
  readonly visualStyle: VisualStyle;
  readonly themeFamily: ThemeFamilyPreference;
  readonly themeMode: ThemeModePreference;
  readonly onboardingSeen: boolean;
}

// Kayıt yoksa: iPhone'da yeni tema (Halka + Liquid Glass + sistem modu), diğerlerinde Obsidyen koyu
export function defaultDevicePreferences(isIphone: boolean): DevicePreferences {
  return {
    visualStyle: 'particles',
    themeFamily: isIphone ? 'halka' : 'obsidian',
    themeMode: isIphone ? 'system' : 'dark',
    onboardingSeen: false,
  };
}

const isScheme = (value: string | null): value is VisualStyle =>
  value === 'particles' || value === 'classic';

const isThemeFamily = (value: string | null): value is ThemeFamilyPreference =>
  value === 'obsidian' || value === 'halka';

const isThemeMode = (value: string | null): value is ThemeModePreference =>
  value === 'system' || value === 'dark' || value === 'light';

export async function loadDevicePreferences(isIphone: boolean): Promise<DevicePreferences> {
  const defaults = defaultDevicePreferences(isIphone);
  try {
    const [style, family, mode, seen] = await Promise.all([
      AsyncStorage.getItem(VISUAL_STYLE_KEY),
      AsyncStorage.getItem(THEME_FAMILY_KEY),
      AsyncStorage.getItem(THEME_MODE_KEY),
      AsyncStorage.getItem(ONBOARDING_KEY),
    ]);
    return {
      visualStyle: isScheme(style) ? style : defaults.visualStyle,
      themeFamily: isThemeFamily(family) ? family : defaults.themeFamily,
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

// Başarılıysa true
export const saveThemeFamily = (family: ThemeFamilyPreference): Promise<boolean> =>
  save(THEME_FAMILY_KEY, family);

export async function markOnboardingSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  } catch {
    // Kaydedilemezse karşılama ekranı bir sonraki açılışta yeniden görünür; sorun değil
  }
}
