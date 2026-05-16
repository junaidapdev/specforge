import { Loader2, RefreshCw, Trash2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ReorderControls } from '@/features/projects/_shared/edit/editors/ReorderControls';
import {
  ArchitectureDecisionStatusSchema,
  type ArchitectureDecision,
  type ArchitectureDecisionStatus,
} from '@shared/schemas/architecture';

import { ARCHITECTURE_MESSAGES } from '../../messages';
import { ARCHITECTURE_EDIT_MESSAGES } from '../messages';

type DecisionCardEditorProps = {
  decision: ArchitectureDecision;
  index: number;
  onChange: (decision: ArchitectureDecision) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRegenerate: () => Promise<void>;
  canMoveUp: boolean;
  canMoveDown: boolean;
  isRegenerating?: boolean;
  disabled?: boolean;
};

const DECISION_STATUSES: readonly ArchitectureDecisionStatus[] = [
  'proposed',
  'accepted',
  'superseded',
  'rejected',
];

export function DecisionCardEditor({
  decision,
  index,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  onRegenerate,
  canMoveUp,
  canMoveDown,
  isRegenerating = false,
  disabled = false,
}: DecisionCardEditorProps) {
  const titleId = `architecture-decision-${index}-title`;
  const statusId = `architecture-decision-${index}-status`;
  const contextId = `architecture-decision-${index}-context`;
  const decisionId = `architecture-decision-${index}-decision`;
  const consequencesId = `architecture-decision-${index}-consequences`;
  const isBusy = disabled || isRegenerating;

  return (
    <Card>
      <CardHeader className="space-y-3 pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-1">
            <Label htmlFor={titleId}>{ARCHITECTURE_EDIT_MESSAGES.DECISION_TITLE_LABEL}</Label>
            <Input
              id={titleId}
              value={decision.title}
              disabled={isBusy}
              onChange={(event) => {
                onChange({ ...decision, title: event.target.value });
              }}
            />
          </div>
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <ReorderControls
              disabled={isBusy}
              canMoveUp={canMoveUp}
              canMoveDown={canMoveDown}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
            />
            <Button type="button" variant="ghost" size="sm" disabled={isBusy} onClick={onRemove}>
              <Trash2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
              {ARCHITECTURE_EDIT_MESSAGES.REMOVE_BUTTON}
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor={statusId}>{ARCHITECTURE_EDIT_MESSAGES.DECISION_STATUS_LABEL}</Label>
          <Select
            value={decision.status}
            disabled={isBusy}
            onValueChange={(value) => {
              const parsed = ArchitectureDecisionStatusSchema.safeParse(value);
              if (parsed.success) {
                onChange({ ...decision, status: parsed.data });
              }
            }}
          >
            <SelectTrigger id={statusId}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DECISION_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {ARCHITECTURE_MESSAGES.DECISION_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor={contextId}>{ARCHITECTURE_EDIT_MESSAGES.DECISION_CONTEXT_LABEL}</Label>
          <Textarea
            id={contextId}
            value={decision.context}
            rows={4}
            disabled={isBusy}
            onChange={(event) => {
              onChange({ ...decision, context: event.target.value });
            }}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor={decisionId}>
            {ARCHITECTURE_EDIT_MESSAGES.DECISION_DECISION_LABEL}
          </Label>
          <Textarea
            id={decisionId}
            value={decision.decision}
            rows={4}
            disabled={isBusy}
            onChange={(event) => {
              onChange({ ...decision, decision: event.target.value });
            }}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor={consequencesId}>
            {ARCHITECTURE_EDIT_MESSAGES.DECISION_CONSEQUENCES_LABEL}
          </Label>
          <Textarea
            id={consequencesId}
            value={decision.consequences}
            rows={4}
            disabled={isBusy}
            onChange={(event) => {
              onChange({ ...decision, consequences: event.target.value });
            }}
          />
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="outline" size="sm" disabled={isBusy}>
              {isRegenerating ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden="true" />
              )}
              {ARCHITECTURE_EDIT_MESSAGES.DECISION_REGENERATE}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {ARCHITECTURE_EDIT_MESSAGES.DECISION_REGENERATE_CONFIRM_TITLE}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {ARCHITECTURE_EDIT_MESSAGES.DECISION_REGENERATE_CONFIRM_BODY}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {ARCHITECTURE_EDIT_MESSAGES.REGENERATE_CONFIRM_CANCEL}
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={isBusy}
                onClick={() => {
                  void onRegenerate();
                }}
              >
                {ARCHITECTURE_EDIT_MESSAGES.REGENERATE_CONFIRM_CONFIRM}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
