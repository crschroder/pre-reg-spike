// // prisma/mappers/divisionMapper.ts
// import { mapBeltRank } from "./beltRankMapper";
// import type { BeltRank as PrismaBeltRank } from "@prisma/client";
// import type { Division as DomainDivision } from "../division";

// // This matches what your API actually returns for `ad.division`
// type DivisionWithPrismaBeltRank = {
//   id: number;
//   name: string;
//   minAge: number | null;
//   maxAge: number | null;
//   beltRankId: number | null;
//   beltRank: PrismaBeltRank | null;
//   divisionTypeId: number | null;
// };

// export function mapDivision(d: DivisionWithPrismaBeltRank): DomainDivision {
//   return {
//     id: d.id,
//     name: d.name,
//     minAge: d.minAge,
//     maxAge: d.maxAge,
//     beltRankId: d.beltRankId,
//     divisionTypeId: d.divisionTypeId,
//     beltRank: d.beltRank ? mapBeltRank(d.beltRank) : null,
//   };
// }

// export function mapDivisions(
//   divisions: Array<DivisionWithPrismaBeltRank>,
// ): Array<DomainDivision> {
//   return divisions.map(mapDivision);
// }