-- Resource document ingestion fields introduced by the admin document workflow.
-- Apply this migration only to the intended application database.
ALTER TABLE "resources"
  ADD COLUMN "resource_type" TEXT NOT NULL DEFAULT 'link',
  ADD COLUMN "attachment_name" TEXT,
  ADD COLUMN "attachment_mime_type" TEXT,
  ADD COLUMN "attachment_size_bytes" INTEGER,
  ADD COLUMN "attachment_status" TEXT,
  ADD COLUMN "attachment_error" TEXT;
