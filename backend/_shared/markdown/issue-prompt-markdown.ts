import type { IssuePromptModelOutput, IssueSeverity } from '@shared/schemas/issue.ts';

type AssembleIssuePromptInput = {
  ai: IssuePromptModelOutput;
  projectName: string;
  issueTitle: string;
  issueDescription: string;
  severity: IssueSeverity;
  linkedChunkTitle?: string;
};

export function assembleIssuePrompt(input: AssembleIssuePromptInput): string {
  const { ai, projectName, issueTitle, issueDescription, severity, linkedChunkTitle } = input;
  const lines: string[] = [];

  lines.push(`# Issue: ${issueTitle}`);
  lines.push('');
  lines.push(
    `*Project: ${projectName} · Severity: ${severity}${
      linkedChunkTitle ? ` · Related chunk: ${linkedChunkTitle}` : ''
    }*`,
  );
  lines.push('');
  lines.push('## Your role');
  lines.push(ai.role_intro);
  lines.push('');
  lines.push('## Original report');
  lines.push(issueDescription);
  lines.push('');
  lines.push('## What to fix');
  lines.push(ai.what_to_fix);
  lines.push('');
  lines.push('## Acceptance');
  lines.push(ai.acceptance);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push(
    'When complete, summarize: files changed, root cause, and regression checks added. Then mark the issue resolved.',
  );

  return lines.join('\n').trimEnd();
}
