/*
  Warnings:

  - Added the required column `gender_id` to the `participant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "participant" ADD COLUMN     "gender_id" INTEGER NOT NULL,
ADD COLUMN     "paid" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "tournament_event_division" RENAME CONSTRAINT "event_division_pkey" TO "tournament_event_division_pkey";

-- RenameForeignKey
ALTER TABLE "tournament_event_division" RENAME CONSTRAINT "event_division_division_id_fkey" TO "tournament_event_division_division_id_fkey";

-- RenameForeignKey
ALTER TABLE "tournament_event_division" RENAME CONSTRAINT "event_division_gender_id_fkey" TO "tournament_event_division_gender_id_fkey";

-- RenameForeignKey
ALTER TABLE "tournament_event_division" RENAME CONSTRAINT "event_division_tournament_event_id_fkey" TO "tournament_event_division_tournament_event_id_fkey";

-- AddForeignKey
ALTER TABLE "participant" ADD CONSTRAINT "participant_gender_id_fkey" FOREIGN KEY ("gender_id") REFERENCES "event_gender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
