/*
  Warnings:

  - You are about to drop the column `token` on the `forgot_passwords` table. All the data in the column will be lost.
  - Added the required column `expired_at` to the `forgot_passwords` table without a default value. This is not possible if the table is not empty.
  - Added the required column `otp` to the `forgot_passwords` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "forgot_passwords" DROP COLUMN "token",
ADD COLUMN     "expired_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "otp" TEXT NOT NULL;
