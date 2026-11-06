// İstemciye anlamlı HTTP yanıtı olarak dönen uygulama hataları

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR';

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode;
  // Verilirse yanıta Retry-After başlığı eklenir
  readonly retryAfterSeconds?: number;

  constructor(statusCode: number, code: ErrorCode, message: string, retryAfterSeconds?: number) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    if (retryAfterSeconds !== undefined) this.retryAfterSeconds = retryAfterSeconds;
  }
}

export const tooManyRequests = (retryAfterSeconds: number) => {
  const wait =
    retryAfterSeconds < 60
      ? `${retryAfterSeconds} saniye`
      : `${Math.ceil(retryAfterSeconds / 60)} dakika`;
  return new AppError(
    429,
    'RATE_LIMITED',
    `Çok fazla deneme yapıldı. ${wait} sonra tekrar dene.`,
    retryAfterSeconds,
  );
};

export const unauthorized = (message = 'Oturum geçersiz, lütfen tekrar giriş yap.') =>
  new AppError(401, 'UNAUTHORIZED', message);

export const notFound = (message = 'Kayıt bulunamadı.') => new AppError(404, 'NOT_FOUND', message);

export const conflict = (message: string) => new AppError(409, 'CONFLICT', message);

export const badRequest = (message: string) => new AppError(400, 'VALIDATION_ERROR', message);

// Standart hata gövdesi
export interface ErrorBody {
  readonly error: {
    readonly code: ErrorCode;
    readonly message: string;
    readonly issues?: readonly { readonly path: string; readonly message: string }[];
  };
}
