import { useChunks } from '@/features/projects/chunks/useChunks';

export type ChunksState = {
  isLoading: boolean;
  isError: boolean;
  exists: boolean;
  hasInProgress: boolean;
  hasIncomplete: boolean;
  allDone: boolean;
  total: number;
  completed: number;
  inProgress: number;
  open: number;
  retry: () => void;
};

export function useChunksState(projectId: string): { data: ChunksState } {
  const query = useChunks(projectId);
  const chunks = query.data ?? [];
  const completed = chunks.filter((chunk) => chunk.status === 'done').length;
  const inProgress = chunks.filter((chunk) => chunk.status === 'in_progress').length;
  const open = chunks.filter((chunk) => chunk.status !== 'done').length;

  return {
    data: {
      isLoading: query.isPending,
      isError: query.isError,
      exists: chunks.length > 0,
      hasInProgress: inProgress > 0,
      hasIncomplete: open > 0,
      allDone: chunks.length > 0 && open === 0,
      total: chunks.length,
      completed,
      inProgress,
      open,
      retry: () => {
        void query.refetch();
      },
    },
  };
}
