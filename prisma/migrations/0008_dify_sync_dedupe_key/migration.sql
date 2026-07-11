ALTER TABLE "dify_sync_jobs" ADD COLUMN IF NOT EXISTS "dedupe_key" TEXT;

CREATE INDEX IF NOT EXISTS "dify_sync_jobs_dedupe_key_status_idx"
  ON "dify_sync_jobs"("dedupe_key", "status");
