import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

import { ARCHITECTURE_MESSAGES } from './messages';

type ArchitectureGatingStateProps = {
  projectId: string;
};

export function ArchitectureGatingState({ projectId }: ArchitectureGatingStateProps) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h2 className="text-xl font-semibold text-foreground">
        {ARCHITECTURE_MESSAGES.GATING_TITLE}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {ARCHITECTURE_MESSAGES.GATING_BODY}
      </p>
      <Button asChild className="mt-6">
        <Link to={ROUTES.PROJECT_PRD(projectId)}>
          {ARCHITECTURE_MESSAGES.GATING_OPEN_PRD}
        </Link>
      </Button>
    </div>
  );
}
