import { OrganizerDashboard } from '@/components/Organizer/DashBoard';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/tournament/organizer/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <OrganizerDashboard />;}
