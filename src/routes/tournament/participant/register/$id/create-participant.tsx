import { createFileRoute } from '@tanstack/react-router'
import { CreateParticipant } from '@/components/Participant/CreateParticipant';

export const Route = createFileRoute(
  '/tournament/participant/register/$id/create-participant',
)({
  params: {
    parse: (params) => ({
      id: Number(params.id),
    }),
    stringify: (params) => ({
      id: String(params.id),
    }),
  },
  
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams();
  return (
    // <div>here is the create participant page</div>
    <CreateParticipant tournamentId={id}/>
  )
}
