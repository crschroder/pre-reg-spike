// prisma/mappers/beltRankMapper.ts
import { BeltRank as PrismaBeltRank } from "@prisma/client";
import { BeltRank } from "../beltRank";

export function mapBeltRank(br: PrismaBeltRank): BeltRank {
  return {
    id: br.id,
    name: br.rank,
    beltColor: br.beltColor ?? undefined,
  };
}