// Kart/bölüm başlığı: solda başlık (isteğe bağlı ikonla), sağda isteğe bağlı eylem
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '@core/theme/tokens';
import { AppText } from '@presentation/components/common/AppText';
import { Icon, type IconName } from '@presentation/components/common/Icon';

interface SectionTitleProps {
  readonly title: string;
  readonly icon?: IconName;
  readonly iconColor?: string;
  readonly action?: ReactNode;
}

export function SectionTitle({
  title,
  icon,
  iconColor = colors.textMuted,
  action,
}: SectionTitleProps) {
  return (
    <View style={styles.row}>
      {icon ? <Icon name={icon} size={18} color={iconColor} /> : null}
      <AppText variant="subtitle" accessibilityRole="header" style={styles.title}>
        {title}
      </AppText>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 24 },
  title: { flex: 1 },
});
