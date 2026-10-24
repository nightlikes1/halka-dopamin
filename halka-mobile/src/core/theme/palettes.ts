// Zincir halka paleti: düz koyu halkalar + şampanya vurgusu (gradient ve parlama yok)

import { colors } from '@core/theme/tokens';

export interface RingPalette {
  readonly accent: string;
  readonly accentAlt: string;
  readonly glow: string;
  readonly metalLight: string;
  readonly metalDark: string;
  readonly metalDeep: string;
  readonly orbitTrack: string;
  readonly tether: string;
}

// Modül yüklenirken aktif temadan okunur (tema açılışta, ekranlardan önce uygulanır)
export const RING_PALETTE: RingPalette = {
  accent: colors.gold,
  accentAlt: colors.sapphire,
  glow: withAlpha(colors.textPrimary, '0f'),
  metalLight: colors.textSecondary,
  metalDark: colors.border,
  metalDeep: colors.surfaceAlt,
  orbitTrack: withAlpha(colors.textPrimary, '12'),
  tether: withAlpha(colors.textPrimary, '2e'),
};

// "#rrggbb" + saydamlık (00-ff) -> "#rrggbbaa"
export function withAlpha(hex: string, alphaHex: string): string {
  return `${hex}${alphaHex}`;
}

// İki "#rrggbb" rengi karıştırır (t = 0 → a, 1 → b); gölge/ışık tonları için
export function mixHex(a: string, b: string, t: number): string {
  const channel = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  const out = [0, 1, 2].map((i) =>
    Math.round(channel(a, i) + (channel(b, i) - channel(a, i)) * t)
      .toString(16)
      .padStart(2, '0'),
  );
  return `#${out.join('')}`;
}
