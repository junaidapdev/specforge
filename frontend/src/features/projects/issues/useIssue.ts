import { useQuery } from '@tanstack/react-query';

import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import { IssueRowSchema, type IssueRow } from '@shared/schemas/issue';

const ISSUE_SELECT =
  'id, project_id, related_chunk_id, title, description, severity, status, generated_prompt, version, created_at, updated_at, resolved_at';

export const issueQueryKey = (issueId: string) => ['issue', issueId] as const;

export function useIssue(issueId: string, enabled = true) {
  return useQuery<IssueRow>({
    queryKey: issueQueryKey(issueId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_issues')
        .select(ISSUE_SELECT)
        .eq('id', issueId)
        .single();

      if (error) {
        logger.error('issue_fetch_failed', { code: error.code, issueId });
        throw new Error('ISSUE_FETCH_FAILED');
      }

      const parsed = IssueRowSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('issue_invalid_shape', { issueId });
        throw new Error('ISSUE_INVALID_SHAPE');
      }

      return parsed.data;
    },
    enabled,
    staleTime: 10 * 1000,
  });
}
