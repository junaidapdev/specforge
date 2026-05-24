import { AlertOctagon } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { ISSUE_MESSAGES } from './messages';

type IssuesEmptyProps = {
  onCreate: () => void;
};

export function IssuesEmpty({ onCreate }: IssuesEmptyProps) {
  return (
    <section className="flex min-h-[380px] items-center justify-center rounded-lg border">
      <div className="mx-auto max-w-md px-6 text-center">
        <AlertOctagon className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden="true" />
        <h2 className="mt-4 text-xl font-semibold text-foreground">{ISSUE_MESSAGES.EMPTY_TITLE}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {ISSUE_MESSAGES.EMPTY_BODY}
        </p>
        <Button className="mt-6" type="button" onClick={onCreate}>
          {ISSUE_MESSAGES.NEW_ISSUE_BUTTON}
        </Button>
      </div>
    </section>
  );
}
