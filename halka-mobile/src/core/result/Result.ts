// Result deseni: başarılı (Ok) veya hatalı (Err) sonuç
import type { Failure } from '@core/errors/Failure';

export interface Ok<T> {
  readonly ok: true;
  readonly value: T;
}

export interface Err<E extends Failure = Failure> {
  readonly ok: false;
  readonly error: E;
}

export type Result<T, E extends Failure = Failure> = Ok<T> | Err<E>;

export type AsyncResult<T, E extends Failure = Failure> = Promise<Result<T, E>>;

export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });

export const okVoid = (): Ok<void> => ({ ok: true, value: undefined });

export const err = <E extends Failure>(error: E): Err<E> => ({ ok: false, error });

// Başarılı sonucun değerini dönüştürür
export function mapResult<T, U, E extends Failure>(
  result: Result<T, E>,
  fn: (value: T) => U,
): Result<U, E> {
  return result.ok ? ok(fn(result.value)) : result;
}
