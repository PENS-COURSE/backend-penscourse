/*
  Warnings:

  - You are about to drop the `refresh_tokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "refresh_tokens" DROP CONSTRAINT "refresh_tokens_user_id_fkey";

-- DropTable
DROP TABLE "refresh_tokens";

-- CreateTable
CREATE TABLE "session_logins" (
    "id" SERIAL NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "refresh_token_expires" TIMESTAMP(3) NOT NULL,
    "access_token_expires" TIMESTAMP(3) NOT NULL,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_logins_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "session_logins" ADD CONSTRAINT "session_logins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
