// Cihaza özel arayüz tercihleri (sunucuya gitmez): görsel stil ve karşılama ekranının görülmesi.
// Okuma hatası uygulamayı durdurmaz; varsayılan değer döner.
import AsyncStorage from '@react-native-async-storage/async-storage';

// core/theme/tokens.ts ColorScheme ile aynı (veri katmanı tema katmanına bağlanamaz)
export type VisualStyle = 'particles' | 'classic';

const VISUAL_STYLE_KEY = 'halka.visualStyle';
const ONBOARDING_KEY = 'halka.onboardingSeen';

export const DEFAULT_VISUAL_STYLE: VisualStyle = 'particles';

export interface DevicePreferences {
  readonly visualStyle: VisualStyle;
  readonly onboardingSeen: boolean;
}

const isScheme = (value: string | null): value is VisualStyle =>
  value === 'particles' || value === 'classic';

export async function loadDevicePreferences(): Promise<DevicePreferences> {
  try {
    const [style, seen] = await Promise.all([
      AsyncStorage.getItem(VISUAL_STYLE_KEY),
      AsyncStorage.getItem(ONBOARDING_KEY),
    ]);
    return {
      visualStyle: isScheme(style) ? style : DEFAULT_VISUAL_STYLE,
      onboardingSeen: seen === 'true',
    };
  } catch {
    return { visualStyle: DEFAULT_VISUAL_STYLE, onboardingSeen: false };
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

export async function markOnboardingSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  } catch {
    // Kaydedilemezse karşılama ekranı bir sonraki açılışta yeniden görünür; sorun değil
  }
}
