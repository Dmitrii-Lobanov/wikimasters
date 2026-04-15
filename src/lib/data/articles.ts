import { eq, inArray } from "drizzle-orm";
import redis from "@/cache";
import db from "@/db/index";
import { articles, articleTags, tags, usersSync } from "@/db/schema";

// The list view selects only a subset of Article fields and adds the author's
// resolved name. Use a dedicated type for the list response.
export type ArticleList = {
  id: number;
  title: string;
  createdAt: string;
  summary: string | null;
  content: string;
  author: string | null;
  imageUrl?: string | null;
  tags?: { name: string; slug: string }[];
};

export async function getArticles(): Promise<ArticleList[]> {
  const cached = await redis.get<ArticleList[]>("articles:all");

  if (cached) {
    console.log("🎯 Get Articles Cache Hit!");
    return cached;
  }

  try {
    const response = await db
      .select({
        title: articles.title,
        id: articles.id,
        createdAt: articles.createdAt,
        summary: articles.summary,
        content: articles.content,
        author: usersSync.name,
      })
      .from(articles)
      .leftJoin(usersSync, eq(articles.authorId, usersSync.id));

    console.log("🏹 Get Articles Cache Miss!");

    // Storing cache temporarily
    const articleIds = response.map((a) => a.id);
    const tagsResult =
      articleIds.length > 0
        ? await db
            .select({
              articleId: articleTags.articleId,
              name: tags.name,
              slug: tags.slug,
            })
            .from(articleTags)
            .leftJoin(tags, eq(articleTags.tagId, tags.id))
            .where(inArray(articleTags.articleId, articleIds))
        : [];

    const finalResponse = response.map((article) => ({
      ...article,
      tags: tagsResult
        .filter((t) => t.articleId === article.id && t.name && t.slug)
        .map((t) => ({ name: t.name as string, slug: t.slug as string })),
    }));

    try {
      await redis.set("articles:all", JSON.stringify(finalResponse), {
        ex: 60,
      });
    } catch (err) {
      console.warn("Failed to set articles cache", err);
    }

    return finalResponse as unknown as ArticleList[];
  } catch (err) {
    console.warn("Failed to get articles", err);
  }

  return [];
}

export type ArticleWithAuthor = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  imageUrl?: string | null;
  author: string | null;
  tags?: { name: string; slug: string }[];
};

export async function getArticleById(id: number) {
  const response = await db
    .select({
      title: articles.title,
      id: articles.id,
      createdAt: articles.createdAt,
      content: articles.content,
      author: usersSync.name,
      imageUrl: articles.imageUrl,
    })
    .from(articles)
    .where(eq(articles.id, id))
    .leftJoin(usersSync, eq(articles.authorId, usersSync.id));

  if (!response[0]) return null;

  const articleTagsArray = await db
    .select({ name: tags.name, slug: tags.slug })
    .from(articleTags)
    .leftJoin(tags, eq(articleTags.tagId, tags.id))
    .where(eq(articleTags.articleId, id));

  const validTags = articleTagsArray
    .filter((t) => t.name && t.slug)
    .map((t) => ({ name: t.name as string, slug: t.slug as string }));

  return { ...(response[0] as unknown as ArticleWithAuthor), tags: validTags };
}
