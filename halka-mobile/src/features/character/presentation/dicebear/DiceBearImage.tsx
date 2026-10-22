// DiceBear avatarını çizer (iOS/Android: react-native-svg SvgXml). Web'de DiceBearImage.web.tsx.
import { useMemo } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import type { DiceBearAvatar } from '@features/character/domain/dicebear';
import { diceBearSvg } from '@features/character/presentation/dicebear/registry';

export interface DiceBearImageProps {
  readonly avatar: DiceBearAvatar;
  readonly seed: string;
  readonly size: number;
  readonly style?: StyleProp<ViewStyle>;
}

export function DiceBearImage({ avatar, seed, size, style }: DiceBearImageProps) {
  const xml = useMemo(() => diceBearSvg(avatar, seed), [avatar, seed]);
  return <SvgXml xml={xml} width={size} height={size} style={style} />;
}
