import { Dashboard } from '@/components/Participant/Dashboard';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/tournament/participant/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Dashboard />;
}
