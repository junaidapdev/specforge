import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { PROJECT_LAYOUT_MESSAGES } from './messages';

export function ProjectLayoutPending() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-8 w-64" />
        <p className="sr-only">{PROJECT_LAYOUT_MESSAGES.PENDING_TITLE}</p>
      </div>
      <Card>
        <CardContent className="space-y-4 p-6">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-28 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
