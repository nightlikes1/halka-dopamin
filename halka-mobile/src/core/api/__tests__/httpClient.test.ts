// HTTP hatalarının Failure türlerine eşlenmesi
import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios';
import { toFailure } from '@core/api/httpClient';

const responseWith = (status: number, data: unknown): AxiosResponse => ({
  status,
  statusText: '',
  data,
  headers: {},
  config: { headers: new AxiosHeaders() },
});

const axiosError = (response?: AxiosResponse) =>
  new AxiosError('istek başarısız', undefined, undefined, undefined, response);

describe('toFailure', () => {
  it('yanıt yoksa ağ hatası döner', () => {
    expect(toFailure(axiosError()).kind).toBe('network');
  });

  it('401 de sunucunun mesajıyla auth hatası döner', () => {
    const failure = toFailure(
      axiosError(
        responseWith(401, {
          error: { code: 'UNAUTHORIZED', message: 'E-posta veya şifre hatalı.' },
        }),
      ),
    );

    expect(failure.kind).toBe('auth');
    expect(failure.message).toBe('E-posta veya şifre hatalı.');
  });

  it('409 gibi istemci hatalarında sunucu mesajını taşır', () => {
    const failure = toFailure(
      axiosError(
        responseWith(409, { error: { code: 'CONFLICT', message: 'Bu e-posta kayıtlı.' } }),
      ),
    );

    expect(failure).toMatchObject({ kind: 'validation', message: 'Bu e-posta kayıtlı.' });
  });

  it('5xx de sunucu ayrıntısını gizler', () => {
    const failure = toFailure(axiosError(responseWith(500, { stack: 'gizli' })));

    expect(failure.kind).toBe('server');
    expect(failure.message).not.toContain('gizli');
  });

  it('axios dışı hataları beklenmeyen hata sayar', () => {
    expect(toFailure(new Error('x')).kind).toBe('unexpected');
  });
});
