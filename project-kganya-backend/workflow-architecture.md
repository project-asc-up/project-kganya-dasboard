# Workflow Architecture

## Recommended Topology

```mermaid
flowchart TB
  C["Kganya Console"] --> W1["01 Intake and Queue"]
  W1 --> DB1[("Postgres: ingestion_jobs")]

  DB1 --> W2["02 Normalize and Chunk Worker"]
  W2 --> DB2[("Postgres: document_chunks draft rows")]

  DB2 --> W3["03 Embed and Persist Worker"]
  W3 --> DB3[("Postgres: document_chunks with vectors")]
  W3 --> DB1

  C --> W4["04 Status API"]
  W4 --> DB1
  W4 --> DB3

  W5["05 Retry Monitor"] --> DB1
  W5 --> DB2
  W5 --> DB3

  W3 --> E["Embedding Provider"]
  C --> CH["Chatwoot"]
  W4 --> CH
```

## Why This Is The Better Shape

- The intake path stays short and predictable.
- Normalization and embedding become restartable workers.
- Postgres holds the durable handoff, not n8n memory.
- The status API can report reality instead of guessing from one long shared execution.
- Retry logic becomes a bounded maintenance task, not a side branch inside the critical path.
- The auth-gated status path stays separated from the hot ingest path.

## Reversal Condition

I would reconsider this split only if:

- the batch volume is so tiny that the extra workflows add more operational cost than they save, or
- the provider and database are guaranteed to stay below timeout and failure thresholds, which is unlikely for this use case.
