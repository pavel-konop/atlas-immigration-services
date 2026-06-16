import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getArticle, getArticles } from "@/lib/content/articles";
import { getSiteContent, mergeArticleOverride } from "@/lib/admin/content";
import { pageMetadata } from "@/lib/seo/metadata";
import type { RouteParams } from "@/types/site";

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: RouteParams<"slug">): Promise<Metadata> {
  const { slug } = await params;
  const siteContent = await getSiteContent();
  const found = await getArticle(slug).catch(() => null);
  const article = found ? mergeArticleOverride(found, siteContent) : null;
  if (!article) return {};

  return pageMetadata({
    title: article.title,
    description: article.description,
    path: `/insights/${article.slug}`
  });
}

export default async function ArticlePage({ params }: RouteParams<"slug">) {
  const { slug } = await params;
  const siteContent = await getSiteContent();
  const found = await getArticle(slug).catch(() => null);
  const article = found ? mergeArticleOverride(found, siteContent) : null;
  if (!article) notFound();

  return (
    <article className="bg-white py-18">
      <div className="container-shell max-w-3xl">
        <Link href="/insights" className="inline-flex items-center gap-2 text-sm font-semibold text-atlas-navy hover:text-atlas-gold">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> All insights
        </Link>
        <p className="mt-10 text-xs font-bold uppercase tracking-[0.22em] text-atlas-gold">{article.category}</p>
        <h1 className="mt-4 font-serif text-4xl leading-tight text-atlas-navy md:text-6xl">{article.title}</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">{article.description}</p>
        <div
          className="prose-atlas mt-10 border-t border-atlas-line pt-8"
          dangerouslySetInnerHTML={{ __html: article.html }}
        />
      </div>
    </article>
  );
}
export const dynamic = "force-dynamic";
