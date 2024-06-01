/*
  Warnings:

  - Changed the type of `type` on the `dynamic_configuration_values` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "DynamicConfigurationType" AS ENUM ('string', 'number', 'boolean');

-- AlterTable
ALTER TABLE "dynamic_configuration_values" DROP COLUMN "type",
ADD COLUMN     "type" "DynamicConfigurationType" NOT NULL;

-- CreateIndex
CREATE INDEX "dynamic_configurations_title_idx" ON "dynamic_configurations"("title");
