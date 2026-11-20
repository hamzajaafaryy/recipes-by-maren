# Project Audit — Recipes by Maren

Audit date: 2026-11-18
Audited branch: main
Audited commit: b350d7d97a0bdb687dc4d4fdb152bb19373f39ae

## Executive status

The current repository is a visual starter and technical foundation, not a launch-ready recipe publication. The Vercel preview build completed, but a successful build does not mean the website workflows are functional.

## Findings

### P0 — Must fix before treating the site as a usable product
- [x] Shared site navigation and footer now mount from the root layout across public routes; admin screens hide the public shell.
- [x] Responsive mobile navigation now opens/closes with an accessible toggle and closes after selecting a link.
- [x] Homepage recipe cards now load only published database recipes and link to their detail pages; empty states are shown when no content is published.
- [x] Category cards link to category landing pages.
- [x] Search now queries published recipe titles, descriptions, and ingredients through a server-rendered search page.
- [ ] Newsletter form submits to `#` with GET; no subscription is stored or sent.
- [ ] Admin only creates and lists minimal draft records. No recipe edit/delete, full recipe editor, category assignment, ingredients, instructions, image upload, or publishing workflow.
- [x] Public recipe detail and category routes now exist, with per-page metadata and published-content filtering.
- [ ] No database migration files are committed. Database connection, migrations, and seed execution remain environment-dependent and unverified.
- [ ] Cloudinary helper exists, but there is no upload workflow and no recipe page consuming it.

### P1 — Required before SEO / monetization launch
- [x] Sitemap includes published recipe/category routes and uses the latest published recipe update date for the homepage rather than the current time.
- [ ] Recipe JSON-LD component exists but is not used by any recipe page.
- [ ] Homepage images use remote Unsplash URLs as visual placeholders; recipe image ownership/licensing and production assets need review.
- [ ] Privacy page explicitly identifies itself as a draft; actual analytics, advertising, cookies, newsletter providers, retention and contact details must be documented.
- [ ] Contact email is a placeholder and must be replaced with an inbox the owner controls.
- [ ] Affiliate disclosure is generic; actual affiliate relationships must be disclosed near links.
- [ ] No cookie/consent controls are implemented. Add them only when required by actual analytics/ad technology and target jurisdictions.
- [ ] No end-to-end checks, accessibility checks, or mobile browser checks have been recorded.
- [ ] Vercel build emitted an ESLint warning: `nextVitals is not iterable`. Fix the ESLint flat config rather than ignoring it.
- [ ] npm audit during deployment reported 21 vulnerabilities (1 moderate, 20 high). Review dependency paths and remediate safely before production.
- [ ] Admin authentication has no rate limiting. Missing AUTH_SECRET can throw during authenticated-page checks if a stale cookie is present; handle configuration failures safely.
- [ ] Validate admin API input sizes and malformed JSON, and add operational error logging without exposing secrets.

### P2 — Quality and growth improvements
- [ ] Add a real recipe search with useful empty states and pagination.
- [ ] Add recipe discovery filters and internal linking.
- [ ] Add share / Pinterest save controls and complete Open Graph social images.
- [ ] Add performance, Core Web Vitals, broken-link, image-alt, keyboard, and screen-reader testing.
- [ ] Add monitoring, backups, email deliverability checks, and an operational publishing checklist.

## Stage 2 work already committed
- Added shared responsive header and footer components and mounted them from the root layout.
- Added an accessible mobile menu toggle with expanded state and a real navigation panel.
- Added keyboard skip navigation, visible focus states, reduced-motion support, and page-level homepage metadata.
- Added database-backed published recipe cards, category landing pages, recipe detail pages, server-rendered search, canonical metadata, and a dynamic sitemap.
- Added safe Cloudinary image URL generation from configured public IDs; no image URL is emitted when the cloud name or image ID is missing.
- Removed duplicated homepage-only header/footer markup.
- Corrected the ESLint flat-config preset shape that caused the deployment warning.
- Made admin authentication fail closed instead of throwing when AUTH_SECRET is missing and a stale session cookie is present.
- Added this audit and roadmap document.

## Pinterest and social SEO implementation notes

- Recipe hero images render through Next Image with explicit dimensions, descriptive alt text, and priority loading.
- Recipe pages provide a Pinterest Save action using a Cloudinary 1000×1500 vertical crop.
- Homepage, recipe, and category pages expose Open Graph/Twitter preview images; category pages include CollectionPage/ItemList and BreadcrumbList structured data.
- Root metadata includes a default social image and SVG site icon. Pinterest domain verification is supported through `PINTEREST_DOMAIN_VERIFICATION`; the account-specific token must be supplied by the site owner.
- Recipe/category pages use one-hour ISR revalidation; the recipes index also uses ISR.

## UI/UX and SEO implementation notes

