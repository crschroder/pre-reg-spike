import { ManageParticipants } from '@/components/Organizer/ManageParticipants';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/tournament/organizer/manage-divisions/$id',
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
  return <ManageParticipants tournamentId={id} />;
}
