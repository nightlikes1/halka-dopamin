// Ekran başlığı: başlık + isteğe bağlı alt başlık, sağda eylemler ya da kapat butonu.
// Modal ekranlarda alt çizgili, sekme ekranlarında çizgisiz kullanılır.
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { layout } from '@core/theme/layout';
import { colors, spacing } from '@core/theme/tokens';
import { AppText } from '@presentation/components/common/AppText';
import { IconButton } from '@presentation/components/common/IconButton';

interface ScreenHeaderProps {
  readonly title: string;
  readonly subtitle?: string;
  // Verilirse sağda kapat (✕) butonu çıkar
  readonly onClose?: () => void;
  readonly right?: ReactNode;
  readonly bordered?: boolean;
}

export function ScreenHeader({
  title,
  subtitle,
  onClose,
  right,
  bordered = false,
}: ScreenHeaderProps) {
  return (
    <View style={[styles.header, bordered && styles.bordered]}>
      <View style={styles.text}>
        <AppText variant="headline" accessibilityRole="header" numberOfLines={2}>
          {title}
        </AppText>
        {subtitle ? <AppText variant="muted">{subtitle}</AppText> : null}
      </View>
      {right}
      {onClose ? (
        <IconButton
          icon="x"
          variant="surface"
          size={44}
          accessibilityLabel={strings.common.close}
          onPress={onClose}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
  },
  bordered: { borderBottomWidth: 1, borderBottomColor: colors.borderGlass },
  text: { flex: 1, gap: spacing.xxs },
});
