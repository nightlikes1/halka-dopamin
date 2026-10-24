import {
  accentTints,
  activeThemeMode,
  applyThemeMode,
  colors,
  dopamineColors,
  ivory,
  obsidian,
} from '@core/theme/tokens';
import { themed } from '@core/theme/themed';
import { buildLut, NEUTRAL_INDEX } from '@presentation/particles/engine/palette';

describe('applyThemeMode', () => {
  afterEach(() => applyThemeMode('dark'));

  it('varsayılan koyu tema', () => {
    expect(activeThemeMode()).toBe('dark');
    expect(colors.background).toBe(obsidian.base);
    expect(colors.textPrimary).toBe(obsidian.textPrimary);
  });

  it('açık temada renkleri yerinde günceller, koyuya geri döner', () => {
    const ref = colors;
    applyThemeMode('light');
    expect(colors).toBe(ref);
    expect(activeThemeMode()).toBe('light');
    expect(colors.background).toBe(ivory.base);
    expect(colors.bgPrimary).toBe(ivory.base);
    expect(colors.ink).toBe(ivory.base);
    expect(colors.gold).toBe(ivory.gold);
    expect(dopamineColors.neutral).toBe(ivory.textSecondary);
    expect(accentTints.amber).not.toBe('#483623');

    applyThemeMode('dark');
    expect(colors.background).toBe(obsidian.base);
    expect(accentTints.amber).toBe('#483623');
    expect(dopamineColors.neutral).toBe(obsidian.textSecondary);
  });
});

describe('buildLut açık ton', () => {
  it('renkleri koyulaştırır ve boş kısım için açık gri kullanır', () => {
    const dark = buildLut('buzAtes', false);
    const light = buildLut('buzAtes', true);
    expect(light[0]).toBeLessThan(dark[0] ?? 0);
    expect(light[NEUTRAL_INDEX * 3]).toBeGreaterThan(dark[NEUTRAL_INDEX * 3] ?? 0);
  });
});

describe('themed', () => {
  afterEach(() => applyThemeMode('dark'));

  it('aktif temanın değerini verir, tema başına bir kez üretir', () => {
    const factory = jest.fn(() => ({ bg: colors.background }));
    const value = themed(factory);
    expect(value.bg).toBe(obsidian.base);
    expect(value.bg).toBe(obsidian.base);
    applyThemeMode('light');
    expect(value.bg).toBe(ivory.base);
    applyThemeMode('dark');
    expect(value.bg).toBe(obsidian.base);
    expect(factory).toHaveBeenCalledTimes(2);
    expect(Object.keys(value)).toEqual(['bg']);
    expect({ ...value }).toEqual({ bg: obsidian.base });
  });
});
