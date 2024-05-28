-- CreateEnum
CREATE TYPE "CertificateType" AS ENUM ('competence', 'presence');

-- CreateTable
CREATE TABLE "certificates" (
    "id" SERIAL NOT NULL,
    "no_cert" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "course_id" INTEGER,
    "type" "CertificateType" NOT NULL,
    "hash_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
