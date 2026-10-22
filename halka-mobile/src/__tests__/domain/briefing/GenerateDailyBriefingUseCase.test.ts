// Günlük özet testleri
import { FakeClock, TEST_NOW, TEST_TODAY } from '../../fakes/fakes';
import { createDefaultSnapshot } from '@domain/entities/defaults';
import type { HalkaSnapshot } from '@domain/entities/HalkaSnapshot';
import { getGreeting } from '@domain/services/briefingGenerator';
import { GenerateDailyBriefingUseCase } from '@domain/usecases/briefing/GenerateDailyBriefingUseCase';

describe('GenerateDailyBriefingUseCase', () => {
  const useCase = new GenerateDailyBriefingUseCase(new FakeClock(TEST_NOW));

  it('aktif eklentilerden metrik ve özet üretir', () => {
    const briefing = useCase.execute(createDefaultSnapshot(TEST_TODAY));

    expect(briefing.greeting).toBe('Günaydın');
    expect(briefing.userName).toBe('Kullanıcı');
    expect(briefing.dateText).toBe('14 Ekim 2026, Çarşamba');
    expect(briefing.activeCount).toBe(4);
    expect(briefing.metrics.map((metric) => metric.label)).toEqual([
      'Su',
      'Odak',
      'Görevler',
      'Zincir',
    ]);
    expect(briefing.metrics[0]).toMatchObject({ value: '1250 / 2500 ml', pct: 50 });
    expect(briefing.summaryText).toBe(
      "Su hedefinin %50'si tamamlandı. 2 derin odak seansı tamamlandı. Halkanın tüm döngüleri dengeli işliyor.",
    );
  });

  it('eklenti yoksa davet metni döner', () => {
    const snapshot: HalkaSnapshot = { ...createDefaultSnapshot(TEST_TODAY), activeWidgetIds: [] };

    const briefing = useCase.execute(snapshot);

    expect(briefing.metrics).toHaveLength(0);
    expect(briefing.summaryText).toContain('Halka hazır!');
  });

  it('boş isimde varsayılan hitabı kullanır', () => {
    const base = createDefaultSnapshot(TEST_TODAY);
    const briefing = useCase.execute({ ...base, profile: { ...base.profile, name: '  ' } });

    expect(briefing.userName).toBe('Dostum');
  });
});

describe('getGreeting', () => {
  it.each([
    [6, 'Günaydın'],
    [13, 'Tünaydın'],
    [19, 'İyi akşamlar'],
    [23, 'İyi geceler'],
    [3, 'İyi geceler'],
  ])('saat %i için "%s"', (hour, expected) => {
    expect(getGreeting(hour)).toBe(expected);
  });
});
