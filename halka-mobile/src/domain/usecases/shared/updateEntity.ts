// Ortak akış: oku -> kuralı uygula -> kaydet -> yeni değeri döndür
import { ok, type AsyncResult, type Result } from '@core/result/Result';
import type { IEntityRepository } from '@domain/repositories/IEntityRepository';

export async function updateEntity<T>(
  repository: IEntityRepository<T>,
  update: (current: T) => Result<T>,
): AsyncResult<T> {
  const current = await repository.get();
  if (!current.ok) return current;

  const next = update(current.value);
  if (!next.ok) return next;

  const saved = await repository.save(next.value);
  return saved.ok ? ok(next.value) : saved;
}
