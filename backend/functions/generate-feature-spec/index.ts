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
import { renderFeatureSpecMarkdown } from '@shared/markdown/feature-spec-markdown.ts';
import { ChunkEffortSchema } from '@shared/schemas/chunks.ts';
import { CONTEXT_FILE_TYPES, ContextFileTypeSchema } from '@shared/schemas/context-files.ts';
import {
  FeatureSpecContentSchema,
  FeatureSpecModelOutputSchema,
  GenerateFeatureSpecInputSchema,
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

const DependencyChunkSchema = z.object({
  ref: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});

type DependencyChunk = z.infer<typeof DependencyChunkSchema>;

const FeatureSpecRowSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  chunk_id: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  content_json: FeatureSpecContentSchema,
  agent_prompts: z.unknown(),
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

function formatFeatureSpecContext(input: {
  project: ProjectContext;
  briefMarkdown: string;
  prdMarkdown: string;
  architectureMarkdown: string;
  contextFiles: ContextFile[];
  chunk: ChunkContext;
  includedFeatures: Array<{ id: string; name: string }>;
  dependencyChunks: DependencyChunk[];
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

  const includedFeatureLines = input.includedFeatures.length > 0
    ? input.includedFeatures.map((feature) => `- ${feature.id}: ${feature.name}`).join('\n')
    : '(none)';
  const dependencyLines = input.dependencyChunks.length > 0
    ? input.dependencyChunks.map((chunk) => `- ${chunk.ref}: ${chunk.title}`)
      .join('\n')
    : '(none)';

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
    ].join('\n'),
    '--- INCLUDED PRD FEATURES ---',
    includedFeatureLines,
    '--- DEPENDENCY CHUNKS ---',
    dependencyLines,
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
    const parsedInput = GenerateFeatureSpecInputSchema.safeParse(
      await parseJson(req),
    );

    if (!parsedInput.success) {
      return fail(
        ERROR_CODES.VALIDATION_FAILED,
        ERROR_MESSAGES.VALIDATION_FAILED,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
      );
    }

    const chunkId = parsedInput.data.chunkId;
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
      .select(
        'id, project_id, ref, title, description, included_features, dependencies, estimated_effort',
      )
      .eq('id', chunkId)
      .maybeSingle();

    if (chunkError) {
      logger.error('feature_spec_chunk_lookup_failed', {
        code: chunkError.code,
      });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    if (!chunkData) {
      return fail(
        ERROR_CODES.NOT_FOUND,
        ERROR_MESSAGES.NOT_FOUND,
        HTTP_STATUS.NOT_FOUND,
      );
    }

    const parsedChunk = ChunkContextSchema.safeParse(chunkData);

    if (!parsedChunk.success) {
      logger.error('feature_spec_chunk_invalid_shape', {
        chunkId,
        issues: parsedChunk.error.issues,
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
      dependencyChunksResult,
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
      parsedChunk.data.dependencies.length > 0
        ? supabase
          .from('feature_chunks')
          .select('ref, title, description')
          .eq('project_id', projectId)
          .in('ref', parsedChunk.data.dependencies)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (projectResult.error) {
      logger.error('feature_spec_project_lookup_failed', {
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
      contextFilesResult.error ||
      dependencyChunksResult.error
    ) {
      logger.error('feature_spec_dependency_lookup_failed', {
        briefCode: briefResult.error?.code,
        prdCode: prdResult.error?.code,
        architectureCode: architectureResult.error?.code,
        contextCode: contextFilesResult.error?.code,
        dependencyCode: dependencyChunksResult.error?.code,
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
    const parsedDependencyChunks = z.array(DependencyChunkSchema).safeParse(
      dependencyChunksResult.data ?? [],
    );

    if (
      !parsedProject.success ||
      (parsedBrief && !parsedBrief.success) ||
      !parsedPrd.success ||
      !parsedArchitecture.success ||
      !parsedContextFiles.success ||
      !parsedDependencyChunks.success
    ) {
      logger.error('feature_spec_dependency_invalid_shape', {
        projectId,
        projectIssues: parsedProject.success ? undefined : parsedProject.error.issues,
        briefIssues: parsedBrief && !parsedBrief.success ? parsedBrief.error.issues : undefined,
        prdIssues: parsedPrd.success ? undefined : parsedPrd.error.issues,
        architectureIssues: parsedArchitecture.success
          ? undefined
          : parsedArchitecture.error.issues,
        contextIssues: parsedContextFiles.success ? undefined : parsedContextFiles.error.issues,
        dependencyIssues: parsedDependencyChunks.success
          ? undefined
          : parsedDependencyChunks.error.issues,
      });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    const featureMap = new Map(
      parsedPrd.data.content_json.features.map((
        feature,
      ) => [feature.id, feature.name]),
    );
    const includedFeatures = parsedChunk.data.included_features.map((id) => ({
      id,
      name: featureMap.get(id) ?? `(unknown id: ${id})`,
    }));

    const result = await generate(
      'feature_spec_generation',
      formatFeatureSpecContext({
        project: parsedProject.data,
        briefMarkdown: parsedBrief?.data.content ?? '',
        prdMarkdown: parsedPrd.data.content,
        architectureMarkdown: parsedArchitecture.data.content,
        contextFiles: parsedContextFiles.data,
        chunk: parsedChunk.data,
        includedFeatures,
        dependencyChunks: parsedDependencyChunks.data,
      }),
      FeatureSpecModelOutputSchema,
    );

    const renderedMarkdown = renderFeatureSpecMarkdown(
      result.data.content_json,
      parsedChunk.data.title,
    );

    const { data: rowData, error: upsertError } = await supabase.rpc(
      'upsert_feature_spec',
      {
        p_chunk_id: chunkId,
        p_title: `${parsedChunk.data.title} — Feature Spec`,
        p_content_json: result.data.content_json,
        p_content_markdown: renderedMarkdown,
      },
    );

    if (upsertError || !rowData) {
      logger.error('feature_spec_upsert_failed', { code: upsertError?.code });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    const parsedRow = FeatureSpecRowSchema.safeParse(rowData);

    if (!parsedRow.success) {
      logger.error('feature_spec_row_invalid_shape', {
        issues: parsedRow.error.issues,
      });

      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    // TODO(chunk-27): write generation metadata to generation_logs.
    logger.info('feature_spec_generated', {
      userId,
      projectId,
      chunkId,
      version: parsedRow.data.version,
      provider: result.meta.provider,
      model: result.meta.model,
      inputTokens: result.meta.inputTokens,
      outputTokens: result.meta.outputTokens,
      latencyMs: result.meta.latencyMs,
    });

    return ok(parsedRow.data);
  } catch (error) {
    if (error instanceof AuthError) {
      return fail(error.code, error.message, error.status);
    }

    if (error instanceof AiInvalidOutputError) {
      logger.error('ai_invalid_output', { type: 'feature_spec_generation' });

      return fail(
        ERROR_CODES.AI_INVALID_OUTPUT,
        ERROR_MESSAGES.AI_INVALID_OUTPUT,
        HTTP_STATUS.BAD_GATEWAY,
      );
    }

    if (error instanceof AiProviderError) {
      logger.error('ai_provider_error', {
        type: 'feature_spec_generation',
        status: error.status,
      });

      return fail(
        ERROR_CODES.AI_PROVIDER_ERROR,
        ERROR_MESSAGES.AI_PROVIDER_ERROR,
        HTTP_STATUS.BAD_GATEWAY,
      );
    }

    logger.error('unhandled_error', {
      route: 'generate-feature-spec',
      message: getSafeErrorMessage(error),
    });

    return fail(
      ERROR_CODES.INTERNAL,
      ERROR_MESSAGES.INTERNAL,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});
