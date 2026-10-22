// DTO'nun tek bir bölümünü okuyup yazan genel repository.
// try/catch burada toplanır; dışarıya yalnızca Result döner.
import { StorageFailure } from '@core/errors/Failure';
import { err, ok, okVoid, type AsyncResult } from '@core/result/Result';
import type { HalkaLocalDataSource } from '@data/datasources/HalkaLocalDataSource';
import type { HalkaSliceKey, HalkaStorageDto } from '@data/dto/HalkaStorageDto';
import type { Mapper } from '@data/mappers/Mapper';
import type { IEntityRepository } from '@domain/repositories/IEntityRepository';

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
