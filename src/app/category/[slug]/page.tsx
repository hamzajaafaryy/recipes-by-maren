import type { Metadata } from "next";
import Link from "next/link";
export const revalidate = 3600;

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOpenGraphImageUrl, getRecipeImageUrl } from "@/lib/recipe-media";

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
  const recipes = category.recipes.map(({ recipe }) => recipe);
  const firstImage = recipes.find((recipe) => recipe.heroPublicId)?.heroPublicId;
  const image = getOpenGraphImageUrl(firstImage);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://recipesbymaren.com";
  const canonical = `${siteUrl}/category/${category.slug}`;

  return {
    title: `${category.name} Recipes`,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${category.name} Recipes | Recipes by Maren`,
      description,
      type: "website",
      url: canonical,
      ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: `${category.name} recipes` }] } : {})
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: `${category.name} Recipes | Recipes by Maren`,
      description,
      ...(image ? { images: [image] } : {})
    }
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const recipes = category.recipes
    .map(({ recipe }) => recipe)
    .sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://recipesbymaren.com";
  const categoryUrl = `${siteUrl}/category/${category.slug}`;
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} Recipes`,
    description: category.description || `Browse ${category.name.toLowerCase()} recipes from Recipes by Maren.`,
    url: categoryUrl,
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
    <main className="content-page category-page" id="main-content" tabIndex={-1}>
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/recipes">Recipes</Link><span aria-hidden="true">/</span><span>{category.name}</span></nav>
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
      ) : <p className="empty-listing">New recipes in this collection are on the way. Please check back soon.</p>}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema).replace(/</g, "\\u003c") }} />
    </main>
  );
}
