import { AlertCircle } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { PROJECT_LAYOUT_MESSAGES } from './messages';

type ProjectLayoutErrorProps = {
  onRetry: () => void;
};

export function ProjectLayoutError({ onRetry }: ProjectLayoutErrorProps) {
  return (
    <Card className="mx-auto max-w-xl">
      <CardContent className="space-y-5 p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{PROJECT_LAYOUT_MESSAGES.ERROR_TITLE}</AlertTitle>
          <AlertDescription>{PROJECT_LAYOUT_MESSAGES.ERROR_BODY}</AlertDescription>
        </Alert>
        <Button type="button" onClick={onRetry}>
          {PROJECT_LAYOUT_MESSAGES.ERROR_RETRY}
        </Button>
      </CardContent>
    </Card>
  );
}
