import { createFileRoute } from '@tanstack/react-router'

import { DivisionDrawDouble } from '@/components/Organizer/DivisionDrawDouble';
export const Route = createFileRoute('/organizer/divisions-double')({
  component: DivisionDrawDouble,
})
