-- CreateTable
CREATE TABLE "participant_live_classes" (
    "id" SERIAL NOT NULL,
    "live_class_id" UUID NOT NULL,
    "user_id" INTEGER NOT NULL,
    "duration" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "participant_live_classes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "participant_live_classes" ADD CONSTRAINT "participant_live_classes_live_class_id_fkey" FOREIGN KEY ("live_class_id") REFERENCES "live_classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participant_live_classes" ADD CONSTRAINT "participant_live_classes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
