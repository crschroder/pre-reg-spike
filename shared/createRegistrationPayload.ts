export type EventSelection =
  | "kata"
  | "kumite"
  | "weapons"
  | "team"
  | number; // TournamentEventDivisionId for Phase Two

export type CreateRegistrationPayload = {
  userId: number;
  participant: {
    firstName: string;
    lastName: string;
    age: number;
    genderId: number;
    beltRankId: number;
    notes?: string;
    dojoId?: number;
    otherDojoName?: string;
  };
  events: EventSelection[];
};
