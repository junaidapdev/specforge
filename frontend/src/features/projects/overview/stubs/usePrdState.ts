// TODO(chunk-13): Replace this stub with a React Query read for the PRD document.
// Future query key: ['overview', 'prd', projectId].
export type PrdState = {
  exists: boolean;
  approved: boolean;
};

export function usePrdState(projectId: string): PrdState {
  void projectId;

  return { exists: false, approved: false };
}
