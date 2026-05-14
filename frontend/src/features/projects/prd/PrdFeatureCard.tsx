import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { PrdFeature, PrdFeaturePriority } from '@shared/schemas/prd';

import { PRD_MESSAGES } from './messages';

type PrdFeatureCardProps = {
  feature: PrdFeature;
};

function getPriorityVariant(priority: PrdFeaturePriority): 'destructive' | 'default' | 'secondary' {
  if (priority === 'must_have') {
    return 'destructive';
  }

  if (priority === 'should_have') {
    return 'default';
  }

  return 'secondary';
}

export function PrdFeatureCard({ feature }: PrdFeatureCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
        <h3 className="text-base font-medium leading-snug">{feature.name}</h3>
        <Badge variant={getPriorityVariant(feature.priority)} className="shrink-0">
          {PRD_MESSAGES.PRIORITY_LABELS[feature.priority]}
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
      </CardContent>
    </Card>
  );
}
