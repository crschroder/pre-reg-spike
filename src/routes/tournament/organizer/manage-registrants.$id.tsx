import { ParticipantSummary } from '@/components/Organizer/ParticipantSummmary';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/tournament/organizer/manage-registrants/$id',
)({
  
  component: RouteComponent,
})

function RouteComponent() {
 const { id } = Route.useParams();
   return <ParticipantSummary tournamentId={Number(id)} />;
}
