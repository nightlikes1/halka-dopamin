// Seçili günün özeti: check-in sonucu ve not (ekle / düzenle / sil).
// Gün ya da not değişince üst bileşen key ile yeniden oluşturur; yerel taslak sıfırlanır.
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { colors, fontSizes, spacing } from '@core/theme/tokens';
import { formatDayMonth } from '@core/utils/date';
import { BalanceBadge } from '@features/checkin/presentation/components/BalanceBadge';
import type { DaySummary } from '@features/history/domain/entities';
import { supportMessage } from '@features/checkin/presentation/supportMessage';
import { DayNoteField } from '@features/history/presentation/components/DayNoteField';
import { ActionButton } from '@presentation/components/common/ActionButton';
import { AppText } from '@presentation/components/common/AppText';
import { Card } from '@presentation/components/common/Card';
import { Chip } from '@presentation/components/common/Chip';
import { confirmAction } from '@presentation/utils/dialogs';

const t = strings.history;

interface DayDetailProps {
  readonly day: DaySummary;
  readonly canCheckIn: boolean;
  readonly onOpenCheckIn: () => void;
  readonly onSaveNote: (text: string) => Promise<string | null>;
  readonly onDeleteNote: () => Promise<string | null>;
}

export function DayDetail({
  day,
  canCheckIn,
  onOpenCheckIn,
  onSaveNote,
  onDeleteNote,
}: DayDetailProps) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(day.note?.text ?? '');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    const result = await onSaveNote(text);
    setBusy(false);
    setError(result);
    if (!result) setEditing(false);
  };

  const confirmDelete = () => {
    confirmAction({
      title: t.deleteTitle,
      message: t.deleteBody,
      confirmText: strings.common.delete,
      cancelText: strings.common.cancel,
      destructive: true,
      onConfirm: () => void onDeleteNote().then(setError),
    });
  };

  const rating = day.checkIn?.rating;

  return (
    <Card>
      <View style={styles.headerRow}>
        <AppText variant="subtitle" accessibilityRole="header">
          {formatDayMonth(day.date)}
        </AppText>
        {canCheckIn ? <Chip label={t.openCheckIn} size="sm" onPress={onOpenCheckIn} /> : null}
      </View>

      {day.isFuture ? <AppText variant="muted">{t.futureDay}</AppText> : null}

      {day.checkIn && day.balance ? (
        <>
          <BalanceBadge score={day.balance.score} />
          {rating ? (
            <AppText variant="muted">
              {strings.checkIn.ratingEmojis[rating - 1]} {strings.checkIn.ratingLabels[rating - 1]}
            </AppText>
          ) : null}
          {day.troubled ? (
            <AppText variant="muted">{supportMessage(day.balance.score, day.troubled)}</AppText>
          ) : null}
        </>
      ) : !day.isFuture ? (
        <AppText variant="muted">{t.noCheckIn}</AppText>
      ) : null}

      {!day.isFuture ? (
        <View style={styles.noteBlock}>
          {editing ? (
            <>
              <DayNoteField value={text} onChange={setText} label={t.note} autoFocus />
              <View style={styles.actions}>
                <Chip label={strings.common.cancel} onPress={() => setEditing(false)} />
                <ActionButton
                  label={strings.common.save}
                  variant="solid"
                  disabled={busy}
                  onPress={() => void save()}
                />
              </View>
            </>
          ) : day.note ? (
            <>
              <AppText variant="label" style={styles.noteLabel}>
                {t.note}
              </AppText>
              <AppText>{day.note.text}</AppText>
              <View style={styles.actions}>
                <Chip label={strings.common.edit} onPress={() => setEditing(true)} />
                <Chip label={strings.common.delete} onPress={confirmDelete} />
              </View>
            </>
          ) : (
            <Chip label={t.addNote} icon="plus" onPress={() => setEditing(true)} />
          )}
          {error ? <AppText style={styles.error}>{error}</AppText> : null}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  noteBlock: { gap: spacing.sm },
  noteLabel: { color: colors.textMuted },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.sm,
  },
  error: { color: colors.danger, fontSize: fontSizes.sm },
});
