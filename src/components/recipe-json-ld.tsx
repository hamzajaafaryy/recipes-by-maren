type RecipeJsonLdProps = {
  title: string;
  description: string;
  imageUrls: string[];
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  recipeCategories?: string[];
  recipeUrl: string;
  prepMinutes?: number;
  cookMinutes?: number;
  totalMinutes?: number;
  servings?: number;
  recipeYield?: string;
  keywords?: string[];
  ingredients: string[];
  instructions: string[];
};

export default function RecipeJsonLd(props: RecipeJsonLdProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://recipesbymaren.com";
  const schema = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: props.title,
    description: props.description,
    image: props.imageUrls,
    url: props.recipeUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": props.recipeUrl },
    datePublished: props.datePublished,
    ...(props.dateModified ? { dateModified: props.dateModified } : {}),
    author: { "@type": "Person", name: props.authorName || "Maren" },
    publisher: {
      "@type": "Organization",
      name: "Recipes by Maren",
      url: siteUrl
    },
    ...(props.recipeCategories?.length ? { recipeCategory: props.recipeCategories } : {}),
    keywords: [...new Set([props.title, ...(props.recipeCategories || []), ...(props.keywords || [])])].join(", "),
    ...(props.prepMinutes ? { prepTime: `PT${props.prepMinutes}M` } : {}),
    ...(props.cookMinutes ? { cookTime: `PT${props.cookMinutes}M` } : {}),
    ...(props.totalMinutes ? { totalTime: `PT${props.totalMinutes}M` } : {}),
    ...(props.recipeYield ? { recipeYield: props.recipeYield } : props.servings ? { recipeYield: `${props.servings} servings` } : {}),
    recipeIngredient: props.ingredients,
    recipeInstructions: props.instructions.map((text, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text
    }))
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />;
}
