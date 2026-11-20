import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const textList = z.array(z.union([
  z.string().trim().min(1).max(1200),
  z.object({
    title: z.string().trim().max(180).optional(),
    text: z.string().trim().max(2000).optional(),
    question: z.string().trim().max(300).optional(),
    answer: z.string().trim().max(2000).optional()
  })
])).max(30).optional();

const editorSchema = z.object({
  title: z.string().trim().min(1).max(140),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(160),
  excerpt: z.string().trim().min(1).max(320),
  introduction: z.string().max(12000).optional().default(""),
  whyLove: textList,
  ingredientNotes: textList,
  equipment: z.array(z.string().trim().min(1).max(180)).max(20).optional(),
  ingredients: z.array(z.object({
    section: z.string().max(120).optional(),
    quantity: z.string().max(100).optional(),
    item: z.string().trim().min(1).max(300)
  })).max(100),
  instructions: z.array(z.object({
    title: z.string().max(180).optional(),
    body: z.string().trim().min(1).max(5000),
    imagePublicId: z.string().max(300).optional()
  })).max(50),
  expertTips: textList,
  variations: textList,
  storageReheating: z.string().max(6000).optional().default(""),
  servingSuggestions: textList,
  faqs: z.array(z.object({
    question: z.string().trim().min(1).max(300),
    answer: z.string().trim().min(1).max(2000)
  })).max(20).optional(),
  authorNotes: z.string().max(6000).optional().default(""),
  prepMinutes: z.number().int().min(0).max(1440).nullable().optional(),
  cookMinutes: z.number().int().min(0).max(1440).nullable().optional(),
  totalMinutes: z.number().int().min(0).max(2880).nullable().optional(),
  servings: z.number().int().min(1).max(100),
  difficulty: z.string().max(60).optional(),
  recipeTemperature: z.string().max(100).optional(),
  recipeYield: z.string().max(120).optional(),
  heroPublicId: z.string().max(300).optional(),
  heroAltText: z.string().max(300).optional(),
  seoTitle: z.string().max(180).optional(),
  seoDescription: z.string().max(320).optional(),
  seoFocusKeyword: z.string().max(120).optional(),
  seoKeywords: z.array(z.string().max(100)).max(30).optional(),
  canonicalUrl: z.string().url().max(500).optional().or(z.literal("")),
  relatedRecipeSlugs: z.array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)).max(12).optional(),
  categoryIds: z.array(z.string().max(100)).max(20).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional()
});

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Context) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        ingredients: { orderBy: { sortOrder: "asc" } },
        instructions: { orderBy: { sortOrder: "asc" } },
        categories: { include: { category: true } }
      }
    });
    if (!recipe) return NextResponse.json({ error: "Recipe not found." }, { status: 404 });
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
    return NextResponse.json({ recipe, categories });
  } catch {
    return NextResponse.json({ error: "Could not load this recipe. Check the database connection and run pending migrations." }, { status: 503 });
  }
}

export async function PUT(request: NextRequest, { params }: Context) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  try {
    const raw = await request.json();
    const parsed = editorSchema.safeParse(raw);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Please review the recipe fields." }, { status: 400 });
    const data = parsed.data;
    const current = await prisma.recipe.findUnique({ where: { id }, select: { id: true, publishedAt: true } });
    if (!current) return NextResponse.json({ error: "Recipe not found." }, { status: 404 });
    const duplicate = await prisma.recipe.findFirst({ where: { slug: data.slug, NOT: { id } }, select: { id: true } });
    if (duplicate) return NextResponse.json({ error: "That URL slug is already in use." }, { status: 409 });

    if (data.status === "PUBLISHED" && (!data.ingredients.length || !data.instructions.length || !data.heroPublicId?.trim())) {
      return NextResponse.json({ error: "Before publishing, add the real ingredients, step-by-step instructions, and a recipe hero image." }, { status: 400 });
    }
    if (data.categoryIds?.length) {
      const found = await prisma.category.count({ where: { id: { in: data.categoryIds } } });
      if (found !== data.categoryIds.length) return NextResponse.json({ error: "One or more selected categories could not be found." }, { status: 400 });
    }

    const json = (value: unknown) => value === undefined ? undefined : value as Prisma.InputJsonValue;
    const recipe = await prisma.recipe.update({
      where: { id },
      data: {
        title: data.title, slug: data.slug, excerpt: data.excerpt,
        content: data.introduction, introduction: data.introduction,
        whyLove: json(data.whyLove), ingredientNotes: json(data.ingredientNotes),
        equipment: json(data.equipment), expertTips: json(data.expertTips),
        variations: json(data.variations), storageReheating: data.storageReheating,
        servingSuggestions: json(data.servingSuggestions), faqs: json(data.faqs),
        authorNotes: data.authorNotes, prepMinutes: data.prepMinutes,
        cookMinutes: data.cookMinutes, totalMinutes: data.totalMinutes,
        servings: data.servings, difficulty: data.difficulty,
        recipeTemperature: data.recipeTemperature, recipeYield: data.recipeYield,
        heroPublicId: data.heroPublicId, heroAltText: data.heroAltText,
        seoTitle: data.seoTitle, seoDescription: data.seoDescription,
        seoFocusKeyword: data.seoFocusKeyword, seoKeywords: data.seoKeywords,
        canonicalUrl: data.canonicalUrl || null,
        relatedRecipeSlugs: data.relatedRecipeSlugs || [],
        status: data.status || "DRAFT",
        publishedAt: data.status === "PUBLISHED" ? (current.publishedAt || new Date()) : null,
        ingredients: {
          deleteMany: {},
          create: data.ingredients.map((item, sortOrder) => ({ ...item, sortOrder }))
        },
        instructions: {
          deleteMany: {},
          create: data.instructions.map((step, sortOrder) => ({ ...step, sortOrder }))
        },
        ...(data.categoryIds ? {
          categories: {
            deleteMany: {},
            create: data.categoryIds.map((categoryId) => ({ categoryId }))
          }
        } : {})
      },
      select: { id: true, title: true, slug: true, status: true, updatedAt: true, publishedAt: true }
    });
    return NextResponse.json({ recipe });
  } catch {
    return NextResponse.json({ error: "Could not save recipe. Confirm the rich-content database migration has been applied." }, { status: 503 });
  }
}
