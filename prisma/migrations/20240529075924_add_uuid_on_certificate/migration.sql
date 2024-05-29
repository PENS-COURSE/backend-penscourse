/*
  Warnings:

  - A unique constraint covering the columns `[uuid]` on the table `certificates` will be added. If there are existing duplicate values, this will fail.
  - The required column `uuid` was added to the `certificates` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropIndex
DROP INDEX "certificates_no_cert_idx";

-- AlterTable
ALTER TABLE "certificates" ADD COLUMN     "uuid" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "certificates_uuid_key" ON "certificates"("uuid");

-- CreateIndex
CREATE INDEX "certificates_no_cert_uuid_idx" ON "certificates"("no_cert", "uuid");
