export type TournamentEventSummary = {
  tournamentName: string;
  tournamentId: number;
  events: EventSummary[];
};

export type EventSummary = {
    eventCode: string;
    eventType: string;
  divisionName: string;
  beltColor: string;
  gender: string;
  minAge: number;
  maxAge: number;
  beltRankOrder: number;
  eventOrder: number;
}

// ...existing code...

export type TournamentEventWithEvent = {
  id: number;
  tournamentId: number;
  eventId: number;
  event: {
    id: number;
    name: string;
    sortOrder: number;    
  };
};

