import { sameHabitTitle } from '@features/habits/domain/entities';

describe('sameHabitTitle', () => {
  it('büyük/küçük harf (Türkçe) ve kenar boşluğu farkını yok sayar', () => {
    expect(sameHabitTitle('Kitap oku', '  KİTAP OKU ')).toBe(true);
    expect(sameHabitTitle('ılık duş', 'ILIK DUŞ')).toBe(true);
    expect(sameHabitTitle('Kitap oku', 'Kitap okumak')).toBe(false);
  });
});
