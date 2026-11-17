// "Canım çekiyor" (modal): kendine notun, dürtü türü seçimi ve haftalık özet; tür seçilince dalga
// adımı (nefesle salınan halka) ve sonuç (geçti / hâlâ / yaptım). Kayıtlar cihazda tutulur.
// Tam 90 saniyelik akış sonraki fazda.
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { layout } from '@core/theme/layout';
import { themedStyles } from '@core/theme/themed';
import { colors, gradients, spacing } from '@core/theme/tokens';
import { todayOf } from '@core/utils/clock';
import {
  SELF_NOTE_MAX_LENGTH,
  URGE_KINDS,
  type TodayLocalState,
  type UrgeKind,
  type UrgeOutcome,
} from '@features/today/domain/entities';
import { urgeStats } from '@features/today/domain/dayRules';
import { LiveRing } from '@presentation/components/common/LiveRing';
import { AppText } from '@presentation/components/common/AppText';
import { AppTextInput } from '@presentation/components/common/AppTextInput';
import { CapsuleButton } from '@presentation/components/common/CapsuleButton';
import { Icon, type IconName } from '@presentation/components/common/Icon';
import { Panel } from '@presentation/components/common/Panel';
import { ScalePressable } from '@presentation/components/common/ScalePressable';
import { Screen } from '@presentation/components/common/Screen';
import { ScreenHeader } from '@presentation/components/common/ScreenHeader';
import { useDI } from '@presentation/providers/DIProvider';
import { hapticLight } from '@presentation/utils/haptics';
import { showMessage } from '@presentation/utils/dialogs';

const u = strings.urge;

const KIND_ICONS: Record<UrgeKind, IconName> = {
  social: 'smartphone',
  snack: 'coffee',
  video: 'play-circle',
  shopping: 'shopping-bag',
  smoking: 'wind',
  other: 'more-horizontal',
};

export function UrgeScreen() {
  const navigation = useNavigation();
  const { today, clock } = useDI();
  const [local, setLocal] = useState<TodayLocalState | null>(null);
  const [kind, setKind] = useState<UrgeKind | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    void today.local.execute().then((result) => {
      if (result.ok) setLocal(result.value);
    });
  }, [today]);

  const note = local?.selfNote ?? u.noteDefault;
  const stats = urgeStats(local?.urges ?? [], todayOf(clock));
  const close = () => navigation.goBack();

  const saveNote = async () => {
    const result = await today.saveSelfNote.execute(draft);
    if (!result.ok) {
      showMessage(u.saveFailed, result.error.message);
      return;
    }
    const text = draft.trim();
    setLocal((state) => (state ? { ...state, selfNote: text === '' ? null : text } : state));
    setEditing(false);
  };

  const finish = async (outcome: UrgeOutcome) => {
    if (!kind) return;
    hapticLight();
    const result = await today.logUrge.execute(kind, outcome);
    if (!result.ok) {
      showMessage(u.saveFailed, result.error.message);
      return;
    }
    close();
  };

  return (
    <Screen
      modal
      keyboard
      backdrop
      contentStyle={styles.content}
      header={<ScreenHeader title="" onClose={close} />}
    >
      {kind === null ? (
        <>
          <AppText variant="flowTitle" accessibilityRole="header">
            {u.title}
          </AppText>
          <AppText variant="secondary" style={styles.secondary}>
            {u.subtitle}
          </AppText>

          <Panel style={styles.note}>
            <View style={styles.noteHeader}>
              <AppText variant="overline" style={[styles.secondary, styles.flex]}>
                {u.noteLabel}
              </AppText>
              <ScalePressable
                onPress={() => {
                  if (editing) void saveNote();
                  else {
                    setDraft(local?.selfNote ?? '');
                    setEditing(true);
                  }
                }}
                accessibilityRole="button"
                style={styles.linkHit}
              >
                <AppText variant="bodyStrong" style={styles.link}>
                  {editing ? u.noteSave : u.noteEdit}
                </AppText>
              </ScalePressable>
            </View>
            {editing ? (
              <AppTextInput
                value={draft}
                onChangeText={setDraft}
                placeholder={u.notePlaceholder}
                maxLength={SELF_NOTE_MAX_LENGTH}
                multiline
                autoFocus
                accessibilityLabel={u.noteLabel}
              />
            ) : (
              <AppText variant="bodyL">{note}</AppText>
            )}
          </Panel>

          <View style={styles.grid}>
            {URGE_KINDS.map((item) => (
              <ScalePressable
                key={item}
                onPress={() => {
                  hapticLight();
                  setKind(item);
                }}
                accessibilityRole="button"
                accessibilityLabel={u.kinds[item]}
                containerStyle={styles.cell}
              >
                <Panel style={styles.kind}>
                  <Icon name={KIND_ICONS[item]} size={22} color={colors.textPrimary} />
                  <AppText variant="bodyStrong">{u.kinds[item]}</AppText>
                </Panel>
              </ScalePressable>
            ))}
          </View>

          <View style={styles.stats}>
            <Panel style={styles.stat}>
              <AppText variant="numeralL">{stats.passedThisWeek}</AppText>
              <AppText variant="footnote" style={styles.secondary}>
                {u.weekPassed}
              </AppText>
            </Panel>
            <Panel style={styles.stat}>
              <AppText variant="numeralL">{u.passRateValue(stats.passRate)}</AppText>
              <AppText variant="footnote" style={styles.secondary}>
                {u.passRate}
              </AppText>
            </Panel>
          </View>
        </>
      ) : (
        <>
          <AppText variant="flowTitle" accessibilityRole="header">
            {u.waveTitle(u.kinds[kind])}
          </AppText>
          <AppText variant="secondary" style={styles.secondary}>
            {u.waveBody}
          </AppText>
          <View style={styles.wave}>
            <LiveRing size={200} progress={0.5} mood="calm">
              <Icon name="wind" size={40} color={colors.textPrimary} />
            </LiveRing>
          </View>
          <AppText variant="bodyL" style={styles.center}>
            {note}
          </AppText>
          <CapsuleButton
            label={u.outcomePassed}
            gradient={gradients.breath}
            onPress={() => void finish('passed')}
          />
          <CapsuleButton
            label={u.outcomeStill}
            variant="secondary"
            onPress={() => void finish('still')}
          />
          <CapsuleButton
            label={u.outcomeDid}
            variant="secondary"
            onPress={() => void finish('did')}
          />
          <CapsuleButton
            label={u.back}
            variant="secondary"
            icon="arrow-left"
            onPress={() => setKind(null)}
          />
        </>
      )}
    </Screen>
  );
}

const styles = themedStyles(() => ({
  content: { paddingHorizontal: layout.edge, gap: layout.cardGap },
  flex: { flex: 1 },
  secondary: { color: colors.textSecondary },
  center: { textAlign: 'center' },
  note: { gap: spacing.sm, marginTop: spacing.md },
  noteHeader: { flexDirection: 'row', alignItems: 'center' },
  linkHit: {
    minHeight: layout.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  link: { color: colors.gold },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: layout.cardGap },
  cell: { flexBasis: '47%', flexGrow: 1 },
  kind: { gap: spacing.sm, minHeight: 96, justifyContent: 'space-between' },
  stats: { flexDirection: 'row', gap: layout.cardGap },
  stat: { flex: 1, gap: spacing.xs },
  wave: { alignItems: 'center', paddingVertical: spacing.xl },
}));
