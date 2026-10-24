// 🧘 Kutu Nefesi — küre nefes al/ver fazlarında büyüyüp küçülür
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { withAlpha } from '@core/theme/palettes';
import { colors, fonts, fontSizes } from '@core/theme/tokens';
import {
  BREATHING_GUIDE_TEXT,
  BREATHING_IDLE_LABEL,
  BREATHING_PHASE_MS,
  type BreathingPhaseId,
} from '@domain/entities/Breathing';
import { getCatalogItem } from '@domain/entities/WidgetCatalog';
import { ActionButton } from '@presentation/components/common/ActionButton';
import { AppText } from '@presentation/components/common/AppText';
import type { WidgetBodyProps } from '@presentation/components/widgets/types';
import { widgetStyles } from '@presentation/components/widgets/widgetStyles';
import { useBreathing } from '@presentation/hooks/useBreathing';
import { widgetAccentColor } from '@presentation/components/widgets/widgetAccent';

const ACCENT = widgetAccentColor(getCatalogItem('breathing').accent);

// Faz sonunda kürenin ulaşacağı ölçek
const TARGET_SCALE: Record<BreathingPhaseId, number> = {
  inhale: 1.35,
  hold: 1.35,
  exhale: 1,
  rest: 1,
};

const PHASE_COLOR: Record<BreathingPhaseId, string> = {
  inhale: ACCENT,
  hold: colors.textMain,
  exhale: colors.textMuted,
  rest: colors.borderStrong,
};

export function BreathingWidget({ variant }: WidgetBodyProps) {
  const { isRunning, phase, toggle } = useBreathing();
  const focused = variant === 'focused';
  const orbSize = focused ? 170 : 110;
  const scale = useSharedValue(1);

  useEffect(() => {
    const target = phase ? TARGET_SCALE[phase.id] : 1;
    scale.value = withTiming(target, {
      duration: phase ? BREATHING_PHASE_MS : 400,
      easing: Easing.inOut(Easing.ease),
    });
  }, [phase, scale]);

  const orbStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const color = phase ? PHASE_COLOR[phase.id] : ACCENT;

  return (
    <View style={focused ? widgetStyles.containerFocused : widgetStyles.container}>
      <View style={[styles.stage, { height: orbSize * 1.5 }]}>
        <Animated.View
          style={[
            styles.orb,
            {
              width: orbSize,
              height: orbSize,
              borderRadius: orbSize / 2,
              borderColor: color,
              backgroundColor: withAlpha(color, '2e'),
            },
            orbStyle,
          ]}
        >
          <AppText style={[styles.instruction, focused && styles.instructionFocused]}>
            {phase?.label ?? BREATHING_IDLE_LABEL}
          </AppText>
        </Animated.View>
      </View>
      <AppText style={[widgetStyles.statText, styles.center]}>{BREATHING_GUIDE_TEXT}</AppText>
      <ActionButton
        label={isRunning ? 'Durdur' : 'Egzersizi Başlat'}
        color={ACCENT}
        onPress={toggle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { alignItems: 'center', justifyContent: 'center' },
  orb: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  instruction: {
    fontFamily: fonts.semibold,
    fontSize: fontSizes.sm,
    color: colors.textMain,
    textAlign: 'center',
  },
  instructionFocused: { fontSize: fontSizes.lg },
  center: { textAlign: 'center' },
});
