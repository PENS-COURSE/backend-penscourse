-- CreateTable
CREATE TABLE "forgot_passwords" (
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "forgot_passwords_user_id_key" ON "forgot_passwords"("user_id");

-- AddForeignKey
ALTER TABLE "forgot_passwords" ADD CONSTRAINT "forgot_passwords_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
