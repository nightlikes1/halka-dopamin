// Tek renkli çizgi ikon (Feather). Arayüz ikonları için emoji yerine bu kullanılır;
// emoji yalnızca içerik olarak (ruh hali, puan yüzleri) kalır.
// Feather'da olmayan birkaç ikon aynı çizgi stilindeki Ionicons karşılığıyla verilir.
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { colors } from '@core/theme/tokens';

type FeatherName = ComponentProps<typeof Feather>['name'];

const EXTRA_ICONS = {
  flame: 'flame-outline',
} as const satisfies Record<string, ComponentProps<typeof Ionicons>['name']>;

export type IconName = FeatherName | keyof typeof EXTRA_ICONS;

interface IconProps {
  readonly name: IconName;
  readonly size?: number;
  readonly color?: string;
  // Verilirse ikon ekran okuyucuya okunur; verilmezse süs kabul edilir
  readonly accessibilityLabel?: string;
}

const isExtra = (name: IconName): name is keyof typeof EXTRA_ICONS => name in EXTRA_ICONS;

export function Icon({ name, size = 20, color = colors.textMain, accessibilityLabel }: IconProps) {
  const a11y = {
    accessible: accessibilityLabel !== undefined,
    accessibilityLabel,
    importantForAccessibility: accessibilityLabel
      ? ('yes' as const)
      : ('no-hide-descendants' as const),
  };
  return isExtra(name) ? (
    <Ionicons name={EXTRA_ICONS[name]} size={size} color={color} {...a11y} />
  ) : (
    <Feather name={name} size={size} color={color} {...a11y} />
  );
}
