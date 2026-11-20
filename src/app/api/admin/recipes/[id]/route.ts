import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
type IngredientInput = { section?: unknown; quantity?: unknown; item: string };
type InstructionInput = { title?: unknown; body: string };
function isIngredient(value: unknown): value is IngredientInput {
  return !!value && typeof value === "object" && "item" in value && typeof value.item === "string" && value.item.trim().length > 0;
}
function isInstruction(value: unknown): value is InstructionInput {
  return !!value && typeof value === "object" && "body" in value && typeof value.body === "string" && value.body.trim().length > 0;
}
type Context = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: Context) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await context.params;
  try {
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
    const excerpt = typeof body.excerpt === "string" ? body.excerpt.trim() : "";
    const status = body.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
    if (!title || title.length > 140) return NextResponse.json({ error: "Title is required (maximum 140 characters)." }, { status: 400 });
    if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 160) return NextResponse.json({ error: "Use a valid lowercase URL slug." }, { status: 400 });
    if (!excerpt || excerpt.length > 320) return NextResponse.json({ error: "A short description is required (maximum 320 characters)." }, { status: 400 });
    const ingredients: IngredientInput[] = Array.isArray(body.ingredients) ? body.ingredients.filter(isIngredient).slice(0, 100) : [];
    const instructions: InstructionInput[] = Array.isArray(body.instructions) ? body.instructions.filter(isInstruction).slice(0, 50) : [];
    const categoryIds: string[] = Array.isArray(body.categoryIds) ? Array.from(new Set(body.categoryIds.filter((x: unknown): x is string => typeof x === "string"))).slice(0, 30) : [];
    if (status === "PUBLISHED") {
      if (ingredients.length === 0) return NextResponse.json({ error: "Add at least one ingredient before publishing." }, { status: 400 });
      if (instructions.length === 0) return NextResponse.json({ error: "Add at least one cooking instruction before publishing." }, { status: 400 });
      if (!body.heroPublicId || typeof body.heroPublicId !== "string") return NextResponse.json({ error: "Add a recipe photo before publishing." }, { status: 400 });
    }
    const existing = await prisma.recipe.findUnique({ where: { id }, select: { id: true, publishedAt: true } });
    if (!existing) return NextResponse.json({ error: "Recipe not found." }, { status: 404 });
    const recipe = await prisma.$transaction(async tx => {
      await tx.ingredient.deleteMany({ where: { recipeId: id } });
      await tx.instruction.deleteMany({ where: { recipeId: id } });
      await tx.recipeCategory.deleteMany({ where: { recipeId: id } });
      return tx.recipe.update({
        where: { id },
        data: {
          title, slug, excerpt, content: typeof body.content === "string" ? body.content.slice(0, 30000) : "",
          status,
          prepMinutes: Number.isInteger(body.prepMinutes) && body.prepMinutes >= 0 ? body.prepMinutes : null,
          cookMinutes: Number.isInteger(body.cookMinutes) && body.cookMinutes >= 0 ? body.cookMinutes : null,
          totalMinutes: (Number.isInteger(body.prepMinutes) && body.prepMinutes >= 0 ? body.prepMinutes : 0) + (Number.isInteger(body.cookMinutes) && body.cookMinutes >= 0 ? body.cookMinutes : 0) || null,
          servings: Number.isInteger(body.servings) && body.servings > 0 ? body.servings : 4,
          difficulty: typeof body.difficulty === "string" ? body.difficulty.slice(0, 40) : null,
          heroPublicId: typeof body.heroPublicId === "string" ? body.heroPublicId.slice(0, 255) : null,
          seoTitle: typeof body.seoTitle === "string" ? body.seoTitle.slice(0, 180) : null,
          seoDescription: typeof body.seoDescription === "string" ? body.seoDescription.slice(0, 320) : null,
          canonicalUrl: typeof body.canonicalUrl === "string" ? body.canonicalUrl.slice(0, 500) : null,
          publishedAt: status === "PUBLISHED" ? (existing.publishedAt || new Date()) : null,
          ingredients: { create: ingredients.map((x, i) => ({ section: typeof x.section === "string" ? x.section.slice(0, 120) : null, quantity: typeof x.quantity === "string" ? x.quantity.slice(0, 120) : null, item: x.item.trim().slice(0, 240), sortOrder: i })) },
          instructions: { create: instructions.map((x, i) => ({ title: typeof x.title === "string" ? x.title.slice(0, 160) : null, body: x.body.trim().slice(0, 5000), sortOrder: i })) },
          categories: { create: categoryIds.map((categoryId: string) => ({ category: { connect: { id: categoryId } } })) }
        },
        include: {
          ingredients: { orderBy: { sortOrder: "asc" } },
          instructions: { orderBy: { sortOrder: "asc" } },
          categories: { include: { category: { select: { id: true, name: true, slug: true } } } }
        }
      });
    });
    return NextResponse.json({ recipe });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") return NextResponse.json({ error: "That URL slug is already in use." }, { status: 409 });
    return NextResponse.json({ error: "Could not update recipe. Please check the entered data." }, { status: 503 });
  }
}

export async function DELETE(_request: NextRequest, context: Context) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await context.params;
  try {
    await prisma.recipe.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Recipe not found or could not be deleted." }, { status: 404 });
  }
}
