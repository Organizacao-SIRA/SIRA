import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AiProvider, AiCompleteOptions } from '../ai-provider.abstract';

@Injectable()
export class GeminiProvider extends AiProvider {
  private readonly client: GoogleGenerativeAI | null;
  private readonly model = 'gemini-2.0-flash';

  constructor() {
    super();
    const apiKey = process.env.GEMINI_API_KEY;
    this.client = apiKey ? new GoogleGenerativeAI(apiKey) : null;
  }

  async complete({ system, user, maxTokens = 1024 }: AiCompleteOptions): Promise<string> {
    if (!this.client) {
      throw new Error('GEMINI_API_KEY não configurado — fallback Gemini indisponível.');
    }

    const model = this.client.getGenerativeModel({
      model: this.model,
      systemInstruction: system,
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: { maxOutputTokens: maxTokens },
    });

    return result.response.text();
  }
}
