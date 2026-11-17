// Alttan açılan seçenek penceresi (⋯ menüsü): üstte tutamaç ve Kapat, en fazla 4 seçenek;
// geri alınamayan seçenek en altta ve kırmızı.
import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { layout } from '@core/theme/layout';
import { colors, radius, spacing } from '@core/theme/tokens';
import { themedStyles } from '@core/theme/themed';
import { AppText } from '@presentation/components/common/AppText';
import { Icon, type IconName } from '@presentation/components/common/Icon';

export interface ActionSheetOption {
  readonly key: string;
  readonly label: string;
  readonly icon: IconName;
  readonly destructive?: boolean;
  readonly onPress: () => void;
}

interface ActionSheetProps {
  readonly visible: boolean;
  readonly title: string;
  readonly closeLabel: string;
  readonly options: readonly ActionSheetOption[];
  readonly onClose: () => void;
}

const MAX_OPTIONS = 4;

export function ActionSheet({ visible, title, closeLabel, options, onClose }: ActionSheetProps) {
  const insets = useSafeAreaInsets();
  // Geri alınamayanlar sona
  const ordered = [
    ...options.filter((option) => !option.destructive),
    ...options.filter((option) => option.destructive),
  ].slice(0, MAX_OPTIONS);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={closeLabel}
        />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <AppText variant="bodyStrong" numberOfLines={1} style={styles.title}>
              {title}
            </AppText>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              hitSlop={spacing.md}
              style={styles.close}
            >
              <AppText variant="bodyL" style={styles.closeText}>
                {closeLabel}
              </AppText>
            </Pressable>
          </View>
          <View style={styles.list}>
            {ordered.map((option, index) => {
              const tone = option.destructive ? colors.danger : colors.textPrimary;
              return (
                <Pressable
                  key={option.key}
                  onPress={() => {
                    onClose();
                    option.onPress();
                  }}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.row,
                    index > 0 && styles.divider,
                    pressed && styles.pressed,
                  ]}
                >
                  <Icon name={option.icon} size={20} color={tone} />
                  <AppText variant="bodyL" style={{ color: tone }}>
                    {option.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = themedStyles(() => ({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.overlay,
  },
  sheet: {
    gap: spacing.md,
    paddingTop: spacing.sm,
    paddingHorizontal: layout.edge,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    backgroundColor: colors.surface,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 5,
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },
  header: { flexDirection: 'row', alignItems: 'center', minHeight: layout.touchTarget },
  title: { flex: 1 },
  close: { minHeight: layout.touchTarget, justifyContent: 'center' },
  closeText: { color: colors.gold },
  list: { borderRadius: radius.field, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  divider: { borderTopWidth: 1, borderTopColor: colors.hairline },
  pressed: { backgroundColor: colors.fillMuted },
}));
