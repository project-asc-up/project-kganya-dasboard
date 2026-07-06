# Kganya Alignment Plan

## Decision

Keep the existing Vercel console and Neon Postgres stack, but align the code to the Kganya operating system instead of rewriting the plan to fit the code.

The current UI is a useful head start. The repo is not the product plan yet.

## Current choice

The repo currently behaves like a working ASC-style admin console with mixed auth and legacy data tables.

That is good enough to keep.

It is not good enough to scale into the Kganya OS without a deliberate alignment pass.

## Better alternatives

1. Rebuild the console from scratch around the Kganya schema.
   - Too slow.
   - Throws away a working Vercel/Neon surface.
   - High risk for little gain.
2. Keep the current UI and slowly rename things in place.
   - Fast in the short term.
   - Bad at the boundaries.
   - Leaves auth and tenant identity inconsistent.
3. Keep the console, but force it to conform to the Kganya source-of-truth model.
   - Best balance.
   - Preserves momentum.
   - Makes future ingestion, retrieval, and Chatwoot work predictable.

## What matters most here

- Tenant isolation must be hard.
- Auth must resolve organization context once and consistently.
- Postgres must remain the editable source of truth.
- `pgvector` must stay derived.
- The console must become a source-management surface, not just a legacy CRUD admin.
- The repo should support the operating system plan, not improvise a new one.

## Tradeoffs

- Keeping the current app saves time, but only if we normalize the model now.
- Keeping both `org_id` and `organization_id` creates long-term ambiguity and will leak into every phase.
- Clerk org auth is the right long-term boundary because it matches the operating model and the channel/account structure.
- A full rewrite would be cleaner on paper but worse for speed to pilot and easier to stall.

## Recommendation

Standardize the repo on one tenant concept, then refactor the current console to fit the OS.

Recommended canonical shape:

- `organization_id` for app code, UI, and integration boundaries
- one migration path for any old `org_id` usage
- no new features built against the split naming

Why this is the better choice:

- It matches Clerk language.
- It matches the multi-tenant operating model.
- It makes Chatwoot account mapping easier later.
- It reduces cognitive load for every future phase.

For the concrete table-by-table version of this plan, see [KGANYA_SCHEMA_AND_MIGRATION_PLAN.md](C:/Users/sewar/repos/Project%20Kganya/project-kganya-dasboard/KGANYA_SCHEMA_AND_MIGRATION_PLAN.md).

## UI Stability Constraint

The current UI should keep its editing and collection behavior.

Do not redesign the console surface just to satisfy the new schema.

What stays stable:

- existing admin pages
- current form layout and field editing patterns
- search, filters, and table-style editing behavior
- current user workflows for collecting and updating content

What changes underneath:

- backend data model
- Prisma schema
- migration scripts
- source normalization
- vector derivation
- tenant resolution
- sync/reindex state

That means the UI can continue to feel familiar while the database becomes Kganya-native behind the scenes.

## Target Backend Shape

The current ASC-era tables are legacy import sources only.

They should not define the target schema.

The Kganya backend should be designed around the content in `kganya-operating-system/knowledge-base/` and the operational needs of the UP support pilot.

Target data layers:

- `organizations`
  - canonical tenant table
  - maps Clerk org context to app-owned tenant metadata
- `knowledge_sources`
  - file, URL, or imported record identity
  - tracks original file path, remote URL, source family, and ownership
- `source_records`
  - editable source-of-truth rows
  - stores normalized content, title, topic, source type, status, and version
- `source_record_fields`
  - row-level normalized fields for structured sources and row-docs
  - keeps each CSV row or spreadsheet row explorable without flattening everything into one blob
- `document_chunks`
  - retrieval-only chunks produced from source records
  - indexed for `pgvector`
- `ingestion_jobs`
  - tracks normalization, chunking, embedding, retirement, and retry state
- `evaluation_sets`
  - stores test-set groupings, expected hits, and regression metrics
- `evaluation_cases`
  - stores individual gold questions and expected answer traits
- `prompt_packs`
  - tenant-specific prompt and formatting settings
- `chatwoot_org_links`
  - maps organization identity to Chatwoot account/inbox references

Current legacy tables such as faculties, programmes, modules, resources, and faqs should be treated as one-time import sources. They do not define the long-term schema boundary.

If the current UI still needs to read or edit those shapes during migration, the backend can expose temporary adapters. But those adapters are migration scaffolding, not permanent architecture.

## Knowledge Base-Native Model

The new schema should directly support the content families in the knowledge base:

- registration
- module changes
- fees
- payments and refunds
- accommodation and residence placement
- admissions and application status
- NSFAS and funding
- bursaries and scholarships
- student portal and access
- programmes and modules
- academic calendar
- examinations, results, and graduation
- complaints and escalation
- competitor pricing and market notes

It should also support:

- gold-set evaluation questions
- question clusters
- KPI thresholds
- source inventory records
- source notes and citations

That means the schema needs to be general enough for both knowledge articles and row-based evaluation data, without forcing the current ASC categories to remain the design center.

## Migration Plan

### Phase 0 - Lock the contract

- Freeze the canonical tenant key as `organization_id`.
- Freeze Clerk as the auth boundary.
- Freeze Postgres as the editable source of truth.
- Freeze `pgvector` as derived only.
- Freeze the UI behavior so the front-end stays functionally stable.

