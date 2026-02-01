// prisma/mappers/divisionMapper.ts
import { BeltRank as PrismaBeltRank } from "@prisma/client";
import { Division as DomainDivision } from "../division.ts";
import { mapBeltRank } from "./beltRankMapper.ts";

// This matches what your API actually returns for `ad.division`
type DivisionWithPrismaBeltRank = {
  id: number;
  name: string;
  minAge: number | null;
  maxAge: number | null;
  beltRankId: number | null;
  beltRank: PrismaBeltRank | null;
};

export function mapDivision(d: DivisionWithPrismaBeltRank): DomainDivision {
  return {
    id: d.id,
    name: d.name,
    minAge: d.minAge,
    maxAge: d.maxAge,
    beltRankId: d.beltRankId,
    beltRank: d.beltRank ? mapBeltRank(d.beltRank) : null,
  };
}

export function mapDivisions(divisions: DivisionWithPrismaBeltRank[]): DomainDivision[] {
  return divisions.map(mapDivision);
}