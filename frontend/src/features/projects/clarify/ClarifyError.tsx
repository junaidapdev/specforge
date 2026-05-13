import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';

import { CLARIFY_MESSAGES } from './messages';

type ClarifyErrorProps = {
  projectId: string;
  onRetry: () => void;
};

export function ClarifyError({ onRetry, projectId }: ClarifyErrorProps) {
  return (
    <Card>
      <CardContent className="space-y-5 p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{CLARIFY_MESSAGES.ERROR_TITLE}</AlertTitle>
          <AlertDescription>{CLARIFY_MESSAGES.ERROR_BODY}</AlertDescription>
        </Alert>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button className="w-full sm:w-auto" type="button" onClick={onRetry}>
            {CLARIFY_MESSAGES.ERROR_RETRY}
          </Button>
          <Button asChild className="w-full sm:w-auto" variant="outline">
            <Link to={ROUTES.PROJECT_BRIEF(projectId)}>{CLARIFY_MESSAGES.ERROR_SKIP}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
