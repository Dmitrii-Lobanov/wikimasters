"use server";

import { eq, inArray, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import summarizeArticle from "@/ai/summarize";
import redis from "@/cache";
import { authorizeUserToEditArticle } from "@/db/authz";
import db from "@/db/index";
import { articles, articleTags, tags } from "@/db/schema";
import { ensureUserExists } from "@/db/sync-user";
import { stackServerApp } from "@/stack/server";

// Server actions for articles (stubs)
// TODO: Replace with real database operations when ready

export type CreateArticleInput = {
  title: string;
  content: string;
  authorId: string;
  imageUrl?: string;
  tags?: string[];
};

export type UpdateArticleInput = {
  title?: string;
  content?: string;
  imageUrl?: string;
  tags?: string[];
};

async function attachTagsToArticle(articleId: number, tagNames: string[]) {
  if (!tagNames || tagNames.length === 0) {
    await db.delete(articleTags).where(eq(articleTags.articleId, articleId));
    return;
  }

  const tagSlugs = tagNames.map((name) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, ""),
  );

  // Insert new tags safely
  for (let i = 0; i < tagNames.length; i++) {
    await db
      .insert(tags)
      .values({ name: tagNames[i], slug: tagSlugs[i] })
      .onConflictDoNothing();
  }

  // Fetch IDs of these tags
  const matchedTags = await db
    .select()
    .from(tags)
    .where(inArray(tags.slug, tagSlugs));

  // Clean existing article tags
  await db.delete(articleTags).where(eq(articleTags.articleId, articleId));

  // Insert new ones
  if (matchedTags.length > 0) {
    await db
      .insert(articleTags)
      .values(matchedTags.map((tag) => ({ articleId, tagId: tag.id })));
  }
}

export async function createArticle(data: CreateArticleInput) {
  const user = await stackServerApp.getUser();
  if (!user) {
    throw new Error("❌ Unauthorized");
  }

  await ensureUserExists(user);

  console.log("✨ createArticle called:", data);

  const summary = await summarizeArticle(data.title || "", data.content || "");

  const response = await db
    .insert(articles)
    .values({
      title: data.title,
      content: data.content,
      slug: `${Date.now()}`,
      published: true,
      authorId: user.id,
      imageUrl: data.imageUrl ?? undefined,
      summary,
    })
    .returning({ id: articles.id });

  const articleId = response[0]?.id;

  if (articleId && data.tags) {
    await attachTagsToArticle(articleId, data.tags);
  }

  // Invalidate cache
  redis.del("articles:all");

  return { success: true, message: "Article create logged", id: articleId };
}

export async function updateArticle(id: string, data: UpdateArticleInput) {
  const user = await stackServerApp.getUser();

  console.log("USER", user?.id, id, user?.id === String(id));

  if (!user) {
    throw new Error("❌ Unauthorized");
  }

  if (!(await authorizeUserToEditArticle(user.id, +id))) {
    throw new Error("❌ Forbidden");
  }

  console.log("📝 updateArticle called:", { id, ...data });

  const summary = await summarizeArticle(data.title || "", data.content || "");

  await db
    .update(articles)
    .set({
      title: data.title,
      content: data.content,
      imageUrl: data.imageUrl ?? undefined,
      summary: summary ?? undefined,
    })
    .where(eq(articles.id, +id));

  if (data.tags) {
    await attachTagsToArticle(+id, data.tags);
  }

  // Invalidate cache
  redis.del("articles:all");

  return { success: true, message: `Article ${id} update logged` };
}

export async function deleteArticle(id: string) {
  const user = await stackServerApp.getUser();
  if (!user) {
    throw new Error("❌ Unauthorized");
  }

  if (!(await authorizeUserToEditArticle(user.id, +id))) {
    throw new Error("❌ Forbidden");
  }

  console.log("🗑️ deleteArticle called:", id);

  const _response = await db.delete(articles).where(eq(articles.id, +id));

  return { success: true, message: `Article ${id} delete logged (stub)` };
}

// Form-friendly server action: accepts FormData from a client form and calls deleteArticle
export async function deleteArticleForm(formData: FormData): Promise<void> {
  const id = formData.get("id");
  if (!id) {
    throw new Error("Missing article id");
  }

  await deleteArticle(String(id));
  // After deleting, redirect the user back to the homepage.
  redirect("/");
}

export async function searchArticles(query: string) {
  if (!query || query.trim().length === 0) return [];

  const results = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      summary: articles.summary,
    })
    .from(articles)
    .where(
      sql`to_tsvector('english', ${articles.title} || ' ' || ${articles.content}) @@ plainto_tsquery('english', ${query})`,
    )
    .limit(5);

  return results;
}
