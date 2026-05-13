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
  GenerateProjectBriefInputSchema,
  ProjectBriefContentSchema,
  ProjectBriefModelOutputSchema,
} from '@shared/schemas/brief.ts';

const ProjectContextSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().nullable(),
  project_type: z.string().nullable(),
  preferred_stack: z.string().nullable(),
  preferred_agent: z.string().nullable(),
});

type ProjectContext = z.infer<typeof ProjectContextSchema>;

const BriefRowSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  type: z.literal('project_brief'),
  title: z.string(),
  content: z.string(),
  content_json: ProjectBriefContentSchema,
  version: z.number().int().min(1),
  is_final: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

type BriefAnswer = {
  questionId: string;
  questionText: string;
  answer: string;
};

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

function formatProjectContext(
  project: ProjectContext,
  answers: BriefAnswer[] | undefined,
): string {
  const projectLines = [
    `Project name: ${project.name}`,
    project.description ? `Description: ${project.description}` : null,
    project.project_type ? `Project type: ${project.project_type}` : null,
    project.preferred_stack ? `Preferred stack: ${project.preferred_stack}` : null,
    project.preferred_agent ? `Preferred AI tool: ${project.preferred_agent}` : null,
  ].filter((line): line is string => Boolean(line));

  const sections: string[] = [
    'Project context:',
    projectLines.join('\n'),
  ];

  if (answers && answers.length > 0) {
    const answerLines = answers
      .map((entry, index) => `${index + 1}. Q: ${entry.questionText}\n   A: ${entry.answer}`)
      .join('\n');
    sections.push('Clarifying answers:', answerLines);
  } else {
    sections.push(
      'Clarifying answers: (none provided; fill in reasonable assumptions and flag them in `assumptions`)',
    );
  }

  return sections.join('\n\n');
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
    const parsedInput = GenerateProjectBriefInputSchema.safeParse(await parseJson(req));

    if (!parsedInput.success) {
      return fail(
        ERROR_CODES.VALIDATION_FAILED,
        ERROR_MESSAGES.VALIDATION_FAILED,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
      );
    }

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

    const { data: projectRow, error: projectError } = await supabase
      .from('projects')
      .select('id, name, description, project_type, preferred_stack, preferred_agent')
      .eq('id', parsedInput.data.projectId)
      .single();

    if (projectError || !projectRow) {
      return fail(ERROR_CODES.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const parsedProject = ProjectContextSchema.safeParse(projectRow);

    if (!parsedProject.success) {
      logger.error('project_brief_project_invalid_shape', {
        projectId: parsedInput.data.projectId,
        issues: parsedProject.error.issues,
      });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    const userMessage = formatProjectContext(parsedProject.data, parsedInput.data.answers);

    const result = await generate(
      'project_brief',
      userMessage,
      ProjectBriefModelOutputSchema,
    );

    // Look up any existing version so we can bump it on regeneration.
    const { data: existing, error: existingError } = await supabase
      .from('project_documents')
      .select('version')
      .eq('project_id', parsedInput.data.projectId)
      .eq('type', 'project_brief')
      .maybeSingle();

    if (existingError) {
      logger.error('project_brief_existing_lookup_failed', {
        code: existingError.code,
      });

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
          project_id: parsedInput.data.projectId,
          type: 'project_brief',
          title: `Brief — ${parsedProject.data.name}`,
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
      logger.error('project_brief_upsert_failed', {
        code: upsertError?.code,
      });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    const parsedRow = BriefRowSchema.safeParse(rowData);

    if (!parsedRow.success) {
      logger.error('project_brief_row_invalid_shape', {
        issues: parsedRow.error.issues,
      });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    // TODO(chunk-27): write generation metadata to generation_logs.
    logger.info('project_brief_generated', {
      userId,
      projectId: parsedInput.data.projectId,
      provider: result.meta.provider,
      model: result.meta.model,
      inputTokens: result.meta.inputTokens,
      outputTokens: result.meta.outputTokens,
      latencyMs: result.meta.latencyMs,
      version: parsedRow.data.version,
      isRegeneration,
    });

    return ok({ brief: parsedRow.data });
  } catch (error) {
    if (error instanceof AuthError) {
      return fail(error.code, error.message, error.status);
    }

    if (error instanceof AiInvalidOutputError) {
      logger.error('ai_invalid_output', { type: 'project_brief' });

      return fail(
        ERROR_CODES.AI_INVALID_OUTPUT,
        ERROR_MESSAGES.AI_INVALID_OUTPUT,
        HTTP_STATUS.BAD_GATEWAY,
      );
    }

    if (error instanceof AiProviderError) {
      logger.error('ai_provider_error', {
        type: 'project_brief',
        status: error.status,
        message: error.message,
      });

      return fail(
        ERROR_CODES.AI_PROVIDER_ERROR,
        ERROR_MESSAGES.AI_PROVIDER_ERROR,
        HTTP_STATUS.BAD_GATEWAY,
      );
    }

    logger.error('unhandled_error', {
      route: 'generate-project-brief',
      message: getSafeErrorMessage(error),
    });

    return fail(
      ERROR_CODES.INTERNAL,
      ERROR_MESSAGES.INTERNAL,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});
