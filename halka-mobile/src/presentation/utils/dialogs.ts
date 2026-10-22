// Platformlar arası onay ve bilgi diyalogları. react-native-web'de Alert.alert boş bir fonksiyondur;
// web'de tarayıcının confirm/alert pencereleri, mobilde Alert kullanılır.
import { Alert, Platform } from 'react-native';

interface BrowserDialogs {
  confirm(message: string): boolean;
  alert(message: string): void;
}

function browserDialogs(): BrowserDialogs | null {
  if (Platform.OS !== 'web') return null;
  const host = globalThis as Partial<BrowserDialogs>;
  return typeof host.confirm === 'function' && typeof host.alert === 'function'
    ? (host as BrowserDialogs)
    : null;
}

const join = (title: string, message: string) => (message ? `${title}\n\n${message}` : title);

export interface ConfirmOptions {
  readonly title: string;
  readonly message: string;
  readonly confirmText: string;
  readonly cancelText: string;
  readonly destructive?: boolean;
  readonly onConfirm: () => void;
}

export function confirmAction({
  title,
  message,
  confirmText,
  cancelText,
  destructive = false,
  onConfirm,
}: ConfirmOptions): void {
  const browser = browserDialogs();
  if (browser) {
    if (browser.confirm(join(title, message))) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: cancelText, style: 'cancel' },
    { text: confirmText, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
  ]);
}

export function showMessage(title: string, message: string): void {
  const browser = browserDialogs();
  if (browser) {
    browser.alert(join(title, message));
    return;
  }
  Alert.alert(title, message);
}
