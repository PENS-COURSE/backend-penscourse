/*
  Warnings:

  - You are about to drop the column `is_passed` on the `quiz_sessions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "quiz_sessions" DROP COLUMN "is_passed",
ALTER COLUMN "score" DROP NOT NULL;
