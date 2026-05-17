import { useMutation, useQueryClient } from '@tanstack/react-query';

import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

import { chunksQueryKey } from '../useChunks';

export type ReorderChunksInput = {
  orderedIds: string[];
};

export function useReorderChunks(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, ReorderChunksInput>({
    mutationFn: async ({ orderedIds }) => {
      const { error } = await supabase.rpc('reorder_chunks', {
        p_project_id: projectId,
        p_ordered_ids: orderedIds,
      });

      if (error) {
        logger.error('chunks_reorder_failed', { code: error.code, projectId });
        throw new Error('CHUNKS_REORDER_FAILED');
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: chunksQueryKey(projectId) });
    },
  });
}
