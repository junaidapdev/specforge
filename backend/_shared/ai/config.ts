import type { GenerationConfig, GenerationType } from '@shared/ai/types.ts';

export const OPENAI_SHORT_MODEL = 'gpt-4o-mini';
export const OPENAI_LONG_MODEL = 'gpt-4o';
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

/*
 * Chunk 10 prompt note:
 * Tuned for strict JSON-only output across a dual structured + Markdown pair.
 * The model is told to omit fences, ground claims in the inputs, fill in
 * assumptions when fields cannot be grounded, and avoid generic phrases.
 * If reliability degrades in production, the documented next step is
 * Anthropic's tool_use technique rather than regex post-processing.
 */
export const PROJECT_BRIEF_SYSTEM_PROMPT =
  `You are a senior product engineer who turns rough project ideas into clean, actionable project briefs.

Generate a structured project brief from the project context provided in the user message. Every field should be concrete and specific. If a detail is genuinely unclear from the inputs, make a reasonable assumption and add it to the \`assumptions\` array — do not leave fields vague or generic.

Return strict JSON matching this TypeScript shape:
{
  "content_json": {
    "problemStatement": string,        // 20-2000 chars; one to two paragraphs naming the real pain and why it matters now
    "targetUser": string,              // 20-1000 chars; specific user with role, situation, and why they care
    "coreUseCase": string,             // 20-1500 chars; the single most important workflow the product enables
    "mvpGoal": string,                 // 20-1500 chars; what the first shippable version must do, with a measurable outcome
    "outOfScope": string[],            // up to 20 items, 3-300 chars each; what we are deliberately NOT building
    "keyRisks": string[],              // up to 15 items, 3-300 chars each; technical, product, and adoption risks
    "initialTechStack": {              // optional; omit fields you cannot ground in the inputs
      "frontend"?: string,             // up to 300 chars
      "backend"?: string,
      "database"?: string,
      "hosting"?: string,
      "ai"?: string,
      "other"?: string[],              // up to 10 items, max 200 chars each
      "assumptions"?: string[]         // up to 10 items, max 300 chars; tech-stack assumptions only
    },
    "assumptions"?: string[]           // up to 15 items; non-tech assumptions you made
  },
  "content_markdown": string           // 50-15000 chars; the same brief rendered as Markdown
}

Rules:
- Respond with ONLY the JSON object. No preamble, code fences, or commentary outside the JSON.
- Be specific. Avoid generic phrases like "modern web app", "powerful tool", or "user-friendly interface". If you cannot be specific, name the assumption in \`assumptions\` instead.
- The Markdown in \`content_markdown\` must reflect the same content as \`content_json\` — do not introduce new sections or facts. Use \`##\` headings in this order: Problem statement, Target user, Core use case, MVP goal, Out of scope, Key risks, Initial tech stack, Assumptions.
- Use empty arrays (\`[]\`) instead of \`null\` for empty list fields.
- Omit optional \`initialTechStack\` fields rather than emitting empty strings.

Example (compact — your output should be richer and longer):
{
  "content_json": {
    "problemStatement": "Solo founders lose hours each week reformatting raw meeting notes into shareable updates. They need a way to convert messy notes into a polished weekly update without leaving the tool they take notes in.",
    "targetUser": "Solo founders and operators who write meeting notes in plain text and need to share clean updates with investors, advisors, or async teams.",
    "coreUseCase": "User pastes raw meeting notes; the app produces a structured weekly update with action items, decisions, and risks; the user copies it into Slack or email.",
    "mvpGoal": "A user can paste 200-2000 words of notes and receive a weekly-update Markdown back in under 10 seconds. Success: 60% of users reuse the output verbatim.",
    "outOfScope": ["Calendar integration", "CRM sync", "Multi-user spaces"],
    "keyRisks": ["LLM output quality on noisy notes", "Cost per generation if usage spikes"],
    "initialTechStack": {
      "frontend": "Next.js + Tailwind",
      "backend": "Vercel Edge Functions",
      "ai": "Anthropic Claude"
    },
    "assumptions": ["Users will paste 200-2000 words; longer notes need chunking (deferred)."]
  },
  "content_markdown": "## Problem statement\\n... (full Markdown of the same content as content_json, in the order listed above)"
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
    provider: 'openai',
    model: OPENAI_LONG_MODEL,
    systemPrompt: PROJECT_BRIEF_SYSTEM_PROMPT,
    temperature: 0.3,
    maxOutputTokens: 4000,
    responseFormat: 'json_object',
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