### Phase 1 - Add the new canonical tables

- Introduce `organizations`.
- Introduce `source_records`.
- Introduce `source_record_fields` if structured row editing needs flexible column storage.
- Introduce `ingestion_jobs`.
- Introduce `prompt_packs`.
- Introduce `chatwoot_org_links`.

This phase should not remove the old tables.

### Phase 2 - Add the derived vector layer

- Introduce `document_chunks` with `organization_id`, lineage fields, versioning, active/stale state, and embeddings.
- Add indexes for org filtering, source replacement, active retrieval, and vector search.
- Keep the embedding dimension provider-specific until the model is locked.

### Phase 3 - Backfill from the current schema

- Backfill existing faculties, coaches, programmes, modules, resources, and faqs into the new source-record model.
- Preserve source lineage and origin references.
- Preserve the current UI fields by mapping them to the new backend tables.
- Backfill `document_chunks` from the normalized source bodies.
- In parallel, ingest the knowledge-base markdown, CSV, and analysis files into the same canonical schema.
- Treat the knowledge-base folder as the product-shaping source of truth, not a sidecar.

### Phase 4 - Dual-write only if needed

- If a partial cutover is required, let the backend write to both old and new shapes temporarily.
- Keep the UI talking to the same endpoints if possible.
- Use server-side translation so the UI contract does not change during the backend migration.

### Phase 5 - Cut reads over to the new model

- Switch read paths to `source_records` and `document_chunks`.
- Keep legacy tables available only as backfill or compatibility sources.
- Verify counts, referential integrity, and retrieval quality before deprecating anything.

### Phase 6 - Deprecate legacy tables

- Mark ASC-era tables as transitional or archived once the new model is proven.
- Remove only after the console, ingestion pipeline, and retrieval path no longer depend on them.

## Why this order

- It protects the UI from churn.
- It reduces migration risk.
- It gives the backend a clean target before the cutover.
- It keeps the plan aligned with the operating system instead of improvising a new app model.

## What I would not do

- I would not keep shipping features on top of mixed auth.
- I would not let the legacy ASC schema become the permanent Kganya schema.
- I would not make retrieval depend on the console tables.
- I would not introduce a second tenant model just to avoid a migration.
- I would not rename the plan to match the current codebase.

## Step adjustment plan

### Step 1 - Position the wedge

Status: conceptually complete, but the wording should be tightened around UP Student Support and the first pilot conversion.

Adjustment:

- Keep the buyer and wedge.
- Keep the pilot-to-subscription trigger.
- Make the KPIs explicit in the repo docs.

### Step 2 - Package the pilot

Status: mostly complete in planning.

Adjustment:

- Keep the commercial package.
- Keep the support-deflection and response-time goal.
- Do not expand the scope until the console and ingestion path are aligned.

### Step 3 - Map the data universe

Status: partially complete, but the repo still carries legacy table concepts.

Adjustment:

- Define one canonical tenant key.
- Separate source records from derived retrieval chunks.
- Mark structured row sources and Markdown-normalized unstructured sources differently.
- Stop treating the legacy admin schema as the final domain model.

### Step 4 - Build the ingestion pipeline

Status: incomplete and still the first real bridge between plan and code.

Adjustment:

- Add source-record normalization.
- Add Markdown-first conversion for unstructured sources.
- Add row-level normalization for structured sources.
- Add replace/update behavior with versioning and retirement.
- Add job state and visibility so reindexing is auditable.

### Step 5 - Build retrieval core

Status: active in the OS and still incomplete.

Adjustment:

- Keep the derived chunk table as the retrieval source.
- Enforce org-first filtering.
- Keep `active`/version filtering explicit.
- Add an embedding dispatch bridge so queued Kganya batches can move to n8n before the vector write path is fully live.
- Add an evaluation set before claiming retrieval is trustworthy.

### Step 6 - Build the staff console

Status: the UI already exists, but the repo is not yet aligned to the Kganya source-record model.

Adjustment:

- Turn the console into the editing surface for source records.
- Put Clerk org context at the center.
- Show sync, approval, and reindex status.
- Remove the old ASC-specific mental model from the UI.

### Step 7 - Connect Chatwoot

Status: not ready until Step 6 is aligned.

Adjustment:

- Map orgs to Chatwoot accounts.
- Keep the conversation boundary separate from the source-of-truth boundary.
- Do not connect Chatwoot directly to legacy console tables.

### Step 8 - Create the answer loop

Status: blocked by Steps 4 to 7.

Adjustment:

- Route questions through retrieval, prompt packs, and answer formatting.
- Keep human fallback explicit.
- Measure answer quality against the evaluation set.

### Step 9 - Prove ROI

Status: future.

Adjustment:

- Track support deflection.
- Track response-time reduction.
- Track pilot conversion readiness.

### Step 10 - Convert pilot to platform

Status: future.

Adjustment:

- Lock the repeatable platform shape only after the UP pilot proves the loop.
- Keep the system multi-tenant from day one.

## Recommended next step

Do not add more surface area yet.

The next step is:

1. Normalize tenant identity and auth.
2. Refactor the current console to the Kganya source-record model.
3. Then complete Step 4 and Step 5 data-path work against that model.

If we skip this bridge, every later phase will inherit the wrong shape and become expensive to undo.
