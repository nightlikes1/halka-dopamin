// Tek bir varlığı okuyan/yazan genel repository sözleşmesi
import type { AsyncResult } from '@core/result/Result';

export interface IEntityRepository<T> {
  get(): AsyncResult<T>;
  save(value: T): AsyncResult<void>;
}
