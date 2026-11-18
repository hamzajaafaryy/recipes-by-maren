import type { MetadataRoute } from "next";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://recipesbymaren.com";
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/disclosure`, changeFrequency: "yearly", priority: 0.2 }
  ];

  try {
    const [recipes, categories] = await Promise.all([
      prisma.recipe.findMany({
        where: { status: "PUBLISHED", publishedAt: { not: null } },
        select: { slug: true, updatedAt: true }
      }),
      prisma.category.findMany({
        where: { recipes: { some: { recipe: { status: "PUBLISHED", publishedAt: { not: null } } } } },
        select: { slug: true, updatedAt: true }
      })
    ]);
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
  } catch {
    return staticPages;
  }
}
