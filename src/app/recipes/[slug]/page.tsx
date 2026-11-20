import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
export const revalidate = 3600;

import { notFound } from "next/navigation";
import RecipeJsonLd from "@/components/recipe-json-ld";
import PinterestSaveButton from "@/components/pinterest-save-button";
import RecipeCard from "@/components/recipe-card";
import { prisma } from "@/lib/prisma";
import { getOpenGraphImageUrl, getPinterestImageUrl, getRecipeImageUrl } from "@/lib/recipe-media";

type Props = { params: Promise<{ slug: string }> };

async function getRecipe(slug: string) {
  try {
    return await prisma.recipe.findFirst({
      where: { slug, status: "PUBLISHED", publishedAt: { not: null } },
      include: {
        author: { select: { name: true } },
        ingredients: { orderBy: { sortOrder: "asc" } },
        instructions: { orderBy: { sortOrder: "asc" } },
        categories: { include: { category: { select: { name: true, slug: true } } } }
      }
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await getRecipe(slug);
  if (!recipe) return { title: "Recipe not found", robots: { index: false, follow: false } };

  const title = recipe.seoTitle?.trim() || recipe.title;
  const description = recipe.seoDescription?.trim() || recipe.excerpt;
  const image = getOpenGraphImageUrl(recipe.heroPublicId) || "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&h=630&q=85";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://recipesbymaren.com";
  const canonical = recipe.canonicalUrl || `${siteUrl}/recipes/${recipe.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article", title, description, url: canonical,
      authors: [`${siteUrl}/about`],
      publishedTime: recipe.publishedAt?.toISOString(),
      modifiedTime: recipe.updatedAt.toISOString(),
      ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: `${recipe.title} recipe` }] } : {})
    },
    twitter: {
      card: image ? "summary_large_image" : "summary", title, description,
      ...(image ? { images: [image] } : {})
    }
  };
}

export default async function RecipePage({ params }: Props) {
  const { slug } = await params;
  const recipe = await getRecipe(slug);
  if (!recipe) notFound();

  const image = getRecipeImageUrl(recipe.heroPublicId, 1600);
  const pinterestImage = getPinterestImageUrl(recipe.heroPublicId);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://recipesbymaren.com";
  const pageUrl = `${siteUrl}/recipes/${recipe.slug}`;
  const ingredientLines = recipe.ingredients.map((item) => [item.quantity, item.item].filter(Boolean).join(" "));
  const instructionLines = recipe.instructions.map((step) => step.body);
  const categoryNames = recipe.categories.map(({ category }) => category.name);
  const canUseRecipeSchema = Boolean(recipe.publishedAt && image && ingredientLines.length > 0 && instructionLines.length > 0);
  const breadcrumbSchema = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "All Recipes", item: `${siteUrl}/recipes` },
      { "@type": "ListItem", position: 3, name: recipe.title, item: pageUrl }
    ]
  };

  return (
    <main className="content-page recipe-page" id="main-content" tabIndex={-1}>
      <div className="recipe-page-inner">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/recipes">Recipes</Link><span aria-hidden="true">/</span><span>{recipe.title}</span>
        </nav>

        <header className="recipe-header">
          <div className="recipe-kickers">
            {recipe.categories.map(({ category }) => (
              <Link className="recipe-category-link" href={`/category/${category.slug}`} key={category.slug}>{category.name}</Link>
            ))}
          </div>
          <h1>{recipe.title}</h1>
          <p className="recipe-excerpt">{recipe.excerpt}</p>
          <p className="recipe-byline">
            By {recipe.author.name}
            {recipe.publishedAt ? <> · Published <time dateTime={recipe.publishedAt.toISOString()}>{recipe.publishedAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time></> : null}
          </p>
          <div className="recipe-header-actions">
            <a className="recipe-jump-button" href="#recipe-card">Jump to Recipe ↓</a>
            <a className="recipe-outline-button" href="#recipe-card" onClick={() => {}}>View Recipe Card</a>
          </div>
        </header>

        {image ? (
          <figure className="recipe-hero-figure">
            <Image className="recipe-hero-image" src={image} alt={`${recipe.title} — finished dish`} width={1600} height={900} priority unoptimized />
            {pinterestImage ? <PinterestSaveButton pageUrl={pageUrl} imageUrl={pinterestImage} description={`${recipe.title} — easy recipe from Recipes by Maren`} /> : null}
          </figure>
        ) : null}

        <div className="recipe-layout">
          <article className="recipe-content">
            <section className="recipe-story" aria-labelledby="about-recipe-heading">
              <span className="recipe-section-kicker">A LITTLE ABOUT THIS RECIPE</span>
              <h2 id="about-recipe-heading">Let’s make {recipe.title.toLowerCase()}</h2>
              <div className="recipe-intro">
                {recipe.content ? recipe.content.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>) : <p>{recipe.excerpt}</p>}
              </div>
            </section>

            <div className="recipe-quick-facts">
              {recipe.prepMinutes !== null && <div><span>Prep time</span><strong>{recipe.prepMinutes} min</strong></div>}
              {recipe.cookMinutes !== null && <div><span>Cook time</span><strong>{recipe.cookMinutes} min</strong></div>}
              {recipe.totalMinutes !== null && <div><span>Total time</span><strong>{recipe.totalMinutes} min</strong></div>}
              <div><span>Servings</span><strong>{recipe.servings}</strong></div>
              {recipe.difficulty && <div><span>Difficulty</span><strong>{recipe.difficulty}</strong></div>}
            </div>

            <section className="recipe-method" aria-labelledby="method-heading">
              <span className="recipe-section-kicker">STEP BY STEP</span>
              <h2 id="method-heading">How to make {recipe.title.toLowerCase()}</h2>
              <p className="recipe-section-lead">Follow these steps in order, and use the printable recipe card below to keep the ingredients and method handy while you cook.</p>
              {recipe.instructions.length ? (
                <ol className="instruction-list">
                  {recipe.instructions.map((step, index) => (
                    <li key={step.id}><span className="instruction-number">{index + 1}</span><div>{step.title ? <h3>{step.title}</h3> : null}<p>{step.body}</p></div></li>
                  ))}
                </ol>
              ) : <p>Step-by-step instructions are being added.</p>}
            </section>

            <section className="recipe-ingredients-preview" aria-labelledby="ingredients-preview-heading">
              <span className="recipe-section-kicker">WHAT YOU’LL NEED</span>
              <h2 id="ingredients-preview-heading">Ingredients for this recipe</h2>
              <p className="recipe-section-lead">Gather and measure everything before you begin. You can check items off and adjust the serving size in the recipe card.</p>
              {recipe.ingredients.length ? (
                <ul className="ingredient-list">
                  {recipe.ingredients.map((item) => <li key={item.id}>{item.section ? <span className="ingredient-section-label">{item.section}: </span> : null}{item.quantity ? <strong>{item.quantity} </strong> : null}{item.item}</li>)}
                </ul>
              ) : <p>Ingredients for this recipe are being added.</p>}
            </section>
          </article>

          <aside className="recipe-sidebar" aria-label="Recipe guide">
            <div className="recipe-sidebar-card">
              <span className="recipe-section-kicker">COOK WITH CONFIDENCE</span>
              <h2>Your recipe at a glance</h2>
              <p>Keep the timing and serving details close as you prepare this dish.</p>
              {recipe.prepMinutes !== null && <div><span>Prep</span><strong>{recipe.prepMinutes} minutes</strong></div>}
              {recipe.cookMinutes !== null && <div><span>Cook</span><strong>{recipe.cookMinutes} minutes</strong></div>}
              {recipe.totalMinutes !== null && <div><span>Total</span><strong>{recipe.totalMinutes} minutes</strong></div>}
              <div><span>Servings</span><strong>{recipe.servings}</strong></div>
              {recipe.difficulty && <div><span>Difficulty</span><strong>{recipe.difficulty}</strong></div>}
              <a href="#recipe-card">Go to printable recipe ↓</a>
            </div>
          </aside>
        </div>

        <section className="recipe-card-section" aria-label="Printable recipe and sharing">
          <div className="recipe-card-section-heading">
            <span className="recipe-section-kicker">SAVE IT FOR LATER</span>
            <h2>Make it, save it, share it.</h2>
            <p>Print a kitchen-friendly copy or share this recipe with someone who would love it.</p>
          </div>
          <RecipeCard
            title={recipe.title}
            description={recipe.excerpt}
            pageUrl={pageUrl}
            imageUrl={pinterestImage}
            prepMinutes={recipe.prepMinutes}
            cookMinutes={recipe.cookMinutes}
            totalMinutes={recipe.totalMinutes}
            servings={recipe.servings}
            difficulty={recipe.difficulty}
            ingredients={recipe.ingredients.map(item => ({ id: item.id, section: item.section, quantity: item.quantity, item: item.item }))}
            instructions={recipe.instructions.map(step => ({ id: step.id, title: step.title, body: step.body }))}
          />
        </section>

        {canUseRecipeSchema ? (
          <RecipeJsonLd
            title={recipe.title} description={recipe.excerpt} imageUrls={[image!]}
            datePublished={recipe.publishedAt!.toISOString()} dateModified={recipe.updatedAt.toISOString()}
            authorName={recipe.author.name} recipeCategories={categoryNames} recipeUrl={pageUrl}
            prepMinutes={recipe.prepMinutes ?? undefined} cookMinutes={recipe.cookMinutes ?? undefined}
            totalMinutes={recipe.totalMinutes ?? undefined} servings={recipe.servings}
            ingredients={ingredientLines} instructions={instructionLines}
          />
        ) : null}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }} />
      </div>
    </main>
  );
}
