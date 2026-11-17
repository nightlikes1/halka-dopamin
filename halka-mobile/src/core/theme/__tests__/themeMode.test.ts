import {
  accentColors,
  accentTints,
  activeThemeKey,
  activeThemeMode,
  applyThemeMode,
  backdropBlobs,
  colors,
  dopamineColors,
  gradients,
  halkaDark,
  halkaLight,
  moduleColors,
  moduleInk,
  resolveThemeMode,
} from '@core/theme/tokens';
import { themed } from '@core/theme/themed';
import { buildLut, NEUTRAL_INDEX } from '@presentation/particles/engine/palette';

describe('applyThemeMode', () => {
  afterEach(() => applyThemeMode('dark'));

  it('varsayılan koyu: saf siyah zemin, turuncu ödül, gradyan ve lekeler', () => {
    expect(activeThemeMode()).toBe('dark');
    expect(activeThemeKey()).toBe('dark');
    expect(colors.background).toBe(halkaDark.base);
    expect(colors.textPrimary).toBe(halkaDark.textPrimary);
    expect(colors.gold).toBe(halkaDark.reward);
    expect(moduleColors.focus).toBe('#7D7AFF');
    expect(moduleInk.focus).toBe('#7D7AFF');
    expect(gradients.ring).toHaveLength(3);
    expect(backdropBlobs.length).toBeGreaterThan(0);
    expect(accentTints.amber).toBe(accentColors.amber);
    expect(colors.iconOnTint).toBe('#FFFFFF');
    expect(dopamineColors.cheap).toBe(moduleColors.mood);
  });

  it('aydınlıkta renkleri yerinde günceller, koyuya geri döner', () => {
    const ref = colors;
    const blobs = backdropBlobs;
    applyThemeMode('light');
    expect(colors).toBe(ref);
    expect(backdropBlobs).toBe(blobs);
    expect(activeThemeMode()).toBe('light');
    expect(colors.background).toBe(halkaLight.base);
    expect(colors.bgPrimary).toBe(halkaLight.base);
    expect(colors.gold).toBe(halkaLight.reward);
    expect(moduleColors.focus).toBe('#3A4FD6');
    expect(dopamineColors.neutral).toBe(halkaLight.textSecondary);

    applyThemeMode('dark');
    expect(colors.background).toBe(halkaDark.base);
    expect(moduleColors.focus).toBe('#7D7AFF');
    expect(dopamineColors.neutral).toBe(halkaDark.textSecondary);
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
  afterEach(() => applyThemeMode('dark'));

  it('aktif modun değerini verir, mod başına bir kez üretir', () => {
    const factory = jest.fn(() => ({ bg: colors.background }));
    const value = themed(factory);
    expect(value.bg).toBe(halkaDark.base);
    expect(value.bg).toBe(halkaDark.base);
    applyThemeMode('light');
    expect(value.bg).toBe(halkaLight.base);
    applyThemeMode('dark');
    expect(value.bg).toBe(halkaDark.base);
    expect(factory).toHaveBeenCalledTimes(2);
    expect(Object.keys(value)).toEqual(['bg']);
    expect({ ...value }).toEqual({ bg: halkaDark.base });
  });
});
