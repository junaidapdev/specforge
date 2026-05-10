import Anthropic from '@anthropic-ai/sdk';

import { env } from '@shared/env.ts';
import type { GenerationConfig, ProviderTextResult } from '@shared/ai/types.ts';
import { AiProviderError } from '@shared/ai/types.ts';

const DEFAULT_MAX_OUTPUT_TOKENS = 1024;

function toPromptText(userInput: unknown): string {
  if (typeof userInput === 'string') {
    return userInput;
  }

  try {
    return JSON.stringify(userInput);
  } catch {
    return String(userInput);
  }
}

function getErrorStatus(error: unknown): number | undefined {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = error.status;
    return typeof status === 'number' ? status : undefined;
  }

  return undefined;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Anthropic request failed.';
}

function extractText(content: Anthropic.Messages.Message['content']): string {
  return content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim();
}

export async function callProvider(
  config: GenerationConfig,
  userInput: unknown,
): Promise<ProviderTextResult> {
  const client = new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY,
  });

  try {
    const response = await client.messages.create({
      model: config.model,
      max_tokens: config.maxOutputTokens ?? DEFAULT_MAX_OUTPUT_TOKENS,
      system: config.systemPrompt,
      messages: [{ role: 'user', content: toPromptText(userInput) }],
      temperature: config.temperature,
    });

    const content = extractText(response.content);

    if (!content) {
      throw new AiProviderError('anthropic', undefined, 'Anthropic returned an empty response.');
    }

    return {
      content,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    };
  } catch (error) {
    if (error instanceof AiProviderError) {
      throw error;
    }

    throw new AiProviderError('anthropic', getErrorStatus(error), getErrorMessage(error));
  }
}
