import { createFileRoute } from '@tanstack/react-router'
import { RequireAllowedEmail } from '@/auth/RequireAllowedEmail'

export const Route = createFileRoute(
  '/tournament/organizer/registration-summary',
)({
  component: RequireAllowedEmail(RouteComponent),
})

function RouteComponent() {
  return <div>Hello "/tournament/organizer/registration-summary"!</div>
}
