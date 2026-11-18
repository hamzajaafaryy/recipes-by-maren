# Project Audit — Recipes by Maren

Audit date: 2026-11-18
Audited branch: main
Audited commit: b350d7d97a0bdb687dc4d4fdb152bb19373f39ae

## Executive status

The current repository is a visual starter and technical foundation, not a launch-ready recipe publication. The Vercel preview build completed, but a successful build does not mean the website workflows are functional.

## Findings

### P0 — Must fix before treating the site as a usable product
- [ ] Navigation is not shared across routes. The homepage contains its own header; internal pages have no site-wide navigation.
- [ ] The mobile menu button is displayed at widths below 800px but has no interaction or menu panel.
- [ ] The homepage recipe cards are static placeholder data. They do not link to recipe detail pages.
- [ ] Category cards point to the latest section instead of category pages.
- [ ] Search is a placeholder anchor, not a search feature.
- [ ] Newsletter form submits to `#` with GET; no subscription is stored or sent.
- [ ] Admin only creates and lists minimal draft records. No recipe edit/delete, full recipe editor, category assignment, ingredients, instructions, image upload, or publishing workflow.
- [ ] No public recipe detail or category routes exist.
- [ ] No database migration files are committed. Database connection, migrations, and seed execution remain environment-dependent and unverified.
- [ ] Cloudinary helper exists, but there is no upload workflow and no recipe page consuming it.

### P1 — Required before SEO / monetization launch
- [ ] Sitemap is static and excludes dynamic recipes/categories.
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

## What is verified
- Vercel deployment `dpl_4WfjA4uwvKQvwuMywV4YTnQVzAyy` reached READY.
- Next.js production build completed and generated the currently implemented routes.
- The build log still showed the ESLint warning noted above.
- Repository source was inspected for the homepage, global layout/styles, admin pages/API, Prisma schema/seed, metadata, sitemap/robots, and legal pages.

## What is not verified
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
