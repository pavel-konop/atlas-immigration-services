import { BookOpen } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card } from "@/components/admin/Card";
import { Badge, type BadgeTone } from "@/components/admin/Badge";
import { EmptyState } from "@/components/admin/EmptyState";
import { StatTile } from "@/components/admin/StatTile";
import { FeedbackBanner } from "@/components/admin/toast";
import { formatDateTime } from "@/components/admin/format";
import { ReindexButton } from "@/components/admin/knowledge/ReindexButton";
import { getKnowledgeCounts } from "@/lib/ai/database/adminReads";
import { getLatestReindexJob } from "@/lib/ai/indexing/jobs";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, BadgeTone> = {
  completed: "success",
  failed: "danger",
  running: "warning",
  queued: "neutral",
  cancelled: "neutral"
};

type ReindexMeta = {
  index?: { created: number; updated: number; unchanged: number; total: number };
  chunk?: { chunked: number; rechunked: number; unchanged: number; chunksWritten: number };
  embed?: { embedded: number; skipped: number; tokens: number } | null;
};

export default async function AdminKnowledgePage() {
  const [counts, job] = await Promise.all([getKnowledgeCounts(), getLatestReindexJob()]);
  const meta = (job?.metadata ?? {}) as ReindexMeta;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Knowledge"
        description="Sync approved content into the assistant's knowledge base: index documents, chunk them, and generate embeddings."
        actions={<ReindexButton />}
      />

      <Card title="Knowledge base" description="Current state of the indexed corpus.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Documents" value={counts.documents} sub={`${counts.enabledDocuments} enabled`} />
          <StatTile label="Enabled docs" value={counts.enabledDocuments} />
          <StatTile label="Chunks" value={counts.chunks} />
          <StatTile
            label="Embedded chunks"
            value={counts.embeddedChunks}
            sub={counts.chunks > 0 ? `${counts.chunks - counts.embeddedChunks} pending` : undefined}
          />
        </div>
      </Card>

      <Card title="Last reindex" description="Most recent run of index → chunk → embed.">
        {!job ? (
          <EmptyState
            icon={BookOpen}
            title="No reindex has run yet"
            description="Use “Reindex knowledge” to sync, chunk, and embed the approved content."
          />
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone={STATUS_TONE[job.status] ?? "neutral"}>{job.status}</Badge>
              <span className="text-sm text-slate-500">
                started {formatDateTime(job.startedAt)} · finished {formatDateTime(job.finishedAt)}
              </span>
            </div>

            {job.error && <FeedbackBanner tone="error">{job.error}</FeedbackBanner>}

            <div className="grid gap-3 sm:grid-cols-3">
              <StatTile
                label="Documents"
                value={job.documentsChanged}
                sub={
                  meta.index
                    ? `${meta.index.created} new · ${meta.index.updated} updated · ${meta.index.unchanged} unchanged`
                    : "changed"
                }
              />
              <StatTile
                label="Chunks written"
                value={job.chunksChanged}
                sub={
                  meta.chunk
                    ? `${meta.chunk.chunked} new · ${meta.chunk.rechunked} rechunked · ${meta.chunk.unchanged} unchanged`
                    : undefined
                }
              />
              <StatTile
                label="Embeddings added"
                value={job.embeddingsChanged}
                sub={meta.embed ? `${meta.embed.skipped} already embedded` : job.error ? "embedding failed" : undefined}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
