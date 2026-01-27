// src/api/tournaments.ts
import  api  from "./axios";
import { TournamentEventPayload, TournamentInput, TournamentStatus, TournamentStatusType } from "prisma/shared";

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
    console.log(res.data);
    return res.data;});
}

export function getEventTypes() {
  return api.get("/api/event-types")
    .then(res => {
      console.log("Fetched event types:", res.data);

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