import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/useAuth';
import { projectsQueryKey } from '@/features/dashboard/useProjects';
import { projectQueryKey } from '@/features/projects/layout/useProjectQuery';
import { callEdgeFunction } from '@/lib/edge';
import { logger } from '@/lib/logger';

import { PrdRowSchema, prdQueryKey, type PrdRow } from './useExistingPrd';

export type GeneratePrdInput = {
  projectId: string;
};

export function useGeneratePrd(projectId: string) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<PrdRow, Error, GeneratePrdInput>({
    mutationFn: async (input) => {
      if (!session) {
        throw new Error('NOT_AUTHENTICATED');
      }

      const data = await callEdgeFunction<PrdRow>(
        'generate-prd',
        input,
        session.access_token,
      );

      const parsed = PrdRowSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('prd_invalid_shape_after_generate', { issues: parsed.error.issues });
        throw new Error('PRD_INVALID_SHAPE');
      }

      return parsed.data;
    },
    onSuccess: (prd) => {
      queryClient.setQueryData(prdQueryKey(projectId), prd);
      queryClient.invalidateQueries({ queryKey: projectQueryKey(projectId) });
      queryClient.invalidateQueries({ queryKey: projectsQueryKey });
    },
  });
}
