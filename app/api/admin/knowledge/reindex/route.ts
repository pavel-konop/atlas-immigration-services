import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { isDatabaseConfigured } from "@/lib/ai/database/client";
import { finishReindexJob, getActiveReindexJob, startReindexJob } from "@/lib/ai/indexing/jobs";
import { runReindex } from "@/lib/ai/indexing/reindex";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Grant hosted functions headroom; the run is a few seconds at current scale.
export const maxDuration = 300;

/**
 * Runs a full reindex (index → chunk → embed) synchronously inside the request,
 * bracketed by a durable `ai_reindex_jobs` row so the Knowledge page can show
 * last-run status even after a reload. A concurrency guard rejects overlapping
 * runs. When the corpus outgrows the function time limit, execution can move to
 * a worker that claims `queued` job rows without changing runReindex().
 */
export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ ok: false, message: "Database is not configured." }, { status: 503 });
  }

  if (await getActiveReindexJob()) {
    return NextResponse.json({ ok: false, message: "A reindex is already running." }, { status: 409 });
  }

  const job = await startReindexJob();
  try {
    const result = await runReindex();
    const finished = await finishReindexJob(job.id, {
      status: result.embedError ? "failed" : "completed",
      documentsSeen: result.index.total,
      documentsChanged: result.index.created + result.index.updated,
      chunksChanged: result.chunk.chunksWritten,
      embeddingsChanged: result.embed?.embedded ?? 0,
      error: result.embedError,
      metadata: {
        index: result.index,
        chunk: result.chunk,
        embed: result.embed,
        embedError: result.embedError
      }
    });
    return NextResponse.json({ ok: !result.embedError, job: finished });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const finished = await finishReindexJob(job.id, {
      status: "failed",
      documentsSeen: 0,
      documentsChanged: 0,
      chunksChanged: 0,
      embeddingsChanged: 0,
      error: message
    });
    return NextResponse.json({ ok: false, message, job: finished }, { status: 500 });
  }
}
