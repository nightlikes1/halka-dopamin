// expo-clipboard ile pano erişimi (web'deki navigator.clipboard karşılığı)
import * as Clipboard from 'expo-clipboard';
import { ClipboardFailure } from '@core/errors/Failure';
import { err, okVoid, type AsyncResult } from '@core/result/Result';
import type { ClipboardPort } from '@domain/ports/ClipboardPort';

export class ExpoClipboardService implements ClipboardPort {
  async copyText(text: string): AsyncResult<void> {
    try {
      const copied = await Clipboard.setStringAsync(text);
      return copied ? okVoid() : err(new ClipboardFailure('Panoya kopyalanamadı.'));
    } catch (error) {
      return err(new ClipboardFailure('Panoya kopyalanamadı.', error));
    }
  }
}
