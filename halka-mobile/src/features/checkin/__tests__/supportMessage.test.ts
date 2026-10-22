import { strings } from '@core/i18n/tr';
import { supportMessage } from '@features/checkin/presentation/supportMessage';

const t = strings.checkIn;

describe('supportMessage', () => {
  it('düşük skorda yarın vurgusu yapar', () => {
    expect(supportMessage(25, true)).toBe(t.troubledSupport);
    expect(supportMessage(39, false)).toBe(t.troubledSupport);
  });

  it('orta skorda nötr cesaretlendirme verir', () => {
    expect(supportMessage(40, true)).toBe(t.midDay);
    expect(supportMessage(69, false)).toBe(t.midDay);
  });

  it('yüksek skorlu hatalı günde çelişkili mesaj vermez', () => {
    expect(supportMessage(82, true)).toBe(t.goodDayWithSlip);
    expect(supportMessage(82, false)).toBe(t.goodDay);
  });
});
