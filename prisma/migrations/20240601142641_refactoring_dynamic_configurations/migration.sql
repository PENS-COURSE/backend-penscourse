/*
  Warnings:

  - You are about to drop the column `key` on the `dynamic_configurations` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `dynamic_configurations` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `dynamic_configurations` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `dynamic_configurations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `dynamic_configurations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `dynamic_configurations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "dynamic_configurations" DROP COLUMN "key",
DROP COLUMN "type",
DROP COLUMN "value",
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "dynamic_configuration_values" (
    "id" SERIAL NOT NULL,
    "dynamic_configuration_id" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dynamic_configuration_values_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dynamic_configurations_slug_key" ON "dynamic_configurations"("slug");

-- AddForeignKey
ALTER TABLE "dynamic_configuration_values" ADD CONSTRAINT "dynamic_configuration_values_dynamic_configuration_id_fkey" FOREIGN KEY ("dynamic_configuration_id") REFERENCES "dynamic_configurations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
