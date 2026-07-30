import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { MiniMarkdown } from "./miniMarkdown";
import { whatsappHrefWithRef, type ChatUiMessage } from "./useChatSession";

type Props = {
  message: ChatUiMessage;
  refCode: string | null;
};

export function ChatMessageView({ message, refCode }: Props) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-atlas-navy px-4 py-2.5 text-sm leading-relaxed text-white">
          {message.content}
        </div>
      </div>
    );
  }

  const cta = message.cta;
  const ctaHref =
    cta && cta.type === "whatsapp" ? whatsappHrefWithRef(cta.url, refCode) : cta?.url;
  const sources = (message.sources ?? []).filter((s) => Boolean(s.href));

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] space-y-3">
        <div className="rounded-2xl rounded-bl-sm border border-atlas-line bg-white px-4 py-2.5 text-sm leading-relaxed text-atlas-ink">
          <MiniMarkdown text={message.content} />
        </div>

        {sources.length > 0 && (
          <div className="px-1">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Sources
            </p>
            <div className="flex flex-wrap gap-1.5">
              {sources.map((source, i) => (
                <a
                  key={`${source.href}-${i}`}
                  href={source.href ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-atlas-line bg-atlas-mist px-2.5 py-1 text-xs font-medium text-atlas-blue transition hover:border-atlas-gold hover:text-atlas-navy"
                >
                  {source.title}
                </a>
              ))}
            </div>
          </div>
        )}

        {cta && ctaHref && (
          <div className="px-1">
            <a
              href={ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-atlas-gold px-4 py-2.5",
                "text-sm font-semibold text-atlas-navy shadow-gold transition hover:bg-atlas-amber"
              )}
            >
              {cta.label}
              <ExternalLink aria-hidden="true" className="h-4 w-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
