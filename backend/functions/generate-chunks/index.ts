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
  ChunkModelOutputSchema,
  GenerateChunksInputSchema,
  type GeneratedChunk,
} from '@shared/schemas/chunks.ts';
import { CONTEXT_FILE_TYPES } from '@shared/schemas/context-files.ts';
import { PrdContentSchema } from '@shared/schemas/prd.ts';

const ProjectContextSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().nullable(),
  status: z.enum([
    'idea',
    'planning',
    'ready_to_build',
    'building',
    'paused',
    'completed',
  ]),
  preferred_stack: z.string().nullable(),
  preferred_agent: z.string().nullable(),
});

type ProjectContext = z.infer<typeof ProjectContextSchema>;

const MarkdownContextSchema = z.object({
  content: z.string().nullable(),
});

const PrdContextSchema = z.object({
  content: z.string().min(1),
  content_json: PrdContentSchema,
});

const ArchitectureContextSchema = z.object({
  content: z.string().min(1),
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

function formatChunksContext(
  project: ProjectContext,
  briefMarkdown: string,
  prdMarkdown: string,
  architectureMarkdown: string,
  features: Array<{ id: string; name: string; priority: string }>,
): string {
  const projectLines = [
    `Project name: ${project.name}`,
    project.description ? `Project description: ${project.description}` : null,
    project.preferred_stack ? `Preferred stack: ${project.preferred_stack}` : null,
    project.preferred_agent ? `Preferred AI tool: ${project.preferred_agent}` : null,
  ].filter((line): line is string => Boolean(line));

  const featureLines = features.map(
    (feature) => `- ${feature.id}: ${feature.name} (${feature.priority})`,
  );

  return [
    'Project context:',
    projectLines.join('\n'),
    '--- PROJECT BRIEF ---',
    briefMarkdown || '(brief content unavailable)',
    '--- PRD FEATURES (use these exact ids in included_features) ---',
    featureLines.join('\n'),
    '--- PRD ---',
    prdMarkdown,
    '--- ARCHITECTURE ---',
    architectureMarkdown,
    '--- CONTEXT FILES AVAILABLE ---',
    CONTEXT_FILE_TYPES.join(', '),
  ].join('\n\n');
}

function getEffortCounts(chunks: GeneratedChunk[]) {
  return chunks.reduce(
    (counts, chunk) => {
      counts[chunk.estimated_effort] += 1;
      return counts;
    },
    { xs: 0, s: 0, m: 0, l: 0, xl: 0 },
  );
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
    const parsedInput = GenerateChunksInputSchema.safeParse(
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

    const [
      projectResult,
      briefResult,
      prdResult,
      architectureResult,
      contextCountResult,
      existingChunksCountResult,
    ] = await Promise.all([
      supabase
        .from('projects')
        .select(
          'id, name, description, status, preferred_stack, preferred_agent',
        )
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
        .select('content, content_json')
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
        .select('id', { count: 'exact', head: true })
        .eq('project_id', projectId)
        .in('type', [...CONTEXT_FILE_TYPES]),
      supabase
        .from('feature_chunks')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', projectId),
    ]);

    if (projectResult.error) {
      logger.error('chunks_project_lookup_failed', {
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
      logger.error('chunks_project_invalid_shape', {
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
      contextCountResult.error ||
      existingChunksCountResult.error
    ) {
      logger.error('chunks_dependency_lookup_failed', {
        briefCode: briefResult.error?.code,
        prdCode: prdResult.error?.code,
        architectureCode: architectureResult.error?.code,
        contextCode: contextCountResult.error?.code,
        chunksCode: existingChunksCountResult.error?.code,
      });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    if (!prdResult.data) {
      return fail(
        ERROR_CODES.PRD_NOT_FOUND,
        ERROR_MESSAGES.PRD_NOT_FOUND,
        HTTP_STATUS.PRECONDITION_FAILED,
      );
    }

    if (!architectureResult.data) {
      return fail(
        ERROR_CODES.ARCHITECTURE_NOT_FOUND,
        ERROR_MESSAGES.ARCHITECTURE_NOT_FOUND,
        HTTP_STATUS.PRECONDITION_FAILED,
      );
    }

    if ((contextCountResult.count ?? 0) < CONTEXT_FILE_TYPES.length) {
      return fail(
        ERROR_CODES.CONTEXT_FILES_MISSING,
        ERROR_MESSAGES.CONTEXT_FILES_MISSING,
        HTTP_STATUS.PRECONDITION_FAILED,
      );
    }

    const parsedBrief = briefResult.data ? MarkdownContextSchema.safeParse(briefResult.data) : null;
    const parsedPrd = PrdContextSchema.safeParse(prdResult.data);
    const parsedArchitecture = ArchitectureContextSchema.safeParse(
      architectureResult.data,
    );

    if (
      (parsedBrief && !parsedBrief.success) ||
      !parsedPrd.success ||
      !parsedArchitecture.success
    ) {
      logger.error('chunks_dependency_invalid_shape', {
        projectId,
        briefIssues: parsedBrief && !parsedBrief.success ? parsedBrief.error.issues : undefined,
        prdIssues: !parsedPrd.success ? parsedPrd.error.issues : undefined,
        architectureIssues: !parsedArchitecture.success
          ? parsedArchitecture.error.issues
          : undefined,
      });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    const prdFeatures = parsedPrd.data.content_json.features.map((feature) => ({
      id: feature.id,
      name: feature.name,
      priority: feature.priority,
    }));

    const result = await generate(
      'chunk_generation',
      formatChunksContext(
        parsedProject.data,
        parsedBrief?.data.content ?? '',
        parsedPrd.data.content,
        parsedArchitecture.data.content,
        prdFeatures,
      ),
      ChunkModelOutputSchema,
    );

    const refs = result.data.chunks.map((chunk) => chunk.ref);
    const refsSet = new Set(refs);

    if (refsSet.size !== refs.length) {
      logger.error('chunks_duplicate_refs', {
        count: refs.length,
        uniqueCount: refsSet.size,
      });

      return fail(
        ERROR_CODES.AI_INVALID_OUTPUT,
        ERROR_MESSAGES.AI_INVALID_OUTPUT,
        HTTP_STATUS.BAD_GATEWAY,
      );
    }

    for (const chunk of result.data.chunks) {
      for (const dependency of chunk.dependencies) {
        if (!refsSet.has(dependency)) {
          logger.error('chunks_unresolved_dependency', { dependency });

          return fail(
            ERROR_CODES.AI_INVALID_OUTPUT,
            ERROR_MESSAGES.AI_INVALID_OUTPUT,
            HTTP_STATUS.BAD_GATEWAY,
          );
        }
      }
    }

    const featureIds = new Set(prdFeatures.map((feature) => feature.id));
    const chunks = result.data.chunks.map((chunk) => {
      const includedFeatures = chunk.included_features.filter((id) => featureIds.has(id));
      const droppedCount = chunk.included_features.length -
        includedFeatures.length;

      if (droppedCount > 0) {
        logger.warn('chunks_dropped_unresolvable_features', { droppedCount });
      }

      return {
        ...chunk,
        included_features: includedFeatures,
      };
    });

    const { error: replaceError } = await supabase.rpc(
      'replace_project_chunks',
      {
        p_project_id: projectId,
        p_chunks: chunks,
      },
    );

    if (replaceError) {
      logger.error('chunks_replace_failed', { code: replaceError.code });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    const statusAdvanced = (existingChunksCountResult.count ?? 0) === 0 &&
      parsedProject.data.status === 'planning';

    // TODO(chunk-27): write generation metadata to generation_logs.
    logger.info('chunks_generated', {
      userId,
      projectId,
      provider: result.meta.provider,
      model: result.meta.model,
      inputTokens: result.meta.inputTokens,
      outputTokens: result.meta.outputTokens,
      latencyMs: result.meta.latencyMs,
      count: chunks.length,
      statusAdvanced,
      effortCounts: getEffortCounts(chunks),
    });

    return ok({
      generated: true,
      count: chunks.length,
      statusAdvanced,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return fail(error.code, error.message, error.status);
    }

    if (error instanceof AiInvalidOutputError) {
      logger.error('ai_invalid_output', { type: 'chunk_generation' });

      return fail(
        ERROR_CODES.AI_INVALID_OUTPUT,
        ERROR_MESSAGES.AI_INVALID_OUTPUT,
        HTTP_STATUS.BAD_GATEWAY,
      );
    }

    if (error instanceof AiProviderError) {
      logger.error('ai_provider_error', {
        type: 'chunk_generation',
        status: error.status,
      });

      return fail(
        ERROR_CODES.AI_PROVIDER_ERROR,
        ERROR_MESSAGES.AI_PROVIDER_ERROR,
        HTTP_STATUS.BAD_GATEWAY,
      );
    }

    logger.error('unhandled_error', {
      route: 'generate-chunks',
      message: getSafeErrorMessage(error),
    });

    return fail(
      ERROR_CODES.INTERNAL,
      ERROR_MESSAGES.INTERNAL,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});
