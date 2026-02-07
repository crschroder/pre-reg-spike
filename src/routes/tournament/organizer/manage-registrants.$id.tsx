import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/tournament/organizer/manage-registrants/$id',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/tournament/organizer/manage-registrants/$id"!</div>
}
