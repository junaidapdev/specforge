import { useMutation } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/useAuth';
import { callEdgeFunction } from '@/lib/edge';
import { logger } from '@/lib/logger';
import {
  RegenerateArchitectureSectionOutputSchema,
  type ArchitectureSectionKey,
  type RegenerateArchitectureSectionOutput,
} from '@shared/schemas/architecture';

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

      const data = await callEdgeFunction<RegenerateArchitectureSectionOutput>(
        'regenerate-architecture-section',
        { mode: 'full_section', projectId, sectionKey },
        session.access_token,
      );
      const parsed = RegenerateArchitectureSectionOutputSchema.safeParse(data);

      if (!parsed.success || parsed.data.mode !== 'full_section') {
        logger.error('architecture_section_regen_invalid_local', {
          issues: parsed.success ? [] : parsed.error.issues,
        });
        throw new Error('ARCHITECTURE_SECTION_REGEN_INVALID');
      }

      return parsed.data;
    },
  });
}
