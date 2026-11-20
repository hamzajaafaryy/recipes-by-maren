import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const list = z.array(z.union([z.string().trim().min(1).max(1200), z.object({
  title: z.string().max(180).optional(), text: z.string().max(2000).optional(),
  question: z.string().max(300).optional(), answer: z.string().max(2000).optional(),
  description: z.string().max(2000).optional()
})])).max(30).optional();
const schema = z.object({
  title: z.string().trim().min(1).max(140),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(160),
  excerpt: z.string().trim().min(1).max(320),
  introduction: z.string().max(12000).optional().default(""),
  whyLove: list, ingredientNotes: list, equipment: z.array(z.string().max(180)).max(20).optional(),
  ingredients: z.array(z.object({ section: z.string().max(120).optional(), quantity: z.string().max(100).optional(), item: z.string().trim().min(1).max(300) })).max(100),
  instructions: z.array(z.object({ title: z.string().max(180).optional(), body: z.string().trim().min(1).max(5000) })).max(50),
  expertTips: list, variations: list, storageReheating: z.string().max(6000).optional(),
  servingSuggestions: list, faqs: z.array(z.object({ question: z.string().min(1).max(300), answer: z.string().min(1).max(2000) })).max(20).optional(),
  authorNotes: z.string().max(6000).optional(),
  prepMinutes: z.number().int().min(0).max(1440).nullable().optional(),
  cookMinutes: z.number().int().min(0).max(1440).nullable().optional(),
  totalMinutes: z.number().int().min(0).max(2880).nullable().optional(),
  servings: z.number().int().min(1).max(100).optional().default(4),
  difficulty: z.string().max(60).optional(), recipeTemperature: z.string().max(100).optional(), recipeYield: z.string().max(120).optional(),
  heroAltText: z.string().max(300).optional(), seoTitle: z.string().max(180).optional(),
  seoDescription: z.string().max(320).optional(), seoFocusKeyword: z.string().max(120).optional(),
  seoKeywords: z.array(z.string().max(100)).max(30).optional(),
  relatedRecipeSlugs: z.array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)).max(12).optional(),
  categories: z.array(z.string().max(100)).max(20).optional(),
  images: z.array(z.object({ filename: z.string().max(255), alt: z.string().max(300), caption: z.string().max(500).optional(), placement: z.string().max(80).optional(), copyright: z.string().max(160).optional() })).max(20).optional()
});

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid recipe JSON." }, { status: 400 });
    const data = parsed.data;
    if (await prisma.recipe.findUnique({ where: { slug: data.slug }, select: { id: true } })) {
      return NextResponse.json({ error: "This slug already exists. Open the existing recipe instead of importing a duplicate." }, { status: 409 });
    }
    const author = await prisma.author.upsert({
      where: { slug: "maren" }, update: {},
      create: { name: "Maren", slug: "maren", bio: "Editorial pen name for Recipes by Maren." }
    });
    const categoryRows = data.categories?.length ? await prisma.category.findMany({
      where: { OR: data.categories.flatMap((name) => [{ name: { equals: name, mode: "insensitive" as const } }, { slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") }]) },
      select: { id: true, name: true }
    }) : [];
    const missingCategories = (data.categories || []).filter((name) => !categoryRows.some((row) => row.name.toLowerCase() === name.toLowerCase() || row.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") === name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")));
    const json = (value: unknown) => value === undefined ? undefined : value as Prisma.InputJsonValue;
    const recipe = await prisma.recipe.create({ data: {
      title: data.title, slug: data.slug, excerpt: data.excerpt, content: data.introduction,
      introduction: data.introduction, status: "DRAFT", publishedAt: null, authorId: author.id,
      whyLove: json(data.whyLove), ingredientNotes: json(data.ingredientNotes), equipment: json(data.equipment),
      expertTips: json(data.expertTips), variations: json(data.variations), storageReheating: data.storageReheating,
      servingSuggestions: json(data.servingSuggestions), faqs: json(data.faqs), authorNotes: data.authorNotes,
      prepMinutes: data.prepMinutes, cookMinutes: data.cookMinutes, totalMinutes: data.totalMinutes,
      servings: data.servings, difficulty: data.difficulty, recipeTemperature: data.recipeTemperature,
      recipeYield: data.recipeYield, heroAltText: data.heroAltText, seoTitle: data.seoTitle,
      seoDescription: data.seoDescription, seoFocusKeyword: data.seoFocusKeyword,
      seoKeywords: data.seoKeywords || [], relatedRecipeSlugs: data.relatedRecipeSlugs || [],
      ingredients: { create: data.ingredients.map((item, sortOrder) => ({ ...item, sortOrder })) },
      instructions: { create: data.instructions.map((step, sortOrder) => ({ ...step, sortOrder })) },
      categories: { create: categoryRows.map((category) => ({ categoryId: category.id })) }
    }, select: { id: true, title: true, slug: true, status: true } });
    return NextResponse.json({ recipe, missingCategories, imageManifest: data.images || [], message: "Imported as a draft. Add and review the original photos before publishing." }, { status: 201 });
  } catch (error) {
    console.error("Recipe JSON import failed:", error);
    return NextResponse.json({ error: "Import failed. Check the database connection and recipe fields." }, { status: 503 });
  }
}
