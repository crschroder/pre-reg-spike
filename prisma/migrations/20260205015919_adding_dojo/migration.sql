-- AlterTable
ALTER TABLE "participant" ADD COLUMN     "dojo_id" INTEGER,
ADD COLUMN     "other_dojo_name" TEXT;

-- CreateTable
CREATE TABLE "dojo" (
    "id" SERIAL NOT NULL,
    "dojo_name" TEXT NOT NULL,
    "city" TEXT NOT NULL,

    CONSTRAINT "dojo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "participant" ADD CONSTRAINT "participant_dojo_id_fkey" FOREIGN KEY ("dojo_id") REFERENCES "dojo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
