import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://recipesbymaren.com";
  let latestRecipeDate: Date | undefined;
  let recipes: Array<{ slug: string; updatedAt: Date }> = [];
  let categories: Array<{ slug: string; updatedAt: Date }> = [];

  try {
    const [latest, recipeRows, categoryRows] = await Promise.all([
      prisma.recipe.findFirst({
        where: { status: "PUBLISHED", publishedAt: { not: null } },
        orderBy: { publishedAt: "desc" },
        select: { updatedAt: true }
      }),
      prisma.recipe.findMany({
        where: { status: "PUBLISHED", publishedAt: { not: null } },
        select: { slug: true, updatedAt: true }
      }),
      prisma.category.findMany({
        where: { recipes: { some: { recipe: { status: "PUBLISHED", publishedAt: { not: null } } } } },
        select: { slug: true, updatedAt: true, _count: { select: { recipes: { where: { recipe: { status: "PUBLISHED", publishedAt: { not: null } } } } } } }
      })
    ]);
    latestRecipeDate = latest?.updatedAt;
    recipes = recipeRows;
    categories = categoryRows.filter((category) => category._count.recipes >= 3);
  } catch {
    // Keep a valid static sitemap while the database is not configured.
  }

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, ...(latestRecipeDate ? { lastModified: latestRecipeDate } : {}), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/recipes`, ...(latestRecipeDate ? { lastModified: latestRecipeDate } : {}), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/disclosure`, changeFrequency: "yearly", priority: 0.2 }
  ];

  return [
    ...staticPages,
    ...recipes.map((recipe) => ({
      url: `${baseUrl}/recipes/${recipe.slug}`,
      lastModified: recipe.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8
    })),
    ...categories.map((category) => ({
      url: `${baseUrl}/category/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6
    }))
  ];
}
