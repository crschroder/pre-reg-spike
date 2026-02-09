import { ManageDivisions } from '@/components/Organizer/ManageDivisions';
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
  return <ManageDivisions tournamentId={id} />;
}
