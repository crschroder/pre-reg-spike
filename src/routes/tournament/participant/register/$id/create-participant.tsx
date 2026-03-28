import { createFileRoute } from '@tanstack/react-router'
import { CreateParticipant } from '@/components/Participant/CreateParticipant';

type SearchParams = {
  mode?: "organizer";
};

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
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    mode: search.mode === "organizer" ? "organizer" : undefined,
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams();
  const { mode } = Route.useSearch();
  return (
    <CreateParticipant tournamentId={id} mode={mode}/>
  )
}
