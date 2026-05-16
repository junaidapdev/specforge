import type { PrdContent, PrdSectionKey } from '@shared/schemas/prd';

import { PRD_MESSAGES } from '../messages';

export type PrdSectionKind = 'prose' | 'string_list' | 'features' | 'user_stories';

export type SectionConfigEntry = {
  key: PrdSectionKey;
  label: string;
  kind: PrdSectionKind;
};

export const PRD_SECTION_CONFIG: readonly SectionConfigEntry[] = [
  { key: 'goal', label: PRD_MESSAGES.SECTION_GOAL, kind: 'prose' },
  { key: 'target_users', label: PRD_MESSAGES.SECTION_TARGET_USERS, kind: 'string_list' },
  { key: 'problem_statement', label: PRD_MESSAGES.SECTION_PROBLEM, kind: 'prose' },
  {
    key: 'success_criteria',
    label: PRD_MESSAGES.SECTION_SUCCESS_CRITERIA,
    kind: 'string_list',
  },
  { key: 'features', label: PRD_MESSAGES.SECTION_FEATURES, kind: 'features' },
  { key: 'user_stories', label: PRD_MESSAGES.SECTION_USER_STORIES, kind: 'user_stories' },
  { key: 'out_of_scope', label: PRD_MESSAGES.SECTION_OUT_OF_SCOPE, kind: 'string_list' },
  { key: 'open_questions', label: PRD_MESSAGES.SECTION_OPEN_QUESTIONS, kind: 'string_list' },
];

export type PrdSectionValue = PrdContent[PrdSectionKey];

export function getSectionConfig(sectionKey: PrdSectionKey): SectionConfigEntry {
  const config = PRD_SECTION_CONFIG.find((entry) => entry.key === sectionKey);

  if (!config) {
    throw new Error('Unknown PRD section key.');
  }

  return config;
}

export function getSectionValue<K extends PrdSectionKey>(
  content: PrdContent,
  sectionKey: K,
): PrdContent[K] {
  return content[sectionKey];
}

export function setSectionValue(
  content: PrdContent,
  sectionKey: PrdSectionKey,
  value: PrdSectionValue,
): PrdContent {
  return { ...content, [sectionKey]: value };
}
