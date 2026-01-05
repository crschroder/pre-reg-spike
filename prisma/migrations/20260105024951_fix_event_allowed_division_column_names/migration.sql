/*
  Warnings:

  - You are about to drop the column `divisionId` on the `event_allowed_division` table. All the data in the column will be lost.
  - You are about to drop the column `eventId` on the `event_allowed_division` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[event_id,division_id]` on the table `event_allowed_division` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `division_id` to the `event_allowed_division` table without a default value. This is not possible if the table is not empty.
  - Added the required column `event_id` to the `event_allowed_division` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "event_allowed_division" DROP CONSTRAINT "event_allowed_division_divisionId_fkey";

-- DropForeignKey
ALTER TABLE "event_allowed_division" DROP CONSTRAINT "event_allowed_division_eventId_fkey";

-- DropIndex
DROP INDEX "event_allowed_division_eventId_divisionId_key";

-- AlterTable
ALTER TABLE "event_allowed_division" DROP COLUMN "divisionId",
DROP COLUMN "eventId",
ADD COLUMN     "division_id" INTEGER NOT NULL,
ADD COLUMN     "event_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "event_allowed_division_event_id_division_id_key" ON "event_allowed_division"("event_id", "division_id");

-- AddForeignKey
ALTER TABLE "event_allowed_division" ADD CONSTRAINT "event_allowed_division_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_allowed_division" ADD CONSTRAINT "event_allowed_division_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "division"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
