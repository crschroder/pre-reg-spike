import { createFileRoute } from '@tanstack/react-router'
import { CreateParticipant } from '@/components/Participant/CreateParticipant';


export const Route = createFileRoute(
  '/tournament/participant/register/$id/update-participant-dayof/$participantId',
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
  staticData: {
    publicMode: true,
  }
})

function RouteComponent() {
  const { id, participantId } = Route.useParams();
   
 
   return (
     <CreateParticipant tournamentId={id} participantId={participantId} mode="participant"/>
   )
}
