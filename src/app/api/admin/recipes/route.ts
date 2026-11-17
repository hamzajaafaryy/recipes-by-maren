import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const recipes = await prisma.recipe.findMany({
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, slug: true, status: true, updatedAt: true }
    });
    return NextResponse.json({ recipes });
  } catch {
    return NextResponse.json({ error: "Database is not connected yet." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const body = (await request.json()) as { title?: string; slug?: string; excerpt?: string; status?: string };
    const title = body.title?.trim();
    const slug = body.slug?.trim().toLowerCase();
    const excerpt = body.excerpt?.trim();
    const status = "DRAFT";

    if (!title || title.length > 140) return NextResponse.json({ error: "Title is required (maximum 140 characters)." }, { status: 400 });
    if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 160) return NextResponse.json({ error: "Use a valid lowercase URL slug." }, { status: 400 });
    if (!excerpt || excerpt.length > 320) return NextResponse.json({ error: "A short description is required (maximum 320 characters)." }, { status: 400 });

    const existing = await prisma.recipe.findUnique({ where: { slug }, select: { id: true } });
    if (existing) return NextResponse.json({ error: "That URL slug is already in use." }, { status: 409 });

    const author = await prisma.author.upsert({
      where: { slug: "maren" },
      update: {},
      create: {
        name: "Maren",
        slug: "maren",
        bio: "Editorial pen name for Recipes by Maren."
      }
    });

    const recipe = await prisma.recipe.create({
      data: {
        title,
        slug,
        excerpt,
        content: "",
        status,
        authorId: author.id,
        publishedAt: status === "PUBLISHED" ? new Date() : null
      },
      select: { id: true, title: true, slug: true, status: true }
    });
    return NextResponse.json({ recipe }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not save recipe. Check that the database is configured and migrations are applied." }, { status: 503 });
  }
}
