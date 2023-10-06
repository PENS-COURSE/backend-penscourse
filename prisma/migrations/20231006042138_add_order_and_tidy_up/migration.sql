-- CreateEnum
CREATE TYPE "PaymentStatusType" AS ENUM ('settlement', 'pending', 'expire', 'cancel', 'deny', 'refund');

-- AlterTable
ALTER TABLE "departments" ADD COLUMN     "benefits_thumbnail" TEXT,
ADD COLUMN     "opportunities_thumbnail" TEXT,
ADD COLUMN     "participant_thumbnail" TEXT;

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "total_price" INTEGER NOT NULL,
    "total_discount" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "no_order" UUID NOT NULL,
    "order_id" INTEGER NOT NULL,
    "status" "PaymentStatusType" NOT NULL DEFAULT 'pending',
    "transaction_id" TEXT NOT NULL,
    "payment_method" TEXT NOT NULL,
    "payment_type" TEXT NOT NULL,
    "gross_amount" DOUBLE PRECISION NOT NULL,
    "va_numbers_bank" TEXT,
    "va_numbers_va" TEXT,
    "expiry_time" TEXT,
    "actions" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "user_id" INTEGER NOT NULL,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_no_order_key" ON "payments"("no_order");

-- CreateIndex
CREATE UNIQUE INDEX "payments_order_id_key" ON "payments"("order_id");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
