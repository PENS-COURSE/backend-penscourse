/*
  Warnings:

  - A unique constraint covering the columns `[week]` on the table `curriculums` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
CREATE SEQUENCE curriculums_week_seq;
ALTER TABLE "curriculums" ALTER COLUMN "week" SET DEFAULT nextval('curriculums_week_seq');
ALTER SEQUENCE curriculums_week_seq OWNED BY "curriculums"."week";

-- CreateIndex
CREATE UNIQUE INDEX "curriculums_week_key" ON "curriculums"("week");
