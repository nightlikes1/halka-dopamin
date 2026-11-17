// Sakin saat (modal): 15/30/60 dk seçimi, fikirler ve geri sayım. Süre dolunca tek titreşim.
// Kayıt tutulmaz; modal kapanınca sayaç biter.
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { layout } from '@core/theme/layout';
import { themedStyles } from '@core/theme/themed';
import { colors, gradients, moduleColors, spacing } from '@core/theme/tokens';
import { formatMinutesSeconds } from '@core/utils/format';
import {
  CALM_MINUTES,
  calmRemainingSeconds,
  type CalmMinutes,
} from '@features/tools/domain/calmTimer';
import { AppText } from '@presentation/components/common/AppText';
import { CapsuleButton } from '@presentation/components/common/CapsuleButton';
import { Icon } from '@presentation/components/common/Icon';
import { LiveRing } from '@presentation/components/common/LiveRing';
import { Panel } from '@presentation/components/common/Panel';
import { Screen } from '@presentation/components/common/Screen';
import { ScreenHeader } from '@presentation/components/common/ScreenHeader';
import { SegmentedControl } from '@presentation/components/common/SegmentedControl';
import { useNow } from '@presentation/hooks/useNow';
import { hapticLight, hapticSuccess } from '@presentation/utils/haptics';

const c = strings.calm;
const RING = 220;

export function CalmScreen() {
  const navigation = useNavigation();
  const [minutes, setMinutes] = useState<CalmMinutes>(30);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const now = useNow(1000, startedAt !== null);
  const remaining =
    startedAt === null ? minutes * 60 : calmRemainingSeconds(startedAt, minutes, now.getTime());
  const finished = startedAt !== null && remaining === 0;
  const close = () => navigation.goBack();

  useEffect(() => {
    if (finished) hapticSuccess();
  }, [finished]);

  const progress = startedAt === null ? 0 : 1 - remaining / (minutes * 60);

  return (
    <Screen
      modal
      backdrop
      contentStyle={styles.content}
      header={<ScreenHeader title="" onClose={close} />}
    >
      <AppText variant="flowTitle" accessibilityRole="header">
        {finished ? c.doneTitle : c.title}
      </AppText>
      <AppText variant="secondary" style={styles.secondary}>
        {finished ? c.doneBody : startedAt !== null ? c.running : c.subtitle}
      </AppText>

      {startedAt === null ? (
        <SegmentedControl<string>
          selected={String(minutes)}
          onChange={(value) => {
            const next = CALM_MINUTES.find((option) => String(option) === value);
            if (next) setMinutes(next);
          }}
          accessibilityLabel={c.durationLabel}
          options={CALM_MINUTES.map((option) => ({
            value: String(option),
            label: c.minutesShort(option),
            color: moduleColors.breath,
          }))}
        />
      ) : null}

      <View style={styles.ring}>
        <LiveRing
          size={RING}
          progress={finished ? 1 : progress}
          mood="calm"
          still={startedAt === null || finished}
          accessibilityLabel={
            startedAt === null
              ? c.minutes(minutes)
              : `${formatMinutesSeconds(remaining)} ${c.remaining}`
          }
        >
          {finished ? (
            <Icon name="check" size={48} color={colors.textPrimary} />
          ) : (
            <View style={styles.center}>
              <AppText variant="numeralL">
                {startedAt === null ? c.minutes(minutes) : formatMinutesSeconds(remaining)}
              </AppText>
              {startedAt !== null ? (
                <AppText variant="footnote" style={styles.secondary}>
                  {c.remaining}
                </AppText>
              ) : null}
            </View>
          )}
        </LiveRing>
      </View>

      {startedAt === null ? (
        <>
          <Panel style={styles.ideas}>
            <AppText variant="overline" style={styles.secondary}>
              {c.ideasLabel}
            </AppText>
            {c.ideas.map((idea) => (
              <View key={idea} style={styles.idea}>
                <View style={styles.dot} />
                <AppText variant="bodyL">{idea}</AppText>
              </View>
            ))}
          </Panel>
          <CapsuleButton
            label={c.start(minutes)}
            gradient={gradients.breath}
            onPress={() => {
              hapticLight();
              setStartedAt(Date.now());
            }}
          />
        </>
      ) : finished ? (
        <CapsuleButton label={c.close} onPress={close} gradient={gradients.breath} />
      ) : (
        <CapsuleButton label={c.finish} variant="secondary" onPress={() => setStartedAt(null)} />
      )}
    </Screen>
  );
}

const styles = themedStyles(() => ({
  content: { paddingHorizontal: layout.edge, gap: layout.cardGap },
  secondary: { color: colors.textSecondary },
  ring: { alignItems: 'center', paddingVertical: spacing.xl },
  center: { alignItems: 'center' },
  ideas: { gap: spacing.md },
  idea: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: moduleColors.breath },
}));
