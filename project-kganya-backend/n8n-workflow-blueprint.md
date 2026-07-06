# Kganya n8n Export Blueprint

> Legacy reference only. The active implementation is split across `workflows/*.md` and `exports/*.json`.

## Purpose

This file preserves the legacy single-flow blueprint that preceded the split workflow design.
It is no longer the active build plan.

## Current Build Sources

- [backend-contract.md](./backend-contract.md)
- [payload-spec.md](./payload-spec.md)
- [workflow-connections.md](./workflow-connections.md)
- [workflow-architecture.md](./workflow-architecture.md)
- [import-checklist.md](./import-checklist.md)
- [exports/01-intake-and-queue.json](./exports/01-intake-and-queue.json)
- [exports/02-normalize-and-chunk-worker.json](./exports/02-normalize-and-chunk-worker.json)
- [exports/03-embed-and-persist-worker.json](./exports/03-embed-and-persist-worker.json)
- [exports/04-status-api.json](./exports/04-status-api.json)
- [exports/05-retry-monitor.json](./exports/05-retry-monitor.json)

## What This Blueprint Used To Represent

The old single-flow design chained webhook intake, validation, normalization, embedding, persistence, acknowledgement, and error handling inside one execution.

That shape was replaced because:

- intake needed to be faster
- worker failure isolation mattered
- retry handling needed to be bounded
- status reads needed a separate operator path
- `organizationId` and source-lineage checks had to stay explicit in every handoff

## What To Use Instead

If you are building or importing Kganya now:

1. read the split workflow docs
2. use the split JSON exports
3. prepare the placeholders in `import-checklist.md`
4. treat this file as historical context only

## Do Not Recreate The Monolith

- Do not rebuild the legacy `Kganya Backend Dispatch` workflow from this blueprint.
- Do not use this file as the source for current node names or edge maps.
- Do not treat this as more current than the split workflow docs.
