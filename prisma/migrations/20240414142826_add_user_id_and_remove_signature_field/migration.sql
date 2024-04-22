/*
  Warnings:

  - You are about to drop the column `signature` on the `url_signatures` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `url_signatures` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "url_signatures" DROP COLUMN "signature",
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "url_signatures" ADD CONSTRAINT "url_signatures_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
