import { cn } from '@/lib/utils';
import type { TargetAgent } from '@shared/schemas/agent-prompt';

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
        <button
          key={target}
          type="button"
          onClick={() => {
            onChange(target);
          }}
          aria-pressed={value === target}
          className={cn(
            'rounded px-3 py-1.5 text-sm transition-colors',
            value === target
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {PROMPT_MESSAGES.TARGET_OPTIONS[target]}
        </button>
      ))}
    </div>
  );
}
