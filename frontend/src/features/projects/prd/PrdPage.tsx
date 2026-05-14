import { useEffect, useRef } from 'react';

import { useExistingBrief } from '@/features/projects/brief/useExistingBrief';
import { useProject } from '@/features/projects/layout/useProject';

import { PrdError } from './PrdError';
import { PrdGatingState } from './PrdGatingState';
import { PrdPending } from './PrdPending';
import { PrdView } from './PrdView';
import { useExistingPrd } from './useExistingPrd';
import { useGeneratePrd } from './useGeneratePrd';

const BRIEF_NOT_APPROVED_CODE = 'BRIEF_NOT_APPROVED';

function isBriefGateError(error: Error | null): boolean {
  return error?.message === BRIEF_NOT_APPROVED_CODE;
}

export function PrdPage() {
  const { project } = useProject();
  const projectId = project.id;
  const briefQuery = useExistingBrief(projectId);
  const prdQuery = useExistingPrd(projectId);
  const generate = useGeneratePrd(projectId);
  const hasFiredRef = useRef(false);

  useEffect(() => {
    if (hasFiredRef.current) return;
    if (briefQuery.isPending || prdQuery.isPending) return;
    if (prdQuery.data) return; // Existing PRD — render it directly, do not regenerate.
    if (!briefQuery.data || briefQuery.data.is_final !== true) return;
    if (generate.isPending || generate.isSuccess || generate.isError) return;

    hasFiredRef.current = true;
    generate.mutate({ projectId });
    // We only react to read-side query resolution. The mutation-state checks
    // above keep this idempotent, and the ref prevents a StrictMode double-fire.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [briefQuery.isPending, prdQuery.isPending, briefQuery.data, prdQuery.data]);

  if (briefQuery.isPending || prdQuery.isPending) {
    return <PrdPending />;
  }

  if (briefQuery.isError) {
    return (
      <PrdError
        onRetry={() => {
          void briefQuery.refetch();
        }}
      />
    );
  }

  if (prdQuery.isError) {
    return (
      <PrdError
        onRetry={() => {
          void prdQuery.refetch();
        }}
      />
    );
  }

  if (prdQuery.data) {
    return <PrdView prd={prdQuery.data} projectId={projectId} />;
  }

  if (!briefQuery.data || briefQuery.data.is_final !== true || isBriefGateError(generate.error)) {
    return <PrdGatingState projectId={projectId} />;
  }

  if (generate.isError) {
    return (
      <PrdError
        onRetry={() => {
          generate.mutate({ projectId });
        }}
      />
    );
  }

  return <PrdPending />;
}
