import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ERROR_CODES } from '../constants/error-codes';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const body = exception.getResponse();

      // Resposta já no formato SIRA+ {code, message, statusCode} — repassa direto
      if (typeof body === 'object' && body !== null && 'code' in body) {
        response.status(statusCode).json(body);
        return;
      }

      // HttpException padrão do NestJS (ValidationPipe, NotFoundException, etc.)
      const rawMessage = typeof body === 'string' ? body : (body as Record<string, unknown>).message;
      const message = Array.isArray(rawMessage)
        ? rawMessage.join('; ')
        : typeof rawMessage === 'string'
          ? rawMessage
          : exception.message;

      response.status(statusCode).json({
        statusCode,
        code: ERROR_CODES.UNHANDLED_HTTP_ERROR,
        message,
      });
      return;
    }

    // Erro completamente inesperado — loga stack e retorna 500 genérico
    const errorMessage = exception instanceof Error ? exception.message : String(exception);
    this.logger.error(
      `[${request.method}] ${request.url} — ${errorMessage}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'Ocorreu um erro interno. Tente novamente mais tarde.',
    });
  }
}
