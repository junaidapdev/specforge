import { useMutation } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/useAuth';
import { callEdgeFunction } from '@/lib/edge';
import { logger } from '@/lib/logger';
import {
  RegenerateContextDocOutputSchema,
  type RegenerateContextDocInput,
  type RegenerateContextDocOutput,
} from '@shared/schemas/context-files';

export function useRegenerateContextDoc(projectId: string) {
  const { session } = useAuth();

  return useMutation<RegenerateContextDocOutput, Error, RegenerateContextDocInput>({
    mutationFn: async (input) => {
      if (!session) {
        throw new Error('NOT_AUTHENTICATED');
      }

      const data = await callEdgeFunction<RegenerateContextDocOutput>(
        'regenerate-context-doc',
        { ...input, projectId },
        session.access_token,
      );
      const parsed = RegenerateContextDocOutputSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('regen_context_doc_invalid_local', { issues: parsed.error.issues });
        throw new Error('REGEN_CONTEXT_DOC_INVALID');
      }

      return parsed.data;
    },
  });
}
