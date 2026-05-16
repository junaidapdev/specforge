import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { useAuth } from '@/features/auth/useAuth';
import { projectsQueryKey } from '@/features/dashboard/useProjects';
import { projectQueryKey } from '@/features/projects/layout/useProjectQuery';
import { callEdgeFunction } from '@/lib/edge';
import { logger } from '@/lib/logger';

import { allContextFilesQueryKey } from './useAllContextFiles';

const GenerateContextFilesResultSchema = z.object({
  generated: z.literal(true),
});

export type GenerateContextFilesInput = {
  projectId: string;
};

export function useGenerateContextFiles() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<z.infer<typeof GenerateContextFilesResultSchema>, Error, GenerateContextFilesInput>({
    mutationFn: async (input) => {
      if (!session) {
        throw new Error('NOT_AUTHENTICATED');
      }

      const data = await callEdgeFunction<z.infer<typeof GenerateContextFilesResultSchema>>(
        'generate-context-files',
        input,
        session.access_token,
      );
      const parsed = GenerateContextFilesResultSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('context_files_generate_invalid_shape', { issues: parsed.error.issues });
        throw new Error('CONTEXT_FILES_GENERATE_INVALID_SHAPE');
      }

      return parsed.data;
    },
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: allContextFilesQueryKey(input.projectId) });
      queryClient.invalidateQueries({ queryKey: projectQueryKey(input.projectId) });
      queryClient.invalidateQueries({ queryKey: projectsQueryKey });
    },
  });
}
