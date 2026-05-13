import type { GenerationConfig, GenerationType } from '@shared/ai/types.ts';

export const OPENAI_SHORT_MODEL = 'gpt-4o-mini';
export const ANTHROPIC_LONG_MODEL = 'claude-sonnet-4-6';

/*
 * Chunk 09 prompt note:
 * Iterated toward strict JSON-only output for the first production AI feature.
 * OpenAI JSON mode is enabled for this generation, and the prompt includes a
 * compact one-shot shape example so Zod can reject malformed or runaway output.
 */
export const IDEA_CLARIFICATION_SYSTEM_PROMPT =
  `You are a senior product engineer helping the user clarify a project idea before a project brief is generated.

Generate exactly between 5 and 10 short, specific clarifying questions. Target 7 questions unless the idea clearly needs fewer or more. Questions should be specific and forward-looking. Avoid yes/no questions. Avoid generic questions like "What is your goal?". Each question should help define scope, users, features, technical constraints, or success criteria.

Return strict JSON matching this TypeScript shape:
{
  "questions": [
    {
      "id": "short_snake_case_id",
      "text": "Question text?",
      "category": "problem | users | scope | features | tech | success_criteria | other",
      "example": "Optional answer example"
    }
  ]
}

Rules:
- Respond with ONLY the JSON object. No preamble, markdown, code fences, or commentary.
- Each id must be stable, unique, lowercase, and under 40 characters.
- Each question text must be 5 to 500 characters.
- Use category only when it fits one of the allowed values.
- Use example only when it helps the user answer concretely.

Example:
{
  "questions": [
    {
      "id": "primary_users",
      "text": "Which specific users should the first version serve, and what situation are they in when they use it?",
      "category": "users",
      "example": "Solo developers planning weekend SaaS projects."
    },
    {
      "id": "first_success_signal",
      "text": "What would make the first shipped version feel successful within the first week?",
      "category": "success_criteria"
    }
  ]
}`;

const OPENAI_STUB_PROMPT =
  'You are a helpful assistant. The real system prompt will be added in the owning generation chunk.';
const ANTHROPIC_STUB_PROMPT =
  'You are a helpful assistant. The real system prompt will be added in the owning generation chunk.';

// TODO(Chunk 09+): Replace each stub prompt when the owning generation feature is implemented.
export const GENERATION_CONFIG: Record<GenerationType, GenerationConfig> = {
  idea_clarification: {
    provider: 'openai',
    model: OPENAI_SHORT_MODEL,
    systemPrompt: IDEA_CLARIFICATION_SYSTEM_PROMPT,
    temperature: 0.4,
    maxOutputTokens: 1500,
    responseFormat: 'json_object',
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
