/*
  Warnings:

  - The `answer` column on the `session_questions` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "session_questions" DROP COLUMN "answer",
ADD COLUMN     "answer" TEXT[];
