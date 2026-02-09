/*
  Warnings:

  - You are about to drop the column `checked_id` on the `participant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "participant" DROP COLUMN "checked_id",
ADD COLUMN     "checked_in" BOOLEAN NOT NULL DEFAULT false;
