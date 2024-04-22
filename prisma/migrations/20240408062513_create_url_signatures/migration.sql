-- CreateTable
CREATE TABLE "url_signatures" (
    "id" UUID NOT NULL,
    "data" JSONB NOT NULL,
    "signature" TEXT NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "expired_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "url_signatures_pkey" PRIMARY KEY ("id")
);
