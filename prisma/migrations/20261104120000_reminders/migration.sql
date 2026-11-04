-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "telegramChatId" TEXT;
ALTER TABLE "Booking" ADD COLUMN "reminderHourSent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Booking" ADD COLUMN "reminderFiveSent" BOOLEAN NOT NULL DEFAULT false;
