import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { ISSUE_MESSAGES } from './messages';

type IssuesErrorProps = {
  onRetry: () => void;
};

export function IssuesError({ onRetry }: IssuesErrorProps) {
  return (
    <div className="mx-auto max-w-4xl">
      <section className="flex min-h-[380px] items-center justify-center rounded-lg border">
        <div className="mx-auto max-w-md px-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-semibold text-foreground">
            {ISSUE_MESSAGES.ERROR_TITLE}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {ISSUE_MESSAGES.ERROR_BODY}
          </p>
          <Button className="mt-6" type="button" onClick={onRetry}>
            {ISSUE_MESSAGES.ERROR_RETRY}
          </Button>
        </div>
      </section>
    </div>
  );
}
