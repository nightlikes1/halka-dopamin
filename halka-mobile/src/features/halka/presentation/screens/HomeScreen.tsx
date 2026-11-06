// Ana ekran: başlık, halka ve eklentiler (kokpit veya panel modu)
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { breakpoints, colors, spacing } from '@core/theme/tokens';
import { AppHeader } from '@features/halka/presentation/components/header/AppHeader';
import { CockpitLayout } from '@features/halka/presentation/components/layout/CockpitLayout';
import { EmptyOrbitBanner } from '@features/halka/presentation/components/layout/EmptyOrbitBanner';
import { WidgetGrid } from '@features/halka/presentation/components/layout/WidgetGrid';
import { RingSection } from '@features/halka/presentation/components/ring/RingSection';
import { themedStyles } from '@core/theme/themed';
import { useLayout } from '@features/halka/presentation/hooks/useLayout';
import { useSoundEffect } from '@features/halka/presentation/hooks/useSoundEffect';
import { useTabBarClearance } from '@presentation/navigation/GlassTabBar';
import type { MainTabScreenProps } from '@presentation/navigation/types';
import { useSnapshotSlice } from '@features/halka/presentation/store/useHalkaStore';
import { useParticleStyle } from '@presentation/store/usePreferencesStore';

const MAX_RING_SIZE = 440;

export function HomeScreen({ navigation }: MainTabScreenProps<'Halka'>) {
  const { width } = useWindowDimensions();
  const { viewMode } = useSnapshotSlice('profile');
  const { activeIds } = useLayout();
  const play = useSoundEffect();
  // Parçacık stilinde yüzen sekme çubuğunun altında kalmasın
  const clearance = useTabBarClearance();
  const bottom = useParticleStyle() ? { paddingBottom: clearance } : null;

  const openCatalog = () => {
    play('click');
    navigation.navigate('Catalog');
  };

  const isWide = width >= breakpoints.wide;
  const contentWidth = width - spacing.lg * 2;
  const isCockpitWide = viewMode === 'cockpit' && isWide && activeIds.length > 0;
  const ringSize = Math.min(isCockpitWide ? 420 : contentWidth, MAX_RING_SIZE);

  // Panel modunda daha fazla sütun, kokpit modunda (dar ekran) tek akış
  const columns =
    viewMode === 'grid'
      ? width >= breakpoints.wide
        ? 3
        : width >= breakpoints.tablet
          ? 2
          : 1
      : width >= breakpoints.tablet
        ? 2
        : 1;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={[styles.content, bottom]}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          <AppHeader onAddPress={openCatalog} />

          {isCockpitWide ? (
            <CockpitLayout ids={activeIds} ringSize={ringSize} onAddPress={openCatalog} />
          ) : (
            <View style={styles.stack}>
              <RingSection size={ringSize} onAddPress={openCatalog} />
              {activeIds.length === 0 ? (
                <EmptyOrbitBanner onAddPress={openCatalog} />
              ) : (
                <WidgetGrid ids={activeIds} columns={columns} />
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = themedStyles(() => ({
  root: { flex: 1, backgroundColor: colors.bgPrimary },
  safe: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },
  stack: { gap: spacing.xl },
}));
