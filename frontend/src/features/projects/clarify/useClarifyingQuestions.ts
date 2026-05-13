import { useMutation } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/useAuth';
import { callEdgeFunction } from '@/lib/edge';
import { logger } from '@/lib/logger';
import {
  ClarifyingQuestionsResponseSchema,
  type ClarifyingQuestion,
} from '@shared/schemas/clarification';

export function useClarifyingQuestions(projectId: string) {
  const { session } = useAuth();

  return useMutation<ClarifyingQuestion[], Error>({
    mutationFn: async () => {
      if (!session) {
        throw new Error('NOT_AUTHENTICATED');
      }

      const data = await callEdgeFunction<{ questions: ClarifyingQuestion[] }>(
        'generate-clarifying-questions',
        { projectId },
        session.access_token,
      );
      const parsed = ClarifyingQuestionsResponseSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('clarification_invalid_shape', { issues: parsed.error.issues });
        throw new Error('CLARIFICATION_INVALID_SHAPE');
      }

      return parsed.data.questions;
    },
  });
}
