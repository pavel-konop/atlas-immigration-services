import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Article } from "@/lib/content/articles";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function InsightsPreview({ articles }: { articles: Article[] }) {
  return (
    <section className="bg-white py-18">
      <div className="container-shell">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <SectionHeader eyebrow="Insights and updates" title="Practical notes for Singapore planning" />
          <Link href="/insights" className="font-semibold text-atlas-navy hover:text-atlas-gold">
            View all insights
          </Link>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {articles.map((article) => (
            <Link
              href={`/insights/${article.slug}`}
              key={article.slug}
              className="group rounded-md border border-atlas-line bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-atlas-gold hover:shadow-soft"
            >
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-atlas-gold">{article.category}</span>
              <h3 className="mt-4 text-xl font-semibold leading-snug text-atlas-navy">{article.title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{article.description}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-atlas-navy">
                Read article <ArrowRight aria-hidden="true" className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
