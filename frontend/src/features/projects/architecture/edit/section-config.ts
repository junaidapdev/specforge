import type { ArchitectureContent, ArchitectureSectionKey } from '@shared/schemas/architecture';

import { ARCHITECTURE_MESSAGES } from '../messages';

export type ArchitectureSectionKind =
  | 'prose'
  | 'components'
  | 'external_services'
  | 'decisions'
  | 'string_list';

export type ArchitectureSectionConfigEntry = {
  key: ArchitectureSectionKey;
  label: string;
  kind: ArchitectureSectionKind;
};

export const ARCHITECTURE_SECTION_CONFIG: readonly ArchitectureSectionConfigEntry[] = [
  {
    key: 'stack_overview',
    label: ARCHITECTURE_MESSAGES.SECTION_STACK_OVERVIEW,
    kind: 'prose',
  },
  { key: 'system_diagram_text', label: ARCHITECTURE_MESSAGES.SECTION_SYSTEM, kind: 'prose' },
  { key: 'components', label: ARCHITECTURE_MESSAGES.SECTION_COMPONENTS, kind: 'components' },
  { key: 'data_model', label: ARCHITECTURE_MESSAGES.SECTION_DATA_MODEL, kind: 'prose' },
  {
    key: 'external_services',
    label: ARCHITECTURE_MESSAGES.SECTION_EXTERNAL_SERVICES,
    kind: 'external_services',
  },
  {
    key: 'auth_and_security',
    label: ARCHITECTURE_MESSAGES.SECTION_AUTH_SECURITY,
    kind: 'prose',
  },
  {
    key: 'hosting_and_deployment',
    label: ARCHITECTURE_MESSAGES.SECTION_HOSTING,
    kind: 'prose',
  },
  { key: 'decisions', label: ARCHITECTURE_MESSAGES.SECTION_DECISIONS, kind: 'decisions' },
  {
    key: 'open_questions',
    label: ARCHITECTURE_MESSAGES.SECTION_OPEN_QUESTIONS,
    kind: 'string_list',
  },
];

export type ArchitectureSectionValue = ArchitectureContent[ArchitectureSectionKey];

export function getArchitectureSectionConfig(
  sectionKey: ArchitectureSectionKey,
): ArchitectureSectionConfigEntry {
  const config = ARCHITECTURE_SECTION_CONFIG.find((entry) => entry.key === sectionKey);

  if (!config) {
    throw new Error('Unknown architecture section key.');
  }

  return config;
}

export function getArchitectureSectionValue<K extends ArchitectureSectionKey>(
  content: ArchitectureContent,
  sectionKey: K,
): ArchitectureContent[K] {
  return content[sectionKey];
}

export function setArchitectureSectionValue(
  content: ArchitectureContent,
  sectionKey: ArchitectureSectionKey,
  value: ArchitectureSectionValue,
): ArchitectureContent {
  return { ...content, [sectionKey]: value };
}
