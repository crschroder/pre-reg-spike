export type EventAllowedDivision = {
  id: number;
  name: string;
  minAge: number;
  maxAge: number;
  divisions: {
    id: number;
    divisionTypeId: number;
    beltRankId: number | null;
    beltRank: {
      id: number;
      sortOrder: number;
      rank: string;
      beltColor: string;
      disiplineId: number;
    } | null;
  }[];
};

