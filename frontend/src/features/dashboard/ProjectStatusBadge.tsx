import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ProjectStatus } from '@/types/project';

import { PROJECT_STATUS_CONFIG } from './status-config';

type ProjectStatusBadgeProps = {
  status: ProjectStatus;
};

export function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  const config = PROJECT_STATUS_CONFIG[status];

  return (
    <Badge variant={config.variant} className="gap-1.5">
      <span className={cn('h-2 w-2 rounded-full', config.dotClass)} aria-hidden="true" />
      {config.label}
    </Badge>
  );
}
