import { ChevronDown, ChevronUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { PRD_EDIT_MESSAGES } from '../messages';

type ReorderControlsProps = {
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  disabled?: boolean;
};

export function ReorderControls({
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  disabled = false,
}: ReorderControlsProps) {
  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={PRD_EDIT_MESSAGES.MOVE_UP_LABEL}
            disabled={disabled || !canMoveUp}
            onClick={onMoveUp}
          >
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{PRD_EDIT_MESSAGES.MOVE_UP_LABEL}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={PRD_EDIT_MESSAGES.MOVE_DOWN_LABEL}
            disabled={disabled || !canMoveDown}
            onClick={onMoveDown}
          >
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{PRD_EDIT_MESSAGES.MOVE_DOWN_LABEL}</TooltipContent>
      </Tooltip>
    </div>
  );
}
