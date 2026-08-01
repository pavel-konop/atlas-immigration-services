import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card } from "@/components/admin/Card";
import { Badge } from "@/components/admin/Badge";
import { formatDateTime } from "@/components/admin/format";
import { TranscriptTimeline } from "@/components/admin/chats/TranscriptTimeline";
import { getSessionTranscript } from "@/lib/ai/database/adminReads";

export const dynamic = "force-dynamic";

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-atlas-ink">{value}</dd>
    </div>
  );
}

export default async function TranscriptPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const transcript = await getSessionTranscript(sessionId);
  if (!transcript) notFound();

  const { session } = transcript;
  const meta = session.metadata as { name?: string; country?: string; ctaClicked?: boolean };
  const visitor = [meta.name, meta.country].filter(Boolean).join(" · ");

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/chats"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-atlas-navy"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back to chats
        </Link>
        <div className="mt-2">
          <PageHeader
            title={
              <span className="font-mono">{session.refCode ?? "Session"}</span>
            }
            description="Read-only transcript with per-answer confidence, sources, and events."
          />
        </div>
      </div>

      <Card title="Session details">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Detail label="Ref code" value={<span className="font-mono">{session.refCode ?? "—"}</span>} />
          <Detail label="Started" value={formatDateTime(session.createdAt)} />
          <Detail label="Last activity" value={formatDateTime(session.lastSeenAt)} />
          <Detail label="Visitor" value={visitor || "—"} />
          <Detail label="Source page" value={session.sourcePage ?? "—"} />
          <Detail
            label="CTA clicked"
            value={meta.ctaClicked ? <Badge tone="success">Yes</Badge> : <span className="text-slate-400">No</span>}
          />
        </dl>
      </Card>

      <Card title="Transcript" description={`${transcript.messages.length} message(s)`}>
        {transcript.messages.length === 0 ? (
          <p className="text-sm text-slate-500">No messages in this session.</p>
        ) : (
          <TranscriptTimeline transcript={transcript} />
        )}
      </Card>
    </div>
  );
}
