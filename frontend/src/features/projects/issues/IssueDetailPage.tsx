import { AlertCircle, CheckCircle2, Loader2, Pencil, Wand2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useChunks } from '@/features/projects/chunks/useChunks';
import { useProject } from '@/features/projects/layout/useProject';

import { IssuePromptDisplay } from './IssuePromptDisplay';
import { IssueSeverityBadge } from './IssueSeverityBadge';
import { IssueStatusBadge } from './IssueStatusBadge';
import { IssuesError } from './IssuesError';
import { IssuesPending } from './IssuesPending';
import { ISSUE_MESSAGES } from './messages';
import { NewIssueDialog } from './NewIssueDialog';
import { useGenerateIssuePrompt } from './useGenerateIssuePrompt';
import { useIssue } from './useIssue';
import { useResolveIssue } from './useResolveIssue';

export function IssueDetailPage() {
  const { project } = useProject();
  const { issueId } = useParams<{ issueId: string }>();
  const issueQuery = useIssue(issueId ?? '', Boolean(issueId));
  const chunksQuery = useChunks(project.id);
  const generate = useGenerateIssuePrompt(project.id, issueId ?? '');
  const resolve = useResolveIssue(project.id, issueId ?? '');
  const firedIssueRef = useRef<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    const issue = issueQuery.data;

    if (!issue || issue.generated_prompt || generate.isPending) return;
    if (firedIssueRef.current === issue.id) return;

    firedIssueRef.current = issue.id;
    generate.mutate();
  }, [generate, issueQuery.data]);

  if (!issueId) {
    return <Navigate to={ROUTES.PROJECT_ISSUES(project.id)} replace />;
  }

  if (issueQuery.isPending) {
    return <IssuesPending />;
  }

  if (issueQuery.isError) {
    return (
      <IssuesError
        onRetry={() => {
          void issueQuery.refetch();
        }}
      />
    );
  }

  const issue = issueQuery.data;

  if (issue.project_id !== project.id) {
    return <Navigate to={ROUTES.PROJECT_ISSUES(project.id)} replace />;
  }

  const linkedChunk = chunksQuery.data?.find((chunk) => chunk.id === issue.related_chunk_id);

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <header className="space-y-4 border-b pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <IssueStatusBadge status={issue.status} />
              <IssueSeverityBadge severity={issue.severity} />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">{issue.title}</h1>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="mr-1.5 h-4 w-4" aria-hidden="true" />
              {ISSUE_MESSAGES.EDIT_ISSUE_BUTTON}
            </Button>
            <Button
              type="button"
              variant={issue.status === 'resolved' ? 'outline' : 'default'}
              disabled={resolve.isPending}
              onClick={() => {
                resolve.mutate(issue.status !== 'resolved');
              }}
            >
              {resolve.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
              {issue.status === 'resolved'
                ? ISSUE_MESSAGES.MARK_OPEN_BUTTON
                : ISSUE_MESSAGES.MARK_RESOLVED_BUTTON}
            </Button>
          </div>
        </div>

        {issue.status === 'resolved' ? (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>{ISSUE_MESSAGES.RESOLVED_BANNER}</AlertTitle>
          </Alert>
        ) : null}
        {resolve.isError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{ISSUE_MESSAGES.ERROR_TITLE}</AlertTitle>
            <AlertDescription>{ISSUE_MESSAGES.RESOLVE_ERROR}</AlertDescription>
          </Alert>
        ) : null}
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">{ISSUE_MESSAGES.DESCRIPTION_TITLE}</h2>
        <p className="whitespace-pre-wrap rounded-lg border p-5 text-sm leading-relaxed text-foreground">
          {issue.description}
        </p>
        {issue.related_chunk_id ? (
          <p className="text-sm text-muted-foreground">
            {ISSUE_MESSAGES.RELATED_CHUNK_LABEL}:{' '}
            {linkedChunk ? (
              <Link
                to={ROUTES.PROJECT_CHUNK(project.id, linkedChunk.id)}
                className="font-medium text-foreground hover:underline"
              >
                {linkedChunk.title}
              </Link>
            ) : (
              ISSUE_MESSAGES.RELATED_CHUNK_MISSING
            )}
          </p>
        ) : null}
      </section>

      {generate.isPending ? (
        <section className="space-y-3 rounded-lg border p-8 text-center" aria-busy="true">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
          <h2 className="text-lg font-semibold">{ISSUE_MESSAGES.PROMPT_PENDING_TITLE}</h2>
          <p className="text-sm text-muted-foreground">{ISSUE_MESSAGES.PROMPT_PENDING_BODY}</p>
        </section>
      ) : issue.generated_prompt ? (
        <IssuePromptDisplay
          prompt={issue.generated_prompt}
          version={issue.version}
          updatedAt={issue.updated_at}
          onRegenerate={() => {
            generate.mutate();
          }}
        />
      ) : (
        <section className="space-y-4 rounded-lg border p-8 text-center">
          <h2 className="text-lg font-semibold text-foreground">
            {ISSUE_MESSAGES.PROMPT_EMPTY_TITLE}
          </h2>
          <p className="text-sm text-muted-foreground">{ISSUE_MESSAGES.PROMPT_EMPTY_BODY}</p>
          <Button
            type="button"
            onClick={() => {
              generate.mutate();
            }}
          >
            <Wand2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {ISSUE_MESSAGES.GENERATE_PROMPT_BUTTON}
          </Button>
        </section>
      )}

      {generate.isError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{ISSUE_MESSAGES.PROMPT_ERROR_TITLE}</AlertTitle>
          <AlertDescription>{ISSUE_MESSAGES.PROMPT_ERROR_BODY}</AlertDescription>
        </Alert>
      ) : null}

      <NewIssueDialog
        projectId={project.id}
        issue={issue}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdated={() => {
          generate.mutate();
        }}
      />
    </div>
  );
}
