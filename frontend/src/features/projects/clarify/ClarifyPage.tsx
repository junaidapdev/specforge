import { useEffect } from 'react';

import { useProject } from '@/features/projects/layout/useProject';

import { ClarifyError } from './ClarifyError';
import { ClarifyForm } from './ClarifyForm';
import { ClarifyPending } from './ClarifyPending';
import { CLARIFY_MESSAGES } from './messages';
import { useClarifyingQuestions } from './useClarifyingQuestions';

export function ClarifyPage() {
  const { project } = useProject();
  const mutation = useClarifyingQuestions(project.id);

  useEffect(() => {
    // This page intentionally generates fresh questions on mount; retry remains user-triggered.
    mutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">{CLARIFY_MESSAGES.PAGE_TITLE}</h1>
        <p className="mt-2 text-muted-foreground">{CLARIFY_MESSAGES.PAGE_SUBTITLE}</p>
      </header>

      {mutation.isPending ? <ClarifyPending /> : null}
      {mutation.isError ? (
        <ClarifyError
          projectId={project.id}
          onRetry={() => {
            mutation.mutate();
          }}
        />
      ) : null}
      {mutation.isSuccess ? (
        <ClarifyForm projectId={project.id} questions={mutation.data} />
      ) : null}
    </div>
  );
}
