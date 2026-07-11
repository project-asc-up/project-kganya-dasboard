# Project Kganya Console

Next.js admin console for managing academic resources and syncing them into Dify knowledge bases.

## Stack

- Next.js 16 App Router
- Prisma 7 + PostgreSQL
- Clerk auth
- Dify knowledge sync for resources and document uploads

## Local Development

```bash
npm install
npm run db:generate
npm run dev
```

## Dify Sync

Set these environment variables before using the sync commands:

- `DIFY_API_BASE`
- `DIFY_KB_API_KEY`
- `DIFY_DATASET_ID`

### Commands

```bash
npm run dify:sync:backfill
npm run dify:sync:process
```

- `dify:sync:backfill` enqueues resource records for initial sync.
- `dify:sync:process` processes pending sync jobs and retries failures.

## Resource Uploads

- Link resources update Dify with text content.
- Document uploads are staged locally and sent to Dify through the file document API.
- Failed syncs are recorded on the resource row for manual repair.

## Database

Run `npm run db:generate` after schema changes.

## Notes

- Keep the local `.env` out of git.
- The admin console expects the usual Prisma and Clerk runtime configuration.
