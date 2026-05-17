import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

import { AuthError, requireAuth } from '@shared/auth/verify.ts';
import { ERROR_CODES, ERROR_MESSAGES } from '@shared/constants/errors.ts';
import { HTTP_STATUS } from '@shared/constants/http.ts';
import { env } from '@shared/env.ts';
import { handleCorsPreflight } from '@shared/http/cors.ts';
import { fail, ok } from '@shared/http/response.ts';
import { logger } from '@shared/logger.ts';
import { renderFeatureSpecMarkdown } from '@shared/markdown/feature-spec-markdown.ts';
import { SaveFeatureSpecContentInputSchema } from '@shared/schemas/feature-spec.ts';

const ChunkTitleSchema = z.object({
  title: z.string().min(1),
});

const SaveFeatureSpecContentResultSchema = z.object({
  id: z.string().uuid(),
  version: z.number().int().min(1),
  is_final: z.boolean(),
  updated_at: z.string(),
});

async function parseJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

function getSafeErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown';
}

Deno.serve(async (req) => {
  const corsResponse = handleCorsPreflight(req);

  if (corsResponse) {
    return corsResponse;
  }

  if (req.method !== 'POST') {
    return fail(
      ERROR_CODES.METHOD_NOT_ALLOWED,
      ERROR_MESSAGES.METHOD_NOT_ALLOWED,
      HTTP_STATUS.METHOD_NOT_ALLOWED,
    );
  }

  try {
    const { jwt, userId } = await requireAuth(req);
    const parsedInput = SaveFeatureSpecContentInputSchema.safeParse(await parseJson(req));

    if (!parsedInput.success) {
      return fail(
        ERROR_CODES.VALIDATION_FAILED,
        ERROR_MESSAGES.VALIDATION_FAILED,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
      );
    }

    const { chunkId, contentJson } = parsedInput.data;
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      },
    });

    const { data: chunkData, error: chunkError } = await supabase
      .from('feature_chunks')
      .select('title')
      .eq('id', chunkId)
      .maybeSingle();

    if (chunkError) {
      logger.error('feature_spec_save_chunk_lookup_failed', { code: chunkError.code });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    if (!chunkData) {
      return fail(ERROR_CODES.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const parsedChunk = ChunkTitleSchema.safeParse(chunkData);

    if (!parsedChunk.success) {
      logger.error('feature_spec_save_chunk_invalid_shape', {
        chunkId,
        issues: parsedChunk.error.issues,
      });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    const renderedMarkdown = renderFeatureSpecMarkdown(contentJson, parsedChunk.data.title);
    const { data: updateMeta, error: rpcError } = await supabase.rpc(
      'update_feature_spec_content',
      {
        p_chunk_id: chunkId,
        p_content_json: contentJson,
        p_content_markdown: renderedMarkdown,
      },
    );

    if (rpcError || !updateMeta) {
      logger.error('feature_spec_save_failed', { code: rpcError?.code });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    const parsedMeta = SaveFeatureSpecContentResultSchema.safeParse(updateMeta);

    if (!parsedMeta.success) {
      logger.error('feature_spec_save_meta_invalid_shape', {
        issues: parsedMeta.error.issues,
      });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    // TODO(chunk-27): add safe document-edit telemetry if generation_logs expands
    // beyond AI generation events.
    logger.info('feature_spec_content_saved', {
      userId,
      chunkId,
      version: parsedMeta.data.version,
    });

    return ok(parsedMeta.data);
  } catch (error) {
    if (error instanceof AuthError) {
      return fail(error.code, error.message, error.status);
    }

    logger.error('unhandled_error', {
      route: 'save-feature-spec-content',
      message: getSafeErrorMessage(error),
    });

    return fail(
      ERROR_CODES.INTERNAL,
      ERROR_MESSAGES.INTERNAL,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});
