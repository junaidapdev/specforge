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
  ContextFilesModelOutputSchema,
  GenerateContextFilesInputSchema,
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

const ApprovedArchitectureContextSchema = z.object({
  content: z.string().min(1),
  is_final: z.literal(true),
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

function formatContextFilesContext(
  project: ProjectContext,
  briefMarkdown: string,
  prdMarkdown: string,
  architectureMarkdown: string,
): string {
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
    briefMarkdown || '(brief content unavailable)',
    '--- APPROVED PRD ---',
    prdMarkdown || '(PRD content unavailable)',
    '--- APPROVED ARCHITECTURE ---',
    architectureMarkdown,
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
    const parsedInput = GenerateContextFilesInputSchema.safeParse(await parseJson(req));

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

    const [projectResult, briefResult, prdResult, architectureResult] = await Promise.all([
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
        .select('content, is_final')
        .eq('project_id', projectId)
        .eq('type', 'architecture')
        .maybeSingle(),
    ]);

    if (projectResult.error) {
      logger.error('context_files_project_lookup_failed', {
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
      logger.error('context_files_project_invalid_shape', {
        projectId,
        issues: parsedProject.error.issues,
      });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    if (briefResult.error || prdResult.error || architectureResult.error) {
      logger.error('context_files_dependency_lookup_failed', {
        briefCode: briefResult.error?.code,
        prdCode: prdResult.error?.code,
        architectureCode: architectureResult.error?.code,
      });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    if (!architectureResult.data || architectureResult.data.is_final !== true) {
      return fail(
        ERROR_CODES.ARCHITECTURE_NOT_APPROVED,
        ERROR_MESSAGES.ARCHITECTURE_NOT_APPROVED,
        HTTP_STATUS.PRECONDITION_FAILED,
      );
    }

    const parsedArchitecture = ApprovedArchitectureContextSchema.safeParse(
      architectureResult.data,
    );

    if (!parsedArchitecture.success) {
      logger.error('context_files_architecture_invalid_shape', {
        projectId,
        issues: parsedArchitecture.error.issues,
      });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    const parsedBrief = briefResult.data ? MarkdownContextSchema.safeParse(briefResult.data) : null;
    const parsedPrd = prdResult.data ? MarkdownContextSchema.safeParse(prdResult.data) : null;

    if ((parsedBrief && !parsedBrief.success) || (parsedPrd && !parsedPrd.success)) {
      logger.error('context_files_dependency_invalid_shape', {
        projectId,
        briefIssues: parsedBrief && !parsedBrief.success ? parsedBrief.error.issues : undefined,
        prdIssues: parsedPrd && !parsedPrd.success ? parsedPrd.error.issues : undefined,
      });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    const result = await generate(
      'context_files_generation',
      formatContextFilesContext(
        parsedProject.data,
        parsedBrief?.data.content ?? '',
        parsedPrd?.data.content ?? '',
        parsedArchitecture.data.content,
      ),
      ContextFilesModelOutputSchema,
    );

    const { error: upsertError } = await supabase.rpc('upsert_context_files', {
      p_project_id: projectId,
      p_project_overview: result.data.project_overview,
      p_code_standards: result.data.code_standards,
      p_ai_workflow_rules: result.data.ai_workflow_rules,
      p_ui_context: result.data.ui_context,
      p_agents_md: result.data.agents_md,
      p_claude_md: result.data.claude_md,
      p_progress_tracker: result.data.progress_tracker,
    });

    if (upsertError) {
      logger.error('context_files_upsert_failed', { code: upsertError.code });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    // TODO(chunk-27): write generation metadata to generation_logs.
    logger.info('context_files_generated', {
      userId,
      projectId,
      provider: result.meta.provider,
      model: result.meta.model,
      inputTokens: result.meta.inputTokens,
      outputTokens: result.meta.outputTokens,
      latencyMs: result.meta.latencyMs,
      lengths: {
        project_overview: result.data.project_overview.length,
        code_standards: result.data.code_standards.length,
        ai_workflow_rules: result.data.ai_workflow_rules.length,
        ui_context: result.data.ui_context.length,
        agents_md: result.data.agents_md.length,
        claude_md: result.data.claude_md.length,
        progress_tracker: result.data.progress_tracker.length,
      },
    });

    return ok({ generated: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return fail(error.code, error.message, error.status);
    }

    if (error instanceof AiInvalidOutputError) {
      logger.error('ai_invalid_output', { type: 'context_files_generation' });

      return fail(
        ERROR_CODES.AI_INVALID_OUTPUT,
        ERROR_MESSAGES.AI_INVALID_OUTPUT,
        HTTP_STATUS.BAD_GATEWAY,
      );
    }

    if (error instanceof AiProviderError) {
      logger.error('ai_provider_error', {
        type: 'context_files_generation',
        status: error.status,
      });

      return fail(
        ERROR_CODES.AI_PROVIDER_ERROR,
        ERROR_MESSAGES.AI_PROVIDER_ERROR,
        HTTP_STATUS.BAD_GATEWAY,
      );
    }

    logger.error('unhandled_error', {
      route: 'generate-context-files',
      message: getSafeErrorMessage(error),
    });

    return fail(
      ERROR_CODES.INTERNAL,
      ERROR_MESSAGES.INTERNAL,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});
