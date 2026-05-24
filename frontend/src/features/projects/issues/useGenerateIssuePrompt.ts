import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/useAuth';
import { callEdgeFunction } from '@/lib/edge';
import { logger } from '@/lib/logger';
import {
  IssuePromptResultSchema,
  type IssuePromptResult,
  type IssueRow,
} from '@shared/schemas/issue';

import { issueQueryKey } from './useIssue';
import { issuesQueryKey, overviewIssuesQueryKey } from './useIssues';

export function useGenerateIssuePrompt(projectId: string, issueId: string) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<IssuePromptResult, Error, void>({
    mutationFn: async () => {
      if (!session) {
        throw new Error('NOT_AUTHENTICATED');
      }

      const data = await callEdgeFunction<IssuePromptResult>(
        'generate-issue-prompt',
        { issueId },
        session.access_token,
      );
      const parsed = IssuePromptResultSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('issue_prompt_invalid_shape_after_generate', { issueId });
        throw new Error('ISSUE_PROMPT_INVALID_SHAPE');
      }

      return parsed.data;
    },
    onSuccess: (prompt) => {
      queryClient.setQueryData<IssueRow | undefined>(issueQueryKey(issueId), (issue) =>
        issue
          ? {
            ...issue,
            generated_prompt: prompt.generated_prompt,
            version: prompt.version,
            updated_at: prompt.updated_at,
          }
          : issue
      );
      void queryClient.invalidateQueries({ queryKey: issueQueryKey(issueId) });
      void queryClient.invalidateQueries({ queryKey: issuesQueryKey(projectId) });
      void queryClient.invalidateQueries({ queryKey: overviewIssuesQueryKey(projectId) });
    },
  });
}
