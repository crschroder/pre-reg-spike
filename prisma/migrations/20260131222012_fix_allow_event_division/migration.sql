/*
  Warnings:

  - You are about to drop the `EventAllowedDivision` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EventAllowedDivision" DROP CONSTRAINT "EventAllowedDivision_divisionTypeId_fkey";

-- DropForeignKey
ALTER TABLE "EventAllowedDivision" DROP CONSTRAINT "EventAllowedDivision_eventId_fkey";

-- DropTable
DROP TABLE "EventAllowedDivision";

-- CreateTable
CREATE TABLE "event_allowed_division" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "division_type_id" INTEGER NOT NULL,

    CONSTRAINT "event_allowed_division_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_allowed_division_event_id_division_type_id_key" ON "event_allowed_division"("event_id", "division_type_id");

-- AddForeignKey
ALTER TABLE "event_allowed_division" ADD CONSTRAINT "event_allowed_division_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_allowed_division" ADD CONSTRAINT "event_allowed_division_division_type_id_fkey" FOREIGN KEY ("division_type_id") REFERENCES "division_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
