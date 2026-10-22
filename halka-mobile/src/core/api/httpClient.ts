// Tek, yapılandırılmış axios istemcisi + HTTP hatalarını Failure'a çeviren yardımcı
import { create as createAxios, isAxiosError, type AxiosInstance } from 'axios';
import { z } from 'zod';
import {
  AuthFailure,
  NetworkFailure,
  ServerFailure,
  UnexpectedFailure,
  ValidationFailure,
  type Failure,
} from '@core/errors/Failure';
import { strings } from '@core/i18n/tr';

const REQUEST_TIMEOUT_MS = 10_000;

export interface HttpClientOptions {
  readonly baseURL: string;
  // Her istekte güncel token okunur (yoksa null)
  readonly getToken: () => string | null;
  // Korumalı bir istekte 401 alınırsa çağrılır (oturumu kapatmak için)
  readonly onUnauthorized?: () => void;
}

export function createHttpClient({
  baseURL,
  getToken,
  onUnauthorized,
}: HttpClientOptions): AxiosInstance {
  const client = createAxios({
    baseURL,
    timeout: REQUEST_TIMEOUT_MS,
    headers: { 'Content-Type': 'application/json' },
  });

  client.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.set('Authorization', `Bearer ${token}`);
    return config;
  });

  client.interceptors.response.use(undefined, (error: unknown) => {
    if (isAxiosError(error) && error.response?.status === 401 && getToken()) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  });

  return client;
}

// Sunucunun standart hata gövdesi: { error: { code, message } }
const errorBodySchema = z.object({
  error: z.object({ code: z.string(), message: z.string() }),
});

export function toFailure(error: unknown): Failure {
  if (!isAxiosError(error)) return new UnexpectedFailure(strings.errors.unexpected, error);

  const response = error.response;
  if (!response) return new NetworkFailure(strings.errors.network, error);

  const parsed = errorBodySchema.safeParse(response.data);
  const serverMessage = parsed.success ? parsed.data.error.message : undefined;

  if (response.status === 401) {
    return new AuthFailure(serverMessage ?? strings.errors.sessionExpired, error);
  }
  if (response.status >= 500) return new ServerFailure(strings.errors.server, error);
  return new ValidationFailure(serverMessage ?? strings.errors.unexpected, error);
}
