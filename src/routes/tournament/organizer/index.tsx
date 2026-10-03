import { OrganizerDashboard } from '@/components/Organizer/Dashboard'
import { createFileRoute } from '@tanstack/react-router'
import { RequireAllowedEmail } from '@/auth/RequireAllowedEmail'

export const Route = createFileRoute('/tournament/organizer/')({
  component: RequireAllowedEmail(RouteComponent),
})

function RouteComponent() {
  return <OrganizerDashboard />
}
