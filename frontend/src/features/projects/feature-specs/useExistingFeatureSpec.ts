import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import { FeatureSpecContentSchema } from '@shared/schemas/feature-spec';

export const FeatureSpecRowSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  chunk_id: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  content_json: FeatureSpecContentSchema,
  agent_prompts: z.unknown(),
  version: z.number().int().min(1),
  is_final: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type FeatureSpecRow = z.infer<typeof FeatureSpecRowSchema>;

export const featureSpecQueryKey = (chunkId: string) => ['feature-spec', chunkId] as const;

export function useExistingFeatureSpec(chunkId: string) {
  return useQuery<FeatureSpecRow | null>({
    queryKey: featureSpecQueryKey(chunkId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feature_specs')
        .select('*')
        .eq('chunk_id', chunkId)
        .maybeSingle();

      if (error) {
        logger.error('feature_spec_fetch_failed', { code: error.code, message: error.message });
        throw new Error('FEATURE_SPEC_FETCH_FAILED');
      }

      if (!data) {
        return null;
      }

      const parsed = FeatureSpecRowSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('feature_spec_invalid_shape', { issues: parsed.error.issues });
        throw new Error('FEATURE_SPEC_INVALID_SHAPE');
      }

      return parsed.data;
    },
    staleTime: 10 * 1000,
  });
}
