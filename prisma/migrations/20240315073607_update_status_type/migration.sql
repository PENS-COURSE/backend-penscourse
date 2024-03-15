/*
  Warnings:

  - The values [PENDING,EXPIRED,PAID] on the enum `PaymentStatusType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentStatusType_new" AS ENUM ('pending', 'expired', 'paid');
ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "status" TYPE "PaymentStatusType_new" USING ("status"::text::"PaymentStatusType_new");
ALTER TYPE "PaymentStatusType" RENAME TO "PaymentStatusType_old";
ALTER TYPE "PaymentStatusType_new" RENAME TO "PaymentStatusType";
DROP TYPE "PaymentStatusType_old";
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;

-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending';
