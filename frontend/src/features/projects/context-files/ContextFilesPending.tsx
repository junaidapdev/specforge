import { Skeleton } from '@/components/ui/skeleton';

import { CONTEXT_FILES_MESSAGES } from './messages';

export function ContextFilesPending() {
  return (
    <div className="mx-auto max-w-3xl space-y-6" aria-busy="true" aria-live="polite">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">
          {CONTEXT_FILES_MESSAGES.PAGE_TITLE}
        </h1>
        <p className="text-sm text-muted-foreground">{CONTEXT_FILES_MESSAGES.PENDING_BODY}</p>
        <p className="sr-only">{CONTEXT_FILES_MESSAGES.PENDING_TITLE}</p>
      </header>

      <div className="space-y-6" aria-hidden="true">
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-32 shrink-0" />
          ))}
        </div>
        <div className="space-y-3 rounded-lg border p-6">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[92%]" />
          <Skeleton className="h-4 w-[88%]" />
          <Skeleton className="h-4 w-[84%]" />
          <Skeleton className="h-4 w-[80%]" />
        </div>
      </div>
    </div>
  );
}
