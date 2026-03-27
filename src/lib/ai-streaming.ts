/**
 * Streaming AI response utilities
 * Provides streaming support for OpenAI API responses
 */

import OpenAI from 'openai';

export interface StreamingOptions {
  onStart?: () => void;
  onToken?: (token: string) => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

export async function streamAIResponse(
  openai: OpenAI,
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  options: StreamingOptions = {}
): Promise<string> {
  try {
    options.onStart?.();

    const stream = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      stream: true,
      max_tokens: 1000,
      temperature: 0.7,
    });

    let fullResponse = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;

      if (content) {
        fullResponse += content;
        options.onToken?.(content);
      }
    }

    options.onEnd?.();
    return fullResponse;
  } catch (error) {
    options.onError?.(error as Error);
    throw error;
  }
}

export async function streamAIResponseWithCurriculum(
  openai: OpenAI,
  systemPrompt: string,
  userQuery: string,
  options: StreamingOptions = {}
): Promise<string> {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: systemPrompt,
    },
    {
      role: 'user',
      content: userQuery,
    },
  ];

  return streamAIResponse(openai, messages, options);
}
