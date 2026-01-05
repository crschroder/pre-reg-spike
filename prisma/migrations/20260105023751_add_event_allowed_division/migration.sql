-- CreateTable
CREATE TABLE "event_allowed_division" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "divisionId" INTEGER NOT NULL,

    CONSTRAINT "event_allowed_division_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_allowed_division_eventId_divisionId_key" ON "event_allowed_division"("eventId", "divisionId");

-- AddForeignKey
ALTER TABLE "event_allowed_division" ADD CONSTRAINT "event_allowed_division_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_allowed_division" ADD CONSTRAINT "event_allowed_division_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "division"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
