// src/routes/tournaments/create.tsx
import CreateTournament from "@/components/Create/CreateTournament";
import { createFileRoute } from "@tanstack/react-router";


export const Route = createFileRoute("/tournament/organizer/create")({
  component: TournamentCreatePage,
});

function TournamentCreatePage() {
  console.log("Rendering TournamentCreatePage");
  return <CreateTournament tournamentId={undefined} />;  
}
