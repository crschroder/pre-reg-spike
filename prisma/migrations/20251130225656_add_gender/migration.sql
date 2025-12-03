/*
  Warnings:

  - Added the required column `gender_id` to the `event_division` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "event_division" ADD COLUMN     "gender_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "event_gender" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "event_gender_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "event_division" ADD CONSTRAINT "event_division_gender_id_fkey" FOREIGN KEY ("gender_id") REFERENCES "event_gender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
