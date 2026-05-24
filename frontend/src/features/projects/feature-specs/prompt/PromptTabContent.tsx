import { useState } from 'react';

import { useExistingFeatureSpec } from '@/features/projects/feature-specs/useExistingFeatureSpec';
import type { TargetAgent } from '@shared/schemas/agent-prompt';

import { AgentTargetSelector } from './AgentTargetSelector';
import { PromptDisplay } from './PromptDisplay';
import { PromptEmptyState } from './PromptEmptyState';
import { PromptError } from './PromptError';
import { PromptPending } from './PromptPending';
import { SpecRequiredState } from './SpecRequiredState';
import { useAgentPromptsForChunk } from './useAgentPromptsForChunk';
import { useGenerateAgentPrompt } from './useGenerateAgentPrompt';

type PromptTabContentProps = {
  chunkId: string;
  onOpenSpec: () => void;
};

export function PromptTabContent({ chunkId, onOpenSpec }: PromptTabContentProps) {
  const specQuery = useExistingFeatureSpec(chunkId);
  const promptsQuery = useAgentPromptsForChunk(chunkId);
  const generate = useGenerateAgentPrompt();
  const [target, setTarget] = useState<TargetAgent>('claude_code');

  if (specQuery.isPending || promptsQuery.isPending) {
    return <PromptPending />;
  }

  if (specQuery.isError) {
    return (
      <PromptError
        onRetry={() => {
          void specQuery.refetch();
        }}
      />
    );
  }

  if (!specQuery.data) {
    return <SpecRequiredState onOpenSpec={onOpenSpec} />;
  }

  if (promptsQuery.isError) {
    return (
      <PromptError
        onRetry={() => {
          void promptsQuery.refetch();
        }}
      />
    );
  }

  const promptsByTarget = promptsQuery.data ?? {};
  const currentPrompt = promptsByTarget[target];
  const isGeneratingForCurrentTarget = generate.isPending &&
    generate.variables?.targetAgent === target;
  const showCurrentTargetError = generate.isError && generate.variables?.targetAgent === target;

  return (
    <div className="space-y-6">
      <AgentTargetSelector value={target} onChange={setTarget} />

      {isGeneratingForCurrentTarget ? (
        <PromptPending />
      ) : currentPrompt ? (
        <PromptDisplay
          prompt={currentPrompt}
          onRegenerate={() => {
            generate.mutate({ chunkId, targetAgent: target });
          }}
        />
      ) : (
        <PromptEmptyState
          onGenerate={() => {
            generate.mutate({ chunkId, targetAgent: target });
          }}
          isPending={generate.isPending}
        />
      )}

      {showCurrentTargetError ? (
        <PromptError
          onRetry={() => {
            generate.mutate({ chunkId, targetAgent: target });
          }}
        />
      ) : null}
    </div>
  );
}
