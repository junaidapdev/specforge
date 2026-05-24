import { Badge } from '@/components/ui/badge';
import type { IssueStatus } from '@shared/schemas/issue';

import { ISSUE_MESSAGES } from './messages';

export function IssueStatusBadge({ status }: { status: IssueStatus }) {
  return (
    <Badge variant={status === 'resolved' ? 'secondary' : 'outline'}>
      {ISSUE_MESSAGES.STATUS_LABELS[status]}
    </Badge>
  );
}
