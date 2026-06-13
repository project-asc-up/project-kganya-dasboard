-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "CoachLevel" AS ENUM ('UNDERGRADUATE', 'POSTGRADUATE', 'BOTH', 'UNKNOWN');

-- CreateTable
CREATE TABLE "faculties" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "code_status" TEXT NOT NULL,
    "official_page_url" TEXT,
    "support_page_url" TEXT,
    "source_url" TEXT,
    "last_verified" DATE,
    "notes" TEXT,
    "aliases" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faculties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asc_coaches" (
    "id" UUID NOT NULL,
    "faculty_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "title_role" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "cell" TEXT,
    "office_location" TEXT,
    "building" TEXT,
    "appointment_link" TEXT,
    "level" "CoachLevel" NOT NULL DEFAULT 'UNKNOWN',
    "cluster" TEXT,
    "responsibilities" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "source_url" TEXT,
    "last_verified" DATE,
    "verification_status" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asc_coaches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programmes" (
    "id" UUID NOT NULL,
    "faculty_id" UUID NOT NULL,
    "source_faculty_code" TEXT,
    "programme_code" TEXT NOT NULL,
    "programme_name" TEXT NOT NULL,
    "degree_name" TEXT,
    "academic_level" TEXT,
    "qualification_type" TEXT,
    "programme_credits" INTEGER,
    "duration_years" INTEGER,
    "year_levels" TEXT,
    "source_file" TEXT,
    "last_verified" DATE,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programmes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses_modules" (
    "id" UUID NOT NULL,
    "programme_id" UUID NOT NULL,
    "faculty_code" TEXT,
    "source_faculty_code" TEXT,
    "programme_code" TEXT NOT NULL,
    "programme_name" TEXT,
    "year_level_raw" TEXT NOT NULL,
    "year_level_sort" INTEGER,
    "module_code" TEXT NOT NULL,
    "module_name" TEXT,
    "module_type" TEXT NOT NULL,
    "module_units" INTEGER NOT NULL,
    "source_file" TEXT,
    "last_verified" DATE,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" UUID NOT NULL,
    "seed_key" TEXT NOT NULL,
    "faculty_id" UUID,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "source_url" TEXT,
    "last_verified" DATE,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" UUID NOT NULL,
    "seed_key" TEXT NOT NULL,
    "faculty_id" UUID,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" INTEGER,
    "source_url" TEXT,
    "last_verified" DATE,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "faculties_code_key" ON "faculties"("code");

-- CreateIndex
CREATE INDEX "asc_coaches_faculty_id_idx" ON "asc_coaches"("faculty_id");

-- CreateIndex
CREATE INDEX "asc_coaches_email_idx" ON "asc_coaches"("email");

-- CreateIndex
CREATE UNIQUE INDEX "asc_coaches_faculty_id_email_key" ON "asc_coaches"("faculty_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "programmes_programme_code_key" ON "programmes"("programme_code");

-- CreateIndex
CREATE INDEX "programmes_faculty_id_idx" ON "programmes"("faculty_id");

-- CreateIndex
CREATE INDEX "programmes_programme_name_idx" ON "programmes"("programme_name");

-- CreateIndex
CREATE INDEX "courses_modules_programme_id_idx" ON "courses_modules"("programme_id");

-- CreateIndex
CREATE INDEX "courses_modules_programme_code_idx" ON "courses_modules"("programme_code");

-- CreateIndex
CREATE INDEX "courses_modules_year_level_sort_idx" ON "courses_modules"("year_level_sort");

-- CreateIndex
CREATE INDEX "courses_modules_module_code_idx" ON "courses_modules"("module_code");

-- CreateIndex
CREATE UNIQUE INDEX "courses_modules_programme_id_year_level_raw_module_code_mod_key" ON "courses_modules"("programme_id", "year_level_raw", "module_code", "module_type", "module_units");

-- CreateIndex
CREATE UNIQUE INDEX "resources_seed_key_key" ON "resources"("seed_key");

-- CreateIndex
CREATE INDEX "resources_faculty_id_idx" ON "resources"("faculty_id");

-- CreateIndex
CREATE INDEX "resources_category_idx" ON "resources"("category");

-- CreateIndex
CREATE UNIQUE INDEX "faqs_seed_key_key" ON "faqs"("seed_key");

-- CreateIndex
CREATE INDEX "faqs_faculty_id_idx" ON "faqs"("faculty_id");

-- CreateIndex
CREATE INDEX "faqs_category_idx" ON "faqs"("category");

-- CreateIndex
CREATE INDEX "faqs_priority_idx" ON "faqs"("priority");

-- AddForeignKey
ALTER TABLE "asc_coaches" ADD CONSTRAINT "asc_coaches_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programmes" ADD CONSTRAINT "programmes_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses_modules" ADD CONSTRAINT "courses_modules_programme_id_fkey" FOREIGN KEY ("programme_id") REFERENCES "programmes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculties"("id") ON DELETE SET NULL ON UPDATE CASCADE;
