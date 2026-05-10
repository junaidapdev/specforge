import { AuthError, requireAuth } from '@shared/auth/verify.ts';
import { ERROR_CODES, ERROR_MESSAGES } from '@shared/constants/errors.ts';
import { HTTP_STATUS } from '@shared/constants/http.ts';
import { handleCorsPreflight } from '@shared/http/cors.ts';
import { fail, ok } from '@shared/http/response.ts';
import { logger } from '@shared/logger.ts';

function getSafeErrorMessage(error: unknown): string {
  return error instanceof Error ? error.name : 'UnknownError';
}

Deno.serve(async (req) => {
  const corsResponse = handleCorsPreflight(req);

  if (corsResponse) {
    return corsResponse;
  }

  try {
    const url = new URL(req.url);

    if (req.method === 'GET' && url.pathname.endsWith('/health')) {
      logger.info('health check requested');

      return ok({
        status: 'ok',
        timestamp: new Date().toISOString(),
      });
    }

    if (req.method === 'POST' && url.pathname.endsWith('/health/auth')) {
      const auth = await requireAuth(req);
      logger.info('authenticated health check requested');

      return ok({
        userId: auth.userId,
        status: 'authenticated',
      });
    }

    return fail(
      ERROR_CODES.METHOD_NOT_ALLOWED,
      ERROR_MESSAGES.METHOD_NOT_ALLOWED,
      HTTP_STATUS.METHOD_NOT_ALLOWED,
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return fail(error.code, error.message, error.status);
    }

    logger.error('health function error', getSafeErrorMessage(error));

    return fail(
      ERROR_CODES.INTERNAL,
      ERROR_MESSAGES.INTERNAL,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});
