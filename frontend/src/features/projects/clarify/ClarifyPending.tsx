import { Loader2 } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { CLARIFY_MESSAGES } from './messages';

const SKELETON_QUESTIONS = [0, 1, 2, 3] as const;

export function ClarifyPending() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex items-center gap-3 p-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
          <div>
            <h2 className="font-medium text-card-foreground">
              {CLARIFY_MESSAGES.PENDING_TITLE}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {CLARIFY_MESSAGES.PENDING_BODY}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {SKELETON_QUESTIONS.map((item) => (
          <Card key={item}>
            <CardContent className="space-y-4 p-6">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
