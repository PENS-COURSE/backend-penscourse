-- CreateEnum
CREATE TYPE "ActivityParticipantType" AS ENUM ('join', 'disconnect', 'leave');

-- CreateTable
CREATE TABLE "participant_logs" (
    "id" SERIAL NOT NULL,
    "participant_live_class_id" INTEGER NOT NULL,
    "user_agent" TEXT,
    "activity_type" "ActivityParticipantType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "participant_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "participant_logs" ADD CONSTRAINT "participant_logs_participant_live_class_id_fkey" FOREIGN KEY ("participant_live_class_id") REFERENCES "participant_live_classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
