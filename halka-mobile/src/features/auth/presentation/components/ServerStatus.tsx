// Sunucu adresi ve erişilebilirlik göstergesi (kurulum sorunlarını anlamayı kolaylaştırır)
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { layout } from '@core/theme/layout';
import { colors, fontSizes, spacing } from '@core/theme/tokens';
import { AppText } from '@presentation/components/common/AppText';
import { useDI } from '@presentation/providers/DIProvider';

type Reachability = 'checking' | 'online' | 'offline';

export function ServerStatus() {
  const { auth, apiBaseUrl } = useDI();
  const [state, setState] = useState<Reachability>('checking');

  const check = useCallback(() => {
    setState('checking');
    void auth.serverHealth
      .isReachable()
      .then((reachable) => setState(reachable ? 'online' : 'offline'));
  }, [auth]);

  useEffect(() => {
    let cancelled = false;
    void auth.serverHealth.isReachable().then((reachable) => {
      if (!cancelled) setState(reachable ? 'online' : 'offline');
    });
    return () => {
      cancelled = true;
    };
  }, [auth]);

  const label =
    state === 'checking'
      ? '…'
      : state === 'online'
        ? strings.auth.serverOnline
        : strings.auth.serverOffline;

  return (
    <Pressable
      onPress={check}
      accessibilityRole="button"
      accessibilityLabel={`${strings.auth.server}: ${apiBaseUrl}, ${label}`}
      style={styles.row}
    >
      <View
        style={[
          styles.dot,
          state === 'online' && styles.dotOnline,
          state === 'offline' && styles.dotOffline,
        ]}
      />
      <AppText style={styles.text} numberOfLines={1}>
        {strings.auth.server}: {apiBaseUrl} · {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'center',
    minHeight: layout.touchTarget,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.textDim },
  dotOnline: { backgroundColor: colors.textMain },
  dotOffline: { backgroundColor: colors.error },
  text: { fontSize: fontSizes.xs, color: colors.textDim },
});
