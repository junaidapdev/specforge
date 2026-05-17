export type GenerationType =
  | 'idea_clarification'
  | 'project_brief'
  | 'prd_generation'
  | 'prd_section_regenerate'
  | 'architecture_generation'
  | 'architecture_section_regeneration'
  | 'context_files_generation'
  | 'context_doc_regenerate'
  | 'chunk_generation'
  | 'feature_spec_generation'
  | 'feature_spec_section_regeneration'
  | 'agent_prompt_generation'
  | 'issue_to_spec'
  | 'knowledge_extraction';

export type Provider = 'openai' | 'anthropic';

export interface GenerationConfig {
  provider: Provider;
  model: string;
  systemPrompt: string;
  temperature?: number;
  maxOutputTokens?: number;
  responseFormat?: 'json_object';
}

export interface GenerationResult<T = unknown> {
  data: T;
  meta: {
    provider: Provider;
    model: string;
    inputTokens: number;
    outputTokens: number;
    latencyMs: number;
  };
}

export interface ProviderTextResult {
  content: string;
  inputTokens: number;
  outputTokens: number;
}

export class AiProviderError extends Error {
  constructor(
    readonly provider: Provider,
    readonly status: number | undefined,
    message: string,
  ) {
    super(message);
    this.name = 'AiProviderError';
  }
}

export class AiInvalidOutputError extends Error {
  constructor(message = 'The AI returned a response that could not be parsed.') {
    super(message);
    this.name = 'AiInvalidOutputError';
  }
}
