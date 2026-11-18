import type { Metadata } from "next";
export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import RecipeJsonLd from "@/components/recipe-json-ld";
import { prisma } from "@/lib/prisma";
import { getRecipeImageUrl } from "@/lib/recipe-media";

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
  const image = getRecipeImageUrl(recipe.heroPublicId, 1200);

  return {
    title,
    description,
    alternates: { canonical: recipe.canonicalUrl || `/recipes/${recipe.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/recipes/${recipe.slug}`,
      ...(image ? { images: [{ url: image, alt: recipe.title }] } : {})
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {})
    }
  };
}

export default async function RecipePage({ params }: Props) {
  const { slug } = await params;
  const recipe = await getRecipe(slug);
  if (!recipe) notFound();

  const image = getRecipeImageUrl(recipe.heroPublicId, 1600);
  const ingredientLines = recipe.ingredients.map((item) =>
    [item.quantity, item.item].filter(Boolean).join(" ")
  );
  const instructionLines = recipe.instructions.map((step) => step.body);
  const canUseRecipeSchema =
    Boolean(recipe.publishedAt && image && ingredientLines.length > 0 && instructionLines.length > 0);

  return (
    <main className="content-page recipe-page" id="main-content" tabIndex={-1}>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <a href="/">Home</a><span aria-hidden="true">/</span><a href="/#latest">Recipes</a><span aria-hidden="true">/</span><span>{recipe.title}</span>
      </nav>
      <header className="recipe-header">
        <div className="recipe-kickers">
          {recipe.categories.map(({ category }) => (
            <a className="recipe-category-link" href={`/category/${category.slug}`} key={category.slug}>{category.name}</a>
          ))}
        </div>
        <h1>{recipe.title}</h1>
        <p className="recipe-excerpt">{recipe.excerpt}</p>
        <p className="recipe-byline">
          By {recipe.author.name}
          {recipe.publishedAt ? <> · Published <time dateTime={recipe.publishedAt.toISOString()}>{recipe.publishedAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time></> : null}
        </p>
      </header>

      {image ? (
        <div className="recipe-hero-image" role="img" aria-label={`Finished ${recipe.title}`} style={{ backgroundImage: `url("${image}")` }} />
      ) : null}

      <div className="recipe-layout">
        <article className="recipe-content">
          {recipe.content ? <div className="recipe-intro">{recipe.content}</div> : null}
          <section aria-labelledby="ingredients-heading">
            <h2 id="ingredients-heading">Ingredients</h2>
            {recipe.ingredients.length ? (
              <ul className="ingredient-list">
                {recipe.ingredients.map((item) => (
                  <li key={item.id}>{item.quantity ? <strong>{item.quantity} </strong> : null}{item.item}</li>
                ))}
              </ul>
            ) : <p>Ingredients for this recipe are being added.</p>}
          </section>
          <section aria-labelledby="instructions-heading">
            <h2 id="instructions-heading">Instructions</h2>
            {recipe.instructions.length ? (
              <ol className="instruction-list">
                {recipe.instructions.map((step, index) => (
                  <li key={step.id}><span className="instruction-number">{index + 1}</span><div>{step.title ? <h3>{step.title}</h3> : null}<p>{step.body}</p></div></li>
                ))}
              </ol>
            ) : <p>Step-by-step instructions are being added.</p>}
          </section>
        </article>
        <aside className="recipe-facts" aria-label="Recipe details">
          <h2>At a glance</h2>
          {recipe.prepMinutes ? <p><span>Prep time</span><strong>{recipe.prepMinutes} min</strong></p> : null}
          {recipe.cookMinutes ? <p><span>Cook time</span><strong>{recipe.cookMinutes} min</strong></p> : null}
          {recipe.totalMinutes ? <p><span>Total time</span><strong>{recipe.totalMinutes} min</strong></p> : null}
          <p><span>Servings</span><strong>{recipe.servings}</strong></p>
          {recipe.difficulty ? <p><span>Difficulty</span><strong>{recipe.difficulty}</strong></p> : null}
        </aside>
      </div>

      {canUseRecipeSchema ? (
        <RecipeJsonLd
          title={recipe.title}
          description={recipe.excerpt}
          imageUrls={[image!]}
          datePublished={recipe.publishedAt!.toISOString()}
          dateModified={recipe.updatedAt.toISOString()}
          authorName={recipe.author.name}
          prepMinutes={recipe.prepMinutes ?? undefined}
          cookMinutes={recipe.cookMinutes ?? undefined}
          totalMinutes={recipe.totalMinutes ?? undefined}
          servings={recipe.servings}
          ingredients={ingredientLines}
          instructions={instructionLines}
        />
      ) : null}
    </main>
  );
}
