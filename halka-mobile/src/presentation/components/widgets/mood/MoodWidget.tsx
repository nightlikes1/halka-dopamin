// 🌟 Ruh Hali & Enerji (web'deki input[type=range] yerine Slider)
import Slider from '@react-native-community/slider';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { themedStyles } from '@core/theme/themed';
import { withAlpha } from '@core/theme/palettes';
import { colors, fonts, fontSizes, radius, spacing } from '@core/theme/tokens';
import { ENERGY_MAX, ENERGY_MIN, MOOD_OPTIONS, REFLECTION_MAX_LENGTH } from '@domain/entities/Mood';
import { getCatalogItem } from '@domain/entities/WidgetCatalog';
import { AppText } from '@presentation/components/common/AppText';
import { AppTextInput } from '@presentation/components/common/AppTextInput';
import type { WidgetBodyProps } from '@presentation/components/widgets/types';
import { widgetStyles } from '@presentation/components/widgets/widgetStyles';
import { useMood } from '@presentation/hooks/useMood';
import { widgetAccentColor } from '@presentation/components/widgets/widgetAccent';

const accent = () => widgetAccentColor(getCatalogItem('mood').accent);

export function MoodWidget({ variant }: WidgetBodyProps) {
  const { mood, setMood, setEnergy, setReflection } = useMood();
  const focused = variant === 'focused';
  // Yalnızca etkileşim sürerken yerel taslak tutulur; aksi halde store değeri gösterilir
  const [draggingEnergy, setDraggingEnergy] = useState<number | null>(null);
  const [reflectionDraft, setReflectionDraft] = useState<string | null>(null);
  const energy = draggingEnergy ?? mood.energyLevel;
  const reflection = reflectionDraft ?? mood.reflection;

  const commitEnergy = (value: number) => {
    setDraggingEnergy(null);
    void setEnergy(value);
  };

  const commitReflection = () => {
    if (reflectionDraft !== null) void setReflection(reflectionDraft);
    setReflectionDraft(null);
  };

  return (
    <View style={focused ? widgetStyles.containerFocused : widgetStyles.container}>
      <View style={styles.moods}>
        {MOOD_OPTIONS.map((option) => {
          const active = option.id === mood.todayMood;
          return (
            <Pressable
              key={option.id}
              onPress={() => void setMood(option.id)}
              accessibilityRole="radio"
              aria-checked={active}
              accessibilityLabel={option.label}
              style={({ pressed }) => [
                styles.moodButton,
                active && { borderColor: accent(), backgroundColor: withAlpha(accent(), '22') },
                pressed && styles.pressed,
              ]}
            >
              <AppText style={styles.moodIcon}>{option.icon}</AppText>
              <AppText style={[styles.moodName, active && { color: accent() }]}>
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.energy}>
        <AppText variant="muted">
          Enerji Seviyesi: <AppText style={styles.energyValue}>{energy}</AppText>/10
        </AppText>
        <Slider
          minimumValue={ENERGY_MIN}
          maximumValue={ENERGY_MAX}
          step={1}
          value={mood.energyLevel}
          onValueChange={setDraggingEnergy}
          onSlidingComplete={commitEnergy}
          minimumTrackTintColor={accent()}
          maximumTrackTintColor={colors.borderStrong}
          thumbTintColor={accent()}
          accessibilityLabel="Enerji seviyesi"
        />
      </View>

      {focused ? (
        <AppTextInput
          value={reflection}
          onChangeText={setReflectionDraft}
          onEndEditing={commitReflection}
          placeholder="Günün kısa hissi..."
          maxLength={REFLECTION_MAX_LENGTH}
          returnKeyType="done"
          accessibilityLabel="Günün kısa hissi"
        />
      ) : null}
    </View>
  );
}

const styles = themedStyles(() => ({
  moods: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  moodButton: {
    flexGrow: 1,
    minWidth: 56,
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    backgroundColor: colors.fillSubtle,
  },
  pressed: { opacity: 0.7 },
  moodIcon: { fontSize: fontSizes.xl },
  moodName: { fontSize: fontSizes.xs, color: colors.textMuted },
  energy: { gap: spacing.xs },
  energyValue: { fontFamily: fonts.bold, color: colors.textMain, fontSize: fontSizes.sm },
}));
