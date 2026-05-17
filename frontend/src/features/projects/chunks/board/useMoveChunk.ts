import { useMutation, useQueryClient } from '@tanstack/react-query';

import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import type { ChunkStatus } from '@shared/schemas/chunks';

import { chunksQueryKey, type ChunkRow } from '../useChunks';

export type MoveChunkInput = {
  chunkId: string;
  newStatus: ChunkStatus;
  newPosition: number;
};

type MoveChunkContext = {
  previous?: ChunkRow[];
};

export function useMoveChunk(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, MoveChunkInput, MoveChunkContext>({
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
      await queryClient.cancelQueries({ queryKey: chunksQueryKey(projectId) });
      const previous = queryClient.getQueryData<ChunkRow[]>(chunksQueryKey(projectId));

      if (previous) {
        queryClient.setQueryData(chunksQueryKey(projectId), applyMoveLocally(previous, input));
      }

      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(chunksQueryKey(projectId), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: chunksQueryKey(projectId) });
    },
  });
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
