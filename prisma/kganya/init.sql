-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE "organizations" (
    "id" UUID NOT NULL,
    "clerk_org_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_sources" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "source_key" TEXT NOT NULL,
    "source_family" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "canonical_ref" TEXT,
    "original_uri" TEXT,
    "original_path" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "last_verified_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "source_records" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "knowledge_source_id" UUID NOT NULL,
    "record_key" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "source_kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body_markdown" TEXT,
    "body_json" JSONB,
    "source_url" TEXT,
    "source_anchor" TEXT,
    "version" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "checksum" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "source_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "source_record_fields" (
    "id" UUID NOT NULL,
    "source_record_id" UUID NOT NULL,
    "field_name" TEXT NOT NULL,
    "field_value" TEXT NOT NULL,
    "field_type" TEXT NOT NULL,
    "field_order" INTEGER NOT NULL,
    "is_key" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "source_record_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_chunks" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "knowledge_source_id" UUID NOT NULL,
    "source_record_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "chunk_index" INTEGER NOT NULL,
    "chunk_type" TEXT NOT NULL,
    "source_family" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "section_path" TEXT,
    "chunk_text" TEXT NOT NULL,
    "chunk_hash" TEXT NOT NULL,
    "embedding" vector,
    "embedding_model" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "retired_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingestion_jobs" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "knowledge_source_id" UUID NOT NULL,
    "source_record_id" UUID,
    "job_type" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "input_checksum" TEXT,
    "output_checksum" TEXT,
    "error_message" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMPTZ(6),
    "finished_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ingestion_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_packs" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "system_prompt" TEXT NOT NULL,
    "style_prompt" TEXT,
    "fallback_prompt" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prompt_packs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_sets" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "source_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evaluation_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_cases" (
    "id" UUID NOT NULL,
    "evaluation_set_id" UUID NOT NULL,
    "prompt_text" TEXT NOT NULL,
    "expected_category" TEXT NOT NULL,
    "expected_answer_trait" TEXT NOT NULL,
    "expected_source_key" TEXT,
    "expected_chunk_hint" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evaluation_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retrieval_metrics" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "metric_key" TEXT NOT NULL,
    "metric_value" DOUBLE PRECISION NOT NULL,
    "threshold_value" DOUBLE PRECISION,
    "observed_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "retrieval_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatwoot_org_links" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "chatwoot_account_id" TEXT NOT NULL,
    "chatwoot_inbox_id" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chatwoot_org_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_memberships" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "clerk_user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "access_audit_logs" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "actor_user_id" TEXT NOT NULL,
    "target_user_id" TEXT NOT NULL,
    "actor_email" TEXT,
    "target_email" TEXT,
    "previous_role" TEXT NOT NULL,
    "new_role" TEXT NOT NULL,
    "previous_permissions" JSONB NOT NULL,
    "new_permissions" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "access_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_clerk_org_id_key" ON "organizations"("clerk_org_id");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "knowledge_sources_organization_id_idx" ON "knowledge_sources"("organization_id");

-- CreateIndex
CREATE INDEX "knowledge_sources_source_family_idx" ON "knowledge_sources"("source_family");

-- CreateIndex
CREATE INDEX "knowledge_sources_source_type_idx" ON "knowledge_sources"("source_type");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_sources_organization_id_source_key_key" ON "knowledge_sources"("organization_id", "source_key");

-- CreateIndex
CREATE INDEX "source_records_organization_id_idx" ON "source_records"("organization_id");

-- CreateIndex
CREATE INDEX "source_records_organization_id_knowledge_source_id_record_k_idx" ON "source_records"("organization_id", "knowledge_source_id", "record_key", "active");

-- CreateIndex
CREATE INDEX "source_records_topic_idx" ON "source_records"("topic");

-- CreateIndex
CREATE INDEX "source_records_status_idx" ON "source_records"("status");

-- CreateIndex
CREATE INDEX "source_records_source_kind_idx" ON "source_records"("source_kind");

-- CreateIndex
CREATE UNIQUE INDEX "source_records_organization_id_knowledge_source_id_record_k_key" ON "source_records"("organization_id", "knowledge_source_id", "record_key", "version");

-- CreateIndex
CREATE INDEX "source_record_fields_source_record_id_field_order_idx" ON "source_record_fields"("source_record_id", "field_order");

-- CreateIndex
CREATE INDEX "source_record_fields_source_record_id_field_name_idx" ON "source_record_fields"("source_record_id", "field_name");

-- CreateIndex
CREATE INDEX "document_chunks_organization_id_idx" ON "document_chunks"("organization_id");

-- CreateIndex
CREATE INDEX "document_chunks_organization_id_knowledge_source_id_active_idx" ON "document_chunks"("organization_id", "knowledge_source_id", "active");

-- CreateIndex
CREATE INDEX "document_chunks_organization_id_topic_active_idx" ON "document_chunks"("organization_id", "topic", "active");

-- CreateIndex
CREATE INDEX "document_chunks_source_record_id_idx" ON "document_chunks"("source_record_id");

-- CreateIndex
CREATE UNIQUE INDEX "document_chunks_organization_id_source_record_id_version_ch_key" ON "document_chunks"("organization_id", "source_record_id", "version", "chunk_index");

-- CreateIndex
CREATE INDEX "ingestion_jobs_organization_id_idx" ON "ingestion_jobs"("organization_id");

-- CreateIndex
CREATE INDEX "ingestion_jobs_organization_id_knowledge_source_id_state_idx" ON "ingestion_jobs"("organization_id", "knowledge_source_id", "state");

-- CreateIndex
CREATE INDEX "ingestion_jobs_state_idx" ON "ingestion_jobs"("state");

-- CreateIndex
CREATE INDEX "prompt_packs_organization_id_idx" ON "prompt_packs"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_packs_organization_id_name_version_key" ON "prompt_packs"("organization_id", "name", "version");

-- CreateIndex
CREATE INDEX "evaluation_sets_organization_id_idx" ON "evaluation_sets"("organization_id");

-- CreateIndex
CREATE INDEX "evaluation_cases_evaluation_set_id_idx" ON "evaluation_cases"("evaluation_set_id");

-- CreateIndex
CREATE INDEX "evaluation_cases_expected_category_idx" ON "evaluation_cases"("expected_category");

-- CreateIndex
CREATE INDEX "retrieval_metrics_organization_id_idx" ON "retrieval_metrics"("organization_id");

-- CreateIndex
CREATE INDEX "retrieval_metrics_metric_key_idx" ON "retrieval_metrics"("metric_key");

-- CreateIndex
CREATE INDEX "chatwoot_org_links_organization_id_idx" ON "chatwoot_org_links"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "chatwoot_org_links_organization_id_channel_key" ON "chatwoot_org_links"("organization_id", "channel");

-- CreateIndex
CREATE INDEX "organization_memberships_email_idx" ON "organization_memberships"("email");

-- CreateIndex
CREATE UNIQUE INDEX "organization_memberships_organization_id_clerk_user_id_key" ON "organization_memberships"("organization_id", "clerk_user_id");

-- CreateIndex
CREATE INDEX "access_audit_logs_organization_id_idx" ON "access_audit_logs"("organization_id");

-- CreateIndex
CREATE INDEX "access_audit_logs_actor_user_id_idx" ON "access_audit_logs"("actor_user_id");

-- CreateIndex
CREATE INDEX "access_audit_logs_target_user_id_idx" ON "access_audit_logs"("target_user_id");

-- AddForeignKey
ALTER TABLE "knowledge_sources" ADD CONSTRAINT "knowledge_sources_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_records" ADD CONSTRAINT "source_records_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_records" ADD CONSTRAINT "source_records_knowledge_source_id_fkey" FOREIGN KEY ("knowledge_source_id") REFERENCES "knowledge_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_record_fields" ADD CONSTRAINT "source_record_fields_source_record_id_fkey" FOREIGN KEY ("source_record_id") REFERENCES "source_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_knowledge_source_id_fkey" FOREIGN KEY ("knowledge_source_id") REFERENCES "knowledge_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_source_record_id_fkey" FOREIGN KEY ("source_record_id") REFERENCES "source_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingestion_jobs" ADD CONSTRAINT "ingestion_jobs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingestion_jobs" ADD CONSTRAINT "ingestion_jobs_knowledge_source_id_fkey" FOREIGN KEY ("knowledge_source_id") REFERENCES "knowledge_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingestion_jobs" ADD CONSTRAINT "ingestion_jobs_source_record_id_fkey" FOREIGN KEY ("source_record_id") REFERENCES "source_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_packs" ADD CONSTRAINT "prompt_packs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_sets" ADD CONSTRAINT "evaluation_sets_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_cases" ADD CONSTRAINT "evaluation_cases_evaluation_set_id_fkey" FOREIGN KEY ("evaluation_set_id") REFERENCES "evaluation_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retrieval_metrics" ADD CONSTRAINT "retrieval_metrics_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatwoot_org_links" ADD CONSTRAINT "chatwoot_org_links_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_memberships" ADD CONSTRAINT "organization_memberships_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_audit_logs" ADD CONSTRAINT "access_audit_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
