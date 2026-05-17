import { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROUTES } from '@/constants/routes';
import { useChunk } from '@/features/projects/chunks/useChunk';

import { ChunkHeader } from './ChunkHeader';
import { FeatureSpecError } from './FeatureSpecError';
import { FeatureSpecPending } from './FeatureSpecPending';
import { FeatureSpecTab } from './FeatureSpecTab';
import { FEATURE_SPEC_MESSAGES } from './messages';
import { NotesTab } from './NotesTab';
import { PromptTab } from './PromptTab';

type ChunkDetailTab = 'spec' | 'prompt' | 'notes';

export function ChunkDetailPage() {
  const { id, chunkId } = useParams<{ id: string; chunkId: string }>();
  const [activeTab, setActiveTab] = useState<ChunkDetailTab>('spec');
  const chunkQuery = useChunk(chunkId ?? '', Boolean(chunkId));

  if (!id || !chunkId) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  if (chunkQuery.isPending) {
    return <FeatureSpecPending />;
  }

  if (chunkQuery.isError) {
    return (
      <FeatureSpecError
        onRetry={() => {
          void chunkQuery.refetch();
        }}
      />
    );
  }

  if (chunkQuery.data.project_id !== id) {
    return <Navigate to={ROUTES.PROJECT_CHUNK(chunkQuery.data.project_id, chunkQuery.data.id)} replace />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <ChunkHeader chunk={chunkQuery.data} projectId={id} />
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value as ChunkDetailTab);
        }}
      >
        <TabsList className="flex h-auto w-full justify-start overflow-x-auto">
          <TabsTrigger value="spec" className="shrink-0">
            {FEATURE_SPEC_MESSAGES.TAB_SPEC}
          </TabsTrigger>
          <TabsTrigger value="prompt" className="shrink-0">
            {FEATURE_SPEC_MESSAGES.TAB_PROMPT}
          </TabsTrigger>
          <TabsTrigger value="notes" className="shrink-0">
            {FEATURE_SPEC_MESSAGES.TAB_NOTES}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="spec" className="mt-6">
          <FeatureSpecTab
            chunk={chunkQuery.data}
            onOpenPrompt={() => {
              setActiveTab('prompt');
            }}
          />
        </TabsContent>
        <TabsContent value="prompt" className="mt-6">
          <PromptTab />
        </TabsContent>
        <TabsContent value="notes" className="mt-6">
          <NotesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
