# Backend Contract

## System Boundary

The backend sits between the Kganya console and the derived retrieval infrastructure.

The current implementation is split across five durable workflows:

1. intake and queue
2. normalize and chunk
3. embed and persist
4. status read
5. retry monitor

### Inputs

- pending dispatch batches from the console
- normalized source records
- row-level source fields
- derived document chunks
- organization metadata
- source lineage and checksums

### Outputs

- job acknowledgements
- queued / completed / failed state changes
- normalized chunk records
- embedding request payloads
- embedding completion results
- status and error summaries
- audit events for traceability

## Canonical Source Of Truth

- `organizations`
- `knowledge_sources`
- `source_records`
- `source_record_fields`
- `ingestion_jobs` for lifecycle state

## Derived Data

- `document_chunks`
- embeddings
- evaluation metrics

## Required Request Shapes

### 1. Dispatch batch request

Purpose:
- ask the backend to process a bounded set of pending Kganya jobs

Required fields:
- `batchId`
- `source`
- `generatedAt`
- `jobCount`
- `jobs[]`
- `checksum`

### 2. Job item

Required fields:
- `jobId`
- `organization`
- `knowledgeSource`
- `sourceRecord`
- `chunkCount`

### 3. Acknowledgement response

Required fields:
- `batchId`
- `received`
- `acceptedCount`
- `rejectedCount`
- `duplicateCount`
- `queuedCount`
- `completedCount`
- `failedCount`
- `errors[]`
- `checksum`

## State Machine

1. `pending`
2. `queued`
3. `processing`
4. `completed`
5. `failed`
6. `retrying`

Rules:

- `pending` means the console has prepared the job but the backend has not accepted it yet.
- `queued` means the backend accepted it and it is waiting on the worker path.
- `processing` means the backend is actively producing derived output.
- `completed` means the chunk or embedding output was written successfully.
- `failed` means the backend needs human review or a retry policy.
- `retrying` means the retry monitor has scheduled the job back into the queue.

## Idempotency

Every job must be idempotent by:

- `organization_id`
- `batch_id`
- `knowledge_source_id`
- `source_record_id`
- `record_key`
- `version`
- `chunk_hash`

The backend must treat repeated dispatches as a refresh, not a duplicate create.

## Lineage Rules

- Every derived row must point back to the source record that created it.
- Every job acknowledgement must include the same organization context that entered the backend.
- Every failure must preserve enough source context to replay the job later.
- Retry decisions must preserve `failureCode`, `failureCategory`, and `nextRetryAt` when present.
