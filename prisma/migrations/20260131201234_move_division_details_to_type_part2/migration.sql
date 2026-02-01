/*
  Warnings:

  - You are about to drop the column `max_age` on the `division` table. All the data in the column will be lost.
  - You are about to drop the column `min_age` on the `division` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `division` table. All the data in the column will be lost.
  - Made the column `division_type_id` on table `division` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "division" DROP CONSTRAINT "division_division_type_id_fkey";

-- AlterTable
ALTER TABLE "division" DROP COLUMN "max_age",
DROP COLUMN "min_age",
DROP COLUMN "name",
ALTER COLUMN "division_type_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "division" ADD CONSTRAINT "division_division_type_id_fkey" FOREIGN KEY ("division_type_id") REFERENCES "division_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
