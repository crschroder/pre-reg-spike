/*
  Warnings:

  - You are about to drop the column `beltRank` on the `Division` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Division" DROP COLUMN "beltRank",
ADD COLUMN     "beltRankId" INTEGER;

-- CreateTable
CREATE TABLE "BeltRank" (
    "id" SERIAL NOT NULL,
    "rank" TEXT NOT NULL,
    "beltColor" TEXT NOT NULL,
    "disiplineId" INTEGER NOT NULL,

    CONSTRAINT "BeltRank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Disipline" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Disipline_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Division" ADD CONSTRAINT "Division_beltRankId_fkey" FOREIGN KEY ("beltRankId") REFERENCES "BeltRank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeltRank" ADD CONSTRAINT "BeltRank_disiplineId_fkey" FOREIGN KEY ("disiplineId") REFERENCES "Disipline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
