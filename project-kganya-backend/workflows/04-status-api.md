# 04 Status API

## Purpose

Expose a read-only status endpoint for the console so operators can inspect batch, job, and record health without touching the worker workflows.

If this stays in n8n, it must authenticate the caller and verify the tenant before any query. If the console backend already owns auth cleanly, this endpoint is a better fit there.

## Trigger

- `Webhook`
- `GET /kganya/backend/status`

## Inputs

- Query params such as:
  - `organizationId`
  - `batchId`
  - `sourceRecordId`
  - `state`
  - `page`
  - `pageSize`
- Auth header or signed console token mapped to the caller's organization

## Outputs

- Job counts by state
- Retry counts
- Failure codes and categories
- Latest source record lineage and chunk status
- Page-limited detail rows for the console

## Node List

1. `Webhook Trigger`
2. `Verify Auth`
3. `Build Status Filter`
4. `Fetch Status Snapshot`
5. `Build Response`
6. `Respond To Webhook`
7. `Error Handler`

## Edge Map

| From | To | Condition |
|---|---|---|
| `Webhook Trigger` | `Verify Auth` | always |
| `Verify Auth` | `Build Status Filter` | caller is authenticated |
| `Verify Auth` | `Error Handler` | caller is unauthenticated |
| `Build Status Filter` | `Fetch Status Snapshot` | filter valid |
| `Build Status Filter` | `Error Handler` | filter invalid |
| `Fetch Status Snapshot` | `Build Response` | query succeeds |
| `Fetch Status Snapshot` | `Error Handler` | query fails |
| `Build Response` | `Respond To Webhook` | always |
| `Error Handler` | `Respond To Webhook` | always |

## Snapshot Contract

The response should include:

- totals by `ingestion_jobs.state`
- `retryCount` distribution
- latest `failureCode`, `failureCategory`, and `errorMessage` per failed job
- recent `sourceRecordId` lineage and chunk status samples
- `organizationId` scoped results only
- paginated detail rows, never unbounded scans

## Failure Rules

- Never return data across organization boundaries.
- Never return unbounded results.
- Never accept `organizationId` without auth verification.
- Use pagination if the console needs detail rows.
