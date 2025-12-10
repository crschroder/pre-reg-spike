import CreateTournament from '@/components/Create/CreateTournament'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/tournament/created/$tournamentId')({
  component: TournamentCreatedPage,
})

function TournamentCreatedPage() {
  const { tournamentId } = Route.useParams();
  return <CreateTournament tournamentId={tournamentId} />;  
}