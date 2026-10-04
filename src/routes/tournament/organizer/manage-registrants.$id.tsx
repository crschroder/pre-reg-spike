import { ParticipantSummary } from '@/components/Organizer/ParticipantSummmary'
import { createFileRoute } from '@tanstack/react-router'
import { RequireAllowedEmail } from '@/auth/RequireAllowedEmail'

export const Route = createFileRoute(
  '/tournament/organizer/manage-registrants/$id',
)({
  component: RequireAllowedEmail(RouteComponent, ['organizer', 'admin']),
})

function RouteComponent() {
  const { id } = Route.useParams()
  return <ParticipantSummary tournamentId={Number(id)} />
}
