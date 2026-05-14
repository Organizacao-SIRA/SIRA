import { Module } from '@nestjs/common';
import { AiProvider } from './ai-provider.abstract';
import { AnthropicProvider } from './providers/anthropic.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { FallbackAiProvider } from './fallback-ai.provider';

@Module({
  providers: [
    AnthropicProvider,
    GeminiProvider,
    {
      provide: AiProvider,
      useClass: FallbackAiProvider,
    },
  ],
  exports: [AiProvider],
})
export class AiModule {}
