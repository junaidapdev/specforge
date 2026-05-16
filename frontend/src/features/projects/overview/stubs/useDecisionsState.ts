import { useExistingArchitecture } from '@/features/projects/architecture/useExistingArchitecture';
import type { ArchitectureDecisionStatus } from '@shared/schemas/architecture';

export type OverviewDecision = {
  id: string;
  title: string;
  status: ArchitectureDecisionStatus;
};

export type DecisionsState = {
  recent: OverviewDecision[];
};

export function useDecisionsState(projectId: string): {
  data: DecisionsState;
  isLoading: boolean;
  isError: boolean;
  retry: () => void;
} {
  const query = useExistingArchitecture(projectId);
  const recent = query.data?.content_json.decisions.slice(-3).reverse().map((decision) => ({
    id: decision.id,
    title: decision.title,
    status: decision.status,
  })) ?? [];

  return {
    data: { recent },
    isLoading: query.isPending,
    isError: query.isError,
    retry: () => {
      void query.refetch();
    },
  };
}
