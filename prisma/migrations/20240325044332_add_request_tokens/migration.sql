-- CreateEnum
CREATE TYPE "RequestTokenType" AS ENUM ('send_certificate');

-- CreateTable
CREATE TABLE "request_tokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "type" "RequestTokenType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "request_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "request_tokens_token_key" ON "request_tokens"("token");
