// İstemciye anlamlı HTTP yanıtı olarak dönen uygulama hataları

export type ErrorCode =
  'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'NOT_FOUND' | 'CONFLICT' | 'INTERNAL_ERROR';

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode;

  constructor(statusCode: number, code: ErrorCode, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

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
