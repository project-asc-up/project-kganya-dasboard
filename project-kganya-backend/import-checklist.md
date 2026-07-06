# Kganya n8n Import Checklist

> This checklist applies to the split workflow exports in `exports/*.json`. The legacy single-flow export is reference only.

## Import Readiness

The export scaffold is structurally valid and can be imported into n8n.

It is not fully executable until the following values are prepared.

## Placeholder Values To Prepare

### 1. Postgres credential binding

- **Placeholder in export:** `__POSTGRES_CREDENTIAL_ID__`
- **What it is:** the n8n credential ID for the Neon Postgres connection
- **Where used:** `Resolve Organization`, `Fetch Source Graph`, `Persist Derived Rows`, `Update Job State`
- **What to prepare:**
  - one n8n Postgres credential entry
  - the correct Neon connection string
  - any SSL or direct-connect settings required by your instance

### 2. Embedding provider URL

- **Placeholder in export:** `KGANYA_EMBEDDING_PROVIDER_URL`
- **What it is:** the HTTP endpoint that receives chunk batches for embedding generation
- **Where used:** `Dispatch Embeddings`
- **What to prepare:**
  - the provider endpoint or n8n subworkflow webhook
  - any required auth header or bearer token

### 3. Webhook signing secret

- **Placeholder in export:** `KGANYA_EMBEDDING_WEBHOOK_SECRET`
- **What it is:** the HMAC secret used to verify the incoming console-to-backend request
- **Where used:** `Verify Signature`
- **What to prepare:**
  - a strong random secret
  - the same value in the console dispatch environment

### 4. Status API token

- **Placeholder in export:** `KGANYA_STATUS_API_TOKEN`
- **What it is:** the shared secret used by the console when reading `GET /kganya/backend/status`
- **Where used:** `Verify Auth`
- **What to prepare:**
  - one strong bearer token value
  - the same token in the console status-read request

### 5. Optional provider authentication

- **Placeholder in export:** `authentication: predefinedCredentialType`
- **What it is:** the auth mode for the HTTP Request node
- **What to prepare:**
  - either a matching n8n credential for the provider
  - or a manual switch to `none` if your provider is accessed by raw URL and headers

### 6. Postgres UUID function support

- **Placeholder in export:** `gen_random_uuid()`
- **What it is:** a Postgres function used by the derived-row upsert query
- **What to prepare:**
  - `pgcrypto` enabled, or
  - replace with the UUID function supported by your database configuration

### 7. Ingestion and retry columns

- **Placeholders in export:** `batch_id`, `input_checksum`, `failure_code`, `failure_category`, `next_retry_at`
- **What they are:** the Postgres columns the split workflows read and write for idempotency and retry control
- **Where used:** `Queue Ingestion Jobs`, `Check Batch Idempotency`, `Load Retry Candidates`, `Requeue Eligible Jobs`
- **What to prepare:**
  - add the columns to the `ingestion_jobs` table if they are not present
  - make sure `batch_id` and `input_checksum` are indexed for replay checks
  - make sure `failure_code`, `failure_category`, and `next_retry_at` are available for retry decisions

## Environment Values To Have Ready

- `KGANYA_EMBEDDING_WEBHOOK_SECRET`
- `KGANYA_EMBEDDING_PROVIDER_URL`
- `KGANYA_STATUS_API_TOKEN`
- database credentials for the n8n Postgres node
- any provider auth token or API key
- `DATABASE_URL`
- `DIRECT_URL` if you use a separate admin connection
- `batch_id`, `input_checksum`, `failure_code`, `failure_category`, `next_retry_at` columns on `ingestion_jobs`
- any n8n webhook host / reverse proxy path needed to expose the workflow URLs

## Import Notes

- The workflow path is already defined as `/kganya/backend/dispatch`.
- The request/response shapes are already defined in the spec files.
- The JSON export is ready to import as a scaffold.
- The credential IDs, provider bindings, and status-token secret are the main setup gaps.
