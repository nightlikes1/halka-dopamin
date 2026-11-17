import { formatDayRange } from '@core/utils/date';
import { weekSummary } from '@features/stats/domain/weekSummary';

describe('weekSummary', () => {
  it('son 7 günü eskiden yeniye, aktif alışkanlıklarla hesaplar', () => {
    const summary = weekSummary(
      [
        { date: '2026-11-17', habitId: 'a', status: 'done' },
        { date: '2026-11-17', habitId: 'b', status: 'missed' },
        { date: '2026-11-16', habitId: 'a', status: 'done' },
        { date: '2026-11-16', habitId: 'b', status: 'clean' },
        { date: '2026-11-15', habitId: 'arsiv', status: 'done' },
        { date: '2026-11-10', habitId: 'a', status: 'done' },
      ],
      ['a', 'b'],
      '2026-11-17',
    );
    expect(summary.days.map((day) => day.date)).toEqual([
      '2026-11-11',
      '2026-11-12',
      '2026-11-13',
      '2026-11-14',
      '2026-11-15',
      '2026-11-16',
      '2026-11-17',
    ]);
    expect(summary.days.at(-1)?.pct).toBe(50);
    expect(summary.days.at(-2)?.pct).toBe(100);
    expect(summary.completed).toBe(3);
    expect(summary.averagePct).toBe(21);
  });

  it('alışkanlık yoksa sıfır', () => {
    expect(weekSummary([], [], '2026-11-17').averagePct).toBe(0);
  });
});

describe('formatDayRange', () => {
  it('aynı ay ve ay geçişi', () => {
    expect(formatDayRange('2026-11-11', '2026-11-17')).toBe('11 – 17 Kasım');
    expect(formatDayRange('2026-10-28', '2026-11-03')).toBe('28 Ekim – 3 Kasım');
  });
});
