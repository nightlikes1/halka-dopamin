// Bugün'deki alışkanlık satırı: ikon kutusu · başlık + alt satır · ⋯ · aksiyon dairesi.
// Sağa kaydırma ya da daire işaretler; metne uzun basma ve ⋯ menüyü açar. İç içe dokunulabilir öğe yok.
import { Pressable, View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { layout } from '@core/theme/layout';
import { themedStyles } from '@core/theme/themed';
import { colors, iconBoxRadius, radius, spacing } from '@core/theme/tokens';
import {
  isPendingHabit,
  type Habit,
  type HabitEntryStatus,
} from '@features/habits/domain/entities';
import { isCompleted } from '@features/today/domain/dayRules';
import { AppText } from '@presentation/components/common/AppText';
import { Icon } from '@presentation/components/common/Icon';
import { IconButton } from '@presentation/components/common/IconButton';
import { Panel } from '@presentation/components/common/Panel';
import { ScalePressable } from '@presentation/components/common/ScalePressable';
import { SwipeToComplete } from '@presentation/components/common/SwipeToComplete';

const t = strings.today;
const ICON_BOX = 40;
const ACTION = 36;

interface TodayHabitRowProps {
  readonly habit: Habit;
  readonly status: HabitEntryStatus | undefined;
  readonly mini: boolean;
  // Bırakılan alışkanlıkta uzak kalınan gece sayısı
  readonly nights: number;
  readonly accent: string;
  readonly onToggle: () => void;
  readonly onMenu: () => void;
}

export function subtitleFor(
  habit: Habit,
  status: HabitEntryStatus | undefined,
  mini: boolean,
  nights: number,
): string {
  if (isPendingHabit(habit)) return t.adding;
  if (habit.kind === 'quit') {
    if (status === 'clean') return t.quitDone(nights);
    if (status === 'slip') return t.quitSlipped;
    return t.quitStreak(nights);
  }
  if (status === 'done') return mini ? t.miniDone : t.habitDone;
  if (status === 'missed') return t.habitMissed;
  return t.miniHint(t.miniDefault);
}

export function TodayHabitRow({
  habit,
  status,
  mini,
  nights,
  accent,
  onToggle,
  onMenu,
}: TodayHabitRowProps) {
  const pending = isPendingHabit(habit);
  const done = isCompleted(status);
  const quit = habit.kind === 'quit';
  const actionLabel = done
    ? t.unmark(habit.title)
    : quit
      ? t.markClean(habit.title)
      : t.markDone(habit.title);

  return (
    <SwipeToComplete
      done={done}
      color={accent}
      label={done ? t.swipeUndo : t.swipeDone}
      onComplete={onToggle}
      enabled={!pending}
      cornerRadius={radius.card}
    >
      <Panel compact style={[styles.row, done && styles.faded]}>
        <View style={[styles.iconBox, { backgroundColor: accent }]}>
          <Icon name={quit ? 'shield' : 'check-circle'} size={20} color={colors.iconOnTint} />
        </View>
        <Pressable
          style={styles.text}
          onLongPress={pending ? undefined : onMenu}
          disabled={pending}
          accessibilityRole="text"
        >
          <AppText variant="bodyStrong" numberOfLines={1}>
            {habit.title}
          </AppText>
          <AppText variant="footnote" numberOfLines={1} style={styles.sub}>
            {subtitleFor(habit, status, mini, nights)}
          </AppText>
        </Pressable>
        <IconButton
          icon="more-horizontal"
          variant="ghost"
          size={layout.touchTarget}
          accessibilityLabel={t.more(habit.title)}
          onPress={onMenu}
          disabled={pending}
        />
        <ScalePressable
          onPress={onToggle}
          disabled={pending}
          accessibilityRole="checkbox"
          aria-checked={done}
          accessibilityLabel={actionLabel}
          style={styles.actionHit}
        >
          <View
            style={[
              styles.action,
              done ? { backgroundColor: accent, borderColor: accent } : styles.actionEmpty,
            ]}
          >
            {done ? (
              <Icon name="check" size={18} color={colors.iconOnTint} />
            ) : quit ? (
              <Icon name="shield" size={16} color={colors.textSecondary} />
            ) : null}
          </View>
        </ScalePressable>
      </Panel>
    </SwipeToComplete>
  );
}

const styles = themedStyles(() => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  faded: { opacity: 0.6 },
  iconBox: {
    width: ICON_BOX,
    height: ICON_BOX,
    borderRadius: iconBoxRadius(ICON_BOX),
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, minHeight: layout.touchTarget, justifyContent: 'center' },
  sub: { color: colors.textSecondary },
  actionHit: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  action: {
    width: ACTION,
    height: ACTION,
    borderRadius: ACTION / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionEmpty: { borderColor: colors.border },
}));
