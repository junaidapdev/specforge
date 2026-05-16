import type {
  ArchitectureContent,
  ArchitectureDecisionStatus,
} from '@shared/schemas/architecture.ts';

export function renderArchitectureMarkdown(
  content: ArchitectureContent,
  projectName: string,
): string {
  const lines: string[] = [];
  const safeProjectName = Array.from(projectName)
    .map((character) => {
      const codePoint = character.codePointAt(0) ?? 0;
      return codePoint <= 0x1f || codePoint === 0x7f ? ' ' : character;
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim();

  lines.push(`# ${safeProjectName} — Architecture`);
  lines.push('');

  lines.push('## Stack overview');
  lines.push(content.stack_overview);
  lines.push('');

  lines.push('## System');
  lines.push(content.system_diagram_text);
  lines.push('');

  lines.push('## Components');
  for (const component of content.components) {
    lines.push(`### ${component.name}`);
    lines.push(component.description);
    lines.push('');
    lines.push('**Responsibilities**');
    for (const responsibility of component.responsibilities) {
      lines.push(`- ${responsibility}`);
    }
    lines.push('');
  }

  lines.push('## Data model');
  lines.push(content.data_model);
  lines.push('');

  lines.push('## External services');
  if (content.external_services.length === 0) {
    lines.push('(none yet)');
    lines.push('');
  } else {
    for (const service of content.external_services) {
      lines.push(`### ${service.name}`);
      lines.push(service.purpose);
      if (service.notes) {
        lines.push('');
        lines.push(service.notes);
      }
      lines.push('');
    }
  }

  lines.push('## Auth & security');
  lines.push(content.auth_and_security);
  lines.push('');

  lines.push('## Hosting & deployment');
  lines.push(content.hosting_and_deployment);
  lines.push('');

  lines.push('## Decisions');
  if (content.decisions.length === 0) {
    lines.push('(none yet)');
    lines.push('');
  } else {
    for (const decision of content.decisions) {
      lines.push(`### ${decision.title} (${decisionStatusLabel(decision.status)})`);
      lines.push('');
      lines.push('**Context**');
      lines.push(decision.context);
      lines.push('');
      lines.push('**Decision**');
      lines.push(decision.decision);
      lines.push('');
      lines.push('**Consequences**');
      lines.push(decision.consequences);
      lines.push('');
    }
  }

  lines.push('## Open questions');
  if (content.open_questions.length === 0) {
    lines.push('(none yet)');
  } else {
    for (const question of content.open_questions) {
      lines.push(`- ${question}`);
    }
  }
  lines.push('');

  return lines.join('\n').trimEnd();
}

function decisionStatusLabel(status: ArchitectureDecisionStatus): string {
  switch (status) {
    case 'proposed':
      return 'Proposed';
    case 'accepted':
      return 'Accepted';
    case 'superseded':
      return 'Superseded';
    case 'rejected':
      return 'Rejected';
  }
}
