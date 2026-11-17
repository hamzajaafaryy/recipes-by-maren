type RecipeJsonLdProps = {
  title: string;
  description: string;
  imageUrls: string[];
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  prepMinutes?: number;
  cookMinutes?: number;
  totalMinutes?: number;
  servings?: number;
  ingredients: string[];
  instructions: string[];
};

export default function RecipeJsonLd(props: RecipeJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: props.title,
    description: props.description,
    image: props.imageUrls,
    datePublished: props.datePublished,
    ...(props.dateModified ? { dateModified: props.dateModified } : {}),
    author: { "@type": "Person", name: props.authorName || "Maren" },
    ...(props.prepMinutes ? { prepTime: `PT${props.prepMinutes}M` } : {}),
    ...(props.cookMinutes ? { cookTime: `PT${props.cookMinutes}M` } : {}),
    ...(props.totalMinutes ? { totalTime: `PT${props.totalMinutes}M` } : {}),
    ...(props.servings ? { recipeYield: `${props.servings} servings` } : {}),
    recipeIngredient: props.ingredients,
    recipeInstructions: props.instructions.map((text, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text
    }))
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />;
}
