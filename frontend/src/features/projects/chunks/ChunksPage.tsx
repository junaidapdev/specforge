import { useEffect, useRef } from 'react';

import { useProject } from '@/features/projects/layout/useProject';
import { useContextFilesState } from '@/features/projects/overview/stubs/useContextFilesState';

import { ChunksError } from './ChunksError';
import { ChunksGatingState } from './ChunksGatingState';
import { ChunksListView } from './ChunksListView';
import { ChunksPending } from './ChunksPending';
import { useChunks } from './useChunks';
import { useGenerateChunks } from './useGenerateChunks';

const CONTEXT_FILES_MISSING_CODE = 'CONTEXT_FILES_MISSING';

function isContextFilesGateError(error: Error | null): boolean {
  return error?.message === CONTEXT_FILES_MISSING_CODE;
}

export function ChunksPage() {
  const { project } = useProject();
  const projectId = project.id;
  const contextFilesState = useContextFilesState(projectId);
  const chunksQuery = useChunks(projectId);
  const generate = useGenerateChunks();
  const lastGeneratedProjectRef = useRef<string | null>(null);
  const chunks = chunksQuery.data ?? [];
  const chunksExist = chunks.length > 0;

  useEffect(() => {
    if (lastGeneratedProjectRef.current === projectId) return;
    if (contextFilesState.isLoading || chunksQuery.isPending) return;
    if (contextFilesState.isError || chunksQuery.isError) return;
    if (chunksExist) return;
    if (!contextFilesState.exists) return;
    if (generate.isPending) return;

    lastGeneratedProjectRef.current = projectId;
    generate.mutate({ projectId });
    // We only react to read-side query resolution. The mutation state and
    // project-scoped ref keep first-visit generation idempotent in StrictMode.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    projectId,
    contextFilesState.isLoading,
    contextFilesState.isError,
    contextFilesState.exists,
    chunksQuery.isPending,
    chunksQuery.isError,
    chunksExist,
  ]);

  if (contextFilesState.isLoading || chunksQuery.isPending) {
    return <ChunksPending />;
  }

  if (contextFilesState.isError) {
    return <ChunksError onRetry={contextFilesState.retry} />;
  }

  if (chunksQuery.isError) {
    return (
      <ChunksError
        onRetry={() => {
          void chunksQuery.refetch();
        }}
      />
    );
  }

  if (chunksExist) {
    return (
      <ChunksListView
        projectId={projectId}
        chunks={chunks}
        statusAdvanced={Boolean(generate.data?.statusAdvanced)}
      />
    );
  }

  if (!contextFilesState.exists || isContextFilesGateError(generate.error)) {
    return <ChunksGatingState projectId={projectId} />;
  }

  if (generate.isError) {
    return (
      <ChunksError
        onRetry={() => {
          generate.mutate({ projectId });
        }}
      />
    );
  }

  return <ChunksPending />;
}
