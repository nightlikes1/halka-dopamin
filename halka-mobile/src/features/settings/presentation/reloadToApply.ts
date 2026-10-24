// Renkler ve görsel stil açılışta bir kez uygulanır; kaydedilen seçim uygulamayı yeniden yükleyerek
// gösterilir: web'de sayfa, geliştirme modunda DevSettings; mağaza sürümünde kullanıcıya yeniden
// açınca uygulanacağı söylenir.
import { DevSettings, Platform } from 'react-native';
import { showMessage } from '@presentation/utils/dialogs';

export function reloadToApply(title: string, restartMessage: string): void {
  if (Platform.OS === 'web') {
    globalThis.location?.reload();
    return;
  }
  if (__DEV__) {
    DevSettings.reload();
    return;
  }
  showMessage(title, restartMessage);
}
