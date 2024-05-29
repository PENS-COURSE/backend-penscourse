/*
  Warnings:

  - The values [send_certificate] on the enum `RequestTokenType` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `data` to the `request_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expired_at` to the `request_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `request_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RequestTokenType_new" AS ENUM ('download_certificate');
ALTER TABLE "request_tokens" ALTER COLUMN "type" TYPE "RequestTokenType_new" USING ("type"::text::"RequestTokenType_new");
ALTER TYPE "RequestTokenType" RENAME TO "RequestTokenType_old";
ALTER TYPE "RequestTokenType_new" RENAME TO "RequestTokenType";
DROP TYPE "RequestTokenType_old";
COMMIT;

-- AlterTable
ALTER TABLE "request_tokens" ADD COLUMN     "data" JSONB NOT NULL,
ADD COLUMN     "expired_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "request_tokens" ADD CONSTRAINT "request_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
