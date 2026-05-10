import { z } from 'zod';

import { callProvider as callAnthropicProvider } from '@shared/ai/anthropic.ts';
import { ANTHROPIC_LONG_MODEL, OPENAI_SHORT_MODEL } from '@shared/ai/config.ts';
import { callProvider as callOpenAiProvider } from '@shared/ai/openai.ts';
import type { GenerationConfig, Provider } from '@shared/ai/types.ts';
import { AiProviderError } from '@shared/ai/types.ts';
import { AuthError, requireAuth } from '@shared/auth/verify.ts';
import { ERROR_CODES, ERROR_MESSAGES } from '@shared/constants/errors.ts';
import { HTTP_STATUS } from '@shared/constants/http.ts';
import { env } from '@shared/env.ts';
import { handleCorsPreflight } from '@shared/http/cors.ts';
import { fail, ok } from '@shared/http/response.ts';
import { logger } from '@shared/logger.ts';

const aiTestInputSchema = z.object({
  provider: z.enum(['openai', 'anthropic']),
  prompt: z.string().min(1).max(4000),
});

function createDiagnosticConfig(provider: Provider): GenerationConfig {
  return {
    provider,
    model: provider === 'openai' ? OPENAI_SHORT_MODEL : ANTHROPIC_LONG_MODEL,
    systemPrompt: 'You are a diagnostic assistant. Reply plainly and briefly.',
    temperature: 0,
    maxOutputTokens: 500,
  };
}

async function parseJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

function getSafeErrorMessage(error: unknown): string {
  return error instanceof Error ? error.name : 'UnknownError';
}

Deno.serve(async (req) => {
  const corsResponse = handleCorsPreflight(req);

  if (corsResponse) {
    return corsResponse;
  }

  try {
    if (!env.AI_TEST_ENABLED) {
      return fail(
        ERROR_CODES.FEATURE_DISABLED,
        ERROR_MESSAGES.FEATURE_DISABLED,
        HTTP_STATUS.SERVICE_UNAVAILABLE,
      );
    }

    if (req.method !== 'POST') {
      return fail(
        ERROR_CODES.METHOD_NOT_ALLOWED,
        ERROR_MESSAGES.METHOD_NOT_ALLOWED,
        HTTP_STATUS.METHOD_NOT_ALLOWED,
      );
    }

    await requireAuth(req);

    const parsedInput = aiTestInputSchema.safeParse(await parseJson(req));

    if (!parsedInput.success) {
      return fail(
        ERROR_CODES.VALIDATION_FAILED,
        ERROR_MESSAGES.VALIDATION_FAILED,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
      );
    }

    const config = createDiagnosticConfig(parsedInput.data.provider);
    logger.info('ai-test requested', parsedInput.data.provider);

    const result = parsedInput.data.provider === 'openai'
      ? await callOpenAiProvider(config, parsedInput.data.prompt)
      : await callAnthropicProvider(config, parsedInput.data.prompt);

    return ok({
      provider: parsedInput.data.provider,
      model: config.model,
      content: result.content,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return fail(error.code, error.message, error.status);
    }

    if (error instanceof AiProviderError) {
      return fail(
        ERROR_CODES.AI_PROVIDER_ERROR,
        ERROR_MESSAGES.AI_PROVIDER_ERROR,
        HTTP_STATUS.SERVICE_UNAVAILABLE,
      );
    }

    logger.error('ai-test function error', getSafeErrorMessage(error));

    return fail(
      ERROR_CODES.INTERNAL,
      ERROR_MESSAGES.INTERNAL,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});
