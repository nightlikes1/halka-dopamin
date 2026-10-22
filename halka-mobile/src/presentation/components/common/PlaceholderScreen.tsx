// Henüz geliştirilmemiş sekmeler için ortak "Yakında" ekranı
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { colors, spacing } from '@core/theme/tokens';
import { AppText } from '@presentation/components/common/AppText';
import { Card } from '@presentation/components/common/Card';
import { Icon, type IconName } from '@presentation/components/common/Icon';
import { Screen } from '@presentation/components/common/Screen';
import { ScreenHeader } from '@presentation/components/common/ScreenHeader';

interface PlaceholderScreenProps {
  readonly icon: IconName;
  readonly title: string;
  readonly subtitle: string;
  readonly headerRight?: ReactNode;
}

export function PlaceholderScreen({ icon, title, subtitle, headerRight }: PlaceholderScreenProps) {
  return (
    <Screen header={<ScreenHeader title={title} right={headerRight} />}>
      <Card variant="dashed" style={styles.card}>
        <View style={styles.iconCircle}>
          <Icon name={icon} size={28} color={colors.textMuted} />
        </View>
        <AppText variant="subtitle">{strings.common.comingSoon}</AppText>
        <AppText variant="muted" style={styles.center}>
          {subtitle}
        </AppText>
        <AppText variant="dim" style={styles.center}>
          {strings.common.comingSoonBody}
        </AppText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxl },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.fillMuted,
    marginBottom: spacing.sm,
  },
  center: { textAlign: 'center' },
});
