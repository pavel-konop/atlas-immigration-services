import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import type { InsightItem, SiteContent } from "@/types/admin-content";

export type Article = {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  featured: boolean;
  image: string;
  html: string;
};

const articlesDirectory = path.join(process.cwd(), "content/articles");

export async function getArticles(content?: SiteContent): Promise<Article[]> {
  const filenames = await fs.readdir(articlesDirectory);
  const markdownArticles = await Promise.all(
    filenames
      .filter((filename) => filename.endsWith(".md"))
      .map(async (filename) => {
        const slug = filename.replace(/\.md$/, "");
        return getArticle(slug);
      })
  );

  const articleMap = new Map(markdownArticles.map((article) => [article.slug, article]));
  if (content?.contentLibrary?.insights) {
    content.contentLibrary.insights.filter((item) => !item.enabled).forEach((item) => articleMap.delete(item.slug));
    const managedArticles = await Promise.all(content.contentLibrary.insights.filter((item) => item.enabled).map((item) => insightToArticle(item, articleMap.get(item.slug))));
    managedArticles.forEach((article) => articleMap.set(article.slug, article));
  }

  return [...articleMap.values()].sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)));
}

export async function getFeaturedArticles(limit = 3, content?: SiteContent) {
  const articles = await getArticles(content);
  return articles.filter((article) => article.featured).slice(0, limit);
}

export async function getArticle(slug: string, content?: SiteContent): Promise<Article> {
  const managed = content?.contentLibrary?.insights.find((item) => item.slug === slug && item.enabled);
  if (managed) {
    const fallback = await getMarkdownArticle(slug).catch(() => null);
    return insightToArticle(managed, fallback || undefined);
  }

  return getMarkdownArticle(slug);
}

async function getMarkdownArticle(slug: string): Promise<Article> {
  const fullPath = path.join(articlesDirectory, `${slug}.md`);
  const file = await fs.readFile(fullPath, "utf8");
  const parsed = matter(file);

  return {
    slug,
    title: String(parsed.data.title),
    description: String(parsed.data.description),
    date: String(parsed.data.date),
    category: String(parsed.data.category),
    featured: Boolean(parsed.data.featured),
    image: String(parsed.data.image || "/images/atlas-corporate-review.png"),
    html: await markdownToHtml(parsed.content)
  };
}

async function insightToArticle(item: InsightItem, fallback?: Article): Promise<Article> {
  return {
    slug: item.slug,
    title: item.title || fallback?.title || item.slug,
    description: item.description || fallback?.description || "",
    date: item.date || fallback?.date || "2026-01-01",
    category: item.category || fallback?.category || "Insights",
    featured: item.featured,
    image: item.image || fallback?.image || "/images/atlas-corporate-review.png",
    html: item.content ? await markdownToHtml(item.content) : fallback?.html || ""
  };
}

async function markdownToHtml(markdown: string) {
  const processed = await remark().use(html).process(markdown);
  return processed.toString();
}
