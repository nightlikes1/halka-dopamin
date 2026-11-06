// Hiç eklenti yokken gösterilen davet kutusu
import { useEffect } from 'react';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, radius, spacing } from '@core/theme/tokens';
import { ActionButton } from '@presentation/components/common/ActionButton';
import { AppText } from '@presentation/components/common/AppText';
import { themedStyles } from '@core/theme/themed';

interface EmptyOrbitBannerProps {
  readonly onAddPress: () => void;
}

export function EmptyOrbitBanner({ onAddPress }: EmptyOrbitBannerProps) {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(withTiming(1.04, { duration: 900 }), -1, true);
  }, [scale]);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={styles.banner}>
      <AppText variant="muted" style={styles.text}>
        Halkanın etrafında henüz eklenti yok.
      </AppText>
      <Animated.View style={pulseStyle}>
        <ActionButton label="+ İlk Eklentini Ekle" variant="solid" onPress={onAddPress} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = themedStyles(() => ({
  banner: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
  },
  text: { textAlign: 'center' },
}));
