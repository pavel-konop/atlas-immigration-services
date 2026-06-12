import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

export type Article = {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  featured: boolean;
  html: string;
};

const articlesDirectory = path.join(process.cwd(), "content/articles");

export async function getArticles(): Promise<Article[]> {
  const filenames = await fs.readdir(articlesDirectory);
  const articles = await Promise.all(
    filenames
      .filter((filename) => filename.endsWith(".md"))
      .map(async (filename) => {
        const slug = filename.replace(/\.md$/, "");
        return getArticle(slug);
      })
  );

  return articles.sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)));
}

export async function getFeaturedArticles(limit = 3) {
  const articles = await getArticles();
  return articles.filter((article) => article.featured).slice(0, limit);
}

export async function getArticle(slug: string): Promise<Article> {
  const fullPath = path.join(articlesDirectory, `${slug}.md`);
  const file = await fs.readFile(fullPath, "utf8");
  const parsed = matter(file);
  const processed = await remark().use(html).process(parsed.content);

  return {
    slug,
    title: String(parsed.data.title),
    description: String(parsed.data.description),
    date: String(parsed.data.date),
    category: String(parsed.data.category),
    featured: Boolean(parsed.data.featured),
    html: processed.toString()
  };
}
