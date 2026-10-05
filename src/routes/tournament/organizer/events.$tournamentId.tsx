import CreateEvents from '@/components/Create/CreateEvents'
import { createFileRoute } from '@tanstack/react-router'
import { RequireAllowedEmail } from '@/auth/RequireAllowedEmail'

export const Route = createFileRoute('/tournament/organizer/events/$tournamentId')({
  params: {
    parse: (params) => ({
      tournamentId: Number(params.tournamentId),
    }),
    stringify: (params) => ({
      tournamentId: String(params.tournamentId),
    }),
  },
  component: RequireAllowedEmail(EventsCreatedPage, ['organizer', 'administrator']),
})

function EventsCreatedPage() {
  console.log('Rendering EventsCreatedPage')
  const { tournamentId } = Route.useParams()
  return <CreateEvents tournamentId={tournamentId} />
}