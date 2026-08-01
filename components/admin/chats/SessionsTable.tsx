import Link from "next/link";
import { Table, TBody, TD, TH, THead, TR } from "../Table";
import { Badge } from "../Badge";
import { EmptyState } from "../EmptyState";
import { formatDateTime } from "../format";
import type { SessionSummary } from "@/lib/ai/database/adminReads";

function ConfidenceMix({ s }: { s: SessionSummary }) {
  const total = s.answered + s.weak + s.none + s.other;
  if (total === 0) return <span className="text-slate-400">—</span>;
  return (
    <span className="tabular-nums" title="answered / weak / none / other">
      <span className="text-emerald-600">{s.answered}</span>
      <span className="text-slate-300"> / </span>
      <span className="text-amber-600">{s.weak}</span>
      <span className="text-slate-300"> / </span>
      <span className="text-slate-500">{s.none}</span>
      {s.other > 0 && (
        <>
          <span className="text-slate-300"> / </span>
          <span className="text-red-600">{s.other}</span>
        </>
      )}
    </span>
  );
}

export function SessionsTable({ sessions }: { sessions: SessionSummary[] }) {
  if (sessions.length === 0) {
    return <EmptyState title="No sessions found" description="No chat sessions match this view yet." />;
  }

  return (
    <Table>
      <THead>
        <TR>
          <TH>Ref</TH>
          <TH>Started</TH>
          <TH>Last activity</TH>
          <TH className="text-right">Msgs</TH>
          <TH>Confidence</TH>
          <TH>CTA</TH>
          <TH>Visitor</TH>
        </TR>
      </THead>
      <TBody>
        {sessions.map((s) => {
          const visitor = [s.name, s.country].filter(Boolean).join(" · ");
          return (
            <TR key={s.id} className="hover:bg-atlas-mist/40">
              <TD>
                <Link
                  href={`/admin/chats/${s.id}`}
                  className="font-mono font-semibold text-atlas-blue hover:text-atlas-navy hover:underline"
                >
                  {s.refCode ?? "—"}
                </Link>
              </TD>
              <TD className="whitespace-nowrap text-slate-500">{formatDateTime(s.createdAt)}</TD>
              <TD className="whitespace-nowrap text-slate-500">{formatDateTime(s.lastSeenAt)}</TD>
              <TD className="text-right tabular-nums">{s.messageCount}</TD>
              <TD>
                <ConfidenceMix s={s} />
              </TD>
              <TD>
                {s.ctaClicked ? (
                  <Badge tone="success">clicked</Badge>
                ) : s.ctaShown > 0 ? (
                  <Badge tone="neutral">shown</Badge>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </TD>
              <TD className="text-slate-600">{visitor || <span className="text-slate-400">—</span>}</TD>
            </TR>
          );
        })}
      </TBody>
    </Table>
  );
}
