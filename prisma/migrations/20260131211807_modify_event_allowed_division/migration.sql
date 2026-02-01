/*
  Warnings:

  - You are about to drop the `event_allowed_division` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "event_allowed_division" DROP CONSTRAINT "event_allowed_division_division_id_fkey";

-- DropForeignKey
ALTER TABLE "event_allowed_division" DROP CONSTRAINT "event_allowed_division_event_id_fkey";

-- DropTable
DROP TABLE "event_allowed_division";

-- CreateTable
CREATE TABLE "EventAllowedDivision" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "divisionTypeId" INTEGER NOT NULL,

    CONSTRAINT "EventAllowedDivision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventAllowedDivision_eventId_divisionTypeId_key" ON "EventAllowedDivision"("eventId", "divisionTypeId");

-- AddForeignKey
ALTER TABLE "EventAllowedDivision" ADD CONSTRAINT "EventAllowedDivision_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAllowedDivision" ADD CONSTRAINT "EventAllowedDivision_divisionTypeId_fkey" FOREIGN KEY ("divisionTypeId") REFERENCES "division_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
