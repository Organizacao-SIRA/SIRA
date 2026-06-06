import { Logger } from '@nestjs/common';

interface MaybeHttpError {
  response?: { status?: number };
}

/**
 * Executa `fn` com retry exponencial apenas em HTTP 429 (rate limit).
 * Extraído dos clients externos de materiais. Tipado (sem `any`).
 */
export async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  logger?: Logger,
  retries = 2,
  delayMs = 1000,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const status = (error as MaybeHttpError)?.response?.status;
    if (status === 429 && retries > 0) {
      logger?.warn(`Rate limit atingido — aguardando ${delayMs}ms e tentando novamente (${retries} tentativas restantes)`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return fetchWithRetry(fn, logger, retries - 1, delayMs * 2);
    }
    throw error;
  }
}
