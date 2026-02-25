export type EventSelection =
  | "kata"
  | "kumite"
  | "weapons"
  | "team"
  | number; // TournamentEventDivisionId for Phase Two

export type CreateRegistrationPayload = {
  email: string;
  userId?: number; // Optional - will be looked up or created by email
  participant: ParticipantCreatePayload; // All participant fields except id
  events: EventSelection[];
};


 export type Participant = {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  genderId: number;
  beltRankId: number;
  notes?: string;
  dojoId?: number;
  otherDojoName?: string;
  paid?: boolean;
  checkedIn?: boolean;
  // participantEvents?: ParticipantEvent[]; // Optional, only needed for edit form
  // userEmail?: string; // Optional, only needed for edit form to show email
  // ...any other fields
};


export type ParticipantEvent = {
  id: number;
  eventId: number;
};

export type ParticipantCreatePayload = Omit<Participant, 'id' >;//| 'participantEvents'|'userEmail'> & {};

// For update: omit id, all fields optional
export type ParticipantUpdatePayload = Partial<Omit<Participant, 'id'>> & {
  events?: EventSelection[];
  email?: string; // Allow updating email as well
};