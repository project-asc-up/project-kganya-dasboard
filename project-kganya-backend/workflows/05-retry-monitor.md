# 05 Retry Monitor

## Purpose

Scan failed and retryable jobs, apply the retry policy from structured failure metadata, and move eligible work back into the queue.

This workflow is the recovery path. It should not be mixed into the intake or normalization workflows.

## Trigger

- `Cron`
- Recommended cadence: every 5 minutes

## Inputs

- `ingestion_jobs` rows where:
  - `state = 'failed'` or `state = 'retrying'`
  - `retryCount` is below the configured ceiling
  - `failureCategory` is retryable
  - `nextRetryAt` is due or missing

## Outputs

- Requeued jobs
- Updated `retryCount`
- Failure snapshots for jobs that remain blocked

## Node List

1. `Cron Trigger`
2. `Load Retry Candidates`
3. `Classify Retry Metadata`
4. `Requeue Eligible Jobs`
5. `Build Retry Summary`
6. `Error Handler`

## Edge Map

| From | To | Condition |
|---|---|---|
| `Cron Trigger` | `Load Retry Candidates` | always |
| `Load Retry Candidates` | `Classify Retry Metadata` | query succeeds |
| `Load Retry Candidates` | `Error Handler` | query fails |
| `Classify Retry Metadata` | `Requeue Eligible Jobs` | retryable jobs found |
| `Classify Retry Metadata` | `Build Retry Summary` | no retryable jobs found |
| `Requeue Eligible Jobs` | `Build Retry Summary` | requeue succeeds |
| `Requeue Eligible Jobs` | `Error Handler` | requeue fails |

## Retry Contract

`Requeue Eligible Jobs` should:

- increment `retryCount`
- set `state = 'queued'`
- clear transient retry routing only after a successful retry decision
- preserve `organizationId`, `knowledgeSourceId`, and `sourceRecordId`
- key the decision from `failureCode`, `failureCategory`, and `nextRetryAt`
- use backoff and a hard max retry ceiling

## Failure Rules

- Do not retry signature or schema failures.
- Do not retry tenant-resolution failures without a fresh dispatch.
- Do not retry by substring-matching `errorMessage`.
- Do not loop forever; cap the retries and surface the blocked job.
