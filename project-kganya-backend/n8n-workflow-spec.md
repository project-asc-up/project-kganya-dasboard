# Kganya n8n Backend Workflow Spec

> Legacy reference only. The active implementation is split across `workflows/*.md`, `exports/*.json`, `backend-contract.md`, and `payload-spec.md`.

## Why This File Exists

This file preserves the earlier single-flow workflow thinking for reference, but it is no longer the implementation source of truth.

## Current Source Of Truth

- [README.md](./README.md)
- [backend-contract.md](./backend-contract.md)
- [payload-spec.md](./payload-spec.md)
- [workflow-connections.md](./workflow-connections.md)
- [workflow-architecture.md](./workflow-architecture.md)
- [workflows/01-intake-and-queue.md](./workflows/01-intake-and-queue.md)
- [workflows/02-normalize-and-chunk-worker.md](./workflows/02-normalize-and-chunk-worker.md)
- [workflows/03-embed-and-persist-worker.md](./workflows/03-embed-and-persist-worker.md)
- [workflows/04-status-api.md](./workflows/04-status-api.md)
- [workflows/05-retry-monitor.md](./workflows/05-retry-monitor.md)

## What Changed

The old single-flow design has been retired in favor of five durable workflows:

1. intake and queue
2. normalize and chunk
3. embed and persist
4. status read
5. retry monitor

## What Not To Use This File For

- Do not treat it as the active build spec.
- Do not use it to derive current node names or node wiring.
- Do not use it as the import source for n8n.

## Migration Note

If you are implementing Kganya now, follow the split workflow docs and exports. Use this file only if you need to understand the legacy single-flow design that was replaced.
