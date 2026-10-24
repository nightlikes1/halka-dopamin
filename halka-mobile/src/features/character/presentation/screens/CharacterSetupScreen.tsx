// Karakter kurulumu / düzenleme: 1) kimlik cümlesi 2) özellikler 3) alışkanlık bağları 4) avatar.
// Atlanabilir; atlanırsa Karakter sekmesinde davet kartı kalır.
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { colors, fontSizes, radius, spacing } from '@core/theme/tokens';
import { resolveAvatar, resolveLook } from '@features/character/domain/avatar';
import {
  IDENTITY_MAX_LENGTH,
  MAX_TRAITS,
  TRAIT_NAME_MAX_LENGTH,
  type CharacterAvatar,
  type CharacterDraft,
  type TraitDraft,
} from '@features/character/domain/entities';
import type { DiceBearAvatar } from '@features/character/domain/dicebear';
import { moodFor, type AvatarLook } from '@features/character/domain/look';
import { figureFor } from '@features/character/presentation/avatarFigure';
import { AuraPicker } from '@features/character/presentation/components/AuraPicker';
import { AvatarStudio } from '@features/character/presentation/components/AvatarStudio';
import { themedStyles } from '@core/theme/themed';
import { toDraft, useCharacter } from '@features/character/presentation/useCharacter';
import { useHabits } from '@features/habits/presentation/useHabits';
import { ActionButton } from '@presentation/components/common/ActionButton';
import { AppText } from '@presentation/components/common/AppText';
import { AppTextInput } from '@presentation/components/common/AppTextInput';
import { Chip } from '@presentation/components/common/Chip';
import { IconButton } from '@presentation/components/common/IconButton';
import { Screen } from '@presentation/components/common/Screen';
import { ScreenHeader } from '@presentation/components/common/ScreenHeader';
import type { RootStackScreenProps } from '@presentation/navigation/types';

const t = strings.character.setup;
const TOTAL_STEPS = 4;
const sameName = (a: string, b: string) => a.toLocaleLowerCase('tr') === b.toLocaleLowerCase('tr');

