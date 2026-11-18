import type { Metadata } from "next";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getRecipeImageUrl } from "@/lib/recipe-media";

export const metadata: Metadata = {
  title: "Easy Dinner Ideas, Cozy Bakes & Everyday Recipes",
  description:
    "Find approachable dinner ideas, comforting one-pot meals, fresh seasonal inspiration, and simple bakes for everyday home cooking.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Recipes by Maren — Real Food for Real Life",
    description: "Approachable dinner ideas, cozy bakes, and simple recipes for everyday home cooking.",
    type: "website"
  }
};

const categoryImages: Record<string, string> = {
  "weeknight-dinners": "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=80",
  "one-pot-meals": "https://images.unsplash.com/photo-1476124369491-e7da6fcca9a8?auto=format&fit=crop&w=700&q=80",
  "air-fryer": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=700&q=80",
  "budget-friendly": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=80",
  "desserts-baking": "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=700&q=80"
};

async function getHomeContent() {
  try {
    const [categories, recipes] = await Promise.all([
      prisma.category.findMany({
        include: {
          recipes: {
            where: { recipe: { status: "PUBLISHED", publishedAt: { not: null } } },
            select: { recipeId: true }
          }
        },
        orderBy: { name: "asc" }
      }),
      prisma.recipe.findMany({
        where: { status: "PUBLISHED", publishedAt: { not: null } },
        orderBy: { publishedAt: "desc" },
        take: 3,
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://recipesbymaren.com";
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Recipes by Maren",
    url: siteUrl,
    description: "Real food. Simple recipes. Made with care."
  };

  return (
    <main className="site-shell" id="main-content" tabIndex={-1}>
      <section className="hero" aria-labelledby="home-heading">
        <div className="hero-copy">
          <span className="eyebrow">Welcome to my kitchen</span>
          <h1 id="home-heading">Good food for <em>real life.</em></h1>
          <p className="hero-description">
            Simple, feel-good recipes made for the moments that matter — from quick weeknight dinners to something sweet just because.
          </p>
          <div className="hero-actions">
            <a className="button-primary" href="#latest">Explore recipes</a>
            <a className="text-link" href="/about">A note from Maren</a>
          </div>
        </div>
        <div className="hero-image" role="img" aria-label="A colorful table of fresh, homemade food">
          <div className="hero-note">
            <strong>Made for sharing.</strong>
            <span>Simple ingredients · Happy tables</span>
          </div>
        </div>
      </section>

      <section className="section" id="categories" aria-labelledby="categories-heading">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Find your next favorite</span>
            <h2 id="categories-heading">What sounds good today?</h2>
          </div>
          <p>A little something for every kind of craving.</p>
        </div>
        {categories.length ? (
          <div className="category-grid">
            {categories.map((category) => (
              <a className="category-card" href={`/category/${category.slug}`} key={category.id}>
                <div className="category-photo-wrap">
                  <div
                    className="category-photo"
                    role="img"
                    aria-label={category.name}
                    style={categoryImages[category.slug] ? { backgroundImage: `url("${categoryImages[category.slug]}")` } : undefined}
                  />
                </div>
                <h3>{category.name}</h3>
                <span>{category.recipes.length} {category.recipes.length === 1 ? "recipe" : "recipes"}</span>
              </a>
            ))}
          </div>
        ) : (
          <p className="empty-home-state">Recipe collections will appear here as soon as the first recipes are published.</p>
        )}
      </section>

      <section className="featured-section" id="latest" aria-labelledby="latest-heading">
        <div className="section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">From the recipe box</span>
              <h2 id="latest-heading">The latest recipes</h2>
            </div>
            <a className="text-link" href="/search">Search the recipe box</a>
          </div>
          {recipes.length ? (
            <div className="recipe-grid">
              {recipes.map((recipe) => {
                const image = getRecipeImageUrl(recipe.heroPublicId, 900);
                const category = recipe.categories[0]?.category.name || "From the kitchen";
                return (
                  <article className="recipe-card" key={recipe.id}>
                    <a href={`/recipes/${recipe.slug}`} className="recipe-card-link" aria-label={`Read ${recipe.title}`}>
                      {image ? (
                        <div className="recipe-photo" role="img" aria-label={recipe.title} style={{ backgroundImage: `url("${image}")` }} />
                      ) : (
                        <div className="recipe-photo recipe-photo-empty" aria-hidden="true" />
                      )}
                    </a>
                    <div className="recipe-info">
                      <span className="recipe-meta">{category}</span>
                      <h3><a href={`/recipes/${recipe.slug}`}>{recipe.title}</a></h3>
                      <p>{recipe.excerpt}</p>
                      {recipe.totalMinutes ? <span className="recipe-time">{recipe.totalMinutes} minutes</span> : null}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="empty-home-state">New recipes are being prepared. Check back soon for the first collection.</p>
          )}
        </div>
      </section>

      <section className="section about-strip" id="about" aria-labelledby="about-heading">
        <div className="about-photo" role="img" aria-label="A warm, light-filled home kitchen" />
        <div className="about-copy">
          <span className="eyebrow">A seat at my table</span>
          <h2 id="about-heading">Cooking should feel like coming home.</h2>
          <p>
            Around here, good food does not need to be complicated. This is a place for dependable favorites, fresh inspiration, and recipes that make everyday cooking feel a little more special.
          </p>
          <a className="text-link" href="/about">Get to know this kitchen</a>
        </div>
      </section>

      <section className="newsletter" id="newsletter" aria-labelledby="newsletter-heading">
        <span className="eyebrow">A good thing in your inbox</span>
        <h2 id="newsletter-heading">Let’s make something lovely.</h2>
        <p>Our newsletter sign-up is being prepared. In the meantime, explore the recipe collection and find a new favorite.</p>
        <a className="button-primary newsletter-link" href="/search">Find a recipe</a>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema).replace(/</g, "\\u003c") }} />
    </main>
  );
}
