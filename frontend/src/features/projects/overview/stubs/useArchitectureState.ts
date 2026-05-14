// TODO(chunk-15): Replace this stub with a React Query read for the architecture document.
// Future query key: ['overview', 'architecture', projectId].
export type ArchitectureState = {
  exists: boolean;
  approved: boolean;
};

export function useArchitectureState(projectId: string): ArchitectureState {
  void projectId;

  return { exists: false, approved: false };
}
