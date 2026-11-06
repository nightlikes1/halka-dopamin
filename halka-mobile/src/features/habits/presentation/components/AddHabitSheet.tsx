// Alttan açılan "Yeni alışkanlık" penceresi: bulunduğun ekrandan çıkmadan tür seç, adını yaz, ekle
import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { strings } from '@core/i18n/tr';
import { themedStyles } from '@core/theme/themed';
import { colors, radius, spacing } from '@core/theme/tokens';
import {
  HABIT_TITLE_MAX_LENGTH,
  habitTitleError,
  type HabitKind,
} from '@features/habits/domain/entities';
import { useHabits } from '@features/habits/presentation/useHabits';
import { AppText } from '@presentation/components/common/AppText';
import { AppTextInput } from '@presentation/components/common/AppTextInput';
import { IconButton } from '@presentation/components/common/IconButton';
import { PillButton } from '@presentation/components/common/PillButton';
import { SegmentedControl } from '@presentation/components/common/SegmentedControl';
import { hapticLight } from '@presentation/utils/haptics';

const t = strings.habits;

const ERROR_TEXT = {
  required: t.titleRequired,
  tooLong: t.titleTooLong,
  duplicate: t.titleDuplicate,
} as const;

interface AddHabitSheetProps {
  readonly visible: boolean;
  readonly onClose: () => void;
}

// Modal kapalıyken içeriği çizmez: form her açılışta temiz başlar
export function AddHabitSheet({ visible, onClose }: AddHabitSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <SheetForm onClose={onClose} />
    </Modal>
  );
}

function SheetForm({ onClose }: { readonly onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { habits, createHabit } = useHabits();
  const [kind, setKind] = useState<HabitKind>('build');
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (saving) return;
    const problem = habitTitleError(title, habits);
    if (problem) {
      setError(ERROR_TEXT[problem]);
      return;
    }
    setError(null);
    setSaving(true);
    const created = await createHabit({ kind, title: title.trim() });
    setSaving(false);
    if (created) {
      hapticLight();
      onClose();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={strings.common.cancel}
      />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <View style={styles.header}>
          <AppText variant="section" accessibilityRole="header" style={styles.flex}>
            {t.addTitle}
          </AppText>
          <IconButton
            icon="x"
            variant="ghost"
            size={44}
            accessibilityLabel={strings.common.cancel}
            onPress={onClose}
          />
        </View>

        <SegmentedControl<HabitKind>
          selected={kind}
          onChange={setKind}
          accessibilityLabel={t.kindLabel}
          options={[
            { value: 'build', label: t.kindBuild, color: colors.textPrimary },
            { value: 'quit', label: t.kindQuit, color: colors.textPrimary },
          ]}
        />

        <AppTextInput
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            if (error) setError(null);
          }}
          placeholder={kind === 'build' ? t.buildPlaceholder : t.quitPlaceholder}
          maxLength={HABIT_TITLE_MAX_LENGTH}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={() => void submit()}
          accessibilityLabel={t.titleLabel}
        />
        {error ? (
          <AppText variant="muted" style={styles.error} accessibilityLiveRegion="polite">
            {error}
          </AppText>
        ) : null}

        <PillButton
          label={saving ? t.adding : t.addCta}
          icon="plus"
          disabled={saving}
          onPress={() => void submit()}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = themedStyles(() => ({
  flex: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    gap: spacing.md,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.xl,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  header: { flexDirection: 'row', alignItems: 'center' },
  error: { color: colors.danger },
}));
