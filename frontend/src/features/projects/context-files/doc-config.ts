import type { ContextFileType } from '@shared/schemas/context-files';

export const CONTEXT_DOC_ORDER: readonly ContextFileType[] = [
  'project_overview',
  'code_standards',
  'ai_workflow_rules',
  'ui_context',
  'agents_md',
  'claude_md',
  'progress_tracker',
] as const;

export const CONTEXT_DOC_TOTAL = CONTEXT_DOC_ORDER.length;
export const DEFAULT_CONTEXT_DOC_TYPE: ContextFileType = 'project_overview';
