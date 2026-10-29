/*
  Warnings:

  - Added the required column `type` to the `verification_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VerificationTokenType" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET');

-- CreateEnum
CREATE TYPE "PollStatus" AS ENUM ('ACTIVE', 'CLOSED', 'ARCHIVED', 'DELETED');

-- CreateEnum
CREATE TYPE "PollReportStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "PollReportReason" AS ENUM ('SPAM', 'HARASSMENT', 'HATE_OR_ABUSE', 'SEXUAL_CONTENT', 'VIOLENCE', 'MISINFORMATION', 'OTHER');

-- AlterTable
ALTER TABLE "polls" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by_id" TEXT,
ADD COLUMN     "deletion_note" TEXT,
ADD COLUMN     "status" "PollStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "verification_tokens" ADD COLUMN     "type" "VerificationTokenType" NOT NULL;

-- CreateTable
CREATE TABLE "poll_reports" (
    "id" TEXT NOT NULL,
    "poll_id" TEXT NOT NULL,
    "reporter_id" TEXT,
    "reason" "PollReportReason" NOT NULL,
    "details" TEXT,
    "status" "PollReportStatus" NOT NULL DEFAULT 'OPEN',
    "reviewed_by_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "resolution_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "poll_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actor_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "note" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "poll_reports_status_created_at_idx" ON "poll_reports"("status", "created_at");

-- CreateIndex
CREATE INDEX "poll_reports_reporter_id_idx" ON "poll_reports"("reporter_id");

-- CreateIndex
CREATE UNIQUE INDEX "poll_reports_poll_id_reporter_id_key" ON "poll_reports"("poll_id", "reporter_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_created_at_idx" ON "audit_logs"("actor_id", "created_at");

-- CreateIndex
CREATE INDEX "polls_status_created_at_idx" ON "polls"("status", "created_at");

-- AddForeignKey
ALTER TABLE "polls" ADD CONSTRAINT "polls_deleted_by_id_fkey" FOREIGN KEY ("deleted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_reports" ADD CONSTRAINT "poll_reports_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_reports" ADD CONSTRAINT "poll_reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_reports" ADD CONSTRAINT "poll_reports_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
