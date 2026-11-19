import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getRecipeImageUrl } from "@/lib/recipe-media";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://recipesbymaren.com";
const fallbackPhoto = "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1500&q=88";

export const metadata: Metadata = {
  title: "Easy Dinner Ideas, Cozy Bakes & Everyday Recipes",
  description: "Find dependable weeknight dinners, comforting one-pot meals, fresh seasonal inspiration, and simple bakes for everyday home cooking.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Recipes by Maren — Real Food for Real Life",
    description: "Dependable dinners, cozy bakes, and simple recipes for everyday home cooking.",
    type: "website",
    images: [{ url: fallbackPhoto, width: 1200, height: 630, alt: "A colorful spread of homemade food" }]
  },
  twitter: { card: "summary_large_image", title: "Recipes by Maren — Real Food for Real Life", description: "Dependable dinners, cozy bakes, and simple recipes for everyday home cooking.", images: [fallbackPhoto] }
};

const categoryImages: Record<string, string> = {
  "dinner-recipes": "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=82",
  "chicken-recipes": "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=700&q=82",
  "breakfast-recipes": "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=700&q=82",
  "healthy-recipes": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=82",
  "pasta-recipes": "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=700&q=82",
  "air-fryer": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=700&q=82",
  "weeknight-dinners": "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=82",
  "one-pot-meals": "https://images.unsplash.com/photo-1476124369491-e7da6fcca9a8?auto=format&fit=crop&w=700&q=82",
  "budget-friendly": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=82",
  "desserts-baking": "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=700&q=82"
};
const categoryPriority = ["dinner-recipes", "chicken-recipes", "healthy-recipes", "air-fryer", "pasta-recipes", "breakfast-recipes", "weeknight-dinners", "one-pot-meals", "desserts-baking", "budget-friendly"];

async function getHomeContent() {
  try {
    const [categories, recipes] = await Promise.all([
      prisma.category.findMany({
        where: { recipes: { some: { recipe: { status: "PUBLISHED", publishedAt: { not: null } } } } },
        include: { recipes: { where: { recipe: { status: "PUBLISHED", publishedAt: { not: null } } }, select: { recipeId: true } } }
      }),
      prisma.recipe.findMany({
        where: { status: "PUBLISHED", publishedAt: { not: null } },
        orderBy: { publishedAt: "desc" },
        take: 6,
        select: {
          id: true, title: true, slug: true, excerpt: true, heroPublicId: true, totalMinutes: true,
          categories: { include: { category: { select: { name: true } } } }
        }
      })
    ]);
    return { categories, recipes };
  } catch {
    return { categories: [], recipes: [] };
  }
}

