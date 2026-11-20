ALTER TABLE "Recipe"
  ADD COLUMN "heroAltText" TEXT,
  ADD COLUMN "introduction" TEXT,
  ADD COLUMN "whyLove" JSONB,
  ADD COLUMN "ingredientNotes" JSONB,
  ADD COLUMN "equipment" JSONB,
  ADD COLUMN "expertTips" JSONB,
  ADD COLUMN "variations" JSONB,
  ADD COLUMN "storageReheating" TEXT,
  ADD COLUMN "servingSuggestions" JSONB,
  ADD COLUMN "faqs" JSONB,
  ADD COLUMN "authorNotes" TEXT,
  ADD COLUMN "recipeTemperature" TEXT,
  ADD COLUMN "recipeYield" TEXT,
  ADD COLUMN "nutritionFacts" JSONB,
  ADD COLUMN "relatedRecipeSlugs" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "seoFocusKeyword" TEXT,
  ADD COLUMN "seoKeywords" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Preserve existing article introductions without changing existing published URLs or content.
UPDATE "Recipe"
SET "introduction" = NULLIF("content", '')
WHERE "introduction" IS NULL AND "content" <> '';
