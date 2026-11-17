import { calmRemainingSeconds } from '@features/tools/domain/calmTimer';

describe('calmRemainingSeconds', () => {
  it('kalan süreyi yukarı yuvarlar ve sıfırın altına inmez', () => {
    const start = 1_000_000;
    expect(calmRemainingSeconds(start, 15, start)).toBe(900);
    expect(calmRemainingSeconds(start, 15, start + 500)).toBe(900);
    expect(calmRemainingSeconds(start, 15, start + 899_001)).toBe(1);
    expect(calmRemainingSeconds(start, 15, start + 2_000_000)).toBe(0);
  });
});
