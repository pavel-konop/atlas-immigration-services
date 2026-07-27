/**
 * Interactive CLI for the Atlas chat assistant. Drives the SAME turn logic as
 * the /api/ai/chat route (real retrieval, real model, real logging) so the
 * assistant is testable from the terminal before any widget exists.
 *
 * Requires DATABASE_URL; needs ANTHROPIC_API_KEY for real model answers (without
 * it, the no-op provider replies with an offline message but everything else —
 * retrieval, branching, logging — still runs).
 *
 * Usage:
 *   npm run ai:chat
 */

import readline from "node:readline";
import { isDatabaseConfigured } from "@/lib/ai/database/client";
import { handleChatTurn, MAX_MESSAGE_LENGTH } from "@/lib/ai/chat/handleChat";

async function main() {
  if (!isDatabaseConfigured()) {
    console.error("DATABASE_URL is not set. Add it to .env before running ai:chat.");
    process.exit(1);
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("Note: ANTHROPIC_API_KEY is not set — answers will use the offline no-op provider.\n");
  }

  // The async iterator ends cleanly on EOF (Ctrl-D or piped input), avoiding the
  // ERR_USE_AFTER_CLOSE that a bare question() loop throws when stdin closes.
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: "you › " });

  let sessionId: string | null = null;
  console.log('Atlas assistant — type your message (or "exit" to quit).\n');
  rl.prompt();

  for await (const line of rl) {
    const message = line.trim();
    if (!message) {
      rl.prompt();
      continue;
    }
    if (message === "exit" || message === "quit") break;
    if (message.length > MAX_MESSAGE_LENGTH) {
      console.log(`(message too long — keep it under ${MAX_MESSAGE_LENGTH} characters)\n`);
      rl.prompt();
      continue;
    }

    try {
      const result = await handleChatTurn({ sessionId, message, sourcePage: "cli" });
      sessionId = result.sessionId;

      console.log(`\natlas › ${result.reply}`);
      const meta = [`confidence: ${result.confidence}`, `ref: ${result.refCode}`];
      if (result.sources.length > 0) {
        meta.push(`sources: ${result.sources.map((s) => s.title).join(", ")}`);
      }
      if (result.cta) meta.push(`cta: ${result.cta.label} (${result.cta.url})`);
      console.log(`      [${meta.join(" | ")}]\n`);
    } catch (error) {
      console.error("\n(turn failed)", error instanceof Error ? error.message : error, "\n");
    }
    rl.prompt();
  }

  rl.close();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
