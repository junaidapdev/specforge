import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import { ChunkEffortSchema, ChunkStatusSchema } from '@shared/schemas/chunks';

export const ChunkRowSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  ref: z.string().min(1),
  title: z.string(),
  description: z.string(),
  status: ChunkStatusSchema,
  position: z.number().int(),
  included_features: z.array(z.string()),
  dependencies: z.array(z.string()),
  estimated_effort: ChunkEffortSchema,
  version: z.number().int().min(1),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ChunkRow = z.infer<typeof ChunkRowSchema>;

export const chunksQueryKey = (projectId: string) => ['chunks', projectId] as const;

export function useChunks(projectId: string) {
  return useQuery<ChunkRow[]>({
    queryKey: chunksQueryKey(projectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feature_chunks')
        .select('*')
        .eq('project_id', projectId)
        .order('position', { ascending: true });

      if (error) {
        logger.error('chunks_fetch_failed', { code: error.code, message: error.message });
        throw new Error('CHUNKS_FETCH_FAILED');
      }

      const chunks: ChunkRow[] = [];

      for (const row of data ?? []) {
        const parsed = ChunkRowSchema.safeParse(row);

        if (!parsed.success) {
          logger.error('chunk_invalid_shape', { issues: parsed.error.issues });
          throw new Error('CHUNK_INVALID_SHAPE');
        }

        chunks.push(parsed.data);
      }

      return chunks;
    },
    staleTime: 10 * 1000,
  });
}
