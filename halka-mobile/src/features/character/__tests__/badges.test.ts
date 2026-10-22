import { computeBadges } from '@features/character/presentation/badges';

const unlocked = (input: Parameters<typeof computeBadges>[0]) =>
  computeBadges(input)
    .filter((badge) => badge.unlocked)
    .map((badge) => badge.id);

describe('computeBadges', () => {
  it('hiç kayıt yoksa tüm rozetler kilitli', () => {
    expect(
      unlocked({ hasAnyRecord: false, recordedThisWeek: 0, streakDays: 0, proximity: null }),
    ).toEqual([]);
  });

  it('eşiklerde açılır', () => {
    expect(
      unlocked({ hasAnyRecord: true, recordedThisWeek: 7, streakDays: 7, proximity: 80 }),
    ).toEqual(['firstCheckIn', 'streak7', 'fullWeek', 'proximity80']);
  });

  it('eşiğin hemen altında kilitli kalır', () => {
    expect(
      unlocked({ hasAnyRecord: true, recordedThisWeek: 6, streakDays: 6, proximity: 79.9 }),
    ).toEqual(['firstCheckIn']);
  });
});
