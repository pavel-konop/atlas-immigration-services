"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { ChatPanel } from "./ChatPanel";
import { useChatSession } from "./useChatSession";

/**
 * Floating chat launcher + panel, mounted once in the root layout. Renders on
 * every public page but hides itself on /admin. The conversation state lives
 * here (not in the panel) so the transcript survives closing and reopening the
 * panel within a page.
 */
export function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const chat = useChatSession();

  const launcherRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const wasOpen = useRef(false);

  // Return focus to the launcher when the panel closes.
  useEffect(() => {
    if (wasOpen.current && !open) launcherRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  // Never render on admin pages.
  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      {!open && (
        <button
          ref={launcherRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open Atlas assistant chat"
          className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-atlas-navy text-white shadow-soft transition hover:bg-atlas-blue focus-visible:outline-atlas-gold"
        >
          <MessageCircle aria-hidden="true" className="h-6 w-6" />
        </button>
      )}

      {open && (
        <ChatPanel
          onClose={() => setOpen(false)}
          messages={chat.messages}
          status={chat.status}
          error={chat.error}
          closed={chat.closed}
          refCode={chat.refCode}
          sessionId={chat.sessionId}
          onSend={chat.send}
          onRetry={chat.retry}
          onReset={chat.reset}
          inputRef={inputRef}
        />
      )}
    </>
  );
}
