// Merkezi hata yönetimi: zod -> 400, AppError -> kendi kodu, diğerleri -> 500 (ayrıntı sızdırmadan)
import type { FastifyError, FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import { AppError, type ErrorBody } from '../core/errors.js';

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler<FastifyError | Error>((error, request, reply) => {
    if (error instanceof ZodError) {
      const body: ErrorBody = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Gönderilen bilgiler geçersiz.',
          issues: error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        },
      };
      return reply.status(400).send(body);
    }

    if (error instanceof AppError) {
      const body: ErrorBody = { error: { code: error.code, message: error.message } };
      return reply.status(error.statusCode).send(body);
    }

    // Fastify'ın kendi istemci hataları (bozuk JSON, çok büyük gövde vb.)
    const statusCode = 'statusCode' in error ? error.statusCode : undefined;
    if (statusCode !== undefined && statusCode >= 400 && statusCode < 500) {
      const body: ErrorBody = { error: { code: 'VALIDATION_ERROR', message: error.message } };
      return reply.status(statusCode).send(body);
    }

    request.log.error({ err: error }, 'Beklenmeyen hata');
    const body: ErrorBody = {
      error: { code: 'INTERNAL_ERROR', message: 'Beklenmeyen bir hata oluştu.' },
    };
    return reply.status(500).send(body);
  });

  app.setNotFoundHandler((_request, reply) => {
    const body: ErrorBody = { error: { code: 'NOT_FOUND', message: 'Uç nokta bulunamadı.' } };
    return reply.status(404).send(body);
  });
}
