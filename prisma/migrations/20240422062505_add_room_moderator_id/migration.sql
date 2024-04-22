-- AlterTable
ALTER TABLE "live_classes" ADD COLUMN     "room_moderator_id" INTEGER;

-- AddForeignKey
ALTER TABLE "live_classes" ADD CONSTRAINT "live_classes_room_moderator_id_fkey" FOREIGN KEY ("room_moderator_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
