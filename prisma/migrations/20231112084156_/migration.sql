/*
  Warnings:

  - You are about to drop the column `subject_id` on the `subject_completions` table. All the data in the column will be lost.
  - You are about to drop the column `subject_type` on the `subject_completions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "subject_completions" DROP COLUMN "subject_id",
DROP COLUMN "subject_type",
ADD COLUMN     "file_content_id" UUID,
ADD COLUMN     "live_class_id" UUID,
ADD COLUMN     "video_content_id" UUID;

-- DropEnum
DROP TYPE "SubjectCompletionType";

-- AddForeignKey
ALTER TABLE "subject_completions" ADD CONSTRAINT "subject_completions_live_class_id_fkey" FOREIGN KEY ("live_class_id") REFERENCES "live_classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_completions" ADD CONSTRAINT "subject_completions_file_content_id_fkey" FOREIGN KEY ("file_content_id") REFERENCES "file_contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_completions" ADD CONSTRAINT "subject_completions_video_content_id_fkey" FOREIGN KEY ("video_content_id") REFERENCES "video_contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
