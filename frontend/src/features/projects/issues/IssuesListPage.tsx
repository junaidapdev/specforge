import { Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useProject } from '@/features/projects/layout/useProject';

import { IssueListItem } from './IssueListItem';
import { IssuesEmpty } from './IssuesEmpty';
import { IssuesError } from './IssuesError';
import { IssuesPending } from './IssuesPending';
import { ISSUE_MESSAGES } from './messages';
import { NewIssueDialog } from './NewIssueDialog';
import { useIssues } from './useIssues';

export function IssuesListPage() {
  const { project } = useProject();
  const issuesQuery = useIssues(project.id);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (issuesQuery.isPending) {
    return <IssuesPending />;
  }

  if (issuesQuery.isError) {
    return (
      <IssuesError
        onRetry={() => {
          void issuesQuery.refetch();
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{ISSUE_MESSAGES.PAGE_TITLE}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{ISSUE_MESSAGES.PAGE_SUBTITLE}</p>
        </div>
        <Button type="button" onClick={() => setDialogOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
          {ISSUE_MESSAGES.NEW_ISSUE_BUTTON}
        </Button>
      </header>

      {issuesQuery.data.length === 0 ? (
        <IssuesEmpty onCreate={() => setDialogOpen(true)} />
      ) : (
        <div className="space-y-3">
          {issuesQuery.data.map((issue) => (
            <IssueListItem key={issue.id} issue={issue} projectId={project.id} />
          ))}
        </div>
      )}

      <NewIssueDialog
        projectId={project.id}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
