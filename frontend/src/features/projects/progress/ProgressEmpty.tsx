import { ListChecks } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

import { PROGRESS_MESSAGES } from './messages';

type ProgressEmptyProps = {
  projectId: string;
};

export function ProgressEmpty({ projectId }: ProgressEmptyProps) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">{PROGRESS_MESSAGES.PAGE_TITLE}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{PROGRESS_MESSAGES.PAGE_SUBTITLE}</p>
      </header>
      <section className="flex min-h-[380px] items-center justify-center rounded-lg border">
        <div className="mx-auto max-w-md px-6 text-center">
          <ListChecks className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-semibold text-foreground">
            {PROGRESS_MESSAGES.EMPTY_TITLE}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {PROGRESS_MESSAGES.EMPTY_BODY}
          </p>
          <Button asChild className="mt-6">
            <Link to={ROUTES.PROJECT_CHUNKS(projectId)}>
              {PROGRESS_MESSAGES.EMPTY_OPEN_CHUNKS}
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
