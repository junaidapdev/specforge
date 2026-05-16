import { useMutation } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/useAuth';
import { callEdgeFunction } from '@/lib/edge';
import { logger } from '@/lib/logger';
import {
  RegeneratePrdSectionOutputSchema,
  type PrdSectionKey,
  type RegeneratePrdSectionOutput,
} from '@shared/schemas/prd';

export function useRegeneratePrdSection(projectId: string) {
  const { session } = useAuth();

  return useMutation<RegeneratePrdSectionOutput, Error, PrdSectionKey>({
    mutationFn: async (sectionKey) => {
      if (!session) {
        throw new Error('NOT_AUTHENTICATED');
      }

      const data = await callEdgeFunction<RegeneratePrdSectionOutput>(
        'regenerate-prd-section',
        { projectId, sectionKey },
        session.access_token,
      );
      const parsed = RegeneratePrdSectionOutputSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('prd_section_regen_invalid_local', { issues: parsed.error.issues });
        throw new Error('PRD_SECTION_REGEN_INVALID');
      }

      return parsed.data;
    },
  });
}
