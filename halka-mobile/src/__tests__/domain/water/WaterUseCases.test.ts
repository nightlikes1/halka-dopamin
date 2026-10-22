// Su use case testleri
import { InMemoryRepository } from '../../fakes/fakes';
import type { Water } from '@domain/entities/Water';
import { AddWaterUseCase } from '@domain/usecases/water/AddWaterUseCase';
import { ResetWaterUseCase } from '@domain/usecases/water/ResetWaterUseCase';

describe('AddWaterUseCase', () => {
  let repository: InMemoryRepository<Water>;
  let useCase: AddWaterUseCase;

  beforeEach(() => {
    repository = new InMemoryRepository<Water>({ current: 1250, target: 2500 });
    useCase = new AddWaterUseCase(repository);
  });

  it('miktarı ekler ve kaydeder', async () => {
    const result = await useCase.execute(250);

    expect(result).toEqual({ ok: true, value: { current: 1500, target: 2500 } });
    expect(repository.value.current).toBe(1500);
  });

  it.each([0, -100, Number.NaN, 5000])('geçersiz miktarı (%p) reddeder', async (amount) => {
    const result = await useCase.execute(amount);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('validation');
    expect(repository.saveCount).toBe(0);
  });

  it('depolama hatasını Result olarak döndürür', async () => {
    repository.failOnSave = true;

    const result = await useCase.execute(100);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('storage');
  });
});

describe('ResetWaterUseCase', () => {
  it('sayacı sıfırlar, hedefi korur', async () => {
    const repository = new InMemoryRepository<Water>({ current: 900, target: 3000 });

    const result = await new ResetWaterUseCase(repository).execute();

    expect(result).toEqual({ ok: true, value: { current: 0, target: 3000 } });
  });
});
