import { PromptTabContent } from './prompt/PromptTabContent';

type PromptTabProps = {
  chunkId: string;
  onOpenSpec: () => void;
};

export function PromptTab({ chunkId, onOpenSpec }: PromptTabProps) {
  return <PromptTabContent chunkId={chunkId} onOpenSpec={onOpenSpec} />;
}
