// Açılışta yüklenen cihaz tercihleri: görsel stil (oturum boyunca sabit), tema ailesi + renk modu
// (anında değişir) ve karşılama ekranı durumu
import { create } from 'zustand';
import type { ColorScheme, ThemeFamily, ThemeMode } from '@core/theme/tokens';
import {
  markOnboardingSeen,
  type ThemeModePreference,
} from '@features/settings/data/devicePreferences';

interface ThemeState {
  readonly themeFamily: ThemeFamily;
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
  themeFamily: 'obsidian',
  themePreference: 'dark',
  themeMode: 'dark',
  onboardingSeen: false,
  init: (visualStyle, theme, onboardingSeen) => set({ visualStyle, ...theme, onboardingSeen }),
  setTheme: (theme) => set(theme),
  completeOnboarding: () => {
    set({ onboardingSeen: true });
    void markOnboardingSeen();
  },
}));

// Parçacık ekranları mı, klasik ekranlar mı
export const useParticleStyle = () => usePreferencesStore((s) => s.visualStyle === 'particles');
// Yeni tasarım ailesi mi (Halka)
export const useHalkaFamily = () => usePreferencesStore((s) => s.themeFamily === 'halka');
