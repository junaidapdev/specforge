import { useEffect, useRef } from 'react';

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
  const projectId = project.id;
  const prdQuery = useExistingPrd(projectId);
  const architectureQuery = useExistingArchitecture(projectId);
  const generate = useGenerateArchitecture(projectId);
  const hasFiredRef = useRef(false);

  useEffect(() => {
    if (hasFiredRef.current) return;
    if (prdQuery.isPending || architectureQuery.isPending) return;
    if (architectureQuery.data) return;
    if (!prdQuery.data || prdQuery.data.is_final !== true) return;
    if (generate.isPending || generate.isSuccess || generate.isError) return;

    hasFiredRef.current = true;
    generate.mutate({ projectId });
    // We only react to read-side query resolution. The mutation-state checks
    // above keep this idempotent, and the ref prevents a StrictMode double-fire.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prdQuery.isPending, architectureQuery.isPending, prdQuery.data, architectureQuery.data]);

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
