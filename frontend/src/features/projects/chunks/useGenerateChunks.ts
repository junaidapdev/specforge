import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { useAuth } from '@/features/auth/useAuth';
import { projectsQueryKey } from '@/features/dashboard/useProjects';
import { projectQueryKey } from '@/features/projects/layout/useProjectQuery';
import { callEdgeFunction } from '@/lib/edge';
import { logger } from '@/lib/logger';

import { chunksQueryKey } from './useChunks';

const GenerateChunksResultSchema = z.object({
  generated: z.literal(true),
  count: z.number().int().min(1),
  statusAdvanced: z.boolean(),
});

export type GenerateChunksInput = {
  projectId: string;
};

export function useGenerateChunks() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<z.infer<typeof GenerateChunksResultSchema>, Error, GenerateChunksInput>({
    mutationFn: async (input) => {
      if (!session) {
        throw new Error('NOT_AUTHENTICATED');
      }

      const data = await callEdgeFunction<z.infer<typeof GenerateChunksResultSchema>>(
        'generate-chunks',
        input,
        session.access_token,
      );
      const parsed = GenerateChunksResultSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('chunks_generate_invalid_shape', { issues: parsed.error.issues });
        throw new Error('CHUNKS_GENERATE_INVALID_SHAPE');
      }

      return parsed.data;
    },
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: chunksQueryKey(input.projectId) });
      queryClient.invalidateQueries({ queryKey: projectQueryKey(input.projectId) });
      queryClient.invalidateQueries({ queryKey: projectsQueryKey });
    },
  });
}
