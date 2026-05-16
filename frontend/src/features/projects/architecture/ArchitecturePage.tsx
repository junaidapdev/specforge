import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import { useProject } from '@/features/projects/layout/useProject';
import { useExistingPrd } from '@/features/projects/prd/useExistingPrd';

import { ArchitectureError } from './ArchitectureError';
import { ArchitectureGatingState } from './ArchitectureGatingState';
import { ArchitecturePending } from './ArchitecturePending';
import { ArchitectureView } from './ArchitectureView';
import { useExistingArchitecture } from './useExistingArchitecture';
import { useGenerateArchitecture } from './useGenerateArchitecture';

const PRD_NOT_APPROVED_CODE = 'PRD_NOT_APPROVED';

function isPrdGateError(error: Error | null): boolean {
  return error?.message === PRD_NOT_APPROVED_CODE;
}

export function ArchitecturePage() {
  const { project } = useProject();
  const location = useLocation();
  const projectId = project.id;
  const prdQuery = useExistingPrd(projectId);
  const architectureQuery = useExistingArchitecture(projectId);
  const generate = useGenerateArchitecture(projectId);
  const lastGeneratedProjectRef = useRef<string | null>(null);

  useEffect(() => {
    if (lastGeneratedProjectRef.current === projectId) return;
    if (prdQuery.isPending || architectureQuery.isPending) return;
    if (architectureQuery.data) return;
    if (!prdQuery.data || prdQuery.data.is_final !== true) return;
    if (generate.isPending) return;

    lastGeneratedProjectRef.current = projectId;
    generate.mutate({ projectId });
    // We only react to read-side query resolution. The mutation-state checks
    // above keep this idempotent per project, and the ref prevents a StrictMode
    // double-fire while still allowing generation after project switches.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    projectId,
    prdQuery.isPending,
    architectureQuery.isPending,
    prdQuery.data,
    architectureQuery.data,
  ]);

  useEffect(() => {
    if (location.hash !== '#decisions' || !architectureQuery.data) return;

    document.getElementById('decisions')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [architectureQuery.data, location.hash]);

  if (prdQuery.isPending || architectureQuery.isPending) {
    return <ArchitecturePending />;
  }

  if (prdQuery.isError) {
    return (
      <ArchitectureError
        onRetry={() => {
          void prdQuery.refetch();
        }}
      />
    );
  }

  if (architectureQuery.isError) {
    return (
      <ArchitectureError
        onRetry={() => {
          void architectureQuery.refetch();
        }}
      />
    );
  }

  if (architectureQuery.data) {
    return <ArchitectureView architecture={architectureQuery.data} projectId={projectId} />;
  }

  if (!prdQuery.data || prdQuery.data.is_final !== true || isPrdGateError(generate.error)) {
    return <ArchitectureGatingState projectId={projectId} />;
  }

  if (generate.isError) {
    return (
      <ArchitectureError
        onRetry={() => {
          generate.mutate({ projectId });
        }}
      />
    );
  }

  return <ArchitecturePending />;
}
