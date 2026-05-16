import { Skeleton } from '@/components/ui/skeleton';

import { CHUNKS_MESSAGES } from './messages';

export function ChunksPending() {
  return (
    <div className="mx-auto max-w-4xl space-y-6" aria-busy="true" aria-live="polite">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">{CHUNKS_MESSAGES.PAGE_TITLE}</h1>
        <p className="text-sm text-muted-foreground">{CHUNKS_MESSAGES.PENDING_BODY}</p>
        <p className="sr-only">{CHUNKS_MESSAGES.PENDING_TITLE}</p>
      </header>

      <div className="space-y-4" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="space-y-3 rounded-lg border p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-12" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[88%]" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
