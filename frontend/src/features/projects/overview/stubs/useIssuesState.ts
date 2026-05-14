// TODO(chunk-23): Replace this stub with a React Query read for open project issues.
// Future query key: ['overview', 'issues', projectId].
export type OverviewIssue = {
  id: string;
  title: string;
  updatedAt: string;
};

export type IssuesState = {
  openCount: number;
  recent: OverviewIssue[];
};

export function useIssuesState(projectId: string): { data: IssuesState } {
  void projectId;

  return { data: { openCount: 0, recent: [] } };
}
