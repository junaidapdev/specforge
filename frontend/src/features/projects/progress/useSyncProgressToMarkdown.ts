import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { allContextFilesQueryKey } from '@/features/projects/context-files/useAllContextFiles';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import type { Project } from '@/types/project';

import type { ChunkRow } from '../chunks/useChunks';
import { renderProgressTrackerMarkdown } from './progress-tracker-markdown';

type SyncProgressInput = {
  project: Pick<Project, 'name' | 'status'>;
  chunks: ChunkRow[];
};

const SyncProgressResultSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('progress_tracker'),
  version: z.number().int().min(1),
  is_final: z.boolean(),
  updated_at: z.string(),
});

type SyncProgressResult = z.infer<typeof SyncProgressResultSchema>;

export function useSyncProgressToMarkdown(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<SyncProgressResult, Error, SyncProgressInput>({
    mutationFn: async ({ project, chunks }) => {
      const content = renderProgressTrackerMarkdown({
        projectName: project.name,
        projectStatus: project.status,
        chunks,
        generatedAt: new Date().toISOString(),
      });
      const { data, error } = await supabase.rpc('update_context_file_content', {
        p_project_id: projectId,
        p_type: 'progress_tracker',
        p_content: content,
      });

      if (error) {
        logger.error('progress_sync_failed', { code: error.code, projectId });
        throw new Error('PROGRESS_SYNC_FAILED');
      }

      const parsed = SyncProgressResultSchema.safeParse(data);

      if (!parsed.success) {
        const issues = parsed.error.issues.map((issue) => ({
          code: issue.code,
          path: issue.path.map(String).join('.'),
        }));
        logger.error('progress_sync_invalid_shape', {
          issueCount: issues.length,
          issues,
          projectId,
        });
        throw new Error('PROGRESS_SYNC_INVALID_SHAPE');
      }

      return parsed.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: allContextFilesQueryKey(projectId) });
    },
  });
}
