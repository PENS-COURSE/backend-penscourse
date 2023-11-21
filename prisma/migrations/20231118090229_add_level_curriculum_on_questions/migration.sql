/*
  Warnings:

  - Added the required column `level` to the `questions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Level" AS ENUM ('easy', 'medium', 'hard');

-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "curriculum_id" UUID,
ADD COLUMN     "level" "Level" NOT NULL;

-- CreateTable
CREATE TABLE "session_questions" (
    "quiz_session_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "session_questions_pkey" PRIMARY KEY ("quiz_session_id","question_id")
);

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_curriculum_id_fkey" FOREIGN KEY ("curriculum_id") REFERENCES "curriculums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_questions" ADD CONSTRAINT "session_questions_quiz_session_id_fkey" FOREIGN KEY ("quiz_session_id") REFERENCES "quiz_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_questions" ADD CONSTRAINT "session_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
