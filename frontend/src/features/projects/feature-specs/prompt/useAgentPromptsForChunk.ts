import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import { TargetAgentSchema, type TargetAgent } from '@shared/schemas/agent-prompt';

export const AgentPromptRowSchema = z.object({
  id: z.string().uuid(),
  chunk_id: z.string().uuid(),
  target_agent: TargetAgentSchema,
  content: z.string(),
  version: z.number().int().min(1),
  created_at: z.string(),
  updated_at: z.string(),
});

export type AgentPromptRow = z.infer<typeof AgentPromptRowSchema>;

export type AgentPromptsByTarget = Partial<Record<TargetAgent, AgentPromptRow>>;

export const agentPromptsForChunkQueryKey = (chunkId: string) =>
  ['agent-prompts', chunkId] as const;

export function useAgentPromptsForChunk(chunkId: string) {
  return useQuery<AgentPromptsByTarget>({
    queryKey: agentPromptsForChunkQueryKey(chunkId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coding_agent_prompts')
        .select('*')
        .eq('chunk_id', chunkId);

      if (error) {
        logger.error('agent_prompts_fetch_failed', { code: error.code, message: error.message });
        throw new Error('AGENT_PROMPTS_FETCH_FAILED');
      }

      const prompts: AgentPromptsByTarget = {};

      for (const row of data ?? []) {
        const parsed = AgentPromptRowSchema.safeParse(row);

        if (!parsed.success) {
          logger.error('agent_prompt_invalid_shape', { issues: parsed.error.issues });
          continue;
        }

        prompts[parsed.data.target_agent] = parsed.data;
      }

      return prompts;
    },
    staleTime: 10 * 1000,
  });
}
