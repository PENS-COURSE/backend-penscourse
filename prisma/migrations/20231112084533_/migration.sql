/*
  Warnings:

  - The primary key for the `subject_completions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `subject_completions` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "subject_completions" DROP CONSTRAINT "subject_completions_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "subject_completions_pkey" PRIMARY KEY ("id");
