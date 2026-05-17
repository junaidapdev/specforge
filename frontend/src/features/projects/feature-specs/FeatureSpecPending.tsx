import { Skeleton } from '@/components/ui/skeleton';

import { FEATURE_SPEC_MESSAGES } from './messages';

function SectionSkeleton() {
  return (
    <section className="space-y-3" aria-hidden="true">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-11/12" />
      <Skeleton className="h-4 w-4/5" />
    </section>
  );
}

export function FeatureSpecPending() {
  return (
    <div className="mx-auto max-w-4xl space-y-8" aria-busy="true" aria-live="polite">
      <header className="space-y-3">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-full max-w-2xl" />
        <p className="text-sm text-muted-foreground">{FEATURE_SPEC_MESSAGES.PENDING_BODY}</p>
        <p className="sr-only">{FEATURE_SPEC_MESSAGES.PENDING_TITLE}</p>
      </header>
      <div className="space-y-8">
        {Array.from({ length: 4 }, (_, index) => (
          <SectionSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
