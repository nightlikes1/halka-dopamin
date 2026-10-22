// Pano erişimi için domain portu
import type { AsyncResult } from '@core/result/Result';

export interface ClipboardPort {
  copyText(text: string): AsyncResult<void>;
}
