import type { AgentPromptModelOutput, TargetAgent } from '@shared/schemas/agent-prompt.ts';
import type { FeatureSpecContent } from '@shared/schemas/feature-spec.ts';

const TARGET_AGENT_LABELS: Record<TargetAgent, string> = {
  claude_code: 'Claude Code',
  cursor: 'Cursor',
  generic: 'Generic AI agent',
};

type AssembleAgentPromptInput = {
  ai: AgentPromptModelOutput;
  spec: FeatureSpecContent;
  chunkTitle: string;
  chunkRef: string;
  projectName: string;
  targetAgent: TargetAgent;
};

export function assembleAgentPrompt(input: AssembleAgentPromptInput): string {
  const { ai, spec, chunkTitle, chunkRef, projectName, targetAgent } = input;
  const lines: string[] = [];

  lines.push(`# ${chunkTitle} — Implementation Prompt`);
  lines.push('');
  lines.push(
    `*Project: ${projectName} · Target agent: ${
      TARGET_AGENT_LABELS[targetAgent]
    } · Chunk ref: \`${chunkRef}\`*`,
  );
  lines.push('');

  lines.push('## Your role');
  lines.push(ai.role_intro);
  lines.push('');

  lines.push('## How to work');
  lines.push(ai.how_to_work);
  lines.push('');

  lines.push('## Project philosophy');
  lines.push(ai.philosophy);
  lines.push('');

  if (ai.agent_specific_notes.trim().length > 0) {
    lines.push('## Notes for this agent');
    lines.push(ai.agent_specific_notes);
    lines.push('');
  }

  lines.push('## Goal');
  lines.push(spec.goal);
  lines.push('');
  lines.push('## Scope');
  lines.push(spec.scope);
  lines.push('');
  lines.push('## Out of Scope');
  lines.push(spec.out_of_scope);
  lines.push('');
  lines.push('## Technical Requirements');
  lines.push(spec.technical_requirements);
  lines.push('');
  lines.push('## UI Requirements');
  lines.push(spec.ui_requirements);
  lines.push('');
  lines.push('## Security Requirements');
  lines.push(spec.security_requirements);
  lines.push('');
  lines.push('## Acceptance Criteria');
  lines.push(spec.acceptance_criteria);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push(
    'When you have completed this chunk, summarize: files changed, any architectural decisions made, any known issues, and what should happen next. Then update the progress tracker.',
  );

  return lines.join('\n').trimEnd();
}
