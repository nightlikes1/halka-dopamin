// Avatarım: kayıtlı karakterin çizgi görünümünü ve aurasını düzenler (kimlik/özellikler değişmez).
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { colors, fontSizes, spacing } from '@core/theme/tokens';
import { resolveAvatar, resolveLook } from '@features/character/domain/avatar';
import type { DiceBearAvatar } from '@features/character/domain/dicebear';
import type { Character, CharacterAvatar } from '@features/character/domain/entities';
import { moodFor, type AvatarLook } from '@features/character/domain/look';
import { figureFor } from '@features/character/presentation/avatarFigure';
import { AuraPicker } from '@features/character/presentation/components/AuraPicker';
import { AvatarStudio } from '@features/character/presentation/components/AvatarStudio';
import { toDraft, useCharacter } from '@features/character/presentation/useCharacter';
import { ActionButton } from '@presentation/components/common/ActionButton';
import { AppText } from '@presentation/components/common/AppText';
import { Screen } from '@presentation/components/common/Screen';
import { ScreenHeader } from '@presentation/components/common/ScreenHeader';
import type { RootStackScreenProps } from '@presentation/navigation/types';

const s = strings.character.studio;

export function AvatarEditorScreen({ navigation }: RootStackScreenProps<'AvatarEditor'>) {
  const { overview, save } = useCharacter();
  const character = overview?.character ?? null;

  return (
    <Screen
      modal
      header={<ScreenHeader title={s.editorTitle} onClose={() => navigation.goBack()} bordered />}
    >
      {character && overview ? (
        <Editor
          character={character}
          proximity={overview.proximity}
          save={save}
          onDone={() => navigation.goBack()}
        />
      ) : (
        <ActivityIndicator color={colors.textMuted} />
      )}
    </Screen>
  );
}

interface EditorProps {
  readonly character: Character;
  readonly proximity: number | null;
  readonly save: ReturnType<typeof useCharacter>['save'];
  readonly onDone: () => void;
}

// Karakter yüklendikten sonra kurulur: başlangıç durumu kayıtlı değerlerden alınır
function Editor({ character, proximity, save, onDone }: EditorProps) {
  const [look, setLook] = useState<AvatarLook | null>(character.look);
  const [avatar, setAvatar] = useState<CharacterAvatar | null>(character.avatar);
  const [dicebear, setDicebear] = useState<DiceBearAvatar | null>(character.dicebear);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const source = { identity: character.identity, traits: character.traits, avatar, look };
  const percent = proximity === null ? null : Math.round(proximity);

  const submit = async () => {
    setSaving(true);
    const result = await save({ ...toDraft(character), look, avatar, dicebear });
    setSaving(false);
    setError(result);
    if (!result) onDone();
  };

  return (
    <>
      <AvatarStudio
        look={resolveLook(source)}
        isAuto={look === null}
        onChange={setLook}
        figure={figureFor(source)}
        mood={moodFor(percent)}
        source={source}
        dicebear={dicebear}
        onDiceBearChange={setDicebear}
      />
      <AuraPicker shown={resolveAvatar(source)} chosen={avatar} onChange={setAvatar} />
      {error ? (
        <AppText style={styles.error} accessibilityLiveRegion="assertive">
          {error}
        </AppText>
      ) : null}
      <View style={styles.footer}>
        <ActionButton
          label={s.save}
          variant="solid"
          disabled={saving}
          onPress={() => void submit()}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  footer: { alignItems: 'flex-end', marginTop: spacing.md },
  error: { color: colors.danger, fontSize: fontSizes.sm },
});
