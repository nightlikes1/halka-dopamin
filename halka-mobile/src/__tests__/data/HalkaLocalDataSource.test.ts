// Yerel veri kaynağı testleri
import { FakeClock, InMemoryKeyValueStorage, TEST_NOW } from '../fakes/fakes';
import { STORAGE_KEY } from '@core/constants/storage';
import { createDefaultStorageDto } from '@data/datasources/createDefaultStorageDto';
import { HalkaLocalDataSource } from '@data/datasources/HalkaLocalDataSource';

const createDataSource = (storage: InMemoryKeyValueStorage) =>
  new HalkaLocalDataSource(storage, () => createDefaultStorageDto(new FakeClock(TEST_NOW)));

describe('HalkaLocalDataSource', () => {
  it('kayıt yoksa varsayılan veriyle başlar', async () => {
    const dto = await createDataSource(new InMemoryKeyValueStorage()).read();

    expect(dto.layout.activeWidgetIds).toEqual(['water', 'pomodoro', 'tasks', 'streak']);
    expect(dto.water.current).toBe(1250);
  });

  it('bozuk JSON da varsayılana düşer, uygulama çökmez', async () => {
    const storage = new InMemoryKeyValueStorage();
    storage.data.set(STORAGE_KEY, '{bozuk');

    const dto = await createDataSource(storage).read();

    expect(dto.profile.name).toBe('Kullanıcı');
  });

  it('yalnızca geçersiz bölümü varsayılanla değiştirir', async () => {
    const storage = new InMemoryKeyValueStorage();
    const valid = createDefaultStorageDto(new FakeClock(TEST_NOW));
    storage.data.set(
      STORAGE_KEY,
      JSON.stringify({ ...valid, water: { current: 'çok' }, notes: { content: 'Merhaba' } }),
    );

    const dto = await createDataSource(storage).read();

    expect(dto.water).toEqual(valid.water);
    expect(dto.notes.content).toBe('Merhaba');
  });

  it('güncellemeleri sırayla yazar; son durum diske yansır', async () => {
    const storage = new InMemoryKeyValueStorage();
    const dataSource = createDataSource(storage);

    await Promise.all([
      dataSource.update((dto) => ({ ...dto, water: { ...dto.water, current: 1 } })),
      dataSource.update((dto) => ({ ...dto, notes: { content: 'son' } })),
    ]);

    const persisted: unknown = JSON.parse(storage.data.get(STORAGE_KEY) ?? 'null');
    expect(persisted).toMatchObject({ water: { current: 1 }, notes: { content: 'son' } });
  });

  it('okuma hatasını fırlatır (repository yakalar)', async () => {
    const storage = new InMemoryKeyValueStorage();
    storage.failOnRead = true;

    await expect(createDataSource(storage).read()).rejects.toThrow('read failed');
  });
});
