import { Skeleton } from '@/components/ui/skeleton';

import { ISSUE_MESSAGES } from './messages';

export function IssuesPending() {
  return (
    <div className="mx-auto max-w-4xl space-y-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">{ISSUE_MESSAGES.PENDING_TITLE}</span>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
      <div className="space-y-3" aria-hidden="true">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}
