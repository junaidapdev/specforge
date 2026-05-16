import type { PrdContent, PrdFeaturePriority } from '@shared/schemas/prd.ts';

export function renderPrdMarkdown(content: PrdContent, projectName: string): string {
  const lines: string[] = [];

  lines.push(`# ${projectName} — PRD`);
  lines.push('');

  lines.push('## Goal');
  lines.push(content.goal);
  lines.push('');

  lines.push('## Target users');
  for (const user of content.target_users) {
    lines.push(`- ${user}`);
  }
  lines.push('');

  lines.push('## Problem statement');
  lines.push(content.problem_statement);
  lines.push('');

  lines.push('## Success criteria');
  for (const criterion of content.success_criteria) {
    lines.push(`- ${criterion}`);
  }
  lines.push('');

  lines.push('## Features');
  for (const feature of content.features) {
    lines.push(`### ${feature.name} (${priorityLabel(feature.priority)})`);
    lines.push(feature.description);
    lines.push('');
  }

  lines.push('## User stories');
  if (content.user_stories.length === 0) {
    lines.push('(none yet)');
    lines.push('');
  } else {
    for (const story of content.user_stories) {
      lines.push(`### ${story.persona}`);
      lines.push(story.story);
      lines.push('');
      lines.push('**Acceptance criteria**');
      for (const criterion of story.acceptance_criteria) {
        lines.push(`- ${criterion}`);
      }
      lines.push('');
    }
  }

  lines.push('## Out of scope');
  if (content.out_of_scope.length === 0) {
    lines.push('(none yet)');
  } else {
    for (const item of content.out_of_scope) {
      lines.push(`- ${item}`);
    }
  }
  lines.push('');

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

function priorityLabel(priority: PrdFeaturePriority): string {
  switch (priority) {
    case 'must_have':
      return 'Must have';
    case 'should_have':
      return 'Should have';
    case 'nice_to_have':
      return 'Nice to have';
  }
}