export function CharacterSetupScreen({
  route,
  navigation,
}: RootStackScreenProps<'CharacterSetup'>) {
  const isEdit = route.params.mode === 'edit';
  const { overview, save } = useCharacter();
  const { habits, reload: reloadHabits } = useHabits();

  const initial: CharacterDraft =
    isEdit && overview?.character ? toDraft(overview.character) : { identity: '', traits: [] };
  const [step, setStep] = useState(1);
  const [identity, setIdentity] = useState(initial.identity);
  const [traits, setTraits] = useState<readonly TraitDraft[]>(initial.traits);
  const [customName, setCustomName] = useState('');
  // null: avatar karakterden otomatik üretilir
  const [avatar, setAvatar] = useState<CharacterAvatar | null>(initial.avatar ?? null);
  const [look, setLook] = useState<AvatarLook | null>(initial.look ?? null);
  const [dicebear, setDicebear] = useState<DiceBearAvatar | null>(initial.dicebear ?? null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // "Alışkanlık ekle" kısayolundan dönünce liste tazelenir
  useFocusEffect(
    useCallback(() => {
      void reloadHabits();
    }, [reloadHabits]),
  );

  const hasTrait = (name: string) => traits.some((trait) => sameName(trait.name, name));
  const isFull = traits.length >= MAX_TRAITS;

  const toggleSuggestion = (name: string) => {
    setTraits((current) =>
      current.some((trait) => sameName(trait.name, name))
        ? current.filter((trait) => !sameName(trait.name, name))
        : current.length < MAX_TRAITS
          ? [...current, { name, habitIds: [] }]
          : current,
    );
  };

  const addCustom = () => {
    const name = customName.trim();
    if (name.length === 0 || isFull || hasTrait(name)) return;
    setTraits((current) => [...current, { name, habitIds: [] }]);
    setCustomName('');
  };

  const removeTrait = (name: string) =>
    setTraits((current) => current.filter((trait) => !sameName(trait.name, name)));

  const toggleLink = (traitName: string, habitId: string) =>
    setTraits((current) =>
      current.map((trait) =>
        trait.name !== traitName
          ? trait
          : {
              ...trait,
              habitIds: trait.habitIds.includes(habitId)
                ? trait.habitIds.filter((id) => id !== habitId)
                : [...trait.habitIds, habitId],
            },
      ),
    );

  const canContinue =
    (step === 1 && identity.trim().length > 0) || (step === 2 && traits.length > 0) || step >= 3;

  // Önizleme: seçim yoksa karakterden türetilen görünüm ve aura
  const source = useMemo(
    () => ({ identity, traits, avatar, look }),
    [identity, traits, avatar, look],
  );
  const figure = useMemo(() => figureFor(source), [source]);
  // Düzenlemede gerçek yakınlıktan ruh hali; yeni karakterde "sakin"
  const percent = isEdit && overview?.proximity != null ? Math.round(overview.proximity) : null;

  const submit = async () => {
    setSaving(true);
    // Arşivlenmiş/silinmiş alışkanlık bağları gönderilmez
    const activeIds = new Set(habits.map((habit) => habit.id));
    const result = await save({
      identity,
      avatar,
      look,
      dicebear,
      traits: traits.map((trait) => ({
        ...trait,
        habitIds: trait.habitIds.filter((id) => activeIds.has(id)),
      })),
    });
    setSaving(false);
    setError(result);
    if (!result) navigation.goBack();
  };

  return (
    <Screen
      modal
      keyboard
      header={
        <ScreenHeader
          title={isEdit ? t.editTitle : t.createTitle}
          subtitle={t.stepOf(step, TOTAL_STEPS)}
          onClose={isEdit ? () => navigation.goBack() : undefined}
          right={isEdit ? null : <Chip label={t.skip} onPress={() => navigation.goBack()} />}
          bordered
        />
      }
    >
      {step === 1 ? (
        <View style={styles.section}>
          <AppText variant="subtitle">{t.identityTitle}</AppText>
          <AppTextInput
            value={identity}
            onChangeText={setIdentity}
            placeholder={t.identityPlaceholder}
            maxLength={IDENTITY_MAX_LENGTH}
            autoFocus={!isEdit}
            returnKeyType="next"
            onSubmitEditing={() => canContinue && setStep(2)}
            accessibilityLabel={t.identityTitle}
          />
          <AppText variant="dim" style={styles.counter}>
            {strings.history.charCount(identity.length, IDENTITY_MAX_LENGTH)}
          </AppText>
        </View>
      ) : null}

      {step === 2 ? (
        <View style={styles.section}>
          <AppText variant="subtitle">{t.traitsTitle}</AppText>
          <AppText variant="muted">{t.traitsHint(traits.length, MAX_TRAITS)}</AppText>
          <View style={styles.wrap}>
            {t.suggestions.map((name) => {
              const selected = hasTrait(name);
              return (
                <Chip
                  key={name}
                  label={name}
                  variant={selected ? 'active' : 'default'}
                  accent={colors.textMain}
                  disabled={!selected && isFull}
                  onPress={() => toggleSuggestion(name)}
                />
              );
            })}
          </View>
          <View style={styles.row}>
            <AppTextInput
              value={customName}
              onChangeText={setCustomName}
              placeholder={t.customPlaceholder}
              maxLength={TRAIT_NAME_MAX_LENGTH}
              editable={!isFull}
              returnKeyType="done"
              onSubmitEditing={addCustom}
              style={styles.flex}
              accessibilityLabel={t.customPlaceholder}
            />
            <Chip
              label={t.addCustom}
              variant="primary"
              accent={colors.textMain}
              disabled={isFull || customName.trim().length === 0}
              onPress={addCustom}
            />
          </View>
          {traits.length > 0 ? (
            <View style={styles.selected}>
              <AppText variant="caption">{t.selected}</AppText>
              {traits.map((trait) => (
                <View key={trait.name} style={styles.selectedRow}>
                  <AppText style={styles.flex}>{trait.name}</AppText>
                  <IconButton
                    icon="x"
                    accessibilityLabel={t.removeTrait(trait.name)}
                    onPress={() => removeTrait(trait.name)}
                    size={44}
                  />
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      {step === 3 ? (
        <View style={styles.section}>
          <AppText variant="subtitle">{t.linksTitle}</AppText>
          {habits.length === 0 ? (
            <>
              <AppText variant="muted">{t.noHabits}</AppText>
              <Chip
                label={strings.character.addHabit}
                onPress={() => navigation.navigate('Habits')}
              />
            </>
          ) : (
            <AppText variant="muted">{t.linksHint}</AppText>
          )}
          {habits.length > 0
            ? traits.map((trait) => (
                <View key={trait.name} style={styles.linkCard}>
                  <AppText variant="subtitle">{trait.name}</AppText>
                  <View style={styles.wrap}>
                    {habits.map((habit) => (
                      <Chip
                        key={habit.id}
                        label={habit.title}
                        variant={trait.habitIds.includes(habit.id) ? 'active' : 'default'}
                        accent={colors.textMain}
                        onPress={() => toggleLink(trait.name, habit.id)}
                        accessibilityLabel={`${trait.name}: ${habit.title}`}
                      />
                    ))}
                  </View>
                </View>
              ))
            : null}
        </View>
      ) : null}

      {step === 4 ? (
        <View style={styles.section}>
          <AvatarStudio
            look={resolveLook(source)}
            isAuto={look === null}
            onChange={setLook}
            figure={figure}
            mood={moodFor(percent)}
            source={source}
            dicebear={dicebear}
            onDiceBearChange={setDicebear}
          />
          <AuraPicker shown={resolveAvatar(source)} chosen={avatar} onChange={setAvatar} />
        </View>
      ) : null}

      {error ? (
        <AppText style={styles.error} accessibilityLiveRegion="assertive">
          {error}
        </AppText>
      ) : null}

      <View style={styles.footer}>
        {step > 1 ? <Chip label={t.back} onPress={() => setStep(step - 1)} /> : <View />}
        {step < TOTAL_STEPS ? (
          <ActionButton
            label={t.next}
            variant="solid"
            disabled={!canContinue}
            onPress={() => setStep(step + 1)}
          />
        ) : (
          <ActionButton
            label={t.save}
            variant="solid"
            disabled={saving}
            onPress={() => void submit()}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = themedStyles(() => ({
  flex: { flex: 1 },
  section: { gap: spacing.md },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  counter: { alignSelf: 'flex-end' },
  selected: { gap: spacing.xs },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.bgCard,
  },
  linkCard: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    backgroundColor: colors.bgCard,
  },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  error: { color: colors.danger, fontSize: fontSizes.sm },
}));
