import { avatarSeed, deriveAvatar, resolveAvatar } from '@features/character/domain/avatar';
import { AVATAR_PALETTES, AVATAR_SHAPES } from '@features/character/domain/entities';
import { normalizeCharacterDraft } from '@features/character/domain/rules';

const trait = (name: string) => ({ id: name, name, order: 0, habitIds: [] });

describe('avatar', () => {
  it('aynı karakter için kararlı, farklı karakterler için farklı tohum üretir', () => {
    expect(avatarSeed('Sakin biri', ['Sakin'])).toBe(avatarSeed('  SAKİN biri ', ['Sakin']));
    expect(avatarSeed('Sakin biri', ['Sakin'])).not.toBe(avatarSeed('Sakin biri', ['Meraklı']));
  });

  it('türetilen avatar her zaman geçerli seçeneklerden olur', () => {
    for (const seed of [0, 1, 7, 255, 4096, 2 ** 31, 2 ** 32 - 1]) {
      const avatar = deriveAvatar(seed);
      expect(AVATAR_SHAPES).toContain(avatar.shape);
      expect(AVATAR_PALETTES).toContain(avatar.palette);
    }
  });

  it('kullanıcının seçimi türetilen avatardan önce gelir', () => {
    const chosen = { shape: 'crystal', palette: 'mor' } as const;
    expect(resolveAvatar({ identity: 'Biri', traits: [trait('A')], avatar: chosen })).toEqual(
      chosen,
    );
    const derived = resolveAvatar({ identity: 'Biri', traits: [trait('A')], avatar: null });
    expect(AVATAR_SHAPES).toContain(derived.shape);
  });
});

describe('normalizeCharacterDraft avatar', () => {
  const base = { identity: 'Biri', traits: [{ name: 'A', habitIds: [] }] };

  it('avatar verilmezse taslakta da yer almaz (sunucudaki ayar korunur)', () => {
    const result = normalizeCharacterDraft(base);
    expect(result.ok && 'avatar' in result.value).toBe(false);
  });

  it('geçerli seçimi ve null değerini korur', () => {
    const chosen = normalizeCharacterDraft({
      ...base,
      avatar: { shape: 'flower', palette: 'ates' },
    });
    expect(chosen.ok && chosen.value.avatar).toEqual({ shape: 'flower', palette: 'ates' });
    const reset = normalizeCharacterDraft({ ...base, avatar: null });
    expect(reset.ok && reset.value.avatar).toBeNull();
  });
});
