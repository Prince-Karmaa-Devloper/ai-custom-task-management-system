/*
  Warnings:

  - You are about to drop the `global_users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tenant_users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tenants` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `white_label_settings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "tenant_users" DROP CONSTRAINT "tenant_users_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "tenant_users" DROP CONSTRAINT "tenant_users_userId_fkey";

-- DropForeignKey
ALTER TABLE "white_label_settings" DROP CONSTRAINT "white_label_settings_tenantId_fkey";

-- DropTable
DROP TABLE "global_users";

-- DropTable
DROP TABLE "tenant_users";

-- DropTable
DROP TABLE "tenants";

-- DropTable
DROP TABLE "white_label_settings";

-- CreateTable
CREATE TABLE "super_admins" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "super_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "databaseName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "subscriptionType" TEXT NOT NULL DEFAULT 'basic',
    "subscriptionEnd" TIMESTAMP(3),
    "dbHost" TEXT NOT NULL DEFAULT 'localhost',
    "dbPort" INTEGER NOT NULL DEFAULT 5432,
    "dbUser" TEXT NOT NULL DEFAULT 'postgres',
    "dbPassword" TEXT NOT NULL DEFAULT 'root',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" INTEGER,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_audit_logs" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "performedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "global_settings" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "global_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "super_admins_email_key" ON "super_admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "companies_domain_key" ON "companies"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "companies_databaseName_key" ON "companies"("databaseName");

-- CreateIndex
CREATE UNIQUE INDEX "global_settings_key_key" ON "global_settings"("key");

-- AddForeignKey
ALTER TABLE "company_audit_logs" ADD CONSTRAINT "company_audit_logs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
