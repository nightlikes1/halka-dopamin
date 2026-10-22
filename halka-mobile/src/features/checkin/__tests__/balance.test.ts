// Dopamin dengesi skoru ve hatalı gün tespiti
import { computeDailyBalance, isTroubledDay } from '@features/checkin/domain/balance';
import type { HabitCheck } from '@features/checkin/domain/entities';

const done = (id: string): HabitCheck => ({ habitId: id, status: 'done' });
const missed = (id: string): HabitCheck => ({ habitId: id, status: 'missed' });
const clean = (id: string): HabitCheck => ({ habitId: id, status: 'clean' });
const slip = (id: string): HabitCheck => ({ habitId: id, status: 'slip' });

describe('computeDailyBalance', () => {
  it('plandaki örnek: 1/2 iyi, 1/2 kötü, puan 3 -> 50', () => {
    const balance = computeDailyBalance({
      rating: 3,
      entries: [done('a'), missed('b'), clean('c'), slip('d')],
    });

    expect(balance).toEqual({ score: 50, buildRatio: 0.5, quitRatio: 0.5, ratingRatio: 0.5 });
  });

  it('her şey yolundaysa 100, hiçbir şey olmadıysa 0', () => {
    expect(computeDailyBalance({ rating: 5, entries: [done('a'), clean('b')] }).score).toBe(100);
    expect(computeDailyBalance({ rating: 1, entries: [missed('a'), slip('b')] }).score).toBe(0);
  });

  it('cevaplanmayan grubun ağırlığını diğerlerine dağıtır', () => {
    // Yalnızca iyi alışkanlık: (0,4·1 + 0,2·0,5) / 0,6 = 0,833…
    const balance = computeDailyBalance({ rating: 3, entries: [done('a')] });

    expect(balance.quitRatio).toBeNull();
    expect(balance.score).toBe(83);
  });

  it('hiç alışkanlık yoksa yalnızca puan belirler', () => {
    expect(computeDailyBalance({ rating: 4, entries: [] }).score).toBe(75);
  });
});

describe('isTroubledDay', () => {
  it('kayma, yapılmayan iyi alışkanlık veya puan ≤ 2 hatalı gündür', () => {
    expect(isTroubledDay({ rating: 4, entries: [slip('a')] })).toBe(true);
    expect(isTroubledDay({ rating: 4, entries: [missed('a')] })).toBe(true);
    expect(isTroubledDay({ rating: 2, entries: [done('a')] })).toBe(true);
  });

  it('iyi geçen gün hatalı sayılmaz', () => {
    expect(isTroubledDay({ rating: 3, entries: [done('a'), clean('b')] })).toBe(false);
  });
});
