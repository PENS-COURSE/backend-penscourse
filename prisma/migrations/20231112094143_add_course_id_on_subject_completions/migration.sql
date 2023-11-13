/*
  Warnings:

  - The primary key for the `subject_completions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `subject_completions` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `subject_completions` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `subject_completions` table. All the data in the column will be lost.
  - Added the required column `course_id` to the `subject_completions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "subject_completions" DROP CONSTRAINT "subject_completions_pkey",
DROP COLUMN "created_at",
DROP COLUMN "id",
DROP COLUMN "updated_at",
ADD COLUMN     "course_id" INTEGER NOT NULL,
ADD CONSTRAINT "subject_completions_pkey" PRIMARY KEY ("user_id", "course_id");

-- AddForeignKey
ALTER TABLE "subject_completions" ADD CONSTRAINT "subject_completions_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
