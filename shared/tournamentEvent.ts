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