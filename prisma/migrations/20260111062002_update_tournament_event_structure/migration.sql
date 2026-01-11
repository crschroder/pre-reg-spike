/*
  Warnings:

  - You are about to drop the column `event_id` on the `event_division` table. All the data in the column will be lost.
  - You are about to drop the column `scheduled_at` on the `tournament_event` table. All the data in the column will be lost.
  - Added the required column `tournament_event_id` to the `event_division` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "event_division" DROP CONSTRAINT "event_division_event_id_fkey";

-- AlterTable
ALTER TABLE "event_division" DROP COLUMN "event_id",
ADD COLUMN     "tournament_event_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "tournament_event" DROP COLUMN "scheduled_at";

-- AddForeignKey
ALTER TABLE "event_division" ADD CONSTRAINT "event_division_tournament_event_id_fkey" FOREIGN KEY ("tournament_event_id") REFERENCES "tournament_event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
