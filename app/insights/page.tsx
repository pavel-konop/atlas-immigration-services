import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getArticles } from "@/lib/content/articles";
import { getSiteContent, mergeArticleOverride } from "@/lib/admin/content";
import { pageMetadata } from "@/lib/seo/metadata";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const metadata: Metadata = pageMetadata({
  title: "Insights",
  description: "Singapore immigration and business setup insights from Atlas Immigration Services.",
  path: "/insights"
});

export default async function InsightsPage() {
  const articles = await getArticles();
  const siteContent = await getSiteContent();
  const editableArticles = articles.map((article) => mergeArticleOverride(article, siteContent));

  return (
    <section className="bg-atlas-cream py-18">
      <div className="container-shell">
        <SectionHeader
          eyebrow="Insights"
          title="Guides for Singapore immigration and business planning"
          description="Short, practical articles for people preparing their next move."
          align="center"
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {editableArticles.map((article) => (
            <Link
              key={article.slug}
              href={`/insights/${article.slug}`}
              className="group rounded-md border border-atlas-line bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-atlas-gold hover:shadow-soft"
            >
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-atlas-gold">{article.category}</span>
              <h2 className="mt-4 text-xl font-semibold text-atlas-navy">{article.title}</h2>
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
export const dynamic = "force-dynamic";
