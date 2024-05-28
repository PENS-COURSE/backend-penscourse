/*
  Warnings:

  - You are about to drop the column `expired_at` on the `certificates` table. All the data in the column will be lost.
  - You are about to drop the column `hash_url` on the `certificates` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "QuizType" AS ENUM ('final', 'daily');

-- AlterTable
ALTER TABLE "certificates" DROP COLUMN "expired_at",
DROP COLUMN "hash_url",
ADD COLUMN     "total_duration" INTEGER;

-- CreateTable
CREATE TABLE "certificate_scores" (
    "id" SERIAL NOT NULL,
    "certificate_id" INTEGER NOT NULL,
    "quiz_type" "QuizType" NOT NULL,
    "score" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certificate_scores_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "certificate_scores" ADD CONSTRAINT "certificate_scores_certificate_id_fkey" FOREIGN KEY ("certificate_id") REFERENCES "certificates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
