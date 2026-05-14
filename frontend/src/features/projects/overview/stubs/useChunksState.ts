// TODO(chunk-18): Replace this stub with chunk and progress queries across Chunks 18, 19, and 22.
// Future query key: ['overview', 'chunks', projectId].
export type ChunksState = {
  exists: boolean;
  hasInProgress: boolean;
  hasIncomplete: boolean;
  allDone: boolean;
  total: number;
  completed: number;
  inProgress: number;
  open: number;
};

export function useChunksState(projectId: string): { data: ChunksState } {
  void projectId;

  return {
    data: {
      exists: false,
      hasInProgress: false,
      hasIncomplete: false,
      allDone: false,
      total: 0,
      completed: 0,
      inProgress: 0,
      open: 0,
    },
  };
}
