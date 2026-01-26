import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/tournament/participant/register/$id/submit-entry',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Review and and submit your registration </div>
}
