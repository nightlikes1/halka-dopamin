// Giriş/kayıt ekranlarının ortak düzeni: marka, başlık, form, sunucu durumu
import type { ReactNode } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import logoSourceLight from '@assets/logo-light.png';
import logoSource from '@assets/logo.png';
import { layout } from '@core/theme/layout';
import { activeThemeMode, colors, fonts, spacing, fontSizes } from '@core/theme/tokens';
import { ServerStatus } from '@features/auth/presentation/components/ServerStatus';
import { AppText } from '@presentation/components/common/AppText';
import { Card } from '@presentation/components/common/Card';
import { themedStyles } from '@core/theme/themed';
import { ParticleDust } from '@presentation/particles/components/ParticleDust';
import { ParticleHalo } from '@presentation/particles/components/ParticleHalo';
import { usePreferencesStore } from '@presentation/store/usePreferencesStore';

// Logo çevresindeki parçacık halkanın kutusu (px)
const HALO_SIZE = 120;

interface AuthLayoutProps {
  readonly title: string;
  readonly subtitle: string;
  readonly children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  const themeMode = usePreferencesStore((s) => s.themeMode);
  const isLight = themeMode === 'light' || activeThemeMode() === 'light';

  return (
    <View style={styles.root}>
      {/* Ortam tozu: tüm ekranın arkasında, dokunuş almaz */}
      <ParticleDust />
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.brand}>
              {/* Logo, altın parçacık halkanın tam ortasında */}
              <View style={styles.halo}>
                <ParticleHalo size={HALO_SIZE} />
                <Image
                  source={isLight ? logoSourceLight : logoSource}
                  style={styles.logo}
                  resizeMode="contain"
                  accessibilityLabel="Halka Logo"
                />
              </View>
              <AppText style={styles.brandTitle}>HALKA</AppText>
            </View>
            <Card style={styles.card}>
              <AppText variant="screenTitle" accessibilityRole="header">
                {title}
              </AppText>
              <AppText variant="muted">{subtitle}</AppText>
              <View style={styles.form}>{children}</View>
            </Card>
            <ServerStatus />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = themedStyles(() => ({
  root: { flex: 1, backgroundColor: colors.bgPrimary },
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: spacing.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: layout.formMaxWidth,
    alignSelf: 'center',
  },
  brand: { alignItems: 'center', gap: spacing.sm },
  halo: {
    width: HALO_SIZE,
    height: HALO_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 104, height: 104 },
  brandTitle: { fontFamily: fonts.bold, fontSize: fontSizes.xl, letterSpacing: 6 },
  card: { gap: spacing.xs, padding: spacing.xl },
  form: { gap: spacing.md, marginTop: spacing.lg },
}));
