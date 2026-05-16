import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type {
  ArchitectureDecision,
  ArchitectureDecisionStatus,
} from '@shared/schemas/architecture';

import { ARCHITECTURE_MESSAGES } from './messages';

type ArchitectureDecisionCardProps = {
  decision: ArchitectureDecision;
};

function getStatusVariant(
  status: ArchitectureDecisionStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'accepted') {
    return 'default';
  }

  if (status === 'proposed') {
    return 'secondary';
  }

  if (status === 'rejected') {
    return 'destructive';
  }

  return 'outline';
}

export function ArchitectureDecisionCard({ decision }: ArchitectureDecisionCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
        <h3 className="text-base font-medium leading-snug">{decision.title}</h3>
        <Badge variant={getStatusVariant(decision.status)} className="shrink-0">
          {ARCHITECTURE_MESSAGES.DECISION_STATUS_LABELS[decision.status]}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground">
            {ARCHITECTURE_MESSAGES.DECISION_CONTEXT}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">{decision.context}</p>
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground">
            {ARCHITECTURE_MESSAGES.DECISION_DECISION}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">{decision.decision}</p>
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground">
            {ARCHITECTURE_MESSAGES.DECISION_CONSEQUENCES}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {decision.consequences}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
