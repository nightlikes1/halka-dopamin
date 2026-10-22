// Karaktere yakınlık hesabı: boş durum, tek/çok özellik, check-in etkisi, silinmiş alışkanlık, gün sınırı
import type { DailyCheckIn, DayRating, HabitCheck } from '@features/checkin/domain/entities';
import type { Trait } from '@features/character/domain/entities';
import {
  CHECKIN_WEIGHT,
  dailyProximity,
  displayedProximity,
  proximitySeries,
  traitDayProgress,
  traitDayStatus,
  withKnownHabits,
} from '@features/character/domain/proximity';

const trait = (id: string, habitIds: string[]): Trait => ({ id, name: id, order: 0, habitIds });

const checkIn = (date: string, rating: DayRating, entries: HabitCheck[]): DailyCheckIn => ({
  date,
  rating,
  entries,
  completedAt: '',
  updatedAt: '',
});

// Puanın etkisini ayırmak için: (puan-1)/4 = 0,5 olan orta puan
const MID: DayRating = 3;
const withRating = (traitPercent: number, rating: DayRating) =>
  (1 - CHECKIN_WEIGHT) * traitPercent + CHECKIN_WEIGHT * ((rating - 1) / 4) * 100;

describe('boş durumlar', () => {
  it('hiç özellik yoksa yakınlık hesaplanmaz', () => {
    expect(dailyProximity([], checkIn('2026-10-14', 5, []))).toBeNull();
  });

  it('bağlı alışkanlığı olmayan özellik ortalamaya girmez', () => {
    expect(dailyProximity([trait('sakin', [])], checkIn('2026-10-14', 5, []))).toBeNull();
  });

  it('check-in yapılmayan gün kayıt yok sayılır (%0 değil)', () => {
    expect(dailyProximity([trait('a', ['h1'])], undefined)).toBeNull();
    expect(traitDayStatus(['h1'], undefined)).toEqual({ linked: 1, answered: 0, done: 0 });
  });

  it('cevaplanmayan alışkanlık hesaba katılmaz', () => {
    const day = checkIn('2026-10-14', MID, [{ habitId: 'h1', status: 'done' }]);
    expect(traitDayProgress(['h1', 'h2'], day)).toBe(1);
  });

  it('hiç kayıtlı gün yoksa gösterilen yakınlık null', () => {
    expect(displayedProximity([{ date: '2026-10-14', value: null }])).toBeNull();
  });
});

describe('özellik ve günlük yakınlık', () => {
  it('iyi alışkanlıkta "yaptım", kötüde "uzak durdum" yapılmış sayılır', () => {
    const day = checkIn('2026-10-14', MID, [
      { habitId: 'kitap', status: 'done' },
      { habitId: 'spor', status: 'missed' },
      { habitId: 'telefon', status: 'clean' },
      { habitId: 'seker', status: 'slip' },
    ]);
    expect(traitDayProgress(['kitap', 'spor', 'telefon', 'seker'], day)).toBe(0.5);
  });

  it('tek özellik: ilerleme + küçük check-in katkısı', () => {
    const day = checkIn('2026-10-14', MID, [{ habitId: 'kitap', status: 'done' }]);
    expect(dailyProximity([trait('merakli', ['kitap'])], day)).toBeCloseTo(withRating(100, MID));
  });

  it('çok özellik: özelliklerin ortalaması alınır, katılmayan özellik ortalamayı düşürmez', () => {
    const day = checkIn('2026-10-14', MID, [
      { habitId: 'kitap', status: 'done' },
      { habitId: 'spor', status: 'missed' },
    ]);
    const traits = [trait('merakli', ['kitap']), trait('saglikli', ['spor']), trait('sakin', [])];
    expect(dailyProximity(traits, day)).toBeCloseTo(withRating(50, MID));
  });

  it('aynı alışkanlık birden çok özelliğe bağlanabilir ve tekrar sayılmaz', () => {
    const day = checkIn('2026-10-14', MID, [{ habitId: 'spor', status: 'done' }]);
    expect(traitDayStatus(['spor', 'spor'], day)).toEqual({ linked: 1, answered: 1, done: 1 });
    expect(
      dailyProximity([trait('saglikli', ['spor']), trait('disiplinli', ['spor'])], day),
    ).toBeCloseTo(withRating(100, MID));
  });
});

