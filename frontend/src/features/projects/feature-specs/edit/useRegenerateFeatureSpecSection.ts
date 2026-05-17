import { useMutation } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/useAuth';
import { callEdgeFunction } from '@/lib/edge';
import { logger } from '@/lib/logger';
import {
  RegenerateFeatureSpecSectionOutputSchema,
  type FeatureSpecSectionKey,
  type RegenerateFeatureSpecSectionOutput,
} from '@shared/schemas/feature-spec';

export type RegenerateFeatureSpecSectionInput = {
  sectionKey: FeatureSpecSectionKey;
  userInstruction?: string;
};

export function useRegenerateFeatureSpecSection(chunkId: string) {
  const { session } = useAuth();

  return useMutation<
    RegenerateFeatureSpecSectionOutput,
    Error,
    RegenerateFeatureSpecSectionInput
  >({
    mutationFn: async (input) => {
      if (!session) {
        throw new Error('NOT_AUTHENTICATED');
      }

      const data = await callEdgeFunction<RegenerateFeatureSpecSectionOutput>(
        'regenerate-feature-spec-section',
        { chunkId, ...input },
        session.access_token,
      );
      const parsed = RegenerateFeatureSpecSectionOutputSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('feature_spec_section_regen_invalid_local', {
          issues: parsed.error.issues,
        });
        throw new Error('FEATURE_SPEC_SECTION_REGEN_INVALID');
      }

      if (parsed.data.sectionKey !== input.sectionKey) {
        logger.error('feature_spec_section_regen_mismatch', {
          requested: input.sectionKey,
          returned: parsed.data.sectionKey,
        });
        throw new Error('FEATURE_SPEC_SECTION_REGEN_MISMATCH');
      }

      return parsed.data;
    },
  });
}
