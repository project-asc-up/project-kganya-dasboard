CREATE TABLE IF NOT EXISTS "mutation_receipts" (
    "id" UUID NOT NULL,
    "request_id" TEXT NOT NULL,
    "payload_hash" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "record_id" TEXT,
    "sync_job_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "result" JSONB,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "mutation_receipts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "mutation_receipts_request_id_key"
  ON "mutation_receipts"("request_id");

CREATE INDEX IF NOT EXISTS "mutation_receipts_status_idx"
  ON "mutation_receipts"("status");

CREATE INDEX IF NOT EXISTS "mutation_receipts_record_id_idx"
  ON "mutation_receipts"("record_id");
