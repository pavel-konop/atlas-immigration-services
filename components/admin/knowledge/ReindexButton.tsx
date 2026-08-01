"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "../Button";
import { useToast } from "../toast";

/**
 * Triggers POST /api/admin/knowledge/reindex and refreshes the page so the
 * server re-reads the latest job + counts. The run is synchronous server-side;
 * this shows a spinner until it returns.
 */
export function ReindexButton() {
  const router = useRouter();
  const toast = useToast();
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true);
    try {
      const res = await fetch("/api/admin/knowledge/reindex", { method: "POST" });
      if (res.status === 401) {
        toast.push("error", "Your session expired. Redirecting to login…");
        router.push("/admin");
        router.refresh();
        return;
      }
      const data = (await res.json().catch(() => null)) as { message?: string } | null;
      if (res.status === 409) {
        toast.push("info", data?.message ?? "A reindex is already running.");
      } else if (!res.ok) {
        toast.push("error", data?.message ?? "Reindex failed. See last-run status.");
      } else {
        toast.push("success", "Reindex complete.");
      }
      router.refresh();
    } catch {
      toast.push("error", "Could not reach the server.");
    }
    setRunning(false);
  }

  return (
    <Button onClick={run} loading={running}>
      <RefreshCw aria-hidden="true" className="h-4 w-4" />
      {running ? "Reindexing…" : "Reindex knowledge"}
    </Button>
  );
}
