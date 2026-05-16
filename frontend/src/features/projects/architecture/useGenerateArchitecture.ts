import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/useAuth';
import { projectsQueryKey } from '@/features/dashboard/useProjects';
import { projectQueryKey } from '@/features/projects/layout/useProjectQuery';
import { callEdgeFunction } from '@/lib/edge';
import { logger } from '@/lib/logger';

import {
  ArchitectureRowSchema,
  architectureQueryKey,
  type ArchitectureRow,
} from './useExistingArchitecture';

export type GenerateArchitectureInput = {
  projectId: string;
};

export function useGenerateArchitecture(projectId: string) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<ArchitectureRow, Error, GenerateArchitectureInput>({
    mutationFn: async (input) => {
      if (!session) {
        throw new Error('NOT_AUTHENTICATED');
      }

      const data = await callEdgeFunction<ArchitectureRow>(
        'generate-architecture',
        input,
        session.access_token,
      );

      const parsed = ArchitectureRowSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('architecture_invalid_shape_after_generate', {
          issues: parsed.error.issues,
        });
        throw new Error('ARCHITECTURE_INVALID_SHAPE');
      }

      return parsed.data;
    },
    onSuccess: (architecture) => {
      queryClient.setQueryData(architectureQueryKey(projectId), architecture);
      queryClient.invalidateQueries({ queryKey: projectQueryKey(projectId) });
      queryClient.invalidateQueries({ queryKey: projectsQueryKey });
    },
  });
}
