import { habitTitleError, sameHabitTitle } from '@features/habits/domain/entities';

describe('sameHabitTitle', () => {
  it('büyük/küçük harf (Türkçe) ve kenar boşluğu farkını yok sayar', () => {
    expect(sameHabitTitle('Kitap oku', '  KİTAP OKU ')).toBe(true);
    expect(sameHabitTitle('ılık duş', 'ILIK DUŞ')).toBe(true);
    expect(sameHabitTitle('Kitap oku', 'Kitap okumak')).toBe(false);
  });
});

describe('habitTitleError', () => {
  const existing = [{ title: 'Kitap oku' }];

  it('boş ve yalnız boşluktan oluşan adı reddeder', () => {
    expect(habitTitleError('', existing)).toBe('required');
    expect(habitTitleError('   ', existing)).toBe('required');
  });

  it('çok uzun adı reddeder', () => {
    expect(habitTitleError('a'.repeat(81), existing)).toBe('tooLong');
    expect(habitTitleError('a'.repeat(80), existing)).toBeNull();
  });

  it('var olan adı Türkçe harf farkıyla da yakalar', () => {
    expect(habitTitleError('  KİTAP OKU ', existing)).toBe('duplicate');
  });

  it('yeni adı kabul eder', () => {
    expect(habitTitleError('Yürüyüş yap', existing)).toBeNull();
  });
});
