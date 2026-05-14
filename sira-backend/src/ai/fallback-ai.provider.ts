import { Injectable, Logger } from '@nestjs/common';
import { AiProvider, AiCompleteOptions } from './ai-provider.abstract';
import { AnthropicProvider } from './providers/anthropic.provider';
import { GeminiProvider } from './providers/gemini.provider';

@Injectable()
export class FallbackAiProvider extends AiProvider {
  private readonly logger = new Logger(FallbackAiProvider.name);

  constructor(
    private readonly anthropic: AnthropicProvider,
    private readonly gemini: GeminiProvider,
  ) {
    super();
  }

  async complete(options: AiCompleteOptions): Promise<string> {
    try {
      return await this.anthropic.complete(options);
    } catch (error) {
      this.logger.warn(`Claude indisponível (${error.message}). Ativando fallback Gemini.`);
      return await this.gemini.complete(options);
    }
  }
}
