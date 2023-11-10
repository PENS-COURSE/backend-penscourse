/*
  Warnings:

  - The primary key for the `session_logins` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `session_logins` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "session_logins" DROP CONSTRAINT "session_logins_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "session_logins_pkey" PRIMARY KEY ("id");
