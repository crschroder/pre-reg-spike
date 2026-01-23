import CreateEvents from '@/components/Create/CreateEvents';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/tournament/organizer/events/$tournamentId')({
  params: {
    parse: (params) => ({
      tournamentId: Number(params.tournamentId),
    }),
    stringify: (params) => ({
      tournamentId: String(params.tournamentId),
    }),
  },
  component: EventsCreatedPage,
})

function EventsCreatedPage() {
  console.log("Rendering EventsCreatedPage");
  const { tournamentId } = Route.useParams();
  return <CreateEvents tournamentId={tournamentId} />;  
}