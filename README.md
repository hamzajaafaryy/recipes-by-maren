# Recipes by Maren

A modern, editorial recipe website for US home cooks.

**Tagline:** Real food. Simple recipes. Made with care.

## Stack
- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase PostgreSQL + Prisma (data layer)
- Cloudinary (recipe image delivery)

## Getting started
```bash
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:3000.

## Environment
See `.env.example`. The public website can run locally without Supabase or Cloudinary credentials using the starter recipe data. Configure those services before enabling publishing or image uploads.

## Pinterest and social sharing

- Recipe pages generate a 1000×1500 Cloudinary image for the Pinterest Save action when a recipe hero image is configured.
- Open Graph and Twitter previews are configured for the homepage, recipe pages, and category pages.
- Recipe JSON-LD includes publisher, canonical URL, recipe category, keywords, ingredients, instructions, and real publication dates. Nutrition and aggregate ratings are intentionally omitted unless verified source data is available.
- To claim the production domain, add the verification token supplied by Pinterest Business to `PINTEREST_DOMAIN_VERIFICATION` in the hosting environment, redeploy, then complete verification in Pinterest. Do not use a guessed token.

## Content principles
Publish original, carefully reviewed recipes. Do not invent testing claims, author credentials, ratings, or nutrition facts.

## Admin setup

The private admin area is available at `/admin`. Configure these values in your hosting environment before using it:

- `ADMIN_PASSWORD_HASH`: scrypt password hash in `salt:hexhash` format.
- `AUTH_SECRET`: a random secret of at least 32 characters.
- `DATABASE_URL` and `DIRECT_URL`: Supabase PostgreSQL connection strings.

Generate an admin password hash locally with Node.js:

```bash
node -e "const c=require('crypto');const s=c.randomBytes(16).toString('hex');console.log(s+':'+c.scryptSync('CHANGE_THIS_PASSWORD',s,64).toString('hex'))"
```

Replace `CHANGE_THIS_PASSWORD` with a strong unique password. Generate `AUTH_SECRET` with:

```bash
openssl rand -base64 48
```

Never commit real secrets to GitHub. New recipe entries are saved as drafts; the public recipe publishing workflow is intentionally not enabled until full recipe editing and review are implemented.

## Database setup

After configuring Supabase connection strings:

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

Run migrations against the intended database only after reviewing the generated SQL. Use the Supabase pooled connection for runtime where appropriate and the direct connection for migrations.
