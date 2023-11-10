/*
  Warnings:

  - You are about to drop the column `access_token` on the `session_logins` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token_expires` on the `session_logins` table. All the data in the column will be lost.
  - Added the required column `expired_at` to the `session_logins` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "session_logins_access_token_key";

-- DropIndex
DROP INDEX "session_logins_refresh_token_key";

-- AlterTable
ALTER TABLE "session_logins" DROP COLUMN "access_token",
DROP COLUMN "refresh_token_expires",
ADD COLUMN     "expired_at" TIMESTAMP(3) NOT NULL;
