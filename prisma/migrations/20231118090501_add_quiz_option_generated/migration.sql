-- CreateTable
CREATE TABLE "quiz_option_generated" (
    "quiz_id" UUID NOT NULL,
    "easy" INTEGER NOT NULL,
    "medium" INTEGER NOT NULL,
    "hard" INTEGER NOT NULL,

    CONSTRAINT "quiz_option_generated_pkey" PRIMARY KEY ("quiz_id")
);

-- AddForeignKey
ALTER TABLE "quiz_option_generated" ADD CONSTRAINT "quiz_option_generated_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
