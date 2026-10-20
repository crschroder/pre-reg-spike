import { RequireAllowedEmail } from '@/auth/RequireAllowedEmail'
import { VolunteerDashboard } from '@/components/Volunteer/dashboard'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/tournament/volunteer/')({
  component: RequireAllowedEmail(RouteComponent, ['organizer', 'administrator', 'volunteer']),
})

function RouteComponent() {
  return <VolunteerDashboard />
}
