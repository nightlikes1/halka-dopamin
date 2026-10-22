// Karakter ViewModel'i: özet ekranlar arasında paylaşılır (sekme, detay, kurulum)
import { useCallback } from 'react';
import { create } from 'zustand';
import type { Character, CharacterDraft } from '@features/character/domain/entities';
import type { CharacterOverview } from '@features/character/domain/usecases/CharacterUseCases';
import { useDI } from '@presentation/providers/DIProvider';

export type CharacterState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'error'; readonly message: string }
  | { readonly kind: 'ready'; readonly overview: CharacterOverview };

interface CharacterStoreState {
  readonly state: CharacterState;
  setState(state: CharacterState): void;
}

const useCharacterStore = create<CharacterStoreState>()((set) => ({
  state: { kind: 'loading' },
  setState: (state) => set({ state }),
}));

// Başarılıysa null, değilse kullanıcıya gösterilecek mesaj
type SubmitResult = string | null;

export function useCharacter() {
  const { character: useCases } = useDI();
  const state = useCharacterStore((s) => s.state);
  const setState = useCharacterStore((s) => s.setState);

  const reload = useCallback(async () => {
    const result = await useCases.overview.execute();
    setState(
      result.ok
        ? { kind: 'ready', overview: result.value }
        : { kind: 'error', message: result.error.message },
    );
  }, [useCases, setState]);

  const save = useCallback(
    async (draft: CharacterDraft): Promise<SubmitResult> => {
      const result = await useCases.save.execute(draft);
      if (!result.ok) return result.error.message;
      await reload();
      return null;
    },
    [useCases, reload],
  );

  const remove = useCallback(async (): Promise<SubmitResult> => {
    const result = await useCases.delete.execute();
    if (!result.ok) return result.error.message;
    await reload();
    return null;
  }, [useCases, reload]);

  const overview = state.kind === 'ready' ? state.overview : null;

  return { state, overview, reload, save, remove };
}

// Kayıtlı karakteri düzenleme taslağına çevirir (özellik kimlikleri korunur)
export const toDraft = (character: Character): CharacterDraft => ({
  identity: character.identity,
  avatar: character.avatar,
  look: character.look,
  dicebear: character.dicebear,
  traits: character.traits.map((trait) => ({
    id: trait.id,
    name: trait.name,
    habitIds: trait.habitIds,
  })),
});
