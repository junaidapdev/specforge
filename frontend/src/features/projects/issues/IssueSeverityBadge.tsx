import { Badge } from '@/components/ui/badge';
import type { IssueSeverity } from '@shared/schemas/issue';

import { ISSUE_MESSAGES } from './messages';

function getSeverityVariant(
  severity: IssueSeverity,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (severity === 'high') return 'destructive';
  if (severity === 'medium') return 'default';
  return 'outline';
}

export function IssueSeverityBadge({ severity }: { severity: IssueSeverity }) {
  return (
    <Badge variant={getSeverityVariant(severity)}>
      {ISSUE_MESSAGES.SEVERITY_LABELS[severity]}
    </Badge>
  );
}
