-- CreateEnum
CREATE TYPE "RecordingStatus" AS ENUM ('pending', 'processing', 'success', 'failed');

-- AlterTable
ALTER TABLE "recordings" ADD COLUMN     "status" "RecordingStatus" NOT NULL DEFAULT 'pending';
