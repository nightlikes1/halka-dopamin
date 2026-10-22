// Use case sonucunu işler: başarılıysa callback, değilse kullanıcıya uyarı
import type { Result } from '@core/result/Result';
import { showMessage } from '@presentation/utils/dialogs';

export function handleResult<T>(result: Result<T>, onOk: (value: T) => void): boolean {
  if (result.ok) {
    onOk(result.value);
    return true;
  }
  showMessage('Bir sorun oluştu', result.error.message);
  return false;
}
