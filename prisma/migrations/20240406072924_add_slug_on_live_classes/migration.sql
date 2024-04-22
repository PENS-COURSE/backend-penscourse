/*
  Warnings:

  - You are about to drop the column `end_date` on the `live_classes` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `live_classes` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `live_classes` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `live_classes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `live_classes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "live_classes" DROP COLUMN "end_date",
DROP COLUMN "start_date",
DROP COLUMN "url",
ADD COLUMN     "recording_url" TEXT,
ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "live_classes_slug_key" ON "live_classes"("slug");
