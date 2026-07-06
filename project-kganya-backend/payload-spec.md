# Payload Spec

## Overview

This document defines what the app sends to the backend and what the backend sends back.

The payload is intentionally verbose. Kganya needs traceability more than minimal JSON.

## Request Payload

```json
{
  "batchId": "uuid",
  "source": "kganya",
  "generatedAt": "2026-07-06T12:00:00.000Z",
  "jobCount": 1,
  "jobs": [],
  "checksum": "sha256"
}
```

## Job Item Payload

```json
{
  "jobId": "uuid",
  "organization": {
    "id": "uuid",
    "clerkOrgId": "org_...",
    "name": "UP Support",
    "slug": "up-support"
  },
  "knowledgeSource": {
    "id": "uuid",
    "sourceKey": "knowledge-base-fees",
    "sourceFamily": "fees",
    "sourceType": "markdown",
    "title": "Fees",
    "canonicalRef": "knowledge-base/fees.md",
    "originalUri": null,
    "originalPath": "knowledge-base/fees.md"
  },
  "sourceRecord": {
    "id": "uuid",
    "recordKey": "document",
    "topic": "fees",
    "sourceKind": "markdown",
    "title": "Fees",
    "bodyMarkdown": "# Fees",
    "bodyJson": {},
    "sourceUrl": null,
    "sourceAnchor": null,
    "version": 1,
    "checksum": "sha256",
    "fields": [],
    "chunks": []
  },
  "chunkCount": 1
}
```

## Response Payload

```json
{
  "batchId": "uuid",
  "received": true,
  "acceptedCount": 1,
  "rejectedCount": 0,
  "duplicateCount": 0,
  "queuedCount": 1,
  "completedCount": 0,
  "failedCount": 0,
  "errors": [],
  "checksum": "sha256"
}
```

## Payload Rules

- `batchId` must be unique per dispatch attempt.
- `checksum` must be computed from the canonical JSON payload body.
- `organization.id` must be present on every job item.
- `sourceRecord.version` must be stable within the payload.
- `chunks[].chunkHash` must represent the exact text sent for embedding or derivation.
- `duplicateCount` must reflect jobs skipped by batch idempotency.

## Payload Validation Steps

1. Validate top-level batch fields.
2. Validate organization context.
3. Validate knowledge source lineage.
4. Validate source record integrity.
5. Validate field and chunk ordering.
6. Validate chunk hashes.
7. Validate checksum before sending.

## Return Rules

The backend must reply with:

- a batch acknowledgement
- counts for accepted / rejected / duplicate / queued / completed / failed
- a list of input errors
- a checksum of the response body

The app should store the acknowledgement and use it for visibility in the console.
