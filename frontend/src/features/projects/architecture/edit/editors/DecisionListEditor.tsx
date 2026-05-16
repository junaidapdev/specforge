import { Button } from '@/components/ui/button';
import type { ArchitectureDecision } from '@shared/schemas/architecture';

import { ARCHITECTURE_EDIT_MESSAGES } from '../messages';
import { DecisionCardEditor } from './DecisionCardEditor';

type DecisionListEditorProps = {
  value: ArchitectureDecision[];
  onChange: (value: ArchitectureDecision[]) => void;
  onRegenerateDecision: (decisionId: string) => Promise<void>;
  regeneratingDecisionId?: string | null;
  disabled?: boolean;
};

function moveDecision(
  decisions: ArchitectureDecision[],
  from: number,
  to: number,
): ArchitectureDecision[] {
  const next = [...decisions];
  const [decision] = next.splice(from, 1);
  if (!decision) return decisions;
  next.splice(to, 0, decision);
  return next;
}

function createDecision(): ArchitectureDecision {
  return {
    id: globalThis.crypto.randomUUID(),
    title: ARCHITECTURE_EDIT_MESSAGES.DEFAULT_DECISION_TITLE,
    context: ARCHITECTURE_EDIT_MESSAGES.DEFAULT_DECISION_CONTEXT,
    decision: ARCHITECTURE_EDIT_MESSAGES.DEFAULT_DECISION_DECISION,
    consequences: ARCHITECTURE_EDIT_MESSAGES.DEFAULT_DECISION_CONSEQUENCES,
    status: 'proposed',
  };
}

function getDecisionCounts(decisions: ArchitectureDecision[]) {
  return decisions.reduce(
    (counts, decision) => ({
      ...counts,
      [decision.status]: counts[decision.status] + 1,
    }),
    { proposed: 0, accepted: 0, superseded: 0, rejected: 0 },
  );
}

export function DecisionListEditor({
  value,
  onChange,
  onRegenerateDecision,
  regeneratingDecisionId = null,
  disabled = false,
}: DecisionListEditorProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-muted-foreground">
        {ARCHITECTURE_EDIT_MESSAGES.DECISION_STATUS_SUMMARY(getDecisionCounts(value))}
      </p>

      {value.map((decision, index) => (
        <DecisionCardEditor
          key={decision.id}
          decision={decision}
          index={index}
          disabled={disabled}
          isRegenerating={regeneratingDecisionId === decision.id}
          canMoveUp={index > 0}
          canMoveDown={index < value.length - 1}
          onMoveUp={() => {
            onChange(moveDecision(value, index, index - 1));
          }}
          onMoveDown={() => {
            onChange(moveDecision(value, index, index + 1));
          }}
          onRemove={() => {
            onChange(value.filter((item) => item.id !== decision.id));
          }}
          onChange={(nextDecision) => {
            onChange(value.map((item) => (item.id === decision.id ? nextDecision : item)));
          }}
          onRegenerate={() => onRegenerateDecision(decision.id)}
        />
      ))}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={disabled}
        onClick={() => {
          onChange([...value, createDecision()]);
        }}
      >
        {ARCHITECTURE_EDIT_MESSAGES.ADD_DECISION_BUTTON}
      </Button>
    </div>
  );
}
