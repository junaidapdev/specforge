// TODO(chunk-16): Replace this stub with a React Query read for recent project decisions.
// Future query key: ['overview', 'decisions', projectId].
export type OverviewDecision = {
  id: string;
  title: string;
  createdAt: string;
};

export type DecisionsState = {
  recent: OverviewDecision[];
};

export function useDecisionsState(projectId: string): { data: DecisionsState } {
  void projectId;

  return { data: { recent: [] } };
}
