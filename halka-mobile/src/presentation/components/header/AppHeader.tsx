// Uygulama başlığı: marka, tema, görünüm modu, sadeleştir, ses, eklenti ekle
import { StyleSheet, View } from 'react-native';
import { colors, fonts, fontSizes, radius, spacing } from '@core/theme/tokens';
import { AppText } from '@presentation/components/common/AppText';
import { Chip } from '@presentation/components/common/Chip';
import { Icon } from '@presentation/components/common/Icon';
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
        <View style={[styles.symbol, { borderColor: colors.borderStrong }]}>
          <Icon name="link" size={18} color={colors.textPrimary} />
        </View>
        <AppText style={styles.title}>HALKA</AppText>
        <View style={[styles.badge, { borderColor: colors.borderStrong }]}>
          <AppText style={[styles.badgeText, { color: colors.textSecondary }]}>
            HAYAT OS v1.0
          </AppText>
        </View>
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
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  symbol: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xl,
    letterSpacing: 4,
    color: colors.textMain,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  badgeText: { fontFamily: fonts.semibold, fontSize: fontSizes.xs, letterSpacing: 1 },
  controls: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
});
