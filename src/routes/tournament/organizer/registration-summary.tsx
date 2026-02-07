import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/tournament/organizer/registration-summary',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/tournament/organizer/registration-summary"!</div>
}
