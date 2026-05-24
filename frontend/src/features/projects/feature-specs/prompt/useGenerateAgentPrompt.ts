import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/useAuth';
import { callEdgeFunction } from '@/lib/edge';
import { logger } from '@/lib/logger';
import type { TargetAgent } from '@shared/schemas/agent-prompt';

import {
  AgentPromptRowSchema,
  agentPromptsForChunkQueryKey,
  type AgentPromptRow,
} from './useAgentPromptsForChunk';

export type GenerateAgentPromptInput = {
  chunkId: string;
  targetAgent: TargetAgent;
};

export function useGenerateAgentPrompt() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<AgentPromptRow, Error, GenerateAgentPromptInput>({
    mutationFn: async (input) => {
      if (!session) {
        throw new Error('NOT_AUTHENTICATED');
      }

      const data = await callEdgeFunction<AgentPromptRow>(
        'generate-agent-prompt',
        input,
        session.access_token,
      );
      const parsed = AgentPromptRowSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('agent_prompt_invalid_shape_after_generate', {
          issues: parsed.error.issues,
        });
        throw new Error('AGENT_PROMPT_INVALID_SHAPE');
      }

      return parsed.data;
    },
    onSuccess: (_prompt, input) => {
      queryClient.invalidateQueries({
        queryKey: agentPromptsForChunkQueryKey(input.chunkId),
      });
    },
  });
}
