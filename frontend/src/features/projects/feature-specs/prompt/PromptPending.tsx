import { Skeleton } from '@/components/ui/skeleton';

import { PROMPT_MESSAGES } from './messages';

export function PromptPending() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">{PROMPT_MESSAGES.PENDING_BODY}</p>
        <p className="sr-only">{PROMPT_MESSAGES.PENDING_TITLE}</p>
      </header>

      <div className="space-y-3" aria-hidden="true">
        <Skeleton className="h-5 w-56" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[94%]" />
        <Skeleton className="h-4 w-[88%]" />
        <Skeleton className="h-4 w-[92%]" />
        <Skeleton className="h-4 w-[80%]" />
      </div>
    </div>
  );
}
