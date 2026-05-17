import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { useAuth } from '@/features/auth/useAuth';
import { callEdgeFunction } from '@/lib/edge';
import { logger } from '@/lib/logger';
import {
  FeatureSpecContentSchema,
  type FeatureSpecContent,
  type FeatureSpecSectionKey,
} from '@shared/schemas/feature-spec';

import {
  featureSpecQueryKey,
  type FeatureSpecRow,
} from '../useExistingFeatureSpec';

const SaveFeatureSpecContentResultSchema = z.object({
  id: z.string().uuid(),
  version: z.number().int().min(1),
  is_final: z.boolean(),
  updated_at: z.string(),
});

export type SaveFeatureSpecContentResult = z.infer<typeof SaveFeatureSpecContentResultSchema>;

export type FeatureSpecSectionUpdate = {
  sectionKey: FeatureSpecSectionKey;
  value: string;
};

type SaveFeatureSpecSectionResult = {
  meta: SaveFeatureSpecContentResult;
  contentJson: FeatureSpecContent;
};

export function useSaveFeatureSpecSection(chunkId: string) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<SaveFeatureSpecSectionResult, Error, FeatureSpecSectionUpdate>({
    mutationKey: ['feature-spec-section-save', chunkId],
    scope: { id: `feature-spec-section-save:${chunkId}` },
    mutationFn: async (update) => {
      if (!session) {
        throw new Error('NOT_AUTHENTICATED');
      }

      const currentSpec = queryClient.getQueryData<FeatureSpecRow | null>(
        featureSpecQueryKey(chunkId),
      );

      if (!currentSpec) {
        throw new Error('FEATURE_SPEC_SAVE_BASE_MISSING');
      }

      const nextContentJson = {
        ...currentSpec.content_json,
        [update.sectionKey]: update.value,
      };
      const parsedContent = FeatureSpecContentSchema.safeParse(nextContentJson);

      if (!parsedContent.success) {
        logger.error('feature_spec_save_invalid_local', {
          issues: parsedContent.error.issues,
        });
        throw new Error('FEATURE_SPEC_SAVE_INVALID');
      }

      const data = await callEdgeFunction<SaveFeatureSpecContentResult>(
        'save-feature-spec-content',
        { chunkId, contentJson: parsedContent.data },
        session.access_token,
      );
      const parsedResult = SaveFeatureSpecContentResultSchema.safeParse(data);

      if (!parsedResult.success) {
        logger.error('feature_spec_save_response_invalid_shape', {
          issues: parsedResult.error.issues,
        });
        throw new Error('FEATURE_SPEC_SAVE_RESPONSE_INVALID');
      }

      return { meta: parsedResult.data, contentJson: parsedContent.data };
    },
    onSuccess: ({ meta, contentJson }) => {
      queryClient.setQueryData<FeatureSpecRow | null>(
        featureSpecQueryKey(chunkId),
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
    },
  });
}
