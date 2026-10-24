// Ekran iskeleti: güvenli alan + (isteğe bağlı) başlık + kaydırılabilir, genişliği sınırlı içerik.
// Modal ekranlarda alt güvenli alan da korunur; klavye açılınca içerik yukarı kayar.
// Parçacık stilinde sekme ekranları yüzen cam çubuğun altında kalmasın diye alta boşluk bırakır.
import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { layout } from '@core/theme/layout';
import { colors, spacing } from '@core/theme/tokens';
import { themedStyles } from '@core/theme/themed';
import { useTabBarClearance } from '@presentation/navigation/GlassTabBar';
import { useParticleStyle } from '@presentation/store/usePreferencesStore';

interface ScreenProps {
  readonly children: ReactNode;
  readonly header?: ReactNode;
  // Modal: alt güvenli alan dahil (sekme ekranlarında alt kenarı sekme çubuğu korur)
  readonly modal?: boolean;
  readonly scroll?: boolean;
  // Form ekranlarında klavyeden kaçınma
  readonly keyboard?: boolean;
  readonly maxWidth?: number;
  readonly contentStyle?: StyleProp<ViewStyle>;
}

export function Screen({
  children,
  header,
  modal = false,
  scroll = true,
  keyboard = false,
  maxWidth = layout.contentMaxWidth,
  contentStyle,
}: ScreenProps) {
  const particles = useParticleStyle();
  const clearance = useTabBarClearance();
  const bottom = !modal && particles ? { paddingBottom: clearance } : null;
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.content, { maxWidth }, bottom, contentStyle]}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, styles.fill, { maxWidth }, bottom, contentStyle]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView
      style={styles.safe}
      edges={modal ? ['top', 'left', 'right', 'bottom'] : ['top', 'left', 'right']}
    >
      {header}
      {keyboard ? (
        <KeyboardAvoidingView
          style={styles.fill}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = themedStyles(() => ({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  fill: { flex: 1 },
  content: {
    width: '100%',
    alignSelf: 'center',
    gap: spacing.lg,
    padding: layout.screenPadding,
    paddingBottom: layout.screenBottomPadding,
  },
}));
