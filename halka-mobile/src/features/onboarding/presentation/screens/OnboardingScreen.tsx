// Karşılama ekranı (parçacık stili): arka planda parçacık girdabı, üç kaydırılabilir sayfa.
// Yalnızca ilk açılışta, giriş yapılmamışken görünür; "Başla" kayda, diğerleri girişe götürür.
import { useRef, useState } from 'react';
import {
  ScrollView,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { strings } from '@core/i18n/tr';
import { layout } from '@core/theme/layout';
import { colors, radius, spacing } from '@core/theme/tokens';
import { Appear } from '@presentation/components/common/Appear';
import { AppText } from '@presentation/components/common/AppText';
import { ScalePressable } from '@presentation/components/common/ScalePressable';
import { BlinkDot } from '@presentation/particles/components/BlinkDot';
import { BottomFade } from '@presentation/particles/components/BottomFade';
import { ParticleVortex } from '@presentation/particles/components/ParticleVortex';
import type { ParticlePaletteName } from '@presentation/particles/engine/palette';
import { themedStyles } from '@core/theme/themed';
import { useParticlePointer } from '@presentation/particles/renderer/useParticlePointer';
import type { RootStackScreenProps } from '@presentation/navigation/types';
import { usePreferencesStore } from '@presentation/store/usePreferencesStore';

const t = strings.onboarding;
const PAGE_PALETTES: readonly ParticlePaletteName[] = ['buzAtes', 'ates', 'mor'];
// İçerik sırayla belirir (sn): etiket, başlık, metin, alt kontroller
const DELAYS = [300, 500, 700, 900] as const;
const DOT_ACTIVE = 28;
const DOT_IDLE = 10;
const DOT_HEIGHT = 3;

export function OnboardingScreen({ navigation }: RootStackScreenProps<'Onboarding'>) {
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const scroller = useRef<ScrollView>(null);
  const completeOnboarding = usePreferencesStore((s) => s.completeOnboarding);
  // Ekranın her yerinde dokunma/fare girdabı etkiler (butonlar ve kaydırma normal çalışır)
  const { channel, targetRef, handlers } = useParticlePointer();
  const last = page === t.pages.length - 1;

  const finish = (target: 'Login' | 'Register') => {
    // Önce yönlendir, sonra işaretle (işaretlenince bu ekran yığından kaldırılır)
    navigation.replace(target);
    completeOnboarding();
  };

  const goTo = (index: number) => {
    scroller.current?.scrollTo({ x: index * width, animated: true });
    setPage(index);
  };

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(event.nativeEvent.contentOffset.x / Math.max(1, width)));
  };

  return (
    <View ref={targetRef} style={styles.root} {...handlers}>
      <ParticleVortex palette={PAGE_PALETTES[page] ?? 'buzAtes'} pointer={channel} />
      <BottomFade fraction={0.47} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <AppText variant="brand">{t.brand}</AppText>
          <ScalePressable
            onPress={() => finish('Login')}
            accessibilityRole="link"
            hitSlop={12}
            style={styles.skip}
          >
            <AppText variant="label" style={styles.muted}>
              {t.skip}
            </AppText>
          </ScalePressable>
        </View>

        <View style={styles.spacer} />

        <ScrollView
          ref={scroller}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          style={styles.pages}
        >
          {t.pages.map((content) => (
            <View key={content.label} style={[styles.page, { width }]}>
              <Appear variant="rise" delay={DELAYS[0]} style={styles.pill}>
                <BlinkDot color={colors.accent} size={6} />
                <AppText variant="tag" style={styles.muted}>
                  {content.label}
                </AppText>
              </Appear>
              <Appear variant="rise" delay={DELAYS[1]}>
                <AppText variant="particleTitle" accessibilityRole="header">
                  {content.title}
                </AppText>
              </Appear>
              <Appear variant="rise" delay={DELAYS[2]}>
                <AppText variant="particleBody">{content.body}</AppText>
              </Appear>
            </View>
          ))}
        </ScrollView>

        <Appear variant="rise" delay={DELAYS[3]} style={styles.controls}>
          <View
            style={styles.dots}
            accessible
            accessibilityLabel={t.pageA11y(page + 1, t.pages.length)}
          >
            {t.pages.map((content, index) => (
              <View
                key={content.label}
                style={[
                  styles.dot,
                  { width: index === page ? DOT_ACTIVE : DOT_IDLE },
                  index === page && styles.dotActive,
                ]}
              />
            ))}
          </View>

          <ScalePressable
            onPress={() => (last ? finish('Register') : goTo(page + 1))}
            accessibilityLabel={last ? t.start : t.next}
            style={styles.primary}
          >
            <AppText variant="cardTitle" style={styles.primaryText}>
              {last ? t.start : t.next}
            </AppText>
            <View style={styles.primaryRing} />
          </ScalePressable>

          <ScalePressable
            onPress={() => finish('Login')}
            accessibilityRole="link"
            style={styles.secondary}
          >
            <AppText variant="label" style={styles.muted}>
              {t.haveAccount}
            </AppText>
          </ScalePressable>
        </Appear>
      </SafeAreaView>
    </View>
  );
}

const styles = themedStyles(() => ({
  root: { flex: 1, backgroundColor: colors.ink },
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
  },
  skip: { minHeight: layout.touchTarget, justifyContent: 'center' },
  muted: { color: colors.textSecondary },
  spacer: { flex: 1 },
  pages: { flexGrow: 0 },
  page: { gap: spacing.lgx, paddingHorizontal: layout.screenPadding },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.glassStrong,
  },
  controls: {
    gap: spacing.lgx,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.lgx,
    paddingBottom: spacing.xxl2,
  },
  dots: { flexDirection: 'row', gap: spacing.sm },
  dot: { height: DOT_HEIGHT, borderRadius: DOT_HEIGHT / 2, backgroundColor: colors.glassStrong },
  dotActive: { backgroundColor: colors.textPrimary },
  primary: {
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.textPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  primaryText: { color: colors.ink },
  primaryRing: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.ink,
  },
  secondary: { alignSelf: 'center', minHeight: layout.touchTarget, justifyContent: 'center' },
}));
