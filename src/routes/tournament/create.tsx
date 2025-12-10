// src/routes/tournaments/create.tsx
import CreateTournament from "@/components/Create/CreateTournament";
import { createFileRoute } from "@tanstack/react-router";


export const Route = createFileRoute("/tournament/create")({
  component: TournamentCreatePage,
});

function TournamentCreatePage() {
  return <CreateTournament tournamentId={undefined} />;  
}
