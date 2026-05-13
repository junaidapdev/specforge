import { FolderX } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';

import { PROJECT_LAYOUT_MESSAGES } from './messages';

export function ProjectNotFound() {
  return (
    <Card className="mx-auto max-w-xl">
      <CardContent className="flex flex-col items-center p-8 text-center">
        <FolderX className="h-9 w-9 text-muted-foreground" aria-hidden="true" />
        <h1 className="mt-4 text-xl font-semibold text-card-foreground">
          {PROJECT_LAYOUT_MESSAGES.NOT_FOUND_TITLE}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {PROJECT_LAYOUT_MESSAGES.NOT_FOUND_BODY}
        </p>
        <Button asChild className="mt-6" variant="outline">
          <Link to={ROUTES.DASHBOARD}>{PROJECT_LAYOUT_MESSAGES.NOT_FOUND_BACK}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
