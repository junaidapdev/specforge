import { useMutation, useQueryClient } from '@tanstack/react-query';

import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

import { featureSpecQueryKey } from './useExistingFeatureSpec';

export function useApproveFeatureSpec(chunkId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      const { error } = await supabase.rpc('approve_feature_spec', {
        p_chunk_id: chunkId,
      });

      if (error) {
        logger.error('feature_spec_approve_failed', {
          code: error.code,
          message: error.message,
        });
        throw new Error('FEATURE_SPEC_APPROVE_FAILED');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: featureSpecQueryKey(chunkId) });
    },
  });
}
