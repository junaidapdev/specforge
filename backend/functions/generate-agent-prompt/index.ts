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
import { assembleAgentPrompt } from '@shared/markdown/agent-prompt-markdown.ts';
import {
  AgentPromptModelOutputSchema,
  GenerateAgentPromptInputSchema,
  TargetAgentSchema,
} from '@shared/schemas/agent-prompt.ts';
import { ChunkEffortSchema } from '@shared/schemas/chunks.ts';
import { CONTEXT_FILE_TYPES, ContextFileTypeSchema } from '@shared/schemas/context-files.ts';
import { FeatureSpecContentSchema } from '@shared/schemas/feature-spec.ts';

const ChunkContextSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  ref: z.string().nullable(),
  title: z.string().min(1),
  description: z.string().min(1),
  included_features: z.array(z.string()),
  estimated_effort: ChunkEffortSchema,
});

type ChunkContext = z.infer<typeof ChunkContextSchema>;

const ProjectContextSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().nullable(),
  project_type: z.string().nullable(),
  preferred_stack: z.string().nullable(),
});

type ProjectContext = z.infer<typeof ProjectContextSchema>;

const FeatureSpecContextSchema = z.object({
  content_json: FeatureSpecContentSchema,
});

const ContextFileNameSchema = z.object({
  type: ContextFileTypeSchema,
});

const AgentPromptRowSchema = z.object({
  id: z.string().uuid(),
  chunk_id: z.string().uuid(),
  target_agent: TargetAgentSchema,
  content: z.string().min(1),
  version: z.number().int().min(1),
  created_at: z.string(),
  updated_at: z.string(),
});

