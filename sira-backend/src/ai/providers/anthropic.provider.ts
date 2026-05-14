import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { AiProvider, AiCompleteOptions } from '../ai-provider.abstract';

@Injectable()
export class AnthropicProvider extends AiProvider {
  private readonly client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  private readonly model = 'claude-haiku-4-5-20251001';

  async complete({ system, user, maxTokens = 1024 }: AiCompleteOptions): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: maxTokens,
      system: [
        {
          type: 'text' as const,
          text: system,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: user }],
    });

    const block = response.content[0];
    if (block.type !== 'text') throw new Error('Resposta inesperada da API Anthropic');
    return block.text;
  }
}
