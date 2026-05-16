import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { useAuth } from '@/features/auth/useAuth';
import { projectsQueryKey } from '@/features/dashboard/useProjects';
import { projectQueryKey } from '@/features/projects/layout/useProjectQuery';
import { callEdgeFunction } from '@/lib/edge';
import { logger } from '@/lib/logger';
import { ArchitectureContentSchema, type ArchitectureContent } from '@shared/schemas/architecture';

import { architectureQueryKey, type ArchitectureRow } from '../useExistingArchitecture';

const SaveArchitectureContentResultSchema = z.object({
  id: z.string().uuid(),
  version: z.number().int().min(1),
  is_final: z.boolean(),
  updated_at: z.string(),
});

export type SaveArchitectureContentResult = z.infer<
  typeof SaveArchitectureContentResultSchema
>;

export function useSaveArchitectureSection(projectId: string) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<SaveArchitectureContentResult, Error, ArchitectureContent>({
    mutationFn: async (newContentJson) => {
      if (!session) {
        throw new Error('NOT_AUTHENTICATED');
      }

      const parsedContent = ArchitectureContentSchema.safeParse(newContentJson);

      if (!parsedContent.success) {
        logger.error('architecture_save_invalid_local', { issues: parsedContent.error.issues });
        throw new Error('ARCHITECTURE_SAVE_INVALID');
      }

      const data = await callEdgeFunction<SaveArchitectureContentResult>(
        'save-architecture-content',
        { projectId, contentJson: parsedContent.data },
        session.access_token,
      );
      const parsedResult = SaveArchitectureContentResultSchema.safeParse(data);

      if (!parsedResult.success) {
        logger.error('architecture_save_response_invalid_shape', {
          issues: parsedResult.error.issues,
        });
        throw new Error('ARCHITECTURE_SAVE_RESPONSE_INVALID');
      }

      return parsedResult.data;
    },
    onSuccess: (result, contentJson) => {
      queryClient.setQueryData<ArchitectureRow | null>(
        architectureQueryKey(projectId),
        (current) => {
          if (!current) return current;

          return {
            ...current,
            content_json: contentJson,
            version: result.version,
            is_final: result.is_final,
            updated_at: result.updated_at,
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: projectQueryKey(projectId) });
      queryClient.invalidateQueries({ queryKey: projectsQueryKey });
    },
  });
}
