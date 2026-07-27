export type AiProviderName = "none" | "anthropic" | "openai" | "other";

export type AiMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

/**
 * A system-prompt block. Stable blocks are marked `cache: true` so the provider
 * can place a cache breakpoint on them (prompt caching); dynamic per-turn content
 * should NOT be a cached system block — put it in the user message instead.
 */
export type AiSystemBlock = {
  text: string;
  cache?: boolean;
};

export type AiUsage = {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
};

export type AiGenerateOptions = {
  system?: AiSystemBlock[];
  maxTokens?: number;
  temperature?: number;
};

export type AiGenerateResult = {
  text: string;
  model: string;
  usage: AiUsage;
};

export type AiProvider = {
  name: AiProviderName;
  generate(messages: AiMessage[], options?: AiGenerateOptions): Promise<AiGenerateResult>;
};

const emptyUsage: AiUsage = {
  inputTokens: 0,
  outputTokens: 0,
  cacheReadTokens: 0,
  cacheWriteTokens: 0
};

/** No-op provider for the MVP / when no API key is configured. */
export class NoopAiProvider implements AiProvider {
  name: AiProviderName = "none";

  async generate(): Promise<AiGenerateResult> {
    return {
      text:
        "AI responses are not enabled right now. Please contact Atlas directly and a consultant will help you.",
      model: "none",
      usage: emptyUsage
    };
  }
}
