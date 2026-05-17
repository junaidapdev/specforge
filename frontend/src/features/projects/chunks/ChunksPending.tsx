import { Skeleton } from '@/components/ui/skeleton';

import { CHUNKS_MESSAGES } from './messages';

export function ChunksPending() {
  return (
    <div className="mx-auto max-w-6xl space-y-6" aria-busy="true" aria-live="polite">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">{CHUNKS_MESSAGES.PAGE_TITLE}</h1>
        <p className="text-sm text-muted-foreground">{CHUNKS_MESSAGES.PENDING_BODY}</p>
        <p className="sr-only">{CHUNKS_MESSAGES.PENDING_TITLE}</p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="space-y-4 rounded-lg border p-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="space-y-3 rounded-md border p-4">
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-12" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[85%]" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
