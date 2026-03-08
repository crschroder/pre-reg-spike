
import { TournamentSummary } from '@/components/Organizer/TournamentSummary';
import { createFileRoute, useNavigate } from '@tanstack/react-router'
export const Route = createFileRoute(
  '/tournament/organizer/tournamentSummary/$id',
)({
    params: {
    parse: (params) => ({
      id: Number(params.id),
    }),
    stringify: (params) => ({
      id: String(params.id),
    }),
  },
  component: RouteComponent,
})

function RouteComponent() {
   
    const { id: tournamentId } = Route.useParams(); 
    return (<TournamentSummary tournamentId={tournamentId} />)

}