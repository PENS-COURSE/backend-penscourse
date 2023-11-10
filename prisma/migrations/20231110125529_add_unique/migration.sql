/*
  Warnings:

  - A unique constraint covering the columns `[refresh_token]` on the table `session_logins` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "session_logins_refresh_token_key" ON "session_logins"("refresh_token");
