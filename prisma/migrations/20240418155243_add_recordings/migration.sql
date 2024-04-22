/*
  Warnings:

  - You are about to drop the column `recording_url` on the `live_classes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "live_classes" DROP COLUMN "recording_url";

-- CreateTable
CREATE TABLE "recordings" (
    "id" UUID NOT NULL,
    "unique_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "live_class_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recordings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "recordings" ADD CONSTRAINT "recordings_live_class_id_fkey" FOREIGN KEY ("live_class_id") REFERENCES "live_classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
