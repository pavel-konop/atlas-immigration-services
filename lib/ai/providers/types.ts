export type AiProviderName = "none" | "openai" | "other";

export type AiMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AiProvider = {
  name: AiProviderName;
  generate(messages: AiMessage[]): Promise<string>;
};

export class NoopAiProvider implements AiProvider {
  name: AiProviderName = "none";

  async generate() {
    return "AI responses are not enabled for this MVP. Please contact Atlas directly for consultant review.";
  }
}
