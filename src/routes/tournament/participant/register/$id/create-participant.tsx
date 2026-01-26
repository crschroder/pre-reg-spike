import { createFileRoute } from '@tanstack/react-router'
import { CreateParticipant } from '@/components/Participant/CreateParticipant';

export const Route = createFileRoute(
  '/tournament/participant/register/$id/create-participant',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    // <div>here is the create participant page</div>
    <CreateParticipant tournamentId={4}/>
  )
}
