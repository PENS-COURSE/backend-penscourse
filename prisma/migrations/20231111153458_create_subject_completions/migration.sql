-- CreateEnum
CREATE TYPE "SubjectCompletionType" AS ENUM ('VideoContent', 'FileContent', 'LiveClass');

-- CreateTable
CREATE TABLE "subject_completions" (
    "id" UUID NOT NULL,
    "user_id" INTEGER NOT NULL,
    "subject_id" UUID NOT NULL,
    "subject_type" "SubjectCompletionType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subject_completions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "subject_completions" ADD CONSTRAINT "subject_completions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_completions" ADD CONSTRAINT "video_contents_id" FOREIGN KEY ("subject_id") REFERENCES "video_contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_completions" ADD CONSTRAINT "file_contents_id" FOREIGN KEY ("subject_id") REFERENCES "file_contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_completions" ADD CONSTRAINT "live_classes_id" FOREIGN KEY ("subject_id") REFERENCES "live_classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
