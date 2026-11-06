import { Image, View } from 'react-native';
import logoBannerLight from '@assets/logo-banner-light.png';
import logoBanner from '@assets/logo-banner.png';
import { activeThemeMode, spacing } from '@core/theme/tokens';
import { Chip } from '@presentation/components/common/Chip';
import { IconButton } from '@presentation/components/common/IconButton';
import { themedStyles } from '@core/theme/themed';
import { useProfile } from '@features/halka/presentation/hooks/useProfile';
import { usePreferencesStore } from '@presentation/store/usePreferencesStore';

interface AppHeaderProps {
  readonly onAddPress: () => void;
}

export function AppHeader({ onAddPress }: AppHeaderProps) {
  const { profile, toggleSound } = useProfile();
  const themeMode = usePreferencesStore((s) => s.themeMode);
  const isLight = themeMode === 'light' || activeThemeMode() === 'light';

  return (
    <View style={styles.header}>
      <View style={styles.brand}>
        <Image
          source={isLight ? logoBannerLight : logoBanner}
          style={styles.logoBanner}
          resizeMode="contain"
          accessibilityLabel="Halka"
        />
      </View>

      <View style={styles.controls}>
        <IconButton
          icon={profile.soundEnabled ? 'volume-2' : 'volume-x'}
          accessibilityLabel={profile.soundEnabled ? 'Sesi kapat' : 'Sesi aç'}
          onPress={() => void toggleSound()}
          variant="surface"
          size={44}
        />
        <Chip label="Eklenti Ekle" icon="plus" variant="primary" onPress={onAddPress} />
      </View>
    </View>
  );
}

const styles = themedStyles(() => ({
  header: { gap: spacing.md, paddingBottom: spacing.md },
  brand: { flexDirection: 'row', alignItems: 'center' },
  logoBanner: {
    width: 180,
    height: 64,
    marginLeft: -8,
  },
  controls: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
}));
