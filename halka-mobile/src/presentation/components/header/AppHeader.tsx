import { Image, StyleSheet, View } from 'react-native';
import logoBanner from '@assets/logo-banner.png';
import { spacing } from '@core/theme/tokens';
import { Chip } from '@presentation/components/common/Chip';
import { IconButton } from '@presentation/components/common/IconButton';
import { useLayout } from '@presentation/hooks/useLayout';
import { useProfile } from '@presentation/hooks/useProfile';
import { useSoundEffect } from '@presentation/hooks/useSoundEffect';
import { useUiStore } from '@presentation/store/useUiStore';

interface AppHeaderProps {
  readonly onAddPress: () => void;
}

export function AppHeader({ onAddPress }: AppHeaderProps) {
  const { profile, toggleViewMode, toggleSound } = useProfile();
  const { activeIds } = useLayout();
  const allCollapsed = useUiStore((s) => s.allCollapsed);
  const setAllCollapsed = useUiStore((s) => s.setAllCollapsed);
  const play = useSoundEffect();

  const isGrid = profile.viewMode === 'grid';

  const toggleCollapseAll = () => {
    play('click');
    setAllCollapsed(activeIds, !allCollapsed);
  };

  return (
    <View style={styles.header}>
      <View style={styles.brand}>
        <Image
          source={logoBanner}
          style={styles.logoBanner}
          resizeMode="contain"
          accessibilityLabel="Halka"
        />
      </View>

      <View style={styles.controls}>
        <Chip
          label={isGrid ? 'Kokpit Modu' : 'Panel Modu'}
          icon={isGrid ? 'crosshair' : 'grid'}
          accessibilityLabel={isGrid ? 'Kokpit moduna geç' : 'Panel moduna geç'}
          onPress={() => void toggleViewMode()}
        />
        <Chip
          label={allCollapsed ? 'Genişlet' : 'Sadeleştir'}
          icon={allCollapsed ? 'maximize' : 'minimize'}
          accessibilityLabel="Tüm eklentileri küçült veya büyüt"
          onPress={toggleCollapseAll}
        />
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

const styles = StyleSheet.create({
  header: { gap: spacing.md, paddingBottom: spacing.md },
  brand: { flexDirection: 'row', alignItems: 'center' },
  logoBanner: {
    width: 180,
    height: 64,
    marginLeft: -8,
  },
  controls: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
});
