import { Button } from '@/components/ui/button';

import { PROMPT_MESSAGES } from './messages';

type SpecRequiredStateProps = {
  onOpenSpec: () => void;
};

export function SpecRequiredState({ onOpenSpec }: SpecRequiredStateProps) {
  return (
    <section className="space-y-4 rounded-lg border p-8 text-center sm:p-12">
      <h3 className="text-lg font-semibold text-foreground">
        {PROMPT_MESSAGES.SPEC_REQUIRED_TITLE}
      </h3>
      <p className="text-sm text-muted-foreground">{PROMPT_MESSAGES.SPEC_REQUIRED_BODY}</p>
      <Button type="button" onClick={onOpenSpec}>
        {PROMPT_MESSAGES.SPEC_REQUIRED_OPEN}
      </Button>
    </section>
  );
}
