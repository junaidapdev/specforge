import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import {
  CONTEXT_FILE_TYPES,
  ContextFileTypeSchema,
  type ContextFileType,
} from '@shared/schemas/context-files';

const ContextFileRowSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  type: ContextFileTypeSchema,
  title: z.string(),
  content: z.string(),
  content_json: z.null(),
  version: z.number().int().min(1),
  is_final: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ContextFileRow = z.infer<typeof ContextFileRowSchema>;
export type ContextFilesByType = Partial<Record<ContextFileType, ContextFileRow>>;

export const allContextFilesQueryKey = (projectId: string) =>
  ['context-files', 'all', projectId] as const;

export function useAllContextFiles(projectId: string) {
  return useQuery<ContextFilesByType>({
    queryKey: allContextFilesQueryKey(projectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_documents')
        .select('*')
        .eq('project_id', projectId)
        .in('type', [...CONTEXT_FILE_TYPES]);

      if (error) {
        logger.error('context_files_fetch_failed', { code: error.code, message: error.message });
        throw new Error('CONTEXT_FILES_FETCH_FAILED');
      }

      const result: ContextFilesByType = {};

      for (const row of data ?? []) {
        const parsed = ContextFileRowSchema.safeParse(row);

        if (!parsed.success) {
          logger.error('context_file_invalid_shape', { issues: parsed.error.issues });
          throw new Error('CONTEXT_FILE_INVALID_SHAPE');
        }

        result[parsed.data.type] = parsed.data;
      }

      return result;
    },
    staleTime: 10 * 1000,
  });
}
