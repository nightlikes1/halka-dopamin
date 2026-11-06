// Halka zincir paletine erişim: renkler aktif temadan okunur (provider gerekmez)
import { RING_PALETTE, type RingPalette } from '@core/theme/palettes';

interface ThemeValue {
  readonly palette: RingPalette;
}

const THEME: ThemeValue = { palette: RING_PALETTE };

export function useTheme(): ThemeValue {
  return THEME;
}
