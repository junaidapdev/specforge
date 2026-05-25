import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import { overviewIssuesQueryKey } from '@/features/projects/issues/useIssues';

export type OverviewIssue = {
  id: string;
  title: string;
  updatedAt: string;
};

export type IssuesState = {
  openCount: number;
  recent: OverviewIssue[];
};

const OverviewIssueRowSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  updated_at: z.string(),
});

export function useIssuesState(projectId: string) {
  return useQuery<IssuesState>({
    queryKey: overviewIssuesQueryKey(projectId),
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from('project_issues')
        .select('id, title, updated_at', { count: 'exact' })
        .eq('project_id', projectId)
        .eq('status', 'open')
        .order('updated_at', { ascending: false })
        .limit(3);

      if (error) {
        logger.error('overview_issues_fetch_failed', { code: error.code, projectId });
        throw new Error('OVERVIEW_ISSUES_FETCH_FAILED');
      }

      const parsed = z.array(OverviewIssueRowSchema).safeParse(data ?? []);

      if (!parsed.success) {
        logger.error('overview_issues_invalid_shape', { projectId });
        throw new Error('OVERVIEW_ISSUES_INVALID_SHAPE');
      }

      return {
        openCount: count ?? parsed.data.length,
        recent: parsed.data.map((issue) => ({
          id: issue.id,
          title: issue.title,
          updatedAt: issue.updated_at,
        })),
      };
    },
    staleTime: 10 * 1000,
  });
}
