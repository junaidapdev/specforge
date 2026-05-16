import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import {
  ContextFileTypeSchema,
  type ContextFileType,
} from '@shared/schemas/context-files';

import {
  allContextFilesQueryKey,
  type ContextFilesByType,
} from './useAllContextFiles';

export type SaveContextFileInput = {
  type: ContextFileType;
  content: string;
};

const SaveContextFileResultSchema = z.object({
  id: z.string().uuid(),
  type: ContextFileTypeSchema,
  version: z.number().int().min(1),
  is_final: z.boolean(),
  updated_at: z.string(),
});

type SaveContextFileResult = z.infer<typeof SaveContextFileResultSchema>;

export function useSaveContextFile(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<SaveContextFileResult, Error, SaveContextFileInput>({
    mutationFn: async ({ type, content }) => {
      const { data, error } = await supabase.rpc('update_context_file_content', {
        p_project_id: projectId,
        p_type: type,
        p_content: content,
      });

      if (error) {
        logger.error('context_file_save_failed', { code: error.code, type });
        throw new Error('CONTEXT_FILE_SAVE_FAILED');
      }

      const parsed = SaveContextFileResultSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('context_file_save_invalid_shape', { issues: parsed.error.issues, type });
        throw new Error('CONTEXT_FILE_SAVE_INVALID_SHAPE');
      }

      return parsed.data;
    },
    onSuccess: (meta, input) => {
      queryClient.setQueryData<ContextFilesByType | undefined>(
        allContextFilesQueryKey(projectId),
        (current) => {
          const existing = current?.[input.type];

          if (!existing) {
            return current;
          }

          return {
            ...current,
            [input.type]: {
              ...existing,
              content: input.content,
              version: meta.version,
              is_final: meta.is_final,
              updated_at: meta.updated_at,
            },
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: allContextFilesQueryKey(projectId) });
    },
  });
}