const CONTEXT_FILE_NAMES: Record<z.infer<typeof ContextFileTypeSchema>, string> = {
  project_overview: 'project-overview.md',
  code_standards: 'code-standards.md',
  ai_workflow_rules: 'ai-workflow-rules.md',
  ui_context: 'ui-context.md',
  agents_md: 'AGENTS.md',
  claude_md: 'CLAUDE.md',
  progress_tracker: 'progress-tracker.md',
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

function formatAgentPromptContext(input: {
  project: ProjectContext;
  chunk: ChunkContext;
  specGoal: string;
  specScope: string;
  targetAgent: z.infer<typeof TargetAgentSchema>;
  contextFileNames: string[];
}): string {
  const projectLines = [
    `Project name: ${input.project.name}`,
    input.project.description ? `Project description: ${input.project.description}` : null,
    input.project.project_type ? `Project type: ${input.project.project_type}` : null,
    input.project.preferred_stack ? `Preferred stack: ${input.project.preferred_stack}` : null,
  ].filter((line): line is string => Boolean(line));

  return [
    'Project context:',
    projectLines.join('\n'),
    'Target agent:',
    input.targetAgent,
    'Available context files:',
    input.contextFileNames.length > 0 ? input.contextFileNames.join(', ') : '(none)',
    'Target chunk:',
    [
      `ref: ${input.chunk.ref ?? input.chunk.id}`,
      `title: ${input.chunk.title}`,
      `description: ${input.chunk.description}`,
      `estimated_effort: ${input.chunk.estimated_effort}`,
      `included_features: ${input.chunk.included_features.join(', ') || '(none)'}`,
    ].join('\n'),
    'Feature spec goal:',
    input.specGoal,
    'Feature spec scope:',
    input.specScope,
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
    const parsedInput = GenerateAgentPromptInputSchema.safeParse(await parseJson(req));

    if (!parsedInput.success) {
      return fail(
        ERROR_CODES.VALIDATION_FAILED,
        ERROR_MESSAGES.VALIDATION_FAILED,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
      );
    }

    const { chunkId, targetAgent } = parsedInput.data;
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
      .select('id, project_id, ref, title, description, included_features, estimated_effort')
      .eq('id', chunkId)
      .maybeSingle();

    if (chunkError) {
      logger.error('agent_prompt_chunk_lookup_failed', { code: chunkError.code });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    if (!chunkData) {
      return fail(ERROR_CODES.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const parsedChunk = ChunkContextSchema.safeParse(chunkData);

    if (!parsedChunk.success) {
      logger.error('agent_prompt_chunk_invalid_shape', {
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
    const [specResult, projectResult, contextFilesResult] = await Promise.all([
      supabase
        .from('feature_specs')
        .select('content_json')
        .eq('chunk_id', chunkId)
        .maybeSingle(),
      supabase
        .from('projects')
        .select('id, name, description, project_type, preferred_stack')
        .eq('id', projectId)
        .eq('user_id', userId)
        .maybeSingle(),
      supabase
        .from('project_documents')
        .select('type')
        .eq('project_id', projectId)
        .in('type', [...CONTEXT_FILE_TYPES]),
    ]);

    if (specResult.error || projectResult.error || contextFilesResult.error) {
      logger.error('agent_prompt_dependency_lookup_failed', {
        specCode: specResult.error?.code,
        projectCode: projectResult.error?.code,
        contextCode: contextFilesResult.error?.code,
      });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    if (!specResult.data) {
      return fail(
        ERROR_CODES.FEATURE_SPEC_NOT_FOUND,
        ERROR_MESSAGES.FEATURE_SPEC_NOT_FOUND,
        HTTP_STATUS.PRECONDITION_FAILED,
      );
    }

    if (!projectResult.data) {
      return fail(ERROR_CODES.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const parsedSpec = FeatureSpecContextSchema.safeParse(specResult.data);
    const parsedProject = ProjectContextSchema.safeParse(projectResult.data);
    const parsedContextFiles = z.array(ContextFileNameSchema).safeParse(
      contextFilesResult.data ?? [],
    );

    if (!parsedSpec.success || !parsedProject.success || !parsedContextFiles.success) {
      logger.error('agent_prompt_dependency_invalid_shape', {
        chunkId,
        specIssues: parsedSpec.success ? undefined : parsedSpec.error.issues,
        projectIssues: parsedProject.success ? undefined : parsedProject.error.issues,
        contextIssues: parsedContextFiles.success ? undefined : parsedContextFiles.error.issues,
      });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    const contextFileNames = parsedContextFiles.data.map((row) => CONTEXT_FILE_NAMES[row.type]);
    const result = await generate(
      'agent_prompt_generation',
      formatAgentPromptContext({
        project: parsedProject.data,
        chunk: parsedChunk.data,
        specGoal: parsedSpec.data.content_json.goal,
        specScope: parsedSpec.data.content_json.scope,
        targetAgent,
        contextFileNames,
      }),
      AgentPromptModelOutputSchema,
    );

    const content = assembleAgentPrompt({
      ai: result.data,
      spec: parsedSpec.data.content_json,
      chunkTitle: parsedChunk.data.title,
      chunkRef: parsedChunk.data.ref ?? chunkId,
      projectName: parsedProject.data.name,
      targetAgent,
    });
    const { data: promptData, error: rpcError } = await supabase.rpc('upsert_agent_prompt', {
      p_chunk_id: chunkId,
      p_target_agent: targetAgent,
      p_content: content,
    });

    if (rpcError || !promptData) {
      logger.error('agent_prompt_upsert_failed', { code: rpcError?.code });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    const parsedPrompt = AgentPromptRowSchema.safeParse(promptData);

    if (!parsedPrompt.success) {
      logger.error('agent_prompt_row_invalid_shape', {
        issues: parsedPrompt.error.issues,
      });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    // TODO(chunk-27): write generation metadata to generation_logs.
    logger.info('agent_prompt_generated', {
      userId,
      projectId,
      chunkId,
      targetAgent,
      provider: result.meta.provider,
      model: result.meta.model,
      inputTokens: result.meta.inputTokens,
      outputTokens: result.meta.outputTokens,
      latencyMs: result.meta.latencyMs,
      promptLength: content.length,
    });

    return ok(parsedPrompt.data);
  } catch (error) {
    if (error instanceof AuthError) {
      return fail(error.code, error.message, error.status);
    }

    if (error instanceof AiInvalidOutputError) {
      logger.error('ai_invalid_output', { type: 'agent_prompt_generation' });
      return fail(
        ERROR_CODES.AI_INVALID_OUTPUT,
        ERROR_MESSAGES.AI_INVALID_OUTPUT,
        HTTP_STATUS.BAD_GATEWAY,
      );
    }

    if (error instanceof AiProviderError) {
      logger.error('ai_provider_error', {
        type: 'agent_prompt_generation',
        status: error.status,
      });
      return fail(
        ERROR_CODES.AI_PROVIDER_ERROR,
        ERROR_MESSAGES.AI_PROVIDER_ERROR,
        HTTP_STATUS.BAD_GATEWAY,
      );
    }

    logger.error('unhandled_error', {
      route: 'generate-agent-prompt',
      message: getSafeErrorMessage(error),
    });
    return fail(
      ERROR_CODES.INTERNAL,
      ERROR_MESSAGES.INTERNAL,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});
