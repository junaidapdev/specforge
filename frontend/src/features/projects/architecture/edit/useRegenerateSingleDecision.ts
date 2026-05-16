import { useMutation } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/useAuth';
import { type RegenerateArchitectureSectionOutput } from '@shared/schemas/architecture';
import { regenerateArchitectureTarget } from './regenerate-architecture';

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

      const output = await regenerateArchitectureTarget(projectId, session.access_token, {
        mode: 'single_decision',
        decisionId,
      });

      if (output.mode !== 'single_decision') {
        throw new Error('ARCHITECTURE_DECISION_REGEN_INVALID');
      }

      return output;
    },
  });
}
