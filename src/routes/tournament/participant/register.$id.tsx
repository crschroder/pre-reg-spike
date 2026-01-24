
import { RegisterTournament } from '@/components/Participant/Register';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/tournament/participant/register/$id')({
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
   return <RegisterTournament tournamentId={id} />;  
}
