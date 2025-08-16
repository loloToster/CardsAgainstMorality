-- CreateTable
CREATE TABLE "Activity" (
    "id" SERIAL NOT NULL,
    "path" TEXT NOT NULL,
    "referer" TEXT,
    "country_code" TEXT,
    "region_name" TEXT,
    "city" TEXT,
    "mobile" BOOLEAN,
    "os" TEXT,
    "browser" TEXT,
    "device" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);