describe('check-in puanının etkisi', () => {
  const traits = [trait('merakli', ['kitap'])];
  const entries: HabitCheck[] = [{ habitId: 'kitap', status: 'done' }];

  it('ağırlık en fazla %20', () => {
    expect(CHECKIN_WEIGHT).toBeGreaterThan(0);
    expect(CHECKIN_WEIGHT).toBeLessThanOrEqual(0.2);
  });

  it('en kötü ve en iyi puan arasındaki fark ağırlık kadardır', () => {
    const worst = dailyProximity(traits, checkIn('2026-10-14', 1, entries));
    const best = dailyProximity(traits, checkIn('2026-10-14', 5, entries));
    expect(best).toBeCloseTo(100);
    expect(worst).toBeCloseTo(100 * (1 - CHECKIN_WEIGHT));
  });

  it('puan tek başına yakınlık oluşturmaz (bağlı cevap yoksa gün kayıt yok)', () => {
    expect(dailyProximity(traits, checkIn('2026-10-14', 5, []))).toBeNull();
  });
});

describe('silinmiş alışkanlık', () => {
  it('bilinmeyen alışkanlık bağları hesaptan çıkarılır', () => {
    const cleaned = withKnownHabits(trait('a', ['aktif', 'silinmis']), new Set(['aktif']));
    expect(cleaned.habitIds).toEqual(['aktif']);
  });

  it('tüm bağları silinen özellik çökmeden "kayıt yok" olur', () => {
    const cleaned = withKnownHabits(trait('a', ['silinmis']), new Set());
    const day = checkIn('2026-10-14', 5, [{ habitId: 'silinmis', status: 'done' }]);
    expect(dailyProximity([cleaned], day)).toBeNull();
  });
});

describe('7 günlük seri ve gün sınırı', () => {
  const traits = [trait('merakli', ['kitap'])];

  it('ay sınırını geçen 7 günlük seri üretir, eksik günleri ortalamaya katmaz', () => {
    const series = proximitySeries(
      traits,
      [
        checkIn('2026-09-30', 5, [{ habitId: 'kitap', status: 'done' }]),
        checkIn('2026-10-02', 5, [{ habitId: 'kitap', status: 'missed' }]),
      ],
      '2026-10-03',
      7,
    );

    expect(series.map((day) => day.date)).toEqual([
      '2026-09-27',
      '2026-09-28',
      '2026-09-29',
      '2026-09-30',
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
    ]);
    expect(series.filter((day) => day.value !== null)).toHaveLength(2);
    // (100 + 20) / 2: kaçırılan günde yalnızca puan katkısı kalır
    expect(displayedProximity(series)).toBeCloseTo(60);
  });

  it('ilk günlerde yalnızca mevcut günlerle hesaplar', () => {
    const series = proximitySeries(
      traits,
      [checkIn('2026-10-14', MID, [{ habitId: 'kitap', status: 'done' }])],
      '2026-10-14',
      7,
    );
    expect(displayedProximity(series)).toBeCloseTo(withRating(100, MID));
  });

  it('pencere dışında kalan eski günler gösterilen yakınlığa girmez', () => {
    const series = proximitySeries(
      traits,
      [checkIn('2026-10-01', 5, [{ habitId: 'kitap', status: 'done' }])],
      '2026-10-14',
      30,
    );
    expect(series.some((day) => day.value !== null)).toBe(true);
    expect(displayedProximity(series)).toBeNull();
  });
});
