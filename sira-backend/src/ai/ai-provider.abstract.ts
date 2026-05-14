export type AiCompleteOptions = {
  system: string;
  user: string;
  maxTokens?: number;
};

export abstract class AiProvider {
  abstract complete(options: AiCompleteOptions): Promise<string>;
}
