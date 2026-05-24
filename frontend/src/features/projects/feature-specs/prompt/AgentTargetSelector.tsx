import type { TargetAgent } from '@shared/schemas/agent-prompt';

import { Button } from '@/components/ui/button';

import { PROMPT_MESSAGES } from './messages';

const TARGET_AGENTS: TargetAgent[] = ['claude_code', 'cursor', 'generic'];

type AgentTargetSelectorProps = {
  value: TargetAgent;
  onChange: (target: TargetAgent) => void;
};

export function AgentTargetSelector({ value, onChange }: AgentTargetSelectorProps) {
  return (
    <div
      className="inline-flex flex-wrap rounded-md border p-1"
      role="group"
      aria-label={PROMPT_MESSAGES.TARGET_LABEL}
    >
      {TARGET_AGENTS.map((target) => (
        <Button
          key={target}
          type="button"
          variant={value === target ? 'default' : 'ghost'}
          size="sm"
          onClick={() => {
            onChange(target);
          }}
          aria-pressed={value === target}
          className={value === target ? 'shadow-none' : 'text-muted-foreground hover:text-foreground'}
        >
          {PROMPT_MESSAGES.TARGET_OPTIONS[target]}
        </Button>
      ))}
    </div>
  );
}
