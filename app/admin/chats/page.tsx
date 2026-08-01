import Link from "next/link";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card } from "@/components/admin/Card";
import { StatTile } from "@/components/admin/StatTile";
import { Button } from "@/components/admin/Button";
import { pct } from "@/components/admin/format";
import { SessionsTable } from "@/components/admin/chats/SessionsTable";
import { getFunnelStats, listSessionSummaries } from "@/lib/ai/database/adminReads";

export const dynamic = "force-dynamic";

export default async function AdminChatsPage({
  searchParams
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  const [funnel, sessions] = await Promise.all([getFunnelStats(7), listSessionSummaries(ref)]);

  return (
    <div className="space-y-6">
      <PageHeader title="Chats" description="Assistant conversations, answer confidence, and the weekly funnel." />

      {/* Funnel strip — four numbers, no charts */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Sessions this week" value={funnel.sessions} />
        <StatTile
          label="% reaching CTA"
          value={pct(funnel.reachedCta, funnel.sessions)}
          sub={`${funnel.reachedCta} of ${funnel.sessions}`}
        />
        <StatTile
          label="% clicking CTA"
          value={pct(funnel.clickedCta, funnel.sessions)}
          sub={`${funnel.clickedCta} of ${funnel.sessions}`}
        />
        <StatTile
          label="% hitting fallback"
          value={pct(funnel.hitFallback, funnel.sessions)}
          sub={`${funnel.hitFallback} of ${funnel.sessions}`}
        />
      </div>

      <Card
        title="Sessions"
        description="Newest first. Click a ref code to open the full transcript."
        actions={
          <form action="/admin/chats" method="get" className="flex items-center gap-2">
            <div className="relative">
              <Search aria-hidden="true" className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                name="ref"
                defaultValue={ref ?? ""}
                placeholder="Search ref code"
                aria-label="Search by ref code"
                className="w-40 rounded-md border border-atlas-line bg-white py-2 pl-8 pr-3 text-sm text-atlas-ink outline-none focus:border-atlas-gold"
              />
            </div>
            <Button type="submit" variant="secondary" size="sm">
              Search
            </Button>
            {ref && (
              <Link href="/admin/chats" className="text-sm text-slate-500 hover:text-atlas-navy">
                Clear
              </Link>
            )}
          </form>
        }
      >
        <SessionsTable sessions={sessions} />
      </Card>
    </div>
  );
}
