import { useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { z } from 'zod';

import { useProject } from '@/features/projects/layout/useProject';

import { BriefError } from './BriefError';
import { BriefPending } from './BriefPending';
import { BriefView } from './BriefView';
import { useExistingBrief } from './useExistingBrief';
import { type BriefAnswer, useGenerateBrief } from './useGenerateBrief';

/**
 * Validates the router state handed off by the clarify page.
 * Treating it as untrusted because router state can be reached by direct
 * navigation or programmatic manipulation.
 */
const HandoffStateSchema = z.object({
  clarificationAnswers: z
    .array(
      z.object({
        id: z.string().min(1),
        text: z.string().min(1),
        answer: z.string().min(1),
      }),
    )
    .min(1),
});

function extractAnswers(state: unknown): BriefAnswer[] | undefined {
  const parsed = HandoffStateSchema.safeParse(state);
  if (!parsed.success) {
    return undefined;
  }
  return parsed.data.clarificationAnswers.map((entry) => ({
    questionId: entry.id,
    questionText: entry.text,
    answer: entry.answer,
  }));
}

export function BriefPage() {
  const location = useLocation();
  const { project } = useProject();

  return <BriefPageContent projectId={project.id} state={location.state} />;
}

type BriefPageContentProps = {
  projectId: string;
  state: unknown;
};

function BriefPageContent({ projectId, state }: BriefPageContentProps) {
  const existing = useExistingBrief(projectId);
  const generate = useGenerateBrief(projectId);
  const initialAnswers = useMemo(() => extractAnswers(state), [state]);

  // React StrictMode mounts effects twice in dev. Without this guard we would
  // fire two AI generations on first visit and bill twice for one user action.
  // Only the first effect run can flip the flag.
  const hasFiredRef = useRef(false);

  useEffect(() => {
    if (hasFiredRef.current) return;
    if (existing.isPending) return;
    if (existing.data) return; // Existing brief — render it directly, do not regenerate.
    if (generate.isPending || generate.isSuccess || generate.isError) return;

    hasFiredRef.current = true;
    generate.mutate({ answers: initialAnswers });
    // We only react to the existing-brief query resolving. The generate-state
    // checks above keep the body idempotent and the ref guard prevents a
    // StrictMode double-fire; including initialAnswers/generate here would
    // create churn without changing behavior.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing.isPending, existing.data]);

  if (existing.isPending) {
    return <BriefPending />;
  }

  if (existing.isError) {
    return (
      <BriefError
        onRetry={() => {
          void existing.refetch();
        }}
      />
    );
  }

  if (existing.data) {
    return <BriefView brief={existing.data} projectId={projectId} />;
  }

  // No existing brief: generation is pending, just-failed, or about to fire.
  if (generate.isError) {
    return (
      <BriefError
        onRetry={() => {
          generate.mutate({ answers: initialAnswers });
        }}
      />
    );
  }

  return <BriefPending />;
}
