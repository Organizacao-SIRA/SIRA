import {
  BadRequestException,
  ConflictException,
  HttpException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { ErrorCode } from '../constants/error-codes';

/**
 * Payload retornado para o cliente em qualquer erro mapeado.
 *
 * - `code` é a chave estável que o frontend usa para traduzir;
 * - `message` continua sendo enviado para clientes/logs que não conheçam o code.
 */
export interface SiraErrorPayload {
  code: ErrorCode;
  message: string;
  statusCode: number;
}

const build = (code: ErrorCode, message: string, statusCode: number): SiraErrorPayload => ({
  code,
  message,
  statusCode,
});

export const unauthorizedError = (code: ErrorCode, message: string): HttpException =>
  new UnauthorizedException(build(code, message, 401));

export const badRequestError = (code: ErrorCode, message: string): HttpException =>
  new BadRequestException(build(code, message, 400));

export const conflictError = (code: ErrorCode, message: string): HttpException =>
  new ConflictException(build(code, message, 409));

export const notFoundError = (code: ErrorCode, message: string): HttpException =>
  new NotFoundException(build(code, message, 404));
