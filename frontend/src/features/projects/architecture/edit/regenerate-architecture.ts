import { callEdgeFunction } from '@/lib/edge';
import { logger } from '@/lib/logger';
import {
  RegenerateArchitectureSectionOutputSchema,
  type ArchitectureSectionKey,
  type RegenerateArchitectureSectionOutput,
} from '@shared/schemas/architecture';

type ArchitectureRegenerationTarget =
  | { mode: 'full_section'; sectionKey: ArchitectureSectionKey }
  | { mode: 'single_decision'; decisionId: string };

export async function regenerateArchitectureTarget(
  projectId: string,
  accessToken: string,
  target: ArchitectureRegenerationTarget,
): Promise<RegenerateArchitectureSectionOutput> {
  const data = await callEdgeFunction<RegenerateArchitectureSectionOutput>(
    'regenerate-architecture-section',
    { projectId, ...target },
    accessToken,
  );
  const parsed = RegenerateArchitectureSectionOutputSchema.safeParse(data);

  if (!parsed.success) {
    logger.error('architecture_regen_invalid_local', { issues: parsed.error.issues });
    throw new Error('ARCHITECTURE_REGEN_INVALID');
  }

  return parsed.data;
}
