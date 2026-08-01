import { Badge, type BadgeTone } from "../Badge";
import type { ChatEventRecord } from "@/lib/ai/database/types";
import type { Transcript } from "@/lib/ai/database/adminReads";

function confidenceOf(status: string): { label: string; tone: BadgeTone } {
  switch (status) {
    case "answered":
      return { label: "strong", tone: "success" };
    case "escalated":
      return { label: "weak / escalated", tone: "warning" };
    case "not_found":
      return { label: "no context", tone: "neutral" };
    case "error":
      return { label: "error", tone: "danger" };
    case "blocked":
      return { label: "blocked", tone: "danger" };
    default:
      return { label: status, tone: "info" };
  }
}

function flagTone(flag: string): BadgeTone {
  if (["provider_failure", "session_capped", "blocked"].includes(flag)) return "danger";
  if (["fallback_served", "retrieval_degraded", "weak_context"].includes(flag)) return "warning";
  if (flag === "cta_shown") return "info";
  return "neutral";
}

type SourceRef = { title?: string; href?: string | null };

function AnswerMeta({ event }: { event: ChatEventRecord }) {
  const confidence = confidenceOf(event.answerStatus);
  const flags = (event.guardrailFlags as string[]).filter((f) => typeof f === "string");
  const sources = (event.matchedSources as SourceRef[]).filter((s) => s && s.title);

  return (
    <div className="mt-1.5 space-y-2 border-l-2 border-atlas-line pl-3">
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
        <Badge tone={confidence.tone}>{confidence.label}</Badge>
        {event.modelName && <span className="text-slate-400">{event.modelName}</span>}
        {event.completionTokens != null && <span className="text-slate-400">· {event.completionTokens} out-tok</span>}
        {event.latencyMs != null && <span className="text-slate-400">· {event.latencyMs}ms</span>}
        {flags.map((flag) => (
          <Badge key={flag} tone={flagTone(flag)}>
            {flag}
          </Badge>
        ))}
      </div>
      {sources.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Sources</span>
          {sources.map((s, i) =>
            s.href ? (
              <a
                key={`${s.href}-${i}`}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-atlas-line bg-atlas-mist px-2 py-0.5 text-xs text-atlas-blue hover:border-atlas-gold"
              >
                {s.title}
              </a>
            ) : (
              <span key={i} className="rounded-full border border-atlas-line bg-atlas-mist px-2 py-0.5 text-xs text-slate-600">
                {s.title}
              </span>
            )
          )}
        </div>
      )}
    </div>
  );
}

export function TranscriptTimeline({ transcript }: { transcript: Transcript }) {
  const eventByAssistant = new Map<string, ChatEventRecord>();
  for (const event of transcript.events) {
    if (event.assistantMessageId) eventByAssistant.set(event.assistantMessageId, event);
  }

  return (
    <div className="space-y-5">
      {transcript.messages.map((message) => {
        const isUser = message.role === "user";
        const event = isUser ? undefined : eventByAssistant.get(message.id);
        return (
          <div key={message.id} className={isUser ? "flex justify-end" : "flex justify-start"}>
            <div className="max-w-[85%]">
              <div
                className={
                  isUser
                    ? "rounded-2xl rounded-br-sm bg-atlas-navy px-4 py-2.5 text-sm text-white"
                    : "rounded-2xl rounded-bl-sm border border-atlas-line bg-white px-4 py-2.5 text-sm text-atlas-ink"
                }
              >
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              </div>
              {event && <AnswerMeta event={event} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}
