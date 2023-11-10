/*
  Warnings:

  - You are about to drop the column `access_token_expires` on the `session_logins` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[refresh_token]` on the table `session_logins` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[access_token]` on the table `session_logins` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "session_logins" DROP COLUMN "access_token_expires";

-- CreateIndex
CREATE UNIQUE INDEX "session_logins_refresh_token_key" ON "session_logins"("refresh_token");

-- CreateIndex
CREATE UNIQUE INDEX "session_logins_access_token_key" ON "session_logins"("access_token");
