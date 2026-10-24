// 🎧 Ortam Sesleri
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, fonts, fontSizes, spacing } from '@core/theme/tokens';
import { AMBIENT_OPTIONS } from '@domain/entities/Audio';
import { getCatalogItem } from '@domain/entities/WidgetCatalog';
import { ActionButton } from '@presentation/components/common/ActionButton';
import { AppText } from '@presentation/components/common/AppText';
import { Chip } from '@presentation/components/common/Chip';
import { AMBIENT_ICONS } from '@presentation/components/common/iconMaps';
import type { WidgetBodyProps } from '@presentation/components/widgets/types';
import { themedStyles } from '@core/theme/themed';
import { widgetStyles } from '@presentation/components/widgets/widgetStyles';
import { useAmbient } from '@presentation/hooks/useAmbient';
import { widgetAccentColor } from '@presentation/components/widgets/widgetAccent';

const accent = () => widgetAccentColor(getCatalogItem('ambient').accent);

export function AmbientWidget({ variant }: WidgetBodyProps) {
  const { current, isPlaying, toggle, stop } = useAmbient();
  const focused = variant === 'focused';
  const wave = useSharedValue(1);

  useEffect(() => {
    if (isPlaying) {
      wave.value = withRepeat(withTiming(0.35, { duration: 700 }), -1, true);
    } else {
      cancelAnimation(wave);
      wave.value = 1;
    }
  }, [isPlaying, wave]);

  const waveStyle = useAnimatedStyle(() => ({ opacity: wave.value }));

  return (
    <View style={focused ? widgetStyles.containerFocused : widgetStyles.container}>
      <View style={widgetStyles.wrapRow}>
        {AMBIENT_OPTIONS.map((option) => (
          <Chip
            key={option.id}
            label={focused ? option.longLabel : option.label}
            icon={AMBIENT_ICONS[option.id]}
            variant={current === option.id ? 'active' : 'default'}
            accent={accent()}
            onPress={() => void toggle(option.id)}
          />
        ))}
      </View>

      <View style={[styles.status, focused && styles.statusFocused]}>
        {isPlaying ? (
          <Animated.View style={waveStyle}>
            <AppText style={[styles.playing, { color: accent() }]}>
              {focused ? 'Sentezlenmiş Ses Dalgaları Çalıyor...' : 'Sentezlenmiş Ortam Çalıyor...'}
            </AppText>
          </Animated.View>
        ) : (
          <AppText variant="muted">Sessiz</AppText>
        )}
      </View>

      {isPlaying ? (
        focused ? (
          <ActionButton
            label="Sesi Durdur"
            icon="square"
            color={accent()}
            onPress={() => void stop()}
          />
        ) : (
          <Chip label="Durdur" icon="square" onPress={() => void stop()} style={styles.stopChip} />
        )
      ) : null}
    </View>
  );
}

const styles = themedStyles(() => ({
  status: { alignItems: 'center', paddingVertical: spacing.sm },
  statusFocused: { paddingVertical: spacing.xl },
  playing: { fontFamily: fonts.semibold, fontSize: fontSizes.sm, color: colors.textMain },
  stopChip: { alignSelf: 'flex-start' },
}));
