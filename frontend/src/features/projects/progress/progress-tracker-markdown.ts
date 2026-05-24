import type { ChunkEffort, ChunkStatus } from '@shared/schemas/chunks';

type ProgressChunkSummary = {
  ref: string | null;
  title: string;
  description: string;
  status: ChunkStatus;
  estimated_effort: ChunkEffort;
  position: number;
};

type RenderProgressTrackerInput = {
  projectName: string;
  projectStatus: string;
  chunks: ProgressChunkSummary[];
  generatedAt: string;
};

const STATUS_LABELS: Record<ChunkStatus, string> = {
  backlog: 'Backlog',
  in_progress: 'In progress',
  done: 'Done',
  blocked: 'Blocked',
};

const EFFORT_LABELS: Record<ChunkEffort, string> = {
  xs: 'XS',
  s: 'S',
  m: 'M',
  l: 'L',
  xl: 'XL',
};

const GROUP_ORDER: readonly ChunkStatus[] = ['in_progress', 'blocked', 'backlog', 'done'];

export function renderProgressTrackerMarkdown(input: RenderProgressTrackerInput): string {
  const counts = countByStatus(input.chunks);
  const lines: string[] = [
    `# ${input.projectName} - Progress Tracker`,
    '',
    `*Project status: \`${input.projectStatus}\` | Synced: ${formatDate(input.generatedAt)}*`,
    '',
    '## Overview',
    '',
    `- Total chunks: ${input.chunks.length}`,
    `- Done: ${counts.done}`,
    `- In progress: ${counts.in_progress}`,
    `- Backlog: ${counts.backlog}`,
    `- Blocked: ${counts.blocked}`,
    '',
  ];

  for (const status of GROUP_ORDER) {
    const chunks = input.chunks
      .filter((chunk) => chunk.status === status)
      .sort((left, right) => left.position - right.position);

    if (chunks.length === 0) {
      continue;
    }

    lines.push(`## ${STATUS_LABELS[status]}`, '');

    for (const chunk of chunks) {
      const title = escapeMarkdownAndCollapse(chunk.title);
      const description = escapeMarkdownAndCollapse(chunk.description);
      const ref = chunk.ref ? ` (${escapeMarkdownAndCollapse(chunk.ref)})` : '';
      lines.push(`- **${title}**${ref} - ${EFFORT_LABELS[chunk.estimated_effort]}`);
      lines.push(`  ${description}`);
    }

    lines.push('');
  }

  lines.push('## Notes for next agent', '', buildNextAgentNote(input.chunks, counts), '');

  return lines.join('\n');
}

function countByStatus(chunks: ProgressChunkSummary[]): Record<ChunkStatus, number> {
  return {
    backlog: chunks.filter((chunk) => chunk.status === 'backlog').length,
    in_progress: chunks.filter((chunk) => chunk.status === 'in_progress').length,
    done: chunks.filter((chunk) => chunk.status === 'done').length,
    blocked: chunks.filter((chunk) => chunk.status === 'blocked').length,
  };
}

function buildNextAgentNote(
  chunks: ProgressChunkSummary[],
  counts: Record<ChunkStatus, number>,
): string {
  if (counts.in_progress > 0) {
    return '- Continue with the current in-progress chunk(s) before starting new ones.';
  }

  if (counts.backlog > 0) {
    return '- Pick the next chunk from Backlog and move it to In progress.';
  }

  if (counts.blocked > 0) {
    return '- Some chunks are blocked; resolve blockers before moving work forward.';
  }

  if (counts.done === chunks.length && chunks.length > 0) {
    return '- All chunks are complete. Project is ready for release or follow-up work.';
  }

  return '- No chunks generated yet.';
}

function formatDate(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

function escapeMarkdownAndCollapse(value: string): string {
  return value
    .replace(/\r\n?|\n/g, ' ')
    .replace(/([\\`*_{}[\]<>()#+\-.!|>~])/g, '\\$1');
}