- Homepage content is now database-driven; unpublished drafts are excluded from public discovery.
- Search is noindex by design to avoid indexing thin query-result pages.
- Recipe structured data is intentionally conditional; no ratings, nutrition, or unsupported fields are fabricated.
- Category and recipe routes depend on a configured database and published records. Until migrations and seed/data setup are completed, the site will show empty states rather than sample recipes.
- Cloudinary image URLs require `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and a valid `heroPublicId`.

## What is verified
- Vercel deployment `dpl_4WfjA4uwvKQvwuMywV4YTnQVzAyy` reached READY.
- Next.js production build completed and generated the currently implemented routes.
- The build log still showed the ESLint warning noted above.
- Repository source was inspected for the homepage, global layout/styles, admin pages/API, Prisma schema/seed, metadata, sitemap/robots, and legal pages.

## What is not verified
- The latest deployment for commit `5410d095af8a43a4d3b86bab851aebebf2d4b64c` is still queued; the new shared navigation has not yet been verified in a deployed browser.
- Live browser rendering at desktop/mobile sizes.
- Real database connectivity, migrations, or seed data.
- Admin login against production environment variables.
- Recipe creation against a live database.
- Cloudinary upload/delivery.
- Newsletter delivery.
- Search, public recipe/category pages, or publishing.
- AdSense, affiliate, analytics, cookie consent, domain ownership, or email inbox configuration.

## Recommended Stage 2 sequence
1. Shared responsive site shell: global navigation/footer, working mobile menu, consistent internal-page layout.
2. Content model and database readiness: migrations, safe seed, connection verification, category and recipe data.
3. Full admin workflow: recipe create/edit/delete, structured ingredients/instructions, image management, draft review and explicit publish.
4. Public discovery: dynamic recipe detail/category pages, search, pagination, related recipes.
5. SEO and distribution: dynamic sitemap, canonical/meta, accurate Recipe JSON-LD, Open Graph/Pinterest assets.
6. Newsletter and legal/monetization readiness: real provider integration, accurate privacy/disclosure, consent where required.
7. QA and release: desktop/mobile, accessibility, security, performance, broken links, production environment and rollback checks.

## Publishing integrity
Do not publish placeholder recipes or fabricate recipe testing, author credentials, ratings, reviews, nutrition values, or personal experience. A recipe should be published only after the actual ingredients, method, timings, yield, images, and editorial checks are complete.


## Rich Recipe Experience — implementation branch (2026-11-20)

Branch: `feature/rich-recipe-experience`

### Implemented in source
- Expanded the Prisma Recipe model with optional editorial fields: introduction, why-love points, ingredient notes, equipment, expert tips, variations, storage/reheating, serving suggestions, FAQs, author notes, recipe temperature/yield, hero alt text, SEO focus keyword/keywords, and related recipe slugs.
- Added a PostgreSQL migration at `prisma/migrations/20261120160000_rich_recipe_content/migration.sql`. Existing article content is preserved; the migration copies legacy `content` into the new `introduction` field where applicable.
- Added an authenticated recipe editor API at `/api/admin/recipes/[id]` with Zod validation, structured ingredient/instruction saving, category assignment, related recipe slugs, draft/publish status, and publish checks.
- Added an authenticated editorial editor at `/admin/recipes/[id]` with grouped sections, SEO snippet preview, editorial checklist, responsive layout, and explicit Save Draft / Publish actions.
- New recipe creation in the Content Studio now routes directly to the full editor; recipe library entries link to their editor.
- Rebuilt the public recipe detail template with optional editorial sections, jump links, step images, a print-friendly recipe card, FAQ accordions, related recipe cards, improved mobile layout, and conditional section rendering.
- Added a client-side Print Recipe action.
- Extended Recipe JSON-LD with recipe yield and editorial keywords. No ratings or nutrition facts are fabricated or emitted by this change.

### Required before using the editor in production
1. Apply the new migration to the intended PostgreSQL database using the project's reviewed deployment process (for production, use `npx prisma migrate deploy` after verifying the database target).
2. Regenerate Prisma Client with `npx prisma generate`.
3. Verify the editor against the live database, including create/edit, category assignment, draft preview, publishing, and unpublishing.
4. Complete Cloudinary upload integration. The current editor accepts Cloudinary public IDs; it does not yet upload files directly.
5. Verify the preview deployment build and inspect desktop/mobile rendering before merging to main.
6. Add validated nutrition entry only if reliable values and serving basis are available; otherwise leave nutrition absent.

### Editorial and SEO rules
- Optional sections are omitted from the public page when empty.
- Existing recipe slugs and legacy content are preserved.
- Publishing requires ingredients, instructions, and a hero image.
- Recipe schema remains conditional on publication, a hero image, ingredients, and instructions.
- Use verified temperatures, storage guidance, timings, and yield. Never generate placeholder claims, personal testing claims, ratings, or nutrition values.
- Keep title, meta description, alt text, internal links, and structured data specific to the recipe. Word count is a quality signal, not a publishing requirement.

### Verification status
- Source changes are committed to the feature branch.
- A Vercel preview deployment was requested for the feature branch; its build result still needs to be checked.
- Database migration has not been applied or verified against the production database.
- No live production changes have been made by this feature branch.
