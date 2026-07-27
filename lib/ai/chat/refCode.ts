import crypto from "node:crypto";

/**
 * Short, human-readable session ref codes for the future WhatsApp handoff.
 * An unambiguous alphabet (no 0/O/1/I/L) keeps codes easy to read aloud and
 * type. Codes are stored in ai_chat_sessions.ref_code (unique), so the caller
 * retries on the rare collision.
 */

const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // 31 symbols, no 0 O 1 I L
const CODE_LENGTH = 6;

export function generateRefCode(): string {
  const bytes = crypto.randomBytes(CODE_LENGTH);
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return code;
}
