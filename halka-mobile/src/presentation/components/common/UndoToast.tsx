// Geri al bildirimi: sekme çubuğunun hemen üstünde, iki modda da koyu kapsül. Süre dolunca kaybolur
// (süreyi çağıran yönetir: useUndo).
import { Pressable, View } from 'react-native';
import { layout } from '@core/theme/layout';
import { halkaDark, radius, spacing } from '@core/theme/tokens';
import { themedStyles } from '@core/theme/themed';
import { AppText } from '@presentation/components/common/AppText';

interface UndoToastProps {
  readonly message: string;
  readonly undoLabel: string;
  readonly onUndo: () => void;
  readonly bottom: number;
}

export function UndoToast({ message, undoLabel, onUndo, bottom }: UndoToastProps) {
  return (
    <View style={[styles.wrap, { bottom }]} pointerEvents="box-none">
      <View style={styles.toast} accessibilityLiveRegion="polite">
        <AppText variant="secondary" numberOfLines={1} style={styles.message}>
          {message}
        </AppText>
        <Pressable
          onPress={onUndo}
          accessibilityRole="button"
          hitSlop={spacing.sm}
          style={styles.button}
        >
          <AppText variant="bodyStrong" style={styles.undo}>
            {undoLabel}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = themedStyles(() => ({
  wrap: { position: 'absolute', left: layout.edge, right: layout.edge, alignItems: 'center' },
  toast: {
    width: '100%',
    maxWidth: layout.dialogMaxWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingLeft: spacing.lgx,
    paddingRight: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: halkaDark.raised,
  },
  message: { flex: 1, color: halkaDark.textPrimary },
  button: {
    minHeight: layout.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  undo: { color: halkaDark.reward },
}));
