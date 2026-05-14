import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

import { AiInvalidOutputError, AiProviderError, generate } from '@shared/ai/index.ts';
import { AuthError, requireAuth } from '@shared/auth/verify.ts';
import { ERROR_CODES, ERROR_MESSAGES } from '@shared/constants/errors.ts';
import { HTTP_STATUS } from '@shared/constants/http.ts';
import { env } from '@shared/env.ts';
import { handleCorsPreflight } from '@shared/http/cors.ts';
import { fail, ok } from '@shared/http/response.ts';
import { logger } from '@shared/logger.ts';
import {
  GeneratePrdInputSchema,
  PrdContentSchema,
  PrdModelOutputSchema,
} from '@shared/schemas/prd.ts';

const ProjectContextSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().nullable(),
  project_type: z.string().nullable(),
  preferred_stack: z.string().nullable(),
  preferred_agent: z.string().nullable(),
});

type ProjectContext = z.infer<typeof ProjectContextSchema>;

const ApprovedBriefSchema = z.object({
  content: z.string().min(1),
  content_json: z.unknown().nullable(),
  is_final: z.boolean(),
});

const PrdRowSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  type: z.literal('prd'),
  title: z.string(),
  content: z.string(),
  content_json: PrdContentSchema,
  version: z.number().int().min(1),
  is_final: z.boolean(),
  created_at: z.string(),
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

function formatPrdContext(project: ProjectContext, briefMarkdown: string): string {
  const projectLines = [
    `Project name: ${project.name}`,
    project.description ? `Project description: ${project.description}` : null,
    project.project_type ? `Project type: ${project.project_type}` : null,
    project.preferred_stack ? `Preferred stack: ${project.preferred_stack}` : null,
    project.preferred_agent ? `Preferred AI tool: ${project.preferred_agent}` : null,
  ].filter((line): line is string => Boolean(line));

  return [
    'Project context:',
    projectLines.join('\n'),
    '--- APPROVED PROJECT BRIEF ---',
    briefMarkdown,
  ].join('\n\n');
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
    const parsedInput = GeneratePrdInputSchema.safeParse(await parseJson(req));

    if (!parsedInput.success) {
      return fail(
        ERROR_CODES.VALIDATION_FAILED,
        ERROR_MESSAGES.VALIDATION_FAILED,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
      );
    }

    const projectId = parsedInput.data.projectId;
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

    const [projectResult, briefResult] = await Promise.all([
      supabase
        .from('projects')
        .select('id, name, description, project_type, preferred_stack, preferred_agent')
        .eq('id', projectId)
        .single(),
      supabase
        .from('project_documents')
        .select('content, content_json, is_final')
        .eq('project_id', projectId)
        .eq('type', 'project_brief')
        .maybeSingle(),
    ]);

    if (projectResult.error || !projectResult.data) {
      return fail(ERROR_CODES.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const parsedProject = ProjectContextSchema.safeParse(projectResult.data);

    if (!parsedProject.success) {
      logger.error('prd_project_invalid_shape', {
        projectId,
        issues: parsedProject.error.issues,
      });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    if (briefResult.error) {
      logger.error('prd_brief_lookup_failed', { code: briefResult.error.code });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    if (!briefResult.data || briefResult.data.is_final !== true) {
      return fail(
        ERROR_CODES.BRIEF_NOT_APPROVED,
        ERROR_MESSAGES.BRIEF_NOT_APPROVED,
        HTTP_STATUS.PRECONDITION_FAILED,
      );
    }

    const parsedBrief = ApprovedBriefSchema.safeParse(briefResult.data);

    if (!parsedBrief.success) {
      logger.error('prd_brief_invalid_shape', { projectId, issues: parsedBrief.error.issues });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    const result = await generate(
      'prd_generation',
      formatPrdContext(parsedProject.data, parsedBrief.data.content),
      PrdModelOutputSchema,
    );

    const { data: existing, error: existingError } = await supabase
      .from('project_documents')
      .select('version')
      .eq('project_id', projectId)
      .eq('type', 'prd')
      .maybeSingle();

    if (existingError) {
      logger.error('prd_existing_lookup_failed', { code: existingError.code });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    const nextVersion = (existing?.version ?? 0) + 1;
    const isRegeneration = nextVersion > 1;

    // Unique (project_id, type) makes upsert clean — no race-condition handling.
    // is_final resets to false on every regeneration; the user must re-approve.
    const { data: rowData, error: upsertError } = await supabase
      .from('project_documents')
      .upsert(
        {
          project_id: projectId,
          type: 'prd',
          title: `PRD — ${parsedProject.data.name}`,
          content: result.data.content_markdown,
          content_json: result.data.content_json,
          version: nextVersion,
          is_final: false,
        },
        { onConflict: 'project_id,type' },
      )
      .select('*')
      .single();

    if (upsertError || !rowData) {
      logger.error('prd_upsert_failed', { code: upsertError?.code });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    const parsedRow = PrdRowSchema.safeParse(rowData);

    if (!parsedRow.success) {
      logger.error('prd_row_invalid_shape', { issues: parsedRow.error.issues });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    // TODO(chunk-27): write generation metadata to generation_logs.
    logger.info('prd_generated', {
      userId,
      projectId,
      provider: result.meta.provider,
      model: result.meta.model,
      inputTokens: result.meta.inputTokens,
      outputTokens: result.meta.outputTokens,
      latencyMs: result.meta.latencyMs,
      version: parsedRow.data.version,
      isRegeneration,
      featureCount: result.data.content_json.features.length,
      storyCount: result.data.content_json.user_stories.length,
    });

    return ok(parsedRow.data);
  } catch (error) {
    if (error instanceof AuthError) {
      return fail(error.code, error.message, error.status);
    }

    if (error instanceof AiInvalidOutputError) {
      logger.error('ai_invalid_output', { type: 'prd_generation' });

      return fail(
        ERROR_CODES.AI_INVALID_OUTPUT,
        ERROR_MESSAGES.AI_INVALID_OUTPUT,
        HTTP_STATUS.BAD_GATEWAY,
      );
    }

    if (error instanceof AiProviderError) {
      logger.error('ai_provider_error', {
        type: 'prd_generation',
        status: error.status,
      });

      return fail(
        ERROR_CODES.AI_PROVIDER_ERROR,
        ERROR_MESSAGES.AI_PROVIDER_ERROR,
        HTTP_STATUS.BAD_GATEWAY,
      );
    }

    logger.error('unhandled_error', {
      route: 'generate-prd',
      message: getSafeErrorMessage(error),
    });

    return fail(
      ERROR_CODES.INTERNAL,
      ERROR_MESSAGES.INTERNAL,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});
