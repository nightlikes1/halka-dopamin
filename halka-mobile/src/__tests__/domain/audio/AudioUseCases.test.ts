// Ses ve ilgili profil use case testleri
import { createFakeRepositories, FakeAudioPort, TEST_TODAY } from '../../fakes/fakes';
import { createDefaultSnapshot } from '@domain/entities/defaults';
import { ToggleAmbientUseCase } from '@domain/usecases/audio/ToggleAmbientUseCase';
import { RemoveWidgetUseCase } from '@domain/usecases/layout/RemoveWidgetUseCase';
import { ToggleSoundUseCase } from '@domain/usecases/profile/ToggleSoundUseCase';

describe('ToggleAmbientUseCase', () => {
  it('sesi başlatır, aynı ses tekrar seçilince durdurur', async () => {
    const audio = new FakeAudioPort();
    const useCase = new ToggleAmbientUseCase(audio);

    expect(await useCase.execute('rain')).toEqual({ ok: true, value: 'rain' });
    expect(await useCase.execute('rain')).toEqual({ ok: true, value: null });
    expect(audio.ambient).toBeNull();
  });

  it('başka bir sese geçer', async () => {
    const audio = new FakeAudioPort();
    const useCase = new ToggleAmbientUseCase(audio);

    await useCase.execute('rain');
    const result = await useCase.execute('drone');

    expect(result).toEqual({ ok: true, value: 'drone' });
  });

  it('sesler kapalıyken doğrulama hatası döner', async () => {
    const audio = new FakeAudioPort();
    audio.enabled = false;

    const result = await new ToggleAmbientUseCase(audio).execute('focus');

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('validation');
  });
});

describe('ToggleSoundUseCase', () => {
  it('tercihi kaydeder ve ses altyapısını kapatır', async () => {
    const repos = createFakeRepositories(createDefaultSnapshot(TEST_TODAY));
    const audio = new FakeAudioPort();
    audio.ambient = 'rain';

    const result = await new ToggleSoundUseCase(repos.profile, audio).execute();

    expect(result.ok && result.value.soundEnabled).toBe(false);
    expect(audio.enabled).toBe(false);
    expect(audio.ambient).toBeNull();
  });
});

describe('RemoveWidgetUseCase', () => {
  it('ortam sesi eklentisi kaldırılınca çalan sesi durdurur', async () => {
    const snapshot = createDefaultSnapshot(TEST_TODAY);
    const repos = createFakeRepositories({ ...snapshot, activeWidgetIds: ['water', 'ambient'] });
    const audio = new FakeAudioPort();
    audio.ambient = 'drone';

    const result = await new RemoveWidgetUseCase(repos.layout, audio).execute('ambient');

    expect(result).toEqual({ ok: true, value: ['water'] });
    expect(audio.ambient).toBeNull();
  });
});
