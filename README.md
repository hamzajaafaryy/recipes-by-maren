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

## Content principles
Publish original, carefully reviewed recipes. Do not invent testing claims, author credentials, ratings, or nutrition facts.
