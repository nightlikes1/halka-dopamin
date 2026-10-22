// Eklenti kütüphanesi (web'deki katalog modalı) — modal ekran olarak açılır
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { withAlpha } from '@core/theme/palettes';
import { useTheme } from '@core/theme/ThemeProvider';
import { colors, fonts, fontSizes, radius, spacing } from '@core/theme/tokens';
import type { CatalogEntry } from '@domain/usecases/layout/GetWidgetCatalogUseCase';
import { AppText } from '@presentation/components/common/AppText';
import { Icon } from '@presentation/components/common/Icon';
import { WIDGET_ICONS } from '@presentation/components/common/iconMaps';
import { ScreenHeader } from '@presentation/components/common/ScreenHeader';
import { useLayout } from '@presentation/hooks/useLayout';
import { useSoundEffect } from '@presentation/hooks/useSoundEffect';
import type { RootStackScreenProps } from '@presentation/navigation/types';
import { confirmAction } from '@presentation/utils/dialogs';

export function CatalogScreen({ navigation }: RootStackScreenProps<'Catalog'>) {
  const { palette } = useTheme();
  const { catalog, addWidget, removeWidget } = useLayout();
  const play = useSoundEffect();

  const close = () => {
    play('click');
    navigation.goBack();
  };

  const onSelect = ({ item, isActive }: CatalogEntry) => {
    if (isActive) {
      confirmAction({
        title: 'Eklentiyi kaldır',
        message: `"${item.name}" eklentisini halkadan kaldırmak istiyor musun?`,
        confirmText: 'Kaldır',
        cancelText: 'Vazgeç',
        destructive: true,
        onConfirm: () => void removeWidget(item.id),
      });
      return;
    }
    void addWidget(item.id).then((added) => {
      if (added) navigation.goBack();
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <ScreenHeader
        title="Halka Eklenti Kütüphanesi"
        subtitle="Halkanın etrafına eklemek istediğin modülü seç veya çıkar"
        onClose={close}
        bordered
      />

      <ScrollView contentContainerStyle={styles.list}>
        {catalog.map((entry, index) => {
          const { item, isActive } = entry;
          return (
            <Animated.View key={item.id} entering={FadeInDown.duration(350).delay(index * 40)}>
              <Pressable
                onPress={() => onSelect(entry)}
                accessibilityRole="button"
                accessibilityLabel={
                  isActive
                    ? `${item.name}, halkada aktif. Kaldırmak için dokun.`
                    : `${item.name} ekle`
                }
                style={({ pressed }) => [
                  styles.card,
                  isActive && {
                    borderColor: withAlpha(palette.accent, '59'),
                    backgroundColor: colors.goldMuted,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.iconTile, { backgroundColor: withAlpha(item.accent, '20') }]}>
                  <Icon name={WIDGET_ICONS[item.id]} size={24} color={item.accent} />
                </View>
                <View style={styles.info}>
                  <View style={styles.titleRow}>
                    <AppText style={styles.name}>{item.name}</AppText>
                    <View style={styles.tag}>
                      <AppText style={styles.tagText}>{item.category}</AppText>
                    </View>
                  </View>
                  <AppText variant="muted">{item.description}</AppText>
                  <AppText
                    style={[
                      styles.action,
                      { color: isActive ? colors.textMain : colors.textMuted },
                    ]}
                  >
                    {isActive ? 'Halkada Aktif' : "Halka'ya Ekle"}
                  </AppText>
                </View>
              </Pressable>
            </Animated.View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgSecondary },
  list: { padding: spacing.lg, gap: spacing.md },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    backgroundColor: colors.bgCard,
  },
  pressed: { backgroundColor: colors.bgCardPressed },
  iconTile: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: spacing.xs },
  titleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  name: { fontFamily: fonts.semibold, fontSize: fontSizes.md },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    borderRadius: radius.full,
    backgroundColor: colors.fillMuted,
  },
  tagText: { fontSize: fontSizes.xs, color: colors.textMuted },
  action: { fontFamily: fonts.semibold, fontSize: fontSizes.sm, marginTop: spacing.xs },
});
