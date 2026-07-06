# Operational Rules

## Job Lifecycle

1. Console prepares pending job.
2. Console dispatches batch to n8n.
3. n8n validates and acknowledges.
4. n8n normalizes and chunks the source.
5. n8n generates embeddings.
6. n8n writes derived state to Postgres.
7. n8n marks the job completed or failed.
8. Console reads status and surfaces it to operators.

## Required Observability

- batch ID
- job ID
- organization ID
- source key
- source record key
- version
- checksum
- start time
- end time
- retry count
- failure reason

## Operational Checks

### Before Dispatch

- Validate environment variables.
- Validate organization context.
- Validate pending job count.
- Validate source record checksum.

### Before Write

- Validate chunk hashes.
- Validate stale-chunk retirement behavior.
- Validate row counts.
- Validate vector payload size.

### After Write

- Refresh job status.
- Confirm row counts.
- Confirm no cross-tenant writes.
- Confirm queue depth.

## Alert Conditions

- repeated checksum mismatches
- repeated tenant resolution failures
- embedding provider timeout spikes
- Postgres write failures
- queue growth without completion
- stale jobs older than threshold

## Human Review Gates

- new source family
- new embedding model
- schema change
- payload shape change
- Chatwoot mapping change

## Build Notes

- Keep the workflow modular.
- Keep the payload explicit.
- Keep the audit trail durable.
- Keep the backend separate from the UI.

