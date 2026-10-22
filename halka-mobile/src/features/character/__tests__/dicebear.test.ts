import {
  chooseDiceBearPart,
  isDiceBearPartRemoved,
  isValidDiceBear,
  removeDiceBearPart,
  selectedDiceBearValue,
  type DiceBearAvatar,
} from '@features/character/domain/dicebear';
import { normalizeCharacterDraft } from '@features/character/domain/rules';

const base: DiceBearAvatar = { style: 'avataaars', options: {} };

describe('isValidDiceBear', () => {
  it('bilinen stil ve güvenli seçenekleri kabul eder', () => {
    expect(isValidDiceBear(base)).toBe(true);
    expect(
      isValidDiceBear({ style: 'pixelArt', options: { hair: ['short01'], hairProbability: 0 } }),
    ).toBe(true);
  });

  it('bilinmeyen stili, kötü anahtar/değeri ve aralık dışı olasılığı reddeder', () => {
    expect(isValidDiceBear({ style: 'yok', options: {} })).toBe(false);
    expect(isValidDiceBear({ style: 'avataaars', options: { top: ['<svg>'] } })).toBe(false);
    expect(isValidDiceBear({ style: 'avataaars', options: { 'a b': ['x'] } })).toBe(false);
    expect(isValidDiceBear({ style: 'avataaars', options: { topProbability: 101 } })).toBe(false);
    expect(isValidDiceBear({ style: 'avataaars', options: { top: 'tek' } })).toBe(false);
    expect(isValidDiceBear(null)).toBe(false);
  });
});

describe('parça seçimi', () => {
  it('seçilen parça yazılır ve "yok" olasılığı %100 olur', () => {
    const removed = removeDiceBearPart(base, 'accessoriesProbability');
    expect(isDiceBearPartRemoved(removed, 'accessoriesProbability')).toBe(true);
    const chosen = chooseDiceBearPart(removed, 'accessories', 'round', 'accessoriesProbability');
    expect(selectedDiceBearValue(chosen, 'accessories')).toBe('round');
    expect(isDiceBearPartRemoved(chosen, 'accessoriesProbability')).toBe(false);
    expect(chosen.options.accessoriesProbability).toBe(100);
  });

  it('olasılığı olmayan parçada yalnızca değer yazılır', () => {
    const chosen = chooseDiceBearPart(base, 'eyes', 'happy');
    expect(chosen.options).toEqual({ eyes: ['happy'] });
  });
});

describe('normalizeCharacterDraft dicebear', () => {
  const draft = { identity: 'Biri', traits: [{ name: 'Sakin', habitIds: [] }] };
  it('verilmezse taslakta yer almaz; null ve geçerli değer korunur; geçersiz reddedilir', () => {
    const omitted = normalizeCharacterDraft(draft);
    expect(omitted.ok && 'dicebear' in omitted.value).toBe(false);
    const reset = normalizeCharacterDraft({ ...draft, dicebear: null });
    expect(reset.ok && reset.value.dicebear).toBeNull();
    const kept = normalizeCharacterDraft({ ...draft, dicebear: base });
    expect(kept.ok && kept.value.dicebear).toEqual(base);
    const bad = { style: 'yok', options: {} } as unknown as DiceBearAvatar;
    expect(normalizeCharacterDraft({ ...draft, dicebear: bad }).ok).toBe(false);
  });
});
