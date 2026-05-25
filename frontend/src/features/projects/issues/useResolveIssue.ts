import { useMutation, useQueryClient } from '@tanstack/react-query';

import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

import { issueQueryKey } from './useIssue';
import { issuesQueryKey, overviewIssuesQueryKey } from './useIssues';

export function useResolveIssue(projectId: string, issueId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, boolean>({
    mutationFn: async (resolved) => {
      const { error } = await supabase.rpc('resolve_issue', {
        p_issue_id: issueId,
        p_resolved: resolved,
      });

      if (error) {
        logger.error('issue_resolve_failed', { code: error.code, issueId });
        throw new Error('ISSUE_RESOLVE_FAILED');
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: issueQueryKey(issueId) });
      void queryClient.invalidateQueries({ queryKey: issuesQueryKey(projectId) });
      void queryClient.invalidateQueries({ queryKey: overviewIssuesQueryKey(projectId) });
    },
  });
}
