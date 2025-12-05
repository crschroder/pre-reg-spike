// shared/types.ts
import type { Prisma, Tournament, User, Event, Participant } from "@prisma/client";

// ✅ Raw entity types (DB rows)
//export type { Tournament, User, Event, Participant };

// ✅ Relation-aware types
export type TournamentWithRelations = Prisma.TournamentGetPayload<{
  include: { organizer: true; events: true; participants: true };
}>;

export type UserWithTournaments = Prisma.UserGetPayload<{
  include: { tournaments: true };
}>;


export type TournamentLight = Prisma.TournamentGetPayload<{
  include: { organizer: false; events: false; participants: false; };
}>;