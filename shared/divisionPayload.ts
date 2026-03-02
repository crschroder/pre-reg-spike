export type DivisionPayload = {
  divisionId: number;
  genderId: number;
  divisionTypeId: number;
};


export type TournamentEventDivisionRow = {
  tournamentEventId: number;
  divisionId: number;
  genderId: number;  
  displayName: string;
};