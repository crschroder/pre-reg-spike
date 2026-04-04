import { CreateParticipant } from '@/components/Participant/CreateParticipant';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/tournament/participant/register/$id/create-participant-dayof',
)({
  component: RouteComponent,
   params: {
    parse: (params) => ({
      id: Number(params.id),
    }),
    stringify: (params) => ({
      id: String(params.id),
    }),
  },
  staticData: {
    publicMode: true,
  }
})

function RouteComponent() {
    const { id } = Route.useParams();
     
  return (
    <CreateParticipant tournamentId={id} mode="participant"/>
  )
}
