import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import type { CreateIssueInput } from '@shared/schemas/issue';

import { issuesQueryKey, overviewIssuesQueryKey } from './useIssues';

const CreatedIssueSchema = z.object({ id: z.string().uuid() });

export function useCreateIssue(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<{ id: string }, Error, CreateIssueInput>({
    mutationFn: async (input) => {
      const { data, error } = await supabase.rpc('create_issue', {
        p_project_id: projectId,
        p_title: input.title,
        p_description: input.description,
        p_severity: input.severity,
        p_related_chunk_id: input.relatedChunkId ?? null,
      });

      if (error) {
        logger.error('issue_create_failed', { code: error.code, projectId });
        throw new Error('ISSUE_CREATE_FAILED');
      }

      const parsed = CreatedIssueSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('issue_create_invalid_shape', { projectId });
        throw new Error('ISSUE_CREATE_INVALID_SHAPE');
      }

      return parsed.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: issuesQueryKey(projectId) });
      void queryClient.invalidateQueries({ queryKey: overviewIssuesQueryKey(projectId) });
    },
  });
}
