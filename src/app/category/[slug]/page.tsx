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
  const fullDescription = category.description?.trim() || `Browse ${category.name.toLowerCase()} recipes from Recipes by Maren. Find approachable ideas for everyday home cooking.`;
  const description = fullDescription.length > 160 ? `${fullDescription.slice(0, 157).trimEnd()}...` : fullDescription;
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
      images: [{
        url: image || "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&h=630&q=85",
        width: 1200,
        height: 630,
        alt: `${category.name} recipes`
      }]
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.name} Recipes | Recipes by Maren`,
      description,
      images: [image || "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&h=630&q=85"]
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
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "All Recipes", item: `${siteUrl}/recipes` },
      { "@type": "ListItem", position: 3, name: category.name, item: categoryUrl }
    ]
  };
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} Recipes`,
    description: category.description || `Browse ${category.name.toLowerCase()} recipes from Recipes by Maren.`,
    url: categoryUrl,
    ...(recipes.find((recipe) => recipe.heroPublicId)?.heroPublicId ? {
      image: getOpenGraphImageUrl(recipes.find((recipe) => recipe.heroPublicId)!.heroPublicId) || undefined
    } : {}),
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
    <main className="maren-category-page" id="main-content" tabIndex={-1}>
      <div className="maren-category-inner">
      <nav className="maren-category-breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/recipes">Recipes</Link><span aria-hidden="true">/</span><span>{category.name}</span></nav>
      <header className="maren-category-heading">
        <span className="maren-eyebrow">THE RECIPE COLLECTION</span>
        <h1>{category.name}<em> recipes.</em></h1>
        <p>{category.description || `Easy, approachable ${category.name.toLowerCase()} for your everyday table.`}</p>
        <div className="maren-category-count">{recipes.length} {recipes.length === 1 ? "recipe" : "recipes"} in this collection</div>
      </header>
      {recipes.length ? (
        <div className="maren-category-grid">
          {recipes.map((recipe) => {
            const image = getRecipeImageUrl(recipe.heroPublicId, 800);
            return (
              <article className="maren-category-recipe-card" key={recipe.id}>
                <Link className="maren-category-recipe-image" href={`/recipes/${recipe.slug}`} aria-label={`Read ${recipe.title}`}>
                  {image ? <div className="maren-category-image-fill" role="img" aria-label={recipe.title} style={{ backgroundImage: `url("${image}")` }} /> : <div className="maren-category-image-fill is-empty" aria-hidden="true" />}
                </Link>
                <div className="maren-category-recipe-copy">
                  <h2><Link href={`/recipes/${recipe.slug}`}>{recipe.title}</Link></h2>
                  <p>{recipe.excerpt}</p>
                  <div className="maren-category-card-footer"><span>{recipe.totalMinutes ? `◷ ${recipe.totalMinutes} min` : "FROM THE KITCHEN"}</span><Link href={`/recipes/${recipe.slug}`}>View recipe <span aria-hidden="true">→</span></Link></div>
                </div>
              </article>
            );
          })}
        </div>
      ) : <p className="maren-category-empty">New recipes in this collection are on the way. Please check back soon.</p>}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }} />
    </main>
  );
}
