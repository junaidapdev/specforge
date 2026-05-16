import { useMutation, useQueryClient } from '@tanstack/react-query';

import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import type { ContextFileType } from '@shared/schemas/context-files';

import { allContextFilesQueryKey } from './useAllContextFiles';

export function useApproveContextFile(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, ContextFileType>({
    mutationFn: async (type) => {
      const { error } = await supabase.rpc('approve_context_file', {
        p_project_id: projectId,
        p_type: type,
      });

      if (error) {
        logger.error('context_file_approve_failed', { code: error.code, type });
        throw new Error('CONTEXT_FILE_APPROVE_FAILED');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: allContextFilesQueryKey(projectId) });
    },
  });
}
