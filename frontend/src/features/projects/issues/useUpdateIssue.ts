import { useMutation, useQueryClient } from '@tanstack/react-query';

import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import type { UpdateIssueInput } from '@shared/schemas/issue';

import { issueQueryKey } from './useIssue';
import { issuesQueryKey, overviewIssuesQueryKey } from './useIssues';

export function useUpdateIssue(projectId: string, issueId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateIssueInput>({
    mutationFn: async (input) => {
      const { error } = await supabase.rpc('update_issue', {
        p_issue_id: issueId,
        p_title: input.title,
        p_description: input.description,
        p_severity: input.severity,
        p_related_chunk_id: input.relatedChunkId ?? null,
      });

      if (error) {
        logger.error('issue_update_failed', { code: error.code, issueId });
        throw new Error('ISSUE_UPDATE_FAILED');
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: issueQueryKey(issueId) });
      void queryClient.invalidateQueries({ queryKey: issuesQueryKey(projectId) });
      void queryClient.invalidateQueries({ queryKey: overviewIssuesQueryKey(projectId) });
    },
  });
}
