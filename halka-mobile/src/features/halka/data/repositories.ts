// Panonun her bölümü için aynı repository sınıfı kullanılır; yalnızca anahtar ve mapper değişir.
import { StorageFailure } from '@core/errors/Failure';
import { type AsyncResult, err, ok, okVoid } from '@core/result/Result';
import {
  bigOneMapper,
  budgetMapper,
  layoutMapper,
  type Mapper,
  moodMapper,
  notesMapper,
  pomodoroMapper,
  profileMapper,
  streakMapper,
  tasksMapper,
  waterMapper,
} from '@features/halka/data/mappers';
import type {
  HalkaLocalDataSource,
  HalkaSliceKey,
  HalkaStorageDto,
} from '@features/halka/data/storage';
import type { IEntityRepository, Repositories } from '@features/halka/domain/ports';

// DTO'nun tek bir bölümünü okuyup yazan genel repository.
// try/catch burada toplanır; dışarıya yalnızca Result döner.
export class SliceRepository<
  K extends HalkaSliceKey,
  TEntity,
> implements IEntityRepository<TEntity> {
  constructor(
    private readonly dataSource: HalkaLocalDataSource,
    private readonly key: K,
    private readonly mapper: Mapper<HalkaStorageDto[K], TEntity>,
  ) {}

  async get(): AsyncResult<TEntity> {
    try {
      const dto = await this.dataSource.read();
      return ok(this.mapper.toEntity(dto[this.key]));
    } catch (error) {
      return err(new StorageFailure('Veriler okunamadı.', error));
    }
  }

  async save(value: TEntity): AsyncResult<void> {
    try {
      const slice = this.mapper.toDto(value);
      await this.dataSource.update((dto) => ({ ...dto, [this.key]: slice }));
      return okVoid();
    } catch (error) {
      return err(new StorageFailure('Veriler kaydedilemedi.', error));
    }
  }
}

export function createRepositories(dataSource: HalkaLocalDataSource): Repositories {
  return {
    profile: new SliceRepository(dataSource, 'profile', profileMapper),
    layout: new SliceRepository(dataSource, 'layout', layoutMapper),
    water: new SliceRepository(dataSource, 'water', waterMapper),
    pomodoro: new SliceRepository(dataSource, 'pomodoro', pomodoroMapper),
    tasks: new SliceRepository(dataSource, 'tasks', tasksMapper),
    streak: new SliceRepository(dataSource, 'streak', streakMapper),
    notes: new SliceRepository(dataSource, 'notes', notesMapper),
    mood: new SliceRepository(dataSource, 'mood', moodMapper),
    bigOne: new SliceRepository(dataSource, 'bigOne', bigOneMapper),
    budget: new SliceRepository(dataSource, 'budget', budgetMapper),
  };
}
