# Project Kganya Console

Vercel-hosted staff console connected to Neon Postgres for the Kganya operating system.

This repo is the implementation surface. The product plan lives in `../kganya-operating-system`, and this codebase must be adapted to that plan, not the other way around.

For the backend table and migration design, see [KGANYA_SCHEMA_AND_MIGRATION_PLAN.md](C:/Users/sewar/repos/Project%20Kganya/project-kganya-dasboard/KGANYA_SCHEMA_AND_MIGRATION_PLAN.md).

For the source-by-source import path, see [KGANYA_BACKFILL_MAP.md](C:/Users/sewar/repos/Project%20Kganya/project-kganya-dasboard/KGANYA_BACKFILL_MAP.md).

The Kganya Prisma schema lives at `prisma/kganya/schema.prisma`, and its generated client target is `src/generated/kganya-prisma`.

For the backend automation and n8n build spec, see `project-kganya-backend/`.

## Local development

This repo is the frontend UI plus the Kganya console backend contract docs.

- The UI runs locally from this repo.
- The n8n workflows are documented under `project-kganya-backend/`.
- The local launcher does not start n8n. Keep that separate.

### What the launcher starts

- Next.js dev server for the frontend UI
- A browser tab pointed at `http://localhost:3000`

### What the launcher does not start

- n8n
- Background workflow workers
- A database server

You still need the expected environment variables for Clerk, Neon, and any other services the UI reads at startup.

## Access model

The admin console now uses role-based access only.

- `user`: view-only access to content screens
- `admin`: view and edit access to content screens
- `super_admin`: view, edit, and create access, plus user creation and role management

Roles are assigned in the user management screen and at invite time. Permission checkboxes are no longer the source of truth.

## Current reality

- Next.js 16 App Router console already exists and updates data in Neon Postgres.
- Prisma 7 is the data layer.
- Clerk is present, but auth is still mixed with a legacy signed-cookie path.
- The current schema still reflects the older ASC-style content tables.
- The console is useful now, but it is not yet aligned to the Kganya source-record, derived-chunk, and org-scoped retrieval model.

## Alignment rules

- Postgres is the source of truth for editable data.
- `pgvector` is derived retrieval state only.
- Clerk organization context is the auth boundary.
- `organization_id` should be the canonical tenant key in app code and docs.
- `org_id` should not remain a second competing concept.
- n8n orchestrates ingestion and retrieval jobs.
- Chatwoot is the conversation boundary, not the data boundary.

## What this repo already proves

- The working UI can run on Vercel.
- Prisma can connect cleanly to Neon.
- Console edits can persist to the live database.
- The repo is far enough along to prioritize alignment work instead of rebuilding the entire stack.

## What still needs to change

- Normalize tenant identity and auth around Clerk orgs.
- Replace legacy ASC domain tables with Kganya source-record and derived-chunk tables.
- Use row-level `source_records` with `record_key` for structured CSV sources instead of flattening them into one blob per file.
- Add ingestion job state, reindex visibility, and approval workflow support.
- Add retrieval evaluation and health checks for the derived index.
- Dispatch pending embedding jobs through `KGANYA_EMBEDDING_WEBHOOK_URL` when the n8n workflow is ready.
- Reframe the UI around source management instead of legacy academic-content CRUD.

## UI constraint

Keep the current UI behavior and editing flow intact where possible.

The migration should happen in the backend:

- database schema
- tenant resolution
- source normalization
- derived vector generation
- sync and reindex state

Only change the UI where the backend contract requires it.

## Local commands

```bash
npm install
npm run db:generate
npm run db:generate:kganya
npm run kganya:init-schema
npm run dev
```

### One-click Windows startup

If you are on Windows, double-click `start-ui.cmd` from this folder.

The launcher will:

1. check that dependencies exist
2. start the Next.js dev server in a separate window
3. wait for the app to answer on port `3000`
4. open your browser to the UI

If `node_modules` is missing, the launcher installs dependencies first.

### Manual startup

If you prefer to run it yourself:

```bash
cd project-kganya-dasboard
npm install
npm run dev
```

Then open `http://localhost:3000`.

Once a database is connected:

```bash
npm run kganya:backfill:preview
npm run kganya:backfill:apply
npm run kganya:embedding-dispatch
npm run kganya:ingestion-status
npm run db:push
npm run db:seed
```

## Resource uploads

The Resources section now supports both link resources and document uploads.

- Link resources keep the existing title, category, URL, and metadata flow.
- Document uploads accept `.md`, `.txt`, `.pdf`, `.docx`, `.png`, `.jpg`, and `.jpeg` files.
- PNG and JPEG uploads are OCR-extracted on the server, then stored as text before chunking.
- Uploaded documents are extracted into the Kganya source-record tables and chunked into `document_chunks` for vector search.
- The resource detail page shows the upload status, chunk count, and Kganya source keys.

If an upload fails, the resource row is still created with a failed status so it can be retried or inspected.

## Verification

The current `/api/health` route only proves the legacy data model is reachable. The Kganya target state still needs health checks for:

- organization resolution
- source-record coverage
- ingestion queue status
- derived chunk freshness
- retrieval readiness

## Next step

Start with tenant normalization and auth consolidation:

1. Pick one canonical tenant key and remove the split between `org_id` and `organization_id`.
2. Make Clerk organization context the only auth boundary for Kganya flows.
3. Refactor the console toward source-record editing before expanding retrieval and Chatwoot integration.
