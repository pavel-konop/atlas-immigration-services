import { ArrowRight, BookOpen, FileText, MessagesSquare } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card } from "@/components/admin/Card";
import { Badge, type BadgeTone } from "@/components/admin/Badge";
import { AdminButtonLink } from "@/components/admin/Button";
import { getFunnelStats, getKnowledgeCounts } from "@/lib/ai/database/adminReads";
import { getLatestReindexJob } from "@/lib/ai/indexing/jobs";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, BadgeTone> = {
  completed: "success",
  failed: "danger",
  running: "warning",
  queued: "neutral",
  cancelled: "neutral"
};

export default async function AdminDashboardPage() {
  const [funnel, counts, lastReindex] = await Promise.all([
    getFunnelStats(7),
    getKnowledgeCounts(),
    getLatestReindexJob()
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Manage Atlas website content, review assistant chats, and reindex the knowledge base."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card
          title={
            <span className="flex items-center gap-2">
              <FileText aria-hidden="true" className="h-5 w-5 text-atlas-gold" /> Content
            </span>
          }
          description="Edit the homepage showcase, photos, feedback, articles, and FAQs shown across the public site."
        >
          <AdminButtonLink href="/admin/content" variant="secondary" size="sm">
            Open content editor <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </AdminButtonLink>
        </Card>

        <Card
          title={
            <span className="flex items-center gap-2">
              <MessagesSquare aria-hidden="true" className="h-5 w-5 text-atlas-gold" /> Chats
            </span>
          }
          description="Review assistant conversations, answer confidence, and the weekly funnel."
        >
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              <span className="font-serif text-xl text-atlas-navy">{funnel.sessions}</span> session
              {funnel.sessions === 1 ? "" : "s"} this week
            </p>
            <AdminButtonLink href="/admin/chats" variant="secondary" size="sm">
              Open chats <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </AdminButtonLink>
          </div>
        </Card>

        <Card
          title={
            <span className="flex items-center gap-2">
              <BookOpen aria-hidden="true" className="h-5 w-5 text-atlas-gold" /> Knowledge
            </span>
          }
          description="Sync approved content into the assistant's knowledge base and generate embeddings."
        >
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              <span className="font-serif text-xl text-atlas-navy">{counts.documents}</span> indexed document
              {counts.documents === 1 ? "" : "s"}
            </p>
            <p className="flex items-center gap-2 text-xs text-slate-500">
              Last reindex:
              {lastReindex ? (
                <Badge tone={STATUS_TONE[lastReindex.status] ?? "neutral"}>{lastReindex.status}</Badge>
              ) : (
                <span className="text-slate-400">never run</span>
              )}
            </p>
            <AdminButtonLink href="/admin/knowledge" variant="secondary" size="sm">
              Open knowledge <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </AdminButtonLink>
          </div>
        </Card>
      </div>
    </div>
  );
}
