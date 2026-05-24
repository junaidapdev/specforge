import { ROUTES } from '@/constants/routes';
import type { Project } from '@/types/project';

import { OVERVIEW_MESSAGES } from './messages';

export type NextActionInputs = {
  project: Project;
  briefExists: boolean;
  briefApproved: boolean;
  prdExists: boolean;
  prdApproved: boolean;
  architectureExists: boolean;
  architectureApproved: boolean;
  contextFilesExist: boolean;
  contextFilesApproved: boolean;
  chunksExist: boolean;
  hasInProgressChunk: boolean;
  hasIncompleteChunk: boolean;
  allChunksDone: boolean;
};

export type NextAction = {
  label: string;
  to: string | null;
  id:
    | 'brief_generate'
    | 'brief_approve'
    | 'prd_generate'
    | 'prd_approve'
    | 'architecture_generate'
    | 'architecture_approve'
    | 'context_files_generate'
    | 'context_files_review'
    | 'chunks_generate'
    | 'first_chunk'
    | 'continue'
    | 'done';
};

export function recommendNextAction(input: NextActionInputs): NextAction {
  const projectId = input.project.id;

  if (!input.briefExists) {
    return {
      id: 'brief_generate',
      label: OVERVIEW_MESSAGES.NEXT_ACTION_BRIEF_GENERATE,
      to: ROUTES.PROJECT_BRIEF(projectId),
    };
  }

  if (!input.briefApproved) {
    return {
      id: 'brief_approve',
      label: OVERVIEW_MESSAGES.NEXT_ACTION_BRIEF_APPROVE,
      to: ROUTES.PROJECT_BRIEF(projectId),
    };
  }

  if (!input.prdExists) {
    return {
      id: 'prd_generate',
      label: OVERVIEW_MESSAGES.NEXT_ACTION_PRD,
      to: ROUTES.PROJECT_PRD(projectId),
    };
  }

  if (!input.prdApproved) {
    return {
      id: 'prd_approve',
      label: OVERVIEW_MESSAGES.NEXT_ACTION_PRD_APPROVE,
      to: ROUTES.PROJECT_PRD(projectId),
    };
  }

  if (!input.architectureExists) {
    return {
      id: 'architecture_generate',
      label: OVERVIEW_MESSAGES.NEXT_ACTION_ARCHITECTURE,
      to: ROUTES.PROJECT_ARCHITECTURE(projectId),
    };
  }

  if (!input.architectureApproved) {
    return {
      id: 'architecture_approve',
      label: OVERVIEW_MESSAGES.NEXT_ACTION_ARCHITECTURE_APPROVE,
      to: ROUTES.PROJECT_ARCHITECTURE(projectId),
    };
  }

  if (!input.contextFilesExist) {
    return {
      id: 'context_files_generate',
      label: OVERVIEW_MESSAGES.NEXT_ACTION_CONTEXT_FILES,
      to: ROUTES.PROJECT_CONTEXT(projectId),
    };
  }

  if (!input.contextFilesApproved) {
    return {
      id: 'context_files_review',
      label: OVERVIEW_MESSAGES.NEXT_ACTION_CONTEXT_FILES_REVIEW,
      to: ROUTES.PROJECT_CONTEXT(projectId),
    };
  }

  if (!input.chunksExist) {
    return {
      id: 'chunks_generate',
      label: OVERVIEW_MESSAGES.NEXT_ACTION_CHUNKS,
      to: ROUTES.PROJECT_CHUNKS(projectId),
    };
  }

  if (input.project.status === 'completed' || input.allChunksDone) {
    return {
      id: 'done',
      label: OVERVIEW_MESSAGES.NEXT_ACTION_DONE,
      to: ROUTES.PROJECT_EXPORT(projectId),
    };
  }

  if (input.project.status === 'ready_to_build' && input.hasIncompleteChunk) {
    return {
      id: 'first_chunk',
      label: OVERVIEW_MESSAGES.NEXT_ACTION_FIRST_CHUNK,
      to: ROUTES.PROJECT_CHUNKS(projectId),
    };
  }

  if (input.project.status === 'building' && input.hasInProgressChunk) {
    return {
      id: 'continue',
      label: OVERVIEW_MESSAGES.NEXT_ACTION_CONTINUE,
      to: ROUTES.PROJECT_PROGRESS(projectId),
    };
  }

  if (!input.hasInProgressChunk && input.hasIncompleteChunk) {
    return {
      id: 'first_chunk',
      label: OVERVIEW_MESSAGES.NEXT_ACTION_FIRST_CHUNK,
      to: ROUTES.PROJECT_CHUNKS(projectId),
    };
  }

  return {
    id: 'continue',
    label: OVERVIEW_MESSAGES.NEXT_ACTION_CONTINUE,
    to: ROUTES.PROJECT_PROGRESS(projectId),
  };
}
