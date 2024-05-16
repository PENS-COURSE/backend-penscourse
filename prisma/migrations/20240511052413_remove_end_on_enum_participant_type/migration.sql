/*
  Warnings:

  - The values [end] on the enum `ActivityParticipantType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ActivityParticipantType_new" AS ENUM ('join', 'disconnect');
ALTER TABLE "participant_logs" ALTER COLUMN "activity_type" TYPE "ActivityParticipantType_new" USING ("activity_type"::text::"ActivityParticipantType_new");
ALTER TYPE "ActivityParticipantType" RENAME TO "ActivityParticipantType_old";
ALTER TYPE "ActivityParticipantType_new" RENAME TO "ActivityParticipantType";
DROP TYPE "ActivityParticipantType_old";
COMMIT;
