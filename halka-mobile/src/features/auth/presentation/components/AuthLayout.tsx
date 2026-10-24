// Giriş/kayıt ekranlarının ortak düzeni: marka, başlık, form, sunucu durumu
import type { ReactNode } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import logoSource from '@assets/logo.png';
import { layout } from '@core/theme/layout';
import { colors, fonts, spacing, fontSizes } from '@core/theme/tokens';
import { ServerStatus } from '@features/auth/presentation/components/ServerStatus';
import { AppText } from '@presentation/components/common/AppText';
import { Card } from '@presentation/components/common/Card';
import { ChainRing } from '@presentation/components/ring/ChainRing';

interface AuthLayoutProps {
  readonly title: string;
  readonly subtitle: string;
  readonly children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <ChainRing size={120}>
              <Image
                source={logoSource}
                style={styles.logo}
                resizeMode="contain"
                accessibilityLabel="Halka Logo"
              />
            </ChainRing>
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
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
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
  logo: { width: 104, height: 104 },
  brandTitle: { fontFamily: fonts.bold, fontSize: fontSizes.xl, letterSpacing: 6 },
  card: { gap: spacing.xs, padding: spacing.xl },
  form: { gap: spacing.md, marginTop: spacing.lg },
});
