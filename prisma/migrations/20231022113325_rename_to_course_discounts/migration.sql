/*
  Warnings:

  - You are about to drop the `product_discounts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "product_discounts" DROP CONSTRAINT "product_discounts_course_id_fkey";

-- DropTable
DROP TABLE "product_discounts";

-- CreateTable
CREATE TABLE "course_discounts" (
    "course_id" INTEGER NOT NULL,
    "discount_price" DOUBLE PRECISION NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "course_discounts_course_id_key" ON "course_discounts"("course_id");

-- AddForeignKey
ALTER TABLE "course_discounts" ADD CONSTRAINT "course_discounts_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
