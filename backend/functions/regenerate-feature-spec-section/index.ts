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
import { ChunkEffortSchema } from '@shared/schemas/chunks.ts';
import { CONTEXT_FILE_TYPES, ContextFileTypeSchema } from '@shared/schemas/context-files.ts';
import {
  FeatureSpecContentSchema,
  type FeatureSpecSectionKey,
  RegenerateFeatureSpecSectionInputSchema,
  RegenerateFeatureSpecSectionOutputSchema,
} from '@shared/schemas/feature-spec.ts';
import { PrdContentSchema } from '@shared/schemas/prd.ts';

const ChunkContextSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  ref: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  included_features: z.array(z.string()),
  dependencies: z.array(z.string()),
  estimated_effort: ChunkEffortSchema,
});

type ChunkContext = z.infer<typeof ChunkContextSchema>;

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

const PrdContextSchema = z.object({
  content: z.string().min(1),
  content_json: PrdContentSchema,
});

const ArchitectureContextSchema = z.object({
  content: z.string().min(1),
});

const ContextFileSchema = z.object({
  type: ContextFileTypeSchema,
  content: z.string(),
});

type ContextFile = z.infer<typeof ContextFileSchema>;

const CurrentFeatureSpecSchema = z.object({
  content_json: FeatureSpecContentSchema,
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

function formatSectionRegenerationContext(input: {
  project: ProjectContext;
  briefMarkdown: string;
  prdMarkdown: string;
  architectureMarkdown: string;
  contextFiles: ContextFile[];
  chunk: ChunkContext;
  currentSpec: z.infer<typeof FeatureSpecContentSchema>;
  sectionKey: FeatureSpecSectionKey;
  userInstruction: string | undefined;
}): string {
  const projectLines = [
    `Project name: ${input.project.name}`,
    input.project.description ? `Project description: ${input.project.description}` : null,
    input.project.project_type ? `Project type: ${input.project.project_type}` : null,
    input.project.preferred_stack ? `Preferred stack: ${input.project.preferred_stack}` : null,
    input.project.preferred_agent ? `Preferred AI tool: ${input.project.preferred_agent}` : null,
  ].filter((line): line is string => Boolean(line));

  const contextFileSections = input.contextFiles
    .map((doc) => [`--- ${doc.type.toUpperCase()} ---`, doc.content].join('\n'))
    .join('\n\n');

  return [
    'Project context:',
    projectLines.join('\n'),
    '--- PROJECT BRIEF ---',
    input.briefMarkdown || '(brief content unavailable)',
    '--- PRD ---',
    input.prdMarkdown,
    '--- ARCHITECTURE ---',
    input.architectureMarkdown,
    '--- CONTEXT FILES ---',
    contextFileSections,
    '--- TARGET CHUNK ---',
    [
      `ref: ${input.chunk.ref}`,
      `title: ${input.chunk.title}`,
      `description: ${input.chunk.description}`,
      `estimated_effort: ${input.chunk.estimated_effort}`,
      `included_features: ${input.chunk.included_features.join(', ') || '(none)'}`,
      `dependencies: ${input.chunk.dependencies.join(', ') || '(none)'}`,
    ].join('\n'),
    '--- CURRENT FEATURE SPEC CONTENT_JSON ---',
    JSON.stringify(input.currentSpec, null, 2),
    'Requested section key:',
    input.sectionKey,
    input.userInstruction ? 'Optional user instruction:' : null,
    input.userInstruction ?? null,
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
    const parsedInput = RegenerateFeatureSpecSectionInputSchema.safeParse(
      await parseJson(req),
    );

    if (!parsedInput.success) {
      return fail(
        ERROR_CODES.VALIDATION_FAILED,
        ERROR_MESSAGES.VALIDATION_FAILED,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
      );
    }

    const { chunkId, sectionKey, userInstruction } = parsedInput.data;
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

    const [chunkResult, specResult] = await Promise.all([
      supabase
        .from('feature_chunks')
        .select(
          'id, project_id, ref, title, description, included_features, dependencies, estimated_effort',
        )
        .eq('id', chunkId)
        .maybeSingle(),
      supabase
        .from('feature_specs')
        .select('content_json')
        .eq('chunk_id', chunkId)
        .maybeSingle(),
    ]);

    if (chunkResult.error || specResult.error) {
      logger.error('feature_spec_section_base_lookup_failed', {
        chunkCode: chunkResult.error?.code,
        specCode: specResult.error?.code,
      });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    if (!chunkResult.data || !specResult.data) {
      return fail(
        ERROR_CODES.NOT_FOUND,
        ERROR_MESSAGES.NOT_FOUND,
        HTTP_STATUS.NOT_FOUND,
      );
    }

    const parsedChunk = ChunkContextSchema.safeParse(chunkResult.data);
    const parsedCurrentSpec = CurrentFeatureSpecSchema.safeParse(
      specResult.data,
    );

    if (!parsedChunk.success || !parsedCurrentSpec.success) {
      logger.error('feature_spec_section_base_invalid_shape', {
        chunkId,
        chunkIssues: parsedChunk.success ? undefined : parsedChunk.error.issues,
        specIssues: parsedCurrentSpec.success ? undefined : parsedCurrentSpec.error.issues,
      });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    const projectId = parsedChunk.data.project_id;
    const [
      projectResult,
      briefResult,
      prdResult,
      architectureResult,
      contextFilesResult,
    ] = await Promise.all([
      supabase
        .from('projects')
        .select(
          'id, name, description, project_type, preferred_stack, preferred_agent',
        )
        .eq('id', projectId)
        .eq('user_id', userId)
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
        .select('type, content')
        .eq('project_id', projectId)
        .in('type', [...CONTEXT_FILE_TYPES]),
    ]);

    if (projectResult.error) {
      logger.error('feature_spec_section_project_lookup_failed', {
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

    if (
      briefResult.error ||
      prdResult.error ||
      architectureResult.error ||
      contextFilesResult.error
    ) {
      logger.error('feature_spec_section_dependency_lookup_failed', {
        briefCode: briefResult.error?.code,
        prdCode: prdResult.error?.code,
        architectureCode: architectureResult.error?.code,
        contextCode: contextFilesResult.error?.code,
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

    const parsedProject = ProjectContextSchema.safeParse(projectResult.data);
    const parsedBrief = briefResult.data ? MarkdownContextSchema.safeParse(briefResult.data) : null;
    const parsedPrd = PrdContextSchema.safeParse(prdResult.data);
    const parsedArchitecture = ArchitectureContextSchema.safeParse(
      architectureResult.data,
    );
    const parsedContextFiles = z.array(ContextFileSchema).safeParse(
      contextFilesResult.data ?? [],
    );

    if (
      !parsedProject.success ||
      (parsedBrief && !parsedBrief.success) ||
      !parsedPrd.success ||
      !parsedArchitecture.success ||
      !parsedContextFiles.success
    ) {
      logger.error('feature_spec_section_dependency_invalid_shape', {
        projectId,
        projectIssues: parsedProject.success ? undefined : parsedProject.error.issues,
        briefIssues: parsedBrief && !parsedBrief.success ? parsedBrief.error.issues : undefined,
        prdIssues: parsedPrd.success ? undefined : parsedPrd.error.issues,
        architectureIssues: parsedArchitecture.success
          ? undefined
          : parsedArchitecture.error.issues,
        contextIssues: parsedContextFiles.success ? undefined : parsedContextFiles.error.issues,
      });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    const result = await generate(
      'feature_spec_section_regeneration',
      formatSectionRegenerationContext({
        project: parsedProject.data,
        briefMarkdown: parsedBrief?.data.content ?? '',
        prdMarkdown: parsedPrd.data.content,
        architectureMarkdown: parsedArchitecture.data.content,
        contextFiles: parsedContextFiles.data,
        chunk: parsedChunk.data,
        currentSpec: parsedCurrentSpec.data.content_json,
        sectionKey,
        userInstruction,
      }),
      RegenerateFeatureSpecSectionOutputSchema,
    );

    if (result.data.sectionKey !== sectionKey) {
      logger.error('ai_feature_spec_section_mismatch', {
        requested: sectionKey,
        returned: result.data.sectionKey,
      });

      return fail(
        ERROR_CODES.AI_INVALID_OUTPUT,
        ERROR_MESSAGES.AI_INVALID_OUTPUT,
        HTTP_STATUS.BAD_GATEWAY,
      );
    }

    // TODO(chunk-27): write generation metadata to generation_logs.
    logger.info('feature_spec_section_regenerated', {
      userId,
      projectId,
      chunkId,
      sectionKey,
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
        type: 'feature_spec_section_regeneration',
      });

      return fail(
        ERROR_CODES.AI_INVALID_OUTPUT,
        ERROR_MESSAGES.AI_INVALID_OUTPUT,
        HTTP_STATUS.BAD_GATEWAY,
      );
    }

    if (error instanceof AiProviderError) {
      logger.error('ai_provider_error', {
        type: 'feature_spec_section_regeneration',
        status: error.status,
      });

      return fail(
        ERROR_CODES.AI_PROVIDER_ERROR,
        ERROR_MESSAGES.AI_PROVIDER_ERROR,
        HTTP_STATUS.BAD_GATEWAY,
      );
    }

    logger.error('unhandled_error', {
      route: 'regenerate-feature-spec-section',
      message: getSafeErrorMessage(error),
    });

    return fail(
      ERROR_CODES.INTERNAL,
      ERROR_MESSAGES.INTERNAL,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});
