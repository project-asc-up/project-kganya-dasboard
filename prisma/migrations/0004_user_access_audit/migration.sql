-- CreateTable
CREATE TABLE IF NOT EXISTS "user_access_audit_logs" (
    "id" UUID NOT NULL,
    "actor_user_id" TEXT NOT NULL,
    "actor_email" TEXT,
    "target_user_id" TEXT NOT NULL,
    "target_email" TEXT,
    "previous_role" TEXT NOT NULL,
    "new_role" TEXT NOT NULL,
    "previous_permissions" JSONB NOT NULL,
    "new_permissions" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_access_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "user_access_audit_logs_actor_user_id_idx" ON "user_access_audit_logs"("actor_user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "user_access_audit_logs_target_user_id_idx" ON "user_access_audit_logs"("target_user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "user_access_audit_logs_created_at_idx" ON "user_access_audit_logs"("created_at");
