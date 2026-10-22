// Bugün sekmesindeki akşam check-in kartı (yapılmadıysa davet, yapıldıysa skor + düzenle)
import { StyleSheet, View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { colors, spacing } from '@core/theme/tokens';
import { addDays } from '@core/utils/date';
import { computeDailyBalance, isTroubledDay } from '@features/checkin/domain/balance';
import type { CheckInOverview } from '@features/checkin/domain/usecases/CheckInUseCases';
import { BalanceBadge } from '@features/checkin/presentation/components/BalanceBadge';
import { supportMessage } from '@features/checkin/presentation/supportMessage';
import { ActionButton } from '@presentation/components/common/ActionButton';
import { AppText } from '@presentation/components/common/AppText';
import { Card } from '@presentation/components/common/Card';
import { Chip } from '@presentation/components/common/Chip';
import { IconButton } from '@presentation/components/common/IconButton';
import { SectionTitle } from '@presentation/components/common/SectionTitle';

const t = strings.checkIn;

interface CheckInCardProps {
  readonly overview: CheckInOverview;
  readonly onOpen: (date: string) => void;
  readonly onHistory?: () => void;
}

export function CheckInCard({ overview, onOpen, onHistory }: CheckInCardProps) {
  const { today, todayCheckIn, yesterdayCheckIn } = overview;
  const balance = todayCheckIn ? computeDailyBalance(todayCheckIn) : null;
  const troubled = todayCheckIn ? isTroubledDay(todayCheckIn) : false;

  return (
    <Card>
      <SectionTitle
        title={t.title}
        icon="moon"
        action={
          onHistory ? (
            <IconButton
              icon="calendar"
              variant="ghost"
              size={44}
              accessibilityLabel={strings.today.history}
              onPress={onHistory}
            />
          ) : undefined
        }
      />

      {todayCheckIn && balance ? (
        <>
          <BalanceBadge score={balance.score} />
          <AppText variant="muted">{supportMessage(balance.score, troubled)}</AppText>
          <ActionButton label={t.edit} icon="edit-2" onPress={() => onOpen(today)} />
        </>
      ) : (
        <>
          <AppText variant="muted">{t.cardIntro}</AppText>
          <ActionButton label={t.start} variant="solid" onPress={() => onOpen(today)} />
        </>
      )}

      {/* Gece yarısından sonra dünü kaçıranlar için */}
      {!yesterdayCheckIn ? (
        <View style={styles.yesterday}>
          <AppText variant="muted" style={styles.flex}>
            {t.yesterdayPrompt}
          </AppText>
          <Chip label={t.yesterdayAction} size="sm" onPress={() => onOpen(addDays(today, -1))} />
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  yesterday: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderGlass,
  },
  flex: { flex: 1 },
});
