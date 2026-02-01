-- AlterTable
ALTER TABLE "division" ADD COLUMN     "division_type_id" INTEGER;

-- CreateTable
CREATE TABLE "division_type" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "min_age" INTEGER,
    "max_age" INTEGER,

    CONSTRAINT "division_type_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "division" ADD CONSTRAINT "division_division_type_id_fkey" FOREIGN KEY ("division_type_id") REFERENCES "division_type"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO division_type (name,min_age, max_age)
Select distinct name, min_age, max_age 
from division;

update division d
set division_type_id = dt.id
from division_type dt
where d.name = dt.name
and d.min_age = dt.min_age
and d.max_age = dt.max_age;