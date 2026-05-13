import OpenAI from 'openai';

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
  return error instanceof Error ? error.message : 'OpenAI request failed.';
}

export async function callProvider(
  config: GenerationConfig,
  userInput: unknown,
): Promise<ProviderTextResult> {
  const client = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
  });

  try {
    const response = await client.chat.completions.create({
      model: config.model,
      messages: [
        { role: 'system', content: config.systemPrompt },
        { role: 'user', content: toPromptText(userInput) },
      ],
      temperature: config.temperature,
      max_tokens: config.maxOutputTokens ?? DEFAULT_MAX_OUTPUT_TOKENS,
      response_format: config.responseFormat ? { type: config.responseFormat } : undefined,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new AiProviderError('openai', undefined, 'OpenAI returned an empty response.');
    }

    return {
      content,
      inputTokens: response.usage?.prompt_tokens ?? 0,
      outputTokens: response.usage?.completion_tokens ?? 0,
    };
  } catch (error) {
    if (error instanceof AiProviderError) {
      throw error;
    }

    throw new AiProviderError('openai', getErrorStatus(error), getErrorMessage(error));
  }
}
