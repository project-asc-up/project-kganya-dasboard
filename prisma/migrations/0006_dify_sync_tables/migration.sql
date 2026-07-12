-- Durable Dify ingestion state used by resource detail pages and sync workers.
CREATE TABLE IF NOT EXISTS "dify_sync_map" (
    "source_table" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "dify_document_id" TEXT,
    "sync_status" TEXT NOT NULL DEFAULT 'pending',
    "last_synced_at" TIMESTAMPTZ(6),
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "dify_sync_map_pkey" PRIMARY KEY ("source_table", "source_id")
);

CREATE INDEX IF NOT EXISTS "dify_sync_map_sync_status_idx"
  ON "dify_sync_map"("sync_status");

CREATE TABLE IF NOT EXISTS "dify_sync_jobs" (
    "id" UUID NOT NULL,
    "source_table" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "sync_action" TEXT NOT NULL,
    "content_kind" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "payload" JSONB,
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "next_retry_at" TIMESTAMPTZ(6),
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "dify_sync_jobs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "dify_sync_jobs_status_next_retry_at_idx"
  ON "dify_sync_jobs"("status", "next_retry_at");

CREATE INDEX IF NOT EXISTS "dify_sync_jobs_source_table_source_id_idx"
  ON "dify_sync_jobs"("source_table", "source_id");

CREATE INDEX IF NOT EXISTS "dify_sync_jobs_sync_action_idx"
  ON "dify_sync_jobs"("sync_action");
