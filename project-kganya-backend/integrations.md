# Integrations

## Required Connections

### 1. Neon Postgres

Purpose:
- source-of-truth storage for organizations, sources, records, chunks, and jobs

Needs:
- connection string
- direct URL for migrations or admin writes
- SSL mode configuration

### 2. n8n

Purpose:
- automation orchestrator for Kganya backend workflows

Needs:
- webhook trigger URL
- optional signed request secret
- workflow IDs or deployment references

### 3. Embedding Provider

Purpose:
- convert chunk text into vector embeddings

Needs:
- model name
- API key or service credentials
- timeout and retry policy
- token limit policy

### 4. Chatwoot

Purpose:
- conversation boundary for WhatsApp and support channels

Needs:
- account ID
- inbox ID
- webhook or API credentials

### 5. Clerk

Purpose:
- organization auth boundary

Needs:
- org identity
- user identity
- app session context

## Integration Order

1. Clerk resolves the tenant boundary.
2. The console reads and writes Postgres.
3. The console dispatches pending jobs to n8n.
4. n8n validates the batch and normalizes the source data.
5. n8n calls the embedding provider.
6. n8n writes the derived rows back to Postgres.
7. n8n returns status to the console.
8. Later, Chatwoot consumes the retrieval/answer layer.

## Secrets And Env Vars

- `DATABASE_URL`
- `DIRECT_URL`
- `KGANYA_EMBEDDING_WEBHOOK_URL`
- `KGANYA_EMBEDDING_WEBHOOK_SECRET`
- `KGANYA_STATUS_API_TOKEN`
- `CLERK_SECRET_KEY`
- `CLERK_PUBLISHABLE_KEY`
- `CHATWOOT_ACCOUNT_ID`
- `CHATWOOT_INBOX_ID`
- `EMBEDDING_PROVIDER_API_KEY`

## Connection Rules

- Never share tenant-scoped secrets across organizations.
- Never treat Chatwoot as a source-of-truth database.
- Never allow the embedding provider to decide tenant boundaries.
- Never write derived chunks without a matching source record.
