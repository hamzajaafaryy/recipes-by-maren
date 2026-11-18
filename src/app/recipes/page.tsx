import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getRecipeImageUrl } from "@/lib/recipe-media";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "All Recipes",
  description: "Browse all simple, approachable recipes from Recipes by Maren.",
  alternates: { canonical: "/recipes" },
  openGraph: {
    title: "All Recipes | Recipes by Maren",
    description: "Browse all simple, approachable recipes from Recipes by Maren.",
    type: "website"
  }
};

export default async function RecipesIndexPage() {
  let recipes: Array<{ id: string; title: string; slug: string; excerpt: string; heroPublicId: string | null; totalMinutes: number | null }> = [];
  try {
    recipes = await prisma.recipe.findMany({
      where: { status: "PUBLISHED", publishedAt: { not: null } },
      orderBy: { publishedAt: "desc" },
      select: { id: true, title: true, slug: true, excerpt: true, heroPublicId: true, totalMinutes: true }
    });
  } catch {}

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://recipesbymaren.com";
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "All Recipes",
    url: `${siteUrl}/recipes`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: recipes.map((recipe, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteUrl}/recipes/${recipe.slug}`,
        name: recipe.title
      }))
    }
  };

  return (
    <main className="content-page listing-page" id="main-content" tabIndex={-1}>
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span>All recipes</span></nav>
      <header className="listing-header">
        <span className="eyebrow">The recipe collection</span>
        <h1>All recipes</h1>
        <p>Simple, approachable ideas for everyday cooking, gathered in one place.</p>
      </header>
      {recipes.length ? (
        <div className="listing-grid">
          {recipes.map((recipe) => {
            const image = getRecipeImageUrl(recipe.heroPublicId, 800);
            return (
              <article className="recipe-card" key={recipe.id}>
                <Link className="listing-image-link" href={`/recipes/${recipe.slug}`} aria-label={`Read ${recipe.title}`}>
                  {image ? <div className="recipe-photo" role="img" aria-label={recipe.title} style={{ backgroundImage: `url("${image}")` }} /> : <div className="recipe-photo recipe-photo-empty" aria-hidden="true" />}
                </Link>
                <div className="recipe-info">
                  <h2><Link href={`/recipes/${recipe.slug}`}>{recipe.title}</Link></h2>
                  <p>{recipe.excerpt}</p>
                  {recipe.totalMinutes ? <span className="recipe-time">{recipe.totalMinutes} minutes</span> : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : <p className="empty-listing">New recipes are being added to the collection. Please check back soon.</p>}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    </main>
  );
}
