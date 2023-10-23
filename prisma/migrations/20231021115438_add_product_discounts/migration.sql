-- CreateTable
CREATE TABLE "product_discounts" (
    "course_id" INTEGER NOT NULL,
    "discount_price" DOUBLE PRECISION NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "product_discounts_course_id_key" ON "product_discounts"("course_id");

-- AddForeignKey
ALTER TABLE "product_discounts" ADD CONSTRAINT "product_discounts_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
