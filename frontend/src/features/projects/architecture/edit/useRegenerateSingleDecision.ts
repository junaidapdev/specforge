import { useMutation } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/useAuth';
import { callEdgeFunction } from '@/lib/edge';
import { logger } from '@/lib/logger';
import {
  RegenerateArchitectureSectionOutputSchema,
  type RegenerateArchitectureSectionOutput,
} from '@shared/schemas/architecture';

export function useRegenerateSingleDecision(projectId: string) {
  const { session } = useAuth();

  return useMutation<
    Extract<RegenerateArchitectureSectionOutput, { mode: 'single_decision' }>,
    Error,
    string
  >({
    mutationFn: async (decisionId) => {
      if (!session) {
        throw new Error('NOT_AUTHENTICATED');
      }

      const data = await callEdgeFunction<RegenerateArchitectureSectionOutput>(
        'regenerate-architecture-section',
        { mode: 'single_decision', projectId, decisionId },
        session.access_token,
      );
      const parsed = RegenerateArchitectureSectionOutputSchema.safeParse(data);

      if (!parsed.success || parsed.data.mode !== 'single_decision') {
        logger.error('architecture_decision_regen_invalid_local', {
          issues: parsed.success ? [] : parsed.error.issues,
        });
        throw new Error('ARCHITECTURE_DECISION_REGEN_INVALID');
      }

      return parsed.data;
    },
  });
}
