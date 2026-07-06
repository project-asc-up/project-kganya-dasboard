# Project Kganya Backend

This folder defines the n8n-backed backend automation layer for Kganya.

The active design is split into multiple workflows so the console can acknowledge quickly while the heavy normalization, embedding, persistence, status, and retry work stays restartable and operationally simple.

## Purpose

- Keep the console focused on editing and collection.
- Keep the backend focused on orchestration, validation, normalization, retrieval prep, and acknowledgements.
- Make the contract between the app and n8n explicit enough that a builder can implement it without guessing.

## What This Backend Must Do

1. Receive a batch of pending Kganya jobs from the app.
2. Validate tenant identity and source lineage.
3. Queue jobs durably in Postgres.
4. Normalize source records and row-level fields.
5. Produce or refresh derived document chunks.
6. Dispatch embedding work to the configured model.
7. Record job state transitions in Postgres.
8. Return structured acknowledgements, counts, failures, and status snapshots.

## What It Must Not Do

- It must not treat vector rows as the source of truth.
- It must not bypass organization scoping.
- It must not mutate legacy ASC tables as the primary backend contract.
- It must not invent payload fields that are not documented in the contract.

## Active Workflow Set

- [01 Intake and Queue](workflows/01-intake-and-queue.md)
- [02 Normalize and Chunk Worker](workflows/02-normalize-and-chunk-worker.md)
- [03 Embed and Persist Worker](workflows/03-embed-and-persist-worker.md)
- [04 Status API](workflows/04-status-api.md)
- [05 Retry Monitor](workflows/05-retry-monitor.md)
- [Workflow Connections](workflow-connections.md)
- [Workflow Architecture](workflow-architecture.md)

## Reference Docs

- [Backend Contract](backend-contract.md)
- [Payload Spec](payload-spec.md)
- [n8n Workflow Spec](n8n-workflow-spec.md)
- [n8n Export Blueprint](n8n-workflow-blueprint.md)
- [Import Checklist](import-checklist.md)
- [Integrations](integrations.md)
- [Operational Rules](operations.md)

## Export Scaffolds

- [01 Intake and Queue export](exports/01-intake-and-queue.json)
- [02 Normalize and Chunk Worker export](exports/02-normalize-and-chunk-worker.json)
- [03 Embed and Persist Worker export](exports/03-embed-and-persist-worker.json)
- [04 Status API export](exports/04-status-api.json)
- [05 Retry Monitor export](exports/05-retry-monitor.json)
- [Legacy export reference](n8n-workflow-export.json)

## Build Order

1. Lock the request and response payloads.
2. Define the intake queue boundary, batch idempotency key, and ack shape.
3. Define the worker split for normalization, embedding, and persistence.
4. Define the atomic claim rules and draft-row lifecycle.
5. Define the status and retry paths, including auth and structured retry metadata.
6. Define the Postgres read/write points.
7. Define the external integrations and secrets.
8. Implement and test the automation in n8n.
