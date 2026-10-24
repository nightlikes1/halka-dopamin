// Uygulama kabuğu: veri yükleme, oturum geri yükleme, pomodoro izleyici ve navigasyon
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Image, View } from 'react-native';
import logoSourceLight from '@assets/logo-light.png';
import logoSource from '@assets/logo.png';
import { strings } from '@core/i18n/tr';
import { activeThemeMode, colors, spacing } from '@core/theme/tokens';
import { themedStyles } from '@core/theme/themed';
import { useSessionRestore } from '@features/auth/presentation/useAuth';
import { useAuthStore } from '@features/auth/presentation/useAuthStore';
import { ActionButton } from '@presentation/components/common/ActionButton';
import { AppText } from '@presentation/components/common/AppText';
import { ChainRing } from '@presentation/components/ring/ChainRing';
import { useBootstrap } from '@presentation/hooks/useBootstrap';
import { usePomodoroCompletionWatcher } from '@presentation/hooks/usePomodoro';
import { RootNavigator } from '@presentation/navigation/RootNavigator';
import { useHalkaStore } from '@presentation/store/useHalkaStore';
import { usePreferencesStore } from '@presentation/store/usePreferencesStore';

interface AppShellProps {
  readonly fontsReady: boolean;
}

// Yükleme ekranı (fontlar henüz hazır olmayabilir; sistem fontu kullanılır)
function SplashView() {
  const themeMode = usePreferencesStore((s) => s.themeMode);
  const isLight = themeMode === 'light' || activeThemeMode() === 'light';

  return (
    <View style={styles.center}>
      <ChainRing size={180}>
        <Image
          source={isLight ? logoSourceLight : logoSource}
          style={styles.splashLogo}
          resizeMode="contain"
          accessibilityLabel="Halka Logo"
        />
      </ChainRing>
      <ActivityIndicator color={colors.textMuted} />
    </View>
  );
}

function ErrorView({
  message,
  onRetry,
}: {
  readonly message: string;
  readonly onRetry: () => void;
}) {
  return (
    <View style={styles.center}>
      <AppText variant="title">Halka verileri yüklenemedi</AppText>
      <AppText variant="muted" style={styles.errorText}>
        {message}
      </AppText>
      <ActionButton label={strings.common.retry} onPress={onRetry} />
    </View>
  );
}

export function AppShell({ fontsReady }: AppShellProps) {
  const { retry } = useBootstrap();
  useSessionRestore();
  usePomodoroCompletionWatcher();
  const status = useHalkaStore((s) => s.status);
  const errorMessage = useHalkaStore((s) => s.errorMessage);
  const authStatus = useAuthStore((s) => s.status);
  // Tema değişince ekran ağacı yeniden kurulur (stiller yeni temayla okunur); veri ve oturum korunur
  const themeMode = usePreferencesStore((s) => s.themeMode);

  let content = <RootNavigator />;
  if (!fontsReady || status === 'loading' || authStatus === 'restoring') content = <SplashView />;
  else if (status === 'error') content = <ErrorView message={errorMessage ?? ''} onRetry={retry} />;

  return (
    <>
      <StatusBar style={themeMode === 'light' ? 'dark' : 'light'} />
      <View key={themeMode} style={styles.root}>
        {content}
      </View>
    </>
  );
}

const styles = themedStyles(() => ({
  root: { flex: 1, backgroundColor: colors.bgPrimary },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
  },
  splashLogo: { width: 156, height: 156 },
  errorText: { textAlign: 'center' },
}));
