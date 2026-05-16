import { useMutation } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/useAuth';
import {
  type ArchitectureSectionKey,
  type RegenerateArchitectureSectionOutput,
} from '@shared/schemas/architecture';
import { regenerateArchitectureTarget } from './regenerate-architecture';

export function useRegenerateArchitectureSection(projectId: string) {
  const { session } = useAuth();

  return useMutation<
    Extract<RegenerateArchitectureSectionOutput, { mode: 'full_section' }>,
    Error,
    ArchitectureSectionKey
  >({
    mutationFn: async (sectionKey) => {
      if (!session) {
        throw new Error('NOT_AUTHENTICATED');
      }

      const output = await regenerateArchitectureTarget(projectId, session.access_token, {
        mode: 'full_section',
        sectionKey,
      });

      if (output.mode !== 'full_section') {
        throw new Error('ARCHITECTURE_SECTION_REGEN_INVALID');
      }

      return output;
    },
  });
}
