"use client";

import { useEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import { Plus, RotateCw, Send, X } from "lucide-react";
import { business } from "@/content/config/business";
import { cn } from "@/lib/utils/cn";
import { ChatMessageView } from "./ChatMessageView";
import {
  whatsappHrefWithRef,
  type ChatStatus,
  type ChatUiMessage
} from "./useChatSession";

const MAX_MESSAGE_LENGTH = 1000;

type Props = {
  onClose: () => void;
  messages: ChatUiMessage[];
  status: ChatStatus;
  error: string | null;
  closed: boolean;
  refCode: string | null;
  onSend: (text: string) => void;
  onRetry: () => void;
  onReset: () => void;
  inputRef: RefObject<HTMLInputElement | null>;
};

function TypingIndicator() {
  return (
    <div className="flex justify-start" aria-hidden="true">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-atlas-line bg-white px-4 py-3">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-atlas-blue/60"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export function ChatPanel({
  onClose,
  messages,
  status,
  error,
  closed,
  refCode,
  onSend,
  onRetry,
  onReset,
  inputRef
}: Props) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  // Move focus into the dialog on open: the input if present, else the panel
  // itself (so Escape works even in the closed end-state with no input).
  useEffect(() => {
    const target = inputRef.current ?? sectionRef.current;
    target?.focus();
  }, [inputRef]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, status]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || status === "sending" || closed) return;
    onSend(text);
    setDraft("");
  };

  return (
    <section
      ref={sectionRef}
      role="dialog"
      aria-label="Atlas assistant chat"
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      className={cn(
        "flex flex-col overflow-hidden bg-[#fbfcfd] shadow-soft",
        // Mobile: full-screen sheet. sm+: floating card, bottom-right.
        "fixed inset-0 z-50",
        "sm:inset-auto sm:bottom-24 sm:right-5 sm:h-[min(680px,85vh)] sm:w-[520px] sm:rounded-2xl sm:border sm:border-atlas-line"
      )}
    >
      {/* Header */}
      <header className="flex items-center justify-between gap-3 bg-atlas-navy px-4 py-3 text-white">
        <div>
          <p className="font-serif text-base leading-tight">Atlas assistant</p>
          <p className="text-xs text-white/70">Singapore immigration & corporate</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="rounded-full p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <X aria-hidden="true" className="h-5 w-5" />
        </button>
      </header>

      {/* Transcript */}
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">
        {messages.length === 0 && (
          <p className="rounded-2xl border border-atlas-line bg-white px-4 py-3 text-sm leading-relaxed text-slate-600">
            Hi! I&apos;m the Atlas assistant. Ask about Singapore immigration or corporate
            services and I&apos;ll point you the right way.
          </p>
        )}

        {messages.map((message) => (
          <ChatMessageView key={message.id} message={message} refCode={refCode} />
        ))}

        {status === "sending" && <TypingIndicator />}

        {status === "error" && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <span>{error ?? "Something went wrong."}</span>
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex shrink-0 items-center gap-1 rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-atlas-navy shadow-sm transition hover:text-atlas-blue"
            >
              <RotateCw aria-hidden="true" className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Footer: closed end-state or input */}
      {closed ? (
        <div className="space-y-3 border-t border-atlas-line bg-white px-4 py-4">
          <p className="text-sm leading-relaxed text-slate-600">
            This chat has wrapped up. For anything further, the Atlas team is happy to help
            on WhatsApp.
          </p>
          <a
            href={whatsappHrefWithRef(business.whatsappHref, refCode)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-atlas-gold px-4 py-2.5 text-sm font-semibold text-atlas-navy shadow-gold transition hover:bg-atlas-amber"
          >
            Message Atlas on WhatsApp
          </a>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium text-atlas-blue transition hover:text-atlas-navy"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            Start a new chat
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="flex items-end gap-2 border-t border-atlas-line bg-white px-3 py-3">
          <label htmlFor="atlas-chat-input" className="sr-only">
            Type your message
          </label>
          <input
            id="atlas-chat-input"
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={MAX_MESSAGE_LENGTH}
            placeholder="Ask about a service, document, or your situation…"
            autoComplete="off"
            className="min-h-11 flex-1 rounded-lg border border-atlas-line bg-[#fbfcfd] px-3 py-2.5 text-sm text-atlas-ink outline-none transition placeholder:text-slate-400 focus:border-atlas-gold"
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={!draft.trim() || status === "sending"}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-atlas-navy text-white transition hover:bg-atlas-blue disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send aria-hidden="true" className="h-4 w-4" />
          </button>
        </form>
      )}
    </section>
  );
}
