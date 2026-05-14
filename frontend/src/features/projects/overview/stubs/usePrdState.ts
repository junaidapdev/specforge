import { useExistingPrd } from '@/features/projects/prd/useExistingPrd';

export type PrdState = {
  isLoading: boolean;
  isError: boolean;
  exists: boolean;
  approved: boolean;
  retry: () => void;
};

export function usePrdState(projectId: string): PrdState {
  const query = useExistingPrd(projectId);

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
