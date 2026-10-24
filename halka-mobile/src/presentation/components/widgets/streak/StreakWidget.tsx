// Zinciri Kırma
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { themedStyles } from '@core/theme/themed';
import { withAlpha } from '@core/theme/palettes';
import { colors, fonts, fontSizes, radius, spacing } from '@core/theme/tokens';
import { formatShortDayName } from '@core/utils/date';
import { getCatalogItem } from '@domain/entities/WidgetCatalog';
import { ActionButton } from '@presentation/components/common/ActionButton';
import { AppText } from '@presentation/components/common/AppText';
import { Icon } from '@presentation/components/common/Icon';
import type { WidgetBodyProps } from '@presentation/components/widgets/types';
import { widgetStyles } from '@presentation/components/widgets/widgetStyles';
import { useStreak } from '@presentation/hooks/useStreak';
import { widgetAccentColor } from '@presentation/components/widgets/widgetAccent';

const accent = () => widgetAccentColor(getCatalogItem('streak').accent);

function Flame({ size }: { readonly size: number }) {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(withTiming(1.12, { duration: 1500 }), -1, true);
  }, [scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={style}>
      <Icon name="zap" size={size} color={accent()} />
    </Animated.View>
  );
}

export function StreakWidget({ variant }: WidgetBodyProps) {
  const { streak, currentStreak, history, checkedInToday, checkIn } = useStreak();
  const focused = variant === 'focused';

  const buttonLabel = checkedInToday
    ? 'Bugünkü halka eklendi'
    : focused
      ? 'Bugünkü Halkayı Kilitle & Ekle'
      : 'Bugünkü Halkayı Ekle';

  return (
    <View style={focused ? widgetStyles.containerFocused : widgetStyles.container}>
      {focused ? (
        <View style={widgetStyles.centered}>
          <Flame size={48} />
          <AppText style={[styles.bigNumber, { color: accent() }]}>{currentStreak}</AppText>
          <AppText variant="caption">GÜN KESİNTİSİZ ZİNCİR</AppText>
          <AppText style={styles.habitFocused}>{streak.habitName}</AppText>
          <AppText variant="muted">En iyi seri: {streak.bestStreak} gün</AppText>
        </View>
      ) : (
        <View style={widgetStyles.row}>
          <View style={[styles.flameBadge, { borderColor: withAlpha(accent(), '66') }]}>
            <Flame size={20} />
            <AppText style={[styles.count, { color: accent() }]}>{currentStreak}</AppText>
            <AppText style={styles.countLabel}>Gün Seri</AppText>
          </View>
          <AppText style={styles.habit} numberOfLines={2}>
            {streak.habitName}
          </AppText>
        </View>
      )}

      <View style={styles.chainBlock}>
        {focused ? <AppText variant="muted">Son Günlerin Zincir Durumu:</AppText> : null}
        <View style={styles.nodes}>
          {history.map((day, index) => (
            <View key={day.date} style={styles.nodeColumn}>
              <View
                style={[
                  styles.node,
                  day.done
                    ? { borderColor: accent(), backgroundColor: withAlpha(accent(), '26') }
                    : styles.nodeMissed,
                ]}
                accessibilityLabel={`${index + 1}. gün: ${day.done ? 'Yapıldı' : 'Boş'}`}
              >
                <Icon
                  name={day.done ? 'link' : 'circle'}
                  size={14}
                  color={day.done ? accent() : colors.textDim}
                />
              </View>
              <AppText style={styles.dayLabel}>{formatShortDayName(day.date)}</AppText>
            </View>
          ))}
        </View>
        {!focused ? <AppText style={styles.caption}>Son 7 Günlük Zincir</AppText> : null}
      </View>

      <ActionButton
        label={buttonLabel}
        icon={checkedInToday ? 'check' : 'plus'}
        color={accent()}
        disabled={checkedInToday}
        onPress={() => void checkIn()}
      />
    </View>
  );
}

const styles = themedStyles(() => ({
  flameBadge: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  count: { fontFamily: fonts.bold, fontSize: fontSizes.xl },
  countLabel: { fontSize: fontSizes.xs, color: colors.textMuted },
  habit: { flex: 1, fontFamily: fonts.semibold },
  bigNumber: { fontFamily: fonts.bold, fontSize: fontSizes.hero },
  habitFocused: { fontFamily: fonts.semibold, fontSize: fontSizes.lg, marginTop: spacing.sm },
  chainBlock: { gap: spacing.sm, alignItems: 'center' },
  nodes: { flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch' },
  nodeColumn: { alignItems: 'center', gap: 2 },
  node: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeMissed: { borderColor: colors.borderStrong, borderStyle: 'dashed' },
  dayLabel: { fontSize: fontSizes.xs, color: colors.textDim },
  caption: { fontSize: fontSizes.xs, color: colors.textDim },
}));
