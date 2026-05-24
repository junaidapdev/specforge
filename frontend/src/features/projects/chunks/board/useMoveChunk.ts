import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { projectsQueryKey } from '@/features/dashboard/useProjects';
import { projectQueryKey } from '@/features/projects/layout/useProjectQuery';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import type { Project, ProjectStatus } from '@/types/project';
import type { ChunkStatus } from '@shared/schemas/chunks';

import { chunkQueryKey } from '../useChunk';
import { chunksQueryKey, type ChunkRow } from '../useChunks';

export type MoveChunkInput = {
  chunkId: string;
  newStatus: ChunkStatus;
  newPosition: number;
};

type MoveChunkContext = {
  previous?: ChunkRow[];
  expectedAdvance: StatusAdvancement | null;
};

export type StatusAdvancement = Extract<ProjectStatus, 'building' | 'completed'>;

export function useMoveChunk(projectId: string) {
  const queryClient = useQueryClient();
  const [advancedStatus, setAdvancedStatus] = useState<StatusAdvancement | null>(null);

  const mutation = useMutation<void, Error, MoveChunkInput, MoveChunkContext>({
    mutationFn: async (input) => {
      const { error } = await supabase.rpc('move_chunk', {
        p_chunk_id: input.chunkId,
        p_new_status: input.newStatus,
        p_new_position: input.newPosition,
      });

      if (error) {
        logger.error('chunk_move_failed', { code: error.code, chunkId: input.chunkId });
        throw new Error('CHUNK_MOVE_FAILED');
      }
    },
    onMutate: async (input) => {
      setAdvancedStatus(null);
      await queryClient.cancelQueries({ queryKey: chunksQueryKey(projectId) });
      const previous = queryClient.getQueryData<ChunkRow[]>(chunksQueryKey(projectId));
      const project = queryClient.getQueryData<Project | null>(projectQueryKey(projectId));
      const expectedAdvance = predictStatusAdvance(project, previous, input);

      if (previous) {
        queryClient.setQueryData(chunksQueryKey(projectId), applyMoveLocally(previous, input));
      }

      return { previous, expectedAdvance };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(chunksQueryKey(projectId), context.previous);
      }
    },
    onSuccess: (_data, input, context) => {
      if (context.expectedAdvance) {
        setAdvancedStatus(context.expectedAdvance);
        queryClient.setQueryData<Project | null | undefined>(
          projectQueryKey(projectId),
          (current) =>
            current
              ? {
                  ...current,
                  status: context.expectedAdvance ?? current.status,
                }
              : current,
        );
      }

      queryClient.invalidateQueries({ queryKey: chunkQueryKey(input.chunkId) });
      queryClient.invalidateQueries({ queryKey: projectQueryKey(projectId) });
      queryClient.invalidateQueries({ queryKey: projectsQueryKey });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: chunksQueryKey(projectId) });
    },
  });

  return { ...mutation, advancedStatus };
}

export function applyMoveLocally(chunks: ChunkRow[], input: MoveChunkInput): ChunkRow[] {
  const movedChunk = chunks.find((chunk) => chunk.id === input.chunkId);

  if (!movedChunk) {
    return chunks;
  }

  const sortedChunks = [...chunks].sort((left, right) => left.position - right.position);
  const remainingChunks = sortedChunks.filter((chunk) => chunk.id !== input.chunkId);
  const boundedPosition = Math.max(0, Math.min(input.newPosition, remainingChunks.length));
  const nextChunk: ChunkRow = {
    ...movedChunk,
    status: input.newStatus,
    position: boundedPosition,
  };
  const reordered = [...remainingChunks];

  reordered.splice(boundedPosition, 0, nextChunk);

  return reordered.map((chunk, position) => ({
    ...chunk,
    position,
  }));
}

export function predictStatusAdvance(
  project: Project | null | undefined,
  chunks: ChunkRow[] | undefined,
  input: MoveChunkInput,
): StatusAdvancement | null {
  if (!project || !chunks?.some((chunk) => chunk.id === input.chunkId)) {
    return null;
  }

  const nextChunks = applyMoveLocally(chunks, input);

  if (
    project.status === 'ready_to_build' &&
    nextChunks.some((chunk) => chunk.status === 'in_progress')
  ) {
    return 'building';
  }

  if (
    project.status === 'building' &&
    nextChunks.length > 0 &&
    nextChunks.every((chunk) => chunk.status === 'done')
  ) {
    return 'completed';
  }

  return null;
}
