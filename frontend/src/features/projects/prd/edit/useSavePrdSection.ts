import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { useAuth } from '@/features/auth/useAuth';
import { projectsQueryKey } from '@/features/dashboard/useProjects';
import { projectQueryKey } from '@/features/projects/layout/useProjectQuery';
import { callEdgeFunction } from '@/lib/edge';
import { logger } from '@/lib/logger';
import { PrdContentSchema, type PrdContent } from '@shared/schemas/prd';

import { prdQueryKey, type PrdRow } from '../useExistingPrd';

const SavePrdContentResultSchema = z.object({
  id: z.string().uuid(),
  version: z.number().int().min(1),
  is_final: z.boolean(),
  updated_at: z.string(),
});

export type SavePrdContentResult = z.infer<typeof SavePrdContentResultSchema>;

export function useSavePrdSection(projectId: string) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<SavePrdContentResult, Error, PrdContent>({
    mutationFn: async (newContentJson) => {
      if (!session) {
        throw new Error('NOT_AUTHENTICATED');
      }

      const parsedContent = PrdContentSchema.safeParse(newContentJson);

      if (!parsedContent.success) {
        logger.error('prd_save_invalid_local', { issues: parsedContent.error.issues });
        throw new Error('PRD_SAVE_INVALID');
      }

      const data = await callEdgeFunction<SavePrdContentResult>(
        'save-prd-content',
        { projectId, contentJson: parsedContent.data },
        session.access_token,
      );
      const parsedResult = SavePrdContentResultSchema.safeParse(data);

      if (!parsedResult.success) {
        logger.error('prd_save_response_invalid_shape', { issues: parsedResult.error.issues });
        throw new Error('PRD_SAVE_RESPONSE_INVALID');
      }

      return parsedResult.data;
    },
    onSuccess: (result, contentJson) => {
      queryClient.setQueryData<PrdRow | null>(prdQueryKey(projectId), (current) => {
        if (!current) return current;

        return {
          ...current,
          content_json: contentJson,
          version: result.version,
          is_final: result.is_final,
          updated_at: result.updated_at,
        };
      });
      queryClient.invalidateQueries({ queryKey: projectQueryKey(projectId) });
      queryClient.invalidateQueries({ queryKey: projectsQueryKey });
    },
  });
}
