/*
  Warnings:

  - Added the required column `belt_rank_id` to the `participant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "participant" ADD COLUMN     "belt_rank_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "participant" ADD CONSTRAINT "participant_belt_rank_id_fkey" FOREIGN KEY ("belt_rank_id") REFERENCES "belt_rank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
