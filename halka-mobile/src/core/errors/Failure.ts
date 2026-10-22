// Uygulama genelinde kullanılan hata (Failure) türleri

export type FailureKind =
  'storage' | 'validation' | 'audio' | 'clipboard' | 'network' | 'auth' | 'server' | 'unexpected';

export abstract class Failure {
  abstract readonly kind: FailureKind;
  readonly message: string;
  readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    this.message = message;
    this.cause = cause;
  }
}

// Kalıcı depolama okuma/yazma hatası
export class StorageFailure extends Failure {
  readonly kind = 'storage' as const;
}

// İş kuralı / girdi doğrulama hatası
export class ValidationFailure extends Failure {
  readonly kind = 'validation' as const;
}

// Ses çalma hatası
export class AudioFailure extends Failure {
  readonly kind = 'audio' as const;
}

// Pano erişim hatası
export class ClipboardFailure extends Failure {
  readonly kind = 'clipboard' as const;
}

// Sunucuya ulaşılamadı (internet yok, API kapalı, farklı ağ)
export class NetworkFailure extends Failure {
  readonly kind = 'network' as const;
}

// Oturum yok/geçersiz ya da kimlik bilgileri hatalı
export class AuthFailure extends Failure {
  readonly kind = 'auth' as const;
}

// Sunucu tarafında hata (5xx)
export class ServerFailure extends Failure {
  readonly kind = 'server' as const;
}

// Beklenmeyen hata
export class UnexpectedFailure extends Failure {
  readonly kind = 'unexpected' as const;
}