export default async function HomePage() {
  const { categories, recipes } = await getHomeContent();
  const featured = recipes[0];
  const orderedCategories = [...categories].sort((a, b) => {
    const aIndex = categoryPriority.indexOf(a.slug);
    const bIndex = categoryPriority.indexOf(b.slug);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex) || a.name.localeCompare(b.name);
  });
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Recipes by Maren",
    url: siteUrl,
    description: "Real food. Simple recipes. Made with care.",
    potentialAction: { "@type": "SearchAction", target: `${siteUrl}/search?q={search_term_string}`, "query-input": "required name=search_term_string" }
  };

  return (
    <main className="maren-home" id="main-content" tabIndex={-1}>
      <section className="maren-hero" aria-labelledby="home-heading">
        <div className="maren-hero-copy">
          <span className="maren-eyebrow"><span /> GOOD FOOD, MADE SIMPLE</span>
          <h1 id="home-heading">Your next favorite<br /><em>starts here.</em></h1>
          <p>Fresh inspiration for real-life cooking. Discover easy dinners, feel-good favorites, and little treats worth sharing.</p>
          <form className="maren-search" action="/search" method="get" role="search">
            <label className="sr-only" htmlFor="home-recipe-search">Search recipes or ingredients</label>
            <span aria-hidden="true">⌕</span>
            <input id="home-recipe-search" name="q" type="search" placeholder="Search recipes or ingredients..." maxLength={80} />
            <button type="submit">Search <span aria-hidden="true">→</span></button>
          </form>
          <div className="maren-hero-links">
            <span>POPULAR RIGHT NOW</span>
            <Link href="/category/dinner-recipes">Easy dinners</Link>
            <Link href="/category/chicken-recipes">Chicken recipes</Link>
            <Link href="/category/air-fryer">Air fryer</Link>
          </div>
        </div>
        <div className="maren-hero-visual">
          <Image src={fallbackPhoto} alt="A colorful table filled with fresh, homemade food" fill priority unoptimized sizes="(max-width: 800px) 100vw, 54vw" />
          <div className="maren-hero-stamp"><span>GOOD FOOD</span><strong>made<br />simple</strong><span>EVERY DAY</span></div>
          <div className="maren-hero-caption">A fresh take on everyday favorites</div>
        </div>
      </section>

      <section className="maren-category-section" id="categories" aria-labelledby="category-heading">
        <div className="maren-section-top">
          <div><span className="maren-eyebrow"><span /> FIND YOUR CRAVING</span><h2 id="category-heading">What sounds good?</h2><p>Browse the collections and find something delicious to make.</p></div>
          <Link className="maren-arrow-link" href="/categories">Explore all categories <span>↗</span></Link>
        </div>
        {categories.length ? (
          <div className="maren-category-grid">
            {orderedCategories.slice(0, 6).map((category) => (
              <Link className="maren-category-card" href={`/category/${category.slug}`} key={category.id}>
                <div className="maren-category-image">
                  {categoryImages[category.slug] ? <Image src={categoryImages[category.slug]} alt="" fill unoptimized sizes="(max-width: 600px) 50vw, 20vw" /> : <div className="maren-category-placeholder" />}
                  <span className="maren-category-count">{category.recipes.length} {category.recipes.length === 1 ? "recipe" : "recipes"}</span>
                </div>
                <span className="maren-category-name">{category.name}</span>
                <span className="maren-category-description">{category.description || `Explore ${category.name.toLowerCase()} recipes for everyday cooking.`}</span>
                <span className="maren-category-arrow" aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        ) : <p className="maren-empty">Your recipe collections will appear here as soon as recipes are published.</p>}
      </section>

      <section className="maren-latest-section" id="latest" aria-labelledby="latest-heading">
        <div className="maren-section-top">
          <div><span className="maren-eyebrow"><span /> FRESH FROM THE KITCHEN</span><h2 id="latest-heading">The latest recipes</h2><p>Simple, satisfying ideas for whatever the day brings.</p></div>
          <Link className="maren-arrow-link" href="/recipes">View all recipes <span>↗</span></Link>
        </div>
        {recipes.length ? (
          <div className="maren-recipe-grid">
            {recipes.map((recipe, index) => {
              const image = getRecipeImageUrl(recipe.heroPublicId, 900);
              const category = recipe.categories[0]?.category.name || "Everyday favorite";
              return (
                <article className={`maren-recipe-card ${index === 0 ? "maren-recipe-card-featured" : ""}`} key={recipe.id}>
                  <Link className="maren-recipe-image" href={`/recipes/${recipe.slug}`} aria-label={`Read ${recipe.title}`}>
                    {image ? <Image src={image} alt={recipe.title} fill unoptimized sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 33vw" /> : <span className="maren-image-placeholder" />}
                    <span className="maren-card-open" aria-hidden="true">↗</span>
                  </Link>
                  <div className="maren-recipe-details">
                    <span className="maren-card-category">{category}</span>
                    <h3><Link href={`/recipes/${recipe.slug}`}>{recipe.title}</Link></h3>
                    <p>{recipe.excerpt}</p>
                    <div className="maren-card-footer">{recipe.totalMinutes ? <span>◷ {recipe.totalMinutes} min</span> : <span>MADE FOR EVERYDAY</span>}<Link href={`/recipes/${recipe.slug}`}>Get the recipe <span>→</span></Link></div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : <p className="maren-empty">New recipes are on the way. Check back soon for fresh inspiration.</p>}
      </section>

      {featured ? (
        <section className="maren-feature-band" aria-label="Featured recipe">
          <div className="maren-feature-photo">
            {getRecipeImageUrl(featured.heroPublicId, 1200) ? <Image src={getRecipeImageUrl(featured.heroPublicId, 1200)!} alt={featured.title} fill unoptimized sizes="(max-width: 800px) 100vw, 50vw" /> : null}
          </div>
          <div className="maren-feature-copy"><span className="maren-eyebrow"><span /> EDITOR&apos;S PICK</span><h2>{featured.title}</h2><p>{featured.excerpt}</p><Link className="maren-solid-link" href={`/recipes/${featured.slug}`}>Make this recipe <span>→</span></Link></div>
        </section>
      ) : null}

      <section className="maren-about-band">
        <div><span className="maren-eyebrow"><span /> WELCOME TO MY KITCHEN</span><h2>Everyday food,<br /><em>made to enjoy.</em></h2></div>
        <p>A welcoming place for dependable favorites, fresh inspiration, and recipes that make everyday cooking feel a little easier and a lot more delicious.</p>
        <Link href="/about" className="maren-arrow-link">Meet Maren <span>↗</span></Link>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema).replace(/</g, "\\u003c") }} />
    </main>
  );
}
