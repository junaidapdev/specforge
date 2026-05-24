import { Skeleton } from '@/components/ui/skeleton';

import { PROGRESS_MESSAGES } from './messages';

export function ProgressPending() {
  return (
    <div className="mx-auto max-w-4xl space-y-6" aria-busy="true" aria-live="polite">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">{PROGRESS_MESSAGES.PAGE_TITLE}</h1>
        <p className="sr-only">{PROGRESS_MESSAGES.PENDING_TITLE}</p>
        <Skeleton className="h-4 w-48" />
      </header>
      <Skeleton className="h-40 w-full rounded-lg" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="h-28 w-full rounded-lg" />
          <Skeleton className="h-28 w-full rounded-lg" />
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  );
}
