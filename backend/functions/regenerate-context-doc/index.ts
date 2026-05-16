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
  CONTEXT_FILE_TYPES,
  ContextFileTypeSchema,
  RegenerateContextDocInputSchema,
  RegenerateContextDocOutputSchema,
} from '@shared/schemas/context-files.ts';

const ProjectContextSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().nullable(),
  project_type: z.string().nullable(),
  preferred_stack: z.string().nullable(),
  preferred_agent: z.string().nullable(),
});

type ProjectContext = z.infer<typeof ProjectContextSchema>;

const MarkdownContextSchema = z.object({
  content: z.string().nullable(),
});

const ContextDocumentRowSchema = z.object({
  type: ContextFileTypeSchema,
  content: z.string(),
});

type ContextDocumentRow = z.infer<typeof ContextDocumentRowSchema>;

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

function formatRegenerationContext(
  project: ProjectContext,
  briefMarkdown: string,
  prdMarkdown: string,
  architectureMarkdown: string,
  contextFiles: ContextDocumentRow[],
  targetType: z.infer<typeof ContextFileTypeSchema>,
  userInstruction: string | undefined,
): string {
  const projectLines = [
    `Project name: ${project.name}`,
    project.description ? `Project description: ${project.description}` : null,
    project.project_type ? `Project type: ${project.project_type}` : null,
    project.preferred_stack ? `Preferred stack: ${project.preferred_stack}` : null,
    project.preferred_agent ? `Preferred AI tool: ${project.preferred_agent}` : null,
  ].filter((line): line is string => Boolean(line));

  const serializedContextFiles = contextFiles
    .map((doc) => [`--- ${doc.type.toUpperCase()} ---`, doc.content].join('\n'))
    .join('\n\n');

  return [
    'Project context:',
    projectLines.join('\n'),
    '--- APPROVED PROJECT BRIEF ---',
    briefMarkdown || '(brief content unavailable)',
    '--- APPROVED PRD ---',
    prdMarkdown || '(PRD content unavailable)',
    '--- APPROVED ARCHITECTURE ---',
    architectureMarkdown || '(architecture content unavailable)',
    '--- CURRENT CONTEXT FILES ---',
    serializedContextFiles,
    'Requested document type:',
    targetType,
    userInstruction ? 'Optional user instruction:' : null,
    userInstruction ?? null,
  ].filter((value): value is string => Boolean(value)).join('\n\n');
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
    const parsedInput = RegenerateContextDocInputSchema.safeParse(await parseJson(req));

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

    const [projectResult, briefResult, prdResult, architectureResult, contextResult] = await Promise
      .all([
        supabase
          .from('projects')
          .select('id, name, description, project_type, preferred_stack, preferred_agent')
          .eq('id', projectId)
          .maybeSingle(),
        supabase
          .from('project_documents')
          .select('content')
          .eq('project_id', projectId)
          .eq('type', 'project_brief')
          .maybeSingle(),
        supabase
          .from('project_documents')
          .select('content')
          .eq('project_id', projectId)
          .eq('type', 'prd')
          .maybeSingle(),
        supabase
          .from('project_documents')
          .select('content')
          .eq('project_id', projectId)
          .eq('type', 'architecture')
          .maybeSingle(),
        supabase
          .from('project_documents')
          .select('type, content')
          .eq('project_id', projectId)
          .in('type', [...CONTEXT_FILE_TYPES]),
      ]);

    if (projectResult.error) {
      logger.error('context_doc_project_lookup_failed', {
        code: projectResult.error.code,
      });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    if (!projectResult.data) {
      return fail(ERROR_CODES.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const parsedProject = ProjectContextSchema.safeParse(projectResult.data);

    if (!parsedProject.success) {
      logger.error('context_doc_project_invalid_shape', {
        projectId,
        issues: parsedProject.error.issues,
      });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    if (
      briefResult.error ||
      prdResult.error ||
      architectureResult.error ||
      contextResult.error
    ) {
      logger.error('context_doc_dependency_lookup_failed', {
        briefCode: briefResult.error?.code,
        prdCode: prdResult.error?.code,
        architectureCode: architectureResult.error?.code,
        contextCode: contextResult.error?.code,
      });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    const parsedBrief = briefResult.data ? MarkdownContextSchema.safeParse(briefResult.data) : null;
    const parsedPrd = prdResult.data ? MarkdownContextSchema.safeParse(prdResult.data) : null;
    const parsedArchitecture = architectureResult.data
      ? MarkdownContextSchema.safeParse(architectureResult.data)
      : null;
    const parsedContextRows = z.array(ContextDocumentRowSchema).safeParse(contextResult.data ?? []);

    if (
      (parsedBrief && !parsedBrief.success) ||
      (parsedPrd && !parsedPrd.success) ||
      (parsedArchitecture && !parsedArchitecture.success) ||
      !parsedContextRows.success
    ) {
      logger.error('context_doc_dependency_invalid_shape', {
        projectId,
        briefIssues: parsedBrief && !parsedBrief.success ? parsedBrief.error.issues : undefined,
        prdIssues: parsedPrd && !parsedPrd.success ? parsedPrd.error.issues : undefined,
        architectureIssues: parsedArchitecture && !parsedArchitecture.success
          ? parsedArchitecture.error.issues
          : undefined,
        contextIssues: parsedContextRows.success ? undefined : parsedContextRows.error.issues,
      });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    const existingTarget = parsedContextRows.data.find(
      (doc) => doc.type === parsedInput.data.type,
    );

    if (!existingTarget) {
      return fail(ERROR_CODES.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const result = await generate(
      'context_doc_regenerate',
      formatRegenerationContext(
        parsedProject.data,
        parsedBrief?.data.content ?? '',
        parsedPrd?.data.content ?? '',
        parsedArchitecture?.data.content ?? '',
        parsedContextRows.data,
        parsedInput.data.type,
        parsedInput.data.userInstruction,
      ),
      RegenerateContextDocOutputSchema,
    );

    if (result.data.type !== parsedInput.data.type) {
      logger.error('ai_doc_type_mismatch', {
        requested: parsedInput.data.type,
        returned: result.data.type,
      });

      return fail(
        ERROR_CODES.AI_INVALID_OUTPUT,
        ERROR_MESSAGES.AI_INVALID_OUTPUT,
        HTTP_STATUS.BAD_GATEWAY,
      );
    }

    // TODO(chunk-27): write generation metadata to generation_logs.
    logger.info('context_doc_regenerated', {
      userId,
      projectId,
      type: parsedInput.data.type,
      provider: result.meta.provider,
      model: result.meta.model,
      inputTokens: result.meta.inputTokens,
      outputTokens: result.meta.outputTokens,
      latencyMs: result.meta.latencyMs,
    });

    return ok(result.data);
  } catch (error) {
    if (error instanceof AuthError) {
      return fail(error.code, error.message, error.status);
    }

    if (error instanceof AiInvalidOutputError) {
      logger.error('ai_invalid_output', { type: 'context_doc_regenerate' });

      return fail(
        ERROR_CODES.AI_INVALID_OUTPUT,
        ERROR_MESSAGES.AI_INVALID_OUTPUT,
        HTTP_STATUS.BAD_GATEWAY,
      );
    }

    if (error instanceof AiProviderError) {
      logger.error('ai_provider_error', {
        type: 'context_doc_regenerate',
        status: error.status,
      });

      return fail(
        ERROR_CODES.AI_PROVIDER_ERROR,
        ERROR_MESSAGES.AI_PROVIDER_ERROR,
        HTTP_STATUS.BAD_GATEWAY,
      );
    }

    logger.error('unhandled_error', {
      route: 'regenerate-context-doc',
      message: getSafeErrorMessage(error),
    });

    return fail(
      ERROR_CODES.INTERNAL,
      ERROR_MESSAGES.INTERNAL,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});
