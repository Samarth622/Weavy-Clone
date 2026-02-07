/*
  Warnings:

  - Added the required column `userId` to the `Workflow` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Workflow" ADD COLUMN     "userId" TEXT NOT NULL;
