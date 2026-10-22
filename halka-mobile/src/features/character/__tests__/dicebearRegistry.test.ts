import { strings } from '@core/i18n/tr';
import { DICEBEAR_STYLES } from '@features/character/domain/dicebear';
import {
  diceBearMeta,
  diceBearParts,
  diceBearSvg,
} from '@features/character/presentation/dicebear/registry';

describe('DiceBear kaydı', () => {
  it('31 stilin hepsi SVG üretir ve tasarımcı bilgisi taşır', () => {
    expect(DICEBEAR_STYLES).toHaveLength(31);
    for (const style of DICEBEAR_STYLES) {
      const svg = diceBearSvg({ style, options: {} }, 'tohum');
      expect(svg.startsWith('<svg')).toBe(true);
      expect(diceBearMeta(style).creator.length).toBeGreaterThan(0);
    }
  });

  it('aynı tohum aynı, farklı tohum farklı avatar verir', () => {
    const a = diceBearSvg({ style: 'avataaars', options: {} }, 'bir');
    expect(diceBearSvg({ style: 'avataaars', options: {} }, 'bir')).toBe(a);
    expect(diceBearSvg({ style: 'avataaars', options: {} }, 'iki')).not.toBe(a);
  });

  it('karakter stillerinde düzenlenebilir parçalar var; seçim çizimi değiştirir', () => {
    for (const style of ['avataaars', 'adventurer', 'lorelei', 'micah', 'pixelArt'] as const) {
      const parts = diceBearParts(style);
      expect(parts.length).toBeGreaterThan(3);
      const part = parts.find((p) => p.kind === 'enum' && p.values.length > 1);
      expect(part).toBeDefined();
      if (!part) continue;
      const first = diceBearSvg({ style, options: { [part.key]: [part.values[0] ?? ''] } }, 's');
      const second = diceBearSvg({ style, options: { [part.key]: [part.values[1] ?? ''] } }, 's');
      expect(first).not.toBe(second);
    }
  });

  it('teknik alanlar (ofset, döndürme, olasılık) parça olarak çıkmaz', () => {
    for (const style of DICEBEAR_STYLES) {
      for (const part of diceBearParts(style)) {
        expect(part.key).not.toMatch(/Offset|Rotation|Probability/);
      }
    }
  });
});

describe('DiceBear Türkçe etiketler', () => {
  it('düzenleyicide görünen her parçanın ve stilin Türkçe adı var', () => {
    const missing: string[] = [];
    for (const style of DICEBEAR_STYLES) {
      expect(strings.character.studio.styles[style]).toBeTruthy();
      for (const part of diceBearParts(style)) {
        if (!strings.character.studio.dicebearParts[part.key]) missing.push(`${style}.${part.key}`);
      }
    }
    expect(missing).toEqual([]);
  });
});
