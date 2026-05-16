import { useEffect, useRef } from 'react';

import { useExistingArchitecture } from '@/features/projects/architecture/useExistingArchitecture';
import { useProject } from '@/features/projects/layout/useProject';
import type { ContextFileType } from '@shared/schemas/context-files';

import { ContextFilesError } from './ContextFilesError';
import { ContextFilesGatingState } from './ContextFilesGatingState';
import { ContextFilesPending } from './ContextFilesPending';
import { ContextFilesView } from './ContextFilesView';
import { CONTEXT_DOC_ORDER } from './doc-config';
import { useAllContextFiles, type ContextFileRow } from './useAllContextFiles';
import { useGenerateContextFiles } from './useGenerateContextFiles';

const ARCHITECTURE_NOT_APPROVED_CODE = 'ARCHITECTURE_NOT_APPROVED';

function isArchitectureGateError(error: Error | null): boolean {
  return error?.message === ARCHITECTURE_NOT_APPROVED_CODE;
}

function getCompleteDocs(
  docs: Partial<Record<ContextFileType, ContextFileRow>> | undefined,
): Record<ContextFileType, ContextFileRow> | null {
  if (!docs) {
    return null;
  }

  const complete = {} as Record<ContextFileType, ContextFileRow>;

  for (const type of CONTEXT_DOC_ORDER) {
    const doc = docs[type];

    if (!doc) {
      return null;
    }

    complete[type] = doc;
  }

  return complete;
}

export function ContextFilesPage() {
  const { project } = useProject();
  const projectId = project.id;
  const architectureQuery = useExistingArchitecture(projectId);
  const filesQuery = useAllContextFiles(projectId);
  const generate = useGenerateContextFiles();
  const lastGeneratedProjectRef = useRef<string | null>(null);
  const completeDocs = getCompleteDocs(filesQuery.data);
  const allFilesExist = Boolean(completeDocs);
  const architectureApproved = architectureQuery.data?.is_final === true;

  useEffect(() => {
    if (lastGeneratedProjectRef.current === projectId) return;
    if (architectureQuery.isPending || filesQuery.isPending) return;
    if (architectureQuery.isError || filesQuery.isError) return;
    if (allFilesExist) return;
    if (!architectureApproved) return;
    if (generate.isPending) return;

    lastGeneratedProjectRef.current = projectId;
    generate.mutate({ projectId });
    // We only react to read-side query resolution. Mutation state and the
    // project-scoped ref keep the first-visit auto-fire idempotent in StrictMode.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    projectId,
    architectureApproved,
    architectureQuery.isPending,
    architectureQuery.isError,
    filesQuery.isPending,
    filesQuery.isError,
    allFilesExist,
  ]);

  if (architectureQuery.isPending || filesQuery.isPending) {
    return <ContextFilesPending />;
  }

  if (architectureQuery.isError) {
    return (
      <ContextFilesError
        onRetry={() => {
          void architectureQuery.refetch();
        }}
      />
    );
  }

  if (filesQuery.isError) {
    return (
      <ContextFilesError
        onRetry={() => {
          void filesQuery.refetch();
        }}
      />
    );
  }

  if (completeDocs) {
    return <ContextFilesView projectId={projectId} docs={completeDocs} />;
  }

  if (!architectureApproved || isArchitectureGateError(generate.error)) {
    return <ContextFilesGatingState projectId={projectId} />;
  }

  if (generate.isError) {
    return (
      <ContextFilesError
        onRetry={() => {
          generate.mutate({ projectId });
        }}
      />
    );
  }

  return <ContextFilesPending />;
}
