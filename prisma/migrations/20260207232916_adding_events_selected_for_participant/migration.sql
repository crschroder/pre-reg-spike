-- CreateTable
CREATE TABLE "participant_event" (
    "id" SERIAL NOT NULL,
    "participant_id" INTEGER NOT NULL,
    "event_id" INTEGER NOT NULL,

    CONSTRAINT "participant_event_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "participant_event" ADD CONSTRAINT "participant_event_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participant_event" ADD CONSTRAINT "participant_event_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
