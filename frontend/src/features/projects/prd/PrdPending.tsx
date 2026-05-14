import { Skeleton } from '@/components/ui/skeleton';

import { PRD_MESSAGES } from './messages';

function SectionSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <section className="space-y-3" aria-hidden="true">
      <Skeleton className="h-5 w-44" />
      <div className="space-y-2">
        {Array.from({ length: lines }, (_, index) => (
          <Skeleton
            key={index}
            className="h-4"
            style={{ width: `${100 - index * 8}%` }}
          />
        ))}
      </div>
    </section>
  );
}

function CardSkeleton() {
  return (
    <div className="space-y-3 rounded-lg border p-6" aria-hidden="true">
      <div className="flex items-start justify-between gap-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  );
}

export function PrdPending() {
  return (
    <div className="mx-auto max-w-3xl space-y-8" aria-busy="true" aria-live="polite">
      <header className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">{PRD_MESSAGES.PAGE_TITLE}</h1>
            <p className="text-sm text-muted-foreground">{PRD_MESSAGES.PENDING_BODY}</p>
          </div>
          <div className="space-y-1.5 text-right">
            <Skeleton className="ml-auto h-4 w-10" />
            <Skeleton className="ml-auto h-3 w-24" />
          </div>
        </div>
        <p className="sr-only">{PRD_MESSAGES.PENDING_TITLE}</p>
      </header>

      <div className="space-y-8">
        <SectionSkeleton lines={3} />
        <SectionSkeleton lines={3} />
        <SectionSkeleton lines={4} />
        <SectionSkeleton lines={3} />
        <section className="space-y-3" aria-hidden="true">
          <Skeleton className="h-5 w-28" />
          <CardSkeleton />
          <CardSkeleton />
        </section>
        <section className="space-y-3" aria-hidden="true">
          <Skeleton className="h-5 w-32" />
          <CardSkeleton />
        </section>
      </div>
    </div>
  );
}
