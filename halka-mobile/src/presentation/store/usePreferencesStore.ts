// Açılışta yüklenen cihaz tercihleri: görsel stil (oturum boyunca sabit), renk modu (anında değişir)
// ve karşılama ekranı durumu
import { create } from 'zustand';
import type { ColorScheme, ThemeMode } from '@core/theme/tokens';
import {
  markOnboardingSeen,
  type ThemeModePreference,
} from '@features/settings/data/devicePreferences';

interface ThemeState {
  // Kullanıcının seçimi (sistem / koyu / açık)
  readonly themePreference: ThemeModePreference;
  // Uygulanan mod (sistem seçiliyse telefonun ayarından çözülür)
  readonly themeMode: ThemeMode;
}

interface PreferencesState extends ThemeState {
  readonly visualStyle: ColorScheme;
  readonly onboardingSeen: boolean;
  init(visualStyle: ColorScheme, theme: ThemeState, onboardingSeen: boolean): void;
  setTheme(theme: ThemeState): void;
  completeOnboarding(): void;
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  // Açılışta init ile gerçek tercihler yazılır
  visualStyle: 'particles',
  themePreference: 'system',
  themeMode: 'dark',
  onboardingSeen: false,
  init: (visualStyle, theme, onboardingSeen) => set({ visualStyle, ...theme, onboardingSeen }),
  setTheme: (theme) => set(theme),
  completeOnboarding: () => {
    set({ onboardingSeen: true });
    void markOnboardingSeen();
  },
}));

// Liquid Glass mı, düz (klasik) ekranlar mı
export const useParticleStyle = () => usePreferencesStore((s) => s.visualStyle === 'particles');
