import { CONTEXT_DOC_ORDER, CONTEXT_DOC_TOTAL } from '@/features/projects/context-files/doc-config';
import { useAllContextFiles } from '@/features/projects/context-files/useAllContextFiles';

export type ContextFilesState = {
  isLoading: boolean;
  isError: boolean;
  exists: boolean;
  presentCount: number;
  approvedCount: number;
  total: number;
  allApproved: boolean;
  retry: () => void;
};

export function useContextFilesState(projectId: string): ContextFilesState {
  const query = useAllContextFiles(projectId);
  const docs = query.data ?? {};
  const presentCount = CONTEXT_DOC_ORDER.filter((type) => docs[type]).length;
  const approvedCount = CONTEXT_DOC_ORDER.filter((type) => docs[type]?.is_final).length;

  return {
    isLoading: query.isPending,
    isError: query.isError,
    exists: presentCount === CONTEXT_DOC_TOTAL,
    presentCount,
    approvedCount,
    total: CONTEXT_DOC_TOTAL,
    allApproved: approvedCount === CONTEXT_DOC_TOTAL,
    retry: () => {
      void query.refetch();
    },
  };
}
