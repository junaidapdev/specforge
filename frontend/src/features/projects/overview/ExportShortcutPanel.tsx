import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { Download } from './icons';
import { OVERVIEW_MESSAGES } from './messages';
import { PanelCard } from './PanelCard';

type ExportShortcutPanelProps = {
  projectId: string;
};

export function ExportShortcutPanel({ projectId }: ExportShortcutPanelProps) {
  void projectId;

  return (
    <PanelCard
      title={OVERVIEW_MESSAGES.EXPORT_TITLE}
      icon={<Download className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{OVERVIEW_MESSAGES.EXPORT_BODY}</p>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <Button type="button" variant="outline" disabled>
                {OVERVIEW_MESSAGES.EXPORT_CTA}
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>{OVERVIEW_MESSAGES.EXPORT_PENDING_TOOLTIP}</TooltipContent>
        </Tooltip>
      </div>
    </PanelCard>
  );
}
