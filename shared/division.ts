

import { BeltRank } from "./beltRank.js";

export interface Division {
  id: number;
  name: string;
  minAge: number | null;
  maxAge: number | null;
  beltRankId: number | null;
  beltRank: BeltRank | null;
}