// Ayarlar: hesap bilgisi, görsel stil, sunucu adresi, çıkış (bildirim/dışa aktarma sonraki fazlarda)
import { StyleSheet } from 'react-native';
import { strings } from '@core/i18n/tr';
import { colors, fontSizes, spacing } from '@core/theme/tokens';
import type { VisualStyle } from '@data/preferences/devicePreferences';
import { useAuth } from '@features/auth/presentation/useAuth';
import { useVisualStyleSetting } from '@features/settings/presentation/useVisualStyleSetting';
import { ActionButton } from '@presentation/components/common/ActionButton';
import { AppText } from '@presentation/components/common/AppText';
import { Card } from '@presentation/components/common/Card';
import { Screen } from '@presentation/components/common/Screen';
import { ScreenHeader } from '@presentation/components/common/ScreenHeader';
import { SectionTitle } from '@presentation/components/common/SectionTitle';
import { SegmentedControl } from '@presentation/components/common/SegmentedControl';
import type { RootStackScreenProps } from '@presentation/navigation/types';
import { useDI } from '@presentation/providers/DIProvider';
import { confirmAction } from '@presentation/utils/dialogs';

const t = strings.settings;

export function SettingsScreen({ navigation }: RootStackScreenProps<'Settings'>) {
  const { user, logout } = useAuth();
  const { apiBaseUrl } = useDI();
  const visual = useVisualStyleSetting();

  const confirmLogout = () => {
    confirmAction({
      title: t.logoutConfirmTitle,
      message: t.logoutConfirmBody,
      confirmText: t.logout,
      cancelText: strings.common.cancel,
      destructive: true,
      onConfirm: () => void logout(),
    });
  };

  return (
    <Screen
      modal
      header={<ScreenHeader title={t.title} onClose={() => navigation.goBack()} bordered />}
    >
      <AppText variant="caption">{t.account}</AppText>
      <Card style={styles.card}>
        <SectionTitle title={user?.displayName ?? user?.email ?? '—'} icon="user" />
        <AppText variant="muted">
          {user?.displayName ? `${t.signedInAs} · ${user.email}` : t.signedInAs}
        </AppText>
      </Card>
      <Card style={styles.card}>
        <SectionTitle title={t.visualStyle} icon="aperture" />
        <SegmentedControl<VisualStyle>
          selected={visual.selected}
          onChange={(style) => void visual.choose(style)}
          accessibilityLabel={t.visualStyle}
          options={[
            { value: 'particles', label: t.visualParticles, color: colors.textPrimary },
            { value: 'classic', label: t.visualClassic, color: colors.textPrimary },
          ]}
        />
        <AppText variant="dim">{t.visualStyleHint}</AppText>
      </Card>
      <Card style={styles.card}>
        <SectionTitle title={t.server} icon="server" />
        <AppText variant="mono" style={styles.mono}>
          {apiBaseUrl}
        </AppText>
      </Card>
      <ActionButton label={t.logout} icon="log-out" color={colors.danger} onPress={confirmLogout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.xs },
  mono: { fontSize: fontSizes.sm },
});
