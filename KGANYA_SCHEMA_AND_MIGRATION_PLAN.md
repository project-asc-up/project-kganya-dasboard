# Kganya Schema And Migration Plan

## Decision

Build a new Kganya-native backend schema.

Treat the ASC-era tables as import sources only.

Keep the current UI behavior stable and move the structural change into the backend.

## What the schema must support

- UP support content from `kganya-operating-system/knowledge-base/`
- row-based evaluation data and gold sets
- tenant isolation with Clerk org context
- source editing in the UI
- derived `pgvector` retrieval
- sync, approval, and reindex visibility
- future Chatwoot mapping

## Source families to support

- Markdown knowledge articles
- structured CSV rows
- spreadsheet row imports
- analysis notes and competitor notes
- evaluation questions and question clusters
- KPI thresholds and baseline values
- source inventory records
- source citations and origin links

## Target tables

### `organizations`

Purpose:
- canonical tenant record

Key columns:
- `id`
- `clerk_org_id`
- `name`
- `slug`
- `status`
- `created_at`
- `updated_at`

### `knowledge_sources`

Purpose:
- source inventory and lineage root

Key columns:
- `id`
- `organization_id`
- `source_key`
- `source_family`
- `source_type`
- `title`
- `canonical_ref`
- `original_uri`
- `original_path`
- `status`
- `last_verified_at`
- `created_at`
- `updated_at`

### `source_records`

Purpose:
- editable canonical content rows

Key columns:
- `id`
- `organization_id`
- `knowledge_source_id`
- `record_key`
- `topic`
- `source_kind`
- `title`
- `body_markdown`
- `body_json`
- `source_url`
- `source_anchor`
- `version`
- `status`
- `active`
- `checksum`
- `created_by`
- `created_at`
- `updated_at`

Notes:
- `body_markdown` holds normalized text for unstructured sources.
- `body_json` holds structured row payloads when needed.
- `record_key` keeps row-level documents distinct under the same source.

### `source_record_fields`

Purpose:
- flexible row-level field normalization for structured sources

Key columns:
- `id`
- `source_record_id`
- `field_name`
- `field_value`
- `field_type`
- `field_order`
- `is_key`
- `created_at`
- `updated_at`

### `document_chunks`

Purpose:
- derived retrieval chunks only

Key columns:
- `id`
- `organization_id`
- `knowledge_source_id`
- `source_record_id`
- `version`
- `chunk_index`
- `chunk_type`
- `source_family`
- `topic`
- `title`
- `section_path`
- `chunk_text`
- `chunk_hash`
- `embedding`
- `embedding_model`
- `active`
- `retired_at`
- `created_at`
- `updated_at`

Recommended indexes:
- `organization_id`
- `(organization_id, knowledge_source_id, active)`
- `(organization_id, topic, active)`
- `(organization_id, source_record_id, version, chunk_index)` unique
- vector index on `embedding`

### `ingestion_jobs`

Purpose:
- track import, normalization, chunking, embedding, retirement, retry

Key columns:
- `id`
- `organization_id`
- `knowledge_source_id`
- `source_record_id`
- `job_type`
- `state`
- `input_checksum`
- `output_checksum`
- `error_message`
- `retry_count`
- `started_at`
- `finished_at`
- `created_at`
- `updated_at`

### `prompt_packs`

Purpose:
- tenant-specific behavior and response shaping

Key columns:
- `id`
- `organization_id`
- `name`
- `channel`
- `system_prompt`
- `style_prompt`
- `fallback_prompt`
- `active`
- `version`
- `created_at`
- `updated_at`

### `evaluation_sets`

Purpose:
- groups gold set definitions and regression tracking

Key columns:
- `id`
- `organization_id`
- `name`
- `source_name`
- `status`
- `created_at`
- `updated_at`

### `evaluation_cases`

Purpose:
- gold questions and expected answer traits

Key columns:
- `id`
- `evaluation_set_id`
- `prompt_text`
- `expected_category`
- `expected_answer_trait`
- `expected_source_key`
- `expected_chunk_hint`
- `status`
- `created_at`
- `updated_at`

### `chatwoot_org_links`

Purpose:
- map orgs to Chatwoot accounts/inboxes

Key columns:
- `id`
- `organization_id`
- `chatwoot_account_id`
- `chatwoot_inbox_id`
- `channel`
- `active`
- `created_at`
- `updated_at`

## Knowledge-base file mapping

- `knowledge-base/*.md` -> `knowledge_sources`, `source_records`, `document_chunks`
- `source_inventory.csv` -> `knowledge_sources`, `source_records`, `source_record_fields`
- `faq_gold_set.csv` -> `source_records`, `source_record_fields`, `evaluation_sets`, `evaluation_cases`
- `question_clusters.csv` -> `source_records`, `source_record_fields`, `evaluation_sets`, `evaluation_cases`
- `kpi_baseline_and_thresholds.csv` -> `source_records`, `source_record_fields`, `retrieval_metrics`
- `complaint_theme_log.csv` -> `source_records`, `source_record_fields`

## Vector schema rules

- `document_chunks` is the only retrieval table.
- All chunks must carry `organization_id`.
- All chunks must carry lineage back to `knowledge_sources` and `source_records`.
- Stale chunks must remain stored but not retrievable.
- `embedding` remains derived and model-specific.
- `embedding` may stay null until the embedding writer is active.
- The vector layer should favor a single pilot table until scale proves otherwise.
- When the webhook dispatcher is ready, queued jobs should hand off to n8n or the vector writer without changing the canonical source-record model.

## Migration sequence

### Phase 1 - Add new tables

- Create `organizations`.
- Create `knowledge_sources`.
- Create `source_records`.
- Create `source_record_fields`.
- Create `document_chunks`.
- Create `ingestion_jobs`.
- Create `prompt_packs`.
- Create `evaluation_sets`.
- Create `evaluation_cases`.
- Create `chatwoot_org_links`.

### Phase 2 - Import legacy ASC data

- Map ASC tables into the new source model only for migration.
- Preserve lineage, but do not keep the ASC schema as the product schema.

### Phase 3 - Import Kganya knowledge-base content

- Ingest markdown docs as normalized source records.
- Ingest CSV files as source inventory, evaluation, or structured row data.
- Generate derived chunks from normalized source records.
- Seed ingestion jobs so pending embedding work is visible immediately.
- Keep vector insertion pending until the embedding dispatch path is finalized.

### Phase 4 - Cut the app over

- Keep the UI contract stable.
- Point reads and writes at the new backend tables.
- Keep temporary adapters only until the cutover is verified.

### Phase 5 - Retire legacy tables

- Archive ASC-era tables after the new schema is populated and verified.
- Remove them only when the app no longer depends on them.

## What not to do

- Do not design the schema around the old ASC tables.
- Do not let retrieval read from UI tables.
- Do not make `pgvector` editable truth.
- Do not duplicate tenant keys.
- Do not change the UI unless the backend contract forces it.

For the concrete source-by-source import path, see [KGANYA_BACKFILL_MAP.md](C:/Users/sewar/repos/Project%20Kganya/project-kganya-dasboard/KGANYA_BACKFILL_MAP.md).
