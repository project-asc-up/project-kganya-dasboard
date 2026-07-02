-- CreateTable
CREATE TABLE "auth_users" (
    "id" UUID NOT NULL,
    "university_id" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "auth_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_users_university_id_key" ON "auth_users"("university_id");

-- CreateIndex
CREATE INDEX "auth_users_created_at_idx" ON "auth_users"("created_at");
