"use client";

import { useCallback, useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import type { SiteContent } from "@/types/admin-content";
import type { ContentVersionMeta } from "@/lib/admin/content";
import { Card } from "../Card";
import { Table, TBody, TD, TH, THead, TR } from "../Table";
import { Button } from "../Button";
import { Badge } from "../Badge";
import { EmptyState } from "../EmptyState";
import { LoadingState } from "../LoadingState";
import { FeedbackBanner, useToast } from "../toast";
import { formatDateTime } from "../format";

type Props = {
  currentVersion: number;
  onRestored: (content: SiteContent, version: number) => void;
  onSessionExpiry: () => void;
};

export function HistorySection({ currentVersion, onRestored, onSessionExpiry }: Props) {
  const toast = useToast();
  const [versions, setVersions] = useState<ContentVersionMeta[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [restoring, setRestoring] = useState<number | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/admin/content/versions");
      if (res.status === 401) {
        onSessionExpiry();
        return;
      }
      const data = (await res.json().catch(() => null)) as { versions?: ContentVersionMeta[] } | null;
      if (!res.ok || !data?.versions) {
        setError("Could not load version history.");
        return;
      }
      setVersions(data.versions);
    } catch {
      setError("Could not reach the server.");
    }
  }, [onSessionExpiry]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const restore = async (version: number) => {
    setRestoring(version);
    try {
      const res = await fetch("/api/admin/content/restore", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ version })
      });
      if (res.status === 401) {
        onSessionExpiry();
        return;
      }
      const data = (await res.json().catch(() => null)) as
        | { content?: SiteContent; version?: number; message?: string }
        | null;
      if (!res.ok || !data?.content || typeof data.version !== "number") {
        toast.push("error", data?.message ?? "Restore failed.");
        setRestoring(null);
        return;
      }
      toast.push("success", `Restored v${version} as v${data.version}.`);
      onRestored(data.content, data.version);
      await load();
    } catch {
      toast.push("error", "Could not reach the server.");
    }
    setRestoring(null);
  };

  return (
    <Card
      title="Version history"
      description="Every save is a new version. Restore writes an older version back as the newest — nothing is lost."
    >
      {error ? (
        <div className="space-y-3">
          <FeedbackBanner tone="error">{error}</FeedbackBanner>
          <Button variant="secondary" size="sm" onClick={() => void load()}>
            Try again
          </Button>
        </div>
      ) : versions === null ? (
        <LoadingState label="Loading history…" />
      ) : versions.length === 0 ? (
        <EmptyState title="No versions yet" description="Saves will appear here as versions." />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Version</TH>
              <TH>Saved</TH>
              <TH>Note</TH>
              <TH className="text-right">Action</TH>
            </TR>
          </THead>
          <TBody>
            {versions.map((v) => {
              const isCurrent = v.version === currentVersion;
              return (
                <TR key={v.version} className="hover:bg-atlas-mist/40">
                  <TD>
                    <span className="font-mono font-semibold text-atlas-navy">v{v.version}</span>
                    {isCurrent && (
                      <Badge tone="success" className="ml-2">
                        current
                      </Badge>
                    )}
                  </TD>
                  <TD className="whitespace-nowrap text-slate-500">{formatDateTime(v.createdAt)}</TD>
                  <TD className="text-slate-600">{v.note || <span className="text-slate-400">—</span>}</TD>
                  <TD className="text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={isCurrent || restoring !== null}
                      loading={restoring === v.version}
                      onClick={() => void restore(v.version)}
                    >
                      <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" /> Restore
                    </Button>
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      )}
    </Card>
  );
}
