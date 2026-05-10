import type { ZodSchema } from 'zod';

import { callProvider as callAnthropicProvider } from '@shared/ai/anthropic.ts';
import { GENERATION_CONFIG } from '@shared/ai/config.ts';
import { callProvider as callOpenAiProvider } from '@shared/ai/openai.ts';
import type { GenerationResult, GenerationType } from '@shared/ai/types.ts';
import { AiInvalidOutputError } from '@shared/ai/types.ts';

export async function generate<T>(
  type: GenerationType,
  userInput: unknown,
  outputSchema: ZodSchema<T>,
): Promise<GenerationResult<T>> {
  const config = GENERATION_CONFIG[type];
  const start = performance.now();

  const providerResult = config.provider === 'openai'
    ? await callOpenAiProvider(config, userInput)
    : await callAnthropicProvider(config, userInput);

  const latencyMs = Math.round(performance.now() - start);

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(providerResult.content);
  } catch {
    throw new AiInvalidOutputError('The AI returned non-JSON output.');
  }

  const parsedOutput = outputSchema.safeParse(parsedJson);

  if (!parsedOutput.success) {
    throw new AiInvalidOutputError();
  }

  return {
    data: parsedOutput.data,
    meta: {
      provider: config.provider,
      model: config.model,
      inputTokens: providerResult.inputTokens,
      outputTokens: providerResult.outputTokens,
      latencyMs,
    },
  };
}
