import Anthropic from "@anthropic-ai/sdk";
import type {
  AiGenerateOptions,
  AiGenerateResult,
  AiMessage,
  AiProvider,
  AiProviderName
} from "./types";

/**
 * Real Anthropic provider for the public chat assistant.
 *
 * Reads ANTHROPIC_API_KEY (via the SDK's default env resolution) and the model
 * from AI_CHAT_MODEL (default claude-sonnet-4-6). Stable system blocks are sent
 * with a cache_control breakpoint so the frozen prefix (safety core + business
 * rules) can be prompt-cached; per-turn context belongs in the user message, not
 * a cached system block.
 *
 * No extended thinking: for a short, guardrailed chat reply, thinking-off is the
 * right cost/latency trade (omitting `thinking` on Sonnet 4.6 runs without it).
 */

export const DEFAULT_CHAT_MODEL = "claude-sonnet-4-6";
const DEFAULT_MAX_TOKENS = 350;
const DEFAULT_TEMPERATURE = 0.3;

export class AnthropicAiProvider implements AiProvider {
  name: AiProviderName = "anthropic";

  private client: Anthropic;
  private model: string;

  constructor(model = process.env.AI_CHAT_MODEL || DEFAULT_CHAT_MODEL) {
    // The SDK resolves ANTHROPIC_API_KEY from the environment.
    this.client = new Anthropic();
    this.model = model;
  }

  async generate(messages: AiMessage[], options?: AiGenerateOptions): Promise<AiGenerateResult> {
    const systemBlocks = options?.system ?? [];
    // Place a single cache breakpoint on the last stable block; it caches the
    // whole prefix up to that point.
    const breakpoint = systemBlocks.map((b) => Boolean(b.cache)).lastIndexOf(true);
    const system = systemBlocks.map((block, index) => ({
      type: "text" as const,
      text: block.text,
      ...(index === breakpoint ? { cache_control: { type: "ephemeral" as const } } : {})
    }));

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: options?.maxTokens ?? DEFAULT_MAX_TOKENS,
      temperature: options?.temperature ?? DEFAULT_TEMPERATURE,
      ...(system.length > 0 ? { system } : {}),
      messages: messages.map((message) => ({
        role: message.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: message.content
      }))
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();

    return {
      text,
      model: response.model,
      usage: {
        inputTokens: response.usage.input_tokens ?? 0,
        outputTokens: response.usage.output_tokens ?? 0,
        cacheReadTokens: response.usage.cache_read_input_tokens ?? 0,
        cacheWriteTokens: response.usage.cache_creation_input_tokens ?? 0
      }
    };
  }
}
