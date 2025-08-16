/*
  Warnings:

  - You are about to drop the column `commonQuestions` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `commonQuestionsFormatted` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `summary` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `summaryContentType` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `summaryFormatted` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `summaryGeneratedAt` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `summaryProcessedAt` on the `Conversation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Conversation" DROP COLUMN "commonQuestions",
DROP COLUMN "commonQuestionsFormatted",
DROP COLUMN "summary",
DROP COLUMN "summaryContentType",
DROP COLUMN "summaryFormatted",
DROP COLUMN "summaryGeneratedAt",
DROP COLUMN "summaryProcessedAt";
