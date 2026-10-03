
import { TournamentSummary } from '@/components/Organizer/TournamentSummary'
import { createFileRoute } from '@tanstack/react-router'
import { RequireAllowedEmail } from '@/auth/RequireAllowedEmail'

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
  component: RequireAllowedEmail(RouteComponent),
})

function RouteComponent() {
  const { id: tournamentId } = Route.useParams()
  return <TournamentSummary tournamentId={tournamentId} />
}