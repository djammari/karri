-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "VisitType" AS ENUM ('INTAKE', 'REHAB', 'NOTE');

-- CreateEnum
CREATE TYPE "Progress" AS ENUM ('BETTER', 'STABLE', 'WORSE', 'UNRATED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'SENT');

-- CreateEnum
CREATE TYPE "EmailProvider" AS ENUM ('RESEND', 'MOCK');

-- CreateEnum
CREATE TYPE "BookingSource" AS ENUM ('SESAMI', 'SHOPIFY', 'MANUAL');

-- CreateEnum
CREATE TYPE "WebhookSource" AS ENUM ('SHOPIFY', 'SESAMI');

-- CreateTable
CREATE TABLE "owners" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kennitala" TEXT,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "postalCode" TEXT,
    "city" TEXT,
    "notes" TEXT,
    "shopifyCustomerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "owners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dogs" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "breed" TEXT NOT NULL,
    "sex" "Sex" NOT NULL DEFAULT 'UNKNOWN',
    "birthDate" TIMESTAMP(3),
    "weightKg" DOUBLE PRECISION,
    "color" TEXT,
    "chipNumber" TEXT,
    "insurance" TEXT,
    "vetName" TEXT,
    "vetPhone" TEXT,
    "activity" TEXT,
    "diagnoses" TEXT,
    "medications" TEXT,
    "allergies" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visits" (
    "id" TEXT NOT NULL,
    "dogId" TEXT NOT NULL,
    "bookingId" TEXT,
    "type" "VisitType" NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER,
    "findings" TEXT,
    "assessment" TEXT,
    "treatmentNotes" TEXT,
    "homeRecommendations" TEXT,
    "nextVisitNotes" TEXT,
    "progress" "Progress" NOT NULL DEFAULT 'UNRATED',
    "treatments" JSONB,
    "intake" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_reports" (
    "id" TEXT NOT NULL,
    "dogId" TEXT NOT NULL,
    "visitId" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "fields" JSONB NOT NULL,
    "extraNotes" TEXT,
    "sentAt" TIMESTAMP(3),
    "sentToEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_logs" (
    "id" TEXT NOT NULL,
    "reportId" TEXT,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "html" TEXT,
    "provider" "EmailProvider" NOT NULL,
    "providerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "sesamiBookingId" TEXT,
    "shopifyCustomerId" TEXT,
    "ownerId" TEXT,
    "dogId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT,
    "customerPhone" TEXT,
    "serviceId" TEXT,
    "serviceName" TEXT NOT NULL,
    "resourceId" TEXT,
    "resourceName" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "timeZone" TEXT DEFAULT 'Atlantic/Reykjavik',
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "tags" TEXT,
    "source" "BookingSource" NOT NULL DEFAULT 'SESAMI',
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" TEXT NOT NULL,
    "source" "WebhookSource" NOT NULL,
    "topic" TEXT NOT NULL,
    "shopDomain" TEXT,
    "payload" JSONB NOT NULL,
    "hmacValid" BOOLEAN NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "owners_shopifyCustomerId_key" ON "owners"("shopifyCustomerId");

-- CreateIndex
CREATE INDEX "owners_email_idx" ON "owners"("email");

-- CreateIndex
CREATE INDEX "owners_phone_idx" ON "owners"("phone");

-- CreateIndex
CREATE INDEX "dogs_ownerId_idx" ON "dogs"("ownerId");

-- CreateIndex
CREATE INDEX "dogs_name_idx" ON "dogs"("name");

-- CreateIndex
CREATE UNIQUE INDEX "visits_bookingId_key" ON "visits"("bookingId");

-- CreateIndex
CREATE INDEX "visits_dogId_occurredAt_idx" ON "visits"("dogId", "occurredAt");

-- CreateIndex
CREATE INDEX "medical_reports_dogId_idx" ON "medical_reports"("dogId");

-- CreateIndex
CREATE INDEX "email_logs_reportId_idx" ON "email_logs"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_sesamiBookingId_key" ON "bookings"("sesamiBookingId");

-- CreateIndex
CREATE INDEX "bookings_startsAt_idx" ON "bookings"("startsAt");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_ownerId_idx" ON "bookings"("ownerId");

-- CreateIndex
CREATE INDEX "webhook_events_source_createdAt_idx" ON "webhook_events"("source", "createdAt");

-- AddForeignKey
ALTER TABLE "dogs" ADD CONSTRAINT "dogs_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "owners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_dogId_fkey" FOREIGN KEY ("dogId") REFERENCES "dogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_reports" ADD CONSTRAINT "medical_reports_dogId_fkey" FOREIGN KEY ("dogId") REFERENCES "dogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_reports" ADD CONSTRAINT "medical_reports_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "visits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "medical_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "owners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_dogId_fkey" FOREIGN KEY ("dogId") REFERENCES "dogs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

