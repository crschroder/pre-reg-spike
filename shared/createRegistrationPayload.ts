export type EventSelection =
  | "kata"
  | "kumite"
  | "weapons"
  | "team"
  | number; // TournamentEventDivisionId for Phase Two

export type CreateRegistrationPayload = {
  email: string;
  userId?: number; // Optional - will be looked up or created by email
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
