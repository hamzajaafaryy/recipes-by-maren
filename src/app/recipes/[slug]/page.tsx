import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import RecipeJsonLd from "@/components/recipe-json-ld";
import PinterestSaveButton from "@/components/pinterest-save-button";
import RecipePrintButton from "@/components/recipe-print-button";
import { prisma } from "@/lib/prisma";
import { getOpenGraphImageUrl, getPinterestImageUrl, getRecipeImageUrl } from "@/lib/recipe-media";

export const revalidate = 3600;
type Props = { params: Promise<{ slug: string }> };
type TextItem = string | { title?: string; name?: string; text?: string; body?: string; description?: string; answer?: string; question?: string };

function textItems(value: unknown): TextItem[] {
  return Array.isArray(value) ? value.filter((item): item is TextItem =>
    typeof item === "string" || (typeof item === "object" && item !== null)
  ) : [];
}
function itemText(item: TextItem): string {
  if (typeof item === "string") return item;
  return item.text || item.body || item.description || item.name || item.title || "";
}
function itemTitle(item: TextItem): string {
  return typeof item === "string" ? "" : item.title || item.name || item.question || "";
}
function minutes(value: number | null): string | undefined {
  return value && value > 0 ? `PT${value}M` : undefined;
}

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
  } catch { return null; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await getRecipe(slug);
  if (!recipe) return { title: "Recipe not found", robots: { index: false, follow: false } };
  const title = recipe.seoTitle?.trim() || recipe.title;
  const description = recipe.seoDescription?.trim() || recipe.excerpt;
  const image = getOpenGraphImageUrl(recipe.heroPublicId);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://recipesbymaren.com";
  const canonical = recipe.canonicalUrl || `${siteUrl}/recipes/${recipe.slug}`;
  return {
    title, description, alternates: { canonical },
    openGraph: {
      type: "article", title, description, url: canonical,
      authors: [`${siteUrl}/about`],
      publishedTime: recipe.publishedAt?.toISOString(),
      modifiedTime: recipe.updatedAt.toISOString(),
      ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: recipe.heroAltText || recipe.title }] } : {})
    },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, ...(image ? { images: [image] } : {}) }
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
  const whyLove = textItems(recipe.whyLove);
  const ingredientNotes = textItems(recipe.ingredientNotes);
  const equipment = textItems(recipe.equipment);
  const expertTips = textItems(recipe.expertTips);
  const variations = textItems(recipe.variations);
  const servingSuggestions = textItems(recipe.servingSuggestions);
  const faqs = textItems(recipe.faqs);
  const related = recipe.relatedRecipeSlugs.length ? await prisma.recipe.findMany({
    where: { slug: { in: recipe.relatedRecipeSlugs }, status: "PUBLISHED", publishedAt: { not: null }, id: { not: recipe.id } },
    select: { title: true, slug: true, excerpt: true, heroPublicId: true },
    take: 4
  }).catch(() => []) : [];
  const introduction = recipe.introduction?.trim() || recipe.content?.trim();
  const canUseRecipeSchema = Boolean(recipe.publishedAt && image && ingredientLines.length && instructionLines.length);
  const breadcrumbSchema = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Recipes", item: `${siteUrl}/recipes` },
      { "@type": "ListItem", position: 3, name: recipe.title, item: pageUrl }
    ]
  };

  return (
    <main className="content-page recipe-page rich-recipe-page" id="main-content" tabIndex={-1}>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/recipes">Recipes</Link><span aria-hidden="true">/</span><span aria-current="page">{recipe.title}</span>
      </nav>
      <header className="recipe-header rich-recipe-header">
        <div className="recipe-kickers">{recipe.categories.map(({ category }) =>
          <Link className="recipe-category-link" href={`/category/${category.slug}`} key={category.slug}>{category.name}</Link>
        )}</div>
        <h1>{recipe.title}</h1>
        <p className="recipe-excerpt">{recipe.excerpt}</p>
        <div className="rich-recipe-meta">
          <span>By {recipe.author.name}</span>
          {recipe.publishedAt ? <time dateTime={recipe.publishedAt.toISOString()}>Published {recipe.publishedAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time> : null}
          {recipe.totalMinutes ? <span>{recipe.totalMinutes} minutes</span> : null}
        </div>
      </header>

      {image ? <figure className="recipe-hero-figure rich-recipe-hero">
        <Image className="recipe-hero-image" src={image} alt={recipe.heroAltText || `${recipe.title} — finished dish`} width={1600} height={900} priority unoptimized />
        {pinterestImage ? <PinterestSaveButton pageUrl={pageUrl} imageUrl={pinterestImage} description={`${recipe.title} — easy recipe from Recipes by Maren`} /> : null}
      </figure> : null}

      <div className="rich-recipe-shell">
        <article className="recipe-content rich-recipe-content">
          <nav className="recipe-jump-nav" aria-label="On this page">
            <strong>On this page</strong>
            <a href="#ingredients">Ingredients</a><a href="#instructions">Instructions</a><a href="#recipe-card">Recipe card</a>
            {faqs.length ? <a href="#faqs">FAQs</a> : null}
          </nav>

          {introduction ? <section id="introduction"><h2>About This Recipe</h2><div className="recipe-prose">{introduction}</div></section> : null}

          {whyLove.length ? <section id="why-youll-love"><h2>Why You’ll Love This Recipe</h2><ul className="rich-bullet-list">{whyLove.map((item, i) => <li key={i}>{itemTitle(item) ? <strong>{itemTitle(item)} </strong> : null}{itemText(item)}</li>)}</ul></section> : null}

          <section id="ingredients"><h2>Ingredients & Substitutions</h2>
            {recipe.ingredients.length ? <ul className="ingredient-list">{recipe.ingredients.map((item) =>
              <li key={item.id}>{item.quantity ? <strong>{item.quantity} </strong> : null}{item.item}</li>
            )}</ul> : <p>Ingredients for this recipe are being added.</p>}
            {ingredientNotes.length ? <div className="recipe-note-list">{ingredientNotes.map((item, i) => <p key={i}>{itemTitle(item) ? <strong>{itemTitle(item)}: </strong> : null}{itemText(item)}</p>)}</div> : null}
          </section>

          {equipment.length ? <section id="equipment"><h2>Equipment Needed</h2><ul className="rich-bullet-list">{equipment.map((item, i) => <li key={i}>{itemText(item)}</li>)}</ul></section> : null}

          <section id="instructions"><h2>How to Make It</h2>
            {recipe.instructions.length ? <ol className="instruction-list">{recipe.instructions.map((step, index) => {
              const stepImage = getRecipeImageUrl(step.imagePublicId, 1000);
              return <li key={step.id}>
                <span className="instruction-number">{index + 1}</span>
                <div>{step.title ? <h3>{step.title}</h3> : null}<p>{step.body}</p>
                  {stepImage ? <Image className="recipe-step-image" src={stepImage} alt={step.title || `${recipe.title}, step ${index + 1}`} width={1000} height={650} unoptimized /> : null}
                </div>
              </li>;
            })}</ol> : <p>Step-by-step instructions are being added.</p>}
          </section>

          {expertTips.length ? <section id="expert-tips"><h2>Tips for the Best Results</h2><ul className="rich-bullet-list">{expertTips.map((item, i) => <li key={i}>{itemTitle(item) ? <strong>{itemTitle(item)} </strong> : null}{itemText(item)}</li>)}</ul></section> : null}
          {variations.length ? <section id="variations"><h2>Easy Variations</h2><ul className="rich-bullet-list">{variations.map((item, i) => <li key={i}>{itemTitle(item) ? <strong>{itemTitle(item)} </strong> : null}{itemText(item)}</li>)}</ul></section> : null}
          {recipe.storageReheating ? <section id="storage"><h2>Storage & Reheating</h2><div className="recipe-prose">{recipe.storageReheating}</div></section> : null}
          {servingSuggestions.length ? <section id="serving"><h2>What to Serve With It</h2><ul className="rich-bullet-list">{servingSuggestions.map((item, i) => <li key={i}>{itemText(item)}</li>)}</ul></section> : null}
          {recipe.authorNotes ? <section id="author-notes"><h2>A Note from Maren</h2><div className="recipe-prose">{recipe.authorNotes}</div></section> : null}
          {faqs.length ? <section id="faqs" className="recipe-faqs"><h2>Frequently Asked Questions</h2>{faqs.map((item, i) =>
            <details key={i}><summary>{itemTitle(item) || `Question ${i + 1}`}</summary><p>{itemText(item) || (typeof item === "object" ? item.answer || "" : "")}</p></details>
          )}</section> : null}

          <section id="recipe-card" className="print-recipe-card">
            <div className="print-card-heading"><div><span className="eyebrow">Cook along</span><h2>{recipe.title}</h2><p>{recipe.excerpt}</p></div><RecipePrintButton /></div>
            <div className="print-card-facts">
              {recipe.prepMinutes ? <span><small>PREP</small><strong>{recipe.prepMinutes} min</strong></span> : null}
              {recipe.cookMinutes ? <span><small>COOK</small><strong>{recipe.cookMinutes} min</strong></span> : null}
              {recipe.totalMinutes ? <span><small>TOTAL</small><strong>{recipe.totalMinutes} min</strong></span> : null}
              <span><small>SERVINGS</small><strong>{recipe.servings}</strong></span>
              {recipe.recipeTemperature ? <span><small>TEMPERATURE</small><strong>{recipe.recipeTemperature}</strong></span> : null}
            </div>
            <h3>Ingredients</h3>
            <ul className="recipe-card-ingredients">{recipe.ingredients.map((item) => <li key={item.id}>{item.quantity ? `${item.quantity} ` : ""}{item.item}</li>)}</ul>
            <h3>Instructions</h3>
            <ol className="recipe-card-instructions">{recipe.instructions.map((step) => <li key={step.id}>{step.title ? <strong>{step.title}: </strong> : null}{step.body}</li>)}</ol>
          </section>
        </article>

        <aside className="recipe-facts rich-recipe-sidebar" aria-label="Recipe details">
          <h2>Recipe at a glance</h2>
          {recipe.prepMinutes ? <p><span>Prep time</span><strong>{recipe.prepMinutes} min</strong></p> : null}
          {recipe.cookMinutes ? <p><span>Cook time</span><strong>{recipe.cookMinutes} min</strong></p> : null}
          {recipe.totalMinutes ? <p><span>Total time</span><strong>{recipe.totalMinutes} min</strong></p> : null}
          <p><span>Servings</span><strong>{recipe.servings}</strong></p>
          {recipe.difficulty ? <p><span>Difficulty</span><strong>{recipe.difficulty}</strong></p> : null}
          <a className="recipe-sidebar-print" href="#recipe-card">Jump to recipe ↓</a>
        </aside>
      </div>

      {related.length ? <section className="related-recipes-section"><div className="related-recipes-inner">
        <span className="eyebrow">Keep cooking</span><h2>You Might Also Like</h2>
        <div className="related-recipe-grid">{related.map((item) => {
          const relatedImage = getRecipeImageUrl(item.heroPublicId, 700);
          return <article className="related-recipe-card" key={item.slug}>
            <Link href={`/recipes/${item.slug}`} className="related-recipe-image">
              {relatedImage ? <Image src={relatedImage} alt={item.title} width={700} height={520} unoptimized /> : <span className="maren-image-placeholder" />}
            </Link>
            <div><h3><Link href={`/recipes/${item.slug}`}>{item.title}</Link></h3><p>{item.excerpt}</p></div>
          </article>;
        })}</div>
      </div></section> : null}

      {canUseRecipeSchema ? <RecipeJsonLd
        title={recipe.title} description={recipe.excerpt} imageUrls={[image!]}
        datePublished={recipe.publishedAt!.toISOString()} dateModified={recipe.updatedAt.toISOString()}
        authorName={recipe.author.name} recipeCategories={categoryNames} recipeUrl={pageUrl}
        prepMinutes={recipe.prepMinutes ?? undefined} cookMinutes={recipe.cookMinutes ?? undefined}
        totalMinutes={recipe.totalMinutes ?? undefined} servings={recipe.servings}
        ingredients={ingredientLines} instructions={instructionLines}
      /> : null}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }} />
    </main>
  );
}
