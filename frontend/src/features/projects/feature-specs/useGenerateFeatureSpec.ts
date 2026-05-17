import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/useAuth';
import { callEdgeFunction } from '@/lib/edge';
import { logger } from '@/lib/logger';

import {
  FeatureSpecRowSchema,
  featureSpecQueryKey,
  type FeatureSpecRow,
} from './useExistingFeatureSpec';

export type GenerateFeatureSpecInput = {
  chunkId: string;
};

export function useGenerateFeatureSpec() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<FeatureSpecRow, Error, GenerateFeatureSpecInput>({
    mutationFn: async (input) => {
      if (!session) {
        throw new Error('NOT_AUTHENTICATED');
      }

      const data = await callEdgeFunction<FeatureSpecRow>(
        'generate-feature-spec',
        input,
        session.access_token,
      );
      const parsed = FeatureSpecRowSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('feature_spec_invalid_shape_after_generate', {
          issues: parsed.error.issues,
        });
        throw new Error('FEATURE_SPEC_INVALID_SHAPE');
      }

      return parsed.data;
    },
    onSuccess: (spec, input) => {
      queryClient.setQueryData(featureSpecQueryKey(input.chunkId), spec);
    },
  });
}
