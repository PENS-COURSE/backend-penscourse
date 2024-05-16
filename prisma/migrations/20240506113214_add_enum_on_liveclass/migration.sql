-- CreateEnum
CREATE TYPE "StatusLiveClass" AS ENUM ('pending', 'ongoing', 'ended');

-- AlterTable
ALTER TABLE "live_classes" ADD COLUMN     "status" "StatusLiveClass" NOT NULL DEFAULT 'pending';
