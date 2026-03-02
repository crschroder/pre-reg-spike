import { useQuery } from "@tanstack/react-query";
import { 
  getDivisionsByEventType,
  
} from "../api/tournaments";
import type { Division, EventAllowedDivision } from "../../shared/index";


export function useAllowedDivisions(eventId: number) {
 return useQuery<Division[]>({
  queryKey: ["allowedDivisions", eventId],
  queryFn: async () => {
    const types = await getDivisionsByEventType(eventId);
    return flattenDivisionTypes(types);
  },
});

}

interface DivisionTypeDTO {
  id: number;
  name: string;
  minAge: number | null;
  maxAge: number | null;
  divisions: {
    id: number;
    beltRankId: number | null;
    beltRank: any; // or your shared BeltRank type
  }[];
}

export function flattenDivisionTypes(types: EventAllowedDivision[]): Division[] {
  return types.flatMap(dt =>
    dt.divisions.map(div => ({
      id: div.id,
      name: dt.name,
      minAge: dt.minAge,
      maxAge: dt.maxAge,
      beltRankId: div.beltRankId,
      beltRank: div.beltRank,
      divisionTypeId: dt.id
    }))
  ).sort((a, b) => {
      // Sort by minAge first (nulls last)
      const ageA = a.minAge ?? Number.MAX_VALUE;
      const ageB = b.minAge ?? Number.MAX_VALUE;
      if (ageA !== ageB) return ageA - ageB;

      // Then by beltRank sortOrder (nulls last)
      const sortA = a.beltRank?.sortOrder ?? Number.MAX_VALUE;
      const sortB = b.beltRank?.sortOrder ?? Number.MAX_VALUE;
      return sortA - sortB;
    });;
}


