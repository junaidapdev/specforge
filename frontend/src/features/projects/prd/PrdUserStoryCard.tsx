import { CheckCircle2 } from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { PrdUserStory } from '@shared/schemas/prd';

import { PRD_MESSAGES } from './messages';

type PrdUserStoryCardProps = {
  story: PrdUserStory;
};

export function PrdUserStoryCard({ story }: PrdUserStoryCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <h3 className="text-base font-medium leading-relaxed">{story.story}</h3>
        <p className="text-sm text-muted-foreground">{story.persona}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm font-medium text-foreground">
          {PRD_MESSAGES.ACCEPTANCE_CRITERIA}
        </p>
        <ul className="space-y-2">
          {story.acceptance_criteria.map((criterion, index) => (
            <li key={`${index}-${criterion}`} className="flex gap-2 text-sm leading-relaxed">
              <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-500"
                aria-hidden="true"
              />
              <span>{criterion}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
