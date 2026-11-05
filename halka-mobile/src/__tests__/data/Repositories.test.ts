// Repository implementasyonu testleri (gerçek datasource + bellek içi depolama)
import { FakeClock, InMemoryKeyValueStorage, TEST_NOW } from '../fakes/fakes';
import { HalkaLocalDataSource, STORAGE_KEY } from '@data/storage';
import { createDefaultStorageDto } from '@data/mappers';
import { createRepositories } from '@data/repositories';

const setup = () => {
  const storage = new InMemoryKeyValueStorage();
  const dataSource = new HalkaLocalDataSource(storage, () =>
    createDefaultStorageDto(new FakeClock(TEST_NOW)),
  );
  return { storage, dataSource };
};

describe('SliceRepository', () => {
  it('entity yi kaydeder ve tekrar okur', async () => {
    const { dataSource } = setup();
    const repository = createRepositories(dataSource).water;

    await repository.save({ current: 750, target: 2000 });
    const result = await repository.get();

    expect(result).toEqual({ ok: true, value: { current: 750, target: 2000 } });
  });

  it('yalnızca kendi bölümünü değiştirir', async () => {
    const { dataSource, storage } = setup();
    const repos = createRepositories(dataSource);

    await repos.water.save({ current: 10, target: 2500 });
    await repos.notes.save({ content: 'not' });

    const persisted: unknown = JSON.parse(storage.data.get(STORAGE_KEY) ?? 'null');
    expect(persisted).toMatchObject({
      water: { current: 10 },
      notes: { content: 'not' },
      layout: { activeWidgetIds: ['water', 'pomodoro', 'tasks', 'streak'] },
    });
  });

  it('okuma hatasında StorageFailure döner (exception sızmaz)', async () => {
    const { dataSource, storage } = setup();
    storage.failOnRead = true;

    const result = await createRepositories(dataSource).water.get();

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('storage');
  });

  it('yazma hatasında StorageFailure döner', async () => {
    const { dataSource, storage } = setup();
    storage.failOnWrite = true;

    const result = await createRepositories(dataSource).water.save({ current: 1, target: 1 });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('storage');
  });
});
