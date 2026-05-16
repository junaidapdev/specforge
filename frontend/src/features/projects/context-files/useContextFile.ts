import type { ContextFileType } from '@shared/schemas/context-files';

import { useAllContextFiles } from './useAllContextFiles';

export function useContextFile(projectId: string, type: ContextFileType) {
  const all = useAllContextFiles(projectId);

  return {
    isPending: all.isPending,
    isError: all.isError,
    error: all.error,
    refetch: all.refetch,
    data: all.data?.[type],
  };
}
