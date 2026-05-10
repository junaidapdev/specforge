import type { GenerationConfig, GenerationType } from '@shared/ai/types.ts';

export const OPENAI_SHORT_MODEL = 'gpt-4o-mini';
export const ANTHROPIC_LONG_MODEL = 'claude-sonnet-4-6';

const OPENAI_STUB_PROMPT =
  'You are a helpful assistant. The real system prompt will be added in the owning generation chunk.';
const ANTHROPIC_STUB_PROMPT =
  'You are a helpful assistant. The real system prompt will be added in the owning generation chunk.';

// TODO(Chunk 09+): Replace each stub prompt when the owning generation feature is implemented.
export const GENERATION_CONFIG: Record<GenerationType, GenerationConfig> = {
  idea_clarification: {
    provider: 'openai',
    model: OPENAI_SHORT_MODEL,
    systemPrompt: OPENAI_STUB_PROMPT,
    temperature: 0.2,
    maxOutputTokens: 1200,
  },
  project_brief: {
    provider: 'anthropic',
    model: ANTHROPIC_LONG_MODEL,
    systemPrompt: ANTHROPIC_STUB_PROMPT,
    temperature: 0.3,
    maxOutputTokens: 4000,
  },
  prd_generation: {
    provider: 'anthropic',
    model: ANTHROPIC_LONG_MODEL,
    systemPrompt: ANTHROPIC_STUB_PROMPT,
    temperature: 0.3,
    maxOutputTokens: 6000,
  },
  prd_section_regenerate: {
    provider: 'anthropic',
    model: ANTHROPIC_LONG_MODEL,
    systemPrompt: ANTHROPIC_STUB_PROMPT,
    temperature: 0.25,
    maxOutputTokens: 2500,
  },
  architecture_generation: {
    provider: 'anthropic',
    model: ANTHROPIC_LONG_MODEL,
    systemPrompt: ANTHROPIC_STUB_PROMPT,
    temperature: 0.25,
    maxOutputTokens: 6000,
  },
  context_files_generation: {
    provider: 'anthropic',
    model: ANTHROPIC_LONG_MODEL,
    systemPrompt: ANTHROPIC_STUB_PROMPT,
    temperature: 0.25,
    maxOutputTokens: 6000,
  },
  chunk_generation: {
    provider: 'anthropic',
    model: ANTHROPIC_LONG_MODEL,
    systemPrompt: ANTHROPIC_STUB_PROMPT,
    temperature: 0.25,
    maxOutputTokens: 6000,
  },
  feature_spec_generation: {
    provider: 'anthropic',
    model: ANTHROPIC_LONG_MODEL,
    systemPrompt: ANTHROPIC_STUB_PROMPT,
    temperature: 0.25,
    maxOutputTokens: 7000,
  },
  agent_prompt_generation: {
    provider: 'openai',
    model: OPENAI_SHORT_MODEL,
    systemPrompt: OPENAI_STUB_PROMPT,
    temperature: 0.2,
    maxOutputTokens: 3000,
  },
  issue_to_spec: {
    provider: 'openai',
    model: OPENAI_SHORT_MODEL,
    systemPrompt: OPENAI_STUB_PROMPT,
    temperature: 0.2,
    maxOutputTokens: 3500,
  },
  knowledge_extraction: {
    provider: 'anthropic',
    model: ANTHROPIC_LONG_MODEL,
    systemPrompt: ANTHROPIC_STUB_PROMPT,
    temperature: 0.2,
    maxOutputTokens: 5000,
  },
};
