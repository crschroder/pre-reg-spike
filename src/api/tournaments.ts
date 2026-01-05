// src/api/tournaments.ts
import  api  from "./axios";
import { TournamentInput } from "../../prisma/shared/types";

export function getTournaments() {
  return api.get("/tournament/api/tournment/events")
    .then(res => res.data);
}

export function createTournament(data: TournamentInput) {
  return api.post("/api/tournaments", data)
    .then(res => res.data);
}

export function updateTournament(id: string, data: TournamentInput) {
  return api.put(`/api/tournaments/${id}`, data)
    .then(res => res.data);
}


export function getTournamentById(id: string) {
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