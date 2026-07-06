# 01 Intake and Queue

## Purpose

Accept a Kganya batch from the console, verify it, resolve the tenant boundary, and queue durable ingestion jobs in Postgres.

This workflow must be fast. It should not fetch source graphs, generate embeddings, or write derived chunks.

## Trigger

- `Webhook`
- `POST /kganya/backend/dispatch`

## Inputs

- Raw JSON batch body from the console
- Required headers:
  - `x-kganya-batch-id`
  - `x-kganya-checksum`
  - `x-kganya-signature` when signing is enabled
- `x-kganya-batch-id` is the batch-dispatch idempotency key

## Outputs

- Structured acknowledgement payload
- `queuedCount` based on durable job writes
- `acceptedCount`, `rejectedCount`, `duplicateCount`, and error details
- job-level acceptance results so partial success is visible

## Node List

1. `Webhook Trigger`
2. `Verify Signature`
3. `Parse Batch`
4. `Validate Batch Schema`
5. `Resolve Organization`
6. `Check Batch Idempotency`
7. `Queue Ingestion Jobs`
8. `Build Acknowledgement`
9. `Respond To Webhook`
10. `Error Handler`

## Edge Map

| From | To | Condition |
|---|---|---|
| `Webhook Trigger` | `Verify Signature` | always |
| `Verify Signature` | `Parse Batch` | signature valid or unsigned mode allowed |
| `Verify Signature` | `Error Handler` | signature invalid |
| `Parse Batch` | `Validate Batch Schema` | parse success |
| `Validate Batch Schema` | `Resolve Organization` | schema valid |
| `Validate Batch Schema` | `Error Handler` | schema invalid |
| `Resolve Organization` | `Check Batch Idempotency` | org resolves and is active |
| `Resolve Organization` | `Error Handler` | org missing or inactive |
| `Check Batch Idempotency` | `Queue Ingestion Jobs` | batch is new or contains new source records |
| `Check Batch Idempotency` | `Build Acknowledgement` | batch is a duplicate replay |
| `Check Batch Idempotency` | `Error Handler` | batch idempotency check fails |
| `Queue Ingestion Jobs` | `Build Acknowledgement` | queue write succeeds |
| `Queue Ingestion Jobs` | `Error Handler` | queue write fails |
| `Build Acknowledgement` | `Respond To Webhook` | always |
| `Error Handler` | `Respond To Webhook` | always |

## Queue Write Contract

`Queue Ingestion Jobs` should:

- set `ingestion_jobs.job_type = 'embedding'`
- set `ingestion_jobs.state = 'queued'`
- persist `batchId` and `inputChecksum` on every queued job
- preserve `organizationId`, `knowledgeSourceId`, and `sourceRecordId`
- treat `(organizationId, batchId, sourceRecordId)` as the natural dedupe key
- reset `retryCount` when a job is newly queued
- refuse to cross tenant boundaries
- return per-job acceptance results so duplicates are reported instead of silently dropped

## Failure Rules

- Reject invalid signatures before any database write.
- Reject invalid batch shapes before any database write.
- Reject missing or inactive organizations before any queue write.
- Reject duplicate batches at the idempotency step before queue mutation.
- Return a stable error envelope for every failure.
