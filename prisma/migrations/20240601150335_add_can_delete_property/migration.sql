-- AlterTable
ALTER TABLE "dynamic_configuration_values" ADD COLUMN     "can_delete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "dynamic_configurations" ADD COLUMN     "can_delete" BOOLEAN NOT NULL DEFAULT false;
