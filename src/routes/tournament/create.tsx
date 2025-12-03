// src/routes/tournaments/create.tsx
import CreateTournament from "@/components/Create/CreateTournament";
import { createFileRoute } from "@tanstack/react-router";


export const Route = createFileRoute("/tournament/create")({
  component: CreateTournament,
});

function TournamentCreatePage() {
  return (
     <div className="min-h-screen bg-gray-900 p-6 text-white">
    <div style={{ padding: "1rem" }}>
      <h1>Create Tournament</h1>
      <p>This is a placeholder for the tournament creation form.</p>
   
    </div>
    </div>

  );
}
