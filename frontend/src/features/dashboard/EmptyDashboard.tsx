import { FolderPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

import { DASHBOARD_MESSAGES } from './messages';

export function EmptyDashboard() {
  return (
    <section className="flex min-h-[420px] items-center justify-center rounded-lg border border-dashed">
      <div className="mx-auto max-w-md px-6 text-center">
        <FolderPlus className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden="true" />
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          {DASHBOARD_MESSAGES.EMPTY_TITLE}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {DASHBOARD_MESSAGES.EMPTY_BODY}
        </p>
        <Button asChild className="mt-6">
          <Link to={ROUTES.PROJECT_NEW}>{DASHBOARD_MESSAGES.EMPTY_CTA}</Link>
        </Button>
      </div>
    </section>
  );
}
