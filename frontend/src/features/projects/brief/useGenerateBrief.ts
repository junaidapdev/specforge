import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/useAuth';
import { projectsQueryKey } from '@/features/dashboard/useProjects';
import { callEdgeFunction } from '@/lib/edge';
import { logger } from '@/lib/logger';

import { BriefRowSchema, briefQueryKey, type BriefRow } from './useExistingBrief';

export type BriefAnswer = {
  questionId: string;
  questionText: string;
  answer: string;
};

export type GenerateBriefInput = {
  answers?: BriefAnswer[];
};

export function useGenerateBrief(projectId: string) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<BriefRow, Error, GenerateBriefInput>({
    mutationFn: async ({ answers }) => {
      if (!session) {
        throw new Error('NOT_AUTHENTICATED');
      }

      const body = answers && answers.length > 0 ? { projectId, answers } : { projectId };

      const data = await callEdgeFunction<{ brief: BriefRow }>(
        'generate-project-brief',
        body,
        session.access_token,
      );

      const parsed = BriefRowSchema.safeParse(data.brief);

      if (!parsed.success) {
        logger.error('brief_invalid_shape_after_generate', { issues: parsed.error.issues });
        throw new Error('BRIEF_INVALID_SHAPE');
      }

      return parsed.data;
    },
    onSuccess: (brief) => {
      // Seed the existing-brief cache so the page can swap to BriefView without a refetch.
      queryClient.setQueryData(briefQueryKey(projectId), brief);
      // Dashboard sort order changes when updated_at advances.
      queryClient.invalidateQueries({ queryKey: projectsQueryKey });
    },
  });
}
