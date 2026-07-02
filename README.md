# Project ASC Chatbot

Deployable Next.js app root for the Project ASC MVP.

## What is in this app

- Next.js 16 App Router scaffold
- Prisma 7 schema for:
  - `faculties`
  - `asc_coaches`
  - `programmes`
  - `courses_modules`
  - `resources`
  - `faqs`
- Runtime adapter selection for Prisma
  - Neon adapter for Neon hosts
  - `pg` adapter for local/self-hosted PostgreSQL
- CSV seed importer wired to the repo-level knowledge base in `../docs`
- `GET /api/health` database verification endpoint

## Vercel setup

Use the repository root as the Vercel project root.

Required environment variables:

- `DATABASE_URL`
  - Pooled Neon connection string used by the running app, or a local/self-hosted PostgreSQL URL.
- `DIRECT_URL`
  - Direct non-pooled Neon connection string used by Prisma CLI commands when using Neon.
  - For local/self-hosted PostgreSQL, you can point this at the same local database URL.
- `BETTER_AUTH_SECRET`
  - Strong random secret used to sign login sessions.
- `ADMIN_PASSWORD`
  - Optional. Required only if you want to sign in with the built-in `admin` account.

## Local commands

```bash
npm install
npm run db:generate
npm run dev
```

For local development, copy `.env.example` to `.env`, fill in the database URLs, and set `BETTER_AUTH_SECRET`.

Once a database is connected:

```bash
npm run db:push
npm run db:seed
```

## Database verification

After the schema is applied and the seed has run, call:

```text
/api/health
```

Expected success shape:

```json
{
  "ok": true,
  "database": {
    "connected": true,
    "counts": {
      "faculties": 10,
      "ascCoaches": 30,
      "programmes": 262,
      "courseModules": 14643,
      "resources": 9,
      "faqs": 6
    }
  }
}
```

## Seed source

The seed importer reads:

- `docs/seed-faculties.csv`
- `docs/seed-asc-coaches.csv`
- `docs/seed-programmes.csv`
- `docs/seed-course-modules.csv`
- `docs/seed-resources.csv`
- `docs/seed-faqs.csv`
