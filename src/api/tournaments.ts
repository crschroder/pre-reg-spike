// src/api/tournaments.ts some comment 
import  api  from "./axios";
import type {
  ParticipantUpdatePayload,
  TournamentEventPayload,
  TournamentInput,
  TournamentStatus,
  TournamentStatusType,
  DojoResponse
} from "../../shared/index";



export function getTournaments() {
  return api.get("/tournament/api/tournment/events")
    .then(res => res.data);
}

export function createTournament(data: TournamentInput) {
  return api.post("/api/tournaments", data)
    .then(res => res.data);
}

export function updateTournament(id: number, data: TournamentInput) {
  return api.put(`/api/tournaments/${id}`, data)
    .then(res => res.data);
}


export function getTournamentById(id: number) {
  return api.get(`/api/tournaments/${id}`).then(res => {
   
    return res.data;});
}

export function getEventTypes() {
  return api.get("/api/event-types")
    .then(res => {
      

      return res.data;});
}

export function getDivisionsByEventType(eventTypeId: number) {
  return api.get(`/api/event/${eventTypeId}/allowed-divisions`)
    .then(res => res.data);
}

export function createTournamentEvents(
  tournamentId: number,
  data: TournamentEventPayload
) {
  return api
    .post(`/api/tournaments/${tournamentId}/tournamentEvents`, data)
    .then(res => res.data);
}
export function updateTournamentEvents(
  tournamentId: number,
  data: TournamentEventPayload
) {
  return api
    .put(`/api/tournaments/${tournamentId}/tournamentEvents`, data)
    .then(res => res.data);
}

export function getTournamentEvents(tournamentId: number) {
  return api
    .get(`/api/tournaments/${tournamentId}/tournamentEvents`)
    .then(res => res.data);
}

export function getTournamentEventDivisions(tournamentId: number, eventId: number) {
  return api
    .get(`/api/tournaments/${tournamentId}/events/${eventId}/divisions`)
    .then(res => res.data);
}

export function saveTournamentEventDivisions(
  tournamentId: number,
  eventId: number,
  divisions: { divisionId: number; genderId: number }[]
) {
  return api
    .post(`/api/tournaments/${tournamentId}/events/${eventId}/divisions`, {
      divisions
    })
    .then(res => res.data);
}

export function getUpcomingTournaments(status?: TournamentStatusType) {
  return api.get("/api/tournaments?status=" + (status || 'upcoming'))
    .then(res => res.data);
}

export function getTournamentRegistrations(tournamentId: number) {
  return api.get(`/api/tournaments/${tournamentId}/participants`)
    .then(res => res.data);
}



export function getParticipantSummary(tournamentId: number) {
  return api.get(`/api/tournaments/${tournamentId}/participants/lite`)
    .then(res => res.data);
}

export function toggleCheckInParticipant(participantId: number, checkedIn: boolean) {
  const participantPayload: ParticipantUpdatePayload = { checkedIn };
  return api.patch(`/api/participant/${participantId}`, participantPayload)
    .then(res => res.data);
}

export function togglePaidParticipant(participantId: number, paid: boolean) {
  const participantPayload: ParticipantUpdatePayload = { paid };
  return api.patch(`/api/participant/${participantId}`, participantPayload)
    .then(res => res.data);
}

export function getDojoList(): Promise<DojoResponse[]> {
  return api.get("/api/dojos")
    .then(res => res.data as DojoResponse[]);
}