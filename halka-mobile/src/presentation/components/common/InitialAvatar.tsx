// Baş harf avatarı (profil düğmesi, Çember şeridi): yuvarlak, tek harf
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, fonts } from '@core/theme/tokens';
import { themedStyles } from '@core/theme/themed';
import { AppText } from '@presentation/components/common/AppText';

interface InitialAvatarProps {
  readonly name: string;
  readonly size?: number;
  readonly color?: string;
  readonly textColor?: string;
  readonly style?: StyleProp<ViewStyle>;
}

export const initialOf = (name: string): string =>
  name.trim().charAt(0).toLocaleUpperCase('tr') || '·';

export function InitialAvatar({
  name,
  size = 36,
  color = colors.surfaceAlt,
  textColor = colors.textPrimary,
  style,
}: InitialAvatarProps) {
  return (
    <View
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        style,
      ]}
    >
      <AppText
        variant="bodyStrong"
        style={[styles.text, { color: textColor, fontSize: Math.round(size * 0.42) }]}
      >
        {initialOf(name)}
      </AppText>
    </View>
  );
}

const styles = themedStyles(() => ({
  base: { alignItems: 'center', justifyContent: 'center' },
  text: { fontFamily: fonts.bold, lineHeight: undefined },
}));
