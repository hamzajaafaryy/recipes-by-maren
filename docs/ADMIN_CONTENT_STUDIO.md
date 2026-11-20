# Admin Content Studio

The admin area is available at `/admin` and requires the configured admin session.

## Recipe workflow
1. Create a recipe draft and add a unique lowercase URL slug.
2. Complete the short description, article introduction, prep/cook times, servings, difficulty, and categories.
3. Add ingredients one per line. Use `quantity | ingredient`, or `section | quantity | ingredient` for grouped ingredients.
4. Add instructions one per line. Use `step title | instruction` or write the instruction without a title.
5. Upload a hero photo or enter an existing Cloudinary public ID.
6. Add an SEO title, meta description, and optional canonical URL.
7. Save as draft while preparing the content. Publish only after editorial review.

## Publishing safeguards
The API requires at least one ingredient, one instruction, and a hero image before a recipe can be published. The editor does not invent nutrition, reviews, ratings, recipe testing, or author experience. Verify ingredient amounts, temperatures, timing, servings, and method before publishing.

## Cloudinary setup
Configure these Vercel environment variables for the project:
- `CLOUDINARY_CLOUD_NAME` (or `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`)
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

The secret stays server-side. The admin API creates a short-lived upload signature; the browser sends the image directly to Cloudinary. Upload limit in the editor is 10 MB.

## Current limitations
- Scheduled publishing is not yet available. The existing Prisma Recipe model has no scheduled timestamp, and there is no scheduler/cron workflow. Add this only with a reviewed Prisma migration and scheduler.
- Newsletter subscriber management and review moderation are separate future admin modules.
- The admin UI and API must be tested against the actual preview environment and configured environment variables before merging.
