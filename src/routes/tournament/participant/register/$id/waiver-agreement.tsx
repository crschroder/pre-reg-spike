import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/tournament/participant/register/$id/waiver-agreement',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>Agree to the terms of the waiver agreement</div>
  )
}
