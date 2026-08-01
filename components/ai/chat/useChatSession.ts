"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Client-side chat session state for the widget. Talks to POST /api/ai/chat.
 *
 * Persistence: only { sessionId, refCode, closed } are stored in sessionStorage
 * (survives page navigation, cleared on tab close). The transcript itself is
 * kept in memory only — not persisted — which keeps stored data PDPA-minimal.
 * The server holds the real conversation history, keyed by sessionId.
 */

const STORAGE_KEY = "atlas-chat";

export type ChatCta = { type: string; url: string; label: string };
export type ChatSource = { title: string; href: string | null };

export type ChatUiMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
  cta?: ChatCta;
};

type ChatApiResponse = {
  sessionId: string;
  refCode: string;
  reply: string;
  sources: ChatSource[];
  cta?: ChatCta;
  closed: boolean;
};

export type ChatStatus = "idle" | "sending" | "error";

/** Build a wa.me link pre-filled with a greeting + ref code only (no chat content). */
export function whatsappHrefWithRef(baseUrl: string, refCode: string | null): string {
  const text = `Hi, I was chatting with the Atlas assistant${refCode ? ` — ref ${refCode}` : ""}`;
  return `${baseUrl}?text=${encodeURIComponent(text)}`;
}

export function useChatSession() {
  const [messages, setMessages] = useState<ChatUiMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [closed, setClosed] = useState(false);
  const [refCode, setRefCode] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const sessionIdRef = useRef<string | null>(null);
  const lastFailedRef = useRef<string | null>(null);
  const idRef = useRef(0);
  const uid = () => `m${(idRef.current += 1)}`;

  // Hydrate persisted session identity (not the transcript) on mount. This must
  // be an effect, not a render-time read: sessionStorage is unavailable during
  // SSR, and reading it during render would cause a hydration mismatch. The
  // setState-in-effect here is intentional and runs once.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { sessionId?: string; refCode?: string; closed?: boolean };
      sessionIdRef.current = saved.sessionId ?? null;
      /* eslint-disable react-hooks/set-state-in-effect */
      setSessionId(saved.sessionId ?? null);
      setRefCode(saved.refCode ?? null);
      if (saved.closed) setClosed(true);
      /* eslint-enable react-hooks/set-state-in-effect */
    } catch {
      // ignore malformed storage
    }
  }, []);

  const persist = (sessionId: string | null, ref: string | null, isClosed: boolean) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ sessionId, refCode: ref, closed: isClosed }));
    } catch {
      // storage may be unavailable (private mode); non-fatal
    }
  };

  const attempt = useCallback(async (message: string) => {
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId: sessionIdRef.current, message })
      });
      const data = (await res.json().catch(() => null)) as ChatApiResponse | { message?: string } | null;

      if (!res.ok || !data || !("reply" in data)) {
        const serverMessage =
          data && "message" in data && typeof data.message === "string" ? data.message : null;
        throw new Error(serverMessage ?? "Sorry, something went wrong. Please try again.");
      }

      sessionIdRef.current = data.sessionId;
      setSessionId(data.sessionId);
      setRefCode(data.refCode);
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "assistant", content: data.reply, sources: data.sources, cta: data.cta }
      ]);
      setClosed(data.closed);
      setStatus("idle");
      lastFailedRef.current = null;
      persist(data.sessionId, data.refCode, data.closed);
    } catch (err) {
      lastFailedRef.current = message;
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Couldn't send your message. Please check your connection and try again."
      );
      setStatus("error");
    }
  }, []);

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || status === "sending" || closed) return;
      setMessages((prev) => [...prev, { id: uid(), role: "user", content: trimmed }]);
      void attempt(trimmed);
    },
    [attempt, status, closed]
  );

  const retry = useCallback(() => {
    if (lastFailedRef.current && status !== "sending") void attempt(lastFailedRef.current);
  }, [attempt, status]);

  // Start a fresh conversation: forget the stored session so the next message
  // opens a new server-side session with a new ref code. Server-side nothing
  // changes — the old session simply stops being referenced.
  const reset = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // storage may be unavailable; non-fatal
    }
    sessionIdRef.current = null;
    lastFailedRef.current = null;
    setMessages([]);
    setRefCode(null);
    setSessionId(null);
    setClosed(false);
    setError(null);
    setStatus("idle");
  }, []);

  return { messages, status, error, closed, refCode, sessionId, send, retry, reset };
}

/**
 * Fire-and-forget CTA-click beacon. Uses sendBeacon (or a keepalive fetch
 * fallback) so it never blocks the WhatsApp link the user just tapped.
 */
export function reportCtaClick(sessionId: string | null): void {
  if (!sessionId) return;
  const payload = JSON.stringify({ sessionId });
  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon("/api/ai/chat/cta-click", payload);
      return;
    }
  } catch {
    // fall through to fetch
  }
  void fetch("/api/ai/chat/cta-click", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: payload,
    keepalive: true
  }).catch(() => {});
}
