import { OrganizerDashboard } from '@/components/Organizer/Dashboard'
import { createFileRoute } from '@tanstack/react-router'
import { RequireAllowedEmail } from '@/auth/RequireAllowedEmail'

export const Route = createFileRoute('/tournament/organizer/')({
  component: RequireAllowedEmail(RouteComponent, ['organizer', 'admin']),
})

function RouteComponent() {
  return <OrganizerDashboard />
}
