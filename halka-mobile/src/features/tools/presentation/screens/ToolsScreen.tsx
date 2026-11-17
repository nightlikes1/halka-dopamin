// Araçlar sekmesi: Canım çekiyor, Sakin saat ve Halka eklentilerinin tümü eşit kartlar hâlinde.
// Eklenti kartı eklentinin geniş görünümünü açar (veriler cihazda, mevcut Halka deposundan).
import { useNavigation } from '@react-navigation/native';
import { View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { layout } from '@core/theme/layout';
import { themedStyles } from '@core/theme/themed';
import { colors, moduleColors, spacing, type ModuleName } from '@core/theme/tokens';
import { useAuth } from '@features/auth/presentation/useAuth';
import { resolveGreetingName } from '@features/halka/domain/entities/Profile';
import { WIDGET_IDS, type WidgetId } from '@features/halka/domain/entities/WidgetId';
import { WIDGET_ICONS } from '@features/halka/presentation/components/iconMaps';
import { getWidgetSummary } from '@features/halka/presentation/components/widgets/widgetSummary';
import { useProfile } from '@features/halka/presentation/hooks/useProfile';
import { useHalkaStore } from '@features/halka/presentation/store/useHalkaStore';
import { useUiStore } from '@features/halka/presentation/store/useUiStore';
import { ToolCard } from '@features/tools/presentation/components/ToolCard';
import { AppText } from '@presentation/components/common/AppText';
import { InitialAvatar } from '@presentation/components/common/InitialAvatar';
import { ScalePressable } from '@presentation/components/common/ScalePressable';
import { Screen } from '@presentation/components/common/Screen';
import { useNow } from '@presentation/hooks/useNow';

const t = strings.tools;

// Her aracın modül rengi (anlam: su camgöbeği, nefes deniz yeşili, odak çivit…)
const WIDGET_MODULES: Record<WidgetId, ModuleName> = {
  water: 'water',
  pomodoro: 'focus',
  tasks: 'success',
  streak: 'reward',
  notes: 'creativity',
  breathing: 'breath',
  mood: 'mood',
  ambient: 'rest',
  bigOne: 'energy',
  budget: 'shortBreak',
};

export function ToolsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { profile } = useProfile();
  const snapshot = useHalkaStore((s) => s.snapshot);
  const currentAmbient = useUiStore((s) => s.currentAmbient);
  // Odak sayacının özeti saniyede bir yenilenir
  const now = useNow(1000);
  const name = resolveGreetingName(user?.displayName, profile.name) || (user?.email ?? '');

  return (
    <Screen backdrop contentStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.flex}>
          <AppText variant="overline" style={styles.secondary}>
            {t.overline}
          </AppText>
          <AppText variant="largeTitle" accessibilityRole="header">
            {t.title}
          </AppText>
        </View>
        <ScalePressable
          onPress={() => navigation.navigate('Settings')}
          accessibilityRole="button"
          accessibilityLabel={strings.today.profileA11y(name)}
          style={styles.avatarHit}
        >
          <InitialAvatar name={name} size={36} />
        </ScalePressable>
      </View>

      <View style={styles.grid}>
        <ToolCard
          name={t.items.urge.name}
          summary={t.items.urge.hint}
          icon="wind"
          color={moduleColors.mood}
          onPress={() => navigation.navigate('Urge')}
        />
        <ToolCard
          name={t.items.calm.name}
          summary={t.items.calm.hint}
          icon="moon"
          color={moduleColors.breath}
          onPress={() => navigation.navigate('Calm')}
        />
        {WIDGET_IDS.map((id) => (
          <ToolCard
            key={id}
            name={t.items[id]}
            summary={getWidgetSummary(id, { snapshot, now, currentAmbient })}
            icon={WIDGET_ICONS[id]}
            color={moduleColors[WIDGET_MODULES[id]]}
            onPress={() => navigation.navigate('WidgetFocus', { widgetId: id })}
          />
        ))}
      </View>
    </Screen>
  );
}

const styles = themedStyles(() => ({
  content: { paddingHorizontal: layout.edge, gap: layout.cardGap },
  flex: { flex: 1 },
  secondary: { color: colors.textSecondary },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  avatarHit: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: layout.cardGap },
}));
