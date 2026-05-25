import { useQuery } from '@tanstack/react-query';

import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import { IssueRowSchema, type IssueRow } from '@shared/schemas/issue';

const ISSUE_SELECT =
  'id, project_id, related_chunk_id, title, description, severity, status, generated_prompt, version, created_at, updated_at, resolved_at';

export const issuesQueryKey = (projectId: string) => ['issues', projectId] as const;
export const overviewIssuesQueryKey = (projectId: string) =>
  ['overview', 'issues', projectId] as const;

export function useIssues(projectId: string) {
  return useQuery<IssueRow[]>({
    queryKey: issuesQueryKey(projectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_issues')
        .select(ISSUE_SELECT)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('issues_fetch_failed', { code: error.code, projectId });
        throw new Error('ISSUES_FETCH_FAILED');
      }

      const issues: IssueRow[] = [];

      for (const row of data ?? []) {
        const parsed = IssueRowSchema.safeParse(row);

        if (!parsed.success) {
          logger.error('issue_invalid_shape', { projectId });
          throw new Error('ISSUE_INVALID_SHAPE');
        }

        issues.push(parsed.data);
      }

      return issues;
    },
    staleTime: 10 * 1000,
  });
}
