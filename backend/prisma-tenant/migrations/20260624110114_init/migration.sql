-- CreateTable
CREATE TABLE "white_label_settings" (
    "id" SERIAL NOT NULL,
    "companyName" TEXT,
    "dashboardTitle" TEXT,
    "logoUrl" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "white_label_settings_pkey" PRIMARY KEY ("id")
);
