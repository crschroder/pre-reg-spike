-- AlterTable
ALTER TABLE "belt_rank" ADD COLUMN     "sort_order" INTEGER NOT NULL DEFAULT 0;


-- update the sort_order for existing belt ranks
UPDATE "belt_rank" SET "sort_order" = id; 