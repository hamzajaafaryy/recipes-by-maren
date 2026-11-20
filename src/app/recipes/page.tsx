import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getRecipeImageUrl } from "@/lib/recipe-media";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "All Recipes",
  description: "Explore easy dinners, comforting bakes, and dependable everyday recipes. Find your next favorite by category or ingredient.",
  alternates: { canonical: "/recipes" },
  openGraph: { title: "All Recipes | Recipes by Maren", description: "Explore easy dinners, comforting bakes, and dependable everyday recipes.", type: "website" },
  twitter: { card: "summary_large_image", title: "All Recipes | Recipes by Maren", description: "Find your next favorite recipe for everyday cooking." }
};

export default async function RecipesIndexPage() {
  let recipes: Array<{
    id: string; title: string; slug: string; excerpt: string; heroPublicId: string | null; totalMinutes: number | null;
    categories: { category: { name: string; slug: string } }[];
  }> = [];
  let categories: Array<{ id: string; name: string; slug: string; _count: { recipes: number } }> = [];
  try {
    [recipes, categories] = await Promise.all([
      prisma.recipe.findMany({
        where: { status: "PUBLISHED", publishedAt: { not: null } },
        orderBy: { publishedAt: "desc" },
        select: {
          id: true, title: true, slug: true, excerpt: true, heroPublicId: true, totalMinutes: true,
          categories: { include: { category: { select: { name: true, slug: true } } } }
        }
      }),
      prisma.category.findMany({
        where: { recipes: { some: { recipe: { status: "PUBLISHED", publishedAt: { not: null } } } } },
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true, _count: { select: { recipes: true } } }
      })
    ]);
  } catch (error) {
    console.error("[recipes-index] Failed to load recipes:", error);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://recipesbymaren.com";
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "All Recipes",
    url: `${siteUrl}/recipes`,
    mainEntity: { "@type": "ItemList", itemListElement: recipes.map((recipe, index) => ({
      "@type": "ListItem", position: index + 1, url: `${siteUrl}/recipes/${recipe.slug}`, name: recipe.title
    })) }
  };

  return (
    <main className="maren-recipes-page" id="main-content" tabIndex={-1}>
      <header className="maren-recipes-hero">
        <div className="maren-recipes-hero-inner">
          <nav className="maren-breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>All recipes</span></nav>
          <span className="maren-eyebrow">THE RECIPE COLLECTION</span>
          <h1>Find something<br /><em>delicious.</em></h1>
          <p>From quick weeknight dinners to slow Sunday favorites, find a recipe that fits the moment.</p>
          <form className="maren-search maren-index-search" action="/search" method="get" role="search">
            <label className="sr-only" htmlFor="index-recipe-search">Search recipes or ingredients</label>
            <span aria-hidden="true">⌕</span><input id="index-recipe-search" name="q" type="search" placeholder="Search by dish or ingredient…" maxLength={80} />
            <button type="submit">Search <span aria-hidden="true">→</span></button>
          </form>
        </div>
        <div className="maren-recipes-hero-art" aria-hidden="true"><div className="maren-recipes-hero-orbit">GOOD FOOD<br />GOOD MOOD</div></div>
      </header>

      <section className="maren-index-content">
        <div className="maren-index-heading">
          <div><span className="maren-eyebrow">BROWSE YOUR WAY</span><h2>Explore the recipe box</h2></div>
          <span className="maren-total-count">{recipes.length} {recipes.length === 1 ? "recipe" : "recipes"} to explore</span>
        </div>
        {categories.length ? (
          <nav className="maren-filter-chips" aria-label="Recipe categories">
            <span className="maren-filter-chip-active">All recipes</span>
            {categories.map((category) => <Link className="maren-filter-chip" href={`/category/${category.slug}`} key={category.id}>{category.name}<small>{category._count.recipes}</small></Link>)}
          </nav>
        ) : null}
        {recipes.length ? (
          <div className="maren-index-grid">
            {recipes.map((recipe, index) => {
              const image = getRecipeImageUrl(recipe.heroPublicId, 900);
              const category = recipe.categories[0]?.category;
              return (
                <article className="maren-index-card" key={recipe.id}>
                  <Link className="maren-index-card-image" href={`/recipes/${recipe.slug}`} aria-label={`Read ${recipe.title}`}>
                    {image ? <Image src={image} alt={recipe.title} fill unoptimized sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 33vw" /> : <span className="maren-image-placeholder" />}
                    <span className="maren-index-number">{String(index + 1).padStart(2, "0")}</span>
                  </Link>
                  <div className="maren-index-card-copy">
                    {category ? <Link className="maren-card-category" href={`/category/${category.slug}`}>{category.name}</Link> : <span className="maren-card-category">FROM THE KITCHEN</span>}
                    <h2><Link href={`/recipes/${recipe.slug}`}>{recipe.title}</Link></h2>
                    <p>{recipe.excerpt}</p>
                    <div className="maren-card-footer">{recipe.totalMinutes ? <span>◷ {recipe.totalMinutes} min</span> : <span>EVERYDAY FAVORITE</span>}<Link href={`/recipes/${recipe.slug}`}>View recipe <span>→</span></Link></div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : <div className="maren-empty-state"><span>✳</span><h2>Something delicious is in the works.</h2><p>New recipes are being added to the collection. Come back soon and find a new favorite.</p><Link href="/">Back to the homepage <span>→</span></Link></div>}
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    </main>
  );
}
