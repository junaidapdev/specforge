import { useMutation, useQueryClient } from '@tanstack/react-query';

import { projectsQueryKey } from '@/features/dashboard/useProjects';
import { projectQueryKey } from '@/features/projects/layout/useProjectQuery';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

import { prdQueryKey } from './useExistingPrd';

export function useApprovePrd(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      const { error } = await supabase.rpc('approve_project_prd', {
        p_project_id: projectId,
      });

      if (error) {
        logger.error('prd_approve_failed', { code: error.code, message: error.message });
        throw new Error('PRD_APPROVE_FAILED');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: prdQueryKey(projectId) });
      queryClient.invalidateQueries({ queryKey: projectQueryKey(projectId) });
      queryClient.invalidateQueries({ queryKey: projectsQueryKey });
    },
  });
}
