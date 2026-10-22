// Açılışta yüklenen cihaz tercihleri: görsel stil (oturum boyunca sabit) ve karşılama ekranı durumu
import { create } from 'zustand';
import type { ColorScheme } from '@core/theme/tokens';
import { DEFAULT_VISUAL_STYLE, markOnboardingSeen } from '@data/preferences/devicePreferences';

interface PreferencesState {
  readonly visualStyle: ColorScheme;
  readonly onboardingSeen: boolean;
  init(visualStyle: ColorScheme, onboardingSeen: boolean): void;
  completeOnboarding(): void;
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  visualStyle: DEFAULT_VISUAL_STYLE,
  onboardingSeen: false,
  init: (visualStyle, onboardingSeen) => set({ visualStyle, onboardingSeen }),
  completeOnboarding: () => {
    set({ onboardingSeen: true });
    void markOnboardingSeen();
  },
}));

// Parçacık ekranları mı, klasik ekranlar mı
export const useParticleStyle = () => usePreferencesStore((s) => s.visualStyle === 'particles');
