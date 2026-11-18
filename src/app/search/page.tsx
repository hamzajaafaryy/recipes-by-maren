import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getRecipeImageUrl } from "@/lib/recipe-media";

export const metadata: Metadata = {
  title: "Search Recipes",
  description: "Search the Recipes by Maren collection for simple meals and everyday inspiration.",
  robots: { index: false, follow: true }
};

type Props = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = (params.q || "").trim().slice(0, 80);
  let recipes: Array<{
    id: string; title: string; slug: string; excerpt: string; heroPublicId: string | null; totalMinutes: number | null;
  }> = [];
  let unavailable = false;

  if (query.length >= 2) {
    try {
      recipes = await prisma.recipe.findMany({
        where: {
          status: "PUBLISHED",
          publishedAt: { not: null },
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { excerpt: { contains: query, mode: "insensitive" } },
            { ingredients: { some: { item: { contains: query, mode: "insensitive" } } } }
          ]
        },
        orderBy: { publishedAt: "desc" },
        take: 24,
        select: { id: true, title: true, slug: true, excerpt: true, heroPublicId: true, totalMinutes: true }
      });
    } catch {
      unavailable = true;
    }
  }

  return (
    <main className="content-page search-page" id="main-content" tabIndex={-1}>
      <header className="listing-header">
        <span className="eyebrow">Find something delicious</span>
        <h1>Search recipes</h1>
        <p>Search by recipe name, description, or ingredient.</p>
        <form className="recipe-search-form" action="/search" method="get" role="search">
          <label className="sr-only" htmlFor="recipe-search">Search recipes</label>
          <input id="recipe-search" name="q" type="search" defaultValue={query} placeholder="Try chicken, pasta, or lemon…" maxLength={80} />
          <button className="button-primary" type="submit">Search</button>
        </form>
      </header>
      {unavailable ? <p className="empty-listing" role="status">Recipe search is temporarily unavailable. Please try again in a moment.</p> : null}
      {query.length > 0 && query.length < 2 ? <p className="empty-listing">Enter at least two characters to search.</p> : null}
      {query.length >= 2 && !unavailable ? (
        <>
          <p className="search-result-count">{recipes.length} {recipes.length === 1 ? "result" : "results"} for “{query}”</p>
          {recipes.length ? (
            <div className="listing-grid">
              {recipes.map((recipe) => {
                const image = getRecipeImageUrl(recipe.heroPublicId, 800);
                return (
                  <article className="recipe-card" key={recipe.id}>
                    <a className="listing-image-link" href={`/recipes/${recipe.slug}`} aria-label={`Read ${recipe.title}`}>
                      {image ? <div className="recipe-photo" role="img" aria-label={recipe.title} style={{ backgroundImage: `url("${image}")` }} /> : <div className="recipe-photo recipe-photo-empty" aria-hidden="true" />}
                    </a>
                    <div className="recipe-info">
                      <h2><a href={`/recipes/${recipe.slug}`}>{recipe.title}</a></h2>
                      <p>{recipe.excerpt}</p>
                      {recipe.totalMinutes ? <span className="recipe-time">{recipe.totalMinutes} minutes</span> : null}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : <p className="empty-listing">No recipes found. Try a different ingredient or search term.</p>}
        </>
      ) : null}
    </main>
  );
}
