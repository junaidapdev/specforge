import type { FeatureSpecContent } from '@shared/schemas/feature-spec.ts';

export function renderFeatureSpecMarkdown(
  content: FeatureSpecContent,
  chunkTitle: string,
): string {
  const lines: string[] = [];

  lines.push(`# ${chunkTitle} — Feature Spec`);
  lines.push('');
  lines.push('## Goal');
  lines.push(content.goal);
  lines.push('');
  lines.push('## Scope');
  lines.push(content.scope);
  lines.push('');
  lines.push('## Out of Scope');
  lines.push(content.out_of_scope);
  lines.push('');
  lines.push('## Technical Requirements');
  lines.push(content.technical_requirements);
  lines.push('');
  lines.push('## UI Requirements');
  lines.push(content.ui_requirements);
  lines.push('');
  lines.push('## Security Requirements');
  lines.push(content.security_requirements);
  lines.push('');
  lines.push('## Acceptance Criteria');
  lines.push(content.acceptance_criteria);

  return lines.join('\n').trimEnd();
}
