/*
  Warnings:

  - The primary key for the `subject_completions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `updated_at` to the `subject_completions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "subject_completions" DROP CONSTRAINT "subject_completions_pkey",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "subject_completions_pkey" PRIMARY KEY ("id");
