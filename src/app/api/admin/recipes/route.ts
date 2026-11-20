import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
const recipeInclude = {
  ingredients: { orderBy: { sortOrder: "asc" as const } },
  instructions: { orderBy: { sortOrder: "asc" as const } },
  categories: { include: { category: { select: { id: true, name: true, slug: true } } } }
};

export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const recipes = await prisma.recipe.findMany({ orderBy: { updatedAt: "desc" }, include: recipeInclude });
    return NextResponse.json({ recipes });
  } catch {
    return NextResponse.json({ error: "Database is not connected yet." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
    const excerpt = typeof body.excerpt === "string" ? body.excerpt.trim() : "";
    const status = body.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
    const ingredients = Array.isArray(body.ingredients) ? body.ingredients.filter((x: any) => typeof x.item === "string" && x.item.trim()).slice(0, 100) : [];
    const instructions = Array.isArray(body.instructions) ? body.instructions.filter((x: any) => typeof x.body === "string" && x.body.trim()).slice(0, 50) : [];
    const categoryIds = Array.isArray(body.categoryIds) ? [...new Set(body.categoryIds.filter((x: unknown) => typeof x === "string"))].slice(0, 30) : [];
    if (!title || title.length > 140) return NextResponse.json({ error: "Title is required (maximum 140 characters)." }, { status: 400 });
    if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 160) return NextResponse.json({ error: "Use a valid lowercase URL slug." }, { status: 400 });
    if (!excerpt || excerpt.length > 320) return NextResponse.json({ error: "A short description is required (maximum 320 characters)." }, { status: 400 });
    if (status === "PUBLISHED" && ingredients.length === 0) return NextResponse.json({ error: "Add at least one ingredient before publishing." }, { status: 400 });
    if (status === "PUBLISHED" && instructions.length === 0) return NextResponse.json({ error: "Add at least one cooking instruction before publishing." }, { status: 400 });
    if (status === "PUBLISHED" && !body.heroPublicId) return NextResponse.json({ error: "Add a recipe photo before publishing." }, { status: 400 });
    const author = await prisma.author.upsert({ where: { slug: "maren" }, update: {}, create: { name: "Maren", slug: "maren", bio: "Editorial pen name for Recipes by Maren." } });
    const recipe = await prisma.recipe.create({
      data: {
        title, slug, excerpt, content: typeof body.content === "string" ? body.content.slice(0, 30000) : "",
        status, authorId: author.id, publishedAt: status === "PUBLISHED" ? new Date() : null,
        prepMinutes: Number.isInteger(body.prepMinutes) && body.prepMinutes >= 0 ? body.prepMinutes : null,
        cookMinutes: Number.isInteger(body.cookMinutes) && body.cookMinutes >= 0 ? body.cookMinutes : null,
        totalMinutes: (Number.isInteger(body.prepMinutes) && body.prepMinutes >= 0 ? body.prepMinutes : 0) + (Number.isInteger(body.cookMinutes) && body.cookMinutes >= 0 ? body.cookMinutes : 0) || null,
        servings: Number.isInteger(body.servings) && body.servings > 0 ? body.servings : 4,
        difficulty: typeof body.difficulty === "string" ? body.difficulty.slice(0, 40) : null,
        heroPublicId: typeof body.heroPublicId === "string" ? body.heroPublicId.slice(0, 255) : null,
        seoTitle: typeof body.seoTitle === "string" ? body.seoTitle.slice(0, 180) : null,
        seoDescription: typeof body.seoDescription === "string" ? body.seoDescription.slice(0, 320) : null,
        canonicalUrl: typeof body.canonicalUrl === "string" ? body.canonicalUrl.slice(0, 500) : null,
        ingredients: { create: ingredients.map((x: any, i: number) => ({ section: typeof x.section === "string" ? x.section.slice(0, 120) : null, quantity: typeof x.quantity === "string" ? x.quantity.slice(0, 120) : null, item: x.item.trim().slice(0, 240), sortOrder: i })) },
        instructions: { create: instructions.map((x: any, i: number) => ({ title: typeof x.title === "string" ? x.title.slice(0, 160) : null, body: x.body.trim().slice(0, 5000), sortOrder: i })) },
        categories: { create: categoryIds.map((categoryId: string) => ({ category: { connect: { id: categoryId } } })) }
      },
      include: recipeInclude
    });
    return NextResponse.json({ recipe }, { status: 201 });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") return NextResponse.json({ error: "That URL slug is already in use." }, { status: 409 });
    return NextResponse.json({ error: "Could not save recipe. Check database connectivity and migrations." }, { status: 503 });
  }
}
