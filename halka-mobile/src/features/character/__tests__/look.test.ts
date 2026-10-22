import { avatarSeed, resolveLook } from '@features/character/domain/avatar';
import { deriveLook, isValidLook, moodFor, type AvatarLook } from '@features/character/domain/look';
import { normalizeCharacterDraft } from '@features/character/domain/rules';

const trait = (name: string) => ({ name });

describe('deriveLook', () => {
  it('aynı tohumdan aynı, geçerli görünüm üretir', () => {
    for (let seed = 0; seed < 200; seed++) {
      const look = deriveLook(seed * 7919);
      expect(isValidLook(look)).toBe(true);
      expect(deriveLook(seed * 7919)).toEqual(look);
    }
  });

  it('başlangıçta kel ve pastel saç rengi seçmez', () => {
    for (let seed = 0; seed < 300; seed++) {
      const look = deriveLook(avatarSeed(`kişi ${seed}`, []));
      expect(look.hair).not.toBe('bald');
      expect(look.hairColor).toBeLessThan(6);
    }
  });

  it('farklı karakterler farklı görünümler alır', () => {
    const looks = new Set(
      Array.from({ length: 30 }, (_, i) =>
        JSON.stringify(resolveLook({ identity: `Biri ${i}`, traits: [trait('Sakin')] })),
      ),
    );
    expect(looks.size).toBeGreaterThan(25);
  });
});

describe('resolveLook', () => {
  it('kullanıcının düzenlediği görünüm önce gelir', () => {
    const chosen: AvatarLook = { ...deriveLook(1), hair: 'afro', glasses: 'sun' };
    expect(resolveLook({ identity: 'Biri', traits: [], look: chosen })).toEqual(chosen);
  });
});

describe('isValidLook', () => {
  const base = deriveLook(42);
  it('bilinmeyen seçeneği, aralık dışı ve kesirli rengi reddeder', () => {
    expect(isValidLook({ ...base, hair: 'dread' })).toBe(false);
    expect(isValidLook({ ...base, skin: 6 })).toBe(false);
    expect(isValidLook({ ...base, topColor: 1.5 })).toBe(false);
    expect(isValidLook({ ...base, eyes: undefined })).toBe(false);
    expect(isValidLook(null)).toBe(false);
  });
});

describe('moodFor', () => {
  it('kayıt yoksa sakin; yakınlık arttıkça enerjikleşir', () => {
    expect(moodFor(null)).toBe('calm');
    expect(moodFor(10)).toBe('resting');
    expect(moodFor(40)).toBe('calm');
    expect(moodFor(70)).toBe('good');
    expect(moodFor(95)).toBe('energetic');
  });
});

describe('normalizeCharacterDraft look', () => {
  const draft = { identity: 'Biri', traits: [{ name: 'Sakin', habitIds: [] }] };
  it('görünüm verilmezse taslakta yer almaz, null ve geçerli değer korunur', () => {
    const omitted = normalizeCharacterDraft(draft);
    expect(omitted.ok && 'look' in omitted.value).toBe(false);
    const reset = normalizeCharacterDraft({ ...draft, look: null });
    expect(reset.ok && reset.value.look).toBeNull();
    const look = deriveLook(3);
    const kept = normalizeCharacterDraft({ ...draft, look });
    expect(kept.ok && kept.value.look).toEqual(look);
  });

  it('geçersiz görünümü reddeder', () => {
    const look = { ...deriveLook(3), mouth: 'kocaman' } as unknown as AvatarLook;
    expect(normalizeCharacterDraft({ ...draft, look }).ok).toBe(false);
  });
});
