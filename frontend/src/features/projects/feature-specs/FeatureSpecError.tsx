import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { FEATURE_SPEC_MESSAGES } from './messages';

type FeatureSpecErrorProps = {
  onRetry: () => void;
};

export function FeatureSpecError({ onRetry }: FeatureSpecErrorProps) {
  return (
    <div className="mx-auto max-w-4xl">
      <section className="flex min-h-[420px] items-center justify-center rounded-lg border">
        <div className="mx-auto max-w-md px-6 text-center">
          <AlertCircle
            className="mx-auto h-12 w-12 text-red-600 dark:text-red-500"
            aria-hidden="true"
          />
          <h2 className="mt-4 text-xl font-semibold text-foreground">
            {FEATURE_SPEC_MESSAGES.ERROR_TITLE}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {FEATURE_SPEC_MESSAGES.ERROR_BODY}
          </p>
          <Button className="mt-6" type="button" onClick={onRetry}>
            {FEATURE_SPEC_MESSAGES.ERROR_RETRY}
          </Button>
        </div>
      </section>
    </div>
  );
}
