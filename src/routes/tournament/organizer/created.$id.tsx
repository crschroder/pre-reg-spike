import CreateTournament from '@/components/Create/CreateTournament'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/tournament/organizer/created/$id')({
  params: {
    parse: (params) => ({
      id: Number(params.id),
    }),
    stringify: (params) => ({
      id: String(params.id),
    }),
  },
  component: TournamentCreatedPage,
})

function TournamentCreatedPage() {
  console.log("Rendering TournamentCreatedPage");
  const { id } = Route.useParams();
  return <CreateTournament tournamentId={id} />;  
}