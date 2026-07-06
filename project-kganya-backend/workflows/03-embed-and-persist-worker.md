# 03 Embed and Persist Worker

## Purpose

Claim draft chunk bundles by `sourceRecordId` and `version`, send the bundle text to the embedding provider, persist the resulting vectors, and complete the ingestion job only after the full source record bundle is written.

This workflow must be the only place that writes embeddings.

## Trigger

- `Cron`
- Recommended cadence: every 30 seconds to 1 minute, tuned to provider latency and queue depth

## Inputs

- Draft chunk bundles from `document_chunks`
- Job rows from `ingestion_jobs`
- Provider endpoint and credentials

## Outputs

- `document_chunks.embedding` populated with vector data
- `document_chunks.embedding_model` set to the active model name
- `ingestion_jobs.state` updated to `completed` or `failed`
- `persistedCount` and `remainingDraftCount` summary values

## Node List

1. `Cron Trigger`
2. `Claim Draft Bundles`
3. `Build Embedding Payload`
4. `Dispatch Embeddings`
5. `Persist Derived Rows`
6. `Update Job State`
7. `Build Worker Summary`
8. `Error Handler`

## Edge Map

| From | To | Condition |
|---|---|---|
| `Cron Trigger` | `Claim Draft Bundles` | always |
| `Claim Draft Bundles` | `Build Embedding Payload` | bundles claimed |
| `Claim Draft Bundles` | `Error Handler` | claim fails |
| `Build Embedding Payload` | `Dispatch Embeddings` | payload assembled |
| `Build Embedding Payload` | `Error Handler` | payload build fails |
| `Dispatch Embeddings` | `Persist Derived Rows` | provider success |
| `Dispatch Embeddings` | `Error Handler` | provider failure |
| `Persist Derived Rows` | `Update Job State` | write succeeds |
| `Persist Derived Rows` | `Error Handler` | write fails |
| `Update Job State` | `Build Worker Summary` | state write succeeds |
| `Update Job State` | `Error Handler` | state write fails |

## Bundle Contract

`Claim Draft Bundles` should:

- claim work by `organizationId + sourceRecordId + version`
- load every pending chunk for the bundle in one pass
- prevent overlapping runs from splitting a source record across executions
- keep the bundle shape stable so the provider sees the full source record context

`Dispatch Embeddings` should:

- send a batch of chunks for a single source record, not one chunk at a time
- preserve `organizationId`, `knowledgeSourceId`, `sourceRecordId`, and `version`
- return provider metadata that can be written or replayed if persistence fails

## Persistence Contract

`Persist Derived Rows` should:

- update `document_chunks.embedding`
- update `document_chunks.embedding_model`
- keep `organizationId` and `sourceRecordId` unchanged
- preserve `chunkHash`
- set stale rows inactive if a newer version has replaced them
- record provider response metadata or a structured failure snapshot before the workflow exits

## Failure Rules

- Never write a vector before the provider returns it.
- Never let provider failure produce a false `completed` state.
- If a database write fails after a successful provider call, preserve the provider response in the error path for replay.
- Never mark a job complete after only the first chunk in a bundle succeeds.
