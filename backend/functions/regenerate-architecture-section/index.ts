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
  ArchitectureContentSchema,
  type ArchitectureDecision,
  ArchitectureDecisionSchema,
  type ArchitectureSectionKey,
  RegenerateArchitectureSectionInputSchema,
  RegenerateArchitectureSectionOutputSchema,
} from '@shared/schemas/architecture.ts';

const ProjectContextSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().nullable(),
  preferred_stack: z.string().nullable(),
  preferred_agent: z.string().nullable(),
});

type ProjectContext = z.infer<typeof ProjectContextSchema>;

const MarkdownContextSchema = z.object({
  content: z.string().nullable(),
});

const ApprovedPrdContextSchema = z.object({
  content: z.string().min(1),
  is_final: z.literal(true),
});

const CurrentArchitectureSchema = z.object({
  content_json: ArchitectureContentSchema,
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

function formatBaseContext(
  project: ProjectContext,
  briefMarkdown: string,
  prdMarkdown: string,
  currentArchitecture: z.infer<typeof ArchitectureContentSchema>,
): string[] {
  const projectLines = [
    `Project name: ${project.name}`,
    project.description ? `Project description: ${project.description}` : null,
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
    '--- CURRENT ARCHITECTURE CONTENT_JSON ---',
    JSON.stringify(currentArchitecture, null, 2),
  ];
}

function formatSectionRegenContext(
  project: ProjectContext,
  briefMarkdown: string,
  prdMarkdown: string,
  currentArchitecture: z.infer<typeof ArchitectureContentSchema>,
  sectionKey: ArchitectureSectionKey,
): string {
  return [
    ...formatBaseContext(
      project,
      briefMarkdown,
      prdMarkdown,
      currentArchitecture,
    ),
    'Requested mode:',
    'full_section',
    'Requested section key:',
    sectionKey,
  ].join('\n\n');
}

function formatDecisionRegenContext(
  project: ProjectContext,
  briefMarkdown: string,
  prdMarkdown: string,
  currentArchitecture: z.infer<typeof ArchitectureContentSchema>,
  decision: ArchitectureDecision,
): string {
  return [
    ...formatBaseContext(
      project,
      briefMarkdown,
      prdMarkdown,
      currentArchitecture,
    ),
    'Requested mode:',
    'single_decision',
    'Requested decision id:',
    decision.id,
    '--- CURRENT DECISION ---',
    JSON.stringify(decision, null, 2),
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
    const parsedInput = RegenerateArchitectureSectionInputSchema.safeParse(
      await parseJson(req),
    );

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
        .select('id, name, description, preferred_stack, preferred_agent')
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
        .select('content, is_final')
        .eq('project_id', projectId)
        .eq('type', 'prd')
        .eq('is_final', true)
        .maybeSingle(),
      supabase
        .from('project_documents')
        .select('content_json')
        .eq('project_id', projectId)
        .eq('type', 'architecture')
        .maybeSingle(),
    ]);

    if (projectResult.error) {
      logger.error('architecture_section_project_lookup_failed', {
        code: projectResult.error.code,
      });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    if (!projectResult.data) {
      return fail(
        ERROR_CODES.NOT_FOUND,
        ERROR_MESSAGES.NOT_FOUND,
        HTTP_STATUS.NOT_FOUND,
      );
    }

    const parsedProject = ProjectContextSchema.safeParse(projectResult.data);

    if (!parsedProject.success) {
      logger.error('architecture_section_project_invalid_shape', {
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
      logger.error('architecture_section_brief_lookup_failed', {
        code: briefResult.error.code,
      });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    if (prdResult.error) {
      logger.error('architecture_section_prd_lookup_failed', {
        code: prdResult.error.code,
      });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    if (!prdResult.data) {
      return fail(
        ERROR_CODES.PRD_NOT_APPROVED,
        ERROR_MESSAGES.PRD_NOT_APPROVED,
        HTTP_STATUS.PRECONDITION_FAILED,
      );
    }

    if (architectureResult.error) {
      logger.error('architecture_section_architecture_lookup_failed', {
        code: architectureResult.error.code,
      });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    if (!architectureResult.data) {
      return fail(
        ERROR_CODES.NOT_FOUND,
        ERROR_MESSAGES.NOT_FOUND,
        HTTP_STATUS.NOT_FOUND,
      );
    }

    const parsedBrief = briefResult.data ? MarkdownContextSchema.safeParse(briefResult.data) : null;
    const parsedPrd = ApprovedPrdContextSchema.safeParse(prdResult.data);
    const parsedArchitecture = CurrentArchitectureSchema.safeParse(
      architectureResult.data,
    );

    if (parsedBrief && !parsedBrief.success) {
      logger.error('architecture_section_brief_invalid_shape', {
        projectId,
        issues: parsedBrief.error.issues,
      });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    if (!parsedPrd.success) {
      logger.error('architecture_section_prd_invalid_shape', {
        projectId,
        issues: parsedPrd.error.issues,
      });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    if (!parsedArchitecture.success) {
      logger.error('architecture_section_architecture_invalid_shape', {
        projectId,
        issues: parsedArchitecture.error.issues,
      });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    const input = parsedInput.data;
    let userMessage: string;

    if (input.mode === 'full_section') {
      userMessage = formatSectionRegenContext(
        parsedProject.data,
        parsedBrief?.data.content ?? '',
        parsedPrd.data.content,
        parsedArchitecture.data.content_json,
        input.sectionKey,
      );
    } else {
      const existingDecision = parsedArchitecture.data.content_json.decisions
        .find(
          (decision) => decision.id === input.decisionId,
        );

      if (!existingDecision) {
        return fail(
          ERROR_CODES.NOT_FOUND,
          ERROR_MESSAGES.NOT_FOUND,
          HTTP_STATUS.NOT_FOUND,
        );
      }

      const parsedDecision = ArchitectureDecisionSchema.safeParse(
        existingDecision,
      );

      if (!parsedDecision.success) {
        logger.error('architecture_section_decision_invalid_shape', {
          projectId,
          decisionId: input.decisionId,
          issues: parsedDecision.error.issues,
        });

        return fail(
          ERROR_CODES.INTERNAL,
          ERROR_MESSAGES.INTERNAL,
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
        );
      }

      userMessage = formatDecisionRegenContext(
        parsedProject.data,
        parsedBrief?.data.content ?? '',
        parsedPrd.data.content,
        parsedArchitecture.data.content_json,
        parsedDecision.data,
      );
    }

    const result = await generate(
      'architecture_section_regeneration',
      userMessage,
      RegenerateArchitectureSectionOutputSchema,
    );

    if (result.data.mode !== parsedInput.data.mode) {
      logger.error('ai_mode_mismatch', {
        requested: parsedInput.data.mode,
        returned: result.data.mode,
      });

      return fail(
        ERROR_CODES.AI_INVALID_OUTPUT,
        ERROR_MESSAGES.AI_INVALID_OUTPUT,
        HTTP_STATUS.BAD_GATEWAY,
      );
    }

    if (
      parsedInput.data.mode === 'full_section' &&
      (result.data.mode !== 'full_section' ||
        result.data.sectionKey !== parsedInput.data.sectionKey)
    ) {
      logger.error('ai_section_mismatch', {
        requested: parsedInput.data.sectionKey,
        returned: result.data.mode === 'full_section' ? result.data.sectionKey : null,
      });

      return fail(
        ERROR_CODES.AI_INVALID_OUTPUT,
        ERROR_MESSAGES.AI_INVALID_OUTPUT,
        HTTP_STATUS.BAD_GATEWAY,
      );
    }

    if (
      parsedInput.data.mode === 'single_decision' &&
      (result.data.mode !== 'single_decision' ||
        result.data.decisionId !== parsedInput.data.decisionId ||
        result.data.value.id !== parsedInput.data.decisionId)
    ) {
      logger.error('ai_decision_mismatch', {
        requested: parsedInput.data.decisionId,
        returned: result.data.mode === 'single_decision' ? result.data.decisionId : null,
      });

      return fail(
        ERROR_CODES.AI_INVALID_OUTPUT,
        ERROR_MESSAGES.AI_INVALID_OUTPUT,
        HTTP_STATUS.BAD_GATEWAY,
      );
    }

    // TODO(chunk-27): write generation metadata to generation_logs.
    logger.info('architecture_section_regenerated', {
      userId,
      projectId,
      mode: parsedInput.data.mode,
      sectionKey: parsedInput.data.mode === 'full_section'
        ? parsedInput.data.sectionKey
        : 'decisions',
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
      logger.error('ai_invalid_output', {
        type: 'architecture_section_regeneration',
      });

      return fail(
        ERROR_CODES.AI_INVALID_OUTPUT,
        ERROR_MESSAGES.AI_INVALID_OUTPUT,
        HTTP_STATUS.BAD_GATEWAY,
      );
    }

    if (error instanceof AiProviderError) {
      logger.error('ai_provider_error', {
        type: 'architecture_section_regeneration',
        status: error.status,
      });

      return fail(
        ERROR_CODES.AI_PROVIDER_ERROR,
        ERROR_MESSAGES.AI_PROVIDER_ERROR,
        HTTP_STATUS.BAD_GATEWAY,
      );
    }

    logger.error('unhandled_error', {
      route: 'regenerate-architecture-section',
      message: getSafeErrorMessage(error),
    });

    return fail(
      ERROR_CODES.INTERNAL,
      ERROR_MESSAGES.INTERNAL,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});
