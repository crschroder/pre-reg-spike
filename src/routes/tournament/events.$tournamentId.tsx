import CreateEvents from '@/components/Create/CreateEvents';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/tournament/events/$tournamentId')({
  component: EventsCreatedPage,
})

function EventsCreatedPage() {
  console.log("Rendering EventsCreatedPage");
  const { tournamentId } = Route.useParams();
  return <CreateEvents tournamentId={tournamentId} />;  
}