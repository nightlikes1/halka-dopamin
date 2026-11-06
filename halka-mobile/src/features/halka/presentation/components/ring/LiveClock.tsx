// Saniye göstergeli dijital saat (kendi zamanlayıcısıyla yalnızca kendini yeniler)
import { View } from 'react-native';
import { padTwo } from '@core/utils/date';
import { colors, fonts } from '@core/theme/tokens';
import { AppText } from '@presentation/components/common/AppText';
import { themedStyles } from '@core/theme/themed';
import { useNow } from '@presentation/hooks/useNow';

interface LiveClockProps {
  readonly fontSize: number;
}

export function LiveClock({ fontSize }: LiveClockProps) {
  const now = useNow(1000);
  return (
    <View style={styles.row} accessibilityRole="text" accessibilityLabel="Saat">
      <AppText style={[styles.time, { fontSize }]}>
        {padTwo(now.getHours())}:{padTwo(now.getMinutes())}
      </AppText>
      <AppText style={[styles.seconds, { fontSize: fontSize * 0.45 }]}>
        :{padTwo(now.getSeconds())}
      </AppText>
    </View>
  );
}

const styles = themedStyles(() => ({
  row: { flexDirection: 'row', alignItems: 'flex-end' },
  time: { fontFamily: fonts.mono, color: colors.textMain, letterSpacing: 1 },
  seconds: { fontFamily: fonts.mono, color: colors.textMuted, marginBottom: 4 },
}));
