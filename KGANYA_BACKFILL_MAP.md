# Kganya Backfill Map

## Purpose

This is the backend import plan for moving content into the new Kganya schema.

It keeps the UI behavior stable while the data model changes underneath.

## Source priorities

1. Kganya knowledge-base markdown files
2. Kganya CSV inventory and evaluation files
3. Legacy ASC tables only if needed for one-time import coverage

## Backfill targets

### `organizations`

Create the primary tenant row first.

For this repo, that should represent the UP support organization context used by the console.

### `knowledge_sources`

Populate one row per content source:

- markdown article
- CSV row source
- evaluation set file
- competitor analysis file
- KPI or complaint-log source

Suggested mapping:

- `knowledge-base/registration.md` -> knowledge source
- `knowledge-base/fees.md` -> knowledge source
- `knowledge-base/source_inventory.csv` -> knowledge source plus row-level `source_records`
- `knowledge-base/faq_gold_set.csv` -> knowledge source plus row-level `source_records`

### `source_records`

Create one or more canonical records per source:

- one record per markdown article
- one record per structured CSV row
- one record per evaluation item where the source is a gold question set

Rules:

- normalize markdown before storing it
- preserve the original title and topic
- use `record_key` so multiple rows can live under the same `knowledge_source`
- keep structured row payloads in `body_json` when the row is not naturally markdown
- use `body_markdown` for content that should chunk naturally

### `source_record_fields`

Use only for structured row data that benefits from column-level editing.

Good fits:

- source inventory rows
- gold-set rows
- KPI threshold rows
- complaint-theme rows

### `document_chunks`

Create derived chunks after source records are normalized.

Rules:

- chunk markdown by section and paragraph
- chunk row data by row
- include lineage back to `knowledge_sources` and `source_records`
- mark stale chunks inactive when a source version is replaced
- keep the embedding write path separate from chunk generation for now

### `evaluation_sets` and `evaluation_cases`

Backfill the evaluation corpus from:

- `faq_gold_set.csv`
- `question_clusters.csv`
- any KPI threshold or baseline files that define measurable regression targets

Use:

- `evaluation_sets` for grouped gold sets
- `evaluation_cases` for individual prompts and expected traits

### `prompt_packs`

Create one default prompt pack for the pilot organization.

This keeps the answer loop configurable without hardcoding response behavior.

### `ingestion_jobs`

Track:

- source normalization
- chunk creation
- embedding generation
- retirement of stale chunks
- retry state

Backfill behavior:

- seed one pending embedding job per normalized source record with chunks
- keep jobs idempotent so a rerun refreshes the same record instead of duplicating it
- queued jobs are the handoff point for n8n or the vector writer

## Import order

1. Create `organizations`.
2. Import `knowledge_sources`.
3. Import `source_records`.
4. Import `source_record_fields` when structured rows need field-level editing.
5. Generate `document_chunks`.
6. Import `evaluation_sets` and `evaluation_cases`.
7. Add `prompt_packs`.
8. Seed `ingestion_jobs` only if you need historical tracking for a migration run.

## Migration rules

- Do not write directly to `document_chunks` without a matching source record.
- Do not expose ASC tables as the long-term domain model.
- Do not let the UI write to legacy schema columns after the cutover begins.
- Do not drop old data until the new schema has been populated and verified.

## UI compatibility rule

The existing console should keep the same editing flow and collection behavior.

If a field used by the UI does not exist in the new schema yet, add a backend mapping layer or a temporary adapter instead of changing the UX first.
