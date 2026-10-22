// Tema erişimi: uygulama tek (siyah-gri) temaya sahiptir; bileşenler paleti buradan alır
import { RING_PALETTE, type RingPalette } from '@core/theme/palettes';

interface ThemeValue {
  readonly palette: RingPalette;
}

const THEME: ThemeValue = { palette: RING_PALETTE };

export function useTheme(): ThemeValue {
  return THEME;
}
