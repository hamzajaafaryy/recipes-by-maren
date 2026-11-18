import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getRecipeImageUrl } from "@/lib/recipe-media";

type Props = { params: Promise<{ slug: string }> };

async function getCategory(slug: string) {
  try {
    return await prisma.category.findUnique({
      where: { slug },
      include: {
        recipes: {
          where: { recipe: { status: "PUBLISHED", publishedAt: { not: null } } },
          include: { recipe: { select: { id: true, title: true, slug: true, excerpt: true, heroPublicId: true, totalMinutes: true, publishedAt: true } } }
        }
      }
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Category not found", robots: { index: false, follow: false } };
  const description = category.description?.trim() || `Browse ${category.name.toLowerCase()} recipes from Recipes by Maren. Find approachable ideas for everyday home cooking.`;
  return {
    title: `${category.name} Recipes`,
    description,
    alternates: { canonical: `/category/${category.slug}` },
    openGraph: { title: `${category.name} Recipes | Recipes by Maren`, description, type: "website" }
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const recipes = category.recipes
    .map(({ recipe }) => recipe)
    .sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));

  return (
    <main className="content-page category-page" id="main-content" tabIndex={-1}>
      <nav className="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span>{category.name}</span></nav>
      <header className="listing-header">
        <span className="eyebrow">Browse the recipe box</span>
        <h1>{category.name}</h1>
        <p>{category.description || `Easy, approachable ${category.name.toLowerCase()} for your everyday table.`}</p>
      </header>
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
      ) : <p className="empty-listing">New recipes in this collection are on the way. Please check back soon.</p>}
    </main>
  );
}
