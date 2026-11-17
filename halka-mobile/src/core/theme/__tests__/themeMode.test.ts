import {
  accentColors,
  accentTints,
  activeThemeFamily,
  activeThemeKey,
  activeThemeMode,
  applyTheme,
  applyThemeFamily,
  applyThemeMode,
  backdropBlobs,
  colors,
  dopamineColors,
  gradients,
  halkaDark,
  halkaLight,
  ivory,
  moduleColors,
  moduleInk,
  obsidian,
  resolveThemeMode,
  themeTraits,
} from '@core/theme/tokens';
import { themed } from '@core/theme/themed';
import { buildLut, NEUTRAL_INDEX } from '@presentation/particles/engine/palette';

describe('applyThemeMode', () => {
  afterEach(() => applyTheme('obsidian', 'dark'));

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

describe('applyTheme (aile)', () => {
  afterEach(() => applyTheme('obsidian', 'dark'));

  it('Halka koyu: saf siyah zemin, turuncu ödül, gradyan ve lekeler', () => {
    applyTheme('halka', 'dark');
    expect(activeThemeFamily()).toBe('halka');
    expect(activeThemeKey()).toBe('halka-dark');
    expect(colors.background).toBe(halkaDark.base);
    expect(colors.gold).toBe(halkaDark.reward);
    expect(moduleColors.focus).toBe('#7D7AFF');
    expect(moduleInk.focus).toBe('#7D7AFF');
    expect(gradients.ring).toHaveLength(3);
    expect(backdropBlobs.length).toBeGreaterThan(0);
    expect(themeTraits.buttonStyle).toBe('gradient');
    expect(accentTints.amber).toBe(accentColors.amber);
    expect(colors.iconOnTint).toBe('#FFFFFF');
    expect(dopamineColors.cheap).toBe(moduleColors.mood);
  });

  it("mod değişince aile korunur, Obsidyen'e dönünce her şey geri gelir", () => {
    applyTheme('halka', 'dark');
    applyThemeMode('light');
    expect(activeThemeFamily()).toBe('halka');
    expect(colors.background).toBe(halkaLight.base);
    expect(moduleColors.focus).toBe('#3A4FD6');

    applyThemeFamily('obsidian');
    expect(activeThemeMode()).toBe('light');
    expect(colors.background).toBe(ivory.base);
    applyThemeMode('dark');
    expect(colors.background).toBe(obsidian.base);
    expect(accentTints.amber).toBe('#483623');
    expect(accentColors.amber).toBe(obsidian.amber);
    expect(moduleColors.reward).toBe(obsidian.gold);
    expect(moduleInk.focus).toBe(obsidian.textPrimary);
    expect(gradients.reward).toEqual([obsidian.gold, obsidian.gold]);
    expect(backdropBlobs).toHaveLength(0);
    expect(themeTraits.buttonStyle).toBe('outline');
    expect(dopamineColors.cheap).toBe(obsidian.ruby);
  });
});

describe('resolveThemeMode', () => {
  it('sistem tercihini telefonun ayarına çevirir', () => {
    expect(resolveThemeMode('system', 'light')).toBe('light');
    expect(resolveThemeMode('system', 'dark')).toBe('dark');
    expect(resolveThemeMode('system', null)).toBe('dark');
    expect(resolveThemeMode('light', 'dark')).toBe('light');
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
  afterEach(() => applyTheme('obsidian', 'dark'));

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
    applyTheme('halka', 'dark');
    expect(value.bg).toBe(halkaDark.base);
    expect(factory).toHaveBeenCalledTimes(3);
    expect(Object.keys(value)).toEqual(['bg']);
    expect({ ...value }).toEqual({ bg: halkaDark.base });
  });
});
