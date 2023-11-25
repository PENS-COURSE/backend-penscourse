/*
  Warnings:

  - You are about to drop the column `notification_uuid` on the `notifications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "notification_uuid",
ADD COLUMN     "action_id" TEXT;
