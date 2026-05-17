import { useQuery } from '@tanstack/react-query';

import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

import { ChunkRowSchema, type ChunkRow } from './useChunks';

export const chunkQueryKey = (chunkId: string) => ['chunk', chunkId] as const;

export function useChunk(chunkId: string, enabled = true) {
  return useQuery<ChunkRow>({
    queryKey: chunkQueryKey(chunkId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feature_chunks')
        .select('*')
        .eq('id', chunkId)
        .single();

      if (error) {
        logger.error('chunk_fetch_failed', { code: error.code, message: error.message });
        throw new Error('CHUNK_FETCH_FAILED');
      }

      const parsed = ChunkRowSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('chunk_invalid_shape', { issues: parsed.error.issues });
        throw new Error('CHUNK_INVALID_SHAPE');
      }

      return parsed.data;
    },
    enabled,
    staleTime: 10 * 1000,
  });
}
