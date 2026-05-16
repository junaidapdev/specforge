import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { useAuth } from '@/features/auth/useAuth';
import { projectsQueryKey } from '@/features/dashboard/useProjects';
import { projectQueryKey } from '@/features/projects/layout/useProjectQuery';
import { callEdgeFunction } from '@/lib/edge';
import { logger } from '@/lib/logger';
import { ArchitectureContentSchema, type ArchitectureContent } from '@shared/schemas/architecture';

import { architectureQueryKey, type ArchitectureRow } from '../useExistingArchitecture';
import {
  setArchitectureSectionValue,
  type ArchitectureSectionUpdate,
} from './section-config';

const SaveArchitectureContentResultSchema = z.object({
  id: z.string().uuid(),
  version: z.number().int().min(1),
  is_final: z.boolean(),
  updated_at: z.string(),
});

export type SaveArchitectureContentResult = z.infer<
  typeof SaveArchitectureContentResultSchema
>;
type SaveArchitectureSectionResult = {
  meta: SaveArchitectureContentResult;
  contentJson: ArchitectureContent;
};

export function useSaveArchitectureSection(projectId: string) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<SaveArchitectureSectionResult, Error, ArchitectureSectionUpdate>({
    mutationKey: ['architecture-section-save', projectId],
    scope: { id: `architecture-section-save:${projectId}` },
    mutationFn: async (update) => {
      if (!session) {
        throw new Error('NOT_AUTHENTICATED');
      }

      const currentArchitecture = queryClient.getQueryData<ArchitectureRow | null>(
        architectureQueryKey(projectId),
      );

      if (!currentArchitecture) {
        throw new Error('ARCHITECTURE_SAVE_BASE_MISSING');
      }

      const nextContentJson = setArchitectureSectionValue(
        currentArchitecture.content_json,
        update.sectionKey,
        update.value,
      );
      const parsedContent = ArchitectureContentSchema.safeParse(nextContentJson);

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

      return { meta: parsedResult.data, contentJson: parsedContent.data };
    },
    onSuccess: ({ meta, contentJson }) => {
      queryClient.setQueryData<ArchitectureRow | null>(
        architectureQueryKey(projectId),
        (current) => {
          if (!current) return current;

          return {
            ...current,
            content_json: contentJson,
            version: meta.version,
            is_final: meta.is_final,
            updated_at: meta.updated_at,
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: projectQueryKey(projectId) });
      queryClient.invalidateQueries({ queryKey: projectsQueryKey });
    },
  });
}
