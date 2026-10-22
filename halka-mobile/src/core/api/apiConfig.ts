// API adresi çözümleme.
// Öncelik: EXPO_PUBLIC_API_URL -> geliştirmede Metro'nun çalıştığı bilgisayarın IP'si -> localhost
import Constants from 'expo-constants';

const API_PORT = 3000;

export function resolveApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv && fromEnv.trim().length > 0) return fromEnv.trim().replace(/\/+$/, '');

  // Expo Go'da hostUri "192.168.1.20:8081" biçimindedir; API aynı bilgisayarda 3000 portunda
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(':')[0];
  if (host) return `http://${host}:${API_PORT}`;

  return `http://localhost:${API_PORT}`;
}
