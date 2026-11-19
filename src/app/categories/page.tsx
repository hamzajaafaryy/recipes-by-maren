import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://recipesbymaren.com";
const categoryImages: Record<string, string> = {
  "dinner-recipes": "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=82",
  "chicken-recipes": "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=82",
  "breakfast-recipes": "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=82",
  "lunch-recipes": "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=82",
  "pasta-recipes": "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=82",
  "healthy-recipes": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=82",
  "slow-cooker-recipes": "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=82",
  "soups-stews": "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=82",
  "salad-recipes": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=82",
  "appetizers-snacks": "https://images.unsplash.com/photo-1541014741259-de529411b96a?auto=format&fit=crop&w=900&q=82",
  "weeknight-dinners": "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=82",
  "one-pot-meals": "https://images.unsplash.com/photo-1476124369491-e7da6fcca9a8?auto=format&fit=crop&w=900&q=82",
  "air-fryer": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=82",
  "budget-friendly": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=82",
  "desserts-baking": "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=82"
};

export const metadata: Metadata = {
  title: "Browse Easy Recipe Categories | Dinner, Chicken, Breakfast & More",
  description: "Find your next meal with easy recipe collections for chicken, dinner, breakfast, pasta, healthy meals, air fryer cooking, soups, salads, and homemade desserts.",
  alternates: { canonical: "/categories" },
  openGraph: {
    title: "Browse Recipe Categories | Recipes by Maren",
    description: "Find your next favorite meal with easy-to-browse recipe collections for everyday cooking.",
    url: `${siteUrl}/categories`,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse Recipe Categories | Recipes by Maren",
    description: "Explore easy dinners, one-pot meals, air fryer recipes, budget-friendly cooking, and homemade baking."
  }
};

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { recipes: { some: { recipe: { status: "PUBLISHED", publishedAt: { not: null } } } } },
    orderBy: { name: "asc" },
    select: {
      id: true, name: true, slug: true, description: true,
      _count: { select: { recipes: { where: { recipe: { status: "PUBLISHED", publishedAt: { not: null } } } } } }
    }
  }).catch(() => []);

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Recipe Categories",
    description: "Browse easy recipes by cooking style, meal type, and budget.",
    url: `${siteUrl}/categories`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: categories.map((category, index) => ({
        "@type": "ListItem", position: index + 1,
        name: category.name, url: `${siteUrl}/category/${category.slug}`
      }))
    }
  };

  return (
    <main className="maren-categories-page" id="main-content" tabIndex={-1}>
      <div className="maren-categories-inner">
        <nav className="maren-categories-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">/</span><span>Categories</span>
        </nav>
        <header className="maren-categories-hero">
          <span className="maren-eyebrow">FIND YOUR NEXT FAVORITE</span>
          <h1>Browse by <em>category.</em></h1>
          <p>Not sure what to cook? Start with the kind of meal you’re craving. Explore practical recipe collections made for busy weeknights, relaxed weekends, and everything in between.</p>
        </header>
        {categories.length ? (
          <section className="maren-categories-grid" aria-label="Recipe collections">
            {categories.map((category, index) => (
              <article className="maren-category-directory-card" key={category.id}>
                <Link className="maren-category-directory-image" href={`/category/${category.slug}`} aria-label={`Explore ${category.name} recipes`}>
                  {categoryImages[category.slug] ? <Image src={categoryImages[category.slug]} alt={`${category.name} recipe collection`} fill unoptimized sizes="(max-width: 650px) 100vw, (max-width: 1000px) 50vw, 33vw" /> : <span className="maren-image-placeholder" />}
                  <span className="maren-category-directory-number">{String(index + 1).padStart(2, "0")}</span>
                </Link>
                <div className="maren-category-directory-copy">
                  <div className="maren-category-directory-meta"><span>RECIPE COLLECTION</span><span>{category._count.recipes} {category._count.recipes === 1 ? "recipe" : "recipes"}</span></div>
                  <h2><Link href={`/category/${category.slug}`}>{category.name}</Link></h2>
                  <p>{category.description || `Explore easy ${category.name.toLowerCase()} recipes for everyday home cooking.`}</p>
                  <Link className="maren-category-directory-link" href={`/category/${category.slug}`}>Explore collection <span aria-hidden="true">→</span></Link>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="maren-categories-empty"><h2>New recipe collections are coming soon.</h2><p>Check back as more recipes are added to the kitchen.</p><Link href="/recipes">Browse all recipes →</Link></div>
        )}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    </main>
  );
}
