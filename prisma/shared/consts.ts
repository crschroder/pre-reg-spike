export const TournamentStatus = {
  Upcoming: "upcoming",
  Past: "past",
  Open: "open",
  Closed: "closed",
} as const;

export type TournamentStatusType =
  typeof TournamentStatus[keyof typeof TournamentStatus];


export const validStatuses = Object.values(TournamentStatus);
