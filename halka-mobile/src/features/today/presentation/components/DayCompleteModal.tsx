// Gün %100 olunca bir kez açılan kutlama: dolu halka + tek titreşim.
import { useEffect } from 'react';
import { Modal, View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { layout } from '@core/theme/layout';
import { themedStyles } from '@core/theme/themed';
import { colors, radius, spacing } from '@core/theme/tokens';
import { LiveRing } from '@features/today/presentation/components/LiveRing';
import { AppText } from '@presentation/components/common/AppText';
import { CapsuleButton } from '@presentation/components/common/CapsuleButton';
import { Icon } from '@presentation/components/common/Icon';
import { hapticSuccess } from '@presentation/utils/haptics';

const t = strings.today;

export function DayCompleteModal({
  visible,
  onClose,
}: {
  readonly visible: boolean;
  readonly onClose: () => void;
}) {
  useEffect(() => {
    if (visible) hapticSuccess();
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card} accessibilityViewIsModal>
          <LiveRing size={160} progress={1} mood="calm" still>
            <Icon name="check" size={48} color={colors.textPrimary} />
          </LiveRing>
          <AppText variant="flowTitle" accessibilityRole="header" style={styles.center}>
            {t.dayCompleteTitle}
          </AppText>
          <AppText variant="secondary" style={[styles.center, styles.body]}>
            {t.dayCompleteBody}
          </AppText>
          <CapsuleButton label={t.dayCompleteCta} onPress={onClose} style={styles.button} />
        </View>
      </View>
    </Modal>
  );
}

const styles = themedStyles(() => ({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: layout.edge,
  },
  card: {
    width: '100%',
    maxWidth: layout.dialogMaxWidth,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.lg,
  },
  center: { textAlign: 'center' },
  body: { color: colors.textSecondary },
  button: { alignSelf: 'stretch' },
}));
