# 02 Normalize and Chunk Worker

## Purpose

Claim queued ingestion jobs atomically, load the authoritative source graph, normalize the source record, and persist draft chunk rows for downstream embedding.

This workflow is the row-normalization layer. It should not call the embedding provider.

## Trigger

- `Cron`
- Recommended cadence: every 1 minute, or faster if the queue depth requires it

## Inputs

- Queued jobs from `ingestion_jobs`
- Source graph from:
  - `organizations`
  - `knowledge_sources`
  - `source_records`
  - `source_record_fields`

## Outputs

- Draft `document_chunks` rows with `embedding = null`
- Jobs marked as `processing`
- Deterministic chunk payloads ready for the embedding worker
- `claimedCount` and `draftCount` summary values

## Node List

1. `Cron Trigger`
2. `Claim Queued Jobs`
3. `Fetch Source Graph`
4. `Normalize Source Record`
5. `Build Derived Chunks`
6. `Persist Chunk Drafts`
7. `Update Job State`
8. `Build Worker Summary`
9. `Error Handler`

## Edge Map

| From | To | Condition |
|---|---|---|
| `Cron Trigger` | `Claim Queued Jobs` | always |
| `Claim Queued Jobs` | `Fetch Source Graph` | jobs claimed |
| `Claim Queued Jobs` | `Error Handler` | claim fails |
| `Fetch Source Graph` | `Normalize Source Record` | source graph available |
| `Fetch Source Graph` | `Error Handler` | source missing or stale |
| `Normalize Source Record` | `Build Derived Chunks` | normalization success |
| `Normalize Source Record` | `Error Handler` | normalization failure |
| `Build Derived Chunks` | `Persist Chunk Drafts` | chunk build success |
| `Build Derived Chunks` | `Error Handler` | chunk build failure |
| `Persist Chunk Drafts` | `Update Job State` | draft write succeeds |
| `Persist Chunk Drafts` | `Error Handler` | draft write fails |
| `Update Job State` | `Build Worker Summary` | state write succeeds |
| `Update Job State` | `Error Handler` | state write fails |

## Claim Contract

`Claim Queued Jobs` should:

- use `FOR UPDATE SKIP LOCKED` or an equivalent transactional claim
- mark jobs as `processing` in the same unit of work as the claim
- never allow the same queued job to be claimed twice by overlapping cron runs
- refuse to claim jobs from another organization

## Chunk Draft Contract

`Persist Chunk Drafts` should:

- upsert `document_chunks` by `organizationId + sourceRecordId + version + chunkIndex`
- set `embedding = null`
- set `embedding_model = 'pending'`
- keep `active = true` for fresh rows
- retire older active rows for the same source record version if the source content changed
- treat draft rows as non-retrievable until embedding has been written

## Failure Rules

- Do not embed during normalization.
- Do not overwrite chunks from another organization.
- Do not advance a job without a matching source record.
- Do not rely on cron timing alone to prevent double processing.
