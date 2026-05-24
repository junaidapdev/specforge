import { Link } from 'react-router-dom';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';
import { ChunkStatusBadge } from '@/features/projects/chunks/ChunkBadges';
import { formatRelativeTime } from '@/lib/relative-time';

import type { ChunkRow } from '../chunks/useChunks';
import { PROGRESS_MESSAGES } from './messages';

type RecentActivityTimelineProps = {
  chunks: ChunkRow[];
  projectId: string;
};

export function RecentActivityTimeline({ chunks, projectId }: RecentActivityTimelineProps) {
  const recent = [...chunks]
    .sort((left, right) => right.updated_at.localeCompare(left.updated_at))
    .slice(0, 10);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">{PROGRESS_MESSAGES.RECENT_ACTIVITY_TITLE}</CardTitle>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {PROGRESS_MESSAGES.RECENT_ACTIVITY_EMPTY}
          </p>
        ) : (
          <ul className="space-y-4">
            {recent.map((chunk) => (
              <li key={chunk.id} className="space-y-2 border-b pb-4 last:border-0 last:pb-0">
                <Link
                  to={ROUTES.PROJECT_CHUNK(projectId, chunk.id)}
                  className="text-sm font-medium text-foreground hover:underline"
                >
                  {chunk.title}
                </Link>
                <div className="flex flex-wrap items-center gap-2">
                  <ChunkStatusBadge status={chunk.status} />
                  <span className="text-xs text-muted-foreground">
                    {PROGRESS_MESSAGES.RECENT_CHUNK_PREFIX(
                      PROGRESS_MESSAGES.STATUS_SECTION_LABELS[chunk.status],
                    )}{' '}
                    - {formatRelativeTime(chunk.updated_at)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
