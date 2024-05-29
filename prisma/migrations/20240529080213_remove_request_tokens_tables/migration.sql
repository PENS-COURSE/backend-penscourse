/*
  Warnings:

  - You are about to drop the `request_tokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "request_tokens" DROP CONSTRAINT "request_tokens_user_id_fkey";

-- DropTable
DROP TABLE "request_tokens";

-- DropEnum
DROP TYPE "RequestTokenType";
