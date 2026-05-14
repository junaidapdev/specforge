import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

import { PRD_MESSAGES } from './messages';

type PrdGatingStateProps = {
  projectId: string;
};

export function PrdGatingState({ projectId }: PrdGatingStateProps) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h2 className="text-xl font-semibold text-foreground">{PRD_MESSAGES.GATING_TITLE}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {PRD_MESSAGES.GATING_BODY}
      </p>
      <Button asChild className="mt-6">
        <Link to={ROUTES.PROJECT_BRIEF(projectId)}>{PRD_MESSAGES.GATING_OPEN_BRIEF}</Link>
      </Button>
    </div>
  );
}
