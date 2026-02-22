import { CreateParticipant } from '@/components/Participant/CreateParticipant';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/tournament/participant/register/$id/update-participant/$participantId',
)({
  params: {
    parse: (params: { id: string; participantId: string }) => ({
      id: Number(params.id),
      participantId: Number(params.participantId),
    }),
    stringify: (params: { id: number; participantId: number }) => ({
      id: String(params.id),
      participantId: String(params.participantId),
    }),
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { id, participantId } = Route.useParams();

  return (
    <CreateParticipant tournamentId={id} participantId={participantId}/>
  )
}
