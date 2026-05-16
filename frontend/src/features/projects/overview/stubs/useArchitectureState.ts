import { useExistingArchitecture } from '@/features/projects/architecture/useExistingArchitecture';

export type ArchitectureState = {
  isLoading: boolean;
  isError: boolean;
  exists: boolean;
  approved: boolean;
  retry: () => void;
};

export function useArchitectureState(projectId: string): ArchitectureState {
  const query = useExistingArchitecture(projectId);

  return {
    isLoading: query.isPending,
    isError: query.isError,
    exists: Boolean(query.data),
    approved: query.data?.is_final === true,
    retry: () => {
      void query.refetch();
    },
  };
}
