// Mobilde DiceBear SVG'leri react-native-svg'nin kendi ayrıştırıcısıyla (SvgXml) çizilir;
// 31 stilin ve parça seçimlerinin bu ayrıştırıcıdan hatasız geçtiği doğrulanır.
import { parse } from 'react-native-svg';
import { DICEBEAR_STYLES } from '@features/character/domain/dicebear';
import {
  diceBearParts,
  diceBearSvg,
  randomDiceBear,
} from '@features/character/presentation/dicebear/registry';

describe('DiceBear SVG mobil ayrıştırma', () => {
  it('her stil (varsayılan ve rastgele seçimlerle) ayrıştırılır', () => {
    let seed = 1;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (const style of DICEBEAR_STYLES) {
      expect(parse(diceBearSvg({ style, options: {} }, 'tohum'))).not.toBeNull();
      for (let i = 0; i < 3; i++) {
        expect(parse(diceBearSvg(randomDiceBear(style, random), `t${i}`))).not.toBeNull();
      }
      expect(diceBearParts(style)).toBeDefined();
    }
  });
});
