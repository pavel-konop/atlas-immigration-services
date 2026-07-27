import { AnthropicAiProvider } from "./anthropic";
import { NoopAiProvider, type AiProvider } from "./types";

export * from "./types";
export { AnthropicAiProvider, DEFAULT_CHAT_MODEL } from "./anthropic";

/**
 * Returns the active chat provider. Uses the real Anthropic provider when an
 * API key is configured (and AI_PROVIDER isn't explicitly disabled); otherwise
 * falls back to the no-op provider so the app degrades gracefully.
 */
export function getChatProvider(): AiProvider {
  const disabled = process.env.AI_PROVIDER === "none";
  if (!disabled && process.env.ANTHROPIC_API_KEY) {
    return new AnthropicAiProvider();
  }
  return new NoopAiProvider();
}
