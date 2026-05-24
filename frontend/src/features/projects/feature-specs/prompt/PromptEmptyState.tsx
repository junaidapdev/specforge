import { Button } from '@/components/ui/button';

import { PROMPT_MESSAGES } from './messages';

type PromptEmptyStateProps = {
  onGenerate: () => void;
  isPending: boolean;
};

export function PromptEmptyState({ onGenerate, isPending }: PromptEmptyStateProps) {
  return (
    <section className="space-y-4 rounded-lg border p-8 text-center sm:p-12">
      <h3 className="text-lg font-semibold text-foreground">{PROMPT_MESSAGES.EMPTY_TITLE}</h3>
      <p className="text-sm text-muted-foreground">{PROMPT_MESSAGES.EMPTY_BODY}</p>
      <Button type="button" onClick={onGenerate} disabled={isPending}>
        {isPending ? PROMPT_MESSAGES.PENDING_TITLE : PROMPT_MESSAGES.EMPTY_GENERATE}
      </Button>
    </section>
  );
}
