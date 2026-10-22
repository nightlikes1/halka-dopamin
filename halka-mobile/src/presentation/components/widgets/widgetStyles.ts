// Eklenti gövdelerinde ortak kullanılan stiller
import { StyleSheet } from 'react-native';
import { colors, fonts, fontSizes, radius, spacing } from '@core/theme/tokens';

export const widgetStyles = StyleSheet.create({
  container: { gap: spacing.md },
  containerFocused: { gap: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  centered: { alignItems: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  statText: { color: colors.textMuted, fontSize: fontSizes.sm },
  emptyText: { color: colors.textDim, textAlign: 'center', paddingVertical: spacing.md },
  errorText: { color: colors.danger, fontSize: fontSizes.xs },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 1,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  badgeText: { fontFamily: fonts.bold, fontSize: fontSizes.xs, letterSpacing: 1 },
  bubble: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    backgroundColor: colors.fillSubtle,
  },
  bubbleValue: { fontFamily: fonts.mono, fontSize: fontSizes.xl, color: colors.textMain },
  bubbleLabel: { color: colors.textMuted, fontSize: fontSizes.xs },
});
