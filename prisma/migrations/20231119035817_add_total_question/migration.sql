/*
  Warnings:

  - Added the required column `total_question` to the `quiz_option_generated` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "quiz_option_generated" ADD COLUMN     "total_question" INTEGER NOT NULL;
